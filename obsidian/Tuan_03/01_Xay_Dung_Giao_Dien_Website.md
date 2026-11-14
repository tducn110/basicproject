---
title: "Xây dựng Giao diện Website (Web UI Architecture)"
week: 3
tags:
  - tuan-3
  - web-ui
  - layout
  - responsive
  - html-css
---

# 💻 XÂY DỰNG GIAO DIỆN WEBSITE (WEB UI ARCHITECTURE)

Tài liệu này trình bày thiết kế kiến trúc giao diện người dùng (UI/UX), cấu trúc cây DOM và nguyên lý phân tầng giữa giao diện và Game Engine.

---

## 1. SƠ ĐỒ BỐ CỤC GIAO DIỆN (WIREFRAME LAYOUT)

```text
+-----------------------------------------------------------------------+
|  HEADER: [Logo Cờ Caro AI]       [Luật: Chặn 2 đầu v]  [Kích thước: 10x10 v]  |
+-----------------------------------------------------------------------+
|                                  |                                    |
|   KHUNG BÀN CỜ (BOARD CONTAINER)  |   BẢNG ĐIỀU KHIỂN & TRẠNG THÁI     |
|                                  |                                    |
|   +--------------------------+   |   [ THÔNG TIN TRẬN ĐẤU ]           |
|   | .  .  .  .  .  .  .  .   |   |   - Lượt chơi: [ Quân X (Đen) ]    |
|   | .  X  .  .  .  .  .  .   |   |   - Thời gian lượt: 00:25          |
|   | .  .  O  .  .  .  .  .   |   |   - Tổng số nước: 14               |
|   | .  .  .  X  .  .  .  .   |   |                                    |
|   | .  .  .  .  O  .  .  .   |   |   [ BẢNG TỈ SỐ (SCOREBOARD) ]      |
|   | .  .  .  .  .  .  .  .   |   |   Người chơi 1 (X): 2              |
|   +--------------------------+   |   Người chơi 2 (O): 1              |
|                                  |                                    |
|   (Tự động co giãn theo màn hình)|   [ HÀNH ĐỘNG ]                    |
|                                  |   [ 🔄 Ván Mới ]  [ ⏪ Đi Lại ]     |
|                                  |   [ ⚙️ Cài Đặt ]  [ ❌ Đặt Lại ]    |
+-----------------------------------------------------------------------+
|  FOOTER: Gomoku / Caro Engine v1.0.0 - AI Research Project             |
+-----------------------------------------------------------------------+
```

---

## 2. THIẾT KẾ CẤU TRÚC HTML5 VÀ TỔNG THỂ CSS

```html
<div class="app-container">
  <header class="app-header">
    <h1 class="app-title">Caro AI Master</h1>
    <div class="header-controls">
      <select id="ruleSelect" class="select-box">
        <option value="CARO_VIETNAM_BLOCK_2">Luật Caro Việt Nam (Chặn 2 đầu)</option>
        <option value="GOMOKU_FREESTYLE">Luật Gomoku Tự do (Chuẩn)</option>
      </select>
      <select id="sizeSelect" class="select-box">
        <option value="10">Bàn cờ 10x10</option>
        <option value="15">Bàn cờ 15x15</option>
      </select>
    </div>
  </header>

  <main class="game-layout">
    <!-- Khu vực Bàn cờ -->
    <section class="board-wrapper">
      <div id="board" class="board-grid"></div>
    </section>

    <!-- Khu vực Bảng điều khiển -->
    <aside class="sidebar-panel">
      <div class="status-card">
        <div class="turn-indicator" id="turnIndicator">
          <span class="player-badge player-x">Lượt của: Quân X</span>
        </div>
        <div class="timer" id="turnTimer">Thời gian: 30s</div>
      </div>

      <div class="score-card">
        <div class="score-row"><span>Người chơi X:</span> <strong id="scoreX">0</strong></div>
        <div class="score-row"><span>Người chơi O:</span> <strong id="scoreO">0</strong></div>
      </div>

      <div class="action-buttons">
        <button id="btnNewGame" class="btn btn-primary">Ván Mới</button>
        <button id="btnUndo" class="btn btn-secondary">Đi Lại (Undo)</button>
        <button id="btnReset" class="btn btn-danger">Đặt Lại</button>
      </div>
    </aside>
  </main>
</div>
```

---

## 3. THIẾT KẾ RESPONSIVE CHO THIẾT BỊ DI ĐỘNG (MOBILE-FRIENDLY)

* Trên màn hình Desktop ($\ge 768 \text{ px}$): Bố cục chia thành 2 cột ngang (`grid-template-columns: 1fr 320px;`).
* Trên màn hình Điện thoại ($< 768 \text{ px}$): Bố cục chuyển sang 1 cột dọc:
  * Bàn cờ chiếm trọn chiều ngang màn hình với tỷ lệ khung vuông `aspect-ratio: 1 / 1`.
  * Bảng thông tin và các nút bấm được chuyển xuống dưới bàn cờ, giúp người dùng dễ dàng chạm bấm bằng một tay mà không che khuất tầm nhìn bàn cờ.
