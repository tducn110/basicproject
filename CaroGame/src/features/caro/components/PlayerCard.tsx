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
  const borderColor = isActive
    ? piece === "X"
      ? "var(--x-color)"
      : "var(--o-color)"
    : "rgba(80,62,42,0.18)"
  const shadowActive = isActive
    ? piece === "X"
      ? "0 0 0 2px rgba(168,75,42,0.14), var(--shadow-card)"
      : "0 0 0 2px rgba(49,90,114,0.14), var(--shadow-card)"
    : "var(--shadow-paper)"

  return (
    <div
      className="paper-card p-4 flex flex-col gap-2"
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow: shadowActive,
        transition: "border-color 150ms, box-shadow 150ms",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
          }}
        >
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
              background:
                piece === "X" ? "rgba(168,75,42,0.12)" : "rgba(49,90,114,0.12)",
              color: piece === "X" ? "var(--x-color)" : "var(--o-color)",
            }}
          >
            Đến lượt
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
            background:
              piece === "X" ? "rgba(168,75,42,0.10)" : "rgba(49,90,114,0.10)",
          }}
        >
          <UsersRound
            size={17}
            style={{
              color: piece === "X" ? "var(--x-color)" : "var(--o-color)",
            }}
          />
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
              color: piece === "X" ? "var(--x-color)" : "var(--o-color)",
            }}
          >
            {piece === "X" ? "× Quân X" : "○ Quân O"}
          </div>
        </div>
      </div>
    </div>
  )
})
