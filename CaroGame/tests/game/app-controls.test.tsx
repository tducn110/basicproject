// @vitest-environment jsdom
import { act, StrictMode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const bridge = vi.hoisted(() => ({ tap: (_row: number, _col: number) => {}, stones: 0 }))
const wink = vi.hoisted(() => ({ hostPaused: false, readyPromise: null,
  gameplayStart: vi.fn(), gameplayStop: vi.fn(), submitFinalScore: vi.fn() }))
vi.mock("../../src/integrations/wink/useWinkIntegration", () => ({ useWinkIntegration: () => wink }))
vi.mock("../../src/utils/game-loader", () => ({ preloadCriticalResources: () => Promise.resolve(), preloadNonCriticalResources: vi.fn() }))
vi.mock("../../src/utils/buttonClick", () => ({ playButtonClick: vi.fn() }))
vi.mock("../../src/pixi/CaroGameCanvas", () => ({ CaroGameCanvas: (props: {
  board: readonly unknown[]; onCellClick: (row: number, col: number) => void
}) => { bridge.tap = props.onCellClick; bridge.stones = props.board.length; return <div data-board-count={props.board.length} /> } }))

import App from "../../src/App"
import i18n from "../../src/i18n"

class TestWorker {
  static instances: TestWorker[] = []
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: unknown = null
  postMessage = vi.fn()
  terminate = vi.fn()
  constructor() { TestWorker.instances.push(this) }
}

let host: HTMLDivElement
let root: Root
const click = async (button: Element) => { await act(async () => (button as HTMLButtonElement).click()) }
const button = (label: string) => Array.from(host.querySelectorAll("button")).find((item) => item.textContent === label || item.getAttribute("aria-label") === label)!

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal("Worker", TestWorker)
  TestWorker.instances = []
  await i18n.changeLanguage("en")
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => root.render(<StrictMode><App /></StrictMode>))
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("App interaction and reporting controls", () => {
  it("offers six levels, survives StrictMode cleanup, displays measured stats and undoes a pair", async () => {
    expect(TestWorker.instances).toHaveLength(0)
    await click(button("Play vs AI"))
    expect(Array.from(host.querySelectorAll(".difficulty-button")).map((item) => item.textContent))
      .toEqual(["Easy", "Normal", "Hard", "Very Hard", "Expert", "Master"])
    await act(async () => bridge.tap(7, 7))
    expect(TestWorker.instances).toHaveLength(1)
    expect(host.querySelector('[role="status"]')?.textContent).toBe("Computer is thinking…")
    const worker = TestWorker.instances[0]
    const message = worker.postMessage.mock.calls[0][0]
    await act(async () => worker.onmessage!({ data: { type: "result", id: message.id,
      result: { requestId: message.request.requestId, roundId: message.request.roundId,
        difficulty: "normal", move: { row: 7, col: 8 },
        stats: { depth: 1, nodes: 24, cutoffs: 0, leafEvaluations: 24, orderingEvaluations: 0,
          candidateMovesGenerated: 24, score: 42, strategy: "rule_based", source: "rust",
          elapsedMs: 1.25, elapsedScope: "worker-hydrate-and-search", reason: "completed" } } } }))
    expect(bridge.stones).toBe(2)
    expect(host.textContent).toContain("Nodes visited24")
    expect(host.textContent).toContain("Score42")
    expect(host.textContent).toContain("1.25 ms")
    await click(button("Undo"))
    expect(bridge.stones).toBe(0)
    expect(host.querySelector("details")).toBeNull()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("Back and Close both return to an internal mode menu", async () => {
    await act(async () => bridge.tap(7, 7))
    await click(button("Back"))
    expect(host.textContent).toContain("Choose a game mode")
    expect(host.querySelector("[data-board-count]")).toBeNull()
    await click(button("Two players"))
    expect(bridge.stones).toBe(0)
    await click(button("Close"))
    expect(host.textContent).toContain("Choose a game mode")
  })

  it("stops the elapsed clock at a genuine 225-ply draw", async () => {
    vi.useFakeTimers()
    const groups: { row: number; col: number }[][] = [[], []]
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) groups[(Math.floor(row / 2) + col) % 2].push({ row, col })
    }
    const moves = Array.from({ length: 225 }, (_, index) => groups[index % 2][Math.floor(index / 2)])
    await act(async () => bridge.tap(moves[0].row, moves[0].col))
    await act(async () => vi.advanceTimersByTime(2000))
    expect(host.textContent).toContain("00:02")
    await act(async () => { for (const move of moves.slice(1)) bridge.tap(move.row, move.col) })
    expect(bridge.stones).toBe(225)
    expect(host.textContent).toContain("Draw!")
    await act(async () => vi.advanceTimersByTime(5000))
    expect(host.textContent).toContain("00:02")
    expect(host.textContent).not.toContain("00:07")
  })
})
