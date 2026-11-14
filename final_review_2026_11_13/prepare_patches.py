import json,re
from pathlib import Path
P=Path('.');ps=json.loads((P/'paragraphs.json').read_text());f=json.loads((P/'algo_focus.json').read_text());l=json.loads((P/'language_findings.json').read_text())
patches=[]
for p in f['patches']:
 q=dict(p);q['new']=re.sub(r'\bA(0[1-9])\b',r'AR\1',q['new']);patches.append(q)
patches += [p for p in l['patches'] if p['id']!='LANG-02']
patterns=[(r'2\^64','2','64'),(r'b\^ceil\(d/2\)','b','⌈d/2⌉'),(r'b\^floor\(d/2\)','b','⌊d/2⌋'),(r'b\^\(d/2\)','b','(d/2)'),(r'b\^d','b','d'),(r'k\^d','k','d'),(r'f\^q','f','q'),(r'2\^L','2','L'),(r'8\^5','8','5')]
rx=re.compile('|'.join('('+p[0]+')' for p in patterns))
for p in ps:
 if not rx.search(p['text']):continue
 old=p['text'];chunks=[];marks=[];last=0;length=0
 for m in rx.finditer(old):
  before=old[last:m.start()];chunks.append(before);length+=len(before)
  item=next(x for x in patterns if re.fullmatch(x[0],m.group()))
  chunks.append(item[1]+item[2]);marks.append({'offset':length+len(item[1]),'length':len(item[2]),'text':item[2]});length+=len(item[1])+len(item[2]);last=m.end()
 chunks.append(old[last:]);new=''.join(chunks)
 patches.append({'id':'MATH-'+str(p['start']),'start':p['start'],'old':old,'new':new,'exponents':marks,'reason':'Replace caret power notation with native superscript formatting, retaining the exponent and expression semantics.'})
# Keep existing linked entries correct until the native TOC replaces them.
for p in ps:
 if p['start']<12714 and 'Functional requirements F01–F09' in p['text']:
  patches.append({'id':'LOT-CAPTION','start':p['start'],'old':p['text'],'new':p['text'].replace('Functional requirements F01–F09','Algorithmic requirements AR01–AR09'),'reason':'Synchronize the list-of-tables caption with Table 3.1.'})
starts=[p['start'] for p in patches];assert len(starts)==len(set(starts))
for p in patches:
 hits=[x for x in ps if x['start']==p['start'] and x['text']==p['old']];assert len(hits)==1,p['id']
(P/'all_patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2));print('Total',len(patches),'math paragraphs',sum(bool(p.get('exponents')) for p in patches),'superscripts',sum(len(p.get('exponents',[])) for p in patches))
