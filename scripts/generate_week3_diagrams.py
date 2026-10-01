#!/usr/bin/env python3
"""
Generate architectural diagrams for Week 3 documentation via Mermaid Ink API.
Saves high-resolution PNGs directly to Week3/assets/.
"""

import os
import base64
import urllib.request

DIAGRAM_1_FLOW = """graph TD
    subgraph INPUT["1. INPUT STAGE"]
        A1["User Board Cell Click (r, c)"]
        A2["Replay / New Game Action"]
    end

    subgraph EVENT["2. EVENT STAGE"]
        B1["handleCellClick(row, col)"]
        B2["handleReplay() / handleNewGame()"]
    end

    subgraph PROCESS["3. PROCESS STAGE (Implement)"]
        C1["board.ts: checkWinner(board, r, c)"]
        C2["4-Axis Line Scanning (H, V, D1, D2)"]
    end

    subgraph STATE["4. STATE STAGE (Trung chuyển)"]
        D1["useCaroGame (GameState)"]
        D1_sub["board, currentPlayer, winner, history"]
        D2["useGameTimer (TimerState)"]
        D2_sub["elapsed (sec), 1s interval tick"]
    end

    subgraph OUTPUT["5. OUTPUT STAGE (Presentation)"]
        E1["BoardGrid (225 BoardCell Buttons)"]
        E2["PlayerCard / MobilePlayerBar"]
        E3["GameInfo / MoveHistory"]
        E4["WinBanner (Victory / Draw Modal)"]
    end

    subgraph FEEDBACK["6. FEEDBACK & INVARIANTS"]
        F1["Visual: SVG Piece Animation + Highlight"]
        F2["State Invariant: Timer tick NEVER re-renders BoardGrid"]
    end

    A1 --> B1
    A2 --> B2
    B1 --> C1
    C1 --> C2
    C2 --> D1
    B2 --> D1
    B2 --> D2
    D1 -.->|"gameStarted, isGameOver"| D2
    D1 --> E1
    D1 --> E2
    D1 --> E4
    D2 --> E3
    D1 --> E3
    E1 --> F1
    D2 -.->|"Zero DOM Diff"| F2
"""

DIAGRAM_2_HIERARCHY = """graph TD
    App["App.tsx (Root Mount - 5 lines)"]
    Page["CaroGamePage.tsx (Layout Orchestrator)"]

    App --> Page

    subgraph Hooks["Trung Chuyển Layer (Hooks)"]
        H1["useCaroGame.ts<br/>Authoritative GameState"]
        H2["useGameTimer.ts<br/>Independent TimerState"]
    end

    subgraph Domain["Implement Layer (Pure TS Domain)"]
        D1["domain/board.ts<br/>createBoard, checkWinner"]
        D2["domain/constants.ts<br/>BOARD_SIZE=15, WIN_COUNT=5"]
        D3["domain/types.ts<br/>Player, Board, WinResult"]
    end

    subgraph Presentation["Presentation Layer (Pure UI Components)"]
        C1["BoardGrid.tsx"]
        C2["BoardCell.tsx"]
        C3["Piece.tsx (SVG X/O)"]
        C4["PlayerCard.tsx (Desktop Turn)"]
        C5["PlayerBar.tsx (Mobile VS Bar)"]
        C6["WinBanner.tsx (Victory Modal)"]
        C7["GameInfo.tsx (Match Specs)"]
        C8["MoveHistory.tsx (Action Log)"]
        C9["GameActions.tsx (Action Buttons)"]
    end

    Page --> H1
    Page --> H2
    H1 --> D1
    D1 --> D2
    D1 --> D3

    Page --> C1
    C1 --> C2
    C2 --> C3
    Page --> C4
    Page --> C5
    C5 --> C3
    Page --> C6
    Page --> C7
    Page --> C8
    Page --> C9
"""

def export_mermaid(code: str, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    b64 = base64.urlsafe_b64encode(code.strip().encode('utf-8')).decode('ascii').rstrip('=')
    url = f"https://mermaid.ink/img/{b64}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    print(f"Downloading diagram: {output_path}...")
    with urllib.request.urlopen(req, timeout=20) as resp:
        content = resp.read()
        if len(content) > 100:
            with open(output_path, 'wb') as f:
                f.write(content)
            print(f"✓ Saved: {output_path} ({len(content)} bytes)")
            return True
        else:
            print(f"✗ Failed (content too small): {output_path}")
            return False

if __name__ == '__main__':
    export_mermaid(DIAGRAM_1_FLOW, "Week3/assets/ui_architecture_flow.png")
    export_mermaid(DIAGRAM_2_HIERARCHY, "Week3/assets/component_hierarchy.png")
