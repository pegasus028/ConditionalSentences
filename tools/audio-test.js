/* Read-aloud test. Needs the local server on 8765.  NODE_PATH=$(npm root -g) node tools/audio-test.js
   Every lesson at every level, every story page and every Guidebook section: each spoken part has a recorded clip.
   Then the player: Listen plays an MP3 (never the browser voice), highlights, pauses, resumes, steps on, stops on level change. */
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8765/index.html';
const fails = []; const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } };
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 390, height: 800 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__plays = []; window.__synth = 0; const op = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__plays.push(this.src); return op.call(this); };
    if (window.speechSynthesis) { const os = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { window.__synth++; return os(u); }; } });
  const ev = (f, a) => p.evaluate(f, a);
  await p.goto(BASE); await ev(() => { const s = WIW.S(); s.seenIntro = true; s.unlockAll = true; s.sfx = false; WIW.save(); }); await p.reload();
  const miss = await ev(() => { const out = []; const has = t => Reader.has(t);
    WIW.LESSON_IDS.forEach(id => ['B1', 'B2', 'C1'].forEach(l => Parts.lessonParts(WIW.CS.lessons[id], l).forEach((t, i) => { if (!has(t)) out.push(id + ':' + l + ':' + i); })));
    WIW.CS.story.chapters.forEach((c, ci) => c.pages.forEach((pg, pi) => Parts.storyParts(pg).forEach((t, i) => { if (!has(t)) out.push('story ch' + ci + ' p' + pi + ':' + i); })));
    GUIDE.sections.forEach(s => Parts.guideParts(s).forEach((t, i) => { if (!has(t)) out.push('guide ' + s.id + ':' + i); })); return out; });
  ok(miss.length === 0, miss.length + ' spoken parts have no clip: ' + miss.slice(0, 8).join(', '));
  console.log('manifest clips:', await ev(() => WIW_AUDIO.keys.length));
  await p.goto(BASE + '#/lesson/w3l1'); await p.reload();
  await p.click('#l-say'); await p.waitForTimeout(700);
  ok(await ev(() => __plays.length === 1 && /audio\/tts\/[0-9a-f]{8}\.mp3$/.test(__plays[0]) && __synth === 0), 'Listen should play an MP3, not the browser voice');
  ok(await ev(() => document.querySelector('.lesson .key').classList.contains('reading')), 'key sentence highlighted'); ok(await p.isVisible('#reader-bar'), 'player bar');
  await p.click('#l-say'); ok(await ev(() => Reader.state().state === 'paused' && Reader.state().el.paused), 'pause'); ok((await p.textContent('#l-say .lsay-lbl')) === 'Resume', 'button says Resume');
  await p.click('#rd-toggle'); await p.waitForTimeout(300); ok(await ev(() => Reader.state().state === 'playing' && Reader.state().i === 0), 'resume on the same part');
  await p.click('#rd-next'); await p.waitForTimeout(400); ok(await ev(() => Reader.state().i === 1 && document.querySelectorAll('.lesson .prose p')[0].classList.contains('reading')), 'next part');
  const n = await ev(() => Reader.state().parts.length); for (let i = 1; i < n; i++) { await ev(() => Reader.state().el.dispatchEvent(new Event('ended'))); await p.waitForTimeout(120); }
  ok(await ev(() => Reader.state().state === 'idle'), 'reaches the end'); ok(await ev(() => __synth === 0), 'no browser voice through the whole lesson');
  await p.click('#l-say'); await p.waitForTimeout(300); await p.click('[data-xlvl=C1]'); ok(await ev(() => Reader.state().state === 'idle'), 'level change stops reading');
  await p.goto(BASE + '#/story/ch1'); await p.reload(); await ev(() => { __plays.length = 0; }); await p.click('#s-say'); await p.waitForTimeout(500); ok(await ev(() => __plays.length === 1 && __synth === 0), 'story Listen plays an MP3');
  await p.click('.turn .btn.big'); await p.waitForTimeout(300); ok(await ev(() => Reader.state().state === 'idle'), 'page turn stops reading');
  await p.goto(BASE + '#/guide/stairs'); await p.reload(); await ev(() => { __plays.length = 0; }); await p.click('#g-say'); await p.waitForTimeout(500); ok(await ev(() => __plays.length === 1 && __synth === 0), 'Guidebook Listen plays an MP3');
  await ev(() => { Reader.stop(); Reader.read([{ text: 'This sentence was never recorded, so the device voice reads it.' }], { owner: 't' }); }); await p.waitForTimeout(300); ok(await ev(() => __synth >= 1), 'fallback to the browser voice');
  const over = await ev(() => document.documentElement.scrollWidth - window.innerWidth); ok(over <= 1, 'overflow with the bar open');
  errs.forEach(e => ok(false, 'pageerror ' + e)); await b.close(); console.log(fails.length ? fails.length + ' FAILURES' : 'ALL PASSED'); process.exit(fails.length ? 1 : 0);
})();
