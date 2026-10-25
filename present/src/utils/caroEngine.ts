export type Player = "X" | "O"
export type CellValue = Player | null

export const BOARD_SIZE = 15

export interface PatternWeights {
  five: number
  openFour: number
  closedFour: number
  openThree: number
  closedThree: number
  openTwo: number
  closedTwo: number
}

export const DEFAULT_ATTACK_WEIGHTS: PatternWeights = {
  five: 10000000,
  openFour: 100000,
  closedFour: 10000,
  openThree: 5000,
  closedThree: 1000,
  openTwo: 500,
  closedTwo: 100,
}

export const DEFAULT_DEFENSE_WEIGHTS: PatternWeights = {
  five: 9999999,
  openFour: 120000,
  closedFour: 12000,
  openThree: 6000,
  closedThree: 1200,
  openTwo: 600,
  closedTwo: 120,
}

export interface WinResult {
  winner: Player
  line: [number, number][]
}

export function checkWinAround(
  board: CellValue[][],
  row: number,
  col: number,
  player: Player
): WinResult | null {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal
    [1, -1],  // anti-diagonal
  ]

  for (const [dr, dc] of directions) {
    let count = 1
    const line: [number, number][] = [[row, col]]

    // Forward
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++
      line.push([r, c])
      r += dr
      c += dc
    }

    // Backward
    r = row - dr
    c = col - dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++
      line.push([r, c])
      r -= dr
      c -= dc
    }

    if (count >= 5) {
      return { winner: player, line }
    }
  }

  return null
}

export function getChebyshevCandidates(
  board: CellValue[][],
  radius: number = 2
): [number, number][] {
  let hasStones = false
  const stonePositions: [number, number][] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        hasStones = true
        stonePositions.push([r, c])
      }
    }
  }

  if (!hasStones) {
    return [[7, 7]]
  }

  const candidateSet = new Set<string>()

  for (const [sr, sc] of stonePositions) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const nr = sr + dr
        const nc = sc + dc
        if (
          nr >= 0 &&
          nr < BOARD_SIZE &&
          nc >= 0 &&
          nc < BOARD_SIZE &&
          board[nr][nc] === null
        ) {
          candidateSet.add(`${nr},${nc}`)
        }
      }
    }
  }

  return Array.from(candidateSet).map((key) => {
    const [r, c] = key.split(",").map(Number)
    return [r, c]
  })
}

// Pattern counter on 4 axes
export function scanLinePatterns(
  line: CellValue[],
  player: Player,
  weights: PatternWeights
): number {
  let score = 0
  const opp: Player = player === "X" ? "O" : "X"
  const len = line.length

  for (let i = 0; i < len; i++) {
    if (line[i] !== player) continue

    // Count contiguous run
    let runLen = 1
    while (i + runLen < len && line[i + runLen] === player) {
      runLen++
    }

    const openBefore = i > 0 && line[i - 1] === null
    const openAfter = i + runLen < len && line[i + runLen] === null
    const blockBefore = i === 0 || line[i - 1] === opp
    const blockAfter = i + runLen === len || line[i + runLen] === opp

    if (runLen >= 5) {
      score += weights.five
    } else if (runLen === 4) {
      if (openBefore && openAfter) score += weights.openFour
      else if (openBefore || openAfter) score += weights.closedFour
    } else if (runLen === 3) {
      if (openBefore && openAfter) score += weights.openThree
      else if (openBefore || openAfter) score += weights.closedThree
    } else if (runLen === 2) {
      if (openBefore && openAfter) score += weights.openTwo
      else if (openBefore || openAfter) score += weights.closedTwo
    }

    i += runLen - 1
  }

  return score
}

export function evaluateBoard(
  board: CellValue[][],
  botPlayer: Player = "O",
  atkWeights: PatternWeights = DEFAULT_ATTACK_WEIGHTS,
  defWeights: PatternWeights = DEFAULT_DEFENSE_WEIGHTS
): { score: number; botScore: number; humanScore: number } {
  const humanPlayer: Player = botPlayer === "X" ? "O" : "X"

  let botTotal = 0
  let humanTotal = 0

  // 1. Horizontal lines
  for (let r = 0; r < BOARD_SIZE; r++) {
    const line = board[r]
    botTotal += scanLinePatterns(line, botPlayer, atkWeights)
    humanTotal += scanLinePatterns(line, humanPlayer, defWeights)
  }

  // 2. Vertical lines
  for (let c = 0; c < BOARD_SIZE; c++) {
    const line: CellValue[] = []
    for (let r = 0; r < BOARD_SIZE; r++) line.push(board[r][c])
    botTotal += scanLinePatterns(line, botPlayer, atkWeights)
    humanTotal += scanLinePatterns(line, humanPlayer, defWeights)
  }

  // 3. Diagonals (down-right)
  for (let k = 0; k < 2 * BOARD_SIZE - 1; k++) {
    const line: CellValue[] = []
    for (let r = 0; r < BOARD_SIZE; r++) {
      const c = k - r
      if (c >= 0 && c < BOARD_SIZE) line.push(board[r][c])
    }
    if (line.length >= 5) {
      botTotal += scanLinePatterns(line, botPlayer, atkWeights)
      humanTotal += scanLinePatterns(line, humanPlayer, defWeights)
    }
  }

  // 4. Diagonals (up-right)
  for (let k = -BOARD_SIZE + 1; k < BOARD_SIZE; k++) {
    const line: CellValue[] = []
    for (let r = 0; r < BOARD_SIZE; r++) {
      const c = r - k
      if (c >= 0 && c < BOARD_SIZE) line.push(board[r][c])
    }
    if (line.length >= 5) {
      botTotal += scanLinePatterns(line, botPlayer, atkWeights)
      humanTotal += scanLinePatterns(line, humanPlayer, defWeights)
    }
  }

  const score = Math.max(-9999999, Math.min(9999999, botTotal - humanTotal))
  return { score, botScore: botTotal, humanScore: humanTotal }
}

// 1-Ply Rule-Based Bot
export function getRuleBasedMove(
  board: CellValue[][],
  botPlayer: Player = "O"
): [number, number] {
  const candidates = getChebyshevCandidates(board, 2)
  if (candidates.length === 0) return [7, 7]

  const humanPlayer: Player = botPlayer === "X" ? "O" : "X"

  // 1. Check if bot has an immediate win move
  for (const [r, c] of candidates) {
    board[r][c] = botPlayer
    const win = checkWinAround(board, r, c, botPlayer)
    board[r][c] = null
    if (win) return [r, c]
  }

  // 2. Check if human has an immediate win move (block it!)
  for (const [r, c] of candidates) {
    board[r][c] = humanPlayer
    const humanWin = checkWinAround(board, r, c, humanPlayer)
    board[r][c] = null
    if (humanWin) return [r, c]
  }

  // 3. 1-ply Heuristic ArgMax
  let bestScore = -Infinity
  let bestMove: [number, number] = candidates[0]

  for (const [r, c] of candidates) {
    board[r][c] = botPlayer
    const { score } = evaluateBoard(board, botPlayer)
    board[r][c] = null

    if (score > bestScore) {
      bestScore = score
      bestMove = [r, c]
    }
  }

  return bestMove
}
