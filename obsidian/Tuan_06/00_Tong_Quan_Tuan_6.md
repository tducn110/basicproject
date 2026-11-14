---
title: "Tuần 6: Nghiên cứu và Triển khai Alpha-Beta Pruning"
week: 6
tags:
  - tuan-6
  - alpha-beta
  - pruning
  - performance-optimization
  - metrics
---

# 📅 TUẦN 6: NGHIÊN CỨU VÀ TRIỂN KHAI ALPHA-BETA PRUNING

Tuần 6 tập trung vào kỹ thuật cắt tỉa nhánh cây trò chơi kinh điển **Alpha-Beta Pruning**, giúp loại bỏ hàng chục ngàn trạng thái dư thừa mà không làm thay đổi kết quả tối ưu toán học so với Minimax.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 6

1. **Nghiên cứu Nguyên lý Alpha-Beta Pruning:**
   - Khái niệm ngưỡng $\alpha$ (giá trị tối thiểu tốt nhất của người chơi MAX) và $\beta$ (giá trị tối đa tốt nhất của người chơi MIN).
   - Điều kiện cắt tỉa: $\alpha \ge \beta$ (Beta Cutoff hoặc Alpha Cutoff).
   - Chi tiết: [[Tuan_06/01_Nguyen_Ly_Alpha_Beta_Pruning|01. Nguyên lý Alpha-Beta Pruning]]

2. **Đo lường Số lượng Nodes Visited và Nodes Pruned:**
   - Thiết lập bộ đếm: `nodesVisited` (số nút được tính toán) và `nodesPruned` (số nút được loại bỏ nhờ điều kiện cắt nhánh).
   - Chi tiết: [[Tuan_06/02_Do_Luong_Nodes_Visited_Va_Pruned|02. Đo lường Nodes Visited & Nodes Pruned]]

3. **Đo lường Thời gian Tìm kiếm (Search Time):**
   - Sử dụng `performance.now()` để đo chính xác thời gian mili-giây (ms).
   - Chi tiết: [[Tuan_06/03_Do_Luong_Thoi_Gian_Search_Time|03. Đo lường Search Time]]

4. **So sánh Hiệu năng giữa Minimax và Alpha-Beta Pruning:**
   - Thực hiện bài kiểm tra đối đầu trực diện trên cùng cấu hình bàn cờ ở độ sâu $d = 2, 3, 4$.
   - Chi tiết: [[Tuan_06/04_So_Sanh_Hieu_Nang_Minimax_vs_AlphaBeta|04. So sánh Minimax vs Alpha-Beta]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 6

- [x] Nắm vững điều kiện cắt nhánh toán học $\alpha \ge \beta$.
- [x] Cài đặt hàm `alphaBeta(board, depth, alpha, beta, isMaximizing)`.
- [x] Tích hợp bộ đếm `nodesVisited`, `nodesPruned`, `searchTimeMs`.
- [x] Xây dựng bảng đối sánh bước đầu giữa Minimax và Alpha-Beta.
- [x] Sẵn sàng chuyển giao sang [[Tuan_07/00_Tong_Quan_Tuan_7|Tuần 7: Candidate Move Generation & Move Ordering]].
