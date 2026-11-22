import {readFile,writeFile} from 'node:fs/promises';
async function edit(file,fn){await writeFile(file,fn(await readFile(file,'utf8')));}
await edit('dist/admin-v2.js',s=>{
 s="import {initVehicleAssistant} from './vehicle-assistant.js';\nimport {moneyParts,priceLabel} from './money.js';\n"+s;
 const start=s.indexOf('function updateSuggestions()'),end=s.indexOf("$('#write-description').onclick",start);
 s=s.slice(0,start)+`const assistant=initVehicleAssistant({form,api,node,onChange:()=>invalidateResearch()});
function updateSuggestions(){const invalid=assistant.validate();$('#completion').textContent=\`\${['make','name','year','description'].filter(k=>form.elements[k].value.trim()).length}/4 datos principales · \${photos.length} fotos\`;form.elements.currency.required=!!form.elements.price.value;return invalid;}
form.addEventListener('input',()=>{updateSuggestions();invalidateResearch();});
`+s.slice(end);
 s=s.replace("const featuredLabel=node",`const priceInput=form.elements.price;priceInput.type='number';priceInput.min='0.01';priceInput.step='0.01';priceInput.placeholder='Ej. 60000';priceInput.closest('label').firstChild.textContent='Precio de venta (vacío: a consultar)';const currencyLabel=node('label','','Moneda'),currency=node('select');currency.name='currency';for(const [value,label]of [['','Selecciona moneda'],['BOB','Bs · Bolivianos'],['USD','US$ · Dólares']]){const option=node('option','',label);option.value=value;currency.append(option);}currencyLabel.append(currency);priceInput.closest('label').after(currencyLabel);
const featuredLabel=node`);
 s=s.replace("identity=values();", "const money=moneyParts(v||{});form.elements.price.value=money.amount??'';form.elements.currency.value=money.currency;assistant.open(v);");
 s=s.replace("...values(),id:editing", "...values(),priceAmount:form.elements.price.value,id:editing");
 s=s.replace("${v.price||'Precio a consultar'}", "${priceLabel(v)}");
 s=s.replace("form.elements.price.value=group.currency+' '+Number(scenario.price).toLocaleString('es-BO');", "form.elements.price.value=scenario.price;form.elements.currency.value=group.currency;updateSuggestions();");
 s=s.replace("researchedSignature='';$('#research').disabled=false;", "researchedSignature='';comparables=[];$('#research').disabled=false;");
 s=s.replace("let identity={};",'');
 s=s.replace("requestGeneration++;editing=v?.id", "requestGeneration++;researchedSignature='';editing=v?.id");
 return s;
});
await edit('backend.mjs',s=>s.replace("const errors=compatibilityErrors(out);", "normalizeMoney(input,out);out.catalogRef=/^carapi:\\d{1,9}$/.test(String(input.catalogRef))?String(input.catalogRef):'';const errors=out.catalogRef?[]:compatibilityErrors(out);").replace("const v=vehicle(input);if(v.status", "const v=vehicle(input);await validateCatalogVehicle(v);if(v.status"));
await edit('dist/catalog-experience.js',s=>"import {priceLabel} from './money.js';\nimport {enhanceStories} from './brand-stories.js';\n"+s.slice(0,s.indexOf('const brandSlugs=')).replaceAll("v.price||'Precio a consultar'","priceLabel(v)")+"\nexport const enhanceSections=enhanceStories;\n");
await edit('dist/index.html',s=>s.replace('<link rel="stylesheet" href="catalog-experience.css">','<link rel="stylesheet" href="catalog-experience.css"><link rel="stylesheet" href="stories.css">'));
await edit('dist/admin.html',s=>s.replace('<link rel="stylesheet" href="admin.css">','<link rel="stylesheet" href="admin.css"><link rel="stylesheet" href="assistant.css">'));
console.log('Dynamic catalog, explicit currency and meaningful stories integrated.');
