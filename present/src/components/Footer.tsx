import React from "react"
import { ArrowUpRight, Globe, GitBranch } from "lucide-react"
import { soundManager } from "../utils/audio"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#e8e8e8] py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#646464]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#6647f0] flex items-center justify-center font-extrabold text-xs text-white">
            C
          </div>
          <div>
            <div className="text-[#090c1d] font-bold text-sm">Caro AI Research & System Engineering</div>
            <div className="text-[#838383] text-[11px]">Báo cáo kỹ thuật Tuần 3 đến Tuần 4 — Đồ Án Cơ Sở</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://carogame-five.vercel.app"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-1.5 hover:text-[#202020] transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#0091ff]" />
            <span>Vercel Production Demo</span>
            <ArrowUpRight className="w-3 h-3 text-[#838383]" />
          </a>

          <a
            href="https://github.com/tducn110/basicproject"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-1.5 hover:text-[#202020] transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#6647f0]" />
            <span>GitHub Repository</span>
            <ArrowUpRight className="w-3 h-3 text-[#838383]" />
          </a>
        </div>

        <div className="text-[#838383] text-[11px] text-center md:text-right">
          <div>Trạng thái: <span className="text-[#00c07a] font-bold font-mono">VERIFIED [A]</span></div>
          <div>Bảo toàn nguyên lý State Decoupling & Rust WASM Speed</div>
        </div>
      </div>
    </footer>
  )
}
