# ECDR: Deep Research về Gate A → B → C, ranh giới novelty và kịch bản bác bỏ

## Kết luận hệ thống trước khi đi vào từng câu hỏi

Sau khi đối chiếu toàn bộ bức tranh hiện tại với HAPT chính thức, CROWN/LiRPA, LipCache, STBP, Online Verification của Wei–Liu, DeltaCNN, Eventful Transformers và các nghiên cứu gần đây về soundness số thực dấu phẩy động, mình cho rằng **khung Gate A → B → C hiện tại là đúng**, nhưng phương trình “ECDR thành công” cần được sửa một chút.

Ba cổng thực chất kiểm tra ba điều độc lập:

\[
\boxed{
\begin{aligned}
A &: \text{Có tồn tại miền } Z \text{ mà ta chứng nhận được decision invariance?}\\
B &: \text{Các query thực tế có thường xuyên rơi vào những miền đó?}\\
C &: \text{Lợi ích từ các hit có lớn hơn toàn bộ overhead?}
\end{aligned}}
\]

Vì vậy điều kiện hệ thống đầy đủ hơn là:

\[
\boxed{
\exists \mathcal Z:
\underbrace{\underline h_{aj}(\mathcal Z)>0}_{A}
\land
\underbrace{P(X_t\in\mathcal Z)\text{ đủ lớn}}_{B}
\land
\underbrace{
H T_F >
C_{\text{cert}}+C_{\text{query}}+C_{\text{maintenance}}
}_{C}
}
\]

trong đó \(H\) là **tổng số full-forward thực sự tránh được**, không nhất thiết là số window liên tục.

Điểm quan trọng nhất của đợt research này là:

> **Hiện tại chưa có bằng chứng để pass hay fail Gate B hoặc Gate C. Nhưng Gate A về mặt tồn tại toán học không phải vấn đề lớn nhất: nếu anchor có positive decision margin thì một miền decision-invariant không rỗng tồn tại. Khó khăn thật sự là miền đó có đủ lớn, verifier có tìm được nó đủ chặt, dữ liệu có đi vào nó đủ thường xuyên và chi phí có hòa vốn hay không.**

Các con số dự án như 17.453 windows, 17.392 adjacent pairs, `same_activity = 9.278`, `label_change = 1.651`, SmallCNN1D 282.918 parameters và \(T_F=0.2511\) ms hiện là bằng chứng được **reported trong hồ sơ dự án**, không phải kết quả mình độc lập chạy lại raw repository trong phiên này. fileciteturn0file0 fileciteturn0file1 fileciteturn0file2

UCI xác nhận HAPT là time-series accelerometer + gyroscope 6 trục ở 50 Hz, có sáu hoạt động cơ bản và sáu postural transitions; bản gốc sử dụng cửa sổ 128 mẫu = 2,56 giây với 50% overlap. HAPT cũng đặc biệt cung cấp raw signals nhằm hỗ trợ online testing, nên về bản chất đây là một dataset hợp lý để nghiên cứu sequential reuse. citeturn3search0turn3search4

| Câu hỏi | Có thể kết luận hiện tại? | Loại bằng chứng còn thiếu |
|---|---:|---|
| Dwell time thực tế | **Chưa** | Ordered manifest / prediction stream |
| Nguyên nhân distance tail | **Một phần** | Per-class/channel decomposition |
| Xử lý 43,12% non-pure stream | **Có thể chốt contract** | Policy cuối cùng |
| MaxPool làm CROWN lỏng đến đâu | **Chưa định lượng** | Bound sweep trên checkpoint |
| \(b\to0\) vẫn âm? | **Có thể trả lời toán học** | Không nên xảy ra với positive-margin anchor |
| \(\epsilon_{\rm num}\) | **Không có một hằng số universal** | Floating-point error enclosure |
| Event descriptor nhẹ | **Có** | Empirical discrimination vẫn phải đo |
| \(T_C\) | **Chưa** | Same-machine benchmark |
| \(n^\*\) | **Có thể tính tham số** | Phụ thuộc \(T_C,T_{\rm hit}\) |
| Single vs multi anchor | **Có thể phân tích** | Runtime benchmark |
| Novelty | **Có candidate claim** | Literature review rộng hơn + experiments |
| LipCache trên HAPT | **Có thể dự đoán boundary** | Adapted implementation benchmark |
| Negative result | **Hoàn toàn hợp lệ** | Phải phát biểu đúng phạm vi |

## Dữ liệu, dwell time và Gate B

### Dwell time: metric hiện tại đang hỏi chưa đúng hoàn toàn

Câu hỏi đầu tiên là “cùng một hoạt động kéo dài bao nhiêu windows”. Điều này có giá trị, nhưng **Gate B thực ra cần ít nhất ba loại run-length khác nhau**.

Thứ nhất là **ground-truth activity dwell**:

\[
L^{GT}=
\text{run length của cùng activity label}
\]

Thứ hai, quan trọng hơn với ECDR, là **reference-decision dwell**:

\[
L^{F}=
\text{run length của cùng }
\arg\max F(x_t)
\]

Thứ ba mới là thứ quyết định cache:

\[
L^{cert}=
\text{số query liên tiếp hoặc tái xuất hiện vẫn thuộc certificate của anchor}
\]

Ta hoàn toàn có thể gặp:

\[
L^{GT}=30,\qquad L^{F}=25,\qquad L^{cert}=4
\]

Nghĩa là người dùng vẫn Walking trong 30 windows, CNN chỉ đổi quyết định vài lần, nhưng certificate quá nhỏ nên ECDR chỉ reuse được bốn query.

Do đó **dwell theo ground truth không được dùng làm proxy trực tiếp cho reuse lifetime**.

Hồ sơ hiện có báo cáo 9.278 adjacent pairs là `same_activity` và 1.651 là `label_change`. Trong riêng tập các cặp được phân vào hai nhóm đó:

\[
\frac{9278}{9278+1651}=84.89\%
\]

là same-activity pairs. Nhưng **84,89% không cho ta mean run length** vì còn recording boundaries, unlabeled/mixed windows, censoring và phân phối class không đồng nhất. Dùng giả định geometric để suy mean run ≈ 6,62 windows sẽ chỉ là một mô hình giả định, không phải kết quả HAPT, nên không nên đưa con số đó vào paper. fileciteturn0file1

Để trả lời đúng Gate B, báo cáo data cần tạo survival curves:

\[
S_c(n)=P(L_c\ge n)
\]

cho từng lớp:

- WALKING
- WALKING_UPSTAIRS
- WALKING_DOWNSTAIRS
- SITTING
- STANDING
- LAYING

và đặc biệt đọc trực tiếp:

\[
P(L\ge8),\quad
P(L\ge20),\quad
P(L\ge25),\quad
P(L\ge40)
\]

vì đây chính là các ngưỡng hòa vốn có khả năng xuất hiện ở Gate C.

### Tại sao same-activity \(L_2\) p50 = 1,84 nhưng p90 = 17,35?

Có một cơ chế rất quan trọng mà phân tích trước chưa nhấn mạnh:

**50% window overlap không có nghĩa direct coordinate-wise distance giữa hai tensor có 50% thành phần giống nhau.**

Window thứ nhất:

\[
x_t=
[s_s,\ldots,s_{s+127}]
\]

Window kế tiếp:

\[
x_{t+1}=
[s_{s+64},\ldots,s_{s+191}]
\]

Khi tính trực tiếp:

\[
\|x_t-x_{t+1}\|_2
\]

ta đang so:

\[
s_{s+i}\quad\text{với}\quad s_{s+64+i}
\]

chứ không phải đặt 64 sample overlap vào cùng coordinate.

Vì vậy, dù hai window chia sẻ 64 sample vật lý, những sample đó nằm ở **hai vị trí tensor khác nhau**.

Đây là nguyên nhân cơ học rất mạnh khiến Walking có thể tạo ra \(L_2\) lớn: một shift 64 mẫu tương đương 1,28 giây; đối với tín hiệu bước chân tuần hoàn, đây có thể là một phase shift đáng kể. UCI xác nhận dữ liệu được lấy ở 50 Hz và dùng stride tương đương 50% của window 128 mẫu. citeturn3search0turn3search4

Vì \(d=6\times128=768\), một \(L_2\) lớn cũng không đòi hỏi mỗi coordinate thay đổi cực lớn:

\[
\mathrm{RMS}_{coord}
=
\frac{\|x_t-x_{t+1}\|_2}{\sqrt{768}}
\]

Với p50:

\[
\frac{1.84}{\sqrt{768}}\approx0.0664
\]

nhưng p90:

\[
\frac{17.35}{\sqrt{768}}\approx0.626
\]

tức tail phản ánh những window có mức thay đổi trên rất nhiều coordinate cùng lúc.

Hiện tại **không đủ bằng chứng để kết luận tail do sensor noise, postural drift hay step-cycle variation**. Ba cơ chế này phải được tách bằng decomposition:

\[
\Delta x =
\Delta x_{\text{low-freq drift}}
+
\Delta x_{\text{periodic}}
+
\Delta x_{\text{high-freq}}
\]

Cách kiểm tra đúng là phân rã theo activity, channel, frequency band và phase-aligned cross-correlation. Nếu tail tập trung ở WALKING/STAIRS và giảm mạnh sau phase alignment, giả thuyết gait-phase được hỗ trợ. Nếu tail xuất hiện ở SITTING/STANDING ở low frequency, postural drift có vai trò. Nếu high-pass residual chiếm phần lớn, mới có cơ sở nói sensor noise.

### Một correction quan trọng: \(L_2<3\) không đồng nghĩa “90% data nằm ngoài”

Từ:

\[
p50=1.84,\qquad p90=17.35
\]

với same-activity pairs, ta biết ít nhất khoảng một nửa phân phối nằm ở hoặc dưới 1,84 và khoảng 90% nằm ở hoặc dưới 17,35 theo định nghĩa quantile được dùng.

Do đó nếu threshold là 3:

\[
P(L_2<3)
\]

phải nằm đâu đó **trên 50% và dưới hoặc bằng khoảng 90%**, chứ không thể suy ra “90% rơi ngoài region”. Cần empirical CDF tại đúng \(r=3\) để biết giá trị thực. Các thống kê distance hiện tại được báo cáo trong hồ sơ dự án. fileciteturn0file1

Hơn nữa ECDR đang đề xuất **anisotropic box**:

\[
|z_i-z_i^r|\le b_{e,i}
\]

chứ không phải \(L_2\)-ball. Vì vậy:

\[
\|z-z^r\|_2<3
\]

không phải chính xác criterion membership của ECDR.

### 43,12% “non-pure” phải xử lý thế nào?

Test stream có:

\[
5053-2874=2179
\]

windows không thuộc pure K=6 evaluation, tức:

\[
43.12\%
\]

theo các số liệu dự án được cung cấp. fileciteturn0file1

**Không nên dùng ground-truth window type tại runtime để force fallback.**

Nếu runtime nhìn vào “đây là transition”, “đây là unlabeled”, thì hệ thống đang dùng thông tin mà deployment thực tế không có. Đó là evaluation leakage.

Reference SmallCNN1D vẫn là:

\[
F:\mathbb R^{6\times128}\rightarrow\mathbb R^6
\]

nên nó vẫn trả một trong sáu class cho transition/unlabeled inputs, dù ground-truth accuracy của prediction đó không được định nghĩa theo six-class pure protocol.

Vì vậy có ba policy hợp lệ:

**Policy nghiên cứu thuần túy:** đưa cả 5.053 windows qua stream. Certificate quyết định reuse hoặc fallback. Metric chính trên non-pure windows là:

\[
\mathrm{Agreement}(ECDR,F)
\]

chứ không phải six-class accuracy.

**Policy deployment:** thêm một runtime change/uncertainty detector không sử dụng ground truth. Khi high-change, detector có thể force fallback và không promote input thành long-lived anchor.

**Oracle upper bound:** dùng ground-truth transition mask chỉ để hỏi “nếu biết transition hoàn hảo thì hiệu quả tối đa là bao nhiêu?”. Kết quả này phải ghi rõ là oracle, không phải deployable system.

Do đó **transition không đồng nghĩa bắt buộc reset anchor**. Recording boundary thì reset được định nghĩa từ stream metadata; transition chỉ được dùng để reset nếu runtime có một detector hợp lệ phát hiện nó.

Gate B vì thế **chưa pass** nhưng cũng **chưa fail**. Số liệu đang có chỉ cho thấy temporal structure tồn tại; chưa cho thấy certified-reuse structure tồn tại.

## Toán học, CROWN và Gate A

### MaxPool/ReLU có thể làm bounds lỏng, nhưng không triệt tiêu sự tồn tại của reuse region

CROWN xây dựng các linear bounds cho mạng neural; auto_LiRPA mở rộng họ phương pháp LiRPA/CROWN sang computational graphs tổng quát. Repository chính thức hiện ghi nhận hỗ trợ optimized CROWN/LiRPA cho ReLU và MaxPool, cùng nhiều biến thể như α-CROWN, β-CROWN, IBP và CROWN-IBP. citeturn0search1turn0search9turn1search1

Nhưng có hai vấn đề phải tách biệt.

**Existence problem:**

> Có một decision-invariant region không?

**Verifier completeness/tightness problem:**

> CROWN có chứng minh được region đó với bán kính hữu ích không?

Cho anchor \(z^r\) có unique winner \(a\):

\[
m(z^r)=
f_a(z^r)-\max_{j\ne a}f_j(z^r)>0
\]

Các Conv, affine layer, ReLU và MaxPool hữu hạn đều liên tục. Vì hợp của các hàm liên tục là liên tục:

\[
h_{aj}(z)=f_a(z)-f_j(z)
\]

cũng liên tục.

Do đó tồn tại \(\delta>0\) sao cho:

\[
\|z-z^r\|<\delta
\implies
h_{aj}(z)>0
\quad\forall j\ne a.
\]

Tức là:

\[
\boxed{
m(z^r)>0
\Longrightarrow
\exists \delta>0:
\arg\max f(z)=a
}
\]

Không cần CROWN để chứng minh **existence theorem** này.

CROWN chỉ quyết định ta có tìm được một **computable certified subset** của vùng đó hay không.

### Có thể xảy ra \(\underline h_{aj}<0\) ngay cả khi \(b_e\rightarrow0\) không?

Về mặt toán học, với positive-margin anchor, câu trả lời là **không nên**.

Khi:

\[
b_e=0
\]

thì:

\[
Z_e=\{z^r\}
\]

là singleton.

Exact minimum lúc đó là:

\[
\min_{z\in Z_e}h_{aj}(z)
=
h_{aj}(z^r)>0.
\]

Một verifier point-exact trên degenerate intervals phải hội tụ về giá trị này. ReLU hay MaxPool không tạo uncertainty khi đầu vào của chúng đã cố định chính xác tại một điểm.

Nếu implementation vẫn trả lower bound âm tại \(b_e=0\) hoặc cực nhỏ trong khi direct forward cho margin lớn dương, đó là tín hiệu của một trong các vấn đề:

- formulation/specification sai;
- numerical issue;
- unsupported/buggy operator path;
- normalization mismatch;
- class-pair matrix sai;
- anchor thực tế không có positive predicted margin.

Repository auto_LiRPA có hỗ trợ MaxPool trong optimized bounds, nhưng điều đó **không thay thế việc xác nhận graph SmallCNN1D cụ thể**. citeturn1search1

Gate A vì vậy nên chia thành:

\[
A_1=\text{point sanity}
\]

\[
A_2=\text{positive but tiny region}
\]

\[
A_3=\text{useful-size certified region}
\]

Nếu \(A_1\) fail, implementation/formulation có lỗi. Nếu \(A_1\) pass nhưng \(A_3\) fail thì đó mới là “relaxation quá lỏng / architecture khó verify”.

### Nghĩa vụ S09: không tồn tại một \(\epsilon_{\rm num}\) universal cho float32

Đây là điểm trong Registry cần nâng cấp.

PyTorch ghi rõ single-precision chỉ có khoảng bảy chữ số thập phân có ý nghĩa, phép cộng/nhân floating point không kết hợp, và kết quả có thể khác giữa platform hay execution order. NVIDIA cũng mô tả các operation IEEE-754 và sự phụ thuộc của error vào rounding/order. citeturn6search0turn6search1turn6search2

Với binary32, unit roundoff trong round-to-nearest thường được mô hình hóa bởi:

\[
u=2^{-24}\approx5.96\times10^{-8}.
\]

Nhưng điều này **không có nghĩa tổng verifier error chỉ là \(5.96\times10^{-8}\)**.

Một chuỗi phép tính có dạng:

\[
\mathrm{fl}(a\circ b)
=
(a\circ b)(1+\delta),
\qquad|\delta|\le u
\]

có lỗi tích lũy phụ thuộc:

- số operation;
- độ lớn intermediate values;
- conditioning;
- cancellation;
- FMA hay non-FMA;
- execution order;
- CPU/GPU kernel;
- overflow/subnormal behavior.

Nghiên cứu gần đây đã chỉ ra chính khoảng cách giữa real-arithmetic certification và floating-point execution: một certificate sound trên số thực không tự động là guarantee cho implementation floating-point đang deploy. citeturn11academia12turn11search0

Do đó ECDR không nên state:

\[
\underline h_{aj}>10^{-6}
\]

rồi mặc định gọi đó là numerical-safe.

Hợp đồng đúng hơn là tìm một **proven error enclosure** \(E_{aj}^{num}\):

\[
h_{aj}^{real}
\ge
\underline h_{aj}^{fp}-E_{aj}^{num}.
\]

Chỉ chấp nhận khi:

\[
\boxed{
\underline h_{aj}^{fp}
-
E_{aj}^{num}
>0
\quad\forall j\ne a
}
\]

Nếu chưa xây dựng được \(E^{num}\), claim hợp lý chỉ là:

> soundness với respect to real-valued network semantics của verifier,

không phải:

> tuyệt đối sound trên mọi hardware float32.

Đây là một ranh giới học thuật rất quan trọng.

### Event descriptor nào đủ nhẹ?

Một full FFT length \(d\) không phải \(O(d)\), mà thông thường là:

\[
O(d\log d).
\]

ECDR không cần FFT để có event descriptor đầu tiên.

Một descriptor streaming đơn giản cho sáu channels có thể dùng:

\[
e_t=
[
\mu_c,\;
\mathrm{Var}_c,\;
\mathrm{RMS}(\Delta x_c),\;
\mathrm{mean}|\Delta x_c|
]_{c=1}^{6}
\]

tức khoảng 24 scalars.

Mỗi đại lượng có thể được tính bằng một hoặc hai pass:

\[
O(d)
\]

với \(d=768\).

Một vài fixed-frequency Goertzel components hoặc IIR-band energy cũng vẫn là \(O(Kd)\), và nếu số band \(K\) cố định thì asymptotically vẫn là \(O(d)\).

Nhưng event descriptor chỉ được phép làm:

\[
e_t
\rightarrow
\text{choose candidate budget}
\]

không được phép làm:

\[
e_t
\rightarrow
\text{declare cache hit}.
\]

Certificate vẫn phải là lớp an toàn cuối.

HAPT chính thức vốn chứa cả time-domain và frequency-domain information trong feature version của dataset, nên việc khai thác dynamic-energy descriptors là phù hợp với cấu trúc tín hiệu; tuy vậy descriptor cụ thể cho ECDR vẫn phải được validate trên train/validation, không được suy ra chỉ từ UCI features. citeturn3search4

## Chi phí, latency và Gate C

### \(T_C=2\)–\(10\) ms hiện chỉ là giả thuyết

Không có nguồn nào trong hồ sơ hiện tại chứng minh CROWN trên **đúng SmallCNN1D, đúng CPU, đúng thread count, đúng five-margin specification** mất 2, 5 hay 10 ms.

Vì vậy:

\[
T_C\in[2,10]\text{ ms}
\]

chỉ nên dùng làm sensitivity analysis.

Reference forward được báo cáo:

\[
T_F=0.2511\text{ ms}.
\]

fileciteturn0file1

Nếu tạm bỏ qua mọi hit overhead:

\[
n^\*
=
\frac{T_C}{T_F}
\]

ta có:

| \(T_C\) giả định | Minimum hit count lý tưởng |
|---:|---:|
| 2 ms | 7,96 → **8 hits** |
| 5 ms | 19,91 → **20 hits** |
| 10 ms | 39,82 → **40 hits** |

Đây là lower bound quá lạc quan vì chưa tính event extraction, membership, misses và cache management.

Công thức đầy đủ hơn trên toàn stream:

\[
C_{\rm Full}=NT_F
\]

\[
C_{\rm ECDR}
=
(N-H)T_F
+
C_{\rm cert}
+
C_{\rm event}
+
C_{\rm lookup}
+
C_{\rm membership}
+
C_{\rm maintenance}.
\]

Vì vậy:

\[
\boxed{
\Delta C
=
HT_F-C_{\rm overhead}
}
\]

và ECDR thắng khi:

\[
\boxed{
HT_F>C_{\rm overhead}
}.
\]

Nếu một certificate chỉ dùng cho một run và hit path có cost \(T_{\rm hit}\):

\[
\boxed{
n^\*
=
\frac{T_C+C_{\rm anchor-extra}}
{T_F-T_{\rm hit}}
}
\]

mới là công thức thích hợp.

### “25 windows = 32 giây” cần phân biệt hai loại thời gian

Stride là:

\[
64/50=1.28\text{ s}.
\]

Do đó 25 **successive query intervals** tương ứng khoảng:

\[
25\times1.28=32\text{ s}.
\]

Nhưng 25 overlapping windows từ start đầu đến end cuối bao phủ:

\[
2.56+(25-1)\times1.28
=
33.28\text{ s}.
\]

Tương tự, 40 windows span khoảng:

\[
52.48\text{ s}.
\]

HAPT chính thức xác nhận 128 samples ở 50 Hz và 50% overlap. citeturn3search4

Nếu \(n^\*=25\) và \(T_{\rm hit}\approx0\), certificate cost tương ứng là:

\[
T_C
=
25(0.2511)
=
6.2775\text{ ms}.
\]

Câu hỏi thực sự không phải “có hoạt động kéo dài 32 giây không?”, mà:

\[
P(L^{cert}\ge25)?
\]

Đây là con số chưa có.

### Single-anchor hay multi-anchor?

Mình đề xuất **single-anchor phải là baseline khoa học đầu tiên**, không phải vì chắc chắn tốt hơn mà vì nó cô lập được causal mechanism.

Single anchor:

\[
C_{\rm lookup}=O(d)
\]

và ta đo trực tiếp lifetime của một certificate.

Với \(M\) anchors và naive scan:

\[
C_{\rm lookup}=O(Md).
\]

Nếu mỗi anchor lưu center + coordinate budget ở float32:

\[
2\times768\times4
=
6144\text{ bytes}
\]

chưa tính metadata/certificate.

Do đó \(M\) còn ảnh hưởng memory locality chứ không chỉ arithmetic count.

Nhưng không thể lấy \(O(Md)\) rồi kết luận lúc nào nó vượt 0,2511 ms. CPU SIMD, memory bandwidth, framework overhead và batching đều quyết định wall-clock time.

Quyết định hợp lý là:

\[
\text{Single-anchor}
\rightarrow
\text{đo miss reason}
\]

Nếu nhiều miss xảy ra vì **quay lại một region trước đó**, multi-anchor có lý.

Nếu miss chủ yếu do continuous drift khỏi tất cả old regions, tăng \(M\) chỉ tốn lookup mà không tăng hit rate.

Vì vậy metric cần có là:

\[
\mathrm{recurrence\ hit\ gain}(M)
\]

chứ không đơn thuần hit rate.

## Ranh giới novelty và quan hệ với prior work

Prior art hiện tại tạo thành một bản đồ khá rõ.

**CROWN** đã giải quyết nền tảng linear-relaxation certification; không thể claim “tính class-pair bounds” là novelty. citeturn0search1turn0search9

**Wei & Liu** đã nghiên cứu online verification với temporal dependence, bao gồm branch management, perturbation tolerance và incremental computation để reuse kết quả verification; họ báo cáo acceleration lên tới 100× trong bối cảnh verification của họ. Do đó “reuse verification computation over time” cũng không thể được claim chung chung là mới. citeturn2view2

**STBP** năm 2026 đã chỉ ra structured spatio-temporal constraints có thể tạo bounds hữu ích hơn các perturbation sets quá tổng quát; STBP kết hợp exact characterization ở initial convolution với scalable approximations ở các layer sau. Vì vậy “dùng temporal structure để tạo verification domain chặt hơn” cũng đã có prior art gần. citeturn2view1

**DeltaCNN** khai thác temporal coherence giữa video frames để chỉ propagate sparse feature changes, đạt speedup được báo cáo tới 7× với sai khác accuracy nhỏ. **Eventful Transformers** tương tự tận dụng temporal redundancy của token và báo cáo khoảng 2–4× compute savings với giảm accuracy nhỏ. Cả hai chứng minh rằng temporal computation redundancy là hiện tượng thực, nhưng không cung cấp guarantee “full classifier decision luôn giữ nguyên trên cache hit” theo nghĩa ECDR đang nhắm đến. citeturn0search0turn1search0

**DeepCache** thậm chí từ 2017 đã khai thác temporal locality trong continuous mobile vision để reuse intermediate CNN computation, nên bản thân “cache CNN trên stream” rõ ràng không phải novelty. citeturn10academia25

**LipCache** là prior work gần nhất với certified result caching: GuardNet tạo feature, cache entry có certified radius, query trong radius được trả cached payload, nếu không thì fallback MainNet. Certificate của paper là GuardNet-side local label consistency; paper cũng nói rõ streaming temporal redundancy và concept drift vẫn là future work. citeturn2view0turn5view0

### Candidate novelty mạnh nhất của ECDR

Sau literature sweep này, mình **không khuyến nghị** claim novelty đơn giản là:

> Event-conditioned region + amortized latency.

Hai thành phần riêng lẻ đều đã có hàng xóm rất gần.

Candidate novelty mạnh hơn là tổ hợp có contract chính xác:

\[
\boxed{
\textbf{Past-conditioned structured domains}
+
\textbf{direct MainNet decision certification}
+
\textbf{runtime decision reuse}
+
\textbf{stream-lifetime amortization}
}
\]

Diễn đạt rõ hơn:

> **A sequential inference system that uses only past/current observable signal structure to construct local verification domains, directly certifies the frozen reference classifier's decision over those domains, and reuses the certified decision across future streaming queries only while membership remains valid, with an explicit amortized break-even criterion.**

Điểm phân biệt:

- với LipCache: direct reference-model decision thay vì GuardNet decision;
- với STBP: certificate được dùng để **skip future inference**, không chỉ verify robustness;
- với Wei–Liu: mục tiêu cuối là tránh classifier execution, không chỉ giảm verification cost;
- với DeltaCNN/Eventful: output equality được certified thay vì chấp nhận small empirical accuracy degradation.

Nhưng đây vẫn là **candidate novelty claim**, không phải novelty đã chứng minh. Search hiện tại chưa đủ để khẳng định “first” trong literature.

### LipCache adapted to HAPT có chắc chắn sụp latency không?

Không thể kết luận chắc chắn, nhưng economics hiện tại cực bất lợi cho LipCache-style local guard.

LipCache paper đo trên deployment thực:

\[
T_{\rm Guard}=1.34\text{ ms}
\]

\[
T_{\rm lookup}=0.22\text{ ms}
\]

\[
T_{\rm edge}=1.56\text{ ms}
\]

trên Atlas 200I NPU, còn remote ResNet-50 batch-1 trên RTX 4070 Ti là 8,38 ms; paper sau đó cộng modeled RTT 2/10/40 ms và thu được estimated speedups 1,22×/1,32×/1,42×. Paper nhấn mạnh các RTT speedup đó là analytical estimates từ measured components, không phải live HTTP measurements. citeturn4view1turn4view2

ECDR hiện có local SmallCNN:

\[
T_F=0.2511\text{ ms}.
\]

fileciteturn0file1

Nếu một LipCache-style system chạy hoàn toàn local, expected cost đơn giản là:

\[
E[T_{\rm Lip}]
=
T_G+T_L+(1-H)T_F.
\]

Muốn nhanh hơn CNN thuần:

\[
T_G+T_L+(1-H)T_F<T_F
\]

suy ra:

\[
\boxed{
T_G+T_L<H\,T_F.
}
\]

Đây là một điều kiện rất mạnh.

Nếu:

\[
H=50\%
\]

thì guard + lookup phải nhỏ hơn:

\[
0.5\times0.2511
=
0.12555\text{ ms/query}.
\]

Ngay cả với:

\[
H=100\%
\]

thì:

\[
T_G+T_L<0.2511\text{ ms}.
\]

Do đó **copy nguyên overhead 1,56 ms từ LipCache paper sang workload này chắc chắn thua** ngay cả với 100% hit.

Nhưng phép so này **không phải benchmark công bằng**, vì khác model, hardware và GuardNet. Một 1D GuardNet cho HAPT có thể rẻ hơn rất nhiều. Vì vậy kết luận khoa học đúng là:

> SmallCNN1D tạo ra một operating regime rất khó cho mọi proxy-based cache: proxy + lookup phải cực rẻ vì full inference bản thân đã chỉ ~0,25 ms.

Đây có thể là một điểm mạnh của ECDR nếu online hit check của ECDR thực sự chỉ là \(O(d)\) membership rất nhẹ **và** certificate được amortize lâu. Nhưng điều đó vẫn chưa được đo.

## Kịch bản bác bỏ và quyết định nghiên cứu

### Nếu Gate A thất bại

Không nên lập tức bỏ MaxPool và thay architecture.

Trình tự khoa học hợp lý là:

\[
\text{Point sanity}
\rightarrow
\text{tiny box}
\rightarrow
\text{optimized bounds}
\rightarrow
\text{domain splitting}
\rightarrow
\text{architecture change}.
\]

auto_LiRPA hiện có các phương pháp từ IBP, CROWN tới optimized α-CROWN/β-CROWN và có support cho MaxPool; vì thế “vanilla CROWN lỏng” không đồng nghĩa architecture về nguyên tắc unverifiable. citeturn1search1turn1academia38

Nếu sau các verifier hợp lý mà useful radius vẫn gần zero, khi đó có ba hướng nghiên cứu:

**Verifier-friendly backbone:** thay MaxPool bằng strided Conv hoặc AvgPool.

**Smaller/split domains:** chia candidate region thành subregions thay vì đổi model.

**New study regime:** thử mạng FC/ReLU nhỏ để tách vấn đề verifier khỏi HAPT architecture.

Nhưng thay MaxPool bằng strided Conv đồng nghĩa:

\[
F_{\rm new}\neq F_{\rm G2}.
\]

Checkpoint, accuracy, latency và toàn bộ G2 baseline hiện tại không còn dùng trực tiếp được. Nó phải được xem là một experiment branch mới, không phải “minor fix”.

Ngoài ra FC-only cũng không mặc nhiên dễ verify hơn; số ReLU unstable và dimension vẫn có thể làm bounds lỏng. CROWN/αβ-CROWN tồn tại chính vì verification difficulty phụ thuộc cả network geometry chứ không chỉ loại layer. citeturn0search1turn1academia38

### Nếu Gate C thất bại

Đây **không phải thất bại của nghiên cứu**.

Một kết quả:

\[
\mathrm{Soundness}=100\%
\]

nhưng:

\[
C_{\rm ECDR}>C_{\rm Full}
\]

trên SmallCNN1D có thể là kết quả khoa học rất hữu ích.

Nhưng không nên viết:

> “Certified reuse không khả thi trên edge CPU.”

Một experiment duy nhất không đủ hỗ trợ phát biểu đó.

Claim đúng hơn:

> **For sub-millisecond 1D classifiers in the evaluated HAPT/CPU regime, direct runtime certification does not amortize unless certificate reuse lifetime exceeds the measured break-even threshold.**

Sau đó paper có thể đưa ra **crossover equation**:

\[
T_F^{crit}
=
T_{\rm hit}
+
\frac{T_C+C_{\rm miss-extra}}
{E[n_{\rm reuse}]}
\]

Nếu:

\[
T_F<T_F^{crit}
\]

thì reuse không đáng.

Nếu:

\[
T_F>T_F^{crit}
\]

thì regime trở nên tiềm năng.

Đây mạnh hơn một câu “ECDR chậm”, vì nó cho cộng đồng một **boundary condition tổng quát có thể kiểm tra trên model khác**.

Ví dụ, nếu đo được:

\[
T_C=5\text{ ms},
\qquad
E[n_{\rm reuse}]=20,
\qquad
T_{\rm hit}=0.02\text{ ms},
\]

thì:

\[
T_F^{crit}
\approx
0.02+\frac{5}{20}
=
0.27\text{ ms}.
\]

SmallCNN 0,2511 ms nằm ngay phía bất lợi. Một backbone 5–10 ms sẽ ở regime hoàn toàn khác.

Đó mới là cách biến negative result thành contribution.

### Phán quyết hiện tại cho ba Gate

| Gate | Status hiện tại | Kết luận |
|---|---|---|
| **Gate A — Mathematical / Verification** | **OPEN nhưng khả thi về existence** | Positive-margin anchor bảo đảm tồn tại local invariant region; chưa biết CROWN tìm được region hữu ích đến đâu |
| **Gate B — Empirical redundancy** | **OPEN** | Temporal redundancy có dấu hiệu nhưng chưa có certified-lifetime distribution |
| **Gate C — Systems economics** | **HIGH RISK** | \(T_F=0.2511\) ms tạo break-even rất khắt khe; certificate phải rẻ hoặc reuse rất dài |
| Novelty | **Candidate only** | Tổ hợp direct MainNet certification + sequential reuse + structured past-conditioned domain + amortization là vị trí đáng theo đuổi |
| LipCache comparison | **Chưa benchmark công bằng** | Original edge/cloud economics không chuyển trực tiếp sang local HAPT CPU |

Điểm ưu tiên cao nhất hiện tại vì vậy **không phải implement CROWN ngay**.

Câu hỏi có giá trị thông tin cao nhất là Gate B:

\[
\boxed{
\text{Trong full ordered stream, một frozen-CNN decision thực tế sống được bao lâu?}
}
\]

Cần lấy 5.053 test windows theo đúng recording order và tính song song:

\[
L^{GT},\qquad
L^{F},\qquad
D_2,\qquad
D_\infty,\qquad
m_{\rm pred}
\]

rồi báo cáo:

\[
P(L^{F}\ge n)
\]

và với mỗi anchor:

\[
\max_{k}
\left\{
k:
F(x_{t+i})=F(x_t),
\; i=1,\ldots,k
\right\}.
\]

Sau đó mới overlay các candidate radii:

\[
r\in\{0.25,0.5,1,2,3,\ldots\}
\]

hoặc coordinate budgets để tìm **oracle reuse ceiling trước certification**.

Nếu ngay cả oracle decision-reuse lifetime hầu hết chỉ 1–3 windows, ECDR trên HAPT gần như bị bác bỏ trước khi cần trả giá cho CROWN.

Ngược lại, nếu SITTING/STANDING/LAYING thường tạo 20–50+ consecutive same-CNN-decision queries và một phần đáng kể còn nằm trong compact geometric regions, **đó mới là bằng chứng đủ mạnh để đầu tư sang Gate A verifier và Gate C benchmark**.

Đây là thứ tự research hiệu quả nhất hiện nay:

\[
\boxed{
\text{Decision redundancy}
\rightarrow
\text{Geometric coverage}
\rightarrow
\text{Certified coverage}
\rightarrow
\text{Amortized cost}
}
\]

chứ không phải:

\[
\text{CROWN implementation}
\rightarrow
\text{hy vọng dữ liệu reuse được}.
\]

Về mặt hệ thống, đây cũng là kết luận quan trọng nhất của toàn bộ nghiên cứu hiện tại: **ECDR chỉ có lý do tồn tại khi ba hiện tượng cùng giao nhau — neural decision ổn định, dữ liệu quay lại đủ gần một certified region, và việc nhận biết điều đó rẻ hơn inference mà nó loại bỏ.**