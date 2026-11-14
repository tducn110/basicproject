import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
items = json.loads((HERE / 'current_items.json').read_text())
by_start = {p['start']: p for p in items}
changes = {}

def change(start, text, reason):
    old = by_start[start]['text'].removesuffix('\n')
    if start in changes:
        changes[start]['new'] = text
        changes[start]['reason'] += '; ' + reason
    else:
        changes[start] = dict(start=start, old=old, new=text, reason=reason)

def replace(start, old_fragment, new_fragment, reason):
    text = changes.get(start, {}).get('new', by_start[start]['text'].removesuffix('\n'))
    assert old_fragment in text, (start, old_fragment)
    change(start, text.replace(old_fragment, new_fragment), reason)

# The first remapping pass excluded source citations inside pseudocode comments.
for start, mapping in {
    22369:{6:10},
    33784:{6:10,15:21},
    48252:{6:10},
    51751:{11:15},
    55045:{20:26},
    58398:{11:15},
    66358:{53:28},
}.items():
    text = by_start[start]['text'].removesuffix('\n')
    new = re.sub(r'\[(\d+)\]', lambda m:'['+str(mapping[int(m[1])])+']', text)
    change(start,new,'Correct a source citation inside a pseudocode comment that retained its pre-remapping reference number.')

replace(139732, '2026. [Online]. Available: https://github.com/tducn110/basicproject/blob/7e1e2d51321a4e6b2e26493c34f0a485d4de39cc/CaroGame/src/game/bot/eval.ts. [Accessed: Nov. 12, 2026].', '2026. Accessed: Nov. 12, 2026. [Online]. Available: https://github.com/tducn110/basicproject/blob/7e1e2d51321a4e6b2e26493c34f0a485d4de39cc/CaroGame/src/game/bot/eval.ts', 'Bring the added bibliography entry into the same IEEE online format and remove the period parsed into its URL.')
replace(121431, 'native-to-Node time ratios', 'Node-to-native time ratios', 'Correct the ratio direction: the reported values divide Node elapsed time by native Rust elapsed time.')
replace(153500, 'native Rust/Node time ratios', 'Node-to-native Rust time ratios', 'Correct the ratio direction consistently in the evidence summary.')
replace(33257, 'favour', 'favor', 'Finish US English spelling consistency.')

change(103233, 'The second program calculates a score from manually supplied pattern counts and a demonstration weight dictionary. The instructional attack/defense cases yield 94,000 and −7,000 under those inputs and the defensive multiplier. These are arithmetic outcomes of the supplied feature counts. The application’s Rust evaluator scans the board using a different set of weights [21], [44].', 'Use US spelling, remove an unsupported production label, and state the actual distinction between demonstration arithmetic and the application evaluator without checklist-style prohibitions.')
change(97847, 'The generated package contains JavaScript bindings, TypeScript declarations and the WebAssembly binary loaded by the Worker. Selected modified-engine source excerpts describe the recorded Rust search, while the bindings expose its interface to JavaScript. The recorded binary hash identifies the package used for the parity and browser observations, and Appendix B lists the associated source and build records [10], [40].', 'Avoid presenting the earlier baseline AI source as the corresponding source of the active modified binary.')
replace(116749, 'The counterexample is important: fewer recursively visited nodes do not necessarily mean lower elapsed time, because ranking candidates also costs work.', 'Fewer recursively visited nodes therefore do not necessarily mean lower elapsed time, because ranking candidates also costs work.', 'Remove editorial emphasis and let the measured example establish its implication.')

# A consecutive numerical citation cluster lists its references in ascending order.
clusters = 0
for item in items:
    if re.match(r'^\[\d+\]',item['text']):
        continue
    text = changes.get(item['start'],{}).get('new',item['text'].removesuffix('\n'))
    def sort_cluster(m):
        global clusters
        nums = [int(n) for n in re.findall(r'\d+',m[0])]
        sorted_nums = sorted(set(nums))
        if nums != sorted_nums:
            clusters += 1
        return ', '.join('['+str(n)+']' for n in sorted_nums)
    new = re.sub(r'\[\d+\](?:,?\s+\[\d+\])+',sort_cluster,text)
    if new != text:
        change(item['start'],new,'Order the consecutive numerical citation cluster in ascending final reference order.')

patches = [x for _,x in sorted(changes.items())]
assert all(by_start[p['start']]['text'].removesuffix('\n')==p['old'] for p in patches)
(HERE/'final_editorial_fixes.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n')
print(len(patches),'exact paragraph fixes;',clusters,'citation clusters normalized')
