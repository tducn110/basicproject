import { memo } from "react"
import { History } from "lucide-react"
import type { Move } from "../domain"

export interface MoveHistoryProps {
  history: Move[]
  compact?: boolean
}

export const MoveHistory = memo(function MoveHistory({
  history,
  compact,
}: MoveHistoryProps) {
  const recent = [...history].reverse().slice(0, compact ? 4 : 22)

  return (
    <div
      className="paper-card"
      style={{
        padding: 12,
        flex: compact ? undefined : "1 1 0",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          paddingBottom: 6,
          marginBottom: 4,
          borderBottom: "1px solid var(--divider)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <History size={11} />
        Lịch sử nước đi
      </div>
      <div style={{ overflowY: "auto", maxHeight: compact ? 60 : 220 }}>
        {recent.length === 0 ? (
          <div
            style={{
              fontSize: 10,
              padding: "4px 0",
              color: "var(--ink-faint)",
            }}
          >
            Chưa có nước đi nào
          </div>
        ) : (
          recent.map((m) => (
            <div
              key={m.index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 0",
                fontSize: 11,
                color: "var(--ink-muted)",
              }}
            >
              <span
                style={{
                  width: 20,
                  textAlign: "right",
                  fontSize: 10,
                  color: "var(--ink-faint)",
                }}
              >
                {m.index}.
              </span>
              <span
                style={{
                  fontWeight: 700,
                  width: 12,
                  color: m.player === "X" ? "var(--x-color)" : "var(--o-color)",
                }}
              >
                {m.player}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 10 }}>
                ({m.col + 1},{m.row + 1})
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

export const HistoryPanel = MoveHistory
