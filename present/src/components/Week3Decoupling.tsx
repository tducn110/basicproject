import React, { useState } from "react"
import { Cpu, Check, RefreshCw, Layout, Layers, Volume2, ArrowRight } from "lucide-react"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure: (id: string) => void
}

export const Week3Decoupling: React.FC<Props> = ({ onOpenFigure }) => {
  const [activeTab, setActiveTab] = useState<"architecture" | "timer" | "dom" | "audio">("architecture")
  const [simRunning, setSimRunning] = useState(false)
  const [badRenderCount, setBadRenderCount] = useState(0)
  const [goodRenderCount, setGoodRenderCount] = useState(0)
  const [simSeconds, setSimSeconds] = useState(0)

  // Interactive re-render simulator
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (simRunning) {
      interval = setInterval(() => {
        setSimSeconds((s) => s + 1)
        setBadRenderCount((c) => c + 225)
        setGoodRenderCount((c) => c + 0)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [simRunning])

  const toggleSim = () => {
    soundManager.playClick()
    if (simRunning) {
      setSimRunning(false)
    } else {
      setBadRenderCount(0)
      setGoodRenderCount(0)
      setSimSeconds(0)
      setSimRunning(true)
    }
  }

  return (
    <section id="week3" className="py-24 px-4 bg-[#e9ebf0] border-y border-[#d4d4d4]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#d4d4d4] text-[#6647f0] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Cpu className="w-3.5 h-3.5" />
            <span>Báo Cáo Trọng Tâm: Tuần 3</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Thiết Kế Kiến Trúc Web UI & Phân Rã Hệ Thống
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Khắc phục tệp nguyên khối 1079 dòng mã xuất từ Figma Make: Phân rã 3 lớp kiến trúc, bảo đảm nguyên lý State Decoupling và loại bỏ lãng phí tài nguyên DOM.
          </p>
        </div>

        {/* ClickUp 9999px Pill Tabs Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "architecture", label: "Kiến Trúc 3 Tầng & File Taxonomy", icon: Layout },
            { id: "timer", label: "State Decoupling (Timer vs Board)", icon: RefreshCw },
            { id: "dom", label: "Single Authoritative DOM Tree", icon: Layers },
            { id: "audio", label: "Web Audio API & Master Limiter", icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick()
                  setActiveTab(tab.id as typeof activeTab)
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

        {/* Tab 1: Architecture & File Taxonomy */}
        {activeTab === "architecture" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W3-1: Phân Tầng Trách Nhiệm Hệ Thống
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Từ Mã Nguồn Nguyên Khối Sang 3 Tầng Chuẩn Hóa
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Bản xuất ban đầu từ Figma Make dồn toàn bộ <strong className="text-[#f43f5e]">1079 dòng mã</strong> vào một file duy nhất (<code className="text-[#202020] bg-white px-2 py-0.5 rounded border border-[#e8e8e8]">App.tsx</code>), nhồi nhét cả logic ma trận cờ, hiệu ứng DOM, timer interval, âm thanh và CSS inline.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] flex items-start gap-3 shadow-sm">
                  <span className="px-2.5 py-1 rounded-full bg-[#6647f0]/10 text-[#6647f0] text-[11px] font-mono font-bold shrink-0">
                    Implement
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-[#202020] mb-0.5">src/features/caro/domain/board.ts</div>
                    <div className="text-[#646464]">Logic mô phỏng thuần túy (Pure TS). Không import React, không phụ thuộc DOM hay CSS.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] flex items-start gap-3 shadow-sm">
                  <span className="px-2.5 py-1 rounded-full bg-[#0091ff]/10 text-[#0091ff] text-[11px] font-mono font-bold shrink-0">
                    Trung Chuyển
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-[#202020] mb-0.5">src/features/caro/hooks/ (useCaroGame, useGameTimer)</div>
                    <div className="text-[#646464]">Custom Hooks điều phối trạng thái, tiếp nhận sự kiện UI, gọi domain logic và trả state sạch.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] flex items-start gap-3 shadow-sm">
                  <span className="px-2.5 py-1 rounded-full bg-[#00c07a]/10 text-[#00c07a] text-[11px] font-mono font-bold shrink-0">
                    Presentation
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-[#202020] mb-0.5">src/features/caro/components/ (BoardGrid, BoardCell, PlayerCard...)</div>
                    <div className="text-[#646464]">Dumb components nhận props, không tự ý mutate state, dùng chung CSS tokens.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] flex items-start gap-3 shadow-sm">
                  <span className="px-2.5 py-1 rounded-full bg-[#202020] text-white text-[11px] font-mono font-bold shrink-0">
                    Shell
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-[#202020] mb-0.5">src/App.tsx (5 dòng) & CaroGamePage.tsx</div>
                    <div className="text-[#646464]">Khung vỏ mỏng kết nối các Hook và ráp các Component thành trang web hoàn chỉnh.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clickable Figure Card on the right */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenFigure("ui_architecture_flow")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] group"
                title="Chạm vào ảnh để mở chi tiết thuật toán & ưu/nhược điểm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 1: Pipeline Dữ Liệu 7 Bước</span>
                  <span className="text-[#6647f0] font-bold">Chạm để soi mã ↗</span>
                </div>
                <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] p-1.5">
                  <img
                    src="/assets/ui_architecture_flow.png"
                    alt="Sơ đồ Kiến trúc Phân Tầng Hệ Thống Tuần 3"
                    className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3 text-xs text-[#646464] leading-relaxed">
                  INPUT → EVENT → PROCESS → STATE → SIDE EFFECT → OUTPUT → FEEDBACK
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: State Decoupling & Re-render Simulator */}
        {activeTab === "timer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W3-2: State Single-Responsibility Invariant
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Tách Biệt Hoàn Toàn TimerState Khỏi GameState
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Trong React, nếu gộp <code className="text-[#202020] bg-white px-1.5 py-0.5 rounded border border-[#e8e8e8]">TimerState</code> (nhảy mỗi 1000ms) vào chung với <code className="text-[#202020] bg-white px-1.5 py-0.5 rounded border border-[#e8e8e8]">GameState</code>, mỗi giây trôi qua React buộc phải đối soát (reconciliation) toàn bộ <strong className="text-[#f43f5e]">225 ô cờ</strong>!
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] text-xs text-[#646464] space-y-2">
                <div className="font-bold text-[#202020]">Giải pháp đã hiện thực:</div>
                <div>1. Tách riêng hook <code className="font-mono text-[#0091ff]">useGameTimer.ts</code> với chu kỳ setInterval độc lập.</div>
                <div>2. Giá trị <code className="font-mono text-[#202020]">elapsed</code> chỉ truyền xuống component hiển thị <code className="font-mono text-[#202020]">&lt;GameInfo /&gt;</code>.</div>
                <div>3. Bàn cờ <code className="font-mono text-[#202020]">&lt;BoardGrid /&gt;</code> đạt trạng thái <strong className="text-[#00c07a]">0 re-render</strong> trong suốt thời gian đồng hồ đếm.</div>
              </div>
            </div>

            {/* Live Re-render Simulator */}
            <div className="lg:col-span-6">
              <div className="clickup-card p-6 bg-white border border-[#d4d4d4]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#090c1d]">Mô Phỏng Đo Đạc Re-Render Trực Tiếp</h4>
                    <p className="text-xs text-[#838383]">So sánh giữa gộp chung State và phân rã State theo thời gian thực</p>
                  </div>
                  <button
                    onClick={toggleSim}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                      simRunning
                        ? "bg-[#f43f5e] hover:bg-rose-600 text-white"
                        : "bg-[#202020] hover:bg-[#090c1d] text-white"
                    }`}
                  >
                    {simRunning ? "Dừng Đo Đạc" : "Chạy Thử Nghiệm"}
                  </button>
                </div>

                <div className="text-center py-2 mb-4 bg-[#f8f9fa] rounded-xl border border-[#e8e8e8]">
                  <div className="text-[11px] text-[#838383] uppercase tracking-wider font-mono font-bold">Thời Gian Trôi Qua:</div>
                  <div className="text-3xl font-mono font-black text-[#6647f0]">{simSeconds}s</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#be123c] font-bold mb-1">
                      1. Gộp Chung State (Cũ)
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-[#9f1239] mb-1">
                      {badRenderCount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#881337] leading-tight">
                      Số lần đối soát DOM ô cờ (225 ô × {simSeconds}s). Lãng phí CPU.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#15803d] font-bold mb-1">
                      2. Phân Rã State (Tuần 3)
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-[#166534] mb-1">
                      {goodRenderCount}
                    </div>
                    <div className="text-[11px] text-[#14532d] leading-tight">
                      Số lần đối soát ô cờ bằng 0! Triệt tiêu hoàn toàn lãng phí render.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Single DOM Instance */}
        {activeTab === "dom" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                RQ-W3-4: Single Authoritative DOM Instance
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Loại Bỏ Duplicate DOM & Tối Ưu Cảm Ứng Di Động
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Bản Figma ban đầu mount cùng lúc 2 bàn cờ (Desktop và Mobile) rồi ẩn hiện bằng CSS, tạo ra tới <strong className="text-[#f43f5e]">450 nút button</strong> trên cây DOM.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#646464]">
                    <strong className="text-[#202020]">Single Authoritative DOM:</strong> Chỉ render 1 bàn cờ duy nhất (225 button), tự động thích ứng qua CSS Grid container.
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#646464]">
                    <strong className="text-[#202020]">Triệt tiêu trễ 300ms:</strong> Áp dụng <code className="text-[#0091ff] font-mono">touch-action: manipulation</code> và vùng an toàn <code className="text-[#0091ff] font-mono">env(safe-area-inset-*)</code> trên di động.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div 
                onClick={() => onOpenFigure("component_hierarchy")}
                className="clickable-figure clickup-card p-4 bg-white border border-[#d4d4d4] group"
                title="Chạm vào ảnh để soi chi tiết phân cấp Component"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs font-mono">
                  <span className="font-bold text-[#202020]">Hình 2: Phân Cấp Component 3 Lớp</span>
                  <span className="text-[#6647f0] font-bold">Chạm để soi mã ↗</span>
                </div>
                <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] p-1.5">
                  <img
                    src="/assets/component_hierarchy.png"
                    alt="Sơ đồ Phân cấp Component và Phân tầng Kiến trúc"
                    className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audio Synthesizer */}
        {activeTab === "audio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                Web Audio API Synthesizer
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#090c1d] tracking-tight">
                Tự Tổng Hợp Âm Thanh & Master Bus Limiter Chống Méo
              </h3>
              <p className="text-[#646464] text-sm leading-relaxed">
                Tự tổng hợp âm thanh gỗ/giấy bằng Web Audio API thuần túy, tích hợp <code className="text-[#202020] bg-white px-2 py-0.5 rounded border border-[#e8e8e8]">DynamicsCompressorNode</code> với Threshold -12dB triệt tiêu hoàn toàn méo rè (digital clipping) khi âm thanh chồng lấn.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => soundManager.playPiece("X")}
                  className="px-4 py-2 rounded-full bg-white border border-[#e8e8e8] hover:bg-[#f8f9fa] text-xs font-bold text-[#f43f5e] flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Quân X (440Hz)</span>
                </button>
                <button
                  onClick={() => soundManager.playPiece("O")}
                  className="px-4 py-2 rounded-full bg-white border border-[#e8e8e8] hover:bg-[#f8f9fa] text-xs font-bold text-[#0091ff] flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Quân O (587Hz)</span>
                </button>
                <button
                  onClick={() => soundManager.playWin()}
                  className="px-4 py-2 rounded-full bg-[#202020] text-white hover:bg-[#090c1d] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#eab308]" />
                  <span>Test Hợp Âm Thắng</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="clickup-card p-5 bg-white text-[#202020] border border-[#e8e8e8] font-mono text-xs space-y-2 shadow-sm">
                <div className="text-[#838383] text-[10px] uppercase tracking-wider font-bold">// Cấu hình Master Bus Limiter:</div>
                <div className="text-[#202020] font-bold">const compressor = ctx.createDynamicsCompressor()</div>
                <div className="text-[#646464] pl-4">threshold: -12dB, knee: 30</div>
                <div className="text-[#646464] pl-4">ratio: 12, attack: 0.003s, release: 0.25s</div>
                <div className="text-[#00c07a] font-bold pt-2">// Zero Digital Distortion Guaranteed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
