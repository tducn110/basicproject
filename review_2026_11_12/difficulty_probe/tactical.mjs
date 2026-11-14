import ts from '/home/pro/Downloads/basicproject/CaroGame/node_modules/typescript/lib/typescript.js';
import {readFileSync,writeFileSync} from 'node:fs';
const base='/home/pro/Downloads/basicproject/CaroGame/src/game/';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
function compile(path,replace={}) { let s=readFileSync(base+path,'utf8'); for(const [a,b] of Object.entries(replace)) s=s.replaceAll(a,b); return uri(ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText); }
const bounds=compile('core/BoardBounds.ts');
const tactical=compile('ai/TacticalMoveResolver.ts',{'../core/BoardBounds':bounds});
const engine=compile('wasm/GomokuWasmEngine.ts');
const ctrl=compile('ai/AIController.ts',{'../wasm/GomokuWasmEngine':engine,'./TacticalMoveResolver':tactical});
const {GameState}=await import(compile('core/GameState.ts'));
const {AIController}=await import(ctrl);
const wasm=JSON.parse(readFileSync('/home/pro/Downloads/vnuk/basicProject/review_2026_11_12/difficulty_probe/probes.json'));
let results=[];
for(const fixture of ['own_win','single_block','double_threat','fork_setup']){
 const state=new GameState(); wasm.positions[fixture].forEach(([col,row],i)=>state.commitMove({cell:{row,col},player:i%2?'O':'X',index:i+1}));
 for(const level of ['hard','veryhard','expert','master']){
  const controller=new AIController();
  try {const result=await controller.requestMove(state,1,level); results.push({fixture,level,result});}
  catch(e){results.push({fixture,level,error:String(e)});}
  finally{controller.destroy();}
 }
}
writeFileSync('/home/pro/Downloads/vnuk/basicProject/review_2026_11_12/difficulty_probe/tactical.json',JSON.stringify({scope:'Actual TypeScript AIController transpiled in memory, Node no Worker; errors on non-tactical search expected and not browser evidence',results},null,2)+'\n');
for(const r of results) console.log(r.fixture,r.level,r.result?JSON.stringify({move:r.result.move,source:r.result.stats.source,depth:r.result.stats.depth}):r.error);
