import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('vehicle-catalog.mjs','utf8');
s="import {aduanaMakes,aduanaModels,aduanaConfigurations,aduanaDetail} from './aduana-catalog.mjs';\nimport {epaMakes,epaModels,epaConfigurations,epaDetail} from './epa-catalog.mjs';\n"+s;
let start=s.indexOf(" if(stage==='makes')"),end=s.indexOf(" if(stage==='vin')",start);
s=s.slice(0,start)+` if(stage==='makes'){
 const queries=[...['car','truck','multipurpose passenger vehicle (mpv)'].map(type=>get('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/'+encodeURIComponent(type)+'?format=json').then(r=>(r.Results||[]).map(x=>x.MakeName))),aduanaMakes(),epaMakes(year||String(new Date().getFullYear()))];
 const rows=await Promise.allSettled(queries),options=unique(rows.flatMap(r=>r.status==='fulfilled'?r.value:[]));return{options,notice:'Marcas de NHTSA, Aduana Bolivia y FuelEconomy.gov. La cobertura depende del mercado y año.'};
 }
 if(stage==='models'){
 if(!make)return{options:[]};const url='https://vpic.nhtsa.dot.gov/api/vehicles/'+(year?'GetModelsForMakeYear/make/'+encodeURIComponent(make)+'/modelyear/'+year:'GetModelsForMake/'+encodeURIComponent(make))+'?format=json';
 const queries=[get(url).then(r=>(r.Results||[]).filter(x=>normalize(x.Make_Name)===normalize(make)).map(x=>x.Model_Name)),get('https://carapi.app/api/models/v2?'+new URLSearchParams({make,...(year?{year}:{})})).then(r=>(r.data||[]).filter(x=>normalize(x.make||make)===normalize(make)).map(x=>x.model||x.name)),aduanaModels(make).then(rows=>rows.map(r=>r.name)),epaModels(make,year)];const results=await Promise.allSettled(queries),options=[...new Map(results.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(Boolean).map(v=>[normalize(v),v])).values()].sort((a,b)=>a.localeCompare(b,'es'));
 return{options,notice:options.length?'Modelos de NHTSA, Aduana y EPA. El año y el motor se verifican al elegir la configuración.':'No se encontraron modelos en las fuentes disponibles. Vuelve a intentar la consulta.'};
 }
 if(stage==='trims'){
 if(!make||!model||!year)return{options:[],notice:'Selecciona marca, año y modelo.'};
 const carapi=async()=>{let rows=[],next='https://carapi.app/api/trims/v2?'+new URLSearchParams({make,model,year,limit:'100'});for(let i=0;i<4&&next;i++){const result=await get(next);rows.push(...(result.data||[]));next=result.collection?.next?new URL(result.collection.next,'https://carapi.app').href:'';if(next&&!next.startsWith('https://carapi.app/api/trims/v2?'))break;}return rows.filter(r=>normalize(r.make)===normalize(make)&&normalize(r.model)===normalize(model)&&String(r.year)===year).map(r=>({id:String(r.id),value:r.submodel||r.trim,label:'CarAPI · '+(r.description||r.submodel||r.trim),provider:'carapi'}));};
 const results=await Promise.allSettled([carapi(),aduanaConfigurations(input).then(rows=>rows.map(r=>({id:r.ref,value:r.version,label:r.label,provider:'aduana'}))),epaConfigurations(input)]),options=results.flatMap(r=>r.status==='fulfilled'?r.value:[]),unavailable=results.map((r,i)=>r.status==='rejected'?['CarAPI','Aduana','EPA'][i]:null).filter(Boolean);
 return{options,sources:['CarAPI','Aduana Nacional','FuelEconomy.gov'],unavailable,notice:options.length?'Elige una configuración exacta. Aduana identifica subtipos; EPA identifica configuraciones técnicas, no todos los acabados comerciales. Se mantiene el motor de ese mismo registro.'+(unavailable.length?' Fuente temporalmente no disponible: '+unavailable.join(', ')+'.':''):'No se encontró una configuración exacta para ese modelo y año en las fuentes disponibles.'};
 }
 if(stage==='detail'){
 const id=String(input.id||'');if(id.startsWith('aduana:'))return{spec:await aduanaDetail(id,input)};if(id.startsWith('epa:'))return{spec:await epaDetail(id,input)};
 if(!/^\\d{1,9}$/.test(id))throw Error('Configuración inválida.');const detail=await get('https://carapi.app/api/trims/v2/'+id);if(normalize(detail.make)!==normalize(make)||normalize(detail.model)!==normalize(model)||String(detail.year)!==year)throw Error('La configuración no corresponde a la marca, modelo y año elegidos.');return{spec:configFromDetail(detail)};
 }
`+s.slice(end);await writeFile('vehicle-catalog.mjs',s);
let assistant=await readFile('dist/vehicle-assistant.js','utf8');assistant=assistant.replace("ref.value='carapi:'+active.id;", "ref.value=active.ref||'carapi:'+active.id;");assistant=assistant.replace("if(ref.value.startsWith('carapi:'))selectTrim(ref.value.slice(7)).then(()=>refreshRemote());else refreshRemote();", "if(ref.value)selectTrim(ref.value.startsWith('carapi:')?ref.value.slice(7):ref.value).then(()=>refreshRemote());else refreshRemote();");await writeFile('dist/vehicle-assistant.js',assistant);
let backend=await readFile('backend.mjs','utf8');backend=backend.replace("/^carapi:\\d{1,9}$/", "/^(?:carapi:\\d{1,9}|epa:\\d{1,8}|aduana:\\d{1,6}(?:\\.\\d{1,6}){8})$/");await writeFile('backend.mjs',backend);
console.log('EPA and Aduana connected to the same configuration-validation flow.');
