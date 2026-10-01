export type Player = "X" | "O"

export type Cell = Player | null

export type Board = Cell[][]

export interface Move {
  player: Player
  row: number
  col: number
  index: number
}

export interface WinResult {
  winner: Player
  cells: [number, number][]
}
