/* =============================================================
   Where's Dayla? — render
   The "storybook papercraft" look: paper-puppet characters drawn in code,
   with a cream paper edge and ink outline, and layered Tivoli Park sets.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { clamp, lerp, rng, shade, rr, ell, star } = WD.U;

/* ================= looks (from David's photos and sourcebook) ================= */
const LOOKS = WD.LOOKS = {
  David: { skin: '#F2C9A8', hair: '#4A2E22', hairStyle: 'messy', top: '#F7F4EE', stripe: '#3E4A6B', collar: '#B8463F', pants: '#7C8794', shoes: '#F4F4F2', height: 1.06, eye: '#3A2A22' },
  Laura: { skin: '#D9A27B', hair: '#1D1416', hairStyle: 'pony', top: '#2A2428', ribs: true, pants: '#5D83B9', shoes: '#F4F4F2', height: .94, eye: '#2A1A14', pearl: true, lashes: true },
  Veci: { skin: '#C98E66', hair: '#2B211C', hairStyle: 'cap', cap: '#C2453A', top: '#6E7B4A', camo: true, pants: '#B9A27A', shoes: '#4B4B4B', height: 1.0, eye: '#2A1A14', belly: 8, glasses: true, cig: true },
  Alejandra: { skin: '#E0B08C', hair: '#6B4430', hairStyle: 'pony', pony: '#6B4430', top: '#E9B8C4', pants: '#3E4A6B', shoes: '#F4F4F2', height: .93, eye: '#2A1A14', glasses: true, lashes: true, scrunchie: '#F4F4F2' },
  Samuel: { skin: '#E3B48E', hair: '#3A271C', hairStyle: 'curly', top: '#7FA6C9', pants: '#C9BFA9', shoes: '#5A4C42', height: 1.02, eye: '#2A1A14', glasses: true },
  /* United International College */
  Angelica: { skin: '#E2B48E', hair: '#3A2418', hairStyle: 'long', top: '#F4EFE6', blazer: '#2F3550', pants: '#2B2B33', shoes: '#2B1D14', height: .98, eye: '#2A1A14', lashes: true, pearl: true },
  'David Lesser': { skin: '#F0CDB0', hair: '#7A5A3E', hairStyle: 'short', top: '#A9C2DD', tie: '#7A1F2B', pants: '#5A5F6E', shoes: '#3A2A22', height: 1.17, eye: '#3A2A22', glasses: true },
  Marcela: { skin: '#D9A882', hair: '#5A3324', hairStyle: 'bun', top: '#E8B04A', scarf: '#3E8FC7', pants: '#2E3A4E', shoes: '#F4F4F2', height: .95, eye: '#2A1A14', lashes: true, hoops: true },
  Lydia: { skin: '#E6BE9C', hair: '#A9825A', hairStyle: 'long', top: '#7A3E6B', skirt: '#7A3E6B', pants: '#D9B49A', shoes: '#3A2A22', height: .91, eye: '#2A1A14', lashes: true, pearl: true, glasses: true, age: true },
  Leonela: { skin: '#C99272', hair: '#16110F', hairStyle: 'long', streak: '#C2303A', top: '#2A2A33', pants: '#6E85A8', shoes: '#F4F4F2', height: .95, eye: '#2A1A14', lashes: true }
};
const DOG = { base: '#A65A3A', dark: '#874630', light: '#BE7550', white: '#FBF4EA', pink: '#E8A39A', nose: '#7A4A40', eye: '#3B2116', iris: '#8A5A2B' };
const CHI = { base: '#2B2729', dark: '#1D1A1C', light: '#4A4447', cream: '#F7F3EC', pink: '#E9A3A0', nose: '#141113', eye: '#1A1414' };
const CATS = WD.CATS = {
  dean: { fur: '#E9E4DA', dark: '#C9C1B3', light: '#FFFFFF', eye: '#D98C3A', gown: '#1E1E26', trim: '#7A1F2B', mortar: true, specs: true, size: 1.6, fluffy: true, brows: true },
  clip: { fur: '#9C8A7A', dark: '#7E6C5C', light: '#E6DACB', eye: '#9ACD5A', stripes: '#7E6C5C', clip: true, size: .95 },
  monitor: { fur: '#D98E5A', dark: '#B86E3E', light: '#F7E2C8', eye: '#7FB548', stripes: '#B86E3E', sash: '#F2C14E', whistle: true, size: 1.05, brows: true },
  agent: { fur: '#8E939C', dark: '#6E737C', light: '#D9DCE0', eye: '#9ACD5A', suit: '#24242B', tie: '#C2453A', shades: true, earpiece: true, size: 1 },
  agent2: { fur: '#C99C6E', dark: '#A77B50', light: '#F0DCC0', eye: '#9ACD5A', suit: '#24242B', tie: '#3E6FB5', shades: true, earpiece: true, size: .95, stripes: '#A77B50' },
  sergeant: { fur: '#E58E3A', dark: '#C06A22', light: '#FBE2C0', eye: '#7FB548', stripes: '#C06A22', hat: true, whistle: true, medal: true, size: 1.55, fluffy: true, brows: true },
  kairos: { fur: '#1F1C22', dark: '#141216', light: '#2E2A33', eye: '#D9E04A', size: .9, slim: true }
};

function edge(c, col, w){ c.strokeStyle = shade(col, -.38); c.lineWidth = w || .7; c.stroke(); }

/* ================= humans ================= */
function drawHuman(c, L, st){
  const mv = st.move || 0, w = st.walk || 0, t = st.t || 0;
  const sw = Math.sin(w), legA = sw * .55 * mv, armA = -sw * .65 * mv;
  const bob = -Math.abs(Math.cos(w)) * 2.2 * mv + Math.sin(t * 2.2) * .5 * (1 - mv) + (st.squash || 0);
  const H = L.height || 1;
  c.save(); c.scale(H, H);
  const hipY = -21 + bob, shY = -38 + bob, belly = L.belly || 0;
  const leg = (x, a, col) => { c.save(); c.translate(x, hipY); c.rotate(a + (st.kneel && x > 0 ? -1.2 : 0)); c.fillStyle = col; rr(c, -3.8, -1, 7.6, 20, 3.5); c.fill(); edge(c, col); c.fillStyle = L.shoes; ell(c, 2.2, 19.5, 5.8, 3.4); c.fill(); c.fillStyle = shade(L.shoes, -.25); c.fillRect(-3.4, 20.5, 11, 1.4); c.restore(); };
  const arm = (x, a, col, sk, prop) => { c.save(); c.translate(x, shY + 3); c.rotate(a + (st.armRaise || 0)); c.fillStyle = sk; rr(c, -2.7, 2, 5.4, 15, 2.7); c.fill(); edge(c, sk, .6); c.fillStyle = col; rr(c, -3.4, -1.5, 6.8, 8, 3); c.fill(); edge(c, col, .6); if(L.stripe){ c.fillStyle = L.stripe; c.fillRect(-3.2, 1.5, 6.4, 1.3); c.fillRect(-3.2, 4.4, 6.4, 1.3); } c.fillStyle = sk; ell(c, 0, 17, 3.3, 3.3); c.fill(); edge(c, sk, .6); if(prop) prop(c, st); c.restore(); };
  leg(-2.5, -legA, shade(L.pants, -.18));
  const sleeve = L.blazer || L.top;
  arm(-3, -armA * .9 + (st.backArm || 0), shade(sleeve, -.12), shade(L.skin, -.12), st.backProp);
  c.save(); c.beginPath(); c.moveTo(-8.5, shY); c.quadraticCurveTo(0, shY - 3, 8.5, shY); c.quadraticCurveTo(10 + belly, (shY + hipY) / 2 + 2, 7.5 + belly * .5, hipY + 2); c.lineTo(-8, hipY + 2); c.quadraticCurveTo(-10, (shY + hipY) / 2, -8.5, shY); c.closePath();
  c.fillStyle = L.top; c.fill(); c.save(); c.strokeStyle = shade(L.top, -.4); c.lineWidth = 1.2; c.stroke(); c.restore(); c.clip();
  if(L.stripe){ c.fillStyle = L.stripe; for(let y = shY + 2.5; y < hipY + 2; y += 3.6) c.fillRect(-14, y, 30, 1.5); }
  if(L.ribs){ c.fillStyle = 'rgba(255,255,255,.045)'; for(let x = -10; x < 14; x += 2.6) c.fillRect(x, shY - 2, .8, 30); }
  if(L.camo){ const R0 = rng(7); for(let i = 0; i < 14; i++){ c.fillStyle = ['#4F5A33', '#8A8B5C', '#3D4428'][i % 3]; ell(c, -10 + R0() * 22, shY + R0() * 18, 2 + R0() * 3, 1.4 + R0() * 2, R0()); c.fill(); } }
  if(L.blazer){ c.fillStyle = L.blazer; c.fillRect(-14, shY - 4, 13.4, 34); c.fillRect(4.6, shY - 4, 14, 34); c.fillStyle = shade(L.blazer, -.25); c.beginPath(); c.moveTo(-.6, shY - 1); c.lineTo(3, shY + 9); c.lineTo(-.6, shY + 13); c.closePath(); c.fill(); c.beginPath(); c.moveTo(4.6, shY - 1); c.lineTo(1.4, shY + 9); c.lineTo(4.6, shY + 13); c.closePath(); c.fill(); c.fillStyle = '#E8B84A'; c.beginPath(); c.arc(-3, shY + 10, .8, 0, 7); c.fill(); }
  if(L.tie){ c.fillStyle = L.tie; c.beginPath(); c.moveTo(.6, shY - 1); c.lineTo(3, shY - 1); c.lineTo(3.4, shY + 11); c.lineTo(1.8, shY + 13.5); c.lineTo(.2, shY + 11); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(43,29,20,.12)'; c.fillRect(-12, hipY - 3, 30, 6);
  c.restore();
  if(L.scarf){ c.fillStyle = L.scarf; rr(c, -7, shY - 3.5, 15, 4.5, 2.2); c.fill(); c.save(); c.translate(5, shY); c.rotate(.15 + Math.sin(t * 2) * .05); rr(c, -2, 0, 4.4, 11, 2); c.fill(); c.restore(); }
  if(L.collar){ c.strokeStyle = L.collar; c.lineWidth = 1.6; c.beginPath(); c.arc(1.5, shY - 1, 4.2, .15 * Math.PI, .85 * Math.PI); c.stroke(); }
  c.fillStyle = L.pants; rr(c, -8, hipY - 1.5, 16 + belly * .4, 6, 2.5); c.fill();
  leg(2.5, legA, L.pants);
  if(L.skirt){ c.fillStyle = L.skirt; c.beginPath(); c.moveTo(-8.6, hipY - 3); c.lineTo(8.6 + belly * .5, hipY - 3); c.quadraticCurveTo(11, hipY + 6, 12.5, hipY + 13); c.quadraticCurveTo(1.5, hipY + 16.5, -10.5, hipY + 13); c.quadraticCurveTo(-10, hipY + 6, -8.6, hipY - 3); c.closePath(); c.fill(); edge(c, L.skirt, .9); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = .8; c.beginPath(); c.moveTo(-3, hipY); c.lineTo(-5, hipY + 13); c.moveTo(4, hipY); c.lineTo(6, hipY + 13); c.stroke(); }
  const hx = 1.5 + (st.lean || 0), hy = shY - 14 + Math.sin(t * 2.2 + 1) * .3 * (1 - mv);
  drawHead(c, L, st, hx, hy);
  arm(4.5, armA + (st.frontArm || 0), sleeve, L.skin, st.prop);
  c.restore();
}
function drawHead(c, L, st, hx, hy){
  const ex = st.expr || 'happy', t = st.t || 0;
  if(L.hairStyle === 'pony'){ const sw = Math.sin((st.walk || 0) + t) * .18 + (st.move || 0) * .25; c.save(); c.translate(hx - 11, hy - 7); c.rotate(.35 + sw); c.fillStyle = L.pony || L.hair; c.beginPath(); c.moveTo(-2, 0); c.quadraticCurveTo(-9, 8, -6, 20); c.quadraticCurveTo(-1, 14, 3, 2); c.closePath(); c.fill(); c.restore(); c.fillStyle = L.scrunchie || '#E8593C'; ell(c, hx - 11.5, hy - 7, 2.2, 2.6); c.fill(); }
  if(L.hairStyle === 'messy'){ c.fillStyle = L.hair; ell(c, hx - 4, hy - 1, 13, 13.5); c.fill(); }
  if(L.hairStyle === 'long'){ const sw = Math.sin((st.walk || 0) + t) * .6 + (st.move || 0) * 1.2; c.fillStyle = L.hair; c.beginPath(); c.moveTo(hx - 13, hy - 6); c.quadraticCurveTo(hx - 18 - sw, hy + 14, hx - 13 - sw, hy + 27); c.lineTo(hx - 1, hy + 24); c.quadraticCurveTo(hx + 3, hy + 10, hx + 2, hy); c.closePath(); c.fill();
    if(L.streak){ c.strokeStyle = L.streak; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx - 11, hy - 2); c.quadraticCurveTo(hx - 15 - sw, hy + 12, hx - 11 - sw, hy + 24); c.moveTo(hx - 6, hy); c.quadraticCurveTo(hx - 8 - sw * .6, hy + 13, hx - 5 - sw * .6, hy + 23); c.stroke(); } }
  if(L.hairStyle === 'bun'){ c.fillStyle = L.hair; ell(c, hx - 9, hy - 14, 6.5, 6); c.fill(); c.fillStyle = shade(L.hair, .15); ell(c, hx - 10, hy - 16, 3, 2); c.fill(); }
  if(L.hairStyle === 'short'){ c.fillStyle = L.hair; ell(c, hx - 3, hy - 2, 13.5, 13.5); c.fill(); }
  if(L.hairStyle === 'curly'){ c.fillStyle = L.hair; ell(c, hx - 3, hy - 2, 14, 14); c.fill(); }
  const earX = hx - 12.6, earY = hy + 3;
  c.fillStyle = shade(L.skin, -.05); ell(c, earX, earY, 2.9, 3.7); c.fill(); c.fillStyle = shade(L.skin, -.2); ell(c, earX - .3, earY + .2, 1.3, 2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.arc(hx, hy, 14, 0, Math.PI * 2); c.fill(); ell(c, hx + 2.2, hy + 5.2, 11.6, 9.2); c.fill();
  c.fillStyle = 'rgba(255,255,255,.14)'; ell(c, hx + 1, hy - 6.5, 8, 4.4, -.2); c.fill();
  c.fillStyle = 'rgba(120,60,40,.08)'; ell(c, hx - 6, hy + 5, 5, 7); c.fill();
  if(L.pearl){ c.fillStyle = '#FFFDF7'; c.beginPath(); c.arc(earX + .2, earY + 4.6, 1.5, 0, 7); c.fill(); c.strokeStyle = 'rgba(150,130,110,.7)'; c.lineWidth = .5; c.stroke(); }
  const eY = hy + 1.8, e1 = hx, e2 = hx + 7.6;
  const blink = st.blink > 0, big = ex === 'surprised' ? 1.22 : 1;
  c.fillStyle = L.eye || '#2A1A14';
  [e1, e2].forEach((x, i) => {
    if(blink || ex === 'joy' || ex === 'sleep'){ c.strokeStyle = L.eye; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); if(ex === 'joy'){ c.arc(x, eY + 1, 2.2, Math.PI * 1.1, Math.PI * 1.9); } else { c.moveTo(x - 2, eY); c.lineTo(x + 2, eY); } c.stroke(); return; }
    ell(c, x, eY, 2.05 * big * (i ? .9 : 1), 2.95 * big); c.fill(); c.fillStyle = '#fff'; ell(c, x + .75, eY - 1.1, .8, .95); c.fill(); ell(c, x - .6, eY + 1.2, .35, .35); c.fill(); c.fillStyle = L.eye;
    if(L.lashes){ c.strokeStyle = L.eye; c.lineWidth = 1; c.beginPath(); c.arc(x, eY + .3, 2.8 * big, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.beginPath(); c.moveTo(x + 2.3, eY - 1.7); c.lineTo(x + 3.4, eY - 2.3); c.stroke(); }
  });
  if(ex === 'sad' || ex === 'cry'){ c.fillStyle = 'rgba(120,190,240,.85)'; ell(c, e1 - .5, eY + 4.6 + ((t * 2) % 1) * 3, .9, 1.4); c.fill(); }
  c.strokeStyle = shade(L.hair, .05); c.lineWidth = 1.3; c.lineCap = 'round';
  const browT = { happy: [0, 0], smirk: [-.35, .1], surprised: [-.25, .25], worried: [.35, -.35], angry: [-.45, .45], joy: [0, 0], sad: [.4, -.4], cry: [.4, -.4], think: [-.2, .35], determined: [-.35, .35] }[ex] || [0, 0];
  [[e1, browT[0]], [e2, browT[1]]].forEach(([x, a], i) => { const by = eY - 5.6 - (ex === 'surprised' ? 1.3 : 0) - (ex === 'smirk' && i ? 1.2 : 0); c.save(); c.translate(x, by); c.rotate(a * (i ? 1 : -1) * .9); c.beginPath(); c.moveTo(-2.1, 0); c.lineTo(2.1, 0); c.stroke(); c.restore(); });
  c.fillStyle = 'rgba(232,120,110,.3)'; ell(c, hx - 3, hy + 7, 2.6, 1.6); c.fill(); ell(c, hx + 10, hy + 6.4, 2.2, 1.4); c.fill();
  c.fillStyle = shade(L.skin, -.16); ell(c, hx + 5, hy + 5.6, 1.2, .8); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; ell(c, hx + 4.8, hy + 5.2, .5, .3); c.fill();
  const mx = hx + 4.4, my = hy + 9.2;
  c.strokeStyle = '#5A2A22'; c.lineWidth = 1.2;
  const open = st.talk && Math.sin(t * 22) > -.2;
  if(open || ex === 'surprised'){ c.fillStyle = '#7A2E2A'; ell(c, mx, my + .5, ex === 'surprised' ? 1.9 : 2.3, open ? 1.7 + Math.abs(Math.sin(t * 22)) * .8 : 2.2); c.fill(); c.fillStyle = '#E58A8A'; ell(c, mx, my + 1.4, 1.3, .6); c.fill(); }
  else if(ex === 'smirk'){ c.beginPath(); c.moveTo(mx - 2.5, my + .5); c.quadraticCurveTo(mx + 1, my + 1.6, mx + 3.2, my - 1); c.stroke(); }
  else if(ex === 'worried' || ex === 'sad' || ex === 'cry'){ c.beginPath(); c.arc(mx, my + 2.2, 2.2, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
  else if(ex === 'angry' || ex === 'determined' || ex === 'think'){ c.beginPath(); c.moveTo(mx - 2.2, my + .8); c.lineTo(mx + 2.2, my + .8); c.stroke(); }
  else { c.beginPath(); c.arc(mx, my - .8, 2.6, Math.PI * .15, Math.PI * .85); c.stroke(); }
  if(L.cig && !st.noCig){ c.fillStyle = '#F4F1EA'; c.save(); c.translate(mx + 2.2, my + .6); c.rotate(.18); c.fillRect(0, -.6, 5, 1.3); c.fillStyle = '#E2873A'; c.fillRect(5, -.6, 1, 1.3); c.restore(); }
  if(L.age){ c.strokeStyle = 'rgba(120,70,50,.35)'; c.lineWidth = .6; c.beginPath(); c.moveTo(e2 + 3.4, eY + 1); c.lineTo(e2 + 5, eY + 2.4); c.moveTo(e2 + 3.4, eY + 2.6); c.lineTo(e2 + 4.8, eY + 4); c.moveTo(hx + 1, hy + 8); c.quadraticCurveTo(hx + 2, hy + 11, hx + 4, hy + 12); c.stroke(); }
  if(L.hoops){ c.strokeStyle = '#E8B84A'; c.lineWidth = .9; c.beginPath(); c.arc(earX + .2, earY + 5.5, 2.2, 0, 7); c.stroke(); }
  if(L.glasses){ c.strokeStyle = '#2B1D14'; c.lineWidth = 1; rr(c, e1 - 3, eY - 2.8, 6, 5.4, 1.6); c.stroke(); rr(c, e2 - 3, eY - 2.8, 6, 5.4, 1.6); c.stroke(); c.beginPath(); c.moveTo(e1 + 3, eY - .8); c.lineTo(e2 - 3, eY - .8); c.moveTo(e1 - 3, eY - .5); c.lineTo(earX + 1.5, earY - 2); c.stroke(); }
  c.fillStyle = L.hair;
  if(L.hairStyle === 'messy'){ c.beginPath(); c.moveTo(hx - 14, hy + 3); c.quadraticCurveTo(hx - 16, hy - 14, hx - 2, hy - 16); c.quadraticCurveTo(hx + 12, hy - 17, hx + 15.5, hy - 5);
    c.lineTo(hx + 12.5, hy - 5.5); c.lineTo(hx + 13, hy - 1.5); c.lineTo(hx + 9.5, hy - 5); c.lineTo(hx + 8, hy - 1); c.lineTo(hx + 5, hy - 5.5); c.lineTo(hx + 2.5, hy - 2.5); c.lineTo(hx + .5, hy - 6); c.lineTo(hx - 3, hy - 4); c.lineTo(hx - 6, hy + 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(hx - 6, hy - 15); c.lineTo(hx - 8, hy - 20); c.lineTo(hx - 3, hy - 16); c.lineTo(hx + 1, hy - 20.5); c.lineTo(hx + 3, hy - 16); c.fill();
    c.strokeStyle = shade(L.hair, .22); c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 2, hy - 13); c.quadraticCurveTo(hx + 5, hy - 13.5, hx + 9, hy - 9); c.moveTo(hx - 8, hy - 9); c.quadraticCurveTo(hx - 5, hy - 13, hx, hy - 14); c.stroke(); }
  else if(L.hairStyle === 'short'){ c.beginPath(); c.moveTo(hx - 14, hy + 2); c.quadraticCurveTo(hx - 15, hy - 14, hx - 1, hy - 15.5); c.quadraticCurveTo(hx + 12, hy - 16, hx + 14.5, hy - 5); c.quadraticCurveTo(hx + 6, hy - 9, hx - 4, hy - 7.5); c.quadraticCurveTo(hx - 7, hy - 4, hx - 8, hy + 2); c.closePath(); c.fill(); c.strokeStyle = shade(L.hair, .2); c.lineWidth = .9; c.beginPath(); c.moveTo(hx - 6, hy - 12); c.quadraticCurveTo(hx + 2, hy - 15, hx + 9, hy - 10); c.stroke(); }
  else if(L.hairStyle === 'pony' || L.hairStyle === 'long' || L.hairStyle === 'bun'){ c.beginPath(); c.moveTo(hx - 13.5, hy + 4); c.quadraticCurveTo(hx - 15, hy - 13, hx, hy - 15); c.quadraticCurveTo(hx + 12, hy - 15.5, hx + 14.5, hy - 4); c.quadraticCurveTo(hx + 8, hy - 11, hx - 1, hy - 9); c.quadraticCurveTo(hx - 5, hy - 6, hx - 7, hy + 3); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 3, hy - 13); c.quadraticCurveTo(hx + 6, hy - 14, hx + 10, hy - 9); c.stroke(); }
  else if(L.hairStyle === 'curly'){ const R = rng(11); for(let i = 0; i < 16; i++){ const a = Math.PI * (1.02 + i / 15 * .98), r = 13.5 + R() * 2; c.beginPath(); c.arc(hx + Math.cos(a) * r * .95, hy - 1 + Math.sin(a) * r, 3.4 + R() * 1.2, 0, 7); c.fill(); } c.beginPath(); c.arc(hx - 1, hy - 7, 10, Math.PI, 0); c.fill();
    c.fillStyle = shade(L.hair, .2); for(let i = 0; i < 6; i++){ c.beginPath(); c.arc(hx - 8 + i * 3.6, hy - 13 + Math.sin(i) * 1.5, 1, 0, 7); c.fill(); } }
  else if(L.hairStyle === 'cap'){ c.fillStyle = L.hair; c.beginPath(); c.arc(hx - 4, hy + 1, 9, Math.PI * .5, Math.PI * 1.3); c.fill();
    c.fillStyle = L.cap; c.beginPath(); c.arc(hx, hy - 3, 14.6, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill(); c.fillStyle = shade(L.cap, -.2); rr(c, hx - 25, hy - 5.5, 13, 3.2, 1.5); c.fill(); c.fillStyle = shade(L.cap, .25); ell(c, hx, hy - 17.4, 2, 1.2); c.fill(); c.fillStyle = '#F4EFE6'; rr(c, hx - 13, hy - 7, 3.5, 2.5, 1); c.fill(); }
}

/* ================= Dayla ================= */
function drawDog(c, st){
  const D = DOG, mv = st.move || 0, w = st.walk || 0, t = st.t || 0;
  const bob = -Math.abs(Math.sin(w)) * 1.6 * mv + Math.sin(t * 3) * .35 * (1 - mv);
  const eat = st.eat || 0, wag = Math.sin(t * 18) * .5;
  const leg = (x, a, col, sock) => { c.save(); c.translate(x, -11 + bob); c.rotate(a); c.fillStyle = col; rr(c, -2.3, 0, 4.6, 11, 2.2); c.fill(); if(sock){ c.fillStyle = D.white; rr(c, -2.3, 6.5, 4.6, 4.8, 2.2); c.fill(); } c.restore(); };
  const s = Math.sin(w) * .6 * mv;
  leg(-9, -s, D.dark, false); leg(8, s, D.dark, true);
  c.save(); c.translate(-15, -18 + bob); c.rotate(-.6 + wag * (st.happy ? 1 : .3)); c.fillStyle = D.base; rr(c, -1.6, -5, 3.4, 6, 1.7); c.fill(); c.restore();
  c.fillStyle = D.base; ell(c, 0, -15 + bob, 15.5, 8.6); c.fill();
  c.fillStyle = D.light; ell(c, -1, -19 + bob, 11, 3.6); c.fill();
  c.fillStyle = D.white; ell(c, 9.5, -12 + bob, 6.2, 6.4); c.fill();
  c.strokeStyle = '#1D1B1E'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(4, -23 + bob); c.quadraticCurveTo(5.5, -15 + bob, 3, -7.5 + bob); c.stroke(); c.lineWidth = 2.4; c.beginPath(); c.moveTo(4, -21 + bob); c.lineTo(13, -18 + bob); c.stroke();
  c.fillStyle = '#9AA0A6'; ell(c, 3, -22.5 + bob, 1.3, 1.3); c.fill();
  leg(-5, s, D.base, false); leg(12, -s, D.base, true);
  const hx = 15 + (eat ? 4 : 0), hy = -27 + bob + (eat ? 13 + Math.sin(t * 24) * 1.4 : 0) + (st.headTilt || 0);
  c.save(); c.translate(hx, hy); c.rotate(eat ? .55 : (st.tilt || 0));
  c.fillStyle = '#FFFDF6'; for(let i = 0; i < 7; i++){ const a = Math.PI * (.35 + i * .085); c.beginPath(); c.arc(-3 + Math.cos(a) * 9, 2 + Math.sin(a) * 7, 1.15, 0, 7); c.fill(); }
  const ew = Math.sin(t * 5) * .05 + (st.earsBack ? -.4 : 0);
  [[-4.5, -.32 + ew], [4.2, .12 - ew]].forEach(([x, a], i) => { c.save(); c.translate(x, -8); c.rotate(a); c.fillStyle = i ? D.base : D.dark; c.beginPath(); c.moveTo(-4.4, 2); c.quadraticCurveTo(-3.8, -9, 0, -15); c.quadraticCurveTo(3.8, -9, 4.4, 2); c.closePath(); c.fill(); c.fillStyle = D.pink; c.beginPath(); c.moveTo(-2.4, 0); c.quadraticCurveTo(-2, -7, 0, -11.5); c.quadraticCurveTo(2, -7, 2.4, 0); c.closePath(); c.fill(); c.restore(); });
  c.scale(1.14, 1.14); c.fillStyle = D.base; ell(c, 0, 0, 10.2, 9.4); c.fill();
  c.fillStyle = D.light; ell(c, -2, -4.5, 6, 3); c.fill();
  c.fillStyle = D.white; c.beginPath(); c.moveTo(1.2, -9.2); c.quadraticCurveTo(3.8, -9.5, 3.6, -4); c.lineTo(4.6, 3); c.lineTo(.9, 3); c.quadraticCurveTo(-.2, -4, 1.2, -9.2); c.fill();
  ell(c, 6, 4, 6, 4.4); c.fill();
  c.fillStyle = D.nose; ell(c, 10.3, 2, 2.6, 1.9); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; ell(c, 9.8, 1.3, .9, .5); c.fill();
  [[-1.5, -1.5, 3.4], [7.4, -2.2, 3]].forEach(([x, y, r]) => { if(st.blink > 0 || st.content){ c.strokeStyle = D.eye; c.lineWidth = 1.2; c.beginPath(); if(st.content){ c.arc(x, y + 1, r * .8, Math.PI * 1.1, Math.PI * 1.9); } else { c.moveTo(x - r, y); c.lineTo(x + r, y); } c.stroke(); return; } c.fillStyle = '#FFF6EC'; ell(c, x, y, r + .6, r + .5); c.fill(); c.fillStyle = D.iris; ell(c, x + .5, y, r, r); c.fill(); c.fillStyle = D.eye; ell(c, x + .6, y, r * .62, r * .62); c.fill(); c.fillStyle = '#fff'; ell(c, x + 1.4, y - 1.1, r * .3, r * .3); c.fill(); });
  c.strokeStyle = D.nose; c.lineWidth = 1; c.beginPath(); c.moveTo(10, 3.8); c.quadraticCurveTo(8, 7, 4.5, 6.2); c.stroke();
  if(st.happy || st.bark){ c.fillStyle = '#E86F79'; ell(c, 6.5, 7.6 + (st.bark ? 1 : 0), 2.2, 2.6 + (st.bark ? 1 : 0)); c.fill(); }
  if(st.duck){ c.save(); c.translate(11, 5); c.rotate(st.shake ? Math.sin(t * 40) * .5 : .2); c.scale(.42, .42); drawDuck(c, t); c.restore(); }
  c.restore();
  if(eat && st.bowl && !st.noBowl){ drawBowl(c, 21.5, -2.5, st.bowlFull !== false); }
}
function drawBowl(c, x, y, full){
  c.fillStyle = '#C9D6E6'; rr(c, x - 7.5, y - 2.5, 15, 5, 2.5); c.fill(); c.fillStyle = '#8FA4BF'; rr(c, x - 6.5, y - 3.5, 13, 2, 1); c.fill();
  if(full){ c.fillStyle = '#D9B98A'; ell(c, x, y - 3.4, 5.6, 1.4); c.fill(); c.fillStyle = '#F2EBDC'; ell(c, x - 2, y - 3.9, 1.3, .6); c.fill(); ell(c, x + 2.2, y - 3.6, 1, .5); c.fill(); }
}
WD.drawBowl = drawBowl;
function drawDuck(c, t){
  c.fillStyle = '#E8611E'; [[-12, 6], [-6, 8]].forEach(([x, y]) => { ell(c, x, y, 5, 2.6, -.2); c.fill(); });
  c.fillStyle = '#fff'; [[-13, 5.5], [-11, 7], [-7, 7.5], [-5, 9]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, .55, 0, 7); c.fill(); });
  c.fillStyle = '#F7D23E'; ell(c, -2, 0, 14, 8); c.fill(); ell(c, 9, -5, 7.5, 7); c.fill();
  c.fillStyle = '#FBE27A'; ell(c, -4, -3, 7, 3, -.1); c.fill();
  c.fillStyle = '#F7D23E'; ell(c, -1, 3, 7, 3.6, .3); c.fill();
  c.fillStyle = '#F28A2E'; ell(c, 17, -3, 6.5, 3.4, .1); c.fill(); c.strokeStyle = '#F7D23E'; c.lineWidth = .8; c.beginPath(); c.moveTo(16, -5); c.lineTo(18, -4.6); c.moveTo(16, -2.4); c.lineTo(18, -2); c.stroke();
  c.fillStyle = '#1A1414'; ell(c, 11.4, -7, 1.3, 1.9, .3); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(11.8, -7.6, .45, 0, 7); c.fill();
  c.strokeStyle = '#FFFDF4'; c.lineWidth = 1; c.beginPath(); c.moveTo(7, -11.5); c.quadraticCurveTo(6, -15, 3.5, -15.5); c.moveTo(8, -11.6); c.quadraticCurveTo(9, -15.5, 11.5, -15); c.stroke();
}
WD.drawDuck = drawDuck;

/* ================= Alejandro (long-body chihuahua) ================= */
function drawChi(c, st){
  const D = CHI, mv = st.move || 0, w = st.walk || 0, t = st.t || 0;
  const jit = st.nervous ? Math.sin(t * 24) * .22 : 0;  // a small chihuahua shiver, not a full shake
  const bob = -Math.abs(Math.sin(w)) * 1.4 * mv + Math.sin(t * 4) * .3 * (1 - mv);
  c.save(); c.translate(jit, 0);
  const s = Math.sin(w) * .7 * mv;
  const leg = (x, a, col) => { c.save(); c.translate(x, -8.5 + bob); c.rotate(a); c.fillStyle = col; rr(c, -1.5, 0, 3, 8.6, 1.5); c.fill(); c.fillStyle = D.cream; ell(c, .3, 8.4, 2.1, 1.2); c.fill(); c.restore(); };
  leg(-15, -s, D.dark); leg(9, s, D.dark);
  // tail: thin and curled up
  c.save(); c.translate(-21, -14 + bob); c.rotate(-.9 + Math.sin(t * (st.happy ? 16 : 5)) * (st.happy ? .4 : .12)); c.strokeStyle = D.base; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-5, -6, -1, -11); c.stroke(); c.restore();
  // the long body
  c.fillStyle = D.base; rr(c, -22, -20 + bob, 38, 12, 6); c.fill();
  c.fillStyle = D.light; rr(c, -18, -20 + bob, 30, 4, 2); c.fill();
  c.fillStyle = D.cream; ell(c, 12, -12 + bob, 5, 4.6); c.fill(); rr(c, -14, -11 + bob, 22, 3, 1.5); c.fill();
  leg(-11, s, D.base); leg(13, -s, D.base);
  // head
  const hx = 20, hy = -24 + bob + (st.sniff ? 7 + Math.sin(t * 30) * 1 : 0);
  c.save(); c.translate(hx, hy); c.rotate((st.sniff ? .35 : 0) + (st.tilt || 0));
  // huge ears
  const ew = Math.sin(t * 6) * .04 + (st.earsBack ? -.5 : 0);
  [[-5, -.5 + ew], [3, .2 - ew]].forEach(([x, a], i) => { c.save(); c.translate(x, -5); c.rotate(a); c.fillStyle = i ? D.base : D.dark; c.beginPath(); c.moveTo(-5.5, 2); c.quadraticCurveTo(-6.5, -10, 0, -17); c.quadraticCurveTo(6, -10, 5, 2); c.closePath(); c.fill(); c.fillStyle = D.pink; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-3.6, -8, 0, -12.5); c.quadraticCurveTo(3, -8, 2.6, 0); c.closePath(); c.fill(); c.restore(); });
  c.fillStyle = D.base; ell(c, 0, 0, 8.6, 8); c.fill();
  c.fillStyle = D.light; ell(c, -1, -4, 5, 2.4); c.fill();
  c.fillStyle = D.cream; c.beginPath(); c.moveTo(1.6, -8); c.quadraticCurveTo(4, -8.2, 3.8, -3); c.lineTo(4.4, 2); c.lineTo(1, 2); c.quadraticCurveTo(.4, -3, 1.6, -8); c.fill(); ell(c, 6.6, 3.2, 4.6, 3.4); c.fill();
  c.fillStyle = D.nose; ell(c, 10.4, 2, 1.8, 1.4); c.fill();
  // bulgy eyes
  [[-1, -1, 3.4], [6, -1.6, 3]].forEach(([x, y, r]) => { if(st.blink > 0){ c.strokeStyle = D.eye; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.stroke(); return; } c.fillStyle = '#FFFBF2'; ell(c, x, y, r + .7, r + .7); c.fill(); c.fillStyle = D.eye; ell(c, x + .6, y + .2, r * .78, r * .82); c.fill(); c.fillStyle = '#fff'; ell(c, x + 1.6, y - 1, r * .32, r * .32); c.fill(); ell(c, x - .4, y + 1.3, r * .14, r * .14); c.fill(); });
  if(st.nervous){ c.strokeStyle = D.eye; c.lineWidth = .9; c.beginPath(); c.moveTo(-4, -6.5); c.lineTo(1.5, -5); c.moveTo(4.5, -5.5); c.lineTo(9, -7); c.stroke(); }
  c.strokeStyle = D.nose; c.lineWidth = .9; c.beginPath(); c.moveTo(9.6, 3.4); c.quadraticCurveTo(8, 5.6, 5, 5.2); c.stroke();
  if(st.talk && Math.sin(t * 22) > -.2 || st.bark){ c.fillStyle = '#C0505A'; ell(c, 7, 6.2, 2, 1.6); c.fill(); }
  if(st.happy && !st.talk){ c.fillStyle = '#E86F79'; ell(c, 7, 6.6, 1.5, 2); c.fill(); }
  c.restore();
  if(st.nervous){ c.fillStyle = 'rgba(120,190,240,.85)'; const u = (t * 1.5) % 1; ell(c, 28, -36 + u * 6, 1.4, 2.2); c.fill(); }
  c.restore();
}

/* ================= Chunkers (English bulldog, one tooth out) ================= */
const BULL = { base: '#D9A066', dark: '#B9804C', white: '#FBF4EA', pink: '#E8A39A', nose: '#2B1D14', eye: '#2A1A14' };
function drawBull(c, st){
  const D = BULL, mv = st.move || 0, w = st.walk || 0, t = st.t || 0;
  const bob = -Math.abs(Math.sin(w)) * 1.2 * mv + Math.sin(t * 1.6) * .4 * (1 - mv) + (st.squash || 0);
  const s = Math.sin(w) * .5 * mv, sit = !!st.sit;
  const leg = (x, a, col, h) => { c.save(); c.translate(x, -(h || 9) + bob); c.rotate(a); c.fillStyle = col; rr(c, -3.4, 0, 6.8, h || 9.5, 3); c.fill(); c.fillStyle = D.white; ell(c, .8, (h || 9.5) - .2, 3.8, 1.9); c.fill(); c.restore(); };
  if(!sit){ leg(-12, -s, D.dark); leg(9, s, shade(D.white, -.12)); }
  // stubby tail
  c.save(); c.translate(sit ? -15 : -21, (sit ? -4 : -17) + bob); c.rotate(-.4 + Math.sin(t * (st.happy ? 14 : 3)) * (st.happy ? .45 : .1)); c.fillStyle = D.base; ell(c, 0, 0, 3.2, 2.4); c.fill(); c.restore();
  if(sit){
    c.fillStyle = D.base; c.beginPath(); c.moveTo(-15, 0); c.quadraticCurveTo(-21, -22, -5, -29 + bob); c.quadraticCurveTo(12, -30 + bob, 14, 0); c.closePath(); c.fill(); edge(c, D.base, .7);
    c.fillStyle = D.white; ell(c, 6, -13, 7.5, 12); c.fill();
    c.fillStyle = D.dark; ell(c, -9, -2, 7, 3.4); c.fill();
    [4, 11].forEach(x => { c.fillStyle = x > 6 ? D.white : shade(D.white, -.1); rr(c, x - 3, -12, 6, 12, 3); c.fill(); c.fillStyle = D.white; ell(c, x + .6, -.4, 3.8, 1.8); c.fill(); });
  } else {
    c.fillStyle = D.base; ell(c, -2, -15 + bob, 19.5, 10.5); c.fill(); edge(c, D.base, .7);
    c.fillStyle = D.white; ell(c, 8, -11 + bob, 10, 7.6); c.fill(); ell(c, -5, -7.6 + bob, 9, 2.8); c.fill();
    c.fillStyle = 'rgba(120,70,40,.18)'; c.beginPath(); c.arc(-8, -19 + bob, 6, Math.PI * 1.1, Math.PI * 1.7); c.fill();
    leg(-6, s, D.base); leg(13, -s, D.white);
  }
  // the big head: low, wide and forward
  const hx = sit ? 9 : 19, hy = (sit ? -33 : -22) + bob + (st.tilt || 0);
  c.save(); c.translate(hx, hy); c.rotate(st.nod ? Math.sin(t * 9) * .08 : 0);
  [[-9.5, -.6], [8, .5]].forEach(([x, a], i) => { c.save(); c.translate(x, -9); c.rotate(a); c.fillStyle = i ? D.base : D.dark; ell(c, 0, 0, 4.6, 3.4); c.fill(); c.fillStyle = D.pink; ell(c, .5, .7, 2.4, 1.5); c.fill(); c.restore(); });
  c.fillStyle = D.base; ell(c, 0, 0, 12.8, 11); c.fill();
  c.fillStyle = D.white; c.beginPath(); c.moveTo(1.4, -11); c.quadraticCurveTo(5, -11, 5, -4); c.lineTo(5.6, 2); c.lineTo(-.6, 2); c.quadraticCurveTo(-1.6, -4, 1.4, -11); c.fill();
  ell(c, 4, 5, 11.4, 6.8); c.fill();
  c.strokeStyle = 'rgba(120,70,40,.42)'; c.lineWidth = .8; [[-3, -6.5], [-2, -4.6]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x - 3, y); c.quadraticCurveTo(x + 2, y - 1.5, x + 7, y); c.stroke(); });
  c.beginPath(); c.moveTo(-5, 2); c.quadraticCurveTo(-6, 7, -3, 10); c.stroke();
  // eyes: set wide, a little droopy
  [[-4, -1.6, 2.5], [7.5, -2.4, 2.2]].forEach(([x, y, r]) => {
    if(st.blink > 0 || st.sleepy){ c.strokeStyle = D.eye; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.stroke(); return; }
    c.fillStyle = '#FFF6EC'; ell(c, x, y, r + .5, r + .4); c.fill(); c.fillStyle = D.eye; ell(c, x + .4, y + .2, r * .72, r * .76); c.fill(); c.fillStyle = '#fff'; ell(c, x + 1.1, y - .8, r * .28, r * .28); c.fill();
    c.fillStyle = D.base; c.beginPath(); c.ellipse(x, y - r * .6, r + .9, r * .6, 0, Math.PI, 0); c.fill(); });
  // wide nose up high, then the underbite with the famous tooth
  c.fillStyle = D.nose; ell(c, 8.6, 1.2, 4.2, 2.6); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; ell(c, 7.8, .4, 1.3, .6); c.fill();
  c.fillStyle = shade(D.white, -.06); ell(c, 5.5, 10, 9, 3.6); c.fill();
  c.strokeStyle = shade(D.white, -.35); c.lineWidth = .8; c.beginPath(); c.moveTo(-1.5, 8.2); c.quadraticCurveTo(5, 10.6, 13.5, 7.4); c.stroke();
  if(st.happy || st.talk && Math.sin(t * 22) > -.2 || st.bark){ c.fillStyle = '#E86F79'; ell(c, 7, 11, 2.4, 2 + (st.bark ? 1 : 0)); c.fill(); }
  c.fillStyle = '#FFFDF6'; c.beginPath(); c.moveTo(8.6, 8.8); c.lineTo(9.8, 4.8); c.lineTo(11, 8.8); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,100,80,.6)'; c.lineWidth = .4; c.stroke();
  if(st.drool){ c.fillStyle = 'rgba(160,210,240,.85)'; const u = (t * .8) % 1; ell(c, 2.5, 12 + u * 5, 1, 1.6 + u * 1.5); c.fill(); }
  c.restore();
  if(st.zzz){ c.fillStyle = '#3E6FB5'; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; const u = (t * .7) % 1; c.globalAlpha = 1 - u; c.fillText('z', hx + 10 + u * 6, hy - 14 - u * 10); c.globalAlpha = 1; }
}

/* ================= cats (agents, the Sergeant, Kairos) ================= */
function drawCat(c, st){
  const L = st.look || CATS.agent, t = st.t || 0, mv = st.move || 0, w = st.walk || 0;
  if(st.pose === 'sit') return drawCatSit(c, st, L);
  const bob = -Math.abs(Math.cos(w)) * 2 * mv + Math.sin(t * 2.4) * .6 * (1 - mv) + (st.squash || 0);
  const sz = L.size || 1; c.save(); c.scale(sz, sz);
  const sw = Math.sin(w) * .6 * mv;
  const fur = L.fur, dark = L.dark, belly = L.light;
  // tail
  c.save(); c.translate(-8, -12 + bob); c.rotate(-.5 + Math.sin(t * 2.2) * .18); c.strokeStyle = fur; c.lineWidth = L.fluffy ? 6 : 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -2, -12, -16); c.quadraticCurveTo(-11, -22, -6, -21); c.stroke(); if(L.stripes){ c.strokeStyle = L.stripes; c.lineWidth = 1.6; for(let i = 0; i < 3; i++){ c.beginPath(); c.arc(-10 - i * 1.5, -6 - i * 5, 3, 0, Math.PI); c.stroke(); } } c.restore();
  // legs
  [[-4, -sw, dark], [4, sw, fur]].forEach(([x, a, col]) => { c.save(); c.translate(x, -9 + bob); c.rotate(a); c.fillStyle = col; rr(c, -3, 0, 6, 9.5, 3); c.fill(); c.fillStyle = belly; ell(c, 1.2, 9.3, 3.8, 2.2); c.fill(); c.restore(); });
  // body
  const bw = L.fluffy ? 13 : L.slim ? 8.5 : 10;
  c.fillStyle = fur; ell(c, 0, -19 + bob, bw, 12); c.fill();
  c.fillStyle = belly; ell(c, 2.5, -17 + bob, bw * .58, 9); c.fill();
  if(L.stripes && !L.suit){ c.strokeStyle = L.stripes; c.lineWidth = 1.6; for(let i = 0; i < 3; i++){ c.beginPath(); c.moveTo(-bw + 1.5, -26 + i * 5 + bob); c.quadraticCurveTo(-bw + 5, -24 + i * 5 + bob, -bw + 6, -27 + i * 5 + bob); c.stroke(); } }
  if(L.suit){ c.save(); ell(c, 0, -19 + bob, bw + .4, 12.4); c.clip(); c.fillStyle = L.suit; c.fillRect(-14, -34 + bob, 28, 28); c.fillStyle = '#F4F1EA'; c.beginPath(); c.moveTo(-1, -31 + bob); c.lineTo(8, -31 + bob); c.lineTo(4, -15 + bob); c.closePath(); c.fill(); c.fillStyle = L.tie; c.beginPath(); c.moveTo(2.4, -30 + bob); c.lineTo(5.2, -30 + bob); c.lineTo(5.6, -19 + bob); c.lineTo(3.8, -16.5 + bob); c.lineTo(2, -19 + bob); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = .8; c.beginPath(); c.moveTo(-1, -31 + bob); c.lineTo(3.8, -15 + bob); c.stroke(); c.restore(); }
  if(L.gown){ c.fillStyle = L.gown; c.beginPath(); c.moveTo(-bw - 1, -31 + bob); c.lineTo(bw + 1.5, -31 + bob); c.lineTo(bw + 5, -1); c.lineTo(-bw - 5, -1); c.closePath(); c.fill(); c.fillStyle = L.trim; c.fillRect(1, -31 + bob, 2.6, 30); c.fillRect(5.5, -31 + bob, 2.6, 30); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = .8; for(let i = -2; i < 3; i++){ c.beginPath(); c.moveTo(i * 4 - 3, -26 + bob); c.lineTo(i * 5 - 3, -2); c.stroke(); } }
  if(L.sash){ c.save(); ell(c, 0, -19 + bob, bw + .4, 12.4); c.clip(); c.strokeStyle = L.sash; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-bw, -30 + bob); c.lineTo(bw, -9 + bob); c.stroke(); c.restore(); c.fillStyle = '#C9CCCF'; c.beginPath(); c.arc(1, -19 + bob, 1.8, 0, 7); c.fill(); }
  if(L.whistle){ c.strokeStyle = '#E8B84A'; c.lineWidth = .8; c.beginPath(); c.moveTo(-3, -30 + bob); c.quadraticCurveTo(2, -22 + bob, 7, -30 + bob); c.stroke(); c.fillStyle = '#C9CCCF'; rr(c, .4, -24.5 + bob, 5, 2.6, 1.2); c.fill(); }
  if(L.medal){ c.fillStyle = '#3E6FB5'; c.fillRect(-6, -27 + bob, 3, 4); c.fillStyle = '#E8B84A'; c.beginPath(); c.arc(-4.5, -21.5 + bob, 2.2, 0, 7); c.fill(); }
  // arms
  const arm = (x, a, col) => { c.save(); c.translate(x, -27 + bob); c.rotate(a + (st.armRaise || 0)); c.fillStyle = L.gown || L.suit || col; rr(c, -2.6, 0, 5.2, 11, 2.6); c.fill(); c.fillStyle = belly; ell(c, 0, 11, 3, 2.7); c.fill(); c.restore(); };
  arm(-6, .3 - sw * .6 + (st.backArm || 0), shade(fur, -.15));
  // head
  const hx = 3 + (st.lean || 0), hy = -38 + bob;
  drawCatHead(c, L, st, hx, hy);
  arm(6, -.25 + sw * .6 + (st.frontArm || 0), fur);
  if(L.clip){ c.save(); c.translate(12, -17 + bob); c.rotate(-.4); c.strokeStyle = '#B9C3CC'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -5); c.arc(2, -5, 2, Math.PI, 0); c.lineTo(4, 3); c.arc(2.6, 3, 1.4, 0, Math.PI); c.lineTo(1.2, -3); c.stroke(); c.restore(); }
  if(st.lid){ c.save(); c.translate(10, -16 + bob); c.fillStyle = '#AEB6BE'; ell(c, 0, 0, 8, 3); c.fill(); c.restore(); }
  c.restore();
}
function drawCatHead(c, L, st, hx, hy){
  const t = st.t || 0, ex = st.expr || 'happy', fur = L.fur;
  // ears
  [[-8, -.25], [7, .2]].forEach(([x, a], i) => { c.save(); c.translate(hx + x, hy - 6); c.rotate(a + (st.earsBack ? (i ? .6 : -.6) : 0)); c.fillStyle = i ? fur : L.dark; c.beginPath(); c.moveTo(-5, 3); c.lineTo(0, -10); c.lineTo(5, 3); c.closePath(); c.fill(); c.fillStyle = '#E9A9A4'; c.beginPath(); c.moveTo(-2.6, 2); c.lineTo(0, -5.5); c.lineTo(2.6, 2); c.closePath(); c.fill(); c.restore(); });
  c.fillStyle = fur; ell(c, hx, hy, L.fluffy ? 14 : 12, L.fluffy ? 11.5 : 10.4); c.fill();
  if(L.fluffy){ c.beginPath(); for(let i = 0; i < 7; i++){ const a = Math.PI * (.15 + i * .12); c.moveTo(hx + Math.cos(a) * 13, hy + Math.sin(a) * 10); c.arc(hx + Math.cos(a) * 13, hy + Math.sin(a) * 10, 3.2, 0, 7); } c.fill(); }
  if(L.stripes){ c.strokeStyle = L.stripes; c.lineWidth = 1.5; [[-4, -9], [0, -10], [4, -9]].forEach(([x, y]) => { c.beginPath(); c.moveTo(hx + x, hy + y); c.lineTo(hx + x * .8, hy + y + 4); c.stroke(); }); }
  c.fillStyle = L.light; ell(c, hx + 4, hy + 4, 6.4, 4.6); c.fill();
  // eyes
  const eY = hy - 1, e1 = hx - 1.5, e2 = hx + 6.5;
  if(L.shades && !st.noShades){ c.fillStyle = '#121114'; rr(c, e1 - 4.4, eY - 3, 8.4, 5.6, 2.2); c.fill(); rr(c, e2 - 3.6, eY - 3, 7.6, 5.6, 2.2); c.fill(); c.fillRect(e1 + 3, eY - 2, e2 - e1 - 6, 1.2); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(e1 - 2.5, eY - 2, 2.2, 1); c.fillRect(e2 - 1.8, eY - 2, 2, 1); }
  else {
    [e1, e2].forEach((x, i) => {
      if(st.blink > 0 || ex === 'joy'){ c.strokeStyle = '#1A1414'; c.lineWidth = 1.2; c.beginPath(); if(ex === 'joy') c.arc(x, eY + 1, 2.2, Math.PI * 1.1, Math.PI * 1.9); else { c.moveTo(x - 2.2, eY); c.lineTo(x + 2.2, eY); } c.stroke(); return; }
      if(st.hurt > 0 || ex === 'dizzy'){ c.strokeStyle = '#1A1414'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x - 2, eY - 2); c.lineTo(x + 2, eY + 2); c.moveTo(x + 2, eY - 2); c.lineTo(x - 2, eY + 2); c.stroke(); return; }
      c.fillStyle = L.eye; ell(c, x, eY, 2.6 * (i ? .92 : 1), 3); c.fill(); c.fillStyle = '#121114'; ell(c, x + .3, eY, .9, 2.4); c.fill(); c.fillStyle = '#fff'; ell(c, x + 1, eY - 1.2, .6, .6); c.fill();
    });
    if(ex === 'angry' || L.brows){ c.strokeStyle = shade(L.dark, -.3); c.lineWidth = 1.6; c.beginPath(); c.moveTo(e1 - 3, eY - 4); c.lineTo(e1 + 2.4, eY - 2.6 - (ex === 'angry' ? 0 : 1)); c.moveTo(e2 + 3, eY - 4.4); c.lineTo(e2 - 2.4, eY - 2.8 - (ex === 'angry' ? 0 : 1)); c.stroke(); }
  }
  if(L.earpiece){ c.strokeStyle = '#121114'; c.lineWidth = .7; c.beginPath(); c.moveTo(hx - 9, hy + 1); c.quadraticCurveTo(hx - 12, hy + 8, hx - 7, hy + 12); c.stroke(); c.fillStyle = '#121114'; ell(c, hx - 9.4, hy + .5, 1.3, 1.6); c.fill(); }
  // nose + mouth + whiskers
  c.fillStyle = '#E58A8A'; c.beginPath(); c.moveTo(hx + 8.2, hy + 2.2); c.lineTo(hx + 10.6, hy + 2.2); c.lineTo(hx + 9.4, hy + 3.6); c.closePath(); c.fill();
  c.strokeStyle = '#3A2A26'; c.lineWidth = .9;
  if(st.talk && Math.sin(t * 22) > -.2){ c.fillStyle = '#7A2E2A'; ell(c, hx + 8.6, hy + 6, 2, 1.6); c.fill(); }
  else { c.beginPath(); c.moveTo(hx + 9.4, hy + 3.6); c.quadraticCurveTo(hx + 8.4, hy + 6, hx + 6.6, hy + 5); c.moveTo(hx + 9.4, hy + 3.6); c.quadraticCurveTo(hx + 10.4, hy + 6, hx + 12, hy + 5); c.stroke(); }
  c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = .6; c.beginPath(); c.moveTo(hx + 7, hy + 4); c.lineTo(hx - 1, hy + 3); c.moveTo(hx + 7, hy + 5); c.lineTo(hx - .5, hy + 6.5); c.moveTo(hx + 11, hy + 4); c.lineTo(hx + 17, hy + 3); c.moveTo(hx + 11, hy + 5); c.lineTo(hx + 16.5, hy + 6.5); c.stroke();
  if(L.specs && !(st.blink > 0)){ c.strokeStyle = '#C9A15A'; c.lineWidth = .8; c.beginPath(); c.arc(e1, eY + .6, 3.2, 0, Math.PI); c.moveTo(e2 + 3.1, eY + .6); c.arc(e2, eY + .6, 3.1, 0, Math.PI); c.moveTo(e1 + 3.2, eY + .6); c.lineTo(e2 - 3.1, eY + .6); c.stroke(); }
  if(L.mortar){ c.fillStyle = '#1A1A1F'; rr(c, hx - 9, hy - 14, 18, 6, 2); c.fill(); c.beginPath(); c.moveTo(hx - 17, hy - 15); c.lineTo(hx + 1, hy - 21); c.lineTo(hx + 17, hy - 15); c.lineTo(hx - 1, hy - 10); c.closePath(); c.fill(); c.fillStyle = '#2E2E36'; c.beginPath(); c.moveTo(hx - 13, hy - 15.4); c.lineTo(hx + 1, hy - 19.6); c.lineTo(hx + 4, hy - 18.6); c.lineTo(hx - 10, hy - 14.4); c.fill();
    const sw = Math.sin(t * 2.4) * .25; c.strokeStyle = '#E8B84A'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy - 16); c.lineTo(hx + 12, hy - 15); c.lineTo(hx + 13 + sw * 4, hy - 6); c.stroke(); c.fillStyle = '#E8B84A'; rr(c, hx + 11.6 + sw * 4, hy - 7, 3, 5, 1); c.fill(); }
  // campaign hat
  if(L.hat){ c.fillStyle = '#6E6A3C'; ell(c, hx, hy - 9, 17, 3.4); c.fill(); c.fillStyle = '#7F7A47'; c.beginPath(); c.moveTo(hx - 8, hy - 10); c.quadraticCurveTo(hx - 7, hy - 22, hx, hy - 20); c.quadraticCurveTo(hx + 7, hy - 22, hx + 8, hy - 10); c.closePath(); c.fill(); c.strokeStyle = '#4F4B2A'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy - 20); c.lineTo(hx, hy - 14); c.moveTo(hx - 3.5, hy - 19); c.lineTo(hx - 3, hy - 14); c.moveTo(hx + 3.5, hy - 19); c.lineTo(hx + 3, hy - 14); c.stroke(); c.fillStyle = '#3F3A23'; c.fillRect(hx - 8, hy - 12, 16, 2); }
}
function drawCatSit(c, st, L){
  const t = st.t || 0, sz = L.size || 1; c.save(); c.scale(sz, sz);
  c.save(); c.translate(-8, -3); c.rotate(Math.sin(t * 1.6) * .15); c.strokeStyle = L.fur; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-12, 0, -11, -12); c.stroke(); c.restore();
  c.fillStyle = L.fur; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-11, -18, -1, -24); c.quadraticCurveTo(9, -20, 9, 0); c.closePath(); c.fill();
  c.fillStyle = L.light; ell(c, 4, -10, 4, 8); c.fill();
  c.fillStyle = L.fur; ell(c, 4, -1, 4, 2); c.fill(); ell(c, -4, -1, 4.4, 2.4); c.fill();
  drawCatHead(c, L, st, 2, -28);
  c.restore();
}

/* ================= iguana ================= */
function drawIguana(c, st){
  const t = st.t || 0, mv = st.move || 0, w = st.walk || 0, sz = st.size || 1;
  const G = '#5E9B45', Gd = '#3F7431', Gl = '#9CCB6A', O = '#E89A3C';
  const bob = Math.sin(t * 2) * .4 + (st.squash || 0);
  c.save(); c.scale(sz, sz);
  // tail
  c.save(); c.translate(-14, -7 + bob); c.rotate(Math.sin(t * 1.4 + (st.whip || 0)) * .08 + (st.whip || 0) * .6); c.fillStyle = G; c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-18, -3, -32, 3); c.quadraticCurveTo(-18, 1, 0, 4); c.closePath(); c.fill(); c.fillStyle = Gd; for(let i = 0; i < 5; i++){ c.fillRect(-6 - i * 5.5, -3 + i * .9, 2.2, 5 - i * .6); } c.restore();
  const s = Math.sin(w * .8) * .6 * mv;
  [[-8, -s, Gd], [8, s, Gd], [-4, s, G], [12, -s, G]].forEach(([x, a, col]) => { c.save(); c.translate(x, -6 + bob); c.rotate(a * .6); c.fillStyle = col; rr(c, -2, 0, 4, 7, 2); c.fill(); c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, 7); c.lineTo(-3.4, 8.6); c.moveTo(0, 7); c.lineTo(0, 9); c.moveTo(2, 7); c.lineTo(3.4, 8.6); c.stroke(); c.restore(); });
  c.fillStyle = G; ell(c, 0, -10 + bob, 17, 6.4); c.fill();
  c.fillStyle = Gl; ell(c, 2, -6.6 + bob, 13, 3); c.fill();
  c.fillStyle = Gd; for(let i = 0; i < 4; i++){ ell(c, -10 + i * 6, -11 + bob, 1.6, 4.6); c.fill(); }
  // spikes
  c.fillStyle = '#E8D27A'; for(let i = 0; i < 9; i++){ const x = -12 + i * 3.4; c.beginPath(); c.moveTo(x - 1.4, -15.6 + bob + Math.abs(i - 6) * .15); c.lineTo(x, -19.6 + bob + Math.abs(i - 5) * .3); c.lineTo(x + 1.4, -15.6 + bob); c.fill(); }
  // head
  const hx = 21, hy = -13 + bob + (st.nod ? Math.abs(Math.sin(t * 9)) * -3 : 0);
  c.fillStyle = O; c.beginPath(); c.moveTo(hx - 4, hy + 3); c.quadraticCurveTo(hx - 1, hy + 11 + (st.dew || 0), hx + 4, hy + 4); c.closePath(); c.fill();
  c.fillStyle = G; ell(c, hx, hy, 8.4, 5.6); c.fill(); ell(c, hx + 5.4, hy + 1, 5, 3.8); c.fill();
  c.fillStyle = '#C9C08A'; ell(c, hx - 3.6, hy + 1.8, 2.2, 2.2); c.fill();
  if(st.hurt > 0){ c.strokeStyle = '#1A1414'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 1, hy - 3); c.lineTo(hx + 4, hy); c.moveTo(hx + 4, hy - 3); c.lineTo(hx + 1, hy); c.stroke(); }
  else if(st.blink > 0 || st.sleepy){ c.strokeStyle = '#1A1414'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy - 1.4); c.lineTo(hx + 4, hy - 1.4); c.stroke(); }
  else { c.fillStyle = '#F2C14E'; ell(c, hx + 2.4, hy - 1.4, 2.2, 2); c.fill(); c.fillStyle = '#1A1414'; ell(c, hx + 2.8, hy - 1.4, .9, 1.6); c.fill(); }
  c.strokeStyle = Gd; c.lineWidth = .8; c.beginPath(); c.moveTo(hx + 10, hy + 2); c.quadraticCurveTo(hx + 6, hy + 4, hx + 1, hy + 3); c.stroke();
  if(st.talk && Math.sin(t * 22) > -.2){ c.fillStyle = '#C0505A'; ell(c, hx + 7, hy + 3.6, 2.4, 1.2); c.fill(); }
  c.restore();
}

/* ================= the stranger in the long coat ================= */
function drawCoat(c, st){
  const t = st.t || 0, mv = st.move || 0, w = st.walk || 0;
  const wob = Math.sin(t * 7) * .035 + Math.sin(w) * .05 * mv;
  c.save(); c.rotate(wob);
  const coat = '#B48A57', coatD = '#8E6A40', hat = '#3F2E24';
  // tiny paws peeking out the bottom
  const s = Math.sin(w) * 3 * mv;
  c.fillStyle = '#F7F3EC'; ell(c, -5 + s, -1, 3.2, 1.8); c.fill(); ell(c, 6 - s, -1, 3.2, 1.8); c.fill();
  // coat
  c.fillStyle = coat; c.beginPath(); c.moveTo(-12, -2); c.quadraticCurveTo(-15, -40, -10, -70); c.lineTo(10, -70); c.quadraticCurveTo(16, -40, 13, -2); c.closePath(); c.fill(); edge(c, coat, 1);
  c.fillStyle = coatD; c.beginPath(); c.moveTo(1, -66); c.lineTo(3, -2); c.lineTo(-1, -2); c.closePath(); c.fill();
  c.fillStyle = '#6E5030'; c.fillRect(-13, -38, 27, 3.4); c.fillStyle = '#D9B04A'; rr(c, -1, -39, 4, 5, 1); c.fill();
  [[-6, -58], [-6, -48], [6, -58], [6, -48]].forEach(([x, y]) => { c.fillStyle = '#5A4028'; c.beginPath(); c.arc(x, y, 1.1, 0, 7); c.fill(); });
  // sleeves + gloved hands
  const arm = (x, a, glove) => { c.save(); c.translate(x, -66); c.rotate(a + (st.armRaise || 0)); c.fillStyle = coat; rr(c, -3.6, 0, 7.2, 22, 3.4); c.fill(); edge(c, coat, .8); c.fillStyle = glove ? '#5C3B26' : '#2B2729'; ell(c, 0, 23, 3.6, 3.4); c.fill(); c.restore(); };
  arm(-9, .15 + (st.backArm || 0), true);
  // collar up
  c.fillStyle = coatD; c.beginPath(); c.moveTo(-11, -70); c.lineTo(-7, -84); c.lineTo(0, -74); c.lineTo(7, -84); c.lineTo(11, -70); c.closePath(); c.fill();
  // shadowed face
  c.fillStyle = '#2A1E18'; ell(c, 0, -80, 9, 8); c.fill();
  const glint = st.blink > 0 ? 0 : 1; if(glint){ c.fillStyle = '#F7E6A8'; ell(c, -1, -80, 1.3, 1); c.fill(); ell(c, 5, -80.5, 1.1, .9); c.fill(); }
  // wide hat
  c.fillStyle = hat; ell(c, 1, -86, 20, 4.4); c.fill(); c.beginPath(); c.moveTo(-9, -87); c.quadraticCurveTo(-8, -100, 1, -100); c.quadraticCurveTo(10, -100, 11, -87); c.closePath(); c.fill(); c.fillStyle = '#7A3E2E'; c.fillRect(-9, -90, 20, 2.6);
  arm(9, -.15 + (st.frontArm || 0), st.oneGlove ? false : true);
  c.restore();
}

/* ================= props ================= */
WD.drawGlove = function(c, x, y, s, rot){
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s || 1, s || 1);
  c.fillStyle = '#5C3B26'; rr(c, -7, -4, 12, 9, 3); c.fill();
  [[-6, -6], [-3, -7], [0, -6.6], [3, -5.6]].forEach(([fx, fy]) => { rr(c, fx - 1.3, fy - 4, 2.6, 6, 1.3); c.fill(); });
  c.save(); c.translate(5, 0); c.rotate(.7); rr(c, -1.4, -4, 2.8, 6, 1.4); c.fill(); c.restore();
  c.fillStyle = '#7A5234'; c.fillRect(-7, 3, 12, 2.2); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = .6; c.beginPath(); c.moveTo(-5, -1); c.lineTo(2, -1); c.stroke();
  c.restore();
};
WD.drawPaw = function(c, x, y, s, col){ c.fillStyle = col || 'rgba(96,66,40,.75)'; ell(c, x, y + 1.2 * s, 1.9 * s, 1.5 * s); c.fill(); [[-1.9, -1], [-.7, -2], [.7, -2], [1.9, -1]].forEach(([dx, dy]) => { ell(c, x + dx * s, y + dy * s, .6 * s, .7 * s); c.fill(); }); };
/* a muddy boot print with a tiny dog paw print inside it: the clue */
WD.drawBootPrint = function(c, x, y, s, rot, glow){
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s || 1, (s || 1) * .5);
  if(glow){ c.fillStyle = `rgba(255,214,110,${.25 + .15 * glow})`; ell(c, 0, 0, 12, 9); c.fill(); }
  c.fillStyle = 'rgba(92,62,38,.72)'; ell(c, -1, -3, 5.2, 4.2); c.fill(); ell(c, 0, 4.4, 4, 3); c.fill(); c.fillRect(-3.6, 0, 6.6, 3);
  c.fillStyle = 'rgba(60,40,24,.8)'; WD.drawPaw(c, -1, -3, .9, 'rgba(60,38,22,.85)');
  c.restore();
};
WD.drawPolaroid = function(c, x, y, w, rot, scene){
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-w / 2 + 2, -w * .58 + 3, w, w * 1.18);
  c.fillStyle = '#FFFDF6'; c.fillRect(-w / 2, -w * .58, w, w * 1.18);
  c.save(); c.beginPath(); c.rect(-w / 2 + w * .07, -w * .51, w * .86, w * .86); c.clip(); if(scene) scene(c, -w / 2 + w * .07, -w * .51, w * .86); c.restore();
  c.restore();
};
/* the first sighting: Dayla at the UIC front desk, eating off a stack of papers */
WD.sightingUIC = function(c, x, y, s){
  c.fillStyle = '#E9DCC4'; c.fillRect(x, y, s, s);
  c.fillStyle = '#C8D8E8'; c.fillRect(x, y, s, s * .55);
  c.fillStyle = '#7A1F2B'; c.fillRect(x + s * .08, y + s * .1, s * .5, s * .14); c.fillStyle = '#FFF'; c.font = `900 ${s * .085}px Grandstander, system-ui`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('UIC', x + s * .12, y + s * .17); c.font = `800 ${s * .05}px Nunito, system-ui`; c.fillText('FRONT DESK', x + s * .26, y + s * .175);
  c.fillStyle = '#8A5A36'; c.fillRect(x, y + s * .62, s, s * .38); c.fillStyle = '#A9744A'; c.fillRect(x, y + s * .6, s, s * .06);
  c.fillStyle = '#FFFDF6'; for(let i = 0; i < 4; i++){ c.fillRect(x + s * .52 + i * 1.2, y + s * .5 - i * s * .025, s * .3, s * .1); }
  c.fillStyle = '#D6452B'; c.font = `900 ${s * .05}px Grandstander, system-ui`; c.save(); c.translate(x + s * .67, y + s * .53); c.rotate(-.15); c.fillText('TRANSFER', -s * .14, 0); c.restore();
  c.save(); c.translate(x + s * .38, y + s * .62); c.scale(s / 90, s / 90); drawDog(c, { t: 3, eat: 1, move: 0 }); c.restore();
  c.fillStyle = 'rgba(255,240,200,.18)'; c.fillRect(x, y, s, s);
};
WD.drawToy = function(c, kind, x, y, s){
  c.save(); c.translate(x, y); c.scale(s || 1, s || 1);
  if(kind === 'ball'){ c.fillStyle = '#D7E84A'; c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill(); c.strokeStyle = '#FFF'; c.lineWidth = 1.2; c.beginPath(); c.arc(-6, 0, 5, -.9, .9); c.stroke(); c.beginPath(); c.arc(6, 0, 5, Math.PI - .9, Math.PI + .9); c.stroke(); }
  else if(kind === 'rope'){ c.strokeStyle = '#3E8FC7'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.stroke(); c.strokeStyle = '#E8593C'; c.lineWidth = 1.4; for(let i = -6; i < 8; i += 3){ c.beginPath(); c.moveTo(i, -1.6); c.lineTo(i + 1.6, 1.6); c.stroke(); } c.fillStyle = '#FFF8EC'; [-9, 9].forEach(x2 => { c.beginPath(); c.arc(x2, 0, 3, 0, 7); c.fill(); }); }
  else if(kind === 'bone'){ c.fillStyle = '#F2E7D3'; rr(c, -7, -2, 14, 4, 2); c.fill(); [[-7, -2.2], [-7, 2.2], [7, -2.2], [7, 2.2]].forEach(([x2, y2]) => { c.beginPath(); c.arc(x2, y2, 2.6, 0, 7); c.fill(); }); c.strokeStyle = 'rgba(150,120,90,.5)'; c.lineWidth = .6; c.beginPath(); c.moveTo(-4, 0); c.lineTo(4, 0); c.stroke(); }
  c.restore();
};
WD.sparkle = function(c, x, y, t, col){ const a = .5 + .5 * Math.sin(t * 6); c.save(); c.translate(x, y); c.rotate(t * 1.5); c.fillStyle = col || `rgba(255,236,160,${.55 + a * .45})`; star(c, 0, 0, 3 + a * 2); c.restore(); };
WD.drawEmote = function(c, x, y, kind, t, s){
  s = s || 1; c.save(); c.translate(x, y); c.scale(s, s);
  const pop = 1 + Math.max(0, .3 - (t || 1)) * 2; c.scale(pop, pop);
  c.fillStyle = '#FFF8EC'; c.strokeStyle = '#2B1D14'; c.lineWidth = 1.6;
  ell(c, 0, 0, 9, 8); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-3, 7); c.lineTo(-5, 12); c.lineTo(1, 7.6); c.fill();
  c.fillStyle = '#2B1D14'; c.font = '900 11px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
  if(kind === '!'){ c.fillStyle = '#E8593C'; c.fillText('!', 0, .8); }
  else if(kind === '?'){ c.fillStyle = '#3E6FB5'; c.fillText('?', 0, .8); }
  else if(kind === '...'){ c.fillText('…', 0, -1); }
  else if(kind === 'heart'){ c.fillStyle = '#E86F79'; c.beginPath(); c.moveTo(0, 4); c.bezierCurveTo(-7, -1, -3, -6, 0, -2.4); c.bezierCurveTo(3, -6, 7, -1, 0, 4); c.fill(); }
  else if(kind === 'note'){ c.fillText('♪', 0, .8); }
  else if(kind === 'sweat'){ c.fillStyle = '#58AEDD'; ell(c, 1, 1, 2.6, 3.6); c.fill(); }
  else if(kind === 'anger'){ c.strokeStyle = '#D6452B'; c.lineWidth = 1.6; c.beginPath(); for(let i = 0; i < 4; i++){ const a = i * Math.PI / 2 + .78; c.moveTo(Math.cos(a) * 1.5, Math.sin(a) * 1.5); c.lineTo(Math.cos(a) * 4.5, Math.sin(a) * 4.5); } c.stroke(); }
  else if(kind === 'sniff'){ c.fillText('🐾', 0, 1); }
  c.restore();
};

/* ================= icons (bag, item cards, phone calls) ================= */
WD.drawIcon = function(c, kind, x, y, s, t){
  t = t || 0; c.save(); c.translate(x, y); c.scale(s, s);
  switch(kind){
    case 'arepa': c.fillStyle = '#E9C77E'; ell(c, 0, 2, 13, 6); c.fill(); c.fillStyle = '#F4DA9C'; ell(c, 0, 0, 12, 5); c.fill(); c.fillStyle = '#C98E3E'; [[-5, -1], [3, 1], [6, -1.4], [-1, 2]].forEach(([a, b]) => { ell(c, a, b, 1.6, .9); c.fill(); }); break;
    case 'jerky': c.fillStyle = '#7A3E26'; c.save(); c.rotate(-.3); rr(c, -12, -4, 24, 8, 3); c.fill(); c.fillStyle = '#9A5434'; rr(c, -10, -3, 9, 2, 1); c.fill(); rr(c, 2, 0, 8, 2, 1); c.fill(); c.restore(); break;
    case 'cafe': c.fillStyle = '#FFF8EC'; rr(c, -8, -6, 14, 14, 3); c.fill(); c.strokeStyle = '#FFF8EC'; c.lineWidth = 2.4; c.beginPath(); c.arc(7, 0, 3.6, -1.3, 1.3); c.stroke(); c.fillStyle = '#B0743F'; ell(c, -1, -5, 6, 1.6); c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.2; [-3, 1].forEach(a => { c.beginPath(); c.moveTo(a, -9); c.quadraticCurveTo(a + 2, -12, a, -15); c.stroke(); }); break;
    case 'plate': c.fillStyle = '#FFFDF6'; ell(c, 0, 3, 15, 6); c.fill(); c.fillStyle = '#E9E2D2'; ell(c, 0, 3, 11, 4); c.fill(); c.fillStyle = '#F4DA9C'; ell(c, -4, 1, 6, 2.6); c.fill(); c.fillStyle = '#5A3A24'; ell(c, 4, 2, 4, 2.4); c.fill(); c.fillStyle = '#F2E7D3'; ell(c, 3, -1, 4, 2); c.fill(); c.fillStyle = '#6DB24E'; ell(c, 8, 2, 2, 1.2); c.fill(); break;
    case 'choc': c.fillStyle = '#3A2218'; rr(c, -10, -7, 20, 14, 2); c.fill(); c.strokeStyle = '#2A170F'; c.lineWidth = 1; for(let i = -1; i < 2; i++){ c.beginPath(); c.moveTo(i * 6.5, -7); c.lineTo(i * 6.5, 7); c.stroke(); } c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.stroke(); c.fillStyle = '#C2453A'; c.fillRect(-10, 2, 20, 5); break;
    case 'bbq': c.fillStyle = '#2E2E33'; ell(c, 0, -1, 12, 6); c.fill(); c.fillRect(-1, 4, 2, 9); c.fillStyle = '#7A3E26'; rr(c, -8, -6, 7, 3, 1.5); c.fill(); rr(c, 1, -7, 7, 3, 1.5); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; [-4, 0, 4].forEach(a => { c.beginPath(); c.moveTo(a, -10); c.quadraticCurveTo(a + 2, -13, a, -16); c.stroke(); }); break;
    case 'taxi': c.fillStyle = '#F2C14E'; rr(c, -14, -4, 28, 9, 3); c.fill(); rr(c, -8, -10, 15, 7, 2.4); c.fill(); c.fillStyle = '#9FD3FF'; rr(c, -6, -9, 5, 4, 1); c.fill(); rr(c, 1, -9, 5, 4, 1); c.fill(); c.fillStyle = '#2E2E33'; [-8, 8].forEach(a => { c.beginPath(); c.arc(a, 5, 3, 0, 7); c.fill(); }); c.fillStyle = '#2E2E33'; c.fillRect(-14, 0, 28, 1.4); break;
    case 'bag': c.fillStyle = '#E86F9A'; c.beginPath(); c.moveTo(-10, -4); c.lineTo(10, -4); c.lineTo(12, 11); c.lineTo(-12, 11); c.closePath(); c.fill(); c.strokeStyle = '#B34A7A'; c.lineWidth = 1.8; c.beginPath(); c.arc(0, -4, 5, Math.PI, 0); c.stroke(); c.fillStyle = '#FFF8EC'; c.font = '900 7px Nunito, system-ui'; c.textAlign = 'center'; c.fillText('SALE', 0, 5); break;
    case 'toque': c.fillStyle = '#C2453A'; c.beginPath(); c.moveTo(-11, 4); c.quadraticCurveTo(-11, -12, 0, -12); c.quadraticCurveTo(11, -12, 11, 4); c.closePath(); c.fill(); c.fillStyle = '#F4EFE6'; rr(c, -12, 1, 24, 6, 2); c.fill(); c.beginPath(); c.arc(0, -13, 3.4, 0, 7); c.fill(); break;
    case 'duck': c.scale(.62, .62); drawDuck(c, t); break;
    case 'glove': WD.drawGlove(c, 0, 0, 1.3, -.3); break;
    case 'print': WD.drawBootPrint(c, 0, 0, 1.6, -.4); break;
    case 'photo': WD.drawPolaroid(c, 0, 2, 22, -.08, (c2, px, py, ps) => WD.sightingUIC(c2, px, py, ps)); break;
    case 'poster': c.fillStyle = '#FFFDF6'; c.fillRect(-10, -13, 20, 26); c.fillStyle = '#E8593C'; c.fillRect(-8, -11, 16, 4); c.fillStyle = '#E9DCC4'; c.fillRect(-7, -5, 14, 10); c.fillStyle = 'rgba(43,29,20,.4)'; c.fillRect(-7, 7, 14, 1.4); c.fillRect(-7, 10, 9, 1.4); break;
    case 'ball': case 'rope': case 'bone': WD.drawToy(c, kind, 0, 0, 1.2); break;
    case 'verse': c.fillStyle = '#B9B3A8'; ell(c, 0, 1, 12, 9); c.fill(); c.fillStyle = '#D7D1C5'; ell(c, -2, -1, 9, 6.4); c.fill(); c.fillStyle = `rgba(255,222,120,${.6 + .4 * Math.sin(t * 3)})`; c.fillRect(-1, -6, 2, 10); c.fillRect(-4.4, -3, 8.8, 2); break;
    case 'word': c.fillStyle = '#FFF8EC'; rr(c, -12, -9, 24, 15, 5); c.fill(); c.beginPath(); c.moveTo(-5, 5); c.lineTo(-8, 11); c.lineTo(0, 5); c.fill(); c.fillStyle = '#E8593C'; c.font = '900 12px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Ñ', 0, -1); break;
    case 'love': c.fillStyle = '#E86F79'; c.beginPath(); c.moveTo(0, 9); c.bezierCurveTo(-15, -2, -7, -14, 0, -5); c.bezierCurveTo(7, -14, 15, -2, 0, 9); c.fill(); break;
    case 'star': c.fillStyle = '#FFC94A'; star(c, 0, 0, 12); break;
    case 'shades': c.fillStyle = '#121114'; rr(c, -13, -5, 11, 8, 3); c.fill(); rr(c, 2, -5, 11, 8, 3); c.fill(); c.fillRect(-3, -3, 6, 2); c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(-11, -3, 3, 1.5); c.fillRect(4, -3, 3, 1.5); break;
    case 'van': c.fillStyle = '#E9E2D2'; rr(c, -15, -9, 26, 15, 3); c.fill(); c.fillStyle = '#D7CFBE'; rr(c, 9, -5, 7, 11, 2); c.fill(); c.fillStyle = '#8FB4D4'; rr(c, 10, -4, 5, 5, 1); c.fill(); c.fillStyle = '#2E2E33'; [-8, 9].forEach(a => { c.beginPath(); c.arc(a, 7, 3.2, 0, 7); c.fill(); }); c.fillStyle = 'rgba(80,80,90,.35)'; c.fillRect(-20, 9, 6, 1.4); c.fillRect(-24, 5, 7, 1.4); break;
  }
  c.restore();
};
WD.iconCanvas = function(kind, px){ const cv = document.createElement('canvas'); cv.width = cv.height = px * 2; const c = cv.getContext('2d'); c.setTransform(2, 0, 0, 2, px, px); WD.drawIcon(c, kind, 0, 0, px / 32, 0); return cv; };

/* ================= puppets: paper edge + ink outline ================= */
const KINDS = WD.KINDS = {
  human: { draw: (c, e) => drawHuman(c, e.look, e), box: [-34, -92, 68, 100], shadow: 13, portrait: [4.4, -10, 230] },
  dog: { draw: (c, e) => drawDog(c, e), box: [-24, -66, 64, 72], shadow: 16, portrait: [4.6, -64, 128] },
  chi: { draw: (c, e) => drawChi(c, e), box: [-34, -60, 72, 66], shadow: 18, portrait: [4.4, -80, 126] },
  cat: { draw: (c, e) => drawCat(c, e), box: [-30, -70, 64, 76], shadow: 12, portrait: [4.2, -18, 178] },
  iguana: { draw: (c, e) => drawIguana(c, e), box: [-50, -36, 88, 42], shadow: 20, portrait: [4.2, -90, 84] },
  coat: { draw: (c, e) => drawCoat(c, e), box: [-26, -106, 52, 110], shadow: 13, portrait: [3.6, -4, 300] },
  bull: { draw: (c, e) => drawBull(c, e), box: [-30, -52, 68, 58], shadow: 19, portrait: [4.2, -76, 96] }
};
WD.drawPuppet = (c, e) => KINDS[e.kind].draw(c, e);
WD.makeEnt = function(o){ return Object.assign({ x: 0, y: 60, z: 0, dir: 1, flip: 1, walk: 0, move: 0, t: Math.random() * 9, blink: 0, nextBlink: 2, expr: 'happy', talk: false, vis: true, hurt: 0, scale: 1, rot: 0, alpha: 1 }, o); };
WD.tickEnt = function(e, dt){
  e.t += dt; e.blink -= dt; e.nextBlink -= dt; if(e.nextBlink <= 0){ e.blink = .12; e.nextBlink = 1.6 + Math.random() * 3; }
  e.flip = lerp(e.flip, e.dir, Math.min(1, dt * 12)); if(Math.abs(e.flip - e.dir) < .02) e.flip = e.dir;
  if(e.move > .05) e.walk += dt * ({ dog: 13, chi: 15, iguana: 7, cat: 10, bull: 11 }[e.kind] || 9.5) * e.move;
  e.hurt = Math.max(0, e.hurt - dt);
  if(e.emote){ e.emote.t += dt; if(e.emote.t > (e.emote.dur || 1.6)) e.emote = null; }
};
function boxOf(e){ const b = KINDS[e.kind].box; const sz = (e.kind === 'cat' && e.look && e.look.size) || (e.kind === 'iguana' && e.size) || 1; return sz === 1 ? b : [b[0] * sz, b[1] * sz, b[2] * sz, b[3] * sz]; }
WD.paintEnt = function(e, sx, sy, k){
  const ctx = WD.ctx;
  const [bx, by, bw, bh] = boxOf(e);
  const pw = Math.ceil(bw * k) + 8, ph = Math.ceil(bh * k) + 8;
  if(pw < 2 || ph < 2) return;
  if(!e.cv || e.cv.width !== pw || e.cv.height !== ph){ e.cv = document.createElement('canvas'); e.cv.width = pw; e.cv.height = ph; e.sil = document.createElement('canvas'); e.sil.width = pw; e.sil.height = ph; e.ink = document.createElement('canvas'); e.ink.width = pw; e.ink.height = ph; }
  const c = e.cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, pw, ph);
  c.setTransform(k, 0, 0, k, -bx * k + 4, -by * k + 4);
  KINDS[e.kind].draw(c, e);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
  const lt = e.light || WD.light;
  const g = c.createLinearGradient(pw, 0, 0, ph);
  if(lt === 'night'){ g.addColorStop(0, 'rgba(150,170,255,.12)'); g.addColorStop(1, 'rgba(20,20,70,.38)'); }
  else if(lt === 'indoor'){ g.addColorStop(0, 'rgba(255,220,170,.2)'); g.addColorStop(.6, 'rgba(255,220,170,0)'); g.addColorStop(1, 'rgba(90,50,40,.14)'); }
  else { g.addColorStop(0, 'rgba(255,214,150,.22)'); g.addColorStop(.55, 'rgba(255,214,150,0)'); g.addColorStop(1, 'rgba(60,40,110,.16)'); }
  c.fillStyle = g; c.fillRect(0, 0, pw, ph);
  if(e.hurt > 0){ c.fillStyle = `rgba(255,255,255,${Math.min(.75, e.hurt * 2)})`; c.fillRect(0, 0, pw, ph); }
  if(e.tint){ c.fillStyle = e.tint; c.fillRect(0, 0, pw, ph); }
  c.globalCompositeOperation = 'source-over';
  const s = e.sil.getContext('2d'); s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, pw, ph); s.drawImage(e.cv, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#FFF8EC'; s.fillRect(0, 0, pw, ph); s.globalCompositeOperation = 'source-over';
  const ik = e.ink.getContext('2d'); ik.setTransform(1, 0, 0, 1, 0, 0); ik.clearRect(0, 0, pw, ph); ik.drawImage(e.cv, 0, 0); ik.globalCompositeOperation = 'source-in'; ik.fillStyle = '#3A2618'; ik.fillRect(0, 0, pw, ph); ik.globalCompositeOperation = 'source-over';
  const ox = -(-bx * k + 4), oy = -(-by * k + 4);
  const fl = e.flip, r = Math.max(2, 2.3 * k);
  ctx.save();
  ctx.globalAlpha = e.alpha;
  if(!e.noShadow){ ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(40,28,60,.22)'; const zf = Math.max(.3, 1 - e.z / 80), sw = KINDS[e.kind].shadow * (e.kind === 'cat' && e.look ? (e.look.size || 1) : 1); ell(ctx, sx, sy + k, sw * k * zf, 3.6 * k * zf); ctx.fill(); }
  ctx.setTransform(fl, 0, 0, 1, sx, sy - e.z * k); if(e.rot) ctx.rotate(e.rot);
  if(Math.abs(fl) < .18){ ctx.fillStyle = '#E9DCC4'; ctx.fillRect(-1.2 * k / Math.max(.05, Math.abs(fl)), oy * .9, 2.4 * k / Math.max(.05, Math.abs(fl)), -oy * .9); }
  ctx.globalAlpha = .55 * e.alpha; ctx.drawImage(e.sil, ox + r * .6, oy + r * 1.2); ctx.globalAlpha = e.alpha;
  for(let i = 0; i < 12; i++){ const a = i * Math.PI / 6; ctx.drawImage(e.sil, ox + Math.cos(a) * r, oy + Math.sin(a) * r); }
  const ri = Math.max(1, .55 * k); for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4; ctx.drawImage(e.ink, ox + Math.cos(a) * ri, oy + Math.sin(a) * ri); }
  ctx.drawImage(e.cv, ox, oy);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};
/* portrait for the dialogue box */
WD.drawPortraitOf = function(pc, e, phone){
  pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, 168, 168);
  const P = KINDS[e.kind].portrait; let kk = P[0]; const sz = e.kind === 'cat' && e.look ? (e.look.size || 1) : 1;
  kk /= Math.sqrt(sz);
  pc.setTransform(kk, 0, 0, kk, 84 + P[1] * (kk / P[0]), 84 + P[2] * (kk / P[0]));
  const st = Object.assign({}, e, { move: 0, z: 0 });
  KINDS[e.kind].draw(pc, st);
  if(phone){ pc.setTransform(1, 0, 0, 1, 0, 0); pc.fillStyle = 'rgba(180,215,255,.12)'; pc.fillRect(0, 0, 168, 168); }
};

/* ================= outdoor set pieces ================= */
const R1 = rng(42);
WD.CLOUDS = Array.from({ length: 9 }, (_, i) => ({ x: i * 170 - 300 + R1() * 80, y: -230 + R1() * 120, s: .7 + R1() * .7, v: 3 + R1() * 4 }));
WD.FARPALMS = Array.from({ length: 30 }, (_, i) => ({ x: -320 + i * 78 + R1() * 40, h: 70 + R1() * 40, lean: (R1() - .5) * .25 }));
WD.MOTES = Array.from({ length: 40 }, () => ({ x: R1() * 2400 - 200, y: -160 + R1() * 240, p: R1() * 7, s: .4 + R1() * .8 }));
WD.BIRDS = [{ x: -200, y: -170, v: 38 }, { x: -260, y: -160, v: 38 }, { x: -230, y: -185, v: 38 }];
WD.PALMCOL = { trunk: '#C6C0B4', ring: '#A9A296', shaft: '#6E9A4E', leaf: '#3E8A44', leaf2: '#4FA04F' };
WD.drawSky = function(t){
  const ctx = WD.ctx, v = WD.view, cam = WD.cam;
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  const hy = WD.horizonY();
  const g = ctx.createLinearGradient(0, 0, 0, Math.max(10, hy)); g.addColorStop(0, '#3E78D4'); g.addColorStop(.5, '#86B8EC'); g.addColorStop(.86, '#FCDDB2'); g.addColorStop(1, '#FFD49A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, v.w, Math.max(0, hy) + 4);
  const sx = v.w * .8 - cam.x * v.S * .02, sy = hy - 150 * v.S;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 210 * v.S); sg.addColorStop(0, 'rgba(255,246,214,.95)'); sg.addColorStop(.12, 'rgba(255,236,190,.65)'); sg.addColorStop(.5, 'rgba(255,214,160,.18)'); sg.addColorStop(1, 'rgba(255,214,160,0)');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, v.w, v.h);
  ctx.fillStyle = '#FFF7E0'; ell(ctx, sx, sy, 20 * v.S, 20 * v.S); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(sx, sy);
  for(let i = 0; i < 6; i++){ const a = 1.9 + i * .26 + Math.sin(t * .15 + i) * .03, w = .05 + (i % 3) * .02; ctx.fillStyle = `rgba(255,232,180,${.045 + (i % 2) * .02})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * 2000, Math.sin(a - w) * 2000); ctx.lineTo(Math.cos(a + w) * 2000, Math.sin(a + w) * 2000); ctx.fill(); }
  ctx.restore();
  return hy;
};
WD.cloud = function(c, x, y, s){
  const puffs = [[0, 0, 26], [24, -10, 22], [48, 0, 24], [-22, 4, 17], [70, 6, 15], [14, 8, 20], [38, 10, 18]];
  c.fillStyle = '#C9D6EE'; puffs.forEach(([px, py, r]) => { ell(c, x + px * s, y + (py + 5) * s, r * s, r * s); c.fill(); });
  c.fillStyle = '#FFFFFF'; puffs.forEach(([px, py, r]) => { ell(c, x + px * s, y + py * s, r * s * .96, r * s * .9); c.fill(); });
  c.fillStyle = 'rgba(255,224,180,.55)'; ell(c, x + 40 * s, y - 8 * s, 18 * s, 9 * s); c.fill();
};
/* sky, clouds, birds and hazy far palms: the shared outdoor backdrop */
WD.drawOutdoorBack = function(t, dt){
  const ctx = WD.ctx;
  WD.drawSky(t);
  WD.setLayer(.06); WD.CLOUDS.forEach(cl => { cl.x += cl.v * dt; if(cl.x > WD.cam.x * .06 + WD.viewL + 120) cl.x -= WD.viewL * 2 + 300; WD.cloud(ctx, cl.x, cl.y, cl.s); });
  WD.setLayer(.06); WD.BIRDS.forEach(b => { b.x += b.v * dt; if(b.x > 900) b.x = -400; ctx.strokeStyle = '#3A3A5A'; ctx.lineWidth = 1.4; const f = Math.sin(t * 8 + b.y) * 3; ctx.beginPath(); ctx.moveTo(b.x - 5, b.y - f); ctx.quadraticCurveTo(b.x - 2, b.y - 2, b.x, b.y); ctx.quadraticCurveTo(b.x + 2, b.y - 2, b.x + 5, b.y - f); ctx.stroke(); });
  WD.setLayer(.25); WD.FARPALMS.forEach(p => WD.drawPalm(ctx, p.x, 2, p.h, p.lean, t, p.x, { trunk: '#9BB1B8', leaf: '#8FB1A8', leaf2: '#9DBDB2' }, false));
  ctx.fillStyle = 'rgba(255,228,190,.25)'; ctx.fillRect(WD.cam.x * .25 - WD.viewL * 1.2, -170, WD.viewL * 2.4, 180);
};
WD.drawPalm = function(c, x, base, h, lean, t, ph, cols, detail){
  const sway = Math.sin(t * .9 + ph) * .035;
  const tx = x + Math.sin(lean) * h, ty = base - h;
  c.strokeStyle = cols.trunk; c.lineWidth = detail ? 7 : 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + Math.sin(lean) * h * .3, base - h * .55, tx, ty); c.stroke();
  if(detail){ c.strokeStyle = cols.ring; c.lineWidth = 1.2; for(let i = 1; i < 14; i++){ const u = i / 14, px = lerp(x, tx, u * u * .3 + u * .7), py = lerp(base, ty, u); c.beginPath(); c.moveTo(px - 3.4, py); c.lineTo(px + 3.4, py + 1); c.stroke(); }
    c.fillStyle = cols.shaft; rr(c, tx - 4.2, ty - 2, 8.4, 18, 3); c.fill(); }
  const n = detail ? 11 : 8;
  for(let i = 0; i < n; i++){ const a = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI * 1.15 / (n - 1)) + sway * (1 + i % 3), L = (detail ? 46 : 30) * (.85 + (i % 3) * .1);
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .55 + L * .32, mx = tx + Math.cos(a) * L * .5, my = ty + Math.sin(a) * L * .55 - 6;
    c.strokeStyle = i % 2 ? cols.leaf : cols.leaf2; c.lineWidth = detail ? 2 : 1.6;
    c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    if(detail){ c.lineWidth = 1.5; for(let j = 2; j < 11; j++){ const u = j / 11, qx = (1 - u) * (1 - u) * tx + 2 * (1 - u) * u * mx + u * u * ex, qy = (1 - u) * (1 - u) * ty + 2 * (1 - u) * u * my + u * u * ey, ll = 13 * (1 - u * .6);
      c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx + Math.cos(a + 1.2) * ll * .5, qy + ll * .75); c.moveTo(qx, qy); c.lineTo(qx + Math.cos(a - 1.2) * ll * .5, qy + ll * .7); c.stroke(); } }
    else { c.lineWidth = 3.5; c.beginPath(); c.moveTo(mx, my + 2); c.lineTo(ex, ey + 1); c.stroke(); } }
};
WD.drawBuilding = function(c, b){
  const x = b.x, w = b.w, base = 2, H1 = 46, H2 = 92, wall = b.wall || '#F1E8D4', wall2 = b.wall2 || '#E4D6BB', trim = '#C29C6E', roof = '#A78867', roofD = '#8B6F52';
  c.save(); c.fillStyle = roof; c.beginPath(); c.moveTo(x - 10, base - H2); c.lineTo(x + 20, base - H2 - 38); c.lineTo(x + w - 20, base - H2 - 38); c.lineTo(x + w + 10, base - H2); c.closePath(); c.fill(); c.clip();
  c.strokeStyle = roofD; c.lineWidth = 1; for(let y = base - H2 - 34; y < base - H2; y += 5){ c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x + w + 12, y); c.stroke(); } c.restore();
  c.fillStyle = wall; c.fillRect(x, base - H2, w, H2);
  c.fillStyle = wall2; c.fillRect(x, base - H2, w, 5);
  c.fillStyle = trim; c.fillRect(x, base - H1 - 2, w, 3); c.fillRect(x, base - 4, w, 4);
  const bays = Math.max(2, Math.round(w / 64)), bw = w / bays;
  for(let i = 0; i < bays; i++){ const bx = x + i * bw;
    c.fillStyle = trim; c.fillRect(bx, base - H2, 2.5, H2);
    if(i % 2 === 0){ c.fillStyle = roof; c.beginPath(); c.moveTo(bx + 4, base - H2 + 2); c.lineTo(bx + bw / 2, base - H2 - 30); c.lineTo(bx + bw - 4, base - H2 + 2); c.closePath(); c.fill(); c.fillStyle = wall; c.beginPath(); c.moveTo(bx + 9, base - H2 + 2); c.lineTo(bx + bw / 2, base - H2 - 22); c.lineTo(bx + bw - 9, base - H2 + 2); c.closePath(); c.fill();
      c.fillStyle = '#E7D9BE'; rr(c, bx + bw / 2 - 9, base - H2 - 8, 18, 30, [9, 9, 0, 0]); c.fill(); c.fillStyle = '#F2F2F2'; ell(c, bx + bw / 2 + 8, base - H2 - 6, 5, 3.6, -.4); c.fill(); }
    [[base - H2 + 16, 24], [base - H1 + 12, 26]].forEach(([wy, wh], k2) => {
      const ww = bw * .42, wx = bx + (bw - ww) / 2 + (k2 ? -4 : 4);
      const lit = (Math.sin(i * 7.1 + k2 * 3 + b.x) > .55);
      c.fillStyle = trim; c.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);
      c.fillStyle = lit ? '#FFD98A' : '#7E9BB8'; c.fillRect(wx, wy, ww, wh);
      if(!lit){ c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(wx, wy + wh * .7); c.lineTo(wx + ww * .5, wy); c.lineTo(wx + ww * .7, wy); c.lineTo(wx, wy + wh); c.fill(); }
      c.strokeStyle = '#FBF8F1'; c.lineWidth = 1; for(let q = 1; q < 3; q++){ c.beginPath(); c.moveTo(wx + ww * q / 3, wy); c.lineTo(wx + ww * q / 3, wy + wh); c.stroke(); } c.beginPath(); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
      if(i % 2 === 1){ c.strokeStyle = '#222'; c.lineWidth = 1; const ry = wy + wh * .45; c.beginPath(); c.moveTo(wx - 6, ry); c.lineTo(wx + ww + 6, ry); for(let q = 0; q <= ww + 12; q += 3){ c.moveTo(wx - 6 + q, ry); c.lineTo(wx - 6 + q, wy + wh + 2); } c.stroke(); }
    });
  }
  c.fillStyle = '#4F8E43'; for(let sx = x + 6; sx < x + w; sx += 22){ ell(c, sx, base - 3, 11, 7); c.fill(); }
  c.fillStyle = '#62A253'; for(let sx = x + 10; sx < x + w; sx += 22){ ell(c, sx, base - 6, 6, 3.5); c.fill(); }
};
WD.drawPoinciana = function(c, x, base, t){
  c.strokeStyle = '#8D8A86'; c.lineCap = 'round';
  [[0, 0, -6, -40, 10], [-6, -40, -48, -72, 6], [-6, -40, 34, -78, 6], [-20, -52, -12, -92, 4], [12, -56, 56, -70, 4]].forEach(([a, b2, c2, d, lw]) => { c.lineWidth = lw; c.beginPath(); c.moveTo(x + a, base + b2); c.quadraticCurveTo(x + (a + c2) / 2 + 6, base + (b2 + d) / 2, x + c2, base + d); c.stroke(); });
  const R2 = rng(9);
  const blobs = Array.from({ length: 26 }, () => [x - 80 + R2() * 160, base - 108 + R2() * 54, 14 + R2() * 14]);
  c.fillStyle = '#3F7E3E'; blobs.forEach(([bx, by, r]) => { ell(c, bx, by + 4, r, r * .7); c.fill(); });
  c.fillStyle = '#5A9A48'; blobs.forEach(([bx, by, r], i) => { if(i % 2){ ell(c, bx, by, r * .8, r * .55); c.fill(); } });
  blobs.forEach(([bx, by, r], i) => { const sw = Math.sin(t * 1.2 + i) * .8; c.fillStyle = i % 3 ? '#E8552B' : '#F07A3A'; ell(c, bx + sw, by - 3, r * .55, r * .38); c.fill(); if(i % 2){ c.fillStyle = '#FF9A55'; ell(c, bx + sw + 3, by - 6, r * .22, r * .16); c.fill(); } });
};
WD.drawClubhouse = function(c, x){
  const base = 4, w = 300, H = 70, wall = '#DCC4A0', trim = '#B59672';
  c.fillStyle = '#D1B892'; c.fillRect(x, base - 52, w, 52);
  const tile = '#C9673E', tileD = '#A9502D', tileL = '#E08A5C';
  c.save(); c.fillStyle = tile; c.beginPath(); c.moveTo(x - 14, base - 50); c.lineTo(x + 40, base - 86); c.lineTo(x + w - 40, base - 86); c.lineTo(x + w + 14, base - 50); c.closePath(); c.fill(); c.clip();
  c.strokeStyle = tileD; c.lineWidth = 1.1; for(let y = base - 84; y < base - 50; y += 4.2){ c.beginPath(); for(let xx = x - 14; xx < x + w + 14; xx += 6){ c.moveTo(xx, y); c.quadraticCurveTo(xx + 3, y + 2.6, xx + 6, y); } c.stroke(); } c.restore();
  const cx2 = x + w / 2;
  c.fillStyle = wall; c.fillRect(cx2 - 52, base - H - 20, 104, H + 20);
  c.fillStyle = tile; c.beginPath(); c.moveTo(cx2 - 66, base - H - 14); c.lineTo(cx2, base - H - 62); c.lineTo(cx2 + 66, base - H - 14); c.closePath(); c.fill();
  c.fillStyle = tileL; c.beginPath(); c.moveTo(cx2 - 66, base - H - 14); c.lineTo(cx2, base - H - 62); c.lineTo(cx2 + 4, base - H - 58); c.lineTo(cx2 - 58, base - H - 14); c.closePath(); c.fill();
  c.fillStyle = '#EADBC0'; c.beginPath(); c.moveTo(cx2 - 50, base - H - 16); c.lineTo(cx2, base - H - 50); c.lineTo(cx2 + 50, base - H - 16); c.closePath(); c.fill();
  c.fillStyle = '#C9A15A'; ell(c, cx2, base - H - 30, 9, 10); c.fill(); c.fillStyle = '#F4E3B8'; ell(c, cx2, base - H - 30, 5.5, 6.5); c.fill();
  c.fillStyle = '#5B4A3A'; rr(c, cx2 - 40, base - H - 6, 80, 14, 3); c.fill(); c.fillStyle = '#F6E7C6'; c.font = '900 9px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TIVOLI PARK', cx2, base - H + 1.5);
  c.fillStyle = trim; rr(c, cx2 - 16, base - 44, 32, 44, [16, 16, 0, 0]); c.fill(); c.fillStyle = '#5E7A8E'; rr(c, cx2 - 13, base - 41, 26, 41, [13, 13, 0, 0]); c.fill(); c.fillStyle = 'rgba(255,230,170,.55)'; rr(c, cx2 - 11, base - 39, 10, 37, [11, 0, 0, 0]); c.fill();
  [x + 26, x + 74, x + w - 104, x + w - 56].forEach(wx => { c.fillStyle = trim; c.fillRect(wx - 2, base - 40, 34, 30); c.fillStyle = '#86A7C0'; c.fillRect(wx, base - 38, 30, 26); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(wx, base - 20); c.lineTo(wx + 14, base - 38); c.lineTo(wx + 19, base - 38); c.lineTo(wx, base - 15); c.fill(); c.strokeStyle = '#F6EFE2'; c.lineWidth = 1; c.beginPath(); c.moveTo(wx + 15, base - 38); c.lineTo(wx + 15, base - 12); c.stroke(); });
  c.fillStyle = '#4C8A41'; for(let sx = x + 6; sx < x + w; sx += 18){ if(Math.abs(sx - cx2) < 22) continue; ell(c, sx, base - 4, 10, 7); c.fill(); }
  c.fillStyle = '#D7472F'; for(let sx = x + 12; sx < x + w; sx += 36){ if(Math.abs(sx - cx2) < 22) continue; ell(c, sx, base - 9, 2.5, 2); c.fill(); }
};
WD.drawFountain = function(c, x, y, t){
  c.fillStyle = '#3F8A42'; ell(c, x, y + 6, 46, 13); c.fill(); c.fillStyle = '#52A04C'; ell(c, x, y + 3, 42, 11); c.fill();
  c.fillStyle = '#E7E1D6'; ell(c, x, y + 2, 30, 8); c.fill(); c.fillStyle = '#7DB7D8'; ell(c, x, y, 26, 6.3); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; for(let i = 0; i < 3; i++){ const r = ((t * 12 + i * 9) % 26); c.globalAlpha = 1 - r / 26; ell(c, x, y, r, r * .24); c.stroke(); } c.globalAlpha = 1;
  c.fillStyle = '#F4F0E8'; rr(c, x - 3.5, y - 34, 7, 34, 2); c.fill();
  c.fillStyle = '#FBF8F2'; ell(c, x, y - 34, 15, 4.5); c.fill(); c.fillStyle = '#E0DACF'; ell(c, x, y - 32, 13, 3); c.fill();
  c.fillStyle = '#F4F0E8'; rr(c, x - 2.4, y - 52, 4.8, 18, 2); c.fill(); c.fillStyle = '#FBF8F2'; ell(c, x, y - 52, 9, 3); c.fill(); c.fillStyle = '#F4F0E8'; ell(c, x, y - 57, 3, 5); c.fill();
  c.strokeStyle = 'rgba(190,226,246,.9)'; c.lineWidth = 1.3;
  for(let i = 0; i < 10; i++){ const a = (i / 10) * Math.PI * 2, ph = (t * 1.4 + i * .1) % 1; c.beginPath(); c.moveTo(x, y - 58); c.quadraticCurveTo(x + Math.cos(a) * 9, y - 64, x + Math.cos(a) * 12, y - 52 + Math.sin(a) * 2); c.stroke();
    c.fillStyle = 'rgba(220,240,252,.9)'; ell(c, x + Math.cos(a) * 14 * ph, y - 34 + ph * 30 * ph, 1, 1.5); c.fill(); }
};
WD.drawGolfCart = function(c, x, y){
  c.fillStyle = '#F4F4F2'; rr(c, x - 22, y - 46, 46, 4, 2); c.fill(); c.fillStyle = '#C9CCCF'; c.fillRect(x - 19, y - 42, 2.5, 26); c.fillRect(x + 18, y - 42, 2.5, 26);
  c.fillStyle = '#F4F4F2'; rr(c, x - 24, y - 18, 50, 12, 4); c.fill(); c.fillStyle = '#2E2E33'; rr(c, x - 14, y - 24, 22, 8, 3); c.fill();
  c.fillStyle = '#222'; [x - 14, x + 16].forEach(wx => { ell(c, wx, y - 4, 6, 6); c.fill(); }); c.fillStyle = '#AAA'; [x - 14, x + 16].forEach(wx => { ell(c, wx, y - 4, 2.4, 2.4); c.fill(); });
};
WD.drawTrash = function(c, x, y, t, popped){
  c.fillStyle = '#4C6E58'; rr(c, x - 30, y - 34, 60, 34, 3); c.fill(); c.fillStyle = '#3B5946'; c.fillRect(x - 30, y - 34, 60, 5); c.fillStyle = '#2E2E2E'; c.fillRect(x - 26, y - 2, 6, 3); c.fillRect(x + 20, y - 2, 6, 3);
  [x + 42, x + 58].forEach((cx2, i) => { c.fillStyle = i ? '#6E7681' : '#7E8792'; rr(c, cx2 - 8, y - 24, 16, 24, 2); c.fill(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; for(let q = -5; q <= 5; q += 3.4){ c.beginPath(); c.moveTo(cx2 + q, y - 22); c.lineTo(cx2 + q, y - 2); c.stroke(); }
    if(!(popped && i === 0)){ c.fillStyle = '#AEB6BE'; ell(c, cx2, y - 25, 9.5, 3); c.fill(); } });
  if(!popped){ const w = Math.sin(t * 7) > .7 ? 1.5 : 0; c.fillStyle = '#AEB6BE'; ell(c, x + 42 + w, y - 25 - w, 9.5, 3); c.fill(); }
};
WD.drawLamp = function(c, x, y){ c.fillStyle = '#2E2B33'; c.fillRect(x - 1.5, y - 62, 3, 62); rr(c, x - 6, y - 72, 12, 12, 2); c.fill(); c.fillStyle = '#FFE7A6'; rr(c, x - 4, y - 70, 8, 8, 1.5); c.fill(); };
WD.drawPond = function(c, x0, x1, t){
  c.fillStyle = '#5B9C4C'; rr(c, x0 - 6, 2, x1 - x0 + 12, 28, 10); c.fill();
  const g = c.createLinearGradient(0, 4, 0, 28); g.addColorStop(0, '#7FB6C8'); g.addColorStop(1, '#4F8BA4'); c.fillStyle = g; rr(c, x0, 5, x1 - x0, 21, 9); c.fill();
  c.fillStyle = 'rgba(241,232,212,.35)'; for(let x = x0 + 10; x < x1 - 40; x += 70) c.fillRect(x, 8, 46, 9);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; for(let i = 0; i < 9; i++){ const xx = x0 + 20 + ((i * 53 + t * 6) % (x1 - x0 - 40)); c.beginPath(); c.moveTo(xx, 12 + (i % 3) * 4); c.lineTo(xx + 10, 12 + (i % 3) * 4); c.stroke(); }
};
/* lawn + paver path. gaps: [[x0,x1]] where the path is cut (the canal) */
WD.drawLawn = function(c, opts){
  opts = opts || {}; const cam = WD.cam, half = WD.view.w / (2 * WD.view.S * cam.z);
  const x0 = Math.max(opts.from === undefined ? -1e9 : opts.from, cam.x - half - 40), x1 = Math.min(opts.to === undefined ? 1e9 : opts.to, cam.x + half + 40);
  if(x1 <= x0) return;
  const g = c.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#79BA55'); g.addColorStop(1, '#4E9A40'); c.fillStyle = g; c.fillRect(x0, 0, x1 - x0, 1600);
  c.fillStyle = 'rgba(255,255,255,.05)'; for(let x = Math.floor(x0 / 120) * 120; x < x1; x += 120){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 40, 0); c.lineTo(x + 140, 400); c.lineTo(x + 100, 400); c.fill(); }
  if(!opts.noPath){
    c.fillStyle = '#C9B596'; c.fillRect(x0, 36, x1 - x0, 64); c.fillStyle = '#D9C7A7'; c.fillRect(x0, 38, x1 - x0, 58);
    c.strokeStyle = 'rgba(122,98,70,.28)'; c.lineWidth = .8;
    for(let r = 0; r < 6; r++){ const y = 38 + r * 9.7; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); for(let x = Math.floor(x0 / 16) * 16 + (r % 2) * 8; x < x1; x += 16){ c.moveTo(x, y); c.lineTo(x, y + 9.7); } c.stroke(); }
    c.fillStyle = '#E9DCC4'; c.fillRect(x0, 34, x1 - x0, 3); c.fillRect(x0, 99, x1 - x0, 3);
  }
  c.strokeStyle = '#3F8436'; c.lineWidth = 1.2; for(let x = Math.floor(x0 / 50) * 50; x < x1; x += 50){ for(let i = 0; i < 4; i++){ const gx = x + ((x * 13 + i * 37) % 50 + 50) % 50, gy = 108 + ((x * 7 + i * 29) % 90 + 90) % 90; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx - 2, gy - 5); c.moveTo(gx, gy); c.lineTo(gx + 2, gy - 6); c.stroke(); } }
  for(let x = Math.floor(x0 / 90) * 90; x < x1; x += 90){ for(let i = 0; i < 3; i++){ const gx = x + ((x * 3 + i * 31) % 90 + 90) % 90, gy = 114 + ((x + i * 41) % 80 + 80) % 80; c.fillStyle = ['#F5F1E6', '#F7D23E', '#E8593C'][((x / 90 + i) % 3 + 3) % 3 | 0]; c.beginPath(); c.arc(gx, gy, 1.4, 0, 7); c.fill(); } }
};
WD.drawFront = function(t, items){
  const ctx = WD.ctx; WD.setLayer(1.28);
  items.forEach(f => { const x = f.x, y = 160;
    if(f.k === 'bush'){ ctx.fillStyle = '#244F2E'; [[0, 0, 34], [30, -8, 28], [58, 4, 30], [-26, 6, 24]].forEach(([dx, dy, r]) => { ell(ctx, x + dx * f.s, y + dy * f.s, r * f.s, r * f.s * .8); ctx.fill(); }); ctx.fillStyle = '#2F6538'; [[4, -10, 18], [34, -18, 14], [-20, -4, 12]].forEach(([dx, dy, r]) => { ell(ctx, x + dx * f.s, y + dy * f.s, r * f.s, r * f.s * .6); ctx.fill(); }); }
    else { ctx.save(); ctx.translate(x, y + 20); ctx.scale(f.s, f.s); ctx.rotate(Math.sin(t * .8 + x) * .04); for(let i = 0; i < 5; i++){ const a = -2.4 + i * .35; ctx.strokeStyle = i % 2 ? '#24572F' : '#2E6B36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a) * 40, Math.sin(a) * 50 - 10, Math.cos(a) * 80, Math.sin(a) * 40 + 10); ctx.stroke(); ctx.lineWidth = 2; for(let j = 2; j < 10; j++){ const u = j / 10, qx = Math.cos(a) * 80 * u, qy = Math.sin(a) * 45 * u - 8 * Math.sin(u * Math.PI); ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx - 4, qy + 14); ctx.moveTo(qx, qy); ctx.lineTo(qx + 6, qy + 13); ctx.stroke(); } } ctx.restore(); } });
};
WD.drawMotes = function(t){ const ctx = WD.ctx; ctx.save(); ctx.globalCompositeOperation = 'lighter'; WD.MOTES.forEach(m => { const x = m.x + Math.sin(t * .4 + m.p) * 14, y = m.y + Math.sin(t * .6 + m.p * 2) * 8; ctx.fillStyle = `rgba(255,236,190,${.25 + .2 * Math.sin(t * 2 + m.p)})`; ell(ctx, x, y, m.s, m.s); ctx.fill(); }); ctx.restore(); };
WD.drawVignette = function(warm){
  const ctx = WD.ctx, v = WD.view; ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  const g = ctx.createRadialGradient(v.w * .55, v.h * .45, Math.min(v.w, v.h) * .3, v.w * .5, v.h * .5, Math.max(v.w, v.h) * .8);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(46,26,70,.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, v.w, v.h);
  if(warm !== false){ const w = ctx.createLinearGradient(v.w, 0, 0, v.h); w.addColorStop(0, 'rgba(255,190,120,.1)'); w.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = w; ctx.fillRect(0, 0, v.w, v.h); }
};
/* an apartment entry: little porch with a door, lamp and number plaque, standing just behind the path */
WD.drawEntry = function(c, x, y, o){
  o = o || {}; const wall = o.wall || '#F1E8D4', trim = '#C29C6E', door = o.door || '#C9673E';
  c.fillStyle = 'rgba(40,28,60,.18)'; c.fillRect(x - 46, y - 2, 92, 4);
  c.fillStyle = wall; c.fillRect(x - 44, y - 84, 88, 84);
  c.fillStyle = shade(wall, -.06); c.fillRect(x - 44, y - 84, 88, 6);
  c.fillStyle = '#A78867'; c.beginPath(); c.moveTo(x - 52, y - 82); c.lineTo(x, y - 104); c.lineTo(x + 52, y - 82); c.closePath(); c.fill();
  c.fillStyle = trim; c.fillRect(x - 17, y - 58, 34, 58);
  c.fillStyle = door; rr(c, x - 14, y - 55, 28, 55, 2); c.fill();
  c.fillStyle = shade(door, -.18); rr(c, x - 10, y - 50, 9, 20, 1.5); c.fill(); rr(c, x + 1, y - 50, 9, 20, 1.5); c.fill(); rr(c, x - 10, y - 26, 9, 20, 1.5); c.fill(); rr(c, x + 1, y - 26, 9, 20, 1.5); c.fill();
  c.fillStyle = '#E8B84A'; c.beginPath(); c.arc(x + 9.5, y - 28, 1.8, 0, 7); c.fill();
  if(o.open){ c.fillStyle = '#2B2235'; rr(c, x - 14, y - 55, 28, 55, 2); c.fill(); c.fillStyle = door; c.save(); c.translate(x - 14, y - 55); c.transform(.35, -.12, 0, 1, 0, 0); c.fillRect(0, 0, 28, 55); c.restore(); }
  // lamp + plaque
  c.fillStyle = '#2E2B33'; rr(c, x + 22, y - 62, 7, 10, 2); c.fill(); c.fillStyle = '#FFE7A6'; rr(c, x + 23.5, y - 60.5, 4, 6, 1); c.fill();
  c.fillStyle = '#5B4A3A'; rr(c, x - 36, y - 64, 18, 11, 2); c.fill(); c.fillStyle = '#F6E7C6'; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.num || '', x - 27, y - 58);
  // window
  if(o.window){ c.fillStyle = trim; c.fillRect(x - 41, y - 46, 22, 26); c.fillStyle = o.lit ? '#FFD98A' : '#86A7C0'; c.fillRect(x - 39, y - 44, 18, 22); c.strokeStyle = '#FBF8F1'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 30, y - 44); c.lineTo(x - 30, y - 22); c.moveTo(x - 39, y - 33); c.lineTo(x - 21, y - 33); c.stroke(); }
  // mat + plant
  c.fillStyle = '#8A5A36'; rr(c, x - 16, y - 1, 32, 5, 2); c.fill();
  c.fillStyle = '#B5653A'; rr(c, x + 26, y - 14, 12, 14, 2); c.fill(); c.fillStyle = '#4F8E43'; [[0, -18, 7], [-5, -15, 5], [5, -15, 5]].forEach(([dx, dy, r]) => { ell(c, x + 32 + dx, y + dy, r, r * .9); c.fill(); });
  if(o.mail){ c.fillStyle = '#3E4A6B'; rr(c, x - 40, y - 18, 14, 10, 2); c.fill(); c.fillStyle = '#C2453A'; c.fillRect(x - 27, y - 22, 1.5, 7); }
};
/* community board (save point): cork board with flyers */
WD.drawBoard = function(c, x, y, t, poster){
  c.fillStyle = '#6E4A2E'; c.fillRect(x - 22, y - 46, 3.5, 46); c.fillRect(x + 18.5, y - 46, 3.5, 46);
  c.fillStyle = '#8A5A36'; rr(c, x - 26, y - 62, 52, 34, 3); c.fill(); c.fillStyle = '#C99A66'; rr(c, x - 23, y - 59, 46, 28, 2); c.fill();
  c.fillStyle = '#A78867'; c.beginPath(); c.moveTo(x - 30, y - 62); c.lineTo(x, y - 72); c.lineTo(x + 30, y - 62); c.closePath(); c.fill();
  c.fillStyle = '#FFF8EC'; c.save(); c.translate(x - 13, y - 46); c.rotate(-.08); c.fillRect(-7, -9, 14, 17); c.restore();
  c.fillStyle = '#BFE3F6'; c.save(); c.translate(x + 1, y - 48); c.rotate(.06); c.fillRect(-6, -7, 12, 13); c.restore();
  if(poster){ c.save(); c.translate(x + 13, y - 45); c.rotate(.05); c.fillStyle = '#FFFDF6'; c.fillRect(-7, -10, 14, 19); c.fillStyle = '#E8593C'; c.fillRect(-6, -9, 12, 3); c.fillStyle = '#A65A3A'; ell(c, 0, -1, 4, 3.4); c.fill(); c.restore(); }
  c.fillStyle = '#E8593C'; [[-13, -55], [1, -55], [13, -55]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + dx, y + dy, 1.2, 0, 7); c.fill(); });
  const a = .5 + .5 * Math.sin(t * 3); c.fillStyle = `rgba(255,201,74,${.35 + a * .4})`; star(c, x, y - 80 - a * 2, 5);
};

/* ================= interiors ================= */
/* David and Laura's apartment, cut away like a dollhouse */
WD.drawHomeRoom = function(c, t, st){
  st = st || {};
  // back wall
  c.fillStyle = '#F4E6CC'; c.fillRect(-60, -230, 860, 252);
  c.fillStyle = 'rgba(196,164,120,.12)'; for(let x = -60; x < 800; x += 22) c.fillRect(x, -230, 9, 252);
  c.fillStyle = '#E9D7B6'; c.fillRect(-60, -230, 860, 10);
  // floor
  const fg = c.createLinearGradient(0, 20, 0, 200); fg.addColorStop(0, '#C79763'); fg.addColorStop(1, '#A87A4B'); c.fillStyle = fg; c.fillRect(-60, 20, 860, 400);
  c.strokeStyle = 'rgba(90,58,30,.25)'; c.lineWidth = .8; for(let y = 30; y < 400; y += 12 + (y - 20) * .06){ c.beginPath(); c.moveTo(-60, y); c.lineTo(800, y); c.stroke(); }
  for(let r = 0; r < 14; r++){ const y = 30 + r * 13; for(let x = ((r * 47) % 90) - 60; x < 800; x += 90){ c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 12); c.stroke(); } }
  c.fillStyle = '#FFF8EC'; c.fillRect(-60, 14, 860, 7); c.fillStyle = 'rgba(90,58,30,.2)'; c.fillRect(-60, 21, 860, 2);
  // sliding patio door (left)
  const pdx = 20;
  c.fillStyle = '#F7F2EA'; c.fillRect(pdx - 4, -164, 118, 182);
  const sky = c.createLinearGradient(0, -160, 0, 14); sky.addColorStop(0, '#9CC7EE'); sky.addColorStop(.7, '#FCE3BC'); sky.addColorStop(1, '#8CC56A'); c.fillStyle = sky; c.fillRect(pdx, -160, 110, 174);
  c.fillStyle = '#6DB24E'; c.fillRect(pdx, -10, 110, 24);
  WD.drawPalm(c, pdx + 70, 4, 120, .05, t, 2, WD.PALMCOL, false);
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.moveTo(pdx + 8, -40); c.lineTo(pdx + 40, -160); c.lineTo(pdx + 52, -160); c.lineTo(pdx + 18, -40); c.fill();
  const slide = st.patioOpen ? 46 : 0;
  c.strokeStyle = '#E2DCD2'; c.lineWidth = 4; c.strokeRect(pdx, -160, 55, 174); c.strokeRect(pdx + 55 - slide, -160, 55, 174);
  if(st.patioOpen){ c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(pdx + 9, -160, 55, 174); }
  c.fillStyle = '#C9C2B5'; c.fillRect(pdx + 50 - slide, -80, 3, 18);
  // curtain
  const cw = Math.sin(t * 1.6) * (st.patioOpen ? 5 : 1.2);
  c.fillStyle = '#E9B8A0'; c.beginPath(); c.moveTo(pdx - 10, -172); c.lineTo(pdx + 14, -172); c.quadraticCurveTo(pdx + 18 + cw, -80, pdx + 12 + cw * 1.5, 18); c.lineTo(pdx - 10, 18); c.closePath(); c.fill();
  c.fillStyle = '#8A5A36'; c.fillRect(pdx - 16, -176, 148, 4);
  // kitchen: fridge, cabinets, counter, stove
  c.fillStyle = '#EDEFF1'; rr(c, 150, -150, 52, 168, 4); c.fill(); c.fillStyle = '#D9DDE1'; c.fillRect(150, -88, 52, 2.4); c.fillStyle = '#B9BEC4'; c.fillRect(193, -140, 3, 40); c.fillRect(193, -78, 3, 52);
  c.fillStyle = '#FFC94A'; c.beginPath(); c.arc(170, -120, 4, 0, 7); c.fill(); c.fillStyle = '#E8593C'; c.fillRect(176, -112, 9, 11); c.fillStyle = '#FFF'; c.fillRect(166, -104, 8, 10);
  c.fillStyle = '#EADFCB'; c.fillRect(206, -152, 140, 50); c.strokeStyle = '#CDBB9C'; c.lineWidth = 1.2; [206, 252, 298].forEach(x => { c.strokeRect(x + 3, -149, 41, 44); }); c.fillStyle = '#B59672'; [228, 274, 320].forEach(x => { c.fillRect(x - 6, -112, 12, 2); });
  c.fillStyle = '#E6EEF2'; c.fillRect(206, -102, 140, 72);
  c.fillStyle = 'rgba(160,190,205,.35)'; for(let x = 206; x < 346; x += 10) for(let y = -102; y < -30; y += 10) c.fillRect(x + 1, y + 1, 8, 8);
  c.fillStyle = '#5B4A3A'; c.fillRect(204, -34, 144, 6);
  c.fillStyle = '#EADFCB'; c.fillRect(206, -28, 140, 46); c.strokeStyle = '#CDBB9C'; [206, 252].forEach(x => c.strokeRect(x + 3, -25, 41, 40)); c.fillStyle = '#B59672'; [228, 274].forEach(x => c.fillRect(x - 6, -18, 12, 2));
  // stove
  c.fillStyle = '#3A3A40'; c.fillRect(300, -28, 46, 46); c.fillStyle = '#2A2A30'; c.fillRect(304, -18, 38, 26); c.fillStyle = '#5A5A62'; [310, 322, 334].forEach(x => { c.beginPath(); c.arc(x, -24, 1.5, 0, 7); c.fill(); });
  c.fillStyle = '#26262B'; c.fillRect(300, -36, 46, 3);
  if(!st.panDown){ c.fillStyle = '#2E2E33'; ell(c, 322, -38, 11, 3); c.fill(); c.fillRect(331, -39.5, 16, 2.6); c.fillStyle = '#F7D23E'; ell(c, 320, -39, 4, 1.4); c.fill(); }
  // coffee maker + mugs
  c.fillStyle = '#2E2E33'; rr(c, 232, -58, 16, 24, 2); c.fill(); c.fillStyle = '#5A3A24'; c.fillRect(235, -44, 10, 8);
  c.fillStyle = '#FFF8EC'; rr(c, 256, -41, 8, 8, 2); c.fill(); c.fillStyle = '#E8593C'; rr(c, 268, -41, 8, 8, 2); c.fill();
  // window over the bowl
  const wx = 400, wy = -150;
  c.fillStyle = '#F7F2EA'; c.fillRect(wx - 6, wy - 6, 112, 94);
  const ws = c.createLinearGradient(0, wy, 0, wy + 82); ws.addColorStop(0, '#A9D2F2'); ws.addColorStop(1, '#FCE3BC'); c.fillStyle = ws; c.fillRect(wx, wy, 100, 82);
  WD.drawPalm(c, wx + 30, wy + 82, 70, -.05, t, 4, { trunk: '#C6C0B4', leaf: '#3E8A44', leaf2: '#4FA04F' }, false);
  c.fillStyle = '#E7D9BE'; c.fillRect(wx + 56, wy + 40, 44, 42); c.fillStyle = '#A78867'; c.beginPath(); c.moveTo(wx + 52, wy + 42); c.lineTo(wx + 78, wy + 28); c.lineTo(wx + 104, wy + 42); c.fill();
  c.strokeStyle = '#F7F2EA'; c.lineWidth = 3; c.beginPath(); c.moveTo(wx + 50, wy); c.lineTo(wx + 50, wy + 82); c.moveTo(wx, wy + 41); c.lineTo(wx + 100, wy + 41); c.stroke();
  c.fillStyle = '#F7F2EA'; c.fillRect(wx - 10, wy + 86, 120, 5);
  // light rays onto the floor
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,224,160,.10)'; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + 100, wy); c.lineTo(wx + 170, 120); c.lineTo(wx + 40, 120); c.fill(); c.fillStyle = 'rgba(255,224,160,.08)'; c.beginPath(); c.moveTo(pdx, -160); c.lineTo(pdx + 110, -160); c.lineTo(pdx + 200, 120); c.lineTo(pdx + 60, 120); c.fill(); c.restore();
  // wall decor: a small wooden cross, a palm print, leash hook
  // wooden cross above the couch: soft shadow, wood grain, little highlight
  c.fillStyle = 'rgba(90,58,30,.18)'; rr(c, 545, -128, 10, 62, 2); c.fill(); rr(c, 529, -111, 42, 10, 2); c.fill();
  c.fillStyle = '#9A6436'; rr(c, 542, -131, 10, 62, 2); c.fill(); rr(c, 526, -114, 42, 10, 2); c.fill();
  c.fillStyle = '#B57A45'; c.fillRect(544, -129, 3, 58); c.fillRect(528, -112, 38, 3);
  c.strokeStyle = 'rgba(90,50,24,.35)'; c.lineWidth = .8; c.beginPath(); c.moveTo(549, -126); c.lineTo(549, -74); c.moveTo(531, -106); c.lineTo(564, -106); c.stroke();
  c.fillStyle = '#5B4A3A'; c.fillRect(598, -130, 46, 36); c.fillStyle = '#FCE3BC'; c.fillRect(601, -127, 40, 30); WD.drawPalm(c, 620, -97, 22, 0, t, 1, { trunk: '#8D8A86', leaf: '#3E8A44', leaf2: '#4FA04F' }, false);
  c.fillStyle = '#5B4A3A'; c.fillRect(688, -110, 10, 3); c.strokeStyle = '#E8593C'; c.lineWidth = 2; c.beginPath(); c.moveTo(693, -108); c.quadraticCurveTo(686, -70, 696, -62); c.stroke();
  // couch with blanket
  c.fillStyle = '#7A8FA6'; rr(c, 520, -46, 140, 44, 10); c.fill();
  c.fillStyle = '#8CA2B9'; rr(c, 524, -20, 132, 26, 8); c.fill(); rr(c, 510, -26, 20, 40, 8); c.fill(); rr(c, 650, -26, 20, 40, 8); c.fill();
  c.fillStyle = '#5E6E80'; c.fillRect(530, 12, 6, 8); c.fillRect(644, 12, 6, 8);
  c.fillStyle = '#E8C9A0'; c.beginPath(); c.moveTo(590, -30); c.quadraticCurveTo(630, -36, 650, -22); c.lineTo(652, 8); c.quadraticCurveTo(620, 14, 596, 6); c.closePath(); c.fill();
  c.strokeStyle = '#D6B080'; c.lineWidth = 1; for(let i = 0; i < 4; i++){ c.beginPath(); c.moveTo(600 + i * 12, -28); c.lineTo(598 + i * 12, 8); c.stroke(); }
  c.fillStyle = '#F1E1C4'; rr(c, 536, -40, 26, 18, 6); c.fill();
  // side table with a Bible
  c.fillStyle = '#8A5A36'; c.fillRect(674, -10, 26, 4); c.fillRect(678, -6, 3, 24); c.fillRect(693, -6, 3, 24);
  c.fillStyle = '#2E2A33'; rr(c, 678, -17, 18, 7, 1); c.fill(); c.fillStyle = '#E8B84A'; c.fillRect(686, -16, 1.2, 5); c.fillRect(684.4, -14.6, 4.4, 1.2);
  // front door (right)
  c.fillStyle = '#C29C6E'; c.fillRect(712, -150, 60, 170);
  c.fillStyle = st.frontOpen ? '#FCE3BC' : '#C9673E'; rr(c, 716, -146, 52, 164, 2); c.fill();
  if(!st.frontOpen){ c.fillStyle = '#B5562F'; rr(c, 722, -138, 18, 60, 2); c.fill(); rr(c, 744, -138, 18, 60, 2); c.fill(); rr(c, 722, -70, 18, 76, 2); c.fill(); rr(c, 744, -70, 18, 76, 2); c.fill(); c.fillStyle = '#E8B84A'; c.beginPath(); c.arc(760, -60, 3, 0, 7); c.fill(); }
  // rug
  c.fillStyle = 'rgba(232,89,60,.22)'; ell(c, 590, 70, 92, 20); c.fill(); c.strokeStyle = 'rgba(255,248,236,.45)'; c.lineWidth = 2; ell(c, 590, 70, 80, 15); c.stroke();
};
/* Veci's place: wall of hunting trophies */
WD.drawDenRoom = function(c, t, st){
  st = st || {};
  c.fillStyle = '#E3D2AE'; c.fillRect(-60, -230, 760, 252);
  c.fillStyle = '#8A5A36'; c.fillRect(-60, -70, 760, 92); c.strokeStyle = 'rgba(60,36,18,.35)'; c.lineWidth = 1; for(let x = -60; x < 700; x += 16){ c.beginPath(); c.moveTo(x, -70); c.lineTo(x, 22); c.stroke(); }
  c.fillStyle = '#5B4A3A'; c.fillRect(-60, -74, 760, 5);
  const fg = c.createLinearGradient(0, 20, 0, 200); fg.addColorStop(0, '#9E8C70'); fg.addColorStop(1, '#7E6C52'); c.fillStyle = fg; c.fillRect(-60, 20, 760, 400);
  c.strokeStyle = 'rgba(60,40,24,.18)'; c.lineWidth = .8; for(let y = 30; y < 400; y += 14 + (y - 20) * .06){ c.beginPath(); c.moveTo(-60, y); c.lineTo(700, y); c.stroke(); }
  // door (left)
  c.fillStyle = '#C29C6E'; c.fillRect(0, -150, 58, 170); c.fillStyle = '#6E5030'; rr(c, 4, -146, 50, 164, 2); c.fill(); c.fillStyle = '#E8B84A'; c.beginPath(); c.arc(46, -60, 3, 0, 7); c.fill();
  // trophy plaques
  const heads = [[140, -150, 1], [230, -160, 1.15], [320, -150, 1], [410, -158, .9]];
  heads.forEach(([x, y, s], i) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#5B3A22'; c.beginPath(); c.moveTo(-14, -16); c.lineTo(14, -16); c.lineTo(18, 0); c.lineTo(0, 22); c.lineTo(-18, 0); c.closePath(); c.fill(); c.fillStyle = '#7A5234'; c.beginPath(); c.moveTo(-10, -12); c.lineTo(10, -12); c.lineTo(13, 0); c.lineTo(0, 16); c.lineTo(-13, 0); c.closePath(); c.fill();
    if(i === 3){ // a big bass
      c.fillStyle = '#6E8A4A'; ell(c, 0, 2, 22, 9); c.fill(); c.beginPath(); c.moveTo(18, 2); c.lineTo(30, -8); c.lineTo(30, 12); c.closePath(); c.fill(); c.fillStyle = '#E6E2C2'; ell(c, -2, 6, 15, 4); c.fill(); c.fillStyle = '#1A1414'; c.beginPath(); c.arc(-14, 0, 1.6, 0, 7); c.fill(); c.strokeStyle = '#3F5A2A'; c.lineWidth = 1; c.beginPath(); c.moveTo(-20, 4); c.lineTo(-12, 4); c.stroke();
    } else {
      c.fillStyle = '#9A6E46'; ell(c, 0, 4, 9, 13); c.fill(); ell(c, 0, 16, 6, 6); c.fill(); c.fillStyle = '#5A3A24'; ell(c, 0, 21, 3, 2.2); c.fill();
      c.fillStyle = '#7A5234'; [[-10, -4, -.6], [10, -4, .6]].forEach(([ex, ey, a]) => { c.save(); c.translate(ex, ey); c.rotate(a); ell(c, 0, 0, 3, 6); c.fill(); c.restore(); });
      c.fillStyle = '#1A1414'; c.beginPath(); c.arc(-4, 6, 1.4, 0, 7); c.arc(4, 6, 1.4, 0, 7); c.fill();
      c.strokeStyle = '#E9DCC4'; c.lineWidth = 2; c.lineCap = 'round'; [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 4, -6); c.quadraticCurveTo(sd * 10, -22, sd * 16, -30); c.moveTo(sd * 8, -16); c.lineTo(sd * 16, -18); c.moveTo(sd * 11, -22); c.lineTo(sd * 10, -32); c.moveTo(sd * 6, -11); c.lineTo(sd * 3, -24); c.stroke(); });
    }
    c.restore();
  });
  // a "GEORGIA" pennant
  c.fillStyle = '#C2453A'; c.beginPath(); c.moveTo(500, -170); c.lineTo(580, -160); c.lineTo(500, -150); c.closePath(); c.fill(); c.fillStyle = '#FFF8EC'; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('GEORGIA', 506, -160);
  // TV with a hunting video
  c.fillStyle = '#26262B'; rr(c, 470, -128, 110, 66, 4); c.fill();
  const tvg = c.createLinearGradient(0, -122, 0, -68); tvg.addColorStop(0, '#9CC7A0'); tvg.addColorStop(1, '#4F7A3E'); c.fillStyle = tvg; c.fillRect(476, -122, 98, 54);
  c.fillStyle = '#3F5A2A'; for(let i = 0; i < 7; i++){ c.beginPath(); c.moveTo(478 + i * 14, -68); c.lineTo(485 + i * 14, -100 - (i % 3) * 6); c.lineTo(492 + i * 14, -68); c.fill(); }
  const dx = 500 + ((t * 8) % 60); c.fillStyle = '#7A5234'; ell(c, dx, -80, 7, 4); c.fill(); c.fillRect(dx - 5, -78, 1.4, 7); c.fillRect(dx + 4, -78, 1.4, 7); ell(c, dx + 7, -86, 3, 2.4); c.fill();
  c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(476, -122, 98, 18);
  c.fillStyle = '#5B4A3A'; c.fillRect(480, -62, 90, 6); c.fillRect(486, -56, 4, 74); c.fillRect(560, -56, 4, 74);
  // camo couch
  c.fillStyle = '#6E7B4A'; rr(c, 220, -44, 150, 44, 10); c.fill(); c.fillStyle = '#7F8C58'; rr(c, 224, -18, 142, 24, 8); c.fill(); rr(c, 208, -24, 22, 40, 8); c.fill(); rr(c, 360, -24, 22, 40, 8); c.fill();
  const R0 = rng(3); for(let i = 0; i < 30; i++){ c.fillStyle = ['#4F5A33', '#8A8B5C', '#3D4428'][i % 3]; ell(c, 214 + R0() * 162, -40 + R0() * 50, 4 + R0() * 5, 2 + R0() * 3, R0()); c.fill(); }
  // cooler + boots
  c.fillStyle = '#E8E4DA'; rr(c, 610, -30, 40, 28, 4); c.fill(); c.fillStyle = '#3E6FB5'; c.fillRect(610, -30, 40, 8); c.fillStyle = '#2E2E33'; c.fillRect(624, -34, 12, 3);
  c.fillStyle = '#5A4028'; rr(c, 80, -6, 12, 22, 3); c.fill(); rr(c, 94, -4, 12, 20, 3); c.fill(); c.fillStyle = '#3E2E20'; c.fillRect(80, 12, 30, 4);
  c.fillStyle = 'rgba(232,89,60,.18)'; ell(c, 300, 70, 100, 20); c.fill();
};
})();
