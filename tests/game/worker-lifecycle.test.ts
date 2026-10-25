import { afterEach, describe, expect, it, vi } from "vitest"
import { GomokuWasmEngine } from "../../src/game/wasm/GomokuWasmEngine"
import { GameController } from "../../src/app/GameController"

class TestWorker {
  static instances: TestWorker[] = []
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
  constructor() { TestWorker.instances.push(this) }
}

afterEach(() => { vi.unstubAllGlobals(); TestWorker.instances = [] })

describe("WASM worker resource lifecycle", () => {
  it("turns constructor failure into a recoverable controller error and allows retry", async () => {
    vi.stubGlobal("Worker", class { constructor() { throw new Error("Worker blocked by policy") } })
    const controller = new GameController()
    controller.setMode("ai")
    expect(() => controller.playCell({ row: 7, col: 7 })).not.toThrow()
    await Promise.resolve()
    await Promise.resolve()
    expect(controller.snapshot()).toMatchObject({ aiThinking: false, aiError: "Worker blocked by policy" })
    vi.stubGlobal("Worker", TestWorker)
    controller.retryAiTurn()
    expect(TestWorker.instances).toHaveLength(1)
    const worker = TestWorker.instances[0]
    const message = worker.postMessage.mock.calls[0][0]
    worker.onmessage!({ data: { type: "result", id: message.id, result: {
      requestId: message.request.requestId, roundId: message.request.roundId, difficulty: "normal",
      move: { row: 7, col: 8 }, stats: {},
    } } })
    await Promise.resolve()
    expect(controller.snapshot()).toMatchObject({ aiThinking: false, aiError: null, currentPlayer: "X" })
    expect(controller.snapshot().history).toHaveLength(2)
    controller.destroy()
  })

  it("allocates lazily and can restart after StrictMode effect cleanup", async () => {
    vi.stubGlobal("Worker", TestWorker)
    const engine = new GomokuWasmEngine()
    expect(TestWorker.instances).toHaveLength(0)
    engine.destroy()
    const promise = engine.search({ requestId: 1, roundId: 1, difficulty: "easy", history: [] })
    const worker = TestWorker.instances[0]
    expect(TestWorker.instances).toHaveLength(1)
    const expected = { requestId: 1, roundId: 1, difficulty: "easy", move: null, stats: {} }
    worker.onmessage!({ data: { type: "result", id: 1, result: expected } })
    await expect(promise).resolves.toEqual(expected)
    engine.destroy()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("rejects cancelled requests and ignores responses from the terminated worker", async () => {
    vi.stubGlobal("Worker", TestWorker)
    const engine = new GomokuWasmEngine()
    const request = { requestId: 1, roundId: 1, difficulty: "easy" as const, history: [] }
    const first = engine.search(request)
    const rejected = expect(first).rejects.toThrow("cancelled")
    const oldWorker = TestWorker.instances[0]
    engine.cancelPending()
    await rejected
    const second = engine.search({ ...request, requestId: 2, roundId: 2 })
    const nextWorker = TestWorker.instances[1]
    const delivered = vi.fn()
    void second.then(delivered)
    oldWorker.onmessage!({ data: { type: "result", id: 1, result: { move: { row: 0, col: 0 } } } })
    await Promise.resolve()
    expect(delivered).not.toHaveBeenCalled()
    nextWorker.onmessage!({ data: { type: "result", id: 2, result: { requestId: 2, roundId: 2, move: null } } })
    await second
    expect(delivered).toHaveBeenCalledOnce()
    engine.destroy()
  })

  it("restarts after a fatal worker error and ignores errors from an old worker", async () => {
    vi.stubGlobal("Worker", TestWorker)
    const engine = new GomokuWasmEngine()
    const request = { requestId: 1, roundId: 1, difficulty: "easy" as const, history: [] }
    const first = engine.search(request)
    const rejected = expect(first).rejects.toThrow("fatal worker failure")
    const oldWorker = TestWorker.instances[0]
    oldWorker.onerror!({ error: new Error("fatal worker failure") })
    await rejected
    expect(oldWorker.terminate).toHaveBeenCalledOnce()
    const next = engine.search({ ...request, requestId: 2 })
    const replacement = TestWorker.instances[1]
    oldWorker.onerror!({ error: new Error("late stale error") })
    expect(replacement.terminate).not.toHaveBeenCalled()
    replacement.onmessage!({ data: { type: "result", id: 2, result: { requestId: 2, move: null } } })
    await expect(next).resolves.toMatchObject({ requestId: 2 })
    engine.destroy()
  })
})
