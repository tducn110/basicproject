<!-- trustmebro -->
# Project layout

Map of the game architecture: subsystems, rendering, simulation, platform SDK, and lifecycles.
Rule: when a change adds, moves or removes a module, component, layer, audio bus, platform contract or storage key, update this file in the same commit. Point to files; don't paste code.

Last updated: 2026-10-01.

## Overview

Caro (Gomoku) 15×15 web game with vintage parchment/paper aesthetic exported from Figma Make. Pure DOM/React 19 presentation layer with CSS Grid board and heuristic Rule-based AI. User clicks dispatch to `placeMove` in `src/App.tsx`, triggering win detection and AI response in `src/game.ts`.

## TMB Game Design Dependencies

`game-design` is the governing package for this layout. Every row must point to the concrete implementation, or state `N/A — <reason>`; do not leave a row blank.

| Contract | Scope | Implementation evidence | Status |
| :--- | :--- | :--- | :--- |
| `game-layout-standard` | React shell, Pixi stage, pure simulation ownership | `src/App.tsx`, `src/game.ts` (DOM Grid instead of Pixi stage) | gap |
| `game-pixijs-runtime` | app lifecycle, scene layers, assets, input, ticker, cleanup, performance | N/A — Rendered via React DOM and CSS Grid; PixiJS not yet integrated | gap |
| `game-viewport-layout` | logical space, uniform scale, coordinate mapping, safe areas | `src/App.tsx` (`min(calc(100vw - 32px), calc(100dvh - 210px), 620px)`) | met |
| `game-mobile-web-quirks` | mobile viewport, touch, selection, overscroll behavior | `src/index.css` (`box-sizing`, `overflow: hidden`, touch targets) | met |
| `game-ui-components` | reusable shared HUD, button, modal, and overlay components | `src/App.tsx` (`BoardCell`, `BoardGrid`, `PlayerCard`, `MobilePlayerBar`, `WinBanner`, `InfoCard`, `HistoryPanel`) | met |
| `dedup-merge` | shared gameplay/UI/reuse boundary and deliberately separate variants | `src/App.tsx` (Inline sub-components in single file) | gap |
| `game-audio-design` | semantic event-to-SFX contract and evidence status | N/A — Audio engine not yet implemented | gap |
| `game-audio-mastering` | buses, limiter, gesture unlock, mute lifecycle | N/A — Web Audio API not yet configured | gap |
| `game-review-gates` | state, lifecycle, and ownership review before patches | `LAYOUT.md` | met |
| `gameplay-experience-gate` | player outcome, research evidence, fairness, feedback, acceptance checks | `src/game.ts` (5-in-a-row win rule, heuristic bot evaluation) | met |
| `game-wink-sdk-v1` | required for Wink targets; record standalone reason otherwise | N/A — Standalone Web App, Wink SDK v1 not integrated | gap |
| `wink-minigame-handoff` | required for Wink delivery; record non-Wink reason otherwise | N/A — Standalone UI prototype | gap |

## Folder tree

```
Caro Game UI Design/
├── index.html            # Application entry HTML and mount root (#root)
├── package.json          # Manifest (React 19, Lucide React, TailwindCSS v4, Vite 8)
├── tsconfig.json         # TypeScript configuration (ESNext, React JSX)
├── vite.config.ts        # Vite build tool with TailwindCSS v4 and React plugins
├── LAYOUT.md             # Architecture and subsystem ownership map
└── src/
    ├── main.tsx          # React application root entry point (StrictMode mount)
    ├── App.tsx           # UI shell, state machine, sub-components, and board render
    ├── game.ts           # Game simulation: board model, win detection, heuristic AI
    ├── index.css         # Paper theme tokens, fonts, animations, responsive rules
    └── vite-env.d.ts     # Vite client type definitions
```

## Architecture & Ownership

| Layer | Owner | Responsibilities | Key Files |
| :--- | :--- | :--- | :--- |
| **UI Presentation** | React 19 (`src/App.tsx`) | Header, Player Cards, Turn Indicator, Mobile Bar, Win Banner, Mode Tabs, Action Footer | `src/App.tsx` |
| **Board Render** | CSS Grid / React DOM | 15×15 Board Grid, Cell state (occupied, last move, win highlight), Piece SVGs (X/O) | `src/App.tsx` (`BoardGrid`, `BoardCell`) |
| **Game Simulation** | Pure TS (`src/game.ts`) | 15×15 Board state, 4-direction win detection (horizontal, vertical, diagonals) | `src/game.ts` (`checkWinner`, `createBoard`) |
| **Bot AI** | Pure TS (`src/game.ts`) | 2-step Chebyshev candidate generator, line scoring (open/half-open lines), move selection | `src/game.ts` (`getAIMove`, `scorePosition`) |
| **Design System** | CSS Tokens (`src/index.css`) | Paper/ink palette, Google Fonts (Playfair Display, Lato), coffee ring decorations | `src/index.css` |
| **Storage & State** | React State (in-memory) | Board grid, history log, elapsed timer, current mode (1v1 vs AI) | `src/App.tsx` |

**Flows**
- **Boot**: Browser loads `index.html` → `src/main.tsx` mounts `<App />` → Initial state (`createBoard()`, Player "X", mode "1v1").
- **Player Move**: User clicks empty `BoardCell` → `handleCellClick` → `placeMove(row, col)`:
  1. Validates cell is unoccupied and game not over.
  2. Updates board matrix with player stone.
  3. Appends move to `history` and records `lastMove`.
  4. Calls `checkWinner(next, row, col)` along 4 axes.
  5. If won → sets `winner` ({ winner, cells }) → displays `WinBanner` and highlights winning cells.
  6. If 225 moves reached without winner → sets `isDraw(true)`.
  7. If playing → toggles player turn ("X" ↔ "O").
- **AI Turn**: If mode is "ai" and `currentPlayer === "O"`:
  1. `useEffect` sets `aiThinking = true` (shows thinking dots on AI PlayerCard).
  2. Sets 380ms timeout simulating deliberation.
  3. Calls `getAIMove(board, "O")` → evaluates candidate positions.
  4. Calls `placeMove(r, c, true)`.
- **Game Reset / New Game**: `handleReplay` clears board, resets timer, and clears history; `handleNewGame` switches mode ("1v1" / "ai").

## Viewport & Responsive Layout

- **Board Sizing**: `width: min(calc(100vw - 32px), calc(100dvh - 210px), 620px)` with 1:1 square aspect ratio.
- **Layout Modes**:
  - **Desktop (>= 1024px)**: 3-column layout (`.desktop-row`):
    - Left column (200px): Player Cards (`PlayerCard` for X and O).
    - Center column: `BoardGrid` (square paper board).
    - Right column (210px): `InfoCard` (mode, size, timer) + `HistoryPanel` (scrollable move list).
  - **Mobile (< 1024px)**: Stacked single-column layout:
    - Top bar: `MobilePlayerBar` (compact VS strip with turn indicators).
    - Center: `BoardGrid` (`.mobile-board`).
    - Bottom: Compact `InfoCard` + `HistoryPanel` (`.mobile-info`).
- **Touch / Mobile Guards**: `box-sizing: border-box`, `overflow: hidden`, non-selectable decorative coffee rings (`pointer-events: none`).

## Platform SDK & Audio Contracts

- **Platform SDK**: Standalone Web UI prototype (no Wink SDK v1, ads, or remote leaderboard integration).
- **Audio Engine**: None currently implemented (no stone placement clicks, victory jingles, or BGM).

## Persistence & Storage

- Current status: Fully in-memory state via React `useState` / `useRef`.
- Gaps for production compliance:
  - Game statistics (win/loss/draw counts) not persisted.
  - Sound preference toggle and volume not persisted.
  - Match resume / local autosave not persisted.

## Discovered Gaps & Architectural Issues

1. ~~**Broken Import in `src/App.tsx` (Line 23)**: `App.tsx` imports from `"./lib/game"` but the file is located at `src/game.ts` (`"./game"`).~~ *(Resolved: fixed import to `./game` and configured `.figma/make/site.json`)*
2. **Monolithic Component Structure**: `src/App.tsx` contains 742 lines with multiple inline components (`BoardCell`, `BoardGrid`, `PlayerCard`, `MobilePlayerBar`, `WinBanner`, `InfoCard`, `HistoryPanel`). Should be extracted into modular `src/components/` files.
3. **No Audio Feedback**: Missing stone placement SFX, timer tick, and win/loss jingle.
4. **No i18n Localization**: Text strings (Vietnamese) are hardcoded directly into JSX components.
5. **No Persistent Storage**: High score / statistics are reset on page reload.
