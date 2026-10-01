import { memo } from "react"
import type { Player } from "../domain"
import { Piece } from "./Piece"

export interface PlayerBarProps {
  currentPlayer: Player
  isGameOver: boolean
  p1label?: string
  p2label?: string
}

/** Player side slot — one half of the mobile VS bar */
function PlayerSlot({
  player,
  label,
  isActive,
  reverse = false,
}: {
  player: Player
  label: string
  isActive: boolean
  reverse?: boolean
}) {
  const p = player.toLowerCase()
  const bg = isActive
    ? player === "X"
      ? "rgba(168,75,42,0.10)"
      : "rgba(49,90,114,0.10)"
    : "transparent"
  const border = isActive ? `var(--${p}-color)` : "transparent"
  const borderProp = reverse ? "borderRight" : "borderLeft"

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        flexDirection: reverse ? "row-reverse" : "row",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 6,
        background: bg,
        [borderProp]: `3px solid ${border}`,
        transition: "background 120ms",
      }}
    >
      <div className={`piece-avatar sm ${p}`}>
        <Piece player={player} />
      </div>
      <div style={{ minWidth: 0, textAlign: reverse ? "right" : "left" }}>
        <div
          style={{ fontSize: 10, fontWeight: 700, color: `var(--${p}-color)` }}
        >
          {player}
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
          {label}
        </div>
      </div>
      {isActive && (
        <span
          style={{
            [reverse ? "marginRight" : "marginLeft"]: "auto",
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.05em",
            padding: "1px 5px",
            borderRadius: 4,
            background:
              player === "X" ? "rgba(168,75,42,0.12)" : "rgba(49,90,114,0.12)",
            color: `var(--${p}-color)`,
          }}
        >
          ↩
        </span>
      )}
    </div>
  )
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
    <div className="paper-card mobile-player-bar">
      <PlayerSlot player="X" label={p1label} isActive={activeX} />
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
      <PlayerSlot player="O" label={p2label} isActive={activeO} reverse />
    </div>
  )
})

export const MobilePlayerBar = PlayerBar
