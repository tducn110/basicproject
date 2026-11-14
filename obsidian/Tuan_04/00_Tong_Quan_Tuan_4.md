---
title: "Tuần 4: Xây dựng Hệ thống Trí tuệ Nhân tạo (AI Bot)"
week: 4
tags:
  - tuan-4
  - artificial-intelligence
  - bot
  - heuristic
  - pattern-detection
---

# 📅 TUẦN 4: XÂY DỰNG HỆ THỐNG TRÍ TUỆ NHÂN TẠO (AI BOT)

Tuần 4 là giai đoạn hoàn thiện đỉnh cao của đồ án, tập trung vào việc nghiên cứu và cài đặt các thuật toán AI Bot đối kháng từ mức độ ngẫu nhiên cơ bản (Random) đến hệ chuyên gia dựa trên luật (Rule-Based) và trí tuệ đánh giá cục diện (Pattern Detection & Heuristic Evaluation).

---

## 🎯 CÁC MỤC TIÊU TRỌNG TÂM CỦA TUẦN 4

1. **Xây dựng Random Bot:**
   - Cài đặt Bot ngẫu nhiên: lấy danh sách các ô trống hợp lệ và chọn ngẫu nhiên đồng đều (Uniform Random Choice).
   - Đóng vai trò là mốc đối chuẩn tối thiểu (Baseline Benchmark) để đánh giá sự vượt trội của các Bot thông minh hơn.
   - Chi tiết: [[Tuan_04/01_Xay_Dung_Random_Bot|01. Xây dựng Random Bot]]

2. **Xây dựng Rule-Based Bot:**
   - Hệ chuyên gia phỏng sinh học dựa trên tập luật ưu tiên chiến thuật (Priority-Based Expert System):
     1. Thắng ngay lập tức nếu có nước tạo chuỗi 5.
     2. Chặn ngay lập tức nếu đối thủ sắp thắng (hàng 4).
     3. Tạo thế bốn mở (Open Four) hoặc đòn kép (Double Threat: 4-3, 3-3).
     4. Chặn thế cờ hiểm của đối thủ (hàng 3 mở).
     5. Phát triển thế cờ lân cận các quân của mình.
   - Chi tiết: [[Tuan_04/02_Xay_Dung_Rule_Based_Bot|02. Xây dựng Rule-Based Bot]]

3. **Xây dựng Pattern Detection (Thuật toán Nhận diện Thế cờ):**
   - Thuật toán quét và nhận diện các mẫu hình chuỗi quân kinh điển trong cờ Caro:
     * `FIVE`: Thắng cuộc (`X X X X X`)
     * `OPEN_FOUR`: Bốn mở 2 đầu (`. X X X X .`)
     * `BLOCKED_FOUR`: Bốn bị chặn 1 đầu (`O X X X X .` hoặc `X X . X X`)
     * `OPEN_THREE`: Ba mở 2 đầu (`. X X X .`)
     * `BLOCKED_THREE`: Ba bị chặn 1 đầu (`O X X X . .`)
     * `OPEN_TWO`: Hai mở (`. . X X . .`)
   - Chi tiết: [[Tuan_04/03_Xay_Dung_Pattern_Detection|03. Xây dựng Pattern Detection]]

4. **Xây dựng Heuristic Evaluation (Hàm Lượng giá Cục diện):**
   - Xây dựng hàm lượng giá toán học:
     $$f(s) = \sum_{p \in \text{Patterns}} \left( w_{\text{attack}}(p) \cdot \text{count}_{\text{my}}(p) - w_{\text{defense}}(p) \cdot \text{count}_{\text{opp}}(p) \right)$$
   - Ma trận trọng số vị trí (Position Evaluation Matrix): Ưu tiên khu vực trung tâm bàn cờ.
   - Chi tiết: [[Tuan_04/04_Xay_Dung_Heuristic_Evaluation|04. Xây dựng Heuristic Evaluation]]

---

## 🧭 TIẾN ĐỘ THỰC HIỆN TUẦN 4

- [x] Hiện thực hóa Random Bot với độ phức tạp $O(1)$ sau khi sinh danh sách ô trống.
- [x] Cài đặt cây quyết định ưu tiên cho Rule-Based Bot.
- [x] Xây dựng bộ parser quét nhận diện mẫu hình (Pattern Matcher) cho cả 4 hướng.
- [x] Thiết lập bảng trọng số điểm công/thủ cho hàm Heuristic.
- [x] Tích hợp AI Bot vào Web UI, bổ sung hiệu ứng giả lập suy nghĩ (Thinking Delay 300ms).
