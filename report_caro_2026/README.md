# Nguồn biên soạn báo cáo đồ án Caro

Báo cáo Word chính nằm ở thư mục cha: `Bao_cao_do_an_co_so_Caro_Nguyen_Tam_Duc.docx`.
Bản kiểm tra ngày 27/10/2026 có 81 trang A4, trong đó 64 trang từ Chương 1 đến hết Chương 6; 26 hình và 6 bảng. Mục lục, danh mục hình/bảng có số trang đã đối chiếu với bản render. Số trang có thể thay đổi nếu đổi font hoặc ứng dụng dàn trang.

## Nội dung và dữ liệu

- `system.md`: Chương 1, 3 và 4; yêu cầu, kiến trúc, trạng thái, triển khai và bốn ví dụ Python trong `present`.
- `algorithms.md`: thuyết minh thuật toán, ký hiệu, công thức, pseudocode, ví dụ, độ phức tạp và giới hạn. Script chuyển thành Chương 2 khi ghép.
- `results_inventory.md`: kết quả, đánh giá, kết luận, tiến độ tuần và kiểm kê. Script chuyển phần thực nghiệm bổ sung vào Chương 5, đánh lại phụ lục khi ghép.
- `manuscript.md`: bản ghép được tạo tự động, hỗ trợ tìm kiếm; Word còn có bìa, mục lục, tài liệu tham khảo và phụ lục bàn giao được dựng trong script.
- `figures/`: 26 PNG đã chèn trong Word, cùng `figures.json` ghi nguồn và loại hình.
- `game-*.png`: ảnh chụp browser local làm đầu vào cho Pillow.
- `evidence_inventory.json`: kiểm kê thư mục/file nguồn và hash dataset tại thời điểm khảo sát; loại `.git` nội bộ, `node_modules`, `target`, `dist`. Thư mục báo cáo này được tạo sau kiểm kê.
- `verification_2026_10_27.json`: 59 test/9 file, typecheck, build và phạm vi quan sát browser thực chạy khi biên soạn.
- `present_python_checks.json` và bốn script `pattern_scanner.py`, `heuristic_evaluator.py`, `chebyshev_pruner.py`, `empirical_analysis.py`: ví dụ trích từ `present/src/components/PythonVisualizer.tsx`, chạy bằng CPython local. Các dòng stdout là nguyên văn chương trình minh họa; phần thuyết minh đã đối chiếu giới hạn và dữ liệu gốc, không dùng các kết luận nhập sẵn làm bằng chứng hiệu năng.
- `document_metadata.json`, `page_cache.json`, `pagination.json`: danh mục nội dung và ánh xạ trang đã kiểm tra.
- `validation.json`: kết quả kiểm tra cấu trúc, số trang và tính toàn vẹn bản Word bàn giao.
- `manifest.json`: danh sách file của bộ nguồn báo cáo và SHA-256 của từng file.

## Dựng lại bằng Python

Giữ thư mục này trong `basicproject` để đọc được template, `present`, `research` và `benchmark` ở thư mục cha. Hai mẫu Word nguồn không bị sửa.

```bash
python3 -m venv .venv-report
.venv-report/bin/pip install -r report_caro_2026/requirements.txt
.venv-report/bin/python report_caro_2026/build_visuals.py
.venv-report/bin/python report_caro_2026/compose_report.py
```

`compose_report.py` ghi đè bản Word chính ở thư mục cha. Có thể sửa ba bản thảo Markdown trước khi dựng. Sau khi nội dung hoặc hình thay đổi, cần render lại toàn bộ Word và kiểm tra phân trang, chú thích và mục lục. Bộ render dùng khi biên soạn là `documents/render_docx.py` của môi trường Codex; có thể dùng Word hoặc LibreOffice để kiểm tra lại trong môi trường khác.

Nếu có một thư mục render chứa PDF, cập nhật cache trang bằng:

```bash
.venv-report/bin/python report_caro_2026/update_page_cache.py /duong/dan/thu_muc_render
.venv-report/bin/python report_caro_2026/compose_report.py
```

Render lại sau khi cập nhật cache và so số trang cho đến khi ổn định. Bản đã bàn giao có cache đầy đủ, không cần chạy các bước này chỉ để đọc.

## Thông tin còn cần xác nhận khi chốt bản nộp

Tên mở rộng trên bìa cần khớp tên đề tài được giảng viên phê duyệt. Ngày bắt đầu, ngày kết thúc và ngày nộp cụ thể chưa được cung cấp. Nếu khoa yêu cầu mẫu bìa/biểu mẫu ký nhận riêng, bổ sung theo quy định đó. Kết quả browser local và dữ liệu native lịch sử đã được nêu đúng phạm vi; không có bằng chứng giải đấu đối kháng hoặc kiểm thử cảm ứng trên thiết bị thật.
