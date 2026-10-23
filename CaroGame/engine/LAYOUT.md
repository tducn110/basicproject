<!-- trustmebro -->
# Subsystem Layout — CaroGame Rust Engine (`gomoku-engine`)

Bản đồ kiến trúc lõi tính toán AI cờ Caro viết bằng Rust, biên dịch mục tiêu WebAssembly (`wasm32-unknown-unknown`), cung cấp thuật toán tìm kiếm Alpha-Beta Pruning và nhận diện hình thế Heuristic.

Last updated: 2026-10-19.

## 1. Overview & Computational Role

- **Vai trò kiến trúc**: **Implement Layer (Pure Domain & Algorithmic Computation)**.
- **Pipeline Stage**: `PROCESS` (Không phụ thuộc DOM/UI/Web Audio, tính toán tất định 100%).
- **Mục tiêu**: Thực thi tìm kiếm nước cờ tối ưu với độ trễ < 50ms cho AI bot, hỗ trợ cắt tỉa Alpha-Beta Pruning và Candidate Move Generator bán kính $r \le 2$ để giảm 72.4% không gian trạng thái.

---

## 2. File Responsibilities & Modules

| File | Module / Vai trò | Pipeline Stage | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| [`src/lib.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/src/lib.rs) | **WASM Export Bridge** | `INTERFACE / ADAPTER` | Cung cấp giao diện `#[wasm_bindgen]` xuất khẩu các hàm `find_best_move_wasm`, `evaluate_board_wasm` qua `serde_wasm_bindgen` |
| [`src/board.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/src/board.rs) | **Board & Rules Simulation** | `PROCESS` | Biểu diễn bàn cờ $15 \times 15$, kiểm tra thắng cục bộ 4 hướng ($O(1)$), bộ sinh nước đi ứng viên (`generate_candidates`) quanh các quân hiện có |
| [`src/ai.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/src/ai.rs) | **AI Search Algorithms** | `PROCESS` | Thuật toán Minimax, Alpha-Beta Pruning với Move Ordering, thống kê node duyệt (`nodes_visited`) và số lần cắt tỉa (`prunes`) |
| [`src/eval.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/src/eval.rs) | **Heuristic Evaluation** | `PROCESS` | Nhận diện 7 mẫu hình thế (5 liên tiếp, 4 mở, 4 chặn, 3 mở, 3 chặn, 2 mở, 2 chặn), ma trận trọng số công - thủ tĩnh và điểm sát cuộc `MATE_SCORE` |
| [`tests/wasm.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/tests/wasm.rs) | **WASM Test Harness** | `VERIFICATION` | Bộ kiểm thử tính tương thích trên môi trường WebAssembly `wasm-bindgen-test` |
| [`Cargo.toml`](file:///home/pro/Downloads/basicproject/CaroGame/engine/Cargo.toml) | **Crate Manifest** | `CONFIGURATION` | Định nghĩa dependencies (`wasm-bindgen`, `serde`, `serde-wasm-bindgen`, `js-sys`, `console_error_panic_hook`) và cờ `crate-type = ["cdylib", "rlib"]` |

---

## 3. Architecture Invariants & Performance Contract

1. **Zero Allocations in Search Loop**: Trong vòng lặp tìm kiếm đệ quy Alpha-Beta, không cấp phát heap (`Vec::new`) động lặp đi lặp lại; sử dụng mảng cố định stack hoặc mảng tái sử dụng.
2. **Integer Arithmetic Only**: Toàn bộ điểm lượng giá dùng `i32` kết hợp `saturating_add/saturating_mul`, không dùng số thực `f64` để loại trừ sai số và gia tăng thông lượng tính toán CPU.
3. **Web Worker Isolation**: Engine Rust WASM chỉ được triệu gọi từ bên trong Web Worker (`src/features/caro/wasm/botWorker.ts`), tuyệt đối không chặn Main Thread của trình duyệt.
