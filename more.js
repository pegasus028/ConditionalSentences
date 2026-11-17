/* What-If Worlds — more.js: storybook, Guidebook, arcade (speed sorters + the What-If Machine), wardrobe, profile. */
(function () {
  'use strict';
  var W = window.WIW, $ = W.$, $$ = W.$$, esc = W.esc, rich = W.rich, CS = W.CS, Art = window.Art, Parts = window.Parts;
  var TAGN = { '0': 'Type 0 · zero', '1': 'Type 1 · first', '2': 'Type 2 · second', '3': 'Type 3 · third', m32: 'Mixed 3/2', m23: 'Mixed 2/3', wish: 'Wish / if only', conn: 'Connector', formal: 'Formal form' };

  /* ================================================================ story */
  var auto = false;
  function storyHome() {
    var st = CS.story; if (!st) return W.view('<h1 class="page">Story</h1><p class="lead">The story is on its way.</p>', '#/story');
    var S = W.S();
    W.view('<h1 class="page">' + esc(st.title) + '</h1><p class="lead">Each chapter opens one world. Tap the glowing sentences to see which conditional they are.</p><div class="chapters">' + st.chapters.map(function (c, i) {
      var w = i ? W.WORLDS[i - 1] : null, open = !w || W.worldOpen(w), seen = c.pages.filter(function (p, k) { return S.story['ch' + i + '-' + k]; }).length;
      return '<a class="chap' + (open ? '' : ' locked') + '" href="' + (open ? '#/story/ch' + i : '#/locked/' + w.id) + '" style="--wc:' + (w ? w.color : '#5b6cff') + '"><div class="chap-art">' + Art.scene(c.pages[0].scene) + '</div><div><small>' + (i ? 'Chapter ' + i + ' · ' + esc(w.name) : 'Prologue') + '</small><b>' + esc(c.title) + '</b><span class="tiny">' + (open ? seen + ' / ' + c.pages.length + ' pages read' : '🔒 Opens with the world') + '</span></div></a>'; }).join('') + '</div>', '#/story');
  }
  function storyPage(ci, pi) {
    var st = CS.story, c = st && st.chapters[ci]; if (!c) return storyHome();
    var w = ci ? W.WORLDS[ci - 1] : null; if (w && !W.worldOpen(w)) { location.hash = '#/locked/' + w.id; return; }
    pi = Math.max(0, Math.min(c.pages.length - 1, pi || 0));
    var p = c.pages[pi], S = W.S(), key = 'ch' + ci + '-' + pi, owner = 'story:' + key;
    if (!S.story[key]) { S.story[key] = 1; W.give(3, 2); W.checkBadges(); W.save(); }
    var paras = String(p.text).split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean);
    var html = paras.map(function (t) {
      return '<p data-part>' + esc(t).replace(/\[\[([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]/g, function (m, tag, s, note) { return '<span role="button" tabindex="0" class="glow t-' + tag + '" data-tag="' + tag + '" data-note="' + note + '">' + s + '</span>'; }) + '</p>'; }).join('');
    var last = pi === c.pages.length - 1, nextCh = st.chapters[ci + 1];
    W.view('<div class="book" style="--wc:' + (w ? w.color : '#5b6cff') + '"><a class="back dark" href="#/story">← Chapters</a><p class="kicker">' + (ci ? 'Chapter ' + ci + ' · ' + esc(w.name) : 'Prologue') + ' · page ' + (pi + 1) + ' of ' + c.pages.length + '</p><h1>' + esc(c.title) + '</h1>' +
      '<div class="page-art">' + Art.scene(p.scene) + '<div class="page-av">' + Art.avatar({ skin: 1, hair: 'pony', hairc: 0, top: 7, bottom: 5, acc: 'none', pet: 'iffy' }, { cls: 'bob' }) + '</div></div>' +
      '<div class="lsay-bar"><button class="lsay" data-rd="' + owner + '" id="s-say"><span class="lsay-ico" aria-hidden="true">▶</span><span class="lsay-lbl">Listen</span></button><label class="autoturn"><input type="checkbox" id="s-auto"' + (auto ? ' checked' : '') + '> Turn the pages for me</label></div>' +
      '<div class="story theory">' + html + '</div><p class="gram">Grammar on this page: ' + esc(p.grammar) + '</p>' +
      '<div class="turn">' + (pi ? '<a class="btn ghost" href="#/story/ch' + ci + '/' + pi + '">◀ Back</a>' : '<span></span>') +
        (!last ? '<a class="btn big" href="#/story/ch' + ci + '/' + (pi + 2) + '">Next page ▶</a>' : w ? '<a class="btn big" href="#/world/' + w.id + '">Enter ' + esc(w.name) + ' ▶</a>' : '<a class="btn big" href="#/story/ch1">Chapter 1 ▶</a>') + '</div>' +
      (last && c.mission ? '<p class="mission">🎯 ' + esc(c.mission) + '</p>' : '') + '</div>', '#/story', 'bookv');
    $$('.glow').forEach(function (b) { b.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } }; b.onclick = function () { W.sfx.tap(); b.classList.add('seen'); W.toast('<b>' + TAGN[b.getAttribute('data-tag')] + '</b><br>' + esc(b.getAttribute('data-note'))); }; });
    var read = function () { var els = $$('.story [data-part]'), texts = Parts.storyParts(p); window.Reader.read(texts.map(function (t, i) { return { text: t, el: els[i] }; }), { owner: owner, label: (ci ? 'Chapter ' + ci : 'Prologue') + ' · page ' + (pi + 1), onEnd: null }); watchEnd(owner, ci, pi, last); };
    $('#s-say').onclick = function () { window.Reader.toggle(owner, read); };
    $('#s-auto').onchange = function () { auto = this.checked; };
    if (auto && storyPage.cont) { storyPage.cont = false; setTimeout(read, 250); }
  }
  /* auto-turn: when the reader finishes this page by itself, go to the next one and read on */
  function watchEnd(owner, ci, pi, last) {
    var seenPlaying = false, t = setInterval(function () {
      var st = window.Reader.state();
      if (st.owner === owner) { seenPlaying = true; if (st.state !== 'idle' && st.i === st.parts.length - 1) watchEnd.lastPart = owner; return; }
      clearInterval(t);
      if (auto && seenPlaying && watchEnd.lastPart === owner && !last && /^#\/story\/ch/.test(location.hash)) { watchEnd.lastPart = ''; storyPage.cont = true; location.hash = '#/story/ch' + ci + '/' + (pi + 2); }
    }, 400);
  }
  W.ROUTES.story = function (p) { if (!p[0]) return storyHome(); var ci = +String(p[0]).replace('ch', ''); storyPage(ci, (+p[1] || 1) - 1); };

  /* ================================================================ Guidebook */
  function guide(p) {
    var G = window.GUIDE, S = W.S(), cur = G.sections.filter(function (s) { return s.id === p[0]; })[0] || G.sections[0];
    S.stats.guide[cur.id] = 1; W.checkBadges(); W.save();
    var owner = 'guide:' + cur.id, n = 0, part = function () { return ' data-part'; };
    var h = '<h1 class="page">' + esc(G.title) + '</h1><p class="lead">' + esc(G.sub) + '</p><div class="gtabs" role="tablist">' + G.sections.map(function (s) { return '<a role="tab" href="#/guide/' + s.id + '"' + (s === cur ? ' class="on" aria-selected="true"' : '') + '><span aria-hidden="true">' + s.icon + '</span> ' + esc(s.title) + '</a>'; }).join('') + '</div>' +
      '<section class="guide theory"><h2' + part() + '>' + esc(cur.title) + '</h2><div class="lsay-bar"><button class="lsay" data-rd="' + owner + '" id="g-say"><span class="lsay-ico" aria-hidden="true">▶</span><span class="lsay-lbl">Listen</span></button></div>' +
      (cur.intro || []).map(function (t) { return '<p' + part() + '>' + rich(t) + '</p>'; }).join('');
    if (cur.id === 'dials') h += '<div class="dials"><div class="dial"><b>When?</b><span>past</span><span class="on">now / always</span><span>future</span></div><div class="dial"><b>Real or imagined?</b><span class="on">real</span><span>imagined</span></div></div>' +
      '<table class="grid6"><tr><th></th><th>Now or always</th><th>Future</th><th>Past</th></tr><tr><th>Real</th><td class="c-real">Type 0<br><small>If you heat ice, it melts.</small></td><td class="c-real">Type 1<br><small>If it rains, we’ll stay in.</small></td><td class="c-real">Real past<br><small>If it rained, we stayed in.</small></td></tr><tr><th>Imagined</th><td class="c-now" colspan="2">Type 2<br><small>If I had wings, I would fly.</small></td><td class="c-past">Type 3<br><small>If I had known, I would have come.</small></td></tr></table><p class="tiny">Mixed types take the if half from one imagined box and the result half from the other.</p>';
    (cur.cards || []).forEach(function (c) {
      h += '<article class="gcard' + (c.tag ? ' t-' + c.tag : '') + '"><h3' + part() + ' class="gname">' + rich(c.name) + '</h3><div class="formula sm"><span class="fb f-if">' + rich(c.form[0]) + '</span><span class="fplus">,</span><span class="fb f-res">' + rich(c.form[1]) + '</span></div><p class="gmean">' + rich(c.meaning) + '</p><div class="uses">' +
        c.uses.map(function (u) { return '<div class="use"' + part() + '>' + (u[0] ? '<b>' + esc(u[0]) + '</b>' : '') + '<span>' + rich(u[1]) + '</span></div>'; }).join('') + '</div>' + (c.truth ? '<p class="truthline"' + part() + '><b>Truth check:</b> ' + rich(c.truth) + '</p>' : '') + '</article>';
    });
    if (cur.stairs) h += '<div class="stairs">' + cur.stairs.map(function (r, i) { return '<div class="srow' + (i ? '' : ' head') + '"><span class="s0">' + rich(r[0]) + '</span><span class="s1">' + rich(r[1]) + '</span><span class="s2">' + rich(r[2]) + '</span></div>'; }).join('') + '</div>';
    if (cur.trio) h += '<div class="trio">' + cur.trio.map(function (r, i) { return '<div class="tri s' + i + '"' + part() + '><b>' + esc(r[0]) + '</b><p class="s">' + rich(r[1]) + '</p><p class="g">' + rich(r[2]) + '</p></div>'; }).join('') + '</div>';
    if (cur.family) h += '<p class="family"' + part() + '>' + rich(cur.family) + '</p>';
    if (cur.list) h += '<div class="glist">' + cur.list.map(function (r) { return '<div class="gl"' + part() + '><p class="bad">' + rich(r[0]) + '</p><p class="good">' + rich(r[1]) + '</p><p class="g">' + rich(r[2]) + '</p></div>'; }).join('') + '</div>';
    h += '</section>';
    W.view(h, '#/guide', 'guidev');
    /* the card name + meaning are one spoken part: the name element carries the highlight */
    $('#g-say').onclick = function () { window.Reader.toggle(owner, function () { var els = $$('.guide [data-part]'), texts = Parts.guideParts(cur); window.Reader.read(texts.map(function (t, i) { return { text: t, el: els[i] }; }), { owner: owner, label: 'Guidebook · ' + cur.title }); }); };
  }
  W.ROUTES.guide = guide;

  /* ================================================================ arcade */
  var G = CS.games || { sorters: [], machine: [] };
  function gameOpen(g) { var S = W.S(), w = W.world(g.unlock); return S.unlockAll || (w && (W.worldCleared(w) || (W.WORLDS[w.n] && S.unlocked[W.WORLDS[w.n].id]))); }
  function arcade() {
    var S = W.S();
    var cards = G.sorters.map(function (g) { var open = gameOpen(g), rec = S.games[g.id]; return '<a class="acard' + (open ? '' : ' locked') + '" href="' + (open ? '#/arcade/' + g.id : '#/arcade') + '"><span class="aico" aria-hidden="true">' + ({ zerofirst: '🏭', real: '🎭', glitch: '👾', types: '🧱', conn: '🌉' }[g.id] || '🕹️') + '</span><b>' + esc(g.name) + '</b><small>' + esc(g.blurb) + '</small><span class="tiny">' + (open ? (rec ? 'Best: ' + rec.best : '60 seconds') : '🔒 Clear ' + esc(W.world(g.unlock).name)) + '</span></a>'; }).join('');
    W.view('<h1 class="page">Arcade</h1><p class="lead">Fast games against the clock. A new game opens each time you clear a world.</p><div class="acards">' +
      (G.machine.length ? '<a class="acard wide" href="#/machine"><span class="aico" aria-hidden="true">⚙️</span><b>The What-If Machine</b><small>Take one event and turn the dial: watch the same story become type 1, 2, 3, mixed and a wish.</small><span class="tiny">No clock. Just explore.</span></a>' : '') + cards + '</div>', '#/arcade');
  }
  var A = null;
  function sorter(id) {
    var g = G.sorters.filter(function (x) { return x.id === id; })[0]; if (!g || !gameOpen(g)) return arcade();
    A = { g: g, items: W.shuffle(g.items), i: 0, score: 0, lives: 3, combo: 0, t: 60, miss: [], timer: null, over: false };
    W.view('<div class="arcadeg"><div class="play-top"><a class="back dark" href="#/arcade">✕ Quit</a><b>' + esc(g.name) + '</b><span class="qn" id="a-time">60</span></div>' +
      '<div class="ahud"><span>Score <b id="a-score">0</b></span><span id="a-lives">❤️❤️❤️</span><span>Combo <b id="a-combo">0</b></span></div><div class="abar"><i id="a-bar"></i></div>' +
      '<div class="acardq" id="a-q"></div><div class="acats c' + g.cats.length + '">' + g.cats.map(function (c) { return '<button class="acat" data-c="' + esc(c.id) + '">' + esc(c.label) + '</button>'; }).join('') + '</div><p class="anote" id="a-note" aria-live="polite"></p></div>', '#/arcade', 'playv');
    $$('.acat').forEach(function (b) { b.onclick = function () { sortAnswer(b); }; });
    sortDraw();
    A.timer = setInterval(function () { if (!$('#a-time')) { clearInterval(A.timer); return; } A.t--; $('#a-time').textContent = A.t; $('#a-bar').style.width = (100 * A.t / 60) + '%'; if (A.t <= 0) sortOver(); }, 1000);
  }
  function sortDraw() { if (A.i >= A.items.length) { A.items = W.shuffle(A.g.items); A.i = 0; } $('#a-q').innerHTML = '<p>' + rich(A.items[A.i].t).replace(/_{3,}/g, '<span class="gap"></span>') + '</p>'; $('#a-q').classList.remove('pop'); void $('#a-q').offsetWidth; $('#a-q').classList.add('pop'); }
  function sortAnswer(b) {
    if (A.over) return; var it = A.items[A.i], ok = b.getAttribute('data-c') === it.c;
    if (ok) { A.combo++; A.score += 1 + (A.combo >= 5 ? 1 : 0); W.sfx.coin(); $('#a-note').innerHTML = '<span class="good">✅ ' + rich(it.note) + '</span>'; }
    else { A.combo = 0; A.lives--; A.miss.push(it); W.sfx.oops(); var lab = A.g.cats.filter(function (c) { return c.id === it.c; })[0].label; $('#a-note').innerHTML = '<span class="bad">❌ ' + esc(lab) + '. ' + rich(it.note) + '</span>'; b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 400); }
    $('#a-score').textContent = A.score; $('#a-combo').textContent = A.combo; $('#a-lives').textContent = '❤️'.repeat(Math.max(0, A.lives)) + '🖤'.repeat(3 - Math.max(0, A.lives));
    if (A.lives <= 0) return sortOver(); A.i++; sortDraw();
  }
  function sortOver() {
    if (A.over) return; A.over = true; clearInterval(A.timer);
    var S = W.S(), rec = S.games[A.g.id] || { best: 0, plays: 0 }, isBest = A.score > rec.best; rec.plays++; if (isBest) rec.best = A.score; S.games[A.g.id] = rec;
    var bits = A.score * 2 + (isBest && A.score ? 10 : 0); W.give(bits, A.score * 2); if (A.score >= 15) W.badge('arcade'); W.touchDay(); W.checkBadges(); W.save();
    if (isBest && A.score >= 8) { W.confetti(); W.sfx.win(); }
    W.view('<div class="results"><div class="res-av">' + Art.avatar(S.avatar, { cls: 'bob', mood: A.score >= 10 ? 'wow' : 'happy' }) + '</div><h1>' + (A.lives <= 0 ? 'Out of lives!' : 'Time!') + '</h1><p class="score">' + A.score + ' points' + (isBest && A.score ? ' · new best!' : ' · best ' + rec.best) + '</p><p class="earn"><i class="coin"></i> +' + bits + ' Bits</p>' +
      '<div class="row center"><a class="btn big" href="#/arcade/' + A.g.id + '" id="a-again">Play again ▶</a> <a class="btn ghost" href="#/arcade">Arcade</a></div>' +
      (A.miss.length ? '<details class="review" open><summary>The ones that got you</summary>' + A.miss.map(function (it) { var lab = A.g.cats.filter(function (c) { return c.id === it.c; })[0].label; return '<div class="rv no"><p>' + rich(it.t) + '</p><p class="tiny"><b>' + esc(lab) + '</b> · ' + rich(it.note) + '</p></div>'; }).join('') + '</details>' : '') + '</div>', '#/arcade', 'resv');
    var gid = A.g.id; $('#a-again').onclick = function (e) { e.preventDefault(); sorter(gid); };
  }
  var MF = [['1', 'Type 1', 'Still possible'], ['2', 'Type 2', 'Imagined now'], ['3', 'Type 3', 'Imagined past'], ['m32', 'Mixed 3/2', 'Past → now'], ['m23', 'Mixed 2/3', 'Now → past'], ['wish', 'Wish', 'Only the imagined half']];
  function machine(p) {
    if (!G.machine.length) return arcade();
    var ei = Math.max(0, G.machine.map(function (e) { return e.id; }).indexOf(p[0])), ev = G.machine[ei], cur = p[1] && ev.forms[p[1]] ? p[1] : '1', f = ev.forms[cur];
    var steps = { '1': 0, '2': 1, '3': 2, m32: 2, m23: 2, wish: 1 }[cur];
    W.view('<div class="machine"><a class="back dark" href="#/arcade">← Arcade</a><h1 class="page">The What-If Machine</h1><p class="lead">One event, six ways to talk about it. Turn the dial and watch the verbs step back from reality.</p>' +
      '<div class="mev">' + G.machine.map(function (e, i) { return '<a class="pill' + (i === ei ? ' on' : '') + '" href="#/machine/' + e.id + '/' + cur + '">' + esc(e.event) + '</a>'; }).join('') + '</div>' +
      '<div class="mbox"><p class="mbase"><b>What really happened:</b> ' + rich(ev.base || '') + '</p><div class="mdial" role="tablist">' + MF.map(function (m) { return '<a role="tab" class="mbtn t-' + m[0] + (m[0] === cur ? ' on' : '') + '" href="#/machine/' + ev.id + '/' + m[0] + '"><b>' + m[1] + '</b><small>' + m[2] + '</small></a>'; }).join('') + '</div>' +
      '<div class="mout t-' + cur + '"><p class="ms">' + rich(f.s) + '</p><p class="mt"><b>Truth:</b> ' + rich(f.truth) + '</p><div class="msteps" aria-label="Steps back from reality"><span class="' + (steps === 0 ? 'on' : '') + '">Real</span><span class="' + (steps === 1 ? 'on' : '') + '">One step back</span><span class="' + (steps === 2 ? 'on' : '') + '">Two steps back</span></div></div></div></div>', '#/arcade');
    var S = W.S(), k = 'mach-' + ev.id + '-' + cur; if (!S.story[k]) { S.story[k] = 1; W.give(1, 1); W.save(); }
  }
  W.ROUTES.arcade = function (p) { if (p[0]) return sorter(p[0]); arcade(); };
  W.ROUTES.machine = machine;

  /* ================================================================ wardrobe (avatar + shop) */
  function wardrobe() {
    var S = W.S(), a = S.avatar;
    var sw = function (kind, list, cur) { return '<div class="swatches">' + list.map(function (c, i) { return '<button class="sw' + (cur === i ? ' on' : '') + '" data-set="' + kind + '" data-v="' + i + '" style="background:' + c + '" aria-label="' + kind + ' colour ' + (i + 1) + '"></button>'; }).join('') + '</div>'; };
    W.view('<h1 class="page">Wardrobe</h1><div class="ward"><div class="ward-av"><div class="plinth">' + Art.avatar(a, { cls: 'bob' }) + '</div><p class="earn"><i class="coin"></i> ' + S.bits + ' Bits</p><p class="tiny">Right answers earn Bits. Clearing a world hatches a pet.</p></div><div class="ward-opts">' +
      '<h2 class="sub">Skin</h2>' + sw('skin', Art.SKINS, a.skin) + '<h2 class="sub">Hair</h2><div class="chips">' + Art.HAIRS.map(function (h) { return '<button class="chipb' + (a.hair === h.id ? ' on' : '') + '" data-set="hair" data-v="' + h.id + '">' + esc(h.name) + '</button>'; }).join('') + '</div>' + sw('hairc', Art.HAIRC, a.hairc) +
      '<h2 class="sub">Top</h2>' + sw('top', Art.COLORS, a.top) + '<h2 class="sub">Bottoms</h2>' + sw('bottom', Art.COLORS, a.bottom) +
      '<h2 class="sub">Accessories</h2><div class="shop">' + Art.ACCS.map(function (x) { var own = S.owned.acc.indexOf(x.id) >= 0; return '<button class="item' + (a.acc === x.id ? ' on' : '') + (own ? '' : ' buy') + '" data-acc="' + x.id + '"><span class="item-av">' + Art.avatar({ skin: a.skin, hair: a.hair, hairc: a.hairc, top: a.top, bottom: a.bottom, acc: x.id }, { nopet: true }) + '</span><b>' + esc(x.name) + '</b><small>' + (own ? (a.acc === x.id ? 'Wearing' : 'Owned') : '<i class="coin"></i> ' + x.cost) + '</small></button>'; }).join('') + '</div>' +
      '<h2 class="sub">Pets</h2><div class="shop">' + Art.PETS.map(function (p) { var own = p.id === 'none' || S.owned.pets.indexOf(p.id) >= 0, w = p.world && W.world(p.world); return '<button class="item' + (a.pet === p.id ? ' on' : '') + (own ? '' : ' locked') + '" data-pet="' + p.id + '"' + (own ? '' : ' disabled') + '><span class="item-av">' + (p.id === 'none' ? '<span class="nopet">—</span>' : own ? Art.pet(p.id) : Art.egg(p.c)) + '</span><b>' + (own ? esc(p.name) : 'Egg') + '</b><small>' + (own ? (a.pet === p.id ? 'With you' : 'Hatched') : 'Clear ' + esc(w.name)) + '</small></button>'; }).join('') + '</div></div></div>', '#/me', 'wardv');
    $$('[data-set]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-set'), v = b.getAttribute('data-v'); a[k] = k === 'hair' ? v : +v; W.sfx.tap(); W.save(); keepScroll(wardrobe); }; });
    $$('[data-acc]').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-acc'), x = Art.ACCS.filter(function (y) { return y.id === id; })[0];
      if (S.owned.acc.indexOf(id) < 0) { if (S.bits < x.cost) { W.sfx.oops(); return W.toast('You need <b>' + (x.cost - S.bits) + '</b> more Bits for the ' + esc(x.name.toLowerCase()) + '.'); } S.bits -= x.cost; S.owned.acc.push(id); W.badge('style'); W.sfx.coin(); W.toast('🎀 You bought the <b>' + esc(x.name.toLowerCase()) + '</b>!'); }
      a.acc = id; W.save(); keepScroll(wardrobe); }; });
    $$('[data-pet]').forEach(function (b) { b.onclick = function () { a.pet = b.getAttribute('data-pet'); W.sfx.tap(); W.save(); keepScroll(wardrobe); }; });
  }
  function keepScroll(fn) { var y = window.scrollY; fn(); window.scrollTo(0, y); }
  W.ROUTES.wardrobe = wardrobe;

  /* ================================================================ profile */
  function pctOf(a) { return a[1] ? Math.round(100 * a[0] / a[1]) : null; }
  function report() {
    var S = W.S(), L = [];
    L.push('What-If Worlds report: ' + (S.name || 'student') + ', ' + W.today());
    L.push('Rank: ' + W.rank() + ' (level ' + W.xpLevel(S.xp).n + '), worlds cleared ' + W.clearedCount() + '/9, days played ' + S.days.length);
    L.push('Meaning ' + (pctOf(S.skill.meaning) == null ? '-' : pctOf(S.skill.meaning) + '%') + ' | Form ' + (pctOf(S.skill.form) == null ? '-' : pctOf(S.skill.form) + '%') + ' | questions answered ' + S.stats.answered);
    W.WORLDS.forEach(function (w) { var ls = w.lessons.map(function (id) { var r = S.lessons[id]; return r ? r.best + '%' : '-'; }).join(' '), g = S.gates[w.id]; L.push('W' + w.n + ' ' + w.name + ': lessons ' + ls + ' | boss ' + (g ? g.best + '%' + (g.passed ? ' cleared' : '') : '-')); });
    Object.keys(S.tests).forEach(function (k) { var t = S.tests[k]; L.push('Test ' + k + ': best ' + t.best + '/' + t.n + (t.date ? ' (' + t.date + ')' : '')); });
    L.push('Respawn Room: ' + Object.keys(S.faults).length + ' to fix. Explanations read at ' + S.level + '. Listens: ' + S.stats.listens + '.');
    return L.join('\n');
  }
  function me() {
    var S = W.S(), lv = W.xpLevel(S.xp), m = pctOf(S.skill.meaning), f = pctOf(S.skill.form);
    var types = ['0', '1', '2', '3', 'm32', 'm23', 'conn', 'wish', 'formal'].map(function (t) { var p = S.ctype[t] ? pctOf(S.ctype[t]) : null; return '<div class="tbar"><span>' + W.TYPE_NAMES[t] + '</span><i><em style="width:' + (p || 0) + '%"></em></i><b>' + (p == null ? '–' : p + '%') + '</b></div>'; }).join('');
    W.view('<div class="me"><div class="me-top"><a href="#/wardrobe" class="hero-av" aria-label="Open the wardrobe">' + Art.avatar(S.avatar, { cls: 'bob' }) + '</a><div><h1>' + esc(S.name || 'Player') + '</h1><p class="rank">' + esc(W.rank()) + ' · Level ' + lv.n + '</p><div class="xpbar"><i style="width:' + lv.pct + '%"></i></div><p class="tiny">' + S.xp + ' XP · <i class="coin"></i> ' + S.bits + ' Bits · ' + S.days.length + ' days played</p><p><a class="btn" href="#/wardrobe">🎀 Wardrobe</a></p></div></div>' +
      '<h2 class="sec">Two scores</h2><div class="two"><div><b>Meaning</b><span>' + (m == null ? '–' : m + '%') + '</span><small>reading the situation: real or imagined, and when</small></div><div><b>Form</b><span>' + (f == null ? '–' : f + '%') + '</span><small>building the verbs correctly</small></div></div>' +
      '<h2 class="sec">By type</h2><div class="tbars">' + types + '</div>' +
      '<h2 class="sec">Badges</h2><div class="badges">' + W.BADGES.map(function (b) { var on = S.badges[b[0]]; return '<div class="bdg' + (on ? ' on' : '') + '" title="' + esc(b[3]) + '"><span aria-hidden="true">' + (on ? b[1] : '❔') + '</span><b>' + esc(on ? b[2] : '???') + '</b><small>' + esc(on ? b[3] : 'A surprise') + '</small></div>'; }).join('') + '</div>' +
      '<h2 class="sec">For your teacher</h2><div class="card"><p>Copy your progress and paste it into LINE.</p><button class="btn" id="copy">📋 Copy my report</button></div>' +
      '<h2 class="sec">Settings</h2><div class="card settings"><label>Nickname <input id="set-name" maxlength="16" value="' + esc(S.name) + '"></label>' +
      '<label>Explanations <select id="set-lvl"><option>B1</option><option>B2</option><option>C1</option></select></label>' +
      '<label>Look <select id="set-theme"><option value="">Match my device</option><option value="light">Day</option><option value="dark">Night</option></select></label>' +
      '<label class="chk"><input type="checkbox" id="set-sfx"' + (S.sfx ? ' checked' : '') + '> Sound effects</label>' +
      '<label class="chk"><input type="checkbox" id="set-all"' + (S.unlockAll ? ' checked' : '') + '> Open every world (for teachers and revision)</label>' +
      '<button class="btn ghost danger" id="reset">↺ Start again from zero</button></div></div>', '#/me');
    $('#set-lvl').value = S.level; $('#set-theme').value = S.theme || '';
    $('#set-name').onchange = function () { S.name = this.value.trim().slice(0, 16); W.save(); };
    $('#set-lvl').onchange = function () { S.level = this.value; W.save(); };
    $('#set-theme').onchange = function () { S.theme = this.value; W.save(); W.setTheme(); };
    $('#set-sfx').onchange = function () { S.sfx = this.checked; W.save(); };
    $('#set-all').onchange = function () { S.unlockAll = this.checked; W.save(); };
    $('#copy').onclick = function () { var t = report(), done = function () { W.toast('📋 Copied. Paste it into LINE for T.Chris.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { fallbackCopy(t); done(); }); else { fallbackCopy(t); done(); } };
    $('#reset').onclick = function () { if (window.confirm('Delete all progress, Bits and pets on this device and start again?')) { W.reset(); W.setTheme(); location.hash = '#/'; W.route(); } };
  }
  function fallbackCopy(t) { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
  W.ROUTES.me = me; W.report = report;
})();
