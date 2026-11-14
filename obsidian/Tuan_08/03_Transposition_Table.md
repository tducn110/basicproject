---
title: "Kỹ thuật Bảng chuyển vị (Transposition Table - TT)"
week: 8
tags:
  - tuan-8
  - transposition-table
  - cache
  - alpha-beta-pruning
  - dynamic-programming
---

# 🗄️ KỸ THUẬT BẢNG CHUYỂN VỊ (TRANSPOSITION TABLE - TT)

Bảng chuyển vị là một bộ nhớ đệm (Cache) dạng bảng băm lưu trữ kết quả tính toán của các trạng thái bàn cờ, áp dụng nguyên lý Quy hoạch động (Dynamic Programming) vào cây tìm kiếm đối kháng.

---

## 1. HIỆN TƯỢNG CHUYỂN VỊ (TRANSPOSITION) TRONG CỜ CARO

Một bàn cờ có thể đạt tới cùng một trạng thái thông qua các thứ tự nước đi khác nhau:
* **Thứ tự 1:** Đen đánh $(5, 5) \to$ Trắng đánh $(5, 6) \to$ Đen đánh $(6, 6)$.
* **Thứ tự 2:** Đen đánh $(6, 6) \to$ Trắng đánh $(5, 6) \to$ Đen đánh $(5, 5)$.

Dù thứ tự đánh khác nhau, **cấu hình bàn cờ là đồng nhất 100%**. Nếu không có bộ nhớ đệm, thuật toán tìm kiếm sẽ duyệt lại toàn bộ cây con bên dưới hàng chục ngàn nút, gây lãng phí năng lực tính toán trầm trọng!

---

## 2. CẤU TRÚC BẢN GHI (TRANSPOSITION ENTRY)

```typescript
export enum TTFlag {
  EXACT = 0,       // Điểm số chính xác (alpha < score < beta)
  LOWER_BOUND = 1, // Gây ra Beta Cutoff (score >= beta)
  UPPER_BOUND = 2, // Thất bại thấp (score <= alpha)
}

export interface TTEntry {
  hash: bigint;        // Mã băm Zobrist để kiểm tra va chạm
  depth: number;       // Độ sâu đã được tính toán
  score: number;       // Điểm số lượng giá lưu lại
  flag: TTFlag;        // Loại biên giới hạn điểm số
  bestMove?: Position; // Nước đi tốt nhất tìm thấy (Principle Variation)
}
```

---

## 3. TÍCH HỢP TT VÀO ALPHA-BETA SEARCH

```typescript
// 1. TRA CỨU BẢNG CHUYỂN VỊ TẠI ĐẦU HÀM SEARCH
const entry = this.transpositionTable.get(boardHash);
if (entry && entry.depth >= depth) {
  if (entry.flag === TTFlag.EXACT) {
    return entry.score; // Trả về kết quả tức thì O(1)!
  } else if (entry.flag === TTFlag.LOWER_BOUND) {
    alpha = Math.max(alpha, entry.score);
  } else if (entry.flag === TTFlag.UPPER_BOUND) {
    beta = Math.min(beta, entry.score);
  }
  if (alpha >= beta) {
    return entry.score; // Cắt tỉa ngay lập tức!
  }
}

// 2. LƯU LẠI KẾT QUẢ VÀO BẢNG CHUYỂN VỊ TRƯỚC KHI RETURN
let flag = TTFlag.EXACT;
if (bestScore <= originalAlpha) {
  flag = TTFlag.UPPER_BOUND;
} else if (bestScore >= beta) {
  flag = TTFlag.LOWER_BOUND;
}

this.transpositionTable.set(boardHash, {
  hash: boardHash,
  depth: depth,
  score: bestScore,
  flag: flag,
  bestMove: bestMoveForThisState,
});
```

---

## 4. HIỆU QUẢ THỰC TẾ

* Giảm số lượng nút duyệt thực tế thêm **$30\% - 50\%$**.
* Cung cấp ngay lập tức nước đi tốt nhất (`entry.bestMove`) để đưa lên đầu danh sách Move Ordering cho các lần duyệt sâu hơn.
