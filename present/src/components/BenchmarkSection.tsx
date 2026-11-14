import React, { useState } from "react"
import { Gauge, ArrowRight, Table, Layers, Zap, Scale, CheckCircle2 } from "lucide-react"

interface Props {
  onOpenFigure: (id: string) => void
}

export const BenchmarkSection: React.FC<Props> = ({ onOpenFigure }) => {
  const [activeTab, setActiveTab] = useState<"table5_3" | "table5_1" | "table5_2">("table5_3")

  // Bảng 5.3: Đo đạc đối đầu Rust vs TS trên 10 test fixtures (Độ sâu 1..4)
  const table5_3_rows = [
    {
      depth: "Độ Sâu 1 (d = 1)",
      nodes: "45",
      rustTime: "0.0221 ms",
      rustKnps: "2,040.25",
      tsTime: "0.5383 ms",
      tsKnps: "83.59",
      speedup: "24.3x",
    },
    {
      depth: "Độ Sâu 2 (d = 2)",
      nodes: "609",
      rustTime: "0.3125 ms",
      rustKnps: "1,948.98",
      tsTime: "5.5795 ms",
      tsKnps: "109.15",
      speedup: "17.8x",
    },
    {
      depth: "Độ Sâu 3 (d = 3)",
      nodes: "16,184",
      rustTime: "9.0248 ms",
      rustKnps: "1,793.28",
      tsTime: "156.7846 ms",
      tsKnps: "103.22",
      speedup: "17.4x",
    },
    {
      depth: "Độ Sâu 4 (d = 4)",
      nodes: "496,790",
      rustTime: "285.4517 ms",
      rustKnps: "1,740.36",
      tsTime: "5,083.4518 ms",
      tsKnps: "97.73",
      speedup: "17.8x",
    },
  ]

  // Bảng 5.1: Thực nghiệm đối đầu trên Center Fixture (Depth 2, native engine)
  const table5_1_rows = [
    {
      config: "Minimax (Không sắp xếp)",
      nodes: "73",
      leaves: "64",
      cutoffs: "0",
      medianTime: "56,635 ns",
      rankingEvals: "0",
      impact: "Baseline chuẩn",
      reduction: "0.0% (Gốc)",
    },
    {
      config: "Alpha-Beta (Không sắp xếp)",
      nodes: "47",
      leaves: "38",
      cutoffs: "7",
      medianTime: "41,723 ns",
      rankingEvals: "264",
      impact: "Cắt tỉa 7 nhánh",
      reduction: "-35.62% Nodes",
    },
    {
      config: "Alpha-Beta + Move Ordering",
      nodes: "26",
      leaves: "17",
      cutoffs: "7",
      medianTime: "31,167 ns",
      rankingEvals: "264",
      impact: "Kích hoạt cutoff sớm",
      reduction: "-64.38% Nodes (-44.97% Thời gian)",
    },
  ]

  // Bảng 5.2: Thực nghiệm thế cờ cụm mở rộng (Clustered all-legal fixture, depth 2)
  const table5_2_rows = [
    {
      config: "Minimax (Thứ tự tự nhiên)",
      nodes: "48,842",
      leaves: "48,620",
      cutoffs: "0",
      medianTime: "69,252 µs",
      rankingEvals: "0",
      notes: "Duyệt vét cạn toàn bộ không gian",
    },
    {
      config: "Alpha-Beta (Thứ tự tự nhiên)",
      nodes: "10,939",
      leaves: "10,717",
      cutoffs: "218",
      medianTime: "16,442 µs",
      rankingEvals: "0",
      notes: "Tốc độ nhanh nhất: Giảm 77.6% node, giảm 76.3% thời gian",
    },
    {
      config: "Alpha-Beta + Move Ordering",
      nodes: "2,164",
      leaves: "1,942",
      cutoffs: "220",
      medianTime: "68,457 µs",
      rankingEvals: "48,841",
      notes: "Duyệt ít nút nhất (-95.6%), nhưng tốn thêm 48,841 phép ranking!",
    },
  ]

  return (
    <section id="results" className="py-24 px-4 bg-white max-w-6xl mx-auto border-b border-[#e8e8e8]">
      {/* Header */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00c07a]/10 border border-[#00c07a]/30 text-[#00c07a] text-xs font-bold uppercase tracking-wider mb-3">
          <Gauge className="w-3.5 h-3.5" />
          <span>Chương 5: Bảng Kết Quả Thực Nghiệm & Đo Đạc Thuật Toán Chuyên Sâu</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
          Ma Trận Thực Nghiệm & Đánh Đổi Học Thuật (Empirical Benchmarks)
        </h2>
        <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
          Tổng hợp kết quả đo đạc thực nghiệm từ Bảng 5.1, 5.2 và 5.3 trong Báo cáo 96 trang: Phân tích tăng tốc Rust vs TS, đối đầu Minimax vs Alpha-Beta và định lý đánh đổi chi phí sắp xếp (Ranking Trade-off).
        </p>
      </div>

      {/* Tab Switcher for 3 Tables */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 font-mono text-xs">
        <button
          onClick={() => setActiveTab("table5_3")}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold ${
            activeTab === "table5_3"
              ? "bg-[#090c1d] text-white border-[#090c1d] shadow-sm"
              : "bg-[#f8f9fa] text-[#646464] border-[#e8e8e8] hover:bg-[#e9ebf0]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#00c07a]" />
          <span>Bảng 5.3: Rust vs TypeScript (Độ Sâu 1..4)</span>
        </button>

        <button
          onClick={() => setActiveTab("table5_1")}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold ${
            activeTab === "table5_1"
              ? "bg-[#090c1d] text-white border-[#090c1d] shadow-sm"
              : "bg-[#f8f9fa] text-[#646464] border-[#e8e8e8] hover:bg-[#e9ebf0]"
          }`}
        >
          <Table className="w-3.5 h-3.5 text-[#0091ff]" />
          <span>Bảng 5.1: Thế Cờ Trung Tâm (Center Fixture)</span>
        </button>

        <button
          onClick={() => setActiveTab("table5_2")}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold ${
            activeTab === "table5_2"
              ? "bg-[#090c1d] text-white border-[#090c1d] shadow-sm"
              : "bg-[#f8f9fa] text-[#646464] border-[#e8e8e8] hover:bg-[#e9ebf0]"
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-[#6647f0]" />
          <span>Bảng 5.2: Đánh Đổi Ranking vs Traversal</span>
        </button>
      </div>

      {/* Tab 1 Content: Table 5.3 Rust vs TypeScript */}
      {activeTab === "table5_3" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
              <div className="text-[11px] font-mono font-bold text-[#838383] uppercase tracking-wider mb-1">
                Hệ Số Tăng Tốc Trung Bình
              </div>
              <div className="text-4xl font-extrabold text-[#0091ff] mb-2 font-display">17.8x – 24.3x</div>
              <p className="text-xs text-[#646464]">
                Tại độ sâu 4, TypeScript mất hơn 5.08 giây (treo UI), trong khi Rust chỉ mất 285ms!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
              <div className="text-[11px] font-mono font-bold text-[#838383] uppercase tracking-wider mb-1">
                Thông Lượng Xử Lý (Throughput)
              </div>
              <div className="text-4xl font-extrabold text-[#00c07a] mb-2 font-display">~2,000 kN/s</div>
              <p className="text-xs text-[#646464]">
                Rust duyệt xấp xỉ 2 triệu nút/giây, vượt trội hoàn toàn so với 97-109 kN/s của TypeScript.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
              <div className="text-[11px] font-mono font-bold text-[#838383] uppercase tracking-wider mb-1">
                Tiết Kiệm Bộ Nhớ (Zero Heap)
              </div>
              <div className="text-4xl font-extrabold text-[#6647f0] mb-2 font-display">Zero GC</div>
              <p className="text-xs text-[#646464]">
                Không cấp phát heap trong vòng lặp tìm kiếm, triệt tiêu hiện tượng Garbage Collection pauses.
              </p>
            </div>
          </div>

          {/* Benchmark Data Table */}
          <div className="clickup-card p-6 bg-white overflow-x-auto border border-[#e8e8e8]">
            <div className="text-xs font-mono font-bold text-[#202020] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Bảng 5.3: Historical native Rust and TypeScript/Node benchmark (Mục 5.5 Báo cáo)</span>
              <button
                onClick={() => onOpenFigure("rust_vs_ts_speedup")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] border border-[#d4d4d4] text-[#6647f0] font-bold text-xs transition-all"
              >
                <span>Soi Biểu Đồ & Phân Tích ↗</span>
              </button>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#e8e8e8] text-[#838383]">
                  <th className="py-3 px-3">Độ Sâu</th>
                  <th className="py-3 px-3">Số Nodes Duyệt</th>
                  <th className="py-3 px-3 text-[#0091ff] font-bold">Rust Native (ms)</th>
                  <th className="py-3 px-3 text-[#0091ff]">Thông Lượng Rust</th>
                  <th className="py-3 px-3 text-[#f43f5e] font-bold">TypeScript / Node (ms)</th>
                  <th className="py-3 px-3 text-[#f43f5e]">Thông Lượng TS</th>
                  <th className="py-3 px-3 text-[#00c07a] font-bold">Tốc Độ Tăng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e8]">
                {table5_3_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#202020]">{row.depth}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.nodes}</td>
                    <td className="py-3 px-3 text-[#0091ff] font-bold">{row.rustTime}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.rustKnps} kN/s</td>
                    <td className="py-3 px-3 text-[#f43f5e] font-bold">{row.tsTime}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.tsKnps} kN/s</td>
                    <td className="py-3 px-3 text-[#00c07a] font-bold text-sm">
                      {row.speedup}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2 Content: Table 5.1 Center Fixture Depth 2 */}
      {activeTab === "table5_1" && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
              <div className="text-[11px] font-mono font-bold text-[#838383] uppercase tracking-wider mb-1">
                Alpha-Beta Cắt Tỉa
              </div>
              <div className="text-4xl font-extrabold text-[#0091ff] mb-2 font-display">-35.62%</div>
              <p className="text-xs text-[#646464]">
                Giảm từ 73 nodes xuống 47 nodes nhờ 7 lần kích hoạt nhánh cắt tỉa Alpha-Beta.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
              <div className="text-[11px] font-mono font-bold text-[#838383] uppercase tracking-wider mb-1">
                Move Ordering Tối Ưu
              </div>
              <div className="text-4xl font-extrabold text-[#00c07a] mb-2 font-display">-64.38%</div>
              <p className="text-xs text-[#646464]">
                Khi sắp xếp nước đi theo Threat Score, số node duyệt chỉ còn 26 nodes (giảm gần 2/3)!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] text-center">
              <div className="text-[11px] font-mono font-bold text-[#838383] uppercase tracking-wider mb-1">
                Tiết Kiệm Thời Gian Thực Tế
              </div>
              <div className="text-4xl font-extrabold text-[#6647f0] mb-2 font-display">44.97%</div>
              <p className="text-xs text-[#646464]">
                Thời gian trung vị giảm từ 56.6 µs xuống 31.1 µs trên engine Rust 23/10.
              </p>
            </div>
          </div>

          <div className="clickup-card p-6 bg-white overflow-x-auto border border-[#e8e8e8]">
            <div className="text-xs font-mono font-bold text-[#202020] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Bảng 5.1: Native engine search on the center fixture at depth two (Mục 5.2 Báo cáo)</span>
              <span className="text-[11px] text-[#838383] font-mono font-normal">Center Fixture (x=7, y=7) • Depth = 2</span>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#e8e8e8] text-[#838383]">
                  <th className="py-3 px-3">Cấu Hình Thuật Toán</th>
                  <th className="py-3 px-3 text-[#090c1d] font-bold">Tổng Nodes</th>
                  <th className="py-3 px-3">Nodes Lá (Leaves)</th>
                  <th className="py-3 px-3 text-[#0091ff] font-bold">Số Lần Cutoff</th>
                  <th className="py-3 px-3 text-[#6647f0] font-bold">Thời Gian Trung Vị (ns)</th>
                  <th className="py-3 px-3 text-[#838383]">Phép Lượng Giá Ranking</th>
                  <th className="py-3 px-3 text-[#00c07a] font-bold">Hiệu Quả Giảm Tải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e8]">
                {table5_1_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#202020]">{row.config}</td>
                    <td className="py-3 px-3 font-bold text-[#090c1d]">{row.nodes}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.leaves}</td>
                    <td className="py-3 px-3 text-[#0091ff] font-bold">{row.cutoffs}</td>
                    <td className="py-3 px-3 text-[#6647f0] font-bold">{row.medianTime}</td>
                    <td className="py-3 px-3 text-[#838383]">{row.rankingEvals}</td>
                    <td className="py-3 px-3 text-[#00c07a] font-bold">{row.reduction}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] text-xs text-[#646464] leading-relaxed">
              <strong className="text-[#202020]">Kết luận từ Mục 5.2:</strong> So với Minimax (73 nút), Alpha-Beta tự nhiên giảm 35.62% số nút. Khi bổ sung Move Ordering, số nút giảm tiếp 44.68% (xuống 26 nút), giúp thời gian thực thi trung vị giảm 44.97%. Hai cấu hình Alpha-Beta đều thực hiện 264 phép tính ranking, khẳng định số nút đệ quy chỉ phản ánh một phần khối lượng tính toán.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Table 5.2 Clustered All-legal Fixture (The Tradeoff) */}
      {activeTab === "table5_2" && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] text-center">
              <div className="text-[11px] font-mono font-bold text-[#9f1239] uppercase tracking-wider mb-1">
                Minimax Vét Cạn
              </div>
              <div className="text-4xl font-extrabold text-[#e11d48] mb-2 font-display">48,842</div>
              <p className="text-xs text-[#881337]">
                Duyệt vét cạn 48,842 nodes và 48,620 lá, mất 69.2 ms trên thế cờ cụm mở rộng.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-center">
              <div className="text-[11px] font-mono font-bold text-[#166534] uppercase tracking-wider mb-1">
                Alpha-Beta Tự Nhiên
              </div>
              <div className="text-4xl font-extrabold text-[#16a34a] mb-2 font-display">16.4 ms</div>
              <p className="text-xs text-[#14532d]">
                Tối ưu nhất về thời gian (nhanh gấp 4.2 lần Minimax) với 218 lần cắt nhánh!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] text-center">
              <div className="text-[11px] font-mono font-bold text-[#1e40af] uppercase tracking-wider mb-1">
                Ordered: Nghịch Lý Ranking
              </div>
              <div className="text-4xl font-extrabold text-[#2563eb] mb-2 font-display">2,164 nodes</div>
              <p className="text-xs text-[#1d4ed8]">
                Duyệt ít nút nhất (-95.6%), nhưng tốn thêm 48,841 phép ranking khiến thời gian tăng lên 68.4 ms!
              </p>
            </div>
          </div>

          <div className="clickup-card p-6 bg-white overflow-x-auto border border-[#e8e8e8]">
            <div className="text-xs font-mono font-bold text-[#202020] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Bảng 5.2: Native reference search on the clustered fixture at depth two (Mục 5.4.1 Báo cáo)</span>
              <span className="text-[11px] text-[#838383] font-mono font-normal">Clustered, All-Legal moves • Depth = 2</span>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#e8e8e8] text-[#838383]">
                  <th className="py-3 px-3">Cấu Hình Tìm Kiếm</th>
                  <th className="py-3 px-3 text-[#090c1d] font-bold">Số Nodes</th>
                  <th className="py-3 px-3">Số Nodes Lá</th>
                  <th className="py-3 px-3 text-[#0091ff] font-bold">Số Lần Cutoff</th>
                  <th className="py-3 px-3 text-[#6647f0] font-bold">Thời Gian Trung Vị (µs)</th>
                  <th className="py-3 px-3 text-[#f43f5e] font-bold">Chi Phí Ranking Phụ</th>
                  <th className="py-3 px-3 text-[#202020]">Đánh Giá Kỹ Thuật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e8]">
                {table5_2_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#202020]">{row.config}</td>
                    <td className="py-3 px-3 font-bold text-[#090c1d]">{row.nodes}</td>
                    <td className="py-3 px-3 text-[#646464]">{row.leaves}</td>
                    <td className="py-3 px-3 text-[#0091ff] font-bold">{row.cutoffs}</td>
                    <td className="py-3 px-3 text-[#6647f0] font-bold">{row.medianTime}</td>
                    <td className="py-3 px-3 text-[#f43f5e] font-bold">{row.rankingEvals}</td>
                    <td className="py-3 px-3 text-xs text-[#646464]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e40af] leading-relaxed">
              <strong className="text-[#1e3a8a]">Định Lý Đánh Đổi Học Thuật (Ranking Trade-off - Mục 5.4.1):</strong> Thuật toán Alpha-Beta có Move Ordering chỉ duyệt 2,164 nút (giảm 95.6% so với Minimax), nhưng lại mất 68,457 µs (gần bằng thời gian duyệt của Minimax) vì phải thực hiện thêm <strong>48,841 phép đánh giá ranking</strong> tại các nút nhánh. Số nút đệ quy ít hơn không đồng nghĩa với thời gian thực thi thấp hơn nếu chi phí sắp xếp ứng viên vượt quá lợi ích cắt tỉa!
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
