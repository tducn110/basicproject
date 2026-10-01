import { ArrowLeft } from "lucide-react"
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

export function CaroGamePage() {
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
  } = useCaroGame()

  // TimerState — lifecycle hoàn toàn độc lập, không re-render BoardGrid
  const { elapsed } = useGameTimer(gameStarted, isGameOver)

  const p1label = "Người chơi 1"
  const p2label = "Người chơi 2"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Coffee ring decorations – purely decorative */}
      <div aria-hidden className="coffee-ring" style={{ top: -35, right: 60, width: 110, height: 110 }} />
      <div aria-hidden className="coffee-ring" style={{ top: -20, right: 85, width: 70, height: 70, borderWidth: "1.5px", borderColor: "rgba(160,120,65,0.09)" }} />
      <div aria-hidden className="coffee-ring" style={{ bottom: 40, left: 16, width: 65, height: 65, borderWidth: "1.5px", borderColor: "rgba(160,120,65,0.10)" }} />

      {/* ── Header ── */}
      <header className="page-header">
        <button className="paper-btn" style={{ padding: "6px 12px", fontSize: 12 }} aria-label="Quay lại">
          <ArrowLeft size={14} />
          <span style={{ display: "none" }} className="sm-inline">Quay lại</span>
        </button>

        <div style={{ textAlign: "center" }}>
          <h1 className="font-display" style={{ fontWeight: 700, fontSize: "clamp(18px, 4vw, 26px)", lineHeight: 1, letterSpacing: "0.04em", color: "var(--ink)", margin: 0 }}>
            Cờ Caro
          </h1>
          <p style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>
            Chế độ 1v1 — 5 quân liên tiếp để chiến thắng
          </p>
        </div>

        <div style={{ width: 80 }} />
      </header>

      {/* ── Mobile player bar ── */}
      <div style={{ display: "block", marginTop: 4, position: "relative", zIndex: 1 }} className="lg-hidden">
        <PlayerBar currentPlayer={currentPlayer} isGameOver={isGameOver} p1label={p1label} p2label={p2label} />
      </div>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, padding: "12px 12px 8px", position: "relative", zIndex: 1 }} className="main-layout">
        {/* Desktop: 3-column row */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }} className="desktop-row">
          {/* Left: Player cards */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12, width: 200, flexShrink: 0 }} className="desktop-aside">
            <PlayerCard label={p1label} piece="X" isActive={!isGameOver && currentPlayer === "X"} />
            <PlayerCard label={p2label} piece="O" isActive={!isGameOver && currentPlayer === "O"} />
          </aside>

          {/* Center: Board */}
          <section style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", minWidth: 0 }}>
            <BoardGrid board={board} lastMove={lastMove} winCellSet={winCellSet} disabled={isGameOver} onCellClick={handleCellClick} />
          </section>

          {/* Right: Info + History */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12, width: 210, flexShrink: 0, alignSelf: "stretch" }} className="desktop-aside">
            <GameInfo elapsed={elapsed} />
            <MoveHistory history={history} />
          </aside>
        </div>

        {/* Mobile board */}
        <div style={{ display: "flex", justifyContent: "center" }} className="mobile-board">
          <BoardGrid board={board} lastMove={lastMove} winCellSet={winCellSet} disabled={isGameOver} onCellClick={handleCellClick} />
        </div>
        <div className="mobile-info" style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <GameInfo elapsed={elapsed} compact />
          <MoveHistory history={history} compact />
        </div>
      </main>

      {/* ── Win Banner ── */}
      <div style={{ padding: "0 12px 8px", position: "relative", zIndex: 1 }}>
        <WinBanner winner={winner} isDraw={isDraw} onReplay={handleReplay} onNewGame={handleNewGame} />
      </div>

      {/* ── Footer actions ── */}
      <GameActions isGameOver={isGameOver} onReplay={handleReplay} onNewGame={handleNewGame} />
    </div>
  )
}
