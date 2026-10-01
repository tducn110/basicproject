export const BOARD_SIZE = 15
export const WIN_LENGTH = 5

export type Cell = "X" | "O" | null
export type Board = Cell[][]
export type Player = "X" | "O"
export type GameMode = "1v1" | "ai"

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

export function checkWinner(board: Board, row: number, col: number): WinResult | null {
  const player = board[row][col]
  if (!player) return null

  for (const [dr, dc] of DIRS) {
    const cells: [number, number][] = [[row, col]]

    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i
      const c = col + dc * i
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break
      cells.push([r, c])
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i
      const c = col - dc * i
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break
      cells.push([r, c])
    }

    if (cells.length >= WIN_LENGTH) {
      return { winner: player as Player, cells }
    }
  }
  return null
}

function countLine(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: Player,
): { count: number; openEnds: number } {
  let count = 1
  let openEnds = 0

  let r = row + dr
  let c = col + dc
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++
    r += dr
    c += dc
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) openEnds++

  r = row - dr
  c = col - dc
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++
    r -= dr
    c -= dc
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) openEnds++

  return { count, openEnds }
}

function scorePosition(board: Board, row: number, col: number, player: Player): number {
  const orig = board[row][col]
  board[row][col] = player

  let score = 0
  for (const [dr, dc] of DIRS) {
    const { count, openEnds } = countLine(board, row, col, dr, dc, player)
    if (count >= 5) score += 100000
    else if (count === 4 && openEnds === 2) score += 10000
    else if (count === 4 && openEnds === 1) score += 1000
    else if (count === 3 && openEnds === 2) score += 500
    else if (count === 3 && openEnds === 1) score += 100
    else if (count === 2 && openEnds === 2) score += 20
    else if (count === 2 && openEnds === 1) score += 5
  }

  board[row][col] = orig
  return score
}

export function getAIMove(board: Board, aiPlayer: Player): [number, number] {
  const opponent: Player = aiPlayer === "X" ? "O" : "X"
  const candidates = new Set<string>()
  let hasAnyPiece = false

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        hasAnyPiece = true
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`)
            }
          }
        }
      }
    }
  }

  if (!hasAnyPiece) return [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)]

  let bestScore = -1
  let bestMove: [number, number] = [7, 7]

  for (const key of candidates) {
    const [r, c] = key.split(",").map(Number)
    const attack = scorePosition(board, r, c, aiPlayer)
    const defense = scorePosition(board, r, c, opponent)
    const score = attack * 1.1 + defense

    if (score > bestScore) {
      bestScore = score
      bestMove = [r, c]
    }
  }

  return bestMove
}
