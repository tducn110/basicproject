import type React from "react"
import type { Player } from "../domain"

interface PieceProps {
  player: Player
  className?: string
  style?: React.CSSProperties
}

export function Piece({ player, className, style }: PieceProps) {
  if (player === "X") {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className ?? "piece"}
        style={{ width: "62%", height: "62%", ...style }}
        aria-hidden
      >
        <line
          x1="18"
          y1="18"
          x2="82"
          y2="82"
          stroke="var(--x-color, #a84b2a)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <line
          x1="82"
          y1="18"
          x2="18"
          y2="82"
          stroke="var(--x-color, #a84b2a)"
          strokeWidth="15"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className ?? "piece"}
      style={{ width: "62%", height: "62%", ...style }}
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="var(--o-color, #315a72)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  )
}
