# Mathematical Foundations: Rust Heuristic and Adversarial Search

Status: design + new Rust implementation. This document is not a performance report. Historical Rust native vs TypeScript numbers in README and docs/BENCHMARK_RUST_VS_TYPESCRIPT.md belong to a different external Rust core and are NOT evidence of WASM execution, UI FPS, or parity of this new implementation.

## 1. Formal state and rules

Board B belongs to {0,1,2}^(15 x 15), with 0=empty, 1=X, 2=O. A legal action (r,c) is an in-bounds empty intersection. The transition T(B,(r,c),p) replaces B[r,c]=0 with p. The project engine uses FREESTYLE: a contiguous sequence of at least 5 wins, including overlines. It does not implement exact-five, Renju forbidden moves, or blocked-both-ends Vietnamese rules.

Directional basis D={(0,1),(1,0),(1,1),(1,-1)}. These are 4 undirected axes, or 8 directed rays. This is discrete indexed matrix traversal, not matrix multiplication and not a shortest-path algorithm.

## 2. Local winner detector and proof

For a last move x=(r,c) by player p and each d in D, let L+(x,d) and L-(x,d) be the number of consecutive p stones along +d and -d, stopping on the first non-p cell or boundary. Each ray needs at most k-1=4 inspections for k=5. The winning predicate is:

    Win(B,x,p) iff exists d in D: 1 + L+(x,d) + L-(x,d) >= 5.

At most 4 axes * 2 rays * 4 inspected neighboring stones = 32 neighbor comparisons, plus constant overhead. Complexity O(4k), hence O(1) only when k=5 is fixed. The current code short-circuits on a mismatch. For a variable k the complexity is O(k), not unconditionally O(1).

Correctness by induction over legal moves: Base case: the empty board has no winning line. Induction hypothesis: the pre-move board is non-terminal. After placing exactly one new stone at x, every winning line that did not contain x would already have existed before the move, contradicting the hypothesis. Therefore every newly formed winning line contains x. Every possible line through x has one of the four axes D, and the two rays enumerate its maximal contiguous portion (up to k-1 stones on each side, enough to establish a length-k win). Thus the predicate detects every new win and cannot report a win when fewer than k contiguous stones are present. This proof relies on the previous board being non-terminal and the rule being freestyle.

## 3. Exact scan counts

A naive full-board scan over every contiguous length-5 window on a 15x15 board has:
- horizontal: 15*(15-5+1)=165 windows;
- vertical: 165 windows;
- main diagonals: (15-5+1)^2=121 windows;
- anti-diagonals: 121 windows;
- total: 572 length-5 windows, or at most 2,860 cell reads in a naive implementation that rereads all five cells of every window.

These are window counts, not timings. A full scan can reuse intermediate results and be faster than that naive bound. In contrast, local winner detection checks at most 32 neighboring positions and the center. Do not compare incompatible notions of an operation.

## 4. Candidate move generation

Chebyshev distance d_infinity(x,y)=max(|x_r-y_r|,|x_c-y_c|). Given occupied set S and radius q>=1:

    C_q(B) = { y : B[y]=0 and exists x in S with d_infinity(x,y)<=q }.

If S is empty, choose center (7,7). With m occupied stones, candidate construction takes O(15^2 + m(2q+1)^2) time and O(15^2) temporary memory. The number of candidates is bounded by min(225-m, m(2q+1)^2). This is a selective search optimization: a legal move outside C_q is still legal. Truncating to top K candidates further loses completeness.

## 5. Heuristic evaluation

For each of 4 axes, traverse every maximal straight line exactly once. Count contiguous runs of player p and open endpoints (adjacent empty cells). Example weights, subject to ablation:
- contiguous 4 with 2 open ends: 100000;
- contiguous 4 with 1 open end: 10000;
- contiguous 3 with 2 open ends: 3000;
- contiguous 3 with 1 open end: 300;
- contiguous 2 with 2 open ends: 100;
- contiguous 2 with 1 open end: 10;
- internal-gap four in a 5-cell window (X_XXX, XX_XX, XXX_X): 15000;
- internal-gap three in a 5-cell window: 600.

These weights are engineering hypotheses, not mathematically derived probabilities. Overlapping windows may be counted more than once; record this as a limitation and test alternatives. The evaluation is zero-sum:

    E(B,p) = clamp(S(B,p)-S(B,opponent(p)), -MATE+1000, MATE-1000).

Therefore E(B,X)=-E(B,O), required by negamax. For move ordering only, a different local priority uses 11*attack+10*defense and places immediate wins ahead of forced blocks. This is NOT the terminal evaluator. Static line scoring is O(4*N^2*k) for fixed-size windows and N=15; no general matrix product is computed.

## 6. Search recurrence, induction and complexity

For depth h=0, V(B,p,0)=E(B,p). If the previous move ended the game, V(B,p,h)=-MATE+ply. Otherwise:

    V(B,p,h)=max_{a in C(B)}[-V(T(B,a,p), opponent(p), h-1)].

Induction on h proves this negamax recurrence equals depth-limited minimax for a zero-sum game, provided both explore the SAME move set and terminal scores are consistent. Base h=0 uses E. Induction step: a maximizing choice for p corresponds to the negative of the opponent's best reply. Alpha-beta maintains bounds alpha and beta and prunes when alpha>=beta; pruning preserves the depth-limited minimax value on the explored game tree, not the true game-theoretic value of unrestricted Gomoku.

For branching factor b and depth h: unpruned worst-case O(b^h) nodes; alpha-beta worst-case O(b^h), ideal move ordering about O(b^(h/2)). Each leaf evaluation costs O(N^2*k). Top-K selective move generation changes the game tree and may omit the best legal move. Counters record visited nodes and cutoff events; cutoff events are NOT the number of pruned nodes.

## 7. Testing and research protocol

Unit tests cover all 4 axes, borders, overline, broken lines, make/unmake invariant, candidate uniqueness, tactical win/block, antisymmetric evaluation, and depth-2 minimax/alpha-beta parity. Tests are specifications until CI runs and passes; never label them as observed evidence without a CI log.

For a scientific benchmark, freeze 10+ legal nonterminal fixtures, rule profile, code commit, CPU, OS, compiler flags, browser, and Node version. Measure native Rust, Node TypeScript, and WASM in a browser Worker as THREE different runtimes. Record warmup, >=30 timed iterations where feasible, median, p95, variance, nodes, cutoffs, chosen move, score, and memory. Test parity on fixture outputs and randomized legal games; identical nodes are not sufficient proof of universal semantic equivalence. Measure frame intervals with requestAnimationFrame and long tasks on actual browser hardware; Worker execution does not by itself guarantee 60 FPS.

## 8. Reproducibility and build

    cargo test --workspace
    cargo run --release -p rust_bench -- midgame
    rustup target add wasm32-unknown-unknown
    cargo build -p caro-core --release --target wasm32-unknown-unknown --features wasm
    wasm-pack build caro-core --target web -- --features wasm

The WASM export best_move_wasm takes 225 bytes (0 empty/1 X/2 O), side-to-move, depth, and max candidates, and returns [row,col,score,nodes,cutoffs]. Invoke it inside a dedicated Web Worker. React integration, Worker packaging, browser benchmarks and parity tests against the existing TypeScript implementation are NOT completed by this Rust core commit.

## 9. Week 5 to Week 7 deliverables

Week 5: freeze rule profile and corpus, test directional scan and heuristic patterns, compare random vs rule-based; collect correctness evidence.
Week 6: Rust native negamax and alpha-beta, deterministic move ordering, counters, reproducible CI and native benchmarks; compare minimax and alpha-beta at identical search settings.
Week 7: WASM packaging, dedicated Worker, React bot mode, semantic parity corpus, browser latency and frame-timing measurements; report limitations and negative results.

Academic report structure: research questions, mathematical definitions, proof assumptions, algorithms/pseudocode, experimental setup, observed results with links to raw logs, discussion, threats to validity, and references. No fabricated 60 FPS, WASM speedup, or 100% parity claims.
