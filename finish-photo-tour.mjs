import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('dist/tour-connections.js','utf8');s=s.replace("front=find(v=>/delanter/i.test(v.label)&&v.kind==='panorama')","front=(()=>{const i=find(v=>/delanter/i.test(v.label)&&v.kind==='panorama');return i>=0?i:find(v=>v.kind==='panorama');})()");await writeFile('dist/tour-connections.js',s);
// Apply the transition to still photographs as well as panoramas.
s=await readFile('dist/torres-tour.js','utf8');s=s.replace("}addLinks(index);","}addLinks(index);reveal();");await writeFile('dist/torres-tour.js',s);
