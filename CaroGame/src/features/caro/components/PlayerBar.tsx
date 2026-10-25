import { memo } from "react"
import { Trophy } from "lucide-react"
import type { Player } from "../domain"
import { Piece } from "./Piece"

export interface PlayerBarProps {
  currentPlayer: Player
  isGameOver: boolean
  p1label?: string
  p2label?: string
  isThinking?: boolean
  p1Score?: number
  p2Score?: number
}

function PlayerMobileSlot({
  player,
  label,
  isActive,
  reverse = false,
  isThinking = false,
  score = 0,
}: {
  player: Player
  label: string
  isActive: boolean
  reverse?: boolean
  isThinking?: boolean
  score?: number
}) {
  const p = player.toLowerCase()

  return (
    <div
      className={`mobile-player-slot ${p} ${isActive ? "active" : ""}`}
      style={{ flexDirection: reverse ? "row-reverse" : "row" }}
    >
      <div className={`mobile-avatar-circle ${p}`}>
        <Piece player={player} />
      </div>

      <div className={`mobile-slot-info ${reverse ? "text-right" : "text-left"}`}>
        <div className="mobile-slot-name-row">
          <span className={`mobile-piece-tag ${p}`}>{player}</span>
          <span className="mobile-player-name">{label}</span>
        </div>
        <div className="mobile-slot-status">
          {isActive ? (
            <span className={`mobile-turn-text ${p} animate-pulse`}>
              {isThinking ? "Đang tính..." : "Đến lượt"}
            </span>
          ) : (
            <span className="mobile-score-text">
              <Trophy size={11} className="inline mr-0.5 opacity-70" />
              {score} thắng
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export const PlayerBar = memo(function PlayerBar({
  currentPlayer,
  isGameOver,
  p1label = "Người chơi 1",
  p2label = "Người chơi 2",
  isThinking = false,
  p1Score = 0,
  p2Score = 0,
}: PlayerBarProps) {
  const activeX = !isGameOver && currentPlayer === "X"
  const activeO = !isGameOver && currentPlayer === "O"

  return (
    <div className="mobile-player-bar-capsule">
      <PlayerMobileSlot
        player="X"
        label={p1label}
        isActive={activeX}
        score={p1Score}
      />
      <div className="mobile-vs-divider">
        <span className="font-display vs-text">VS</span>
      </div>
      <PlayerMobileSlot
        player="O"
        label={p2label}
        isActive={activeO}
        reverse
        isThinking={isThinking}
        score={p2Score}
      />
    </div>
  )
})

export const MobilePlayerBar = PlayerBar
