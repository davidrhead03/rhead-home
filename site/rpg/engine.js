/* =============================================================
   Where's Dayla? — engine
   Game loop, screen, touch controls, sound, music, saves, transitions.
   Loaded only when the game is opened: window.RheadRPG.start(host, api)
   The other files (render, script, world, battle, chapters) attach to window.WD.
   ============================================================= */
(function(){
'use strict';
const WD = window.WD = window.WD || {};
const SRC = (document.currentScript && document.currentScript.src) || '/rpg/engine.js';
WD.V = (SRC.match(/[?&]v=([^&#]+)/) || [])[1] || String(Date.now());
WD.BASE = SRC.replace(/engine\.js.*$/, '');

/* ================= helpers ================= */
const U = WD.U = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  ease: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOut: t => 1 - Math.pow(1 - t, 3),
  rng(s){ return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; },
  shade(hex, f){ const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if(f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); },
  rr(c, x, y, w, h, r){ c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); },
  ell(c, x, y, rx, ry, rot){ c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); },
  star(c, x, y, r){ c.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); },
  esc: s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))
};
const { clamp, lerp, ease } = U;

/* ================= styles ================= */
const CSS = `
.wd{--ink:#2B1D14;--paper:#FFF8EC;--paper-2:#F3E6CF;--coral:#E8593C;--sun:#FFC94A;--leaf:#3F8A4A;--dusk:#2A2346;
  --display:'Grandstander','Fredoka','Baloo 2','Comic Sans MS',system-ui,sans-serif;--body:'Nunito','Avenir Next','Segoe UI',system-ui,sans-serif;
  position:absolute;inset:0;overflow:hidden;background:#000;color:var(--ink);font-family:var(--body);touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;color-scheme:light}
.wd [hidden]{display:none!important}
.wd button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.wd button:focus-visible{outline:3px solid var(--sun);outline-offset:3px}
.wd-cv{position:absolute;inset:0;display:block;width:100%;height:100%}
.wd-load{position:absolute;inset:0;display:grid;place-items:center;background:var(--dusk);color:var(--paper);font-family:var(--display);font-weight:800;font-size:22px;z-index:70;text-align:center;line-height:1.5}
.wd-load small{display:block;font-family:var(--body);font-size:14px;opacity:.75}
/* top bar */
.wd-x,.wd-bag,.wd-mute,.wd-pause{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);width:44px;height:44px;border-radius:50%;border:0;background:var(--paper);box-shadow:0 0 0 3px var(--ink);font-size:18px;z-index:45;display:grid;place-items:center;padding:0}
.wd-x{left:calc(env(safe-area-inset-left,0px) + 12px);font-weight:900}
.wd-mute{right:calc(env(safe-area-inset-right,0px) + 12px)}
.wd-pause{right:calc(env(safe-area-inset-right,0px) + 66px);font-size:15px;font-weight:900;letter-spacing:-1px}
.wd-bag{right:calc(env(safe-area-inset-right,0px) + 120px)}
.wd-pausebox{position:absolute;inset:0;z-index:58;display:grid;place-items:center;background:rgba(42,35,70,.62);padding-inline:max(16px,env(safe-area-inset-left,0px)) max(16px,env(safe-area-inset-right,0px))}
.wd-pausebox .sheet{background:var(--paper);border-radius:24px;padding:18px 22px 20px;box-shadow:0 0 0 3px var(--ink),0 9px 0 var(--ink);display:grid;gap:12px;justify-items:center;text-align:center;animation:wdPop .3s cubic-bezier(.3,1.6,.5,1);max-width:420px}
.wd-pausebox h2{margin:0;font-family:var(--display);font-weight:900;font-size:32px;color:var(--coral);line-height:1}
.wd-pausebox p{margin:0;font-weight:700;font-size:13.5px;opacity:.7}
.wd-pausebox .wd-pick{justify-content:center}
.wd-bag.ping::after{content:'';position:absolute;top:2px;right:2px;width:11px;height:11px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 2px var(--ink)}
/* area card + goal */
.wd-area{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 16px);transform:translateX(-50%) rotate(-1.5deg);background:var(--paper);padding:8px 18px 9px;border-radius:14px;box-shadow:0 0 0 3px var(--ink),0 5px 0 rgba(43,29,20,.35);text-align:center;z-index:12;pointer-events:none;opacity:0;transition:opacity .6s,transform .6s;white-space:nowrap}
.wd-area.show{opacity:1;transform:translateX(-50%) rotate(-1.5deg) translateY(4px)}
.wd-area b{display:block;font-family:var(--display);font-size:22px;font-weight:900;line-height:1.1}
.wd-area span{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.65}
.wd-goal{position:absolute;left:calc(env(safe-area-inset-left,0px) + 66px);top:calc(env(safe-area-inset-top,0px) + 14px);max-width:min(46vw,330px);background:rgba(255,248,236,.94);border-radius:12px;padding:5px 11px 6px;box-shadow:0 0 0 2.5px var(--ink);font-size:13px;font-weight:800;line-height:1.3;z-index:11;pointer-events:none;transform:rotate(-.6deg)}
.wd-goal i{font-style:normal;color:var(--coral);font-family:var(--display);font-weight:900;margin-right:6px;letter-spacing:.03em}
.wd-goal.new{animation:wdPop .45s cubic-bezier(.3,1.6,.5,1)}
/* dialogue */
.wd-talk{position:absolute;left:max(12px,env(safe-area-inset-left,0px));right:max(12px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 14px);max-width:660px;margin:0 auto;z-index:30;display:flex;gap:12px;align-items:flex-end}
.wd-talk .portrait{flex:none;width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#FFF3D6,#F6D7A6);box-shadow:0 0 0 3px var(--ink),0 0 0 7px var(--paper),0 0 0 10px var(--ink);margin:0 0 8px 6px;overflow:hidden}
.wd-talk.phone .portrait{border-radius:18px;background:radial-gradient(circle at 50% 40%,#E6F2FF,#B9D3F2)}
.wd-talk .portrait canvas{width:100%;height:100%;display:block}
.wd-talk .box{position:relative;flex:1;min-width:0;background:var(--paper);border-radius:20px 22px 18px 24px;padding:20px 18px 16px;box-shadow:0 0 0 3px var(--ink),0 7px 0 rgba(43,29,20,.3);animation:wdPop .25s cubic-bezier(.3,1.6,.5,1)}
.wd-talk .box::after{content:'';position:absolute;inset:6px;border:2px dashed rgba(43,29,20,.12);border-radius:16px;pointer-events:none}
.wd-talk .name{position:absolute;top:-15px;left:16px;background:var(--coral);color:#fff;font-family:var(--display);font-weight:800;font-size:16px;padding:3px 13px 4px;border-radius:99px;box-shadow:0 0 0 3px var(--ink);transform:rotate(-2deg);white-space:nowrap}
.wd-talk p{margin:0;font-size:17.5px;line-height:1.4;font-weight:700;min-height:48px}
.wd-talk .sub{display:block;margin-top:5px;font-size:13.5px;font-weight:700;font-style:italic;opacity:.62;line-height:1.3}
.wd-talk .more{position:absolute;right:16px;bottom:7px;color:var(--coral);font-size:14px;animation:wdBob .8s infinite}
.wd-talk .choices{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;position:relative;z-index:1}
.wd-talk .choices button{border:0;background:var(--sun);border-radius:14px;padding:7px 14px 8px;font-family:var(--display);font-weight:800;font-size:16px;box-shadow:0 0 0 2.5px var(--ink),0 4px 0 var(--ink)}
.wd-talk .choices button:active{transform:translateY(3px);box-shadow:0 0 0 2.5px var(--ink),0 1px 0 var(--ink)}
.wd-talk .choices button.alt{background:var(--paper-2)}
@keyframes wdPop{from{transform:scale(.85);opacity:0}}
@keyframes wdBob{50%{transform:translateY(3px)}}
/* controls */
.wd-joy{position:absolute;left:calc(env(safe-area-inset-left,0px) + 22px);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:124px;height:124px;border-radius:50%;background:rgba(255,248,236,.22);box-shadow:0 0 0 3px rgba(255,248,236,.7);z-index:15;touch-action:none}
.wd-joy i{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px;border-radius:50%;background:var(--paper);box-shadow:0 0 0 3px var(--ink),0 4px 0 rgba(43,29,20,.4)}
.wd-btn{position:absolute;border-radius:50%;border:0;font-family:var(--display);font-weight:900;box-shadow:0 0 0 3px var(--ink),0 6px 0 var(--ink);z-index:22;touch-action:none;display:grid;place-items:center;padding:0;line-height:1}
.wd-btn.down{transform:translateY(4px);box-shadow:0 0 0 3px var(--ink),0 2px 0 var(--ink)}
.wd-btn small{position:absolute;bottom:-21px;left:50%;transform:translateX(-50%);font-family:var(--body);font-size:11px;font-weight:800;color:var(--paper);text-shadow:0 1px 2px rgba(0,0,0,.7);white-space:nowrap}
.wd-a{right:calc(env(safe-area-inset-right,0px) + 22px);bottom:calc(env(safe-area-inset-bottom,0px) + 40px);width:78px;height:78px;background:var(--coral);color:#fff;font-size:32px}
.wd-b{right:calc(env(safe-area-inset-right,0px) + 114px);bottom:calc(env(safe-area-inset-bottom,0px) + 26px);width:60px;height:60px;background:var(--sun);font-size:24px}
.wd-p{right:calc(env(safe-area-inset-right,0px) + 30px);bottom:calc(env(safe-area-inset-bottom,0px) + 140px);width:56px;height:56px;background:#9BD27A;font-size:22px}
/* battle */
.wd-bhud{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;justify-content:space-between;align-items:flex-start;gap:8px;padding-inline:max(64px,calc(env(safe-area-inset-left,0px) + 64px)) max(118px,calc(env(safe-area-inset-right,0px) + 118px));z-index:14;pointer-events:none}
.wd-hp{background:var(--paper);border-radius:14px;padding:5px 10px 6px;box-shadow:0 0 0 3px var(--ink),0 4px 0 rgba(43,29,20,.3);min-width:0}
.wd-hp b{font-family:var(--display);font-weight:800;font-size:14px;display:block;line-height:1.1;white-space:nowrap}
.wd-hp .bar{width:92px;max-width:22vw;height:9px;border-radius:9px;background:#E7D7BC;box-shadow:inset 0 0 0 2px var(--ink);overflow:hidden;margin-top:4px}
.wd-hp .bar i{display:block;height:100%;background:linear-gradient(#7CD86A,#3FA048);transition:width .35s}
.wd-hp.foe .bar i{background:linear-gradient(#FF8A6B,#D6452B)}
.wd-hp.ko{opacity:.5}
.wd-hp small{font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}
.wd-hpcol{display:grid;gap:7px;align-content:start}
.wd-hype{background:var(--ink);color:var(--sun);border-radius:99px;padding:4px 11px 5px;font-size:15px;letter-spacing:2px;box-shadow:0 0 0 3px var(--paper);align-self:flex-start;white-space:nowrap;text-align:center}
.wd-hype small{display:block;font-size:9.5px;letter-spacing:.12em;color:var(--paper);font-weight:800;opacity:.8}
.wd-bmenu{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);display:flex;flex-wrap:wrap;gap:9px;justify-content:center;padding-inline:max(12px,env(safe-area-inset-left,0px)) max(12px,env(safe-area-inset-right,0px));z-index:16}
.wd-bmenu button{border:0;background:var(--paper);border-radius:16px;padding:6px 12px 7px;font-family:var(--display);font-weight:800;font-size:16px;box-shadow:0 0 0 3px var(--ink),0 5px 0 var(--ink);text-align:left;min-width:118px;max-width:31%}
.wd-bmenu button:active{transform:translateY(3px);box-shadow:0 0 0 3px var(--ink),0 2px 0 var(--ink)}
.wd-bmenu button small{display:block;font-family:var(--body);font-size:11.5px;font-weight:700;opacity:.68;line-height:1.25}
.wd-bmenu button:disabled{opacity:.42}
.wd-bmenu button.special{background:var(--sun)}
.wd-bmenu button.call{background:#BFE3F6}
.wd-bmenu button.back{background:var(--paper-2);min-width:0}
.wd-bmenu .who{width:100%;text-align:center;color:var(--paper);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,.7)}
.wd-bmenu .say{max-width:560px;background:rgba(43,29,20,.82);border-radius:14px;padding:7px 14px;font-size:15px;letter-spacing:0;text-transform:none}
/* panel (bag, poster) */
.wd-panel{position:absolute;inset:0;z-index:50;background:rgba(42,35,70,.6);display:grid;place-items:center;padding:calc(env(safe-area-inset-top,0px) + 10px) max(14px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 10px) max(14px,env(safe-area-inset-left,0px))}
.wd-sheet{background:var(--paper);border-radius:22px;box-shadow:0 0 0 3px var(--ink),0 8px 0 var(--ink);width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;overflow:hidden;animation:wdPop .3s cubic-bezier(.3,1.6,.5,1)}
.wd-tabs{display:flex;gap:6px;padding:10px 10px 0;align-items:center;flex-wrap:wrap}
.wd-tabs button{border:0;border-radius:12px 12px 0 0;padding:7px 13px 8px;font-family:var(--display);font-weight:800;font-size:15px;background:var(--paper-2);box-shadow:0 0 0 2.5px var(--ink)}
.wd-tabs button.on{background:var(--sun)}
.wd-tabs .sp{flex:1}
.wd-tabs .close{border-radius:50%;width:38px;height:38px;padding:0;background:var(--paper)}
.wd-pbody{padding:14px 16px 16px;overflow:auto;border-top:3px solid var(--ink);display:grid;gap:12px}
.wd-pbody h3{margin:0;font-family:var(--display);font-weight:900;font-size:19px}
.wd-pbody p{margin:0;font-weight:700;line-height:1.4;font-size:14.5px}
.wd-pbody .fine{font-size:12.5px;opacity:.7}
.wd-list{display:grid;gap:8px}
.wd-row{display:flex;align-items:center;gap:10px;background:#F7EEDD;border-radius:14px;padding:8px 10px;box-shadow:inset 0 0 0 2px rgba(43,29,20,.12)}
.wd-row canvas{width:44px;height:44px;flex:none}
.wd-row .grow{flex:1;min-width:0}
.wd-row b{font-family:var(--display);font-weight:800;font-size:15.5px;display:block}
.wd-row span{font-size:12.5px;font-weight:700;opacity:.72;display:block;line-height:1.3}
.wd-row .n{font-family:var(--display);font-weight:900;font-size:18px}
.wd-row button{border:0;background:var(--leaf);color:#fff;font-weight:800;border-radius:99px;padding:6px 12px;box-shadow:0 0 0 2px var(--ink)}
.wd-row button:disabled{opacity:.4}
.wd-bagwrap{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:12px;min-height:0}
.wd-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px;align-content:start;overflow:auto;max-height:calc(100vh - 150px);padding:2px}
.wd-th{grid-column:1/-1;font-family:var(--display);font-weight:900;font-size:14.5px;margin-top:2px;display:flex;align-items:baseline;gap:8px}
.wd-th span{font-family:var(--body);font-size:12px;font-weight:800;opacity:.55}
.wd-tile{position:relative;border:0;background:#F7EEDD;border-radius:14px;padding:4px 4px 6px;box-shadow:inset 0 0 0 2px rgba(43,29,20,.12);display:grid;justify-items:center;gap:2px;min-width:0}
.wd-tile.on{background:var(--sun);box-shadow:0 0 0 2.5px var(--ink)}
.wd-tile.dim{opacity:.5}
.wd-tile canvas{width:36px;height:36px}
.wd-tile .q{font-family:var(--display);font-weight:900;font-size:24px;line-height:36px;opacity:.4}
.wd-tile b{font-family:var(--body);font-weight:800;font-size:11.5px;line-height:1.15;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.wd-tile i{position:absolute;top:4px;right:6px;font-style:normal;font-family:var(--display);font-weight:900;font-size:13px}
.wd-detail{background:#F7EEDD;border-radius:16px;padding:12px;box-shadow:inset 0 0 0 2px rgba(43,29,20,.12);display:grid;gap:5px;align-content:start;justify-items:start;overflow:auto;max-height:calc(100vh - 150px)}
.wd-detail canvas{width:56px;height:56px;justify-self:center}
.wd-detail i.k{font-style:normal;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--coral)}
.wd-detail b{font-family:var(--display);font-weight:900;font-size:17px;line-height:1.15}
.wd-detail p{font-size:13.5px}
.wd-detail p.alt{opacity:.55;font-style:italic;font-size:12.5px}
.wd-detail .use{border:0;background:var(--leaf);color:#fff;font-weight:800;border-radius:99px;padding:7px 18px;box-shadow:0 0 0 2px var(--ink);margin-top:4px}
.wd-detail .use:disabled{opacity:.4}
@media (max-width:560px){.wd-bagwrap{grid-template-columns:1fr}}
.wd-postwrap{display:grid;grid-template-columns:170px minmax(0,1fr) 200px;gap:12px;align-items:start}
.wd-postwrap .paper{background:#FFFDF6;border-radius:6px;box-shadow:0 0 0 2px var(--ink),4px 6px 0 rgba(43,29,20,.25);padding:9px;transform:rotate(-1.5deg);text-align:center;display:grid;gap:4px;justify-items:center}
.wd-postwrap .paper h2{margin:0;font-family:var(--display);font-weight:900;font-size:22px;color:var(--coral);letter-spacing:.08em;line-height:1}
.wd-postwrap .paper .tag{font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.65}
.wd-postwrap .paper canvas{width:110px;height:110px;border-radius:4px;box-shadow:0 0 0 2px var(--ink)}
.wd-postwrap .paper p{font-size:11.5px;line-height:1.3}
.wd-tile.photo canvas{width:48px;height:48px;border-radius:3px;box-shadow:0 0 0 1.5px var(--ink)}
.wd-detail canvas.pic{width:120px;height:120px;border-radius:4px;box-shadow:0 0 0 2px var(--ink);justify-self:center}
.wd-partywrap{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
.wd-pcard{background:#F7EEDD;border-radius:16px;padding:10px 12px 12px;box-shadow:inset 0 0 0 2px rgba(43,29,20,.12);display:grid;gap:6px}
.wd-pcard.empty{place-items:center;min-height:120px;text-align:center}
.wd-pcard .top{display:flex;gap:10px;align-items:center}
.wd-pcard .top canvas{width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#FFF3D6,#F6D7A6);box-shadow:0 0 0 2.5px var(--ink);flex:none}
.wd-pcard .st{display:grid;gap:3px;min-width:0;flex:1}
.wd-pcard .st>b{font-family:var(--display);font-weight:900;font-size:18px;line-height:1.1}
.wd-pcard .st>b small{font-family:var(--body);font-size:12px;font-weight:800;opacity:.6;margin-left:4px}
.wd-pcard .row{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800}
.wd-pcard .row em{font-style:normal;width:20px;opacity:.6;font-size:11px}
.wd-pcard .row small{font-size:11.5px;opacity:.75;white-space:nowrap}
.wd-pcard .stars{color:#E8A520;letter-spacing:1px;font-size:13px}
.wd-pcard .note{font-size:11.5px;font-weight:700;opacity:.65;line-height:1.3}
.wd-bar{flex:1;height:8px;border-radius:8px;background:#E7D7BC;box-shadow:inset 0 0 0 1.5px var(--ink);overflow:hidden;min-width:40px}
.wd-bar i{display:block;height:100%}
.wd-pcard .lbl{font-size:10.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--coral);margin-top:2px}
.wd-chips{display:flex;flex-wrap:wrap;gap:5px}
.wd-chips span{background:var(--paper);border-radius:10px;padding:3px 8px 4px;box-shadow:0 0 0 1.5px rgba(43,29,20,.25);font-size:12px;line-height:1.2}
.wd-chips b{font-weight:800}.wd-chips i{font-style:normal;opacity:.6;margin-left:5px;font-size:11px;font-weight:700}
@media (max-width:640px){.wd-postwrap{grid-template-columns:1fr}.wd-partywrap{grid-template-columns:1fr}}
.wd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.wd-stat{background:#F7EEDD;border-radius:14px;padding:8px 10px;box-shadow:inset 0 0 0 2px rgba(43,29,20,.12)}
.wd-stat b{display:block;font-family:var(--display);font-size:22px;font-weight:900;line-height:1}
.wd-stat span{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.65}
.wd-poster{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;align-items:start}
.wd-poster .paper{background:#FFFDF6;border-radius:6px;box-shadow:0 0 0 2px var(--ink),4px 6px 0 rgba(43,29,20,.25);padding:12px;transform:rotate(-1deg);text-align:center}
.wd-poster .paper h2{margin:0;font-family:var(--display);font-weight:900;font-size:28px;color:var(--coral);letter-spacing:.04em;line-height:1}
.wd-poster .paper .tag{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin:4px 0 8px}
.wd-poster .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.wd-poster .slot{aspect-ratio:1;border-radius:4px;background:#EFE5D2;box-shadow:inset 0 0 0 2px rgba(43,29,20,.18);display:grid;place-items:center;font-family:var(--display);font-weight:900;color:rgba(43,29,20,.25);font-size:22px;overflow:hidden}
.wd-poster .slot canvas{width:100%;height:100%}
.wd-poster .main canvas{width:100%;max-width:180px;aspect-ratio:1;border-radius:4px;box-shadow:0 0 0 2px var(--ink)}
@media (max-width:620px){.wd-poster{grid-template-columns:1fr}}
/* toast + item get */
.wd-toast{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translateX(-50%);background:rgba(43,29,20,.9);color:var(--paper);font-weight:800;padding:8px 16px;border-radius:14px;opacity:0;pointer-events:none;max-width:min(calc(100% - 32px),460px);text-align:center;line-height:1.35;font-size:15px;z-index:44;white-space:normal;width:max-content}
.wd-toast.show{animation:wdToast 2.6s ease}
@keyframes wdToast{0%{opacity:0;transform:translate(-50%,-8px)}12%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.wd-get{position:absolute;inset:0;z-index:48;display:grid;place-items:center;background:rgba(42,35,70,.45);padding:16px}
.wd-get .sheet{background:var(--paper);border-radius:22px;padding:14px 22px 16px;box-shadow:0 0 0 3px var(--ink),0 8px 0 var(--ink);display:grid;justify-items:center;gap:6px;text-align:center;max-width:380px;animation:wdPop .35s cubic-bezier(.3,1.6,.5,1)}
.wd-get canvas{width:110px;height:110px}
.wd-get b{font-family:var(--display);font-weight:900;font-size:22px;line-height:1.1}
.wd-get i{font-style:normal;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}
.wd-get p{margin:0;font-weight:700;line-height:1.4;font-size:14.5px}
.wd-get .tap{font-size:12px;font-weight:800;opacity:.55}
/* title + cards */
.wd-title{position:absolute;inset:0;display:grid;place-items:center;padding:env(safe-area-inset-top,0px) max(16px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(16px,env(safe-area-inset-left,0px));z-index:40}
.wd-logo{text-align:center;display:grid;gap:12px;justify-items:center;animation:wdDrop .9s cubic-bezier(.2,1.4,.4,1) both}
.wd-logo h1{margin:0;font-family:var(--display);font-weight:900;font-size:clamp(44px,10vw,92px);line-height:.9;color:var(--sun);letter-spacing:.5px;text-shadow:3px 3px 0 var(--ink),-2px -2px 0 var(--paper),2px -2px 0 var(--paper),-2px 2px 0 var(--paper),2px 2px 0 var(--paper),0 10px 0 rgba(43,29,20,.35);transform:rotate(-3deg)}
.wd-logo h1 span{color:var(--coral)}
.wd-logo .chip{margin:0;background:var(--paper);padding:6px 14px;border-radius:99px;box-shadow:0 0 0 3px var(--ink);font-weight:800;font-size:13.5px;letter-spacing:.06em;text-transform:uppercase;transform:rotate(1.5deg)}
.wd-pick{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:4px}
.wd-cb{border:0;background:var(--paper);border-radius:18px;padding:11px 20px 13px;font-family:var(--display);font-weight:800;font-size:20px;box-shadow:0 0 0 3px var(--ink),0 6px 0 var(--ink);transition:transform .12s}
.wd-cb:active{transform:translateY(4px);box-shadow:0 0 0 3px var(--ink),0 2px 0 var(--ink)}
.wd-cb.alt{background:var(--sun)}
.wd-cb small{display:block;font-family:var(--body);font-size:12px;font-weight:700;opacity:.7}
.wd-hint{color:var(--paper);font-size:13px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.7);text-align:center;max-width:40ch;line-height:1.4}
@keyframes wdDrop{from{transform:translateY(-40px) scale(.9);opacity:0}}
.wd-card{position:absolute;inset:0;display:grid;place-items:center;z-index:52;background:rgba(42,35,70,.6);padding-inline:max(16px,env(safe-area-inset-left,0px)) max(16px,env(safe-area-inset-right,0px))}
.wd-card .sheet{background:var(--paper);border-radius:24px;padding:20px 22px 18px;max-width:460px;max-height:calc(100% - 24px);overflow:auto;box-shadow:0 0 0 3px var(--ink),0 9px 0 var(--ink);display:grid;gap:11px;animation:wdPop .35s cubic-bezier(.3,1.6,.5,1)}
.wd-card i.k{font-style:normal;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}
.wd-card h2{margin:0;font-family:var(--display);font-weight:900;font-size:29px;line-height:1.02}
.wd-card p{margin:0;font-weight:700;line-height:1.45;font-size:15px}
.wd-card ul{margin:0;padding-left:20px;font-weight:700;line-height:1.5;font-size:14.5px}
.wd-card .wd-pick{justify-content:flex-start}
.wd-rotate{display:none;position:absolute;inset:0;z-index:80;background:var(--dusk);color:var(--paper);place-items:center;text-align:center;padding-inline:16px}
.wd-rotate div{display:grid;gap:14px;justify-items:center}
.wd-rotate b{font-family:var(--display);font-size:28px;font-weight:900;color:var(--sun)}
.wd-rotate p{margin:0;font-weight:700;max-width:26ch;line-height:1.4}
.wd-rotate i{font-style:normal;font-size:56px;display:inline-block;animation:wdTurn 2s ease-in-out infinite}
.wd-rotate button{border:0;background:var(--paper);color:var(--ink);border-radius:99px;padding:8px 16px;font-weight:800;box-shadow:0 0 0 3px var(--ink)}
@keyframes wdTurn{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
@media (orientation:portrait) and (max-width:820px){.wd-rotate{display:grid}}
@media (prefers-reduced-motion:reduce){.wd *{animation:none!important;transition:none!important}}
`;

const HTML = `
<canvas class="wd-cv"></canvas>
<div class="wd-area"><b></b><span></span></div>
<div class="wd-goal" hidden><i>Goal</i><span></span></div>
<div class="wd-talk" hidden><div class="portrait"><canvas width="168" height="168"></canvas></div><div class="box"><span class="name"></span><p></p><small class="sub" hidden></small><div class="choices" hidden></div><span class="more" hidden>▼</span></div></div>
<div class="wd-joy" hidden><i></i></div>
<button class="wd-btn wd-a" hidden aria-label="A button">A</button>
<button class="wd-btn wd-b" hidden aria-label="B button: hero skill"><span></span><small></small></button>
<button class="wd-btn wd-p" hidden aria-label="Partner skill"><span>🐾</span><small></small></button>
<div class="wd-bhud" hidden></div>
<div class="wd-bmenu" hidden></div>
<div class="wd-toast"></div>
<div class="wd-get" hidden><div class="sheet"><i></i><canvas width="220" height="220"></canvas><b></b><p></p><span class="tap">Tap to continue</span></div></div>
<div class="wd-title" hidden></div>
<div class="wd-card" hidden><div class="sheet"></div></div>
<div class="wd-panel" hidden></div>
<button class="wd-x" aria-label="Close the game">✕</button>
<button class="wd-bag" hidden aria-label="Bag and Missing Dog poster">🎒</button>
<button class="wd-pause" hidden aria-label="Pause">❚❚</button>
<div class="wd-pausebox" hidden><div class="sheet"><h2>Paused</h2><p></p><div class="wd-pick"></div></div></div>
<button class="wd-mute" aria-label="Sound on or off">♪</button>
<div class="wd-rotate"><div><i>📱</i><b>Turn your phone sideways</b><p>Where's Dayla? plays in landscape, like a handheld console.</p><button class="wd-x2">Close game</button></div></div>
<div class="wd-load">🐾<span>Loading Where's Dayla?<small>Tivoli Park is waking up…</small></span></div>`;

/* ================= audio ================= */
let AC = null, MASTER = null;
WD.soundOn = true;
function audio(){
  if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = .55; MASTER.connect(AC.destination); }catch(e){ return null; } }
  if(AC.state === 'suspended') AC.resume();
  return AC;
}
WD.audio = audio;
function tone(type, f, t, d, v, f2){ const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(MASTER); o.start(t); o.stop(t + d + .03); }
const NOISE = {};
function noise(t, d, v, hp){
  const key = Math.round(d * 100); let b = NOISE[key];
  if(!b){ b = AC.createBuffer(1, Math.max(1, Math.floor(AC.sampleRate * d)), AC.sampleRate); const ch = b.getChannelData(0); for(let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length); NOISE[key] = b; }
  const n = AC.createBufferSource(); n.buffer = b; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = hp || 1200; f.Q.value = .7; const g = AC.createGain(); g.gain.value = v; n.connect(f).connect(g).connect(MASTER); n.start(t);
}
WD.sfx = function(k){
  if(!WD.soundOn || !audio()) return; const t = AC.currentTime;
  switch(k){
    case 'open': tone('sine', 660, t, .08, .08); tone('sine', 990, t + .05, .1, .06); break;
    case 'tap': tone('sine', 880, t, .05, .05); break;
    case 'hit': tone('sine', 170, t, .16, .3, 55); tone('triangle', 880, t, .07, .07, 440); tone('sine', 1320, t + .015, .05, .03); noise(t, .04, .05, 2500); break;
    case 'big': tone('sine', 140, t, .28, .36, 40); tone('triangle', 660, t, .12, .08, 330); [523, 784, 1047].forEach((f, i) => tone('triangle', f, t + .04 + i * .035, .16, .05)); noise(t, .06, .06, 1800); break;
    case 'nice': [784, 988, 1175].forEach((f, i) => tone('triangle', f, t + i * .06, .14, .09)); break;
    case 'perfect': [784, 988, 1175, 1568].forEach((f, i) => tone('square', f, t + i * .05, .14, .05)); noise(t + .1, .5, .12, 2600); break;
    case 'miss': tone('triangle', 300, t, .2, .08, 150); break;
    case 'guard': tone('square', 1200, t, .06, .06); tone('triangle', 600, t, .12, .08); break;
    case 'jump': tone('square', 300, t, .16, .05, 700); break;
    case 'bark': tone('sawtooth', 520, t, .07, .06, 380); tone('square', 600, t + .09, .08, .05, 420); break;
    case 'yap': tone('square', 900, t, .05, .05, 700); break;
    case 'meow': tone('sawtooth', 520, t, .32, .05, 760); tone('triangle', 780, t + .12, .25, .04, 520); break;
    case 'hiss': noise(t, .45, .2, 4200); break;
    case 'cheer': noise(t, 1.2, .22, 1800); noise(t + .1, 1, .12, 3200); break;
    case 'heal': [523, 659, 784, 1047].forEach((f, i) => tone('sine', f, t + i * .07, .2, .08)); break;
    case 'whoosh': noise(t, .35, .25, 700); break;
    case 'clang': [1250, 1873, 2410, 3100].forEach((f, i) => tone('triangle', f, t + i * .005, 1.1 - i * .2, .07)); noise(t, .15, .3, 3000); break;
    case 'squeak': tone('square', 1300, t, .07, .05, 1900); tone('square', 1700, t + .08, .09, .04, 1200); break;
    case 'door': tone('triangle', 180, t, .12, .1, 120); noise(t, .08, .15, 500); break;
    case 'step': noise(t, .05, .08, 400); break;
    case 'ring': [0, .32].forEach(o => { tone('sine', 1320, t + o, .12, .06); tone('sine', 1660, t + o + .06, .12, .05); }); break;
    case 'get': [523, 659, 784, 1047, 1319].forEach((f, i) => tone('triangle', f, t + i * .08, .25, .08)); break;
    case 'clue': [659, 880, 1175].forEach((f, i) => tone('sine', f, t + i * .1, .3, .07)); tone('triangle', 330, t, .5, .05); break;
    case 'sniff': for(let i = 0; i < 4; i++) noise(t + i * .09, .06, .18, 2400); break;
    case 'light': tone('sine', 1200, t, .3, .05, 2400); noise(t, .2, .05, 6000); break;
    case 'dash': noise(t, .25, .2, 900); tone('square', 200, t, .2, .05, 500); break;
    case 'level': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone('square', f, t + i * .09, .2, .05)); break;
    case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone('square', f, t + i * .11, .18, .06)); break;
    case 'lose': [440, 392, 349, 262].forEach((f, i) => tone('triangle', f, t + i * .2, .3, .08)); break;
    case 'whistle': tone('sine', 2200, t, .5, .06, 2600); tone('sine', 2250, t + .1, .35, .04); break;
    case 'honk': tone('sawtooth', 330, t, .25, .07); tone('sawtooth', 415, t, .25, .05); break;
    case 'gulp': tone('sine', 300, t, .12, .1, 140); break;
    case 'munch': for(let i = 0; i < 5; i++) noise(t + i * .07, .05, .2, 1400 + (i % 2) * 600); break;
  }
};
const VOICE = { David: [190, 'triangle'], Laura: [360, 'triangle'], Veci: [150, 'square'], Dayla: [620, 'square'], Alejandro: [520, 'square'], Kairos: [430, 'sawtooth'], 'Cat Agent': [300, 'sawtooth'], 'Sergeant Hairball': [120, 'sawtooth'], Alejandra: [330, 'triangle'], Samuel: [210, 'triangle'], Iguana: [160, 'sine'] };
let lastBlip = 0;
WD.blip = function(name){ if(!WD.soundOn || !AC) return; const now = AC.currentTime; if(now - lastBlip < .055) return; lastBlip = now; const [f, ty] = VOICE[name] || [300, 'sine']; tone(ty, f * (.92 + Math.random() * .18), now, .05, .045); };

/* music: a tiny sequencer. Every place has its own theme. */
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = WD.SONGS = {
  title: { bpm: 76, lead: 'bell', groove: 'none', chords: [[41, 53, 57, 60], [45, 52, 57, 60], [46, 53, 58, 62], [48, 55, 60, 64]],
    mel: [77, 0, 0, 72, 0, 0, 74, 0, 76, 0, 0, 0, 72, 0, 0, 0, 76, 0, 0, 72, 0, 0, 69, 0, 72, 0, 0, 0, 0, 0, 0, 0, 74, 0, 0, 70, 0, 0, 74, 0, 77, 0, 0, 0, 74, 0, 0, 0, 76, 0, 72, 0, 79, 0, 76, 0, 77, 0, 0, 0, 0, 0, 0, 0] },
  home: { bpm: 92, lead: 'pluck', groove: 'cozy', chords: [[41, 53, 57, 60], [38, 50, 53, 57], [46, 53, 58, 62], [48, 55, 60, 64]],
    mel: [72, 0, 69, 0, 72, 0, 77, 0, 76, 0, 74, 0, 72, 0, 0, 0, 74, 0, 69, 0, 74, 0, 77, 0, 76, 0, 0, 0, 0, 0, 0, 0, 70, 0, 74, 0, 77, 0, 74, 0, 72, 0, 70, 0, 69, 0, 0, 0, 67, 0, 72, 0, 76, 0, 79, 0, 77, 0, 0, 0, 0, 0, 0, 0] },
  mystery: { bpm: 84, lead: 'bell', groove: 'sneak', chords: [[38, 50, 53, 57], [34, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]],
    mel: [74, 0, 0, 0, 73, 0, 0, 0, 74, 0, 0, 0, 69, 0, 0, 0, 70, 0, 0, 0, 69, 0, 0, 0, 67, 0, 0, 0, 0, 0, 0, 0, 74, 0, 0, 0, 77, 0, 0, 0, 76, 0, 0, 74, 73, 0, 0, 0, 70, 0, 69, 0, 67, 0, 65, 0, 64, 0, 0, 0, 0, 0, 0, 0] },
  park: { bpm: 112, lead: 'pan', groove: 'calypso', chords: [[48, 52, 55, 60], [53, 57, 60, 65], [55, 59, 62, 67], [48, 52, 55, 64]],
    mel: [72, 0, 76, 79, 0, 76, 72, 0, 74, 0, 76, 0, 72, 0, 0, 0, 77, 0, 81, 84, 0, 81, 77, 0, 79, 0, 77, 76, 74, 0, 0, 0, 74, 0, 79, 83, 0, 79, 74, 0, 76, 0, 74, 72, 71, 0, 74, 0, 72, 0, 76, 79, 84, 0, 79, 76, 72, 0, 0, 0, 0, 0, 0, 0] },
  den: { bpm: 104, lead: 'pluck', groove: 'country', chords: [[43, 55, 59, 62], [48, 52, 55, 60], [50, 54, 57, 62], [43, 55, 59, 62]],
    mel: [67, 0, 71, 0, 74, 0, 71, 74, 76, 0, 74, 0, 71, 0, 0, 0, 72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 0, 0, 0, 0, 0, 0, 74, 0, 78, 0, 81, 0, 78, 0, 79, 0, 78, 0, 76, 0, 74, 0, 71, 0, 74, 0, 72, 0, 69, 0, 67, 0, 0, 0, 0, 0, 0, 0] },
  courts: { bpm: 92, lead: 'square', groove: 'hiphop', chords: [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]],
    mel: [76, 0, 0, 76, 0, 0, 74, 0, 72, 0, 0, 0, 69, 0, 0, 0, 72, 0, 0, 72, 0, 0, 74, 0, 76, 0, 74, 0, 72, 0, 0, 0, 77, 0, 0, 77, 0, 0, 76, 0, 74, 0, 0, 0, 72, 0, 0, 0, 71, 0, 0, 71, 0, 74, 0, 72, 69, 0, 0, 0, 0, 0, 0, 0] },
  lot: { bpm: 120, lead: 'square', groove: 'sneak', chords: [[40, 52, 55, 59], [36, 52, 55, 60], [45, 52, 57, 60], [47, 51, 54, 59]],
    mel: [64, 0, 67, 0, 71, 0, 0, 0, 72, 0, 71, 0, 67, 0, 0, 0, 64, 0, 67, 0, 71, 0, 76, 0, 75, 0, 0, 0, 71, 0, 0, 0, 72, 0, 76, 0, 79, 0, 0, 0, 78, 0, 76, 0, 72, 0, 0, 0, 71, 0, 72, 0, 71, 0, 69, 0, 71, 0, 0, 0, 0, 0, 0, 0] },
  battle: { bpm: 148, lead: 'square', groove: 'drive', chords: [[50, 57, 62, 65], [46, 58, 62, 65], [48, 55, 60, 64], [45, 57, 61, 64]],
    mel: [74, 0, 74, 77, 0, 74, 72, 0, 70, 0, 69, 0, 70, 72, 0, 0, 74, 0, 74, 77, 0, 79, 81, 0, 79, 0, 77, 0, 76, 0, 0, 0, 77, 0, 77, 79, 0, 77, 76, 0, 74, 0, 72, 0, 70, 72, 0, 0, 69, 0, 73, 76, 0, 79, 81, 0, 85, 0, 81, 0, 76, 0, 73, 0] },
  boss: { bpm: 132, lead: 'square', groove: 'march', chords: [[46, 58, 62, 65], [39, 58, 63, 67], [41, 57, 60, 65], [46, 58, 62, 65]],
    mel: [70, 0, 70, 70, 74, 0, 70, 0, 77, 0, 0, 0, 74, 0, 0, 0, 75, 0, 75, 75, 79, 0, 75, 0, 82, 0, 0, 0, 79, 0, 0, 0, 77, 0, 79, 0, 81, 0, 77, 0, 72, 0, 74, 0, 75, 0, 72, 0, 70, 0, 74, 0, 77, 0, 82, 0, 81, 0, 0, 0, 82, 0, 0, 0] },
  end: { bpm: 72, lead: 'bell', groove: 'cozy', chords: [[48, 52, 55, 60], [45, 52, 57, 60], [41, 53, 57, 60], [43, 55, 59, 62]],
    mel: [76, 0, 0, 79, 0, 0, 84, 0, 83, 0, 0, 0, 79, 0, 0, 0, 81, 0, 0, 76, 0, 0, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0, 77, 0, 0, 76, 0, 0, 74, 0, 72, 0, 0, 0, 69, 0, 0, 0, 71, 0, 72, 0, 74, 0, 79, 0, 76, 0, 0, 0, 0, 0, 0, 0] }
};
function lead(kind, f, t, d, v){
  if(kind === 'pan'){ tone('sine', f, t, d * 1.6, v); tone('sine', f * 2.01, t, d * .6, v * .45); tone('triangle', f * 3.98, t, d * .25, v * .12); }
  else if(kind === 'bell'){ tone('sine', f, t, d * 3, v * .9); tone('sine', f * 2.76, t, d * 1.2, v * .25); tone('sine', f * 5.4, t, d * .5, v * .08); }
  else if(kind === 'pluck'){ tone('triangle', f, t, d * 1.3, v * .95); tone('sine', f * 2, t, d * .5, v * .3); }
  else tone('square', f, t, d * 1.7, v * .62);
}
const MUS = WD.MUS = (() => {
  let cur = null, step = 0, nextT = 0, timer = null;
  function tick(){
    if(!cur || !AC) return; const S0 = SONGS[cur]; if(!S0) return; const dur = 60 / S0.bpm / 2;
    if(nextT < AC.currentTime - .3) nextT = AC.currentTime + .05;
    while(nextT < AC.currentTime + .15){
      const bar = Math.floor(step / 16) % 4, s = step % 16, ch = S0.chords[bar], b8 = s % 8;
      if(WD.soundOn){
        const gr = S0.groove;
        if(gr === 'calypso'){ if(b8 === 0 || b8 === 3 || b8 === 6) tone('triangle', NOTE(ch[0] - 12 + (b8 === 3 ? 7 : 0)), nextT, dur * 1.6, .16); if(b8 === 2 || b8 === 5 || b8 === 7) ch.slice(1).forEach(n => tone('triangle', NOTE(n), nextT, dur * .7, .022)); noise(nextT, .03, s % 2 ? .025 : .045, 8000); if(b8 === 4) noise(nextT, .08, .07, 1800); }
        else if(gr === 'drive'){ if(s % 2 === 0) tone('triangle', NOTE(ch[0] - 12 + (s % 4 === 2 ? 12 : 0)), nextT, dur * 1.2, .15); if(s % 4 === 2) ch.slice(1).forEach(n => tone('sine', NOTE(n), nextT, dur * 1.2, .025)); if(s % 2 === 1) noise(nextT, .04, .05, 6000); if(s % 8 === 4) noise(nextT, .1, .12, 1500); }
        else if(gr === 'cozy'){ if(s % 8 === 0) tone('sine', NOTE(ch[0] - 12), nextT, dur * 6, .12); if(s % 2 === 0) tone('triangle', NOTE(ch[1 + (s / 2) % 3]), nextT, dur * 1.5, .025); if(s % 4 === 2) noise(nextT, .03, .02, 7000); }
        else if(gr === 'sneak'){ if(s % 4 === 0) tone('triangle', NOTE(ch[0] - 12), nextT, dur * .6, .17); if(s % 4 === 2) tone('triangle', NOTE(ch[0] - 5), nextT, dur * .5, .1); if(s % 8 === 6) ch.slice(1).forEach(n => tone('sine', NOTE(n), nextT, dur * .4, .022)); if(s % 2 === 1) noise(nextT, .02, .02, 9000); }
        else if(gr === 'country'){ if(s % 4 === 0) tone('triangle', NOTE(ch[0] - 12 + (s % 8 === 4 ? 7 : 0)), nextT, dur * 1.3, .16); if(s % 4 === 2) ch.slice(1).forEach(n => tone('triangle', NOTE(n), nextT, dur * .6, .028)); if(s % 4 === 2) noise(nextT, .05, .06, 3000); }
        else if(gr === 'hiphop'){ if(s === 0 || s === 6 || s === 10) tone('sine', 62, nextT, .28, .32, 40); if(s === 4 || s === 12) noise(nextT, .14, .2, 1400); if(s % 2 === 0) noise(nextT, .02, s % 4 ? .03 : .05, 9000); if(s === 0 || s === 8) tone('triangle', NOTE(ch[0] - 12), nextT, dur * 5, .1); if(s % 8 === 2) ch.slice(1).forEach(n => tone('sine', NOTE(n), nextT, dur * 3, .018)); }
        else if(gr === 'march'){ if(s % 4 === 0) tone('triangle', NOTE(ch[0] - 12), nextT, dur * 1.2, .17); if(s % 4 === 2) ch.slice(1).forEach(n => tone('square', NOTE(n), nextT, dur * .5, .016)); noise(nextT, .05, (s % 4 === 0 ? .12 : .045), 2200); if(s % 16 === 14) noise(nextT + dur / 2, .05, .08, 2200); }
        else { if(s === 0) tone('sine', NOTE(ch[0] - 12), nextT, dur * 14, .1); if(s % 4 === 0) ch.slice(1).forEach((n, i) => tone('sine', NOTE(n + 12), nextT + i * dur * .5, dur * 3, .02)); }
        const m = S0.mel[step % S0.mel.length]; if(m) lead(S0.lead, NOTE(m), nextT, dur, S0.lead === 'bell' ? .07 : .08);
      }
      nextT += dur; step++;
    }
  }
  return {
    get cur(){ return cur; },
    play(name){ if(cur === name) return; cur = name; step = 0; if(!audio()) return; nextT = AC.currentTime + .08; if(!timer) timer = setInterval(tick, 50); },
    stop(){ cur = null; if(timer){ clearInterval(timer); timer = null; } }
  };
})();

/* ================= state ================= */
let root = null, api = null, raf = 0, dead = true, prevT = 0;
WD.time = 0;           // game clock in seconds, frozen while a menu is open
WD.paused = false;
WD.letter = 0; let letterT = 0;
const timers = [], tweens = [];
WD.wait = ms => new Promise(r => timers.push({ at: WD.time + ms / 1000, r }));
WD.tween = (ms, fn) => new Promise(r => tweens.push({ t0: WD.time, d: Math.max(.001, ms / 1000), fn, r }));
function tickTimers(){
  for(let i = timers.length - 1; i >= 0; i--) if(WD.time >= timers[i].at){ const r = timers[i].r; timers.splice(i, 1); r(); }
  for(let i = tweens.length - 1; i >= 0; i--){ const w = tweens[i], u = Math.min(1, (WD.time - w.t0) / w.d); try{ w.fn(u); }catch(e){ console.error(e); } if(u >= 1){ tweens.splice(i, 1); w.r(); } }
}

/* screen */
const view = WD.view = { w: 0, h: 0, dpr: 1, S: 1 };
WD.ANCHOR = .62;
function resize(){
  if(!root) return; const cv = WD.cv;
  view.w = root.clientWidth || innerWidth; view.h = root.clientHeight || innerHeight; view.dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = Math.round(view.w * view.dpr); cv.height = Math.round(view.h * view.dpr);
  view.S = Math.min(view.h / 330, view.w / 300);
}

/* camera + parallax layers */
const cam = WD.cam = { x: 300, y: 66, z: 1, sx: 0, sy: 0, lock: false, shake: 0 };
WD.viewL = 200;
WD.setLayer = function(f){
  const ctx = WD.ctx, z = 1 + (cam.z - 1) * Math.min(1, f + .2), sc = f >= 1 ? 1 + (f - 1) * .6 : .5 + .5 * f, k = view.dpr * view.S * z * sc;
  const shx = cam.shake ? (Math.random() - .5) * cam.shake : 0;
  const hy = view.dpr * (view.h * WD.ANCHOR + cam.sy) + (0 - cam.y) * view.dpr * view.S * cam.z;
  ctx.setTransform(k, 0, 0, k, view.dpr * (view.w / 2 + cam.sx + shx), hy); ctx.translate(-cam.x * f, 0);
  WD.viewL = view.w / (2 * view.S * z * sc); return k;
};
WD.toScreen = function(x, y, f){ const z = cam.z; return [view.dpr * (view.w / 2 + cam.sx + (x - cam.x * (f || 1)) * view.S * z), view.dpr * (view.h * WD.ANCHOR + cam.sy + (y - cam.y) * view.S * z)]; };
WD.horizonY = () => view.h * WD.ANCHOR + cam.sy + (0 - cam.y) * view.S * cam.z;
WD.camTo = (x, z, ms) => { const x0 = cam.x, z0 = cam.z; cam.lock = true; return WD.tween(ms, u => { const e = ease(u); cam.x = lerp(x0, x, e); cam.z = lerp(z0, z, e); }); };

/* ================= input ================= */
const input = WD.input = { keys: {}, a: false, jx: 0, jy: 0 };
let handlers = {};
WD.onButton = (k, fn) => { handlers[k] = fn; };
function press(k){
  audio();
  if(WD.pausedByUser) return;
  if(k === 'a'){ if(input.a) return; input.a = true; btn('a', true); }
  if(WD.cmdPress && k === 'a'){ WD.cmdPress(); return; }
  if(WD.getOpen){ if(k === 'a') WD.closeGet(); return; }
  if(WD.talkPress && k === 'a'){ WD.talkPress(); return; }
  if(WD.paused) return;
  const s = WD.scene; if(!s) return;
  if(k === 'a' && s.onA) s.onA(); if(k === 'b' && s.onB) s.onB(); if(k === 'p' && s.onP) s.onP();
}
function release(k){ if(k === 'a'){ if(!input.a) return; input.a = false; btn('a', false); } }
function btn(k, on){ const b = root && root.querySelector('.wd-' + k); if(b) b.classList.toggle('down', on); }
function onKey(e){
  if(dead) return;
  const down = e.type === 'keydown', k = e.key;
  if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
  if(down && e.repeat) return;
  // keyboard menus: arrows move between buttons, A/Enter picks the focused one
  const ae = document.activeElement, menuBtn = ae && root && root.contains(ae) && ae.tagName === 'BUTTON' && !ae.classList.contains('wd-btn') && ae.closest('.wd-bmenu,.choices,.wd-card,.wd-panel,.wd-title,.wd-pausebox');
  if(down && menuBtn && [' ', 'Enter', 'z', 'Z'].includes(k)){ e.preventDefault(); ae.click(); return; }
  if(down && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)){
    const box = ['.wd-pausebox', '.wd-panel', '.wd-card', '.wd-bmenu', '.wd-talk .choices', '.wd-title'].map(s => root.querySelector(s)).find(el => el && !el.hidden && el.offsetParent !== null && el.querySelector('button:not([disabled])'));
    if(box){ const bs = [...box.querySelectorAll('button:not([disabled])')]; const i = bs.indexOf(ae); const d = (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 1; bs[(i < 0 ? 0 : (i + d + bs.length) % bs.length)].focus({ preventScroll: true }); return; }
  }
  input.keys[k] = down;
  if([' ', 'Enter', 'z', 'Z'].includes(k)){ e.preventDefault(); down ? press('a') : release('a'); }
  else if(down && (k === 'x' || k === 'X')) press('b');
  else if(down && (k === 'c' || k === 'C')) press('p');
  else if(down && k === 'Escape'){ if(WD.pausedByUser) WD.resume(); else if(WD.panelOpen) WD.closePanel(); else WD.pause(); }
  else if(down && (k === 'm' || k === 'M')){ if(WD.panelOpen) WD.closePanel(); else if(WD.scene && WD.scene.onMenu) WD.scene.onMenu(); }
}
WD.stick = function(){
  let x = input.jx, y = input.jy; const K = input.keys;
  if(K.ArrowLeft || K.a || K.A) x = -1; if(K.ArrowRight || K.d || K.D) x = 1;
  if(K.ArrowUp || K.w || K.W) y = -1; if(K.ArrowDown || K.s || K.S) y = 1;
  const L = Math.hypot(x, y); if(L > 1){ x /= L; y /= L; }
  return { x, y, L: Math.min(1, L) };
};
function wireControls(){
  const q = s => root.querySelector(s);
  ['a', 'b', 'p'].forEach(k => {
    const b = q('.wd-' + k);
    b.addEventListener('pointerdown', e => { e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(x){} if(k !== 'a') b.classList.add('down'); press(k); });
    const up = () => { if(k === 'a') release('a'); else b.classList.remove('down'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
  const joy = q('.wd-joy'), knob = joy.querySelector('i'); let joyId = null;
  const move = e => { const r = joy.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const L = Math.hypot(dx, dy), M = 44; if(L > M){ dx *= M / L; dy *= M / L; } knob.style.transform = `translate(${dx}px,${dy}px)`; input.jx = Math.abs(dx) > 6 ? dx / M : 0; input.jy = Math.abs(dy) > 6 ? dy / M : 0; };
  joy.addEventListener('pointerdown', e => { e.preventDefault(); joyId = e.pointerId; try{ joy.setPointerCapture(e.pointerId); }catch(x){} move(e); });
  joy.addEventListener('pointermove', e => { if(e.pointerId === joyId) move(e); });
  const end = () => { joyId = null; input.jx = input.jy = 0; knob.style.transform = ''; };
  joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end); joy.addEventListener('lostpointercapture', end);
  q('.wd-talk').addEventListener('pointerdown', e => { if(e.target.closest('.choices')) return; e.preventDefault(); press('a'); release('a'); });
  q('.wd-get').addEventListener('pointerdown', e => { e.preventDefault(); if(WD.getOpen) WD.closeGet(); });
  q('.wd-mute').addEventListener('click', () => { WD.soundOn = !WD.soundOn; q('.wd-mute').textContent = WD.soundOn ? '♪' : '🔇'; if(WD.soundOn) audio(); });
  q('.wd-x').addEventListener('click', () => { WD.saveNow(); api.close(); });
  q('.wd-x2').addEventListener('click', () => { WD.saveNow(); api.close(); });
  q('.wd-pause').addEventListener('click', () => { audio(); WD.pause(); });
  q('.wd-bag').addEventListener('click', () => { audio(); if(WD.openBag && !WD.paused && WD.mode === 'explore') WD.openBag(); });
}
WD.showControls = function(on){
  const q = s => root.querySelector(s);
  q('.wd-joy').hidden = !on; q('.wd-a').hidden = !on;
  const sk = on && WD.heroSkill ? WD.heroSkill() : null;
  const b = q('.wd-b'); b.hidden = !sk; if(sk){ b.querySelector('span').textContent = sk.icon; b.querySelector('small').textContent = sk.label; }
  const pk = on && WD.partnerSkill ? WD.partnerSkill() : null;
  const p = q('.wd-p'); p.hidden = !pk; if(pk){ p.querySelector('span').textContent = pk.icon; p.querySelector('small').textContent = pk.label; }
  q('.wd-bag').hidden = !on;
  if(!on){ input.jx = input.jy = 0; const k = q('.wd-joy i'); if(k) k.style.transform = ''; }
};
WD.$ = s => root.querySelector(s);

/* ================= little UI ================= */
let toastT = 0;
WD.toast = function(text){ const el = WD.$('.wd-toast'); el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2700); };
let areaT = 0;
WD.showArea = function(name, sub){ const a = WD.$('.wd-area'); const g = WD.$('.wd-goal'); g.style.visibility = 'hidden'; clearTimeout(areaT); areaT = setTimeout(() => { g.style.visibility = ''; }, 3300); a.querySelector('b').textContent = name; a.querySelector('span').textContent = sub || ''; a.classList.add('show'); setTimeout(() => a.classList.remove('show'), 3000); };
WD.setGoal = function(text){ const g = WD.$('.wd-goal'); if(!text){ g.hidden = true; return; } const was = g.querySelector('span').textContent; g.querySelector('span').textContent = text; g.hidden = false; if(was !== text){ g.classList.remove('new'); void g.offsetWidth; g.classList.add('new'); } };
WD.showGoal = function(on){ const g = WD.$('.wd-goal'); if(on && g.querySelector('span').textContent) g.hidden = false; else if(!on) g.hidden = true; };
/* a card (end of chapter, confirmations). buttons: [{label, sub, alt}] → index */
WD.card = function(html, buttons){
  return new Promise(r => {
    const c = WD.$('.wd-card'), sh = c.querySelector('.sheet');
    sh.innerHTML = html + `<div class="wd-pick">${(buttons || [{ label: 'OK' }]).map((b, i) => `<button class="wd-cb ${b.alt ? 'alt' : ''}" data-i="${i}">${U.esc(b.label)}${b.sub ? `<small>${U.esc(b.sub)}</small>` : ''}</button>`).join('')}</div>`;
    c.hidden = false; WD.sfx('open');
    sh.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { WD.sfx('tap'); c.hidden = true; r(+b.dataset.i); });
  });
};

/* ================= pause ================= */
WD.pausedByUser = false; let pausedSong = null;
WD.pause = function(){
  if(dead || WD.pausedByUser || WD.panelOpen || WD.getOpen || !WD.G || !WD.G.started) return;
  const card = root.querySelector('.wd-card'); if(card && !card.hidden) return;
  WD.pausedByUser = true; WD.paused = true; pausedSong = MUS.cur; MUS.stop(); WD.sfx('tap');
  const box = root.querySelector('.wd-pausebox'), explore = WD.mode === 'explore';
  box.querySelector('p').textContent = WD.mode === 'battle' ? 'The battle is frozen. Timing picks up right where you left off.' : 'Everything is frozen until you come back.';
  const btns = [['resume', 'Resume', 'alt'], explore ? ['bag', 'Bag & poster', ''] : null, ['sound', WD.soundOn ? 'Sound: on' : 'Sound: off', ''], explore ? ['save', 'Save', ''] : null, ['quit', 'Save & close game', '']].filter(Boolean);
  const pick = box.querySelector('.wd-pick'); pick.innerHTML = btns.map(([k, l, c]) => `<button class="wd-cb ${c}" data-p="${k}">${l}</button>`).join('');
  pick.querySelectorAll('button').forEach(b => b.onclick = () => {
    const k = b.dataset.p;
    if(k === 'resume') WD.resume();
    else if(k === 'bag'){ WD.resume(); if(WD.openBag) WD.openBag(); }
    else if(k === 'sound'){ WD.soundOn = !WD.soundOn; root.querySelector('.wd-mute').textContent = WD.soundOn ? '♪' : '🔇'; b.textContent = WD.soundOn ? 'Sound: on' : 'Sound: off'; if(WD.soundOn) audio(); WD.sfx('tap'); }
    else if(k === 'save'){ WD.saveNow(); b.textContent = 'Saved ✓'; WD.sfx('get'); }
    else if(k === 'quit'){ WD.saveNow(); api.close(); }
  });
  box.hidden = false; const f = pick.querySelector('button'); if(f) f.focus({ preventScroll: true });
};
WD.resume = function(){
  if(!WD.pausedByUser) return;
  WD.pausedByUser = false; WD.paused = !!(WD.panelOpen || WD.getOpen);
  root.querySelector('.wd-pausebox').hidden = true; prevT = performance.now();
  if(pausedSong) MUS.play(pausedSong); pausedSong = null; WD.sfx('tap');
};
function onHide(){ if(document.hidden && WD.G && WD.G.started && !dead){ WD.saveNow(); WD.pause(); } }

/* ================= page-turn transition ================= */
let turnU = -1;
WD.pageTurn = function(mid){
  return new Promise(r => {
    WD.sfx('whoosh'); const t0 = performance.now(); let switched = false;
    const step = () => { if(dead) return; const u = (performance.now() - t0) / 1100; turnU = u; if(u >= .5 && !switched){ switched = true; Promise.resolve().then(mid).catch(e => console.error(e)); } if(u < 1) requestAnimationFrame(step); else { turnU = -1; r(); } };
    step();
  });
};
function drawPageTurn(){
  if(turnU < 0) return; const ctx = WD.ctx; ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  const u = Math.min(1, turnU), W2 = view.w, H2 = view.h;
  const edge = u < .5 ? W2 * (1 - ease(u * 2)) * 1.1 : W2 * -ease((u - .5) * 2) * 1.1;
  ctx.fillStyle = '#FFF8EC';
  if(u < .5) ctx.fillRect(edge, 0, W2 - edge + 2, H2); else ctx.fillRect(0, 0, W2 + edge, H2);
  const ex = u < .5 ? edge : W2 + edge;
  const g = ctx.createLinearGradient(ex - 40, 0, ex + 40, 0); g.addColorStop(0, 'rgba(43,29,20,0)'); g.addColorStop(.5, 'rgba(43,29,20,.25)'); g.addColorStop(1, 'rgba(43,29,20,0)'); ctx.fillStyle = g; ctx.fillRect(ex - 40, 0, 80, H2);
  ctx.strokeStyle = 'rgba(43,29,20,.08)'; ctx.lineWidth = 1; for(let y = 30; y < H2; y += 28){ ctx.beginPath(); ctx.moveTo(u < .5 ? edge : 0, y); ctx.lineTo(u < .5 ? W2 : W2 + edge, y); ctx.stroke(); }
}
/* fade to/from a colour (used for "later…" beats) */
let fadeA = 0, fadeCol = '#140F22';
WD.fade = (to, ms, col) => { if(col) fadeCol = col; const a0 = fadeA; return WD.tween(ms, u => { fadeA = lerp(a0, to, u); }); };

/* ================= saves ================= */
WD.G = null;
const LS = () => 'wd-save-' + (api ? api.me : 'x');
WD.newSave = function(){
  return { v: 2, area: 'home', x: 0, y: 0, flags: {}, lv: 1, xp: 0, hp: 10, mhp: 10, sp: 3, msp: 5, pp: 3, mpp: 3, partner: null, party: {}, items: { arepa: 1 }, key: [], toys: [], words: [], verses: [], photos: [], clues: [], learned: [], chapter: 0, at: 0 };
};
WD.loadSave = function(){
  let a = null, b = null;
  try{ a = api.load(); }catch(e){}
  try{ b = JSON.parse(localStorage.getItem(LS()) || 'null'); }catch(e){}
  const ok = s => s && s.v === 2 && s.flags;
  const pick = ok(a) && ok(b) ? ((b.at || 0) > (a.at || 0) ? b : a) : ok(a) ? a : ok(b) ? b : null;
  return pick ? JSON.parse(JSON.stringify(pick)) : null;
};
let lastSave = 0;
WD.saveNow = function(){
  const G = WD.G; if(!G || !G.started || !api) return;
  if(WD.beforeSave) try{ WD.beforeSave(G); }catch(e){}
  G.at = Date.now(); lastSave = performance.now();
  const copy = JSON.parse(JSON.stringify(G));
  try{ localStorage.setItem(LS(), JSON.stringify(copy)); }catch(e){}
  try{ api.save(copy); }catch(e){}
  try{ api.saveWorld({ v: 2, p_start: 1, p_done: G.flags.p_done ? 1 : 0, ch: G.chapter || 0, lv: G.lv, hero: WD.hero }); }catch(e){}
};
WD.flag = k => !!(WD.G && WD.G.flags[k]);
WD.set = (k, v) => { WD.G.flags[k] = v === undefined ? 1 : v; };

/* ================= main loop ================= */
function frame(now){
  if(dead) return;
  raf = requestAnimationFrame(frame);
  const rdt = Math.min(.05, (now - prevT) / 1000 || 0); prevT = now;
  const dt = WD.paused ? 0 : rdt;
  WD.time += dt; WD.rt = now / 1000;
  tickTimers();
  if(WD.tickTalk) WD.tickTalk(rdt);
  if(WD.tickCmd && !WD.paused) WD.tickCmd(dt);
  cam.shake = Math.max(0, cam.shake - dt * 30);
  const ctx = WD.ctx, t = WD.time;
  try{
    if(WD.scene){ if(WD.scene.update) WD.scene.update(dt, t); WD.scene.draw(t, dt); }
    else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2A2346'; ctx.fillRect(0, 0, WD.cv.width, WD.cv.height); }
  }catch(e){ console.error(e); }
  letterT = lerp(letterT, WD.letter, Math.min(1, rdt * 6));
  if(letterT > .01 && WD.mode !== 'battle'){ ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); ctx.fillStyle = '#140F22'; const h = view.h * .085 * letterT; ctx.fillRect(0, 0, view.w, h); ctx.fillRect(0, view.h - h, view.w, h); }
  if(fadeA > .002){ ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, fadeA); ctx.fillStyle = fadeCol; ctx.fillRect(0, 0, WD.cv.width, WD.cv.height); ctx.globalAlpha = 1; }
  drawPageTurn();
  if(WD.drawTalkPortrait) WD.drawTalkPortrait();
  const pb = root.querySelector('.wd-pause'), want = !!(WD.G && WD.G.started && ['explore', 'cutscene', 'battle'].includes(WD.mode)); if(pb.hidden === want) pb.hidden = !want;
  if(WD.G && WD.G.started && WD.mode === 'explore' && performance.now() - lastSave > 45000) WD.saveNow();
}
WD.setScene = function(s, mode){ WD.scene = s; WD.mode = mode || (s && s.mode) || 'explore'; if(s && s.enter) s.enter(); };

/* ================= loading ================= */
function loadScript(src){ return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(s); }); }
WD.loaded = WD.loaded || {};
WD.require = async function(name){ if(WD.loaded[name]) return; await loadScript(WD.BASE + name + '.js?v=' + WD.V); WD.loaded[name] = 1; };
function fonts(){ if(document.getElementById('wd-fonts')) return; const l = document.createElement('link'); l.id = 'wd-fonts'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Grandstander:wght@600;800;900&family=Nunito:wght@600;700;800&display=swap'; document.head.appendChild(l); }

async function start(host, apiIn){
  stop();
  api = apiIn; WD.api = api; dead = false; handlers = {};
  WD.hero = (api.me === 'laura') ? 'Laura' : 'David';
  WD.spouse = WD.hero === 'David' ? 'Laura' : 'David';
  WD.soundOn = api.soundOn ? api.soundOn() !== false : true;
  fonts();
  if(!document.getElementById('wd-css')){ const st = document.createElement('style'); st.id = 'wd-css'; st.textContent = CSS; document.head.appendChild(st); }
  host.innerHTML = ''; host.style.background = '#000';
  root = document.createElement('div'); root.className = 'wd'; root.innerHTML = HTML; host.appendChild(root); WD.root = root;
  root.querySelector('.wd-mute').textContent = WD.soundOn ? '♪' : '🔇';
  WD.cv = root.querySelector('.wd-cv'); WD.ctx = WD.cv.getContext('2d');
  resize(); addEventListener('resize', resize); addEventListener('orientationchange', resize);
  addEventListener('keydown', onKey); addEventListener('keyup', onKey); document.addEventListener('visibilitychange', onHide);
  wireControls(); WD.pausedByUser = false;
  WD.time = 0; WD.paused = false; WD.letter = 0; letterT = 0; fadeA = 0; timers.length = 0; tweens.length = 0; WD.scene = null; WD.mode = 'load';
  prevT = performance.now(); raf = requestAnimationFrame(frame);
  try{
    for(const m of ['render', 'script', 'world', 'battle']) await WD.require(m);
    await WD.require('chapters/prologue');
    if(dead) return;
    resize();
    root.querySelector('.wd-load').hidden = true;
    WD.boot();
  }catch(e){
    console.error(e);
    const l = root.querySelector('.wd-load'); l.hidden = false; l.innerHTML = '<span>Couldn’t load the game.<small>Check your connection, then close and try again.</small></span>';
  }
}
function stop(){
  if(dead && !root) return;
  try{ if(WD.G && WD.G.started) WD.saveNow(); }catch(e){}
  dead = true; cancelAnimationFrame(raf); MUS.stop();
  removeEventListener('resize', resize); removeEventListener('orientationchange', resize);
  removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); document.removeEventListener('visibilitychange', onHide);
  WD.pausedByUser = false;
  WD.scene = null; WD.G = null; WD.cmdPress = null; WD.talkPress = null; WD.getOpen = false; WD.panelOpen = false;
  if(root && root.parentNode) root.parentNode.removeChild(root); root = null;
}
WD.isDead = () => dead;
window.RheadRPG = { start, stop };
})();
