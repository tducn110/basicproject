<!-- trustmebro -->
# Layer Layout — State & Effect Coordinators (`src/features/caro/hooks`)

Bản đồ kiến trúc tầng Hooks điều phối: cầu nối trung chuyển giữa Domain Simulation và UI Presentation, thực thi triệt để nguyên tắc đơn nhiệm của State (State Single-Responsibility Invariant).

Last updated: 2026-10-19.

## 1. Overview & Architectural Role

- **Phân tầng kiến trúc**: **Trung chuyển Layer (Controller / Hook / Mediator)**.
- **Pipeline Stage**: `EVENT <-> STATE -> SIDE EFFECT`.
- **Trách nhiệm**: Quản lý vòng đời state, dispatch actions, điều phối Web Audio, và ủy quyền tác vụ AI sang Web Worker.

---

## 2. File Responsibilities & Hooks Mapping

| Hook | File Path | Mục tiêu (Goal) | Vòng đời (Lifecycle) | Trách nhiệm chính |
| :--- | :--- | :--- | :--- | :--- |
| **`useCaroGame`** | [`useCaroGame.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useCaroGame.ts) | Authoritative Game State | Trọn vẹn ván cờ (Reset khi New Game) | Điều phối state ván cờ qua `useReducer` thuần khiết (`board`, `currentPlayer`, `winner`, `isDraw`, `history`), dispatch `PLACE_MOVE`, `RESET` |
| **`useGameTimer`** | [`useGameTimer.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useGameTimer.ts) | Match Elapsed Time | Theo giây (Tick 1000ms, pause khi Game Over) | Quản lý độc lập số giây trận đấu (`elapsedSeconds`, `isRunning`), không bao giờ gây re-render bàn cờ `BoardGrid` |
| **`useGameAudio`** | [`useGameAudio.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useGameAudio.ts) | Audio Event Dispatching | Theo phiên người dùng | Quản lý trạng thái bật/tắt âm thanh (`isMuted`), bắt sự kiện ván đấu để trigger Web Audio SFX (đặt cờ, thắng, hòa) |
| **`useWasmBot`** | [`useWasmBot.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useWasmBot.ts) | AI Worker Coordination | Vòng đời Worker nền tảng | Khởi tạo Worker, gửi thông điệp yêu cầu tính nước cờ cho Rust WASM, nhận kết quả và đo lường độ trễ (latency telemetry) |
| **`useScoreTracker`** | [`useScoreTracker.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useScoreTracker.ts) | Persistent Match Scores | Lưu trữ bền vững (`localStorage`) | Tự động đồng bộ số ván thắng/hòa của Người chơi 1, Người chơi 2 và AI Bot |

---

## 3. State Single-Responsibility Invariants

1. **State Isolation**: `GameState` (luật cờ) và `TimerState` (thời gian) tách rời thành hai hooks riêng biệt. Bàn cờ chỉ re-render khi có nước đi mới, không re-render mỗi giây theo timer.
2. **Deterministic Reducer**: Mọi biến đổi trạng thái bàn cờ chỉ được diễn ra thông qua `caroReducer`, triệt tiêu hoàn toàn rủi ro race condition và stale closures.
3. **No Direct DOM Mutation**: Các hooks không trực tiếp thao tác DOM; mọi phản hồi được thông qua React state và custom events.
