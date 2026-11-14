from pathlib import Path
import sys,json,csv,math,shutil
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle,Circle,FancyBboxPatch
from PIL import Image,ImageOps,ImageChops
ROOT=Path(__file__).resolve().parent; OUT=ROOT/'figures';OUT.mkdir(exist_ok=True)
BASE=ROOT.parent
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False})
REG={}
def save(fig,key,title,source,kind='Sơ đồ giải thích dựng từ mã nguồn',height=None):
 fig.savefig(OUT/(key+'.png'),dpi=300,bbox_inches='tight',facecolor='white');plt.close(fig)
 REG[key]={'file':key+'.png','title':title,'source':source,'kind':kind}
def boxes(key,title,labels,source):
 fig,ax=plt.subplots(figsize=(7.2,.86*len(labels)+.3));ax.set(xlim=(0,10),ylim=(0,len(labels)));ax.axis('off')
 for i,s in enumerate(labels):
  y=len(labels)-i-.72
  ax.add_patch(FancyBboxPatch((.2,y),9.6,.54,boxstyle='round,pad=.04',facecolor='#f2f4f6',edgecolor='#555'))
  ax.text(5,y+.27,s,ha='center',va='center',fontsize=10)
  if i<len(labels)-1:ax.annotate('',(5,y-.38),(5,y-.04),arrowprops={'arrowstyle':'->','lw':1.4})
 save(fig,key,title,source)
def board(ax,stones,n=15,candidates=None):
 ax.set_xlim(-.5,n-.5);ax.set_ylim(n-.5,-.5);ax.set_aspect('equal')
 if candidates:
  for y,x in candidates:ax.add_patch(Rectangle((x-.45,y-.45),.9,.9,color='#e1edf5',ec='none'))
 ax.set_xticks([0,5,10,14]);ax.set_yticks([0,5,10,14]);ax.set_xticks(np.arange(-.5,n,1),minor=True);ax.set_yticks(np.arange(-.5,n,1),minor=True);ax.grid(which='minor',color='#b8b8b8',lw=.5);ax.tick_params(which='minor',length=0)
 ax.tick_params(labelsize=8)
 for y,x,p in stones:ax.text(x,y,p,ha='center',va='center',fontsize=14,fontweight='bold',color='#174c6f' if p=='O' else '#9e442c')
 ax.set_xlabel('Cột x');ax.set_ylabel('Hàng y')
# Board representation and four directional scanner.
fig,ax=plt.subplots(figsize=(6,5));board(ax,[(7,7,'X'),(7,8,'O')]);ax.annotate('i = 15y + x = 112',(7,7),(1,3),arrowprops={'arrowstyle':'->'},fontsize=10);save(fig,'board-index','Biểu diễn bàn 15 × 15 và chỉ số theo hàng','board.rs; core/types.ts')
fig,axs=plt.subplots(1,3,figsize=(8,3));
for ax,extra,title in zip(axs,[[],[(8,7,'X')],[]],['B trước thử nước','B\' sau place','B sau undo']):board(ax,[(7,7,'X'),(7,8,'O')]+extra,n=15);ax.set_title(title,fontsize=10)
save(fig,'apply-undo','Bất biến khôi phục trạng thái sau place và undo','engine/src/board.rs::{place,undo}')
fig,ax=plt.subplots(figsize=(6,5));board(ax,[(7,7,'X'),(7,5,'X'),(7,6,'X'),(7,8,'X'),(7,9,'X')]);
for dx,dy in [(1,0),(0,1),(1,1),(1,-1)]:ax.plot([7-4*dx,7+4*dx],[7-4*dy,7+4*dy],lw=2,alpha=.5)
ax.set_title('L = 1 + 2 + 2 = 5; Freestyle công nhận L ≥ 5',fontsize=11);save(fig,'win-axes','Bốn trục kiểm tra thắng quanh nước cuối','board.rs::check_winner_at; WinRules.ts')
# Explicit conditional flow: selecting a move exits the decision process.
fig,ax=plt.subplots(figsize=(7.4,5.3));ax.set(xlim=(0,10),ylim=(0,8));ax.axis('off')
def box(x,y,text,w=3,h=.65):
 ax.add_patch(FancyBboxPatch((x-w/2,y-h/2),w,h,boxstyle='round,pad=.06',fc='#f2f4f6',ec='#555'));ax.text(x,y,text,ha='center',va='center',fontsize=10)
def arrow(a,b,label=None):
 ax.annotate('',b,a,arrowprops={'arrowstyle':'->','lw':1.3})
 if label:ax.text((a[0]+b[0])/2+.1,(a[1]+b[1])/2+.1,label,fontsize=9)
box(3,7.4,'Chưa terminal → ứng viên',4);box(3,5.9,'Có nước thắng ngay?',3.5);box(7.4,5.9,'Chọn nước thắng',3.3);arrow((3,7),(3,6.3));arrow((4.8,5.9),(5.7,5.9),'Có')
box(3,4,'Có ô cần chặn?',3.5);box(7.4,4,'Chọn ô chặn',3.3);arrow((3,5.5),(3,4.4),'Không');arrow((4.8,4),(5.7,4),'Có')
box(3,1.9,'Heuristic một ply\nChọn điểm tốt nhất',4,1);arrow((3,3.6),(3,2.5),'Không');box(7.4,.6,'Trả nước và dừng',3.3);arrow((9.1,5.9),(9.6,5.9));ax.plot([9.6,9.6],[5.9,.6],color='#555',lw=1.2);arrow((9.6,.6),(9.1,.6));arrow((9.1,4),(9.35,4));ax.plot([9.35,9.35],[4,.6],color='#555',lw=1.2);arrow((5.1,1.9),(6.3,1),'')
save(fig,'rule-decision','Các nhánh ưu tiên của bot Rule-based','engine/src/ai.rs::baseline')
fig,ax=plt.subplots(figsize=(7,3.7));ax.axis('off');pats=[('.XXXXX.',1000000),('.XXXX.',50000),('OXXXX.',5000),('.XXX.',5000),('OXXX.',500),('.XX.',200),('OXX.',50)]
for i,(pat,w) in enumerate(pats):ax.text(.03,1-i*.145,pat,fontfamily='DejaVu Sans Mono',fontsize=13);ax.text(.47,1-i*.145,f'{w:,}'.replace(',','.'),fontsize=12)
ax.text(.03,1.15,'Chuỗi minh họa',weight='bold');ax.text(.47,1.15,'Trọng số engine game',weight='bold');save(fig,'heuristic-runs','Chuỗi liên tiếp và trọng số trong engine hiện hành','engine/src/eval.rs::pattern_score')
fig,axs=plt.subplots(1,3,figsize=(8,3.5));
for ax,(r,y,x) in zip(axs,[(1,7,7),(2,7,7),(2,0,0)]):
 c={(a,b) for a in range(15) for b in range(15) if 0<max(abs(a-y),abs(b-x))<=r};board(ax,[(y,x,'X')],candidates=c);ax.set_title(f'r = {r}, |C| = {len(c)}',fontsize=10)
save(fig,'chebyshev-radius','Ảnh hưởng bán kính và biên bàn tới tập ứng viên','board.rs::get_candidates; minh họa một quân')
fig,ax=plt.subplots(figsize=(7.2,3.6));ax.set(xlim=(0,10),ylim=(0,5));ax.axis('off')
def rect(x,y,label,w=4):
 ax.add_patch(FancyBboxPatch((x-w/2,y-.38),w,.76,boxstyle='round,pad=.04',fc='#f2f4f6',ec='#555'));ax.text(x,y,label,ha='center',va='center',fontsize=10)
rect(5,4.4,'Membership đã chọn: {A, C, E}',7)
rect(2.5,2.7,'Ordering tắt\nA → C → E');rect(7.5,2.7,'Ordering bật\nE → A → C')
for a,b in [((4,4),(2.5,3.1)),((6,4),(7.5,3.1)),((2.5,2.3),(4,.95)),((7.5,2.3),(6,.95))]:ax.annotate('',b,a,arrowprops={'arrowstyle':'->'})
rect(5,.55,'Hai cấu hình cùng cây; có thể khác số node',8.6)
save(fig,'ordering','So sánh hai thứ tự duyệt trên cùng membership','engine/src/candidates.rs')
def tree(key,prune=False):
 fig,ax=plt.subplots(figsize=(7,3.7));ax.set(xlim=(0,10),ylim=(0,5));ax.axis('off');pos=[(5,4.3),(2.5,2.7),(7.5,2.7),(1.2,.9),(3.8,.9),(6.2,.9),(8.8,.9)];texts=['MAX = 3','MIN = 3','MIN = 2','3','5','2','9']
 if prune:texts[2]='MIN ≤ 2'
 for a,b in [(0,1),(0,2),(1,3),(1,4),(2,5),(2,6)]:
  x,y=pos[a];u,v=pos[b];ax.plot([x,u],[y,v],color='#b54a39' if prune and b==6 else '#777',ls='--' if prune and b==6 else '-',lw=1.5)
 for i,((x,y),s) in enumerate(zip(pos,texts)):ax.text(x,y,s,ha='center',va='center',bbox={'boxstyle':'round,pad=.4','fc':'#f3f3f3','ec':'#555'},fontsize=11,color='#b54a39' if prune and i==6 else 'black')
 if prune:ax.text(5,.05,'Sau nhánh trái: α = 3; nhánh phải gặp 2 ⇒ β = 2 ≤ α ⇒ bỏ lá 9',ha='center',fontsize=10)
 save(fig,key,'Cây Alpha-Beta với một lá được cắt' if prune else 'Ví dụ Minimax với hai tầng quyết định','Ví dụ toán học tác giả dựng; search.rs')
tree('minimax-tree');tree('alpha-beta-cutoff',True)
fig,ax=plt.subplots(figsize=(7,3.1));ax.barh(['Độ sâu 1','Độ sâu 2','Độ sâu 3'],[1,2.3,3.4],color=['#94b7c7','#527e91','#d5a29b']);ax.axvline(2.8,color='#9d3b29',ls='--');ax.text(2.85,2.1,'Ngân sách bị chạm',fontsize=10);ax.set_xlabel('Tiến trình minh họa, không phải thời gian đo');ax.set_xticks([]);save(fig,'iterative-depth','Iterative deepening giữ kết quả vòng hoàn tất gần nhất','reference search/iterative.rs; sơ đồ nguyên lý')
boxes('zobrist-xor','Cập nhật và hoàn tác Zobrist bằng XOR',['H = 1010, khóa của nước m: Z = 0110','Apply: H\' = 1010 XOR 0110 = 1100','Undo: H\' XOR 0110 = 1010 = H','Thêm khóa bên đến lượt và ngữ cảnh theo thiết kế','Hash có thể va chạm; không là định danh tuyệt đối'],'reference zobrist.rs; ví dụ 4 bit')
fig,ax=plt.subplots(figsize=(7,2.8));ax.set_ylim(-1,1);ax.set_xlim(0,10);ax.axhline(0,color='#555');ax.axvspan(3,8,color='#e4edf2');
for x,label in [(2,'Upper\nv ≤ α gốc'),(5,'Exact\nα < v < β'),(9,'Lower\nv ≥ β gốc')]:ax.plot(x,0,'o',color='#35566c');ax.text(x,.23,label,ha='center',fontsize=11)
ax.set_xticks([2,3,5,8,9]);ax.set_yticks([]);ax.set_xlabel('Ví dụ cửa sổ gốc [α, β] = [3, 8]');save(fig,'tt-bounds','Ba loại kết quả lưu trong bảng chuyển vị','reference search/optimized.rs; ví dụ toán')
def graph_node(ax,x,y,label,w=3.2,h=.7):
 ax.add_patch(FancyBboxPatch((x-w/2,y-h/2),w,h,boxstyle='round,pad=.04',fc='#f2f4f6',ec='#555'));ax.text(x,y,label,ha='center',va='center',fontsize=9.5)
def edge(ax,a,b,label='',style='->',rad=0):
 ax.annotate('',b,a,arrowprops={'arrowstyle':style,'lw':1.2,'connectionstyle':f'arc3,rad={rad}'})
 if label:ax.text((a[0]+b[0])/2,(a[1]+b[1])/2+.12,label,ha='center',fontsize=8.5,bbox={'fc':'white','ec':'none','pad':.1})
fig,ax=plt.subplots(figsize=(7.5,5.0));ax.set(xlim=(0,10),ylim=(0,7));ax.axis('off')
graph_node(ax,5,6.3,'Controller: snapshot + token + roundId',7)
graph_node(ax,5,4.8,'AIController: chọn tuyến theo mode và mức',7)
graph_node(ax,2.5,3.1,'Tactical có nước\nrow,col; score null',4,1);graph_node(ax,7.5,3.1,'Cần Rust: Worker/WASM\nHydrate → strategy',4,1)
graph_node(ax,7.5,1.6,'Đổi (x,y) → (row,col)\nscore + counters',4,1)
graph_node(ax,3.3,.4,'Controller kiểm token/lượt → commit',6)
edge(ax,(5,5.9),(5,5.2));edge(ax,(4,4.4),(2.5,3.7),'Hard+ có nước');edge(ax,(6,4.4),(7.5,3.7),'các trường hợp khác');edge(ax,(7.5,2.5),(7.5,2.2));edge(ax,(2.5,2.5),(2.5,.8));edge(ax,(7.5,1),(6.3,.4))
save(fig,'ai-pipeline','Hai tuyến tactical và Rust được nhập tại controller','AIController.ts; executeSearch.ts; GameController.ts')
fig,ax=plt.subplots(figsize=(7.5,4.5));ax.set(xlim=(0,10),ylim=(0,6));ax.axis('off')
graph_node(ax,2,5,'React UI',3);graph_node(ax,6.3,5,'GameController',4)
graph_node(ax,1.8,2.9,'Pixi canvas\ninput + render',3,1);graph_node(ax,5.5,2.9,'Core / state\nluật + lịch sử',3,1);graph_node(ax,8.5,1.6,'AI adapter\nWorker / WASM',2.7,1)
edge(ax,(3.6,5),(4.3,5),'','<->');ax.text(4,5.65,'action / snapshot',ha='center',fontsize=9);edge(ax,(4.7,4.6),(2.2,3.5),'cell / snapshot','<->');edge(ax,(6,4.6),(5.5,3.5),'read / mutate','<->');edge(ax,(8,4.6),(8.5,2.2),'request / result','<->')
save(fig,'system-architecture','Trách nhiệm và liên hệ giữa controller, core, Pixi và AI','CaroGame/src/{app,game,pixi,board}')
fig,ax=plt.subplots(figsize=(7.5,4.6));ax.set(xlim=(0,10),ylim=(0,6));ax.axis('off')
graph_node(ax,1.5,5.2,'setup / ready',2.6);graph_node(ax,5.5,5.2,'playing',2.3);graph_node(ax,8.3,3.1,'chờ AI\n(thinking)',2.7,1);graph_node(ax,2.9,2.2,'game-over\nwin / draw',3,1)
edge(ax,(2.85,5.2),(4.3,5.2),'playCell');edge(ax,(6.2,4.8),(7.8,3.7));edge(ax,(7,3.1),(5.8,4.8),rad=-.25);ax.text(8.1,4.55,'request',ha='center',fontsize=9);ax.text(6.65,3.7,'nước hợp lệ',ha='center',fontsize=9,bbox={'fc':'white','ec':'none','pad':.1});edge(ax,(5,4.8),(3.1,2.75));ax.text(3.1,3.7,'thắng / hòa',ha='center',fontsize=9,bbox={'fc':'white','ec':'none','pad':.1})
graph_node(ax,5,.55,'Undo → playing/ready; Replay → playing\nNew game → setup; đổi mode/mức → ready (đều hủy lượt AI)',9.2,.8)
save(fig,'state-flow','Trạng thái ván và các nhánh yêu cầu hoặc hủy AI','GameController.ts; GameState.ts; thinking là trạng thái chờ hiển thị')
boxes('coordinate-flow','Biến đổi tọa độ và kiểm tra biên',['Con trỏ client → tọa độ tương đối canvas','Trừ camera.x / camera.y rồi chia camera.zoom','col = floor(worldX / CELL_SIZE)','row = floor(worldY / CELL_SIZE)','Kiểm tra 0 ≤ row,col < 15 rồi gửi action'], 'BoardInputController.ts; CoordinateTransform.ts')
# Measured charts reconstructed from source data.
with open(BASE/'research/current_2026_10_23/engine_search_summary.csv') as f:rows=list(csv.DictReader(f))
r=[x for x in rows if x['fixture']=='clustered' and x['requested_depth']=='2' and x['soft_cap']=='8']
fig,ax=plt.subplots(figsize=(7,4));sel=[x for x in r if (x['algorithm'],x['ordered']) in [('minimax','false'),('alpha_beta','false'),('alpha_beta','true')]];labels=['Minimax','Alpha-Beta','Alpha-Beta\nordered']; vals=[int(x['nodes']) for x in sel];ax.bar(labels,vals,color=['#97aab5','#4c748c','#274b60']);
for i,v in enumerate(vals):ax.text(i,v+1,str(v),ha='center')
ax.set_ylabel('Node thăm');ax.set_ylim(0,max(vals)*1.22);ax.set_title('Engine game native: clustered, d = 2, r = 2, cap mềm 8',fontsize=10);save(fig,'current-nodes','Số node của cùng cấu hình tìm kiếm trên engine game','research/current_2026_10_23/engine_search_summary.csv','Biểu đồ từ dữ liệu native đã lưu')
fig,ax=plt.subplots(figsize=(7,4));vals=[48842,10939];ax.bar(['Minimax','Alpha-Beta'],vals,color=['#97aab5','#4c748c']);
for i,v in enumerate(vals):ax.text(i,v+600,f'{v:,}'.replace(',','.'),ha='center')
ax.set_ylim(0,58000);ax.set_ylabel('Node thăm');ax.set_title('Reference native: clustered, d = 2, full legal, unordered',fontsize=10);save(fig,'reference-nodes','So sánh số node trên reference core','research/week_05_09/results/search_summary.csv','Biểu đồ từ dữ liệu native đã lưu')
data=json.loads((BASE/'benchmark/results/benchmark_data.json').read_text()); ds=[x['depth'] for x in data['rust']]; rt=[x['time_ms'] for x in data['rust']]; ts=[x['time_ms'] for x in data['typescript']]
fig,axs=plt.subplots(1,2,figsize=(8,4));axs[0].plot(ds,rt,'o-',label='Rust native');axs[0].plot(ds,ts,'s-',label='TypeScript Node');axs[0].set_yscale('log');axs[0].set(xlabel='Độ sâu',ylabel='Thời gian trung bình (ms, log)');axs[0].legend(fontsize=8);ratio=[t/r for t,r in zip(ts,rt)];axs[1].bar(ds,ratio,color='#4c748c');axs[1].set(xlabel='Độ sâu',ylabel='Tỉ số thời gian TS / Rust');
for x,y in zip(ds,ratio):axs[1].text(x,y+.25,f'{y:.2f}',ha='center',fontsize=9)
axs[1].set_ylim(0,29);fig.tight_layout();save(fig,'legacy-benchmark','Benchmark native và TypeScript trên một fixture midgame','benchmark/results/benchmark_data.json; một fixture, lịch sử','Biểu đồ tái dựng dữ liệu benchmark lịch sử')
# Source images processed with Pillow: preserve visual meaning, normalize canvas, never upscale beyond 2x.
def process(src,key,title,source,kind='Ảnh nguồn đã xử lý bằng Python'):
 im=Image.open(src).convert('RGB');bg=Image.new('RGB',im.size,'white');box=ImageChops.difference(im,bg).getbbox();
 if box:im=im.crop((max(0,box[0]-8),max(0,box[1]-8),min(im.width,box[2]+8),min(im.height,box[3]+8)))
 im.thumbnail((2400,2400),Image.Resampling.LANCZOS);im=ImageOps.expand(im,border=14,fill='white');im.save(OUT/(key+'.png'),dpi=(300,300));REG[key]={'file':key+'.png','title':title,'source':source,'kind':kind}
process(ROOT/'game-desktop.png','game-desktop','Giao diện hai người chơi trên bản build local','Ảnh chụp Chrome ngày 27/10/2026, 1365 × 900','Ảnh chụp trình duyệt local')
process(ROOT/'game-ai.png','game-ai','Ván đấu máy sau một lượt người và một lượt bot','Ảnh chụp Chrome ngày 27/10/2026; Hard, completed depth 2','Ảnh chụp trình duyệt local')
process(ROOT/'game-mobile.png','game-mobile','Giao diện tại viewport 390 × 844','Ảnh chụp Chrome ngày 27/10/2026; viewport giả lập','Ảnh chụp trình duyệt local')
# Crop legible regions from the historical source diagram.
im=Image.open(BASE/'present/public/assets/component_hierarchy.png').convert('RGB');w,h=im.size
im.crop((700,0,1180,180)).save(ROOT/'present-root-crop.png')
im.crop((1370,170,w,h)).save(ROOT/'present-hooks-crop.png')
process(ROOT/'present-root-crop.png','present-components','Chi tiết khối App và trang điều phối trong sơ đồ present','present/public/assets/component_hierarchy.png; crop bằng Pillow','Ảnh tài liệu lịch sử của frontend DOM')
process(ROOT/'present-hooks-crop.png','present-hooks','Chi tiết hooks và domain trong sơ đồ present','present/public/assets/component_hierarchy.png; crop bằng Pillow','Ảnh tài liệu lịch sử của frontend DOM')
process(ROOT/'game-telemetry.png','game-telemetry','Thông tin của một lần tìm kiếm Hard trong browser local','Ảnh chụp Chrome ngày 27/10/2026; một quan sát, không phải benchmark','Ảnh chụp trình duyệt local')
fig,ax=plt.subplots(figsize=(6,5));stones=[(7,7,'X'),(7,8,'O'),(8,7,'X'),(6,8,'O'),(8,8,'X')];occ={(r,c) for r,c,_ in stones};cand={(r+dr,c+dc) for r,c,_ in stones for dr in range(-2,3) for dc in range(-2,3) if 0<=r+dr<15 and 0<=c+dc<15 and (r+dr,c+dc) not in occ};board(ax,stones,candidates=cand);ax.set_title(f'{len(occ)} quân, {225-len(occ)} ô trống, {len(cand)} ứng viên',fontsize=11);save(fig,'present-candidates','Tái dựng ví dụ Chebyshev năm quân của present','PythonVisualizer.tsx::chebyshev_pruner.py; 36/220, giảm 83,64%','Ví dụ hình học tính lại bằng Python')
(OUT/'figures.json').write_text(json.dumps(REG,ensure_ascii=False,indent=2));print('FIGURES',len(REG))
