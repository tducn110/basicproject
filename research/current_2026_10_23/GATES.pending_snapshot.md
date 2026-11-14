# Gate ledger — 23/10/2026

Phạm vi: local `basicProject`, Rust engine thật → WASM → Worker → UI và báo cáo `.md` tuần 1–7. Không có commit/push/deploy trong lượt này. `CREATED` khác `VERIFIED`; chưa có gate nào được gắn `ACCEPTED`.

TrustMeBro được áp dụng bằng đọc skill `orchestrator` và `layout-init`, đối chiếu ownership/dependency/layout; đây là workflow review, không có binary tên TMB để chạy. Ponytail được áp dụng từ `/home/pro/.gemini/config/plugins/ponytail/skills/ponytail-review/SKILL.md`, chỉ rà over-engineering, không chứng minh correctness. Hai lens được thực hiện cùng chu kỳ gate; correctness đến từ fixture/test riêng. Log ghi cả vấn đề bị phát hiện và lần sửa, không đổi audit thành PASS giả.

| Gate | Điều kiện | TMB | Ponytail | Correctness/evidence | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| G0 | Đúng checkout, baseline, spec, inventory | Map ownership và snapshot đã đọc | Không thêm kiến trúc khi chưa có nhu cầu | `baseline/`, `baseline_engine/`, `sources/drive_*.json` | VERIFIED cho inspection |
| G1 | Board invariant, apply/undo, full/empty/bounds | PASS — Board/state ownership, Game giữ history | `Lean already. Ship.` — 0 dòng cần bỏ sau đọc Board diff; safe accessor dùng ở boundary, không thêm trait một implementation | 16 Board tests PASS; [`G1_board_tests.log`](G1_board_tests.log) | VERIFIED |
| G2 | Candidate policy/utility trước wiring | PASS — candidates/eval owners tách rõ; independent reviewers | Lean already. Ship. 0 dòng bỏ | 5 candidate + 5 evaluator tests PASS, G2 logs; final corpus bổ sung ở G3 | VERIFIED ở policy module |
| G3 | MM/AB equivalence, utility, candidate tactical recall, counters | Pending | Pending | Native release raw results pending | Pending |
| G4 | WASM build/provenance, Worker truyền số thực đo | Adapter PASS sau sửa sync-constructor/fatal-worker recovery | Lean already. Ship. 0 dòng bỏ | Unit adapter/lifecycle PASS; real binary đang chờ G3 build | PARTIAL |
| G5 | Six tiers/Undo/Reset/thinking/stats/responsive input | Pending | Pending | TS tests + browser pending | Pending |
| G6 | Toán → pseudocode → source → tradeoff → evidence theo tuần | Pending | Pending | Markdown/links/formula consistency pending | Pending |

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
