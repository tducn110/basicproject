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

export function CaroGamePage() {
  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    isGameOver,
    history,
    lastMove,
    winCellSet,
    elapsed,
    handleCellClick,
    handleReplay,
    handleNewGame,
  } = useCaroGame()

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
      {/* Coffee ring decorations – purely decorative, pointer-events: none */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -35,
          right: 60,
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: "2px solid rgba(160,120,65,0.13)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -20,
          right: 85,
          width: 70,
          height: 70,
          borderRadius: "50%",
          border: "1.5px solid rgba(160,120,65,0.09)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 40,
          left: 16,
          width: 65,
          height: 65,
          borderRadius: "50%",
          border: "1.5px solid rgba(160,120,65,0.10)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 12px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          className="paper-btn"
          style={{ padding: "6px 12px", fontSize: 12 }}
          aria-label="Quay lại"
        >
          <ArrowLeft size={14} />
          <span style={{ display: "none" }} className="sm-inline">
            Quay lại
          </span>
        </button>

        <div style={{ textAlign: "center" }}>
          <h1
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1,
              letterSpacing: "0.04em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Cờ Caro
          </h1>
          <p style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>
            Chế độ 1v1 — 5 quân liên tiếp để chiến thắng
          </p>
        </div>

        <div style={{ width: 80 }} />
      </header>

      {/* ── Mobile player bar ── */}
      <div
        style={{
          display: "block",
          marginTop: 4,
          position: "relative",
          zIndex: 1,
        }}
        className="lg-hidden"
      >
        <PlayerBar
          currentPlayer={currentPlayer}
          isGameOver={isGameOver}
          p1label={p1label}
          p2label={p2label}
        />
      </div>

      {/* ── Main content ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "12px 12px 8px",
          position: "relative",
          zIndex: 1,
        }}
        className="main-layout"
      >
        {/* Desktop: 3-column row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            flex: 1,
          }}
          className="desktop-row"
        >
          {/* Left: Player cards */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: 200,
              flexShrink: 0,
            }}
            className="desktop-aside"
          >
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
          <section
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              minWidth: 0,
            }}
          >
            <BoardGrid
              board={board}
              lastMove={lastMove}
              winCellSet={winCellSet}
              disabled={isGameOver}
              onCellClick={handleCellClick}
            />
          </section>

          {/* Right: Info + History */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: 210,
              flexShrink: 0,
              alignSelf: "stretch",
            }}
            className="desktop-aside"
          >
            <GameInfo elapsed={elapsed} />
            <MoveHistory history={history} />
          </aside>
        </div>

        {/* Mobile: Board centered, then info/history below */}
        <div
          style={{ display: "flex", justifyContent: "center" }}
          className="mobile-board"
        >
          <BoardGrid
            board={board}
            lastMove={lastMove}
            winCellSet={winCellSet}
            disabled={isGameOver}
            onCellClick={handleCellClick}
          />
        </div>
        <div
          className="mobile-info"
          style={{ display: "flex", gap: 8, flexDirection: "column" }}
        >
          <GameInfo elapsed={elapsed} compact />
          <MoveHistory history={history} compact />
        </div>
      </main>

      {/* ── Win Banner ── */}
      <div style={{ padding: "0 12px 8px", position: "relative", zIndex: 1 }}>
        <WinBanner
          winner={winner}
          isDraw={isDraw}
          onReplay={handleReplay}
          onNewGame={handleNewGame}
        />
      </div>

      {/* ── Footer actions ── */}
      <GameActions
        isGameOver={isGameOver}
        onReplay={handleReplay}
        onNewGame={handleNewGame}
      />
    </div>
  )
}
