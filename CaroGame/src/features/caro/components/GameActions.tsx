import { LogOut, RotateCcw, SquarePlus } from "lucide-react"

export interface GameActionsProps {
  isGameOver: boolean
  onReplay: () => void
  onNewGame: () => void
  onExit?: () => void
}

export function GameActions({
  isGameOver,
  onReplay,
  onNewGame,
  onExit,
}: GameActionsProps) {
  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        padding: "4px 16px 16px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {!isGameOver && (
        <>
          <button
            className="paper-btn"
            onClick={onReplay}
            aria-label="Chơi lại"
          >
            <RotateCcw size={13} />
            <span>Chơi lại</span>
          </button>
          <button
            className="paper-btn primary"
            onClick={onNewGame}
            aria-label="Ván mới"
          >
            <SquarePlus size={13} />
            <span>Ván mới</span>
          </button>
        </>
      )}
      <button className="paper-btn danger" onClick={onExit} aria-label="Thoát">
        <LogOut size={13} />
        <span>Thoát</span>
      </button>
    </footer>
  )
}
