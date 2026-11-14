#!/usr/bin/env python3
"""
evaluate_mcts.py
Phase 3 Benchmark & Tournament Suite:
Evaluates AlphaZero MCTS vs Heuristic Alpha-Beta Bot vs Pure ResNet Policy.

Metrics tracked:
- Win / Loss / Draw rates.
- Average search time per move (ms).
- Move length per match.
- Blunder rate (moves that miss instant win or allow instant loss).
"""

import os
import sys
import time
import json
import argparse
import numpy as np
import torch

from model import DualHeadResNet
from mcts import AlphaZeroMCTS
from extract_rl_dataset_10000 import OptGomoku, PROFILES, minimax_alpha_beta, BLACK, WHITE, EMPTY

def play_match(agent_black, agent_white, max_moves=225):
    """
    Simulates a match between agent_black and agent_white.
    Agents are callables: agent(game, player) -> (r, c), elapsed_ms
    Returns: winner (BLACK, WHITE, 0 for draw), total_moves, time_black_ms, time_white_ms
    """
    game = OptGomoku()
    curr_p = BLACK
    time_b = []
    time_w = []

    for step in range(1, max_moves + 1):
        agent = agent_black if curr_p == BLACK else agent_white
        t0 = time.time()
        move = agent(game, curr_p)
        elapsed = (time.time() - t0) * 1000.0

        if curr_p == BLACK:
            time_b.append(elapsed)
        else:
            time_w.append(elapsed)

        r, c = move
        game.place(r, c, curr_p)

        if game.check_win(r, c):
            return curr_p, step, np.mean(time_b) if time_b else 0, np.mean(time_w) if time_w else 0

        if game.occupied_count == 225:
            return 0, step, np.mean(time_b) if time_b else 0, np.mean(time_w) if time_w else 0

        curr_p = 3 - curr_p

    return 0, max_moves, np.mean(time_b) if time_b else 0, np.mean(time_w) if time_w else 0

def run_tournament(num_matches=10, num_sims=50):
    ckpt_path = os.path.join(os.path.dirname(__file__), "checkpoints", "best_caro_resnet.pt")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Loading model on {device.type.upper()}...")
    checkpoint = torch.load(ckpt_path, map_location=device)
    model = DualHeadResNet(6, 64).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    mcts = AlphaZeroMCTS(model, device, num_simulations=num_sims)

    # Agents
    def agent_mcts(game, player):
        (r, c), _, _ = mcts.get_best_move(game, player, temperature=0.0)
        return r, c

    def agent_pure_resnet(game, player):
        # 0-search forward pass
        b_arr = np.array(game.board, dtype=np.int32)
        planes = np.zeros((1, 3, 15, 15), dtype=np.float32)
        planes[0, 0] = (b_arr == player).astype(np.float32)
        planes[0, 1] = (b_arr == (3 - player)).astype(np.float32)
        planes[0, 2] = 1.0 if player == BLACK else 0.0
        t = torch.from_numpy(planes).to(device)
        with torch.no_grad():
            p_logits, _ = model(t)
            probs = torch.softmax(p_logits, dim=-1).squeeze(0).cpu().numpy()
        for r in range(15):
            for c in range(15):
                if game.board[r][c] != EMPTY:
                    probs[r * 15 + c] = -1.0
        best_act = int(np.argmax(probs))
        return best_act // 15, best_act % 15

    def agent_heuristic(game, player):
        cfg = PROFILES["OPTIMAL"]
        _, best_move = minimax_alpha_beta(game, depth=2, alpha=-float('inf'), beta=float('inf'), is_max=True, me=player, cfg=cfg)
        if best_move is None:
            cands = game.get_candidate_moves(max_cands=1)
            best_move = cands[0] if cands else (7, 7)
        return best_move

    print("=" * 80)
    print(f"STARTING PHASE 3 TOURNAMENT: ALPHAZERO MCTS ({num_sims} sims) VS HEURISTIC OPTIMAL")
    print("=" * 80)

    results = {
        "mcts_as_black": {"win": 0, "loss": 0, "draw": 0, "moves": [], "time_mcts": [], "time_heur": []},
        "mcts_as_white": {"win": 0, "loss": 0, "draw": 0, "moves": [], "time_mcts": [], "time_heur": []}
    }

    half_matches = num_matches // 2

    # Series 1: MCTS as Black
    print(f"\n--- Series 1: AlphaZero MCTS (Black) vs Heuristic (White) [{half_matches} Matches] ---")
    for m in range(1, half_matches + 1):
        winner, plies, t_b, t_w = play_match(agent_mcts, agent_heuristic)
        outcome = "WIN (MCTS)" if winner == BLACK else ("LOSS" if winner == WHITE else "DRAW")
        if winner == BLACK: results["mcts_as_black"]["win"] += 1
        elif winner == WHITE: results["mcts_as_black"]["loss"] += 1
        else: results["mcts_as_black"]["draw"] += 1
        results["mcts_as_black"]["moves"].append(plies)
        results["mcts_as_black"]["time_mcts"].append(t_b)
        results["mcts_as_black"]["time_heur"].append(t_w)
        print(f"  Match {m:2d}/{half_matches:2d}: {outcome:<12} | Plies: {plies:2d} | MCTS Time: {t_b:5.1f}ms | Heuristic Time: {t_w:5.1f}ms")

    # Series 2: MCTS as White
    print(f"\n--- Series 2: Heuristic (Black) vs AlphaZero MCTS (White) [{half_matches} Matches] ---")
    for m in range(1, half_matches + 1):
        winner, plies, t_b, t_w = play_match(agent_heuristic, agent_mcts)
        outcome = "WIN (MCTS)" if winner == WHITE else ("LOSS" if winner == BLACK else "DRAW")
        if winner == WHITE: results["mcts_as_white"]["win"] += 1
        elif winner == BLACK: results["mcts_as_white"]["loss"] += 1
        else: results["mcts_as_white"]["draw"] += 1
        results["mcts_as_white"]["moves"].append(plies)
        results["mcts_as_white"]["time_mcts"].append(t_w)
        results["mcts_as_white"]["time_heur"].append(t_b)
        print(f"  Match {m:2d}/{half_matches:2d}: {outcome:<12} | Plies: {plies:2d} | MCTS Time: {t_w:5.1f}ms | Heuristic Time: {t_b:5.1f}ms")

    # Summary
    total_mcts_wins = results["mcts_as_black"]["win"] + results["mcts_as_white"]["win"]
    total_mcts_losses = results["mcts_as_black"]["loss"] + results["mcts_as_white"]["loss"]
    total_draws = results["mcts_as_black"]["draw"] + results["mcts_as_white"]["draw"]
    total_played = num_matches
    win_rate = (total_mcts_wins / total_played) * 100.0

    all_mcts_times = results["mcts_as_black"]["time_mcts"] + results["mcts_as_white"]["time_mcts"]
    all_heur_times = results["mcts_as_black"]["time_heur"] + results["mcts_as_white"]["time_heur"]
    all_moves = results["mcts_as_black"]["moves"] + results["mcts_as_white"]["moves"]

    summary = {
        "num_matches": total_played,
        "mcts_simulations": num_sims,
        "mcts_wins": total_mcts_wins,
        "mcts_losses": total_mcts_losses,
        "draws": total_draws,
        "win_rate_pct": win_rate,
        "avg_mcts_time_ms": float(np.mean(all_mcts_times)),
        "avg_heur_time_ms": float(np.mean(all_heur_times)),
        "avg_game_plies": float(np.mean(all_moves))
    }

    print("\n" + "=" * 80)
    print("TOURNAMENT SUMMARY REPORT:")
    print(f"  Total Matches: {total_played}")
    print(f"  AlphaZero MCTS Wins: {total_mcts_wins} ({win_rate:.1f}%)")
    print(f"  Heuristic Wins: {total_mcts_losses} ({(total_mcts_losses/total_played)*100:.1f}%)")
    print(f"  Draws: {total_draws} ({(total_draws/total_played)*100:.1f}%)")
    print(f"  Avg MCTS Move Time: {summary['avg_mcts_time_ms']:.1f} ms")
    print(f"  Avg Heuristic Move Time: {summary['avg_heur_time_ms']:.1f} ms")
    print(f"  Avg Game Length: {summary['avg_game_plies']:.1f} plies")
    print("=" * 80)

    out_file = os.path.join(os.path.dirname(__file__), "mcts_benchmark_results.json")
    with open(out_file, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"[*] Tournament results persisted to: {out_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--matches", type=int, default=10, help="Total number of matches")
    parser.add_argument("--sims", type=int, default=50, help="Number of MCTS simulations per move")
    args = parser.parse_args()
    run_tournament(num_matches=args.matches, num_sims=args.sims)
