from pathlib import Path
from pypdf import PdfReader
import json,re,unicodedata,sys
W=Path(__file__).resolve().parent;render=W/(sys.argv[1] if len(sys.argv)>1 else 'render-2');reader=PdfReader(next(render.glob('*.pdf')));meta=json.loads((W/'document_metadata.json').read_text())
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
texts=[p.extract_text() or '' for p in reader.pages];ns=[norm(s) for s in texts]
start=next(i for i,s in enumerate(ns) if norm('Caro là một trò chơi đối kháng có luật cơ bản đơn giản') in s)
ref=next(i for i in range(start,len(ns)) if norm('TÀI LIỆU THAM KHẢO') in ns[i] and '[1]' in texts[i])
cache={'toc':{},'figures':{},'tables':{}};miss=[]
for kind in cache:
 for e in meta[kind]:
  target=norm(e['title']);matches=[i for i in range(start,len(ns)) if target in ns[i]]
  if not matches:miss.append((kind,e['title']));continue
  i=matches[0];cache[kind][e['title']]=i-start+1
(W/'page_cache.json').write_text(json.dumps(cache,ensure_ascii=False,indent=2));summary={'total_pages':len(texts),'main_start_physical_page':start+1,'reference_start_physical_page':ref+1,'main_content_pages':ref-start,'missing_entries':miss,'empty_pages':[i+1 for i,s in enumerate(texts) if len(s.strip())==0]};(W/'pagination.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps(summary,ensure_ascii=False))
