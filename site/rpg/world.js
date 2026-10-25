/* =============================================================
   Where's Dayla? — world
   Areas, walking around, your partner following you, things to examine,
   field skills, enemies on the map, and the bag / Missing Dog poster.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { clamp, lerp, ell, rr, esc } = WD.U;

WD.areas = {};
WD.defineArea = (id, def) => { def.id = id; WD.areas[id] = Object.assign({ minX: 100, maxX: 1800, laneTop: 44, laneBot: 92, camZ: 1.12, light: 'day' }, def); };
const W = WD.W = { area: null, player: null, partner: null, npcs: [], foes: [], fx: [], dash: 0, flash: 0, sniffT: 0 };
const HEAD = WD.HEAD = { human: 100, dog: 62, chi: 58, cat: 74, iguana: 36, coat: 112, bull: 54 };
WD.headOf = e => (HEAD[e.kind] || 80) * (e.kind === 'cat' && e.look ? (e.look.size || 1) : 1) * (e.look && e.look.height || 1);

/* ================= items ================= */
WD.ITEMS = {
  arepa: { name: 'Leftover Arepa', icon: 'arepa', desc: 'From the fridge. Heals 5 HP.', hp: 5 },
  jerky: { name: 'Veci’s Deer Jerky', icon: 'jerky', desc: 'Homemade, from Georgia. Heals 3 HP for you and your partner.', hp: 3, php: 3 },
  cafe: { name: 'Café con Leche', icon: 'cafe', desc: 'Strong and sweet. Restores 3 SP.', sp: 3 },
  plate: { name: 'Mami Elsa’s Plate', icon: 'plate', desc: 'Rice, beans, arepa, plantain. Heals everyone fully.', hp: 99, php: 99 },
  choc: { name: 'Olga’s Dark Chocolate', icon: 'choc', desc: 'The good kind. Heals 3 HP and restores 2 SP.', hp: 3, sp: 2 }
};
WD.KEYS = {
  duck: { name: 'Dayla’s Yellow Duck', icon: 'duck', desc: 'Her favourite thing in the whole world. Left behind by the bowl. You’re keeping it safe until she’s home.' },
  glove: { name: 'Dropped Glove', icon: 'glove', desc: 'One brown leather glove, very small for such a tall stranger. It smells like… dog?' },
  print: { name: 'Muddy Boot Print', icon: 'print', desc: 'A boot print by the patio door, with a tiny paw print right in the middle of it.' }
};
WD.useItem = function(id, inBattle){
  const G = WD.G, it = WD.ITEMS[id]; if(!it || !(G.items[id] > 0)) return null;
  G.items[id]--; if(!G.items[id]) delete G.items[id];
  const out = { hp: 0, php: 0, sp: 0 };
  if(it.hp){ const b = G.hp; G.hp = Math.min(G.mhp, G.hp + it.hp); out.hp = G.hp - b; }
  if(it.php && G.partner){ const P = G.party[G.partner]; if(P){ const b = P.hp; P.hp = Math.min(P.mhp, Math.max(P.hp, 0) + it.php); out.php = P.hp - b; } }
  if(it.sp){ const b = G.sp; G.sp = Math.min(G.msp, G.sp + it.sp); out.sp = G.sp - b; }
  return out;
};
WD.giveItem = (id, n) => { const G = WD.G; G.items[id] = (G.items[id] || 0) + (n || 1); };
WD.hasKey = k => WD.G.key.includes(k);
WD.giveKey = k => { if(!WD.G.key.includes(k)) WD.G.key.push(k); };
WD.pingBag = () => { const b = WD.$('.wd-bag'); if(b) b.classList.add('ping'); };

/* ================= area changes ================= */
WD.gotoArea = function(id, x, y, opts){
  opts = opts || {};
  const go = () => {
    const A = WD.areas[id]; W.area = A; WD.G.area = id;
    const p = W.player; p.x = x; p.y = y === undefined ? (A.laneTop + A.laneBot) / 2 : y; p.dir = opts.dir || p.dir || 1; p.goal = null; p.z = 0; p.move = 0;
    if(W.partner){ W.partner.x = p.x - p.dir * 30; W.partner.y = p.y + 6; W.partner.dir = p.dir; W.partner.goal = null; W.partner.pinned = false; W.partner.sit = false; }
    W.npcs = A.npcs ? A.npcs() : []; W.foes = A.foes ? A.foes() : []; W.fx = [];
    WD.actors = {}; WD.actors[WD.hero] = p; if(W.partner) WD.actors[W.partner.name] = W.partner;
    W.npcs.forEach(n => { if(n.name) WD.actors[n.name] = n; });
    WD.light = A.light; WD.cam.lock = false; WD.cam.z = A.camZ; WD.cam.x = camTarget(); WD.cam.y = 66;
    WD.MUS.play(A.music);
    // stay in 'cutscene' until the area's own intro (if any) has had its chance to run
    WD.setScene(EXPLORE, 'cutscene'); WD.showControls(false); WD.showGoal(false);
    if(WD.updateGoal) WD.updateGoal();
    if(!opts.quiet) WD.showArea(A.name, A.sub);
    WD.saveNow();
  };
  const after = async () => {
    try{ if(W.area.enter) await W.area.enter(opts.from); }catch(e){ console.error(e); }
    if(!opts.cut && WD.mode === 'cutscene' && !WD.inCut()){ WD.mode = 'explore'; WD.letter = 0; WD.showControls(true); WD.showGoal(true); }
  };
  if(opts.instant){ go(); return after(); }
  WD.mode = 'cutscene'; WD.showControls(false);
  return WD.pageTurn(go).then(after);
};
function viewHalf(){ return WD.view.w / (2 * WD.view.S * WD.cam.z); }
function camTarget(){
  const A = W.area, p = W.player, half = viewHalf();
  let tx = p.x + p.dir * 30;
  const lo = (A.camMin !== undefined ? A.camMin : A.minX - 60) + half, hi = (A.camMax !== undefined ? A.camMax : A.maxX + 60) - half;
  return lo > hi ? (lo + hi) / 2 : clamp(tx, lo, hi);
}
WD.camTarget = camTarget;

/* ================= partners ================= */
WD.PARTNERS = {
  alejandro: { name: 'Alejandro', kind: 'chi', hp: 8, skill: { icon: '🐾', label: 'Sniff' }, note: 'Long-body chihuahua. Dayla’s friend. A little nervous.',
    moves: [['Long-Body Spin', 'Tap A ×3'], ['Nervous Yap', 'Mash A']], extra: [['Sniff', 'enemy info']], field: ['🐾 Sniff', 'clues & buried things'], ko: 'Too scared to fight!' },
  chunkers: { name: 'Chunkers', kind: 'bull', hp: 10, skill: { icon: '💪', label: 'Push' }, note: 'English bulldog, one tooth out. You’ve babysat him. So obedient he’ll sit on a switch all day.',
    moves: [['Bulldog Bash', 'Hold A'], ['Good Boy Guard', 'shields you']], extra: [], field: ['💪 Push & Sit', 'move heavy things, hold switches'], ko: 'Lay down for a nap!' }
};
WD.partnerId = () => WD.G && WD.G.partner;
WD.partnerDef = id => WD.PARTNERS[id || (WD.G && WD.G.partner)] || null;
WD.makePartner = id => { const d = WD.partnerDef(id || (WD.G && WD.G.partner) || 'alejandro'); return WD.makeEnt({ kind: d.kind, name: d.name, dir: 1 }); };
WD.addPartner = id => { const G = WD.G, d = WD.PARTNERS[id]; if(!G.party[id]) G.party[id] = { hp: d.hp + Math.max(0, G.lv - 1) * 2, mhp: d.hp + Math.max(0, G.lv - 1) * 2 }; };
/* swap who walks beside you (free, any time you're exploring) */
WD.swapPartner = function(id){
  const G = WD.G; if(!G.party[id] || G.partner === id) return;
  const old = W.partner; G.partner = id;
  const n = WD.makePartner(id); n.follow = true;
  if(old){ n.x = old.x; n.y = old.y; n.dir = old.dir; delete WD.actors[old.name]; }
  else if(W.player){ n.x = W.player.x - W.player.dir * 30; n.y = W.player.y + 6; }
  W.partner = n; WD.actors[n.name] = n; WD.emote(n, 'heart', 1.2);
  if(WD.mode === 'explore') WD.showControls(true);
};

/* ================= skills ================= */
WD.heroSkill = () => WD.asDayla ? { icon: '💕', label: 'Love Attack' } : WD.hero === 'David' ? { icon: '🏀', label: 'Dash' } : { icon: '🔦', label: 'Light' };
WD.partnerSkill = () => W.partner && !WD.asDayla ? WD.partnerDef().skill : null;
const whoOf = o => o.who || 'alejandro';

/* ================= interactables ================= */
function things(){ const A = W.area; return (A.things ? A.things() : []).filter(o => o && (!o.show || o.show())); }
function nearestThing(skill){
  const p = W.player; let best = null, bd = 1e9;
  things().forEach(o => { if((o.skill || 'a') !== skill) return; if(skill === 'p' && whoOf(o) !== WD.G.partner) return; const d = Math.hypot(o.x - p.x, (o.y - p.y) * 1.6); const r = o.r || 52; if(d < r && d < bd){ bd = d; best = o; } });
  if(skill === 'a') W.npcs.forEach(n => { if(!n.vis || !n.talkTo || n.hidden) return; const d = Math.hypot(n.x - p.x, (n.y - p.y) * 1.6); if(d < 58 && d < bd){ bd = d; best = { x: n.x, y: n.y, label: n.label || 'Talk', act: n.talkTo, ent: n }; } });
  return best;
}
WD.nearestThing = nearestThing;
function nearFoe(r){ const p = W.player; return W.foes.find(f => !f.dead && f.vis && Math.abs(f.x - p.x) < r && Math.abs(f.y - p.y) < 22); }

/* ================= explore scene ================= */
const EXPLORE = WD.EXPLORE = { mode: 'explore' };
EXPLORE.onA = function(){
  if(WD.mode !== 'explore') return;
  const it = nearestThing('a');
  if(it){ WD.sfx('tap'); if(it.ent) faceTalk(it.ent); it.act(); return; }
  const f = nearFoe(46); if(f){ firstStrike(f, 'stomp'); return; }
};
function faceTalk(n){ const p = W.player; p.dir = n.x > p.x ? 1 : -1; if(n.faceable !== false) n.dir = p.x > n.x ? 1 : -1; }
EXPLORE.onB = function(){
  if(WD.mode !== 'explore') return;
  const it = nearestThing('b'); if(it){ it.act(); return; }
  if(WD.asDayla){ const p = W.player; p.z = 0; WD.hop(p, p.x + p.dir * 34, p.y, 16, 360); WD.sfx('bark'); return; }
  if(WD.hero === 'David'){ W.dash = .5; WD.sfx('dash'); for(let i = 0; i < 6; i++) W.fx.push({ x: W.player.x - W.player.dir * 6, y: W.player.y, vx: -W.player.dir * (20 + Math.random() * 40), vy: -Math.random() * 20, t: .5, dust: true }); }
  else { W.flash = .9; WD.sfx('light'); const p = W.player; const hid = things().find(o => o.hidden === 'light' && !o.revealed() && Math.abs(o.x - p.x) < 140); if(hid){ hid.reveal(); } const f = nearFoe(90); if(f && Math.sign(f.x - p.x) === p.dir) setTimeout(() => { if(WD.mode === 'explore') firstStrike(f, 'flash'); }, 250); }
};
EXPLORE.onP = function(){
  if(WD.mode !== 'explore' || !W.partner) return;
  const it = nearestThing('p'); const a = W.partner;
  if(it){ it.act(); return; }
  const p = W.player, other = things().find(o => o.skill === 'p' && whoOf(o) !== WD.G.partner && Math.hypot(o.x - p.x, (o.y - p.y) * 1.6) < (o.r || 52));
  if(other){ const d = WD.PARTNERS[whoOf(other)]; WD.toast(WD.G.party[whoOf(other)] ? `${d.name} could ${d.skill.label.toLowerCase()} here. Switch partners in the bag (Party tab).` : 'Hmm. Somebody else could help with this.'); return; }
  if(WD.G.partner === 'chunkers'){ a.sit = true; WD.sfx('gulp'); setTimeout(() => { a.sit = false; }, 1200); WD.toast('Chunkers sits. Good boy. Nothing heavy to push right here.'); return; }
  a.sniff = true; W.sniffT = 1.1; WD.sfx('sniff');
  const spot = things().filter(o => o.skill === 'p' && !o.decoy && whoOf(o) === 'alejandro').sort((x, y) => Math.abs(x.x - p.x) - Math.abs(y.x - p.x))[0];
  setTimeout(() => { a.sniff = false; if(WD.mode !== 'explore') return; if(spot && Math.abs(spot.x - p.x) < 600){ WD.emote(a, '!'); WD.toast(`Alejandro’s nose twitches. Something smells interesting ${spot.x > p.x ? 'that way →' : '← that way'}.`); } else WD.toast(W.area && W.area.sniffNothing || 'Alejandro sniffs… grass, sunscreen, and a little bit of iguana.'); }, 1000);
};
EXPLORE.onMenu = () => { if(WD.mode === 'explore') WD.openBag(); };
async function firstStrike(f, how){
  if(WD.mode !== 'explore') return;
  WD.mode = 'cutscene'; WD.showControls(false);
  const p = W.player;
  if(how === 'stomp'){ p.dir = f.x > p.x ? 1 : -1; await WD.hop(p, f.x - p.dir * 10, f.y, 30, 380); f.hurt = .3; WD.sfx('hit'); WD.shake(5); }
  else if(how === 'dash'){ f.hurt = .3; WD.sfx('hit'); WD.shake(5); }
  else if(how === 'flash'){ WD.emote(f, '?'); await WD.wait(300); }
  await startFoeBattle(f, how);
}
async function startFoeBattle(f, first){
  WD.mode = 'cutscene'; WD.showControls(false);
  const res = await WD.battle({ foes: f.party, first: first || null, back: W.area.battleBack, music: f.music, xpBonus: f.xp });
  if(res === 'win'){ f.dead = true; f.vis = false; if(f.fid){ WD.set('beat_' + f.fid); WD.saveNow(); } if(f.onWin) await f.onWin(); }
  else if(res === 'retreat'){ const p = W.player; p.x = clamp(p.x - Math.sign(f.x - p.x || 1) * 90, W.area.minX, W.area.maxX); f.cool = 2.5; }
}
WD.startFoeBattle = startFoeBattle;

EXPLORE.update = function(dt){
  const A = W.area, p = W.player, a = W.partner;
  if(!A) return;
  const free = WD.mode === 'explore' && !WD.paused;
  let st = free ? WD.stick() : { x: 0, y: 0, L: 0 };
  W.dash = Math.max(0, W.dash - dt); W.flash = Math.max(0, W.flash - dt);
  const spd = W.dash > 0 ? 230 : 104;
  if(free){
    let nx = clamp(p.x + st.x * spd * dt, A.minX, A.maxX), ny = clamp(p.y + st.y * 58 * dt, A.laneTop, A.laneBot);
    if(A.limit) nx = A.limit(nx, p.x, ny);
    if(W.dash > 0 && Math.abs(st.x) < .1) nx = clamp(p.x + p.dir * spd * dt * .8, A.minX, A.maxX);
    if(A.limit) nx = A.limit(nx, p.x, ny);
    p.x = nx; p.y = ny;
    const L = W.dash > 0 ? 1 : st.L; p.move = lerp(p.move, Math.min(1, L), Math.min(1, dt * 10)); if(Math.abs(st.x) > .15) p.dir = st.x > 0 ? 1 : -1;
    if(W.dash > 0 && Math.random() < .5) W.fx.push({ x: p.x - p.dir * 8, y: p.y, vx: -p.dir * 30, vy: -10, t: .4, dust: true });
    if(st.L > .2 && Math.random() < dt * 3) WD.sfx('step');
    // edges
    if(A.exits){
      if(A.exits.left && p.x <= A.minX + .5 && st.x < -.3){ const ex = A.exits.left; if(!ex.when || ex.when()) { WD.gotoArea(ex.to, ex.x, ex.y === undefined ? p.y : ex.y, { dir: -1, from: A.id }); return; } else if(ex.blocked && !W.blockT){ W.blockT = 1.6; ex.blocked(); } }
      if(A.exits.right && p.x >= A.maxX - .5 && st.x > .3){ const ex = A.exits.right; if(!ex.when || ex.when()) { WD.gotoArea(ex.to, ex.x, ex.y === undefined ? p.y : ex.y, { dir: 1, from: A.id }); return; } else if(ex.blocked && !W.blockT){ W.blockT = 1.6; ex.blocked(); } }
    }
    W.blockT = Math.max(0, (W.blockT || 0) - dt);
  } else if(!p.goal) p.move = lerp(p.move, 0, Math.min(1, dt * 8));
  // partner follows
  if(a && !a.goal && !a.pinned){
    if(free || (WD.mode === 'cutscene' && a.follow)){ const tx = p.x - p.dir * 32, ty = p.y + 6; const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy); if(d > 6){ const sp = Math.min(W.dash > 0 ? 260 : 150, d * 3.4); a.x += dx / d * sp * dt; a.y += dy / d * sp * dt; a.move = Math.min(1, sp / 90); if(Math.abs(dx) > 3) a.dir = dx > 0 ? 1 : -1; } else { a.move = lerp(a.move, 0, dt * 8); a.dir = p.dir; } }
    else a.move = lerp(a.move, 0, dt * 6);
  }
  WD.tickGoals([p, a].concat(W.npcs, W.foes), dt);
  // enemies wander and chase
  W.foes.forEach(f => {
    if(f.dead || !f.vis) return;
    f.cool = Math.max(0, (f.cool || 0) - dt);
    if(free && !f.goal && !f.idle){
      const dx = p.x - f.x, dy = p.y - f.y, d = Math.hypot(dx, dy);
      if(d < (f.aggro || 120) && !f.cool){ f.x += Math.sign(dx) * (f.chase || 52) * dt; f.y += Math.sign(dy) * Math.min(Math.abs(dy), 30 * dt); f.move = 1; f.dir = dx > 0 ? 1 : -1; if(!f.saw){ f.saw = true; WD.emote(f, '!', 1); } }
      else if(f.patrol){ const [x0, x1] = f.patrol; if(f.pdir === undefined) f.pdir = 1; f.x += f.pdir * (f.speed || 26) * dt; f.dir = f.pdir; f.move = .7; if(f.x > x1) f.pdir = -1; if(f.x < x0) f.pdir = 1; if(d > 200) f.saw = false; }
      else f.move = lerp(f.move, 0, dt * 6);
      f.y = clamp(f.y, A.laneTop, A.laneBot);
      if(d < 22 && Math.abs(dy) < 14 && !f.cool){
        if(W.dash > 0) firstStrike(f, 'dash'); else startFoeBattle(f, null);
      }
    }
  });
  [p, a].concat(W.npcs, W.foes).forEach(e => e && WD.tickEnt(e, dt));
  if(A.update) A.update(dt);
  // camera
  if(!WD.cam.lock){ const tgt = camTarget(); WD.cam.x = lerp(WD.cam.x, tgt, Math.min(1, dt * 3)); WD.cam.z = lerp(WD.cam.z, A.camZ, dt * 2); }
  W.fx = W.fx.filter(f => (f.t -= dt) > 0); W.fx.forEach(f => { f.x += f.vx * dt; f.y += (f.vy || 0) * dt; });
};
EXPLORE.draw = function(t, dt){
  const A = W.area, ctx = WD.ctx; if(!A) return;
  A.drawBack(t, dt);
  WD.setLayer(1);
  if(A.drawGround) A.drawGround(t);
  // sparkles for things that want attention
  things().forEach(o => { if(o.sparkle) WD.sparkle(ctx, o.x + (o.sx || 0), o.y - (o.sy || 20), t + o.x); });
  const list = [W.player, W.partner].concat(W.npcs, W.foes).filter(e => e && e.vis && !e.dead).sort((a, b) => (a.y + (a.zSort || 0)) - (b.y + (b.zSort || 0)));
  list.forEach(e => { const ds = .9 + (e.y - 44) / 48 * .14; const [sx, sy] = WD.toScreen(e.x, e.y); WD.paintEnt(e, sx, sy, WD.view.dpr * WD.view.S * WD.cam.z * ds * e.scale); });
  WD.setLayer(1);
  W.fx.forEach(f => { if(f.dust){ ctx.fillStyle = `rgba(240,230,210,${f.t * 1.4})`; ell(ctx, f.x, f.y - 2, 3 + (1 - f.t) * 6, 2 + (1 - f.t) * 3); ctx.fill(); } });
  if(A.drawMid) A.drawMid(t);
  // flashlight cone
  if(W.flash > 0){ const p = W.player, u = W.flash / .9; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p.x + p.dir * 10, p.y - 50, 4, p.x + p.dir * 90, p.y - 30, 120); g.addColorStop(0, `rgba(255,248,210,${.5 * u})`); g.addColorStop(1, 'rgba(255,248,210,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p.x + p.dir * 8, p.y - 52); ctx.lineTo(p.x + p.dir * 170, p.y - 120); ctx.lineTo(p.x + p.dir * 170, p.y + 20); ctx.closePath(); ctx.fill(); ctx.restore(); }
  if(A.drawFront) A.drawFront(t);
  WD.drawVignette(A.light !== 'indoor');
  // emotes
  list.forEach(e => { if(!e.emote) return; const [sx, sy] = WD.toScreen(e.x, e.y - WD.headOf(e) - 14 - e.z); ctx.setTransform(WD.view.dpr * WD.view.S * WD.cam.z, 0, 0, WD.view.dpr * WD.view.S * WD.cam.z, sx, sy); WD.drawEmote(ctx, 0, 0, e.emote.kind, e.emote.t, 1); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // prompts
  if(WD.mode === 'explore'){
    const dpr = WD.view.dpr;
    const bubble = (o, letter, col, label, dx) => { const h = o.h || (o.ent ? WD.headOf(o.ent) + 4 : 64); const [sx0, sy] = WD.toScreen(o.x, o.y - h); const sx = sx0 + (dx || 0) * dpr; const b = Math.sin(t * 5) * 3 * dpr, r = 15 * dpr; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2B1D14'; ell(ctx, sx, sy + b, r + 3 * dpr, r + 3 * dpr); ctx.fill(); ctx.fillStyle = col; ell(ctx, sx, sy + b, r, r); ctx.fill(); ctx.fillStyle = letter === 'A' ? '#fff' : '#2B1D14'; ctx.font = `900 ${16 * dpr}px Grandstander, system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, sx, sy + b + dpr); ctx.font = `800 ${11 * dpr}px Nunito, system-ui`; ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(43,29,20,.75)'; ctx.strokeText(label, sx, sy + b + r + 12 * dpr); ctx.fillStyle = '#FFF8EC'; ctx.fillText(label, sx, sy + b + r + 12 * dpr); };
    const ia = nearestThing('a'), ib = nearestThing('b'), ip = W.partner ? nearestThing('p') : null;
    let off = 0; const n = [ia, ib, ip].filter(Boolean).length;
    if(n > 1) off = -22;
    if(ia){ bubble(ia, 'A', '#E8593C', ia.label || 'Look', off); off += 44; }
    if(ib){ bubble(ib, 'B', '#FFC94A', ib.label, off); off += 44; }
    if(ip){ bubble(ip, '🐾', '#9BD27A', ip.label || 'Sniff', off); }
  }
};

/* ================= collectibles: photos, clues, toys, pins ================= */
WD.PHOTOS = { uic: (c, x, y, s) => WD.sightingUIC(c, x, y, s) };
WD.CLUE_ICON = { duck: ['duck', 'Yellow duck'], print: ['print', 'Boot print'], glove: ['glove', 'Small glove'], cats: ['shades', 'Cat Agents'], sergeant: ['van', 'The van'], photo: ['photo', 'UIC photo'] };
WD.TOYS = { ball: { name: 'Tennis Ball', ch: 0, where: 'Tivoli Park' }, rope: { name: 'Rope Tug', ch: 0, where: 'Tivoli Park' }, bone: { name: 'Squeaky Bone', ch: 0, where: 'Tivoli Park' } };
WD.CH_NAMES = ['Tivoli Park', 'UIC'];
/* pins: worn in the Party tab, each costs PP */
WD.PINS = {
  pearl: { name: 'Pearl Pin', pp: 1, desc: 'A normal Guard blocks 1 extra damage.' },
  honor: { name: 'Honor Roll Pin', pp: 1, desc: 'NICE and PERFECT attacks give 1 extra Hype.' },
  eagle: { name: 'Eagle Ray Pin', pp: 2, desc: 'Your Jump Shot or Heel Stomp hits 1 harder.' }
};
WD.hasPin = id => !!(WD.G && WD.G.worn && WD.G.worn.includes(id));
WD.ppUsed = () => ((WD.G && WD.G.worn) || []).reduce((n, id) => n + (WD.PINS[id] ? WD.PINS[id].pp : 0), 0);
WD.givePin = id => { const G = WD.G; G.pins = G.pins || []; G.worn = G.worn || []; if(!G.pins.includes(id)) G.pins.push(id); if(WD.ppUsed() + WD.PINS[id].pp <= G.mpp && !G.worn.includes(id)) G.worn.push(id); };
WD.toyCount = ch => { const G = WD.G, ids = Object.keys(WD.TOYS).filter(k => ch === undefined || WD.TOYS[k].ch === ch); return [ids.filter(k => G.toys.includes(k)).length, ids.length]; };

/* ================= bag & poster ================= */
let bagTab = 'items'; const bagSel = { items: null, collect: null, poster: null, pins: null };
WD.openBag = function(tab){
  if(tab) bagTab = tab;
  const pn = WD.$('.wd-panel'); WD.paused = true; WD.panelOpen = true; WD.$('.wd-bag').classList.remove('ping');
  const G = WD.G;
  const tabs = [['items', 'Items'], ['poster', 'Missing Dog'], ['party', 'Party'], ['pins', 'Pins'], ['collect', 'Collection']];
  let body = '';
  // tiles on the left, details of the picked tile on the right: no long scrolling lists
  const tile = (key, icon, name, badge, dim) => `<button class="wd-tile ${bagSel[bagTab] === key ? 'on' : ''} ${dim ? 'dim' : ''}" data-sel="${key}">${icon ? `<canvas data-icon="${icon}" width="80" height="80"></canvas>` : '<span class="q">?</span>'}<b>${esc(name)}</b>${badge ? `<i>${esc(badge)}</i>` : ''}</button>`;
  const head = (t, sub) => `<div class="wd-th">${esc(t)}${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  const wrap = (tiles, det) => `<div class="wd-bagwrap"><div class="wd-tiles">${tiles}</div><div class="wd-detail">${det}</div></div>`;
  const detail = (icon, name, kind, text, extra) => `${icon ? `<canvas data-icon="${icon}" width="120" height="120"></canvas>` : ''}<i class="k">${esc(kind)}</i><b>${esc(name)}</b><p>${esc(text)}</p>${extra || ''}`;
  if(bagTab === 'items'){
    const ids = Object.keys(G.items).filter(k => G.items[k] > 0);
    const all = ids.map(id => 'i:' + id).concat(G.key.filter(k => WD.KEYS[k]).map(k => 'k:' + k));
    if(!all.includes(bagSel.items)) bagSel.items = all[0] || null;
    let tiles = head('Items', ids.length ? '' : 'none right now') + ids.map(id => tile('i:' + id, WD.ITEMS[id].icon, WD.ITEMS[id].name, '×' + G.items[id])).join('');
    tiles += head('Key items') + (G.key.length ? G.key.filter(k => WD.KEYS[k]).map(k => tile('k:' + k, WD.KEYS[k].icon, WD.KEYS[k].name)).join('') : '');
    let det = '<p class="fine">Nothing in your bag yet.</p>';
    const sel = bagSel.items;
    if(sel && sel[0] === 'i'){ const id = sel.slice(2), it = WD.ITEMS[id]; det = detail(it.icon, it.name, `Item · ×${G.items[id]}`, it.desc, `<button class="use" data-use="${id}">Use</button>`); }
    else if(sel){ const it = WD.KEYS[sel.slice(2)]; det = detail(it.icon, it.name, 'Key item', it.desc); }
    body += wrap(tiles, det);
  } else if(bagTab === 'poster'){
    const SLOT = ['Prologue', 'Ch 1', 'Ch 2', 'Ch 3', 'Ch 4', 'Ch 5', 'Ch 6', 'Ch 7', 'Ch 8'];
    const CM = WD.CLUE_ICON;
    const keys = SLOT.map((_, i) => 's:' + i).concat(G.clues.map(c => 'c:' + c));
    if(!keys.includes(bagSel.poster)) bagSel.poster = G.photos[0] ? 's:0' : (G.clues.length ? 'c:' + G.clues[0] : 's:0');
    let tiles = head('Sightings', `${G.photos.filter(Boolean).length}/9`) + SLOT.map((l, i) => { const ph = G.photos[i]; const S2 = ph && WD.SIGHTINGS && WD.SIGHTINGS[ph]; return ph ? `<button class="wd-tile photo ${bagSel.poster === 's:' + i ? 'on' : ''}" data-sel="s:${i}"><canvas data-photo="${ph}" width="96" height="96"></canvas><b>${esc(S2 ? S2.short : l)}</b></button>` : tile('s:' + i, null, l, '', true); }).join('');
    tiles += head('Clues', G.clues.length ? `${G.clues.length} found` : 'none yet') + G.clues.map(c => CM[c] ? tile('c:' + c, CM[c][0], CM[c][1]) : '').join('');
    const sel = bagSel.poster || ''; let det = '';
    if(sel[0] === 's'){ const i = +sel.slice(2), ph = G.photos[i], S2 = ph && WD.SIGHTINGS && WD.SIGHTINGS[ph]; det = ph ? `<canvas class="pic" data-photo="${ph}" width="240" height="240"></canvas><i class="k">${esc(SLOT[i])} sighting</i><b>${esc(S2 ? S2.title : 'Sighting')}</b><p>${esc(S2 ? S2.text : '')}</p>` : detail(null, 'Not found yet', SLOT[i] + ' sighting', 'Each chapter, find a photo of where Dayla was seen. It goes on the poster here.'); }
    else if(sel[0] === 'c'){ const c = sel.slice(2); det = detail(CM[c] ? CM[c][0] : null, CM[c] ? CM[c][1] : 'Clue', 'Clue', WD.CLUES[c] || ''); }
    body += `<div class="wd-postwrap"><div class="paper"><h2>MISSING</h2><div class="tag">Have you seen Dayla?</div><canvas data-dayla="1" width="300" height="300"></canvas><p>Boston terrier · brown &amp; white · pearl necklace · loves her yellow duck</p><p class="fine">Call David &amp; Laura · Tivoli Park</p></div><div class="wd-tiles">${tiles}</div><div class="wd-detail">${det}</div></div>`;
  } else if(bagTab === 'pins'){
    const pins = (G.pins || []).filter(id => WD.PINS[id]), used = WD.ppUsed();
    if(!pins.includes(bagSel.pins)) bagSel.pins = pins[0] || null;
    let tiles = head('Your pins', `${used}/${G.mpp} PP worn`) + (pins.length ? pins.map(id => tile(id, 'pin', WD.PINS[id].name, WD.hasPin(id) ? '●' : '', !WD.hasPin(id))).join('') : '');
    let det = '<p class="fine">No pins yet. People around UIC might have some.</p>';
    const id = bagSel.pins;
    if(id){ const P = WD.PINS[id], on = WD.hasPin(id), fits = on || used + P.pp <= G.mpp;
      det = detail('pin', P.name, `Pin · costs ${P.pp} PP · ${on ? 'wearing' : 'not wearing'}`, P.desc, `<p class="fine">PP free: ${G.mpp - used} of ${G.mpp}. Pick “PP +3” when you level up to wear more.</p><button class="use" data-pin="${id}" ${fits ? '' : 'disabled'}>${on ? 'Take off' : fits ? 'Wear it' : 'Not enough PP'}</button>`); }
    body += wrap(tiles, det);
  } else if(bagTab === 'party'){
    const D = WD.hero === 'David';
    const bar = (v, m, col) => `<span class="wd-bar"><i style="width:${Math.max(0, Math.min(100, v / m * 100))}%;background:${col}"></i></span>`;
    const chips = list => `<div class="wd-chips">${list.map(([n, h]) => `<span><b>${esc(n)}</b>${h ? `<i>${esc(h)}</i>` : ''}</span>`).join('')}</div>`;
    const moves = D ? [['Jump Shot', 'Hold A'], ['Crossover', 'Tap A']] : [['Heel Stomp', 'Hold A'], ['Purse Swing', 'Tap A']];
    const specials = [[D ? 'Alley-Oop' : 'Group FaceTime', '3 SP']].concat(G.learned.includes('Love Attack') ? [['Love Attack', '2 SP']] : []).concat(G.learned.includes('Breakfast Focus') ? [['Breakfast Focus', '3 SP']] : []);
    const calls = (D ? ['Steven', 'Joseph', 'Olga'] : ['Mami Elsa', 'Titin', 'Carolina']).map(n => [n, '']);
    const pins = G.pins || [], used = WD.ppUsed();
    const pinHtml = pins.length ? `<div class="wd-pins">${pins.map(id => { const P = WD.PINS[id]; if(!P) return ''; const on = WD.hasPin(id); return `<button class="wd-pin ${on ? 'on' : ''}" data-pin="${id}"><b>${on ? '● ' : '○ '}${esc(P.name)} <em>${P.pp} PP</em></b><small>${esc(P.desc)}</small></button>`; }).join('')}</div>` : `<p class="fine">No pins yet. People around UIC might have some.</p>`;
    body += `<div class="wd-partywrap">
      <div class="wd-pcard"><div class="top"><canvas data-portrait="hero" width="168" height="168"></canvas><div class="st"><b>${esc(WD.hero)} <small>Lv ${G.lv}</small></b>
        <span class="row"><em>HP</em>${bar(G.hp, G.mhp, '#5BC25A')}<small>${G.hp}/${G.mhp}</small></span>
        <span class="row"><em>SP</em><span class="stars">${'★'.repeat(G.sp)}${'☆'.repeat(Math.max(0, G.msp - G.sp))}</span></span>
        <span class="row"><em>XP</em>${bar(G.xp, 100, '#FFC94A')}<small>${G.xp}/100</small></span>
        <span class="row"><em>PP</em>${bar(G.mpp - used, G.mpp, '#58AEDD')}<small>${G.mpp - used}/${G.mpp} free</small></span></div></div>
        <div class="lbl">Moves</div>${chips(moves)}<div class="lbl">Specials</div>${chips(specials)}<div class="lbl">Pins</div><p class="fine">${(G.worn || []).length ? 'Wearing: ' + esc((G.worn || []).map(id => WD.PINS[id] ? WD.PINS[id].name : '').filter(Boolean).join(', ')) + '. ' : ''}See the Pins tab.</p><div class="lbl">Family Call · once per battle</div>${chips(calls)}<div class="lbl">Field skill</div>${chips([[D ? '🏀 Dribble-dash' : '🔦 Flashlight', D ? 'B · sprint, jump gaps' : 'B · light up secrets']])}</div>
      ${Object.keys(G.party).length ? Object.keys(G.party).map(id => { const P = G.party[id], d = WD.PARTNERS[id]; if(!d) return ''; const cur = G.partner === id;
        return `<div class="wd-pcard ${cur ? '' : 'off'}"><div class="top"><canvas data-portrait="p:${id}" width="168" height="168"></canvas><div class="st"><b>${esc(d.name)} <small>${cur ? 'with you now' : 'partner'}</small></b>
        <span class="row"><em>HP</em>${bar(Math.max(0, P.hp), P.mhp, '#5BC25A')}<small>${Math.max(0, P.hp)}/${P.mhp}</small></span><span class="note">${esc(d.note)}</span></div></div>
        <div class="lbl">Moves</div>${chips(d.moves.concat(d.extra))}<div class="lbl">Field skill</div>${chips([d.field])}${cur || WD.asDayla ? '' : `<button class="wd-swap" data-swap="${id}">Walk with ${esc(d.name)}</button>`}</div>`; }).join('')
      : `<div class="wd-pcard empty"><b>No partner yet</b><p class="fine">Someone in Tivoli Park wants to help.</p></div>`}</div>`;
  } else {
    const toys = Object.keys(WD.TOYS), TOY = k => WD.TOYS[k].name;
    const keys = toys.map(k => 't:' + k).concat(G.verses.map(v => 'v:' + v)).concat(WD.hero === 'David' ? G.words.map((w, i) => 'w:' + i) : []);
    if(!keys.includes(bagSel.collect)) bagSel.collect = keys.find(k => k[0] !== 't' || G.toys.includes(k.slice(2))) || keys[0];
    const [tf, tt] = WD.toyCount();
    let tiles = head('Dayla’s Lost Toys', `${tf}/${tt} found`) + toys.map(k => G.toys.includes(k) ? tile('t:' + k, k, TOY(k)) : tile('t:' + k, null, WD.CH_NAMES[WD.TOYS[k].ch] || 'Not found', '', true)).join('');
    tiles += head('Verse Stones', G.verses.length ? '' : 'none yet') + G.verses.map(v => { const V = WD.VERSES && WD.VERSES[v]; return V ? tile('v:' + v, 'verse', V.ref) : ''; }).join('');
    if(WD.hero === 'David') tiles += head('Spanish Words', G.words.length ? `${G.words.length} learned` : 'none yet') + G.words.map((w, i) => tile('w:' + i, 'word', w[0])).join('');
    const sel = bagSel.collect || ''; let det = '';
    if(sel[0] === 't'){ const k = sel.slice(2); det = G.toys.includes(k) ? detail(k, TOY(k), 'Dayla’s lost toy', 'Back in the bag, safe and slobbery. She’s going to be so happy.') : detail(null, 'Not found yet', 'Dayla’s lost toy', `Somewhere in ${WD.TOYS[k].where}. Try your partners’ skills, or your own skill in odd spots.`); }
    else if(sel[0] === 'v'){ const V = WD.VERSES[sel.slice(2)]; det = detail('verse', V.ref, 'Verse Stone · max SP +1', WD.hero === 'Laura' ? V.es : V.en, WD.hero === 'Laura' ? '' : `<p class="alt">${esc(V.es)}</p>`); }
    else if(sel[0] === 'w'){ const w = G.words[+sel.slice(2)]; det = detail('word', w[0], 'Spanish word', w[1]); }
    body += wrap(tiles, det);
  }
  pn.innerHTML = `<div class="wd-sheet"><div class="wd-tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${k === bagTab ? 'on' : ''}">${l}</button>`).join('')}<span class="sp"></span><button class="close" aria-label="Close">✕</button></div><div class="wd-pbody">${body}</div></div>`;
  pn.hidden = false;
  pn.querySelectorAll('canvas[data-icon]').forEach(cv => { const c = cv.getContext('2d'); c.setTransform(cv.width / 44, 0, 0, cv.width / 44, cv.width / 2, cv.height / 2); WD.drawIcon(c, cv.dataset.icon, 0, 0, cv.closest('.wd-tile,.wd-detail') ? 1.45 : .62, 1); });
  pn.querySelectorAll('canvas[data-photo]').forEach(cv => { const c = cv.getContext('2d'), f = WD.PHOTOS[cv.dataset.photo]; if(f) f(c, 0, 0, cv.width); });
  const dc = pn.querySelector('canvas[data-dayla]'); if(dc){ const c = dc.getContext('2d'); c.fillStyle = '#F3E6CF'; c.fillRect(0, 0, 300, 300); c.setTransform(4.5, 0, 0, 4.5, 125, 242); WD.drawPuppet(c, WD.makeEnt({ kind: 'dog', duck: true, happy: true, t: 1 })); }
  pn.querySelectorAll('canvas[data-portrait]').forEach(cv => { const k = cv.dataset.portrait; const e = k === 'hero' ? WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.hero], expr: 'happy', t: 1 }) : WD.makeEnt({ kind: WD.PARTNERS[k.slice(2)].kind, happy: true, t: 1 }); WD.drawPortraitOf(cv.getContext('2d'), e); });
  pn.querySelectorAll('[data-pin]').forEach(b => b.onclick = () => { const id = b.dataset.pin, P = WD.PINS[id]; G.worn = G.worn || []; if(G.worn.includes(id)){ G.worn = G.worn.filter(x => x !== id); WD.sfx('tap'); } else if(WD.ppUsed() + P.pp <= G.mpp){ G.worn.push(id); WD.sfx('get'); } else { WD.sfx('miss'); WD.toast(`Not enough PP. Take another pin off first.`); } WD.openBag(); });
  pn.querySelectorAll('[data-swap]').forEach(b => b.onclick = () => { WD.swapPartner(b.dataset.swap); WD.sfx('get'); WD.openBag(); });
  pn.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { WD.sfx('tap'); WD.openBag(b.dataset.tab); });
  pn.querySelectorAll('[data-sel]').forEach(b => b.onclick = () => { WD.sfx('tap'); bagSel[bagTab] = b.dataset.sel; const y = pn.querySelector('.wd-tiles').scrollTop; WD.openBag(); const t = pn.querySelector('.wd-tiles'); if(t) t.scrollTop = y; });
  pn.querySelectorAll('[data-use]').forEach(b => { const id = b.dataset.use, it = WD.ITEMS[id]; const P = G.partner && G.party[G.partner]; const useful = (it.hp && G.hp < G.mhp) || (it.php && P && P.hp < P.mhp) || (it.sp && G.sp < G.msp); b.disabled = !useful; b.onclick = () => { const r = WD.useItem(id); if(r){ WD.sfx('heal'); WD.toast([r.hp ? `+${r.hp} HP` : '', r.php ? `${WD.partnerDef().name} +${r.php} HP` : '', r.sp ? `+${r.sp} SP` : ''].filter(Boolean).join(' · ')); } WD.openBag(); }; });
  pn.querySelector('.close').onclick = WD.closePanel;
  pn.onclick = e => { if(e.target === pn) WD.closePanel(); };
  const f = pn.querySelector('.wd-tabs .on'); if(f) f.focus({ preventScroll: true });
};
WD.closePanel = function(){ const pn = WD.$('.wd-panel'); pn.hidden = true; pn.innerHTML = ''; WD.panelOpen = false; WD.paused = !!WD.getOpen; WD.sfx('tap'); };
})();
