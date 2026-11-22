import {publicText} from './public-data.mjs';
const js=await publicText('https://appanf.aduana.gob.bo/bctp-externo/main.77d8cdbc4e295da0.js');
console.log('METHODS',[...js.matchAll(/get(?:ListaVehiculoConsulta|DistinctAnioModeloVehiculo|DistinctCombustibleVehiculo|DistinctOtrasCaracteristicasVehiculo|DistinctPaisOrigenVehiculo|DistinctTransmisionVehiculo)\([^)]*\)\{[^}]*\}/g)].map(m=>m[0]));
const base='https://anapp.aduana.gob.bo:8443/wsprbctp-consultas/vtm1/';
try{const classes=JSON.parse(await publicText(base+'distinctclasevehiculo'));console.log('CLASSES',JSON.stringify(classes));}catch(e){console.log('API ERROR',e.message,e.cause?.code);}
for(const id of ['48976','49062']){const r=await fetch('https://www.fueleconomy.gov/ws/rest/vehicle/'+id,{headers:{Accept:'application/json'}});const v=await r.json();console.log('EPADETAIL',JSON.stringify(Object.fromEntries(['id','make','model','year','displ','cylinders','trany','fuelType','atvType','VClass','eng_dscr','drive'].map(k=>[k,v[k]]))));}
