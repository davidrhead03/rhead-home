/* =============================================================
   Where's Dayla? — battle
   A side-view stage show: curtains, spotlights, a crowd that cheers good timing.
   Every move has an action command; tap just before a hit to Guard,
   tap perfectly to Superguard. The crowd's Hype fills your SP stars.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { clamp, lerp, ease, rr, ell, star, rng, shade, esc } = WD.U;

/* ================= enemies ================= */
WD.FOES = {
  /* move keys: dmg, w (weight), delay [min,max] ms pause before the swing, feint (chance of a fake-out first),
     rhythm [ms per shot] for uneven multi-hits, noSuper (red glow: can only be Guarded), windup (charges a turn first).
     foe keys: def (armour), twice (acts two times a turn), punish (counter-hit after an "Oops"), smart (picks targets and moves wisely), learn (boss uses what you guard worst) */
  agent: { name: 'Cat Agent', kind: 'cat', look: 'agent', hp: 5, atk: 1, xp: 14,
    moves: [{ id: 'swipe', name: 'Claw Swipe', type: 'melee', dmg: 1, w: 3, delay: [0, 260] }, { id: 'shades', name: 'Sunglasses Toss', type: 'lob', dmg: 1, w: 2, proj: 'shades' }],
    tattle: 'A Cat Agent. Works for some mysterious boss. HP 5, Attack 1. The sunglasses are for style. He can’t see a thing indoors. Sometimes he waits a beat before swiping, so watch his paw, not the clock.' },
  agent2: { name: 'Cat Agent', kind: 'cat', look: 'agent2', hp: 5, atk: 1, xp: 14,
    moves: [{ id: 'swipe', name: 'Claw Swipe', type: 'melee', dmg: 1, w: 3, delay: [0, 320] }, { id: 'hiss', name: 'Hiss', type: 'buff', w: 1 }],
    tattle: 'Another Cat Agent. HP 5, Attack 1. When he hisses, his next hit gets stronger, so Guard that one.' },
  iguana: { name: 'Sunbather Iguana', kind: 'iguana', hp: 7, atk: 1, xp: 14,
    moves: [{ id: 'whip', name: 'Tail Whip', type: 'melee', dmg: 1, w: 3, delay: [120, 520] }, { id: 'sun', name: 'Soak Up the Sun', type: 'heal', amt: 3, w: 2 }],
    tattle: 'A Sunbather Iguana. South Florida’s finest. HP 7, Attack 1. Once it’s hurt it sunbathes to heal 3, so finish it fast. Its Tail Whip is lazy and slow: wait for it.' },
  sergeant: { name: 'Sergeant Hairball', kind: 'cat', look: 'sergeant', hp: 32, atk: 2, xp: 100, boss: true, smart: true,
    moves: [{ id: 'lob', name: 'Hairball Lob', type: 'lob', dmg: 2, w: 3, proj: 'hairball' }, { id: 'slam', name: 'Belly Slam', type: 'melee', dmg: 3, w: 2, delay: [150, 600] }, { id: 'whistle', name: 'Fall In!', type: 'summon', w: 2, summon: 'agent' }],
    rage: [{ id: 'barrage', name: 'Hairball Barrage', type: 'barrage', dmg: 2, n: 3, w: 3, proj: 'hairball', rhythm: [560, 380, 720] }, { id: 'slam', name: 'Belly Slam', type: 'melee', dmg: 3, w: 2, delay: [150, 600], feint: .35 }, { id: 'drill', name: 'Drill Stomp', type: 'melee', dmg: 3, w: 2, noSuper: true, delay: [0, 300] }, { id: 'whistle', name: 'Fall In!', type: 'summon', w: 1, summon: 'agent' }],
    tattle: 'Sergeant Hairball. Runs the back lot like boot camp. HP 32, Attack 2 to 3. His Belly Slam waits a beat before landing. At half health he fires hairballs three at a time, and not evenly: ba-bap… bap. His Drill Stomp glows red, so it can only be Guarded, not Superguarded.' }
};

let B = null, cmd = null;
WD.B = () => B;
WD.curCmd = () => cmd;

/* ================= start / end ================= */
WD.battle = function(opts){
  return new Promise(resolve => {
    WD.pageTurn(() => { setup(opts, resolve); }).then(() => { run(); });
  });
};
function setup(opts, resolve){
  const G = WD.G, v = WD.view;
  WD.hideTalk && WD.hideTalk();
  WD.showControls(false); WD.showGoal(false); WD.letter = 0;
  const k0 = Math.min(v.h / 300, v.w / 330), Wb = Math.min(175, v.w / k0 / 2 - 34);
  const p = WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.hero], name: WD.hero, y: 0, dir: 1, flip: 1, light: 'day' });
  const P = G.partner ? G.party[G.partner] : null;
  const PD = P ? WD.partnerDef() : null;
  const a = P ? WD.makeEnt({ kind: PD.kind, name: PD.name, y: 7, dir: 1, flip: 1, light: 'day' }) : null;
  const home = { p: a ? -Wb * .7 : -Wb * .55, a: -Wb * .34 };
  p.x = home.p; if(a){ a.x = home.a; if(P.hp <= 0){ a.rot = -1.4; a.nervous = true; } }
  B = { opts, resolve, home, Wb, p, a, foes: [], fx: [], texts: [], crowd: [], cheer: 0, curtain: 0, t: 0, shake: 0, over: false, fam: false, atkUp: 0, proj: [], call: null, tipped: {}, detain: { p: 0, a: 0 }, goodBoy: 0, focusT: 0, gstat: {}, streak: 0, earlies: 0 };
  opts.foes.forEach(id => addFoe(id));
  B.foes.forEach(f => { f.e.x = f.home; });
  const R4 = rng(5); for(let i = 0; i < 22; i++) B.crowd.push({ x: -1 + i / 21 * 2, c: ['#3E4A6B', '#7A3E52', '#4F6B3E', '#6B4A2E', '#2F4F5E', '#5E3E6B', '#8A5A3A'][i % 7], h: .8 + R4() * .4, p: R4() * 6, cap: opts.crowdCap && i === 4 ? opts.crowdCap : null });
  buildHud();
  WD.MUS.play(opts.music || (B.foes.some(f => f.def.boss) ? 'boss' : 'battle'));
  WD.setScene(SCENE, 'battle');
}
function addFoe(id, entering){
  const def = WD.FOES[id], n = B.foes.length;
  const e = WD.makeEnt({ kind: def.kind, look: def.look ? WD.CATS[def.look] : null, name: def.name, dir: -1, flip: -1, light: 'day' });
  const f = { id, def, e, hp: def.hp, max: def.hp, dizzy: 0, pow: 0, alive: true, idx: n, air: !!def.air };
  B.foes.push(f); layoutFoes();
  if(entering){ e.x = B.Wb + 120; }
  else e.x = f.home;
  return f;
}
function layoutFoes(){
  const live = B.foes.filter(f => f.alive), n = live.length, Wb = B.Wb;
  const slots = n === 1 ? [.62] : n === 2 ? [.46, .82] : [.36, .62, .88];
  live.forEach((f, i) => { f.home = Wb * slots[i]; f.e.y = n > 1 ? (i % 2 ? 8 : -2) : 2; });
}
function buildHud(){
  const h = WD.$('.wd-bhud'), G = WD.G, P = G.partner ? G.party[G.partner] : null;
  h.innerHTML = `<div class="wd-hpcol"><div class="wd-hp" data-hp="p"><b>${esc(WD.hero)}</b><div class="bar"><i></i></div><small></small></div>${P ? `<div class="wd-hp" data-hp="a"><b>${esc(WD.partnerDef().name)}</b><div class="bar"><i></i></div><small></small></div>` : ''}</div><div class="wd-hype"></div><div class="wd-hpcol foes"></div>`;
  h.hidden = false; updHud();
}
function updHud(){
  if(!B) return; const G = WD.G, h = WD.$('.wd-bhud'), P = G.partner ? G.party[G.partner] : null;
  const set = (el, v, m) => { if(!el) return; el.querySelector('.bar i').style.width = Math.max(0, v / m * 100) + '%'; el.querySelector('small').textContent = `${Math.max(0, v)} / ${m}`; el.classList.toggle('ko', v <= 0); };
  set(h.querySelector('[data-hp=p]'), G.hp, G.mhp); if(P) set(h.querySelector('[data-hp=a]'), P.hp, P.mhp);
  const fc = h.querySelector('.foes'); const live = B.foes.filter(f => f.alive);
  if(fc.children.length !== live.length || [...fc.children].some((c, i) => c.dataset.id !== String(live[i].idx))) fc.innerHTML = live.map(f => `<div class="wd-hp foe" data-id="${f.idx}"><b>${esc(f.def.name)}</b><div class="bar"><i></i></div><small></small></div>`).join('');
  live.forEach(f => set(fc.querySelector(`[data-id="${f.idx}"]`), f.hp, f.max));
  h.querySelector('.wd-hype').innerHTML = '★'.repeat(G.sp) + '☆'.repeat(Math.max(0, G.msp - G.sp)) + '<small>HYPE · SP</small>';
}

/* ================= little effects ================= */
function addText(x, y, s, col, big){ B.texts.push({ x, y, s, col, big, t: 0 }); }
function burst(x, y, n, cols){ for(let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90; B.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, t: .7 + Math.random() * .5, c: cols[i % cols.length], s: 2 + Math.random() * 2.5, star: i % 3 === 0 }); } }
function cheer(n){ B.cheer = Math.max(B.cheer, n); WD.sfx('cheer'); }
function hype(n){ const G = WD.G; G.sp = clamp(G.sp + n, 0, G.msp); updHud(); }
const tw = (e, props, ms, arc) => { const from = {}; Object.keys(props).forEach(k => from[k] = e[k]); return WD.tween(ms, u => { const q = ease(u); Object.keys(props).forEach(k => e[k] = lerp(from[k], props[k], q)); if(arc) e.z = Math.sin(u * Math.PI) * arc; }).then(() => { if(arc) e.z = 0; }); };
function rating(q, x){ x = x === undefined ? -40 : x; const bonus = q && WD.hasPin('honor') ? 1 : 0; if(q === 2){ addText(x, -120, 'PERFECT!', '#FFC94A', 'huge'); WD.sfx('perfect'); cheer(2); hype(2 + bonus); } else if(q === 1){ addText(x, -120, 'NICE!', '#7CD86A', 'huge'); WD.sfx('nice'); cheer(1); hype(1 + bonus); } else { WD.sfx('miss'); addText(x, -120, 'Oops', '#B9BCC2', 'huge'); } }
async function hitFoe(f, n, opts){
  opts = opts || {};
  if(!f || !f.alive) return;
  const raw = n + (opts.noBuff ? 0 : (B.atkUp > 0 ? 1 : 0));
  n = Math.max(0, raw - (opts.pierce ? 0 : (f.def.def || 0) + (f.brace || 0)));
  if(!n && raw > 0){ WD.sfx('guard'); addText(f.e.x, -60 - WD.headOf(f.e) * .5, 'Blocked!', '#B9BCC2', true); await WD.wait(240); return; }
  f.hp -= n; f.e.hurt = .35; f.e.rot = -.15 * f.e.flip; WD.sfx(n >= 4 ? 'big' : 'hit'); B.shake = n >= 4 ? 10 : 7;
  addText(f.e.x, -60 - WD.headOf(f.e) * .5, '-' + n, '#E8593C', true); burst(f.e.x - 10, -30, 12, ['#FFC94A', '#FFF8EC', '#E8593C']); updHud();
  await WD.wait(240); f.e.rot = 0;
  if(B.snatched && f.id === 'condor' && (B.snatched.hp - f.hp >= 6 || !f.air || f.hp <= 0)){ B.snatched = null; if(B.a){ B.a.nervous = false; B.a.z = 0; B.a.rot = 0; B.a.x = B.home.a; addText(B.a.x, -90, 'Free!', '#7CD86A', true); WD.sfx('heal'); } }
  if(f.hp <= 0) await foeDown(f);
}
async function foeDown(f){
  f.alive = false; f.hp = 0; WD.sfx('whoosh'); burst(f.e.x, -30, 22, ['#FFC94A', '#E8593C', '#FFF8EC']);
  addText(f.e.x, -90, 'Out!', '#FFF8EC', true); cheer(1);
  if(f.loot && f.loot.length){ f.loot.forEach(id => WD.giveItem(id, 1)); addText(B.p.x, -130, 'Got your stuff back!', '#7CD86A', true); f.loot = []; }
  f.e.expr = 'dizzy'; await tw(f.e, { x: B.Wb + 160, rot: -1.2 * f.e.flip }, 600, 50); f.e.vis = false;
  updHud();
  if(B.foes.some(x => x.alive)){ layoutFoes(); live().forEach(x => { tw(x.e, { x: x.home }, 420); }); }
}
async function hurtAlly(who, n){
  const G = WD.G, P = G.partner ? G.party[G.partner] : null;
  if(who === 'a' && P && n > 0 && WD.hasPin('ruana')) n = Math.max(0, n - 1);
  if(who === 'a' && P){ P.hp = Math.max(0, P.hp - n); B.a.hurt = .35; addText(B.a.x, -60, n ? '-' + n : 'Blocked!', n ? '#E8593C' : '#3E6FB5', true); if(P.hp <= 0){ B.a.nervous = true; B.a.zzz = WD.G.partner === 'chunkers'; await WD.wait(250); await tw(B.a, { rot: -1.4 }, 300); addText(B.a.x, -40, WD.partnerDef().ko, '#B39CE0'); } }
  else { G.hp = Math.max(0, G.hp - n); B.p.hurt = .35; addText(B.p.x, -100, n ? '-' + n : 'Blocked!', n ? '#E8593C' : '#3E6FB5', true); }
  if(n){ WD.sfx('hit'); B.shake = 6; }
  updHud(); await WD.wait(300);
}
const live = () => B.foes.filter(f => f.alive);
const atkB = () => (WD.G && WD.G.atkB) || 0;
const partnerUp = () => { const G = WD.G; return !!(B.a && G.party[G.partner] && G.party[G.partner].hp > 0); };

/* ================= menus ================= */
function menu(opts, who){
  return new Promise(r => {
    const bm = WD.$('.wd-bmenu');
    bm.innerHTML = `<div class="who">${esc(who)}</div>` + opts.map((o, i) => `<button data-i="${i}" class="${o.cls || ''}" ${o.disabled ? 'disabled' : ''}>${esc(o.label)}<small>${esc(o.sub || '')}</small></button>`).join('');
    bm.hidden = false; WD.$('.wd-a').hidden = true;
    bm.querySelectorAll('button').forEach(b => b.onclick = () => { WD.audio(); WD.sfx('open'); bm.hidden = true; r(+b.dataset.i); });
    const first = bm.querySelector('button:not([disabled])'); if(first) first.focus({ preventScroll: true });
  });
}
function bSay(text, ms){
  return new Promise(r => { const bm = WD.$('.wd-bmenu'); bm.innerHTML = `<div class="who say">${esc(text)}</div>`; bm.hidden = false; WD.wait(ms || 1500).then(() => { bm.hidden = true; r(); }); });
}
WD.bSay = bSay;
/* ground = a move that can't reach flying enemies */
async function pickTarget(ground){
  const L = live(); if(L.length === 1 && !(ground && L[0].air)) return L[0];
  const allUp = ground && L.every(f => f.air);
  const i = await menu(L.map(f => ({ label: f.def.name, sub: ground && f.air ? 'Flying: out of reach' : `${f.hp} / ${f.max} HP`, disabled: !!(ground && f.air) })).concat([{ label: 'Back', sub: '', cls: 'back' }]), allUp ? 'Too high! Only jumps reach flying enemies' : 'Pick a target');
  return i < L.length ? L[i] : null;
}
async function tip(key, text){ if(!B.opts.tips || WD.flag('tip_' + key)) return; WD.set('tip_' + key); await bSay(text, 2400); }

/* ================= action commands ================= */
function holdRelease(){ return new Promise(r => { cmd = { kind: 'hold', v: 0, holding: false, r, show: true }; const c = cmd; WD.cmdPress = () => { if(!c.holding){ c.holding = true; WD.sfx('open'); } }; showA(true); }); }
function ringTime(x, y){ return new Promise(r => { cmd = { kind: 'ring', u: 0, r, show: true, x, y }; const c = cmd; WD.cmdPress = () => { if(c.done) return; c.done = true; const rad = 46 * (1 - c.u), d = Math.abs(rad - 14); finishCmd(d < 2.8 ? 2 : d < 7.5 ? 1 : 0); }; showA(true); }); }
function mash(secs){ return new Promise(r => { cmd = { kind: 'mash', n: 0, u: 0, secs: secs || 2.4, r, show: true }; const c = cmd; WD.cmdPress = () => { c.n++; WD.sfx('yap'); }; showA(true); }); }
/* Guarding. The A button goes live the moment an enemy starts its attack, so pressing early (or mashing)
   locks you out for that hit. Windows are measured around the moment of impact. */
const GW = WD.GUARD = { sg: [-65, 20], g: [-155, 45] };
function armGuard(){
  const c = { kind: 'guard', res: 0, show: false, pressed: false, at: null, early: false };
  cmd = c; showA(true);
  WD.cmdPress = () => { if(c.pressed) return; c.pressed = true;
    if(c.at === null){ c.early = true; return; }
    const dt = (WD.time - c.at) * 1000;
    c.res = dt > GW.sg[0] && dt < GW.sg[1] ? 2 : dt > GW.g[0] && dt < GW.g[1] ? 1 : 0;
    if(c.res) WD.sfx('guard'); else if(dt < 0) c.early = true; };
  return c;
}
function strikeIn(c, ms){ c.at = WD.time + ms / 1000; }
async function closeGuard(c, x){
  await WD.wait(70);
  if(cmd === c){ cmd = null; WD.cmdPress = null; }
  if(c.early){ addText(x || B.p.x, -150, 'Too early!', '#B9BCC2'); B.earlies = (B.earlies || 0) + 1; }
  return c.res;
}
const rand = (a, b) => a + Math.random() * (b - a);
function finishCmd(q){ const c = cmd; if(!c) return; cmd = null; WD.cmdPress = null; c.r(q); }
function showA(on){ const b = WD.$('.wd-a'); if(b) b.hidden = !on; }
WD.tickCmd = function(dt){
  const c = cmd; if(!c || WD.mode !== 'battle') return;
  if(c.kind === 'hold'){ if(c.holding){ c.v += dt / 1.15; if(!WD.input.a){ c.holding = false; finishCmd(c.v > .78 && c.v < .88 ? 2 : c.v > .66 && c.v < .95 ? 1 : 0); } else if(c.v >= 1.03) finishCmd(0); } }
  if(c.kind === 'ring'){ if(!c.done){ c.u += dt / .95; if(c.u >= 1.08){ c.done = true; finishCmd(0); } } }
  if(c.kind === 'mash'){ c.u += dt / c.secs; if(c.u >= 1) finishCmd(c.n); }
};

/* ================= the battle loop ================= */
async function run(){
  const opts = B.opts;
  await tw(B, { curtain: 1 }, 1000); cheer(1);
  if(WD.hasPin('tricolor')){ hype(1); addText(B.p.x, -130, '+1 SP · Tricolor Pin', '#FFC94A'); }
  if(opts.first){
    const f = live()[0];
    if(opts.first === 'flash'){ await bSay('First strike! The flashlight blinds them!'); live().forEach(x => { x.dizzy = 1; x.e.expr = 'dizzy'; }); addText(f.e.x, -100, 'Dazzled!', '#FFC94A', true); }
    else { await bSay(opts.first === 'dash' ? 'First strike! You dashed right into them!' : 'First strike!'); await hitFoe(f, 1, { noBuff: true }); }
  }
  if(opts.intro) await opts.intro(B, { bSay, addFoe: id => { const f = addFoe(id, true); updHud(); return tw(f.e, { x: f.home }, 700); } });
  while(!B.over){
    if(!live().length) break;
    await heroTurn(); if(!live().length) break;
    if(partnerUp()){ await partnerTurn(); if(!live().length) break; }
    for(const f of live().slice()){ if(!f.alive) continue; await foeTurn(f); if(WD.G.hp <= 0) break; if(f.def.twice && f.alive && !f.dizzy){ await foeTurn(f); if(WD.G.hp <= 0) break; } }
    if(WD.G.hp <= 0){ const again = await defeat(); if(again === 'retry') return; if(again === 'retreat') return; }
    if(B.atkUp > 0) B.atkUp--;
  }
  await victory();
}
async function heroTurn(){
  const G = WD.G, D = WD.hero === 'David';
  if(B.detain.p > 0){ B.detain.p--; B.p.expr = 'sad'; await bSay(`Detention! ${WD.hero} has to sit this turn out.`, 1500); B.p.expr = 'determined'; return; }
  if(B.focusT > 0){ B.focusT--; if(!B.focusT) addText(B.p.x, -130, 'Focus wore off', '#B9BCC2'); }
  while(true){
    const specials = [];
    specials.push(D ? { label: 'Alley-Oop', sub: `3 SP · launch ${G.partner ? WD.partnerDef().name : 'your partner'}, then dunk`, cost: 3, id: 'oop', need: 'partner' } : { label: 'Group FaceTime', sub: '3 SP · the whole family yells “¡Vamos!”', cost: 3, id: 'ft' });
    if(G.learned.includes('Love Attack')) specials.push({ label: 'Love Attack', sub: '2 SP · Dayla’s tackle, in her honour', cost: 2, id: 'love' });
    if(G.learned.includes('Zoomies')) specials.push({ label: 'Zoomies', sub: '3 SP · mash A! Hits every enemy on the ground', cost: 3, id: 'zoom' });
    if(G.learned.includes('Breakfast Focus')) specials.push({ label: 'Breakfast Focus', sub: '3 SP · 3 turns: no Detention or dizzy, take 1 less damage', cost: 3, id: 'focus' });
    const itemIds = Object.keys(G.items).filter(k => G.items[k] > 0);
    const main = [
      { label: D ? 'Jump Shot' : 'Heel Stomp', sub: 'Hold A, let go in the green' },
      { label: D ? 'Crossover' : 'Purse Swing', sub: 'Tap A when the rings meet · ground only' },
      { label: 'Specials', sub: `${G.sp} SP`, cls: 'special' },
      { label: 'Items', sub: itemIds.length ? `${itemIds.reduce((s, k) => s + G.items[k], 0)} in your bag` : 'Bag is empty', disabled: !itemIds.length },
      { label: 'Family Call', sub: B.fam ? 'Already called this fight' : 'Once per battle', cls: 'call', disabled: B.fam }
    ];
    const i = await menu(main, `${WD.hero}'s turn`);
    if(i === 0){ await tip('hold', 'Press and HOLD A. Let go when the bar is in the green, right at the yellow.'); const f = await pickTarget(); if(!f) continue; await jumpShot(f); return; }
    if(i === 1){ await tip('ring', 'Watch the yellow ring shrink. Tap A the moment it meets the white one.'); const f = await pickTarget(true); if(!f) continue; await crossover(f); return; }
    if(i === 2){
      const j = await menu(specials.map(s => ({ label: s.label, sub: s.sub, cls: 'special', disabled: G.sp < s.cost || (s.need === 'partner' && !partnerUp()) })).concat([{ label: 'Back', cls: 'back' }]), 'Specials');
      if(j >= specials.length) continue; const s = specials[j]; G.sp -= s.cost; updHud();
      if(s.id === 'oop'){ const f = await pickTarget(); if(!f){ G.sp += s.cost; updHud(); continue; } await alleyOop(f); }
      else if(s.id === 'ft') await groupFaceTime();
      else if(s.id === 'love'){ const f = await pickTarget(); if(!f){ G.sp += s.cost; updHud(); continue; } await loveAttack(f); }
      else if(s.id === 'zoom') await zoomies();
      else if(s.id === 'focus'){ await bSay('Breakfast Focus! Like Dayla at her bowl: nothing can distract you now.', 1700); B.focusT = 4; B.detain.p = 0; B.p.expr = 'determined'; addText(B.p.x, -120, 'FOCUSED', '#FFC94A', 'huge'); WD.sfx('heal'); cheer(1); await WD.wait(500); }
      return;
    }
    if(i === 3){
      const ids = Object.keys(G.items).filter(k => G.items[k] > 0);
      const j = await menu(ids.map(k => ({ label: `${WD.ITEMS[k].name} ×${G.items[k]}`, sub: WD.ITEMS[k].desc.replace(/^.*?\. /, '') })).concat([{ label: 'Back', cls: 'back' }]), 'Items');
      if(j >= ids.length) continue;
      const r = WD.useItem(ids[j], true); WD.sfx('heal');
      if(r.hp) addText(B.p.x, -100, '+' + r.hp, '#7CD86A', true); if(r.php && B.a) addText(B.a.x, -64, '+' + r.php, '#7CD86A', true); if(r.sp) addText(B.p.x, -120, '+' + r.sp + ' SP', '#FFC94A', true);
      if(r.php && B.a && WD.G.party[WD.G.partner].hp > 0 && B.a.rot){ B.a.rot = 0; B.a.nervous = false; }
      burst(B.p.x, -50, 10, ['#7CD86A', '#FFF8EC']); updHud(); await WD.wait(700); return;
    }
    if(i === 4){ const ok = await familyCall(); if(!ok) continue; return; }
  }
}
async function jumpShot(f){
  const p = B.p; B.focus = 'hold'; const q = await holdRelease(); B.focus = null;
  await tw(p, { x: f.e.x - 42 }, 360); WD.sfx('jump'); await tw(p, { x: f.e.x - 8 }, 420, 70);
  rating(q); await hitFoe(f, [1, 2, 3][q] + (WD.hasPin('eagle') ? 1 : 0) + atkB());
  if(q && f.alive){ await tw(p, { x: f.e.x - 10 }, 300, 40); await hitFoe(f, q === 2 ? 2 : 1); }
  await tw(p, { x: B.home.p }, 480, 30);
  if(!q) await punish(f, 'p');
}
async function crossover(f){
  const p = B.p; await tw(p, { x: f.e.x - 50 }, 420); B.focus = 'ring'; const q = await ringTime(f.e.x, -36); B.focus = null;
  await tw(p, { x: f.e.x - 20 }, 140); rating(q); await hitFoe(f, [1, 2, 3][q] + atkB());
  if(q === 2 && f.alive){ f.dizzy = Math.max(f.dizzy, 1); f.e.expr = 'dizzy'; addText(f.e.x, -110, 'Dizzy!', '#B39CE0'); }
  p.dir = -1; await tw(p, { x: B.home.p }, 480); p.dir = 1;
  if(!q) await punish(f, 'p');
}
async function alleyOop(f){
  const p = B.p, a = B.a;
  await bSay(`Alley-Oop! Toss ${WD.partnerDef().name} up, then finish at the rim!`, 1200);
  await tw(a, { x: p.x + 18 }, 260); WD.sfx('jump'); a.nervous = true; await tw(a, { x: f.e.x - 6 }, 650, 130); a.rot = 0; a.nervous = false; cheer(2); await hitFoe(f, 2);
  await tw(a, { x: B.home.a }, 420, 30);
  if(!f.alive){ await tw(p, { x: B.home.p }, 200); return; }
  await tw(p, { x: f.e.x - 60 }, 300); B.focus = 'ring'; const q = await ringTime(f.e.x, -60); B.focus = null;
  await tw(p, { x: f.e.x - 12 }, 520, 110); rating(q); await hitFoe(f, [2, 3, 5][q]);
  burst(f.e.x, -40, 30, ['#FFC94A', '#E8593C', '#7CD86A', '#58AEDD']);
  await tw(p, { x: B.home.p }, 480, 30);
}
async function groupFaceTime(){
  B.call = { name: 'Group FaceTime', icon: 'love', t: 0, many: true };
  WD.sfx('ring'); await bSay('Group FaceTime! The whole family picks up at once…', 1500);
  await bSay(WD.hero === 'Laura' ? '“¡VAMOS, LAURA! ¡TÚ PUEDES!”' : '“¡VAMOS, LAURA! ¡TÚ PUEDES!” (Go, Laura! You can do it!)', 1500);
  B.call = null; cheer(3); WD.sfx('big'); B.shake = 12;
  for(const f of live().slice()){ f.dizzy = Math.max(f.dizzy, 1); f.e.expr = 'dizzy'; addText(f.e.x, -100, 'So loud!', '#B39CE0'); await hitFoe(f, 3); }
  const G = WD.G; G.hp = Math.min(G.mhp, G.hp + 3); const P = G.partner && G.party[G.partner]; if(P && P.hp > 0) P.hp = Math.min(P.mhp, P.hp + 3);
  WD.sfx('heal'); addText(B.p.x, -100, '+3', '#7CD86A', true); updHud(); await WD.wait(500);
}
async function loveAttack(f){
  const p = B.p; await bSay('Love Attack! In Dayla’s honour…', 1100);
  await tw(p, { x: f.e.x - 60 }, 300); B.focus = 'ring'; const q = await ringTime(f.e.x, -40); B.focus = null;
  await tw(p, { x: f.e.x - 14 }, 420, 50); rating(q); await hitFoe(f, 2 + q); addText(f.e.x, -110, 'So much love!', '#E86F79');
  const G = WD.G; G.hp = Math.min(G.mhp, G.hp + 1); updHud();
  await tw(p, { x: B.home.p }, 480, 30);
}
/* family calls: the people stay safe on the phone; they help from wherever they are */
const CALLS = {
  David: [
    { id: 'steven', name: 'Steven', icon: 'toque', sub: 'A bad joke. Stuns everyone.' },
    { id: 'joseph', name: 'Joseph', icon: 'bbq', sub: 'BBQ. Heals you and your partner 6 HP.' },
    { id: 'olga', name: 'Olga', icon: 'choc', sub: 'Dark chocolate. +2 SP, stronger hits for 3 turns.' }
  ],
  Laura: [
    { id: 'elsa', name: 'Mami Elsa', icon: 'plate', sub: 'Full heal, plus a plate to go.' },
    { id: 'titin', name: 'Titin', icon: 'taxi', sub: 'Taxi! Tap A to honk. Hits everyone.' },
    { id: 'carolina', name: 'Carolina', icon: 'bag', sub: 'Shopping bag. A random item.' }
  ]
};
async function familyCall(){
  const list = CALLS[WD.hero];
  const j = await menu(list.map(c => ({ label: c.name, sub: c.sub, cls: 'call' })).concat([{ label: 'Back', cls: 'back' }]), 'Family Call');
  if(j >= list.length) return false;
  const c = list[j], G = WD.G, P = G.partner && G.party[G.partner], L = WD.hero === 'Laura';
  B.fam = true; B.call = { name: c.name, icon: c.icon, t: 0 }; WD.sfx('ring'); await WD.wait(900);
  if(c.id === 'steven'){
    await bSay('Steven: “Why did the hockey player bring a ladder to the game?”', 1900);
    await bSay('Steven: “…Because it was going into OVER-time. Eh? Eh?”', 1900);
    B.call = null; for(const f of live()){ f.dizzy = Math.max(f.dizzy, 1); f.e.expr = 'dizzy'; addText(f.e.x, -100, 'Groan…', '#B39CE0'); } WD.sfx('miss'); cheer(1); await WD.wait(700);
  } else if(c.id === 'joseph'){
    await bSay('Joseph: “Fired up the grill. Eat up, son.”', 1700);
    B.call = null; G.hp = Math.min(G.mhp, G.hp + 6); if(P && P.hp > 0) P.hp = Math.min(P.mhp, P.hp + 6);
    WD.sfx('heal'); addText(B.p.x, -100, '+6', '#7CD86A', true); if(B.a && P && P.hp > 0) addText(B.a.x, -64, '+6', '#7CD86A', true); burst(B.p.x, -50, 14, ['#7CD86A', '#FFF8EC']); updHud(); await WD.wait(600);
  } else if(c.id === 'olga'){
    await bSay('Olga: “Eat chocolate. Dark one. Is good for the brain, you will see.”', 1900);
    B.call = null; hype(2); B.atkUp = 3; addText(B.p.x, -110, 'Power up!', '#FFC94A', true); WD.sfx('heal'); await WD.wait(600);
  } else if(c.id === 'elsa'){
    await bSay(L ? 'Mami Elsa: “¡Mija! ¿Ya comiste? Te mando un platico.”' : 'Mami Elsa: “¡Mija! ¿Ya comiste?” (Have you eaten?)', 1900);
    B.call = null; G.hp = G.mhp; if(P && P.hp > 0) P.hp = P.mhp; WD.giveItem('plate', 1);
    WD.sfx('heal'); addText(B.p.x, -100, 'Full heal!', '#7CD86A', true); addText(B.p.x, -124, '+1 Mami Elsa’s Plate', '#FFC94A'); burst(B.p.x, -50, 16, ['#7CD86A', '#FFF8EC']); updHud(); await WD.wait(700);
  } else if(c.id === 'titin'){
    await bSay(L ? 'Titin: “¡Súbase, mija! Hello, how are you? ¡Vámonos!”' : 'Titin: “¡Súbase!” (Hop in!)', 1700);
    B.call = null; B.taxi = { x: -B.Wb - 160 }; WD.sfx('honk');
    const q = await (async () => { const pr = ringTime(0, -40); await WD.wait(10); return pr; })();
    await WD.tween(700, u => { B.taxi.x = lerp(-B.Wb - 160, B.Wb + 200, u); });
    rating(q, 0); B.taxi = null;
    for(const f of live().slice()) await hitFoe(f, [2, 3, 4][q]);
  } else if(c.id === 'carolina'){
    await bSay(L ? 'Carolina: “¡Mira lo que encontré en oferta!”' : 'Carolina: “¡Mira lo que encontré en oferta!” (Look what I found on sale!)', 1800);
    B.call = null; const pick = ['arepa', 'cafe', 'choc', 'jerky'][Math.floor(Math.random() * 4)]; WD.giveItem(pick, 1); WD.sfx('get'); addText(B.p.x, -110, '+1 ' + WD.ITEMS[pick].name, '#FFC94A', true); await WD.wait(900);
  }
  B.call = null; return true;
}
async function partnerTurn(){
  const G = WD.G;
  if(B.snatched){ await bSay(`${WD.partnerDef().name} is caught in the condor’s talons! Hit it hard to break free.`, 1500); return; }
  if(B.detain.a > 0){ B.detain.a--; await bSay(B.detainWhy || `Detention! ${WD.partnerDef().name} has to sit this turn out.`, 1400); return; }
  while(true){
    const a = B.a, id = G.partner, others = Object.keys(G.party).filter(k => k !== id && WD.PARTNERS[k] && G.party[k].hp > 0);
    const opts = id === 'lunita' ? [
      { label: 'Pinscher Pounce', sub: 'Tap A on both rings. Reaches flyers' },
      { label: 'Frenchie Charge', sub: `1 SP · hold A: Papu & Moka hit everyone on the ground`, disabled: G.sp < 1 }
    ] : id === 'chunkers' ? [
      { label: 'Bulldog Bash', sub: 'Hold A, let go in the green. Big hit' },
      { label: 'Good Boy Guard', sub: 'Chunkers takes the next hit for you, and blocks some' }
    ] : [
      { label: 'Long-Body Spin', sub: 'Tap A on each ring. Up to 4 hits' },
      { label: 'Nervous Yap', sub: 'Mash A! Loud enough and they get dizzy' },
      { label: 'Sniff', sub: 'Learn about an enemy' }
    ];
    if(others.length) opts.push({ label: 'Swap partner', sub: `Switch to ${others.map(k => WD.PARTNERS[k].name).join(' / ')}. Free`, cls: 'call' });
    const i = await menu(opts, `${WD.partnerDef().name}’s turn`);
    if(others.length && i === opts.length - 1){ await swapIn(others[0]); continue; }
    if(id === 'chunkers'){
      if(i === 1){ B.goodBoy = 1; a.sit = true; await bSay('Chunkers sits in front of you. Very obedient. Very solid.', 1500); addText(a.x, -70, 'Good boy!', '#FFC94A', true); cheer(1); return; }
      const f = await pickTarget(true); if(!f) continue;
      await tip('bash', 'Hold A to let Chunkers wind up, then let go in the green!');
      a.sit = false; B.focus = 'hold'; const q = await holdRelease(); B.focus = null;
      await tw(a, { x: f.e.x - 70 }, 300); WD.sfx('dash'); await tw(a, { x: f.e.x - 14 }, 260, 12);
      rating(q, a.x); await hitFoe(f, [1, 3, 4][q]);
      if(q === 2 && f.alive){ f.dizzy = Math.max(f.dizzy, 1); f.e.expr = 'dizzy'; addText(f.e.x, -110, 'Bonk!', '#B39CE0'); }
      await tw(a, { x: B.home.a }, 420, 16);
      if(!q) await punish(f, 'a');
      return;
    }
    if(id === 'lunita'){ const r = await lunitaTurn(i); if(r === 'back') continue; return; }
    if(i === 2){ const f = await pickTarget(); if(!f) continue; a.sniff = true; WD.sfx('sniff'); await WD.wait(700); a.sniff = false; await bSay(f.def.tattle, 3600); f.sniffed = true; return; }
    const f = await pickTarget(i === 0); if(!f) continue;
    if(i === 0){
      await tip('spin', 'Three rings, one after another. Tap A each time a ring meets the white circle.');
      await tw(a, { x: f.e.x - 40 }, 380);
      let hits = 1; for(let k = 0; k < 3; k++){ B.focus = 'ring'; const q = await ringTime(f.e.x, -26); B.focus = null; if(q){ hits++; if(q === 2) hype(1); WD.sfx(q === 2 ? 'perfect' : 'nice'); } else WD.sfx('miss'); a.rot = (a.rot || 0) + Math.PI * 2 * .25; }
      a.rot = 0;
      for(let h = 0; h < hits && f.alive; h++){ WD.tween(180, u => { a.rot = u * Math.PI * 2; }); await tw(a, { x: f.e.x - 16 }, 150, 10); await hitFoe(f, 1); await tw(a, { x: f.e.x - 36 }, 120, 6); }
      a.rot = 0; if(hits >= 4){ addText(-40, -120, 'PERFECT!', '#FFC94A', 'huge'); cheer(2); } else if(hits >= 3){ addText(-40, -120, 'NICE!', '#7CD86A', 'huge'); cheer(1); }
      await tw(a, { x: B.home.a }, 400, 20);
      if(hits <= 1) await punish(f, 'a');
    } else {
      await tip('mash', 'Mash A as fast as you can until the bar is full!');
      a.nervous = true; B.focus = 'mash'; const n = await mash(2.2); B.focus = null; a.bark = true;
      for(let k = 0; k < Math.min(6, 1 + Math.floor(n / 4)); k++){ WD.sfx('yap'); addText(a.x + 20 + k * 6, -70 - k * 8, 'YAP!', '#FFF8EC'); await WD.wait(90); }
      a.bark = false; a.nervous = false;
      await hitFoe(f, n >= 10 ? 2 : 1);
      if(n >= 15 && f.alive){ f.dizzy = Math.max(f.dizzy, 1); f.e.expr = 'dizzy'; addText(f.e.x, -110, 'Dizzy!', '#B39CE0'); rating(2); } else if(n >= 10) rating(1);
    }
    return;
  }
}
/* Lunita: a tiny mini pinscher who can leap at flyers, plus her Frenchie brothers Papu and Moka */
async function lunitaTurn(i){
  const G = WD.G, a = B.a;
  if(i === 0){
    const f = await pickTarget(false); if(!f) return 'back';
    await tip('pounce', 'Two rings, one after the other. Tap A on each. Lunita can reach enemies in the air!');
    const hy = f.air ? -86 : -40;
    await tw(a, { x: f.e.x - 46 }, 320);
    let perf = 0;
    for(let k = 0; k < 2 && f.alive; k++){
      B.focus = 'ring'; const q = await ringTime(f.e.x, hy); B.focus = null;
      if(q === 2) perf++;
      WD.sfx('jump'); await tw(a, { x: f.e.x - 12 }, 240, f.air ? 70 : 34); rating(q, a.x);
      await hitFoe(f, [1, 2, 2][q]); await tw(a, { x: f.e.x - 40 }, 200, 10);
    }
    if(f.alive && f.air && perf === 2 && f.def.groundable){ f.air = false; f.grounded = 1; f.e.z = 0; B.shake = 12; WD.sfx('big'); addText(f.e.x, -110, 'GROUNDED!', '#FFC94A', 'huge'); cheer(2); await bSay(`${f.def.name} tumbles out of the sky! Everyone can reach it now.`, 1700); }
    await tw(a, { x: B.home.a }, 380, 20);
    if(!perf) await punish(f, 'a');
    return;
  }
  if(G.sp < 1) return 'back';
  G.sp -= 1; updHud();
  await tip('frenchie', 'Hold A to let Papu and Moka get a running start, then let go in the green!');
  WD.sfx('bark'); await bSay('Lunita barks for backup! Papu and Moka come charging in!', 1200);
  B.focus = 'hold'; const q = await holdRelease(); B.focus = null;
  const mk = (coat, y) => WD.makeEnt({ kind: 'frenchie', coat, name: coat === 'grey' ? 'Papu' : 'Moka', x: -B.Wb - 60, y, dir: 1, flip: 1, light: 'day', move: 1 });
  B.assist = [mk('grey', -4), mk('brown', 10)];
  WD.sfx('dash'); rating(q, 0);
  const hits = live().slice();
  await Promise.all(B.assist.map((e, j) => WD.wait(j * 160).then(() => tw(e, { x: B.Wb + 120 }, 1300))));
  for(const f of hits){ if(!f.alive) continue; if(f.air){ addText(f.e.x, -120, 'Too high!', '#B9BCC2'); continue; } await hitFoe(f, [1, 2, 3][q]); }
  B.assist = null;
}
async function zoomies(){
  const p = B.p; await bSay('ZOOMIES! Mash A! Run laps like Dayla after a bath!', 1300);
  B.focus = 'mash'; const n = await mash(2.4); B.focus = null;
  const laps = Math.min(3, 1 + Math.floor(n / 10));
  for(let k = 0; k < laps; k++){ WD.sfx('dash'); await tw(p, { x: B.Wb * .95 }, 360, 10); p.dir = -1; await tw(p, { x: -B.Wb * .8 }, 360, 10); p.dir = 1; }
  const dmg = 1 + Math.min(3, Math.floor(n / 7)); if(n >= 21) rating(2); else if(n >= 12) rating(1); else rating(0);
  for(const f of live().slice()){ if(f.air){ addText(f.e.x, -120, 'Too high!', '#B9BCC2'); continue; } await hitFoe(f, dmg); }
  await tw(p, { x: B.home.p }, 380, 20);
}
async function swapIn(id){
  const G = WD.G, old = B.a; WD.sfx('whoosh');
  await tw(old, { x: -B.Wb - 80 }, 320);
  G.partner = id; const d = WD.partnerDef(id);
  const n = WD.makeEnt({ kind: d.kind, name: d.name, y: 7, dir: 1, flip: 1, light: 'day', x: -B.Wb - 80 }); B.a = n; B.goodBoy = 0;
  buildHud(); await tw(n, { x: B.home.a }, 380); addText(n.x, -70, d.name + '!', '#FFF8EC', true);
  if(WD.W.partner && WD.W.partner.name !== d.name){ const e = WD.makePartner(id); e.follow = true; Object.assign(e, { x: WD.W.partner.x, y: WD.W.partner.y }); WD.W.partner = e; }
}
/* ---------- enemy brains ---------- */
function chooseMove(f){
  const raging = f.def.rage && f.hp <= f.max / 2;
  const moves = raging ? f.def.rage : f.def.moves;
  let pool = moves.filter(m => !(m.type === 'summon' && live().length >= (m.max || 2)))
    .filter(m => !(m.type === 'heal' && f.hp > f.max * .6))
    .filter(m => !(m.type === 'buff' && f.pow))
    .filter(m => !(m.type === 'brace' && (f.brace || f.hp > f.max * .7)));
  if(!pool.length) pool = moves.filter(m => m.dmg !== undefined);
  const weight = m => {
    let w = m.w;
    if(f.def.learn && B.gstat[m.id] && B.gstat[m.id].n){ const g = B.gstat[m.id]; w *= 1 + Math.min(1.2, g.fail / g.n * 1.5); }
    if(m.type === 'heal' && f.hp <= f.max * .35) w *= 2;
    if(f.def.smart && m.id === f.lastMove && pool.length > 1) w *= .5;
    return w;
  };
  const tot = pool.reduce((s, m) => s + weight(m), 0); let r = Math.random() * tot, mv = pool[0];
  for(const m of pool){ r -= weight(m); if(r <= 0){ mv = m; break; } }
  return mv;
}
function chooseTarget(f, mv){
  if(!partnerUp()) return 'p';
  if(B.goodBoy) return 'a';
  const G = WD.G, P = G.party[G.partner], d = (mv.dmg || 1) + (f.pow ? 1 : 0);
  let pa = .35;
  if(f.def.smart || f.def.boss){ if(G.hp <= d * 2) pa = .15; else if(P.hp <= d) pa = .6; }
  return Math.random() < pa ? 'a' : 'p';
}
function noteGuard(f, mv, res){ if(!mv.id) return; const g = B.gstat[mv.id] || (B.gstat[mv.id] = { n: 0, fail: 0 }); g.n++; if(res < 1) g.fail++; }
async function tipOnce(key, text){ if(WD.flag('tip_' + key)) return; WD.set('tip_' + key); await bSay(text, 2600); }
async function foeTurn(f){
  const e = f.e;
  f.brace = 0;
  if(f.dizzy > 0){ f.dizzy--; if(f.charging){ f.charging = null; e.glow = false; addText(e.x, -120, 'Charge lost!', '#FFC94A', true); } addText(e.x, -96, 'Too dizzy to move', '#B39CE0'); await WD.wait(800); if(!f.dizzy) e.expr = 'happy'; return; }
  if(f.grounded > 0){ f.grounded--; await bSay(`${f.def.name} shakes off the dust and flaps back up into the sky.`, 1500); f.air = true; WD.sfx('whoosh'); return; }
  if(f.def.rage && f.hp <= f.max / 2 && !f.raged){ f.raged = true; await bSay(`${f.def.name} is getting serious!`, 1300); e.expr = 'angry'; B.shake = 8; WD.sfx('hiss'); }
  let mv;
  if(f.charging){ mv = f.charging; f.charging = null; }
  else {
    mv = chooseMove(f);
    if(mv.windup){ f.charging = mv; e.glow = true; e.armRaise = -1.6; WD.sfx('whoosh'); await bSay(mv.charge || `${f.def.name} is charging up ${mv.name}! It lands next turn. Make it dizzy to stop it!`, 2000); e.armRaise = -.8; f.lastMove = mv.id; return; }
  }
  f.lastMove = mv.id;
  const target = chooseTarget(f, mv);
  const tgt = target === 'p' ? B.p : B.a;
  if(!WD.flag('tip_guard') && B.opts.tips && (mv.type === 'melee' || mv.type === 'lob')){ await tip('guard', 'Here it comes! Tap A right before the hit to Guard. Perfect timing = Superguard! Don’t press early: you only get one try per hit.'); }
  const extra = f.pow ? 1 : 0;
  if(mv.type === 'heal'){ await bSay(mv.say || `${f.def.name} soaks up the sun…`, 1100); f.hp = Math.min(f.max, f.hp + mv.amt); addText(e.x, -70, '+' + mv.amt, '#7CD86A', true); WD.sfx('heal'); updHud(); await WD.wait(400); return; }
  if(mv.type === 'buff'){ await bSay(mv.say || `${f.def.name} hisses! Its next hit will be stronger.`, 1200); WD.sfx('hiss'); f.pow = 1; e.expr = 'angry'; return; }
  if(mv.type === 'brace'){ await bSay(mv.say || `${f.def.name} braces itself! It takes 2 less damage until its next turn.`, 1400); WD.sfx('guard'); f.brace = 2; addText(e.x, -100, 'Braced!', '#58AEDD', true); return; }
  if(mv.type === 'summon'){ await bSay(mv.say || '“FALL IN!” The Sergeant blows his whistle!', 1200); WD.sfx('whistle'); e.armRaise = -1; await WD.wait(400); e.armRaise = 0; const nf = addFoe(mv.summon, true); updHud(); await tw(nf.e, { x: nf.home }, 700); await bSay(mv.after || 'A Cat Agent reports for duty!', 1000); return; }
  if(mv.type === 'special' && mv.run){ await mv.run(f, B, { bSay, tw, hurtAlly, addText, armGuard, strikeIn, closeGuard, resolveHit, target, tgt, live, partnerUp, noteGuard, hitFoe, updHud, burst }); f.pow = 0; return; }
  if(mv.noSuper){ e.glow = true; await tipOnce('red', 'That glow means trouble: a red attack can be Guarded, but not Superguarded.'); }
  await bSay(`${f.def.name}: ${mv.name}!`, 1000);
  const shots = mv.type === 'barrage' ? mv.n : 1;
  if(mv.type === 'lob' || mv.type === 'barrage' || mv.type === 'detain'){
    for(let s = 0; s < shots; s++){
      if(!f.alive) break;
      const tg = s === 0 || B.goodBoy ? tgt : (partnerUp() && Math.random() < .35 ? B.a : B.p), tk = tg === B.p ? 'p' : 'a';
      if(tk === 'a' && !partnerUp()) continue;
      const c = armGuard();
      e.armRaise = -1.4;
      if(mv.delay) await WD.wait(rand(mv.delay[0], mv.delay[1]));
      WD.sfx('whoosh'); if(mv.proj === 'hairball') WD.sfx('gulp');
      const arrive = mv.rhythm ? mv.rhythm[s % mv.rhythm.length] : mv.type === 'barrage' ? 520 : 640;
      const pr = { x0: e.x - 10, y0: -40 * (e.look ? e.look.size || 1 : 1) - (e.z || 0), x1: tg.x + 10, y1: tk === 'p' ? -46 : -22, u: 0, kind: mv.proj, red: !!mv.noSuper, arc: mv.arc };
      B.proj.push(pr); strikeIn(c, arrive);
      await WD.tween(arrive, u => { pr.u = u; });
      B.proj = B.proj.filter(x => x !== pr); e.armRaise = 0;
      let res = await closeGuard(c, tg.x);
      if(mv.noSuper && res === 2){ res = 1; addText(tg.x, -150, 'Too strong to Superguard!', '#E8593C'); }
      if(B.goodBoy && tk === 'a') res = Math.max(res, 1);
      noteGuard(f, mv, res);
      await resolveHit(res, tk, (mv.dmg || 0) + extra, f, mv);
      if(mv.type === 'detain' && res < 2){ if(tk === 'p' && B.focusT > 0) addText(tg.x, -140, 'Too focused!', '#FFC94A', true); else { B.detain[tk] = 1; addText(tg.x, -140, 'DETENTION!', '#B39CE0', true); WD.sfx('whistle'); } }
      if(WD.G.hp <= 0) break;
      if(s < shots - 1 && mv.gap) await WD.wait(mv.gap[s % mv.gap.length]);
    }
  } else {
    const x0 = e.x, c = armGuard();
    await tw(e, { x: tgt.x + 70 }, 420);
    if(mv.feint && Math.random() < mv.feint){
      e.armRaise = -1.3; await tw(e, { x: tgt.x + 40 }, 190, 14); e.armRaise = 0; await tw(e, { x: tgt.x + 76 }, 240);
      addText(e.x, -110, 'Fake-out!', '#FFF8EC'); await WD.wait(rand(260, 560));
      if(!WD.flag('tip_feint') && c.early){ WD.set('tip_feint'); }
    }
    if(mv.delay){ e.armRaise = -1.2; await WD.wait(rand(mv.delay[0], mv.delay[1])); }
    const strike = mv.speed || 480;
    strikeIn(c, strike);
    await tw(e, { x: tgt.x + 18 }, strike, mv.id === 'slam' || mv.id === 'drill' ? 80 : 30); e.armRaise = 0;
    let res = await closeGuard(c, tgt.x);
    if(mv.noSuper && res === 2){ res = 1; addText(tgt.x, -150, 'Too strong to Superguard!', '#E8593C'); }
    if(B.goodBoy && target === 'a') res = Math.max(res, 1);
    if(mv.id === 'slam' || mv.big) B.shake = 10;
    noteGuard(f, mv, res);
    await resolveHit(res, target, (mv.dmg || 0) + extra, f, mv);
    await tw(e, { x: x0 }, 480, 30);
  }
  e.glow = false;
  if(B.earlies && !WD.flag('tip_early')){ WD.set('tip_early'); await bSay('Too early! Once you press A, you’re locked in for that hit. Wait for the real swing.', 2400); }
  f.pow = 0; if(e.expr === 'angry' && !f.raged) e.expr = 'happy';
  if(B.goodBoy){ B.goodBoy = 0; if(B.a) B.a.sit = false; }
}
async function resolveHit(res, who, dmg, f, mv){
  const tg = who === 'p' ? B.p : B.a;
  if(res === 2){
    B.streak = (B.streak || 0) + 1; const st = B.streak >= 3;
    addText(tg.x, -120, st ? 'SUPERGUARD STREAK!' : 'SUPERGUARD!', '#FFC94A', 'huge'); WD.sfx('perfect'); cheer(2); hype(st ? 2 : 1);
    await hurtAlly(who, 0); if(f && f.alive) await hitFoe(f, (st ? 2 : 1) + (WD.hasPin('oro') ? 1 : 0), { noBuff: true, pierce: true });
    return;
  }
  B.streak = 0;
  const off = (who === 'p' && B.focusT > 0 ? 1 : 0);
  if(res === 1){ addText(tg.x, -120, 'Guard!', '#58AEDD', true); hype(1); await hurtAlly(who, Math.max(0, dmg - 1 - (WD.hasPin('pearl') ? 1 : 0) - off)); }
  else await hurtAlly(who, Math.max(0, dmg - off));
  if(mv && mv.steal && res < 1 && f && f.alive){ const G = WD.G, ids = Object.keys(G.items).filter(k => G.items[k] > 0); if(ids.length){ const id = ids[Math.floor(Math.random() * ids.length)]; G.items[id]--; if(!G.items[id]) delete G.items[id]; (f.loot = f.loot || []).push(id); addText(f.e.x, -130, 'Stole ' + WD.ITEMS[id].name + '!', '#E8593C', true); WD.sfx('whoosh'); if(!WD.flag('tip_steal')){ WD.set('tip_steal'); await bSay(`${f.def.name} pinched something from your bag! Beat it to get it back.`, 2000); } } }
}
/* some enemies punish a botched attack with a quick counter */
async function punish(f, who){
  if(!f || !f.alive || !f.def.punish) return;
  if(who === 'a' && !partnerUp()) who = 'p';
  const e = f.e; e.armRaise = -1.2; WD.sfx('whistle');
  addText(e.x, -110, f.def.punishText || 'Counter!', '#E8593C', true); await WD.wait(350); e.armRaise = 0;
  await hurtAlly(who, f.def.punish);
  if(!WD.flag('tip_punish')){ WD.set('tip_punish'); await bSay(`${f.def.name} punishes sloppy attacks. Nail your timing to avoid the counter!`, 2200); }
}
WD.battlePunish = punish;
async function defeat(){
  WD.sfx('lose'); B.p.expr = 'sad'; B.p.rot = -.2;
  await bSay(`${WD.hero} is out of breath…`, 1400);
  WD.$('.wd-bmenu').hidden = true; showA(false);
  const i = await WD.card(`<i class="k">Out of breath</i><h2>Don’t give up!</h2><p>Dayla is still out there. Catch your breath and try again, or back off and rest first. Nothing is lost either way.</p>`, [{ label: 'Try again', sub: 'Same fight, full HP', alt: true }, { label: 'Back off and rest', sub: 'Full HP, return to the map' }]);
  const G = WD.G; G.hp = G.mhp; Object.keys(G.party).forEach(k => { G.party[k].hp = G.party[k].mhp; });
  if(i === 0){ const opts = B.opts, res = B.resolve; WD.pageTurn(() => setup(opts, res)).then(run); B.over = true; return 'retry'; }
  B.over = true; await endBattle('retreat'); return 'retreat';
}
async function victory(){
  B.over = true; showA(false); WD.$('.wd-bmenu').hidden = true;
  const G = WD.G; WD.sfx('win'); cheer(3);
  const xp = Math.max(1, Math.round((B.foes.reduce((s, f) => s + (f.def.xp || 0), 0) + (B.opts.xpBonus || 0)) * clamp(1.25 - .06 * G.lv, .5, 1.2)));
  burst(0, -60, 40, ['#FFC94A', '#E8593C', '#7CD86A', '#58AEDD', '#FFF8EC']);
  addText(0, -140, 'You win!', '#FFC94A', 'huge'); B.p.expr = 'joy'; if(B.a) { B.a.happy = true; B.a.nervous = false; B.a.sit = false; B.a.zzz = false; }
  await WD.tween(500, u => { B.p.z = Math.sin(u * Math.PI) * 30; if(B.a) B.a.z = Math.sin(u * Math.PI) * 24; });
  await WD.wait(500); addText(0, -110, `+${xp} Star Points`, '#FFF8EC', true); await WD.wait(1300);
  G.xp += xp;
  const P = G.partner && G.party[G.partner]; if(P && P.hp <= 0) P.hp = 1;
  while(G.xp >= 100){ G.xp -= 100; await levelUp(); }
  Object.keys(G.party).forEach(k => { if(G.party[k].hp <= 0) G.party[k].hp = 1; });
  await endBattle('win');
}
async function levelUp(){
  const G = WD.G; G.lv++;
  const i = WD.levelUpScreen ? await WD.levelUpScreen(G) : await WD.card(`<i class="k">Level up!</i><h2>${esc(WD.hero)} is Level ${G.lv}</h2>`, [{ label: 'HP +5', alt: true }, { label: 'SP +1' }, { label: 'PP +3' }]);
  if(i === 0) G.mhp += 5; else if(i === 1) G.msp += 1; else { G.mpp += 3; G.pp = G.mpp; }
  G.hp = G.mhp; G.sp = G.msp; Object.keys(G.party).forEach(k => { const P = G.party[k]; P.mhp += 2; P.hp = P.mhp; });
  updHud();
}
function endBattle(res){
  return WD.pageTurn(() => {
    WD.$('.wd-bhud').hidden = true; WD.$('.wd-bmenu').hidden = true; showA(false);
    cmd = null; WD.cmdPress = null; const r = B.resolve; B = null;
    WD.MUS.play(WD.W.area.music);
    WD.setScene(WD.EXPLORE, 'explore'); WD.showControls(true); WD.showGoal(true);
    WD.saveNow();
    r(res);
  });
}

/* ================= drawing ================= */
const BACKS = WD.BATTLE_BACKS = {
  walk: { draw(t){ const c = WD.ctx; WD.drawClubhouseBack(c, t); } },
  courts: { draw(t){
    const c = WD.ctx;
    c.save(); c.translate(-40, -16); WD.drawFitness(c, -150, t); c.restore();
    [-230, 200].forEach((x, i) => WD.drawPalm(c, x, -14, 160 + i * 10, (i - .5) * .1, t, i, WD.PALMCOL, true));
    WD.drawHoop(c, 150, -14, .9);
  } },
  lot: { lot: true, ground: '#8A8A86', draw(t){
    const c = WD.ctx;
    c.save(); c.translate(0, -16); WD.drawShed(c, -110, t); c.restore();
    WD.drawFence(c, -400, 400, -14, 60);
    [-240, 230].forEach((x, i) => WD.drawPalm(c, x, -14, 150 + i * 12, (i - .5) * .12, t, i + 3, WD.PALMCOL, true));
  } }
};
WD.drawClubhouseBack = function(c, t){
  c.save(); c.translate(0, -16); WD.drawClubhouse(c, -150, t); c.restore();
  [-210, -170, 150, 196].forEach((x, i) => WD.drawPalm(c, x, -14, 150 + i * 8, (i - 1.5) * .06, t, i, WD.PALMCOL, true));
};
const SCENE = { mode: 'battle' };
SCENE.draw = function(t, dt){
  if(!B) return;
  const v = WD.view, ctx = WD.ctx; B.t += dt;
  [B.p, B.a].concat(B.foes.map(f => f.e)).forEach(e => e && WD.tickEnt(e, dt));
  const k0 = Math.min(v.h / 300, v.w / 330), k = v.dpr * k0;
  const shx = B.shake ? (Math.random() - .5) * B.shake * v.dpr : 0; B.shake = Math.max(0, B.shake - dt * 40);
  const fx = v.dpr * v.w / 2 + shx, fy = v.dpr * v.h * .64, W2 = v.w / k0 / 2 + 10;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1D1830'; ctx.fillRect(0, 0, WD.cv.width, WD.cv.height);
  ctx.setTransform(k, 0, 0, k, fx, fy);
  const BK = BACKS[B.opts.back] || BACKS.walk, lot = !!BK.lot;
  const g = ctx.createLinearGradient(0, -260, 0, -20); g.addColorStop(0, '#4F84D8'); g.addColorStop(.7, lot ? '#B9CDE6' : '#A9CDEF'); g.addColorStop(1, lot ? '#FFCF9A' : '#FFD9A8'); ctx.fillStyle = g; ctx.fillRect(-W2, -1200, W2 * 2, 1190);
  ctx.fillStyle = 'rgba(255,246,214,.9)'; ell(ctx, 130, -170, 22, 22); ctx.fill();
  WD.cloud(ctx, -150, -190, .7); WD.cloud(ctx, 60, -215, .5);
  BK.draw(t, W2);
  ctx.setTransform(k, 0, 0, k, fx, fy);
  ctx.fillStyle = BK.ground || '#6DB24E'; ctx.fillRect(-W2, -20, W2 * 2, 20);
  const fg = ctx.createLinearGradient(0, -14, 0, 70); fg.addColorStop(0, BK.stage ? BK.stage[0] : '#B07A48'); fg.addColorStop(1, BK.stage ? BK.stage[1] : '#7A4D2B'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-W2 + 30, -14); ctx.lineTo(W2 - 30, -14); ctx.lineTo(W2 + 40, 900); ctx.lineTo(-W2 - 40, 900); ctx.fill();
  ctx.strokeStyle = 'rgba(60,34,18,.35)'; ctx.lineWidth = 1; for(let y = -6; y < 900; y += 9 + Math.max(0, y) * .08){ ctx.beginPath(); ctx.moveTo(-W2 - 40, y); ctx.lineTo(W2 + 40, y); ctx.stroke(); }
  for(let x = -W2 * 1.4; x < W2 * 1.4; x += 40){ ctx.beginPath(); ctx.moveTo(x * .82, -14); ctx.lineTo(x * 4, 900); ctx.stroke(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const L0 = live()[0]; [[B.p.x, -W2 + 40], [L0 ? L0.e.x : 100, W2 - 40]].forEach(([x, sx]) => { const sg = ctx.createLinearGradient(sx, -260, x, 0); sg.addColorStop(0, 'rgba(255,240,200,.18)'); sg.addColorStop(1, 'rgba(255,240,200,.05)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(sx - 6, -260); ctx.lineTo(x - 40, 6); ctx.lineTo(x + 40, 6); ctx.lineTo(sx + 6, -260); ctx.fill(); ctx.fillStyle = 'rgba(255,236,190,.16)'; ell(ctx, x, 4, 44, 9); ctx.fill(); });
  ctx.restore();
  // red glow: this attack can't be Superguarded / a charged attack is coming
  B.foes.forEach(f => { if(!f.alive || !f.e.glow) return; const pu = .55 + Math.sin(t * 10) * .25; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(f.e.x, -40, 4, f.e.x, -40, 70); rg.addColorStop(0, `rgba(255,70,50,${.42 * pu})`); rg.addColorStop(1, 'rgba(255,70,50,0)'); ctx.fillStyle = rg; ctx.fillRect(f.e.x - 80, -130, 160, 150); ctx.restore(); ctx.fillStyle = `rgba(232,60,48,${.5 + pu * .4})`; ell(ctx, f.e.x, 4, 34, 7); ctx.fill(); });
  B.foes.forEach(f => { if(f.alive && f.air) f.e.z = (f.def.hover || 46) + Math.sin(t * 3 + f.idx) * 6; });
  if(B.assist) B.assist.forEach(e => WD.tickEnt(e, dt));
  // characters
  const ents = [B.p, B.a].concat(B.foes.map(f => f.e), B.assist || []).filter(e => e && e.vis !== false).sort((a, b) => a.y - b.y);
  ents.forEach(e => WD.paintEnt(e, fx + e.x * k, fy + e.y * k, k * 1.25));
  ctx.setTransform(k, 0, 0, k, fx, fy);
  // dizzy stars
  B.foes.forEach(f => { if(!f.alive || !f.dizzy) return; for(let i = 0; i < 3; i++){ const a = t * 4 + i * 2.1; ctx.fillStyle = '#FFC94A'; star(ctx, f.e.x + Math.cos(a) * 12, -WD.headOf(f.e) * 1.25 - 6 + Math.sin(a) * 4, 3.4); } });
  if(B.focusT > 0){ ctx.fillStyle = 'rgba(255,201,74,.9)'; ctx.font = '900 10px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('FOCUS', B.p.x, -152); }
  [['p', B.p], ['a', B.a]].forEach(([k, e]) => { if(e && B.detain[k] > 0){ ctx.fillStyle = '#B39CE0'; ctx.font = '900 9px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('DETENTION', e.x, k === 'p' ? -140 : -66); } });
  B.foes.forEach(f => { if(f.alive && f.brace){ ctx.fillStyle = '#58AEDD'; ctx.font = '900 9px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('BRACED', f.e.x, -WD.headOf(f.e) * 1.25 - 16); } if(f.alive && f.def.def){ ctx.fillStyle = 'rgba(185,188,194,.95)'; ctx.font = '900 8px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('ARMOUR ' + f.def.def, f.e.x, 16); } });
  if(B.streak >= 2){ ctx.fillStyle = 'rgba(255,201,74,.9)'; ctx.font = '900 9px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('STREAK ×' + B.streak, B.p.x, -160); }
  if(B.wind > 0){ ctx.strokeStyle = `rgba(230,240,255,${.6 * Math.sin(B.wind * Math.PI)})`; ctx.lineWidth = 2; for(let i = 0; i < 9; i++){ const y = -150 + i * 18, x = W2 - (B.wind * 1.4 + i * .07) % 1 * W2 * 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 40, y - 8, x - 90, y); ctx.stroke(); } }
  if(B.snatched && B.a){ const cf = B.foes.find(f => f.id === 'condor'); if(cf && cf.alive){ B.a.x = cf.e.x - 6; B.a.z = cf.e.z - 22; B.a.rot = Math.sin(t * 6) * .2; } }
  if(B.atkUp > 0){ ctx.fillStyle = 'rgba(255,201,74,.85)'; ctx.font = '900 10px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('ATK ↑', B.p.x, -142); }
  // projectiles
  B.proj.forEach(pr => { const u = pr.u, x = lerp(pr.x0, pr.x1, u), y = lerp(pr.y0, pr.y1, u) - Math.sin(u * Math.PI) * 50; ctx.save(); ctx.translate(x, y); if(pr.red){ ctx.fillStyle = 'rgba(255,70,50,.45)'; ell(ctx, 0, 0, 14 + Math.sin(t * 20) * 2, 14); ctx.fill(); } ctx.rotate(u * 14);
    if(WD.PROJ && WD.PROJ[pr.kind]) WD.PROJ[pr.kind](ctx, t);
    else if(pr.kind === 'hairball'){ ctx.fillStyle = '#C06A22'; ell(ctx, 0, 0, 7, 6); ctx.fill(); ctx.strokeStyle = '#E58E3A'; ctx.lineWidth = 1.2; for(let i = 0; i < 6; i++){ const a = i; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 8); ctx.stroke(); } }
    else { ctx.fillStyle = '#121114'; rr(ctx, -9, -3, 8, 5.6, 2); ctx.fill(); rr(ctx, 1, -3, 8, 5.6, 2); ctx.fill(); ctx.fillRect(-2, -2, 4, 1.2); }
    ctx.restore(); });
  // taxi
  if(B.taxi){ ctx.save(); ctx.translate(B.taxi.x, -6); ctx.scale(3, 3); WD.drawIcon(ctx, 'taxi', 0, 0, 1, t); ctx.restore(); }
  // fx
  B.fx = B.fx.filter(p => (p.t -= dt) > 0); B.fx.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; ctx.globalAlpha = Math.min(1, p.t * 2); ctx.fillStyle = p.c; if(p.star) star(ctx, p.x, p.y, p.s * 1.3); else ctx.fillRect(p.x, p.y, p.s, p.s * 1.6); });
  ctx.globalAlpha = 1;
  B.texts = B.texts.filter(s => (s.t += dt) < 1.3); B.texts.forEach(s => { const a = s.t < .15 ? s.t / .15 : 1 - Math.max(0, s.t - .9) / .4, sc = s.big === 'huge' ? 1.6 : s.big ? 1.15 : .9, pop = 1 + Math.max(0, .25 - s.t) * 2;
    ctx.save(); ctx.translate(s.x, s.y - s.t * 18); ctx.scale(sc * pop, sc * pop); ctx.globalAlpha = Math.max(0, a); ctx.font = '900 16px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#2B1D14'; ctx.strokeText(s.s, 0, 0); ctx.lineWidth = 3; ctx.strokeStyle = '#FFF8EC'; ctx.strokeText(s.s, 0, 0); ctx.fillStyle = s.col; ctx.fillText(s.s, 0, 0); ctx.restore(); });
  ctx.globalAlpha = 1;
  drawCmd(t, v, k0);
  // phone call card
  if(B.call){ B.call.t += dt; const u = Math.min(1, B.call.t * 4); ctx.save(); ctx.translate(0, -150 + (1 - u) * -40); ctx.globalAlpha = u; ctx.fillStyle = '#2B1D14'; rr(ctx, -46, -40, 92, 74, 14); ctx.fill(); ctx.fillStyle = '#E6F2FF'; rr(ctx, -42, -36, 84, 66, 11); ctx.fill(); WD.drawIcon(ctx, B.call.icon, 0, -8, 1.3, t); ctx.fillStyle = '#2B1D14'; ctx.font = '900 10px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText(B.call.name, 0, 22); const r = Math.sin(t * 20) * 2; ctx.fillStyle = '#7CD86A'; ell(ctx, 34 + r, -30, 5, 5); ctx.fill(); ctx.restore(); }
  // crowd
  B.cheer = Math.max(0, B.cheer - dt * .8);
  ctx.setTransform(k, 0, 0, k, fx, fy);
  const cy0 = v.h / k0 * (1 - .64) - 6;
  B.crowd.forEach(m => { const x = m.x * W2, jump = B.cheer > 0 ? Math.abs(Math.sin(t * 9 + m.p)) * 10 * Math.min(1, B.cheer) : Math.sin(t * 2 + m.p) * 1.2, y = cy0 - jump;
    ctx.fillStyle = shade(m.c, -.35); ell(ctx, x, y - 2, 18 * m.h, 22 * m.h); ctx.fill(); ctx.fillStyle = shade(m.c, -.5); ell(ctx, x, y - 34 * m.h, 11 * m.h, 12 * m.h); ctx.fill();
    if(m.cap){ ctx.fillStyle = m.cap; ctx.beginPath(); ctx.arc(x, y - 37 * m.h, 11.5 * m.h, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 22 * m.h, y - 38 * m.h, 12 * m.h, 3 * m.h); }
    if(B.cheer > .3){ ctx.strokeStyle = shade(m.c, -.35); ctx.lineWidth = 5 * m.h; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 12 * m.h, y - 18 * m.h); ctx.lineTo(x - 18 * m.h, y - 46 * m.h); ctx.moveTo(x + 12 * m.h, y - 18 * m.h); ctx.lineTo(x + 18 * m.h, y - 46 * m.h - Math.sin(t * 9 + m.p) * 4); ctx.stroke(); } });
  // curtains + valance
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  const cw = v.w / 2 * (1 - ease(B.curtain) * .86);
  drawCurtain(0, cw, false); drawCurtain(v.w - cw, cw, true);
  const vh = Math.max(46, v.h * .12); const vg = ctx.createLinearGradient(0, 0, 0, vh); vg.addColorStop(0, '#7A1426'); vg.addColorStop(1, '#B3243A'); ctx.fillStyle = vg; ctx.fillRect(0, 0, v.w, vh * .7);
  for(let x = 0; x < v.w; x += 46){ ctx.fillStyle = '#B3243A'; ctx.beginPath(); ctx.arc(x + 23, vh * .7, 23, 0, Math.PI); ctx.fill(); ctx.strokeStyle = '#E8B84A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 23, vh * .7, 20, .1, Math.PI - .1); ctx.stroke(); }
  ctx.fillStyle = '#E8B84A'; ctx.fillRect(0, vh * .7 - 4, v.w, 4);
};
function drawCurtain(x, w, right){ const ctx = WD.ctx, v = WD.view; if(w < 1) return; const g = ctx.createLinearGradient(x, 0, x + w, 0); const folds = Math.max(3, Math.round(w / 40)); for(let i = 0; i <= folds; i++) g.addColorStop(i / folds, i % 2 ? '#8E1A2E' : '#C42D46'); ctx.fillStyle = g; ctx.fillRect(x, 0, w, v.h); const ex = right ? x : x + w; ctx.fillStyle = '#E8B84A'; ctx.fillRect(ex - 2, 0, 4, v.h); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(right ? x - 10 : x + w, 0, 10, v.h); }
function drawCmd(t, v, k0){
  const c = cmd, ctx = WD.ctx; if(!c || !c.show) return;
  const leftEdge = -(v.w / k0) / 2 + 26;
  if(c.kind === 'hold'){ const x = Math.max(B.p.x - 30, leftEdge), y = -138; ctx.fillStyle = '#2B1D14'; rr(ctx, x - 3, y - 3, 66, 14, 7); ctx.fill(); ctx.fillStyle = '#FFF8EC'; rr(ctx, x, y, 60, 8, 4); ctx.fill(); ctx.fillStyle = '#7CD86A'; ctx.fillRect(x + 60 * .66, y, 60 * .29, 8); ctx.fillStyle = '#FFC94A'; ctx.fillRect(x + 60 * .78, y, 60 * .1, 8); ctx.fillStyle = '#E8593C'; ctx.fillRect(x, y, 60 * Math.min(1, c.v), 8);
    ctx.font = '900 11px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#2B1D14'; const s = c.holding ? 'Let go in the green!' : 'Hold A'; ctx.strokeText(s, x + 30, y - 8); ctx.fillStyle = '#FFF8EC'; ctx.fillText(s, x + 30, y - 8); }
  if(c.kind === 'ring'){ const x = c.x || 0, y = c.y || -36, rad = 46 * (1 - c.u); ctx.lineWidth = 3; ctx.strokeStyle = '#FFF8EC'; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.stroke(); ctx.strokeStyle = '#FFC94A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, Math.max(1, rad), 0, 7); ctx.stroke(); ctx.font = '900 11px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#2B1D14'; ctx.strokeText('Tap A!', x, y - 54); ctx.fillStyle = '#FFF8EC'; ctx.fillText('Tap A!', x, y - 54); }
  if(c.kind === 'mash'){ const x = Math.max((B.a ? B.a.x : B.p.x) - 30, leftEdge), y = -100; ctx.fillStyle = '#2B1D14'; rr(ctx, x - 3, y - 3, 66, 14, 7); ctx.fill(); ctx.fillStyle = '#FFF8EC'; rr(ctx, x, y, 60, 8, 4); ctx.fill(); ctx.fillStyle = '#58AEDD'; ctx.fillRect(x, y, 60 * Math.min(1, c.n / 18), 8); ctx.font = '900 11px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#2B1D14'; ctx.strokeText('Mash A!', x + 30, y - 8); ctx.fillStyle = '#FFF8EC'; ctx.fillText('Mash A!', x + 30, y - 8); ctx.fillStyle = '#FFC94A'; ctx.fillText(Math.max(0, Math.ceil((1 - c.u) * c.secs)) + 's', x + 72, y + 7); }
}
})();
