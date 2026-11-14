import json
from pathlib import Path

BASE = Path(__file__).parent
items = json.loads((BASE / 'current_items.json').read_text())
by_start = {item['start']: item for item in items}
patches = []

def add(start, addition, reason, evidence, replace=False):
    old = by_start[start]['text']
    new = addition.rstrip() + '\n' if replace else old.rstrip() + '\n' + addition.strip() + '\n'
    patches.append(dict(start=start, old=old, new=new, reason=reason, evidence=evidence))

rust = '/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine/src/'
legacy = '/home/pro/Downloads/basicproject/CaroGame/src/game/bot/'

add(20900, '''Index conversion must preserve both the cell and its coordinate convention. For 0 ≤ x,y < N, division of i = Ny + x by N has quotient y and remainder x, so the inverse returns the original coordinate. Conversely, every integer 0 ≤ i < N² determines exactly one such pair. This establishes a one-to-one mapping, with O(1) conversion time and space. Bounds must be checked before using an index: on a 15-column board, the invalid coordinate (15,0) would otherwise alias the valid coordinate (0,1). The Rust (x,y) and frontend (row,col) forms therefore require an explicit swap at their boundary.''',
    'A01: make the bijection and an out-of-bounds alias failure explicit; existing paragraph already has representation and example.',
    [rust+'board.rs: Board::place/get_checked', 'Arithmetic derivation from i=Ny+x; illustrative invalid input, not observed runtime failure.'])

add(23888, '''The requirement that apply and undo succeed is an internal precondition, not a recovery branch. In the modified Rust search, an illegal generated move reaches expect and fails the search; undo is checked by debug_assert, which is not a release-mode recovery mechanism. The ordinary search entry owns a root clone, but search_in_place exposes the caller's working board and assumes normal completion. Neither path establishes transactional recovery from an unexpected panic. In the legacy search, the dedicated deadline sentinel unwinds through paired finally blocks; unrelated exceptions are rethrown. A corrupted working state must not be interpreted as a valid search result. Recovery by discarding and reconstructing the request would require an explicit caller policy; it is not implemented by the pseudocode's require statement [10], [15].''',
    'A02: distinguish proof precondition, expected abort cleanup, and unsupported invariant-failure recovery.',
    [rust+'search.rs: SearchContext::value/run, search, search_in_place', legacy+'search.ts: alphaBeta/quiescence/findBestMove'])

add(26216, '''The reason to use the last move is local change: only one empty cell becomes occupied. Every line that does not pass through that cell has exactly the same stones as before, so it cannot become a new winning line if the preceding board had no winner. This argument justifies restricting the scan to four axes; it does not validate arbitrary imported boards or detect a pre-existing win elsewhere. At the root, the modified Rust search uses check_winner over the position before relying on check_winner_at for descendants [10].''',
    'A03: recover the causal argument for locality rather than merely state the precondition.',
    [rust+'search.rs: SearchContext::run/value', rust+'board.rs: check_winner/check_winner_at'])

add(29614, '''For example, if the ordered legal list is [a,b,c] and the generated unsigned integer is 8, the remainder is 2 and the selected move is c. No comparison of the positions after a, b and c occurs. More generally, write 2^64 = qL + r for a list of L cells. Under a hypothetical uniform 64-bit input, the first r remainders have q+1 preimages and the rest have q, explaining the modulo bias. This counting argument does not establish that a fixed seed is random or that a finite run samples moves uniformly. The source uses a SplitMix64-style mixer with wrapping 64-bit arithmetic [10].''',
    'A04: concrete selection trace and explanation of already disclosed modulo limitation.',
    [rust+'ai.rs: seeded_u64/baseline', 'Remainder-count derivation; not a statistical test.'])

add(35256, '''For a fixed direction, every maximal run has exactly one first cell: its predecessor is outside the board or has another value. That cell passes the guard and scans to the first nonmatching cell. Every other stone in the same run has a same-color predecessor and is skipped. Thus no run is omitted or counted twice on that axis. Counting the same stone on different axes is intentional because horizontal, vertical and diagonal formations are distinct contributions. For a run of three X stones, scanning from all three cells without the guard could count suffixes as additional runs; the guard prevents this artificial inflation. Since each cell participates in at most one accepted scan per axis, the apparent loop within a loop still has total O(N²) scan work.''',
    'A06: expand uniqueness and amortized scan proof, including the concrete duplicate-count failure.',
    [rust+'eval.rs: evaluate/count_line'])

add(35571, '''The same two-X board has E(B,O) = −227: the geometry stays fixed while the requested perspective changes. If O is added at (9,7), X's horizontal two has one open end and contributes 50, while the signed center contribution is 14 + 13 − 12 = 15, giving E(B,X) = 65. These are evaluator examples rather than claims of forced wins. The sign means advantage for the requested player, not the color of the last move. The modified Rust recursion keeps that root perspective fixed at every depth: an opponent turn minimizes the same score instead of negating it. Under this evaluator's symmetric weighting and clamp, exchanging the requested player negates the nonterminal score.''',
    'A06/A07: show endpoint change, signed center subtraction, and root-relative convention through actual numeric evaluation.',
    [rust+'eval.rs: evaluate/pattern_score', rust+'search.rs: SearchContext::value'])

add(37236, '''A terminal utility and a pattern weight answer different questions. The run weight of 1,000,000 contributes to a static board estimate; it is not the utility assigned to a proven terminal win. The terminal check precedes evaluation and uses M instead. For an unavoidable root loss at ply two, −99,999,998 is worse for MAX than −99,999,996 at ply four; MIN, representing the opponent's interests, prefers the earlier loss for the root. A zero heuristic indicates a numerical balance under the chosen features, whereas a terminal zero denotes a draw. An empty-candidate zero has a third, implementation-specific meaning described in Section 2.8. These meanings cannot be recovered from the scalar alone.''',
    'A07: connect pattern score, utility, MAX/MIN sign, and distinct meanings of zero.',
    [rust+'eval.rs: terminal_utility/evaluate', rust+'search.rs: SearchContext::value'])

add(39474, '''With a single central stone, radius two offers 24 candidates instead of 224 legal empty cells. In a hypothetical uniform depth-d tree, reducing width from b to k changes the leaf model from b^d to k^d; this explains why selection can affect search cost more strongly than a small constant-time optimization. Actual widths vary, and later tactical preservation may enlarge them. A radius includes nearby diagonal and orthogonal cells equally under Chebyshev distance. A larger radius admits more distant plans but increases assessment and search work; a smaller radius saves work by making a stronger assumption about where useful moves occur. The raw set is complete for its spatial predicate, not for all strategically useful legal moves.''',
    'A08: motivate radius and branching trade-off quantitatively without presenting a measured speedup.',
    [rust+'board.rs: get_candidates', 'Illustrative fixed-width search-tree derivation.'])

add(40112, '''The assessment can be implemented without changing the board. At an empty coordinate m, count consecutive own stones on both sides of each axis; the hypothetical stone supplies the missing one, so a sum of at least four marks an immediate win. Repeat the same count for the opponent to mark a blocking coordinate. For X X _ X X, the gap has two X stones on each side: 1+2+2=5, although the static contiguous-run evaluator sees two separate runs before placement. The quick ranking score is a separate quantity: the source assigns own counts 1,2,3,≥4 the values 10,100,1,000,10,000, and opponent counts the values 5,80,900,9,000, sums these over the axes, and adds a small center term. The Boolean win/block keys precede this numeric score in the sort; even a large ordinary ranking score therefore cannot push an assessed immediate tactic behind a non-tactical move [10].''',
    'A05/A09: fill the missing implementation of ASSESS and distinguish quick ranking from full evaluation.',
    [rust+'candidates.rs: count_side/assess/select_candidates'])

add(43473, '''The pruning effect comes from bound discovery. In the depth-two example used below, A has MIN leaves [3,5] and B has [2,9]. Searching A first establishes root alpha=3; seeing B's leaf 2 then cuts off its leaf 9, for three evaluated leaves. Searching B first with leaf 9 before 2 requires both leaves because no useful root lower bound exists yet. It then establishes alpha=2, and both leaves under A must be checked, for four evaluated leaves. Both traversals return 3. A ranking heuristic is valuable when it tends to expose such decisive values early, but it may cost more than the work saved, and a poor rank can provide no pruning benefit. This trace concerns only order; removing a leaf would define a different tree.''',
    'A10: replace generic early-cutoff explanation with a fully traced comparison on identical membership.',
    ['Arithmetic trace of the same tree in Sections 2.8 and 2.9.', rust+'search.rs: SearchContext::value'])

add(45589, '''At the root, SearchResult carries best_move, score and statistics; it does not carry a distinct invalid-candidate-generation status. In the documented valid-input path, a nonfull board has a center candidate, a neighborhood candidate, or the legal-move fallback, so a positive-depth search is intended to have a move. Depth zero and an already terminal root legitimately return no move for different reasons. Consequently, a caller must interpret the score together with the board state, requested depth and optional move. Introducing a separate error status for an unexpected nonterminal empty set would improve the contract, but would be an implementation change beyond the recorded algorithm [10].''',
    'A11: explicitly describe current result limitations rather than invent a fallback/error state absent from source.',
    [rust+'search.rs: SearchResult, SearchContext::run/value', rust+'candidates.rs: select_candidates'])

add(49951, '''This Rust kernel uses a fail-soft return: it returns the best observed child value even when that value lies outside the incoming window. For a MAX node with window [3,8], observing 9 is sufficient to cut off and return 9, which proves a lower bound, not an exact value for the unvisited subtree. Dually, a MIN node can return 2 as an upper bound below alpha=3. A fail-hard variant would instead return the relevant window boundary, 8 or 3. Either convention can support correct pruning when callers and caches interpret it consistently. Section 2.13's legacy quiescence uses clipped nonterminal returns; it must not be assumed to share the Rust kernel's return convention [10], [15].''',
    'A12/A15/A16: identify actual fail-soft behavior and connect it to TT and quiescence.',
    [rust+'search.rs: SearchContext::value', legacy+'search.ts: alphaBeta/quiescence'])

add(50876, '''The two cutoff directions are dual. At a MIN node, one examined child with value at most alpha gives MIN an option that is already no better for MAX than an available ancestor alternative; further children can only leave that minimum unchanged or lower it. At a MAX node, one examined child at least beta gives MAX an option already no better for the relevant MIN ancestor than its alternative; further children can only leave that maximum unchanged or raise it. Thus the skipped descendants cannot change the ancestor decision that matters. The argument depends on returning bounds in the correct direction, restoring the board, and using the same retained successors and score semantics as the comparison Minimax tree.''',
    'A12: explicit dual cutoff proof rather than a single MIN-node example.',
    [rust+'search.rs: SearchContext::value', 'Derivation from max/min monotonicity and incoming window contract.'])

add(54193, '''The legacy fallback is the first generated move, with score initialized to zero and completed depth zero; it is not a completed depth-zero search result. Its deadline is start + timeMs − 5. Candidate generation and root ranking run before some of the periodic checks, so the five-millisecond margin does not impose a hard completion bound. Only the dedicated sentinel sets timedOut; stopping between completed iterations because the deadline has passed can still produce reason="completed". Likewise, the no-move label tests null, while an empty root loop can replace the initial null with the internal −1 sentinel. These are limitations of the legacy output contract, not evidence that the active fixed-depth Rust path uses that contract. Algorithm 2.12 expresses the completed-iteration principle; it does not certify every status field in findBestMove [15].''',
    'A13: distinguish actual fallback values and observed source-level status edge cases from ideal pseudocode.',
    [legacy+'search.ts: findBestMove/checkAbort'])

add(60234, '''The legacy alphaBeta stores best, saves originalAlpha before the loop, and leaves beta unchanged; it classifies best against those original bounds. This is a fail-soft convention at that layer. Its probe returns a stored score only for an exact flag or a bound that closes the requested window; it does not tighten alpha or beta when a bound is insufficient. For example, a compatible LOWER entry of 9 cuts off a query with beta=8, but cannot answer a query with beta=12; the move can still be considered as an ordering hint. A cache hit therefore reuses a statement such as value≥9, not necessarily the equality value=9. The context check shown in Algorithm 2.14 states a requirement: the legacy array implementation checks its hash and depth, but does not separately encode every context field listed in that requirement [15].''',
    'A15: explain store/probe sequence using actual source and avoid implying ideal context guard is implemented.',
    [legacy+'search.ts: alphaBeta/probeTT/storeTT'])

add(64942, '''Negamax combines the two player cases by changing perspective at every edge. If a child position is worth −6 to its side to move, it is worth +6 to the parent player, so the caller uses v=−child_value. Negating the parent interval [alpha,beta] reverses its endpoints: the corresponding child interval is [−beta,−alpha]. For a parent window [3,8], the child receives [−8,−3]. This conversion belongs to both legacy alphaBeta and quiescence; the modified Rust MAX/MIN routine instead passes root-relative values without sign reversal. Mixing these conventions would reverse some preferences twice or not at all. The legacy nonterminal quiescence branches return beta on fail-high and the current alpha otherwise, while its earlier terminal checks directly return mate scores that may lie outside the window. Thus “fail-hard” describes its nonterminal bound handling, not an assertion that every return is clipped [15].''',
    'A16/A07: derive sign and window reversal and qualify terminal exception to fail-hard shorthand.',
    [legacy+'search.ts: alphaBeta/quiescence', rust+'search.rs: SearchContext::value'])

add(67987, '        increment the returned category bucket only if the category is not NONE',
    'A17: align COUNT_LINE pseudocode with evaluateLine, which does not increment the NONE bucket.',
    [legacy+'eval.ts: evaluateLine'], replace=True)

add(68063, '''For a segment of length L, a direct five test examines offsets j=0,…,L−5 and checks ((mask >> j) AND 31)=31. To count winning cells, visit each zero bit i, set it in a temporary mask with OR (1 << i), and run the five test. The original mask is unchanged. For XX_XX with bits indexed from the left, mask=11011₂=27; setting bit 2 gives 11111₂=31 and the unique winning cell. For _XXXX_, either endpoint completes a five, so the count is two and the category is OPEN_FOUR. These are completion counts under a specific segment model, not a count of all independent tactical plans: the table returns one category per segment, with FIVE taking precedence over weaker classes.''',
    'A17: make the bit operations and classification trace independently implementable.',
    [legacy+'eval.ts: initPatternTable/hasFive/countWinCells'])

add(68448, '''In vector form, let counts[p] be the total category counts for player p, and let affected(m) contain the four board lines through m. The update is:
for p in {X,O}: counts[p] ← counts[p] − Σ[line∈affected(m)] COUNT_LINE(B,p,line)
change the cell at m
for p in {X,O}: counts[p] ← counts[p] + Σ[line∈affected(m)] COUNT_LINE(B,p,line)
Undo repeats the same three steps around clearing the cell; turn, hash and stone count are restored by their own paired updates. Both players must be processed because inserting X also splits or blocks O's segments. For an otherwise empty board with the row fragment O X X _ X X O, the five-cell X segment initially contributes one FOUR. Placing X in the gap subtracts that FOUR and adds one FIVE; the three other crossing lines contain no five-cell threat. Undo subtracts the FIVE and restores the FOUR. If the old line counts were not subtracted, both categories would remain and repeated hypothetical moves would accumulate stale threats. This delta trace illustrates the invariant, while a full recomputation provides an independent consistency check [26], [28].''',
    'A18: add explicit delta pseudocode, worked make/undo example, and failure mechanism.',
    [legacy+'board.ts: updateLines/makeMove/undoMove', legacy+'eval.ts: evaluateLine'])

add(69094, '''The lookup speed is purchased with initialization work and storage. The allocated Uint8Array has (15+1)×32,768 entries, or 524,288 payload bytes, including unused slots for shorter masks. If the maximum supported length L were allowed to grow, enumerating every mask would be exponential in L. The direct classification routines can perform nested empty-cell trials and five scans, giving a coarse O(L³) bound per mask and O(2^L L³) preprocessing overall. Once initialized, lookup is constant time for a supported segment, but constructing its mask still scans its cells. Incremental counts therefore reduce which lines are recomputed; they do not make an arbitrary whole-board evaluation O(1). A source-level extension beyond length 15 must also revise the fixed shift/index layout rather than relying on the larger coordinate capacity of BotBoard.''',
    'A17/A18: explain preprocessing/runtime trade-off and actual table memory, rather than an unqualified O(1) classifier.',
    [legacy+'eval.ts: MAX_LEN/patternTable/initPatternTable/evaluateLine', legacy+'board.ts: BotBoard/updateLines'])

(BASE / 'algorithm_depth_supplements.json').write_text(json.dumps(patches, ensure_ascii=False, indent=2)+'\n')
assert len({p['start'] for p in patches}) == len(patches)
for p in patches:
    assert p['old'] == by_start[p['start']]['text']
print(json.dumps({'patches':len(patches),'added_words':sum(len(p['new'].split())-len(p['old'].split()) for p in patches),'starts':[p['start'] for p in patches]}))
