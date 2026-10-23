import React, { useEffect, useState, useRef } from "react"
import { 
  Volume2, 
  VolumeX, 
  Calendar,
  ChevronDown,
  ExternalLink,
  GitBranch,
  Gamepad2, 
  CheckCircle2,
  Clock
} from "lucide-react"
import { soundManager } from "../utils/audio"
import { MILESTONES, WeekMilestone } from "./TopWeekBanner"

export const Navbar: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted())
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<WeekMilestone>(MILESTONES[0])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.scrollY
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100)
      }

      const sections = [
        "hero", 
        "overview", 
        "week3", 
        "pve-transition", 
        "week4", 
        "week5", 
        "week6", 
        "week7", 
        "advanced-ai", 
        "python-viz", 
        "interactive-board", 
        "benchmark", 
        "roadmap"
      ]
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200 && rect.bottom >= 200) {
            // Sync selected milestone with current scroll position
            const matched = MILESTONES.find(m => m.anchor === `#${sectionId}`)
            if (matched) {
              setSelectedMilestone(matched)
            }
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDropdownOpen])

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute()
    setIsMuted(muted)
    if (!muted) soundManager.playClick()
  }

  const handleSelectMilestone = (m: WeekMilestone) => {
    soundManager.playClick()
    setSelectedMilestone(m)
    setIsDropdownOpen(false)

    const el = document.querySelector(m.anchor)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#e8e8e8] z-50 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-[#6647f0] via-[#0091ff] to-[#00c07a] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Unified Single-Row Sticky Header */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e8e8] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          
          {/* Left: Brand Logo & Executive Milestone Breadcrumb */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Brand Logo Pill */}
            <a 
              href="#hero" 
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] border border-[#e8e8e8] transition-all group shrink-0"
              title="Về đầu trang"
            >
              <div className="w-5 h-5 rounded-full bg-[#6647f0] flex items-center justify-center font-extrabold text-[11px] text-white shrink-0">
                C
              </div>
              <div className="text-xs font-bold tracking-tight text-[#202020] flex items-center gap-1.5">
                <span>Caro AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 font-mono font-bold hidden sm:inline">
                  W1→10
                </span>
              </div>
            </a>

            {/* Milestone Dropdown Selector (Active Section Tracker) */}
            <div className="relative min-w-0" ref={dropdownRef}>
              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsDropdownOpen(!isDropdownOpen)
                }}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f8f9fa] border border-[#d4d4d4] hover:border-[#6647f0] text-xs text-[#202020] transition-all cursor-pointer group shadow-xs min-w-0"
                aria-label="Chọn tuần báo cáo từ Tuần 1 đến Tuần 10"
              >
                <Calendar className="w-3.5 h-3.5 text-[#6647f0] shrink-0" />
                <span className="font-extrabold text-[#6647f0] shrink-0 whitespace-nowrap">
                  {selectedMilestone.weekNumber}:
                </span>
                <span className="font-semibold text-[#202020] truncate max-w-[160px] sm:max-w-[280px] md:max-w-[420px] lg:max-w-[520px]">
                  {selectedMilestone.title}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#838383] transition-transform duration-200 shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu Popover */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#e8e8e8] shadow-2xl z-50 p-2 space-y-1 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-[#e8e8e8] flex items-center justify-between text-[11px] font-mono text-[#838383]">
                    <span className="font-bold text-[#202020]">LỘ TRÌNH BÁO CÁO (TUẦN 1 → 10)</span>
                    <span className="text-[#00c07a] font-semibold">8 Giai Đoạn</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1 py-1 scrollbar-thin">
                    {MILESTONES.map((m) => {
                      const isSelected = selectedMilestone.id === m.id
                      const isDone = m.status === "completed"

                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMilestone(m)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
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
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
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
                    <span className="text-[#646464]">Thực nghiệm bàn cờ:</span>
                    <a
                      href="#interactive-board"
                      onClick={() => {
                        soundManager.playClick()
                        setIsDropdownOpen(false)
                      }}
                      className="font-bold text-[#00c07a] hover:underline flex items-center gap-1"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Chơi thử trực tiếp →</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sound Toggle + GitHub Repo + Live Vercel CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Bật âm thanh Web Audio" : "Tắt âm thanh"}
              className="p-2 rounded-full bg-white hover:bg-[#f8f9fa] border border-[#d4d4d4] text-[#646464] hover:text-[#202020] transition-all shrink-0 cursor-pointer shadow-xs"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#f43f5e]" /> : <Volume2 className="w-4 h-4 text-[#00c07a]" />}
            </button>

            {/* GitHub Repo Button */}
            <a
              href="https://github.com/tducn110/basicproject"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-[#202020] font-bold text-xs transition-all hover:scale-105 active:scale-95 shrink-0 shadow-xs"
              title="Mã nguồn GitHub cập nhật mới nhất"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#646464]" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-[#838383]" />
            </a>

            {/* Live Production Vercel Button */}
            <a
              href="https://carogame-five.vercel.app"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#00c07a] hover:bg-[#009e65] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Mở Bàn Cờ Thực Tế Đang Chạy Trên Vercel"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Bàn Cờ Live</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

        </div>
      </header>
    </>
  )
}