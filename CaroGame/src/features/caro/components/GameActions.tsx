import { RotateCcw, SquarePlus } from "lucide-react"

export interface GameActionsProps {
  isGameOver: boolean
  onReplay: () => void
  onNewGame: () => void
}

export function GameActions({
  isGameOver,
  onReplay,
  onNewGame,
}: GameActionsProps) {
  if (isGameOver) {
    return null // WinBanner will take over primary action duties during end game
  }

  return (
    <footer className="game-actions-dock">
      <button
        type="button"
        className="dock-action-btn secondary"
        onClick={onReplay}
        aria-label="Chơi lại ván cờ này"
      >
        <RotateCcw size={14} className="action-icon" />
        <span>Chơi lại</span>
      </button>

      <button
        type="button"
        className="dock-action-btn primary"
        onClick={onNewGame}
        aria-label="Khởi tạo ván cờ mới"
      >
        <SquarePlus size={14} className="action-icon" />
        <span>Ván mới</span>
      </button>
    </footer>
  )
}
