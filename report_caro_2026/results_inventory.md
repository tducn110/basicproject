# CHƯƠNG 5. KẾT QUẢ VÀ ĐÁNH GIÁ

## 5.1. Phạm vi đánh giá và nguồn dữ liệu

Việc đánh giá được tổ chức theo ba tầng: kiểm tra engine Rust ở môi trường native; kiểm tra gói WebAssembly (WASM) và adapter; kiểm tra luồng giao diện trong trình duyệt. Một nhóm thực nghiệm riêng sử dụng thư viện `caro-core-reference` để nghiên cứu thuật toán. Thư viện này không đồng nhất với engine Rust được đóng gói trong ứng dụng; vì vậy kết quả của hai nhóm được trình bày tách biệt. Bằng chứng chính ghi ngày 23/10/2026; reference ghi ngày 17/10/2026. Đây là kết quả đã lưu, không phải phép đo mới.

## 5.2. Kết quả kiểm thử engine và luật chơi

Theo `G3_native_tests.log`, lệnh kiểm thử Rust ngày 23/10 ghi nhận 38 unit test và 7 integration test thành công. Các nhóm kiểm tra bao gồm khởi tạo bàn cờ, từ chối ô đã có quân hoặc tọa độ ngoài biên, đặt và hoàn tác quân, nhận diện thắng theo bốn trục và xử lý bàn cờ hòa. Các test xác nhận Freestyle: chuỗi từ năm quân, kể cả dài hơn năm hoặc bị chặn hai đầu, được tính thắng; điều này khác luật đúng năm hoặc không bị chặn hai đầu.

Tại lớp ứng dụng, `G5_frontend_tests.log` ghi 59 test thành công trong 9 file; typecheck và bản build Vite cũng kết thúc với mã thoát 0. Bộ 59 test này đã bao gồm 18 trường hợp actual-WASM trong `G4_actual_wasm_tests.log`, nên không cộng 18 thành một nhóm độc lập nữa. Build ghi cảnh báo chunk JavaScript sau minify lớn hơn 500 kB và cảnh báo về cấu hình loader; các cảnh báo đó không làm lệnh build thất bại nhưng vẫn là điểm cần xem xét khi tối ưu tải trang. Log build ghi riêng binary WASM khoảng 111,58 kB trước gzip và 34,14 kB sau gzip trong build đó; đây là kích thước file, không phải lượng RAM hay bộ nhớ GPU khi chạy.

Trong lần kiểm tra lại ứng dụng `CaroGame` ngày 27/10/2026, bộ test frontend ghi nhận 59 test đạt trong 9 file và lệnh build Vite thành công. Build vẫn có cảnh báo liên quan `__dirname`/loader cấu hình và chunk sau minify lớn hơn 500 kB. Đây là kiểm tra lại của lớp ứng dụng trong phiên hiện tại; không phải phép chạy lại các thí nghiệm native hay các phép đo lịch sử được nêu ở các mục sau. Kết quả test và build không thay thế kiểm thử browser, thiết bị cảm ứng hoặc Wink host.

## 5.3. Đối chiếu WASM, Worker và giao diện

Theo `wasm_package.json`, binary WASM có SHA-256 `1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989`. File binary trong `CaroGame` của checkout báo cáo hiện có cùng hash. Khớp hash không chứng minh toàn bộ hành vi ứng dụng.

Bộ `wasm_ts_parity.json` ghi nhận so sánh thông qua adapter với WASM thật trong Node trên tám lịch sử ván cờ có thể đạt được, gồm 291 lượt đặt quân được chấp nhận, cùng các trường hợp đầu vào bị từ chối, Undo và Reset. Quy ước người chơi sau nước kết thúc khác nhau giữa hai phía: Rust chuyển lượt còn TypeScript giữ người vừa đi. Do vậy phép so sánh lượt tiếp theo chỉ áp dụng khi ván vẫn đang diễn ra. Đây là so sánh trên corpus xác định, không chứng minh hai cách biểu diễn tương đương ở mọi trạng thái.

Kiểm tra bằng Headless Chrome 155 đã gọi Worker thực và binary có hash nêu trên cho cả sáu mức Easy, Normal, Hard, Very Hard, Expert và Master; từng kết quả được ghi là nước hợp lệ trên vị trí đã chọn. Ở Hard trở lên, lớp TypeScript có thể trả nước chiến thuật trước khi gọi WASM; counter `tactical` không phải counter tìm kiếm Rust. Một phép kiểm giao diện khác thực hiện chuỗi React/Pixi input → Worker Rust → thông tin tìm kiếm → Undo. Sau Undo, thông tin chi tiết của nước bot được gỡ và trạng thái nút thay đổi như ghi trong `G5_browser_ui.json`. Kiểm tra kích thước 1280×800, 390×844 và 320×568 không phát hiện tràn ngang trong các trường hợp được ghi. Tuy nhiên ở 320×568, vùng bàn cờ còn thấp khi bảng chi tiết đang mở, nên kích thước thực tế của vùng tương tác cần được đánh giá thêm.

## 5.4. So sánh Minimax và Alpha-Beta trên engine ứng dụng

Bộ thực nghiệm native của engine ứng dụng gồm 816 dòng đo trong `engine_search_runs.csv`; `engine_verification.json` ghi 408 cặp Minimax–Alpha-Beta, 408 cặp kiểm tra giá trị khi thay thứ tự duyệt và 820 lần kiểm tra khôi phục trạng thái gốc. Các cặp bao gồm những lần lặp, không phải 408 vị trí độc lập. Dữ liệu gồm bốn fixture có kiểm soát và 16 vị trí sinh theo seed; mỗi cấu hình kiểm soát được lặp ba lần liên tiếp. Đồng hồ không tính clone bàn cờ ở gốc; không ghim CPU hay ngẫu nhiên hóa thứ tự, do đó thời gian chỉ mô tả host đã đo.

Ví dụ, tại fixture `clustered`, độ sâu 2, bán kính ứng viên 2, soft cap 8 và tắt sắp thứ tự duyệt, Minimax thăm 73 node; Alpha-Beta thăm 34 node với 6 cutoff. Cả hai trả điểm 3 và cùng tọa độ được ghi (7,6). Như vậy số node trong ví dụ này giảm khoảng 53,42%, tính bằng `(73 − 34) / 73 × 100%`. Trung vị thời gian native tương ứng là 65.040 ns và 43.210 ns, tức khoảng 65,04 µs và 43,21 µs. Với cùng fixture và cấu hình thành viên ứng viên, khi bật sắp thứ tự, Alpha-Beta ghi 26 node, 7 cutoff và trung vị 38.846 ns. Các số này lấy từ `engine_search_summary.csv`; chúng minh họa một cấu hình cụ thể, không phải mức tăng tốc chung cho mọi ván.

## 5.5. Thực nghiệm thuật toán trên reference core

Nhóm nghiên cứu ngày 17/10 dùng `caro-core-reference`, với 544 dòng đo trong `research/week_05_09/results/search_runs.csv`, 112 cặp so sánh Minimax–Alpha-Beta và 112 cặp so sánh thứ tự duyệt. Log ghi 6 unit test và 3 integration test thành công. Tập này cũng gồm bốn fixture kiểm soát và 16 vị trí sinh theo seed; một số fixture chiến thuật là trạng thái tổng hợp để kiểm tra hành vi, không nhất thiết có thể đạt bằng chuỗi lượt đi xen kẽ thông thường. Kết quả không chạy browser, Worker hay binary WASM của trò chơi.

Ở fixture `clustered` của reference, độ sâu 2, xét toàn bộ nước hợp lệ và không sắp thứ tự, Minimax thăm 48.842 node; Alpha-Beta thăm 10.939 node. Hai kết quả có cùng điểm 0 và cùng nước (6,7), tức số node giảm khoảng 77,60% trong cấu hình đó. Trung vị thời gian của ba lần chạy lần lượt là 69.252 µs và 16.442 µs. Không thể trộn trực tiếp số này với thí nghiệm ở mục 5.4: thư viện, chính sách sinh nước đi và cấu hình đều khác.

Reference còn cho thấy giới hạn của tối ưu hóa nếu điều kiện sử dụng không phù hợp. Trong `cap_loss.json`, một cap cứng bằng 6 trên fixture `win` đã loại cả hai ô thắng ngay, tọa độ (7,2) và (7,7). Đây là ví dụ đối với chính sách của reference; engine ứng dụng có chính sách soft cap ưu tiên nước chiến thuật và được kiểm tra riêng, do đó không thể chuyển nguyên kết luận lỗi sang engine ứng dụng. `cache_scope_probe.json` cũng ghi trường hợp tái sử dụng bảng chuyển vị sau khi đổi người chơi gốc cho điểm 19.800, trong khi bảng mới cho 0. Kết quả cho thấy cache cần được giới hạn theo ngữ cảnh đánh giá; nó không chứng minh lỗi đang xuất hiện trong đường đi WASM hiện hành.

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Kết luận

Đồ án đã xây dựng một hệ thống chơi cờ với bàn cờ 15×15, luật Freestyle và các chiến lược bot có thể lựa chọn, đồng thời tổ chức xử lý tìm nước đi qua Rust/WASM và Worker. Từ mô hình trạng thái và kiểm tra thắng theo bốn trục, đồ án triển khai và khảo sát heuristic, Random, Rule-Based, Minimax, Alpha-Beta, sinh ứng viên và sắp thứ tự. Phần giao diện thể hiện bàn cờ, trạng thái và thông tin tìm kiếm trong những luồng đã được kiểm tra.

## 6.2. Hạn chế

Corpus thực nghiệm còn nhỏ so với không gian trạng thái của bàn cờ; các phép kiểm không chứng minh tính đúng đắn toàn diện hoặc khả năng chơi tối ưu. Thời gian chạy được thu thập trên một host với số lần lặp hạn chế, chưa kiểm soát đầy đủ tải hệ thống; vì vậy kết quả mang tính minh họa và tái lập theo cấu hình đã lưu. Các phép kiểm browser là tự động, dùng pointer tổng hợp; chưa thay thế đánh giá trên thiết bị, Wink host hay kiểm thử với người dùng. Chưa có dữ liệu thi đấu bot đủ lớn hoặc quy trình đánh giá sức mạnh, nên không thể suy ra xác suất thắng hay thứ hạng thực tế từ tên difficulty hoặc độ sâu.

## 6.3. Hướng phát triển

Trước hết, có thể mở rộng corpus kiểm thử với các trạng thái đạt được từ lịch sử hợp lệ, thêm fixture cho trường hợp hai mối đe dọa, nước thắng có khoảng trống và thế hòa. Mỗi tối ưu nên giữ bộ so sánh cùng luật, cùng hàm lượng giá, cùng độ sâu và cùng tập nước đi; kiểm tra khôi phục state sau cả đường bình thường lẫn đường bị hủy. Đối với cache, khóa hoặc phạm vi sống cần phản ánh những yếu tố ảnh hưởng đến giá trị như người chơi gốc, luật và cấu hình; cần xử lý đúng bound và điểm thắng theo độ sâu trước khi gắn vào ứng dụng.

Tiếp theo, nếu triển khai iterative deepening và giới hạn thời gian trong Worker, hệ thống cần trả nước đi từ độ sâu hoàn tất gần nhất, khai báo rõ phạm vi bộ đếm, đồng thời bảo đảm Undo, Reset và đổi ván không áp dụng kết quả cũ. Sau tích hợp cần kiểm lại parity, tính hợp lệ của nước đi và khả năng khôi phục khi Worker lỗi hoặc bị hủy. Việc chọn cấu hình difficulty nên dựa trên thực nghiệm độc lập, không chỉ tăng tên gọi hay độ sâu.

Cuối cùng, một protocol đánh giá sức mạnh có thể sử dụng nhiều vị trí mở đầu, đổi bên, seed được công bố và số ván đủ lớn; báo tỷ lệ thắng–hòa–thua cùng độ bất định. Đánh giá thời gian cần ghi thiết bị, trình duyệt, phiên bản, điều kiện tải và phân phối thay vì một con số đơn lẻ. Kiểm thử trên màn hình cảm ứng thật, nhiều viewport và môi trường host sẽ bổ sung bằng chứng trải nghiệm mà các phép kiểm headless hiện chưa cung cấp.

# PHỤ LỤC A. BỔ SUNG THỰC NGHIỆM VÀ TRUY XUẤT NGUỒN SỐ LIỆU

## A.1. Mục tiêu và cấu trúc các tập dữ liệu

File `benchmark/results/benchmark_data.json` chứa bốn kết quả Rust và bốn kết quả TypeScript cho cùng nhãn fixture `midgame`, tại độ sâu một đến bốn. `benchmark/rust_bench/src/main.rs` dùng thư viện `caro-core-reference` và fixture gồm tám quân đặt sẵn; file `benchmark/ts_bench/benchmark.ts` cài một bản TypeScript riêng cho phép đối chiếu. `scripts/benchmark_rust_vs_ts.py` gọi hai chương trình với tham số `midgame` rồi ghi JSON. Gói Rust chạy native, chương trình TypeScript chạy trong Node; không có phép đo WASM trên browser trong chuỗi này. Manifest Rust tại checkout này trỏ dependency tương đối tới `/home/pro/vnuk/basicProject/caro-core-reference`, hiện không tồn tại; vì vậy không xác nhận có thể tái chạy nguyên trạng tại đây.

Mã runner có một lần khởi động trước khi đo, sau đó mỗi kết quả là thời gian trung bình chia theo số lần lặp ở từng độ sâu. Bên Rust chạy 100, 50, 20 và 5 lần tương ứng độ sâu 1–4; TypeScript chạy 50, 20, 5 và 2 lần. Cả hai tạo lại trạng thái fixture trong đoạn được tính giờ. Số vòng chạy không giống nhau; JSON không lưu từng mẫu thời gian, phân phối, hash nguồn, điều kiện máy hoặc thời điểm cho lần đo cụ thể. Mặc dù có cùng điểm và số node được ghi, điều đó mới đối chiếu trên fixture và các cấu hình này; nó không chứng minh hai hiện thực tương đương với mọi trạng thái.

## A.2. Bảng số liệu được lưu cho một fixture benchmark

| Độ sâu | Node Rust / TS | Cutoff Rust / TS | Rust native (ms) | TypeScript Node (ms) | Điểm Rust / TS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 45 / 45 | 0 / 0 | 0,0221 | 0,5383 | 99.990 / 99.990 |
| 2 | 609 / 609 | 39 / 39 | 0,3125 | 5,5795 | 19.990 / 19.990 |
| 3 | 16.184 / 16.184 | 454 / 454 | 9,0248 | 156,7846 | 9.999.997 / 9.999.997 |
| 4 | 496.790 / 496.790 | 16.350 / 16.350 | 285,4517 | 5.083,4518 | 9.999.997 / 9.999.997 |

Trang `present/src/components/BenchmarkSection.tsx` sao chép những giá trị số này vào mảng mã nguồn nhưng mô tả phép đo trên mười thế cờ; runner và JSON chỉ cho thấy một fixture `midgame`. `Week6AlphaBeta.tsx` lại ghi hệ số ở độ sâu 1 và 2 không phù hợp phép chia thời gian từ JSON. Không dùng mô tả mười thế cờ hoặc các hệ số mâu thuẫn làm kết quả đã xác thực. Muốn so sánh tốc độ một cách khái quát cần nhiều vị trí, dữ liệu per-run, cấu hình compiler và runtime, cùng protocol warmup và thứ tự đo được lưu.

Một phép so sánh Rust native với TypeScript Node cũng không thể trực tiếp giải thích độ trễ người chơi gặp trên Web. Đường thực tế còn có khởi tạo và truyền thông điệp đến Worker, tái dựng state, gọi WASM và cập nhật giao diện. Cần đo riêng từng khoảng cùng phân phối độ trễ trên thiết bị đích. Vì vậy các biểu đồ so sánh ở website được xem là phần trình bày dữ liệu lưu của một fixture, không là bằng chứng rằng ứng dụng đạt một mức khung hình cụ thể hay mức tăng tốc phổ quát.

## A.3. Khảo sát 100 ván Rule-Based và Random

File `benchmark/results/week4_bot_battle.json` ghi 100 ván trên Rust native, trong đó Rule-Based thắng 100, Random thắng 0 và hòa 0; trung bình 9,90 ply mỗi ván. “Ply” là một lượt đặt quân của một bên, do đó hai ply thường tương ứng một lượt của mỗi bên. File ghi trung bình 251,26 micro giây cho mỗi nước Rule-Based được tính giờ, tổng thời gian toàn bộ thí nghiệm 135,544 ms, số ô trống trung bình 220,21 và số ứng viên trung bình 60,80. Tỷ lệ tính từ hai trung bình là `1 − 60,80 / 220,21 ≈ 72,39%`; đây là tỷ lệ giảm số ô so với ô trống theo cách tổng hợp của thí nghiệm, không phải tỷ lệ cắt nhánh Alpha-Beta hoặc bằng chứng giữ được mọi nước tốt.

Theo `benchmark/rust_bench/src/bin/week4_experiment.rs`, Rule-Based đánh X trong 50 ván đầu và O trong 50 ván sau; Random sử dụng seed xác định từ số ván và ply. Thế khởi đầu và chính sách của đối thủ do chương trình quyết định. Seed của hai nhóm đổi bên không được dùng theo cặp giống nhau, nên đổi bên không tự loại bỏ hoàn toàn ảnh hưởng của lượt đi đầu. JSON chỉ có số tổng hợp, không có diễn biến từng ván hoặc khoảng tin cậy. Kết quả 100/100 mô tả một bộ thí nghiệm xác định với baseline Random, không suy ra xác suất thắng phổ quát hay sức mạnh trước con người hoặc đối thủ khác.

Đồng hồ trong mã bao gồm thao tác sinh ứng viên và gọi `choose_rule_based_move`, vì vậy chỉ số 251,26 µs cần được hiểu theo phạm vi đó. Tệp JSON không ghi giá trị cực đại cho mỗi nước. Ngược lại, `present/src/components/Week4RustEngine.tsx` hiển thị 42,24 µs trung bình và gọi 251,26 µs là cực đại; cả hai nhãn đều không khớp file dữ liệu đang lưu. `PythonVisualizer.tsx` và một số tài liệu Week4 cũng nhúng 42,24. Vì thiếu bản ghi gốc tương ứng với con số này, báo cáo sử dụng 251,26 µs như giá trị trung bình được ghi trong JSON và không diễn giải nó thành tốc độ khung hình browser.

Bộ JSON đồng thời liệt kê bảy fixture phân loại chuỗi liên tiếp đều PASS: năm quân, bốn mở, bốn một đầu, ba mở, ba một đầu, hai mở và hai một đầu. Chương trình kiểm tra các fixture trước khi xuất kết quả; điều này mô tả bảy trường hợp cụ thể, không chứng minh đầy đủ mọi mẫu gián đoạn, chồng lấn, fork hoặc mọi vị trí cạnh biên. Trung bình ứng viên khai cuộc và trung cuộc được ghi lần lượt 45,19 và 92,95; trường tàn cuộc có 0,00 nhưng file không ghi số mẫu từng giai đoạn, nên không đủ căn cứ diễn giải 0 là một phép đo tàn cuộc có mẫu.

## A.4. Truy nguyên biểu đồ và dữ liệu minh họa

`present/public/data/benchmark_data.json` và `present/public/data/week4_bot_battle.json` khớp byte với hai tệp tương ứng trong `benchmark/results/` tại thời điểm kiểm kê. Điều đó xác nhận hai bản sao cùng nội dung, nhưng không chứng minh mọi component đang đọc trực tiếp file JSON: nhiều component chứa giá trị hard-code. Khi thay dữ liệu gốc, một mảng hard-code hoặc ảnh đã xuất có thể không đổi theo, tạo mâu thuẫn giữa bảng, biểu đồ và nguồn.

`present/scripts/generate_charts.py` nhúng các dãy thời gian cho biểu đồ Rust–TypeScript, tạo `present/public/assets/rust_vs_ts_speedup.png`. Do script dùng mảng số cố định, ảnh chỉ phản ánh các giá trị được chép vào script tại lúc xuất; cần so lại với JSON trước khi trình bày. Cùng script tạo `chebyshev_heatmap.png` từ năm quân đặt thủ công; việc đếm tập hợp trong đoạn script cho 36 ô ứng viên. Đây là ví dụ hình học minh họa một vị trí và quy tắc bán kính 2, không phải phép đo trung bình của tập ván.

`scripts/export_visuals.py` dùng mảng số node viết sẵn cho hình `assets/charts/search_scaling_comparison.png`; trong phạm vi tệp đã đọc chưa thấy bản ghi từng fixture hoặc nguồn tính trung bình tương ứng. Nên dùng hình này như minh họa hoặc thay bằng hình sinh từ CSV có provenance, không dùng để báo cáo số đo. `assets/debug/board_state_example.png` do script vẽ các quân và đường thắng mẫu, không phải ảnh chụp một ván hoặc minh chứng tương tác thực tế.

`scripts/generate_week4_visuals.py` đọc một phần JSON Week4, nhưng biểu đồ donut gắn trực tiếp 100/0/0 và các giá trị ô trống 222/212 của từng giai đoạn được đặt sẵn trong script. Số tổng hợp và ví dụ suy diễn được đặt trên cùng một biểu đồ nên chú thích phải chỉ rõ nguồn từng thành phần. Các hình taxonomy và flow thể hiện khái niệm, không tự kiểm chứng code; sơ đồ flow còn gắn con số độ trễ không khớp JSON. Không mặc định một ảnh chất lượng cao là bằng chứng đo lường hoặc xác nhận mã hiện hành.

`present/src/components/Week8To10AdvancedAI.tsx` chứa bảng move ordering 148/52 đến 382.100/78.450 và một kịch bản giải đấu, nhưng trong các tập raw đã kiểm kê chưa tìm thấy provenance liên kết những số này với một lần chạy cụ thể. Chúng được giữ là nội dung trình bày chưa xác thực, không dùng để thay số từ `research/week_05_09/results/search_summary.csv`. Tương tự, kịch bản 500 ván trong trang trình bày là kế hoạch; không xem đó là giải đấu đã diễn ra khi chưa có kết quả từng ván và cách sinh seed.

## A.5. Cách dùng evidence và bảo toàn khả năng tái lập

Các tệp trong `research/current_2026_10_23` ghi data và provenance của snapshot engine/game; `research/week_05_09` ghi nghiên cứu native reference. Lệnh tái chạy có thể ghi đè thư mục kết quả, vì thế trước khi chạy lại cần sao lưu snapshot theo ngày và kiểm tra đường dẫn dependency: `research/week_05_09/Cargo.toml` trỏ đến `caro-core-reference` không có trong checkout báo cáo này. Một số file `.log` được README của bản `/home/pro/Downloads/basicproject/research/` nhắc tới không nằm trong checkout đó; bản lưu log thực tế đã được đọc tại `/home/pro/Downloads/vnuk/basicProject/research/`. Báo cáo cần trỏ tới bản có file thay vì tạo cảm giác mọi log đều đã được đóng gói trong checkout hiện tại.

Mỗi con số nên được lưu cùng fixture hoặc seed, thuật toán, config candidate, độ sâu, số lần lặp, định nghĩa counter, môi trường và đường dẫn raw. Hình ảnh chỉ nên được coi là phép biến đổi của dữ liệu nếu script lấy đúng nguồn, không chèn số thủ công và có đủ thông tin để chạy lại. Các bước tiếp theo cần tách tập dành cho kiểm chứng correctness khỏi tập đánh giá performance; sự khớp điểm trên vài trường hợp là bằng chứng hữu hạn, không phải chứng minh thống kê hay chứng minh mọi trường hợp.

# PHỤ LỤC B. TỔNG HỢP CÔNG VIỆC THEO TUẦN

## B.1. Tuần 1: mô hình và phạm vi đề tài

`Week1/Tuần 1.md` cùng đề cương PDF xác lập bài toán website cờ, bảng 15×15, trạng thái và các mục tiêu bot. Nghiên cứu luật phải làm rõ tên biến thể vì cùng tên Caro có nhiều quy ước; mã hiện hành dùng Freestyle, thắng khi một trục có ít nhất năm quân. Đề cương đề xuất các chức năng và kỹ thuật, còn mã nguồn cùng bằng chứng mới quyết định mức độ đã hiện thực. Các hình Mermaid ở Week1 là tài liệu minh họa, không phải phép chạy hệ thống.

## B.2. Tuần 2: thao tác trạng thái và kiểm tra kết thúc

`Week2/Tuan 2.md` mô tả ma trận, kiểm tra nước hợp lệ, cập nhật người chơi và bốn hướng kiểm tra. Bàn cờ hữu hạn cho phép quét cục bộ từ nước cuối, tránh phải tìm lại mọi chuỗi sau mỗi thao tác. Các test hiện hành trong `CaroGame/tests/game/core.test.ts` và engine Rust cần được đọc theo phạm vi của chúng; các con số test trong một bản tuần cũ không thay cho log chạy của phiên bản khác. Quy tắc thắng và hòa phải kiểm trước khi chấp nhận nước tiếp theo.

## B.3. Tuần 3: giao diện và vòng đời ván chơi

`Week3/Tuan 3.md`, `Week3/assets` và source `CaroGame` ghi nhận công việc tổ chức giao diện, bàn cờ, sự kiện và trạng thái. Các sơ đồ UI cần được xem như bản thiết kế của thời điểm xuất; source hiện tại cho thấy controller điều phối game, React hiển thị và Pixi xử lý cảnh bàn cờ. Chức năng Undo, Reset và hủy yêu cầu bot cần được kiểm tra dưới điều kiện bất đồng bộ vì kết quả từ một ván cũ có thể đến sau khi trạng thái đã thay đổi. Các fixture controller và Worker giúp kiểm phần này, song không thay thế kiểm thử thao tác vật lý.

## B.4. Tuần 4: hình thế, lượng giá và baseline

Các file riêng trong `Week4` giải thích nhận diện chuỗi, hàm lượng giá, Random Bot và Rule-Based Bot. Phân biệt các trọng số trong thư viện reference với trọng số của engine game: hai module có thể cùng tên chiến lược nhưng không cùng tham số. Thí nghiệm Rule-Based–Random và bảy fixture được bàn ở mục 5.8 là bằng chứng hữu hạn; chúng không chứng minh chính xác toàn bộ taxonomy. Ảnh biểu đồ và trang present có các giá trị chưa đồng bộ, do đó phải đối chiếu với JSON và script trước khi trích dẫn.

## B.5. Tuần 5: Minimax và cây trò chơi

`Week5/Week_05_Rust_Minimax_Search_Tree_Analysis.md` giải thích cây trạng thái, lượt MAX/MIN, độ sâu và hoàn tác. Giá trị của một nước phụ thuộc hàm đánh giá tại lá và tập ứng viên; giảm độ sâu tiết kiệm công việc nhưng có thể bỏ sót hậu quả xa hơn. `research/week_05_09` lưu fixture và các phép đối chiếu reference; engine game cũng có Minimax làm baseline trong corpus riêng. Không nên coi các số trong một corpus như số đo của đường Worker.

## B.6. Tuần 6: Alpha-Beta

`Week6/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.md` nghiên cứu việc duy trì cận alpha và beta, dừng duyệt khi cận cho thấy nhánh không thể cải thiện quyết định. Với cùng cây và cùng hàm đánh giá, dữ liệu corpus ghi nhận các cặp so sánh giá trị; số lượng node được giảm phụ thuộc vị trí và thứ tự. Một cutoff là sự kiện dừng xét nhánh, còn số node tiết kiệm không được suy trực tiếp từ số cutoff. Các con số trong Chương 5 là ví dụ có cấu hình và nguồn CSV rõ ràng.

## B.7. Tuần 7: ứng viên, thứ tự và cấu hình độ khó

`Week7/Week_07_Candidate_Move_Generation.md` xét tập ô gần quân đã có theo khoảng cách Chebyshev và chi phí của giới hạn ứng viên. Ở engine game hiện tại, chính sách soft cap giữ nước hoàn tất thắng hoặc chặn thắng ngay trước khi lấy thêm ứng viên thường. Điều đó bảo vệ một nhóm tình huống chiến thuật trong corpus, nhưng không bảo đảm mọi nước phát triển hoặc fork được chọn. Sáu nhãn giao diện là cấu hình chiến lược và độ sâu, chưa phải thang sức mạnh đã calibration bằng giải đấu.

## B.8. Tuần 8: move ordering

`Week8/Week_08_Move_Ordering_Optimization.md` tập trung vào thứ tự xét các nước mà không thay tập thành viên. Nếu cùng cây, thay thứ tự không làm thay giá trị Minimax lý tưởng, nhưng có thể thay số nhánh cắt và nước được chọn khi hòa điểm. Chi phí xếp hạng cần được tính, vì ít node hơn không chắc làm tổng thời gian giảm. Corpus reference ghi cả `ordering_evaluations` để phân biệt công việc xếp hạng với số lá tìm kiếm; bảng minh họa hard-code trong present chưa có truy xuất raw phù hợp.

## B.9. Tuần 9: Zobrist và bảng chuyển vị

`Week9/Week_09_Zobrist_Hashing_and_Transposition_Table.md` bàn về khóa tăng dần, lưu giá trị và kiểu cận trong reference. `verification.json` ghi 3.998 kiểm tra hash khi đi và 3.998 khi hoàn tác; `tt_semantics.json` ghi các lớp exact, lower và upper trong fixture đã xem. Probe cho thấy việc dùng lại bảng khi thay root có thể sai điểm, nên cần xác định namespace và xử lý điểm mate trước khi tích hợp. Đây là kết quả nghiên cứu reference, không xác nhận Master trong engine game hiện tại dùng bảng đó.

## B.10. Tuần 10: iterative deepening và kế hoạch đánh giá

`Week10/Week_10_Iterative_Deepening_Time_Budget_and_Evaluation.md` mô tả tìm kiếm tăng dần độ sâu và đề xuất protocol đánh giá bot. `research/week_05_09/results/budget_abort.json` ghi một probe ngân sách node trong reference: state được khôi phục và độ sâu hoàn tất cuối cùng là 2. Tổng node báo cáo trong probe không tính vòng lặp bị ngắt, nên không gọi 40 là toàn bộ node đã thử. Nội dung giải đấu, time budget thực và các chức năng tích hợp vào game cần bằng chứng thực thi riêng trước khi ghi hoàn thành.

# PHỤ LỤC C. KIỂM KÊ THƯ MỤC VÀ HỒ SƠ LIÊN QUAN

## C.1. Source, sản phẩm và hồ sơ theo tuần

`CaroGame/` là ứng dụng web có package riêng, source React/TypeScript, lớp bàn cờ Pixi, game core, controller, adapter Worker/WASM, i18n, tích hợp host và các file test. `present/` là website trình bày nghiên cứu riêng, có component theo tuần, mô phỏng và dữ liệu/ảnh tĩnh; nó không phải bằng chứng rằng mọi thành phần được minh họa đang chạy trong game. `Week1/` đến `Week10/` là tài liệu và hình theo chủ đề từng tuần như Phụ lục B; một số tuần có bản DOCX/PDF được tạo trước snapshot Markdown cập nhật, nên không mặc nhiên xem mọi bản xuất là đồng bộ.

`benchmark/` chứa Rust native harness, TypeScript harness và hai JSON tổng hợp. `research/` chứa hai nhóm thí nghiệm có ngày, fixture, raw CSV, JSON và snapshot baseline. `assets/` chứa hình, sơ đồ và ảnh trạng thái dựng; mỗi ảnh phải xác định là sơ đồ khái niệm, ví dụ thủ công hay biểu đồ từ dữ liệu đo. `scripts/` chứa công cụ sinh ảnh, điều phối benchmark và cập nhật roadmap; sự tồn tại của script cho phép xem quy trình dự kiến nhưng không tự chứng minh script đã được chạy ở trạng thái hiện tại.

`rules/` chứa hướng dẫn quản trị layout, roadmap và hình ảnh của project; `archived/` giữ draft và roadmap cũ để tham khảo lịch sử. `.gemini/` và `.obsidian/` chứa cấu hình hỗ trợ môi trường tài liệu, còn `.git/` chứa metadata của repository. Các thư mục cấu hình và lịch sử không phải tính năng trò chơi; nội dung trong đó không được xem là kết quả đo hoặc tự động có hiệu lực như yêu cầu hiện tại.

## C.2. File gốc, mẫu và giới hạn của bản kiểm kê

Ở root, `README.md`, `LAYOUT.md`, `PLAN.md`, `ROADMAP.md`, `Week_05_09_Report_Index.md`, `Caro_Rules_Heuristic_Rust_WASM_Review.md` và `BENCHMARK_RUST_VS_TYPESCRIPT.md` là các tài liệu định hướng hoặc mô tả. Hai file `Mau bao cao do an co so.docx` và `templatereport.docx` là mẫu người dùng cung cấp; nội dung mẫu cần được phân biệt với yêu cầu trực tiếp. Các file cấu hình `.gitattributes`, `.gitignore`, `.mise.toml` phục vụ repository/môi trường. Báo cáo DOCX được tạo trong lượt làm việc là output, không phải nguồn chứng minh lịch sử implementation.

Danh sách máy đọc tại `/tmp/caro-report-expanded/evidence_inventory.json` liệt kê từng file đã thấy dưới các thư mục, kèm vai trò root, số lượng và SHA-256 các dataset chính; danh sách bỏ qua nội bộ `.git`, `node_modules`, `target` và `dist`. Kiểm kê tên file giúp bảo đảm không bỏ thư mục, nhưng không có nghĩa mọi claim trong mọi file đã được xác thực. Nguồn có mức độ tin cậy cao hơn cho hành vi hiện hành là code cùng log và raw gắn đúng phiên bản; kế hoạch, roadmap, biểu đồ hard-code và bản trình bày cần được ghi theo vai trò tương ứng.
