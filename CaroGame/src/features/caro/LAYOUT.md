<!-- trustmebro -->
# Subsystem Layout — Caro Feature Subsystem (`src/features/caro`)

Bản đồ kiến trúc phân hệ cờ Caro theo phương pháp Domain-Driven Design (DDD): phân tách triệt để giữa logic tính toán nghiệp vụ (Domain), bộ tổng hợp âm thanh (Audio), tầng điều phối trạng thái (Hooks), giao diện hiển thị (Components), và tích hợp WebAssembly AI (WASM).

Last updated: 2026-10-19.

## 1. Overview & Architectural Boundaries

Phân hệ `src/features/caro` chịu trách nhiệm toàn bộ trải nghiệm ván cờ Caro:
- **Presentation Layer (`components/`)**: Hoàn toàn thụ động, nhận props và kích hoạt callbacks; không chứa logic luật cờ hay side-effect.
- **Trung chuyển Layer (`hooks/`)**: Điều phối luồng dữ liệu giữa UI và Domain; thực thi phân rã State Single-Responsibility Invariant.
- **Implement Layer (`domain/`, `audio/`, `wasm/`)**: Quy tắc bàn cờ tất định, bộ tổng hợp âm thanh Web Audio API, và cầu nối Web Worker WebAssembly.

---

## 2. Sub-Modules Directory Mapping

| Thư mục / File | Phân tầng kiến trúc | Pipeline Stage | Trách nhiệm chính | Chi tiết Layout |
| :--- | :--- | :--- | :--- | :--- |
| [`CaroGamePage.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/CaroGamePage.tsx) | **Page Shell** | `OUTPUT / INPUT` | Khung trang tổng thể, orchestrate bố cục 3 cột desktop / 1 cột mobile, gắn kết các hooks và components | N/A (Root component) |
| [`domain/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/LAYOUT.md) | **Implement** | `PROCESS` | Khởi tạo ma trận 15×15, kiểm tra thắng 4 trục hướng $O(1)$, hằng số hình học và định nghĩa kiểu dữ liệu bất biến | [`domain/LAYOUT.md`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/LAYOUT.md) |
| [`hooks/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/LAYOUT.md) | **Trung chuyển** | `EVENT <-> STATE` | `useCaroGame` (Game state useReducer), `useGameTimer` (Timer state), `useGameAudio` (Audio triggers), `useWasmBot` (AI Worker) | [`hooks/LAYOUT.md`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/LAYOUT.md) |
| [`components/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/LAYOUT.md) | **Presentation** | `OUTPUT / INPUT` | 9 visual components: BoardCell, BoardGrid, PlayerCard, PlayerBar, WinBanner, GameInfo, MoveHistory, GameActions, ModeSelector, Piece | [`components/LAYOUT.md`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/LAYOUT.md) |
| [`audio/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/audio/LAYOUT.md) | **Implement / Audio** | `SIDE EFFECT` | Bộ tổng hợp âm thanh Web Audio API: gõ cờ gỗ/giấy, thắng cuộc, hòa cờ, Master Limiter chống méo tiếng | [`audio/LAYOUT.md`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/audio/LAYOUT.md) |
| [`wasm/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/wasm/LAYOUT.md) | **Implement / Worker** | `PROCESS` | Web Worker sandbox (`botWorker.ts`) cách ly tính toán AI nền tảng và gói WASM nhúng (`engine/`) | [`wasm/LAYOUT.md`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/wasm/LAYOUT.md) |

---

## 3. Data Pipeline & Event Flow

```text
User Click / AI Turn (INPUT)
    │
    ▼
CaroGamePage.tsx
    │
    ├──> useCaroGame.ts (EVENT -> STATE)
    │        │
    │        ▼
    │    domain/board.ts (PROCESS: validate move & check 4 axes)
    │        │
    │        ├──> Cập nhật Board & CurrentPlayer (STATE)
    │        └──> Phát tín hiệu âm thanh -> useGameAudio.ts -> soundManager.ts (SIDE EFFECT)
    │
    ├──> useGameTimer.ts (Đo thời gian độc lập mỗi 1000ms, không re-render bàn cờ)
    │
    ├──> useWasmBot.ts (Nếu PvE: dispatch nước cờ sang Web Worker -> Rust WASM AI)
    │
    ▼
components/ (OUTPUT: BoardGrid, PlayerCard, GameInfo render lại với 60 FPS)
```
