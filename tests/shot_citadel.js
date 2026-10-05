const { chromium } = require('playwright-core');const path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1500,height:920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#btnNew');await p.click('.house[data-house="pyrrhan"]');await p.click('#btnBegin');await p.click('#modalBtns button');
await p.evaluate(()=>{startBattle(13,0);GC.B.sel=0;});await p.waitForTimeout(300);
await p.screenshot({path:path.resolve(__dirname,'..','screens')+'/05-citadel-boss-battle.png'});console.log('ERRORS',JSON.stringify(errs));await b.close();})();
