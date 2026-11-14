import json,re,collections,hashlib,sys
from pathlib import Path
import pymupdf as f
from PIL import Image,ImageDraw
P=Path(__file__).parent
d=f.open(P/((sys.argv[1] if len(sys.argv)>1 else 'layout10')+'.pdf'))
review_start=next(i for i,pg in enumerate(d) if 'REVIEW VÀ ĐỐI CHIẾU SOURCE' in pg.get_text())
assert review_start>90
assert 'reference datasets' in d[review_start-1].get_text()
d.delete_pages(from_page=review_start,to_page=len(d)-1)
target=P/'English_Report_Caro_Reviewed_2026_11_13.pdf'
d.save(target,garbage=4,deflate=True)
fonts=collections.Counter();errors=[];chapters=[];empty=[]
for i,pg in enumerate(d):
 if not pg.get_text().strip():empty.append(i+1)
 for b in pg.get_text('dict')['blocks']:
  for line in b.get('lines',[]):
   for s in line['spans']:
    if not s['text'].strip():continue
    fonts[(s['font'],round(s['size'],2))]+=len(s['text'])
    if abs(s['size']-13)>.01:errors.append(['font-size',i+1,s['text']])
    if s['bbox'][0]<50 or s['bbox'][2]>pg.rect.width-60:errors.append(['overflow',i+1,s['text']])
 for line in pg.get_text().splitlines():
  if re.match(r'^CHAPTER [1-6]\. ',line.strip()) and '...' not in line:chapters.append([i+1,line.strip()])
for batch in range(0,len(d),12):
 im=Image.new('RGB',(1200,1335),'#b7b7b7');draw=ImageDraw.Draw(im)
 for j in range(12):
  i=batch+j
  if i>=len(d):break
  px=d[i].get_pixmap(matrix=f.Matrix(.48,.48));tile=Image.frombytes('RGB',[px.width,px.height],px.samples);tile.thumbnail((290,415));x=(j%4)*300+5;y=(j//4)*445+23;im.paste(tile,(x,y));draw.text((x,y-18),f'PAGE {i+1}',fill='black')
 im.save(P/f'final_contact_{batch//12+1:02d}.jpg')
qa={'pages':len(d),'body_first_physical_page':chapters[0][0],'body_pages':len(d)-chapters[0][0]+1,'font_sizes':sorted({sz for font,sz in fonts}),'font_character_counts':{f'{font} {size}':n for (font,size),n in fonts.items()},'layout_violations':errors,'empty_pages':empty,'chapter_pages':chapters,'images':sum(len(pg.get_images()) for pg in d),'pdf_links':sum(len(pg.get_links()) for pg in d),'toc_entries':79,'figures_list_entries':20,'table_list_entries':8,'pagination_mismatches':json.loads((P/'pagination_changes.json').read_text()),'pdf_sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(P/'render_qa.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2))
assert not errors and not empty and not qa['pagination_mismatches']
print(json.dumps(qa,ensure_ascii=False,indent=2))
