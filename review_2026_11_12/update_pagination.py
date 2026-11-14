import json,re,sys,unicodedata
from pathlib import Path
import pymupdf as f
from make_toc import leader
P=Path(__file__).parent
version=sys.argv[1] if len(sys.argv)>1 else 'layout1'
pdf=f.open(P/(version+'.pdf'))
ps=json.loads((P/'current_items.json').read_text())
def key(s):return re.sub(r'\s+','',unicodedata.normalize('NFC',s)).casefold()
texts=[key(p.get_text()) for p in pdf]
main=next(i for i,p in enumerate(pdf) if any(x.strip()=='CHAPTER 1. INTRODUCTION' for x in p.get_text().splitlines()))
mainStart=next(p['start'] for p in ps if p['text'].strip()=='CHAPTER 1. INTRODUCTION')
heads=[p for p in ps if p['start']>=mainStart and p['style'] in ['HEADING_1','HEADING_2','HEADING_3'] and p['text'].strip()]
captions=[p for p in ps if p['start']>=mainStart and re.match(r'^(Figure \d+\.\d+\.|Table [\dA-C]+\.\d+\.)',p['text'])]
def footer(i):
 p=pdf[i]; s=p.get_text(clip=f.Rect(0,p.rect.height-60,p.rect.width,p.rect.height)).strip();m=re.search(r'(\d+)\s*$',s)
 assert m,(i,s)
 return int(m[1])
targets=[];last=main
for h in heads:
 title=h['text'].strip();found=[i for i in range(last,len(pdf)) if key(title) in texts[i]]
 assert found,('heading',title)
 page=found[0];last=page
 targets.append({'title':title,'page':footer(page),'physical':page+1,'headingId':h['id'],'level':int(h['style'][-1]),'kind':'heading'})
for h in captions:
 title=h['text'].strip();found=[i for i in range(main,len(pdf)) if key(title) in texts[i]]
 assert found,('caption',title)
 page=found[0];targets.append({'title':title,'page':footer(page),'physical':page+1,'kind':'figure' if title.startswith('Figure') else 'table'})
front=[p for p in ps if p['start']<mainStart]
headEntries=[p for p in front if re.match(r'^(?:CHAPTER |APPENDIX |REFERENCES\b|\d+\.\d+)',p['text'])]
assert len(headEntries)==len(heads),(len(headEntries),len(heads))
changes=[]
for p,h in zip(headEntries,[t for t in targets if t['kind']=='heading']):
 new=leader(h['title'],h['page'],h['level'])
 if new!=p['text'].rstrip('\n'):changes.append({'start':p['start'],'end':p['end'],'old':p['text'].rstrip('\n'),'new':new,'headingId':h['headingId']})
for p in front:
 m=re.match(r'^(Figure \d+\.\d+\.|Table [\dA-C]+\.\d+\.)',p['text'])
 if not m:continue
 h=next(t for t in targets if t['kind']!='heading' and t['title'].startswith(m[1]))
 new=leader(h['title'],h['page'],1)
 if new!=p['text'].rstrip('\n'):changes.append({'start':p['start'],'end':p['end'],'old':p['text'].rstrip('\n'),'new':new})
(P/(version+'_page_map.json')).write_text(json.dumps(targets,ensure_ascii=False,indent=2))
(P/'pagination_changes.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2))
print('PDF pages',len(pdf),'main starts physical',main+1,'entries',len(targets),'changes',len(changes))
