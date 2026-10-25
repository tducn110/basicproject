/// <reference lib="webworker" />
import wasmUrl from "./engine/gomoku_engine_bg.wasm?url"
import init, { Game } from "./engine/gomoku_engine"

export type BotDifficulty = "easy" | "medium" | "hard"

export interface BotMoveRequest {
  id: number
  history: { row: number; col: number }[]
  difficulty: BotDifficulty
}

export interface BotMoveResponse {
  id: number
  move: { row: number; col: number } | null
  elapsedMs: number
  error?: string
}

let isInitialized = false

async function ensureInit() {
  if (!isInitialized) {
    await init({ module_or_path: wasmUrl })
    isInitialized = true
  }
}

// Fallback move generator if WASM runtime fails or encounters unexpected bounds
function fallbackNeighborMove(
  history: { row: number; col: number }[],
): { row: number; col: number } {
  if (history.length === 0) return { row: 7, col: 7 }
  const occupied = new Set(history.map((m) => `${m.row},${m.col}`))
  const last = history[history.length - 1]
  const deltas = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0],
  ]
  for (const [dr, dc] of deltas) {
    const nr = last.row + dr
    const nc = last.col + dc
    if (
      nr >= 0 &&
      nr < 15 &&
      nc >= 0 &&
      nc < 15 &&
      !occupied.has(`${nr},${nc}`)
    ) {
      return { row: nr, col: nc }
    }
  }
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (!occupied.has(`${r},${c}`)) return { row: r, col: c }
    }
  }
  return { row: 7, col: 7 }
}

self.onmessage = async (e: MessageEvent<BotMoveRequest>) => {
  const { id, history, difficulty } = e.data
  const startTime = performance.now()

  try {
    await ensureInit()
    const game = new Game()

    for (const m of history) {
      // In gomoku-engine: x is col (0..14), y is row (0..14)
      if (!game.play_move(m.col, m.row)) {
        game.free()
        throw new Error(`Unable to play move at (${m.row}, ${m.col})`)
      }
    }

    // Difficulty mapping: 0 = Easy (depth 1), 1 = Medium (depth 2), 2 = Hard (depth 4)
    const diffCode = difficulty === "easy" ? 0 : difficulty === "hard" ? 2 : 1
    const rawMove = game.ai_move(diffCode) as { x: number; y: number } | null
    game.free()

    const chosenMove = rawMove
      ? { row: rawMove.y, col: rawMove.x }
      : fallbackNeighborMove(history)

    const elapsedMs = performance.now() - startTime
    const response: BotMoveResponse = {
      id,
      move: chosenMove,
      elapsedMs,
    }
    self.postMessage(response)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("[WASM Bot Worker Error]:", errorMsg)
    const fallback = fallbackNeighborMove(history)
    self.postMessage({
      id,
      move: fallback,
      elapsedMs: performance.now() - startTime,
      error: errorMsg,
    })
  }
}
