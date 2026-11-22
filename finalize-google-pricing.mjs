import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('dist/admin-v2.js','utf8');s=s.replace("'condition','mileage','currency'].map","'condition','mileage','currency','type'].map");await writeFile('dist/admin-v2.js',s);
const pkg=JSON.parse(await readFile('package.json','utf8'));if(!pkg.scripts.test.includes('google-pricing.test.mjs'))pkg.scripts.test+=' google-pricing.test.mjs';await writeFile('package.json',JSON.stringify(pkg,null,2)+'\n');
