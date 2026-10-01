import { memo } from "react"
import { BOARD_SIZE, type Board } from "../domain"
import { BoardCell } from "./BoardCell"

export interface BoardGridProps {
  board: Board
  lastMove: [number, number] | null
  winCellSet: Set<string>
  disabled: boolean
  onCellClick: (row: number, col: number) => void
}

export const BoardGrid = memo(function BoardGrid({
  board,
  lastMove,
  winCellSet,
  disabled,
  onCellClick,
}: BoardGridProps) {
  return (
    <div
      className="paper-card"
      style={{
        padding: 8,
        width: "min(calc(100vw - 32px), calc(100dvh - 210px), 620px)",
        aspectRatio: "1",
        borderTop: "3px solid var(--paper-deep)",
        flexShrink: 0,
      }}
    >
      <div
        role="grid"
        aria-label="Bàn cờ Caro"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          width: "100%",
          height: "100%",
          borderLeft: "1px solid var(--grid-line)",
          borderTop: "1px solid var(--grid-line)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`

            return (
              <BoardCell
                key={key}
                value={cell}
                isLastMove={
                  lastMove?.[0] === rowIndex && lastMove?.[1] === colIndex
                }
                isWinningCell={winCellSet.has(key)}
                disabled={disabled}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            )
          }),
        )}
      </div>
    </div>
  )
})
