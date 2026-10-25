# Evidence của bản sửa ngày 23/10/2026

Đây là evidence của engine gomoku-main/engine và app 10_caro trong basicProject, tách khỏi reference experiments ngày17/10. Source chưa commit: SHA256 trong provenance.json là định danh bản local; Git HEAD chỉ là commit nền của app.

## Reproduce

Chạy từ basicProject:

~~~bash
python3 research/current_2026_10_23/run_checks.py native
python3 research/current_2026_10_23/run_checks.py experiments
python3 research/current_2026_10_23/run_checks.py wasm
python3 research/current_2026_10_23/run_checks.py frontend
~~~

Node dependencies dùng npm ci --ignore-scripts với package-lock có sẵn. Script dùng Rust toolchain /home/pro/.cargo/bin vì /usr/bin có version/target khác. Không cài toolchain hay thư viện vào repo khác.

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
| provenance.json | Source hashes, toolchains, app HEAD/dirty state |
| GATES.md | Requirement → check → TMB/Ponytail → status/limitations |
| SOURCE_EXCERPTS.md | Code thật được trích theo symbol/range/hash |

Native tests/experiments, WASM integration và browser behavior là ba tầng evidence khác nhau. Không gắn label physical-device, Wink-host hay production cho các check local. Không có deployment, tournament/strength calibration hoặc universal performance optimum trong evidence này.

TMB dùng orchestrator/layout ownership lens; Ponytail-review chỉ over-engineering. Các review JSON ghi path/hash và findings. Correctness đến từ commands/fixtures, không đến từ việc đã đọc skill.
