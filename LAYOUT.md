<!-- trustmebro -->
# Project Layout — Đồ Án Cơ Sở (Caro AI & UI)

Map of the research workspace, notes structure, and game implementation subsystems.
Rule: when a change adds, moves or removes a module, component, layer, audio bus, platform contract or storage key, update this file in the same commit. Point to files; don't paste code.

Last updated: 2026-10-01.

## Overview

Workspace for "Đồ án cơ sở: Caro AI" containing academic research notes (Obsidian vault covering Weeks 1–6: Minimax, Alpha-Beta Pruning, Heuristic Evaluation) and the frontend prototype (`Caro Game UI Design/`) featuring a vintage parchment paper aesthetic with React 19 and TailwindCSS v4.

## Subsystems & Projects

| Subsystem | Location | Description | Architectural Map |
| :--- | :--- | :--- | :--- |
| **Caro Game UI Design** | `Caro Game UI Design/` | React 19 + TailwindCSS v4 UI frontend prototype (Figma Make) | [`Caro Game UI Design/LAYOUT.md`](file:///home/pro/Downloads/basicproject/Caro%20Game%20UI%20Design/LAYOUT.md) |
| **Research Vault (Notes)** | `Week1/` – `Week6/` | Obsidian notes: đề cương, rules, minimax, alpha-beta, heuristic | See Folder Tree below |
| **Core Game & AI Engine** | `../vnuk/basicProject/10_caro/` | Full TypeScript + Rust/WASM + Wink SDK v1 production codebase | Check repo `10_caro` |

## Folder tree

```
basicproject/
├── LAYOUT.md                     # Top-level workspace layout and subsystem map
├── Caro Game UI Design/          # Web frontend project (React 19, TailwindCSS v4)
│   ├── LAYOUT.md                 # Detailed game architecture and UI layout
│   ├── package.json              # Dependencies: react, lucide-react, tailwindcss
│   ├── vite.config.ts            # Vite 8 config
│   ├── index.html                # App mount root
│   └── src/
│       ├── App.tsx               # UI shell, Board grid, Player cards, History panel
│       ├── game.ts               # Board state, win detection, heuristic AI
│       └── index.css             # Paper vintage palette & theme tokens
├── Week1/                        # Research foundation, rules, state space & đề cương
├── Week2/                        # TypeScript core game engine & correctness baseline
├── Week3/                        # Heuristic evaluation & pattern detection design
├── Week4/                        # Rule-based bot, pattern detection, heuristic implementation
├── Week5/                        # Minimax algorithm research, game tree & depth limits
└── Week6/                        # Alpha-Beta pruning, search time & visited nodes benchmark
```

## Quick References
- Detailed Game UI Layout: [`Caro Game UI Design/LAYOUT.md`](file:///home/pro/Downloads/basicproject/Caro%20Game%20UI%20Design/LAYOUT.md)
