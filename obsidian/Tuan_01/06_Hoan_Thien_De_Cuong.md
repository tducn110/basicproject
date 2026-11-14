---
title: "Hoàn thiện Đề cương Chi tiết Đồ án"
week: 1
tags:
  - tuan-1
  - syllabus
  - proposal
  - final-outline
---

# 📋 HOÀN THIỆN ĐỀ CƯƠNG CHI TIẾT ĐỒ ÁN

Tài liệu này tổng hợp toàn bộ kết quả nghiên cứu Tuần 1, cấu trúc thành bản Đề cương chính thức sẵn sàng cho việc nghiệm thu, báo cáo giảng viên và định hướng triển khai các tuần tiếp theo.

---

## 1. MỤC TIÊU VÀ SẢN PHẨM BÀN GIAO (DELIVERABLES)

```text
DỰ ÁN: CARO WEB ENGINE & AI BOTS
├── TUẦN 1: Nghiên cứu lý thuyết, Bằng chứng toán học & Đề cương [HOÀN THÀNH]
├── TUẦN 2: Phát triển Core Game Engine & Bộ kiểm thử tự động [KẾ TIẾP]
├── TUẦN 3: Phát triển Giao diện Web tương tác & Chế độ PvP [DỰ KIẾN]
└── TUẦN 4: Phát triển Hệ thống AI Bot (Random, Rule-Based, Heuristic) [DỰ KIẾN]
```

---

## 2. KẾT LUẬN TỔNG THU HỌC THUẬT TỪ TUẦN 1

1. **Về Luật chơi:**
   - Đã làm rõ sự khác biệt giữa Gomoku tự do và Cờ Caro Việt Nam.
   - Việc tích hợp tùy chọn luật "Chặn 2 đầu" là cốt lõi để giữ được bản sắc của cờ Caro truyền thống và cân bằng trận đấu tự nhiên.
2. **Về Bằng chứng toán học (Mathematical Proof):**
   - Đã khảo sát và trích dẫn đầy đủ nghiên cứu của **L. Victor Allis (1994)** về chứng minh Gomoku là *First-Player Win* bằng kỹ thuật *Threat-Space Search (TSS)* và *Proof-Number Search (PN-Search)* trên chương trình *Victoria*.
   - Khẳng định trên bàn cờ $10 \times 10$, luật Gomoku tự do cũng là First-Player Win với độ sâu nước ép buộc ngắn hơn do biên hẹp.
   - Chứng minh luật chặn 2 đầu của Việt Nam loại bỏ chuỗi ép nước đơn hướng thông thường, đưa bài toán về yêu cầu tạo đòn tấn công kép (Double Threat).
3. **Về Kỹ thuật biểu diễn bàn cờ:**
   - Thống nhất sử dụng mô hình Ma trận 2 chiều `board[row][col]` làm nguồn chân lý (Source of Truth), kết hợp mảng phẳng 1 chiều khi duyệt Heuristic để tối ưu hiệu năng.
4. **Về Không gian trạng thái:**
   - Bàn cờ $10 \times 10$ ($|\mathcal{S}| \approx 10^{47}$) và $15 \times 15$ ($|\mathcal{S}| \approx 10^{107}$) đều phải đối mặt với bùng nổ tổ hợp.
   - Dự án đã xác định kỹ thuật cắt tỉa theo bán kính lân cận ($r = 1, 2$) và lọc nước đi ép buộc để khống chế hệ số phân nhánh $b$ từ $100$ xuống $15 - 25$.

---

## 3. CHECKLIST SẴN SÀNG CHUYỂN SANG TUẦN 2 (ENGINE IMPLEMENTATION)

- [x] Đã hoàn thành phân tích lý thuyết và thu thập chứng minh toán học.
- [x] Đã thiết kế xong cấu trúc dữ liệu `BoardMatrix` và `GameState`.
- [x] Đã vạch rõ giải thuật kiểm tra thắng 4 hướng và luật chặn 2 đầu.
- [x] Đã liên kết tài liệu đề cương PDF trong thư mục [[00_De_Cuong_PDF/README|00_De_Cuong_PDF/]].
- [x] Sẵn sàng chuyển giao sang [[Tuan_02/00_Tong_Quan_Tuan_2|Tuần 2: Xây dựng Game Engine cơ bản]].
