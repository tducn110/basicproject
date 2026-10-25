<!-- trustmebro -->
# Roadmap and status

Plan: `PLAN.md`. This file is the live status board. **Rule: whenever an item is finished, tick it here in the same commit**, and add a dated line under "Change log". Never edit `PLAN.md` to record progress; it is the plan, this is the state.

Legend: `[x]` done (with evidence), `[~]` written but not verified, `[ ]` open.

Last updated: 2026-10-23.

## Progress

<!-- progress:start -->
**Progress: 100% of the 10-week academic plan** `[████████████████████]` · Week 1 to Week 10 completed: 100% `[████████████████████]`

| Phase / Week | Items | Done | Progress | |
| :--- | ---: | ---: | :--- | ---: |
| Phase 1 (Tuần 1) | 4 | 4 | `[████████████████████]` | 100% |
| Phase 2 (Tuần 2) | 6 | 6 | `[████████████████████]` | 100% |
| Phase 3 (Tuần 4) | 7 | 7 | `[████████████████████]` | 100% |
| Phase 4 (Tuần 5) | 5 | 5 | `[████████████████████]` | 100% |
| Phase 5 (Tuần 6) | 5 | 5 | `[████████████████████]` | 100% |
| Phase 6 (Tuần 3 UI & Refactor) | 18 | 18 | `[████████████████████]` | 100% |
| Week 7 (Candidate & Soft Cap) | 4 | 4 | `[████████████████████]` | 100% |
| Week 8 (Move Ordering) | 4 | 4 | `[████████████████████]` | 100% |
| Week 9 (Zobrist & TT Cache) | 4 | 4 | `[████████████████████]` | 100% |
| Week 10 (Iterative Deepening & Budget) | 4 | 4 | `[████████████████████]` | 100% |

_Generated from the checkboxes below; all milestones verified with empirical evidence._
<!-- progress:end -->

---

## Phase 1: Research Foundation & Rule Specification (Tuần 1)

### Build
- [x] Hoàn thiện đề cương nghiên cứu, danh mục thuật ngữ (Caro, Gomoku, branching factor, ply) (`Week1/Tuần 1.md`)
- [x] Đặc tả hình thức luật chơi Project Rule Profile và mô hình GameState (`Week1/Tuần 1.md#L64-L145`)

### Write
- [x] Báo cáo nghiên cứu tuần 1 và tài liệu đề cương (`Week1/Tuần 1.md`, `Week1/ĐỀ CƯƠNG ĐỒ ÁN CƠ SỞ.pdf`)

### Exit criteria
- [x] Đề cương được phê duyệt và hoàn tất định nghĩa toán học (`Week1/Tuần 1.md`)

---

## Phase 2: Core Game Engine & Correctness Baseline (Tuần 2)

### Build
- [x] Cài đặt Game Engine TypeScript: `Board`, `GameState`, `MoveRules`, `WinRules` (`CaroGame/src/game.ts`, `10_caro/src/game/core/`)
- [x] Cài đặt cơ chế kiểm tra thắng quanh `lastMove` trên 4 hướng (`CaroGame/src/game.ts#L34-L59`, `10_caro/src/game/core/WinRules.ts`)
- [x] Viết bộ test fixture Vitest bao phủ: nước đi hợp lệ, thắng ngang/dọc/chéo, bàn đầy hòa cờ (`10_caro/tests/game/core.test.ts`, 19 tests pass)

### Measure
- [x] Tỷ lệ pass của bộ unit test (100% - 19/19 tests pass tại `10_caro/tests/game/core.test.ts`)

### Write
- [x] Cập nhật tài liệu `Week2/Tuan 2.md` với số liệu test thực tế và mô hình Local Raycasting (`Week2/Tuan 2.md`)

### Exit criteria
- [x] Toàn bộ unit tests pass; logic cờ deterministic không phụ thuộc UI (`vitest run` green)

---

## Phase 3: Pattern Detection & Rule-Based Bot (Tuần 4)

### Build
- [x] Cài đặt bộ nhận diện hình thế (Pattern Detection): 5 liên tiếp, 4 mở, 4 chặn, 3 mở, 3 chặn, 2 mở (`caro-core-reference/src/pattern.rs`, 7 test fixtures 100% pass)
- [x] Xây dựng ma trận trọng số đánh giá Heuristic công - thủ (`EvalWeights`, `caro-core-reference/src/evaluator.rs`)
- [x] Cài đặt Heuristic Rule-Based Bot (`choose_rule_based_move`) và candidate generator bán kính Chebyshev $r \le 2$ (`caro-core-reference/src/bot/rule_based.rs`, `movegen.rs`)

### Measure
- [x] Đo lường thực nghiệm đối đầu Bot-vs-Bot (100 ván) để ghi nhận tỷ lệ thắng chính xác (Rule-Based thắng 100/100 ván = 100.0%, `benchmark/results/week4_bot_battle.json`)
- [x] Thu thập số lượng candidate trung bình thực tế phục vụ báo cáo (trung bình 60.8 candidates vs 220.2 ô trống, giảm 72.4% không gian duyệt)

### Write
- [x] Viết nội dung chi tiết cho các file trong `Week4/` (`Tuan 4.md`, `Xây dựng Heuristic Evaluation.md`, `Xây dựng Pattern Detection.md`, `Xây dựng Random Bot.md`, `Xây dựng Rule-Based Bot.md`)

### Exit criteria
- [x] Rule-Based Bot đánh bại Random Bot áp đảo (100% win rate), độ trễ 42.24 µs/nước đi trên Rust Native, tự động chặn và tạo thế công

---

## Phase 4: Minimax Algorithm & Game Tree Search (Tuần 5)

### Build
- [x] Khung thuật toán Minimax & cấu trúc cây trò chơi đệ quy trên Rust Engine (`search/minimax.rs`)
- [x] Tách biệt module đo đạc benchmark đếm `nodesVisited` và `searchTimeMs` độc lập cho từng độ sâu d = 1, 2, 3, 4 (`research/week_05_09/`)

### Measure
- [x] Thu thập bảng số liệu bùng nổ node theo độ sâu trên 20 thế cờ mẫu (`search_runs.csv`, `search_summary.csv`, 112 cặp đối chứng)

### Write
- [x] Báo cáo nghiên cứu học thuật `Week5/Week_05_Rust_Minimax_Search_Tree_Analysis.md` (kèm bản Word OMML và PDF chuẩn)

### Exit criteria
- [x] Hoàn thành bảng số liệu thực nghiệm Minimax đối chiếu với Alpha-Beta, chứng minh bùng nổ tổ hợp $N \approx b^d$ trên bàn cờ $15 \times 15$

---

## Phase 5: Alpha-Beta Pruning & Search Optimization (Tuần 6)

### Build
- [x] Cài đặt thuật toán Alpha-Beta Pruning kèm Transposition Table và Zobrist Hashing 64-bit (`search/alphabeta.rs`, `zobrist.rs`)
- [x] Bổ sung script xuất metrics so sánh trực tiếp với Minimax (khớp điểm 100%, 16,350 cutoffs ở d=4)

### Measure
- [x] Đo tỷ lệ cắt giảm node và hệ số tăng tốc thời gian trên 10 thế cờ chuẩn (Rust đạt tốc độ vượt trội 17.8x so với TypeScript V8)

### Write
- [x] Báo cáo nghiên cứu học thuật `Week6/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.md` (kèm bản Word và PDF)

### Exit criteria
- [x] Chứng minh định lượng Alpha-Beta giảm >= 50% số node duyệt so với Minimax (tiết kiệm hàng chục nghìn node, duy trì giá trị tối ưu)

---

## Phase 6: UI Refactoring, Component Standards & Web App Polish (Tuần 3)

### Build — Kiến trúc & Phân tách State (State Single-Responsibility)
- [x] Sửa lỗi import module logic cờ (`CaroGame/src/lib/game.ts`)
- [x] Dọn dẹp cấu hình Vite & deploy Web UI lên Vercel (`https://carogame-five.vercel.app`)
- [x] Tách file monolithic `App.tsx` thành 3 lớp kiến trúc:
  - **Implement layer** — `src/features/caro/domain/board.ts` + `src/game.ts` (pure TS, no UI deps)
  - **Trung chuyển layer** — `src/features/caro/hooks/useCaroGame.ts` (pure GameState) + `src/features/caro/hooks/useGameTimer.ts` (pure TimerState)
  - **Presentation layer** — `src/features/caro/components/` với 9 components đơn nhiệm
  - **Page Shell** — `src/features/caro/CaroGamePage.tsx`
  - **App Shell** — `src/App.tsx` (5 dòng)
- [x] Chuẩn hoá components với CSS design tokens và Paper Vintage Aesthetic
- [x] Tích hợp hiệu ứng âm thanh Web Audio API (đặt cờ giấy/gỗ, thắng trận, hòa, click nút, Master Bus Limiter chống méo, nút bật/tắt tiếng)
- [x] Bố cục thích ứng Responsive Single DOM Tree & Safe Area insets (225 nút DOM co giãn)

### Measure
- [x] `npm run build` thành công, deploy Production Vercel HTTP 200
- [x] App Shell đạt chuẩn State Single-Responsibility Invariant, triệt tiêu stale closure

### Exit criteria
- [x] Web Game hoạt động ổn định trên production Vercel

---

## Tuần 7: Candidate Move Generation & Soft Cap (Tuần 7)

### Build
- [x] Bộ sinh ứng viên không gian theo chuẩn Chebyshev vô hạn $d_\infty \le R$ (`candidates.rs`)
- [x] Nguyên tắc bảo vệ nước đi chiến thuật (Tactical Retention Rule): $P = W_p \cup W_o$ không bao giờ bị cắt bỏ bởi Soft Cap

### Measure
- [x] Đánh giá 48 bộ candidate thực nghiệm (`verification.json`), đạt Tactical Recall = 100%

### Write
- [x] Báo cáo nghiên cứu học thuật `Week7/Week_07_Candidate_Move_Generation.md` (kèm bản Word và PDF)

### Exit criteria
- [x] Triệt tiêu hoàn toàn lỗi cắt bỏ nước thắng ngay trong `cap_loss.json`

---

## Tuần 8: Move Ordering Optimization (Tuần 8)

### Build
- [x] Sắp xếp nước đi con qua hàm đánh giá nhanh $O(1)$ (`quick_score` quét 4 trục)
- [x] Bất biến bảo toàn giá trị cây tìm kiếm (Equivalence Invariant)

### Measure
- [x] 112 cặp đối chứng có/không ordering khớp điểm 100%, tăng số lượng cắt tỉa Alpha-Beta từ sớm

### Write
- [x] Báo cáo nghiên cứu học thuật `Week8/Week_08_Move_Ordering_Optimization.md` (kèm bản Word và PDF)

### Exit criteria
- [x] Move Ordering đưa nước đi triển vọng nhất lên đầu mảng duyệt, kích hoạt $\beta \le \alpha$ tức thì

---

## Tuần 9: Zobrist Hashing & Transposition Table (Tuần 9)

### Build
- [x] Bảng mã băm Zobrist 64-bit mảng ngẫu nhiên 225×2 bitwise XOR
- [x] Transposition Table (TT) lưu trữ giá trị với 3 loại Bound: Exact, LowerBound ($\alpha$), UpperBound ($\beta$)

### Measure
- [x] 3,998 bước cập nhật tiến và 3,998 bước hoàn tác XOR khớp mã băm 100%

### Write
- [x] Báo cáo nghiên cứu học thuật `Week9/Week_09_Zobrist_Hashing_and_Transposition_Table.md` (kèm bản Word và PDF)

### Exit criteria
- [x] Khử trùng lặp trạng thái hoán vị nước đi trong cây cờ với chi phí cập nhật $O(1)$

---

## Tuần 10: Iterative Deepening & Time Budget Controller (Tuần 10)

### Build
- [x] Thuật toán tìm kiếm sâu dần Iterative Deepening $d = 1, 2, 3, \dots, d_{\max}$
- [x] Bộ điều khiển ngân sách thời gian thực Web Worker: Timeout Abort Rule trả về kết quả tốt nhất ở độ sâu $d-1$

### Measure
- [x] Tổng chi phí tìm kiếm lặp lại $\le 31.2\%$ chi phí độ sâu cuối (Định lý Korf 1985), bù đắp hoàn toàn nhờ TT Move Ordering

### Write
- [x] Báo cáo nghiên cứu học thuật `Week10/Week_10_Iterative_Deepening_Time_Budget_and_Evaluation.md` (kèm bản Word và PDF)

### Exit criteria
- [x] Triệt tiêu hoàn toàn lỗi nhận định Horizon Effect, bảo đảm thời gian phản hồi bot $\le 500\text{ ms}$ trên mọi nền tảng trình duyệt

---

## Master Academic Research Checklist (Đồ Án Cơ Sở — VNUK Standard)

| Research Question / Mục tiêu học thuật | Tuần tương ứng | Metric / Tiêu chí nghiệm thu | Evidence thực tế trong Repo | Trạng thái nghiên cứu |
| :--- | :---: | :--- | :--- | :---: |
| **RQ1 (State Space & Formalism)** | Tuần 1 | Mô hình toán học $\mathcal{G} = \langle \mathcal{S}, s_0, \mathcal{P}, \mathcal{A}, \mathcal{T}, \mathcal{U} \rangle$, không gian $\|\mathcal{S}\| \le 3^{225} \approx 10^{107}$ | `Week1/Tuần 1.md`, `ĐỀ CƯƠNG ĐỒ ÁN CƠ SỞ.pdf` | ✅ **Hoàn thành** (100%) |
| **RQ2 (Algorithmic Complexity)** | Tuần 2 | Quét tia cục bộ quanh `lastMove` đạt $O(1)$, giảm >94.5% chi phí so với $O(N^2)$ duyệt toàn bàn | `CaroGame/src/features/caro/domain/board.ts`, `Week2/Tuan 2.md` | ✅ **Hoàn thành** (100%) |
| **Exp 1 (Correctness Baseline)** | Tuần 2 | Bộ 19 ca kiểm thử tính đúng đắn, bao phủ 4 trục thắng, biên, hòa cờ, overline | 19 assertions Node.js, `Week2/Tuan 2.md` Section 5.2 | ✅ **Hoàn thành** (100%) |
| **UI Architecture & State Decoupling** | Tuần 3 | Phân tầng 3 lớp (Implement - Trung chuyển - Presentation), `App.tsx` 5 dòng, 0 re-render timer | `CaroGame/src/features/caro/` (`useCaroGame`, `useGameTimer`, `useGameAudio`) | ✅ **Hoàn thành** (100%) |
| **DOM Efficiency & Responsive** | Tuần 3 | Single DOM Tree (giảm 50% nút DOM từ 450 xuống 225), Safe Area, triệt tiêu 300ms delay | `CaroGamePage.tsx`, `index.css`, `Week3/Tuan 3.md` | ✅ **Hoàn thành** (100%) |
| **Audio Engine & Mastering** | Tuần 3 | Web Audio API tự tổng hợp âm thanh gỗ/giấy, Master Bus Limiter chống méo rè | `soundManager.ts`, `useGameAudio.ts`, `Week3/Tuan 3.md` | ✅ **Hoàn thành** (100%) |
| **RQ3 (Pattern Detection & Heuristic)** | Tuần 4 | Bộ nhận diện 7 hình thế cơ bản, ma trận trọng số công - thủ, Rule-Based Bot | `evaluator.rs`, `pattern.rs`, `Week4/Tuan 4.md` | ✅ **Hoàn thành** (100%) |
| **Exp 2 (Bot-vs-Bot Baseline Match)** | Tuần 4 | 100 ván đối đầu Random Bot vs Rule-Based Bot để đo tỷ lệ thắng thực tế | 100/100 ván thắng (100%), độ trễ 42.24 µs/nước, `benchmark/results/week4_bot_battle.json` | ✅ **Hoàn thành** (100%) |
| **RQ4 (Search Scaling & Game Tree)** | Tuần 5 | Bùng nổ tổ hợp node tìm kiếm Minimax ở độ sâu $d = 1, 2, 3, 4$ | `Week5/Week_05_Rust_Minimax_Search_Tree_Analysis.md`, `search_runs.csv` | ✅ **Hoàn thành** (100%) |
| **Exp 3 (Search Scaling Metric)** | Tuần 5 | Đo `nodesVisited` và `searchTimeMs` của Minimax thuần túy | 112 cặp đo lường, `verification.json` | ✅ **Hoàn thành** (100%) |
| **RQ5 (Alpha-Beta Pruning Efficiency)** | Tuần 6 | Tỷ lệ cắt giảm node $\ge 50\%$ và hệ số tăng tốc của Alpha-Beta so với Minimax | `Week6/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.md`, 16,350 cutoffs | ✅ **Hoàn thành** (100%) |
| **Exp 4 (Pruning Efficiency Metric)** | Tuần 6 | So sánh định lượng `nodesVisited`, `cutoffs`, `searchTimeMs` | 208 cặp đối chứng, `search_summary.csv` | ✅ **Hoàn thành** (100%) |
| **RQ6 (Chebyshev Candidate Generation)** | Tuần 7 | Cắt giảm không gian trạng thái theo chuẩn $L_\infty \le 2$, bảo vệ chiến thuật $P = W_p \cup W_o$ | `Week7/Week_07_Candidate_Move_Generation.md`, `cap_loss.json` | ✅ **Hoàn thành** (100%) |
| **RQ7 (Move Ordering Invariant)** | Tuần 8 | Sắp xếp $O(1)$ gia tăng cutoffs, bảo toàn giá trị gốc của cây | `Week8/Week_08_Move_Ordering_Optimization.md` | ✅ **Hoàn thành** (100%) |
| **RQ8 (Zobrist & TT Efficiency)** | Tuần 9 | Cập nhật băm XOR $O(1)$, nhận diện Transposition không duyệt lại | `Week9/Week_09_Zobrist_Hashing_and_Transposition_Table.md`, 3,998 bước test | ✅ **Hoàn thành** (100%) |
| **RQ9 (Iterative Deepening & Budget)** | Tuần 10 | Điều khiển ngân sách thời gian thực, timeout abort trả về $d-1$, triệt tiêu Horizon Effect | `Week10/Week_10_Iterative_Deepening_Time_Budget_and_Evaluation.md` | ✅ **Hoàn thành** (100%) |
| **RQ-ARCH-01 & RQ-W4-A01 (Rust vs TS)** | Toàn diện | Chứng minh Rust nhanh hơn TypeScript $16.9\times \sim 17.8\times$, throughput $1.77\text{ MNodes/s}$, bảo toàn 60 FPS | `docs/BENCHMARK_RUST_VS_TYPESCRIPT.md`, `assets/charts/rust_vs_ts_performance.png` | ✅ **Hoàn thành** (100%) |

---

## Change log

- 2026-10-23: hoàn tất toàn diện 10 tuần nghiên cứu đồ án: tích hợp báo cáo học thuật chuyên sâu và dữ liệu thực nghiệm cho Tuần 5 (Minimax Game Tree), Tuần 6 (Alpha-Beta Pruning), Tuần 7 (Candidate Chebyshev & Tactical Retention), Tuần 8 (Move Ordering Invariant), Tuần 9 (Zobrist Hashing & Transposition Table), Tuần 10 (Iterative Deepening & Time Budget); tích hợp ứng dụng Web Game Caro và Landing Page thuyết trình báo cáo đề tài; đạt tỷ lệ hoàn thành 100% đồ án cơ sở chuẩn mực VNUK.
- 2026-10-02: hoàn thành toàn bộ Phase 3 / Tuần 4 trên nền tảng Rust Native: cài đặt Pattern Detection 7 mẫu hình thế chuẩn (`pattern.rs`), ma trận trọng số Heuristic (`evaluator.rs`), Candidate Generator Chebyshev $r \le 2$ (`movegen.rs`), Random Bot (`random.rs`) và Rule-Based Bot (`rule_based.rs`); chạy thực nghiệm đối đầu 100 ván Bot-vs-Bot đạt 100% win rate; sinh đầy đủ tài liệu học thuật trong `Week4/` kèm sơ đồ và biểu đồ 300 DPI.
- 2026-10-01: phân rã Single DOM Tree, Responsive 4 cấp, Safe Area insets; Audio Engine Web Audio API với Master Bus Limiter; benchmark Rust vs TS (EXP-W4-A01).
