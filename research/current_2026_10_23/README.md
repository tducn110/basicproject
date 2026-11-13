# Evidence của bản sửa ngày 23/10/2026

Đây là evidence của engine gomoku-main/engine và app 10_caro trong basicProject, tách khỏi reference experiments ngày17/10. Source chưa commit: SHA256 trong provenance.json là định danh bản local; Git HEAD chỉ là commit nền của app.

## Reproduce

Chạy từ basicProject:

~~~bash
python3 research/current_2026_10_23/run_checks.py native
python3 research/current_2026_10_23/run_checks.py experiments
python3 research/current_2026_10_23/run_checks.py wasm
python3 research/current_2026_10_23/run_checks.py frontend
python3 research/current_2026_10_23/verify_reports.py
~~~

Node dependencies dùng npm ci --ignore-scripts với package-lock có sẵn. Script dùng Rust toolchain /home/pro/.cargo/bin vì /usr/bin có version/target khác. Không cài toolchain hay thư viện vào repo khác.

Để sinh lại raw parity JSON của binary hiện tại, chạy từ 10_caro:

~~~bash
CARO_WASM_EVIDENCE_PATH=/home/pro/Downloads/vnuk/basicProject/research/current_2026_10_23/wasm_ts_parity.json npm test -- tests/game/wasm-runtime.test.ts
~~~

Raw parity hiện ghi18 cases và291 accepted plies trên8 reachable rule histories. Full suite59 tests đã bao gồm18 cases này, không cộng chúng như59+18. Browser probes là HeadlessChrome155, không thay physical-device/Wink-host acceptance.

Các lệnh có cùng tên sẽ overwrite log hiện tại; sao chép directory trước khi so một lần chạy khác. Baseline được giữ riêng, không ghi đè.

## Evidence map

| Artifact | Ý nghĩa |
| --- | --- |
| baseline/ | Snapshot source và dirty diff/status ban đầu |
| baseline_engine/ | Full engine source/tests/manifests trước sửa |
| sources/drive_0.json, drive_1.json | Kế hoạch Google Docs đã đọc, có revision; không phải kết quả test |
| G1_board_tests.log | Board invariant/geometry regression |
| G2_candidate_tests.log, G2_eval_tests.log | Tactical membership/utility tests độc lập |
| G3_native_tests.log | Native algorithm/strategy/state tests sau wiring |
| engine_search_runs.csv, engine_search_summary.csv | 816 raw rows, 272 grouped configs của native engine thật; summary ở bản đã chạy, median/min/max từ raw |
| engine_verification.json | MM/AB, ordering, restoration, repeat/candidate/tactic/address checks |
| engine_candidates.csv, engine_difficulty_runs.csv, engine_native_layout.json | Geometry/difficulty/native layout; không suy ra WASM speed |
| G4_wasm_build.log, wasm_package.json | Build thật và hash copy vào app |
| G4_worker_tests.log | Adapter/lifecycle checks, có mock boundary |
| G5_typecheck.log, G5_frontend_tests.log, G5_frontend_build.log | TS/full test/build |
| wasm_ts_parity.json, G4_actual_wasm_tests.log | Actual copied WASM chạy trong Node, shared TS adapter, per-ply finite fixture parity |
| G4_real_browser_worker.json | Final binary SHA256 và6 tiers chạy trong browser Worker thật |
| G5_browser_ui.json, G5_browser_viewports.json, G5_resize_before.json, G5_resize_after.json | UI→Rust→HUD→Undo, viewport geometry và lỗi resize trước/sau |
| final_reviews.json, G6_report_checks.json | TMB/Ponytail verdict và structural/numeric/source checks |
| preservation_checks.json, delivery_manifest.json | Bảo toàn dirty work và inventory/hash đầu ra |
| provenance.json | Source hashes, toolchains, app HEAD/dirty state |
| GATES.md | Requirement → check → TMB/Ponytail → status/limitations |
| SOURCE_EXCERPTS.md | Code thật được trích theo symbol/range/hash |

Native tests/experiments, WASM integration và browser behavior là ba tầng evidence khác nhau. Không gắn label physical-device, Wink-host hay production cho các check local. Không có deployment, tournament/strength calibration hoặc universal performance optimum trong evidence này.

TMB dùng orchestrator/layout ownership lens; Ponytail-review chỉ over-engineering. Các review JSON ghi path/hash và findings. Correctness đến từ commands/fixtures, không đến từ việc đã đọc skill.
