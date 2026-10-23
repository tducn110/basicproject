import { memo } from "react"
import { Bot, Sparkles, Users } from "lucide-react"
import type { BotDifficulty } from "../wasm/botWorker"

export type GameMode = "pvp" | "pve"

export interface ModeSelectorProps {
  gameMode: GameMode
  difficulty: BotDifficulty
  disabled?: boolean
  onSelectMode: (mode: GameMode) => void
  onSelectDifficulty: (difficulty: BotDifficulty) => void
}

export const ModeSelector = memo(function ModeSelector({
  gameMode,
  difficulty,
  disabled = false,
  onSelectMode,
  onSelectDifficulty,
}: ModeSelectorProps) {
  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      onSelectMode(gameMode === "pvp" ? "pve" : "pvp")
    }
  }

  const handleDiffKeyDown = (e: React.KeyboardEvent, currentDiff: BotDifficulty) => {
    if (disabled) return
    const diffs: BotDifficulty[] = ["easy", "medium", "hard"]
    const idx = diffs.indexOf(currentDiff)
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      onSelectDifficulty(diffs[(idx + 1) % diffs.length])
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      onSelectDifficulty(diffs[(idx - 1 + diffs.length) % diffs.length])
    }
  }

  return (
    <div className="mode-selector-container">
      {/* Mode Segmented Pill */}
      <div
        className="mode-segmented-pill"
        role="tablist"
        aria-label="Chế độ chơi (Dùng mũi tên trái/phải để chuyển)"
        onKeyDown={handleTabKeyDown}
      >
        <button
          type="button"
          role="tab"
          aria-selected={gameMode === "pvp"}
          className={`mode-tab-btn ${gameMode === "pvp" ? "active" : ""}`}
          onClick={() => onSelectMode("pvp")}
          disabled={disabled}
        >
          <Users size={14} className="tab-icon" />
          <span>Người vs Người</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={gameMode === "pve"}
          className={`mode-tab-btn ${gameMode === "pve" ? "active" : ""}`}
          onClick={() => onSelectMode("pve")}
          disabled={disabled}
        >
          <Bot size={14} className="tab-icon" />
          <span>Đấu với AI</span>
          <span className="wasm-tag">WASM</span>
        </button>
      </div>

      {/* Difficulty selector (visible only in PvE mode) */}
      {gameMode === "pve" && (
        <div className="difficulty-pills-wrap" role="radiogroup" aria-label="Mức độ khó của AI">
          <span className="diff-label">
            <Sparkles size={11} className="inline mr-1 opacity-70" />
            Độ khó:
          </span>
          <div className="diff-buttons-group">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const labelMap = { easy: "Dễ", medium: "Vừa", hard: "Khó" }
              const active = difficulty === diff
              return (
                <button
                  key={diff}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`diff-btn ${diff} ${active ? "active" : ""}`}
                  onClick={() => onSelectDifficulty(diff)}
                  onKeyDown={(e) => handleDiffKeyDown(e, diff)}
                  disabled={disabled}
                >
                  {labelMap[diff]}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})
