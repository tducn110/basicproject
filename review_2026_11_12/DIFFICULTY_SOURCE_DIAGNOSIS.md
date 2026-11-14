# Chẩn đoán source và live assets: thiếu tầng độ khó Caro

Ngày kiểm tra: 12/11/2026. Mode: DEBUG, chỉ đọc app/source/deployment. Chỉ tạo artifact chẩn đoán trong thư mục review. Không sửa difficulty, cap, UI, binary, Git branch/commit hay deployment.

## Kết luận theo symptom mới nhất

**[A, confidence cao] Bàn cờ trong trang presentation localhost đang nhúng `https://10-caro.vercel.app`, không chạy local `CaroGame`. Live JavaScript của URL này liệt kê đúng bốn tầng `easy`, `normal`, `hard`, `expert`.** Vì danh sách render chỉ có bốn phần tử, tầng Master không có nút để chọn. Live Worker vẫn có mapping `master:4` và bảng depth tĩnh `master:8`. Đây là lệch contract giữa UI được deploy và Worker, không phải bằng chứng rằng Rust mất implementation Master.

So với năm tầng của API cũ, thiếu **Master** ở UI. So với sáu tầng trong canonical source hiện tại, live UI thiếu **Very Hard và Master**; Very Hard cũng chưa có mapping trong live Worker. Cần nói rõ đang so với phiên bản nào, không gộp hai số đếm thành một lỗi.

**[A] Live binary là binary cũ:** SHA-256 live WASM bằng `51cc2fa5c2b1b7edf7406e032cf9b5385e5d3419085c3e893b954c41823cf6f0`, 48,549 bytes; byte-identical với binary được track ở `c99da4f`, `8933a1f`, `c1e7447`. Canonical `CaroGame` hiện tại dùng binary khác, `1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989`, 111,582 bytes. Không thể dùng kết quả chạy canonical sáu tầng để nói rằng live URL đã có sáu tầng.

**[C] Chưa định danh exact deployment commit** chỉ từ asset tương đồng: cùng binary tồn tại qua nhiều commit. Cần deployment metadata để chốt Git revision/root directory. Không gọi một commit cụ thể là source production nếu chỉ khớp WASM.

## Môi trường và inventory đã kiểm tra

| ID | Nguồn | Trạng thái tại lần đọc | Vai trò |
|---|---|---|---|
| S1 | `/home/pro/Downloads/basicproject` | `main`, HEAD `7e1e2d51321a4e6b2e26493c34f0a485d4de39cc`; origin `https://github.com/tducn110/basicproject.git` | Canonical checkout; app ở `CaroGame/` |
| S2 | `/home/pro/Downloads/basicproject/CaroGame` | `git status --short -- CaroGame` rỗng | Current app source, không phải live URL đã được chứng minh deploy |
| S3 | `/home/pro/Downloads/basicproject/present` | Có nhiều dirty/untracked file sẵn; giữ nguyên | Local presentation; nhúng external game |
| S4 | `/home/pro/Downloads/vnuk/basicProject/10_caro` | HEAD `744f8871c75665548e31d1a73bb0773aebbe66eb`; status rỗng; origin `https://github.com/tducn110/caro.git` | Checkout cũ, app bytes hiện tại bằng canonical WASM |
| S5 | `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine` | Không có Git identity riêng được xác nhận; source định danh bằng hashes | Native Rust implementation liên quan bản sửa 23/10 |
| S6 | `https://10-caro.vercel.app` | GET trực tiếp live HTML, JS, Worker, WASM | Artifact đang được iframe dùng |
| S7 | `https://carogame-five.vercel.app` | GET HTML và JS để phân biệt target; chưa audit chức năng | Target khác trong switch presentation |
| S8 | `research/current_2026_10_23/baseline/` trong S1 | Snapshot lịch sử, không xem là current | Đối chiếu cấu hình trước sửa |

Root checkout có dirty/untracked presentation/report artifacts. Không diễn giải `CaroGame` sạch thành toàn repo sạch.

## Trace symptom: presentation → live game → selector → Worker

1. **INPUT:** User mở presentation localhost, chọn target `10-caro.vercel.app (Chính Thức)`.
2. **Owner của target:** `/home/pro/Downloads/basicproject/present/src/components/InteractiveCaroBoard.tsx:19–25` mặc định `boardSource="vercel"`, `vercelTarget="10-caro"`; `:307–313` đặt `iframe.src={activeVercelUrl}`. Component `/home/pro/Downloads/basicproject/present/src/components/TopHeroBoardWithTOC.tsx:42–47,405–411` có cùng mapping; cần căn runtime component để nói component nào đang mounted.
3. **PROCESS/STATE live UI:** `/assets/index-CHy0JjkV.js` chứa `var hm=[\`easy\`,\`normal\`,\`hard\`,\`expert\`]`; selector gọi `hm.map(...)`, mỗi nút gọi `controller.setDifficulty(level)`. Translation không có `difficultyMaster` hay `difficultyVeryhard`.
4. **EVENT:** Chỉ một trong bốn giá trị trên có thể đi qua nút UI vào game state. Không có sự kiện chọn Master từ selector này.
5. **Worker:** `/assets/worker-DdGmBecY.js` chứa IDs `{easy:0,normal:1,hard:2,expert:3,master:4}`. Engine nhận numeric difficulty khi `ai_move(...)` được gọi. Master có entry ở đây nhưng UI không phát sinh nó.
6. **OUTPUT/FEEDBACK:** UI hiển thị bốn nút; Worker cũ trả `stats.depth` từ bảng tĩnh và `nodes:0`. Hai trường này không phải bằng chứng đo completed search depth hay sức mạnh.

Immediate cause của thiếu Master là **deployed render-list không chứa `master`**. System cause có bằng chứng là **presentation chạy external deployed artifact có contract khác canonical source sáu tầng**. Vì sao pipeline deploy vẫn dùng artifact đó cần deployment metadata; chưa suy đoán cache hay lỗi Vercel.

## Live artifact identity và tight feedback loop

Raw evidence: `DIFFICULTY_LIVE_ASSET_EVIDENCE.json`, kèm hai JS đã tải chỉ để phân tích. Không lưu/download WASM vào source app.

| URL path | Bytes | SHA-256 |
|---|---:|---|
| `/assets/index-CHy0JjkV.js` | 747,224 | `e69bbb81a72729ce01ff5cddee4cdfb026e33b44a957c5359faf93acfedab6d7` |
| `/assets/worker-DdGmBecY.js` | 5,846 | `8d3a2b4518cbbac39a72abebf7fa744ef517065eb164929611447f7e6c0b288c` |
| `/assets/gomoku_engine_bg-Du90GCPD.wasm` | 48,549 | `51cc2fa5c2b1b7edf7406e032cf9b5385e5d3419085c3e893b954c41823cf6f0` |

Một loop đỏ đúng symptom là GET HTML → tìm module JS → đọc danh sách difficulty được map bởi selector → assert danh sách mong muốn. Với contract năm tầng, live bốn tầng hiện tại fail vì thiếu Master; với contract sáu tầng, fail vì thiếu Very Hard/Master. Không dùng kiểm tra `HTTP 200` hay chỉ tìm chữ `master` trong Worker để thay thế assertion selector.

Source hiện tại `CaroGame/src/App.tsx:346–357` map `BOT_DIFFICULTIES`, không có danh sách bốn tầng tách riêng. `CaroGame/src/game/ai/contracts.ts:3` định nghĩa đủ sáu giá trị. Source lịch sử `git show c1e7447:src/App.tsx` và translation lịch sử phù hợp với live bốn tầng, còn `git show 8933a1f:src/game/ai/contracts.ts:3–4` đã định nghĩa API năm tầng. Vì vậy mismatch UI4/API5 đã hiện diện trong source lịch sử, trước khi current report review diễn ra.

## Trace riêng: current canonical app (không đồng nhất với live)

| Boundary/owner | Input → process → output | Evidence |
|---|---|---|
| `App` | Sáu difficulty buttons → `setDifficulty(level)` | `/home/pro/Downloads/basicproject/CaroGame/src/App.tsx:346–357` |
| `GameController.setDifficulty` | Hủy request cũ, xóa feedback, reset board, tạo round mới, lưu difficulty | `/home/pro/Downloads/basicproject/CaroGame/src/app/GameController.ts:107–114` |
| `MatchController` | Owns difficulty state; default `normal` | `/home/pro/Downloads/basicproject/CaroGame/src/game/behaviors/match/MatchController.ts:5,16–20` |
| `GameController.startAiTurn` | Snapshot difficulty/round → `AIService.requestMove`; token/round/lifecycle guard trước commit move | `/home/pro/Downloads/basicproject/CaroGame/src/app/GameController.ts:161–187` |
| `AIController` | Easy/Normal đi Rust; Hard trở lên ưu tiên immediate win/block ở TS; còn lại copy history vào WASM request | `/home/pro/Downloads/basicproject/CaroGame/src/game/ai/AIController.ts:10–38` |
| `TacticalMoveResolver` | Tìm own immediate win rồi opponent immediate winning completion; không giải forced sequence nhiều lượt | `/home/pro/Downloads/basicproject/CaroGame/src/game/ai/TacticalMoveResolver.ts:17–26,40–45` |
| `GomokuWasmEngine` | Owns Worker/pending request/cancellation; không thay difficulty hay budget | `/home/pro/Downloads/basicproject/CaroGame/src/game/wasm/GomokuWasmEngine.ts:21–38,48–64` |
| Worker | Load vendored package rồi gọi adapter | `/home/pro/Downloads/basicproject/CaroGame/src/game/wasm/worker.ts:3–5,18–21` |
| `executeWasmSearch` | Hydrate history; `x=col,y=row`; numeric ID; validate returned difficulty/telemetry; free Rust instance; trả move + measured counters | `/home/pro/Downloads/basicproject/CaroGame/src/game/wasm/executeSearch.ts:12–25,34–66` |
| Native `Difficulty` | Numeric IDs → strategy/depth/candidate policy | `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine/src/ai.rs:11–40` |
| Native `Game` | Turn parity từ alternating hydration; choose_move; apply decision; serialize label/stats | `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine/src/lib.rs:43–55,58–72,135–150` |
| Native search | Fixed-depth root-perspective minimax với alpha-beta; leaf evaluate; make/unmake; đo counters | `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine/src/search.rs:62–127` |
| Candidate policy | Radius2, rank/cap; immediate wins và opponent winning completions sống qua soft cap | `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine/src/candidates.rs:79–109` |

Current profiles, theo TS contract và native source tương ứng:

| UI | Numeric ID | Strategy | Configured depth | Soft cap |
|---|---:|---|---:|---:|
| Easy | 0 | random trên mọi legal cells | 0 | none |
| Normal | 1 | immediate win/block, nếu không có thì 1-ply evaluation | 1 | none |
| Hard | 2 | alpha-beta | 2 | 15 |
| Very Hard | 5 | alpha-beta | 3 | 12 |
| Expert | 3 | alpha-beta | 4 | 10 |
| Master | 4 | alpha-beta | 5 | 8 |

IDs Very Hard5/Expert3/Master4 là intentional compatibility mapping, không phải off-by-one. Depth0/counters0 ở TS tactical response cũng intentional; đó là không chạy Rust search cho nước immediate win/block, không phải bằng chứng search bị hỏng.

Native source hashes hiện tại khớp entries trong historical `provenance.json`: `ai.rs`=`4e118d28036c321c9dd9835b92428a11340aa0220a8a9fcf34b1072d1433ba62`; `search.rs`=`3bea1e8366054a78b7ce4165319b3beb6fbd24144d6504201e26d25a1fbba1dd`; `candidates.rs`=`9a83974ad61d8bcae016561f1db35ebb45a8b826c3ee8ec524cd12277ff776ea`. Đây là source/hash association, không phải fresh reproducible-build proof của lần kiểm tra này.

## Lịch sử thay đổi thật

| Commit/snapshot | Delta xác nhận từ Git/source | Giới hạn diễn giải |
|---|---|---|
| `6ffe53b` | `AIController` dùng `SearchPositionBuilder(25)` + TS `GomokuEngine` + `SEARCH_BUDGETS` | Budget depth là trần, không chứng minh đạt depth đó |
| `c99da4f3e5f148b9e74f4261d19badd534a919e3` (10/09/2026) | Chuyển active route TS → WASM; đưa binary48,549 bytes vào repo | Không phải current report edit |
| `8933a1f8d2f79faef0a665567a40f5d49f026dd5` (17/09/2026) | API thêm Master; Worker mapping Master4/depth8; thêm TS immediate tactical shortcut mọi level | UI vẫn bốn tầng; depth telemetry còn tĩnh |
| Baseline snapshot23/10 | Native source cấu hình Easy1/Normal2/Hard4/Expert6/Master8, easy/normal noisy minimax; hard+ caps15/10/8 | Native baseline không tự chứng minh deployed binary provenance hoặc strength |
| `1b74cd287492bbbf037cc9205a5061aefef46f51` (25/10/2026) | Sync sửa local23/10: sáu tầng; hard4→2, expert6→4, master8→5 trong contract; Easy→random0, Normal→rule_based1; thêm Very Hard3; thay binary111,582 bytes; measured telemetry | Thay đổi cấu hình/strategy thật, nhưng chưa có calibrated strength evidence |
| `744f8871c75665548e31d1a73bb0773aebbe66eb` | Merge source với basicproject report history | Không đồng nghĩa đã deploy |
| `7e1e2d51321a4e6b2e26493c34f0a485d4de39cc` | Di chuyển current app vào `CaroGame/` | Không đồng nghĩa production root đã đổi |

## Nếu câu hỏi còn bao gồm sức đánh yếu đi

Đây là nhánh khác với symptom thiếu nút. Không coi nó là root cause đã reproduce.

**[A] Current route không dùng `SEARCH_BUDGETS`.** Table còn ở `/home/pro/Downloads/basicproject/CaroGame/src/game/ai/contracts.ts:45–54`, explicit comment legacy-only. Hard `{500ms,maxDepth8}`, Expert `{1200ms,maxDepth64}`, Master `{1800ms,maxDepth64}` không được gửi vào current WasmAIRequest. Tăng table này không thay current Rust search.

**[A] Legacy TS và Rust là hai thuật toán với boundary khác nhau.** Legacy `bot/search.ts:325–393` iterative-deepens trong deadline, `:14–79,273–275` có TT, `:212–250,269–270` có quiescence tối đa5 forcing plies. Current Rust search là fixed depth, leaf evaluate trực tiếp, không có TT/quiescence trong `SearchContext`. Không đồng nhất Rust nhanh hơn với tìm cùng cây hoặc strength tốt hơn.

**[C] Ranked hypotheses nếu có exact losing position:**

1. User đang so hai deployment/source khác nhau (rất rẻ để falsify bằng URL/assets; hiện đã xác nhận có artifact divergence).
2. Giảm hard/expert/master horizon ở current source làm bỏ lỡ forced sequence nằm ngoài depth mới. Prediction: cùng board/current evaluation/cap, sâu hơn tìm được continuation cụ thể mà depth hiện tại bỏ lỡ. Chưa có exact losing fixture nên chưa kết luận.
3. Cap giảm15→12→10→8 khiến higher tiers không giữ cùng candidate tree; rank theo consecutive local line có thể bỏ strategic/non-immediate tactical move. Prediction: uncapped hoặc tăng cap giữ missing move trong same-depth controlled probe. Immediate winning completions được bảo vệ, nên không gọi mọi tactical miss là cap.
4. Legacy quiescence/TT/candidate/evaluator khác Rust làm cùng số depth không tương đương. Prediction: controlled fixture tại horizon forcing sequence phân biệt. Không khẳng định TS mạnh hơn toàn cục từ source.
5. Easy thực sự random toàn legal board ở current source nên trông yếu/rời rạc hơn noisy-minimax cũ. Đây là strategy change có bằng chứng; có phải trái desired contract hay không cần brief/decision có thẩm quyền.

**[A] Existing tests không đo strength ordering.** `tests/game/wasm-runtime.test.ts:130–150` kiểm sáu profiles, depth/counters/legal move trên một history nhỏ; không assert Expert thắng Hard hay tránh được một forced loss nhiều ply. Historical README23/10 cũng explicit chưa có tournament/strength calibration. Test pass không close complaint về sức đánh.

## Check đã thực chạy và phần còn mở

- Đã chạy read-only Git status/revision/remote/history/diff; đọc source TS/Rust và baseline.
- Đã GET live HTML/module/Worker/WASM; đọc selector và mapping thật; tính SHA-256 bytes; so binary với Git historical objects. Xác nhận mismatch UI4/Worker5/current-source6 và old binary identity.
- Không chạy build/test suite trong subtask này; runtime agent có scope kiểm execution riêng. Không claim browser behavior từ static GET.
- Chưa xác nhận exact Vercel deployment Git SHA/root-directory; cần metadata. Chưa xác nhận all target domains hoặc device behavior.
- Chưa có exact gameplay history chứng minh regression sức đánh; vì thế không đề xuất guess-fix depth/cap.

**Next minimal checks:** (1) Chốt desired contract năm hay sáu tầng; (2) đối chiếu live deployment metadata với canonical/root `CaroGame`; (3) nếu task chuyển sang sửa missing selector, thực hiện ở owner source/deploy đã xác minh rồi kiểm DOM list + click→Worker ID; (4) nếu còn complaint strength, lấy alternating move history/difficulty/expected safe move, replay vào pinned binary và so controlled profiles. Từng nhánh có acceptance riêng; deployment/source update cần đúng quyền task, không tự deploy từ chẩn đoán.
