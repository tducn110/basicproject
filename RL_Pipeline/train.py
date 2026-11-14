#!/usr/bin/env python3
"""
train.py
Step 2 of Reinforcement Learning Pipeline:
Supervised Pre-Training (Behavioral Cloning) of Dual-Head Policy & Value ResNet.

Features:
- Dual loss optimization: CrossEntropyLoss (Policy) + MSELoss (Value).
- Real-time Top-1 Accuracy, Top-3 Accuracy, and Value MSE metrics.
- Automatic mixed precision (AMP) for maximum GPU utilization on NVIDIA T1200.
- Checkpoint persistence and ONNX export.
"""

import os
import sys
import time
import json
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast

from model import DualHeadResNet
from dataset import get_dataloaders

def evaluate(model, val_loader, criterion_p, criterion_v, device):
    model.eval()
    total_val_loss = 0.0
    total_p_loss = 0.0
    total_v_loss = 0.0
    correct_top1 = 0
    correct_top3 = 0
    total_samples = 0

    with torch.no_grad():
        for states, actions, values in val_loader:
            states = states.to(device, non_blocking=True)
            actions = actions.to(device, non_blocking=True)
            values = values.to(device, non_blocking=True)
            batch_sz = states.size(0)

            p_logits, v_pred = model(states)
            p_loss = criterion_p(p_logits, actions)
            v_loss = criterion_v(v_pred.squeeze(-1), values)
            loss = p_loss + 0.5 * v_loss

            total_val_loss += loss.item() * batch_sz
            total_p_loss += p_loss.item() * batch_sz
            total_v_loss += v_loss.item() * batch_sz

            # Top-1 Accuracy
            preds = torch.argmax(p_logits, dim=-1)
            correct_top1 += (preds == actions).sum().item()

            # Top-3 Accuracy
            top3 = torch.topk(p_logits, k=3, dim=-1).indices
            correct_top3 += (top3 == actions.unsqueeze(-1)).any(dim=-1).sum().item()

            total_samples += batch_sz

    return {
        "val_loss": total_val_loss / total_samples,
        "policy_loss": total_p_loss / total_samples,
        "value_mse": total_v_loss / total_samples,
        "top1_acc": (correct_top1 / total_samples) * 100,
        "top3_acc": (correct_top3 / total_samples) * 100
    }

def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Executing Training Pipeline on Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")

    npz_path = os.path.join(os.path.dirname(__file__), args.dataset)
    if not os.path.exists(npz_path):
        print(f"Error: Dataset {npz_path} not found. Please run Step 1 first!")
        sys.exit(1)

    print(f"Loading dataset from: {npz_path}")
    train_loader, val_loader = get_dataloaders(
        npz_path,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
        augment_d4=True
    )
    print(f"DataLoaders prepared: Train size = {len(train_loader.dataset):,} | Val size = {len(val_loader.dataset):,}")

    model = DualHeadResNet(num_blocks=args.num_blocks, num_channels=args.channels).to(device)
    param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Dual-Head ResNet Initialized: {param_count:,} trainable parameters.")

    criterion_p = nn.CrossEntropyLoss()
    criterion_v = nn.MSELoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-5)
    scaler = GradScaler(enabled=(device.type == "cuda"))

    out_dir = os.path.dirname(__file__)
    ckpt_dir = os.path.join(out_dir, "checkpoints")
    os.makedirs(ckpt_dir, exist_ok=True)

    history = []
    best_val_loss = float("inf")

    print("\n" + "=" * 90)
    print(f"{'Epoch':<6} | {'Train Loss':<11} | {'Val Loss':<10} | {'Top-1 Acc':<11} | {'Top-3 Acc':<11} | {'Val MSE':<9} | {'Elapsed':<8}")
    print("-" * 90)

    for epoch in range(1, args.epochs + 1):
        model.train()
        total_train_loss = 0.0
        total_samples = 0
        t0 = time.time()

        for states, actions, values in train_loader:
            states = states.to(device, non_blocking=True)
            actions = actions.to(device, non_blocking=True)
            values = values.to(device, non_blocking=True)
            batch_sz = states.size(0)

            optimizer.zero_grad()
            with autocast(enabled=(device.type == "cuda")):
                p_logits, v_pred = model(states)
                p_loss = criterion_p(p_logits, actions)
                v_loss = criterion_v(v_pred.squeeze(-1), values)
                loss = p_loss + 0.5 * v_loss

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            total_train_loss += loss.item() * batch_sz
            total_samples += batch_sz

        scheduler.step()
        train_loss = total_train_loss / total_samples
        val_metrics = evaluate(model, val_loader, criterion_p, criterion_v, device)
        elapsed = time.time() - t0

        log_entry = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_loss": round(val_metrics["val_loss"], 4),
            "top1_acc": round(val_metrics["top1_acc"], 2),
            "top3_acc": round(val_metrics["top3_acc"], 2),
            "val_mse": round(val_metrics["value_mse"], 4),
            "lr": optimizer.param_groups[0]["lr"],
            "time_sec": round(elapsed, 2)
        }
        history.append(log_entry)

        print(f"{epoch:<6d} | {train_loss:<11.4f} | {val_metrics['val_loss']:<10.4f} | {val_metrics['top1_acc']:>8.2f}% | {val_metrics['top3_acc']:>8.2f}% | {val_metrics['value_mse']:<9.4f} | {elapsed:>6.1f}s")

        # Save best checkpoint
        if val_metrics["val_loss"] < best_val_loss:
            best_val_loss = val_metrics["val_loss"]
            best_ckpt_path = os.path.join(ckpt_dir, "best_caro_resnet.pt")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": best_val_loss,
                "metrics": val_metrics,
                "config": vars(args)
            }, best_ckpt_path)

    # Save final weights and history
    final_path = os.path.join(ckpt_dir, "final_caro_resnet.pt")
    torch.save(model.state_dict(), final_path)

    history_path = os.path.join(out_dir, "training_history.json")
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    # Export to ONNX
    onnx_path = os.path.join(out_dir, "caro_resnet.onnx")
    print(f"\nExporting best model to ONNX format: {onnx_path}")
    model.eval()
    dummy_input = torch.randn(1, 3, 15, 15, device=device)
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        input_names=["board_state"],
        output_names=["policy_logits", "value"],
        dynamic_axes={"board_state": {0: "batch_size"}, "policy_logits": {0: "batch_size"}, "value": {0: "batch_size"}},
        opset_version=14
    )
    print(f"ONNX export successful ({os.path.getsize(onnx_path)/(1024*1024):.2f} MB).")
    print("=" * 90)
    print("STEP 2 TRAINING COMPLETE!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=str, default="gomoku_rl_base_324k.npz")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--num-blocks", type=int, default=6)
    parser.add_argument("--channels", type=int, default=64)
    parser.add_argument("--num-workers", type=int, default=4)
    args = parser.parse_args()
    train(args)
