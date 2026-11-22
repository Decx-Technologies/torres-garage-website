import {publicText} from './public-data.mjs';
const base='https://anapp.aduana.gob.bo:8443/wsprbctp-consultas/vtm1/';
const js=await publicText('https://appanf.aduana.gob.bo/bctp-externo/main.77d8cdbc4e295da0.js');console.log('HISTORY',[...js.matchAll(/getDistinct(?:Clase|Marca|Tipo|SubTipo|Cilindrada|Traccion|Transmision|Combustible|AnioModelo)VehiculoHis\([^)]*\)\{[^}]*\}/g)].map(m=>m[0]));
for(const endpoint of ['distinctmarcavehiculo/4','distinctmarcavehiculohis/4','distinctsubtipovehiculo/2/255/1518']){try{const r=JSON.parse(await publicText(base+endpoint));console.log(endpoint,JSON.stringify(endpoint.includes('marca')?r.result?.filter(x=>/CHEV|SUZ|MARUT|GENERAL/i.test(x.descripcion)):r.result));}catch(e){console.log(endpoint,e.message);}}
