# Tuần 07 — Candidate Generation, Move Ordering và sáu mức độ khó

**Bản cập nhật hiện trạng: 23/10/2026.** Tuần 7 hiện được đối chiếu với kế hoạch/Google Docs đã đọc trực tiếp: bao gồm candidate, ordering và sáu mức khó. Mapping thuật toán/config sang từng mức bắt đầu là **proposal kỹ thuật của lần sửa này và đã được hiện thực/kiểm local**; nó không phải kết quả tournament hay calibrated strength. Native game, release corpus, Wasm mới và real-browser Worker sáu tier đã có evidence. G2/G3/G4/G5 ghi bằng chứng ở [GATES](../research/current_2026_10_23/GATES.md); không kế thừa pass từ báo cáo/reference cũ.

## 1. Lịch tuần và phạm vi nguồn

| Chủ đề | `Week_XX` lịch sử | Kế hoạch/Docs đang áp dụng | Phạm vi bản W7 này |
| --- | --- | --- | --- |
| Candidate Generation | W7 | W7 | Định nghĩa tập, biên, duplicate, terminal |
| Move Ordering | W8 | W7 | Permutation và chi phí ranking; không tự nhận benchmark W8 là game |
| Sáu cấp bot | Narrative nhiều tuần | W7 | Config/mapping, strategy, instrumentation |
| ID, TT, Zobrist | W9/W10 | W8 | Tách follow-up; Master lần này chưa tự có ba kỹ thuật này |

[A] Source game: `gomoku-main/engine/src/board.rs::get_candidates`, `candidates.rs::select_candidates`, `ai.rs`; TS contracts/UI: `10_caro/src/game/ai/contracts.ts`, `game/wasm/contracts.ts`, worker và `App.tsx`. Native `caro-core-reference` có generator khác; corpus cũ phía dưới chỉ xác nhận reference.

## 2. Bước 1 — Từ ma trận tới tập ứng viên

Cho $O(s)$ là tập ô đã có quân; $A(s)=\Omega\setminus O(s)$ là ô trống trên state đang chơi. Khoảng cách Chebyshev:

$$
d_\infty((x,y),(u,v))=\max(|x-u|,|y-v|).
$$

Với bán kính $R$,

$$
C_R(s)=\{m\in A(s):\exists o\in O(s),d_\infty(m,o)\le R\}.
$$

Board trống có policy riêng: candidate center `(7,7)`; board đầy phải rỗng. `Board` không sở hữu phase/winner Game, nên caller search vẫn phải reject terminal trước chọn move. `get_candidates(0)` trên board không trống có thể rỗng; không gọi fallback center bất kể center occupied.

Một quân trung tâm, $R=2$: $(2R+1)^2-1=24$ candidate trong 224 ô trống, reduction $1-24/224=89.2857\%$. Một quân góc, $R=2$: $(R+1)^2-1=8$. Khi có nhiều quân, cộng các diện tích sẽ double-count vùng giao; dùng union/seen.

## 3. Bước 2 — Đếm thao tác và chứng minh membership

Duyệt board tốn $N^2$; với $k$ quân, mỗi neighborhood có tối đa $(2R+1)^2$ vị trí. Cận thời gian:

$$
T_C=O(N^2+k(2R+1)^2),\qquad M_C=O(N^2+|C_R|).
$$

[A] Game clamp $R\le14$ để tránh overflow radius quá lớn; bounds clipping dùng saturating/sub/min. `seen[y][x]` bảo đảm mỗi cell thêm tối đa một lần. Game push theo thứ tự khám phá neighborhood, không mặc định globally row-major như reference cũ. Test ordering muốn deterministic phải ghi rõ source policy.

[C] Với Freestyle, một ô hoàn tất chuỗi thắng ít nhất năm luôn kề một quân sẵn có trên trục, nên nằm trong uncapped $C_R$ nếu $R\ge1$. Áp dụng tương tự cho ô chặn immediate win đối phương. Đây là proof **membership một nước**, không proof mọi chiến thuật dài đều nằm trong tập hay mọi thế hai đầu đều cứu được.

## 4. Bước 3 — Bảo vệ tactic trước cap

Gọi $W_p$ là legal moves thắng ngay cho mover, $W_o$ là legal coordinates thắng ngay của opponent. Một cap chỉ sau ranking có thể loại chúng nếu score thô không đủ. Policy hiện tại ưu tiên/bảo vệ các tập này trước cắt còn K. Gọi $S$ là tập operational: center nếu board trống; $C_R$ nếu nó không rỗng; nếu state đang chơi còn legal moves nhưng neighborhood rỗng (ví dụ R=0), $S=A(s)$ theo fallback. Khi không cấu hình cap thì giữ toàn $S$. Khi có cap:

$$
P=W_p\cup W_o,\quad K_{eff}=\max(1,K),\qquad
C'=P\cup Top_{\max(0,K_{eff}-|P|)}(S\setminus P).
$$

Nếu $|P|>K$, giữ toàn $P$ thay vì mất tactic: lúc đó $|C'|$ có thể vượt K. [A] `candidates.rs::select_candidates` đã giữ cả own-win và opponent-completion trước soft cap; source dùng `cap.max(1).max(tactical)`, vì vậy cap zero cũng chuẩn hóa về ít nhất một move. `move_ordering=false` chỉ đổi sequence sau khi membership đã được chọn giống nhau. G2 kiểm policy; [A] `search.rs::SearchContext::moves` và `ai.rs::baseline` đã dùng module này, được G3 kiểm qua game thật. Short-circuit own win trong strategy phải ghi đúng counter/luồng. Hai opponent win endpoints không bảo đảm một move block tất cả; giữ candidate chỉ tránh bỏ sót coordinate.

Ví dụ `BP26-CAP-TACTICAL`: X tại `(3,7)..(6,7)`, O ở một cụm có index sớm hơn. Hai own-win coordinates `(2,7)` và `(7,7)` đều phải được thấy trước cap. Frozen reference `cap_loss.json` đã chứng minh row-major cap 6 có thể loại cả hai; đó là counterexample của reference. Generator game mới có 5 candidate tests và 12 tactical-retention checks trong release corpus riêng, ghi tại evidence bên dưới; không dùng kết quả reference để gọi game đã sửa.

## 5. Bước 4 — Ordering giữ tập, chỉ đổi thứ tự

Đặt score xấp xỉ cho move $q(m)$ từ perspective root. Tại MAX ưu tiên lớn trước, tại MIN ưu tiên nhỏ trước; nếu quick score dùng perspective mover thì cả hai có thể cùng sort giảm mà vẫn hợp ý định. Phải ghi perspective trước chọn comparator. Một permutation $\pi$ giữ membership thỏa

$$
\max_m v(m)=\max_i v(\pi_i),\qquad
\min_m v(m)=\min_i v(\pi_i).
$$

Nhưng timing và tie move có thể đổi. Nếu mỗi candidate cần probe/evaluate chi phí $T_q$, ranking $b$ move tốn khoảng $bT_q+O(b\log b)$; phải so với subtree tránh được. Depth1 thường thêm work mà không tạo root cutoff ở full window. Candidate cap là đổi tập; ordering là đổi sequence; không nhập hai tác động vào một kết luận.

## 6. Pseudocode

```text
BuildSearchMoves(board, mover, radius, cap)
  if terminal or full: return empty
  spatial = unique empty cells in radius neighborhoods
  if board empty: apply the declared opening policy
  protected = immediate own wins and opponent winning coordinates
  rest = spatial minus protected
  order rest by declared quick-score perspective and deterministic ties
  keep protected first, fill remaining cap with ordered rest
  return protected even if protection exceeds cap
ChooseDifficulty(level)
  Easy: select random legal move using declared random policy
  Normal: own win, then necessary block, then greedy heuristic
  Hard/VeryHard/Expert/Master: AlphaBeta with fixed depth/radius/cap
  return actual strategy, actual counters and completed depth
```

Pseudocode selection/strategy/search đã có source và bounded native/package/browser logs G2–G5. Claim VERIFIED chỉ áp dụng đúng corpus và environment đã ghi, không phải mọi state.

## 7. Trích source đã đọc

[A] Guards hiện hữu trong `gomoku-main/engine/src/board.rs::get_candidates`:

```rust
if self.is_full() {
    return Vec::new();
}
if self.move_count == 0 {
    return vec![(SIZE / 2, SIZE / 2)];
}
let radius = radius.min(SIZE - 1);
```

[A] Dedup/append thật trong cùng hàm:

```rust
if self.cells[ny][nx] == Cell::Empty && !seen[ny][nx] {
    seen[ny][nx] = true;
    candidates.push((nx, ny));
}
```

[A] `candidates.rs::select_candidates` thực hiện soft cap và sequence toggle:

```rust
let tactical = ranked.iter().filter(|mv| mv.wins || mv.blocks_win).count();
if let Some(cap) = policy.max_candidates {
    ranked.truncate(cap.max(1).max(tactical));
}
if !policy.move_ordering {
    ranked.sort_unstable_by_key(|mv| mv.mv.1 * SIZE + mv.mv.0);
}
```

Trước đoạn này source sort `wins`, `blocks_win`, score giảm, rồi index tăng; do đó mọi tactical move nằm trong prefix được giữ. [A] `ai.rs::choose_move` đã dispatch Easy/Normal sang baseline riêng, Hard+ sang search cấu hình; `SearchContext::moves` cộng `generated` và `rank_evaluations` từ selected set. `lib.rs::MoveResult` serialize strategy/difficulty/stats. [G4_real_browser_worker.json](../research/current_2026_10_23/G4_real_browser_worker.json) xác nhận cả sáu IDs gọi binary mới và trả `source=rust`; G5 render sáu levels cùng SearchFeedback; [G5_frontend_tests.log](../research/current_2026_10_23/G5_frontend_tests.log) có 59 tests/9 files pass, gồm 18 real-Wasm cases, typecheck/build cũng pass theo gate ledger. `AIController` vẫn có tactical shortcut cho Hard+ được gắn `source=tactical`, không trộn nó vào Rust counts.

## 8. Sáu mức bot — config đã hiện thực, sức mạnh chưa được calibration

| Tên UI | Rust/Wasm ID | Strategy hiện tại | Horizon cấu hình | Radius/cap search | Trạng thái evidence |
| --- | --- | --- | --- | --- | --- |
| Easy | 0 | Random | 0 | Toàn bộ legal moves, seed→SplitMix64→modulo | Native legality/seed và real Worker pass; nodes2 là root+postselection evaluation |
| Normal | 1 | Rule-based + greedy fallback | 1-ply fallback | Radius2, không cap | Native win/block/fallback và real Worker pass |
| Hard | 2 | Alpha-Beta | 2 | Radius 2, cap 15 có bảo vệ tactic | G3/G4 bounded native/Worker pass |
| Very Hard | 5 | Alpha-Beta | 3 | Radius 2, cap 12 có bảo vệ tactic | G3/G4 pass; ID5 tránh đổi ID3/4 cũ |
| Expert | 3 | Alpha-Beta | 4 | Radius 2, cap 10 có bảo vệ tactic | G3/G4 pass; latency guarantee chưa có |
| Master | 4 | Alpha-Beta | 5 | Radius 2, cap 8 có bảo vệ tactic | G3/G4 pass; không có ID/TT |

Depth cao hơn nhưng cap nhỏ hơn đổi cả horizon và tập move, nên không có theorem `Master luôn mạnh hơn Expert`. Cần tactical corpus/tournament có colors/seeds/paired configurations để claim strength. Horizon là config, `completed_depth` là output thật; Normal rule-based có thể trả own win trước greedy và không mang nghĩa đã hoàn thành một minimax depth1. Không báo thời gian 500ms hoặc đạt depth8 khi chưa thực chạy.

Với cap nghiêm ngặt b=8, depth5 có cận uniform $\sum_{i=0}^5 8^i=37\,449$ node trước pruning; protected moves vượt cap làm cận đó không còn áp dụng. Runtime phải dùng actual counters, không lấy công thức làm metric.

## 9. Vì sao chọn, thay thế và độ khó kỹ thuật

| Phương án | Lợi | Hại/khó | Có nên apply |
| --- | --- | --- | --- |
| Uncapped radius | Giữ mọi immediate completion với R≥1 | Vẫn có thể nhiều move; thiếu chiến lược xa | Baseline hình học/correctness |
| Protected cap + ordering | Kiểm soát branching thường gặp, tránh mất immediate tactics | Cap không tuyệt đối; heuristic không đủ mọi combo | Có cho fixed-depth game khi test G3 |
| Cap row-major trước tactic | Đơn giản | Có counterexample loại own win | Không dùng làm policy an toàn |
| AllLegal baseline | Không restriction hình học | Cây tăng nhanh | Chỉ depth nhỏ và đối chiếu |
| ID/time budget/TT | Có thể quản lý horizon/cache | Cần abort rollback, namespace và mate contract | Scope tiếp theo, không tự gắn vào Master |

Độ khó kỹ thuật: candidates/seen **2/5**, protected-cap/ordering **3/5**, six-tier mapping và real metrics xuyên worker/UI **4/5**. Đây là độ khó xây hệ thống, khác sáu tên mức khó chơi. Pattern evaluator vẫn chưa nhận đầy đủ broken-pattern taxonomy, tier chưa calibrated bằng tournament; physical device và Wink chưa được test. Composition `Difficulty → config → strategy` đủ khi strategy hữu hạn; chỉ thêm trait/object khi có nhiều implementation cần cùng contract thực sự.

## 10. Gate theo requirement và evidence

`BP26-CAND-GEOMETRY` kiểm center/corner/cluster/radius0/huge radius/full board, hợp lệ và unique; `BP26-CAP-TACTICAL` kiểm own win/must-block trước cap; `BP26-ORDER-PARITY` cùng membership/score; `BP26-LEVELS-SIX` kiểm tên/ID/strategy; `BP26-STATS-ENDTOEND` kiểm counter từ Rust tới HUD. G2/G3 thực chạy native, G4 package và G5 browser/controller; G6 đọc lại báo cáo/evidence link.

[A] [G2_candidate_tests.log](../research/current_2026_10_23/G2_candidate_tests.log) ghi 5 tests pass cho soft-cap giữ bốn tactical endpoints dù cap1, broken gap, cùng membership khi tắt ordering, radius/cap zero fallback và tactical recall đối chiếu apply/scan ở bốn trục. Đây là bounded native evidence, không chứng minh mọi thế cờ hoặc sức mạnh sáu tier. [engine_verification.json](../research/current_2026_10_23/engine_verification.json) bổ sung **84 candidate configs, 12 tactical-retention checks, 408 MM/AB pairs, 408 ordering-value pairs, 820 restoration checks**; [engine_search_runs.csv](../research/current_2026_10_23/engine_search_runs.csv) có 816 measured rows, summary 272 configs. [engine_difficulty_runs.csv](../research/current_2026_10_23/engine_difficulty_runs.csv) có 18 tier runs; [G4_real_browser_worker.json](../research/current_2026_10_23/G4_real_browser_worker.json) kiểm sáu tier qua binary thật, mọi move hợp lệ, measured depth0..5. Một Random move ongoing có nodes2 và leaf1 dù depth0 vì evaluate selected position sau lấy ngẫu nhiên, không phải nodes0 giả. [G5_browser_ui.json](../research/current_2026_10_23/G5_browser_ui.json) ghi actual UI synthetic PointerEvent→Rust AI→HUD→Undo pass; [G5_browser_viewports.json](../research/current_2026_10_23/G5_browser_viewports.json) kiểm ba viewports 1280×800/390×844/320×568 không horizontal overflow. Scope là HeadlessChrome155 Linux, không phải physical touch hoặc Wink. Mỗi gate ghi TMB ownership/context và Ponytail over-engineering riêng cùng tests. Không dùng review là proof algorithm correctness. Frozen reference experiments bên dưới vẫn giữ raw/provenance ngày 17/10; log game mới nằm `research/current_2026_10_23`, không gộp thành cùng corpus. [Mô hình/decision chung](../BasicProject_Current_Math_and_Design.md).

---

## Hồ sơ reference — nghiên cứu Candidate Generation ngày 17/10/2026

> Phần tiếng Anh sau đây giữ phạm vi generator/reference cũ: global row-major emission và truncate của reference. Nó không mô tả protected-cap hay strategy mới trong game. Các kết quả 48 geometry cases và timings chỉ thuộc reference native được ghi trong provenance.

# Week 07 Candidate Move Generation

Project: Research Design and Implementation of a Gomoku Game Engine with Artificial Intelligence  
Reporting period: Week 07  
Report date: 17 October 2026  
Status: Implemented in the isolated Rust reference core and evaluated with local experiments  
Evidence scope: Native reference implementation and reproducible research fixtures

## 1 Abstract

Candidate generation reduces the moves presented to a game tree search. This week examines the spatial policy actually implemented in caro-core-reference, rather than assuming that every legal move is searched. The policy includes empty cells within a configurable Chebyshev radius of any occupied cell. Its default radius is two and its default candidate limit is absent. An empty board receives the center move. These choices reduce branching but introduce a different decision problem from unrestricted minimax.

The contribution is a precise definition, correctness arguments for geometric membership, executable geometry and search comparisons, and an explicit boundary between immediate tactical membership and general strategic completeness. A candidate cap is especially significant: the implementation truncates coordinates in row major order before search or move ordering can score them. Therefore a cap can remove an immediate winning move. The report does not claim a universally optimal radius, a complete tactical engine, or integration with the browser application.

## 2 Research Questions and Evidence Convention

RQ 07 1 asks how radius changes candidate cardinality for controlled spatial configurations. RQ 07 2 asks which membership and determinism properties follow from the implementation. RQ 07 3 asks what can be established about immediate winning moves and what a hard cap invalidates. RQ 07 4 asks whether smaller candidate trees change the searched value or measured work on the selected fixtures.

Throughout this report, [A] denotes inspected source or newly recorded local execution, [B] denotes a primary publication or official rule source, [C] denotes a derivation or inference with stated assumptions, and [D] denotes a recommendation. Observing source in the reference crate is evidence about that crate. It does not establish that the same implementation is compiled into a deployed Wasm binary.

## 3 Source Context and Responsibility

| File | Responsibility | Observed evidence and confidence |
| --- | --- | --- |
| caro-core-reference/src/model.rs | Coordinates and board size | [A] BOARD_SIZE is 15 and Move::as_index uses row times 15 plus column. High confidence. |
| caro-core-reference/src/movegen.rs | Candidate membership and sequence | [A] generate_candidates marks empty neighbors, emits increasing indices, then applies truncate. Default radius is 2 and default cap is None. High confidence. |
| caro-core-reference/src/state.rs | Legal moves and state transitions | [A] GameState::legal_moves returns empty cells only while status is Playing; play and undo own temporary transitions. High confidence. |
| caro-core-reference/src/search/mod.rs | Search configuration and policy selection | [A] generate_moves dispatches between AllLegal and Candidates. High confidence. |
| caro-core-reference/src/search/alpha_beta.rs | Search traversal | [A] Candidate generation occurs before optional ordering and recursive expansion. High confidence. |

The flow is state occupancy to geometric marking to ordered coordinate list to optional truncation to search. Candidate generation owns membership. The evaluator owns scores. Alpha beta owns bound based traversal. Keeping these responsibilities distinct makes it possible to identify whether a changed result came from a changed search space or from a search defect.

## 4 Mathematical Definition

Let the board domain be

$$
\Omega=\{0,\ldots,14\}\times\{0,\ldots,14\}.
$$

For a playing state $s$, let $O(s)$ be the occupied cells and $A(s)=\Omega\setminus O(s)$ be all legal empty cells. Coordinates in this report are zero based and written as row then column. Define the Chebyshev distance

$$
d_\infty((r,c),(u,v))=\max(|r-u|,|c-v|).
$$

For nonempty occupancy and integer radius $R\geq0$, the uncapped candidate set is

$$
C_R(s)=\{m\in A(s):\exists o\in O(s),\quad
d_\infty(m,o)\leq R\}.
$$

For an empty board the implementation overrides that expression and returns $\{(7,7)\}$. Let $\operatorname{row}(C)$ mean increasing index order. With cap $K$, the returned sequence is the first $\min(K,|C_R|)$ elements of $\operatorname{row}(C_R)$. The empty board return happens before this cap operation, so even cap zero returns the center on an empty board. This is a source behavior, not a mathematical necessity.

Candidate restriction changes the action set. Writing $V_A(s,d)$ for depth limited minimax over all legal moves and $V_C(s,d)$ for minimax over recursively generated candidates, no general equality follows. For a maximizing node whose descendant values were held fixed, taking a maximum over a subset cannot increase that maximum. In a real alternating tree the restrictions affect both players and descendants, so a simple one direction inequality for the final root values should not be assumed.

## 5 Membership Properties and Proofs

[C] Soundness holds for playing states: every marked coordinate passes the board boundary check and the emptiness check, so every returned candidate is legal. Duplicate neighborhoods cannot duplicate a move because the marking array stores one Boolean per board cell. The final scan visits each index once, so the resulting sequence is deterministic and contains no duplicates.

[C] Uncapped monotonicity follows directly from the distance inequality. If $R_1\leq R_2$, then $C_{R_1}(s)\subseteq C_{R_2}(s)$. This is a set statement. Under caps, increasing radius can insert earlier coordinates into the retained prefix and displace a previously retained move, so retained prefix membership need not be monotone.

[C] Nonemptiness requires assumptions. On a nonempty, nonfull board, with radius at least one and no zero cap, there is an occupied cell adjacent to an empty cell. To see this, take a path through the connected board grid from any occupied cell to any empty cell; the first transition crosses that boundary. The empty endpoint is a candidate. Radius zero on a nonempty board returns no candidates. A zero cap also removes every candidate on a nonempty board. Therefore the unconditional assertion that the generator returns moves whenever legal moves exist is false.

The generator itself does not check terminal status. Calling it directly on a finished board can return empty cells even though legal_moves returns none. Search avoids this mismatch by checking terminal status before generation. Soundness as a game action contract consequently includes the playing state precondition.

## 6 Immediate Tactical Membership

[B] Freestyle Gomoku accepts a continuous line of five or more stones; official Gomocup information distinguishes that rule from exact five and Standard Caro. This report uses freestyle fixtures. [Gomocup rule definitions](https://gomocup.org/detail-information/).

[C] A narrow tactical property can be proved without declaring all tactics complete. Suppose a legal move $m$ completes a continuous line of at least five for player $p$. Within a five cell segment containing $m$, the other cells already contain $p$. At least one cell immediately adjacent to $m$ along the winning direction is therefore occupied. Its Chebyshev distance from $m$ is one. Hence every such completion lies in the uncapped $C_R(s)$ when $R\geq1$.

The same argument applies to an opponent's one move winning completion considered as a blocking coordinate. This proves that the coordinate is represented. It does not prove that choosing that coordinate prevents every loss, that the evaluator recognizes the threat, or that search explores enough depth. Two independent opponent winning completions may make a loss unavoidable. Longer combinations, remote development moves, and variant forbidden move rules need separate reasoning.

The previous claim that a gap in a pattern automatically escapes radius one was incorrect. In XX.XX, the gap is adjacent to stones on both sides. A radius one spatial generator includes it even when a contiguous run evaluator fails to assign the intended threat score. Candidate membership and pattern recognition are separate questions.

## 7 Algorithm and Complexity

The following pseudocode preserves the implemented sequence and its empty board exception.

~~~text
GenerateCandidates state radius cap
  if move count is zero return center
  marked = false for every board cell
  for each occupied cell o
    for each offset in square of radius
      m = o plus offset
      if m is in bounds and empty mark m
  moves = marked coordinates in row major order
  if cap exists truncate moves to cap
  return moves
~~~

[C] Let $N$ be board width and $k$ the occupied count. Scanning occupancy and the marking array costs $O(N^2)$. Neighborhood visits cost $O(k(2R+1)^2)$, giving total time $O(N^2+kR^2)$. The Boolean marking array and output require $O(N^2)$ memory. Radius and board size are bounded in the present program, but retaining parameters clarifies scaling. Truncation reduces recursive branching; it does not avoid the preceding neighborhood marking work.

For a single interior stone with its whole radius square inside the board, the exact count is $(2R+1)^2-1$. Thus radii one, two, and three yield 8, 24, and 48 candidates. With one stone in the corner, the clipped count is $(R+1)^2-1$, yielding 3, 8, and 15. These are geometric derivations, not estimates of typical game phases.

## 8 Worked Examples

Place X at $(7,7)$. There are 224 legal moves. Radius two returns 24 cells, so the reduction is

$$
1-\frac{24}{224}=0.892857\approx89.29\%.
$$

The old value of eight radius two candidates for this position described radius one and did not match the current source. This example also demonstrates why a reported count must identify actual coordinates rather than only a label such as opening.

For the cap counterexample, place X at $(7,3),(7,4),(7,5),(7,6)$, O at $(5,5),(5,6)$, and select X to move. Winning completions include $(7,2)$ and $(7,7)$. Radius one includes both. Its first six coordinates in row major order are around the earlier O stones, however. Applying cap six removes both winning completions. Ordering the six survivors afterward cannot recover them. This is an explicit mechanism for tactical loss under a cap, not an argument that a cap always loses.

## 9 Experimental Method

The new native harness is stored under research/week_05_09. It calls the existing crate through a separate research package and records machine readable evidence. Geometry fixtures vary position while holding occupancy semantics and coordinate conventions fixed. Search comparisons use identical depth, weights, rules, and ordering settings, changing only the move policy. Search fixtures are constructed with the crate's fixture helpers; they are controlled states rather than claims about a recorded human game.

Candidate count is a root property; candidate_moves_generated is a sum over expanded internal nodes. They are not interchangeable. Likewise, node reduction measures the declared search tree and cannot alone establish better play. Search duration is local native execution on the recorded host and includes the evaluation cost of that implementation.

## 10 Experimental Results

[A] The frozen evidence contains 48 geometry configurations, all passing emptiness, uniqueness, and radius checks. The uncapped counts below come from results/candidates.csv; radius zero returns zero for each nonempty fixture. Clustered occupies the four cells of the square from $(7,7)$ to $(8,8)$; separated occupies $(2,2)$ and $(12,12)$.

| Fixture | Legal | Radius 1 | Radius 2 | Radius 3 | Radius 2 reduction |
| --- | --- | --- | --- | --- | --- |
| Empty | 225 | 1 | 1 | 1 | 99.56 percent |
| Center | 224 | 8 | 24 | 48 | 89.29 percent |
| Corner | 224 | 3 | 8 | 15 | 96.43 percent |
| Clustered | 221 | 12 | 32 | 60 | 85.52 percent |
| Separated | 223 | 16 | 48 | 70 | 78.48 percent |
| Win | 219 | 20 | 46 | 80 | 79.00 percent |

[A] At depth two with ordering disabled, all legal and uncapped radius one alpha beta returned the same values on the following controlled fixtures. Durations are medians of three search calls in microseconds.

| Fixture | Full nodes | Radius 1 nodes | Shared score | Full median | Radius 1 median |
| --- | --- | --- | --- | --- | --- |
| Center | 21986 | 36 | −100 | 16954 | 23 |
| Clustered | 10939 | 64 | 0 | 16442 | 41 |
| Win | 11922 | 237 | 9999999 | 9035 | 167 |

[A] results/cap_loss.json independently records that cap six reduces the win fixture from 20 to six candidates, omits both endpoints, and changes depth one score from 9999999 to 99990. This counterexample directly rejects tactical safety of arbitrary row major truncation.

Reproduce with python3 research/week_05_09/run.py. results/provenance.json records Rust 1.98.1, release mode, Linux x86 64, and an Intel Xeon W 11855M host. Timing excludes state cloning and TT or hash initialization; host load was uncontrolled. Full raw trials, minima, maxima, source hashes, and verification counts remain alongside the report. These measurements support fixture specific work reduction, not general value equality or a universal speedup.

## 11 Interpretation and Limitations

[C] Spatial filtering is useful because a compact neighborhood can replace hundreds of empty cells with tens of candidates. That observation supports an engineering tradeoff, not a theorem that excluded cells are irrelevant. The empty board center policy uses symmetry as a practical convention and still changes the action set from 225 choices to one.

No universal best radius follows from a small geometry corpus. Coverage depends on stone placement, board edges, clustering, and the tactical horizon. A radius two union around several separated clusters can be much larger than the union around a compact cluster with the same stone count. Candidate reduction should therefore be reported per fixture and later evaluated on representative positions.

The current evaluator counts maximal contiguous runs. Broken threats require additional pattern logic before any claim of complete tactical evaluation. Neither native counts nor a proof about immediate completions establishes playing strength, Wasm performance, browser responsiveness, or compatibility with a deployed game. Full legal and candidate searches may correctly return different values because they solve different trees.

## 12 Traceability and Next Steps

| Question | Evidence | Bounded conclusion |
| --- | --- | --- |
| RQ 07 1 | movegen.rs and geometry evidence | Radius and clipping determine measured root counts. |
| RQ 07 2 | Marking algorithm and parameter counterexamples | Legal membership and determinism hold under stated preconditions. |
| RQ 07 3 | Adjacency proof and cap fixture | Uncapped immediate completions are included; arbitrary caps do not preserve them. |
| RQ 07 4 | Native policy comparison | Work and values describe only the specified fixtures and depths. |

[D] Keep the default uncapped policy while investigating radius selection. If a budgeted shortlist is later required, first include explicitly detected immediate wins and necessary defense coordinates, then score remaining moves before capping. Such a policy needs its own safety tests and evidence because it would change membership ownership. [D] Add broader game positions before selecting a permanent radius and evaluate tactical accuracy separately from speed. This week delivers a reproducible reference study; product adoption remains a separate integration task.

## 13 References

1. [A] caro-core-reference/src/movegen.rs, generate_candidates and CandidateConfig, inspected 17 October 2026.
2. [A] caro-core-reference/src/state.rs, GameState::legal_moves, play, and undo, inspected 17 October 2026.
3. [A] caro-core-reference/src/search/mod.rs and src/search/alpha_beta.rs, policy dispatch and traversal, inspected 17 October 2026.
4. [A] research/week_05_09, local harness and recorded evidence accompanying this report.
5. [B] Gomocup. [Detail Information and Gomoku Rules](https://gomocup.org/detail-information/), accessed 17 October 2026.
