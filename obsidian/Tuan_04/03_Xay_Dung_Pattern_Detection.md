---
title: "Xây dựng Thuật toán Nhận diện Thế cờ (Pattern Detection)"
week: 4
tags:
  - tuan-4
  - pattern-detection
  - algorithms
  - string-matching
  - caro-patterns
---

# 🔍 XÂY DỰNG THUẬT TOÁN NHẬN DIỆN THẾ CỜ (PATTERN DETECTION)

Thuật toán nhận diện thế cờ (Pattern Detection) là "đôi mắt" của AI, có nhiệm vụ quét bàn cờ, trích xuất các chuỗi quân theo 4 hướng và phân loại chúng vào danh mục các mẫu hình chiến thuật chuẩn xác.

---

## 1. BẢNG DANH MỤC CÁC MẪU THẾ CỜ KINH ĐIỂN (PATTERN CATALOG)

Quy ước ký hiệu:
* `X`: Quân cờ của người chơi đang xét.
* `_` hoặc `.`: Ô trống hợp lệ có thể đi.
* `O`: Quân của đối thủ hoặc biên ngoài bàn cờ.

| Tên mẫu hình | Cấu hình biểu diễn chuỗi | Mức độ nguy hiểm / Giá trị |
| :--- | :--- | :--- |
| **FIVE (Năm liên tiếp)** | `X X X X X` | **Thắng cuộc ngay lập tức** |
| **OPEN_FOUR (Bốn mở)** | `. X X X X .` | **Tất thắng** (Đối thủ không thể chặn cả 2 đầu trong 1 nước) |
| **BLOCKED_FOUR (Bốn chặn 1 đầu)** | `O X X X X .` hoặc `. X X X X O` | **Đe dọa chí mạng** (Bắt buộc phải chặn ngay) |
| **BROKEN_FOUR (Bốn ngắt quãng)** | `. X X . X X .` hoặc `. X . X X X .` | **Đe dọa chí mạng** (Tương đương Bốn chặn) |
| **OPEN_THREE (Ba mở)** | `. . X X X . .` hoặc `. X . X X .` | **Ưu thế cực lớn** (Nước sau tạo Bốn mở) |
| **BLOCKED_THREE (Ba chặn 1 đầu)** | `O X X X . .` hoặc `. . X X X O` | **Có tiềm năng phát triển** |
| **OPEN_TWO (Hai mở)** | `. . X X . .` hoặc `. X . X .` | **Giai đoạn xây dựng khai cuộc** |
| **DEAD_PATTERN (Mẫu chết)** | `O X X X X O` hoặc `O X X X O` | **Vô giá trị** (Đã bị chặn 2 đầu, không thể thắng) |

---

## 2. NGUYÊN LÝ TRÍCH XUẤT VECTOR 4 HƯỚNG VÀ TRƯỢT CỬA SỔ (SLIDING WINDOW)

Để nhận diện các mẫu này quanh một ô cờ $(r, c)$:
1. Với mỗi hướng trong 4 hướng (ngang, dọc, 2 đường chéo), trích xuất một dải gồm tối đa $9$ ô (lấy 4 ô về phía trước và 4 ô về phía sau điểm $(r, c)$).
2. Chuyển đổi dải ô này thành một chuỗi ký tự (String Representation), ví dụ: `"_XX_X_O"`.
3. Áp dụng kỹ thuật so khớp mẫu (Pattern Matching / Sliding Window) hoặc Bảng tra cứu mẫu (Pattern Lookup Table) để định danh loại thế cờ.

```typescript
export enum PatternType {
  FIVE = 'FIVE',
  OPEN_FOUR = 'OPEN_FOUR',
  BLOCKED_FOUR = 'BLOCKED_FOUR',
  OPEN_THREE = 'OPEN_THREE',
  BLOCKED_THREE = 'BLOCKED_THREE',
  OPEN_TWO = 'OPEN_TWO',
  NONE = 'NONE',
}

export class PatternDetector {
  /**
   * Phân loại chuỗi 5 - 6 ô liên tiếp
   */
  public static matchPattern(segment: string, isCaroVn: boolean = true): PatternType {
    // 1. Kiểm tra Năm quân
    if (segment.includes('XXXXX')) {
      if (isCaroVn && segment.includes('OXXXXXO')) {
        return PatternType.NONE; // Chặn 2 đầu không thắng
      }
      return PatternType.FIVE;
    }

    // 2. Bốn mở
    if (segment.includes('.XXXX.')) {
      return PatternType.OPEN_FOUR;
    }

    // 3. Bốn chặn 1 đầu / Bốn ngắt quãng
    if (
      segment.includes('OXXXX.') || 
      segment.includes('.XXXXO') ||
      segment.includes('.XXX.X.') ||
      segment.includes('.XX.XX.')
    ) {
      return PatternType.BLOCKED_FOUR;
    }

    // 4. Ba mở
    if (segment.includes('.XXX.') || segment.includes('.XX.X.')) {
      return PatternType.OPEN_THREE;
    }

    // 5. Ba chặn 1 đầu
    if (segment.includes('OXXX..') || segment.includes('..XXXO')) {
      return PatternType.BLOCKED_THREE;
    }

    // 6. Hai mở
    if (segment.includes('.XX.') || segment.includes('.X.X.')) {
      return PatternType.OPEN_TWO;
    }

    return PatternType.NONE;
  }
}
```

---

## 3. TỐI ƯU HÓA BẰNG BẢNG TRA CỨU MÃ SỐ (INDEX LOOKUP TABLE)

Thay vì thao tác chuỗi (String comparison) chậm chạp khi duyệt hàng ngàn nút:
* Mã hóa mỗi ô cờ bằng 2 bit: `00` (Trống), `01` (Quân ta), `10` (Quân địch), `11` (Ngoài biên).
* Một chuỗi 9 ô cờ được biểu diễn gọn gàng trong một số nguyên 18-bit:
  $$\text{Key} \in [0, 2^{18} - 1] = [0, 262,143]$$
* Tạo sẵn một mảng tĩnh `const PATTERN_TABLE = new Uint8Array(262144);`.
* Việc tra cứu thế cờ từ đó đạt tốc độ $O(1)$ chỉ bằng một phép truy xuất mảng tức thì!
