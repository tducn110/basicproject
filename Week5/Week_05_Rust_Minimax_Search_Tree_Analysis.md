# Tuần 05 — Minimax thuần, terminal utility và đếm cây bằng toán

**Snapshot cập nhật: 23/10/2026.** Bản này bổ sung giải thích từng bước cho game Rust. Thực nghiệm tiếng Anh bên dưới thuộc **native `caro-core-reference` ngày 17/10**, giữ nguyên dữ liệu; không coi 112 parity pairs của reference là test cho game `gomoku-main/engine` của bản cập nhật hiện tại. G2/G3 hiện tại và log tại [GATES](../research/current_2026_10_23/GATES.md).

## 1. Bước 1 — Định nghĩa bài toán trước hàm recursive

State $s$ gồm board và player tới lượt; $p$ là root player; $T(s,m)$ là state sau một nước hợp lệ. $A(s)$ là tập nước được policy chọn. Phải ghi rõ `AllLegal` hoặc candidates/radius/cap; đổi $A$ là đổi bài toán. $d$ tính theo ply, root move tính là một ply; terminal check phải trước horizon check.

$$
V(s,d,p)=\begin{cases}
U(s,p,t)&s\text{ đã terminal},\\
H(s,p)&d=0,\\
\max_{m\in A(s)}V(T(s,m),d-1,p)&toMove(s)=p,\\
\min_{m\in A(s)}V(T(s,m),d-1,p)&toMove(s)\ne p.
\end{cases}
$$

$U$ là thắng/thua/hòa theo rule, $H$ là nonterminal heuristic của W4. Empty move list trên board còn trống phải có policy rõ; không index `candidates[0]` khi list rỗng. Game terminal trả `None`/no move; không trả tọa độ trung tâm giả.

## 2. Bước 2 — Worked example MAX/MIN

Root có ba nước $a,b,c$; sau mỗi nước đối thủ chọn một trong ba phản ứng. Giá trị leaf lần lượt là

$$
A=(4,7,6),\quad B=(3,8,9),\quad C=(2,6,7).
$$

Đối thủ MIN chọn $(4,3,2)$; root MAX lấy $\max(4,3,2)=4$ nên chọn $a$. Greedy nhìn điểm tạm 9 ở nhánh B có thể chọn B nhưng bỏ qua phản ứng 3. Ví dụ minh họa định nghĩa minimax, không phải board fixture hay measured game result.

Nếu các nước đồng score, tie policy phải được công bố: giữ phần tử đầu trong thứ tự xác định là một policy hợp lệ. Hai order khác nhau có thể trả hai nước đồng giá trị; score equality không luôn đồng nghĩa coordinate equality.

## 3. Bước 3 — Đếm số việc của toàn cây

Sau $k$ quân, nếu mọi bước đều có board trống tiếp theo và không terminal sớm, số leaf ở depth $d$ là

$$
L(k,d)=\prod_{j=0}^{d-1}(225-k-j),\qquad
N(k,d)=1+\sum_{i=1}^{d}\prod_{j=0}^{i-1}(225-k-j).
$$

Ví dụ $k=4,d=3$: $L=221\cdot220\cdot219=10\,647\,780$; tổng node $N=1+221+48\,620+10\,647\,780=10\,696\,622$. Đây là cây giả định không cắt terminal, không phải số node đã chạy. Với branching đều $b$, $N=\sum_{i=0}^d b^i=(b^{d+1}-1)/(b-1)$ khi $b>1$.

Ví dụ cap nghiêm ngặt $b\le15$, $d=4$ cho cận $1+15+225+3\,375+50\,625=54\,241$ node, khác $15^4=50\,625$ leaf. Policy bảo vệ tactical có thể giữ quá cap; khi đó phải thay $b$ bằng số giữ thực tế, không dùng cap làm cận sai.

[C] Runtime có dạng $N_{internal}T_{generate}+N_{leaf}T_H+T_{ordering}+T_{state}$; Big-O $O(b^d)$ không dự báo millisecond nếu chưa đo các hạng này.

## 4. Bước 4 — Chứng minh rollback trước mọi return

Với snapshot $s_0$ trước child:

$$
s_1=T(s_0,m),\quad v=V(s_1,d-1,p),\quad undo(s_1,m)=s_0.
$$

Sau khi lấy $v$ phải undo trước xét child tiếp hoặc cutoff/return. Terminal trong recursive child không bỏ trách nhiệm undo của caller. Test cần so board, count, history/turn/status tùy state owner, không chỉ đếm quân. DFS với apply/undo dùng board hiện tại và stack độ sâu $d$; nếu mỗi tầng giữ list tối đa $b$, memory phụ $O(db)$, không phải chỉ $O(d)$ khi tính candidate vectors.

## 5. Pseudocode Minimax thuần

```text
Minimax(state, remainingDepth, root, ply)
  count one recursive node
  if terminal: return terminalUtility(state, root, ply)
  if remainingDepth == 0: return heuristic(state, root)
  moves = generate using fixed search configuration
  if moves empty: return declared no-move evaluation
  best = -infinity if root to move else +infinity
  for move in moves
    undoToken = apply(move)
    child = Minimax(state, remainingDepth - 1, root, ply + 1)
    undo(undoToken)
    best = max(best, child) at MAX, min(best, child) at MIN
  return best
```

Đây là baseline không có `alpha`, `beta` hay cutoff; thứ tự/membership/evaluator/rule/depth giữ giống bản AB khi chạy equivalence.

## 6. Code game hiện tại và boundary với reference

[A] Game hiện tại `gomoku-main/engine/src/search.rs` có hai mode cùng config và một traversal. Khai báo thật:

```rust
pub enum SearchAlgorithm { Minimax, AlphaBeta }
```

`SearchContext::value` chỉ break theo bound khi mode AB; mode Minimax duyệt toàn bộ children đã chọn. Đoạn code sau là source thật, không phải pseudocode:

```rust
for (x, y) in moves {
    board.place(x, y, player).expect("candidate must be a legal empty cell");
    let score = self.value(board, player.opponent(), (x, y), depth - 1, ply + 1, alpha, beta);
    let undone = board.undo(x, y);
    debug_assert!(undone);
    if maximizing { best = best.max(score); alpha = alpha.max(best); }
    else { best = best.min(score); beta = beta.min(best); }
    if self.config.algorithm == SearchAlgorithm::AlphaBeta && alpha >= beta {
        self.stats.cutoffs += 1;
        break;
    }
}
```

[A] `search_in_place` mượn mutable board và trả result; `search` clone **một lần ở root** rồi apply/undo child. `terminal_utility` được gọi trước depth0, full/terminal trả no move; `Game::compute_ai_move` commit selected move sau khi selection hoàn tất. Điều đó đã wired qua `ai::choose_move` và Wasm export. Reference `search/minimax.rs` ở hồ sơ cũ vẫn có API riêng `GameState`/`UndoToken`; không đổi source attribution của nó thành game.

[A] [G3_native_tests.log](../research/current_2026_10_23/G3_native_tests.log) ghi **38 unit + 7 native integration** pass. Release example `gomoku-main/engine/examples/current_evidence.rs` chạy thẳng game engine và tạo [engine_search_runs.csv](../research/current_2026_10_23/engine_search_runs.csv), 816 measurement rows; [engine_search_summary.csv](../research/current_2026_10_23/engine_search_summary.csv), 272 configurations. [engine_verification.json](../research/current_2026_10_23/engine_verification.json) ghi 408 MM/AB pairs, 408 ordering-value pairs, 820 root restoration checks và 544 repeat-result/counter comparisons. Counts gồm các lần lặp trong corpus, không phải 408 vị trí độc lập hay 820 ván đấu.

Corpus gồm bốn controlled fixtures và 16 seeded positions, ba repeats/cấu hình; timer đặt sau root clone trong release harness, gồm generation/ranking/search/evaluation và rollback. Thứ tự đo không randomize, không CPU pinning, nên median chỉ mô tả host/lần chạy. G4 real-browser Worker đã gọi binary mới, nhưng native duration không chuyển thành Wasm/browser speedup.

## 7. Vì sao giữ baseline, phương án và độ khó

Giữ Minimax thuần để làm oracle ở depth nhỏ: dễ trace mọi child và phát hiện AB sai cận. Nó chậm ở cây lớn nên không dùng mặc định cho Master; vẫn hữu ích trong test/corpus. Negamax rút gọn MAX/MIN khi evaluation/terminal sign đối xứng theo contract, nhưng đổi perspective sẽ gây rủi ro lớn nếu chưa thống nhất heuristic và mate. Không vừa đổi sang Negamax vừa so tốc độ AB rồi không biết khác biệt đến từ đâu.

Clone mỗi child đơn giản và dễ rollback bằng drop; apply/undo tiết kiệm copy tiềm năng nhưng khó chứng minh error path. Chọn theo owner/state size và profile; không khẳng định raw pointer nhanh hơn borrow hoặc clone trước đo. Mức khó kỹ thuật **3/5** cho baseline, **4/5** cho đối chiếu cùng cây xuyên Wasm. Đây là độ khó implementation, không phải tier Hard.

## 8. Gate và evidence

`BP26-MM-RESTORE` yêu cầu input sau search bằng trước; `BP26-MM-TERMINAL` yêu cầu no-move cho terminal và utility đúng dấu; `BP26-MM-AB-PARITY` yêu cầu cùng fixture/rule/depth/move set/order/evaluator. Native counters ít nhất tách node, leaf, ordering evaluation và completed depth. Source `gomoku-main/engine/src/ai.rs`, `search.rs` và example đã được ghi trong [provenance.json](../research/current_2026_10_23/provenance.json) cùng command; `research/week_05_09/results` không overwrite để làm như dữ liệu mới. G3 + TMB ownership + Ponytail over-engineering ghi ở [GATES](../research/current_2026_10_23/GATES.md); [wasm_package.json](../research/current_2026_10_23/wasm_package.json) và [G4_real_browser_worker.json](../research/current_2026_10_23/G4_real_browser_worker.json) xác nhận package đã build/copy và gọi qua real Worker trên corpus đã khai báo. [Mô hình/decision chung](../BasicProject_Current_Math_and_Design.md).

---

## Hồ sơ nghiên cứu reference — kết quả đóng băng ngày 17/10/2026

> Phần tiếng Anh và raw corpus dưới đây giữ nguyên scope native reference, không tự áp cho game/package mới. Mọi số timing chỉ thuộc môi trường ghi trong provenance của lần chạy đó.

# Week 05 Rust Minimax Search Tree Analysis

Project Research Design and Implementation of a Gomoku Game Engine with Artificial Intelligence  
Academic module Basic Project  
Report language English  
Evidence review date 17 October 2026

## 1 Research purpose and evidence boundary

This week studies how deterministic Minimax search turns a board evaluation into a decision against an opponent who chooses the least favourable continuation. The central research problem is to distinguish an error in recursive search from a change in the game tree supplied to it. Searching every legal move and searching only nearby candidates are different experiments, even when both use the same Minimax function.

The work reconstructs the argument from inspected Rust source and reproducible local evidence. It replaces earlier timing tables and named horizon fixtures that lacked traceable execution records. Earlier figures such as a claimed 18 candidates or a universal depth three timeout are not retained as measured results.

Evidence labels distinguish **[A]** inspected source or recorded execution, **[B]** primary literature, **[C]** deduction or mathematical example, and **[D]** proposed work. The reference crate is inspectable; its search modules are not thereby integrated into the browser game. The game checkout has HEAD `c1e7447532e4c5ff5590f2c5562dd21cd0acf7b9`; unrelated App, language, and Wink changes remain outside this report.

## 2 Research questions and conceptual background

Three questions guide the investigation.

1. Does reference Minimax compute the specified finite depth value while preserving its input state?
2. How does replacing all legal moves with a declared candidate policy alter the tree and computational cost?
3. What can a terminal result establish that a heuristic result at the search horizon cannot establish?

[B] Shannon distinguishes exhaustive continuation to the end of a game from practical lookahead that evaluates intermediate positions. His mathematical discussion maximizes a move after minimizing the opponent response, and warns that static evaluation can mislead during an unfinished combination. These ideas motivate separate treatment of terminal utility, depth limits, and tactical instability here. They provide no performance measurements for this project. [Shannon 1950 Programming a Computer for Playing Chess](https://www.pi.infn.it/~carosi/chess/shannon.txt).

## 3 Source model and responsibility

[A] The implementation is `caro-core-reference/src/search/minimax.rs`, specifically `search_minimax`, `value`, and `terminal_score`. Configuration comes from `SearchConfig` and `MoveMode` in `src/search/mod.rs`. These are the actual identifiers; the earlier report described a `SearchSpaceMode` and `MinimaxConfig` API that is not the current contract.

| File and symbol | Responsibility and observed behaviour |
| --- | --- |
| `src/state.rs` `GameState::play` | Rejects finished occupied or invalid moves and derives win or draw |
| `src/state.rs` `GameState::undo` | Restores cell side status last move and count from an undo token |
| `src/search/mod.rs` `generate_moves` | Selects all legal or candidates without changing the recurrence |
| `src/movegen.rs` `generate_candidates` | Emits empty nearby cells in row major order then optionally truncates |
| `src/evaluator.rs` `evaluate` | Combines contiguous pattern scores from a fixed perspective |
| `src/metrics.rs` `SearchStats` | Counts traversal leaf evaluation generation and ordering separately |

Paths in this table are relative to `caro-core-reference`. The state owner is `GameState`; search owns temporary traversal, and the evaluator reads state. The lifecycle is generate moves, play, inspect terminal or recurse, undo, and compare. A terminal move can leave the stored side unchanged, so terminal detection must precede assumptions about the next player.

## 4 Mathematical definition of the searched value

[C] Let $s=(B,t,R,z)$ contain board, side to move, rule profile, and terminal status. Let $p$ be the fixed root player, $h$ remaining depth, and $\ell$ moves from the root. Let $T(s,a)$ be a legal successor and $G(s)$ the configured move set. Every recursive value remains in the perspective of $p$.

[A] The implemented terminal score uses $M=10\,000\,000$:

$$
U_p(s,\ell)=
\begin{cases}
M-\ell,&z=\operatorname{Won}(p),\\
-M+\ell,&z=\operatorname{Won}(\operatorname{opponent}(p)),\\
0,&z=\operatorname{Draw}.
\end{cases}
$$

[C] Let $H_p(s)$ be configured static evaluation. Write $E(s,h)$ for the condition that the state is nonterminal, $h>0$, and $G(s)$ is nonempty. The recurrence is:

$$
V_{p,h}(s,\ell)=
\begin{cases}
U_p(s,\ell),&s\text{ terminal},\\
H_p(s),&s\text{ nonterminal},\ h=0,\\
H_p(s),&s\text{ nonterminal},\ h>0,\ G(s)=\varnothing,\\
\max_{a\in G(s)}V_{p,h-1}(T(s,a),\ell+1),&E(s,h),\ t=p,\\
\min_{a\in G(s)}V_{p,h-1}(T(s,a),\ell+1),&E(s,h),\ t\ne p.
\end{cases}
$$

The empty generated set fallback matters: radius zero or a zero candidate cap can leave no candidates on a nonempty playable board. That condition is not itself a draw. In all legal mode, a properly maintained full board is terminal before generation.

[A] The root retains the first move in its deterministic list when scores tie, because it replaces an existing best move only for strict score improvement. Optional ordering changes that list, so deterministic does not mean independent of configuration.

## 5 Correctness argument and state restoration

[C] The recurrence terminates because depth decreases on every edge and terminal states stop earlier. Correctness relative to the supplied tree follows by induction. At depth zero or a terminal node, the implementation returns the specified leaf value. Assume every child returns the specified value at depth $h-1$. The maximizing parent compares all generated legal children and takes their maximum; the minimizing parent takes their minimum. Its result therefore equals the recurrence at depth $h$.

This proves finite tree evaluation, not a forced win in unrestricted Gomoku. It assumes generated moves are legal, transitions follow the chosen rules, and undo restores the parent before visiting another sibling. Omitting a move can invalidate a claim about the full game without invalidating this induction about the restricted tree.

[A] `UndoToken` stores the previous player, status, last move, count, and played coordinate. Clearing only the cell would be insufficient: a sibling could inherit a terminal status or wrong player. `tests/search_equivalence.rs::search_does_not_mutate_root_state` checks board, side, status, count, and last move after Alpha Beta. Execution evidence must identify the actual algorithms checked; a test for one is not automatically proof for every search path.

The pseudocode summarizes current Minimax. The parent side determines whether combine means maximum or minimum.

```text
VALUE state h root ply
  count this node
  if terminal return terminal utility
  if h equals zero return heuristic
  moves = generate configured moves
  if moves empty return heuristic
  optionally order moves
  best = minus infinity for MAX otherwise plus infinity
  for move in moves
    token = play move; child = VALUE state h minus one root ply plus one
    undo token; best = combine best child
  return best
```

## 6 Worked decision and horizon example

[C] Consider a two ply tree with heuristic leaves from the root perspective. Move A lets the opponent choose 8 or 2; move B allows 5 or 4:

$$
V(A)=\min(8,2)=2,\qquad V(B)=\min(5,4)=4,\qquad
V(s)=\max(2,4)=4.
$$

The root chooses B. Selecting the largest leaf, 8, would ignore the opponent choice. The example establishes the order of quantifiers: the root chooses, and the opponent responds after observing that choice.

A separate constructed horizon example has immediate evaluations $H(A)=80$ and $H(B)=30$. Extending one ply gives A response values $-100$ and $60$, and B values $20$ and $25$. Depth one chooses A; depth two compares $-100$ with $20$ and chooses B. These are synthetic values, not engine outputs or measured Gomoku fixtures. They show why depth can change a decision without establishing a particular failure in the application.

[A] A terminal win reached at the horizon is still scored as terminal because `terminal_score` precedes depth zero evaluation. Conversely, a favourable nonterminal heuristic is not a certificate that every later opponent response loses.

## 7 All legal and candidate search spaces

[C] On a nonterminal board with $n$ occupied cells and no forbidden moves,

$$
A(s)=\{a:B(a)=0\},\qquad |A(s)|=225-n.
$$

For nonempty boards, the uncapped radius policy is

$$
C_r(s)=\{a\in A(s):\exists x\text{ occupied},\ \|a-x\|_\infty\le r\}.
$$

[A] The empty board is special: the generator returns only centre `(7,7)`. Otherwise it emits marked cells in row major order and applies `max_candidates` before search ordering. The default is radius two without a cap. A single central stone has eight radius one neighbours and twenty four radius two neighbours. These follow from the neighbourhood geometry; they are not an average branching factor.

[C] Candidate mode restricts both players. Removing a root option can hurt the root; removing an opponent refutation can help it. Candidate value is therefore neither a general upper nor lower bound on all legal value. Radius is a hypothesis about relevance. A row major cap can remove an immediate tactical move even when it lies within the radius.

For a uniform illustrative branching factor $b$, unpruned search contains $1+b+\cdots+b^h$ nodes. With four stones and no early terminal branch, all legal depth two contains $1+221+221\cdot220=48\,842$ nodes. This conditional count is not a runtime measurement; terminal branches can reduce it. Real branching varies by position and ply.

## 8 Experiment method and reproducibility

[D] Comparisons must record rule profile, fixture stones and side, depth, mode, radius, cap, weights, ordering, executable build mode, and toolchain. To isolate move policy, keep algorithm and evaluator fixed. To isolate Alpha Beta next week, keep move policy fixed instead. These controls answer different questions.

The shared package is `research/week_05_09`. Run `python3 research/week_05_09/run.py` from the workspace root. It runs locked native tests and the release harness; exact commands, source hashes, clock scope, and toolchain are retained in [provenance](../research/week_05_09/results/provenance.json). The run used Rust 1.98.1 on Linux x86 64 and an Intel Xeon W 11855M. Search timing excludes state cloning and table or key initialization. Controlled fixtures have three repetitions; sixteen seeded reachable positions have one. Fixture construction is in `research/week_05_09/src/main.rs::fixture`. Nodes include the root. `candidate_moves_generated` sums move list lengths at expanded nodes; it is not a unique board count. `ordering_evaluations` is separate work and must remain visible when discussing cost.

Recorded timing describes the local native harness configuration. It does not establish browser responsiveness, Worker cancellation, device latency, or a universal depth threshold. Timing speedup requires comparable elapsed measurements; a node ratio measures traversal reduction.

## 9 Recorded local results

[A] The [summary CSV](../research/week_05_09/results/search_summary.csv) records the following Minimax results for the clustered fixture: X at `(7,7)` and `(8,7)`, O at `(7,8)` and `(8,8)`, with X to move. Coordinates are zero based. Ordering is disabled and the rule is Freestyle.

| Move mode | Depth | Nodes | Leaves | Score | Move |
| --- | --- | --- | --- | --- | --- |
| All legal | 2 | 48842 | 48620 | 0 | 6 7 |
| Radius 1 no cap | 2 | 189 | 176 | 0 | 6 7 |
| Radius 1 cap 12 | 2 | 157 | 144 | 0 | 6 7 |
| Radius 1 cap 12 | 3 | 1885 | 1728 | 4910 | 6 8 |

The depth two all legal count matches the conditional calculation in Section 7. Candidate mode gives the same score and move for this fixture at depth two, but that agreement is local. The depth three row illustrates a changed horizon and must not be used as a controlled speed comparison with depth two.

[A] A separate [cap loss record](../research/week_05_09/results/cap_loss.json) demonstrates omission: on the win fixture, radius one without a cap yields score 9999999 at depth one. Cap six removes both winning endpoints `(7,2)` and `(7,7)` and yields 99990. Thus fewer nodes do not imply preserved tactical decisions. This is a move policy limitation, not a Minimax recurrence defect.

[A] The [verification record](../research/week_05_09/results/verification.json) reports 112 same configuration Minimax and Alpha Beta score and move comparisons and 551 root restoration checks across the harness, including budget abort probes. Comparison counts include repeated controlled runs. Nine existing native crate tests passed in [the test log](../research/week_05_09/results/reference_tests.log). No named historical horizon fixture is claimed to have been executed.

## 10 Interpretation and limitations

[A] Inspection establishes finite depth Minimax traversal, explicit move mode selection, terminal priority, tie retention, and paired play and undo. Existing integration tests include `alpha_beta_matches_minimax_value_and_move`, `search_does_not_mutate_root_state`, and `immediate_win_is_selected`. Their tactical fixture is manually constructed; it does not represent a tournament or complete legal game history.

[C] One scoring proof obligation remains. `evaluate` clamps nonterminal scores at $M-1$, while search scores a win at ply $\ell$ as $M-\ell$. For $\ell>1$, a hypothetical heuristic near that clamp can outrank a later win. The clamp comment therefore does not establish absolute terminal dominance after distance adjustment. This is source derived, not a reproduced application failure. A safe nonterminal limit would be below $M-L$ for maximum permitted root ply $L$.

[C] Pattern evaluation counts maximal contiguous runs and open ends. It does not fully model broken threats such as `XX.XX`. Greater depth can expose some missing tactical consequences, but finite depth and a small corpus cannot establish complete threat handling. Empty candidate fallback, candidate caps, and fixture legality require separate checks.

## 11 Conclusions and next research step

Minimax evaluates the declared finite tree when transitions, leaf scoring, and restoration satisfy their contracts. All legal mode supplies a small depth reference for separating traversal correctness from move omission. Candidate mode supplies a smaller tree whose tactical coverage needs independent measurement.

[D] The next step compares Alpha Beta on this same tree with identical leaf rules, ordering, and tie policy, then investigates candidate recall and deeper tactical fixtures. Browser integration requires an explicit adapter and runtime verification. This report does not establish deployment, training, playing strength, or device behaviour.
