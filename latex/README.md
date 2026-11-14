# Thư Mục Tài Liệu Học Thuật LaTeX Chuyên Sâu (Gomoku AI Engine)

Thư mục này chứa toàn bộ mã nguồn LaTeX, đồ thị, sơ đồ cơ chế và tài liệu chuyên khảo xuất bản chính thức giải thích cặn kẽ bản chất toán học, cơ chế vận hành, phương thức chọn tham số và hướng dẫn triển khai thực tế của hệ thống Gomoku AI.

---

## 1. Tài liệu chính

* **File nguồn TeX:** [`Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex`](file:///home/pro/Downloads/basicproject/latex/Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex)
* **File PDF đã biên dịch (23 trang):** [`Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.pdf`](file:///home/pro/Downloads/basicproject/latex/Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.pdf)
* **Thư mục sơ đồ & hình vẽ:** [`figures/`](file:///home/pro/Downloads/basicproject/latex/figures/) (chứa 45 đồ thị vector PDF và sơ đồ cơ chế PNG).

---

## 2. Cấu trúc 7 Chương Chuyên Khảo

1. **Chương 1: Cơ Chế Không Gian Trạng Thái & Biểu Diễn Bàn Cờ**
   * Cơ chế ma trận $15 \times 15$ và tính đóng không gian $3^{225} \approx 10^{107}$.
   * Bất biến bảo toàn trạng thái Apply - Undo trong tìm kiếm In-Place.
   * Cơ chế quét tia cục bộ 4 hướng $O(1)$ (tối đa 33 phép đọc, độc lập kích thước bàn cờ).

2. **Chương 2: Cơ Chế Lượng Giá Tĩnh Heuristic & Đột Phá Chiến Thuật**
   * Bản chất hàm lượng giá thế năng vị trí.
   * Cơ chế **Available Span Verification** (Chống dồn góc/mép): Chứng minh điều kiện khả dụng $\ge 5$, triệt tiêu điểm rác về 0.
   * Cơ chế **Gapped Pattern Scanning** (Chống đánh tách lẻ): Lookahead 1 ô trống nhận diện đòn đôi $X . X X$ và $X X . X X$.
   * Cơ chế **Chebyshev Kernel**: Phân tích vì sao khoảng cách Chebyshev $L_\infty$ tạo vành đai vuông đồng tâm đẳng hướng vượt trội so với hình thoi Manhattan $L_1$.
   * Cơ chế thang điểm tiện ích tối hậu (Terminal Utility) $M = 100{,}000{,}000$ và cơ chế phạt/thưởng theo ply.

3. **Chương 3: Phương Thức Chọn Lựa Tham Số & Điểm Cân Bằng Pareto**
   * Phương thức leo đồi tối ưu qua giải đấu tự đối kháng hoán đổi màu quân đối xứng.
   * Phương thức chọn $W(\text{Open 3}) = 6{,}500$ qua quy luật đường cong hình chuông (Bell Curve) và 3 miền chiến thuật.
   * Phương thức chọn $\beta = 1.15$ và chứng minh **Bệnh lý Thiên thủ (Defensive Paralysis)** khi $\beta \ge 1.35$ làm sụt giảm tỉ lệ thắng từ $77.2\%$ xuống $36.1\%$.
   * Phân tích Pareto giới hạn Soft Cap $= 16$ ($78.2\text{ ms}$, đạt $96.4\%$ độ chính xác).

4. **Chương 4: Cơ Chế Cắt Tỉa Alpha-Beta, Move Ordering & Transposition**
   * Cơ chế khoảng giá trị $[\alpha, \beta]$ và điều kiện ngắt nhánh $\alpha \ge \beta$.
   * Định lý Knuth - Moore và cơ chế chấm điểm nhanh $O(1)$ đưa độ phức tạp về tiệm cận $O(b^{d/2})$.
   * Cơ chế bảng băm Zobrist 64-bit và tính chất đại số XOR $O(1)$ khử tính hoán vị $(A \to B) \equiv (B \to A)$.
   * Cơ chế 3 loại Bound (Exact, LowerBound, UpperBound) trong Transposition Table.

5. **Chương 5: Cơ Chế Cắt Mềm Không Gian Ứng Viên (Soft Cap)**
   * Bán kính Chebyshev $r \le 2$ khử $89.3\%$ không gian ô vô nghĩa ở khai cuộc.
   * Quy tắc bảo tồn chiến thuật tuyệt đối (**Tactical Retention Rule**): Giữ toàn bộ $W_p \cup W_o$, đạt `Tactical Recall = 1.0`, triệt tiêu hoàn toàn lỗi Hard Cap-loss.

6. **Chương 6: Hướng Dẫn Sử Dụng & Luồng Điều Phối Trong Engine Thực Tế**
   * Kiến trúc đa luồng Web Worker + Rust WASM: Cô lập tải nặng, giữ vững 60 FPS trên Main Thread.
   * Ma trận cấu hình chi tiết 6 cấp độ bot (`Easy`, `Normal`, `Hard`, `VeryHard`, `Expert`, `Master`) trong `ai.rs`.

7. **Chương 7: Tổng Hợp & Giới Hạn Nghiên Cứu**
   * Bảng tổng hợp đối chiếu cơ chế và hiệu quả thực nghiệm.
   * Phân tích hiện tượng đường chân trời (Horizon Effect) và hướng phát triển đòn sát cục liên tục (VCF/VCT).

---

## 3. Lệnh Biên Dịch Lại (Recompile)

```bash
cd /home/pro/Downloads/basicproject/latex
xelatex -interaction=nonstopmode Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex
```
