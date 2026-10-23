import type React from "react"
import { memo, useState } from "react"
import { Clock3, Cpu, Grid3X3, History, RotateCcw, Trophy, UsersRound } from "lucide-react"
import { BOARD_SIZE, type Move } from "../domain"

// ── Shared formatters ────────────────────────────────────────────────────────

export function formatTime(s: number): string {
  const mins = Math.floor(s / 60)
    .toString()
    .padStart(2, "0")
  const secs = (s % 60).toString().padStart(2, "0")
  return `${mins}:${secs}`
}

// ── Shared InfoRow ───────────────────────────────────────────────────────────

export interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}

export function InfoRow({ icon, label, value, mono, highlight }: InfoRowProps) {
  return (
    <div className="info-row-item">
      <span className="info-row-icon">{icon}</span>
      <span className="info-row-label">{label}</span>
      <span className={`info-row-value ${mono ? "font-mono" : ""} ${highlight ? "highlight" : ""}`}>
        {value}
      </span>
    </div>
  )
}

// ── GameInfo ─────────────────────────────────────────────────────────────────

export interface GameInfoProps {
  elapsed: number
  compact?: boolean
  modeLabel?: string
  calcTimeMs?: number | null
  p1Score?: number
  p2Score?: number
  draws?: number
  onResetScore?: () => void
}

export const GameInfo = memo(function GameInfo({
  elapsed,
  compact,
  modeLabel = "1v1 (2 Người)",
  calcTimeMs,
  p1Score = 0,
  p2Score = 0,
  draws = 0,
  onResetScore,
}: GameInfoProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleResetClick = () => {
    if (!onResetScore) return
    if (!isConfirming) {
      setIsConfirming(true)
      setTimeout(() => setIsConfirming(false), 3000)
    } else {
      onResetScore()
      setIsConfirming(false)
    }
  }

  return (
    <div className={`paper-card game-info-shell ${compact ? "compact" : ""}`}>
      <div className="game-info-header">
        <span className="header-title">Thông số trận đấu</span>
        {onResetScore && (p1Score > 0 || p2Score > 0 || draws > 0) && (
          <button
            type="button"
            className={`reset-score-btn ${isConfirming ? "confirming" : ""}`}
            onClick={handleResetClick}
            title={isConfirming ? "Bấm lại để xác nhận xóa điểm" : "Đặt lại tỉ số"}
            aria-label={isConfirming ? "Bấm lại để xác nhận xóa điểm" : "Đặt lại tỉ số"}
          >
            <RotateCcw size={11} className="inline mr-1" />
            <span>{isConfirming ? "Xác nhận?" : "Reset điểm"}</span>
          </button>
        )}
      </div>

      <div className="game-info-body">
        <InfoRow
          icon={<UsersRound size={13} />}
          label="Chế độ"
          value={modeLabel}
        />
        <InfoRow
          icon={<Grid3X3 size={13} />}
          label="Kích thước"
          value={`${BOARD_SIZE}×${BOARD_SIZE}`}
        />
        <InfoRow
          icon={<Clock3 size={13} />}
          label="Thời gian"
          value={formatTime(elapsed)}
          mono
        />
        <InfoRow
          icon={<Trophy size={13} />}
          label="Tỉ số (X - Hòa - O)"
          value={`${p1Score} - ${draws} - ${p2Score}`}
          mono
          highlight
        />
        {calcTimeMs != null && (
          <InfoRow
            icon={<Cpu size={13} />}
            label="Độ trễ AI (Rust)"
            value={`${calcTimeMs.toFixed(2)} ms`}
            mono
          />
        )}
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
  const recent = [...history].reverse().slice(0, compact ? 4 : 20)

  return (
    <div className={`paper-card move-history-shell ${compact ? "compact" : ""}`}>
      <div className="move-history-header">
        <History size={13} className="text-ink-muted" />
        <span className="header-title">Lịch sử nước đi</span>
        <span className="history-count-pill">{history.length} nước</span>
      </div>

      <div className="move-history-list">
        {recent.length === 0 ? (
          <div className="move-history-empty">Chưa có nước đi nào</div>
        ) : (
          recent.map((m) => (
            <div key={m.index} className="move-history-item">
              <span className="move-index">#{m.index}</span>
              <span className={`move-player-tag ${m.player.toLowerCase()}`}>
                {m.player}
              </span>
              <span className="move-coords">
                Hàng {m.row + 1}, Cột {m.col + 1}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

export const HistoryPanel = MoveHistory
