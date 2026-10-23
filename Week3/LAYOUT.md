<!-- trustmebro -->
# Week 3 Layout — UI Architecture, State Decoupling & Audio (`docs/Week3`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 3: phân rã kiến trúc giao diện người dùng 3 lớp, chuẩn hóa quản lý trạng thái React 19 (`useReducer`), loại bỏ DOM thừa, và tích hợp Web Audio API.

Last updated: 2026-10-19.

## 1. Overview & Engineering Objectives

- **Giai đoạn**: **Phase 6 / Tuần 3 (Hoàn thành phần UI & Audio)**.
- **Mục tiêu**:
  1. Phân rã file nguyên khối monolithic `App.tsx` (từ 1079 dòng xuống 5 dòng), áp dụng cấu trúc 3 tầng: Implement, Trung chuyển, Presentation.
  2. Triệt tiêu 100% stale closures bằng `useReducer` thuần khiết, phân tách độc lập `TimerState` khỏi `GameState`.
  3. Tối ưu hóa cấu trúc Single DOM Tree (giảm 50% số nút DOM từ 450 xuống 225 ô) và responsive 4 cấp.
  4. Xây dựng bộ tổng hợp âm thanh Web Audio API Synthesizer với Master Bus Limiter chống méo tiếng.

---

## 2. File Responsibilities & Artifacts

| File / Thư mục | Phân loại | Trách nhiệm học thuật |
| :--- | :--- | :--- |
| [`Tuan 3.md`](file:///home/pro/Downloads/basicproject/docs/Week3/Tuan%203.md) | **Canonical Research Doc** | Báo cáo chi tiết Tuần 3: Quá trình phân rã Git provenance, sơ đồ kiến trúc dữ liệu, so sánh re-render trước và sau refactor, kỹ thuật tổng hợp âm thanh Web Audio API |
| [`assets/ui_architecture_flow.png`](file:///home/pro/Downloads/basicproject/docs/Week3/assets/ui_architecture_flow.png) | **Visual Evidence** | Sơ đồ Pipeline dữ liệu và phân rã State (sinh bởi `scripts/generate_week3_diagrams.py`) |
| [`assets/component_hierarchy.png`](file:///home/pro/Downloads/basicproject/docs/Week3/assets/component_hierarchy.png) | **Visual Evidence** | Sơ đồ phân cấp Component và ranh giới 3 lớp kiến trúc |

---

## 3. Linked Source Code Evidence

- Page Shell: [`CaroGame/src/features/caro/CaroGamePage.tsx`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/CaroGamePage.tsx)
- Game Hook (`useReducer`): [`CaroGame/src/features/caro/hooks/useCaroGame.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useCaroGame.ts)
- Timer Hook: [`CaroGame/src/features/caro/hooks/useGameTimer.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/hooks/useGameTimer.ts)
- Audio Synthesizer: [`CaroGame/src/features/caro/audio/soundManager.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/audio/soundManager.ts)
- Visual Components: [`CaroGame/src/features/caro/components/`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/components/)
