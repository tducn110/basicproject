---
title: "Nghiên cứu Luật Cờ Caro và các Biến thể Quốc tế"
week: 1
tags:
  - tuan-1
  - rules
  - gomoku
  - renju
  - caro-vietnam
---

# ♟️ NGHIÊN CỨU LUẬT CỜ CARO & CÁC BIẾN THỂ QUỐC TẾ

## 1. Giới thiệu tổng quan
Cờ Caro (ở phương Tây gọi là Gomoku / Five in a Row, ở Nhật Bản gọi là 五目並べ - Gomoku-narabe) là một trò chơi chiến thuật bàn cờ đối kháng 2 người thuộc họ trò chơi m,n,k-game (cụ thể là (n,n,5)-game). Người chơi lần lượt đặt quân cờ lên giao điểm hoặc ô của lưới cờ nhằm tạo ra một hàng liên tục gồm 5 quân của mình theo hướng ngang, dọc hoặc đường chéo.

---

## 2. Bảng so sánh chi tiết các biến thể luật chơi

| Tiêu chí | Gomoku Tự do (Freestyle) | Gomoku Chuẩn (Standard) | Renju (Chuyên nghiệp) | Cờ Caro Việt Nam |
| :--- | :--- | :--- | :--- | :--- |
| **Kích thước bàn cờ** | Thường là $15 \times 15$ hoặc $19 \times 19$ | $15 \times 15$ | $15 \times 15$ | $10 \times 10$, $15 \times 15$ hoặc vô hạn (vở ô ly) |
| **Điều kiện thắng** | Đạt $\ge 5$ quân liên tiếp | Đúng 5 quân liên tiếp | Đúng 5 quân (Đen); $\ge 5$ quân (Trắng) | Đúng 5 quân liên tiếp **và không bị chặn cả 2 đầu** |
| **Luật Overline ($\ge 6$ quân)** | Cho phép thắng | Không tính thắng (phải tiếp tục) | Bị cấm với quân Đen (xử thua ngay); Hợp lệ với Trắng | Tùy giao kèo (thường chỉ tính thắng nếu đủ 5 quân không bị chặn 2 đầu) |
| **Nước cấm (Forbidden Moves)** | Không có | Không có | **Rất nghiêm ngặt với quân Đen:** cấm 3-3 kép, cấm 4-4 kép, cấm overline | Không có nước cấm |
| **Luật Khai cuộc (Opening Rule)** | Người thứ nhất đi tùy ý | Một số giải áp dụng Swap2 | Áp dụng 26 thế khai cuộc chuẩn + Swap | Thường đánh luân phiên, không luật mở đầu phức tạp |
| **Tính cân bằng** | Quân đi trước (Đen) thắng tuyệt đối | Vẫn nghiêng nặng về Đen | Cân bằng tương đối cao | Rất cân bằng nhờ cơ chế chặn 2 đầu |

---

## 3. Phân tích chi tiết từng biến thể

### 3.1. Freestyle Gomoku (Gomoku Tự do)
- **Đặc trưng:** Luật đơn giản nhất: người chơi nào tạo được 5 quân liên tiếp hoặc nhiều hơn ($\ge 5$) trước thì thắng cuộc.
- **Điểm yếu chí mạng:** Do không có bất kỳ hạn chế nào, người đi trước nắm lợi thế tấn công chủ động tuyệt đối. Người đi trước có thể thiết lập chuỗi nước ép buộc (forcing moves) liên tục cho đến khi đối thủ không thể phòng thủ.
- **Kết quả toán học:** Đã được chứng minh là **First-Player Win** bởi L. Victor Allis (1994).

### 3.2. Renju (Cờ Gomoku Chuyên nghiệp Nhật Bản)
- Nhằm khắc phục ưu thế quá lớn của người đi trước, Hiệp hội Renju Quốc tế (RIF) đã ban hành các điều luật khắt khe áp dụng riêng cho quân Đen (đi trước):
  * **Cấm nước 3-3 (Double-Three):** Đen không được đặt quân tạo ra cùng lúc hai hàng 3 quân còn thông đường.
  * **Cấm nước 4-4 (Double-Four):** Đen không được tạo cùng lúc hai hàng 4 quân.
  * **Cấm Overline (Đường 6 quân trở lên):** Đen tạo thành 6 quân trở lên bị xử thua ngay lập tức.
  * Trong khi đó, quân Trắng (đi sau) hoàn toàn không bị áp dụng bất kỳ nước cấm nào.

### 3.3. Luật Cờ Caro Việt Nam (Luật chặn 2 đầu)
- **Quy tắc cốt lõi:** Một hàng 5 quân liên tiếp chỉ mang lại chiến thắng nếu nó **không bị đối phương chặn ở cả hai đầu**.
  * Ví dụ 1: `_ X X X X X _` $\rightarrow$ **THẮNG** (Mở cả 2 đầu).
  * Ví dụ 2: `O X X X X X _` $\rightarrow$ **THẮNG** (Chỉ bị chặn 1 đầu).
  * Ví dụ 3: `O X X X X X O` $\rightarrow$ **CHƯA THẮNG** (Đã bị chặn cả 2 đầu).
  * Ví dụ 4 (Ở mép bàn cờ): Mép bàn cờ trong luật thi đấu thường được quy ước là 1 đầu chặn tự nhiên. Do đó nếu một đầu chạm biên, đầu kia bị quân địch chặn thì cũng coi như bị chặn 2 đầu.
- **Ý nghĩa thực tiễn đối với thiết kế thuật toán:**
  1. Giảm thiểu các bàn thắng "bất thình lình" do sơ suất nhìn sót.
  2. Buộc người chơi tấn công phải tạo ra các thế cờ "bốn mở" (`_ X X X X _`) hoặc đòn kép (tấn công 2 hướng cùng lúc) mới có thể kết liễu trận đấu.
  3. Với Game Engine và AI: Hàm kiểm tra thắng (`checkWin`) và hàm nhận diện mẫu (`patternDetection`) phải cài đặt thêm logic kiểm tra 2 ô đầu mút của chuỗi 5 quân.

---

## 4. Quyết định lựa chọn cho Dự án
Dự án sẽ hỗ trợ thiết lập linh hoạt (Configurable Rules) với 2 chế độ:
1. **Chế độ Gomoku Quốc tế Chuẩn:** 5 quân liên tiếp là thắng (tiện cho việc kiểm thử đối chuẩn với các Bot AI quốc tế).
2. **Chế độ Cờ Caro Việt Nam (Default):** 5 quân liên tiếp không bị chặn 2 đầu mới thắng (đáp ứng đúng thị hiếu người dùng Việt Nam).
