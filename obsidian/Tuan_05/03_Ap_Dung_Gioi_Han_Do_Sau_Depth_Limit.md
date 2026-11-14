---
title: "Áp dụng Giới hạn Độ sâu Tìm kiếm (Depth Limit) và Hiệu ứng Chân trời"
week: 5
tags:
  - tuan-5
  - depth-limit
  - horizon-effect
  - search-cutoff
---

# 🛑 ÁP DỤNG GIỚI HẠN ĐỘ SÂU (DEPTH LIMIT) VÀ HIỆU ỨNG CHÂN TRỜI

Do không gian cây trò chơi của Cờ Caro quá lớn ($b \approx 15 - 25$), việc duyệt vét cạn tới khi kết thúc trận đấu là bất khả thi. Do đó, kỹ thuật **giới hạn độ sâu (Depth Limit)** là điều kiện bắt buộc để kiểm soát thời gian phản hồi.

---

## 1. PHÂN BỔ THỜI GIAN THEO ĐỘ SÂU (DEPTH BENCHMARKS)

| Độ sâu ($d$) | Ý nghĩa chiến thuật | Số nút ước tính ($b = 20$) | Thời gian xử lý JS (Core i5) |
| :---: | :--- | :---: | :---: |
| **$d = 1$** | Chỉ đánh giá các nước đi ngay lập tức | $\approx 20$ nút | $< 1 \text{ ms}$ |
| **$d = 2$** | Nhìn trước: Nước của ta $\rightarrow$ Phản xạ của đối thủ | $\approx 400$ nút | $\approx 5 - 10 \text{ ms}$ |
| **$d = 3$** | Nhìn trước: Ta đi $\rightarrow$ Đối thủ đỡ $\rightarrow$ Ta phản công | $\approx 8,000$ nút | $\approx 50 - 150 \text{ ms}$ |
| **$d = 4$** | Đòn liên hoàn 2 hiệp đầy đủ | $\approx 160,000$ nút | $\approx 1 - 3 \text{ giây}$ |
| **$d \ge 5$** | Tìm kiếm chiến lược sâu | $> 3,000,000$ nút | Không khả thi nếu không cắt tỉa |

---

## 2. HIỆU ỨNG CHÂN TRỜI (THE HORIZON EFFECT)

* **Khái niệm:** Là hiện tượng AI bị "mù" trước các nguy cơ nghiêm trọng nằm ngay sau độ sâu giới hạn ($d_{\max} + 1$).
  * Ví dụ: Tại độ sâu $d = 2$, AI thấy mình ăn điểm ở nước thứ 2, nhưng thực chất ở nước thứ 3 đối thủ sẽ tạo thành hàng 5 thắng cuộc. Vì bị chặn ở $d = 2$, AI không "nhìn thấy" đòn kết liễu này.
* **Cách khắc phục:**
  1. Thưởng điểm cực lớn cho các nước tạo thế ép buộc (Open Four, Double Three).
  2. Bổ sung kỹ thuật Quiescence Search (Tìm kiếm tĩnh lặng) tại các nút lá nguy hiểm.
  3. Áp dụng kỹ thuật Alpha-Beta Pruning và Iterative Deepening ở các tuần tiếp theo.
