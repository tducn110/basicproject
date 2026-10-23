<!-- trustmebro -->
# Subsystem Layout — Automation & Visualization Scripts (`docs/scripts`)

Bản đồ kiến trúc các kịch bản tự động hóa Python: điều phối benchmark thực nghiệm, xử lý số liệu khoa học, và kết xuất đồ họa độ phân giải cao 300 DPI theo quy chuẩn `rules/visual_evidence.md`.

Last updated: 2026-10-19.

## 1. Overview & Operational Role

- **Phân loại**: **Tooling & Visualization Pipelines**.
- **Mục tiêu**: Tự động hóa toàn bộ quy trình thu thập dữ liệu, kiểm tra tính tương đương toán học và sinh biểu đồ khoa học trực quan đính kèm vào báo cáo.

---

## 2. Script Inventory & Responsibilities

| Script | Ngôn ngữ | Trách nhiệm chính | Lệnh thực thi mẫu |
| :--- | :--- | :--- | :--- |
| [`benchmark_rust_vs_ts.py`](file:///home/pro/Downloads/basicproject/docs/scripts/benchmark_rust_vs_ts.py) | Python 3 | Điều phối chạy đồng thời cả Rust và TypeScript harness, ghi nhận JSON và tự động vẽ biểu đồ đối đầu 300 DPI | `python3 docs/scripts/benchmark_rust_vs_ts.py` |
| [`generate_week3_diagrams.py`](file:///home/pro/Downloads/basicproject/docs/scripts/generate_week3_diagrams.py) | Python 3 | Sinh sơ đồ luồng kiến trúc UI (`ui_architecture_flow.png`) và cây phân cấp component (`component_hierarchy.png`) | `python3 docs/scripts/generate_week3_diagrams.py` |
| [`generate_week4_visuals.py`](file:///home/pro/Downloads/basicproject/docs/scripts/generate_week4_visuals.py) | Python 3 | Xử lý số liệu `week4_bot_battle.json` và vẽ biểu đồ tỷ lệ thắng bot battle, thời gian ra quyết định Heuristic | `python3 docs/scripts/generate_week4_visuals.py` |
| [`export_diagrams.py`](file:///home/pro/Downloads/basicproject/docs/scripts/export_diagrams.py) | Python 3 | Xuất các sơ đồ kiến trúc hệ thống tổng thể từ mã nguồn Mermaid ra ảnh PNG sắc nét | `python3 docs/scripts/export_diagrams.py` |
| [`export_visuals.py`](file:///home/pro/Downloads/basicproject/docs/scripts/export_visuals.py) | Python 3 | Công cụ kết xuất tổng hợp các asset trực quan cho toàn bộ tài liệu docs | `python3 docs/scripts/export_visuals.py` |
| [`roadmap_progress.py`](file:///home/pro/Downloads/basicproject/docs/scripts/roadmap_progress.py) | Python 3 | Quét toàn bộ checkboxes trong `ROADMAP.md` và tự động cập nhật thanh tiến độ phần trăm `<!-- progress:start -->` | `python3 docs/scripts/roadmap_progress.py ROADMAP.md` |

---

## 3. Visualization Standard (`rules/visual_evidence.md`)

- Mọi biểu đồ xuất ra phải đạt tối thiểu **300 DPI**, định dạng PNG, font sans-serif rõ nét.
- Biểu đồ thời gian phải có đường tham chiếu ngân sách **60 FPS (16.67 ms)** để chứng minh tính mượt mà của giao diện.
