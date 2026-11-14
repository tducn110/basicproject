# PHÂN TÍCH CHI TIẾT CÁC THUẬT TOÁN TRONG ĐỀ TÀI

## 1. Phạm vi và ký hiệu

Chương này trình bày từ biểu diễn bàn cờ tới cách máy lựa chọn nước đi. Nội dung được đối chiếu với ba cơ sở mã khác nhau, vì cùng một tên thuật toán không có nghĩa ba chương trình thực hiện cùng một quy trình. Thứ nhất, **engine Rust của ứng dụng** nằm ở `gomoku-main/engine/src`; gói WebAssembly của engine được dùng bởi ứng dụng `basicproject/CaroGame`. Thứ hai, **TypeScript legacy** nằm ở `CaroGame/src/game/bot`; mã này có các thuật toán tìm kiếm riêng nhưng `AIController` hiện sử dụng `GomokuWasmEngine`, nên không mô tả legacy là đường xử lý mặc định. Thứ ba, **Rust reference** nằm tại `caro-core-reference/src`, là thư viện phục vụ nghiên cứu và thử nghiệm native. Những kết quả trong reference không tự chứng minh cùng hành vi trong browser hoặc trong engine Rust được tích hợp.

Trang thuyết trình `present` chứa các thành phần `Week5Minimax`, `Week6AlphaBeta`, `Week7CandidatesAndTiers`, `Week7Production`, `Week8To10AdvancedAI` và bàn minh họa `InteractiveCaroBoard`. Đặc biệt, `present/src/utils/caroEngine.ts` có hàm chọn nước, lượng giá và luật riêng cho demo. Số hiển thị cố định trong trang hoặc biểu đồ là nội dung trình bày, cần đối chiếu với source và dữ liệu thí nghiệm gốc trước khi dùng làm bằng chứng. Ví dụ “100/100”, “60 FPS” hay bảng 8 MB được nêu ở một số thành phần thuyết trình không được coi là kết quả đã xác nhận cho engine game hiện tại.

Đặt kích thước bàn N = 15, điều kiện thắng K = 5. Tọa độ `(x, y)` trong Rust lần lượt là cột và hàng; TypeScript dùng `(row, col)` tương ứng với `(y, x)`. Một **ply** là một lần đặt một quân, còn một cặp lượt người–máy có thể gồm hai ply. Gọi B là bàn hiện tại, p là người đang xét, `A(B)` là tập nước được thuật toán cho phép và d là số ply tìm kiếm còn lại. Cần phân biệt `A(B)` chứa toàn bộ ô trống với tập ứng viên được lọc: đổi tập này là đổi cây trò chơi được khảo sát.

## 2. Biểu diễn bàn cờ và bất biến cập nhật

### 2.1. Ma trận 15 × 15

Engine game biểu diễn bàn bằng `[[Cell; 15]; 15]`, trong đó mỗi `Cell` là `Empty`, `Black` hoặc `White`. Với miền tọa độ từ 0 đến 14, `B[y][x]` chỉ ô ở hàng y, cột x. Có 225 ô; khi mã hóa tuần tự theo hàng, chỉ số một chiều của ô là `i = 15y + x`. Ví dụ tâm `(7,7)` có chỉ số 112, góc dưới bên phải `(14,14)` là 224. Quy đổi ngược bằng `x = i mod 15` và `y = floor(i/15)`.

`board.rs::Board` sở hữu mảng ô và `move_count`, còn `lib.rs::Game` sở hữu người tới lượt, người thắng và lịch sử. Phân chia này quan trọng: bàn có thể trả lời ô nào trống, nhưng lịch sử do Game giữ mới xác định nước gần nhất để hoàn tác theo trình tự. Source dùng `repr(u8)` cho `Cell`; payload 225 ô gồm 225 giá trị một byte. Kích thước toàn bộ `Board` còn có bộ đếm và padding. Bản đo native ghi `Cell` 1 byte, `Board` 240 byte trong môi trường đã đo; không suy luận đây là kích thước của đối tượng trong mọi đích biên dịch hoặc tổng bộ nhớ WASM.

Bất biến đặt quân là tọa độ nằm trong bàn, quân đặt không phải Empty và ô đang trống. Đặt thành công đổi đúng một ô và tăng `move_count` thêm một; nếu bị từ chối, bàn không thay đổi. Ngoài điều kiện của Board, `Game.play_move` còn chặn trạng thái đã thắng và quyết định quân theo lượt. Một ô trống về hình học không đồng nghĩa nước đi được phép sau khi ván đã kết thúc.

### 2.2. Apply và undo trong tìm kiếm

Đầu vào của `Board.place(x,y,p)` là tọa độ và quân. Đầu ra là thành công hoặc lỗi; khi thành công, bàn chuyển từ B thành B'. `Board.undo(x,y)` xóa một ô đang có quân và giảm số lượng; yêu cầu ngoài biên hoặc ô trống trả false và không sửa bàn. Khi dùng trong tìm kiếm, hàm đệ quy chịu trách nhiệm ghép đúng `place` và `undo` trước khi đi sang nhánh khác, kể cả khi xảy ra cắt tỉa.

Ví dụ trạng thái B có X ở `(7,7)` và O ở `(8,7)`, bộ đếm bằng 2. Nhánh giả định đặt X tại `(7,8)` tạo B' với bộ đếm 3. Sau khi đánh giá nhánh, undo `(7,8)` phải trả đủ B và bộ đếm 2. Nếu chỉ xóa quân mà không giảm bộ đếm, kiểm tra bàn đầy sẽ sai; nếu chỉ giảm bộ đếm mà không xóa quân, nhánh sau sẽ nhìn thấy nước giả định. Vì vậy phép thử cần so toàn bộ trạng thái thuộc owner, không chỉ một trường.

```text
THỬ_MỘT_NƯỚC(board, move, player):
    nếu place(move, player) thất bại: bỏ nhánh
    value ← xử lý trạng thái sau nước đi
    undo(move)
    trả value
```

Trong engine game, `search.rs::search` sao chép bàn một lần ở gốc, sau đó tìm kiếm dùng bàn làm việc với place/undo; `search_in_place` cho phép kiểm tra bàn được khôi phục trực tiếp. Sao chép một lần không chứng minh mức tăng tốc cụ thể khi chưa đo. Rust native corpus ghi 820 phép kiểm tra phục hồi bàn làm việc, nhưng vẫn là một tập hữu hạn. Với phép truy cập mảng đã biết tọa độ, place/undo có thời gian O(1) và bộ nhớ phụ O(1); việc tạo bản sao toàn bàn là O(N²). Source: `gomoku-main/engine/src/board.rs::{place,undo}` và `search.rs::{search,search_in_place}`. !FIG[apply-undo]

## 3. Luật thắng Freestyle và quét theo nước cuối

### 3.1. Điều kiện thắng

Trong Freestyle Gomoku, người chơi thắng khi có ít nhất năm quân liên tiếp theo chiều ngang, dọc hoặc một trong hai đường chéo. Do đó sáu quân liên tiếp cũng thỏa điều kiện; source không yêu cầu chính xác năm hay loại trừ chuỗi bị chặn hai đầu. Quy ước này cần được viết rõ vì tên “Caro” trong những bối cảnh khác có thể đi kèm luật khác. Phần mô tả luật trong tài liệu Gomocup cũng phân biệt các biến thể; báo cáo áp dụng luật được code triển khai chứ không suy diễn từ tên trò chơi.

Cho nước vừa đặt m và tập bốn hướng `D = {(1,0),(0,1),(1,1),(1,-1)}`. Với mỗi hướng d, đếm số quân liên tiếp cùng màu từ m về hai phía, gọi là f và b. Chiều dài chuỗi đi qua m là `L_d = 1 + f + b`. Nước thắng khi tồn tại d mà `L_d ≥ 5`. Ví dụ một hàng có dạng `X X [X] X X`, quân trong ngoặc vừa đặt, thì f = 2 và b = 2; tổng bằng 5. Với `X X X [X] X X`, tổng lớn hơn hoặc bằng 5, vẫn thắng trong luật này.

### 3.2. Quy trình và độ phức tạp

```text
CHECK_WIN(board, last):
    nếu last ngoài bàn hoặc ô trống: trả không có người thắng
    p ← quân tại last
    với mỗi hướng trong bốn trục:
        count ← 1
        quét tối đa bốn ô liên tiếp theo hướng d
        quét tối đa bốn ô liên tiếp theo hướng -d
        nếu count ≥ 5: trả p
    trả không có người thắng
```

Ở mỗi phía, bốn ô là đủ để quyết định một chuỗi ít nhất năm qua ô vừa đặt. Nếu gặp biên hoặc quân khác, việc quét dừng sớm. Cận trên của đoạn quét là 4 trục × 2 phía × 4 ô = 32 lần đọc ô lân cận, cộng việc đọc ô gốc. Với K cố định bằng 5, độ phức tạp là O(1) theo kích thước bàn; nếu K là tham số thay đổi, cận là O(K). Đây là cận số thao tác chứ không phải số lần đọc luôn xảy ra hoặc thời gian chạy đo được.

Giả thiết quan trọng là trước nước vừa đặt, trạng thái chưa kết thúc. Nếu nhận một bàn bất kỳ từ bên ngoài, chỉ kiểm tra nước cuối không đủ chứng minh bàn không chứa chuỗi thắng cũ. Vì vậy `Board.check_winner` có đường quét toàn bàn tại root; các nút con sử dụng `check_winner_at` sau nước vừa đặt. Giao diện TypeScript dùng `FreestyleGomokuWinRule.evaluate` và phương thức `collect` theo bốn trục. Source: `gomoku-main/engine/src/board.rs::{check_winner_at,count_line_through,check_winner}`; `CaroGame/src/game/core/WinRules.ts`. !FIG[win-axes]

## 4. Random và rule-based: đường cơ sở

### 4.1. Random

Random là đường cơ sở nhằm tạo một đối thủ có thể chọn nước mà không tìm kiếm nhiều lớp tương lai. Trong `ai.rs::baseline`, engine kiểm tra trạng thái kết thúc; nếu ván còn tiếp tục, nó lấy toàn bộ các ô trống bằng `legal_moves`, sinh số giả ngẫu nhiên từ seed và lấy chỉ số `R mod số_ô_trống`. Từ bàn chỉ có một quân, tập chọn có 224 ô. Cùng seed và cùng trạng thái tạo cùng kết quả trong fixture, giúp tái lập kiểm thử; runtime WASM nhận seed thông qua nguồn ngẫu nhiên JavaScript.

```text
RANDOM(board, seed):
    nếu kết thúc hoặc không có nước: trả không có nước
    L ← danh sách tất cả ô trống
    i ← seeded_u64(seed) mod |L|
    trả L[i]
```

Sinh danh sách cần quét O(N²) ô và tối đa O(N²) bộ nhớ cho danh sách; lấy phần tử sau đó là O(1). Phép modulo có thể tạo sai lệch xác suất nhỏ khi miền số sinh không chia hết số ô; không gọi lựa chọn là phân phối đều hoàn hảo khi chưa kiểm chứng điều đó. Sau khi chọn, source đánh giá trạng thái sau nước đã chọn để trả điểm và thống kê; phép đánh giá này không điều khiển quyết định Random. `completed_depth = 0` vì không tìm kiếm lookahead, nhưng bộ đếm nút có thể gồm gốc và trạng thái sau nước chọn. Demo ở `present` lại chọn ngẫu nhiên trong tập Chebyshev; hai cách chọn khác nhau và không được gộp thành một.

### 4.2. Rule-based và quét chiến thuật

Rule-based sử dụng thứ tự ưu tiên được lập trình trước thay vì đệ quy nhiều lớp. Trong engine game, Normal gọi `select_candidates`, rồi ưu tiên nước thắng của mình; nếu không có thì chọn nước chặn một nước thắng ngay của đối thủ; nếu cả hai không có, đặt thử từng ứng viên và chọn điểm heuristic cao nhất sau một ply. Đầu vào là bàn, người đánh và cấu hình; đầu ra là một nước hợp lệ cùng điểm và bộ đếm.

```text
RULE_BASED(board, player):
    C ← chọn ứng viên gần quân
    nếu C có nước thắng ngay: trả một nước thắng
    nếu C có ô đối thủ thắng ngay: trả một ô chặn
    với mỗi m trong C:
        place(m, player); s ← terminal hoặc evaluate; undo(m)
        ghi lại nước có s lớn nhất
    trả nước tốt nhất
```

Ví dụ X đang có bốn quân liên tiếp ở hàng 0, cột 0–3; cột 4 trống. Nếu O đến lượt, đặt O tại cột 4 chặn được mối đe dọa duy nhất ở phía phải vì phía trái nằm ngoài bàn. Nếu bốn quân nằm giữa bàn và cả hai đầu trống, đối thủ có hai nước hoàn thành riêng; chặn một đầu không giải quyết được đầu còn lại. Giữ cả hai tọa độ trong tập ứng viên không có nghĩa một nước có thể chặn đồng thời. Test Rust còn có ví dụ bốn quân `XX_XX` mà quân tại khoảng trống tạo thắng: logic quét hoàn thành có thể nhận diện trường hợp đó dù evaluator không phân loại đầy đủ mọi dạng gián đoạn.

Ở ứng dụng TypeScript, `AIController.requestMove` còn gọi `findForcedTacticalMove` cho Hard, Very Hard, Expert và Master trước khi gửi Worker. Easy và Normal đi thẳng tới chiến lược Rust tương ứng. Nếu prepass trả nước, kết quả ghi `source = tactical`, độ sâu và node Rust bằng 0; đây không phải một lần Alpha-Beta hoàn tất. Độ phức tạp phụ thuộc cách sinh và thử nước; nói Rule-based là O(1) chỉ vì kiểm tra một ứng viên theo bốn trục sẽ bỏ qua việc duyệt cả tập ứng viên và lượng giá. Source: `engine/src/ai.rs::{baseline,choose_move}`, `engine/src/candidates.rs`, `CaroGame/src/game/ai/{AIController,TacticalMoveResolver}.ts`. !FIG[rule-decision]

## 5. Hàm đánh giá heuristic và terminal utility

### 5.1. Mục đích và nguyên tắc

Tìm kiếm giới hạn độ sâu thường dừng trước khi ván có người thắng. Hàm đánh giá tĩnh ước lượng chất lượng bàn tại điểm dừng, từ góc nhìn người chơi ở gốc. Heuristic là một mô hình gần đúng: điểm lớn hơn được coi là có lợi hơn theo các trọng số đã chọn, không phải xác suất thắng hoặc chứng minh nước đi tốt nhất trong toàn bộ ván.

Engine game `eval.rs::evaluate` duyệt bàn theo bốn trục. Chỉ khi ô đang xét là đầu của một chuỗi tối đại cùng màu trên trục đó, nó mới đếm độ dài và số đầu mở. Việc kiểm tra ô phía trước giúp tránh tính một chuỗi nhiều lần trên cùng trục. Điểm của các chuỗi thuộc người chơi được cộng, chuỗi đối thủ được trừ; điểm ưu tiên gần tâm cũng được cộng hoặc trừ tương ứng. Ký hiệu R_p là các chuỗi của p, w là trọng số và C là chênh lệch điểm tâm:

`E_raw(B,p) = Σ_(r∈R_p) w(length(r),open(r)) − Σ_(r∈R_opp) w(length(r),open(r)) + C(B,p)`.

### 5.2. Bảng trọng số và ví dụ

| Chuỗi liên tiếp | Hai đầu mở | Một đầu mở |
| --- | ---: | ---: |
| 5 quân trở lên | 1.000.000 | 1.000.000 |
| 4 quân | 50.000 | 5.000 |
| 3 quân | 5.000 | 500 |
| 2 quân | 200 | 50 |

Chuỗi không nằm trong các trường hợp trên nhận 0 từ `pattern_score`. Điểm tâm của một quân tại `(x,y)` là `max(0, 14 − |x−7| − |y−7|)`. Với một quân X ở tâm `(7,7)` và bàn còn trống, điểm chuỗi đơn bằng 0, điểm tâm là 14; đánh giá từ phía X là 14. Nếu quân thứ hai của X ở `(8,7)`, hai quân tạo một chuỗi ngang hai đầu mở được cộng 200, và điểm tâm là 14 + 13; nếu bỏ qua các đóng góp khác bằng 0, tổng là 227. Các ví dụ này giải thích cách tính của source, không biểu thị một ván hợp lệ đầy đủ giữa hai người.

Evaluator này đếm chuỗi liên tục, không có một taxonomy đầy đủ cho mọi mẫu như `XX_XX`, fork hoặc đòn nhiều bước. Nhận diện nước thắng ngay trong candidate assessment là logic riêng, không làm cho evaluator tự trở thành bộ nhận diện đầy đủ các pattern gián đoạn. Với số hướng cố định, duyệt các chuỗi tối đại và các ô nằm trong chúng có cận O(N²), với bộ nhớ phụ O(1) ngoài bàn. Chi phí search gọi evaluator nhiều lần vẫn phụ thuộc số nút lá.

### 5.3. Phân biệt thắng thực với thế tốt

`terminal_utility` được kiểm tra trước giới hạn độ sâu. Đặt `M = 100.000.000`, q là số ply đã đi từ gốc, tối đa 225: thắng của gốc có giá trị `M − q`, thua có giá trị `−M + q`, hòa bằng 0. Điểm heuristic bị giới hạn trong `[-H,H]`, với `H = M − 225 − 1 = 99.999.774`. Do đó ngay cả thắng chậm nhất trong giới hạn này vẫn lớn hơn mọi điểm heuristic; thua vẫn thấp hơn mọi điểm heuristic. Trừ q ưu tiên thắng sớm, còn cộng q ở nhánh thua ưu tiên kéo dài nếu buộc phải thua.

Ví dụ chiến thắng tại q = 2 có điểm 99.999.998, thắng tại q = 4 có điểm 99.999.996, nên thuật toán từ góc nhìn gốc thích phương án đầu nếu các điều kiện khác như nhau. Những con số này là giá trị hàm utility, không phải milliseconds hay xác suất. Source: `gomoku-main/engine/src/eval.rs::{evaluate,count_line,pattern_score,terminal_utility}`. !FIG[heuristic-runs]

## 6. Sinh ứng viên Chebyshev và giới hạn mềm

### 6.1. Miền lân cận

Xét hai ô a và b, khoảng cách Chebyshev là `d∞(a,b) = max(|a_x−b_x|, |a_y−b_y|)`. Với bán kính r, ứng viên là ô trống nằm cách ít nhất một quân đã có không quá r. Với một quân ở tâm `(7,7)` và r = 1, hình vuông 3 × 3 có 9 ô; trừ ô đã chiếm còn 8 ứng viên. Với r = 2, hình vuông 5 × 5 có 25 ô, còn 24 ứng viên. Trên tổng 224 ô trống sau nước đầu, việc chỉ xét 24 ứng viên giảm số lựa chọn ở gốc khoảng `1 − 24/224 = 89,29%`; đây chỉ là tỷ lệ hình học của ví dụ, không phải tỷ lệ giảm node hay thời gian của mọi ván.

Ở góc `(0,0)`, cửa sổ r = 2 bị cắt bởi biên và gồm 3 × 3 ô, tức 8 ô trống. Nếu có nhiều quân, một ô gần nhiều quân chỉ được thêm một lần nhờ mảng `seen`. Bàn trống có chính sách đặc biệt chọn tâm `(7,7)`; bàn đầy trả tập rỗng. Source giới hạn r tối đa 14 và dùng phép cắt biên an toàn.

```text
CANDIDATES(board, radius):
    nếu bàn đầy: trả []
    nếu bàn trống: trả [tâm]
    seen ← ma trận false
    C ← []
    với mỗi ô đang có quân:
        duyệt cửa sổ vuông bán kính radius, cắt tại biên
        nếu ô trống và chưa seen: đánh dấu và thêm vào C
    trả C
```

Nếu m là số quân, một cận theo thao tác duyệt là O(N² + m r²); bộ nhớ `seen` và danh sách có cận O(N²). Tập này là lựa chọn tiết kiệm, không phải tập mọi nước hợp lệ. Source: `board.rs::get_candidates`. !FIG[chebyshev-radius]

### 6.2. Giữ nước chiến thuật trước soft cap

`candidates.rs::assess` xét mỗi ô trong bốn trục, đếm quân hai phía của cả người chơi và đối thủ. Nếu đặt vào ô có thể nối ít nhất bốn quân sẵn có thành năm, ô đó là nước thắng; nếu đối thủ có thể hoàn thành năm tại ô đó, đây là ô chặn. Mỗi ô còn nhận điểm xếp hạng nhanh theo số quân liền kề và vị trí tâm. Các nước được sắp theo thứ tự thắng trước, chặn sau, điểm giảm dần, rồi tọa độ chuẩn để phá hòa.

Gọi T là hợp của các ô thắng ngay và ô chặn thắng ngay, c là cap và C là tập ban đầu. Chính sách giữ toàn T, sau đó lấy thêm các ô xếp hạng cao cho tới cap nếu còn chỗ. Có thể viết `C' = T ∪ Top_max(0,c−|T|)(C\T)`, với c được chuẩn hóa tối thiểu 1. Nếu `|T| > c`, số ứng viên trả về lớn hơn c, nên đây là cap mềm. Source thực hiện `truncate(max(cap,1,tactical_count))`. Nếu radius 0 không tạo được lân cận khi bàn còn trống, code dùng tập ô hợp lệ làm fallback.

Ví dụ cap bằng 1 nhưng có hai ô chặn thắng ngay: cả hai được giữ để thuật toán không bỏ một tọa độ chiến thuật trước khi tìm kiếm. Tuy nhiên, như đã xét ở mục rule-based, một nước chỉ chiếm một ô và có thể không cứu được ván. Với k ứng viên thô, đánh giá chiến thuật có chi phí O(kK) cho K tổng quát, K = 5 cố định nên tuyến tính theo k; sắp xếp O(k log k), bộ nhớ O(k). Bật hoặc tắt move ordering sau chọn giữ cùng membership trong chính sách đã kiểm, còn thứ tự duyệt thay đổi.

Bản reference cũ từng có cap cứng theo thứ tự khác: fixture `cap_loss.json` ghi cap 6 loại cả hai ô thắng `[7,2]`, `[7,7]`, trong khi tập không cap có 20 ứng viên. Đây là kết quả của reference riêng và minh họa rủi ro cap, không phải bằng chứng game hiện tại còn lỗi đó. Source game: `candidates.rs::{assess,select_candidates}`; evidence reference: `research/week_05_09/results/cap_loss.json`.

## 7. Move ordering: sắp thứ tự duyệt

Sắp thứ tự không tạo ra hoặc xóa nước khi membership được giữ cố định; nó thay đổi nhánh được xét trước. Đối với Minimax thuần, nếu duyệt đầy đủ cùng cây thì thứ tự không đổi giá trị, dù nước được chọn có thể khác khi nhiều nước bằng điểm. Đối với Alpha-Beta, một nhánh tốt được xem sớm có thể tạo giới hạn mạnh hơn, làm tăng khả năng cắt các nhánh về sau. Ngược lại, tính điểm và sắp xếp cũng tiêu tốn thời gian, vì vậy giảm số node không tự bảo đảm giảm latency.

Engine Rust dùng điểm nhanh từ quân liền kề và ưu tiên thắng/chặn trong `candidates.rs::assess`; đó không phải một lần `evaluate` toàn bàn cho từng ứng viên. Để tắt thứ tự ưu tiên duyệt mà giữ membership, source chọn tập sau xếp hạng/cap rồi sắp lại theo tọa độ. Vì lựa chọn membership vẫn cần đánh giá, bộ đếm `ordering_evaluations` có thể khác 0 ngay cả khi traversal ordering tắt. Ví dụ ba nước A, B, C có cùng membership và điểm nhanh tương ứng 10, 50, 30: bật ordering duyệt B, C, A; tắt có thể duyệt theo thứ tự tọa độ. Không thể lấy riêng sự khác biệt về thời gian để kết luận cái nào mạnh hơn về chất lượng nước đi.

Trong reference, `search/ordering.rs` có chính sách và chi phí đánh giá khác. Việc cùng gọi là move ordering không làm hai implementation tương đương. Corpus game ngày 23/10 có 408 cặp so giá trị khi thay thứ tự trên các cấu hình và lần lặp ghi trong dữ liệu; đây không phải 408 bàn cờ độc lập hay chứng minh mọi trạng thái. Source: `engine/src/candidates.rs`, `engine/src/search.rs`; reference: `caro-core-reference/src/search/ordering.rs`. !FIG[ordering]

## 8. Minimax: tìm kiếm đối kháng

### 8.1. Đầu vào, đầu ra và công thức

Minimax mô hình hóa hai phía chọn nước luân phiên: MAX muốn tối đa điểm từ góc nhìn gốc, MIN muốn tối thiểu điểm đó. Đầu vào gồm bàn, người đến lượt, độ sâu d, tập ứng viên, luật và evaluator; đầu ra là điểm cùng một nước ở gốc. Nếu trạng thái kết thúc thì trả terminal utility; nếu d = 0 và chưa kết thúc thì trả heuristic. Với tập A(s) được cố định:

`V(s,d) = U(s)` nếu s kết thúc; `E(s)` nếu d = 0; `max_(a∈A(s)) V(T(s,a),d−1)` khi MAX đi; `min_(a∈A(s)) V(T(s,a),d−1)` khi MIN đi.

`T(s,a)` là trạng thái sau nước a. Tại mỗi nhánh, source đặt quân, gọi đệ quy với người đối diện, rồi undo. Ở gốc, chương trình lưu tọa độ có giá trị tốt nhất. Nút lá có thể là kết quả thắng/hòa hoặc điểm heuristic khi chạm giới hạn, không nhất thiết là ván đã kết thúc.

```text
MINIMAX(board, player, depth, last):
    nếu trạng thái kết thúc: trả utility
    nếu depth = 0: trả heuristic
    moves ← chọn ứng viên
    best ← −∞ nếu player là MAX, ngược lại +∞
    với mỗi m trong moves:
        place(m, player)
        value ← MINIMAX(board, opponent, depth−1, m)
        undo(m)
        best ← max(best,value) nếu MAX, ngược lại min(best,value)
    trả best
```

### 8.2. Ví dụ và độ phức tạp

Xét cây minh họa có MAX ở gốc, chọn A hoặc B; sau mỗi nước là MIN. Hai lá dưới A có giá trị 3 và 5 nên MIN chọn 3. Hai lá dưới B có giá trị 2 và 9 nên MIN chọn 2. MAX so sánh 3 và 2, chọn A với giá trị 3. Đây là ví dụ cây giả định, không phải số đo từ một fixture bàn cờ. Mục đích của bước MIN là dự đoán đối thủ chọn phản ứng gây bất lợi nhất cho MAX, thay vì chỉ tính nước của máy rồi giả sử đối thủ hợp tác.

Nếu mỗi nút có tối đa b nước và tìm sâu d ply, số nút trong trường hợp đầy đủ tăng theo O(b^d). Đây là mô hình khi b được coi là cận nhánh, không phải lời hứa mỗi tầng có đúng b nước. DFS giữ stack và các vector ứng viên còn sống; nếu mỗi tầng giữ tối đa b phần tử, bộ nhớ phụ khoảng O(db) cộng bàn làm việc. Với bàn N × N, cận bảo thủ là O(dN²) cho các danh sách ứng viên đang sống. Không cần cấp phát toàn bộ cây thành các object.

Trong engine game, `SearchAlgorithm::Minimax` tồn tại để đối chiếu trong native search; cấu hình chơi Hard trở lên dùng `AlphaBeta`. Reference có `search/minimax.rs` độc lập. Kết quả tính đúng giá trị của cây được khảo sát còn phụ thuộc tính đúng của sinh nước, terminal, evaluator và undo. Tác phẩm của Shannon về chơi cờ bằng máy thảo luận về việc tìm trước và lượng giá trạng thái trung gian; tài liệu đó là cơ sở lý thuyết, không đo hiệu năng của project này. !FIG[minimax-tree]

## 9. Alpha-Beta: cắt tỉa trên cùng cây

### 9.1. Ý nghĩa alpha, beta và điều kiện cắt

Alpha là cận dưới của giá trị MAX có thể bảo đảm trong ngữ cảnh đang xét; beta là cận trên của giá trị MIN có thể bảo đảm. Tại nút MAX, sau mỗi nhánh cập nhật `alpha = max(alpha,best)`. Tại nút MIN, cập nhật `beta = min(beta,best)`. Khi `alpha ≥ beta`, các anh em còn lại không thể thay đổi quyết định đã được bảo đảm ở nút tổ tiên nên có thể bỏ qua.

```text
ALPHABETA(board, player, depth, alpha, beta):
    nếu kết thúc: trả utility
    nếu depth = 0: trả heuristic
    với mỗi nước trong cùng tập ứng viên:
        place; v ← ALPHABETA(child, đối thủ, depth−1, alpha, beta); undo
        nếu MAX: best ← max(best,v); alpha ← max(alpha,best)
        nếu MIN: best ← min(best,v); beta ← min(beta,best)
        nếu alpha ≥ beta: tăng cutoff; dừng duyệt các anh em còn lại
    trả best
```

Trên cây mục trước, duyệt A trước cho giá trị 3; MAX có alpha = 3. Sang nút MIN của B, lá đầu là 2 nên beta = 2. Vì beta ≤ alpha, MIN đã có thể chọn không lớn hơn 2, trong khi MAX đã có A đạt 3; không cần xem lá còn lại giá trị 9 để chọn giữa A và B. Kết quả gốc vẫn là 3. Nếu thay thứ tự hoặc cấu trúc cây, vị trí và số lần cắt có thể khác.

### 9.2. Điều kiện so sánh và đánh giá

Để kiểm tra Alpha-Beta so với Minimax phải giữ cùng bàn, lượt, độ sâu, luật, terminal utility, evaluator và membership ở mọi nút. So sánh khác membership không chứng minh tính tương đương của cắt tỉa vì một bên đã bỏ nước từ trước. Trong trường hợp tệ, Alpha-Beta vẫn có bậc O(b^d); với giả thiết lý tưởng về cây đều và thứ tự rất tốt, số lá có thể tăng gần O(b^(d/2)). Mô hình lý tưởng không dự báo latency trên một thiết bị.

`SearchContext.value` của game chia sẻ cùng logic đệ quy cho cả hai chế độ, chỉ bật điều kiện cắt khi cấu hình là AlphaBeta. Thống kê `cutoffs` đếm sự kiện dừng tại nút, không phải số toàn bộ hậu duệ giả định đã bị loại. Báo cáo Knuth và Moore phân tích tính chất của Alpha-Beta và ảnh hưởng của thứ tự; đây là nguồn lý thuyết, không chứng minh chính sách ứng viên hay evaluator của dự án. `engine_verification.json` ghi 408 cặp Minimax/Alpha-Beta trong corpus native ngày 23/10, có các lần lặp; phạm vi này không chứng minh tương đương trên mọi trạng thái. !FIG[alpha-beta-cutoff]

## 10. Iterative deepening và kiểm soát ngân sách

### 10.1. Ý tưởng và ví dụ

Iterative deepening tìm lần lượt ở độ sâu 1, 2, … đến giới hạn. Sau mỗi vòng hoàn tất, chương trình lưu kết quả; nếu vòng tiếp theo bị ngắt, nó trả kết quả của vòng hoàn chỉnh gần nhất thay vì lấy một kết quả mới khảo sát dở. Ví dụ vòng sâu 1 trả A, vòng sâu 2 trả B, vòng sâu 3 chưa xong khi hết ngân sách: kết quả có thể dùng là B với độ sâu hoàn tất 2. Nếu vòng đầu chưa hoàn tất thì kết quả hoàn chỉnh có thể không tồn tại; chương trình gọi cần xử lý trường hợp đó.

```text
ITERATIVE(board, max_depth, budget):
    last_complete ← none
    với depth từ 1 đến max_depth:
        nếu hết budget: dừng
        result ← tìm kiếm ở depth với budget còn lại
        nếu tìm kiếm bị ngắt: dừng
        last_complete ← result
        cập nhật budget đã sử dụng
    trả last_complete và trạng thái hết budget
```

Chi phí có lặp lại các tầng nông; với hệ số nhánh lớn, tầng sâu thường chiếm nhiều công việc hơn nhưng chi phí thực vẫn phụ thuộc thứ tự, cap và TT. Giá trị của phương pháp là có một kết quả đã hoàn thành khi bị ngắt, không phải bảo đảm chính xác tuyệt đối hay chạy dưới mọi deadline.

### 10.2. Hai implementation và trạng thái

Rust reference `search/iterative.rs::iterative_deepening` dùng **ngân sách số node** để giữ phép thử xác định; nó không cài sẵn deadline milliseconds của browser. Hàm khởi tạo TT riêng và thực hiện `search_optimized_alpha_beta` theo các độ sâu. Nếu bị `NodeBudgetExhausted`, nó trả `last_complete` và báo hết ngân sách. Thống kê tổng trong implementation ghi nhận các vòng hoàn tất; số node đã tiêu trong vòng bị ngắt không được cộng đầy đủ, nên không dùng trường aggregate như tổng mọi node đã thử.

TypeScript legacy `game/bot/search.ts::findBestMove` có iterative deepening với `performance.now()` và deadline; hàm `checkAbort` chỉ kiểm tra thời gian theo lô node. Vì vậy deadline là cơ chế ngắt theo thời điểm kiểm tra, không phải cam kết kết thúc đúng tuyệt đối tại từng mili giây. `try/finally` bảo đảm undo khi tìm kiếm bị ngắt ở các nhánh tương ứng. Đây là mã legacy không được `AIController` gọi làm tuyến mặc định. Engine Rust game hiện dùng cấu hình độ sâu cố định ở mỗi mức, không gắn nhãn Master đã có iterative deepening. !FIG[iterative-depth]

## 11. Zobrist hashing và cập nhật tăng dần

Zobrist hashing ánh xạ trạng thái bàn tới một mã số bằng cách gán mỗi cặp `(ô, màu)` một khóa giả ngẫu nhiên, rồi XOR các khóa của quân đang có. Có thể thêm một khóa cho người đến lượt để cùng một bàn nhưng khác lượt không bị mặc định xem là cùng trạng thái. Công thức khái quát: `H(B,p) = XOR_{ô có quân} Z[ô,màu] XOR Z_lượt` nếu quy ước lượt cần bật khóa đó.

Tính chất `a XOR k XOR k = a` cho phép cập nhật tăng dần khi đặt hoặc rút một quân. Ví dụ dùng số 4 bit chỉ để minh họa: hash ban đầu `H = 1010`, khóa của quân mới `Z = 0110`; sau đặt quân, `H' = 1010 XOR 0110 = 1100`. Khi hoàn tác, `1100 XOR 0110 = 1010`. Nếu đổi lượt, XOR thêm khóa lượt ở cả hai thao tác thích hợp. Con số ví dụ không phải khóa thật của chương trình.

Reference `zobrist.rs::hash` tính hash từ bàn và lượt; `after_play` cập nhật theo quân mới và chỉ đổi bit khóa lượt khi trạng thái thực sự đổi `to_move`. Điều này quan trọng vì trong reference một nước kết thúc có thể giữ nguyên người đến lượt. Tính hash lại từ đầu cần O(N²), cập nhật một nước O(1); bảng khóa cần O(N²) phần tử. Cùng hash không chứng minh chắc chắn hai trạng thái bằng nhau vì có khả năng va chạm. Hơn nữa, hash trong reference chưa mã hóa luật, evaluator, chính sách ứng viên hoặc góc nhìn root; cần quản lý ngữ cảnh khi dùng cache.

TypeScript legacy `BotBoard` dùng hai mảng 32-bit để biểu diễn hai nửa hash, cập nhật khi `makeMove` và `undoMove`; đây là implementation riêng. Engine Rust game hiện không có Zobrist trong `engine/src`. Báo cáo gốc của Zobrist trình bày kỹ thuật mã hóa vị trí và vấn đề lỗi truy xuất; không được diễn giải hash 64 bit là danh tính không va chạm. Source: `caro-core-reference/src/zobrist.rs`, `CaroGame/src/game/bot/board.ts`. !FIG[zobrist-xor]

## 12. Transposition table và ba loại cận

### 12.1. Vấn đề lặp lại trạng thái

Trong cây trò chơi, các thứ tự nước đi khác nhau có thể dẫn đến cùng một trạng thái bàn và người tới lượt. Nếu mỗi đường đều tính lại toàn bộ cây con, chương trình lặp công việc. Transposition table (TT) lưu kết quả đã tính theo hash để các lần gặp sau có thể tận dụng. Một bản ghi thường chứa độ sâu đã tìm, điểm, loại cận và nước đi tốt nhất dùng để gợi ý thứ tự. Cần kiểm tra ngữ cảnh, độ sâu và loại cận trước khi sử dụng; giá trị của một lần tìm có cắt tỉa không nhất thiết là giá trị chính xác.

Ở `caro-core-reference/src/search/transposition.rs`, `TTEntry` gồm `depth`, `score`, `bound` và `best_move`, được lưu trong `HashMap<u64, TTEntry>`. Hàm `with_capacity(16384)` đặt dung lượng dự trữ ban đầu, không quy định bảng cố định 16.384 phần tử hoặc 8 MB. Khi lưu cùng khóa, entry mới không thay entry cũ có độ sâu lớn hơn; entry sâu hơn hoặc bằng có thể thay thế. Mức chiếm dụng thực tế còn gồm khóa, bucket, phần trống và allocator; kích thước một entry native 12 byte trong phép đo không thể nhân đơn giản để kết luận bộ nhớ toàn bảng.

### 12.2. Exact, lower, upper

Giả sử cửa sổ ban đầu là `[α₀, β₀]`, kết quả tìm là v. Trong implementation reference, nếu `v ≤ α₀`, bản ghi mang cận trên `Upper`: giá trị thực không lớn hơn cận này trong ngữ cảnh tìm. Nếu `v ≥ β₀`, bản ghi mang cận dưới `Lower`: giá trị thực không nhỏ hơn cận này. Nếu `α₀ < v < β₀`, kết quả là `Exact` cho độ sâu và cấu hình đã xét. Những cận này gắn với cách cắt tỉa và cửa sổ tìm, không nên đọc mọi số đã lưu như đáp án chính xác.

Ví dụ cửa sổ `α₀ = 3`, `β₀ = 8`. Một nhánh trả 2 thì entry Upper cho biết kết quả không vượt 2 theo ngữ cảnh; trả 9 tạo Lower, cho biết giá trị ít nhất 9; trả 5 nằm giữa cửa sổ là Exact. Khi tìm lại với độ sâu yêu cầu không lớn hơn độ sâu đã lưu, Exact có thể trả trực tiếp. Lower dùng tăng alpha; Upper dùng giảm beta. Nếu sau cập nhật `alpha ≥ beta`, có thể cắt. Nếu entry quá nông để trả điểm, `best_move` vẫn có thể làm gợi ý duyệt trước, theo code reference.

```text
PROBE(key, depth, alpha, beta):
    entry ← tra bảng theo key
    nếu không có: tiếp tục tìm
    preferred ← entry.best_move
    nếu entry.depth đủ sâu:
        nếu Exact: trả entry.score
        nếu Lower: alpha ← max(alpha, entry.score)
        nếu Upper: beta ← min(beta, entry.score)
        nếu alpha ≥ beta: trả cận đã lưu
    tiếp tục tìm, có thể dùng preferred để ordering
```

`search/optimized.rs::value` lưu lại `alpha_original` và `beta_original` trước khi tra TT, dùng chúng để phân loại kết quả sau tìm kiếm. Trong TypeScript legacy, `probeTT` so hai phần hash, độ sâu và điều kiện cắt; `storeTT` ghi vào một slot của mảng chỉ số modulo. Đây là hai cấu trúc và quy tắc thay thế khác nhau. Source game Rust fixed-depth không dùng hai implementation đó ở tuyến AI hiện tại. !FIG[tt-bounds]

### 12.3. Ranh giới tính đúng của cache

Một key khớp và entry đủ sâu chưa giải quyết mọi điều kiện nếu điểm phụ thuộc vào người gốc, quy tắc, trọng số, tập nước hoặc ply. Mã reference dùng điểm từ góc nhìn root; khi tái sử dụng bảng sau đổi root, cùng một hash có thể được hiểu trong ngữ cảnh khác. Thí nghiệm `cache_scope_probe.json` tại fixture `clustered` ghi cùng root cold/warm đều trả 0; sau một nước và đổi root, bảng mới trả 0 còn bảng tái sử dụng trả 19.800. Đây là lỗi ranh giới được tái hiện ở bản reference, không phải một kết quả có thể bỏ qua để tuyên bố cache dùng an toàn qua các lượt.

Tài liệu thí nghiệm cũng ghi điểm mate phụ thuộc ply tính từ root chưa được chuẩn hóa cho tái sử dụng qua lượt. Hướng xử lý là tạo bảng mới khi ngữ cảnh không tương thích hoặc thiết kế namespace và chuẩn hóa điểm, sau đó kiểm thử; đây là đề xuất, không phải bản sửa đã hoàn tất. Các phép thử hash và TT có phạm vi hữu hạn, không chứng minh không có va chạm hay đúng trên mọi thế cờ.

## 13. TypeScript legacy và khác biệt với engine hiện tại

Mã `CaroGame/src/game/bot` chứa một engine TypeScript riêng: `BotBoard` lưu bàn trong `Uint8Array` có biên đệm `WALL`, `eval.ts` xây dựng bảng mẫu theo mask nhị phân, `search.ts` thực hiện tìm kiếm negamax Alpha-Beta, quiescence, TT và iterative deepening, còn `worker.ts` nhận yêu cầu chạy tìm kiếm. Biên đệm giúp một số phép quét nhận diện biên bằng giá trị đặc biệt. `makeMove` và `undoMove` cập nhật quân, số quân, hash, lượt và các thống kê pattern trên những đường liên quan.

`evaluateLine` tách một đường ở vị trí quân đối thủ rồi mã hóa những ô thuộc người đang xét thành bitmask; bảng mẫu dùng các phép thử hoàn thành năm để phân nhóm five, open four, four, open three và broken three. Đây là mô hình khác evaluator chuỗi liên tục của Rust game. Ở `generateCandidates`, legacy tìm vùng gần quân và kiểm các nước ép buộc bằng thử đặt/hoàn tác; không được áp bảng cap mềm Rust một cách máy móc cho mã này.

Tại đáy tìm kiếm, `quiescence` đánh giá trạng thái hiện tại rồi xét tiếp các nước ép buộc đến giới hạn bổ sung; ý tưởng là giảm nguy cơ dừng giữa một chuỗi chiến thuật đang biến động. Việc mở rộng này tăng lượng công việc và vẫn không bảo đảm tránh mọi sai lệch do dừng ở horizon. Trong `findBestMove`, deadline và `SEARCH_ABORT` kiểm soát việc ngắt; TT dùng ba cờ exact/lower/upper và gợi ý nước hash khi sắp xếp. Mô tả này là phân tích source, không phải kết quả benchmark hay bằng chứng rằng người dùng game đang chơi qua legacy engine.

Luồng hiện tại có thể kiểm tra từ `game/ai/AIController.ts`: đối tượng engine được tạo là `GomokuWasmEngine`, không phải `GomokuEngine` từ `game/bot/index.ts`. Vì vậy việc TS legacy có TT hoặc quiescence không đồng nghĩa sáu mức AI của game Rust hiện tại sử dụng các kỹ thuật đó. Cần duy trì nhãn implementation và đường gọi khi so sánh bất kỳ kết quả nào.

## 14. Sáu cấu hình và đường dữ liệu thực tế

| Mức | Chiến lược Rust | Độ sâu | Radius / soft cap | Ghi chú |
| --- | --- | ---: | --- | --- |
| Easy | Random | 0 | Tất cả ô trống | Seed dùng để tái lập fixture; không có lookahead. |
| Normal | Rule-based | 1 | Lân cận, không cap cố định | Thắng, chặn, sau đó heuristic một ply. |
| Hard | Alpha-Beta | 2 | 2 / 15 | Có thể được TypeScript tactical prepass xử lý. |
| Very Hard | Alpha-Beta | 3 | 2 / 12 | ID API là 5, thứ tự UI không theo ID số. |
| Expert | Alpha-Beta | 4 | 2 / 10 | Cap mềm giữ mọi ô thắng/chặn tức thời. |
| Master | Alpha-Beta | 5 | 2 / 8 | Độ sâu cố định; chưa tích hợp TT hay iterative deepening. |

Source mã hóa độ khó ở `engine/src/ai.rs::Difficulty` và ánh xạ giao diện trong `CaroGame/src/game/wasm/contracts.ts`. Cấu hình thay đổi cả chiều sâu lẫn cap, do đó không thể suy thứ hạng sức mạnh chỉ từ số depth. Để kết luận mức này mạnh hơn mức khác cần một giao thức đánh giá riêng: tập thế cờ, đổi bên, seed, số ván, thời gian và cách xử lý hòa phải được công bố cùng kết quả.

Trên tuyến Rust, Worker nhận lịch sử và phát lại từng nước bằng `Game.play_move`; sau đó gọi `ai_move`, chuyển `(x,y)` về `(row,col)` và gửi lại kết quả. Bộ điều khiển ứng dụng xác nhận request, round, pha ván và lượt trước khi áp dụng. Phép đo `elapsedMs` trong `executeSearch.ts` bao gồm hydrate, tính và giải phóng đối tượng, nhưng không bao gồm toàn bộ thời gian tải WASM và truyền thông điệp. Đối với prepass chiến thuật TypeScript, phạm vi đo là `typescript-tactical`; không cộng hoặc so sánh hai giá trị như cùng một phép đo khi thiếu giải thích. !FIG[ai-pipeline]

## 15. Bằng chứng thực nghiệm và giới hạn suy luận

Corpus ngày 23/10 của engine game được tạo tại `research/current_2026_10_23`. `engine_verification.json` ghi bốn fixture điều khiển, 16 vị trí có seed, 816 dòng chạy native và ba lần lặp thời gian cho cấu hình liên quan. Trong dữ liệu có 408 cặp so Minimax/Alpha-Beta, 408 cặp so giá trị khi thay ordering và 820 lần kiểm tra khôi phục bàn. Một cặp có thể là một lần lặp của cùng cấu hình, nên không mô tả 408 cặp là 408 vị trí độc lập. Các kiểm thử này bao phủ tập hữu hạn và chạy native, không tự chứng minh hiệu năng WASM hoặc mọi trạng thái.

Nhật ký cùng bộ evidence ghi 38 unit và 7 integration tests native, 59 frontend tests trong 9 tệp, trong đó 18 tests dùng actual WASM; tập parity gồm 8 lịch sử reachable và 291 ply được so. Kết quả browser ghi một flow UI → Pixi → Rust Worker → Undo trong HeadlessChrome bằng sự kiện pointer tổng hợp, cùng kiểm tra bố cục ở ba viewport. Những kiểm tra này có ích cho tính nhất quán của phiên bản local đã định danh, nhưng không thay cho kiểm tra thiết bị cảm ứng thật, host Wink, giải đấu hoặc triển khai production. Log typecheck và build chạy thành công, nhưng build có cảnh báo bundle lớn và cấu hình Vite.

Thí nghiệm `research/week_05_09` dùng `caro-core-reference` riêng. Nó có 544 dòng đo native và các phép đối chiếu, gồm cả fixture cap mất nước thắng và probe TT đổi root. Timer, toolchain, seed, fixture và các ngoại lệ được ghi ở README/JSON; không gộp trực tiếp các con số này với corpus game. Ba lần đo lặp tuần tự không ngẫu nhiên thứ tự cấu hình, không pin CPU và không được báo như kiểm định ý nghĩa thống kê. Vì vậy số thời gian là mô tả của máy và lần đo, không chứng minh mức tăng tốc phổ quát hoặc thời gian phản hồi thiết bị của người chơi.

Các thuật toán trình bày ở đây có vai trò khác nhau: quét thắng xác định luật; heuristic ước lượng trạng thái chưa kết thúc; candidate thay tập nước; ordering thay thứ tự; Alpha-Beta giảm nhánh trên cùng cây; TT và iterative deepening thuộc các implementation đã chỉ rõ. Một kết luận đáng tin cần chỉ ra source, tập nước, độ sâu, seed, môi trường và phạm vi test, tránh quy một tác dụng cho thành phần khác.

## 16. Nguồn đối chiếu và đề xuất hình minh họa

**Source và evidence nội bộ.** `gomoku-main/engine/src/{board,candidates,eval,search,ai,lib}.rs`; `CaroGame/src/game/core/WinRules.ts`; `CaroGame/src/game/ai/{AIController,TacticalMoveResolver}.ts`; `CaroGame/src/game/wasm/{GomokuWasmEngine,executeSearch}.ts`; `CaroGame/src/game/bot/{board,eval,search,worker}.ts`; `caro-core-reference/src/{zobrist,search/iterative,search/optimized,search/transposition}.rs`; `research/current_2026_10_23/{GATES.md,engine_verification.json,wasm_ts_parity.json}`; `research/week_05_09/README.md` và các tệp kết quả được nêu tại từng mục. Những đường dẫn đến `gomoku-main` và `caro-core-reference` thuộc không gian `/home/pro/Downloads/vnuk/basicProject`; `CaroGame` và `present` thuộc `/home/pro/Downloads/basicproject`.

**Tài liệu nền.** Claude E. Shannon, “Programming a Computer for Playing Chess”, 1950, bản lưu tại `https://www.pi.infn.it/~carosi/chess/shannon.txt`; Donald E. Knuth và Ronald W. Moore, “An Analysis of Alpha-Beta Pruning”, *Artificial Intelligence* 6, 1975, DOI `10.1016/0004-3702(75)90019-3`; Albert L. Zobrist, “A New Hashing Method with Application for Game Playing”, University of Wisconsin Technical Report 88, 1970, `https://research.cs.wisc.edu/techreports/1970/TR88.pdf`; Gomocup, “Detail Information and Gomoku Rules”, `https://gomocup.org/detail-information/`. Các nguồn này làm cơ sở định nghĩa và phân tích thuật toán; kết quả của project phải dựa vào dữ liệu project.

**Danh mục hình cần dựng theo source:** `apply-undo` minh họa ba snapshot B → B' → B; `win-axes` vẽ bốn trục và chuỗi ≥ 5; `rule-decision` vẽ nhánh thắng → chặn → heuristic; `heuristic-runs` phân biệt open four và half four; `chebyshev-radius` so sánh 8 ô r1 với 24 ô r2 ở tâm và 8 ô r2 ở góc; `ordering` giữ nguyên tập nhưng đổi thứ tự; `minimax-tree` có các lá 3,5,2,9; `alpha-beta-cutoff` đánh dấu lá 9 bị bỏ sau khi α=3, β=2; `iterative-depth` có ba vòng, vòng cuối bị ngắt; `zobrist-xor` dùng ví dụ 4 bit; `tt-bounds` vẽ cửa sổ [3,8] và phân loại 2/5/9; `ai-pipeline` thể hiện AIController → tactical hoặc Worker → WASM → controller. Hình là sơ đồ giải thích, không phải ảnh đo runtime; cần ghi nguồn “tác giả dựng từ source” nếu đưa vào báo cáo.
