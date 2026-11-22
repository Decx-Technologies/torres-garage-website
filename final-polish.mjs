import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('dist/admin-v2.js','utf8');
s=s.replace("requestGeneration=0;","requestGeneration=0,carouselBusy=false;");
s=s.replace("async function toggleFeatured(v,button){const ids=", "async function toggleFeatured(v,button){if(carouselBusy)return;const ids=");
s=s.replace("button.disabled=true;try{await api('admin/carousel'", "carouselBusy=true;button.disabled=true;try{await api('admin/carousel'");
s=s.replace("message(e.message,true);button.disabled=false;}}", "message(e.message,true);button.disabled=false;}finally{carouselBusy=false;}}");
s=s.replace("screen('editor');photoList();", "screen('editor');window.scrollTo({top:0,behavior:'instant'});photoList();");
s=s.replace("screen('dashboard');$('#logout')", "screen('dashboard');window.scrollTo({top:0,behavior:'instant'});$('#logout')");
// Keep the dependent identity fields together in the natural filling order.
s=s.replace("datalist(form.elements.make,makes);", "const identityFields=$('.fields');for(const key of ['make','year','name','version','engine','fuel','transmission','type','mileage','condition','color','city','country','price','status'])identityFields.append(form.elements[key].closest('label'));datalist(form.elements.make,makes);");
await writeFile('dist/admin-v2.js',s);
let css=await readFile('dist/catalog-experience.css','utf8');css=css.replace('position:sticky;top:70px;aspect-ratio:4/3','position:relative;top:0;aspect-ratio:4/3');await writeFile('dist/catalog-experience.css',css);
let backend=await readFile('backend.mjs','utf8');backend=backend.replace("out.photos=Array.isArray(input.photos)","if(out.status!=='available')out.featured=false;out.photos=Array.isArray(input.photos)");await writeFile('backend.mjs',backend);
console.log('Final interaction polish applied.');
