/* The Plaza — hub.js: a small 3D blocky plaza. Walk the avatar (the same one as in What-If Worlds) to a portal
   to open another learning app. Portals come from portals.js. Coins picked up here are added to the Bits in
   What-If Worlds (same browser storage). If 3D is not available the plain list is shown instead. */
(function () {
  'use strict';
  var KEY = 'whatif.v1', P = window.PORTALS || [], Art = window.Art;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function played(p) { try { return p.key && !!localStorage.getItem(p.key); } catch (e) { return false; } }
  var S = load(), av = (S && S.avatar) || { skin: 1, hair: 'long', hairc: 0, top: 5, bottom: 9, acc: 'none', pet: 'iffy' };
  var today = (function () { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); })();
  function paintBits() { $('#bits b').textContent = S ? S.bits : 0; }
  function addBits(n) { S = load() || S; if (!S) return; S.bits = (S.bits || 0) + n; S.plaza = S.plaza || {}; S.plaza.day = today; S.plaza.got = (S.plaza.got || 0) + 1; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} paintBits(); }
  paintBits();

  /* ---------- plain list (also the fallback) ---------- */
  function listHtml() { return '<h2>All portals</h2>' + P.map(function (p) { return '<a class="p" style="--pc:' + p.color + '" href="' + p.url + '"><b>' + esc(p.name) + (played(p) ? ' ✓' : '') + '</b><span>' + esc(p.topic) + '</span></a>'; }).join(''); }
  $('#list').innerHTML = listHtml();
  $('#listb').onclick = function () { var l = $('#list'); l.hidden = !l.hidden; this.textContent = l.hidden ? '☰ List' : '✕ Close'; };
  function fallback() { $('#list').hidden = false; $('#listb').hidden = true; $('#tip').hidden = true; document.querySelector('.stick').style.display = 'none'; }

  var THREE = window.THREE, renderer;
  try { if (!THREE) throw 0; renderer = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: true }); } catch (e) { return fallback(); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  var scene = new THREE.Scene(); scene.background = new THREE.Color(0x7fd0ff); scene.fog = new THREE.Fog(0x7fd0ff, 38, 80);
  var cam = new THREE.PerspectiveCamera(50, 1, .1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6f9a7a, .62));
  var sun = new THREE.DirectionalLight(0xffffff, .5); sun.position.set(12, 22, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 30; sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30; scene.add(sun);
  var mat = function (c) { return new THREE.MeshLambertMaterial({ color: c }); };
  function box(w, h, d, c, x, y, z, parent) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; }

  /* ---------- ground: a studded checker of grass blocks, a round stone plaza, paths ---------- */
  var R = 15;
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mat(0x57c98f)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  for (var gx = -9; gx <= 9; gx++) for (var gz = -9; gz <= 9; gz++) { var d = Math.sqrt(gx * gx + gz * gz) * 3; if ((gx + gz) % 2 === 0) { var t = new THREE.Mesh(new THREE.BoxGeometry(3, .06, 3), mat(d < R + 4 ? 0xe9dcc0 : 0x4dbb82)); t.position.set(gx * 3, .03, gz * 3); t.receiveShadow = true; scene.add(t); } else if (d < R + 4) { var t2 = new THREE.Mesh(new THREE.BoxGeometry(3, .06, 3), mat(0xf6ecd6)); t2.position.set(gx * 3, .03, gz * 3); t2.receiveShadow = true; scene.add(t2); } }
  /* fountain */
  box(5, .8, 5, 0x9aa3b5, 0, .4, 0); box(4, .5, 4, 0x3fb8e8, 0, .85, 0); box(1, 2.4, 1, 0x9aa3b5, 0, 1.6, 0); var orb = box(1.3, 1.3, 1.3, 0xffd23f, 0, 3.5, 0);
  /* trees and clouds */
  function tree(x, z) { box(.7, 2, .7, 0x8a5a3c, x, 1, z); box(2.6, 2.2, 2.6, 0x2fa36b, x, 3, z); box(1.7, 1.4, 1.7, 0x3ccf7a, x, 4.6, z); }
  [[-22, -8], [-20, 12], [22, -10], [21, 13], [-6, -23], [9, -24], [-12, 22], [14, 22], [-26, 2], [26, 2]].forEach(function (p) { tree(p[0], p[1]); });
  var clouds = []; [[-14, 16, -30], [10, 19, -34], [28, 15, -12], [-30, 17, 6]].forEach(function (p) { var g = new THREE.Group(); box(6, 1.6, 3, 0xffffff, 0, 0, 0, g); box(3.4, 1.6, 2.4, 0xffffff, 1, 1.2, 0, g); g.position.set(p[0], p[1], p[2]); g.children.forEach(function (m) { m.castShadow = false; }); scene.add(g); clouds.push(g); });

  /* ---------- labels ---------- */
  function label(text, sub, color) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 160; var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.strokeStyle = '#16203a'; x.lineWidth = 8; rr(x, 6, 6, 500, 148, 28); x.fill(); x.stroke();
    x.fillStyle = color; rr(x, 6, 6, 500, 30, 28); x.fill(); x.fillStyle = '#16203a'; x.textAlign = 'center';
    x.font = '400 54px "Lilita One", Arial Black, sans-serif'; x.fillText(text.length > 17 ? text.slice(0, 16) + '…' : text, 256, 92, 480);
    x.font = '700 26px Nunito, Arial, sans-serif'; x.fillStyle = '#3d4966'; x.fillText(sub, 256, 132, 470);
    var tex = new THREE.CanvasTexture(c); var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); s.scale.set(5.6, 1.75, 1); return s;
  }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

  /* ---------- portals in a ring ---------- */
  var portals = [], hit = [];
  function buildPortals() {
    P.forEach(function (p, i) {
      var a = -Math.PI / 2 + (i / P.length) * Math.PI * 2, x = Math.cos(a) * R, z = Math.sin(a) * R, g = new THREE.Group(), col = new THREE.Color(p.color).getHex();
      box(.9, 5, .9, col, -2, 2.5, 0, g); box(.9, 5, .9, col, 2, 2.5, 0, g); box(5.6, 1, 1.1, col, 0, 5.4, 0, g); box(6, .4, 2.4, 0x9aa3b5, 0, .2, 0, g);
      var glow = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 4.6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .45, side: THREE.DoubleSide })); glow.position.set(0, 2.6, 0); g.add(glow);
      var pad = new THREE.Mesh(new THREE.BoxGeometry(5.6, 6.4, 1.6), new THREE.MeshBasicMaterial({ visible: false })); pad.position.set(0, 3.2, 0); pad.userData.portal = i; g.add(pad); hit.push(pad);
      var lb = label(p.name, played(p) ? '✓ Played · tap to enter' : 'Tap to enter', p.color); lb.position.set(0, 7.4, 0); g.add(lb);
      g.position.set(x, 0, z); g.rotation.y = Math.atan2(-x, -z); scene.add(g);
      portals.push({ p: p, x: x, z: z, fx: Math.cos(a) * (R - 3), fz: Math.sin(a) * (R - 3), glow: glow, g: g });
    });
  }

  /* ---------- the avatar, built from blocks in the player's own colours ---------- */
  var SK = Art.SKINS, HC = Art.HAIRC, CO = Art.COLORS, hex = function (s) { return new THREE.Color(s).getHex(); };
  var me = new THREE.Group(), body = new THREE.Group(); me.add(body);
  var skin = hex(SK[av.skin || 0]), hair = hex(HC[av.hairc || 0]), top = hex(CO[av.top == null ? 5 : av.top]), bot = hex(CO[av.bottom == null ? 9 : av.bottom]);
  var legL = box(.42, .9, .42, bot, -.24, .45, 0, body), legR = box(.42, .9, .42, bot, .24, .45, 0, body);
  box(1, 1.1, .56, top, 0, 1.45, 0, body);
  var armL = box(.34, 1, .4, top, -.68, 1.5, 0, body), armR = box(.34, 1, .4, top, .68, 1.5, 0, body);
  box(1.05, 1, 1, skin, 0, 2.5, 0, body); box(1.15, .34, 1.1, hair, 0, 3.05, 0, body); box(1.15, 1.3, .3, hair, 0, 2.3, -.5, body); box(.16, .9, 1, hair, -.58, 2.45, -.05, body); box(.16, .9, 1, hair, .58, 2.45, -.05, body); box(1.05, .22, .12, hair, 0, 2.92, .5, body);
  if (av.hair === 'long') box(1.2, 1.5, .3, hair, 0, 1.7, -.42, body);
  if (av.hair === 'pony') box(.36, 1.2, .36, hair, 0, 2.3, -.8, body);
  if (av.hair === 'buns') { box(.5, .5, .5, hair, -.5, 3.4, 0, body); box(.5, .5, .5, hair, .5, 3.4, 0, body); }
  box(.14, .2, .05, 0x1d1d28, -.24, 2.55, .51, body); box(.14, .2, .05, 0x1d1d28, .24, 2.55, .51, body); box(.34, .07, .05, 0x7a2b3a, 0, 2.25, .51, body);
  if (av.acc === 'cap' || av.acc === 'helmet') box(1.2, .3, 1.3, av.acc === 'cap' ? 0xff9f1c : 0xffd23f, 0, 3.3, .1, body);
  if (av.acc === 'wizard') { box(1.5, .14, 1.5, 0x4b24c2, 0, 3.3, 0, body); box(.8, .7, .8, 0x6a3df0, 0, 3.7, 0, body); box(.4, .5, .4, 0x6a3df0, 0, 4.3, 0, body); }
  if (av.acc === 'bow') box(.9, .36, .2, 0xff5a8a, 0, 3.4, 0, body);
  if (av.acc === 'catears') { box(.3, .4, .2, hair, -.38, 3.4, 0, body); box(.3, .4, .2, hair, .38, 3.4, 0, body); }
  if (av.acc === 'headphones') { box(.2, .5, .5, 0x18b7c9, -.62, 2.6, 0, body); box(.2, .5, .5, 0x18b7c9, .62, 2.6, 0, body); box(1.3, .14, .2, 0x2b2f3a, 0, 3.28, 0, body); }
  var petDef = Art.PETS.filter(function (x) { return x.id === av.pet; })[0], pet = null;
  if (petDef && petDef.c) { pet = new THREE.Group(); box(.8, .7, .9, hex(petDef.c), 0, .5, 0, pet); box(.12, .14, .05, 0x1d1d28, -.18, .6, .46, pet); box(.12, .14, .05, 0x1d1d28, .18, .6, .46, pet); box(.2, .3, .2, hex(petDef.c), -.25, .98, 0, pet); box(.2, .3, .2, hex(petDef.c), .25, .98, 0, pet); scene.add(pet); pet.position.set(1.6, 0, 7.5); }
  me.position.set(0, 0, 8); scene.add(me);

  /* ---------- coins (eight a day) ---------- */
  var coins = [], left = S && S.plaza && S.plaza.day === today ? Math.max(0, 8 - (S.plaza.got || 0)) : 8;
  if (S && (!S.plaza || S.plaza.day !== today)) { S.plaza = { day: today, got: 0 }; }
  for (var ci = 0; ci < left; ci++) { var ang = ci * 2.4 + 1, rad = 5 + (ci * 37 % 7); var cn = box(.7, .7, .16, 0xffd23f, Math.cos(ang) * rad, 1, Math.sin(ang) * rad); coins.push(cn); }

  /* ---------- input ---------- */
  var target = null, goPortal = -1, keys = {}, ray = new THREE.Raycaster(), v2 = new THREE.Vector2(), down = null, card = $('#card'), near = -1, dismissed = -1;
  var cv = renderer.domElement;
  cv.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener('pointerup', function (e) {
    if (!down || Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 14) { down = null; return; } down = null;
    v2.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); ray.setFromCamera(v2, cam);
    var h = ray.intersectObjects(hit, false);
    if (h.length) { var i = h[0].object.userData.portal; goPortal = i; dismissed = -1; target = new THREE.Vector3(portals[i].fx, 0, portals[i].fz); return; }
    var g = ray.intersectObject(ground, false); if (g.length) { var pt = g[0].point; var d = Math.sqrt(pt.x * pt.x + pt.z * pt.z); if (d > 30) pt.multiplyScalar(30 / d); target = new THREE.Vector3(pt.x, 0, pt.z); goPortal = -1; $('#tip').hidden = true; }
  });
  var KM = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r', W: 'u', S: 'd', A: 'l', D: 'r' };
  window.addEventListener('keydown', function (e) { if (KM[e.key]) { keys[KM[e.key]] = 1; target = null; e.preventDefault(); $('#tip').hidden = true; } if (e.key === 'Enter' && near >= 0) location.href = portals[near].p.url; });
  window.addEventListener('keyup', function (e) { if (KM[e.key]) keys[KM[e.key]] = 0; });
  Array.prototype.forEach.call(document.querySelectorAll('.stick button'), function (b) { var k = b.getAttribute('data-k'); b.addEventListener('pointerdown', function (e) { keys[k] = 1; target = null; e.preventDefault(); $('#tip').hidden = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { keys[k] = 0; }); }); });

  function showCard(i) {
    var p = portals[i].p; card.style.setProperty('--pc', p.color);
    card.innerHTML = '<h2>' + esc(p.name) + '</h2><p>' + esc(p.topic) + '</p><div class="row"><a class="go" href="' + p.url + '">Enter ▶</a>' + (played(p) ? '<small>✓ You have played this</small>' : '') + '<button class="x" id="cx">Not now</button></div>';
    card.hidden = false; $('#tip').hidden = true; document.getElementById('cx').onclick = function () { card.hidden = true; dismissed = i; };
  }

  /* ---------- loop ---------- */
  function size() { var w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 62 : 50; cam.updateProjectionMatrix(); }
  window.addEventListener('resize', size); size();
  var clock = new THREE.Clock(), walk = 0, camPos = new THREE.Vector3(0, 15, 27);
  function frame() {
    var dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, mv = new THREE.Vector3(), sp = 9;
    if (keys.u) mv.z -= 1; if (keys.d) mv.z += 1; if (keys.l) mv.x -= 1; if (keys.r) mv.x += 1;
    if (mv.lengthSq()) mv.normalize(); else if (target) { mv.subVectors(target, me.position); mv.y = 0; if (mv.length() < .25) { target = null; mv.set(0, 0, 0); } else mv.normalize(); }
    var moving = mv.lengthSq() > 0;
    if (moving) { me.position.addScaledVector(mv, sp * dt); var d = Math.sqrt(me.position.x * me.position.x + me.position.z * me.position.z); if (d > 30) me.position.multiplyScalar(30 / d); if (d < 3.6) me.position.multiplyScalar(3.6 / Math.max(d, .01)); var want = Math.atan2(mv.x, mv.z), diff = Math.atan2(Math.sin(want - me.rotation.y), Math.cos(want - me.rotation.y)); me.rotation.y += diff * Math.min(1, dt * 12); walk += dt * 11; }
    var sw = moving ? Math.sin(walk) * .7 : 0; legL.rotation.x = sw; legR.rotation.x = -sw; armL.rotation.x = -sw; armR.rotation.x = sw; body.position.y = moving ? Math.abs(Math.sin(walk)) * .12 : Math.sin(t * 2) * .03;
    if (pet) { var px = me.position.x - Math.sin(me.rotation.y) * 1.6 + Math.cos(me.rotation.y) * 1.1, pz = me.position.z - Math.cos(me.rotation.y) * 1.6 - Math.sin(me.rotation.y) * 1.1; pet.position.x += (px - pet.position.x) * Math.min(1, dt * 5); pet.position.z += (pz - pet.position.z) * Math.min(1, dt * 5); pet.position.y = Math.abs(Math.sin(t * 6)) * .18; pet.rotation.y = me.rotation.y; }
    orb.rotation.y = t; orb.position.y = 3.5 + Math.sin(t * 2) * .2;
    clouds.forEach(function (c, i) { c.position.x += dt * (.4 + i * .1); if (c.position.x > 45) c.position.x = -45; });
    for (var i = coins.length - 1; i >= 0; i--) { var c = coins[i]; c.rotation.y = t * 3; c.position.y = 1 + Math.sin(t * 3 + i) * .15; if (Math.abs(c.position.x - me.position.x) < 1 && Math.abs(c.position.z - me.position.z) < 1) { scene.remove(c); coins.splice(i, 1); addBits(2); } }
    var n = -1; portals.forEach(function (q, i) { q.glow.material.opacity = .35 + Math.sin(t * 3 + i) * .12; var dx = q.fx - me.position.x, dz = q.fz - me.position.z; if (dx * dx + dz * dz < 9) n = i; });
    if (n !== near) { near = n; if (n >= 0 && dismissed !== n) showCard(n); else if (n < 0) { card.hidden = true; dismissed = -1; } }
    var want2 = new THREE.Vector3(me.position.x * .9, 15, me.position.z * .9 + 19); camPos.lerp(want2, Math.min(1, dt * 3)); cam.position.copy(camPos); cam.lookAt(me.position.x, 1.8, me.position.z);
    renderer.render(scene, cam); requestAnimationFrame(frame);
  }
  var start = function () { buildPortals(); frame(); window.PLAZA = { me: me, portals: portals, goTo: function (i) { target = new THREE.Vector3(portals[i].fx, 0, portals[i].fz); }, coins: coins }; };
  if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('54px "Lilita One"'), document.fonts.load('700 26px Nunito')]).then(start, start); setTimeout(function () { if (!window.PLAZA) start(); }, 2500); } else start();
})();
