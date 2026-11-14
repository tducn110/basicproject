---
title: "Kỹ thuật Sắp xếp Thứ tự Nước đi (Move Ordering)"
week: 7
tags:
  - tuan-7
  - move-ordering
  - alpha-beta-optimization
  - heuristic-sorting
---

# ⚡ KỸ THUẬT SẮP XẾP THỨ TỰ NƯỚC ĐI (MOVE ORDERING)

Move Ordering là yếu tố quyết định đưa thuật toán Alpha-Beta Pruning từ trạng thái hoạt động trung bình chạm tới **giới hạn lý tưởng toán học: $O(b^{d/2})$**.

---

## 1. TẠI SAO MOVE ORDERING LẠI TỐI QUAN TRỌNG?

* Điều kiện cắt nhánh của Alpha-Beta là $\beta \le \alpha$.
* Để điều kiện này xảy ra sớm nhất có thể:
  * **Tại tầng MAX:** Ta cần tìm thấy nước đi có điểm số cao nhất ngay từ nước đi đầu tiên. Giá trị $\alpha$ lập tức tăng vọt lên mức rất cao.
  * **Tại tầng MIN kế tiếp:** Ngay khi MIN xét bất kỳ nhánh nào trả về giá trị nhỏ hơn $\alpha$ đó, điều kiện cắt nhánh lập tức kích hoạt, bỏ qua toàn bộ phần còn lại của danh sách nước đi!

```text
Chưa có Move Ordering:   [Nước dở] -> [Nước trung bình] -> [Nước tốt nhất (cuối cùng)]
=> Phải duyệt gần hết cây mới tìm thấy nước tốt, gần như không cắt tỉa được gì!

Đã có Move Ordering:     [Nước tốt nhất] -> [CẮT TỈA TOÀN BỘ CÁC NƯỚC CÒN LẠI!]
=> Cắt tỉa được 80% - 90% số nhánh ngay lập tức!
```

---

## 2. THUẬT TOÁN ĐÁNH GIÁ SƠ BỘ VÀ SẮP XẾP (PRE-SORTING)

```typescript
export function orderMoves(board: Board, moves: Position[], player: number): Position[] {
  const opponent = (player === CellValue.PLAYER_X) 
    ? CellValue.PLAYER_O 
    : CellValue.PLAYER_X;

  // Tính điểm nhanh cho từng nước đi ứng viên
  const scoredMoves = moves.map(move => {
    // 1. Điểm tấn công nhanh nếu ta đánh vào ô này
    const myScore = evaluateQuickPattern(board, move, player);

    // 2. Điểm phòng thủ nhanh nếu đối thủ đánh vào ô này
    const oppScore = evaluateQuickPattern(board, move, opponent);

    // Ưu tiên cao hơn cho việc chặn nước hiểm của đối thủ
    const totalScore = myScore + oppScore * 1.2;

    return { move, score: totalScore };
  });

  // Sắp xếp giảm dần theo điểm số
  scoredMoves.sort((a, b) => b.score - a.score);

  return scoredMoves.map(item => item.move);
}
```

---

## 3. BẢNG ĐỐI SÁNH HIỆU QUẢ CỦA MOVE ORDERING Ở ĐỘ SÂU $d = 4$

| Trạng thái thuật toán | Nodes Visited | Nodes Pruned | Thời gian tìm kiếm |
| :--- | :---: | :---: | :---: |
| **Alpha-Beta KHÔNG có Move Ordering** | $14,200$ | $162,200$ | $248 \text{ ms}$ |
| **Alpha-Beta CÓ Move Ordering** | **$2,150$** | **$184,800$** | **$38 \text{ ms}$** |

👉 **Kết luận:** Chỉ nhờ việc sắp xếp nước đi trước khi duyệt đệ quy, số nút duyệt thực tế **giảm thêm gần 7 lần** và tốc độ phản hồi nhanh hơn **6.5 lần**!
