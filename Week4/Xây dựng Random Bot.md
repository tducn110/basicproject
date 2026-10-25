# XÂY DỰNG RANDOM BOT VÀ BỘ SINH SỐ NGẪU NHIÊN TẤT ĐỊNH (SPLITMIX64) TRONG RUST

---

## 0. Artifacts & Bằng chứng kỹ thuật

- **Mã nguồn Random Bot trong Rust (Source Evidence [A])**:
  - Module Random Bot: [`caro-core-reference/src/bot/random.rs`](file:///home/pro/Downloads/vnuk/basicProject/caro-core-reference/src/bot/random.rs)
  - Bộ sinh số giả ngẫu nhiên `SplitMix64`: [`caro-core-reference/src/bot/random.rs#L7-L23`](file:///home/pro/Downloads/vnuk/basicProject/caro-core-reference/src/bot/random.rs#L7-L23)
  - Hàm chọn nước đi ngẫu nhiên `choose_random_move`: [`caro-core-reference/src/bot/random.rs#L25-L33`](file:///home/pro/Downloads/vnuk/basicProject/caro-core-reference/src/bot/random.rs#L25-L33)
- **Tập số liệu thực nghiệm đối đầu 100 ván (Empirical Evidence [A])**:
  - Dữ liệu thô JSON: [`benchmark/results/week4_bot_battle.json`](file:///home/pro/Downloads/basicproject/benchmark/results/week4_bot_battle.json)
  - Biểu đồ thực nghiệm tỷ lệ thắng đối đầu:
    ![Tỷ lệ thắng 100 ván Bot-vs-Bot](assets/week4_bot_battle_and_pruning.png)
    *(Nguồn: `Week4/assets/week4_bot_battle_and_pruning.png`, trích xuất độ phân giải cao 300 DPI)*

---

## 1. Vai trò trong nghiên cứu khoa học (Academic Research Role)

Trong nghiên cứu thuật toán Trí tuệ Nhân tạo đối kháng, một sai lầm phổ biến là đánh giá thuật toán mới trong môi trường cô lập mà không có **Nhóm Đối chứng Cơ sở (Control Group / Baseline Anchor)**.

Random Bot đóng vai trò là mốc đối chứng tối thiểu (**Level 0 Baseline**):
1. **Kiểm tra Ngưỡng Năng lực Cơ bản (Sanity Check)**: Một thuật toán AI được coi là có tri thức tối thiểu chỉ khi nó đánh bại Random Bot với tỷ lệ thắng áp đảo ($\ge 95\%$). Nếu một thuật toán không thắng được Random Bot, hệ thống đánh giá hoặc logic sinh nước đi của thuật toán đó chắc chắn có khiếm khuyết nghiêm trọng.
2. **Xác minh Tính Đúng đắn của Game Engine**: Vì Random Bot đi hoàn toàn ngẫu nhiên vào bất kỳ ô hợp lệ nào trên bàn cờ, nó đóng vai trò như một bộ **Fuzzing Tester** tự động, kiểm tra các trường hợp biên, các góc bàn cờ, các thế cờ hòa, và xác nhận hàm `play` / `undo` không bao giờ gây lỗi bộ nhớ hoặc panic.
3. **Tính Tái lập Khoa học (Reproducibility Invariant)**: Mọi thí nghiệm liên quan đến yếu tố ngẫu nhiên phải có khả năng tái lập 100% bằng cách cố định giá trị Seed đầu vào.

---

## 2. Đặc tả toán học của Chiến lược Ngẫu nhiên

Xét trạng thái bàn cờ $s \in \mathcal{S}$ với tập hợp các nước đi hợp lệ $\mathcal{A}(s) = \{ (r, c) \mid \text{board}[r, c] == 0 \}$.

Chiến lược ngẫu nhiên đều (Uniform Random Policy) $\pi_{\text{random}}$ được định nghĩa bởi phân phối xác suất rời rạc:
$$\pi_{\text{random}}(a \mid s) = \begin{cases} 
\frac{1}{|\mathcal{A}(s)|} & \text{nếu } a \in \mathcal{A}(s) \\
0 & \text{nếu } a \notin \mathcal{A}(s)
\end{cases}$$

Kỳ vọng số nước đi để một Random Bot tình cờ tạo được chuỗi 5 quân liên tiếp trên bàn cờ $15 \times 15$ mà không bị đối phương ngăn chặn xấp xỉ bằng $0$, do xác suất chọn trúng 5 ô thẳng hàng liên tiếp là:
$$P(\text{5 liên tiếp ngẫu nhiên}) \sim \mathcal{O}\left( \frac{1}{225 \times 224 \times 223 \times 222 \times 221} \right) \approx 1.8 \times 10^{-12}$$

---

## 3. Bộ sinh số giả ngẫu nhiên SplitMix64 độc lập

Để không đưa thêm phụ thuộc bên ngoài (như crate `rand`) vào động cơ lõi Rust, hệ thống cài đặt bộ tạo số ngẫu nhiên cực nhanh **SplitMix64** (Steele et al., 2014) dựa trên phép nhân băm 64-bit và dịch bit XOR:

```rust
/// Bộ PRNG tất định nhỏ gọn bảo đảm tính tái lập thực nghiệm
#[derive(Debug, Clone, Copy)]
pub struct SplitMix64 {
    state: u64,
}

impl SplitMix64 {
    pub const fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    pub fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9E3779B97F4A7C15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
        z ^ (z >> 31)
    }
}
```

*Ưu điểm kỹ thuật:*
- **Zero Dependencies**: Không cần kéo thêm bất kỳ thư viện bên ngoài nào, giữ bundle Rust cực kỳ nhẹ.
- **Tốc độ chu kỳ CPU cực đại**: Chỉ tốn khoảng 3–4 lệnh CPU cho mỗi số 64-bit được sinh ra.
- **Phân phối đồng đều tuyệt đối**: Vượt qua toàn bộ các bài kiểm tra thống kê BigCrush của bộ test Dieharder.

---

## 4. Hiện thực hàm chọn nước đi Random

Trong [`caro-core-reference/src/bot/random.rs`](file:///home/pro/Downloads/vnuk/basicProject/caro-core-reference/src/bot/random.rs#L25-L33):

```rust
pub fn choose_random_move(state: &GameState, seed: u64) -> Option<Move> {
    let moves = state.legal_moves();
    if moves.is_empty() {
        return None;
    }
    let mut rng = SplitMix64::new(seed);
    let index = (rng.next_u64() as usize) % moves.len();
    Some(moves[index])
}
```

---

## 5. Kết quả thực nghiệm đối chứng 100 ván (Empirical Evidence)

Trong thí nghiệm đối đầu 100 ván với Rule-Based Bot ([`benchmark/results/week4_bot_battle.json`](file:///home/pro/Downloads/basicproject/benchmark/results/week4_bot_battle.json)):
- **Tỷ lệ thắng của Random Bot**: **$0 / 100$ ván ($0.0\%$)**.
- **Tỷ lệ thắng của Rule-Based Bot**: **$100 / 100$ ván ($100.0\%$)** (vượt xa chỉ tiêu $> 95\%$ đề ra trong `PLAN.md`).
- **Số nước đi trung bình một ván**: $9.9$ plies (tương đương 5 nước cờ cho mỗi bên).
- *Nhận xét chiến thuật:* Random Bot nhanh chóng bị Rule-Based Bot trừng phạt do không có khả năng nhận biết các nước cờ 3 mở hoặc 4 chặn, dẫn đến việc thua trận chỉ sau từ 4 đến 6 nước đi.
