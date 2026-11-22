import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {importExamples} from './demo-inventory.mjs';
import {research} from './market-research.mjs';
const dir=await mkdtemp(join(tmpdir(),'torres-migration-'));
const original={id:'custom',name:'Conservar datos',status:'draft'};
const initial=await importExamples(dir,[original]);
assert.equal(initial.length,4);assert.deepEqual(initial[0],original);
assert.equal(initial.filter(v=>v.status==='available').length,3);
await writeFile(dir+'/inventory.json',JSON.stringify([original]));
assert.deepEqual(await importExamples(dir,[original]),[original]);
assert.equal(JSON.parse(await readFile(dir+'/inventory.json','utf8')).length,1);
const realFetch=globalThis.fetch;
try{
globalThis.fetch=async()=>({ok:true,text:async()=>'<rss><item><title>Toyota 4Runner</title><link>https://example.com/car</link><description>USD 40000</description></item></rss>'});
const found=await research({make:'Toyota',name:'4Runner'});assert.equal(found.results.length,1);assert.equal(found.results[0].title,'Toyota 4Runner');
globalThis.fetch=async()=>{throw Error('sin red');};
const offline=await research({make:'Toyota',name:'4Runner'});assert.equal(offline.results.length,0);assert.match(offline.notice,/manualmente/);
}finally{globalThis.fetch=realFetch;}
console.log('PASS: import preserves existing inventory, deleted examples stay deleted, research deduplicates and handles offline state.');
