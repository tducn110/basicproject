import { useEffect, useRef, useState } from "react"

export interface UseGameTimerReturn {
  elapsed: number
  reset: () => void
}

/**
 * Standalone timer hook — tick mỗi 1s khi gameStarted=true và !isGameOver.
 * Hoàn toàn độc lập với GameState; không gây re-render BoardGrid.
 */
export function useGameTimer(gameStarted: boolean, isGameOver: boolean): UseGameTimerReturn {
  const [elapsed, setElapsed] = useState(0)
  const resetRef = useRef(false)

  useEffect(() => {
    if (!gameStarted || isGameOver) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [gameStarted, isGameOver])

  // Reset elapsed when gameStarted goes false (new game / replay)
  useEffect(() => {
    if (!gameStarted) setElapsed(0)
  }, [gameStarted])

  const reset = () => setElapsed(0)

  return { elapsed, reset }
}
