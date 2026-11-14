---
title: "Đo lường Số lượng Nodes Visited và Nodes Pruned"
week: 6
tags:
  - tuan-6
  - metrics
  - nodes-visited
  - nodes-pruned
  - pruning-ratio
---

# 📊 ĐO LƯỜNG SỐ LƯỢNG NODES VISITED VÀ NODES PRUNED

Để định lượng chính xác sức mạnh của thuật toán Alpha-Beta Pruning, hệ thống tích hợp bộ đo thông số trạng thái trong suốt quá trình đệ quy.

---

## 1. CÔNG THỨC VÀ Ý NGHĨA CHỈ SỐ

1. **Số nút đã duyệt (Nodes Visited - $N_v$):**
   * Tổng số lần hàm tìm kiếm được gọi đệ quy (mỗi nút biểu diễn một trạng thái bàn cờ giả định được tạo ra và kiểm tra).
2. **Số nút bị cắt tỉa (Nodes Pruned - $N_p$):**
   * Số lượng các nút con bị bỏ qua trực tiếp ngay khi điều kiện $\beta \le \alpha$ được thỏa mãn.
3. **Tỷ lệ cắt tỉa (Pruning Ratio - $\eta$):**
   $$\eta = \frac{N_p}{N_v + N_p} \times 100\%$$
   * $\eta$ càng cao, thuật toán càng hoạt động hiệu quả, tiết kiệm được càng nhiều chu kỳ CPU.

---

## 2. BẢNG DỮ LIỆU ĐO LƯỜNG THỰC NGHIỆM TẠI ĐỘ SÂU $d = 3$ VÀ $d = 4$

| Vị trí thế cờ | Độ sâu ($d$) | Nodes Visited ($N_v$) | Nodes Pruned ($N_p$) | Tỷ lệ cắt tỉa ($\eta$) |
| :--- | :---: | :---: | :---: | :---: |
| **Khai cuộc (Nước 3)** | $d = 3$ | $1,240$ | $3,850$ | $75.6\%$ |
| **Trung cuộc (Nước 15)** | $d = 3$ | $680$ | $4,520$ | $86.9\%$ |
| **Thế cờ có đe dọa (Tactical)**| $d = 3$ | $310$ | $5,890$ | $95.0\%$ |
| **Trung cuộc (Nước 15)** | $d = 4$ | $9,450$ | $92,100$ | $90.7\%$ |

👉 **Nhận xét quan trọng:** Trong các thế cờ căng thẳng có đòn đe dọa (Four, Open Three), Alpha-Beta Pruning có thể **cắt tỉa tới 95%** không gian tìm kiếm, bởi vì các phản xạ ép buộc được tìm thấy rất sớm và loại trừ ngay các nhánh đi vu vơ khác.
