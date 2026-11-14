---
title: "Tuần 2: Xây dựng Game Engine Cơ bản"
week: 2
tags:
  - tuan-2
  - game-engine
  - state-management
  - win-detection
---

# 📅 TUẦN 2: XÂY DỰNG GAME ENGINE CƠ BẢN

Tuần 2 tập trung vào việc hiện thực hóa toàn bộ logic trò chơi thành một thư viện **Headless Game Engine** độc lập, vững chắc, có khả năng chạy độc lập không phụ thuộc vào giao diện đồ họa.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 2

1. **Xây dựng Board Matrix:**
   - Cài đặt cấu trúc dữ liệu ma trận bàn cờ $10 \times 10$ và $15 \times 15$.
   - Chi tiết: [[Tuan_02/01_Xay_Dung_Board_Matrix|01. Xây dựng Board Matrix]]

2. **Xây dựng Game State:**
   - Thiết kế Finite State Machine (FSM): quản lý lượt chơi, trạng thái ván đấu (`READY`, `PLAYING`, `WON`, `DRAW`), ngăn xếp lịch sử nước đi (`history`).
   - Chi tiết: [[Tuan_02/02_Xay_Dung_Game_State|02. Xây dựng Game State]]

3. **Xử lý nước đi (Move Handling):**
   - Xây dựng hàm `makeMove(row, col)` thực thi nước đi, cập nhật bàn cờ, ghi nhận lịch sử và chuyển lượt.
   - Chi tiết: [[Tuan_02/03_Xu_Ly_Nuoc_Di|03. Xử lý nước đi]]

4. **Kiểm tra nước đi hợp lệ (Move Validation):**
   - Xây dựng hàm `isValidMove(row, col)` kiểm tra tọa độ trong biên bàn cờ, ô còn trống và game đang diễn ra.
   - Chi tiết: [[Tuan_02/04_Kiem_Tra_Nuoc_Di_Hop_Le|04. Kiểm tra nước đi hợp lệ]]

5. **Kiểm tra điều kiện thắng và hòa (Win & Draw Check):**
   - Thuật toán quét tia 4 hướng (ngang, dọc, chéo chính, chéo phụ).
   - Hỗ trợ linh hoạt cả 2 luật: Gomoku chuẩn (5 liên tiếp) và Caro Việt Nam (chặn 2 đầu không thắng).
   - Phát hiện hòa khi toàn bộ bàn cờ đã đầy ô.
   - Chi tiết: [[Tuan_02/05_Kiem_Tra_Dieu_Kien_Thang_Va_Hoa|05. Kiểm tra điều kiện thắng và hòa]]

6. **Hoàn thiện Game Engine cơ bản:**
   - Đóng gói toàn bộ thành class/module `CaroEngine` với API rõ ràng, kèm bộ test cases mẫu.
   - Chi tiết: [[Tuan_02/06_Hoan_Thien_Game_Engine_Co_Ban|06. Hoàn thiện Game Engine cơ bản]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 2

- [x] Thiết kế cấu trúc dữ liệu Ma trận bàn cờ.
- [x] Quản lý vòng đời trạng thái Game State.
- [x] Hiện thực hóa hàm `makeMove` và `undoMove`.
- [x] Xây dựng bộ lọc tính hợp lệ `isValidMove`.
- [x] Cài đặt thuật toán kiểm tra thắng thua 4 hướng kèm quy tắc chặn 2 đầu.
- [x] Đóng gói hoàn thiện API của Core Engine.
