const { chromium } = require('playwright-core');
const path = require('path');
const FULL = process.argv.includes('--full');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 920 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));
  const external = [];
  page.on('request', r => { if (!r.url().startsWith('file:')) external.push(r.url()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  if (FULL) await page.addInitScript(() => {});
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const shots = path.resolve(__dirname, '..', 'screens');
  if (!FULL) await page.screenshot({ path: shots + '/01-title.png' });
  await page.click('#btnNew');
  await page.fill('#capName', 'Aurek Valdane');
  await page.click('.house[data-house="umbrael"]');
  if (!FULL) await page.screenshot({ path: shots + '/01b-marshal-creation.png' });
  await page.click('#btnBegin');
  await page.click('#modalBtns button');
  const dismiss = async () => { let n = 0; while (n++ < 5 && await page.evaluate(() => document.getElementById('modalBg').classList.contains('show'))) { console.log('modal:', await page.textContent('#modalTitle')); await page.click('#modalBtns button'); } };
  await page.click('.sys[data-i="2"]');
  if (!FULL) await page.screenshot({ path: shots + '/02-sector-map.png' });

  async function playBattle(shotName) {
    let rounds = 0;
    while (rounds < 40) {
      const st = await page.evaluate(() => GC.B ? { phase: GC.B.phase, over: GC.B.over } : null);
      if (!st) break;
      if (st.phase !== 'player') { await page.waitForTimeout(50); continue; }
      rounds++;
      const canvas = await page.$('#bcanvas'); const box = await canvas.boundingBox();
      const clickCell = (x, y) => page.mouse.click(box.x + x * 64 + 32, box.y + y * 64 + 32);
      const ids = await page.evaluate(() => GC.B.units.map((u, i) => [u, i]).filter(([u]) => u.side === 'p' && u.hp > 0).map(([u, i]) => i));
      for (const id of ids) {
        if (!(await page.evaluate(() => !!GC.B && GC.B.phase === 'player'))) break;
        const plan = async () => page.evaluate((id) => {
          const B = GC.B; const s = B.units[id]; if (!s || s.hp <= 0) return null;
          const en = GC.alive('e');
          const adj = en.find(e => GC.dist(s, e) === 1); if (adj && !s.acted) return { kind: 'atk', x: adj.x, y: adj.y };
          const sh = en.filter(e => GC.canShoot(s, e)).sort((a, b) => a.hp - b.hp)[0]; if (sh && !s.acted) return { kind: 'atk', x: sh.x, y: sh.y };
          if (!s.moved) { const d = GC.bfs(s.x, s.y, GC.pStats(s).move); let best = null, bs = 1e9;
            for (const k of d.keys()) { const [x, y] = k.split(',').map(Number); if (x === s.x && y === s.y) continue; const sc = Math.min(...en.map(e => GC.dist({ x, y }, e))); if (sc < bs) { bs = sc; best = { x, y }; } }
            if (best) return { kind: 'move', x: best.x, y: best.y }; }
          return null; }, id);
        const u = await page.evaluate(id => ({ x: GC.B.units[id].x, y: GC.B.units[id].y }), id);
        await clickCell(u.x, u.y);
        for (let k = 0; k < 3; k++) { const p = await plan(); if (!p || !(await page.evaluate(() => !!GC.B))) break; await clickCell(p.x, p.y); if (!(await page.evaluate(() => !!GC.B))) break; }
        if (!(await page.evaluate(() => !!GC.B))) break;
      }
      if (shotName && rounds === 2) await page.screenshot({ path: shots + '/' + shotName });
      if (!(await page.evaluate(() => !!GC.B))) break;
      await page.click('#btnEndTurn');
      await page.waitForFunction(() => !GC.B || GC.B.phase === 'player', null, { timeout: 30000 });
    }
    return await page.evaluate(() => document.querySelector('.screen.active').id);
  }

  await page.click('#btnDeploy'); await page.click('#modalBtns button');
  if (!FULL) { await page.evaluate(() => { GC.G.ammo.push('overcharge'); }); { const bx = await (await page.$('#bcanvas')).boundingBox(); const uu = await page.evaluate(() => ({ x: GC.B.units[1].x, y: GC.B.units[1].y })); await page.mouse.click(bx.x + uu.x * 64 + 32, bx.y + uu.y * 64 + 32); } await page.click('#btnAmmo'); console.log('ammo switched:', await page.evaluate(() => GC.B.units[1].ref.ammo)); }
  console.log('battle started:', await page.evaluate(() => GC.B && GC.B.units.length));
  // also test ability use once: marshal oath of fury
  await page.evaluate(() => { GC.B.sel = 0; }); await page.click('#btnAbility');
  const screen = await playBattle(FULL ? null : '03-battle.png');
  console.log('after battle 1 screen:', screen, await page.evaluate(() => document.getElementById('rTitle').textContent));
  await dismiss();
  if (screen === 'results' && !FULL) {
    await page.click('#btnToArmoury'); await dismiss();
    await page.evaluate(() => { GC.G.req += 400; GC.G.pendingPerks = 1; });
    await page.click('#btnShopDone'); await page.click('#btnArmoury');
    await page.click('#modalBtns button'); // pick a marshal honour
    console.log('perks:', await page.evaluate(() => GC.G.perks.join(',')));
    await page.click('button[data-item="charged_blade"]');
    await page.click('#sInv button'); // equip on selected (captain)
    await page.click('button[data-ammo="sabot"]');
    await page.click('button[data-ammo="cinder"]');
    await page.selectOption('.ammoSel >> nth=1', 'sabot');
    await page.selectOption('#recHouse', 'bastian');
    await page.click('button[data-recruit="breacher"]');
    await page.click('button[data-ship="lance"]');
    console.log('houses:', await page.evaluate(() => GC.G.roster.map(u => u.cls + '/' + u.house + '/' + u.ammo).join(', ')));
    if (!FULL) await page.screenshot({ path: shots + '/04-armoury.png' });
    console.log('roster', await page.evaluate(() => GC.G.roster.map(u => u.name + ':' + u.melee).join(', ')));
    await page.click('#btnShopDone');
  }
  // save/load test
  if (!FULL) {
  await page.click('#btnSave');
  const before = await page.evaluate(() => JSON.stringify(GC.G));
  await page.reload();
  await page.click('#btnContinue');
  const after = await page.evaluate(() => JSON.stringify(GC.G));
  console.log('save/load roundtrip equal:', before === after);
  }

  if (FULL) {
    // autoplay a whole campaign
    let guard = 0;
    while (guard++ < 400) {
      const active = await page.evaluate(() => document.querySelector('.screen.active').id);
      if (active === 'ending') break;
      if (await page.evaluate(() => document.getElementById('modalBg').classList.contains('show'))) { await page.click('#modalBtns button'); continue; }
      if (active === 'results') { await page.waitForTimeout(30); if (await page.evaluate(() => document.getElementById('modalBg').classList.contains('show'))) continue; await page.click('#btnToArmoury'); continue; }
      if (active === 'shop') {
        await page.evaluate(() => { const h = document.getElementById('btnHealAll'); if (h && !h.disabled) h.click();
          for (const c of ['oracle', 'breacher', 'vanguard', 'surgeon']) { const b = document.querySelector(`button[data-recruit="${c}"]`); if (b && !b.disabled) b.click(); }
          for (const s of ['engines', 'lance', 'defenses']) { const b = document.querySelector(`button[data-ship="${s}"]`); if (b && !b.disabled) b.click(); }
          for (const a of ['sabot', 'cinder']) { const b = document.querySelector(`button[data-ammo="${a}"]`); if (b && !b.disabled) b.click(); }
          document.querySelectorAll('.ammoSel').forEach(sel => { const v = [...sel.options].map(o => o.value); const want = v.includes('sabot') ? 'sabot' : v[0]; if (sel.value !== want) { sel.value = want; sel.dispatchEvent(new Event('change')); } });
          for (const it of ['aegis_shield', 'arc_rifle', 'charged_blade']) { const b = document.querySelector(`button[data-item="${it}"]`); if (b && !b.disabled) b.click(); }
          // equip all inventory across roster
          for (let r = 0; r < 6; r++) { const btn = document.querySelector('#sInv button'); if (!btn || btn.disabled) break; document.querySelectorAll('.unitcard')[r % document.querySelectorAll('.unitcard').length]?.click(); document.querySelector('#sInv button')?.click(); } });
        await page.click('#btnShopDone'); continue; }
      if (active === 'battle') { await playBattle(null); continue; }
      if (active === 'map') {
        const target = await page.evaluate(() => { const G = GC.G; if (window.__shopped === G.turn) return null; if (G.roster.length < 4 && G.req >= 60 && G.systems[G.loc].o === 'concord') return 'shop';
          const avgHp = G.roster.reduce((a, u) => a + u.hp / GC.stats(u).maxHp, 0) / G.roster.length; if (avgHp < 0.6 && G.req > 40) return 'shop';
          // pick reachable non-concord with lowest threat; prefer final if reachable and roster strong
          const nodes = [...document.querySelectorAll('.sys')].map(g => +g.dataset.i);
          return null; });
        if (target === 'shop') { await page.click('#btnArmoury'); 
          // after shop return we need to move; mark flag to avoid loop
          await page.evaluate(() => { window.__shopped = GC.G.turn; }); continue; }
        const weak = await page.evaluate(() => { const G = GC.G; if (G.turn > 34) return false; const avg = G.roster.reduce((a, u) => a + u.hp / GC.stats(u).maxHp, 0) / Math.max(1, G.roster.length); return G.roster.length < 4 || avg < 0.7; });
        if (weak) { await page.click('#btnHold'); continue; }
        const pickIdx = await page.evaluate(() => { const G = GC.G; const reach = (function () { const res = new Map(); const q = [[G.loc, 0]]; const seen = new Set([G.loc]); const nb = i => { const r = []; [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,7],[4,7],[4,6],[5,6],[5,9],[6,10],[7,8],[7,10],[8,11],[10,11],[10,12],[6,9],[9,12],[11,13],[12,13],[3,8]].forEach(([a, b]) => { if (a === i) r.push(b); if (b === i) r.push(a); }); return r; };
            while (q.length) { const [i, d] = q.shift(); if (d >= G.ship.engines) continue; for (const n of nb(i)) { if (seen.has(n)) continue; seen.add(n); res.set(n, d + 1); if (G.systems[n].o === 'concord') q.push([n, d + 1]); } } return res; })();
          const c = [...reach.keys()].filter(i => G.systems[i].o !== 'concord').sort((a, b) => G.systems[a].t - G.systems[b].t);
          if (c.length) return c[0]; return [...reach.keys()][0]; });
        await page.click(`.sys[data-i="${pickIdx}"]`);
        const dep = await page.$('#btnDeploy'); if (dep) { await dep.click(); } else { await page.click('#btnHold'); }
        continue; }
      if (active === 'title') { await page.click('#btnContinue'); continue; }
    }
    console.log('FINAL STATE:', await page.evaluate(() => document.querySelector('.screen.active').id + ' turn ' + (GC.G && GC.G.turn)));
    console.log('PERKS:', await page.evaluate(() => (GC.G.perks || []).join(',')));
    console.log('FULL RUN END:', await page.evaluate(() => [document.getElementById('eTitle').textContent, document.getElementById('eStats').innerText]));
    await page.screenshot({ path: '/tmp/ending.png' });
  }
  console.log('ERRORS:', JSON.stringify(errors));
  console.log('EXTERNAL REQUESTS:', JSON.stringify(external));
  await browser.close();
})().catch(e => { console.error('TEST FAILED', e); process.exit(1); });
