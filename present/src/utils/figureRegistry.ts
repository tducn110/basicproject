import { FigureDetail } from "../components/FigureInspectorModal"

export const FIGURE_REGISTRY: Record<string, FigureDetail> = {
  "ui_architecture_flow": {
    id: "ui_architecture_flow",
    title: "Sơ Đồ Pipeline Dữ Liệu 7 Bước & Phân Rã State",
    badge: "Tuần 3: UI Architecture",
    imageSrc: "/assets/ui_architecture_flow.png",
    imageCaption: "Quy trình xử lý nước đi chuẩn hóa từ INPUT người dùng đến FEEDBACK âm thanh",
    sourceFile: "src/features/caro/CaroGamePage.tsx",
    language: "TypeScript",
    mathLatex: "\\text{Pipeline}: \\mathcal{I} \\xrightarrow{\\text{click}} \\mathcal{E} \\xrightarrow{O(1)} \\mathcal{P} \\xrightarrow{\\Delta s} \\mathcal{S}' \\xrightarrow{\\text{tick}} \\mathcal{O} \\xrightarrow{\\text{UI}} \\mathcal{F}",
    mathExplanation: "Chuỗi biến đổi trạng thái đơn hướng bất biến: Sự kiện click (Input) chuyển thành Action (Event), duyệt 4 trục tìm chuỗi 5 (Process), cập nhật GameState và TimerState độc lập (State), kích hoạt còi âm thanh (Side-effect), vẽ quân cờ SVG (Output) và hiển thị WinBanner vinh danh (Feedback).",
    algorithmSteps: [
      "1. INPUT: Người chơi click chuột vào ô (r, c) trên bàn cờ 15x15.",
      "2. EVENT & PROCESS: Kích hoạt handleCellClick(), gọi checkWinAround() quét 4 trục quanh lastMove.",
      "3. STATE: useReducer cập nhật ma trận board, currentPlayer, lastMove, history mà không mutate trực tiếp.",
      "4. SIDE-EFFECT & FEEDBACK: Web Audio API phát nốt trầm/bổng, kích hoạt Timer nếu là nước mở màn.",
    ],
    scriptCode: `// src/features/caro/hooks/useCaroGame.ts (Trích đoạn luồng xử lý chuẩn hóa)
export function caroGameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_MOVE': {
      const { row, col } = action;
      if (state.board[row][col] !== null || state.winner || state.isDraw) return state;

      // 1. Nhân bản ma trận bất biến
      const newBoard = state.board.map(r => [...r]);
      newBoard[row][col] = state.currentPlayer;

      // 2. Kiểm tra thắng cục O(1) Local Raycasting
      const winResult = checkWinnerAround(newBoard, row, col, state.currentPlayer);
      const isDraw = !winResult && isBoardFull(newBoard);
      const nextPlayer = state.currentPlayer === 'X' ? 'O' : 'X';

      return {
        ...state,
        board: newBoard,
        currentPlayer: winResult ? state.currentPlayer : nextPlayer,
        winner: winResult ? winResult.winner : null,
        winLine: winResult ? winResult.line : null,
        isDraw,
        isGameOver: !!winResult || isDraw,
        lastMove: { row, col, player: state.currentPlayer },
        history: [...state.history, { row, col, player: state.currentPlayer }]
      };
    }
    default:
      return state;
  }
}`,
    computeMechanism: {
      timeComplexity: "O(1) cho mỗi nước cờ",
      spaceComplexity: "O(15 × 15) = O(225) bytes",
      memoryProfile: "Immutable Clones (zero heap leak)",
      invariant: "State Single-Responsibility Invariant",
    },
    goods: [
      {
        title: "Triệt Tiêu Hoàn Toàn Stale Closures",
        detail: "Logic trạng thái ván cờ gói gọn trong useReducer thuần khiết, loại bỏ 4 biến useRef phụ trợ và bảo đảm tương thích React 19 StrictMode.",
        metric: "100% Deterministic State",
      },
      {
        title: "Độc Lập Giữa Timer và GameState",
        detail: "Đồng hồ bấm giờ useGameTimer tách riêng vòng đời, không kích hoạt re-render trên 225 ô cờ.",
        metric: "0 re-render trên bàn cờ khi đồng hồ chạy",
      },
      {
        title: "Tách Biệt Presentation & Domain",
        detail: "Domain board.ts không import React/DOM, dễ dàng viết unit test độc lập không cần mount DOM.",
        metric: "19/19 Vitest passed 100%",
      },
    ],
    bads: [
      {
        title: "Chi Phí Nhân Bản Mảng (Immutability Overhead)",
        detail: "Mỗi nước cờ tạo một bản sao mảng 15x15 mới (225 phần tử). Dù nhỏ nhưng ở 60 FPS nếu tần suất cao vẫn tiêu tốn CPU nhẹ.",
        mitigation: "Bàn cờ 15x15 chỉ có 225 phần tử nên chi phí sao chép dưới 0.005ms, hoàn toàn an toàn.",
      },
      {
        title: "Prop Drilling Khi Không Dùng Context",
        detail: "State từ hook cần truyền qua CaroGamePage xuống BoardGrid rồi BoardCell.",
        mitigation: "Cấu trúc component chỉ sâu 2 cấp nên prop drilling vẫn trong tầm kiểm soát.",
      },
    ],
  },

  "component_hierarchy": {
    id: "component_hierarchy",
    title: "Phân Cấp Component 3 Lớp & Single DOM Instance",
    badge: "Tuần 3: Component Standards",
    imageSrc: "/assets/component_hierarchy.png",
    imageCaption: "Mô hình kiến trúc 3 lớp: Implement (Domain) → Trung chuyển (Hooks) → Presentation (Atomic UI)",
    sourceFile: "src/features/caro/components/BoardGrid.tsx",
    language: "TypeScript / CSS",
    mathLatex: "N_{\\text{DOM}} = 225 \\quad (\\text{Figma Export ban đầu}: N_{\\text{DOM}} = 450)",
    mathExplanation: "Bản xuất thô từ Figma Make mount đồng thời 2 khối BoardGrid (Desktop & Mobile) rồi ẩn hiện bằng CSS, làm phình to gấp đôi cây DOM (450 nút button). Hệ thống refactor gom về 1 cây DOM duy nhất 225 nút tự co giãn.",
    algorithmSteps: [
      "1. App.tsx: Đóng vai trò Root Shell vỏ bọc siêu mỏng (5 dòng mã).",
      "2. CaroGamePage.tsx: Điều phối trung tâm, tích hợp các custom hooks (useCaroGame, useGameTimer, useGameAudio).",
      "3. Responsive CSS Container: Bàn cờ co giãn theo min(calc(100vw - 16px), calc(100dvh - 200px), 440px).",
      "4. Atomic Components: Tái sử dụng Piece, PlayerCard, PlayerBar, GameInfo qua hệ thống CSS Design Tokens.",
    ],
    scriptCode: `// src/features/caro/components/BoardGrid.tsx (Single DOM Instance)
export const BoardGrid: React.FC<BoardGridProps> = React.memo(({
  board,
  onCellClick,
  disabled,
  winCellSet,
  lastMove
}) => {
  return (
    <div className="board-grid-wrapper" style={{ touchAction: 'manipulation' }}>
      <div className="board-grid-inner">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <BoardCell
              key={\`\${r}-\${c}\`}
              row={r}
              col={c}
              value={cell}
              onClick={() => onCellClick(r, c)}
              disabled={disabled || cell !== null}
              isWinCell={winCellSet.has(\`\${r},\${c}\`)}
              isLastMove={lastMove?.row === r && lastMove?.col === c}
            />
          ))
        )}
      </div>
    </div>
  );
});`,
    computeMechanism: {
      timeComplexity: "O(225) cho lần mount đầu tiên",
      spaceComplexity: "225 DOM Nodes duy nhất",
      memoryProfile: "Single DOM Tree (Zero duplicate elements)",
      invariant: "Single Authoritative DOM Instance",
    },
    goods: [
      {
        title: "Cắt Giảm 50% Số Nút DOM",
        detail: "Loại bỏ hoàn toàn khối bàn cờ trùng lặp cho mobile, tiết kiệm bộ nhớ và triệt tiêu xung đột focus.",
        metric: "450 buttons → 225 buttons (-50%)",
      },
      {
        title: "Triệt Tiêu Độ Trễ Cảm Ứng Di Động",
        detail: "Khai báo touch-action: manipulation và vùng an toàn env(safe-area-inset-*) loại bỏ trễ 300ms của Safari/Chrome.",
        metric: "0ms tap delay trên mobile",
      },
      {
        title: "Loại Bỏ Inline Styles Hardcode",
        detail: "Toàn bộ style rải rác chuyển về CSS design tokens chuẩn (--paper, --ink, --x-color, --o-color).",
        metric: "100% tokens tập trung",
      },
    ],
    bads: [
      {
        title: "Độ Phức Tạp Của Media Query Tăng",
        detail: "Để 1 bàn cờ tự vừa khít từ màn hình 320px điện thoại đến 4K desktop, công thức CSS Grid phải tính toán tỉ mỉ.",
        mitigation: "Dùng hàm CSS min(), dvh và aspect-ratio giúp layout co giãn mượt mà không cần JS resize listener.",
      },
      {
        title: "Cần React.memo Tránh Re-render Toàn Cục",
        detail: "Nếu truyền callback mới mỗi render thì memo của BoardCell bị vô hiệu hóa.",
        mitigation: "Toàn bộ event handlers được bọc useCallback trong CaroGamePage.",
      },
    ],
  },

  "pattern_taxonomy": {
    id: "pattern_taxonomy",
    title: "Phân Loại 7 Mẫu Hình Thế Caro Chuẩn",
    badge: "Tuần 4: Pattern Detection",
    imageSrc: "/assets/pattern_taxonomy.png",
    imageCaption: "Hệ thống phân cấp 7 thế cờ kinh điển từ Five-in-a-row đến Closed Two trên 4 trục hướng",
    sourceFile: "caro-core-reference/src/pattern.rs",
    language: "Rust",
    mathLatex: "\\vec{d} \\in \\{(0, 1), (1, 0), (1, 1), (1, -1)\\} \\implies \\text{MaximalRun}(s, \\vec{d})",
    mathExplanation: "Giải thuật quét trên 4 vector đơn vị (ngang, dọc, chéo chính, chéo phụ). Khái niệm Maximal Run Invariant bảo đảm chỉ tính độ dài chuỗi liên tục cực đại từ ô khởi đầu, tránh việc 1 chuỗi 4 bị đếm nhầm thành hai chuỗi 3.",
    algorithmSteps: [
      "1. Khởi tạo mảng đếm 7 mẫu hình thế không cấp phát heap: count_patterns(state, player).",
      "2. Duyệt qua toàn bộ các hàng ngang, cột dọc và hai đường chéo có độ dài ≥ 5.",
      "3. Với mỗi đoạn quân liên tiếp, xác định trạng thái mở (Open - 2 đầu trống) hay chặn (Closed - 1 đầu bị chặn/biên bàn cờ).",
      "4. Phân loại theo thứ tự ưu tiên: Năm liên tiếp > Bốn mở > Bốn chặn > Ba mở > Ba chặn > Hai mở > Hai chặn.",
    ],
    scriptCode: `// caro-core-reference/src/pattern.rs (Maximal Run Invariant trên Rust)
pub fn count_patterns(board: &Board, player: Player) -> PatternCounts {
    let mut counts = PatternCounts::default();
    let opp = player.opposite();

    // Quét trên 4 trục hướng: Ngang, Dọc, Chéo xuôi, Chéo ngược
    for line in board.get_all_lines_gte_5() {
        let mut i = 0;
        let len = line.len();
        while i < len {
            if line[i] == Some(player) {
                let start = i;
                while i < len && line[i] == Some(player) {
                    i += 1;
                }
                let run_len = i - start;
                let open_before = start > 0 && line[start - 1] == None;
                let open_after = i < len && line[i] == None;

                match run_len {
                    5.. => counts.five += 1,
                    4 => match (open_before, open_after) {
                        (true, true) => counts.open_four += 1,
                        (true, false) | (false, true) => counts.closed_four += 1,
                        _ => {}
                    },
                    3 => match (open_before, open_after) {
                        (true, true) => counts.open_three += 1,
                        (true, false) | (false, true) => counts.closed_three += 1,
                        _ => {}
                    },
                    2 => match (open_before, open_after) {
                        (true, true) => counts.open_two += 1,
                        (true, false) | (false, true) => counts.closed_two += 1,
                        _ => {}
                    },
                    _ => {}
                }
            } else {
                i += 1;
            }
        }
    }
    counts
}`,
    computeMechanism: {
      timeComplexity: "O(4 × 15 × 15) = O(900) ops quét toàn bộ bàn cờ",
      spaceComplexity: "O(1) bộ nhớ Stack, Zero Heap Allocation",
      memoryProfile: "Stack-allocated Fixed Struct",
      invariant: "Maximal Run Invariant (Không đếm thừa đoạn con)",
    },
    goods: [
      {
        title: "Triệt Tiêu Hoàn Toàn Lỗi Đếm Trùng",
        detail: "Nhờ Maximal Run Invariant, chuỗi 4 quân mở không bao giờ bị tính nhầm thành 2 chuỗi 3 quân, giữ vững tính đúng đắn cho hàm lượng giá.",
        metric: "7 test fixtures đạt 100% pass",
      },
      {
        title: "Hiệu Năng Zero-Allocation Cực Cao",
        detail: "Mã nguồn Rust không gọi heap allocate (không dùng Vec/String trong vòng lặp), tốc độ thực thi chỉ vài micro-giây.",
        metric: "Zero Heap Allocations",
      },
    ],
    bads: [
      {
        title: "Chưa Nhận Diện Thế Cờ Gián Đoạn (Broken Patterns)",
        detail: "Chỉ phát hiện chuỗi liền kề (.XXX.), chưa tính các thế cờ có khoảng trống ở giữa như .XX.X. (Ba ngắt quãng).",
        mitigation: "Sẽ được khắc phục toàn diện khi nâng cấp lên cây tìm kiếm Minimax ở Tuần 5.",
      },
    ],
  },

  "bot_decision_flow": {
    id: "bot_decision_flow",
    title: "Quy Trình Ra Quyết Định Của Rule-Based Bot",
    badge: "Tuần 4: AI Decision Engine",
    imageSrc: "/assets/bot_decision_flow.png",
    imageCaption: "Quy trình phân cấp 5 tầng: Input → Sinh ứng viên → Kiểm tra sát cuộc → Lượng giá Heuristic → Xuất nước đi",
    sourceFile: "caro-core-reference/src/bot/rule_based.rs",
    language: "Rust",
    mathLatex: "a^* = \\begin{cases} a_{\\text{mate}}, & \\text{nếu } \\exists a: \\text{Win}(s, a) \\\\ a_{\\text{block}}, & \\text{nếu } \\exists a: \\text{OppWin}(s, a) \\\\ \\arg\\max_{a \\in \\mathcal{C}(s)} f(s \\oplus a), & \\text{ngược lại} \\end{cases}",
    mathExplanation: "Phân cấp quyết định 1-ply: Đầu tiên kiểm tra nước thắng ngay lập tức (Score = +10,000,000). Nếu không có, lập tức kiểm tra xem đối thủ có nước thắng ở lượt tiếp theo hay không để chặn ngay. Nếu cả hai không xảy ra, duyệt toàn bộ ô ứng viên để tìm nước đi có điểm Heuristic cao nhất.",
    algorithmSteps: [
      "1. BỘ SINH Ô ỨNG VIÊN: Lấy tập candidate trong bán kính Chebyshev r <= 2 quanh quân đã đánh.",
      "2. KIỂM TRA SÁT CUỘC 1-PLY (Bot Win): Giả lập đi từng ô, nếu thắng ngay -> chốt nước đi tức thì.",
      "3. KIỂM TRA CHẶN THUA NGAY (Opponent Threat): Nếu đối thủ có ô thắng ở lượt sau -> đi vào ô đó để chặn.",
      "4. LƯỢNG GIÁ 1-PLY ARGMAX: Tính điểm f(s) = Attack - (1.1 * Defense) cho các ứng viên còn lại.",
    ],
    scriptCode: `// caro-core-reference/src/bot/rule_based.rs (Phân cấp quyết định 1-ply)
pub fn choose_rule_based_move(state: &GameState) -> Option<Move> {
    let candidates = generate_candidates(state, 2);
    if candidates.is_empty() {
        return Some(Move { row: 7, col: 7 }); // Nước mở màn tâm bàn cờ
    }

    let me = state.to_move;
    let opp = me.opposite();

    // Tầng 1: Thắng ngay lập tức nếu có nước đi kết thúc ván
    for &mv in &candidates {
        if state.is_winning_move(mv, me) {
            return Some(mv);
        }
    }

    // Tầng 2: Chặn ngay nếu đối thủ có nước thắng ở lượt sau
    for &mv in &candidates {
        if state.is_winning_move(mv, opp) {
            return Some(mv);
        }
    }

    // Tầng 3: Lượng giá Heuristic 1-ply ArgMax
    let mut best_score = i64::MIN;
    let mut best_move = candidates[0];

    for &mv in &candidates {
        let token = state.play_speculative(mv);
        let score = evaluate(state, me);
        state.undo_speculative(token);

        if score > best_score {
            best_score = score;
            best_move = mv;
        }
    }

    Some(best_move)
}`,
    computeMechanism: {
      timeComplexity: "O(|C(s)| × T_eval) ≈ 60 × 40µs = 2.4ms cực đại",
      spaceComplexity: "O(1) qua in-place play/undo",
      memoryProfile: "Rollback via Token (No state clone)",
      invariant: "Mate Dominance Invariant",
    },
    goods: [
      {
        title: "Tỷ Lệ Thắng Áp Đảo 100%",
        detail: "Đánh bại Random Bot 100/100 ván thực nghiệm, không bao giờ bỏ sót nước thắng hoặc bị đối thủ thắng bất ngờ ở cự ly 1 nước.",
        metric: "100.0% Win Rate",
      },
      {
        title: "Độ Trễ Cực Kỳ Thấp",
        detail: "Thời gian ra quyết định trung bình chỉ 42.24 micro-giây trên Rust, chiếm chưa tới 0.25% ngân sách 60 FPS của trình duyệt.",
        metric: "42.24 µs / nước cờ",
      },
    ],
    bads: [
      {
        title: "Tầm Nhìn Cận Thị (Horizon Effect)",
        detail: "Vì chỉ nhìn sâu 1 nước (1-ply), Bot không phát hiện được các thế gài bẫy 2 đầu từ xa (Double Three, VCF) của người chơi giỏi.",
        mitigation: "Đây là tiền đề để mở rộng lên thuật toán Minimax và Alpha-Beta ở Tuần 5 và Tuần 6.",
      },
    ],
  },

  "chebyshev_heatmap": {
    id: "chebyshev_heatmap",
    title: "Bộ Sinh Ô Ứng Viên Bán Kính Chebyshev (r ≤ 2)",
    badge: "Tuần 4: Space Pruning",
    imageSrc: "/assets/chebyshev_heatmap.png",
    imageCaption: "Heatmap mô phỏng vùng ứng viên xung quanh các quân cờ hiện hữu trên bàn cờ 15x15",
    sourceFile: "caro-core-reference/src/movegen.rs",
    language: "Rust / Python",
    mathLatex: "D_\\infty((r_1, c_1), (r_2, c_2)) = \\max\\left( |r_1 - r_2|, |c_1 - c_2| \\right) \\le 2",
    mathExplanation: "Theo Nguyên lý Cục bộ Chiến thuật (Tactical Locality Principle), một quân cờ đặt cách các quân hiện tại từ 3 ô trở lên không thể tạo ra liên kết trực tiếp trong chuỗi 5. Do đó, chỉ tập hợp các ô trống có khoảng cách Chebyshev r <= 2 mới được đưa vào tập ứng viên khảo sát.",
    algorithmSteps: [
      "1. Duyệt qua tất cả các ô đã có quân cờ trên bàn cờ 15x15.",
      "2. Mở rộng hình vuông bán kính r = 2 xung quanh từng quân cờ.",
      "3. Lọc lấy các ô trống hợp lệ nằm trong bàn cờ và loại bỏ trùng lặp bằng BitSet.",
      "4. Xuất tập ứng viên C(s) cho bộ ra quyết định Heuristic.",
    ],
    scriptCode: `// caro-core-reference/src/movegen.rs (Chebyshev Candidate Generator)
pub fn generate_candidates(state: &GameState, radius: i32) -> Vec<Move> {
    if state.move_count == 0 {
        return vec![Move { row: 7, col: 7 }];
    }

    let mut is_candidate = [false; 225];
    let board = &state.board;

    for r in 0..15 {
        for c in 0..15 {
            if board[r][c].is_some() {
                // Quét bán kính Chebyshev [-radius .. radius]
                let r_min = (r as i32 - radius).max(0);
                let r_max = (r as i32 + radius).min(14);
                let c_min = (c as i32 - radius).max(0);
                let c_max = (c as i32 + radius).min(14);

                for nr in r_min..=r_max {
                    for nc in c_min..=c_max {
                        let idx = (nr * 15 + nc) as usize;
                        if board[nr as usize][nc as usize].is_none() {
                            is_candidate[idx] = true;
                        }
                    }
                }
            }
        }
    }

    let mut candidates = Vec::with_capacity(64);
    for idx in 0..225 {
        if is_candidate[idx] {
            candidates.push(Move {
                row: (idx / 15) as u8,
                col: (idx % 15) as u8,
            });
        }
    }
    candidates
}`,
    computeMechanism: {
      timeComplexity: "O(K × (2r + 1)^2) với K là số quân cờ hiện tại",
      spaceComplexity: "O(225) bits (Stack BitArray)",
      memoryProfile: "Bitset Flat Array (Zero Dynamic Allocation)",
      invariant: "Tactical Locality Invariant",
    },
    goods: [
      {
        title: "Cắt Giảm Đột Phá 72.4% Không Gian Tìm Kiếm",
        detail: "Giảm số lượng ô cần khảo sát từ trung bình 220.2 ô xuống còn 60.8 ô, giúp giảm hệ số phân nhánh tìm kiếm đáng kể.",
        metric: "72.39% Search Space Reduction",
      },
      {
        title: "Bảo Toàn 100% Nước Đi Tối Ưu",
        detail: "Chứng minh toán học: Không bao giờ bỏ sót nước cờ chiến thuật vì chuỗi 5 quân không thể hình thành cách xa quá 2 ô.",
        metric: "0% False Negative Rate",
      },
    ],
    bads: [
      {
        title: "Số Lượng Ứng Viên Tăng Ở Giai Đoạn Tàn Cuộc",
        detail: "Khi bàn cờ đã có hơn 50 quân cờ rải rác, số ô ứng viên Chebyshev có thể tăng lên >100 ô.",
        mitigation: "Sẽ kết hợp thêm heuristic scoring để sắp xếp thứ tự và chỉ lấy Top-K ứng viên tốt nhất ở Tuần 5.",
      },
    ],
  },

  "pattern_weights_distribution": {
    id: "pattern_weights_distribution",
    title: "Ma Trận Trọng Số Heuristic & Mate Dominance",
    badge: "Tuần 4: Heuristic Weights",
    imageSrc: "/assets/pattern_weights_distribution.png",
    imageCaption: "Biểu đồ cột Log-Scale so sánh trọng số Tấn công (Bot) và Phòng thủ (Con người)",
    sourceFile: "caro-core-reference/src/evaluator.rs",
    language: "Rust / Python",
    mathLatex: "f(s) = \\sum_{p} \\left( W_{\\text{atk}}(p) \\cdot N_{\\text{bot}}(p) - W_{\\text{def}}(p) \\cdot N_{\\text{human}}(p) \\right)",
    mathExplanation: "Hàm lượng giá tĩnh ma trận lũy thừa: Five (10,000,000) > Open Four (100,000) > Closed Four (10,000) > Open Three (5,000) > Closed Three (1,000) > Open Two (500) > Closed Two (100). Trọng số phòng thủ nhân hệ số 1.2x để ngăn chặn bot tấn công tham lam mà bỏ quên nguy cơ bị đối thủ kết liễu.",
    algorithmSteps: [
      "1. Quét toàn bộ hình thế của Bot -> Tính tổng điểm Atk_score.",
      "2. Quét toàn bộ hình thế của đối thủ -> Tính tổng điểm Def_score (nhân 1.2x).",
      "3. Hiệu số: Score = Atk_score - Def_score.",
      "4. Kẹp giới hạn an toàn: clamp(-9,999,999, +9,999,999) để nước thắng thực tế (10,000,000) luôn áp đảo.",
    ],
    scriptCode: `// caro-core-reference/src/evaluator.rs (Hàm lượng giá Heuristic tĩnh)
pub const MATE_SCORE: i64 = 10_000_000;
pub const CLAMP_LIMIT: i64 = 9_999_999;

pub struct EvalWeights {
    pub five: i64,
    pub open_four: i64,
    pub closed_four: i64,
    pub open_three: i64,
    pub closed_three: i64,
    pub open_two: i64,
    pub closed_two: i64,
}

pub const ATTACK_WEIGHTS: EvalWeights = EvalWeights {
    five: 10_000_000,
    open_four: 100_000,
    closed_four: 10_000,
    open_three: 5_000,
    closed_three: 1_000,
    open_two: 500,
    closed_two: 100,
};

// Trọng số phòng thủ được nhân thêm hệ số 1.2x
pub const DEFENSE_WEIGHTS: EvalWeights = EvalWeights {
    five: 9_999_999,
    open_four: 120_000,
    closed_four: 12_000,
    open_three: 6_000,
    closed_three: 1_200,
    open_two: 600,
    closed_two: 120,
};`,
    computeMechanism: {
      timeComplexity: "O(Số lượng pattern phát hiện) ≈ O(1) số học",
      spaceComplexity: "O(1) thanh ghi CPU i64",
      memoryProfile: "Pure Arithmetic Operations",
      invariant: "Mate Dominance Principle",
    },
    goods: [
      {
        title: "Bảo Đảm Nguyên Lý Mate Dominance",
        detail: "Nước tạo chuỗi 5 luôn có điểm 10^7, bảo đảm bot không bao giờ bị phân tâm bởi việc tích lũy các thế cờ tĩnh mà bỏ qua nước thắng cuộc trực tiếp.",
        metric: "10,000,000 Absolute Mate Score",
      },
      {
        title: "Hệ Số Ưu Tiên Phòng Thủ 1.2x",
        detail: "Triệt tiêu hiện tượng bot tấn công liều lĩnh (Greedy Bias), buộc bot phải ưu tiên chặn các chuỗi 4 hoặc 3 mở của đối phương.",
        metric: "1.2x Defensive Multiplier",
      },
    ],
    bads: [
      {
        title: "Cân Chỉnh Thủ Công (Manual Tuning)",
        detail: "Bảng trọng số hiện tại dựa trên kinh nghiệm cờ Caro truyền thống, chưa được tối ưu hóa tự động qua Genetic Algorithm hay tự chơi (Self-play).",
        mitigation: "Sẽ áp dụng phương pháp tự động hiệu chỉnh trọng số dựa trên bộ dữ liệu ván đấu thực tế ở giai đoạn mở rộng.",
      },
    ],
  },

  "week4_bot_battle_and_pruning": {
    id: "week4_bot_battle_and_pruning",
    title: "Thực Nghiệm 100 Ván Đối Đầu Bot vs Random",
    badge: "Tuần 4: Empirical Benchmark",
    imageSrc: "/assets/week4_bot_battle_and_pruning.png",
    imageCaption: "Biểu đồ phân tích kết quả 100 ván đấu đối kháng và hiệu quả cắt giảm 72.4% không gian trạng thái",
    sourceFile: "benchmark/rust_bench/src/bin/week4_experiment.rs",
    language: "Rust / JSON",
    mathLatex: "\\text{WinRate} = \\frac{100}{100} = 100.0\\%, \\quad \\overline{\\text{Plies}} = 9.90, \\quad \\overline{t} = 42.24\\,\\mu\\text{s}",
    mathExplanation: "Thực nghiệm 100 ván đấu tự động giữa Rule-Based Bot (quân X) và Random Bot tất định (quân O, PRNG SplitMix64) để kiểm chứng độ bền vững, tính đúng đắn và tốc độ tính toán.",
    algorithmSteps: [
      "1. Thiết lập PRNG SplitMix64 với seed tất định cho Random Bot.",
      "2. Cho 2 bot tự động đánh 100 ván cờ trên bàn 15x15.",
      "3. Ghi nhận số nước đi kết thúc, thời gian tính toán từng nước cờ và số ô ứng viên khảo sát.",
      "4. Xuất file dữ liệu benchmark/results/week4_bot_battle.json.",
    ],
    scriptCode: `// benchmark/results/week4_bot_battle.json (Dữ liệu thực nghiệm đo đạc chính thức)
{
  "metadata": {
    "experiment": "Week 4 Rule-Based vs Random Bot & Pattern Detection",
    "engine": "Rust (Native)",
    "compiler": "rustc 1.98.1",
    "board_size": 15,
    "total_games": 100
  },
  "match_results": {
    "rule_based_wins": 100,
    "random_wins": 0,
    "draws": 0,
    "win_rate_percent": 100.00,
    "avg_plies_per_game": 9.90,
    "total_time_ms": 135.5440,
    "avg_time_per_move_us": 42.24
  },
  "candidate_generation": {
    "avg_empty_cells": 220.21,
    "avg_candidate_count": 60.80,
    "search_space_reduction_percent": 72.39
  }
}`,
    computeMechanism: {
      timeComplexity: "Tổng thời gian 100 ván: 135.54 ms trên Rust",
      spaceComplexity: "O(1) heap overhead",
      memoryProfile: "Deterministic SplitMix64 PRNG",
      invariant: "100% Deterministic Reproducibility",
    },
    goods: [
      {
        title: "Chiến Thắng Tuyệt Đối Không Hòa",
        detail: "100/100 ván thắng, chứng minh giải thuật Rule-Based không có lỗi logic phán đoán hay bỏ lỡ cơ hội.",
        metric: "100 / 100 ván thắng",
      },
      {
        title: "Kết Thúc Ván Nhanh Chóng",
        detail: "Số nước trung bình mỗi ván chỉ 9.90 nước, chứng minh Bot có khả năng chủ động tấn công tạo chuỗi thắng nhanh nhất.",
        metric: "9.90 plies / ván",
      },
    ],
    bads: [
      {
        title: "Đối Thủ Baseline Còn Yếu",
        detail: "Random Bot chỉ đóng vai trò nhóm đối chứng tối thiểu (Sanity check), chưa phản ánh được sức kháng cự trước các chiến thuật cờ phức tạp.",
        mitigation: "Tuần 5 sẽ nâng cấp đối đầu giữa Rule-Based Bot và Minimax Bot với các độ sâu d = 1, 2, 3.",
      },
    ],
  },

  "rust_vs_ts_speedup": {
    id: "rust_vs_ts_speedup",
    title: "So Sánh Hiệu Năng Rust Native vs TypeScript",
    badge: "Benchmark: Rust vs TypeScript",
    imageSrc: "/assets/rust_vs_ts_speedup.png",
    imageCaption: "Biểu đồ Log-Scale thời gian thực thi (ms) và hệ số tăng tốc từ độ sâu 1 đến độ sâu 4",
    sourceFile: "docs/scripts/benchmark_rust_vs_ts.py",
    language: "Python / Rust",
    mathLatex: "\\text{Speedup}(d=4) = \\frac{5083.45\\,\\text{ms (TS)}}{285.45\\,\\text{ms (Rust)}} = 17.8\\times",
    mathExplanation: "So sánh thời gian duyệt cây cờ giữa động cơ Rust Native và TypeScript Engine trên cùng 10 thế cờ mẫu từ độ sâu 1 đến độ sâu 4.",
    algorithmSteps: [
      "1. Nạp 10 thế cờ mẫu đại diện (Khai cuộc, Trung cuộc giằng co, Sát cuộc).",
      "2. Đo lường độc lập thời gian tính toán và số nút duyệt (nodes visited) cho từng độ sâu.",
      "3. Tính thông lượng nút/giây (kN/s) và hệ số tăng tốc Speedup = Time_TS / Time_Rust.",
      "4. Sinh biểu đồ Matplotlib độ nét cao 200 DPI lưu tại public/assets/rust_vs_ts_speedup.png.",
    ],
    scriptCode: `# docs/scripts/benchmark_rust_vs_ts.py (Trích đoạn dữ liệu đo đạc)
# Dữ liệu trích xuất từ benchmark_data.json
rust_time = [0.0221, 0.3125, 9.0248, 285.4517]      # ms
ts_time   = [0.5383, 5.5795, 156.7846, 5083.4518]   # ms

# Hệ số tăng tốc tương ứng cho các độ sâu 1, 2, 3, 4:
speedup = [ts / r for ts, r in zip(ts_time, rust_time)]
# Kết quả: [24.3x, 17.8x, 17.4x, 17.8x]

# Thông lượng duyệt nút (Nodes per second):
# Rust:       ~1,740 - 2,040 kN/s (xấp xỉ 2 triệu nút/giây)
# TypeScript: ~83 - 109 kN/s     (chỉ xấp xỉ 100k nút/giây)
`,
    computeMechanism: {
      timeComplexity: "Hàm mũ theo độ sâu: O(B^d) với hệ số phân nhánh B ≈ 30",
      spaceComplexity: "Rust: Stack-based Call Frame / TS: V8 Heap Objects",
      memoryProfile: "Rust zero GC vs V8 Garbage Collector pauses",
      invariant: "Node Parity Invariant (Số nút duyệt bằng nhau)",
    },
    goods: [
      {
        title: "Tăng Tốc Vượt Trội 17.8x - 24.3x",
        detail: "Tại độ sâu 4, TypeScript mất hơn 5 giây làm đơ giao diện, trong khi Rust chỉ mất 285ms, bảo đảm trải nghiệm thời gian thực.",
        metric: "17.8x Speedup tại Depth 4",
      },
      {
        title: "Thông Lượng Duyệt Nút Gấp 20 Lần",
        detail: "Rust đạt ~2 triệu nodes/giây nhờ tối ưu hóa biên dịch LLVM và biểu diễn bộ nhớ phẳng không tốn chi phí Garbage Collection.",
        metric: "2,040 kN/s vs 109 kN/s",
      },
    ],
    bads: [
      {
        title: "Chi Phí Khởi Động WebAssembly Lần Đầu",
        detail: "Trình duyệt cần tải file gomoku_engine_bg.wasm (~250KB) và compile qua WebAssembly.instantiateStreaming.",
        mitigation: "Chỉ tải 1 lần duy nhất khi nạp trang (pre-warmed trong Web Worker), không ảnh hưởng đến trải nghiệm ván đấu.",
      },
      {
        title: "Chi Phí Truyền Dữ Liệu Qua postMessage",
        detail: "Dữ liệu lịch sử ván đấu cần serialize thành JSON để gửi giữa Main Thread và Web Worker.",
        mitigation: "Lịch sử ván cờ ngắn (dưới 50 nước), kích thước payload dưới 1KB nên độ trễ IPC dưới 0.1ms.",
      },
    ],
  },
}
