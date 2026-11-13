# Gate ledger — 23/10/2026

Phạm vi: local `basicProject`, Rust engine thật → WASM → Worker → UI và báo cáo `.md` tuần 1–7. Không có commit/push/deploy trong lượt này. `CREATED` khác `VERIFIED`; chưa có gate nào được gắn `ACCEPTED`.

TrustMeBro được áp dụng bằng đọc skill `orchestrator` và `layout-init`, đối chiếu ownership/dependency/layout; đây là workflow review, không có binary tên TMB để chạy. Ponytail được áp dụng từ `/home/pro/.gemini/config/plugins/ponytail/skills/ponytail-review/SKILL.md`, chỉ rà over-engineering, không chứng minh correctness. Hai lens được thực hiện cùng chu kỳ gate; correctness đến từ fixture/test riêng. Log ghi cả vấn đề bị phát hiện và lần sửa, không đổi audit thành PASS giả.

| Gate | Điều kiện | TMB | Ponytail | Correctness/evidence | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| G0 | Đúng checkout, baseline, spec, inventory | Map ownership và snapshot đã đọc | Không thêm kiến trúc khi chưa có nhu cầu | `baseline/`, `baseline_engine/`, `sources/drive_*.json` | VERIFIED cho inspection |
| G1 | Board invariant, apply/undo, full/empty/bounds | PASS — Board/state ownership, Game giữ history | `Lean already. Ship.` — 0 dòng cần bỏ sau đọc Board diff; safe accessor dùng ở boundary, không thêm trait một implementation | 16 Board tests PASS; [`G1_board_tests.log`](G1_board_tests.log) | VERIFIED |
| G2 | Candidate policy/utility trước wiring | PASS — candidates/eval owners tách rõ; independent reviewers | Lean already. Ship. 0 dòng bỏ | 5 candidate + 5 evaluator tests PASS, G2 logs; final corpus bổ sung ở G3 | VERIFIED ở policy module |
| G3 | Strategies, MM/AB equivalence, utility, tactical recall, counters | PASS — search/strategy/commit owners riêng; independent review | Lean already. Ship. 0 dòng bỏ | 38 unit + 7 native integration; 816 raw rows, 408 MM/AB pairs, 408 ordering pairs, 820 restores | VERIFIED — native finite corpus |
| G4 | WASM build/provenance, Worker counters/recovery | PASS sau sửa constructor/fatal-worker recovery | Lean already. Ship. 0 dòng bỏ | Build/copy hash PASS; 18 actual-WASM cases, 291 ply parity; 6 tiers real browser Worker | VERIFIED — Node + HeadlessChrome corpus |
| G5 | Six tiers/Undo/Reset/thinking/stats/responsive input | PASS — state/controller/Worker/camera/UI đúng owner | Lean already. Ship. 0 dòng bỏ | 59 frontend tests; typecheck/build/diff PASS; real UI→Rust→HUD→Undo; 3 viewports; resize before/after | VERIFIED — automated local + headless browser |
| G6 | Toán → pseudocode → source → tradeoff → evidence từng tuần | PASS — 7 reports giữ schedule/reference authority rõ | Lean already. Ship. 0 dòng bỏ; trình bày chi tiết là yêu cầu user | 7 weekly files, 12 docs, 53 display equations, 79 local links; numeric/source/package checks | VERIFIED — source/structure/numeric, chưa render PDF |

## G0 — quan sát baseline

- Pasted review nói không có Cargo; môi trường hiện tại có `/usr/bin/rustc` 1.93.1 và rustup toolchain `/home/pro/.cargo/bin/rustc` 1.98.1. WASM dùng toolchain rustup và target đã cài.
- Native baseline engine: 19 unit + 3 integration tests pass. `tests/wasm.rs` dùng native `#[test]`, không chứng minh browser WASM.
- Reproduce trước sửa: `place(Empty)` tăng count; `undo(empty)` panic; bàn hòa đủ 225 ô vẫn sinh center và search panic. Native layout ban đầu: Cell 1 byte, Board 240 bytes; không ngoại suy sang WASM.
- UI có 4 nút difficulty, API có 5, kế hoạch Google Docs W7 có 6. Worker depth static và nodes=0 không phải telemetry thực đo.
- React 19/PixiJS 7 theo package hiện tại. UI là X/O ở tâm 15×15 ô, có 16 đường biên mỗi trục. Không đổi sang bàn giao điểm chỉ vì báo cáo cũ mô tả khác.
- Repo `10_caro` có dirty work trước lượt này; xem `baseline/git_status.txt`, `git_diff.txt`, `git_diff_staged.txt`. Không stage/commit hay xử lý staged deletion có sẵn.

## Nguồn và lịch tuần

`sources/drive_0.json` và `drive_1.json` là connector readback ngày 23/10 của corrected plan/W7 mà attachment dẫn. Đó là kế hoạch, không phải kết quả chạy. W7 kế hoạch gồm candidates+ordering+difficulty; local report index tách ordering ra W8. G3 ghi rõ cùng implementation được ánh xạ vào cả hai lịch. Master hiện tại không được gắn nhãn đã có TT/iterative deepening.

## G5 — responsive finding và recovery

Browser real Pixi tái hiện lỗi resize: 500×400 → 1200×600 nhưng syncState cập nhật lastViewport trước ticker nên camera giữ x74/zoom0.4190. Source-owned cause: generic redraw đánh dấu viewport đã fit dù chưa fit. Sửa thành lastFittedViewport chỉ được update trong fitBoardToViewport. G5_resize_before.json ghi matches=false; G5_resize_after.json ghi matches=true (x324,y24,zoom0.657142857). Test pan giữ nguyên khi viewport không đổi.

TMB: camera fitting owns fitted geometry version; draw không nhận ownership đó. Ponytail: Lean already. Ship. 0 dòng cần bỏ; một field theo đúng ý nghĩa tránh thêm ResizeManager/observer layer. Correctness là regression test và real WebGL probe, không phải Ponytail.

## G3 — search và strategy

TMB độc lập đọc final ai.rs/lib.rs/search.rs: enum chọn strategy; SearchContext giữ root/config/counters và mượn Board; candidates giữ membership; eval giữ score; Game giữ final commit/history. Ponytail: shared recursion có plain Minimax cần cho baseline, không có trait một implementation, hierarchy, unsafe pointer hay node object tree. 38 unit + 7 native integration PASS trong G3_native_tests.log. Release data do current_evidence.rs sinh, không phải reference core: 816 raw rows/272 configurations, 408 MM/AB pairs, 408 ordering-value pairs và 820 actual working-board restoration checks. Pair counts gồm repeats, không phải số vị trí độc lập.

Native timers loại root clone khỏi khoảng đo, chạy3 repeats tuần tự, không CPU pinning/randomize config order. Counter equality/decision consistency được assert; latency chỉ descriptive trên host hiện tại. sizeof Cell1/Board240 chỉ native x86_64; 225 address-offset checks không dereference raw pointer.

## G4 — build và integration thật

G4_wasm_build.log và wasm_package.json xác nhận build release z+LTO, explicit --no-opt, copy JS/types/WASM vào app. Package source/copy hash và actual runtime test hash khớp ở package_hash_check.json. Final binary SHA256: 1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989. Có rebuild cuối sau sửa comment Rust; raw parity/browser probes đã chạy lại trên final hash, không dùng binary trước để chứng minh bản cuối.

G4_actual_wasm_tests.log:18 actual-WASM tests PASS. wasm_ts_parity.json:8 reachable rule histories,291 accepted plies so theo từng ply,6 rejected integer/occupied attempts, Undo/reset,6 profiles,seed repeat,terminal no-move. Terminal current_player convention khác nhau được ghi riêng: Rust flips, TS giữ last mover; chỉ ongoing next-player được assert parity. G4_real_browser_worker.json ghi final browser-fetched SHA256, cả6 tier trả Rust counters/move hợp lệ. Main-thread interval có tiến triển trong một số requests; không suy ra FPS/deadline.

Review đã phát hiện và sửa2 recovery gaps: Worker constructor throw đồng bộ cần reject Promise; fatal worker.onerror phải terminate/null và guard identity để stale error không phá replacement. Tests kiểm lỗi→retry và cleanup→reopen/StrictMode.

## G5 — UI và bảo toàn công việc có sẵn

G5_frontend_tests.log:59/59 tests/9files PASS (18 actual-WASM tests là subset). Typecheck/build/diff-check đều exit0. App DOM tests chạy StrictMode với real controller và simulated canvas/worker boundary; G5_browser_ui.json bổ sung actual UI/Pixi PointerEvent→Rust Worker→telemetry→Undo. Pointer events được dispatch bằng DOM, không giả đã test physical touch. G5_browser_viewports.json kiểm1280×800/390×844/320×568 không tràn ngang, details mở; vùng board nhỏ hơn khi mở details ở320×568, có thể thu gọn telemetry để chơi.

preservation_checks.json xác nhận ba dirty Wink patches có sẵn và toàn bộ staged patch không đổi. Các sửa UI/translation giữ phần locale hiện hữu. Không commit/push/deploy. Dev server dùng polling vì giới hạn inotify ENOSPC trên máy, không sửa sysctl hay Vite config để che lỗi môi trường. Build còn warning chunk>500kB và native configLoader; không thuộc behavioral gate lần này.

## G6 — báo cáo và giới hạn còn lại

Bảy Markdown canonical đã bổ sung toán/step/pseudocode/code/trade-off/difficulty/evidence. Các nhãn Complete/Verified và metrics lịch sử W2/W3 được đặt sau archive boundary. Root README/registry chỉ thêm current-snapshot banner, giữ mirror/export lịch sử. SOURCE_EXCERPTS.md có15 extracts path/symbol/range/hash; provenance.json và delivery_manifest.json xác định artifact local chưa commit.

verify_reports.py đã kiểm UTF8/control chars, code fences, display-math delimiters/grouping,9 numerical examples, local links, raw CSV counts và package/runtime hashes. Đây là structural/numeric/source verification, không phải render bằng TeX engine/PDF. Independent math review đã sửa rõ L(B)/O(B), điều kiện cap≥1 và memory bound theo actual width/O(dN²).

Chưa kiểm chứng: complete broken-pattern/fork taxonomy, exhaustive all-state equivalence, strength calibration/tournament, performance tối ưu tuyệt đối, physical devices và Wink host. TT/Zobrist/Iterative Deepening chưa được thêm vào engine game; không gọi Master là đã có chúng. rustfmt component chưa có nên cargo fmt không chạy được; không thay toolchain toàn cục. DOCX/PDF/Google Docs/Canva/mirrors chưa regenerate bởi yêu cầu chỉ Markdown này. Mọi VERIFIED ở đây đều có scope, không có ACCEPTED tự gán.
