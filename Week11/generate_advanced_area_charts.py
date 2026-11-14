#!/usr/bin/env python3
"""
generate_advanced_area_charts.py
Generates statistically sound, publication-grade Area Charts (Biểu đồ miền),
Stacked Area Plots, and Decision Boundary Maps for Gomoku Heuristic Tuning.
"""

import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Academic plotting styling
plt.rcParams.update({
    'font.family': 'serif',
    'font.size': 11,
    'axes.labelsize': 11.5,
    'axes.titlesize': 12,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 9.5,
    'figure.dpi': 300,
    'axes.grid': True,
    'grid.alpha': 0.35,
    'grid.linestyle': '--',
})

def create_chart_1_tactical_area_regimes():
    """
    Chart 1: Biểu đồ miền 3 phân vùng chiến thuật (Tactical Regimes Area Plot).
    Biểu diễn đường cong tối ưu hóa với 3 miền diện tích được tô màu phân biệt:
    - Miền 1: Vùng Mù Chiến Thuật (Under-tuned / Tactical Blindness)
    - Miền 2: Vùng Tối Ưu Cục Bộ (Optimal Tactical Basin)
    - Miền 3: Vùng Ám Ảnh Mẫu Hình (Over-tuned / Pattern Obsession)
    """
    # Sample points
    weights = np.array([1000, 2000, 3000, 4500, 6000, 8000, 10000, 25000, 60000, 150000, 500000])
    win_rates = np.array([50.0, 50.0, 50.0, 66.7, 58.3, 66.7, 75.0, 68.0, 58.0, 50.0, 50.0])
    
    # Smooth interpolation in log space
    log_w = np.log10(weights)
    dense_log_w = np.linspace(log_w.min(), log_w.max(), 400)
    dense_w = 10**dense_log_w
    poly = np.polyfit(log_w, win_rates, 4)
    dense_rates = np.polyval(poly, dense_log_w)
    
    fig, ax = plt.subplots(figsize=(8.0, 4.4))
    
    # Define 3 Tactical Regimes (Miền diện tích)
    # Regime 1: W <= 3500 (Tactical Blindness)
    mask1 = dense_w <= 3500
    ax.fill_between(dense_w[mask1], 40, dense_rates[mask1], color="#EF4444", alpha=0.18, label="Miền 1: Mù chiến thuật (W <= 3,500)")
    
    # Regime 2: 3500 < W <= 25000 (Optimal Basin)
    mask2 = (dense_w >= 3500) & (dense_w <= 25000)
    ax.fill_between(dense_w[mask2], 40, dense_rates[mask2], color="#10B981", alpha=0.25, label="Miền 2: Đỉnh tối ưu Pareto (3,500 < W <= 25k)")
    
    # Regime 3: W > 25000 (Pattern Obsession)
    mask3 = dense_w >= 25000
    ax.fill_between(dense_w[mask3], 40, dense_rates[mask3], color="#F59E0B", alpha=0.18, label="Miền 3: Ám ảnh mẫu hình (W > 25k)")
    
    # Curve & Data points
    ax.plot(dense_w, dense_rates, color="#1E3A8A", lw=2.4, zorder=4)
    ax.scatter(weights, win_rates, color="#1E40AF", edgecolor="#FFFFFF", s=55, zorder=5, label="Số liệu thực nghiệm")
    
    # Vertical regime dividers
    ax.axvline(3500, color="#991B1B", linestyle=":", lw=1.2)
    ax.axvline(25000, color="#B45309", linestyle=":", lw=1.2)
    
    # Annotations for Peak
    ax.annotate(
        "ĐỈNH TỐI ƯU CỤC BỘ\nW = 10,000 | Thắng: 75.0%\n(+25.0% vs Baseline)",
        xy=(10000, 75.0),
        xytext=(800, 76.5),
        arrowprops=dict(facecolor="#065F46", shrink=0.08, width=1.5, headwidth=6),
        fontsize=9,
        fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.35", fc="#ECFDF5", ec="#059669", lw=1.2)
    )
    
    ax.axhline(50.0, color="#64748B", linestyle="--", lw=1.0, label="Baseline chuẩn (50.0%)")
    
    ax.set_xscale("log")
    ax.set_ylim(42, 82)
    ax.set_xlabel("Trọng số Thế Ba Thông $W(\\text{Open 3})$ (Thang Logarit)", fontweight="bold")
    ax.set_ylabel("Tỉ lệ thắng trong giải tự đấu (%)", fontweight="bold")
    ax.legend(loc="lower center", framealpha=0.92, ncol=2)
    
    plt.tight_layout()
    pdf_path = os.path.join(BASE_DIR, "fig_area_tactical_regimes.pdf")
    png_path = os.path.join(BASE_DIR, "fig_area_tactical_regimes.png")
    fig.savefig(pdf_path)
    fig.savefig(png_path)
    plt.close(fig)
    print(f"Generated: {pdf_path}")

def create_chart_2_stacked_outcome_area():
    """
    Chart 2: Biểu đồ miền xếp chồng 100% (100% Stacked Area Chart).
    Biểu diễn sự phân bổ kết quả ván đấu (Thắng / Hòa / Thua) khi quét
    hệ số phòng thủ Beta (hoặc các mức tỉ lệ 10, 11, 12, 13).
    """
    betas = np.array([0.75, 0.85, 0.95, 1.00, 1.10, 1.15, 1.20, 1.30, 1.45])
    # Empirical win/draw/loss distribution percentages across betas
    win_pct = np.array([31.0, 56.0, 62.0, 72.2, 55.6, 68.0, 36.1, 36.1, 24.0])
    draw_pct = np.array([4.0,  3.0,  2.5,  2.8,  3.4,  2.0,  3.9,  4.2,  5.0])
    loss_pct = 100.0 - win_pct - draw_pct
    
    fig, ax = plt.subplots(figsize=(8.0, 4.4))
    
    # Stacked area plot
    colors = ["#10B981", "#94A3B8", "#EF4444"] # Green (Win), Gray (Draw), Red (Loss)
    ax.stackplot(betas, win_pct, draw_pct, loss_pct, labels=["Miền Thắng (Win)", "Miền Hòa (Draw)", "Miền Thua (Loss)"], colors=colors, alpha=0.85)
    
    # Annotate optimal zone vs paralysis zone
    ax.axvline(1.00, color="#065F46", linestyle="--", lw=1.3)
    ax.text(1.01, 85, "Bot-10 (Tỉ lệ 10)\nThắng: 72.2%", fontsize=8.5, fontweight="bold", color="#065F46")
    
    ax.axvline(1.20, color="#991B1B", linestyle="--", lw=1.3)
    ax.text(1.21, 25, "Bot-12 (Tỉ lệ 12)\nLiệt thế công (Thua: 60%)", fontsize=8.5, fontweight="bold", color="#7F1D1D")
    
    ax.set_xlim(0.75, 1.45)
    ax.set_ylim(0, 100)
    ax.set_xlabel("Hệ số Phòng thủ $\\beta$ (Các mốc tỉ lệ 10, 11, 12, 13)", fontweight="bold")
    ax.set_ylabel("Cơ cấu kết quả ván đấu tích lũy (%)", fontweight="bold")
    ax.legend(loc="upper right", framealpha=0.92)
    
    # Custom x ticks
    ax.set_xticks([0.75, 0.85, 1.00, 1.10, 1.15, 1.20, 1.30, 1.45])
    ax.set_xticklabels(["0.75", "0.85\n(Liều)", "1.00\n(Bot-10)", "1.10\n(Bot-11)", "1.15\n(Tối ưu)", "1.20\n(Bot-12)", "1.30\n(Bot-13)", "1.45\n(Liệt)"])
    
    plt.tight_layout()
    pdf_path = os.path.join(BASE_DIR, "fig_area_stacked_outcomes.pdf")
    png_path = os.path.join(BASE_DIR, "fig_area_stacked_outcomes.png")
    fig.savefig(pdf_path)
    fig.savefig(png_path)
    plt.close(fig)
    print(f"Generated: {pdf_path}")

def create_chart_3_feasible_envelope_area():
    """
    Chart 3: Biểu đồ miền khả dụng tương tác Web (Interactive Feasible Envelope Area Plot).
    Biểu diễn độ trễ tính toán và vùng khả dụng ngân sách thời gian (< 100ms).
    """
    caps = np.array([4, 8, 12, 16, 20, 24, 28, 32])
    times_ms = np.array([4.2, 14.8, 38.5, 78.2, 142.0, 235.0, 345.0, 480.0])
    threat_coverage = np.array([48.0, 68.0, 84.0, 96.0, 97.5, 98.5, 98.8, 99.0])
    
    fig, ax1 = plt.subplots(figsize=(8.0, 4.4))
    
    # Shaded Area: Feasible Interactive Envelope (< 100ms)
    ax1.axhspan(0, 100, color="#10B981", alpha=0.15, label="Miền Khả Dụng Web (< 100 ms: Trải nghiệm mượt)")
    ax1.axhspan(100, 520, color="#EF4444", alpha=0.10, label="Miền Trễ Cao (> 100 ms: Nguy cơ đơ trình duyệt)")
    
    # Search time curve
    color_time = "#DC2626"
    l1 = ax1.plot(caps, times_ms, color=color_time, marker="s", lw=2.2, label="Độ trễ tính toán (ms)")
    ax1.set_xlabel("Số lượng nước đi ứng viên giữ lại (Candidate Soft Cap)", fontweight="bold")
    ax1.set_ylabel("Thời gian tính toán mỗi nước (ms)", color=color_time, fontweight="bold")
    ax1.tick_params(axis='y', labelcolor=color_time)
    ax1.set_ylim(0, 520)
    
    # Secondary axis: Threat Coverage
    ax2 = ax1.twinx()
    color_cov = "#2563EB"
    l2 = ax2.plot(caps, threat_coverage, color=color_cov, marker="o", lw=2.2, linestyle="--", label="Độ bao phủ thế đe dọa (%)")
    ax2.set_ylabel("Độ bao phủ thế đe dọa chiến thuật (%)", color=color_cov, fontweight="bold")
    ax2.tick_params(axis='y', labelcolor=color_cov)
    ax2.set_ylim(40, 105)
    ax2.grid(False)
    
    # Highlight Pareto optimal point inside feasible envelope
    ax1.scatter([16], [78.2], color="#059669", s=90, zorder=6)
    ax1.annotate(
        "ĐIỂM PARETO TỐI ƯU TRONG MIỀN KHẢ DỤNG\nCap = 16 | Latency = 78.2 ms (< 100 ms)\nĐộ bao phủ đe dọa: 96.0%",
        xy=(16, 78.2),
        xytext=(5, 300),
        arrowprops=dict(facecolor="#059669", shrink=0.08, width=1.5, headwidth=6),
        fontsize=9,
        fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.35", fc="#ECFDF5", ec="#059669", lw=1.2)
    )
    
    # Merged legend
    lines = l1 + l2
    labels = [l.get_label() for l in lines]
    ax1.legend(loc="upper left", framealpha=0.92)
    
    plt.tight_layout()
    pdf_path = os.path.join(BASE_DIR, "fig_area_time_tradeoff.pdf")
    png_path = os.path.join(BASE_DIR, "fig_area_time_tradeoff.png")
    fig.savefig(pdf_path)
    fig.savefig(png_path)
    plt.close(fig)
    print(f"Generated: {pdf_path}")

def create_chart_4_decision_regions_2d():
    """
    Chart 4: Bản đồ miền quyết định 2 chiều (2D Decision Boundary Region Map).
    Phân tách không gian thành 2 Miền:
    - Miền Tấn Công (Offensive Dominance Region): E_atk > W_threat
    - Miền Phòng Thủ (Defensive Dominance Region): W_threat > E_atk
    Vẽ đường phân chia ranh giới Delta E = 0 và định vị các điểm thử nghiệm.
    """
    x = np.linspace(60, 130, 200) # W_threat
    y = np.linspace(60, 130, 200) # E_attack
    X, Y = np.meshgrid(x, y)
    Z = Y - X # Delta E = E_attack - W_threat
    
    fig, ax = plt.subplots(figsize=(7.5, 4.4))
    
    # Filled contour: Two Decision Regions
    cs = ax.contourf(X, Y, Z, levels=[-100, 0, 100], colors=["#FEE2E2", "#DBEAFE"], alpha=0.7)
    
    # Boundary line Delta E = 0
    ax.plot([60, 130], [60, 130], color="#1E293B", lw=2, linestyle="-", label="Ranh giới quyết định ($\\Delta E = 0$)")
    
    # Labels inside regions
    ax.text(80, 115, "MIỀN TẤN CÔNG (OFFENSE)\n($E_{\\text{atk}} > W_{\\text{threat}} \\Rightarrow \\Delta E > 0$)\nBot chọn nước tạo thế công", fontsize=9.5, color="#1E40AF", fontweight="bold", ha="center")
    ax.text(112, 75, "MIỀN PHÒNG THỦ (DEFENSE)\n($W_{\\text{threat}} > E_{\\text{atk}} \\Rightarrow \\Delta E < 0$)\nBot lập tức chặn nguy cơ", fontsize=9.5, color="#991B1B", fontweight="bold", ha="center")
    
    # Plot experimental sweep points with fixed E_atk = 105
    w_points = np.array([70, 80, 90, 100, 110, 120])
    e_points = np.full_like(w_points, 105)
    
    # Offense points
    ax.scatter(w_points[:2], e_points[:2], color="#2563EB", edgecolor="#FFFFFF", s=70, zorder=5, label="Thử nghiệm W <= 80 (Chọn Công)")
    # Defense points
    ax.scatter(w_points[2:], e_points[2:], color="#DC2626", edgecolor="#FFFFFF", s=70, zorder=5, label="Thử nghiệm W >= 90 (Chọn Thủ)")
    
    # Decision flip marker at W = 90
    ax.annotate(
        "ĐIỂM LẬT NƯỚC ĐI (W = 90)\nLọt qua ranh giới sang Miền Thủ!",
        xy=(90, 105),
        xytext=(65, 88),
        arrowprops=dict(facecolor="#DC2626", shrink=0.08, width=1.5, headwidth=6),
        fontsize=8.5,
        fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.3", fc="#FEF2F2", ec="#DC2626", lw=1)
    )
    
    ax.set_xlim(60, 130)
    ax.set_ylim(60, 130)
    ax.set_xlabel("Trọng số mối đe dọa của đối thủ $W_{\\text{threat}}$", fontweight="bold")
    ax.set_ylabel("Điểm lượng giá nước đi tấn công $E_{\\text{attack}}$", fontweight="bold")
    ax.legend(loc="lower left", framealpha=0.92)
    
    plt.tight_layout()
    pdf_path = os.path.join(BASE_DIR, "fig_area_decision_regions.pdf")
    png_path = os.path.join(BASE_DIR, "fig_area_decision_regions.png")
    fig.savefig(pdf_path)
    fig.savefig(png_path)
    plt.close(fig)
    print(f"Generated: {pdf_path}")

if __name__ == "__main__":
    create_chart_1_tactical_area_regimes()
    create_chart_2_stacked_outcome_area()
    create_chart_3_feasible_envelope_area()
    create_chart_4_decision_regions_2d()
    print("All advanced area charts generated successfully!")
