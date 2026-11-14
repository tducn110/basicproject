---
title: "Tuần 9: Tiến hành Thực nghiệm Đối đầu Tự động và Phân tích Số liệu"
week: 9
tags:
  - tuan-9
  - experiments
  - bot-vs-bot
  - data-collection
  - benchmarking
---

# 📅 TUẦN 9: TIẾN HÀNH THỰC NGHIỆM ĐỐI ĐẦU TỰ ĐỘNG & PHÂN TÍCH SỐ LIỆU

Tuần 9 là giai đoạn thực nghiệm khoa học, nơi toàn bộ 6 cấp độ Bot được đưa vào đấu trường thi đấu tự động (Bot vs Bot Arena) để thu thập dữ liệu khách quan, kiểm chứng các giả thuyết và xây dựng các bảng biểu so sánh phục vụ báo cáo.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 9

1. **Xây dựng Kịch bản Thực nghiệm (Tournament Runner):**
   - Thiết lập chương trình thi đấu vòng tròn tự động giữa 6 cấp độ Bot: Easy, Normal, Hard, Very Hard, Expert, Master.
   - Mỗi cặp đấu thi đấu tối thiểu $50$ ván cờ (25 ván cầm quân đi trước, 25 ván cầm quân đi sau để loại bỏ ưu thế First-Player).
   - Chi tiết: [[Tuan_09/01_Kich_Ban_Thuc_Nghiem_Bot_vs_Bot|01. Kịch bản đấu tự động Bot vs Bot]]

2. **Thu thập và Xử lý Số liệu Thực nghiệm:**
   - Ghi nhận: Tỷ lệ Thắng / Hòa / Thua (Win/Draw/Loss Rate), thời gian trung bình mỗi nước đi, số nước trung bình mỗi ván đấu.
   - Chi tiết: [[Tuan_09/02_Thu_Thap_Va_Xu_Ly_So_Lieu|02. Thu thập số liệu thực nghiệm]]

3. **Xây dựng Biểu đồ và Bảng So sánh Hiệu năng:**
   - Biểu đồ thời gian xử lý vs Độ sâu tìm kiếm.
   - Biểu đồ tỷ lệ cắt tỉa cành nhánh.
   - Ma trận tỷ lệ thắng (Winrate Heatmap).
   - Chi tiết: [[Tuan_09/03_Bieu_Do_So_Sanh_Hieu_Nang|03. Biểu đồ và bảng phân tích hiệu năng]]

4. **Phân tích Đánh giá Kết quả:**
   - Đánh giá tương quan chi phí tính toán (Computational Cost) và độ thông minh thực tế (Tactical Elo).
   - Chi tiết: [[Tuan_09/04_Bao_Cao_Danh_Gia_Ket_Qua|04. Đánh giá kết quả thực nghiệm]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 9

- [x] Thiết lập runner tự động chạy hàng trăm ván không cần can thiệp người dùng.
- [x] Thu thập trọn vẹn bộ dữ liệu kiểm định.
- [x] Xuất dữ liệu biểu đồ và ma trận tỷ lệ đối đầu.
- [x] Hoàn thành phân tích số liệu sẵn sàng đưa vào Chương 4 & 5 của Báo cáo.
