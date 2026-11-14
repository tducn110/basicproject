---
title: "Tuần 5: Nghiên cứu và Triển khai Thuật toán Minimax"
week: 5
tags:
  - tuan-5
  - minimax
  - game-tree
  - depth-limit
  - adversarial-search
---

# 📅 TUẦN 5: NGHIÊN CỨU VÀ TRIỂN KHAI THUẬT TOÁN MINIMAX

Tuần 5 đánh dấu bước chuyển mình quan trọng của dự án: chuyển từ các quyết định tức thời (Rule-Based/Heuristic nông) sang thuật toán tìm kiếm đối kháng kinh điển **Minimax** có khả năng nhìn trước nhiều nước đi trong tương lai.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 5

1. **Nghiên cứu Nguyên lý Thuật toán Minimax:**
   - Cơ chế hoạt động của trò chơi hai người có tổng bằng không (Zero-Sum Game).
   - Tầng MAX (lượt của Bot tối đa hóa điểm số) và tầng MIN (lượt của đối thủ cố gắng giảm thiểu điểm số của Bot).
   - Chi tiết: [[Tuan_05/01_Nguyen_Ly_Thuat_Toan_Minimax|01. Nguyên lý thuật toán Minimax]]

2. **Xây dựng Game Tree trong Cờ Caro:**
   - Cấu trúc biểu diễn cây trạng thái và phương thức đệ quy sinh các nút con.
   - Chi tiết: [[Tuan_05/02_Xay_Dung_Game_Tree_Trong_Caro|02. Xây dựng Game Tree trong Caro]]

3. **Áp dụng Giới hạn Độ sâu Tìm kiếm (Depth Limit):**
   - Thiết lập điều kiện dừng đệ quy: khi đạt độ sâu $d_{\max}$ hoặc trạng thái kết thúc (Terminal State: Thắng/Hòa).
   - Gọi hàm đánh giá tĩnh Heuristic tại các nút lá.
   - Chi tiết: [[Tuan_05/03_Ap_Dung_Gioi_Han_Do_Sau_Depth_Limit|03. Giới hạn độ sâu Depth Limit]]

4. **Kiểm thử Thuật toán Minimax:**
   - Xây dựng các thế cờ giải đố (Caro Puzzles) 2 nước, 3 nước để kiểm chứng Minimax luôn tìm ra nước đi tối ưu toán học.
   - Đánh giá hiện tượng bùng nổ thời gian khi tăng độ sâu từ $d=2$ lên $d=3, 4$.
   - Chi tiết: [[Tuan_05/04_Kiem_Thu_Thuat_Toan_Minimax|04. Kiểm thử thuật toán Minimax]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 5

- [x] Nắm vững mô hình toán học Minimax Zero-Sum.
- [x] Hiện thực hóa hàm đệ quy `minimax(board, depth, isMaximizing)`.
- [x] Kết nối hàm lượng giá Heuristic tại tầng lá.
- [x] Thực hiện đo đạc số nút duyệt của Minimax thuần túy.
- [x] Chuẩn bị nền tảng để tối ưu hóa bằng Alpha-Beta Pruning ở [[Tuan_06/00_Tong_Quan_Tuan_6|Tuần 6]].
