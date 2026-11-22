// Runs backend.mjs the way Vercel does (VERCEL=1, exported handler, ?__route= rewrites) against a fake
// Upstash REST server, with two "instances" sharing it, to check sessions and data persist across instances.
import assert from 'node:assert/strict';import test from 'node:test';import http from 'node:http';import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';import {randomBytes,scryptSync} from 'node:crypto';
import {redisStore,createStore} from './storage.mjs';

function fakeUpstash(){
 const data=new Map(),expires=new Map(),token='test-token';
 const alive=k=>{if(expires.has(k)&&expires.get(k)<=Date.now()){data.delete(k);expires.delete(k);}return data.has(k);};
 const run=([cmd,...a])=>{switch(cmd){
  case 'GET':return alive(a[0])?data.get(a[0]):null;
  case 'MGET':return a.map(k=>alive(k)?data.get(k):null);
  case 'EXISTS':return alive(a[0])?1:0;
  case 'SET':{if(a.includes('NX')&&alive(a[0]))return null;data.set(a[0],a[1]);expires.delete(a[0]);const px=a.indexOf('PX');if(px>0)expires.set(a[0],Date.now()+Number(a[px+1]));return 'OK';}
  case 'DEL':return data.delete(a[0])?1:0;
  case 'INCR':{const n=Number(alive(a[0])?data.get(a[0]):0)+1;data.set(a[0],String(n));return n;}
  case 'PEXPIRE':expires.set(a[0],Date.now()+Number(a[1]));return 1;
  default:throw Error('unsupported '+cmd);}};
 const server=http.createServer(async(req,res)=>{let body='';for await(const c of req)body+=c;res.setHeader('Content-Type','application/json');
  if(req.headers.authorization!=='Bearer '+token){res.statusCode=401;return res.end(JSON.stringify({error:'unauthorized'}));}
  try{res.end(JSON.stringify({result:run(JSON.parse(body))}));}catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}));}});
 return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({data,token,url:`http://127.0.0.1:${server.address().port}`,close:()=>server.close()})));
}
function instance(redis,extraEnv={}){
 const child=spawn(process.execPath,['--input-type=module','-e',"import http from 'node:http';const {handler}=await import('./backend.mjs');const s=http.createServer(handler).listen(0,'127.0.0.1',()=>console.log('PORT '+s.address().port));"],{cwd:import.meta.dirname,env:{...process.env,VERCEL:'1',KV_REST_API_URL:redis.url,KV_REST_API_TOKEN:redis.token,ADMIN_SETUP_ENABLED:'',...extraEnv},stdio:['ignore','pipe','pipe']});
 let err='';child.stderr.on('data',d=>err+=d);
 return new Promise((resolve,reject)=>{child.stdout.on('data',d=>{const m=String(d).match(/PORT (\d+)/);if(m)resolve({base:`http://127.0.0.1:${m[1]}`,host:`127.0.0.1:${m[1]}`,stop:()=>child.kill()});});child.on('exit',c=>reject(Error('instance exited '+c+': '+err)));});
}
const call=(app,route,{method='GET',body,origin=`https://${app.host}`,cookie}={})=>fetch(`${app.base}/api/index?__route=${route}`,{method,redirect:'manual',headers:{...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},body:body&&JSON.stringify(body)});

test('Vercel mode keeps admin data, sessions and uploads in shared storage',async()=>{
 const redis=await fakeUpstash(),password='prueba-segura-2026',salt=randomBytes(16).toString('hex');
 redis.data.set('tg:data:account.json',JSON.stringify({salt,hash:scryptSync(password,salt,64).toString('hex')}));
 redis.data.set('tg:upload:abc-123.jpg','https://store.public.blob.vercel-storage.com/uploads/abc-123.jpg');
 const a=await instance(redis),b=await instance(redis);
 try{
  const inventory=await (await call(a,'/api/inventory')).json();
  assert.ok(inventory.length>0,'demo vehicles are seeded into Redis');
  assert.ok(redis.data.has('tg:data:inventory.json')&&redis.data.has('tg:data:examples-imported.json'));
  assert.deepEqual(await (await call(a,'/api/admin/status')).json(),{configured:true,authenticated:false});
  assert.equal((await call(a,'/api/admin/login',{method:'POST',body:{password},origin:`http://${a.host}`})).status,403,'plain-http origin rejected');
  assert.equal((await call(a,'/api/admin/login',{method:'POST',body:{password:'incorrecta-123456'}})).status,401);
  const login=await call(a,'/api/admin/login',{method:'POST',body:{password}});
  assert.equal(login.status,200);const setCookie=login.headers.get('set-cookie');
  assert.match(setCookie,/tg_session=[a-f0-9]{64}/);assert.match(setCookie,/Secure/);
  const cookie=setCookie.split(';')[0];
  assert.equal((await call(b,'/api/admin/inventory',{cookie})).status,200,'session valid on another instance');
  const demo=inventory[0].id;
  assert.equal((await call(a,'/api/admin/inventory',{method:'DELETE',body:{id:demo},cookie})).status,200);
  assert.ok(!(await (await call(b,'/api/inventory')).json()).some(v=>v.id===demo),'deletion visible on another instance');
  const photo=await call(b,'/uploads/abc-123.jpg');
  assert.equal(photo.status,302);assert.equal(photo.headers.get('location'),'https://store.public.blob.vercel-storage.com/uploads/abc-123.jpg');
  assert.equal((await call(b,'/uploads/missing.jpg')).status,404);
  assert.equal((await call(a,'/api/admin/logout',{method:'POST',cookie})).status,200);
  assert.equal((await call(b,'/api/admin/inventory',{cookie})).status,401,'logout revokes everywhere');
 }finally{a.stop();b.stop();redis.close();}
});

test('Vercel mode seeds the committed admin account and blocks open setup',async()=>{
 const redis=await fakeUpstash(),app=await instance(redis);
 try{
  assert.deepEqual(await (await call(app,'/api/admin/status')).json(),{configured:true,authenticated:false});
  const bundled=JSON.parse(await readFile(new URL('./data/account.json',import.meta.url),'utf8'));
  assert.deepEqual(JSON.parse(redis.data.get('tg:data:account.json')),bundled);
  assert.equal((await call(app,'/api/admin/setup',{method:'POST',body:{password:'otra-clave-larga-123'}})).status,409);
 }finally{app.stop();redis.close();}
});

test('redis store uploads photos to Blob and refuses to run on Vercel without Redis',async()=>{
 const redis=await fakeUpstash(),calls=[];
 const store=redisStore({url:redis.url,token:redis.token,blobPut:async(path,bytes,options)=>{calls.push({path,options});return{url:'https://blob.example/'+path};}});
 await store.putUpload('f00d.png',Buffer.from('x'),'image/png');
 assert.deepEqual(calls,[{path:'uploads/f00d.png',options:{access:'public',contentType:'image/png',addRandomSuffix:false}}]);
 assert.equal(await store.uploadUrl('f00d.png'),'https://blob.example/uploads/f00d.png');
 assert.equal(await store.attempt('ip'),true);for(let i=0;i<11;i++)await store.attempt('ip');assert.equal(await store.attempt('ip'),false,'13th attempt blocked');
 assert.throws(()=>createStore({VERCEL:'1'}),/Upstash Redis/);
 assert.equal(createStore({VERCEL:'1',STORAGE_KV_REST_API_URL:redis.url,STORAGE_KV_REST_API_TOKEN:redis.token}).shared,true,'prefixed integration vars');
 assert.equal(createStore({TORRES_DATA_DIR:'/tmp/x'}).shared,false);
 redis.close();
});

test('Vercel mode without Redis answers with a clear error instead of crashing',async()=>{
 const app=await instance({url:'',token:''},{KV_REST_API_URL:'',KV_REST_API_TOKEN:''});
 try{for(let i=0;i<2;i++){const r=await call(app,'/api/inventory');assert.equal(r.status,400);assert.match((await r.json()).error,/Upstash Redis/);}}
 finally{app.stop();}
});
