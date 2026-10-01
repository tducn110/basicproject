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
| `game-audio-design` | semantic event-to-SFX contract and evidence status | `src/features/caro/audio/soundManager.ts` (wood/paper tap, win chime, draw, click) | met |
| `game-audio-mastering` | buses, limiter, gesture unlock, mute lifecycle | `src/features/caro/audio/soundManager.ts` (Master Bus, DynamicsCompressorNode limiter) | met |
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
    ├── App.tsx           # Thin UI mount root (5 lines, renders CaroGamePage)
    ├── game.ts           # Pure simulation re-export shim
    ├── index.css         # Paper theme tokens, fonts, utility classes, responsive rules
    ├── lib/game.ts       # Re-export shim for game core
    └── features/caro/    # Domain-Driven Caro Subsystem
        ├── CaroGamePage.tsx # Page layout assembly and responsive orchestration
        ├── domain/       # Implement layer (Pure TS, deterministic)
        │   ├── board.ts      # 15×15 matrix creation & 4-axis win detection
        │   ├── constants.ts  # BOARD_SIZE (15), WIN_COUNT (5), DIRS
        │   ├── types.ts      # Player, Cell, Board, Move, WinResult contracts
        │   └── index.ts      # Public domain barrel export
        ├── audio/        # Implement layer (Web Audio API Synthesizer)
        │   └── soundManager.ts # Master Bus, Brick-wall Limiter, semantic vintage paper SFX
        ├── hooks/        # Trung chuyển layer (State & Effect coordination)
        │   ├── useCaroGame.ts   # Authoritative GameState coordinator (useReducer pure model)
        │   ├── useGameTimer.ts  # Independent TimerState coordinator (1s tick, reset)
        │   └── useGameAudio.ts  # Audio state and event triggers coordinator
        └── components/   # Presentation layer (Pure view components)
            ├── BoardCell.tsx    # Single cell button with SVG piece & win highlight
            ├── BoardGrid.tsx    # 15×15 CSS Grid container
            ├── PlayerCard.tsx   # Desktop active turn cards with variant tokens
            ├── PlayerBar.tsx    # Mobile responsive player VS bar with PlayerSlot
            ├── WinBanner.tsx    # End-game victory/draw overlay announcement
            ├── GameInfo.tsx     # Match info & MoveHistory drawer
            ├── MoveHistory.tsx  # Re-export shim for GameInfo MoveHistory
            ├── GameActions.tsx  # Replay / New Game action footer
            ├── Piece.tsx        # Standardized SVG X and O piece renderer
            └── index.ts         # Components barrel export
```

## Architecture, Ownership & Data Pipeline Mapping

Pipeline stage reference:
`INPUT -> PROCESS -> STATE -> EVENT -> SIDE EFFECT -> OUTPUT -> FEEDBACK`

| Layer / Subsystem | Phân loại | Pipeline Stage | Owner | Responsibilities | Key Files |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Game Simulation** | **Implement** | `PROCESS` | Pure TS | 15×15 Board matrix, 4-direction win detection, deterministic move validation | [`src/features/caro/domain/board.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/board.ts) |
| **Game Coordination** | **Trung chuyển** | `EVENT <-> STATE` | React Hook | Điều phối lượt chơi (X/O), dispatch move, kiểm tra điều kiện ván đấu | [`src/features/caro/hooks/useCaroGame.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useCaroGame.ts) |
| **Match Timer** | **Trung chuyển** | `SIDE EFFECT -> STATE` | React Hook | Vòng đời đồng hồ bấm giờ (1s interval tick), tách rời khỏi nước cờ | [`src/features/caro/hooks/useGameTimer.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useGameTimer.ts) |
| **UI Page Shell** | **Presentation** | `OUTPUT / INPUT` | React 19 | Khung trang ứng dụng, header, bố cục 3 cột desktop / 1 cột mobile | [`src/features/caro/CaroGamePage.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/CaroGamePage.tsx) |
| **Board View** | **Presentation** | `OUTPUT / INPUT` | CSS Grid / React DOM | Render 225 ô cờ giấy, quân cờ SVG, highlight đường thắng, nhận click | [`src/features/caro/components/BoardGrid.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/BoardGrid.tsx) |
| **Player HUD** | **Presentation** | `OUTPUT` | React DOM | Thẻ người chơi 1/2 desktop, thanh VS mobile (`PlayerSlot`) | [`src/features/caro/components/PlayerCard.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/PlayerCard.tsx), [`PlayerBar.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/PlayerBar.tsx) |
| **Match Banner** | **Presentation** | `OUTPUT / INPUT` | React DOM | Banner chiến thắng / hòa cờ với nút Chơi lại và Ván mới | [`src/features/caro/components/WinBanner.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/WinBanner.tsx) |
| **Game Info & History**| **Presentation** | `OUTPUT` | React DOM | Hiển thị thông số ván đấu và danh sách lịch sử nước đi | [`src/features/caro/components/GameInfo.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/GameInfo.tsx) |
| **Audio Synthesizer** | **Implement** | `SIDE EFFECT` | Web Audio API | Tổng hợp âm thanh gõ cờ gỗ/giấy, thắng trận, hòa cờ, limiter bus | [`src/features/caro/audio/soundManager.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/audio/soundManager.ts) |
| **Audio Coordination** | **Trung chuyển** | `EVENT -> SIDE EFFECT` | React Hook | Điều phối phát âm thanh theo sự kiện và quản lý trạng thái bật/tắt tiếng | [`src/features/caro/hooks/useGameAudio.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useGameAudio.ts) |
| **Design System Tokens** | **Asset / Style** | `OUTPUT` | CSS Variables | Bảng màu giấy cổ vintage (`--paper`, `--ink`, `--x-color`, `--o-color`) | [`src/index.css`](file:///home/pro/Downloads/basicproject/CaroGame/src/index.css) |

## State Single-Responsibility Invariant & Flows

Mỗi state trong User Flow chỉ chịu trách nhiệm duy nhất cho **1 mục tiêu (Goal)** và **1 vòng đời (Lifecycle)**:

1. **Authoritative Game State** (`board`, `currentPlayer`, `winner`, `isDraw`, `history`):
   - *Mục tiêu*: Tính toàn vẹn của ván cờ.
   - *Flow*: `User Click` (`INPUT`) → `handleCellClick` (`EVENT`) → `caroReducer` (`PROCESS`) → Cập nhật `board`, `currentPlayer` (`STATE`) → Phát âm thanh tương ứng (`SIDE EFFECT`) → Báo chiến thắng nếu đạt 5 quân liên tiếp.
2. **Match Timer State** (`elapsedSeconds`, `isRunning`):
   - *Mục tiêu*: Đo thời gian trận đấu độc lập.
   - *Flow*: Khởi động khi ván mới, tick mỗi 1000ms (`SIDE EFFECT`), pause khi game over (`FEEDBACK`). Tuyệt đối không làm re-render bàn cờ `BoardGrid`.
3. **UI Transient State** (Modal visibility, active feedback, animation locks):
   - *Mục tiêu*: Trải nghiệm hiển thị tạm thời, không được trở thành authoritative state của ván cờ.

## Viewport & Responsive Layout

- **Single DOM Instance Architecture**: Bàn cờ `BoardGrid` và các cụm thông tin được mount duy nhất một lần trên DOM tree, loại bỏ hoàn toàn việc nhân đôi DOM elements giữa desktop và mobile.
- **Board Sizing**:
  - Desktop: `width: min(calc(100vw - 24px), calc(100dvh - 210px), 620px)`
  - Tablet (641px - 1023px): `width: min(calc(100vw - 24px), calc(100dvh - 220px), 520px)`
  - Mobile (≤ 640px): `width: min(calc(100vw - 16px), calc(100dvh - 200px), 440px)`
  - Small Mobile (≤ 380px): `width: min(calc(100vw - 10px), calc(100dvh - 180px), 360px)`
- **Breakpoints**:
  - **Desktop (≥ 1024px)**: Bố cục 3 cột (`.game-layout`):
    - Left column (200px): Thẻ người chơi 1 & 2 (`PlayerCard`).
    - Center: Bàn cờ vuông 15×15 (`BoardGrid`).
    - Right column (210px): Bảng thông tin (`GameInfo`) + Lịch sử nước đi (`MoveHistory`).
    - `MobilePlayerBar`: ẩn (`display: none`).
  - **Tablet (641px - 1023px)**: Bố cục cột thích ứng:
    - Top: Thanh hiển thị VS người chơi (`PlayerBar`).
    - Center: Bàn cờ 15×15 (`BoardGrid`).
    - Bottom: Grid 2 cột cho `GameInfo` và `MoveHistory` ngang hàng.
  - **Mobile (≤ 640px)**: Bố cục dọc tối ưu màn hình cảm ứng:
    - Safe area support với `viewport-fit=cover` và `env(safe-area-inset-*)`.
    - `touch-action: manipulation` loại bỏ delay 300ms khi bấm cờ.
    - Cuộn dọc mượt mà (`overflow-y: auto`, `-webkit-overflow-scrolling: touch`), không bị tràn ngang (`overflow-x: hidden`).
    - `GameInfo` và `MoveHistory` xếp chồng nhỏ gọn dưới bàn cờ.

## Discovered Gaps & Architectural Issues (Mapped to Roadmap)

1. **[RESOLVED] State Overload in `src/App.tsx`**: Đã phân rã thành công thành 3 lớp kiến trúc:
   - Implement: `src/features/caro/domain/board.ts`
   - Trung chuyển: `useCaroGame.ts` (pure GameState qua useReducer) & `useGameTimer.ts` (pure TimerState)
   - Presentation: `src/features/caro/components/` (9 components đơn nhiệm, không inline styles dư thừa)
   - Shell: `App.tsx` rút gọn còn 5 dòng.
2. **[RESOLVED] Audio Feedback & Mastering**: Đã tích hợp Web Audio API (`src/features/caro/audio/soundManager.ts` & `src/features/caro/hooks/useGameAudio.ts`) với Master Bus, Limiter chống méo, âm thanh đặt cờ gỗ/giấy, thắng cuộc, hòa cờ, và nút toggle mute trên header.
3. **No Persistent Storage**: Chưa lưu trữ số ván thắng/hòa của Người chơi 1 vs Người chơi 2 vào `localStorage`.
