---
title: "Đo lường Thời gian Tìm kiếm (Search Time) và Tốc độ NPS"
week: 6
tags:
  - tuan-6
  - search-time
  - performance-now
  - nps
  - benchmarking
---

# ⏱️ ĐO LƯỜNG THỜI GIAN TÌM KIẾM (SEARCH TIME) VÀ TỐC ĐỘ NPS

Đo lường thời gian xử lý là thước đo trực tiếp nhất về trải nghiệm người dùng (UX) khi tương tác với AI Bot trên trình duyệt Web.

---

## 1. KỸ THUẬT ĐO ĐỘ CHÍNH XÁC CAO VỚI `performance.now()`

Trong JavaScript trình duyệt, `Date.now()` chỉ cung cấp độ phân giải mili-giây nguyên và có thể bị trôi bởi xung nhịp hệ thống. Ta sử dụng chuẩn **High Resolution Time API**:

```typescript
const startTime = performance.now();

// Thực thi thuật toán tìm kiếm nước đi
const bestMove = bot.selectMove(board, player);

const endTime = performance.now();
const searchTimeMs = endTime - startTime;

// Tính toán tốc độ xử lý: Số nút mỗi giây (Nodes Per Second - NPS)
const nps = Math.round((bot.nodesVisited / (searchTimeMs / 1000)));
```

---

## 2. Ý NGHĨA CỦA CHỈ SỐ NPS (NODES PER SECOND)

* **NPS** đo lường sức mạnh tính toán thuần túy của Engine và bộ đánh giá Heuristic trên phần cứng của người dùng:
  * Trong JavaScript V8 Engine không tối ưu (cấp phát object liên tục): $\approx 15,000 - 30,000 \text{ NPS}$.
  * Sau khi tối ưu hóa in-place mutation & mảng số nguyên: $\approx 80,000 - 250,000 \text{ NPS}$.
* Nếu tốc độ đạt $150,000 \text{ NPS}$, một lượt tìm kiếm duyệt $15,000$ nút sẽ chỉ mất đúng $100 \text{ ms}$, hoàn toàn không gây bất kỳ hiện tượng đứng hình (UI Freezing) nào cho người dùng.
