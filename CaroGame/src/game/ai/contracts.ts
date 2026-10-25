import type { CellCoord } from "../core/types"

export const BOT_DIFFICULTIES = ["easy", "normal", "hard", "veryhard", "expert", "master"] as const
export type BotDifficulty = typeof BOT_DIFFICULTIES[number]

export interface SearchPosition {
  size: number
  cells: Uint8Array
  sideToMove: 1 | 2
  lastMove: number | null
  offset: CellCoord
}

export interface AIRequest {
  requestId: number
  roundId: number
  position: SearchPosition
  difficulty: BotDifficulty
  budget: SearchBudget
}

export interface AIResult {
  requestId: number
  roundId: number
  difficulty: BotDifficulty
  move: CellCoord | null
  stats: SearchStats
}

export interface SearchStats {
  depth: number | null
  nodes: number | null
  cutoffs: number | null
  leafEvaluations: number | null
  orderingEvaluations: number | null
  candidateMovesGenerated: number | null
  score: number | null
  strategy: "random" | "rule_based" | "alpha_beta" | "tactical" | "legacy"
  source: "rust" | "tactical" | "typescript-legacy"
  elapsedMs: number
  elapsedScope: "worker-hydrate-and-search" | "typescript-tactical" | "legacy-search"
  reason: "completed" | "timeout" | "mate" | "no-move" | "tactical"
}

export interface SearchBudget { timeMs: number; maxDepth: number }
/** Used only by the legacy TypeScript search; the Rust worker has fixed profiles. */
export const SEARCH_BUDGETS: Record<BotDifficulty, SearchBudget> = {
  easy: { timeMs: 50, maxDepth: 2 },
  normal: { timeMs: 150, maxDepth: 4 },
  hard: { timeMs: 500, maxDepth: 8 },
  veryhard: { timeMs: 800, maxDepth: 3 },
  expert: { timeMs: 1200, maxDepth: 64 },
  master: { timeMs: 1800, maxDepth: 64 },
}

export interface AIService {
  requestMove(state: import("../core/GameState").GameState, roundId: number, difficulty: BotDifficulty): Promise<AIResult>
  cancelPending(): void
  destroy(): void
}
