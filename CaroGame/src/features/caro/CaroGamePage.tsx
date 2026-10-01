import { ArrowLeft, Volume2, VolumeX } from "lucide-react"
import { useCallback } from "react"
import {
  BoardGrid,
  GameActions,
  GameInfo,
  MoveHistory,
  PlayerBar,
  PlayerCard,
  WinBanner,
} from "./components"
import { useCaroGame } from "./hooks/useCaroGame"
import { useGameTimer } from "./hooks/useGameTimer"
import { useGameAudio } from "./hooks/useGameAudio"

export function CaroGamePage() {
  const audio = useGameAudio()

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
    onMoveSuccess: (player, result, isDraw) => {
      if (result) {
        audio.playWin()
      } else if (isDraw) {
        audio.playDraw()
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
    handleReplay()
    timer.reset()
  }, [handleReplay, timer])

  const onNewGameAction = useCallback(() => {
    handleNewGame()
    timer.reset()
  }, [handleNewGame, timer])

  const p1label = "Người chơi 1"
  const p2label = "Người chơi 2"

  return (
    <div className="game-container">
      {/* Decorative coffee rings */}
      <div
        aria-hidden
        className="coffee-ring"
        style={{ top: -35, right: 60, width: 110, height: 110 }}
      />
      <div
        aria-hidden
        className="coffee-ring"
        style={{
          top: -20,
          right: 85,
          width: 70,
          height: 70,
          borderWidth: "1.5px",
          borderColor: "rgba(160,120,65,0.09)",
        }}
      />
      <div
        aria-hidden
        className="coffee-ring"
        style={{
          bottom: 40,
          left: 16,
          width: 65,
          height: 65,
          borderWidth: "1.5px",
          borderColor: "rgba(160,120,65,0.10)",
        }}
      />

      {/* ── Header ── */}
      <header className="game-header">
        <div className="header-left">
          <button
            className="paper-btn"
            style={{ padding: "6px 12px", fontSize: 12 }}
            aria-label="Quay lại"
          >
            <ArrowLeft size={14} />
            <span className="sm-inline">Quay lại</span>
          </button>
        </div>

        <div className="header-center">
          <h1 className="font-display game-title">Cờ Caro</h1>
          <p className="game-subtitle">
            Chế độ 1v1 — 5 quân liên tiếp để chiến thắng
          </p>
        </div>

        <div className="header-right">
          <button
            className={`paper-btn ${audio.isMuted ? "muted" : ""}`}
            style={{ padding: "6px 12px", fontSize: 12, gap: 6 }}
            onClick={() => {
              audio.playButtonClick()
              audio.toggleMute()
            }}
            aria-label={audio.isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            title={audio.isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {audio.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span className="sm-inline">{audio.isMuted ? "Tắt tiếng" : "Âm thanh"}</span>
          </button>
        </div>
      </header>

      {/* ── Mobile player bar (hidden on desktop ≥ 1024px) ── */}
      <div className="mobile-player-bar-wrapper">
        <PlayerBar
          currentPlayer={currentPlayer}
          isGameOver={isGameOver}
          p1label={p1label}
          p2label={p2label}
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
          />
          <PlayerCard
            label={p2label}
            piece="O"
            isActive={!isGameOver && currentPlayer === "O"}
          />
        </aside>

        {/* Center: Board */}
        <section className="board-section">
          <BoardGrid
            board={board}
            lastMove={lastMove}
            winCellSet={winCellSet}
            disabled={isGameOver}
            onCellClick={handleCellClick}
          />
        </section>

        {/* Right (Desktop) / Below (Tablet & Mobile): Info + History */}
        <aside className="game-sidebar">
          <GameInfo elapsed={timer.elapsed} />
          <MoveHistory history={history} />
        </aside>
      </main>

      {/* ── Win Banner ── */}
      <div className="win-banner-wrapper">
        <WinBanner
          winner={winner}
          isDraw={isDraw}
          onReplay={onReplayAction}
          onNewGame={onNewGameAction}
        />
      </div>

      {/* ── Footer actions ── */}
      <GameActions
        isGameOver={isGameOver}
        onReplay={onReplayAction}
        onNewGame={onNewGameAction}
      />
    </div>
  )
}
