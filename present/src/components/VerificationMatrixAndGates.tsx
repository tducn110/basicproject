import React, { useState } from "react"
import { ShieldCheck, CheckCircle2, FileCheck, Layers, Cpu, Smartphone, Database, Terminal, Check } from "lucide-react"

export const VerificationMatrixAndGates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"scenarios" | "gates">("scenarios")

  const scenarios = [
    {
      id: "S01",
      name: "Nước Đi Hợp Lệ (Legal Placement)",
      input: "Chạm/nhấp vào ô trống hợp lệ trong bàn cờ 15x15 khi đang đến lượt",
      expected: "Ghi nhận quân cờ, tăng history +1, cập nhật kiểm tra thắng, chuyển lượt tiếp theo.",
      status: "VERIFIED",
    },
    {
      id: "S02",
      name: "Từ Chối Nước Đi Lỗi (Rejected Placement)",
      input: "Nhấp vào ô đã có quân cờ hoặc tọa độ ngoài biên giới hạn [0..14]",
      expected: "Không đột biến trạng thái bàn cờ, giữ nguyên lịch sử và không đổi lượt chơi.",
      status: "VERIFIED",
    },
    {
      id: "S03",
      name: "Ưu Tiên Thắng Trước Hòa (Last-Cell Win)",
      input: "Đặt nước cờ cuối cùng hoàn thành chuỗi 5 quân khi bàn cờ sắp đầy",
      expected: "Hệ thống ưu tiên tuyên bố THẮNG CUỘC trước khi kiểm tra điều kiện HÒA cờ.",
      status: "VERIFIED",
    },
    {
      id: "S04",
      name: "Hủy Kết Quả AI Lỗi Thời (Delayed AI Response)",
      input: "Yêu cầu AI tính toán, người chơi bấm New Game/Đổi hiệp trước khi AI trả về",
      expected: "Kết quả AI cũ bị vô hiệu hóa qua Round Token; không commit đè lên ván mới.",
      status: "VERIFIED",
    },
    {
      id: "S05",
      name: "Hoàn Tác Khi Đang Tính (Undo Before Reply)",
      input: "Người chơi đặt quân rồi bấm Undo ngay trong lúc Worker đang suy nghĩ",
      expected: "Request bị hủy ngay lập tức; bàn cờ phục hồi về lượt trước mà không bị lag/treo.",
      status: "VERIFIED",
    },
    {
      id: "S06",
      name: "Hoàn Tác 2 Nước Trong PvE (Undo After Reply)",
      input: "Người chơi bấm Undo sau khi cả người và Bot AI đã đi xong lượt",
      expected: "Hoàn tác lùi đúng 2 plies liên tiếp (thu hồi cả nước của AI và nước của người chơi).",
      status: "VERIFIED",
    },
    {
      id: "S07",
      name: "Đổi Chế Độ Giữa Trận (Mode Switch During Search)",
      input: "Đang chơi với Bot (PvE) chuyển sang 2 Người Chơi (PvP) khi AI đang chạy",
      expected: "Vô hiệu hóa tiến trình Worker, chuyển giao quyền kiểm soát bàn cờ sang chế độ PvP.",
      status: "VERIFIED",
    },
    {
      id: "S08",
      name: "Bất Biến Zero Heap (Zero-Copy Stack Allocation)",
      input: "Duyệt hàng triệu nút Minimax/Alpha-Beta đệ quy liên tục",
      expected: "Không cấp phát heap mới (0 bytes heap leak); triệt tiêu hoàn toàn GC pauses.",
      status: "VERIFIED",
    },
    {
      id: "S09",
      name: "Tương Thích Màn Hình Di Động (Responsive Viewport)",
      input: "Xoay màn hình, zoom camera hoặc thay đổi kích thước viewport trình duyệt",
      expected: "Ma trận nghịch đảo ma trận PixiJS camera ánh xạ tọa độ pixel trỏ đúng ô cờ.",
      status: "VERIFIED",
    },
    {
      id: "S10",
      name: "Toàn Vẹn Dữ Liệu Đo Đạc (Telemetry Consistency)",
      input: "Gói tin phản hồi IPC từ WebAssembly Worker gửi về Main Thread",
      expected: "Bảo toàn số nguyên tọa độ (x, y), độ sâu duyệt depth, số nodes và thời gian latency.",
      status: "VERIFIED",
    },
  ]

  const gates = [
    {
      gate: "G1",
      title: "Bất Biến Bàn Cờ & Quét Tia Thắng O(1)",
      scope: "Board invariant, apply/undo in-place, full/empty/bounds checks",
      evidence: "16 unit tests của Board trong engine_verification.json; bảo toàn 240 bytes stack.",
      status: "VERIFIED (100% PASS)",
      badge: "G1_board_tests.log",
    },
    {
      gate: "G2",
      title: "Chính Sách Sinh Ứng Viên Chebyshev & Heuristic",
      scope: "Candidate policy r <= 2, tách biệt bộ sinh Candidate khỏi bộ Evaluator",
      evidence: "5 candidate tests + 5 evaluator tests PASS; chứng minh cắt giảm 72.39% không gian.",
      status: "VERIFIED (100% PASS)",
      badge: "G2_policy_tests.log",
    },
    {
      gate: "G3",
      title: "Tính Đúng Đắn Đối Hàng Minimax vs Alpha-Beta",
      scope: "MM/AB equivalence, move ordering, tactical recall, state restore",
      evidence: "816 dòng dữ liệu đối chứng, 408 cặp MM/AB giống hệt điểm số, 820 lần kiểm tra restore.",
      status: "VERIFIED (816 Rows)",
      badge: "G3_native_parity.csv",
    },
    {
      gate: "G4",
      title: "Build WebAssembly & Kiểm Định Trình Duyệt Thật",
      scope: "WASM compilation, SHA256 build hash, Worker lifecycle & error recovery",
      evidence: "18 kịch bản WASM thật, 291 plies trên 8 lịch sử ván cờ, 6 tiers trên Chrome Headless.",
      status: "VERIFIED (291 Plies)",
      badge: "wasm_ts_parity.json",
    },
    {
      gate: "G5",
      title: "Kiểm Thử Toàn Diện Ứng Dụng Web & 6 Cấp Độ AI",
      scope: "59 Vitest frontend tests, typecheck tsc --noEmit, Vite production build",
      evidence: "Toàn bộ 59 test frontend PASS; kiểm tra 3 kích thước viewport và responsive HUD.",
      status: "VERIFIED (59 Tests)",
      badge: "G5_frontend_tests.log",
    },
    {
      gate: "G6",
      title: "Toán Học, Chứng Minh Hình Thức & Chuẩn Mực Báo Cáo",
      scope: "Đồng bộ hóa toán học, pseudocode, IMRaD thesis, worked example 8-ply",
      evidence: "Báo cáo 96 trang, 53 tài liệu tham khảo chuẩn IEEE/IMRaD, 20 biểu đồ, 8 bảng dữ liệu.",
      status: "VERIFIED (96 Pages)",
      badge: "G6_thesis_imrad.pdf",
    },
  ]

  return (
    <section id="verification" className="py-24 px-4 bg-white max-w-6xl mx-auto border-b border-[#e8e8e8]">
      {/* Header */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0091ff]/10 border border-[#0091ff]/30 text-[#0091ff] text-xs font-bold uppercase tracking-wider mb-3">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Bảng 3.2 & Phụ Lục B: Kiểm Định Nghiệm Thu & Cổng Bằng Chứng Học Thuật</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
          Ma Trận Nghiệm Thu 10 Kịch Bản & Cổng Bằng Chứng G1–G6
        </h2>
        <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
          Minh chứng chất lượng kỹ nghệ phần mềm và tính trung thực khoa học: 10 kịch bản kiểm thử toàn diện khả năng chịu lỗi (Table 3.2) và 6 Cổng kiểm soát bằng chứng thực nghiệm (Table B.1).
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-3 mb-10 font-mono text-xs">
        <button
          onClick={() => setActiveTab("scenarios")}
          className={`px-5 py-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold ${
            activeTab === "scenarios"
              ? "bg-[#090c1d] text-white border-[#090c1d] shadow-sm"
              : "bg-[#f8f9fa] text-[#646464] border-[#e8e8e8] hover:bg-[#e9ebf0]"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#00c07a]" />
          <span>Bảng 3.2: 10 Kịch Bản Nghiệm Thu (S01–S10)</span>
        </button>

        <button
          onClick={() => setActiveTab("gates")}
          className={`px-5 py-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold ${
            activeTab === "gates"
              ? "bg-[#090c1d] text-white border-[#090c1d] shadow-sm"
              : "bg-[#f8f9fa] text-[#646464] border-[#e8e8e8] hover:bg-[#e9ebf0]"
          }`}
        >
          <Layers className="w-4 h-4 text-[#0091ff]" />
          <span>Phụ Lục B: Sáu Cổng Bằng Chứng (G1–G6)</span>
        </button>
      </div>

      {/* Tab 1: 10 Verification Scenarios (Table 3.2) */}
      {activeTab === "scenarios" && (
        <div className="clickup-card p-6 bg-white border border-[#e8e8e8] overflow-x-auto animate-fadeIn">
          <div className="text-xs font-mono font-bold text-[#202020] uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Bảng 3.2: Verification scenarios and expected outcomes (Mục 3.9 Báo cáo)</span>
            <span className="text-[11px] text-[#00c07a] font-mono font-bold">10/10 Scenarios VERIFIED</span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#e8e8e8] text-[#838383]">
                <th className="py-3 px-3 w-16">Mã</th>
                <th className="py-3 px-3 w-48">Kịch Bản Kiểm Thử</th>
                <th className="py-3 px-3">Chuỗi Sự Kiện / Input Đầu Vào</th>
                <th className="py-3 px-3">Kết Quả Nghiệm Thu Kỳ Vọng</th>
                <th className="py-3 px-3 w-28 text-center text-[#00c07a]">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {scenarios.map((row) => (
                <tr key={row.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#090c1d]">{row.id}</td>
                  <td className="py-3 px-3 font-bold text-[#202020]">{row.name}</td>
                  <td className="py-3 px-3 text-[#646464]">{row.input}</td>
                  <td className="py-3 px-3 text-[#202020]">{row.expected}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: 6 Verification Gates (Appendix B - Table B.1) */}
      {activeTab === "gates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {gates.map((g) => (
            <div key={g.gate} className="clickup-card p-6 bg-white border border-[#e8e8e8] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e8e8e8]">
                  <span className="px-2.5 py-1 rounded-lg bg-[#090c1d] text-white font-mono font-bold text-xs">
                    CỔNG {g.gate}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#f8f9fa] border border-[#e8e8e8] text-[#0091ff] font-bold">
                    {g.badge}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#090c1d] mb-2">{g.title}</h3>
                <div className="text-xs text-[#838383] font-mono mb-3">{g.scope}</div>
                <p className="text-xs text-[#646464] leading-relaxed mb-4">{g.evidence}</p>
              </div>

              <div className="pt-3 border-t border-[#e8e8e8] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#838383]">Kiểm định học thuật:</span>
                <span className="text-xs font-mono font-bold text-[#00c07a] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {g.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
