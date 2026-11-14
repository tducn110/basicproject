import json,re
from pathlib import Path
import pymupdf as f
P=Path(__file__).parent
heads=json.loads((P/'headings.json').read_text())
def leader(title,page,level):
 width=426-(level-1)*14
 measure=lambda s:f.get_text_length(s,fontname='tiro',fontsize=13)
 words=title.split();line=''
 for word in words:
  nxt=(line+' '+word).strip()
  line=word if measure(nxt)>width else nxt
 dots=max(3,int((width-measure(line+'  '+str(page)))/measure('.')))
 return title+' '+'.'*dots+' '+str(page)
entries=[]
for h in heads:
 level=int(h['style'][-1]);title=h['text'].strip()
 entries.append({'title':title,'headingId':h['id'],'level':level,'page':'000','text':leader(title,'000',level)})
(P/'toc_entries.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2))
print('TOC entries',len(entries))
