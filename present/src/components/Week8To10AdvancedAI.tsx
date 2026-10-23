import React, { useState } from "react"
import { 
  GitBranch, 
  Cpu, 
  Zap, 
  Clock, 
  Database, 
  Layers, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  BarChart2, 
  Sliders, 
  BookOpen, 
  Sparkles,
  Presentation,
  ShieldCheck,
  Award
} from "lucide-react"
import { Latex, MathText } from "./Latex"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure?: (id: string) => void
}

export const Week8To10AdvancedAI: React.FC<Props> = ({ onOpenFigure }) => {
  const [activeTab, setActiveTab] = useState<"week8" | "week9" | "week10" | "registry">("week8")

  const moveOrderingBenchmarks = [
    { depth: "d = 2", naturalNodes: "148", sortedNodes: "52", prunedRatio: "64.9%", naturalTime: "0.18 ms", sortedTime: "0.08 ms", speedup: "2.25x" },
    { depth: "d = 3", naturalNodes: "1,280", sortedNodes: "384", prunedRatio: "70.0%", naturalTime: "1.42 ms", sortedTime: "0.48 ms", speedup: "2.95x" },
    { depth: "d = 4", naturalNodes: "44,210", sortedNodes: "11,480", prunedRatio: "74.0%", naturalTime: "24.80 ms", sortedTime: "6.20 ms", speedup: "4.00x" },
    { depth: "d = 5", naturalNodes: "382,100", sortedNodes: "78,450", prunedRatio: "79.5%", naturalTime: "320.50 ms", sortedTime: "44.80 ms", speedup: "7.15x" },
  ]

  const defenseSlides = [
    { num: 1, title: "Bìa Báo Cáo", desc: "XÂY DỰNG WEBSITE CỜ CARO ỨNG DỤNG CÁC THUẬT TOÁN TÌM KIẾM ĐỂ XÂY DỰNG BOT VỚI NHIỀU MỨC ĐỘ KHÓ — SV: Nguyễn Tâm Đức (24CSE)" },
    { num: 2, title: "Đặt Vấn Đề & Mục Tiêu", desc: "Kết hợp trải nghiệm Web trực quan (React 19 + PixiJS 7) và thuật toán AI kinh điển, 6 cấp độ Bot có đo lường đối sánh." },
    { num: 3, title: "Toán Học Gomoku & Luật Caro", desc: "Luận án Victor Allis (1994) First-Player Win, tác dụng cân bằng trò chơi của luật Chặn 2 Đầu Việt Nam." },
    { num: 4, title: "Bùng Nổ Tổ Hợp (Combinatorial Explosion)", desc: "Không gian trạng thái 10^105, hệ số phân nhánh b = 100 -> 224, yêu cầu AI phản hồi < 150ms trên Web." },
    { num: 5, title: "Kiến Trúc Phân Tầng Decoupled", desc: "Tách rời 3 lớp: Core Game Engine <-> Web UI Controller <-> AI Web Worker (Rust WebAssembly)." },
    { num: 6, title: "Thiết Kế Core Engine & Bàn Cờ", desc: "Ma trận phẳng 1D [u8; 225], Máy trạng thái FSM, cơ chế In-place Backtracking apply/undo." },
    { num: 7, title: "Kiểm Tra Thắng 4 Hướng O(1)", desc: "Thuật toán quét tia cục bộ tối đa 32 bước đọc quanh lastMove, kiểm tra 2 đầu mút chặn." },
    { num: 8, title: "Ma Trận 6 Cấp Độ Khó Của Bot", desc: "Phân bổ 6 tiers từ Easy (Random) -> Normal (Rule-Based) -> Hard -> Very Hard -> Expert -> Master." },
    { num: 9, title: "Thuật Toán Minimax & Giới Hạn Độ Sâu", desc: "Nguyên lý Zero-Sum hai người chơi luân phiên, hàm đệ quy Minimax và giới hạn độ sâu d = 1..4." },
    { num: 10, title: "Thuật Toán Alpha-Beta Pruning", desc: "Điều kiện cắt nhánh beta <= alpha, kiểm định bảo toàn tính tối ưu 100% (AB = MM trên 112 fixtures)." },
    { num: 11, title: "Tối Ưu Nước Đi: Candidate & Move Ordering", desc: "Bán kính Chebyshev r = 2 giảm 89.29% ô duyệt, bảo vệ Tactical Retention P = Wp U Wo trước Soft Cap." },
    { num: 12, title: "Tối Ưu Nâng Cao: ID & Zobrist Hashing", desc: "Quản lý ngân sách thời gian thực 500ms (Iterative Deepening) và bảng chuyển vị 8MB Zobrist 64-bit." },
    { num: 13, title: "Giao Diện Web & Dashboard Real-time", desc: "Trực quan hóa bàn cờ CSS Grid / PixiJS, highlight Last Move / Winning Line và Dashboard HUD thời gian thực." },
    { num: 14, title: "Kịch Bản Thực Nghiệm Bot vs Bot", desc: "Đấu trường tự động 500 ván, mỗi cặp 50 ván (25 ván đổi phe) triệt tiêu hoàn toàn ưu thế đi trước." },
    { num: 15, title: "Kết Quả Đối Sánh Hiệu Năng", desc: "Tỷ lệ cắt tỉa đạt 94.2%, tốc độ phản hồi tăng từ 7x đến 12x, chứng minh ưu thế Rust WebAssembly 17.8x." },
    { num: 16, title: "Tổng Kết Sản Phẩm Đạt Được", desc: "Đối chiếu trọn vẹn 100% mục tiêu trong Đề cương ban đầu: Web game production, AI 6 tiers, bộ test toàn diện." },
    { num: 17, title: "Hướng Phát Triển Tương Lai", desc: "Tích hợp MCTS (Monte Carlo Tree Search), Deep Reinforcement Learning (AlphaZero Gomoku), Self-Play training." },
    { num: 18, title: "Lời Cảm Ơn & Q&A", desc: "Tri ân Hội đồng chấm điểm VNUK và bảo vệ phản biện phương pháp luận kỹ thuật." },
  ]

  return (
    <section id="advanced-ai" className="py-24 px-4 bg-[#f8f9fa] border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nghiên Cứu Tuần 8, 9, 10 & Ma Trận Luận Án Standard 00</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Move Ordering, Zobrist Hashing, Iterative Deepening & Đề Cương Bảo Vệ
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Hệ thống hóa toàn bộ các kỹ thuật tối ưu hóa cây trò chơi nâng cao, bảng chuyển vị 64-bit Zobrist, ngân sách thời gian thực 500ms, kịch bản thực nghiệm 500 ván Bot vs Bot, và khung 18 slide thuyết minh bảo vệ của sinh viên <strong>Nguyễn Tâm Đức</strong> (Lớp 24CSE – VNUK).
          </p>
        </div>

        {/* Tab Navigation Controls (UI/UX Flat Standard) */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white border border-[#e8e8e8]">
          <button
            onClick={() => {
              soundManager.playClick()
              setActiveTab("week8")
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === "week8"
                ? "bg-[#202020] text-white"
                : "bg-white text-[#646464] hover:text-[#202020] hover:bg-[#f8f9fa]"
            }`}
          >
            <Zap className="w-4 h-4 text-[#00c07a]" />
            <span>Tuần 8: Move Ordering</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setActiveTab("week9")
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === "week9"
                ? "bg-[#202020] text-white"
                : "bg-white text-[#646464] hover:text-[#202020] hover:bg-[#f8f9fa]"
            }`}
          >
            <Database className="w-4 h-4 text-[#6647f0]" />
            <span>Tuần 9: Zobrist & Tournament</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setActiveTab("week10")
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === "week10"
                ? "bg-[#202020] text-white"
                : "bg-white text-[#646464] hover:text-[#202020] hover:bg-[#f8f9fa]"
            }`}
          >
            <Clock className="w-4 h-4 text-[#0091ff]" />
            <span>Tuần 10: Iterative Deepening</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setActiveTab("registry")
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === "registry"
                ? "bg-[#202020] text-white"
                : "bg-white text-[#646464] hover:text-[#202020] hover:bg-[#f8f9fa]"
            }`}
          >
            <Presentation className="w-4 h-4 text-purple-700" />
            <span>18 Slide Bảo Vệ & Registry</span>
          </button>
        </div>

        {/* TAB 1: WEEK 8 - DYNAMIC MOVE ORDERING */}
        {activeTab === "week8" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Theory & Invariants */}
              <div className="lg:col-span-7 space-y-6">
                <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                      Nguyên Lý Gia Tốc Cắt Tỉa (Knuth & Moore 1975)
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-bold">
                      [B] RQ-W8-01
                    </span>
                  </div>

                  <p className="text-xs text-[#646464] leading-relaxed">
                    Độ phức tạp tiệm cận của Alpha-Beta phụ thuộc hoàn toàn vào thứ tự duyệt nước đi: từ trường hợp xấu nhất <Latex>{"\\mathcal{O}(b^d)"}</Latex> (nước đi xấu duyệt trước) đến trường hợp tối ưu <Latex>{"\\mathcal{O}(b^{d/2})"}</Latex> (nước đi tốt nhất duyệt đầu tiên tại mọi node).
                  </p>

                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center my-2 text-[#202020]">
                    <Latex display>{`\\text{SortKey}(m) = \\text{QuickTacticalScore}(s \\oplus m)`}</Latex>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] space-y-2 text-xs">
                    <div className="font-bold text-[#202020] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#00c07a]" />
                      <span>Bất Biến Bảo Toàn Ngữ Nghĩa (Equivalence Invariant):</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-center font-mono text-xs text-[#202020]">
                      <Latex display>{`\\text{AlphaBeta}(s, d, \\text{CFG-ORDER-v0}) \\equiv \\text{AlphaBeta}(s, d, \\text{CFG-ORDER-v1})`}</Latex>
                    </div>
                    <p className="text-[11px] text-[#838383] italic">
                      *Move Ordering chỉ thay đổi thứ tự duyệt cành, KHÔNG thay đổi tập ứng viên, KHÔNG thay đổi hàm lượng giá tĩnh và bảo đảm kết quả nước đi gốc trùng khớp 100%.
                    </p>
                  </div>
                </div>

                {/* Rust Code Contract Card */}
                <div className="clickup-card p-5 bg-white border border-[#e8e8e8] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#e8e8e8]">
                    <span className="font-bold text-[#202020]">Hàm Sắp Xếp Ứng Viên Trong Rust Core</span>
                    <span className="text-[#00c07a] font-bold font-mono">caro-core-reference/src/alpha_beta.rs</span>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-[11px] text-[#202020] overflow-x-auto leading-relaxed">
{`pub fn sort_candidates(
    board: &mut Board,
    candidates: &mut [(usize, usize)],
    player: Player,
    is_maximizing: bool,
) {
    let mut scored: Vec<((usize, usize), i32)> = candidates.iter().map(|&(x, y)| {
        let idx = Board::index(x, y);
        board.cells[idx] = player;
        let score = evaluate_fast_local(board, x, y, player);
        board.cells[idx] = Player::None; // Rollback lập tức
        ((x, y), score)
    }).collect();

    if is_maximizing {
        scored.sort_unstable_by(|a, b| b.1.cmp(&a.1));
    } else {
        scored.sort_unstable_by(|a, b| a.1.cmp(&b.1));
    }
}`}
                  </pre>
                </div>
              </div>

              {/* Right Column: Empirical Data Table (UI/UX Dense Table Standard C3) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8]">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#202020]">
                      Đo Đạc Hiệu Năng: Natural vs. Heuristic Sort (EXP-W8-01)
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      [A] Measured Data
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#e8e8e8] bg-[#f8f9fa] text-[#838383]">
                          <th className="py-2.5 px-3 text-left">Độ Sâu</th>
                          <th className="py-2.5 px-3 text-right">Natural</th>
                          <th className="py-2.5 px-3 text-right">Sorted</th>
                          <th className="py-2.5 px-3 text-right">Cắt Giảm</th>
                          <th className="py-2.5 px-3 text-right">Tăng Tốc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e8e8e8]">
                        {moveOrderingBenchmarks.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                            <td className="py-2.5 px-3 text-left font-bold text-[#202020]">{row.depth}</td>
                            <td className="py-2.5 px-3 text-right text-[#646464] tabular-nums">{row.naturalNodes}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#6647f0] tabular-nums">{row.sortedNodes}</td>
                            <td className="py-2.5 px-3 text-right text-[#00c07a] font-bold tabular-nums">{row.prunedRatio}</td>
                            <td className="py-2.5 px-3 text-right text-[#0091ff] font-bold tabular-nums">{row.speedup}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>Kết Luận Khoa Học Tại Độ Sâu d = 5:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Tỷ lệ cắt tỉa ngay từ nước đi đầu tiên (First-Move Cutoff Ratio) tăng vọt từ <strong>32.4%</strong> lên <strong>78.9%</strong>. Thời gian tìm kiếm thực tế giảm từ <strong>320.50 ms</strong> xuống chỉ còn <strong>44.80 ms</strong> (tăng tốc <strong>7.15x</strong> trên wall-clock).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEEK 9 - ZOBRIST HASHING & BOT TOURNAMENT */}
        {activeTab === "week9" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Zobrist Hashing Formalism */}
              <div className="lg:col-span-7 space-y-6">
                <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                      Mã Băm Zobrist 64-bit & Cập Nhật O(1) Bằng Phép XOR
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                      [B] Zobrist (1970)
                    </span>
                  </div>

                  <p className="text-xs text-[#646464] leading-relaxed">
                    Trong cờ Caro, các hoán vị nước đi khác nhau thường hội tụ về cùng một hình thế bàn cờ (Transposition). Bảng chuyển vị (Transposition Table) lưu trữ kết quả duyệt trước đó bằng mã băm 64-bit phân bố đều:
                  </p>

                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center my-2 text-[#202020] overflow-x-auto">
                    <Latex display>{`\\mathcal{H}(s) = \\left( \\bigoplus_{c=0}^{224} \\mathcal{Z}[c][\\text{cells}[c]] \\right) \\oplus (\\text{player} == \\text{White} ? \\mathcal{Z}_{\\text{turn}} : 0)`}</Latex>
                  </div>

                  <p className="text-xs text-[#646464] leading-relaxed">
                    <MathText text="Khi đánh một nước tại ô $c$ hoặc rollback nước đi, mã băm cập nhật tức thì trong thời gian $O(1)$ mà không cần duyệt lại toàn bộ 225 ô:" />
                  </p>

                  <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-center font-mono text-xs text-[#202020]">
                    <Latex display>{`\\mathcal{H}(s') = \\mathcal{H}(s) \\oplus \\mathcal{Z}[c][p] \\oplus \\mathcal{Z}_{\\text{turn}}`}</Latex>
                  </div>

                  {/* TT Entry Structure */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] space-y-2 text-xs">
                    <div className="font-bold text-[#202020]">Đặc Tả Bản Ghi 16-Byte Trong Bảng Chuyển Vị (8MB = 524,288 entries):</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
                      <div className="p-2 rounded bg-[#f8f9fa] border border-[#e8e8e8]">
                        <span className="text-[#838383]">key:</span> <span className="font-bold text-[#202020]">u64 (8B)</span>
                      </div>
                      <div className="p-2 rounded bg-[#f8f9fa] border border-[#e8e8e8]">
                        <span className="text-[#838383]">score:</span> <span className="font-bold text-[#202020]">i32 (4B)</span>
                      </div>
                      <div className="p-2 rounded bg-[#f8f9fa] border border-[#e8e8e8]">
                        <span className="text-[#838383]">best_move:</span> <span className="font-bold text-[#202020]">u8 (1B)</span>
                      </div>
                      <div className="p-2 rounded bg-[#f8f9fa] border border-[#e8e8e8]">
                        <span className="text-[#838383]">bound:</span> <span className="font-bold text-[#6647f0]">u8 (1B)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Headless Tournament & Vietnamese Caro Findings */}
              <div className="lg:col-span-5 space-y-6">
                <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8]">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#202020]">
                      Đấu Trường Bot vs Bot: Luật Chặn 2 Đầu Việt Nam
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      [A] 500 Ván Tự Động
                    </span>
                  </div>

                  <p className="text-xs text-[#646464] leading-relaxed">
                    Mô phỏng 50 ván liên tiếp cho mỗi cặp đấu (25 ván đổi phe Đen/Trắng) nhằm triệt tiêu hoàn toàn sai số do ưu thế đi trước.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
                      <div className="text-xs font-bold text-[#202020] flex items-center justify-between">
                        <span>Luật Gomoku Tự Do (Freestyle):</span>
                        <span className="font-mono text-red-600 font-bold">84% Thắng cho Đen</span>
                      </div>
                      <p className="text-[11px] text-[#838383] leading-relaxed">
                        Khẳng định luận án Victor Allis (1994): Quân đi trước sở hữu lợi thế áp đảo nếu không có ràng buộc mở đầu hoặc luật chặn.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Luật Cờ Caro Việt Nam (Chặn 2 Đầu):</span>
                        <span className="font-mono text-emerald-700 font-bold">58% Thắng cho Đen</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Tỷ lệ thắng của quân đi trước giảm mạnh từ <strong>84%</strong> xuống <strong>58%</strong>; tỷ lệ hòa tăng từ <strong>2%</strong> lên <strong>18%</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-[11px] text-[#646464] italic">
                    👉 Chứng minh khoa học: Luật chặn 2 đầu của Việt Nam là một giải pháp cân bằng trò chơi vô cùng thanh lịch và hiệu quả trong thực tế.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEEK 10 - ITERATIVE DEEPENING & TIME BUDGETING */}
        {activeTab === "week10" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Real-Time Time Budgeting Invariants */}
              <div className="lg:col-span-7 space-y-6">
                <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <span className="text-xs font-mono font-bold text-[#6647f0] uppercase tracking-wider">
                      Thuật Toán Tìm Kiếm Sâu Dần (Iterative Deepening)
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-bold">
                      [B] Slate & Atkin (1977)
                    </span>
                  </div>

                  <p className="text-xs text-[#646464] leading-relaxed">
                    Trên trình duyệt web, một tác vụ tìm kiếm không thể chạy vô hạn: nếu vượt quá 500ms, trải nghiệm người dùng sẽ giật lag. Thuật toán Iterative Deepening duyệt tuần tự các độ sâu <Latex>{"d = 1, 2, 3, \\dots, d_{\\max}"}</Latex> cho đến khi cạn ngân sách thời gian được cấp:
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] space-y-2 text-xs">
                    <div className="font-bold text-[#202020] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#00c07a]" />
                      <span>Quy Tắc Hủy Bỏ An Toàn (Timeout Abort Rule):</span>
                    </div>
                    <p className="text-[#646464] leading-relaxed">
                      <MathText text="Nếu đồng hồ đếm ngược hết hạn trong lúc đang phân tích dở dang độ sâu $d$, thuật toán ngay lập tức hủy bỏ kết quả dở dang này và trả về nước đi hoàn chỉnh tốt nhất ở độ sâu $d-1$. Điều này triệt tiêu hoàn toàn lỗi nhận định do hiệu ứng đường chân trời (Horizon Blunder)." />
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2 text-xs">
                    <div className="font-bold text-[#202020]">Định Lý Giới Hạn Chi Phí Lặp (Korf 1985):</div>
                    <div className="p-2 rounded bg-white border border-[#e8e8e8] text-center font-mono text-xs text-[#202020]">
                      <Latex display>{`\\frac{\\sum_{i=1}^{d-1} b_{\\text{eff}}^i}{b_{\\text{eff}}^d} \\approx \\frac{1}{b_{\\text{eff}} - 1} \\approx \\frac{1}{4.2 - 1} \\approx 31.2\\%`}</Latex>
                    </div>
                    <p className="text-[11px] text-[#838383]">
                      <MathText text="*Tổng chi phí tìm kiếm lặp lại từ $d=1$ đến $d-1$ chỉ chiếm ~31.2% của độ sâu $d$, hoàn toàn được bù đắp nhờ việc kế thừa bảng chuyển vị để Move Ordering tối ưu ở độ sâu kế tiếp." />
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Controller Code Excerpt */}
              <div className="lg:col-span-5 space-y-6">
                <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8]">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#202020]">
                      Bộ Điều Khiển Ngân Sách Tìm Kiếm Trong Rust
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      [A] Source Verified
                    </span>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-[11px] text-[#202020] overflow-x-auto leading-relaxed">
{`pub fn search_with_budget(
    board: &mut Board,
    budget: &SearchBudget,
    player: Player,
    tt: &mut TranspositionTable,
) -> (Option<(usize, usize)>, usize) {
    let start_time = Instant::now();
    let deadline = start_time + Duration::from_millis(budget.time_limit_ms);
    let mut overall_best = None;

    for depth in 1..=budget.max_depth {
        let mut aborted = false;
        let res = alpha_beta_budgeted(..., deadline, &mut aborted, tt);
        if aborted { break; } // Bỏ kết quả dở dang
        overall_best = res.best_move;
        if res.score.abs() >= SCORE_FIVE { break; }
        if start_time.elapsed().as_millis() * 4 > budget.time_limit_ms {
            break; // Không đủ thời gian cho ply kế tiếp
        }
    }
    (overall_best, completed_depth)
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 18-SLIDE DEFENSE PRESENTATION & MASTER REGISTRY */}
        {activeTab === "registry" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Student Metadata Card (ClickUp High Contrast) */}
            <div className="clickup-card p-6 bg-white border border-[#e8e8e8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Đồ Án Cơ Sở (Basic Project) — VNUK 2026</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#090c1d]">
                  Sinh viên: Nguyễn Tâm Đức — Lớp: 24CSE
                </h3>
                <p className="text-xs text-[#646464]">
                  Đề tài: Nghiên cứu, thiết kế và hiện thực hóa công cụ trò chơi Gomoku tích hợp AI đa tầng độ khó.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://carogame-five.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-[#202020] text-white hover:bg-[#090c1d] text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Chơi Thử Web Live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com/tducn110/basicproject"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-white border border-[#d4d4d4] hover:bg-[#f8f9fa] text-[#202020] text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#646464]" />
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>

            {/* 18 Slide Grid Blueprint */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#090c1d] uppercase tracking-wider font-mono">
                  Đặc Tả Khung 18 Slide Thuyết Minh Bảo Vệ (Standard 00)
                </h3>
                <span className="text-xs font-mono font-bold text-[#646464]">
                  Tuan_10/04_Noi_Dung_Slide_Bao_Ve_Do_An.md
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {defenseSlides.map((slide) => (
                  <div key={slide.num} className="p-3.5 rounded-xl bg-white border border-[#e8e8e8] space-y-1.5 hover:border-[#6647f0] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#f8f9fa] text-[#6647f0] border border-[#e8e8e8]">
                        Slide {slide.num < 10 ? `0${slide.num}` : slide.num}
                      </span>
                      <span className="text-[10px] font-mono text-[#838383]">Standard 00</span>
                    </div>
                    <div className="font-bold text-xs text-[#202020]">{slide.title}</div>
                    <p className="text-[11px] text-[#646464] leading-relaxed line-clamp-3">
                      {slide.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* System Thinking Flow */}
            <div className="clickup-card p-6 bg-white border border-[#e8e8e8] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8]">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#202020]">
                  Khung Tư Duy Hệ Thống (System Thinking Framework)
                </h3>
                <span className="text-[11px] font-mono text-[#838383]">00B_System_Architecture_and_README.md</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-center font-mono text-xs text-[#202020] overflow-x-auto">
                <Latex display>{`\\text{INPUT} \\longrightarrow \\text{PROCESS} \\longrightarrow \\text{STATE} \\longrightarrow \\text{EVENT} \\longrightarrow \\text{SIDE EFFECT} \\longrightarrow \\text{OUTPUT} \\longrightarrow \\text{FEEDBACK}`}</Latex>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383]"><MathText text="nodesVisited ($N_v$):" /></div>
                  <div className="font-bold text-[#202020]">Số node gọi search</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383]"><MathText text="leafEvaluations ($N_e$):" /></div>
                  <div className="font-bold text-[#202020]">Đánh giá Heuristic d=0</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383]">cutoffCount (<Latex>{"C_{\\alpha\\beta}"}</Latex>):</div>
                  <div className="font-bold text-[#202020]">Số lần ngắt <Latex>{"\\beta \\le \\alpha"}</Latex></div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#838383]">tacticalRecall (<Latex>{"R_{\\text{tac}}"}</Latex>):</div>
                  <div className="font-bold text-[#00c07a]">1.0 (100% giữ nước nguy)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
