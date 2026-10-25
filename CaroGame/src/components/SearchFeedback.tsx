import { useTranslation } from "react-i18next"
import type { AIResult } from "../game/ai/contracts"

export function SearchFeedback({ thinking, result, error, paused, onRetry }: {
  thinking: boolean
  result: AIResult | null
  error: string | null
  paused: boolean
  onRetry: () => void
}) {
  const { t } = useTranslation()
  const stats = result?.stats
  const value = (number: number | null) => number === null ? "—" : number.toLocaleString()
  return (
    <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", flexShrink: 0 }}>
      <div role="status" aria-live="polite" style={{ fontSize: 12, textAlign: "center", color: "var(--ink-muted)", minHeight: 18 }}>
        {paused ? t("common.pause") : thinking ? t("game.aiThinking") : t("game.aiReady")}
      </div>
      {error && (
        <div role="alert" style={{ textAlign: "center", fontSize: 12 }}>
          {t("game.aiFailed")}{" "}
          <button className="paper-btn" onClick={onRetry} disabled={thinking || paused}>{t("game.retryAi")}</button>
        </div>
      )}
      {stats && (
        <details className="paper-card" style={{ padding: "5px 10px", fontSize: 11 }}>
          <summary style={{ cursor: "pointer" }}>
            {t("game.lastSearch")} · {t(`game.strategy_${stats.strategy}`)} · {t("game.searchDepth")}: {value(stats.depth)}
          </summary>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px 12px", margin: "8px 0" }}>
            {([
              ["searchNodes", stats.nodes], ["searchCutoffs", stats.cutoffs],
              ["searchScore", stats.score], ["searchLeaves", stats.leafEvaluations],
              ["searchOrdering", stats.orderingEvaluations], ["searchCandidates", stats.candidateMovesGenerated],
            ] as const).map(([key, count]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <dt>{t(`game.${key}`)}</dt><dd style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>{value(count)}</dd>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
              <dt>{t("game.searchElapsed")}</dt><dd style={{ margin: 0 }}>{stats.elapsedMs.toFixed(2)} ms</dd>
            </div>
          </dl>
          <p style={{ margin: "4px 0", color: "var(--ink-muted)" }}>
            {t(stats.source === "tactical" ? "game.tacticalScope" : "game.workerScope")}
          </p>
        </details>
      )}
    </div>
  )
}
