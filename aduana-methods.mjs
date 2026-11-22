import {publicText} from './public-data.mjs';
const js=await publicText('https://appanf.aduana.gob.bo/bctp-externo/main.77d8cdbc4e295da0.js');
for(const term of ['getDistinctMarcaVehiculo','getDistinctClaseVehiculo','getDistinctTipoVehiculo','getDistinctCilindrada','onClaseSeleccionado(e)','onMarcaSeleccionado(e)','onTipoSeleccionado(e)','onSubTipoSeleccionado(e)','onCilindradaSeleccionado(e)','onAnioModeloSeleccionado(e)','wsprbctp-consultas']){let i=0,count=0;while((i=js.indexOf(term,i))>=0&&count++<3){console.log(term,js.slice(Math.max(0,i-150),i+2000));i+=term.length;}}
