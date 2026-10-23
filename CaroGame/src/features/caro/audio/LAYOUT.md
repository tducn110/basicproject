<!-- trustmebro -->
# Layer Layout — Web Audio Engine (`src/features/caro/audio`)

Bản đồ kiến trúc tầng tổng hợp âm thanh Web Audio API: sinh âm thanh thủ công bằng toán học (`OscillatorNode`, `GainNode`), trang bị Master Limiter chống méo tiếng, không phụ thuộc file tải ngoài.

Last updated: 2026-10-19.

## 1. Overview & Architectural Role

- **Phân tầng kiến trúc**: **Implement Layer (Web Audio API Synthesizer)**.
- **Pipeline Stage**: `SIDE EFFECT -> FEEDBACK`.
- **Trách nhiệm**: Cung cấp phản hồi thính giác tức thì (zero latency, zero 404 network assets) cho các sự kiện ván cờ theo phong cách giấy cổ điển (Paper Vintage).

---

## 2. File Responsibilities

| File | Phân loại | Pipeline Stage | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| [`soundManager.ts`](file:///home/pro/Downloads/basicproject/CaroGame/src/features/caro/audio/soundManager.ts) | **Audio Synthesizer** | `SIDE EFFECT` | Khởi tạo `AudioContext`, cấu hình Master Bus với `DynamicsCompressorNode` (Brick-Wall Limiter), tổng hợp âm gõ quân cờ gỗ/giấy (`playPieceSound`), âm thắng trận (`playWinSound`), âm hòa cờ (`playDrawSound`), và âm click nút (`playClickSound`) |

---

## 3. Audio Mastering & Mobile Lifecycle Rules

1. **Brick-Wall Limiter (`DynamicsCompressorNode`)**: Đảm bảo tổng mức tín hiệu (threshold = -3dB, ratio = 12:1) không bao giờ bị vỡ tiếng (clipping) khi nhiều âm phát đồng thời.
2. **Gesture Unlock**: Tự động giải phóng trạng thái `suspended` của `AudioContext` ngay sau tương tác chạm đầu tiên trên Safari / iOS WebKit.
3. **Mute Contract**: Tôn trọng cờ `isMuted` ở mức Master Bus, ngắt kết nối output ngay lập tức mà không cần hủy context.
