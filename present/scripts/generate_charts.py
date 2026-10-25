#!/usr/bin/env python3
import sys
import os

dist_pkg = '/home/pro/snap/antigravity-cli/common/local/lib/python3.14/dist-packages'
if os.path.exists(dist_pkg) and dist_pkg not in sys.path:
    sys.path.insert(0, dist_pkg)

import matplotlib.pyplot as plt
import numpy as np

os.makedirs('/home/pro/Downloads/basicproject/present/public/assets', exist_ok=True)

# 1. Rust vs TypeScript Performance Benchmark
plt.style.use('dark_background')
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=200)
fig.patch.set_facecolor('#07090e')
ax1.set_facecolor('#0f131c')
ax2.set_facecolor('#0f131c')

depths = ['Depth 1', 'Depth 2', 'Depth 3', 'Depth 4']
rust_time = [0.0221, 0.3125, 9.0248, 285.4517]
ts_time = [0.5383, 5.5795, 156.7846, 5083.4518]
speedup = [ts / r for ts, r in zip(ts_time, rust_time)]

x = np.arange(len(depths))
width = 0.35

rects1 = ax1.bar(x - width/2, rust_time, width, label='Rust Native Engine', color='#38bdf8', edgecolor='#0284c7', linewidth=1.2)
rects2 = ax1.bar(x + width/2, ts_time, width, label='TypeScript Engine', color='#f43f5e', edgecolor='#e11d48', linewidth=1.2)

ax1.set_yscale('log')
ax1.set_ylabel('Execution Time (ms, Log Scale)', color='#94a3b8', fontsize=11, fontweight='bold')
ax1.set_title('Log-Scale Execution Time (ms) by Search Depth', color='#f8fafc', fontsize=12, fontweight='bold', pad=12)
ax1.set_xticks(x)
ax1.set_xticklabels(depths, color='#cbd5e1', fontweight='bold')
ax1.grid(True, linestyle='--', alpha=0.15, color='#475569')
ax1.legend(facecolor='#1e293b', edgecolor='#334155', fontsize=10)

# Annotation for depth 4
ax1.annotate('17.8x Speedup\n(285ms vs 5.08s)', 
             xy=(3, 285.4517), xytext=(2.1, 1000),
             arrowprops=dict(facecolor='#38bdf8', shrink=0.08, width=1.5, headwidth=6),
             color='#38bdf8', fontweight='bold', fontsize=9.5,
             bbox=dict(boxstyle='round,pad=0.4', facecolor='#0b192c', edgecolor='#38bdf8', alpha=0.9))

# Plot 2: Speedup Factor & Node Throughput
colors = ['#38bdf8', '#818cf8', '#a855f7', '#ec4899']
ax2.bar(depths, speedup, color=colors, width=0.45, edgecolor='#ffffff', linewidth=0.8, alpha=0.9)
ax2.set_ylabel('Speedup Factor (TS Time / Rust Time)', color='#94a3b8', fontsize=11, fontweight='bold')
ax2.set_title('Rust Acceleration Factor Across Depth', color='#f8fafc', fontsize=12, fontweight='bold', pad=12)
ax2.grid(True, linestyle='--', alpha=0.15, color='#475569')

for i, v in enumerate(speedup):
    ax2.text(i, v + 0.6, f'{v:.1f}x', ha='center', color='#f8fafc', fontweight='bold', fontsize=11)

plt.tight_layout()
plt.savefig('/home/pro/Downloads/basicproject/present/public/assets/rust_vs_ts_speedup.png', dpi=200, facecolor=fig.get_facecolor())
plt.close()

# 2. Chebyshev Distance Grid Candidate Heatmap
fig, ax = plt.subplots(figsize=(7, 7), dpi=200)
fig.patch.set_facecolor('#07090e')
ax.set_facecolor('#0f131c')

grid = np.zeros((15, 15))
# Place some active stones in center
stones = [(7, 7, 1), (7, 8, -1), (8, 7, 1), (6, 8, -1), (8, 8, 1)]
for r, c, val in stones:
    grid[r, c] = val

# Mark Chebyshev candidates (distance <= 2 from stones)
candidates = set()
for sr, sc, _ in stones:
    for dr in range(-2, 3):
        for dc in range(-2, 3):
            nr, nc = sr + dr, sc + dc
            if 0 <= nr < 15 and 0 <= nc < 15 and grid[nr, nc] == 0:
                candidates.add((nr, nc))

display_matrix = np.zeros((15, 15))
for r, c in candidates:
    display_matrix[r, c] = 0.5  # Candidate highlight

for r, c, val in stones:
    display_matrix[r, c] = 1.0 if val == 1 else 0.85

cax = ax.imshow(display_matrix, cmap='magma', origin='upper', extent=[0, 15, 15, 0])
ax.set_xticks(np.arange(0, 16, 1))
ax.set_yticks(np.arange(0, 16, 1))
ax.grid(color='#334155', linestyle='-', linewidth=0.8, alpha=0.5)
ax.set_xticklabels([])
ax.set_yticklabels([])

ax.set_title('Chebyshev Metric r <= 2 Pruning: 225 cells -> 36 candidates (84% Pruned)', 
             color='#f8fafc', fontsize=10.5, fontweight='bold', pad=12)

# Scatter stones
for r, c, val in stones:
    marker = 'X' if val == 1 else 'O'
    color = '#f43f5e' if val == 1 else '#38bdf8'
    ax.text(c + 0.5, r + 0.5, marker, ha='center', va='center', color=color, fontsize=14, fontweight='heavy')

plt.tight_layout()
plt.savefig('/home/pro/Downloads/basicproject/present/public/assets/chebyshev_heatmap.png', dpi=200, facecolor=fig.get_facecolor())
plt.close()

# 3. Pattern Heuristic Weights
fig, ax = plt.subplots(figsize=(10, 5), dpi=200)
fig.patch.set_facecolor('#07090e')
ax.set_facecolor('#0f131c')

patterns = ['Five', 'Open Four', 'Closed Four', 'Open Three', 'Closed Three', 'Open Two', 'Closed Two']
attack_weights = [10000000, 100000, 10000, 5000, 1000, 500, 100]
defense_weights = [9999999, 120000, 12000, 6000, 1200, 600, 120]

x = np.arange(len(patterns))
width = 0.35

ax.bar(x - width/2, attack_weights, width, label='Attack Weight (Bot)', color='#eab308', edgecolor='#ca8a04')
ax.bar(x + width/2, defense_weights, width, label='Defense Weight (Block Human)', color='#38bdf8', edgecolor='#0284c7')

ax.set_yscale('log')
ax.set_ylabel('Weight Value (Log Scale)', color='#94a3b8', fontsize=11, fontweight='bold')
ax.set_title('Canonical Pattern Weights (Mate Dominance & Defensive Bias)', color='#f8fafc', fontsize=12, fontweight='bold', pad=12)
ax.set_xticks(x)
ax.set_xticklabels(patterns, color='#cbd5e1', rotation=15, fontweight='bold')
ax.grid(True, linestyle='--', alpha=0.15, color='#475569')
ax.legend(facecolor='#1e293b', edgecolor='#334155', fontsize=10)

plt.tight_layout()
plt.savefig('/home/pro/Downloads/basicproject/present/public/assets/pattern_weights_distribution.png', dpi=200, facecolor=fig.get_facecolor())
plt.close()

print("All charts successfully generated!")
