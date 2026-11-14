---
title: "Xây dựng Hàm Lượng giá Heuristic (Heuristic Evaluation)"
week: 4
tags:
  - tuan-4
  - heuristic-evaluation
  - scoring
  - ai-algorithm
  - positional-weights
---

# 📊 XÂY DỰNG HÀM LƯỢNG GIÁ HEURISTIC (HEURISTIC EVALUATION)

Hàm lượng giá Heuristic là trái tim tính toán của AI Bot, có nhiệm vụ lượng hóa một trạng thái bàn cờ phức tạp thành một giá trị số thực đại diện cho mức độ lợi thế của người chơi.

---

## 1. MÔ HÌNH TOÁN HỌC CỦA HÀM LƯỢNG GIÁ

Điểm số lượng giá của một trạng thái bàn cờ $s$ đối với người chơi $P$ được định nghĩa bằng:

$$f(s, P) = \text{Score}_{\text{Attack}}(s, P) + \lambda \cdot \text{Score}_{\text{Defense}}(s, P) + \text{Score}_{\text{Position}}(s, P)$$

Trong đó:
* $\text{Score}_{\text{Attack}}$: Tổng điểm của các thế cờ tiềm năng mà quân ta đang nắm giữ.
* $\text{Score}_{\text{Defense}}$: Điểm số đo lường mức độ triệt tiêu các đe dọa từ phía đối thủ (hệ số $\lambda \approx 1.1 \sim 1.2$ nhằm ưu tiên sự an toàn, không để bị sơ hở đòn hiểm).
* $\text{Score}_{\text{Position}}$: Điểm cộng dồn dựa trên vị trí chiến lược của các quân cờ (ưu tiên khu vực trung tâm).

---

## 2. BẢNG TRỌNG SỐ THẾ CỜ CHUẨN MỰC (SCORING TABLE)

| Thế cờ (Pattern) | Điểm Tấn Công ($W_{\text{atk}}$) | Điểm Phòng Thủ ($W_{\text{def}}$) | Ý nghĩa chiến lược |
| :--- | :--- | :--- | :--- |
| **FIVE (5 quân)** | $100,000$ | $100,000$ | Thắng ngay lập tức / Ngăn đối thủ thắng |
| **OPEN_FOUR (4 mở)** | $10,000$ | $12,000$ | Tất thắng nếu có / Chặn ngay nếu đối thủ có |
| **BLOCKED_FOUR (4 chặn 1)** | $1,000$ | $1,500$ | Nước cờ ép đối phương phải đỡ |
| **OPEN_THREE (3 mở)** | $500$ | $700$ | Nguy hiểm cao (nước sau thành 4 mở) |
| **BLOCKED_THREE (3 chặn 1)** | $100$ | $150$ | Thế trận trung bình |
| **OPEN_TWO (2 mở)** | $50$ | $60$ | Thế trận chuẩn bị khai cuộc |
| **BLOCKED_TWO (2 chặn 1)** | $10$ | $10$ | Điểm hỗ trợ nhẹ |

---

## 3. MA TRẬN TRỌNG SỐ VỊ TRÍ (POSITIONAL WEIGHT MATRIX)

Khu vực trung tâm bàn cờ luôn nắm giữ giá trị kiểm soát vượt trội vì từ tâm, các quân cờ có thể vươn dài theo cả 8 hướng tối đa:

```typescript
// Ma trận trọng số vị trí cho bàn cờ 10x10
export const POSITION_WEIGHTS_10X10: number[][] = [
  [0, 1, 1, 1,  1,  1, 1, 1, 1, 0],
  [1, 2, 2, 2,  2,  2, 2, 2, 2, 1],
  [1, 2, 3, 4,  4,  4, 4, 3, 2, 1],
  [1, 2, 4, 6,  7,  7, 6, 4, 2, 1],
  [1, 2, 4, 7, 10, 10, 7, 4, 2, 1],
  [1, 2, 4, 7, 10, 10, 7, 4, 2, 1],
  [1, 2, 4, 6,  7,  7, 6, 4, 2, 1],
  [1, 2, 3, 4,  4,  4, 4, 3, 2, 1],
  [1, 2, 2, 2,  2,  2, 2, 2, 2, 1],
  [0, 1, 1, 1,  1,  1, 1, 1, 1, 0],
];
```

---

## 4. THUẬT TOÁN CHỌN NƯỚC ĐI CỦA HEURISTIC BOT

Thay vì duyệt cây tìm kiếm sâu tiêu tốn thời gian, Heuristic Bot tính toán **điểm tiềm năng** của từng ô trống ứng viên:
1. Với mỗi ô trống $(r, c)$:
   * Giả lập ta đánh vào $(r, c)$: Tính điểm thế cờ tăng thêm $\Delta \text{Attack}$.
   * Giả lập đối thủ đánh vào $(r, c)$: Tính điểm thế cờ tăng thêm $\Delta \text{Defense}$.
   * Cộng điểm vị trí: $\text{Total}(r, c) = \Delta \text{Attack} + 1.2 \times \Delta \text{Defense} + \text{PositionScore}(r, c)$.
2. Nước đi có $\text{Total}(r, c)$ cao nhất chính là nước đi tối ưu được Bot lựa chọn.

```typescript
export class HeuristicBot implements BotAgent {
  public readonly name = "Heuristic Bot (Mức Khó)";

  public async selectMove(board: Board, myPlayer: number): Promise<Position | null> {
    const opponent = (myPlayer === CellValue.PLAYER_X) 
      ? CellValue.PLAYER_O 
      : CellValue.PLAYER_X;
      
    const candidates = this.getCandidateMoves(board);
    if (candidates.length === 0) {
      return { row: Math.floor(board.size / 2), col: Math.floor(board.size / 2) };
    }

    let bestScore = -Infinity;
    let bestMove: Position = candidates[0];

    for (const move of candidates) {
      const attackScore = this.evaluateMoveValue(board, move, myPlayer);
      const defenseScore = this.evaluateMoveValue(board, move, opponent);
      const positionScore = POSITION_WEIGHTS_10X10[move.row][move.col] || 0;

      const totalScore = attackScore + defenseScore * 1.2 + positionScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMove = move;
      }
    }

    return bestMove;
  }
}
```

---

## 5. TỔNG KẾT ĐẶC TÍNH VÀ TIỀM NĂNG MỞ RỘNG

* **Tốc độ:** Thuật toán phản hồi trong khoảng $15 - 40 \text{ ms}$, đạt chuẩn thời gian thực (Real-time).
* **Độ chuẩn xác:** Chơi chắc chắn, nhận diện tốt các đòn ép nước và luôn ưu tiên khóa các chuỗi đe dọa của đối phương.
* **Mở rộng tiếp theo:** Hàm Heuristic này chính là nền tảng trực tiếp để cắm vào thuật toán **Minimax / Alpha-Beta Pruning** ở các giai đoạn nâng cao sau này.
