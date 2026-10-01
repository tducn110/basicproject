<!-- trustmebro -->
# Plan: Đồ Án Cơ Sở — Nghiên Cứu Thuật Toán AI Cho Game Cờ Caro & Tích Hợp Web UI

Kế hoạch tổng thể hợp nhất giữa đề cương nghiên cứu học thuật Đồ Án Cơ Sở (Week 1 – Week 6: Minimax, Alpha-Beta Pruning, Heuristic Evaluation) và dự án giao diện người dùng [`Caro Game UI Design`](file:///home/pro/Downloads/basicproject/Caro%20Game%20UI%20Design). Kế hoạch chia thành 6 giai đoạn rõ ràng theo tuần và mốc chức năng, xác định cụ thể những gì cần xây dựng (Build), đo lường (Measure), viết báo cáo (Write) và tiêu chí nghiệm thu (Exit criteria).

---

## 0. Decisions

| Topic | What the sources say / options | Decision | Why |
| :--- | :--- | :--- | :--- |
| **Rule Profile** | RIF Gomoku (chuẩn quốc tế) vs Caro Việt Nam (chặn 2 đầu, overline). | Áp dụng bàn 15×15, 5 quân liên tiếp thắng; luật chặn được cấu hình qua RuleProfile; kiểm tra thắng quanh `lastMove`. | Giữ game engine linh hoạt, tách biệt giữa cơ chế duyệt dòng (`WinDetector`) và chính sách xác định thắng (`RuleSet`). |
| **Core AI Stack** | TypeScript thuần vs WebAssembly / Rust. | Xây dựng baseline thuật toán bằng TypeScript thuần trước (Week 1 - 6), chuẩn bị interface cho Rust/WASM về sau. | Đảm bảo tính nhất quán với ecosystem web, dễ kiểm thử bằng Vitest và tích hợp trực tiếp vào Web UI. |
| **Web UI Architecture** | Giao diện xuất từ Figma Make hiện đang monolithic trong 1 file `src/App.tsx`. | Tách `App.tsx` thành các component độc lập tại `src/components/` và sửa đường dẫn import logic cờ. | Tuân thủ tiêu chuẩn modularity, dễ bảo trì và gắn bot AI qua cơ chế tách biệt presentation và simulation. |
| **Search Concurrency** | Chạy search AI trực tiếp trên Main Thread hay Web Worker. | Sử dụng Web Worker cho các thuật toán duyệt sâu (Minimax / Alpha-Beta). | Ngăn chặn hiện tượng giật lag UI / đóng băng trình duyệt khi AI tính toán nước đi. |

---

## 1. Objectives

**General objective.** Nghiên cứu, cài đặt và đánh giá thực nghiệm các thuật toán AI đối kháng (Heuristic Pattern-based, Minimax, Alpha-Beta Pruning) trên bàn cờ Caro 15×15, đồng thời tích hợp vào Web UI hoàn chỉnh phong cách giấy cổ điển (Paper Vintage).

**Specific objectives.**
1. Xây dựng Core Game Engine thuần TypeScript với khả năng kiểm tra thắng 4 trục quanh `lastMove` và bộ test fixture xác minh tính đúng đắn.
2. Cài đặt các cấp độ Bot AI: Random Bot, Heuristic Rule-Based Bot, Minimax Bot (độ sâu 1–3), và Alpha-Beta Pruning Bot.
3. Thu thập dữ liệu thực nghiệm so sánh định lượng: thời gian tìm kiếm (`searchTimeMs`), số node duyệt (`nodesVisited`), số nhánh cắt tỉa (`cutoffs`), và tỷ lệ thắng Bot-vs-Bot.
4. Tái cấu trúc và hoàn thiện dự án Web UI [`Caro Game UI Design`](file:///home/pro/Downloads/basicproject/Caro%20Game%20UI%20Design) (React 19, TailwindCSS v4), sửa lỗi import, hỗ trợ chế độ 1v1 và Đấu máy với phản hồi thời gian thực.
5. Tổng hợp báo cáo nghiên cứu và nhật ký thực nghiệm (Research Log) chuẩn mực học thuật từ Week 1 đến Week 6+.

**Deliverables.**
- Mã nguồn Web Game UI hoàn chỉnh, chạy mượt mà trên Desktop và Mobile.
- Module Core Game Engine & Bot AI có test suite Vitest kiểm thử tự động.
- Bộ dữ liệu thực nghiệm (bảng biểu, biểu đồ so sánh Minimax vs Alpha-Beta).
- Hồ sơ báo cáo Đồ Án Cơ Sở (đề cương, tài liệu các tuần, slide báo cáo).

---

## 2. Technical design

- **Kiến trúc phân lớp:**
  - **Presentation Layer (`Caro Game UI Design/src/`):** React 19, TailwindCSS v4, bàn cờ CSS Grid 15×15, paper-card tokens, âm thanh & hiệu ứng.
  - **Simulation & Rules (`src/game.ts` / Core Engine):** State model bất biến (`GameState`), ma trận bàn cờ 15×15 (`Cell[][]`), bộ kiểm tra thắng 4 trục (`DIRS`: ngang, dọc, chéo chính, chéo phụ).
  - **AI / Search Layer:** Heuristic line evaluator (`countLine`, `scorePosition`), candidate move generator (Chebyshev radius = 2), Minimax & Alpha-Beta search.
  - **Instrumentation:** Bộ đếm node (`nodesVisited`), bộ đo thời gian `performance.now()`, bộ đếm cắt tỉa (`pruneCount`).
- **Tech Stack:** TypeScript 5.7, React 19, Vite 8, TailwindCSS v4, Vitest 4, Lucide React.

---

## 3. Research framing

### 3.1 Research questions
- **RQ1:** Mô hình dữ liệu nào biểu diễn trạng thái bàn cờ Caro 15×15 đảm bảo tính tất định (deterministic) và tối ưu cho thuật toán tìm kiếm?
- **RQ2:** Cơ chế kiểm tra thắng cục bộ quanh `lastMove` giúp giảm độ phức tạp tính toán như thế nào so với quét toàn bộ bàn cờ?
- **RQ3:** Mức độ cải thiện tỷ lệ thắng của Rule-Based Bot (Pattern Detection) so với Random Bot trên bàn cờ 15×15?
- **RQ4:** Giới hạn độ sâu tìm kiếm khả thi của Minimax vét cạn trên bàn cờ 15×15 trước khi gặp bùng nổ tổ hợp?
- **RQ5:** Alpha-Beta Pruning cắt giảm được bao nhiêu phần trăm số node duyệt và thời gian tìm kiếm so với Minimax ở cùng độ sâu?

### 3.2 Contributions to claim
1. Đặc tả hình thức và bộ test fixtures chuẩn hóa cho luật chơi cờ Caro 15×15.
2. Bằng chứng thực nghiệm so sánh định lượng giữa Minimax vét cạn và Alpha-Beta Pruning trên tập thế cờ cố định.
3. Ứng dụng Web tương tác hoàn chỉnh tích hợp mô hình AI đa cấp độ.

### 3.3 Metrics
| Metric | Measures | Tool |
| :--- | :--- | :--- |
| `searchTimeMs` | Thời gian tính toán nước đi (mili-giây) | `performance.now()` |
| `nodesVisited` | Số lượng node trên cây trạng thái được thuật toán duyệt qua | Bộ đếm nội tại trong hàm tìm kiếm |
| `cutoffs` | Số lần nhánh tìm kiếm bị cắt bỏ bởi điều kiện alpha/beta | Bộ đếm nhánh cắt trong Alpha-Beta |
| `candidateCount` | Số nước đi ứng viên được giữ lại sau bộ lọc lân cận | Độ dài tập `candidates` |
| `winRate` | Tỷ lệ Thắng / Hòa / Thua giữa các cặp Bot | Kịch bản Bot-vs-Bot tự động (100 ván) |

### 3.4 Planned experiments and ablations
- **Exp 1 (Correctness):** Chạy bộ test fixtures xác minh: nước đi hợp lệ, thắng 4 hướng, phát hiện hòa, bắt lỗi nước đi ngoài biên hoặc trùng ô.
- **Exp 2 (Baseline Match):** Cho Random Bot đấu với Rule-Based Bot (100 ván) để thiết lập mốc đánh giá năng lực cơ bản.
- **Exp 3 (Search Scaling):** Đo `searchTimeMs` và `nodesVisited` của Minimax ở các độ sâu d = 1, 2, 3 trên tập thế cờ mẫu.
- **Exp 4 (Pruning Efficiency):** Chạy song song Minimax vs Alpha-Beta trên 10 thế cờ cố định, ghi nhận % node được cắt giảm và hệ số tăng tốc.

### 3.5 Evaluation data
- Tập 10 thế cờ chuẩn (Test Positions Corpus) gồm:
  - 2 thế cờ khai cuộc (Opening - ít hơn 6 quân).
  - 5 thế cờ trung cuộc phức tạp (Midgame - 10 đến 25 quân).
  - 3 thế cờ tàn cuộc / sát cục (Tactical near-win - đe dọa 4 liên tiếp hoặc 3 mở).
- Bộ thế cờ này được đóng băng cố định để toàn bộ các phép đo đều so sánh trên cùng một cơ sở.

---

## 4. Environments

| Profile | Machine / Runtime | Role |
| :--- | :--- | :--- |
| **Development** | Node.js v20+, Vite 8, Linux (x86_64) | Môi trường lập trình, build và chạy ứng dụng cục bộ |
| **Testing** | Vitest 4 + JSDOM | Chạy unit tests, kiểm thử luật và đo lường thuật toán |
| **Benchmark Host** | CPU x86_64, Single-thread execution | Đo đạc thời gian tìm kiếm chuẩn mực không bị nhiễu đa nhân |

---

## 5. Schedule (6 Phases)

### Phase 1: Research Foundation & Rule Specification (Tuần 1)
**Build**
- Hoàn thiện đề cương nghiên cứu, danh mục thuật ngữ (Caro, Gomoku, branching factor, ply).
- Đặc tả hình thức luật chơi Project Rule Profile và mô hình GameState.

**Write**
- Báo cáo [`Week1/Tuần 1.md`](file:///home/pro/Downloads/basicproject/Week1/Tu%E1%BA%A7n%201.md) và tài liệu Đề cương đồ án.

**Exit criteria**: Đề cương được phê duyệt; tài liệu Tuần 1 hoàn tất đầy đủ định nghĩa toán học và phạm vi nghiên cứu.

---

### Phase 2: Core Game Engine & Correctness Baseline (Tuần 2)
**Build**
- Cài đặt Game Engine TypeScript: `Board`, `GameState`, `MoveRules`, `WinRules`.
- Cài đặt cơ chế kiểm tra thắng quanh `lastMove` trên 4 hướng.
- Viết bộ test fixture Vitest bao phủ: nước đi hợp lệ, thắng ngang/dọc/chéo, bàn đầy hòa cờ.

**Measure**
- Tỷ lệ pass của bộ unit test (100%).

**Write**
- Cập nhật tài liệu [`Week2/Tuan 2.md`](file:///home/pro/Downloads/basicproject/Week2/Tuan%202.md) và [`Week2/week2.md`](file:///home/pro/Downloads/basicproject/Week2/week2.md).

**Exit criteria**: Toàn bộ unit tests pass; logic cờ deterministic không phụ thuộc UI.

---

### Phase 3: Pattern Detection & Rule-Based Bot (Tuần 3 - 4)
**Build**
- Cài đặt bộ nhận diện hình thế (Pattern Detection): 5 liên tiếp, 4 mở hai đầu, 4 chặn một đầu, 3 mở, 3 chặn, 2 mở.
- Xây dựng ma trận trọng số đánh giá Heuristic công - thủ (`attack * 1.1 + defense`).
- Cài đặt Random Bot và Rule-Based Bot (`getAIMove`).

**Measure**
- Đối đầu 100 ván giữa Random Bot vs Rule-Based Bot (kỳ vọng Rule-Based thắng > 95%).
- Số lượng candidate trung bình được sinh ra theo bán kính Chebyshev r = 2.

**Write**
- Hoàn thiện các tài liệu trong thư mục [`Week4/`](file:///home/pro/Downloads/basicproject/Week4/): Heuristic Evaluation, Pattern Detection, Rule-Based Bot, Random Bot.

**Exit criteria**: Rule-Based Bot đánh bại Random Bot áp đảo; bộ nhận diện hình thế không bỏ sót các nước thắng/đe dọa trực tiếp.

---

### Phase 4: Minimax Algorithm & Game Tree Search (Tuần 5)
**Build**
- Cài đặt thuật toán Minimax đệ quy với giới hạn độ sâu (Depth-limited search).
- Tích hợp bộ đếm `nodesVisited` và đo `searchTimeMs`.
- Xây dựng module trích xuất cây trò chơi (Game Tree visualizer/logger).

**Measure**
- Đo số node duyệt và thời gian tính toán của Minimax ở depth = 1, 2, 3 trên 10 thế cờ mẫu.
- Vẽ biểu đồ đường cong tăng trưởng số node theo độ sâu.

**Write**
- Hoàn thiện các tài liệu trong thư mục [`Week5/`](file:///home/pro/Downloads/basicproject/Week5/): Nghiên cứu Minimax, Game Tree, Giới hạn độ sâu, Kiểm thử Minimax.

**Exit criteria**: Minimax trả về nước đi tối ưu ở độ sâu cấu hình; ghi nhận đầy đủ bảng số liệu bùng nổ node khi tăng độ sâu.

---

### Phase 5: Alpha-Beta Pruning & Search Optimization (Tuần 6)
**Build**
- Cài đặt thuật toán cắt tỉa Alpha-Beta Pruning (`alpha`, `beta` bounds).
- Thêm bộ đếm số nhánh cắt tỉa (`cutoffs`).
- Thử nghiệm kỹ thuật sắp xếp nước đi cơ bản (Move Ordering) ưu tiên các ô gần quân đã đánh.

**Measure**
- So sánh đối đầu trực tiếp giữa Minimax và Alpha-Beta trên cùng 10 thế cờ:
  - Tỷ lệ giảm node: `(1 - nodes_AlphaBeta / nodes_Minimax) * 100%`.
  - Hệ số tăng tốc thời gian thực thi: `time_Minimax / time_AlphaBeta`.

**Write**
- Hoàn thiện các tài liệu trong thư mục [`Week6/`](file:///home/pro/Downloads/basicproject/Week6/): Nghiên cứu Alpha-Beta, Đo Nodes Visited, Đo Nodes Prune, Đo Search Time, So sánh với Minimax.

**Exit criteria**: Alpha-Beta cho nước đi hoàn toàn tương đương Minimax nhưng giảm tối thiểu 50% số node duyệt ở depth >= 3; hoàn thành bảng số liệu so sánh.

---

### Phase 6: UI Refactoring, Audio & Web App Polish (Tuần 7)
**Build**
- Sửa lỗi import tại [`Caro Game UI Design/src/App.tsx#L23`](file:///home/pro/Downloads/basicproject/Caro%20Game%20UI%20Design/src/App.tsx#L23) (đổi `"./lib/game"` thành `"./game"`).
- Tách file monolithic `App.tsx` thành các component con trong `src/components/` (`BoardGrid`, `PlayerCard`, `WinBanner`, `InfoCard`, `HistoryPanel`).
- Cài đặt Web Audio API cho hiệu ứng âm thanh: đặt quân cờ (click nhẹ), chiến thắng (fanfare), đánh với máy.
- Đảm bảo hiển thị chuẩn Responsive trên cả điện thoại và máy tính.

**Measure**
- `npm run build` thành công không cảnh báo lỗi type.
- Giao diện đạt tốc độ phản hồi 60 FPS khi click đặt quân.

**Write**
- Cập nhật [`Caro Game UI Design/LAYOUT.md`](file:///home/pro/Downloads/basicproject/Caro%20Game%20UI%20Design/LAYOUT.md).

**Exit criteria**: Ứng dụng chạy mượt mà, không có lỗi console, giao diện giấy vintage tương tác tự nhiên.

---

## 6. Report outline

| Chương báo cáo | Giai đoạn phụ trách | Bảng biểu & Hình ảnh chính |
| :--- | :--- | :--- |
| **Chương 1: Tổng quan & Đề cương** | Phase 1 (Week 1) | Sơ đồ phạm vi nghiên cứu, bảng thuật ngữ, mô hình toán học |
| **Chương 2: Thiết kế Game Engine & Biểu diễn trạng thái** | Phase 2 (Week 2) | Kiến trúc Game Engine, giải thuật duyệt 4 trục, bảng kết quả test |
| **Chương 3: Nhận diện mẫu thế cờ & Heuristic** | Phase 3 (Week 3 - 4) | Bảng trọng số các mẫu cờ (Open 4, Blocked 4, Open 3...), biểu đồ tỷ lệ thắng |
| **Chương 4: Thuật toán Minimax & Bùng nổ không gian trạng thái** | Phase 4 (Week 5) | Đồ thị cây trò chơi (Game Tree), bảng đo `nodesVisited` theo độ sâu |
| **Chương 5: Tối ưu hóa với Alpha-Beta Pruning** | Phase 5 (Week 6) | Bảng đối chiếu Minimax vs Alpha-Beta, biểu đồ cắt giảm node và thời gian |
| **Chương 6: Tích hợp Giao diện Web Game & Đánh giá** | Phase 6 (Week 7) | Ảnh chụp giao diện Web UI (Desktop/Mobile), kiến trúc component |

---

## 7. Risks and fallbacks

| Risk | Signal | Fallback |
| :--- | :--- | :--- |
| **Bùng nổ tổ hợp ở Minimax depth ≥ 4** | Trình duyệt bị đơ, tính toán vượt quá 5 giây/nước đi | Giới hạn độ sâu mặc định ≤ 3; bắt buộc dùng bộ sinh ứng viên lân cận (radius = 2) thay vì duyệt cả bàn 225 ô |
| **Lỗi module import trong UI prototype** | `vite build` thất bại với thông báo `Cannot resolve ./lib/game` | Trỏ lại đường dẫn đúng `./game` hoặc tạo thư mục `src/lib/` chứa logic |
| **Heuristic bị thiên lệch phòng thủ** | Bot liên tục chặn mà không chủ động tạo thế tấn công thắng | Điều chỉnh tỷ số công/thủ trong hàm đánh giá (`attack * 1.1 + defense` hoặc kiểm tra nước thắng trước) |
| **Trải nghiệm trên điện thoại bị tràn bàn cờ** | Màn hình nhỏ bị mất thanh thông tin hoặc không cuộn được | Áp dụng layout mode co giãn `min(100vw - 32px, 100dvh - 210px, 620px)` |

---

## 8. Deviations

*(Chưa có thay đổi nào. Mọi điều chỉnh kế hoạch sau này sẽ được ghi nhận tại đây kèm ngày tháng và lý do)*
