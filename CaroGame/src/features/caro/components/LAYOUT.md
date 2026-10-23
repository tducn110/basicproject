<!-- trustmebro -->
# Layer Layout — Presentation Components (`src/features/caro/components`)

Bản đồ kiến trúc tầng giao diện hiển thị: 9 visual components độc lập, phân rã đơn nhiệm, hoàn toàn thụ động (dumb components), tối ưu cấu trúc DOM đơn và responsive 4 cấp.

Last updated: 2026-10-19.

## 1. Overview & Architectural Role

- **Phân tầng kiến trúc**: **Presentation Layer (Pure Views & UI Widgets)**.
- **Pipeline Stage**: `OUTPUT / INPUT` (Hiển thị dữ liệu từ state và nhận sự kiện người dùng chuyển tiếp cho hooks).
- **Trách nhiệm**: Render bàn cờ giấy 15×15, quân cờ SVG sắc nét, thẻ người chơi desktop, thanh VS mobile, bảng lịch sử và banner thắng cuộc.

---

## 2. Component Hierarchy & Responsibilities

| Component | File Path | Pipeline Stage | Phân loại | Trách nhiệm chính |
| :--- | :--- | :--- | :--- | :--- |
| **`BoardGrid`** | [`BoardGrid.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/BoardGrid.tsx) | `OUTPUT / INPUT` | Container View | Bàn cờ CSS Grid 15×15 (Single DOM Instance 225 cells), áp dụng tỷ lệ co giãn thông minh theo viewport (`min(calc(...))`) |
| **`BoardCell`** | [`BoardCell.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/BoardCell.tsx) | `OUTPUT / INPUT` | Atomic View | Nút ô cờ giấy, hiển thị quân cờ hoặc preview hover, highlight đường 5 quân thắng cuộc |
| **`Piece`** | [`Piece.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/Piece.tsx) | `OUTPUT` | Atomic Graphic | Vẽ ký hiệu X và O chuẩn hóa bằng vector SVG, tô màu theo theme token `--x-color` và `--o-color` |
| **`PlayerCard`** | [`PlayerCard.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/PlayerCard.tsx) | `OUTPUT` | HUD Component | Thẻ người chơi 1 & 2 trên desktop, hiển thị lượt cờ active, avatar quân cờ và số nước đã đánh |
| **`PlayerBar`** | [`PlayerBar.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/PlayerBar.tsx) | `OUTPUT` | Mobile HUD | Thanh VS ngang nhỏ gọn tối ưu cho màn hình cảm ứng di động và máy tính bảng |
| **`WinBanner`** | [`WinBanner.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/WinBanner.tsx) | `OUTPUT / INPUT` | Modal / Overlay | Thông báo kết quả chiến thắng hoặc hòa cờ, chứa nút "Chơi lại ván này" và "Ván mới" |
| **`GameInfo`** | [`GameInfo.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/GameInfo.tsx) | `OUTPUT` | Panel View | Khung thông số ván cờ: số nước đi, đồng hồ thời gian (nhận từ `useGameTimer`), và danh sách lịch sử nước đi `MoveHistory` đồng tổ chức |
| **`GameActions`** | [`GameActions.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/GameActions.tsx) | `INPUT` | Controls | Nút thao tác nhanh dưới chân bàn cờ: "Ván mới" và "Chơi lại" |
| **`ModeSelector`** | [`ModeSelector.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/ModeSelector.tsx) | `INPUT` | Controls | Bộ chuyển đổi chế độ chơi: PvP (Người vs Người) và PvE (Người vs Máy Rust WASM: Dễ / Vừa / Khó) |
| **`index.ts`** | [`index.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/index.ts) | `INTERFACE` | Barrel Export | Tập trung xuất khẩu toàn bộ components ra ngoài |

---

## 3. UI Invariants & Layout Contracts

1. **Single DOM Tree Rule**: Tuyệt đối không nhân đôi `BoardGrid` giữa màn hình mobile và desktop. Bàn cờ chỉ mount đúng 1 lần duy nhất trong DOM.
2. **Pure Presentational Contract**: Các components không được chứa logic kiểm tra thắng hay gọi trực tiếp Web Audio API; mọi tương tác phải gửi lên qua event props (`onCellClick`, `onNewGame`, v.v.).
3. **Touch Action Manipulation**: Tất cả các ô cờ trên mobile đều có thuộc tính `touch-action: manipulation` để loại bỏ độ trễ 300ms của trình duyệt.
