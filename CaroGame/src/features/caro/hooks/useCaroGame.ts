import { useCallback, useMemo, useReducer } from "react"
import {
  BOARD_SIZE,
  type Board,
  type Move,
  type Player,
  type WinResult,
  checkWinner,
  createBoard,
} from "../domain"

export interface CaroState {
  board: Board
  currentPlayer: Player
  winner: WinResult | null
  isDraw: boolean
  history: Move[]
  lastMove: [number, number] | null
  gameStarted: boolean
}

export type CaroAction =
  | { type: "PLACE_MOVE"; row: number; col: number }
  | { type: "REPLAY" }
  | { type: "NEW_GAME" }

export function createInitialCaroState(): CaroState {
  return {
    board: createBoard(),
    currentPlayer: "X",
    winner: null,
    isDraw: false,
    history: [],
    lastMove: null,
    gameStarted: false,
  }
}

/**
 * Pure Caro state reducer tuân thủ tuyệt đối React Docs:
 * - 100% pure function, không có side effect.
 * - Idempotent, an toàn trong React StrictMode.
 * - Cập nhật đồng bộ toàn bộ state trong 1 render cycle duy nhất.
 */
export function caroReducer(state: CaroState, action: CaroAction): CaroState {
  switch (action.type) {
    case "PLACE_MOVE": {
      const { row, col } = action

      // Không cho phép đánh vào ô đã có quân hoặc khi ván đấu đã kết thúc
      if (state.board[row][col] || state.winner || state.isDraw) {
        return state
      }

      const nextBoard = state.board.map((r) => [...r]) as Board
      const player = state.currentPlayer
      nextBoard[row][col] = player

      const winResult = checkWinner(nextBoard, row, col)
      const nextHistory: Move[] = [
        ...state.history,
        {
          player,
          row,
          col,
          index: state.history.length + 1,
        },
      ]

      const isDraw = !winResult && nextHistory.length === BOARD_SIZE * BOARD_SIZE

      return {
        board: nextBoard,
        currentPlayer: winResult || isDraw ? player : player === "X" ? "O" : "X",
        winner: winResult,
        isDraw,
        history: nextHistory,
        lastMove: [row, col],
        gameStarted: true,
      }
    }

    case "REPLAY":
    case "NEW_GAME":
      return createInitialCaroState()

    default:
      return state
  }
}

export interface UseCaroGameOptions {
  onMoveSuccess?: (player: Player, result: WinResult | null, isDraw: boolean) => void
  onActionClick?: () => void
}

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
  handleCellClick: (row: number, col: number) => void
  handleReplay: () => void
  handleNewGame: () => void
}

/**
 * Pure GameState coordinator hook — quản lý tập trung trạng thái ván cờ.
 * Chuẩn hóa theo React 19 Docs bằng useReducer thay vì chuỗi setState lồng nhau.
 */
export function useCaroGame(options?: UseCaroGameOptions): UseCaroGameReturn {
  const [state, dispatch] = useReducer(caroReducer, undefined, createInitialCaroState)

  const isGameOver = !!state.winner || state.isDraw

  const winCellSet = useMemo(() => {
    if (!state.winner) return new Set<string>()
    return new Set(state.winner.cells.map(([r, c]) => `${r},${c}`))
  }, [state.winner])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Validate nước đi trước khi dispatch và phát âm thanh
      if (state.board[row][col] || state.winner || state.isDraw) {
        return
      }

      const player = state.currentPlayer
      // Kiểm tra trước kết quả thắng/hòa để kích hoạt sự kiện âm thanh tức thời
      const tempBoard = state.board.map((r) => [...r]) as Board
      tempBoard[row][col] = player
      const result = checkWinner(tempBoard, row, col)
      const nextMoveCount = state.history.length + 1
      const isDraw = !result && nextMoveCount === BOARD_SIZE * BOARD_SIZE

      // Dispatch state update pure
      dispatch({ type: "PLACE_MOVE", row, col })

      // Kích hoạt callback âm thanh qua Event Handler theo đúng React Docs
      options?.onMoveSuccess?.(player, result, isDraw)
    },
    [state.board, state.winner, state.isDraw, state.currentPlayer, state.history.length, options],
  )

  const handleReplay = useCallback(() => {
    options?.onActionClick?.()
    dispatch({ type: "REPLAY" })
  }, [options])

  const handleNewGame = useCallback(() => {
    options?.onActionClick?.()
    dispatch({ type: "NEW_GAME" })
  }, [options])

  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    winner: state.winner,
    isDraw: state.isDraw,
    isGameOver,
    history: state.history,
    lastMove: state.lastMove,
    gameStarted: state.gameStarted,
    winCellSet,
    handleCellClick,
    handleReplay,
    handleNewGame,
  }
}
