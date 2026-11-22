import {advertisedPrice} from './pricing.mjs';
import {parseAmount} from './dist/amount-input.js';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function indicativePrices(rows,input){
 const model=norm(input.name).replace(/\b(sr5|limited|premium|badlands)\b/g,'').trim();
 const nearby=rows.filter(r=>/bolmotor\.com|milautos\.net|\.com\.bo/.test(new URL(r.url).hostname)&&norm(r.title).includes(norm(input.make))&&model.split(/\s+/).every(w=>norm(r.title).includes(w))&&Math.abs(Number(r.title.match(/\b20\d{2}\b/)?.[0])-Number(input.year))<=2&&!/cuota|anticipo|chocad|repuesto|sin papeles/i.test(r.snippet||''))
 .map(r=>({...r,...advertisedPrice(r.title+' '+(r.estimateText||r.snippet||''))})).filter(r=>r.price>0);
 let currency=['USD','BOB'].includes(input.currency)?input.currency:'USD',basis,amount,sourceUrls=[];
 const conditionMatch=nearby.filter(r=>!(/usado|seminuevo/i.test(input.condition||'')&&/\bnuevo\b|0 km|newcondition/i.test(r.estimateText||r.snippet||'')&&!/usado|seminuevo/i.test(r.estimateText||r.snippet||'')));if(!conditionMatch.some(r=>r.currency===currency)&&conditionMatch.length)currency=conditionMatch[0].currency;const sameCurrency=conditionMatch.filter(r=>r.currency===currency),distance=sameCurrency.length?Math.min(...sameCurrency.map(r=>Math.abs(Number(r.title.match(/\b20\d{2}\b/)?.[0])-Number(input.year)))):0;const matching=sameCurrency.filter(r=>Math.abs(Number(r.title.match(/\b20\d{2}\b/)?.[0])-Number(input.year))===distance);if(matching.length){const prices=matching.map(r=>r.price).sort((a,b)=>a-b);amount=prices[Math.floor((prices.length-1)/2)];sourceUrls=matching.map(r=>r.url);basis='Mediana inferior de anuncios locales cercanos (hasta 2 años de diferencia). No confirman todos los datos de tu versión; no se altera el motor ni la ficha y no se ajusta al alza por año.';}
 else if(parseAmount(input.price)>0){amount=parseAmount(input.price);basis='El precio que escribiste es la base propuesta por ti, no un valor verificado del mercado.';}
 else{
 const body=norm(input.type+' '+input.name),premium=/bmw|mercedes|audi|lexus|porsche|land rover/i.test(input.make),large=/4runner|land cruiser|prado|fortuner|bronco|hilux|ranger|tacoma|amarok|f 150/.test(body);
 const base=premium?55000:large?48000:/pickup|camioneta/.test(body)?30000:/suv|crossover/.test(body)?24000:18000;
 const age=Math.max(0,new Date().getFullYear()-Number(input.year));amount=Math.round(base*Math.pow(.92,Math.min(age,20))/500)*500;currency='USD';
 basis=`Hipótesis inicial sin anuncios verificables: base de planificación de US$ ${base.toLocaleString('en-US')} para ${premium?'gama premium':large?'SUV grande / camioneta':/suv|crossover/.test(body)?'SUV':'su categoría'}, con depreciación supuesta de 8% anual durante ${Math.min(age,20)} años. No es una cotización boliviana comprobada ni una respuesta de Google. Versión, estado e importación pueden cambiarla mucho.`;
 }
 const step=amount>=10000?100:10,round=n=>Math.max(step,Math.round(n/step)*step);
 return[{currency,count:sourceUrls.length,preliminary:true,method:'indicative',sourceUrls,assumptions:basis+' Rango estratégico supuesto: −10% y +8%. Confianza muy baja; valida antes de publicar. No garantiza plazo de venta.',scenarios:[{key:'quick',label:'Venta rápida · estimada',price:round(amount*.90),reason:'10% menos que la base estimada para una posición de publicación más competitiva. Es un supuesto, no una venta observada.'},{key:'fair',label:'Precio justo · estimado',price:round(amount),reason:basis},{key:'slow',label:'Venta lenta · estimada',price:round(amount*1.08),reason:'8% más que la base estimada para probar un precio mayor. Puede no encontrar comprador.'}]}];
}
