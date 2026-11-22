import {readFile,writeFile} from 'node:fs/promises';
async function edit(path,fn){await writeFile(path,fn(await readFile(path,'utf8')));}
await edit('backend.mjs',s=>{
 s="import {publicVehicle} from './inventory-public.mjs';\nimport {sanitizeFinance} from './dist/finance-math.js';\nimport {moneyParts} from './dist/money.js';\n"+s;
 s=s.replace("'condition','version','color']","'condition','version','color','drive']");
 s=s.replace("normalizeMoney(input,out);", "out.country='Bolivia';normalizeMoney(input,out);");
 s=s.replace("return out;}\nhttp.createServer", `const previous=inventory.find(v=>v.id===out.id);if(Object.hasOwn(input,'privateFinance')){if(!input.privateFinance||typeof input.privateFinance!=='object'||Array.isArray(input.privateFinance))throw Error('Acuerdo privado inválido.');out.privateFinance=sanitizeFinance(input.privateFinance,previous?.privateFinance);out.privateFinance.updatedAt=new Date().toISOString();}else if(previous?.privateFinance)out.privateFinance=previous.privateFinance;
if(out.privateFinance){if(previous?.privateFinance?.advertisedAtSale)out.privateFinance.advertisedAtSale=previous.privateFinance.advertisedAtSale;if(out.status==='sold'&&out.privateFinance.salePrice>0&&!out.privateFinance.advertisedAtSale){const advertised=moneyParts(previous||out);if(advertised.amount&&advertised.currency)out.privateFinance.advertisedAtSale={amount:advertised.amount,currency:advertised.currency};if(!out.privateFinance.saleDate)out.privateFinance.saleDate=new Date().toLocaleDateString('en-CA',{timeZone:'America/La_Paz'});}}return out;}
http.createServer`);
 s=s.replace("inventory.filter(v=>v.status==='available'))", "inventory.filter(v=>v.status==='available').map(publicVehicle))");return s;
});
await edit('dist/admin-v2.js',s=>{
 s="import {initAdminOperations} from './admin-operations.js';\nimport {parseAmount} from './amount-input.js';\n"+s;
 s=s.replace("['color','Color','Blanco']", "['color','Color','Blanco'],['drive','Tracción','Según la configuración elegida']");
 s=s.replace("'fuel','transmission','type','mileage'", "'fuel','transmission','drive','type','mileage'");
 s=s.replace("form.elements.currency.required=!!form.elements.price.value;", "form.elements.currency.required=false;if(parseAmount(form.elements.price.value)>0&&!form.elements.currency.value)invalid.push('Selecciona la moneda del precio: Bs o Dólares.');");
 s=s.replace("priceAmount:form.elements.price.value,id:editing", "priceAmount:parseAmount(form.elements.price.value)??'',privateFinance:operations.validate(),id:editing");
 s=s.replace("Transmisión:v.transmission,Combustible", "Transmisión:v.transmission,Tracción:v.drive,Combustible");
 s=s.replace("'transmission','fuel','city'", "'transmission','drive','fuel','city'");
 s=s.replace("watchAdminNotices();", `const operations=initAdminOperations({form,node,getItems:()=>items,openVehicle:v=>open(v),notify});const baseOpen=open;open=v=>{baseOpen(v);operations.open(v);};const baseLoad=load;load=async()=>{await baseLoad();operations.report(items);};
watchAdminNotices();`);
 return s;
});
await edit('dist/vehicle-assistant.js',s=>{
 s=s.replaceAll(",'color'",'');
 s=s.replace("'transmission','type'", "'transmission','drive','type'");
 s=s.replace("function data(){", "const specOptions=(spec,key)=>key==='drive'?(spec?.drive?[spec.drive]:[]):spec?.[key]||[];\n function data(){");
 s=s.replaceAll("spec?.[key]||[]", "specOptions(spec,key)").replaceAll("spec[key]||[]", "specOptions(spec,key)");
 // Keep the helper independent of itself after replacing call sites.
 s=s.replace("const specOptions=(spec,key)=>key==='drive'?(spec?.drive?[spec.drive]:[]):specOptions(spec,key);", "const specOptions=(spec,key)=>key==='drive'?(spec?.drive?[spec.drive]:[]):spec?.[key]||[];");
 s=s.replace("!active[k].some", "!specOptions(active,k).some");
 s=s.replace("active[k].length===1?active[k][0]:''", "specOptions(active,k).length===1?specOptions(active,k)[0]:''");
 return s;
});
for(const file of ['epa-catalog.mjs','aduana-catalog.mjs','vehicle-catalog.mjs'])await edit(file,s=>"import {normalizeDrive} from './dist/drive.js';\n"+s);
await edit('epa-catalog.mjs',s=>s.replace("color:[],source:","color:[],drive:normalizeDrive(v.drive),source:"));
await edit('aduana-catalog.mjs',s=>s.replace("drive:labels.drive,source", "drive:normalizeDrive(labels.drive),source"));
await edit('vehicle-catalog.mjs',s=>s.replace("market:'Configuración del catálogo CarAPI", "drive:normalizeDrive((d.drive_types||[]).map(r=>r.description).join(' / ')),market:'Configuración del catálogo CarAPI").replace("['engine','fuel','transmission','type']", "['engine','fuel','transmission','drive','type']").replace("!spec[key].some", "!(key==='drive'?[spec.drive]:spec[key]).some"));
await edit('dist/catalog-experience.js',s=>s.replace("['fuel','Combustible']", "['drive','Tracción'],['fuel','Combustible']"));
await edit('dist/admin.html',s=>s.replace('<link rel="stylesheet" href="admin-notices.css">','<link rel="stylesheet" href="admin-notices.css"><link rel="stylesheet" href="admin-workspace.css">'));
console.log('Private sales, public-field allowlist, drivetrain and unified inputs connected.');
