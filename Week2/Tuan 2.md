**

TUẦN 2 - TYPESCRIPT CORE GAME ENGINE, RULES, STATE VÀ CORRECTNESS BASELINE

0. Artifact phải đính kèm

- Đề cương và technology baseline từ Tuần 1: TypeScript được planned cho toàn bộ hệ thống.

- Rule Specification phiên bản đang sử dụng.

- Repository commit/tag của TypeScript Game Engine nếu repository history còn lưu.

- Source files hoặc architecture mapping cho Board, GameState, RuleSet và MoveResult.

- Vitest/unit-test report.

- Fixture corpus cho legal move, win/draw và edge cases.

- State ownership/data-flow diagram.

1. Plan / Research Questions

Tuần 2 tập trung vào correctness của domain model bằng TypeScript, đúng với kế hoạch công nghệ ban đầu của đề cương. Tuần này chưa có quyết định chuyển Rust.

- RQ-W2-1: Data model nào biểu diễn game state deterministic và đủ cho gameplay/search về sau?

- RQ-W2-2: Component/module nào phải sở hữu state transition để UI không duplicate rule logic?

- RQ-W2-3: Win detection có thể giới hạn quanh lastMove thay vì scan toàn board không?

- RQ-W2-4: Fixture/test corpus nào đủ ổn định để trở thành correctness baseline nếu implementation language thay đổi ở giai đoạn sau?

2. Background / Literature

TypeScript được dùng ở baseline vì project web ban đầu dùng React/TypeScript và đề cương dự kiến triển khai cả game logic/AI trong cùng ecosystem. [B] TypeScript bổ sung static type checking cho JavaScript, giúp mô tả contract của Player, Move, GameState, RuleSet và result types trước runtime. [B] Vitest cung cấp test runner phù hợp Vite ecosystem và được dùng để lưu correctness evidence.

  

Ở giai đoạn này mục tiêu không phải chứng minh performance. TypeScript Game Engine đóng vai trò implementation thật theo kế hoạch ban đầu và đồng thời tạo behavior/fixture baseline có thể dùng làm oracle nếu architecture được đánh giá lại về sau.

  

3. Methods

3.1. State ownership

TypeScript Game Engine là owner của domain state trong Week 2:

UI/caller → GameEngine.makeMove(command) → validate → transition → terminal check → immutable/read-only snapshot/result.

- Caller không trực tiếp mutate board.

- Rule checking không nằm trong React component.

- Một move chỉ được commit sau khi validation pass.

- Snapshot/read API không cho phép bypass engine invariant.

  

3.2. Separation of concerns

- Board: storage/index/access.

- GameState: currentPlayer, status, winner, moveCount, lastMove.

- RuleSet: win condition và rule-specific restrictions.

- GameEngine: lifecycle + transaction boundary.

- WinDetector: line traversal; không tự quyết định mọi rule variant.

- Tests/fixtures: behavioral specification có thể tái sử dụng.

  

4. Implementation

4.1. Data model reference [D nếu chưa đối chiếu repo]

type Player = 1 | -1;

type Cell = 0 | Player;

  

interface Move {

  row: number;

  col: number;

  player: Player;

}

  

interface GameState {

  board: readonly Cell[];

  currentPlayer: Player;

  status: 'playing' | 'won' | 'draw';

  winner: Player | null;

  moveCount: number;

  lastMove: Move | null;

}

  

4.2. Board representation

Logical board là N×N. Contiguous one-dimensional representation có thể dùng:

index = row × N + col.

Với board 15×15, có 225 cells. Encoding phải thống nhất với dataset và migration contract sau này. Nếu repository thật dùng encoding khác thì report phải sửa theo source code, không ép source code khớp reference snippet.

4.3. Move transaction

makeMove(row,col):

- validate bounds;

- validate game status = playing;

- validate target cell empty;

- validate RuleSet-specific constraints;

- apply current player;

- update moveCount và lastMove;

- check win từ lastMove;

- nếu chưa win, check draw;

- nếu vẫn playing, switch player;

- return MoveResult + state snapshot.

4.4. Win detection

Chỉ line đi qua lastMove có thể vừa trở thành winning line sau move mới. Scanner kiểm tra bốn axes:

- horizontal: (0,1);

- vertical: (1,0);

- main diagonal: (1,1);

- anti-diagonal: (1,-1).

Với direction (dr,dc):

count = 1 + countSame(+dr,+dc) + countSame(-dr,-dc).

Line traversal phải tách khỏi win-policy để có thể cấu hình Freestyle/exact-five/project Caro rule mà không duplicate traversal code.

4.5. Public API baseline

- createGame(ruleSet)

- getState()

- makeMove(row,col)

- reset()

- getLegalMoves()

- cloneState()/snapshot() nếu search layer cần.

  

Legal move và candidate move không đồng nghĩa. Week 2 chỉ định nghĩa legal move theo game rules; candidate generation là search-space optimization ở giai đoạn thuật toán sau.

5. Experimental Setup

Week 2 là correctness experiment, không phải performance benchmark.

Input:

- empty board;

- board với occupied cells;

- horizontal/vertical/diagonal near-win fixtures;

- boundary/corner positions;

- rule-specific overline/block fixtures nếu RuleSet hỗ trợ;

- near-full/full board cho draw;

- invalid commands.

Conditions:

- cùng RuleSet cho expected và actual result;

- deterministic input;

- mỗi fixture ghi expected state/result;

- test độc lập UI/rendering.

Test cases tối thiểu:

- out-of-bounds bị reject;

- occupied cell bị reject;

- move sau terminal bị reject;

- turn switching đúng;

- four win directions;

- boundary không out-of-range;

- draw đúng;

- reset đúng;

- state snapshot không cho caller phá invariant;

- RuleSet edge cases đúng specification.

  

6. Results / Evidence

[A] Chỉ ghi test count/pass rate, commit hash, file/function hoặc screenshot sau khi đối chiếu repository/test output thật.

Evidence cần link:

- TypeScript Game Engine source/commit.

- Vitest report hoặc CI output.

- Fixture definitions.

- Rule Specification version.

- Diagram state ownership.

- Nếu exact completion week không còn được chứng minh, ghi “implementation evidence hiện tại”, không bịa date.

7. Discussion

Week 2 tạo correctness baseline bằng TypeScript đúng với proposal. Giá trị của baseline này không nằm ở việc TypeScript “tốt hơn” hay “chậm hơn”, mà ở chỗ semantics của game đã được khóa trước khi AI search xuất hiện.

Nếu Week 4 có migration sang Rust, fixture corpus Week 2 trở thành equivalence oracle: cùng board/rules phải cho cùng legal moves, terminal result và state transition. Đây là cách biến thay đổi công nghệ thành một migration có kiểm chứng thay vì port code rồi hy vọng.

8. Limitations

- Chưa có search workload nên Week 2 không đủ dữ liệu để kết luận về runtime language.

- Unit tests chỉ chứng minh các case đã được mô tả, không chứng minh toàn bộ state space.

- Rule profile chưa khóa đầy đủ thì expected result của edge case cũng chưa thể coi là authoritative.

- UI integration chưa được kiểm tra ở Week 2.

- Nếu repository history không còn TypeScript implementation tương ứng, không được tạo lại một baseline giả và gọi nó historical evidence.

  

9. Deliverables / Definition of Done

- TypeScript Game Engine chạy độc lập React.

- Board/GameState/RuleSet/MoveResult contracts rõ.

- Move transaction và win detection có test.

- Fixture corpus versioned.

- State ownership diagram tồn tại.

- API đủ ổn định để React/PvP sử dụng ở Week 3.

- Baseline behavior đủ để làm migration oracle nếu architecture thay đổi về sau.

  

10. References

- [TS-1] TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

- [VITEST-1] Vitest Guide: https://vitest.dev/guide/

- [VITEST-2] Writing Tests: https://vitest.dev/guide/learn/writing-tests

- [R1] Renju International Federation, International Rules of Gomoku: https://gomoku.renju.net/gomokurules/

.

  
**