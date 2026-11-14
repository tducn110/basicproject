---
title: "Xây dựng Chức năng New Game, Reset và Undo"
week: 3
tags:
  - tuan-3
  - controls
  - new-game
  - reset
  - undo
  - shortcuts
---

# 🔄 XÂY DỰNG CHỨC NĂNG NEW GAME, RESET VÀ UNDO

Tài liệu này quy chuẩn hóa các thao tác điều khiển ván đấu, bảo vệ trải nghiệm người dùng khỏi các thao tác bấm nhầm ngoài ý muốn và tích hợp các phím tắt tiện ích.

---

## 1. PHÂN BIỆT RÕ RÀNG GIỮA "NEW GAME" VÀ "RESET"

Trong thiết kế trò chơi chuyên nghiệp, cần tách biệt rõ 2 khái niệm này:

| Thuộc tính | Ván Mới (New Game) | Đặt lại Toàn bộ (Reset Match) |
| :--- | :--- | :--- |
| **Bàn cờ** | Xóa sạch về rỗng ($0$) | Xóa sạch về rỗng ($0$) |
| **Lịch sử nước đi** | Xóa sạch (`history = []`) | Xóa sạch (`history = []`) |
| **Tỉ số trận đấu (Score)** | **GIỮ NGUYÊN** (Ví dụ: 3 - 2) | **ĐƯA VỀ 0 - 0** |
| **Lượt khai cuộc** | Luân phiên hoặc người thắng ván trước đi | Mặc định luôn là Quân X đi trước |
| **Mục đích** | Tiếp tục series trận đấu nhiều ván | Bắt đầu lại một đối thủ/phiên chơi hoàn toàn mới |

---

## 2. CƠ CHẾ XÁC NHẬN AN TOÀN (CONFIRMATION GUARD)

Nếu người chơi vô tình bấm vào nút "Ván mới" hoặc "Đặt lại" khi ván đấu đang trong giai đoạn căng thẳng, hệ thống sẽ mở hộp thoại xác nhận:

```typescript
function handleNewGameClick(): void {
  const state = engine.getState();
  
  // Nếu ván đấu đang diễn ra và đã có trên 4 nước cờ
  if (state.status === GameStatus.PLAYING && state.moveHistory.length >= 4) {
    const confirmed = window.confirm(
      "Ván cờ đang diễn ra! Bạn có chắc chắn muốn hủy ván này để bắt đầu ván mới?"
    );
    if (!confirmed) return;
  }

  engine.reset();
  renderBoard();
}
```

---

## 3. CHỨC NĂNG HOÀN TÁC (UNDO) VÀ TÍNH ĐỐI XỨNG

```typescript
function handleUndoClick(): void {
  const state = engine.getState();
  if (state.moveHistory.length === 0) return;

  // Nếu đang đánh với Bot AI: Phải rút lại 2 nước (1 của Bot + 1 của Người)
  if (isVsAiMode && state.currentTurn === CellValue.PLAYER_X) {
    engine.undo(); // Undo nước của Bot
    engine.undo(); // Undo nước của Người
  } else {
    // Chế độ 2 người chơi: Rút lại 1 nước gần nhất
    engine.undo();
  }

  renderBoard();
}
```

---

## 4. HỆ THỐNG PHÍM TẮT TIỆN ÍCH (KEYBOARD SHORTCUTS)

Để gia tăng trải nghiệm cho người dùng chuyên nghiệp trên Desktop:

```typescript
document.addEventListener('keydown', (e: KeyboardEvent) => {
  // Ctrl + Z: Hoàn tác nước đi
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    handleUndoClick();
  }
  // Phím N: Bắt đầu ván mới
  if (e.key === 'n' || e.key === 'N') {
    handleNewGameClick();
  }
  // Phím Esc: Đóng các modal thông báo kết quả
  if (e.key === 'Escape') {
    closeAllModals();
  }
});
```
