# BÁO CÁO THỰC NGHIỆM ĐỐI ĐẦU: RUST VS TYPESCRIPT GOMOKU AI ENGINE
## Chứng Minh Định Lượng Hiệu Năng Tính Toán & Kiến Trúc Web Worker Tránh Lag UI

> **Mã hồ sơ học thuật:** `EXP-W4-A01` / `RQ-ARCH-01` / `RQ-W4-A01`  
> **Thuộc chương trình:** Đồ Án Cơ Sở — VNUK Standard  
> **Môi trường thực thi:** Linux x86_64, Node.js v20.18.0 (V8 JIT Engine), Rustc 1.98.1 (LLVM Release Profile)  
> **Mô hình thuật toán:** Alpha-Beta Pruning (Chebyshev Candidate Radius $r = 2$)  
> **Bộ dữ liệu gốc:** `benchmark/results/benchmark_data.json`  
> **Biểu đồ bằng chứng (300 DPI):** `assets/charts/rust_vs_ts_performance.png`  

---

## 1. TỔNG QUAN & BÀI TOÁN NGHIÊN CỨU

Trong phát triển game trí tuệ nhân tạo trên nền tảng Web, hai câu hỏi kiến trúc cốt lõi được đặt ra:
1. **RQ-W4-A01 (Tính tương đương ngữ nghĩa - Semantic Equivalence):** Động cơ tính toán viết bằng Rust (WASM) có cho ra kết quả đánh giá thế cờ và cây tìm kiếm đồng nhất 100% với động cơ nguyên mẫu TypeScript không?
2. **RQ-ARCH-01 (Bảo toàn 60 FPS UI - Offloading Architecture):** Tại sao việc chuyển thuật toán tìm kiếm Minimax/Alpha-Beta sang WebAssembly chạy trên Web Worker là bắt buộc để triệt tiêu hiện tượng đứng hình (frame drop) trên trình duyệt?

Thực nghiệm này cài đặt **chính xác cùng một cấu trúc dữ liệu** (bàn cờ $15 \times 15$ phẳng, cùng hàm sinh ô ứng viên bán kính $r=2$, cùng trọng số đánh giá hình thế 7 mẫu Caro, cùng hàm cắt tỉa Alpha-Beta) trên cả hai ngôn ngữ để thu thập dữ liệu so sánh sòng phẳng (Apples-to-Apples).

---

## 2. BIỂU ĐỒ BẰNG CHỨNG THỰC NGHIỆM (300 DPI)

![Biểu đồ so sánh hiệu năng Rust vs TypeScript](../assets/charts/rust_vs_ts_performance.png)

*Hình 1: Ba bảng phân tích hiệu năng: (1) Thời gian tính toán theo độ sâu thang log kèm ngưỡng giật lag 16.6ms, (2) Thông lượng duyệt Node (kNodes/giây), (3) Hệ số tăng tốc vượt trội của Rust.*

---

## 3. SỐ LIỆU ĐO ĐẠC THỰC NGHIỆM (RAW BENCHMARK DATA)

Dưới đây là bảng số liệu trung bình đo đạc trên thế cờ trung cuộc tiêu chuẩn (*Midgame Fixture* — 8 quân cờ trên bàn):

| Độ sâu ($d$) | Thuật toán | Số Node duyệt ($N$) | Số lần Cắt tỉa (Cutoffs) | Điểm số đánh giá | Thời gian thực thi ($T$) | Thông lượng (kNodes/s) | Hệ số tăng tốc (Speedup) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **$d = 1$** | **Rust** | **45** | **0** | **99,990** | **0.042 ms** | **1,066.7 k** | **$14.4\times$** |
| $d = 1$ | TypeScript | 45 | 0 | 99,990 | 0.606 ms | 74.3 k | $1.0\times$ (Gốc) |
| **$d = 2$** | **Rust** | **609** | **39** | **19,990** | **0.359 ms** | **1,696.3 k** | **$16.1\times$** |
| $d = 2$ | TypeScript | 609 | 39 | 19,990 | 5.764 ms | 105.7 k | $1.0\times$ (Gốc) |
| **$d = 3$** | **Rust** | **16,184** | **454** | **9,999,997** | **8.873 ms** | **1,824.1 k** | **$17.3\times$** |
| $d = 3$ | TypeScript | 16,184 | 454 | 9,999,997 | 153.097 ms | 105.7 k | $1.0\times$ (Gốc) |
| **$d = 4$** | **Rust** | **496,790** | **16,350** | **9,999,997** | **280.090 ms** | **1,773.7 k** | **$16.9\times$** |
| $d = 4$ | TypeScript | 496,790 | 16,350 | 9,999,997 | 4,728.604 ms | 105.1 k | $1.0\times$ (Gốc) |

---

## 4. PHÂN TÍCH KHOA HỌC & KẾT LUẬN

### 4.1. Xác nhận Tính Tương Đương Ngữ Nghĩa Tuyệt Đối (Zero Semantic Divergence)
- Tại mọi độ sâu từ $d = 1$ đến $d = 4$:
  $$\text{Nodes}_{\text{Rust}} \equiv \text{Nodes}_{\text{TS}} = 496,790$$
  $$\text{Cutoffs}_{\text{Rust}} \equiv \text{Cutoffs}_{\text{TS}} = 16,350$$
  $$\text{Score}_{\text{Rust}} \equiv \text{Score}_{\text{TS}} = 9,999,997$$
- **Kết luận:** Động cơ Rust và TypeScript hoàn toàn tương đương toán học. Sai khác về thời gian thực thi là **thuần túy đến từ bản chất cơ chế thực thi ngôn ngữ và tối ưu bộ nhớ**, không bị nhiễu bởi thuật toán.

### 4.2. Nguyên nhân Rust vượt trội $16.9\times - 17.3\times$
1. **Memory Layout & Cache Locality**:
   - Rust sử dụng mảng stack contiguous `[i8; 225]`, truyền tham chiếu không cấp phát heap trong quá trình đệ quy `value()`. Dữ liệu luôn nằm trọn trong L1/L2 Cache của CPU.
   - TypeScript (dù dùng TypedArray `Int8Array`) vẫn chịu chi phí điều phối object wrapper của V8 engine và kiểm tra ranh giới runtime.
2. **Zero-Cost Abstractions & Inline**:
   - Trình biên dịch `rustc` kết hợp LLVM tối ưu hóa mức `-O3 / opt-level = "z" / lto = true`, thực hiện inline toàn bộ các hàm kiểm tra hướng `in_bounds`, giải phẳng vòng lặp quét 4 trục `DIRECTIONS`.
3. **Triệt tiêu Garbage Collection (GC)**:
   - Trong quá trình duyệt gần 500,000 node ở $d=4$, Rust không cấp phát bất kỳ byte bộ nhớ heap nào (Zero Allocation).
   - TypeScript sinh ra các token hoàn tác `{ prev_to_move, prev_last_move }` và mảng ô ứng viên động, kích hoạt Garbage Collector của V8 chạy xen kẽ làm gián đoạn luồng CPU.

### 4.3. Minh Chứng Định Lượng Cho Kiến Trúc Web Worker (RQ-ARCH-01)
- Trên màn hình tần số quét 60Hz, thời gian hiển thị 1 frame là:
  $$\Delta t_{\text{budget}} = \frac{1000\text{ ms}}{60} \approx 16.67\text{ ms}$$
- **Nếu chạy trên Main Thread bằng TypeScript:**
  - Ở $d = 3$: Tốn $153.1\text{ ms} \approx 9.2\text{ frames}$ bị rớt (Lag nhìn thấy rõ).
  - Ở $d = 4$: Tốn $4,728.6\text{ ms} \approx 4.73\text{ giây}$! Trình duyệt bị đóng băng hoàn toàn (Unresponsive Script Warning), người dùng không thể bấm quân cờ hay tương tác.
- **Nếu dùng Rust WebAssembly trên Web Worker:**
  - Thuật toán chạy ngầm ở luồng riêng biệt, không chiếm dụng tài nguyên của luồng UI.
  - Tốc độ vượt trội $280\text{ ms}$ ở $d=4$ giúp bot phản hồi gần như tức thì trong khi giao diện người dùng vẫn duy trì **vững chắc 60 FPS**, các hiệu ứng âm thanh và hoạt ảnh đặt cờ không bị giật lag.
