# Visual Evidence, Diagrams & Artifact Pipeline

Quy chuẩn xử lý sơ đồ, hình ảnh trực quan hóa, biểu đồ và log thực nghiệm trong tài liệu nghiên cứu và Obsidian vault.

Mọi kết luận kỹ thuật, trạng thái game, và số liệu đo đạc phải có bằng chứng trực quan đi kèm thay vì chỉ dựa vào text thuần.

---

## 1. Xử lý sơ đồ Mermaid sang định dạng ảnh (.png)

1. **Không lưu sơ đồ chỉ ở dạng raw code block**:
   - Khi thiết kế sơ đồ kiến trúc, luồng trạng thái (state diagram), luồng dữ liệu hoặc cây trò chơi (game tree) bằng cú pháp Mermaid, bắt buộc phải biên dịch và kết xuất ra file ảnh `.png` chất lượng cao.
2. **Công cụ biên dịch**:
   - Sử dụng Mermaid CLI (`mmdc`):
     ```bash
     npx --yes @mermaid-js/mermaid-cli -i <input.mmd> -o <output.png> -b white -s 2
     ```
   - Tùy chọn `-s 2` (scale x2) hoặc `-s 3` để đảm bảo độ phân giải sắc nét khi hiển thị trong Obsidian và in ấn báo cáo PDF.
3. **Đính kèm vào tài liệu**:
   - Mọi sơ đồ phải được nhúng trực tiếp vào file Markdown/Obsidian tương ứng:
     ```markdown
     ![[mermaid-diagram.png]]
     hoặc
     ![Sơ đồ kiến trúc Game Engine](assets/diagrams/game-engine-flow.png)
     ```

---

## 2. Trực quan hóa State & Debug Log thành hình ảnh

1. **State Bàn cờ & Heuristic Matrix**:
   - Khi biểu diễn trạng thái bàn cờ 15×15, vùng ô ứng viên (Chebyshev radius $r \le 2$), hoặc ma trận trọng số tấn công/phòng thủ, phải xuất ra hình ảnh đồ họa trực quan (bàn cờ lưới, ô cờ, điểm nhiệt heatmap).
2. **Log Debug & Game Tree Exploration**:
   - Khi phân tích các bước đi của bot, độ sâu tìm kiếm, hoặc các nhánh cắt tỉa Alpha-Beta, kết xuất cấu trúc cây (Game Tree) hoặc bảng log ra dạng đồ họa ảnh `.png` để kẹp vào tài liệu nghiên cứu của tuần tương ứng.

---

## 3. Chạy trực tiếp Python xuất ảnh (.png) chất lượng cao

1. **Mục đích sử dụng**:
   - Dùng script Python thực thi độc lập (sử dụng `matplotlib`, `pillow`, `numpy`) để vẽ các biểu đồ phân tích thực nghiệm và đồ họa trực quan:
     * Biểu đồ tăng trưởng số node duyệt (`nodesVisited`) theo độ sâu $d = 1, 2, 3, 4$.
     * Biểu đồ thời gian tính toán (`searchTimeMs`) so sánh giữa Minimax và Alpha-Beta.
     * Biểu đồ tỷ lệ cắt tỉa (`pruneCount` / cutoff percentage).
     * Biểu đồ tỷ lệ thắng đối đầu Bot-vs-Bot (Win / Draw / Loss).
     * Biểu diễn bàn cờ Caro và các thế cờ mẫu.
2. **Tiêu chuẩn xuất ảnh**:
   - Định dạng: `.png` 300 DPI, nền rõ ràng, nhãn trục và chú giải đầy đủ:
     ```python
     plt.savefig("assets/charts/nodes_visited_comparison.png", dpi=300, bbox_inches="tight")
     ```
3. **Tổ chức script**:
   - Toàn bộ script Python sinh ảnh đặt trong thư mục `scripts/` (ví dụ: `scripts/plot_benchmark.py`, `scripts/render_board.py`).
   - Script phải có tính tái lập (reproducible), có thể chạy lại từ dòng lệnh bất kỳ lúc nào để cập nhật ảnh khi có dữ liệu mới.

---

## 4. Quy ước lưu trữ & Trích dẫn trong Obsidian

1. **Thư mục lưu trữ tài sản riêng**:
   - Không lưu ảnh rời rạc tại thư mục gốc.
   - Toàn bộ ảnh diagrams, charts, debug captures được phân bổ vào các thư mục tài sản:
     * Theo từng tuần: `WeekX/assets/` hoặc `WeekX/` (ví dụ: `Week1/mermaid-diagram (1).png`).
     * Chung toàn dự án: `assets/diagrams/`, `assets/charts/`, `assets/debug/`.
2. **Trích dẫn chuẩn mực**:
   - Mỗi hình ảnh được nhúng trong Obsidian phải có chú thích:
     * Loại bằng chứng: `[A] Source evidence` hoặc `[A] Empirical measurement`.
     * Mô tả nội dung hình ảnh.
     * Nguồn sinh ra: tên script Python hoặc file Mermaid nguồn.
