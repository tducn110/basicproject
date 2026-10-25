import { BOARD_SIZE, DIRECTIONS, WIN_LENGTH } from "./constants"
import type { Board, Cell, WinResult } from "./types"

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<Cell>(BOARD_SIZE).fill(null),
  )
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function checkWinner(
  board: Board,
  row: number,
  col: number,
): WinResult | null {
  const player = board[row][col]

  if (!player) {
    return null
  }

  for (const [dr, dc] of DIRECTIONS) {
    const cells: [number, number][] = [[row, col]]

    for (let step = 1; step < WIN_LENGTH; step++) {
      const nextRow = row + dr * step
      const nextCol = col + dc * step

      if (
        !isInsideBoard(nextRow, nextCol) ||
        board[nextRow][nextCol] !== player
      ) {
        break
      }

      cells.push([nextRow, nextCol])
    }

    for (let step = 1; step < WIN_LENGTH; step++) {
      const nextRow = row - dr * step
      const nextCol = col - dc * step

      if (
        !isInsideBoard(nextRow, nextCol) ||
        board[nextRow][nextCol] !== player
      ) {
        break
      }

      cells.push([nextRow, nextCol])
    }

    if (cells.length >= WIN_LENGTH) {
      return {
        winner: player,
        cells,
      }
    }
  }

  return null
}
