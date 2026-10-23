# Điều kiện thắng và thuật toán heuristic Rust WASM cho Caro

Ngày đối chiếu: 16 tháng 10 năm 2026. Phạm vi: mã nguồn và artifact local trong `basicProject`, thiết kế thuật toán, quy trình biên dịch và bằng chứng kiểm tra. Tài liệu này bổ sung phần luật và hướng hiện thực còn thiếu trong các báo cáo Week 01 và Week 04.

Cập nhật ngày 17 tháng 10 năm 2026: bổ sung phương pháp toán học xác định thắng ở mục 2.1, gồm mô hình bàn cờ, vị từ thắng, chứng minh tính đúng, độ phức tạp và đối chiếu với source. Các kết quả thực thi ngày 16 tháng 10 tại mục 6 giữ nguyên mốc bằng chứng của chúng.

**Kết luận:** game hiện đã kiểm tra thắng từ năm quân liên tiếp theo bốn hướng, kết thúc trận và hòa khi đầy bàn. Luật đang được nối vào game là Freestyle Gomoku. Những điều kiện như đúng năm quân, sáu quân không thắng, hoặc năm quân bị chặn hai đầu không thắng chưa được đưa vào đường chạy của game. Đây là những biến thể cần chốt thành yêu cầu, không thể mặc nhiên gọi là lỗi của luật Freestyle.

Rust hiện có bộ đánh giá chuỗi liên tiếp và Minimax với Alpha Beta trong `gomoku-main/engine`. Tuy nhiên, chưa nên coi nó là thuật toán Caro hoàn chỉnh: nhận diện thế đứt quãng còn thiếu, giá trị kết thúc trong search chưa tách khỏi heuristic, và luật cần thống nhất giữa game, tactical resolver và Rust. Hướng triển khai dưới đây là đề xuất có thể kiểm thử, không phải thông báo rằng game đã được sửa.

## 1 Bối cảnh và cách đọc bằng chứng

Thư mục gốc được đối chiếu là `/home/pro/Downloads/vnuk/basicProject`. Các đường dẫn ngắn bên dưới đều tương đối với thư mục này.

- **[A] Source evidence:** quan sát được trong mã, artifact hoặc kết quả thực thi ghi trong phần kiểm chứng.
- **[B] Official documentation:** đối chiếu tài liệu chính thức được liên kết ở phần tham khảo.
- **[C] Inference:** suy luận từ bằng chứng; chưa tự động là lỗi được tái hiện trong browser.
- **[D] Recommendation:** thiết kế hoặc kiểm tra cần thực hiện tiếp.

[A] Checkout game `10_caro` đang ở nhánh `main`, HEAD `c1e7447532e4c5ff5590f2c5562dd21cd0acf7b9`. Có sẵn thay đổi App, i18n, tích hợp Wink, xóa `pnpm-lock.yaml` và `package-lock.json` chưa được theo dõi. Báo cáo này không thay đổi chúng. `gomoku-main` và `caro-core-reference` không có Git repository riêng tại vị trí kiểm tra; không gán cho chúng commit của game. Mốc `cb6fd6f` trong báo cáo cũ không phải HEAD hiện tại.

[A] `10_caro/package.json` khai báo React `^19.0.0`, PixiJS `^7.4.2`, TypeScript `^5.7.0`, Vite `^8.0.5`. Đây là các khai báo dependency, không phải bằng chứng tất cả package đã được cài. Không dùng mô tả React 18 hoặc PixiJS v8 trong README cũ làm bằng chứng phiên bản hiện tại.

## 2 Điều kiện thắng hiện có và phần cần chốt

Ký hiệu: `X` là quân đang xét, `O` là đối thủ, `.` là ô trống, `#` là ngoài bàn. Một chuỗi trong bảng là lát cắt theo một trục, không phải toàn bộ lịch sử ván đấu.

| Tình huống | Freestyle đang dùng | Nếu chọn đúng năm và cấm chặn hai đầu |
| --- | --- | --- |
| Năm quân liên tục theo ngang, dọc hoặc hai đường chéo | Thắng | Thắng nếu thỏa điều kiện hai đầu |
| `OXXXXX.` | Thắng | Thắng vì chỉ một đầu bị chặn |
| `OXXXXXO` | Thắng | Không thắng theo cấu hình đề xuất này |
| Sáu quân liên tục | Thắng | Không thắng trên trục đó |
| `#XXXXXO` | Thắng | Phụ thuộc quy định biên có tính là chặn hay không |
| `XXXX.X` trước khi điền khoảng trống | Chưa thắng trên trục này | Chưa thắng trên trục này |
| Lấp khoảng trống của `XXXX.X` để thành sáu quân | Thắng | Không thắng trên trục này |
| Đầy 225 ô và không có thắng hợp lệ | Hòa | Hòa, sau khi đã kiểm tra thắng theo cùng profile |
| Một nước tạo nhiều trục | Thắng nếu bất kỳ trục nào đạt luật | Cần có ít nhất một trục hợp lệ; một trục không hợp lệ không phủ định trục khác |

[A] `10_caro/src/game/core/WinRules.ts` sở hữu `FreestyleGomokuWinRule.evaluate()`: quét bốn trục và kiểm tra `cells.length >= winLength`. `GameController` tạo chính rule này; `PlayMove` gọi rule sau khi commit nước hợp lệ. `GameController.finishMove()` ưu tiên thắng trước rồi kiểm tra hòa đầy bàn. Nước đi sau khi kết thúc bị từ chối.

[A] `TacticalMoveResolver` có phép kiểm tra `count >= 5` riêng. Rust `gomoku-main/engine/src/board.rs` cũng kiểm tra `>= 5`. Các đường này hiện cùng biểu diễn Freestyle nhưng chưa có tham số profile dùng chung. `caro-core-reference/src/rules.rs` đã có `RuleConfig` với `overline_wins`, `blocked_both_ends_disqualifies`, `edge_counts_as_blocked`; đó là thư viện tham chiếu, chưa phải rule đang chạy trong game.

[D] Giữ `FREESTYLE_15_V1` làm mô tả đúng hiện trạng. Nếu đồ án chọn biến thể Caro, tạo cấu hình có phiên bản riêng, chẳng hạn `CARO_EXACT5_BLOCK2_V1`, và chốt rõ `edge_counts_as_blocked`. Tên này là hợp đồng của project; không được trình bày như luật Việt Nam chính thức khi chưa có nguồn xác nhận.

### 2.1 Thuật toán xác định thắng theo nước cuối

Phương pháp là **mô hình bàn cờ rời rạc kết hợp đếm đoạn liên tiếp theo vector phương**. Nó đưa phát biểu “có năm quân thẳng hàng” thành một vị từ Boolean có thể chứng minh và kiểm thử. Chỉ kiểm tra thẳng hàng bằng hệ số góc hoặc định thức là chưa đủ: năm quân có thể thẳng hàng nhưng cách nhau bởi ô trống hoặc quân đối thủ.

#### 2.1.1 Miền tọa độ và trạng thái bàn cờ

Đặt bàn cờ có kích thước $N=15$, số quân cần nối là $k=5$. Miền tọa độ và hàm trạng thái là:

$$
\Omega=\{0,1,\ldots,N-1\}^{2},\qquad
B:\Omega\longrightarrow\{\varnothing,X,O\}.
$$

Trong đó $\varnothing$ là ô trống. Dùng thứ tự tọa độ **hàng rồi cột**: $m=(r,c)$. Sau khi commit nước hợp lệ cuối cùng, $p=B(m)\in\{X,O\}$ là người vừa đánh. Ký hiệu này không ép buffer Rust và TypeScript dùng chung encoding số.

Bốn vector phương cần kiểm tra là:

$$
D=\{(0,1),(1,0),(1,1),(1,-1)\}.
$$

Chúng lần lượt biểu diễn ngang, dọc, chéo chính và chéo phụ. Với $d=(d_r,d_c)$, ô cách $i$ bước là $m+i d=(r+i d_r,c+i d_c)$. Mỗi trục có hai chiều $+d$ và $-d$; do đó bốn trục bao phủ tám hướng quét.

[A] `BoardBounds.ts` sở hữu miền $0\ldots14$. `GameState.get()` đọc quân tại một tọa độ. `PlayMove.playMove()` kiểm tra nước hợp lệ, commit đúng một ô rồi gọi `WinRule.evaluate()` tại chính ô đó. Đây là các tiền điều kiện của mô hình, không phải điều kiện được suy ra từ hình vẽ UI.

#### 2.1.2 Định nghĩa đoạn liên tiếp và vị từ thắng

Đếm số quân cùng màu liên tiếp về hai phía, dừng ngay ở ô trống, quân đối thủ hoặc ngoài miền:

$$
a_d^{+}=\max\{t\in\mathbb N_0:\ \forall i\in\{1,\ldots,t\},\quad
m+i d\in\Omega\ \land\ B(m+i d)=p\},
$$

$$
a_d^{-}=\max\{t\in\mathbb N_0:\ \forall i\in\{1,\ldots,t\},\quad
m-i d\in\Omega\ \land\ B(m-i d)=p\}.
$$

Giá trị $t=0$ luôn hợp lệ khi phía đó không có quân nối tiếp. Độ dài **đoạn liên tiếp cực đại đi qua nước cuối** trên trục $d$ là:

$$
L_d=1+a_d^{+}+a_d^{-}.
$$

Số $1$ là quân vừa đặt. Với luật Freestyle đang chạy, điều kiện cần và đủ là:

$$
\boxed{\operatorname{Win}_{F}(B,m,p)
\iff\exists d\in D:\ L_d\ge k.}
$$

Không cộng số quân giữa các trục: ba quân ngang và hai quân dọc không tạo thành một chuỗi năm. Dấu tồn tại $\exists$ có nghĩa chỉ cần **một trục** thỏa luật.

Một định nghĩa toàn bàn tương đương cho Freestyle là tồn tại một cửa sổ gồm $k$ ô liên tiếp cùng màu:

$$
\operatorname{GlobalWin}_{F}(B,p)
\iff\exists q\in\Omega,\ d\in D:\quad
\forall j\in\{0,\ldots,k-1\},\quad
q+j d\in\Omega\ \land\ B(q+j d)=p.
$$

Công thức cửa sổ này chấp nhận cả chuỗi sáu vì bên trong có cửa sổ năm. Vì vậy nó không tự biểu diễn luật đúng năm; luật đó phải xét đoạn cực đại hoặc kiểm tra thêm hai ô ngoài cửa sổ.

#### 2.1.3 Quy đổi sang luật đúng năm và điều kiện hai đầu

[B] Gomocup phân biệt Freestyle là năm quân trở lên, Standard là đúng năm, và Caro là đúng năm không bị chặn hai đầu. Trang luật không đủ để tự suy ra mọi quy ước biên cho cấu hình của project. [Nguồn luật Gomocup](https://gomocup.org/detail-information/).

Đặt $o$ là `overline_wins`, $h$ là `blocked_both_ends_disqualifies`, và $e$ là `edge_counts_as_blocked`. Hai ô ngay ngoài đoạn cực đại là:

$$
u_d^{+}=m+(a_d^{+}+1)d,\qquad
u_d^{-}=m-(a_d^{-}+1)d.
$$

Định nghĩa chỉ báo bị chặn; trong công thức số học, $e=1$ khi tính biên là chặn và $e=0$ khi không tính:

$$
b_e(u)=
\begin{cases}
1,&u\in\Omega\ \land\ B(u)=\operatorname{opponent}(p),\\
0,&u\in\Omega\ \land\ B(u)=\varnothing,\\
e,&u\notin\Omega.
\end{cases}
$$

Ô cùng màu không thể là đầu ngoài của một đoạn cực đại. Số đầu bị chặn là $C_d=b_e(u_d^{+})+b_e(u_d^{-})$. Vị từ theo cấu hình $R=(k,o,h,e)$ là:

$$
\operatorname{LengthOK}_{R}(L)=
\begin{cases}
L\ge k,&o=\mathrm{true},\\
L=k,&o=\mathrm{false},
\end{cases}
$$

$$
\boxed{\operatorname{Win}_{R}(B,m,p)
\iff\exists d\in D:\quad
\operatorname{LengthOK}_{R}(L_d)
\land(\neg h\ \lor\ C_d<2).}
$$

[A] `caro-core-reference/src/rules.rs` hiện thực cấu trúc này bằng `scan_axis()` và `line_is_win()`. Game TypeScript hiện chỉ dùng trường hợp $k=5,o=\mathrm{true},h=\mathrm{false}$; hai đầu không ảnh hưởng kết quả. Công thức tổng quát mô tả khả năng của reference core, chưa phải lựa chọn luật đã nối vào game.

#### 2.1.4 Chứng minh tính đúng của phép kiểm tra theo nước cuối

[C] **Giả thiết:** trạng thái trước nước $m$ hợp lệ, chưa kết thúc; nước mới chỉ thêm quân $p$ tại một ô trống. Các lượt sau một kết quả thắng phải bị từ chối. Trong phạm vi đó:

1. **Chỉ cần xét đường qua $m$.** Mọi đường không chứa $m$ giữ nguyên trạng thái từng ô. Nó không thể trở thành đường thắng mới. Mọi đường thắng mới vì vậy phải đi qua $m$.
2. **Bốn trục là đủ.** Luật chỉ chấp nhận ngang, dọc và hai đường chéo. Chúng đúng bằng các trục trong $D$; hai dấu bao phủ cả hai phía.
3. **Phép đếm cho đúng đoạn cực đại.** Sau $t$ bước thành công, tất cả $t$ ô đã duyệt đều nằm trong miền, cùng màu và kề nhau từng bước. Đó là bất biến vòng lặp. Bước đầu tiên thất bại kết thúc đoạn; không được bỏ qua khoảng trống để đếm tiếp.
4. **Không báo thắng sai.** Nếu một trục được chấp nhận, các ô từ $m-a_d^{-}d$ đến $m+a_d^{+}d$ thực sự là một đoạn liên tiếp thỏa độ dài và, khi cần, điều kiện hai đầu.
5. **Không bỏ sót thắng mới.** Một đường thắng mới phải đi qua $m$ theo bước 1, nằm trên một trục đã xét theo bước 2 và được đếm đủ theo bước 3. Vị từ sẽ chấp nhận trục đó.

Như vậy phép kiểm tra vừa có tính đúng khi báo thắng, vừa có tính đầy đủ đối với mọi đường thắng mới dưới các giả thiết trên. Nó không phải bộ xác minh toàn bàn cho state nhập tùy ý: một đường thắng có sẵn ở nơi khác có thể không đi qua tọa độ được truyền vào.

#### 2.1.5 Vì sao code chỉ quét bốn ô mỗi phía vẫn đúng

[A] `FreestyleGomokuWinRule.collect()` giới hạn `step < winLength`. Với $k=5$, giá trị mà code thực sự thu được là:

$$
\widehat L_d=1+\min(a_d^{+},k-1)+\min(a_d^{-},k-1).
$$

[C] Với mọi $a,b\ge0$ và $k\ge1$:

$$
1+\min(a,k-1)+\min(b,k-1)\ge k
\iff 1+a+b\ge k.
$$

Chiều thuận đúng vì phép cắt không làm tăng tổng. Ở chiều ngược, nếu một phía có ít nhất $k-1$ quân thì riêng phía đó cùng quân gốc đã đủ $k$; nếu cả hai phía ngắn hơn $k-1$ thì không phía nào bị cắt. Đây là lý do giới hạn hiện tại giữ nguyên kết quả Boolean của Freestyle.

Phép tương đương trên **không đúng khi thay $\ge k$ bằng $=k$**. Phản ví dụ: $a=0,b=5,k=5$ cho độ dài thật $6$, nhưng độ dài bị cắt chỉ là $5$. Muốn hỗ trợ đúng năm, scanner phải phát hiện overline; muốn xét chặn hai đầu, còn phải đọc đúng hai ô ngoài đoạn cực đại. Không dùng độ dài đã cắt hoặc đầu mút của nó làm bằng chứng cho các điều kiện đó.

Danh sách `cells` hiện trả về tối đa $2k-1=9$ ô và trục thắng đầu tiên tìm được; nó không được bảo đảm là toàn bộ đoạn cực đại hoặc chỉ đúng năm ô. Kết quả Boolean vẫn đúng theo chứng minh trên.

#### 2.1.6 Ví dụ thay số và trạng thái hòa

Trong bảng, dấu ngoặc vuông chỉ quân vừa đặt; `.` là trống, `O` là đối thủ. Hai số đếm được ghi theo phía trái và phải của lát cắt để dễ đọc; đổi dấu vector chỉ hoán đổi chúng.

| Lát cắt sau nước cuối | Hai số đếm | Độ dài thật | Freestyle | Đúng năm và cấm chặn hai đầu |
| --- | --- | --- | --- | --- |
| `.XX[X]XX.` | $2,2$ | $1+2+2=5$ | Thắng | Thắng |
| `.XXX[X].` | $3,0$ | $1+3+0=4$ | Chưa thắng | Chưa thắng |
| `OXX[X]XXO` | $2,2$ | $5$, $C_d=2$ | Thắng | Không thắng trên trục này |
| `.XXXX[X]X.` | $4,1$ | $1+4+1=6$ | Thắng | Không thắng trên trục này |
| `.[X]XXXXX.` | $0,5$ | $6$ nhưng $\widehat L_d=5$ | Thắng | Không được dùng số bị cắt để kết luận |
| `.XX.[X]X.` | $0,1$ | $1+0+1=2$ | Chưa thắng trên trục này | Chưa thắng trên trục này |

Đây là fixture toán học của một trục. Khi kiểm tra qua API ván đấu, lịch sử vẫn phải luân phiên hợp lệ và không thắng trước nước cuối; không tạo overline bằng cách chơi tiếp sau một lượt đã thắng. Ví dụ `.XXXX[X]X.` có thể tạo bằng cách điền khoảng trống giữa nhóm bốn và một quân.

Với $n$ ô đã có quân và tiền điều kiện ván hợp lệ chưa kết thúc ở lượt trước:

$$
\operatorname{Result}(B,m,p)=
\begin{cases}
\operatorname{Won}(p),&\operatorname{Win}_{R}(B,m,p),\\
\operatorname{Draw},&\neg\operatorname{Win}_{R}(B,m,p)\land n=N^2,\\
\operatorname{Playing},&\text{các trường hợp còn lại}.
\end{cases}
$$

[A] `GameController.finishMove()` thực hiện đúng thứ tự thắng trước, hòa sau. Nếu nước thứ 225 đồng thời tạo thắng thì kết quả là thắng. Công thức hòa đầy bàn ở đây dành cho các profile không có nước cấm hoặc quyền bỏ lượt.

#### 2.1.7 Độ phức tạp và ánh xạ sang source

Với truy cập ô được coi là $O(1)$, bản quét giới hạn có tối đa $4\times2\times(k-1)=8(k-1)$ lần so sánh ô lân cận. Do đó thời gian là $O(k)$, hay $O(1)$ khi cố định $k=5$; khi đó xét tối đa 32 ô lân cận. Đây không phải số lần gọi `state.get()`: source hiện còn đọc lại ô gốc trong mỗi phép so sánh.

Code TypeScript giữ danh sách ô nên bộ nhớ phụ là $O(k)$. Một bản chỉ trả Boolean có thể dùng $O(1)$ bộ nhớ. Bản Rust `scan_axis()` quét hết đoạn trên bốn trục dài tối đa $N$, nên thời gian là $O(N)$ và bộ nhớ phụ $O(1)$. Quét mọi cửa sổ dài $k$ trên toàn bàn tốn $O(N^2k)$, hay $O(N^2)$ với $k$ cố định. Các bậc này là phân tích số phép toán, không phải số đo microsecond hoặc benchmark.

| File và symbol | Trách nhiệm | Đại lượng toán học hoặc hành vi được đối chiếu |
| --- | --- | --- |
| `10_caro/src/game/core/BoardBounds.ts` — `BOARD_SIZE`, `isBoardCell` | Miền bàn cờ | $N=15$, $\Omega$ |
| `10_caro/src/game/core/GameState.ts` — `get`, `commitMove` | Board và lịch sử | $B$, commit nước $m$ |
| `10_caro/src/game/behaviors/move/PlayMove.ts` — `playMove` | Nước đi hợp lệ rồi kiểm tra thắng | Tiền điều kiện và lời gọi sau commit |
| `10_caro/src/game/core/WinRules.ts` — `evaluate`, `collect` | Luật thắng đang chạy | $D$, $\widehat L_d$, tồn tại trục có $\widehat L_d\ge5$ |
| `10_caro/src/app/GameController.ts` — `finishMove` | Kết quả trận | Ưu tiên thắng, sau đó hòa đầy bàn |
| `caro-core-reference/src/rules.rs` — `scan_axis`, `line_is_win` | Luật cấu hình của reference core | $L_d$, $C_d$, $\operatorname{LengthOK}_R$ |

Các quan sát source trong bảng có mức tự tin High. Chứng minh là suy luận [C] từ định nghĩa và source; nó không tự tạo thêm bằng chứng kiểm thử browser, WASM hoặc tương đương giữa hai engine.

#### 2.1.8 Phân biệt đã thắng và có chiến lược buộc thắng

Vị từ ở trên trả lời **bàn cờ đã thắng sau nước vừa đi hay chưa**. Nếu câu hỏi là AI có thể buộc thắng từ một state chưa kết thúc hay không, cần bài toán trên cây trò chơi. Với state đầy đủ $s$ gồm board, bên tới lượt và profile, đặt $W_p(s)$ là “người $p$ có chiến lược bảo đảm thắng”:

$$
W_p(s)=
\begin{cases}
\mathrm{true},&s\text{ đã kết thúc và winner}=p,\\
\mathrm{false},&s\text{ đã kết thúc với hòa hoặc đối thủ thắng},\\
\displaystyle\bigvee_{a\in A(s)}W_p(T(s,a)),&s\text{ chưa kết thúc},\ \operatorname{turn}(s)=p,\\
\displaystyle\bigwedge_{a\in A(s)}W_p(T(s,a)),&s\text{ chưa kết thúc},\ \operatorname{turn}(s)\ne p.
\end{cases}
$$

Ở đây $A(s)$ là toàn bộ nước hợp lệ và $T(s,a)$ là state sau nước $a$. Ở lượt mình cần tồn tại một cách thắng; ở lượt đối thủ phải thắng trước mọi phản ứng hợp lệ. Trên bàn hữu hạn chỉ thêm quân và dừng ở terminal, đệ quy kết thúc. Tuy nhiên, search bị giới hạn độ sâu và trả heuristic ở lá chưa kết thúc không tự chứng minh $W_p(s)$; cắt bớt candidate cũng có thể bỏ mất phản ứng cần xét. Phần này là định nghĩa toán học [C], không phải tuyên bố game đã có bộ chứng minh chiến lược thắng.

#### 2.1.9 Kiểm chứng công thức và source ngày 17 tháng 10 năm 2026

[A] Đã chạy probe trực tiếp bằng `node --input-type=module` trên Node `22.23.3`. Probe đọc `GameState.ts` và `WinRules.ts`, dùng `node:module.stripTypeScriptTypes` ở chế độ `transform`, rồi import mã đã chuyển trong bộ nhớ. Không thay source game hoặc cài dependency. Node phát cảnh báo API chuyển TypeScript còn experimental; tiến trình kết thúc với exit code 0.

- **3 375 tổ hợp đạt:** kiểm tra tương đương giữa $1+\min(a,k-1)+\min(b,k-1)\ge k$ và $1+a+b\ge k$ với $k=1\ldots15$, $a,b=0\ldots14$.
- **54 288 fixture đạt:** đối chiếu Boolean và winner của source với oracle độc lập xét từng cửa sổ năm ô liên tiếp **chứa tọa độ đang kiểm tra**. Gồm $3^8\times4\times2=52\,488$ cách gán trống/X/O cho tám ô lân cận trên từng trục và cả hai người; thêm 1 800 fixture đoạn kéo dài tới biên trên bốn trục, xét mọi vị trí gốc và cả hai người. Oracle không dùng phép cộng số đếm hai phía.
- **Ô gốc trống đạt:** source trả `null`.

Đây là fixture trực tiếp của hàm luật, có cả state tổng hợp, không phải 54 288 lịch sử ván đấu hợp lệ. Kết quả hỗ trợ phép đếm Freestyle và ánh xạ source; không kiểm tra tích hợp controller, browser, Worker, binary WASM, profile đúng năm/chặn hai đầu, hoặc bộ chứng minh chiến lược buộc thắng. Không chạy lại các suite hoặc benchmark lịch sử ở mục 6 trong cập nhật tài liệu này.

### 2.2 Fixture tối thiểu cho luật

[D] Corpus chung cần có bốn hướng thắng; bốn quân chưa thắng; năm quân; overline tạo bằng cách điền một khoảng trống; chặn không đầu, một đầu, hai đầu; biên/góc với hai cách cấu hình biên; nhiều trục; hòa; và nước sau kết thúc. `OXXXXO` chỉ có bốn quân X nên không phải fixture cho năm quân bị chặn hai đầu; fixture đúng là `OXXXXXO`.

Fixture qua API ván đấu phải dùng lịch sử luân phiên hợp lệ và không tạo thắng trước nước cần kiểm tra. Ví dụ overline không nên được tạo bằng cách chơi tiếp sau khi đã có năm quân thắng trong Freestyle. Với một nước có nhiều đường thắng, so sánh winner và tính hợp lệ của đường được trả về; chỉ so sánh chính xác danh sách ô nếu thứ tự chọn trục cũng thuộc contract.

## 3 Heuristic thực sự đang có trong Rust

[A] `gomoku-main/engine/src/eval.rs` duyệt từng quân và bốn hướng. Nếu ô phía trước cùng màu thì bỏ qua, nhờ đó một đoạn liên tục cực đại chỉ được chấm một lần trên một trục. Bộ đếm lấy độ dài đoạn và số đầu trống. Đoạn ở biên không được xem là có đầu trống tại phía ngoài bàn. Đây là nhận diện chuỗi liên tiếp, chưa phải bộ nhận diện mọi mẫu có khoảng trống ở giữa.

| Mẫu liên tiếp | Gomoku engine hiện tại | Reference core hiện tại |
| --- | --- | --- |
| Năm quân trở lên | 1 000 000 | 1 000 000 |
| Bốn quân hai đầu trống | 50 000 | 100 000 |
| Bốn quân một đầu trống | 5 000 | 20 000 |
| Ba quân hai đầu trống | 5 000 | 5 000 |
| Ba quân một đầu trống | 500 | 500 |
| Hai quân hai đầu trống | 200 | 100 |
| Hai quân một đầu trống | 50 | 10 |

[A] Với gomoku engine, giá trị bàn là tổng điểm mẫu của bên đang xét trừ tổng điểm mẫu đối thủ, cộng chênh lệch điểm trung tâm. Mỗi quân có điểm trung tâm `max(14 - abs(x-7) - abs(y-7), 0)`, được cộng cho quân mình và trừ cho quân đối thủ. Hệ số phòng thủ của phép tổng hợp này là 1. `quick_score()` trong `ai.rs` là heuristic khác, dùng để sắp xếp và cắt candidate; không lấy trọng số của nó thay cho `evaluate()`.

Ví dụ có thể tính lại từ source: bàn chỉ có ba quân Black tại `(x,y) = (5,7), (6,7), (7,7)`, hai đầu còn trống. Điểm cho Black là `5 000 + 12 + 13 + 14 = 5 039`. Đây là giá trị suy ra từ công thức hiện tại, không phải kết quả benchmark hoặc xác suất thắng.

[A] Reference core dùng `EvalWeights` tại `caro-core-reference/src/evaluator.rs`, với `defense_num = 1`, `defense_den = 1` và không có center bonus. Terminal evaluator của thư viện này trả thắng/thua `±10 000 000`, hòa `0`. Vì vậy công thức với hệ số `1.15` và bảng điểm trong Week 04 cũ không phải mô tả chính xác mặc định của một trong hai implementation.

### 3.1 Phần nhận diện và chấm điểm còn thiếu

[C] Các thế như `XX.XX`, `XXX.X`, `X.XXX`, `.XX.X.` hoặc `.X.X.X.` không được nhận diện thành một loại broken pattern riêng bởi bộ đếm đoạn liên tục hiện tại. Chúng có thể nhận điểm từ những đoạn con; điều đó khác với việc xác định đúng ô tạo thắng hoặc số nước hoàn tất. Không thể gọi `.XXXX.` là thắng chắc trong mọi state: đối thủ có thể đang có nước thắng ngay ở nơi khác, hoặc profile có điều kiện khác.

[D] Mẫu cần lưu thêm danh sách ô hoàn tất hợp lệ. Một broken four chỉ là immediate threat nếu điền ô trống tạo thắng theo profile; một open three chỉ được gán khả năng phát triển cụ thể khi các bước nối tiếp đã được kiểm tra. Có thể dùng cửa sổ dài 5, 6 hoặc 7 cùng sentinel biên, nhưng độ dài và taxonomy phải theo profile đã chốt. Quét bốn trục, ghi nhận theo khóa `(player, axis, occupied_cells, completion_cells)` đã chuẩn hóa để tránh đếm một threat nhiều lần do cửa sổ trượt hoặc phép đảo chiều.

[D] Tách ba tầng: terminal result theo luật; tactical facts như win-in-one và tập nước chặn; heuristic cho state chưa kết thúc. Chọn trọng số bằng cấu hình có phiên bản, không dùng trọng số để thay việc xác định thắng. Hệ số phòng thủ `115/100` chỉ là cấu hình thí nghiệm cần ablation và holdout corpus; chưa có bằng chứng rằng nó tự ngăn mọi sai lầm phòng thủ.

## 4 Thiết kế thuật toán Rust cần xây dựng

### 4.1 Trình tự chọn nước

1. Xác minh state, lượt, profile và terminal result. State kết thúc trả không có nước đi.
2. Tìm mọi nước thắng ngay theo cùng profile; có thì chọn một nước hợp lệ theo tie break xác định.
3. Tìm mọi nước thắng ngay của đối thủ. Nếu có, chỉ giữ các nước phản ứng khiến đối thủ không còn thắng ngay, trừ trường hợp mình thắng luôn. Một nước chặn đơn lẻ không giải được mọi double threat.
4. Sinh candidate gần quân đã có, hợp thêm tập nước chiến thuật bắt buộc. Bàn trống dùng tâm làm opening policy đã công bố.
5. Sắp xếp theo tactical priority và heuristic. Áp dụng giới hạn candidate sau khi bảo toàn các nước bắt buộc; không cắt trước khiến nước thắng hoặc chặn bị loại.
6. Với bot heuristic, thử từng candidate một ply và chọn giá trị tốt nhất. Với bot search, dùng cùng evaluator và candidate policy trong Minimax, rồi thêm Alpha Beta giữ nguyên semantics trên cùng tập nước.
7. Apply và undo phải khôi phục board, lượt, terminal status, history, hash và cache thuộc state. Trả move, score, profile/build identity và counter thật.

[A] Đường game hiện tại đã có bước ưu tiên thắng ngay rồi chặn qua TypeScript tactical resolver. Rust `best_move()` cũng có kiểm tra thắng ngay nhưng thực hiện sau khi root candidate có thể đã bị cắt. Không được suy ra một tactical pre-pass một ply đã bảo đảm tính đúng của mọi nhánh sâu trong cây.

[A] Cấu hình Rust hiện tại là: Easy depth 1, root radius 1, không cap, noise ±5 000; Medium depth 2, radius 2, không cap, noise ±800; Hard depth 4/cap 15; Expert depth 6/cap 10; Master depth 8/cap 8. Ba mức sau có radius 2 và noise 0. Các nhánh sâu sinh candidate radius 2. Chưa có iterative deepening theo deadline, TT, Zobrist hoặc counter node trong engine này; các module tương ứng ở reference core không chứng minh chúng đang chạy trong game. Easy có noise không đồng nghĩa chọn ngẫu nhiên đều, và Medium không phải một bot chỉ dùng luật.

### 4.2 Giá trị kết thúc phải tách khỏi heuristic

[A] `gomoku-main/engine/src/ai.rs::minimax()` hiện gom ba điều kiện winner, depth bằng không và bàn đầy vào cùng nhánh trả `evaluate(board, ai_player)`. Vì evaluator cộng điểm mẫu và vị trí, code này chưa biểu diễn riêng hòa bằng 0 hoặc mate utility tuyệt đối. Đây là khoảng trống được xác định ở source; chưa khẳng định đã tái hiện một nước sai do nó trong browser.

[D] Thứ tự leaf evaluation cần là: thắng → `MATE - ply`; thua → `-MATE + ply`; hòa → `0`; chỉ khi chưa terminal và hết độ sâu mới trả heuristic. Ví dụ dùng `MATE = 1_000_000_000`, giới hạn `abs(nonterminal_score) <= 100_000_000`, và `ply <= 225`. Tính tổng trung gian bằng `i64`, kiểm tra overflow và clamp trước khi về kiểu score của search. Các giá trị này là lựa chọn thiết kế, chưa phải hằng số đang dùng trong game.

Khoảng cách giữa heuristic và mate phải lớn hơn độ sâu tối đa để mate xa vẫn được ưu tiên. Reference core hiện clamp tới `MATE_SCORE - 1` nhưng search trừ `ply`; do đó không nên dùng riêng phép clamp đó làm chứng minh đầy đủ cho ưu tiên mate ở mọi độ sâu. Đây là proof obligation cần kiểm thử bằng điểm sát giới hạn.

Ví dụ Rust dưới đây minh họa riêng trách nhiệm terminal scoring với các kiểu của reference core. Đây là code thiết kế trong tài liệu, chưa được ghép vào source hoặc tính là một lần kiểm thử snippet:

```rust
use crate::model::{GameStatus, Player};

pub const MATE: i32 = 1_000_000_000;
pub const HEURISTIC_LIMIT: i32 = 100_000_000;

pub fn terminal_utility(
    status: GameStatus,
    perspective: Player,
    ply: u16,
) -> Option<i32> {
    let distance = i32::from(ply.min(225));
    match status {
        GameStatus::Won(winner) if winner == perspective => {
            Some(MATE - distance)
        }
        GameStatus::Won(_) => Some(-MATE + distance),
        GameStatus::Draw => Some(0),
        GameStatus::Playing => None,
    }
}
```

Caller chỉ dùng heuristic đã clamp vào `±HEURISTIC_LIMIT` khi hàm này trả `None` và đạt cutoff. Cách chia này đặt luật ở `rules`, trạng thái ở `state`, điểm nonterminal ở `evaluator`, còn thứ tự terminal/cutoff và cộng trừ khoảng cách mate ở `search`; không đặt rule mới trong component React.

Nếu dùng hệ số phòng thủ khác 1, evaluator theo hai perspective có thể không còn đối xứng đổi dấu. Khi đó giữ Minimax với một perspective AI cố định, hoặc thiết kế lại hợp đồng điểm trước khi chuyển sang Negamax. Không thay tên thuật toán rồi mặc nhiên áp dụng phép đổi dấu.

### 4.3 Quyền sở hữu state và ranh giới WASM

[A] Luồng hiện tại là `GameController → AIController → TacticalMoveResolver → GomokuWasmEngine → worker.ts → Game.ai_move()`. Tactical result có thể kết thúc yêu cầu trước WASM. Worker replay lịch sử vào một `Game` Rust mới, gọi AI rồi đổi `x = col`, `y = row` sang tọa độ TypeScript. `GameController` vẫn sở hữu commit kết quả và trạng thái trận hiển thị; Rust trong worker giữ bản sao để tính toán. Reference core chưa được nối trực tiếp vào luồng này.

[D] Giữ render, input và lifecycle ở TypeScript; để một lần gọi Rust thực hiện trọn search và evaluation. Dữ liệu qua boundary cần xác định board 225 ô, encoding quân, lượt, history hoặc snapshot, profile/version và cấu hình search. Reference dùng `X=1`, `O=-1`, empty `0`; gomoku engine dùng empty `0`, black `1`, white `2`. Adapter phải ánh xạ tường minh, không sao chép thẳng hai buffer như cùng encoding.

[D] Với biến thể luật mới, profile phải đi xuyên game rule, tactical resolver, worker hydration, Rust terminal, pattern classification và fixture oracle. Nếu đổi profile, phải đồng bộ quy tắc trạng thái và mọi cache/TT sử dụng nó. Phần thay đổi này cần một implementation task riêng; tài liệu không giả định nó đã có.

## 5 Biên dịch Rust thành WASM

### 5.1 Crate và công cụ đúng với project

[A] Crate đã có binding là `gomoku-main/engine/Cargo.toml`: Rust edition 2024, `crate-type = ["cdylib", "rlib"]`, dependency `wasm-bindgen`, `serde`, `serde-wasm-bindgen` và `js-sys` cho wasm32. `src/lib.rs` export `#[wasm_bindgen] pub struct Game` cùng các method `play_move`, `ai_move`, `get_board`, `get_winner`, `is_draw`, `undo`, `reset`.

[A] `caro-core-reference/Cargo.toml` hiện chỉ có `rlib`, không có dependency WASM và không có export `wasm-bindgen`. Không chạy `wasm-pack build` trên thư viện đó rồi coi như đã có API trình duyệt. Muốn dùng reference core phải thêm crate adapter có `cdylib` và binding, hoặc chủ động tích hợp core vào crate WASM; đây là thiết kế đề xuất.

[A] Công cụ được tìm thấy tại `/home/pro/.cargo/bin`, dù shell mặc định không đưa thư mục này vào PATH: Rust `1.98.1`, Cargo `1.98.1`, wasm-pack `0.15.0`; target `wasm32-unknown-unknown` đã được cài. Bun `1.4.3` nằm tại `/home/pro/.bun/bin/bun`.

### 5.2 Các bước build

[B] Target `wasm32-unknown-unknown` dùng cho Rust WASM trong môi trường JavaScript; API hệ điều hành như filesystem hoặc tạo thread chuẩn không mặc nhiên hoạt động trên target này. `wasm-pack build` tạo cả binary và lớp JavaScript tương tác; `--target web` xuất ES module cần được khởi tạo trước khi gọi. Xem nguồn chính thức ở phần 8.

Đưa công cụ đã có vào PATH và kiểm tra phiên bản:

```bash
export PATH="/home/pro/.cargo/bin:/home/pro/.bun/bin:$PATH"
PROJECT_DIR=/home/pro/Downloads/vnuk/basicProject
rustc --version
cargo --version
wasm-pack --version
rustup target list --installed
```

Trên máy mới, cài toolchain theo hướng dẫn Rust chính thức; chỉ khi target hoặc wasm-pack chưa có mới thực hiện các bước cài tương ứng. Lệnh sau là hướng dẫn thiết lập, không phải các thao tác cài đã được thực hiện trong lần review:

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
```

Kiểm tra Rust và build vào thư mục tạm để không thay artifact game:

```bash
AUDIT_DIR=$(mktemp -d /tmp/caro-doc-build.XXXXXX)
CARGO_TARGET_DIR="$AUDIT_DIR/reference-native" cargo test \
  --locked --offline \
  --manifest-path "$PROJECT_DIR/caro-core-reference/Cargo.toml"
CARGO_TARGET_DIR="$AUDIT_DIR/engine-native" cargo test \
  --locked --offline \
  --manifest-path "$PROJECT_DIR/gomoku-main/engine/Cargo.toml"
CARGO_TARGET_DIR="$AUDIT_DIR/wasm-target" wasm-pack build \
  "$PROJECT_DIR/gomoku-main/engine" --target web --release \
  --out-dir "$AUDIT_DIR/pkg" -- --locked --offline
```

`--offline` yêu cầu Cargo dependencies đã có trong cache; máy mới cần fetch dependency trước. wasm-pack cũng cần binding tool đúng phiên bản và công cụ tối ưu đã có hoặc được tải theo cơ chế của nó; Cargo offline không phải cam kết toàn bộ wrapper không dùng mạng. Giữ `Cargo.lock`, lưu phiên bản rustc/wasm-pack và build log để tái lập. Profile release hiện có `opt-level = "z"`, `lto = true`: đây là lựa chọn ưu tiên kích thước, chưa có benchmark để gọi là cấu hình nhanh nhất.

Đầu ra cần kiểm tra gồm `gomoku_engine.js`, `gomoku_engine.d.ts`, `gomoku_engine_bg.wasm`, `gomoku_engine_bg.wasm.d.ts` và `package.json`. `cargo build --target wasm32-unknown-unknown --release` riêng lẻ chưa tạo đầy đủ gói JS binding tương đương wasm-pack.

### 5.3 Đưa artifact vào ứng dụng sau khi qua gate

[A] Script có sẵn trong `gomoku-main/package.json` là `wasm-pack build engine/ --target web --out-dir ../web/src/wasm/engine`. Script này sinh package cho frontend của `gomoku-main`; nó không tự cập nhật `10_caro/src/game/wasm/engine`.

[D] Sau khi fixture parity và kiểm tra package mới đã qua, chuyển đồng bộ JS, declaration, binary và metadata của cùng một build vào đường dẫn mà game import. Không thay riêng `.wasm` và giữ JS binding cũ. Với game này, `worker.ts` đã import `init, { Game }` và đợi `init()`; không cần thêm một lớp thuật toán mới vào React.

Kiểm tra tích hợp khi dependency của game đã được cài: `npm run test`, `npm run typecheck`, `npm run build` trong `10_caro`; sau đó chạy browser để kiểm tra load WASM, tọa độ, thắng/hòa, reset/undo và loại bỏ kết quả AI đã cũ. Đây là gate đề xuất, chưa tự động là những lệnh đã chạy trong lần review. Không có bước copy artifact, cài package hoặc deploy game trong cập nhật tài liệu này.

## 6 Bằng chứng kiểm tra và giới hạn

### 6.1 TypeScript core và controller

[A] Probe dùng Node `22.23.3`, `node:module.stripTypeScriptTypes` để thực thi source TypeScript trong bộ nhớ, không thêm dependency hay file test vào repo. Cả bốn hướng năm quân đều trả winner X; sáu quân và năm quân bị chặn hai đầu cũng trả X, phù hợp Freestyle. Tactical resolver chặn một immediate threat và ưu tiên thắng ngay của O khi cả hai bên đều có cơ hội thắng.

[A] Probe controller dùng AI service giả cho luồng 1v1: chín nước luân phiên tạo X ngang năm → `game-over`, winner X; nước sau bị từ chối `match-ended`. Với đủ 225 nước theo coloring `X iff (row + 2*col) % 4 < 2`, không có năm quân, controller trả `winner = null`, `isDraw = true`, `game-over`; nước sau cũng bị từ chối. Đây là thực thi local của core/controller, không phải kiểm tra browser hoặc Worker thật.

### 6.2 Artifact WASM đang có

[A] Hai bản `gomoku_engine_bg.wasm` trong `gomoku-main/web/src/wasm/engine` và `10_caro/src/game/wasm/engine` có cùng kích thước 48 549 byte và SHA256:

```text
51cc2fa5c2b1b7edf7406e032cf9b5385e5d3419085c3e893b954c41823cf6f0
```

JS wrapper và declaration của hai package cũng giống nhau tại thời điểm đối chiếu. Khởi tạo artifact có sẵn bằng Node `initSync` xác nhận: năm quân bị chặn hai đầu vẫn thắng; điền khoảng trống tạo sáu quân cũng thắng; `play_move` sau thắng bị từ chối. Đây là bằng chứng hành vi của binary cũ, không chứng minh nó được build từ source Rust hiện tại.

### 6.3 Native tests và build WASM mới

[A] Các lệnh ở phần 5.2 đã được chạy với cùng flags, đường dẫn tool tuyệt đối và thư mục kết quả `/tmp/caro-doc-rust-audit.tUxYFB`. `CARGO_TARGET_DIR` tương ứng là `reference-native`, `engine-native` và `engine-wasm` trong thư mục này; `--out-dir` là `pkg`.

| Kiểm tra thực sự đã chạy | Kết quả | Giới hạn bằng chứng |
| --- | --- | --- |
| `cargo test --locked --offline` cho reference core | 6 unit và 3 integration test đạt, không lỗi | Native, chưa tích hợp game hoặc WASM adapter |
| `cargo test --locked --offline` cho gomoku engine | 19 unit và 3 integration test đạt, không lỗi | Native; file tên wasm.rs dùng test thông thường |
| `wasm-pack build` target web release với Cargo locked offline | Build thành công | Compile, chưa phải browser load hoặc performance |
| Node initSync trên binary cũ và binary mới | Cùng đạt 7 fixture luật và 1 fixture lifecycle API | Phạm vi fixture hữu hạn, chưa là search equivalence |

Binary mới có kích thước 48 837 byte và SHA256:

```text
24dff1d30d2e30d2b55ccf2fee4682e5db84a004c20886661bc41b128e78b3f2
```

[A] JS và declaration mới giống bản vendored, nhưng hash WASM mới khác bản cũ ở phần 6.2. Do đó đã xác minh được source hiện tại có thể build thành package; chưa xác minh được nguồn gốc byte-identical của artifact đang nằm trong game. Chênh lệch có thể liên quan source, compiler hoặc tối ưu hóa; nguyên nhân chưa được xác lập. Không copy package mới vào game.

[A] Bảy fixture luật trên mỗi binary gồm ngang, dọc, hai hướng chéo, năm bị chặn hai đầu, sáu tạo qua khoảng trống và bốn chưa thắng. Fixture lifecycle kiểm tra bounds, ô đã có quân, undo và reset; có thêm assertion từ chối nước sau thắng. Không chạy Vitest/typecheck/Vite build, không chạy browser Worker, không đo tốc độ hoặc sức mạnh bot. Full-board draw qua controller TypeScript đã được kiểm tra ở phần 6.1; không gọi đó là draw parity toàn bộ giữa hai WASM.

### 6.4 Telemetry và benchmark

[A] `10_caro/src/game/wasm/worker.ts` trả `nodes: 0`, lấy `depth` từ `WASM_SEARCH_DEPTHS`, và đo `elapsedMs` bao gồm hydrate lịch sử, gọi AI và giải phóng Game sau khi init đã hoàn tất. `nodes = 0` ở đây không có nghĩa AI không duyệt node; depth cũng không phải độ sâu đã đo được từ Rust.

[D] Benchmark cần xuất `nodesVisited`, `leafEvaluations`, `cutoffs`, `completedDepth`, thời gian core, thời gian end to end, profile, cấu hình và hash build thực. Giữ fixture, thuật toán, candidate policy, ordering, evaluator và seed tương đương khi so Rust với TypeScript. Tách initialization/cold start khỏi warm search nếu nghiên cứu chi phí search. Các con số 25 vị trí tương đương và tăng tốc 15.3 lần trong Week 04 cũ chưa có corpus/raw result đi kèm được xác lập trong phạm vi lần đối chiếu này; không dùng chúng làm kết quả được xác minh.

## 7 Hồ sơ evidence và thứ tự triển khai tiếp

Mỗi mục sau ghi file, trách nhiệm, bằng chứng và vấn đề được xác định. Mức tự tin High áp dụng cho quan sát source; hệ quả chưa tái hiện được ghi riêng là suy luận.

- **FILE:** `10_caro/src/game/core/WinRules.ts`. **ROLE:** luật thắng game. **EVIDENCE:** `FreestyleGomokuWinRule.evaluate`, bốn trục, `>= 5`. **ISSUE:** chưa có lựa chọn biến thể; không phải thiếu thắng cơ bản. **CONFIDENCE:** High.
- **FILE:** `10_caro/src/app/GameController.ts`. **ROLE:** commit, kết thúc trận và lifecycle AI. **EVIDENCE:** `finishMove`, win trước full-board draw; guard kết quả AI trước commit. **ISSUE:** profile được hardcode. **CONFIDENCE:** High.
- **FILE:** `10_caro/src/game/ai/TacticalMoveResolver.ts`. **ROLE:** thắng/chặn ngay trước search. **EVIDENCE:** predicate freestyle riêng. **ISSUE:** có rule lặp cần đồng bộ nếu thêm profile. **CONFIDENCE:** High.
- **FILE:** `gomoku-main/engine/src/board.rs`. **ROLE:** luật trong Rust engine. **EVIDENCE:** `check_winner_at`, `check_winner` dùng `>= 5`. **ISSUE:** không nhận cấu hình exact-five/blocked ends. **CONFIDENCE:** High.
- **FILE:** `gomoku-main/engine/src/eval.rs`. **ROLE:** điểm state. **EVIDENCE:** `pattern_score`, `count_line`, `evaluate`. **ISSUE:** thiếu taxonomy broken patterns; trọng số khác tài liệu cũ. **CONFIDENCE:** High.
- **FILE:** `gomoku-main/engine/src/ai.rs`. **ROLE:** candidate, ordering và Alpha Beta. **EVIDENCE:** `best_move`, `minimax`; terminal trả heuristic; root truncate trước immediate win. **ISSUE:** cần terminal utility riêng và tactical retention trước cap. **CONFIDENCE:** High cho source; tác động lên nước cụ thể chưa được tái hiện.
- **FILE:** `caro-core-reference/src/rules.rs`, `pattern.rs`, `evaluator.rs`, `movegen.rs` và `search/`. **ROLE:** thư viện tham chiếu tách biệt. **EVIDENCE:** có RuleConfig, evaluation và search riêng; giới hạn candidate trước ordering, mate trừ ply. **ISSUE:** cần profile-aware patterns, margin mate và bảo toàn tactical candidates; chưa có WASM adapter. **CONFIDENCE:** High cho source.
- **FILE:** `10_caro/src/game/wasm/worker.ts`. **ROLE:** hydrate và gọi binary. **EVIDENCE:** `Game.ai_move`, nominal depth, nodes 0. **ISSUE:** chưa có counter search thật để benchmark. **CONFIDENCE:** High.

[D] Thứ tự thực hiện: chốt profile và fixture oracle → dùng cùng luật ở TS/tactical/Rust → tách terminal utility → nhận diện pattern/threat → bot heuristic một ply → Minimax và Alpha Beta cùng contract → candidate/ordering bảo toàn tactical moves → build/fixture parity WASM → telemetry và benchmark. Có thể ưu tiên hiện thực Rust trước rồi tạo TypeScript tương đương để đối chiếu; chưa có cơ sở kết luận Rust nhanh hơn nếu chưa đo cùng workload.

## 8 Tài liệu chính thức

- [Rust target wasm32 unknown unknown](https://doc.rust-lang.org/rustc/platform-support/wasm32-unknown-unknown.html): target cho WASM và giới hạn các API phụ thuộc hệ điều hành.
- [wasm pack build](https://drager.github.io/wasm-pack/book/commands/build.html): lệnh build, target, release profile và output package. Bản tài liệu cũ tại rustwasm.github.io thông báo chuyển nơi duy trì sang domain này.
- [wasm bindgen deployment](https://wasm-bindgen.github.io/wasm-bindgen/reference/deployment.html): cách tải package `web`, JavaScript binding và khởi tạo module.

Phần source evidence trỏ vào file local đã kiểm tra; liên kết chính thức chỉ hỗ trợ hành vi toolchain, không xác nhận tính đúng thuật toán hay hiệu năng của project.
