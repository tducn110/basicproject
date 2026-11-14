import json,re
from pathlib import Path
P=Path(__file__).parent
items=json.loads((P/'paragraphs.json').read_text())
patches=[x for f in ['patches_ch2.json','patches_ch3_5.json','patches_front_end.json'] for x in json.loads((P/f).read_text())]
by={x['start']:x for x in patches}
assert len(by)==len(patches)
for p in items:
 if p['start'] in by: assert p['text'].removesuffix('\n')==by[p['start']]['old'],p['start']
extra=json.loads((P/'extra_reference_53.json').read_text())
print('extra keys',extra.keys())
def us(s):
 words={'behaviour':'behavior','behaviours':'behaviors','colour':'color','colours':'colors','centre':'center','centres':'centers','neighbourhood':'neighborhood','neighbourhoods':'neighborhoods','organised':'organized','organises':'organizes','organisation':'organization','analysed':'analyzed','analyses':'analyzes','analyse':'analyze','modelling':'modeling','minimise':'minimize','minimises':'minimizes','maximise':'maximize','maximises':'maximizes','optimisation':'optimization','optimisations':'optimizations','initialisation':'initialization','initialise':'initialize','synchronisation':'synchronization','synchronise':'synchronize'}
 def repl(m):
  w=m.group(); v=words[w.lower()]
  return v.upper() if w.isupper() else v.capitalize() if w[0].isupper() else v
 s=re.sub(r'\b(?:'+ '|'.join(words)+r')\b',repl,s,flags=re.I)
 s=re.sub(r'\balpha[-–‑]beta\b','Alpha-Beta',s,flags=re.I)
 s=re.sub(r'\bminimax\b','Minimax',s,flags=re.I)
 return s
def citation_style(s):
 # Citation clusters are whitespace-delimited bracketed reference numbers.
 s=re.sub(r'(\[\d+\])(?:\s*,?\s*)(?=\[\d+\])',r'\1, ',s)
 # IEEE citations precede sentence punctuation.
 s=re.sub(r'([.;])\s+((?:\[\d+\](?:,\s*)?)+)(?=\s|$)',r' \2\1',s)
 return s
for p in items:
 p['old']=p['text'].removesuffix('\n')
 p['new']=by.get(p['start'],{}).get('new',p['old'])
 p['code']=p['old'].startswith(('//','    ','  ')) or p['start'] in range(166209,166353) or p['old'].startswith(('npm ','cd ','git ','cargo ','python3 '))
 if not (143049<p['start']<159128) and not p['code']:
  p['new']=citation_style(us(p['new']))
refs={int(re.match(r'\[(\d+)\]',p['old'])[1]):p['new'] for p in items if 143049<p['start']<159128 and re.match(r'\[(\d+)\]',p['old'])}
refs[53]=extra.get('text') or extra.get('reference') or extra.get('entry')
assert refs[53]
order=[]
for p in items:
 if 143049<=p['start']<159128 or p['start']<7523 or p['code']:continue
 for m in re.finditer(r'(?<![\w])\[(\d+)\]',p['new']):
  n=int(m[1]);assert n in refs,(p['start'],n)
  if n not in order:order.append(n)
unused=sorted(set(refs)-set(order))
print('unused references',unused)
# Retain all cited sources; unused bibliography entries are not silently invented as citations.
order+=unused
mapping={n:i+1 for i,n in enumerate(order)}
urls={mapping[n]:re.search(r'(?:Available:\s*)(\S+)',refs[n]).group(1) for n in order if re.search(r'(?:Available:\s*)(\S+)',refs[n])}
finalrefs=[re.sub(r'^\[\d+\]',f'[{mapping[n]}]',refs[n]) for n in order]
refps=[p for p in items if 143049<p['start']<159128 and re.match(r'\[\d+\]',p['old'])]
for p,new in zip(refps,finalrefs):p['new']=new
for p in items:
 if 143049<=p['start']<159128 or p['code']:continue
 p['new']=re.sub(r'(?<![\w])\[(\d+)\]',lambda m:f'[{mapping[int(m[1])]}]',p['new'])
out=[]
for p in items:
 if p['new']!=p['old']:
  out.append({'start':p['start'],'end':p['end'],'old':p['old'],'new':p['new'],'reason':by.get(p['start'],{}).get('reason','Consistent US English, named algorithms and IEEE citation style/order.'),'evidence':by.get(p['start'],{}).get('evidence',[])})
(P/'all_changes.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
(P/'planned_items.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
(P/'reference_map.json').write_text(json.dumps({'old_to_new':mapping,'urls':urls,'order':order,'unused':unused,'last_entry':finalrefs[-1]},ensure_ascii=False,indent=2))
(P/'planned.txt').write_text(''.join(p['new']+'\n' for p in items))
print('review patches',len(patches),'total changed paragraphs',len(out),'references',len(refs))
