/* =============================================================
   Rhead Island: a cozy pixel RPG for David & Laura (step 1)
   Loaded only when the game is opened. window.RheadRPG.start(host, api)
   ============================================================= */
(function(){
'use strict';
const T = 16, MW = 44, MH = 40;
const SOLID = { T:1, '~':1, r:1, o:1, b:1, f:1, h:1 };
let G = null;

/* ---------- tiny seeded random ---------- */
function rng(seed){ let s = seed | 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/* ---------- the island map ---------- */
const HOUSES = [
  { id:'home', x:5, y:6, w:7, h:4, roof:'#4F7FB8', wall:'#F3E6CF', door:3, name:'Rhead House', sign:'🏠 Rhead House. Home sweet home! (Decorating comes soon.)' },
  { id:'bakery', x:28, y:6, w:7, h:4, roof:'#C9473D', wall:'#F6E3D3', door:3, name:'Bakery', sign:'🥐 Rosa’s Bakery. Closed while Rosa looks for her cat.' },
  { id:'hall', x:16, y:3, w:9, h:4, roof:'#7A5BC4', wall:'#EFE7F7', door:4, name:'Town Hall', sign:'🏛️ Town Hall. The mayor is out on the plaza.' },
  { id:'shop', x:6, y:16, w:6, h:4, roof:'#4F8761', wall:'#EEF3E6', door:2, name:'Shop', sign:'🛍️ Pip’s Shop. Opening soon!' }
];
const LIGHT = { x:38, y:26, w:3, h:6 };
const COURT = { x:27, y:17, w:9, h:6 };
function buildMap(){
  const m = [], R = rng(777);
  for(let y = 0; y < MH; y++){ m.push([]); for(let x = 0; x < MW; x++) m[y].push('.'); }
  const set = (x, y, c) => { if(x >= 0 && y >= 0 && x < MW && y < MH) m[y][x] = c; };
  // shoreline
  for(let x = 0; x < MW; x++){ const sh = 32 + Math.round(Math.sin(x * .45) * 1.2 + Math.sin(x * .17) * .8); for(let y = sh - 5; y < MH; y++) set(x, y, y >= sh ? '~' : 's'); }
  // border trees
  for(let y = 0; y < 28; y++) for(let x = 0; x < MW; x++) if(x < 2 || x >= MW - 2 || y < 2) set(x, y, 'T');
  // roads
  for(let x = 2; x < MW - 2; x++) set(x, 13, '='), set(x, 14, '=');
  for(let y = 7; y < 29; y++) set(21, y, '='), set(22, y, '=');
  for(let y = 10; y < 13; y++) set(8, y, '='), set(31, y, '='), set(20, y - 3, '=');
  for(let y = 15; y < 16; y++) set(9, y, '=');
  // plaza
  for(let y = 11; y < 17; y++) for(let x = 18; x < 26; x++) set(x, y, '=');
  // court
  for(let y = COURT.y; y < COURT.y + COURT.h; y++) for(let x = COURT.x; x < COURT.x + COURT.w; x++) set(x, y, 'k');
  for(let x = 23; x < COURT.x; x++) set(x, 19, '=');
  // pier
  for(let y = 30; y < MH - 1; y++){ if(m[y][12] === '~' || m[y][13] === '~'){ set(12, y, 'p'); set(13, y, 'p'); } }
  // lighthouse rocks
  for(let y = LIGHT.y; y < LIGHT.y + LIGHT.h; y++) for(let x = LIGHT.x - 1; x < LIGHT.x + LIGHT.w + 1; x++) if(m[y] && m[y][x] === '~') set(x, y, 'r');
  // houses (solid)
  HOUSES.forEach(h => { for(let y = h.y; y < h.y + h.h; y++) for(let x = h.x; x < h.x + h.w; x++) set(x, y, 'h'); set(h.x + h.door, h.y + h.h, '='); });
  for(let y = LIGHT.y; y < LIGHT.y + LIGHT.h; y++) for(let x = LIGHT.x; x < LIGHT.x + LIGHT.w; x++) set(x, y, 'h');
  // fence around garden behind home
  for(let x = 4; x < 13; x++) set(x, 4, 'f');
  // scatter trees, bushes, flowers, rocks on grass away from things
  const free = (x, y, r) => { for(let yy = y - r; yy <= y + r; yy++) for(let xx = x - r; xx <= x + r; xx++){ const c = (m[yy] || [])[xx]; if(c !== '.' && c !== 'T') return false; } return true; };
  for(let i = 0; i < 70; i++){ const x = 2 + Math.floor(R() * (MW - 4)), y = 2 + Math.floor(R() * 24); if(free(x, y, 1)) set(x, y, R() < .75 ? 'T' : 'b'); }
  for(let i = 0; i < 90; i++){ const x = 2 + Math.floor(R() * (MW - 4)), y = 2 + Math.floor(R() * 25); if(m[y][x] === '.') set(x, y, '*'); }
  for(let i = 0; i < 8; i++){ const x = 3 + Math.floor(R() * (MW - 6)), y = 28 + Math.floor(R() * 2); if(m[y][x] === 's' && !(x >= 11 && x <= 14) && !(x >= 20 && x <= 23)) set(x, y, 'o'); }
  set(19, 13, '='); return m;
}

/* ---------- drawing helpers ---------- */
function cnv(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function shade(hex, f){ const n = parseInt(String(hex || '#888888').slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if(f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }

function drawTile(x, c, tx, ty, ch, map){
  const px = tx * T, py = ty * T, h = hash(tx, ty);
  const P = (dx, dy, w, hh, col) => { x.fillStyle = col; x.fillRect(px + dx, py + dy, w, hh); };
  const grass = () => { P(0, 0, T, T, h < .5 ? '#74C062' : '#6DBB5A'); for(let i = 0; i < 4; i++){ const a = hash(tx * 7 + i, ty * 3 + i); P(Math.floor(a * 14), Math.floor(hash(tx + i, ty * 9) * 14), 1, 2, '#5AA54B'); } };
  if(ch === '.' || ch === 'T' || ch === 'b' || ch === '*' || ch === 'f' || ch === 'h'){ grass(); }
  if(ch === '*'){ const cols = ['#F4A6B8','#F2C14E','#FFFFFF','#B39CE0']; for(let i = 0; i < 3; i++){ const a = hash(tx + i * 5, ty - i), b = hash(tx - i, ty + i * 7); P(2 + Math.floor(a * 11), 2 + Math.floor(b * 11), 2, 2, cols[Math.floor(hash(tx * i, ty) * 4)]); } }
  if(ch === '='){ P(0, 0, T, T, '#DDBB82'); for(let i = 0; i < 3; i++) P(Math.floor(hash(tx * 3 + i, ty) * 14), Math.floor(hash(tx, ty * 5 + i) * 14), 2, 1, '#C9A46A'); }
  if(ch === 's'){ P(0, 0, T, T, '#F2DCA6'); for(let i = 0; i < 3; i++) P(Math.floor(hash(tx * 3 + i, ty * 2) * 15), Math.floor(hash(tx * 2, ty * 5 + i) * 15), 1, 1, '#E0C48A'); }
  if(ch === '~' || ch === 'r'){ const deep = (map[ty - 2] || [])[tx] === '~'; P(0, 0, T, T, deep ? '#3E8FC7' : '#58AEDD'); if(!deep && (map[ty - 1] || [])[tx] === 's') P(0, 0, T, 3, '#BFE6F5'); }
  if(ch === 'o') P(0, 0, T, T, '#F2DCA6');
  if(ch === 'r' || ch === 'o'){ P(3, 4, 10, 9, '#8E8A85'); P(4, 3, 8, 2, '#A9A49E'); P(5, 5, 3, 2, '#C4BFB8'); P(3, 12, 10, 2, '#6E6A66'); }
  if(ch === 'k'){ P(0, 0, T, T, '#D98A4E'); P(0, 0, T, 1, '#C77B42'); if(tx === COURT.x || tx === COURT.x + COURT.w - 1) P(tx === COURT.x ? 0 : 15, 0, 1, T, '#FFF'); if(ty === COURT.y || ty === COURT.y + COURT.h - 1) P(0, ty === COURT.y ? 0 : 15, T, 1, '#FFF'); if(tx === COURT.x + 4) P(7, 0, 2, T, '#FFF'); }
  if(ch === 'p'){ const L = map[ty][tx - 1] === 'p', Rr = map[ty][tx + 1] === 'p'; P(0, 0, T, T, '#58AEDD'); P(L ? 0 : 1, 0, T - (L ? 0 : 1) - (Rr ? 0 : 1), T, '#A0703F'); for(let y = 0; y < T; y += 4) P(L ? 0 : 1, y, T - (L ? 0 : 1) - (Rr ? 0 : 1), 1, '#7E5530'); if(!L) P(1, 0, 1, T, '#6A4426'); if(!Rr) P(14, 0, 1, T, '#6A4426'); }
  if(ch === 'f'){ P(0, 6, T, 2, '#C79A63'); P(0, 11, T, 2, '#C79A63'); P(2, 3, 3, 12, '#B5864F'); P(11, 3, 3, 12, '#B5864F'); }
  if(ch === 'b'){ P(2, 5, 12, 10, '#3F8C4A'); P(1, 7, 14, 6, '#3F8C4A'); P(4, 5, 4, 3, '#5DAF5F'); P(9, 9, 2, 2, '#E0566B'); P(5, 11, 2, 2, '#E0566B'); }
  if(ch === 'T'){ P(6, 9, 4, 7, '#7B4B2F'); P(7, 9, 1, 7, '#9A6440'); }
}
function drawCanopy(x, tx, ty){ const px = tx * T, py = ty * T - 12; x.fillStyle = '#2F7A3E'; x.fillRect(px + 1, py + 4, 14, 14); x.fillRect(px + 3, py + 1, 10, 20); x.fillStyle = '#3E9450'; x.fillRect(px + 3, py + 3, 9, 9); x.fillStyle = '#58AE5E'; x.fillRect(px + 4, py + 4, 4, 3); x.fillStyle = '#25663A'; x.fillRect(px + 2, py + 16, 12, 3); }
function drawHouse(x, h){
  const px = h.x * T, py = h.y * T, w = h.w * T, hh = h.h * T;
  x.fillStyle = h.wall; x.fillRect(px, py + 10, w, hh - 10);
  x.fillStyle = shade(h.wall, -.12); for(let i = 0; i < w; i += 8) x.fillRect(px + i, py + 10, 1, hh - 10);
  x.fillStyle = shade(h.wall, -.25); x.fillRect(px, py + hh - 2, w, 2);
  const dx = px + h.door * T + 3; x.fillStyle = '#7B4B2F'; x.fillRect(dx, py + hh - 18, 10, 18); x.fillStyle = '#5A3520'; x.fillRect(dx + 1, py + hh - 17, 8, 1); x.fillStyle = '#F2C14E'; x.fillRect(dx + 7, py + hh - 9, 1, 2);
  [[1], [h.w - 2]].forEach(([k]) => { if(k === h.door || k + 1 === h.door) return; const wx = px + k * T + 2; x.fillStyle = '#5A3520'; x.fillRect(wx - 1, py + hh - 27, 14, 12); x.fillStyle = '#BFE6F5'; x.fillRect(wx, py + hh - 26, 12, 10); x.fillStyle = '#FFFFFF'; x.fillRect(wx + 1, py + hh - 25, 3, 3); });
}
function drawRoof(x, h){
  const px = h.x * T - 4, py = h.y * T - 14, w = h.w * T + 8;
  for(let i = 0; i < 26; i++){ x.fillStyle = i % 6 < 1 ? shade(h.roof, -.25) : i < 3 ? shade(h.roof, .2) : h.roof; x.fillRect(px + Math.max(0, 12 - i), py + i, w - Math.max(0, 12 - i) * 2, 1); }
  x.fillStyle = shade(h.roof, -.35); x.fillRect(px, py + 25, w, 3);
  if(h.id === 'home'){ x.fillStyle = '#F4A6B8'; x.fillRect(px + w / 2 - 4, py + 8, 3, 3); x.fillRect(px + w / 2 + 1, py + 8, 3, 3); x.fillRect(px + w / 2 - 3, py + 11, 6, 2); x.fillRect(px + w / 2 - 1, py + 13, 2, 1); }
}
function drawLighthouse(x, top){
  const px = LIGHT.x * T, py = LIGHT.y * T, w = LIGHT.w * T, hh = LIGHT.h * T;
  if(!top){ x.fillStyle = '#F3EDE4'; x.fillRect(px + 6, py, w - 12, hh); x.fillStyle = '#C9473D'; for(let i = 0; i < 3; i++) x.fillRect(px + 6, py + 14 + i * 26, w - 12, 9); x.fillStyle = '#7B4B2F'; x.fillRect(px + w / 2 - 5, py + hh - 16, 10, 16); return; }
  x.fillStyle = '#2A201C'; x.fillRect(px + 4, py - 30, w - 8, 30); x.fillStyle = G && G.lightOn ? '#FFE27A' : '#5B6B82'; x.fillRect(px + 8, py - 26, w - 16, 18); x.fillStyle = '#C9473D'; x.fillRect(px + 2, py - 38, w - 4, 9); x.fillRect(px + 10, py - 44, w - 20, 7);
}
function drawHoops(x){ [[COURT.x, 1], [COURT.x + COURT.w - 1, -1]].forEach(([tx, d]) => { const px = tx * T + (d > 0 ? 2 : 10), py = (COURT.y + 2) * T; x.fillStyle = '#5B6B82'; x.fillRect(px, py - 14, 3, 30); x.fillStyle = '#FFFFFF'; x.fillRect(px - (d > 0 ? 0 : 8), py - 22, 11, 9); x.fillStyle = '#E0566B'; x.fillRect(px + d * 6, py - 12, 6, 2); }); }

/* ---------- pixel people from the app avatars ---------- */
const LONG = ['long','wavy','longcurly','pony','highpony','pigtails','bun','lob','shag','bangs','bob','braids','locs'];
const BIG = ['afro','curly','twists','curls'];
const SHAVED = ['buzz','fade','cornrows'];
function heroSheet(c){
  const W = 16, H = 22, sheet = cnv(W * 3, H * 4), x = sheet.getContext('2d');
  const skin = c.skin || '#E3B08C', hair = c.hair || '#3A281E', shirt = c.shirt || '#3E6E8E', pants = c.pants || '#3B4F6B', shoes = c.shoecolor || '#F4F4F4';
  const st = c.style || 'short', long = LONG.includes(st), big = BIG.includes(st), shaved = SHAVED.includes(st);
  const skirt = c.bottom === 'skirt' || c.bottom === 'longskirt' || c.top === 'dress' || c.top === 'sundress' || c.top === 'gown';
  const hat = c.hat && c.hat !== 'none' && !['flower','bow','headband','tiara','headphones','earmuffs'].includes(c.hat);
  const gl = c.glasses && c.glasses !== 'none', beard = c.facial && !['none','stubble'].includes(c.facial);
  for(let d = 0; d < 4; d++) for(let f = 0; f < 3; f++){
    const ox = f * W, oy = d * H, P = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(ox + a, oy + b, w, h); };
    const step = f === 1 ? 1 : f === 2 ? -1 : 0, bob = f === 0 ? 0 : 1;
    // shadow
    P(3, 20, 10, 2, 'rgba(0,0,0,.18)');
    // legs + shoes
    if(skirt){ P(4, 13 + bob, 8, 4, pants); P(3, 16 + bob, 10, 1, shade(pants, -.15)); P(5, 17 + bob, 2, 2 - (step > 0 ? 1 : 0), skin); P(9, 17 + bob, 2, 2 - (step < 0 ? 1 : 0), skin); }
    else { P(5, 15 + bob, 3, 4 - (step > 0 ? 1 : 0), pants); P(8, 15 + bob, 3, 4 - (step < 0 ? 1 : 0), pants); }
    P(4, 19 - (step > 0 ? 1 : 0), 4, 1, shoes); P(8, 19 - (step < 0 ? 1 : 0), 4, 1, shoes);
    // body
    P(4, 10 + bob, 8, 6, shirt); P(4, 10 + bob, 8, 1, shade(shirt, .15)); P(4, 15 + bob, 8, 1, shade(shirt, -.2));
    // arms
    if(d === 0 || d === 3){ P(3, 11 + bob + step, 1, 4, shirt); P(12, 11 + bob - step, 1, 4, shirt); P(3, 15 + bob + step, 1, 1, skin); P(12, 15 + bob - step, 1, 1, skin); }
    else { const ax = d === 1 ? 7 : 8; P(ax, 11 + bob + step, 2, 4, shade(shirt, -.1)); P(ax, 15 + bob + step, 2, 1, skin); }
    // head
    const hy = bob;
    P(4, 2 + hy, 8, 8, skin); P(3, 4 + hy, 1, 4, skin); P(12, 4 + hy, 1, 4, skin);
    // hair
    if(d === 3){ // back
      P(3, 1 + hy, 10, shaved ? 4 : 8, hair); if(big) P(2, 0 + hy, 12, 9, hair); if(long) P(3, 8 + hy, 10, 5, hair);
    } else {
      if(big){ P(2, 0 + hy, 12, 5, hair); P(2, 5 + hy, 2, 4, hair); P(12, 5 + hy, 2, 4, hair); }
      else if(shaved){ P(4, 1 + hy, 8, 2, shade(hair, .12)); }
      else { P(3, 1 + hy, 10, 3, hair); P(4, 0 + hy, 8, 1, hair); if(d === 0){ P(3, 4 + hy, 2, 2, hair); P(11, 4 + hy, 2, 2, hair); } }
      if(long && d !== 3){ if(d === 0){ P(2, 3 + hy, 2, 9, hair); P(12, 3 + hy, 2, 9, hair); } else { const sx = d === 1 ? 9 : 3; P(sx, 2 + hy, 4, 10, hair); } }
      if(!long && !big && !shaved && d !== 0){ const sx = d === 1 ? 10 : 3; P(sx, 2 + hy, 3, 4, hair); }
      // face
      const ec = c.eyecolor || '#2A201C';
      if(d === 0){ P(6, 6 + hy, 1, 2, ec); P(9, 6 + hy, 1, 2, ec); P(7, 8 + hy, 2, 1, shade(skin, -.3)); P(5, 8 + hy, 1, 1, '#F0A0A0'); P(10, 8 + hy, 1, 1, '#F0A0A0');
        if(gl){ const gc = c.glasses === 'sun' ? '#1A1414' : '#2A201C'; P(5, 5 + hy, 3, 3, gc); P(8, 5 + hy, 3, 3, gc); if(c.glasses !== 'sun'){ P(6, 6 + hy, 1, 1, '#BFE6F5'); P(9, 6 + hy, 1, 1, '#BFE6F5'); } }
        if(beard){ P(5, 8 + hy, 6, 2, hair); P(7, 8 + hy, 2, 1, shade(skin, -.3)); } }
      else { const fx = d === 1 ? 4 : 11, sx = d === 1 ? 1 : -1; P(fx + sx, 6 + hy, 1, 2, ec); P(d === 1 ? 3 : 12, 7 + hy, 1, 1, skin); if(gl) P(Math.min(fx, fx + sx * 2), 5 + hy, 3, 3, c.glasses === 'sun' ? '#1A1414' : '#2A201C'); if(beard) P(d === 1 ? 4 : 8, 8 + hy, 4, 2, hair); }
    }
    if(hat){ const hc = c.accent || '#E0566B'; P(3, 0 + hy, 10, 3, hc); P(4, -1 + hy + 1, 8, 1, shade(hc, .2)); if(['cap','snapback','visor'].includes(c.hat)){ if(d === 0) P(4, 3 + hy, 8, 1, shade(hc, -.25)); if(d === 1) P(1, 3 + hy, 4, 1, shade(hc, -.25)); if(d === 2) P(11, 3 + hy, 4, 1, shade(hc, -.25)); } if(['cowboy','sunhat','fedora','bucket'].includes(c.hat)) P(1, 3 + hy, 14, 1, shade(hc, -.25)); }
  }
  return sheet;
}
function dogSheet(){
  const W = 16, H = 14, sheet = cnv(W * 3, H * 4), x = sheet.getContext('2d');
  const B = '#6B4226', D = '#4A2C18', Wt = '#F7F2EA', N = '#1A1414';
  for(let d = 0; d < 4; d++) for(let f = 0; f < 3; f++){
    const ox = f * W, oy = d * H, P = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(ox + a, oy + b, w, h); }, lg = f === 0 ? 0 : f === 1 ? 1 : -1;
    P(3, 12, 10, 2, 'rgba(0,0,0,.18)');
    if(d === 0 || d === 3){ // front/back
      P(4, 6, 8, 5, B); if(d === 0) P(6, 6, 4, 5, Wt); P(4, 11, 2, 2 - (lg > 0 ? 1 : 0), d === 0 ? Wt : B); P(10, 11, 2, 2 - (lg < 0 ? 1 : 0), d === 0 ? Wt : B);
      P(4, 1, 8, 6, B); P(3, -1 + 1, 2, 3, D); P(11, 0, 2, 3, D); P(3, 0, 1, 1, D);
      if(d === 0){ P(7, 1, 2, 6, Wt); P(6, 4, 4, 3, Wt); P(5, 3, 1, 1, N); P(10, 3, 1, 1, N); P(7, 5, 2, 1, N); } else P(7, 9, 2, 2, B);
    } else {
      const r = d === 2, hx = r ? 10 : 1, tx = r ? 2 : 13;
      P(3, 6, 10, 4, B); P(r ? 7 : 4, 8, 5, 2, Wt);
      P(4 + lg, 10, 2, 3, B); P(10 - lg, 10, 2, 3, B); P(4 + lg, 12, 2, 1, Wt); P(10 - lg, 12, 2, 1, Wt);
      P(hx, 2, 6, 6, B); P(r ? hx + 3 : hx, 5, 3, 3, Wt); P(r ? hx + 5 : hx, 5, 1, 1, N); P(r ? hx + 2 : hx + 3, 3, 1, 1, N); P(r ? hx + 1 : hx + 4, 0, 2, 3, D);
      P(tx, 5 + (f === 1 ? 0 : 1), 1, 2, B);
    }
  }
  return sheet;
}

/* ---------- people of Rhead Island ---------- */
function npcAv(base, o){ return Object.assign({}, base, o); }
function makeNPCs(api){
  const b = api.baseAv();
  return [
    { id:'mayor', name:'Mayor Pip', x:24 * T, y:15 * T, d:0, av:npcAv(b, { skin:'#F6D5BC', hair:'#F2EFEA', style:'buzz', facial:'mustache', shirt:'#7A5BC4', pants:'#2A2F3A', hat:'fedora', accent:'#2A201C', glasses:'round' }),
      lines: me => [`Ah, ${me}! Welcome back to Rhead Island!`, 'You’re the ones who moved into Rhead House, with that bouncy pup Dayla. The whole town has been talking about you.', 'But I have troubling news… the lighthouse on the beach went dark last night. Nobody knows why.', 'Without its light, the boats can’t find the island. Could you two look into it? Head south down the road to the beach.'] },
    { id:'rosa', name:'Rosa the Baker', x:32 * T, y:12 * T, d:0, wander:1, av:npcAv(b, { skin:'#C98E68', hair:'#171210', style:'bun', shirt:'#F4F4F4', pants:'#C9473D', bottom:'skirt', accent:'#C9473D' }),
      lines: () => ['Oh, hello dears! Have you seen my cat, Croissant? Orange, very round, very rude.', 'She ran off when the lighthouse went dark. If you find her, I’ll bake you something special!'] },
    { id:'gus', name:'Old Gus', x:13 * T, y:35 * T, d:0, av:npcAv(b, { skin:'#B07A55', hair:'#9A9693', style:'short', facial:'fullbeard', shirt:'#3E6E8E', pants:'#C9B79C', hat:'bucket', accent:'#E2AE55' }),
      lines: () => ['*yawn* Fishin’ ain’t the same without the lighthouse.', 'Last night I saw a glow out by the rocks… little critters, glowing like lanterns. Then poof, the light went out.', 'Mark my words, those critters know something.'] },
    { id:'dre', name:'Coach Dre', x:31 * T, y:24 * T + 6, d:3, av:npcAv(b, { skin:'#7C4F34', hair:'#171210', style:'fade', shirt:'#E2AE55', pants:'#2A201C', top:'jersey', hat:'sweatband', accent:'#E0566B' }),
      lines: me => [`Yo ${me}! You hoop?`, 'Court’s getting new nets. Come back soon and we’ll see if you can hit a green release. 🏀'] },
    { id:'kid', name:'Pepper', x:14 * T, y:11 * T, d:0, wander:1, av:npcAv(b, { skin:'#EDC3A3', hair:'#B8413A', style:'pigtails', shirt:'#4F8761', pants:'#3B4F6B', cheeks:'freckles', hat:'none' }),
      lines: () => ['Psst! Wanna know a secret?', 'Dayla keeps sniffing the ground by the big tree near the beach. I bet something’s buried there!', '(Digging with Dayla comes in the next update!)'] }
  ];
}
const SIGNS = [
  { x:19, y:17, text:'🌴 Welcome to Rhead Island! ↑ Town Hall · ← Rhead House · → Bakery · ↓ Sunny Beach' },
  { x:26, y:19, text:'🏀 Rhead Court. Tip-off coming soon!' },
  { x:36, y:30, text:'🗼 The lighthouse. Its lamp is dark…' }
];
const AREAS = [ [0, 0, MW, 25, 'Rhead Town'], [0, 27, MW, MH, 'Sunny Beach'], [COURT.x, COURT.y, COURT.x + COURT.w, COURT.y + COURT.h, 'Rhead Court'] ];

/* ---------- game ---------- */
function start(host, api){
  stop();
  const map = buildMap();
  const bg = cnv(MW * T, MH * T), bx = bg.getContext('2d'), top = cnv(MW * T, MH * T), tx = top.getContext('2d');
  for(let y = 0; y < MH; y++) for(let x = 0; x < MW; x++) drawTile(bx, null, x, y, map[y][x], map);
  HOUSES.forEach(h => { drawHouse(bx, h); drawRoof(tx, h); });
  drawLighthouse(bx, false); drawHoops(bx);
  // fountain
  (() => { const px = 21 * T, py = 14 * T - 8; bx.fillStyle = '#A9A49E'; bx.fillRect(px - 6, py, 44, 26); bx.fillStyle = '#58AEDD'; bx.fillRect(px - 3, py + 3, 38, 20); bx.fillStyle = '#C4BFB8'; bx.fillRect(px + 12, py - 6, 8, 18); bx.fillStyle = '#BFE6F5'; bx.fillRect(px + 14, py - 10, 4, 6); })();
  for(let y = 0; y < MH; y++) for(let x = 0; x < MW; x++) if(map[y][x] === 'T') drawCanopy(tx, x, y);
  SIGNS.forEach(s => { const px = s.x * T, py = s.y * T; bx.fillStyle = '#7B4B2F'; bx.fillRect(px + 7, py + 8, 2, 8); bx.fillStyle = '#C79A63'; bx.fillRect(px + 2, py + 2, 12, 8); bx.fillStyle = '#9A6440'; bx.fillRect(px + 2, py + 9, 12, 1); bx.fillRect(px + 4, py + 5, 8, 1); map[s.y][s.x] = 'r'; });
  // fountain solid
  for(let y = 13; y < 16; y++) for(let x = 21; x < 23; x++) map[y][x] = 'h';

  host.innerHTML = `<canvas class="rpg-cv"></canvas>
    <div class="rpg-top"><button class="rpg-x" aria-label="Leave the island">✕</button><div class="rpg-area"></div><div class="rpg-who"></div></div>
    <div class="rpg-joy"><i></i></div><button class="rpg-a" aria-label="Talk or look">A</button>
    <div class="rpg-talk" hidden><b></b><p></p><span>▼</span></div><div class="rpg-banner"></div>`;
  const cv = host.querySelector('.rpg-cv'), cx = cv.getContext('2d');
  const me = api.me, other = me === 'david' ? 'laura' : 'david';
  const sheets = { [me]: heroSheet(api.avatar(me)), [other]: heroSheet(api.avatar(other)) }, dog = dogSheet();
  const npcs = makeNPCs(api); npcs.forEach(n => { n.sheet = heroSheet(n.av); n.hx = n.x; n.hy = n.y; n.t = 0; });
  const saved = api.load() || {};
  const p = { x: saved.x || 8 * T + 8, y: saved.y || 11 * T + 4, d: saved.d || 0, f: 0, ft: 0, moving: false };
  const pup = { x: p.x - 14, y: p.y + 6, d: p.d, f: 0, ft: 0, trail: [] };
  const remote = { on: false, x: 0, y: 0, tx: 0, ty: 0, d: 0, moving: false, seen: 0 };
  const input = { x: 0, y: 0, keys: {} };
  let talk = null, lastSave = 0, lastSent = 0, raf = 0, prev = performance.now(), scale = 3, area = '', bannerT = 0, ch = null, t0 = 0;
  G = { stop: () => {}, lightOn: false };

  function resize(){ const r = host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); scale = Math.max(2, Math.round(Math.min(r.width / (12 * T), r.height / (14 * T)) * dpr) / dpr); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; G.dpr = dpr; }
  resize(); window.addEventListener('resize', resize);

  const solidAt = (px, py) => { const x = Math.floor(px / T), y = Math.floor(py / T); if(x < 0 || y < 0 || x >= MW || y >= MH) return true; return !!SOLID[map[y][x]]; };
  const blocked = (x, y) => solidAt(x - 5, y - 3) || solidAt(x + 5, y - 3) || solidAt(x - 5, y + 1) || solidAt(x + 5, y + 1) || npcs.some(n => Math.abs(n.x - x) < 10 && Math.abs(n.y - y) < 7);

  /* --- input: joystick on the left half, A button on the right --- */
  const joy = host.querySelector('.rpg-joy'), knob = joy.querySelector('i'); let jid = null, jx = 0, jy = 0;
  host.addEventListener('pointerdown', e => { if(e.target.closest('button') || talk) return; if(e.clientX > host.clientWidth * .55) return; jid = e.pointerId; jx = e.clientX; jy = e.clientY; joy.style.left = jx + 'px'; joy.style.top = jy + 'px'; joy.classList.add('on'); try{ host.setPointerCapture(jid); }catch(er){} });
  host.addEventListener('pointermove', e => { if(e.pointerId !== jid) return; let dx = e.clientX - jx, dy = e.clientY - jy; const L = Math.hypot(dx, dy), M = 44; if(L > M){ dx *= M / L; dy *= M / L; } knob.style.transform = `translate(${dx}px,${dy}px)`; input.x = Math.abs(dx) > 6 ? dx / M : 0; input.y = Math.abs(dy) > 6 ? dy / M : 0; });
  const jend = e => { if(e.pointerId !== jid) return; jid = null; input.x = input.y = 0; knob.style.transform = ''; joy.classList.remove('on'); };
  host.addEventListener('pointerup', jend); host.addEventListener('pointercancel', jend);
  const onKey = e => { const k = e.key.toLowerCase(); if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','e','enter'].includes(k)) e.preventDefault(); if(e.type === 'keydown' && (k === ' ' || k === 'e' || k === 'enter')){ act(); return; } input.keys[k] = e.type === 'keydown'; };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
  host.querySelector('.rpg-a').addEventListener('click', act);
  host.querySelector('.rpg-talk').addEventListener('click', act);
  host.querySelector('.rpg-x').addEventListener('click', () => api.close());

  /* --- talking, Paper Mario style --- */
  const box = host.querySelector('.rpg-talk'), boxName = box.querySelector('b'), boxText = box.querySelector('p');
  function say(name, lines, who){ talk = { name, lines, i: 0, shown: 0, who }; box.hidden = false; boxName.textContent = name; boxText.textContent = ''; api.sfx('open'); }
  function act(){
    if(talk){ const L = talk.lines[talk.i]; if(talk.shown < L.length){ talk.shown = L.length; return; } talk.i++; talk.shown = 0; if(talk.i >= talk.lines.length){ talk = null; box.hidden = true; return; } api.sfx('tap'); return; }
    const fx = p.x + [0, -14, 14, 0][p.d], fy = p.y + [14, 0, 0, -14][p.d];
    const n = npcs.find(n => Math.hypot(n.x - fx, n.y - fy) < 16);
    if(n){ n.d = [3, 2, 1, 0][p.d]; n.t = 3; say(n.name, n.lines(api.nameOf(me)), n); return; }
    const s = SIGNS.find(s => Math.hypot(s.x * T + 8 - fx, s.y * T + 8 - fy) < 16); if(s){ say('Sign', [s.text]); return; }
    const h = HOUSES.find(h => Math.hypot((h.x + h.door) * T + 8 - fx, (h.y + h.h) * T - fy) < 16); if(h){ say(h.name, [h.sign]); return; }
    if(remote.on && Math.hypot(remote.x - fx, remote.y - fy) < 18){ say(api.nameOf(other), ['💕 *waves at you*']); return; }
    if(Math.hypot(pup.x - fx, pup.y - fy) < 18){ say('Dayla', [['*happy wiggle* 🐾','*sniff sniff… sniff* She smells something by the beach!','*rolls over for belly rubs*'][Math.floor(Math.random() * 3)]]); }
  }

  /* --- live play with each other --- */
  ch = api.channel && api.channel('rhead-rpg');
  if(ch){ ch.on('broadcast', { event: 'pos' }, ({ payload: q }) => { if(!q || q.who !== other) return; if(!remote.on){ remote.x = q.x; remote.y = q.y; banner(`${api.nameOf(other)} is on the island! 💕`); } remote.on = true; remote.tx = q.x; remote.ty = q.y; remote.d = q.d; remote.moving = q.m; remote.seen = performance.now(); })
    .on('broadcast', { event: 'bye' }, ({ payload: q }) => { if(q && q.who === other){ remote.on = false; banner(`${api.nameOf(other)} left the island`); } }).subscribe(); }
  const send = (ev, pl) => { try{ ch && ch.send({ type: 'broadcast', event: ev, payload: pl }); }catch(e){} };

  function banner(text){ const b = host.querySelector('.rpg-banner'); b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }

  /* --- loop --- */
  function update(dt, now){
    let ix = input.x, iy = input.y; const k = input.keys;
    if(k.arrowleft || k.a) ix = -1; if(k.arrowright || k.d) ix = 1; if(k.arrowup || k.w) iy = -1; if(k.arrowdown || k.s) iy = 1;
    if(talk){ ix = iy = 0; const L = talk.lines[talk.i]; if(talk.shown < L.length){ talk.shown = Math.min(L.length, talk.shown + dt * 45); boxText.textContent = L.slice(0, Math.floor(talk.shown)); } }
    const L = Math.hypot(ix, iy); p.moving = L > .1;
    if(p.moving){ const sp = 78 * Math.min(1, L) * dt, vx = ix / Math.max(1, L) * sp * (L > 1 ? 1 : 1), vy = iy / Math.max(1, L) * sp;
      if(!blocked(p.x + vx, p.y)) p.x += vx; if(!blocked(p.x, p.y + vy)) p.y += vy;
      p.d = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 1 : 2) : (iy < 0 ? 3 : 0);
      p.ft += dt; if(p.ft > .14){ p.ft = 0; p.f = p.f === 1 ? 2 : 1; } pup.trail.push([p.x, p.y, p.d]); if(pup.trail.length > 200) pup.trail.shift(); }
    else p.f = 0;
    // Dayla follows a few steps behind
    const tgt = pup.trail.length > 14 ? pup.trail[pup.trail.length - 14] : null;
    if(tgt && Math.hypot(tgt[0] - pup.x, tgt[1] - pup.y) > 2 && Math.hypot(p.x - pup.x, p.y - pup.y) > 16){ const dx = tgt[0] - pup.x, dy = tgt[1] - pup.y, l = Math.hypot(dx, dy), s = Math.min(l, 84 * dt); pup.x += dx / l * s; pup.y += dy / l * s; pup.d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); pup.ft += dt; if(pup.ft > .1){ pup.ft = 0; pup.f = pup.f === 1 ? 2 : 1; } } else pup.f = 0;
    if(Math.hypot(p.x - pup.x, p.y - pup.y) > 90){ pup.x = p.x - 10; pup.y = p.y + 4; }
    // townspeople wander a little
    npcs.forEach(n => { n.t -= dt; if(n.t <= 0){ n.t = 2 + Math.random() * 3; if(n.wander && !talk){ n.mx = Math.random() < .5 ? 0 : (Math.random() - .5) * 2; n.my = Math.random() < .5 ? 0 : (Math.random() - .5) * 2; if(Math.abs(n.mx) > Math.abs(n.my) && n.mx) n.d = n.mx < 0 ? 1 : 2; else if(n.my) n.d = n.my < 0 ? 3 : 0; } else { n.mx = n.my = 0; } }
      if(n.mx || n.my){ const nx = n.x + n.mx * 22 * dt, ny = n.y + n.my * 22 * dt; if(Math.hypot(nx - n.hx, ny - n.hy) < 28 && !solidAt(nx, ny) && Math.hypot(nx - p.x, ny - p.y) > 14){ n.x = nx; n.y = ny; n.ft = (n.ft || 0) + dt; if(n.ft > .2){ n.ft = 0; n.f = n.f === 1 ? 2 : 1; } } else { n.mx = n.my = 0; n.f = 0; } } else n.f = 0; });
    // remote smoothing
    if(remote.on){ remote.x += (remote.tx - remote.x) * Math.min(1, dt * 10); remote.y += (remote.ty - remote.y) * Math.min(1, dt * 10); remote.ft = (remote.ft || 0) + dt; if(remote.moving){ if(remote.ft > .14){ remote.ft = 0; remote.f = remote.f === 1 ? 2 : 1; } } else remote.f = 0; if(now - remote.seen > 6000) remote.on = false; }
    if(now - lastSent > (p.moving ? 90 : 1500)){ lastSent = now; send('pos', { who: me, x: Math.round(p.x), y: Math.round(p.y), d: p.d, m: p.moving }); }
    if(now - lastSave > 5000){ lastSave = now; api.save({ x: Math.round(p.x), y: Math.round(p.y), d: p.d, seen: saved.seen || 0 }); }
    // area banner
    const tx2 = p.x / T, ty2 = p.y / T, a = AREAS.slice().reverse().find(([x0, y0, x1, y1]) => tx2 >= x0 && tx2 < x1 && ty2 >= y0 && ty2 < y1);
    if(a && a[4] !== area){ area = a[4]; const el = host.querySelector('.rpg-area'); el.textContent = area; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
    t0 += dt;
  }
  function spr(sheet, W, H, ent, sx, sy){ cx.drawImage(sheet, ent.f * W, ent.d * H, W, H, Math.round(sx), Math.round(sy), W, H); }
  function draw(now){
    const vw = cv.width / (scale * G.dpr), vh = cv.height / (scale * G.dpr);
    let camx = Math.round(Math.max(0, Math.min(MW * T - vw, p.x - vw / 2))), camy = Math.round(Math.max(0, Math.min(MH * T - vh, p.y - vh / 2)));
    cx.setTransform(scale * G.dpr, 0, 0, scale * G.dpr, 0, 0); cx.imageSmoothingEnabled = false;
    cx.fillStyle = '#3E8FC7'; cx.fillRect(0, 0, vw, vh);
    cx.drawImage(bg, -camx, -camy);
    // water sparkles
    const t = now / 1000; cx.fillStyle = 'rgba(255,255,255,.7)';
    for(let ty = Math.floor(camy / T); ty < Math.min(MH, (camy + vh) / T + 1); ty++) for(let tx = Math.floor(camx / T); tx < Math.min(MW, (camx + vw) / T + 1); tx++){ if(map[ty][tx] !== '~') continue; const h = hash(tx, ty); if(((t * .6 + h * 7) % 3) < 1.2){ cx.fillRect(tx * T - camx + Math.floor(h * 10) + Math.floor((t * 3 + h * 5) % 3), ty * T - camy + Math.floor(hash(ty, tx) * 12), 3, 1); } }
    // fountain water
    cx.fillStyle = 'rgba(191,230,245,.9)'; const fy = 14 * T - 18 - Math.abs(Math.sin(t * 4)) * 3; cx.fillRect(21 * T + 14 - camx, fy - camy, 4, 4);
    // sort and draw everyone
    const ents = [{ y: p.y, fn: () => spr(sheets[me], 16, 22, p, p.x - 8 - camx, p.y - 20 - camy) }, { y: pup.y, fn: () => spr(dog, 16, 14, pup, pup.x - 8 - camx, pup.y - 12 - camy) }];
    npcs.forEach(n => ents.push({ y: n.y, fn: () => spr(n.sheet, 16, 22, n, n.x - 8 - camx, n.y - 20 - camy) }));
    if(remote.on) ents.push({ y: remote.y, fn: () => { spr(sheets[other], 16, 22, remote, remote.x - 8 - camx, remote.y - 20 - camy); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.fn());
    cx.drawImage(top, -camx, -camy);
    cx.save(); cx.translate(-camx, -camy); drawLighthouse(cx, true); cx.restore();
    // name tags + talk hint
    cx.font = '6px sans-serif'; cx.textAlign = 'center';
    const tag = (txt, x, y, col) => { const w = cx.measureText(txt).width + 6; cx.fillStyle = 'rgba(42,32,28,.75)'; cx.fillRect(Math.round(x - w / 2), Math.round(y - 7), Math.round(w), 8); cx.fillStyle = col || '#fff'; cx.fillText(txt, Math.round(x), Math.round(y - 1)); };
    if(remote.on) tag(api.nameOf(other), remote.x - camx, remote.y - 22 - camy, '#F4A6B8');
    if(!talk){ const fx = p.x + [0, -14, 14, 0][p.d], fy = p.y + [14, 0, 0, -14][p.d]; const n = npcs.find(n => Math.hypot(n.x - fx, n.y - fy) < 16); if(n) tag('💬 ' + n.name, n.x - camx, n.y - 22 - camy); }
    // time of day, from the real clock
    const hr = new Date().getHours() + new Date().getMinutes() / 60; let a = 0, col = '20,30,80';
    if(hr >= 20 || hr < 5.5) a = .38; else if(hr >= 18.5) { a = (hr - 18.5) / 1.5 * .38; col = '60,30,90'; } else if(hr < 7){ a = (7 - hr) / 1.5 * .3; col = '90,50,80'; }
    if(a > 0){ cx.fillStyle = `rgba(${col},${a})`; cx.fillRect(0, 0, vw, vh); }
    if(api.raining && api.raining()){ cx.fillStyle = 'rgba(200,220,255,.55)'; for(let i = 0; i < 70; i++){ const rx = (hash(i, 1) * vw + t * 40) % vw, ry = (hash(i, 2) * vh + t * 220 + i * 13) % vh; cx.fillRect(Math.round(rx), Math.round(ry), 1, 4); } }
  }
  function loop(now){ const dt = Math.min(.05, (now - prev) / 1000); prev = now; update(dt, now); draw(now); raf = requestAnimationFrame(loop); }
  raf = requestAnimationFrame(loop);
  host.querySelector('.rpg-who').textContent = '';
  setTimeout(() => { if(!saved.seen){ say('Dayla', ['*WOOF!* 🐾', `(Welcome to Rhead Island! Drag on the left side of the screen to walk, and tap A to talk or look at things.)`, '(Mayor Pip is waiting on the plaza by the fountain. Go say hi!)']); api.save({ x: Math.round(p.x), y: Math.round(p.y), d: p.d, seen: 1 }); saved.seen = 1; } }, 400);

  G.stop = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); send('bye', { who: me }); api.save({ x: Math.round(p.x), y: Math.round(p.y), d: p.d, seen: 1 }); try{ ch && api.unchannel(ch); }catch(e){} };
}
function stop(){ if(G){ G.stop(); G = null; } }
window.RheadRPG = { start, stop };
})();
