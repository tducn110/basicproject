#!/usr/bin/env python3
"""
interactive_play.py
Interactive Game Runner & Battle Arena for Caro / Gomoku AI.

Play directly against the trained Dual-Head ResNet-6 Neural Network,
or watch the Neural AI battle against the Heuristic Alpha-Beta Bot in real-time!

Modes:
1. Human (Black - First) vs AI ResNet (White)
2. AI ResNet (Black - First) vs Human (White)
3. AI ResNet vs Heuristic Alpha-Beta Bot (Spectator / Auto-Battle)
4. Heuristic Bot vs AI ResNet (Spectator / Auto-Battle)
5. Human vs Heuristic Alpha-Beta Bot
"""

import os
import sys
import time
import argparse
import numpy as np
import torch
import torch.nn.functional as F

from model import DualHeadResNet
from mcts import AlphaZeroMCTS
from extract_rl_dataset_10000 import OptGomoku, PROFILES, minimax_alpha_beta, BLACK, WHITE, EMPTY

BOARD_SIZE = 15
COL_LABELS = "A B C D E F G H I J K L M N O".split()

def parse_coordinate(s):
    """
    Parses user input into (row, col) 0-indexed.
    Accepts:
      - '7, 7' or '7 7' or '7,7' (row, col from 0 to 14)
      - 'H8', 'h8', 'A1', 'O15' (standard Gomoku notation: col A-O, row 1-15)
    """
    s = s.strip()
    if not s:
        return None
    # Try row, col integer format
    if "," in s:
        parts = s.split(",")
    elif " " in s:
        parts = s.split()
    else:
        parts = None

    if parts and len(parts) == 2:
        try:
            r, c = int(parts[0].strip()), int(parts[1].strip())
            if 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE:
                return r, c
        except ValueError:
            pass

    # Try chess notation: e.g. H8 or h8
    first_char = s[0].upper()
    if first_char in COL_LABELS:
        c = COL_LABELS.index(first_char)
        try:
            # 1-indexed from bottom or top? In Gomoku: 1 is top, 15 is bottom (or vice versa).
            # We map 1 -> row 0, 15 -> row 14 for simplicity:
            r = int(s[1:]) - 1
            if 0 <= r < BOARD_SIZE:
                return r, c
        except ValueError:
            pass

    return None

def print_board(game, last_move=None, eval_info=None):
    """
    Renders an aesthetic ANSI-formatted 15x15 board with coordinate axes.
    """
    os.system('clear' if os.name == 'posix' else 'cls')
    print("=" * 68)
    print("        GOMOKU / CARO ARENA: DEEP LEARNING vs HEURISTIC")
    print("=" * 68)

    # Column header
    col_str = "    " + "  ".join(f"{c}" for c in COL_LABELS)
    print(col_str)
    print("   +" + "--" * BOARD_SIZE + "-+")

    for r in range(BOARD_SIZE):
        row_str = f"{r+1:2d} |"
        for c in range(BOARD_SIZE):
            val = game.board[r][c]
            is_last = (last_move == (r, c))
            if val == BLACK:
                cell_char = "X"
            elif val == WHITE:
                cell_char = "O"
            else:
                cell_char = "."

            if is_last:
                # Highlight last move
                row_str += f"\033[1;32m[{cell_char}]\033[0m" if cell_char != "." else f"[{cell_char}]"
            else:
                row_str += f" {cell_char} "
        row_str += f"| {r+1:2d}"
        print(row_str)

    print("   +" + "--" * BOARD_SIZE + "-+")
    print(col_str)
    print("-" * 68)

    if last_move:
        lr, lc = last_move
        print(f" -> Nước cờ vừa đi: {COL_LABELS[lc]}{lr+1} (Hàng {lr}, Cột {lc})")

    if eval_info:
        print(f" -> Thông số thẩm định: {eval_info}")
    print("-" * 68)

def get_resnet_action(model, game, player, device):
    """
    Computes move using Dual-Head ResNet.
    Returns: (r, c), top_3_info, expected_value
    """
    # Build canonical 3-plane tensor
    planes = np.zeros((1, 3, 15, 15), dtype=np.float32)
    b_arr = np.array(game.board, dtype=np.int32)

    planes[0, 0] = (b_arr == player).astype(np.float32)       # My stones
    planes[0, 1] = (b_arr == (3 - player)).astype(np.float32) # Opponent stones
    planes[0, 2] = 1.0 if player == BLACK else 0.0           # Black flag

    tensor = torch.from_numpy(planes).to(device)

    with torch.no_grad():
        p_logits, v_pred = model(tensor)
        probs = F.softmax(p_logits, dim=-1).squeeze(0).cpu().numpy()
        val = v_pred.item()

    # Mask illegal moves (already occupied cells)
    for r in range(BOARD_SIZE):
        for c in range(BOARD_SIZE):
            if game.board[r][c] != EMPTY:
                probs[r * 15 + c] = 0.0

    sum_p = np.sum(probs)
    if sum_p > 0:
        probs /= sum_p
    else:
        # Fallback to any empty cell
        empty_indices = [r * 15 + c for r in range(15) for c in range(15) if game.board[r][c] == EMPTY]
        return empty_indices[0] // 15, empty_indices[0] % 15, [], 0.0

    # Top predictions
    sorted_indices = np.argsort(probs)[::-1]
    top_3 = []
    for idx in sorted_indices[:3]:
        if probs[idx] > 0:
            top_3.append((idx // 15, idx % 15, probs[idx] * 100))

    best_action = sorted_indices[0]
    best_r, best_c = best_action // 15, best_action % 15
    return best_r, best_c, top_3, val

def get_heuristic_action(game, player, cfg_name="OPTIMAL", depth=2):
    """
    Computes move using Heuristic Alpha-Beta Minimax.
    """
    cfg = PROFILES[cfg_name]
    score, best_move = minimax_alpha_beta(game, depth=depth, alpha=-float('inf'), beta=float('inf'), is_max=True, me=player, cfg=cfg)
    if best_move is None:
        cands = game.get_candidate_moves(max_cands=1)
        best_move = cands[0] if cands else (7, 7)
    return best_move[0], best_move[1], score

def play_game(mode, model, device, delay=0.8, mcts_sims=50):
    """
    Main interactive game loop.
    Modes:
      1: Human (Black) vs AI ResNet Pure (White)
      2: Human (Black) vs AlphaZero MCTS Deep (White)
      3: AlphaZero MCTS (Black) vs Human (White)
      4: AlphaZero MCTS (Black) vs Heuristic Bot (White) [Watch Arena]
      5: ResNet Pure (Black) vs Heuristic Bot (White) [Watch Arena]
      6: Human (Black) vs Heuristic Bot (White)
    """
    game = OptGomoku()
    curr_player = BLACK
    last_move = None
    eval_info = None

    mcts = AlphaZeroMCTS(model, device, num_simulations=mcts_sims)

    player_names = {
        1: ("Người chơi (Đen)", "ResNet AI Pure (Trắng)"),
        2: ("Người chơi (Đen)", f"AlphaZero MCTS [{mcts_sims} sims] (Trắng)"),
        3: (f"AlphaZero MCTS [{mcts_sims} sims] (Đen)", "Người chơi (Trắng)"),
        4: (f"AlphaZero MCTS [{mcts_sims} sims] (Đen)", "Heuristic Bot (Trắng)"),
        5: ("ResNet AI Pure (Đen)", "Heuristic Bot (Trắng)"),
        6: ("Người chơi (Đen)", "Heuristic Bot (Trắng)")
    }
    black_name, white_name = player_names[mode]

    print_board(game, last_move, f"Trận đấu bắt đầu! {black_name} vs {white_name}")

    step_count = 0
    max_steps = 225

    while step_count < max_steps:
        step_count += 1
        is_black = (curr_player == BLACK)
        curr_name = black_name if is_black else white_name
        stone_symbol = "X (Đen)" if is_black else "O (Trắng)"

        print(f"\n>>> [Lượt {step_count}]: Đến lượt {curr_name} cầm quân {stone_symbol}")

        # Determine move
        t0 = time.time()
        move = None

        if "Người chơi" in curr_name:
            while True:
                try:
                    user_input = input("  Nhập nước đi (ví dụ: 'H8' hoặc '7 7', gõ 'q' để thoát): ").strip()
                    if user_input.lower() in ['q', 'exit', 'quit']:
                        print("\nĐã hủy trận đấu.")
                        return
                    coord = parse_coordinate(user_input)
                    if coord is None:
                        print("  [!] Tọa độ không hợp lệ. Hãy nhập ví dụ 'H8' hoặc '7 7'.")
                        continue
                    r, c = coord
                    if game.board[r][c] != EMPTY:
                        print(f"  [!] Ô ({COL_LABELS[c]}{r+1}) đã có quân cờ rồi! Hãy chọn ô khác.")
                        continue
                    move = (r, c)
                    eval_info = f"Người chơi đi {COL_LABELS[c]}{r+1}"
                    break
                except (KeyboardInterrupt, EOFError):
                    print("\nĐã hủy trận đấu.")
                    return
        elif "AlphaZero MCTS" in curr_name:
            print(f"  AlphaZero MCTS đang tính toán sâu ({mcts_sims} mô phỏng trên cây)...")
            (r, c), top_cands, q_val = mcts.get_best_move(game, curr_player, temperature=0.0)
            move = (r, c)
            elapsed = (time.time() - t0) * 1000
            top_str = ", ".join([f"{COL_LABELS[cand['move'][1]]}{cand['move'][0]+1}: N={cand['visits']}(Q={cand['q_value']:+.2f})" for cand in top_cands])
            eval_info = f"MCTS Q={q_val:+.3f} | Top: [{top_str}] | Tính trong {elapsed:.1f}ms"
            if "Người chơi" not in black_name or "Người chơi" not in white_name:
                time.sleep(delay)
        elif "ResNet AI Pure" in curr_name:
            print("  AI ResNet (Pure Policy) đang phản xạ trực giác...")
            r, c, top3, val = get_resnet_action(model, game, curr_player, device)
            move = (r, c)
            elapsed = (time.time() - t0) * 1000
            top_str = ", ".join([f"{COL_LABELS[tc]}{tr+1}: {p:.1f}%" for tr, tc, p in top3])
            eval_info = f"ResNet V={val:+.3f} | Top: [{top_str}] | Tính trong {elapsed:.1f}ms"
            if "Người chơi" not in black_name or "Người chơi" not in white_name:
                time.sleep(delay)
        else: # Heuristic Bot
            print("  Heuristic Bot đang duyệt cây Alpha-Beta...")
            r, c, score = get_heuristic_action(game, curr_player, cfg_name="OPTIMAL", depth=2)
            move = (r, c)
            elapsed = (time.time() - t0) * 1000
            eval_info = f"Heuristic Score={score:+,d} | Tính trong {elapsed:.1f}ms"
            if "Người chơi" not in black_name or "Người chơi" not in white_name:
                time.sleep(delay)

        # Apply move
        r, c = move
        game.place(r, c, curr_player)
        last_move = (r, c)

        # Re-render
        print_board(game, last_move, eval_info)

        # Check win
        if game.check_win(r, c):
            print("\n" + "=" * 68)
            print(f"  🎉 CHIẾN THẮNG TUYỆT ĐỐI! {curr_name} ĐÃ THẮNG VỚI 5 QUÂN LIỀN HÀNG!")
            print(f"  Tổng số nước đi: {step_count}")
            print("=" * 68)
            return

        # Check draw
        if game.occupied_count == 225:
            print("\n" + "=" * 68)
            print("  HÒA CỜ! Bàn cờ 15x15 đã kín tất cả 225 ô mà không ai tạo được 5 quân.")
            print("=" * 68)
            return

        # Switch player
        curr_player = 3 - curr_player

def main():
    parser = argparse.ArgumentParser(description="Caro / Gomoku Interactive Arena")
    parser.add_argument("--mode", type=int, default=None, choices=[1, 2, 3, 4, 5, 6],
                        help="Game mode (1-6)")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay in seconds between bot moves in auto-watch modes")
    parser.add_argument("--sims", type=int, default=50, help="Number of MCTS simulations per move")
    args = parser.parse_args()

    # Load trained model
    ckpt_path = os.path.join(os.path.dirname(__file__), "checkpoints", "best_caro_resnet.pt")
    if not os.path.exists(ckpt_path):
        print(f"[!] Không tìm thấy checkpoint tại: {ckpt_path}")
        sys.exit(1)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Khởi tạo môi trường suy luận trên thiết bị: {device.type.upper()}...")
    checkpoint = torch.load(ckpt_path, map_location=device)
    model = DualHeadResNet(num_blocks=6, num_channels=64).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    print("[*] Tải mô hình ResNet-6 thành công!")

    if args.mode is not None:
        play_game(args.mode, model, device, delay=args.delay, mcts_sims=args.sims)
        return

    # Interactive Menu
    while True:
        print("\n" + "=" * 68)
        print("          CARO INTERACTIVE ARENA - MENU CHÍNH (PHASE 3)")
        print("=" * 68)
        print("  1. Người (Đen) vs AI ResNet Pure (Trực giác nhanh không duyệt)")
        print("  2. Người (Đen) vs AlphaZero MCTS (Tính toán sâu bằng cây MCTS)")
        print("  3. AlphaZero MCTS (Đen) vs Người (Trắng)")
        print("  4. AlphaZero MCTS vs Bot Heuristic Alpha-Beta (Xem đấu đài tự động)")
        print("  5. AI ResNet Pure vs Bot Heuristic Alpha-Beta (Xem đấu tự động)")
        print("  6. Người vs Bot Heuristic Alpha-Beta")
        print("  7. Thoát")
        print("=" * 68)
        choice = input("  Chọn chế độ (1-7): ").strip()

        if choice in ['1', '2', '3', '4', '5', '6']:
            play_game(int(choice), model, device, delay=args.delay, mcts_sims=args.sims)
            input("\nNhấn Enter để quay lại Menu chính...")
        elif choice == '7':
            print("Tạm biệt!")
            break
        else:
            print("Lựa chọn không hợp lệ. Vui lòng nhập từ 1 đến 7.")

if __name__ == "__main__":
    main()
