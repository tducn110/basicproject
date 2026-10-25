import type React from "react"
import type { Player } from "../domain"

interface PieceProps {
  player: Player
  className?: string
  style?: React.CSSProperties
  isGhost?: boolean
}

export function Piece({ player, className, style, isGhost = false }: PieceProps) {
  const isX = player === "X"
  const classes = ["piece-svg", isX ? "x" : "o", isGhost && "ghost", className]
    .filter(Boolean)
    .join(" ")

  if (isX) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={classes}
        style={style}
        aria-hidden="true"
      >
        <line
          x1="20"
          y1="20"
          x2="80"
          y2="80"
          stroke="var(--x-color)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <line
          x1="80"
          y1="20"
          x2="20"
          y2="80"
          stroke="var(--x-color)"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={classes}
      style={style}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="var(--o-color)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  )
}
