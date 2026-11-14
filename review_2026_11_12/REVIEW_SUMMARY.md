REVIEW VÀ ĐỐI CHIẾU SOURCE — 12–13 NOVEMBER 2026

Phạm vi và đầu ra

Đã review toàn bộ English Report: phần đầu, 6 chương, 53 tài liệu tham khảo và Appendix A–C; đối chiếu cả 20 hình, 8 bảng và ba cấp heading. Bản PDF riêng của English Report có 100 trang, gồm 92 trang từ Chapter 1 đến hết phụ lục.

Nguồn chuẩn: tducn110/basicproject, main, commit 7e1e2d51321a4e6b2e26493c34f0a485d4de39cc. Remote main và checkout hiện tại cùng revision. Inventory gồm 289 tracked files / 20 thư mục cấp cao. Các source Rust local được định danh bằng hash, tách khỏi baseline công khai và binary WASM.

English Report đã được sửa trực tiếp. Vòng 12 November chỉ review; theo yêu cầu tiếp theo ngày 13 November đã migrate Rust vào CaroGame/engine, rebuild WASM và nối web trình bày sang local. Không commit, push hay deploy.

Kết quả kiểm thực chạy

CaroGame sau migration: 65 test / 9 file pass; TypeScript --noEmit pass; Vite 8.3.1 production build pass. Node 22.23.3 / npm 10.9.9.

Teaching/present: bản copy riêng ban đầu và working tree sau sửa local entry points đều đã qua TypeScript + Vite 8.3.5 production build.

Native modified engine: 38 unit + 7 integration tests pass. Native reference: 6 unit + 3 integration tests pass. Các integration test native không được gọi thành browser/WASM tests.

Hai release harness chạy lại thành công. Toàn bộ 816 engine rows và 544 reference CSV rows khớp dữ liệu lưu ở mọi trường ngoài thời gian; 36/36 source, lockfile và harness hashes khớp provenance. Timing lịch sử vẫn giữ đúng ngày/môi trường của dữ liệu gốc.

Browser/Worker/viewport lịch sử vẫn giữ đúng ngày và phạm vi. Ngày 13 November đã kiểm mới bằng CUA: chọn cả sáu tier trên game local, quan sát phản hồi và telemetry depth 0/1/2/3/4/5. Root kiểm lại Master depth 5 và thấy iframe local render. Không suy thành tournament hoặc acceptance thiết bị thật.

Nội dung và văn phong

Đã phân biệt active WASM, modified Rust, archived baseline, legacy TypeScript và native reference. Sửa Map/array ownership, soft cap, modulo selection, terminal recurrence, leaves/total nodes, TT context, request guards, timing scope và chiều tỷ lệ Node/native.

Đã biên tập academic English theo US spelling, bỏ lời dẫn của chatbot, câu sáo, quảng bá, checklist mệnh lệnh và cảnh báo lặp. Giữ các điều kiện toán học cần thiết. Đây là rà soát và biên tập văn phong; không phải chứng nhận nguồn gốc tác giả hoặc điểm số từ AI detector.

Các vấn đề còn tồn tại trong source được mô tả tại Section 6.2 và hướng phát triển tại Section 6.3: direct fractional input, round start trước validation, threshold drag theo từng event, Pyodide loader recovery và thiếu full native dependency trong snapshot công khai.

Định dạng, citation và mục lục

Times New Roman 13 cho body, heading, bảng, caption, pseudocode và footer; named styles cũng đã chuẩn hóa. Chương/phụ lục bắt đầu trang mới; bảng lặp header, độ rộng nằm trong vùng nội dung.

53 nguồn đã được kiểm và đánh số theo lần xuất hiện. Citation trong pseudocode cũng được remap; các nhóm số xếp tăng dần, citation đứng trước dấu câu và URL không chứa dấu chấm kết thúc.

Mục lục có 79 entry liên kết đến heading native; danh mục 20 hình và 8 bảng được tính lại theo trang PDF. Cả 107 entry khớp phân trang bản cuối. Mục lục được tạo bằng chương trình và có link; không phải phần tử TableOfContents native có nút Refresh. Khi nội dung đổi, cần tái tạo bản đồ trang rồi cập nhật lại.

Đã render toàn bộ 100 trang để rà bố cục. Kiểm tự động không thấy trang rỗng, cỡ chữ khác 13 hoặc text tràn ngang. Một số ký tự toán học dùng glyph fallback khi render, còn font property trong Docs là Times New Roman 13.

Sổ finding chi tiết — vòng review nguồn và nội dung

R001 | Front matter | Condense three inventory-like paragraphs into a coherent self-contained abstract with concrete results and no inflated claim.

Source: /home/pro/Downloads/basicproject/research/current_2026_10_23/engine_verification.json; /home/pro/Downloads/basicproject/research/week_05_09/README.md; /home/pro/Downloads/basicproject/CaroGame/src/game/wasm/worker.ts

R002 | Front matter | Merge the abstract into one paragraph; remove duplicated implementation inventory.
