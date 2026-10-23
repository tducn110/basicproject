import React, { useState, useCallback, useEffect } from "react"
import confetti from "canvas-confetti"
import { Gamepad2, RotateCcw, User, Bot, Eye, EyeOff, Trophy, Sparkles, ExternalLink, GitBranch, Globe, RefreshCw, Maximize2 } from "lucide-react"
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

export const InteractiveCaroBoard: React.FC<Props> = ({ onOpenFigure }) => {
  const [boardSource, setBoardSource] = useState<"presentation" | "vercel">("presentation")
  const [iframeKey, setIframeKey] = useState<number>(0)
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
      if (board[r][c] !== null || winner || isBotThinking) return

      soundManager.playPiece(currentPlayer)

      const newBoard = board.map((row) => [...row])
      newBoard[r][c] = currentPlayer
      setBoard(newBoard)
      setLastMove([r, c])

      const win = checkWinAround(newBoard, r, c, currentPlayer)
      if (win) {
        setWinner(win.winner)
        setWinningLine(win.line)
        soundManager.playWin()
        triggerConfetti()
        return
      }

      const nextPlayer: Player = currentPlayer === "X" ? "O" : "X"
      setCurrentPlayer(nextPlayer)

      if (gameMode === "pve" && nextPlayer === "O") {
        setIsBotThinking(true)

        setTimeout(() => {
          let botMove: [number, number]

          if (botType === "random") {
            const candidates = getChebyshevCandidates(newBoard, 2)
            botMove = candidates[Math.floor(Math.random() * candidates.length)] || [7, 7]
          } else {
            botMove = getRuleBasedMove(newBoard, "O")
          }

          soundManager.playPiece("O")

          const botBoard = newBoard.map((row) => [...row])
          botBoard[botMove[0]][botMove[1]] = "O"
          setBoard(botBoard)
          setLastMove(botMove)
          setIsBotThinking(false)

          const botWin = checkWinAround(botBoard, botMove[0], botMove[1], "O")
          if (botWin) {
            setWinner(botWin.winner)
            setWinningLine(botWin.line)
            soundManager.playWin()
            triggerConfetti()
          } else {
            setCurrentPlayer("X")
          }
        }, 300)
      }
    },
    [board, currentPlayer, gameMode, botType, winner, isBotThinking]
  )

  const handleReset = () => {
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

  const winningSet = new Set(winningLine.map(([r, c]) => `${r},${c}`))

  return (
    <section id="interactive-board" className="py-24 px-4 bg-[#e9ebf0] border-y border-[#d4d4d4]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#d4d4d4] text-[#6647f0] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Thực Nghiệm Tương Tác Trực Tiếp</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#090c1d] tracking-[-0.035em] mb-4">
            Bàn Cờ Đối Kháng & Bộ Lọc Chebyshev Trực Tiếp
          </h2>
          <p className="text-[#646464] text-sm sm:text-base leading-relaxed">
            Trực tiếp trải nghiệm bàn cờ Caro 15×15 ngay trong bài thuyết trình, hoặc chuyển sang bản build thực tế đã triển khai trên Vercel với đầy đủ WebAssembly Web Worker!
          </p>
        </div>

        {/* Live Production Vercel & GitHub Callout Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-[#d4d4d4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00c07a]/10 border border-[#00c07a]/30 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-[#00c07a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00c07a] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00c07a] animate-ping" />
                  Bản Build Production Thực Tế:
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f8f9fa] border border-[#e8e8e8] text-[#202020] font-bold">
                  carogame-five.vercel.app
                </span>
              </div>
              <p className="text-xs text-[#646464] mt-0.5">
                Được build từ mã nguồn Rust Wasm Web Worker, tự động đồng bộ qua CI/CD GitHub.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <a
              href="https://carogame-five.vercel.app"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#00c07a] hover:bg-[#009e65] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span>Mở Bàn Cờ Vercel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://github.com/tducn110/basicproject"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#202020] hover:bg-[#090c1d] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Xem GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#838383]" />
            </a>
          </div>
        </div>

        {/* View Switcher: In-Presentation Board vs Embedded Vercel Production */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-white border border-[#d4d4d4] shadow-xs">
            <button
              onClick={() => {
                soundManager.playClick()
                setBoardSource("presentation")
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                boardSource === "presentation"
                  ? "bg-[#202020] text-white shadow-xs"
                  : "text-[#646464] hover:text-[#202020]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00c07a]" />
              <span>Bàn Cờ Thuyết Trình (Chebyshev AI)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setBoardSource("vercel")
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                boardSource === "vercel"
                  ? "bg-[#6647f0] text-white shadow-xs"
                  : "text-[#646464] hover:text-[#202020]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Nhúng Trực Tiếp Bản Build Vercel</span>
            </button>
          </div>
        </div>

        {boardSource === "vercel" ? (
          /* Embedded Vercel Production Game Frame */
          <div className="clickup-card p-4 sm:p-6 bg-white border border-[#d4d4d4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8] text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c07a]" />
                </div>
                <span className="font-mono text-[#838383] font-bold ml-2">https://carogame-five.vercel.app</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setIframeKey((prev) => prev + 1)
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] border border-[#e8e8e8] text-[#202020] text-xs font-semibold"
                  title="Tải lại iframe bàn cờ"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Frame</span>
                </button>
                <a
                  href="https://carogame-five.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playClick()}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Toàn Màn Hình</span>
                </a>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#e8e8e8] aspect-[4/3] sm:aspect-[16/10] w-full max-h-[700px] bg-[#f8f9fa]">
              <iframe
                key={iframeKey}
                src="https://carogame-five.vercel.app"
                title="Bàn Cờ Caro Vercel Production"
                className="w-full h-full border-0"
                allow="fullscreen"
              />
            </div>
            
            <div className="text-center text-xs text-[#838383] pt-1">
              Bản build WebAssembly chính thức đang chạy tại máy chủ Vercel. Bạn có thể chơi trực tiếp hoặc click <a href="https://carogame-five.vercel.app" target="_blank" rel="noreferrer" className="text-[#0091ff] font-bold hover:underline">vào đây để mở tab mới</a>.
            </div>
          </div>
        ) : (
          /* Presentation Interactive Board */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel (Left, 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="clickup-card p-5 bg-white space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[#090c1d] mb-1">Cấu Hình Trận Đấu</h3>
                <p className="text-xs text-[#838383]">Chọn chế độ và thuật toán của máy</p>
              </div>

              {/* Mode Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#838383] font-bold">Chế Độ Chơi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundManager.playClick()
                      setGameMode("pve")
                      handleReset()
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold transition-all ${
                      gameMode === "pve"
                        ? "bg-[#202020] text-white shadow-sm"
                        : "bg-[#f8f9fa] text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Người vs Bot</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick()
                      setGameMode("pvp")
                      handleReset()
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold transition-all ${
                      gameMode === "pvp"
                        ? "bg-[#202020] text-white shadow-sm"
                        : "bg-[#f8f9fa] text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Người vs Người</span>
                  </button>
                </div>
              </div>

              {/* Bot Engine Selector */}
              {gameMode === "pve" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#838383] font-bold">Động Cơ Của Bot:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        soundManager.playClick()
                        setBotType("rule")
                        handleReset()
                      }}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition-all ${
                        botType === "rule"
                          ? "bg-[#00c07a] text-white shadow-sm"
                          : "bg-[#f8f9fa] text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                      }`}
                    >
                      Rule-Based (Tuần 4)
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick()
                        setBotType("random")
                        handleReset()
                      }}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition-all ${
                        botType === "random"
                          ? "bg-[#202020] text-white shadow-sm"
                          : "bg-[#f8f9fa] text-[#646464] hover:text-[#202020] border border-[#e8e8e8]"
                      }`}
                    >
                      Random Bot
                    </button>
                  </div>
                </div>
              )}

              {/* Chebyshev Toggle */}
              <div className="pt-2 border-t border-[#e8e8e8]">
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setShowChebyshev(!showChebyshev)
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    showChebyshev
                      ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]"
                      : "bg-[#f8f9fa] border-[#e8e8e8] text-[#838383]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00c07a]" />
                    <span>Ô Ứng Viên Chebyshev (r ≤ 2)</span>
                  </div>
                  {showChebyshev ? <Eye className="w-4 h-4 text-[#00c07a]" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#838383]">
                  <span>{candidateCells.length} / 225 ô khảo sát</span>
                  <button 
                    onClick={() => onOpenFigure("chebyshev_heatmap")}
                    className="text-[#0091ff] font-bold hover:underline"
                  >
                    Soi thuật toán ↗
                  </button>
                </div>
              </div>

              {/* Live Heuristic Meter */}
              <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#838383]">Điểm Lượng Giá f(s):</span>
                  <span className={`font-bold ${heuristicStats.score > 0 ? "text-[#0091ff]" : heuristicStats.score < 0 ? "text-[#f43f5e]" : "text-[#202020]"}`}>
                    {heuristicStats.score > 0 ? `+${heuristicStats.score.toLocaleString()}` : heuristicStats.score.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#646464] pt-1 border-t border-[#e8e8e8]">
                  <div>Bot (O): <span className="text-[#0091ff] font-bold">+{heuristicStats.botScore.toLocaleString()}</span></div>
                  <div>Human (X): <span className="text-[#f43f5e] font-bold">-{heuristicStats.humanScore.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Reset Game Action */}
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-full bg-[#f8f9fa] hover:bg-[#e9ebf0] text-[#202020] font-bold text-xs transition-all flex items-center justify-center gap-2 border border-[#d4d4d4]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bắt Đầu Ván Mới</span>
              </button>
            </div>
          </div>

          {/* Board Container (Right, 8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Turn / Winner Status Banner */}
            <div className="w-full max-w-[540px] mb-4 flex items-center justify-between px-5 py-3 rounded-full bg-white border border-[#d4d4d4] shadow-sm">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    winner
                      ? "bg-[#eab308] animate-bounce"
                      : currentPlayer === "X"
                      ? "bg-[#f43f5e] animate-pulse"
                      : "bg-[#0091ff] animate-pulse"
                  }`}
                />
                <span className="text-xs font-bold text-[#202020]">
                  {winner ? (
                    <span className="text-[#6647f0] flex items-center gap-1.5 font-extrabold">
                      <Trophy className="w-4 h-4 text-[#eab308]" />
                      Người chơi {winner === "X" ? "Bạn (X)" : "Máy (O)"} Đã Thắng!
                    </span>
                  ) : isBotThinking ? (
                    <span className="text-[#0091ff]">Máy AI đang tính toán nước đi...</span>
                  ) : (
                    <span>Lượt đi: <strong className={currentPlayer === "X" ? "text-[#f43f5e]" : "text-[#0091ff]"}>{currentPlayer === "X" ? "Quân X (Bạn)" : gameMode === "pve" ? "Quân O (Máy)" : "Quân O (P2)"}</strong></span>
                  )}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#838383]">
                Ứng viên: <strong className="text-[#00c07a] font-bold">{candidateCells.length} / 225</strong> ô
              </div>
            </div>

            {/* 15x15 Interactive Grid */}
            <div className="p-3 sm:p-4 rounded-3xl bg-white border-2 border-[#d4d4d4] shadow-xl w-full max-w-[540px] aspect-square relative">
              <div className="grid grid-cols-15 grid-rows-15 gap-[1px] bg-[#d4d4d4] w-full h-full p-[1px] rounded-xl overflow-hidden border border-[#d4d4d4]">
                {board.map((row, r) =>
                  row.map((cell, c) => {
                    const isWinningCell = winningSet.has(`${r},${c}`)
                    const isCandidate = showChebyshev && candidateSet.has(`${r},${c}`) && cell === null
                    const isLast = lastMove && lastMove[0] === r && lastMove[1] === c

                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        disabled={cell !== null || !!winner || isBotThinking}
                        aria-label={`Cell ${r}, ${c}`}
                        className={`board-cell-btn bg-white relative transition-colors ${
                          isWinningCell ? "bg-[#fef08a]" : ""
                        } ${isLast ? "ring-2 ring-[#6647f0] z-10" : ""}`}
                      >
                        {/* Chebyshev Candidate Dot */}
                        {isCandidate && !cell && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00c07a] pointer-events-none" />
                        )}

                        {/* Placed Stone */}
                        {cell === "X" && (
                          <span className="text-xs sm:text-base font-black text-[#f43f5e] select-none animate-scaleIn">
                            ✕
                          </span>
                        )}
                        {cell === "O" && (
                          <span className="text-xs sm:text-base font-black text-[#0091ff] select-none animate-scaleIn">
                            ○
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-[11px] text-[#646464]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] font-bold flex items-center justify-center text-[9px]">✕</span>
                <span>Quân X (Bạn)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0091ff]/10 border border-[#0091ff]/30 text-[#0091ff] font-bold flex items-center justify-center text-[9px]">○</span>
                <span>Quân O (Bot)</span>
              </div>
              {showChebyshev && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00c07a]" />
                  <span>Ứng viên Chebyshev ({candidateCells.length} ô)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
  )
}
