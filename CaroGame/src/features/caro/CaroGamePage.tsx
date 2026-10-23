import { Volume2, VolumeX } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  BoardGrid,
  GameActions,
  GameInfo,
  ModeSelector,
  type GameMode,
  MoveHistory,
  PlayerBar,
  PlayerCard,
  WinBanner,
} from "./components"
import { useCaroGame } from "./hooks/useCaroGame"
import { useGameTimer } from "./hooks/useGameTimer"
import { useGameAudio } from "./hooks/useGameAudio"
import { useWasmBot } from "./hooks/useWasmBot"
import { useScoreTracker } from "./hooks/useScoreTracker"
import type { BotDifficulty } from "./wasm/botWorker"

export function CaroGamePage() {
  const audio = useGameAudio()
  const wasmBot = useWasmBot()

  const [gameMode, setGameMode] = useState<GameMode>("pve")
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("medium")

  // Persistent score tracking in localStorage
  const scoreTracker = useScoreTracker(gameMode)

  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    isGameOver,
    history,
    lastMove,
    gameStarted,
    winCellSet,
    handleCellClick,
    handleReplay,
    handleNewGame,
  } = useCaroGame({
    onMoveSuccess: (player, result, isDrawGame) => {
      if (result) {
        audio.playWin()
        scoreTracker.recordWin(result.winner)
      } else if (isDrawGame) {
        audio.playDraw()
        scoreTracker.recordDraw()
      } else {
        audio.playPlacePiece(player)
      }
    },
    onActionClick: () => {
      audio.playButtonClick()
    },
  })

  // TimerState — lifecycle hoàn toàn độc lập, không re-render BoardGrid
  const timer = useGameTimer(gameStarted, isGameOver)

  const onReplayAction = useCallback(() => {
    audio.playButtonClick()
    handleReplay()
    timer.reset()
  }, [audio, handleReplay, timer])

  const onNewGameAction = useCallback(() => {
    audio.playButtonClick()
    handleNewGame()
    timer.reset()
  }, [audio, handleNewGame, timer])

  const handleSelectMode = useCallback(
    (mode: GameMode) => {
      if (mode === gameMode) return
      audio.playButtonClick()
      setGameMode(mode)
      handleNewGame()
      timer.reset()
    },
    [gameMode, audio, handleNewGame, timer],
  )

  const handleSelectDifficulty = useCallback(
    (diff: BotDifficulty) => {
      audio.playButtonClick()
      setBotDifficulty(diff)
      handleNewGame()
      timer.reset()
    },
    [audio, handleNewGame, timer],
  )

  // Trigger Rust WebAssembly Bot move when it is Bot's turn (quân O) in PvE mode
  useEffect(() => {
    if (gameMode !== "pve" || currentPlayer !== "O" || isGameOver) {
      return
    }

    let isCancelled = false
    const moveHistory = history.map((m) => ({ row: m.row, col: m.col }))

    wasmBot.requestMove(moveHistory, botDifficulty).then((botMove) => {
      if (isCancelled || !botMove) return
      handleCellClick(botMove.row, botMove.col)
    })

    return () => {
      isCancelled = true
    }
  }, [
    currentPlayer,
    isGameOver,
    gameMode,
    botDifficulty,
    history,
    wasmBot.requestMove,
    handleCellClick,
  ])

  // User click on cell — blocked when it is Bot's turn or while Bot is calculating
  const handleUserCellClick = useCallback(
    (row: number, col: number) => {
      if (gameMode === "pve" && (currentPlayer === "O" || wasmBot.isThinking)) {
        return
      }
      handleCellClick(row, col)
    },
    [gameMode, currentPlayer, wasmBot.isThinking, handleCellClick],
  )

  const isBotTurn = gameMode === "pve" && currentPlayer === "O"
  const isBoardDisabled = isGameOver || isBotTurn || wasmBot.isThinking

  const p1label = gameMode === "pve" ? "Bạn (X)" : "Người chơi 1"
  const p2label =
    gameMode === "pve"
      ? `Máy AI (${botDifficulty === "easy" ? "Dễ" : botDifficulty === "hard" ? "Khó" : "Vừa"})`
      : "Người chơi 2"

  const diffName =
    botDifficulty === "easy" ? "Dễ" : botDifficulty === "hard" ? "Khó" : "Vừa"

  return (
    <div className="game-container">
      {/* Decorative parchment coffee rings */}
      <div
        aria-hidden
        className="coffee-ring ring-1"
      />
      <div
        aria-hidden
        className="coffee-ring ring-2"
      />
      <div
        aria-hidden
        className="coffee-ring ring-3"
      />

      {/* ── Header: Floating Paper Island ── */}
      <header className="game-header-island">
        <div className="header-brand-group">
          <div className="header-badge-icon" aria-hidden>
            <div className="mini-grid">
              <span className="dot x" />
              <span className="dot o" />
              <span className="dot o" />
              <span className="dot x" />
            </div>
          </div>
          <div>
            <h1 className="font-display game-title">Cờ Caro</h1>
            <p className="game-subtitle">
              {gameMode === "pve"
                ? `Đấu với Máy (Rust WASM) · Cấp độ ${diffName}`
                : "Chế độ 1v1 (Người vs Người) · 5 quân để thắng"}
            </p>
          </div>
        </div>

        <div className="header-controls-group">
          <button
            type="button"
            className={`audio-toggle-pill ${audio.isMuted ? "muted" : "active"}`}
            onClick={() => {
              audio.playButtonClick()
              audio.toggleMute()
            }}
            aria-pressed={!audio.isMuted}
            aria-label={audio.isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            title={audio.isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {audio.isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span className="audio-label">
              {audio.isMuted ? "Tắt tiếng" : "Âm thanh"}
            </span>
          </button>
        </div>
      </header>

      {/* ── Mode selector bar (PvP vs PvE Rust AI) ── */}
      <ModeSelector
        gameMode={gameMode}
        difficulty={botDifficulty}
        disabled={wasmBot.isThinking}
        onSelectMode={handleSelectMode}
        onSelectDifficulty={handleSelectDifficulty}
      />

      {/* ── Mobile player bar (hidden on desktop ≥ 1024px) ── */}
      <div className="mobile-player-bar-wrapper">
        <PlayerBar
          currentPlayer={currentPlayer}
          isGameOver={isGameOver}
          p1label={p1label}
          p2label={p2label}
          isThinking={gameMode === "pve" && wasmBot.isThinking}
          p1Score={scoreTracker.scores.p1Wins}
          p2Score={scoreTracker.scores.p2Wins}
        />
      </div>

      {/* ── Main content (Single authoritative DOM instance) ── */}
      <main className="game-layout">
        {/* Left: Player cards (Desktop only) */}
        <aside className="player-cards-aside">
          <PlayerCard
            label={p1label}
            piece="X"
            isActive={!isGameOver && currentPlayer === "X"}
            score={scoreTracker.scores.p1Wins}
          />
          <PlayerCard
            label={p2label}
            piece="O"
            isActive={!isGameOver && currentPlayer === "O"}
            isBot={gameMode === "pve"}
            isThinking={gameMode === "pve" && wasmBot.isThinking}
            calcTimeMs={gameMode === "pve" ? wasmBot.lastCalculationTime : null}
            score={scoreTracker.scores.p2Wins}
          />
        </aside>

        {/* Center: Board */}
        <section className="board-section">
          <BoardGrid
            board={board}
            currentPlayer={currentPlayer}
            lastMove={lastMove}
            winCellSet={winCellSet}
            disabled={isBoardDisabled}
            onCellClick={handleUserCellClick}
          />
        </section>

        {/* Right (Desktop) / Below (Tablet & Mobile): Info + History */}
        <aside className="game-sidebar">
          <GameInfo
            elapsed={timer.elapsed}
            modeLabel={
              gameMode === "pve" ? `Đấu với Máy (${diffName})` : "1v1 (2 Người)"
            }
            calcTimeMs={gameMode === "pve" ? wasmBot.lastCalculationTime : null}
            p1Score={scoreTracker.scores.p1Wins}
            p2Score={scoreTracker.scores.p2Wins}
            draws={scoreTracker.scores.draws}
            onResetScore={scoreTracker.resetScores}
          />
          <MoveHistory history={history} />
        </aside>
      </main>

      {/* ── Win Banner Modal ── */}
      <WinBanner
        winner={winner}
        isDraw={isDraw}
        totalMoves={history.length}
        onReplay={onReplayAction}
        onNewGame={onNewGameAction}
      />

      {/* ── Footer actions ── */}
      <GameActions
        isGameOver={isGameOver}
        onReplay={onReplayAction}
        onNewGame={onNewGameAction}
      />
    </div>
  )
}
