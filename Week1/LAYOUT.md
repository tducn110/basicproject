<!-- trustmebro -->
# Week 1 Layout — Research Foundation, Rules & State Space (`docs/Week1`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 1: xác lập nền tảng đề cương, đặc tả luật chơi Gomoku/Caro, và mô hình hóa không gian trạng thái toán học.

Last updated: 2026-10-19.

## 1. Overview & Research Objectives

- **Giai đoạn**: **Phase 1 / Tuần 1 (100% Hoàn thành)**.
- **Mục tiêu**:
  1. Hoàn thiện đề cương nghiên cứu và khung làm việc học thuật theo chuẩn VNUK.
  2. Xác lập định nghĩa luật chơi chính thức (Gomoku RIF vs Caro Việt Nam).
  3. Mô hình toán học không gian trạng thái bàn cờ $15 \times 15$ ($|\mathcal{S}| \le 3^{225} \approx 10^{107}$) và chứng minh tính bất khả thi của duyệt cạn toàn bộ cây trò chơi.

---

## 2. File Responsibilities & Artifacts

| File | Phân loại | Trách nhiệm học thuật |
| :--- | :--- | :--- |
| [`Tuần 1.md`](file:///home/pro/Downloads/basicproject/docs/Week1/Tu%E1%BA%A7n%201.md) | **Canonical Research Doc** | Báo cáo học thuật chính thức Tuần 1: Research Objectives, 5 Research Questions, Literature Review (Allis 1994, RIF Gomoku), định nghĩa bộ ngũ $\mathcal{G}$, và bảng thuật ngữ chuẩn |
| [`ĐỀ CƯƠNG ĐỒ ÁN CƠ SỞ.pdf`](file:///home/pro/Downloads/basicproject/docs/Week1/%C4%90%E1%BB%80%20C%C6%AF%C6%A1NG%20%C4%90%E1%BB%92%20%C3%81N%20C%C6%A0%20S%E1%BB%9E.pdf) | **Official Outline** | Đề cương đồ án cơ sở chính thức được phê duyệt |
| `mermaid-diagram*.png` | **Visual Evidence** | Sơ đồ biểu diễn cấu trúc trò chơi và luồng phân tích trạng thái |

---

## 3. Research Questions Addressed

- **RQ-W1-1**: Rule profile nào được áp dụng và điều kiện thắng được định nghĩa hình thức ra sao?
- **RQ-W1-2**: State của game cần chứa những thông tin gì để phục vụ cả gameplay và thuật toán tìm kiếm?
- **RQ-W1-3**: Tại sao tìm kiếm vét cạn toàn bộ cây trò chơi là bất khả thi trên bàn $15 \times 15$?
- **RQ-W1-4**: Các thuật toán nào nằm trong phạm vi nghiên cứu chính thức và các chỉ số nào được dùng để đánh giá?
- **RQ-W1-5**: Các nghiên cứu trước đây về Gomoku chỉ ra vai trò của tri thức đặc thù lĩnh vực (domain-specific knowledge) như thế nào?
