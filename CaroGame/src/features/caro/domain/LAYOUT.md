<!-- trustmebro -->
# Layer Layout — Domain Core Simulation (`src/features/caro/domain`)

Bản đồ kiến trúc tầng Domain Core: các quy tắc mô phỏng ván cờ Gomoku 15×15, thuật toán kiểm tra thắng cục bộ 4 hướng, hằng số hình học và định nghĩa kiểu dữ liệu thuần TypeScript (không phụ thuộc UI).

Last updated: 2026-10-19.

## 1. Overview & Architectural Role

- **Phân tầng kiến trúc**: **Implement Layer (Pure Domain / Simulation)**.
- **Pipeline Stage**: `PROCESS` (Xử lý tất định, không tạo side-effect, không phụ thuộc React, DOM hay Web APIs).
- **Trách nhiệm**: Cung cấp mô hình toán học và logic luật chơi cốt lõi cho ván cờ Caro 15×15.

---

## 2. File Responsibilities

| File | Phân loại | Pipeline Stage | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| [`types.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/types.ts) | **Data Contracts** | `DATA MODEL` | Định nghĩa các kiểu cốt lõi: `Player` ('X' \| 'O'), `Cell` (`Player \| null`), `Board` (`Cell[][]`), `Move`, `WinResult`, `GameMode`, `AIDifficulty` |
| [`constants.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/constants.ts) | **Geometric Constants** | `CONFIGURATION` | `BOARD_SIZE = 15`, `WIN_LENGTH = 5`, `DIRECTIONS` (4 trục hướng duyệt: ngang, dọc, chéo chính, chéo phụ) với `as const` |
| [`board.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/board.ts) | **Simulation Engine** | `PROCESS` | Hàm `createBoard()` (ma trận 15×15), `isInsideBoard()`, `checkWinner()` (Local Raycasting $O(1)$ quanh `lastMove`) |
| [`index.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/index.ts) | **Public Barrel** | `INTERFACE` | Xuất khẩu công khai toàn bộ các kiểu và hàm domain ra ngoài module |

---

## 3. Invariants & Correctness Guarantees

1. **Zero UI Dependencies**: Tuyệt đối không import bất kỳ package UI nào (React, Tailwind, Lucide, DOM APIs) vào trong thư mục này.
2. **Local Raycasting Invariant**: `checkWinner` chỉ quét tối đa 36 ô xung quanh `lastMove` trên 4 trục hướng thay vì duyệt vét cạn toàn bàn $15 \times 15$ (tiết kiệm 94.5% phép tính).
3. **Immutability Invariant**: Không mutate trực tiếp tham số đầu vào của hàm; luôn trả về trạng thái mới hoặc đối tượng kết quả `WinResult` độc lập.
