import { memo, useState } from "react"
import type { Cell, Player } from "../domain"
import { Piece } from "./Piece"

export interface BoardCellProps {
  value: Cell
  currentTurn?: Player
  isLastMove: boolean
  isWinningCell: boolean
  isStarPoint?: boolean
  disabled: boolean
  row?: number
  col?: number
  onClick: () => void
}

export const BoardCell = memo(function BoardCell({
  value,
  currentTurn,
  isLastMove,
  isWinningCell,
  isStarPoint = false,
  disabled,
  row,
  col,
  onClick,
}: BoardCellProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (disabled || value !== null) return
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(12)
      } catch {
        // Ignore vibration errors
      }
    }
    onClick()
  }

  const className = [
    "board-cell",
    value && "occupied",
    isLastMove && "last-move",
    isWinningCell && "win-cell",
    isStarPoint && !value && "star-point",
  ]
    .filter(Boolean)
    .join(" ")

  const labelCoords = row !== undefined && col !== undefined ? `Hàng ${row + 1}, Cột ${col + 1}: ` : ""
  const labelState = value ? `Quân ${value}` : isStarPoint ? "Điểm sao (ô trống)" : "Ô trống"

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || value !== null}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-pos={row !== undefined && col !== undefined ? `${row},${col}` : undefined}
      aria-label={`${labelCoords}${labelState}`}
    >
      {/* Star point dot indicator */}
      {isStarPoint && !value && !isHovered && (
        <span
          className="star-point-dot"
          aria-hidden
        />
      )}

      {/* Actual placed piece */}
      {value && (
        <span className="piece-enter piece-enter-wrap">
          <Piece player={value} />
          {isLastMove && !isWinningCell && (
            <span className="last-move-indicator" aria-hidden />
          )}
        </span>
      )}

      {/* Ghost preview piece on hover when cell is empty */}
      {!value && !disabled && isHovered && currentTurn && (
        <span className="piece-ghost-wrap" aria-hidden>
          <Piece player={currentTurn} isGhost />
        </span>
      )}
    </button>
  )
})
