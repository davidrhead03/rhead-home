/* =============================================================
   Where's Dayla? — big screens
   The Level Up screen (pick HP, SP or PP) and the animated
   "Chapter Complete" show at the end of every chapter.
   Original papercraft art: everything is drawn here, no assets.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD;
const { clamp, lerp, ease, rr, ell, star, esc } = WD.U;
const easeOut = WD.U.easeOut;

const CSS = `
.wd-lvl,.wd-clear{position:absolute;inset:0;z-index:56;display:grid;overflow:hidden;padding:max(10px,env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) max(10px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px))}
.wd-lvl{background:radial-gradient(circle at 50% 34%,#4A3C7A 0,#2A2346 58%,#191430 100%);grid-template-rows:auto 1fr auto;justify-items:center;align-items:center;gap:6px}
.wd-lvl .rays{position:absolute;left:50%;top:30%;width:180vmax;height:180vmax;margin:-90vmax 0 0 -90vmax;background:repeating-conic-gradient(rgba(255,201,74,.10) 0 9deg,rgba(255,201,74,0) 9deg 22.5deg);animation:wdSpin 26s linear infinite;pointer-events:none}
@keyframes wdSpin{to{transform:rotate(360deg)}}
.wd-lvl .head{position:relative;text-align:center}
.wd-lvl h1{margin:0;font-family:var(--display);font-weight:900;font-size:clamp(30px,8vh,48px);line-height:1;color:var(--sun);letter-spacing:.04em;filter:drop-shadow(0 4px 0 var(--ink))}
.wd-lvl h1 span,.wd-clear h1 span{display:inline-block;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;animation:wdLetter .55s cubic-bezier(.3,1.7,.5,1) both}
@keyframes wdLetter{0%{transform:translateY(-60px) scale(.4) rotate(-20deg);opacity:0}100%{transform:none;opacity:1}}
.wd-lvl .who{margin:4px 0 0;color:var(--paper);font-weight:800;font-size:14px;letter-spacing:.06em}
.wd-lvl .who b{display:inline-block;color:var(--sun);font-family:var(--display);font-size:20px;animation:wdPop .5s .9s cubic-bezier(.3,1.8,.5,1) both}
.wd-lvl .cards{position:relative;display:flex;gap:clamp(8px,2vw,18px);justify-content:center;align-items:stretch;perspective:900px;width:100%}
.wd-lvl .lc{position:relative;flex:0 1 210px;min-width:0;border:0;padding:0;background:var(--paper);border-radius:18px;box-shadow:0 0 0 3px var(--ink),0 7px 0 var(--ink);display:grid;grid-template-rows:auto auto auto 1fr auto;text-align:center;overflow:hidden;animation:wdFlip .6s cubic-bezier(.3,1.4,.5,1) both;transition:transform .35s cubic-bezier(.3,1.6,.5,1),opacity .35s,filter .35s}
.wd-lvl .lc:nth-child(1){animation-delay:.45s}.wd-lvl .lc:nth-child(2){animation-delay:.6s}.wd-lvl .lc:nth-child(3){animation-delay:.75s}
@keyframes wdFlip{0%{transform:rotateY(100deg) translateY(30px);opacity:0}100%{transform:none;opacity:1}}
.wd-lvl .lc:not(:disabled):hover,.wd-lvl .lc:focus-visible{transform:translateY(-6px) rotate(-1deg)}
.wd-lvl .lc .band{height:clamp(54px,15vh,78px);display:grid;place-items:center;border-bottom:3px solid var(--ink);background-image:radial-gradient(rgba(255,255,255,.35) 1.5px,transparent 1.6px);background-size:10px 10px}
.wd-lvl .lc.hp .band{background-color:#F07A86}.wd-lvl .lc.sp .band{background-color:#FFD66B}.wd-lvl .lc.pp .band{background-color:#8FCBEA}
.wd-lvl .lc svg{width:clamp(40px,11vh,58px);height:clamp(40px,11vh,58px);animation:wdBob 1.8s ease-in-out infinite;filter:drop-shadow(0 3px 0 rgba(43,29,20,.35))}
@keyframes wdBob{50%{transform:translateY(-4px) rotate(4deg)}}
.wd-lvl .lc .nm{font-family:var(--display);font-weight:900;font-size:clamp(20px,5.4vh,26px);margin-top:4px;line-height:1}
.wd-lvl .lc .nm small{display:block;font-family:var(--body);font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.6}
.wd-lvl .lc p{margin:4px 10px 0;font-weight:700;font-size:clamp(11.5px,3.2vh,13.5px);line-height:1.3}
.wd-lvl .lc .vals{align-self:end;margin:6px 8px 10px;padding:4px 0;border-radius:10px;background:var(--paper-2);font-family:var(--display);font-weight:900;font-size:clamp(18px,5vh,24px);white-space:nowrap}
.wd-lvl .lc .vals em{font-style:normal;color:var(--coral)}
.wd-lvl .lc .vals i{font-style:normal;opacity:.45;margin:0 6px}
.wd-lvl .lc .plus{position:absolute;top:6px;right:6px;background:var(--ink);color:var(--sun);font-family:var(--display);font-weight:900;font-size:13px;border-radius:99px;padding:1px 8px;transform:rotate(8deg)}
.wd-lvl .lc .stampd{position:absolute;left:50%;top:38%;width:max-content;transform:translate(-50%,-50%) rotate(-14deg) scale(3);opacity:0;font-family:var(--display);font-weight:900;font-size:34px;color:var(--coral);border:4px solid var(--coral);border-radius:12px;padding:0 10px;background:rgba(255,248,236,.85);pointer-events:none}
.wd-lvl .lc.picked,.wd-lvl .lc.gone{animation:none}
.wd-lvl .lc.picked{transform:scale(1.08) translateY(-6px);z-index:2}
.wd-lvl .lc.picked .stampd{animation:wdStamp .4s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes wdStamp{to{transform:translate(-50%,-50%) rotate(-14deg) scale(1);opacity:1}}
.wd-lvl .lc.gone{transform:rotateX(85deg) translateY(40px);opacity:0;filter:grayscale(1)}
.wd-lvl .foot{position:relative;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;min-height:44px}
.wd-lvl .hint{margin:0;color:var(--paper);font-weight:800;font-size:13.5px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,.6);max-width:60ch}
.wd-lvl .go,.wd-clear .go{border:0;background:var(--sun);border-radius:99px;padding:9px 22px;font-family:var(--display);font-weight:900;font-size:17px;box-shadow:0 0 0 3px var(--ink),0 5px 0 var(--ink);animation:wdPop .4s cubic-bezier(.3,1.7,.5,1) both}
.wd-lvl .go:active,.wd-clear .go:active{transform:translateY(3px);box-shadow:0 0 0 3px var(--ink),0 2px 0 var(--ink)}
.wd-clear{background:transparent;grid-template-columns:1fr minmax(0,46%);grid-template-rows:auto 1fr auto;column-gap:14px;pointer-events:auto}
.wd-clear .ribbon{grid-column:1/3;justify-self:center;text-align:center;position:relative;animation:wdRibbon .7s cubic-bezier(.3,1.5,.5,1) both}
@keyframes wdRibbon{0%{transform:translateY(-140%)}100%{transform:none}}
.wd-clear .band{position:relative;display:inline-block;background:var(--coral);color:var(--paper);padding:4px 34px 6px;box-shadow:0 0 0 3px var(--ink),0 6px 0 var(--ink);border-radius:6px}
.wd-clear .band::before,.wd-clear .band::after{content:'';position:absolute;top:10px;width:28px;height:100%;background:#B33F2A;box-shadow:0 0 0 3px var(--ink);z-index:-1}
.wd-clear .band::before{left:-22px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,30% 50%)}
.wd-clear .band::after{right:-22px;clip-path:polygon(0 0,100% 0,70% 50%,100% 100%,0 100%)}
.wd-clear .band small{display:block;font-weight:900;font-size:12px;letter-spacing:.2em;text-transform:uppercase;opacity:.9}
.wd-clear h1{margin:0;font-family:var(--display);font-weight:900;font-size:clamp(28px,8.5vh,46px);line-height:1;color:var(--sun);letter-spacing:.03em}
.wd-clear .sub{margin:8px 0 0;color:var(--paper);font-family:var(--display);font-weight:800;font-size:clamp(16px,4.6vh,22px);text-shadow:0 2px 0 var(--ink),0 0 8px rgba(0,0,0,.5);animation:wdPop .5s 1.3s cubic-bezier(.3,1.6,.5,1) both}
.wd-clear .loot{grid-column:2;grid-row:2;align-self:center;background:var(--paper);border-radius:18px;box-shadow:0 0 0 3px var(--ink),0 7px 0 var(--ink);padding:10px 12px;display:grid;gap:6px;max-height:100%;overflow:auto;animation:wdPop .45s 1.6s cubic-bezier(.3,1.6,.5,1) both}
.wd-clear .loot>i{font-style:normal;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}
.wd-clear .tiles{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.wd-clear .tile{display:grid;grid-template-columns:44px 1fr;gap:6px;align-items:center;background:var(--paper-2);border-radius:12px;padding:4px 8px 4px 4px;opacity:0;transform:scale(.4) rotate(-6deg)}
.wd-clear .tile.in{animation:wdTile .45s cubic-bezier(.3,1.8,.5,1) forwards}
.wd-clear .tile.wide{grid-column:1/3}
@keyframes wdTile{to{opacity:1;transform:none}}
.wd-clear .tile canvas{width:44px;height:44px}
.wd-clear .tile b{display:block;font-family:var(--display);font-weight:900;font-size:13.5px;line-height:1.1}
.wd-clear .tile small{display:block;font-size:11px;font-weight:700;opacity:.72;line-height:1.2}
.wd-clear .foot{grid-column:1/3;grid-row:3;display:flex;justify-content:flex-end;min-height:46px;align-items:center}
.wd-mid{display:grid;gap:6px;justify-items:center;align-self:flex-start}
.wd-lvchip,.wd-lv{display:flex;align-items:center;gap:6px;background:var(--paper);border-radius:99px;padding:3px 10px;box-shadow:0 0 0 3px var(--ink);font-family:var(--display);white-space:nowrap}
.wd-lvchip b,.wd-lv b{font-weight:900;font-size:13px}
.wd-lvchip small,.wd-lv small{font-family:var(--body);font-weight:800;font-size:11px;font-variant-numeric:tabular-nums}
.wd-lvchip .xb,.wd-lv .xb{width:64px;height:8px;border-radius:8px;background:#E7D7BC;box-shadow:inset 0 0 0 2px var(--ink);overflow:hidden;display:block}
.wd-lvchip .xb i,.wd-lv .xb i{display:block;height:100%;background:linear-gradient(#FFE07A,#F2B33D);transition:width .5s}
.wd-lv{position:absolute;z-index:44;border:0;right:calc(env(safe-area-inset-right,0px) + 12px);top:calc(env(safe-area-inset-top,0px) + 66px);color:var(--ink);cursor:pointer}
.wd-xpbox{position:absolute;left:50%;top:22%;transform:translateX(-50%);z-index:55;background:var(--paper);border-radius:18px;padding:10px 18px 12px;box-shadow:0 0 0 3px var(--ink),0 7px 0 var(--ink);display:grid;justify-items:center;gap:4px;min-width:min(340px,80vw);animation:wdPop .4s cubic-bezier(.3,1.6,.5,1)}
.wd-xpbox .k{font-style:normal;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}
.wd-xpbox>b{font-family:var(--display);font-weight:900;font-size:30px;line-height:1;color:#D99A1E;-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill}
.wd-xpbox .lvrow{display:flex;align-items:center;gap:8px;width:100%;font-family:var(--display);font-weight:900;font-size:13px}
.wd-xpbox .xbar{position:relative;flex:1;height:14px;border-radius:14px;background:#E7D7BC;box-shadow:inset 0 0 0 2px var(--ink);overflow:hidden}
.wd-xpbox .xbar i{position:absolute;left:0;top:0;bottom:0;background:#F2B33D}
.wd-xpbox .xbar u{position:absolute;top:0;bottom:0;background:linear-gradient(#FFF3B0,#FFD24A);box-shadow:0 0 8px #FFE07A}
.wd-xpbox small{font-weight:800;font-size:13px}
@media (max-height:340px){.wd-clear .tile canvas{width:34px;height:34px}.wd-clear .tile{grid-template-columns:34px 1fr}.wd-lvl .lc p{display:none}}
`;
if(!document.getElementById('wd-css-screens')){ const st = document.createElement('style'); st.id = 'wd-css-screens'; st.textContent = CSS; document.head.appendChild(st); }

const letters = s => [...s].map((ch, i) => ch === ' ' ? '<span>&nbsp;</span>' : `<span style="animation-delay:${(i * .05).toFixed(2)}s">${esc(ch)}</span>`).join('');
const host = () => WD.root;
function overlay(cls){ const d = document.createElement('div'); d.className = cls; host().appendChild(d); return d; }

/* ================= icons (inline SVG, papercraft) ================= */
const SVG = {
  hp: '<svg viewBox="0 0 64 64"><path d="M32 56 C10 40 4 30 6 20 C8 9 22 6 32 17 C42 6 56 9 58 20 C60 30 54 40 32 56Z" fill="#E8414F" stroke="#2B1D14" stroke-width="4" stroke-linejoin="round"/><path d="M16 18 C18 14 23 13 26 15" stroke="#FFF8EC" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  sp: '<svg viewBox="0 0 64 64"><path d="M32 5 L39.5 23 L59 24.5 L44 37 L48.5 56 L32 46 L15.5 56 L20 37 L5 24.5 L24.5 23Z" fill="#FFC94A" stroke="#2B1D14" stroke-width="4" stroke-linejoin="round"/><circle cx="26" cy="31" r="3" fill="#2B1D14"/><circle cx="38" cy="31" r="3" fill="#2B1D14"/><path d="M27 38 Q32 42 37 38" stroke="#2B1D14" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  pp: '<svg viewBox="0 0 64 64"><rect x="29" y="40" width="6" height="18" rx="3" fill="#9AA0A6" stroke="#2B1D14" stroke-width="3"/><circle cx="32" cy="28" r="22" fill="#E8B84A" stroke="#2B1D14" stroke-width="4"/><circle cx="32" cy="28" r="14" fill="#7A1426"/><path d="M32 18 L35 25 L42 25.5 L36.5 30 L38.5 37 L32 33 L25.5 37 L27.5 30 L22 25.5 L29 25Z" fill="#FFF8EC"/></svg>'
};

/* ================= LEVEL UP ================= */
WD.levelUpScreen = function(G){
  return new Promise(res => {
    const prevMode = WD.mode; WD.mode = 'menu';
    WD.$('.wd-bmenu').hidden = true;
    const P = G.partner ? G.party[G.partner] : null, pd = P ? WD.partnerDef() : null;
    const opts = [
      { k: 'hp', name: 'HP', long: 'Heart Points', what: 'How much damage you can take before you’re out of breath.', a: G.mhp, b: G.mhp + 5, plus: '+5' },
      { k: 'sp', name: 'SP', long: 'Star Power', what: 'Stars you spend on Specials. The crowd fills them when you time things well.', a: G.msp, b: G.msp + 1, plus: '+1' },
      { k: 'pp', name: 'PP', long: 'Pin Points', what: 'How many pins you can wear at once. More PP = more perks.', a: G.mpp, b: G.mpp + 3, plus: '+3' }
    ];
    const el = overlay('wd-lvl');
    el.innerHTML = `<div class="rays"></div>
      <div class="head"><h1>${letters('LEVEL UP!')}</h1><p class="who">${esc(WD.hero)} · Level ${G.lv - 1} → <b>Level ${G.lv}</b></p></div>
      <div class="cards">${opts.map((o, i) => `<button class="lc ${o.k}" data-i="${i}"><span class="plus">${o.plus}</span><div class="band">${SVG[o.k]}</div><div class="nm">${o.name}<small>${o.long}</small></div><p>${esc(o.what)}</p><span></span><div class="vals">${o.a}<i>→</i><em>${o.b}</em></div><span class="stampd">${o.plus}!</span></button>`).join('')}</div>
      <div class="foot"><p class="hint">Pick one to grow. Everything gets refilled either way.</p></div>`;
    WD.sfx('level'); setTimeout(() => WD.sfx('flip'), 450); setTimeout(() => WD.sfx('flip'), 600); setTimeout(() => WD.sfx('flip'), 750);
    const cards = [...el.querySelectorAll('.lc')];
    setTimeout(() => { if(cards[0]) cards[0].focus({ preventScroll: true }); }, 900);
    let picked = false;
    cards.forEach(b => b.onclick = () => {
      if(picked) return; picked = true; WD.audio && WD.audio();
      const i = +b.dataset.i, o = opts[i];
      cards.forEach((c, j) => { c.disabled = true; if(j !== i) c.classList.add('gone'); });
      b.classList.add('picked'); WD.sfx('stamp');
      const em = b.querySelector('.vals em'), a0 = o.a, a1 = o.b, t0 = performance.now();
      em.textContent = a0;
      const tick = () => { const u = Math.min(1, (performance.now() - t0) / 700); const v = Math.round(lerp(a0, a1, easeOut(u))); if(em.textContent !== String(v)){ em.textContent = v; WD.sfx('tap'); } if(u < 1) requestAnimationFrame(tick); else WD.sfx('perfect'); };
      setTimeout(tick, 350);
      setTimeout(() => {
        const foot = el.querySelector('.foot');
        foot.innerHTML = `<p class="hint">${o.name} ${a0} → ${a1}! HP and SP refilled.${pd ? ` ${esc(pd.name)} and your other partners +2 HP.` : ''}</p><button class="go">Continue</button>`;
        const go = foot.querySelector('.go'); go.focus({ preventScroll: true });
        go.onclick = () => { WD.sfx('tap'); el.remove(); WD.mode = prevMode; res(i); };
      }, 1250);
    });
  });
};

/* ================= CHAPTER COMPLETE ================= */
/* o = { num: 'Chapter 1', title, rewards: [{ icon | partner | photo, label, sub, wide }], bunting: [colours], song } */
const CL = { mode: 'clear' };
let S = null;
CL.draw = function(t, dt){
  if(!S) return;
  const v = WD.view, ctx = WD.ctx; S.t += dt;
  const k0 = Math.min(v.h / 300, v.w / 330), k = v.dpr * k0, W2 = v.w / k0 / 2 + 10;
  const cx = v.dpr * v.w * (v.w > 560 ? .3 : .5), fy = v.dpr * v.h * .8;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, WD.cv.height); g.addColorStop(0, '#1E1A3E'); g.addColorStop(.6, '#3A2E6A'); g.addColorStop(1, '#6A4A86'); ctx.fillStyle = g; ctx.fillRect(0, 0, WD.cv.width, WD.cv.height);
  // paper stars
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  S.stars.forEach(s => { const tw = .55 + Math.sin(t * s.sp + s.p) * .45; ctx.fillStyle = `rgba(255,236,170,${.35 + tw * .55})`; ctx.save(); ctx.translate(s.x * v.w, s.y * v.h); ctx.rotate(t * .3 + s.p); star(ctx, 0, 0, s.r * (.8 + tw * .3)); ctx.restore(); });
  // a paper moon
  ctx.fillStyle = '#FFF2C8'; ell(ctx, v.w * .9, v.h * .2, 22, 22); ctx.fill(); ctx.fillStyle = '#3A2E6A'; ell(ctx, v.w * .9 + 9, v.h * .2 - 6, 19, 19); ctx.fill();
  // bunting
  const cols = S.o.bunting || ['#E8593C', '#FFC94A', '#7CD86A', '#58AEDD', '#E86F79'];
  for(let row = 0; row < 2; row++){
    const y0 = v.h * (.06 + row * .07), sag = 18;
    ctx.strokeStyle = '#2B1D14'; ctx.lineWidth = 1.5; ctx.beginPath();
    for(let x = 0; x <= v.w; x += 8){ const u = (x % (v.w / 2)) / (v.w / 2); const y = y0 + Math.sin(u * Math.PI) * sag; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    for(let x = 14 + row * 14, i = 0; x < v.w; x += 30, i++){ const u = (x % (v.w / 2)) / (v.w / 2), y = y0 + Math.sin(u * Math.PI) * sag, sw = Math.sin(t * 2 + i) * .08; ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.fillStyle = cols[(i + row) % cols.length]; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(43,29,20,.6)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
  }
  // stage
  ctx.setTransform(k, 0, 0, k, cx, fy);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sg = ctx.createLinearGradient(0, -280, 0, 10); sg.addColorStop(0, 'rgba(255,240,200,.02)'); sg.addColorStop(1, 'rgba(255,240,200,.22)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-20, -300); ctx.lineTo(20, -300); ctx.lineTo(110, 8); ctx.lineTo(-110, 8); ctx.fill(); ctx.restore();
  const fg = ctx.createLinearGradient(0, 0, 0, 80); fg.addColorStop(0, '#B07A48'); fg.addColorStop(1, '#6E4426'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(170, 0); ctx.lineTo(220, 90); ctx.lineTo(-220, 90); ctx.fill();
  ctx.fillStyle = '#2B1D14'; ctx.fillRect(-172, -2, 344, 4);
  ctx.strokeStyle = 'rgba(60,34,18,.4)'; ctx.lineWidth = 1; for(let y = 10; y < 90; y += 12){ ctx.beginPath(); ctx.moveTo(-220, y); ctx.lineTo(220, y); ctx.stroke(); }
  // missing-dog poster on an easel behind them
  ctx.save(); ctx.translate(-100, -112); ctx.scale(.85, .85); ctx.rotate(Math.sin(t * .8) * .02);
  ctx.strokeStyle = '#7A4D2B'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, 30); ctx.lineTo(-44, 120); ctx.moveTo(30, 30); ctx.lineTo(44, 120); ctx.stroke();
  ctx.fillStyle = '#2B1D14'; rr(ctx, -40, -50, 80, 96, 4); ctx.fill(); ctx.fillStyle = '#FFF8EC'; rr(ctx, -37, -47, 74, 90, 3); ctx.fill();
  ctx.fillStyle = '#E8593C'; ctx.font = '900 10px Grandstander, system-ui'; ctx.textAlign = 'center'; ctx.fillText('MISSING', 0, -34);
  if(S.dayla){ S.dayla.t += dt; WD.paintEnt(S.dayla, cx - 100 * k, fy + (-112 + 12) * k, k * .66); ctx.setTransform(k, 0, 0, k, cx, fy); ctx.translate(-100, -112); ctx.scale(.85, .85); }
  ctx.fillStyle = '#2B1D14'; ctx.font = '800 6.5px Nunito, system-ui'; ctx.fillText('Have you seen Dayla?', 0, 36);
  ctx.restore();
  // hero + partner hopping
  ctx.setTransform(k, 0, 0, k, cx, fy);
  S.ents.forEach((e, i) => { WD.tickEnt(e, dt); const hop = Math.abs(Math.sin(t * 5.2 + i * 1.6)); e.z = hop * (i ? 16 : 22); e.expr = 'joy'; if(e.kind !== 'human') e.happy = true; e.nt = (e.nt === undefined ? 2 + i : e.nt) - dt; if(e.nt <= 0){ e.nt = 2.4 + Math.random() * 2; e.dir = -e.dir; } WD.paintEnt(e, cx + e.x * k, fy + e.y * k, k * 1.25); });
  // confetti
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  if(Math.random() < (S.t < 3 ? .5 : .12)) for(let i = 0; i < 2; i++) S.conf.push({ x: Math.random() * v.w, y: -10, vx: (Math.random() - .5) * 40, vy: 40 + Math.random() * 60, r: Math.random() * 6, vr: (Math.random() - .5) * 8, c: cols[Math.floor(Math.random() * cols.length)], s: 3 + Math.random() * 3 });
  S.conf = S.conf.filter(p => p.y < v.h + 20);
  S.conf.forEach(p => { p.x += (p.vx + Math.sin(t * 3 + p.r) * 20) * dt; p.y += p.vy * dt; p.r += p.vr * dt; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(t * 6 + p.r)); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s, p.s, p.s * 2); ctx.restore(); });
  // curtains
  const cw = v.w / 2 * (1 - ease(clamp(S.curtain, 0, 1)) * .9);
  [[0, false], [v.w - cw, true]].forEach(([x, right]) => { if(cw < 1) return; const gg = ctx.createLinearGradient(x, 0, x + cw, 0), folds = Math.max(3, Math.round(cw / 40)); for(let i = 0; i <= folds; i++) gg.addColorStop(i / folds, i % 2 ? '#8E1A2E' : '#C42D46'); ctx.fillStyle = gg; ctx.fillRect(x, 0, cw, v.h); ctx.fillStyle = '#E8B84A'; ctx.fillRect(right ? x - 2 : x + cw - 2, 0, 4, v.h); });
};
function iconTile(cv, r){
  const c = cv.getContext('2d'), d = 2; cv.width = 44 * d; cv.height = 44 * d;
  c.setTransform(d, 0, 0, d, 0, 0);
  if(r.partner){
    const pd = WD.PARTNERS[r.partner]; if(!pd) return;
    const e = WD.makeEnt({ kind: pd.kind, name: pd.name, expr: 'joy', happy: true });
    const old = WD.ctx; WD.ctx = c; try{ WD.paintEnt(e, 22 * d, 38 * d, d * .95); }catch(err){} WD.ctx = old; c.setTransform(1, 0, 0, 1, 0, 0);
  } else { c.save(); c.translate(22, 23); WD.drawIcon(c, r.icon || 'star', 0, 0, r.scale || 1.25, 0); c.restore(); }
}
WD.chapterComplete = function(o){
  return new Promise(async res => {
    const prevScene = WD.scene, prevMode = WD.mode, prevLight = WD.light;
    WD.showControls(false); WD.showGoal(false); WD.hideTalk && WD.hideTalk();
    const G = WD.G;
    await WD.pageTurn(() => {
      const hero = WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.hero], name: WD.hero, x: -6, y: 0, dir: 1, light: 'day' });
      const ents = [hero];
      if(G.partner && WD.PARTNERS[G.partner]){ const d = WD.partnerDef(); ents.push(WD.makeEnt({ kind: d.kind, name: d.name, x: 52, y: 8, dir: -1, light: 'day' })); }
      const dayla = WD.makeEnt({ kind: 'dog', name: 'Dayla', x: 0, y: 0, dir: 1, light: 'day', noShadow: true });
      S = { o, t: 0, ents, dayla, conf: [], curtain: 0, stars: Array.from({ length: 38 }, () => ({ x: Math.random(), y: Math.random() * .75, r: 2 + Math.random() * 3.5, p: Math.random() * 6, sp: 1 + Math.random() * 3 })) };
      WD.light = 'day'; WD.setScene(CL, 'clear');
    });
    WD.MUS.play(o.song || 'clear'); WD.sfx('fanfare');
    await WD.tween(1000, u => { if(S) S.curtain = u; });
    const el = overlay('wd-clear');
    const rw = o.rewards || [];
    el.innerHTML = `<div class="ribbon"><div class="band"><small>${esc(o.num)}</small><h1>${letters('COMPLETE!')}</h1></div><p class="sub">${esc(o.title)}</p></div>
      <div class="loot"><i>What you earned</i><div class="tiles">${rw.map(r => `<div class="tile ${r.wide ? 'wide' : ''}"><canvas></canvas><div><b>${esc(r.label)}</b><small>${esc(r.sub || '')}</small></div></div>`).join('')}</div></div>
      <div class="foot"></div>`;
    const tiles = [...el.querySelectorAll('.tile')];
    tiles.forEach((tl, i) => iconTile(tl.querySelector('canvas'), rw[i]));
    await WD.wait(1900);
    for(const tl of tiles){ tl.classList.add('in'); WD.sfx('chime'); await WD.wait(420); }
    await WD.wait(400);
    const foot = el.querySelector('.foot'); foot.innerHTML = `<button class="go">${esc(o.cta || 'Continue')}</button>`;
    const go = foot.querySelector('.go'); go.focus({ preventScroll: true });
    go.onclick = async () => {
      WD.sfx('tap'); el.remove();
      await WD.tween(700, u => { if(S) S.curtain = 1 - u; });
      await WD.pageTurn(() => { S = null; WD.light = prevLight; WD.setScene(prevScene, prevMode === 'clear' ? 'cutscene' : prevMode); });
      res();
    };
  });
};
})();
