import React, { useState } from "react"
import { Database, Zap, ShieldCheck, CheckCircle2, ArrowRight, Layers, Table, RefreshCw, Cpu, Crosshair } from "lucide-react"
import { Latex, MathText } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure: (id: string) => void
}

export const BoardRepresentationAndWinCheck: React.FC<Props> = ({ onOpenFigure }) => {
  const [testCol, setTestCol] = useState<number>(7)
  const [testRow, setTestRow] = useState<number>(7)

  // 1D index calculation: i = 15y + x
  const flatIndex = 15 * testRow + testCol

  return (
    <section id="board-representation" className="py-24 px-4 bg-[#f8f9fa] border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6647f0]/10 border border-[#6647f0]/20 text-[#6647f0] text-xs font-bold uppercase tracking-wider mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>Thuật Toán Nền Tảng: Biểu Diễn Trạng Thái & Bất Biến</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Biểu Diễn Bàn Cờ, Apply/Undo in-place & Quét Thắng $O(1)$
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            <MathText text="Để tìm kiếm hàng triệu nút mỗi giây, động cơ không thể sao chép mảng $O(N^2)$. Phân tích cấu trúc bộ nhớ phẳng 240-byte, cơ chế $O(1)$ in-place Apply/Undo và thuật toán quét thắng 4 trục hướng tối đa 32 phép đọc ô." />
          </p>
        </div>

        {/* 2-Column Algorithmic Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Apply & Undo O(1) in-place */}
          <div className="lg:col-span-6 space-y-6">
            <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Bất Biến Apply & Undo $O(1)$
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold">
                  Zero Heap Allocation
                </span>
              </div>

              <p className="text-xs text-[#646464] leading-relaxed">
                <MathText text="Bàn cờ được tổ chức bằng mảng phẳng 225 phần tử `[[Cell; 15]; 15]` với `repr(u8)`, chiếm đúng 240 bytes trong bộ nhớ. Mỗi lần thử nước đi, thuật toán không tạo bản sao bàn cờ (clone) mà đột biến trực tiếp tại ô cờ rồi hoàn tác:" />
              </p>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center my-3 text-[#202020] overflow-x-auto">
                <Latex display>{`\\forall m=(x,y,p): \\quad \\mathcal{B}' = \\text{place}(\\mathcal{B}, m) \\implies \\mathcal{B} = \\text{undo}(\\mathcal{B}', m)`}</Latex>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3]">
                  <div className="font-bold text-[#9f1239] mb-1">Cách Làm Ngây Thơ (Clone):</div>
                  <div className="text-[11px] text-[#881337] space-y-1">
                    <div>• Sao chép toàn bộ mảng $15 \\times 15$</div>
                    <div>• Tốn thời gian $O(N^2) = 225$ bước</div>
                    <div>• Gây tràn Garbage Collector (GC)</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                  <div className="font-bold text-[#166534] mb-1">Động Cơ Rust (In-place):</div>
                  <div className="text-[11px] text-[#14532d] space-y-1">
                    <div>• Đổi 1 byte duy nhất tại $(x, y)$</div>
                    <div>• Độ phức tạp đúng $O(1)$ thời gian</div>
                    <div>• $0$ byte bộ nhớ phụ cấp phát</div>
                  </div>
                </div>
              </div>

              {/* Clickable Figure Card: Apply & Undo */}
              <div
                onClick={() => onOpenFigure("apply_undo")}
                className="clickable-figure p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] hover:border-[#6647f0] transition-all cursor-pointer group flex items-center justify-between gap-3 mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center shrink-0">
                    <img src="/assets/apply-undo.png" alt="Apply Undo" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202020] group-hover:text-[#6647f0] transition-colors">
                      Hình 2.2: Sơ đồ chu trình Apply & Undo in-place
                    </div>
                    <div className="text-[11px] text-[#838383] font-mono">Bất biến phục hồi trạng thái sau cắt tỉa</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#838383] group-hover:text-[#6647f0] group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Interactive Index Calculator */}
            <div className="clickup-card p-5 bg-white border border-[#e8e8e8] space-y-3">
              <div className="text-xs font-mono font-bold text-[#202020] uppercase tracking-wider flex items-center justify-between">
                <span>Chuyển Đổi Tọa Độ Hai Chiều $\\leftrightarrow$ Chỉ Số Phẳng</span>
                <span className="text-[#6647f0] font-bold">$i = 15y + x$</span>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="text-[11px] font-mono text-[#838383] block mb-1">Cột $x$ [0..14]: {testCol}</label>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    value={testCol}
                    onChange={(e) => setTestCol(parseInt(e.target.value))}
                    className="w-full accent-[#6647f0]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#838383] block mb-1">Hàng $y$ [0..14]: {testRow}</label>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    value={testRow}
                    onChange={(e) => setTestRow(parseInt(e.target.value))}
                    className="w-full accent-[#6647f0]"
                  />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-xs font-mono flex items-center justify-between text-[#202020]">
                <span>Tọa độ: ({testCol}, {testRow})</span>
                <span className="font-bold text-[#6647f0]">Chỉ số phẳng: 15 × {testRow} + {testCol} = {flatIndex}</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4-Axis Raycasting Win Checking O(1) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                <span className="text-xs font-mono font-bold text-[#00c07a] uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  Thuật Toán Quét Thắng 4 Trục Hướng $O(1)$
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold">
                  Tối Đa 32 Phép Đọc
                </span>
              </div>

              <p className="text-xs text-[#646464] leading-relaxed">
                <MathText text="Trong luật Freestyle Gomoku, thắng khi đạt $\\ge 5$ quân liên tiếp. Thay vì quét toàn bộ bàn cờ $O(N^2)$, thuật toán raycast tối đa 4 bước về 2 phía quanh nước cờ vừa đặt $m$ trên 4 trục:" />
              </p>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center my-3 text-[#202020] overflow-x-auto">
                <Latex display>{`L_d = 1 + f_d(m) + b_d(m) \\ge 5, \\quad \\forall d \\in \\{(1,0), (0,1), (1,1), (1,-1)\\}`}</Latex>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8]">
                  <span className="font-mono font-bold text-[#00c07a] shrink-0">1. Ngang (1, 0):</span>
                  <span className="text-[#646464]">Quét sang trái tối đa 4 ô, sang phải tối đa 4 ô.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8]">
                  <span className="font-mono font-bold text-[#00c07a] shrink-0">2. Dọc (0, 1):</span>
                  <span className="text-[#646464]">Quét lên trên tối đa 4 ô, xuống dưới tối đa 4 ô.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8]">
                  <span className="font-mono font-bold text-[#00c07a] shrink-0">3. Chéo Chính (1, 1):</span>
                  <span className="text-[#646464]">Quét theo đường chéo từ góc tây bắc xuống đông nam.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8]">
                  <span className="font-mono font-bold text-[#00c07a] shrink-0">4. Chéo Phụ (1, -1):</span>
                  <span className="text-[#646464]">Quét theo đường chéo từ góc tây nam lên đông bắc.</span>
                </div>
              </div>

              {/* Clickable Figure Card: Win Axes */}
              <div
                onClick={() => onOpenFigure("win_axes")}
                className="clickable-figure p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] hover:border-[#00c07a] transition-all cursor-pointer group flex items-center justify-between gap-3 mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center shrink-0">
                    <img src="/assets/win-axes.png" alt="Win Axes" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202020] group-hover:text-[#00c07a] transition-colors">
                      Hình 2.3: Bốn trục quét thắng quanh nước cờ cuối
                    </div>
                    <div className="text-[11px] text-[#838383] font-mono">Cận trên: 4 trục × 2 phía × 4 bước = 32 lần đọc</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#838383] group-hover:text-[#00c07a] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
