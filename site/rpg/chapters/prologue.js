/* =============================================================
   Where's Dayla? — Prologue: Where's Dayla?
   Tivoli Park, Deerfield Beach. Dayla vanishes mid-breakfast.
   Veci reads the trail, Alejandro joins, Sergeant Hairball guards the back lot.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { clamp, lerp, ease, rr, ell, star, rng, shade, esc } = WD.U;
const W = WD.W;
const D = () => WD.hero === 'David';
const F = k => WD.flag(k);
const S = (k, v) => WD.set(k, v);

/* the hero speaks: (David's line, Laura's line). Laura's can be { t, es } for Spanish */
async function me(dav, lau, expr){
  const L = D() ? dav : lau;
  if(L && typeof L === 'object') return WD.say(WD.hero, L.t, { es: L.es, expr: expr || L.expr });
  return WD.say(WD.hero, L, { expr });
}
const say = WD.say;
const dayla = (text) => say('Dayla', text, { ent: NPC.dayla });
function learnWord(es, en){ if(!D()) return; const G = WD.G; if(G.words.some(w => w[0] === es)) return; G.words.push([es, en]); WD.toast(`New Spanish word: ${es} = ${en}`); WD.pingBag(); }
WD.CLUES = { duck: 'Her yellow duck was left behind by the bowl.', print: 'A muddy boot print by the patio door, with a tiny paw print inside it.', glove: 'One small brown glove. Too small for someone that tall.', cats: 'Cat Agents in suits called Dayla “the package.”', sergeant: 'Sergeant Hairball said a van took her, for a rich “client.”', photo: 'A photo: Dayla at the UIC front desk, on papers stamped TRANSFER.' };
WD.VERSES = { luke15: { ref: 'Luke 15:4', en: 'What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it?', es: '¿Qué hombre de vosotros, teniendo cien ovejas, si perdiere una de ellas, no deja las noventa y nueve en el desierto, y va á la que se perdió, hasta que la halle?' } };
WD.SIGHTINGS = { uic: { short: '#1 · UIC', title: 'Sighting #1 · UIC front desk', text: 'Dayla at United International College, eating breakfast off a stack of papers stamped TRANSFER. She looks content. Leads to Chapter 1.' } };
function clue(k){ const G = WD.G; if(!G.clues.includes(k)) G.clues.push(k); }

/* ================= goal line ================= */
WD.updateGoal = function(){
  if(WD.chapterGoal && WD.W.area && WD.W.area.ch) return WD.chapterGoal(WD.W.area.ch);
  const n = ['duck', 'print', 'glove'].filter(k => F('clue_' + k)).length;
  const tries = ['try_call', 'try_joke', 'try_pan'].filter(F).length;
  let g = '';
  if(!F('intro')) g = '';
  else if(!F('taken')) g = tries < 3 ? `Get Dayla’s attention (${tries}/3)` : 'Take the trash out (front door)';
  else if(n < 3) g = `Look around the kitchen for clues (${n}/3)`;
  else if(!F('called')) g = 'Call ' + WD.spouse;
  else if(!F('met_veci')) g = 'Find Veci by the fountain';
  else if(!F('agents')) g = 'Follow the glowing tracks east, toward the dumpsters';
  else if(!F('canal')) g = 'Follow the trail past the courts and the pool';
  else if(!F('boss')) g = 'Follow the trail into the back lot';
  else if(!F('photo')) g = 'Pick up the photo the Sergeant dropped';
  else g = 'Prologue complete! Find Dayla’s lost toys, or rest up for Chapter 1';
  WD.setGoal(g);
};

/* ================= people on screen ================= */
const NPC = {};
function mkVeci(){ return WD.makeEnt({ kind: 'human', look: WD.LOOKS.Veci, name: 'Veci', x: 1060, y: 58, dir: 1, prop: phoneProp, frontArm: -1.2, talkTo: talkVeci, light: 'day' }); }
function phoneProp(c){ c.save(); c.translate(1, 16); c.rotate(-.3); c.fillStyle = '#1E1E24'; rr(c, -3, -5, 6, 10, 1.4); c.fill(); c.fillStyle = '#9FD3FF'; rr(c, -2.2, -4, 4.4, 8, 1); c.fill(); c.restore(); }
function trashProp(c){ c.save(); c.translate(0, 22); c.fillStyle = '#2E2E33'; c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(-9, 10, 0, 12); c.quadraticCurveTo(9, 10, 6, -4); c.closePath(); c.fill(); c.fillStyle = '#4A4A52'; c.fillRect(-2, -7, 4, 4); c.restore(); }
function panProp(c){ c.save(); c.translate(2, 17); c.rotate(-1.2); c.fillStyle = '#2E2E33'; c.fillRect(-1.2, -2, 2.4, 10); ell(c, 0, 13, 7, 2.6); c.fill(); c.restore(); }

/* ================= extra set pieces for Tivoli Park ================= */
WD.drawFitness = function(c, x, t){
  const w = 300, H = 84, base = 2;
  c.fillStyle = '#E9DCC4'; c.fillRect(x, base - H, w, H);
  c.fillStyle = '#C9673E'; c.fillRect(x - 6, base - H - 8, w + 12, 10);
  c.fillStyle = '#5B4A3A'; rr(c, x + w / 2 - 62, base - H - 26, 124, 18, 3); c.fill();
  c.fillStyle = '#F6E7C6'; c.font = '900 10px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FITNESS CENTER', x + w / 2, base - H - 17);
  const g = c.createLinearGradient(0, base - H + 12, 0, base - 6); g.addColorStop(0, '#9FC1D8'); g.addColorStop(1, '#6E92AC'); c.fillStyle = g; c.fillRect(x + 14, base - H + 12, w - 28, H - 20);
  c.fillStyle = 'rgba(40,40,52,.55)'; for(let i = 0; i < 4; i++){ const tx = x + 40 + i * 62; c.fillRect(tx, base - 26, 34, 6); c.fillRect(tx + 26, base - 46, 4, 22); c.fillRect(tx + 22, base - 48, 12, 4); }
  c.strokeStyle = '#F7F2EA'; c.lineWidth = 2; for(let i = 1; i < 5; i++){ c.beginPath(); c.moveTo(x + 14 + (w - 28) * i / 5, base - H + 12); c.lineTo(x + 14 + (w - 28) * i / 5, base - 8); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(x + 30, base - 8); c.lineTo(x + 90, base - H + 12); c.lineTo(x + 110, base - H + 12); c.lineTo(x + 50, base - 8); c.fill();
  c.fillStyle = '#4F8E43'; for(let sx = x + 6; sx < x + w; sx += 22){ ell(c, sx, base - 3, 11, 7); c.fill(); }
};
WD.drawHoop = function(c, x, base, s){
  s = s || 1; c.save(); c.translate(x, base); c.scale(s, s);
  c.fillStyle = '#3A3A40'; c.fillRect(-2.5, -118, 5, 118); c.fillRect(-2.5, -118, 16, 4);
  c.fillStyle = '#FBF8F2'; rr(c, 4, -146, 46, 32, 2); c.fill(); c.strokeStyle = '#C2453A'; c.lineWidth = 2; c.strokeRect(17, -136, 20, 14); c.strokeStyle = '#3A3A40'; c.lineWidth = 1; c.strokeRect(4, -146, 46, 32);
  c.strokeStyle = '#E8593C'; c.lineWidth = 2.2; ell(c, 27, -114, 10, 2.6); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = .8; for(let i = -4; i <= 4; i++){ c.beginPath(); c.moveTo(27 + i * 2.4, -113); c.lineTo(27 + i * 1.4, -98); c.stroke(); } c.beginPath(); c.moveTo(19, -107); c.lineTo(35, -107); c.moveTo(21, -101); c.lineTo(33, -101); c.stroke();
  c.restore();
};
WD.drawShed = function(c, x){
  const w = 220, H = 80, base = 2;
  c.fillStyle = '#B9BCC2'; c.fillRect(x, base - H, w, H);
  c.strokeStyle = 'rgba(80,84,92,.35)'; c.lineWidth = 1; for(let xx = x; xx < x + w; xx += 6){ c.beginPath(); c.moveTo(xx, base - H); c.lineTo(xx, base); c.stroke(); }
  c.fillStyle = '#7E8792'; c.beginPath(); c.moveTo(x - 10, base - H); c.lineTo(x + w / 2, base - H - 26); c.lineTo(x + w + 10, base - H); c.closePath(); c.fill();
  c.fillStyle = '#8E969F'; rr(c, x + 40, base - 58, 70, 58, 2); c.fill(); c.strokeStyle = 'rgba(60,64,70,.4)'; for(let yy = base - 56; yy < base; yy += 5){ c.beginPath(); c.moveTo(x + 40, yy); c.lineTo(x + 110, yy); c.stroke(); }
  c.fillStyle = '#C9673E'; rr(c, x + 140, base - 52, 26, 52, 2); c.fill();
  c.fillStyle = '#F2C14E'; rr(c, x + 132, base - 72, 70, 12, 2); c.fill(); c.fillStyle = '#2B1D14'; c.font = '900 7.5px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MAINTENANCE', x + 167, base - 66);
};
WD.drawFence = function(c, x0, x1, base, h, gateX){
  c.strokeStyle = 'rgba(150,156,164,.75)'; c.lineWidth = .8;
  for(let x = x0; x < x1; x += 8){ c.beginPath(); c.moveTo(x, base); c.lineTo(x + h * .5, base - h); c.moveTo(x + h * .5, base); c.lineTo(x, base - h); c.stroke(); }
  c.fillStyle = '#8E969F'; for(let x = x0; x <= x1; x += 60){ c.fillRect(x - 1.5, base - h - 2, 3, h + 2); }
  c.fillRect(x0, base - h - 3, x1 - x0, 2.5);
  if(gateX !== undefined){ c.fillStyle = '#6E7681'; c.fillRect(gateX - 30, base - h, 3, h); c.fillRect(gateX + 27, base - h, 3, h); c.strokeStyle = '#6E7681'; c.lineWidth = 2; c.strokeRect(gateX - 27, base - h + 4, 54, h - 6); }
};
/* full court seen from the side path: far baseline at y 2, near sideline at y 34 */
function drawCourt(c, x0, x1){
  const y0 = 2, y1 = 34, mid = (x0 + x1) / 2, ym = (y0 + y1) / 2, key = 74;
  WD.drawFence(c, x0 - 14, x1 + 14, y0, 42);
  c.fillStyle = '#B5562F'; c.fillRect(x0 - 10, y0 - 2, x1 - x0 + 20, y1 - y0 + 5);
  c.fillStyle = '#3F7E8E'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = '#4C8E9E'; c.fillRect(x0, y0, x1 - x0, 4);
  c.fillStyle = '#C2563A'; c.fillRect(x0, ym - 7, key, 14); c.fillRect(x1 - key, ym - 7, key, 14);
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.3;
  c.strokeRect(x0, y0, x1 - x0, y1 - y0);
  c.beginPath(); c.moveTo(mid, y0); c.lineTo(mid, y1); c.stroke();
  c.beginPath(); c.ellipse(mid, ym, 22, 7, 0, 0, Math.PI * 2); c.stroke();
  c.strokeRect(x0, ym - 7, key, 14); c.strokeRect(x1 - key, ym - 7, key, 14);
  c.beginPath(); c.ellipse(x0 + key, ym, 14, 7, 0, -Math.PI / 2, Math.PI / 2); c.stroke();
  c.beginPath(); c.ellipse(x1 - key, ym, 14, 7, 0, Math.PI / 2, Math.PI * 1.5); c.stroke();
  c.beginPath(); c.ellipse(x0 + 14, ym, 112, 15, 0, -Math.PI / 2, Math.PI / 2); c.stroke();
  c.beginPath(); c.ellipse(x1 - 14, ym, 112, 15, 0, Math.PI / 2, Math.PI * 1.5); c.stroke();
}
/* a hoop seen side-on: pole behind the baseline, arm, backboard edge, rim and net reaching over the key.
   dir = 1 faces right (left end of the court), -1 faces left (right end) */
function drawSideHoop(c, x, base, dir){
  c.save(); c.translate(x, base); c.scale(dir * .78, .78);
  c.fillStyle = 'rgba(40,28,60,.18)'; ell(c, 8, 1, 12, 2.5); c.fill();
  c.fillStyle = '#3A3A40'; rr(c, -3, -112, 6, 112, 2); c.fill(); c.fillStyle = '#2B2B30'; c.fillRect(-5, -4, 10, 4);
  c.fillStyle = '#3A3A40'; c.fillRect(0, -114, 16, 5); c.save(); c.translate(0, -104); c.rotate(-.55); c.fillRect(0, -1.5, 18, 3); c.restore();
  c.fillStyle = '#FBF8F2'; rr(c, 15, -132, 6, 38, 1.5); c.fill(); c.strokeStyle = '#3A3A40'; c.lineWidth = 1; c.strokeRect(15, -132, 6, 38);
  c.fillStyle = '#C2453A'; c.fillRect(17, -118, 2, 12);
  c.strokeStyle = '#E8593C'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(30, -102, 10, 2.6, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = .8; for(let i = -4; i <= 4; i++){ c.beginPath(); c.moveTo(30 + i * 2.4, -101); c.lineTo(30 + i * 1.3, -87); c.stroke(); }
  c.beginPath(); c.moveTo(22, -96); c.lineTo(38, -96); c.moveTo(24, -91); c.lineTo(36, -91); c.stroke();
  c.restore();
}
function drawPool(c, x0, x1, t){
  c.fillStyle = '#EDE6D8'; rr(c, x0 - 14, -8, x1 - x0 + 28, 44, 4); c.fill();
  const g = c.createLinearGradient(0, -2, 0, 30); g.addColorStop(0, '#7FD3E8'); g.addColorStop(1, '#3E9DC2'); c.fillStyle = g; rr(c, x0, -2, x1 - x0, 30, 3); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; for(let i = 0; i < 14; i++){ const xx = x0 + 12 + ((i * 61 + t * 9) % (x1 - x0 - 30)), yy = 2 + (i % 4) * 6; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 5, yy - 2, xx + 10, yy); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.12)'; for(let x = x0 + 20; x < x1 - 20; x += 46) c.fillRect(x, 4, 24, 3);
  c.strokeStyle = '#C9CCCF'; c.lineWidth = 1.8; [x0 + 30].forEach(lx => { c.beginPath(); c.moveTo(lx, -14); c.lineTo(lx, 10); c.moveTo(lx + 8, -14); c.lineTo(lx + 8, 10); c.stroke(); c.lineWidth = 1; for(let y = -4; y < 10; y += 5){ c.beginPath(); c.moveTo(lx, y); c.lineTo(lx + 8, y); c.stroke(); } });
  // umbrellas + loungers on the deck
  [[x0 + 120, '#E8593C'], [x0 + 300, '#3E8FC7'], [x0 + 420, '#F2C14E']].forEach(([ux, col], i) => { if(ux > x1 - 10) return;
    c.fillStyle = '#F7F2EA'; rr(c, ux - 24, 24, 40, 6, 3); c.fill(); c.fillStyle = shade(col, .5); rr(c, ux - 22, 21, 16, 5, 2.5); c.fill();
    c.fillStyle = '#8D8A86'; c.fillRect(ux - 1, -38, 2, 62); c.fillStyle = col; c.beginPath(); c.moveTo(ux - 30, -30); c.quadraticCurveTo(ux, -52, ux + 30, -30); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(ux - 10, -32); c.quadraticCurveTo(ux, -48, ux + 2, -31); c.closePath(); c.fill(); });
}
function drawCanal(c, x0, x1, t, st){
  c.fillStyle = '#5B8E46'; c.fillRect(x0 - 10, -10, x1 - x0 + 20, 420);
  c.fillStyle = '#8A7A5A'; c.fillRect(x0 - 2, -10, x1 - x0 + 4, 420);
  const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#3E7A6E'); g.addColorStop(.5, '#4F9488'); g.addColorStop(1, '#3E7A6E'); c.fillStyle = g; c.fillRect(x0 + 4, -10, x1 - x0 - 8, 420);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; for(let i = 0; i < 10; i++){ const yy = ((i * 37 + t * 14) % 200) - 4; c.beginPath(); c.moveTo(x0 + 10 + (i % 3) * 14, yy); c.lineTo(x0 + 18 + (i % 3) * 14, yy + 3); c.stroke(); }
  c.strokeStyle = '#3F7431'; c.lineWidth = 1.6; for(let y = 0; y < 200; y += 18){ [x0 + 2, x1 - 2].forEach((bx, i) => { c.beginPath(); c.moveTo(bx, y + 8); c.lineTo(bx + (i ? -4 : 4), y - 6 + Math.sin(t * 2 + y) * 1.5); c.stroke(); }); }
  // the concrete culvert pipe running across, mostly hidden in the shade
  c.fillStyle = 'rgba(20,24,30,.45)'; c.fillRect(x0 - 10, 30, x1 - x0 + 20, 70);
  if(st.ledge){ c.fillStyle = '#B9B3A8'; rr(c, x0 - 6, 46, x1 - x0 + 12, 9, 3); c.fill(); c.fillStyle = '#D7D1C5'; c.fillRect(x0 - 6, 46, x1 - x0 + 12, 3); for(let i = 0; i < 5; i++) WD.drawPaw(c, x0 + 6 + i * 13, 50, .7, 'rgba(60,60,70,.55)'); }
  if(st.plank){ c.fillStyle = '#9A6E46'; rr(c, x0 - 14, 60, x1 - x0 + 28, 12, 2); c.fill(); c.strokeStyle = 'rgba(60,36,18,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 - 12, 66); c.lineTo(x1 + 12, 66); c.stroke(); [x0, x1].forEach(nx => { c.fillStyle = '#5A4028'; c.beginPath(); c.arc(nx - 6, 66, 1.2, 0, 7); c.arc(nx + 6, 66, 1.2, 0, 7); c.fill(); }); }
}
function drawLot(c, x0, x1){
  c.fillStyle = '#7E7E7A'; c.fillRect(x0, -4, x1 - x0, 420);
  c.fillStyle = '#8A8A86'; c.fillRect(x0, -4, x1 - x0, 104);
  c.fillStyle = 'rgba(255,255,255,.75)'; for(let x = x0 + 60; x < x1; x += 90){ c.fillRect(x, 4, 3, 30); }
  c.fillStyle = 'rgba(40,40,44,.25)'; ell(c, x0 + 230, 70, 18, 5); c.fill();
  c.strokeStyle = 'rgba(30,30,34,.35)'; c.lineWidth = 3; [62, 74].forEach(y => { c.beginPath(); c.moveTo(x1 - 260, y); c.quadraticCurveTo(x1 - 140, y - 6, x1, y - 20); c.stroke(); });
  c.fillStyle = '#C9B596'; c.fillRect(x0, -6, x1 - x0, 3);
}
function drawCar(c, x, y){
  c.fillStyle = 'rgba(40,28,60,.22)'; ell(c, x, y + 2, 46, 6); c.fill();
  c.fillStyle = '#B9C3CC'; rr(c, x - 44, y - 24, 88, 20, 7); c.fill(); rr(c, x - 26, y - 40, 50, 20, 8); c.fill();
  c.fillStyle = '#8FB4D4'; rr(c, x - 22, y - 37, 20, 13, 3); c.fill(); rr(c, x + 1, y - 37, 20, 13, 3); c.fill();
  c.fillStyle = '#2E2E33'; [x - 26, x + 26].forEach(wx => { c.beginPath(); c.arc(wx, y - 4, 8, 0, 7); c.fill(); }); c.fillStyle = '#AAA'; [x - 26, x + 26].forEach(wx => { c.beginPath(); c.arc(wx, y - 4, 3, 0, 7); c.fill(); });
  c.fillStyle = '#FFE7A6'; rr(c, x + 38, y - 20, 6, 4, 1.5); c.fill();
}
function drawFicus(c, x, base, t){
  c.strokeStyle = '#7A6E5E'; c.lineCap = 'round';
  [[0, 0, -10, -50, 12], [-6, -40, -50, -70, 7], [-6, -40, 40, -78, 7], [0, -50, 6, -96, 5]].forEach(([a, b, x2, y2, lw]) => { c.lineWidth = lw; c.beginPath(); c.moveTo(x + a, base + b); c.quadraticCurveTo(x + (a + x2) / 2 + 6, base + (b + y2) / 2, x + x2, base + y2); c.stroke(); });
  c.strokeStyle = 'rgba(122,110,94,.6)'; c.lineWidth = 1.2; for(let i = 0; i < 8; i++){ c.beginPath(); c.moveTo(x - 40 + i * 12, base - 70); c.lineTo(x - 42 + i * 12 + Math.sin(t + i) * 1.5, base - 10); c.stroke(); }
  const R = rng(17); const blobs = Array.from({ length: 30 }, () => [x - 100 + R() * 200, base - 130 + R() * 70, 16 + R() * 18]);
  c.fillStyle = '#2E5E32'; blobs.forEach(([bx, by, r]) => { ell(c, bx, by + 5, r, r * .72); c.fill(); });
  c.fillStyle = '#3F7E3E'; blobs.forEach(([bx, by, r], i) => { if(i % 2){ ell(c, bx + Math.sin(t + i) * .8, by, r * .8, r * .55); c.fill(); } });
}

/* ================= AREA: home ================= */
const tryDone = () => F('try_call') && F('try_joke') && F('try_pan');
WD.defineArea('home', {
  name: 'Home', sub: 'Tivoli Park · Deerfield Beach', music: 'home', light: 'indoor', minX: 70, maxX: 700, laneTop: 46, laneBot: 92, camMin: -60, camMax: 800, camZ: .92, battleBack: 'walk',
  npcs(){
    const n = [];
    if(!F('taken')){ NPC.dayla = WD.makeEnt({ kind: 'dog', name: 'Dayla', x: 450, y: 62, dir: 1, eat: 1, light: 'indoor', talkTo: talkDayla, label: !F('try_call') ? 'Call her' : !F('try_joke') ? 'Joke' : 'Dayla', faceable: false }); n.push(NPC.dayla); }
    else NPC.dayla = null;
    return n;
  },
  drawBack(t){
    const c = WD.ctx; const v = WD.view;
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C79763'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1); WD.drawHomeRoom(c, t, { patioOpen: F('taken'), panDown: F('try_pan') });
    if(F('taken')){ WD.drawBowl(c, 471, 60, false); }
  },
  drawGround(t){
    const c = WD.ctx;
    if(F('taken')){
      if(!F('clue_print')){ WD.drawBootPrint(c, 112, 58, 1.1, -.2, .5 + .5 * Math.sin(t * 3)); WD.drawBootPrint(c, 150, 70, 1.1, -.1, 0); }
      else { WD.drawBootPrint(c, 112, 58, 1.1, -.2, 0); WD.drawBootPrint(c, 150, 70, 1.1, -.1, 0); }
      if(!F('clue_duck')){ c.save(); c.translate(492, 76); c.scale(.55, .55); WD.drawDuck(c, t); c.restore(); }
      if(!F('clue_glove')) WD.drawGlove(c, 254, 84, .9, .4);
    }
  },
  drawFront(t){ /* nothing in front indoors */ },
  things(){
    const L = [];
    L.push({ x: 176, y: 48, label: 'Fridge', h: 120, act: () => WD.cut(async () => {
      if(!F('got_arepa')){ S('got_arepa'); await me('Leftover arepas from the weekend. Taking one. For energy.', { t: 'Arepas from the weekend. I’m taking one, por si acaso.', es: 'Arepas del fin de semana. Me llevo una, por si acaso.' }, 'happy'); WD.giveItem('arepa', 1); await WD.itemGet('arepa', WD.ITEMS.arepa.name, WD.ITEMS.arepa.desc); }
      else await me('The fridge. Mostly hot sauce now.', 'La nevera. Nothing else to take.', 'smirk');
    }) });
    L.push({ x: 240, y: 48, label: 'Coffee', h: 92, act: () => WD.cut(async () => {
      if(!F('got_cafe')){ S('got_cafe'); await me('Coffee’s ready. Café con leche, to go.', { t: 'Café con leche, to go. Obviously.', es: 'Café con leche para llevar. Obvio.' }, 'joy'); WD.giveItem('cafe', 1); await WD.itemGet('cafe', WD.ITEMS.cafe.name, WD.ITEMS.cafe.desc); }
      else await me('Empty pot. I drank it all. No regrets.', 'Ya no hay café.', 'smirk');
    }) });
    if(!F('taken')) L.push({ x: 322, y: 48, label: F('try_pan') ? 'Stove' : 'Drop a pan', h: 90, act: dropPan });
    L.push({ x: 70, y: 52, label: 'Patio door', h: 120, act: () => WD.cut(async () => {
      if(!F('taken')) await me('The patio door. Closed. Sunny out there.', 'La puerta del patio. ¡Qué sol!', 'happy');
      else await me('Wide open. Somebody came in this way, and left this way.', { t: 'Abierta. Somebody came in through here.', es: 'Abierta. Alguien entró por aquí.' }, 'worried');
    }) });
    L.push({ x: 600, y: 50, label: F('taken') ? 'Rest' : 'Couch', h: 70, act: () => WD.cut(async () => {
      if(!F('taken')) await me('Dayla’s blanket is bunched up in the corner. Her favourite place to burrow.', { t: 'Su cobijita. Her favourite place to burrow.', es: 'Su cobijita. Su lugar favorito para esconderse.' }, 'happy');
      else { const G = WD.G; const P = G.partner && G.party[G.partner]; G.hp = G.mhp; G.sp = G.msp; if(P) P.hp = P.mhp; WD.sfx('heal'); await me('Sit for a second. Breathe. …Okay. Back to it.', { t: 'Respira. …Okay. Back to it.', es: 'Respira. …Okay. Sigamos.' }, 'determined'); WD.toast('HP and SP refilled'); WD.saveNow(); }
    }) });
    L.push({ x: 547, y: 46, label: 'Cross', h: 62, act: () => WD.cut(async () => {
      if(!F('taken')) await me('The little wooden cross on the wall.', 'La crucecita en la pared.', 'happy');
      else await me('Lord, keep her safe wherever she is. Help us bring her home.', { t: 'Lord, take care of her. Help us find her.', es: 'Dios mío, cuídala. Ayúdanos a encontrarla.' }, 'sad');
    }) });
    L.push({ x: 672, y: 46, label: 'Bible', h: 72, r: 30, act: () => WD.cut(async () => { await me('My Bible, right where I left it.', { t: 'My Bible, right where I left it.', es: 'Mi Biblia, donde la dejé.' }, 'happy'); }) });
    L.push({ x: 712, y: 62, label: 'Front door', h: 130, r: 70, act: frontDoor });
    if(F('taken') && !F('clue_print')) L.push({ x: 128, y: 62, label: 'Footprint', h: 30, act: () => clueGet('print') });
    if(F('taken') && !F('clue_duck')) L.push({ x: 492, y: 74, label: 'Duck', h: 34, act: () => clueGet('duck') });
    if(F('taken') && !F('clue_glove')) L.push({ x: 254, y: 82, label: 'Glove', h: 30, act: () => clueGet('glove') });
    if(F('taken') && ['duck', 'print', 'glove'].every(k => F('clue_' + k)) && !F('called')) L.push({ x: WD.W.player.x, y: WD.W.player.y, r: 999, label: 'Call ' + WD.spouse, h: 110, act: callSpouse });
    return L;
  },
  async enter(from){
    if(!F('intro')) return opening();
    if(F('taken') && !F('called')) WD.updateGoal();
  }
});
async function opening(){
  await WD.cut(async () => {
    const p = W.player; p.x = 330; p.y = 66; p.dir = 1;
    WD.cam.lock = true; WD.cam.x = 470; WD.cam.z = 1.5;
    await WD.wait(500);
    await WD.camTo(420, .95, 2400);
    await me('Morning. Coffee’s brewing, the sun’s out, and Dayla is eating like it’s her job.', { t: 'What a beautiful morning. Coffee, sunshine, and Dayla eating like it’s her full-time job.', es: 'Ay, qué mañana tan bonita. Café, sol, y Dayla comiendo como si fuera su trabajo.' }, 'happy');
    await dayla('(Munch munch munch. She has not looked up once.)');
    await me('Watch this. I bet I can get her to look up before that bowl is empty.', { t: 'Dayla, mi amor, look at mami! …Nothing. Okay. Challenge accepted.', es: '¡Dayla, mi amor, mira a mami! …Nada. Okay. Reto aceptado.' }, 'smirk');
    S('intro');
  });
  WD.updateGoal();
}
function talkDayla(){
  WD.cut(async () => {
    const d = NPC.dayla;
    if(!F('try_call')){
      await me('Dayla! Dayla. DAY-LA. …Buddy, I’m literally right here.', { t: 'Dayla. Dayla. ¡DAYLA! …Mi amor, I’m right here.', es: 'Dayla. Dayla. ¡DAYLA! …Mi amor, estoy aquí.' }, 'surprised');
      await dayla('(Munch. Munch. One ear twitches. That’s it.)'); S('try_call'); d.label = 'Joke';
    } else if(!F('try_joke')){
      await me('Hey Dayla. Why did the chicken cross the road? …To get to your bowl. That’s your bowl. Look at me.', { t: 'Look, Dayla! Mami’s doing a TikTok dance! …¿Nada? Rude.', es: '¡Mira, Dayla! ¡Mami está haciendo un baile de TikTok! …¿Nada? Grosera.' }, 'joy');
      WD.emote(W.player, 'note');
      await dayla('(Munch munch. Not even a tail wag.)'); S('try_joke'); d.label = 'Dayla';
    } else {
      await dayla('(Breakfast focus. She is in the zone. Nothing quiet is getting through.)');
      if(!F('try_pan')) await me('Okay. Time to get loud.', 'Okay. Necesito algo más ruidoso.', 'smirk');
    }
    if(tryDone()) await giveUp();
    WD.updateGoal();
  });
}
function dropPan(){
  WD.cut(async () => {
    if(F('try_pan')){ await me('The pan is on the floor now. It can stay there.', 'Ese sartén se queda en el piso.', 'smirk'); return; }
    const p = W.player; p.prop = panProp; p.frontArm = -2.4; await WD.wait(500);
    p.frontArm = 0; p.prop = null; S('try_pan'); WD.sfx('clang'); WD.shake(10); WD.emote(p, '!');
    await WD.wait(700);
    await dayla('(She didn’t flinch. Not even a little.)');
    await me('Unbelievable. A frying pan. On tile.', { t: '¡Ay, Dios mío! I scared myself more than her.', es: '¡Ay, Dios mío! Me asusté yo más que ella.' }, 'surprised');
    if(tryDone()) await giveUp();
    WD.updateGoal();
  });
}
async function giveUp(){
  await me('Fine. You win. I’m taking the trash out. Don’t go anywhere.', { t: 'Okay, you win, señorita. I’m taking the trash out. I’ll be right back.', es: 'Okay, tú ganas, señorita. Voy a sacar la basura. Ya vuelvo.' }, 'smirk');
  W.player.backProp = trashProp; W.player.backArm = .2;
}
function frontDoor(){
  WD.cut(async () => {
    if(!F('taken')){
      if(!tryDone()){ await me('Not yet. I’m getting her to look up first. It’s a matter of pride.', 'Todavía no. Primero tiene que mirarme.', 'determined'); return; }
      return kidnapping();
    }
    if(!['duck', 'print', 'glove'].every(k => F('clue_' + k))){ await me('Wait. Look around first. There has to be something.', 'Espera. Primero busca pistas.', 'worried'); return; }
    if(!F('called')){ await me(`I should call ${WD.spouse} first.`, `Primero llamo a ${WD.spouse}.`, 'worried'); return; }
    WD.sfx('door');
    WD.gotoArea('walk', 200, 52, { dir: 1, from: 'home' });
  });
}
/* the stranger, seen through the kitchen window */
const WINDOW = { mode: 'cutscene', ents: [] };
WINDOW.update = function(dt){ WD.tickGoals(WINDOW.ents, dt); WINDOW.ents.forEach(e => WD.tickEnt(e, dt)); if(WINDOW.carry){ const co = WINDOW.coat, d = WINDOW.dog; d.x = co.x + co.dir * 10; d.y = co.y + 1; d.z = 30 + Math.sin(co.walk) * 1.5; d.dir = co.dir; } };
WINDOW.draw = function(t){
  const c = WD.ctx, v = WD.view;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C79763'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
  WD.light = 'indoor';
  WD.setLayer(1); WD.drawHomeRoom(c, t, { patioOpen: WINDOW.open, panDown: true });
  if(WINDOW.bowl) WD.drawBowl(c, 471, 60, WINDOW.bowlFull);
  WINDOW.ents.slice().sort((a, b) => a.y - b.y).forEach(e => { if(!e.vis) return; const ds = .9 + (e.y - 44) / 48 * .14; const [sx, sy] = WD.toScreen(e.x, e.y); WD.paintEnt(e, sx, sy, v.dpr * v.S * WD.cam.z * ds); });
  WINDOW.ents.forEach(e => { if(!e.emote) return; const [sx, sy] = WD.toScreen(e.x, e.y - WD.headOf(e) - 14 - e.z); c.setTransform(v.dpr * v.S * WD.cam.z, 0, 0, v.dpr * v.S * WD.cam.z, sx, sy); WD.drawEmote(c, 0, 0, e.emote.kind, e.emote.t, 1); });
  // the outside wall, with the window cut out of it
  c.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  const ww = v.w * .62, wh = v.h * .56, wx = (v.w - ww) / 2, wy = v.h * .1;
  c.save(); c.beginPath(); c.rect(0, 0, v.w, v.h); c.rect(wx, wy, ww, wh); c.fillStyle = '#F1E8D4'; c.fill('evenodd');
  c.fillStyle = 'rgba(196,164,120,.10)'; for(let y = 0; y < v.h; y += 7) c.fillRect(0, y, v.w, 2);
  c.restore();
  c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.moveTo(wx + ww * .1, wy + wh); c.lineTo(wx + ww * .45, wy); c.lineTo(wx + ww * .55, wy); c.lineTo(wx + ww * .2, wy + wh); c.fill();
  c.strokeStyle = '#C29C6E'; c.lineWidth = 10; c.strokeRect(wx, wy, ww, wh);
  c.strokeStyle = '#FBF8F1'; c.lineWidth = 5; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
  c.fillStyle = '#C29C6E'; c.fillRect(wx - 16, wy + wh + 4, ww + 32, 10);
  c.fillStyle = '#B5653A'; [wx + 20, wx + ww - 50].forEach(px => { rr(c, px, wy + wh - 12, 30, 18, 3); c.fill(); }); c.fillStyle = '#4F8E43'; [wx + 35, wx + ww - 35].forEach(px => { [[0, -18, 11], [-8, -12, 8], [8, -12, 8]].forEach(([dx, dy, r]) => { ell(c, px + dx, wy + wh - 4 + dy, r, r * .9); c.fill(); }); });
  c.fillStyle = '#E8593C'; [wx + 26, wx + 44, wx + ww - 44, wx + ww - 26].forEach((px, i) => { c.beginPath(); c.arc(px, wy + wh - 26 - (i % 2) * 5, 3, 0, 7); c.fill(); });
  WD.drawVignette(true);
};
async function kidnapping(){
  const p = W.player;
  await WD.walkTo(p, 700, 62, 90); WD.sfx('door');
  await WD.fade(1, 350);
  // set up the window shot
  const coat = WD.makeEnt({ kind: 'coat', name: '???', x: 40, y: 60, dir: 1, light: 'indoor', oneGlove: true });
  const dog = WD.makeEnt({ kind: 'dog', name: 'Dayla', x: 450, y: 62, dir: 1, eat: 1, light: 'indoor' });
  Object.assign(WINDOW, { ents: [coat, dog], coat, dog, carry: false, open: false, bowl: false, bowlFull: true });
  NPC.dayla && (NPC.dayla.vis = false);
  WD.setScene(WINDOW, 'cutscene');
  WD.cam.lock = true; WD.cam.x = 330; WD.cam.z = 1.25;
  WD.MUS.play('mystery');
  await WD.fade(0, 500);
  await WD.narrate(D() ? '(Outside. Bag in the bin. You turn back toward the kitchen window…)' : '(Afuera. Trash in the bin. You turn back toward the kitchen window…)');
  WD.sfx('door'); WINDOW.open = true; await WD.wait(300);
  await WD.walkTo(coat, 400, 60, 55);
  WD.emote(W.player, '!');
  await me('…Who is THAT?', { t: '¿Y ese quién es?', es: '¿Y ese quién es?' }, 'surprised');
  coat.armRaise = .9; await WD.wait(400);
  WINDOW.bowl = true; WINDOW.bowlFull = true; dog.noBowl = true; WINDOW.carry = true;
  coat.armRaise = 0;
  await dayla('(She is being lifted into the air. She is still chewing.)');
  WINDOW.bowlFull = false;
  await me('HEY! Put her DOWN!', { t: '¡OIGA! ¡Suéltela!', es: '¡OIGA! ¡Suéltela!' }, 'angry');
  coat.dir = -1; WD.emote(coat, '!'); WD.sfx('whoosh');
  await WD.walkTo(coat, -60, 58, 150);
  WINDOW.carry = false; dog.vis = false;
  await WD.fade(1, 300);
  // back inside
  S('taken');
  await WD.gotoArea('home', 690, 64, { instant: true, cut: true, quiet: true, dir: -1 });
  W.player.backProp = null; W.player.backArm = 0;
  WD.mode = 'cutscene';
  WD.MUS.play('mystery');
  WD.cam.lock = true; WD.cam.x = 470; WD.cam.z = .95;
  await WD.fade(0, 400);
  await WD.walkTo(W.player, 520, 64, 160);
  await me('Dayla? …DAYLA!', { t: '¿Dayla? ¡DAYLA! ¡Mi amor!', es: '¿Dayla? ¡DAYLA! ¡Mi amor!' }, 'surprised');
  WD.emote(W.player, '...', 2);
  await WD.wait(900);
  await me('They took her. Somebody walked in and TOOK her. Mid-breakfast.', { t: 'Se la llevaron. Someone walked right in and took my baby. She didn’t even stop eating.', es: 'Se la llevaron. Alguien entró y se llevó a mi bebé. Ni siquiera dejó de comer.' }, 'sad');
  await me('Okay. Think. Whoever that was left something behind. Look around.', { t: 'Okay. Piensa. Whoever that was must have left something. Busca.', es: 'Okay. Piensa. Esa persona tuvo que dejar algo. Busca.' }, 'determined');
  WD.cam.lock = false;
  WD.updateGoal();
}
function clueGet(k){
  WD.cut(async () => {
    const p = W.player;
    if(k === 'duck'){
      await me('Her duck. She’d never leave this behind. Not on purpose.', { t: 'Su patico. She never goes anywhere without it.', es: 'Su patico. Ella nunca va a ningún lado sin él.' }, 'sad');
      WD.giveKey('duck'); S('clue_duck'); clue('duck'); WD.sfx('squeak'); await WD.itemGet('duck', WD.KEYS.duck.name, WD.KEYS.duck.desc);
      await me('I’m holding on to this until she’s home.', { t: 'Lo guardo hasta que vuelva a casa.', es: 'Lo guardo hasta que vuelva a casa.' }, 'determined');
    } else if(k === 'print'){
      await me('A muddy boot print by the patio door. And right in the middle of it… a tiny paw print?', { t: 'Una huella de bota, with mud. And in the middle… a little paw print?', es: 'Una huella de bota con barro. Y en el medio… ¿una patica?' }, 'think');
      WD.giveKey('print'); S('clue_print'); clue('print'); await WD.itemGet('print', WD.KEYS.print.name, WD.KEYS.print.desc, 'Clue');
    } else {
      await me('One brown glove. It’s tiny. Really tiny, for somebody that tall.', { t: 'Un guante. Tan chiquito, for someone so tall.', es: 'Un guante. Tan chiquito, para alguien tan alto.' }, 'think');
      WD.giveKey('glove'); S('clue_glove'); clue('glove'); await WD.itemGet('glove', WD.KEYS.glove.name, WD.KEYS.glove.desc, 'Clue');
    }
    WD.pingBag(); WD.updateGoal();
    if(['duck', 'print', 'glove'].every(x => F('clue_' + x))){ await WD.wait(300); await callSpouse(true); }
  });
}
async function callSpouse(inside){
  const run = async () => {
    if(F('called')) return;
    if(D()){
      await WD.phone('Laura', [
        { who: 'Laura', text: 'Hello? Babe, I’m at work, it’s crazy here…', es: '¿Aló? Amor, estoy en el trabajo, esto está loco…', expr: 'happy' },
        { who: 'David', text: 'Laura. Someone took Dayla. Walked in the back door and just… took her.', expr: 'sad' },
        { who: 'Laura', text: 'WHAT? What do you mean they took her?', es: '¿QUÉ? ¿Cómo que se la llevaron?', expr: 'surprised' },
        { who: 'David', text: 'Long coat, big hat. Left her duck, one glove and a muddy footprint. She didn’t even stop eating.', expr: 'worried' },
        { who: 'Laura', text: 'Of course she didn’t. Okay. Breathe. Go find Veci. He tracks deer up in Georgia. He can track anything.', expr: 'determined' },
        { who: 'Laura', text: 'I’ll call you the second I can get out of here. And David… we’re going to find her. You hear me?', es: 'Te llamo apenas pueda salir. Y David… la vamos a encontrar. ¿Me oíste?', expr: 'determined' },
        { who: 'David', text: 'Yeah. We will.', expr: 'determined' }
      ]);
    } else {
      await WD.phone('David', [
        { who: 'David', text: 'Hey, you okay? I’m at work, I’ve got a customer on hold…', expr: 'happy' },
        { who: 'Laura', text: 'David. Someone took Dayla. They walked in through the patio and took her.', es: 'David. Alguien se llevó a Dayla. Entró por el patio y se la llevó.', expr: 'sad' },
        { who: 'David', text: 'What? Who? …Is she okay?', expr: 'surprised' },
        { who: 'Laura', text: 'Long coat, big hat. Left her duck, one glove and a muddy footprint. She didn’t even stop eating, David.', es: 'Abrigo largo, sombrero grande. Dejó su patico, un guante y una huella de barro. Ni siquiera dejó de comer, David.', expr: 'worried' },
        { who: 'David', text: 'Of course she didn’t. Okay. Go get Veci. The guy tracks deer through the Georgia woods for fun.', expr: 'determined' },
        { who: 'David', text: 'I’ll get out of here as soon as I can. We’re getting her back. I promise.', expr: 'determined' },
        { who: 'Laura', text: 'I love you. Okay. Let’s go.', es: 'Te amo. Okay. Vamos.', expr: 'determined' }
      ]);
    }
    S('called'); WD.updateGoal(); WD.saveNow();
  };
  if(inside === true) return run();
  return WD.cut(run);
}

/* ================= AREA: Fountain Walk ================= */
const BUILD = [{ x: -260, w: 280 }, { x: 70, w: 250 }, { x: 380, w: 300 }, { x: 740, w: 260 }, { x: 1060, w: 300 }, { x: 1420, w: 260 }];
const R1 = rng(42);
const NEARPALMS = [{ x: 330, h: 190 }, { x: 420, h: 170 }, { x: 700, h: 205 }, { x: 765, h: 180 }, { x: 1065, h: 196 }, { x: 1130, h: 176 }, { x: 1290, h: 210 }, { x: 1380, h: 184 }, { x: 1560, h: 200 }].map(p => Object.assign(p, { lean: (R1() - .5) * .22, ph: R1() * 6 }));
const FRONT = Array.from({ length: 14 }, (_, i) => ({ x: -100 + i * 230 + R1() * 90, k: R1() < .45 ? 'frond' : 'bush', s: .8 + R1() * .5 }));
const TRACKS = Array.from({ length: 26 }, (_, i) => ({ x: 250 + i * 58, y: 58 + (i % 2) * 10, r: (i % 2 ? .1 : -.1) }));
WD.defineArea('walk', {
  name: 'Tivoli Park', sub: 'Deerfield Beach, Florida', music: 'park', minX: 150, maxX: 1880, battleBack: 'walk',
  exits: { right: { to: 'courts', x: 60, when: () => F('agents'), blocked: () => WD.cut(async () => { await me(F('met_veci') ? 'The tracks lead to the dumpsters first. Let’s check there.' : 'I don’t even know which way they went. Veci would.', F('met_veci') ? 'Las huellas van primero a los basureros.' : 'Ni sé por dónde se fueron. Veci sabría.', 'think'); }) } },
  npcs(){
    const n = [];
    if(!F('veci_gone') || F('p_done')){ NPC.veci = mkVeci(); if(F('p_done')){ NPC.veci.x = 1060; } n.push(NPC.veci); } else NPC.veci = null;
    if(F('taken')){
      NPC.alejandra = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Alejandra, name: 'Alejandra', x: 430, y: 52, dir: 1, talkTo: talkFriends });
      NPC.samuel = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Samuel, name: 'Samuel', x: 470, y: 58, dir: -1, talkTo: talkFriends });
      n.push(NPC.alejandra, NPC.samuel);
    }
    return n;
  },
  drawBack(t, dt){
    const c = WD.ctx;
    WD.drawOutdoorBack(t, dt);
    WD.setLayer(.55); BUILD.forEach(b => WD.drawBuilding(c, b)); WD.drawPoinciana(c, 40, 4, t); WD.drawPoinciana(c, 1000, 4, t + 2);
    c.fillStyle = 'rgba(255,226,180,.12)'; c.fillRect(WD.cam.x * .55 - WD.viewL * 1.2, -220, WD.viewL * 2.4, 230);
    WD.setLayer(.82); WD.drawClubhouse(c, 760, t);
    NEARPALMS.forEach(p => WD.drawPalm(c, p.x, 4, p.h, p.lean, t, p.ph, WD.PALMCOL, true));
    WD.setLayer(1); WD.drawLawn(c);
    WD.drawPond(c, 300, 560, t);
    WD.drawEntry(c, 200, 34, { num: 'HOME', window: true, lit: true, mail: true });
    WD.drawEntry(c, 1290, 34, { num: 'VECI', door: '#5E7A38', window: true });
    WD.drawBoard(c, 640, 34, t, F('posted'));
    WD.drawLamp(c, 720, 34); WD.drawLamp(c, 1580, 34);
    WD.drawFountain(c, 1130, 22, t);
    WD.drawGolfCart(c, 1480, 30);
    WD.drawTrash(c, 1730, 28, t, F('agents'));
    if(!F('toy_ball')){ c.fillStyle = '#7A5A3A'; ell(c, 576, 40, 12, 3.6); c.fill(); c.fillStyle = '#8E6A44'; ell(c, 574, 39, 7, 2); c.fill(); }
  },
  drawGround(t){ const c = WD.ctx; if(F('met_veci') && !F('canal')) TRACKS.forEach((p, i) => WD.drawBootPrint(c, p.x, p.y, .95, p.r, F('agents') ? 0 : .5 + .5 * Math.sin(t * 3 - i * .4))); },
  drawFront(t){ WD.drawMotes(t); WD.drawFront(t, FRONT); },
  things(){
    const L = [];
    L.push({ x: 200, y: 46, label: 'Home', h: 110, act: () => WD.gotoArea('home', 690, 64, { dir: -1, from: 'walk' }) });
    L.push({ x: 640, y: 46, label: 'Board', h: 96, act: board });
    L.push({ x: 1130, y: 48, label: 'Fountain', act: () => WD.cut(async () => { await me('The fountain. Dayla always tries to drink out of it.', { t: 'La fuente. Dayla always tries to drink from it.', es: 'La fuente. Dayla siempre intenta tomar de aquí.' }, F('taken') ? 'sad' : 'happy'); }) });
    L.push({ x: 1480, y: 52, label: 'Golf cart', act: () => WD.cut(async () => { await me('The maintenance golf cart. I could probably dunk off the roof of this thing.', 'El carrito de golf. If I take it to the mall, is that stealing?', 'smirk'); }) });
    L.push({ x: 400, y: 48, label: 'Pond', act: () => WD.cut(async () => { await me('The pond. Still no alligator. I check every morning.', { t: 'The pond looks so pretty with the red tree in the morning.', es: 'El lago se ve tan bonito con el árbol rojo en la mañana.' }, 'happy'); }) });
    L.push({ x: 1290, y: 46, label: F('met_veci') ? 'Veci’s place' : 'Veci’s door', h: 110, act: () => { if(!F('met_veci') || !F('veci_gone')) return WD.cut(async () => { await me('Veci’s door. He’s usually out by the fountain in the mornings.', 'La puerta de Veci. He’s usually out by the fountain in the mornings.', 'happy'); }); WD.sfx('door'); WD.gotoArea('den', 60, 62, { dir: 1, from: 'walk' }); } });
    if(F('agents') && W.partner && !F('toy_ball')) L.push({ x: 576, y: 50, skill: 'p', label: 'Sniff', h: 40, act: () => toyGet('ball', 'Tennis Ball', 'A slobbery yellow tennis ball, half buried by the pond.') });
    if(F('agents')) L.push({ x: 1730, y: 52, label: 'Dumpsters', act: () => WD.cut(async () => { await me('The Cat Agents’ hiding spot. Smells like tuna and bad decisions.', 'Huele a atún. Qué asco.', 'smirk'); }) });
    return L;
  },
  async enter(from){
    if(F('taken') && !F('walk_intro')){ S('walk_intro'); await WD.cut(async () => { await me('Okay. Veci. He’s usually by the fountain in the mornings, watching hunting videos.', { t: 'Okay. Veci. He’s always by the fountain in the morning watching hunting videos.', es: 'Okay. Veci. Siempre está en la fuente en la mañana viendo videos de cacería.' }, 'determined'); }); }
  },
  update(){
    const p = W.player;
    if(WD.mode === 'explore' && F('met_veci') && !F('agents') && p.x > 1590) dumpsterScene();
  }
});
function board(){
  WD.cut(async () => {
    if(F('taken') && !F('posted')){ S('posted'); await me('Community board. Pinning up a flyer. MISSING DOG. Have you seen her?', { t: 'Pongo un volante. PERRA PERDIDA. ¿La han visto?', es: 'Pongo un volante. PERRA PERDIDA. ¿La han visto?' }, 'determined'); }
    else await WD.narrate('(The community board. Yard sale flyers, a pool schedule, and a lost sunglasses notice.)');
    WD.saveNow(); WD.sfx('get'); WD.toast('Game saved');
  });
}
function talkVeci(){
  WD.cut(async () => {
    const v = NPC.veci, p = W.player; v.prop = null; v.frontArm = 0;
    if(F('p_done')){ await say('Veci', D() ? '¡Vecino! I heard you beat a cat with a hat. Next time, take me with you.' : '¡Vecina! I heard you beat a cat with a hat. Next time, take me with you.', { expr: 'joy' }); v.prop = phoneProp; v.frontArm = -1.2; return; }
    if(!F('taken')){ await say('Veci', '¡Buenos días! Look at this video. Ten-point buck up in Georgia.', { expr: 'happy' }); v.prop = phoneProp; v.frontArm = -1.2; return; }
    if(!F('met_veci')){
      await say('Veci', D() ? '¡Buenos días, vecino! …Oye, what happened? You look like you saw a ghost.' : '¡Buenos días, vecina! …Oye, what happened? You look like you saw a ghost.', { expr: 'happy' });
      learnWord('vecino', 'neighbour');
      await me('Someone took Dayla. Right out of our kitchen.', { t: 'Veci, someone took Dayla. Right out of our kitchen.', es: 'Veci, alguien se llevó a Dayla. De nuestra cocina.' }, 'sad');
      await say('Veci', 'What? Your little dog?! No, no, no. Not here. Not in my community.', { es: '¿Qué? ¿La perrita? No, no, no. Aquí no. No en mi comunidad.', expr: 'angry' });
      learnWord('perrita', 'little dog');
      await me('Look. A boot print. With a tiny paw print right inside it.', { t: 'Mira. A boot print, with a little paw print inside.', es: 'Mira. Una huella de bota, con una patica adentro.' }, 'worried');
      await say('Veci', 'Hmm. I’ve been tracking deer in the Georgia woods for years. Tracks don’t lie.', { expr: 'think' });
      await say('Veci', 'This boot is too small for a tall man. And this little paw, in the middle of every step? Somebody is hiding something under that coat.', { expr: 'think' });
      await say('Veci', 'Come. I’ll show you how a hunter reads a trail.', { expr: 'determined' });
      S('met_veci');
      WD.cam.lock = true; await WD.camTo(600, 1.0, 1400);
      WD.sfx('clue'); await WD.wait(300);
      await say('Veci', 'See them now? Mud from your patio. Fresh. They go east, past the golf cart, toward the dumpsters.', { expr: 'happy' });
      await WD.camTo(WD.camTarget(), 1.12, 900); WD.cam.lock = false;
      await say('Veci', 'Hunter tip: walk slow, look low. And if something jumps out at you… you hit it first. Press A right next to it.', { expr: 'smirk' });
      await say('Veci', 'Take this. Deer jerky. I made it myself. Good for energy.', { es: 'Toma. Carne seca de venado. La hice yo mismo. Buena para la energía.', expr: 'joy' });
      WD.giveItem('jerky', 2); await WD.itemGet('jerky', 'Veci’s Deer Jerky ×2', WD.ITEMS.jerky.desc);
      await say('Veci', 'Go. Follow the tracks. I’ll grab my boots and catch up.', { expr: 'determined' });
      WD.updateGoal(); WD.saveNow();
    } else if(!F('agents')){
      await say('Veci', 'Follow the tracks east. Walk slow, look low. I’m right behind you.', { expr: 'smirk' });
    }
    v.prop = phoneProp; v.frontArm = -1.2; v.expr = 'happy';
  });
}
async function dumpsterScene(){
  if(F('agents_scene')) return; S('agents_scene');
  await WD.cut(async () => {
    const p = W.player; p.move = 0;
    WD.cam.lock = true; await WD.camTo(1700, 1.18, 900);
    const a1 = WD.makeEnt({ kind: 'cat', look: WD.CATS.agent, name: 'Cat Agent', x: 1760, y: 50, dir: -1 });
    const a2 = WD.makeEnt({ kind: 'cat', look: WD.CATS.agent2, name: 'Cat Agent', x: 1790, y: 66, dir: -1 });
    W.npcs.push(a1, a2);
    WD.sfx('jump'); await Promise.all([WD.hop(a1, 1740, 54, 40, 500), WD.hop(a2, 1770, 70, 40, 560)]);
    a1.dir = 1; a2.dir = 1;
    await say('Cat Agent', '…Package is secure. Repeat, the package is secure.', { ent: a1, expr: 'happy' });
    await say('Cat Agent', 'Did you SEE that dog eat? Didn’t look up once. Kind of beautiful, honestly.', { ent: a2, expr: 'joy' });
    await say('Cat Agent', 'Focus. Sarge said nobody follows the trail. Nobody.', { ent: a1, expr: 'angry' });
    p.dir = 1; a1.dir = -1; a2.dir = -1; WD.emote(a1, '!'); WD.emote(a2, '!'); WD.sfx('hiss');
    await say('Cat Agent', '…Uh oh.', { ent: a2, expr: 'surprised' });
    await me('“The package.” You mean my DOG?', { t: '¿“El paquete”? That “package” is my baby. My dog-baby.', es: '¿“El paquete”? Ese “paquete” es mi bebé. Mi perrita.' }, 'angry');
    await say('Cat Agent', 'Agents! ENGAGE!', { ent: a1, expr: 'angry' });
    // Veci runs in
    const v = NPC.veci || mkVeci(); if(!NPC.veci){ NPC.veci = v; W.npcs.push(v); } v.x = WD.cam.x - 260; v.y = 70; v.prop = null; v.frontArm = 0;
    await WD.walkTo(v, p.x - 70, 76, 170);
    await say('Veci', '¡Oye! Wait for me! I’ll be right here in the crowd. Remember what I told you!', { ent: v, expr: 'determined' });
    const res = await WD.battle({ foes: ['agent', 'agent2'], back: 'walk', tips: true, crowdCap: '#C2453A' });
    W.npcs = W.npcs.filter(e => e !== a1 && e !== a2); delete WD.actors['Cat Agent'];
    if(res !== 'win'){ S('agents_scene', 0); p.x = 1450; WD.cam.lock = false; return; }
    S('agents'); clue('cats');
    WD.mode = 'cutscene'; WD.showControls(false); WD.letter = 1;
    v.x = p.x - 60; v.y = 76; v.dir = 1;
    WD.cam.lock = true; await WD.camTo(p.x + 40, 1.18, 600);
    await say('Veci', 'That’s how it’s done! Cats in suits, working for somebody. This is bigger than one dog.', { ent: v, es: '¡Así se hace! Gatos en traje, trabajando para alguien. Esto es más grande que una perrita.', expr: 'joy' });
    learnWord('¡Así se hace!', 'That’s how it’s done!');
    // Alejandro
    const al = WD.makePartner('alejandro'); al.x = 1480; al.y = 92; al.dir = -1; al.nervous = true; W.npcs.push(al); WD.actors.Alejandro = al;
    await say('Alejandro', 'Psst! Psst! Over here! By the golf cart!', { ent: al, expr: 'happy' });
    p.dir = -1; v.dir = 1;
    await WD.walkTo(al, p.x - 40, 84, 90); al.dir = 1;
    await me('Alejandro? The chihuahua Dayla always says hi to?', { t: '¡Alejandro! Dayla’s little friend!', es: '¡Alejandro! ¡El amiguito de Dayla!' }, 'surprised');
    await say('Alejandro', 'H-hi. Yes. Me. Alejandro. Long body, big ears, very trustworthy.', { ent: al });
    al.nervous = false;
    await say('Alejandro', 'I heard what happened. Dayla is my friend! I want to help. I have the best nose in all of Tivoli Park.', { ent: al, expr: 'happy' });
    await say('Alejandro', 'I can sniff out clues, dig up buried stuff and read scents. Like a tattletale, but helpful.', { ent: al });
    await say('Veci', 'A chihuahua tracker. I’ve seen stranger things in the woods.', { ent: v, expr: 'smirk' });
    await me('Can you smell this glove? The stranger dropped it.', { t: '¿Puedes oler este guante? Se le cayó al extraño.', es: '¿Puedes oler este guante? Se le cayó al extraño.' }, 'think');
    al.sniff = true; WD.sfx('sniff'); await WD.wait(900); al.sniff = false; WD.emote(al, 'sweat', 2); al.nervous = true;
    await say('Alejandro', 'That smells like… uh… leather! And… nobody! Smells like nobody I know! Ha! Ha. Let’s go!', { ent: al, expr: 'happy' });
    al.nervous = false;
    await say('Veci', 'Bueno. I have to get to work. The cars don’t fix themselves. My door is open if you need anything. Mi casa es tu casa.', { ent: v, expr: 'happy' });
    // Alejandro joins
    const G = WD.G; G.partner = 'alejandro'; G.party.alejandro = { hp: 8, mhp: 8 };
    W.npcs = W.npcs.filter(e => e !== al); W.partner = al; al.nervous = false; al.follow = true;
    WD.sfx('level');
    await WD.card(`<i class="k">New partner</i><h2>Alejandro joined you!</h2><p>Dayla’s friend from around the community. A black and white, long-bodied chihuahua with the best nose in Tivoli Park.</p><ul><li><b>🐾 Sniff</b> near clues and loose dirt to find things.</li><li>In battle: <b>Long-Body Spin</b> and <b>Nervous Yap</b>. <b>Sniff</b> tells you about an enemy.</li></ul>`, [{ label: 'Let’s go!', alt: true }]);
    S('veci_gone');
    await WD.walkTo(v, WD.cam.x - 400, 74, 120); W.npcs = W.npcs.filter(e => e !== v); NPC.veci = null;
    WD.cam.lock = false;
    WD.updateGoal(); WD.saveNow();
  });
}
function talkFriends(){
  WD.cut(async () => {
    const a = NPC.alejandra, s = NPC.samuel;
    if(!F('prayed')){
      if(D()){
        await say('Alejandra', 'David! Is everything okay? Where’s Dayla?', { ent: a, expr: 'worried' });
        await me('Someone took her. This morning. Right out of the kitchen.', '', 'sad');
        await say('Samuel', 'That’s awful. Can we pray with you real quick?', { ent: s, expr: 'sad' });
        await say('Samuel', 'Lord, watch over Dayla wherever she is, and help David and Laura bring her home. Amen.', { ent: s, expr: 'sleep' });
      } else {
        await say('Alejandra', '¡Laura! What happened? You look worried.', { ent: a, es: '¡Laura! ¿Qué pasó? Te ves preocupada.', expr: 'worried' });
        await me('', { t: 'Someone took Dayla. This morning.', es: 'Alguien se llevó a Dayla. Esta mañana.' }, 'sad');
        await say('Samuel', 'Seriously? Okay. Let’s pray right now.', { ent: s, es: '¿En serio? Okay. Oremos ahorita mismo.', expr: 'sad' });
        await say('Samuel', 'Lord, watch over Dayla wherever she is, and help them find her. Amen.', { ent: s, es: 'Señor, cuida a Dayla dondequiera que esté, y ayúdalos a encontrarla. Amén.', expr: 'sleep' });
      }
      await me('Amen. Thank you.', { t: 'Amén. Gracias.', es: 'Amén. Gracias.' }, 'happy');
      await say('Alejandra', D() ? 'We found this by the fountain this morning. I think it was meant for you.' : 'We found this by the fountain this morning. I think it’s for you.', { ent: a, es: D() ? null : 'Encontramos esto en la fuente esta mañana. Creo que es para ti.', expr: 'happy' });
      S('prayed'); const G = WD.G; G.verses.push('luke15'); G.msp += 1; G.sp = Math.min(G.msp, G.sp + 1);
      const V = WD.VERSES.luke15;
      await WD.itemGet('verse', 'Verse Stone: ' + V.ref, D() ? V.en : V.es);
      WD.toast('Max SP +1'); WD.pingBag();
    } else {
      await say(Math.random() < .5 ? 'Alejandra' : 'Samuel', D() ? 'We’ll keep praying. If we see a long coat around here, we’ll text you.' : 'We’ll keep praying. If we see a long coat, we’ll text you.', { es: D() ? null : 'Seguimos orando. Si vemos un abrigo largo por aquí, te escribimos.', expr: 'happy' });
    }
  });
}
async function toyGet(k, name, desc){
  await WD.cut(async () => {
    const a = W.partner, G = WD.G;
    if(a){ a.sniff = true; WD.sfx('sniff'); await WD.wait(800); a.sniff = false; WD.emote(a, '!'); }
    if(k === 'ball') await say('Alejandro', 'Dig dig dig… Found something! It’s slobbery. Definitely Dayla’s.', { expr: 'happy' });
    if(k === 'bone') await say('Alejandro', 'Under the couch! It squeaks! …Why is Dayla’s toy in Veci’s apartment?', { expr: 'happy' });
    G.toys.push(k); S('toy_' + k); WD.sfx('squeak');
    await WD.itemGet(k, name, desc + ` (Tivoli Park toys ${WD.toyCount(0)[0]}/3)`);
    if(WD.toyCount(0)[0] === 3){ WD.giveItem('cafe', 1); WD.giveItem('arepa', 1); await WD.itemGet('star', 'All 3 toys found!', 'Dayla is going to lose her mind. Bonus: Café con Leche and an arepa.'); }
    WD.pingBag(); WD.saveNow();
  });
}

/* ================= AREA: Veci's place ================= */
WD.defineArea('den', {
  name: 'Veci’s Place', sub: 'Tivoli Park', music: 'den', light: 'indoor', minX: 70, maxX: 640, laneTop: 46, laneBot: 92, camMin: -60, camMax: 700, camZ: .92, battleBack: 'walk',
  drawBack(t){ const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#9E8C70'; c.fillRect(0, 0, WD.cv.width, WD.cv.height); WD.setLayer(1); WD.drawDenRoom(c, t); },
  things(){
    const L = [];
    L.push({ x: 40, y: 60, label: 'Door', h: 130, r: 70, act: () => { WD.sfx('door'); WD.gotoArea('walk', 1290, 52, { dir: 1, from: 'den' }); } });
    L.push({ x: 275, y: 46, label: 'Trophies', h: 170, act: () => WD.cut(async () => { await me('Veci’s wall of trophies. Every single one comes with a twenty-minute story.', 'La pared de trofeos de Veci. Cada uno tiene su historia.', 'smirk'); }) });
    L.push({ x: 525, y: 48, label: 'TV', h: 120, act: () => WD.cut(async () => { await me('Paused on a hunting video. Of course it is.', 'Un video de cacería. Obvio.', 'smirk'); }) });
    L.push({ x: 630, y: 50, label: 'Cooler', h: 70, act: () => WD.cut(async () => { await me('A cooler full of ice. Always ready for a trip up to Georgia.', 'Una nevera llena de hielo. Siempre listo para Georgia.', 'happy'); }) });
    if(W.partner && !F('toy_bone')) L.push({ x: 300, y: 50, skill: 'p', label: 'Sniff', h: 60, act: () => toyGet('bone', 'Squeaky Bone', 'A squeaky bone, wedged under Veci’s couch.') });
    return L;
  },
  async enter(){ if(!F('den_seen')){ S('den_seen'); await WD.cut(async () => { await me('Veci’s place. Smells like coffee and… deer?', 'La casa de Veci. Huele a café y… ¿venado?', 'smirk'); }); } }
});

/* ================= AREA: Courts & Pool + back lot ================= */
const CANAL = [1250, 1320];
const C_BUILD = [{ x: -200, w: 260 }, { x: 860, w: 280 }, { x: 1600, w: 260 }];
const C_PALMS = [{ x: 60, h: 190 }, { x: 540, h: 200 }, { x: 640, h: 176 }, { x: 1170, h: 206 }, { x: 1400, h: 186 }, { x: 1760, h: 200 }].map(p => Object.assign(p, { lean: (R1() - .5) * .22, ph: R1() * 6 }));
const C_FRONT = Array.from({ length: 12 }, (_, i) => ({ x: -60 + i * 240 + R1() * 80, k: R1() < .5 ? 'frond' : 'bush', s: .8 + R1() * .5 }));
const C_TRACKS = Array.from({ length: 21 }, (_, i) => ({ x: 70 + i * 56, y: 58 + (i % 2) * 10, r: (i % 2 ? .1 : -.1) })).concat(Array.from({ length: 5 }, (_, i) => ({ x: 1360 + i * 56, y: 58 + (i % 2) * 10, r: (i % 2 ? .1 : -.1) })));
WD.defineArea('courts', {
  name: 'Courts & Pool', sub: 'Tivoli Park', music: 'courts', minX: 40, maxX: 1820, camZ: 1.0, battleBack: 'courts',
  exits: { left: { to: 'walk', x: 1860 } },
  limit(nx, px){
    if(F('canal')) return nx;
    if(px <= CANAL[0] - 5) return Math.min(nx, CANAL[0] - 10);
    if(px >= CANAL[1] + 5) return Math.max(nx, CANAL[1] + 10);
    return nx;
  },
  foes(){
    const f = [];
    const mk = (id, type, x, y, patrol, party) => Object.assign(WD.makeEnt({ kind: WD.FOES[type].kind, look: WD.FOES[type].look ? WD.CATS[WD.FOES[type].look] : null, name: WD.FOES[type].name, x, y, dir: -1 }), { fid: id, party, patrol });
    f.push(mk('courts_agent', 'agent', 520, 60, [420, 640], ['agent']));
    f.push(mk('courts_iguana1', 'iguana', 820, 66, [760, 940], ['iguana']));
    f.push(mk('courts_iguana2', 'iguana', 1060, 54, [990, 1150], ['iguana', 'agent2']));
    return f.filter(x => !F('beat_' + x.fid));
  },
  npcs(){
    const n = [];
    if(!F('boss')){ NPC.sarge = WD.makeEnt({ kind: 'cat', look: WD.CATS.sergeant, name: 'Sergeant Hairball', x: 1640, y: 62, dir: -1 }); n.push(NPC.sarge); } else NPC.sarge = null;
    return n;
  },
  drawBack(t, dt){
    const c = WD.ctx;
    WD.drawOutdoorBack(t, dt);
    WD.setLayer(.55); C_BUILD.forEach(b => WD.drawBuilding(c, b)); WD.drawFitness(c, 180, t); WD.drawPoinciana(c, 1500, 4, t);
    c.fillStyle = 'rgba(255,226,180,.12)'; c.fillRect(WD.cam.x * .55 - WD.viewL * 1.2, -220, WD.viewL * 2.4, 230);
    WD.setLayer(.82); WD.drawShed(c, 1440); C_PALMS.forEach(p => WD.drawPalm(c, p.x, 4, p.h, p.lean, t, p.ph, WD.PALMCOL, true)); drawFicus(c, 1180, 4, t);
    WD.setLayer(1);
    WD.drawLawn(c, { to: CANAL[0] - 6 });
    WD.drawLawn(c, { from: CANAL[1] + 6, to: 1340 });
    drawLot(c, 1340, 2100);
    drawCanal(c, CANAL[0], CANAL[1], t, { ledge: F('canal') && !D() || (F('ledge_seen') && !D()), plank: F('canal') && D() });
    drawCourt(c, 40, 520);
    drawSideHoop(c, 26, 18, 1); drawSideHoop(c, 534, 18, -1);
    if(D() && !F('toy_rope')){ WD.drawToy(c, 'rope', 512, -63, .8); }
    drawPool(c, 700, 1150, t);
    // pump room grate (dark)
    c.fillStyle = '#3A3A40'; rr(c, 1010, 4, 34, 26, 2); c.fill(); c.strokeStyle = '#6E7681'; c.lineWidth = 1.2; for(let i = 0; i < 6; i++){ c.beginPath(); c.moveTo(1014 + i * 5, 6); c.lineTo(1014 + i * 5, 28); c.stroke(); }
    if(!D() && F('rope_lit') && !F('toy_rope')) WD.drawToy(c, 'rope', 1027, 22, .8);
    WD.drawBoard(c, 660, 34, t, F('posted'));
    WD.drawFence(c, 1340, 1880, 32, 56, 1700);
    if(F('boss')) drawCar(c, 1560, 30);
    WD.drawLamp(c, 600, 34); WD.drawLamp(c, 1200, 34);
  },
  drawGround(t){
    const c = WD.ctx;
    if(!F('boss')) C_TRACKS.forEach((p, i) => { if(p.x > CANAL[0] - 20 && p.x < CANAL[1] + 20) return; WD.drawBootPrint(c, p.x, p.y, .95, p.r, .3 + .3 * Math.sin(t * 3 - i * .4)); });
    if(F('boss') && !F('photo')){ WD.drawPolaroid(c, 1660, 74, 14, .3, (c2, x, y, s) => WD.sightingUIC(c2, x, y, s)); }
    if(KAIROS.on){ /* drawn as an npc */ }
  },
  drawFront(t){ WD.drawMotes(t); WD.drawFront(t, C_FRONT); },
  things(){
    const L = [];
    const p = W.player;
    L.push({ x: 470, y: 48, label: 'Hoop', h: 64, act: () => WD.cut(async () => { if(D()) await me(F('toy_rope') ? 'Tivoli court. I’ve hit so many shots here. Not now. Focus.' : 'Wait. Is that Dayla’s rope toy, stuck up on the rim? I could dash in and dunk it loose.', '', F('toy_rope') ? 'smirk' : 'surprised'); else await me('', { t: 'David’s court. He’d stay here all day if I let him.', es: 'La cancha de David. Se quedaría aquí todo el día si lo dejo.' }, 'smirk'); }) });
    if(D() && !F('toy_rope')) L.push({ x: 470, y: 56, skill: 'b', label: 'Dunk!', h: 100, act: dunkToy });
    L.push({ x: 660, y: 46, label: 'Board', h: 96, act: board });
    L.push({ x: 900, y: 46, label: 'Pool', act: () => WD.cut(async () => { await me('The pool. Dayla thinks she can swim. She cannot.', { t: 'La piscina. Dayla thinks she can swim. No puede.', es: 'La piscina. Dayla cree que sabe nadar. No sabe.' }, 'smirk'); }) });
    if(!D() && !F('toy_rope')){
      L.push({ x: 1027, y: 46, label: F('rope_lit') ? 'Grab it' : 'Pump room', h: 60, act: () => WD.cut(async () => { if(!F('rope_lit')) await me('', 'Too dark in that grate to see anything. My flashlight would help.', 'think'); else await laraRope(); }) });
      L.push({ x: 1027, y: 50, skill: 'b', label: 'Light', h: 84, show: () => !F('rope_lit'), act: () => WD.cut(async () => { W.flash = .9; WD.sfx('light'); await WD.wait(500); S('rope_lit'); WD.emote(W.player, '!'); await me('', { t: 'Is that… Dayla’s rope toy? Down in the grate!', es: '¿Ese es… el juguete de cuerda de Dayla? ¡Ahí en la rejilla!' }, 'surprised'); }) });
    }
    if(W.partner && !F('decoy')) L.push({ x: 1180, y: 56, skill: 'p', label: 'Sniff', h: 50, decoy: true, act: decoySniff });
    if(!F('canal')){
      L.push({ x: 1236, y: 64, label: 'Canal', h: 70, act: () => WD.cut(async () => { await me('A drainage canal. Too wide to step over. The boot prints pick up again on the other side.', { t: 'Un canal. Too wide to cross. The prints keep going on the other side.', es: 'Un canal. Muy ancho para pasar. Las huellas siguen del otro lado.' }, 'think'); }) });
      L.push({ x: 1236, y: 64, skill: 'b', label: D() ? 'Dash & jump' : 'Light', h: 104, act: crossCanal });
    }
    if(F('boss') && !F('photo')) L.push({ x: 1660, y: 74, label: 'Photo', h: 30, sparkle: true, act: photoScene });
    if(F('boss')) L.push({ x: 1560, y: 56, label: 'Car', h: 70, act: carChapter1 });
    return L;
  },
  async enter(from){
    if(!F('courts_seen')){ S('courts_seen'); await WD.cut(async () => { await say('Alejandro', 'The trail goes this way! Past the court… toward the pool! Probably!', { expr: 'happy' }); }); }
  },
  update(){
    const p = W.player;
    if(WD.mode === 'explore' && !F('boss') && p.x > 1380 && !F('boss_scene')) bossScene();
  }
});
async function dunkToy(){
  await WD.cut(async () => {
    const p = W.player; p.dir = 1;
    await WD.walkTo(p, 370, 50, 110);
    await me('Dribble… dribble…', '', 'determined');
    W.dash = .6; WD.sfx('dash');
    await WD.walkTo(p, 452, 50, 240); WD.sfx('jump');
    await WD.tween(520, u => { p.z = Math.sin(u * Math.PI) * 48; p.x = lerp(452, 494, u); p.armRaise = -2.6 * Math.sin(u * Math.PI); });
    p.armRaise = 0; WD.shake(6); WD.sfx('cheer');
    S('toy_rope'); WD.G.toys.push('rope'); WD.sfx('squeak');
    await WD.itemGet('rope', 'Rope Tug', `Knocked it right off the rim. Still got it. (Tivoli Park toys ${WD.toyCount(0)[0]}/3)`);
    await me('And the crowd goes wild. (Alejandro. Alejandro is the crowd.)', '', 'joy');
    if(WD.toyCount(0)[0] === 3){ WD.giveItem('cafe', 1); WD.giveItem('arepa', 1); await WD.itemGet('star', 'All 3 toys found!', 'Dayla is going to lose her mind. Bonus: Café con Leche and an arepa.'); }
    WD.pingBag(); WD.saveNow();
  });
}
async function laraRope(){
  S('toy_rope'); WD.G.toys.push('rope'); WD.sfx('squeak');
  await WD.itemGet('rope', 'Rope Tug', `Fished out of the pump room grate. (Tivoli Park toys ${WD.toyCount(0)[0]}/3)`);
  if(WD.toyCount(0)[0] === 3){ WD.giveItem('cafe', 1); WD.giveItem('arepa', 1); await WD.itemGet('star', 'All 3 toys found!', 'Dayla is going to lose her mind. Bonus: Café con Leche and an arepa.'); }
  WD.pingBag(); WD.saveNow();
}
async function decoySniff(){
  await WD.cut(async () => {
    const a = W.partner; a.sniff = true; WD.sfx('sniff'); await WD.wait(900); a.sniff = false;
    await say('Alejandro', 'This way! Definitely… the pool! Into the pool! They went swimming!', { expr: 'happy' });
    await me('In a long coat? Carrying a dog?', { t: '¿Con abrigo? ¿Cargando una perra?', es: '¿Con abrigo? ¿Cargando una perra?' }, 'smirk');
    WD.emote(a, 'sweat', 2);
    await say('Alejandro', '…People do weird things.', { expr: 'surprised' });
    await me('The boot prints keep going. Straight to the canal.', { t: 'Las huellas siguen. Right to the canal.', es: 'Las huellas siguen. Directo al canal.' }, 'think');
    await say('Alejandro', 'Oh! Haha. Right. The canal. My nose is… seasonal.', { expr: 'happy' });
    S('decoy');
  });
}
async function crossCanal(){
  await WD.cut(async () => {
    const p = W.player, a = W.partner;
    if(D()){
      await me('Okay. Run-up. Just like a fast break.', '', 'determined');
      await WD.walkTo(p, 1150, 64, 120); p.dir = 1;
      W.dash = .8; WD.sfx('dash'); await WD.walkTo(p, 1240, 64, 260);
      WD.sfx('jump'); await WD.tween(620, u => { p.x = lerp(1240, 1340, u); p.z = Math.sin(u * Math.PI) * 54; });
      p.z = 0; WD.shake(5); WD.sfx('step');
      await say('Alejandro', 'Wait for meeee!', { expr: 'surprised' });
      a.pinned = true; await WD.hop(a, 1290, 50, 30, 420); await WD.hop(a, 1330, 66, 30, 420); a.pinned = false;
      await me('There’s an old board here. Let me knock it across so we’ve got a way back.', '', 'happy');
      WD.sfx('clang'); WD.shake(4);
    } else {
      p.dir = 1; W.flash = 1.4; WD.sfx('light');
      await WD.wait(600); S('ledge_seen'); WD.sfx('clue');
      await me('', { t: 'Under the big tree… a little concrete ledge along the pipe. With cat paw prints on it.', es: 'Debajo del árbol… un bordecito de cemento por el tubo. Con huellitas de gato.' }, 'think');
      await me('', { t: 'Okay. Like a runway. One foot in front of the other.', es: 'Okay. Como una pasarela. Un pie delante del otro.' }, 'determined');
      await WD.walkTo(p, 1236, 50, 80); await WD.walkTo(p, 1340, 50, 45); await WD.walkTo(p, 1350, 62, 60);
      a.pinned = true; await WD.walkTo(a, 1236, 50, 90); await WD.walkTo(a, 1330, 56, 60); a.pinned = false;
    }
    S('canal'); WD.updateGoal(); WD.saveNow();
  });
}
async function bossScene(){
  S('boss_scene');
  await WD.cut(async () => {
    const p = W.player, s = NPC.sarge, a = W.partner;
    WD.MUS.play('lot');
    WD.cam.lock = true; await WD.camTo(1560, 1.12, 900);
    WD.sfx('whistle'); WD.emote(s, '!');
    await say('Sergeant Hairball', 'HALT! Who goes there?!', { ent: s, expr: 'angry' });
    await say('Sergeant Hairball', 'I am Sergeant Hairball! This back lot is under MY command!', { ent: s, expr: 'angry' });
    await me('Cool. Where’s my dog?', { t: 'Very nice hat. Where is my dog?', es: 'Muy bonito tu sombrero. ¿Dónde está mi perra?' }, 'smirk');
    await say('Sergeant Hairball', 'The package left with the van ten minutes ago, civilian. Courtesy of the Coll— …of the CLIENT. The client.', { ent: s, expr: 'happy' });
    WD.emote(a, 'sweat', 2); a.nervous = true;
    await say('Alejandro', 'Th-the client! Never heard of him! Ha!', { expr: 'surprised' });
    a.nervous = false;
    await say('Sergeant Hairball', 'My orders: nobody follows the trail. And YOU, civilian, are following the trail!', { ent: s, expr: 'angry' });
    await say('Sergeant Hairball', 'Drop and give me twenty! …HAIRBALLS! HURK!', { ent: s, expr: 'angry' });
    WD.MUS.play('boss');
    const res = await WD.battle({ foes: ['sergeant'], back: 'lot', music: 'boss',
      intro: async (B, h) => { await h.bSay('Sergeant Hairball: “Atten-TION! You’re about to learn some DISCIPLINE!”', 1800); } });
    if(res !== 'win'){ S('boss_scene', 0); p.x = 1360; WD.cam.lock = false; WD.MUS.play('courts'); return; }
    // after the fight
    WD.mode = 'cutscene'; WD.showControls(false); WD.letter = 1;
    S('boss'); clue('sergeant');
    s.x = 1640; s.y = 62; s.expr = 'dizzy'; s.dir = -1;
    p.x = 1560; p.y = 64; p.dir = 1; a.x = 1530; a.y = 72; a.dir = 1;
    WD.cam.lock = true; WD.cam.x = 1600; WD.cam.z = 1.18;
    await say('Sergeant Hairball', 'Hurk… defeated… by a civilian and a… what IS that? A hot dog with ears?', { ent: s, expr: 'sad' });
    await say('Alejandro', 'Long-body chihuahua. Thank you very much.', { expr: 'angry' });
    await say('Sergeant Hairball', 'You’ll never catch that van! The client is very rich! And very… collect-y!', { ent: s, expr: 'angry' });
    s.dir = 1; await WD.hop(s, 1720, 40, 60, 700); await WD.hop(s, 1830, 20, 70, 700);
    W.npcs = W.npcs.filter(e => e !== s); NPC.sarge = null;
    WD.sfx('whoosh');
    await me('He dropped something. A photo?', { t: 'Se le cayó algo. ¿Una foto?', es: 'Se le cayó algo. ¿Una foto?' }, 'surprised');
    WD.cam.lock = false;
    WD.updateGoal(); WD.saveNow();
  });
}
const KAIROS = { on: false };
async function photoScene(){
  await WD.cut(async () => {
    const p = W.player, a = W.partner, G = WD.G;
    await WD.walkTo(p, 1640, 72, 90);
    S('photo'); clue('photo'); if(!G.photos.includes('uic')) G.photos[0] = 'uic';
    await WD.itemGet('photo', 'Sighting #1', 'Dayla at a front desk, eating breakfast off a stack of papers stamped TRANSFER. She looks… content.', 'Missing Dog poster');
    await me('That desk. That’s UIC. Laura’s work.', { t: '¡Esa es la recepción de UIC! That’s my work!', es: '¡Esa es la recepción de UIC! ¡Es mi trabajo!' }, 'surprised');
    WD.pingBag();
    // a black cat on the fence post
    const k = WD.makeEnt({ kind: 'cat', look: WD.CATS.kairos, name: 'Kairos', pose: 'sit', x: 1760, y: 33, z: 56, dir: -1, alpha: 0, noShadow: true });
    W.npcs.push(k); KAIROS.on = true;
    if(!D()){ await me('', { t: 'Achoo! …Achoo!', es: '¡Achís! …¡Achís!' }, 'surprised'); }
    await WD.tween(600, u => { k.alpha = u; });
    p.dir = 1; WD.emote(p, '!'); WD.sfx('meow');
    WD.cam.lock = true; await WD.camTo(1720, 1.35, 900);
    await say('Kairos', '…Mrrow.', { ent: k, expr: 'angry' });
    await WD.wait(400);
    k.dir = 1; await WD.hop(k, 1830, 20, 40, 500); k.vis = false; W.npcs = W.npcs.filter(e => e !== k); KAIROS.on = false;
    await WD.camTo(1660, 1.15, 700);
    await me('…That black cat. It looked exactly like Kairos.', { t: '…¿Kairos? No. It can’t be. …Can it?', es: '…¿Kairos? No. No puede ser. …¿O sí?' }, 'sad');
    WD.emote(a, 'sweat', 2); a.nervous = true;
    await say('Alejandro', 'Cats! Ha! So many cats around here lately. Wonder why! Nobody knows!', { expr: 'surprised' });
    a.nervous = false;
    if(D()){
      await WD.phone('Laura', [
        { who: 'Laura', text: 'David! You won’t believe this. There’s a cat in a suit at the UIC front desk asking for “transfer papers” for a Boston terrier!', es: '¡David! No me lo vas a creer. ¡Hay un gato en traje en la recepción de UIC pidiendo “papeles de transferencia” para una Boston terrier!', expr: 'surprised' },
        { who: 'David', text: 'I found a photo. Dayla, on that exact desk. I’m coming.', expr: 'determined' },
        { who: 'Laura', text: 'Okay. Hurry. And bring Veci’s jerky, I haven’t eaten.', es: 'Okay. Apúrate. Y trae la carne de Veci, no he comido.', expr: 'smirk' },
        { who: 'David', text: 'Also, I have a partner now. His name is Alejandro.', expr: 'smirk' },
        { who: 'Laura', text: 'Who is Alejandro?!', es: '¡¿Quién es Alejandro?!', expr: 'surprised' },
        { who: 'David', text: 'Long story. Long dog.', expr: 'joy' }
      ]);
    } else {
      await WD.phone('David', [
        { who: 'David', text: 'Babe, I just got out of work. Where are you?', expr: 'happy' },
        { who: 'Laura', text: 'In the back lot. I beat a cat sergeant. Don’t ask.', es: 'En el parqueadero de atrás. Le gané a un gato sargento. No preguntes.', expr: 'smirk' },
        { who: 'Laura', text: 'David, the photo… Dayla is at UIC. At my front desk.', es: 'David, la foto… Dayla está en UIC. En mi recepción.', expr: 'worried' },
        { who: 'David', text: 'Then that’s where we’re going. I’ll meet you there. Bring the duck.', expr: 'determined' },
        { who: 'Laura', text: 'Obviously.', es: 'Obvio.', expr: 'joy' }
      ]);
    }
    await prologueEnd();
  });
}
async function prologueEnd(){
  const G = WD.G;
  WD.MUS.play('end');
  if(!G.learned.includes('Love Attack')) G.learned.push('Love Attack');
  S('p_done'); G.chapter = 1; WD.saveNow();
  await WD.card(`<i class="k">Prologue complete</i><h2>Where’s Dayla?</h2><p>Dayla was taken by a stranger in a long coat, cats in suits are calling her “the package,” and a very rich “client” wants her. The first sighting points to United International College.</p><ul><li>Special move learned: <b>Love Attack</b> (2 SP)</li><li>Sighting #1 added to your Missing Dog poster</li><li>Dayla’s Lost Toys: ${WD.toyCount(0)[0]}/3</li></ul>`, [{ label: 'Continue', alt: true }]);
  const go = await WD.card(`<i class="k">Next</i><h2>Chapter 1: The Registrar’s Riddle</h2><p>United International College, Dania Beach. Somebody is forging Dayla’s transfer papers.</p><p>Drive there now, or look around Tivoli Park first. The car is parked right here in the back lot.</p>`, [{ label: 'Drive to UIC', alt: true }, { label: 'Stay a bit' }]);
  if(go === 0){ await WD.cut(async () => {}); return WD.startChapter(1); }
  WD.MUS.play('courts'); WD.updateGoal();
}
/* load a chapter's file and go there */
WD.startChapter = async function(n){
  try{ await WD.require('chapters/ch' + n); }catch(e){ console.error(e); WD.toast('Couldn’t load the next chapter. Check your connection.'); return; }
  if(WD.chapterStart && WD.chapterStart[n]) return WD.chapterStart[n]();
};
async function carChapter1(){
  await WD.cut(async () => {
    if(!F('p_done')){ await me('Our car. Not yet. I still have to look around.', 'Nuestro carro. Todavía no.', 'think'); return; }
    const i = await WD.choose(WD.hero, D() ? 'Our car. Head to UIC?' : 'Nuestro carro. ¿Vamos a UIC?', ['Drive to UIC', 'Not yet']);
    if(i === 0) await WD.startChapter(1);
  });
}

/* ================= title + boot ================= */
const TITLE = { mode: 'title' };
TITLE.update = function(dt, t){ WD.cam.x = 900 + Math.sin(t * .08) * 600; WD.cam.z = .9; WD.cam.y = 66; };
TITLE.draw = function(t, dt){ const A = WD.areas.walk; A.drawBack(t, dt); WD.setLayer(1); A.drawFront(t); WD.drawVignette(true); };
async function showTitle(){
  const G0 = WD.loadSave();
  if(G0 && G0.flags && G0.flags.p_done){ try{ await WD.require('chapters/ch1'); }catch(e){ console.error(e); } }
  const el = WD.$('.wd-title'); WD.setScene(TITLE, 'title'); WD.light = 'day'; WD.MUS.play('title');
  WD.showControls(false); WD.$('.wd-goal').hidden = true;
  const areaName = G0 ? (WD.areas[G0.area] || {}).name || 'Tivoli Park' : '';
  const chip = !G0 || !G0.flags.p_done ? 'Prologue · Tivoli Park' : G0.flags.c1_done ? 'Chapter 1 ✓ · Next: Bogotá' : 'Chapter 1 · The Registrar’s Riddle';
  el.innerHTML = `<div class="wd-logo"><h1>Where’s <span>Dayla?</span></h1><p class="chip">${esc(chip)}</p>
    <div class="wd-pick">${G0 ? `<button class="wd-cb alt" data-go="continue">Continue<small>Lv ${G0.lv} · ${esc(areaName)}${G0.flags.c1_done ? ' · Chapter 1 ✓' : G0.flags.p_done ? ' · Prologue ✓' : ''}</small></button><button class="wd-cb" data-go="new">New game<small>Start over</small></button>` : `<button class="wd-cb alt" data-go="new">Start<small>Play as ${esc(WD.hero)}</small></button>`}</div>
    <div class="wd-hint">Playing as ${esc(WD.hero)}. ${esc(WD.spouse)} has a separate save.<br>Move with the stick or arrow keys. A (or Space) to talk and act, B (X key) for your skill. Sound on for music.</div></div>`;
  el.hidden = false;
  const tap = () => { WD.audio(); WD.MUS.play('title'); };
  el.addEventListener('pointerdown', tap, { once: true });
  el.querySelectorAll('[data-go]').forEach(b => b.onclick = async () => {
    WD.audio(); WD.sfx('tap');
    if(b.dataset.go === 'continue'){ el.hidden = true; return resume(G0); }
    if(G0){ const i = await WD.card(`<i class="k">New game</i><h2>Start over?</h2><p>This erases ${esc(WD.hero)}’s saved progress (Lv ${G0.lv}). ${esc(WD.spouse)}’s save isn’t touched.</p>`, [{ label: 'Start over', alt: true }, { label: 'Cancel' }]); if(i !== 0) return; }
    el.hidden = true; newGame();
  });
  const f = el.querySelector('[data-go]'); if(f) f.focus({ preventScroll: true });
}
function makeHero(){ WD.asDayla = false; W.player = WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.hero], name: WD.hero, x: 330, y: 66 }); W.partner = WD.G.partner ? WD.makePartner() : null; if(W.partner) W.partner.follow = true; }
async function newGame(){
  const G = WD.newSave(); G.items = {}; G.started = 1; WD.G = G;
  makeHero();
  await WD.card(`<i class="k">Prologue</i><h2>Where’s Dayla?</h2><p>Tivoli Park, Deerfield Beach. A sunny morning. Dayla is eating breakfast, and nothing in the world can distract her.</p>`, [{ label: 'Begin', alt: true }]);
  await WD.gotoArea('home', 330, 66, { dir: 1, cut: true, quiet: false });
}
async function resume(G0){
  G0.started = 1; WD.G = G0;
  // repair saves that were closed in the middle of a scene
  if(F('agents_scene') && !F('agents')) S('agents_scene', 0);
  if(F('boss_scene') && !F('boss')) S('boss_scene', 0);
  if(F('agents') && !G0.partner){ G0.partner = 'alejandro'; G0.party.alejandro = { hp: 8, mhp: 8 }; S('veci_gone'); }
  if(F('boss') && !F('photo') && G0.area !== 'courts'){ G0.area = 'courts'; G0.x = 1600; G0.y = 66; }
  G0.pins = G0.pins || []; G0.worn = G0.worn || [];
  if(F('p_done')){ try{ await WD.require('chapters/ch1'); }catch(e){ console.error(e); } }
  if(WD.repairSave) WD.repairSave(G0);
  makeHero();
  const A = WD.areas[G0.area] ? G0.area : 'home';
  await WD.gotoArea(A, G0.x || 330, G0.y || 66, { dir: 1 });
  if(WD.afterResume) WD.afterResume();
}
WD.beforeSave = G => { if(WD.asDayla) return; if(W.player && W.area && !W.area.noSave){ G.area = W.area.id; G.x = Math.round(W.player.x); G.y = Math.round(W.player.y); } };
WD.boot = showTitle;
})();
