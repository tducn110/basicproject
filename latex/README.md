# Thư Mục Tài Liệu Học Thuật LaTeX Chuyên Sâu (Gomoku AI Engine)

Thư mục này chứa toàn bộ mã nguồn LaTeX, đồ thị, sơ đồ cơ chế và tài liệu chuyên khảo xuất bản chính thức giải thích cặn kẽ bản chất toán học, cơ chế vận hành, phương thức chọn tham số, quy trình tiền xử lý học tăng cường (RL Dataset Pipeline), và hướng dẫn triển khai thực tế của hệ thống Gomoku AI.

---

## 1. Danh Mục Các Công Trình Chuyên Khảo Chính

### 1.1. Chuyên khảo 1: Cơ Chế Và Phương Thức Thuật Toán Gomoku AI (Heuristic & Search)
* **File nguồn TeX:** [`Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex`](file:///home/pro/Downloads/basicproject/latex/Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex)
* **File PDF đã biên dịch (23 trang):** [`Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.pdf`](file:///home/pro/Downloads/basicproject/latex/Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.pdf)
* **Thư mục sơ đồ & hình vẽ:** [`figures/`](file:///home/pro/Downloads/basicproject/latex/figures/) (chứa 45 đồ thị vector PDF và sơ đồ cơ chế PNG).
* **Nội dung trọng tâm:**
  1. Cơ chế không gian trạng thái $15 \times 15$, biểu diễn phẳng In-Place và bất biến Apply - Undo.
  2. Cơ chế quét tia cục bộ $O(1)$ (tối đa 33 phép đọc, độc lập kích thước bàn cờ).
  3. Cơ chế lượng giá tĩnh Heuristic: Available Span Verification, Gapped Pattern Scanning, Chebyshev Kernel.
  4. Cơ chế cắt tỉa Alpha-Beta kết hợp bảng băm Zobrist 64-bit và Move Ordering Knuth-Moore.
  5. Cơ chế Soft Cap cắt mềm không gian ứng viên và quy tắc bảo tồn chiến thuật (Tactical Retention Rule).
  6. Luồng điều phối đa luồng Web Worker + Rust WASM và ma trận cấu hình 6 cấp độ Bot trong Engine.

---

### 1.2. Chuyên khảo 2: Tiền Xử Lý Dữ Liệu, Cấu Trúc Tập Transition Và Thiết Kế Mạng Nơ-ron Dual-Head ResNet (Reinforcement Learning - Bước 1)
* **File nguồn TeX:** [`Bao_Cao_Tien_Xu_Ly_Va_Cau_Truc_Dataset_Hoc_Tang_Cuong_Gomoku_RL.tex`](file:///home/pro/Downloads/basicproject/latex/Bao_Cao_Tien_Xu_Ly_Va_Cau_Truc_Dataset_Hoc_Tang_Cuong_Gomoku_RL.tex)
* **File PDF đã biên dịch (29 trang):** [`Bao_Cao_Tien_Xu_Ly_Va_Cau_Truc_Dataset_Hoc_Tang_Cuong_Gomoku_RL.pdf`](file:///home/pro/Downloads/basicproject/latex/Bao_Cao_Tien_Xu_Ly_Va_Cau_Truc_Dataset_Hoc_Tang_Cuong_Gomoku_RL.pdf)
* **Thư mục mã nguồn thực thi:** [`../RL_Pipeline/`](file:///home/pro/Downloads/basicproject/RL_Pipeline/)
* **Nội dung 8 chương khoa học:**
  1. **Chương 1: Đặt Vấn Đề & Cơ Sở Lý Thuyết Học Tăng Cường Cho Gomoku**
     * Mô hình hóa Gomoku dưới dạng Markov Decision Process (MDP): $(S, A, P, R, \gamma)$.
     * Phân tích bản chất và chi phí khổng lồ của bẫy Khởi động lạnh (Cold-Start Problem) trong Tabula Rasa.
     * So sánh 3 trường phái: Behavioral Cloning (BC), Offline RL (CQL/IQL) và AlphaZero Warm-Start.
  2. **Chương 2: Cơ Chế Trích Xuất Dữ Liệu Thực Nghiệm Từ 10,000 Ván Đấu**
     * Cơ chế Replay bàn cờ và bóc tách từng Transition theo lượt đi với 10 CPU workers song song.
     * Thống kê định lượng: **368,401 transitions** thô, phân bố cân bằng tuyệt đối giữa Thắng ($50.44\%$), Thua ($48.80\%$), Hòa ($0.76\%$) trên 5 profile.
  3. **Chương 3: Mã Hóa Trạng Thái Bất Biến Phối Cảnh (Perspective-Invariant State Encoding)**
     * Định lý toán học và chứng minh tính bất biến hoán vị màu của tensor 3 mặt phẳng ($3 \times 15 \times 15$).
     * Nhân đôi hiệu quả sử dụng mẫu (sample efficiency), loại bỏ thiên lệch màu quân Đen/Trắng.
  4. **Chương 4: Đại Số Nhóm Nhị Diện $D_4$ Và Tăng Cường Dữ Liệu $8\times$**
     * Đại số 8 phép đẳng cự hình học nhóm $D_4$ trên lưới vuông $15 \times 15$.
     * Công thức biến đổi tọa độ $(r, c)$ và chỉ số hành động 1D $a = 15r + c$.
     * Phân tích ca lỗi phản xạ đường chéo phụ ($k=7$) và chứng minh bất biến trên toàn bộ $1{,}800$ tọa độ.
     * Nhân quy mô dữ liệu hiệu dụng lên **2,947,208 mẫu** với cơ chế tăng cường động (On-The-Fly Augmentation) trong PyTorch.
  5. **Chương 5: Giao Thức Phân Chia Tập Dữ Liệu Không Rò Rỉ (Match-Level Zero-Leakage Split)**
     * Bệnh lý rò rỉ dữ liệu chuỗi thời gian khi dùng `train_test_split` ngẫu nhiên phẳng.
     * Thuật toán phân chia ở cấp độ định danh ván đấu (`match_id`): 9,000 ván Train / 1,000 ván Val, bảo đảm $0.0\%$ rò rỉ quỹ đạo.
  6. **Chương 6: Thiết Kế Kiến Trúc Mạng Nơ-ron Hai Đầu (Dual-Head ResNet)**
     * Nguyên lý chia sẻ thân mạng (Shared Backbone) tích hợp đồng thời Policy Head $\pi(a|s)$ và Value Head $V(s)$.
     * Cấu trúc ResNet-6 (6 khối Residual, 64 kênh đặc trưng), kiểm kê chi tiết **2,530,210 tham số** (~9.65 MB bộ nhớ weights).
     * Đánh giá khả thi phần cứng trên GPU NVIDIA T1200 Laptop (4GB VRAM): chỉ tiêu tốn $\approx 512\text{ MB}$ VRAM ở Batch Size 256 với CUDA AMP (FP16).
  7. **Chương 7: Đặc Tả Schema JSON, Manifest Và Kế Hoạch Triển Khai Bước 2**
     * Đóng gói nhị phân nén siêu gọn `gomoku_rl_base_324k.npz` (chỉ 1.61 MB).
     * Đặc tả hình thức `schema_rl_dataset.json` và siêu dữ liệu `dataset_manifest.json`.
     * Thiết kế hàm mất mát đa nhiệm: $\mathcal{L} = \mathcal{L}_{\text{policy}} + 0.5 \mathcal{L}_{\text{value}} + 10^{-4} \|\theta\|^2$.
     * Lộ trình Bước 2: Huấn luyện có giám sát (Behavioral Cloning), theo dõi Top-1/Top-3 Accuracy và xuất khẩu ONNX.
  8. **Chương 8: Kết Luận Và Hướng Phát Triển**
     * Tổng kết đóng góp kỹ thuật và lộ trình tích hợp vào MCTS và Engine thực tế.

---

## 2. Hướng Dẫn Biên Dịch Lại (Recompilation)

Sử dụng trình biên dịch `xelatex` (đã cấu hình font hệ thống `Liberation Serif`, `Liberation Sans`, `DejaVu Sans Mono`):

```bash
cd /home/pro/Downloads/basicproject/latex

# Biên dịch chuyên khảo Heuristic & Search (23 trang)
xelatex -interaction=nonstopmode Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex

# Biên dịch chuyên khảo Học tăng cường Bước 1 (29 trang)
xelatex -interaction=nonstopmode Bao_Cao_Tien_Xu_Ly_Va_Cau_Truc_Dataset_Hoc_Tang_Cuong_Gomoku_RL.tex
```
