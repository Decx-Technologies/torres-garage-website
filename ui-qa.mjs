import {spawn} from 'node:child_process';import {mkdtemp} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
const data=await mkdtemp(join(tmpdir(),'torres-ui-qa-')),origin='http://127.0.0.1:5185';
const child=spawn(process.execPath,['backend.mjs'],{env:{...process.env,PORT:'5185',TORRES_DATA_DIR:data},stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);});
await fetch(origin+'/api/admin/setup',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'Torres-QA-2026-local'})});
console.log('Isolated UI test available at '+origin+'/admin');
process.on('SIGINT',()=>{child.kill();process.exit(0);});child.on('exit',()=>process.exit(0));
