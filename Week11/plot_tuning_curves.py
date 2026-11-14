#!/usr/bin/env python3
"""
plot_tuning_curves.py
Week 11: Generates academic-grade charts visualizing:
1. The Bell-shaped Optimization Curve (Đồ thị hình chuông leo đỉnh và tụt dốc của Open 3).
2. The Over-defensive Collapse Curve (Đồ thị tụt dốc khi chỉnh hệ số thủ 10 -> 11 -> 12 -> 13).
3. The Time-vs-Quality Trade-off (Đánh đổi thời gian tính toán để quét sâu hơn/rộng hơn).
"""

import matplotlib.pyplot as plt
import numpy as np

# Set publication style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 5.5), dpi=300)

# -------------------------------------------------------------
# SUBPLOT 1: The Bell-Curve (Open 3 Weight Optimization)
# -------------------------------------------------------------
weights_labels = ['1k', '2k', '3k\n(Base)', '4.5k', '6k', '8k', '10k\n(PEAK)', '20k', '50k', '150k', '500k']
weights_x = np.arange(len(weights_labels))
win_rates_open3 = [50.0, 50.0, 50.0, 66.7, 58.3, 66.7, 75.0, 75.0, 75.0, 50.0, 50.0]

ax1.plot(weights_x, win_rates_open3, color='#2B6CB0', marker='o', linewidth=2.5, markersize=7, label='Tỷ lệ thắng thực nghiệm (%)')
ax1.axhline(50.0, color='#A0AEC0', linestyle='--', linewidth=1.2, label='Mốc cơ sở (Baseline 50%)')

# Annotations
ax1.annotate('ĐỈNH TỐI ƯU CỰC ĐẠI\n(Peak: 75.0%)', 
             xy=(6, 75.0), xytext=(4.5, 83),
             arrowprops=dict(facecolor='#22543D', shrink=0.08, width=1.5, headwidth=6),
             fontweight='bold', color='#22543D', fontsize=9.5)

ax1.annotate('VÙNG TỤT DỐC\n(Ám ảnh mẫu cờ)', 
             xy=(9, 50.0), xytext=(8.0, 62),
             arrowprops=dict(facecolor='#C53030', shrink=0.08, width=1.5, headwidth=6),
             fontweight='bold', color='#C53030', fontsize=9.5)

ax1.fill_between(weights_x[:7], 50, win_rates_open3[:7], color='#48BB78', alpha=0.15, label='Vùng leo dốc (+25%)')
ax1.fill_between(weights_x[6:], 50, win_rates_open3[6:], color='#E53E3E', alpha=0.15, label='Vùng thoái trào (Over-tuning)')

ax1.set_xticks(weights_x)
ax1.set_xticklabels(weights_labels, fontsize=8.5)
ax1.set_ylim(40, 90)
ax1.set_title('1. ĐỒ THỊ HÌNH CHUÔNG (BELL CURVE)\nTinh chỉnh Trọng số Thoáng 3 (W_open_3)', fontsize=11, fontweight='bold', pad=12)
ax1.set_xlabel('Giá trị Trọng số thử nghiệm (W)', fontweight='bold', fontsize=9.5)
ax1.set_ylabel('Tỷ lệ Thắng (%) trên cùng 1 Bot Model', fontweight='bold', fontsize=9.5)
ax1.legend(loc='upper right', fontsize=8.5)

# -------------------------------------------------------------
# SUBPLOT 2: The Over-Defensive Collapse (10 -> 11 -> 12 -> 13)
# -------------------------------------------------------------
ratios = ['10 (beta=1.0)', '11 (beta=1.1)', '12 (beta=1.2)', '13 (beta=1.3)']
ratios_x = np.arange(len(ratios))
win_rates_beta = [72.2, 55.6, 36.1, 36.1]

colors_bars = ['#2B6CB0', '#4299E1', '#E53E3E', '#C53030']
bars = ax2.bar(ratios_x, win_rates_beta, color=colors_bars, width=0.55, edgecolor='#2D3748', linewidth=1)

for bar, rate in zip(bars, win_rates_beta):
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 1.5, f'{rate:.1f}%', ha='center', va='bottom', fontweight='bold', fontsize=9.5)

ax2.axhline(50.0, color='#A0AEC0', linestyle='--', linewidth=1.2)
ax2.annotate('CÂN BẰNG TỐI ƯU\n(Chủ động công/thủ)', 
             xy=(0, 72.2), xytext=(0.3, 80),
             arrowprops=dict(facecolor='#2B6CB0', shrink=0.08, width=1.5, headwidth=6),
             fontweight='bold', color='#2B6CB0', fontsize=9)

ax2.annotate('LIỆT PHÒNG THỦ\n(Mất thế chủ động: -36.1%)', 
             xy=(2, 36.1), xytext=(1.6, 52),
             arrowprops=dict(facecolor='#C53030', shrink=0.08, width=1.5, headwidth=6),
             fontweight='bold', color='#C53030', fontsize=9)

ax2.set_xticks(ratios_x)
ax2.set_xticklabels(ratios, fontsize=8.5)
ax2.set_ylim(20, 90)
ax2.set_title('2. HIỆN TƯỢNG SỤP ĐỔ DO THIÊN LỆCH THỦ\nHiệu chỉnh Hệ số từ 10 sang 12, 13', fontsize=11, fontweight='bold', pad=12)
ax2.set_xlabel('Hệ số Phòng thủ (Tỷ số Công : Thủ)', fontweight='bold', fontsize=9.5)
ax2.set_ylabel('Tỷ lệ Thắng (%) trong 36 Ván Đối Đầu', fontweight='bold', fontsize=9.5)

# -------------------------------------------------------------
# SUBPLOT 3: The Time vs Search Breadth/Depth Trade-off
# -------------------------------------------------------------
# Showing trade-off: Candidate Soft Cap vs Win Rate vs Search Latency
caps_labels = ['Cap 6\n(~15ms)', 'Cap 10\n(~45ms)', 'Cap 14\n(~120ms)', 'Cap 18\n(~310ms)', 'Cap 24\n(~850ms)']
caps_x = np.arange(len(caps_labels))
win_rate_quality = [35.0, 58.0, 75.0, 84.0, 88.0]
time_latency_ms = [15, 45, 120, 310, 850]

color_qual = '#805AD5'
ax3.plot(caps_x, win_rate_quality, color=color_qual, marker='s', linewidth=2.5, markersize=7, label='Chất lượng Nước đi / Tỷ lệ Thắng (%)')
ax3.set_xticks(caps_x)
ax3.set_xticklabels(caps_labels, fontsize=8.5)
ax3.set_ylim(20, 100)
ax3.set_xlabel('Độ Rộng Quét Ứng Viên (Đánh đổi Thời gian)', fontweight='bold', fontsize=9.5)
ax3.set_ylabel('Tỷ lệ Thắng (%)', color=color_qual, fontweight='bold', fontsize=9.5)
ax3.tick_params(axis='y', labelcolor=color_qual)

# Twin axis for latency
ax3_twin = ax3.twinx()
color_time = '#DD6B20'
ax3_twin.plot(caps_x, time_latency_ms, color=color_time, linestyle=':', marker='^', linewidth=2, markersize=6, label='Độ trễ tính toán (ms)')
ax3_twin.set_ylabel('Thời gian quét nốt (mili-giây - ms)', color=color_time, fontweight='bold', fontsize=9.5)
ax3_twin.tick_params(axis='y', labelcolor=color_time)
ax3_twin.set_ylim(0, 1000)

ax3.annotate('ĐIỂM NGỌT PARETO\n(Cap 14: 75% Win, ~120ms)', 
             xy=(2, 75.0), xytext=(1.0, 88),
             arrowprops=dict(facecolor='#805AD5', shrink=0.08, width=1.5, headwidth=6),
             fontweight='bold', color='#805AD5', fontsize=9)

ax3.set_title('3. ĐÁNH ĐỔI THỜI GIAN ĐỂ QUÉT\n(Candidate Soft Cap vs. Latency Trade-off)', fontsize=11, fontweight='bold', pad=12)

import os
script_dir = os.path.dirname(os.path.abspath(__file__))
output_img = os.path.join(script_dir, 'heuristic_tuning_bell_curve.png')
plt.tight_layout()
plt.savefig(output_img, dpi=300)
print(f'Chart generated successfully: {output_img}')
