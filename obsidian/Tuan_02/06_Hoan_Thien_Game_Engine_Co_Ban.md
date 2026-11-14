---
title: "Hoàn thiện Game Engine Cơ bản và Bộ Kiểm thử (Unit Tests)"
week: 2
tags:
  - tuan-2
  - game-engine
  - api
  - unit-testing
  - test-suite
---

# 📦 HOÀN THIỆN GAME ENGINE CƠ BẢN VÀ BỘ KIỂM THỬ (UNIT TESTS)

Tài liệu này tổng hợp toàn bộ các thành phần của Tuần 2 thành một Module hoàn chỉnh `CaroEngine`, định nghĩa giao diện lập trình ứng dụng (Public API Interface) và bộ kịch bản kiểm thử tự động (Test Suite).

---

## 1. GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (PUBLIC API INTERFACE)

```typescript
export interface ICaroEngine {
  // Lấy trạng thái hiện tại
  getState(): GameStateSnapshot;
  
  // Thực hiện nước đi
  makeMove(row: number, col: number): boolean;
  
  // Kiểm tra nước đi có hợp lệ không
  isValidMove(row: number, col: number): boolean;
  
  // Lấy danh sách tất cả các ô trống có thể đi
  getAvailableMoves(): Position[];
  
  // Hoàn tác nước đi gần nhất
  undo(): boolean;
  
  // Bắt đầu ván mới / Reset bàn cờ
  reset(): void;
  
  // Cập nhật cấu hình luật chơi (Kích thước, luật thắng)
  setRules(rules: Partial<GameRules>): void;
  
  // Đăng ký nhận thông báo khi trạng thái thay đổi
  subscribe(listener: (state: GameStateSnapshot) => void): () => void;
}
```

---

## 2. BỘ KIỂM THỬ ĐƠN VỊ TỰ ĐỘNG (UNIT TEST SPECIFICATIONS)

Một Game Engine chất lượng cao phải vượt qua $100\%$ các bài kiểm tra logic dưới đây:

### 2.1. Kiểm thử Khởi tạo & Đổi lượt
* **Test Case 1.1:** Khởi tạo bàn cờ mặc định $10 \times 10$:
  * Kết quả kỳ vọng: Toàn bộ $100$ ô đều có giá trị `0` (`EMPTY`), `currentTurn` là `PLAYER_X`, `status` là `READY`.
* **Test Case 1.2:** Người chơi X đánh nước đầu tiên tại $(5, 5)$:
  * Kết quả kỳ vọng: Trả về `true`, `board[5][5] == 1`, lượt đổi sang `PLAYER_O`, `history.length == 1`.
* **Test Case 1.3:** Người chơi O cố tình đánh đè vào ô $(5, 5)$:
  * Kết quả kỳ vọng: Trả về `false`, bàn cờ không đổi, lượt vẫn giữ nguyên là `PLAYER_O`.

### 2.2. Kiểm thử Điều kiện Thắng Gomoku Tự do
* **Test Case 2.1 (Thắng hàng ngang):**
  * X đánh liên tiếp: $(5, 1), (5, 2), (5, 3), (5, 4), (5, 5)$.
  * Kết quả kỳ vọng: `status == WON`, `winner == PLAYER_X`, `winningLine` chứa đúng 5 tọa độ trên.
* **Test Case 2.2 (Thắng đường chéo):**
  * X đánh liên tiếp: $(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)$.
  * Kết quả kỳ vọng: `status == WON`, `winner == PLAYER_X`.

### 2.3. Kiểm thử Luật Cờ Caro Việt Nam (Chặn 2 đầu)
* **Test Case 3.1 (5 quân thông 1 đầu $\rightarrow$ THẮNG):**
  * Cấu hình: `O X X X X X .` tại hàng 3 (bị O chặn bên trái, bên phải còn trống).
  * Kết quả kỳ vọng: `status == WON`.
* **Test Case 3.2 (5 quân bị chặn cả 2 đầu $\rightarrow$ CHƯA THẮNG):**
  * Cấu hình: `O X X X X X O` tại hàng 4 (bị O chặn cả 2 đầu mút).
  * Kết quả kỳ vọng: `hasWon == false`, `status == PLAYING`, ván đấu tiếp tục diễn ra bình thường.

### 2.4. Kiểm thử Hoàn tác (Undo)
* **Test Case 4.1:** Thực hiện 3 nước đi, sau đó gọi `undo()`:
  * Kết quả kỳ vọng: Ô vừa đánh được xóa về `0`, `history` giảm đi 1 phần tử, `currentTurn` quay về đúng người chơi trước đó.

---

## 3. CHECKLIST HOÀN THÀNH TUẦN 2

- [x] Đã cài đặt hoàn chỉnh lớp `Board` và ma trận ô cờ.
- [x] Đã hoàn thiện máy trạng thái `GameState`.
- [x] Đã kiểm soát chặt chẽ tính hợp lệ của mọi nước đi.
- [x] Đã hoàn thành thuật toán quét 4 hướng và xử lý chuẩn xác luật chặn 2 đầu.
- [x] Đã hoàn thành bộ test cases bao phủ đầy đủ các kịch bản.
- [x] Sẵn sàng kết nối sang [[Tuan_03/00_Tong_Quan_Tuan_3|Tuần 3: Xây dựng Giao diện Website]].
