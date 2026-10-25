<!-- trustmebro -->
# Archived Subsystem Layout — Outdated & Legacy Documents (`docs/archived`)

Bản đồ lưu trữ tài liệu lịch sử, bản nháp, stubs và các phiên bản roadmap cũ đã ngừng sử dụng. Được bảo tồn phục vụ mục đích kiểm toán (audit provenance) và ngăn ngừa gây nhầm lẫn cho các tác vụ hiện tại.

Last updated: 2026-10-19.

## 1. Inventory of Archived Files

| Tệp đã lưu trữ | Tên gốc / Vị trí ban đầu | Lý do lưu trữ (Classification) | Ngày lưu trữ | Tài liệu thay thế chính thức (Canonical Replacement) |
| :--- | :--- | :--- | :--- | :--- |
| [`Untitled.md`](file:///home/pro/Downloads/basicproject/docs/archived/Untitled.md) | `docs/Untitled.md` | **OUTDATED_DRAFT**: Ghi chú nháp 1 dòng ("tim duong tai vi tri gan nhat"), không có giá trị học thuật | 2026-10-19 | N/A |
| [`Hoàn Thiện Đề Cương.md`](file:///home/pro/Downloads/basicproject/docs/archived/Ho%C3%A0n%20Thi%E1%BB%87n%20%C4%90%E1%BB%81%20C%C6%B0%C6%A1ng.md) | `docs/Week1/Hoàn Thiện Đề Cương.md` | **EMPTY_STUB**: Tệp rỗng 0 byte, không chứa nội dung | 2026-10-19 | [`docs/Week1/Tuần 1.md`](file:///home/pro/Downloads/basicproject/docs/Week1/Tu%E1%BA%A7n%201.md) và [`docs/Week1/ĐỀ CƯƠNG ĐỒ ÁN CƠ SỞ.pdf`](file:///home/pro/Downloads/basicproject/docs/Week1/%C4%90%E1%BB%80%20C%C6%AF%C6%A1NG%20%C4%90%E1%BB%92%20%C3%81N%20C%C6%A0%20S%E1%BB%9E.pdf) |
| [`week2_review_draft.md`](file:///home/pro/Downloads/basicproject/docs/archived/week2_review_draft.md) | `docs/Week2/week2.md` | **REVIEW_DRAFT**: Bản nháp phản biện ban đầu của AI chứa các thẻ kỹ thuật `[S0]`-`[S16]` | 2026-10-19 | [`docs/Week2/Tuan 2.md`](file:///home/pro/Downloads/basicproject/docs/Week2/Tuan%202.md) (Bản báo cáo chuẩn mực 8 phần VNUK IMRaD) |
| [`docs_src_ROADMAP.md`](file:///home/pro/Downloads/basicproject/docs/archived/docs_src_ROADMAP.md) | `docs/src/ROADMAP.md` | **DUPLICATE_OUTDATED**: Bản sao roadmap cũ (48%) nằm sai thư mục mã nguồn | 2026-10-19 | [`ROADMAP.md`](file:///home/pro/Downloads/basicproject/ROADMAP.md) (Master Roadmap 65%) |
| [`docs_src_roadmap.md`](file:///home/pro/Downloads/basicproject/docs/archived/docs_src_roadmap.md) | `docs/src/roadmap.md` | **DUPLICATE_OUTDATED**: Bản sao roadmap cũ (59%) chữ thường | 2026-10-19 | [`ROADMAP.md`](file:///home/pro/Downloads/basicproject/ROADMAP.md) (Master Roadmap 65%) |
| [`CaroGame_src_ROADMAP.md`](file:///home/pro/Downloads/basicproject/docs/archived/CaroGame_src_ROADMAP.md) | `CaroGame/src/ROADMAP.md` | **DUPLICATE_OUTDATED**: Bản roadmap cũ (48%) nằm trong thư mục web app | 2026-10-19 | [`ROADMAP.md`](file:///home/pro/Downloads/basicproject/ROADMAP.md) |

---

## 2. Policy for Archived Content

- **Không tham chiếu làm Source-of-Truth**: Toàn bộ các file trong thư mục này chỉ mang tính lịch sử tham khảo; tuyệt đối không dùng làm căn cứ kỹ thuật cho các quyết định kiến trúc hiện tại.
- **Bảo toàn nguyên vẹn**: Giữ nguyên nội dung gốc để đối soát lịch sử khi cần thiết.
