import {readFile,writeFile} from 'node:fs/promises';
async function edit(path,fn){const before=await readFile(path,'utf8');const after=fn(before);if(before===after)throw Error('Sin cambio: '+path);await writeFile(path,after);}
await edit('dist/finance-math.js',s=>"import {settlementTotals} from './commission-exchange.js';\n"+s.replace("out.mode=['percent'", "out.payoutCurrency=['USD','BOB'].includes(input.payoutCurrency)?input.payoutCurrency:out.currency;for(const key of ['exchangeRate','receivedRate']){const n=parseAmount(input[key]);if(n!==null&&(!Number.isFinite(n)||n<=0||n>1000))throw Error('El tipo de cambio debe ser mayor que cero y menor que 1,000 Bs por dólar.');out[key]=n;}if(out.payoutCurrency!==out.currency&&(!out.exchangeRate||(out.received>0&&!out.receivedRate))){}out.mode=['percent'")
.replace("if((out.received||0)>Math.max(0,result.gross))", "if(out.payoutCurrency!==out.currency&&(!out.exchangeRate||((out.received||0)>0&&!out.receivedRate)))throw Error('Indica el tipo de cambio acordado y, si hubo cobro, el aplicado al cobrar (Bs por US$ 1).');if(settlementTotals(out,result).receivedBase>Math.max(0,result.gross)+0.01)")
.replace("const t=financeTotals(v.privateFinance);for", "const t=financeTotals(v.privateFinance),settled=settlementTotals(v.privateFinance,t);t.received=settled.receivedBase;t.pending=settled.pendingBase;for"));
await edit('backend.mjs',s=>"import {normalizeOffer} from './dist/offers.js';\n"+s.replace("const previous=inventory.find(v=>v.id===out.id);", "const previous=inventory.find(v=>v.id===out.id);normalizeOffer(input,out,previous);"));
await edit('inventory-public.mjs',s=>s.replace("'exampleKey'","'exampleKey','offer'"));
await edit('automatic-research.mjs',s=>"import {indicativePrices} from './indicative-prices.mjs';\n"+s.replace("const queries=[base+", "const queries=[googlePriceQuestion(input),base+")
.replace("snippet:row.snippet||description||excerpt.slice(0,350)","estimateText:rowData.snippet,snippet:row.snippet||description||excerpt.slice(0,350)")
.replace("valuation=realisticValuations(compatible,input)","observed=realisticValuations(compatible,input),valuation=observed.length?observed:indicativePrices(results,input)")
.replace("notice:valuation.length?", "notice:!observed.length?'Sin comparables exactos: los tres precios son una estimación de confianza muy baja con los supuestos indicados. La consulta a Google es una búsqueda, no una respuesta garantizada.':valuation.length?"));
await edit('dist/admin-v2.js',s=>s.replace("['auth','dashboard','editor']","['auth','dashboard','editor','sales']")
.replace("await load();message('Selección de la ruleta", "await load({preserveScroll:true});message('Selección de la ruleta")
.replace("async function load(){items=await api('admin/inventory');screen('dashboard');window.scrollTo({top:0,behavior:'instant'});", "async function load({preserveScroll=false}={}){const savedY=window.scrollY;items=await api('admin/inventory');screen('dashboard');if(!preserveScroll)window.scrollTo({top:0,behavior:'instant'});")
.replace("filterRows();}\n$('#export-inventory')", "filterRows();if(preserveScroll)window.scrollTo({top:savedY,behavior:'instant'});}\n$('#export-inventory')")
.replace("load=async()=>{await baseLoad();operations.report(items);};", "load=async(options)=>{await baseLoad(options);operations.report(items);};")
.replace("privateFinance:operations.validate(),", "privateFinance:operations.validate(),offerEnabled:operations.offerEnabled(),")
.replace("Si faltan anuncios compatibles, se indica la falta de evidencia.","Si faltan anuncios exactos, se presentan tres estimaciones con sus supuestos y confianza muy baja.")
.replace("${group.preliminary?'referencias cercanas':'anuncios compatibles'}", "${group.method==='indicative'?'estimación orientativa':group.preliminary?'referencias cercanas':'anuncios compatibles'}")
);
