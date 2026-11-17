/* What-If Worlds — tools/tts-list.js
   Prints (JSON) every text a Listen button reads aloud, with its recording key: each lesson at B1, B2 and C1
   (name + key sentence, each paragraph, each example), every story page paragraph, and every Guidebook section.
   The parts come from parts.js and the keys from tts-clean.js, exactly as in the app, so they never drift.
   Used by tools/make-audio.py.   node tools/tts-list.js [--summary] */
const vm = require('vm'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const { speechText, ttsNorm, ttsKey } = require(path.join(ROOT, 'tts-clean.js'));
const Parts = require(path.join(ROOT, 'parts.js'));
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
['data/worlds.js', 'data/content.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));
const CS = ctx.CS, out = [], seen = {};
function add(text, ref) {
  const t = ttsNorm(speechText(text)); if (!t) return; const key = ttsKey(t);
  if (seen[key]) { if (seen[key] !== t) throw new Error('Key collision ' + key + ': ' + ref); return; }
  seen[key] = t; out.push({ key, ref, text: t });
}
Object.keys(CS.lessons).sort().forEach(id => ['B1', 'B2', 'C1'].forEach(lv => Parts.lessonParts(CS.lessons[id], lv).forEach((t, i) => add(t, id + ':' + lv + ':' + i))));
if (CS.story) CS.story.chapters.forEach((c, ci) => c.pages.forEach((p, pi) => Parts.storyParts(p).forEach((t, i) => add(t, 'story:ch' + ci + ':' + pi + ':' + i))));
ctx.GUIDE.sections.forEach(s => Parts.guideParts(s).forEach((t, i) => add(t, 'guide:' + s.id + ':' + i)));
if (process.argv.includes('--summary')) { const chars = out.reduce((a, b) => a + b.text.length, 0); console.log(out.length + ' clips, ' + chars + ' characters (about ' + Math.round(chars / 15 / 60) + ' minutes of speech)'); }
else if (process.argv.includes('--odd')) { const odd = {}; out.forEach(o => (o.text.match(/[^A-Za-z0-9 .,;:!?'()\-]/g) || []).forEach(ch => { odd[ch] = odd[ch] || o.ref + ': ' + o.text.slice(0, 70); })); console.log(odd); }
else process.stdout.write(JSON.stringify(out));
