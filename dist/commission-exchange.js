const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export function settlementTotals(f,t){
 const currency=f.payoutCurrency||f.currency,foreign=currency!==f.currency,agreed=Number(f.exchangeRate),paidRate=Number(f.receivedRate||f.exchangeRate),received=Number(f.received||0);
 const convert=(n,from,to,rate)=>from===to?n:from==='USD'?n*rate:n/rate;
 const valid=!foreign||(agreed>0&&paidRate>0),receivedBase=valid?round(convert(received,currency,f.currency,paidRate)):0;
 const expected=valid?round(convert(t.gross||0,f.currency,currency,agreed)):0,pendingBase=round(Math.max(0,(t.gross||0)-receivedBase));
 const fxDifference=foreign&&valid?round(f.currency==='USD'?received-receivedBase*agreed:received*paidRate-received*agreed):0;
 return{currency,foreign,valid,expected,received,receivedBase,pendingBase,pending:valid?round(convert(pendingBase,f.currency,currency,agreed)):0,fxDifference};
}
