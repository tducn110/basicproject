import type { Move } from "../core/types"
import type { AIResult, BotDifficulty } from "../ai/contracts"

export interface WasmAIRequest {
  requestId: number
  roundId: number
  difficulty: BotDifficulty
  history: readonly Move[]
}

export const WASM_DIFFICULTIES: Record<BotDifficulty, number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  veryhard: 5,
  expert: 3,
  master: 4,
}

/** Intended fixed search configuration, not a measurement of completed work. */
export const WASM_CONFIGURED_DEPTHS: Record<BotDifficulty, number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  veryhard: 3,
  expert: 4,
  master: 5,
}

export interface RustMoveResult {
  x: number
  y: number
  score: number
  strategy: "random" | "rule_based" | "alpha_beta"
  difficulty: BotDifficulty
  stats: {
    nodes_visited: number
    leaf_evaluations: number
    cutoffs: number
    ordering_evaluations: number
    candidate_moves_generated: number
    completed_depth: number
  }
}

export type WasmAIResult = AIResult
