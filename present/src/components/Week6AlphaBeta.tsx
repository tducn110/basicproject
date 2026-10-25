import React, { useState } from "react"
import { Scissors, Zap, ShieldCheck, Database, BarChart3, CheckCircle2, ArrowRight, Layers, Table, RefreshCw } from "lucide-react"
import { Latex, MathText } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure?: (id: string) => void
}

export const Week6AlphaBeta: React.FC<Props> = ({ onOpenFigure }) => {
  const [selectedDepth, setSelectedDepth] = useState<number>(4)
  const [useOrdering, setUseOrdering] = useState<boolean>(true)

  // Real empirical data from benchmark_data.json
  const benchmarkData = [
    { depth: 1, nodes: 45, cutoffs: 0, rustTime: "0.022 ms", tsTime: "0.538 ms", knps: "2,040 k", speedup: "14.4x", score: 99990 },
    { depth: 2, nodes: 609, cutoffs: 39, rustTime: "0.312 ms", tsTime: "5.580 ms", knps: "1,949 k", speedup: "16.1x", score: 19990 },
    { depth: 3, nodes: 16184, cutoffs: 454, rustTime: "9.025 ms", tsTime: "156.78 ms", knps: "1,793 k", speedup: "17.3x", score: 9999997 },
    { depth: 4, nodes: 496790, cutoffs: 16350, rustTime: "285.45 ms", tsTime: "5,083.45 ms", knps: "1,740 k", speedup: "17.8x", score: 9999997 },
  ]

  const activeRow = benchmarkData[selectedDepth - 1]

  return (
    <section id="week6" className="py-24 px-4 bg-[#f8f9fa] border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00c07a]/10 border border-[#00c07a]/20 text-[#00c07a] text-xs font-bold uppercase tracking-wider mb-3">
            <Scissors className="w-3.5 h-3.5" />
            <span>Nghiên Cứu & Thực Nghiệm Tuần 6 — Phase 5</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Tối Ưu Hóa Cắt Tỉa Alpha-Beta, Move Ordering & Zobrist
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            <MathText text="Áp dụng thuật toán Alpha-Beta Pruning triệt tiêu các nhánh vô nghĩa ($\\beta \\le \\alpha$). Kết hợp sắp xếp nước đi $O(1)$ (Move Ordering) và bảng chuyển vị Zobrist Hashing 64-bit, đạt 16,350 lần cắt nhánh ở độ sâu $d=4$." />
          </p>
        </div>

        {/* 2-Column Math & Algorithm Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Pruning Formula & Move Ordering */}
          <div className="lg:col-span-7 space-y-6">
            <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                <span className="text-xs font-mono font-bold text-[#00c07a] uppercase tracking-wider">
                  <MathText text="Nguyên Lý Bất Đẳng Thức Cắt Nhánh ($\\alpha$-$\\beta$ Cutoffs)" />
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold">
                  <MathText text="Asymptotic: $O(b^{d/2})$" />
                </span>
              </div>

              <p className="text-xs text-[#646464] leading-relaxed">
                <MathText text="Biên dưới $\\alpha$ đại diện cho điểm số tối thiểu MAX được đảm bảo; biên trên $\\beta$ đại diện cho điểm số tối đa MIN có thể ép xuống. Ngay khi một nhánh con có giá trị làm $\\beta \\le \\alpha$, nhánh đó lập tức bị cắt tỉa mà không làm thay đổi giá trị tối ưu:" />
              </p>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center my-3 text-[#202020] overflow-x-auto">
                <Latex display>{`\\begin{aligned} \\text{MAX Node:} & \\quad \\alpha = \\max(\\alpha, \\text{score}) \\\\ \\text{MIN Node:} & \\quad \\beta = \\min(\\beta, \\text{score}) \\\\ \\text{Cutoff Condition:} & \\quad \\text{if } \\beta \\le \\alpha \\implies \\mathbf{break} \\quad (\\text{Triệt tiêu nhánh}) \\end{aligned}`}</Latex>
              </div>

              {/* Move Ordering Explanation */}
              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] space-y-2 text-xs">
                <div className="font-bold text-[#202020] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#eab308]" />
                  <span><MathText text="Sắp Xếp Nước Đi (Move Ordering via $O(1)$ quick_score):" /></span>
                </div>
                <p className="text-[#646464] leading-relaxed">
                  <MathText text="Hiệu quả của Alpha-Beta phụ thuộc hoàn toàn vào thứ tự duyệt các nước đi con. Trước khi đệ quy, hàm `quick_score` quét 4 trục bàn cờ trong $O(1)$ để xếp các nước đi tạo thế mạnh lên đầu mảng. Nước đi tốt nhất được duyệt trước giúp $\\alpha$ tăng vọt và $\\beta$ giảm mạnh, kích hoạt cắt tỉa hàng chục nghìn nhánh thừa." />
                </p>
              </div>

              {/* Zobrist Hashing Details */}
              <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-2 text-xs text-[#166534]">
                <div className="font-bold flex items-center gap-1.5 text-[#14532d]">
                  <Database className="w-4 h-4 text-[#00c07a]" />
                  <span>Bảng Chuyển Vị Zobrist Hashing 64-bit (Transposition Table):</span>
                </div>
                <p className="leading-relaxed">
                  <MathText text="Bàn cờ $15 \\times 15$ khởi tạo mảng ngẫu nhiên `ZOBRIST_TABLE[225][2]: u64`. Khi một quân cờ được đặt hoặc rút lại, mã băm cập nhật qua phép toán bit XOR cực nhanh $O(1)$:" />
                </p>
                <div className="py-1 px-2.5 rounded bg-white/80 border border-[#bbf7d0] font-mono text-[11px] text-center font-bold">
                  hash = hash ^ ZOBRIST_TABLE[cell_idx][player_idx]
                </div>
                <p className="text-[11px] leading-relaxed">
                  Giúp nhận diện ngay các thế cờ hoán vị (Transposition) đã được đánh giá ở nhánh khác, tránh tính toán lặp lại.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Interactive Depth Inspector & Benchmark Data Table */}
          <div className="lg:col-span-5 space-y-6">
            <div className="clickup-card p-6 bg-white border border-[#d4d4d4] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00c07a]" />
                  <h3 className="text-sm font-extrabold text-[#090c1d] uppercase tracking-wider font-mono">
                    Số Liệu Đối Chiếu Định Lượng
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00c07a]/10 text-[#00c07a]">
                  EXP-W4-A01 Verified
                </span>
              </div>

              {/* Depth Selector Pills */}
              <div className="flex items-center justify-between p-1 rounded-full bg-[#f8f9fa] border border-[#e8e8e8]">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      soundManager.playClick()
                      setSelectedDepth(d)
                    }}
                    className={`flex-1 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                      selectedDepth === d
                        ? "bg-[#202020] text-white shadow-xs"
                        : "text-[#646464] hover:text-[#202020]"
                    }`}
                  >
                    Độ Sâu d={d}
                  </button>
                ))}
              </div>

              {/* Selected Depth Metric Breakdown */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
                    <div className="text-[10px] font-mono text-[#838383] uppercase font-bold">Số Lượng Node Duyệt</div>
                    <div className="text-xl font-black text-[#202020] mt-1 font-mono">
                      {activeRow.nodes.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#0091ff] font-mono mt-0.5 font-bold">
                      Thông lượng: {activeRow.knps}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-center">
                    <div className="text-[10px] font-mono text-[#15803d] uppercase font-bold">Số Lần Cắt Nhánh (Cutoffs)</div>
                    <div className="text-xl font-black text-[#00c07a] mt-1 font-mono">
                      {activeRow.cutoffs.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#15803d] font-mono mt-0.5 font-bold">
                      {activeRow.cutoffs > 0 ? "Tiết kiệm hàng chục nghìn node!" : "d=1 không cắt"}
                    </div>
                  </div>
                </div>

                {/* Rust vs TS Timing Comparison */}
                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#838383]">Thời Gian Rust (Wasm):</span>
                    <span className="font-extrabold text-[#00c07a] text-sm">{activeRow.rustTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#838383]">Thời Gian TypeScript (V8):</span>
                    <span className="font-bold text-[#f43f5e]">{activeRow.tsTime}</span>
                  </div>
                  <div className="pt-2 border-t border-[#e8e8e8] flex justify-between items-center text-xs font-mono">
                    <span className="text-[#202020] font-bold">Hệ Số Tăng Tốc (Speedup):</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#00c07a]/10 text-[#00c07a] font-black text-xs">
                      {activeRow.speedup} Vượt Trội
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Benchmark Citation */}
              <div className="p-3 rounded-xl bg-[#e9ebf0] border border-[#d4d4d4] text-[11px] text-[#646464] flex items-center justify-between">
                <span>Dữ liệu gốc: <code>benchmark_data.json</code></span>
                {onOpenFigure && (
                  <button
                    onClick={() => onOpenFigure("rust_vs_ts_speedup")}
                    className="font-mono text-[#0091ff] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem Biểu Đồ 300 DPI →</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Comparative Data Table */}
        <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8e8]">
            <div>
              <h3 className="text-sm font-extrabold text-[#202020]">
                Bảng Thống Kê Tổng Hợp Thực Nghiệm Alpha-Beta (Midgame Fixture — 8 Quân Cờ)
              </h3>
              <p className="text-xs text-[#838383]">
                Xác nhận tính tương đương ngữ nghĩa tuyệt đối 100% (Zero Semantic Divergence) giữa Rust và TypeScript
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00c07a]/10 text-[#00c07a] text-xs font-mono font-bold shrink-0">
              Score đồng nhất = 9,999,997
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#e8e8e8] text-[#838383] bg-[#f8f9fa]">
                  <th className="py-2.5 px-3">Độ Sâu (d)</th>
                  <th className="py-2.5 px-3">Số Node Duyệt (N)</th>
                  <th className="py-2.5 px-3">Số Lần Cắt Tỉa</th>
                  <th className="py-2.5 px-3 text-[#00c07a]">Thời Gian Rust</th>
                  <th className="py-2.5 px-3 text-[#f43f5e]">Thời Gian TypeScript</th>
                  <th className="py-2.5 px-3">Thông Lượng Rust</th>
                  <th className="py-2.5 px-3 text-right">Tăng Tốc (Speedup)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e8]">
                {benchmarkData.map((row) => (
                  <tr key={row.depth} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#202020]">d = {row.depth}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.nodes.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-[#00c07a]">{row.cutoffs.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-[#00c07a]">{row.rustTime}</td>
                    <td className="py-3 px-3 text-[#f43f5e]">{row.tsTime}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.knps}/s</td>
                    <td className="py-3 px-3 text-right font-black text-[#00c07a]">{row.speedup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
