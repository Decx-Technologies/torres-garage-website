// Vercel Functions accept request bodies up to 4.5 MB. Photos travel as base64 (+33 %), so anything
// above ~3 MB is re-encoded in the browser as JPEG (max 4096 px, aspect ratio kept, so 2:1 panoramas stay 2:1).
const LIMIT=3000000;
const read=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('No se pudo leer la foto.'));r.readAsDataURL(blob);});
export async function imageDataUrl(file,{limit=LIMIT}={}){
 if(file.size<=limit)return read(file);
 const bmp=await createImageBitmap(file);
 try{
  let scale=Math.min(1,4096/Math.max(bmp.width,bmp.height));
  for(let step=0;step<8;step++){
   const w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale)),canvas=document.createElement('canvas');
   canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(bmp,0,0,w,h);
   for(const quality of [.9,.8,.7]){const blob=await new Promise(done=>canvas.toBlob(done,'image/jpeg',quality));if(blob&&blob.size<=limit)return read(blob);}
   scale*=.8;
  }
 }finally{bmp.close();}
 throw Error('No se pudo reducir la foto. Usa una imagen más liviana.');
}
