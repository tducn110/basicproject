<!-- trustmebro -->
# Week 5 Layout — Minimax Algorithm & Game Tree Search (`docs/Week5`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 5: khung thuật toán Minimax đệ quy, xây dựng cây trò chơi (Game Tree), và áp dụng kỹ thuật giới hạn độ sâu tìm kiếm ($d = 1 \dots 4$).

Last updated: 2026-10-19.

## 1. Overview & Research Scope

- **Giai đoạn**: **Phase 4 / Tuần 5 (Kế hoạch tiếp theo theo ROADMAP)**.
- **Trạng thái**: `PLANNING / OPEN` (Các tệp chuyên đề đóng vai trò là khung nghiên cứu đã quy hoạch).
- **Mục tiêu nghiên cứu**:
  1. Cài đặt thuật toán Minimax đệ quy hai người chơi luân phiên (Max: AI, Min: Đối thủ).
  2. Đo đạc thực nghiệm sự bùng nổ không gian tìm kiếm (Combinatorial Explosion) theo độ sâu $d$ với công thức $N \approx b^d$.
  3. Đánh giá tính khả thi và ngưỡng giới hạn độ sâu thực tế trên bàn cờ $15 \times 15$.

---

## 2. Research Files & Planned Modules

| File | Phân loại | Trạng thái | Nội dung nghiên cứu theo kế hoạch |
| :--- | :--- | :--- | :--- |
| [`Nghiên cứu và triển khai Minimax.md`](file:///home/pro/Downloads/basicproject/docs/Week5/Nghi%C3%AAn%20c%E1%BB%A9u%20v%C3%A0%20tri%E1%BB%83n%20khai%20Minimax.md) | **Chuyên đề lý thuyết** | `PENDING / STUB` | Cơ sở toán học của thuật toán Minimax (Game Theory, Zero-Sum, Perfect Information) và mã giả thuật toán đệ quy |
| [`Xây Dựng GAME TREE.md`](file:///home/pro/Downloads/basicproject/docs/Week5/X%C3%A2y%20D%E1%BB%B1ng%20GAME%20TREE.md) | **Chuyên đề cấu trúc dữ liệu** | `PENDING / STUB` | Mô hình biểu diễn cây trò chơi (Game Tree), phân cấp nút gốc, nút trung gian và nút lá (Terminal/Evaluation Nodes) |
| [`Áp Dụng giới hạn độ sâu tìm kiếm.md`](file:///home/pro/Downloads/basicproject/docs/Week5/%C3%81p%20D%E1%BB%A5ng%20gi%E1%BB%9Bi%20h%E1%BA%A1n%20%C4%91%E1%BB%99%20s%C3%A2u%20t%C3%ACm%20ki%E1%BA%BFm.md) | **Chuyên đề tối ưu** | `PENDING / STUB` | Kỹ thuật chặn độ sâu (Depth-Limited Search), áp dụng hàm lượng giá tĩnh Heuristic tại độ sâu $d_{\max}$ thay cho nút tận cùng |
| [`Kiểm thử thuật toán MINIMAX.md`](file:///home/pro/Downloads/basicproject/docs/Week5/Ki%E1%BB%83m%20th%E1%BB%AD%20thu%E1%BA%ADt%20to%C3%A1n%20MINIMAX.md) | **Chuyên đề thực nghiệm** | `PENDING / STUB` | Bộ ca kiểm thử tính đúng đắn: thế cờ sát cuộc 1 nước, chặn nước thắng của đối thủ, và đo đạc số node duyệt |

---

## 3. Dependent Roadmap Gates

- Kế hoạch thực hiện: Triển khai theo các tiêu chí nghiệm thu tại `ROADMAP.md` (Phase 4).
- Bộ dữ liệu cơ sở: Dựa trên Core Game Engine (`Week2/`) và hàm lượng giá Heuristic (`Week4/`).
