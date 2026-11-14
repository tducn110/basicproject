from pathlib import Path
import re,json,hashlib,shutil,os
from copy import deepcopy
from zipfile import ZipFile
from docx import Document
from docx.shared import Cm,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH,WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT,WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

W=Path(__file__).resolve().parent; REF=W.parent/'templatereport.docx'
DEST=W.parent/'Bao_cao_do_an_co_so_Caro_Nguyen_Tam_Duc.docx'
FIGS=json.loads((W/'figures/figures.json').read_text()); CACHE=json.loads((W/'page_cache.json').read_text()) if (W/'page_cache.json').exists() else {}
D=Document(REF); D.core_properties.title='Báo cáo đồ án cơ sở Caro';D.core_properties.subject='Thuật toán và triển khai website Caro';D.core_properties.author='Nguyễn Tâm Đức';D.core_properties.last_modified_by='Nguyễn Tâm Đức';D.core_properties.comments=''; body=D.element.body; orig=list(body); breaks=[deepcopy(e) for e in orig if e.tag==qn('w:p') and e.xpath('./w:pPr/w:sectPr')]
# Retain the supplied cover logos, page border, layout and six section patterns.
p=D.paragraphs;p[10].text='XÂY DỰNG WEBSITE CỜ CARO\nỨNG DỤNG CÁC THUẬT TOÁN TÌM KIẾM';p[11].text='BÁO CÁO ĐỒ ÁN CƠ SỞ'
p[21].text='Giảng viên hướng dẫn: Nguyễn Văn Thọ';p[22].text='Lớp: CSE24     Năm học: 2026–2027'
for x in p[26].runs:x.text=''
for idx in [10,11]:
 p[idx].alignment=WD_ALIGN_PARAGRAPH.CENTER
 for r in p[idx].runs:r.font.name='Arial';r.font.size=Pt(18 if idx==10 else 14);r.bold=idx==10
for idx in [21,22]:
 for r in p[idx].runs:r.font.name='Arial';r.font.size=Pt(12);r.bold=False
cover=D.tables[0];cover.cell(0,0).text='Sinh viên thực hiện:';cover.cell(0,1).text='Nguyễn Tâm Đức';cover.cell(1,0).text='Mã số sinh viên:';cover.cell(1,1).text='24020005'
for row in list(cover.rows)[2:]:cover._tbl.remove(row._tr)
for el in list(body)[28:-1]:body.remove(el)
for idx in [23,24,25]:
 if p[idx]._p.getparent() is body:body.remove(p[idx]._p)
p[26].paragraph_format.space_before=Pt(0);p[26].paragraph_format.space_after=Pt(0);p[26].paragraph_format.line_spacing=1
for r in p[26].runs:r.font.size=Pt(1)
# Source Normal is Arial 12 with 1.5 line spacing; retain these report proportions.
for name in ['Normal','Body Text']:
 s=D.styles[name];s.font.name='Arial';s.font.size=Pt(12);s.font.color.rgb=RGBColor(0,0,0);s.paragraph_format.line_spacing=1.5;s.paragraph_format.space_after=Pt(6);s.paragraph_format.widow_control=True
for name,size in [('Heading 1',16),('Heading 2',14),('Heading 3',12)]:
 s=D.styles[name];s.font.name='Arial';s.font.size=Pt(size);s.font.bold=True;s.font.color.rgb=RGBColor(0,0,0);s.paragraph_format.line_spacing=1.25;s.paragraph_format.space_before=Pt(12);s.paragraph_format.space_after=Pt(8);s.paragraph_format.keep_with_next=True
for name,size in [('Report Code',9.5),('Report Caption',10.5),('Report Source',9),('Report TOC',11),('Report Front',16)]:
 if name not in D.styles:D.styles.add_style(name,WD_STYLE_TYPE.PARAGRAPH)
 st=D.styles[name];st.font.name='DejaVu Sans Mono' if name=='Report Code' else 'Arial';st.font.size=Pt(size);st.font.color.rgb=RGBColor(0,0,0);st.paragraph_format.space_after=Pt(4);st.paragraph_format.line_spacing=1.1
D.styles['Report TOC'].font.size=Pt(10.5);D.styles['Report TOC'].paragraph_format.space_after=Pt(2)
D.styles['Report Front'].font.bold=True;D.styles['Report Front'].paragraph_format.space_after=Pt(12)
D.styles['Report Caption'].paragraph_format.keep_with_next=True
D.styles['Report TOC'].paragraph_format.tab_stops.add_tab_stop(Cm(15.8),WD_ALIGN_PARAGRAPH.RIGHT)
META={'headings':[],'figures':[],'tables':[]};chapter=0;figcount={};tblcount={};pending_caption=None

def clean(s):return s.replace('**','').replace('`','').replace('/tmp/caro-report-expanded/evidence_inventory.json','report_caro_2026/evidence_inventory.json')
def paragraph(s,style=None):
 p=D.add_paragraph(style=style)
 # Preserve code spacing and literal operators. Bold/inline code are semantic spans.
 if style=='Report Code':p.add_run(s)
 else:
  for i,part in enumerate(re.split(r'(\*\*.*?\*\*|`[^`]+`)',s)):
   if not part:continue
   value=clean(part)
   if re.search(r'\b(?:L_d|f_d|b_d|E_raw|R_opp|R_p)\b',value) and part.startswith('`'):
    p._p.append(math_object(value));continue
   r=p.add_run(value);r.bold=part.startswith('**');
   if part.startswith('`'):r.font.name='DejaVu Sans Mono';r.font.size=Pt(10.5)
 if not style:p.alignment=WD_ALIGN_PARAGRAPH.LEFT if '/' in s or 'Source:' in s or s.startswith('[') else WD_ALIGN_PARAGRAPH.JUSTIFY
 return p
def no_number(p):
 pr=p._p.get_or_add_pPr();n=OxmlElement('w:numPr');id=OxmlElement('w:numId');id.set(qn('w:val'),'0');n.append(id);pr.append(n)
def heading(s,lev=1,newpage=False):
 global chapter
 p=D.add_heading(clean(s),level=lev);no_number(p)
 if newpage:p.paragraph_format.page_break_before=True
 if s.startswith('CHƯƠNG'):chapter=int(re.search(r'CHƯƠNG (\d)',s)[1])
 bookmark='h'+str(len(META['headings'])+1);start=OxmlElement('w:bookmarkStart');start.set(qn('w:id'),str(len(META['headings'])+1));start.set(qn('w:name'),bookmark);end=OxmlElement('w:bookmarkEnd');end.set(qn('w:id'),str(len(META['headings'])+1));p._p.insert(0,start);p._p.append(end)
 META['headings'].append({'title':clean(s),'level':lev,'bookmark':bookmark})
 return p
def front(s,newpage=False):
 p=paragraph(s,'Report Front');p.paragraph_format.page_break_before=newpage;return p
def section(i):
 e=deepcopy(breaks[i])
 for x in list(e):
  if x.tag!=qn('w:pPr'):e.remove(x)
 body.insert(len(body)-1,e)
def figure(key):
 if key not in FIGS:raise ValueError('missing image '+key)
 figcount[chapter]=figcount.get(chapter,0)+1;num=f'{chapter}.{figcount[chapter]}'
 explanations={'game-desktop':'Bản build hiện hành hiển thị bàn trống với lưới 15 × 15 ở chế độ hai người chơi. Các nút chọn chế độ và điều khiển đặt ngoài canvas, còn trạng thái ván do controller cung cấp. Vị trí quân X/O sau khi đặt được minh họa ở Hình 4.2.', 'game-ai':'Ảnh được chụp sau một thao tác đặt quân ở giữa bàn và phản hồi của bot Hard. Nhãn độ sâu hoàn tất bằng 2 khớp cấu hình của mức Hard trong lần quan sát này.', 'game-mobile':'Ảnh tại viewport 390 × 844 minh họa bố cục trong vùng hiển thị hẹp. Đây là giả lập kích thước cửa sổ trên trình duyệt desktop, không là phép thử cảm ứng vật lý.', 'game-telemetry':'Bảng chi tiết hiển thị số node, lá, cutoff, lượng giá thứ tự và thời gian của một yêu cầu. Ví dụ ghi 61 node và 13 cutoff; thời gian hiển thị thuộc phạm vi hydrate–tính–cleanup của adapter. Một quan sát đơn lẻ chưa đại diện phân phối độ trễ.', 'present-components':'Sơ đồ nguồn trong present mô tả frontend DOM lịch sử với App và CaroGamePage. Ảnh được crop bằng Pillow để đọc được tên khối; cấu trúc này cần phân biệt với controller và canvas Pixi của ứng dụng hiện hành.', 'present-hooks':'Phần phóng cắt từ sơ đồ cho thấy game state, timer và domain ở các nhóm khác nhau. Đây là cách tổ chức được tài liệu trình bày mô tả; các khẳng định về số lần render vẫn cần phép đo riêng.'}
 # Explanations are placed below their own caption and name the figure explicitly.
 f=FIGS[key];impath=W/'figures'/f['file'];from PIL import Image
 with Image.open(impath) as im:w,h=im.size
 width=16.0;height=width*h/w
 if height>12.2:width*=12.2/height
 if key=='game-mobile':width=6.5
 p=D.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True
 p.add_run().add_picture(str(impath),width=Cm(width))
 title='Hình '+num+'. '+f['title'];c=paragraph(title,'Report Caption');c.alignment=WD_ALIGN_PARAGRAPH.CENTER
 z=paragraph(f['kind']+'. Nguồn: '+f['source']+'.','Report Source');z.alignment=WD_ALIGN_PARAGRAPH.CENTER
 if key in explanations:
  z.paragraph_format.keep_with_next=True;paragraph('Ở Hình '+num+', '+explanations[key][0].lower()+explanations[key][1:])
 META['figures'].append({'title':title,'key':key})
def table(lines):
 global pending_caption
 data=[[clean(c.strip()) for c in l.strip().strip('|').split('|')] for l in lines if not re.match(r'^\|\s*:?-+',l)]
 if not data:return
 tblcount[chapter]=tblcount.get(chapter,0)+1;num=f'{chapter}.{tblcount[chapter]}'
 default={'Chuỗi liên tiếp':'Trọng số các chuỗi trong engine game','Mức':'Cấu hình sáu mức bot','Độ sâu':'Dữ liệu benchmark native và TypeScript'}
 title=pending_caption or 'Bảng '+num+'. '+default.get(data[0][0],'Thông tin tổng hợp');pending_caption=None
 if chapter:title=re.sub(r'^Bảng\s+[0-9.]+\.?\s*','Bảng '+num+'. ',title)
 cp=paragraph(title,'Report Caption');cp.alignment=WD_ALIGN_PARAGRAPH.CENTER
 if chapter==3:cp.paragraph_format.page_break_before=True
 t=D.add_table(rows=1,cols=len(data[0]));t.style='Table Grid';t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
 cols=len(data[0]);widths=([1.2,7.2,7.6] if cols==3 and len(data[0][0])<5 else [16/cols]*cols)
 for row in data[1:]:t.add_row()
 for ri,row in enumerate(data):
  for ci,s in enumerate(row):
   cell=t.rows[ri].cells[ci];cell.width=Cm(widths[ci]);cell.text=s;cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   tcPr=cell._tc.get_or_add_tcPr();borders=OxmlElement('w:tcBorders')
   for name in ['top','left','bottom','right']:
    e=OxmlElement('w:'+name);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
   tcPr.append(borders);mar=OxmlElement('w:tcMar')
   for name in ['top','left','bottom','right']:
    e=OxmlElement('w:'+name);e.set(qn('w:w'),'60');e.set(qn('w:type'),'dxa');mar.append(e)
   tcPr.append(mar)
   if ri==0:shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'EDEDED');tcPr.append(shade)
   for p in cell.paragraphs:
    p.paragraph_format.line_spacing=1.1;p.paragraph_format.space_after=Pt(2);p.paragraph_format.keep_with_next=False
    for r in p.runs:r.font.size=Pt(9.5 if chapter==3 or cols>=6 else 10);r.font.name='Arial';r.bold=ri==0
  pr=t.rows[ri]._tr.get_or_add_trPr();cant=OxmlElement('w:cantSplit');pr.append(cant)
 pr=t.rows[0]._tr.get_or_add_trPr();pr.append(OxmlElement('w:tblHeader'));paragraph('')
 META['tables'].append({'title':title})
def math_object(s):
 o=OxmlElement('m:oMath')
 def mr(text):
  r=OxmlElement('m:r');t=OxmlElement('m:t');t.text=text;r.append(t);return r
 at=0
 for m in re.finditer(r'([∑⊕])_\{([^}]+)\}|([A-Za-z])_([A-Za-z]+)',s):
  if m.start()>at:o.append(mr(s[at:m.start()]))
  sub=OxmlElement('m:sSub');e=OxmlElement('m:e');e.append(mr(m[1] or m[3]));v=OxmlElement('m:sub')
  for child in list(math_object(m[2] or m[4])):v.append(child)
  sub.extend([e,v]);o.append(sub);at=m.end()
 if at<len(s):o.append(mr(s[at:]))
 return o
def equation(s):
 p=D.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.space_after=Pt(8);p._p.append(math_object(s))

# Assemble a complete coherent six-chapter manuscript from verified source-grounded sections.
system=(W/'system.md').read_text(); algorithms=(W/'algorithms.md').read_text();res=(W/'results_inventory.md').read_text()
s1,s3,s4=re.split(r'(?=^# CHƯƠNG [34]\.)',system,flags=re.M)
alg=[];secno=0
for l in algorithms.splitlines():
 if l.startswith('## 16.'):break
 if l.startswith('# '):l='# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÁC THUẬT TOÁN'
 elif re.match(r'^## \d+\.',l):
  secno=int(re.search(r'\d+',l)[0]);l=re.sub(r'^## \d+\.','## 2.'+str(secno)+'.',l)
 elif re.match(r'^### \d+\.\d+\.',l):l=re.sub(r'^### (\d+)\.(\d+)\.',r'### 2.\1.\2.',l)
 alg.append(l)
alg='\n'.join(alg)
ch5,rest=res.split('# CHƯƠNG 6.',1);ch6,apps=('# CHƯƠNG 6.'+rest).split('# PHỤ LỤC A.',1);appA,appBC=('# PHỤ LỤC A.'+apps).split('# PHỤ LỤC B.',1)
extra=[]
for l in appA.splitlines()[1:]:
 m=re.match(r'^## A\.(\d+)\. (.*)',l)
 if m:l='## 5.'+str(5+int(m[1]))+'. '+m[2]
 extra.append(l)
ch5+='\n'+'\n'.join(extra)
MAIN=s1+'\n'+alg+'\n'+s3+'\n'+s4+'\n'+ch5+'\n'+ch6
APP='# PHỤ LỤC B.'+appBC
APP=APP.replace('PHỤ LỤC B. TỔNG HỢP','PHỤ LỤC A. TỔNG HỢP').replace('## B.','## A.').replace('PHỤ LỤC C. KIỂM KÊ','PHỤ LỤC B. KIỂM KÊ').replace('## C.','## B.').replace('Phụ lục B;','Phụ lục A;')
APP=APP.replace('Danh sách máy đọc tại `/tmp/caro-report-expanded/evidence_inventory.json`','Danh sách máy đọc trong tệp `report_caro_2026/evidence_inventory.json`')
(W/'manuscript.md').write_text(MAIN+'\n'+APP)
# Preliminary pages, real cached TOC/results are filled after rendering.
front('TÓM TẮT')
paragraph('Đồ án xây dựng website cờ Caro trên bàn 15 × 15 với chế độ hai người chơi và người chơi đối đầu với bot nhiều mức độ khó. Ứng dụng hiện hành sử dụng React, TypeScript và PixiJS; engine Rust được biên dịch thành WebAssembly và thực thi qua Web Worker. Luật thắng là Freestyle Gomoku, công nhận chuỗi từ năm quân liên tiếp trở lên. Báo cáo trình bày cơ sở dữ liệu bàn cờ, bất biến đặt và hoàn tác quân, quét thắng theo nước cuối, nhận diện chuỗi, heuristic, Random, Rule-based, sinh ứng viên Chebyshev, Minimax, Alpha-Beta và các kỹ thuật tìm kiếm nâng cao đã được nghiên cứu.')
paragraph('Nội dung được đối chiếu với mã ứng dụng, engine game, mã TypeScript legacy, thư viện Rust reference, website trình bày và hồ sơ nghiên cứu theo mười tuần. Các kỹ thuật iterative deepening, Zobrist và bảng chuyển vị được trình bày theo đúng nơi đã hiện thực; mức Master của engine game hiện hành dùng Alpha-Beta độ sâu cố định. Báo cáo giải thích công thức, pseudocode, ví dụ tính tay, độ phức tạp, lợi ích và giới hạn của từng kỹ thuật; ảnh và biểu đồ được xử lý hoặc tái dựng bằng Python từ nguồn đã xác định.')
paragraph('Kết quả đánh giá gồm dữ liệu native và kiểm thử tích hợp đã lưu, cùng lần kiểm tra lại ứng dụng ngày 27/10/2026 đạt 59 test trong 9 file, typecheck và build thành công. Những số liệu lịch sử, nội dung minh họa và kết quả quan sát browser được ghi theo phạm vi của chúng. Chưa có giải đấu đủ để hiệu chỉnh sức mạnh sáu mức bot hoặc nghiệm thu trên thiết bị cảm ứng và host Wink thực. Sản phẩm của đồ án gồm ứng dụng, nền tảng trình bày, bộ thí nghiệm và hồ sơ giải thích có khả năng truy xuất nguồn.')
paragraph('Từ khóa: Caro, Gomoku, Minimax, Alpha-Beta, heuristic, Rust, WebAssembly, Worker.')
front('DANH MỤC TỪ VIẾT TẮT',True)
for x in ['AI — Artificial Intelligence, trí tuệ nhân tạo','API — Application Programming Interface, giao diện lập trình ứng dụng','DFS — Depth-First Search, tìm kiếm theo chiều sâu','DOM — Document Object Model, mô hình đối tượng tài liệu','HUD — Heads-Up Display, vùng thông tin trạng thái trên giao diện','PRNG — Pseudorandom Number Generator, bộ sinh số giả ngẫu nhiên','PvP — Player versus Player, hai người chơi','PvE — Player versus Environment, người chơi đấu máy trong báo cáo này','TT — Transposition Table, bảng chuyển vị','UI — User Interface, giao diện người dùng','WASM — WebAssembly, định dạng mã thực thi được biên dịch cho nền web','Ply — Một nước đặt quân của một bên','Fixture — Trạng thái hoặc đầu vào được chuẩn bị để kiểm thử']:paragraph(x)
section(1)
front('MỤC LỤC')
# TOC cache paragraphs use fixed formatting to make the rendered pagination reviewable.
toc_entries=[{'title':clean(l.split(' ',1)[1]),'level':1 if l.startswith('# ') else 2} for l in (MAIN+'\n'+APP).splitlines() if (l.startswith('# ') or l.startswith('## '))]
at=next(i for i,e in enumerate(toc_entries) if e['title'].startswith('PHỤ LỤC'));toc_entries.insert(at,{'title':'TÀI LIỆU THAM KHẢO','level':1})
for title in ['PHỤ LỤC C. HƯỚNG DẪN CHẠY VÀ HỒ SƠ BÀN GIAO','C.1. Chạy ứng dụng chính','C.2. Tái chạy nghiên cứu và giới hạn dependency','C.3. Danh mục toàn bộ thư mục gốc','C.4. Hình ảnh và khả năng cập nhật','C.5. Phần còn thiếu và điều kiện chốt bản nộp']:toc_entries.append({'title':title,'level':1 if title.startswith('PHỤ LỤC') else 2})
def field_cache(entries,kind):
 for i,e in enumerate(entries):
  p=paragraph(e['title']+'\t'+str(CACHE.get(kind,{}).get(e['title'],'…')),'Report TOC');p.paragraph_format.left_indent=Cm(.45 if e.get('level',1)==2 else 0)
  no_number(p)
  if kind=='toc' and i==0:
   r=p.add_run();begin=OxmlElement('w:fldChar');begin.set(qn('w:fldCharType'),'begin');inst=OxmlElement('w:instrText');inst.set(qn('xml:space'),'preserve');inst.text=' TOC \\o "1-2" \\h \\z \\u ';sep=OxmlElement('w:fldChar');sep.set(qn('w:fldCharType'),'separate');r._r.extend([begin,inst,sep]);p._p.remove(r._r);p._p.insert(1,r._r)
  if kind=='toc' and i==len(entries)-1:
   end=OxmlElement('w:fldChar');end.set(qn('w:fldCharType'),'end');p.add_run()._r.append(end)
field_cache(toc_entries,'toc')
front('DANH MỤC HÌNH',True)
FIGLIST_START=body.index(body[-2])
FIGLIST_MARK=paragraph('FIGURE_LIST_PLACEHOLDER','Report TOC')
front('DANH MỤC BẢNG',True)
TABLIST_MARK=paragraph('TABLE_LIST_PLACEHOLDER','Report TOC')
section(2)
# Figures and equations are placed where their mechanisms are explained.
BEFORE={'1.3.':['board-index'],'3.3.':['system-architecture'],'3.5.':['state-flow'],'3.7.':['coordinate-flow'],'4.4.':['game-desktop','game-ai','game-mobile','game-telemetry'],'4.5.':['present-components','present-hooks'],'4.6.3.':['present-candidates'],'5.4.':['current-nodes'],'5.5.':['reference-nodes'],'5.7.':['legacy-benchmark']}
EQS={'2.2.1.':'i = Ny + x;  x = i mod N;  y = floor(i / N)', '2.3.1.':'L_d = 1 + f_d + b_d;   win ⇔ ∃d ∈ D : L_d ≥ 5','2.6.1.':'d∞((x₁,y₁),(x₂,y₂)) = max(|x₁−x₂|, |y₁−y₂|)','2.8.1.':'V(s,d) = maxₐ V(T(s,a),d−1)  hoặc  minₐ V(T(s,a),d−1)','2.9.1.':'α ← max(α, v);   β ← min(β, v);   cắt khi α ≥ β','2.11.':'H(B,s) = ⊕_{(x,y,p)∈B} Z(x,y,p) XOR [s = O] Z_turn'}
def markdown(text):
 global pending_caption
 ls=text.splitlines();i=0;code=False
 while i<len(ls):
  l=ls[i].rstrip();s=l.strip()
  if not s:i+=1;continue
  if s.startswith('```'):
   lines=[];i+=1
   while i<len(ls) and not ls[i].strip().startswith('```'):lines.append(ls[i]);i+=1
   z=paragraph('\n'.join(lines),'Report Code');z.paragraph_format.keep_together=True
   i+=1;continue
  if s.startswith('|'):
   rows=[]
   while i<len(ls) and ls[i].strip().startswith('|'):rows.append(ls[i]);i+=1
   table(rows);continue
  if re.match(r'^Bảng \d',s):pending_caption=s;i+=1;continue
  if s.startswith('# '):heading(s[2:],1,True);i+=1;continue
  if s.startswith('## ') or s.startswith('### '):
   lev=3 if s.startswith('### ') else 2;title=s[4:] if lev==3 else s[3:];heading(title,lev)
   for prefix,keys in BEFORE.items():
    if title.startswith(prefix):
     for key in keys:figure(key)
   for prefix,eq in EQS.items():
    if title.startswith(prefix):equation(eq)
   if title.startswith('2.11.'):
    equation('H′ = H XOR Z(move) XOR δ Z_turn')
    paragraph('Trong đó δ = 1 nếu người đến lượt đổi sau nước đi; δ = 0 nếu không đổi. Ký hiệu (x,y,p) ∈ B duyệt các ô có quân cùng màu quân tại ô đó; [s = O] bằng 1 khi O đến lượt và bằng 0 khi X đến lượt.')
   cite={'2.2.1.':'Biểu diễn mảng và cách tính offset được đối chiếu với Rust Reference [5] và source engine [7].','2.8.1.':'Cơ sở tìm trước và lượng giá thế cờ được trình bày trong nghiên cứu của Shannon [1]; hiện thực của đồ án được đối chiếu tại [7], [9].','2.9.1.':'Tính chất cắt tỉa trên cùng cây và vai trò thứ tự được đối chiếu với Knuth và Moore [2].','2.11.':'Kỹ thuật mã hóa vị trí được đối chiếu với báo cáo gốc của Zobrist [3].','3.3.':'Trách nhiệm các module được xác định từ mã ứng dụng và engine [7]; ngữ cảnh Worker tuân theo mô hình giao tiếp của HTML [4].','4.5.':'Nội dung và hình của website trình bày được đối chiếu trực tiếp từ thư mục present [11].','5.1.':'Các hồ sơ được dùng để đánh giá gồm snapshot game [8], reference [9] và benchmark lịch sử [10].'}
   for prefix,c in cite.items():
    if title.startswith(prefix):paragraph(c)
   i+=1;continue
  if s.startswith('`E_raw(B,p)'):
   for eq in ['A(B,p) = ∑_{r∈R_p} w(|r|,o(r))','D(B,p) = ∑_{r∈R_opp} w(|r|,o(r))','E_raw(B,p) = A(B,p) − D(B,p) + C(B,p)']:equation(eq)
   i+=1;continue
  if s.startswith('`V(s,d) = U(s)`'):
   paragraph('Giá trị được xác định theo bốn trường hợp:')
   for eq in ['V(s,d) = U(s)  nếu trạng thái kết thúc','V(s,0) = E(s)  nếu chưa kết thúc','V(s,d) = max {V(T(s,a),d−1) : a ∈ A(s)}  khi MAX đi','V(s,d) = min {V(T(s,a),d−1) : a ∈ A(s)}  khi MIN đi']:equation(eq)
   i+=1;continue
  keys=re.findall(r'!FIG\[([^]]+)\]',s);s=re.sub(r'!FIG\[[^]]+\]','',s).strip()
  if s:paragraph(('• '+s[2:]) if s.startswith('- ') else s)
  for key in keys:figure(key)
  i+=1
markdown(MAIN)
section(3)
heading('TÀI LIỆU THAM KHẢO',1)
refs=[
'[1] C. E. Shannon, “Programming a computer for playing chess,” Philosophical Magazine, vol. 41, no. 314, pp. 256–275, 1950, doi: 10.1080/14786445008521796.',
'[2] D. E. Knuth and R. W. Moore, “An analysis of alpha-beta pruning,” Artificial Intelligence, vol. 6, no. 4, pp. 293–326, 1975. https://doi.org/10.1016/0004-3702(75)90019-3',
'[3] A. L. Zobrist, “A New Hashing Method With Application for Game Playing,” University of Wisconsin–Madison, Technical Report 88, 1970. https://research.cs.wisc.edu/techreports/1970/TR88.pdf',
'[4] WHATWG, “Workers,” HTML Living Standard. Truy cập 27/10/2026. https://html.spec.whatwg.org/multipage/workers.html',
'[5] The Rust Project, “Type layout” và “Array types,” The Rust Reference. Truy cập 27/10/2026. https://doc.rust-lang.org/reference/type-layout.html ; https://doc.rust-lang.org/reference/types/array.html',
'[6] WebAssembly Community Group, “WebAssembly specifications.” Truy cập 27/10/2026. https://webassembly.org/specs/',
'[7] Dự án Caro, mã ứng dụng tại /home/pro/Downloads/basicproject/CaroGame/src và tests; engine tại /home/pro/Downloads/vnuk/basicProject/gomoku-main/engine/src; mã TypeScript legacy tại CaroGame/src/game/bot. Bản được đọc ngày 27/10/2026.',
'[8] Dự án Caro, “Gate ledger” và dữ liệu snapshot 23/10/2026, research/current_2026_10_23: GATES.md, engine_search_runs.csv, engine_search_summary.csv, engine_verification.json, wasm_ts_parity.json, wasm_package.json. Log đầy đủ tại /home/pro/Downloads/vnuk/basicProject/research/current_2026_10_23.',
'[9] Dự án Caro, “Week 05–09 reports and experiments,” nghiên cứu reference native ngày 17/10/2026. research/week_05_09/results, caro-core-reference/src.',
'[10] Dự án Caro, các harness và dữ liệu benchmark lịch sử. benchmark/rust_bench, benchmark/ts_bench, benchmark/results/benchmark_data.json, week4_bot_battle.json; scripts/benchmark_rust_vs_ts.py.',
'[11] Dự án Caro, ứng dụng trình bày và tài sản hình ảnh. present/src, present/public/assets, present/public/data và present/scripts/generate_charts.py. Bản được đọc ngày 27/10/2026.',
'[12] Dự án Caro, hồ sơ chủ đề Week1–Week10, PLAN.md, ROADMAP.md, LAYOUT.md, Week_05_09_Report_Index.md và Caro_Rules_Heuristic_Rust_WASM_Review.md. Bản lưu tại /home/pro/Downloads/basicproject.'
]
for r in refs:paragraph(r)
section(4)
chapter=0;markdown(APP)
heading('PHỤ LỤC C. HƯỚNG DẪN CHẠY VÀ HỒ SƠ BÀN GIAO',1,True)
heading('C.1. Chạy ứng dụng chính',2)
paragraph('Ứng dụng chính có package riêng trong CaroGame. Sau khi chuẩn bị Node.js tương thích và npm, cài dependency theo lockfile, chạy dev server hoặc kiểm thử/build bằng các script của package. Các lệnh dưới đây mô tả quy trình, không thay thế kết quả kiểm tra môi trường cụ thể.')
for l in ['cd /home/pro/Downloads/basicproject/CaroGame','npm ci','npm run typecheck','npm test','npm run build']:paragraph(l,'Report Code')
paragraph('Để mở dev server, chạy npm run dev ở terminal riêng; lệnh này duy trì tiến trình ở foreground cho tới khi dừng. Các lệnh kiểm thử và build phía trên chạy độc lập với dev server.')
paragraph('Trong lần biên soạn này, Node.js 24.22.1 được dùng cho test, typecheck và build. Vite 8.3.1 đóng gói thành công, ghi WASM 111,58 kB trước gzip và 34,14 kB sau gzip. Cảnh báo __dirname trong config và chunk lớn hơn 500 kB vẫn xuất hiện. Không tự sửa dependency hoặc cấu hình project để làm thay đổi phạm vi của báo cáo.')
heading('C.2. Tái chạy nghiên cứu và giới hạn dependency',2)
paragraph('Engine Rust nguồn và reference core tồn tại ở không gian /home/pro/Downloads/vnuk/basicProject. Manifest benchmark của checkout báo cáo còn trỏ dependency tương đối tới vị trí không tồn tại. Người tái lập cần chuẩn bị đúng source hoặc điều chỉnh manifest trong một bản sao riêng và lưu lại thay đổi cùng hash. Không chạy runner ghi đè lên dữ liệu lịch sử khi chưa sao lưu.')
for l in ['cd /home/pro/Downloads/vnuk/basicProject','cargo test --manifest-path gomoku-main/engine/Cargo.toml','cargo test --manifest-path caro-core-reference/Cargo.toml']:paragraph(l,'Report Code')
paragraph('Hai lệnh Cargo trên là hướng dẫn theo vị trí source đã quan sát; báo cáo này không ghi chúng như lệnh vừa chạy ngày 27/10. Các kết quả native trong chương 5 có ngày và nguồn riêng.')
heading('C.3. Danh mục toàn bộ thư mục gốc',2)
roles={'.gemini':'Cấu hình hướng dẫn cục bộ','.git':'Metadata và lịch sử repository','.obsidian':'Cấu hình môi trường Obsidian','CaroGame':'Ứng dụng React/Pixi, core TypeScript, Worker/WASM và kiểm thử','Week1':'Đề cương, luật, mô hình trạng thái và hình','Week2':'Core TypeScript và ghi chú kiểm chứng','Week3':'Báo cáo UI, vòng đời và sơ đồ','Week4':'Pattern, heuristic, bot cơ sở và hình','Week5':'Nghiên cứu Minimax và thí nghiệm reference','Week6':'Nghiên cứu Alpha-Beta','Week7':'Sinh ứng viên và cấu hình mức khó','Week8':'Nghiên cứu thứ tự duyệt','Week9':'Zobrist và bảng chuyển vị','Week10':'Iterative deepening và kế hoạch đánh giá','archived':'Bản nháp và roadmap lịch sử','assets':'Biểu đồ, sơ đồ và bàn mẫu','benchmark':'Harness Rust native, TypeScript Node và JSON tổng hợp','present':'Website giải thích, mô phỏng và bản sao dữ liệu','research':'Dữ liệu engine/reference, snapshot và provenance','rules':'Hướng dẫn layout, roadmap và hình ảnh','scripts':'Script sinh hình, benchmark và roadmap'}
inv=json.loads((W/'evidence_inventory.json').read_text());rows=['| Thư mục | Số file trong kiểm kê | Vai trò |','| --- | ---: | --- |']
for e in inv['root_entries']:
 if e['kind']=='directory':rows.append('| '+Path(e['path']).name+' | '+str(e.get('file_count') if e.get('file_count') is not None else 'metadata')+' | '+roles.get(Path(e['path']).name,e.get('role','Hồ sơ dự án'))+' |')
pending_caption='Bảng C.1. Kiểm kê các thư mục gốc theo vai trò';table(rows)
paragraph('Danh sách chi tiết từng file và hash dataset được đóng gói tại report_caro_2026/evidence_inventory.json. Phạm vi kiểm kê loại nội bộ Git, node_modules, target và dist; các thư mục output báo cáo tạo sau thời điểm kiểm kê được ghi trong manifest bàn giao.')
heading('C.4. Hình ảnh và khả năng cập nhật',2)
paragraph('Bộ hình của báo cáo được tạo bằng Python với matplotlib và Pillow. Script dựng sơ đồ thuật toán, vẽ biểu đồ trực tiếp từ CSV/JSON, crop các vùng ảnh tài liệu lịch sử và chuẩn hóa ảnh chụp giao diện. Mỗi hình có caption, loại nội dung và nguồn. Ảnh browser ngày 27/10 minh họa bản build local và một lượt bot Hard; thao tác trên canvas dùng sự kiện pointer tổng hợp. Đây không phải kiểm thử ngón tay trên thiết bị thật hoặc kết quả benchmark tổng quát.')
heading('C.5. Phần còn thiếu và điều kiện chốt bản nộp',2)
paragraph('Thông tin sinh viên, MSSV, lớp, giảng viên và năm học đã được cung cấp. Ngày bắt đầu, ngày kết thúc thực hiện và ngày nộp cụ thể chưa được xác nhận. Tên mở rộng trên bìa được xây dựng từ nội dung đề cương, cần khớp tên đề tài đã được giảng viên phê duyệt. Báo cáo đã trình bày những phần còn nghiên cứu, các claim của present chưa có provenance và giới hạn nghiệm thu. Nếu môn học có quy định riêng về bìa, phông hoặc dung lượng, áp dụng quy định chính thức đó trước khi nộp.')
# Materialize current lists from figure/table metadata without outsourcing completion to the reader.
def replace_list(marker,entries,kind):
 at=body.index(marker._p)
 for e in entries:
  p=paragraph(e['title']+'\t'+str(CACHE.get(kind,{}).get(e['title'],'…')),'Report TOC');body.remove(p._p);body.insert(at,p._p);at+=1
 body.remove(marker._p)
replace_list(FIGLIST_MARK,META['figures'],'figures');replace_list(TABLIST_MARK,META['tables'],'tables')
# Continuous decimal body numbering; front matter uses source Roman conventions.
secs=D.sections;footer=deepcopy(next(x for x in secs[4]._sectPr if x.tag==qn('w:footerReference') and x.get(qn('w:type'))=='default'))
for idx in (3,4,5):
 sp=secs[idx]._sectPr
 for e in list(sp):
  if e.tag==qn('w:footerReference') and e.get(qn('w:type'))=='default':sp.remove(e)
 sp.insert(0,deepcopy(footer));pg=sp.find(qn('w:pgNumType'))
 if pg is None:pg=OxmlElement('w:pgNumType');sp.append(pg)
 pg.set(qn('w:fmt'),'decimal')
 if idx==3:pg.set(qn('w:start'),'1')
 elif qn('w:start') in pg.attrib:del pg.attrib[qn('w:start')]
upd=D.settings.element.find(qn('w:updateFields'))
if upd is None:upd=OxmlElement('w:updateFields');D.settings.element.append(upd)
upd.set(qn('w:val'),'true')
D.save(DEST)
# Restore untouched opaque package structures byte for byte after python-docx serialization.
tmp=DEST.with_suffix('.stage.docx')
with ZipFile(REF) as a,ZipFile(DEST) as b,ZipFile(tmp,'w') as c:
 for e in b.infolist():
  n=e.filename;preserve=(n.startswith(('word/header','word/footer')) and n.endswith('.xml')) or n=='word/numbering.xml';c.writestr(e,a.read(n) if preserve and n in a.namelist() else b.read(n))
os.replace(tmp,DEST)
META['toc']=toc_entries;META['word_count']=len((MAIN+APP).split());(W/'document_metadata.json').write_text(json.dumps(META,ensure_ascii=False,indent=2));print(json.dumps({'output':str(DEST),'words':META['word_count'],'figures':len(META['figures']),'tables':len(META['tables']),'headings':len(META['headings'])}))
