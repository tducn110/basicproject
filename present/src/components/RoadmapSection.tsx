import React, { useState } from "react"
import { Calendar, CheckCircle2, Circle, GitCommit, FolderGit2, Terminal, FileCode2, ShieldCheck, ChevronRight } from "lucide-react"

export const RoadmapSection: React.FC = () => {
  const phases = [
    {
      phase: "Phase 1: Rule Spec & Math Foundation",
      week: "Tuần 1",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Đề cương nghiên cứu và bảng thuật ngữ chuẩn VNUK",
        "Đặc tả hình thức bàn cờ 15x15 và luật Freestyle Gomoku (k = 5)",
        "Mô hình GameState bất biến & phân tích không gian 10^105",
      ],
    },
    {
      phase: "Phase 2: Core Game Engine & Verification",
      week: "Tuần 2",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Cài đặt thuật toán Local Raycasting O(1) kiểm tra thắng cuộc quanh lastMove (<= 32 reads)",
        "Bộ test fixture Vitest 19/19 tests pass 100%",
        "Logic cờ độc lập hoàn toàn với UI, cơ chế in-place rollback",
      ],
    },
    {
      phase: "Phase 3: Web UI Decoupling & Component Standards",
      week: "Tuần 3",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Phân rã file nguyên khối 1079 dòng thành kiến trúc 3 lớp (Implement, Hooks, Presentation)",
        "State Decoupling: Tách riêng TimerState, triệt tiêu 225 re-render thừa",
        "Single Authoritative DOM Tree & Web Audio API Master Limiter",
        "Triển khai Production lên Vercel: 10-caro.vercel.app",
      ],
    },
    {
      phase: "Phase 4: Pattern Detection & Rule-Based Bot (Rust)",
      week: "Tuần 4",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Chuẩn hóa 7 mẫu hình thế Caro theo Maximal Run Invariant",
        "Hàm lượng giá Heuristic lũy thừa với nguyên lý Mate Dominance (10^8, M - q)",
        "Cắt giảm 72.4% không gian trạng thái bằng bán kính Chebyshev r ≤ 2",
        "Thực nghiệm Bot-vs-Bot: 100% win rate trước Random Bot, độ trễ 42.24 µs",
        "Tích hợp WebAssembly Web Worker (PvE Mode) vào Web UI",
      ],
    },
    {
      phase: "Phase 5: Minimax Algorithm & Game Tree Search",
      week: "Tuần 5",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Xây dựng cây trò chơi Game Tree và giải thuật Minimax đệ quy hai người chơi luân phiên",
        "Thu thập và đo đạc sự bùng nổ tổ hợp node theo độ sâu d = 1, 2, 3, 4",
        "Áp dụng kỹ thuật giới hạn độ sâu (Depth-Limited Search) kết hợp hàm lượng giá Heuristic tĩnh",
      ],
    },
    {
      phase: "Phase 6: Alpha-Beta Pruning & Equivalence Proof",
      week: "Tuần 6",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Cài đặt thuật toán cắt tỉa Alpha-Beta Pruning đạt 16,350 cutoffs ở độ sâu d=4",
        "Chứng minh toán học và thực nghiệm AB = MM trên 112 fixtures với zero semantic drift",
        "Đo đạc gia tốc Rust WebAssembly đạt 17.8x so với TypeScript",
      ],
    },
    {
      phase: "Phase 7: Candidate Moves & Six Bot Tiers",
      week: "Tuần 7",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Sinh ứng viên không gian Chebyshev r = 2 giảm 89.29% số ô duyệt",
        "Quy tắc bảo vệ Tactical Retention P = Wp U Wo trước Soft Cap (sửa cap_loss.json)",
        "Hợp nhất ma trận 6 cấp độ Bot từ Easy, Normal, Hard, Very Hard, Expert, Master",
      ],
    },
    {
      phase: "Phase 8: Dynamic Move Ordering Optimization",
      week: "Tuần 8",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Cài đặt bộ sắp xếp heuristic 1-ply pre-sort (CFG-ORDER-v1)",
        "Tăng tỷ lệ First-Move Cutoff từ 32.4% lên 78.9% ở d = 5",
        "Tăng tốc 7.15x trên wall-clock (320.5ms giảm còn 44.8ms)",
      ],
    },
    {
      phase: "Phase 9: Zobrist Hashing & Tournament",
      week: "Tuần 9",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Mã băm 64-bit Zobrist XOR O(1) và bảng chuyển vị 8MB (524,288 entries)",
        "Đấu trường không giao diện 500 ván (50 ván/cặp, 25 ván đảo phe)",
        "Chứng minh luật Chặn 2 Đầu Việt Nam cân bằng trò chơi (giảm thắng Đen từ 84% xuống 58%)",
      ],
    },
    {
      phase: "Phase 10: Iterative Deepening & Defense Slides",
      week: "Tuần 10",
      status: "DONE",
      progress: "100%",
      tasks: [
        "Tìm kiếm sâu dần theo ngân sách thời gian thực 500ms (an toàn bỏ vòng lặp dở dang)",
        "Soạn thảo đề cương 18 slide thuyết minh bảo vệ của SV Nguyễn Tâm Đức (24CSE)",
        "Đóng gói tài liệu chuẩn Standard 00 IMRaD, Master Evidence Registry & Git Provenance",
      ],
    },
  ]

  const commitProvenance = [
    { hash: "78a01e6", desc: "Mã nguồn UI nguyên khối ban đầu từ Figma Make (741 dòng)" },
    { hash: "26b2188", desc: "Tập trung chế độ 1v1 người chơi (1079 dòng monolithic)" },
    { hash: "4248380", desc: "Phân rã kiến trúc 3 lớp: App.tsx giảm từ 1079 dòng xuống 5 dòng" },
    { hash: "a1a3df8", desc: "Tách độc lập useGameTimer.ts & chuẩn hóa CSS Design Tokens" },
    { hash: "65316a8", desc: "Tối ưu Single DOM Tree & triệt tiêu trễ cảm ứng di động" },
    { hash: "rust-w4", desc: "Lõi nhận diện hình thế & Rule-Based Bot đạt 100% tỷ lệ thắng trên Rust" },
    { hash: "cb6fd6f", desc: "Canonical commit: Hoàn thiện lõi Rust WebAssembly, Candidate moves, 6 Tiers & Vitest 18/18 tests" },
  ]

  return (
    <section id="roadmap" className="py-24 px-4 bg-[#f8f9fa] border-t border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Lộ Trình Toàn Diện 10 Tuần — Chuẩn VNUK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Lộ Trình Đồ Án & Dẫn Chứng Provenance
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Tổng quan tiến độ 10 giai đoạn từ lý thuyết toán học đến bảo vệ đồ án của sinh viên Nguyễn Tâm Đức (24CSE), kèm chuỗi chứng cứ kỹ thuật Git Commits & Test Suites xác thực.
          </p>
        </div>

        {/* 10 Phases Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {phases.map((p, idx) => (
            <div key={idx} className="clickup-card p-5 bg-white flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#202020] font-mono">{p.week}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      p.status === "DONE"
                        ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                        : "bg-[#f8f9fa] text-[#6647f0] border border-[#e8e8e8]"
                    }`}
                  >
                    {p.progress}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#090c1d] mb-3">{p.phase}</h3>
                <ul className="space-y-1.5 text-xs text-[#646464]">
                  {p.tasks.map((task, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      {p.status === "DONE" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00c07a] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#d4d4d4] shrink-0 mt-0.5" />
                      )}
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Git Provenance Table */}
        <div className="clickup-card p-6 bg-white mb-12">
          <div className="flex items-center gap-2 mb-4">
            <GitCommit className="w-4 h-4 text-[#6647f0]" />
            <h3 className="text-sm font-bold text-[#202020]">Dẫn Chứng Lịch Sử Git (Git Provenance Evidence)</h3>
          </div>

          <div className="space-y-2">
            {commitProvenance.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-[#6647f0] font-bold">[{c.hash}]</span>
                  <span className="text-[#202020]">{c.desc}</span>
                </div>
                <span className="text-[#00c07a] font-bold text-[10px] px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0]">VERIFIED [A]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appendix A: Table A.1 Repository Inventory & Roles */}
        <div className="clickup-card p-6 sm:p-8 bg-white border border-[#e8e8e8] mb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8e8]">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6647f0] mb-1">
                Phụ Lục A (Bảng A.1 Báo Cáo Tốt Nghiệp)
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight">
                Danh Mục 20 Thư Mục Mã Nguồn & Bản Đồ Bằng Chứng (Repository Inventory)
              </h3>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold shrink-0 self-start sm:self-auto">
              Table A.1 Specification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#6647f0] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>CaroGame</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Ứng dụng đối kháng chính thức: UI PixiJS, WebAssembly bridge, sound & asset manager, test suite.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#0091ff] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>present</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Website thuyết trình bảo vệ đồ án (Vite/React/Tailwind/GSAP/Pyodide in-browser Python runner).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#00c07a] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>benchmark</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Harness đo đạc đối đầu Rust native vs Node.js JIT qua 4 độ sâu và tệp tổng kết JSON.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#e11d48] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>research</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Lưu trữ dữ liệu thực nghiệm, minh chứng native, bảng băm Zobrist, CSV và 3 probe phản biện.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#202020] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Week1 – Week3</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Đặc tả toán học, không gian trạng thái 10^105, luật Freestyle Gomoku và kiến trúc phân rã UI 3 lớp.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#ea580c] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Week4</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Mẫu hình Caro 7 thế, nguyên lý Mate Dominance M = 10^8, hàm lượng giá và bot Rule-based trên Rust.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#6647f0] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Week5 – Week6</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Cây trò chơi Minimax luân phiên, cắt tỉa Alpha-Beta 16,350 cutoffs và kiểm chứng tương đương AB = MM.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#0091ff] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Week7 – Week8</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Lọc ứng viên Chebyshev r ≤ 2, bảo vệ tactic P = Wp U Wo, 6 cấp độ Bot và sắp xếp Move Ordering 7.15x.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#9333ea] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Week9 – Week10</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Bảng băm 64-bit Zobrist, Transposition Table 8MB, Iterative Deepening 500ms và đấu trường 500 ván.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#00c07a] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>assets</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Thư viện 20 hình vẽ, biểu đồ phân tích, ảnh chụp màn hình bàn cờ và ma trận trọng số.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#475569] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>rules & scripts</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Quy chuẩn dự án, script sinh biểu đồ tự động, kịch bản build và đồng bộ dữ liệu.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-1">
              <div className="font-bold font-mono text-[#202020] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Top-level Files</span>
              </div>
              <p className="text-[#646464] text-[11px] leading-relaxed">
                Đề cương chi tiết, kiến trúc LAYOUT, GATES nghiệm thu, README và các báo cáo rà soát.
              </p>
            </div>
          </div>
        </div>

        {/* Appendix C: Reproducibility & Independent Verification Guide */}
        <div className="clickup-card p-6 sm:p-8 bg-[#f8f9fa] border border-[#d4d4d4] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8e8]">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00c07a] mb-1">
                Phụ Lục C (Mục C Báo Cáo Tốt Nghiệp)
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight">
                Quy Trình Tái Hiện Độc Lập & Lệnh Nghiệm Thu Dự Án (Reproducibility Procedure)
              </h3>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white border border-[#d4d4d4] text-[#166534] font-bold shrink-0 self-start sm:self-auto">
              Appendix C Protocol
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Step 1 & 2 */}
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] space-y-3">
              <div className="font-bold text-[#202020] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#6647f0]" />
                <span>1. Kiểm Tra Ứng Dụng Chơi Cờ (CaroGame)</span>
              </div>
              <p className="text-[#646464] font-sans text-[11px]">
                Cài đặt gói phụ thuộc từ lockfile, chạy kiểm tra kiểu dữ liệu, 59 unit tests và build bundle:
              </p>
              <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] space-y-1">
                <div>cd CaroGame</div>
                <div>npm ci</div>
                <div>npm run typecheck</div>
                <div>npm test</div>
                <div>npm run build</div>
              </div>
            </div>

            {/* Step 3 & 4 */}
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] space-y-3">
              <div className="font-bold text-[#202020] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0091ff]" />
                <span>2. Biên Dịch Lại Lõi Rust WebAssembly</span>
              </div>
              <p className="text-[#646464] font-sans text-[11px]">
                Biên dịch mã máy WebAssembly offline qua rustc/cargo 1.98.1 và wasm-pack 0.15.0:
              </p>
              <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] space-y-1">
                <div>cd CaroGame</div>
                <div>npm run build:wasm</div>
                <div>cargo test --manifest-path engine/Cargo.toml --locked --offline</div>
                <div>cat src/game/wasm/engine/provenance.json</div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] space-y-3">
              <div className="font-bold text-[#202020] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00c07a]" />
                <span>3. Biên Dịch Trang Thuyết Trình (present)</span>
              </div>
              <p className="text-[#646464] font-sans text-[11px]">
                Khởi chạy trang thuyết trình bảo vệ đồ án kèm engine Pyodide chạy Python trực tiếp:
              </p>
              <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] space-y-1">
                <div>cd present</div>
                <div>npm ci</div>
                <div>npm run build</div>
                <div>npm run dev -- --port 5174</div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] space-y-3">
              <div className="font-bold text-[#202020] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#e11d48]" />
                <span>4. Cấu Hình Cổng Cho Phiên Bảo Vệ Đồ Án</span>
              </div>
              <p className="text-[#646464] font-sans text-[11px]">
                Mở đồng thời 2 cổng dịch vụ cục bộ để hội đồng chấm đồ án thẩm định độc lập:
              </p>
              <div className="p-3 rounded-lg bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>• Bàn Cờ Đối Kháng:</span>
                  <span className="font-bold text-[#00c07a]">http://localhost:8443</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Báo Cáo Thuyết Trình:</span>
                  <span className="font-bold text-[#6647f0]">http://localhost:5174</span>
                </div>
                <div className="text-[10px] text-[#838383] pt-1 border-t border-[#e8e8e8]">
                  *Phiên bản cục bộ chứa đủ 6 mức AI và route Web Worker chuẩn hóa.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
