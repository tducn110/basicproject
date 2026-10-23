<!-- trustmebro -->
# Subsystem Layout — Empirical Benchmark Harness (`docs/benchmark`)

Bản đồ kiến trúc hệ thống đo đạc thực nghiệm tự động: môi trường đối đầu sòng phẳng giữa Rust Engine (Native/WASM) và TypeScript Engine (V8/Node.js) trên cùng bài toán cờ Caro.

Last updated: 2026-10-19.

## 1. Overview & Research Role

- **Phân loại**: **Empirical Benchmark Harness**.
- **Mục tiêu**:
  1. Giải quyết câu hỏi kiến trúc **RQ-ARCH-01** (Đánh giá sự cần thiết của Web Worker offloading).
  2. Xác minh câu hỏi nghiên cứu **RQ-W4-A01** (Zero Semantic Divergence giữa Rust và TypeScript).
  3. Đo đạc các chỉ số: Số node duyệt ($N$), số lần cắt tỉa (Cutoffs), điểm số thế cờ, thời gian thực thi (ms), và thông lượng tính toán (kNodes/s).

---

## 2. Directory & Modules Mapping

| Thư mục / File | Phân loại | Trách nhiệm chính |
| :--- | :--- | :--- |
| [`rust_bench/`](file:///home/pro/Downloads/basicproject/docs/benchmark/rust_bench/) | **Rust Native Harness** | Crate Rust đo đạc thuật toán Alpha-Beta Pruning và Heuristic ở cấp độ native CPU: `src/main.rs` (so sánh đối đầu), `src/bin/week4_experiment.rs` (100 ván Bot-vs-Bot) |
| [`ts_bench/`](file:///home/pro/Downloads/basicproject/docs/benchmark/ts_bench/) | **TypeScript Harness** | Mã nguồn TypeScript (`benchmark.ts`) thực thi cùng logic thuật toán trên môi trường Node.js V8 JIT Engine |
| [`results/`](file:///home/pro/Downloads/basicproject/docs/benchmark/results/) | **Empirical Datasets** | Tệp JSON chứa số liệu đo đạc gốc: `benchmark_data.json` (kết quả đo độ sâu 1-4) và `week4_bot_battle.json` (kết quả 100 ván đấu) |

---

## 3. Methodological Rigor & Contracts

1. **Identical Fixture Invariant**: Cả hai engine phải được khởi tạo từ cùng một thế cờ trung cuộc (Midgame Fixture — 8 quân cờ chuẩn) và cùng quy ước chỉ số hàng/cột.
2. **Equivalence Oracle**: Kết quả đo đạc tại mọi độ sâu $d$ phải cho ra số node duyệt và điểm số khớp nhau 100% để xác nhận không có sai lệch ngữ nghĩa toán học.
3. **Execution Script**: Thực thi thông qua kịch bản điều phối tự động: `python3 scripts/benchmark_rust_vs_ts.py`.
