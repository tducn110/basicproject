import React from "react"
import { Gauge, ArrowRight, ExternalLink } from "lucide-react"

interface Props {
  onOpenFigure: (id: string) => void
}

export const BenchmarkSection: React.FC<Props> = ({ onOpenFigure }) => {
  const benchmarkRows = [
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

  return (
    <section id="benchmark" className="py-24 px-4 bg-white max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0091ff]/10 border border-[#0091ff]/20 text-[#0091ff] text-xs font-bold uppercase tracking-wider mb-3">
          <Gauge className="w-3.5 h-3.5" />
          <span>Thực Nghiệm Đo Đạc Hiệu Năng Chuẩn</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
          So Sánh Định Lượng: Rust Native vs TypeScript
        </h2>
        <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
          Đo đạc thực nghiệm trên cùng 10 thế cờ chuẩn (Test Fixtures) từ độ sâu 1 đến độ sâu 4. Minh chứng lý do kiến trúc quyết định sử dụng Rust WebAssembly làm lõi tính toán đối kháng.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
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
      <div className="clickup-card p-6 bg-white overflow-x-auto">
        <div className="text-xs font-mono font-bold text-[#202020] uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Bảng Dữ Liệu Chi Tiết (docs/benchmark/results/benchmark_data.json)</span>
          <button
            onClick={() => onOpenFigure("rust_vs_ts_speedup")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] border border-[#d4d4d4] text-[#6647f0] font-bold text-xs transition-all"
          >
            <span>Soi Biểu Đồ & Phân Tích Ưu/Nhược Điểm ↗</span>
          </button>
        </div>

        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#e8e8e8] text-[#838383]">
              <th className="py-3 px-3">Độ Sâu</th>
              <th className="py-3 px-3">Số Nodes Duyệt</th>
              <th className="py-3 px-3 text-[#0091ff] font-bold">Rust (ms)</th>
              <th className="py-3 px-3 text-[#0091ff]">Rust Throughput</th>
              <th className="py-3 px-3 text-[#f43f5e] font-bold">TypeScript (ms)</th>
              <th className="py-3 px-3 text-[#f43f5e]">TS Throughput</th>
              <th className="py-3 px-3 text-[#00c07a] font-bold">Tăng Tốc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e8e8]">
            {benchmarkRows.map((row, idx) => (
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
    </section>
  )
}
