import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, ArrowRight, ShieldCheck, Zap, Scissors, Layers, Play, Sparkles, Terminal } from "lucide-react"
import { soundManager } from "../utils/audio"

gsap.registerPlugin(ScrollTrigger)

interface Props {
  onOpenFigure: (id: string) => void
}

export const HeroSection: React.FC<Props> = ({ onOpenFigure }) => {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim-up", {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const benefits = [
    { text: "Phân Rã 3 Lớp & State Decoupling", sub: "Triệt tiêu 225 re-render thừa của TimerState mỗi giây (Tuần 3)" },
    { text: "Lõi Rust WebAssembly Đa Luồng", sub: "Web Worker xử lý ngầm, giữ vững ổn định 60 FPS không drop frame" },
    { text: "Bộ Lọc Chebyshev r ≤ 2 & Mate Dominance", sub: "Cắt giảm 72.4% không gian duyệt, thắng tuyệt đối 100/100 ván" },
  ]

  const stats = [
    { label: "Tỷ Lệ Thắng Thực Nghiệm", value: "100%", sub: "100/100 ván vs Random Bot (SplitMix64)", color: "text-[#00c07a]" },
    { label: "Độ Trễ Quyết Định Rust", value: "42.24 µs", sub: "Chỉ chiếm 0.25% ngân sách 60 FPS (16.67ms)", color: "text-[#0091ff]" },
    { label: "Cắt Giảm Không Gian Duyệt", value: "72.4%", sub: "Bán kính Chebyshev r ≤ 2 (220 → 60 ô)", color: "text-[#6647f0]" },
    { label: "Số Node DOM Bàn Cờ", value: "225 Nút", sub: "Single Authoritative DOM (-50% so với Figma gốc)", color: "text-[#202020]" },
  ]

  return (
    <section 
      id="hero"
      ref={heroRef}
      className="relative pt-20 sm:pt-24 pb-16 px-4 bg-white overflow-hidden border-b border-[#e8e8e8]"
    >
      <div className="max-w-6xl mx-auto">
        {/* 2-Column Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Typography, Benefits, CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* ClickUp Style Status Pill */}
            <div className="hero-anim-up inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f8f9fa] border border-[#e8e8e8]">
              <span className="w-2 h-2 rounded-full bg-[#00c07a]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#646464]">
                Báo Cáo Nghiên Cứu Đồ Án Cơ Sở
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6647f0]/10 text-[#6647f0] font-bold">
                Tuần 3 → Tuần 4
              </span>
            </div>

            {/* Oversized Bold Headline (ClickUp Dialect: 52-80px, weight 800, tracking -0.04em) */}
            <h1 className="hero-anim-up text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-[#090c1d] leading-[1.05]">
              Kiến Trúc Web UI & Lõi Đối Kháng
              <span className="block mt-1 text-[#6647f0]">
                Caro / Gomoku AI
              </span>
            </h1>

            {/* Body Description */}
            <p className="hero-anim-up text-base sm:text-lg text-[#646464] leading-relaxed max-w-2xl">
              Hành trình phân rã tệp giao diện nguyên khối 1079 dòng mã từ Figma Make thành kiến trúc 3 tầng chuẩn hóa, bảo toàn nguyên lý <strong className="text-[#202020]">State Decoupling</strong>, và tích hợp động cơ đối kháng <strong className="text-[#202020]">Rust WebAssembly đa luồng</strong> đạt tỷ lệ thắng tuyệt đối.
            </p>

            {/* Checkmark Benefit List */}
            <div className="hero-anim-up space-y-3 pt-2">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0091ff]/10 text-[#0091ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-[#202020] mr-1.5">{b.text}:</span>
                    <span className="text-[#646464]">{b.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action CTAs: ClickUp Rotating Conic CTA + Ghost Outlined Buttons */}
            <div className="hero-anim-up flex flex-wrap items-center gap-3 pt-4">
              {/* Primary CTA with Animated Rainbow Conic Border */}
              <div className="rainbow-conic-wrapper hover:scale-105 transition-transform">
                <div className="rainbow-conic-border" />
                <a
                  href="#week3"
                  onClick={() => soundManager.playClick()}
                  className="rainbow-conic-inner flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-tight"
                >
                  <span>Khám Phá Chi Tiết Báo Cáo</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Ghost Outline Buttons */}
              <a
                href="#interactive-board"
                onClick={() => soundManager.playClick()}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold text-sm transition-all"
              >
                <Play className="w-4 h-4 text-[#0091ff]" />
                <span>Thử Nghiệm Bàn Cờ</span>
              </a>

              <a
                href="#python-viz"
                onClick={() => soundManager.playClick()}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold text-sm transition-all"
              >
                <Terminal className="w-4 h-4 text-[#6647f0]" />
                <span>Python Sandbox</span>
              </a>
            </div>
          </div>

          {/* Right Column: ClickUp Product UI Screenshot / Interactive Anchor */}
          <div className="lg:col-span-5">
            <div 
              onClick={() => onOpenFigure("ui_architecture_flow")}
              className="clickable-figure clickup-card p-3 bg-[#f8f9fa] border border-[#e8e8e8] relative group"
              title="Chạm để mở bảng phân tích chi tiết sơ đồ kiến trúc"
            >
              <div className="flex items-center justify-between pb-3 px-2 border-b border-[#e8e8e8] text-xs font-mono text-[#838383]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c07a]" />
                  <span className="ml-2 font-bold text-[#202020]">ui_architecture_flow.png</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#6647f0]/10 text-[#6647f0] text-[10px] font-bold">
                  Touch to Inspect ↗
                </span>
              </div>

              <div className="rounded-xl overflow-hidden mt-3 border border-[#e8e8e8] bg-[#f8f9fa] p-1.5">
                <img
                  src="/assets/ui_architecture_flow.png"
                  alt="Sơ đồ Pipeline Dữ liệu và Phân rã State"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3 text-xs text-[#646464] flex items-center justify-between">
                <span>Minh chứng: Sơ đồ 7 bước xử lý nước đi</span>
                <span className="font-mono text-[#0091ff] font-bold">Inspect Deep Math & Goods/Bads →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Callout Strip (ClickUp Social Proof Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-[#e8e8e8]">
          {stats.map((s, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] flex flex-col justify-between">
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.06em] text-[#838383] mb-2">
                {s.label}
              </div>
              <div className={`text-4xl sm:text-5xl font-extrabold tracking-[-0.04em] ${s.color} mb-1 font-display`}>
                {s.value}
              </div>
              <div className="text-xs text-[#646464] leading-relaxed">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
