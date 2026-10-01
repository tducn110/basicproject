<!-- trustmebro -->
# Project layout

Map of the game architecture: subsystems, rendering, simulation, platform SDK, and lifecycles.
Rule: when a change adds, moves or removes a module, component, layer, audio bus, platform contract or storage key, update this file in the same commit. Point to files; don't paste code.

Last updated: 2026-10-01.

## Overview

Caro (Gomoku) 15×15 web game with vintage parchment/paper aesthetic. Pure DOM/React 19 presentation layer with CSS Grid board and deterministic 1v1 Player vs Player rule engine. User clicks dispatch to `placeMove` in `src/App.tsx`, triggering win detection along 4 axes in `src/game.ts`.

## TMB Game Design Dependencies

`game-design` is the governing package for this layout. Every row must point to the concrete implementation, or state `N/A — <reason>`; do not leave a row blank.

| Contract | Scope | Implementation evidence | Status |
| :--- | :--- | :--- | :--- |
| `game-layout-standard` | React shell, Pixi stage, pure simulation ownership | `src/App.tsx`, `src/game.ts` (DOM Grid instead of Pixi stage) | gap |
| `game-pixijs-runtime` | app lifecycle, scene layers, assets, input, ticker, cleanup, performance | N/A — Rendered via React DOM and CSS Grid; PixiJS not yet integrated | gap |
| `game-viewport-layout` | logical space, uniform scale, coordinate mapping, safe areas | `src/App.tsx` (`min(calc(100vw - 32px), calc(100dvh - 210px), 620px)`) | met |
| `game-mobile-web-quirks` | mobile viewport, touch, selection, overscroll behavior | `src/index.css` (`box-sizing`, `overflow: hidden`, touch targets) | met |
| `game-ui-components` | reusable shared HUD, button, modal, and overlay components | `src/App.tsx` (`BoardCell`, `BoardGrid`, `PlayerCard`, `MobilePlayerBar`, `WinBanner`, `InfoCard`, `HistoryPanel`) | met |
| `dedup-merge` | shared gameplay/UI/reuse boundary and deliberately separate variants | `src/App.tsx` (Inline sub-components in single file; gap for component extraction) | gap |
| `game-audio-design` | semantic event-to-SFX contract and evidence status | N/A — Audio engine not yet implemented | gap |
| `game-audio-mastering` | buses, limiter, gesture unlock, mute lifecycle | N/A — Web Audio API not yet configured | gap |
| `game-review-gates` | state, lifecycle, and ownership review before patches | `LAYOUT.md` | met |
| `gameplay-experience-gate` | player outcome, research evidence, fairness, feedback, acceptance checks | `src/game.ts` (5-in-a-row deterministic win rule, pure 1v1 model) | met |
| `game-wink-sdk-v1` | required for Wink targets; record standalone reason otherwise | N/A — Standalone Web App, Wink SDK v1 not integrated | gap |
| `wink-minigame-handoff` | required for Wink delivery; record non-Wink reason otherwise | N/A — Standalone UI prototype | gap |

## Folder tree

```
CaroGame/
├── index.html            # Application entry HTML and mount root (#root)
├── package.json          # Manifest (React 19, Lucide React, TailwindCSS v4, Vite 8)
├── tsconfig.json         # TypeScript configuration (ESNext, React JSX)
├── vite.config.ts        # Vite build tool with TailwindCSS v4 and React plugins
├── LAYOUT.md             # Architecture and subsystem ownership map
└── src/
    ├── main.tsx          # React application root entry point (StrictMode mount)
    ├── App.tsx           # Monolithic UI shell, state machine, sub-components, and board render
    ├── game.ts           # Pure simulation: board model, win detection (Implement layer)
    ├── index.css         # Paper theme tokens, fonts, animations, responsive rules
    └── vite-env.d.ts     # Vite client type definitions
```

## Architecture, Ownership & Data Pipeline Mapping

Pipeline stage reference:
`INPUT -> PROCESS -> STATE -> EVENT -> SIDE EFFECT -> OUTPUT -> FEEDBACK`

| Layer / Subsystem | Phân loại | Pipeline Stage | Owner | Responsibilities | Key Files |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Game Simulation** | **Implement** | `PROCESS` | Pure TS | 15×15 Board matrix, 4-direction win detection, deterministic move validation | [`src/game.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/game.ts) |
| **Game Coordination** | **Trung chuyển** | `EVENT <-> STATE` | React Hook / Controller | Điều phối lượt chơi (X/O), dispatch move, kiểm tra điều kiện ván đấu | `src/App.tsx` (cần tách `useCaroGame.ts`) |
| **Match Timer** | **Trung chuyển** | `SIDE EFFECT -> STATE` | React Hook | Vòng đời đồng hồ bấm giờ (1s interval tick), tách rời khỏi nước cờ | `src/App.tsx` (cần tách `useGameTimer.ts`) |
| **UI Shell & Header** | **Presentation** | `OUTPUT / INPUT` | React 19 | Khung ứng dụng, thanh tiêu đề 1v1, nút chức năng (Chơi lại, Ván mới) | [`src/App.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/App.tsx) |
| **Board View** | **Presentation** | `OUTPUT / INPUT` | CSS Grid / React DOM | Render 225 ô cờ giấy, quân cờ SVG, highlight đường thắng, nhận click | `src/App.tsx` (cần tách `BoardGrid.tsx`, `BoardCell.tsx`) |
| **Player & History HUD** | **Presentation** | `OUTPUT` | React DOM | Thẻ người chơi 1/2, thanh VS mobile, danh sách lịch sử nước đi | `src/App.tsx` (cần tách `PlayerCard.tsx`, `HistoryPanel.tsx`) |
| **Match Banner** | **Presentation** | `OUTPUT / INPUT` | React DOM | Modal / banner vinh danh chiến thắng hoặc hòa cờ | `src/App.tsx` (cần tách `WinBanner.tsx`) |
| **Design System Tokens** | **Asset / Style** | `OUTPUT` | CSS Variables | Bảng màu giấy cổ vintage (`--bg-paper`, `--ink`, `--vermilion`, `--indigo`) | [`src/index.css`](file:///home/pro/Downloads/basicproject/CaroGame/src/index.css) |

## State Single-Responsibility Invariant & Flows

Mỗi state trong User Flow chỉ chịu trách nhiệm duy nhất cho **1 mục tiêu (Goal)** và **1 vòng đời (Lifecycle)**:

1. **Authoritative Game State** (`board`, `currentPlayer`, `winner`, `isDraw`, `history`):
   - *Mục tiêu*: Tính toàn vẹn của ván cờ.
   - *Flow*: `User Click` (`INPUT`) → `handleCellClick` (`EVENT`) → `checkWinner` (`PROCESS`) → Cập nhật `board`, `currentPlayer` (`STATE`) → Báo chiến thắng nếu đạt 5 quân liên tiếp.
2. **Match Timer State** (`elapsedSeconds`, `isRunning`):
   - *Mục tiêu*: Đo thời gian trận đấu độc lập.
   - *Flow*: Khởi động khi ván mới, tick mỗi 1000ms (`SIDE EFFECT`), pause khi game over (`FEEDBACK`). Tuyệt đối không làm re-render bàn cờ `BoardGrid`.
3. **UI Transient State** (Modal visibility, active feedback, animation locks):
   - *Mục tiêu*: Trải nghiệm hiển thị tạm thời, không được trở thành authoritative state của ván cờ.

## Viewport & Responsive Layout

- **Board Sizing**: `width: min(calc(100vw - 32px), calc(100dvh - 210px), 620px)` with 1:1 square aspect ratio.
- **Desktop (>= 1024px)**: 3-column layout (`.desktop-row`):
  - Left column (200px): Player Cards (`PlayerCard` for X and O).
  - Center column: `BoardGrid` (square paper board).
  - Right column (210px): `InfoCard` + `HistoryPanel`.
- **Mobile (< 1024px)**: Stacked single-column layout:
  - Top bar: `MobilePlayerBar`.
  - Center: `BoardGrid` (`.mobile-board`).
  - Bottom: Compact `InfoCard` + `HistoryPanel` (`.mobile-info`).

## Discovered Gaps & Architectural Issues (Mapped to Roadmap)

1. **State Overload in `src/App.tsx`**: `App.tsx` đang cùng lúc gánh 3 vai trò (Implement Game Loop, Trung chuyển Timer, Render toàn bộ UI) và giữ cả 3 state (`GameState`, `TimerState`, `UIState`) trong cùng một component.
   - *Giải pháp*: Phân tách thành Custom Hooks (`useCaroGame`, `useGameTimer`) và tách các presentation components vào `src/components/`.
2. **No Audio Feedback**: Chưa có âm thanh tiếng gõ cờ giấy, tiếng chuông thắng trận.
3. **No Persistent Storage**: Chưa lưu trữ số ván thắng/hòa của Người chơi 1 vs Người chơi 2 vào `localStorage`.
