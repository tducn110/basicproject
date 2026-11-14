---
title: "Tuần 7: Tối ưu Hóa Nước đi và Hệ thống Mức độ Khó của Bot"
week: 7
tags:
  - tuan-7
  - candidate-moves
  - move-ordering
  - bot-levels
  - difficulty-tiers
---

# 📅 TUẦN 7: TỐI ƯU HÓA NƯỚC ĐI VÀ HỆ THỐNG MỨC ĐỘ KHÓ CỦA BOT

Tuần 7 tập trung vào hai kỹ thuật đòn bẩy nhằm tối đa hóa hiệu quả cắt tỉa của Alpha-Beta: **Candidate Move Generation** (chỉ sinh các ô trống tiềm năng) và **Move Ordering** (sắp xếp nước đi ưu tiên trước khi duyệt), đồng thời chính thức tích hợp hệ thống phân cấp độ khó của Bot.

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 7

1. **Triển khai Candidate Move Generation:**
   - Thuật toán sinh nước đi ứng viên dựa trên vùng lân cận (Neighborhood Bounding Box / Radius $r = 1, 2$).
   - Giảm hệ số phân nhánh $b$ từ $100$ xuống còn $15 - 25$ nước đi đáng giá nhất.
   - Chi tiết: [[Tuan_07/01_Candidate_Move_Generation|01. Sinh nước đi tiềm năng Candidate Moves]]

2. **Triển khai Move Ordering (Sắp xếp Thứ tự Nước đi):**
   - Đánh giá nhanh sơ bộ điểm số của các nước đi ứng viên bằng Heuristic tĩnh.
   - Sắp xếp mảng ứng viên theo thứ tự điểm giảm dần trước khi đưa vào vòng lặp Alpha-Beta.
   - Chi tiết: [[Tuan_07/02_Move_Ordering|02. Sắp xếp thứ tự nước đi Move Ordering]]

3. **Tích hợp Hệ thống Mức độ Khó của Bot (6 Tiers):**
   - Định hình kiến trúc 6 cấp độ Bot: **Easy, Normal, Hard, Very Hard, Expert, Master**.
   - Chi tiết: [[Tuan_07/03_Tich_Hop_He_Thong_Muc_Do_Kho|03. Cấu hình 6 mức độ khó của Bot]]

4. **Hoàn thiện các Cấp độ Bot Cơ bản:**
   - Hoàn thiện cấu hình cho các mức Easy, Normal, Hard, Very Hard và Expert.
   - Chi tiết: [[Tuan_07/04_Hoan_Thien_Cac_Cap_Do_Bot_Co_Ban|04. Hoàn thiện các cấp độ Bot]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 7

- [x] Cài đặt thuật toán sinh nước đi lân cận `getCandidateMoves(radius)`.
- [x] Cài đặt hàm sắp xếp `sortMovesByHeuristic()`.
- [x] Đóng gói các lớp Bot theo cấu hình độ khó chuẩn từ đề cương.
- [x] Sẵn sàng chuyển giao sang [[Tuan_08/00_Tong_Quan_Tuan_8|Tuần 8: Iterative Deepening & Transposition Table]].
