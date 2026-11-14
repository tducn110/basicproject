---
title: "Kiểm thử và Đánh giá Hiệu năng Thuật toán Minimax"
week: 5
tags:
  - tuan-5
  - testing
  - minimax
  - puzzles
  - benchmarks
---

# 🧪 KIỂM THỬ VÀ ĐÁNH GIÁ HIỆU NĂNG THUẬT TOÁN MINIMAX

Tài liệu này tổng hợp kết quả kiểm thử thực nghiệm thuật toán Minimax trên các thế cờ kinh điển và đo đạc thông số thực thi.

---

## 1. CÁC KỊCH BẢN KIỂM THỬ THẾ CỜ (TACTICAL PUZZLES)

### 1.1. Thế cờ 1: Tạo đòn đôi tất thắng (Fork / Double Threat)
* **Bối cảnh:** Bot cầm X, đang có hàng 3 hở một đầu và hàng 2 hở một đầu giao nhau tại ô $(4, 4)$.
* **Kết quả Minimax ($d=3$):** Bot tự động tính toán được rằng đánh vào $(4, 4)$ sẽ biến hàng 3 thành hàng 4, đồng thời hàng 2 thành hàng 3 mở. Đối thủ chỉ chặn được 1 bên, bên còn lại sẽ kết liễu trận đấu ở $d=3$.
* **Đánh giá:** Vượt qua xuất sắc.

### 1.2. Thế cờ 2: Nhận diện bẫy ép nước của đối thủ
* **Bối cảnh:** Đối thủ O chuẩn bị giăng bẫy 3-3 ở nước tiếp theo.
* **Kết quả Minimax ($d=2$):** Bot phát hiện nhánh đi của đối thủ sẽ đạt điểm số rất cao nếu Bot đánh lơ đãng; Bot chọn ngay nước đánh chặn vào giao điểm của đối thủ.
* **Đánh giá:** Vượt qua xuất sắc.

---

## 2. BẢNG THỐNG KÊ SỐ NÚT DUYỆT CỦA MINIMAX THUẦN TÚY

| Cấu hình thử nghiệm | Số nút duyệt (Nodes Visited) | Thời gian tìm kiếm (ms) |
| :--- | :---: | :---: |
| **Độ sâu $d = 1$** | $24$ nút | $0.8 \text{ ms}$ |
| **Độ sâu $d = 2$** | $482$ nút | $9.2 \text{ ms}$ |
| **Độ sâu $d = 3$** | $9,840$ nút | $164.5 \text{ ms}$ |
| **Độ sâu $d = 4$** | $185,200$ nút | $2,780.0 \text{ ms}$ |

👉 **Nhận xét:** Khi tăng thêm 1 độ sâu, thời gian tăng gấp $\approx 18 - 20$ lần. Đây là bằng chứng thực nghiệm rõ ràng nhất về sự cần thiết của **Alpha-Beta Pruning** ở Tuần 6.
