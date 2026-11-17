/* What-If Worlds — play.js: the obby quiz runner (lessons, boss gates, Respawn Room) and the tests. */
(function () {
  'use strict';
  var W = window.WIW, $ = W.$, $$ = W.$$, esc = W.esc, rich = W.rich, CS = W.CS, Art = window.Art;
  var norm = function (s) { return String(s).toLowerCase().replace(/[‘’`]/g, "'").replace(/[“”]/g, '"').replace(/,/g, '').replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim(); };
  /* a missing apostrophe (dont, wouldnt) is forgiven, with a reminder */
  var loose = function (s) { return norm(s).replace(/'/g, ''); };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var stemHtml = function (s) { return rich(s).replace(/_{3,}/g, '<span class="gap" aria-label="gap"></span>'); };
  function linesHtml(it) { return it.lines && it.lines.length ? '<div class="lines">' + it.lines.map(function (l) { return /^(situation|story|context|notice|sign)$/i.test(l.who) ? '<p class="sit">' + rich(l.text) + '</p>' : '<p><b>' + esc(l.who) + ':</b> ' + rich(l.text) + '</p>'; }).join('') + '</div>' : ''; }
  function spotParts(stem) { var out = [], re = /\[\[(.+?)\]\]/g, last = 0, m, k = 0; while ((m = re.exec(stem))) { if (m.index > last) out.push({ t: stem.slice(last, m.index) }); out.push({ t: m[1], seg: k++ }); last = re.lastIndex; } if (last < stem.length) out.push({ t: stem.slice(last) }); return out; }

  /* ================================================================ the runner */
  var R = null;
  function start(kind, id, items, meta) {
    R = { kind: kind, id: id, items: items, i: 0, res: [], combo: 0, best: 0, bits: 0, xp: 0, clean: true, meta: meta || {}, tries: 0, perm: null, done: false, fixed: 0 };
    W.touchDay(); draw();
  }
  function track() {
    var n = R.items.length, cells = '';
    for (var i = 0; i < n; i++) { var r = R.res[i], cls = r === 1 ? ' ok' : r === .5 ? ' half' : r === 0 ? ' fell' : ''; cells += '<i class="plat' + cls + (i === R.i ? ' cur' : '') + '"><span>' + (r === 1 ? '★' : r === .5 ? '½' : r === 0 ? '✕' : i + 1) + '</span></i>'; }
    return '<div class="obby" style="--n:' + (n + 1) + ';--i:' + R.i + '"><div class="obby-in">' + cells + '<i class="plat flag"><span>🏁</span></i><div class="runner" id="runner">' + Art.avatar(W.S().avatar, { nopet: true }) + '</div></div><div class="lava" aria-hidden="true"></div></div>';
  }
  function draw() {
    var it = R.items[R.i], gate = R.kind === 'gate', S = W.S();
    R.tries = 0; R.hinted = false;
    var body = '';
    if (it.type === 'mcq') {
      R.perm = shuffle([0, 1, 2, 3]);
      body = '<div class="opts">' + R.perm.map(function (oi, k) { return '<button class="opt" data-o="' + oi + '"><span class="k">' + (k + 1) + '</span><span>' + rich(it.options[oi]) + '</span></button>'; }).join('') + '</div>';
    } else if (it.type === 'spot') {
      body = '<p class="spot-how">Tap the part with the mistake.</p>';
    } else {
      body = '<form class="typed" id="typed" autocomplete="off"><input id="ans" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the missing words" aria-label="Your answer"><button class="btn" type="submit">Check</button></form>';
    }
    var stem = it.type === 'spot' ? '<p class="stem spot">' + spotParts(it.stem).map(function (p) { return p.seg == null ? rich(p.t) : '<button class="seg" data-o="' + p.seg + '">' + rich(p.t) + '</button>'; }).join('') + '</p>'
      : (it.given ? '<p class="given">' + rich(it.given) + '</p>' : '') + (it.keyword ? '<p class="kw">Use this word: <b>' + esc(it.keyword) + '</b></p>' : '') + '<p class="stem">' + stemHtml(it.stem) + '</p>';
    var title = R.meta.title || '';
    W.view('<div class="play" style="--wc:' + (R.meta.color || '#3f7cff') + '"><div class="play-top"><button class="back dark" id="quit">✕ Quit</button><b>' + esc(title) + '</b><span class="qn">' + (R.i + 1) + ' / ' + R.items.length + '</span></div>' + track() +
      '<div class="qcard"><p class="qmeta"><span class="tag sk-' + it.skill + '">' + (it.skill === 'meaning' ? 'Meaning' : 'Form') + '</span>' + (gate ? '<span class="tag">Boss: one try</span>' : '') + '</p>' + linesHtml(it) + stem + body +
      '<div id="fb" aria-live="polite"></div><div class="qfoot">' + (gate ? '' : '<button class="btn ghost" id="hint">💡 Hint</button>') + '<button class="btn big" id="next" hidden>Next ▶</button></div></div></div>', '', 'playv');
    $('#quit').onclick = function () { if (R.res.length && !R.done) { if (!window.confirm('Quit this run? Your answers so far will not be saved.')) return; } location.hash = R.meta.back || '#/'; if ((location.hash || '') === (R.meta.back || '#/')) W.route(); };
    var hb = $('#hint'); if (hb) hb.onclick = function () { showHint(it); R.hinted = true; S.stats.hints++; };
    $$('.opt, .seg').forEach(function (b) { b.onclick = function () { answer(it, +b.getAttribute('data-o'), b); }; });
    var f = $('#typed'); if (f) { f.onsubmit = function (e) { e.preventDefault(); var v = $('#ans').value; if (!v.trim()) return; answerTyped(it, v); }; setTimeout(function () { var a = $('#ans'); if (a && window.innerWidth > 700) a.focus(); }, 60); }
    $('#next').onclick = next;
  }
  function showHint(it) { var fb = $('#fb'); if (!$('#hintline')) fb.insertAdjacentHTML('afterbegin', '<p class="hintline" id="hintline">💡 ' + rich(it.hint) + '</p>'); }
  function fbLine(cls, html) { $('#fb').insertAdjacentHTML('beforeend', '<p class="fbl ' + cls + '">' + html + '</p>'); }
  function finishItem(it, score, extra) {
    var S = W.S(), gate = R.kind === 'gate';
    R.res[R.i] = score;
    $$('.opt, .seg').forEach(function (b) { b.disabled = true; }); var a = $('#ans'); if (a) a.disabled = true; var hb = $('#hint'); if (hb) hb.hidden = true;
    S.stats.answered++; S.skill[it.skill][1]++; var ct = S.ctype[it.ctype] = S.ctype[it.ctype] || [0, 0]; ct[1]++;
    if (score > 0) { S.skill[it.skill][0] += score; ct[0] += score; }
    if (score === 1) {
      R.combo++; S.stats.right++; S.stats.first++; if (R.combo > S.stats.bestCombo) S.stats.bestCombo = R.combo;
      var b = 5 + (R.combo >= 3 ? 2 : 0), x = R.hinted ? 7 : 10; R.bits += b; R.xp += x; W.give(b, x); W.sfx.hop(); setTimeout(W.sfx.coin, 140);
      if (it.type === 'type') S.stats.typed++;
      if (R.kind === 'respawn' && S.faults[it.id]) { delete S.faults[it.id]; R.fixed++; S.stats.fixed = (S.stats.fixed || 0) + 1; if (S.stats.fixed >= 5) W.badge('fix'); }
      var rn = $('#runner'); if (rn) rn.classList.add('hop');
      var pc = $('.plat.cur'); if (pc) { pc.classList.add('ok'); pc.insertAdjacentHTML('beforeend', '<em class="coinpop">+' + b + '</em>'); }
    } else {
      R.combo = 0; R.clean = false;
      if (score === .5) { R.bits += 2; R.xp += 4; W.give(2, 4); W.sfx.hop(); S.stats.right++; var p2 = $('.plat.cur'); if (p2) p2.classList.add('half'); }
      else { W.sfx.oops(); var r2 = $('#runner'); if (r2) r2.classList.add('fall'); var p3 = $('.plat.cur'); if (p3) p3.classList.add('fell'); }
      if (R.kind !== 'respawn') S.faults[it.id] = { d: W.today() };
    }
    if (extra) fbLine(score ? 'good' : 'bad', extra);
    fbLine('why', '<b>Why:</b> ' + rich(it.why));
    if (it.truth) fbLine('truth', '<b>Truth:</b> ' + rich(it.truth));
    W.save();
    var nx = $('#next'); nx.hidden = false; nx.textContent = R.i === R.items.length - 1 ? 'Finish 🏁' : 'Next ▶'; nx.focus();
  }
  function answer(it, oi, btn) {
    if (R.res[R.i] !== undefined) return;
    var gate = R.kind === 'gate', right = oi === it.answer;
    W.sfx.tap();
    if (right) { btn.classList.add('right'); return finishItem(it, R.tries ? .5 : 1, '✅ ' + rich(it.fb[oi])); }
    btn.classList.add('wrong'); btn.disabled = true;
    if (!gate && R.tries === 0) { R.tries = 1; W.sfx.oops(); var rn = $('#runner'); if (rn) { rn.classList.remove('wob'); void rn.offsetWidth; rn.classList.add('wob'); } $('#fb').innerHTML = ''; fbLine('bad', '❌ ' + rich(it.fb[oi]) + ' <b>One more try.</b>'); showHint(it); return; }
    var kb = it.type === 'mcq' ? $('.opt[data-o="' + it.answer + '"]') : $('.seg[data-o="' + it.answer + '"]'); if (kb) kb.classList.add('right');
    finishItem(it, 0, '❌ ' + rich(it.fb[oi]) + (it.type === 'spot' ? ' The mistake is <b>' + rich(spotParts(it.stem).filter(function (p) { return p.seg === it.answer; })[0].t) + '</b>; it should be <b>' + rich(it.fix) + '</b>.' : ' The answer is <b>' + rich(it.options[it.answer]) + '</b>.'));
  }
  function answerTyped(it, v) {
    if (R.res[R.i] !== undefined) return;
    var ok = it.accept.map(norm).indexOf(norm(v)) >= 0, gate = R.kind === 'gate', apo = !ok && it.accept.map(loose).indexOf(loose(v)) >= 0;
    if (ok || apo) return finishItem(it, R.tries ? .5 : 1, '✅ Yes: <b>' + esc(it.model) + '</b>' + (apo ? ' (Remember the apostrophe.)' : ''));
    if (!gate && R.tries === 0) { R.tries = 1; W.sfx.oops(); $('#fb').innerHTML = ''; fbLine('bad', '❌ Not quite. Check your spelling and the verb forms, then <b>try once more.</b>'); showHint(it); var a = $('#ans'); a.select(); return; }
    finishItem(it, 0, '❌ You wrote <em>' + esc(v) + '</em>. A correct answer is <b>' + esc(it.model) + '</b>.');
  }
  function next() { if (R.i < R.items.length - 1) { R.i++; draw(); window.scrollTo(0, 0); } else results(); }

  function results() {
    var S = W.S(), n = R.items.length, sum = R.res.reduce(function (a, b) { return a + b; }, 0), pct = Math.round(100 * sum / n), stars = pct === 100 ? 3 : pct >= 75 ? 2 : pct >= 50 ? 1 : 0;
    var mean = R.items.filter(function (it) { return it.skill === 'meaning'; }), form = R.items.filter(function (it) { return it.skill === 'form'; });
    var sc = function (arr) { return arr.reduce(function (a, it) { return a + R.res[R.items.indexOf(it)]; }, 0); };
    var extra = '', bonus = 0, title = '', back = R.meta.back || '#/', nextBtn = '';
    R.done = true;
    if (R.kind === 'lesson') {
      var rec = S.lessons[R.id] || { best: 0, stars: 0, tries: 0 }, first = !S.lessons[R.id]; rec.tries++;
      if (stars > rec.stars) { bonus += 20 * (stars - rec.stars); rec.stars = stars; } if (pct > rec.best) rec.best = pct; S.lessons[R.id] = rec;
      if (first) W.badge('first'); if (stars === 3) W.badge('three'); if (R.clean) W.badge('clean');
      title = stars === 3 ? 'Perfect run!' : stars === 2 ? 'Great run!' : stars === 1 ? 'You made it across.' : 'The lava won this time.';
      var w = W.world(W.lesson(R.id).world), idx = w.lessons.indexOf(R.id), nid = w.lessons[idx + 1];
      nextBtn = stars < 2 ? '<a class="btn big" href="#/lesson/' + R.id + '">Read the lesson again</a>' : nid && W.lesson(nid) ? '<a class="btn big" href="#/lesson/' + nid + '">Next lesson ▶</a>' : '<a class="btn big" href="#/gate/' + w.id + '">To the boss gate 🚪</a>';
    } else if (R.kind === 'gate') {
      var wd = W.world(R.id), g = S.gates[R.id] || { best: 0, passed: false, tries: 0 }; g.tries++; if (pct > g.best) g.best = pct;
      var pass = sum >= 6, newly = pass && !g.passed; if (pass) g.passed = true; S.gates[R.id] = g;
      if (sum === n) W.badge('nohint');
      if (newly) {
        bonus += 100; var pet = Art.PETS.filter(function (p) { return p.world === R.id; })[0];
        if (pet && S.owned.pets.indexOf(pet.id) < 0) { S.owned.pets.push(pet.id); extra += '<div class="hatch"><div class="hatch-pet">' + Art.pet(pet.id) + '</div><p><b>An egg hatched!</b> ' + esc(pet.name) + ' joins you. Find it in the wardrobe.</p></div>'; }
        var nw = W.WORLDS[wd.n]; if (nw) extra += '<p class="unlock">🔓 <b>' + esc(nw.name) + '</b> is now open.</p>';
        var ch = CS.story && CS.story.chapters[wd.n]; if (ch && ch.after) extra += '<p class="after">' + esc(ch.after) + '</p>';
      }
      title = pass ? (newly ? wd.name + ' cleared!' : 'Boss beaten again!') : 'The boss holds the gate.';
      if (!pass) extra += '<p>You need 6 out of 8 to clear the world. The questions you missed are in the Respawn Room.</p>';
      nextBtn = pass ? (W.WORLDS[wd.n] ? '<a class="btn big" href="#/world/' + W.WORLDS[wd.n].id + '">Enter ' + esc(W.WORLDS[wd.n].name) + ' ▶</a>' : '<a class="btn big" href="#/tests">To the final checks ▶</a>') : '<a class="btn big" href="#/world/' + R.id + '">Back to the lessons</a>';
    } else {
      title = R.fixed ? R.fixed + ' fixed!' : 'Keep going.'; extra = '<p>' + Object.keys(S.faults).length + ' question' + (Object.keys(S.faults).length === 1 ? '' : 's') + ' left in the Respawn Room.</p>';
      nextBtn = Object.keys(S.faults).length ? '<a class="btn big" href="#/respawn" id="again">Another round ▶</a>' : '<a class="btn big" href="#/">Back to the worlds</a>';
    }
    W.give(bonus, stars * 5); R.bits += bonus; W.checkBadges(); W.save();
    if (stars >= 2 || (R.kind === 'gate' && sum >= 6)) { W.confetti(); W.sfx.win(); }
    var gap = mean.length && form.length ? Math.round(100 * sc(mean) / mean.length) - Math.round(100 * sc(form) / form.length) : 0;
    W.view('<div class="results" style="--wc:' + (R.meta.color || '#3f7cff') + '"><div class="res-av">' + Art.avatar(S.avatar, { cls: 'bob', mood: stars >= 2 ? 'wow' : stars ? 'happy' : 'oops' }) + '</div><h1>' + esc(title) + '</h1>' +
      (R.kind !== 'respawn' ? W.starsHtml(stars, 3).replace('class="stars"', 'class="stars big"') : '') +
      '<p class="score">' + (sum % 1 ? sum.toFixed(1) : sum) + ' / ' + n + ' · ' + pct + '%</p>' +
      '<div class="two"><div><b>Meaning</b><span>' + sc(mean) + ' / ' + mean.length + '</span><small>reading the situation</small></div><div><b>Form</b><span>' + sc(form) + ' / ' + form.length + '</span><small>building the verbs</small></div></div>' +
      (Math.abs(gap) >= 30 ? '<p class="note">' + (gap > 0 ? 'You read conditionals well. Now practise building the verbs.' : 'Your verb forms are strong. Now slow down and read the situation first.') + '</p>' : '') +
      '<p class="earn"><i class="coin"></i> +' + R.bits + ' Bits · +' + (R.xp + stars * 5) + ' XP</p>' + extra +
      '<div class="row center">' + nextBtn + ' <a class="btn ghost" href="' + back + '">Back</a></div>' +
      '<details class="review"><summary>Review your answers</summary>' + R.items.map(function (it, i) { var r = R.res[i]; return '<div class="rv ' + (r === 1 ? 'ok' : r ? 'half' : 'no') + '"><p>' + (r === 1 ? '✅' : r ? '🟡' : '❌') + ' ' + (it.type === 'spot' ? rich(it.stem.replace(/\[\[|\]\]/g, '')) : stemHtml(it.stem)) + '</p><p class="tiny"><b>' + (it.type === 'mcq' ? rich(it.options[it.answer]) : it.type === 'type' ? esc(it.model) : 'Fix: ' + rich(it.fix)) + '</b> · ' + rich(it.why) + '</p></div>'; }).join('') + '</details></div>', '', 'resv');
    var ag = $('#again'); if (ag) ag.onclick = function (e) { e.preventDefault(); respawn(); };
  }

  W.ROUTES.play = function (p) { var L = W.lesson(p[0]); if (!L) return W.home(); var w = W.world(L.world); start('lesson', L.id, L.items, { title: L.name.replace(/<[^>]+>/g, ''), color: w.color, back: '#/world/' + w.id }); };
  W.ROUTES.gate = function (p) { var w = W.world(p[0]), g = w && CS.gates[w.id]; if (!g || !W.worldOpen(w) || !W.gateOpen(w)) return W.home(); start('gate', w.id, g.items, { title: 'Boss gate: ' + w.boss, color: w.color, back: '#/world/' + w.id }); };
  function respawn() {
    var S = W.S(), ids = Object.keys(S.faults).filter(function (id) { return W.ITEMS[id] || TESTITEMS[id]; });
    if (!ids.length) return W.view('<div class="card center"><div class="res-av">' + Art.avatar(S.avatar, { cls: 'bob' }) + '</div><h1>The Respawn Room is empty</h1><p>Every question you miss comes here for a second chance. Right now there is nothing to fix.</p><p><a class="btn" href="#/">Back to the worlds</a></p></div>', '#/');
    var items = shuffle(ids).slice(0, 8).map(function (id) { return (W.ITEMS[id] || TESTITEMS[id]).it; });
    start('respawn', 'respawn', items, { title: 'Respawn Room', color: '#e8590c', back: '#/' });
  }
  W.ROUTES.respawn = respawn;

  /* ================================================================ tests (no hints, feedback at the end) */
  var TESTS = CS.tests || {}, TESTITEMS = {};
  var TMETA = { placement: { name: 'Placement run', blurb: '18 quick questions, two per world. It opens the worlds you already know and marks the ones to study.', mins: 12 },
    u6: { name: 'Unit 6 grammar check', blurb: 'The same shape as the test at the end of Gateway B2 Unit 6: verb forms, rewriting with a given word, I wish and If only. You type the answers.', mins: 20 },
    finalB2: { name: 'Final check B2', blurb: '20 questions on worlds 1 to 7. Practice in exam style (format unofficial).', mins: 20 },
    finalC1: { name: 'Final check C1', blurb: '20 questions at C1: mixed types, inversion, wish, and the rules that bend. Practice in exam style (format unofficial).', mins: 25 } };
  function testSections(id) { var t = TESTS[id]; if (!t) return null; return id === 'placement' ? [{ title: 'Placement run', instructions: 'Choose the best answer. If you do not know, guess and move on.', items: t.items }] : t.sections; }
  Object.keys(TMETA).forEach(function (id) { (testSections(id) || []).forEach(function (s) { s.items.forEach(function (it) { TESTITEMS[it.id] = { it: it, test: id }; }); }); });
  var T = null;
  function testsPage() {
    var S = W.S();
    W.view('<h1 class="page">Tests</h1><p class="lead">No hints here. You see the answers at the end, and every miss goes to the Respawn Room.</p><div class="tests">' + Object.keys(TMETA).map(function (id) {
      var m = TMETA[id], rec = S.tests[id], ok = !!testSections(id);
      return '<div class="tcard"><h2>' + esc(m.name) + '</h2><p>' + esc(m.blurb) + '</p><p class="tiny">About ' + m.mins + ' minutes' + (rec ? ' · best ' + rec.best + ' / ' + rec.n : '') + '</p>' + (ok ? '<a class="btn" href="#/test/' + id + '">' + (rec ? 'Take it again' : 'Start') + ' ▶</a>' : '<span class="tiny">Coming soon</span>') + '</div>'; }).join('') + '</div>', '#/tests');
  }
  function testStart(id) {
    var secs = testSections(id); if (!secs) return testsPage();
    var flat = []; secs.forEach(function (s, si) { s.items.forEach(function (it) { flat.push({ it: it, sec: si }); }); });
    T = { id: id, secs: secs, flat: flat, i: 0, ans: {}, perm: {}, t0: Date.now() };
    flat.forEach(function (f) { if (f.it.type === 'mcq') T.perm[f.it.id] = shuffle([0, 1, 2, 3]); });
    W.touchDay(); testDraw();
  }
  function testDraw() {
    var f = T.flat[T.i], it = f.it, sec = T.secs[f.sec], a = T.ans[it.id], body = '';
    if (it.type === 'mcq') body = '<div class="opts">' + T.perm[it.id].map(function (oi, k) { return '<button class="opt' + (a === oi ? ' picked' : '') + '" data-o="' + oi + '"><span class="k">' + (k + 1) + '</span><span>' + rich(it.options[oi]) + '</span></button>'; }).join('') + '</div>';
    else if (it.type === 'type') body = '<div class="typed"><input id="ans" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the missing words" value="' + esc(a || '') + '"></div>';
    var stem = it.type === 'spot' ? '<p class="spot-how">Tap the part with the mistake.</p><p class="stem spot">' + spotParts(it.stem).map(function (p) { return p.seg == null ? rich(p.t) : '<button class="seg' + (a === p.seg ? ' picked' : '') + '" data-o="' + p.seg + '">' + rich(p.t) + '</button>'; }).join('') + '</p>'
      : (it.given ? '<p class="given">' + rich(it.given) + '</p>' : '') + (it.keyword ? '<p class="kw">Use this word: <b>' + esc(it.keyword) + '</b></p>' : '') + '<p class="stem">' + stemHtml(it.stem) + '</p>';
    var grid = T.flat.map(function (x, i) { return '<button class="gq' + (i === T.i ? ' cur' : '') + (T.ans[x.it.id] !== undefined && T.ans[x.it.id] !== '' ? ' done' : '') + '" data-g="' + i + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>'; }).join('');
    W.view('<div class="play test"><div class="play-top"><button class="back dark" id="quit">✕ Quit</button><b>' + esc(TMETA[T.id].name) + '</b><span class="qn">' + (T.i + 1) + ' / ' + T.flat.length + '</span></div><div class="grid">' + grid + '</div>' +
      '<div class="qcard"><p class="qmeta"><span class="tag">' + esc(sec.title) + '</span></p><p class="instr">' + esc(sec.instructions) + '</p>' + linesHtml(it) + stem + body +
      '<div class="qfoot"><button class="btn ghost" id="prev"' + (T.i ? '' : ' disabled') + '>◀ Back</button>' + (T.i < T.flat.length - 1 ? '<button class="btn big" id="tnext">Next ▶</button>' : '<button class="btn big" id="submit">Hand in ✔</button>') + '</div></div></div>', '', 'playv');
    var keep = function () { var el = $('#ans'); if (el) T.ans[it.id] = el.value; };
    $$('.opt, .seg').forEach(function (b) { b.onclick = function () { T.ans[it.id] = +b.getAttribute('data-o'); W.sfx.tap(); $$('.opt, .seg').forEach(function (x) { x.classList.toggle('picked', x === b); }); var g = $('.gq.cur'); if (g) g.classList.add('done'); }; });
    $$('.gq').forEach(function (b) { b.onclick = function () { keep(); T.i = +b.getAttribute('data-g'); testDraw(); }; });
    $('#prev').onclick = function () { keep(); T.i--; testDraw(); };
    var nx = $('#tnext'); if (nx) nx.onclick = function () { keep(); T.i++; testDraw(); };
    var sb = $('#submit'); if (sb) sb.onclick = function () { keep(); var left = T.flat.filter(function (x) { var v = T.ans[x.it.id]; return v === undefined || v === ''; }).length; if (left && !window.confirm(left + ' question' + (left === 1 ? ' has' : 's have') + ' no answer. Hand in anyway?')) return; testDone(); };
    $('#quit').onclick = function () { if (window.confirm('Quit the test? Your answers will not be saved.')) { T = null; location.hash = '#/tests'; } };
  }
  function right(it, a) { if (a === undefined || a === '') return false; return it.type === 'type' ? it.accept.map(loose).indexOf(loose(a)) >= 0 : a === it.answer; }
  function testDone() {
    var S = W.S(), n = T.flat.length, got = 0, miss = {}, bySec = T.secs.map(function () { return [0, 0]; }), byWorld = {};
    T.flat.forEach(function (f) {
      var it = f.it, ok = right(it, T.ans[it.id]); bySec[f.sec][1]++; S.stats.answered++; S.skill[it.skill][1]++;
      var wid = it.world || (it.lesson || '').slice(0, 2); byWorld[wid] = byWorld[wid] || [0, 0]; byWorld[wid][1]++;
      if (ok) { got++; bySec[f.sec][0]++; byWorld[wid][0]++; S.skill[it.skill][0]++; S.stats.right++; if (it.type === 'type') S.stats.typed++; } else { S.faults[it.id] = { d: W.today() }; if (it.lesson) miss[it.lesson] = (miss[it.lesson] || 0) + 1; }
    });
    var rec = S.tests[T.id] || { best: 0, n: n, tries: 0 }; rec.tries++; rec.n = n; rec.last = got; var bits = got * 3 + (got > rec.best ? 20 : 0); if (got > rec.best) rec.best = got; rec.date = W.today();
    var extra = '';
    if (T.id === 'placement') {
      var route = [], opened = [], stop = false;
      W.WORLDS.forEach(function (w) { var r = byWorld[w.id] || [0, 2]; if (r[0] < 2) { route.push(w.id); stop = true; } else if (!stop) { var nw = W.WORLDS[w.n]; if (nw && !S.unlocked[nw.id]) { S.unlocked[nw.id] = 1; opened.push(nw.name); } } });
      rec.route = route;
      var lvl = got <= 7 ? 'B1' : got <= 13 ? 'B2' : 'C1'; S.level = lvl;
      extra = '<div class="card"><h2>Your route</h2>' + (route.length ? '<p>Study these worlds: ' + route.map(function (id) { var w = W.world(id); return '<a class="pill" style="--wc:' + w.color + '" href="#/world/' + id + '">' + esc(w.name) + '</a>'; }).join(' ') + '</p>' : '<p>No gaps found. Go straight to the Final Arena and the final checks.</p>') +
        (opened.length ? '<p>🔓 Opened for you: <b>' + opened.map(esc).join(', ') + '</b>.</p>' : '') + '<p>Lesson explanations are now set to <b>' + lvl + '</b>. You can change this on any lesson page.</p></div>';
    } else {
      if (T.id === 'u6' && got >= 16) W.badge('u6'); if (T.id === 'finalC1' && got >= 16) W.badge('c1');
      var chips = Object.keys(miss).sort(function (a, b) { return miss[b] - miss[a]; }).slice(0, 6).map(function (lid) { var L = W.lesson(lid); return L ? '<a class="pill" style="--wc:' + W.world(L.world).color + '" href="#/lesson/' + lid + '">' + rich(L.name) + '</a>' : ''; }).join(' ');
      if (chips) extra = '<div class="card"><h2>Study these next</h2><p>' + chips + '</p></div>';
    }
    S.tests[T.id] = rec; W.give(bits, got * 4); W.checkBadges(); W.save();
    if (got / n >= .8) { W.confetti(); W.sfx.win(); }
    var review = T.flat.map(function (f) { var it = f.it, a = T.ans[it.id], ok = right(it, a);
      var yours = a === undefined || a === '' ? '(no answer)' : it.type === 'mcq' ? it.options[a] : it.type === 'type' ? a : spotParts(it.stem).filter(function (p) { return p.seg === a; })[0].t;
      var key = it.type === 'mcq' ? it.options[it.answer] : it.type === 'type' ? it.model : spotParts(it.stem).filter(function (p) { return p.seg === it.answer; })[0].t + ' → ' + it.fix;
      return '<div class="rv ' + (ok ? 'ok' : 'no') + '">' + (it.given ? '<p class="tiny">' + rich(it.given) + '</p>' : '') + '<p>' + (ok ? '✅' : '❌') + ' ' + (it.type === 'spot' ? rich(it.stem.replace(/\[\[|\]\]/g, '')) : stemHtml(it.stem)) + '</p>' + (ok ? '' : '<p class="tiny">You: <em>' + rich(String(yours)) + '</em></p>') + '<p class="tiny"><b>' + rich(key) + '</b> · ' + rich(it.why) + '</p></div>'; }).join('');
    W.view('<div class="results"><div class="res-av">' + Art.avatar(S.avatar, { cls: 'bob', mood: got / n >= .8 ? 'wow' : 'happy' }) + '</div><h1>' + esc(TMETA[T.id].name) + '</h1><p class="score">' + got + ' / ' + n + '</p>' +
      (T.secs.length > 1 ? '<div class="two">' + T.secs.map(function (s, i) { return '<div><b>' + esc(s.title) + '</b><span>' + bySec[i][0] + ' / ' + bySec[i][1] + '</span></div>'; }).join('') + '</div>' : '') +
      '<p class="earn"><i class="coin"></i> +' + bits + ' Bits · +' + got * 4 + ' XP</p>' + extra + '<div class="row center"><a class="btn big" href="#/">Back to the worlds</a> <a class="btn ghost" href="#/respawn">Respawn Room</a></div>' +
      '<details class="review" open><summary>Answers</summary>' + review + '</details></div>', '#/tests', 'resv');
    T = null;
  }
  W.ROUTES.tests = testsPage;
  W.ROUTES.test = function (p) { testStart(p[0]); };
  /* keyboard: 1–4 choose, Enter = next */
  document.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (/^[1-4]$/.test(e.key)) { var o = $$('.opts .opt')[+e.key - 1]; if (o && !o.disabled) o.click(); }
    if (e.key === 'Enter') { var n = $('#next'); if (n && !n.hidden) { e.preventDefault(); n.click(); } }
  });
  W.norm = norm; W.shuffle = shuffle; W.TESTITEMS = TESTITEMS;
})();
