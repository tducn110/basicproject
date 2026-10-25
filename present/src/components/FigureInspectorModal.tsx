import React, { useState, useEffect } from "react"
import { 
  X, 
  Copy, 
  Check, 
  LayoutGrid, 
  Columns, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Code2, 
  Calculator, 
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move
} from "lucide-react"
import { Latex } from "./Latex"
import { soundManager } from "../utils/audio"

export interface FigureDetail {
  id: string
  title: string
  badge: string
  imageSrc: string
  imageCaption: string
  sourceFile: string
  mathLatex: string
  mathExplanation: string
  algorithmSteps: string[]
  scriptCode: string
  language: string
  computeMechanism: {
    timeComplexity: string
    spaceComplexity: string
    memoryProfile: string
    invariant: string
  }
  goods: {
    title: string
    detail: string
    metric?: string
  }[]
  bads: {
    title: string
    detail: string
    mitigation?: string
  }[]
}

interface Props {
  figure: FigureDetail | null
  onClose: () => void
}

export const FigureInspectorModal: React.FC<Props> = ({ figure, onClose }) => {
  const [layoutMode, setLayoutMode] = useState<"side-by-side" | "stacked">("side-by-side")
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsDragging(false)
  }, [figure?.id])

  if (!figure) return null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(figure.scriptCode)
    setCopied(true)
    soundManager.playClick()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleZoomIn = () => {
    soundManager.playClick()
    setZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))))
  }

  const handleZoomOut = () => {
    soundManager.playClick()
    setZoom((prev) => {
      const next = Math.max(0.75, Number((prev - 0.25).toFixed(2)))
      if (next <= 1) setPan({ x: 0, y: 0 })
      return next
    })
  }

  const handleResetZoom = () => {
    soundManager.playClick()
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(3.5, Number((prev + 0.15).toFixed(2))))
    } else if (e.deltaY > 0) {
      setZoom((prev) => {
        const next = Math.max(0.75, Number((prev - 0.15).toFixed(2)))
        if (next <= 1) setPan({ x: 0, y: 0 })
        return next
      })
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1) return
    const touch = e.touches[0]
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white text-[#202020] rounded-2xl border border-[#e8e8e8] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#e8e8e8] bg-[#f8f9fa] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#6647f0]/10 text-[#6647f0] border border-[#6647f0]/20">
              {figure.badge}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-[#202020] tracking-tight">
              {figure.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Layout Toggle */}
            <div className="hidden sm:flex items-center bg-[#e8e8e8] p-0.5 rounded-full">
              <button
                onClick={() => {
                  soundManager.playClick()
                  setLayoutMode("side-by-side")
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  layoutMode === "side-by-side"
                    ? "bg-white text-[#202020] shadow-sm"
                    : "text-[#646464] hover:text-[#202020]"
                }`}
                title="Bố cục 2 Cột (Ảnh Trái - Script Phải)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>2 Cột</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playClick()
                  setLayoutMode("stacked")
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  layoutMode === "stacked"
                    ? "bg-white text-[#202020] shadow-sm"
                    : "text-[#646464] hover:text-[#202020]"
                }`}
                title="Bố cục Xếp Tầng (Ảnh Trên - Script Dưới)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Xếp Tầng</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                soundManager.playClick()
                onClose()
              }}
              className="w-8 h-8 rounded-full bg-white border border-[#e8e8e8] hover:bg-[#e9ebf0] text-[#646464] hover:text-[#202020] flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* Main Visual & Script Container */}
          <div className={layoutMode === "side-by-side" ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "space-y-6"}>
            {/* Visual Image Section with Interactive Zoom & Pan (Strictly Contained within Frame) */}
            <div className={layoutMode === "side-by-side" ? "lg:col-span-6 space-y-3" : "space-y-3"}>
              <div 
                className="relative rounded-2xl overflow-hidden border border-[#e8e8e8] bg-[#f8f9fa] h-[400px] sm:h-[460px] flex items-center justify-center select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                style={{
                  cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                }}
              >
                {/* Image strictly contained and transformed inside this frame */}
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={figure.imageSrc}
                    alt={figure.title}
                    className="max-w-full max-h-full object-contain rounded-lg p-2"
                    draggable={false}
                  />
                </div>

                {/* Floating Zoom & Pan Controls Toolbar (ClickUp 9999px Pill style) */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 p-1 rounded-full bg-white/95 backdrop-blur-md border border-[#d4d4d4] text-[#202020] text-xs font-mono">
                  {/* Zoom Out Button */}
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.75}
                    title="Thu nhỏ ảnh (-)"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e9ebf0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Thu nhỏ ảnh"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-[#202020]" />
                  </button>

                  {/* Current Zoom Percentage Pill */}
                  <button
                    onClick={handleResetZoom}
                    title="Nhấn để reset về 100%"
                    className="px-2.5 py-0.5 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] text-[11px] font-bold text-[#6647f0] border border-[#e8e8e8] transition-all"
                  >
                    {Math.round(zoom * 100)}%
                  </button>

                  {/* Zoom In Button */}
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3.5}
                    title="Phóng to ảnh (+)"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e9ebf0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Phóng to ảnh"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#202020]" />
                  </button>

                  {/* Reset Button (active if zoom !== 1 or pan !== 0) */}
                  {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
                    <button
                      onClick={handleResetZoom}
                      title="Đặt lại ảnh về ban đầu (100%)"
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e9ebf0] text-[#838383] hover:text-[#202020] transition-all"
                      aria-label="Reset zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Drag Guidance Toast when Zoomed */}
                {zoom > 1 && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202020]/80 backdrop-blur-md text-white text-[11px] font-sans font-medium pointer-events-none animate-fadeIn">
                    <Move className="w-3 h-3 text-[#6ee7b7]" />
                    <span>Kéo chuột để di chuyển ảnh</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-[#646464] leading-relaxed flex items-center justify-between px-1">
                <span>{figure.imageCaption}</span>
                <span className="font-mono text-[11px] text-[#838383]">File: {figure.sourceFile}</span>
              </div>
            </div>

            {/* Script & Mathematical Model Section */}
            <div className={layoutMode === "side-by-side" ? "lg:col-span-6 space-y-4" : "space-y-4"}>
              {/* Mathematical Formulation Card */}
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8]">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold font-mono uppercase tracking-wider text-[#6647f0]">
                  <Calculator className="w-4 h-4" />
                  <span>Mô Hình Toán Học & Đặc Tả Hình Thức</span>
                </div>
                <div className="py-2 px-3 rounded-lg bg-white border border-[#e8e8e8] text-center my-2 text-[#202020]">
                  <Latex display>{figure.mathLatex}</Latex>
                </div>
                <p className="text-xs text-[#646464] leading-relaxed mt-2">
                  {figure.mathExplanation}
                </p>
              </div>

              {/* Underlying Script Code */}
              <div className="rounded-xl border border-[#e8e8e8] bg-white text-[#202020] overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-[#f8f9fa] border-b border-[#e8e8e8] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#0091ff]" />
                    <span className="text-[#202020] font-bold">{figure.sourceFile}</span>
                    <span className="text-[10px] text-[#838383]">({figure.language})</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-[#e9ebf0] border border-[#d4d4d4] text-[#202020] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#00c07a]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-[#090c1d] bg-[#fafafa] overflow-x-auto max-h-56 leading-relaxed">
                  <code>{figure.scriptCode}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Algorithmic Execution Steps */}
          <div className="p-5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202020] mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[#0091ff]" />
              <span>Quy Trình Tính Toán Từng Bước (Algorithmic Execution Pipeline)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {figure.algorithmSteps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-[#e8e8e8] text-xs space-y-1">
                  <div className="font-mono font-bold text-[#0091ff] text-[11px]">Bước 0{idx + 1}</div>
                  <div className="text-[#202020] font-medium leading-relaxed">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Mechanism Profile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#e9ebf0] border border-[#d4d4d4]">
              <div className="text-[10px] text-[#646464] uppercase font-bold">Độ Phức Tạp Thời Gian</div>
              <div className="text-sm font-extrabold text-[#202020]">{figure.computeMechanism.timeComplexity}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#e9ebf0] border border-[#d4d4d4]">
              <div className="text-[10px] text-[#646464] uppercase font-bold">Độ Phức Tạp Bộ Nhớ</div>
              <div className="text-sm font-extrabold text-[#202020]">{figure.computeMechanism.spaceComplexity}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#e9ebf0] border border-[#d4d4d4]">
              <div className="text-[10px] text-[#646464] uppercase font-bold">Cấp Phát Heap / GC</div>
              <div className="text-sm font-extrabold text-[#00c07a]">{figure.computeMechanism.memoryProfile}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#e9ebf0] border border-[#d4d4d4]">
              <div className="text-[10px] text-[#646464] uppercase font-bold">Bất Biến Hệ Thống</div>
              <div className="text-sm font-extrabold text-[#6647f0] truncate" title={figure.computeMechanism.invariant}>
                {figure.computeMechanism.invariant}
              </div>
            </div>
          </div>

          {/* Concrete GOODS vs BADS Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* The GOODS */}
            <div className="p-5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
              <div className="flex items-center gap-2 mb-4 text-[#166534]">
                <ShieldCheck className="w-5 h-5 text-[#00c07a]" />
                <h4 className="text-sm font-extrabold tracking-tight uppercase font-mono">
                  Ưu Điểm & Thành Tựu Định Lượng (The Goods)
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {figure.goods.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#166534]">
                    <CheckCircle2 className="w-4 h-4 text-[#00c07a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#14532d]">{item.title}: </strong>
                      <span>{item.detail}</span>
                      {item.metric && (
                        <span className="block mt-1 font-mono font-bold text-[#15803d]">
                          Định lượng: {item.metric}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* The BADS / Trade-offs */}
            <div className="p-5 rounded-xl bg-[#fff1f2] border border-[#fecdd3]">
              <div className="flex items-center gap-2 mb-4 text-[#9f1239]">
                <AlertTriangle className="w-5 h-5 text-[#f43f5e]" />
                <h4 className="text-sm font-extrabold tracking-tight uppercase font-mono">
                  Nhược Điểm & Đánh Đổi Kỹ Thuật (The Bads / Trade-Offs)
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {figure.bads.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#9f1239]">
                    <span className="w-4 h-4 rounded-full bg-[#f43f5e]/20 text-[#f43f5e] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      !
                    </span>
                    <div>
                      <strong className="text-[#881337]">{item.title}: </strong>
                      <span>{item.detail}</span>
                      {item.mitigation && (
                        <span className="block mt-1 font-mono text-[11px] text-[#be123c]">
                          Giải pháp khắc phục: {item.mitigation}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e8e8e8] bg-[#f8f9fa] flex items-center justify-between text-xs text-[#838383] font-mono shrink-0">
          <span>ClickUp™ Technical Spec Inspector — Caro Game Project</span>
          <button
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            className="px-5 py-1.5 rounded-full bg-[#202020] text-white font-bold hover:bg-[#090c1d] transition-all"
          >
            Đóng Chi Tiết
          </button>
        </div>
      </div>
    </div>
  )
}
