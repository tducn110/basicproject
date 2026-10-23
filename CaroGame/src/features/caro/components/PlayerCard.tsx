import { memo } from "react"
import { Bot, Trophy, UsersRound } from "lucide-react"
import type { Player } from "../domain"

export interface PlayerCardProps {
  label: string
  piece: Player
  isActive: boolean
  isBot?: boolean
  isThinking?: boolean
  calcTimeMs?: number | null
  score?: number
}

export const PlayerCard = memo(function PlayerCard({
  label,
  piece,
  isActive,
  isBot = false,
  isThinking = false,
  calcTimeMs,
  score = 0,
}: PlayerCardProps) {
  const p = piece.toLowerCase() // "x" | "o"

  return (
    <div
      className={`player-card-shell ${p} ${isActive ? "active" : ""}`}
    >
      <div className="player-card-core">
        {/* Top Header: Eyebrow label & Turn badge */}
        <div className="player-card-header">
          <span className="player-card-eyebrow">{isBot ? "RUST AI BOT" : "NGƯỜI CHƠI"}</span>
          {isActive ? (
            <span className={`player-turn-badge ${p} animate-pulse`}>
              {isThinking ? "Đang tính..." : "Đến lượt"}
            </span>
          ) : (
            <span className="player-score-badge" title="Số trận thắng">
              <Trophy size={10} className="inline mr-1 opacity-70" />
              {score} thắng
            </span>
          )}
        </div>

        {/* Content Row: Avatar & Name */}
        <div className="player-card-content">
          <div className={`player-avatar-ring ${p} ${isActive ? "ring-active" : ""}`}>
            {isBot ? (
              <Bot size={20} className={`piece-icon ${p}`} />
            ) : (
              <UsersRound size={20} className={`piece-icon ${p}`} />
            )}
          </div>

          <div className="player-meta">
            <h3 className="font-display player-name">{label}</h3>
            <div className="player-subinfo">
              <span className={`piece-token-label ${p}`}>
                {piece === "X" ? "× Quân X" : "○ Quân O"}
              </span>
              {isBot && calcTimeMs != null && (
                <span className="latency-badge" title="Độ trễ tính toán Rust WASM">
                  {calcTimeMs.toFixed(1)}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
