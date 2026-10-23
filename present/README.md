# Caro AI Defense & Research Presentation (Landing Page)

Hệ thống Landing Page Báo cáo Kỹ thuật và Bảo vệ Đồ án Cơ sở: **Hành trình từ Tuần 3 đến Tuần 4 — Chuyển dịch Kiến trúc Web UI (Player-vs-Player) sang Đối Kháng WebAssembly (Player-vs-Bot) & Lõi Heuristic Rust**.

---

## 1. Mục Tiêu & Điểm Nhấn Công Nghệ

- **Vị trí thư mục**: Đặt độc lập và đầy đủ tại `Downloads/basicproject/present`.
- **GSAP & Parallax Motion**: Sử dụng `gsap` và `ScrollTrigger` để tạo chiều sâu chuyển động Parallax, hiệu ứng quân cờ 3D lơ lửng, thanh chỉ báo tiến độ đọc động và Timeline chuyển tiếp mượt mà.
- **Biểu thị Toán học LaTeX (KaTeX)**: Kết xuất trực tiếp các công thức không gian trạng thái $|\mathcal{A}(s)| = 225 - m$, hàm lượng giá Heuristic $f(s)$, bán kính Chebyshev $D_\infty \le 2$, và ma trận điểm Mate Dominance ($10^7$).
- **Môi Trường Trực Quan Hóa Bằng Python (Live Pyodide WASM Sandbox)**:
  - Tích hợp trình thông dịch Python 3 trực tiếp ngay trong trình duyệt.
  - Cho phép người xem chạy và tùy biến 4 kịch bản thực nghiệm:
    1. `pattern_scanner.py`: Nhận diện 7 mẫu hình thế Caro theo *Maximal Run Invariant*.
    2. `heuristic_calculator.py`: Lượng giá thế cờ công/thủ và kiểm tra Mate Dominance.
    3. `chebyshev_pruner.py`: Tính toán cắt giảm $72.4\%$ không gian duyệt.
    4. `empirical_analysis.py`: Đo đạc độ trễ so với ngân sách khung hình 60 FPS ($16.67\,\text{ms}$).
- **Bàn Cờ Caro Tương Tác Trực Tiếp (Interactive 15×15 Board)**:
  - Trực tiếp đánh cờ với Rule-Based Bot hoặc Random Bot ngay trong bài thuyết trình.
  - Tùy chọn bật/tắt hiển thị vùng ứng viên Chebyshev (chấm xanh phát sáng) và đồng hồ đo điểm Heuristic tức thời.
- **Web Audio API Synthesizer**: Tự tổng hợp âm thanh gỗ/giấy với Master Limiter (`DynamicsCompressorNode`) chống méo rè (Zero clipping).

---

## 2. Cấu Trúc Báo Cáo Chuyên Sâu

1. **Tổng quan Nền tảng (Phase 1 & 2)**:
   - Đặc tả hình thức luật chơi Freestyle Gomoku ($15 \times 15, k = 5$).
   - Thuật toán Local Raycasting $O(1)$ kiểm tra thắng cuộc quanh `lastMove`.
   - Kiểm thử tự động Vitest đạt $100\%$ tỷ lệ pass.
2. **Tuần 3: Phân rã Giao diện & Tiêu chuẩn Component Hóa**:
   - Khắc phục tệp nguyên khối 1079 dòng mã từ Figma Make, chia tách thành kiến trúc 3 lớp: *Implement* (`domain/`), *Trung chuyển* (`hooks/`), *Presentation* (`components/`), *Shell* (`CaroGamePage.tsx`, `App.tsx` 5 dòng).
   - **State Single-Responsibility Invariant**: Tách độc lập `TimerState` (nhảy mỗi giây) khỏi `GameState`, triệt tiêu hoàn toàn $225$ re-render thừa của bàn cờ (minh họa bằng bộ đếm so sánh trực tiếp).
   - Single Authoritative DOM Tree & bố cục Responsive 4 cấp, triệt tiêu trễ 300ms cảm ứng di động.
3. **Chuyển giao Kiến trúc: Từ Player vs Player sang Player vs Bot**:
   - Thách thức: Thuật toán AI duyệt cây cờ sẽ chặn đứng Main UI Thread nếu chạy đồng bộ.
   - Giải pháp: Biên dịch lõi Rust sang WebAssembly (`gomoku_engine_bg.wasm`), đưa toàn bộ tác vụ tìm kiếm vào Web Worker (`botWorker.ts`).
   - Hook bất đồng bộ `useWasmBot.ts` với cơ chế **Cancellation Token** hủy nước đi lỗi thời khi người chơi bắt đầu ván mới.
   - Khóa tương tác bàn cờ (`isBoardDisabled`) và hiển thị hiệu ứng "AI Đang Suy Nghĩ".
   - Bộ chọn 3 cấp độ khó: Dễ (Depth 1), Vừa (Depth 2), Khó (Depth 4).
4. **Tuần 4: Nhận diện Hình thế & Động cơ Đối kháng Rust**:
   - 7 mẫu hình thế kinh điển: Five, Open Four, Closed Four, Open Three, Closed Three, Open Two, Closed Two.
   - Hàm lượng giá Heuristic lũy thừa và nguyên lý Sát cuộc tuyệt đối ($10^7$).
   - Bộ sinh ô ứng viên bán kính Chebyshev $r \le 2$ cắt giảm $72.39\%$ không gian duyệt.
   - Thực nghiệm đối đầu 100 ván: Thắng tuyệt đối 100/100 ván trước Random Bot, độ trễ $42.24\,\mu\text{s}$ trên Rust.
5. **So sánh Hiệu năng Rust Native vs TypeScript**:
   - Rust nhanh hơn TypeScript từ $17.8\times$ đến $24.3\times$ lần.
   - Thông lượng đạt xấp xỉ 2,000,000 nodes/giây.
6. **Lộ trình Tuần 5 & Tuần 6**:
   - Nghiên cứu thuật toán Minimax và Alpha-Beta Pruning với Zobrist Hashing và Transposition Table.

---

## 3. Hướng Dẫn Khởi Chạy

```bash
cd Downloads/basicproject/present

# 1. Khởi chạy máy chủ phát triển
npm run dev

# 2. Hoặc đóng gói production và xem trước
npm run build
npm run preview
```

Mở trình duyệt tại: `http://localhost:5174` (hoặc port do terminal thông báo).
