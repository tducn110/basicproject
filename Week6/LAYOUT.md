<!-- trustmebro -->
# Week 6 Layout — Alpha-Beta Pruning & Search Optimization (`docs/Week6`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 6: thuật toán cắt tỉa Alpha-Beta Pruning, phân tích hiệu quả cắt nhánh ($\alpha \ge \beta$), đo đạc số node duyệt/pruned và thời gian tìm kiếm.

Last updated: 2026-10-19.

## 1. Overview & Research Scope

- **Giai đoạn**: **Phase 5 / Tuần 6 (Kế hoạch tiếp theo theo ROADMAP)**.
- **Trạng thái**: `PLANNING / OPEN` (Đã có số liệu tiền trạm từ `docs/BENCHMARK_RUST_VS_TYPESCRIPT.md`).
- **Mục tiêu nghiên cứu**:
  1. Cài đặt thuật toán Alpha-Beta Pruning kết hợp sắp xếp nước đi (Move Ordering).
  2. Đo đạc tỷ lệ cắt tỉa nút (Target: giảm $\ge 50\%$ số node so với Minimax thuần).
  3. Phân tích thời gian tìm kiếm (Search Time Scaling) và kiểm chứng bảo toàn 60 FPS UI.

---

## 2. Research Files & Planned Modules

| File | Phân loại | Trạng thái | Nội dung nghiên cứu theo kế hoạch |
| :--- | :--- | :--- | :--- |
| [`Nghiên cứu Trải Nghiệm Alpha-Beta Pruning.md`](file:///home/pro/Downloads/basicproject/docs/Week6/Nghi%C3%AAn%20c%E1%BB%A9u%20Tr%E1%BA%A3i%20Nghi%E1%BB%87m%20Alpha-Beta%20Pruning.md) | **Chuyên đề lý thuyết** | `PENDING / STUB` | Nguyên lý toán học của cắt tỉa Alpha-Beta ($\alpha$-cutoff và $\beta$-cutoff), điều kiện bất biến không bỏ sót nước đi tối ưu |
| [`so sánh bước đầu với MINIMAX.md`](file:///home/pro/Downloads/basicproject/docs/Week6/so%20s%C3%A1nh%20b%C6%B0%E1%BB%9Bc%20%C4%91%E1%BA%A7u%20v%E1%BB%9Bi%20MINIMAX.md) | **Chuyên đề so sánh** | `PENDING / STUB` | So sánh tính tương đương toán học giữa Minimax và Alpha-Beta (chứng minh cùng cho ra một giá trị lượng giá) |
| [`Đo số Lượng Nodes Visited.md`](file:///home/pro/Downloads/basicproject/docs/Week6/%C4%90o%20s%E1%BB%91%20L%C6%B0%E1%BB%A3ng%20Nodes%20Visited.md) | **Chuyên đề đo đạc** | `PENDING / STUB` | Thống kê số lượng node duyệt $N$ theo từng độ sâu $d=1 \dots 4$ |
| [`Đo số Lượng Nodes prune.md`](file:///home/pro/Downloads/basicproject/docs/Week6/%C4%90o%20s%E1%BB%91%20L%C6%B0%E1%BB%A3ng%20Nodes%20prune.md) | **Chuyên đề đo đạc** | `PENDING / STUB` | Thống kê số nhánh bị cắt tỉa (Cutoffs) và tỷ lệ tiết kiệm không gian |
| [`Đo Search Time.md`](file:///home/pro/Downloads/basicproject/docs/Week6/%C4%90o%20Search%20Time.md) | **Chuyên đề đo đạc** | `PENDING / STUB` | Đo lường thời gian thực thi (ms) và thông lượng duyệt (kNodes/s) trên CPU |

---

## 3. Empirical Preliminary Evidence

Số liệu thực nghiệm sơ bộ đã được thu thập và phân tích tại:
- Báo cáo khoa học: [`docs/BENCHMARK_RUST_VS_TYPESCRIPT.md`](file:///home/pro/Downloads/basicproject/docs/BENCHMARK_RUST_VS_TYPESCRIPT.md)
- Biểu đồ đối đầu: [`docs/assets/charts/rust_vs_ts_performance.png`](file:///home/pro/Downloads/basicproject/docs/assets/charts/rust_vs_ts_performance.png)
- Số liệu JSON: [`docs/benchmark/results/benchmark_data.json`](file:///home/pro/Downloads/basicproject/docs/benchmark/results/benchmark_data.json)
