#!/usr/bin/env python3
"""
self_play.py
Phase 3 Self-Play Engine:
Generates high-purity training data via AlphaZero Monte Carlo Tree Search Self-Play.

In each game:
- Both sides are guided by AlphaZeroMCTS.
- Temperature tau = 1.0 for the first 10 plies (for broad opening exploration).
- Temperature tau -> 0.0 (greedy) for subsequent plies.
- Dirichlet noise is injected at the root to break symmetry.
- At the end of the game, terminal outcome z in {+1, -1, 0} is assigned to each transition.
"""

import os
import sys
import time
import argparse
import numpy as np
import torch

from model import DualHeadResNet
from mcts import AlphaZeroMCTS
from extract_rl_dataset_10000 import OptGomoku, BLACK, WHITE, EMPTY

BOARD_SIZE = 15

def run_self_play_game(mcts, temp_threshold=10, max_moves=225):
    """
    Simulates 1 game of MCTS self-play.
    Returns: list of (canonical_planes, mcts_pi, player), terminal_winner
    """
    game = OptGomoku()
    curr_player = BLACK
    trajectory = []

    for step in range(1, max_moves + 1):
        temp = 1.0 if step <= temp_threshold else 0.0
        root = mcts.search(game, curr_player, add_dirichlet_noise=(step <= temp_threshold))
        pi = mcts.get_action_probabilities(root, temperature=temp)

        # Store state before making move
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

        # Check win
        if game.check_win(r, c):
            return trajectory, curr_player

        if game.occupied_count == 225:
            return trajectory, 0

        curr_player = 3 - curr_player

    return trajectory, 0

def generate_self_play_dataset(num_games=10, num_sims=40, out_path="RL_Pipeline/self_play_dataset.npz"):
    ckpt_path = os.path.join(os.path.dirname(__file__), "checkpoints", "best_caro_resnet.pt")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Initializing Self-Play Engine on {device.type.upper()}...")
    checkpoint = torch.load(ckpt_path, map_location=device)
    model = DualHeadResNet(6, 64).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    mcts = AlphaZeroMCTS(model, device, num_simulations=num_sims)

    all_planes = []
    all_pis = []
    all_values = []

    t0 = time.time()
    print(f"[*] Generating {num_games} Self-Play Games with {num_sims} simulations/ply...")

    wins_black = 0
    wins_white = 0
    draws = 0

    for g in range(1, num_games + 1):
        g_t0 = time.time()
        traj, winner = run_self_play_game(mcts)
        g_time = time.time() - g_t0

        if winner == BLACK:
            wins_black += 1
            win_str = "Black Win"
        elif winner == WHITE:
            wins_white += 1
            win_str = "White Win"
        else:
            draws += 1
            win_str = "Draw"

        # Assign terminal values from perspective of current player at each step
        for planes, pi, p in traj:
            if winner == 0:
                z = 0.0
            elif winner == p:
                z = 1.0
            else:
                z = -1.0
            all_planes.append(planes)
            all_pis.append(pi)
            all_values.append(z)

        print(f"  Game {g:2d}/{num_games:2d}: {win_str:<10} | Steps: {len(traj):2d} | Time: {g_time:4.1f}s | Cumulative Samples: {len(all_planes):5d}")

    total_time = time.time() - t0
    np.savez_compressed(
        out_path,
        planes=np.array(all_planes, dtype=np.float32),
        pis=np.array(all_pis, dtype=np.float32),
        values=np.array(all_values, dtype=np.float32)
    )

    print("\n" + "=" * 80)
    print("SELF-PLAY GENERATION COMPLETED:")
    print(f"  Total Games: {num_games} (Black Wins: {wins_black}, White Wins: {wins_white}, Draws: {draws})")
    print(f"  Total Transitions Collected: {len(all_planes):,}")
    print(f"  Total Elapsed Time: {total_time:.1f}s (Avg {total_time/num_games:.1f}s/game)")
    print(f"  Output Archive: {out_path} ({os.path.getsize(out_path)/(1024*1024):.2f} MB)")
    print("=" * 80)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--games", type=int, default=5, help="Number of self-play games")
    parser.add_argument("--sims", type=int, default=30, help="MCTS simulations per ply")
    args = parser.parse_args()
    generate_self_play_dataset(num_games=args.games, num_sims=args.sims)
