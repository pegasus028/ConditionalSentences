#!/usr/bin/env node
/* What-If Worlds — content validator. Usage: node tools/validate.js [w1 w2 … tests story games]  (no args = everything present) */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'content');
const PLAN = { w1: 3, w2: 3, w3: 3, w4: 3, w5: 3, w6: 5, w7: 4, w8: 3, w9: 3 };
const CTYPES = ['0', '1', '2', '3', 'm32', 'm23', 'conn', 'wish', 'formal', 'mix'];
const CEFR = ['A2', 'B1', 'B2', 'C1'];
const BANNED = /\b(lottery|lotto|jackpot|casino|gambl\w*|king|queen|prince|princess|royal\w*|monarch\w*|prime minister|boyfriend|girlfriend|crush|beer|wine|drunk|million (pounds|baht|dollars)|roblox|robux)\b/i;
let errs = 0, warns = 0;
const E = (f, m) => { errs++; console.log('  ERROR ' + f + ': ' + m); };
const W = (f, m) => { warns++; console.log('  warn  ' + f + ': ' + m); };
const norm = s => String(s).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/,/g, '').replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim();
const words = s => String(s).replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
const badTags = s => (String(s).match(/<\/?([a-zA-Z0-9]+)[^>]*>/g) || []).filter(t => !/^<\/?(b|em|s)>$/.test(t));
const seen = new Set();

function checkText(where, s) {
  if (typeof s !== 'string' || !s.trim()) return E(where, 'empty text');
  const bt = badTags(s); if (bt.length) E(where, 'tag not allowed: ' + bt.join(' '));
  if (BANNED.test(s.replace(/<[^>]+>/g, ''))) E(where, 'banned word: ' + s.match(BANNED)[0]);
  if (/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(s)) E(where, 'emoji or symbol in text');
}
function checkItem(it, where, opts = {}) {
  const w = where + ' ' + (it && it.id);
  if (!it || !it.id) return E(where, 'item without id');
  if (seen.has(it.id)) E(w, 'duplicate id'); seen.add(it.id);
  if (!['mcq', 'spot', 'type'].includes(it.type)) return E(w, 'bad type ' + it.type);
  if (!['meaning', 'form'].includes(it.skill)) E(w, 'skill must be meaning|form');
  if (!CTYPES.includes(String(it.ctype))) E(w, 'bad ctype ' + it.ctype);
  if (!CEFR.includes(it.cefr)) E(w, 'bad cefr ' + it.cefr);
  checkText(w + ' stem', it.stem); checkText(w + ' hint', it.hint); checkText(w + ' why', it.why);
  if (it.why && words(it.why) > 38) E(w, 'why is ' + words(it.why) + ' words (max 35)');
  if (/\b(option|answer) [A-Da-d1-4]\b|\bthe (first|second|third|fourth|last) option\b/.test((it.why || '') + ' ' + (it.hint || '') + ' ' + (it.fb || []).join(' '))) E(w, 'mentions an option letter/position');
  if (it.lines) { if (!Array.isArray(it.lines)) E(w, 'lines must be an array'); else it.lines.forEach(l => { if (!l.who || !l.text) E(w, 'line needs who+text'); else checkText(w + ' line', l.text); }); }
  if (it.truth) checkText(w + ' truth', it.truth);
  if (['2', '3', 'm32', 'm23'].includes(String(it.ctype)) && it.type !== 'spot' && !it.truth) W(w, 'imagined item has no truth line');
  if (it.type === 'mcq') {
    if (!Array.isArray(it.options) || it.options.length !== 4) return E(w, 'mcq needs 4 options');
    if (new Set(it.options.map(norm)).size !== 4) E(w, 'duplicate options');
    it.options.forEach(o => checkText(w + ' option', o));
    if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 4)) E(w, 'answer out of range');
    if (!(Number.isInteger(it.near) && it.near >= 0 && it.near < 4 && it.near !== it.answer)) E(w, 'near missing or = answer');
    if (!Array.isArray(it.fb) || it.fb.length !== 4) E(w, 'fb needs 4 lines'); else {
      it.fb.forEach(f => checkText(w + ' fb', f));
      if (!/^(yes|correct|right)\b/i.test(it.fb[it.answer] || '')) W(w, 'fb for the key should start with Yes');
    }
    if (/___/.test(it.stem) && (it.stem.match(/___+/g) || []).length > 1) E(w, 'more than one gap');
    const hintL = norm(it.hint || ''), key = norm(it.options[it.answer] || '');
    if (key.length > 3 && hintL.includes(key)) E(w, 'hint contains the key');
  }
  if (it.type === 'spot') {
    const segs = (it.stem.match(/\[\[(.+?)\]\]/g) || []);
    if (segs.length !== 4) E(w, 'spot needs exactly 4 [[segments]], has ' + segs.length);
    if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 4)) E(w, 'answer out of range');
    if (!it.fix) E(w, 'spot needs fix');
    if (!Array.isArray(it.fb) || it.fb.length !== 4) E(w, 'fb needs 4 lines');
  }
  if (it.type === 'type') {
    if ((it.stem.match(/___+/g) || []).length !== 1) E(w, 'type needs exactly one ___');
    if (!Array.isArray(it.accept) || !it.accept.length) return E(w, 'type needs accept[]');
    if (!it.model || !it.accept.map(norm).includes(norm(it.model))) E(w, 'model must be in accept');
    if (it.accept.some(a => words(a) > 8)) W(w, 'long typed answer (>8 words)');
    if (it.keyword && !it.accept.every(a => norm(a).split(/[^a-z']+/).includes(norm(it.keyword)))) E(w, 'an accepted answer lacks the keyword ' + it.keyword);
    const hintL = norm(it.hint || ''); if (hintL.includes(norm(it.model))) E(w, 'hint contains the answer');
  }
  if (opts.lessonRef && !it.lesson) E(w, 'test item needs "lesson"');
}
function checkLevels(L, where) {
  ['B1', 'B2', 'C1'].forEach(lv => {
    const x = L.levels && L.levels[lv], w = where + ' ' + lv;
    if (!x) return E(w, 'missing level');
    checkText(w + ' key', x.key);
    if (!Array.isArray(x.body) || x.body.length < 3 || x.body.length > 5) E(w, 'body needs 3–5 paragraphs'); else x.body.forEach((p, i) => {
      checkText(w + ' body' + i, p); if (words(p) > 95) E(w, 'paragraph ' + (i + 1) + ' has ' + words(p) + ' words (max ~85)');
      if (/e\.g\.|i\.e\.|→|=>|->|\betc\b| = | \+ /.test(p)) E(w, 'paragraph ' + (i + 1) + ' has e.g./arrow/=/+ (write for the ear)');
      if (/\b[A-Z]{4,}\b/.test(p.replace(/<[^>]+>/g, ''))) W(w, 'ALL CAPS word in paragraph ' + (i + 1));
    });
    if (!Array.isArray(x.examples) || x.examples.length < 3 || x.examples.length > 5) E(w, 'needs 3–5 examples'); else x.examples.forEach(e => { checkText(w + ' ex.s', e.s); checkText(w + ' ex.g', e.g); });
    if (lv === 'B1' && x.body) { const sents = x.body.join(' ').replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/).filter(s => s.trim()); const avg = sents.reduce((a, s) => a + words(s), 0) / (sents.length || 1); if (avg > 17) E(w, 'average sentence ' + avg.toFixed(1) + ' words (B1 max ~16)'); }
  });
}
function checkWorld(id) {
  const f = path.join(DIR, id + '.json'); let d;
  try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return E(id, 'cannot parse: ' + e.message); }
  if (d.world !== id) E(id, 'world field');
  if (!Array.isArray(d.lessons) || d.lessons.length !== PLAN[id]) E(id, 'needs ' + PLAN[id] + ' lessons, has ' + (d.lessons || []).length);
  (d.lessons || []).forEach((L, i) => {
    const w = id + ' ' + L.id;
    if (L.id !== id + 'l' + (i + 1)) E(w, 'lesson id should be ' + id + 'l' + (i + 1));
    ['name', 'cefr', 'ctype'].forEach(k => { if (!L[k]) E(w, 'missing ' + k); });
    if (!L.formula || !L.formula.if || !L.formula.result) E(w, 'missing formula {if, result}');
    if (!Array.isArray(L.uses) || L.uses.length < 3 || L.uses.length > 6) E(w, 'uses needs 3–6'); else L.uses.forEach(u => { if (!u.use || !u.ex) E(w, 'use needs use+ex'); else { checkText(w + ' use', u.ex); if (words(u.ex) > 18) W(w, 'long use example'); } });
    checkLevels(L, w);
    const its = L.items || [];
    if (its.length !== 8) E(w, 'needs 8 items, has ' + its.length);
    its.forEach((it, k) => { checkItem(it, w); if (it.id !== L.id + '-' + (k + 1)) E(w, 'item id should be ' + L.id + '-' + (k + 1)); if (k < 3 && it.skill !== 'meaning') E(w + ' ' + it.id, 'items 1–3 must be meaning'); if (k >= 3 && it.skill !== 'form') E(w + ' ' + it.id, 'items 4–8 must be form'); });
    const n = t => its.filter(x => x.type === t).length;
    if (n('mcq') < 4) E(w, 'needs ≥4 mcq'); if (n('spot') !== 1) E(w, 'needs exactly 1 spot'); if (n('type') < 1 || n('type') > 2) E(w, 'needs 1–2 typed items');
    const mc = its.filter(x => x.type === 'mcq' && Array.isArray(x.options));
    const longest = mc.filter(x => { const l = x.options.map(o => o.length); return l[x.answer] === Math.max(...l) && l.filter(v => v === l[x.answer]).length === 1; }).length;
    if (longest > 2) E(w, 'key is the longest option in ' + longest + ' mcq items (max 2)');
  });
  const g = d.gate; if (!g || g.id !== id + 'g') E(id, 'gate id should be ' + id + 'g'); else {
    const its = g.items || []; if (its.length !== 8) E(id + ' gate', 'needs 8 items');
    its.forEach((it, k) => { checkItem(it, id + ' gate'); if (it.id !== id + 'g-' + (k + 1)) E(id + ' gate', 'item id should be ' + id + 'g-' + (k + 1)); });
    const n = t => its.filter(x => x.type === t).length;
    if (n('spot') !== 1 || n('type') !== 1 || n('mcq') !== 6) E(id + ' gate', 'needs 6 mcq, 1 spot, 1 type');
    if (its.filter(x => x.skill === 'meaning').length !== 3) E(id + ' gate', 'needs 3 meaning items');
  }
}
const LESSONS = Object.entries(PLAN).flatMap(([w, n]) => Array.from({ length: n }, (_, i) => w + 'l' + (i + 1)));
function checkTests() {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8')); } catch (e) { return E('tests', 'cannot parse: ' + e.message); }
  const pl = (d.placement && d.placement.items) || [];
  if (pl.length !== 18) E('tests placement', 'needs 18 items, has ' + pl.length);
  pl.forEach((it, i) => { checkItem(it, 'placement', { lessonRef: true }); if (it.type !== 'mcq') E('placement ' + it.id, 'must be mcq'); if (it.world !== 'w' + (Math.floor(i / 2) + 1)) E('placement ' + it.id, 'world should be w' + (Math.floor(i / 2) + 1)); if (it.lesson && !LESSONS.includes(it.lesson)) E('placement ' + it.id, 'unknown lesson'); });
  ['u6', 'finalB2', 'finalC1'].forEach(k => {
    const t = d[k]; if (!t || !Array.isArray(t.sections)) return E('tests ' + k, 'missing sections');
    let n = 0; t.sections.forEach(s => { if (!s.title || !s.instructions) E('tests ' + k, 'section needs title+instructions'); (s.items || []).forEach(it => { n++; checkItem(it, k, { lessonRef: true }); if (it.lesson && !LESSONS.includes(it.lesson)) E(k + ' ' + it.id, 'unknown lesson ' + it.lesson); }); });
    if (n !== 20) E('tests ' + k, 'needs 20 items, has ' + n);
  });
}
const SCENES = ['home', 'factory', 'plaza', 'tycoon', 'tower', 'crossroads', 'bridges', 'island', 'citadel', 'arena'];
const TAGS = ['0', '1', '2', '3', 'm32', 'm23', 'wish', 'conn', 'formal'];
function checkStory() {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(DIR, 'story.json'), 'utf8')); } catch (e) { return E('story', 'cannot parse: ' + e.message); }
  if (!d.title || !Array.isArray(d.chapters) || d.chapters.length !== 10) return E('story', 'needs title and 10 chapters');
  const used = new Set();
  d.chapters.forEach((c, i) => {
    const w = 'story ch' + i;
    if (c.id !== 'ch' + i) E(w, 'id should be ch' + i);
    if (i > 0 && c.world !== 'w' + i) E(w, 'world should be w' + i);
    if (!c.title) E(w, 'title');
    if (!Array.isArray(c.pages) || c.pages.length < 2 || c.pages.length > 3) return E(w, 'needs 2–3 pages');
    c.pages.forEach((p, k) => {
      if (!SCENES.includes(p.scene)) E(w, 'bad scene ' + p.scene);
      if (!p.grammar) E(w, 'page needs grammar line');
      const plain = String(p.text || '').replace(/\[\[([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]/g, (m, t, s) => { used.add(t); if (!TAGS.includes(t)) E(w, 'bad tag ' + t); return s; });
      if (/\[\[|\]\]/.test(plain)) E(w + ' p' + (k + 1), 'broken [[tag|sentence|note]] markup');
      const n = words(plain); if (n < 90 || n > 175) E(w + ' p' + (k + 1), n + ' words (90–170)');
      if (BANNED.test(plain)) E(w, 'banned word ' + plain.match(BANNED)[0]);
    });
  });
  TAGS.forEach(t => { if (!used.has(t)) E('story', 'tag never used: ' + t); });
}
function checkGames() {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(DIR, 'games.json'), 'utf8')); } catch (e) { return E('games', 'cannot parse: ' + e.message); }
  (d.sorters || []).forEach(s => {
    const w = 'games ' + s.id;
    if (!s.id || !s.name || !s.blurb || !Array.isArray(s.cats) || s.cats.length < 2 || s.cats.length > 6) E(w, 'sorter needs id, name, blurb, 2–6 cats');
    if (!/^w[1-9]$/.test(s.unlock || '')) E(w, 'unlock must be w1…w9');
    const ids = (s.cats || []).map(c => c.id);
    if (!Array.isArray(s.items) || s.items.length < 24) E(w, 'needs ≥24 items');
    const count = {}; (s.items || []).forEach(it => { if (!it.t || !ids.includes(it.c) || !it.note) E(w, 'item needs t, c (a cat id), note: ' + JSON.stringify(it).slice(0, 80)); else { checkText(w, it.t); count[it.c] = (count[it.c] || 0) + 1; } });
    ids.forEach(c => { if ((count[c] || 0) < 3) E(w, 'category ' + c + ' has fewer than 3 items'); });
  });
  if ((d.sorters || []).length !== 5) E('games', 'needs 5 sorters');
  const m = d.machine || []; if (m.length < 10) E('games', 'machine needs ≥10 events');
  m.forEach(ev => { ['1', '2', '3', 'm32', 'm23', 'wish'].forEach(k => { const f = ev.forms && ev.forms[k]; if (!f || !f.s || !f.truth) E('games machine ' + ev.id, 'form ' + k + ' needs s + truth'); else checkText('machine ' + ev.id, f.s); }); if (!ev.id || !ev.event) E('games machine', 'event needs id + event'); });
}
let args = process.argv.slice(2);
if (!args.length) args = [...Object.keys(PLAN), 'tests', 'story', 'games'].filter(a => fs.existsSync(path.join(DIR, a + '.json')));
args.forEach(a => { console.log('== ' + a); if (PLAN[a]) checkWorld(a); else if (a === 'tests') checkTests(); else if (a === 'story') checkStory(); else if (a === 'games') checkGames(); else E(a, 'unknown file'); });
console.log('\n' + errs + ' errors, ' + warns + ' warnings');
process.exit(errs ? 1 : 0);
