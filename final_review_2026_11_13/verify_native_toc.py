import json,re,sys
from pathlib import Path
import pymupdf as f
P=Path('.');version=sys.argv[1] if len(sys.argv)>1 else 'layout2';d=f.open(version+'.pdf');o=json.load(open('native_toc_heads.json'))
review=next(i for i,p in enumerate(d) if 'REVIEW VÀ ĐỐI CHIẾU SOURCE' in p.get_text());main=next(i for i,p in enumerate(d) if any(x.strip()=='CHAPTER 1. INTRODUCTION' for x in p.get_text().splitlines()));tocpages=set(range(2,next(i for i,p in enumerate(d) if any(x.strip()=='LIST OF FIGURES' for x in p.get_text().splitlines()) and i>2)))
def key(s):return re.sub(r'\s+','',s).casefold()
texts=[key(p.get_text()) for p in d]
results=[];last=0
for h in o['heads']:
 title=h['text'].strip();c=[i for i in range(last,review) if i not in tocpages and key(title) in texts[i]]
 if not c:results.append({'title':title,'error':'notfound'});continue
 i=c[0];last=i;p=d[i];foot=p.get_text(clip=f.Rect(0,p.rect.height-60,p.rect.width,p.rect.height)).strip();page=int(re.search(r'\d+$',foot)[0]);tc=next(t for t in o['toc'] if t['link']['id']==h['id']);m=re.search(r'(\d+)\s*$',tc['text']);actual=int(m[1]) if m else None
 results.append({'title':title,'id':h['id'],'page':page,'physical':i+1,'toc_page':actual,'match':actual==page})
json.dump(results,open(version+'_heading_page_map.json','w'),ensure_ascii=False,indent=2)
print('Main begins physical',main+1,'English pages',review,'TOC pages',[i+1 for i in tocpages],'headings',len(results),'mismatches',sum(not x.get('match') for x in results))
for x in results:
 if not x.get('match'):print(x)
