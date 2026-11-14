---
title: "Kỹ thuật Hiển thị Bàn cờ và Tương tác Trực quan"
week: 3
tags:
  - tuan-3
  - board-rendering
  - css-grid
  - highlight
  - animations
---

# 🎨 KỸ THUẬT HIỂN THỊ BÀN CỜ VÀ TƯƠNG TÁC TRỰC QUAN

Tài liệu này chi tiết hóa phương pháp render bàn cờ Caro bằng CSS Grid hiện đại, kỹ thuật xử lý sự kiện cảm ứng/click và các hiệu ứng phản hồi thị giác (Visual Feedback).

---

## 1. PHƯƠNG PHÁP RENDER BÀN CỜ BẰNG CSS GRID

Sử dụng CSS Grid động cho phép bàn cờ tự động thích ứng với bất kỳ kích thước $N \times N$ nào ($10 \times 10$, $15 \times 15$):

```css
.board-grid {
  display: grid;
  grid-template-columns: repeat(var(--board-size, 10), 1fr);
  grid-template-rows: repeat(var(--board-size, 10), 1fr);
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  background-color: #f3e5ab; /* Tông màu gỗ sáng ấm áp */
  border: 2px solid #8b5a2b;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
  user-select: none;
}

.board-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #c8a165;
  border-bottom: 1px solid #c8a165;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.board-cell:hover:not(.occupied) {
  background-color: rgba(0, 0, 0, 0.05);
}
```

---

## 2. HIỆU ỨNG VÀ HOẠT HỌA QUÂN CỜ (PIECE ANIMATIONS)

Mỗi quân cờ khi được đánh xuống sẽ có hiệu ứng phóng to nhẹ nhàng (Scale-In Animation) để tạo cảm giác cơ học chân thực:

```css
.piece {
  width: 75%;
  height: 75%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.5rem;
  animation: piecePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes piecePop {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.piece.x {
  color: #d90429; /* Đỏ sắc nét cho X */
}

.piece.o {
  color: #0077b6; /* Xanh đại dương cho O */
}
```

---

## 3. ĐÁNH DẤU NƯỚC ĐI GẦN NHẤT (LAST MOVE INDICATOR)

Để người chơi không bị hoa mắt trên bàn cờ $10 \times 10$ hoặc $15 \times 15$ với hàng chục quân cờ, ô vừa đánh xong luôn có một dấu chấm tròn phát sáng hoặc khung viền vàng nổi bật:

```css
.board-cell.last-move::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffb703;
  box-shadow: 0 0 6px #ffb703;
  pointer-events: none;
}
```

---

## 4. HIGHLIGHT ĐƯỜNG THẮNG 5 QUÂN (WINNING LINE)

Khi điều kiện thắng được kích hoạt, 5 ô cờ thuộc đường thắng sẽ lập tức đổi màu nền sang vàng kim rực rỡ và phát hiệu ứng nhấp nháy ăn mừng:

```css
.board-cell.winning-cell {
  background-color: #ffe066 !important;
  animation: pulseGlow 1.5s infinite alternate;
}

@keyframes pulseGlow {
  0% { box-shadow: inset 0 0 8px rgba(255, 183, 3, 0.8); }
  100% { box-shadow: inset 0 0 20px rgba(251, 133, 0, 1); }
}
```

---

## 5. TỐI ƯU HÓA EVENT DELEGATION

Thay vì gắn $100$ sự kiện `click` riêng lẻ cho từng ô cờ (gây lãng phí bộ nhớ), ta chỉ gắn **1 sự kiện duy nhất** lên thẻ cha `#board`:

```typescript
const boardEl = document.getElementById('board')!;

boardEl.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest('.board-cell') as HTMLElement;
  if (!target) return;

  const row = parseInt(target.dataset.row!, 10);
  const col = parseInt(target.dataset.col!, 10);

  // Gửi lệnh đến Game Engine
  engine.makeMove(row, col);
});
```
