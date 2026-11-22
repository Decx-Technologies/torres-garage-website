// Persistence layer. Locally (no Redis env vars) everything stays in the data/ folder exactly as before.
// On Vercel the filesystem is read-only and instances are short-lived, so JSON documents, sessions and
// login attempts live in Upstash Redis (REST API, no SDK needed) and uploaded photos in Vercel Blob.
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const SESSION_MS=28800000,ATTEMPT_WINDOW_MS=900000,MAX_ATTEMPTS=12;

export function fileStore(dir){
 const uploads=resolve(dir,'uploads'),sessions=new Map(),attempts=new Map();
 const get=async(name,fallback=null)=>{try{return JSON.parse(await readFile(resolve(dir,name),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}};
 return{
  shared:false,dir,uploads,
  init:()=>mkdir(uploads,{recursive:true}),
  get,
  async has(name){try{await readFile(resolve(dir,name));return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}},
  async set(name,value){const p=resolve(dir,name);await writeFile(p+'.tmp',JSON.stringify(value,null,2));await rename(p+'.tmp',p);},
  async putUpload(name,bytes){await writeFile(resolve(uploads,name),bytes);},
  async createSession(token){sessions.set(token,Date.now()+SESSION_MS);},
  async validSession(token){return!!token&&(sessions.get(token)||0)>Date.now();},
  async deleteSession(token){sessions.delete(token);},
  async attempt(key){let entry=attempts.get(key);if(!entry||Date.now()-entry.start>ATTEMPT_WINDOW_MS)entry={count:0,start:Date.now()};if(entry.count>=MAX_ATTEMPTS)return false;entry.count++;attempts.set(key,entry);return true;},
  async clearAttempts(key){attempts.delete(key);}
 };
}

export function redisStore({url,token,fetchImpl=fetch,blobPut}){
 const base=url.replace(/\/+$/,'');
 async function command(...args){
  const response=await fetchImpl(base,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(args)});
  const out=await response.json().catch(()=>({error:'Respuesta inválida de Redis.'}));
  if(!response.ok||out.error)throw Error('Error de almacenamiento: '+(out.error||response.status));
  return out.result;
 }
 const key=name=>'tg:data:'+name;
 return{
  shared:true,
  init:async()=>{},
  async get(name,fallback=null){const raw=await command('GET',key(name));return raw==null?fallback:JSON.parse(raw);},
  async getMany(entries){const raws=await command('MGET',...entries.map(([name])=>key(name)));return entries.map(([,fallback],i)=>raws[i]==null?fallback:JSON.parse(raws[i]));},
  async has(name){return(await command('EXISTS',key(name)))===1;},
  async set(name,value){await command('SET',key(name),JSON.stringify(value));},
  async setIfMissing(name,value){return(await command('SET',key(name),JSON.stringify(value),'NX'))==='OK';},
  async putUpload(name,bytes,contentType){
   const put=blobPut||(await import('@vercel/blob')).put;
   const blob=await put('uploads/'+name,bytes,{access:'public',contentType,addRandomSuffix:false});
   await command('SET','tg:upload:'+name,blob.url);
  },
  uploadUrl:name=>command('GET','tg:upload:'+name),
  async createSession(t){await command('SET','tg:session:'+t,'1','PX',String(SESSION_MS));},
  async validSession(t){return!!t&&(await command('EXISTS','tg:session:'+t))===1;},
  async deleteSession(t){if(t)await command('DEL','tg:session:'+t);},
  async attempt(k){const n=await command('INCR','tg:attempts:'+k);if(n===1)await command('PEXPIRE','tg:attempts:'+k,String(ATTEMPT_WINDOW_MS));return n<=MAX_ATTEMPTS;},
  async clearAttempts(k){await command('DEL','tg:attempts:'+k);}
 };
}

export function createStore(env=process.env){
 const url=env.KV_REST_API_URL||env.UPSTASH_REDIS_REST_URL,token=env.KV_REST_API_TOKEN||env.UPSTASH_REDIS_REST_TOKEN;
 if(url&&token)return redisStore({url,token});
 if(env.VERCEL)throw Error('Falta conectar Upstash Redis al proyecto de Vercel (Storage → Upstash Redis). Vercel no permite guardar datos en archivos.');
 return fileStore(resolve(env.TORRES_DATA_DIR||'data'));
}

// Seed helpers accept either a data folder path (local, tests) or a store.
export const asStore=data=>typeof data==='string'?fileStore(data):data;
