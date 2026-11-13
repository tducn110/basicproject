import { CARO_GAME_URL, CARO_GAME_LABEL } from "../utils/gameUrl"
import React, { useState, useCallback, useEffect } from "react"
import confetti from "canvas-confetti"
import {
  Gamepad2,
  RotateCcw,
  User,
  Bot,
  Eye,
  EyeOff,
  Trophy,
  Sparkles,
  ExternalLink,
  GitBranch,
  Globe,
  RefreshCw,
  Maximize2,
  ListOrdered,
  Gauge,
  Zap,
  ArrowDown,
  Layers,
  ChevronRight,
  ShieldCheck,
  Cpu,
} from "lucide-react"
import {
  BOARD_SIZE,
  CellValue,
  Player,
  checkWinAround,
  getChebyshevCandidates,
  evaluateBoard,
  getRuleBasedMove,
} from "../utils/caroEngine"
import { soundManager } from "../utils/audio"

interface Props {
  onOpenFigure: (id: string) => void
}

export const TopHeroBoardWithTOC: React.FC<Props> = ({ onOpenFigure }) => {
  const [boardSource, setBoardSource] = useState<"vercel" | "presentation">("vercel")
  const [iframeKey, setIframeKey] = useState<number>(0)
  const activeVercelUrl = CARO_GAME_URL

  // State cho bàn cờ nội bộ phục vụ thuyết trình (Chebyshev Demo)
  const [board, setBoard] = useState<CellValue[][]>(() =>
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [gameMode, setGameMode] = useState<"pve" | "pvp">("pve")
  const [botType, setBotType] = useState<"rule" | "random">("rule")
  const [showChebyshev, setShowChebyshev] = useState<boolean>(true)
  const [winner, setWinner] = useState<Player | null>(null)
  const [winningLine, setWinningLine] = useState<[number, number][]>([])
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)

  const [heuristicStats, setHeuristicStats] = useState({ score: 0, botScore: 0, humanScore: 0 })

  const candidateCells = React.useMemo(() => {
    return getChebyshevCandidates(board, 2)
  }, [board])

  const candidateSet = React.useMemo(() => {
    return new Set(candidateCells.map(([r, c]) => `${r},${c}`))
  }, [candidateCells])

  useEffect(() => {
    const stats = evaluateBoard(board, "O")
    setHeuristicStats(stats)
  }, [board])

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (board[r][c] || winner || isBotThinking) return

      soundManager.playPiece(currentPlayer)

      const nextBoard = board.map((row) => [...row])
      nextBoard[r][c] = currentPlayer
      setBoard(nextBoard)
      setLastMove([r, c])

      const winResult = checkWinAround(nextBoard, r, c, currentPlayer)
      if (winResult) {
        setWinner(winResult.winner)
        setWinningLine(winResult.line)
        soundManager.playWin()
        triggerConfetti()
        return
      }

      if (gameMode === "pve") {
        setCurrentPlayer("O")
        setIsBotThinking(true)

        setTimeout(() => {
          let botMove: [number, number] | null = null
          if (botType === "rule") {
            botMove = getRuleBasedMove(nextBoard, "O")
          } else {
            const emptyCells: [number, number][] = []
            for (let i = 0; i < BOARD_SIZE; i++) {
              for (let j = 0; j < BOARD_SIZE; j++) {
                if (!nextBoard[i][j]) emptyCells.push([i, j])
              }
            }
            if (emptyCells.length > 0) {
              botMove = emptyCells[Math.floor(Math.random() * emptyCells.length)]
            }
          }

          if (botMove) {
            const [br, bc] = botMove
            soundManager.playPiece("O")
            const afterBotBoard = nextBoard.map((row) => [...row])
            afterBotBoard[br][bc] = "O"
            setBoard(afterBotBoard)
            setLastMove([br, bc])

            const botWin = checkWinAround(afterBotBoard, br, bc, "O")
            if (botWin) {
              setWinner(botWin.winner)
              setWinningLine(botWin.line)
              soundManager.playWin()
              triggerConfetti()
            }
          }
          setIsBotThinking(false)
          setCurrentPlayer("X")
        }, 350)
      } else {
        setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"))
      }
    },
    [board, winner, isBotThinking, currentPlayer, gameMode, botType]
  )

  const resetGame = () => {
    soundManager.playClick()
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    )
    setCurrentPlayer("X")
    setWinner(null)
    setWinningLine([])
    setLastMove(null)
    setIsBotThinking(false)
  }

  // 12 Phân hệ mục lục điều hướng học thuật chuẩn đồ án
  const tocItems = [
    {
      num: "01",
      title: "Bảng Kết Quả Thực Nghiệm Đối Đầu",
      sub: "Rust native vs Node.js, dữ liệu benchmark lịch sử",
      anchor: "#results",
      badge: "KẾT QUẢ",
      color: "text-[#00c07a] bg-[#00c07a]/10 border-[#00c07a]/30",
    },
    {
      num: "02",
      title: "Biểu Diễn Bàn Cờ & Quét Thắng O(1)",
      sub: "Mảng phẳng 240B, In-place Apply/Undo, Raycasting 4 hướng",
      anchor: "#board-representation",
      badge: "THUẬT TOÁN",
      color: "text-[#0091ff] bg-[#0091ff]/10 border-[#0091ff]/30",
    },
    {
      num: "03",
      title: "Quy Tắc Trò Chơi & Không Gian Trạng Thái",
      sub: "Freestyle Gomoku 15x15, b^d bùng nổ tổ hợp, Game Tree",
      anchor: "#overview",
      badge: "NỀN TẢNG",
      color: "text-[#6647f0] bg-[#6647f0]/10 border-[#6647f0]/30",
    },
    {
      num: "04",
      title: "Kiến Trúc Đa Luồng Web Worker",
      sub: "Cô lập tính toán ngầm, giữ vững 60 FPS UI không giật lag",
      anchor: "#pve-transition",
      badge: "KIẾN TRÚC",
      color: "text-[#202020] bg-[#202020]/10 border-[#202020]/30",
    },
    {
      num: "05",
      title: "7 Mẫu Thế Cờ & Hàm Lượng Giá Heuristic",
      sub: "Five, Open 4, Blocked 4, Open 3, Blocked 3, Split 3",
      anchor: "#week4",
      badge: "HEURISTIC",
      color: "text-[#ea580c] bg-[#ea580c]/10 border-[#ea580c]/30",
    },
    {
      num: "06",
      title: "Thuật Toán Minimax & Cây Trò Chơi",
      sub: "Zero-Sum Game Tree, Depth-Limited Search, Phân tích độ phức tạp",
      anchor: "#week5",
      badge: "MINIMAX",
      color: "text-[#6647f0] bg-[#6647f0]/10 border-[#6647f0]/30",
    },
    {
      num: "07",
      title: "Cắt Tỉa Alpha-Beta Pruning (β ≤ α)",
      sub: "Cắt bỏ 16.350 nhánh vô nghĩa ở độ sâu d=4, tối ưu bước duyệt",
      anchor: "#week6",
      badge: "CẮT TỈA",
      color: "text-[#00c07a] bg-[#00c07a]/10 border-[#00c07a]/30",
    },
    {
      num: "08",
      title: "Lọc Ứng Viên Chebyshev r ≤ 2 & Bot Tiers",
      sub: "Thu hẹp từ 225 ô xuống 12–25 ô khả thi quanh quân đã đánh",
      anchor: "#week7",
      badge: "CHEBYSHEV",
      color: "text-[#0091ff] bg-[#0091ff]/10 border-[#0091ff]/30",
    },
    {
      num: "09",
      title: "Move Ordering & Sắp Xếp Nước Đi",
      sub: "Lượng giá sơ bộ O(1), đẩy nước mạnh lên đầu cây tìm kiếm",
      anchor: "#advanced-ai",
      badge: "ORDERING",
      color: "text-[#9333ea] bg-[#9333ea]/10 border-[#9333ea]/30",
    },
    {
      num: "10",
      title: "Zobrist Hashing 64-bit & Transposition Table",
      sub: "Khử trùng lặp chuyển vị cờ, bảng băm 8MB lưu trữ 3 loại cận",
      anchor: "#advanced-ai",
      badge: "ZOBRIST",
      color: "text-[#0284c7] bg-[#0284c7]/10 border-[#0284c7]/30",
    },
    {
      num: "11",
      title: "Tìm Kiếm Sâu Dần (Iterative Deepening & Time Budget)",
      sub: "Kiểm soát thời gian theo mili-giây, phản hồi mượt mà không treo",
      anchor: "#advanced-ai",
      badge: "IDS",
      color: "text-[#16a34a] bg-[#16a34a]/10 border-[#16a34a]/30",
    },
    {
      num: "12",
      title: "Lộ Trình Đồ Án & Git Provenance",
      sub: "10 tuần nghiên cứu, commit SHA & minh chứng học thuật",
      anchor: "#roadmap",
      badge: "LỘ TRÌNH",
      color: "text-[#475569] bg-[#475569]/10 border-[#475569]/30",
    },
  ]

  return (
    <section id="hero" className="pt-20 sm:pt-24 pb-12 px-4 bg-white border-b border-[#e8e8e8]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Fast Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#e8e8e8]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[11px] font-mono text-[#646464] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00c07a] animate-ping" />
              <span>Đồ Án Cơ Sở: Nghiên Cứu Thuật Toán AI Cho Game Cờ Caro 15×15</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#090c1d] tracking-tight">
              Động Cơ Đối Kháng Caro AI & Kiểm Chứng Học Thuật
            </h1>
            <p className="text-xs sm:text-sm text-[#646464] max-w-3xl">
              Mở lên thấy luôn bàn cờ game đối kháng bên phải, mục lục 12 phân hệ thuật toán bên trái. Kéo xuống dưới là Bảng kết quả thực nghiệm và Nền tảng học thuật chi tiết.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#results"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00c07a] hover:bg-[#009e65] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Xem Kết Quả Thực Nghiệm</span>
            </a>
            <a
              href={CARO_GAME_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#6647f0] hover:bg-[#5233e0] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Bàn cờ {CARO_GAME_LABEL}</span>
              <ExternalLink className="w-3 h-3 text-white/80" />
            </a>
            <a
              href="https://github.com/tducn110/basicproject"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#202020] hover:bg-[#090c1d] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-[#838383]" />
            </a>
          </div>
        </div>

        {/* 2-Column Split: CỘT TRÁI (MỤC LỤC + STATS, 5 cols) | CỘT PHẢI (GAME BÀN CỜ, 7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: TABLE OF CONTENTS (MỤC LỤC ĐIỀU HƯỚNG) & THÔNG SỐ TÓM TẮT (5 cols) */}
          <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
            {/* Quick Executive Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                <div className="text-[10px] font-mono font-bold text-[#166534] uppercase">Thông Lượng AI</div>
                <div className="text-lg font-extrabold text-[#15803d]">1.77 MNodes/s</div>
                <div className="text-[10px] text-[#166534]/80">Rust native · benchmark lịch sử</div>
              </div>
              <div className="p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]">
                <div className="text-[10px] font-mono font-bold text-[#1e40af] uppercase">Tăng Tốc (Speedup)</div>
                <div className="text-lg font-extrabold text-[#1d4ed8]">17.8x – 24.3x</div>
                <div className="text-[10px] text-[#1e40af]/80">So với TypeScript JIT</div>
              </div>
              <div className="p-3 rounded-xl bg-[#faf5ff] border border-[#e9d5ff]">
                <div className="text-[10px] font-mono font-bold text-[#6b21a8] uppercase">Cắt Tỉa Alpha-Beta</div>
                <div className="text-lg font-extrabold text-[#7e22ce]">16.350 Nhánh</div>
                <div className="text-[10px] text-[#6b21a8]/80">Tại độ sâu d = 4</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-[10px] font-mono font-bold text-[#334155] uppercase">Độ Trễ Giao Diện</div>
                <div className="text-lg font-extrabold text-[#0f172a]">60 FPS (0ms lag)</div>
                <div className="text-[10px] text-[#334155]/80">Web Worker đa luồng</div>
              </div>
            </div>

            {/* Table of Contents Card */}
            <div className="clickup-card p-4 sm:p-5 bg-[#f8f9fa] border border-[#e8e8e8] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-[#6647f0]" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#202020]">
                    Mục Lục Điều Hướng Học Thuật
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-[#d4d4d4] text-[#646464]">
                  12 Phân Hệ
                </span>
              </div>

              {/* Danh sách các chương mục click nhảy mượt mà */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {tocItems.map((item) => (
                  <a
                    key={item.num}
                    href={item.anchor}
                    onClick={() => soundManager.playClick()}
                    className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#f0f4ff] border border-[#e8e8e8] hover:border-[#6647f0]/40 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-extrabold text-[#838383] group-hover:text-[#6647f0] shrink-0">
                        {item.num}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#202020] group-hover:text-[#6647f0] truncate transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#838383] truncate">{item.sub}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${item.color}`}>
                        {item.badge}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#838383] group-hover:text-[#6647f0] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </a>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-[#e8e8e8]">
                <a
                  href="#results"
                  onClick={() => soundManager.playClick()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00c07a] hover:underline"
                >
                  <span>Kéo xuống để xem Bảng Kết Quả Thực Nghiệm & Nền Tảng</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BÀN CỜ GAME TRỰC QUAN (7 cols) */}
          <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
            {/* Switcher: Nhúng Live 10-caro vs Bàn cờ Thuyết trình */}
            <div className="p-2 rounded-2xl bg-[#f8f9fa] border border-[#e8e8e8] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-full bg-white border border-[#d4d4d4] shadow-xs w-full sm:w-auto">
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setBoardSource("vercel")
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    boardSource === "vercel"
                      ? "bg-[#00c07a] text-white shadow-xs"
                      : "text-[#646464] hover:text-[#202020]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Bàn cờ {CARO_GAME_LABEL}</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setBoardSource("presentation")
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    boardSource === "presentation"
                      ? "bg-[#202020] text-white shadow-xs"
                      : "text-[#646464] hover:text-[#202020]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00c07a]" />
                  <span>Bàn Cờ Thuyết Trình (Chebyshev AI)</span>
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#166534] bg-[#f0fdf4] px-3 py-1 rounded-full border border-[#bbf7d0]">
                <Cpu className="w-3.5 h-3.5" />
                <span>Rust WASM + Web Worker</span>
              </div>
            </div>

            {/* Khung hiển thị Bàn cờ */}
            {boardSource === "vercel" ? (
              <div className="clickup-card p-3 sm:p-4 bg-white border border-[#d4d4d4] space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8] text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00c07a]" />
                    <span className="font-mono text-[#00c07a] font-bold ml-1.5">{activeVercelUrl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundManager.playClick()
                        setIframeKey((prev) => prev + 1)
                      }}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] border border-[#e8e8e8] text-[#202020] text-[11px] font-semibold"
                      title="Tải lại iframe"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reload</span>
                    </button>
                    <a
                      href={activeVercelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0091ff] hover:bg-[#0077d6] text-white text-[11px] font-bold"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Mở Tab Mới</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#e8e8e8] aspect-[4/3] sm:aspect-[16/11] w-full max-h-[620px] bg-[#f8f9fa]">
                  <iframe
                    key={`${iframeKey}-${activeVercelUrl}`}
                    src={activeVercelUrl}
                    title={`Bàn cờ Caro: ${CARO_GAME_LABEL}`}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                  />
                </div>
                <div className="text-center text-[11px] text-[#838383]">
                  Bàn cờ Rust/WebAssembly tại {CARO_GAME_LABEL}, với sáu mức Easy, Normal, Hard, Very Hard, Expert và Master. Bạn có thể tương tác chơi trực tiếp hoặc click <a href={activeVercelUrl} target="_blank" rel="noreferrer" className="text-[#0091ff] font-bold hover:underline">vào đây để mở toàn màn hình</a>.
                </div>
              </div>
            ) : (
              /* Presentation Interactive Board (Local Engine) */
              <div className="clickup-card p-4 bg-white border border-[#d4d4d4] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#202020]">Bàn Cờ 15×15 Thuyết Trình</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6647f0]/10 text-[#6647f0] font-bold font-mono">
                      Chebyshev AI Demo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowChebyshev(!showChebyshev)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        showChebyshev
                          ? "bg-[#6647f0]/10 border-[#6647f0]/30 text-[#6647f0]"
                          : "bg-[#f8f9fa] border-[#e8e8e8] text-[#646464]"
                      }`}
                    >
                      {showChebyshev ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>Vùng Chebyshev</span>
                    </button>
                    <button
                      onClick={resetGame}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] border border-[#e8e8e8] text-[#202020] text-xs font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Ván Mới</span>
                    </button>
                  </div>
                </div>

                {/* Grid Bàn Cờ 15x15 */}
                <div className="flex justify-center overflow-x-auto py-2">
                  <div className="grid grid-cols-15 gap-0 p-2 bg-[#d7b274] border-2 border-[#8b5a2b] rounded-lg shadow-inner select-none">
                    {board.map((row, r) =>
                      row.map((cell, c) => {
                        const isLast = lastMove && lastMove[0] === r && lastMove[1] === c
                        const isWinCell = winningLine.some(([wr, wc]) => wr === r && wc === c)
                        const isCandidate = showChebyshev && !cell && candidateSet.has(`${r},${c}`)

                        return (
                          <div
                            key={`${r}-${c}`}
                            onClick={() => handleCellClick(r, c)}
                            className={`w-6 h-6 sm:w-7 sm:h-7 border border-[#b8860b]/40 flex items-center justify-center cursor-pointer relative transition-colors ${
                              isCandidate ? "bg-[#fff8dc]/70 hover:bg-[#fffacd]" : "hover:bg-[#e6c280]"
                            } ${isWinCell ? "bg-red-400/80 animate-pulse" : ""}`}
                          >
                            {cell === "X" && (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#202020] border border-black shadow-md flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">X</span>
                              </div>
                            )}
                            {cell === "O" && (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-red-500 shadow-md flex items-center justify-center">
                                <span className="text-[10px] text-red-600 font-bold">O</span>
                              </div>
                            )}
                            {!cell && isCandidate && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6647f0]/60" />
                            )}
                            {isLast && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#646464]">Lượt chơi:</span>
                    <span className="font-bold text-[#202020] flex items-center gap-1 font-mono">
                      {currentPlayer === "X" ? "Người chơi (X)" : "Bot AI (O)"}
                      {isBotThinking && <span className="text-[10px] text-[#0091ff] animate-pulse">(Đang tính...)</span>}
                    </span>
                  </div>
                  {winner && (
                    <div className="font-bold text-red-600 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{winner === "X" ? "Người Chơi Thắng!" : "Bot AI Thắng!"}</span>
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-[#838383]">
                    Ứng viên: {candidateCells.length} ô
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
