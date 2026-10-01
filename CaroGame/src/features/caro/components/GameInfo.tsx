import type React from "react"
import { memo } from "react"
import { Clock3, Grid3X3, UsersRound } from "lucide-react"
import { BOARD_SIZE } from "../domain"

export function formatTime(s: number): string {
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

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

export interface GameInfoProps {
  elapsed: number
  compact?: boolean
}

export const GameInfo = memo(function GameInfo({
  elapsed,
  compact,
}: GameInfoProps) {
  return (
    <div
      className="paper-card"
      style={{
        padding: 12,
        display: "flex",
        flexDirection: compact ? "row" : "column",
        gap: compact ? 16 : 8,
      }}
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
      <div
        style={{
          display: "flex",
          flexDirection: compact ? "row" : "column",
          gap: compact ? 16 : 8,
          flex: 1,
        }}
      >
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
