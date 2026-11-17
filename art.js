/* What-If Worlds — art.js
   All pictures are drawn in code as blocky SVG: the avatar, the pets and the ten world scenes.
   window.Art = { avatar(cfg, opts), pet(id, size), scene(key), SKINS, HAIRS, COLORS, ACCS, PETS } */
(function () {
  'use strict';
  var SKINS = ['#f6d3b3', '#eebf98', '#d9a57c', '#b98059', '#8a5a3c'];
  var HAIRC = ['#1f1a17', '#3b2a1e', '#6b4226', '#b5651d', '#e8b84a', '#d94f8a', '#5b6cff', '#2aa198'];
  var COLORS = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#3ccf7a', '#18b7c9', '#3f7cff', '#8a5cf6', '#ff6fb5', '#f4f4f4', '#2b2f3a'];
  var HAIRS = [{ id: 'pony', name: 'Ponytail' }, { id: 'bob', name: 'Bob' }, { id: 'long', name: 'Long' }, { id: 'buns', name: 'Space buns' }];
  var ACCS = [
    { id: 'none', name: 'Nothing', cost: 0 }, { id: 'bow', name: 'Big bow', cost: 60 }, { id: 'cap', name: 'Builder cap', cost: 80 },
    { id: 'catears', name: 'Cat ears', cost: 120 }, { id: 'headphones', name: 'Headphones', cost: 150 }, { id: 'helmet', name: 'Hard hat', cost: 180 },
    { id: 'star', name: 'Star clips', cost: 220 }, { id: 'wizard', name: 'Wizard hat', cost: 300 }, { id: 'halo', name: 'Glitch halo', cost: 400 }
  ];
  /* pets: iffy is free; one hatches each time a world is cleared */
  var PETS = [
    { id: 'none', name: 'No pet' }, { id: 'iffy', name: 'Iffy the fox-cat', c: '#ff9f1c', e: 'fox' },
    { id: 'cog', name: 'Cog the factory bot', c: '#3ccf7a', e: 'bot', world: 'w1' }, { id: 'deal', name: 'Deal the parrot', c: '#3f7cff', e: 'bird', world: 'w2' },
    { id: 'dream', name: 'Dream the cloud sheep', c: '#ffd23f', e: 'sheep', world: 'w3' }, { id: 'tick', name: 'Tick the owl', c: '#8a5cf6', e: 'owl', world: 'w4' },
    { id: 'zig', name: 'Zig the two-tailed gecko', c: '#ff6fb5', e: 'gecko', world: 'w5' }, { id: 'plank', name: 'Plank the beaver', c: '#b5651d', e: 'beaver', world: 'w6' },
    { id: 'splash', name: 'Splash the wish-fish', c: '#18b7c9', e: 'fish', world: 'w7' }, { id: 'sir', name: 'Quill the citadel cat', c: '#c9b26b', e: 'cat', world: 'w8' },
    { id: 'blaze', name: 'Blaze the tiny dragon', c: '#ff5a5f', e: 'dragon', world: 'w9' }
  ];
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; var m = function (v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }; return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1); }
  /* a block with a lit top edge and a shaded right edge */
  function B(x, y, w, h, c, r) { r = r == null ? 2 : r; return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + c + '"/>' + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + Math.min(4, h / 4) + '" rx="' + r + '" fill="' + shade(c, .28) + '" opacity=".8"/>' + '<rect x="' + (x + w - Math.min(4, w / 5)) + '" y="' + y + '" width="' + Math.min(4, w / 5) + '" height="' + h + '" rx="' + r + '" fill="' + shade(c, -.22) + '" opacity=".7"/>'; }

  function avatar(cfg, opts) {
    cfg = cfg || {}; opts = opts || {};
    var skin = SKINS[cfg.skin || 0] || SKINS[0], hc = HAIRC[cfg.hairc || 0] || HAIRC[0], top = COLORS[cfg.top == null ? 5 : cfg.top], bot = COLORS[cfg.bottom == null ? 9 : cfg.bottom];
    var hair = cfg.hair || 'pony', acc = cfg.acc || 'none', s = '';
    var back = '', front = '';
    if (hair === 'long') back += B(20, 18, 60, 70, hc, 8);
    if (hair === 'pony') back += B(72, 6, 16, 16, hc, 7) + B(78, 18, 14, 44, hc, 7) + '<rect x="72" y="14" width="10" height="6" rx="2" fill="#ff6fb5"/>';
    if (hair === 'buns') back += '<circle cx="28" cy="14" r="10" fill="' + hc + '"/><circle cx="72" cy="14" r="10" fill="' + hc + '"/>';
    front += '<path d="M24 30 V20 a8 8 0 0 1 8 -8 H68 a8 8 0 0 1 8 8 V30 H66 V24 H40 V30 Z" fill="' + hc + '"/>';
    if (hair === 'bob') front += B(21, 24, 9, 34, hc, 4) + B(70, 24, 9, 34, hc, 4);
    if (hair === 'long') front += B(20, 24, 9, 52, hc, 4) + B(71, 24, 9, 52, hc, 4);
    if (hair === 'pony' || hair === 'buns') front += B(23, 24, 6, 16, hc, 3) + B(71, 24, 6, 16, hc, 3);
    s += back;
    s += B(34, 98, 14, 34, bot) + B(52, 98, 14, 34, bot) + B(33, 128, 16, 8, '#2b2f3a') + B(51, 128, 16, 8, '#2b2f3a');           // legs + shoes
    s += B(14, 60, 14, 34, top) + B(72, 60, 14, 34, top) + B(14, 90, 14, 8, skin) + B(72, 90, 14, 8, skin);                    // arms + hands
    s += B(28, 58, 44, 42, top);                                                                                               // torso
    s += '<rect x="42" y="66" width="16" height="16" rx="3" fill="' + shade(top, .45) + '" opacity=".9"/><path d="M46 78 l4 -8 l4 8 z" fill="' + shade(top, -.3) + '"/>';
    s += '<rect x="26" y="14" width="48" height="44" rx="9" fill="' + skin + '"/><rect x="68" y="18" width="6" height="36" rx="3" fill="' + shade(skin, -.12) + '"/>';
    s += front;
    var mood = opts.mood || 'happy';
    s += '<ellipse cx="40" cy="38" rx="3.6" ry="' + (mood === 'oops' ? 1.2 : 4.6) + '" fill="#1d1d28"/><ellipse cx="60" cy="38" rx="3.6" ry="' + (mood === 'oops' ? 1.2 : 4.6) + '" fill="#1d1d28"/>';
    if (mood !== 'oops') s += '<circle cx="41.3" cy="36.4" r="1.3" fill="#fff"/><circle cx="61.3" cy="36.4" r="1.3" fill="#fff"/>';
    s += '<circle cx="33" cy="45" r="3.4" fill="#ff8fa3" opacity=".55"/><circle cx="67" cy="45" r="3.4" fill="#ff8fa3" opacity=".55"/>';
    s += mood === 'oops' ? '<path d="M44 50 q6 -5 12 0" stroke="#1d1d28" stroke-width="2.2" fill="none" stroke-linecap="round"/>' : mood === 'wow' ? '<ellipse cx="50" cy="49" rx="4" ry="5" fill="#7a2b3a"/>' : '<path d="M43 47 q7 7 14 0" stroke="#1d1d28" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (acc === 'bow') s += '<path d="M50 10 L34 2 V18 Z M50 10 L66 2 V18 Z" fill="#ff5a8a"/><circle cx="50" cy="10" r="4.5" fill="#ff8fb0"/>';
    if (acc === 'cap') s += B(24, 8, 52, 12, '#ff9f1c', 6) + B(60, 16, 26, 6, '#e07f00', 3);
    if (acc === 'catears') s += '<path d="M28 16 L32 0 L44 12 Z M72 16 L68 0 L56 12 Z" fill="' + hc + '"/><path d="M32 12 L33 5 L39 11 Z M68 12 L67 5 L61 11 Z" fill="#ff8fb0"/>';
    if (acc === 'headphones') s += '<path d="M24 34 V26 a26 22 0 0 1 52 0 V34" stroke="#2b2f3a" stroke-width="5" fill="none"/>' + B(18, 30, 10, 18, '#18b7c9', 4) + B(72, 30, 10, 18, '#18b7c9', 4);
    if (acc === 'helmet') s += '<path d="M22 22 a28 20 0 0 1 56 0 Z" fill="#ffd23f"/>' + B(20, 20, 60, 6, '#e0b000', 3);
    if (acc === 'star') s += '<path d="M30 12 l2.5 5.5 6 .6 -4.5 4 1.4 6 -5.4 -3.2 -5.4 3.2 1.4 -6 -4.5 -4 6 -.6z" fill="#ffd23f" transform="translate(4 -4) scale(.8)"/><path d="M30 12 l2.5 5.5 6 .6 -4.5 4 1.4 6 -5.4 -3.2 -5.4 3.2 1.4 -6 -4.5 -4 6 -.6z" fill="#ff6fb5" transform="translate(46 -6) scale(.8)"/>';
    if (acc === 'wizard') s += '<path d="M50 -14 L74 16 H26 Z" fill="#6a3df0"/>' + B(18, 14, 64, 6, '#4b24c2', 3) + '<circle cx="50" cy="4" r="3" fill="#ffd23f"/>';
    if (acc === 'halo') s += '<ellipse cx="50" cy="4" rx="20" ry="5" fill="none" stroke="#3ff0e0" stroke-width="3"/><ellipse cx="50" cy="4" rx="20" ry="5" fill="none" stroke="#ff4fd8" stroke-width="1.5" transform="translate(2 1)"/>';
    var pet = cfg.pet && cfg.pet !== 'none' && !opts.nopet ? '<g transform="translate(86 96)">' + petBody(cfg.pet) + '</g>' : '';
    var vb = pet ? '0 -16 132 156' : '8 -16 84 156';
    return '<svg class="avatar ' + (opts.cls || '') + '" viewBox="' + vb + '" role="img" aria-label="Your avatar" xmlns="http://www.w3.org/2000/svg">' + s + pet + '</svg>';
  }
  function petBody(id) {
    var p = PETS.filter(function (x) { return x.id === id; })[0]; if (!p || !p.c) return '';
    var c = p.c, s = '';
    var ears = { fox: '<path d="M6 8 L10 -6 L18 6 Z M34 8 L30 -6 L22 6 Z" fill="' + c + '"/>', cat: '<path d="M6 8 L9 -4 L17 6 Z M34 8 L31 -4 L23 6 Z" fill="' + c + '"/>', bot: '<rect x="18" y="-8" width="4" height="10" fill="#8891a5"/><circle cx="20" cy="-9" r="3.5" fill="#ff5a5f"/>',
      bird: '<path d="M16 2 L20 -8 L24 2 Z" fill="' + shade(c, -.2) + '"/>', sheep: '<circle cx="8" cy="6" r="6" fill="#fff"/><circle cx="32" cy="6" r="6" fill="#fff"/><circle cx="20" cy="2" r="7" fill="#fff"/>', owl: '<path d="M6 6 L8 -4 L16 6 Z M34 6 L32 -4 L24 6 Z" fill="' + shade(c, -.2) + '"/>',
      gecko: '<path d="M38 28 q14 -4 8 -14 M38 30 q16 2 12 12" stroke="' + c + '" stroke-width="4" fill="none" stroke-linecap="round"/>', beaver: '<rect x="34" y="24" width="14" height="8" rx="3" fill="' + shade(c, -.3) + '"/>', fish: '<path d="M38 20 L50 10 V32 Z" fill="' + shade(c, -.15) + '"/>',
      dragon: '<path d="M8 6 L10 -4 L16 6 Z M32 6 L30 -4 L24 6 Z" fill="#ffd23f"/><path d="M38 14 L52 6 L44 22 Z" fill="' + shade(c, -.2) + '"/>' }[p.e] || '';
    s += ears + B(2, 4, 36, 30, c, 7);
    s += '<circle cx="13" cy="18" r="3.2" fill="#1d1d28"/><circle cx="27" cy="18" r="3.2" fill="#1d1d28"/><circle cx="14" cy="17" r="1" fill="#fff"/><circle cx="28" cy="17" r="1" fill="#fff"/>';
    s += p.e === 'bird' || p.e === 'owl' ? '<path d="M17 23 L20 28 L23 23 Z" fill="#ffb347"/>' : '<path d="M16 25 q4 4 8 0" stroke="#1d1d28" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    s += B(6, 32, 9, 7, shade(c, -.2), 2) + B(25, 32, 9, 7, shade(c, -.2), 2);
    return s;
  }
  function pet(id, cls) { return '<svg class="pet ' + (cls || '') + '" viewBox="-4 -12 60 54" role="img" aria-label="' + ((PETS.filter(function (x) { return x.id === id; })[0] || {}).name || 'pet') + '" xmlns="http://www.w3.org/2000/svg">' + petBody(id) + '</svg>'; }
  function egg(c) { return '<svg class="pet egg" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 6 C46 6 52 30 52 40 a22 16 0 0 1 -44 0 C8 30 14 6 30 6Z" fill="' + c + '"/><path d="M18 30 l6 6 6 -6 6 6 6 -6" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><circle cx="22" cy="20" r="3" fill="#fff" opacity=".7"/></svg>'; }

  /* ---------- scenes: 400 x 200 ---------- */
  function clouds(y, o) { return '<g opacity="' + (o || .9) + '">' + B(40, y, 46, 12, '#ffffff', 3) + B(52, y - 9, 26, 12, '#ffffff', 3) + B(250, y + 14, 56, 12, '#ffffff', 3) + B(266, y + 5, 26, 12, '#ffffff', 3) + '</g>'; }
  function ground(c, y) { y = y || 160; var s = B(0, y, 400, 200 - y, c, 0); for (var i = 0; i < 400; i += 40) s += '<rect x="' + i + '" y="' + y + '" width="1.5" height="' + (200 - y) + '" fill="' + shade(c, -.18) + '" opacity=".5"/>'; return s + '<rect x="0" y="' + (y + 14) + '" width="400" height="1.5" fill="' + shade(c, -.18) + '" opacity=".5"/>'; }
  function tree(x, y, c) { return B(x + 8, y + 22, 8, 22, '#8a5a3c') + B(x, y, 24, 26, c || '#3ccf7a', 4) + B(x + 5, y - 10, 14, 14, shade(c || '#3ccf7a', .1), 4); }
  function sky(a, b, id) { return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="400" height="200" fill="url(#' + id + ')"/>'; }
  var SC = {
    home: function () { var s = sky('#2b2f6b', '#6b5ca5', 'skh') + ground('#3a3f5c'); for (var i = 0; i < 9; i++) s += '<rect x="' + (20 + i * 44) + '" y="' + (10 + (i * 37) % 60) + '" width="2" height="26" fill="#cfe3ff" opacity=".35" transform="rotate(12 ' + (20 + i * 44) + ' 20)"/>';
      s += B(60, 70, 150, 90, '#454a78', 4) + B(80, 86, 40, 40, '#ffd98a', 3) + B(150, 86, 40, 40, '#9be7ff', 3) + B(240, 118, 90, 12, '#8a5a3c', 3) + B(250, 130, 8, 30, '#6b4226') + B(312, 130, 8, 30, '#6b4226');
      s += B(266, 92, 40, 26, '#1d1d28', 4) + '<rect x="270" y="96" width="32" height="18" rx="2" fill="#3ff0e0"/><rect x="278" y="100" width="6" height="6" fill="#ff4fd8"/><rect x="288" y="104" width="8" height="6" fill="#ffd23f"/>'; return s; },
    factory: function () { var s = sky('#8fe3c4', '#d9fff0', 'skf') + clouds(24) + ground('#57c98f');
      s += B(40, 84, 130, 76, '#2fa36b', 3) + B(52, 50, 20, 34, '#8891a5') + B(96, 40, 20, 44, '#8891a5') + B(46, 44, 32, 8, '#6b7386') + B(90, 34, 32, 8, '#6b7386');
      s += '<circle cx="62" cy="30" r="9" fill="#fff" opacity=".8"/><circle cx="110" cy="18" r="11" fill="#fff" opacity=".8"/>';
      s += B(56, 104, 26, 26, '#bff3da', 2) + B(96, 104, 26, 26, '#bff3da', 2) + B(136, 118, 22, 42, '#1d6b45', 2);
      s += B(190, 138, 190, 10, '#3a4050', 2); for (var i = 0; i < 5; i++) s += B(200 + i * 36, 116, 22, 22, ['#ffd23f', '#ff9f1c', '#3f7cff', '#ff6fb5', '#8a5cf6'][i], 3);
      s += '<circle cx="290" cy="74" r="26" fill="none" stroke="#2fa36b" stroke-width="10" stroke-dasharray="10 7"/><circle cx="290" cy="74" r="8" fill="#2fa36b"/>'; return s; },
    plaza: function () { var s = sky('#6fb7ff', '#d6ecff', 'skp') + clouds(20) + ground('#f1d9a7');
      var cols = ['#ff5a5f', '#3f7cff', '#ffd23f', '#3ccf7a'];
      for (var i = 0; i < 4; i++) { var x = 26 + i * 94; s += B(x, 108, 70, 52, '#fff7e8', 3) + B(x - 6, 92, 82, 18, cols[i], 4) + '<rect x="' + (x + 14) + '" y="92" width="14" height="18" fill="#fff" opacity=".55"/><rect x="' + (x + 44) + '" y="92" width="14" height="18" fill="#fff" opacity=".55"/>' + B(x + 10, 124, 18, 14, cols[(i + 1) % 4], 3) + B(x + 38, 124, 18, 14, cols[(i + 2) % 4], 3); }
      s += B(186, 30, 28, 64, '#3f7cff', 4) + B(176, 22, 48, 14, '#2a5fd6', 4) + '<circle cx="200" cy="58" r="9" fill="#fff"/><path d="M200 52 V58 H205" stroke="#2a5fd6" stroke-width="2.5" fill="none"/>'; return s; },
    tycoon: function () { var s = sky('#ffb86b', '#ffe9b0', 'skt') + clouds(26, .8) + ground('#f6c453');
      s += B(40, 120, 60, 40, '#ff6fb5', 3) + B(52, 90, 36, 30, '#ff8fc7', 3) + B(62, 68, 16, 22, '#ffb3d9', 3);
      s += B(130, 70, 70, 90, '#8a5cf6', 3) + B(142, 82, 16, 16, '#fff3b0', 2) + B(172, 82, 16, 16, '#fff3b0', 2) + B(142, 110, 16, 16, '#fff3b0', 2) + B(172, 110, 16, 16, '#fff3b0', 2);
      s += '<g opacity=".55" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 5" fill="none"><rect x="236" y="60" width="70" height="100" rx="3"/><rect x="320" y="96" width="56" height="64" rx="3"/><path d="M236 60 L271 34 L306 60"/></g>';
      s += B(214, 140, 12, 20, '#ffd23f', 6) + B(210, 132, 20, 10, '#ffd23f', 5); return s; },
    tower: function () { var s = sky('#3a2d73', '#b06ab3', 'skw') + ground('#4a3f7a'); for (var i = 0; i < 14; i++) s += '<rect x="' + ((i * 53) % 390) + '" y="' + ((i * 29) % 90) + '" width="3" height="3" fill="#fff" opacity=".7"/>';
      for (var f = 0; f < 5; f++) s += B(150 + f * 6, 136 - f * 28, 100 - f * 12, 26, f % 2 ? '#7b5cd6' : '#6548c4', 3) + B(170 + f * 6, 142 - f * 28, 14, 14, '#ffd98a', 2) + B(216 - f * 4, 142 - f * 28, 14, 14, '#ffd98a', 2);
      s += '<circle cx="200" cy="12" r="16" fill="#fff3b0"/><path d="M200 2 V12 H208" stroke="#6548c4" stroke-width="3" fill="none"/><path d="M96 80 a40 40 0 1 0 12 -30" stroke="#ffd23f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M110 36 L112 54 L96 48 Z" fill="#ffd23f"/>'; return s; },
    crossroads: function () { var s = sky('#1b1f4b', '#4b2a7a', 'skc') + ground('#2a2f5c', 150);
      s += '<path d="M40 200 L180 150 H220 L360 200 Z" fill="#3ff0e0" opacity=".35"/><path d="M0 170 L180 150 V160 L0 196 Z" fill="#ff4fd8" opacity=".4"/><path d="M400 170 L220 150 V160 L400 196 Z" fill="#ffd23f" opacity=".4"/>';
      s += B(188, 84, 24, 70, '#8891a5', 3) + B(120, 78, 76, 18, '#ff4fd8', 3) + B(204, 100, 76, 18, '#3ff0e0', 3) + B(130, 122, 64, 16, '#ffd23f', 3);
      for (var i = 0; i < 12; i++) s += '<rect x="' + ((i * 71) % 380) + '" y="' + (20 + (i * 43) % 110) + '" width="' + (10 + (i * 7) % 26) + '" height="4" fill="' + ['#ff4fd8', '#3ff0e0', '#ffd23f'][i % 3] + '" opacity=".75"/>'; return s; },
    bridges: function () { var s = sky('#7fd0ff', '#e6f7ff', 'skb') + clouds(18) + B(0, 150, 400, 50, '#2aa7d6', 0);
      s += B(0, 110, 70, 90, '#57c98f', 3) + B(330, 110, 70, 90, '#57c98f', 3) + tree(16, 70) + tree(352, 70, '#2fa36b');
      var cols = ['#ff9f1c', '#ff5a5f', '#8a5cf6', '#3f7cff', '#ffd23f'];
      for (var i = 0; i < 5; i++) { var x = 78 + i * 50; s += B(x, 112 + (i % 2) * 8, 44, 10, cols[i], 3) + B(x + 4, 122 + (i % 2) * 8, 6, 34, '#8a5a3c') + B(x + 34, 122 + (i % 2) * 8, 6, 34, '#8a5a3c'); }
      s += '<path d="M0 166 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>'; return s; },
    island: function () { var s = sky('#59d8e6', '#e0fbff', 'ski') + clouds(22) + B(0, 150, 400, 50, '#1aa7b8', 0);
      s += '<path d="M60 160 Q200 96 340 160 Z" fill="#f6dc9c"/>' + tree(96, 92, '#2fa36b') + tree(280, 98, '#3ccf7a');
      s += B(176, 118, 48, 30, '#9aa3b5', 4) + B(170, 112, 60, 10, '#6b7386', 3) + B(174, 82, 6, 32, '#8a5a3c') + B(220, 82, 6, 32, '#8a5a3c') + B(166, 72, 68, 12, '#ff6fb5', 4) + '<ellipse cx="200" cy="124" rx="18" ry="5" fill="#3ff0e0"/>';
      ['#ffd23f', '#fff', '#ff8fc7'].forEach(function (c, i) { s += '<path d="M0 -7 L2 -2 7 -2 3 1 5 7 0 3 -5 7 -3 1 -7 -2 -2 -2Z" fill="' + c + '" transform="translate(' + (180 + i * 22) + ' ' + (56 - i * 12) + ')"/>'; }); return s; },
    citadel: function () { var s = sky('#c9d6ea', '#f3f6fb', 'skd') + clouds(16, .7) + ground('#b8bfcc');
      s += B(90, 70, 220, 90, '#8e97a8', 3) + B(70, 44, 50, 116, '#7a8394', 3) + B(280, 44, 50, 116, '#7a8394', 3);
      for (var i = 0; i < 3; i++) s += B(70 + i * 19, 34, 12, 12, '#7a8394', 2) + B(280 + i * 19, 34, 12, 12, '#7a8394', 2);
      for (var j = 0; j < 7; j++) s += B(98 + j * 30, 60, 16, 12, '#8e97a8', 2);
      s += '<path d="M172 160 V112 a28 28 0 0 1 56 0 V160 Z" fill="#4b3f2a"/><path d="M200 86 V160" stroke="#2f2718" stroke-width="3"/>' + B(88, 76, 14, 22, '#c9b26b', 2) + B(298, 76, 14, 22, '#c9b26b', 2) + B(190, 14, 4, 30, '#4b3f2a') + '<path d="M194 14 H226 L216 24 L226 34 H194 Z" fill="#c9b26b"/>'; return s; },
    arena: function () { var s = sky('#3b0d1f', '#c0392b', 'ska') + ground('#5a1d2a', 156);
      s += '<path d="M20 156 Q200 60 380 156 Z" fill="#7a2a3a"/><path d="M50 156 Q200 84 350 156 Z" fill="#9c3848"/>'; for (var i = 0; i < 9; i++) s += B(40 + i * 38, 150, 18, 46, '#ffd23f', 2);
      s += B(170, 96, 60, 60, '#1d1d28', 6) + '<rect x="178" y="110" width="14" height="10" fill="#ff4fd8"/><rect x="208" y="110" width="14" height="10" fill="#3ff0e0"/><path d="M180 136 h8 v6 h8 v-6 h8 v6 h8 v-6 h8" stroke="#fff" stroke-width="3" fill="none"/>';
      for (var k = 0; k < 10; k++) s += '<rect x="' + (150 + (k * 37) % 110) + '" y="' + (70 + (k * 23) % 60) + '" width="' + (8 + k * 3 % 20) + '" height="3" fill="' + (k % 2 ? '#ff4fd8' : '#3ff0e0') + '" opacity=".8"/>'; return s; }
  };
  function scene(key, cls) { return '<svg class="scene ' + (cls || '') + '" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + key + ' scene" xmlns="http://www.w3.org/2000/svg">' + (SC[key] || SC.home)() + '</svg>'; }
  window.Art = { avatar: avatar, pet: pet, egg: egg, scene: scene, block: B, shade: shade, SKINS: SKINS, HAIRC: HAIRC, HAIRS: HAIRS, COLORS: COLORS, ACCS: ACCS, PETS: PETS };
})();
