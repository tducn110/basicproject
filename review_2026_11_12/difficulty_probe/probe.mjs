import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {Game,initSync} from '/home/pro/Downloads/basicproject/CaroGame/src/game/wasm/engine/gomoku_engine.js';
const file='/home/pro/Downloads/basicproject/CaroGame/src/game/wasm/engine/gomoku_engine_bg.wasm';
const bytes=readFileSync(file); initSync({module:bytes});
// Each entry is an alternating X,O history in [x,y] coordinates; O to move.
const positions={
 opening:[[7,7],[8,7],[7,8]],
 midgame:[[7,7],[8,7],[7,8],[8,8],[6,6],[9,9],[6,8],[8,6],[9,7]],
 own_win:[[0,0],[3,7],[2,0],[4,7],[4,0],[5,7],[6,0],[6,7],[8,0]],
 single_block:[[0,0],[6,6],[1,0],[7,7],[2,0],[8,8],[3,0]],
 double_threat:[[4,7],[6,6],[5,7],[7,6],[6,7],[8,6],[7,7]],
 fork_setup:[[0,0],[6,7],[2,0],[8,7],[4,0],[7,6],[6,0],[7,8],[8,0]]
};
const levels={easy:0,normal:1,hard:2,veryhard:5,expert:3,master:4};
let results=[];
for(const [fixture,moves] of Object.entries(positions)) for(const [level,id] of Object.entries(levels)){
 let g=new Game();
 for(const [x,y] of moves){if(!g.play_move(x,y)) throw Error(`illegal history ${fixture} ${x},${y}`); if(g.get_winner()||g.is_draw()) throw Error(`terminal history ${fixture}`)}
 if(g.current_player()!=='white') throw Error(`unexpected turn ${fixture}`);
 const t=performance.now(); const move=g.ai_move_seeded(id,42); const ms=performance.now()-t;
 if(!move || moves.some(([x,y])=>x===move.x&&y===move.y)) throw Error(`illegal output ${fixture} ${level}`);
 results.push({fixture,level,id,move,ms:Number(ms.toFixed(2))}); g.free();
}
const out={scope:'Direct Node initSync, seeded WASM ai_move_seeded; no AIController tactical override, no browser worker',encoding:'x=column,y=row, zero based; alternating X then O; O to move',seed:42,wasmSha256:createHash('sha256').update(bytes).digest('hex'),positions,results};
writeFileSync('/home/pro/Downloads/vnuk/basicProject/review_2026_11_12/difficulty_probe/probes.json',JSON.stringify(out,null,2)+'\n');
for(const r of results) console.log(`${r.fixture.padEnd(14)} ${r.level.padEnd(8)} (${r.move.x},${r.move.y}) depth=${r.move.stats.completed_depth} nodes=${r.move.stats.nodes_visited} ${r.ms}ms`);
