---
title: "Nội dung Bộ Slide Thuyết minh Bảo vệ Đồ án Cơ sở"
week: 10
tags:
  - tuan-10
  - presentation-slides
  - defense
  - 24cse
---

# 📽️ NỘI DUNG BỘ SLIDE THUYẾT MINH BẢO VỆ ĐỒ ÁN CƠ SỞ

Tài liệu này phác thảo chi tiết nội dung 18 trang trình chiếu (Slides Presentation) phục vụ buổi lễ báo cáo và bảo vệ đồ án trước Hội đồng chấm điểm.

---

## 📑 BỐ CỤC CHI TIẾT 18 SLIDES BẢO VỆ

* **Slide 1: Bìa Báo Cáo**
  * Tiêu đề: XÂY DỰNG WEBSITE CỜ CARO ỨNG DỤNG CÁC THUẬT TOÁN TÌM KIẾM ĐỂ XÂY DỰNG BOT VỚI NHIỀU MỨC ĐỘ KHÓ
  * Sinh viên thực hiện: **Nguyễn Tâm Đức** – Lớp: **24CSE**
* **Slide 2: Đặt Vấn Đề & Mục Tiêu Nghiên Cứu**
  * Nhu cầu kết hợp giữa trải nghiệm Web trực quan và các thuật toán AI kinh điển.
  * Mục tiêu: Xây dựng Game Engine, Website PvP/PvBot và hệ thống 6 cấp độ Bot có đo lường đối sánh định lượng.
* **Slide 3: Bằng Chứng Toán Học Gomoku & Bản Chất Cờ Caro**
  * Luận án Victor Allis (1994): Gomoku tự do $15 \times 15$ là *First-Player Win* (Đen luôn thắng).
  * Phân tích trên bàn cờ $10 \times 10$ và tác dụng cân bằng trò chơi của Luật chặn 2 đầu Việt Nam.
* **Slide 4: Thách Thức Bùng Nổ Tổ Hợp (Combinatorial Explosion)**
  * Không gian trạng thái $3^{100} \approx 5.15 \times 10^{47}$, hệ số phân nhánh ban đầu $b = 100$.
  * Bài toán: Cần các kỹ thuật cắt tỉa để AI phản hồi tức thì ($< 150 \text{ ms}$) trên trình duyệt Web.
* **Slide 5: Kiến Trúc Phân Tầng Tổng Thể Hệ Thống**
  * Sơ đồ tách rời độc lập (Decoupled): `Core Game Engine` $\leftrightarrow$ `Web UI Controller` $\leftrightarrow$ `AI Bot Services`.
* **Slide 6: Thiết Kế Core Engine & Biểu Diễn Bàn Cờ**
  * Ma trận 2 chiều `board[r][c]`, Máy trạng thái FSM, cơ chế In-place Backtracking.
* **Slide 7: Thuật Toán Kiểm Tra Thắng 4 Hướng & Xử Lý Chặn 2 Đầu**
  * Thuật toán quét tia cục bộ $O(1)$ tại nước vừa đánh, kiểm tra 2 ô đầu mút.
* **Slide 8: Ma Trận 6 Cấp Độ Khó Của Bot**
  * Giới thiệu 6 mức độ từ Easy (Random) đến Master (Alpha-Beta + ID + TT).
* **Slide 9: Thuật Toán Minimax & Giới Hạn Độ Sâu**
  * Nguyên lý trò chơi Zero-Sum, hàm đệ quy Minimax và giới hạn độ sâu $d$.
* **Slide 10: Thuật Toán Alpha-Beta Pruning**
  * Điều kiện cắt nhánh $\beta \le \alpha$, chứng minh bảo toàn tính tối ưu $100\%$.
* **Slide 11: Tối Ưu Nước Đi: Candidate Moves & Move Ordering**
  * Bán kính lân cận $r=1, 2$ (giảm $b$ từ 100 xuống 20) và kỹ thuật sắp xếp nước đi ưu tiên.
* **Slide 12: Tối Ưu Nâng Cao: Iterative Deepening & Zobrist Hashing**
  * Quản lý ngân sách thời gian linh hoạt (Time Budgeting) và bảng chuyển vị tránh tính toán lặp.
* **Slide 13: Giao Diện Website & Dashboard Thống Kê Thời Gian Thực**
  * Trực quan hóa bàn cờ CSS Grid, highlight Last Move/Winning Line và Dashboard HUD.
* **Slide 14: Kịch Bản Thực Nghiệm & Đấu Trường Bot vs Bot**
  * Quy trình thi đấu tự động 500 ván, loại bỏ ưu thế đi trước.
* **Slide 15: Kết Quả Đối Sánh Hiệu Năng (Biểu Đồ & Ma Trận Thắng)**
  * Tỷ lệ cắt tỉa đạt tới $94.2\%$, tốc độ phản hồi tăng từ $7\times$ đến $12\times$.
* **Slide 16: Tổng Kết Sản Phẩm Đạt Được**
  * Đối chiếu trọn vẹn 100% mục tiêu trong Đề cương ban đầu.
* **Slide 17: Hướng Phát Triển Tương Lai**
  * Tích hợp Deep Reinforcement Learning (AlphaZero Gomoku), huấn luyện Self-Play.
* **Slide 18: Lời Cảm Ơn & Q&A**
  * Lời cảm ơn Hội đồng chấm điểm và sẵn sàng trả lời các câu hỏi phản biện.
