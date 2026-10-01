import { memo } from "react"
import { UsersRound } from "lucide-react"
import type { Player } from "../domain"

export interface PlayerCardProps {
  label: string
  piece: Player
  isActive: boolean
}

export const PlayerCard = memo(function PlayerCard({
  label,
  piece,
  isActive,
}: PlayerCardProps) {
  const p = piece.toLowerCase() // "x" | "o" — maps to CSS modifier classes

  return (
    <div
      className={[
        "paper-card p-4 flex flex-col gap-2",
        isActive ? `player-card-active ${p}` : "",
      ].join(" ")}
      style={{ transition: "border-color 150ms, box-shadow 150ms" }}
    >
      {/* Top row: label + turn badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span className="section-label">{label}</span>
        {isActive && <span className={`turn-badge ${p}`}>Đến lượt</span>}
      </div>

      {/* Bottom row: avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className={`piece-avatar md ${p}`}>
          <UsersRound size={17} style={{ color: `var(--${p}-color)` }} />
        </div>
        <div>
          <div
            className="font-display"
            style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: `var(--${p}-color)`,
            }}
          >
            {piece === "X" ? "× Quân X" : "○ Quân O"}
          </div>
        </div>
      </div>
    </div>
  )
})
