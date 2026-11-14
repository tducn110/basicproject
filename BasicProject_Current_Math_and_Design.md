# Basic Project — toán học, Rust, UI và quyết định thiết kế

Cập nhật **23/10/2026**. Phạm vi: bản local trong basicProject, gồm engine gomoku-main/engine, app 10_caro và Markdown tuần 1–7. Kết quả thực chạy nằm ở [gate ledger](research/current_2026_10_23/GATES.md). Đây là bản sửa hiện tại, không phải lịch sử giả cho các tuần trước.

## 1. Authority và yêu cầu

Yêu cầu: sửa invariant/terminal/search trong review, thống nhất UI/difficulty/telemetry, dùng Rust theo ownership, trình bày toán → pseudocode → code → evidence → lợi/hại/alternative/điều kiện áp dụng, và review TMB/Ponytail tại từng gate.

**[A]** Source + logs/raw results là evidence implementation; source SHA256 xác định bản local chưa commit. **[B]** Tài liệu chính thức giải thích ngôn ngữ/thuật toán. **[C]** Chứng minh và cận toán có giả thiết. **[D]** Cấu hình difficulty/độ khó kỹ thuật là lựa chọn thiết kế, chưa chứng minh thứ hạng strength.

[Corrected plan](https://docs.google.com/document/d/1exG7loK98vhgjK1cqiCxXUR8y2-plKyYlhLrMddz3Ec/edit) và [kế hoạch W7](https://docs.google.com/document/d/14xUYdR9NK2c8vqElLT_iT_Bzv_DL_eXlJjYhdOv_a4Q/edit) đã được đọc qua connector; readback và revision nằm trong [sources](research/current_2026_10_23/sources/drive_0.json). Plan không tự chứng minh implementation.

| Nội dung | Corrected plan / Obsidian | Bộ Week_XX local |
| --- | --- | --- |
| Luật, core, UI, heuristic | W1–W4 | W1–W4 |
| Minimax, Alpha-Beta | W5–W6 | W5–W6 |
| Candidates, ordering, six tiers | W7 | W7 + nghiên cứu ordering W8 |
| Iterative Deepening / TT / Zobrist | W8 | W9–W10 |

Giữ tên file cũ và ánh xạ nội dung, không đổi ID tuần âm thầm. Reference study caro-core-reference khác engine thật và binary WASM. Gate VERIFIED chỉ trong môi trường đã thử; chưa có nhãn ACCEPTED.

## 2. Ma trận 15×15 và số nước đi

### 2.1. Domain

Đặt $N=15$, độ dài thắng $K=5$:

$$
\Omega=\{(x,y)\in\mathbb Z^2:0\le x,y<15\},\quad
B\in\{0,1,2\}^{15\times15}.
$$

$B[y][x]=0$ là trống, 1 là Black/X, 2 là White/O. $x$ là cột, $y$ là hàng. TypeScript nhận row=y, col=x; WASM trả x,y.

$$
|\Omega|=15^2=225,\quad
m=\sum_{y=0}^{14}\sum_{x=0}^{14}[B[y][x]\ne0].
$$

Ở ván chưa terminal, số action legal là $225-m$. Ván đã thắng/hòa có 0 game action dù có thể còn ô trống. Board::legal_moves chỉ liệt kê empties hình học; Game/search phải chặn terminal.

Một ván tối đa 225 **ply** (mỗi ply đặt một quân). Một lượt human+AI có thể gồm hai ply. Không gọi 225 là số node search hay số phép đọc scanner.

### 2.2. Index, địa chỉ và kích thước

$$
i(x,y)=15y+x,\quad x=i\bmod15,\quad y=\lfloor i/15\rfloor.
$$

Tâm $(7,7)$ có index112; góc $(14,14)$ có index224. Đặt $a_0$ là địa chỉ phần tử cells[0][0], $s=\operatorname{size\_of}(\mathrm{Cell})$:

$$
\operatorname{addr}(B[y][x])=a_0+(15y+x)s.
$$

Array Rust liên tục với stride bằng kích thước phần tử theo [Rust Reference](https://doc.rust-lang.org/reference/type-layout.html#array-layout). Repr(u8) làm Cell một byte; **payload** 225 Cell là 225 byte. Toàn Board còn count/padding; default struct không cam kết cells bắt đầu tại offset0. Đo size trên đúng target, không lấy sizeof native suy sang WASM.

Code safe hiện tại:

~~~rust
pub fn get_checked(&self, x: usize, y: usize) -> Option<Cell> {
    self.cells.get(y).and_then(|row| row.get(x)).copied()
}
~~~

Không cần dereference raw pointer để áp dụng công thức. Theo [Rust Book về borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html), reference mượn dữ liệu; &mut bảo đảm quyền mutate độc quyền trong thời gian borrow.

**Lựa chọn:** array2D giữ đúng mô hình, không allocation mỗi ô. Array1D tương đương layout payload nhưng cần index conversion; bitboard225 bit/màu cần nhiều machine word và mask biên, khó review hơn. Raw pointer tăng nghĩa vụ bounds/alignment/alias/lifetime, chưa có benchmark chứng minh cần apply.

### 2.3. Số lựa chọn khác số node

Từ bàn có $e=225-m$ ô trống, cây full-legal chưa terminal ở depth $d\le e$ có số lá:

$$
P(e,d)=\frac{e!}{(e-d)!},\qquad
T(e,d)=1+\sum_{j=1}^{d}P(e,j).
$$

Từ bàn trống, depth1:225 lá; depth2:$225\cdot224=50\,400$ lá, 50,626 node cả root; depth3:$11\,239\,200$ lá, 11,289,826 node. Đây là lý thuyết, không phải số node candidate search đã chạy.

Nếu giả định branching factor cố định $b>1$, $T=(b^{d+1}-1)/(b-1)$. Soft cap có thể vượt $b$ vì giữ nhiều tactical moves; không lấy $b^d$ làm trần cứng implementation.

Nếu liệt kê mọi ô trống trước mỗi ply của một ván giả định đủ225:

$$
\sum_{m=0}^{224}(225-m)=225\cdot226/2=25\,425.
$$

Đó là tổng số lựa chọn được liệt kê, ván chỉ chọn225 quân. Không phải scanner đọc25,425 ô.

## 3. Apply/undo và quét thắng

### 3.1. Invariant

$$
\mathrm{Valid}(B,x,y,p)\iff (x,y)\in\Omega\land B[y][x]=0\land p\in\{1,2\}.
$$

Game còn yêu cầu chưa terminal và đúng side. Place thành công đổi đúng một ô, count+1; reject giữ nguyên toàn state.

$$
\operatorname{undo}(\operatorname{place}(s,m),m)=s.
$$

~~~text
PLACE: kiểm bounds → reject Empty → reject occupied → ghi quân → count+1.
UNDO: kiểm bounds/occupied → xóa quân → count-1; invalid trả false không mutate.
~~~

Board sở hữu occupancy/count. Game/controller sở hữu chronological history. Search ghép apply/undo tại mọi nhánh. Code: gomoku-main/engine/src/board.rs, symbol place, undo, apply_undo_restores_every_board_field. Equality test kiểm cả Board, không chỉ count.

### 3.2. Freestyle scanner

Giữ luật hiện tại: chuỗi ít nhất5 thắng, chấp nhận overline và chặn hai đầu; không tự chuyển sang exact-five.

$$
D=\{(1,0),(0,1),(1,1),(1,-1)\},\quad
\ell_d=1+\min(f_d,4)+\min(b_d,4),\quad
\mathrm{win}\iff\exists d:\ell_d\ge5.
$$

$f_d,b_d$ là run liên tiếp hai phía origin. Cắt mỗi phía tối đa4 vẫn đủ nhận diện chuỗi dài ít nhất5 xuyên qua nước vừa đặt; không đủ phân biệt exactly-five với overline.

~~~text
WINNER_AT(B,m)
  p←B[m]; trống/ngoài biên: return None
  với mỗi trục d
    count←1
    với dấu +1 và -1
      với j=1..4
        q←m+dấu*j*d
        nếu q ngoài biên hoặc B[q] khác p: break
        count←count+1
    nếu count≥5: return p
  return None
~~~

Cận bảo thủ là $4\cdot2\cdot4=32$ lần đọc **neighbor**, cộng origin. Early break/biên/return làm thực tế thấp hơn; không nói luôn chạy32.

Full fallback tối đa225 origin và $225\cdot32=7\,200$ neighbor reads/lần. Nếu gọi sau225 ply, cận là50,625 origin visits và1,620,000 neighbor reads; last-move scan chỉ có cận7,200 neighbor reads cả ván. Đây là cận operation count, không phải benchmark.

Alternative quét mọi cửa sổ đúng5:

$$
W=2N(N-K+1)+2(N-K+1)^2=572,\quad 5W=2\,860
$$

lần đọc nếu đọc ngây thơ mọi ô mọi cửa sổ. Thuật toán này khác check_winner_at, không gán count của nó cho source hiện tại.

**Ích:** local scan đủ đúng sau legal move trên ván trước đó chưa thắng. **Hạn chế:** import board tùy ý cần full validation; undo không suy winner chỉ từ ô đã xóa. **Apply:** play/search; độ khó kỹ thuật2/5, tests bốn trục/biên/draw/overline/restoration.

## 4. Heuristic và terminal utility

Evaluator đếm mỗi maximal contiguous run một lần theo mỗi trục:

$$
E_{\rm raw}(B,p)=\sum_{\ell\in R_p}w(|\ell|,o_\ell)-\sum_{\ell\in R_{\bar p}}w(|\ell|,o_\ell)+C(B,p).
$$

$o_\ell$ là số đầu mở. Center bias mỗi quân là $\max(0,14-|x-7|-|y-7|)$, cộng cho mình/trừ đối thủ.

| Pattern | Weight |
| --- | ---: |
| Five+ | 1,000,000 |
| Open4 | 50,000 |
| Half4 / Open3 | 5,000 |
| Half3 | 500 |
| Open2 | 200 |
| Half2 | 50 |

~~~text
EVALUATE
  với mỗi quân và mỗi trục
    nếu ô trước cùng màu: skip (không phải đầu run)
    đếm length/openEnds, cộng hoặc trừ weight theo player
  cộng/trừ center bias
  clamp về miền heuristic
~~~

Source: eval.rs, evaluate/count_line/pattern_score. Chưa phân loại riêng XX_XX/X_XXX. Candidate tactical detector nhận diện gap hoàn thành thắng bằng directional count; việc này không biến evaluator thành pattern matcher đầy đủ.

Terminal kiểm trước horizon. Với $M=100\,000\,000$, $H=M-225-1=99\,999\,774$, ply từ root $q\le225$:

$$
U(s,p,q)=
\begin{cases}
M-q&p\text{ thắng},\\
-M+q&\bar p\text{ thắng},\\
0&\text{hòa},\\
\operatorname{clamp}(E_{\rm raw},-H,H)&\text{horizon chưa terminal}.
\end{cases}
$$

Do $H<M-225$, thắng luôn hơn nonterminal, thua luôn thấp hơn. Trừ ply ưu tiên thắng sớm; cộng ply kéo dài khi buộc thua. Không thêm noise làm đảo terminal.

**Ích:** score giải thích được. **Hại:** weight chưa calibrated; gap/fork phức tạp chưa đủ taxonomy. **Alternative:** sliding windows nhận dạng pattern gián đoạn tốt hơn nhưng cần chống đếm lặp. **Apply:** horizon estimate, không làm luật thắng. Độ khó3/5.

## 5. Minimax

$$
V(s,d,p)=
\begin{cases}
U(s,p,q)&s\text{ terminal},\\
E(s,p)&d=0,\\
\max_{a\in A(s)}V(T(s,a),d-1,p)&\mathrm{side}(s)=p,\\
\min_{a\in A(s)}V(T(s,a),d-1,p)&\mathrm{side}(s)\ne p.
\end{cases}
$$

$A(s)$ là full legal hay candidate restricted phải cố định trong experiment. Hai tập khác nhau là hai cây khác nhau.

~~~text
MINIMAX(board,side,depth,lastMove,ply)
  nodesVisited++
  terminal/horizon: leaves++; return utility/evaluation
  moves←SELECT_CANDIDATES
  best←-∞ nếu MAX, +∞ nếu MIN
  với mỗi move
    place
    score←MINIMAX(child,opponent,depth-1,move,ply+1)
    undo
    best←max(best,score) hoặc min(best,score)
  return best
~~~

Cây teaching: rootMAX có hai conMIN với lá A=[3,5], B=[2,9]. MIN trả3 và2; root chọn A,value3. Đây là ví dụ toán, không giả fixture Gomoku đã chạy.

Root clone Board một lần, trong recursion dùng &mut Board và apply/undo. Bản cũ clone theo từng root candidate; với c candidates giảm root clone từ c xuống1. Đây là thay đổi công việc copy, chưa suy speedup.

DFS không lưu toàn bộ cây. Memory bookkeeping theo stack/candidate vectors khoảng $O(db)$ nếu b là độ rộng vector thực giữ ở mỗi tầng, không phải nominal soft cap. Cận bảo thủ theo board là $O(dN^2)$ cho các candidate vectors đang sống và ranking scratch, cộng Board. Time worst-case exponential $O(b^d)$ dưới giả định branching b.

**Apply:** plain Minimax làm baseline nhỏ. **Hại:** fulllegal sâu quá tốn node. MCTS/threat-space search đổi mô hình và cần protocol riêng; không thêm vào chỉ để có thêm tên thuật toán. Độ khó3/5.

## 6. Alpha-Beta và thí nghiệm cùng cây

$\alpha$ là lower bound MAX đã bảo đảm, $\beta$ là upper bound MIN đã bảo đảm. Cắt khi $\alpha\ge\beta$.

~~~text
ALPHABETA(...,alpha,beta)
  terminal/horizon như Minimax
  với mỗi move trong cùng membership
    place → recurse → undo
    MAX: best←max; alpha←max(alpha,best)
    MIN: best←min; beta←min(beta,best)
    nếu alpha≥beta: cutoffs++; break
  return best
~~~

Teaching tree: đọc A trước có alpha3; ở B đọc lá2 có beta2≤3 nên bỏ lá9, root vẫn3. Alpha-Beta bỏ sibling không cần; candidate filtering thay action set trước search. Không trộn hai nguyên nhân.

So Minimax/AB phải cùng board/player/depth/evaluator/terminal/membership mọi node. Ordering A/B phải giữ membership; value bằng nhau, best coordinate có thể khác nếu tie. Muốn so tọa độ cần canonical tie-break.

Worst-case vẫn $O(b^d)$; cận lý tưởng gần $b^{d/2}$ không phải dự đoán node thực. Sinh candidates/tactical/ranking/evaluation đều có chi phí; ít node chưa chắc ít thời gian.

**Apply:** search mặc định sau equivalence gate. **Hại:** sai bound/undo/tie dễ trả sai; corpus nhỏ không chứng minh mọi board. Độ khó4/5.

## 7. Candidate, tactical recall và ordering

Trong phần này $L(B)=\{m\in\Omega:B[m]=0\}$ là tập ô trống hình học và $O(B)=\Omega\setminus L(B)$ là tập tọa độ có quân. Chỉ gọi search action khi state chưa terminal.

$$
d_\infty(a,b)=\max(|a_x-b_x|,|a_y-b_y|),\quad
C_r(B)=\{m\in L(B):\exists o\in O(B),d_\infty(m,o)\le r\}.
$$

Một quân tâm: r1 có8, r2 có24 candidates; góc r2 có8. Nhiều quân lấy union, không cộng neighborhood trùng.

$$
\rho_{\rm center,r2}=1-24/224\approx89.29\%.
$$

~~~text
SPATIAL
  full→[]; empty→[center] là policy đặc biệt
  clamp r≤14; seen←false
  scan mỗi ô có quân; scan square r clip theo biên
  empty và chưa seen→mark và thêm
~~~

Time $O(N^2+mr^2)$, memory $O(N^2)$. Board candidates ở bản này theo first-discovery neighborhood order; không mặc nhiên global row-major như reference.

Gọi $W_p$ là nước thắng ngay cho mình, $W_{\bar p}$ là winning completions của đối thủ, $T=W_p\cup W_{\bar p}$. Continuous-five completion luôn sát ít nhất một quân sẵn có nên thuộc spatial r≥1, bao gồm gapXX_XX.

$$
C'=T\cup\operatorname{Top}_{\max(0,c-|T|)}(C_r\setminus T).
$$

Trong công thức giả sử $c\ge1$; input c=0 được chuẩn hóa thành $c_{\rm eff}=\max(1,c)$ trước khi áp dụng. Cap c mềm: nếu $|T|>c$, giữ cảT. Membership chọn bằng rank deterministic trước; toggle ordering chỉ đổi traversal.

~~~text
SELECT
  raw←spatial (r0 rỗng thì fallback legal)
  với mỗi m: count bốn trục cho own và opponent để xác định win/block
  rank wins→blocks→quick score→canonical coordinate
  giữ ít nhất max(c,numberCritical), c0 chuẩn hóa1
  ordering=false: traverse selected set theo coordinate
  ordering=true: traverse selected set theo rank
~~~

Source mới candidates.rs dùng directional assessment tương đương thử đặt quân rồi scan trên fixture; không mutate board khi rank. Tactical tests đối chiếu với apply+scan làm oracle độc lập.

$$
\mathrm{Recall}=\frac{|T_{\rm expected}\cap C'|}{|T_{\rm expected}|}.
$$

Denominator0 ghi N/A. Giữ mọi blocking coordinate không bảo đảm cứu ván có hai threats độc lập. Immediate recall không chứng minh fork/multi-ply đầy đủ.

Rank assessment $O(c_{\rm raw})$ với scan K cố định; sort $O(c_{\rm raw}\log c_{\rm raw})$. Counter candidate_moves_generated tính raw trước cap cộng qua node đã expand; ordering_evaluations tính rank assessments kể cả khi traversal ordering tắt (membership vẫn cần ranking).

**Apply:** browser search có recall tests. **Hại:** vẫn có thể bỏ development/fork. **Alternative:** uncapped/fulllegal rộng hơn nhưng tốn thời gian; hard top-c có thể mất tactics; arena/bitset chỉ thêm nếu profile thấy allocation bottleneck. Độ khó4/5.

## 8. Sáu tier và độ khó kỹ thuật

| UI | ID | Strategy | Depth | Radius/cap |
| --- | ---: | --- | ---: | --- |
| Easy | 0 | Random mọi legal empties | 0 | fulllegal, không TS tactical prepass |
| Normal | 1 | RuleBased win→block→one-ply heuristic | 1 | local; tactical trong Rust |
| Hard | 2 | Alpha-Beta | 2 | r2/c15 mềm |
| Very Hard | 5 | Alpha-Beta | 3 | r2/c12 mềm |
| Expert | 3 | Alpha-Beta | 4 | r2/c10 mềm |
| Master | 4 | Alpha-Beta | 5 | r2/c8 mềm |

Giữ id0..4, thêm VeryHard id5. UI order không phải numeric order. Depth mới thấp hơn4/6/8 cũ để giảm rủi ro fixed-depth lớn; đây là lựa chọn bảo thủ, **chưa calibrated**. Master chưa có TT/iterative. Các mức không được gọi mạnh hơn nhau nếu chưa tournament.

Random dùng seed cố định khi kiểm chứng; runtime lấy seed target. PRNG/modulo có thể có bias nhỏ, không gọi uniform hoàn hảo nếu không có rejection sampling.

| Hạng mục | Độ khó kỹ thuật [D],1–5 | Lý do/điều kiện |
| --- | ---: | --- |
| Matrix/safe access | 1 | bounds nhỏ/rõ |
| Invariant/local scan/composition | 2 | cần precondition và ownership |
| Heuristic/Random/RuleBased/Minimax | 3 | seed/priority/weight/restore |
| AB/candidate/order/Worker/Undo | 4 | bounds, membership, async stale state |
| TT/ID/raw-pointer optimization | 5 | namespace/deadline/unsafe invariants; deferred |

Đây là ước lượng thiết kế, khác bot difficulty và điểm đánh giá của giảng viên.

## 9. OOP phù hợp Rust và alternatives

Game chứa Board/history bằng composition; Board giấu cells/count, impl là operation boundary. Rust không có class inheritance như Java/C++; xem [Rust Book](https://doc.rust-lang.org/book/ch18-01-what-is-oo.html). Enum chọn strategy hữu hạn, struct giữ config/stats. Trait chỉ thêm khi có nhiều implementation/client thực cần shared interface; một trait/impl/callsite làm bài phức tạp mà chưa có ích.

| Phương án | Ích | Hại | Quyết định |
| --- | --- | --- | --- |
| struct+impl+enum | ownership/invariant rõ, match exhaustive | module dài nếu trộn responsibility | apply, tách Board/candidates/eval/search/boundary |
| generic/trait strategies | thay implementation | nhiều type/config nếu chỉ nhánh nhỏ | dùng khi có nhu cầu thật |
| clone mỗi node | backtrack dễ | copy lặp theo node | reference/control nếu benchmark |
| &mut/apply/undo | giảm clone | lỗi undo nhiễm sibling | apply kèm tests |
| raw pointer | có thể giảm bounds work | UB nếu sai, chưa đo lợi ích | deferred |
| opt-level3 thay z | có thể đổi runtime/size | tùy workload/compiler | cần A/B trước khi chọn |

Profile hiện ưu tiên size bằng z. [Cargo Book](https://doc.rust-lang.org/cargo/reference/profiles.html#opt-level) giải thích z tắt loop vectorization và khuyến nghị đo lựa chọn. Không gọi profile này nhanh nhất. Muốn chọn2/3/s/z phải cùng source/toolchain/fixtures/counters và lưu WASM bytes, median/min/max latency; không suy từ tên flag.

## 10. UI/Worker và lifecycle

App chính React19/Pixi7, X/O tâm15×15 ô, có16 đường biên mỗi trục. Giữ visual hiện có vì chưa có mẫu redesign. Mapping camera:

$$
\mathrm{col}=\lfloor u/w\rfloor+o_x,\qquad
\mathrm{row}=\lfloor v/w\rfloor+o_y.
$$

$u,v$ là logical pointer sau DOM rect/scale conversion, w là cell width; offset là camera cell. Không bịa snap radius0.45 hay mutex khi source dùng floor và gesture down/up.

TS GameState sở hữu ván chơi. Rust Game trong Worker replay history để tìm move; result chỉ commit khi controller kiểm round/token/phase/turn.

~~~text
capture immutable history + round/token
Worker init → replay → Rust strategy/search → move/score/counters
Worker elapsed đo hydrate/search/free (không gồm init/message)
controller loại stale → apply một move → publish snapshot/stats
Undo/Reset/đổi mode: invalidate token+round, terminate pending Worker
~~~

PvP Undo một ply; PvAI pending bỏ human ply; sau cặp human+bot bỏ hai ply. Controller/state thực hiện, UI chỉ gọi action. Draw phải dừng timer; Back/Close dùng menu nội bộ. StrictMode cleanup cần worker lazy/reopen và tests/browser đúng môi trường.

Counters: nodes=recursion visits; leaves=horizon/terminal leaf visits; cutoffs=cutoff events; ordering=rank assessments; completedDepth là depth thực hoàn tất theo định nghĩa search. Tactical TS prepass ghi source tactical/depth0, không giả đã chạy Rust. Random hiện đếm2 state assessments (root và nước đã chọn), completedDepth0 vì không tìm lookahead; post-choice score không điều khiển chọn quân. Counter cần đọc theo strategy, không suy node0 từ tên Random.

Main-thread responsiveness cần browser check khi Worker pending; source có Worker chỉ chứng minh architecture. Build/unit pass không chứng minh thiết bị thật/Wink host.

## 11. Protocol gate và đường dẫn báo cáo

1. Requirement/owner/baseline hash.
2. Toán/pseudocode/invariant/termination/cost.
3. Source change và correctness fixtures.
4. Cùng chu kỳ gate: TMB rà ownership/dependency/report, Ponytail rà complexity; findings phải sửa rồi check lại.
5. Lưu command/exit/stdout/stderr/config/seed/raw/source hash.
6. Ghi report tuần liên quan, trạng thái VERIFIED theo môi trường, limitation/deferred.

TMB là skill workflow, không phải executable tên TMB. Ponytail-review chỉ over-engineering, không thay correctness. Không tự tạo plan/roadmap framework cho một gate nhỏ.

Tuần1 representation/address; tuần2 transaction/scan; tuần3 UI/lifecycle; tuần4 heuristic/strategy; tuần5 tree/MM; tuần6 AB; tuần7 candidates/order/difficulty. Mỗi file Week1..Week7 có phần cập nhật và trích nguồn riêng. [Source excerpts](research/current_2026_10_23/SOURCE_EXCERPTS.md) nối symbol/range/hash với code thực.

DOCX/PDF, Google Docs, Canva và mirrors lịch sử không được regenerate bởi yêu cầu Markdown này. Full pattern taxonomy, TS↔Rust equivalence mọi state, calibration strength, physical-device/Wink acceptance và performance tốt nhất cần evidence riêng.
