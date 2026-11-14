---
title: "Xây dựng Random Bot (Baseline Agent)"
week: 4
tags:
  - tuan-4
  - ai-bot
  - random-bot
  - baseline
  - benchmark
---

# 🎲 XÂY DỰNG RANDOM BOT (BASELINE AGENT)

Tài liệu này đặc tả thuật toán và phương pháp hiện thực hóa Random Bot — đại diện cho mức độ trí tuệ nhân tạo cơ bản nhất, đóng vai trò là mốc chuẩn đối sánh (Baseline) cho toàn bộ dự án.

---

## 1. VAI TRÒ HỌC THUẬT CỦA RANDOM BOT

Trong nghiên cứu Trí tuệ nhân tạo và Lý thuyết trò chơi:
* **Không thể đánh giá một thuật toán AI là "tốt" nếu không có mốc so sánh.**
* Random Bot đóng vai trò làm mẫu đối chứng (Control Group):
  * Mọi thuật toán AI nâng cấp (Rule-Based, Heuristic, Minimax) **bắt buộc phải đạt tỷ lệ thắng áp đảo ($> 95\%$)** khi đối đầu với Random Bot.
  * Nếu một thuật toán phức tạp mà để thua Random Bot, điều đó chứng tỏ hàm đánh giá hoặc cây tìm kiếm đã gặp lỗi nghiêm trọng (Bug logic hoặc đánh giá ngược dấu).

---

## 2. HIỆN THỰC HÓA MÃ NGUỒN (TYPESCRIPT)

```typescript
export interface BotAgent {
  name: string;
  selectMove(board: Board, player: number): Promise<Position | null>;
}

export class RandomBot implements BotAgent {
  public readonly name = "Random Bot (Mức Dễ)";
  private thinkingDelayMs: number;

  constructor(thinkingDelayMs: number = 300) {
    this.thinkingDelayMs = thinkingDelayMs;
  }

  public async selectMove(board: Board, player: number): Promise<Position | null> {
    // 1. Quét tìm tất cả các ô còn trống trên bàn cờ
    const availableMoves: Position[] = [];
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (board.isEmpty(r, c)) {
          availableMoves.push({ row: r, col: c });
        }
      }
    }

    // Nếu bàn cờ đã đầy
    if (availableMoves.length === 0) {
      return null;
    }

    // 2. Tạo hiệu ứng trễ nhẹ giả lập suy nghĩ (UX)
    if (this.thinkingDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.thinkingDelayMs));
    }

    // 3. Chọn ngẫu nhiên đồng đều (Uniform Random Distribution)
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }
}
```

---

## 3. PHÂN TÍCH ĐỘ PHỨC TẠP THUẬT TOÁN

* **Thời gian (Time Complexity):** 
  $$O(N^2)$$
  Do chỉ cần 1 vòng lặp duyệt qua ma trận kích thước $N \times N$ để thu thập các ô trống. Với $N = 10$, thời gian thực thi chỉ mất chưa đầy $0.05 \text{ ms}$.
* **Không gian bộ nhớ (Space Complexity):** 
  $$O(N^2)$$
  Để lưu trữ danh sách tối đa 100 tọa độ ô trống trong mảng `availableMoves`.
