import React, { useState } from "react"
import { GitFork, Network, Play, Sparkles, AlertCircle, ShieldCheck, HelpCircle, Layers, Cpu, ArrowRight } from "lucide-react"
import { Latex, MathText } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure?: (id: string) => void
}

export const Week5Minimax: React.FC<Props> = () => {
  const [depth, setDepth] = useState<number>(3)
  const [branchingFactor, setBranchingFactor] = useState<number>(15)

  // Theoretical node explosion calculation N = b^d
  const totalNodes = Math.pow(branchingFactor, depth)
  const theoreticalUnprunedNodes = Math.pow(45, depth) // 45 is average candidates without sorting
  const estimatedTimeMs = (totalNodes * 0.00057).toFixed(2) // ~0.57 µs per evaluation in Rust

  return (
    <section id="week5" className="py-24 px-4 bg-white border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6647f0]/10 border border-[#6647f0]/20 text-[#6647f0] text-xs font-bold uppercase tracking-wider mb-3">
            <GitFork className="w-3.5 h-3.5" />
            <span>Nghiên Cứu & Triển Khai Tuần 5 — Phase 4</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Thuật Toán Minimax & Cây Trò Chơi (Game Tree Search)
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            <MathText text="Hiện thực hóa mô hình đối kháng hoàn hảo (Zero-Sum, Perfect Information) trên bàn cờ Caro. Phân tích toán học cây trò chơi, bùng nổ không gian trạng thái $N \\approx b^d$, và giải pháp giới hạn độ sâu (Depth-Limited Search)." />
          </p>
        </div>

        {/* 2-Column Theoretical Framework */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Mathematical Formulation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="clickup-card p-6 bg-[#f8f9fa] border border-[#e8e8e8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                  Mô Hình Toán Học Minimax Đệ Quy
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-[#d4d4d4] text-[#202020] font-bold">
                  Zero-Sum Game Theory
                </span>
              </div>

              <p className="text-xs text-[#646464] leading-relaxed">
                <MathText text="Tại mỗi nút trạng thái $s$, thuật toán giả định hai người chơi duy lý tuyệt đối: người chơi AI (MAX) chọn nước đi cực đại hóa điểm số, trong khi đối thủ (MIN) chọn nước đi cực tiểu hóa điểm số của AI:" />
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] text-center my-3 text-[#202020] overflow-x-auto">
                <Latex display>{`V(s) = \\begin{cases} f(s) & \\text{nếu } \\text{IsTerminal}(s) \\lor \\text{depth} = 0 \\\\[6pt] \\max_{a \\in A(s)} V(s') & \\text{nếu lượt MAX (AI)} \\\\[6pt] \\min_{a \\in A(s)} V(s') & \\text{nếu lượt MIN (Đối thủ)} \\end{cases}`}</Latex>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#e8e8e8]">
                  <div className="font-bold text-[#202020] mb-1">Bất Biến Điểm Tận Cùng (Terminal):</div>
                  <p className="text-[#646464] text-[11px] leading-relaxed">
                    <MathText text="Nếu phát hiện nước thắng ngay qua kiểm tra tia $O(1)$, hàm trả về giá trị chiến thắng tuyệt đối $10^7$ mà không cần duyệt sâu thêm." />
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#e8e8e8]">
                  <div className="font-bold text-[#202020] mb-1"><MathText text="Độ Phức Tạp Không Gian $O(d)$:" /></div>
                  <p className="text-[#646464] text-[11px] leading-relaxed">
                    Duyệt theo chiều sâu (DFS) với cơ chế Backtracking `undo(x, y)` đảm bảo chỉ cần lưu một mảng bàn cờ duy nhất trên Call Stack.
                  </p>
                </div>
              </div>
            </div>

            {/* Code Snippet from Rust Engine */}
            <div className="clickup-card p-5 bg-white border border-[#e8e8e8] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#e8e8e8]">
                <span className="font-bold text-[#202020]">caro-core-reference/src/search/minimax.rs</span>
                <span className="text-[#0091ff] font-bold">Rust LLVM (-O3)</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-[11px] text-[#202020] overflow-x-auto leading-relaxed">
{`fn minimax(board: &mut Board, depth: usize, is_max: bool, player: Cell) -> i32 {
    if depth == 0 || board.is_terminal() {
        return evaluate(board, player);
    }
    let candidates = board.get_candidates(2);
    if is_max {
        let mut max_eval = i32::MIN;
        for &(x, y) in &candidates {
            board.place(x, y, player).unwrap();
            let eval = minimax(board, depth - 1, false, player);
            board.undo(x, y); // Zero-allocation backtracking
            max_eval = max_eval.max(eval);
        }
        max_eval
    } else {
        let mut min_eval = i32::MAX;
        for &(x, y) in &candidates {
            board.place(x, y, player.opponent()).unwrap();
            let eval = minimax(board, depth - 1, true, player);
            board.undo(x, y);
            min_eval = min_eval.min(eval);
        }
        min_eval
    }
}`}
              </pre>
            </div>
          </div>

          {/* Right: Interactive Combinatorial Explosion Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="clickup-card p-6 bg-[#f8f9fa] border border-[#d4d4d4] space-y-5">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-[#6647f0]" />
                <h3 className="text-sm font-extrabold text-[#090c1d] uppercase tracking-wider font-mono">
                  Mô Phỏng Bùng Nổ Tổ Hợp Cây Trò Chơi
                </h3>
              </div>

              <p className="text-xs text-[#646464] leading-relaxed">
                <MathText text="Kéo thanh trượt để quan sát số lượng node duyệt tăng theo cấp số nhân $b^d$ và sự cần thiết của việc giới hạn độ sâu kết hợp lọc ứng viên:" />
              </p>

              {/* Slider 1: Depth d */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#838383]">Độ Sâu Tìm Kiếm (d):</span>
                  <span className="font-bold text-[#6647f0]">{depth} Tầng ({depth % 2 === 0 ? "Lượt MIN" : "Lượt MAX"})</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={depth}
                  onChange={(e) => {
                    soundManager.playClick()
                    setDepth(Number(e.target.value))
                  }}
                  className="w-full accent-[#6647f0] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#838383]">
                  <span>d = 1</span>
                  <span>d = 2</span>
                  <span>d = 3</span>
                  <span>d = 4</span>
                </div>
              </div>

              {/* Slider 2: Branching Factor b */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#838383]">Hệ Số Rẽ Nhánh Giới Hạn (b):</span>
                  <span className="font-bold text-[#0091ff]">{branchingFactor} Ứng viên / Nút</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="5"
                  value={branchingFactor}
                  onChange={(e) => {
                    soundManager.playClick()
                    setBranchingFactor(Number(e.target.value))
                  }}
                  className="w-full accent-[#0091ff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#838383]">
                  <span>5 (Cực đoan)</span>
                  <span>15 (Cân bằng)</span>
                  <span>45 (Toàn bộ lân cận)</span>
                </div>
              </div>

              {/* Live Metric Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] text-center">
                  <div className="text-[10px] font-mono text-[#838383] uppercase font-bold">Số Node Sinh Ra (b^d)</div>
                  <div className="text-lg font-black text-[#202020] mt-1 font-mono">
                    {totalNodes.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#00c07a] font-mono font-bold mt-0.5">
                    Đã giới hạn b={branchingFactor}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] text-center">
                  <div className="text-[10px] font-mono text-[#838383] uppercase font-bold">Nếu Không Cắt Giảm (45^d)</div>
                  <div className="text-lg font-black text-[#f43f5e] mt-1 font-mono">
                    {theoreticalUnprunedNodes > 1e7 ? `${(theoreticalUnprunedNodes / 1e6).toFixed(1)}M` : theoreticalUnprunedNodes.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#f43f5e] font-mono font-bold mt-0.5">
                    Gây đơ trình duyệt!
                  </div>
                </div>
              </div>

              {/* Time Estimate */}
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#be123c] space-y-1 font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Thời Gian Ước Tính: ~{estimatedTimeMs} ms</span>
                </div>
                <p className="text-[11px] text-[#9f1239] leading-relaxed">
                  <MathText text="Ở độ sâu $d=4$, nếu không có cắt tỉa Alpha-Beta, số node cần duyệt lên đến 4,100,625 nodes (mất hơn 4.1 triệu phép tính). Đây chính là động lực bắt buộc phải chuyển giao sang Tuần 6 (Alpha-Beta Pruning)." />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Academic Pillars of Week 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#6647f0]/10 text-[#6647f0] font-bold font-mono text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="font-extrabold text-[#202020] text-sm">Xây Dựng Khung Game Tree</h4>
            <p className="text-xs text-[#646464] leading-relaxed">
              Tổ chức mô hình cây phân cấp hoàn chỉnh từ nút gốc (Current State), các nút trung gian luân phiên người chơi, đến các nút lá (Leaf/Evaluation Nodes).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#0091ff]/10 text-[#0091ff] font-bold font-mono text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="font-extrabold text-[#202020] text-sm">Giới Hạn Độ Sâu (Depth-Limited)</h4>
            <p className="text-xs text-[#646464] leading-relaxed">
              Giải quyết bài toán bùng nổ tổ hợp bằng việc chặn độ sâu <span className="font-mono font-bold">d_max ∈ [1, 4]</span>, kích hoạt hàm Heuristic tĩnh <span className="font-mono font-bold">f(s)</span> tại đáy cây để thay thế nút kết thúc ván.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#00c07a]/10 text-[#00c07a] font-bold font-mono text-xs flex items-center justify-center">
              03
            </div>
            <h4 className="font-extrabold text-[#202020] text-sm">Kiểm Thử & Đánh Giá Giới Hạn</h4>
            <p className="text-xs text-[#646464] leading-relaxed">
              <MathText text="Chứng minh Minimax thuần túy chạy trên TypeScript Main Thread bị đơ màn hình ở $d \\ge 3$ (>150ms), đặt cơ sở khoa học chuyển đổi sang Alpha-Beta và Rust Wasm." />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
