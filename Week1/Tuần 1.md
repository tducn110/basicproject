**

TUẦN 1 - RESEARCH FOUNDATION, RULES, STATE SPACE VÀ SCOPE

  

## 0. Artifacts needed

- Đề cương đồ án chính thức.

- Rule Specification phiên bản 1.

- Danh sách Research Questions của toàn đồ án.

- Reading notes từ các paper/docs chính.

- Bảng terminology: Gomoku, Caro, state, state space, game tree, branching factor, ply.

- Scope / Out-of-scope được khóa.

## 1. Research Objectives

The objectives of Week 01 are to establish a consistent research foundation for the Caro AI project. Specifically, this week aims to:

1. Complete the project proposal and research outline, including the research problem, objectives, methodology, expected outcomes, and project structure.
    
2. Define the Caro game rules used throughout the project, including board configuration, winning conditions, legal moves, turn order, and game termination conditions.
    
3. Define the project scope and research boundaries, specifying the problems to be investigated, the algorithms to be evaluated, the experimental constraints, and the aspects excluded from the current study.
    

## 2. Research Questions

1. Which Caro rule profile will be adopted in this project, and how are the winning conditions formally defined?
    
2. What information must the game state contain to support both gameplay execution and search algorithms?
    
3. Why is exhaustive game-tree search computationally infeasible for a 15×15 Caro board?
    
4. Which algorithms are included in the official research scope, and which metrics will be used to evaluate and compare them?
    
5. What do previous studies on Gomoku indicate about the respective roles of search algorithms and domain-specific knowledge in game-playing performance?
    

## 3. BackGround and Rule Definition

1. Gomoku is a two-player strategy game played on a grid, but multiple rule variants exist. Therefore, this project distinguishes between internationally documented Gomoku rules and the project-specific rule profile.
    
2. The International Rules of Gomoku published by the Gomoku Committee of the Renju Internationally Federation (RIF) define a 15x15 board with 225 intersections, alternating play between Black and White, and Black moving first. Under these rules, a player wins by forming an uninterrupted row of exactly five stones horizontally, vertically, or diagonally; a row of six or more stones does not constitute a win. The rules also specify the Swap2 opening procedure for official play. [R1] : https://gomoku.renju.net/gomokurules/
    
3. These international rules are used as an external reference, not as an automatic definition of the rule profile implemented by this project. Any project-specific condition, including rules commonly associated with Vietnamese Caro such as restrictions involving blocked ends, must be defined explicitly as part of the Project Rule Profile. Such a condition must not be described as an international standard unless an authoritative source explicitly supports that classification.
    
4. Allis, van den Herik, and Huntjens identify several Go-Moku variants and show that rule differences directly affect the game being analysed. Their work distinguishes, for example, an exact-five variant in which an overline does not win from an unrestricted variant in which an overline is sufficient for victory. [R2] [https://cdn.aaai.org/Symposia/Fall/1993/FS-93-02/FS93-02-001.pdf](https://cdn.aaai.org/Symposia/Fall/1993/FS-93-02/FS93-02-001.pdf)
    
5. The work of Allis et al. is used in this project as foundational related work on search in Gomoku. The authors investigate both domain-specific strategic knowledge and specialized search techniques. Their analysis reports an average branching factor of more than 200 in relevant search situations, and notes that even after substantial search-space reduction, several million positions may still require examination. [R2] 
    
6. The same work demonstrates how knowledge of Gomoku threats can be incorporated into search. Threat-space search restricts exploration to strategically relevant threat sequences, while proof-number search is subsequently used when the restricted threat search alone cannot establish a result. These findings support the broader research premise that domain-specific knowledge can substantially guide and reduce search in Gomoku. [R2]
    
7. Allis' doctoral thesis, Searching for Solutions in Games and Artificial Intelligence, provides the broader research context for game-solving and search techniques and is retained as a foundational secondary reference for this project. [R3] [https://cris.maastrichtuniversity.nl/ws/portalfiles/portal/588458/guid-36b5cf0a-cf06-4602-afdb-1af04d65c23b-ASSET1.0.pdf](https://cris.maastrichtuniversity.nl/ws/portalfiles/portal/588458/guid-36b5cf0a-cf06-4602-afdb-1af04d65c23b-ASSET1.0.pdf)
    

=> The project distinguishes external rule references from its own rule profile.

## 4. Project Rule Profile

The external rules and previous studies discussed in Section 3 provide references for defining the game, but they do not automatically determine the rules implemented by this project. Therefore, the project maintains an explicit Project Rule Profile as the authoritative rule contract for implementation, testing, search, and experimentation.

### 4.1 Confirmed Rule Configuration

The project uses a 15×15 board with two players taking alternating turns. A move is represented by board coordinates (row, col), using zero-based indexing from 0 to N - 1.

A move is considered legal when the selected coordinates are within the board boundary and the target position is empty.

The winning line length is five stones. A draw occurs when the game reaches a state in which no further legal continuation is possible and no player satisfies the winning condition.

### 4.2 Rule Decisions Requiring Final Confirmation

The following rule behaviors must be explicitly confirmed before the Project Rule Profile is considered complete:

- whether the winning condition requires exactly five stones or allows five or more;
    
- whether an overline constitutes a win;
    
- whether a five-stone line blocked at both ends constitutes a win;
    
- whether blocking at one end affects the winning condition;
    
- whether an opening procedure such as Swap2 is adopted.
    

These behaviors must not be inferred solely from the term Caro. Each condition must be explicitly defined by the project and subsequently verified through rule fixtures.

### 4.3 Role of the Rule Profile

The same Rule Profile must be used consistently by gameplay logic, terminal-state detection, AI search, automated tests, Bot-vs-Bot experiments, and dataset generation.

A change to the Rule Profile changes the definition of the game being studied. Experimental results produced under different rule configurations must therefore identify the configuration used and must not be compared as if they represented the same experimental condition.

  
  

## 5. Formal Problem Definition

The computational problem is divided into two connected layers: the Core Game Process and the AI Search Process.

### 5.1 Core Game Input

The Core Game Process operates on three main inputs:

- GameState: the current logical state of the game;
    
- Move: the proposed board coordinates;
    
- RuleProfile: the rule configuration defined in Section 4.
    

The current player is maintained as part of GameState rather than treated as an independent source of state.

### 5.2 Move Validation

Before a move can modify the game state, the system verifies that the selected coordinates are located within the board boundary and that the target cell is empty.

### 5.3 State Transition

After a valid move is accepted, the current player's stone is placed at the selected position and the logical game state is updated.

The transition may update the board, move count, last move, game status, winner information, and the player who will act next.

The transition must preserve the Rule Profile defined in Section 4 and the state contract defined in Section 6.

### 5.4 Terminal-State Detection

After applying a valid move, the resulting state must be classified according to the Project Rule Profile.

The game state may be classified as:

- PLAYING: the game can continue;
    
- WON: the latest move satisfies the winning condition;
    
- DRAW: the game has ended without a winner.
    

Terminal-state detection must not define its own version of the game rules. It must use the same Rule Profile that governs gameplay and search.

### 5.5 AI Search Process

The AI Search Process operates on the same authoritative GameState and RuleProfile used by the Core Game Process.

Given the current game state, an AI player generates legal or candidate moves, evaluates possible future game states, explores selected continuations, and returns a move according to the selected search strategy.

Move generation and state evaluation are therefore components of the search process.

During recursive search, hypothetical moves produce temporary successor states. Search continues until a terminal state, configured depth limit, time limit, or another stopping condition is reached.

The resulting values are propagated through the search procedure so that the AI can select a move.

### 5.6 Output

The Core Game Process returns an updated GameState.

The AI Search Process returns a SearchResult containing the selected move and the search information required by the selected algorithm and experimental protocol.

SearchResult may include:

- selected move;
    
- evaluation score;
    
- achieved search depth;
    
- number of visited nodes;
    
- measured search time;
    
- other instrumentation defined by the project metrics.
    

### 5.7 Search Abstraction

For adversarial search, the project models Caro as a two-player, deterministic, turn-based, perfect-information game.

At the search abstraction level, the game is treated as zero-sum: an outcome that benefits one player corresponds to an opposing outcome for the other player.

This abstraction provides the theoretical basis for Minimax and related adversarial-search techniques used later in the project.

## 6. Board and State Representation

A consistent logical representation is required across gameplay, AI search, testing, experiment data, and any later boundary between TypeScript and Rust.

For the selected board configuration:

The proposed logical cell encoding is:

- EMPTY = 0;
    
- PLAYER_A = 1;
    
- PLAYER_B = -1.
    

Rows and columns use zero-based indexing.

If later repository evidence shows that the actual authoritative implementation uses a different encoding, the report must describe the implementation that actually exists rather than modifying code only to preserve an earlier documentation choice.

### 6.2 Game State

GameState must contain sufficient information to reproduce the current position and continue gameplay or search without relying on hidden external state.

The logical state includes:

- board;
    
- current player;
    
- game status;
    
- winner information;
    
- move count;
    
- last move.
    

The current player identifies which player may make the next move.

The last move provides a reference point for localized terminal-state detection and can avoid unnecessary full-board scanning after every move.

### 6.3 Logical and Physical Representation

The logical state contract is independent of the physical representation used by a particular programming language.

TypeScript and Rust may use different internal structures provided that both preserve the same logical board contents, player state, rule semantics, and transition behavior.

This distinction allows implementation details to evolve without changing the formal definition of the game.

## 7. State Space and Game Tree

### 7.1 Raw Configuration Space

If each board position can independently contain one of three logical values, the coarse upper bound on representable board configurations is:

  
  

### 7.2 Game Tree

A game tree represents possible continuations from a particular game state.

Each node represents a state, while each edge represents a legal move that transforms one state into another.

If the average branching factor is (b) and the search depth is (m), a uniform game tree contains approximately:

nodes.

For (b > 1), the dominant growth term is (b^m). A conventional Minimax search is therefore commonly described using the time-complexity approximation:

[  
O(b^m)  
]

where (b) is the average branching factor and (m) is the search depth measured in ply.

### 7.3 Research Implication

The exponential growth of the game tree makes unrestricted full-width search increasingly expensive as search depth increases.

This motivates the later investigation of pruning, candidate reduction, move ordering, state reuse, and other search techniques included in the project scope.

Detailed mathematical definitions and derived metrics are maintained separately in the Mathematical Foundations section of the research record.

---

## 8. Official Research Scope

The project distinguishes between baseline strategies, adversarial-search algorithms, domain-specific components, and search optimizations.

### 8.1 Baseline Strategies

The baseline strategies are:

- Random Move;
    
- Rule-Based / Heuristic Move Selection.
    

These strategies provide reference points for evaluating later search-based approaches.

### 8.2 Adversarial Search

The primary adversarial-search methods are:

- Minimax;
    
- Alpha-Beta Pruning.
    

Minimax establishes the baseline search procedure.

Alpha-Beta Pruning is introduced to reduce unnecessary search while preserving the Minimax result under equivalent search conditions.

### 8.3 Domain-Specific Components

The project investigates:

- Pattern Detection;
    
- Candidate Move Generation.
    

Pattern Detection represents domain-specific structures used by heuristic evaluation and tactical reasoning.

Candidate Move Generation reduces the number of legal positions considered by the search algorithm by selecting moves judged to be locally or strategically relevant.

### 8.4 Search Optimizations

The planned search optimizations include:

- Move Ordering;
    
- Iterative Deepening;
    
- Transposition Table;
    
- Zobrist Hashing.
    

These techniques address different parts of the search process and must not be treated as equivalent algorithm categories.

Move Ordering changes the order in which moves are explored.

Iterative Deepening performs repeated searches with progressively greater depth.

A Transposition Table stores previously analysed positions so that duplicated search work may be reused.

Zobrist Hashing provides an efficient mechanism for generating identifiers for board positions and is primarily used to support position lookup in the Transposition Table.

### 8.5 Out of Scope

Threat-Space Search and Proof-Number Search are included in the related-work discussion because of their importance in previous Gomoku research.

They are not part of the mandatory implementation scope unless the project scope is explicitly revised later.

---

## 9. Evaluation Metrics

Metrics must be defined before experimental results are collected.

### 9.1 Search Time

searchTimeMs represents the measured execution time of a search request under a specified configuration.

Any experiment using this metric must report the measurement boundary, runtime environment, algorithm configuration, and repetition protocol.

### 9.2 Nodes Visited

nodesVisited represents the number of search nodes processed according to the instrumentation definition used by the project.

The same node-counting definition must be maintained across compared algorithms.

### 9.3 Pruning Metric

Alpha-Beta evaluation requires an explicit pruning metric.

The project may use cutoff count, skipped-child count, or another formally defined measure.

Different definitions must not be combined under a single metric name.

### 9.4 Achieved Depth

achievedDepth records the maximum fully completed search depth under the selected search configuration.

This metric becomes particularly important when Iterative Deepening and time-bounded search are introduced.

### 9.5 Candidate Count

candidateCount records the number of moves retained by Candidate Move Generation for a state.

A reduction in candidate count does not independently demonstrate correctness or better search quality. Later experiments must verify that strategically necessary moves are not incorrectly removed.

### 9.6 Evaluation Score

evaluationScore represents the numerical result produced by the selected evaluation function.

This score is an internal search quantity and must not be interpreted as gameplay strength without supporting experimental evidence.

### 9.7 Game-Level Outcomes

Bot-vs-Bot experiments record:

- wins;
    
- draws;
    
- losses.
    

The number of games, starting configurations, side assignment, algorithm configuration, and other controlled conditions must accompany any reported result.

---

## 10. Evidence Model

Every technical claim must be associated with an evidence category.

- [A] Source Evidence includes code, tests, logs, benchmarks, datasets, screenshots, CSV/JSON files, commits, and other project-generated artifacts.
    
- [B] Academic / Official Evidence includes academic papers, textbooks, specifications, and official documentation.
    
- [C] Inference represents technical reasoning derived from available evidence.
    
- [D] Recommendation represents a proposed decision or design direction that still requires implementation or experimental verification.
    

Inference must not be presented as directly observed fact.

Recommendations must not be presented as implemented behavior before corresponding source evidence exists.

Academic claims must identify their supporting sources.

Performance claims about this project must be supported by measurements produced by this project.

---

## 11. Week 01 Methodology Outputs

Week 01 establishes the contracts required for later implementation and experimentation.

The required outputs are:

- completed project proposal and research outline;
    
- Research Questions;
    
- Rule Specification version 1;
    
- Project Rule Profile;
    
- Board and GameState definition;
    
- terminology and glossary;
    
- state-space and game-tree definitions;
    
- official algorithm scope;
    
- metric definitions;
    
- primary reading list and research notes;
    
- Scope and Out-of-Scope definition.
    

The initial proposal uses React and TypeScript as the planned implementation environment, including the Core Game Engine and AI algorithms.

Week 01 does not claim that Rust or WebAssembly provides superior performance.

Any later migration from TypeScript to Rust/WebAssembly must be treated as a separate architecture decision and evaluated using appropriate correctness and performance evidence.

No programming-language performance benchmark is required during Week 01.

---

## 12. Definition of Done

Week 01 is considered complete when:

- the project proposal and research outline are complete;
    
- board size is fixed;
    
- the Rule Profile explicitly defines the winning condition, overline behavior, blocking behavior, opening behavior, and draw condition;
    
- board encoding and coordinate conventions are fixed;
    
- the logical GameState is defined;
    
- the official research scope is consistent with the approved proposal;
    
- evaluation metrics have explicit definitions;
    
- Research Questions can be addressed through later implementation or experimentation;
    
- primary academic and official sources are recorded;
    
- academic claims are traceable to supporting sources;
    
- unresolved design decisions are explicitly marked as unresolved rather than presented as facts.
    

Until the remaining Rule Profile decisions are confirmed and covered by rule fixtures, the Rule Specification should not be marked as final.

---

## 13. Reading Checklist

### 13.1 R1 — International Rules of Gomoku

The reading focuses on:

- board configuration;
    
- move rules;
    
- winning conditions;
    
- overline behavior;
    
- opening procedure.
    

R1 is used as the primary external reference for internationally documented Gomoku rules.

### 13.2 R2 — Allis, van den Herik and Huntjens

The reading focuses on:

- game variants;
    
- threat definitions;
    
- search-space characteristics;
    
- Threat-Space Search;
    
- Proof-Number Search;
    
- conclusions concerning domain-specific search knowledge.
    

R2 supports the related-work discussion and the motivation for investigating search-space reduction.

### 13.3 R3 — Allis Doctoral Thesis

Relevant sections on game solving, search methods, and Gomoku are used to provide broader theoretical context for the project.

### 13.4 Berkeley CS188

The reading focuses on:

- game trees;
    
- Minimax;
    
- branching factor;
    
- search depth;
    
- Alpha-Beta Pruning.
    

This material supports the terminology and search-complexity discussion used in Sections 7 and 8.

---

## 14. Thesis-Ready Outputs

Week 01 provides foundational material that can later be incorporated into the final thesis after evidence reconciliation.

The main reusable outputs are:

- problem statement;
    
- Research Questions;
    
- Gomoku/Caro background;
    
- rule references;
    
- Project Rule Profile;
    
- formal game definition;
    
- Board and GameState representation;
    
- state-space and game-tree discussion;
    
- related work on Gomoku search;
    
- initial algorithm scope;
    
- initial limitations.
    

These outputs are thesis-ready foundations rather than automatically final thesis text.

Later implementation and experimental evidence may require individual sections to be revised before inclusion in the final report.

## 15. Refined Report Artifacts

  

This section separates report prose from implementation and visual artifacts. The report retains the formal explanation and traceable figure references. Source code is kept in a compact artifact block for review and screenshot capture. Mermaid diagrams are represented by insertion placeholders; the rendered images should be inserted later as figures.

  

### 15.1 State-Space and Game-Tree Clarification

  

For an N × N board whose cells can independently take one of three logical values, the coarse upper bound on representable board configurations is:

  

3^(N²)

  

For the selected 15 × 15 board:

  

N = 15

N² = 225

3^(N²) = 3^225

  

This is a representational upper bound, not the exact number of legal game states. It includes configurations that cannot arise from valid turn sequences, terminal-state restrictions, or the selected Rule Profile.

  

If b is the average branching factor and m is the search depth in ply, a uniform game tree contains approximately:

  

1 + b + b² + ... + b^m = (b^(m+1) − 1) / (b − 1), for b ≠ 1

  

The dominant growth term is O(b^m). This explains why unrestricted full-width Minimax becomes expensive as search depth increases and motivates Candidate Move Generation, Alpha-Beta Pruning, Move Ordering, Transposition Tables, and Iterative Deepening.

  

### 15.2 Figure Placeholders

  

[FIGURE PLACEHOLDER — Figure 1. Core Game Process]

Insert the rendered Mermaid image here.

Note: Keep the figure caption and cite the related prose in Sections 5.1–5.4. Do not paste Mermaid source into the report body.

  

[FIGURE PLACEHOLDER — Figure 2. AI Search Process]

Insert the rendered Mermaid image here.

Note: Keep the figure caption and cite the related prose in Sections 5.5–5.7. Do not paste Mermaid source into the report body.

  

[FIGURE PLACEHOLDER — Figure 3. Week 01 Dependency Overview]

Insert the rendered Mermaid image here.

Note: Use this figure only if the dependency relationship improves the explanation. Otherwise, omit the figure and retain the prose.

  

### 15.3 Code Artifact for Screenshot

  

The following compact TypeScript contract is provided as a separate implementation artifact. It is intentionally kept outside the academic prose so that it can be captured as a readable screenshot or moved to an appendix.

  

```ts

type Player = 0 | 1 | -1;

type GameStatus = "PLAYING" | "WON" | "DRAW";

  

interface Move {

  row: number;

  col: number;

}

  

interface RuleProfile {

  boardSize: number;

  winLength: number;

  exactFive: boolean;

  overlineWins: boolean;

  blockedFiveWins: boolean;

  swap2Enabled: boolean;

}

  

interface GameState {

  board: Player[][];

  currentPlayer: Exclude<Player, 0>;

  status: GameStatus;

  winner: Exclude<Player, 0> | null;

  moveCount: number;

  lastMove: Move | null;

}

  

interface SearchConfig {

  maxDepth: number;

  timeLimitMs?: number;

  useAlphaBeta: boolean;

  useCandidateGeneration: boolean;

}

  

interface SearchResult {

  move: Move | null;

  evaluationScore: number;

  achievedDepth: number;

  nodesVisited: number;

  searchTimeMs: number;

}

  

function applyMove(

  state: GameState,

  move: Move,

  rules: RuleProfile,

): GameState;

  

function searchBestMove(

  state: GameState,

  rules: RuleProfile,

  config: SearchConfig,

): SearchResult;

```

  

Screenshot note: capture the code block at a readable zoom level, with the heading “Code Artifact for Screenshot” visible. The block is a contract summary, not evidence that these functions have already been implemented.

  

### 15.4 Evidence Boundary

  

The report distinguishes three states:

  

• Source evidence: implementation, tests, logs, benchmarks, datasets, or screenshots that have been produced by the project.

• Academic or official evidence: papers, specifications, textbooks, and official documentation.

• Inference or recommendation: a reasoned conclusion or proposed design that still requires implementation or experimental verification.

  

Accordingly, the TypeScript block above is a specification artifact unless a corresponding repository implementation and test evidence are cited. The figure placeholders are layout instructions until the rendered images are inserted.

  

### References

  

[R1] Renju International Federation. “International Rules of Gomoku.” RenjuNet. https://gomoku.renju.net/gomokurules/

  

[R2] Allis, L. V., van den Herik, H. J., and Huntjens, M. P. “Go-Moku Solved by New Search Techniques.” AAAI Fall Symposium Technical Report FS-93-02, 1993. https://cdn.aaai.org/Symposia/Fall/1993/FS-93-02/FS93-02-001.pdf

  

[R3] Allis, L. V. Searching for Solutions in Games and Artificial Intelligence. Doctoral Thesis, Rijksuniversiteit Limburg, 1994. https://cris.maastrichtuniversity.nl/ws/portalfiles/portal/588458/guid-36b5cf0a-cf06-4602-afdb-1af04d65c23b-ASSET1.0.pdf

  

[R4] Berkeley CS188. “Adversarial Search.” https://inst.eecs.berkeley.edu/~cs188/fa23/assets/notes/cs188-fa23-note06.pdf

