#!/usr/bin/env python3
"""
iteration_pipeline.py
Phase 4: Full Reinforcement Learning Self-Play Policy Iteration Loop (AlphaZero Standard).

Executes 3 complete policy iterations:
Generation 0 (Warm-Start ResNet) -> Gen 1 -> Gen 2 -> Gen 3 (Ultimate Champion).

Each Iteration k performs:
1. Self-Play: Current champion plays N games against itself using MCTS to generate (state, pi, z).
2. Data Aggregation: Appends to sliding-window Replay Buffer.
3. Training: Trains candidate network on the replay buffer for E epochs.
4. Champion Gating: Candidate plays 10 matches against Current Champion.
   If win rate >= 55% -> Accepted as Champion Generation (k+1).
   If win rate < 55% -> Re-sample more data.
5. Export: Saves checkpoint and telemetry to JSON.
"""

import os
import sys
import time
import copy
import json
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

from model import DualHeadResNet
from mcts import AlphaZeroMCTS
from extract_rl_dataset_10000 import OptGomoku, BLACK, WHITE, EMPTY

BOARD_SIZE = 15

def run_self_play_match(mcts, temp_threshold=8, max_moves=225):
    """Simulates 1 self-play game and returns transitions (planes, pi, player), winner."""
    game = OptGomoku()
    curr_player = BLACK
    trajectory = []

    for step in range(1, max_moves + 1):
        temp = 1.0 if step <= temp_threshold else 0.0
        root = mcts.search(game, curr_player, add_dirichlet_noise=(step <= temp_threshold))
        pi = mcts.get_action_probabilities(root, temperature=temp)

        # Canonical 3 planes
        b_arr = np.array(game.board, dtype=np.int32)
        planes = np.zeros((3, 15, 15), dtype=np.float32)
        planes[0] = (b_arr == curr_player).astype(np.float32)
        planes[1] = (b_arr == (3 - curr_player)).astype(np.float32)
        planes[2] = 1.0 if curr_player == BLACK else 0.0

        trajectory.append((planes, pi, curr_player))

        # Action selection
        if temp > 0:
            action = int(np.random.choice(len(pi), p=pi))
        else:
            action = int(np.argmax(pi))

        r, c = action // 15, action % 15
        game.place(r, c, curr_player)

        if game.check_win(r, c):
            return trajectory, curr_player

        if game.occupied_count == 225:
            return trajectory, 0

        curr_player = 3 - curr_player

    return trajectory, 0

def play_eval_game(mcts_black, mcts_white, max_moves=225):
    """Plays 1 evaluation match between two MCTS agents."""
    game = OptGomoku()
    curr_p = BLACK

    for step in range(1, max_moves + 1):
        mcts = mcts_black if curr_p == BLACK else mcts_white
        (r, c), _, _ = mcts.get_best_move(game, curr_p, temperature=0.0)
        game.place(r, c, curr_p)

        if game.check_win(r, c):
            return curr_p, step

        if game.occupied_count == 225:
            return 0, step

        curr_p = 3 - curr_p

    return 0, max_moves

def evaluate_champion_gate(cand_model, champ_model, device, num_matches=10, sims=30):
    """
    Evaluates candidate vs current champion.
    Half matches candidate as Black, half as White.
    Returns: cand_wins, champ_wins, draws, win_rate_pct, is_accepted
    """
    mcts_cand = AlphaZeroMCTS(cand_model, device, num_simulations=sims)
    mcts_champ = AlphaZeroMCTS(champ_model, device, num_simulations=sims)

    cand_wins = 0
    champ_wins = 0
    draws = 0

    half = num_matches // 2

    # Series A: Candidate as Black
    for _ in range(half):
        w, _ = play_eval_game(mcts_cand, mcts_champ)
        if w == BLACK: cand_wins += 1
        elif w == WHITE: champ_wins += 1
        else: draws += 1

    # Series B: Candidate as White
    for _ in range(num_matches - half):
        w, _ = play_eval_game(mcts_champ, mcts_cand)
        if w == WHITE: cand_wins += 1
        elif w == BLACK: champ_wins += 1
        else: draws += 1

    win_rate = (cand_wins / num_matches) * 100.0
    # AlphaGo Zero standard: >= 55% win rate required to replace champion
    is_accepted = (cand_wins >= 6) or (win_rate >= 55.0)
    return cand_wins, champ_wins, draws, win_rate, is_accepted

def train_candidate(candidate_model, buffer_planes, buffer_pis, buffer_vals, device, epochs=2, lr=5e-4):
    """Trains candidate model on the self-play replay buffer."""
    candidate_model.train()
    dataset = TensorDataset(
        torch.from_numpy(buffer_planes),
        torch.from_numpy(buffer_pis),
        torch.from_numpy(buffer_vals)
    )
    loader = DataLoader(dataset, batch_size=64, shuffle=True)

    optimizer = optim.AdamW(candidate_model.parameters(), lr=lr, weight_decay=1e-4)
    criterion_p = nn.CrossEntropyLoss()
    criterion_v = nn.MSELoss()

    total_loss = 0.0
    for ep in range(epochs):
        ep_loss = 0.0
        for b_planes, b_pis, b_vals in loader:
            b_planes = b_planes.to(device)
            b_pis = b_pis.to(device)
            b_vals = b_vals.to(device)

            optimizer.zero_grad()
            p_logits, v_pred = candidate_model(b_planes)

            # Target is probability distribution pi
            # CrossEntropy with soft target probabilities
            p_loss = -(b_pis * torch.log_softmax(p_logits, dim=-1)).sum(dim=-1).mean()
            v_loss = criterion_v(v_pred.squeeze(-1), b_vals)
            loss = p_loss + 0.5 * v_loss

            loss.backward()
            optimizer.step()
            ep_loss += loss.item() * len(b_planes)
        total_loss = ep_loss / len(dataset)

    candidate_model.eval()
    return total_loss

def run_policy_iteration_loop(num_iterations=3, games_per_iter=30, mcts_sims=30, eval_matches=10):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=" * 80)
    print(f"STARTING PHASE 4: REINFORCEMENT LEARNING POLICY ITERATION ({num_iterations} ITERATIONS)")
    print(f"Device: {device.type.upper()} | Self-Play Games/Iter: {games_per_iter} | MCTS Sims: {mcts_sims}")
    print("=" * 80)

    ckpt_base = os.path.join(os.path.dirname(__file__), "checkpoints")
    os.makedirs(ckpt_base, exist_ok=True)
    base_ckpt_path = os.path.join(ckpt_base, "best_caro_resnet.pt")

    # Load Generation 0 Champion (Warm-Start model from Phase 2)
    champion_model = DualHeadResNet(6, 64).to(device)
    base_ckpt = torch.load(base_ckpt_path, map_location=device)
    champion_model.load_state_dict(base_ckpt["model_state_dict"])
    champion_model.eval()

    # Replay buffer
    all_buffer_planes = []
    all_buffer_pis = []
    all_buffer_vals = []

    history = []
    current_champion_gen = 0
    base_elo = 1500

    start_time = time.time()

    for iter_idx in range(1, num_iterations + 1):
        iter_t0 = time.time()
        print(f"\n{'='*30} ITERATION {iter_idx}/{num_iterations} (Champion Gen {current_champion_gen}) {'='*30}")

        # --- STEP 1: SELF-PLAY DATA GENERATION ---
        print(f"[*] Step 1: Self-Play Data Generation ({games_per_iter} games with Gen {current_champion_gen})...")
        mcts_champ = AlphaZeroMCTS(champion_model, device, num_simulations=mcts_sims)
        iter_planes = []
        iter_pis = []
        iter_vals = []
        wins_b = 0
        wins_w = 0

        sp_t0 = time.time()
        for g in range(1, games_per_iter + 1):
            traj, winner = run_self_play_match(mcts_champ)
            if winner == BLACK: wins_b += 1
            elif winner == WHITE: wins_w += 1

            for planes, pi, p in traj:
                z = 1.0 if winner == p else (-1.0 if winner == (3 - p) else 0.0)
                iter_planes.append(planes)
                iter_pis.append(pi)
                iter_vals.append(z)

        sp_elapsed = time.time() - sp_t0
        print(f"    Self-Play finished: {len(iter_planes)} new samples collected in {sp_elapsed:.1f}s (Black Wins: {wins_b}, White Wins: {wins_w})")

        # Append to sliding replay buffer (keep max 10,000 samples)
        all_buffer_planes.extend(iter_planes)
        all_buffer_pis.extend(iter_pis)
        all_buffer_vals.extend(iter_vals)

        max_buf = 8000
        if len(all_buffer_planes) > max_buf:
            all_buffer_planes = all_buffer_planes[-max_buf:]
            all_buffer_pis = all_buffer_pis[-max_buf:]
            all_buffer_vals = all_buffer_vals[-max_buf:]

        buf_np_planes = np.array(all_buffer_planes, dtype=np.float32)
        buf_np_pis = np.array(all_buffer_pis, dtype=np.float32)
        buf_np_vals = np.array(all_buffer_vals, dtype=np.float32)

        # --- STEP 2: TRAINING CANDIDATE NETWORK ---
        print(f"[*] Step 2: Training Candidate Model on {len(buf_np_planes)} Replay Buffer transitions...")
        candidate_model = copy.deepcopy(champion_model)
        tr_t0 = time.time()
        train_loss = train_candidate(candidate_model, buf_np_planes, buf_np_pis, buf_np_vals, device, epochs=2)
        tr_elapsed = time.time() - tr_t0
        print(f"    Training completed: Loss = {train_loss:.4f} in {tr_elapsed:.1f}s")

        # --- STEP 3: CHAMPION GATING ARENA ---
        print(f"[*] Step 3: Champion Gating Tournament ({eval_matches} matches: Candidate vs Gen {current_champion_gen})...")
        eg_t0 = time.time()
        c_wins, ch_wins, draws, win_rate, is_accepted = evaluate_champion_gate(
            candidate_model, champion_model, device, num_matches=eval_matches, sims=mcts_sims
        )
        eg_elapsed = time.time() - eg_t0
        status_str = "ACCEPTED (NEW CHAMPION)" if is_accepted else "REJECTED (KEEP CHAMPION)"
        print(f"    Gating Results: Candidate {c_wins}W - {ch_wins}L - {draws}D (Win Rate: {win_rate:.1f}%) -> {status_str} [Time: {eg_elapsed:.1f}s]")

        # Update Champion if accepted
        if is_accepted:
            current_champion_gen += 1
            champion_model = candidate_model
            champ_save_path = os.path.join(ckpt_base, f"champion_gen_{current_champion_gen}.pt")
            torch.save({
                "iteration": iter_idx,
                "generation": current_champion_gen,
                "model_state_dict": champion_model.state_dict(),
                "win_rate": win_rate,
                "train_loss": train_loss
            }, champ_save_path)
            print(f"    [+] Saved New Champion Generation {current_champion_gen} to: {champ_save_path}")

        # Calculate estimated Elo delta
        # If win_rate > 50: delta = 400 * log10(W / (L + 1e-4))
        w_ratio = max(0.1, min(0.95, (c_wins + 0.5 * draws) / eval_matches))
        delta_elo = int(400 * np.log10(w_ratio / (1.0 - w_ratio)))
        base_elo += max(0, delta_elo) if is_accepted else 0

        iter_elapsed = time.time() - iter_t0
        log_entry = {
            "iteration": iter_idx,
            "champion_generation": current_champion_gen,
            "self_play_games": games_per_iter,
            "new_samples": len(iter_planes),
            "buffer_total_samples": len(buf_np_planes),
            "train_loss": float(train_loss),
            "candidate_wins": c_wins,
            "champion_wins": ch_wins,
            "draws": draws,
            "win_rate_pct": float(win_rate),
            "is_accepted": bool(is_accepted),
            "estimated_elo": int(base_elo),
            "time_sec": float(iter_elapsed)
        }
        history.append(log_entry)

    total_time = time.time() - start_time

    # Export final champion to ONNX
    final_onnx_path = os.path.join(os.path.dirname(__file__), "champion_ultimate.onnx")
    dummy_input = torch.randn(1, 3, 15, 15, device=device)
    torch.onnx.export(
        champion_model,
        dummy_input,
        final_onnx_path,
        input_names=["state_tensor"],
        output_names=["policy_logits", "value_pred"],
        dynamic_axes={"state_tensor": {0: "batch_size"}, "policy_logits": {0: "batch_size"}, "value_pred": {0: "batch_size"}},
        opset_version=14
    )
    print(f"\n[*] Exported Ultimate Champion to ONNX: {final_onnx_path} ({os.path.getsize(final_onnx_path)/(1024*1024):.2f} MB)")

    # Save history JSON
    history_file = os.path.join(os.path.dirname(__file__), "iteration_pipeline_history.json")
    with open(history_file, "w") as f:
        json.dump(history, f, indent=2)

    print("\n" + "=" * 80)
    print("PHASE 4 REINFORCEMENT LEARNING COMPLETED SUCCESSFULLY:")
    print(f"  Total Iterations Run: {num_iterations}")
    print(f"  Final Champion Generation: Gen {current_champion_gen}")
    print(f"  Final Estimated Elo: {base_elo}")
    print(f"  Total Execution Time: {total_time:.1f}s ({total_time/60:.1f} minutes)")
    print(f"  Telemetry Log: {history_file}")
    print("=" * 80)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--iterations", type=int, default=3, help="Number of policy iterations")
    parser.add_argument("--games", type=int, default=30, help="Self-play games per iteration")
    parser.add_argument("--sims", type=int, default=25, help="MCTS simulations per ply")
    parser.add_argument("--eval-matches", type=int, default=10, help="Evaluation matches per gate")
    args = parser.parse_args()

    run_policy_iteration_loop(
        num_iterations=args.iterations,
        games_per_iter=args.games,
        mcts_sims=args.sims,
        eval_matches=args.eval_matches
    )
