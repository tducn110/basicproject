---
title: "Nghiên cứu Các Phương pháp Biểu diễn Bàn cờ (Board Representation)"
week: 1
tags:
  - tuan-1
  - data-structure
  - board-representation
  - optimization
---

# ♟️ NGHIÊN CỨU CÁC PHƯƠNG PHÁP BIỂU DIỄN BÀN CỜ (BOARD REPRESENTATION)

Biểu diễn bàn cờ là cấu trúc dữ liệu nền tảng quyết định trực tiếp đến tốc độ xử lý của Game Engine, khả năng sao chép trạng thái khi duyệt cây tìm kiếm và độ mượt mà của giao diện người dùng.

---

## 1. CÁC PHƯƠNG PHÁP BIỂU DIỄN PHỔ BIẾN

### 1.1. Ma trận hai chiều (2D Matrix / Array of Arrays)
* **Cấu trúc:** `board[row][col]`, với kích thước $N \times N$ (ví dụ: $10 \times 10$ hoặc $15 \times 15$).
* **Giá trị quy ước:**
  * `0`: Ô trống (Empty).
  * `1`: Quân X (Người chơi 1 - Đen).
  * `2`: Quân O (Người chơi 2 - Trắng).
* **Ưu điểm:**
  * Cực kỳ trực quan, phản ánh chính xác tọa độ hàng và cột của bàn cờ thực tế.
  * Việc duyệt 4 hướng (ngang, dọc, 2 đường chéo) thông qua vector hướng $(\Delta r, \Delta c)$ vô cùng tự nhiên:
    * Ngang: $(0, 1)$
    * Dọc: $(1, 0)$
    * Chéo chính: $(1, 1)$
    * Chéo phụ: $(1, -1)$
* **Nhược điểm:**
  * Trong JavaScript, mảng 2 chiều thực chất là "mảng chứa các con trỏ trỏ tới mảng khác" (Array of References). Việc cấp phát này không liên tục trong bộ nhớ RAM, dẫn đến tỉ lệ trượt cache (CPU Cache Miss) cao hơn khi AI thực hiện hàng triệu phép thử.

### 1.2. Mảng phẳng một chiều (1D Flat Array / TypedArray)
* **Cấu trúc:** `board[index]`, với mảng có độ dài $N^2$ (ví dụ: 100 phần tử cho bàn cờ $10 \times 10$).
* **Ánh xạ tọa độ:**
  $$\text{index} = \text{row} \times N + \text{col}$$
  $$\text{row} = \lfloor \text{index} / N \rfloor, \quad \text{col} = \text{index} \pmod N$$
* **Ưu điểm:**
  * Bộ nhớ liên tục (Contiguous Memory Layout). Nếu sử dụng `Uint8Array(100)` hoặc `Int8Array(225)`, chi phí bộ nhớ chỉ tốn vài trăm byte.
  * Tốc độ sao chép trạng thái cực nhanh: `const newBoard = new Uint8Array(board);`
  * Tối ưu hóa tối đa cho cơ chế JIT (Just-In-Time) của Google V8 Engine trong trình duyệt.

### 1.3. Kỹ thuật Bitboards
* **Ý tưởng:** Đại diện mỗi loại quân bằng một chuỗi bit nhị phân.
* Với bàn cờ $8 \times 8$ (Cờ vua, Othello), một số nguyên 64-bit (`uint64_t`) có thể đại diện cho toàn bộ bàn cờ.
* Với bàn cờ $10 \times 10$ (100 ô) hoặc $15 \times 15$ (225 ô):
  * Cần sử dụng kiểu dữ liệu `BigInt` trong JS hoặc ghép nhiều biến 64-bit (ví dụ: 2 biến 64-bit cho bàn $10 \times 10$, 4 biến cho $15 \times 15$).
* **Ưu điểm:** Tốc độ kiểm tra mẫu (Pattern Matching) bằng các phép toán logic bitwise (`AND`, `OR`, `XOR`, `Shift`) đạt tốc độ phần cứng (1 chu kỳ CPU).
* **Nhược điểm:** Độ phức tạp cài đặt rất cao, mã nguồn khó đọc và khó bảo trì đối với giai đoạn sơ khởi của dự án.

### 1.4. Bảng băm Zobrist (Zobrist Hashing)
* Dành cho việc lưu trữ và tra cứu nhanh các trạng thái bàn cờ đã tính toán (Transposition Table):
  * Khởi tạo trước một ma trận các số ngẫu nhiên 64-bit: $Z[\text{row}][\text{col}][\text{piece}]$.
  * Khi người chơi đánh một nước đi tại $(r, c)$ với quân $p$:
    $$\text{hash}_{\text{new}} = \text{hash}_{\text{old}} \oplus Z[r][c][p]$$
  * Khi hoàn tác (Undo): Chỉ cần XOR lại đúng giá trị đó:
    $$\text{hash}_{\text{reverted}} = \text{hash}_{\text{new}} \oplus Z[r][c][p]$$
* Cực kỳ quan trọng cho các thuật toán tìm kiếm nâng cao (Alpha-Beta Pruning, MCTS).

---

## 2. BẢNG SO SÁNH TỔNG HỢP

| Tiêu chí | Ma trận 2D (`Array[][]`) | Mảng phẳng 1D (`Uint8Array`) | Bitboard (`BigInt`) |
| :--- | :--- | :--- | :--- |
| **Độ dễ hiểu & Cài đặt** | ⭐⭐⭐⭐⭐ (Rất dễ) | ⭐⭐⭐⭐ (Dễ) | ⭐⭐ (Khó) |
| **Tính trực quan tọa độ** | Cao nhất | Trung bình (cần phép tính $r \times N + c$) | Thấp |
| **Tốc độ sao chép (Clone)** | Chậm ($O(N)$ mảng con) | Siêu nhanh (Block memory copy) | Tức thì (Vài phép gán số) |
| **Tối ưu hóa Cache CPU** | Thấp | Rất cao | Tối đa |
| **Độ phù hợp Web/JS** | Phù hợp UI / Game Logic | Phù hợp Game Engine & AI Bot | Dành cho Chess Engine chuyên nghiệp |

---

## 3. LỰA CHỌN KIẾN TRÚC CHO DỰ ÁN

Để đảm bảo vừa trong sáng về mặt thiết kế mã nguồn vừa đạt hiệu năng cao:
1. **Lớp Core Game Engine:** Sử dụng **Ma trận 2D (`number[][]`)** kết hợp các hàm helper chuyển đổi tọa độ nhanh, đảm bảo code trong sáng, dễ viết unit test, kiểm tra 4 hướng cực kỳ trực quan.
2. **Lớp AI Evaluation (Tuần 4):** Có thể đóng gói thêm mảng 1D `Uint8Array` hoặc cache các tọa độ ô đã đánh để tăng tốc độ duyệt heuristic mà không cần lặp qua toàn bộ $N \times N$ ô trống.
