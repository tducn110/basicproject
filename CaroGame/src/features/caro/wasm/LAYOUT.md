<!-- trustmebro -->
# Layer Layout — WebAssembly AI Sandbox (`src/features/caro/wasm`)

Bản đồ kiến trúc tầng tích hợp WebAssembly và Web Worker: cung cấp môi trường sandbox tính toán AI bất đồng bộ cho trình duyệt, ngăn chặn hoàn toàn việc phong tỏa Main Thread và đảm bảo 60 FPS mượt mà.

Last updated: 2026-10-19.

## 1. Overview & Computational Role

- **Phân tầng kiến trúc**: **Implement Layer (Web Worker Sandbox & WASM Bridge)**.
- **Pipeline Stage**: `PROCESS` (Xử lý nền tảng, trao đổi qua PostMessage events).
- **Trách nhiệm**: Tải module `gomoku_engine_bg.wasm`, khởi tạo worker, nhận trạng thái bàn cờ hiện tại và tính toán nước cờ tối ưu thông qua thuật toán Alpha-Beta Pruning.

---

## 2. File Responsibilities

| File | Phân loại | Pipeline Stage | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| [`botWorker.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/wasm/botWorker.ts) | **Web Worker Sandbox** | `PROCESS / EVENT` | Lắng nghe thông điệp `{ board, player, difficulty, depth }`, triệu gọi hàm Rust WASM, đo lường thời gian thực thi (latency), và phản hồi nước đi `{ row, col, score, nodesVisited }` |
| [`engine/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/wasm/engine/) | **WASM Compiled Bundle** | `COMPILED ASSET` | Chứa mã nhị phân WebAssembly `gomoku_engine_bg.wasm`, file keo JavaScript `gomoku_engine.js`, và định nghĩa TypeScript `gomoku_engine.d.ts` sinh bởi `wasm-pack` |

---

## 3. Concurrency & Performance Invariants

1. **Non-blocking UI Invariant**: Mọi tác vụ tìm kiếm nước cờ AI (kể cả ở độ sâu $d=4$) đều diễn ra bên trong Web Worker, Main Thread duy trì 0 dropped frames (60 FPS).
2. **Worker Error Graceful Fallback**: Nếu Web Worker gặp lỗi hoặc trình duyệt không hỗ trợ WebAssembly, hệ thống tự động fallback về nước đi ngẫu nhiên hợp lệ đầu tiên để không treo ván cờ.
3. **Structured Clone Message**: Dữ liệu bàn cờ gửi qua worker là bản sao số nguyên phẳng hoặc mảng nguyên thủy để tối ưu serialization speed (< 0.1ms).
