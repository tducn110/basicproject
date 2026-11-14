# Kịch Bản Thuyết Minh Bảo Vệ Đồ Án Toàn Văn (Bản Lời Thoại Diễn Thuyết Chi Tiết)

**Đề tài nghiên cứu:** Nghiên cứu, Thiết kế và Hiện thực hóa Động cơ Trò chơi Gomoku Tối ưu hóa với Hệ thống AI Đối kháng Đa cấp độ  
**Sinh viên báo cáo:** Nguyễn Tâm Đức (Lớp: 24CSE)  
**Học phần:** Đồ án cơ sở (Basic Project) — Chuyên ngành Kỹ thuật Phần mềm & Trí tuệ Nhân tạo  
**Đơn vị đào tạo:** Viện Nghiên cứu và Đào tạo Việt - Anh (VNUK) — Đại học Đà Nẵng  
**Định dạng tài liệu:** Bản lời thoại diễn thuyết hoàn chỉnh, liền mạch từ đầu đến cuối; bao gồm chỉ dẫn sân khấu, phát âm công thức toán học, lập luận kỹ thuật và kịch bản thị phạm trực tiếp.  
**Hai ứng dụng đồng hành phục vụ bảo vệ:**  
- **Hệ thống Slide & Thanh tra Kỹ thuật (Presentation Deck):** `http://localhost:5174`  
- **Bàn cờ Đối kháng Trực tiếp (Live Game Engine):** `http://localhost:8443`  

---

## 📋 Mục Lục & Khung Thời Gian Trình Bày

1. [Phần 1: Mở Đầu Trang Trọng, Tư Cách Báo Cáo & Bài Toán Nghiên Cứu (00:00 – 02:30)](#phần-1-mở-đầu-trang-trọng-tư-cách-báo-cáo--bài-toán-nghiên-cứu)
2. [Phần 2: Bản Chất Toán Học Gomoku & Thách Thức Bùng Nổ Tổ Hợp (02:30 – 05:00)](#phần-2-bản-chất-toán-học-gomoku--thách-thức-bùng-nổ-tổ-hợp)
3. [Phần 3: Kiến Trúc Phân Tầng Tách Rời & Đa Luồng Web Worker (05:00 – 07:30)](#phần-3-kiến-trúc-phân-tầng-tách-rời--đa-luồng-web-worker)
4. [Phần 4: Thiết Kế Động Cơ Tầng Thấp: Mảng Phẳng 240-Byte & Apply/Undo In-Place (07:30 – 10:00)](#phần-4-thiết-kế-động-cơ-tầng-thấp-mảng-phẳng-240-byte--applyundo-in-place)
5. [Phần 5: Thuật Toán Quét Thắng Thời Gian Thực: Local Raycasting O(1) 4 Trục (10:00 – 12:00)](#phần-5-thuật-toán-quét-thắng-thời-gian-thực-local-raycasting-o1-4-trục)
6. [Phần 6: Thu Hẹp Không Gian Tìm Kiếm: Cắt Tỉa Hình Học Chebyshev r ≤ 2 (12:00 – 14:00)](#phần-6-thu-hẹp-không-gian-tìm-kiếm-cắt-tỉa-hình-học-chebyshev-r--2)
7. [Phần 7: Phân Loại 7 Mẫu Hình Thế & Hàm Lượng Giá Heuristic Lũy Thừa (14:00 – 16:30)](#phần-7-phân-loại-7-mẫu-hình-thế--hàm-lượng-giá-heuristic-lũy-thừa)
8. [Phần 8: Nguyên Lý Sát Cuộc Tuyệt Đối (Mate Dominance) & Kẹp Tĩnh (16:30 – 18:30)](#phần-8-nguyên-lý-sát-cuộc-tuyệt-đối-mate-dominance--kẹp-tĩnh)
9. [Phần 9: Duyệt Cây Đối Kháng: Minimax & Ngắt Nhánh Alpha-Beta (18:30 – 21:00)](#phần-9-duyệt-cây-đối-kháng-minimax--ngắt-nhánh-alpha-beta)
10. [Phần 10: Tối Ưu Hóa Nâng Cao: Sắp Xếp Nước Đi (Move Ordering) & Bảng Băm Zobrist 64-bit (21:00 – 23:30)](#phần-10-tối-ưu-hóa-nâng-cao-sắp-xếp-nước-đi-move-ordering--bảng-băm-zobrist-64-bit)
11. [Phần 11: Nghiên Cứu Phản Biện & Bẫy Giải Thuật: Quy Tắc Bảo Vệ Chiến Thuật (Tactical Retention) (23:30 – 26:00)](#phần-11-nghiên-cứu-phản-biện--bẫy-giải-thuật-quy-tắc-bảo-vệ-chiến-thuật-tactical-retention)
12. [Phần 12: Bằng Chứng Đo Đạc Thực Nghiệm: Rust Native vs. TypeScript (26:00 – 28:30)](#phần-12-bằng-chứng-đo-đạc-thực-nghiệm-rust-native-vs-typescript)
13. [Phần 13: Hệ Thống 6 Cấp Độ AI Đối Kháng & Đánh Đổi Độ Sâu - Độ Rộng (28:30 – 30:30)](#phần-13-hệ-thống-6-cấp-độ-ai-đối-kháng--đánh-đổi-độ-sâu---độ-rộng)
14. [Phần 14: Thị Phạm Trực Tiếp Hệ Thống (Live System Demo) (30:30 – 33:00)](#phần-14-thị-phạm-trực-tiếp-hệ-thống-live-system-demo)
15. [Phần 15: Các Cổng Kiểm Định Chất Lượng, Định Hướng Phát Triển & Lời Cảm Ơn (33:00 – 35:00)](#phần-15-các-cổng-kiểm-định-chất-lượng-định-hướng-phát-triển--lời-cảm-ơn)
16. [Bộ Phản Biện Q&A Toàn Diện: Câu Trả Lời Mẫu Đanh Thép Cho Các Câu Hỏi Của Hội Đồng](#bộ-phản-biện-qa-toàn-diện-câu-trả-lời-mẫu-đanh-thép-cho-các-câu-hỏi-của-hội-đồng)

---

## Phần 1: Mở Đầu Trang Trọng, Tư Cách Báo Cáo & Bài Toán Nghiên Cứu

`[CHỈ DẪN SÂN KHẤU: Đứng thẳng tự tin tại bục phát biểu. Màn hình máy chiếu hiển thị Slide 1 / Hero Section tại http://localhost:5174. Mắt hướng về phía Thầy/Cô Chủ tịch Hội đồng và các thành viên phản biện. Giọng nói rõ ràng, đĩnh đạc, tốc độ khoảng 120-130 từ/phút.]`

"Kính thưa Thầy/Cô Chủ tịch Hội đồng chấm điểm, quý Thầy/Cô trong Hội đồng phản biện, giảng viên hướng dẫn cùng toàn thể các bạn sinh viên có mặt trong buổi bảo vệ ngày hôm nay.

Lời đầu tiên, em xin gửi lời chào trân trọng nhất đến Hội đồng.

Em tên là **Nguyễn Tâm Đức**, sinh viên lớp **24CSE**, chuyên ngành Kỹ thuật Phần mềm và Trí tuệ Nhân tạo tại Viện Nghiên cứu và Đào tạo Việt - Anh (VNUK) – Đại học Đà Nẵng. Hôm nay, em rất vinh dự được đại diện nhóm nghiên cứu đứng tại đây để báo cáo và bảo vệ đề tài Đồ án cơ sở với tiêu đề:

**'Nghiên cứu, Thiết kế và Hiện thực hóa Động cơ Trò chơi Gomoku Tối ưu hóa với Hệ thống AI Đối kháng Đa cấp độ.'**

Để hiểu được động lực nghiên cứu của đề tài, trước hết chúng ta cần nhìn thẳng vào một mâu thuẫn kỹ thuật kinh điển trong ngành công nghệ phần mềm web suốt nhiều thập kỷ qua: **sự xung đột giữa độ sâu tính toán của trí tuệ nhân tạo và tính phản hồi thời gian thực của trình duyệt web.**

Một mặt, các thuật toán tìm kiếm cây trò chơi đối kháng chuyên sâu—như Minimax và Alpha-Beta Pruning—là các thuật toán tiêu tốn cực kỳ nhiều tài nguyên CPU. Trong môi trường web truyền thống, việc chạy các vòng lặp đệ quy nặng nề trên luồng xử lý đơn (single-thread) của JavaScript sẽ lập tức chiếm dụng hoàn toàn Main UI Thread. Hậu quả là trình duyệt bị đơ cứng, giật khung hình, người dùng không thể thao tác và bộ thu gom rác Garbage Collector liên tục gây ra các khoảng dừng độ trễ nghiêm trọng.

Mặt khác, người dùng ứng dụng web hiện đại đòi hỏi tốc độ khung hình phải khóa cứng ở mức 60 FPS mượt mà, phản hồi ngay lập tức, độ trễ tiệm cận 0 mili-giây, và hệ thống AI phải đủ đa dạng—từ cấp độ dễ cho người mới tập chơi đến cấp độ phân tích chiến thuật sâu sắc cho người chơi nâng cao.

Trong suốt 10 tuần nghiên cứu vừa qua, đồ án của em đã giải quyết triệt để bài toán mâu thuẫn này. Chúng em không dừng lại ở việc tạo ra một giao diện bàn cờ giải trí đơn thuần, mà đã xây dựng một hệ thống kỹ thuật hoàn chỉnh: bắt đầu từ đặc tả toán học hình thức, thiết kế lõi động cơ bằng ngôn ngữ Rust với cơ chế không cấp phát bộ nhớ động (Zero Heap Allocation), biên dịch sang WebAssembly chạy trên Web Worker đa luồng ngầm, và kiểm định chất lượng 6 cấp độ AI đối kháng thông qua các dữ liệu đo đạc thực nghiệm định lượng.

Sau đây, em xin phép được trình bày chi tiết từng nền tảng toán học, giải pháp kiến trúc, đột phá giải thuật và kết quả đo đạc của đồ án."

---

## Phần 2: Bản Chất Toán Học Gomoku & Thách Thức Bùng Nổ Tổ Hợp

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 2 / Mục 03: Đặc Tả Không Gian Trạng Thái. Hướng tay về phía công thức A(s) = 225 - m trên màn hình.]`

"Kính thưa Hội đồng, để xây dựng một hệ thống phần mềm vững chắc, trước tiên chúng ta phải mô hình hóa bài toán dưới góc nhìn lý thuyết trò chơi toán học.

Gomoku—hay cờ Caro—được lý thuyết trò chơi tổ hợp xếp vào nhóm: **trò chơi hai người đối kháng hoàn hảo, có tổng bằng 0 (Zero-Sum), thông tin hoàn toàn (Perfect Information) và mang tính tất định (Deterministic).**

Trong khuôn khổ đồ án, hệ thống áp dụng bộ luật chuẩn quốc tế **Freestyle Gomoku trên bàn cờ kích thước chuẩn $15 \times 15$ với điều kiện thắng $k = 5$**. Bàn cờ được định nghĩa là một lưới tọa độ rời rạc gồm $N = 225$ giao điểm.

Mô hình toán học của trạng thái bàn cờ $\mathcal{B}$ thuộc không gian trạng thái $\Omega$:
$$\Omega = \{0, 1, 2\}^{225}$$
Trong đó, $0$ biểu thị ô trống, $1$ biểu thị quân cờ của Người chơi 1 (Quân Đen), và $2$ biểu thị quân cờ của Người chơi 2 (Quân Trắng).

Tại bất kỳ thời điểm nước đi thứ $m$, tập hợp các nước đi hợp lệ $\mathcal{A}(s)$ chính là toàn bộ các tọa độ ô còn đang để trống:
$$|\mathcal{A}(s)| = 225 - m$$

Vào năm 1994, nhà khoa học máy tính Victor Allis trong luận án tiến sĩ kinh điển của mình đã chứng minh rằng: **Freestyle Gomoku trên bàn cờ $15 \times 15$ là một trò chơi đã được giải toán học (Solved Game)**. Cụ thể, Allis chứng minh rằng nếu cả hai bên đều chơi tối ưu tuyệt đối, người đi trước (Quân Đen) luôn luôn nắm chắc phần thắng (First-Player Win).

Tuy nhiên, việc biến lợi thế lý thuyết thành nước đi thực tế lại là một thách thức khổng lồ về mặt tính toán. Hãy nhìn vào bài toán **bùng nổ tổ hợp (Combinatorial Explosion)**:
Tại nước đi khai cuộc đầu tiên, bàn cờ có $225$ lựa chọn. Nước thứ hai có $224$, nước thứ ba có $223$. Tổng số hoán vị trạng thái ván cờ phát triển theo giai thừa:
$$|\mathcal{S}| \approx \frac{225!}{(225 - m)!}$$

Ngay cả khi chúng ta chỉ xem xét một độ sâu rất khiêm tốn là $d = 4$ plies (tương đương với việc mỗi bên chỉ đánh luân phiên đúng 2 nước cờ), một thuật toán duyệt cạn ngây thơ sẽ phải tính toán và lượng giá tới:
$$225 \times 224 \times 223 \times 222 \approx \mathbf{2{,}49 \times 10^9 \text{ trạng thái!}}$$

Duyệt gần hai tỷ rưỡi trạng thái trên một ngôn ngữ thông dịch như JavaScript sẽ mất hàng chục phút, khiến trình duyệt bị treo hoàn toàn. Do đó, mục tiêu giải thuật trọng tâm của đồ án là thiết kế một quy trình tối ưu hóa đa tầng: **thu hẹp hệ số phân nhánh từ $225$ xuống còn $12 \text{ đến } 25$ ứng viên khả dĩ**, đồng thời đẩy thông lượng tính toán của động cơ lên mức hàng triệu nút mỗi giây."

---

## Phần 3: Kiến Trúc Phân Tầng Tách Rời & Đa Luồng Web Worker

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 5 / Mục 04: Kiến Trúc Đa Luồng Web Worker. Trình bày sơ đồ phân tách 4 lớp.]`

"Kính thưa quý Thầy Cô, để triệt tiêu hoàn toàn độ trễ giao diện, chúng em đã thiết kế kiến trúc hệ thống theo **mô hình 4 tầng tách rời hoàn toàn (Strictly Decoupled Layered Architecture)**:

1. **Tầng Giao diện & Điều khiển (React 19 Shell)**: Quản lý cây DOM, tiếp nhận tương tác chuột, hiển thị bảng điểm và đồng hồ thời gian. Bằng cách tách biệt trạng thái thời gian (`TimerState`) ra khỏi trạng thái bàn cờ (`GameState`), chúng em đã triệt tiêu hoàn toàn lỗi 'Figma Make'—nơi mỗi giây nhảy giờ lại kích hoạt re-render thừa toàn bộ 225 ô cờ.
2. **Tầng Đồ họa Phần cứng (PixiJS WebGL Canvas)**: Sử dụng PixiJS v7/v8 để kết xuất bàn cờ $15 \times 15$, hiệu ứng quân cờ đổ bóng, con trỏ hover và tia laser sáng nối 5 quân chiến thắng thẳng qua card đồ họa GPU, duy trì ổn định 60 khung hình/giây.
3. **Tầng Cô Lập Đa Luồng (Web Worker Concurrency Layer)**: Toàn bộ thuật toán tìm kiếm AI được đẩy trọn vẹn vào một Web Worker chạy ngầm độc lập (`botWorker.ts`). Việc giao tiếp giữa giao diện người dùng và luồng tính toán AI diễn ra thuần túy qua cơ chế gửi nhận tin nhắn bất đồng bộ (`postMessage`).
4. **Tầng Động Cơ Lõi Hiệu Năng Cao (Rust & WebAssembly)**: Lõi tính toán được viết bằng ngôn ngữ Rust, biên dịch qua `wasm-pack` thành tệp nhị phân WebAssembly siêu nhẹ chỉ $111\,\text{KB}$ (`gomoku_engine_bg.wasm`).

Một vấn đề kỹ thuật hóc búa trong các hệ thống bất đồng bộ là hiện tượng **tranh chấp trạng thái (Race Condition)**. Ví dụ: khi bot đang suy nghĩ ngầm mất 200 mili-giây, nếu người chơi mất kiên nhẫn bấm liên tục 'Ván Mới' hoặc đi tiếp quân khác, kết quả cũ trả về từ Worker có thể ghi đè làm sai lệch ván đấu mới.

Để giải quyết triệt để, chúng em đã thiết kế **Giao thức Hủy Token Bất Đồng Bộ (Asynchronous Cancellation Token Protocol)**:
Mỗi khi bắt đầu một lượt tính toán mới, Controller trên giao diện sẽ cấp một mã số token duy nhất tăng đơn điệu:
$$\tau_{\text{current}} = \tau_{\text{previous}} + 1$$
Mã token này được gửi kèm trạng thái bàn cờ sang Web Worker. Khi Worker tính xong, nó bắt buộc phải đính kèm mã token đó trong gói tin phản hồi. Luồng UI chính kiểm tra điều kiện:
$$\text{Nếu } \tau_{\text{incoming}} \neq \tau_{\text{active}} \implies \mathbf{discard}(\text{move})$$
Nếu mã token nhận về không khớp với phiên làm việc hiện tại, nước đi đó lập tức bị hủy bỏ trong $0$ mili-giây. Cơ chế này đảm bảo tuyệt đối không có bất kỳ nước cờ lỗi thời nào có thể phá vỡ tính toàn vẹn của ván cờ đang chơi."

---

## Phần 4: Thiết Kế Động Cơ Tầng Thấp: Mảng Phẳng 240-Byte & Apply/Undo In-Place

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 6 / Mục 02: Biểu Diễn Bàn Cờ. Nhấn mạnh vào công thức bất biến Apply/Undo in-place.]`

"Bây giờ, em xin phép đi sâu vào trái tim thuật toán của động cơ Rust. Làm thế nào mà động cơ có thể duyệt được hàng triệu trạng thái mỗi giây? Câu trả lời nằm ở cấu trúc dữ liệu và tối ưu hóa bộ nhớ đệm CPU (Cache Locality).

Trong các triển khai thông thường trên JavaScript hay Python, mỗi khi thuật toán thử một nước đi mới trong cây tìm kiếm, lập trình viên thường dùng phương thức `clone()` hoặc sao chép sâu toàn bộ đối tượng bàn cờ. Việc tạo ra hàng triệu bản sao mảng $15 \times 15$ liên tục sẽ gây tràn bộ nhớ Heap, làm hỏng các đường truyền L1/L2 Cache của vi xử lý và ép trình duyệt kích hoạt Garbage Collector, gây sụt giảm khung hình nghiêm trọng.

Trong động cơ Rust, chúng em loại bỏ hoàn toàn việc cấp phát bộ nhớ Heap trong vòng lặp tìm kiếm. Toàn bộ bàn cờ được tổ chức thành một mảng phẳng 2 chiều trong bộ nhớ liên tục:
```rust
#[repr(u8)]
pub enum Cell { Empty = 0, Black = 1, White = 2 }

pub struct Board {
    grid: [[Cell; 15]; 15],
}
```
Nhờ chỉ dẫn biên dịch `#[repr(u8)]`, mỗi ô cờ chiếm đúng chính xác 1 byte. Cả bàn cờ $15 \times 15$ chỉ chiếm đúng **240 bytes bộ nhớ**—nằm gọn hoàn toàn trong một khối CPU Cache Line. Việc chuyển đổi tọa độ thực hiện bằng phép tính số học tức thời:
$$\text{index} = 15 \times y + x$$

Đặc biệt, hệ thống thiết lập và chứng minh thành công bất biến cốt lõi: **Bất Biến Apply & Undo In-Place**:
$$\forall m = (x, y, p): \quad \mathcal{B}' = \text{place}(\mathcal{B}, m) \implies \mathcal{B} = \text{undo}(\mathcal{B}', m)$$

Khi thuật toán đi xuống một nhánh sâu của cây tìm kiếm, nó đột biến trực tiếp byte nhớ duy nhất tại vị trí $(x, y)$ từ `Empty` sang quân cờ tương ứng. Khi nhánh tìm kiếm kết thúc và quay lui (backtracking), nó hoàn tác lại giá trị `Empty` ngay tại chính ô nhớ đó.

Hệ quả định lượng của thiết kế này là:
Trong suốt quá trình duyệt nửa triệu nút cây trò chơi, động cơ tiêu tốn **chính xác 0 byte bộ nhớ Heap phụ**. Không có rác sinh ra, không phân mảnh RAM, toàn bộ các phép gán biến diễn ra thuần túy trên các khung Stack Frame của CPU với tốc độ phần cứng gốc."

---

## Phần 5: Thuật Toán Quét Thắng Thời Gian Thực: Local Raycasting O(1) 4 Trục

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 7 / Mục 02: Quét Thắng O(1). Chỉ tay vào sơ đồ 4 trục hướng v1, v2, v3, v4.]`

"Sau mỗi nước cờ được đặt xuống, động cơ phải trả lời ngay lập tức: nước đi này đã kết thúc ván đấu hay chưa?

Thuật toán ngây thơ thường duyệt lại toàn bộ 225 ô trên bàn cờ để quét hàng ngang, hàng dọc và đường chéo—đây là thao tác tốn độ phức tạp $O(N^2)$. Trong một cây tìm kiếm duyệt hàng trăm nghìn lần, kiểm tra $O(N^2)$ sẽ là một thảm họa hiệu năng.

Chúng em đã triệt tiêu nút thắt này bằng **Thuật Toán Quét Tia Cục Bộ (Local Raycasting Win Verification)**.

Cơ sở toán học của thuật toán dựa trên một bất biến hiển nhiên: **Một chuỗi 5 quân cờ chiến thắng chỉ có thể được hình thành nếu nó đi qua chính quân cờ vừa mới được đặt xuống (`lastMove`).** Bất kỳ khu vực nào khác trên bàn cờ không chạm vào nước đi cuối cùng đều không thể thay đổi trạng thái thắng cuộc.

Thuật toán bắn ra 4 tia quét hướng đối xứng bắt nguồn từ tọa độ của nước đi cuối cùng $(x_0, y_0)$:
1. **Trục Ngang**: Véc-tơ chỉ phương $\vec{v}_1 = (1, 0)$
2. **Trục Dọc**: Véc-tơ chỉ phương $\vec{v}_2 = (0, 1)$
3. **Trục Chéo Chính**: Véc-tơ chỉ phương $\vec{v}_3 = (1, 1)$
4. **Trục Chéo Phụ**: Véc-tơ chỉ phương $\vec{v}_4 = (1, -1)$

Trên mỗi trục, thuật toán quét tới và lui tối đa 4 bước:
$$p(k) = (x_0 + k \cdot v_x, \, y_0 + k \cdot v_y) \quad \text{với } k \in \{-4, -3, -2, -1, 1, 2, 3, 4\}$$

Nếu gặp quân cờ của chính người vừa đánh, bộ đếm tăng lên. Nếu gặp ô trống, quân đối thủ hoặc chạm biên bàn cờ, tia quét dừng lại trên hướng đó. Nếu tổng số quân liên tiếp trên bất kỳ trục nào đạt từ 5 trở lên, ván đấu kết thúc ngay lập tức.

Hãy cùng đếm số phép đọc bộ nhớ tối đa trong trường hợp xấu nhất:
$$4 \text{ trục} \times 2 \text{ hướng} \times 4 \text{ ô} = \mathbf{32 \text{ phép đọc ô nhớ tối đa!}}$$

Con số này là một hằng số cố định, độc lập hoàn toàn với kích thước bàn cờ. Chúng ta đạt được độ phức tạp thời gian tuyệt đối **$O(1)$ constant time**. Trên CPU hiện đại, toàn bộ phép kiểm tra thắng này hoàn tất chỉ trong **$0{,}04$ micro-giây**, cho phép nhận diện trạng thái kết thúc ván hàng triệu lần mỗi giây."

---

## Phần 6: Thu Hẹp Không Gian Tìm Kiếm: Cắt Tỉa Hình Học Chebyshev r ≤ 2

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 10 / Mục 08: Lọc Ứng Viên Chebyshev. Giải thích trực quan vùng lân cận quanh các quân cờ.]`

"Kính thưa Thầy Cô, sau khi đã có lõi kiểm tra thắng $O(1)$, chúng em giải quyết bài toán cốt lõi thứ hai: **Sinh nước đi ứng viên (Candidate Move Generation)**.

Ở nước cờ thứ 10, bàn cờ còn tới 215 ô trống. Tuy nhiên, trong nghệ thuật chơi cờ Caro, việc đặt một quân cờ ở góc bàn cờ xa tít tắp hoàn toàn không có giá trị chiến thuật khi chiến trường chính đang diễn ra ở trung tâm. Đưa các ô cờ vô nghĩa đó vào cây tìm kiếm sẽ làm lãng phí hơn $90\%$ thời gian tính toán.

Để loại bỏ các ô cờ vô giá trị này một cách toán học mà không dựa vào cảm tính, chúng em áp dụng **Không gian Mêtric với Khoảng Cách Chebyshev (chuẩn vô hạn $\infty$-norm)**:
$$d_\infty((x_1, y_1), (x_2, y_2)) = \max(|x_1 - x_2|, \, |y_1 - y_2|)$$

Gọi $\mathcal{O}(s)$ là tập hợp các ô đã có quân trên bàn cờ, và $\mathcal{A}(s)$ là tập các ô còn trống. Tập ứng viên $\mathcal{C}_R(s)$ trong phạm vi bán kính Chebyshev $R$ được xác định theo công thức:
$$\mathcal{C}_R(s) = \left\{ m \in \mathcal{A}(s) : \exists o \in \mathcal{O}(s), \, d_\infty(m, o) \le R \right\}$$

Chúng em đã thực hiện các thí nghiệm so sánh giữa các bán kính $R = 1$, $R = 2$ và $R = 3$:
* Nếu chọn $R = 1$: Thuật toán chỉ xét các ô tiếp giáp trực tiếp. Điều này dẫn đến thất bại chiến thuật nghiêm trọng: bot bị mù trước các thế cờ 'tam tử phân nhánh' hoặc 'nhảy cách quãng' (ví dụ thế cờ `X . X X` có ô hiểm nằm cách 2 ô). Bot sẽ lập tức bị thua.
* Nếu chọn $R = 3$: Số lượng ứng viên bùng nổ lên hơn 60 ô mỗi lượt, làm sập ngân sách thời gian tìm kiếm.
* **Điểm cân bằng vàng: Bán kính $R = 2$**. Bán kính Chebyshev $R = 2$ bao trọn toàn bộ các thế cờ trực tiếp, các thế nhảy cóc, các đường chéo mở rộng và nước đi dạng mã nhảy, trong khi loại bỏ hoàn toàn các vùng đất chết hoang vu trên bàn cờ.

Trong một thế trận giằng co thông thường, việc áp dụng $R = 2$ thu hẹp tập ứng viên từ 225 ô xuống chỉ còn **$12 \text{ đến } 25$ ô cờ trọng điểm**. Riêng bộ lọc hình học này đã **cắt giảm thành công $72{,}39\%$ không gian nhánh tìm kiếm**, chuyển hóa bài toán từ bùng nổ vô tận thành một cây tìm kiếm chiến thuật sắc bén và hoàn toàn kiểm soát được."

---

## Phần 7: Phân Loại 7 Mẫu Hình Thế & Hàm Lượng Giá Heuristic Lũy Thừa

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 9 / Mục 05: 7 Mẫu Thế Cờ & Hàm Lượng Giá. Chỉ vào bảng trọng số và đồ thị log-scale.]`

"Khi duyệt cây trò chơi đến các nút lá chưa kết thúc ván, làm sao AI biết thế cờ đó bên nào đang chiếm ưu thế? Điều này đòi hỏi một **Hàm lượng giá Heuristic tĩnh (Static Evaluation Function)** chuẩn xác.

Để định lượng thế cờ, thuật toán quét tia theo 4 trục hướng áp dụng nguyên lý **Bất Biến Chuỗi Cực Đại (Maximal Run Invariant)**: thay vì đếm trùng lặp các đoạn con, thuật toán chỉ trích xuất duy nhất chuỗi quân liên tục dài nhất và kiểm tra trạng thái hai đầu mút của nó.

Chúng em chuẩn hóa toàn bộ các hình thế cờ Caro thành 7 bậc chiến thuật kinh điển:
1. **Five (`XXXXX`)**: 5 quân liên tiếp. Thắng cờ tuyệt đối. Điểm số: $100{,}000{,}000$.
2. **Open Four (`.XXXX.`)**: Tứ tử mở 2 đầu. Thế cờ thắng tất định ở lượt kế tiếp vì đối thủ chỉ chặn được 1 đầu. Trọng số: $100{,}000$.
3. **Closed Four (`OXXXX.` hoặc `.XXXXO`)**: Tứ tử bị chặn 1 đầu. Buộc đối thủ phải chặn ngay lập tức. Trọng số: $10{,}000$.
4. **Open Three (`.XXX.`)**: Tam tử mở 2 đầu. Nếu không xử lý sẽ phát triển thành Open Four không thể ngăn cản. Trọng số: $5{,}000$.
5. **Closed Three (`OXXX.`)**: Tam tử bị chặn 1 đầu. Tạo áp lực chiến thuật trung bình. Trọng số: $1{,}000$.
6. **Open Two (`.XX.`)**: Nhị tử mở 2 đầu. Tiềm năng khai cuộc. Trọng số: $500$.
7. **Closed Two (`OXX.`)**: Nhị tử chặn 1 đầu. Giá trị nhỏ. Trọng số: $100$.

Hàm lượng giá toàn cục $f(s)$ tính tổng hiệu số giữa năng lực tấn công của Bot và sự đe dọa của đối thủ:
$$f(s) = \sum_{p \in \mathcal{P}} \left( W_{\text{atk}}(p) \cdot N_{\text{bot}}(p) - W_{\text{def}}(p) \cdot N_{\text{human}}(p) \right)$$
Trong đó $N(p)$ là số lượng mẫu hình thế $p$ đếm được trên bàn cờ.

Kính thưa Thầy Cô, hãy chú ý vào một hiệu chỉnh mang tính quyết định trong công thức: **Hệ số ưu tiên phòng thủ**:
$$W_{\text{def}}(p) \approx 1{,}1 \sim 1{,}2 \times W_{\text{atk}}(p)$$
Trong cờ Caro, việc dập tắt thế cờ 4 quân của đối thủ luôn luôn khẩn cấp hơn việc cố gắng tạo thêm một thế cờ 3 quân của mình. Việc nhân trọng số phòng thủ cao hơn tấn công từ $10\%$ đến $20\%$ giúp bot triệt tiêu hoàn toàn căn bệnh 'tham công bỏ thủ' thường thấy ở các AI ngây thơ, đảm bảo AI luôn luôn hóa giải nguy cơ thua trước khi nghĩ đến việc tấn công."

---

## Phần 8: Nguyên Lý Sát Cuộc Tuyệt Đối (Mate Dominance) & Kẹp Tĩnh

`[CHỈ DẪN SÂN KHẤU: Vẫn ở Slide 9 / Mục 05. Nhấn mạnh vào công thức M = 10^8 và khoảng kẹp tĩnh H.]`

"Một lỗi lý thuyết rất tinh vi nhưng cực kỳ nguy hiểm trong thiết kế AI chơi cờ là hiện tượng **Méo Mó Lượng Giá (Heuristic Distortion)**.

Hãy tưởng tượng: AI đang đứng trước một nước đi có thể tạo thành chuỗi 5 quân để thắng ngay lập tức. Nhưng ở một khu vực khác trên bàn cờ, AI có tới bốn chuỗi Open Three và nhiều chuỗi Open Two. Nếu tổng điểm heuristic của các thế cờ phụ đó cộng lại vô tình lớn hơn điểm số quy định cho việc thắng cờ, AI sẽ chọn nước đi tích lũy thế trận thay vì kết thúc ván đấu!

Để triệt tiêu vĩnh viễn lỗi logic này, chúng em đã thiết lập và chứng minh **Nguyên Lý Sát Cuộc Tuyệt Đối (Mate Dominance Principle)**:

1. **Cơ số Thắng Tuyệt Đối ($M$)**: Nước cờ chiến thắng được gán cơ số điểm khổng lồ:
$$M = 10^8 = 100{,}000{,}000$$

2. **Chiết Khấu Độ Sâu ($U = M - q$)**:
Một nước cờ thắng ngay ở độ sâu $q = 1$ phải có giá trị cao hơn một nước cờ thắng sau 5 nước nữa. Do đó, điểm thắng được chiết khấu theo độ sâu ply $q$:
$$U_{\text{win}} = M - q, \quad U_{\text{loss}} = -(M - q)$$
Tại root ($q = 1$), nước thắng đạt điểm $99{,}999{,}999$. Nếu thắng ở độ sâu 5, điểm là $99{,}999{,}995$. Độ dốc toán học này ép buộc AI luôn luôn chọn con đường **ngắn nhất và tàn nhẫn nhất để kết thúc ván đấu**, đồng thời khi bị đối thủ dồn vào thế thua, nó sẽ chọn con đường **kéo dài sự kháng cự lâu nhất có thể**.

3. **Cơ Chế Kẹp Tĩnh (Static Clamping)**:
Chúng em kẹp chặt toàn bộ điểm lượng giá heuristic tĩnh $f(s)$ nằm nghiêm ngặt trong khoảng $[-H, +H]$:
$$H = M - 225 - 1 = \mathbf{99{,}999{,}774}$$
Vì bàn cờ chỉ có tối đa 225 ô, độ sâu $q$ không bao giờ vượt quá 225. Do đó, nước cờ thắng sâu nhất có thể ở ply 225 vẫn đạt:
$$U_{\text{min}} = 100{,}000{,}000 - 225 = 99{,}999{,}775 > H$$
Vì $99{,}999{,}775$ luôn lớn hơn cận trên tối đa của điểm tĩnh $H$, **một nước đi dẫn tới chiếu bí hoặc thắng cuộc luôn luôn áp đảo tuyệt đối mọi tổng điểm thế trận**, loại bỏ hoàn toàn nguy cơ AI bị phân tâm bởi các lợi thế ảo."

---

## Phần 9: Duyệt Cây Đối Kháng: Minimax & Ngắt Nhánh Alpha-Beta

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 11 / Mục 06 & 07: Minimax và Cắt Tỉa Alpha-Beta. Hướng sự chú ý vào bất đẳng thức beta <= alpha.]`

"Kính thưa Hội đồng, sau khi đã có hàm lượng giá vững chắc, chúng ta đưa nó vào cây trò chơi đối kháng nhiều lượt.

Theo **Định lý Minimax**, chúng ta mô hình hóa trận đấu giữa hai người chơi duy lý: AI đại diện cho bên **MAX** (luôn tìm cách cực đại hóa điểm số), còn người chơi đại diện cho bên **MIN** (luôn tìm cách dìm điểm số của AI xuống mức thấp nhất):
$$V(s) = \begin{cases} f(s) & \text{khi } \text{IsTerminal}(s) \lor \text{depth} = 0 \\ \max_{a \in \mathcal{C}(s)} V(\text{apply}(s, a)) & \text{ở lượt của MAX} \\ \min_{a \in \mathcal{C}(s)} V(\text{apply}(s, a)) & \text{ở lượt của MIN} \end{cases}$$

Tuy nhiên, Minimax thuần túy phải duyệt toàn bộ cây ($O(b^d)$). Để chạy được trong thời gian thực, chúng em triển khai giải thuật **Cắt Tỉa Alpha-Beta (Alpha-Beta Pruning)**.

Giải thuật duy trì liên tục hai giá trị biên trong suốt quá trình đệ quy:
* $\alpha$: Điểm số tối thiểu mà MAX chắc chắn đã giành được cho đến thời điểm hiện tại (cận dưới, khởi tạo bằng $-\infty$).
* $\beta$: Điểm số tối đa mà MIN có thể khống chế MAX (cận trên, khởi tạo bằng $+\infty$).

Quy tắc cắt nhánh được xác định bởi điều kiện bất đẳng thức:
$$\text{Tại bất kỳ nút con nào, nếu: } \beta \le \alpha \implies \mathbf{break} \quad (\text{Ngắt và loại bỏ toàn bộ cây con phía sau})$$

Logic toán học đằng sau điều này là không thể bàn cãi:
Nếu phía MIN phát hiện ra một nước đi khiến điểm số của AI bị kéo tụt xuống thấp hơn hoặc bằng giá trị $\alpha$ mà AI đã chắc chắn có được ở một nhánh khác, thì một người chơi MAX duy lý sẽ không bao giờ cho phép ván cờ đi vào nhánh này nữa. Ngược lại, nếu MAX tìm thấy nước cờ vượt quá $\beta$, MIN cũng sẽ chủ động né tránh từ nước trước. Do đó, việc duyệt tiếp các nhánh con còn lại là hoàn toàn vô nghĩa.

Chúng em đã kiểm định thành công **Bất Biến Tương Đương (Equivalence Parity Invariant)**:
Thuật toán Alpha-Beta **đảm bảo 100% trả về đúng nước đi tối ưu và điểm số giống hệt như Minimax duyệt cạn**, nhưng cắt giảm độ phức tạp thời gian từ $O(b^d)$ tiệm cận về **$O(b^{d/2})$** trong điều kiện sắp xếp nước đi lý tưởng. Trong các thử nghiệm thực tế ở độ sâu 4, Alpha-Beta đã **cắt bỏ hơn 16.350 nhánh thừa**, giúp thuật toán chạy nhanh hơn gấp nhiều lần."

---

## Phần 10: Tối Ưu Hóa Nâng Cao: Sắp Xếp Nước Đi (Move Ordering) & Bảng Băm Zobrist 64-bit

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 12 / Mục 09 & 10: Move Ordering và Zobrist Hashing. Chỉ vào cấu trúc bảng chuyển vị Transposition Table.]`

"Tuy nhiên, để Alpha-Beta đạt được hiệu suất tiệm cận $O(b^{d/2})$, có một điều kiện tiên quyết mang tính sống còn: **Thứ Tự Duyệt Nước Đi (Move Ordering)**.

Nếu Alpha-Beta không may duyệt các nước đi tệ nhất trước, hai biên $\alpha$ và $\beta$ sẽ co lại rất chậm, hầu như không có nhánh nào bị cắt và thuật toán thoái hóa trở lại thành Minimax duyệt vét cạn. Ngược lại, nếu nước đi tối ưu nhất được duyệt ngay ở nhánh đầu tiên, $\alpha$ sẽ vọt lên cực đại ngay lập tức, kích hoạt hiện tượng cắt tỉa dây chuyền trên toàn bộ các nhánh anh em còn lại.

Để đạt được điều này, chúng em hiện thực hóa cơ chế **Sắp Xếp Nước Đi Nhanh $O(1)$**:
Trước khi gọi đệ quy sâu, danh sách các ứng viên được quét sơ bộ qua hàm `quick_score` để đánh giá tiềm năng hình thế tức thời. Mảng ứng viên được sắp xếp giảm dần theo điểm số:
$$\mathcal{C}_{\text{sorted}} = \text{sort\_by\_key}(\mathcal{C}_R(s), \, \text{quick\_score})$$
Nhờ việc đưa các nước tạo 4, chặn 4, và tạo thế đôi lên vị trí đầu tiên của mảng, thuật toán luôn kích hoạt cắt tỉa ngay từ những lượt thử đầu tiên.

Song hành với Move Ordering là kỹ thuật **Bảng Chuyển Vị Zobrist Hashing 64-bit (Transposition Table)**:
Trong cờ Caro, có rất nhiều trình tự đi khác nhau nhưng dẫn tới cùng một thế cờ hoán vị—ví dụ đánh $(7, 7)$ trước rồi đánh $(8, 8)$ cũng hoàn toàn giống với đánh $(8, 8)$ trước rồi mới đánh $(7, 7)$. Việc tính toán lại toàn bộ cây con cho một thế cờ đã từng gặp là một sự lãng phí tài nguyên to lớn.

Chúng em khởi tạo một mảng số ngẫu nhiên 64-bit:
$$\text{ZOBRIST\_TABLE}[225][2]: \text{u64}$$
Khi một quân cờ được đặt xuống hoặc rút lui, mã băm của bàn cờ được cập nhật tức thời trong thời gian $O(1)$ bằng toán tử bitwise XOR:
$$\text{hash}' = \text{hash} \oplus \text{ZOBRIST\_TABLE}[\text{cell\_index}][\text{player\_id}]$$

Chúng em cấp phát một **Bảng chuyển vị Transposition Table dung lượng 8 Megabytes**. Mỗi bản ghi lưu trữ 4 trường dữ liệu:
1. `zobrist_key`: Khóa băm 64-bit để đối chiếu chống xung đột.
2. `depth`: Độ sâu tìm kiếm của kết quả đã lưu.
3. `score`: Điểm số Minimax đã tính được.
4. `flag`: Cận đánh giá—gồm `Exact` (chính xác), `LowerBound` (gây ngắt $\beta$), hoặc `UpperBound` (gây ngắt $\alpha$).

Khi duyệt tới một nút cờ, nếu bảng băm đã lưu thế cờ này với độ sâu lớn hơn hoặc bằng độ sâu hiện tại, động cơ trích xuất điểm số ngay lập tức mà không cần tốn một vòng lặp đệ quy nào."

---

## Phần 11: Nghiên Cứu Phản Biện & Bẫy Giải Thuật: Quy Tắc Bảo Vệ Chiến Thuật (Tactical Retention)

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 14 / Mục 12: Bẫy Giải Thuật. Giọng nói chân thành, khoa học và nhấn mạnh vào tệp minh chứng cap_loss.json.]`

"Kính thưa quý Thầy Cô trong Hội đồng, một trong những điểm khác biệt lớn nhất của một đồ án kỹ thuật thực thụ theo tiêu chuẩn IMRaD quốc tế là **tính trung thực khoa học và việc công khai các Thử Nghiệm Phủ Định (Negative Findings)**. Chúng em không tô vẽ một kết quả hoàn hảo không tì vết, mà đã chủ động đặt các bẫy kiểm thử để tìm ra điểm gãy của thuật toán.

Tại Mục 5.4.2 trong báo cáo luận văn, chúng em trình bày phát hiện quan trọng nhất của đồ án: **Hiện tượng Rơi Nước Sát Cuộc khi Giới Hạn Cứng Ứng Viên (`cap_loss.json`)**.

Trong giai đoạn thử nghiệm đầu tiên, nhằm đảm bảo bot phản hồi siêu nhanh dưới 100ms trên điện thoại, chúng em đã áp dụng một 'Giới hạn cứng' (Hard Cap)—chỉ cho phép thuật toán lấy tối đa $K = 10$ ứng viên đầu tiên để duyệt cây.

Tuy nhiên, trong quá trình chạy tự động 100 ván đấu đối kháng, bộ kiểm thử tự động đã bắt được một lỗi nghiêm trọng: bot bất ngờ bị thua ở những thế cờ mà nó đang nắm thế thượng phong!

Khi trích xuất vết dữ liệu trong `cap_loss.json`, chúng em phát hiện ra nguyên nhân cốt lõi:
Giả sử đối thủ tạo ra hai mũi tấn công cùng lúc ở hai khu vực cách xa nhau—một mũi ở góc trên bên trái, một mũi ở góc dưới bên phải. Bộ sinh ứng viên quét bàn cờ tuần tự theo hàng. Nó gom đủ 10 ô cờ xung quanh mũi tấn công thứ nhất, chạm ngưỡng giới hạn cứng $K = 10$, và lập tức cắt bỏ toàn bộ các ô phía sau.

Trớ trêu thay, ô cờ duy nhất giúp chặn đứng mũi tấn công thứ hai của đối thủ lại nằm ở vị trí ứng viên thứ 11. **Giới hạn cứng đã vứt bỏ nước cờ sống còn của trận đấu chỉ vì nó nằm ngoài hạn mức số lượng ngây thơ!**

Để giải quyết triệt để lỗi chí mạng này, chúng em đã đề xuất và chứng minh thành công **Quy Tắc Bảo Vệ Nước Đi Chiến Thuật (Tactical Retention Rule)**:

Gọi $W_{\text{bot}}$ là tập các nước đi tạo chuỗi 5 giúp AI thắng ngay lập tức.  
Gọi $W_{\text{opp}}$ là tập các nước đi thắng của đối thủ mà AI bắt buộc phải chặn.  
Chúng em định nghĩa tập nước đi chiến thuật tối thượng $P$:
$$P = W_{\text{bot}} \cup W_{\text{opp}}$$

Trước khi áp dụng bất kỳ cơ chế cắt giảm Soft Cap nào, danh sách ứng viên được phân hoạch theo công thức:
$$\mathcal{C}' = P \cup \operatorname{Top}_{\max(0, K_{\text{eff}} - |P|)}(S \setminus P), \quad \text{với } K_{\text{eff}} = \max(1, K)$$

Nếu số lượng nước cờ chiến thuật $|P|$ vượt quá hạn mức $K$, động cơ **bắt buộc phải mở rộng danh sách để giữ lại toàn bộ tập $P$**, tuyệt đối không được phép bỏ rơi bất kỳ nước cờ sinh tử nào.

Nhờ quy tắc này, hệ thống đạt **$100\%$ Tactical Recall**: bot không bao giờ để rơi mất nước thắng hay nước chặn hiểm, loại bỏ hoàn toàn hiện tượng mù chiến thuật trong khi vẫn duy trì được tốc độ tìm kiếm vượt trội."

---

## Phần 12: Bằng Chứng Đo Đạc Thực Nghiệm: Rust Native vs. TypeScript

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 13 / Mục 01: Bảng Kết Quả Thực Nghiệm Đối Đầu. Hướng mắt Hội đồng vào các con số trong Bảng 5.3.]`

"Bây giờ, em xin kính mời Hội đồng cùng nhìn vào những bằng chứng thực nghiệm định lượng thuyết phục nhất. Slide 13 trình bày dữ liệu đo đạc thực tế từ **Bảng 5.3** trong Báo cáo luận văn, đối đầu trực tiếp giữa động cơ Rust Native và động cơ TypeScript chạy trên Node.js qua các độ sâu từ 1 đến 4 trên cùng một cấu hình máy:

| Độ Sâu ($d$) | Số Nút Duyệt | Thời Gian Rust (ms) | Thông Lượng Rust (kN/s) | Thời Gian TypeScript (ms) | Thông Lượng TS (kN/s) | Hệ Số Tăng Tốc (Speedup) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Độ Sâu 1** | 45 | **0,0221 ms** | **2.040,25** | 0,5383 ms | 83,59 | **$24{,}3\times$** |
| **Độ Sâu 2** | 609 | **0,3125 ms** | **1.948,98** | 5,5795 ms | 109,15 | **$17{,}8\times$** |
| **Độ Sâu 3** | 16.184 | **9,0248 ms** | **1.793,28** | 156,7846 ms | 103,22 | **$17{,}4\times$** |
| **Độ Sâu 4** | 496.790 | **285,4517 ms** | **1.740,36** | 5.083,4518 ms | 97,73 | **$17{,}8\times$** |

Phân tích bảng số liệu thực nghiệm này mang lại ba kết luận kỹ thuật vô cùng đắt giá:

1. **Thông Lượng Triệu Nút Ổn Định Tuyệt Đối**:
Động cơ Rust duy trì đường đặc tuyến thông lượng gần như nằm ngang từ **$1{,}74 \text{ đến } 2{,}04 \text{ triệu nút/giây}$** xuyên suốt mọi độ sâu. Trong khi đó, TypeScript chỉ dao động quanh mức $83 \text{ đến } 109 \text{ nghìn nút/giây}$—tạo ra một khoảng cách hiệu năng áp đảo từ **$17{,}8\times \text{ đến } 24{,}3\times$ nghiêng hoàn toàn về phía Rust**.
2. **Ranh Giới 5 Giây Gây Đơ Giao Diện**:
Ở độ sâu $d = 4$, việc duyệt gần nửa triệu nút trên TypeScript tốn hơn **$5{,}08$ giây**. Trên trình duyệt web, một tác vụ chiếm dụng 5 giây sẽ làm đứng màn hình, kích hoạt cảnh báo 'Trang web không phản hồi' và phá hỏng hoàn toàn trải nghiệm người dùng. 
Ngược lại, động cơ Rust WebAssembly xử lý xong đúng nửa triệu nút đó chỉ trong **$285$ mili-giây**—nằm trọn vẹn trong ngân sách phản hồi dưới 300ms của người dùng.
3. **Hiện Tượng Bất Biến Bộ Nhớ Zero GC**:
Theo dõi bộ nhớ RAM cho thấy trong suốt 496.790 lượt duyệt nút, biến đếm cấp phát Heap của Rust luôn bằng 0, trong khi môi trường V8 của JavaScript phải kích hoạt hơn 42 chu kỳ gom rác Minor GC để dọn dẹp các mảng đối tượng tạm thời.

Các số liệu thực nghiệm này là bằng chứng khoa học không thể phủ nhận khẳng định tính đúng đắn của quyết định chuyển dịch lõi sang Rust và WebAssembly."

---

## Phần 13: Hệ Thống 6 Cấp Độ AI Đối Kháng & Đánh Đổi Độ Sâu - Độ Rộng

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 8 / Mục 08: 6 Cấp Độ Bot. Trình bày sự khác biệt giữa các mức độ chơi.]`

"Từ nền tảng thuật toán trên, chúng em đã đóng gói thành **hệ thống 6 cấp độ AI đối kháng (6 Tiers)** phục vụ đầy đủ mọi phân khúc người chơi:

* **Tier 0: Easy (Độ sâu 0, Random)**: Sử dụng bộ sinh số giả ngẫu nhiên SplitMix64 PRNG chọn đều trong tập ô hợp lệ. Số nút duyệt: đúng 2 nút. Phù hợp cho trẻ em hoặc người mới học luật chơi.
* **Tier 1: Normal (Độ sâu 1, Greedy Heuristic)**: Đánh giá thế trận 1-ply bằng ma trận trọng số, tích hợp phản xạ tức thì: thắng ngay nếu có thể, chặn ngay nếu đối thủ sắp thắng.
* **Tier 2: Hard (Độ sâu 2, Alpha-Beta, Soft Cap 15)**: Nhìn xa 2 nước (một nước của mình, một nước phản công của đối thủ). Độ rộng mở rộng 15 ứng viên.
* **Tier 5: Very Hard (Độ sâu 3, Alpha-Beta, Soft Cap 12)**: Nhìn xa 3 nước, cho phép AI phát hiện và giăng các bẫy tấn công hai đầu (như tạo thế đôi Open Three).
* **Tier 3: Expert (Độ sâu 4, Alpha-Beta, Soft Cap 10)**: Nhìn xa 4 nước cờ, duyệt gần nửa triệu trạng thái trong vòng 285 mili-giây trên máy tính thông thường.
* **Tier 4: Master (Độ sâu 5, Alpha-Beta, Soft Cap 8)**: Cấp độ đại kiện tướng, nhìn xa tới 5 nước cờ liên tiếp.

Ở đây, có một câu hỏi học thuật rất sâu sắc: **Tại sao ở cấp độ Master (Tier 4), chúng em lại giảm Soft Cap xuống còn 8 ô, trong khi cấp độ Hard lại dùng Cap tới 15 ô?**

Điều này thể hiện sự thấu hiểu sâu sắc về **Sự Đánh Đổi giữa Độ Sâu và Độ Rộng (Depth-versus-Breadth Trade-off)**:
Ở độ sâu 2, cây tìm kiếm rất nông, chúng ta hoàn toàn có thể mở rộng độ rộng lên 15 ứng viên ($15^2 = 225$ nút lá) để tạo ra sự đa dạng phong phú trong các nước đi khai cuộc.
Thế nhưng ở độ sâu 5, nếu vẫn giữ độ rộng 15, số lượng nút lá trên lý thuyết sẽ là $15^5 \approx 759{,}000$ trạng thái—vượt quá giới hạn thời gian thực. Bằng cách áp dụng hàm Sắp xếp nước đi sắc bén và thu hẹp độ rộng vào 8 ứng viên tinh hoa nhất ($8^5 = 32{,}768$ nút lá tối đa trước khi cắt tỉa), chúng em giúp AI có thể đâm sâu tới 5 tầng suy nghĩ chỉ trong 250 mili-giây mà vẫn được bảo vệ an toàn 100% nhờ Quy tắc Tactical Retention."

---

## Phần 14: Thị Phạm Trực Tiếp Hệ Thống (Live System Demo)

`[CHỈ DẪN SÂN KHẤU: Chuyển màn hình máy chiếu sang trình duyệt tại địa chỉ http://localhost:5174 và http://localhost:8443. Thực hiện thao tác trực tiếp trước mắt Hội đồng.]`

"Kính thưa Hội đồng, em xin phép được thị phạm trực tiếp các phân hệ công nghệ ngay trên môi trường triển khai thực tế.

Hiện tại trên màn hình là ứng dụng thuyết minh tại cổng `http://localhost:5174`:
* Ở cột bên trái, quý Thầy Cô có thể thấy **Mục lục điều hướng 14 phân hệ thuật toán**, cho phép nhảy ngay đến bất kỳ chứng minh toán học nào.
* Ở góc trên bên phải, đây là **Bàn cờ đối kháng trực tiếp**. Khi em đánh một quân cờ tại tọa độ trung tâm $(7, 7)$, động cơ Rust WebAssembly trên luồng Worker phản hồi gần như tức thì dưới 10 mili-giây.
* Khi em bấm công tắc **'Vùng Chebyshev'**, trên bàn cờ lập tức phát sáng các chấm xanh bao quanh các quân cờ đang tranh chấp, minh chứng trực quan cho thuật toán cắt giảm $72{,}4\%$ không gian ô trống.
* Khi em nhấp vào nút **'Soi Biểu Đồ & Phân Tích'**, cửa sổ thanh tra kỹ thuật mở ra, hiển thị đầy đủ quy trình 4 bước tính toán, phân tích độ phức tạp thời gian $O(B^d)$, bộ nhớ Stack Frame và các điểm đánh đổi kỹ thuật.

Cuối cùng, em xin kính mời Hội đồng quan sát phân hệ **Live Python Sandbox (Pyodide WebAssembly)**:
Chúng em đã tích hợp nguyên vẹn trình thông dịch Python 3 trực tiếp trong trình duyệt web. Nếu em chọn kịch bản `pattern_scanner.py` và nhấn nút **'Chạy Code Python (Run)'**:
Trình duyệt sẽ tự động biên dịch mã nguồn, nạp thư viện C-Extension `numpy` qua WebAssembly, thực hiện quét 4 trục và in ra kết quả phân loại 7 hình thế cờ ngay trên màn hình terminal stdout.

Điều này chứng minh toàn bộ các kết quả nghiên cứu trong đồ án của chúng em là **hoàn toàn có thể tái hiện độc lập 100% ngay trên máy tính của người chấm mà không cần cài đặt thêm bất kỳ phần mềm phụ trợ nào**."

---

## Phần 15: Các Cổng Kiểm Định Chất Lượng, Định Hướng Phát Triển & Lời Cảm Ơn

`[CHỈ DẪN SÂN KHẤU: Chuyển sang Slide 16 & 17 / Tổng Kết & Nghiệm Thu. Chuẩn bị giọng nói trang trọng cho phần kết bài.]`

"Để đảm bảo độ tin cậy tuyệt đối của phần mềm, toàn bộ quy trình phát triển của đồ án đã vượt qua **6 Cổng Kiểm Định Nghiệm Thu (G1 đến G6)** và bao phủ toàn diện **10 kịch bản kiểm thử lỗi (S01 đến S10)**:
* Bộ kiểm thử Vitest và Cargo đạt **tỷ lệ đậu 100%** trên 38 unit tests Rust và 65 frontend tests.
* Bất biến hoàn tác Apply/Undo được chứng minh bảo toàn trên toàn bộ các tọa độ biên và góc bàn cờ.
* Toàn bộ mã nguồn và tệp nhị phân WebAssembly được niêm phong tính toàn vẹn thông qua mã băm mật mã học SHA-256 cố định `1ff854e6...`.

### Định Hướng Phát Triển Tương Lai
Mặc dù động cơ Alpha-Beta hiện tại đã đạt tới trình độ chiến thuật sắc sảo ở độ sâu 5, các thuật toán Heuristic cổ điển về lâu dài vẫn sẽ vấp phải **Hiệu ứng Đường Chân Trời (Horizon Effect)** ở giai đoạn tàn cuộc phức tạp.

Định hướng nghiên cứu tiếp theo của chúng em bao gồm hai mũi nhọn:
1. **Tìm kiếm Cây Monte Carlo (MCTS)**: Áp dụng kỹ thuật mô phỏng ngẫu nhiên có định hướng để đánh giá thế cờ theo xác suất thay vì chỉ dựa vào nhánh cắt tỉa cứng.
2. **Học Sâu Tăng Cường (Deep Reinforcement Learning - AlphaZero Gomoku)**: Huấn luyện mạng nơ-ron tích chập (CNN) thông qua cơ chế tự đấu (Self-Play) để tự động học các đặc trưng hình thế trực quan, thay thế hoàn toàn các trọng số heuristic thủ công. Nhờ kiến trúc động cơ Rust hiện tại đã được tách rời hoàn toàn, nó có thể được tái sử dụng ngay lập tức như một môi trường giả lập huấn luyện AI tốc độ cao.

### Lời Cảm Ơn & Kết Luận
Kính thưa Thầy Cô, đồ án này đã hoàn thành trọn vẹn 100% các mục tiêu cam kết trong đề cương ban đầu:
1. Thiết lập mô hình toán học hình thức và không gian trạng thái cờ Caro chuẩn.
2. Xây dựng động cơ mảng phẳng 240 bytes với quét thắng $O(1)$ và zero heap allocation.
3. Hiện thực hóa động cơ Alpha-Beta Pruning đạt **tốc độ tăng tốc $17{,}8\times \text{ đến } 24{,}3\times$** và thông lượng hơn **$1{,}74 \text{ triệu nút/giây}$**.
4. Phát hiện, mổ xẻ và giải quyết triệt để bẫy rơi nước cờ chiến thuật thông qua **Quy tắc Tactical Retention**.
5. Cung cấp trải nghiệm web 60 FPS mượt mà cùng hệ thống minh chứng thực nghiệm có khả năng tái hiện cao.

Em xin được bày tỏ lòng biết ơn sâu sắc và chân thành nhất đến Thầy/Cô hướng dẫn và toàn thể quý Thầy Cô tại Viện VNUK đã luôn tận tình chỉ dẫn, phản biện và đồng hành cùng em trong suốt học kỳ vừa qua.

Em xin chân thành cảm ơn Hội đồng đã chú ý lắng nghe. Em xin phép được sẵn sàng tiếp nhận mọi câu hỏi, ý kiến đóng góp và phản biện từ quý Thầy Cô."

---

## Bộ Phản Biện Q&A Toàn Diện: Câu Trả Lời Mẫu Đanh Thép Cho Các Câu Hỏi Của Hội Đồng

### Câu hỏi 1: *"Tại sao em lại chọn Rust biên dịch sang WebAssembly thay vì tối ưu hóa JavaScript bằng TypedArrays hoặc viết bằng C++?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ em xin cảm ơn Thầy/Cô vì một câu hỏi kiến trúc rất hay ạ.
> 
> Trong các thuật toán duyệt cây trò chơi đệ quy sâu, nút thắt cổ chai lớn nhất không chỉ là tốc độ CPU mà là hiện tượng phân mảnh bộ nhớ và xáo trộn bộ nhớ đệm (Cache Thrashing). Trong JavaScript, dù chúng ta có dùng `Int8Array` hay TypedArray, cơ chế phân bổ đối tượng đệ quy của động cơ V8 vẫn kích hoạt các chu kỳ dọn rác Garbage Collection định kỳ, gây ra các khoảng giật đơ (GC pauses) kéo dài từ 50 đến 100 mili-giây làm hỏng trải nghiệm người dùng.
> 
> Còn đối với C++, mặc dù C++ rất nhanh, nhưng việc biên dịch C++ sang WebAssembly qua Emscripten thường sinh ra tệp nhị phân có dung lượng lớn và hệ thống công cụ thiếu đi sự đảm bảo an toàn bộ nhớ ở cấp độ ngôn ngữ.
> 
> Rust là ngôn ngữ hoàn hảo nhất cho bài toán này nhờ hai lý do cốt tử:
> Thứ nhất, Rust đảm bảo an toàn bộ nhớ tuyệt đối tại thời điểm biên dịch mà không cần Garbage Collector. Cơ chế sở hữu (Ownership & Borrowing) giúp chúng em đảm bảo 100% không bị rò rỉ bộ nhớ hay lỗi con trỏ hoang khi thực hiện quay lui Apply/Undo trên cùng một mảng.
> Thứ hai, hệ sinh thái `wasm-pack` của Rust tạo ra tệp nhị phân cực kỳ tinh gọn (chỉ 111 KB trong bản phát hành của chúng em), tích hợp liền mạch với TypeScript. Kết quả đo đạc thực tế của chúng em ở Bảng 5.3 đã chứng minh Rust chạy nhanh hơn TypeScript từ $17{,}8\times$ đến $24{,}3\times$ lần."*

---

### Câu hỏi 2: *"Trong việc lọc ứng viên Chebyshev, tại sao em lại chọn bán kính R = 2? Tại sao không chọn R = 1 để duyệt nhanh hơn, hoặc R = 3 cho an toàn?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ em xin cảm ơn Thầy/Cô. Đây chính là một bài toán đánh đổi thực nghiệm trọng tâm mà em đã thực hiện ở Tuần 7 ạ.
> 
> Nếu chúng ta chọn $R = 1$, bộ sinh ứng viên chỉ quét các ô tiếp giáp trực tiếp cạnh quân cờ. Thế nhưng trong cờ Caro, rất nhiều nước đi chiến thuật nguy hiểm lại là các thế cờ 'nhảy cách quãng'—ví dụ như thế tam tử cách quãng `X . X X`, ô cờ tạo thành 4 quân nằm cách xa 2 bước. Nếu đặt $R = 1$, AI sẽ hoàn toàn bị mù trước các nước đi này và sẽ bị đối thủ đánh bại ngay lập tức.
> 
> Ngược lại, nếu chúng ta nới rộng lên $R = 3$, số lượng ứng viên mỗi lượt sẽ tăng vọt từ khoảng 18 ô lên hơn 60 ô. Trong một cây tìm kiếm Alpha-Beta ở độ sâu 4, việc số lượng ứng viên tăng gấp 3 sẽ làm thể tích cây tìm kiếm phình to theo cấp số nhân, khiến thời gian phản hồi vượt quá ngân sách 300ms của trình duyệt web.
> 
> Do đó, bán kính $R = 2$ là điểm cân bằng vàng về mặt toán học: nó nắm bắt trọn vẹn 100% các thế cờ trực tiếp, thế nhảy cóc và thế mã nhảy, trong khi vẫn cắt giảm thành công $72{,}39\%$ diện tích hoang vu của bàn cờ."*

---

### Câu hỏi 3: *"Em hãy giải thích rõ hơn về lỗi trong tệp `cap_loss.json` và quy tắc Tactical Retention đã cứu nguy cho thuật toán như thế nào?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ thưa Thầy/Cô, việc tìm ra lỗi trong `cap_loss.json` và xây dựng Quy tắc Tactical Retention chính là đóng góp nghiên cứu thực nghiệm quan trọng nhất của em trong đồ án ạ.
> 
> Ban đầu, để giới hạn thời gian chạy, em đặt một 'Giới hạn cứng' (Hard Cap) chỉ lấy đúng $K = 10$ ứng viên đầu tiên theo thứ tự quét hàng cột từ trên xuống dưới. Trong một ván đấu thử nghiệm, đối thủ tạo ra hai mối đe dọa cùng lúc: một thế cờ ở hàng 4 và một thế cờ hiểm ở hàng 12. Bộ quét tuần tự đã gom đủ 10 ô cờ xung quanh thế cờ ở hàng 4, chạm giới hạn 10 ô, và lập tức cắt bỏ toàn bộ phần còn lại.
> 
> Hậu quả là ô cờ bắt buộc phải chặn ở hàng 12 nằm ở vị trí thứ 11 trong danh sách quét nên đã bị thuật toán vứt bỏ không thương tiếc. Bot đã bị thua oan uổng ở ngay nước cờ sau đó.
> 
> Để khắc phục vĩnh viễn, em đã xây dựng **Quy Tắc Bảo Vệ Nước Đi Chiến Thuật (Tactical Retention Rule)**:
> Em tách riêng tập hợp $P$ gồm toàn bộ các nước đi có thể tạo thành 5 quân của mình và các nước cờ tạo thành 5 quân của đối thủ. Toàn bộ các nước cờ sinh tử trong tập $P$ này được ưu tiên đưa 100% vào danh sách tìm kiếm trước, sau đó mới áp dụng việc lấy các nước cờ thế trận cho đủ giới hạn Cap. Ngay cả khi kích thước tập $P$ vượt quá mức Cap, hệ thống vẫn bắt buộc phải mở rộng để giữ lại toàn bộ. Nhờ vậy, bot đạt tỷ lệ sống sót chiến thuật tuyệt đối 100% mà không bị giảm tốc độ trên các nước cờ thông thường."*

---

### Câu hỏi 4: *"Làm thế nào em xử lý được hiện tượng đụng độ mã băm (Hash Collision) của Zobrist Hashing trong Bảng Chuyển Vị?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ em xin cảm ơn câu hỏi rất sâu sắc của Thầy/Cô ạ.
> 
> Hiện tượng đụng độ mã băm trong các bảng băm không gian lớn được điều chỉnh bởi Nghịch lý Ngày sinh (Birthday Paradox).
> 
> Trong hệ thống của em, bảng Zobrist sử dụng các số nguyên ngẫu nhiên 64-bit ($2^{64} \approx 1{,}84 \times 10^{19}$ trạng thái). Với một ván cờ thông thường duyệt khoảng $10^6$ nút, xác suất xảy ra đụng độ toán học giữa hai thế cờ khác nhau trên không gian 64-bit là nhỏ hơn $1 \times 10^{-7}$—tức là xác suất cực kỳ nhỏ.
> 
> Tuy nhiên, để đảm bảo nguyên tắc lập trình phòng thủ tuyệt đối, mỗi ô nhớ trong Bảng chuyển vị 8MB của em không chỉ lưu mỗi điểm số mà lưu trữ một cấu trúc dữ liệu hoàn chỉnh: gồm cả khóa gốc 64-bit `zobrist_key`, độ sâu tìm kiếm `depth`, điểm số `score` và loại cận `flag`. Khi tra cứu bảng băm, động cơ bắt buộc phải so sánh khớp chính xác toàn bộ 64 bit của khóa băm và kiểm tra độ sâu đã lưu có lớn hơn hoặc bằng độ sâu hiện tại hay không thì mới chấp nhận kết quả. Điều này triệt tiêu hoàn toàn nguy cơ lấy nhầm điểm số do trùng lặp băm."*

---

### Câu hỏi 5: *"Tại sao trên bàn cờ quốc tế Gomoku lại dùng kích thước 15x15 thay vì 19x19 như cờ Vây, và hệ thống của em xử lý biên bàn cờ ra sao?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ thưa Thầy/Cô, trong lịch sử thi đấu quốc tế của Liên đoàn Renju Quốc tế (RIF), kích thước bàn cờ ban đầu vốn là $19 \times 19$ giống như cờ Vây. Tuy nhiên, vào giữa thế kỷ 20, các nhà toán học và kỳ thủ chuyên nghiệp nhận thấy rằng trên bàn cờ $19 \times 19$, không gian quá rộng khiến lợi thế đi trước của người cầm quân Đen là áp đảo hoàn toàn, khiến ván cờ mất đi tính cân bằng đối kháng. Do đó, kích thước $15 \times 15$ đã được chuẩn hóa để thu hẹp không gian và cân bằng lại ván cờ.
> 
> Trong động cơ của em, việc xử lý biên bàn cờ được tối ưu hóa với độ phức tạp $O(1)$ mà không tốn chi phí rẽ nhánh điều kiện. Trong hàm chuyển đổi tọa độ, bất kỳ giá trị nào ngoài khoảng $0 \le x, y < 15$ đều được trả về `None` ngay lập tức. Trong thuật toán quét tia Raycasting, tia quét sẽ tự động dừng bước ngay khi chỉ số tọa độ chạm ngưỡng $0$ hoặc $14$, ngăn chặn tuyệt đối lỗi tràn bộ nhớ (Out-of-bounds) ở cấp độ biên dịch của Rust ạ."*

---

### Câu hỏi 6: *"Sự khác biệt cốt lõi giữa Minimax, Alpha-Beta Pruning và Iterative Deepening Search trong đồ án của em là gì?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ thưa Thầy/Cô, ba thuật toán này tạo thành một chuỗi tiến hóa tối ưu hóa bậc thang trong đồ án của em:
> 
> 1. **Minimax** là thuật toán nền tảng đệ quy gốc. Nó duyệt cạn toàn bộ các nhánh của cây trò chơi mà không bỏ sót bất kỳ nút nào ($O(b^d)$). Đây là thước đo chuẩn để kiểm chứng tính đúng đắn về mặt lý thuyết.
> 2. **Alpha-Beta Pruning** kế thừa Minimax nhưng đưa thêm hai biến chặn $\alpha$ và $\beta$. Nó đảm bảo trả về kết quả tối ưu giống hệt Minimax, nhưng cắt bỏ các nhánh phụ mà đối thủ duy lý sẽ không bao giờ chọn, đưa độ phức tạp tiệm cận về $O(b^{d/2})$.
> 3. **Iterative Deepening Search (Tìm kiếm sâu dần)** bao bọc Alpha-Beta trong một vòng lặp tăng dần độ sâu: duyệt độ sâu 1, rồi độ sâu 2, rồi độ sâu 3... Cơ chế này mang lại hai lợi ích kỹ thuật tối quan trọng:
>    * Thứ nhất, nó giúp **kiểm soát ngân sách thời gian thực**: nếu thời gian 300ms kết thúc khi đang duyệt dở độ sâu 4, hệ thống có thể lập tức quay lui an toàn và trả về nước đi tối ưu đã được tính toán hoàn chỉnh từ độ sâu 3 mà không bị treo.
>    * Thứ hai, kết quả của độ sâu trước sẽ nạp đầy Bảng chuyển vị, tạo ra thứ tự sắp xếp nước đi tối ưu (Move Ordering) cho độ sâu sau, giúp việc tìm kiếm ở độ sâu sau thực chất lại nhanh hơn duyệt nguội từ đầu."*

---

### Câu hỏi 7: *"Em đã làm thế nào để chứng minh rằng động cơ Rust WebAssembly thực sự trả về kết quả giống hệt phiên bản tham chiếu TypeScript?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ thưa Thầy/Cô, đây chính là yêu cầu nghiệm thu nghiêm ngặt tại **Cổng Kiểm Định G3: Cross-Language Equivalence Verification** của đồ án ạ.
> 
> Trong bộ kiểm thử tích hợp, em đã thiết lập một tập hợp các thế cờ mẫu chuẩn hóa: gồm thế cờ khai cuộc trống, thế cờ trung cuộc giằng co gồm 8 quân, và các thế cờ bẫy sát cuộc phức tạp.
> 
> Em cho chạy song song cả động cơ TypeScript và động cơ Rust WebAssembly trên cùng các thế cờ đó ở các độ sâu 1, 2 và 3. Bộ kiểm thử tự động so sánh từng trường dữ liệu: số lượng nút duyệt (`nodesVisited`), số lần ngắt nhánh (`cutoffCount`), điểm số lượng giá trả về và tọa độ nước cờ tốt nhất được chọn. Kết quả kiểm định cho thấy cả hai động cơ đều cho ra các con số trùng khớp tuyệt đối 100%. Điều này chứng minh rằng việc tăng tốc từ $17{,}8\times$ đến $24{,}3\times$ của Rust thuần túy là nhờ tối ưu hóa phần cứng và quản lý bộ nhớ, chứ không hề làm thay đổi hay sai lệch logic chiến thuật của trò chơi."*

---

### Câu hỏi 8: *"Nếu có thêm ba tháng nữa để phát triển đồ án này, hướng nghiên cứu tiếp theo mà em muốn chinh phục là gì?"*
* **Lời thoại trả lời của sinh viên**:
> *"Dạ em xin cảm ơn câu hỏi định hướng rất truyền cảm hứng của Thầy/Cô ạ.
> 
> Nếu có thêm ba tháng nữa, ưu tiên kỹ thuật số một của em sẽ là nghiên cứu và tích hợp **Thuật toán Tìm kiếm Cây Monte Carlo kết hợp Mạng Nơ-ron Tích chập (MCTS with Deep CNN)**, tương tự như kiến trúc của AlphaZero Gomoku.
> 
> Mặc dù động cơ Alpha-Beta hiện tại của em chơi cực kỳ sắc bén trong các cự ly ngắn từ 1 đến 5 nước cờ, nhưng các hàm Heuristic tĩnh viết bằng tay sẽ dần bộc lộ giới hạn khi đánh giá các thế trận tàn cuộc trừu tượng cách xa 15 đến 20 nước cờ.
> 
> Một lợi thế cực kỳ lớn là lõi động cơ Rust của em hiện tại đã được tách rời độc lập hoàn toàn khỏi giao diện và đạt thông lượng lên tới 2 triệu trạng thái/giây. Em có thể tái sử dụng ngay lập tức động cơ Rust này làm môi trường giả lập tự đấu siêu tốc (Self-play simulation engine) để sinh hàng triệu ván cờ huấn luyện mạng nơ-ron học sâu, thay thế các trọng số heuristic thủ công bằng các đặc trưng hình học tự học của trí tuệ nhân tạo hiện đại."*

---

*Hết toàn văn kịch bản thuyết minh bảo vệ đồ án.*  
*Sinh viên thực hiện: Nguyễn Tâm Đức | Lớp: 24CSE | Viện Nghiên cứu và Đào tạo Việt - Anh (VNUK)*
