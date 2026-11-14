---
title: "Bảng Thông số Thống kê Thuật toán (Algorithm Statistics HUD)"
week: 8
tags:
  - tuan-8
  - dashboard
  - ui-hud
  - telemetry
  - performance-monitoring
---

# 📈 BẢNG THÔNG SỐ THỐNG KÊ THUẬT TOÁN (ALGORITHM STATISTICS HUD)

Để phục vụ mục tiêu học thuật, nghiên cứu và trình diễn trong video demo theo yêu cầu của Đề cương đồ án, hệ thống cung cấp bảng điều khiển đo lường thời gian thực (Real-time HUD).

---

## 1. GIAO DIỆN HIỂN THỊ CÁC THÔNG SỐ (UI TELEMETRY MOCKUP)

```text
+-------------------------------------------------------------+
|  📊 THÔNG SỐ THUẬT TOÁN AI (REAL-TIME TELEMETRY)            |
+-------------------------------------------------------------+
|  Cấp độ Bot:           [ MASTER (Alpha-Beta + ID + TT) ]    |
|  Độ sâu tìm kiếm:      [ Tầng 6 (Depth 6 reached) ]         |
|  Thời gian xử lý:      [ 124.5 ms ]                         |
|  Số nút đã duyệt:      [ 4,520 nodes ]                      |
|  Số nút bị cắt tỉa:    [ 68,400 nodes ]                     |
|  Tỷ lệ cắt tỉa:        [ 93.8% (Cực kỳ tối ưu) ]           |
|  Tốc độ xử lý:         [ 142,000 nodes/giây (NPS) ]         |
|  Tỷ lệ trúng Cache TT: [ 38.6% (Hit Rate) ]                 |
|  Điểm số lượng giá:    [ +1,450 (Ưu thế nghiêng về Bot) ]   |
+-------------------------------------------------------------+
```

---

## 2. HIỆN THỰC HÓA GIAO DIỆN REACT / HTML COMPONENT

```html
<div class="telemetry-panel card">
  <h3 class="panel-title">⚡ Thống Kê Thuật Toán</h3>
  
  <div class="metric-grid">
    <div class="metric-box">
      <span class="label">Thời gian:</span>
      <span class="value" id="hudSearchTime">0 ms</span>
    </div>
    <div class="metric-box">
      <span class="label">Độ sâu đạt được:</span>
      <span class="value" id="hudDepth">0</span>
    </div>
    <div class="metric-box">
      <span class="label">Nút đã duyệt:</span>
      <span class="value" id="hudNodesVisited">0</span>
    </div>
    <div class="metric-box">
      <span class="label">Nút bị cắt:</span>
      <span class="value" id="hudNodesPruned">0</span>
    </div>
    <div class="metric-box">
      <span class="label">Tốc độ NPS:</span>
      <span class="value" id="hudNPS">0/s</span>
    </div>
    <div class="metric-box">
      <span class="label">TT Cache Hit:</span>
      <span class="value" id="hudCacheHit">0%</span>
    </div>
  </div>
</div>
```
*(Bảng thông số này sẽ tự động cập nhật ngay sau mỗi nước đi của Bot thông qua cơ chế Observer Pattern).*
