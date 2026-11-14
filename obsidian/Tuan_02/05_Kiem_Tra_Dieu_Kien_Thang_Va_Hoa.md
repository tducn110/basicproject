---
title: "Kiểm tra Điều kiện Thắng và Hòa (Win & Draw Check)"
week: 2
tags:
  - tuan-2
  - win-detection
  - algorithm
  - directional-scan
  - caro-vietnam
---

# 🏆 KIỂM TRA ĐIỀU KIỆN THẮNG VÀ HÒA (WIN & DRAW CHECK)

Tài liệu này trình bày chi tiết thuật toán quét tia 4 hướng cục bộ (Local Directional Scan) đạt độ phức tạp $O(1)$, hỗ trợ chuyển đổi linh hoạt giữa luật Gomoku tự do và luật Cờ Caro Việt Nam (chặn 2 đầu).

---

## 1. NGUYÊN LÝ THUẬT TOÁN QUÉT CỤC BỘ TẠI NƯỚC VỪA ĐÁNH

Thay vì quét lại toàn bộ bàn cờ $N \times N$ sau mỗi nước đi (rất chậm và tốn tài nguyên), một ván cờ chỉ có thể thay đổi kết quả thắng/thua tại chính vị trí quân cờ vừa được đặt tại tọa độ $(r, c)$.

Ta chỉ cần kiểm tra **4 trục hướng** đi qua điểm $(r, c)$:

```text
    \   |   /
     \  |  /
  ---- (r, c) ----
     /  |  \
    /   |   \
```

* **Trục Ngang (Horizontal):** Vector $(0, 1)$ và $(0, -1)$.
* **Trục Dọc (Vertical):** Vector $(1, 0)$ và $(-1, 0)$.
* **Trục Chéo chính (Diagonal \ ):** Vector $(1, 1)$ và $(-1, -1)$.
* **Trục Chéo phụ (Anti-Diagonal / ):** Vector $(1, -1)$ và $(-1, 1)$.

Tại mỗi trục, ta "bắn tia" sang 2 phía ngược chiều nhau, đếm số lượng quân liên tiếp cùng màu với người vừa đánh, đồng thời ghi nhận trạng thái của 2 ô chặn ở 2 đầu mút.

---

## 2. THUẬT TOÁN VÀ XỬ LÝ LUẬT CHẶN 2 ĐẦU (TYPESCRIPT)

```typescript
export interface WinCheckResult {
  hasWon: boolean;
  winningLine: Position[];
  direction?: 'HORIZONTAL' | 'VERTICAL' | 'DIAGONAL' | 'ANTI_DIAGONAL';
}

public checkWin(lastRow: number, lastCol: number): WinCheckResult {
  const player = this.board.get(lastRow, lastCol);
  if (!player || player === CellValue.EMPTY) {
    return { hasWon: false, winningLine: [] };
  }

  const opponent = (player === CellValue.PLAYER_X) 
    ? CellValue.PLAYER_O 
    : CellValue.PLAYER_X;

  // 4 cặp vector hướng
  const directions = [
    { dr: 0, dc: 1, name: 'HORIZONTAL' as const },
    { dr: 1, dc: 0, name: 'VERTICAL' as const },
    { dr: 1, dc: 1, name: 'DIAGONAL' as const },
    { dr: 1, dc: -1, name: 'ANTI_DIAGONAL' as const },
  ];

  for (const { dr, dc, name } of directions) {
    const line: Position[] = [{ row: lastRow, col: lastCol }];

    // 1. Quét theo chiều dương (+dr, +dc)
    let r = lastRow + dr;
    let c = lastCol + dc;
    while (this.board.isInside(r, c) && this.board.get(r, c) === player) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }
    // Ghi nhận ô chặn đầu 1
    const end1IsBlocked = !this.board.isInside(r, c) || this.board.get(r, c) === opponent;

    // 2. Quét theo chiều âm (-dr, -dc)
    r = lastRow - dr;
    c = lastCol - dc;
    while (this.board.isInside(r, c) && this.board.get(r, c) === player) {
      line.unshift({ row: r, col: c }); // Thêm vào đầu mảng
      r -= dr;
      c -= dc;
    }
    // Ghi nhận ô chặn đầu 2
    const end2IsBlocked = !this.board.isInside(r, c) || this.board.get(r, c) === opponent;

    // 3. Đánh giá điều kiện thắng
    const count = line.length;

    if (count >= 5) {
      if (this.rules.mode === 'GOMOKU_FREESTYLE') {
        // Luật Gomoku tự do: Đủ 5 quân trở lên là thắng tuyệt đối
        return { hasWon: true, winningLine: line, direction: name };
      } 
      else if (this.rules.mode === 'CARO_VIETNAM_BLOCK_2') {
        // Luật Caro Việt Nam: Chỉ thắng nếu KHÔNG bị chặn cả 2 đầu
        const blockedBothEnds = end1IsBlocked && end2IsBlocked;
        if (!blockedBothEnds) {
          return { hasWon: true, winningLine: line, direction: name };
        }
        // Nếu bị chặn cả 2 đầu: Bỏ qua trục này, tiếp tục kiểm tra trục khác
      }
    }
  }

  return { hasWon: false, winningLine: [] };
}
```

---

## 3. KIỂM TRA ĐIỀU KIỆN HÒA (DRAW DETECTION)

Một ván đấu được công nhận là Hòa khi thỏa mãn đồng thời 2 điều kiện:
1. Nước đi vừa đánh **không tạo ra bất kỳ chuỗi thắng nào** (`checkWin(r, c).hasWon === false`).
2. **Không còn bất kỳ ô trống nào** trên toàn bộ bàn cờ:
   $$\text{moveHistory.length} == \text{BoardSize} \times \text{BoardSize}$$

Trong tương lai (nâng cao), có thể bổ sung thuật toán phát hiện hòa sớm (Early Draw Detection): khi số lượng quân cờ trên bàn đủ lớn và không một người chơi nào còn bất kỳ hàng 5 tiềm năng nào chưa bị chặn.
