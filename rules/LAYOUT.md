<!-- trustmebro -->
# Subsystem Layout — Governance & Verification Rules (`docs/rules`)

Bản đồ các quy chuẩn quản trị kiến trúc, quản lý lộ trình và tiêu chuẩn dẫn chứng hình ảnh được áp dụng xuyên suốt đồ án.

Last updated: 2026-10-19.

## 1. Overview & Policy Mapping

| Quy chuẩn / File | Tên chính sách | Phạm vi điều chỉnh | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| [`layout.md`](file:///home/pro/Downloads/basicproject/docs/rules/layout.md) | **Layout Mode Standard** | Toàn bộ workspace & modules | Quy định việc duy trì `{layout}` ở mỗi folder, ánh xạ ranh giới dữ liệu 7 giai đoạn (`INPUT -> PROCESS -> STATE -> EVENT -> SIDE EFFECT -> OUTPUT -> FEEDBACK`), và thực thi nghiêm ngặt State Single-Responsibility Invariant |
| [`roadmap.md`](file:///home/pro/Downloads/basicproject/docs/rules/roadmap.md) | **Roadmap Governance** | Quản lý tiến độ 6 phases | Quy định mọi tác vụ phải được ghi nhận vào `ROADMAP.md` trước khi code, cập nhật change log và chạy script tính toán phần trăm tiến độ |
| [`visual_evidence.md`](file:///home/pro/Downloads/basicproject/docs/rules/visual_evidence.md) | **Visual Evidence Standards** | Biểu đồ & Sơ đồ học thuật | Quy định tiêu chuẩn kỹ thuật cho biểu đồ khoa học: tối thiểu 300 DPI, tỷ lệ trục rõ ràng, đường chuẩn 60 FPS (16.67ms), và tính tái lập |

---

## 2. Invariants

- **Authority Hierarchy**: Mọi thay đổi mã nguồn hoặc tài liệu phải tuân thủ các quy tắc trong thư mục này.
- **Continuous Update**: Khi thêm hoặc chuyển đổi thư mục/mô-đun, bắt buộc phải cập nhật file `LAYOUT.md` tương ứng trong cùng một commit.
