<!-- trustmebro -->
# Week 4 Layout — Pattern Detection & Rule-Based Bot (`docs/Week4`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 4: phân loại 7 mẫu hình thế Caro chuẩn, xây dựng hàm lượng giá Heuristic tĩnh bằng Rust, và thiết lập Bot Rule-Based đối kháng.

Last updated: 2026-10-19.

## 1. Overview & Research Objectives

- **Giai đoạn**: **Phase 3 / Tuần 4 (100% Hoàn thành)**.
- **Mục tiêu**:
  1. Xây dựng thuật toán nhận diện hình thế (Pattern Detection): 5 liên tiếp, 4 mở hai đầu, 4 chặn một đầu, 3 mở, 3 chặn, 2 mở, 2 chặn.
  2. Thiết lập hàm lượng giá Heuristic tĩnh (`EvalWeights`) bằng Rust, đảm bảo nguyên lý Sát cuộc tuyệt đối (`MATE_SCORE = 10,000,000`) và số học nguyên (`i32`).
  3. Cài đặt Candidate Move Generator (bán kính $r \le 2$) giảm 72.4% không gian tìm kiếm.
  4. Thực nghiệm 100 ván đấu đối đầu Bot-vs-Bot (Rule-Based vs Random) kiểm chứng tỷ lệ thắng 100%.

---

## 2. File Responsibilities & Modules

| File | Phân loại | Trách nhiệm học thuật |
| :--- | :--- | :--- |
| [`Tuan 4.md`](file:///home/pro/Downloads/basicproject/docs/Week4/Tuan%204.md) | **Canonical Master Doc** | Báo cáo học thuật chính thức Tuần 4: Tổng hợp kiến trúc, câu hỏi nghiên cứu, kết quả thực nghiệm 100 ván bot battle, đo lường độ trễ < 0.1ms và ngân sách 60 FPS |
| [`Xây dựng Pattern Detection.md`](file:///home/pro/Downloads/basicproject/docs/Week4/X%C3%A2y%20d%E1%BB%B1ng%20Pattern%20Detection.md) | **Chuyên đề chuyên sâu** | Cơ chế quét tia nhận diện 7 mẫu hình thế, giải quyết vấn đề chồng lấn mẫu và các trường hợp biên |
| [`Xây dựng Heuristic Evaluation.md`](file:///home/pro/Downloads/basicproject/docs/Week4/X%C3%A2y%20d%E1%BB%B1ng%20Heuristic%20Evaluation.md) | **Chuyên đề chuyên sâu** | Mô hình toán học hàm lượng giá $f(s, p)$, ma trận trọng số công - thủ, bảo toàn tính đơn điệu điểm số |
| [`Xây dựng Random Bot.md`](file:///home/pro/Downloads/basicproject/docs/Week4/X%C3%A2y%20d%E1%BB%B1ng%20Random%20Bot.md) | **Chuyên đề chuyên sâu** | Cài đặt Random Bot làm baseline so sánh thực nghiệm, cơ chế chọn ngẫu nhiên từ tập nước đi hợp lệ |
| [`Xây dựng Rule-Based Bot.md`](file:///home/pro/Downloads/basicproject/docs/Week4/X%C3%A2y%20d%E1%BB%B1ng%20Rule-Based%20Bot.md) | **Chuyên đề chuyên sâu** | Kiến trúc ra quyết định tham lam (Greedy Policy) kết hợp Candidate Move Generator $r \le 2$ |
| [`assets/`](file:///home/pro/Downloads/basicproject/docs/Week4/assets/) | **Visual Evidence** | Biểu đồ tỷ lệ thắng, độ trễ ra quyết định, sơ đồ luồng quyết định bot và cây phân cấp hình thế |

---

## 3. Linked Source Code Evidence

- Engine Rust: [`CaroGame/engine/src/eval.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/src/eval.rs) và [`CaroGame/engine/src/board.rs`](file:///home/pro/Downloads/basicproject/CaroGame/engine/src/board.rs)
- Dữ liệu thực nghiệm: [`docs/benchmark/results/week4_bot_battle.json`](file:///home/pro/Downloads/basicproject/docs/benchmark/results/week4_bot_battle.json)
