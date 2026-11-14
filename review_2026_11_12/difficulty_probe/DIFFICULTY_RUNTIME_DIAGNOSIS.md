# Chẩn đoán runtime độ khó — 2026-11-12

## Phạm vi và trạng thái

Đã kiểm tra độc lập Node 22.23.3 trên source `/home/pro/Downloads/basicproject/CaroGame`, revision `7e1e2d51321a4e6b2e26493c34f0a485d4de39cc`, binary WASM SHA-256 `1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989`. Tại thời điểm chạy probe ban đầu chưa có URL hoặc vị trí bàn cờ cụ thể. Sau đó user cung cấp screenshot của iframe trỏ tới `https://10-caro.vercel.app`; mục đối chiếu bundle public ở cuối ghi nhận phiên bản tải từ URL này. Chưa có lịch sử ván cụ thể, nên **chưa tái hiện được hiện tượng sức chơi yếu hoặc chứng minh regression**. Probe không thay source hay binary.

## Kết quả đo

`node probe.mjs`: gọi trực tiếp binary qua `initSync` và `ai_move_seeded` seed 42, không qua AIController/Worker. Sáu lịch sử lần lượt X/O hợp lệ, chưa kết thúc và O tới lượt; 36 lần tìm đều trả ô trống. Đầu vào đầy đủ, nước đi, counters và thời gian có trong `probes.json`; tọa độ `(x,y)` tính từ 0.

| Fixture | Easy | Normal–Master | Ý nghĩa |
|---|---|---|---|
| opening | (10,8) | (7,6) | thế mở đầu |
| midgame | (10,12) | (8,9) | thế giữa ván |
| own_win | (10,12) | (7,7) | O thắng ngay |
| single_block | (12,8) | (4,0) | chặn một đầu duy nhất của X |
| double_threat | (12,8) | (8,7) | X có 4 quân mở hai đầu: chặn một đầu vẫn thua nếu không có thắng ngay |
| fork_setup | (10,12) | (7,7) | O tạo giao điểm hai hàng ba mở; đây là fixture chiến thuật, không chứng minh ép thắng |

Easy seed 42 chỉ là một mẫu ngẫu nhiên, không đại diện toàn bộ các nước Easy. Cùng nước ở sáu fixture **không chứng minh các mức có cùng sức mạnh**. Kết quả không so sánh xác suất thắng, không đo độ mạnh tổng quát và không phải benchmark thời gian; thời gian Node và counters phụ thuộc vị trí, máy và nhánh tìm kiếm.

Telemetry binary trên cả sáu thế: Easy ID 0 strategy `random`, depth 0; Normal ID 1 `rule_based`, depth 1; Hard ID 2 `alpha_beta`, depth 2; Very Hard ID 5 depth 3; Expert ID 3 depth 4; Master ID 4 depth 5. Ví dụ opening số nodes lần lượt 2, 33, 45, 203, 415, 1326. Depth 0 ở Easy là không lookahead; 1 ở Normal là baseline một lượt, không phải alpha-beta. `completed_depth` báo độ sâu cấu hình được tìm đến, không chứng minh mọi nhánh đều đi sâu đến đó vì terminal/cutoff. Candidate caps trong source Rust giảm 15/12/10/8 khi Hard→Master, nên tăng depth không tự chứng minh thứ tự sức mạnh.

`node tactical.mjs`: transpile source AIController, TacticalMoveResolver và GameState trong bộ nhớ rồi gọi 16 lần trực tiếp tại Node. Với `own_win`, `single_block`, `double_threat`, cả bốn mức Hard–Master trả cùng nước, `source=tactical`, `depth=0`: lần lượt `(2,7)`, `(4,0)`, `(3,7)`. Nhánh tactical đi ô thắng trước rồi chặn, quét thứ tự hàng/cột; nhánh này bypass WASM theo source. Vì vậy nước ở hai thế mở hai đầu có thể khác kết quả WASM trực tiếp mà vẫn là nước thắng/chặn tương ứng. Với `fork_setup`, cả bốn lệnh chạm nhánh Worker và báo `ReferenceError: Worker is not defined` trong Node; đây là giới hạn môi trường probe, **không phải kết luận lỗi browser**. Chi tiết `tactical.json`.

## Giới hạn và bước phân biệt

Không có đo browser Worker, host, bản đang triển khai, trận đấu cũ–mới, đối thủ chuẩn, hay ván cụ thể của user. Chưa thể kết luận nguyên nhân cảm nhận yếu hoặc thay đổi sức mạnh. Cần URL/checkout user đang chơi, mức đã chọn, màu/luật, lịch sử nước hoặc screenshot trước nước AI và nước AI thực tế; sau đó replay đúng đường UI và đối chiếu phiên bản trước nếu có. Chỉ so sánh lịch sử với cùng luật, cài đặt, seeds và đối thủ có thể cung cấp bằng chứng về regression; một nước trùng hay telemetry depth riêng lẻ không đủ.

## Đối chiếu bundle public được tải ngày 2026-11-12

HTML `https://10-caro.vercel.app/` trỏ đến `/assets/index-CHy0JjkV.js` (SHA-256 `e69bbb81a72729ce01ff5cddee4cdfb026e33b44a957c5359faf93acfedab6d7`). Đọc bundle minified: danh sách UI đúng bốn mức `easy`, `normal`, `hard`, `expert`; chọn mức gọi `setDifficulty`, reset ván. AIController live gọi kiểm tra tactical thắng/chặn cho **mọi mức** trước khi chuyển request sang worker; nếu tactical có kết quả, stats gán depth 0 và nodes 0. Đây là bằng chứng static từ bundle public, chưa phải quan sát tương tác browser.

Worker `/assets/worker-DdGmBecY.js` (SHA-256 `8d3a2b4518cbbac39a72abebf7fa744ef517065eb164929611447f7e6c0b288c`) ánh xạ IDs 0/1/2/3/4 và gán cứng depth 1/2/4/6/8, nodes 0; các con số này **không phải đo completed depth**. Worker tải `/assets/gomoku_engine_bg-Du90GCPD.wasm` SHA-256 `51cc2fa5c2b1b7edf7406e032cf9b5385e5d3419085c3e893b954c41823cf6f0`, trùng byte binary Git tại `c99da4f`, khác binary local `1ff854…017989`. Hash trùng binary không xác định revision toàn bộ deployment. Các probe sáu mức ở trên đo bản local hiện tại, không áp kết luận runtime lên bản live.
