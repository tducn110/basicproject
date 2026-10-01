import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BOARD_SIZE,
  type Board,
  type Move,
  type Player,
  type WinResult,
  checkWinner,
  createBoard,
} from "../domain"

export interface UseCaroGameReturn {
  board: Board
  currentPlayer: Player
  winner: WinResult | null
  isDraw: boolean
  isGameOver: boolean
  history: Move[]
  lastMove: [number, number] | null
  gameStarted: boolean
  winCellSet: Set<string>
  elapsed: number
  handleCellClick: (row: number, col: number) => void
  handleReplay: () => void
  handleNewGame: () => void
}

export function useCaroGame(): UseCaroGameReturn {
  const [board, setBoard] = useState<Board>(() => createBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<WinResult | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [history, setHistory] = useState<Move[]>([])
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const isGameOver = !!winner || isDraw

  const winCellSet = useMemo(() => {
    if (!winner) return new Set<string>()
    return new Set(winner.cells.map(([r, c]) => `${r},${c}`))
  }, [winner])

  // Refs to avoid stale closures inside placeMove's setBoard updater
  const historyRef = useRef<Move[]>(history)
  historyRef.current = history
  const gameStartedRef = useRef(gameStarted)
  gameStartedRef.current = gameStarted
  const winnerRef = useRef(winner)
  winnerRef.current = winner
  const currentPlayerRef = useRef(currentPlayer)
  currentPlayerRef.current = currentPlayer

  const placeMove = useCallback((row: number, col: number) => {
    setBoard((prev) => {
      if (prev[row][col] || winnerRef.current) return prev
      const next = prev.map((r) => [...r]) as Board
      const player: Player = currentPlayerRef.current
      next[row][col] = player

      const result = checkWinner(next, row, col)
      const prevHistory = historyRef.current
      const newHistory: Move[] = [
        ...prevHistory,
        { player, row, col, index: prevHistory.length + 1 },
      ]

      setLastMove([row, col])
      setHistory(newHistory)
      if (!gameStartedRef.current) setGameStarted(true)

      if (result) {
        setWinner(result)
      } else if (newHistory.length === BOARD_SIZE * BOARD_SIZE) {
        setIsDraw(true)
      } else {
        setCurrentPlayer(player === "X" ? "O" : "X")
      }

      return next
    })
  }, [])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winner || isDraw) return
      placeMove(row, col)
    },
    [winner, isDraw, placeMove],
  )

  const handleReplay = useCallback(() => {
    setBoard(createBoard())
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
    setHistory([])
    setLastMove(null)
    setGameStarted(false)
    setElapsed(0)
  }, [])

  const handleNewGame = useCallback(() => {
    handleReplay()
  }, [handleReplay])

  useEffect(() => {
    if (!gameStarted || isGameOver) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [gameStarted, isGameOver])

  useEffect(() => {
    if (!gameStarted) setElapsed(0)
  }, [gameStarted])

  return {
    board,
    currentPlayer,
    winner,
    isDraw,
    isGameOver,
    history,
    lastMove,
    gameStarted,
    winCellSet,
    elapsed,
    handleCellClick,
    handleReplay,
    handleNewGame,
  }
}
