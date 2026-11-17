/* What-If Worlds — parts.js
   The exact pieces of text the Listen buttons read aloud, in order. Shared by the app (which pairs each
   piece with its element on the page) and tools/tts-list.js (which records them), so they never drift. */
(function (root) {
  function storyPlain(t) { return String(t || '').replace(/\[\[([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]/g, '$2'); }
  function lessonParts(L, lvl) {
    var x = (L.levels || {})[lvl] || (L.levels || {}).B2 || {}; var out = [L.name + '. ' + (x.key || '')];
    (x.body || []).forEach(function (p) { out.push(p); });
    (x.examples || []).forEach(function (e) { out.push(e.s + '. ' + e.g); });
    return out;
  }
  function usesParts(L) { return (L.uses || []).map(function (u) { return u.use + '. ' + u.ex; }); }
  function storyParts(page) { return storyPlain(page.text).split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean); }
  function guideParts(sec) {
    var out = [sec.title + '.'].concat(sec.intro || []);
    (sec.cards || []).forEach(function (c) {
      out.push(c.name + '. ' + c.meaning);
      (c.uses || []).forEach(function (u) { out.push((u[0] ? u[0] + '. ' : '') + u[1]); });
      if (c.truth) out.push(c.truth);
    });
    (sec.trio || []).forEach(function (r) { out.push(r[0] + '. ' + r[1] + ' ' + r[2]); });
    if (sec.family) out.push(sec.family);
    (sec.list || []).forEach(function (r) { out.push(r[1] + ' ' + r[2]); });
    return out;
  }
  var api = { storyPlain: storyPlain, lessonParts: lessonParts, usesParts: usesParts, storyParts: storyParts, guideParts: guideParts };
  root.Parts = api; if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
