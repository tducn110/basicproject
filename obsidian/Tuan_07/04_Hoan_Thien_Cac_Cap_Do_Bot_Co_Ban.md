---
title: "Hoàn thiện các Cấp độ Bot Cơ bản và Kiểm thử Tích hợp"
week: 7
tags:
  - tuan-7
  - integration-testing
  - milestone
  - bot-validation
---

# ✅ HOÀN THIỆN CÁC CẤP ĐỘ BOT CƠ BẢN VÀ KIỂM THỬ TÍCH HỢP

Tài liệu này đánh giá mức độ hoàn thiện của 5 cấp độ Bot đầu tiên trước khi bước vào xây dựng tầng công nghệ tối tân nhất ở Tuần 8.

---

## 1. KẾT QUẢ KIỂM THỬ TÍCH HỢP 5 CẤP ĐỘ BOT

1. **Easy Bot:** Hoạt động trơn tru, ra nước đi ngẫu nhiên ngay lập tức, không vi phạm các ô đã đánh.
2. **Normal Bot:** Biết tấn công các thế cờ rõ ràng và chặn các nước 4 của người chơi, thích hợp cho người mới làm quen với game.
3. **Hard Bot (Minimax $d=2$):** Tính toán được các thế cờ 2 nước, không bị mắc bẫy đơn giản.
4. **Very Hard Bot (Alpha-Beta $d=3$):** Phản ứng nhạy bén, nhận biết các đòn phối hợp 3 nước, thời gian ra nước dưới $50 \text{ ms}$.
5. **Expert Bot (Alpha-Beta + Candidate Moves + Move Ordering $d=4$):** Cực kỳ khó bị đánh bại, biết giăng bẫy đôi và phá bẫy đối phương từ độ sâu 4 nước, thời gian tính toán trung bình chỉ $\approx 40 - 80 \text{ ms}$.

---

## 2. CHECKLIST BÀN GIAO TUẦN 7

- [x] Triển khai và tối ưu thuật toán sinh nước đi ứng viên `generateCandidateMoves`.
- [x] Tích hợp bộ tiền sắp xếp nước đi `orderMoves`.
- [x] Hoàn thiện giao diện chọn mức độ khó trên thanh điều khiển Web.
- [x] Sẵn sàng chuyển giao sang [[Tuan_08/00_Tong_Quan_Tuan_8|Tuần 8: Triển khai Iterative Deepening, Transposition Table & Zobrist Hashing]].
