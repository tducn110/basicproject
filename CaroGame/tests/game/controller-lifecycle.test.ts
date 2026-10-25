import { describe, expect, it, vi } from "vitest"
import { GameController } from "../../src/app/GameController"
import type { AIResult, AIService, BotDifficulty } from "../../src/game/ai/contracts"
import type { GameState } from "../../src/game/core/GameState"

class DeferredAI implements AIService {
  pending: { roundId: number; difficulty: BotDifficulty; resolve: (value: AIResult) => void; reject: (reason: Error) => void }[] = []
  cancelPending = vi.fn()
  destroy = vi.fn()
  requestMove(_state: GameState, roundId: number, difficulty: BotDifficulty): Promise<AIResult> {
    return new Promise((resolve, reject) => this.pending.push({ roundId, difficulty, resolve, reject }))
  }
  reply(index: number, move: AIResult["move"] = { row: 7, col: 8 }) {
    const request = this.pending[index]
    request.resolve({ requestId: index + 1, roundId: request.roundId, difficulty: request.difficulty, move,
      stats: { depth: 2, nodes: 35, cutoffs: 4, leafEvaluations: 20, orderingEvaluations: 30,
        candidateMovesGenerated: 40, score: 7, strategy: "alpha_beta", source: "rust",
        elapsedMs: 2, elapsedScope: "worker-hydrate-and-search", reason: move ? "completed" : "no-move" } })
  }
}

const flush = async () => { await Promise.resolve(); await Promise.resolve() }

describe("GameController undo and AI result validity", () => {
  it("undoes one PvP move and restores the player and terminal state", () => {
    const controller = new GameController(new DeferredAI())
    expect(controller.undo()).toBe(false)
    for (let col = 0; col < 4; col++) {
      controller.playCell({ row: 0, col })
      controller.playCell({ row: 2, col })
    }
    controller.playCell({ row: 0, col: 4 })
    expect(controller.snapshot().match.phase).toBe("game-over")
    expect(controller.undo()).toBe(true)
    expect(controller.snapshot()).toMatchObject({ currentPlayer: "X", history: { length: 8 },
      match: { phase: "playing", winner: null, isDraw: false } })
    expect(controller.snapshot().board.some((stone) => stone.cell.row === 0 && stone.cell.col === 4)).toBe(false)
  })

  it("cancels a pending AI reply on undo and rejects its eventual stale completion", async () => {
    const ai = new DeferredAI()
    const controller = new GameController(ai)
    controller.setMode("ai")
    controller.playCell({ row: 7, col: 7 })
    expect(controller.snapshot().aiThinking).toBe(true)
    const oldRound = controller.snapshot().match.roundId
    controller.undo()
    expect(ai.cancelPending).toHaveBeenCalled()
    expect(controller.snapshot()).toMatchObject({ currentPlayer: "X", aiThinking: false, history: [], match: { phase: "ready" } })
    expect(controller.snapshot().match.roundId).toBeGreaterThan(oldRound)
    ai.reply(0)
    await flush()
    expect(controller.snapshot().history).toHaveLength(0)
    expect(controller.snapshot().lastAiResult).toBeNull()
  })

  it("undoes a completed human/AI pair and clears displayed search evidence", async () => {
    const ai = new DeferredAI()
    const controller = new GameController(ai)
    controller.setMode("ai")
    controller.playCell({ row: 7, col: 7 })
    ai.reply(0)
    await flush()
    expect(controller.snapshot().history).toHaveLength(2)
    expect(controller.snapshot().lastAiResult?.stats.nodes).toBe(35)
    controller.undo()
    expect(controller.snapshot()).toMatchObject({ history: [], board: [], currentPlayer: "X", lastAiResult: null })
  })

  it.each(["newGame", "replay", "setMode", "setDifficulty"] as const)("%s invalidates a result even when the service ignores cancellation", async (action) => {
    const ai = new DeferredAI()
    const controller = new GameController(ai)
    controller.setMode("ai")
    controller.playCell({ row: 7, col: 7 })
    if (action === "setMode") controller.setMode("1v1")
    else if (action === "setDifficulty") controller.setDifficulty("veryhard")
    else controller[action]()
    ai.reply(0)
    await flush()
    expect(controller.snapshot().board).toHaveLength(0)
    expect(controller.snapshot().aiThinking).toBe(false)
    expect(controller.snapshot().lastAiResult).toBeNull()
  })

  it("freezes a pending turn while paused and commits only the resumed request", async () => {
    const ai = new DeferredAI()
    const controller = new GameController(ai)
    controller.setMode("ai")
    controller.playCell({ row: 7, col: 7 })
    controller.setPaused(true)
    expect(controller.undo()).toBe(false)
    expect(controller.playCell({ row: 1, col: 1 })).toMatchObject({ type: "rejected", reason: "paused" })
    controller.setPaused(false)
    expect(ai.pending).toHaveLength(2)
    ai.reply(0, { row: 0, col: 0 })
    await flush()
    expect(controller.snapshot().board).toHaveLength(1)
    ai.reply(1)
    await flush()
    expect(controller.snapshot().board).toHaveLength(2)
    expect(controller.snapshot().board.some((stone) => stone.cell.row === 0 && stone.cell.col === 0)).toBe(false)
  })

  it("keeps search failure recoverable and starts a fresh request on retry", async () => {
    const ai = new DeferredAI()
    const controller = new GameController(ai)
    controller.setMode("ai")
    controller.playCell({ row: 7, col: 7 })
    ai.pending[0].reject(new Error("worker unavailable"))
    await flush()
    expect(controller.snapshot()).toMatchObject({ aiThinking: false, aiError: "worker unavailable" })
    controller.retryAiTurn()
    expect(ai.pending).toHaveLength(2)
    ai.reply(1)
    await flush()
    expect(controller.snapshot()).toMatchObject({ aiError: null, aiThinking: false, currentPlayer: "X" })
    expect(controller.snapshot().history).toHaveLength(2)
  })
})
