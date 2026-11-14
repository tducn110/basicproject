---
title: "Tuần 8: Tối ưu Nâng cao - Iterative Deepening, Transposition Table & Zobrist Hashing"
week: 8
tags:
  - tuan-8
  - iterative-deepening
  - transposition-table
  - zobrist-hashing
  - master-bot
---

# 📅 TUẦN 8: TỐI ƯU NÂNG CAO - ITERATIVE DEEPENING, TRANSPOSITION TABLE & ZOBRIST HASHING

Tuần 8 hiện thực hóa cấp độ trí tuệ nhân tạo cao nhất của đồ án: **Master Bot**, kết hợp các công nghệ tìm kiếm đỉnh cao giúp Bot tự quản lý ngân sách thời gian (Time Budget) và ghi nhớ các trạng thái bàn cờ đã từng tính toán để tránh lặp lại.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 8

1. **Triển khai Iterative Deepening (Tìm kiếm Sâu dần):**
   - Thuật toán duyệt từ độ sâu $d = 1, 2, 3, \dots$ cho đến khi hết thời gian quy định (Time Limit).
   - Nước đi tốt nhất ở độ sâu $d$ được dùng làm nước đi khởi đầu ưu tiên cho độ sâu $d+1$ (Principle Variation).
   - Chi tiết: [[Tuan_08/01_Iterative_Deepening|01. Tìm kiếm sâu dần Iterative Deepening]]

2. **Triển khai Zobrist Hashing:**
   - Kỹ thuật băm bàn cờ thành số nguyên 64-bit bằng phép toán XOR ($\oplus$).
   - Cập nhật hash với chi phí $O(1)$ sau mỗi nước đi và khi undo.
   - Chi tiết: [[Tuan_08/02_Zobrist_Hashing|02. Bảng băm Zobrist Hashing]]

3. **Triển khai Transposition Table (Bảng Chuyển vị):**
   - Lưu trữ kết quả lượng giá của các trạng thái đã duyệt: `{ hash, depth, score, flag, bestMove }`.
   - Giảm thiểu việc duyệt lại cùng một thế cờ sinh ra từ các thứ tự đi khác nhau (Transpositions: $A \to B$ tương đương $B \to A$).
   - Chi tiết: [[Tuan_08/03_Transposition_Table|03. Bảng chuyển vị Transposition Table]]

4. **Hoàn thiện Bảng Thống kê Thuật toán (Algorithm Statistics HUD):**
   - Hiển thị trực tiếp trên giao diện website: Thời gian xử lý (ms), số nút đã duyệt, số nút bị cắt, độ sâu đạt được, tốc độ NPS.
   - Chi tiết: [[Tuan_08/04_Dashboard_Thong_Ke_Thuat_Toan|04. Bảng thông số thống kê thuật toán]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 8

- [x] Cài đặt thuật toán `iterativeDeepening(timeLimitMs)`.
- [x] Khởi tạo bảng số ngẫu nhiên Zobrist và hàm cập nhật XOR.
- [x] Xây dựng cấu trúc dữ liệu `TranspositionTable` với cơ chế băm và thay thế nút.
- [x] Hoàn thiện cấp độ Master Bot sẵn sàng cho thi đấu.
- [x] Hoàn thành giao diện Dashboard thống kê số liệu thuật toán.
