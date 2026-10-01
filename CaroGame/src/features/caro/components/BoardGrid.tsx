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
    <div className="paper-card board-card">
      <div
        role="grid"
        aria-label="Bàn cờ Caro"
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
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
