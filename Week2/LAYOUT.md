<!-- trustmebro -->
# Week 2 Layout — Core Game Engine & Correctness Baseline (`docs/Week2`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 2: xây dựng Core Game Engine bằng TypeScript thuần, thuật toán quét tia cục bộ $O(1)$, và bộ 19 test fixtures làm chuẩn kiểm định tính đúng đắn (Oracle Baseline).

Last updated: 2026-10-19.

## 1. Overview & Research Objectives

- **Giai đoạn**: **Phase 2 / Tuần 2 (100% Hoàn thành)**.
- **Mục tiêu**:
  1. Xây dựng mô hình dữ liệu tất định và bất biến trong TypeScript (`Board`, `Cell`, `Move`, `WinResult`).
  2. Cài đặt thuật toán kiểm tra thắng cục bộ (Local Raycasting) quanh `lastMove` trên 4 trục hướng, chứng minh độ phức tạp tính toán đạt $O(1)$ thay vì $O(N^2)$ (giảm 94.5% số phép truy xuất).
  3. Thiết lập bộ kiểm thử 19 assertions làm Correctness Baseline trước khi chuyển giao sang các thuật toán AI phức tạp.

---

## 2. File Responsibilities & Artifacts

| File | Phân loại | Trách nhiệm học thuật |
| :--- | :--- | :--- |
| [`Tuan 2.md`](file:///home/pro/Downloads/basicproject/docs/Week2/Tuan%202.md) | **Canonical Research Doc** | Báo cáo học thuật chính thức Tuần 2 theo chuẩn IMRaD VNUK: 4 Research Questions, công thức độ phức tạp $O(1)$, đặc tả hình thức `checkWinner`, bảng 10 nhóm test fixtures và kết quả chạy 19/19 pass cleanly |

---

## 3. Linked Source Code Evidence

- Mã nguồn bàn cờ và giải thuật quét tia: [`CaroGame/src/features/caro/domain/board.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/board.ts)
- Hằng số hình học và hướng duyệt: [`CaroGame/src/features/caro/domain/constants.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/constants.ts)
- Kiểu dữ liệu nghiệp vụ: [`CaroGame/src/features/caro/domain/types.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/domain/types.ts)
- Re-export shim tương thích ngược: [`CaroGame/src/game.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/game.ts)
