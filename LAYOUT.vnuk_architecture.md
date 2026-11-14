<!-- trustmebro -->
# Basic Project — bản đồ ownership hiện tại

Cập nhật 23/10/2026. Workspace báo cáo không có Git repo riêng; `10_caro/` có repo riêng và thay đổi chưa commit. Không dùng Git repo cha `/home/pro` làm provenance của dự án.

| Path | Trách nhiệm và dependency |
| --- | --- |
| `10_caro/src/App.tsx`, `src/app/GameController.ts` | React UI → controller → domain snapshot; controller sở hữu round và chấp nhận kết quả AI. |
| `10_caro/src/game/core/` | GameState và luật Freestyle Gomoku; TS sở hữu ván chơi ở main thread. |
| `10_caro/src/board/`, `src/pixi/` | Input theo ô, transform, render X/O bằng PixiJS 7; không quyết định winner. |
| `10_caro/src/game/ai/` | AI contract, tactical prepass và điều phối request. |
| `10_caro/src/game/wasm/` | Worker bridge, replay history và package WASM được build từ engine bên dưới. |
| `gomoku-main/engine/src/board.rs` | Board Rust, invariant place/undo, kiểm thắng, legal/candidate coordinates. |
| `gomoku-main/engine/src/ai.rs` | Strategy/difficulty, Minimax và Alpha-Beta, ordering, tactical protection, counters. |
| `gomoku-main/engine/src/eval.rs` | Heuristic chuỗi liên tiếp; không phải bộ pattern gián đoạn đầy đủ. |
| `gomoku-main/engine/src/lib.rs` | `Game` và wasm-bindgen boundary; sở hữu state của bản replay trong Worker. |
| `gomoku-main/web/` | UI tham khảo SVG độc lập; không phải app Pixi đang sửa. |
| `caro-core-reference/` | Reference study riêng; không dùng test của nó để chứng minh binary của game. |
| `Week1/` … `Week10/` | Bộ báo cáo nghiên cứu canonical; mỗi tuần giữ Markdown, DOCX, PDF và artifact bổ sung khi có. |
| `research/week_05_09/` | Evidence reference đã đóng băng ngày 17/10; không overwrite trong lượt sửa này. |
| `research/current_2026_10_23/` | Baseline, command logs, raw results, provenance và gate reviews của lượt sửa hiện tại. |
| `basic/`, `Tuan_01/` … `Tuan_04/`, `obsidian/` | Các reconstruction/notes và lịch đề cương khác; không tự đồng nhất ID tuần. |
| `Google_Drive_Sync/`, `VNUK_Caro_AI_Thesis_Complete_Bundle/` | Mirror/export lịch sử; không được regenerate bởi yêu cầu chỉ sửa Markdown này. |

Luồng: input → `GameController` → TS `GameState` → snapshot → React/Pixi. Lượt AI: controller → `AIController` → Worker → Rust `Game` replay → strategy/search → result → round/turn guards → TS state → render. Cancel/Undo/Reset thuộc controller và Worker bridge, không thuộc evaluator.

No database. Ván cờ ở bộ nhớ phiên; báo cáo/evidence ở filesystem.

Logic: `Board::place/undo` bảo vệ occupancy; `check_winner_at` kiểm 4 trục; `get_candidates` lọc gần quân; `Game::play_move` quản lý lượt; AI bảo toàn tactical membership trước cap; Worker đo thời gian boundary; UI biểu diễn snapshot và telemetry có nguồn.
