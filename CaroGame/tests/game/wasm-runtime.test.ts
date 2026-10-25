import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { Game, initSync } from "../../src/game/wasm/engine/gomoku_engine"
import { GameController } from "../../src/app/GameController"
import type { AIResult, BotDifficulty } from "../../src/game/ai/contracts"
import type { CellCoord, Move } from "../../src/game/core/types"
import { executeWasmSearch } from "../../src/game/wasm/executeSearch"
import { WASM_DIFFICULTIES, WASM_CONFIGURED_DEPTHS } from "../../src/game/wasm/contracts"

const wasmBytes = readFileSync(new URL("../../src/game/wasm/engine/gomoku_engine_bg.wasm", import.meta.url))
const digest = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex")
const xy = (x: number, y: number): CellCoord => ({ row: y, col: x })
const history = (cells: readonly CellCoord[]): Move[] => cells.map((cell, index) => ({
  cell: { ...cell }, player: index % 2 === 0 ? "X" : "O", index: index + 1,
}))
const interleave = (black: readonly CellCoord[], white: readonly CellCoord[]) =>
  black.flatMap((move, index) => white[index] ? [move, white[index]] : [move])
const whiteFillers = [0, 2, 4, 6, 8].map((x) => xy(x, 0))
const drawGroups: CellCoord[][] = [[], []]
for (let row = 0; row < 15; row++) {
  for (let col = 0; col < 15; col++) drawGroups[(Math.floor(row / 2) + col) % 2].push({ row, col })
}
const drawCells = Array.from({ length: 225 }, (_, index) => drawGroups[index % 2][Math.floor(index / 2)])

interface RuleFixture { id: string; cells: CellCoord[]; winner: "black" | "white" | null; draw?: boolean; winLength?: number }
const fixtures: RuleFixture[] = [
  { id: "PARITY-HORIZONTAL", cells: interleave([3, 4, 5, 6, 7].map((x) => xy(x, 7)), whiteFillers.slice(0, 4)), winner: "black", winLength: 5 },
  { id: "PARITY-VERTICAL", cells: interleave([3, 4, 5, 6, 7].map((y) => xy(7, y)), whiteFillers.slice(0, 4)), winner: "black", winLength: 5 },
  { id: "PARITY-DIAGONAL-DOWN", cells: interleave([3, 4, 5, 6, 7].map((v) => xy(v, v)), whiteFillers.slice(0, 4)), winner: "black", winLength: 5 },
  { id: "PARITY-DIAGONAL-UP", cells: interleave([3, 4, 5, 6, 7].map((x) => xy(x, 10 - x)), whiteFillers.slice(0, 4)), winner: "black", winLength: 5 },
  { id: "PARITY-REACHABLE-OVERLINE-6", cells: interleave([2, 3, 4, 6, 7, 5].map((x) => xy(x, 7)), whiteFillers), winner: "black", winLength: 6 },
  { id: "PARITY-BLOCKED-BOTH-ENDS", cells: interleave([3, 4, 5, 6, 7].map((x) => xy(x, 7)), [xy(2, 7), xy(8, 7), xy(0, 0), xy(2, 0)]), winner: "black", winLength: 5 },
  { id: "PARITY-WHITE-WIN", cells: interleave([0, 2, 4, 6, 8].map((x) => xy(x, 0)), [2, 3, 4, 5, 6].map((x) => xy(x, 9))), winner: "white", winLength: 5 },
  { id: "PARITY-REACHABLE-DRAW-225", cells: drawCells, winner: null, draw: true },
]
const profileHistory = history([xy(7, 7), xy(8, 7), xy(7, 8)])
const profiles: BotDifficulty[] = ["easy", "normal", "hard", "veryhard", "expert", "master"]
const evidence: Record<string, unknown> = {
  scope: "Node initSync of the copied web WASM binary; actual executeWasmSearch adapter; finite fixture corpus, not all-state equivalence or a browser Worker test",
  encoding: "Integer grid row/col 0..14; Rust x=col,y=row; row-major flat index=row*15+col; empty0, X/black1, O/white2",
  terminalTurnConvention: "Next-player parity is asserted only for ongoing states; Rust flips after a terminal move while TS keeps the last mover. Both raw values are recorded.",
  wasmSha256: digest(wasmBytes),
  generatedJsSha256: digest(readFileSync(new URL("../../src/game/wasm/engine/gomoku_engine.js", import.meta.url))),
  fixtures: fixtures.map((fixture) => ({ ...fixture, history: history(fixture.cells) })),
  profileHistory,
}
const results: unknown[] = []

beforeAll(() => { initSync({ module: wasmBytes }) })
afterAll(() => {
  const output = process.env.CARO_WASM_EVIDENCE_PATH
  if (output) writeFileSync(output, JSON.stringify({ ...evidence, recordedAt: new Date().toISOString(), results }, null, 2) + "\n")
})

function encodedTs(controller: GameController): number[] {
  const board = Array<number>(225).fill(0)
  for (const stone of controller.snapshot().board) board[stone.cell.row * 15 + stone.cell.col] = stone.player === "X" ? 1 : 2
  return board
}
function compareState(controller: GameController, game: Game) {
  const snapshot = controller.snapshot()
  const board = encodedTs(controller)
  const winner = snapshot.match.winner?.winner === "X" ? "black" : snapshot.match.winner?.winner === "O" ? "white" : null
  expect(Array.from(game.get_board() as number[])).toEqual(board)
  expect(game.move_count()).toBe(snapshot.history.length)
  expect(game.get_winner()).toBe(winner)
  expect(game.is_draw()).toBe(snapshot.match.isDraw)
  const tsCurrentPlayer = snapshot.currentPlayer === "X" ? "black" : "white"
  const rustCurrentPlayer = game.current_player()
  if (snapshot.match.phase !== "game-over") expect(rustCurrentPlayer).toBe(tsCurrentPlayer)
  return { plies: snapshot.history.length, boardSha256: digest(Uint8Array.from(board)), winner,
    draw: snapshot.match.isDraw, tsCurrentPlayer, rustCurrentPlayer }
}
function hydrate(game: Game, moves: readonly Move[]) {
  for (const move of moves) expect(game.play_move(move.cell.col, move.cell.row)).toBe(true)
}

describe("copied WASM binary and TypeScript rule corpus", () => {
  it.each(fixtures)("$id: agrees after every reachable alternating ply", (fixture) => {
    const controller = new GameController()
    const game = new Game()
    const plies: unknown[] = []
    try {
      for (const [index, cell] of fixture.cells.entries()) {
        const accepted = controller.playCell(cell).type === "accepted"
        expect(accepted).toBe(true)
        expect(game.play_move(cell.col, cell.row)).toBe(accepted)
        const state = compareState(controller, game)
        if (index < fixture.cells.length - 1) expect(state.winner).toBeNull()
        plies.push({ input: cell, accepted, ...state })
      }
      expect(game.get_winner()).toBe(fixture.winner)
      expect(game.is_draw()).toBe(fixture.draw ?? false)
      if (fixture.winLength) expect(controller.snapshot().match.winner?.cells.length).toBe(fixture.winLength)
      const finalBoard = encodedTs(controller)
      // Both APIs reject any further action after a win/draw without mutation.
      expect(game.play_move(14, 14)).toBe(false)
      expect(controller.playCell(xy(14, 14)).type).toBe("rejected")
      compareState(controller, game)
      // Reversing the terminal ply restores the same live state, then reset empties it.
      expect(controller.undo()).toBe(game.undo())
      const afterUndo = compareState(controller, game)
      controller.newGame(); game.reset()
      const afterReset = compareState(controller, game)
      expect(controller.undo()).toBe(false)
      expect(game.undo()).toBe(false)
      results.push({ id: fixture.id, status: "PASS", plies, finalBoard, afterUndo, afterReset })
    } finally { game.free(); controller.destroy() }
  })

  it("PARITY-INVALID-INTEGER-AND-OCCUPIED: rejects without changing state", () => {
    const controller = new GameController()
    const game = new Game()
    const attempts: unknown[] = []
    try {
      expect(controller.playCell(xy(0, 0)).type).toBe("accepted")
      expect(game.play_move(0, 0)).toBe(true)
      for (const cell of [xy(0, 0), xy(-1, 0), xy(15, 0), xy(0, -1), xy(0, 15), xy(99, 99)]) {
        const ts = controller.playCell(cell)
        const rust = game.play_move(cell.col, cell.row)
        expect(ts.type).toBe("rejected"); expect(rust).toBe(false)
        expect(game.move_count()).toBe(1)
        attempts.push({ input: cell, accepted: rust, ts, ...compareState(controller, game) })
      }
      results.push({ id: "PARITY-INVALID-INTEGER-AND-OCCUPIED", status: "PASS", attempts })
    } finally { game.free(); controller.destroy() }
  })

  it.each(profiles)("BINARY-PROFILE-%s: hydrates history and returns measured counters and a legal move", (difficulty) => {
    const result = executeWasmSearch({ requestId: 7, roundId: 9, difficulty, history: profileHistory }, Game)
    expect(result).toMatchObject({ requestId: 7, roundId: 9, difficulty,
      stats: { source: "rust", depth: WASM_CONFIGURED_DEPTHS[difficulty], reason: "completed" } })
    expect(result.stats.strategy).toBe(difficulty === "easy" ? "random" : difficulty === "normal" ? "rule_based" : "alpha_beta")
    expect(result.move).not.toBeNull()
    expect(profileHistory.some((move) => move.cell.row === result.move!.row && move.cell.col === result.move!.col)).toBe(false)
    expect(result.move!.row).toBeGreaterThanOrEqual(0); expect(result.move!.row).toBeLessThan(15)
    expect(result.move!.col).toBeGreaterThanOrEqual(0); expect(result.move!.col).toBeLessThan(15)
    expect(result.stats.nodes).toBeGreaterThan(0)
    expect(result.stats.leafEvaluations).toBeGreaterThan(0)
    expect(result.stats.candidateMovesGenerated).toBeGreaterThan(0)
    expect(Number.isFinite(result.stats.score)).toBe(true)
    expect(result.stats.elapsedMs).toBeGreaterThanOrEqual(0)
    if (difficulty === "easy") {
      expect(result.stats.candidateMovesGenerated).toBe(222)
      expect(result.stats.orderingEvaluations).toBe(0)
      expect(result.stats.cutoffs).toBe(0)
    }
    results.push({ id: `BINARY-PROFILE-${difficulty}`, status: "PASS", input: { history: profileHistory, difficulty, numericId: WASM_DIFFICULTIES[difficulty] }, result })
  }, 15_000)

  it("BINARY-SEEDED-RANDOM-42: repeats exactly from the same hydrated history", () => {
    const games = [new Game(), new Game()]
    try {
      for (const game of games) hydrate(game, profileHistory)
      const moves = games.map((game) => game.ai_move_seeded(0, 42))
      expect(moves[0]).toEqual(moves[1])
      expect(games[0].get_board()).toEqual(games[1].get_board())
      expect(games[0].move_count()).toBe(4)
      results.push({ id: "BINARY-SEEDED-RANDOM-42", status: "PASS", seed: 42, input: profileHistory, rawResults: moves })
    } finally { for (const game of games) game.free() }
  })

  it.each([fixtures[0], fixtures[7]])("BINARY-TERMINAL-$id: all six levels return no move", (fixture) => {
    const moves = history(fixture.cells)
    const replies: AIResult[] = []
    for (const difficulty of profiles) {
      const result = executeWasmSearch({ requestId: 1, roundId: 1, difficulty, history: moves }, Game)
      expect(result.move).toBeNull()
      expect(result.stats).toMatchObject({ reason: "no-move", nodes: null, depth: null, score: null })
      replies.push(result)
    }
    results.push({ id: `BINARY-TERMINAL-${fixture.id}`, status: "PASS", input: moves, replies })
  })
})
