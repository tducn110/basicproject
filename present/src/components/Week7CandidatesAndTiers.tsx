import React, { useState } from "react"
import { 
  Target, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Zap,
  Globe
} from "lucide-react"
import { Latex, MathText } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure?: (id: string) => void
}

export const Week7CandidatesAndTiers: React.FC<Props> = ({ onOpenFigure }) => {
  const [selectedTier, setSelectedTier] = useState<number>(2) // Default Hard (ID 2)

  const tiers = [
    {
      id: 0,
      name: "Easy",
      strategy: "Random",
      depth: "0 (Không lookahead)",
      radiusCap: "Toàn bộ legal moves, không cap",
      complexity: "1/5",
      description: "Lấy ngẫu nhiên đều từ tập ô trống hợp lệ qua SplitMix64 PRNG. Nodes = 2 (root + post-selection evaluation).",
      evidence: "[A] Native legality check & Worker execution pass"
    },
    {
      id: 1,
      name: "Normal",
      strategy: "Rule-Based + 1-ply Fallback",
      depth: "1-ply",
      radiusCap: "Radius 2, không cap",
      complexity: "3/5",
      description: "Ưu tiên: Nước thắng ngay của mình → Nước chặn đối thủ thắng → Greedy Heuristic tốt nhất trong 1 ply.",
      evidence: "[A] Native win/block & Worker execution pass"
    },
    {
      id: 2,
      name: "Hard",
      strategy: "Alpha-Beta Pruning",
      depth: "Depth 2",
      radiusCap: "Radius 2, Soft Cap 15",
      complexity: "4/5",
      description: "Duyệt tìm kiếm 2 ply với cắt tỉa Alpha-Beta. Soft Cap 15 có cơ chế bảo vệ bắt buộc các nước chiến thuật.",
      evidence: "[A] Bounded native & Worker G3/G4 pass"
    },
    {
      id: 5,
      name: "Very Hard",
      strategy: "Alpha-Beta Pruning",
      depth: "Depth 3",
      radiusCap: "Radius 2, Soft Cap 12",
      complexity: "4/5",
      description: "Duyệt tìm kiếm 3 ply (đối thủ phản ứng 1 lượt). Giữ nguyên ID 5 để tương thích backward contract.",
      evidence: "[A] Bounded native & Worker G3/G4 pass"
    },
    {
      id: 3,
      name: "Expert",
      strategy: "Alpha-Beta Pruning",
      depth: "Depth 4",
      radiusCap: "Radius 2, Soft Cap 10",
      complexity: "4/5",
      description: "Duyệt tìm kiếm 4 ply (2 cặp nước đi). Kiểm soát thời gian dưới 300ms trong điều kiện Web Worker.",
      evidence: "[A] G3/G4 pass; đo đạc 285ms trên native release"
    },
    {
      id: 4,
      name: "Master",
      strategy: "Alpha-Beta Pruning",
      depth: "Depth 5",
      radiusCap: "Radius 2, Soft Cap 8",
      complexity: "5/5 (Kiến trúc)",
      description: "Duyệt tìm kiếm 5 ply với Cap 8 nghiêm ngặt. Chưa tích hợp Transposition Table hay Iterative Deepening.",
      evidence: "[A] G3/G4 pass; [D] Chưa calibrated strength qua tournament"
    }
  ]

  const activeTier = tiers.find((t) => t.id === selectedTier) || tiers[2]

  return (
    <section id="week7" className="py-24 px-4 bg-white border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header following Working Protocol */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6647f0]/10 border border-[#6647f0]/20 text-[#6647f0] text-xs font-bold uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5" />
            <span>Đặc Tả Học Thuật Tuần 7 — Chuẩn VNUK 23/10/2026</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Candidate Generation, Tactical Recall & Sáu Cấp Độ Bot
          </h2>
          <MathText 
            className="text-[#646464] text-sm sm:text-base leading-relaxed block"
            text="Quy hoạch không gian tìm kiếm hình học theo khoảng cách Chebyshev $d_\\infty \\le R$, cơ chế bảo vệ bắt buộc nước đi chiến thuật (Tactical Retention) trước Soft Cap, và ánh xạ cấu hình 6 cấp độ AI từ Easy đến Master."
          />
        </div>

        {/* 2-Column Math & Tactic Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Chebyshev & Tactical Protection Math */}
          <div className="lg:col-span-7 space-y-6">
            <div className="clickup-card p-6 bg-[#f8f9fa] border border-[#e8e8e8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                  Mô Hình Không Gian Ứng Viên Chebyshev & Soft Cap
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-[#d4d4d4] text-[#202020] font-bold">
                  [A] candidates.rs
                </span>
              </div>

              <p className="text-xs text-[#646464] leading-relaxed">
                <MathText text="Đặt $O(s)$ là tập các ô đã có quân, $A(s) = \Omega \setminus O(s)$ là tập ô trống. Tập ứng viên không gian bán kính $R$ được xác định theo chuẩn vô hạn Chebyshev:" />
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] text-center my-3 text-[#202020] overflow-x-auto">
                <Latex display>{`d_\\infty((x,y),(u,v)) = \\max(|x-u|, |y-v|), \\quad C_R(s) = \\{m \\in A(s) : \\exists o \\in O(s), d_\\infty(m,o) \\le R\\}`}</Latex>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] space-y-2 text-xs">
                <div className="font-bold text-[#202020] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00c07a]" />
                  <span>Bảo Vệ Nước Đi Chiến Thuật (Tactical Retention Rule):</span>
                </div>
                <p className="text-[#646464] leading-relaxed">
                  <MathText text="Nếu chỉ cắt giới hạn $K$ ứng viên theo hàng cột ngây thơ (Row-major Cap), thuật toán có thể vô tình loại bỏ các nước thắng ngay hoặc ô bắt buộc phải chặn (phát hiện trong phản biện cap_loss.json). Bộ sinh ứng viên mới bảo vệ tập chiến thuật $P = W_p \cup W_o$ trước khi áp dụng Soft Cap:" />
                </p>
                <div className="py-2 px-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-center font-mono text-[11px] text-[#202020]">
                  <Latex display>{`C' = P \\cup \\operatorname{Top}_{\\max(0, K_{\\text{eff}} - |P|)}(S \\setminus P), \\quad K_{\\text{eff}} = \\max(1, K)`}</Latex>
                </div>
                <p className="text-[11px] text-[#838383] italic">
                  *Nếu |P| &gt; K, hệ thống giữ toàn bộ P, chấp nhận kích thước vượt K để bảo toàn tính sống còn (Tactical Recall = 100%).
                </p>
              </div>
            </div>

            {/* Evidence & Verification Card */}
            <div className="clickup-card p-5 bg-white border border-[#e8e8e8] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#e8e8e8]">
                <span className="font-bold text-[#202020]">Minh Chứng Kiểm Định G2 / G4</span>
                <span className="text-[#00c07a] font-bold">VERIFIED in Host</span>
              </div>
              <ul className="space-y-2 text-xs text-[#646464]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                  <span><strong>BP26-CAND-GEOMETRY:</strong> Kiểm định hình học góc, biên, tâm, bàn cờ rỗng và bàn cờ đầy (5 tests PASS).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                  <span><strong>BP26-CAP-TACTICAL:</strong> Bảo đảm giữ nguyên các ô hoàn thành chuỗi 5 của mình và chặn chuỗi của đối thủ dù Soft Cap = 1.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                  <span><strong>BP26-LEVELS-SIX:</strong> Sáu cấp độ bot được phân phối đúng ID và cấu hình qua WebAssembly Web Worker (G4 Browser PASS).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Six Bot Tiers Inspector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="clickup-card p-6 bg-[#f8f9fa] border border-[#d4d4d4] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#6647f0]" />
                  <h3 className="text-sm font-extrabold text-[#090c1d] uppercase tracking-wider font-mono">
                    Hệ Thống Sáu Cấp Độ Bot (6 Tiers)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#6647f0]/10 text-[#6647f0]">
                  W7 Contract
                </span>
              </div>

              {/* Tier Selection Grid */}
              <div className="grid grid-cols-3 gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundManager.playClick()
                      setSelectedTier(t.id)
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedTier === t.id
                        ? "bg-[#202020] text-white shadow-xs scale-102"
                        : "bg-white text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] opacity-70">ID: {t.id}</span>
                  </button>
                ))}
              </div>

              {/* Active Tier Spec Sheet */}
              <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] space-y-3">
                <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-2">
                  <div className="font-extrabold text-sm text-[#202020] flex items-center gap-2">
                    <span>Mức: {activeTier.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0091ff]/10 text-[#0091ff]">
                      {activeTier.strategy}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#838383]">
                    Độ khó kỹ thuật: <strong>{activeTier.complexity}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8]">
                    <div className="text-[10px] text-[#838383]">Độ Sâu (Horizon):</div>
                    <div className="font-bold text-[#202020] mt-0.5">{activeTier.depth}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8]">
                    <div className="text-[10px] text-[#838383]">Bán Kính & Cap:</div>
                    <div className="font-bold text-[#202020] mt-0.5 truncate">{activeTier.radiusCap}</div>
                  </div>
                </div>

                <p className="text-xs text-[#646464] leading-relaxed pt-1">
                  {activeTier.description}
                </p>

                <div className="p-2 rounded-lg bg-[#f8f9fa] text-[11px] font-mono text-[#00c07a] border border-[#e8e8e8]">
                  {activeTier.evidence}
                </div>
              </div>

              {/* Technical Notice Alert */}
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#be123c] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#f43f5e]" />
                  <span>Giới Hạn Kỹ Thuật Cần Lưu Ý Theo Gate Ledger:</span>
                </div>
                <p className="text-[11px] text-[#9f1239] leading-relaxed">
                  [D] Cấu hình 6 tiers hiện tại là giải pháp kiến trúc đã được hiện thực hóa và kiểm tra cục bộ; mức độ mạnh thực tế của các bot chưa được xác lập qua giải đấu (Tournament Calibration). Master bot hiện tại <strong>chưa có Transposition Table và Iterative Deepening</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Week 7 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#6647f0]">01. Chebyshev Radius</div>
            <p className="text-xs text-[#646464] leading-relaxed">
              <MathText text="Cắt giảm không gian trạng thái theo chuẩn $L_\\infty \\le 2$, triệt tiêu $89.28\\%$ diện tích ô trống thừa khi mới có 1 quân cờ." />
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#0091ff]">02. Soft Cap & Tactic</div>
            <p className="text-xs text-[#646464] leading-relaxed">
              <MathText text="Bảo vệ $P = W_p \\cup W_o$, không bao giờ cắt bỏ nước thắng ngay của mình hoặc ô bắt buộc phải chặn của đối thủ." />
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#00c07a]">03. Sắp Xếp Move Ordering</div>
            <p className="text-xs text-[#646464] leading-relaxed">
              <MathText text="Xếp thứ tự duyệt theo điểm số nhanh $O(1)$ mà không làm thay đổi tập ứng viên (Permutation preserves membership)." />
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#202020]">04. Sáu Cấp Độ Thống Nhất</div>
            <p className="text-xs text-[#646464] leading-relaxed">
              Hợp nhất từ Easy đến Master xuyên suốt hợp đồng dữ liệu giữa Rust WASM, Web Worker và giao diện người dùng.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
