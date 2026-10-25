<!-- trustmebro -->
# Vault Layout — Academic Research & Empirical Benchmarks (`docs/`)

Bản đồ kiến trúc kho lưu trữ học thuật Đồ Án Cơ Sở: tổ chức các tuần nghiên cứu (Week 1 – Week 6), hệ thống benchmark thực nghiệm, kịch bản tự động hóa, tài sản hình ảnh khoa học và bộ quy tắc quản trị.

Last updated: 2026-10-19.

## 1. Overview & Academic Role

- **Phân hệ**: **Academic Vault (Nghiên cứu học thuật theo chuẩn IMRaD VNUK)**.
- **Trách nhiệm**: Lưu trữ hồ sơ nghiên cứu tiến trình 6 tuần, các câu hỏi nghiên cứu (RQ), chứng minh toán học, dữ liệu đo đạc thực nghiệm, so sánh đối đầu Rust vs TypeScript, và quy chuẩn kiểm định.

---

## 2. Vault Subsystems & Directory Mapping

| Thư mục / File | Nội dung học thuật | Trách nhiệm chính | Chi tiết Layout |
| :--- | :--- | :--- | :--- |
| [`Week1/`](file:///home/pro/Downloads/basicproject/docs/Week1/LAYOUT.md) | **Tuần 1: Research Foundation** | Đề cương nghiên cứu, luật cờ RIF/Caro, không gian trạng thái Gomoku $10^{107}$ | [`Week1/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/Week1/LAYOUT.md) |
| [`Week2/`](file:///home/pro/Downloads/basicproject/docs/Week2/LAYOUT.md) | **Tuần 2: TypeScript Core Engine** | Dữ liệu tất định, thuật toán quét tia cục bộ $O(1)$, bộ 19 test fixtures | [`Week2/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/Week2/LAYOUT.md) |
| [`Week3/`](file:///home/pro/Downloads/basicproject/docs/Week3/LAYOUT.md) | **Tuần 3: UI Architecture & Decoupling** | Phân rã 3 tầng UI, chuẩn hóa `useReducer`, Web Audio API Engine | [`Week3/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/Week3/LAYOUT.md) |
| [`Week4/`](file:///home/pro/Downloads/basicproject/docs/Week4/LAYOUT.md) | **Tuần 4: Pattern Detection & Heuristic** | 7 mẫu hình thế, ma trận trọng số Heuristic, Rule-Based Bot trên Rust | [`Week4/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/Week4/LAYOUT.md) |
| [`Week5/`](file:///home/pro/Downloads/basicproject/docs/Week5/LAYOUT.md) | **Tuần 5: Minimax Algorithm & Game Tree** | Khung thuật toán Minimax, Game Tree, đo đạc bùng nổ tổ hợp theo độ sâu | [`Week5/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/Week5/LAYOUT.md) |
| [`Week6/`](file:///home/pro/Downloads/basicproject/docs/Week6/LAYOUT.md) | **Tuần 6: Alpha-Beta Pruning** | Cắt tỉa Alpha-Beta, đo số lượng node duyệt/pruned, search time scaling | [`Week6/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/Week6/LAYOUT.md) |
| [`benchmark/`](file:///home/pro/Downloads/basicproject/docs/benchmark/LAYOUT.md) | **Empirical Benchmark Harness** | Đo đạc đối đầu Rust Native/WASM vs TypeScript Node.js/V8 | [`benchmark/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/benchmark/LAYOUT.md) |
| [`scripts/`](file:///home/pro/Downloads/basicproject/docs/scripts/LAYOUT.md) | **Automation & Visual Scripts** | Kịch bản Python tự động chạy thực nghiệm và xuất biểu đồ 300 DPI | [`scripts/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/scripts/LAYOUT.md) |
| [`assets/`](file:///home/pro/Downloads/basicproject/docs/assets/LAYOUT.md) | **Research Visual Assets** | Biểu đồ khoa học (`charts/`), sơ đồ kiến trúc (`diagrams/`), hình thế debug | [`assets/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/assets/LAYOUT.md) |
| [`rules/`](file:///home/pro/Downloads/basicproject/docs/rules/LAYOUT.md) | **Governance Rules** | Quy tắc layout (`layout.md`), roadmap (`roadmap.md`), hình ảnh (`visual_evidence.md`) | [`rules/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/rules/LAYOUT.md) |
| [`archived/`](file:///home/pro/Downloads/basicproject/docs/archived/LAYOUT.md) | **Archived & Legacy Docs** | Tài liệu cũ, bản nháp review, stubs đã được lưu trữ an toàn | [`archived/LAYOUT.md`](file:///home/pro/Downloads/basicproject/docs/archived/LAYOUT.md) |
| [`BENCHMARK_RUST_VS_TYPESCRIPT.md`](file:///home/pro/Downloads/basicproject/docs/BENCHMARK_RUST_VS_TYPESCRIPT.md) | **Scientific Empirical Report** | Báo cáo chi tiết kết quả đối đầu Rust vs TS, chứng minh tương đương toán học và bảo toàn 60 FPS | N/A (Canonical doc) |
| [`templatereport.docx`](file:///home/pro/Downloads/basicproject/docs/templatereport.docx) | **Academic Template** | Biểu mẫu luận văn chuẩn IMRaD VNUK | N/A (Template doc) |

---

## 3. Directory Structure

```text
docs/
├── LAYOUT.md                     # [File này] Bản đồ tổ chức kho tài liệu
├── README.md                     # Tài liệu giới thiệu tổng quan kho học thuật
├── BENCHMARK_RUST_VS_TYPESCRIPT.md # Báo cáo nghiên cứu thực nghiệm đối đầu
├── templatereport.docx           # Mẫu báo cáo đồ án cơ sở
├── Week1/                        # Tuần 1: Nghiên cứu nền tảng & đề cương
├── Week2/                        # Tuần 2: TypeScript Core Game Engine
├── Week3/                        # Tuần 3: Kiến trúc UI & State Decoupling
├── Week4/                        # Tuần 4: Pattern Detection & Rule-Based Bot
├── Week5/                        # Tuần 5: Minimax Algorithm & Game Tree
├── Week6/                        # Tuần 6: Alpha-Beta Pruning
├── benchmark/                    # Harness thực nghiệm Rust vs TypeScript
├── scripts/                      # Kịch bản tự động hóa & kết xuất đồ họa Python
├── assets/                       # Biểu đồ và sơ đồ 300 DPI
├── rules/                        # Quy chuẩn kiến trúc và kiểm định
└── archived/                     # Kho lưu trữ tài liệu cũ và bản nháp
```
