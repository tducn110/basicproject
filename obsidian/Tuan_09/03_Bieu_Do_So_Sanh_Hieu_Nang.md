---
title: "Biểu đồ và Bảng Phân tích Hiệu năng Thuật toán"
week: 9
tags:
  - tuan-9
  - charts
  - mermaid
  - performance-comparison
  - data-visualization
---

# 📊 BIỂU ĐỒ VÀ BẢNG PHÂN TÍCH HIỆU NĂNG THUẬT TOÁN

Tài liệu này trực quan hóa các dữ liệu thực nghiệm phục vụ việc đưa vào Chương 5 của Báo cáo đề cương và slide thuyết trình.

---

## 1. BIỂU ĐỒ SO SÁNH SỐ LƯỢNG NÚT DUYỆT (LOGARITHMIC SCALE)

```text
Số lượng nút duyệt trung bình mỗi nước đi:
Minimax (d=3)       : [====================================] 8,820 nodes
Alpha-Beta (d=3)    : [====] 1,150 nodes
AB + MoveOrd (d=3)  : [=] 320 nodes
Master Bot (d=5 ID) : [========] 2,100 nodes (Duyệt sâu hơn 2 tầng mà số nút ít hơn Minimax d=3!)
```

---

## 2. BIỂU ĐỒ MERMAID TƯƠNG QUAN GIỮA THỜI GIAN VÀ ĐỘ THÔNG MINH

```mermaid
xychart-beta
    title "Thời gian xử lý trung bình mỗi nước đi (mili-giây)"
    x-axis ["Easy", "Normal", "Hard", "Very Hard", "Expert", "Master"]
    y-axis "Thời gian (ms)" 0 --> 160
    bar [0.1, 3.2, 18.4, 35.8, 52.1, 145.0]
```

---

## 3. BIỂU ĐỒ TỶ LỆ CẮT TỈA CỦA CÁC PHƯƠNG PHÁP

```mermaid
xychart-beta
    title "Tỷ lệ cắt tỉa nhánh cành (Pruning Ratio %)"
    x-axis ["Minimax", "Alpha-Beta thuần", "Alpha-Beta + MoveOrder", "Master (ID+TT)"]
    y-axis "Tỷ lệ cắt tỉa (%)" 0 --> 100
    bar [0, 72.5, 88.6, 94.2]
```

* **Điểm sáng khoa học:** Nhờ sự kết hợp của **Move Ordering, Iterative Deepening và Transposition Table**, cấp độ Master đạt tỷ lệ cắt tỉa lên tới **$94.2\%$**, chứng minh tính hiệu quả vượt bậc của các kỹ thuật tối ưu trong Đề cương.
