import { describe, expect, it } from "vitest"
import { WASM_DIFFICULTIES, WASM_CONFIGURED_DEPTHS } from "../../src/game/wasm/contracts"
import { executeWasmSearch } from "../../src/game/wasm/executeSearch"

describe("Gomoku WASM difficulty contract", () => {
  it("maps every UI difficulty to the supported Rust engine difficulty", () => {
    expect(WASM_DIFFICULTIES).toEqual({ easy: 0, normal: 1, hard: 2, veryhard: 5, expert: 3, master: 4 })
    expect(WASM_CONFIGURED_DEPTHS).toEqual({ easy: 0, normal: 1, hard: 2, veryhard: 3, expert: 4, master: 5 })
  })

  it("forwards measured engine counters, converts x/y once and frees the engine", () => {
    const actions: unknown[] = []
    class Game {
      play_move(x: number, y: number) { actions.push([x, y]); return true }
      ai_move(difficulty: number) {
        actions.push(difficulty)
        return { x: 8, y: 7, score: 42, strategy: "alpha_beta", difficulty: "veryhard",
          stats: { nodes_visited: 123, leaf_evaluations: 70, cutoffs: 19,
            ordering_evaluations: 51, candidate_moves_generated: 90, completed_depth: 3 } }
      }
      free() { actions.push("free") }
    }
    const times = [100, 107]
    const result = executeWasmSearch({ requestId: 2, roundId: 3, difficulty: "veryhard",
      history: [{ index: 1, player: "X", cell: { row: 4, col: 5 } }] }, Game, () => times.shift()!)
    expect(actions).toEqual([[5, 4], 5, "free"])
    expect(result).toMatchObject({ requestId: 2, roundId: 3, difficulty: "veryhard", move: { row: 7, col: 8 },
      stats: { depth: 3, nodes: 123, cutoffs: 19, leafEvaluations: 70,
        orderingEvaluations: 51, candidateMovesGenerated: 90, score: 42,
        elapsedMs: 7, elapsedScope: "worker-hydrate-and-search", source: "rust" } })
  })

  it("refuses coordinate-only stale binaries instead of fabricating stats", () => {
    let freed = false
    class OldGame {
      play_move() { return true }
      ai_move() { return { x: 7, y: 7 } }
      free() { freed = true }
    }
    expect(() => executeWasmSearch({ requestId: 1, roundId: 1, difficulty: "easy", history: [] }, OldGame))
      .toThrow("telemetry contract mismatch")
    expect(freed).toBe(true)
  })

  it("leaves unavailable terminal counters null and frees on hydration failure", () => {
    let frees = 0
    class Game {
      play_move() { return false }
      ai_move() { return null }
      free() { frees++ }
    }
    expect(executeWasmSearch({ requestId: 1, roundId: 1, difficulty: "easy", history: [] }, Game).stats)
      .toMatchObject({ nodes: null, depth: null, reason: "no-move" })
    expect(() => executeWasmSearch({ requestId: 2, roundId: 1, difficulty: "easy",
      history: [{ player: "X", index: 1, cell: { row: 0, col: 0 } }] }, Game)).toThrow("hydrate")
    expect(frees).toBe(2)
  })
})
