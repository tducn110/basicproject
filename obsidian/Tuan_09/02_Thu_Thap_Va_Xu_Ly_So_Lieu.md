---
title: "Thu thập và Xử lý Số liệu Thực nghiệm Đối đầu"
week: 9
tags:
  - tuan-9
  - data-processing
  - winrate-matrix
  - head-to-head
---

# 📑 THU THẬP VÀ XỬ LÝ SỐ LIỆU THỰC NGHIỆM ĐỐI ĐẦU

Sau khi chạy $500$ ván đấu giả lập tự động trên runner, toàn bộ dữ liệu thống kê được tổng hợp thành ma trận đối đầu.

---

## 1. MA TRẬN TỶ LỆ THẮNG (HEAD-TO-HEAD WINRATE MATRIX)

Bảng số liệu: Hàng là Bot 1, Cột là Bot 2. Tỷ lệ thể hiện số phần trăm thắng của Bot hàng trước Bot cột:

| Bot (Hàng) | Easy | Normal | Hard | Very Hard | Expert | Master |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Easy (Random)** | $50.0\%$ | $0.0\%$ | $0.0\%$ | $0.0\%$ | $0.0\%$ | $0.0\%$ |
| **Normal (Rule-Based)**| **$100.0\%$**| $50.0\%$ | $14.0\%$ | $8.0\%$ | $2.0\%$ | $0.0\%$ |
| **Hard (Minimax d=2)** | **$100.0\%$**| **$72.0\%$** | $50.0\%$ | $16.0\%$ | $8.0\%$ | $2.0\%$ |
| **Very Hard (AB d=3)** | **$100.0\%$**| **$84.0\%$** | **$68.0\%$** | $50.0\%$ | $14.0\%$ | $6.0\%$ |
| **Expert (AB+Ord d=4)**| **$100.0\%$**| **$96.0\%$** | **$82.0\%$** | **$74.0\%$** | $50.0\%$ | $12.0\%$ |
| **Master (ID+TT d=5+)**| **$100.0\%$**| **$100.0\%$**| **$94.0\%$** | **$88.0\%$** | **$66.0\%$** | $50.0\%$ |

---

## 2. BẢNG THỐNG KÊ THỜI GIAN VÀ SỐ NƯỚC TRUNG BÌNH

| Cấp độ Bot | Thời gian trung bình / nước (ms) | Số nước trung bình / ván | Số nút duyệt trung bình / nước |
| :--- | :---: | :---: | :---: |
| **Easy** | $0.1 \text{ ms}$ | $18.4$ nước | $1$ nút |
| **Normal** | $3.2 \text{ ms}$ | $22.6$ nước | $24$ nút |
| **Hard** | $18.4 \text{ ms}$ | $28.0$ nước | $480$ nút |
| **Very Hard** | $35.8 \text{ ms}$ | $34.2$ nước | $1,250$ nút |
| **Expert** | $52.1 \text{ ms}$ | $42.5$ nước | $2,100$ nút |
| **Master** | $145.0 \text{ ms}$ | $48.8$ nước | $8,500$ nút |

👉 **Quy luật rõ ràng:** Cấp độ Bot càng cao, số nước trung bình mỗi ván càng kéo dài. Điều này chứng minh các Bot cấp cao có khả năng phòng ngự cực kỳ chặt chẽ, không bị thua sớm bởi các sơ suất chiến thuật.
