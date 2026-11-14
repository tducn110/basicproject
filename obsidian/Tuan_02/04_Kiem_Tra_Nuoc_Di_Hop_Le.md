---
title: "Kiểm tra Nước đi Hợp lệ (Move Validation)"
week: 2
tags:
  - tuan-2
  - validation
  - error-handling
  - game-rules
---

# 🛡️ KIỂM TRA NƯỚC ĐI HỢP LỆ (MOVE VALIDATION)

Kiểm tra nước đi hợp lệ là chốt chặn phòng thủ đầu tiên của Game Engine, đảm bảo tính toàn vẹn của bàn cờ và ngăn chặn các lỗi phát sinh do thao tác người dùng hoặc lỗi logic của AI.

---

## 1. CÁC ĐIỀU KIỆN KIỂM TRA (CHECKLIST)

Một nước đi tại tọa độ `(row, col)` chỉ được chấp thuận nếu vượt qua cả 4 điều kiện sau:

1. **Trạng thái ván cờ còn hoạt động (Game Active):**
   - Ván đấu phải đang ở trạng thái `READY` (chờ nước khai cuộc) hoặc `PLAYING` (đang chơi).
   - Nếu ván đấu đã kết thúc (`WON` hoặc `DRAW`), mọi nỗ lực đặt quân đều bị từ chối.
2. **Tọa độ nằm trong phạm vi bàn cờ (In-Bounds Check):**
   $$0 \le \text{row} < \text{BoardSize} \quad \text{và} \quad 0 \le \text{col} < \text{BoardSize}$$
3. **Ô cờ mục tiêu phải hoàn toàn trống (Empty Cell Check):**
   $$\text{board}[\text{row}][\text{col}] == \text{CellValue.EMPTY}$$
4. **Khóa lượt tính toán của AI (Turn Lock):**
   - Khi AI Bot đang trong quá trình tính toán nước đi (hoặc trong khoảng trễ giả lập hiệu ứng suy nghĩ), người dùng không thể can thiệp bằng cách bấm thêm nước cờ khác.

---

## 2. HIỆN THỰC HÓA MÃ NGUỒN

```typescript
export enum MoveValidationError {
  NONE = 'NONE',
  GAME_ALREADY_FINISHED = 'GAME_ALREADY_FINISHED',
  OUT_OF_BOUNDS = 'OUT_OF_BOUNDS',
  CELL_OCCUPIED = 'CELL_OCCUPIED',
  NOT_PLAYER_TURN = 'NOT_PLAYER_TURN',
}

export interface ValidationResult {
  valid: boolean;
  error: MoveValidationError;
}

public validateMove(row: number, col: number): ValidationResult {
  // 1. Kiểm tra trạng thái game
  if (this.status === GameStatus.WON || this.status === GameStatus.DRAW) {
    return { valid: false, error: MoveValidationError.GAME_ALREADY_FINISHED };
  }

  // 2. Kiểm tra biên
  if (!this.board.isInside(row, col)) {
    return { valid: false, error: MoveValidationError.OUT_OF_BOUNDS };
  }

  // 3. Kiểm tra ô đã có quân chưa
  if (!this.board.isEmpty(row, col)) {
    return { valid: false, error: MoveValidationError.CELL_OCCUPIED };
  }

  return { valid: true, error: MoveValidationError.NONE };
}

public isValidMove(row: number, col: number): boolean {
  return this.validateMove(row, col).valid;
}
```

---

## 3. Ý NGHĨA TRONG VIỆC TỐI ƯU HÓA AI (LEGAL MOVES GENERATOR)

Khi AI Bot cần tìm kiếm tất cả các nước đi hợp lệ hiện có trên bàn cờ, thay vì gọi `isValidMove` ngẫu nhiên nhiều lần, Game Engine cung cấp hàm sinh nước đi hợp lệ chuyên dụng:
```typescript
public getAvailableMoves(): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < this.board.size; r++) {
    for (let c = 0; c < this.board.size; c++) {
      if (this.board.isEmpty(r, c)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}
```
*Đối với cấp độ nâng cao (Tuần 4), hàm này sẽ được nâng cấp chỉ sinh các ô trống lân cận quân đã đánh để giảm hệ số phân nhánh.*
