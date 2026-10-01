import { memo } from "react"
import type { Player } from "../domain"
import { Piece } from "./Piece"

export interface PlayerBarProps {
  currentPlayer: Player
  isGameOver: boolean
  p1label?: string
  p2label?: string
}

export const PlayerBar = memo(function PlayerBar({
  currentPlayer,
  isGameOver,
  p1label = "Người chơi 1",
  p2label = "Người chơi 2",
}: PlayerBarProps) {
  const activeX = !isGameOver && currentPlayer === "X"
  const activeO = !isGameOver && currentPlayer === "O"

  return (
    <div
      className="paper-card mx-3 flex items-center gap-1"
      style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)" }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 6,
          background: activeX ? "rgba(168,75,42,0.10)" : "transparent",
          borderLeft: activeX
            ? "3px solid var(--x-color)"
            : "3px solid transparent",
          transition: "background 120ms",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Piece player="X" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 10, fontWeight: 700, color: "var(--x-color)" }}
          >
            X
          </div>
          <div
            style={{
              fontSize: 9,
              color: "var(--ink-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p1label}
          </div>
        </div>
        {activeX && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "1px 5px",
              borderRadius: 4,
              background: "rgba(168,75,42,0.12)",
              color: "var(--x-color)",
            }}
          >
            ↩
          </span>
        )}
      </div>

      <span
        className="font-display"
        style={{
          fontSize: 11,
          color: "var(--ink-muted)",
          flexShrink: 0,
          padding: "0 4px",
        }}
      >
        VS
      </span>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 6,
          background: activeO ? "rgba(49,90,114,0.10)" : "transparent",
          borderRight: activeO
            ? "3px solid var(--o-color)"
            : "3px solid transparent",
          transition: "background 120ms",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Piece player="O" />
        </div>
        <div style={{ minWidth: 0, textAlign: "right" }}>
          <div
            style={{ fontSize: 10, fontWeight: 700, color: "var(--o-color)" }}
          >
            O
          </div>
          <div
            style={{
              fontSize: 9,
              color: "var(--ink-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p2label}
          </div>
        </div>
        {activeO && (
          <span
            style={{
              marginRight: "auto",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "1px 5px",
              borderRadius: 4,
              background: "rgba(49,90,114,0.12)",
              color: "var(--o-color)",
            }}
          >
            ↩
          </span>
        )}
      </div>
    </div>
  )
})

export const MobilePlayerBar = PlayerBar
