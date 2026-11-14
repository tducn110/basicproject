---
title: "Kịch bản Thực nghiệm Thi đấu Tự động (Bot vs Bot Tournament)"
week: 9
tags:
  - tuan-9
  - tournament-runner
  - headless-simulation
  - methodology
---

# 🤖 KỊCH BẢN THỰC NGHIỆM THI ĐẤU TỰ ĐỘNG (BOT VS BOT TOURNAMENT)

Để đảm bảo tính khách quan và khoa học, quá trình thử nghiệm được tự động hóa hoàn toàn thông qua một công cụ mô phỏng không giao diện (Headless Tournament Runner).

---

## 1. PHƯƠNG PHÁP THỰC NGHIỆM

* **Đối tượng:** 6 cấp độ Bot: Easy, Normal, Hard, Very Hard, Expert, Master.
* **Số lượng ván đấu:** Mỗi cặp đấu thi đấu **$50$ ván liên tiếp**:
  * 25 ván: Bot 1 cầm quân X (đi trước), Bot 2 cầm quân O (đi sau).
  * 25 ván: Bot 2 đổi sang cầm quân X (đi trước), Bot 1 cầm quân O (đi sau).
  * 👉 **Mục đích:** Triệt tiêu hoàn toàn yếu tố sai số do lợi thế người đi trước mang lại.
* **Quy chuẩn bàn cờ:** Bàn cờ $10 \times 10$, luật Cờ Caro Việt Nam chặn 2 đầu (kết hợp đối chứng với Gomoku tự do).

---

## 2. MÃ NGUỒN CHƯƠNG TRÌNH THI ĐẤU TỰ ĐỘNG (RUNNER)

```typescript
export interface MatchResult {
  winner: number | null; // 1: Bot1 thắng, 2: Bot2 thắng, 0: Hòa
  totalMoves: number;
  durationMs: number;
  bot1AvgTime: number;
  bot2AvgTime: number;
}

export async function runTournamentMatch(
  bot1: BotAgent, 
  bot2: BotAgent, 
  rules: GameRules
): Promise<MatchResult> {
  const engine = new CaroEngine(rules);
  const startTime = performance.now();
  let bot1TotalTime = 0;
  let bot2TotalTime = 0;
  let bot1Moves = 0;
  let bot2Moves = 0;

  while (engine.getState().status === GameStatus.PLAYING || engine.getState().status === GameStatus.READY) {
    const turn = engine.getState().currentTurn;
    const currentBot = (turn === CellValue.PLAYER_X) ? bot1 : bot2;

    const t0 = performance.now();
    const move = await currentBot.selectMove(engine.getBoard(), turn);
    const t1 = performance.now();

    if (turn === CellValue.PLAYER_X) {
      bot1TotalTime += (t1 - t0);
      bot1Moves++;
    } else {
      bot2TotalTime += (t1 - t0);
      bot2Moves++;
    }

    if (!move || !engine.makeMove(move.row, move.col)) {
      break; // Lỗi hoặc hết nước
    }
  }

  const finalState = engine.getState();
  return {
    winner: finalState.winner,
    totalMoves: finalState.moveHistory.length,
    durationMs: performance.now() - startTime,
    bot1AvgTime: bot1Moves > 0 ? bot1TotalTime / bot1Moves : 0,
    bot2AvgTime: bot2Moves > 0 ? bot2TotalTime / bot2Moves : 0,
  };
}
```
