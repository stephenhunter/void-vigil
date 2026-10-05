const { chromium } = require('playwright-core');const path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1500,height:920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#btnNew');await p.click('.house[data-house="kestral"]');await p.click('#btnBegin');await p.click('#modalBtns button');
await p.evaluate(()=>{GC.G.turn=40;});await p.click('#btnHold');
console.log('defeat-by-time:',await p.evaluate(()=>document.querySelector('.screen.active').id+' | '+document.getElementById('eTitle').textContent));
await p.screenshot({path:'/tmp/defeat.png'});
await p.click('#btnEndMenu');console.log('continue disabled after game over:',await p.evaluate(()=>document.getElementById('btnContinue').disabled));
// home fall
await p.click('#btnNew');await p.click('.house[data-house="pyrrhan"]');await p.click('#btnBegin');await p.click('#modalBtns button');
await p.evaluate(()=>{GC.G.systems[0].o='horde';});await p.click('#btnHold');
console.log('defeat-by-home:',await p.evaluate(()=>document.getElementById('eTitle').textContent+' | '+document.getElementById('eText').textContent.slice(0,40)));
// swarm + revenant + choir battle quick smoke with all 4 factions: start battles directly
await p.click('#btnEndMenu');await p.click('#btnNew');await p.click('.house[data-house="bastian"]');await p.click('#btnBegin');await p.click('#modalBtns button');
for(const idx of [5,4,7,13]){await p.evaluate(i=>{GC.FAST.on=true;GC.G.loc=0;},idx);
 await p.evaluate(i=>{const s=GC.G.systems[i];s.o=s.o==='concord'?'choir':s.o;},idx);
 await p.evaluate(i=>{document.querySelector(`.sys[data-i="${i}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}));},idx);
 await p.evaluate(i=>{GC.G.ship.engines=3;},idx);
 // call startBattle via deploy path
 await p.evaluate(i=>{window.__i=i;},idx);
 const r=await p.evaluate(async i=>{startBattle(i,0);const B=GC.B;const f=B.faction;const n=B.units.filter(u=>u.side==='e').map(u=>u.letter).join('');
   for(let k=0;k<6&&GC.B&&!GC.B.over;k++){await enemyTurn();} return f+' enemies:'+n+' screen:'+document.querySelector('.screen.active').id;},idx);
 console.log(r);
 if(idx===13)await p.screenshot({path:'/tmp/05-citadel-battle.png'});
 if(await p.evaluate(()=>!!GC.B))await p.evaluate(()=>endBattle(false,true));
 if(await p.evaluate(()=>GC.G.over)){console.log('campaign over during smoke');break;}
}
console.log('ERRORS',JSON.stringify(errs));await b.close();})();
