---
title: "Kỹ thuật Bảng băm Zobrist Hashing"
week: 8
tags:
  - tuan-8
  - zobrist-hashing
  - transposition-table
  - bitwise-xor
  - hash-collision
---

# 🔑 KỸ THUẬT BẢNG BĂM ZOBRIST HASHING

Zobrist Hashing (được phát minh bởi Albert Zobrist năm 1970) là phương pháp băm trạng thái bàn cờ chuẩn mực trong cờ vua và cờ Caro, cho phép tạo ra chữ ký số 64-bit duy nhất cho mỗi trạng thái bàn cờ với độ phức tạp $O(1)$.

---

## 1. NGUYÊN LÝ TOÁN HỌC VÀ TÍNH CHẤT CỦA PHÉP TOÁN XOR ($\oplus$)

Phép toán XOR có 3 tính chất quan trọng:
1. $A \oplus A = 0$ (Tự triệt tiêu).
2. $A \oplus 0 = A$ (Giữ nguyên).
3. $A \oplus B \oplus C = A \oplus C \oplus B$ (Giao hoán và kết hợp).

Nhờ các tính chất này:
* Khởi tạo trước một bảng các số ngẫu nhiên 64-bit:
  $$Z[\text{row}][\text{col}][\text{piece}] \quad (\text{với } \text{row}, \text{col} \in [0, N-1], \text{piece} \in \{1, 2\})$$
* Mã băm của bàn cờ là kết quả XOR của tất cả các quân cờ đang hiện diện trên bàn:
  $$\text{Hash}(S) = \bigoplus_{(r, c, p) \in S} Z[r][c][p]$$

---

## 2. CẬP NHẬT MÃ BĂM VỚI ĐỘ PHỨC TẠP $O(1)$

Mỗi khi một nước đi được thực hiện hoặc hoàn tác (Undo), ta không cần quét lại toàn bộ bàn cờ mà chỉ cần XOR đúng vị trí vừa thay đổi:

```typescript
export class ZobristHash {
  private table: bigint[][][];
  private currentHash: bigint = 0n;

  constructor(size: number) {
    this.table = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => [0n, this.randomBigInt64(), this.randomBigInt64()])
    );
  }

  private randomBigInt64(): bigint {
    const low = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
    const high = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
    return (high << 32n) | low;
  }

  /**
   * Cập nhật mã băm khi đặt hoặc rút quân cờ tại (row, col)
   */
  public updatePiece(row: number, col: number, player: number): bigint {
    this.currentHash ^= this.table[row][col][player];
    return this.currentHash;
  }

  public getHash(): bigint {
    return this.currentHash;
  }
}
```

---

## 3. KHẢ NĂNG VA CHẠM BĂM (COLLISION PROBABILITY)

Với không gian số nguyên không dấu 64-bit ($2^{64} \approx 1.84 \times 10^{19}$ giá trị), theo bài toán nghịch lý ngày sinh (Birthday Paradox):
* Cần duyệt tới $\approx \sqrt{2 \times 2^{64}} \approx 6 \times 10^9$ trạng thái bàn cờ khác nhau thì xác suất xảy ra 1 vụ va chạm băm mới đạt $50\%$.
* Trong một ván đấu Caro thông thường (duyệt vài triệu nút), tỷ lệ va chạm băm là gần như bằng $0$, đảm bảo tính an toàn tuyệt đối.
