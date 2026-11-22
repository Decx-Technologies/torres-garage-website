import {addEmbeddedVideo} from './video-embed.js';
export function normalizeVideoLinks(value){
 if(!Array.isArray(value))throw Error('Los videos deben ser una lista de hasta dos enlaces.');
 const links=value.map(v=>String(v??'').trim()).filter(Boolean);
 if(links.length>2)throw Error('Puedes añadir un máximo de 2 videos por vehículo.');
 return [...new Set(links.map(link=>{let url;try{url=new URL(link);}catch{throw Error('Revisa el enlace del video: debe ser una dirección HTTPS completa.');}if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.')||link.length>2048)throw Error('Usa un enlace HTTPS público para cada video.');return url.href;}))];
}
export function initVideoEditor({form,node}){
 const section=node('section','vehicle-video-editor');section.innerHTML='<h3>Videos en tus redes</h3><p>Añade hasta dos enlaces de videos de esta unidad. Se mostrarán en su ficha pública y podrán reproducirse dentro de la ficha cuando la red permita su inserción.</p><div class="fields"></div>';
 const inputs=[];for(let i=0;i<2;i++){const label=node('label','',`Enlace del video ${i+1} · opcional`),input=node('input');input.type='url';input.inputMode='url';input.maxLength=2048;input.placeholder='https://…';input.id='vehicle-video-'+(i+1);input.setAttribute('aria-label',`Enlace del video ${i+1}`);label.append(input);section.querySelector('.fields').append(label);inputs.push(input);}
 document.querySelector('#photo-list').parentElement.before(section);
 return{capture:()=>normalizeVideoLinks(inputs.map(input=>input.value)),open(v){inputs.forEach((input,i)=>{input.value=v?.videoLinks?.[i]||'';});}};
}
export function renderVideoLinks(vehicle,node){
 let links;try{links=normalizeVideoLinks(vehicle.videoLinks||[]);}catch{return null;}if(!links.length)return null;
 const section=node('section','vehicle-social-videos');section.setAttribute('aria-label','Videos de este vehículo');section.append(node('h3','','Conoce este auto en video'),node('p','','Reproduce aquí el video o ábrelo en su red social. Algunas redes pueden pedir acceso o bloquear la reproducción insertada.'));
 const list=node('div','vehicle-video-links');for(const [i,url]of links.entries()){const host=new URL(url).hostname.replace(/^www\./,''),platform=/youtu\.be|youtube\.com/.test(host)?'YouTube':/tiktok\.com/.test(host)?'TikTok':/instagram\.com/.test(host)?'Instagram':/facebook\.com|fb\.watch/.test(host)?'Facebook':host;addEmbeddedVideo(list,url,node);const a=node('a','vehicle-video-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.append(node('span','video-play','▶'),node('span','',`Video ${i+1} · ${platform}`),node('small','','Abrir en nueva pestaña'));list.append(a);}section.append(list);return section;
}
