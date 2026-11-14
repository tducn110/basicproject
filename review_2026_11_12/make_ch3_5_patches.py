import json
import re
from pathlib import Path

BASE = Path('/home/pro/Downloads/vnuk/basicProject/review_2026_11_12')
paragraphs = {p['start']: p for p in json.loads((BASE / 'paragraphs.json').read_text())}
patches = []

def replace(start, new, reason, *evidence):
    p = paragraphs[start]
    old = p['text'].removesuffix('\n')
    assert old != new
    new = re.sub(r'\. (\[\d+\](?:, \[\d+\])*)\.', r' \1.', new)
    new = new.replace('centre', 'center').replace('neighbourhood', 'neighborhood')
    patches.append(dict(start=start, old=old, new=new, reason=reason, evidence=list(evidence)))

replace(78055,
    'The primary actor is the player, who can choose local two-player play or a computer opponent. The AI service receives a board snapshot and proposes a move. Host integration supplies lifecycle signals such as pause and resume. GameController validates the resulting actions and owns the accepted transitions of the application state. [2], [22].',
    'Replace conversational ownership contrast with a direct actor description.',
    'CaroGame/src/App.tsx:handleCellClick', 'CaroGame/src/app/GameController.ts:playCell/startAiTurn')
replace(80324,
    'Display the thinking state, available strategy and source labels, measured counters and elapsed-time scope, or a recoverable error. Provide the implemented retry action. Represent unavailable measurements explicitly.',
    'Use functional-requirement language and remove chatbot-style instruction.',
    'CaroGame/src/components/SearchFeedback.tsx', 'CaroGame/src/app/GameController.ts:retryAiTurn')
replace(81355,
    'Controller actions define the state changes behind these requirements. Replay and New Game both clear the board, but Replay can continue directly in the playing phase, whereas New Game enters setup. Undo also clears search feedback so that the interface reflects the restored board. [2], [23].',
    'State actual behaviour without review-process narration.',
    'CaroGame/src/app/GameController.ts:replay/newGame/undo', 'CaroGame/src/game/behaviors/match/MatchController.ts')
replace(81789,
    'The following design criteria connect the functional requirements to the state transitions and output fields evaluated in Chapter 5.',
    'Remove acceptance-status narration from the report body.',
    'CaroGame/src/app/GameController.ts', 'CaroGame/tests/game/controller-lifecycle.test.ts')
replace(82051,
    'F01: Mode and difficulty selection clear the previous board and AI feedback, invalidate pending AI work and establish the selected configuration. Subsequent AI requests carry the selected difficulty. F02: A legal cell is an integer row and column from 0 to 14 and must be empty. The controller checks pause, match phase and AI-turn availability; the domain move operation checks occupancy and numeric bounds. The pointer route obtains integer indices with Math.floor, and the WASM result adapter independently checks Number.isInteger and bounds. Direct-call validation limits are addressed in Chapter 6.',
    'Correct the false claim that all entry paths already enforce integer indices; retain actual route ownership.',
    'CaroGame/src/game/core/BoardBounds.ts:isBoardCell', 'CaroGame/src/board/spatial/CoordinateTransform.ts:screenToCell', 'CaroGame/src/game/wasm/executeSearch.ts:readMoveResult')
replace(82817,
    'F03: The four-axis Freestyle rule accepts a line of at least five stones, including an overline. The controller evaluates a win before a full-board draw. F04: Undo reverses one local two-player move or the applicable human–AI pair and restores the turn and match phase. Replay and New Game clear board state and invalidate pending work. F05: Only a result applicable to the active AI turn and round can be committed. F06: Feedback exposes the pending state, the returned result or a recoverable error; counters and durations retain the source and measurement scope of the route that produced them.',
    'Replace repeated test imperatives with concise source-backed design criteria.',
    'CaroGame/src/game/core/WinRules.ts:FreestyleGomokuWinRule', 'CaroGame/src/app/GameController.ts:finishMove/undo/startAiTurn')
replace(83601,
    'F07: Board redraw and viewport fitting use the current controller snapshot and camera transform. F08: The host adapter maps supported locale and pause/resume signals into application state; standalone initialization remains available when no SDK is supplied. F09: The separate presentation application provides figures, algorithm explanations and executable Python examples.',
    'Describe implemented boundaries; consolidate unexecuted platform validation in the final limitations.',
    'CaroGame/src/pixi/CaroScene.ts', 'CaroGame/src/integrations/wink/useWinkIntegration.ts', 'present/src/App.tsx')
replace(84065,
    'Search comparisons hold the position, rules, root perspective, depth, evaluation and candidate membership constant. Minimax and Alpha-Beta should then return the same root value; equally valued moves may differ with traversal order. The recorded native corpus contains 408 paired comparisons and 820 root-restoration checks. Separate Node/WASM tests exercise the copied binary, controller tests exercise asynchronous guards, and browser records exercise the Worker and selected UI interactions. Chapter 5 reports these results by environment.',
    'Separate native, binary, mocked controller and real-browser evidence; remove unsupported end-to-end coverage claim.',
    'research/current_2026_10_23/engine_verification.json', 'CaroGame/tests/game/controller-lifecycle.test.ts', 'CaroGame/tests/game/wasm-runtime.test.ts', 'research/current_2026_10_23/G4_real_browser_worker.json')
replace(85166,
    'The Rust/WASM route runs inside a dedicated Web Worker, separating its synchronous search from the main thread that handles React and Pixi. Cancellation terminates the Worker, while controller guards determine whether a completed response still belongs to the active turn. Easy and Normal use Rust baseline policies; the four higher tiers use fixed-depth Alpha-Beta unless the TypeScript tactical resolver supplies an immediate move.',
    'Remove universal responsiveness and deterministic cancellation assertions; Easy/Normal do not expand multi-ply search trees.',
    'CaroGame/src/game/ai/AIController.ts:requestMove', 'CaroGame/src/game/wasm/GomokuWasmEngine.ts:cancelPending', 'CaroGame/src/game/wasm/contracts.ts:WASM_CONFIGURED_DEPTHS')
replace(86101,
    'The scene emits a cell event through the callback supplied by the React application, which calls GameController.playCell. The controller updates domain state and publishes a snapshot. React then passes stones, the last move and winning cells to the scene for rendering. AI requests use copied history, and returned moves re-enter the controller and domain validation path before becoming visible board state.',
    'Align prose with the actual React callback wiring and Figure 3.1.',
    'CaroGame/src/App.tsx:handleCellClick', 'CaroGame/src/pixi/CaroGameCanvas.tsx', 'CaroGame/src/app/GameController.ts')
replace(87166,
    'A Web Worker executes independently of the main interface script [25]. GomokuWasmEngine owns the Worker object, transport identifiers and pending promises. GameController owns turn validity. Resource cancellation stops obsolete Worker execution, and the controller token also rejects a response that resolved before cancellation reached it. [2], [26].',
    'Keep standard and project responsibilities while removing repetitive audit framing.',
    'CaroGame/src/game/wasm/GomokuWasmEngine.ts', 'CaroGame/src/app/GameController.ts:startAiTurn/invalidateAiTurn', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers')
replace(88283,
    'The board has N = 15 and N² = 225 cells. Frontend coordinates are (row, column); Rust uses (x, y), where x = column and y = row. A row-major linear index is row × N + column. The pointer transform applies floor before checking board bounds. The WASM result adapter checks integer coordinates and bounds before converting them to a frontend cell. [27], [29].',
    'Preserve the complete coordinate contract and move direct-call remediation to final limitations.',
    'CaroGame/src/game/core/BoardBounds.ts', 'CaroGame/src/board/spatial/CoordinateTransform.ts', 'CaroGame/src/game/wasm/executeSearch.ts')
replace(88994,
    'The playMove operation checks bounds and occupancy, commits an accepted move to cells and history, and evaluates the supplied win rule. GameController supplies the current player and checks pause, phase and AI-turn availability. Geometric win detection remains in the rule object, while match and request lifecycle checks remain in the controller. [2], [28].',
    'Use direct technical prose and exact responsibility boundaries.',
    'CaroGame/src/game/behaviors/move/PlayMove.ts:playMove', 'CaroGame/src/app/GameController.ts:playCell')
replace(90554,
    'New Game increments the round identifier and enters setup. Selecting a mode or difficulty clears the previous game and enters ready. Replay enters playing when the previous phase is playing or game-over. Undo calls resumeAfterUndo, increments the round identifier and chooses playing if moves remain, otherwise ready.',
    'Standardize UI action names and remove instructional commentary.',
    'CaroGame/src/game/behaviors/match/MatchController.ts', 'CaroGame/src/app/GameController.ts')
replace(91026,
    'Pause is independent of match phase. Pausing preserves the board and phase, blocks input and invalidates the active AI request. On resume, the controller starts a new AI request only if the match is still playing in AI mode and O still owns the turn. [2].',
    'Remove hypothetical implementation failure and state the existing pause contract.',
    'CaroGame/src/app/GameController.ts:setPaused')
replace(93624,
    'A caught error changes feedback only while its captured turn token remains current. GomokuWasmEngine ignores messages from a Worker that is no longer active and ignores envelope identifiers absent from its pending map. Together, these checks keep an obsolete completion or rejection from replacing the current turn’s feedback.',
    'Remove open-ended verification narration while retaining the actual guards.',
    'CaroGame/src/app/GameController.ts:startAiTurn', 'CaroGame/src/game/wasm/GomokuWasmEngine.ts:createWorker')
replace(95372,
    'BoardInputController uses idle, pressed and dragging states, with a drag threshold of six scene screen units. Pointer-down records the current position. Pointer-move measures displacement from the previous event; a displacement greater than the threshold changes pressed to dragging and produces a pan delta. Pointer-up emits a cell tap only while the state is still pressed and the resolved cell is in bounds. [30].',
    'Describe the real per-event threshold without conversational warnings; cumulative-drag improvement goes to Chapter 6.',
    'CaroGame/src/board/input/BoardInputController.ts')
replace(96055,
    'CaroScene handles pointer-up outside the stage through the same release handler and suppresses pointer processing while paused. It fits the board using the smaller width and height scale ratios, with reduced padding below a viewport width of 500. Camera translation and scale are applied to the world container, leaving domain coordinates unchanged. [24].',
    'State implemented geometry directly and consolidate physical-device limits at the end.',
    'CaroGame/src/pixi/CaroScene.ts:setupInteraction/fitBoardToViewport')
replace(96610,
    'The Rust result validator requires in-bounds integer x and y coordinates, a finite score, matching difficulty, a recognized strategy and nonnegative safe-integer counters. The counters report visited nodes, leaf evaluations, cutoffs, ordering evaluations, generated candidates and completed depth. A coordinate-only result or another incompatible payload raises a contract error. [9], [27].',
    'Remove judgmental anti-fabrication language and describe the schema.',
    'CaroGame/src/game/wasm/executeSearch.ts:readMoveResult')
replace(97765,
    'Configured depth describes the requested policy; completed depth is returned telemetry. Candidate selection, terminal states and the selected strategy determine the work represented by that result. The interface therefore presents depth alongside strategy, source and counters rather than using a difficulty label as a measurement.',
    'Replace repeated proof caveats with a concise distinction between configuration and output.',
    'CaroGame/src/game/wasm/contracts.ts', 'CaroGame/src/components/SearchFeedback.tsx')
replace(99770,
    'Scenarios S01–S10 cover legal state changes, stale-response rejection, error recovery, pause/resume, resizing and response validation. The test and browser results in Chapter 5 are organized around these module boundaries and their recorded environments.',
    'Remove acceptance-status boilerplate while preserving the design-to-evaluation link.',
    'CaroGame/tests/game/controller-lifecycle.test.ts', 'CaroGame/tests/game/worker-lifecycle.test.ts', 'CaroGame/tests/pixi/scene.test.ts')
replace(100118,
    'The application declares React 19, React DOM, PixiJS 7.4, TypeScript, Vite, Vitest and i18next. Its scripts provide development serving, production build, preview, formatting, static typechecking and automated tests. The frontend package-lock.json and the Rust Cargo.lock files record resolved dependency versions for their respective packages. [31].',
    'Lockfiles record versions but alone do not enforce deterministic builds across every workspace.',
    'CaroGame/package.json', 'CaroGame/package-lock.json', 'research/current_2026_10_23/baseline_engine/Cargo.lock')
replace(101023,
    'This organization keeps domain state and rules independent of React components and Pixi objects. AI modules use domain history as input, and rendering modules receive state-derived drawing data. The resulting boundaries also support focused tests of moves, controller lifecycle and coordinate mapping. [24], [31], [32].',
    'Remove promotional phrasing and duplicate folder recital; explain the useful dependency boundary.',
    'CaroGame/src/game/core/GameState.ts', 'CaroGame/src/app/GameController.ts', 'CaroGame/src/pixi/CaroScene.ts')
replace(101332,
    'GameController.playCell first rejects paused input. From setup or ready it calls startRound, then checks whether the match has ended or the AI owns the turn. It delegates cell validation and placement to playMove. A rejected domain move returns immediately; an accepted move proceeds to outcome handling, player selection and subscriber notification. The controller starts an AI request only while the match remains playing in AI mode with O to move. Chapter 6 discusses the ordering of the initial phase transition and cell validation. [2], [28].',
    'Keep the exact startRound-before-validation sequence and move remediation out of implementation narration.',
    'CaroGame/src/app/GameController.ts:playCell', 'CaroGame/src/game/behaviors/move/PlayMove.ts')
replace(104080,
    'GomokuWasmEngine creates a module Worker lazily, registers a pending promise under a transport identifier and posts a search message. worker.ts initializes the generated module and calls executeWasmSearch. The same adapter is used by the binary tests, so both routes share coordinate and telemetry conversion. A returned envelope resolves its matching promise, while a structured error rejects it. [27], [33].',
    'Describe implemented reuse directly; retain browser-specific evidence in Chapter 5.',
    'CaroGame/src/game/wasm/GomokuWasmEngine.ts', 'CaroGame/src/game/wasm/worker.ts', 'CaroGame/src/game/wasm/executeSearch.ts')
replace(105238,
    'The generated package contains JavaScript bindings, TypeScript declarations and the WebAssembly binary loaded by the Worker. The corresponding Rust code implements the search algorithms; the bindings expose their interface to JavaScript. The recorded binary hash identifies the package used for the parity and browser observations, and Appendix B lists the source and build records associated with that implementation. [6], [7], [34].',
    'Remove repeated missing-source/rebuild commentary; retain binary/source role distinction and provenance.',
    'CaroGame/src/game/wasm/engine/package.json', 'research/current_2026_10_23/provenance.json', 'gomoku-main/engine/src/lib.rs')
replace(106393,
    'GridRenderer draws board geometry, StoneRenderer maps player/cell records to pieces, and HighlightRenderer draws the last move and winning cells. Input passes through BoardInputController and BoardCoordinateTransform before the scene reports a cell event. This separation allows coordinate and bounds tests to run independently of domain win-rule tests.',
    'Remove repeated statement about tests not proving browser output.',
    'CaroGame/src/board/render', 'CaroGame/src/board/input/BoardInputController.ts', 'CaroGame/src/board/spatial/CoordinateTransform.ts')
replace(106956,
    'The React application subscribes to controller snapshots, wires controls to controller actions and passes board state to CaroGameCanvas. The canvas component owns the scene, resize observer and synchronization effects. On unmount it disconnects the observer and destroys the scene; scene destruction unsubscribes the camera and destroys the Pixi application and children. The controller separately disposes its AI service and Worker resources. [22], [24], [26].',
    'Specify exact teardown owners, including ResizeObserver, instead of vague component ownership.',
    'CaroGame/src/App.tsx', 'CaroGame/src/pixi/CaroGameCanvas.tsx', 'CaroGame/src/pixi/CaroScene.ts:destroy', 'CaroGame/src/app/GameController.ts:destroy')
replace(108638,
    'The presentation uses tree animations, diagrams and figures to explain the algorithms. Quantitative examples are associated with the original JSON or CSV datasets described in Chapter 5. The Python snippets retain their own inputs and weights so that each calculation can be read and executed as a self-contained teaching example.',
    'Replace review-process advice with a description of the presentation artifact.',
    'present/src/components/PythonVisualizer.tsx', 'present/src/utils/figureRegistry.ts')
replace(109207,
    'InteractiveCaroBoard uses the presentation application’s own utility engine and state. It lets readers explore move selection within the presentation site. The game application continues to use its separate GameController and Rust/WASM Worker route. Historical component diagrams are retained as development illustrations and are distinguished from the current architecture in Figure 3.1.',
    'Remove inventory/audit narration and keep explicit implementation identity.',
    'present/src/components/InteractiveCaroBoard.tsx', 'present/src/utils/caroEngine.ts', 'CaroGame/src/app/GameController.ts')
replace(110365,
    'The runner caches the initialized Pyodide instance and queues callers while initialization is in progress. It redirects stdout and stderr into the output panel, reports package-loading progress and executes the selected code asynchronously. The four supplied programs cover horizontal patterns, weighted feature scoring, candidate geometry and arithmetic on an embedded benchmark summary.',
    'Move loader failure-recovery limitations to Chapter 6 and describe the implemented instructional workflow.',
    'present/src/utils/pyodideRunner.ts:getPyodide/executePythonCode', 'present/src/components/PythonVisualizer.tsx')
replace(110942,
    'The first program constructs a 15 × 15 board using NumPy, with a pure-Python fallback. It places four X stones horizontally and three O stones vertically. detect_patterns scans rows, counts maximal contiguous runs and classifies five, open four, closed four, open three and closed three from their endpoints. For X, the supplied board produces one horizontal open four. [38].',
    'Correct NumPy-only description and remove unsupported four-axis/seven-pattern scope from the explanation.',
    'present/src/components/PythonVisualizer.tsx:sampleScripts[0]')
replace(111512,
    'The input is an integer board matrix and a selected player; the output is a dictionary of horizontal pattern counts. Advancing from the beginning to the end of each run counts it once. Endpoint checks distinguish open and closed runs without leaving the board. Broken patterns such as XX.XX require a gap-aware detector beyond this contiguous-run example.',
    'Use direct algorithm explanation and preserve the actual horizontal/gap boundary.',
    'present/src/components/PythonVisualizer.tsx:detect_patterns')
replace(112517,
    'The calculation separates attacking features from weighted opponent threats. Its input consists of two feature-count dictionaries, a weight dictionary and a defensive multiplier of 1.2. A negative score means the weighted formula favors the opponent in that example. Forced wins and terminal utility are handled separately in the search models described in Chapter 2.',
    'Standardize academic voice and explicitly identify the multiplier.',
    'present/src/components/PythonVisualizer.tsx:evaluate_position')
replace(113620,
    'The candidate set is the union of the clipped radius-two neighborhoods around the five stones. A set removes duplicates where neighborhoods overlap, and occupied cells are excluded. The resulting count describes candidate membership for this board; the search experiments in Chapter 5 evaluate the effects of candidate policies on search work and tactical choices.',
    'Replace a sequence of negative caveats with a precise description of the example.',
    'present/src/components/PythonVisualizer.tsx:simulate_chebyshev_pruning')
replace(114105,
    'The fourth program calculates a win percentage and a frame-budget ratio from embedded constants, including 42.24 µs per move. It formats a pre-entered summary rather than executing a tournament or loading the battle JSON. The archived 100-game dataset reports 251.26 µs per decision; Section 5.6 distinguishes that measured value from the snippet’s constant. [38], [40].',
    'Keep the documented numerical discrepancy explicit and remove chatty evidentiary narration.',
    'present/src/components/PythonVisualizer.tsx:sampleScripts[3]', 'benchmark/results/week4_bot_battle.json')
replace(114590,
    'The ratio uses a nominal 16.67 ms interval for 60 Hz: 42.24 µs / 16,670 µs × 100 ≈ 0.253%. This is arithmetic on the snippet’s constants. Browser frame presentation also includes rendering, scheduling and communication, which are outside this calculation.',
    'Give the actual arithmetic and measurement scope without an unsupported frame-rate claim.',
    'present/src/components/PythonVisualizer.tsx:sampleScripts[3]')
replace(115632,
    'The application, presentation and native experiment harnesses expose the main implementation paths described in this chapter. The generated package and recorded hashes identify the binary used for the archived Node and browser runs. Appendix B maps these artifacts to their roles; Chapter 5 presents the measured results, and Chapter 6 collects remaining source-publication and validation work.',
    'Consolidate reproducibility gaps at the end while preserving artifact traceability.',
    'research/current_2026_10_23/provenance.json', 'research/week_05_09/results/provenance.json')
replace(116309,
    'The evaluation asks four questions: whether the game and search preserve board state on the tested positions; whether Alpha-Beta agrees with Minimax on the same selected tree; how candidate selection, ordering and transposition-table reuse affect work and results; and how the actual Worker and interface behave in the recorded browser interactions. Native, Node/WASM and browser results are reported separately because they exercise different boundaries.',
    'Remove formulaic repeated question scaffolding and retain the evaluation design.',
    'research/current_2026_10_23/engine_verification.json', 'research/current_2026_10_23/wasm_ts_parity.json', 'research/week_05_09/results/verification.json')
replace(116911,
    'The application source examined for this report is tducn110/basicproject at commit 7e1e2d51321a4e6b2e26493c34f0a485d4de39cc. The current-engine measurements were recorded on 23 October 2026, and the separate reference measurements on 17 October 2026. The research directories contain raw CSV/JSON results, harnesses, provenance and source excerpts. A local follow-up on 12 November reproduced all non-timing fields in the 816 current-engine and 544 reference measurement rows using source files matching the archived hashes; the tables below retain the original timings. [1], [41], [42].',
    'Remove duplicated artifact inventory and distinguish current rerun from historical timing observations.',
    'review_2026_11_12/source_hash_comparison.json', 'review_2026_11_12/rerun_comparison.json', 'review_2026_11_12/logs/engine-harness.log', 'review_2026_11_12/logs/reference-harness.log')
replace(117506,
    'Native experiments exercise board and search algorithms. Node/WASM parity tests load the copied binary and adapter. The headless-browser Worker experiment includes actual message transport, while the UI experiment includes React, Pixi and synthetic pointer input. Weekly reports and presentation examples supply explanatory and historical material. For each result, the discussion identifies the implementation, configuration, measurement scope and recorded environment.',
    'Replace source-hash admonitions with a readable evaluation-method description.',
    'research/current_2026_10_23/provenance.json', 'research/current_2026_10_23/wasm_ts_parity.json', 'research/current_2026_10_23/G4_real_browser_worker.json', 'research/current_2026_10_23/G5_browser_ui.json')
replace(118277,
    'The 23 October native verification used four controlled positions and sixteen seeded positions, with three timing repeats for the controlled configurations. It recorded 816 measurement rows, 408 Minimax/Alpha-Beta comparison pairs, 408 ordering-value comparison pairs and 820 root-restoration checks. The corpus also included 84 candidate configurations, 12 tactical-completion retention checks, four terminal checks and 225 native address-offset checks. All recorded assertions passed. These totals include repeated configurations; they are not counts of distinct board positions. [43], [44].',
    'Clarify finite corpus and repeated-pair counts; remove implied general algorithmic correctness.',
    'research/current_2026_10_23/engine_verification.json', 'gomoku-main/engine/examples/current_evidence.rs:matrix')
replace(118923,
    'Recursive search temporarily places a candidate, evaluates the child and undoes the move. The harness compares the resulting board with the saved root after each measured call. All 820 recorded restoration checks passed, and the 12 November rerun reproduced the same restoration outcomes. [6], [43].',
    'Scope the restoration conclusion to executed checks instead of asserting all recursive calls leave every possible root intact.',
    'gomoku-main/engine/src/search.rs', 'gomoku-main/engine/examples/current_evidence.rs:record_search', 'review_2026_11_12/engine-rerun/engine_verification.json')
replace(120165,
    'Relative to Minimax, unordered Alpha-Beta visits 35.62% fewer nodes: (73 − 47)/73. Ordered Alpha-Beta visits 64.38% fewer: (73 − 26)/73. Ordering reduces the Alpha-Beta count from 47 to 26, or 44.68%, and the ordered median is 44.97% below the Minimax median. Both Alpha-Beta configurations perform 264 ranking evaluations, so recursive node counts capture only part of the work. These percentages describe the selected centre fixture and configuration. [42].',
    'Remove duplicated conclusions and keep fixture-specific node/time calculations with ranking cost.',
    'research/current_2026_10_23/engine_search_summary.csv:center depth2 radius2 cap8')
replace(121661,
    'The Node parity run loaded the copied WebAssembly binary through synchronous initialization and used the application’s executeWasmSearch adapter. Its eight multi-move fixtures contained 291 total plies. Every recorded move, board-state hash and terminal outcome agreed with the TypeScript model. The ongoing-state next player also agreed; terminal records preserve a representation difference, because Rust flips to the next player while TypeScript retains the last mover. Coordinates follow x = column, y = row and index = row × 15 + column. The binary SHA-256 was 1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989. [45].',
    'Preserve all observed parity outcomes while removing inflated 100%-equivalence rhetoric.',
    'research/current_2026_10_23/wasm_ts_parity.json', 'CaroGame/tests/game/wasm-runtime.test.ts')
replace(122644,
    'The Worker run used Headless Chrome 155 on Linux and the same recorded binary hash. The fixture contained X at (row 7, column 7) and (8, 7), and O at (7, 8) and (8, 8). All six difficulty requests returned legal moves with source rust. Hard, Very Hard, Expert and Master reported depths 2, 3, 4 and 5, with 47, 252, 551 and 1,418 nodes respectively. Worker elapsed time included hydration, search and cleanup: Master recorded 3.0 ms, with about 3.3 ms round trip. Easy recorded 1.8 ms Worker elapsed and 84 ms round trip, illustrating the additional module, message and scheduling costs outside the adapter timer. [46].',
    'Correct sub-4 ms engine-search claim: elapsedScope includes hydration/free and the run covers one fixture.',
    'research/current_2026_10_23/G4_real_browser_worker.json', 'CaroGame/src/game/wasm/executeSearch.ts')
replace(123603,
    'The UI record used a 1280 × 800 headless browser with actual React, Pixi input, DOM-dispatched PointerEvents and the Rust Worker. It exposed all six difficulty labels and displayed a depth-two result with 61 nodes and 13 cutoffs. After Undo, the details panel was removed and the Undo control was disabled; neither observation contained an alert. Controller and component tests separately assert that Undo removes a completed human–AI pair and clears its feedback. [47].',
    'Separate observed browser output from mocked test assertions and avoid stronger two-ply state claim from UI artifact alone.',
    'research/current_2026_10_23/G5_browser_ui.json', 'CaroGame/tests/game/controller-lifecycle.test.ts', 'CaroGame/tests/game/app-controls.test.tsx')
replace(124209,
    'The evidence therefore covers native search comparisons, six Rust Worker requests on one browser fixture and a browser move/feedback/Undo interaction. These later result records extend the earlier gate ledger, whose G3–G5 entries were still pending or partial when it was written. The evaluation uses the dated result artifacts for each observation. [41], [43], [46], [47].',
    'Resolve ledger chronology without promoting finite observations to universal correctness or full gate acceptance.',
    'research/current_2026_10_23/GATES.md', 'research/current_2026_10_23/engine_verification.json', 'research/current_2026_10_23/G5_browser_ui.json')
replace(124731,
    '5.3.1 Follow-up application validation',
    'Accommodate the current November rerun alongside the historical October record.',
    'report_caro_2026/verification_2026_10_27.json', 'review_2026_11_12/logs/app-test.log')
replace(124788,
    'The 27 October local validation recorded nine Vitest files and 59 passing tests, a successful TypeScript --noEmit check and a successful production build under Node 24.22.1. The same checks passed again on 12 November under Node 22.23.3, using the current application at commit 7e1e2d5 and Vite 8.3.1. The build emitted a 111.58 kB WebAssembly asset, or 34.14 kB with gzip. The separate presentation package also passed its TypeScript check and Vite 8.3.5 production build using an isolated locked dependency installation.',
    'Add actually executed current checks and remove unsupported fast-hydration inference from compressed file size.',
    'report_caro_2026/verification_2026_10_27.json', 'review_2026_11_12/logs/app-test.log', 'review_2026_11_12/logs/app-typecheck.log', 'review_2026_11_12/logs/app-build.log', 'review_2026_11_12/logs/present-build-isolated.log')
replace(125349,
    'The 27 October browser record covers viewports of 1365 × 900 and 390 × 844. A synthetic pointer event at the canvas centre was followed by a Hard response and visible search telemetry. These observations document the displayed layout and interaction at the two recorded viewport sizes.',
    'Retain actual viewport observations and remove generalized responsive/mobile correctness claim.',
    'report_caro_2026/verification_2026_10_27.json:browser_screenshot')
replace(125773,
    'The 17 October native reference experiment uses caro-core-reference to study Minimax, Alpha-Beta, candidate selection, ordering, Zobrist hashing, a transposition table and a node budget. This library and harness are separate from the application’s Rust/WASM Worker route. The local 12 November rerun used reference and harness files whose hashes matched the archived provenance and reproduced all 544 recorded rows in their non-timing fields. Appendix B identifies the corresponding artifacts. [8].',
    'Replace obsolete blanket missing-source implication with current matched-local-source rerun, keeping implementation identity.',
    'research/week_05_09/Cargo.toml', 'research/week_05_09/results/provenance.json', 'review_2026_11_12/source_hash_comparison.json', 'review_2026_11_12/rerun_comparison.json')
replace(126884,
    'The matrix compared all legal moves and uncapped radius-one candidates at depths one and two; radius-one candidates capped at twelve at depths one through three; and radius-one candidates capped at eight at depth four. It included Minimax, Alpha-Beta with and without ordering, and optimized search with a fresh table. The dataset contains 544 measurement rows and 224 summary rows. Two additional cap-loss calls bring the verification total to 546 search/assertion calls. The harness also records 551 restorations, 112 Minimax/Alpha-Beta pairs, 112 ordering-value pairs and 208 cold-table value pairs, including repeated configurations. [8].',
    'Clarify calls versus CSV rows and avoid counting repeated pairs as independent boards.',
    'research/week_05_09/src/main.rs', 'research/week_05_09/results/verification.json', 'research/week_05_09/results/provenance.json')
replace(127630,
    'For clustered with all legal moves, depth two and natural order, both algorithms return score 0 and best move (row 6, column 7). Minimax records 48,842 nodes, 48,620 leaves and a median of 69,252 µs. Alpha-Beta records 10,939 nodes, 10,717 leaves, 218 cutoffs and a median of 16,442 µs across three repeats. The node reduction is 77.60%, and the ratio of the recorded medians is 4.21. These figures describe the same 221-move root and depth-two tree. [48].',
    'Remove repeated speedup rhetoric; preserve paired value, tree and measured timing ratio.',
    'research/week_05_09/results/search_summary.csv:clustered all_legal depth2 ordering=false')
replace(130101,
    'The 23 October engine uses a different candidate policy, with a soft cap that retains immediate tactical completions. Its record includes twelve tactical-completion retention checks. The reference counterexample and the later retention checks therefore describe different policies. A controlled comparison must keep candidate membership fixed before attributing a change in work to ordering or Alpha-Beta pruning.',
    'Keep the real implementation distinction and move proposed ablation experiments to future work.',
    'gomoku-main/engine/src/candidates.rs:select_candidates', 'research/current_2026_10_23/engine_verification.json', 'research/week_05_09/results/cap_loss.json')
replace(132498,
    'A historical benchmark compares a native Rust reference harness with a TypeScript harness running in Node on one midgame fixture at depths one through four. At depth two, both record score 19,990, 609 nodes and 39 cutoffs; the times are 0.3125 ms for Rust and 5.5795 ms for TypeScript. At depth four, both record score 9,999,997, 496,790 nodes and 16,350 cutoffs, with times of 285.4517 ms and 5,083.4518 ms. The matching scores and counters establish agreement for these recorded runs. [51].',
    'Replace full algorithmic parity claim with the agreement actually shown by one-fixture records.',
    'benchmark/results/benchmark_data.json', 'benchmark/rust_bench/src/main.rs', 'benchmark/ts_bench/benchmark.ts')
replace(133493,
    'Across the four depths, the recorded native-to-Node time ratios range from 17.4 to 24.4. Both harnesses report matching node counts, cutoff counts and scores on this fixture. The comparison describes these two implementations and runtime environments; the application’s WebAssembly execution is evaluated separately in Section 5.3. [51].',
    'Remove unsupported language-wide or Rust-to-WASM computational-advantage inference.',
    'benchmark/results/benchmark_data.json', 'benchmark/rust_bench/src/main.rs', 'benchmark/ts_bench/benchmark.ts')
replace(133965,
    'The Week 4 native battle dataset records 100 Rule-Based wins against Random, zero Random wins and zero draws, averaging 9.90 plies per game. It reports 251.26 µs per decision, 220.21 empty cells and 60.80 candidates on average. The ratio of the two mean cell counts gives a 72.39% reduction in candidate membership. Seven separate pattern fixtures are marked PASS in the same dataset. [40].',
    'Separate candidate-count arithmetic from tactical fixture outcomes and avoid a search-wide branching guarantee.',
    'benchmark/results/week4_bot_battle.json')
replace(134475,
    'The presentation application combines explanatory components, a figure inspector and a Python visualizer. Its horizontal pattern scanner, demonstration weights and five-stone Chebyshev example illustrate distinct parts of the algorithms. Their inputs and outputs are described in Section 4.6 and remain separate from the game Worker measurements. [38].',
    'Remove repeated code-review criticism while retaining accurate pedagogical scope.',
    'present/src/components/PythonVisualizer.tsx', 'present/src/utils/figureRegistry.ts')
replace(135160,
    'The empirical-analysis snippet contains the constant 42.24 µs, whereas the battle JSON records 251.26 µs per decision. The report uses the dataset value for the Week 4 result. Ratios against a nominal 16.67 ms interval explain units and budgets; they do not measure browser frame presentation. Figures derived from these constants are treated as instructional illustrations. [38], [40], [51].',
    'Resolve source conflict explicitly and retain only source-supported benchmark value.',
    'present/src/components/PythonVisualizer.tsx:sampleScripts[3]', 'benchmark/results/week4_bot_battle.json')
replace(137127,
    'Reproducibility and provenance. The repository supplies raw measurements, harnesses, source excerpts and binary hashes. The 12 November follow-up matched 36 available engine, reference, harness and lock files to their archived hashes and reproduced the non-timing search results. The native source trees available in the local workspace are not all tracked in the examined application repository. Chapter 6 addresses publication of a complete source-and-build package; Appendix B records the present artifact mapping.',
    'Acknowledge successful current reproduction and state the remaining publication boundary accurately.',
    'review_2026_11_12/source_hash_comparison.json', 'review_2026_11_12/rerun_comparison.json', 'research/current_2026_10_23/provenance.json', 'research/week_05_09/results/provenance.json')

patches.sort(key=lambda p: p['start'])
(BASE / 'patches_ch3_5.json').write_text(json.dumps(patches, indent=2, ensure_ascii=False))
print(f'{len(patches)} paragraph patches written')
