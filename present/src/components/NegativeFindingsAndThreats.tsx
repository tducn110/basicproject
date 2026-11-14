import React, { useState } from "react"
import { AlertTriangle, ShieldAlert, Clock, RefreshCw, CheckCircle2, ShieldCheck, Scale, FileText } from "lucide-react"
import { Latex, MathText } from "./Latex"

export const NegativeFindingsAndThreats: React.FC = () => {
  const [activeProbe, setActiveProbe] = useState<"cap_loss" | "cache_scope" | "budget_abort">("cap_loss")

  return (
    <section id="pitfalls" className="py-24 px-4 bg-[#f8f9fa] border-b border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mục 5.4.2 & 5.7: Nghiên Cứu Phản Biện & Đánh Giá Giới Hạn Học Thuật</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Bẫy Giải Thuật (Negative Findings) & Giới Hạn Khoa Học
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Điểm phân biệt của đồ án chuẩn IMRaD: Công khai 3 thử nghiệm phản biện (Negative Probes) về bẫy cắt nhánh, ô nhiễm bảng băm và gián đoạn thời gian, cùng phân tích rủi ro giá trị nghiên cứu (Threats to Validity).
          </p>
        </div>

        {/* 3 Negative Probes Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <button
            onClick={() => setActiveProbe("cap_loss")}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeProbe === "cap_loss"
                ? "bg-white border-[#f43f5e] shadow-sm text-[#090c1d]"
                : "bg-white/60 border-[#e8e8e8] text-[#646464] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#f43f5e]">BẪY 01: cap_loss.json</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fff1f2] text-[#9f1239] font-bold">Candidate Cap</span>
            </div>
            <div className="font-bold text-[#202020] mb-1">Rơi Nước Thắng Do Giới Hạn Cứng (Hard Cap)</div>
            <p className="text-[11px] text-[#838383] leading-relaxed">
              Cắt tỉa ngây thơ theo số lượng cố định làm rơi mất nước thắng sát cuộc ngay trước mắt.
            </p>
          </button>

          <button
            onClick={() => setActiveProbe("cache_scope")}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeProbe === "cache_scope"
                ? "bg-white border-[#f43f5e] shadow-sm text-[#090c1d]"
                : "bg-white/60 border-[#e8e8e8] text-[#646464] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#f43f5e]">BẪY 02: cache_scope.json</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fff1f2] text-[#9f1239] font-bold">Zobrist TT</span>
            </div>
            <div className="font-bold text-[#202020] mb-1">Ô Nhiễm Bảng Chuyển Vị Khi Đổi Ngữ Cảnh</div>
            <p className="text-[11px] text-[#838383] leading-relaxed">
              Tái sử dụng hash Zobrist mà bỏ qua lượt đi hoặc góc nhìn khiến bot chọn nước đi sai lầm.
            </p>
          </button>

          <button
            onClick={() => setActiveProbe("budget_abort")}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeProbe === "budget_abort"
                ? "bg-white border-[#f43f5e] shadow-sm text-[#090c1d]"
                : "bg-white/60 border-[#e8e8e8] text-[#646464] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#f43f5e]">BẪY 03: budget_abort.json</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fff1f2] text-[#9f1239] font-bold">Iterative Deepening</span>
            </div>
            <div className="font-bold text-[#202020] mb-1">Cắt Ngang Tìm Kiếm Do Quá Ngân Sách</div>
            <p className="text-[11px] text-[#838383] leading-relaxed">
              Xử lý timeout và cơ chế hoàn tác an toàn về kết quả tốt nhất của độ sâu d - 1 trước đó.
            </p>
          </button>
        </div>

        {/* Detail Panel of Selected Probe */}
        <div className="clickup-card p-6 sm:p-8 bg-white border border-[#e8e8e8]">
          {activeProbe === "cap_loss" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8e8]">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f43f5e]">
                    Hồ sơ thực nghiệm: research/week_05_09/results/cap_loss.json
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight mt-1">
                    Hiện Tượng Cắt Tỉa Làm Rơi Nước Sát Cuộc (Tactical Loss In Hard Cap)
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] font-bold shrink-0 self-start sm:self-auto">
                  Khắc Phục: Soft Tactical Cap
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3] space-y-3">
                  <div className="font-bold text-[#9f1239] text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hiện tượng quan sát trong cap_loss.json:</span>
                  </div>
                  <p className="text-[#881337] leading-relaxed">
                    <MathText text="Khi áp dụng thuật toán cắt cứng $K$ ứng viên (ví dụ $K=5$ theo thứ tự đọc ma trận ngây thơ), ô cờ tạo nước thắng 5 quân (Win Move) nằm ở cuối danh sách tọa độ đã bị loại bỏ hoàn toàn trước khi đi vào cây Minimax." />
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-[#fecdd3] font-mono text-[11px] text-[#9f1239]">
                    Raw Candidates: 225 ô → Hard Cap (K=5) → Mất ô (6, 7) thắng cuộc!
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-3">
                  <div className="font-bold text-[#166534] text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                    <span>Giải pháp khắc phục trong CaroGame:</span>
                  </div>
                  <p className="text-[#14532d] leading-relaxed">
                    Xây dựng cơ chế <strong>Soft Tactical Cap</strong>: <MathText text="Toàn bộ tập nước đi chiến thuật $P = W_p \cup W_o$ (ô thắng ngay của bot hoặc ô chặn đối thủ) bắt buộc phải được bảo vệ tuyệt đối trước khi áp dụng cận $K$:" />
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-[#bbf7d0] font-mono text-[11px] text-[#14532d] text-center">
                    <Latex display>{`K_{\\text{retained}} = \\max\\left(K_{\\text{nominal}}, \\,|W_p \\cup W_o|\\right)`}</Latex>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeProbe === "cache_scope" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8e8]">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f43f5e]">
                    Hồ sơ thực nghiệm: research/week_05_09/results/cache_scope_probe.json
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight mt-1">
                    Hiện Tượng Ô Nhiễm Ngữ Cảnh Bảng Chuyển Vị (Context Stale Cache)
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] font-bold shrink-0 self-start sm:self-auto">
                  Khắc Phục: Context-Bound Hashing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3] space-y-3">
                  <div className="font-bold text-[#9f1239] text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hiện tượng quan sát trong cache_scope_probe.json:</span>
                  </div>
                  <p className="text-[#881337] leading-relaxed">
                    <MathText text="Nếu chỉ băm trạng thái bàn cờ thuần túy mà bỏ qua bên đi tiếp (Side to Move) hoặc luật cờ, giá trị cất giữ $V(s)$ của lượt MAX có thể bị đọc nhầm cho lượt MIN của một nhánh khác có cùng cấu hình quân cờ." />
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-[#fecdd3] font-mono text-[11px] text-[#9f1239]">
                    Lỗi: Hash(B) không chứa Turn Key → Đọc nhầm điểm Max thành Min!
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-3">
                  <div className="font-bold text-[#166534] text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                    <span>Giải pháp khắc phục trong CaroGame:</span>
                  </div>
                  <p className="text-[#14532d] leading-relaxed">
                    <MathText text="Mã băm Zobrist 64-bit bắt buộc phải XOR thêm khóa chuyển lượt ngẫu nhiên $Z_{\text{turn}}$ mỗi khi tráo đổi quyền đi, đồng thời cất giữ cờ chặn cận (Exact, Lowerbound, Upperbound) và độ sâu tương ứng:" />
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-[#bbf7d0] font-mono text-[11px] text-[#14532d] text-center">
                    <Latex display>{`h(s) = \\left( \\bigoplus_{i=0}^{224} Z[i][p_i] \\right) \\oplus Z_{\\text{turn}}`}</Latex>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeProbe === "budget_abort" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8e8]">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f43f5e]">
                    Hồ sơ thực nghiệm: research/week_05_09/results/budget_abort.json
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight mt-1">
                    Cơ Chế Hủy Tìm Kiếm Có Kiểm Soát (Time Budget Interruption & Fallback)
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] font-bold shrink-0 self-start sm:self-auto">
                  Khắc Phục: Completed-Depth Rollback
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3] space-y-3">
                  <div className="font-bold text-[#9f1239] text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hiện tượng quan sát trong budget_abort.json:</span>
                  </div>
                  <p className="text-[#881337] leading-relaxed">
                    <MathText text="Khi duyệt sâu dần (Iterative Deepening), nếu quá 500ms ở độ sâu $d=4$, thuật toán bị ngắt cưỡng bức giữa chừng. Nếu lấy kết quả của tầng $d$ dở dang, nước đi được chọn có thể hoàn toàn sai lệch vì chỉ mới duyệt được một phần cây con." />
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-[#fecdd3] font-mono text-[11px] text-[#9f1239]">
                    Nguy cơ: Deadline timeout tại d=4 → Cây duyệt dở dang trả về nước đi thiên lệch!
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-3">
                  <div className="font-bold text-[#166534] text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                    <span>Giải pháp khắc phục trong CaroGame:</span>
                  </div>
                  <p className="text-[#14532d] leading-relaxed">
                    Hệ thống đặt biến cờ `aborted: bool`. <MathText text="Khi vượt quá `deadline`, lập tức hủy kết quả tầng $d$, an toàn quay lui và trả về nước đi tối ưu đã được nghiệm thu trọn vẹn ở độ sâu $d-1$ trước đó:" />
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-[#bbf7d0] font-mono text-[11px] text-[#14532d]">
                    <code>if aborted: return best_move_completed_at_depth(d - 1)</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5.7: Threats to Validity Analysis Card */}
        <div className="clickup-card p-6 sm:p-8 bg-white border border-[#e8e8e8] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8e8]">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6647f0] mb-1">
                Mục 5.7 Trong Báo Cáo
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#090c1d] tracking-tight">
                Đánh Giá Rủi Ro Giá Trị Nghiên Cứu (Threats to Validity)
              </h3>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold shrink-0 self-start sm:self-auto">
              Chuẩn Mực Học Thuật VNUK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-[#646464]">
            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
              <div className="font-bold text-[#090c1d] text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#6647f0]" />
                <span>1. Internal Validity (Tính Hợp Lệ Nội Tại)</span>
              </div>
              <p>
                Mọi so sánh hiệu năng giữa Minimax, Alpha-Beta và Move Ordering bắt buộc phải cố định cùng thế cờ, cùng độ sâu, cùng hàm lượng giá và cùng tập ứng viên. Nếu không, sự sụt giảm số nút có thể do thuật toán đang duyệt một cây con khác hoàn toàn.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
              <div className="font-bold text-[#090c1d] text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0091ff]" />
                <span>2. Measurement Validity (Tính Hợp Lệ Đo Lường)</span>
              </div>
              <p>
                Tách biệt rạch ròi 3 tầng đo lường: Thời gian CPU native (std::time::Instant), thời gian WebAssembly Worker IPC (postMessage boundary), và chu kỳ render khung hình 16.6ms của trình duyệt. Không gộp chung đo đạc micro-benchmark vào FPS của màn hình.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
              <div className="font-bold text-[#090c1d] text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00c07a]" />
                <span>3. External Validity (Khả Năng Khái Quát Hóa)</span>
              </div>
              <p>
                Tập test fixtures và 100 ván đấu thực nghiệm đại diện cho các hình thế kinh điển của cờ Freestyle Gomoku 15x15. Báo cáo trung thực ghi nhận các giới hạn khi mở rộng sang luật cờ Renju (có nước cấm 3-3, 4-4) hoặc kích thước bàn cờ vô hạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
