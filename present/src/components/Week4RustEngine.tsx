import React, { useState } from "react"
import { BarChart3, ShieldCheck, Zap, Scissors, Eye, Check } from "lucide-react"
import { Latex } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure: (id: string) => void
}

export const Week4RustEngine: React.FC<Props> = ({ onOpenFigure }) => {
  const [activeSubTab, setActiveSubTab] = useState<"patterns" | "heuristic" | "chebyshev" | "battle">("patterns")

  const patternData = [
    { name: "Five-in-a-row", shape: ".XXXXX.", atk: "10,000,000", def: "9,999,999", desc: "5 quân liên tiếp, thắng cuộc tuyệt đối (Mate)" },
    { name: "Open Four", shape: ".XXXX.", atk: "100,000", def: "120,000", desc: "4 quân mở 2 đầu, đối thủ không thể chặn cả 2" },
    { name: "Closed Four", shape: "OXXXX.", atk: "10,000", def: "12,000", desc: "4 quân bị chặn 1 đầu, đe dọa trực tiếp (Sente)" },
    { name: "Open Three", shape: ".XXX.", atk: "5,000", def: "6,000", desc: "3 quân mở 2 đầu, bước đệm tạo thành Open Four" },
    { name: "Closed Three", shape: "OXXX.", atk: "1,000", def: "1,200", desc: "3 quân bị chặn 1 đầu, tiềm năng phối hợp" },
    { name: "Open Two", shape: ".XX.", atk: "500", def: "600", desc: "2 quân mở 2 đầu, giai đoạn khai cuộc" },
    { name: "Closed Two", shape: "OXX.", atk: "100", def: "120", desc: "2 quân bị chặn 1 đầu, giá trị chiến thuật nhỏ" },
  ]

  return (
    <section id="week4" className="py-24 px-4 bg-[#e9ebf0] border-y border-[#d4d4d4]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#d4d4d4] text-[#00c07a] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Báo Cáo Trọng Tâm: Tuần 4</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Nhận Diện Hình Thế & Động Cơ Đối Kháng Rust
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Hiện thực hóa cấp độ AI đối kháng đầu tiên (Rule-Based Bot) bằng ngôn ngữ Rust: Chuẩn hóa 7 thế cờ Caro kinh điển, hàm lượng giá Heuristic lũy thừa và kỹ thuật cắt giảm 72.4% không gian trạng thái.
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "patterns", label: "7 Mẫu Hình Thế Caro", icon: Eye },
            { id: "heuristic", label: "Hàm Lượng Giá & Mate Dominance", icon: Zap },
            { id: "chebyshev", label: "Cắt Giảm Chebyshev (r ≤ 2)", icon: Scissors },
            { id: "battle", label: "Đối Đầu 100 Ván & Benchmark", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick()
                  setActiveSubTab(tab.id as typeof activeSubTab)
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#202020] text-white shadow-md scale-105"
                    : "bg-white text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#6ee7b7]" : "text-[#838383]"}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* SubTab 1: 7 Patterns */}
        {activeSubTab === "patterns" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W4-1: Maximal Run Invariant & Taxonomy
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Phân Loại 7 Mẫu Hình Thế Caro Kinh Điển
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Bộ nhận diện hình thế quét trên 4 trục hướng (ngang, dọc, chéo chính, chéo phụ). Để tránh lỗi đếm trùng các đoạn con, giải thuật <strong className="text-[#202020]">Maximal Run Scanning</strong> bảo đảm chỉ trích xuất chuỗi cực đại duy nhất từ ô khởi đầu.
              </p>

              <div className="space-y-2 pt-1">
                {patternData.map((p, idx) => (
                  <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#e8e8e8] hover:border-[#d4d4d4] flex items-center justify-between shadow-xs transition-all">
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-bold text-[#202020] flex items-center gap-2 flex-wrap">
                        <span>{idx + 1}. {p.name}</span>
                        <code className="text-[10px] text-[#6647f0] bg-[#6647f0]/10 px-1.5 py-0.5 rounded font-mono font-bold">{p.shape}</code>
                      </div>
                      <div className="text-[11px] text-[#838383] truncate mt-0.5">{p.desc}</div>
                    </div>
                    <div className="text-right font-mono text-xs shrink-0">
                      <div className="text-[#00c07a] font-bold">Atk: {p.atk}</div>
                      <div className="text-[#0091ff] text-[10px]">Def: {p.def}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenFigure("pattern_taxonomy")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] hover:border-[#6647f0] transition-all group sticky top-20 shadow-xs"
                title="Chạm vào ảnh để xem chi tiết mã nguồn Rust & phân tích ưu/nhược điểm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 3: Phân Loại 7 Hình Thế</span>
                  <span className="text-[#6647f0] font-bold group-hover:translate-x-0.5 transition-transform">Chạm để soi mã ↗</span>
                </div>
                {/* Scrollable image viewport to contain the 1423px tall image cleanly */}
                <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] relative">
                  <div className="max-h-[460px] overflow-y-auto p-2 scrollbar-thin">
                    <img
                      src="/assets/pattern_taxonomy.png"
                      alt="Phân loại 7 hình thế Caro chuẩn"
                      className="w-full h-auto object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-white/95 backdrop-blur-xs border-t border-[#e8e8e8] text-[11px] font-mono text-[#6647f0] text-center font-bold flex items-center justify-center gap-1.5">
                    <span>↕ Cuộn xem đủ 7 bậc • Chạm để phóng to soi mã</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#646464]">
                  Zero Heap Allocation trên Rust Native. Đạt 100% tỷ lệ pass 7 test fixtures.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SubTab 2: Heuristic & Mate Dominance */}
        {activeSubTab === "heuristic" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W4-2: Mate Dominance & Weight Calibration
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Hàm Lượng Giá Tĩnh & Nguyên Lý Sát Cuộc
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Điểm lượng giá tĩnh của bàn cờ là tổng hiệu giữa sức tấn công của Bot và sức đe dọa của đối thủ, tích hợp hệ số ưu tiên phòng thủ (<Latex>{"1.1 \\sim 1.2\\times"}</Latex>):
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] font-mono text-xs text-[#202020] space-y-2">
                <div className="text-[#838383] text-[11px] uppercase tracking-wider font-bold">Công Thức Lượng Giá Toàn Cục:</div>
                <div className="text-[#090c1d] font-bold">
                  <Latex display>{"f(s) = \\sum_{p \\in \\mathcal{P}} \\left( W_{\\text{atk}}(p) \\cdot N_{\\text{bot}}(p) - W_{\\text{def}}(p) \\cdot N_{\\text{human}}(p) \\right)"}</Latex>
                </div>
                <div className="text-[#6647f0] font-bold text-center">
                  <Latex display>{"\\text{Mate Score} = 10^7, \\quad \\text{clamp}(-9\\,999\\,999, +9\\,999\\,999)"}</Latex>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] text-xs text-[#646464]">
                <strong className="text-[#202020]">Quy trình quyết định 1-ply:</strong> (1) Thắng ngay → (2) Chặn thua ngay → (3) Heuristic 1-ply ArgMax: <Latex>{"a^* = \\arg\\max_{a \\in \\mathcal{C}(s)} \\text{Eval}(s \\oplus a)"}</Latex>.
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div 
                onClick={() => onOpenFigure("bot_decision_flow")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] hover:border-[#6647f0] transition-all group shadow-xs"
                title="Chạm vào ảnh để soi quy trình ra quyết định Rule-Based Bot"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 4: Quy Trình Quyết Định</span>
                  <span className="text-[#6647f0] font-bold group-hover:translate-x-0.5 transition-transform">Chạm để soi mã ↗</span>
                </div>
                {/* Scrollable image viewport to contain the 2273px tall image cleanly */}
                <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] relative">
                  <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
                    <img
                      src="/assets/bot_decision_flow.png"
                      alt="Quy trình ra quyết định Rule-Based Bot"
                      className="w-full h-auto object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 bg-white/95 backdrop-blur-xs border-t border-[#e8e8e8] text-[10px] font-mono text-[#6647f0] text-center font-bold">
                    <span>↕ Cuộn xem 5 tầng quyết định • Chạm để soi mã</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => onOpenFigure("pattern_weights_distribution")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] hover:border-[#6647f0] transition-all group shadow-xs"
                title="Chạm vào ảnh để soi ma trận trọng số"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 4b: Phân Bố Trọng Số (Log-Scale)</span>
                  <span className="text-[#6647f0] font-bold group-hover:translate-x-0.5 transition-transform">Soi chi tiết ↗</span>
                </div>
                <div className="rounded-xl overflow-hidden mt-2 border border-[#e8e8e8] bg-[#f8f9fa] p-1.5">
                  <img
                    src="/assets/pattern_weights_distribution.png"
                    alt="Phân bố trọng số Heuristic"
                    className="w-full h-auto object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SubTab 3: Chebyshev Reduction */}
        {activeSubTab === "chebyshev" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W4-3: Branching Factor Reduction
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Cắt Giảm 72.4% Không Gian Tìm Kiếm
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Tại mỗi nước đi, bàn cờ có tới <Latex>{"225 - m"}</Latex> ô trống. Theo <em>Nguyên lý Cục bộ Chiến thuật (Tactical Locality)</em>, một quân cờ đặt cách xa các quân hiện hữu từ 3 ô trở lên không thể tạo ra liên kết trực tiếp trong chuỗi 5.
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] font-mono text-xs text-[#202020] space-y-2">
                <div className="text-[#838383] text-[11px] uppercase tracking-wider font-bold">Khoảng Cách Chebyshev Bán Kính r ≤ 2:</div>
                <div className="text-[#00c07a] font-bold text-center">
                  <Latex display>{"D_\\infty((r_1, c_1), (r_2, c_2)) = \\max\\left( |r_1 - r_2|, |c_1 - c_2| \\right) \\le 2"}</Latex>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#166534] space-y-1.5">
                <div className="font-bold text-[#14532d]">Kết quả đo đạc thực tế (100 ván đấu):</div>
                <div className="flex justify-between">
                  <span>Số ô trống trung bình:</span>
                  <span className="font-mono font-bold">220.21 ô</span>
                </div>
                <div className="flex justify-between">
                  <span>Số ô ứng viên sau lọc Chebyshev:</span>
                  <span className="font-mono font-bold text-[#15803d]">60.80 ô</span>
                </div>
                <div className="flex justify-between font-bold text-[#14532d] pt-1 border-t border-[#bbf7d0]">
                  <span>Tỷ lệ cắt giảm không gian:</span>
                  <span className="font-mono">72.39%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenFigure("chebyshev_heatmap")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] group"
                title="Chạm vào ảnh để soi thuật toán sinh ứng viên Chebyshev"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 5: Heatmap Ứng Viên Chebyshev</span>
                  <span className="text-[#6647f0] font-bold">Chạm để soi mã ↗</span>
                </div>
                <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] p-1.5">
                  <img
                    src="/assets/chebyshev_heatmap.png"
                    alt="Chebyshev Metric r <= 2 Pruning"
                    className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 text-xs text-[#646464]">
                  Loại bỏ 84% ô trống biên không giá trị trong giai đoạn khai cuộc.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SubTab 4: Battle & Benchmarks */}
        {activeSubTab === "battle" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W4-4: Empirical Baseline Dominance
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Chiến Thắng Tuyệt Đối 100/100 Ván Trước Random Bot
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Chúng tôi thiết lập cặp đấu thực nghiệm giữa Rule-Based Bot và Random Bot tất định (PRNG SplitMix64) qua <strong className="text-[#202020]">100 ván đấu</strong> liên tục trong cùng môi trường Rust Native.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
                <div className="p-4 rounded-xl bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383] uppercase font-bold">Tỷ lệ thắng</div>
                  <div className="text-2xl font-bold text-[#00c07a]">100.0%</div>
                  <div className="text-[10px] text-[#646464]">100 thắng / 0 thua / 0 hòa</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383] uppercase font-bold">Số nước / ván</div>
                  <div className="text-2xl font-bold text-[#0091ff]">9.90 plies</div>
                  <div className="text-[10px] text-[#646464]">Kết thúc ván rất nhanh</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383] uppercase font-bold">Độ trễ trung bình</div>
                  <div className="text-2xl font-bold text-[#6647f0]">42.24 µs</div>
                  <div className="text-[10px] text-[#646464]">Cực đại 251.26 µs</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383] uppercase font-bold">Ngân sách 60 FPS</div>
                  <div className="text-2xl font-bold text-[#202020]">0.25%</div>
                  <div className="text-[10px] text-[#646464]">42µs / 16.67ms frame</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenFigure("week4_bot_battle_and_pruning")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] group"
                title="Chạm vào ảnh để soi số liệu thực nghiệm 100 ván đấu"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 6: Thực Nghiệm Đo Đạc 100 Ván</span>
                  <span className="text-[#6647f0] font-bold">Chạm để soi mã ↗</span>
                </div>
                <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] p-1.5">
                  <img
                    src="/assets/week4_bot_battle_and_pruning.png"
                    alt="Tỷ lệ thắng 100 ván Bot-vs-Bot và Cắt giảm Không gian"
                    className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 text-xs text-[#646464]">
                  Minh chứng từ <code className="text-[#202020]">benchmark/results/week4_bot_battle.json</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
