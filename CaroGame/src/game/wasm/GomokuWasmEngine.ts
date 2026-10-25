import type { WasmAIRequest, WasmAIResult } from "./contracts"

interface PendingRequest {
  resolve: (result: WasmAIResult) => void
  reject: (error: unknown) => void
}

type WorkerMessage =
  | { type: "result"; id: number; result: WasmAIResult }
  | { type: "error"; id: number; message: string }

/**
 * Owns the WASM worker lifecycle. GameController remains responsible for
 * deciding whether a completed result is still allowed to commit.
 */
export class GomokuWasmEngine {
  private worker: Worker | null = null
  private nextWorkerRequestId = 0
  private readonly pending = new Map<number, PendingRequest>()

  search(request: WasmAIRequest): Promise<WasmAIResult> {
    const id = ++this.nextWorkerRequestId
    return new Promise((resolve, reject) => {
      try {
        if (!this.worker) this.createWorker()
        this.pending.set(id, { resolve, reject })
        this.worker!.postMessage({ type: "search", id, request })
      } catch (error) {
        this.pending.delete(id)
        reject(error)
      }
    })
  }

  cancelPending(): void {
    this.rejectPending(new Error("Gomoku WASM search cancelled"))
    this.worker?.terminate()
    this.worker = null
  }

  /** Releases current resources. A later request can reopen after React effect replay. */
  destroy(): void {
    this.rejectPending(new Error("Gomoku WASM engine destroyed"))
    this.worker?.terminate()
    this.worker = null
  }

  private createWorker(): void {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
    this.worker = worker
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      if (this.worker !== worker) return
      const message = event.data
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.type === "result") pending.resolve(message.result)
      else pending.reject(new Error(message.message))
    }
    worker.onerror = (event) => {
      if (this.worker !== worker) return
      this.worker = null
      worker.terminate()
      this.rejectPending(event.error ?? new Error(event.message))
    }
  }

  private rejectPending(error: Error): void {
    for (const pending of this.pending.values()) pending.reject(error)
    this.pending.clear()
  }
}
