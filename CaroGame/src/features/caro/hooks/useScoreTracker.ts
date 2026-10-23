import { useCallback, useEffect, useState } from "react"
import type { Player } from "../domain"

export interface MatchScores {
  p1Wins: number
  p2Wins: number
  draws: number
}

const STORAGE_KEY_PVP = "caro_score_pvp_v2"
const STORAGE_KEY_PVE = "caro_score_pve_v2"

const DEFAULT_SCORES: MatchScores = { p1Wins: 0, p2Wins: 0, draws: 0 }

function loadScores(key: string): MatchScores {
  if (typeof window === "undefined") return DEFAULT_SCORES
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        p1Wins: Number(parsed.p1Wins) || 0,
        p2Wins: Number(parsed.p2Wins) || 0,
        draws: Number(parsed.draws) || 0,
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return DEFAULT_SCORES
}

function saveScores(key: string, scores: MatchScores) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(scores))
  } catch {
    // Ignore storage write errors
  }
}

export function useScoreTracker(gameMode: "pvp" | "pve") {
  const storageKey = gameMode === "pvp" ? STORAGE_KEY_PVP : STORAGE_KEY_PVE
  const [scores, setScores] = useState<MatchScores>(() => loadScores(storageKey))

  // Sync when mode changes
  useEffect(() => {
    setScores(loadScores(storageKey))
  }, [storageKey])

  const recordWin = useCallback(
    (winner: Player) => {
      setScores((prev) => {
        const next = {
          ...prev,
          p1Wins: winner === "X" ? prev.p1Wins + 1 : prev.p1Wins,
          p2Wins: winner === "O" ? prev.p2Wins + 1 : prev.p2Wins,
        }
        saveScores(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  const recordDraw = useCallback(() => {
    setScores((prev) => {
      const next = { ...prev, draws: prev.draws + 1 }
      saveScores(storageKey, next)
      return next
    })
  }, [storageKey])

  const resetScores = useCallback(() => {
    const next = { p1Wins: 0, p2Wins: 0, draws: 0 }
    saveScores(storageKey, next)
    setScores(next)
  }, [storageKey])

  return {
    scores,
    recordWin,
    recordDraw,
    resetScores,
  }
}
