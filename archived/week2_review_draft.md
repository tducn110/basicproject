[S0] Context confidence: High

Đúng. Với **Week 2**, hiện tại nên xử lý nó như **research/implementation plan + correctness contract**, chưa cố biến nó thành báo cáo kết quả. Chính master document cũng xác định Week 2 trong chronology là giai đoạn TypeScript Game Engine và correctness baseline, trước khi migration Rust/Wasm được đánh giá ở Week 4. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)

Nhưng bản hiện tại có vài chỗ đang viết hơi giống như implementation đã chắc chắn tồn tại. Nếu mục tiêu bây giờ chỉ là **handle document dựa trên kế hoạch**, tôi sẽ review như sau.

## [S1] Cấu trúc Week 2 hiện tại có đúng không?

Có. Flow tổng thể hợp lý:

```
0. Artifacts
1. Plan / Research Questions
2. Background / Literature
3. Methods
4. Planned Implementation
5. Correctness Experimental Setup
6. Expected Evidence / Evidence Requirements
7. Discussion / Rationale
8. Limitations
9. Deliverables / Definition of Done
10. References
```

Điểm cần sửa chủ yếu là **status language**.

Document master yêu cầu retrospective reconstruction không được bịa implementation history, và module/function chỉ được gọi là fact sau khi đối chiếu repo. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)

Vì vậy Week 2 hiện tại nên chia:

- cái nào là **planned contract**;
- cái nào là **expected implementation**;
- cái nào là **evidence chỉ điền sau khi verify repo**.

---

## [S2] Section 0 — Artifacts

Phần này ổn.

Tôi chỉ đổi heading:

> `0. Artifact phải đính kèm`

thành formal hơn:

> **0. Required Artifacts**

Các item giữ được.

Đặc biệt câu:

> Repository commit/tag của TypeScript Game Engine nếu repository history còn lưu.

rất đúng với evidence policy, vì không ép phải có một historical commit nếu repo không còn giữ nó.

---

## [S3] Section 1 — Research Questions

Bốn RQ hiện tại khá chuẩn và đi đúng dependency:

```
State model
    ↓
State ownership
    ↓
Win detection
    ↓
Correctness baseline
```

Tôi chỉ chỉnh nhẹ wording.

RQ-W2-1 hiện tại:

> Data model nào biểu diễn game state deterministic và đủ cho gameplay/search về sau?

Nên formal thành:

> **What data model is sufficient to represent a deterministic game state for both gameplay execution and future search algorithms?**

RQ-W2-2:

> **Which component should own state transitions so that UI components do not duplicate game-rule logic?**

RQ-W2-3:

> **Can win detection be restricted to lines passing through the most recent move instead of scanning the entire board?**

RQ-W2-4 rất quan trọng, giữ ý:

> **What fixture and test corpus is sufficient to establish a reusable correctness baseline for later implementation changes?**

Week 2 đang làm đúng cái Week 1 Research Contract yêu cầu: chuyển definitions thành **behavior có thể kiểm chứng**.

---

## [S4] Section 2 — Background / Literature

Phần này đúng hướng nhưng có một vấn đề nhỏ.

Câu:

> TypeScript được dùng ở baseline vì project web ban đầu dùng React/TypeScript...

đây là **project-history / proposal evidence**, không phải `[B]`.

Nên tách:

- `[A/D historical baseline]`: proposal planned React/TypeScript.
- `[B]`: TypeScript provides static type checking.
- `[B]`: Vitest provides testing facilities.

Master document cũng ghi rõ proposal/Week 1 planned TypeScript cho toàn system, Week 2 TypeScript Game Engine, Week 4 mới đánh giá migration. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)

Một câu rất nên giữ:

> Week 2 does not evaluate runtime performance.

Vì nó khóa scope cực rõ.

---

## [S5] Section 3 — Methods

Đây là phần mạnh nhất của Week 2.

### 3.1 State ownership

Ý này rất quan trọng:

```
UI / Caller
    ↓
Game Engine
    ↓
Validation
    ↓
State Transition
    ↓
Terminal Detection
    ↓
Result / Snapshot
```

Nhưng vì bạn vừa yêu cầu Mermaid/code tách khỏi report, body report không nên chứa arrow chain.

Trong prose chỉ cần viết:

> The TypeScript Game Engine is planned as the owner of domain-state transitions during Week 2. UI components may request actions and read state, but they must not directly modify the board or implement independent rule logic.

Sau đó bullet:

- caller does not directly mutate the board;
- rule validation remains inside the game-engine boundary;
- invalid moves do not commit partial state;
- read access must not bypass engine invariants.

Đẹp và formal hơn.

### 3.2 Separation of concerns

Danh sách:

- Board
- GameState
- RuleSet
- GameEngine
- WinDetector
- Tests/fixtures

giữ được.

Nhưng ở Week 2 plan nên viết:

> **The proposed responsibility boundaries are:**

chứ chưa nên viết như observed architecture.

---

## [S6] Section 4 — Implementation

Đây là section cần đổi tên nhiều nhất.

Nếu hiện tại chỉ đang viết **kế hoạch Week 2**, không nên gọi:

> `4. Implementation`

vì người đọc dễ hiểu là implementation đã tồn tại.

Nên gọi:

> **4. Planned Implementation Contract**

hoặc:

> **4. Implementation Design**

### 4.1 Data model

TypeScript snippet nên **tách khỏi body report** như bạn vừa yêu cầu.

Trong report chỉ viết:

> The planned data model consists of Player, Cell, Move, and GameState abstractions. GameState must contain the board representation, current player, game status, winner, move count, and most recent move.

Rồi code snippet để artifact/appendix.

Và nhãn:

> `[D] Proposed contract until verified against repository evidence.`

là đúng.

### 4.2 Board representation

Phần này giữ được.

Nhưng chú ý: Week 1 mới đang dùng proposed encoding `0, 1, -1`. Vì vậy Week 2 không được silently biến nó thành implementation fact.

Nên viết:

> The logical encoding defined by the Week 1 contract is used as the planned baseline. If repository evidence uses a different representation, the report must follow the implementation evidence.

Đúng với authority rule của document: implementation fact phải đối chiếu repo trước khi nâng thành `[A]`. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)

---

## [S7] Move transaction

Logic hiện tại rất tốt:

```
validate
→ apply
→ update metadata
→ win
→ draw
→ switch
→ result
```

Nhưng lại là process flow, nên trong report prose:

> A move transaction first validates the command against board boundaries, game status, target-cell occupancy, and applicable RuleSet constraints. Only after validation succeeds is the move committed. The resulting state then updates move metadata, evaluates terminal conditions, and switches the active player only if the game remains in progress.

Thế là đủ.

Danh sách chi tiết để artifact/specification.

---

## [S8] Win detection

Đây là chỗ cần giữ rất kỹ, vì nó trả lời RQ-W2-3.

Claim:

> Chỉ line đi qua lastMove có thể vừa trở thành winning line sau move mới.

về logic là rất mạnh và có thể chứng minh từ state transition model.

Nhưng report nên viết dưới dạng method:

> Because a legal move modifies only one board position, any newly created winning line must include the most recently placed stone. The planned detector therefore examines the horizontal, vertical, and two diagonal axes passing through `lastMove`.

Sau đó bốn axes có thể giữ dạng list:

- horizontal;
- vertical;
- main diagonal;
- anti-diagonal.

Công thức:

`count = 1 + ...`

nên chuyển sang **Mathematical/Algorithm Artifact**, không cần body Week 2 nếu bạn muốn report gọn.

Quan trọng nhất là câu:

> Line traversal must remain separate from win policy.

Giữ. Đây là architecture decision tốt.

Vì nếu traversal biết luôn exact-five / overline / blocked-end thì sau này mỗi rule variant lại sinh một scanner mới. Một cách khá hiệu quả để tạo bug theo cấp số nhân.

---

## [S9] Public API baseline

`createGame`, `getState`, `makeMove`, `reset`, `getLegalMoves`, `snapshot`

đây là **API design**, không phải prose report.

Nên tách thành artifact:

> **Week 2 API Contract**

Trong report chỉ cần:

> The planned public API must support game creation, state inspection, legal move application, reset, legal-move enumeration, and safe state snapshotting where required by later search layers.

Câu này rất đáng giữ:

> Legal move and candidate move are not equivalent.

Và formal hóa:

> **Legal moves are defined by the game rules. Candidate moves are a search-space optimization introduced in later algorithmic work.**

Đây là distinction quan trọng xuyên cả thesis.

---

## [S10] Section 5 — Experimental Setup

Rất ổn.

Week 2 thực chất là **correctness experiment**, không phải benchmark.

Inputs bạn list khá đủ:

- empty board;
- occupied cells;
- near-win;
- boundary;
- overline/block fixtures;
- draw;
- invalid commands.

Nhưng có một dependency:

> rule-specific overline/block fixtures **chỉ được authoritative sau khi Week 1 RuleProfile được khóa**.

Nếu Week 1 chưa khóa, Week 2 chỉ được ghi:

> planned fixtures pending final RuleProfile decision.

Không được tự tạo expected output.

---

## [S11] Test cases

Danh sách hiện tại ổn.

Tôi sẽ phân thành 4 nhóm để document sạch hơn:

**Move validation**

- out of bounds;
- occupied cell;
- post-terminal move.

**State transition**

- current player;
- move count;
- last move;
- turn switching;
- reset.

**Terminal detection**

- horizontal;
- vertical;
- both diagonals;
- draw;
- board boundaries.

**State integrity**

- snapshot cannot mutate internal engine state;
- RuleSet edge cases follow specification.

Như vậy đọc report dễ hiểu hơn nhiều.

---

## [S12] Section 6 — Results / Evidence

Nếu đây vẫn là **planning document**, heading hiện tại hơi sớm.

Nên đổi:

> **6. Evidence Requirements**

Sau khi chạy implementation/test thật thì mới chuyển thành:

> **6. Results / Evidence**

Hiện tại nội dung:

> Chỉ ghi test count/pass rate... sau khi đối chiếu repository

là chính xác.

Master standard cũng yêu cầu Results/Evidence phải là actual test result, commit, benchmark, dataset... chứ không phải specification. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)

Nên Week 2 plan chỉ nói **evidence nào cần thu**.

---

## [S13] Section 7 — Discussion

Ý đúng, nhưng nếu chưa có result thì chưa thật sự là `Discussion`.

Hiện tại nó là **Rationale / Expected Role of Week 2**.

Nên rename tạm:

> **7. Rationale and Expected Role**

Sau implementation, bạn mới có thể viết Discussion dựa trên evidence thật.

Nội dung chính giữ:

> Week 2 establishes semantic correctness before search complexity is introduced.

Và:

> fixture corpus may later serve as an equivalence oracle during migration.

Nhưng chữ `becomes` nên đổi thành:

> `is intended to serve as`

cho đến khi migration test thực sự dùng nó.

---

## [S14] Section 8 — Limitations

Phần này tốt.

Đặc biệt giữ:

- no runtime-language conclusion;
- tests do not cover entire state space;
- unresolved RuleProfile weakens expected outputs;
- UI integration out of scope;
- do not reconstruct fake historical baseline.

Điều cuối cùng khớp hoàn toàn với master evidence policy. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)

---

## [S15] Section 9 — Definition of Done

Có một chỉnh sửa quan trọng.

Hiện tại:

> TypeScript Game Engine chạy độc lập React.

Nếu đây là plan thì đúng như acceptance criterion.

Nhưng nếu bạn chưa verify repo, không được viết ở Results rằng nó đã đạt.

DoD nên giữ như checklist tương lai:

- TypeScript Game Engine can operate independently of React.
- Board/GameState/RuleSet/MoveResult contracts are defined.
- Move transaction and terminal detection are covered by tests.
- Fixture corpus is versioned.
- State ownership is documented.
- API is sufficient for Week 3 React/PvP integration.
- Baseline behavior can be reused as a future equivalence oracle.

---

## [S16] Kết luận review Week 2

Week 2 **không cần nghiên cứu lại toàn bộ**, cũng chưa cần đào thêm search algorithm.

Scope chuẩn của nó nên cực kỳ hẹp:

```
Week 1
Rules + research contract
        ↓
Week 2
TypeScript domain model
+ state ownership
+ move transaction
+ terminal detection
+ correctness fixtures
        ↓
Week 3
UI / PvP integration
        ↓
Week 4+
AI computational workload
```

Và bản document hiện tại nên chuyển status như này:

|Current section|Nên dùng ở planning stage|
|---|---|
|Background|giữ|
|Methods|giữ|
|Implementation|**Planned Implementation Contract**|
|Experimental Setup|**Correctness Verification Plan**|
|Results / Evidence|**Evidence Requirements**|
|Discussion|**Rationale / Expected Role**|
|Limitations|giữ|
|Definition of Done|giữ|

Điểm lớn nhất: **Week 2 hiện giờ là contract cho correctness, không phải performance và cũng chưa phải historical implementation report.** Khi repo/test được đối chiếu, lúc đó mới promote từng phần sang `[A]`, đúng theo evidence model của document. [Basic Projects - Research Log &…](https://docs.google.com/document/d/1Vf3C2Whs1FEY0BuFDFBBeNXQ-RDgwLtzEGeCfRqgElw/edit)