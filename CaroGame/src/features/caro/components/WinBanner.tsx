import { useEffect } from "react"
import { Crown, RotateCcw, Sparkles, SquarePlus } from "lucide-react"
import type { WinResult } from "../domain"

export interface WinBannerProps {
  winner: WinResult | null
  isDraw: boolean
  totalMoves?: number
  onReplay: () => void
  onNewGame: () => void
}

export function WinBanner({
  winner,
  isDraw,
  totalMoves = 0,
  onReplay,
  onNewGame,
}: WinBannerProps) {
  useEffect(() => {
    if (!winner && !isDraw) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onReplay()
      } else if (e.key === "Enter") {
        onNewGame()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [winner, isDraw, onReplay, onNewGame])

  if (!winner && !isDraw) return null

  const isWin = Boolean(winner)
  const isX = winner?.winner === "X"
  const themeClass = isDraw ? "draw" : isX ? "x-win" : "o-win"

  const title = isDraw
    ? "Ván cờ Bất phân Thắng bại!"
    : isX
      ? "Người chơi 1 (Quân X) Chiến thắng!"
      : "Người chơi 2 (Quân O) Chiến thắng!"

  const subtitle = isDraw
    ? "Toàn bộ 225 ô cờ đã được lấp đầy mà không bên nào tạo được chuỗi 5 quân liên tiếp."
    : `Đạt được chuỗi 5 quân liên tiếp sau tổng cộng ${totalMoves} nước đi nghẹt thở.`

  return (
    <div
      className={`win-banner-modal-overlay ${themeClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-dialog-title"
      aria-describedby="win-dialog-desc"
    >
      <div className="win-banner-card">
        {/* Decorative Badge Icon */}
        <div className={`win-badge-icon ${themeClass}`} aria-hidden="true">
          {isWin ? <Crown size={28} /> : <Sparkles size={28} />}
        </div>

        {/* Text Announce */}
        <div className="win-text-block">
          <h2 id="win-dialog-title" className="font-display win-title">{title}</h2>
          <p id="win-dialog-desc" className="win-subtitle">{subtitle}</p>
        </div>

        {/* CTA Actions */}
        <div className="win-actions-group">
          <button
            type="button"
            className="win-btn-secondary"
            onClick={onReplay}
            aria-label="Chơi lại ván này (Phím Escape)"
          >
            <RotateCcw size={15} className="btn-icon" />
            <span>Chơi lại ván này</span>
          </button>

          <button
            type="button"
            className="win-btn-primary"
            onClick={onNewGame}
            aria-label="Khởi tạo ván mới (Phím Enter)"
            autoFocus
          >
            <span>Ván mới</span>
            <div className="btn-trailing-icon">
              <SquarePlus size={15} />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
