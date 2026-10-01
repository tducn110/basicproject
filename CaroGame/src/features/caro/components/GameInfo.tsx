import type React from "react"
import { memo } from "react"
import { Clock3, Grid3X3, History, UsersRound } from "lucide-react"
import { BOARD_SIZE, type Move } from "../domain"

// ── Shared formatters ────────────────────────────────────────────────────────

export function formatTime(s: number): string {
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

// ── Shared InfoRow ───────────────────────────────────────────────────────────

export interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}

export function InfoRow({ icon, label, value, mono }: InfoRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "var(--ink-muted)", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>{label}</span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: mono ? "monospace" : undefined,
          color: "var(--ink)",
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ── GameInfo ─────────────────────────────────────────────────────────────────

export interface GameInfoProps {
  elapsed: number
  compact?: boolean
}

export const GameInfo = memo(function GameInfo({
  elapsed,
  compact,
}: GameInfoProps) {
  return (
    <div className={`paper-card game-info-card ${compact ? "compact" : ""}`}>
      {!compact && <div className="game-info-header">Thông tin</div>}
      <div className="game-info-body">
        <InfoRow
          icon={<UsersRound size={12} />}
          label="Chế độ"
          value="1v1 (2 Người)"
        />
        <InfoRow
          icon={<Grid3X3 size={12} />}
          label="Kích thước"
          value={`${BOARD_SIZE}×${BOARD_SIZE}`}
        />
        <InfoRow
          icon={<Clock3 size={12} />}
          label="Thời gian"
          value={formatTime(elapsed)}
          mono
        />
      </div>
    </div>
  )
})

export const InfoCard = GameInfo

// ── MoveHistory ──────────────────────────────────────────────────────────────

export interface MoveHistoryProps {
  history: Move[]
  compact?: boolean
}

export const MoveHistory = memo(function MoveHistory({
  history,
  compact,
}: MoveHistoryProps) {
  const recent = [...history].reverse().slice(0, compact ? 4 : 22)

  return (
    <div className={`paper-card move-history-card ${compact ? "compact" : ""}`}>
      <div className="move-history-header">
        <History size={11} />
        <span>Lịch sử nước đi</span>
      </div>
      <div className="move-history-list">
        {recent.length === 0 ? (
          <div className="move-history-empty">Chưa có nước đi nào</div>
        ) : (
          recent.map((m) => (
            <div key={m.index} className="move-history-item">
              <span className="move-index">{m.index}.</span>
              <span
                className="move-player"
                style={{
                  color: m.player === "X" ? "var(--x-color)" : "var(--o-color)",
                }}
              >
                {m.player}
              </span>
              <span className="move-coords">
                ({m.col + 1},{m.row + 1})
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

export const HistoryPanel = MoveHistory
