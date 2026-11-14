---
title: "Kỹ thuật Sinh Nước đi Tiềm năng (Candidate Move Generation)"
week: 7
tags:
  - tuan-7
  - candidate-moves
  - branching-factor
  - optimization
---

# 🎯 KỸ THUẬT SINH NƯỚC ĐI TIỀM NĂNG (CANDIDATE MOVE GENERATION)

Trong Cờ Caro, một nước đi nằm cách xa mọi quân cờ hiện hữu từ 3 ô trở lên hoàn toàn không mang lại bất kỳ giá trị chiến thuật nào (không thể kết nối chuỗi hay chặn đối thủ). Do đó, kỹ thuật **Candidate Move Generation** lọc bỏ ngay từ đầu các ô vô nghĩa này.

---

## 1. NGUYÊN LÝ BÁN KÍNH LÂN CẬN (NEIGHBORHOOD RADIUS)

```text
.  .  .  .  .  .  .
.  +  +  +  +  +  .
.  +  *  *  *  +  .     * : Bán kính r = 1 (Lân cận trực tiếp)
.  +  *  X  *  +  .     + : Bán kính r = 2 (Lân cận mở rộng)
.  +  *  *  *  +  .     . : Ngoài tầm chiến thuật (Bỏ qua hoàn toàn)
.  +  +  +  +  +  .
.  .  .  .  .  .  .
```

* **Bán kính $r = 1$:** Gồm 8 ô tiếp giáp trực tiếp quanh quân cờ đã đánh. Phù hợp cho giai đoạn khai cuộc hoặc khi cần tốc độ tối đa.
* **Bán kính $r = 2$:** Gồm 24 ô bao quanh quân cờ. Đảm bảo bao quát được các nước nhảy cóc (Broken Three, Broken Four: ví dụ `X . X X`).

---

## 2. HIỆN THỰC HÓA THUẬT TOÁN (TYPESCRIPT)

```typescript
export function generateCandidateMoves(board: Board, radius: number = 2): Position[] {
  const candidates: Position[] = [];
  const visited = new Uint8Array(board.size * board.size);
  let hasPieces = false;

  for (let r = 0; r < board.size; r++) {
    for (let c = 0; c < board.size; c++) {
      if (!board.isEmpty(r, c)) {
        hasPieces = true;

        // Quét hình vuông kích thước (2*radius + 1) quanh ô đã có quân
        const rMin = Math.max(0, r - radius);
        const rMax = Math.min(board.size - 1, r + radius);
        const cMin = Math.max(0, c - radius);
        const cMax = Math.min(board.size - 1, c + radius);

        for (let nr = rMin; nr <= rMax; nr++) {
          for (let nc = cMin; nc <= cMax; nc++) {
            const idx = nr * board.size + nc;
            if (visited[idx] === 0 && board.isEmpty(nr, nc)) {
              visited[idx] = 1;
              candidates.push({ row: nr, col: nc });
            }
          }
        }
      }
    }
  }

  // Nếu bàn cờ hoàn toàn rỗng (nước đầu tiên của trận đấu)
  if (!hasPieces) {
    const center = Math.floor(board.size / 2);
    return [{ row: center, col: center }];
  }

  return candidates;
}
```

---

## 3. TÁC ĐỘNG TỚI KÍCH THƯỚC CÂY TRÒ CHƠI

* **Trước khi áp dụng:** Hệ số phân nhánh $b \approx 80 - 100$. Cây độ sâu $d = 3$ có $\approx 100^3 = 1,000,000$ trạng thái.
* **Sau khi áp dụng:** Hệ số phân nhánh $b$ giảm xuống chỉ còn $15 - 25$. Cây độ sâu $d = 3$ chỉ còn $\approx 20^3 = 8,000$ trạng thái!
* **Gia tốc:** Giúp thuật toán tìm kiếm chạy nhanh hơn từ **$50$ đến $100$ lần**!
