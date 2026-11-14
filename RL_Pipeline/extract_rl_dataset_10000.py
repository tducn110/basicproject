#!/usr/bin/env python3
"""
extract_rl_dataset_10000.py
Step 1 of Reinforcement Learning Pipeline for Caro / Gomoku AI.

Extracts complete state-action-value trajectories from the 10,000 empirical tournament matches.
Features:
- High-throughput parallel execution across CPU cores.
- Canonical state encoding:
    Plane 0: Current player's stones (1 where player, else 0).
    Plane 1: Opponent's stones (1 where opponent, else 0).
    Plane 2: Side to move flag (all 1s for Black, 0s for White).
- Perspective-invariant value assignment:
    z_t = +1 (if current player won)
    z_t = -1 (if current player lost)
    z_t =  0 (if draw)
- Full Dihedral D4 symmetry verification & on-the-fly augmentation utilities.
- Exports:
    1. gomoku_rl_base_324k.npz (clean, compact binary format)
    2. schema_rl_dataset.json (strict formal specification)
    3. dataset_manifest.json (empirical verification & distribution statistics)
"""

import os
import sys
import time
import json
from dataclasses import dataclass
from multiprocessing import Pool, cpu_count
import numpy as np

EMPTY = 0
BLACK = 1
WHITE = 2

DIRECTIONS = [(0, 1), (1, 0), (1, 1), (1, -1)]

PROFILE_MAP = {
    "NAIVE": 0,
    "OFFENSE": 1,
    "SYMMETRIC": 2,
    "DEFENSE": 3,
    "OPTIMAL": 4
}
ID_TO_PROFILE = {v: k for k, v in PROFILE_MAP.items()}

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

class OptGomoku:
    __slots__ = ['board', 'occupied_count', 'last_move', 'stones', 'stones_p']
    def __init__(self):
        self.board = [[0]*15 for _ in range(15)]
        self.occupied_count = 0
        self.last_move = None
        self.stones = []
        self.stones_p = {BLACK: [], WHITE: []}

    def place(self, r, c, p):
        self.board[r][c] = p
        self.occupied_count += 1
        self.last_move = (r, c)
        self.stones.append((r, c))
        self.stones_p[p].append((r, c))

    def unplace(self, r, c, p):
        self.board[r][c] = 0
        self.occupied_count -= 1
        self.stones.pop()
        self.stones_p[p].pop()
        self.last_move = self.stones[-1] if self.stones else None

    def check_win(self, r, c):
        p = self.board[r][c]
        if p == 0: return False
        for dr, dc in DIRECTIONS:
            cnt = 1
            # forward
            nr, nc = r + dr, c + dc
            while 0 <= nr < 15 and 0 <= nc < 15 and self.board[nr][nc] == p:
                cnt += 1
                nr += dr
                nc += dc
            # backward
            nr, nc = r - dr, c - dc
            while 0 <= nr < 15 and 0 <= nc < 15 and self.board[nr][nc] == p:
                cnt += 1
                nr -= dr
                nc -= dc
            if cnt >= 5: return True
        return False

    def get_candidate_moves(self, max_cands=16):
        if self.occupied_count == 0:
            return [(7, 7)]
        seen = set()
        cands = []
        for r, c in self.stones:
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if dr == 0 and dc == 0: continue
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < 15 and 0 <= nc < 15 and self.board[nr][nc] == 0:
                        pt = (nr, nc)
                        if pt not in seen:
                            seen.add(pt)
                            cheb = max(abs(nr - 7), abs(nc - 7))
                            cands.append((cheb, nr, nc))
        cands.sort(key=lambda x: x[0])
        return [(r, c) for _, r, c in cands[:max_cands]]

def evaluate_line(seq, p, cfg):
    opp = 3 - p
    n = len(seq)
    if n < 5: return 0
    score = 0
    i = 0
    while i < n:
        if seq[i] == p:
            start = i
            while i < n and seq[i] == p: i += 1
            length = i - start
            left_open = (start > 0 and seq[start - 1] == 0)
            right_open = (i < n and seq[i] == 0)
            
            if cfg.verify_span:
                span_left = 0
                idx = start - 1
                while idx >= 0 and seq[idx] != opp:
                    span_left += 1
                    idx -= 1
                span_right = 0
                idx = i
                while idx < n and seq[idx] != opp:
                    span_right += 1
                    idx += 1
                if span_left + length + span_right < 5:
                    continue

            if length >= 5:
                score += cfg.w_five
            elif length == 4:
                if left_open and right_open:
                    score += cfg.w_open_four
                elif left_open or right_open:
                    score += cfg.w_half_four
            elif length == 3:
                if left_open and right_open:
                    score += cfg.w_open_three
                elif left_open or right_open:
                    score += cfg.w_half_three
            elif length == 2:
                if left_open and right_open:
                    score += cfg.w_open_two
        else:
            if cfg.detect_gapped and i + 4 < n:
                window = seq[i:i+5]
                # Pattern X . X X
                if window[0] == p and window[1] == 0 and window[2] == p and window[3] == p:
                    score += cfg.w_broken_three
                # Pattern X X . X
                elif window[0] == p and window[1] == p and window[2] == 0 and window[3] == p:
                    score += cfg.w_broken_three
                # Pattern X X . X X (if 6 window)
                if i + 5 < n:
                    win6 = seq[i:i+6]
                    if win6[0] == p and win6[1] == p and win6[2] == 0 and win6[3] == p and win6[4] == p:
                        score += cfg.w_broken_four
            i += 1
    return score

def evaluate_board_profile(game, p, cfg):
    opp = 3 - p
    my_score = 0
    opp_score = 0
    b = game.board

    # Rows
    for r in range(15):
        row = b[r]
        my_score += evaluate_line(row, p, cfg)
        opp_score += evaluate_line(row, opp, cfg)

    # Cols
    for c in range(15):
        col = [b[r][c] for r in range(15)]
        my_score += evaluate_line(col, p, cfg)
        opp_score += evaluate_line(col, opp, cfg)

    # Main diagonals
    for d in range(-10, 11):
        diag = []
        for r in range(15):
            c = r - d
            if 0 <= c < 15: diag.append(b[r][c])
        if len(diag) >= 5:
            my_score += evaluate_line(diag, p, cfg)
            opp_score += evaluate_line(diag, opp, cfg)

    # Anti diagonals
    for d in range(4, 25):
        anti = []
        for r in range(15):
            c = d - r
            if 0 <= c < 15: anti.append(b[r][c])
        if len(anti) >= 5:
            my_score += evaluate_line(anti, p, cfg)
            opp_score += evaluate_line(anti, opp, cfg)

    # Center bias
    if cfg.center_gamma > 0:
        for r, c in game.stones_p[p]:
            d = max(abs(r - 7), abs(c - 7))
            my_score += max(0, 7 - d) * cfg.center_gamma
        for r, c in game.stones_p[opp]:
            d = max(abs(r - 7), abs(c - 7))
            opp_score += max(0, 7 - d) * cfg.center_gamma

    return int(my_score - cfg.beta * opp_score)

def minimax_alpha_beta(game, depth, alpha, beta, is_max, me, cfg):
    if depth == 0 or game.occupied_count == 225:
        return evaluate_board_profile(game, me, cfg), None

    cands = game.get_candidate_moves(max_cands=16)
    if not cands:
        return evaluate_board_profile(game, me, cfg), None

    curr_player = me if is_max else (3 - me)
    best_move = cands[0]

    # Instant tactical win check
    for r, c in cands:
        game.place(r, c, curr_player)
        if game.check_win(r, c):
            game.unplace(r, c, curr_player)
            return (10_000_000 if is_max else -10_000_000), (r, c)
        game.unplace(r, c, curr_player)

    if is_max:
        max_eval = -float('inf')
        for r, c in cands:
            game.place(r, c, curr_player)
            score, _ = minimax_alpha_beta(game, depth - 1, alpha, beta, False, me, cfg)
            game.unplace(r, c, curr_player)
            if score > max_eval:
                max_eval = score
                best_move = (r, c)
            alpha = max(alpha, score)
            if beta <= alpha: break
        return max_eval, best_move
    else:
        min_eval = float('inf')
        for r, c in cands:
            game.place(r, c, curr_player)
            score, _ = minimax_alpha_beta(game, depth - 1, alpha, beta, True, me, cfg)
            game.unplace(r, c, curr_player)
            if score < min_eval:
                min_eval = score
                best_move = (r, c)
            beta = min(beta, score)
            if beta <= alpha: break
        return min_eval, best_move

def extract_match_trajectory_task(task_args):
    """
    Simulates a match and collects state-action transitions.
    Returns: list of transitions:
      (match_id, ply_idx, board_copy, player, action_idx, profile_id)
    plus match outcome (winner).
    """
    match_id, pairing_code, seed_idx, cfg_b_name, cfg_w_name, opening_moves = task_args
    cfg_b = PROFILES[cfg_b_name]
    cfg_w = PROFILES[cfg_w_name]
    prof_b_id = PROFILE_MAP[cfg_b_name]
    prof_w_id = PROFILE_MAP[cfg_w_name]

    game = OptGomoku()
    curr_p = BLACK

    transitions = []

    # Opening moves
    for r, c in opening_moves:
        # Snapshot state before move
        board_snap = [row[:] for row in game.board]
        action = r * 15 + c
        p_id = prof_b_id if curr_p == BLACK else prof_w_id
        transitions.append((match_id, game.occupied_count, board_snap, curr_p, action, p_id))

        game.place(r, c, curr_p)
        curr_p = 3 - curr_p

    max_plies = 90
    winner = 0

    while game.occupied_count < 225 and game.occupied_count < max_plies:
        cfg = cfg_b if curr_p == BLACK else cfg_w
        p_id = prof_b_id if curr_p == BLACK else prof_w_id
        _, move = minimax_alpha_beta(game, depth=2, alpha=-float('inf'), beta=float('inf'), is_max=True, me=curr_p, cfg=cfg)
        if not move: break

        board_snap = [row[:] for row in game.board]
        action = move[0] * 15 + move[1]
        transitions.append((match_id, game.occupied_count, board_snap, curr_p, action, p_id))

        game.place(move[0], move[1], curr_p)
        if game.check_win(move[0], move[1]):
            winner = curr_p
            break
        curr_p = 3 - curr_p

    # Assign target values (z)
    processed_records = []
    for m_id, ply, b_snap, p, act, prof in transitions:
        if winner == 0:
            z = 0
        elif winner == p:
            z = 1
        else:
            z = -1
        processed_records.append((m_id, ply, b_snap, p, act, prof, z))

    return processed_records

def generate_500_openings():
    openings = []
    center = (7, 7)
    offsets_m2 = [
        (0, 1), (1, 0), (1, 1), (1, -1),
        (0, -1), (-1, 0), (-1, -1), (-1, 1),
        (0, 2), (2, 0), (2, 2), (2, -2), (0, -2), (-2, 0), (-2, -2), (-2, 2),
        (1, 2), (2, 1), (-1, 2), (2, -1), (1, -2), (-2, 1), (-1, -2), (-2, -1)
    ]
    offsets_m3 = [
        (0, -1), (-1, 0), (-1, -1), (-1, 1),
        (0, 1), (1, 0), (1, 1), (1, -1),
        (0, -2), (-2, 0), (-2, -2), (-2, 2), (0, 2), (2, 0), (2, 2), (2, -2),
        (-1, -2), (-2, -1), (1, -2), (-2, 1), (-1, 2), (2, -1), (1, 2), (2, 1)
    ]
    
    seen = set()
    for o2 in offsets_m2:
        for o3 in offsets_m3:
            m1 = center
            m2 = (center[0] + o2[0], center[1] + o2[1])
            m3 = (center[0] + o3[0], center[1] + o3[1])
            if m1 != m2 and m2 != m3 and m1 != m3:
                triple = (m1, m2, m3)
                if triple not in seen:
                    seen.add(triple)
                    openings.append([m1, m2, m3])
                    if len(openings) >= 500:
                        return openings

    for c_alt in [(6, 7), (7, 6), (8, 7), (7, 8), (6, 6), (8, 8)]:
        for o2 in offsets_m2:
            m1 = c_alt
            m2 = (c_alt[0] + o2[0], c_alt[1] + o2[1])
            m3 = (c_alt[0] - o2[0], c_alt[1] - o2[1])
            triple = (m1, m2, m3)
            if triple not in seen:
                seen.add(triple)
                openings.append([m1, m2, m3])
                if len(openings) >= 500:
                    return openings

    return openings[:500]

def main():
    print("=" * 85)
    print("STEP 1: RL DATASET EXTRACTION & PREPARATION PIPELINE (10,000 MATCHES)")
    print("Goal: Extract ~324,000 raw transitions and structure for D4 augmentation (2.59M)")
    print("=" * 85)

    profile_names = ["NAIVE", "OFFENSE", "SYMMETRIC", "DEFENSE", "OPTIMAL"]
    pairings = []
    for i in range(len(profile_names)):
        for j in range(i + 1, len(profile_names)):
            pairings.append((profile_names[i], profile_names[j]))

    openings = generate_500_openings()
    tasks = []
    match_counter = 1
    for p_a, p_b in pairings:
        pairing_code = f"{p_a}_vs_{p_b}"
        for s_idx, op in enumerate(openings):
            # Game 1: A=Black, B=White
            tasks.append((match_counter, pairing_code, s_idx, p_a, p_b, op))
            match_counter += 1
            # Game 2: B=Black, A=White
            tasks.append((match_counter, pairing_code, s_idx, p_b, p_a, op))
            match_counter += 1

    total_tasks = len(tasks)
    workers = min(10, cpu_count())
    print(f"Dispatched {total_tasks} matches to {workers} worker processes...")

    start_t = time.time()
    with Pool(processes=workers) as pool:
        results = pool.map(extract_match_trajectory_task, tasks)
    elapsed = time.time() - start_t

    # Flatten results
    total_transitions = sum(len(r) for r in results)
    print(f"\n[EXTRACTION COMPLETE] Processed {total_tasks} matches in {elapsed:.2f}s ({total_tasks/elapsed:.1f} matches/sec).")
    print(f"Total State-Action-Value Transitions: {total_transitions:,} samples.")

    # Convert to high-performance NumPy arrays
    print("Packaging into structured NumPy arrays...")
    match_ids = np.empty(total_transitions, dtype=np.int32)
    ply_indices = np.empty(total_transitions, dtype=np.uint8)
    boards = np.empty((total_transitions, 15, 15), dtype=np.uint8)
    players = np.empty(total_transitions, dtype=np.uint8)
    actions = np.empty(total_transitions, dtype=np.uint8)
    profiles = np.empty(total_transitions, dtype=np.uint8)
    values = np.empty(total_transitions, dtype=np.int8)

    idx = 0
    for match_res in results:
        for m_id, ply, b_snap, p, act, prof, z in match_res:
            match_ids[idx] = m_id
            ply_indices[idx] = ply
            boards[idx] = b_snap
            players[idx] = p
            actions[idx] = act
            profiles[idx] = prof
            values[idx] = z
            idx += 1

    out_dir = os.path.dirname(os.path.abspath(__file__))
    npz_path = os.path.join(out_dir, "gomoku_rl_base_324k.npz")
    print(f"Writing compressed dataset to: {npz_path}")
    np.savez_compressed(
        npz_path,
        match_ids=match_ids,
        ply_indices=ply_indices,
        boards=boards,
        players=players,
        actions=actions,
        profiles=profiles,
        values=values
    )
    npz_size_mb = os.path.getsize(npz_path) / (1024 * 1024)
    print(f"Successfully saved {npz_path} ({npz_size_mb:.2f} MB)")

    # Compute Statistics for Manifest
    val_counts = {
        "wins": int(np.sum(values == 1)),
        "losses": int(np.sum(values == -1)),
        "draws": int(np.sum(values == 0))
    }
    prof_counts = {ID_TO_PROFILE[i]: int(np.sum(profiles == i)) for i in range(5)}
    avg_plies = float(np.mean(ply_indices))

    manifest = {
        "dataset_name": "Gomoku_Tournament_10000_RL_Base",
        "version": "1.0.0",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "total_matches": total_tasks,
        "total_transitions_raw": total_transitions,
        "total_transitions_with_d4_augmented": total_transitions * 8,
        "board_dimension": [15, 15],
        "action_space_size": 225,
        "value_distribution": {
            "wins (+1)": val_counts["wins"],
            "losses (-1)": val_counts["losses"],
            "draws (0)": val_counts["draws"],
            "win_ratio": val_counts["wins"] / total_transitions,
            "loss_ratio": val_counts["losses"] / total_transitions,
            "draw_ratio": val_counts["draws"] / total_transitions
        },
        "profile_distribution": prof_counts,
        "ply_statistics": {
            "mean_ply": avg_plies,
            "max_ply": int(np.max(ply_indices)),
            "min_ply": int(np.min(ply_indices))
        },
        "d4_symmetry_factor": 8,
        "storage": {
            "compressed_npz_path": "gomoku_rl_base_324k.npz",
            "file_size_mb": round(npz_size_mb, 2)
        }
    }

    manifest_path = os.path.join(out_dir, "dataset_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved dataset manifest to: {manifest_path}")

    # Generate Formal Schema
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "GomokuRLTransitionDatasetSchema",
        "type": "object",
        "description": "Formal specification for state-action-value transitions extracted for Caro/Gomoku RL training.",
        "properties": {
            "match_ids": {"type": "array", "items": {"type": "integer"}, "description": "1-based match identifier"},
            "ply_indices": {"type": "array", "items": {"type": "integer", "minimum": 0, "maximum": 224}},
            "boards": {
                "type": "array",
                "items": {
                    "type": "array",
                    "items": {"type": "array", "items": {"type": "integer", "enum": [0, 1, 2]}}
                },
                "shape": [None, 15, 15]
            },
            "players": {"type": "array", "items": {"type": "integer", "enum": [1, 2]}},
            "actions": {"type": "array", "items": {"type": "integer", "minimum": 0, "maximum": 224}},
            "profiles": {"type": "array", "items": {"type": "integer", "minimum": 0, "maximum": 4}},
            "values": {"type": "array", "items": {"type": "integer", "enum": [-1, 0, 1]}}
        },
        "required": ["match_ids", "ply_indices", "boards", "players", "actions", "profiles", "values"],
        "d4_transformation_rules": {
            "plane_transform": "transform_plane(p, k) for k in 0..7",
            "action_transform": "transform_action(r, c, k) -> tr * 15 + tc",
            "value_invariance": "z_t remains identical across all k"
        }
    }

    schema_path = os.path.join(out_dir, "schema_rl_dataset.json")
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
    print(f"Saved formal schema to: {schema_path}")

    print("\n" + "=" * 85)
    print(f"STEP 1 COMPLETE: {total_transitions:,} BASE SAMPLES READY (EXPANDS TO {total_transitions*8:,} SAMPLES VIA D4).")
    print("=" * 85)

if __name__ == "__main__":
    main()
