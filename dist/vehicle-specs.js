// Only source-backed combinations are offered. Unknown models have no technical guesses.
export const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const toyotaSource='https://pressroom.toyota.com/the-all-new-2025-toyota-4runner-the-icon-that-inspires-exploration/';
export function specification(data){
 const make=normalize(data.make),model=normalize(data.name),year=String(data.year),version=normalize(data.version||model.replace(/^(4runner|bronco)\s*/,''));
 if(make==='toyota'&&/^4runner(?: |$)/.test(model)&&year==='2025'){
  const versions=['SR5','TRD Sport','TRD Sport Premium','TRD Off-Road','TRD Off-Road Premium','Limited','Platinum','TRD Pro','Trailhunter'];
  const validVersion=versions.find(v=>normalize(v)===version);
  let engines=['2.4 Turbo','2.4 Turbo Híbrido'];
  if(['sr5','trd sport','trd sport premium'].includes(version))engines=['2.4 Turbo'];
  if(['platinum','trd pro','trailhunter'].includes(version))engines=['2.4 Turbo Híbrido'];
  const hybrid=normalize(data.engine).includes('hibrid');
  return {source:toyotaSource,market:'Especificaciones de Toyota EE. UU.; confirma el mercado de origen de la unidad.',versions,engine:engines,type:['SUV'],transmission:['Automática'],fuel:data.engine?[hybrid?'Híbrido':'Gasolina']:['Gasolina','Híbrido'],validVersion};
 }
 if(make==='ford'&&/^bronco(?: |$)/.test(model)&&year==='2026'&&version==='badlands')return{source:'https://www.ford.com/suvs/bronco/models/badlands/',market:'Especificaciones Ford EE. UU.; confirma el mercado de origen.',versions:['Badlands'],engine:normalize(data.transmission)==='manual'?['2.3 Turbo']:['2.3 Turbo','2.7 V6'],type:['SUV'],transmission:normalize(data.engine).includes('2 7')?['Automática']:['Manual','Automática'],fuel:['Gasolina']};
 return null;
}
export function compatibilityErrors(data){const spec=specification(data);if(!spec)return[];const errors=[];
 const embedded=normalize(data.name).replace(/^(4runner|bronco)\s*/,''),version=normalize(data.version);if(embedded&&version&&spec.versions.some(v=>normalize(v)===embedded)&&embedded!==version)errors.push('La versión escrita en el modelo no coincide con el campo Versión. Usa el nombre base del modelo o corrige la versión.');
 for(const [key,label] of [['engine','motor'],['fuel','combustible'],['transmission','transmisión'],['type','carrocería']])if(data[key]&&!spec[key].some(v=>normalize(v)===normalize(data[key])))errors.push(`El ${label} «${data[key]}» no corresponde a la ficha verificada de ${data.make} ${data.name} ${data.year}.`);
 if(data.version&&!spec.versions.some(v=>normalize(v)===normalize(data.version)))errors.push('La versión no coincide con la ficha verificada.');
 return errors;
}
