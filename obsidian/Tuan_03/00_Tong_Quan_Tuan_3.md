---
title: "Tuần 3: Xây dựng Giao diện Website và Chế độ Chơi"
week: 3
tags:
  - tuan-3
  - frontend
  - web-ui
  - pvp
  - user-experience
---

# 📅 TUẦN 3: XÂY DỰNG GIAO DIỆN WEBSITE & CHẾ ĐỘ CHƠI

Tuần 3 tập trung vào việc biến Game Engine đã xây dựng ở Tuần 2 thành một ứng dụng Web hoàn chỉnh, trực quan, thân thiện với người dùng và có khả năng tương tác mượt mà trên nhiều kích thước màn hình.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 3

1. **Xây dựng Giao diện Website (Web UI Layout):**
   - Thiết kế bố cục trang web: Header (tiêu đề, luật chơi), Main Board Container (khung chứa bàn cờ), Sidebar / Control Panel (bảng điều khiển, trạng thái ván đấu).
   - Chi tiết: [[Tuan_03/01_Xay_Dung_Giao_Dien_Website|01. Xây dựng Giao diện Website]]

2. **Hiển thị bàn cờ (Board Rendering & Interaction):**
   - Kỹ thuật render lưới ô cờ (CSS Grid / HTML5 Canvas / SVG).
   - Hiển thị quân cờ X và O sắc nét, hiệu ứng khi đặt quân.
   - Đánh dấu nước đi vừa đánh (Last Move Indicator) và tô màu đường thắng 5 quân (Winning Line Highlight).
   - Chi tiết: [[Tuan_03/02_Hien_Thi_Ban_Co|02. Hiển thị bàn cờ]]

3. **Xây dựng Chế độ Player vs Player (PvP):**
   - Chế độ 2 người chơi tại chỗ trên cùng một thiết bị (Pass & Play).
   - Bảng hiển thị lượt chơi trực quan (Indicator sáng đèn cho người đang đến lượt).
   - Đồng hồ đếm thời gian mỗi lượt (Turn Timer) và bộ đếm tổng số nước đi.
   - Chi tiết: [[Tuan_03/03_Che_Do_Player_vs_Player|03. Chế độ Player vs Player]]

4. **Xây dựng chức năng New Game và Reset:**
   - Nút New Game (bắt đầu ván cờ mới).
   - Nút Reset (đặt lại tỉ số, xóa bàn cờ về ban đầu).
   - Hộp thoại xác nhận (Confirmation Modal) để tránh bấm nhầm làm mất ván đấu đang dở.
   - Hỗ trợ nút Undo (đi lại nước cờ).
   - Chi tiết: [[Tuan_03/04_Chuc_Nang_New_Game_Va_Reset|04. Chức năng New Game & Reset]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 3

- [x] Thiết kế hệ thống layout Responsive (Desktop & Mobile).
- [x] Hiện thực hóa việc vẽ bàn cờ và hoạt họa đặt quân X/O.
- [x] Tạo cơ chế đánh dấu Last Move và highlight đường thắng 5 quân.
- [x] Kết nối Engine vào chế độ 2 người chơi PvP cục bộ.
- [x] Hoàn thiện các nút điều khiển New Game, Reset, Undo và bảng thông báo kết quả.
