/// <reference lib="webworker" />

import init, { Game } from "./engine/gomoku_engine"
import type { WasmAIRequest } from "./contracts"
import { executeWasmSearch } from "./executeSearch"

let engineInitialization: Promise<void> | null = null

function initializeEngine(): Promise<void> {
  engineInitialization ??= init().then(() => undefined)
  return engineInitialization
}

self.onmessage = async (event: MessageEvent<{ type: "search"; id: number; request: WasmAIRequest }>) => {
  const { id, request } = event.data
  if (event.data.type !== "search") return

  try {
    await initializeEngine()
    const result = executeWasmSearch(request, Game)
    self.postMessage({ type: "result", id, result })
  } catch (error) {
    self.postMessage({
      type: "error",
      id,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
