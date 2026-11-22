import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('specific-demo.mjs','utf8');s=s.replace("version:'Italia · referencia de generación'","version:'Spider · referencia de generación'");await writeFile('specific-demo.mjs',s);
s=await readFile('dist/stories.css','utf8');s+='\n@media(max-width:700px){.specific-3d-stage{height:300px!important}}\n';await writeFile('dist/stories.css',s);
