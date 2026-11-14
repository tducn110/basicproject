# CHƯƠNG 1. GIỚI THIỆU

## 1.1. Bối cảnh và lý do thực hiện

Caro là một trò chơi đối kháng có luật cơ bản đơn giản nhưng tạo ra nhiều khả năng lựa chọn sau mỗi nước đi. Với bàn cờ 15 × 15, ngay trạng thái ban đầu đã có 225 vị trí có thể đặt quân. Một chương trình chơi với máy cần chọn một nước trong số các lựa chọn đó, dự đoán phản ứng của đối thủ, đồng thời giữ giao diện phản hồi trước thao tác của người chơi. Đề tài vì vậy kết hợp hai mặt: mô hình hóa bài toán tìm kiếm và xây dựng một ứng dụng tương tác có trạng thái, vòng đời và xử lý bất đồng bộ rõ ràng.

Bên cạnh ứng dụng chơi, workspace còn có engine Rust, các chương trình tham chiếu và tài liệu theo tuần, cùng ứng dụng trình bày `present`. Những thành phần này phục vụ các mục đích khác nhau. Ứng dụng `CaroGame` xử lý tương tác của ván cờ; engine cung cấp logic tính nước đi; các mô hình reference phục vụ kiểm tra và so sánh; trang trình bày kết hợp văn bản, hình, ví dụ Python và bàn chơi minh họa để giải thích quá trình phát triển. Một báo cáo đầy đủ cần mô tả quan hệ giữa chúng và giới hạn của từng nguồn, thay vì giả định mọi đoạn minh họa hoặc phép đo là hành vi hiện tại của cùng một sản phẩm.

Về bài toán kỹ thuật, nếu AI xử lý một thế cờ trong thời gian đáng kể, gọi tính toán trực tiếp trong luồng giao diện có thể làm chậm các thao tác hiển thị. Ngược lại, chuyển xử lý sang Worker tạo thêm vấn đề: người chơi có thể bắt đầu ván mới, hoàn tác hoặc nhận sự kiện tạm dừng trong lúc lời giải cũ chưa trả về. Kết quả tính đúng cho một thế cờ trước đó không còn hợp lệ nếu được áp dụng vào ván khác. Vì vậy thiết kế không chỉ cần tạo ra nước đi, mà còn cần xác định chủ sở hữu trạng thái, thứ tự sự kiện và điều kiện cho phép ghi kết quả.

Báo cáo dùng từ Caro để gọi sản phẩm, nhưng luật hiện tại được xác định cụ thể là Freestyle Gomoku: năm hoặc nhiều hơn năm quân liên tiếp cùng màu trên một trục là thắng. Việc xác định biến thể là cần thiết vì các trò chơi cùng tên có thể dùng quy định khác về chính xác năm quân hoặc hai đầu bị chặn. Kết luận về hệ thống trong báo cáo dựa trên mã và hồ sơ tại workspace được kiểm tra, không phải khẳng định về mọi phiên bản đã từng xuất hiện trong lịch sử.

## 1.2. Mục tiêu và câu hỏi của đồ án

Mục tiêu chung là nghiên cứu và trình bày một hệ thống Caro trên web có người chơi, bàn cờ, luật ván đấu và đối thủ máy, đồng thời giải thích được dữ liệu, thuật toán và các ranh giới giữa giao diện với engine. Mục tiêu này được cụ thể hóa theo các câu hỏi sau:

1. Bàn cờ, lịch sử nước đi và trạng thái ván được lưu thế nào để kiểm tra luật, cập nhật giao diện và hoàn tác?
2. Hệ thống nhận thao tác qua bàn vẽ, đổi sang tọa độ ô và phản hồi thắng, hòa hoặc từ chối nước không hợp lệ ra sao?
3. Máy nhận thế cờ và trả nước đi như thế nào; điều gì xảy ra nếu yêu cầu lỗi, bị hủy hoặc đã lỗi thời?
4. Các thuật toán tìm kiếm và hàm đánh giá giúp giảm phạm vi tính toán như thế nào, và đâu là giới hạn của các phép đo đã có?
5. Ứng dụng trình bày hỗ trợ diễn giải mã, hình và ví dụ thực nghiệm như thế nào; nội dung minh họa nào cần đối chiếu lại với source hiện tại?

Các mục tiêu có thể kiểm tra trên source bao gồm tái dựng luồng người chơi đặt quân, luồng máy trả kết quả, xử lý hoàn tác và các thành phần trình bày. Các mục tiêu về chất lượng trải nghiệm thực tế, sức chơi tương đối giữa các mức khó, thiết bị thật và tích hợp host đòi hỏi kiểm thử hoặc dữ liệu riêng. Không có cơ sở để mặc nhiên biến khả năng được lập trình thành kết quả đã được người dùng hoặc đơn vị triển khai chấp nhận.

## 1.3. Đối tượng, phạm vi và sản phẩm khảo sát

Phạm vi chính của đồ án là ứng dụng `/home/pro/Downloads/basicproject/CaroGame`, engine Rust tại `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine`, binary và mã kết nối WebAssembly, các báo cáo nghiên cứu và ứng dụng giải thích `/home/pro/Downloads/basicproject/present`. Trong chương này, `CaroGame/src/...` và `present/src/...` chỉ hai ứng dụng tương ứng. Một checkout liên quan là `/home/pro/Downloads/intern/onprogress/10_caro`; các file source chung đã đối chiếu nội dung, nhưng hai cây có thêm file riêng, vì vậy không mặc nhiên xem toàn bộ checkout là giống nhau.

Ứng dụng trò chơi có hai chế độ `1v1` và `ai`, với bàn hữu hạn 15 × 15. Báo cáo mô tả quy tắc Freestyle và các mức độ khó đã cấu hình. Phạm vi không gồm chứng minh máy chơi tối ưu toàn cục, hệ thống tài khoản do đồ án tự xây dựng, xếp hạng sức chơi đã được hiệu chỉnh qua giải đấu, hay nghiệm thu thiết bị và dịch vụ production. Tích hợp Wink được trình bày như một lớp tiếp nhận sự kiện và dịch vụ bên ngoài có trong source, không mặc nhiên xem như đã kiểm thử trên host.

Đối với số liệu và hình trong tài liệu tuần, mỗi kết quả phải đi kèm bản triển khai, ca thử, dữ liệu và môi trường tương ứng. Một benchmark native của `caro-core-reference` không phải phép đo hiệu năng WebAssembly trong trình duyệt. Trang `present` cũng có các nhãn lịch sử, con số minh họa và code trích xuất của những giai đoạn trước; việc trang hiển thị một con số chỉ xác nhận nội dung trang, không xác nhận con số đó là kết quả hiện tại của ứng dụng.

## 1.4. Phương pháp và cách sử dụng bằng chứng

Phương pháp thực hiện gồm bốn bước. Trước hết, kiểm kê các sản phẩm liên quan và đọc file cấu hình, mã nguồn, báo cáo, log hoặc dữ liệu thực nghiệm sẵn có. Tiếp theo, lần theo chuỗi đầu vào, xử lý, trạng thái, sự kiện, đầu ra và phản hồi. Sau đó, giải thích thuật toán bằng công thức, ví dụ và chỉ rõ dữ liệu đầu vào cùng giả thiết. Cuối cùng, đối chiếu yêu cầu với kiểm thử hoặc kết quả đã ghi nhận để phân biệt hành vi được mô tả trong mã với hành vi đã quan sát khi chạy.

Mỗi loại nguồn trả lời một câu hỏi khác nhau. Source xác định cấu trúc và nhánh logic của snapshot đang đọc; tài liệu chính thức giải thích khái niệm công nghệ; log và fixture xác nhận những trường hợp đã thực thi; báo cáo cũ cung cấp bối cảnh nhưng cần đối chiếu khi source thay đổi. Một phép tính giới hạn số nút là phân tích lý thuyết. Một giá trị thời gian là kết quả đo của một cấu hình và workload cụ thể. Hai loại kết luận này không thay thế nhau.

Các kịch bản quan trọng được thiết kế theo điều kiện trước, thao tác và kết quả mong đợi để tạo cơ sở kiểm thử. Bảng kịch bản trong Chương 3 là mô tả yêu cầu và điều kiện cần xác minh, không tự chứng minh chúng đã chạy thành công. Kết quả thực tế, nếu có bằng chứng, được trình bày riêng trong chương đánh giá. Các thiếu sót về danh tính, thông tin môn học, nguồn đo hoặc nghiệm thu phải được đánh dấu và bổ sung thay vì suy diễn.

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Tác nhân và ca sử dụng

Tác nhân chính là người chơi. Người chơi chọn chế độ, đặt quân, quan sát lượt đi và kết quả, hoàn tác hoặc bắt đầu lại. Khi chơi với máy, hệ thống AI là một thành phần xử lý nội bộ thực hiện lựa chọn nước O; nó không phải người dùng độc lập thao tác trực tiếp lên giao diện. Host Wink, nếu hiện diện, là hệ thống ngoài cung cấp trạng thái pause, mute, ngôn ngữ và một số dịch vụ như bảng xếp hạng. Người đọc trang trình bày là một tác nhân khác: họ mở các phần, chạy ví dụ Python, thao tác bàn minh họa hoặc xem thông tin của hình.

Bảng 3.1. Các yêu cầu chức năng được đối chiếu với thành phần nguồn.

| Mã | Yêu cầu hoặc hành vi cần có | Thành phần nguồn liên quan |
| --- | --- | --- |
| F01 | Chọn chơi hai người hoặc với máy, chọn mức khó cho máy | `App.tsx`, `GameController.setMode/setDifficulty`, `MatchController` |
| F02 | Nhận nước trong giới hạn bàn, không cho đặt vào ô đã có quân | `BoardInputController`, `MoveRules.validateMove`, `playMove` |
| F03 | Xác định thắng theo bốn trục, xác định hòa khi bàn đầy và chưa thắng | `FreestyleGomokuWinRule`, `GameController.finishMove` |
| F04 | Giữ lịch sử, chơi lại, tạo ván mới và hoàn tác theo chế độ | `GameState`, `GameController` |
| F05 | Tìm nước máy, khóa đầu vào khi máy tính, chỉ chấp nhận phản hồi còn phù hợp | `AIController`, `GomokuWasmEngine`, `GameController.startAiTurn` |
| F06 | Hiển thị trạng thái máy đang tính, thống kê hoặc lỗi và cho thử lại | `SearchFeedback`, `GameSnapshot`, `retryAiTurn` |
| F07 | Hiển thị bàn và quân, cập nhật khi kích thước vùng vẽ thay đổi | `CaroGameCanvas`, `CaroScene`, các renderer |
| F08 | Nhận locale và pause từ host khi có tích hợp, vẫn có chế độ standalone | `useWinkIntegration`, `i18n.ts`, `App.tsx` |
| F09 | Xem nội dung giải thích, figure và các ví dụ Python | `present/src/App.tsx`, `FigureInspectorModal`, `PythonVisualizer` |

Bảng này mô tả scope của các chức năng quan sát được trong mã. Việc đưa F08 vào bảng không xác nhận SDK bên ngoài đang sẵn sàng hoặc bảng xếp hạng thực sự trả dữ liệu trong môi trường host. Tương tự, việc hiện có các ví dụ Python không chứng minh kết quả ví dụ đại diện cho benchmark của engine đang được ứng dụng sử dụng.

## 3.2. Yêu cầu phi chức năng và ranh giới

Tính đúng đắn của luật đòi hỏi mỗi nước đã chấp nhận phải nằm trong bàn, đánh vào ô trống và được ghi đúng lượt. Sau mỗi nước, kết quả thắng được xét trước khi kết luận hòa. Tính nhất quán trạng thái yêu cầu lịch sử và các ô đang có quân phản ánh cùng một chuỗi hành động; hoàn tác phải xóa quân tương ứng và khôi phục lượt. Các yêu cầu này có thể kiểm tra bằng test trường hợp biên và kiểm tra state trước–sau.

Khả năng phản hồi đòi hỏi tác vụ máy không chiếm trực tiếp luồng giao diện khi đi qua Worker. Đây là quyết định tách công việc, không phải bảo đảm thời gian phản hồi dưới một ngưỡng. Tính an toàn với bất đồng bộ yêu cầu ngăn kết quả được tính cho ván hoặc lượt trước ghi vào ván hiện tại. Khả năng phục hồi cần thể hiện khi engine trả lỗi, không trả nước, hoặc trả nước không hợp lệ; trong các trường hợp đó, giao diện cần cho người dùng biết trạng thái và có đường thử lại.

Về sử dụng trên màn hình khác nhau, mã có logic tính tỷ lệ bàn theo viewport và `ResizeObserver`. Điều này hỗ trợ thích ứng kích thước nhưng bản thân source chưa xác nhận khả năng dùng ở mọi thiết bị, trình duyệt hay kích thước chữ. Về bảo trì, state ván, luật, bộ vẽ, input và phần tích hợp host được tách thành các module để có thể thay đổi hoặc kiểm tra từng trách nhiệm. Về khả năng diễn giải, công cụ trình bày có registry cho hình và code minh họa; nội dung trong registry vẫn cần được xác minh lại đối với phiên bản nguồn hiện hành.

## 3.3. Kiến trúc tổng thể

Hệ thống trò chơi được tổ chức theo chuỗi trách nhiệm. `App.tsx` giữ giao diện và kết nối `GameController`; controller điều phối lượt, phase, AI và snapshot. `GameState` giữ quân và lịch sử, còn `MatchController` giữ phase, chế độ, độ khó, kết quả và mã ván. `playMove` kết hợp kiểm tra một ô với luật thắng. Phía hiển thị, `CaroGameCanvas` tạo và đồng bộ `CaroScene`; scene phối hợp camera, input controller và các renderer. AI có interface riêng để controller gọi; implementation hiện tại là `AIController`, chuyển tiếp sang `GomokuWasmEngine` và Worker khi cần.

Luồng người dùng cơ bản là: nhấn hoặc chạm vùng bàn → Pixi nhận pointer → bộ input phân biệt nhấn ô và kéo → chuyển tọa độ sang hàng/cột → callback gọi `GameController.playCell` → kiểm tra phase và lượt → `playMove` xác nhận ô và ghi nước → kiểm tra thắng/hòa hoặc đổi lượt → controller phát snapshot → React và Pixi cập nhật hình cùng phần phản hồi. Khi đến lượt máy, sau nước người chơi controller bắt đầu yêu cầu AI; nhánh trả kết quả cũng đi lại qua `playMove`, nên vẫn phải qua kiểm tra ô trước khi thay đổi state.

Sơ đồ trách nhiệm ở mức logic:

```text
Người chơi → React App → GameController → GameState + MatchController + WinRule
                 │             │
                 │             └→ AIController → Worker → Rust/WASM
                 └→ CaroGameCanvas → CaroScene → Camera/Input/Renderers
Host Wink → useWinkIntegration → App → controller và các thành phần giao diện
```

Mũi tên biểu diễn gọi hoặc trao đổi thông tin, không diễn tả một luồng đồng bộ duy nhất. Worker trả kết quả bất đồng bộ; controller có trách nhiệm cuối cùng kiểm tra kết quả còn phù hợp với state hiện thời. Màn trình bày `present` có ứng dụng React và state riêng, nên không đặt trong cùng sơ đồ quản lý ván của `CaroGame`.

## 3.4. Thiết kế dữ liệu bàn cờ và lịch sử

`GameState` dùng `Map<string, Player>` để lưu những ô đã có quân. Khóa được tạo bởi `GameState.key` từ chuỗi `row,col`, còn giá trị là X hoặc O. History là một mảng có thứ tự, mỗi phần tử là một `Move` gồm người chơi, ô và chỉ số nước. Biểu diễn này lưu trực tiếp các ô đã chiếm thay vì buộc giao diện tạo 225 đối tượng có state riêng. Logic toán trong Chương 2 vẫn có thể dùng ma trận 15 × 15 làm mô hình; ma trận lý thuyết và cấu trúc lưu ở TypeScript là hai cách biểu diễn cùng miền tọa độ.

`commitMove` từ chối ô đã có quân, thêm quân vào Map, đẩy nước vào history và cập nhật biên nhỏ nhất chứa các quân. Việc kiểm tra biên bàn được thực hiện trước đó trong `validateMove`. `getHistory`, `lastMove`, `moveCount` và `forEachStone` cung cấp dữ liệu cho controller và renderer. `GameController.makeSnapshot` sao chép từng nước và tọa độ, duyệt quân để tạo danh sách cho giao diện, đồng thời thêm các thông tin phase, AI và lỗi. React sử dụng snapshot qua `useSyncExternalStore` thay vì tự sở hữu một bàn cờ cạnh tranh với controller.

Khi hoàn tác, `GameState.undoLast` lấy nước cuối khỏi history, xóa ô khỏi Map rồi tính lại occupied bounds bằng các nước còn lại. `GameController.undo` quyết định số ply cần xóa theo chế độ. Trong `1v1`, một lần hoàn tác xóa một nước. Trong chế độ máy, nếu nước cuối là O thì xóa cả nước O và nước X trước đó; nếu máy chưa hoàn thành và nước cuối là X thì xóa một nước đó. Controller hủy lượt AI đang chờ, xóa phản hồi tìm kiếm, xác định lại người đi và đưa match về `playing` hoặc `ready` tùy còn lịch sử hay không.

Một hệ quả thiết kế là history không chỉ dùng để hiển thị: nó còn là dữ liệu tái tạo bàn cờ tại ranh giới Worker. Vì vậy thay đổi cấu trúc, thứ tự hoặc hệ tọa độ của history cần được đối chiếu ở cả phía TypeScript và Rust. Quy tắc về người chơi và phase không nằm hoàn toàn trong Map; chỉ nhìn Map không đủ để biết có được đi tiếp hay không.

## 3.5. Trạng thái ván và chuyển trạng thái

`MatchState` định nghĩa bốn phase: `setup`, `ready`, `playing`, `game-over`. `MatchController` khởi tạo phase `ready`, mode `1v1`, difficulty `normal` và roundId 0. Chọn chế độ hoặc độ khó khi không ở phase `playing` đưa match về `ready`. Khi `playCell` nhận thao tác trong `setup` hoặc `ready`, controller gọi `startRound`; hàm này tăng roundId, xóa kết quả cũ và chuyển sang `playing`. Sau một nước thắng, `finish` ghi kết quả và chuyển `game-over`; nếu bàn đủ 225 quân mà chưa thắng, `finishDraw` ghi hòa.

`newGame` tăng roundId và đưa về `setup`; `replay` cũng tăng roundId nhưng đưa phase về `playing` khi đang chơi hoặc đã kết thúc. Controller đồng thời reset bàn, lượt hiện tại và phản hồi AI. Sau Undo, `resumeAfterUndo` tăng roundId, bỏ winner/draw và đưa về `playing` nếu còn nước, hoặc `ready` nếu bàn rỗng. Mã ván được dùng cùng token lượt để xác định yêu cầu bất đồng bộ còn thuộc trạng thái hiện tại hay không.

Tạm dừng là trạng thái song song với phase. `setPaused(true)` không kết thúc ván: controller vô hiệu hóa lượt AI đang chạy, còn scene dừng vòng render và bỏ qua input. Khi tiếp tục, nếu match còn ở `playing`, mode là AI và lượt hiện tại thuộc O, controller khởi động lại lượt AI. Phân biệt pause với game-over giúp hệ thống giữ bàn và vị trí lượt khi host gửi resume.

## 3.6. Thiết kế bất đồng bộ và xử lý sai lệch

`AIController.requestMove` tạo requestId và ghi thời điểm bắt đầu. Với các mức ngoài Easy và Normal, nó trước tiên thử `findForcedTacticalMove` trong TypeScript để thắng ngay hoặc chặn thua ngay. Nếu có nước phù hợp, kết quả được trả với nguồn `tactical`; nếu không, controller đóng gói difficulty, roundId và bản sao history rồi gọi engine. Easy và Normal đi tới chiến lược Rust tương ứng thay vì chạy tactical prepass này. Vì có hai nguồn, thống kê thời gian và số nút phải đọc kèm `source` và `elapsedScope`.

`GomokuWasmEngine` là chủ sở hữu vòng đời Worker. Mỗi yêu cầu có mã riêng và một cặp resolve/reject trong Map `pending`. Worker được tạo khi cần; thông điệp phản hồi được ghép với mã yêu cầu. Khi cancel hoặc destroy, các promise đang chờ bị reject, Worker được terminate và tham chiếu được xóa. Nếu Worker báo lỗi, các yêu cầu còn lại cũng được reject. Một yêu cầu sau có thể tạo Worker mới; việc có đường khởi tạo lại trong source không thay thế kiểm thử mọi lỗi tải tài nguyên thực tế.

Phía Worker, `initializeEngine` lưu promise khởi tạo WASM để tái sử dụng trong vòng đời Worker. `executeWasmSearch` tạo một `Game` Rust, phát lại từng nước từ history, gọi `ai_move`, kiểm tra cấu trúc kết quả và giải phóng đối tượng trong `finally`. Khi tái tạo, cột TypeScript chuyển thành x và hàng thành y; chiều ngược lại, x/y từ engine được chuyển về col/row. Nếu replay một nước không thành công hoặc telemetry không đúng contract, Worker trả lỗi thay vì tiếp tục sử dụng kết quả không hợp lệ.

Một phản hồi chỉ được commit sau khi `GameController.startAiTurn` kiểm tra token lượt, trạng thái pause, roundId, phase, mode và người hiện tại. Điều kiện này ngăn một kết quả của ván hoặc lượt cũ ghi vào state sau replay, Undo, đổi mode hoặc pause. Sau đó, nước được đưa qua `playMove`; nếu ô không hợp lệ hoặc máy không trả nước, controller ghi `aiError`. Nhánh catch chỉ cập nhật lỗi nếu token vẫn thuộc lượt hiện hành. `SearchFeedback` hiển thị trạng thái và nút thử lại; `retryAiTurn` chỉ bắt đầu khi còn đúng điều kiện lượt O đang chơi.

Đồng hồ `elapsedMs` của nhánh Rust trong `executeWasmSearch` bao gồm tái tạo Game, tìm kiếm và giải phóng, nhưng không bao gồm tải WASM ban đầu và chuyển thông điệp. Thời gian của tactical TypeScript có phạm vi khác. Khi phân tích hiệu năng phải nêu phạm vi này thay vì gộp hai loại thành một phép đo đồng nhất.

## 3.7. Thiết kế hiển thị bàn, tọa độ và tương tác

`CaroGameCanvas` tạo một phần tử canvas, gắn `CaroScene`, đồng bộ board/lastMove/winCellSet và đăng ký `ResizeObserver`. Khi component bị tháo, observer được disconnect, scene được destroy và canvas được gỡ. Scene tạo Pixi Application, một world container và các lớp riêng cho lưới, quân và hiệu ứng đánh dấu. `syncState` nhận bản biểu diễn để vẽ; nó không phải chủ sở hữu luật hay lịch sử ván.

Camera lưu vị trí và tỷ lệ zoom. `fitBoardToViewport` tính kích thước bàn từ số ô và `CELL_SIZE`, chừa padding theo chiều rộng viewport, sau đó chọn tỷ lệ nhỏ hơn trong hai tỷ lệ theo chiều rộng và chiều cao để toàn bàn vừa vùng hiển thị. Khi camera hoặc viewport thay đổi, `refreshVisibleBoard` tính miền nhìn thấy, vẽ lại lưới, đồng bộ quân trong miền và đánh dấu nước cuối cùng hoặc các ô thắng. Tách world coordinate khỏi screen coordinate cho phép cùng một bàn được hiển thị ở nhiều kích thước.

`BoardCoordinateTransform.screenToCell` đảo biến đổi camera bằng cách lấy tọa độ màn hình trừ dịch chuyển, chia zoom và kích thước ô, rồi lấy phần nguyên. Kết quả là `col` và `row`; `isBoardCell` kiểm tra có thuộc bàn hữu hạn trước khi tạo thao tác nhấn. `BoardInputController` có trạng thái `idle`, `pressed` và `dragging`; nếu độ dịch chuyển giữa các sự kiện vượt ngưỡng cấu hình 6, nó chuyển sang kéo và phát PAN. Khi thả trong trạng thái pressed và tọa độ hợp lệ, nó phát CELL_TAP. Đây là chi tiết của implementation hiện tại, không đồng nghĩa mọi cử chỉ chạm hay thiết bị đều đã được xác nhận.

React hiển thị thông tin người chơi, trạng thái tìm kiếm, nút Undo, chế độ, độ khó và banner kết quả quanh vùng canvas. Kết quả luật từ controller được chuyển thành tập khóa `row,col` để scene tô các ô thuộc chuỗi thắng. Bằng cách này, Pixi chịu trách nhiệm vẽ còn state thắng và điều kiện thắng vẫn thuộc miền trò chơi. Việc test đúng phải bao gồm sự tương ứng giữa tọa độ pointer, ô được chọn, state đã cập nhật và vị trí quân được vẽ sau thay đổi kích thước.

## 3.8. Ngôn ngữ, âm thanh và tích hợp bên ngoài

`i18n.ts` quản lý ngôn ngữ dùng chung; `App.tsx` lấy bản dịch qua `useTranslation` và cho phép đổi VI/EN. `useWinkIntegration.normalizeWinkLocale` ánh xạ locale bắt đầu bằng `vi` thành tiếng Việt, các trường hợp khác thành tiếng Anh; locale từ host được đồng bộ vào cùng instance. Cách biểu diễn này cho phép giao diện và host dùng chung quyết định ngôn ngữ, nhưng không phải bằng chứng rằng mọi chuỗi, thiết bị hoặc vùng miền đã được kiểm thử.

`playButtonClick` trong `utils/buttonClick.ts` tạo âm click tổng hợp qua Web Audio: oscillator hình sin, gain giảm trong khoảng ngắn và tự dừng. Hàm thử khởi tạo AudioContext khi có window, thử resume nếu context đang suspended và bắt lỗi để âm thanh không chặn thao tác chính. Trong source được kiểm tra, hook Wink có `hostMuted`; cần đối chiếu riêng toàn bộ đường phát âm thanh với trạng thái này trước khi tuyên bố mute của host đã được áp dụng đồng nhất. Sự tồn tại của trường hostMuted hoặc lệnh resume không tự chứng minh âm thanh hoạt động đúng ở mọi trình duyệt và thiết bị.

`resolveGlobalWink` tìm SDK trong `window`, gọi init nếu có, hoặc chờ có giới hạn trước khi trả null. Khi không có SDK, hook chuyển sang trạng thái `standalone` và vẫn cho phép khởi tạo giao diện. Khi có SDK, hook đăng ký sự kiện pause/resume, mute/unmute và locale; cleanup hủy đăng ký và cố gắng destroy SDK. Các hàm gameplayStart/gameplayStop được gọi theo vòng đời ván. Các thao tác leaderboard và submit score kiểm tra capability, xử lý lỗi và có thể không thực hiện khi SDK không sẵn sàng. `App.tsx` quy đổi điểm ví dụ trong source cho thắng X, hòa hoặc kết quả còn lại; đây là chính sách của ứng dụng, không là dữ liệu thành tích thật.

Ranh giới này tách game state cục bộ khỏi các dịch vụ ngoài. Một bài kiểm thử unit với SDK giả có thể xác nhận cách hook phản ứng với sự kiện giả, nhưng không xác nhận thỏa thuận phiên bản SDK, quyền gọi API, lifecycle iframe hay tính đúng của bảng xếp hạng production. Các nội dung đó cần một phiên thử trên host và tài khoản phù hợp trước khi đưa vào kết luận nghiệm thu.

## 3.9. Các kịch bản cần kiểm chứng

Bảng 3.2. Kịch bản và kết quả mong đợi để thiết kế kiểm thử; trạng thái chạy thực tế cần đối chiếu với hồ sơ kiểm thử riêng.

| Mã | Điều kiện và thao tác | Kết quả mong đợi |
| --- | --- | --- |
| S01 | Ván mới, nhấn một ô hợp lệ | Quân hiện đúng ô, history tăng một, lượt đổi nếu chưa kết thúc |
| S02 | Khi phase đang `playing`, thử ô đã có quân hoặc tọa độ ngoài bàn qua controller | Nước bị từ chối, bàn và history không thay đổi |
| S03 | Đặt quân tạo ít nhất năm liên tiếp trên mỗi trục | Ghi người thắng, chuyển game-over, đánh dấu các ô thắng |
| S04 | Bàn đầy sau nước cuối và không có người thắng | Ghi hòa và không cho tiếp tục đặt quân |
| S05 | Chơi `1v1`, nhấn Undo | Xóa một ply, tính lại lượt và phase |
| S06 | Chơi AI, máy đã trả lời, nhấn Undo | Xóa nước O cuối và nước X trước đó; máy không áp kết quả cũ |
| S07 | Bắt đầu lượt AI rồi replay hoặc đổi mode | Yêu cầu cũ bị vô hiệu; phản hồi cũ không ghi vào ván mới |
| S08 | Worker trả lỗi, không có nước hoặc tọa độ không hợp lệ | Hiển thị lỗi, không ghi nước sai; khi đủ điều kiện có thể thử lại |
| S09 | Host pause trong lúc máy đang tính, sau đó resume | Không nhận input khi pause; sau resume tìm lại nếu vẫn là lượt O |
| S10 | Đổi kích thước vùng bàn và nhấn một ô quan sát được | Bàn được fit lại; tọa độ nhấn và quân hiển thị tương ứng |
| S11 | Không có SDK Wink hoặc capability leaderboard | Game chuyển standalone hoặc dữ liệu dịch vụ rỗng, không giả kết quả online |
| S12 | Mở figure và chạy ví dụ Python trong trang trình bày | Thông tin figure hoặc stdout/lỗi được hiển thị theo hành vi component |

Trong `playCell`, nếu phase ban đầu là `setup` hoặc `ready`, `startRound()` được gọi trước khi kiểm tra hợp lệ của ô. Vì vậy kịch bản S02 giới hạn ở phase `playing`; không suy rằng phase không thay đổi khi gọi trực tiếp controller với nước đầu không hợp lệ. Trên đường Pixi, input còn lọc tọa độ ngoài bàn trước callback.

Các kịch bản S07–S09 đặc biệt cần thực thi với thời điểm phản hồi có thể kiểm soát. Chỉ chạy nước đi tuần tự nhanh không đủ phát hiện phản hồi đến sau Undo hoặc pause. Các ca S10–S12 còn phụ thuộc môi trường trình duyệt, quyền clipboard, tải tài nguyên và kết nối CDN; cần ghi rõ môi trường thực tế nếu công bố kết quả.

# CHƯƠNG 4. TRIỂN KHAI HỆ THỐNG

## 4.1. Môi trường và tổ chức mã

Ứng dụng `CaroGame` là dự án web dùng React, TypeScript, Vite và PixiJS. `package.json` khai báo PixiJS nhánh 7.4, React nhánh 19, i18next và các lệnh phát triển, build, typecheck, Vitest. Số phiên bản trong package là phạm vi khai báo dependency của snapshot, không thay cho việc ghi lockfile và phiên bản đã cài khi tái lập. Engine Rust được biên dịch thành package JavaScript/WebAssembly dưới `src/game/wasm/engine`, gồm file kết nối và binary `.wasm`.

Cấu trúc `src` chia thành `app` điều phối, `game/core` giữ state và luật, `game/behaviors` cho hành vi nước đi và ván đấu, `game/ai` và `game/wasm` cho AI, `board` cho đầu vào/tọa độ/render, `pixi` cho scene, `components` cho các phần React, cùng `integrations/wink` và `i18n`. Sự phân chia này giúp phân tích chức năng theo ownership, mặc dù một số nhánh legacy dưới `game/bot` vẫn tồn tại và cần phân biệt với đường chạy `AIController → GomokuWasmEngine` hiện tại.

Ứng dụng `present` là dự án React/Vite riêng, có package và scripts riêng; nó sử dụng GSAP, KaTeX và các component nội dung. Không nên suy luận cùng dependency hoặc cùng cơ chế vẽ chỉ vì cả hai cùng trình bày một bàn Caro. Bàn minh họa của `present` là React component với state và logic TypeScript riêng; bàn của `CaroGame` sử dụng Pixi scene và controller như đã mô tả.

## 4.2. Triển khai nhận và cập nhật nước đi

Tại `CaroScene.setupInteraction`, sự kiện pointerdown được chuyển tới bộ input; pointermove có thể phát PAN; pointerup hoặc pointerupoutside tạo CELL_TAP nếu vẫn là thao tác nhấn hợp lệ. Callback chuyển `row`, `col` về App, sau đó gọi `GameController.playCell`. Controller từ chối khi pause, game-over, AI đang tính hoặc không đúng lượt người trong mode AI. Với các trường hợp còn lại, `playMove` gọi `validateMove` để kiểm tra biên và ô trống rồi tạo đối tượng Move có chỉ số bằng moveCount cộng một.

Sau khi commit, luật đánh giá nước cuối. `finishMove` ưu tiên xử lý thắng, sau đó mới xét bàn đầy; nếu chưa kết thúc, currentPlayer đổi từ X sang O hoặc ngược lại. Controller tạo snapshot và thông báo cho subscriber. Trong mode AI, nếu đến O và match vẫn đang chơi, `startAiTurn` được gọi. Các nhánh từ chối không được trình bày là đã thử thành công chỉ vì có mã trả về `rejected`; mỗi nhánh cần test với state thích hợp.

Ví dụ thao tác: người chơi X nhấn hàng 7, cột 7 khi ván sẵn sàng. Bộ chuyển đổi tạo tọa độ này từ vị trí trên canvas, state ghi quân X, history có một phần tử và lượt đổi sang O. Nếu là mode `1v1`, người thứ hai có thể chọn ô khác; nếu là mode AI, controller bắt đầu yêu cầu máy và đánh dấu `aiThinking`. Ví dụ mô tả thiết kế, không phải bản ghi của một phiên chạy cụ thể.

## 4.3. Triển khai điều phối máy và kết quả

Tầng điều phối chia làm hai trách nhiệm. `GomokuWasmEngine` quản lý Worker và các promise; `GameController` quản lý quyền áp dụng kết quả. Sự tách biệt này quan trọng vì Worker không biết người dùng đã đổi ván ở giao diện hay chưa. Controller dùng `turnToken` và roundId cho phép đánh dấu các yêu cầu cũ; đồng thời đối chiếu phase, mode, pause và currentPlayer khi promise hoàn thành.

Ranh giới `executeWasmSearch` cũng kiểm tra dữ liệu do engine trả: tọa độ nguyên trong khoảng 0–14, điểm hữu hạn, difficulty khớp, strategy thuộc danh sách mong đợi và các bộ đếm không âm hợp lệ. Việc kiểm tra contract nhằm phát hiện package cũ hoặc kết quả sai cấu trúc. Sau đó controller vẫn kiểm tra nước bằng luật trạng thái hiện tại: một tọa độ nằm trong bàn chưa đủ chứng minh ô đó còn trống hay ván còn cho phép đi.

`SearchFeedback` lấy các trường trạng thái như depth, nodes, cutoffs, leaves, nguồn và lỗi từ snapshot. Số liệu là telemetry của một lời gọi, không nhất thiết là đo toàn bộ thời gian trải nghiệm từ lúc người chơi nhấn đến lúc quân xuất hiện. Cũng có các nước tactical trả trực tiếp từ TypeScript với số nút bằng không; không được đưa chúng vào cùng tập so sánh search Rust mà không tách nguồn.

## 4.4. Triển khai bàn cờ và thành phần bao quanh

`CaroScene` xây dựng scene graph gồm các layer Grid, Stone và Fx trong world container. Bộ vẽ lưới tạo cấu trúc bàn; bộ vẽ quân đồng bộ các quân cần hiển thị; bộ đánh dấu thể hiện nước cuối và chuỗi thắng. Camera và phép chuyển đổi tọa độ giữ cho thao tác và hình vẽ dùng cùng hệ quy chiếu. `CaroGameCanvas` là cầu nối vòng đời React–Pixi: nó khởi tạo scene một lần, đồng bộ dữ liệu mới và dọn dẹp khi tháo component.

Tính responsive được thể hiện qua kích thước bao bởi `100dvh` ở shell, `ResizeObserver` trên container và hàm fit bàn. Kích thước canvas được điều chỉnh khi vùng chứa đổi; scene tính zoom từ không gian hiện có. Điều này giải quyết việc biến đổi bố cục ở mức mã. Muốn kết luận sử dụng tốt trên màn hình nhỏ vẫn phải xem kích thước ô, khả năng thao tác touch, vùng thông tin cạnh bàn và khả năng đọc khi người dùng thay đổi tỷ lệ chữ.

Các nút React bao quanh canvas gọi controller, còn ngôn ngữ do i18n cung cấp. App lưu đồng hồ hiển thị riêng và chỉ tăng trong lúc có ván, chưa game-over và host chưa pause. Điều này tách đồng hồ hiển thị khỏi lịch sử nước và không biến tick mỗi giây thành nước đi. Kết luận về số lần render hoặc hiệu năng của tách state cần phép đo cụ thể; không suy số render bằng không từ việc có hai state riêng.

## 4.5. Ứng dụng trình bày và figure inspector

`present/src/App.tsx` lắp ghép các section về tổng quan, tuần 3–10, visualizer, bàn tương tác, benchmark và roadmap. GSAP/ScrollTrigger được dùng trong effect để tạo chuyển động khi section xuất hiện. Mỗi section là nội dung trình bày; thứ tự hoặc nhãn tuần phản ánh cách trang tổ chức thông tin, không tự xác nhận chronology của mọi commit trong project. Các dữ kiện về trạng thái hiện tại phải tiếp tục đối chiếu source và hồ sơ gate.

App giữ `activeFigureId`; khi người dùng mở hình, id được tra trong `FIGURE_REGISTRY` và truyền cho `FigureInspectorModal`. Một mục registry chứa tên, đường dẫn hình, caption, file nguồn được nêu, công thức, diễn giải, bước thuật toán, code và phần lợi/hại. Modal hỗ trợ hai cách bố trí, copy code, phóng to/thu nhỏ và kéo hình. Đây là cơ chế tập trung dữ liệu giải thích để tái sử dụng trong giao diện. Tuy vậy, `sourceFile` và `scriptCode` trong registry là nội dung đã ghi vào ứng dụng trình bày; chúng không tự cập nhật khi mã thật thay đổi và cần kiểm tra độc lập trước khi dùng làm trích dẫn source.

Một số phần trong README và figure của `present` mô tả phiên bản lịch sử hoặc đưa ra những con số như tỷ lệ giảm, thời gian hoặc tỉ số tốc độ. Các con số đó chỉ được đưa vào đánh giá khoa học khi xác định được script, fixture, môi trường và dữ liệu gốc tương ứng. Nếu chưa đối chiếu được, báo cáo chỉ mô tả việc trang hiển thị hoặc minh họa, không lặp lại con số như kết quả mới của bản game hiện tại.

## 4.6. Pyodide và bàn tương tác của trang trình bày

`present/index.html` tải script Pyodide từ CDN, còn `pyodideRunner.ts` giữ instance dùng chung sau khi khởi tạo. `executePythonCode` thiết lập stdout và stderr, thử tải package được nhận diện từ import, chạy mã bằng `runPythonAsync` rồi trả chuỗi kết quả hoặc thông báo lỗi cho giao diện. `PythonVisualizer` có các script mẫu cho quét mẫu, heuristic, ứng viên Chebyshev và phân tích số liệu. Kết quả chạy là output của chính script trong trang tại lần đó; nó không tự gọi engine Rust production hoặc chứng minh benchmark của engine.

Việc tải script và package phụ thuộc tài nguyên có sẵn, nên cần mô tả kết quả lỗi khi mạng hoặc CDN không đáp ứng. Trong mã hiện tại, thực thi được gọi thông qua API Pyodide từ trang; không có bằng chứng trong đoạn này cho thấy mọi script đều chạy ở một Worker riêng hoặc có giới hạn thời gian cho tác vụ dài. Cần kiểm thử cụ thể trước khi khẳng định tính cô lập, phục hồi hoặc khả năng đáp ứng khi chạy mã bất kỳ.

`InteractiveCaroBoard` có state bàn, lượt, mode PvP/PvE, bot Rule hoặc Random, lựa chọn hiện tập Chebyshev và giá trị heuristic. Nó tạo bản sao mảng khi thay đổi bàn, kiểm tra thắng quanh nước mới và đặt nước máy qua callback trì hoãn. Component cũng có lựa chọn hiển thị nguồn bàn nhúng bên ngoài qua iframe. Bàn tự chứa này là công cụ minh họa với logic riêng; kết quả thao tác trên đó không tự chứng minh luồng Worker, Undo, Wink hay telemetry của `CaroGame`.

### 4.6.1. Ví dụ quét hình thế bằng Python

Script mẫu pattern_scanner.py tạo ma trận 15 × 15, đặt bốn quân X liên tiếp ở hàng 7 và ba quân O theo cột 7. Hàm detect_patterns duyệt từng hàng bằng vòng while, nhận diện đầu của đoạn liên tiếp rồi đếm chiều dài và hai đầu mở. Với bốn X ở cột 4–7, hai đầu đều trống, kết quả open_four bằng 1. Đây là một ví dụ dễ quan sát cách tránh đếm lặp trong cùng hàng.

Phạm vi cài đặt thực tế hẹp hơn phần mô tả của trang. Hàm mẫu chỉ quét hàng ngang; dictionary trả về gồm năm loại five, open_four, closed_four, open_three, closed_three. Nó chưa quét dọc và chéo, chưa trả open_two và closed_two. Vì vậy dòng mô tả “bốn trục, bảy mẫu” của giao diện chưa được script mẫu này thực hiện đầy đủ. Ba O đặt dọc là dữ liệu khởi tạo; việc in tên thế đó ra màn hình không có nghĩa thuật toán đã quét và phát hiện nó. Ngoài ra, open four là một đe dọa mạnh nhưng kết luận thắng ở lượt sau còn phụ thuộc lượt đi và các đe dọa thắng hiện có của đối thủ.

### 4.6.2. Ví dụ cộng điểm heuristic

Script heuristic_evaluator.py nhận các dictionary số lượng mẫu đã biết. Nó không nhận ma trận rồi tự phát hiện mẫu. Hàm evaluate_position nhân số lượng với trọng số, dùng hệ số phòng thủ 1,2 và chặn điểm trong miền đã chọn. Ví dụ một open four của bot đối đầu một open three cho 100.000 − 1,2 × 5.000 = 94.000 điểm; một open three đối đầu một closed four cho 5.000 − 1,2 × 10.000 = −7.000 điểm. Hai phép tính minh họa cách cộng trọng số và cách một mối đe dọa làm điểm âm.

Bảng trọng số của script này khác eval.rs trong engine game hiện hành. Chẳng hạn open four của ví dụ là 100.000, trong khi engine game dùng 50.000. Đầu vào các mẫu được đặt thủ công và script không lựa chọn nước đi từ bàn cờ, nên điểm âm chưa tự thực hiện hành động chặn. Khi giải thích kết quả, cần gắn nhãn đây là bộ tính điểm mẫu của present. Các công thức về terminal dominance trong chương 2 mô tả thiết kế engine thật với miền điểm riêng.

### 4.6.3. Ví dụ tập ứng viên và mẫu số của tỷ lệ giảm

Script chebyshev_pruner.py tạo tập occupied từ năm tọa độ ở giữa bàn, duyệt vùng bán kính hai quanh từng quân và dùng set để loại trùng các ô ứng viên. Chạy đoạn mã mẫu bằng CPython trong lượt biên soạn ngày 27/10 cho 36 ứng viên và 220 ô trống. Tỷ lệ giảm so với ô trống là (220 − 36) / 220 × 100% = 83,64%. Đây là tỷ lệ của đúng vị trí năm quân đó. Dùng 225 làm mẫu số sẽ trộn các ô đã có quân vào tập nước hợp lệ; dùng 72,39% của thí nghiệm 100 ván lại trộn một cách tổng hợp khác vào ví dụ này.

Ví dụ cho thấy vai trò của cấu trúc set, điều kiện biên và việc trừ ô occupied. Nó cũng cho thấy một nội dung trình bày có thể có tiêu đề không khớp output của chính script. Kết quả chạy mẫu chỉ kiểm tra phép tính của đoạn Python được trích từ source; không xác nhận Pyodide tải thành công trong browser hoặc khẳng định chính sách giữ chiến thuật của engine đã được thực hiện bởi đoạn mã đó.

### 4.6.4. Ví dụ thống kê và giới hạn của số được nhập sẵn

Script empirical_analysis.py gán trực tiếp total_games, số ván thắng, số ply trung bình và avg_time_per_move_us. Nó không mở week4_bot_battle.json và không điều khiển bot chơi 100 ván. Chạy script chỉ tính lại phần trăm từ các hằng số. Giá trị 42,24 µs nhập sẵn khác giá trị trung bình 251,26 µs của JSON. Do đó output là trình bày một bộ số được nhập vào mã, không phải lần đo mới.

So sánh một thời gian native với 16,67 ms của chu kỳ 60 khung hình mỗi giây cũng chưa đo rendering, main thread, truyền thông điệp hay thiết bị. Khẳng định không rớt frame trong dòng print của ví dụ chưa được phép tính đó chứng minh. Báo cáo giữ nguyên vai trò giáo dục của visualizer và dùng raw JSON/CSV đúng phạm vi khi đánh giá. Bốn đoạn mã mẫu đã được chạy cục bộ để đối chiếu tính toán; bản kiểm tra lưu cả stdout và nhãn môi trường, không biến chuỗi tự in “WebAssembly” thành bằng chứng chạy WebAssembly.

## 4.7. Ranh giới giữa triển khai và kiểm chứng

Phần triển khai cho thấy các chức năng được viết ở đâu và thông tin đi qua các thành phần nào. Chương đánh giá cần bổ sung kết quả chạy phù hợp cho từng yêu cầu, gồm phiên bản source, lệnh, fixture, môi trường và kết quả. Đặc biệt, logic xử lý lỗi và hủy trong source cần các tình huống trả lỗi và phản hồi chậm; logic responsive cần quan sát màn hình; tích hợp Wink cần host thực hoặc môi trường giả được ghi rõ.

Các công thức, ảnh và đoạn code trong trang trình bày là tài sản giải thích hữu ích, nhưng phải đối chiếu với engine và ứng dụng hiện tại trước khi dùng làm nguồn cho các kết luận về hiệu năng hay behavior. Những thông tin chưa tìm được nguồn gốc, như thông số thiết bị đo, dữ liệu thô hoặc phương pháp lặp, được liệt kê là thiếu. Điều này giúp báo cáo vừa trình bày được toàn bộ sản phẩm đã tạo, vừa giữ đúng giới hạn bằng chứng.
