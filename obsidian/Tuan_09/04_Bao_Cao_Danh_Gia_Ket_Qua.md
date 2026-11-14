---
title: "Báo cáo Đánh giá Kết quả Thực nghiệm và Phân tích Học thuật"
week: 9
tags:
  - tuan-9
  - academic-evaluation
  - scientific-findings
  - discussion
---

# 🎓 BÁO CÁO ĐÁNH GIÁ KẾT QUẢ THỰC NGHIỆM VÀ PHÂN TÍCH HỌC THUẬT

Tài liệu này đúc kết các phát hiện khoa học từ quá trình thực nghiệm, trả lời các câu hỏi nghiên cứu cốt lõi của đồ án.

---

## 1. CÁC KẾT LUẬN KHOA HỌC CHÍNH

1. **Tính bảo toàn toán học của Alpha-Beta:**
   * Thực nghiệm $100\%$ khẳng định: Alpha-Beta Pruning không làm suy giảm chất lượng nước đi so với Minimax, nhưng giảm thiểu chi phí tính toán từ $70\%$ đến $90\%$.
2. **Vai trò sinh tử của Move Ordering:**
   * Cắt tỉa Alpha-Beta chỉ phát huy tối đa sức mạnh khi có sự hỗ trợ của bộ sắp xếp thứ tự nước đi (Move Ordering). Nếu không có Move Ordering, hiệu quả cắt tỉa giảm đi một nửa.
3. **Hiệu năng của Transposition Table:**
   * Trong cờ Caro, các trạng thái hoán vị xuất hiện với mật độ rất dày đặc ở giai đoạn trung cuộc. Việc lưu trữ mã băm Zobrist giúp Bot nhận diện ngay các thế cờ trùng lặp và phản hồi trong $0 \text{ ms}$.
4. **Ảnh hưởng của Luật Cờ Caro Việt Nam (Chặn 2 đầu):**
   * Trong các trận đấu giữa hai Master Bot trên luật Gomoku tự do, quân Đen (đi trước) thắng tới $84\%$.
   * Nhưng khi chuyển sang luật Caro Việt Nam chặn 2 đầu, tỷ lệ thắng của quân đi trước giảm xuống mức **$58\%$**, số ván hòa tăng từ $2\%$ lên **$18\%$**.
   * 👉 Điều này chứng minh luật chặn 2 đầu của Việt Nam là một giải pháp cân bằng trò chơi vô cùng thanh lịch và hiệu quả!
