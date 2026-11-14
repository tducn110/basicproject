---
title: "Xây dựng Board Matrix cho Game Caro"
week: 2
tags:
  - tuan-2
  - board-matrix
  - data-structure
  - typescript
---

# 🧱 XÂY DỰNG BOARD MATRIX CHO GAME CARO

Tài liệu này đặc tả thiết kế kỹ thuật, cấu trúc dữ liệu và các hàm thao tác cơ bản với ma trận bàn cờ (Board Matrix) trong Game Engine.

---

## 1. THIẾT KẾ CẤU TRÚC DỮ LIỆU

### 1.1. Các hằng số định danh (Constants)
```typescript
export const CellValue = {
  EMPTY: 0,
  PLAYER_X: 1, // Quân Đen / Người chơi 1
  PLAYER_O: 2, // Quân Trắng / Người chơi 2
} as const;

export type Cell = typeof CellValue[keyof typeof CellValue];
export type BoardMatrix = Cell[][];
```

### 1.2. Kích thước bàn cờ (Board Dimensions)
Mặc định hệ thống hỗ trợ 2 kích thước chuẩn:
* `DEFAULT_BOARD_SIZE = 10` (Bàn cờ $10 \times 10$ cho chế độ 10caro học thuật và di động).
* `TOURNAMENT_BOARD_SIZE = 15` (Bàn cờ $15 \times 15$ chuẩn Gomoku quốc tế).

---

## 2. HIỆN THỰC HÓA MÃ NGUỒN (TYPESCRIPT / JAVASCRIPT)

```typescript
export class Board {
  public readonly size: number;
  private grid: BoardMatrix;

  constructor(size: number = 10) {
    this.size = size;
    this.grid = this.createEmptyGrid(size);
  }

  /**
   * Khởi tạo ma trận rỗng kích thước size x size
   */
  private createEmptyGrid(size: number): BoardMatrix {
    return Array.from({ length: size }, () => 
      new Array(size).fill(CellValue.EMPTY)
    );
  }

  /**
   * Kiểm tra tọa độ có nằm trong phạm vi bàn cờ hay không
   */
  public isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * Lấy giá trị tại ô (row, col)
   */
  public get(row: number, col: number): Cell | null {
    if (!this.isInside(row, col)) return null;
    return this.grid[row][col];
  }

  /**
   * Gán giá trị quân cờ tại ô (row, col)
   */
  public set(row: number, col: number, value: Cell): boolean {
    if (!this.isInside(row, col)) return false;
    this.grid[row][col] = value;
    return true;
  }

  /**
   * Kiểm tra ô có đang trống không
   */
  public isEmpty(row: number, col: number): boolean {
    return this.get(row, col) === CellValue.EMPTY;
  }

  /**
   * Xóa toàn bộ bàn cờ về trạng thái rỗng
   */
  public clear(): void {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        this.grid[r][c] = CellValue.EMPTY;
      }
    }
  }

  /**
   * Tạo một bản sao độc lập (Deep Clone) của bàn cờ
   */
  public clone(): Board {
    const copy = new Board(this.size);
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        copy.set(r, c, this.grid[r][c]);
      }
    }
    return copy;
  }

  /**
   * Xuất ma trận bàn cờ dạng chuỗi để in ra console / debug
   */
  public toDebugString(): string {
    return this.grid
      .map(row => row.map(cell => (cell === 0 ? '.' : cell === 1 ? 'X' : 'O')).join(' '))
      .join('\n');
  }
}
```

---

## 3. TỐI ƯU HÓA BỘ NHỚ VÀ HIỆU NĂNG

1. **Khởi tạo mảng:** Tránh sử dụng `new Array(size).fill(new Array(size))` vì điều này sẽ sao chép cùng một tham chiếu hàng cho tất cả các hàng. Sử dụng `Array.from` để đảm bảo mỗi hàng là một mảng độc lập.
2. **Truy cập trực tiếp:** Các hàm nội bộ của AI bot có thể truy cập trực tiếp `grid[row][col]` mà không qua overhead gọi hàm trung gian nếu cần tối ưu micro-benchmark.
