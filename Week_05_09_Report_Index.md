# Báo cáo và thực nghiệm Caro AI tuần 5 đến tuần 9

<!-- CURRENT-BP26 -->
> **Hiện trạng 23/10/2026:** [Bản sửa Rust/UI và mô hình toán hiện tại](BasicProject_Current_Math_and_Design.md) là điểm đọc cho source local và gate/evidence mới. Các đoạn cũ bên dưới là snapshot/lịch nghiên cứu trước đó: không dùng các nhãn COMPLETE/PASS, số FPS/speedup/tournament, TS↔Rust parity, TT/ID hay zero-copy cũ như kết quả đã xác nhận lại. App hiện dùng React19/PixiJS7; source game, reference core và WASM là các tầng evidence riêng. Chỉ Markdown tuần1–7 được cập nhật trong lượt này; Word/PDF/Drive/mirror cũ chưa đồng bộ.


Cập nhật ngày 17 tháng 10 năm 2026. Bộ báo cáo tiếng Anh này thay nội dung và bản xuất tại năm thư mục `Week_05` đến `Week_09`. Nội dung tập trung vào cơ sở toán học, giải thích thuật toán, nguồn hiện thực, thực nghiệm có thể tái chạy và giới hạn của kết luận.

Phần thực hiện mới gồm bộ thực nghiệm Rust riêng, dữ liệu gốc, kiểm tra đối chiếu thuật toán và năm báo cáo được viết lại. Minimax, Alpha-Beta, candidate generation, ordering, Zobrist và transposition table đã có trong `caro-core-reference` trước lần cập nhật này. Mã nguồn game và reference core không được sửa trong lần làm báo cáo; không mô tả việc kiểm tra thuật toán có sẵn như một lần tích hợp mới vào game.

## Tài liệu theo tuần

| Tuần | Nội dung | Markdown | Word | PDF |
| --- | --- | --- | --- | --- |
| 5 | Minimax, terminal utility, giới hạn độ sâu, chứng minh và hoàn tác state | [Đọc](Week_05/Week_05_Rust_Minimax_Search_Tree_Analysis.md) | [Tải](Week_05/Week_05_Rust_Minimax_Search_Tree_Analysis.docx) | [Đọc](Week_05/Week_05_Rust_Minimax_Search_Tree_Analysis.pdf) |
| 6 | Alpha-Beta, bất biến cận, chứng minh tương đương và loại bound của cache | [Đọc](Week_06/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.md) | [Tải](Week_06/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.docx) | [Đọc](Week_06/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.pdf) |
| 7 | Candidate theo khoảng cách Chebyshev, tính chất tập nước đi và tác động của cap | [Đọc](Week_07/Week_07_Candidate_Move_Generation.md) | [Tải](Week_07/Week_07_Candidate_Move_Generation.docx) | [Đọc](Week_07/Week_07_Candidate_Move_Generation.pdf) |
| 8 | Move ordering, giá trị cây không đổi, chi phí chấm điểm và ảnh hưởng của thứ tự | [Đọc](Week_08/Week_08_Move_Ordering_Optimization.md) | [Tải](Week_08/Week_08_Move_Ordering_Optimization.docx) | [Đọc](Week_08/Week_08_Move_Ordering_Optimization.pdf) |
| 9 | Zobrist XOR, cập nhật và hoàn tác hash, transposition table và phạm vi tái sử dụng | [Đọc](Week_09/Week_09_Zobrist_Hashing_and_Transposition_Table.md) | [Tải](Week_09/Week_09_Zobrist_Hashing_and_Transposition_Table.docx) | [Đọc](Week_09/Week_09_Zobrist_Hashing_and_Transposition_Table.pdf) |

Các công thức trong Word được lưu bằng phương trình native OMML. PDF được xuất từ chính Word và kiểm tra trang sau khi render. Quy ước bằng chứng trong báo cáo là **[A] source hoặc kết quả thực thi**, **[B] nguồn học thuật hoặc tài liệu chính thức**, **[C] suy luận có giả thiết**, **[D] đề xuất chưa hiện thực**.

Phần toán học xác định thắng của luật Freestyle nằm trong [tài liệu điều kiện thắng mục 2.1](Caro_Rules_Heuristic_Rust_WASM_Review.md#21-thuật-toán-xác-định-thắng-theo-nước-cuối). Các báo cáo tuần 5–9 dùng kết quả terminal theo luật, phân biệt với heuristic và chứng minh chiến lược buộc thắng.

## Phần đã chạy

Bộ mã thực nghiệm nằm tại [research/week_05_09](research/week_05_09/README.md). Nó phụ thuộc trực tiếp vào reference core local và không thay các thuật toán của core để làm đẹp số liệu.

- Reference core đạt **6 unit test và 3 integration test** bằng `cargo test --manifest-path caro-core-reference/Cargo.toml --locked`.
- **112 cặp Minimax và Alpha-Beta** khớp score và nước chọn trên cùng cây, cùng cấu hình và thứ tự.
- **112 cặp có và không ordering** khớp score. Nước chọn có thể khác khi có các lựa chọn đồng điểm.
- **208 cặp Alpha-Beta thường và optimized với bảng mới** khớp score trong corpus.
- **3 998 bước hash tiến và 3 998 bước hoàn tác**, cùng bốn trường hợp nước kết thúc theo bốn trục, khớp phép tính lại hash.
- **48 bộ candidate** được kiểm tra về hình học, tính hợp lệ, thứ tự và giới hạn số phần tử.
- **551 lần kiểm tra khôi phục state** đạt sau các lời gọi search và probe. Đây không phải 551 ván đấu.

Các số đếm trên được đọc từ [verification.json](research/week_05_09/results/verification.json). Corpus gồm 20 vị trí, có cả fixture dựng trực tiếp để kiểm tra hàm. Không coi chúng là 20 ván đấu hoặc thử nghiệm người dùng.

[search_runs.csv](research/week_05_09/results/search_runs.csv) chứa 544 dòng đo search. [search_summary.csv](research/week_05_09/results/search_summary.csv) chứa 224 cấu hình đã tổng hợp. Bốn fixture kiểm soát được lặp ba lần, các vị trí từ seed dùng một lần. Thời gian là native release trên host được ghi trong [provenance.json](research/week_05_09/results/provenance.json), tính riêng lời gọi search và không bao gồm khởi tạo TT/Zobrist hay clone state. Báo cáo công bố median và phạm vi của các lần lặp, không coi đó là kết quả tốc độ chung cho mọi máy.

## Các phát hiện còn cần xử lý trong code

1. **Cap có thể loại nước thắng ngay.** Với fixture `win`, radius 1 và cap 6 giữ sáu candidate đầu theo hàng/cột, loại cả hai đầu thắng `(7,2)` và `(7,7)`. Score depth 1 từ `9999999` xuống `99990`. Xem [cap_loss.json](research/week_05_09/results/cap_loss.json).
2. **Ordering có thêm chi phí và chưa sắp theo perspective tại MIN.** Code hiện sắp score theo root giảm dần ở cả MAX và MIN. Một số cấu hình giảm node nhưng tăng thời gian do chấm điểm trước nhiều candidate. Báo cáo tuần 8 ghi nhận cả phần tiết kiệm lẫn chi phí này.
3. **TT chưa an toàn khi dùng lại qua root khác.** Probe sau khi đổi root player cho score `19800` với bảng dùng lại, so với `0` khi dùng bảng mới. Cùng root trong probe riêng vẫn cho score bằng nhau. Xem [cache_scope_probe.json](research/week_05_09/results/cache_scope_probe.json). Cần bảng mới hoặc namespace đầy đủ cho root, profile, evaluator và các điều kiện search; chưa sửa source trong lần báo cáo này.
4. **Các giới hạn khác được nêu theo đúng mức chứng cứ.** Hash 64 bit có xác suất va chạm; bảng hiện dùng HashMap không giới hạn dung lượng cố định; mate score phụ thuộc khoảng cách từ root và cần quy ước khi tái sử dụng. Các suy luận về score sát giới hạn được phân biệt với lỗi đã tái hiện.

Vì vậy trạng thái hoàn thành là **báo cáo và thực nghiệm trên reference core**. Chưa có tích hợp mới vào game, sửa các vấn đề source nêu trên, thử browser/Worker/WASM, benchmark thiết bị, hoặc đánh giá sức mạnh bot qua tournament. Các bản trong `Google_Drive_Sync` và `VNUK_Caro_AI_Thesis_Complete_Bundle` giữ nguyên trạng thái lịch sử của chúng; lần này không đồng bộ lên Google Drive.

## Tái chạy thực nghiệm

Từ thư mục gốc project, dùng Python và Cargo đã có trên máy:

```bash
python3 research/week_05_09/run.py
```

Script mặc định tìm Cargo tại `/home/pro/.cargo/bin/cargo`; có thể đặt `CARO_CARGO` nếu đường dẫn toolchain khác. Script sẽ ghi lại dữ liệu trong `results`, kiểm tra các counter lặp lại và lưu SHA-256 của source. Các số thời gian có thể thay đổi theo tải máy. Seed hash là `20261017`, seed sinh vị trí là `5006070809`.

## Tái dựng báo cáo

[scripts/build_week_05_09_reports.py](scripts/build_week_05_09_reports.py) chuyển Markdown sang Word và phương trình OMML. Nó cần `python-docx`, `lxml`, `latex2mathml==3.78.1` và `mathml2omml==0.0.2`. Trong lần dựng này dùng Python, python-docx, lxml và LibreOffice của bundled Codex runtime; hai converter bổ sung chỉ được cài trong thư mục tạm, không cài vào game hoặc hệ thống.

Các phiên bản thư viện dùng khi dựng được lưu tại [scripts/requirements-week-reports.txt](scripts/requirements-week-reports.txt). Bộ phát hành gồm 28 trang PDF và 131 phương trình Word native, trong đó có 23 công thức dạng display; đã kiểm tra từng trang sau vòng xuất cuối.

Lệnh dựng Word sau khi có dependency:

```bash
python3 scripts/build_week_05_09_reports.py
```

Sau đó dùng `render_docx.py` của skill documents và bundled LibreOffice để tạo PDF/PNG, kiểm tra tất cả trang trước khi thay bản PDF phát hành. [delivery_manifest.json](research/week_05_09/delivery_manifest.json) ghi hash các artifact phát hành và số phương trình native, số trang đã kiểm tra.
