/* =============================================================
   Where's Dayla? — Chapter 1: The Registrar's Riddle
   United International College, Dania Beach (with a Miramar flashback).
   The Collector's agents forged Dayla's "transfer papers". Three real stamps
   prove it; Chunkers joins; the Dean of Detention guards the old gym.
   Then the first Dayla interlude.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { clamp, lerp, ease, rr, ell, star, rng, shade, esc } = WD.U;
const W = WD.W;
const D = () => WD.hero === 'David';
const F = k => WD.flag(k);
const S = (k, v) => WD.set(k, v);
const say = WD.say;
async function me(dav, lau, expr){
  const L = D() ? dav : lau;
  if(L && typeof L === 'object') return WD.say(WD.hero, L.t, { es: L.es, expr: expr || L.expr });
  return WD.say(WD.hero, L, { expr });
}
function learnWord(es, en){ if(!D()) return; const G = WD.G; if(G.words.some(w => w[0] === es)) return; G.words.push([es, en]); WD.toast(`New Spanish word: ${es} = ${en}`); WD.pingBag(); }
function clue(k){ const G = WD.G; if(!G.clues.includes(k)) G.clues.push(k); }
const spouseNPC = () => NPC.spouse;
const NPC = {};
WD.ENGLISH_WITH_DAVID = ['Lydia', 'Angelica', 'Leonela', 'Marcela', 'David Lesser'];
const MAR = '#7A1F2B', MARD = '#5E1621', MARL = '#A33A4A', CREAM = '#F2EADB', GOLD = '#E8B84A';
const CHUNK = () => W.partner && WD.G.partner === 'chunkers' ? W.partner : null;
const chunkers = (text, expr) => say('Chunkers', text, { expr });
const alejandro = (text, expr) => say('Alejandro', text, { expr });

/* ================= data ================= */
WD.NAMECOL = WD.NAMECOL || {};
Object.assign(WD.NAMECOL, { Chunkers: '#B9804C', Angelica: '#2F3550', 'David Lesser': '#3E6FB5', Marcela: '#C98A1A', Lydia: '#7A3E6B', Leonela: '#C2303A', 'The Dean of Detention': '#1E1E26', 'Paper-Clip Cat': '#6E6255', 'Hall-Monitor Cat': '#B86E3E' });
WD.ITEMS.pandebono = { name: 'Pandebono', icon: 'pandebono', desc: 'Warm Colombian cheese bread from Angelica. Heals 4 HP and 1 SP.', hp: 4, sp: 1 };
Object.assign(WD.KEYS, {
  papers: { name: 'Dayla’s “Transfer Papers”', icon: 'papers', get desc(){ const n = ['stamp_reg', 'stamp_eng', 'stamp_media'].filter(F).length; return `Forged papers moving “Dayla Rhead” to an institution called The Collection. Real UIC stamps to compare: ${n}/3.`; } },
  record: { name: 'Dayla’s Real Record', icon: 'record', desc: 'From the Registrar’s files. Status: very good girl. Transfers: NONE. Notes: does not look up while eating.' },
  camera: { name: 'Marcela’s Camera', icon: 'camera', desc: 'Lent by Marcela for the photo hunt. Very expensive. Do not drop it in the fountain.' },
  gymkey: { name: 'Old Gym Key', icon: 'gymkey', desc: 'President Lydia’s key to the old gym. It was around her neck the whole time.' },
  order: { name: 'Original Transfer Order', icon: 'papers', desc: 'Dropped by the Dean of Detention. Forwarding stamp: BOGOTÁ, COLOMBIA.' }
});
Object.assign(WD.CLUES, { forged: 'The transfer papers are forged. None of UIC’s three real stamps match.', gymphoto: 'Marcela’s photo: Cat Agents sneaking into the old gym with a mortarboard. (And something long and black-and-white in the corner…?)', bogota: 'The original transfer order is forwarded to BOGOTÁ, Colombia.' });
Object.assign(WD.CLUE_ICON, { forged: ['papers', 'Forged papers'], gymphoto: ['gymphoto', 'Gym photo'], bogota: ['stamp', 'Bogotá stamp'] });
WD.SIGHTINGS.gym = { short: '#2 · Old gym', title: 'Sighting #2 · UIC old gym', text: 'Dayla in a tiny graduation cap on the old gym bleachers, eating off papers stamped BOGOTÁ. Leads to Chapter 2.' };
Object.assign(WD.TOYS, { sock: { name: 'Knotted Sock', ch: 1, where: 'UIC', desc: 'Dug out of the planter by the eagle ray statue.' }, frisbee: { name: 'Flying Disc', ch: 1, where: 'UIC', desc: 'Behind President Lydia’s cabinet. How?' }, pig: { name: 'Squeaky Pig', ch: 1, where: 'UIC', desc: 'Rescued from the old gym. Still squeaks.' } });
WD.VERSES.ps121 = { ref: 'Psalm 121:8', en: 'The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore.', es: 'Jehová guardará tu salida y tu entrada, Desde ahora y para siempre.' };

/* ================= enemies ================= */
Object.assign(WD.FOES, {
  clipcat: { name: 'Paper-Clip Cat', kind: 'cat', look: 'clip', hp: 8, atk: 2, xp: 18, smart: true,
    moves: [{ id: 'swipe', name: 'Claw Swipe', type: 'melee', dmg: 2, w: 3, delay: [0, 420], feint: .3 }, { id: 'fling', name: 'Clip Fling', type: 'barrage', dmg: 1, n: 2, w: 2, proj: 'clip', rhythm: [560, 340] }],
    tattle: 'A Paper-Clip Cat. Office cat on the Collector’s payroll. HP 8, Attack 2. His Claw Swipe sometimes fakes you out, so wait for the real one. Hoards paper clips. Nobody knows why. He doesn’t either.' },
  stapler: { name: 'Stapler Critter', kind: 'stapler', hp: 7, atk: 2, def: 1, xp: 18,
    moves: [{ id: 'chomp', name: 'Chomp', type: 'melee', dmg: 2, w: 2, feint: .4, speed: 420 }, { id: 'spray', name: 'Staple Spray', type: 'barrage', dmg: 1, n: 3, w: 2, proj: 'staple', rhythm: [500, 280, 660] }],
    tattle: 'A Stapler Critter. HP 7, Armour 1: every hit does 1 less, but Superguard counters go right through. Chomp hits for 2 and loves a fake-out. Staple Spray fires three times, unevenly: ba-bap… bap.' },
  bat: { name: 'Tardy Bat', kind: 'bat', hp: 5, atk: 1, xp: 14, twice: true,
    moves: [{ id: 'swoop', name: 'Late Swoop', type: 'melee', dmg: 1, w: 3, delay: [0, 650] }, { id: 'slip', name: 'Tardy Slip', type: 'detain', dmg: 0, w: 1, proj: 'slip' }],
    tattle: 'A Tardy Bat. HP 5. Always late, so it moves TWICE a turn and swoops whenever it feels like it. A Tardy Slip gives you Detention: Superguard it or lose a turn.' },
  monitor: { name: 'Hall-Monitor Cat', kind: 'cat', look: 'monitor', hp: 9, atk: 2, xp: 22, smart: true, punish: 1, punishText: 'Write-up!',
    moves: [{ id: 'snap', name: 'Sash Snap', type: 'melee', dmg: 2, w: 3, delay: [100, 500] }, { id: 'nr', name: 'No Running!', type: 'buff', w: 1, say: 'The Hall-Monitor Cat blows his whistle! His next hit will be stronger.' }, { id: 'brace', name: 'By the Book', type: 'brace', w: 1, say: 'The Hall-Monitor Cat holds up the rule book! He takes 2 less damage until his next turn.' }],
    tattle: 'A Hall-Monitor Cat. HP 9, Attack 2. Botch an attack and he writes you up for 1 damage. He braces behind the rule book when hurt, so hit him with a partner or wait it out. Has never once been fun.' },
  dean: { name: 'The Dean of Detention', kind: 'cat', look: 'dean', hp: 55, atk: 3, xp: 180, boss: true, smart: true, learn: true,
    moves: [{ id: 'slipd', name: 'Detention Slip', type: 'detain', dmg: 2, w: 3, proj: 'slip', delay: [0, 400] }, { id: 'quiz', name: 'Pop Quiz', type: 'barrage', dmg: 2, n: 3, w: 2, proj: 'quiz', rhythm: [520, 300, 780] }, { id: 'ruler', name: 'Ruler Smack', type: 'melee', dmg: 3, w: 2, feint: .5, delay: [100, 500] }, { id: 'stamp', name: 'EXPELLED Stamp', type: 'melee', dmg: 4, w: 1, windup: true, noSuper: true, big: true, speed: 560, charge: 'The Dean raises a giant EXPELLED stamp! It comes down next turn. Make him dizzy to stop it, or get ready to Guard!' }],
    rage: [{ id: 'slipd', name: 'Detention Slip', type: 'detain', dmg: 2, w: 2, proj: 'slip', delay: [0, 500] }, { id: 'quiz', name: 'Pop Quiz', type: 'barrage', dmg: 1, n: 5, w: 2, proj: 'quiz', rhythm: [500, 280, 280, 720, 300] }, { id: 'ruler', name: 'Ruler Smack', type: 'melee', dmg: 3, w: 2, feint: .5, delay: [100, 600] }, { id: 'stamp', name: 'EXPELLED Stamp', type: 'melee', dmg: 4, w: 2, windup: true, noSuper: true, big: true, speed: 560, charge: 'The Dean raises a giant EXPELLED stamp! It comes down next turn. Make him dizzy to stop it, or get ready to Guard!' }, { id: 'call', name: 'Hall Pass!', type: 'summon', summon: 'monitor', w: 3, say: '“HALL MONITORS! To my office!” The Dean rings his bell!', after: 'A Hall-Monitor Cat reports for duty!' }],
    tattle: 'The Dean of Detention. HP 55, Attack 2 to 4. Detention Slips cost you a turn unless you Superguard. Pop Quiz is three hard hits in a tricky rhythm (five small ones once he’s angry). The Ruler Smack fakes you out. When he raises the EXPELLED stamp, a Perfect Crossover makes him dizzy and cancels it; otherwise Guard it (it glows red, so no Superguard). At half health he calls Hall Monitors. He notices which attack you guard worst and uses it more.' }
});

/* ================= drawing: critters ================= */
function drawStapler(c, st){
  const t = st.t || 0, mv = st.move || 0, w = st.walk || 0;
  const bob = -Math.abs(Math.sin(w)) * 1.6 * mv + Math.sin(t * 2.2) * .4 * (1 - mv);
  const open = st.talk ? Math.abs(Math.sin(t * 12)) * .35 : (st.armRaise ? .55 : .1 + Math.sin(t * 2) * .05) + (st.hurt > 0 ? .3 : 0);
  [-10, 9].forEach((x, i) => { const a = Math.sin(w + i * Math.PI) * .5 * mv; c.save(); c.translate(x, -4 + bob); c.rotate(a); c.fillStyle = '#2E2E36'; rr(c, -1.3, 0, 2.6, 5, 1.2); c.fill(); c.fillStyle = '#F4F1EA'; ell(c, 1, 5, 2.4, 1.3); c.fill(); c.restore(); });
  c.fillStyle = '#2E2E36'; rr(c, -21, -9 + bob, 42, 6, 3); c.fill();
  c.fillStyle = '#B9C3CC'; rr(c, 12, -10 + bob, 9, 3, 1.4); c.fill();
  c.save(); c.translate(-19, -10 + bob); c.rotate(-open);
  c.fillStyle = '#C2453A'; rr(c, 0, -9, 41, 9, 4.4); c.fill(); c.fillStyle = '#E25A4E'; rr(c, 3, -8.4, 30, 2.6, 1.3); c.fill();
  c.fillStyle = '#B9C3CC'; rr(c, 1, -1.5, 39, 2.2, 1); c.fill();
  c.fillStyle = '#E6E9EC'; for(let i = 0; i < 4; i++) c.fillRect(32 + i * 2, 0, 1, 2.4);
  [[26, -12], [34, -12.6]].forEach(([x, y], i) => { c.fillStyle = '#FFFDF6'; ell(c, x, y, 3.4, 3.6); c.fill(); c.strokeStyle = '#2B1D14'; c.lineWidth = .6; c.stroke(); if(st.hurt > 0 || st.expr === 'dizzy'){ c.strokeStyle = '#1A1414'; c.lineWidth = .9; c.beginPath(); c.moveTo(x - 1.6, y - 1.6); c.lineTo(x + 1.6, y + 1.6); c.moveTo(x + 1.6, y - 1.6); c.lineTo(x - 1.6, y + 1.6); c.stroke(); } else { c.fillStyle = '#1A1414'; ell(c, x + 1 + Math.sin(t * 3 + i) * .6, y + .4, 1.4, 1.6); c.fill(); } });
  c.restore();
}
function drawBat(c, st){
  const t = st.t || 0, flap = Math.sin(t * 16), y0 = -34 + Math.sin(t * 4) * 3;
  c.save(); c.translate(0, y0);
  c.fillStyle = '#5E4A6B';
  [-1, 1].forEach(sd => { c.save(); c.scale(sd, 1); c.rotate(flap * .35); c.beginPath(); c.moveTo(3, -2); c.quadraticCurveTo(14, -16, 26, -8); c.quadraticCurveTo(22, -3, 24, 2); c.quadraticCurveTo(18, -1, 16, 4); c.quadraticCurveTo(11, 0, 8, 5); c.quadraticCurveTo(5, 2, 3, 3); c.closePath(); c.fill(); c.restore(); });
  c.fillStyle = '#4A3A56'; ell(c, 0, 0, 7, 8); c.fill();
  [[-4, -.3], [4, .3]].forEach(([x, a]) => { c.save(); c.translate(x, -6); c.rotate(a); c.beginPath(); c.moveTo(-2.4, 1); c.lineTo(0, -6); c.lineTo(2.4, 1); c.closePath(); c.fill(); c.restore(); });
  if(st.hurt > 0 || st.expr === 'dizzy'){ c.strokeStyle = '#FFF'; c.lineWidth = .8; [-2.5, 2.5].forEach(x => { c.beginPath(); c.moveTo(x - 1.2, -2.4); c.lineTo(x + 1.2, -.2); c.moveTo(x + 1.2, -2.4); c.lineTo(x - 1.2, -.2); c.stroke(); }); }
  else { c.fillStyle = '#FFE36A'; ell(c, -2.5, -1.4, 1.6, 1.8); c.fill(); ell(c, 2.5, -1.4, 1.6, 1.8); c.fill(); c.fillStyle = '#1A1414'; ell(c, -2.2, -1.2, .7, 1); c.fill(); ell(c, 2.8, -1.2, .7, 1); c.fill(); }
  c.fillStyle = '#FFFDF6'; c.beginPath(); c.moveTo(-1.6, 2.4); c.lineTo(-.9, 4.2); c.lineTo(-.2, 2.4); c.fill(); c.beginPath(); c.moveTo(.6, 2.4); c.lineTo(1.3, 4.2); c.lineTo(2, 2.4); c.fill();
  c.save(); c.translate(0, 11); c.rotate(Math.sin(t * 3) * .1); c.fillStyle = '#F7B6C8'; c.fillRect(-6, 0, 12, 7); c.fillStyle = '#B34A7A'; c.font = '900 3.2px Nunito, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TARDY', 0, 3.6); c.restore();
  c.restore();
}
Object.assign(WD.KINDS, {
  stapler: { draw: (c, e) => drawStapler(c, e), box: [-26, -40, 56, 46], shadow: 18, portrait: [4.4, -50, 70] },
  bat: { draw: (c, e) => drawBat(c, e), box: [-32, -62, 64, 64], shadow: 9, portrait: [4.4, 0, 150] }
});
Object.assign(WD.HEAD, { stapler: 36, bat: 52 });

/* projectiles */
WD.PROJ = Object.assign(WD.PROJ || {}, {
  clip(c){ c.strokeStyle = '#C9D2DA'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-5, 3); c.lineTo(-5, -4); c.arc(-2, -4, 3, Math.PI, 0); c.lineTo(1, 4); c.arc(-1, 4, 2, 0, Math.PI); c.lineTo(-3, -2); c.stroke(); },
  staple(c){ c.strokeStyle = '#E6E9EC'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-5, 3); c.lineTo(-5, -2); c.lineTo(5, -2); c.lineTo(5, 3); c.stroke(); },
  slip(c){ c.fillStyle = '#F7B6C8'; c.fillRect(-9, -5, 18, 10); c.fillStyle = '#B34A7A'; c.fillRect(-7, -3, 14, 1.4); c.fillRect(-7, 0, 10, 1.2); c.fillRect(-7, 2.4, 12, 1.2); },
  quiz(c){ c.fillStyle = '#FFFDF6'; c.fillRect(-7, -9, 14, 18); c.fillStyle = 'rgba(62,111,181,.5)'; for(let i = 0; i < 4; i++) c.fillRect(-5, -5 + i * 3.4, 10, .9); c.fillStyle = '#D6452B'; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 4, -6); }
});

/* ================= drawing: icons ================= */
function drawRay(c, x, y, s, col, flap, spots){
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  const f = flap || 0;
  c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(11, -10, 27, -2 + f); c.quadraticCurveTo(13, 2, 4, 10); c.lineTo(0, 12); c.lineTo(-4, 10); c.quadraticCurveTo(-13, 2, -27, -2 + f); c.quadraticCurveTo(-11, -10, 0, -8); c.fill();
  ell(c, 0, -9.5, 3.4, 2.6); c.fill();
  c.strokeStyle = col; c.lineWidth = 1.3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 11); c.quadraticCurveTo(3, 22, -1, 34); c.stroke();
  if(spots !== false){ c.fillStyle = 'rgba(255,248,236,.75)'; [[-14, -2], [-9, 2], [-18, 1], [14, -2], [9, 2], [18, 1], [-4, 3], [4, 3]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 1.1, 0, 7); c.fill(); }); }
  c.restore();
}
WD.drawRay = drawRay;
function drawLogo(c, x, y, s){
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = MAR; c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.stroke();
  drawRay(c, 0, -2, .38, '#FFF8EC', 0, false);
  c.fillStyle = '#FFF8EC'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('UIC', 0, 7.5);
  c.restore();
}
function drawPapers(c, stamp){ c.fillStyle = '#FFFDF6'; c.save(); c.rotate(-.08); c.fillRect(-11, -14, 22, 28); c.restore(); c.fillStyle = '#FBF6EA'; c.fillRect(-10, -13, 22, 28); c.fillStyle = 'rgba(43,29,20,.35)'; for(let i = 0; i < 6; i++) c.fillRect(-7, -9 + i * 3.6, i % 3 === 2 ? 10 : 15, 1.2); c.fillStyle = stamp || '#D6452B'; c.save(); c.translate(3, 7); c.rotate(-.2); c.strokeStyle = stamp || '#D6452B'; c.lineWidth = 1.2; c.strokeRect(-7, -3.5, 14, 7); c.font = '900 4px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TRANSFER', 0, 0); c.restore(); }
function drawToy1(c, kind, x, y, s){
  c.save(); c.translate(x, y); c.scale(s || 1, s || 1);
  if(kind === 'frisbee'){ c.fillStyle = '#3E8FC7'; ell(c, 0, 0, 10, 3.6); c.fill(); c.fillStyle = '#58AEDD'; ell(c, 0, -1, 7, 2); c.fill(); c.strokeStyle = '#FFF8EC'; c.lineWidth = .8; ell(c, 0, -1, 4, 1.1); c.stroke(); }
  else if(kind === 'sock'){ c.fillStyle = '#F4F1EA'; rr(c, -8, -3, 12, 6, 3); c.fill(); c.beginPath(); c.arc(5, 0, 4, 0, 7); c.fill(); c.fillStyle = '#C2453A'; c.fillRect(-8, -3, 3, 6); c.fillStyle = '#3E6FB5'; c.fillRect(-4.5, -3, 1.5, 6); c.fillStyle = '#E2DCCF'; c.beginPath(); c.arc(5, 0, 2, 0, 7); c.fill(); }
  else if(kind === 'pig'){ c.fillStyle = '#F2A1B5'; ell(c, 0, 0, 8, 6); c.fill(); ell(c, 7, -1, 4.6, 4); c.fill(); c.fillStyle = '#E37F98'; ell(c, 10.4, -.6, 2, 1.8); c.fill(); c.beginPath(); c.moveTo(4, -4); c.lineTo(6, -8); c.lineTo(8, -4.6); c.fill(); c.fillStyle = '#1A1414'; c.beginPath(); c.arc(7.6, -2.4, .7, 0, 7); c.fill(); c.strokeStyle = '#E37F98'; c.lineWidth = 1; c.beginPath(); c.moveTo(-8, -1); c.quadraticCurveTo(-12, -4, -10, -6); c.stroke(); c.fillStyle = '#E37F98'; [-4, 3].forEach(a => c.fillRect(a, 4, 2, 3)); }
  c.restore();
}
const ICON = {
  pandebono(c){ c.fillStyle = '#E2B160'; c.beginPath(); c.arc(0, 2, 12, Math.PI, 0); c.quadraticCurveTo(12, 8, 0, 8); c.quadraticCurveTo(-12, 8, -12, 2); c.fill(); c.fillStyle = '#F4D488'; ell(c, -2, -3, 7, 4); c.fill(); c.fillStyle = 'rgba(160,100,40,.35)'; [[-6, 0], [3, -2], [6, 3], [-2, 4]].forEach(([a, b]) => { ell(c, a, b, 1.6, 1); c.fill(); }); },
  papers(c){ drawPapers(c); },
  record(c){ c.fillStyle = '#E8C36A'; rr(c, -12, -9, 24, 20, 2); c.fill(); c.fillStyle = '#D9A946'; rr(c, -12, -12, 10, 5, 1.5); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(-9, -6, 18, 8); c.fillStyle = MAR; c.font = '900 5px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RHEAD, D.', 0, -2); c.fillStyle = '#5BC25A'; c.font = '900 8px Grandstander, system-ui'; c.fillText('✓', 7, 6); },
  camera(c){ c.fillStyle = '#2E2E36'; rr(c, -13, -7, 26, 17, 4); c.fill(); rr(c, -6, -10, 10, 4, 1.5); c.fill(); c.fillStyle = '#9FB3C8'; c.beginPath(); c.arc(0, 1.5, 6.4, 0, 7); c.fill(); c.fillStyle = '#3E5A78'; c.beginPath(); c.arc(0, 1.5, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-1.6, -.2, 1.4, 0, 7); c.fill(); c.fillStyle = '#E8593C'; c.beginPath(); c.arc(9, -4, 1.6, 0, 7); c.fill(); c.fillStyle = MAR; c.fillRect(-13, 7, 26, 2); },
  gymkey(c){ c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.arc(-6, 0, 5, 0, 7); c.stroke(); c.fillStyle = GOLD; c.fillRect(-1, -1.5, 14, 3); c.fillRect(8, 1, 2, 4); c.fillRect(11, 1, 2, 3); c.strokeStyle = MAR; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, -5); c.quadraticCurveTo(-10, -14, -2, -14); c.stroke(); },
  stamp(c){ drawPapers(c, MAR); c.fillStyle = MAR; c.save(); c.translate(-2, -4); c.rotate(.12); c.font = '900 5px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('BOGOTÁ', 0, 0); c.restore(); },
  photo2(c){ WD.drawPolaroid(c, 0, 2, 22, -.08, (c2, px, py, ps) => sightingGym(c2, px, py, ps)); },
  gymphoto(c){ WD.drawPolaroid(c, 0, 2, 22, .06, (c2, px, py, ps) => photoGymDoor(c2, px, py, ps)); },
  frisbee(c){ drawToy1(c, 'frisbee', 0, 0, 1.3); }, sock(c){ drawToy1(c, 'sock', 0, 0, 1.3); }, pig(c){ drawToy1(c, 'pig', 0, 0, 1.2); },
  tag(c){ c.fillStyle = '#C9A15A'; rr(c, -10, -6, 20, 13, 2); c.fill(); c.fillStyle = '#FFF8EC'; c.fillRect(-7, -3, 14, 7); c.fillStyle = '#2B1D14'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BOG', 0, .6); c.strokeStyle = '#7A5234'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-16, -6, -12, -12); c.stroke(); },
  pin(c){ c.fillStyle = GOLD; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.fillStyle = MAR; c.beginPath(); c.arc(0, 0, 7.6, 0, 7); c.fill(); drawRay(c, 0, -1, .26, '#FFF8EC', 0, false); },
  cap(c){ c.fillStyle = '#1A1A1F'; c.beginPath(); c.moveTo(-14, -2); c.lineTo(0, -8); c.lineTo(14, -2); c.lineTo(0, 4); c.closePath(); c.fill(); rr(c, -7, 0, 14, 7, 2); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -2); c.lineTo(10, -1); c.lineTo(11, 7); c.stroke(); }
};
const baseIcon = WD.drawIcon;
WD.drawIcon = function(c, kind, x, y, s, t){ const f = ICON[kind]; if(!f) return baseIcon(c, kind, x, y, s, t); c.save(); c.translate(x, y); c.scale(s, s); f(c, t || 0); c.restore(); };

/* sighting #2: Dayla on the old gym bleachers in a little graduation cap */
function sightingGym(c, x, y, s){
  c.fillStyle = '#5A4A3E'; c.fillRect(x, y, s, s);
  c.fillStyle = '#8E7A68'; c.fillRect(x, y, s, s * .45);
  c.fillStyle = MAR; c.fillRect(x + s * .1, y + s * .08, s * .55, s * .1); c.fillStyle = '#FFF8EC'; c.font = `900 ${s * .06}px Grandstander, system-ui`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('EAGLE RAYS', x + s * .13, y + s * .13);
  for(let i = 0; i < 4; i++){ c.fillStyle = i % 2 ? '#B5753F' : '#C98E52'; c.fillRect(x, y + s * (.45 + i * .12), s, s * .1); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x, y + s * (.55 + i * .12), s, s * .02); }
  c.fillStyle = '#FFFDF6'; for(let i = 0; i < 3; i++) c.fillRect(x + s * .55 + i, y + s * .64 - i * s * .02, s * .3, s * .08);
  c.fillStyle = MAR; c.font = `900 ${s * .05}px Grandstander, system-ui`; c.save(); c.translate(x + s * .7, y + s * .66); c.rotate(-.1); c.fillText('BOGOTÁ', -s * .1, 0); c.restore();
  c.save(); c.translate(x + s * .4, y + s * .72); c.scale(s / 90, s / 90); WD.drawPuppet(c, WD.makeEnt({ kind: 'dog', t: 3, eat: 1, move: 0 }));
  c.translate(19, -31); c.fillStyle = '#1A1A1F'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(0, -4); c.lineTo(9, 0); c.lineTo(0, 3); c.closePath(); c.fill(); c.strokeStyle = GOLD; c.lineWidth = .8; c.beginPath(); c.moveTo(0, 0); c.lineTo(7, 1); c.lineTo(8, 6); c.stroke(); c.restore();
  c.fillStyle = 'rgba(255,220,170,.14)'; c.fillRect(x, y, s, s);
}
WD.PHOTOS.gym = sightingGym;
/* Marcela's photo of the old gym door: agents sneaking in, and a suspicious long tail */
function photoGymDoor(c, x, y, s){
  const sky = c.createLinearGradient(0, y, 0, y + s * .6); sky.addColorStop(0, '#86B8EC'); sky.addColorStop(1, '#FCDDB2'); c.fillStyle = sky; c.fillRect(x, y, s, s);
  c.fillStyle = '#B98C7E'; c.fillRect(x + s * .1, y + s * .25, s * .8, s * .55); c.fillStyle = '#8E5E52'; c.beginPath(); c.moveTo(x + s * .06, y + s * .27); c.quadraticCurveTo(x + s * .5, y + s * .02, x + s * .94, y + s * .27); c.fill();
  c.fillStyle = '#4A2E28'; c.fillRect(x + s * .38, y + s * .5, s * .24, s * .3);
  c.fillStyle = '#6DB24E'; c.fillRect(x, y + s * .8, s, s * .2);
  [[.42, .78], [.53, .78]].forEach(([a, b], i) => { c.save(); c.translate(x + s * a, y + s * b); c.scale(s / 200, s / 200); WD.drawPuppet(c, WD.makeEnt({ kind: 'cat', look: WD.CATS[i ? 'agent2' : 'agent'], t: 1, dir: 1 })); c.restore(); });
  c.fillStyle = '#1A1A1F'; c.save(); c.translate(x + s * .5, y + s * .58); c.beginPath(); c.moveTo(-s * .05, 0); c.lineTo(0, -s * .02); c.lineTo(s * .05, 0); c.lineTo(0, s * .02); c.fill(); c.restore();
  c.fillStyle = '#2B2729'; rr(c, x + s * .86, y + s * .82, s * .2, s * .05, s * .025); c.fill(); c.fillStyle = '#F7F3EC'; c.fillRect(x + s * .9, y + s * .855, s * .06, s * .015);
}
WD.PHOTOS.gymdoor = photoGymDoor;

/* ================= drawing: UIC sets ================= */
function drawUICBuilding(c, x0, x1, base, t){
  const w = x1 - x0, H = 150, mid = (x0 + x1) / 2;
  c.fillStyle = 'rgba(40,28,60,.16)'; c.fillRect(x0 - 6, base - 2, w + 12, 5);
  c.fillStyle = '#EFE4CF'; c.fillRect(x0, base - H, w, H);
  c.fillStyle = 'rgba(160,130,90,.08)'; for(let y = base - H + 6; y < base; y += 8) c.fillRect(x0, y, w, 2);
  c.fillStyle = MAR; c.fillRect(x0 - 8, base - H - 12, w + 16, 14); c.fillStyle = MARD; c.fillRect(x0 - 8, base - H + 2, w + 16, 3); c.fillStyle = GOLD; c.fillRect(x0 - 8, base - H - 13, w + 16, 1.6);
  c.fillStyle = MAR; c.fillRect(x0, base - 76, w, 4);
  // windows
  [base - H + 18, base - 66].forEach((wy, fl) => {
    for(let wx = x0 + 18; wx < x1 - 40; wx += 58){ if(Math.abs(wx + 19 - mid) < 92) continue;
      c.fillStyle = '#D8CBB0'; c.fillRect(wx - 3, wy - 3, 44, 44);
      const g = c.createLinearGradient(0, wy, 0, wy + 38); g.addColorStop(0, '#9FC1D8'); g.addColorStop(1, '#6E92AC'); c.fillStyle = g; c.fillRect(wx, wy, 38, 38);
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(wx, wy + 26); c.lineTo(wx + 22, wy); c.lineTo(wx + 30, wy); c.lineTo(wx, wy + 34); c.fill();
      c.strokeStyle = '#F7F2EA'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(wx + 19, wy); c.lineTo(wx + 19, wy + 38); c.stroke();
      if(fl === 1){ c.fillStyle = MAR; c.beginPath(); c.moveTo(wx - 5, wy - 4); c.lineTo(wx + 43, wy - 4); c.lineTo(wx + 40, wy + 6); c.lineTo(wx - 2, wy + 6); c.closePath(); c.fill(); c.fillStyle = MARL; for(let k = 0; k < 6; k++) c.fillRect(wx - 2 + k * 7, wy - 4, 3.5, 10); }
    } });
  // glass entrance atrium
  c.fillStyle = MAR; c.fillRect(mid - 76, base - H - 34, 152, H + 34);
  const g = c.createLinearGradient(0, base - H - 26, 0, base); g.addColorStop(0, '#B9D6EA'); g.addColorStop(1, '#7FA4C0'); c.fillStyle = g; c.fillRect(mid - 68, base - H + 30, 136, H - 30);
  c.strokeStyle = MARD; c.lineWidth = 2; for(let i = 1; i < 4; i++){ c.beginPath(); c.moveTo(mid - 68 + i * 34, base - H + 30); c.lineTo(mid - 68 + i * 34, base); c.stroke(); } c.beginPath(); c.moveTo(mid - 68, base - 76); c.lineTo(mid + 68, base - 76); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(mid - 60, base - 20); c.lineTo(mid - 10, base - H + 30); c.lineTo(mid + 6, base - H + 30); c.lineTo(mid - 44, base - 20); c.fill();
  c.fillStyle = 'rgba(40,30,60,.35)'; c.fillRect(mid - 30, base - 60, 60, 60); c.fillStyle = 'rgba(255,230,180,.35)'; c.fillRect(mid - 28, base - 58, 26, 58);
  // sign
  c.fillStyle = '#FFF8EC'; rr(c, mid - 70, base - H - 28, 140, 52, 4); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 1.5; c.strokeRect(mid - 66, base - H - 24, 132, 44);
  drawLogo(c, mid - 46, base - H - 2, .95);
  c.fillStyle = MAR; c.font = '900 10px Grandstander, system-ui'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('UNITED', mid - 26, base - H - 13); c.fillText('INTERNATIONAL', mid - 26, base - H - 2); c.fillText('COLLEGE', mid - 26, base - H + 9);
  // flags
  [mid - 120, mid + 120].forEach((fx, i) => { c.fillStyle = '#C9CCCF'; c.fillRect(fx - 1, base - H - 70, 2, H + 70); const wv = Math.sin(t * 3 + i) * 2; c.fillStyle = i ? MAR : '#3E6FB5'; c.beginPath(); c.moveTo(fx + 1, base - H - 68); c.quadraticCurveTo(fx + 14, base - H - 66 + wv, fx + 28, base - H - 64); c.lineTo(fx + 28, base - H - 48); c.quadraticCurveTo(fx + 14, base - H - 50 + wv, fx + 1, base - H - 52); c.fill(); if(i){ drawRay(c, fx + 14, base - H - 58, .3, '#FFF8EC', 0, false); } else { c.fillStyle = '#C2453A'; for(let k = 0; k < 3; k++) c.fillRect(fx + 1, base - H - 64 + k * 5, 27, 2); } });
  c.fillStyle = '#4F8E43'; for(let sx = x0 + 6; sx < x1; sx += 20){ if(Math.abs(sx - mid) < 78) continue; ell(c, sx, base - 4, 11, 8); c.fill(); }
  c.fillStyle = '#E8593C'; for(let sx = x0 + 14; sx < x1; sx += 40){ if(Math.abs(sx - mid) < 78) continue; ell(c, sx, base - 10, 2.4, 2); c.fill(); }
}
function drawStatue(c, x, y, t){
  c.fillStyle = '#3F8A42'; ell(c, x, y + 6, 50, 13); c.fill(); c.fillStyle = '#E7E1D6'; ell(c, x, y + 2, 36, 9); c.fill(); c.fillStyle = '#7DB7D8'; ell(c, x, y, 31, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; for(let i = 0; i < 3; i++){ const r = ((t * 12 + i * 10) % 30); c.globalAlpha = 1 - r / 30; ell(c, x, y, r, r * .24); c.stroke(); } c.globalAlpha = 1;
  c.fillStyle = '#B9B3A8'; rr(c, x - 7, y - 44, 14, 44, 2); c.fill(); c.fillStyle = '#D7D1C5'; c.fillRect(x - 7, y - 44, 4, 44);
  c.fillStyle = MAR; rr(c, x - 22, y - 30, 44, 11, 2); c.fill(); c.fillStyle = '#FFF8EC'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EAGLE RAYS', x, y - 24.4);
  c.save(); c.translate(x, y - 66); c.rotate(-.2 + Math.sin(t * 1.2) * .02); c.scale(1, .62);
  drawRay(c, 0, 0, 1.7, '#8A6A3E', Math.sin(t * 1.2) * 1.5); c.globalCompositeOperation = 'source-atop'; c.restore();
  c.save(); c.translate(x, y - 66); c.rotate(-.2); c.scale(1, .62); c.fillStyle = 'rgba(255,230,170,.25)'; ell(c, -10, -6, 20, 6); c.fill(); c.restore();
  c.strokeStyle = 'rgba(190,226,246,.9)'; c.lineWidth = 1.2; for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; c.beginPath(); c.moveTo(x, y - 46); c.quadraticCurveTo(x + Math.cos(a) * 12, y - 52, x + Math.cos(a) * 18, y - 8); c.stroke(); }
}
function drawOldGym(c, x, base, t, open){
  const w = 300, H = 120;
  c.fillStyle = 'rgba(40,28,60,.16)'; c.fillRect(x - 6, base - 2, w + 12, 5);
  c.fillStyle = '#B98C7E'; c.fillRect(x, base - H, w, H);
  c.strokeStyle = 'rgba(90,50,40,.18)'; c.lineWidth = 1; for(let y = base - H + 8; y < base; y += 8){ c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke(); for(let xx = x + ((y / 8) % 2) * 12; xx < x + w; xx += 24){ c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + 8); c.stroke(); } }
  c.fillStyle = '#8E5E52'; c.beginPath(); c.moveTo(x - 10, base - H + 2); c.quadraticCurveTo(x + w / 2, base - H - 70, x + w + 10, base - H + 2); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(60,30,24,.3)'; c.lineWidth = 1; for(let i = 1; i < 10; i++){ const u = i / 10; c.beginPath(); c.moveTo(x - 10 + (w + 20) * u, base - H + 2); c.lineTo(x + w / 2 + (u - .5) * 40, base - H - 66 + Math.abs(u - .5) * 60); c.stroke(); }
  c.fillStyle = 'rgba(122,31,43,.55)'; c.fillRect(x, base - H + 10, w, 16); c.fillStyle = 'rgba(255,248,236,.6)'; c.font = '900 13px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('G Y M', x + w / 2, base - H + 18.5);
  [x + 30, x + w - 70].forEach(wx => { c.fillStyle = '#6B4A3E'; c.fillRect(wx, base - H + 40, 40, 30); c.fillStyle = '#A07A4E'; c.save(); c.translate(wx + 20, base - H + 55); c.rotate(.3); c.fillRect(-24, -3, 48, 6); c.rotate(-.6); c.fillRect(-24, -3, 48, 6); c.restore(); });
  const dx = x + w / 2;
  c.fillStyle = '#5E3A30'; c.fillRect(dx - 34, base - 74, 68, 74);
  c.fillStyle = open ? '#1E1620' : '#7A5244'; c.fillRect(dx - 30, base - 70, 29, 70); c.fillRect(dx + 1, base - 70, 29, 70);
  if(!open){ c.fillStyle = '#5E3A30'; c.fillRect(dx - 26, base - 62, 21, 20); c.fillRect(dx + 5, base - 62, 21, 20); c.strokeStyle = '#9AA0A6'; c.lineWidth = 2.2; for(let i = 0; i < 6; i++){ c.beginPath(); c.arc(dx - 15 + i * 6, base - 38, 3, 0, 7); c.stroke(); } c.fillStyle = GOLD; rr(c, dx - 5, base - 36, 10, 10, 2); c.fill(); c.fillStyle = '#7A5A1E'; c.fillRect(dx - 1, base - 32, 2, 4); }
  else { c.fillStyle = 'rgba(255,220,140,.12)'; c.fillRect(dx - 30, base - 70, 60, 70); }
  c.fillStyle = '#7E8792'; c.fillRect(x + w - 30, base - H + 30, 8, 80);
  c.fillStyle = '#5B8E46'; for(let sx = x + 6; sx < x + w; sx += 24){ if(Math.abs(sx - dx) < 40) continue; ell(c, sx, base - 3, 12, 6); c.fill(); }
}
function drawCarP(c, x, y){
  c.fillStyle = 'rgba(40,28,60,.22)'; ell(c, x, y + 2, 46, 6); c.fill();
  c.fillStyle = '#B9C3CC'; rr(c, x - 44, y - 24, 88, 20, 7); c.fill(); rr(c, x - 26, y - 40, 50, 20, 8); c.fill();
  c.fillStyle = '#8FB4D4'; rr(c, x - 22, y - 37, 20, 13, 3); c.fill(); rr(c, x + 1, y - 37, 20, 13, 3); c.fill();
  c.fillStyle = '#2E2E33'; [x - 26, x + 26].forEach(wx => { c.beginPath(); c.arc(wx, y - 4, 8, 0, 7); c.fill(); }); c.fillStyle = '#AAA'; [x - 26, x + 26].forEach(wx => { c.beginPath(); c.arc(wx, y - 4, 3, 0, 7); c.fill(); });
  c.fillStyle = '#FFE7A6'; rr(c, x + 38, y - 20, 6, 4, 1.5); c.fill();
}
function drawPlanter(c, x, y, dug){
  c.fillStyle = '#B5653A'; rr(c, x - 30, y - 16, 60, 18, 3); c.fill(); c.fillStyle = '#9A5230'; c.fillRect(x - 30, y - 16, 60, 4);
  c.fillStyle = '#6A4A30'; ell(c, x, y - 15, 27, 4); c.fill();
  c.fillStyle = '#4F8E43'; [[-18, -24, 9], [-6, -30, 11], [8, -26, 10], [20, -22, 8]].forEach(([dx, dy, r]) => { ell(c, x + dx, y + dy, r, r * .8); c.fill(); });
  c.fillStyle = '#F7D23E'; [[-14, -30], [4, -34], [16, -28]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + dx, y + dy, 2.2, 0, 7); c.fill(); });
  if(dug){ c.fillStyle = '#5A3A24'; ell(c, x + 10, y - 14, 7, 2.4); c.fill(); }
}
WD.CAMPUS_CAR = drawCarP;

/* rooms */
function room(c, t, o){
  o = o || {}; const x0 = -90, x1 = o.w || 900;
  c.fillStyle = o.wall || CREAM; c.fillRect(x0, -250, x1 - x0, 272);
  c.fillStyle = 'rgba(160,130,90,.07)'; for(let x = x0; x < x1; x += 26) c.fillRect(x, -250, 10, 272);
  c.fillStyle = o.lower || '#E4D6BB'; c.fillRect(x0, -44, x1 - x0, 64);
  c.fillStyle = o.band || MAR; c.fillRect(x0, -50, x1 - x0, 6); c.fillStyle = GOLD; c.fillRect(x0, -44, x1 - x0, 1.2);
  c.fillStyle = 'rgba(90,60,30,.1)'; for(let x = x0; x < x1; x += 40) c.fillRect(x, -43, 1.5, 63);
  const fg = c.createLinearGradient(0, 20, 0, 200); const fc = o.floor || '#E6DCC8'; fg.addColorStop(0, fc); fg.addColorStop(1, shade(fc, -.2)); c.fillStyle = fg; c.fillRect(x0, 20, x1 - x0, 420);
  if(o.wood){ c.strokeStyle = 'rgba(90,58,30,.22)'; c.lineWidth = .8; for(let y = 30; y < 420; y += 10 + (y - 20) * .06){ c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); } }
  else { c.strokeStyle = 'rgba(120,100,70,.16)'; c.lineWidth = .8; for(let r = 0; r < 14; r++){ const y = 26 + r * (12 + r * 1.5); c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); } for(let x = x0; x < x1; x += 30){ c.beginPath(); c.moveTo(x, 20); c.lineTo(x + (x - 350) * .7, 220); c.stroke(); } }
  c.fillStyle = '#FFF8EC'; c.fillRect(x0, 14, x1 - x0, 7); c.fillStyle = 'rgba(90,58,30,.2)'; c.fillRect(x0, 21, x1 - x0, 2);
  if(o.lights !== false) for(let x = 80; x < x1; x += 240){ c.fillStyle = '#FFFDF2'; rr(c, x - 30, -246, 60, 6, 2); c.fill(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,200,.06)'; c.beginPath(); c.moveTo(x - 30, -240); c.lineTo(x + 30, -240); c.lineTo(x + 76, 20); c.lineTo(x - 76, 20); c.fill(); c.restore(); }
}
function door(c, x, label, o){
  o = o || {}; const col = o.col || '#9A6E46';
  c.fillStyle = '#C29C6E'; c.fillRect(x - 32, -136, 64, 156);
  c.fillStyle = o.open ? '#2B2235' : col; rr(c, x - 27, -131, 54, 151, 2); c.fill();
  if(!o.open){ c.fillStyle = shade(col, -.15); rr(c, x - 21, -120, 42, 50, 2); c.fill(); rr(c, x - 21, -60, 42, 70, 2); c.fill(); c.fillStyle = '#B9D6EA'; rr(c, x - 6, -114, 12, 38, 2); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.arc(x + 19, -40, 2.6, 0, 7); c.fill(); }
  if(label){ c.fillStyle = MAR; rr(c, x - 36, -162, 72, 18, 3); c.fill(); c.fillStyle = '#FFF8EC'; c.font = `900 ${label.length > 11 ? 7 : 8.5}px Grandstander, system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x, -152.5); }
}
function plant(c, x, y){ c.fillStyle = '#B5653A'; rr(c, x - 10, y - 18, 20, 18, 3); c.fill(); c.fillStyle = '#3F7E3E'; [[0, -40, 10], [-9, -30, 8], [9, -30, 8], [-4, -50, 6], [6, -46, 7]].forEach(([dx, dy, r]) => { ell(c, x + dx, y + dy, r * .6, r * 1.2, dx * .05); c.fill(); }); }
function banner(c, x, y, t){ const sw = Math.sin(t * 1.4) * 1.5; c.fillStyle = '#5B4A3A'; c.fillRect(x - 26, y - 4, 52, 4); c.fillStyle = MAR; c.beginPath(); c.moveTo(x - 22, y); c.lineTo(x + 22, y); c.lineTo(x + 22 + sw, y + 92); c.lineTo(x + sw, y + 80); c.lineTo(x - 22 + sw, y + 92); c.closePath(); c.fill(); c.fillStyle = GOLD; c.fillRect(x - 22, y + 4, 44, 2); drawRay(c, x + sw * .5, y + 34, .7, '#FFF8EC', Math.sin(t * 2) * 1.2, false); c.fillStyle = '#FFF8EC'; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('GO RAYS!', x + sw * .6, y + 66); }
function poster(c, x, y, title, col, rot){ c.save(); c.translate(x, y); c.rotate(rot || 0); c.fillStyle = '#FFFDF6'; c.fillRect(-18, -24, 36, 48); c.fillStyle = col; c.fillRect(-15, -21, 30, 16); c.fillStyle = 'rgba(43,29,20,.3)'; for(let i = 0; i < 4; i++) c.fillRect(-14, 0 + i * 5, 26 - (i % 2) * 8, 1.6); c.fillStyle = '#FFF8EC'; c.font = '900 5.5px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(title, 0, -13); c.fillStyle = '#E8593C'; c.beginPath(); c.arc(0, -24, 1.4, 0, 7); c.fill(); c.restore(); }
function frontDesk(c, x){
  c.fillStyle = MAR; rr(c, x - 54, -132, 108, 16, 3); c.fill(); c.fillStyle = '#FFF8EC'; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FRONT DESK · RECEPCIÓN', x, -124);
  c.strokeStyle = '#5B4A3A'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 40, -132); c.lineTo(x - 50, -200); c.moveTo(x + 40, -132); c.lineTo(x + 50, -200); c.stroke();
}
function deskCounter(c, x){
  c.fillStyle = '#EADFCB'; rr(c, x - 86, -30, 172, 50, 4); c.fill();
  c.fillStyle = MAR; c.fillRect(x - 88, -36, 176, 8); c.fillStyle = GOLD; c.fillRect(x - 88, -28.6, 176, 1.4);
  c.fillStyle = 'rgba(90,60,30,.12)'; [x - 44, x + 44].forEach(sx => c.fillRect(sx, -27, 2, 46));
  drawLogo(c, x, -4, .9);
  c.fillStyle = '#2E2E36'; rr(c, x + 30, -64, 32, 22, 2); c.fill(); c.fillStyle = '#7FB0D8'; c.fillRect(x + 32, -62, 28, 17); c.fillRect(x + 44, -42, 4, 6);
  c.fillStyle = GOLD; c.beginPath(); c.arc(x - 50, -38, 4, Math.PI, 0); c.fill(); c.fillRect(x - 55, -38, 10, 1.6);
  c.fillStyle = '#FFFDF6'; for(let i = 0; i < 3; i++) c.fillRect(x - 20 + i, -40 - i * 1.6, 22, 3);
}
/* things drawn standing behind a counter: paint them before the counter */
function paintBehind(e, k){ const [sx, sy] = WD.toScreen(e.x, e.y); WD.paintEnt(e, sx, sy, WD.view.dpr * WD.view.S * WD.cam.z * (k || .9)); WD.setLayer(1); }

/* ================= battle backs ================= */
Object.assign(WD.BATTLE_BACKS, {
  uic: { draw(t){ const c = WD.ctx; c.save(); c.translate(0, -16); drawUICBuilding(c, -230, 230, 2, t); c.restore(); [-260, 250].forEach((x, i) => WD.drawPalm(c, x, -14, 150 + i * 14, (i - .5) * .12, t, i + 5, WD.PALMCOL, true)); } },
  hall: { ground: '#D9CFBE', stage: ['#C9B48E', '#8E7450'], draw(t, W2){ const c = WD.ctx; c.fillStyle = CREAM; c.fillRect(-W2 - 20, -600, W2 * 2 + 40, 590); c.fillStyle = '#E4D6BB'; c.fillRect(-W2 - 20, -60, W2 * 2 + 40, 46); c.fillStyle = MAR; c.fillRect(-W2 - 20, -66, W2 * 2 + 40, 6); c.save(); c.translate(0, -14); c.scale(.85, .85); door(c, -150, 'ENGLISH 101'); door(c, 170, 'MEDIA'); c.restore(); banner(c, 10, -190, t); poster(c, -60, -120, 'BIENVENIDOS', '#3E8FC7', -.05); poster(c, 80, -128, 'CLUB FAIR', '#E8593C', .06); } },
  gym: { ground: '#9E6A3C', stage: ['#C98E52', '#7A4D2B'], draw(t, W2){ const c = WD.ctx; c.fillStyle = '#9C8C80'; c.fillRect(-W2 - 20, -600, W2 * 2 + 40, 590); c.strokeStyle = 'rgba(60,40,30,.18)'; c.lineWidth = 1; for(let y = -300; y < -14; y += 10){ c.beginPath(); c.moveTo(-W2 - 20, y); c.lineTo(W2 + 20, y); c.stroke(); } c.fillStyle = 'rgba(122,31,43,.7)'; c.fillRect(-W2 - 20, -120, W2 * 2 + 40, 16); c.fillStyle = '#FFF8EC'; c.font = '900 10px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('HOME OF THE EAGLE RAYS', 0, -108); for(let i = 0; i < 4; i++){ c.fillStyle = i % 2 ? '#B5753F' : '#C98E52'; c.fillRect(-W2 - 20, -84 + i * 18, W2 * 2 + 40, 14); } WD.drawHoop(c, -200, -14, .8); c.save(); c.scale(-1, 1); WD.drawHoop(c, -200, -14, .8); c.restore(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,230,170,.08)'; c.beginPath(); c.moveTo(-40, -300); c.lineTo(40, -300); c.lineTo(120, -14); c.lineTo(-120, -14); c.fill(); c.restore(); } },
  kennel: { ground: '#3A2244', stage: ['#5E3A6B', '#2E1A36'], draw(t, W2){ const c = WD.ctx; c.fillStyle = '#4A2A52'; c.fillRect(-W2 - 20, -600, W2 * 2 + 40, 590); } }
});

/* ================= helpers ================= */
const stamps = () => ['stamp_reg', 'stamp_eng', 'stamp_media'].filter(F).length;
async function toyGet(k){
  const G = WD.G; if(G.toys.includes(k)) return;
  G.toys.push(k); S('toy_' + k); WD.sfx('squeak');
  const T = WD.TOYS[k]; await WD.itemGet(k, T.name, `${T.desc} (UIC toys ${WD.toyCount(1)[0]}/3)`);
  if(WD.toyCount(1)[0] === 3){ WD.giveItem('pandebono', 1); WD.giveItem('cafe', 1); await WD.itemGet('star', 'All 3 UIC toys found!', 'Dayla’s toy box is filling back up. Bonus: a pandebono and a Café con Leche.'); }
  WD.pingBag(); WD.saveNow();
}
async function pinGet(id, first){
  WD.givePin(id); const P = WD.PINS[id];
  await WD.itemGet(WD.pinIcon(id), P.name, `${P.desc} Costs ${P.pp} PP to wear.`, 'Pin');
  if(first || !F('pin_tip')){ S('pin_tip'); await WD.card(`<i class="k">Pins</i><h2>Wear pins for perks</h2><p>Pins are little accessories with powers. Each costs PP (pin points) to wear. You have <b>${WD.G.mpp} PP</b>.</p><ul><li>Open the bag → <b>Pins</b> tab to put pins on or take them off.</li><li>New pins are worn automatically if you have the PP for them.</li><li>When you level up, picking <b>PP +3</b> lets you wear more.</li></ul>`, [{ label: 'Got it', alt: true }]); }
  WD.pingBag(); WD.saveNow();
}
/* a small tap-in-order game (the filing puzzle) */
function orderGame(title, intro, items, order){
  return new Promise(res => {
    const card = WD.$('.wd-card'), sh = card.querySelector('.sheet'); let next = 0, tries = 0;
    const render = msg => {
      sh.innerHTML = `<i class="k">Filing puzzle</i><h2>${esc(title)}</h2><p>${esc(msg || intro)}</p><p class="score">${next}/${order.length} filed</p><div class="wd-mini">${items.map(n => `<button data-n="${esc(n)}" class="${order.indexOf(n) < next ? 'done' : ''}" ${order.indexOf(n) < next ? 'disabled' : ''}>${esc(n)}</button>`).join('')}</div>`;
      sh.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
        const n = b.dataset.n;
        if(n === order[next]){ next++; WD.sfx('tap'); if(next === order.length){ WD.sfx('get'); card.hidden = true; res(tries); return; } render(); }
        else { tries++; next = 0; WD.sfx('miss'); render(`Oops! “${n}” isn’t next. The pile slides back out. Start again from the top of the alphabet.`); }
      });
      const f = sh.querySelector('button:not([disabled])'); if(f) f.focus({ preventScroll: true });
    };
    card.hidden = false; WD.sfx('open'); render();
  });
}

/* ================= goal line ================= */
function goal1(){
  let g = '';
  if(!F('c1_case')) g = 'Go inside and find Angelica';
  else if(!F('c1_chunkers')) g = 'Check the Registrar’s Office';
  else if(stamps() < 3){ const left = [['stamp_reg', 'Registrar'], ['stamp_eng', 'English'], ['stamp_media', 'Media']].filter(([k]) => !F(k)).map(x => x[1]); g = `Collect the real stamps (${stamps()}/3): ${left.join(', ')}`; if(F('c1_camera') && !F('stamp_media')){ const n = SHOTS.filter(s => F('shot_' + s.id)).length; if(n < SHOTS.length) g += ` · Photos ${n}/${SHOTS.length}`; else g = 'Bring the photos back to Marcela'; } }
  else if(!F('c1_forged')) g = 'Bring the three stamps to Angelica';
  else if(!F('c1_key')) g = 'Ask President Lydia for the old gym key';
  else if(!F('c1_gym_in')) g = 'Open the old gym (east end of campus)';
  else if(!F('c1_boss')) g = 'Find the agents inside the old gym';
  else if(!F('c1_photo')) g = 'Pick up what the Dean dropped';
  else g = F('int1_done') ? 'Chapter 1 complete! Take the car to the airport for Bogotá' : 'Chapter 1 complete! Look around UIC, or drive home';
  WD.setGoal(g);
}
function goalI1(){
  let g = 'Look around. Dayla sniffs with A';
  if(!F('i_love')) g = F('i_bed') || F('i_shoe') ? 'That guard is in the way. Love Attack him (B)!' : 'Look around. Dayla sniffs with A, Love Attacks with B';
  else if(!F('i_food')) g = 'Something smells amazing on that cart…';
  else if(!F('i_tag')) g = 'Check out the travel crate';
  else if(!F('i_mail')) g = 'Drop the tag somewhere it will be found';
  WD.setGoal(g);
}
const prevGoal = WD.chapterGoal;
WD.chapterGoal = ch => ch === 1 ? goal1() : ch === 'i1' ? goalI1() : prevGoal ? prevGoal(ch) : null;

/* ================= the spouse and friends ================= */
function mkSpouse(x, y, dir){ return WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.spouse], name: WD.spouse, x, y, dir: dir || -1, light: 'indoor', talkTo: talkSpouse }); }
function talkSpouse(){
  WD.cut(async () => {
    const s = WD.spouse;
    if(!F('c1_chunkers')){
      if(D()) await say(s, 'My office is through that door. Someone moved my cabinets, and there’s a dog in there who won’t move. Uno grande.', { es: 'Mi oficina es por esa puerta. Alguien movió mis archivadores y hay un perro ahí que no se mueve. Uno grande.', expr: 'worried' });
      else await say(s, 'Your office is right there. Angelica says there’s a dog sitting in it. A big one. Want me to come?', { expr: 'think' });
      if(!D()) await say(WD.hero, 'Stay by the door, okay? If that cat comes back, me escribes.', { expr: 'determined' });
    } else if(stamps() < 3){
      const tips = [];
      if(!F('stamp_reg')) tips.push(D() ? 'The Registrar’s Seal is in my records cage. It only opens while something heavy sits on that floor plate. Hint, hint.' : 'Your records cage only opens while something heavy sits on the floor plate. Chunkers is very heavy.');
      if(!F('stamp_eng')) tips.push('David Lesser has the English stamp. He’ll make you earn it. He loves a quiz.');
      if(!F('stamp_media')) tips.push('Marcela has the Media stamp. She’s down the hall, probably taking a picture of a plant.');
      await say(s, tips[Math.floor(WD.time) % tips.length], { expr: 'happy' });
    } else if(!F('c1_forged')) await say(s, D() ? '¿Los tres? Go show Angelica!' : 'You got all three? Go show Angelica!', { expr: 'joy' });
    else if(!F('c1_boss')) await say(s, D() ? 'The old gym… Ten cuidado, okay? Take el patico.' : 'The old gym. I’ll be right here. Go get her back.', { es: D() ? 'El gimnasio viejo… Ten cuidado, ¿sí? Llévate el patico.' : null, expr: 'worried' });
    else await say(s, D() ? '¡Bogotá! My family is going to lose their minds.' : 'Bogotá, huh. Your family is going to feed me so much.', { es: D() ? '¡Bogotá! Mi familia se va a volver loca.' : null, expr: 'joy' });
  });
}

/* ================= AREA: Campus front ================= */
const R1 = rng(77);
const C_PALMS = [{ x: 300, h: 196 }, { x: 440, h: 176 }, { x: 1180, h: 200 }, { x: 1320, h: 184 }, { x: 1470, h: 206 }, { x: 1960, h: 190 }].map(p => Object.assign(p, { lean: (R1() - .5) * .22, ph: R1() * 6 }));
const C_FAR = [{ x: -200, w: 300, wall: '#E7DCC8' }, { x: 220, w: 260, wall: '#EFE2CC' }, { x: 900, w: 280, wall: '#E7DCC8' }, { x: 1500, w: 300, wall: '#EFE2CC' }];
const C_FRONT = Array.from({ length: 12 }, (_, i) => ({ x: -60 + i * 230 + R1() * 80, k: R1() < .5 ? 'frond' : 'bush', s: .8 + R1() * .5 }));
const SHOTS = [
  { id: 'statue', area: 'uic_front', x: 1080, y: 50, name: 'the eagle ray statue' },
  { id: 'gymdoor', area: 'uic_front', x: 1760, y: 50, name: 'the old gym doors' },
  { id: 'desk', area: 'uic_lobby', x: 320, y: 56, name: 'the front desk' },
  { id: 'banner', area: 'uic_lobby', x: 1310, y: 56, name: 'the GO RAYS banner' }
];
function shotThings(areaId){
  if(!F('c1_camera') || F('stamp_media')) return [];
  return SHOTS.filter(s => s.area === areaId && !F('shot_' + s.id)).map(s => ({ x: s.x, y: s.y, label: 'Snap 📷', h: 70, sparkle: true, sy: 60, act: () => snap(s) }));
}
function snap(s){
  WD.cut(async () => {
    W.flash = .5; WD.sfx('light'); WD.shake(2); await WD.wait(300);
    S('shot_' + s.id); WD.sfx('get');
    const n = SHOTS.filter(x => F('shot_' + x.id)).length;
    WD.toast(`📷 Snap! Got ${s.name}. (${n}/${SHOTS.length})`);
    if(s.id === 'gymdoor') await me('The old gym. Nobody’s used it in years. …Was that door always chained?', { t: 'El gimnasio viejo. Nobody uses it. ¿Esa cadena siempre estuvo ahí?', es: 'El gimnasio viejo. Nadie lo usa. ¿Esa cadena siempre estuvo ahí?' }, 'think');
    if(n === SHOTS.length) await me('That’s all four. Back to Marcela.', { t: '¡Listo, las cuatro! Back to Marcela.', es: '¡Listo, las cuatro! De vuelta donde Marcela.' }, 'happy');
    WD.updateGoal();
  });
}
WD.defineArea('uic_front', {
  ch: 1, name: 'United International College', sub: 'Dania Beach, Florida', music: 'campus', minX: 80, maxX: 1900, battleBack: 'uic',
  sniffNothing: 'Alejandro sniffs… cut grass, sunscreen, and a hint of paper clips.',
  foes(){
    const f = []; if(!F('c1_case')) return f;
    const mk = (id, type, x, y, patrol, party) => Object.assign(WD.makeEnt({ kind: WD.FOES[type].kind, look: WD.FOES[type].look ? WD.CATS[WD.FOES[type].look] : null, name: WD.FOES[type].name, x, y, dir: -1 }), { fid: id, party, patrol });
    f.push(mk('c1_f1', 'clipcat', 1350, 60, [1240, 1440], ['clipcat']));
    f.push(mk('c1_f2', 'bat', 1560, 52, [1480, 1640], ['bat', 'clipcat']));
    return f.filter(x => !F('beat_' + x.fid));
  },
  drawBack(t, dt){
    const c = WD.ctx;
    WD.drawOutdoorBack(t, dt);
    WD.setLayer(.55); C_FAR.forEach(b => WD.drawBuilding(c, b)); WD.drawPoinciana(c, 700, 4, t);
    c.fillStyle = 'rgba(255,226,180,.12)'; c.fillRect(WD.cam.x * .55 - WD.viewL * 1.2, -220, WD.viewL * 2.4, 230);
    WD.setLayer(.82); C_PALMS.forEach(p => WD.drawPalm(c, p.x, 4, p.h, p.lean, t, p.ph, WD.PALMCOL, true));
    WD.setLayer(1); WD.drawLawn(c);
    c.fillStyle = '#7E7E7A'; c.fillRect(-200, 0, 480, 36); c.fillStyle = 'rgba(255,255,255,.7)'; for(let x = -160; x < 280; x += 70) c.fillRect(x, 4, 3, 26);
    drawUICBuilding(c, 520, 1000, 34, t);
    WD.drawBoard(c, 340, 34, t, false);
    drawStatue(c, 1080, 24, t);
    drawPlanter(c, 1200, 34, F('toy_sock'));
    drawOldGym(c, 1610, 34, t, F('c1_gym_open'));
    drawCarP(c, 150, 30);
    WD.drawLamp(c, 470, 34); WD.drawLamp(c, 1530, 34);
  },
  drawFront(t){ WD.drawMotes(t); WD.drawFront(t, C_FRONT); },
  things(){
    const L = [];
    L.push({ x: 150, y: 52, label: 'Car', h: 60, act: carHome });
    L.push({ x: 340, y: 46, label: 'Board', h: 96, act: () => WD.cut(async () => { await WD.narrate('(The campus board. English classes, a salsa night, and “LOST: one stapler. It bites.”)'); WD.saveNow(); WD.sfx('get'); WD.toast('Game saved'); }) });
    L.push({ x: 760, y: 46, label: 'Go inside', h: 120, act: () => { WD.sfx('door'); WD.gotoArea('uic_lobby', 110, 66, { dir: 1, from: 'uic_front' }); } });
    L.push({ x: 1080, y: 50, label: 'Statue', h: 110, act: () => WD.cut(async () => { await me('The eagle ray. UIC’s mascot. Wings out, flying through the water like it owns the ocean.', { t: 'La raya águila. The mascot. ¡Qué elegante!', es: 'La raya águila, la mascota. ¡Qué elegante!' }, 'happy'); }) });
    if(!F('toy_sock')) L.push({ x: 1200, y: 50, skill: 'p', who: 'alejandro', label: 'Sniff', h: 50, act: () => WD.cut(async () => { const a = W.partner; a.sniff = true; WD.sfx('sniff'); await WD.wait(800); a.sniff = false; WD.emote(a, '!'); await alejandro('Dig dig… A sock! Knotted up! It smells like Dayla and… flowers.', 'happy'); await toyGet('sock'); }) });
    L.push({ x: 1760, y: 50, label: F('c1_gym_open') ? 'Old gym' : 'Gym doors', h: 90, act: gymDoor });
    return shotThings('uic_front').concat(L);
  },
  async enter(from){
    if(!F('c1_front_seen')){ S('c1_front_seen'); await WD.cut(async () => {
      const p = W.player; WD.cam.lock = true; await WD.camTo(760, 1.0, 1600);
      await me('UIC. Dania Beach campus. If Dayla was at that front desk, somebody in there saw something.', { t: 'Mi trabajo. If Dayla was at my front desk, somebody saw something.', es: 'Mi trabajo. Si Dayla estuvo en mi recepción, alguien vio algo.' }, 'determined');
      if(W.partner) await alejandro('Big school. So many… papers. I love papers. Ha. Let’s go inside! Quickly! Or slowly. Whatever you want.', 'happy');
      WD.cam.lock = false; WD.updateGoal();
    }); }
  }
});
async function carHome(){
  await WD.cut(async () => {
    const fly = F('int1_done');
    const i = await WD.choose(WD.hero, fly ? (D() ? 'Where to?' : '¿Para dónde?') : (D() ? 'Head home to Tivoli Park for a bit?' : '¿Vamos a la casa un rato?'), fly ? ['Drive home', 'Airport → Bogotá', 'Stay at UIC'] : ['Drive home', 'Stay at UIC']);
    if(i === 0) await WD.gotoArea('courts', 1500, 64, { dir: -1, from: 'uic' });
    else if(fly && i === 1) await WD.startChapter(2);
  });
}
function gymDoor(){
  WD.cut(async () => {
    if(F('c1_gym_open')){ WD.sfx('door'); return WD.gotoArea('uic_gym', 110, 66, { dir: 1, from: 'uic_front' }); }
    if(!F('c1_key')){ await me('Chained shut. Fresh chain, too. Somebody wants this place closed.', { t: 'Cerrado con cadena. A new chain. Qué raro.', es: 'Cerrado con cadena. Una cadena nueva. Qué raro.' }, 'think'); if(F('c1_forged')) await me('Lydia has the key. Somewhere.', 'Lydia tiene la llave. En algún lado.', 'smirk'); return; }
    WD.sfx('clang'); WD.shake(4); S('c1_gym_open'); await WD.wait(400);
    await me('The key fits. Okay. Whoever is in there… we’re coming in.', { t: 'Funciona. Okay. ¡Allá vamos!', es: 'Funciona. Okay. ¡Allá vamos!' }, 'determined');
    WD.saveNow(); WD.sfx('door'); await WD.gotoArea('uic_gym', 110, 66, { dir: 1, from: 'uic_front' });
  });
}

/* ================= AREA: Front desk & halls ================= */
const DESK = { staff: [] };
WD.defineArea('uic_lobby', {
  ch: 1, name: 'Front Desk & Halls', sub: 'United International College', music: 'office', light: 'indoor', minX: 80, maxX: 1440, laneTop: 46, laneBot: 92, camMin: -70, camMax: 1520, camZ: .92, battleBack: 'hall',
  sniffNothing: 'Alejandro sniffs… floor wax, coffee, and printer toner.',
  npcs(){
    const n = [];
    NPC.leonela = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Leonela, name: 'Leonela', x: 222, y: -24, dir: 1, light: 'indoor' });
    DESK.staff = [NPC.leonela];
    if(F('c1_case')){ NPC.angelica = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Angelica, name: 'Angelica', x: 470, y: 56, dir: -1, light: 'indoor', talkTo: talkAngelica }); n.push(NPC.angelica); }
    if(F('c1_case')){ NPC.spouse = mkSpouse(560, 68, -1); n.push(NPC.spouse); }
    return n;
  },
  foes(){
    if(!F('c1_case')) return [];
    const mk = (id, type, x, y, patrol, party) => Object.assign(WD.makeEnt({ kind: WD.FOES[type].kind, look: WD.FOES[type].look ? WD.CATS[WD.FOES[type].look] : null, name: WD.FOES[type].name, x, y, dir: -1, light: 'indoor' }), { fid: id, party, patrol });
    return [mk('c1_h1', 'stapler', 760, 70, [680, 900], ['stapler']), mk('c1_h2', 'bat', 1150, 56, [1060, 1260], ['bat', 'stapler'])].filter(x => !F('beat_' + x.fid));
  },
  drawBack(t){
    const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C9B48E'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1); room(c, t, { w: 1640 });
    c.fillStyle = '#B9D6EA'; c.fillRect(-60, -150, 110, 170); c.strokeStyle = MAR; c.lineWidth = 4; c.strokeRect(-60, -150, 110, 170); c.beginPath(); c.moveTo(-5, -150); c.lineTo(-5, 20); c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(-50, 0); c.lineTo(-10, -150); c.lineTo(5, -150); c.lineTo(-35, 0); c.fill();
    c.fillStyle = MAR; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('ENTRANCE', -5, -158);
    frontDesk(c, 230);
    poster(c, 120, -150, 'BIENVENIDOS', '#3E8FC7', -.05); poster(c, 345, -146, 'WELCOME', '#E8593C', .04);
    door(c, 430, 'DIRECTOR'); plant(c, 500, 20);
    door(c, 620, 'REGISTRAR', { col: '#7A5A3E' });
    poster(c, 710, -130, 'CLUB FAIR', '#7FB548', -.03);
    door(c, 820, 'ENGLISH 101', { col: '#5E7A8E' });
    poster(c, 915, -126, 'SPELLING BEE', '#F2C14E', .05);
    door(c, 1020, 'MEDIA', { col: '#8E5E7A' });
    plant(c, 1100, 20);
    door(c, 1220, 'PRESIDENT', { col: '#6E5030' });
    banner(c, 1310, -132, t);
    c.fillStyle = '#C9CCCF'; rr(c, 1440, -60, 22, 40, 3); c.fill(); c.fillStyle = '#9AA0A6'; c.fillRect(1444, -64, 14, 5);
    DESK.staff.forEach(e => { WD.tickEnt(e, 0); paintBehind(e); });
    deskCounter(c, 230);
  },
  things(){
    const L = [];
    L.push({ x: 60, y: 60, label: 'Outside', h: 130, r: 64, act: () => { WD.sfx('door'); WD.gotoArea('uic_front', 760, 56, { dir: 1, from: 'uic_lobby' }); } });
    L.push({ x: 230, y: 50, label: 'Front desk', h: 120, act: talkDesk });
    L.push({ x: 430, y: 50, label: 'Director', h: 120, act: () => WD.cut(async () => { await me('Angelica’s office. Door’s open, but she’s out here in the hall.', 'La oficina de Angelica.', 'happy'); }) });
    if(F('c1_case')){
      L.push({ x: 620, y: 50, label: 'Registrar', h: 130, act: () => { WD.sfx('door'); WD.gotoArea('uic_registrar', 90, 66, { dir: 1, from: 'uic_lobby' }); } });
      L.push({ x: 820, y: 50, label: 'English 101', h: 130, act: () => { WD.sfx('door'); WD.gotoArea('uic_class', 90, 66, { dir: 1, from: 'uic_lobby' }); } });
      L.push({ x: 1020, y: 50, label: 'Media room', h: 130, act: () => { WD.sfx('door'); WD.gotoArea('uic_media', 90, 66, { dir: 1, from: 'uic_lobby' }); } });
      L.push({ x: 1220, y: 50, label: 'President', h: 130, act: () => { WD.sfx('door'); WD.gotoArea('uic_lydia', 90, 66, { dir: 1, from: 'uic_lobby' }); } });
    }
    L.push({ x: 1450, y: 56, label: 'Water', h: 70, act: () => WD.cut(async () => { const G = WD.G; G.hp = G.mhp; Object.values(G.party).forEach(P => P.hp = P.mhp); WD.sfx('heal'); await me('Cold water. Okay. Feeling better.', 'Agüita fría. Mucho mejor.', 'happy'); WD.toast('HP refilled'); }) });
    return shotThings('uic_lobby').concat(L);
  },
  update(dt){ DESK.staff.forEach(e => WD.tickEnt(e, dt)); },
  async enter(){ WD.actors.Leonela = NPC.leonela; if(!F('c1_case')) await caseScene(); }
});
function talkDesk(){
  WD.cut(async () => {
    const l = NPC.leonela;
    if(F('c1_forged') && !F('c1_boss')) await say('Leonela', 'If you see those cats in suits, can I pet one? Just one. A little one.', { ent: l, es: D() ? null : 'Si ves a los gatos en traje, ¿puedo acariciar uno? Uno solito. Chiquito.', expr: 'joy' });
    else if(F('c1_boss')) await say('Leonela', 'The gym cat wore a GOWN? I need a picture. For science.', { ent: l, es: D() ? null : '¿El gato del gimnasio tenía TOGA? Necesito una foto. Para la ciencia.', expr: 'joy' });
    else await say('Leonela', D() ? 'Laura’s the registrar now, but she still runs this desk better than me. Don’t tell her I said that.' : 'Girl, you still do this job better than me. Don’t tell anyone.', { ent: l, es: D() ? null : 'Amiga, tú todavía haces este trabajo mejor que yo. No le digas a nadie.', expr: 'smirk' });
  });
}
async function caseScene(){
  await WD.cut(async () => {
    const p = W.player, l = NPC.leonela;
    WD.cam.lock = true; await WD.camTo(300, 1.08, 900);
    if(D()) await say('Leonela', '¡David! Laura told me about Dayla. ¡Qué horror! Angelica has been waiting for you.', { ent: l, expr: 'worried' });
    else await say('Leonela', 'Girl! What happened? Angelica is looking for you like crazy.', { ent: l, es: '¡Amiga! ¿Qué pasó? Angelica te está buscando como loca.', expr: 'worried' });
    if(D()) learnWord('¡Qué horror!', 'How awful!');
    const a = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Angelica, name: 'Angelica', x: 470, y: 60, dir: -1, light: 'indoor' });
    const sp = mkSpouse(520, 72, -1); W.npcs.push(a, sp); WD.actors.Angelica = a; WD.actors[WD.spouse] = sp; NPC.angelica = a; NPC.spouse = sp;
    WD.sfx('door'); await Promise.all([WD.walkTo(a, 360, 60, 70), WD.walkTo(sp, 410, 72, 70)]);
    p.dir = 1;
    if(D()) await say(WD.spouse, 'You made it. Angelica, this is the dog. I mean, he’s here about the dog.', { es: 'Llegaste. Angelica, él viene por lo de la perrita.', expr: 'worried' });
    await say('Angelica', D() ? 'David. I am so sorry about Dayla. Come, look at this.' : 'Laura, mi amor. Lo siento tanto. Come, look at this.', { expr: 'sad' });
    await say('Angelica', 'This morning a cat in a suit came to the desk with “transfer papers.” To move a student named Dayla Rhead to an institution called The Collection.', { expr: 'think' });
    await me('Dayla is a dog. She’s not a student.', { t: 'Dayla es una perrita. Not a student!', es: '¡Dayla es una perrita, no una estudiante!' }, 'surprised');
    await say('Angelica', 'I noticed. She also ate the cat’s breakfast off my counter. But the papers are signed and stamped. Very official.', { expr: 'smirk' });
    await say('Angelica', 'Except the stamps are wrong. I would bet my reputation on it. To prove it, I need the real ones to compare.', { expr: 'determined' });
    await say('Angelica', 'The Registrar’s Seal. The English Department stamp. And the Media office stamp. Bring me all three.', { expr: 'determined' });
    WD.giveKey('papers'); await WD.itemGet('papers', 'Dayla’s “Transfer Papers”', 'Forged, probably. Find UIC’s three real stamps to prove it.', 'Key item');
    await say('Angelica', 'And eat something. You can’t chase cats on an empty stomach.', { es: 'Y coman algo. No pueden perseguir gatos con el estómago vacío.', expr: 'happy' });
    WD.giveItem('pandebono', 2); await WD.itemGet('pandebono', 'Pandebono ×2', WD.ITEMS.pandebono.desc);
    // the desk, and an old memory
    await say('Leonela', 'Aw, this desk… Isn’t this how you two met? At the front desk?', { ent: l, es: D() ? null : 'Ay, la recepción… ¿No fue así que se conocieron? ¿En la recepción?', expr: 'joy' });
    await me('At the old one. Back in Miramar.', { t: 'En la vieja. Allá en Miramar.', es: 'En la vieja. Allá en Miramar.' }, 'happy');
    await flashback();
    WD.MUS.play('office'); WD.light = 'indoor';
    WD.cam.lock = true; WD.cam.x = 340; WD.cam.z = 1.08; p.x = 300; p.y = 66; p.dir = 1;
    await say('Angelica', 'Start with the Registrar’s Office. Someone left a very large dog in there, and he will not move.', { expr: 'think' });
    if(D()) await say(WD.spouse, '¡Mi oficina! Go. I’ll stay out here with Leonela and watch the desk.', { es: '¡Esa es mi oficina! Ve. Yo me quedo aquí con Leonela cuidando la recepción.', expr: 'determined' });
    else await say(WD.spouse, 'Your office? Go. I’ll stay out here in case that cat comes back.', { expr: 'determined' });
    S('c1_case'); WD.saveNow();
    await WD.walkTo(a, 470, 56, 70); await WD.walkTo(sp, 560, 68, 70); a.dir = -1; a.talkTo = talkAngelica; sp.talkTo = talkSpouse;
    W.foes = W.area.foes(); WD.cam.lock = false; WD.updateGoal();
  });
}
function talkAngelica(){
  WD.cut(async () => {
    const n = stamps();
    if(!F('c1_forged') && n === 3) return forgedScene();
    if(!F('c1_forged')){ await say('Angelica', n ? `${n} of 3 stamps. Good. Keep going. Registrar, English, Media.` : 'Registrar, English, Media. Three real stamps, and we compare.', { expr: 'determined' }); if(D()) learnWord('sello', 'stamp'); return; }
    if(!F('c1_boss')) await say('Angelica', 'The old gym. Lydia has the key. Bring Dayla back, and then I am giving that cat detention myself.', { expr: 'angry' });
    else await say('Angelica', 'Bogotá. Then go home and pack. And Laura, take all the time you need. Your job will be here.', { es: 'Bogotá. Entonces vayan a empacar. Y Laura, tómate el tiempo que necesites. Tu trabajo te espera.', expr: 'happy' });
  });
}
async function forgedScene(){
  const a = NPC.angelica;
  await say('Angelica', 'All three. Let me see.', { expr: 'think' });
  WD.sfx('clue'); await WD.wait(500);
  await say('Angelica', 'Registrar’s Seal: ours has the eagle ray. Theirs has… a fish. English stamp: they spelled “English” with two G’s. Media stamp: a drawing of a camera. In crayon.', { expr: 'smirk' });
  await say('Angelica', 'Forged. All of it. Whoever wants Dayla needed papers to move her, and they faked them here.', { expr: 'angry' });
  S('c1_forged'); clue('forged'); WD.pingBag();
  await say('Angelica', 'And Marcela’s picture of the old gym. Two cats in suits carrying a graduation cap inside. That gym has been locked for years.', { expr: 'determined' });
  await say('Angelica', 'Lydia has the only key. Go see her. And be patient with her, she will want to talk.', { es: 'Lydia tiene la única llave. Vayan a verla. Y ténganle paciencia, va a querer conversar.', expr: 'happy' });
  WD.updateGoal(); WD.saveNow();
}

/* ================= the Miramar flashback (a real memory, told as it happened) ================= */
const FLASH = { mode: 'cutscene', ents: [] };
FLASH.update = function(dt){ WD.tickGoals(FLASH.ents, dt); FLASH.ents.forEach(e => WD.tickEnt(e, dt)); };
FLASH.draw = function(t){
  const c = WD.ctx, v = WD.view;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2A2238'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
  WD.light = 'night'; WD.setLayer(1);
  room(c, t, { w: 800, wall: '#E2D4BC', lower: '#CDBB9C', floor: '#BFAE92', lights: false });
  c.fillStyle = '#1E2A48'; c.fillRect(20, -170, 150, 110); c.strokeStyle = '#C29C6E'; c.lineWidth = 5; c.strokeRect(20, -170, 150, 110); c.beginPath(); c.moveTo(95, -170); c.lineTo(95, -60); c.stroke();
  c.fillStyle = '#FFF7E0'; c.beginPath(); c.arc(140, -140, 9, 0, 7); c.fill(); c.fillStyle = '#1E2A48'; c.beginPath(); c.arc(144, -142, 8, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.7)'; [[40, -150], [70, -120], [120, -100], [60, -90]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, .9, 0, 7); c.fill(); });
  c.fillStyle = MAR; rr(c, 300, -150, 160, 20, 3); c.fill(); c.fillStyle = '#FFF8EC'; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('UNITED INTERNATIONAL COLLEGE', 380, -140); c.fillStyle = 'rgba(255,248,236,.7)'; c.font = '800 6px Nunito, system-ui'; c.fillText('MIRAMAR', 380, -122);
  const L = FLASH.ents.find(e => e.name === 'Laura'), Dv = FLASH.ents.find(e => e.name === 'David');
  if(L){ const [sx, sy] = WD.toScreen(L.x, L.y); WD.paintEnt(L, sx, sy, v.dpr * v.S * WD.cam.z * .9); WD.setLayer(1); }
  c.fillStyle = '#8A5A36'; rr(c, 300, -34, 170, 54, 3); c.fill(); c.fillStyle = '#A9744A'; c.fillRect(296, -40, 178, 8);
  c.fillStyle = '#2E2E36'; rr(c, 410, -64, 30, 22, 2); c.fill(); c.fillStyle = '#9FC4E4'; c.fillRect(412, -62, 26, 17);
  c.fillStyle = '#E8B84A'; c.beginPath(); c.moveTo(322, -40); c.lineTo(326, -62); c.lineTo(334, -62); c.lineTo(338, -40); c.fill(); c.fillStyle = '#5B4A3A'; c.fillRect(329, -66, 2, 6);
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(330, -50, 2, 330, -40, 90); g.addColorStop(0, 'rgba(255,214,140,.45)'); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.fillRect(230, -140, 200, 200); c.restore();
  if(Dv){ const [sx, sy] = WD.toScreen(Dv.x, Dv.y); WD.paintEnt(Dv, sx, sy, v.dpr * v.S * WD.cam.z * (.9 + (Dv.y - 44) / 48 * .14)); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(120,80,40,.16)'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
  WD.drawVignette(false); const ctx = WD.ctx; ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0); const vg = ctx.createRadialGradient(v.w / 2, v.h / 2, Math.min(v.w, v.h) * .35, v.w / 2, v.h / 2, Math.max(v.w, v.h) * .7); vg.addColorStop(0, 'rgba(250,236,200,0)'); vg.addColorStop(1, 'rgba(250,236,200,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, v.w, v.h);
};
async function flashback(){
  const back = WD.scene;
  const Lr = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Laura, name: 'Laura', x: 385, y: -22, dir: -1, light: 'night' });
  const Dv = WD.makeEnt({ kind: 'human', look: WD.LOOKS.David, name: 'David', x: 40, y: 72, dir: 1, light: 'night' });
  FLASH.ents = [Lr, Dv];
  const prevActors = WD.actors; WD.actors = { Laura: Lr, David: Dv };
  await WD.pageTurn(() => { WD.setScene(FLASH, 'cutscene'); WD.cam.lock = true; WD.cam.x = 300; WD.cam.z = 1.1; });
  WD.MUS.play('memory'); WD.letter = 1;
  await WD.narrate('(Back when UIC was still in Miramar.)');
  await WD.narrate(D() ? '(One night. Laura is working the front desk. David walks up.)' : '(One night at the front desk. David walks up.)');
  await WD.choose(null, D() ? '(Walk up to the desk.)' : '(Look up from the desk.)', [D() ? 'Walk up' : 'Look up']);
  if(D()) await WD.walkTo(Dv, 300, 66, 60); else { Dv.x = 160; await WD.walkTo(Dv, 300, 66, 60); }
  Dv.dir = 1; Lr.dir = -1;
  await say('David', 'Can I get your number?', { ent: Dv, expr: 'happy' });
  await say('Laura', 'Sorry, no. I don’t give out my number.', { ent: Lr, expr: 'smirk' });
  await WD.narrate('(He already had her Instagram. She said he could message her there.)');
  await WD.narrate('(Their first date was at a sushi place in Miramar.)');
  await WD.wait(400);
  WD.actors = prevActors;
  await WD.pageTurn(() => { WD.setScene(back, 'cutscene'); WD.light = 'indoor'; });
}

/* ================= AREA: Registrar's Office (Chunkers) ================= */
const REG = { sit: false, cab: 0 };
const REG_GATE = 500, REG_PLATE = 300, REG_CAB = 430;
WD.defineArea('uic_registrar', {
  ch: 1, name: 'Registrar’s Office', sub: 'United International College', music: 'office', light: 'indoor', minX: 80, maxX: 690, laneTop: 46, laneBot: 92, camMin: -70, camMax: 780, camZ: .92, battleBack: 'hall',
  npcs(){
    if(!F('c1_chunkers')){ NPC.chunkers = WD.makeEnt({ kind: 'bull', name: 'Chunkers', x: REG_PLATE, y: 64, dir: 1, sit: true, zzz: true, light: 'indoor', talkTo: freeChunkers, label: 'Bulldog?' }); return [NPC.chunkers]; }
    return [];
  },
  limit(nx, px){
    if(REG.sit || px >= REG_GATE) return nx;
    return Math.min(nx, REG_GATE - 14);
  },
  drawBack(t){
    const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C9B48E'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1); room(c, t, { w: 860 });
    door(c, 30, 'HALL');
    c.fillStyle = MAR; rr(c, 120, -190, 130, 22, 3); c.fill(); c.fillStyle = '#FFF8EC'; c.font = '900 10px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('REGISTRAR · REGISTRO', 185, -179);
    c.fillStyle = '#8A5A36'; rr(c, 110, -40, 120, 12, 2); c.fill(); c.fillRect(118, -28, 6, 48); c.fillRect(216, -28, 6, 48); c.fillStyle = '#2E2E36'; rr(c, 150, -76, 40, 30, 2); c.fill(); c.fillStyle = '#7FB0D8'; c.fillRect(153, -73, 34, 22);
    c.fillStyle = '#FFFDF6'; for(let i = 0; i < 6; i++){ c.save(); c.translate(130 + i * 14, -44 - (i % 3) * 3); c.rotate((i - 3) * .2); c.fillRect(-6, -4, 12, 8); c.restore(); }
    c.fillStyle = '#5B4A3A'; c.fillRect(250, -150, 46, 36); c.fillStyle = '#FFF8EC'; c.fillRect(253, -147, 40, 30); drawLogo(c, 273, -132, .6);
    // records cage
    c.strokeStyle = 'rgba(120,128,136,.8)'; c.lineWidth = .8; for(let x = REG_GATE + 10; x < 700; x += 8){ c.beginPath(); c.moveTo(x, -170); c.lineTo(x + 30, 20); c.moveTo(x + 30, -170); c.lineTo(x, 20); c.stroke(); }
    c.fillStyle = '#6E7681'; c.fillRect(REG_GATE + 4, -172, 196, 5); c.fillRect(696, -172, 5, 192);
    for(let i = 0; i < 3; i++){ const cx = 560 + i * 44; c.fillStyle = '#C9C2B5'; rr(c, cx - 18, -110, 36, 130, 2); c.fill(); for(let d = 0; d < 4; d++){ c.fillStyle = '#B5AD9F'; c.fillRect(cx - 15, -104 + d * 30, 30, 26); c.fillStyle = '#7E7668'; c.fillRect(cx - 6, -94 + d * 30, 12, 3); } }
    c.fillStyle = MAR; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('RECORDS', 600, -180);
    const gu = REG.gateU = lerp(REG.gateU || 0, REG.sit ? 1 : 0, .12);
    c.save(); c.translate(0, -gu * 150); c.fillStyle = '#7E8792'; c.fillRect(REG_GATE - 4, -170, 10, 190); c.strokeStyle = '#7E8792'; c.lineWidth = 1; for(let y = -160; y < 20; y += 10){ c.beginPath(); c.moveTo(REG_GATE - 4, y); c.lineTo(REG_GATE + 6, y + 5); c.stroke(); } c.restore();
    // pressure plate
    c.fillStyle = REG.sit ? '#7FB548' : '#B9BCC2'; rr(c, REG_PLATE - 20, 60, 40, 9, 3); c.fill(); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(REG_PLATE - 20, 66, 40, 3);
    c.strokeStyle = 'rgba(80,84,92,.6)'; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(REG_PLATE + 20, 64); c.lineTo(REG_GATE, 64); c.lineTo(REG_GATE, 20); c.stroke(); c.setLineDash([]);
    // the heavy cabinet (pushable)
    REG.cab = lerp(REG.cab, F('reg_push') ? 1 : 0, .1);
    const cx = REG_CAB + REG.cab * -90; c.fillStyle = '#9AA0A6'; rr(c, cx - 22, -60, 44, 92, 2); c.fill(); for(let d = 0; d < 3; d++){ c.fillStyle = '#B9BCC2'; c.fillRect(cx - 19, -54 + d * 28, 38, 24); c.fillStyle = '#6E7681'; c.fillRect(cx - 6, -44 + d * 28, 12, 3); }
    if(!F('reg_push')){ c.fillStyle = '#FFFDF6'; c.save(); c.translate(cx, -70); c.rotate(.08); c.fillRect(-16, -8, 32, 14); c.fillStyle = '#D6452B'; c.font = '900 5px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DO NOT MOVE', 0, -1); c.restore(); }
  },
  things(){
    const L = [];
    L.push({ x: 40, y: 60, label: 'Hall', h: 130, r: 60, act: () => { WD.sfx('door'); WD.gotoArea('uic_lobby', 620, 66, { dir: 1, from: 'uic_registrar' }); } });
    L.push({ x: 170, y: 50, label: 'Desk', h: 90, act: () => WD.cut(async () => { await me(D() ? 'Laura’s desk. Somebody went through every drawer. Rude.' : 'Mi escritorio. Someone went through every drawer. ¡Qué atrevidos!', D() ? null : { t: 'Mi escritorio. Someone went through every drawer. ¡Qué atrevidos!', es: 'Mi escritorio. Alguien revisó todos los cajones. ¡Qué atrevidos!' }, 'angry'); }) });
    if(F('c1_chunkers') && !F('reg_push')){ L.push({ x: REG_CAB, y: 56, label: 'Cabinet', h: 110, act: () => WD.cut(async () => { await me('A filing cabinet full of… bricks? It won’t budge. And it’s blocking the cage.', { t: 'Pesa muchísimo. It’s blocking the records cage.', es: 'Pesa muchísimo. Está bloqueando la jaula de archivos.' }, 'think'); }) }); L.push({ x: REG_CAB, y: 56, skill: 'p', who: 'chunkers', label: 'Push', h: 110, act: pushCabinet }); }
    if(F('reg_push') && !REG.sit && !F('stamp_reg')) L.push({ x: REG_PLATE, y: 64, skill: 'p', who: 'chunkers', label: 'Sit', h: 40, act: sitPlate });
    if(F('reg_push') && !F('stamp_reg')) L.push({ x: REG_GATE - 30, y: 60, label: 'Cage', h: 120, show: () => !REG.sit, act: () => WD.cut(async () => { await me('The cage gate is on a spring. It only opens while something heavy sits on that floor plate.', { t: 'La reja solo se abre mientras algo pesado esté sobre esa placa.', es: 'La reja solo se abre mientras algo pesado esté sobre esa placa.' }, 'think'); }) });
    if(!F('stamp_reg')) L.push({ x: 604, y: 56, label: 'Records', h: 120, show: () => W.player.x > REG_GATE, act: filing });
    return L;
  },
  update(){
    const p = W.player, a = CHUNK();
    if(REG.sit && F('stamp_reg') && p.x < REG_GATE - 30 && a){ REG.sit = false; a.sit = false; a.pinned = false; WD.emote(a, 'heart'); }
  },
  async enter(){ REG.sit = false; REG.gateU = 0; REG.cab = F('reg_push') ? 1 : 0; if(!F('c1_chunkers')) await chunkersScene(); }
});
async function chunkersScene(){
  await WD.cut(async () => {
    const p = W.player, ch = NPC.chunkers; WD.actors.Chunkers = ch;
    WD.cam.lock = true; await WD.camTo(330, 1.1, 900);
    await chunkers('(Snoooore.)', 'sleep');
    WD.emote(p, '!');
    await me('Wait. That’s… CHUNKERS?', { t: '¿Ese es… CHUNKERS?', es: '¿Ese es… CHUNKERS?' }, 'surprised');
    if(W.partner) await alejandro('You KNOW this… enormous… potato?', 'surprised');
    await me('We dog-sat him! Chunkers, buddy. What are you doing here?', { t: '¡Lo cuidamos! Chunkers, mi amor, ¿qué haces aquí?', es: '¡Lo cuidamos! Chunkers, mi amor, ¿qué haces aquí?' }, 'joy');
    ch.zzz = false; ch.sleepy = false; WD.emote(ch, '?');
    await chunkers('…Snort. Hi. Told: stay. Chunkers stay.');
    await me('Who told you to stay?', '¿Quién te dijo que te quedaras?', 'think');
    await chunkers('Cat. In suit. Said “good boy.” Chunkers IS good boy.', 'happy');
    await chunkers('Cat moved heavy box. Said “do not move.” Then cat left. With little dog. Little dog was eating.', 'think');
    await me('Dayla. That was Dayla! Chunkers, you’re the best boy. But you’re done staying. Chunkers… come!', { t: '¡Era Dayla! Chunkers, eres el mejor. Pero ya no te quedes. Chunkers… ¡ven!', es: '¡Era Dayla! Chunkers, eres el mejor. Pero ya no te quedes. Chunkers… ¡ven!' }, 'determined');
    WD.sfx('bark'); ch.sit = false; ch.happy = true; await WD.walkTo(ch, p.x + 40, p.y, 70); ch.dir = -1;
    WD.emote(ch, 'heart'); WD.sfx('squeak');
    await chunkers('Slurp. Chunkers help. Chunkers push. Chunkers sit. Chunkers find little dog.', 'joy');
    if(W.partner){ await alejandro('Oh. Another partner. Great. Love that. Very… big. I’m the first one, though. Just so we’re clear.', 'smirk'); await chunkers('Small hot dog. Friend.', 'happy'); await alejandro('…Long-body chihuahua.', 'angry'); }
    S('c1_chunkers'); WD.addPartner('chunkers');
    W.npcs = W.npcs.filter(e => e !== ch); NPC.chunkers = null;
    const keep = W.partner; WD.swapPartner('chunkers'); if(W.partner){ W.partner.x = ch.x; W.partner.y = ch.y; W.partner.dir = -1; }
    WD.sfx('level');
    await WD.card(`<i class="k">New partner</i><h2>Chunkers joined you!</h2><p>An English bulldog with one tooth out. You’ve babysat him. Strong, obedient, and always a little sleepy.</p><ul><li><b>💪 Push</b> heavy things, and <b>Sit</b> on floor switches to hold them down.</li><li>In battle: <b>Bulldog Bash</b> (hold A) and <b>Good Boy Guard</b> (he takes the next hit for you).</li><li>${keep ? 'Alejandro is still with you. Switch partners any time in the bag’s <b>Party</b> tab, or mid-battle on your partner’s turn.' : 'Switch partners in the bag’s Party tab.'}</li></ul>`, [{ label: 'Good boy!', alt: true }]);
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
  });
}
function freeChunkers(){ chunkersScene(); }
async function pushCabinet(){
  await WD.cut(async () => {
    const a = W.partner; a.pinned = true;
    await WD.walkTo(a, REG_CAB + 30, 62, 80); a.dir = -1;
    await chunkers('Hnnngh.', 'determined'); WD.sfx('step');
    S('reg_push'); WD.shake(4); WD.sfx('clang');
    await WD.walkTo(a, REG_CAB - 60, 62, 40);
    a.pinned = false; WD.emote(a, 'heart');
    await me('He moved it! Okay. Now the cage.', { t: '¡Lo movió! Okay. Ahora la jaula.', es: '¡Lo movió! Okay. Ahora la jaula.' }, 'joy');
    WD.updateGoal();
  });
}
async function sitPlate(){
  await WD.cut(async () => {
    const a = W.partner; a.pinned = true;
    await WD.walkTo(a, REG_PLATE, 64, 80); a.dir = 1;
    await me('Chunkers. Sit.', 'Chunkers. Sit.', 'determined');
    a.sit = true; REG.sit = true; WD.sfx('clang'); WD.shake(3);
    await chunkers('Chunkers sit. Chunkers stay. Chunkers is good at this.', 'happy');
  });
}
async function filing(){
  await WD.cut(async () => {
    await me('The records drawers. Somebody dumped every file out. If I put them back in order, Dayla’s real record should be in here.', { t: '¡Mis archivos! Todo regado. If I put them in order, I’ll find Dayla’s record.', es: '¡Mis archivos! Todo regado. Si los ordeno, encuentro el registro de Dayla.' }, 'determined');
    const items = ['Navarro', 'Acosta', 'Zapata', 'Rhead', 'Bermúdez', 'Ortiz'];
    const tries = await orderGame('File them A to Z', 'Tap the folders in alphabetical order, A to Z.', items, ['Acosta', 'Bermúdez', 'Navarro', 'Ortiz', 'Rhead', 'Zapata']);
    if(tries === 0) await me('First try. Alphabet champion.', { t: 'A la primera. Por algo soy la registradora.', es: 'A la primera. Por algo soy la registradora.' }, 'smirk');
    WD.giveKey('record'); await WD.itemGet('record', 'Dayla’s Real Record', WD.KEYS.record.desc, 'Key item');
    await me('“Transfers: NONE.” Of course not. She’s a dog.', { t: '“Transferencias: NINGUNA.” ¡Claro que no!', es: '“Transferencias: NINGUNA.” ¡Claro que no!' }, 'smirk');
    S('stamp_reg'); await WD.itemGet('stamp', 'The Registrar’s Seal', 'UIC’s real seal, with the eagle ray. Stamp 1 of 3.', 'Stamp');
    WD.updateGoal(); WD.saveNow();
  });
}

/* ================= AREA: English 101 (the quiz show) ================= */
const QUIZ = [
  ['What does “break a leg” mean?', ['Good luck!', 'Go to the hospital', 'Run really fast'], 0],
  ['Which one is spelled right?', ['Recieve', 'Receive', 'Receeve'], 1],
  ['More than one mouse is…', ['Mouses', 'Mice', 'Meese'], 1],
  ['If a test is “a piece of cake,” it is…', ['Easy', 'Delicious', 'On Friday'], 0],
  ['What’s the past tense of “run”?', ['Runned', 'Runt', 'Ran'], 2]
];
WD.defineArea('uic_class', {
  ch: 1, name: 'English 101', sub: 'United International College', music: 'quiz', light: 'indoor', minX: 80, maxX: 720, laneTop: 46, laneBot: 92, camMin: -70, camMax: 800, camZ: .92, battleBack: 'hall',
  npcs(){
    NPC.lesser = WD.makeEnt({ kind: 'human', look: WD.LOOKS['David Lesser'], name: 'David Lesser', x: 470, y: 54, dir: -1, light: 'indoor', talkTo: talkLesser });
    const n = [NPC.lesser];
    if(!F('c1_quizcat')){ NPC.quizcat = WD.makeEnt({ kind: 'cat', look: WD.CATS.clip, name: 'Paper-Clip Cat', x: 620, y: 52, dir: -1, light: 'indoor', talkTo: () => WD.cut(async () => { await say('Paper-Clip Cat', 'I am just a normal student. Here to learn English. Meow. I mean: hello.', { expr: 'happy' }); }) }); n.push(NPC.quizcat); }
    return n;
  },
  drawBack(t){
    const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C9B48E'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1); room(c, t, { w: 860, wall: '#EFE8DA' });
    door(c, 30, 'HALL', { col: '#5E7A8E' });
    c.fillStyle = '#5B4A3A'; rr(c, 160, -150, 300, 96, 3); c.fill(); c.fillStyle = '#FBFBF8'; c.fillRect(166, -144, 288, 84);
    c.fillStyle = '#3E6FB5'; c.font = '900 13px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WORD WIZARDS!', 310, -128);
    c.fillStyle = '#C2453A'; c.font = '800 8px Nunito, system-ui'; c.fillText('the English quiz show', 310, -114);
    c.strokeStyle = 'rgba(62,111,181,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(190, -98); c.lineTo(290, -98); c.moveTo(190, -86); c.lineTo(260, -86); c.stroke();
    c.fillStyle = '#E8593C'; c.font = '900 9px Grandstander, system-ui'; c.fillText('mouse → mice', 370, -84);
    const sc = F('stamp_eng') ? 'WINNER!' : '';
    [[230, '#3E6FB5', 'YOU'], [620, '#7A1F2B', '#2']].forEach(([x, col, lab]) => { c.fillStyle = col; rr(c, x - 28, -30, 56, 50, 4); c.fill(); c.fillStyle = GOLD; c.fillRect(x - 28, -34, 56, 6); c.fillStyle = '#FFF8EC'; c.font = '900 10px Grandstander, system-ui'; c.fillText(lab, x, -6); c.fillStyle = '#E8593C'; c.beginPath(); c.arc(x, -38, 5, Math.PI, 0); c.fill(); });
    if(sc){ c.fillStyle = '#FFC94A'; star(c, 230, -60, 10); }
    c.fillStyle = '#5B4A3A'; rr(c, 440, -36, 60, 56, 3); c.fill(); c.fillStyle = MAR; c.fillRect(440, -40, 60, 6); drawLogo(c, 470, -10, .8);
    for(let i = 0; i < 4; i++){ const x = 120 + i * 160; c.fillStyle = '#8A5A36'; c.fillRect(x - 30, 2, 60, 6); c.fillRect(x - 26, 8, 4, 12); c.fillRect(x + 22, 8, 4, 12); }
    for(let i = 0; i < 12; i++){ const x = 100 + i * 60; c.fillStyle = ['#E8593C', '#F2C14E', '#58AEDD', '#7FB548'][i % 4]; c.beginPath(); c.moveTo(x, -230); c.lineTo(x + 14, -230); c.lineTo(x + 7, -214); c.fill(); }
  },
  things(){
    const L = [];
    L.push({ x: 40, y: 60, label: 'Hall', h: 130, r: 60, act: () => { WD.sfx('door'); WD.gotoArea('uic_lobby', 820, 66, { dir: 1, from: 'uic_class' }); } });
    L.push({ x: 310, y: 50, label: 'Board', h: 150, act: () => WD.cut(async () => { await me('“Word Wizards! The English quiz show.” Somebody drew a little mouse next to “mice.” Cute.', { t: '“Word Wizards.” Ay, David Lesser y sus concursos.', es: '“Word Wizards.” Ay, David Lesser y sus concursos.' }, 'smirk'); }) });
    return L;
  }
});
function talkLesser(){
  WD.cut(async () => {
    const L = NPC.lesser;
    if(F('stamp_eng')){ await say('David Lesser', 'Well, if it isn’t our champion! Y’all come back for the rematch anytime. I’ll bake a pie.', { ent: L, expr: 'joy' }); return; }
    if(!F('c1_quiz_met')){
      S('c1_quiz_met');
      await say('David Lesser', D() ? 'Well, howdy, David! Laura told me what happened. Bless your heart. I am so sorry.' : 'Laura! Darlin’, I heard. Bless your heart. I am so, so sorry.', { ent: L, expr: 'sad' });
      await say('David Lesser', 'The English stamp? Sure thing. But this is the English Department, partner. Nothing here is free. You gotta EARN it.', { ent: L, expr: 'smirk' });
      await say('David Lesser', 'Welcome to WORD WIZARDS! Five questions. Get four right and the stamp is yours.', { ent: L, expr: 'joy' });
      await say('Paper-Clip Cat', 'I will also play. For the stamp. Which I want for… normal student reasons.', { ent: NPC.quizcat, expr: 'happy' });
      await say('David Lesser', 'The more the merrier! …Is that a cat? Huh. Y’all are a diverse group this semester.', { ent: L, expr: 'think' });
    }
    const go = await WD.choose('David Lesser', 'Y’all fixin’ to play?', ['Let’s play!', 'Not yet'], { ent: L });
    if(go) return;
    WD.MUS.play('quiz'); let right = 0;
    for(let i = 0; i < QUIZ.length; i++){
      const [q, opts, ans] = QUIZ[i];
      const pick = await WD.choose('David Lesser', `Question ${i + 1}: ${q}`, opts, { ent: L, expr: 'happy' });
      if(pick === ans){ right++; WD.sfx('nice'); WD.emote(W.player, 'note'); await say('David Lesser', ['Ding ding ding! That’s right!', 'Well alright now! Correct!', 'Yes ma’am! Yes sir! Correct!', 'Correct! Smart as a whip!', 'Nailed it!'][i], { ent: L, expr: 'joy' }); }
      else { WD.sfx('miss'); await say('David Lesser', `Ooh, not quite. It’s “${opts[ans]}.” Bless your heart.`, { ent: L, expr: 'worried' }); }
      if(i === 2 && NPC.quizcat) await say('Paper-Clip Cat', i === 2 ? '…“Meese.” Final answer. Meese.' : '', { ent: NPC.quizcat, expr: 'happy' });
    }
    if(right < 4){ await say('David Lesser', `${right} out of 5. So close! Practice makes perfect. Come on back and try again, y’hear?`, { ent: L, expr: 'happy' }); return; }
    WD.sfx('cheer'); WD.shake(3);
    await say('David Lesser', `${right} out of 5! We have a WORD WIZARD! The English stamp is all yours.`, { ent: L, expr: 'joy' });
    S('stamp_eng'); await WD.itemGet('stamp', 'The English Department Stamp', 'Spelled with ONE G. Stamp ' + stamps() + ' of 3.', 'Stamp');
    await say('David Lesser', 'And a prize for the champion. The Honor Roll Pin.', { ent: L, expr: 'happy' });
    await pinGet('honor');
    if(!F('c1_quizcat') && NPC.quizcat){
      const k = NPC.quizcat; WD.emote(k, 'anger'); WD.sfx('hiss');
      await say('Paper-Clip Cat', 'NO! The Client needed that stamp! I mean… I failed the class. HISSSS!', { ent: k, expr: 'angry' });
      await say('David Lesser', 'Well, that’s a first. Go on then, champ. Show him how we do it in English 101.', { ent: L, expr: 'surprised' });
      const res = await WD.battle({ foes: ['clipcat'], back: 'hall', crowdCap: MAR });
      if(res === 'win'){ S('c1_quizcat'); W.npcs = W.npcs.filter(e => e !== k); NPC.quizcat = null; WD.mode = 'cutscene'; WD.showControls(false); WD.letter = 1; await say('David Lesser', 'And he’s outta here! Class dismissed for that one.', { ent: L, expr: 'joy' }); }
    }
    WD.MUS.play('quiz'); WD.updateGoal(); WD.saveNow();
  });
}

/* ================= AREA: Media room (Marcela's photo hunt) ================= */
WD.defineArea('uic_media', {
  ch: 1, name: 'Media Room', sub: 'United International College', music: 'office', light: 'indoor', minX: 80, maxX: 680, laneTop: 46, laneBot: 92, camMin: -70, camMax: 760, camZ: .92, battleBack: 'hall',
  npcs(){ NPC.marcela = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Marcela, name: 'Marcela', x: 420, y: 56, dir: -1, light: 'indoor', talkTo: talkMarcela }); return [NPC.marcela]; },
  drawBack(t){
    const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C9B48E'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1); room(c, t, { w: 860, wall: '#F4ECE6', band: '#8E5E7A' });
    door(c, 30, 'HALL', { col: '#8E5E7A' });
    for(let i = 0; i < 14; i++){ const x = 140 + (i % 7) * 34, y = -200 + Math.floor(i / 7) * 46; c.save(); c.translate(x, y); c.rotate(((i * 37) % 10 - 5) * .02); c.fillStyle = '#FFFDF6'; c.fillRect(-13, -14, 26, 30); c.fillStyle = ['#86B8EC', '#E8593C', '#7FB548', '#F2C14E', '#B39CE0'][i % 5]; c.fillRect(-11, -12, 22, 20); c.restore(); }
    c.strokeStyle = '#5B4A3A'; c.lineWidth = .8; c.beginPath(); c.moveTo(120, -214); c.lineTo(380, -214); c.moveTo(120, -168); c.lineTo(380, -168); c.stroke();
    c.fillStyle = '#2E2E36'; rr(c, 470, -110, 60, 40, 3); c.fill(); rr(c, 540, -104, 50, 34, 3); c.fill(); c.fillStyle = '#E8C3D6'; c.fillRect(474, -106, 52, 32); c.fillStyle = '#9FC4E4'; c.fillRect(544, -100, 42, 26); c.fillStyle = '#8A5A36'; rr(c, 450, -66, 170, 10, 2); c.fill(); c.fillRect(460, -56, 6, 76); c.fillRect(604, -56, 6, 76);
    c.strokeStyle = '#3A3A40'; c.lineWidth = 2; c.beginPath(); c.moveTo(300, 20); c.lineTo(300, -90); c.stroke(); c.strokeStyle = '#FFFBEF'; c.lineWidth = 6; c.beginPath(); c.arc(300, -110, 22, 0, 7); c.stroke(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,250,230,.12)'; c.beginPath(); c.arc(300, -110, 70, 0, 7); c.fill(); c.restore();
    c.fillStyle = '#E8593C'; ell(c, 650, 6, 30, 16); c.fill(); c.fillStyle = '#F07A5C'; ell(c, 648, 0, 22, 9); c.fill();
    plant(c, 700, 20);
  },
  things(){
    return [{ x: 40, y: 60, label: 'Hall', h: 130, r: 60, act: () => { WD.sfx('door'); WD.gotoArea('uic_lobby', 1020, 66, { dir: 1, from: 'uic_media' }); } },
      { x: 300, y: 50, label: 'Ring light', h: 140, act: () => WD.cut(async () => { await me('A ring light. Everyone looks good in a ring light. Even me.', { t: 'Con esta luz todos salimos divinos.', es: 'Con esta luz todos salimos divinos.' }, 'smirk'); }) }];
  }
});
function talkMarcela(){
  WD.cut(async () => {
    const M = NPC.marcela, n = SHOTS.filter(s => F('shot_' + s.id)).length;
    if(F('stamp_media')){ await say('Marcela', 'That gym photo is going on the wall. Moody. Mysterious. Slightly criminal. Iconic.', { ent: M, expr: 'joy' }); return; }
    if(!F('c1_camera')){
      await say('Marcela', D() ? 'David! Wait, don’t move. The light on you right now… Okay. Sorry. Laura told me. I’m so sorry.' : 'Laura! Wait, don’t move. The light on your face… Okay. Sorry. They told me. I’m so sorry.', { ent: M, es: D() ? null : '¡Laura! Espera, no te muevas. La luz en tu cara… Okay. Perdón. Me contaron. Lo siento mucho.', expr: 'sad' });
      await say('Marcela', 'The Media stamp? Of course. But I need a favor first. Our new campus post is due, and my legs hurt from the stairs.', { ent: M, expr: 'smirk' });
      await say('Marcela', 'Take my camera and get me four shots: the eagle ray statue, the old gym doors, the front desk, and the GO RAYS banner.', { ent: M, expr: 'happy' });
      await say('Marcela', 'Make it cinematic. Make it feel something. Or just point and tap. Both are fine.', { ent: M, expr: 'joy' });
      S('c1_camera'); WD.giveKey('camera'); await WD.itemGet('camera', 'Marcela’s Camera', 'Find the sparkles and press A to snap: statue, gym doors, front desk, banner.', 'Key item');
      WD.updateGoal(); WD.saveNow(); return;
    }
    if(n < SHOTS.length){ await say('Marcela', `${n} of ${SHOTS.length}. ${SHOTS.filter(s => !F('shot_' + s.id)).map(s => s.name).join(', ')}. Go go go!`, { ent: M, expr: 'happy' }); return; }
    await say('Marcela', 'Let me see… Statue: gorgeous. Desk: cozy. Banner: very Go Rays. And the gym doors… wait. Zoom in.', { ent: M, expr: 'think' });
    WD.sfx('clue'); await WD.itemGet('gymphoto', 'Marcela’s Photo', 'Two Cat Agents sneaking into the chained old gym, carrying a graduation cap. And in the corner… something long and black-and-white?', 'Clue');
    clue('gymphoto');
    await say('Marcela', 'Cats. In suits. Going into the OLD GYM. With a mortarboard. That is the most interesting photo anyone has ever taken here.', { ent: M, expr: 'surprised' });
    if(W.partner && WD.G.partner === 'alejandro'){ WD.emote(W.partner, 'sweat', 2); W.partner.nervous = true; await alejandro('And that, um, in the corner? That’s a hot dog. Somebody dropped a hot dog. Ha! Classic campus.', 'surprised'); W.partner.nervous = false; }
    else if(WD.G.party.alejandro){ await me('Is that a… long tail? In the corner?', '¿Y eso en la esquina? ¿Una cola larguísima?', 'think'); await say('Marcela', 'Probably a hot dog. People drop hot dogs.', { ent: M, expr: 'smirk' }); }
    await say('Marcela', 'Here. The Media stamp. And this, because you have an eye. The Eagle Ray Pin.', { ent: M, expr: 'joy' });
    S('stamp_media'); WD.G.key = WD.G.key.filter(k => k !== 'camera');
    await WD.itemGet('stamp', 'The Media Office Stamp', 'A real camera. Not in crayon. Stamp ' + stamps() + ' of 3.', 'Stamp');
    await pinGet('eagle');
    WD.updateGoal(); WD.saveNow();
  });
}

/* ================= AREA: President Lydia ================= */
const KEYSPOTS = [['drawer', 330, 'Desk drawer'], ['shelf', 160, 'Bookshelf'], ['coat', 620, 'Coat rack']];
WD.defineArea('uic_lydia', {
  ch: 1, name: 'President’s Office', sub: 'United International College', music: 'office', light: 'indoor', minX: 80, maxX: 680, laneTop: 46, laneBot: 92, camMin: -70, camMax: 760, camZ: .92, battleBack: 'hall',
  npcs(){ NPC.lydia = WD.makeEnt({ kind: 'human', look: WD.LOOKS.Lydia, name: 'Lydia', x: 400, y: 50, dir: -1, light: 'indoor', talkTo: talkLydia }); return [NPC.lydia]; },
  drawBack(t){
    const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#C9B48E'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1); room(c, t, { w: 860, wall: '#EFE3D2', band: '#6E5030', wood: true, floor: '#B98E5E' });
    door(c, 30, 'HALL', { col: '#6E5030' });
    c.fillStyle = '#6E5030'; c.fillRect(110, -200, 110, 220); for(let r = 0; r < 5; r++){ c.fillStyle = '#5B4028'; c.fillRect(114, -190 + r * 42, 102, 4); for(let b = 0; b < 9; b++){ c.fillStyle = ['#7A1F2B', '#3E6FB5', '#E8B84A', '#4F8E43', '#C9A15A'][(b + r) % 5]; c.fillRect(118 + b * 11, -222 + r * 42 + 30 - (b % 3) * 3, 9, 26 + (b % 3) * 3); } }
    c.fillStyle = '#B9D6EA'; c.fillRect(290, -190, 120, 90); c.strokeStyle = '#C29C6E'; c.lineWidth = 5; c.strokeRect(290, -190, 120, 90); WD.drawPalm(c, 330, -100, 70, .1, t, 3, WD.PALMCOL, false);
    c.fillStyle = '#5B4A3A'; c.fillRect(440, -170, 40, 50); c.fillStyle = '#FFFDF6'; c.fillRect(443, -167, 34, 44); drawLogo(c, 460, -148, .6); c.fillStyle = '#5B4A3A'; c.font = '800 4px Nunito, system-ui'; c.textAlign = 'center'; c.fillText('PRESIDENT', 460, -130);
    [[500, '#F2C14E', '#3E6FB5', '#C2453A']].forEach(([x, a, b, d]) => { c.fillStyle = '#9AA0A6'; c.fillRect(x - 1, -150, 2, 40); c.fillStyle = a; c.fillRect(x + 1, -150, 22, 7); c.fillStyle = b; c.fillRect(x + 1, -143, 22, 4); c.fillStyle = d; c.fillRect(x + 1, -139, 22, 4); });
    c.fillStyle = '#7A5234'; rr(c, 300, -34, 180, 14, 3); c.fill(); c.fillStyle = '#5B4028'; c.fillRect(306, -20, 168, 40); c.fillStyle = GOLD; rr(c, 360, -50, 60, 12, 2); c.fill(); c.fillStyle = '#5B4028'; c.font = '900 6px Grandstander, system-ui'; c.fillText('LYDIA', 390, -42);
    c.fillStyle = '#FFFDF6'; c.save(); c.translate(320, -40); c.fillRect(-8, -12, 16, 12); c.restore(); c.fillStyle = '#E86F79'; c.beginPath(); c.arc(456, -42, 4, 0, 7); c.fill(); c.fillStyle = '#4F8E43'; c.fillRect(455, -38, 2, 6);
    c.fillStyle = '#6E5030'; c.fillRect(618, -150, 4, 170); c.fillRect(600, 16, 40, 4); c.fillStyle = '#7A3E6B'; c.beginPath(); c.moveTo(620, -140); c.lineTo(600, -60); c.lineTo(640, -60); c.closePath(); c.fill(); c.fillStyle = '#E86F79'; c.beginPath(); c.arc(626, -142, 7, 0, 7); c.fill();
    const fx = 540 + (F('lyd_push') ? -70 : 0) * Math.min(1, (WD.time - (LYD.pushT || 0)) * 2);
    c.fillStyle = '#7A5234'; rr(c, fx - 26, -70, 52, 90, 3); c.fill(); c.fillStyle = '#8E6440'; c.fillRect(fx - 22, -64, 44, 38); c.fillRect(fx - 22, -22, 44, 38); c.fillStyle = GOLD; c.fillRect(fx - 3, -30, 6, 3); c.fillRect(fx - 3, 12, 6, 3);
    if(F('lyd_push') && !F('toy_frisbee')) drawToy1(c, 'frisbee', 548, 10, 1.2);
    plant(c, 700, 20);
  },
  things(){
    const L = [{ x: 40, y: 60, label: 'Hall', h: 130, r: 60, act: () => { WD.sfx('door'); WD.gotoArea('uic_lobby', 1220, 66, { dir: 1, from: 'uic_lydia' }); } }];
    if(F('c1_chunkers') && !F('lyd_push')) L.push({ x: 540, y: 56, skill: 'p', who: 'chunkers', label: 'Push', h: 100, act: () => WD.cut(async () => { const a = W.partner; a.pinned = true; await WD.walkTo(a, 580, 60, 80); a.dir = -1; await chunkers('Hnngh.', 'determined'); LYD.pushT = WD.time; S('lyd_push'); WD.sfx('step'); WD.shake(3); await WD.walkTo(a, 520, 60, 40); a.pinned = false; await chunkers('Toy! Behind box! Chunkers smell it.', 'joy'); }) });
    if(F('lyd_push') && !F('toy_frisbee')) L.push({ x: 548, y: 56, label: 'Disc', h: 40, sparkle: true, act: () => WD.cut(async () => { await toyGet('frisbee'); await say('Lydia', 'And what was that doing there? I don’t even own a frisbee.', { ent: NPC.lydia, es: '¿Y eso qué hacía ahí? Yo ni tengo un frisbee.', expr: 'surprised' }); }) });
    if(F('c1_forged') && !F('c1_key')) KEYSPOTS.forEach(([id, x, lab]) => { if(!F('ks_' + id)) L.push({ x, y: 50, label: lab, h: 100, sparkle: true, act: () => keySearch(id) }); });
    return L;
  }
});
const LYD = { pushT: 0 };
function talkLydia(){
  WD.cut(async () => {
    const Ly = NPC.lydia;
    if(!F('c1_lydia_met')){
      S('c1_lydia_met');
      await say('Lydia', D() ? 'David, dear. Come in, come in. Now… why did I come into this office? …Ah. I work here. Of course.' : 'Laura, dear, come in, come in. Now… why did I come into this office? …Ah. I work here. Of course.', { ent: Ly, es: D() ? 'David, mijo. Pasa, pasa. Ahora… ¿a qué entré yo a esta oficina? …Ah. Trabajo aquí. Claro.' : 'Laura, mija, pasa, pasa. Ahora… ¿a qué entré yo a esta oficina? …Ah. Trabajo aquí. Claro.', expr: 'happy' });
      await say('Lydia', 'Angelica told me about your Dayla. Qué tristeza. She came to the front desk once, ¿no? She ate my sandwich.', { ent: Ly, es: 'Angelica me contó de su Dayla. Qué tristeza. Una vez vino a la recepción, ¿no? Se comió mi sándwich.', expr: 'sad' });
      await say('Lydia', 'Here. A little something. Every good outfit needs a prendedor. A pin, mijo.', { ent: Ly, es: 'Toma. Un detallito. Todo buen vestido necesita un prendedor.', expr: 'joy' });
      if(D()) learnWord('prendedor', 'pin (the kind you wear)');
      await pinGet('pearl', true);
    }
    if(!F('c1_forged')){ await say('Lydia', 'If you need anything from me, come back. I am always here. Somewhere. Usually this office.', { ent: Ly, es: D() ? 'Si necesitas algo, vuelve, mijo. Aquí estoy siempre. En algún lado. Casi siempre en esta oficina.' : 'Si necesitas algo, vuelve, mija. Aquí estoy siempre. En algún lado. Casi siempre en esta oficina.', expr: 'happy' }); return; }
    if(!F('c1_key')){
      if(!F('c1_key_ask')){ S('c1_key_ask');
        await me('Lydia, we need the key to the old gym. The agents are in there.', { t: 'Lydia, necesitamos la llave del gimnasio viejo.', es: 'Lydia, necesitamos la llave del gimnasio viejo. Los gatos están ahí.' }, 'determined');
        await say('Lydia', 'The old gym key… I had it this morning. Or yesterday. Look around, please. My memory goes on vacation sometimes.', { ent: Ly, es: 'La llave del gimnasio… La tenía esta mañana. O ayer. Busquen por ahí, por favor. Mi memoria a veces se va de vacaciones.', expr: 'think' });
        WD.toast('Search the sparkly spots in Lydia’s office');
      } else await say('Lydia', 'The drawer? The shelf? My coat? It is somewhere, I promise.', { ent: Ly, es: '¿El cajón? ¿La repisa? ¿Mi abrigo? Está por ahí, se los prometo.', expr: 'think' });
      return;
    }
    await say('Lydia', 'Go, go. And bring her home.', { ent: Ly, es: 'Vayan, vayan. Y tráiganla a casa.', expr: 'happy' });
  });
}
async function keySearch(id){
  await WD.cut(async () => {
    S('ks_' + id); const n = KEYSPOTS.filter(([k]) => F('ks_' + k)).length;
    if(id === 'drawer') await me('Desk drawer: reading glasses, three pens, and a photo of a little dog in a sweater. No key.', { t: 'El cajón: gafas, tres lapiceros y una foto de un perrito con suéter. No hay llave.', es: 'El cajón: gafas, tres lapiceros y una foto de un perrito con suéter. No hay llave.' }, 'think');
    if(id === 'shelf') await me('Bookshelf: a Spanish dictionary, an English dictionary, and a cookbook. No key.', { t: 'La repisa: diccionarios y un libro de cocina. Nada.', es: 'La repisa: diccionarios y un libro de cocina. Nada.' }, 'think');
    if(id === 'coat') await me('Coat pocket: a mint and a bus ticket. No key.', { t: 'El abrigo: un dulce y un tiquete de bus. Nada.', es: 'El abrigo: un dulce y un tiquete de bus. Nada.' }, 'think');
    if(n < 2) return;
    const Ly = NPC.lydia; Ly.armRaise = -.8; WD.emote(Ly, '!'); WD.sfx('open');
    await say('Lydia', '¡Ay! Wait. What is this on my neck? …The key. On my lanyard. The whole time.', { ent: Ly, es: '¡Ay! Espera. ¿Qué tengo en el cuello? …La llave. En mi cordón. Todo el tiempo.', expr: 'surprised' });
    Ly.armRaise = 0;
    await say('Lydia', 'Ay, Dios. Don’t tell Angelica.', { ent: Ly, es: 'Ay, Dios. No le cuenten a Angelica.', expr: 'joy' });
    WD.giveKey('gymkey'); S('c1_key'); await WD.itemGet('gymkey', 'Old Gym Key', WD.KEYS.gymkey.desc, 'Key item');
    // the sincere moment
    WD.MUS.play('memory');
    await say('Lydia', 'Sit with me one minute, before you go.', { ent: Ly, es: 'Siéntense conmigo un minutico, antes de irse.', expr: 'happy' });
    await say('Lydia', 'Many years ago, I had to leave my country and start over here. Another language. Another life. Everything new.', { ent: Ly, es: 'Hace muchos años tuve que dejar mi país y empezar de nuevo aquí. Otro idioma. Otra vida. Todo nuevo.', expr: 'sad' });
    await say('Lydia', 'That is why I love this school so much. Every person who walks through that door is starting something new.', { ent: Ly, es: 'Por eso quiero tanto este colegio. Cada persona que entra por esa puerta está empezando algo nuevo.', expr: 'happy' });
    await say('Lydia', 'Your Dayla is far from home right now too. But she knows who loves her. And you are going to find her.', { ent: Ly, es: 'Su Dayla también está lejos de casa ahora. Pero ella sabe quién la quiere. Y ustedes la van a encontrar.', expr: 'determined' });
    await me('Thank you, Lydia. Really.', { t: 'Gracias, Lydia. De verdad.', es: 'Gracias, Lydia. De verdad.' }, 'happy');
    WD.MUS.play('office'); WD.updateGoal(); WD.saveNow();
  });
}

/* ================= AREA: the old gym (dungeon) ================= */
const GYM = { sit: false, bleachU: 0, gateU: 0 };
const G_BLEACH = 600, G_PLATE = 940, G_GATE = 1010, G_LEVER = 1090, G_DOOR = 1500;
WD.defineArea('uic_gym', {
  ch: 1, name: 'The Old Gym', sub: 'Home of the Eagle Rays', music: 'gym', light: 'indoor', minX: 80, maxX: 1960, laneTop: 46, laneBot: 92, camMin: -70, camMax: 2040, camZ: .95, battleBack: 'gym',
  sniffNothing: 'Alejandro sniffs… old sneakers, floor wax, and cat. Lots of cat.',
  npcs(){ if(!F('c1_boss')){ NPC.dean = WD.makeEnt({ kind: 'cat', look: WD.CATS.dean, name: 'The Dean of Detention', x: 1820, y: 54, dir: -1, light: 'indoor' }); return [NPC.dean]; } NPC.dean = null; return []; },
  foes(){
    const mk = (id, type, x, y, patrol, party) => Object.assign(WD.makeEnt({ kind: WD.FOES[type].kind, look: WD.FOES[type].look ? WD.CATS[WD.FOES[type].look] : null, name: WD.FOES[type].name, x, y, dir: -1, light: 'indoor' }), { fid: id, party, patrol });
    return [mk('c1_g1', 'stapler', 340, 70, [260, 440], ['stapler']), mk('c1_g2', 'bat', 500, 54, [460, 570], ['bat', 'bat']),
      mk('c1_g3', 'clipcat', 820, 64, [700, 900], ['stapler', 'clipcat']), mk('c1_g4', 'monitor', 1250, 62, [1150, 1380], ['monitor', 'bat'])].filter(x => !F('beat_' + x.fid));
  },
  limit(nx, px){
    if(!F('g_bleach') && px <= G_BLEACH) return Math.min(nx, G_BLEACH - 16);
    if(!F('g_gate') && !GYM.sit && px <= G_GATE) return Math.min(nx, G_GATE - 16);
    if(!F('g_power') && px <= G_DOOR) return Math.min(nx, G_DOOR - 16);
    return nx;
  },
  drawBack(t){
    const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#3A2E28'; c.fillRect(0, 0, WD.cv.width, WD.cv.height);
    WD.setLayer(1);
    c.fillStyle = '#9C8C80'; c.fillRect(-90, -260, 2200, 282);
    c.strokeStyle = 'rgba(60,40,30,.16)'; c.lineWidth = 1; for(let y = -250; y < 20; y += 10){ c.beginPath(); c.moveTo(-90, y); c.lineTo(2110, y); c.stroke(); }
    c.fillStyle = 'rgba(122,31,43,.7)'; c.fillRect(-90, -200, 2200, 18); c.fillStyle = 'rgba(255,248,236,.7)'; c.font = '900 11px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; for(let x = 200; x < 2000; x += 600) c.fillText('HOME OF THE EAGLE RAYS', x, -190.5);
    for(let x = 140; x < 2000; x += 300){ c.fillStyle = '#C9C2B5'; c.fillRect(x - 24, -250, 48, 30); c.fillStyle = 'rgba(255,240,200,.6)'; c.fillRect(x - 20, -246, 40, 22); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,230,170,.05)'; c.beginPath(); c.moveTo(x - 20, -224); c.lineTo(x + 20, -224); c.lineTo(x + 80, 20); c.lineTo(x - 80, 20); c.fill(); c.restore(); }
    const fg = c.createLinearGradient(0, 20, 0, 220); fg.addColorStop(0, '#C98E52'); fg.addColorStop(1, '#8E5A2E'); c.fillStyle = fg; c.fillRect(-90, 20, 2200, 420);
    c.strokeStyle = 'rgba(80,40,18,.25)'; c.lineWidth = .8; for(let y = 28; y < 420; y += 8 + (y - 20) * .06){ c.beginPath(); c.moveTo(-90, y); c.lineTo(2110, y); c.stroke(); }
    c.strokeStyle = 'rgba(255,248,236,.55)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-90, 34); c.lineTo(2110, 34); c.stroke(); c.beginPath(); c.ellipse(1760, 66, 70, 18, 0, 0, 7); c.stroke();
    c.fillStyle = '#FFF8EC'; c.fillRect(-90, 14, 2200, 7);
    door(c, 30, 'EXIT', { col: '#5E3A30' });
    // bleachers (the first block is pulled out across the floor until Chunkers pushes it)
    for(let i = 0; i < 5; i++){ c.fillStyle = i % 2 ? '#B5753F' : '#C98E52'; c.fillRect(160, -110 + i * 26, 400, 22); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(160, -88 + i * 26, 400, 4); }
    GYM.bleachU = lerp(GYM.bleachU, F('g_bleach') ? 1 : 0, .08);
    const bx = G_BLEACH - GYM.bleachU * 110;
    if(GYM.bleachU < .98){ c.save(); c.globalAlpha = 1; for(let i = 0; i < 4; i++){ c.fillStyle = i % 2 ? '#A86A38' : '#BC8048'; c.fillRect(bx - 20, -40 + i * 22, 40 + i * 10, 18); } c.fillStyle = '#5E3A20'; c.fillRect(bx - 22, 40, 64, 30); c.fillStyle = '#3A3A40'; [bx - 14, bx + 34].forEach(wx => { c.beginPath(); c.arc(wx, 72, 4, 0, 7); c.fill(); }); c.restore(); }
    else { c.fillStyle = '#A86A38'; c.fillRect(bx - 20, -40, 40, 60); }
    // hoop with a pig stuck on the rim (David)
    WD.drawHoop(c, 880, 20, 1.05);
    if(D() && !F('toy_pig')) drawToy1(c, 'pig', 910, -100, .9);
    // gym divider gate + pressure plate
    c.fillStyle = GYM.sit ? '#7FB548' : '#B9BCC2'; rr(c, G_PLATE - 20, 60, 40, 9, 3); c.fill();
    GYM.gateU = lerp(GYM.gateU, (F('g_gate') || GYM.sit) ? 1 : 0, .1);
    c.save(); c.translate(0, -GYM.gateU * 170); c.fillStyle = '#4A5A6E'; c.fillRect(G_GATE - 8, -160, 16, 200); c.strokeStyle = 'rgba(255,255,255,.2)'; for(let y = -150; y < 40; y += 12){ c.beginPath(); c.moveTo(G_GATE - 8, y); c.lineTo(G_GATE + 8, y); c.stroke(); } c.restore();
    c.fillStyle = '#6E7681'; c.fillRect(G_GATE - 12, -176, 24, 10);
    c.fillStyle = '#5B4A3A'; rr(c, G_LEVER - 8, -50, 16, 30, 2); c.fill(); c.save(); c.translate(G_LEVER, -36); c.rotate(F('g_gate') ? .7 : -.7); c.fillStyle = '#C2453A'; c.fillRect(-1.5, -18, 3, 18); c.beginPath(); c.arc(0, -18, 3.5, 0, 7); c.fill(); c.restore();
    // locker hall (dark)
    for(let x = 1160; x < 1480; x += 26){ c.fillStyle = (x / 26) % 2 < 1 ? '#5E7A8E' : '#56708A'; c.fillRect(x, -120, 24, 140); c.fillStyle = 'rgba(0,0,0,.25)'; for(let s = 0; s < 3; s++) c.fillRect(x + 6, -110 + s * 5, 12, 2); c.fillStyle = '#C9CCCF'; c.fillRect(x + 18, -60, 3, 8); }
    c.fillStyle = '#9AA0A6'; rr(c, 1400, -150, 34, 28, 2); c.fill(); c.fillStyle = F('g_power') ? '#7FB548' : '#C2453A'; c.beginPath(); c.arc(1417, -136, 4, 0, 7); c.fill();
    if(!F('verse_ps121')){ c.fillStyle = 'rgba(255,222,120,.6)'; c.fillRect(1318, -134, 6, 10); }
    // stage doors to the main court
    c.fillStyle = '#5E3A30'; c.fillRect(G_DOOR - 40, -140, 80, 160); c.fillStyle = F('g_power') ? '#1E1620' : '#7A5244'; c.fillRect(G_DOOR - 36, -136, 72, 156);
    c.fillStyle = F('g_power') ? '#7FB548' : '#C2453A'; c.fillRect(G_DOOR - 20, -156, 40, 10);
    // main court stage
    c.fillStyle = '#2E2E36'; c.fillRect(1640, -220, 360, 150); c.fillStyle = '#FBFBF8'; c.font = '900 22px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('DETENTION', 1820, -160); c.font = '800 10px Nunito, system-ui'; c.fillStyle = '#E8B84A'; c.fillText('by order of THE DEAN', 1820, -132);
    c.fillStyle = '#5B4028'; rr(c, 1780, -40, 80, 60, 3); c.fill(); c.fillStyle = MAR; c.fillRect(1780, -46, 80, 8);
    WD.drawHoop(c, 1990, 20, 1.05);
    if(!F('c1_boss')){ c.fillStyle = '#C9A15A'; ell(c, 1700, 40, 22, 6); c.fill(); }
    // darkness over the lockers until the power is back
    if(!F('g_power')){ c.fillStyle = 'rgba(15,10,25,.55)'; c.fillRect(1140, -260, 400, 480); }
  },
  drawGround(t){
    const c = WD.ctx;
    if(!D() && !F('toy_pig') && F('g_bleach') && F('pig_lit')) drawToy1(c, 'pig', 760, 40, 1);
  },
  things(){
    const L = [];
    L.push({ x: 40, y: 60, label: 'Exit', h: 130, r: 60, act: () => { WD.sfx('door'); WD.gotoArea('uic_front', 1760, 56, { dir: -1, from: 'uic_gym' }); } });
    if(!F('g_bleach')){ L.push({ x: G_BLEACH - 30, y: 60, label: 'Bleachers', h: 110, act: () => WD.cut(async () => { await me('A whole section of bleachers pulled out across the floor. Way too heavy for me.', { t: 'Las gradas bloquean todo. Pesan una tonelada.', es: 'Las gradas bloquean todo. Pesan una tonelada.' }, 'think'); }) }); L.push({ x: G_BLEACH - 30, y: 60, skill: 'p', who: 'chunkers', label: 'Push', h: 110, act: pushBleachers }); }
    if(D() && !F('toy_pig') && F('g_bleach')) L.push({ x: 860, y: 56, skill: 'b', label: 'Dunk!', h: 120, act: dunkPig });
    if(!D() && !F('toy_pig') && F('g_bleach')){ if(!F('pig_lit')) L.push({ x: 760, y: 56, skill: 'b', label: 'Light', h: 70, act: () => WD.cut(async () => { W.flash = .9; WD.sfx('light'); await WD.wait(500); S('pig_lit'); WD.emote(W.player, '!'); await me('', { t: 'Under the bleachers… ¡un cerdito! Dayla’s squeaky pig!', es: 'Debajo de las gradas… ¡un cerdito! ¡El cerdito de Dayla!' }, 'surprised'); }) }); else L.push({ x: 760, y: 56, label: 'Grab it', h: 50, sparkle: true, act: () => WD.cut(async () => { await toyGet('pig'); }) }); }
    if(F('g_bleach') && !F('g_gate')){
      if(!GYM.sit){ L.push({ x: G_GATE - 40, y: 60, label: 'Divider', h: 150, act: () => WD.cut(async () => { await me('A gym divider, rolled down. It’s wired to that floor plate. Something heavy has to hold it.', { t: 'La división está conectada a esa placa. Necesita peso.', es: 'La división está conectada a esa placa. Necesita algo pesado encima.' }, 'think'); }) }); L.push({ x: G_PLATE, y: 64, skill: 'p', who: 'chunkers', label: 'Sit', h: 40, act: sitGymPlate }); }
      L.push({ x: G_LEVER, y: 56, label: 'Lever', h: 70, show: () => W.player.x > G_GATE, act: pullLever });
    }
    if(F('g_gate') && !F('g_power')){
      if(D()) L.push({ x: 1417, y: 56, skill: 'b', label: 'Jump', h: 150, act: () => WD.cut(async () => { const p = W.player; W.dash = .4; WD.sfx('dash'); await WD.wait(200); WD.sfx('jump'); await WD.tween(420, u => { p.z = Math.sin(u * Math.PI) * 60; p.armRaise = -2.4 * Math.sin(u * Math.PI); }); p.armRaise = 0; WD.sfx('clang'); S('g_power'); WD.shake(4); await me('Got the breaker! Lights on!', '', 'joy'); WD.updateGoal(); }) });
      else { if(!F('g_lit')) L.push({ x: 1417, y: 56, skill: 'b', label: 'Light', h: 150, act: () => WD.cut(async () => { W.flash = .9; WD.sfx('light'); await WD.wait(500); S('g_lit'); await me('', { t: 'A breaker box, up on the wall. ¡Ahí está!', es: 'Una caja de breakers en la pared. ¡Ahí está!' }, 'surprised'); }) }); else L.push({ x: 1417, y: 56, label: 'Breaker', h: 150, sparkle: true, sy: 150, act: () => WD.cut(async () => { WD.sfx('clang'); S('g_power'); WD.shake(4); await me('', { t: '¡Click! Lights on.', es: '¡Clic! Se prendió la luz.' }, 'joy'); WD.updateGoal(); }) }); }
      L.push({ x: G_DOOR - 30, y: 60, label: 'Doors', h: 150, act: () => WD.cut(async () => { await me('Locked. Electric lock. The power for this side must be off.', { t: 'Cerrado. Sin luz no abre.', es: 'Cerrado. Sin luz no abre.' }, 'think'); }) });
    }
    if(F('g_gate') && !F('verse_ps121')) L.push({ x: 1321, y: 56, skill: 'b', label: D() ? 'Jump' : 'Light', h: 150, act: verseGet });
    if(F('c1_boss') && !F('c1_photo')) L.push({ x: 1700, y: 66, label: 'Papers', h: 30, sparkle: true, act: photoScene1 });
    return L;
  },
  update(){
    const p = W.player;
    if(WD.mode === 'explore' && !F('c1_boss') && !F('c1_boss_scene') && p.x > 1600) bossScene1();
  },
  async enter(){ GYM.sit = false; GYM.bleachU = F('g_bleach') ? 1 : 0; GYM.gateU = F('g_gate') ? 1 : 0;
    if(!F('c1_gym_in')){ S('c1_gym_in'); await WD.cut(async () => {
      await me('The old gym. Smells like old sneakers and… cat.', { t: 'El gimnasio viejo. Huele a tenis viejos y… a gato.', es: 'El gimnasio viejo. Huele a tenis viejos y… a gato.' }, 'think');
      if(WD.G.partner === 'chunkers') await chunkers('Chunkers smell little dog. Little dog was here.', 'determined');
      else await alejandro('Smells like… nothing! Nothing at all. Let’s be super careful. Maybe go slow. Very slow.', 'surprised');
      WD.updateGoal();
    }); }
  }
});
async function pushBleachers(){
  await WD.cut(async () => {
    const a = W.partner; a.pinned = true; await WD.walkTo(a, G_BLEACH - 50, 66, 80); a.dir = 1;
    await chunkers('Big box. Chunkers push big box.', 'determined'); WD.sfx('step'); S('g_bleach'); WD.shake(6); WD.sfx('clang');
    await WD.walkTo(a, G_BLEACH + 20, 66, 40); a.pinned = false; WD.emote(a, 'heart');
    await me('Bleachers: handled. Good boy.', { t: '¡Eso, Chunkers!', es: '¡Eso, Chunkers!' }, 'joy'); WD.updateGoal();
  });
}
async function sitGymPlate(){
  await WD.cut(async () => {
    const a = W.partner; a.pinned = true; await WD.walkTo(a, G_PLATE, 64, 80); a.dir = 1; a.sit = true; GYM.sit = true; WD.sfx('clang'); WD.shake(3);
    await chunkers('Sit. Stay. Chunkers best at stay.', 'happy');
    await me('The divider’s up! There’s a lever on the other side. I can lock it open.', { t: '¡Se subió! Hay una palanca al otro lado.', es: '¡Se subió! Hay una palanca al otro lado.' }, 'determined');
  });
}
async function pullLever(){
  await WD.cut(async () => {
    WD.sfx('clang'); S('g_gate'); WD.shake(3); await WD.wait(300);
    const a = CHUNK(); if(a){ a.sit = false; GYM.sit = false; await WD.walkTo(a, W.player.x - 30, W.player.y + 6, 120); a.pinned = false; WD.emote(a, 'heart'); }
    await me('Locked open. Come on, Chunkers.', { t: 'Listo. ¡Ven, Chunkers!', es: 'Listo. ¡Ven, Chunkers!' }, 'happy'); WD.updateGoal();
  });
}
async function dunkPig(){
  await WD.cut(async () => {
    const p = W.player; p.dir = 1; await WD.walkTo(p, 780, 56, 110);
    await me('Dayla’s squeaky pig. On the RIM. Okay. One dunk, coming up.', '', 'determined');
    W.dash = .6; WD.sfx('dash'); await WD.walkTo(p, 860, 56, 240); WD.sfx('jump');
    await WD.tween(520, u => { p.z = Math.sin(u * Math.PI) * 56; p.x = lerp(860, 900, u); p.armRaise = -2.6 * Math.sin(u * Math.PI); });
    p.armRaise = 0; WD.shake(6); WD.sfx('cheer');
    await toyGet('pig');
    await me('Still got it. In an abandoned gym. For a pig. Career highlight.', '', 'smirk');
  });
}
async function verseGet(){
  await WD.cut(async () => {
    const p = W.player;
    if(D()){ WD.sfx('jump'); await WD.tween(420, u => { p.z = Math.sin(u * Math.PI) * 60; }); }
    else { W.flash = .9; WD.sfx('light'); await WD.wait(500); }
    S('verse_ps121'); const G = WD.G; G.verses.push('ps121'); G.msp += 1; G.sp = Math.min(G.msp, G.sp + 1);
    const V = WD.VERSES.ps121; await WD.itemGet('verse', 'Verse Stone: ' + V.ref, D() ? V.en : V.es);
    WD.toast('Max SP +1'); WD.pingBag(); WD.saveNow();
  });
}
async function bossScene1(){
  S('c1_boss_scene');
  await WD.cut(async () => {
    const p = W.player, d = NPC.dean, a = W.partner;
    WD.MUS.stop(); WD.cam.lock = true; await WD.camTo(1760, 1.15, 1000);
    WD.sfx('clang'); WD.emote(d, '!');
    await say('The Dean of Detention', 'SILENCE! You are TARDY. Very, very tardy.', { ent: d, expr: 'angry' });
    await say('The Dean of Detention', 'I am the Dean of Detention. This gym is MY classroom now, and you are interrupting.', { ent: d, expr: 'angry' });
    await me('You forged my dog’s transfer papers. Where is she?', { t: 'Usted falsificó los papeles de mi perrita. ¿Dónde está?', es: 'Usted falsificó los papeles de mi perrita. ¿Dónde está?' }, 'angry');
    await say('The Dean of Detention', 'Forged? I prefer “creatively stamped.” The Coll— the CLIENT requires immaculate paperwork. The package has been processed.', { ent: d, expr: 'smirk' });
    if(a && WD.G.partner === 'alejandro'){ WD.emote(a, 'sweat', 2); a.nervous = true; await alejandro('The… client. Never heard of him. Again. Ha.', 'surprised'); a.nervous = false; }
    if(WD.G.partner === 'chunkers') await chunkers('Bad cat. Chunkers no like.', 'angry');
    await say('The Dean of Detention', 'And now, a lesson. You are ALL getting DETENTION!', { ent: d, expr: 'angry' });
    const res = await WD.battle({ foes: ['dean'], back: 'gym', music: 'dean', crowdCap: MAR, intro: async (B, h) => { await h.bSay('The Dean of Detention: “Class is in session. Pencils down!”', 1800); } });
    if(res !== 'win'){ S('c1_boss_scene', 0); p.x = 1520; WD.cam.lock = false; WD.MUS.play('gym'); return; }
    WD.mode = 'cutscene'; WD.showControls(false); WD.letter = 1;
    S('c1_boss');
    d.expr = 'dizzy'; d.x = 1820; d.y = 54; d.dir = -1; p.x = 1660; p.y = 66; p.dir = 1;
    WD.cam.lock = true; WD.cam.x = 1740; WD.cam.z = 1.15;
    await say('The Dean of Detention', 'Defeated… by a student… with a BULLDOG… Class… dismissed…', { ent: d, expr: 'sad' });
    await say('The Dean of Detention', 'But you’re too late! The paperwork has already been filed! Mwahaha— hurk!', { ent: d, expr: 'angry' });
    d.dir = 1; await WD.hop(d, 1900, 40, 60, 700); await WD.hop(d, 2040, 20, 80, 700);
    W.npcs = W.npcs.filter(e => e !== d); NPC.dean = null; WD.sfx('whoosh');
    await me('He dropped something. Papers… and a photo.', { t: 'Se le cayeron unos papeles. Y una foto.', es: 'Se le cayeron unos papeles. Y una foto.' }, 'surprised');
    WD.cam.lock = false; WD.MUS.play('gym'); WD.updateGoal(); WD.saveNow();
  });
}
async function photoScene1(){
  await WD.cut(async () => {
    const p = W.player, G = WD.G;
    await WD.walkTo(p, 1680, 68, 90);
    S('c1_photo'); WD.giveKey('order'); clue('bogota');
    await WD.itemGet('stamp', 'Original Transfer Order', 'The real order the agents filed. Forwarding stamp: BOGOTÁ, COLOMBIA.', 'Clue');
    if(!G.photos[1]) G.photos[1] = 'gym';
    await WD.itemGet('photo2', 'Sighting #2', 'Dayla in a tiny graduation cap on these very bleachers, eating off a stack of papers stamped BOGOTÁ.', 'Missing Dog poster');
    if(D()) await me('Bogotá? That’s where Laura’s family lives.', '', 'surprised');
    else await me('', { t: '¿Bogotá? ¡Bogotá! That’s home. That’s my family.', es: '¿Bogotá? ¡Bogotá! Es mi casa. Es mi familia.' }, 'surprised');
    if(G.partner === 'chunkers') await chunkers('Chunkers go too. Chunkers good on plane. Probably.', 'happy');
    WD.pingBag();
    await chapterEnd1();
  });
}
async function chapterEnd1(){
  const G = WD.G;
  WD.MUS.play('end');
  if(!G.learned.includes('Breakfast Focus')) G.learned.push('Breakfast Focus');
  S('c1_done'); G.chapter = Math.max(G.chapter, 2); WD.saveNow();
  G.atkB = Math.max(G.atkB || 0, 1); WD.saveNow();
  await WD.chapterComplete({ num: 'Chapter 1', title: 'The Registrar’s Riddle', bunting: ['#7A1426', '#E8B84A', '#FFF8EC', '#7A1426', '#58AEDD'], rewards: [
    { icon: 'cafe', label: 'Breakfast Focus', sub: 'Special · 3 SP: no Detention, −1 damage' },
    { partner: 'chunkers', label: 'Chunkers', sub: 'Partner · push & sit on switches' },
    { icon: 'photo2', label: 'Sighting #2', sub: 'Dayla at the old gym' },
    { icon: 'star', label: 'Attack +1', sub: 'Basic attacks hit 1 harder' },
    { icon: 'pin_eagle', label: `Pins ${(G.pins || []).length}/3`, sub: 'Wear them from the bag' },
    { icon: 'pig', label: `Toys ${WD.toyCount(1)[0]}/3`, sub: 'Dayla’s lost toys at UIC' }
  ] });
  await startInterlude();
}

/* ================= INTERLUDE: Meanwhile, Dayla… ================= */
const HOLD = { hero: null, partner: null };
async function startInterlude(){
  await WD.card(`<i class="k">Interlude</i><h2>Meanwhile, Dayla…</h2><p>Somewhere very fancy and very far from home, a Boston terrier wakes up from a nap.</p><p class="fine">You’re playing as Dayla. A to sniff and look, B to Love Attack.</p>`, [{ label: 'Play as Dayla', alt: true }]);
  HOLD.hero = W.player; HOLD.partner = W.partner;
  const d = WD.makeEnt({ kind: 'dog', name: 'Dayla', x: 160, y: 70, dir: 1 });
  W.player = d; W.partner = null; WD.asDayla = true;
  await WD.gotoArea('kennel', 160, 70, { dir: 1, from: 'ch1' });
}
async function endInterlude(){
  WD.asDayla = false; S('int1_done');
  W.player = HOLD.hero || WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.hero], name: WD.hero });
  W.partner = HOLD.partner || (WD.G.partner ? WD.makePartner() : null); if(W.partner) W.partner.follow = true;
  HOLD.hero = HOLD.partner = null;
  await WD.gotoArea('uic_front', 260, 66, { dir: 1, from: 'kennel', cut: true });
  await WD.fade(0, 500);
  await afterInterlude();
}
async function afterInterlude(){
  await WD.cut(async () => {
    WD.cam.lock = true; WD.cam.x = 360;
    await WD.narrate('(Back at UIC, by the car.)');
    if(D()){
      await WD.phone('Laura', [
        { who: 'Laura', text: 'Amor, I just talked to my mom.', es: 'Amor. Acabo de hablar con mi mamá.', expr: 'happy' },
        { who: 'Laura', text: 'If Dayla is going to Bogotá, then we’re going to Bogotá.', es: 'Si Dayla va para Bogotá, entonces nosotros vamos para Bogotá.', expr: 'determined' },
        { who: 'David', text: 'Then I guess my Spanish is about to get a lot better.', expr: 'smirk' },
        { who: 'Laura', text: '¡Por fin! Okay. Pack. And don’t forget el patico.', es: '¡Por fin! Okay. Empaca. Y no se te olvide el patico.', expr: 'joy' },
        { who: 'David', text: 'Never.', expr: 'determined' }
      ]);
      learnWord('¡Por fin!', 'Finally!');
    } else {
      await WD.phone('David', [
        { who: 'David', text: 'So… Bogotá?', expr: 'happy' },
        { who: 'Laura', text: 'Already called mi mamá. She’s ready for us.', es: 'Ya llamé a mi mamá. Nos está esperando.', expr: 'joy' },
        { who: 'David', text: 'Then we go. Dayla, Chunkers, the whole crew. I’ll pack the duck.', expr: 'determined' },
        { who: 'Laura', text: 'El patico stays with me.', es: 'El patico se queda conmigo.', expr: 'smirk' },
        { who: 'David', text: 'Fair.', expr: 'joy' }
      ]);
    }
    WD.MUS.play('campus');
    const go = await WD.card(`<i class="k">Next</i><h2>Chapter 2: Abuela’s Kitchen</h2><p>Bogotá, Colombia. Family, food, and a giant bird on a mountain.</p><p>Fly there now, or look around UIC and Tivoli Park first. The car at UIC can take you to the airport any time.</p>`, [{ label: 'Fly to Bogotá', alt: true }, { label: 'Stay a bit' }]);
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
    if(go === 0) return WD.startChapter(2);
  });
}
function drawKennel(c, t){
  c.fillStyle = '#4A2A52'; c.fillRect(-90, -260, 1100, 282);
  c.fillStyle = 'rgba(232,184,74,.12)'; for(let x = -90; x < 1010; x += 30){ c.fillRect(x, -260, 2, 282); }
  c.fillStyle = '#3A1E42'; c.fillRect(-90, -50, 1100, 70); c.fillStyle = GOLD; c.fillRect(-90, -52, 1100, 3);
  // round windows: nothing but clouds outside
  [[440, -150], [640, -150]].forEach(([x, y], i) => { c.save(); c.beginPath(); c.arc(x, y, 34, 0, 7); c.clip(); const g = c.createLinearGradient(0, y - 34, 0, y + 34); g.addColorStop(0, '#7EB0E8'); g.addColorStop(1, '#D9EAFB'); c.fillStyle = g; c.fillRect(x - 40, y - 40, 80, 80); for(let k = 0; k < 3; k++){ const cx = x - 60 + ((t * 18 + k * 50 + i * 30) % 120); WD.cloud(c, cx, y + 10 - k * 14, .35); } c.restore(); c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 34, 0, 7); c.stroke(); c.fillStyle = GOLD; [0, 1, 2, 3].forEach(a => { c.beginPath(); c.arc(x + Math.cos(a * Math.PI / 2) * 34, y + Math.sin(a * Math.PI / 2) * 34, 3, 0, 7); c.fill(); }); });
  // gold frames with "collected" things
  [[120, -170, 'trophy'], [250, -170, 'lamp'], [840, -170, 'bowl']].forEach(([x, y, k]) => { c.fillStyle = GOLD; c.fillRect(x - 34, y - 34, 68, 68); c.fillStyle = '#2E1A36'; c.fillRect(x - 28, y - 28, 56, 56);
    if(k === 'trophy'){ c.fillStyle = GOLD; c.beginPath(); c.moveTo(x - 12, y - 16); c.lineTo(x + 12, y - 16); c.quadraticCurveTo(x + 10, y + 2, x, y + 4); c.quadraticCurveTo(x - 10, y + 2, x - 12, y - 16); c.fill(); c.fillRect(x - 2, y + 4, 4, 8); c.fillRect(x - 8, y + 12, 16, 4); }
    if(k === 'lamp'){ c.fillStyle = '#E86F79'; c.beginPath(); c.moveTo(x - 10, y - 4); c.lineTo(x - 5, y - 18); c.lineTo(x + 5, y - 18); c.lineTo(x + 10, y - 4); c.fill(); c.fillStyle = GOLD; c.fillRect(x - 1.5, y - 4, 3, 18); }
    if(k === 'bowl'){ c.fillStyle = '#C9D6E6'; rr(c, x - 14, y, 28, 8, 4); c.fill(); c.fillStyle = GOLD; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('No. 1', x, y - 10); }
    c.fillStyle = GOLD; c.font = '800 5px Nunito, system-ui'; c.textAlign = 'center'; c.fillText('THE COLLECTION', x, y + 40); });
  // chandelier
  c.strokeStyle = GOLD; c.lineWidth = 1.2; c.beginPath(); c.moveTo(500, -260); c.lineTo(500, -230); c.stroke(); c.fillStyle = GOLD; ell(c, 500, -226, 26, 5); c.fill(); for(let i = 0; i < 5; i++){ const x = 476 + i * 12; c.fillStyle = '#FFF2C0'; ell(c, x, -232, 2, 3.4); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,230,170,.07)'; c.beginPath(); c.moveTo(470, -226); c.lineTo(530, -226); c.lineTo(640, 20); c.lineTo(360, 20); c.fill(); c.restore();
  // floor: plush rug
  const fg = c.createLinearGradient(0, 20, 0, 220); fg.addColorStop(0, '#6B3A52'); fg.addColorStop(1, '#4A2238'); c.fillStyle = fg; c.fillRect(-90, 20, 1100, 420);
  c.strokeStyle = 'rgba(232,184,74,.35)'; c.lineWidth = 2; ell(c, 450, 80, 300, 36); c.stroke();
  c.fillStyle = '#FFF8EC'; c.fillRect(-90, 14, 1100, 7);
  // velvet bed
  c.fillStyle = '#8E3A5E'; ell(c, 160, 40, 56, 16); c.fill(); c.fillStyle = '#B34A7A'; ell(c, 160, 36, 44, 10); c.fill(); if(!KEN.burrow){ c.fillStyle = '#E8C9A0'; c.beginPath(); c.moveTo(130, 32); c.quadraticCurveTo(160, 22, 196, 34); c.lineTo(190, 42); c.quadraticCurveTo(160, 36, 134, 40); c.fill(); }
  // the Collector's loafer
  if(!F('i_shoe')){ c.fillStyle = '#5A2E1E'; rr(c, 312, 44, 30, 10, 5); c.fill(); c.fillStyle = GOLD; c.fillRect(322, 44, 8, 2); }
  else { c.fillStyle = '#5A2E1E'; rr(c, 300, 52, 26, 8, 4); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; [304, 312, 320].forEach(x => { c.beginPath(); c.arc(x, 54, 1.4, 0, 7); c.fill(); }); }
  // food cart
  c.fillStyle = '#C9CCCF'; rr(c, 560, -40, 70, 8, 2); c.fill(); c.fillRect(564, -32, 4, 52); c.fillRect(622, -32, 4, 52); c.fillRect(560, 0, 70, 4); c.fillStyle = '#3A3A40'; [566, 624].forEach(x => { c.beginPath(); c.arc(x, 22, 3, 0, 7); c.fill(); });
  if(!F('i_food')){ c.fillStyle = '#E9E2D2'; c.beginPath(); c.arc(595, -44, 18, Math.PI, 0); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.arc(595, -63, 3, 0, 7); c.fill(); }
  else { c.fillStyle = '#FFFDF6'; ell(c, 595, -42, 18, 4); c.fill(); }
  // travel crate with a tag
  c.fillStyle = '#C9A15A'; rr(c, 720, -30, 80, 50, 4); c.fill(); c.strokeStyle = '#7A5234'; c.lineWidth = 1.2; for(let x = 734; x < 800; x += 12){ c.beginPath(); c.moveTo(x, -26); c.lineTo(x, 16); c.stroke(); }
  if(!F('i_tag')){ c.save(); c.translate(712, -18); c.rotate(Math.sin(t * 2) * .1); c.fillStyle = '#FFF8EC'; rr(c, -14, 0, 18, 12, 2); c.fill(); c.fillStyle = '#2B1D14'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BOG', -5, 6.4); c.restore(); }
  // mail slot + door
  c.fillStyle = GOLD; rr(c, 850, -70, 50, 22, 3); c.fill(); c.fillStyle = '#2B1D14'; c.fillRect(858, -62, 34, 4); c.font = '900 5px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('OUTGOING', 875, -52);
  c.fillStyle = GOLD; c.fillRect(920, -160, 76, 180); c.fillStyle = '#3A1E42'; rr(c, 926, -154, 64, 174, 2); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.arc(976, -60, 3, 0, 7); c.fill();
  c.fillStyle = '#2E2E36'; rr(c, 940, -210, 36, 26, 4); c.fill(); c.fillStyle = '#9AA0A6'; for(let i = 0; i < 4; i++) c.fillRect(946, -204 + i * 5, 24, 2);
}
const KEN = { burrow: false };
WD.defineArea('kennel', {
  ch: 'i1', name: 'The Holding Suite', sub: 'Somewhere very fancy', music: 'kennel', light: 'indoor', noSave: true, minX: 90, maxX: 900, laneTop: 50, laneBot: 92, camMin: -70, camMax: 1000, camZ: 1.0, battleBack: 'kennel',
  npcs(){
    NPC.guard = WD.makeEnt({ kind: 'cat', look: WD.CATS.agent, name: 'Cat Agent', x: 540, y: 62, dir: -1, light: 'indoor', talkTo: () => WD.cut(async () => { if(F('i_love')) await say('Cat Agent', '…So much love. I can’t get up. I don’t want to get up.', { ent: NPC.guard, expr: 'joy' }); else await say('Cat Agent', 'Back to your bed, package. Nothing to see here. Especially not that delicious breakfast cart.', { ent: NPC.guard, expr: 'smirk' }); }) });
    NPC.guard2 = WD.makeEnt({ kind: 'cat', look: WD.CATS.agent2, name: 'Cat Agent', x: 900, y: 58, dir: -1, light: 'indoor' });
    if(F('i_love')){ NPC.guard.rot = -1.4; NPC.guard.expr = 'joy'; NPC.guard.y = 76; }
    return [NPC.guard, NPC.guard2];
  },
  limit(nx, px){ if(!F('i_love') && px <= 520) return Math.min(nx, 506); return nx; },
  drawBack(t){ const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2E1A36'; c.fillRect(0, 0, WD.cv.width, WD.cv.height); WD.setLayer(1); drawKennel(c, t); },
  things(){
    const L = [];
    const dsay = text => say('Dayla', text, { ent: W.player });
    L.push({ x: 160, y: 60, label: 'Bed', h: 60, act: () => WD.cut(async () => { const p = W.player; KEN.burrow = true; p.vis = false; WD.sfx('step'); await WD.wait(900); await dsay('(Blanket Burrow. Ten out of ten. But it doesn’t smell like home. And her duck isn’t here.)'); p.vis = true; KEN.burrow = false; S('i_bed'); WD.updateGoal(); }) });
    if(!F('i_shoe')) L.push({ x: 326, y: 58, label: 'Shoe', h: 40, act: () => WD.cut(async () => { const p = W.player; p.eat = 1; WD.sfx('munch'); await WD.wait(900); WD.sfx('munch'); await WD.wait(600); p.eat = 0; S('i_shoe'); await dsay('(A shiny, expensive loafer. Dayla chews it thoroughly. It is hers now.)'); WD.updateGoal(); }) });
    L.push({ x: 440, y: 56, label: 'Window', h: 140, act: () => WD.cut(async () => { await dsay('(Clouds. Lots of clouds. Under the window. …Dayla doesn’t know what that means. She is a dog.)'); }) });
    if(!F('i_love')) L.push({ x: 540, y: 62, skill: 'b', label: 'Love Attack', h: 80, act: loveGuard });
    if(F('i_love') && !F('i_food')) L.push({ x: 595, y: 58, label: 'Cart', h: 90, sparkle: true, act: eatCart });
    if(F('i_food') && !F('i_tag')) L.push({ x: 712, y: 58, label: 'Tag', h: 70, sparkle: true, act: () => WD.cut(async () => { const p = W.player; p.eat = 1; WD.sfx('munch'); await WD.wait(700); p.eat = 0; S('i_tag'); await WD.itemGet('tag', 'A Soggy Luggage Tag', 'From a fancy travel crate: BOG. Dayla chewed it right off the handle.', 'Dayla found'); WD.updateGoal(); }) });
    if(F('i_tag') && !F('i_mail')) L.push({ x: 875, y: 60, label: 'Slot', h: 110, sparkle: true, act: mailTag });
    return L;
  },
  async enter(){ if(!F('i_start')){ S('i_start'); await WD.cut(async () => {
    const p = W.player; WD.cam.lock = true; WD.cam.x = 260; WD.cam.z = 1.1;
    await say('Dayla', '(Dayla wakes up on a velvet bed that is not hers. It smells like money. And cat.)', { ent: p });
    await say('Cat Agent', 'The package is awake. Repeat: the package is awake.', { ent: NPC.guard, expr: 'happy' });
    await say('Cat Agent', 'Copy. Keep her away from the Client’s breakfast cart. She already ate the Dean’s.', { ent: NPC.guard2, expr: 'smirk' });
    WD.cam.lock = false; WD.updateGoal();
  }); } }
});
async function loveGuard(){
  await WD.cut(async () => {
    const p = W.player, g = NPC.guard; p.happy = true; WD.sfx('bark');
    await WD.hop(p, g.x - 18, g.y, 26, 420); WD.sfx('big'); WD.shake(8); WD.emote(g, 'heart', 2);
    await WD.tween(400, u => { g.rot = -1.4 * u; g.y = lerp(62, 76, u); }); g.expr = 'joy';
    await say('Cat Agent', 'Ack! Licks! So many licks! I wasn’t trained for this. …Who’s a good girl? Is it you? It’s you.', { ent: g, expr: 'joy' });
    await say('Dayla', '(Love Attack: super effective.)', { ent: p });
    p.happy = false; S('i_love'); WD.updateGoal();
  });
}
async function eatCart(){
  await WD.cut(async () => {
    const p = W.player; await WD.walkTo(p, 575, 62, 90); p.dir = 1; p.eat = 1;
    WD.sfx('munch'); await WD.wait(700);
    await say('Cat Agent', 'HEY! That’s the Client’s breakfast! Stop! Look at me! LOOK AT ME!', { ent: NPC.guard2, expr: 'angry' });
    WD.sfx('munch'); await WD.wait(500);
    await say('Dayla', '(She has not looked up. She will not look up. Breakfast Focus.)', { ent: p });
    await say('Cat Agent', '…Unbelievable. She didn’t even flinch.', { ent: NPC.guard2, expr: 'surprised' });
    p.eat = 0; S('i_food'); WD.updateGoal();
  });
}
async function mailTag(){
  await WD.cut(async () => {
    const p = W.player; WD.sfx('jump'); await WD.hop(p, 870, 60, 30, 420); WD.sfx('door');
    S('i_mail');
    await say('Dayla', '(She drops the soggy tag through the slot marked OUTGOING. Somebody, somewhere, is going to find it.)', { ent: p });
    WD.cam.lock = true; await WD.camTo(880, 1.15, 800);
    WD.sfx('ring'); await WD.wait(500);
    await say('???', '*crackle* …Is she eating?', { expr: 'happy' });
    await say('Cat Agent', 'Sir, she ate your breakfast, sir. And your shoe.', { ent: NPC.guard2, expr: 'worried' });
    await say('???', '…Marvelous. The happiest dog in the world. Pack her up. Tomorrow, we go to Bogotá.', { expr: 'happy' });
    await say('Cat Agent', 'Yes, sir!', { ent: NPC.guard2, expr: 'determined' });
    p.eat = 1; WD.sfx('munch');
    await say('Dayla', '(Munch. She found a crumb.)', { ent: p });
    await WD.fade(1, 600); await WD.wait(300); p.eat = 0;
    await endInterlude();
  });
}

/* ================= chapter start, saves ================= */
WD.chapterStart = WD.chapterStart || {};
WD.chapterStart[1] = async function(){
  const G = WD.G;
  if(!F('c1_arrived')){
    await WD.card(`<i class="k">Chapter 1</i><h2>The Registrar’s Riddle</h2><p>United International College, Dania Beach. Somebody showed up at the front desk with “transfer papers” for Dayla.</p>`, [{ label: 'Begin', alt: true }]);
    S('c1_arrived'); G.chapter = Math.max(G.chapter || 0, 1);
  }
  await WD.gotoArea('uic_front', 200, 66, { dir: 1, from: 'car' });
};
const prevRepair = WD.repairSave;
WD.repairSave = function(G0){
  if(prevRepair) prevRepair(G0);
  const fl = G0.flags;
  if(fl.c1_boss_scene && !fl.c1_boss) fl.c1_boss_scene = 0;
  if(fl.c1_chunkers && !G0.party.chunkers){ WD.addPartner('chunkers'); }
  if(fl.c1_done) G0.atkB = Math.max(G0.atkB || 0, 1);
  if(G0.area === 'kennel' || (fl.c1_photo && !fl.int1_done)){ G0.area = 'uic_gym'; G0.x = 1700; G0.y = 66; ['i_start', 'i_bed', 'i_shoe', 'i_love', 'i_food', 'i_tag', 'i_mail'].forEach(k => { delete fl[k]; }); }
  if(G0.area === 'uic_registrar' || G0.area === 'uic_gym'){ /* partners never stay sitting across a save */ }
};
const prevAfter = WD.afterResume;
WD.afterResume = function(){
  if(prevAfter) prevAfter();
  if(F('c1_photo') && !F('int1_done')) setTimeout(() => { WD.cut(async () => { await startInterlude(); }); }, 900);
};
WD.debugCh1 = { startInterlude, endInterlude, chapterEnd1, flashback };
})();
