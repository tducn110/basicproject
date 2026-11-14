---
title: "Xây Dựng Rule-Based Bot (Hệ Quy Tắc Chiến Thuật Ưu Tiên 1-Ply)"
week: 4
tags:
  - rule-based-bot
  - normal-level
  - tactical-priorities
  - expert-system
date: "2026-09-18"
author: "Nguyễn Tâm Đức - 24CSE"
---

# 🛡️ XÂY DỰNG RULE-BASED BOT (MỨC ĐỘ TRUNG BÌNH - NORMAL)

## 1. NGUYÊN LÝ HỆ CHUYÊN GIA DỰA TRÊN LUẬT (RULE-BASED EXPERT SYSTEM)

Một người chơi Cờ Caro trung bình không cần phải tính toán sâu hàng chục nước đi mà dựa chủ yếu vào các **quy tắc phản xạ chiến thuật $1\text{-ply}$**.

Thuật toán Rule-Based Bot áp dụng một cây quyết định ưu tiên nghiêm ngặt (Strict Priority Hierarchy):

```mermaid
flowchart TD
    Start(["Bắt đầu lượt đi của Bot"]) --> P1{"ƯU TIÊN 1:\nTa có nước đánh THẮNG NGAY không?"}
    P1 -- "Có (Tạo chuỗi 5)" --> WinAction["ĐÁNH THẮNG LẬP TỨC!"]
    
    P1 -- "Không" --> P2{"ƯU TIÊN 2:\nĐối thủ có nước THẮNG NGAY lượt tới không?"}
    P2 -- "Có (Đối thủ có 4 quân)" --> BlockAction["CHẶN NGAY Ô NGUY HIỂM!"]
    
    P2 -- "Không" --> P3{"ƯU TIÊN 3:\nTa có nước tạo TỨ MỞ (Straight 4) không?"}
    P3 -- "Có (Chuỗi 4 trống 2 đầu)" --> CreateStraight4["TẠO TỨ MỞ (Đảm bảo thắng lượt sau)!"]
    
    P3 -- "Không" --> P4{"ƯU TIÊN 4:\nĐối thủ có TAM MỞ (Open 3) không?"}
    P4 -- "Có (Nguy cơ lên Tứ mở)" --> BlockOpen3["CHẶN TAM MỞ CỦA ĐỐI THỦ!"]
    
    P4 -- "Không" --> P5{"ƯU TIÊN 5:\nTa có nước tạo Đòn kép (3-3, 4-3) không?"}
    P5 -- "Có" --> DoubleThreat["TẠO ĐÒN TẤN CÔNG KÉP!"]
    
    P5 -- "Không" --> Fallback["ƯU TIÊN 6 (Fallback):\nTính điểm Heuristic 1-ply và chọn điểm cao nhất"]
```

---

## 2. HIỆN THỰC HÓA BẰNG RUST

Trích xuất từ module chuẩn [caro-core-reference/src/bot/rule_based.rs](file:///home/pro/Downloads/vnuk/basicProject/caro-core-reference/src/bot/rule_based.rs):

```rust
pub struct RuleBasedBot;

impl RuleBasedBot {
    pub fn select_move(state: &mut GameState, rule: RuleConfig) -> Option<usize> {
        let me = state.to_move();
        let opponent = me.opponent();
        let candidates = state.candidate_moves(2);

        // 1. Kiểm tra nước thắng ngay của bản thân (Tự thắng)
        for &mv in &candidates {
            let undo = state.play(mv).ok()?;
            let won = state.status() == GameStatus::Won(me);
            state.undo(undo);
            if won {
                return Some(mv);
            }
        }

        // 2. Kiểm tra nước thắng của đối thủ (Chặn thua tức thời)
        for &mv in &candidates {
            // Giả lập đối thủ đánh vào ô mv
            state.set_player(opponent);
            let undo = state.play(mv).ok()?;
            let opponent_wins = state.status() == GameStatus::Won(opponent);
            state.undo(undo);
            state.set_player(me);

            if opponent_wins {
                return Some(mv); // Chặn ngay!
            }
        }

        // 3. Fallback: Chọn nước có điểm Heuristic cao nhất trong tập ứng viên
        heuristic_best_move(state, &candidates)
    }
}
```

---

## 3. HIỆU QUẢ VÀ GIỚI HẠN CỦA RULE-BASED BOT

* **Ưu điểm vượt trội:**
  * Tốc độ phản hồi cực nhanh: Chỉ cần duyệt $1\text{-ply}$ trên khoảng $10 \sim 25$ ô ứng viên $\rightarrow$ Thời gian tính toán $< 1\text{ms}$.
  * Chấm dứt hoàn toàn các sai lầm ngớ ngẩn (như không nhìn thấy nước 4 của đối thủ để bị thua lãng xẹt).
* **Nhược điểm cốt lõi (Tầm nhìn thiển cận - Horizon Effect):**
  * Rule-Based Bot không thể nhìn thấy các đòn phục kích từ xa (ví dụ: bẫy 3 bước, bẫy VCF - Victory of Continuous Fours).
  * Đây là lý do đòi hỏi sự ra đời của **Minimax và Alpha-Beta Pruning** ở Tuần 5 và Tuần 6 để đào sâu cây trò chơi.
