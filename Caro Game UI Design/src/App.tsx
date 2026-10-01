import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Bot,
  Clock3,
  Grid3X3,
  History,
  LogOut,
  RotateCcw,
  SquarePlus,
  UsersRound,
} from "lucide-react"
import {
  type Board,
  BOARD_SIZE,
  type GameMode,
  type Move,
  type Player,
  type WinResult,
  checkWinner,
  createBoard,
  getAIMove,
} from "./game"

// ── Piece SVGs ───────────────────────────────────────────────────────────────

function XPiece() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "62%", height: "62%" }} aria-hidden>
      <line x1="18" y1="18" x2="82" y2="82" stroke="#a84b2a" strokeWidth="15" strokeLinecap="round" />
      <line x1="82" y1="18" x2="18" y2="82" stroke="#a84b2a" strokeWidth="15" strokeLinecap="round" />
    </svg>
  )
}

function OPiece() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "62%", height: "62%" }} aria-hidden>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#315a72" strokeWidth="13" strokeLinecap="round" />
    </svg>
  )
}

// ── Board Cell ───────────────────────────────────────────────────────────────

type Cell = "X" | "O" | null

interface CellProps {
  value: Cell
  isLast: boolean
  isWin: boolean
  disabled: boolean
  onClick: () => void
}

const BoardCell = memo(function BoardCell({ value, isLast, isWin, disabled, onClick }: CellProps) {
  const cls = ["board-cell", value ? "occupied" : "", isLast ? "last-move" : "", isWin ? "win-cell" : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <button className={cls} onClick={onClick} disabled={disabled || !!value} aria-label={value ?? "ô trống"}>
      {value && (
        <span className="piece-enter" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          {value === "X" ? <XPiece /> : <OPiece />}
        </span>
      )}
    </button>
  )
})

// ── Board Grid ───────────────────────────────────────────────────────────────

interface BoardGridProps {
  board: Board
  lastMove: [number, number] | null
  winCellSet: Set<string>
  disabled: boolean
  onCellClick: (r: number, c: number) => void
}

const BoardGrid = memo(function BoardGrid({ board, lastMove, winCellSet, disabled, onCellClick }: BoardGridProps) {
  return (
    <div
      className="paper-card"
      style={{
        padding: 8,
        width: "min(calc(100vw - 32px), calc(100dvh - 210px), 620px)",
        aspectRatio: "1",
        borderTop: "3px solid var(--paper-deep)",
        flexShrink: 0,
      }}
    >
      <div
        role="grid"
        aria-label="Bàn cờ Caro"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          width: "100%",
          height: "100%",
          borderLeft: "1px solid var(--grid-line)",
          borderTop: "1px solid var(--grid-line)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <BoardCell
              key={`${r},${c}`}
              value={cell}
              isLast={lastMove?.[0] === r && lastMove?.[1] === c}
              isWin={winCellSet.has(`${r},${c}`)}
              disabled={disabled}
              onClick={() => onCellClick(r, c)}
            />
          )),
        )}
      </div>
    </div>
  )
})

// ── Player Card ──────────────────────────────────────────────────────────────

const PlayerCard = memo(function PlayerCard({
  label,
  piece,
  isActive,
  isAI,
  aiThinking,
}: {
  label: string
  piece: Player
  isActive: boolean
  isAI?: boolean
  aiThinking?: boolean
}) {
  const borderColor = isActive ? (piece === "X" ? "var(--x-color)" : "var(--o-color)") : "rgba(80,62,42,0.18)"
  const shadowActive =
    isActive
      ? piece === "X"
        ? "0 0 0 2px rgba(168,75,42,0.14), var(--shadow-card)"
        : "0 0 0 2px rgba(49,90,114,0.14), var(--shadow-card)"
      : "var(--shadow-paper)"

  return (
    <div
      className="paper-card p-4 flex flex-col gap-2"
      style={{ border: `1px solid ${borderColor}`, boxShadow: shadowActive, transition: "border-color 150ms, box-shadow 150ms" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
          {label}
        </span>
        {isActive && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: 999,
              background: piece === "X" ? "rgba(168,75,42,0.12)" : "rgba(49,90,114,0.12)",
              color: piece === "X" ? "var(--x-color)" : "var(--o-color)",
            }}
          >
            {aiThinking ? (
              <span style={{ display: "flex", gap: 2 }}>
                <span className="thinking-dot">•</span>
                <span className="thinking-dot">•</span>
                <span className="thinking-dot">•</span>
              </span>
            ) : (
              "Đến lượt"
            )}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: piece === "X" ? "rgba(168,75,42,0.10)" : "rgba(49,90,114,0.10)",
          }}
        >
          {isAI ? (
            <Bot size={17} style={{ color: "var(--o-color)" }} />
          ) : (
            <UsersRound size={17} style={{ color: piece === "X" ? "var(--x-color)" : "var(--o-color)" }} />
          )}
        </div>
        <div>
          <div className="font-display" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {label}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: piece === "X" ? "var(--x-color)" : "var(--o-color)" }}>
            {piece === "X" ? "× Quân X" : "○ Quân O"}
          </div>
        </div>
      </div>
    </div>
  )
})

// ── Compact Mobile Player Bar ────────────────────────────────────────────────

const MobilePlayerBar = memo(function MobilePlayerBar({
  mode,
  currentPlayer,
  isGameOver,
}: {
  mode: GameMode
  currentPlayer: Player
  isGameOver: boolean
}) {
  const p1label = mode === "ai" ? "Bạn" : "Người chơi 1"
  const p2label = mode === "ai" ? "Máy" : "Người chơi 2"
  const activeX = !isGameOver && currentPlayer === "X"
  const activeO = !isGameOver && currentPlayer === "O"

  return (
    <div className="paper-card mx-3 flex items-center gap-1" style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 6,
          background: activeX ? "rgba(168,75,42,0.10)" : "transparent",
          borderLeft: activeX ? "3px solid var(--x-color)" : "3px solid transparent",
          transition: "background 120ms",
        }}
      >
        <div style={{ width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <XPiece />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--x-color)" }}>X</div>
          <div style={{ fontSize: 9, color: "var(--ink-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p1label}
          </div>
        </div>
        {activeX && (
          <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, letterSpacing: "0.05em", padding: "1px 5px", borderRadius: 4, background: "rgba(168,75,42,0.12)", color: "var(--x-color)" }}>
            ↩
          </span>
        )}
      </div>

      <span className="font-display" style={{ fontSize: 11, color: "var(--ink-muted)", flexShrink: 0, padding: "0 4px" }}>
        VS
      </span>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 6,
          background: activeO ? "rgba(49,90,114,0.10)" : "transparent",
          borderRight: activeO ? "3px solid var(--o-color)" : "3px solid transparent",
          transition: "background 120ms",
        }}
      >
        <div style={{ width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <OPiece />
        </div>
        <div style={{ minWidth: 0, textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--o-color)" }}>O</div>
          <div style={{ fontSize: 9, color: "var(--ink-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p2label}
          </div>
        </div>
        {activeO && (
          <span style={{ marginRight: "auto", fontSize: 8, fontWeight: 700, letterSpacing: "0.05em", padding: "1px 5px", borderRadius: 4, background: "rgba(49,90,114,0.12)", color: "var(--o-color)" }}>
            ↩
          </span>
        )}
      </div>
    </div>
  )
})

// ── Win Banner ───────────────────────────────────────────────────────────────

function WinBanner({
  winner,
  mode,
  isDraw,
  onReplay,
  onNewGame,
}: {
  winner: WinResult | null
  mode: GameMode
  isDraw: boolean
  onReplay: () => void
  onNewGame: () => void
}) {
  if (!winner && !isDraw) return null

  let title = "Hòa!"
  let sub = "Bàn cờ đã kín"
  let color = "var(--ink-muted)"

  if (winner) {
    if (mode === "ai") {
      title = winner.winner === "X" ? "Bạn thắng!" : "Máy thắng!"
    } else {
      title = winner.winner === "X" ? "Người chơi 1 thắng!" : "Người chơi 2 thắng!"
    }
    sub = "5 quân liên tiếp"
    color = winner.winner === "X" ? "var(--x-color)" : "var(--o-color)"
  }

  return (
    <div
      className="win-banner paper-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px",
        maxWidth: 480,
        margin: "0 auto",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2, color }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="paper-btn" onClick={onReplay} aria-label="Chơi lại">
          <RotateCcw size={13} />
          <span>Chơi lại</span>
        </button>
        <button className="paper-btn primary" onClick={onNewGame} aria-label="Ván mới">
          <SquarePlus size={13} />
          <span>Ván mới</span>
        </button>
      </div>
    </div>
  )
}

// ── Info Card ────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "var(--ink-muted)", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, fontFamily: mono ? "monospace" : undefined, color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  )
}

const InfoCard = memo(function InfoCard({ mode, elapsed, compact }: { mode: GameMode; elapsed: number; compact?: boolean }) {
  return (
    <div
      className="paper-card"
      style={{ padding: 12, display: "flex", flexDirection: compact ? "row" : "column", gap: compact ? 16 : 8 }}
    >
      {!compact && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            paddingBottom: 6,
            borderBottom: "1px solid var(--divider)",
          }}
        >
          Thông tin
        </div>
      )}
      <div style={{ display: "flex", flexDirection: compact ? "row" : "column", gap: compact ? 16 : 8, flex: 1 }}>
        <InfoRow icon={<UsersRound size={12} />} label="Chế độ" value={mode === "1v1" ? "1v1" : "Đấu máy"} />
        <InfoRow icon={<Grid3X3 size={12} />} label="Kích thước" value={`${BOARD_SIZE}×${BOARD_SIZE}`} />
        <InfoRow icon={<Clock3 size={12} />} label="Thời gian" value={formatTime(elapsed)} mono />
      </div>
    </div>
  )
})

// ── History Panel ────────────────────────────────────────────────────────────

const HistoryPanel = memo(function HistoryPanel({ history, compact }: { history: Move[]; compact?: boolean }) {
  const recent = [...history].reverse().slice(0, compact ? 4 : 22)

  return (
    <div
      className="paper-card"
      style={{ padding: 12, flex: compact ? undefined : "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          paddingBottom: 6,
          marginBottom: 4,
          borderBottom: "1px solid var(--divider)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <History size={11} />
        Lịch sử nước đi
      </div>
      <div style={{ overflowY: "auto", maxHeight: compact ? 60 : 220 }}>
        {recent.length === 0 ? (
          <div style={{ fontSize: 10, padding: "4px 0", color: "var(--ink-faint)" }}>Chưa có nước đi nào</div>
        ) : (
          recent.map((m) => (
            <div key={m.index} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0", fontSize: 11, color: "var(--ink-muted)" }}>
              <span style={{ width: 20, textAlign: "right", fontSize: 10, color: "var(--ink-faint)" }}>{m.index}.</span>
              <span style={{ fontWeight: 700, width: 12, color: m.player === "X" ? "var(--x-color)" : "var(--o-color)" }}>
                {m.player}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 10 }}>
                ({m.col + 1},{m.row + 1})
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

// ── Main App ─────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

export default function App() {
  const [board, setBoard] = useState<Board>(createBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [mode, setMode] = useState<GameMode>("1v1")
  const [winner, setWinner] = useState<WinResult | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [history, setHistory] = useState<Move[]>([])
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)

  const winCellSet = useMemo(() => {
    if (!winner) return new Set<string>()
    return new Set(winner.cells.map(([r, c]) => `${r},${c}`))
  }, [winner])

  // Refs to avoid stale closures inside placeMove's setBoard updater
  const historyRef = useRef<Move[]>(history)
  historyRef.current = history
  const gameStartedRef = useRef(gameStarted)
  gameStartedRef.current = gameStarted
  const winnerRef = useRef(winner)
  winnerRef.current = winner
  const currentPlayerRef = useRef(currentPlayer)
  currentPlayerRef.current = currentPlayer
  const boardSnapshotRef = useRef<Board>(board)
  boardSnapshotRef.current = board

  const placeMove = useCallback((row: number, col: number, isAI = false) => {
    setBoard((prev) => {
      if (prev[row][col] || winnerRef.current) return prev
      const next = prev.map((r) => [...r]) as Board
      const player: Player = isAI ? "O" : currentPlayerRef.current
      next[row][col] = player

      const result = checkWinner(next, row, col)
      const prevHistory = historyRef.current
      const newHistory: Move[] = [...prevHistory, { player, row, col, index: prevHistory.length + 1 }]

      setLastMove([row, col])
      setHistory(newHistory)
      if (!gameStartedRef.current) setGameStarted(true)
      setAiThinking(false)

      if (result) {
        setWinner(result)
      } else if (newHistory.length === BOARD_SIZE * BOARD_SIZE) {
        setIsDraw(true)
      } else {
        setCurrentPlayer(player === "X" ? "O" : "X")
      }

      return next
    })
  }, [])

  // AI move trigger
  useEffect(() => {
    if (mode !== "ai" || currentPlayer !== "O" || winner || isDraw) return
    setAiThinking(true)
    const timer = setTimeout(() => {
      const [r, c] = getAIMove(boardSnapshotRef.current, "O")
      placeMove(r, c, true)
    }, 380)
    return () => clearTimeout(timer)
  }, [mode, currentPlayer, winner, isDraw, placeMove])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winner || isDraw || aiThinking) return
      if (mode === "ai" && currentPlayer === "O") return
      placeMove(row, col)
    },
    [winner, isDraw, aiThinking, mode, currentPlayer, placeMove],
  )

  const handleReplay = useCallback(() => {
    setBoard(createBoard())
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
    setHistory([])
    setLastMove(null)
    setGameStarted(false)
    setAiThinking(false)
  }, [])

  const handleNewGame = useCallback(
    (newMode?: GameMode) => {
      handleReplay()
      if (newMode) setMode(newMode)
    },
    [handleReplay],
  )

  const isGameOver = !!winner || isDraw
  const p1label = mode === "ai" ? "Bạn" : "Người chơi 1"
  const p2label = mode === "ai" ? "Máy" : "Người chơi 2"

  // Inline timer value for InfoCard — use a separate timer component
  const [displayElapsed, setDisplayElapsed] = useState(0)
  useEffect(() => {
    if (!gameStarted || isGameOver) return
    const id = setInterval(() => setDisplayElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [gameStarted, isGameOver])
  useEffect(() => {
    if (!gameStarted) setDisplayElapsed(0)
  }, [gameStarted])

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", maxWidth: 1400, margin: "0 auto", position: "relative", overflow: "hidden" }}>
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
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 8px", position: "relative", zIndex: 1 }}>
        <button className="paper-btn" style={{ padding: "6px 12px", fontSize: 12 }} aria-label="Quay lại">
          <ArrowLeft size={14} />
          <span style={{ display: "none" }} className="sm-inline">Quay lại</span>
        </button>

        <div style={{ textAlign: "center" }}>
          <h1 className="font-display" style={{ fontWeight: 700, fontSize: "clamp(18px, 4vw, 26px)", lineHeight: 1, letterSpacing: "0.04em", color: "var(--ink)", margin: 0 }}>
            Cờ Caro
          </h1>
          <p style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 3 }}>5 quân liên tiếp để chiến thắng</p>
        </div>

        <div style={{ width: 80 }} />
      </header>

      {/* ── Mode Tabs ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 16px", borderBottom: "1px solid var(--divider)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(["1v1", "ai"] as GameMode[]).map((m) => (
            <button
              key={m}
              className={`mode-tab ${mode === m ? "active" : "inactive"}`}
              onClick={() => handleNewGame(m)}
              aria-pressed={mode === m}
            >
              {m === "1v1" ? <UsersRound size={14} /> : <Bot size={14} />}
              <span>{m === "1v1" ? "1v1" : "Đấu máy"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile player bar ── */}
      <div style={{ display: "block", marginTop: 12, position: "relative", zIndex: 1 }} className="lg-hidden">
        <MobilePlayerBar mode={mode} currentPlayer={currentPlayer} isGameOver={isGameOver} />
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
          style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}
          className="desktop-row"
        >
          {/* Left: Player cards */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12, width: 200, flexShrink: 0 }} className="desktop-aside">
            <PlayerCard label={p1label} piece="X" isActive={!isGameOver && currentPlayer === "X"} />
            <PlayerCard label={p2label} piece="O" isActive={!isGameOver && currentPlayer === "O"} isAI={mode === "ai"} aiThinking={aiThinking} />
          </aside>

          {/* Center: Board */}
          <section style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", minWidth: 0 }}>
            <BoardGrid
              board={board}
              lastMove={lastMove}
              winCellSet={winCellSet}
              disabled={isGameOver || aiThinking}
              onCellClick={handleCellClick}
            />
          </section>

          {/* Right: Info + History */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12, width: 210, flexShrink: 0, alignSelf: "stretch" }} className="desktop-aside">
            <InfoCard mode={mode} elapsed={displayElapsed} />
            <HistoryPanel history={history} />
          </aside>
        </div>

        {/* Mobile: Board centered, then info/history below */}
        <div style={{ display: "flex", justifyContent: "center" }} className="mobile-board">
          <BoardGrid
            board={board}
            lastMove={lastMove}
            winCellSet={winCellSet}
            disabled={isGameOver || aiThinking}
            onCellClick={handleCellClick}
          />
        </div>
        <div className="mobile-info" style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <InfoCard mode={mode} elapsed={displayElapsed} compact />
          <HistoryPanel history={history} compact />
        </div>
      </main>

      {/* ── Win Banner ── */}
      <div style={{ padding: "0 12px 8px", position: "relative", zIndex: 1 }}>
        <WinBanner winner={winner} mode={mode} isDraw={isDraw} onReplay={handleReplay} onNewGame={handleNewGame} />
      </div>

      {/* ── Footer actions ── */}
      <footer style={{ display: "flex", justifyContent: "center", gap: 8, padding: "4px 16px 16px", position: "relative", zIndex: 1 }}>
        {!isGameOver && (
          <>
            <button className="paper-btn" onClick={handleReplay} aria-label="Chơi lại">
              <RotateCcw size={13} />
              <span>Chơi lại</span>
            </button>
            <button className="paper-btn primary" onClick={() => handleNewGame()} aria-label="Ván mới">
              <SquarePlus size={13} />
              <span>Ván mới</span>
            </button>
          </>
        )}
        <button className="paper-btn danger" aria-label="Thoát">
          <LogOut size={13} />
          <span>Thoát</span>
        </button>
      </footer>
    </div>
  )
}
