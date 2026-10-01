export const BOARD_SIZE = 15
export const WIN_LENGTH = 5

export type Cell = "X" | "O" | null
export type Board = Cell[][]
export type Player = "X" | "O"

export interface Move {
  player: Player
  row: number
  col: number
  index: number
}

export interface WinResult {
  winner: Player
  cells: [number, number][]
}

export function createBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))
}

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

export function checkWinner(
  board: Board,
  row: number,
  col: number,
): WinResult | null {
  const player = board[row][col]
  if (!player) return null

  for (const [dr, dc] of DIRS) {
    const cells: [number, number][] = [[row, col]]

    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i
      const c = col + dc * i
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        board[r][c] !== player
      )
        break
      cells.push([r, c])
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i
      const c = col - dc * i
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        board[r][c] !== player
      )
        break
      cells.push([r, c])
    }

    if (cells.length >= WIN_LENGTH) {
      return { winner: player as Player, cells }
    }
  }
  return null
}
