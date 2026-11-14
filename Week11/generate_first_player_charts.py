#!/usr/bin/env python3
"""
Generate publication-quality scientific charts demonstrating:
1. The First-Player (Black) Advantage on 15x15 Gomoku (600-game empirical evidence vs Allis 1994).
2. The comparison of Bot Profiles under strict Color Alternation.
"""

import json
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Arial'],
    'font.size': 10,
    'axes.labelsize': 11,
    'axes.titlesize': 12,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 10,
    'figure.titlesize': 13,
    'figure.dpi': 300,
    'lines.linewidth': 2.0
})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, "large_scale_tournament_results.json")

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.2))

# Subplot 1: Black vs White Win Distribution across N = 600 games
labels = ['Quân Đen (Đi trước)\nFirst Player', 'Quân Trắng (Đi sau)\nSecond Player', 'Hòa\nDraw']
counts = [data['black_win_rate'], data['white_win_rate'], data['draw_rate']]
colors = ['#1a365d', '#718096', '#cbd5e0']

# 95% Wilson CI for Black: [58.56, 66.28] -> error -3.94, +3.78
# White: [30.48, 38.07] -> error -3.69, +3.90
# Draw: [2.14, 5.12]
yerr = [
    [data['black_win_rate'] - 58.56, data['white_win_rate'] - 30.48, data['draw_rate'] - 2.14],
    [66.28 - data['black_win_rate'], 38.07 - data['white_win_rate'], 5.12 - data['draw_rate']]
]

bars = ax1.bar(labels, counts, yerr=yerr, capsize=6, color=colors, edgecolor='#2d3748', linewidth=1.5, width=0.55)

for bar, count in zip(bars, counts):
    y = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width() / 2, y + 4.5, f"{count:.1f}%\n(N=600)", ha='center', va='bottom', fontweight='bold', fontsize=10)

ax1.axhline(50.0, color='#e53e3e', linestyle='--', linewidth=1.5, alpha=0.8, label='Mốc Cân Bằng Lý Tưởng (50%)')
ax1.set_ylim(0, 85)
ax1.set_ylabel('Tỉ Lệ Kết Quả Ván Đấu (%)', fontweight='bold')
ax1.set_title('(A) Bằng Chứng Thực Nghiệm: Lợi Thế Đi Trước (N = 600 Ván)\nFree Gomoku trên Bàn 15x15 KHÔNG Triệt Tiêu Lợi Thế Đen', fontweight='bold', pad=12)
ax1.grid(axis='y', linestyle=':', alpha=0.6)
ax1.legend(loc='upper right', framealpha=0.9)

# Subplot 2: Profile Performance Under Color Alternation
profiles = [p['profile'] for p in data['profiles']]
win_rates = [p['win_rate_percent'] for p in data['profiles']]
ci_lows = [p['ci_95'][0] for p in data['profiles']]
ci_highs = [p['ci_95'][1] for p in data['profiles']]
errors = [
    [w - l for w, l in zip(win_rates, ci_lows)],
    [h - w for w, h in zip(win_rates, ci_highs)]
]

bar_colors = ['#2b6cb0', '#dd6b20', '#319795', '#38a169']
bars2 = ax2.bar(profiles, win_rates, yerr=errors, capsize=6, color=bar_colors, edgecolor='#2d3748', linewidth=1.5, width=0.5)

for bar, w in zip(bars2, win_rates):
    ax2.text(bar.get_x() + bar.get_width() / 2, w + 4.5, f"{w:.1f}%\n(N=300)", ha='center', va='bottom', fontweight='bold', fontsize=10)

ax2.axhline(50.0, color='#e53e3e', linestyle='--', linewidth=1.5, alpha=0.8, label='Mốc Cân Bằng (50%)')
ax2.set_ylim(0, 75)
ax2.set_ylabel('Tỉ Lệ Thắng Sau Khi Hoán Đổi Màu (%)', fontweight='bold')
ax2.set_title('(B) Đánh Giá Cấu Hình Heuristic Sau Hoán Đổi Màu Quân (1:1)\nLoại Bỏ Hoàn Toàn Sai Số Hệ Thống Do Lợi Thế Đi Trước', fontweight='bold', pad=12)
ax2.grid(axis='y', linestyle=':', alpha=0.6)
ax2.legend(loc='upper right', framealpha=0.9)

plt.tight_layout()

out_pdf = os.path.join(BASE_DIR, "fig_first_player_advantage.pdf")
out_png = os.path.join(BASE_DIR, "fig_first_player_advantage.png")
plt.savefig(out_pdf, bbox_inches='tight')
plt.savefig(out_png, dpi=300, bbox_inches='tight')
print(f"Generated {out_pdf} and {out_png}")
