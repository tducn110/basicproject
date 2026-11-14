---
title: "Kiểm thử Hệ thống Toàn diện và Tối ưu hóa Cuối cùng"
week: 10
tags:
  - tuan-10
  - system-testing
  - cross-browser
  - responsive
  - bug-fixing
---

# 🧪 KIỂM THỬ HỆ THỐNG TOÀN DIỆN VÀ TỐI ƯU HÓA CUỐI CÙNG

Tài liệu này đặc tả quy trình kiểm thử toàn diện từ đầu đến cuối (End-to-End Testing) và các danh mục kiểm tra chéo trước khi đóng gói sản phẩm phần mềm.

---

## 1. MA TRẬN KIỂM THỬ CHỨC NĂNG (FUNCTIONAL TEST MATRIX)

| Mã kiểm thử | Tính năng | Các bước thực hiện | Kết quả kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Đổi kích thước bàn cờ | Chọn $10 \times 10 \to 15 \times 15$ | Lưới cờ tự co giãn, căn giữa hoàn hảo | PASS |
| **TC-02** | Đổi luật chơi | Chuyển giữa Gomoku và Caro VN | Chặn 2 đầu không thắng ở luật VN, thắng ở Gomoku | PASS |
| **TC-03** | Chọn quân X / O | Chọn O $\to$ Bot cầm X đi trước | Bot tự động đánh nước đầu tại tâm bàn cờ | PASS |
| **TC-04** | Chế độ PvP | Đánh luân phiên trên 1 máy | Đổi đèn lượt mượt mà, đồng hồ đếm chuẩn | PASS |
| **TC-05** | 6 Cấp độ Bot | Thử lần lượt từ Easy đến Master | Tốc độ và độ thông minh phản ánh đúng lý thuyết | PASS |
| **TC-06** | Nút Hoàn tác (Undo) | Bấm Undo khi đánh với Bot | Thu hồi cả nước của Bot và nước của Người | PASS |
| **TC-07** | Bảng HUD thống kê | Quan sát sau mỗi nước của Bot | Hiển thị chính xác thời gian (ms), số nút, NPS | PASS |

---

## 2. KIỂM THỬ KHẢ NĂNG TƯƠNG THÍCH ĐA NỀN TẢNG (CROSS-PLATFORM)

1. **Trình duyệt Desktop:**
   - Google Chrome (Windows / Linux / macOS): 60 FPS, âm thanh chuẩn.
   - Mozilla Firefox: Hiển thị mượt mà CSS Grid.
   - Apple Safari: Hoạt động chuẩn xác, không bị giật lag touch event.
2. **Thiết bị Di động (Mobile Web):**
   - iOS Safari (iPhone): Khung bàn cờ chạm vuốt nhạy, không bị zoom vô ý khi chạm nhanh.
   - Android Chrome (Samsung, Pixel): Tương thích layout dọc 100%.
