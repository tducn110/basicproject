---
title: "Tuần 03: Xây Dựng Giao Diện Website & Chế Độ Player vs Player"
week: 3
tags:
  - tuan-3
  - web-ui
  - pixijs
  - react
  - pvp
date: "2026-09-18"
author: "Nguyễn Tâm Đức - 24CSE"
---

# 🖥️ TUẦN 03: TỔNG QUAN XÂY DỰNG GIAO DIỆN WEBSITE & CHẾ ĐỘ PVP

## 🎯 1. MỤC TIÊU TUẦN 3
1. **Thiết kế kiến trúc giao diện Website:** Phân tách rõ ràng giữa lớp hiển thị (React 19, Tailwind CSS) và lớp đồ họa bàn cờ (HTML5 Canvas / PixiJS 7).
2. **Hiển thị bàn cờ tương tác:** Vẽ lưới $15 \times 15$, xử lý sự kiện tương tác (Click / Touch / Hover), hiển thị quân cờ X và O sắc nét trên mọi độ phân giải màn hình.
3. **Chức năng chiến thuật trực quan:** Đánh dấu nước đi vừa đánh (Last Move Indicator) và làm nổi bật chuỗi 5 quân chiến thắng (Winning Line Highlight).
4. **Hiện thực hóa chế độ Player vs Player (PvP):** Chơi đối kháng 2 người trên cùng thiết bị (Local Hotseat), đổi lượt mượt mà, hiển thị đồng hồ và bảng thông báo kết quả.
5. **Quản lý vòng đời ván đấu (Lifecycle):** Triển khai các chức năng New Game, Reset bàn cờ và Hoàn tác nước đi (Undo) an toàn, không rò rỉ bộ nhớ.

---

## 🗺️ 2. SƠ ĐỒ PHÂN LỚP KIẾN TRÚC GIAO DIỆN (UI ARCHITECTURE)

```mermaid
flowchart TD
    subgraph UI_Shell["Tầng Vỏ Giao Diện (React 19 + Tailwind CSS)"]
        Header["Header: Tên đồ án & Chế độ chơi"]
        HUD["Algorithm Statistics HUD: Đồng hồ, Thông số thuật toán"]
        Controls["Control Panel: New Game, Reset, Undo, Cài đặt luật"]
    end

    subgraph Renderer["Tầng Đồ Họa Bàn Cờ (PixiJS 7 / Canvas Grid)"]
        GridLayer["Lớp Lưới Bàn Cờ: 15x15 đường kẻ & Điểm sao (Star Points)"]
        HoverLayer["Lớp Con Trỏ Ảo (Ghost Stone / Hover Preview)"]
        StonesLayer["Lớp Quân Cờ: Sprite X (Đen) & O (Trắng)"]
        HighlightLayer["Lớp Hiệu Ứng: Nước vừa đi & Đường nối 5 quân thắng"]
    end

    subgraph Core_Bridge["Tầng Cầu Nối Bộ Điều Khiển (GameController)"]
        Controller["GameController: Đăng ký lắng nghe sự kiện & Đồng bộ State"]
        Engine["CaroEngine: Quản lý ma trận & Luật thắng thua"]
    end

    UI_Shell -->|"User Actions"| Controller
    Renderer -->|"Pointer Events (x, y)"| Controller
    Controller --> Engine
    Engine -->|"Immutable Snapshot"| Controller
    Controller -->|"Update UI State"| UI_Shell
    Controller -->|"Render Stage"| Renderer
```

---

## 📚 3. TÀI LIỆU CHI TIẾT TRONG TUẦN 3

1. [[01_Kien_Truc_Giao_Dien_Website|01. Kiến trúc giao diện Website (React + PixiJS + Tailwind)]]
2. [[02_Hien_Thi_Ban_Co_Va_Highlight|02. Kỹ thuật hiển thị bàn cờ, Ghost Stone & Winning Highlight]]
3. [[03_Che_Do_Player_vs_Player|03. Xây dựng chế độ hai người chơi (Player vs Player)]]
4. [[04_Lifecycle_New_Game_Reset_Undo|04. Quản lý vòng đời ván cờ (New Game, Reset, Undo)]]
