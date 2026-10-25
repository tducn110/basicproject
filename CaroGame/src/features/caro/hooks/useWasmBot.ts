import { useCallback, useEffect, useRef, useState } from "react"
import type { BotDifficulty, BotMoveRequest, BotMoveResponse } from "../wasm/botWorker"

export function useWasmBot() {
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const [isThinking, setIsThinking] = useState(false)
  const [lastCalculationTime, setLastCalculationTime] = useState<number | null>(null)
  const pendingCallbacks = useRef<
    Map<number, (move: { row: number; col: number } | null) => void>
  >(new Map())

  useEffect(() => {
    // ponytail: native Web Worker loaded via Vite import.meta.url
    const worker = new Worker(new URL("../wasm/botWorker.ts", import.meta.url), {
      type: "module",
    })

    worker.onmessage = (e: MessageEvent<BotMoveResponse>) => {
      const { id, move, elapsedMs, error } = e.data
      if (error) {
        console.error("[WASM Bot Error]:", error)
      }
      setLastCalculationTime(elapsedMs)
      const cb = pendingCallbacks.current.get(id)
      if (cb) {
        pendingCallbacks.current.delete(id)
        cb(move)
      }
      setIsThinking(false)
    }

    worker.onerror = (err) => {
      console.error("[WASM Worker Fatal Error]:", err)
      setIsThinking(false)
    }

    workerRef.current = worker

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const requestMove = useCallback(
    (
      history: { row: number; col: number }[],
      difficulty: BotDifficulty = "medium",
    ): Promise<{ row: number; col: number } | null> => {
      return new Promise((resolve) => {
        if (!workerRef.current) {
          resolve(null)
          return
        }
        const id = ++requestIdRef.current
        pendingCallbacks.current.set(id, resolve)
        setIsThinking(true)
        const req: BotMoveRequest = { id, history, difficulty }
        workerRef.current.postMessage(req)
      })
    },
    [],
  )

  return {
    requestMove,
    isThinking,
    lastCalculationTime,
  }
}
