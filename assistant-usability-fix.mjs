import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('dist/vehicle-assistant.js','utf8');
s=s.replace("input.removeAttribute('list');", "input.removeAttribute('list');input.setAttribute('aria-label',input.closest('label').firstChild.textContent.trim());");
s=s.replace("trigger.type='button';", "trigger.type='button';trigger.addEventListener('pointerdown',e=>e.preventDefault());");
s=s.replace("b.setAttribute('role','option');", "b.setAttribute('role','option');b.addEventListener('pointerdown',e=>e.preventDefault());");
s=s.replace("form.elements[key].readOnly=!!active;", "{form.elements[key].readOnly=!!active;form.elements[key].placeholder=active?'Elige una opción':manual?'Según ficha de la unidad':'Selecciona primero la versión';}");
await writeFile('dist/vehicle-assistant.js',s);
let money=await readFile('dist/money.js','utf8');money=money.replace('Selecciona Bs o Dólares para publicar el precio.','Selecciona la moneda (Bs o Dólares) para publicar el precio.');await writeFile('dist/money.js',money);
