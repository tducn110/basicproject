<!-- trustmebro -->
# Subsystem Layout — Research Visual Assets (`docs/assets`)

Bản đồ lưu trữ tài sản hình ảnh và sơ đồ khoa học phục vụ báo cáo Đồ Án Cơ Sở, tuân thủ tiêu chuẩn đồ họa phân giải cao 300 DPI (`rules/visual_evidence.md`).

Last updated: 2026-10-19.

## 1. Overview & Directory Mapping

| Thư mục | Phân loại asset | Mô tả và mục đích sử dụng |
| :--- | :--- | :--- |
| [`charts/`](file:///home/pro/Downloads/basicproject/docs/assets/charts/) | **Scientific Charts (300 DPI)** | Biểu đồ đo đạc định lượng thực nghiệm: so sánh hiệu năng Rust vs TS (`rust_vs_ts_performance.png`), tăng trưởng không gian tìm kiếm (`search_scaling_comparison.png`), kết quả 100 ván đấu bot battle (`week4_bot_battle_and_pruning.png`), và độ trễ ra quyết định (`week4_decision_latency.png`) |
| [`diagrams/`](file:///home/pro/Downloads/basicproject/docs/assets/diagrams/) | **Architecture Diagrams** | Sơ đồ kiến trúc hệ thống: mã nguồn Mermaid (`caro_architecture.mmd`) và hình ảnh kết xuất PNG (`caro_architecture.png`) minh họa phân tầng 3 lớp và luồng tương tác Web Worker |
| [`debug/`](file:///home/pro/Downloads/basicproject/docs/assets/debug/) | **Debug & Board States** | Hình ảnh chụp thế cờ mẫu phục vụ minh họa phân tích thực nghiệm (`board_state_example.png`) |

---

## 2. Invariants & Preservation Rules

1. **High-Resolution Quality**: Không nén giảm dung lượng làm mờ chữ số trên biểu đồ; bảo đảm đọc rõ nét trên tài liệu in ấn và PDF luận văn.
2. **Reproducibility**: Mọi biểu đồ trong `charts/` và `diagrams/` phải có kịch bản Python hoặc mã Mermaid tương ứng trong `scripts/` để có thể tái tạo bất kỳ lúc nào.
