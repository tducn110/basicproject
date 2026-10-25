import { BOT_DIFFICULTIES } from "../ai/contracts"
import type { RustMoveResult, WasmAIRequest, WasmAIResult } from "./contracts"
import { WASM_DIFFICULTIES } from "./contracts"

interface WasmGame {
  play_move(x: number, y: number): boolean
  ai_move(difficulty: number): unknown
  free(): void
}

/** Refuse old binaries that return only coordinates instead of measured stats. */
function readMoveResult(value: unknown, difficulty: WasmAIRequest["difficulty"]): RustMoveResult | null {
  if (value === null || value === undefined) return null
  const result = value as RustMoveResult
  const stats = result.stats
  const counts = stats && [stats.nodes_visited, stats.leaf_evaluations, stats.cutoffs,
    stats.ordering_evaluations, stats.candidate_moves_generated, stats.completed_depth]
  if (!Number.isInteger(result.x) || result.x < 0 || result.x >= 15
      || !Number.isInteger(result.y) || result.y < 0 || result.y >= 15
      || !Number.isFinite(result.score) || result.difficulty !== difficulty
      || !["random", "rule_based", "alpha_beta"].includes(result.strategy)
      || !counts || counts.some((count) => !Number.isSafeInteger(count) || count < 0)) {
    throw new Error("Gomoku WASM telemetry contract mismatch: rebuild the engine and copy its generated package")
  }
  return result
}

/** Elapsed time includes hydration, Rust ai_move and free; excludes WASM loading and message delivery. */
export function executeWasmSearch(
  request: WasmAIRequest,
  Game: new () => WasmGame,
  now: () => number = () => performance.now(),
): WasmAIResult {
  if (!BOT_DIFFICULTIES.includes(request.difficulty)) throw new Error("Unsupported AI difficulty")
  const startedAt = now()
  const game = new Game()
  let move: RustMoveResult | null
  try {
    for (const item of request.history) {
      if (!game.play_move(item.cell.col, item.cell.row)) {
        throw new Error(`Unable to hydrate Gomoku engine at move ${item.index}`)
      }
    }
    move = readMoveResult(game.ai_move(WASM_DIFFICULTIES[request.difficulty]), request.difficulty)
  } finally {
    game.free()
  }
  const elapsedMs = now() - startedAt
  return {
    requestId: request.requestId,
    roundId: request.roundId,
    difficulty: request.difficulty,
    move: move ? { row: move.y, col: move.x } : null,
    stats: {
      depth: move?.stats.completed_depth ?? null,
      nodes: move?.stats.nodes_visited ?? null,
      cutoffs: move?.stats.cutoffs ?? null,
      leafEvaluations: move?.stats.leaf_evaluations ?? null,
      orderingEvaluations: move?.stats.ordering_evaluations ?? null,
      candidateMovesGenerated: move?.stats.candidate_moves_generated ?? null,
      score: move?.score ?? null,
      strategy: move?.strategy ?? (request.difficulty === "easy" ? "random" : request.difficulty === "normal" ? "rule_based" : "alpha_beta"),
      source: "rust",
      elapsedMs,
      elapsedScope: "worker-hydrate-and-search",
      reason: move ? "completed" : "no-move",
    },
  }
}
