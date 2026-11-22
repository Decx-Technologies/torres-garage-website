import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('dist/app.js','utf8');
s=s.replace('visual.after(gallery);openDialog',`visual.after(gallery);for(const [key,label] of [['mileage','Kilometraje'],['fuel','Combustible'],['transmission','Transmisión']]){if(raw[key]){const item=document.createElement('div'),caption=document.createElement('small'),value=document.createElement('span');caption.textContent=label;value.textContent=raw[key];item.append(caption,value);document.querySelector('#vehicle-details .spec-table').append(item);}}openDialog`);
await writeFile('dist/app.js',s);
let backend=await readFile('backend.mjs','utf8');backend=backend.replace("function vehicle(input){const out=",`function vehicle(input){if(input.id&&!/^[a-f0-9-]{36}$/.test(input.id))throw Error('Identificador de vehículo inválido.');const out=`);await writeFile('backend.mjs',backend);
