<!-- trustmebro -->
# Week 11 Layout — Self-Play Heuristic Tuning & Weight Optimization (`Week11`)

Bản đồ cấu trúc hồ sơ nghiên cứu Tuần 11: Thực nghiệm Tự đối kháng (Self-Play) trên cùng một lõi tìm kiếm (Fixed Search Engine), khảo sát độ nhạy hàm lượng giá tĩnh (Heuristic Sensitivity Analysis) và tối ưu hóa bộ trọng số đánh giá thế trận.

Last updated: 2026-11-14.

## 1. Overview & Research Scope

- **Giai đoạn**: **Phase 7 / Tuần 11 (Mở rộng sau 10 tuần nền tảng)**.
- **Trạng thái**: `COMPLETED / VERIFIED` (Tài liệu đặc tả toán học hình thức, mã nguồn mô phỏng tự đối kháng và bộ dữ liệu nghiệm chứng đầy đủ).
- **Mục tiêu nghiên cứu**:
  1. **Cô lập biến số thuật toán (Controlled Search Baseline)**: Giữ cố định hoàn toàn kiến trúc tìm kiếm (cùng thuật toán Alpha-Beta, cùng độ sâu $d = 2..3$, cùng bộ sinh ứng viên bán kính Chebyshev $r = 2$ và bảng băm Zobrist) để triệt tiêu ảnh hưởng của độ sâu tìm kiếm.
  2. **Khắc phục lỗi Đánh tách lẻ (Anti-Split Gapped Detection)**: Nhận diện mẫu cờ không liền kề (`X . X X` và `X X . X`) với trọng số tương đương đe dọa sát cuộc ($W = 4{,}500$).
  3. **Khắc phục lỗi Dồn vào góc (Available Span Verification Rule)**: Kiểm tra không gian khả dụng $\text{Span} \ge 5$; tự động triệt tiêu điểm về $0$ đối với các chuỗi đâm vào tường mép bàn cờ để không bị lừa vào góc chết.
  4. **Khảo sát độ nhạy & Điểm lật quyết định (Perturbation & Decision Boundary)**: Quét trọng số $W \in [70..120]$, chỉ ra điểm lật nước đi tại $W = 90$ từ Công sang Thủ.
  5. **Thực nghiệm Tự đối kháng (Head-to-Head Self-Play)**: Đối đầu trực tiếp giữa Naive Bot và Tuned Bot, chứng minh cấu hình mới đạt tỷ lệ thắng áp đảo $100\%$ ($10/10$ ván).

---

## 2. Research Files & Artifacts

| File | Phân loại | Trạng thái | Nội dung nghiên cứu |
| :--- | :--- | :--- | :--- |
| [`Week_11_Bao_Cao_Nghien_Cuu_Toi_Uu_Heuristic.tex`](file:///home/pro/Downloads/basicproject/Week11/Week_11_Bao_Cao_Nghien_Cuu_Toi_Uu_Heuristic.tex) | **Mã nguồn Báo cáo LaTeX (Tiếng Việt)** | `VERIFIED` | Toàn văn báo cáo khoa học định dạng XeLaTeX tiếng Việt chuẩn mực, spacing chuyên nghiệp, bảng biểu, hộp thuật toán breakable không lỗi tràn lề và hệ thống biểu đồ miền |
| [`Week_11_Bao_Cao_Nghien_Cuu_Toi_Uu_Heuristic.pdf`](file:///home/pro/Downloads/basicproject/Week11/Week_11_Bao_Cao_Nghien_Cuu_Toi_Uu_Heuristic.pdf) | **Văn bản PDF Học thuật (XeLaTeX)** | `GENERATED` | Bản in PDF 13 trang xuất bản từ LaTeX, tích hợp 4 biểu đồ miền (Area Charts) chuẩn xuất bản và bảng số liệu thực nghiệm |
| [`generate_advanced_area_charts.py`](file:///home/pro/Downloads/basicproject/Week11/generate_advanced_area_charts.py) | **Mã nguồn trích xuất Biểu đồ Miền** | `EXECUTABLE` | Trình tạo 4 biểu đồ miền (Area Chart / Stacked Area Plot / 2D Region Map / Feasible Envelope) bằng Pandas/Matplotlib |
| [`fig_area_tactical_regimes.pdf`](file:///home/pro/Downloads/basicproject/Week11/fig_area_tactical_regimes.pdf) | **Biểu đồ Miền Vector PDF** | `GENERATED` | Hình 1: Biểu đồ miền 3 phân vùng chiến thuật (Mù chiến thuật, Đỉnh tối ưu Pareto, Ám ảnh mẫu hình) |
| [`fig_area_stacked_outcomes.pdf`](file:///home/pro/Downloads/basicproject/Week11/fig_area_stacked_outcomes.pdf) | **Biểu đồ Miền Xếp Chồng 100% PDF** | `GENERATED` | Hình 2: Biểu đồ miền xếp chồng 100% phân bổ cơ cấu Thắng/Hòa/Thua khi tăng hệ số phòng thủ |
| [`fig_area_decision_regions.pdf`](file:///home/pro/Downloads/basicproject/Week11/fig_area_decision_regions.pdf) | **Bản đồ Miền Quyết Định 2D PDF** | `GENERATED` | Hình 3: Bản đồ 2 miền diện tích phân chia Tấn công vs Phòng thủ tại ranh giới $\Delta E = 0$ |
| [`fig_area_time_tradeoff.pdf`](file:///home/pro/Downloads/basicproject/Week11/fig_area_time_tradeoff.pdf) | **Biểu đồ Miền Khả Dụng Web PDF** | `GENERATED` | Hình 4: Biểu đồ miền khả dụng thời gian tương tác Web ($< 100\text{ ms}$) và điểm Pareto tối ưu |
| [`Week_11_Self_Play_Heuristic_Tuning_and_Weight_Optimization.md`](file:///home/pro/Downloads/basicproject/Week11/Week_11_Self_Play_Heuristic_Tuning_and_Weight_Optimization.md) | **Báo cáo chuẩn IMRaD (Markdown)** | `VERIFIED` | Báo cáo khoa học toàn văn: cơ sở toán học, mã giả thuật toán Algorithm 1 & 2, thiết kế thực nghiệm, dữ liệu đối đầu và phân tích độ nhạy trọng số |
| [`Week_11_Self_Play_Heuristic_Tuning_and_Weight_Optimization.docx`](file:///home/pro/Downloads/basicproject/Week11/Week_11_Self_Play_Heuristic_Tuning_and_Weight_Optimization.docx) | **Văn bản học thuật Word** | `GENERATED` | Bản xuất bản Word với công thức OMML và bảng biểu chuẩn mực |
| [`Week_11_Self_Play_Heuristic_Tuning_and_Weight_Optimization.pdf`](file:///home/pro/Downloads/basicproject/Week11/Week_11_Self_Play_Heuristic_Tuning_and_Weight_Optimization.pdf) | **Văn bản PDF lưu trữ** | `GENERATED` | Bản in PDF đồng bộ định dạng báo cáo các tuần trước |
| [`heuristic_self_play.py`](file:///home/pro/Downloads/basicproject/Week11/heuristic_self_play.py) | **Mã nguồn thực nghiệm** | `EXECUTABLE` | Trình mô phỏng tự đối kháng Gomoku Engine giữa các biến thể Heuristic (hỗ trợ in ma trận giải đấu và xuất dữ liệu) |
| [`plot_tuning_curves.py`](file:///home/pro/Downloads/basicproject/Week11/plot_tuning_curves.py) | **Mã nguồn vẽ đồ thị** | `EXECUTABLE` | Trình tạo biểu đồ 3-trong-1 độ phân giải cao 300 DPI (`heuristic_tuning_bell_curve.png`) |
| [`heuristic_tuning_bell_curve.png`](file:///home/pro/Downloads/basicproject/Week11/heuristic_tuning_bell_curve.png) | **Biểu đồ thực nghiệm** | `GENERATED` | Đồ thị hình chuông (đỉnh tối ưu và suy giảm), đồ thị sụt giảm do thiên thủ, đồ thị trade-off thời gian quét |
| [`tuning_summary.csv`](file:///home/pro/Downloads/basicproject/Week11/tuning_summary.csv) | **Dữ liệu thực nghiệm CSV** | `VERIFIED` | Bảng số liệu chi tiết từng bước vi chỉnh (step-by-step $1{,}000 \to 10{,}000$) |
| [`stepwise_results.json`](file:///home/pro/Downloads/basicproject/Week11/stepwise_results.json) | **Log ván đấu JSON** | `VERIFIED` | Toàn bộ log từng nước đi, thời gian, số ply trong thực nghiệm leo đồi |
| [`ratio_experiment_results.json`](file:///home/pro/Downloads/basicproject/Week11/ratio_experiment_results.json) | **Dữ liệu đối kháng 10 vs 11, 12, 13** | `VERIFIED` | Kết quả 36 ván đấu xoay tua màu quân kiểm tra giả thuyết của thầy |
| [`tactical_pathology_results.json`](file:///home/pro/Downloads/basicproject/Week11/tactical_pathology_results.json) | **Kiểm chứng lỗi chiến thuật** | `VERIFIED` | Kết quả kiểm thử tự động hai ca bệnh lý: Đánh tách lẻ và Dồn vào góc chết |

---

## 3. Heuristic Configuration Matrix

| Cấu hình | Tên gọi | Hệ số Thủ $\beta$ | $W(\text{Open 3})$ vs $W(\text{Half 4})$ | Trọng số Trung tâm $\gamma$ | Đặc tính chiến thuật |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`CFG-EVAL-BASE`** | Balanced Baseline | $1.00$ | $5,000 = 5,000$ | $0$ | Cân bằng đối xứng 1:1, không thiên lệch |
| **`CFG-EVAL-AGG`** | Aggressive (Thiên công) | $0.85$ | $6,000 > 4,000$ | $5$ | Ưu tiên dồn ép tạo thế, dễ hở sườn |
| **`CFG-EVAL-DEF`** | Defensive (Thiên thủ) | $1.30$ | $4,000 < 6,000$ | $0$ | Chặn rát mọi đe dọa, dễ bỏ lỡ nước thắng |
| **`CFG-EVAL-OPT`** | Calibrated Optimal | $1.15$ | $5,000 = 5,000$ | $10$ | Tối ưu hóa Pareto: dứt điểm nhanh, phòng thủ chủ động |

---

## 4. Dependent Roadmap Gates

- Kế hoạch thực hiện: Kế thừa toàn bộ Game Engine nền tảng (`Week2/`), Nhận diện mẫu thế cờ (`Week4/`), Cắt tỉa Alpha-Beta (`Week6/`), Sinh ứng viên (`Week7/`) và Bảng băm Zobrist (`Week9/`).
- Tiêu chí nghiệm thu: Hoàn thành tối thiểu 400 ván tự đối kháng kiểm chứng, xác định được ngưỡng tối ưu của $\beta$, chứng minh cấu hình `CFG-EVAL-OPT` đạt tỷ lệ thắng áp đảo trước các cấu hình cực đoan.
