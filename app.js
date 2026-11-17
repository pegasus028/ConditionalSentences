/* What-If Worlds — app.js (core): state, helpers, router, lobby, worlds, lessons.
   Holds NO content: lessons and questions are in data/content.js, world names and the Guidebook in data/worlds.js.
   The quiz runner and tests are in play.js; story, guide, arcade, wardrobe and profile in more.js. */
(function () {
  'use strict';
  var KEY = 'whatif.v1';
  var CS = window.CS || { lessons: {}, gates: {}, tests: {}, story: null, games: { sorters: [], machine: [] } };
  var WORLDS = window.WORLDS, Art = window.Art;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  /* content text may carry <b> <em> <s> only */
  var rich = function (s) { return esc(s).replace(/&lt;(\/?)(b|em|s)&gt;/g, '<$1$2>'); };
  var today = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };

  /* ------------------------------------------------------------ state */
  function fresh() {
    return { v: 1, name: '', avatar: { skin: 1, hair: 'long', hairc: 0, top: 5, bottom: 9, acc: 'none', pet: 'iffy' }, owned: { acc: ['none'], pets: ['iffy'], colors: [] },
      bits: 0, xp: 0, lessons: {}, gates: {}, unlocked: { w1: 1 }, story: {}, faults: {}, tests: {}, games: {}, days: [], chest: '', level: 'B1', sfx: true, theme: '',
      badges: {}, stats: { first: 0, right: 0, answered: 0, bestCombo: 0, listens: 0, guide: {}, hints: 0, typed: 0 }, skill: { meaning: [0, 0], form: [0, 0] }, ctype: {}, unlockAll: false, seenIntro: false };
  }
  var S = fresh();
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.v === 1) { var f = fresh(); Object.keys(f).forEach(function (k) { if (raw[k] === undefined) raw[k] = f[k]; }); Object.keys(f.stats).forEach(function (k) { if (raw.stats[k] === undefined) raw.stats[k] = f.stats[k]; }); S = raw; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} paintHud(); }

  /* ------------------------------------------------------------ lookups */
  var LESSON_IDS = []; WORLDS.forEach(function (w) { w.lessons.forEach(function (id) { LESSON_IDS.push(id); }); });
  var ITEMS = {};
  Object.keys(CS.lessons).forEach(function (id) { CS.lessons[id].items.forEach(function (it) { ITEMS[it.id] = { it: it, lesson: id }; }); });
  Object.keys(CS.gates).forEach(function (w) { (CS.gates[w].items || []).forEach(function (it) { ITEMS[it.id] = { it: it, world: w }; }); });
  var world = function (id) { return WORLDS.filter(function (w) { return w.id === id; })[0]; };
  var lesson = function (id) { return CS.lessons[id]; };
  function worldOpen(w) { if (S.unlockAll || w.n === 1 || S.unlocked[w.id]) return true; var prev = WORLDS[w.n - 2]; return !!(S.gates[prev.id] && S.gates[prev.id].passed); }
  function worldCleared(w) { return !!(S.gates[w.id] && S.gates[w.id].passed); }
  function lessonStars(id) { return (S.lessons[id] || {}).stars || 0; }
  function worldStars(w) { return w.lessons.reduce(function (a, id) { return a + lessonStars(id); }, 0); }
  function gateOpen(w) { return S.unlockAll || w.lessons.every(function (id) { return S.lessons[id]; }); }
  var clearedCount = function () { return WORLDS.filter(worldCleared).length; };
  var RANKS = ['Rookie', 'Explorer', 'Promise Keeper', 'Dream Builder', 'Time Climber', 'Glitch Fixer', 'Bridge Master', 'Wish Keeper', 'Citadel Scholar', 'World Legend'];
  var rank = function () { return RANKS[clearedCount()]; };
  /* XP level: level n needs 60·n·(n+1)/2 XP in total */
  function xpLevel(xp) { var n = 1; while (xp >= 60 * n * (n + 1) / 2) n++; var lo = 60 * (n - 1) * n / 2, hi = 60 * n * (n + 1) / 2; return { n: n, pct: Math.round(100 * (xp - lo) / (hi - lo)), left: hi - xp }; }

  /* ------------------------------------------------------------ sound (tiny synth, no files) */
  var AC = null;
  function tone(f, t, d, type, v) { try { if (!S.sfx) return; AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(v || .06, AC.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + t + d); o.connect(g); g.connect(AC.destination); o.start(AC.currentTime + t); o.stop(AC.currentTime + t + d + .02); } catch (e) {} }
  var sfx = { hop: function () { tone(440, 0, .08); tone(660, .07, .1); }, coin: function () { tone(988, 0, .07, 'square', .05); tone(1319, .07, .14, 'square', .05); }, oops: function () { tone(196, 0, .16, 'sawtooth', .05); tone(147, .12, .2, 'sawtooth', .05); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .1, .16, 'square', .05); }); }, tap: function () { tone(520, 0, .04, 'square', .03); } };

  /* ------------------------------------------------------------ rewards, toasts, badges */
  var toastT = null;
  function toast(html) { var t = $('#toast'); t.innerHTML = html; t.hidden = false; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600); }
  function give(bits, xp) { if (bits) S.bits += bits; if (xp) { var a = xpLevel(S.xp).n; S.xp += xp; var b = xpLevel(S.xp).n; if (b > a) { S.bits += 25; setTimeout(function () { toast('⬆️ <b>Level ' + b + '!</b> +25 Bits'); sfx.win(); }, 700); } } }
  var BADGES = [
    ['first', '🧱', 'First block', 'Finish your first obby.'], ['story', '📖', 'Bookworm', 'Read every page of the story.'], ['guide', '🧭', 'Guide reader', 'Open every section of the Guidebook.'],
    ['three', '⭐', 'Three stars', 'Get three stars on a lesson.'], ['clean', '✨', 'No falls', 'Finish an obby with every answer right first time.'], ['combo', '🔥', 'Ten in a row', 'Answer ten questions right in a row.'],
    ['nohint', '🧠', 'No hints needed', 'Clear a boss gate at full marks.'], ['w1', '🏭', 'Factory fixed', 'Clear Fact Factory.'], ['w3', '🏗️', 'Dream builder', 'Clear Dream Tycoon.'], ['w5', '🔀', 'Untangled', 'Clear Glitch Crossroads.'],
    ['w9', '🏆', 'Glitch beaten', 'Clear the Final Arena.'], ['fix', '🩹', 'Respawned', 'Fix five questions in the Respawn Room.'], ['typed', '⌨️', 'Keyboard warrior', 'Type 20 correct answers.'],
    ['days3', '📅', 'Three days', 'Play on three different days.'], ['days7', '🗓️', 'Seven days', 'Play on seven different days.'], ['pets', '🐾', 'Pet collector', 'Hatch five pets.'], ['arcade', '🕹️', 'Arcade ace', 'Score 15 or more in an arcade game.'],
    ['u6', '📘', 'Unit 6 ready', 'Score 16 or more on the Unit 6 grammar check.'], ['c1', '🎓', 'C1 reached', 'Score 16 or more on the Final check C1.'], ['style', '🎀', 'New look', 'Buy something in the wardrobe.']
  ];
  function badge(id) { if (S.badges[id]) return; var b = BADGES.filter(function (x) { return x[0] === id; })[0]; if (!b) return; S.badges[id] = today(); S.bits += 20; setTimeout(function () { toast(b[1] + ' Badge: <b>' + esc(b[2]) + '</b> +20 Bits'); }, 1400); }
  function checkBadges() {
    if (S.days.length >= 3) badge('days3'); if (S.days.length >= 7) badge('days7');
    if (S.owned.pets.length >= 6) badge('pets'); if (S.stats.typed >= 20) badge('typed'); if (S.stats.bestCombo >= 10) badge('combo');
    ['w1', 'w3', 'w5', 'w9'].forEach(function (w) { if (S.gates[w] && S.gates[w].passed) badge(w); });
    if (CS.story && CS.story.chapters.every(function (c, i) { return c.pages.every(function (p, k) { return S.story['ch' + i + '-' + k]; }); })) badge('story');
    if (window.GUIDE.sections.every(function (s) { return S.stats.guide[s.id]; })) badge('guide');
  }
  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = document.createElement('div'); box.className = 'confetti'; var cols = Art.COLORS;
    for (var i = 0; i < 46; i++) { var b = document.createElement('i'); b.style.left = Math.random() * 100 + '%'; b.style.background = cols[i % 8]; b.style.animationDelay = Math.random() * .5 + 's'; b.style.animationDuration = 1.6 + Math.random() * 1.4 + 's'; b.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; box.appendChild(b); }
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 3400);
  }
  function touchDay() { var d = today(); if (S.days.indexOf(d) < 0) { S.days.push(d); if (S.days.length > 400) S.days.shift(); } }

  /* ------------------------------------------------------------ HUD + shell */
  function paintHud() {
    var lv = xpLevel(S.xp); var h = $('#hud'); if (!h) return;
    h.innerHTML = '<a class="chip bits" href="#/wardrobe" title="Bits: spend them in the wardrobe"><i class="coin"></i><b id="hud-bits">' + S.bits + '</b></a>' +
      '<a class="chip lv" href="#/me" title="Your level"><span>Lv</span><b>' + lv.n + '</b><em style="--p:' + lv.pct + '%"></em></a>' +
      '<a class="chip me" href="#/me" aria-label="Your profile">' + Art.avatar(S.avatar, { nopet: true }) + '</a>';
  }
  var NAV = [['#/', 'Worlds', '🌍'], ['#/story', 'Story', '📖'], ['#/guide', 'Guide', '🧭'], ['#/arcade', 'Arcade', '🕹️'], ['#/tests', 'Tests', '🎯'], ['#/me', 'Me', '🙂']];
  function paintNav(cur) { $('#nav').innerHTML = NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === cur ? ' class="on" aria-current="page"' : '') + '><span aria-hidden="true">' + n[2] + '</span>' + n[1] + '</a>'; }).join(''); }
  function setTheme() { if (S.theme) document.documentElement.setAttribute('data-theme', S.theme); else document.documentElement.removeAttribute('data-theme'); }
  function view(html, nav, cls) { if (window.Reader) window.Reader.stop(); var m = $('#app'); m.className = cls || ''; document.body.classList.toggle('playing', cls === 'playv'); m.innerHTML = html; paintNav(nav || ''); window.scrollTo(0, 0); if (window.Reader) window.Reader.paint(); }

  /* ------------------------------------------------------------ next step */
  function nextStep() {
    if (CS.story && !S.story['ch0-0']) return { href: '#/story/ch0', label: 'Start the story', sub: 'Meet Pim and Iffy, then choose your first world.', ico: '📖' };
    var due = Object.keys(S.faults).length; if (due >= 5) return { href: '#/respawn', label: 'Visit the Respawn Room', sub: due + ' questions are waiting for a second chance.', ico: '🩹' };
    for (var i = 0; i < WORLDS.length; i++) {
      var w = WORLDS[i]; if (!worldOpen(w) || worldCleared(w)) continue;
      for (var k = 0; k < w.lessons.length; k++) { var id = w.lessons[k], L = lesson(id); if (L && lessonStars(id) < 2) return { href: '#/lesson/' + id, label: (S.lessons[id] ? 'Try again: ' : 'Next lesson: ') + L.name, sub: w.name + ' · lesson ' + (k + 1) + ' of ' + w.lessons.length, ico: '🧱' }; }
      if (CS.gates[w.id]) return { href: '#/gate/' + w.id, label: 'Boss gate: ' + w.boss, sub: 'Clear ' + w.name + ' to open the next world and hatch a pet.', ico: '🚪' };
    }
    if (due) return { href: '#/respawn', label: 'Visit the Respawn Room', sub: due + ' questions are waiting.', ico: '🩹' };
    if (!S.tests.finalB2) return { href: '#/tests', label: 'Take the Final check B2', sub: 'Twenty questions across the worlds.', ico: '🎯' };
    return { href: '#/arcade', label: 'Play the arcade', sub: 'Keep your skills sharp against the clock.', ico: '🕹️' };
  }

  /* ------------------------------------------------------------ lobby */
  function starsHtml(n, of) { var s = ''; for (var i = 0; i < of; i++) s += '<i class="star' + (i < n ? ' on' : '') + '">★</i>'; return '<span class="stars" aria-label="' + n + ' of ' + of + ' stars">' + s + '</span>'; }
  function home() {
    touchDay();
    var ns = nextStep(), lv = xpLevel(S.xp), chest = S.chest !== today();
    var tiles = WORLDS.map(function (w) {
      var open = worldOpen(w), done = worldCleared(w), st = worldStars(w), max = w.lessons.length * 3, ready = w.lessons.some(function (id) { return lesson(id); });
      return '<a class="tile' + (open ? '' : ' locked') + (done ? ' done' : '') + '" href="' + (open ? '#/world/' + w.id : '#/locked/' + w.id) + '" style="--wc:' + w.color + '">' +
        '<div class="tile-art">' + Art.scene(w.scene) + '<span class="tile-n">' + w.n + '</span>' + (open ? '' : '<span class="lock" aria-label="Locked">🔒</span>') + (done ? '<span class="done-tag">Cleared ✓</span>' : '') + '</div>' +
        '<div class="tile-txt"><b>' + esc(w.name) + '</b><span>' + esc(w.nick) + ' · ' + w.cefr + '</span>' + (ready ? '<i class="tbar2"><em style="width:' + Math.round(100 * st / max) + '%"></em></i><small>★ ' + st + ' / ' + max + '</small>' : '<small>Coming soon</small>') + '</div></a>';
    }).join('');
    var route = (S.tests.placement && S.tests.placement.route || []).filter(function (id) { return !worldCleared(world(id)); });
    view('<section class="hero">' +
        '<div class="hero-me"><a href="#/wardrobe" class="hero-av" aria-label="Open the wardrobe">' + Art.avatar(S.avatar, { cls: 'bob' }) + '</a>' +
          '<div><p class="rank">' + esc(rank()) + ' · Level ' + lv.n + '</p><h1>' + (S.name ? 'Hi, ' + esc(S.name) + '!' : 'Welcome to What-If Worlds') + '</h1>' +
          '<div class="xpbar" title="' + lv.left + ' XP to the next level"><i style="width:' + lv.pct + '%"></i></div><p class="tiny">' + lv.left + ' XP to level ' + (lv.n + 1) + ' · ' + clearedCount() + ' of 9 worlds cleared · ' + S.days.length + ' day' + (S.days.length === 1 ? '' : 's') + ' played</p></div></div>' +
        '<a class="cta" href="' + ns.href + '"><span class="cta-ico" aria-hidden="true">' + ns.ico + '</span><span><b>' + esc(ns.label) + '</b><small>' + esc(ns.sub) + '</small></span><span class="cta-go" aria-hidden="true">▶</span></a>' +
        (chest ? '<button class="chest" id="chest"><span aria-hidden="true">🎁</span> Open today’s chest</button>' : '') +
        (route.length ? '<p class="route">Your route from the placement run: ' + route.map(function (id) { var w = world(id); return '<a class="pill" style="--wc:' + w.color + '" href="#/world/' + id + '">' + esc(w.name) + '</a>'; }).join(' ') + '</p>' : '') +
      '</section>' +
      '<h2 class="sec">Worlds</h2><div class="tiles">' + tiles + '</div>' +
      '<h2 class="sec">More to do</h2><div class="quick">' +
        '<a href="#/story"><span>📖</span><b>Story</b><small>Pim and the Glitch</small></a><a href="#/guide"><span>🧭</span><b>Guidebook</b><small>All types in simple words</small></a>' +
        '<a href="#/arcade"><span>🕹️</span><b>Arcade</b><small>Speed games</small></a><a href="#/tests"><span>🎯</span><b>Tests</b><small>Placement, Unit 6, finals</small></a>' +
        '<a href="#/respawn"><span>🩹</span><b>Respawn Room</b><small>' + Object.keys(S.faults).length + ' to fix</small></a><a href="hub/"><span>🏙️</span><b>The Plaza</b><small>Portals to your other apps</small></a></div>',
      '#/', 'home');
    var c = $('#chest'); if (c) c.onclick = function () { S.chest = today(); var n = 10 + Math.floor(Math.random() * 16); give(n, 0); save(); sfx.coin(); toast('🎁 +' + n + ' Bits. See you tomorrow!'); c.remove(); };
    if (!S.seenIntro) intro();
  }
  function intro() {
    S.seenIntro = true; save();
    sheet('<div class="intro"><div class="intro-av">' + Art.avatar(S.avatar, { cls: 'bob' }) + '</div><h2>Make it yours</h2><p>What should we call you? (A nickname is fine. It stays on this device.)</p>' +
      '<input id="in-name" maxlength="16" placeholder="Your nickname" autocomplete="off" value="' + esc(S.name) + '"><p class="tiny">You earn <b>Bits</b> for right answers. Spend them on your avatar in the wardrobe. Clear a world to hatch a pet.</p>' +
      '<button class="btn big" id="in-go">Let’s go ▶</button></div>');
    $('#in-go').onclick = function () { S.name = $('#in-name').value.trim().slice(0, 16); save(); closeSheet(); home(); };
  }
  function sheet(html) { var s = $('#sheet'); s.innerHTML = '<div class="sheet-card" role="dialog" aria-modal="true"><button class="x" id="sheet-x" aria-label="Close">✕</button>' + html + '</div>'; s.hidden = false; $('#sheet-x').onclick = closeSheet; s.onclick = function (e) { if (e.target === s) closeSheet(); }; }
  function closeSheet() { var s = $('#sheet'); s.hidden = true; s.innerHTML = ''; if (window.Reader && /^sheet/.test(window.Reader.state().owner)) window.Reader.stop(); }

  /* ------------------------------------------------------------ world page */
  function worldPage(id) {
    var w = world(id); if (!w) return home();
    if (!worldOpen(w)) return lockedPage(id);
    var ch = CS.story && CS.story.chapters[w.n], g = S.gates[w.id] || {}, go = gateOpen(w), petP = Art.PETS.filter(function (p) { return p.world === w.id; })[0];
    var nodes = w.lessons.map(function (lid, i) {
      var L = lesson(lid), rec = S.lessons[lid];
      if (!L) return '<div class="node soon"><span class="node-n">' + (i + 1) + '</span><div><b>Coming soon</b></div></div>';
      return '<a class="node' + (rec ? ' tried' : '') + '" href="#/lesson/' + lid + '"><span class="node-n">' + (i + 1) + '</span><div><b>' + rich(L.name) + '</b><small>' + L.cefr + (L.gateway ? ' · <span class="gw">Coursebook ' + esc(L.gateway) + '</span>' : '') + (rec ? ' · best ' + rec.best + '%' : '') + '</small></div>' + starsHtml(lessonStars(lid), 3) + '</a>';
    }).join('<i class="rope" aria-hidden="true"></i>');
    view('<div class="banner" style="--wc:' + w.color + '">' + Art.scene(w.scene) + '<div class="banner-txt"><a class="back" href="#/">← Worlds</a><p>World ' + w.n + ' · ' + esc(w.nick) + '</p><h1>' + esc(w.name) + '</h1></div></div>' +
      '<p class="lead">' + esc(w.blurb) + '</p>' +
      (ch ? '<a class="chapter" href="#/story/ch' + w.n + '"><span aria-hidden="true">📖</span><span><b>Chapter ' + w.n + ': ' + esc(ch.title) + '</b><small>' + esc(ch.mission || 'Read the story of this world.') + '</small></span></a>' : '') +
      '<h2 class="sec">The obby path</h2><div class="path" style="--wc:' + w.color + '">' + nodes + '<i class="rope" aria-hidden="true"></i>' +
        (CS.gates[w.id] ? '<a class="node boss' + (go ? '' : ' locked') + (g.passed ? ' tried' : '') + '" href="' + (go ? '#/gate/' + w.id : '#/world/' + w.id) + '"' + (go ? '' : ' aria-disabled="true"') + '><span class="node-n">' + (g.passed ? '✓' : go ? '🚪' : '🔒') + '</span><div><b>Boss gate: ' + esc(w.boss) + '</b><small>' + (g.passed ? 'Cleared · best ' + g.best + '%' : go ? '8 questions, one try each, no hints. Score 6 to clear the world.' : 'Try every lesson first.') + '</small></div>' +
          (petP ? '<span class="prize" title="' + esc(petP.name) + '">' + (g.passed ? Art.pet(petP.id) : Art.egg(petP.c)) + '</span>' : '') + '</a>' : '') + '</div>' +
      (g.passed && ch && ch.after ? '<p class="after">' + esc(ch.after) + '</p>' : ''),
      '#/', 'world');
  }
  function lockedPage(id) {
    var w = world(id), prev = WORLDS[w.n - 2];
    view('<div class="banner dim" style="--wc:' + w.color + '">' + Art.scene(w.scene) + '<div class="banner-txt"><a class="back" href="#/">← Worlds</a><p>World ' + w.n + ' · ' + esc(w.nick) + '</p><h1>' + esc(w.name) + ' 🔒</h1></div></div>' +
      '<div class="card"><p>This world opens when you clear the boss gate of <b>' + esc(prev.name) + '</b>.</p><p>Already know this grammar? The placement run can open worlds for you.</p>' +
      '<p class="row"><a class="btn" href="#/world/' + prev.id + '">Go to ' + esc(prev.name) + '</a> <a class="btn ghost" href="#/test/placement">Placement run</a></p></div>', '#/');
  }

  /* ------------------------------------------------------------ lesson page */
  var TYPE_NAMES = { '0': 'Type 0', '1': 'Type 1', '2': 'Type 2', '3': 'Type 3', m32: 'Mixed 3/2', m23: 'Mixed 2/3', conn: 'Connector', wish: 'Wish', formal: 'Formal', mix: 'All types' };
  function lessonPage(id) {
    var L = lesson(id); if (!L) return home();
    var w = world(L.world), lvl = S.level, x = L.levels[lvl] || L.levels.B2, rec = S.lessons[id], owner = 'lesson:' + id + ':' + lvl;
    var h = '<div class="lesson theory" style="--wc:' + w.color + '"><a class="back dark" href="#/world/' + w.id + '">← ' + esc(w.name) + '</a>' +
      '<p class="kicker"><span class="tag t-' + L.ctype + '">' + TYPE_NAMES[L.ctype] + '</span> ' + L.cefr + (L.gateway ? ' · <span class="gw">Coursebook ' + esc(L.gateway) + '</span>' : '') + '</p><h1>' + rich(L.name) + '</h1>' +
      '<div class="formula" aria-label="The pattern"><span class="fb f-if">' + rich(L.formula.if) + '</span><span class="fplus" aria-hidden="true">,</span><span class="fb f-res">' + rich(L.formula.result) + '</span></div>' +
      '<div class="lvl-bar" role="group" aria-label="Choose how the explanation is written"><span class="lvl-lbl">Explain it at:</span>' + ['B1', 'B2', 'C1'].map(function (l) { return '<button class="lvl-btn' + (l === lvl ? ' on' : '') + '" data-xlvl="' + l + '" aria-pressed="' + (l === lvl) + '">' + l + '<small>' + { B1: 'simple', B2: 'standard', C1: 'full' }[l] + '</small></button>'; }).join('') + '</div>' +
      '<div class="lsay-bar"><button class="lsay" data-rd="' + owner + '" id="l-say"><span class="lsay-ico" aria-hidden="true">▶</span><span class="lsay-lbl">Listen</span></button><button class="lsay-opt' + (window.Reader && window.Reader.slow() ? ' on' : '') + '" id="l-slow" aria-pressed="' + !!(window.Reader && window.Reader.slow()) + '">Slower</button></div>' +
      '<p class="key" data-part>' + rich(x.key) + '</p><div class="prose">' + x.body.map(function (p) { return '<p data-part>' + rich(p) + '</p>'; }).join('') + '</div>' +
      '<h2 class="sub">Examples</h2><div class="exlist">' + x.examples.map(function (e) { return '<div data-part><p class="s">' + rich(e.s) + '</p><p class="g">' + rich(e.g) + '</p></div>'; }).join('') + '</div>' +
      '<h2 class="sub">When do people say this?</h2><div class="uses">' + L.uses.map(function (u) { return '<div class="use"><b>' + esc(u.use) + '</b><span>' + rich(u.ex) + '</span></div>'; }).join('') + '</div>' +
      (L.thai ? '<details class="thai"><summary>ภาษาไทย (draft, not yet checked by a Thai speaker)</summary><p lang="th">' + esc(L.thai) + '</p></details>' : '') +
      '<div class="startbar"><a class="btn big" href="#/play/' + id + '">' + (rec ? 'Run the obby again' : 'Start the obby') + ' ▶</a><span class="tiny">8 questions · ' + (rec ? 'best ' + rec.best + '% ' : 'second chances allowed') + '</span>' + (rec ? starsHtml(rec.stars, 3) : '') + '</div></div>';
    view(h, '#/', 'lessonv');
    $$('[data-xlvl]').forEach(function (b) { b.onclick = function () { S.level = b.getAttribute('data-xlvl'); save(); var y = window.scrollY; lessonPage(id); window.scrollTo(0, y); }; });
    $('#l-say').onclick = function () {
      window.Reader.toggle(owner, function () {
        var els = $$('.lesson [data-part]'), texts = window.Parts.lessonParts(L, lvl);
        S.stats.listens++; save();
        window.Reader.read(texts.map(function (t, i) { return { text: t, el: els[i] }; }), { owner: owner, label: L.name.replace(/<[^>]+>/g, '') + ' · ' + lvl });
      });
    };
    $('#l-slow').onclick = function () { var on = !window.Reader.slow(); window.Reader.setSlow(on); this.classList.toggle('on', on); this.setAttribute('aria-pressed', on); };
  }

  /* ------------------------------------------------------------ router */
  var ROUTES = {};
  function route() {
    var h = (location.hash || '#/').replace(/^#\/?/, ''), p = h.split('/').filter(Boolean);
    closeSheet();
    if (!p.length) return home();
    if (p[0] === 'world') return worldPage(p[1]);
    if (p[0] === 'locked') return lockedPage(p[1]);
    if (p[0] === 'lesson') return lessonPage(p[1]);
    if (ROUTES[p[0]]) return ROUTES[p[0]](p.slice(1));
    home();
  }
  window.addEventListener('hashchange', route);
  window.WIW = { S: function () { return S; }, save: save, CS: CS, WORLDS: WORLDS, ITEMS: ITEMS, LESSON_IDS: LESSON_IDS, $: $, $$: $$, esc: esc, rich: rich, today: today, view: view, sheet: sheet, closeSheet: closeSheet,
    toast: toast, give: give, badge: badge, checkBadges: checkBadges, confetti: confetti, sfx: sfx, world: world, lesson: lesson, worldOpen: worldOpen, worldCleared: worldCleared, gateOpen: gateOpen, starsHtml: starsHtml,
    xpLevel: xpLevel, rank: rank, BADGES: BADGES, TYPE_NAMES: TYPE_NAMES, ROUTES: ROUTES, route: route, home: home, setTheme: setTheme, fresh: fresh, KEY: KEY, reset: function () { S = fresh(); save(); }, touchDay: touchDay, clearedCount: clearedCount };
  document.addEventListener('DOMContentLoaded', function () { setTheme(); paintHud(); route(); });
})();
