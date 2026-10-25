/* =============================================================
   Where's Dayla? — script
   Dialogue with portraits and voice blips, Spanish subtitles, choices,
   item cards, phone calls and the little helpers cutscenes are built from.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { lerp, clamp } = WD.U;

const NAMECOL = WD.NAMECOL = { David: '#3E6FB5', Laura: '#B34A7A', Veci: '#5E7A38', Dayla: '#C9673E', Alejandro: '#C98A3A', Kairos: '#3A3448', 'Cat Agent': '#4A4A55', 'Sergeant Hairball': '#B85F1C', Alejandra: '#C9667F', Samuel: '#4F7FA6', Iguana: '#4F8A3A', '???': '#5B4A3A' };
WD.actors = {};      // name → entity on screen (set by the area)
let talk = null, portEnt = null, portPhone = false;

function el(){ return WD.$('.wd-talk'); }
/* who: a name. opts: { expr, es, phone, ent, sub }
   es = the Spanish line. David's save shows it with an English subtitle; Laura's save shows the Spanish on its own. */
WD.say = function(who, text, opts){
  opts = opts || {};
  return new Promise(res => {
    const box = el(), p = box.querySelector('p'), name = box.querySelector('.name'), sub = box.querySelector('.sub'), more = box.querySelector('.more'), ch = box.querySelector('.choices'), port = box.querySelector('.portrait');
    let main = text, subtitle = opts.sub || '';
    // Laura talks to David in English, with Spanish words mixed in: use the English line
    if(opts.es && who === 'Laura' && (WD.hero === 'David' || opts.toDavid)) opts = Object.assign({}, opts, { es: null });
    // people at UIC speak English with David (it's the USA, he's an English speaker)
    if(opts.es && WD.hero === 'David' && WD.ENGLISH_WITH_DAVID && WD.ENGLISH_WITH_DAVID.includes(who)) opts = Object.assign({}, opts, { es: null });
    if(opts.es){ main = opts.es; subtitle = WD.hero === 'David' ? text : ''; }
    Object.values(WD.actors).forEach(e => { if(e) e.talk = false; });
    let ent = opts.ent || WD.actors[who] || null;
    if(!ent && WD.LOOKS[who]) ent = WD.makeEnt({ kind: 'human', look: WD.LOOKS[who], name: who });
    if(ent){ ent.talk = true; if(opts.expr) ent.expr = opts.expr; }
    portEnt = ent; portPhone = !!opts.phone;
    port.hidden = !ent; box.classList.toggle('phone', !!opts.phone);
    name.hidden = !who; name.textContent = (opts.phone ? '📱 ' : '') + (who || ''); name.style.background = NAMECOL[who] || '#E8593C';
    p.textContent = ''; sub.textContent = subtitle; sub.hidden = true; more.hidden = true; ch.hidden = true; ch.innerHTML = '';
    box.hidden = false;
    const bx = box.querySelector('.box'); bx.style.animation = 'none'; void bx.offsetWidth; bx.style.animation = '';
    talk = { who, text: main, shown: 0, ent, res, subtitle, choices: opts.choices || null, voice: opts.voice || who };
    WD.sfx('open');
  });
};
WD.narrate = (text) => WD.say(null, text);
/* show a line, then buttons. returns the index picked */
WD.choose = function(who, text, options, opts){
  opts = Object.assign({}, opts || {}, { choices: options });
  return WD.say(who, text, opts);
};
function showChoices(){
  const box = el(), ch = box.querySelector('.choices');
  if(!talk || !talk.choices || !ch.hidden) return;
  ch.innerHTML = talk.choices.map((o, i) => `<button data-i="${i}" class="${i ? 'alt' : ''}">${WD.U.esc(o)}</button>`).join('');
  ch.hidden = false; box.querySelector('.more').hidden = true;
  ch.querySelectorAll('button').forEach(b => b.onclick = e => { e.stopPropagation(); WD.sfx('tap'); finish(+b.dataset.i); });
  const f = ch.querySelector('button'); if(f) f.focus({ preventScroll: true });
}
function finish(v){ const s = talk; talk = null; hide(); if(s){ if(s.ent) s.ent.talk = false; s.res(v); } }
function hide(){ el().hidden = true; Object.values(WD.actors).forEach(e => { if(e) e.talk = false; }); portEnt = null; }
WD.hideTalk = hide;
WD.talkPress = null;
function press(){
  if(!talk) return;
  const box = el(), p = box.querySelector('p');
  if(talk.shown < talk.text.length){ talk.shown = talk.text.length; p.textContent = talk.text; reveal(); return; }
  if(talk.choices) return;
  finish();
}
function reveal(){ const box = el(); if(talk.subtitle) box.querySelector('.sub').hidden = false; if(talk.choices) showChoices(); else box.querySelector('.more').hidden = false; }
WD.tickTalk = function(dt){
  WD.talkPress = talk ? press : null;
  if(!talk) return; const s = talk, p = el().querySelector('p');
  if(s.ent) WD.tickEnt(s.ent, 0);
  if(s.shown < s.text.length){
    const b = Math.floor(s.shown); s.shown = Math.min(s.text.length, s.shown + dt * 46); const n = Math.floor(s.shown);
    p.textContent = s.text.slice(0, n);
    for(let i = b; i < n; i++) if(/[a-zA-Z0-9¡!¿?áéíóúñ]/.test(s.text[i]) && i % 2 === 0){ WD.blip(s.voice); break; }
    if(n >= s.text.length) reveal();
  }
};
const pcv = () => el().querySelector('.portrait canvas');
WD.drawTalkPortrait = function(){
  if(!talk || !portEnt) return;
  const e = portEnt; if(!WD.actors[talk.who] || WD.actors[talk.who] !== e) e.t = (e.t || 0) + .016;
  WD.drawPortraitOf(pcv().getContext('2d'), e, portPhone);
};

/* ================= item card ================= */
let getRes = null, getKind = null, getRAF = 0;
WD.getOpen = false;
WD.itemGet = function(kind, title, desc, label){
  return new Promise(res => {
    const g = WD.$('.wd-get'), cv = g.querySelector('canvas'), c = cv.getContext('2d');
    g.querySelector('i').textContent = label || 'You got';
    g.querySelector('b').textContent = title; g.querySelector('p').textContent = desc || '';
    g.hidden = false; WD.getOpen = true; getRes = res; getKind = kind; WD.paused = true;
    WD.sfx(kind === 'photo' || kind === 'print' || kind === 'glove' ? 'clue' : 'get');
    const t0 = performance.now();
    const draw = () => { if(!WD.getOpen) return; const t = (performance.now() - t0) / 1000; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 220, 220);
      c.save(); c.translate(110, 110); c.rotate(t * .4); c.fillStyle = 'rgba(255,201,74,.35)'; for(let i = 0; i < 12; i++){ c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(110, -14); c.lineTo(110, 14); c.fill(); } c.restore();
      const pop = Math.min(1, t * 4); c.setTransform(2 * pop, 0, 0, 2 * pop, 110, 110 + Math.sin(t * 3) * 3); WD.drawIcon(c, kind, 0, 0, 1.6, t);
      getRAF = requestAnimationFrame(draw); };
    draw();
  });
};
WD.closeGet = function(){ if(!WD.getOpen) return; WD.getOpen = false; cancelAnimationFrame(getRAF); WD.$('.wd-get').hidden = true; WD.paused = !!WD.panelOpen; const r = getRes; getRes = null; WD.sfx('tap'); if(r) r(); };

/* ================= phone call ================= */
WD.phone = async function(who, lines){
  WD.sfx('ring'); await WD.wait(700); WD.sfx('ring'); await WD.wait(600);
  for(const L of lines){
    const speaker = L.who || who, ent = speaker === WD.hero ? WD.actors[WD.hero] : null;
    await WD.say(speaker, L.text, { expr: L.expr, es: L.es, phone: speaker !== WD.hero, ent: ent || undefined, toDavid: who === 'David' || L.toDavid });
  }
};

/* ================= cutscene helpers ================= */
WD.walkTo = (e, x, y, spd) => new Promise(r => { e.goal = { x, y: y === undefined ? e.y : y, spd: spd || 80, r }; });
WD.tickGoals = function(list, dt){
  list.forEach(e => { if(!e || !e.goal) return; const dx = e.goal.x - e.x, dy = e.goal.y - e.y, d = Math.hypot(dx, dy); if(d < 2){ e.x = e.goal.x; e.y = e.goal.y; const r = e.goal.r; e.goal = null; e.move = 0; r(); } else { const sp = Math.min(e.goal.spd * dt, d); e.x += dx / d * sp; e.y += dy / d * sp; e.move = 1; if(Math.abs(dx) > .5) e.dir = dx > 0 ? 1 : -1; } });
};
WD.hop = function(e, x, y, h, ms){ const x0 = e.x, y0 = e.y; if(x !== x0) e.dir = x > x0 ? 1 : -1; WD.sfx('jump'); return WD.tween(ms || 500, u => { e.x = lerp(x0, x, u); e.y = lerp(y0, y, u); e.z = Math.sin(u * Math.PI) * (h || 26); }).then(() => { e.z = 0; }); };
WD.emote = (e, kind, dur) => { if(!e) return; e.emote = { kind, t: 0, dur: dur || 1.6 }; if(kind === '!') WD.sfx('open'); };
WD.face = (a, b) => { if(a && b) a.dir = b.x > a.x ? 1 : -1; };
WD.shake = n => { WD.cam.shake = n || 6; };
/* run a cutscene: letterbox on, controls off, then back */
let cutDepth = 0;
WD.cut = async function(fn){
  if(WD.mode !== 'explore' && WD.mode !== 'cutscene' && cutDepth === 0) return;
  cutDepth++; WD.mode = 'cutscene'; WD.letter = 1; WD.showControls(false); WD.showGoal(false);
  try{ await fn(); }
  catch(e){ console.error(e); }
  finally{
    cutDepth--;
    if(cutDepth === 0 && WD.mode === 'cutscene'){ WD.mode = 'explore'; WD.letter = 0; WD.cam.lock = false; WD.showControls(true); WD.showGoal(true); }
  }
};
WD.inCut = () => cutDepth > 0;
})();
