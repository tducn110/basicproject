---
title: "Tích hợp Hệ thống 6 Mức độ Khó của Bot (Difficulty Tiers)"
week: 7
tags:
  - tuan-7
  - bot-levels
  - difficulty-tiers
  - factory-pattern
  - architecture
---

# 🎚️ TÍCH HỢP HỆ THỐNG 6 MỨC ĐỘ KHÓ CỦA BOT (DIFFICULTY TIERS)

Để đáp ứng trọn vẹn yêu cầu trong bản Đề cương chính thức, hệ thống phân cấp 6 mức độ khó của AI Bot theo cấu hình kỹ thuật cụ thể:

---

## 1. MA TRẬN ĐẶC TẢ 6 MỨC ĐỘ KHÓ

| Cấp độ (Level) | Tên hiển thị | Thuật toán cốt lõi | Kỹ thuật tối ưu tích hợp | Độ sâu ($d$) | Thời gian ra nước |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **Level 1** | **Easy (Dễ)** | Random Move | Lọc các ô trống ngẫu nhiên | $0$ | Tức thì ($< 1\text{ms}$) |
| **Level 2** | **Normal (Vừa)** | Heuristic / Rule-Based | Bảng mẫu thế cờ tĩnh | $1$ | $\approx 2 - 5\text{ms}$ |
| **Level 3** | **Hard (Khó)** | Minimax thuần túy | Candidate Moves ($r=1$) | $2$ | $\approx 10 - 30\text{ms}$ |
| **Level 4** | **Very Hard (Rất khó)**| Minimax + Alpha-Beta | Cắt tỉa Alpha-Beta cơ bản | $3$ | $\approx 30 - 80\text{ms}$ |
| **Level 5** | **Expert (Chuyên gia)**| Alpha-Beta Pruning | Candidate Moves + Move Ordering | $4 - 5$ | $\approx 50 - 150\text{ms}$ |
| **Level 6** | **Master (Bậc thầy)** | Alpha-Beta + ID + TT | Đầy đủ: Candidate, Ordering, ID, Transposition Table, Zobrist | $5 - 8$ | Kiểm soát theo Time Budget (500ms) |

---

## 2. HIỆN THỰC HÓA BẰNG THIẾT KẾ FACTORY PATTERN

```typescript
export type BotDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD' | 'EXPERT' | 'MASTER';

export class BotFactory {
  public static createBot(difficulty: BotDifficulty, engine: CaroEngine): BotAgent {
    switch (difficulty) {
      case 'EASY':
        return new RandomBot();

      case 'NORMAL':
        return new RuleBasedBot(engine);

      case 'HARD':
        return new MinimaxBot(engine, { depth: 2 });

      case 'VERY_HARD':
        return new AlphaBetaBot(engine, { depth: 3, useMoveOrdering: false });

      case 'EXPERT':
        return new AlphaBetaBot(engine, { depth: 4, useMoveOrdering: true });

      case 'MASTER':
        return new MasterBot(engine, { 
          timeLimitMs: 500,
          maxDepth: 8,
          useTranspositionTable: true 
        });

      default:
        return new RandomBot();
    }
  }
}
```
