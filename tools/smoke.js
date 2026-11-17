/* Smoke test: screenshots of the main routes, collects page errors. NODE_PATH=$(npm root -g) node tools/smoke.js [outdir] */
const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/claude-0/-home-claude/8823f775-4aef-51cc-a833-8a13bb03986e/scratchpad/shots';
require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [name, w, h, scheme] of [['phone', 390, 800, 'light'], ['desk', 1200, 850, 'dark']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(name + ' pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()); });
    await p.goto('http://127.0.0.1:8765/index.html');
    await p.evaluate(() => { const s = WIW.S(); s.seenIntro = true; s.unlockAll = true; s.name = 'Mikii'; s.bits = 500; WIW.save(); });
    const routes = ['#/', '#/world/w3', '#/lesson/w3l2', '#/play/w3l2', '#/gate/w1', '#/story', '#/story/ch3', '#/guide/types', '#/guide/stairs', '#/guide/conn', '#/arcade', '#/arcade/types', '#/machine', '#/tests', '#/test/u6', '#/wardrobe', '#/me', '#/respawn'];
    for (const r of routes) {
      await p.goto('http://127.0.0.1:8765/index.html' + r); await p.reload(); await p.waitForTimeout(250);
      const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) errs.push(name + ' ' + r + ' horizontal overflow ' + over + 'px');
      await p.screenshot({ path: out + '/' + name + '-' + r.replace(/[#/]+/g, '_') + '.png', fullPage: r !== '#/arcade/types' });
    }
    await ctx.close();
  }
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'no errors'); process.exit(errs.length ? 1 : 0);
})();
