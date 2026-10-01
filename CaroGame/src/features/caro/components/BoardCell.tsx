import { memo } from "react"
import type { Cell } from "../domain"
import { Piece } from "./Piece"

export interface BoardCellProps {
  value: Cell
  isLastMove: boolean
  isWinningCell: boolean
  disabled: boolean
  onClick: () => void
}

export const BoardCell = memo(function BoardCell({
  value,
  isLastMove,
  isWinningCell,
  disabled,
  onClick,
}: BoardCellProps) {
  const className = [
    "board-cell",
    value && "occupied",
    isLastMove && "last-move",
    isWinningCell && "win-cell",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      className={className}
      disabled={disabled || value !== null}
      onClick={onClick}
      aria-label={value ?? "ô trống"}
    >
      {value && (
        <span
          className="piece-enter"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Piece player={value} />
        </span>
      )}
    </button>
  )
})
