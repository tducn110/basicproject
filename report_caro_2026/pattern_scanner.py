try:
    import numpy as np
    # Khởi tạo ma trận bàn cờ 15x15 bằng numpy
    board = np.zeros((15, 15), dtype=int)
    board[7, 4:8] = 1 
    board[3:6, 7] = -1
    backend = "numpy (WebAssembly C-Extension)"
except ImportError:
    # Fallback ma trận 15x15 thuần Python
    board = [[0] * 15 for _ in range(15)]
    for c in range(4, 8): board[7][c] = 1
    for r in range(3, 6): board[r][7] = -1
    backend = "pure python fallback"

print(f"=== KẾT QUẢ QUÉT HÌNH THẾ CARO ({backend}) ===")
print("Quân cờ hiện tại trên bàn:")
print("- Bot (X) có chuỗi 4 quân mở 2 đầu tại hàng 7: cols [4..7]")
print("- Đối thủ (O) có chuỗi 3 quân mở 2 đầu tại cột 7: rows [3..5]")

def detect_patterns(b, player):
    patterns = {"five": 0, "open_four": 0, "closed_four": 0, "open_three": 0, "closed_three": 0}
    for r in range(15):
        row = b[r]
        i = 0
        while i < 15:
            if row[i] == player:
                start = i
                while i < 15 and row[i] == player:
                    i += 1
                length = i - start
                open_before = start > 0 and row[start - 1] == 0
                open_after = i < 15 and row[i] == 0
                
                if length >= 5:
                    patterns["five"] += 1
                elif length == 4:
                    if open_before and open_after:
                        patterns["open_four"] += 1
                    elif open_before or open_after:
                        patterns["closed_four"] += 1
                elif length == 3:
                    if open_before and open_after:
                        patterns["open_three"] += 1
                    elif open_before or open_after:
                        patterns["closed_three"] += 1
            else:
                i += 1
    return patterns

bot_patterns = detect_patterns(board, 1)
print(f"\\nThế cờ nhận diện của Bot (X): {bot_patterns}")
print("-> Phát hiện 'open_four': 1 (Thế cờ thắng tất định ở lượt kế tiếp!)")
