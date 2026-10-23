import React from "react"
import { CheckCircle2, Compass, Layers, Check } from "lucide-react"
import { Latex } from "./Latex"

export const ProjectOverview: React.FC = () => {
  return (
    <section id="overview" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6647f0]/10 border border-[#6647f0]/20 text-[#6647f0] text-xs font-bold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>Giai Đoạn Nền Tảng: Tuần 1 & Tuần 2</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
          Đặc Tả Hình Thức & Động Cơ Trò Chơi Cơ Bản
        </h2>
        <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
          Trước khi bước vào phân rã giao diện (Tuần 3) và trí tuệ nhân tạo (Tuần 4), hệ thống đã thiết lập chặt chẽ trên nền tảng toán học và kiểm thử tự động.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phase 1 Card */}
        <div className="clickup-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#f8f9fa] text-[#202020] border border-[#e8e8e8] text-xs font-mono font-bold">
                PHASE 1 (Tuần 1)
              </span>
              <span className="text-xs text-[#838383] font-mono">Rule Specification</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#090c1d] mb-2 tracking-tight">Đặc Tả Không Gian Trạng Thái & Luật Chơi</h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed mb-4">
              Xác lập ma trận bàn cờ Caro kích thước chuẩn <Latex>{"15 \\times 15"}</Latex>, điều kiện thắng <Latex>{"k = 5"}</Latex> quân liên tiếp không giới hạn hai đầu (Freestyle Gomoku).
            </p>

            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-xs text-[#202020] space-y-2 mb-4">
              <div className="text-[#838383] text-[11px] uppercase tracking-wider font-bold">Mô Hình Toán Học:</div>
              <div className="text-[#6647f0] font-bold">
                <Latex display>{"\\mathcal{S} = \\{-1, 0, 1\\}^{15 \\times 15}, \\quad |\\mathcal{A}(s)| = 225 - m"}</Latex>
              </div>
              <div className="text-[#646464] text-[11px]">
                Trong đó <Latex>{"m"}</Latex> là số nước đã đánh, <Latex>{"|\\mathcal{A}(s)|"}</Latex> là số ô trống còn lại trên bàn cờ.
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#646464]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                <span>Hoàn tất Đề cương nghiên cứu và danh mục thuật ngữ chuẩn (Caro, Gomoku, branching factor, ply).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                <span>Đặc tả hình thức Project Rule Profile và mô hình GameState bất biến.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Phase 2 Card */}
        <div className="clickup-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#f8f9fa] text-[#0091ff] border border-[#e8e8e8] text-xs font-mono font-bold">
                PHASE 2 (Tuần 2)
              </span>
              <span className="text-xs text-[#838383] font-mono">Engine & Raycasting</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#090c1d] mb-2 tracking-tight">Kiểm Tra Thắng Cục Local Raycasting O(1)</h3>
            <p className="text-[#646464] text-xs sm:text-sm leading-relaxed mb-4">
              Thay vì duyệt lại toàn bộ 225 ô trên bàn cờ sau mỗi nước đi (<Latex>{"O(N^2)"}</Latex>), thuật toán quét tia (Raycasting) chỉ kiểm tra 4 trục hướng xung quanh nước đi cuối cùng (<Latex>{"\\text{lastMove}"}</Latex>).
            </p>

            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] font-mono text-xs text-[#202020] space-y-2 mb-4">
              <div className="text-[#838383] text-[11px] uppercase tracking-wider font-bold">Véc-tơ Quét Tia 4 Trục:</div>
              <div className="text-[#0091ff] font-bold">
                <Latex display>{"\\vec{d} \\in \\{(0, 1), (1, 0), (1, 1), (1, -1)\\}"}</Latex>
              </div>
              <div className="text-[#646464] text-[11px]">
                Bán kính quét tối đa 4 ô mỗi phía <Latex>{"\\implies \\le 32"}</Latex> phép so khớp, đạt độ phức tạp thời gian thực <Latex>{"O(1)"}</Latex>.
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#646464]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                <span>Bộ unit test Vitest bao phủ 100% (19/19 test cases pass).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                <span>Logic cờ deterministic độc lập hoàn toàn với giao diện React/DOM.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
