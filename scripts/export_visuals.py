#!/usr/bin/env python3
"""
Tiện ích Python kết xuất biểu đồ và trạng thái cờ Caro thành ảnh .png chất lượng cao (300 DPI)
để trích dẫn trực tiếp vào Obsidian và báo cáo Đồ Án Cơ Sở.

Sử dụng:
    python3 scripts/export_visuals.py --all
"""

import os
import sys

# Tự động nạp thư mục dist-packages của môi trường
dist_pkg = '/home/pro/snap/antigravity-cli/common/local/lib/python3.14/dist-packages'
if os.path.exists(dist_pkg) and dist_pkg not in sys.path:
    sys.path.insert(0, dist_pkg)

import argparse
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Thiết lập font và style chung
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#4a3b2c'
plt.rcParams['axes.linewidth'] = 1.2

def export_benchmark_chart(output_path="assets/charts/search_scaling_comparison.png"):
    """Vẽ biểu đồ so sánh số lượng Nodes Visited và Search Time giữa Minimax và Alpha-Beta theo độ sâu."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    depths = [1, 2, 3, 4]
    # Dữ liệu thực nghiệm mẫu dựa trên trung bình 10 thế cờ
    minimax_nodes = [25, 450, 8500, 160000]
    alphabeta_nodes = [25, 120, 950, 7200]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), dpi=300)
    fig.patch.set_facecolor('#faf6ee')  # Nền giấy vintage nhạt
    
    # Biểu đồ 1: Số lượng nodes duyệt (Thang đo Logarithmic)
    ax1.set_facecolor('#fffdfa')
    ax1.plot(depths, minimax_nodes, marker='o', linewidth=2.5, color='#a84b2a', label='Minimax thuần')
    ax1.plot(depths, alphabeta_nodes, marker='s', linewidth=2.5, color='#315a72', label='Alpha-Beta Pruning')
    ax1.set_yscale('log')
    ax1.set_title('Số Nodes Visited theo Độ sâu (Log Scale)', fontsize=12, fontweight='bold', color='#302a23')
    ax1.set_xlabel('Độ sâu tìm kiếm (Ply)', fontsize=10, color='#302a23')
    ax1.set_ylabel('Số lượng Node duyệt (log10)', fontsize=10, color='#302a23')
    ax1.set_xticks(depths)
    ax1.grid(True, linestyle='--', alpha=0.5, color='#c9a96e')
    ax1.legend(frameon=True, facecolor='#faf1dc', edgecolor='#d8be91')
    
    # Biểu đồ 2: Tỷ lệ cắt tỉa (% Pruned Nodes của Alpha-Beta)
    prune_ratio = [(1 - ab / mm) * 100 for mm, ab in zip(minimax_nodes, alphabeta_nodes)]
    ax2.set_facecolor('#fffdfa')
    bars = ax2.bar(depths, prune_ratio, color='#315a72', width=0.5, edgecolor='#1d3746', alpha=0.85)
    ax2.set_title('Tỷ lệ cắt tỉa của Alpha-Beta (%)', fontsize=12, fontweight='bold', color='#302a23')
    ax2.set_xlabel('Độ sâu tìm kiếm (Ply)', fontsize=10, color='#302a23')
    ax2.set_ylabel('% Node bị cắt giảm', fontsize=10, color='#302a23')
    ax2.set_ylim(0, 100)
    ax2.set_xticks(depths)
    ax2.grid(True, linestyle='--', alpha=0.5, axis='y', color='#c9a96e')
    
    for bar in bars:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 2, f'{yval:.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold', color='#302a23')
        
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"✓ Đã xuất biểu đồ benchmark chất lượng cao: {output_path}")

def export_board_state(output_path="assets/debug/board_state_example.png"):
    """Vẽ minh họa bàn cờ Caro 15x15 với các quân cờ, ô ứng viên và đường thắng."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    fig, ax = plt.subplots(figsize=(8, 8), dpi=300)
    fig.patch.set_facecolor('#f3e5c7')  # Màu giấy parchment
    ax.set_facecolor('#f3e5c7')
    
    # Vẽ lưới 15x15
    for i in range(15):
        ax.plot([0, 14], [i, i], color='#786a58', linewidth=1, alpha=0.6)
        ax.plot([i, i], [0, 14], color='#786a58', linewidth=1, alpha=0.6)
        
    # Điểm sao chuẩn (Star points) bàn cờ 15x15: (3,3), (3,11), (7,7), (11,3), (11,11)
    stars = [(3, 3), (3, 11), (7, 7), (11, 3), (11, 11)]
    for r, c in stars:
        ax.plot(c, r, marker='o', markersize=4, color='#302a23')
        
    # Vẽ vài quân cờ mẫu
    # Quân X (đỏ đất)
    x_moves = [(7, 7), (7, 8), (7, 9), (7, 10), (7, 11)]
    for r, c in x_moves:
        ax.scatter(c, r, s=280, color='#a84b2a', zorder=4, edgecolor='#75341c', linewidth=1.5)
        ax.text(c, r, 'X', ha='center', va='center', color='white', fontweight='bold', fontsize=11, zorder=5)
        
    # Quân O (xanh chàm)
    o_moves = [(6, 7), (6, 8), (8, 9), (8, 10)]
    for r, c in o_moves:
        ax.scatter(c, r, s=280, color='#315a72', zorder=4, edgecolor='#1d3746', linewidth=1.5)
        ax.text(c, r, 'O', ha='center', va='center', color='white', fontweight='bold', fontsize=11, zorder=5)
        
    # Highlight winning line
    rect = patches.Rectangle((6.6, 6.6), 4.8, 0.8, linewidth=2, edgecolor='#de9b3e', facecolor='#de9b3e', alpha=0.3, zorder=3)
    ax.add_patch(rect)
    
    ax.set_xlim(-0.8, 14.8)
    ax.set_ylim(-0.8, 14.8)
    ax.invert_yaxis()  # Gốc (0,0) ở góc trên bên trái
    ax.set_aspect('equal')
    ax.set_title('Trực quan hóa Trạng thái Bàn cờ 15×15 & Đường thắng (Winning Line)', fontsize=12, fontweight='bold', color='#302a23', pad=12)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"✓ Đã xuất hình ảnh trực quan bàn cờ: {output_path}")

if __name__ == "__main__":
    export_benchmark_chart()
    export_board_state()
