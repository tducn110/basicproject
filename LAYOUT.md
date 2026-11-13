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


---

## 4. System Architecture & Codebase Ownership Map (Tích hợp từ Master Research)

> Tham khảo chi tiết tại [](LAYOUT.vnuk_architecture.md)


Cập nhật 23/10/2026. Workspace báo cáo không có Git repo riêng; `10_caro/` có repo riêng và thay đổi chưa commit. Không dùng Git repo cha `/home/pro` làm provenance của dự án.

| Path | Trách nhiệm và dependency |
| --- | --- |
| `10_caro/src/App.tsx`, `src/app/GameController.ts` | React UI → controller → domain snapshot; controller sở hữu round và chấp nhận kết quả AI. |
| `10_caro/src/game/core/` | GameState và luật Freestyle Gomoku; TS sở hữu ván chơi ở main thread. |
| `10_caro/src/board/`, `src/pixi/` | Input theo ô, transform, render X/O bằng PixiJS 7; không quyết định winner. |
| `10_caro/src/game/ai/` | AI contract, tactical prepass và điều phối request. |
| `10_caro/src/game/wasm/` | Worker bridge, replay history và package WASM được build từ engine bên dưới. |
| `gomoku-main/engine/src/board.rs` | Board Rust, invariant place/undo, kiểm thắng, legal/candidate coordinates. |
| `gomoku-main/engine/src/ai.rs` | Strategy/difficulty, Minimax và Alpha-Beta, ordering, tactical protection, counters. |
| `gomoku-main/engine/src/eval.rs` | Heuristic chuỗi liên tiếp; không phải bộ pattern gián đoạn đầy đủ. |
| `gomoku-main/engine/src/lib.rs` | `Game` và wasm-bindgen boundary; sở hữu state của bản replay trong Worker. |
| `gomoku-main/web/` | UI tham khảo SVG độc lập; không phải app Pixi đang sửa. |
| `caro-core-reference/` | Reference study riêng; không dùng test của nó để chứng minh binary của game. |
| `Week1/` … `Week10/` | Bộ báo cáo nghiên cứu canonical; mỗi tuần giữ Markdown, DOCX, PDF và artifact bổ sung khi có. |
| `research/week_05_09/` | Evidence reference đã đóng băng ngày 17/10; không overwrite trong lượt sửa này. |
| `research/current_2026_10_23/` | Baseline, command logs, raw results, provenance và gate reviews của lượt sửa hiện tại. |
| `basic/`, `Tuan_01/` … `Tuan_04/`, `obsidian/` | Các reconstruction/notes và lịch đề cương khác; không tự đồng nhất ID tuần. |
| `Google_Drive_Sync/`, `VNUK_Caro_AI_Thesis_Complete_Bundle/` | Mirror/export lịch sử; không được regenerate bởi yêu cầu chỉ sửa Markdown này. |

Luồng: input → `GameController` → TS `GameState` → snapshot → React/Pixi. Lượt AI: controller → `AIController` → Worker → Rust `Game` replay → strategy/search → result → round/turn guards → TS state → render. Cancel/Undo/Reset thuộc controller và Worker bridge, không thuộc evaluator.

No database. Ván cờ ở bộ nhớ phiên; báo cáo/evidence ở filesystem.

Logic: `Board::place/undo` bảo vệ occupancy; `check_winner_at` kiểm 4 trục; `get_candidates` lọc gần quân; `Game::play_move` quản lý lượt; AI bảo toàn tactical membership trước cap; Worker đo thời gian boundary; UI biểu diễn snapshot và telemetry có nguồn.
