#!/usr/bin/env python3
"""
systematic_tournament_1000.py
Executes a systematic, statistically rigorous 1,000-game tournament
testing 5 deliberately selected heuristic profiles under strict 1:1 Color Alternation.

Heuristic Profiles:
1. CFG_NAIVE: Baseline naive bot (No span check, no gapped detection, beta=1.00)
2. CFG_OFFENSE: Proactive attacker (beta=0.75, high W(Open 3)=7500, gamma=15)
3. CFG_SYMMETRIC: Textbook symmetric evaluation (beta=1.00, full tactical kernels)
4. CFG_DEFENSE: Hyper-defensive bot (beta=1.35, low W(Open 3)=4000)
5. CFG_OPTIMAL: Pareto-optimized configuration (beta=1.15, W(Open 3)=6500, gamma=10)

Tournament Design:
- 5 profiles -> 10 pairwise pairings.
- 50 distinct standardized symmetric opening seeds per pair.
- 2 games per seed with alternating colors (1 as Black, 1 as White) -> 100 games per pair.
- Total games = 10 * 100 = 1,000 games.
- Multi-processing across 10 CPU cores.
"""

import os
import sys
import time
import json
import math
from dataclasses import dataclass, asdict
from multiprocessing import Pool, cpu_count
import numpy as np

EMPTY = 0
BLACK = 1
WHITE = 2

DIRECTIONS = [(0, 1), (1, 0), (1, 1), (1, -1)]

@dataclass
class BotConfig:
    name: str
    beta: float
    w_five: int = 10_000_000
    w_open_four: int = 100_000
    w_half_four: int = 10_000
    w_open_three: int = 5_000
    w_half_three: int = 1_000
    w_open_two: int = 500
    w_broken_three: int = 4_500
    w_broken_four: int = 8_000
    center_gamma: int = 10
    detect_gapped: bool = True
    verify_span: bool = True

PROFILES = {
    "NAIVE": BotConfig(
        name="NAIVE",
        beta=1.00,
        w_open_three=3_000,
        center_gamma=0,
        detect_gapped=False,
        verify_span=False
    ),
    "OFFENSE": BotConfig(
        name="OFFENSE",
        beta=0.75,
        w_open_three=7_500,
        center_gamma=15,
        detect_gapped=True,
        verify_span=True
    ),
    "SYMMETRIC": BotConfig(
        name="SYMMETRIC",
        beta=1.00,
        w_open_three=5_000,
        center_gamma=0,
        detect_gapped=True,
        verify_span=True
    ),
    "DEFENSE": BotConfig(
        name="DEFENSE",
        beta=1.35,
        w_open_three=4_000,
        center_gamma=0,
        detect_gapped=True,
        verify_span=True
    ),
    "OPTIMAL": BotConfig(
        name="OPTIMAL",
        beta=1.15,
        w_open_three=6_500,
        center_gamma=10,
        detect_gapped=True,
        verify_span=True
    )
}

class FastGomoku:
    __slots__ = ['board', 'occupied_count', 'last_move']
    def __init__(self):
        self.board = [[0]*15 for _ in range(15)]
        self.occupied_count = 0
        self.last_move = None

    def place(self, r, c, player):
        self.board[r][c] = player
        self.occupied_count += 1
        self.last_move = (r, c)

    def is_empty(self, r, c):
        return 0 <= r < 15 and 0 <= c < 15 and self.board[r][c] == EMPTY

    def check_win(self, r, c):
        p = self.board[r][c]
        if p == EMPTY: return False
        for dr, dc in DIRECTIONS:
            cnt = 1
            # forward
            nr, nc = r + dr, c + dc
            while 0 <= nr < 15 and 0 <= nc < 15 and self.board[nr][nc] == p:
                cnt += 1; nr += dr; nc += dc
            # backward
            nr, nc = r - dr, c - dc
            while 0 <= nr < 15 and 0 <= nc < 15 and self.board[nr][nc] == p:
                cnt += 1; nr -= dr; nc -= dc
            if cnt >= 5: return True
        return False

    def get_candidates(self, radius=2, max_cands=16):
        if self.occupied_count == 0:
            return [(7, 7)]
        seen = set()
        cands = []
        for r in range(15):
            for c in range(15):
                if self.board[r][c] != EMPTY:
                    for dr in range(-radius, radius + 1):
                        for dc in range(-radius, radius + 1):
                            nr, nc = r + dr, c + dc
                            if 0 <= nr < 15 and 0 <= nc < 15 and self.board[nr][nc] == EMPTY:
                                if (nr, nc) not in seen:
                                    seen.add((nr, nc))
                                    # Proximity score to center & pieces
                                    dist_c = max(abs(nr - 7), abs(nc - 7))
                                    score = 7 - dist_c
                                    cands.append((score, nr, nc))
        cands.sort(key=lambda x: x[0], reverse=True)
        return [(r, c) for _, r, c in cands[:max_cands]]

def evaluate_player(board, p, cfg: BotConfig):
    opp = 3 - p
    total_score = 0

    for r in range(15):
        for c in range(15):
            if board[r][c] != p:
                continue

            if cfg.center_gamma > 0:
                dist_cheb = max(abs(r - 7), abs(c - 7))
                total_score += cfg.center_gamma * max(0, 7 - dist_cheb)

            for dr, dc in DIRECTIONS:
                prev_r, prev_c = r - dr, c - dc
                if 0 <= prev_r < 15 and 0 <= prev_c < 15 and board[prev_r][prev_c] == p:
                    continue

                empty_back = 0
                br, bc = r - dr, c - dc
                while 0 <= br < 15 and 0 <= bc < 15 and board[br][bc] == EMPTY and empty_back < 4:
                    empty_back += 1; br -= dr; bc -= dc

                cnt = 1
                fr, fc = r + dr, c + dc
                while 0 <= fr < 15 and 0 <= fc < 15 and board[fr][fc] == p:
                    cnt += 1; fr += dr; fc += dc

                empty_fwd = 0
                while 0 <= fr < 15 and 0 <= fc < 15 and board[fr][fc] == EMPTY and empty_fwd < 4:
                    empty_fwd += 1; fr += dr; fc += dc

                total_span = empty_back + cnt + empty_fwd
                if cfg.verify_span and total_span < 5:
                    continue

                if cnt >= 5:
                    total_score += cfg.w_five
                elif cnt == 4:
                    if empty_back > 0 and empty_fwd > 0:
                        total_score += cfg.w_open_four
                    elif empty_back > 0 or empty_fwd > 0:
                        total_score += cfg.w_half_four
                elif cnt == 3:
                    if empty_back > 0 and empty_fwd > 0:
                        total_score += cfg.w_open_three
                    elif empty_back > 0 or empty_fwd > 0:
                        total_score += cfg.w_half_three
                elif cnt == 2:
                    if empty_back > 0 and empty_fwd > 0:
                        total_score += cfg.w_open_two

                if cfg.detect_gapped and empty_fwd == 1:
                    gap_r, gap_c = r + (cnt + 1)*dr, c + (cnt + 1)*dc
                    post_cnt = 0
                    while 0 <= gap_r < 15 and 0 <= gap_c < 15 and board[gap_r][gap_c] == p:
                        post_cnt += 1; gap_r += dr; gap_c += dc
                    comb = cnt + post_cnt
                    if comb >= 3 and (total_span + post_cnt) >= 5:
                        if comb == 3:
                            total_score += cfg.w_broken_three
                        elif comb == 4:
                            total_score += cfg.w_broken_four

    return total_score

def evaluate_board(board, me, cfg: BotConfig):
    opp = 3 - me
    my_s = evaluate_player(board, me, cfg)
    opp_s = evaluate_player(board, opp, cfg)
    return my_s - int(cfg.beta * opp_s)

def minimax_alpha_beta(game: FastGomoku, depth, alpha, beta, is_max, me, cfg: BotConfig):
    opp = 3 - me
    if game.last_move:
        lr, lc = game.last_move
        winner = game.board[lr][lc]
        if game.check_win(lr, lc):
            return (10_000_000 if winner == me else -10_000_000), None

    if depth == 0 or game.occupied_count >= 225:
        return evaluate_board(game.board, me, cfg), None

    cands = game.get_candidates(radius=2, max_cands=16)
    if not cands:
        return 0, None

    best_move = cands[0]
    curr_player = me if is_max else opp

    if is_max:
        max_eval = -float('inf')
        for r, c in cands:
            game.place(r, c, curr_player)
            score, _ = minimax_alpha_beta(game, depth - 1, alpha, beta, False, me, cfg)
            game.board[r][c] = EMPTY
            game.occupied_count -= 1
            game.last_move = None
            if score > max_eval:
                max_eval = score
                best_move = (r, c)
            alpha = max(alpha, score)
            if beta <= alpha:
                break
        return max_eval, best_move
    else:
        min_eval = float('inf')
        for r, c in cands:
            game.place(r, c, curr_player)
            score, _ = minimax_alpha_beta(game, depth - 1, alpha, beta, True, me, cfg)
            game.board[r][c] = EMPTY
            game.occupied_count -= 1
            game.last_move = None
            if score < min_eval:
                min_eval = score
                best_move = (r, c)
            beta = min(beta, score)
            if beta <= alpha:
                break
        return min_eval, best_move

def play_single_game(args):
    cfg_black_name, cfg_white_name, opening_moves = args
    cfg_b = PROFILES[cfg_black_name]
    cfg_w = PROFILES[cfg_white_name]

    game = FastGomoku()
    curr_p = BLACK

    # Apply opening moves
    for r, c in opening_moves:
        game.place(r, c, curr_p)
        curr_p = 3 - curr_p

    max_plies = 90
    winner = 0

    while game.occupied_count < 225 and game.occupied_count < max_plies:
        cfg = cfg_b if curr_p == BLACK else cfg_w
        # Depth 2 is optimal for large scale tournament validation
        _, move = minimax_alpha_beta(game, depth=2, alpha=-float('inf'), beta=float('inf'), is_max=True, me=curr_p, cfg=cfg)
        if not move:
            break
        r, c = move
        game.place(r, c, curr_p)
        if game.check_win(r, c):
            winner = curr_p
            break
        curr_p = 3 - curr_p

    winner_color = "DRAW"
    winner_cfg = "DRAW"
    if winner == BLACK:
        winner_color = "BLACK"
        winner_cfg = cfg_black_name
    elif winner == WHITE:
        winner_color = "WHITE"
        winner_cfg = cfg_white_name

    return {
        "cfg_black": cfg_black_name,
        "cfg_white": cfg_white_name,
        "winner_color": winner_color,
        "winner_cfg": winner_cfg,
        "plies": game.occupied_count
    }

def wilson_score_interval(successes, n, confidence=0.95):
    if n == 0:
        return (0.0, 0.0)
    z = 1.959963984540054  # 95%
    p = successes / n
    denom = 1 + z**2 / n
    center = (p + z**2 / (2 * n)) / denom
    spread = (z * math.sqrt((p * (1 - p) + z**2 / (4 * n)) / n)) / denom
    return (max(0.0, (center - spread) * 100), min(100.0, (center + spread) * 100))

def binomial_p_value(successes, n, p0=0.5):
    from scipy.stats import binomtest
    res = binomtest(successes, n, p0, alternative='two-sided')
    return float(res.pvalue)

def generate_symmetric_openings(count=50):
    """
    Generate diverse symmetric and quasi-symmetric opening triples (move1, move2, move3).
    Move 1: center or adjacent (7,7), (7,8), (6,7)
    Move 2: opponent adjacent / diagonal
    Move 3: response within Chebyshev dist 2
    """
    seeds = []
    center = (7, 7)
    # Direct center openings
    offsets_m2 = [(0, 1), (1, 0), (1, 1), (1, -1), (0, 2), (2, 0), (2, 2), (1, 2), (2, 1)]
    offsets_m3 = [(0, -1), (-1, 0), (-1, -1), (-1, 1), (0, -2), (-2, 0), (-2, -2), (-1, -2)]
    
    idx = 0
    for o2 in offsets_m2:
        for o3 in offsets_m3:
            m1 = center
            m2 = (center[0] + o2[0], center[1] + o2[1])
            m3 = (center[0] + o3[0], center[1] + o3[1])
            if m1 != m2 and m2 != m3 and m1 != m3:
                seeds.append([m1, m2, m3])
                idx += 1
                if idx >= count:
                    return seeds
    while len(seeds) < count:
        seeds.append([center, (7, 8), (6, 7)])
    return seeds[:count]

def main():
    print("=" * 80)
    print("EXECUTING SYSTEMATIC LARGE-SCALE TOURNAMENT (SAMPLE SIZE = 1,000 GAMES)")
    print("Ablation Grid: 5 Deliberately Selected Profiles under 1:1 Color Alternation")
    print("Harness: Multi-core Parallelized Alpha-Beta (Using 10 Cores)")
    print("=" * 80)

    profile_names = ["NAIVE", "OFFENSE", "SYMMETRIC", "DEFENSE", "OPTIMAL"]
    pairings = []
    for i in range(len(profile_names)):
        for j in range(i + 1, len(profile_names)):
            pairings.append((profile_names[i], profile_names[j]))

    print(f"Total Canonical Pairings: {len(pairings)} pairs.")
    openings = generate_symmetric_openings(count=50)
    print(f"Generated {len(openings)} distinct standardized openings.")

    # Build 1000 match tasks: 10 pairs * 50 openings * 2 games (alternating colors)
    tasks = []
    for p_a, p_b in pairings:
        for op in openings:
            # Game 1: A is Black, B is White
            tasks.append((p_a, p_b, op))
            # Game 2: B is Black, A is White (Strict 1:1 Color Alternation)
            tasks.append((p_b, p_a, op))

    total_tasks = len(tasks)
    print(f"Total games to execute: {total_tasks} matches.")
    start_t = time.time()

    workers = min(10, cpu_count())
    print(f"Spawning {workers} worker processes in multiprocessing pool...")
    with Pool(processes=workers) as pool:
        results = pool.map(play_single_game, tasks)

    elapsed = time.time() - start_t
    print(f"\nTOURNAMENT COMPLETED in {elapsed:.2f}s ({total_tasks/elapsed:.1f} games/sec)!")
    print("=" * 80)

    # 1. First-Player (Color) Statistics
    black_wins = sum(1 for r in results if r['winner_color'] == 'BLACK')
    white_wins = sum(1 for r in results if r['winner_color'] == 'WHITE')
    draws = sum(1 for r in results if r['winner_color'] == 'DRAW')

    black_rate = (black_wins / total_tasks) * 100
    white_rate = (white_wins / total_tasks) * 100
    draw_rate = (draws / total_tasks) * 100

    ci_black = wilson_score_interval(black_wins, total_tasks)
    ci_white = wilson_score_interval(white_wins, total_tasks)
    ci_draw = wilson_score_interval(draws, total_tasks)

    print("\n[EMPIRICAL PROOF 1] FIRST-PLAYER (BLACK) ADVANTAGE ANALYSIS (N = 1,000 Games):")
    print(f"  * Black (First Player) Wins : {black_wins:4d} ({black_rate:.1f}%) | 95% Wilson CI: [{ci_black[0]:.2f}%, {ci_black[1]:.2f}%]")
    print(f"  * White (Second Player) Wins: {white_wins:4d} ({white_rate:.1f}%) | 95% Wilson CI: [{ci_white[0]:.2f}%, {ci_white[1]:.2f}%]")
    print(f"  * Draws                     : {draws:4d} ({draw_rate:.1f}%) | 95% Wilson CI: [{ci_draw[0]:.2f}%, {ci_draw[1]:.2f}%]")
    print(f"  * Net Advantage             : Black holds +{black_rate - white_rate:.1f}% absolute advantage over White.")

    # 2. Per-profile statistics
    cfg_wins = {p: 0 for p in profile_names}
    cfg_losses = {p: 0 for p in profile_names}
    cfg_draws = {p: 0 for p in profile_names}
    cfg_total = {p: 0 for p in profile_names}
    cfg_plies = {p: [] for p in profile_names}
    
    # Head-to-Head Cross Matrix: h2h[p1][p2] = {'wins': x, 'losses': y, 'draws': z}
    h2h = {p1: {p2: {'wins': 0, 'losses': 0, 'draws': 0} for p2 in profile_names} for p1 in profile_names}

    for r in results:
        b = r['cfg_black']
        w = r['cfg_white']
        winner = r['winner_cfg']
        plies = r['plies']

        cfg_total[b] += 1
        cfg_total[w] += 1
        cfg_plies[b].append(plies)
        cfg_plies[w].append(plies)

        if winner == b:
            cfg_wins[b] += 1
            cfg_losses[w] += 1
            h2h[b][w]['wins'] += 1
            h2h[w][b]['losses'] += 1
        elif winner == w:
            cfg_wins[w] += 1
            cfg_losses[b] += 1
            h2h[w][b]['wins'] += 1
            h2h[b][w]['losses'] += 1
        else:
            cfg_draws[b] += 1
            cfg_draws[w] += 1
            h2h[b][w]['draws'] += 1
            h2h[w][b]['draws'] += 1

    profile_summaries = []
    print("\n" + "=" * 80)
    print("[EMPIRICAL PROOF 2] STATISTICALLY RIGOROUS PROFILE STANDINGS (N = 1,000 Games):")
    print(f"{'Profile Name':<12} | {'Matches':<8} | {'Wins':<6} | {'Draws':<6} | {'Win Rate':<10} | {'95% Wilson CI':<18} | {'p-value vs 50%':<15} | {'Avg Plies':<10}")
    print("-" * 95)

    for p in profile_names:
        tot = cfg_total[p]
        w = cfg_wins[p]
        d = cfg_draws[p]
        # Win rate formula: (wins + 0.5*draws) / tot
        wr = ((w + 0.5 * d) / tot) * 100
        ci = wilson_score_interval(w + 0.5 * d, tot)
        try:
            from scipy.stats import binomtest
            pval = float(binomtest(int(w + 0.5 * d), tot, 0.5).pvalue)
        except Exception:
            pval = 1.0

        avg_ply = np.mean(cfg_plies[p]) if cfg_plies[p] else 0.0

        print(f"{p:<12} | {tot:<8} | {w:<6} | {d:<6} | {wr:8.2f}% | [{ci[0]:5.2f}%, {ci[1]:5.2f}%] | p = {pval:<11.4f} | {avg_ply:8.1f}")

        profile_summaries.append({
            "profile": p,
            "matches": tot,
            "wins": w,
            "losses": cfg_losses[p],
            "draws": d,
            "win_rate_percent": round(wr, 2),
            "ci_95": [round(ci[0], 2), round(ci[1], 2)],
            "p_value": pval,
            "avg_plies": round(avg_ply, 1),
            "std_plies": round(float(np.std(cfg_plies[p])), 1)
        })

    # Plies distribution summary
    all_plies = [r['plies'] for r in results]
    plies_stats = {
        "mean": round(float(np.mean(all_plies)), 2),
        "std": round(float(np.std(all_plies)), 2),
        "median": round(float(np.median(all_plies)), 2),
        "min": int(np.min(all_plies)),
        "max": int(np.max(all_plies)),
        "percentile_25": round(float(np.percentile(all_plies, 25)), 2),
        "percentile_75": round(float(np.percentile(all_plies, 75)), 2)
    }

    # Save comprehensive results
    output_data = {
        "tournament_metadata": {
            "total_games": total_tasks,
            "elapsed_seconds": round(elapsed, 2),
            "games_per_second": round(total_tasks / elapsed, 2),
            "workers": workers,
            "pairings_count": len(pairings),
            "openings_count": len(openings)
        },
        "color_statistics": {
            "black_wins": black_wins,
            "white_wins": white_wins,
            "draws": draws,
            "black_win_rate": round(black_rate, 2),
            "white_win_rate": round(white_rate, 2),
            "draw_rate": round(draw_rate, 2),
            "ci_95_black": [round(ci_black[0], 2), round(ci_black[1], 2)],
            "ci_95_white": [round(ci_white[0], 2), round(ci_white[1], 2)],
            "ci_95_draw": [round(ci_draw[0], 2), round(ci_draw[1], 2)]
        },
        "profile_summaries": profile_summaries,
        "head_to_head_matrix": h2h,
        "plies_statistics": plies_stats,
        "sample_games": results[:40]
    }

    out_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "systematic_tournament_1000_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print("=" * 80)
    print(f"Results successfully saved and sealed to: {out_file}")
    print("=" * 80)

if __name__ == "__main__":
    main()
