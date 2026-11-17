/* Flow test. Needs the local server:  python3 -m http.server 8765   then   NODE_PATH=$(npm root -g) node tools/flow.js
   1) answers EVERY lesson and gate item in a real browser with its key (all must score first-try);
   2) plays one lesson with wrong answers, second tries and hints; 3) clears a gate (unlock + pet);
   4) story, Guidebook, arcade, machine, every test, wardrobe, profile, reset; 5) phone-width overflow in light and dark. */
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8765/index.html';
const fails = []; const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('dialog', d => d.accept());
  const ev = (f, a) => p.evaluate(f, a);
  await p.goto(BASE); await ev(() => { const s = WIW.S(); s.seenIntro = true; s.sfx = false; WIW.save(); }); await p.reload();
  /* answer the current runner item with its key (or deliberately wrong) */
  async function answer(it, wrong) {
    if (it.type === 'type') { await p.fill('#ans', wrong ? 'zzz' : it.model); await p.click('#typed button[type=submit]'); }
    else { const sel = (it.type === 'mcq' ? '.opt' : '.seg') + '[data-o="' + (wrong ? (it.answer + 1) % 4 : it.answer) + '"]'; await p.click(sel); }
  }
  /* 1) every lesson and gate with the key */
  const plan = await ev(() => ({ lessons: WIW.LESSON_IDS.map(id => ({ id, items: WIW.CS.lessons[id].items })), gates: Object.keys(WIW.CS.gates).map(w => ({ w, items: WIW.CS.gates[w].items })) }));
  await ev(() => { WIW.S().unlockAll = true; WIW.save(); });
  let n = 0;
  for (const L of plan.lessons) {
    await p.goto(BASE + '#/play/' + L.id); await p.reload();
    for (let i = 0; i < L.items.length; i++) { await answer(L.items[i]); n++; ok(await p.isVisible('#next'), L.items[i].id + ' did not finish'); ok(await ev(() => !!document.querySelector('.plat.cur.ok')), L.items[i].id + ' key not accepted first try'); await p.click('#next'); }
    ok((await p.textContent('.score')).includes('8 / 8'), L.id + ' did not score 8/8: ' + await p.textContent('.score'));
  }
  for (const G of plan.gates) {
    await p.goto(BASE + '#/gate/' + G.w); await p.reload();
    for (let i = 0; i < G.items.length; i++) { await answer(G.items[i]); n++; ok(await ev(() => !!document.querySelector('.plat.cur.ok')), G.items[i].id + ' key not accepted'); await p.click('#next'); }
    ok((await p.textContent('.score')).includes('8 / 8'), G.w + ' gate did not score 8/8');
  }
  console.log('answered ' + n + ' items with their keys');
  const st = await ev(() => { const s = WIW.S(); return { pets: s.owned.pets.length, cleared: WIW.clearedCount(), bits: s.bits, faults: Object.keys(s.faults).length }; });
  ok(st.pets === 10 && st.cleared === 9 && st.faults === 0, 'after clearing everything: ' + JSON.stringify(st));
  /* 2) fresh player: wrong answers, hints, second tries */
  await ev(() => { WIW.reset(); const s = WIW.S(); s.seenIntro = true; s.sfx = false; WIW.save(); }); await p.goto(BASE + '#/'); await p.reload();
  ok(await p.isVisible('.cta'), 'no next-step button'); ok((await p.textContent('.cta')).includes('story'), 'first next step should be the story');
  ok(await ev(() => document.querySelectorAll('.tile.locked').length === 8), 'worlds 2–9 should start locked');
  const L1 = plan.lessons[0]; await p.goto(BASE + '#/lesson/' + L1.id); await p.reload();
  ok(await ev(() => document.querySelectorAll('.lesson [data-part]').length >= 7), 'lesson parts missing');
  await p.click('[data-xlvl=C1]'); ok(await ev(() => WIW.S().level === 'C1'), 'level switch'); await p.click('[data-xlvl=B1]');
  await p.click('.startbar .btn'); 
  for (let i = 0; i < 8; i++) { const it = L1.items[i];
    if (i === 0) { await p.click('#hint'); ok(await p.isVisible('#hintline'), 'hint not shown'); await answer(it); }
    else if (i === 1) { await answer(it, true); ok(!(await p.isVisible('#next')), 'second try not offered'); await answer(it); ok(await ev(() => !!document.querySelector('.plat.cur.half')), 'second-try half mark'); }
    else if (i === 2) { await answer(it, true); if (it.type === 'type') await answer(it, true); else await p.click((it.type === 'mcq' ? '.opt' : '.seg') + ':not(:disabled):not([data-o="' + it.answer + '"])'); ok(await ev(() => !!document.querySelector('.plat.cur.fell')), 'fall not shown'); ok(await p.isVisible('.fbl.why'), 'why not shown'); }
    else await answer(it);
    await p.click('#next'); }
  const r = await ev(() => { const s = WIW.S(), l = s.lessons[WIW.LESSON_IDS[0]]; return { best: l.best, stars: l.stars, faults: Object.keys(s.faults).length, badge: !!s.badges.first }; });
  ok(r.best === 81 && r.stars === 2 && r.faults === 2 && r.badge, 'lesson result ' + JSON.stringify(r));
  await p.goto(BASE + '#/respawn'); await p.reload(); ok(await p.isVisible('.qcard'), 'respawn room empty');
  /* 3) story + guide + arcade + machine */
  await p.goto(BASE + '#/story/ch0'); await p.reload(); ok(await ev(() => document.querySelectorAll('.glow').length >= 2), 'no glowing sentences'); await p.click('.glow'); ok(await p.isVisible('#toast'), 'no note toast');
  for (const s of ['dials', 'types', 'stairs', 'conn', 'glitch']) { await p.goto(BASE + '#/guide/' + s); await p.reload(); ok(await ev(() => document.querySelectorAll('.guide [data-part]').length >= 3), 'guide ' + s); const cnt = await ev((id) => [document.querySelectorAll('.guide [data-part]').length, Parts.guideParts(GUIDE.sections.filter(x => x.id === id)[0]).length], s); ok(cnt[0] === cnt[1], 'guide ' + s + ' parts ' + cnt); }
  const lp = await ev(() => WIW.LESSON_IDS.map(id => ['B1', 'B2', 'C1'].map(l => Parts.lessonParts(WIW.CS.lessons[id], l).length === 1 + WIW.CS.lessons[id].levels[l].body.length + WIW.CS.lessons[id].levels[l].examples.length)).flat().every(Boolean)); ok(lp, 'lesson parts count');
  await ev(() => { WIW.S().unlockAll = true; WIW.save(); });
  for (const g of ['zerofirst', 'real', 'glitch', 'types', 'conn']) { await p.goto(BASE + '#/arcade/' + g); await p.reload(); ok(await p.isVisible('#a-q'), 'arcade ' + g);
    for (let i = 0; i < 6; i++) { const c = await ev(() => { const t = document.querySelector('#a-q p').textContent; return null; }); await p.click('.acat'); if (!(await p.isVisible('#a-q'))) break; } }
  await p.goto(BASE + '#/machine'); await p.reload(); ok(await p.isVisible('.mout'), 'machine'); await p.click('.mbtn.t-m32'); await p.waitForTimeout(300); ok((await p.textContent('.mbtn.on b')) === 'Mixed 3/2', 'machine dial');
  /* 4) tests */
  const tests = await ev(() => { const T = WIW.CS.tests, o = {}; o.placement = T.placement.items; ['u6', 'finalB2', 'finalC1'].forEach(k => o[k] = T[k].sections.flatMap(s => s.items)); return o; });
  for (const id of Object.keys(tests)) {
    await p.goto(BASE + '#/test/' + id); await p.reload();
    for (let i = 0; i < tests[id].length; i++) { const it = tests[id][i]; if (it.type === 'type') await p.fill('#ans', it.model); else await p.click((it.type === 'mcq' ? '.opt' : '.seg') + '[data-o="' + it.answer + '"]'); await p.click(i < tests[id].length - 1 ? '#tnext' : '#submit'); }
    ok((await p.textContent('.score')).trim() === tests[id].length + ' / ' + tests[id].length, 'test ' + id + ' score ' + await p.textContent('.score'));
  }
  /* 5) wardrobe, profile */
  await ev(() => { WIW.S().bits = 500; WIW.save(); }); await p.goto(BASE + '#/wardrobe'); await p.reload(); await p.click('[data-acc=bow]'); ok(await ev(() => WIW.S().avatar.acc === 'bow' && WIW.S().bits < 500), 'buy bow');
  await p.goto(BASE + '#/me'); await p.reload(); ok((await ev(() => WIW.report())).includes('What-If Worlds report'), 'report');
  for (const scheme of ['light', 'dark']) { await p.emulateMedia({ colorScheme: scheme });
    for (const rt of ['#/', '#/world/w1', '#/lesson/w6l2', '#/play/w8l1', '#/story/ch5', '#/guide/types', '#/guide/stairs', '#/arcade', '#/machine', '#/tests', '#/wardrobe', '#/me']) { await p.goto(BASE + rt); await p.reload(); const over = await ev(() => document.documentElement.scrollWidth - window.innerWidth); ok(over <= 1, scheme + ' ' + rt + ' overflow ' + over); } }
  errs.forEach(e => ok(false, e));
  await b.close(); console.log(fails.length ? fails.length + ' FAILURES' : 'ALL PASSED'); process.exit(fails.length ? 1 : 0);
})();
