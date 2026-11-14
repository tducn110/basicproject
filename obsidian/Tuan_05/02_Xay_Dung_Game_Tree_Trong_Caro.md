---
title: "Xây dựng Game Tree trong Cờ Caro"
week: 5
tags:
  - tuan-5
  - game-tree
  - recursion
  - backtracking
  - v8-optimization
---

# 🌲 XÂY DỰNG GAME TREE TRONG CỜ CARO

Tài liệu này phân tích cấu trúc cây trò chơi (Game Tree) trong Cờ Caro và kỹ thuật hiện thực hóa duyệt đệ quy hiệu năng cao thông qua cơ chế quay lui (Backtracking).

---

## 1. MÔ HÌNH CÂY TRÒ CHƠI DẠNG ĐỒ THỊ CÓ HƯỚNG

```mermaid
graph TD
    S0["Trạng thái hiện tại (Root - Lượt Bot MAX)"] --> S1["Đặt quân tại (5, 5)"]
    S0 --> S2["Đặt quân tại (5, 6)"]
    S0 --> S3["Đặt quân tại (6, 5)"]

    S1 --> S1_1["Đối thủ MIN đánh (4, 5)"]
    S1 --> S1_2["Đối thủ MIN đánh (5, 4)"]

    S2 --> S2_1["Đối thủ MIN đánh (5, 5)"]
    S2 --> S2_2["Đối thủ MIN đánh (6, 6)"]

    S1_1 --> Leaf1["Lá: Đánh giá Heuristic"]
    S1_2 --> Leaf2["Lá: Đánh giá Heuristic"]
    S2_1 --> Leaf3["Lá: Đánh giá Heuristic"]
    S2_2 --> Leaf4["Lá: Đánh giá Heuristic"]
```

---

## 2. KỸ THUẬT QUAY LUI TRÊN CÙNG MỘT MA TRẬN (IN-PLACE BACKTRACKING)

Trong lập trình Web bằng TypeScript / JavaScript, nếu mỗi khi đi xuống một nhánh cây ta lại sao chép toàn bộ bàn cờ (`board.clone()`), bộ nhớ heap sẽ bị phân mảnh và trình gom rác (Garbage Collector) sẽ làm gián đoạn luồng xử lý (GC Pause).

**Giải pháp tối ưu:** Chỉ sử dụng duy nhất một đối tượng `Board`, thực hiện đặt quân và hoàn tác ngay lập tức:

```typescript
// 1. Thử đi nước cờ (Apply Move)
board.set(move.row, move.col, player);

// 2. Gọi đệ quy duyệt nhánh sâu hơn
const score = this.search(board, depth - 1, ...);

// 3. Hoàn tác trạng thái như cũ (Undo / Backtrack)
board.set(move.row, move.col, CellValue.EMPTY);
```

Nhờ giải pháp này, chi phí cấp phát bộ nhớ cho mỗi bước duyệt cây giảm từ $O(N^2)$ xuống đúng $O(1)$, cho phép duyệt hàng chục ngàn nút mỗi giây mượt mà trên trình duyệt.
