---
title: "Kịch bản Quay Video Demo Sản phẩm (Thời lượng 5 - 10 Phút)"
week: 10
tags:
  - tuan-10
  - demo-video
  - storyboard
  - presentation-script
---

# 🎬 KỊCH BẢN QUAY VIDEO DEMO SẢN PHẨM (THỜI LƯỢNG 5 – 10 PHÚT)

Tài liệu này chi tiết hóa kịch bản phân cảnh (Storyboard), thời lượng từng phần và lời thoại thuyết minh (Voiceover Script) theo đúng yêu cầu mục 4.3 trong Đề cương chính thức.

---

## ⏱️ PHÂN BỔ THỜI LƯỢNG TỔNG QUAN (DỰ KIẾN: 7 PHÚT 30 GIÂY)

```text
[00:00 - 00:45] Phân cảnh 1: Giới thiệu Đề tài & Mục tiêu nghiên cứu
[00:45 - 01:30] Phân cảnh 2: Giới thiệu Giao diện Website & Bàn cờ trực quan
[01:30 - 02:30] Phân cảnh 3: Demo Chế độ Player vs Player (PvP) & Luật Chặn 2 đầu
[02:30 - 04:00] Phân cảnh 4: Demo Chế độ Player vs Bot & 6 Mức độ khó (Easy -> Master)
[04:00 - 05:30] Phân cảnh 5: Demo Chuyên sâu Minimax vs Alpha-Beta Pruning
[05:30 - 06:45] Phân cảnh 6: Trực quan hóa Bảng Thông số Thuật toán (HUD Telemetry) & So sánh
[06:45 - 07:30] Phân cảnh 7: Tổng kết Kết quả & Hướng phát triển tương lai
```

---

## 🎥 CHI TIẾT TỪNG PHÂN CẢNH VÀ LỜI THOẠI (STORYBOARD & SCRIPT)

### Phân cảnh 1: Giới thiệu Đề tài (00:00 – 00:45)
* **Hình ảnh:** Slide tiêu đề hiển thị: *"ĐỒ ÁN CƠ SỞ: WEBSITE CỜ CARO ỨNG DỤNG CÁC THUẬT TOÁN TÌM KIẾM AI - Sinh viên: Nguyễn Tâm Đức - Lớp: 24CSE"*.
* **Lời thoại:** *"Kính chào quý thầy cô và các bạn. Em tên là Nguyễn Tâm Đức, sinh viên lớp 24CSE. Hôm nay em xin phép demo sản phẩm Đồ án cơ sở với đề tài: 'Xây dựng website Cờ Caro ứng dụng các thuật toán tìm kiếm để xây dựng bot với nhiều mức độ khó'."*

### Phân cảnh 2: Giao diện Website & Bàn cờ (00:45 – 01:30)
* **Hình ảnh:** Quay màn hình trình duyệt Web hiển thị website Cờ Caro. Chuột rê qua các nút điều khiển, đổi kích thước bàn cờ từ $10 \times 10$ sang $15 \times 15$, đổi chế độ luật chơi.
* **Lời thoại:** *"Đây là giao diện chính của hệ thống. Ứng dụng được xây dựng trên nền tảng React và TypeScript hiện đại, giao diện hoàn toàn responsive. Người dùng có thể dễ dàng tùy biến kích thước bàn cờ giữa $10 \times 10$ và $15 \times 15$, lựa chọn luật thi đấu quốc tế Gomoku hoặc luật Cờ Caro truyền thống Việt Nam."*

### Phân cảnh 3: Demo Chế độ Player vs Player (01:30 – 02:30)
* **Hình ảnh:** Thao tác đánh cờ 2 người. Hiển thị rõ hiệu ứng đặt quân, đánh dấu Last Move màu vàng, đồng hồ đếm 30s. Tạo tình huống 5 quân bị chặn 2 đầu để chứng minh luật không thắng, sau đó mở 1 đầu để thắng và kích hoạt Winning Line nhấp nháy.
* **Lời thoại:** *"Trước hết là chế độ Player vs Player. Bàn cờ hỗ trợ highlight nước đi vừa đánh và đồng hồ đếm ngược. Đặc biệt, hệ thống xử lý chính xác luật Cờ Caro Việt Nam: khi chuỗi 5 quân bị chặn cả 2 đầu bởi quân đối phương, game không kết thúc mà tiếp tục diễn ra cho đến khi có một hàng 5 thông đầu."*

### Phân cảnh 4: Demo Chế độ Player vs Bot & 6 Mức độ khó (02:30 – 04:00)
* **Hình ảnh:** Chọn chế độ Player vs Bot. Mở dropdown hiển thị 6 mức độ: Easy, Normal, Hard, Very Hard, Expert, Master. Đánh thử vài nước với Easy (thấy máy đi ngẫu nhiên), sau đó chuyển sang Expert (máy chặn ngay lập tức các nước 3 mở).
* **Lời thoại:** *"Tiếp theo là trọng tâm của đề tài: Chế độ Player vs Bot với 6 cấp độ khó được cấu hình theo đề cương: Easy sử dụng Random Move, Normal sử dụng Rule-Based Heuristic, Hard sử dụng Minimax, Very Hard tích hợp Alpha-Beta, Expert bổ sung Move Ordering và Master là tầng cao nhất với Iterative Deepening và Zobrist Transposition Table."*

### Phân cảnh 5: Demo Hoạt động Minimax & Alpha-Beta Pruning (04:00 – 05:30)
* **Hình ảnh:** Quay cận cảnh bảng Dashboard thông số khi Bot cấp Hard (Minimax) và Very Hard (Alpha-Beta) cùng giải một thế cờ.
* **Lời thoại:** *"Tại thế cờ phức tạp này, thuật toán Minimax thuần túy phải duyệt hơn 8,800 nút và mất 150ms. Trong khi đó, với cùng kết quả nước đi tối ưu, thuật toán Alpha-Beta Pruning chỉ cần duyệt 1,150 nút, cắt tỉa thành công hơn 7,600 nhánh, rút ngắn thời gian xử lý xuống còn 21ms!"*

### Phân cảnh 6: Trực quan hóa Thông số Xử lý & So sánh (05:30 – 06:45)
* **Hình ảnh:** Bật cấp độ Master Bot. Bảng HUD hiển thị: `Depth: 6`, `Search Time: 120ms`, `Nodes Pruned: 94%`, `NPS: 140,000`. Cho xem biểu đồ thống kê đối đầu tự động từ Tuần 9.
* **Lời thoại:** *"Với cấp độ Master Bot, nhờ có Zobrist Hashing và Transposition Table, tỷ lệ cắt tỉa đạt tới trên 94%. Bot có thể đào sâu tới 6 nước cờ mà thời gian phản hồi vẫn dưới 150ms, đảm bảo trải nghiệm chơi cờ hoàn toàn mượt mà."*

### Phân cảnh 7: Tổng kết & Kết thúc Video (06:45 – 07:30)
* **Hình ảnh:** Trở về màn hình slide tổng kết kết quả đạt được và định hướng mở rộng AI học tăng cường (Reinforcement Learning).
* **Lời thoại:** *"Đồ án đã hoàn thành xuất sắc toàn bộ các mục tiêu đề ra trong đề cương: từ việc xây dựng Game Engine độc lập, trực quan hóa giao diện Web, đến hiện thực hóa và so sánh định lượng 6 cấp độ thuật toán AI. Em xin chân thành cảm ơn quý thầy cô đã theo dõi!"*
