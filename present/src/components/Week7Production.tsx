import React, { useState } from "react"
import { 
  Rocket, 
  Volume2, 
  Cpu, 
  Globe, 
  GitBranch, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Play, 
  Sparkles,
  CheckCircle2
} from "lucide-react"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure?: (id: string) => void
}

export const Week7Production: React.FC<Props> = ({ onOpenFigure }) => {
  const [audioTestStatus, setAudioTestStatus] = useState<string>("Sẵn sàng thử nghiệm")

  const handleTestAudio = (type: "X" | "O" | "win" | "click") => {
    if (type === "X") {
      soundManager.playPiece("X")
      setAudioTestStatus("Đã phát SFX Quân X (Tần số 440 Hz)")
    } else if (type === "O") {
      soundManager.playPiece("O")
      setAudioTestStatus("Đã phát SFX Quân O (Tần số 330 Hz)")
    } else if (type === "win") {
      soundManager.playWin()
      setAudioTestStatus("Đã phát Arpeggio Chiến Thắng (C-E-G-C)")
    } else {
      soundManager.playClick()
      setAudioTestStatus("Đã phát UI Click (Tần số 800 Hz)")
    }
  }

  return (
    <section id="week7" className="py-24 px-4 bg-white border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0091ff]/10 border border-[#0091ff]/20 text-[#0091ff] text-xs font-bold uppercase tracking-wider mb-3">
            <Rocket className="w-3.5 h-3.5" />
            <span>Nghiệm Thu Toàn Diện Tuần 7 — Phase 6</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Đóng Gói Web App, Web Audio Limiter & Triển Khai Production
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Hợp nhất toàn bộ thành quả nghiên cứu từ Tuần 3 đến Tuần 6 thành một sản phẩm Web Game hoàn chỉnh. Đóng gói lõi Rust WebAssembly vào Web Worker, tinh chỉnh hệ thống âm thanh Web Audio với Master Compressor Limiter, và xuất bản chính thức lên Vercel.
          </p>
        </div>

        {/* 4 Engineering Achievements Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Web Worker & Wasm */}
          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#6647f0]/10 text-[#6647f0] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#202020]">WebAssembly Worker</h3>
              <p className="text-xs text-[#646464] leading-relaxed">
                Đóng gói <code>gomoku_engine_bg.wasm</code> (49.29 kB) chạy trên luồng nền riêng biệt. Triệt tiêu 100% hiện tượng khựng khung hình khi bot tìm kiếm.
              </p>
            </div>
            <div className="pt-2 border-t border-[#e8e8e8] text-[11px] font-mono font-bold text-[#00c07a]">
              0ms Main Thread Block
            </div>
          </div>

          {/* Card 2: Web Audio Limiter */}
          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#0091ff]/10 text-[#0091ff] flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#202020]">Web Audio Limiter</h3>
              <p className="text-xs text-[#646464] leading-relaxed">
                Master bus tích hợp <code>DynamicsCompressorNode</code> (Threshold -12dB, Ratio 4:1). Chống vỡ tiếng (digital clipping) khi âm thanh dồn dập.
              </p>
            </div>
            <div className="pt-2 border-t border-[#e8e8e8] text-[11px] font-mono font-bold text-[#0091ff]">
              Zero Clipping Audio
            </div>
          </div>

          {/* Card 3: Single DOM Tree */}
          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#00c07a]/10 text-[#00c07a] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#202020]">Single DOM Tree</h3>
              <p className="text-xs text-[#646464] leading-relaxed">
                Thống nhất bàn cờ Desktop và Mobile về 1 cây DOM 225 nút duy nhất qua CSS Grid responsive 4 cấp. Cắt giảm 50% lượng node so với Figma gốc.
              </p>
            </div>
            <div className="pt-2 border-t border-[#e8e8e8] text-[11px] font-mono font-bold text-[#6647f0]">
              -50% DOM Nodes (225 ô)
            </div>
          </div>

          {/* Card 4: Production Vercel */}
          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#f43f5e]/10 text-[#f43f5e] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#202020]">Vercel Deployment</h3>
              <p className="text-xs text-[#646464] leading-relaxed">
                Thiết lập pipeline CI/CD tự động build từ GitHub repo. Triển khai CDN toàn cầu tại <code>carogame-five.vercel.app</code> với bảo mật HTTPS.
              </p>
            </div>
            <div className="pt-2 border-t border-[#e8e8e8] text-[11px] font-mono font-bold text-[#00c07a] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00c07a] animate-ping" />
              <span>Live Production</span>
            </div>
          </div>
        </div>

        {/* Audio Engine Live Synthesizer Interactive Box */}
        <div className="clickup-card p-6 bg-[#f8f9fa] border border-[#d4d4d4] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0091ff]" />
              <h3 className="text-sm font-extrabold text-[#202020] uppercase font-mono">
                Bảng Thử Nghiệm Bộ Tổng Hợp Âm Thanh Web Audio (Live Test Sound Engine)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#838383]">{audioTestStatus}</span>
          </div>

          <p className="text-xs text-[#646464] leading-relaxed">
            Hệ thống âm thanh được tổng hợp thuần bằng mã nguồn qua <code>AudioContext</code> và <code>OscillatorNode</code>, không tải tệp MP3 ngoài, tải trang tức thì và hoạt động mượt mà trên mọi thiết bị:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleTestAudio("X")}
              className="py-3 px-4 rounded-xl bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-xs font-bold text-[#f43f5e] flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>SFX Đặt Quân X</span>
            </button>

            <button
              onClick={() => handleTestAudio("O")}
              className="py-3 px-4 rounded-xl bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-xs font-bold text-[#0091ff] flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>SFX Đặt Quân O</span>
            </button>

            <button
              onClick={() => handleTestAudio("win")}
              className="py-3 px-4 rounded-xl bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-xs font-bold text-[#eab308] flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>SFX Chiến Thắng</span>
            </button>

            <button
              onClick={() => handleTestAudio("click")}
              className="py-3 px-4 rounded-xl bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-xs font-bold text-[#202020] flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>SFX UI Click</span>
            </button>
          </div>
        </div>

        {/* Final Defense Verification & Production Gateway */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#6647f0]/5 via-white to-[#00c07a]/5 border border-[#d4d4d4] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00c07a]" />
              <h4 className="font-extrabold text-[#202020] text-base">
                Đồ Án Đã Sẵn Sàng Nghiệm Thu Trước Hội Đồng (Defense Ready)
              </h4>
            </div>
            <p className="text-xs text-[#646464] leading-relaxed">
              Mã nguồn, hồ sơ học thuật, bộ dữ liệu benchmark, và bản build thực tế đã được đồng bộ hóa hoàn chỉnh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://carogame-five.vercel.app"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00c07a] hover:bg-[#009e65] text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Trải Nghiệm Bàn Cờ Vercel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://github.com/tducn110/basicproject"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202020] hover:bg-[#090c1d] text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Mã Nguồn GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#838383]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
