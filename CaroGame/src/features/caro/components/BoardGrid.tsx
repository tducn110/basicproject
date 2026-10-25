import { memo, useMemo } from "react"
import { BOARD_SIZE, type Board, type Player } from "../domain"
import { BoardCell } from "./BoardCell"

export interface BoardGridProps {
  board: Board
  currentPlayer: Player
  lastMove: [number, number] | null
  winCellSet: Set<string>
  disabled: boolean
  onCellClick: (row: number, col: number) => void
}

// 5 Standard Gomoku Star Points (Hoshi) on 15x15 board (0-indexed)
const STAR_POINTS = new Set(["3,3", "3,11", "7,7", "11,3", "11,11"])

export const BoardGrid = memo(function BoardGrid({
  board,
  currentPlayer,
  lastMove,
  winCellSet,
  disabled,
  onCellClick,
}: BoardGridProps) {
  const isStarPoint = useMemo(
    () => (row: number, col: number) => STAR_POINTS.has(`${row},${col}`),
    [],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const activeEl = document.activeElement as HTMLElement
    if (!activeEl || !activeEl.classList.contains("board-cell")) return

    const currentKey = activeEl.getAttribute("data-pos")
    if (!currentKey) return
    const [r, c] = currentKey.split(",").map(Number)
    let nextR = r
    let nextC = c

    if (e.key === "ArrowUp") nextR = Math.max(0, r - 1)
    else if (e.key === "ArrowDown") nextR = Math.min(BOARD_SIZE - 1, r + 1)
    else if (e.key === "ArrowLeft") nextC = Math.max(0, c - 1)
    else if (e.key === "ArrowRight") nextC = Math.min(BOARD_SIZE - 1, c + 1)
    else return

    e.preventDefault()
    const nextBtn = document.querySelector<HTMLButtonElement>(`[data-pos="${nextR},${nextC}"]`)
    nextBtn?.focus()
  }

  return (
    <div className="board-outer-shell">
      <div className="board-inner-frame">
        <div
          role="grid"
          aria-label="Bàn cờ Caro 15x15 (Dùng phím mũi tên để di chuyển giữa các ô)"
          className="board-grid"
          onKeyDown={handleKeyDown}
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
                  row={rowIndex}
                  col={colIndex}
                  value={cell}
                  currentTurn={currentPlayer}
                  isLastMove={
                    lastMove?.[0] === rowIndex && lastMove?.[1] === colIndex
                  }
                  isWinningCell={winCellSet.has(key)}
                  isStarPoint={isStarPoint(rowIndex, colIndex)}
                  disabled={disabled}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                />
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
})
