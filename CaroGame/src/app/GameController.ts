import { GameState } from "../game/core/GameState"
import { FreestyleGomokuWinRule } from "../game/core/WinRules"
import type { CellCoord, Move, Player, WinResult } from "../game/core/types"
import { MatchController } from "../game/behaviors/match/MatchController"
import type { GameMode } from "../game/behaviors/match/MatchState"
import { playMove, type PlayMoveResult } from "../game/behaviors/move/PlayMove"
import { AIController } from "../game/ai/AIController"
import type { AIResult, AIService, BotDifficulty } from "../game/ai/contracts"
import { BOARD_SIZE } from "../game/core/BoardBounds"

export interface BoardStone { readonly cell: CellCoord; readonly player: Player }

export interface GameSnapshot {
  readonly match: ReturnType<MatchController["snapshot"]>
  readonly currentPlayer: Player
  readonly aiThinking: boolean
  readonly paused: boolean
  readonly board: readonly BoardStone[]
  readonly history: readonly Move[]
  readonly lastMove: Move | null
  readonly lastAiResult: AIResult | null
  readonly aiError: string | null
}

export class GameController {
  private readonly state = new GameState()
  private readonly match = new MatchController()
  private readonly winRule = new FreestyleGomokuWinRule()
  private readonly ai: AIService
  private currentPlayer: Player = "X"
  private aiThinking = false
  private paused = false
  private turnToken = 0
  private lastAiResult: AIResult | null = null
  private aiError: string | null = null
  private listeners = new Set<() => void>()
  private cachedSnapshot: GameSnapshot

  constructor(ai: AIService = new AIController()) {
    this.ai = ai
    this.cachedSnapshot = this.makeSnapshot()
  }

  private makeSnapshot(): GameSnapshot {
    const history = this.state.getHistory().map((move) => ({ ...move, cell: { ...move.cell } }))
    const board: BoardStone[] = []
    this.state.forEachStone((cell, player) => board.push({ cell: { ...cell }, player }))
    const lastMove = history[history.length - 1] ?? null
    return { match: this.match.snapshot(), currentPlayer: this.currentPlayer, aiThinking: this.aiThinking, paused: this.paused, board, history, lastMove, lastAiResult: this.lastAiResult, aiError: this.aiError }
  }

  snapshot(): GameSnapshot { return this.cachedSnapshot }
  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private notify(): void { this.cachedSnapshot = this.makeSnapshot(); this.listeners.forEach((listener) => listener()) }

  playCell(cell: CellCoord): PlayMoveResult {
    if (this.paused) return { type: "rejected", reason: "paused" }
    const current = this.match.snapshot()
    if (current.phase === "setup" || current.phase === "ready") this.match.startRound()
    const playing = this.match.snapshot()
    if (playing.phase === "game-over") return { type: "rejected", reason: "match-ended" }
    if (this.aiThinking) return { type: "rejected", reason: "input-locked" }
    if (playing.mode === "ai" && this.currentPlayer !== "X") return { type: "rejected", reason: "wrong-turn" }

    const result = playMove(this.state, this.winRule, { player: this.currentPlayer, cell })
    if (result.type !== "accepted") return result
    this.finishMove(result.win)
    this.notify()
    if (!result.win && this.match.snapshot().phase === "playing" && this.match.snapshot().mode === "ai" && this.currentPlayer === "O") this.startAiTurn()
    return result
  }

  private finishMove(win: WinResult | null): void {
    if (win) this.match.finish(win)
    else if (this.state.moveCount === BOARD_SIZE * BOARD_SIZE) this.match.finishDraw()
    else this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
  }

  replay(): void {
    this.invalidateAiTurn()
    this.clearSearchFeedback()
    this.state.reset()
    this.currentPlayer = "X"
    this.match.replay()
    this.notify()
  }

  newGame(): void {
    this.invalidateAiTurn()
    this.clearSearchFeedback()
    this.state.reset()
    this.currentPlayer = "X"
    this.match.newGame()
    this.notify()
  }

  setMode(mode: GameMode): void {
    this.invalidateAiTurn()
    this.clearSearchFeedback()
    this.state.reset()
    this.currentPlayer = "X"
    this.match.newGame()
    this.match.chooseMode(mode)
    this.notify()
  }

  setDifficulty(difficulty: BotDifficulty): void {
    this.invalidateAiTurn()
    this.clearSearchFeedback()
    this.state.reset()
    this.currentPlayer = "X"
    this.match.newGame()
    this.match.chooseDifficulty(difficulty)
    this.notify()
  }

  /** PvP removes one ply; AI removes the human move and any completed reply. */
  undo(): boolean {
    if (this.paused || this.state.moveCount === 0) return false
    const match = this.match.snapshot()
    const last = this.state.lastMove!
    const count = match.mode === "ai" && last.player === "O" ? 2 : 1
    this.invalidateAiTurn()
    this.clearSearchFeedback()
    for (let index = 0; index < count; index++) this.state.undoLast()
    this.currentPlayer = this.state.lastMove?.player === "X" ? "O" : "X"
    this.match.resumeAfterUndo(this.state.moveCount > 0)
    this.notify()
    return true
  }

  retryAiTurn(): void {
    const match = this.match.snapshot()
    if (!this.paused && !this.aiThinking && match.phase === "playing" && match.mode === "ai" && this.currentPlayer === "O") this.startAiTurn()
  }

  private clearSearchFeedback(): void { this.lastAiResult = null; this.aiError = null }

  /** Freezes game-owned input and an active AI turn without ending the round. */
  setPaused(paused: boolean): void {
    if (this.paused === paused) return
    this.paused = paused
    if (paused) this.invalidateAiTurn()
    this.notify()
    if (!paused) {
      const match = this.match.snapshot()
      if (match.phase === "playing" && match.mode === "ai" && this.currentPlayer === "O") {
        this.startAiTurn()
      }
    }
  }

  destroy(): void { this.invalidateAiTurn(); this.ai.destroy() }

  private invalidateAiTurn(): void {
    this.turnToken++
    this.aiThinking = false
    this.ai.cancelPending()
  }

  private startAiTurn(): void {
    if (this.paused) return
    const token = ++this.turnToken
    const roundId = this.match.snapshot().roundId
    const difficulty = this.match.snapshot().difficulty
    this.aiError = null
    this.aiThinking = true
    this.notify()
    void this.ai.requestMove(this.state, roundId, difficulty).then((result) => {
      const current = this.match.snapshot()
      if (token !== this.turnToken || this.paused || result.roundId !== current.roundId || current.phase !== "playing" || current.mode !== "ai" || this.currentPlayer !== "O") return
      this.aiThinking = false
      this.lastAiResult = result
      if (result.move) {
        const moveResult = playMove(this.state, this.winRule, { player: "O", cell: result.move })
        if (moveResult.type === "accepted") this.finishMove(moveResult.win)
        else this.aiError = "AI returned an invalid move"
      }
      else this.aiError = "AI returned no move for an active round"
      this.notify()
    }).catch((error: unknown) => {
      if (token === this.turnToken) {
        this.aiThinking = false
        this.aiError = error instanceof Error ? error.message : "AI search failed"
        this.notify()
      }
    })
  }
}
