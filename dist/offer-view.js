import {offerParts} from './offers.js';
import {priceLabel} from './money.js';
export function priceView(v,el,cls){const offer=offerParts(v);if(!offer)return el('strong',cls,priceLabel(v));const box=el('div',cls+' offer-price'),before=el('del','',priceLabel({priceAmount:offer.before,currency:offer.currency})),now=el('strong','',priceLabel(v));box.append(el('span','offer-tag','OFERTA'),el('small','','Antes'),before,el('small','','Ahora'),now);return box;}
