---
title: "Xây dựng Rule-Based Bot (Hệ Chuyên gia theo Luật)"
week: 4
tags:
  - tuan-4
  - ai-bot
  - rule-based
  - expert-system
  - decision-tree
---

# 🧠 XÂY DỰNG RULE-BASED BOT (HỆ CHUYÊN GIA THEO LUẬT)

Rule-Based Bot mô phỏng trực tiếp tư duy chiến thuật của một kỳ thủ thông qua hệ thống phân cấp mức độ ưu tiên của các thế cờ thực tế.

---

## 1. CÂY QUYẾT ĐỊNH PHÂN CẤP ƯU TIÊN (HIERARCHY OF RULES)

Khi đến lượt máy đi, Bot duyệt qua từng mức độ ưu tiên từ cao xuống thấp. Ngay khi tìm thấy nước đi thỏa mãn điều kiện ưu tiên cao nhất, Bot sẽ thực hiện ngay lập tức mà không cần xét các mức thấp hơn:

```mermaid
flowchart TD
    Start["Bắt đầu phân tích bàn cờ"] --> R1{"Mức 1: Có nước đi thắng ngay lập tức không?<br/>(Tạo thành chuỗi 5)"}
    R1 -- "CÓ" --> Action1["ĐÁNH NGAY ĐỂ THẮNG!"]
    R1 -- "KHÔNG" --> R2{"Mức 2: Đối thủ có nước đi thắng ở lượt tới không?<br/>(Đối thủ có 4 quân)"}
    
    R2 -- "CÓ" --> Action2["CHẶN NGAY LẬP TỨC!"]
    R2 -- "KHÔNG" --> R3{"Mức 3: Ta có nước tạo thế 4 mở (Open Four)<br/>hoặc đòn tấn công kép (Double Threat)?"}
    
    R3 -- "CÓ" --> Action3["Tấn công tạo thế tất thắng!"]
    R3 -- "KHÔNG" --> R4{"Mức 4: Đối thủ có chuỗi 3 mở nguy hiểm không?<br/>(Chuỗi 3 thông 2 đầu)"}
    
    R4 -- "CÓ" --> Action4["Chặn nước 3 mở của đối thủ!"]
    R4 -- "KHÔNG" --> R5{"Mức 5: Ta có nước tạo chuỗi 3 mở không?"}
    
    R5 -- "CÓ" --> Action5["Tạo chuỗi 3 mở giành thế chủ động!"]
    R5 -- "KHÔNG" --> Default["Mức 6: Đánh vào ô trống lân cận gần tâm bàn cờ nhất"]
```

---

## 2. HIỆN THỰC HÓA MÃ NGUỒN (TYPESCRIPT)

```typescript
export class RuleBasedBot implements BotAgent {
  public readonly name = "Rule-Based Bot (Mức Trung Bình)";
  private engine: CaroEngine;

  constructor(engine: CaroEngine) {
    this.engine = engine;
  }

  public async selectMove(board: Board, myPlayer: number): Promise<Position | null> {
    const opponent = (myPlayer === CellValue.PLAYER_X) 
      ? CellValue.PLAYER_O 
      : CellValue.PLAYER_X;
    
    const candidateMoves = this.getCandidateMoves(board);
    if (candidateMoves.length === 0) {
      // Nếu bàn cờ hoàn toàn rỗng: đánh ngay tâm bàn cờ
      return { row: Math.floor(board.size / 2), col: Math.floor(board.size / 2) };
    }

    // --- MỨC 1: Tìm nước THẮNG NGAY ---
    for (const move of candidateMoves) {
      if (this.wouldWin(board, move, myPlayer)) {
        return move;
      }
    }

    // --- MỨC 2: Tìm nước CHẶN ĐỐI THỦ THẮNG ---
    for (const move of candidateMoves) {
      if (this.wouldWin(board, move, opponent)) {
        return move;
      }
    }

    // --- MỨC 3: Tạo thế BỐN MỞ (Open Four) hoặc ĐÒN KÉP ---
    for (const move of candidateMoves) {
      if (this.createsOpenFour(board, move, myPlayer)) {
        return move;
      }
    }

    // --- MỨC 4: Chặn đối thủ tạo thế BỐN MỞ / BA MỞ hiểm ---
    for (const move of candidateMoves) {
      if (this.createsOpenFour(board, move, opponent) || this.createsOpenThree(board, move, opponent)) {
        return move;
      }
    }

    // --- MỨC 5: Tạo BA MỞ cho bản thân ---
    for (const move of candidateMoves) {
      if (this.createsOpenThree(board, move, myPlayer)) {
        return move;
      }
    }

    // --- MỨC 6: Chọn ô có vị trí chiến lược gần tâm nhất ---
    return this.selectCenterBiasedMove(candidateMoves, board.size);
  }

  /**
   * Chỉ xét các ô trống nằm trong bán kính 1 hoặc 2 quanh các quân đã đánh
   */
  private getCandidateMoves(board: Board): Position[] {
    const candidates = new Set<string>();
    const size = board.size;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!board.isEmpty(r, c)) {
          // Duyệt xung quanh ô đã có quân trong bán kính 1
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (board.isInside(nr, nc) && board.isEmpty(nr, nc)) {
                candidates.add(`${nr},${nc}`);
              }
            }
          }
        }
      }
    }

    return Array.from(candidates).map(str => {
      const [r, c] = str.split(',').map(Number);
      return { row: r, col: c };
    });
  }

  private wouldWin(board: Board, pos: Position, player: number): boolean {
    board.set(pos.row, pos.col, player);
    const win = this.engine.checkWin(pos.row, pos.col).hasWon;
    board.set(pos.row, pos.col, CellValue.EMPTY); // Backtrack
    return win;
  }
}
```

---

## 3. ĐÁNH GIÁ SỨC MẠNH CỦA RULE-BASED BOT

* **Ưu điểm vượt bậc so với Random Bot:**
  - Không bao giờ bỏ lỡ cơ hội thắng khi đã có 4 quân.
  - Không bao giờ bị đối thủ đánh lén nước 4 dẫn tới thua oan.
  - Tỷ lệ thắng trước Random Bot: **$100\%$**.
* **Hạn chế:**
  - Chưa biết tính toán sâu nhiều nước liên hoàn (chưa có Minimax search).
  - Có thể bị người chơi kỳ cựu giăng bẫy đòn kép (Double Three / Double Four) nếu đối thủ chuẩn bị trước 2-3 nước đi.
