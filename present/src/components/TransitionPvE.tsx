import React, { useState } from "react"
import { Bot, User, ArrowRight, Zap, Check, AlertCircle, Workflow, Terminal, Play } from "lucide-react"
import { MathText } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure: (id: string) => void
}

export const TransitionPvE: React.FC<Props> = ({ onOpenFigure }) => {
  const [selectedDiff, setSelectedDiff] = useState<"easy" | "medium" | "hard">("medium")
  const [isSimulatingBot, setIsSimulatingBot] = useState(false)
  const [botLog, setBotLog] = useState<string[]>([])

  const triggerBotSimulation = (diff: "easy" | "medium" | "hard") => {
    soundManager.playClick()
    setSelectedDiff(diff)
    setIsSimulatingBot(true)
    setBotLog([`[UI]: Người chơi đặt quân X tại (7, 7)`])

    setTimeout(() => {
      setBotLog((prev) => [...prev, `[useCaroGame]: Kích hoạt useEffect Bot Turn (quân O, Mode: PvE, Diff: ${diff})`])
    }, 250)

    setTimeout(() => {
      setBotLog((prev) => [
        ...prev,
        `[useWasmBot]: Gửi postMessage sang Web Worker (Thread ID: #Worker-1, History: 1 move)`,
      ])
    }, 500)

    setTimeout(() => {
      const ms = diff === "easy" ? "0.022 ms" : diff === "medium" ? "0.312 ms" : "285.45 ms"
      const nodes = diff === "easy" ? "45 nodes" : diff === "medium" ? "609 nodes" : "496,790 nodes"
      setBotLog((prev) => [
        ...prev,
        `[Rust WASM Engine]: Tính toán hoàn tất: Độ trễ ${ms}, Đã duyệt ${nodes}`,
        `[botWorker]: Trả move { row: 7, col: 8 } về UI qua onmessage`,
        `[UI]: Quân O xuất hiện trên bàn cờ. Mở khóa lượt người chơi!`,
      ])
      setIsSimulatingBot(false)
      soundManager.playPiece("O")
    }, 1200)
  }

  return (
    <section id="pve-transition" className="py-24 px-4 bg-white max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0091ff]/10 border border-[#0091ff]/20 text-[#0091ff] text-xs font-bold uppercase tracking-wider mb-3">
          <Bot className="w-3.5 h-3.5" />
          <span>Chuyển Giao Kiến Trúc: Tuần 3 → Tuần 4</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
          Chuyển Đổi Từ UI Player-vs-Player Sang Player-vs-Bot
        </h2>
        <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
          Giải quyết bài toán then chốt: Chuyển từ đột biến trạng thái đồng bộ (PvP) sang kiến trúc đa luồng bất đồng bộ (Asynchronous Web Worker + Rust WebAssembly) giữ nguyên 60 FPS.
        </p>
      </div>

      {/* Comparison: PvP vs PvE Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* PvP Box */}
        <div className="clickup-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#f8f9fa] text-[#646464] border border-[#e8e8e8] text-xs font-mono font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Chế Độ Cũ: Player vs Player (PvP)</span>
              </span>
              <span className="text-xs text-[#838383] font-mono">Synchronous State</span>
            </div>
            <h3 className="text-lg font-bold text-[#202020] mb-2">Đột Biến Trạng Thái Đồng Bộ Thuần Túy</h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed mb-4">
              Ở chế độ 1v1 người chơi, mọi hành động chỉ diễn ra khi có click chuột từ con người. Việc kiểm tra thắng cuộc diễn ra tức thì (Local Raycasting O(1)), không làm nghẽn UI.
            </p>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-xs text-[#646464] space-y-1 mb-4">
              <div className="text-[#838383]">// Luồng xử lý PvP tuần tự:</div>
              <div className="text-[#202020]">User Click (P1) → useCaroGame.placeMove() → checkWin() → Đổi currentPlayer = "O"</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#f43f5e] shrink-0 mt-0.5" />
            <span><strong>Giới hạn:</strong> Không thể tái sử dụng trực tiếp luồng đồng bộ này khi thêm Bot vì các thuật toán AI duyệt cây cờ sẽ chặn đứng Main UI Thread nếu không chạy đa luồng.</span>
          </div>
        </div>

        {/* PvE Box */}
        <div className="clickup-card p-6 flex flex-col justify-between border-[#0091ff]/30">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#0091ff]/10 text-[#0091ff] border border-[#0091ff]/20 text-xs font-mono font-bold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>Chế Độ Mới: Player vs Bot (PvE)</span>
              </span>
              <span className="text-xs text-[#0091ff] font-mono">WebAssembly Worker</span>
            </div>
            <h3 className="text-lg font-bold text-[#202020] mb-2">Kiến Trúc Bất Đồng Bộ WebAssembly Web Worker</h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed mb-4">
              Đẩy toàn bộ tác vụ tìm kiếm thế cờ sang luồng chạy ngầm riêng biệt (<code className="text-[#0091ff] font-mono">botWorker.ts</code>) chạy mã máy Rust WebAssembly (<code className="text-[#0091ff] font-mono">.wasm</code>), duy trì ổn định 60 FPS trên giao diện người dùng.
            </p>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-xs text-[#0091ff] space-y-1 mb-4">
              <div className="text-[#838383]">// Luồng xử lý PvE bất đồng bộ:</div>
              <div className="text-[#202020]">User Click → useCaroGame → useEffect phát hiện Bot Turn → wasmBot.requestMove()</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs flex items-start gap-2">
            <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
            <span><strong>Thành tựu:</strong> UI hoàn toàn mượt mà, không drop frame, tự động hủy bỏ nước đi tồn đọng nếu người chơi bấm "Ván Mới" (Cancellation Token).</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Console */}
      <div className="clickup-card p-6 bg-[#f8f9fa] border border-[#d4d4d4]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#090c1d]">
              <Terminal className="w-4 h-4 text-[#0091ff]" />
              <span>Mô Phỏng Trực Tiếp Giao Tiếp Web Worker</span>
            </div>
            <p className="text-xs text-[#646464]">Gửi yêu cầu tính toán sang Worker và quan sát thời gian phản hồi theo cấp độ</p>
          </div>

          <div className="flex items-center gap-2">
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                disabled={isSimulatingBot}
                onClick={() => triggerBotSimulation(diff)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold capitalize transition-all ${
                  selectedDiff === diff
                    ? "bg-[#202020] text-white shadow-sm"
                    : "bg-white text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                }`}
              >
                {diff === "easy" ? "Dễ (d=1)" : diff === "medium" ? "Vừa (d=2)" : "Khó (d=4)"}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="p-4 rounded-xl bg-white text-[#202020] border border-[#e8e8e8] font-mono text-xs space-y-1 min-h-[140px] max-h-[220px] overflow-y-auto shadow-inner">
          {botLog.length === 0 ? (
            <div className="text-[#838383] italic">
              Nhấp vào một trong các cấp độ khó phía trên để kích hoạt mô phỏng chu trình Web Worker...
            </div>
          ) : (
            botLog.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#838383] select-none">[{idx + 1}]</span>
                <span className={log.includes("Rust") ? "text-[#00c07a] font-bold" : log.includes("Worker") ? "text-[#0091ff]" : "text-[#202020]"}>
                  {log}
                </span>
              </div>
            ))
          )}
          {isSimulatingBot && (
            <div className="flex items-center gap-2 text-[#0091ff] pt-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#0091ff]" />
              <span>WebAssembly Worker đang giải thuật toán đối kháng ngầm...</span>
            </div>
          )}
        </div>
      </div>

      {/* Chapter 3 Architectural Blueprints: Figures 3.1, 3.2, 3.3 */}
      <div className="mt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0091ff] mb-1">
              Chương 3 (Phân Tích & Thiết Kế Hệ Thống)
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight">
              3 Trụ Cột Kiến Trúc: Phân Lớp, Vòng Đời Trạng Thái & Biến Đổi Tọa Độ
            </h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold shrink-0 self-start sm:self-auto">
            Figures 3.1 – 3.3 Specs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Figure 3.1 Card */}
          <div 
            onClick={() => onOpenFigure("ui_architecture_flow")}
            className="clickable-figure clickup-card p-5 bg-white border border-[#e8e8e8] hover:border-[#6647f0] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8] font-mono text-[#838383]">
                <span className="font-bold text-[#6647f0]">HÌNH 3.1</span>
                <span className="text-[#0091ff] font-bold">Inspect ↗</span>
              </div>
              <h4 className="font-bold text-[#202020] text-sm mt-3 mb-1.5 group-hover:text-[#6647f0] transition-colors">
                Kiến Trúc Phân Lớp Ứng Dụng (Layered Architecture)
              </h4>
              <p className="text-[#646464] leading-relaxed">
                Tách biệt 4 tầng trách nhiệm: Giao diện người dùng (React/PixiJS) ↔ Điều phối trận đấu (GameController) ↔ Cầu nối đa luồng (AIController/Web Worker) ↔ Lõi tính toán Rust WASM.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#e8e8e8] text-[11px] font-mono text-[#838383]">
              Bảo đảm 0ms block UI, độc lập hoàn toàn giữa logic và render
            </div>
          </div>

          {/* Figure 3.2 Card */}
          <div 
            onClick={() => onOpenFigure("component_hierarchy")}
            className="clickable-figure clickup-card p-5 bg-white border border-[#e8e8e8] hover:border-[#0091ff] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8] font-mono text-[#838383]">
                <span className="font-bold text-[#0091ff]">HÌNH 3.2</span>
                <span className="text-[#0091ff] font-bold">Inspect ↗</span>
              </div>
              <h4 className="font-bold text-[#202020] text-sm mt-3 mb-1.5 group-hover:text-[#0091ff] transition-colors">
                Mô Hình Trạng Thái Trận Đấu (Match State Lifecycle)
              </h4>
              <p className="text-[#646464] leading-relaxed">
                Chu trình 3 pha: <code>Waiting</code> → <code>Active</code> ↔ <code>AI Thinking (isAiThinking = true)</code> → <code>Ended</code>. Cờ AI Thinking độc lập khóa toàn bộ tương tác người chơi khi Bot đang giải thuật toán.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#e8e8e8] text-[11px] font-mono text-[#838383]">
              Ngăn chặn tuyệt đối xung đột tranh chấp lượt (Race Condition)
            </div>
          </div>

          {/* Figure 3.3 Card */}
          <div 
            onClick={() => onOpenFigure("ai_pipeline")}
            className="clickable-figure clickup-card p-5 bg-white border border-[#e8e8e8] hover:border-[#00c07a] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8] font-mono text-[#838383]">
                <span className="font-bold text-[#00c07a]">HÌNH 3.3</span>
                <span className="text-[#0091ff] font-bold">Inspect ↗</span>
              </div>
              <h4 className="font-bold text-[#202020] text-sm mt-3 mb-1.5 group-hover:text-[#00c07a] transition-colors">
                Biến Đổi Ma Trận Nghịch Đảo Camera (M⁻¹)
              </h4>
              <p className="text-[#646464] leading-relaxed">
                <MathText text="Ánh xạ điểm chạm màn hình sang tọa độ thế giới và ô cờ: $(X_s, Y_s) \to (X_w, Y_w) \to (\lfloor X_w/\text{cell}\rfloor, \lfloor Y_w/\text{cell}\rfloor)$ qua ma trận nghịch đảo $M^{-1}$ trước khi kiểm tra cận $[0..14]$." />
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#e8e8e8] text-[11px] font-mono text-[#838383]">
              Bảo đảm độ chính xác 100% khi zoom, pan, xoay màn hình di động
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
