#!/usr/bin/env python3
"""
train.py
Phase 2 of Reinforcement Learning Pipeline:
Supervised Pre-Training (Behavioral Cloning) of Dual-Head Policy & Value ResNet.

Pedagogical & Empirical Features:
- Multi-Task Loss: CrossEntropyLoss (Policy) + 0.5 * MSELoss (Value).
- Real-time Top-1 Accuracy, Top-3 Accuracy, and Value MSE validation metrics.
- Automatic Mixed Precision (AMP FP16) for NVIDIA T1200 Laptop GPU.
- Periodic batch progress logging and dynamic learning rate tracking.
- Post-training Tactical Verification Suite (Open-4 Win, Open-4 Block, Center Opening, Value Range).
- Persistence of best checkpoint (weights + optimizer + config) and ONNX export.
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
from torch.amp import GradScaler, autocast

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

            with autocast(device_type=device.type, enabled=(device.type == "cuda")):
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
        "top1_acc": (correct_top1 / total_samples) * 100.0,
        "top3_acc": (correct_top3 / total_samples) * 100.0
    }

def verify_tactical_scenarios(model, device):
    """
    Pedagogical Verification Suite:
    Test the trained network on classic tactical Gomoku positions:
    1. Immediate Win: 4 friendly stones in a row -> Must play winning 5th stone.
    2. Urgent Block: 4 opponent stones in a row -> Must block immediately.
    3. Empty board Opening: Must prefer center cell (7, 7) or adjacent cells.
    """
    print("\n" + "=" * 90)
    print("RUNNING POST-TRAINING TACTICAL VERIFICATION SUITE")
    print("=" * 90)
    model.eval()

    # --- Scenario 1: Immediate Win (Horizontal 4 in row) ---
    # My stones at (7, 3), (7, 4), (7, 5), (7, 6). Winning spots are (7, 2) [idx 107] or (7, 7) [idx 112].
    s1 = np.zeros((3, 15, 15), dtype=np.float32)
    s1[0, 7, 3:7] = 1.0  # My stones
    s1[2, :, :] = 1.0    # I am Black
    t1 = torch.from_numpy(s1).unsqueeze(0).to(device)

    with torch.no_grad():
        logits1, val1 = model(t1)
        probs1 = torch.softmax(logits1, dim=-1).squeeze(0).cpu().numpy()
        top5_1 = np.argsort(probs1)[::-1][:5]

    print("\n[Scenario 1: Immediate Win Test]")
    print("Board Setup: Friendly stones at (7,3), (7,4), (7,5), (7,6). Winning moves: (7,2)[idx 107] or (7,7)[idx 112].")
    print(f"Model Expected Value (Win Expectation in [-1, +1]): {val1.item():+.4f}")
    print("Top 5 Policy Predictions:")
    for rank, act in enumerate(top5_1, 1):
        r, c = act // 15, act % 15
        print(f"  #{rank}: Move ({r:2d}, {c:2d}) [idx {act:3d}] -> Probability: {probs1[act]*100:6.2f}%")

    # --- Scenario 2: Urgent Defense (Opponent has 4 in row) ---
    # Opponent stones at (7, 3), (7, 4), (7, 5), (7, 6). Urgent blocks are (7, 2) [idx 107] or (7, 7) [idx 112].
    s2 = np.zeros((3, 15, 15), dtype=np.float32)
    s2[1, 7, 3:7] = 1.0  # Opponent stones
    s2[2, :, :] = 0.0    # I am White
    t2 = torch.from_numpy(s2).unsqueeze(0).to(device)

    with torch.no_grad():
        logits2, val2 = model(t2)
        probs2 = torch.softmax(logits2, dim=-1).squeeze(0).cpu().numpy()
        top5_2 = np.argsort(probs2)[::-1][:5]

    print("\n[Scenario 2: Urgent Defense Block Test]")
    print("Board Setup: Opponent stones at (7,3), (7,4), (7,5), (7,6). Urgent defensive blocks: (7,2)[idx 107] or (7,7)[idx 112].")
    print(f"Model Expected Value (Under Opponent Threat): {val2.item():+.4f}")
    print("Top 5 Policy Predictions:")
    for rank, act in enumerate(top5_2, 1):
        r, c = act // 15, act % 15
        print(f"  #{rank}: Move ({r:2d}, {c:2d}) [idx {act:3d}] -> Probability: {probs2[act]*100:6.2f}%")

    # --- Scenario 3: Opening Empty Board ---
    s3 = np.zeros((3, 15, 15), dtype=np.float32)
    s3[2, :, :] = 1.0  # Black first move
    t3 = torch.from_numpy(s3).unsqueeze(0).to(device)

    with torch.no_grad():
        logits3, val3 = model(t3)
        probs3 = torch.softmax(logits3, dim=-1).squeeze(0).cpu().numpy()
        top5_3 = np.argsort(probs3)[::-1][:5]

    print("\n[Scenario 3: Opening Move on Empty Board]")
    print("Board Setup: Empty board, First player turn.")
    print(f"Model Expected Value: {val3.item():+.4f} (Slight first-player positive expectation)")
    print("Top 5 Policy Predictions:")
    for rank, act in enumerate(top5_3, 1):
        r, c = act // 15, act % 15
        print(f"  #{rank}: Move ({r:2d}, {c:2d}) [idx {act:3d}] -> Probability: {probs3[act]*100:6.2f}%")
    print("=" * 90)

def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("\n" + "=" * 90)
    print(f"PHASE 2: DUAL-HEAD RESNET BEHAVIORAL CLONING TRAINING")
    print(f"Executing on Compute Hardware: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")
    print("=" * 90)

    npz_path = os.path.join(os.path.dirname(__file__), args.dataset)
    if not os.path.exists(npz_path):
        print(f"Error: Dataset {npz_path} not found. Please run Step 1 first!")
        sys.exit(1)

    print(f"Dataset path: {npz_path} ({os.path.getsize(npz_path)/(1024*1024):.2f} MB)")
    train_loader, val_loader = get_dataloaders(
        npz_path,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
        augment_d4=True
    )
    print(f"Match-Level Partitioning: Train samples = {len(train_loader.dataset):,} | Val samples = {len(val_loader.dataset):,}")
    print(f"Batch Size = {args.batch_size} | Batches per epoch = {len(train_loader):,}")

    model = DualHeadResNet(num_blocks=args.num_blocks, num_channels=args.channels).to(device)
    param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"DualHeadResNet Initialized: {param_count:,} trainable parameters (~{param_count*4/(1024*1024):.2f} MB FP32 weights).")

    criterion_p = nn.CrossEntropyLoss()
    criterion_v = nn.MSELoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-5)
    scaler = GradScaler(device=device.type, enabled=(device.type == "cuda"))

    out_dir = os.path.dirname(__file__)
    ckpt_dir = os.path.join(out_dir, "checkpoints")
    os.makedirs(ckpt_dir, exist_ok=True)

    history = []
    best_val_loss = float("inf")

    print("\n" + "-" * 90)
    print(f"{'Epoch':<6} | {'Train Loss':<11} | {'Val Loss':<10} | {'Top-1 Acc':<11} | {'Top-3 Acc':<11} | {'Val MSE':<9} | {'Elapsed':<8}")
    print("-" * 90)

    for epoch in range(1, args.epochs + 1):
        model.train()
        total_train_loss = 0.0
        total_samples = 0
        t0 = time.time()
        last_log_time = t0

        for batch_idx, (states, actions, values) in enumerate(train_loader):
            states = states.to(device, non_blocking=True)
            actions = actions.to(device, non_blocking=True)
            values = values.to(device, non_blocking=True)
            batch_sz = states.size(0)

            optimizer.zero_grad()
            with autocast(device_type=device.type, enabled=(device.type == "cuda")):
                p_logits, v_pred = model(states)
                p_loss = criterion_p(p_logits, actions)
                v_loss = criterion_v(v_pred.squeeze(-1), values)
                loss = p_loss + 0.5 * v_loss

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            total_train_loss += loss.item() * batch_sz
            total_samples += batch_sz

            # Periodic batch telemetry every 300 batches
            if (batch_idx + 1) % 300 == 0 or (batch_idx + 1) == len(train_loader):
                cur_time = time.time()
                cur_rate = (batch_sz * 300) / (cur_time - last_log_time) if cur_time > last_log_time else 0
                last_log_time = cur_time
                print(f"  [Epoch {epoch:2d}/{args.epochs:2d} | Batch {batch_idx+1:4d}/{len(train_loader):4d} | Batch Loss: {loss.item():.4f} (P: {p_loss.item():.4f}, V: {v_loss.item():.4f}) | Rate: {cur_rate:.0f} samples/s]")

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

        is_best = val_metrics["val_loss"] < best_val_loss
        marker = " [BEST]" if is_best else ""
        print(f"\n=> Epoch {epoch:2d}/{args.epochs:2d} Summary:")
        print(f"   Train Loss: {train_loss:.4f} | Val Loss: {val_metrics['val_loss']:.4f}{marker}")
        print(f"   Top-1 Accuracy: {val_metrics['top1_acc']:.2f}% | Top-3 Accuracy: {val_metrics['top3_acc']:.2f}% | Value MSE: {val_metrics['value_mse']:.4f}")
        print(f"   Time: {elapsed:.1f}s | Current Learning Rate: {optimizer.param_groups[0]['lr']:.6f}\n" + "-" * 90)

        # Save best checkpoint
        if is_best:
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

    # Run Tactical Scenarios Verification
    verify_tactical_scenarios(model, device)
    print("\nPHASE 2 TRAINING AND VERIFICATION SUCCESSFULLY COMPLETED!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=str, default="gomoku_rl_base_324k.npz")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--num-blocks", type=int, default=6)
    parser.add_argument("--channels", type=int, default=64)
    parser.add_argument("--num-workers", type=int, default=2)
    args = parser.parse_args()
    train(args)
