# Rà soát biên tập toàn văn — 13 November 2026

Đã đọc toàn bộ **1.054/1.054 paragraph records** trong `paragraphs.json`: bìa, mục lục, sáu chương, 53 tài liệu tham khảo, toàn bộ tám bảng và ba phụ lục. Chia phạm vi kiểm thành 1–350, 351–700 và 701–1054. Có 1.018 paragraph không rỗng. `report.txt` khớp chính xác với toàn bộ paragraph khi nối thêm một newline giữa mỗi record.

Không phát hiện TODO/TBD/FIXME, đoạn tự nhắc GPT/ChatGPT, nội dung “unverified”, lorem ipsum hoặc dấu chờ điền trong toàn văn. Không có raw LaTeX command/delimiter bị sót; snapshot ghi nhận 0 native equation elements. Công thức hiện dùng ký hiệu plain text, Unicode và pseudocode. Điều này không xác nhận cách render công thức hoặc pagination của bản native.

Có bốn chỉnh sửa biên tập nhỏ được đề xuất dưới đây; không có lỗi biên tập chặn nộp báo cáo. `language_findings.json` chứa old→new nguyên paragraph, giữ newline và index của snapshot để áp dụng chính xác.

| ID | Paragraph / start | Nhận xét | Thay cụm từ |
|---|---|---|---|
| LANG-01 | 304 / 43810 | condition clarity | `An empty player and a full board return no candidates [10].` → `An empty player value or a full board produces no candidates [10].` |
| LANG-02 | 396 / 60770 | plain-text mathematical grouping | `b^ceil(d/2) + b^floor(d/2) − 1` → `b^(ceil(d/2)) + b^(floor(d/2)) − 1` |
| LANG-03 | 638 / 102485 | UI action name | `The person invokes a New game before A finishes.` → `The person invokes New Game before A finishes.` |
| LANG-04 | 677 / 107882 | English grammar | `Pending work rejects; error visible; a new Worker can serve a new request.` → `Pending requests are rejected; an error is visible; a new Worker can serve a new request.` |

LANG-01 làm rõ điều kiện OR vốn đã hiện trong Algorithm 2.8. LANG-02 thêm ngoặc cho toàn bộ số mũ `ceil(d/2)` và `floor(d/2)`; không coi plain-text notation là LaTeX hỏng. LANG-03 chuẩn hóa tên thao tác New Game. LANG-04 sửa ngữ pháp cho observation trong Table 3.2.

Những nội dung cần giữ:

- “pending” trong request/promise/loader là trạng thái bất đồng bộ hợp lệ. “pending/partial” trong paragraphs 776 và 1013 là trạng thái lịch sử của gate ledger, không phải ghi chú chưa biên tập.
- `wasm32-unknown-unknown` ở paragraph 1046 là target identifier hợp lệ. “occupied placeholder” ở paragraph 304 nói về fallback move, không phải chỗ chờ điền của báo cáo.
- Các limitations và future work ở Chapter 6 là nội dung nghiên cứu cần thiết. Không xóa chúng chỉ để tạo cảm giác mọi giới hạn đã đóng.
- Phân biệt phiên bản pinned, revalidation ngày 12 November, local release ngày 13 November và public deployment chưa cập nhật được giữ nhất quán. “Remaining source-publication” ở paragraph 735 vẫn hợp lý vì Chapter 6 yêu cầu xuất bản source/lockfile/build metadata và dependency của reference engine; local rebuild không đồng nghĩa đã xuất bản.
- Số test 59 ở phần 12 November và 65 ở phần 13 November có ngày/phạm vi riêng. Chúng không phải mâu thuẫn cần biên tập thành cùng một số.
- Các phép đo native, Node/WASM, browser Worker và UI tiếp tục được phân biệt. Không tìm thấy lý do biên tập để nâng kết quả cục bộ thành production, physical-device, human-study hay calibrated-strength evidence.

Phạm vi kiểm: đọc và so sánh toàn bộ văn bản snapshot; quét từ khóa chỉ là kiểm bổ sung. Không sửa Google Docs, source code hoặc số liệu. Không chạy benchmark mới, không mở rộng research, không xác nhận citation URLs và không xác nhận render native. Các patch đề xuất chưa được áp dụng vào báo cáo.

Sau làm rõ trọng tâm từ người dùng, `algorithm_focus_patches.json` bổ sung sáu paragraph patch tại 147, 148, 153, 572, 693 và 858. Chúng đặt bài toán quyết định Caro, cơ chế thuật toán, correctness, ví dụ và complexity lên trước vai trò phần mềm. Không thay số liệu hoặc thêm source fact. Giữ nguyên sáu chương và các phần board/history/rollback/Worker cần cho tính đúng của quyết định. Đây là đề xuất biên tập theo trọng tâm đã làm rõ, tách khỏi bốn lỗi nhỏ trong `language_findings.json`.

Theo yêu cầu bổ sung, `algo_focus.json` là bộ algorithm-focus hiện hành, thay cho `algorithm_focus_patches.json`: 43 paragraph replacements, gồm sáu framing patch ban đầu, heading/caption 3.1, 27 cell paragraphs của chín requirement AR01–AR09, các paragraph giải thích và ba phần diễn đạt Chapter 4. Giữ ba cột/chín dòng, các hạn chế và citation có hỗ trợ. Root xử lý TOC/native math riêng; bộ này không có math rewrite. Table 3.2 vẫn là integration scenarios, không được coi thay cho chứng minh AR01–AR09.
