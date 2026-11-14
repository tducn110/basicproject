# Thư Mục Tài Liệu Học Thuật LaTeX Chuyên Sâu (Gomoku AI Engine)

Thư mục này chứa toàn bộ mã nguồn LaTeX, đồ thị, sơ đồ cơ chế và các tài liệu chuyên khảo xuất bản chính thức giải thích cặn kẽ bản chất toán học, cơ chế vận hành, phương thức chọn tham số, quy trình tiền xử lý học tăng cường (RL Dataset Pipeline), bản chất thiết kế (Why & How), và cẩm nang bảo vệ đồ án của hệ thống Gomoku AI.

---

## 1. Danh Mục Ba Công Trình Chuyên Khảo Chính

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
* **Nội dung trọng tâm:**
  1. Trích xuất thực nghiệm 10,000 ván đấu $\implies$ **368,401 transitions** thô, phân bố cân bằng Thắng $50.44\%$, Thua $48.80\%$.
  2. Chuẩn hóa tensor 3 mặt phẳng bất biến phối cảnh ($3 \times 15 \times 15$), nhân đôi hiệu quả mẫu.
  3. Đại số đối xứng nhóm nhị diện $D_4$ ($8\times \implies \mathbf{2{,}947{,}208}$ mẫu) với On-The-Fly Augmentation ($1.61\text{ MB}$ đĩa).
  4. Giao thức Match-Level Zero-Leakage Split (9,000 ván Train / 1,000 ván Val), bảo đảm $0.0\%$ rò rỉ quỹ đạo.
  5. Thiết kế mạng ResNet-6 (2,530,210 tham số, 64 kênh) tích hợp Policy Head $\pi(a|s)$ và Value Head $V(s)$, tối ưu trên GPU NVIDIA T1200 Laptop (4GB VRAM).

---

### 1.3. Chuyên khảo 3: Giáo Trình Chuyên Sâu: Tại Sao Lại Thiết Kế Như Vậy? Cẩm Nang Bản Chất Kỹ Thuật & Bộ Câu Hỏi Phản Biện Bảo Vệ Đồ Án
* **File nguồn TeX:** [`Giai_Thich_Co_Che_Va_Ly_Do_Thiet_Ke_He_Thong_Hoc_Tang_Cuong_Gomoku_RL.tex`](file:///home/pro/Downloads/basicproject/latex/Giai_Thich_Co_Che_Va_Ly_Do_Thiet_Ke_He_Thong_Hoc_Tang_Cuong_Gomoku_RL.tex)
* **File PDF đã biên dịch (29 trang):** [`Giai_Thich_Co_Che_Va_Ly_Do_Thiet_Ke_He_Thong_Hoc_Tang_Cuong_Gomoku_RL.pdf`](file:///home/pro/Downloads/basicproject/latex/Giai_Thich_Co_Che_Va_Ly_Do_Thiet_Ke_He_Thong_Hoc_Tang_Cuong_Gomoku_RL.pdf)
* **Nội dung 8 chương sư phạm chuyên sâu:**
  1. **Chương 1: Tại sao cần Warm-Start thay vì Tabula Rasa?** Phân tích khoảng trống tài nguyên TPU DeepMind (\$35M) vs GPU cá nhân (T1200 4GB) và cơ chế toán học của bẫy ngẫu nhiên (Random Walk Barrier, phương sai gradient bùng nổ).
  2. **Chương 2: Tại sao lại mã hóa Tensor 3 mặt phẳng?** Mổ xẻ sai lầm gán số nguyên $\{0, 1, 2\}$ (ảo tưởng thứ tự số học), khuyết tật phá vỡ hoán vị màu của cách mã hóa tuyệt đối Đen/Trắng, và vai trò của Plane 2 trong việc định lượng ưu thế đi trước.
  3. **Chương 3: Tại sao lại là nhóm $D_4$ và bí mật ca lỗi $k=7$?** Chứng minh đại số $|D_4| = 8$, giải phẫu nguyên nhân sai lệch trục không giao hoán giữa `np.rot90` và `np.fliplr`, bài học thiết kế Unit Test 1,800 trường hợp, và lợi thế I/O của On-The-Fly Augmentation.
  4. **Chương 4: Tại sao phân chia ngẫu nhiên lại gây thảm họa (Data Leakage)?** Vạch trần hiện tượng ảo tưởng độ chính xác $99\%$, chứng minh tính tất yếu của việc phân chia ở cấp độ ván đấu (Match-Level Split).
  5. **Chương 5: Tại sao chọn Dual-Head ResNet-6?** So sánh chi tiết với Plain CNN và Vision Transformer; chứng minh toán học con đường cao tốc gradient của Skip Connection; giải thích trường tiếp nhận 27 ô và bài toán cân đối bộ nhớ VRAM 512 MB.
  6. **Chương 6: Tại sao hàm mất mát là $\text{CrossEntropy} + 0.5 \cdot \text{MSE}$?** Đạo hàm tuyến tính thanh lịch của Softmax Cross-Entropy, tính chất ước lượng không chệch Gauss-Markov của MSE, và lý do trọng số $\lambda = 0.5$ giữ cho gradient ổn định.
  7. **Chương 7: Bộ 10 câu hỏi phản biện hóc búa nhất và hướng dẫn trả lời khi bảo vệ đồ án:** Trang bị đầy đủ lập luận đanh thép, chuẩn xác cho sinh viên trước Hội đồng phản biện.
  8. **Chương 8: Kết luận, bản đồ tư duy 5 tầng thống nhất và lời khuyên chiến lược.**

---

### 1.4. Chuyên khảo 4: Giáo Trình Toán Học, Cơ Chế Tính Toán CUDA & Quá Trình Huấn Luyện Mạng ResNet (Phase 2 - Behavioral Cloning)
* **File nguồn TeX:** [`Giao_Trinh_Toan_Hoc_CUDA_Va_Huan_Luyen_Mang_ResNet_Phase_2.tex`](file:///home/pro/Downloads/basicproject/latex/Giao_Trinh_Toan_Hoc_CUDA_Va_Huan_Luyen_Mang_ResNet_Phase_2.tex)
* **File PDF đã biên dịch (24 trang):** [`Giao_Trinh_Toan_Hoc_CUDA_Va_Huan_Luyen_Mang_ResNet_Phase_2.pdf`](file:///home/pro/Downloads/basicproject/latex/Giao_Trinh_Toan_Hoc_CUDA_Va_Huan_Luyen_Mang_ResNet_Phase_2.pdf)
* **Thư mục mô hình & checkpoint:** [`../RL_Pipeline/checkpoints/`](file:///home/pro/Downloads/basicproject/RL_Pipeline/checkpoints/) và [`../RL_Pipeline/caro_resnet.onnx`](file:///home/pro/Downloads/basicproject/RL_Pipeline/caro_resnet.onnx)
* **Nội dung 7 chương phân tích toán học & kỹ thuật chuyên sâu:**
  1. **Chương 1: Tổng quan kết quả thực nghiệm Huấn luyện Phase 2:** Phân tích chi tiết chuỗi telemetry 5 epochs trên GPU NVIDIA T1200 Laptop (332,324 train samples, 36,077 val samples). Top-1 Accuracy tăng vọt từ $44.41\%$ lên $\mathbf{60.06\%}$, Top-3 đạt $\mathbf{82.02\%}$, Val MSE giảm xuống $0.8059$. Đạt tốc độ 902 samples/giây và hoàn thành trong 381 giây/epoch.
  2. **Chương 2: Kiến trúc phần cứng CUDA & Cơ chế xử lý Ma trận:** Phân tích cấu trúc phân cấp SM (Streaming Multiprocessor), Warps (32 threads), SIMT, Shared Memory (100 TB/s). Mổ xẻ thuật toán hạ chiều tích chập `im2col` biến Convolution thành ma trận GEMM ($C \cdot K^2 \times H_{out} \cdot W_{out}$) và nguyên lý hoạt động của Tensor Cores (nhân ma trận tích lũy nửa độ chính xác $4 \times 4 \times 4$ trong 1 chu kỳ xung nhịp).
  3. **Chương 3: Kỹ thuật Tăng tốc Automatic Mixed Precision (AMP) & GradScaler:** Cơ chế định dạng dấu phẩy động FP32 vs FP16 (5-bit exponent), nguyên nhân hiện tượng triệt tiêu gradient (Underflow), công thức toán học Dynamic Loss Scaling với $\mathcal{L}_{scaled} = S \cdot \mathcal{L}$, quy trình Unscale & Inf/NaN Detection, và tối ưu hóa băng thông bộ nhớ (Memory Bandwidth Bound).
  4. **Chương 4: Đạo hàm vi tích phân Ma trận và Lan truyền ngược (Backpropagation):** Khai triển toán học giải tích ma trận đầy đủ cho: (1) Skip Connection trong ResNet Block; (2) Batch Normalization (Jacobian ma trận đầy đủ, phân tích thành phần $\sum \frac{\partial \mathcal{L}}{\partial \hat{x}_i}$); (3) Policy Head (Softmax Cross-Entropy Jacobian $\frac{\partial \mathcal{L}_p}{\partial z_i} = p_i - y_i$); (4) Value Head (Tanh MSE gradient $\frac{\partial \mathcal{L}_v}{\partial u} = (v - z)(1 - v^2)$).
  5. **Chương 5: Cơ chế Tối ưu hóa AdamW & Cosine Annealing Learning Rate:** Phân tích sự vượt trội của L2 Regularization decoupled trong AdamW ($\theta_{t} = \theta_{t-1} - \eta_t \lambda \theta_{t-1} - \dots$) so với Adam truyền thống trong kiến trúc có BatchNorm; chứng minh công thức suy giảm Cosine Annealing.
  6. **Chương 6: Kiểm thử Chiến thuật Độc lập (Tactical Verification Suite):** Thử nghiệm 3 kịch bản cờ vây/caro sinh tử: (1) Nước cờ tất thắng (Open-4 Win); (2) Phòng thủ cấp bách (Open-4 Block) - mô hình dự đoán nước chặn (7, 8) với độ tin cậy áp đảo **$99.35\%$**; (3) Nước mở cờ trung tâm kinh điển (7, 7) với xác suất tuyệt đối **$100.00\%$**.
  7. **Chương 7: Hướng dẫn tích hợp ONNX & Cầu nối sang Phase 3 (AlphaZero MCTS Self-Play):** Quy trình xuất mô hình ONNX Opset 14, tối ưu hóa suy luận không phụ thuộc PyTorch, cơ chế tích hợp hàm heuristic $P(s, a)$ và $V(s)$ vào thuật toán tìm kiếm cây Monte Carlo (PUCT formula).

---

## 2. Lệnh Biên Dịch Lại Toàn Bộ Các Tài Liệu

```bash
cd /home/pro/Downloads/basicproject/latex

# 1. Chuyên khảo Heuristic & Search (23 trang)
xelatex -interaction=nonstopmode Co_Che_Va_Phuong_Thuc_Thuat_Toan_Gomoku_AI.tex

# 2. Báo cáo kỹ thuật Học tăng cường Bước 1 (29 trang)
xelatex -interaction=nonstopmode Bao_Cao_Tien_Xu_Ly_Va_Cau_Truc_Dataset_Hoc_Tang_Cuong_Gomoku_RL.tex

# 3. Giáo trình phân tích bản chất "Tại sao" & Bộ câu hỏi bảo vệ đồ án (29 trang)
xelatex -interaction=nonstopmode Giai_Thich_Co_Che_Va_Ly_Do_Thiet_Ke_He_Thong_Hoc_Tang_Cuong_Gomoku_RL.tex

# 4. Giáo trình Toán học, CUDA & Huấn luyện Phase 2 (24 trang)
xelatex -interaction=nonstopmode Giao_Trinh_Toan_Hoc_CUDA_Va_Huan_Luyen_Mang_ResNet_Phase_2.tex
```
