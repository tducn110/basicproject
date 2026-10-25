import React, { useState } from "react"
import { 
  Calendar, 
  ChevronDown, 
  ExternalLink, 
  GitBranch, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Gamepad2, 
  Layers, 
  Cpu, 
  Bot, 
  BarChart3,
  Flame
} from "lucide-react"
import { soundManager } from "../utils/audio"

export interface WeekMilestone {
  id: string
  weekNumber: string
  title: string
  phase: string
  status: "completed" | "in-progress" | "planned"
  anchor: string
  description: string
  metric?: string
}

export const MILESTONES: WeekMilestone[] = [
  {
    id: "week1-2",
    weekNumber: "Tuần 1 & 2",
    title: "Cơ Sở Toán Học & Core Raycasting O(1)",
    phase: "Mathematical Foundations & State Space",
    status: "completed",
    anchor: "#overview",
    description: "Không gian 15x15, mảng phẳng 225 ô, kiểm tra thắng cuộc cục bộ quanh lastMove tối đa 32 neighbor reads.",
    metric: "19/19 Vitest Tests Pass"
  },
  {
    id: "week3",
    weekNumber: "Tuần 3",
    title: "Phân Rã Kiến Trúc UI & State Decoupling",
    phase: "Player vs Player Baseline & React 19",
    status: "completed",
    anchor: "#week3",
    description: "Tách hook useCaroGame và useGameTimer, tối ưu CSS Grid một DOM, ngăn 100% re-render thừa của bàn cờ.",
    metric: "0 Re-render thừa (16.6ms 60 FPS)"
  },
  {
    id: "pve-transition",
    weekNumber: "Chuyển Giao PvE",
    title: "Tích Hợp Bot Đấu (Add-in Player vs Bot)",
    phase: "WebAssembly Bridge & Web Worker",
    status: "completed",
    anchor: "#pve-transition",
    description: "Chuyển giao sang đối kháng Máy. Đẩy toàn bộ tính toán sang Web Worker bất đồng bộ, bảo toàn 60 FPS UI.",
    metric: "Worker phi đồng bộ, 0 lag UI"
  },
  {
    id: "week4",
    weekNumber: "Tuần 4",
    title: "Động Cơ Rust, 7 Mẫu Hình & Heuristic",
    phase: "Rule-Based Bot & Heuristic Engine",
    status: "completed",
    anchor: "#week4",
    description: "Xây dựng 7 mẫu hình Caro, Mate Dominance 10^8 (M - q), cắt tỉa Chebyshev r <= 2 giảm 72.4% không gian duyệt.",
    metric: "42.24 µs / nước, 100% Win Rate"
  },
  {
    id: "week5",
    weekNumber: "Tuần 5",
    title: "Thuật Toán Minimax & Cây Trò Chơi (Game Tree)",
    phase: "Combinatorial Explosion & Depth-Limited",
    status: "completed",
    anchor: "#week5",
    description: "Cài đặt Minimax đệ quy hai người chơi luân phiên, phân tích bùng nổ tổ hợp N = b^d, giới hạn độ sâu d=1..4.",
    metric: "Đo đạc Game Tree d=1..4"
  },
  {
    id: "week6",
    weekNumber: "Tuần 6",
    title: "Cắt Tỉa Alpha-Beta & Bất Biến Cận",
    phase: "Pruning Efficiency & Benchmark Đối Đầu",
    status: "completed",
    anchor: "#week6",
    description: "Áp dụng điều kiện beta <= alpha, sắp xếp nước đi O(1) và bảng chuyển vị Zobrist 64-bit, đạt 16,350 cutoffs ở d=4, Rust tăng tốc 17.8x.",
    metric: "16,350 Cutoffs, 17.8x Speedup"
  },
  {
    id: "week7",
    weekNumber: "Tuần 7",
    title: "Candidate Generation, Tactical Recall & 6 Mức Bot",
    phase: "Chebyshev Space, Soft Cap & Six Tiers",
    status: "completed",
    anchor: "#week7",
    description: "Sinh ứng viên Chebyshev R<=2, bảo vệ tactic P = Wp U Wo trước Soft Cap, sắp xếp Move Ordering và hợp nhất 6 cấp độ bot Easy..Master.",
    metric: "Tactical Recall 100%, 6 Tiers"
  },
  {
    id: "week8-10",
    weekNumber: "Tuần 8–10",
    title: "Move Ordering, Zobrist Hashing, ID & 18 Slide Bảo Vệ",
    phase: "Advanced Search, Tournament & Thesis Defense",
    status: "completed",
    anchor: "#advanced-ai",
    description: "Gia tốc Move Ordering 7.15x, bảng chuyển vị 64-bit Zobrist, ngân sách 500ms Iterative Deepening, đấu trường 500 ván và 18 slide bảo vệ của SV Nguyễn Tâm Đức (24CSE).",
    metric: "7.15x Speedup, 18 Slides Standard 00"
  }
]

export const TopWeekBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<WeekMilestone>(MILESTONES[2]) // Default Tuần 4

  const handleSelectMilestone = (m: WeekMilestone) => {
    soundManager.playClick()
    setSelectedMilestone(m)
    setIsOpen(false)

    const el = document.querySelector(m.anchor)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="bg-[#f8f9fa] border-b border-[#e8e8e8] py-2.5 px-4 sticky top-0 z-50 backdrop-blur-md bg-[#f8f9fa]/95">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Week Milestone Dropdown Selector */}
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00c07a] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#646464] hidden sm:inline">
              Lộ Trình Báo Cáo:
            </span>
          </div>

          {/* Custom Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                soundManager.playClick()
                setIsOpen(!isOpen)
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#d4d4d4] hover:border-[#6647f0] text-xs font-bold text-[#202020] transition-all cursor-pointer group"
              aria-label="Chọn tuần báo cáo từ Tuần 3 đến Tuần 10"
            >
              <Calendar className="w-3.5 h-3.5 text-[#6647f0]" />
              <span className="font-extrabold text-[#6647f0]">{selectedMilestone.weekNumber}:</span>
              <span className="truncate max-w-[140px] sm:max-w-[220px]">{selectedMilestone.title}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#838383] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu Items (Tuần 3 -> Tuần 7) */}
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 rounded-2xl bg-white border border-[#e8e8e8] shadow-xl z-50 p-2 space-y-1 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-[#e8e8e8] flex items-center justify-between text-[11px] font-mono text-[#838383]">
                    <span className="font-bold text-[#202020]">CHỌN TUẦN BÁO CÁO (TUẦN 3 → 7)</span>
                    <span>6 Giai Đoạn</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1 py-1">
                    {MILESTONES.map((m) => {
                      const isSelected = selectedMilestone.id === m.id
                      const isDone = m.status === "completed"

                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMilestone(m)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? "bg-[#6647f0]/10 border border-[#6647f0]/30 text-[#202020]"
                              : "hover:bg-[#f8f9fa] border border-transparent text-[#646464] hover:text-[#202020]"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[#00c07a]" />
                            ) : (
                              <Clock className="w-4 h-4 text-[#838383]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-[#202020] text-xs">
                                {m.weekNumber}: {m.title}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                isDone 
                                  ? "bg-[#00c07a]/10 text-[#00c07a]" 
                                  : "bg-[#e9ebf0] text-[#646464]"
                              }`}>
                                {isDone ? "Đã Xong" : "Kế Hoạch"}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#838383] truncate mt-0.5">
                              {m.phase}
                            </p>

                            {m.metric && (
                              <div className="text-[10px] font-mono text-[#0091ff] font-semibold mt-1">
                                {m.metric}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="p-2 border-t border-[#e8e8e8] bg-[#f8f9fa] rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-[#646464]">Chuyển giao cốt lõi:</span>
                    <a
                      href="#pve-transition"
                      onClick={() => {
                        soundManager.playClick()
                        setIsOpen(false)
                      }}
                      className="font-bold text-[#0091ff] hover:underline flex items-center gap-1"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Xem Chuyển Giao PvE →</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick jump pills */}
          <div className="hidden lg:flex items-center gap-1.5">
            <a
              href="#week3"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#646464] hover:text-[#202020] hover:bg-white border border-transparent hover:border-[#e8e8e8] transition-all"
            >
              Tuần 3 UI
            </a>
            <a
              href="#pve-transition"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#0091ff] bg-[#0091ff]/10 hover:bg-[#0091ff]/20 transition-all flex items-center gap-1"
            >
              <Bot className="w-3 h-3" />
              <span>Chuyển giao PvE</span>
            </a>
            <a
              href="#week4"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#646464] hover:text-[#202020] hover:bg-white border border-transparent hover:border-[#e8e8e8] transition-all"
            >
              Tuần 4 Rust
            </a>
            <a
              href="#week5"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#646464] hover:text-[#202020] hover:bg-white border border-transparent hover:border-[#e8e8e8] transition-all"
            >
              Tuần 5 Minimax
            </a>
            <a
              href="#week6"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#646464] hover:text-[#202020] hover:bg-white border border-transparent hover:border-[#e8e8e8] transition-all"
            >
              Tuần 6 Alpha-Beta
            </a>
            <a
              href="#week7"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#6647f0] bg-[#6647f0]/10 hover:bg-[#6647f0]/20 transition-all flex items-center gap-1"
            >
              <span>Tuần 7 Nghiệm Thu</span>
            </a>
            <a
              href="#interactive-board"
              onClick={() => soundManager.playClick()}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#00c07a] bg-[#00c07a]/10 hover:bg-[#00c07a]/20 transition-all flex items-center gap-1"
            >
              <Gamepad2 className="w-3 h-3" />
              <span>Bàn Cờ Live</span>
            </a>
          </div>
        </div>

        {/* Right: Direct Production URLs (Vercel Build + GitHub Repo) */}
        <div className="flex items-center gap-2">
          {/* Vercel Live Board Button */}
          <a
            href="https://carogame-five.vercel.app"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00c07a] hover:bg-[#009e65] text-white font-bold text-xs transition-all hover:scale-105 active:scale-95"
            title="Mở Bàn Cờ Thực Tế Đang Chạy Trên Vercel"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Bàn Cờ Live Vercel</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          {/* GitHub Repo Button */}
          <a
            href="https://github.com/tducn110/basicproject"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-[#202020] font-bold text-xs transition-all hover:scale-105 active:scale-95"
            title="Mã nguồn GitHub cập nhật mới nhất"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub Repo</span>
            <ExternalLink className="w-3 h-3 text-[#838383]" />
          </a>
        </div>
      </div>
    </div>
  )
}
