const { chromium } = require('playwright-core'); const path=require('path'), fs=require('fs');
const [dataPath, mode, out, c, k, g] = process.argv.slice(2); const D=JSON.parse(fs.readFileSync(dataPath,'utf8')); const WORK=path.dirname(path.resolve(dataPath));
(async()=>{ const W=mode==='reel'?1080:1920,H=mode==='reel'?1920:1080;
 const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files','--force-color-profile=srgb']});
 const pg=await br.newPage({viewport:{width:W,height:H}}); await pg.goto('file://'+path.join(__dirname,'compose.html'));
 await pg.evaluate(([d,m])=>setup(d,m),[D,mode]);
 const p=n=>String(n).padStart(5,'0');
 await pg.evaluate(([a,b,f])=>cover(a,b,f),[`file://${WORK}/p${c}/${p(k)}.jpg`,`file://${WORK}/q${c}/${p(k)}.png`,D.fit[mode][+g]]);
 fs.writeFileSync(out, await pg.screenshot({type:'jpeg',quality:95})); await br.close(); })();
