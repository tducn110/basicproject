import React from "react"
import { Calendar, CheckCircle2, Circle, GitCommit } from "lucide-react"

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
        "Triển khai Production lên Vercel: carogame-five.vercel.app",
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
        <div className="clickup-card p-6 bg-white">
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
      </div>
    </section>
  )
}
