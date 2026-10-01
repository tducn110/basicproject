# Layout mode (TrustMeBro)

`{layout}` maps this game project: folders, components, simulation logic, render stage, PixiJS runtime, audio, platform SDK, storage contracts, gameplay experience evidence, and the TrustMeBro Game Design dependency matrix. Use it to find where a task belongs before searching the code.

1. **Keep it current.** When a change adds, moves or removes a folder, component, render layer, simulation rule, audio bus, platform contract or storage key, update `{layout}` in the same commit: one line per entry, with its file path, and bump "Last updated".
2. **Respect the package dependency.** `game-design` governs `layout-init`; do not replace its contract with local conventions. When a change affects PixiJS, viewport, UI/reuse, audio, gameplay experience, lifecycle, or Wink integration, update the matching TMB Game Design Dependencies row with the new evidence or gap.
3. **Gate player-facing work.** Before implementing gameplay, game UI flow, controls, score, balance, feedback, onboarding, revive, or session-loop work, complete the Gameplay Experience Gate in `ROADMAP.md` and update `GAMEPLAY_REVIEW.md`. The gate records the player outcome, source path, fairness, feedback, relevant local evidence, and targeted web research when local evidence cannot answer the product question.
4. **Every new task goes on the roadmap first.** When the user starts a task that will change the project (feature, fix, refactor, docs), find where it fits in `{layout}` and what it touches, record it in `ROADMAP.md` before doing the work, and tell the user in one line what you added. If there is no roadmap yet, first create it from `{templates}/ROADMAP.md`: keep its `<!-- trustmebro -->` first line (the hooks ignore files without it), progress block, Next actions and Change log, and replace its placeholder phases with the entry. Refresh progress with `{progress_cmd}`.
   - **Feature or addition** (fits inside existing subsystems, about a day of work): a new phase `## Feature <n>: <title>` with Build and Exit criteria items, then start.
   - **Fix or small change**: an item under `## Maintenance: fixes and small changes` (create that phase once, then reuse it), then start.
   - **Big** (a new subsystem, major engine/platform refactor, several components, or several days): a phase with the item `[ ] Plan approved by the user`, a plan from the roadmap-planner skill, and no code until the user approves.
   - Already on the roadmap: work from that item instead of adding a new one. Questions, and follow-ups that continue the current task, need no entry. Not sure of the size? Ask the user.
5. **File Responsibility & Data Pipeline Mapping.** Mọi file trong `{layout}` phải được định nghĩa rõ ràng vai trò kiến trúc và vị trí đảm nhiệm trong dây chuyền dữ liệu (`INPUT -> PROCESS -> STATE -> EVENT -> SIDE EFFECT -> OUTPUT -> FEEDBACK`):
   - **Implement (Pure Domain/Simulation)**: Quy tắc nghiệp vụ thuần túy, tính toán tất định (`PROCESS`), không phụ thuộc UI/Platform/Audio/DOM.
   - **Trung chuyển (Controller/Hook/Mediator)**: Cầu nối điều phối giữa UI Presentation và Pure Domain (`EVENT <-> STATE -> SIDE EFFECT`), dispatch action và quản lý lifecycle cục bộ.
   - **Presentation / Render**: Render trực quan (`OUTPUT`), giao diện người dùng, thu nhận thao tác người dùng (`INPUT`/`FEEDBACK`), hoàn toàn thụ động (dumb/presentation).
   - **Adapter / Persistence**: Quản lý lưu trữ (`localStorage`), Web Audio, kết nối SDK nền tảng (`SIDE EFFECT -> FEEDBACK`).
6. **State Single-Responsibility Invariant (Quy tắc đơn nhiệm của State trong User Flow).**
   - Tuyệt đối không để 1 state hoặc 1 controller gánh đồng thời 2 task hoặc 2 goal (dù là sub-task hay macro-task).
   - Nếu 1 state vừa quản lý quy tắc cốt lõi (Game Truth) vừa xử lý tiến trình thời gian (Timer), hoặc vừa quản lý dữ liệu vừa quản lý hiệu ứng UI/trạng thái tạm thời (Transient UI/Modal/Animation), **PHẢI TÁCH RỜI NGAY LẬP TỨC TRONG USER FLOW** thành các state/hook trực giao, độc lập vòng đời.
   - Tránh hiện tượng derived state trở thành authoritative state, và ngăn ngừa re-render bão táp chéo giữa các luồng dữ liệu độc lập.
