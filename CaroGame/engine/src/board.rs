pub const SIZE: usize = 15;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Cell {
    Empty,
    Black,
    White,
}

impl Cell {
    pub fn opponent(self) -> Self {
        match self {
            Cell::Black => Cell::White,
            Cell::White => Cell::Black,
            Cell::Empty => Cell::Empty,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Board {
    cells: [[Cell; SIZE]; SIZE],
    move_count: usize,
}

impl Board {
    pub fn new() -> Self {
        Self {
            cells: [[Cell::Empty; SIZE]; SIZE],
            move_count: 0,
        }
    }

    pub fn get(&self, x: usize, y: usize) -> Cell {
        self.cells[y][x]
    }

    /// Checked boundary access. `get` remains for coordinates already validated
    /// by a board traversal or by `place`.
    pub fn get_checked(&self, x: usize, y: usize) -> Option<Cell> {
        self.cells.get(y).and_then(|row| row.get(x)).copied()
    }

    pub fn place(&mut self, x: usize, y: usize, stone: Cell) -> Result<(), &'static str> {
        if x >= SIZE || y >= SIZE {
            return Err("out of bounds");
        }
        if stone == Cell::Empty {
            return Err("cannot place an empty cell");
        }
        if self.cells[y][x] != Cell::Empty {
            return Err("cell occupied");
        }
        self.cells[y][x] = stone;
        self.move_count += 1;
        Ok(())
    }

    /// Remove an occupied cell. Invalid requests leave the entire board intact.
    /// Search owns the apply/undo pairing; `Game` owns chronological history.
    pub fn undo(&mut self, x: usize, y: usize) -> bool {
        if self.get_checked(x, y).is_none_or(|cell| cell == Cell::Empty) {
            return false;
        }
        self.cells[y][x] = Cell::Empty;
        self.move_count -= 1;
        true
    }

    pub fn is_full(&self) -> bool {
        self.move_count >= SIZE * SIZE
    }

    pub fn move_count(&self) -> usize {
        self.move_count
    }

    /// Check if placing at (x, y) created a win. Only examines the 4 lines
    /// through that cell — O(1) instead of O(n²).
    pub fn check_winner_at(&self, x: usize, y: usize) -> Option<Cell> {
        let cell = self.get_checked(x, y)?;
        if cell == Cell::Empty {
            return None;
        }
        let directions: [(i32, i32); 4] = [(1, 0), (0, 1), (1, 1), (1, -1)];
        for &(dx, dy) in &directions {
            if self.count_line_through(x, y, dx, dy, cell) >= 5 {
                return Some(cell);
            }
        }
        None
    }

    /// Full-board scan at an external search root. Search descendants use the
    /// last move instead, because only a newly placed stone can create a win.
    pub fn check_winner(&self) -> Option<Cell> {
        let directions = [(1, 0), (0, 1), (1, 1), (1, -1i32)];
        for y in 0..SIZE {
            for x in 0..SIZE {
                let cell = self.cells[y][x];
                if cell == Cell::Empty {
                    continue;
                }
                for &(dx, dy) in &directions {
                    if self.count_line_through(x, y, dx, dy, cell) >= 5 {
                        return Some(cell);
                    }
                }
            }
        }
        None
    }

    /// Count consecutive stones through (x,y) in both directions along (dx,dy).
    fn count_line_through(&self, x: usize, y: usize, dx: i32, dy: i32, stone: Cell) -> usize {
        let mut count = 1; // the stone itself
        // Forward
        for i in 1..5 {
            let nx = x as i32 + dx * i;
            let ny = y as i32 + dy * i;
            if nx < 0 || nx >= SIZE as i32 || ny < 0 || ny >= SIZE as i32 {
                break;
            }
            if self.cells[ny as usize][nx as usize] != stone {
                break;
            }
            count += 1;
        }
        // Backward
        for i in 1..5 {
            let nx = x as i32 - dx * i;
            let ny = y as i32 - dy * i;
            if nx < 0 || nx >= SIZE as i32 || ny < 0 || ny >= SIZE as i32 {
                break;
            }
            if self.cells[ny as usize][nx as usize] != stone {
                break;
            }
            count += 1;
        }
        count
    }

    /// Get cells near existing stones (for AI move candidate generation)
    pub fn get_candidates(&self, radius: usize) -> Vec<(usize, usize)> {
        if self.is_full() {
            return Vec::new();
        }
        if self.move_count == 0 {
            return vec![(SIZE / 2, SIZE / 2)];
        }
        let radius = radius.min(SIZE - 1);
        let mut seen = [[false; SIZE]; SIZE];
        let mut candidates = Vec::new();

        for y in 0..SIZE {
            for x in 0..SIZE {
                if self.cells[y][x] == Cell::Empty {
                    continue;
                }
                let y_min = y.saturating_sub(radius);
                let y_max = (y + radius + 1).min(SIZE);
                let x_min = x.saturating_sub(radius);
                let x_max = (x + radius + 1).min(SIZE);
                for ny in y_min..y_max {
                    for nx in x_min..x_max {
                        if self.cells[ny][nx] == Cell::Empty && !seen[ny][nx] {
                            seen[ny][nx] = true;
                            candidates.push((nx, ny));
                        }
                    }
                }
            }
        }

        candidates
    }

    pub fn legal_moves(&self) -> Vec<(usize, usize)> {
        let mut moves = Vec::with_capacity(SIZE * SIZE - self.move_count);
        for y in 0..SIZE {
            for x in 0..SIZE {
                if self.cells[y][x] == Cell::Empty {
                    moves.push((x, y));
                }
            }
        }
        moves
    }

    pub fn cells(&self) -> &[[Cell; SIZE]; SIZE] {
        &self.cells
    }
}

impl Default for Board {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_board_is_empty() {
        let board = Board::new();
        for y in 0..SIZE {
            for x in 0..SIZE {
                assert_eq!(board.get(x, y), Cell::Empty);
            }
        }
    }

    #[test]
    fn test_place_stone() {
        let mut board = Board::new();
        assert!(board.place(7, 7, Cell::Black).is_ok());
        assert_eq!(board.get(7, 7), Cell::Black);
    }

    #[test]
    fn test_place_on_occupied() {
        let mut board = Board::new();
        board.place(7, 7, Cell::Black).unwrap();
        assert!(board.place(7, 7, Cell::White).is_err());
    }

    #[test]
    fn test_place_out_of_bounds() {
        let mut board = Board::new();
        assert!(board.place(15, 0, Cell::Black).is_err());
    }

    #[test]
    fn test_win_horizontal() {
        let mut board = Board::new();
        for x in 0..5 {
            board.place(x, 0, Cell::Black).unwrap();
        }
        assert_eq!(board.check_winner(), Some(Cell::Black));
    }

    #[test]
    fn test_win_vertical() {
        let mut board = Board::new();
        for y in 0..5 {
            board.place(0, y, Cell::Black).unwrap();
        }
        assert_eq!(board.check_winner(), Some(Cell::Black));
    }

    #[test]
    fn test_win_diagonal() {
        let mut board = Board::new();
        for i in 0..5 {
            board.place(i, i, Cell::Black).unwrap();
        }
        assert_eq!(board.check_winner(), Some(Cell::Black));
    }

    #[test]
    fn test_win_anti_diagonal() {
        let mut board = Board::new();
        for i in 0..5 {
            board.place(14 - i, i, Cell::Black).unwrap();
        }
        assert_eq!(board.check_winner(), Some(Cell::Black));
    }

    #[test]
    fn test_no_winner_four_in_a_row() {
        let mut board = Board::new();
        for x in 0..4 {
            board.place(x, 0, Cell::Black).unwrap();
        }
        assert_eq!(board.check_winner(), None);
    }

    #[test]
    fn test_is_full() {
        let board = Board::new();
        assert!(!board.is_full());
    }

    #[test]
    fn empty_stone_does_not_change_state() {
        let mut board = Board::new();
        let before = board.clone();
        assert!(board.place(7, 7, Cell::Empty).is_err());
        assert_eq!(board, before);
    }

    #[test]
    fn invalid_undo_and_coordinates_do_not_change_state() {
        let mut board = Board::new();
        let before = board.clone();
        assert!(!board.undo(7, 7));
        assert!(!board.undo(usize::MAX, SIZE));
        assert_eq!(board.get_checked(usize::MAX, SIZE), None);
        assert_eq!(board.check_winner_at(SIZE, 0), None);
        assert_eq!(board, before);
    }

    #[test]
    fn apply_undo_restores_every_board_field() {
        let mut board = Board::new();
        board.place(7, 7, Cell::Black).unwrap();
        let before = board.clone();
        board.place(8, 8, Cell::White).unwrap();
        assert!(board.undo(8, 8));
        assert!(!board.undo(8, 8));
        assert_eq!(board, before);
    }

    #[test]
    fn full_draw_has_no_candidates_or_legal_moves() {
        let mut board = Board::new();
        for y in 0..SIZE {
            for x in 0..SIZE {
                let stone = if (x + 2 * y) % 4 < 2 { Cell::Black } else { Cell::White };
                board.place(x, y, stone).unwrap();
            }
        }
        assert!(board.is_full());
        assert_eq!(board.check_winner(), None);
        assert!(board.get_candidates(2).is_empty());
        assert!(board.legal_moves().is_empty());
    }

    #[test]
    fn candidate_radius_cannot_overflow_and_candidates_are_unique_legal_cells() {
        let mut board = Board::new();
        board.place(0, 0, Cell::Black).unwrap();
        let candidates = board.get_candidates(usize::MAX);
        let unique: std::collections::HashSet<_> = candidates.iter().copied().collect();
        assert_eq!(candidates.len(), SIZE * SIZE - 1);
        assert_eq!(unique.len(), candidates.len());
        assert!(candidates.iter().all(|&(x, y)| board.get_checked(x, y) == Some(Cell::Empty)));
        assert!(board.get_candidates(0).is_empty());
    }

    #[test]
    fn freestyle_accepts_overline_and_both_blocked_ends() {
        let mut board = Board::new();
        board.place(1, 7, Cell::White).unwrap();
        for x in 2..=7 { board.place(x, 7, Cell::Black).unwrap(); }
        board.place(8, 7, Cell::White).unwrap();
        assert_eq!(board.check_winner_at(4, 7), Some(Cell::Black));
    }
}
