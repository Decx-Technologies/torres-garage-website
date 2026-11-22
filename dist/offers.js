import {moneyParts} from './money.js';
export function offerParts(v){const current=moneyParts(v),before=Number(v.offer?.previousAmount);return current.amount&&before>current.amount&&v.offer?.currency===current.currency?{before,now:current.amount,currency:current.currency,discount:Math.round((1-current.amount/before)*100)}:null;}
export function normalizeOffer(input,out,previous){
 if(!Object.hasOwn(input,'offerEnabled')){if(previous?.offer&&offerParts({...out,offer:previous.offer}))out.offer=previous.offer;return;}
 if(input.offerEnabled!==true)return;
 const current=moneyParts(out),old=moneyParts(previous||{}),existing=previous?.offer;
 const before=old.currency===current.currency&&old.amount>current.amount?old.amount:existing?.currency===current.currency?existing.previousAmount:null;
 if(!(before>current.amount)||!current.amount)throw Error('Para activar una oferta, baja el precio guardado anteriormente y conserva la moneda.');
 out.offer={previousAmount:before,currency:current.currency,since:existing?.since||new Date().toISOString()};
}
