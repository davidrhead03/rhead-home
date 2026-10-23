/* =============================================================
   Where's Dayla? A pixel RPG for David & Laura
   Loaded only when the game is opened. window.RheadRPG.start(host, api)
   ============================================================= */
(function(){
'use strict';
const T = 16, MW = 44, MH = 40;
const SOLID = { T:1, '~':1, r:1, o:1, b:1, f:1, h:1, n:1 };
let G = null;

/* ---------- tiny seeded random ---------- */
function rng(seed){ let s = seed | 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/* ---------- the island map ---------- */
const HOUSES = [
  { id:'home', x:5, y:6, w:7, h:4, roof:'#4F7FB8', wall:'#F3E6CF', door:3, name:'Rhead House', sign:'🏠 Rhead House. Home sweet home! (Decorating comes soon.)' },
  { id:'bakery', x:28, y:6, w:7, h:4, roof:'#C9473D', wall:'#F6E3D3', door:3, name:'Mami Elsa’s Kitchen', sign:'🫓 Mami Elsa’s Kitchen. It smells like arepas and café.' },
  { id:'hall', x:16, y:3, w:9, h:4, roof:'#7A5BC4', wall:'#EFE7F7', door:4, name:'Town Hall', sign:'🏛️ Town Hall. Angelica’s office is upstairs.' },
  { id:'shop', x:6, y:16, w:6, h:4, roof:'#4F8761', wall:'#EEF3E6', door:2, name:'Olga’s Shop', sign:'🛍️ Olga’s Shop. Opening soon!' },
  { id:'chapel', x:4, y:21, w:5, h:3, roof:'#B39CE0', wall:'#FBF6EE', door:2, name:'Little Chapel', sign:'⛪ The little chapel. Everyone is welcome.' }
];
const LIGHT = { x:38, y:24, w:3, h:6 };
const COURT = { x:27, y:17, w:9, h:6 };
const PARK = { x:4, y:27, w:14, h:10, gx:13 };
const POOL = { x:28, y:27, w:12, h:9 };
const LOT = { x:19, y:31, w:7, h:6 };
const PORTAL = { x:10 * 16 + 8, y:32 * 16 + 8 };
function buildMap(){
  const m = [], R = rng(777);
  for(let y = 0; y < MH; y++){ m.push([]); for(let x = 0; x < MW; x++) m[y].push('.'); }
  const set = (x, y, c) => { if(x >= 0 && y >= 0 && x < MW && y < MH) m[y][x] = c; };
  for(let y = 0; y < MH; y++) for(let x = 0; x < MW; x++) if(x < 2 || x >= MW - 2 || y < 2 || y >= MH - 2) set(x, y, 'T');
  // roads
  for(let x = 2; x < MW - 2; x++) set(x, 13, '='), set(x, 14, '=');
  for(let y = 7; y < 31; y++) set(21, y, '='), set(22, y, '=');
  for(let y = 10; y < 13; y++) set(8, y, '='), set(31, y, '='), set(20, y - 3, '=');
  for(let y = 15; y < 27; y++) set(PARK.gx, y, '=');
  for(let x = 23; x < POOL.x; x++) set(x, 30, '=');
  // plaza
  for(let y = 11; y < 17; y++) for(let x = 18; x < 26; x++) set(x, y, '=');
  // court
  for(let y = COURT.y; y < COURT.y + COURT.h; y++) for(let x = COURT.x; x < COURT.x + COURT.w; x++) set(x, y, 'k');
  for(let x = 23; x < COURT.x; x++) set(x, 19, '=');
  // dog park: fence, gate, grass, bushes, benches
  for(let y = PARK.y; y < PARK.y + PARK.h; y++) for(let x = PARK.x; x < PARK.x + PARK.w; x++){ const edge = x === PARK.x || x === PARK.x + PARK.w - 1 || y === PARK.y || y === PARK.y + PARK.h - 1; set(x, y, edge ? 'f' : '.'); }
  set(PARK.gx, PARK.y, 'g'); set(6, 29, 'b'); set(16, 35, 'b'); set(15, 29, 'n'); set(6, 35, 'n'); set(16, 30, 'T');
  // pool deck + water
  for(let y = POOL.y; y < POOL.y + POOL.h; y++) for(let x = POOL.x; x < POOL.x + POOL.w; x++) set(x, y, 'd');
  for(let y = POOL.y + 2; y < POOL.y + POOL.h - 2; y++) for(let x = POOL.x + 2; x < POOL.x + POOL.w - 2; x++) set(x, y, '~');
  set(POOL.x + 1, POOL.y + 1, 'n'); set(POOL.x + POOL.w - 2, POOL.y + 1, 'n');
  // parking lot
  for(let y = LOT.y; y < LOT.y + LOT.h; y++) for(let x = LOT.x; x < LOT.x + LOT.w; x++) set(x, y, 'a');
  // houses (solid)
  HOUSES.forEach(h => { for(let y = h.y; y < h.y + h.h; y++) for(let x = h.x; x < h.x + h.w; x++) set(x, y, 'h'); set(h.x + h.door, h.y + h.h, '='); });
  for(let x = 4; x < 13; x++) set(x, 4, 'f');
  const free = (x, y, r) => { for(let yy = y - r; yy <= y + r; yy++) for(let xx = x - r; xx <= x + r; xx++){ const c = (m[yy] || [])[xx]; if(c !== '.' && c !== 'T') return false; } return true; };
  for(let i = 0; i < 90; i++){ const x = 2 + Math.floor(R() * (MW - 4)), y = 2 + Math.floor(R() * 35); if(y >= PARK.y - 1 && x <= PARK.x + PARK.w) continue; if(free(x, y, 1)) set(x, y, R() < .75 ? 'T' : 'b'); }
  for(let i = 0; i < 110; i++){ const x = 2 + Math.floor(R() * (MW - 4)), y = 2 + Math.floor(R() * 36); if(m[y][x] === '.') set(x, y, '*'); }
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
  if(ch === '~'){ P(0, 0, T, T, '#5CC8E0'); if((map[ty - 1] || [])[tx] !== '~') P(0, 0, T, 3, '#3E9BB8'); if((map[ty][tx - 1]) !== '~') P(0, 0, 2, T, '#3E9BB8'); if(hash(tx, ty) < .5) P(3 + Math.floor(hash(ty, tx) * 8), 6 + Math.floor(hash(tx, ty + 1) * 6), 4, 1, '#9EE3F0'); }
  if(ch === 'o') P(0, 0, T, T, '#F2DCA6');
  if(ch === 'r' || ch === 'o'){ P(3, 4, 10, 9, '#8E8A85'); P(4, 3, 8, 2, '#A9A49E'); P(5, 5, 3, 2, '#C4BFB8'); P(3, 12, 10, 2, '#6E6A66'); }
  if(ch === 'k'){ P(0, 0, T, T, '#D98A4E'); P(0, 0, T, 1, '#C77B42'); if(tx === COURT.x || tx === COURT.x + COURT.w - 1) P(tx === COURT.x ? 0 : 15, 0, 1, T, '#FFF'); if(ty === COURT.y || ty === COURT.y + COURT.h - 1) P(0, ty === COURT.y ? 0 : 15, T, 1, '#FFF'); if(tx === COURT.x + 4) P(7, 0, 2, T, '#FFF'); }
  if(ch === 'p'){ const L = map[ty][tx - 1] === 'p', Rr = map[ty][tx + 1] === 'p'; P(0, 0, T, T, '#58AEDD'); P(L ? 0 : 1, 0, T - (L ? 0 : 1) - (Rr ? 0 : 1), T, '#A0703F'); for(let y = 0; y < T; y += 4) P(L ? 0 : 1, y, T - (L ? 0 : 1) - (Rr ? 0 : 1), 1, '#7E5530'); if(!L) P(1, 0, 1, T, '#6A4426'); if(!Rr) P(14, 0, 1, T, '#6A4426'); }
  if(ch === 'f'){ P(0, 6, T, 2, '#C79A63'); P(0, 11, T, 2, '#C79A63'); P(2, 3, 3, 12, '#B5864F'); P(11, 3, 3, 12, '#B5864F'); }
  if(ch === 'b'){ P(2, 5, 12, 10, '#3F8C4A'); P(1, 7, 14, 6, '#3F8C4A'); P(4, 5, 4, 3, '#5DAF5F'); P(9, 9, 2, 2, '#E0566B'); P(5, 11, 2, 2, '#E0566B'); }
  if(ch === 'T'){ P(6, 9, 4, 7, '#7B4B2F'); P(7, 9, 1, 7, '#9A6440'); }
  if(ch === 'g' || ch === 'n'){ grass(); }
  if(ch === 'g'){ P(0, 0, T, T, '#DDBB82'); P(0, 3, 2, 12, '#B5864F'); P(14, 3, 2, 12, '#B5864F'); }
  if(ch === 'n'){ P(1, 6, 14, 3, '#9A6440'); P(1, 9, 14, 2, '#7B4B2F'); P(2, 11, 2, 4, '#5A3520'); P(12, 11, 2, 4, '#5A3520'); P(1, 3, 14, 2, '#9A6440'); }
  if(ch === 'd'){ P(0, 0, T, T, '#E9E2D6'); P(0, 0, T, 1, '#D8CFC0'); P(0, 0, 1, T, '#D8CFC0'); if(hash(tx, ty) < .2) P(5, 6, 2, 2, '#D8CFC0'); }
  if(ch === 'a'){ P(0, 0, T, T, '#5B5E66'); if(hash(tx, ty) < .4) P(Math.floor(hash(ty, tx) * 13), Math.floor(hash(tx + 3, ty) * 13), 2, 1, '#666A73'); if(tx % 2 === 0) P(0, 0, 1, 10, '#F2F2F2'); }
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
  if(h.id === 'chapel'){ x.fillStyle = '#F2C14E'; x.fillRect(px + w / 2 - 1, py - 10, 3, 14); x.fillRect(px + w / 2 - 5, py - 6, 11, 3); }
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
    if(c.belly){ P(3, 11 + bob, 10, 5, shirt); }
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
    if(hat){ const hc = c.accent || '#E0566B'; P(3, 0 + hy, 10, 3, hc); P(4, -1 + hy + 1, 8, 1, shade(hc, .2)); if(['cap','snapback','visor'].includes(c.hat)){ const bc = shade(hc, -.25); if(c.back){ if(d === 3) P(4, 3 + hy, 8, 1, bc); if(d === 1) P(11, 2 + hy, 4, 1, bc); if(d === 2) P(1, 2 + hy, 4, 1, bc); } else { if(d === 0) P(4, 3 + hy, 8, 1, bc); if(d === 1) P(1, 3 + hy, 4, 1, bc); if(d === 2) P(11, 3 + hy, 4, 1, bc); } } if(['cowboy','sunhat','fedora','bucket'].includes(c.hat)) P(1, 3 + hy, 14, 1, shade(hc, -.25)); }
  }
  return sheet;
}
function dogSheet(o){
  o = o || {}; const W = 16, H = 14, sheet = cnv(W * 3, H * 4), x = sheet.getContext('2d');
  const B = o.B || '#6B4226', D = o.D || '#4A2C18', Wt = o.Wt || '#F7F2EA', N = '#1A1414', lng = !!o.long;
  for(let d = 0; d < 4; d++) for(let f = 0; f < 3; f++){
    const ox = f * W, oy = d * H, P = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(ox + a, oy + b, w, h); }, lg = f === 0 ? 0 : f === 1 ? 1 : -1;
    P(3, 12, 10, 2, 'rgba(0,0,0,.18)');
    if(d === 0 || d === 3){ // front/back
      P(4, 6, 8, 5, B); if(d === 0) P(6, 6, 4, 5, Wt); P(4, 11, 2, 2 - (lg > 0 ? 1 : 0), d === 0 ? Wt : B); P(10, 11, 2, 2 - (lg < 0 ? 1 : 0), d === 0 ? Wt : B);
      P(4, 1, 8, 6, B); P(3, -1 + 1, 2, 3, D); P(11, 0, 2, 3, D); P(3, 0, 1, 1, D);
      if(d === 0){ P(7, 1, 2, 6, Wt); P(6, 4, 4, 3, Wt); P(5, 3, 1, 1, N); P(10, 3, 1, 1, N); P(7, 5, 2, 1, N); } else P(7, 9, 2, 2, B);
    } else {
      const r = d === 2, hx = r ? 10 : 1, tx = r ? 2 : 13;
      if(lng){ P(1, 7, 14, 3, B); P(r ? 6 : 3, 9, 7, 1, Wt); } else { P(3, 6, 10, 4, B); P(r ? 7 : 4, 8, 5, 2, Wt); }
      P(4 + lg, 10, 2, 3, B); P(10 - lg, 10, 2, 3, B); P(4 + lg, 12, 2, 1, Wt); P(10 - lg, 12, 2, 1, Wt);
      P(hx, 2, 6, 6, B); P(r ? hx + 3 : hx, 5, 3, 3, Wt); P(r ? hx + 5 : hx, 5, 1, 1, N); P(r ? hx + 2 : hx + 3, 3, 1, 1, N); P(r ? hx + 1 : hx + 4, 0, 2, 3, D);
      P(tx, 5 + (f === 1 ? 0 : 1), 1, 2, B);
    }
  }
  return sheet;
}

function wheelSheet(c){
  const base = heroSheet(c), W = 16, H = 22, sheet = cnv(W * 3, H * 4), x = sheet.getContext('2d');
  for(let d = 0; d < 4; d++) for(let f = 0; f < 3; f++){
    const ox = f * W, oy = d * H, P = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(ox + a, oy + b, w, h); };
    P(2, 20, 12, 2, 'rgba(0,0,0,.18)');
    if(d === 3) P(3, 9, 10, 7, '#3B4F6B');
    x.drawImage(base, 0, d * H, W, 14, ox, oy + 3, W, 14);
    if(d === 0 || d === 3){ P(1, 12, 2, 8, '#5B6B82'); P(13, 12, 2, 8, '#5B6B82'); P(1, 13 + f % 2 * 3, 2, 1, '#C4BFB8'); P(13, 16 - f % 2 * 3, 2, 1, '#C4BFB8'); P(4, 15, 8, 2, '#3B4F6B'); if(d === 0) P(5, 18, 6, 1, '#9AA3AD'); }
    else { const k = d === 1 ? 1 : -1; P(3, 11, 10, 10, '#5B6B82'); P(4, 12, 8, 8, '#9AA3AD'); P(7, 15, 2, 2, '#2A2F3A'); P(5 + (f === 1 ? 1 : 0), 13, 1, 6, '#5B6B82'); P(10 - (f === 2 ? 1 : 0), 13, 1, 6, '#5B6B82'); P(d === 1 ? 1 : 12, 16, 3, 1, '#9AA3AD'); P(d === 2 ? 2 : 11, 6, 2, 8, '#3B4F6B'); }
  }
  return sheet;
}

/* ---------- enemies, and things in Dayla's Diary ---------- */
const MONS = {
  hairball: { name:'Hairball', hp:3, atk:1, coins:3, xp:3, emo:'🐈', diary:'Smells like old tuna. Hisses at nothing. Wears a tiny helmet for no reason. 1/10.' },
  sarge: { name:'Sergeant Hairball', hp:10, atk:2, coins:15, xp:10, boss:1, emo:'🪖', diary:'Yells a LOT. Probably sad inside. I would still bite his tail. 3/10.' },
  duck: { name:'Big Duck', emo:'🦆', diary:'MY duck. Best duck. Squeaky, chewy, perfect. Why did it quack?? 11/10.' },
  alejandro: { name:'Alejandro', emo:'🐕', diary:'My best friend. Long. Loud. Brave. Smells great. 10/10.' },
  lunita: { name:'Lunita', emo:'🐕', diary:'Brown like me! FAST. Barks at everything. Saw me first. 9/10.' },
  papu: { name:'Papu', emo:'🐶', diary:'Gray. Snorts like a little tractor. Very serious guard. 8/10.' },
  moka: { name:'Moka', emo:'🐶', diary:'Light brown and chunky. Always chewing something mysterious. 9/10.' },
  condor: { name:'Cóndorito', emo:'🦅', diary:'Big bird. Bald head. Dramatic. Let me ride on his back once. 10/10, would fly again.' },
  capi: { name:'Captain Hairball', hp:9, atk:2, coins:25, xp:14, boss:1, emo:'🎖️', diary:'Red helmet. Bossy. Chased me up a whole mountain. Rude. 2/10.' }
};
const DIARY = ['duck', 'alejandro', 'hairball', 'sarge', 'lunita', 'papu', 'moka', 'condor', 'capi'];
function drawMon(x, k, X, Y, t, s){
  s = s || 1; const P = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(X + a * s), Math.round(Y + b * s), Math.ceil(w * s), Math.ceil(h * s)); };
  const bob = Math.round(Math.sin(t * 6) * 1);
  if(k === 'hairball' || k === 'sarge' || k === 'capi'){ const big = k !== 'hairball', c = big ? '#6E6A72' : '#8E8A93', d = big ? '#4E4A52' : '#6E6A72', o = big ? 0 : 2, w = big ? 20 : 14;
    const tl = Math.sin(t * 4) > 0 ? 1 : 0;
    P(o + 1, w - 1, w - 2, 2, 'rgba(0,0,0,.2)');
    P(o + 1, 7 + bob, w - 2, w - 9, c); P(o, 9 + bob, w, w - 12, c); P(o + 2, 9 + bob, 3, w - 12, d);
    P(o + 2, 2 + bob, 3, 4, c); P(o + w - 5, 2 + bob, 3, 4, c); P(o + 3, 3 + bob, 1, 2, '#F4A6B8'); P(o + w - 4, 3 + bob, 1, 2, '#F4A6B8');
    P(o + 1, 4 + bob, w - 2, 6, c);
    P(o + 3, 6 + bob, 3, 2, '#F2C14E'); P(o + w - 6, 6 + bob, 3, 2, '#F2C14E'); P(o + 4, 6 + bob, 1, 2, '#1A1414'); P(o + w - 5, 6 + bob, 1, 2, '#1A1414');
    P(o + 3, 5 + bob, 3, 1, d); P(o + w - 6, 5 + bob, 3, 1, d);
    P(o + w / 2 - 1, 8 + bob, 2, 1, '#E0566B');
    P(o + w - 1, 9 + bob - tl, 2, 2, c); P(o + w, 6 + bob - tl, 2, 4, c);
    P(o + 2, 1 + bob, w - 4, 2, k === 'capi' ? '#C9473D' : big ? '#4F6B4F' : '#5B6B82'); P(o + 1, 3 + bob, w - 2, 1, k === 'capi' ? '#93303A' : big ? '#3B523B' : '#3B4F6B'); if(big){ P(o + w / 2 - 1, 0 + bob, 2, 1, '#F2C14E'); }
  } else if(k === 'condor'){ P(2, 13, 12, 2, 'rgba(0,0,0,.18)'); P(3, 6 + bob, 10, 6, '#2A201C'); P(0, 7 + bob, 4, 4, '#2A201C'); P(12, 7 + bob, 4, 4, '#2A201C'); P(1, 9 + bob, 2, 1, '#F4F4F4'); P(13, 9 + bob, 2, 1, '#F4F4F4'); P(4, 4 + bob, 8, 3, '#FFFFFF'); P(6, 0 + bob, 5, 5, '#D98A7A'); P(9, 1 + bob, 1, 1, '#1A1414'); P(11, 2 + bob, 2, 2, '#E2AE55'); P(5, 12, 2, 2, '#9AA3AD'); P(9, 12, 2, 2, '#9AA3AD');
  } else if(k === 'duck'){ P(2, 12, 10, 2, 'rgba(0,0,0,.18)'); P(2, 6 + bob, 10, 6, '#F2C14E'); P(1, 8 + bob, 12, 3, '#F2C14E'); P(4, 1 + bob, 6, 6, '#F2C14E'); P(9, 4 + bob, 4, 2, '#F28C38'); P(7, 3 + bob, 1, 1, '#1A1414'); P(3, 7 + bob, 4, 2, '#E2AE55'); P(4, 12, 2, 1, '#F28C38'); P(8, 12, 2, 1, '#F28C38'); }
  else if(k === 'whiskers'){ const fur = '#F4EFE8', sh = '#D9D1C6';
    P(0, 10, 28, 20, '#C9473D'); P(2, 12, 24, 18, '#A93A4C');
    P(4, 8, 20, 18, fur); P(2, 12, 24, 12, fur); P(4, 22, 20, 4, sh);
    P(4, 3, 5, 7, fur); P(19, 3, 5, 7, fur); P(6, 5, 2, 4, '#F4A6B8'); P(20, 5, 2, 4, '#F4A6B8');
    P(7, 13, 5, 3, '#7FD07A'); P(16, 13, 5, 3, '#7FD07A'); P(9, 13, 1, 3, '#1A1414'); P(18, 13, 1, 3, '#1A1414'); P(7, 12, 5, 1, sh); P(16, 12, 5, 1, sh);
    P(13, 17, 2, 2, '#E0566B'); P(11, 19, 6, 1, '#9A6B6B'); P(1, 18, 6, 1, sh); P(21, 18, 6, 1, sh); P(1, 20, 6, 1, sh); P(21, 20, 6, 1, sh);
    P(7, 2, 14, 4, '#F2C14E'); P(7, -1, 2, 3, '#F2C14E'); P(13, -2, 2, 4, '#F2C14E'); P(19, -1, 2, 3, '#F2C14E'); P(13, 3, 2, 2, '#58AEDD'); }
}

/* ---------- sound: voice blips, effects, and chiptune music ---------- */
const VOICES = { 'Joseph':[120,'triangle'], 'Angelica':[400,'sine'], 'Olga':[360,'triangle'], 'Joshua':[640,'square'], 'Vecino Ernesto':[170,'square'], 'Mami Elsa':[470,'sine'], 'Titin':[210,'square'], 'Carolina':[440,'triangle'], 'Diana':[420,'sine'], 'Juandi':[260,'triangle'], 'Coach JP':[200,'triangle'], 'Ana':[520,'sine'], 'Diego':[180,'triangle'], 'Tyler':[240,'square'], 'Steven':[160,'triangle'], 'Baba':[380,'sine'], 'Deda':[115,'square'], 'Alejandro':[980,'square'], 'Dayla':[760,'square'], 'Big Duck':[620,'square'], 'Boss Whiskers':[95,'sawtooth'], 'Sergeant Hairball':[150,'sawtooth'], 'Hairball':[520,'sawtooth'], '???':[300,'sawtooth'], 'Sign':[300,'sine'], 'Rhead House':[330,'sine'], 'Dog Park Gate':[300,'sine'] };
let AC = null, MASTER = null;
function audio(){ if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = 1; MASTER.connect(AC.destination); }catch(e){ return null; } } if(AC.state === 'suspended') AC.resume(); return AC; }
function tone(type, f, t, d, v, f2){ const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(MASTER); o.start(t); o.stop(t + d + .02); }
function noise(t, d, v){ const n = AC.createBufferSource(), b = AC.createBuffer(1, Math.floor(AC.sampleRate * d), AC.sampleRate), ch = b.getChannelData(0); for(let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length); n.buffer = b; const g = AC.createGain(); g.gain.value = v; n.connect(g).connect(MASTER); n.start(t); }
let SOUND_ON = () => true;
function sfx(k){ if(!SOUND_ON() || !audio()) return; const t = AC.currentTime;
  if(k === 'quack'){ tone('square', 620, t, .12, .06, 380); tone('square', 600, t + .14, .14, .06, 340); }
  else if(k === 'yap'){ tone('square', 1100, t, .06, .05, 900); tone('square', 1200, t + .09, .06, .05, 950); }
  else if(k === 'portal'){ tone('sine', 180, t, 1.2, .08, 900); tone('triangle', 90, t, 1.2, .05, 450); }
  else if(k === 'hit'){ noise(t, .12, .25); tone('square', 220, t, .1, .05, 110); }
  else if(k === 'guard'){ tone('triangle', 880, t, .08, .07); tone('triangle', 1320, t + .06, .1, .06); }
  else if(k === 'hurt'){ tone('sawtooth', 200, t, .2, .05, 90); }
  else if(k === 'nice'){ [660, 880, 1100].forEach((f, i) => tone('square', f, t + i * .06, .08, .045)); }
  else if(k === 'win'){ [523, 659, 784, 1047].forEach((f, i) => tone('square', f, t + i * .11, .14, .05)); }
  else if(k === 'clang'){ noise(t, .2, .3); tone('square', 140, t, .25, .06, 70); }
  else if(k === 'hiss'){ noise(t, .35, .12); }
  else if(k === 'crash'){ noise(t, .5, .35); tone('sawtooth', 300, t, .5, .05, 60); }
  else if(k === 'step'){ noise(t, .03, .03); }
}
const SONGS = {
  home: { bpm:108, div:2, lead:[72,0,76,0,79,0,76,0, 77,0,76,0,74,0,0,0, 71,0,74,0,77,0,74,0, 72,0,74,76,72,0,0,0, 72,0,76,0,79,0,81,0, 79,0,77,0,76,0,0,0, 74,0,77,0,76,0,74,0, 72,0,0,0,0,0,0,0], bass:[48,0,55,0,52,0,55,0, 53,0,57,0,53,0,57,0, 55,0,59,0,55,0,59,0, 48,0,55,0,52,0,55,0, 48,0,55,0,52,0,55,0, 53,0,57,0,53,0,57,0, 55,0,59,0,55,0,59,0, 48,0,52,0,55,0,48,0] },
  sad: { bpm:76, div:2, lead:[76,0,0,74,72,0,0,0, 71,0,0,72,74,0,0,0, 72,0,0,71,69,0,0,0, 68,0,0,69,71,0,0,0], bass:[45,0,52,0,57,0,52,0, 43,0,50,0,55,0,50,0, 41,0,48,0,53,0,48,0, 40,0,47,0,52,0,47,0] },
  battle: { bpm:150, div:4, lead:[69,0,72,69,76,0,74,72, 71,0,74,71,76,0,74,71, 69,0,72,69,76,0,79,77, 76,74,72,71,69,0,0,0], bass:[45,45,57,45,45,57,45,57, 43,43,55,43,43,55,43,55, 41,41,53,41,41,53,41,53, 40,40,52,40,44,44,56,44] },
  boss: { bpm:132, div:2, lead:[62,0,65,0,69,0,68,0, 62,0,65,0,70,0,69,0, 62,65,69,74,73,0,70,0, 69,0,65,0,64,0,61,0], bass:[38,0,38,50,38,0,38,50, 34,0,34,46,34,0,34,46, 36,0,36,48,36,0,36,48, 33,0,33,45,37,0,37,49] },
  bogota: { bpm:100, div:2, shaker:1, lead:[67,0,70,0,74,0,72,70, 69,0,72,0,70,0,69,67, 65,0,69,0,72,0,70,69, 67,0,0,0,62,0,65,0, 67,0,70,0,74,0,75,74, 72,0,70,0,69,0,70,72, 74,0,72,0,70,0,69,65, 67,0,0,0,0,0,0,0], bass:[43,0,50,0,43,0,50,0, 41,0,48,0,41,0,48,0, 39,0,46,0,39,0,46,0, 38,0,45,0,38,0,50,0] },
  victory: { bpm:140, div:2, once:1, lead:[72,76,79,84,0,79,84,0], bass:[48,52,55,60,0,55,60,0] }
};
const MUS = (() => { let prevSong = null, cur = null, step = 0, nextT = 0, timer = null, want = null, on = true;
  try{ on = localStorage.getItem('rpgMusic') !== 'off'; }catch(e){}
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function tick(){ if(!cur || !AC) return; const S = SONGS[cur], dur = 60 / S.bpm / S.div;
    while(nextT < AC.currentTime + .2){ const i = step % S.lead.length, a = S.lead[i], b = S.bass[i % S.bass.length];
      if(a) tone('square', hz(a), nextT, dur * .9, .028); if(b) tone('triangle', hz(b), nextT, dur * .95, .05);
      if(S.div === 4 && i % 4 === 0) noise(nextT, .03, .03); if(S.shaker && i % 2 === 1) noise(nextT, .025, .025);
      nextT += dur; step++; if(S.once && step >= S.lead.length){ const back = want === cur ? (prevSong || 'home') : want; cur = null; if(back && back !== 'victory') setTimeout(() => play(back), 300); return; } } }
  function play(name){ if(name === 'victory' && cur && cur !== 'victory') prevSong = (cur === 'battle' || cur === 'boss') ? null : cur; if(name !== 'victory' && name !== 'battle' && name !== 'boss') prevSong = name; want = name; if(!on || !SOUND_ON() || !audio()) return; if(cur === name) return; cur = name; step = 0; nextT = AC.currentTime + .05; if(!timer) timer = setInterval(tick, 60); }
  function stop(){ cur = null; if(timer){ clearInterval(timer); timer = null; } }
  return { play, stop, get on(){ return on; }, toggle(){ on = !on; try{ localStorage.setItem('rpgMusic', on ? 'on' : 'off'); }catch(e){} if(!on){ const w = want; stop(); want = w; } else if(want) play(want); return on; }, resume(){ if(want && !cur) play(want); } };
})();
function blip(name, ch){
  if(!SOUND_ON() || !audio()) return;
  const v = VOICES[name] || [360, 'sine'], now = AC.currentTime;
  const vow = 'aeiouy'.includes(String(ch).toLowerCase()) ? 1.12 : 1, f = v[0] * vow * (0.94 + Math.random() * .12);
  tone(v[1], f, now, .07, v[1] === 'square' || v[1] === 'sawtooth' ? .03 : .06, f * (name === 'Big Duck' ? .7 : .82));
}

/* ---------- people of the neighbourhood ---------- */
function npcAv(base, o){ return Object.assign({}, base, o); }
const cats = W => ['c1', 'c2', 'c3'].filter(k => W['p_' + k]).length;
function objective(W, st){
  if(!W.p_start) return 'Play with Dayla at home.';
  const fam = ['ernesto', 'joshua', 'joseph'].filter(k => W['p_' + k]).length;
  if(W.p_done) return 'Prologue complete! The portal in the dog park leads to Bogotá. Chapter 1 is coming next.';
  if(fam < 3) return `Ask the family for help: Vecino Ernesto, Joshua and Joseph (${fam}/3 so far).`;
  if(cats(W) < 3) return `Defeat the Hairballs around the neighbourhood (${cats(W)}/3).`;
  if(st.partner !== 'alejandro') return 'Find a small friend who can squeeze under the dog park fence. Alejandro is usually near the plaza.';
  if(!W.p_gate) return 'Go to the dog park gate and tap 🐾 so Alejandro can squeeze under and open it.';
  return 'Defeat the Hairball guarding the portal in the middle of the dog park.';
}
function makeNPCs(api){
  const b = api.baseAv(), L = api.me === 'laura', son = L ? 'mija' : 'mijo';
  const VERSES = ['“Be strong and of a good courage… for the LORD thy God is with thee whithersoever thou goest.” (Joshua 1:9)', '“This is the day which the LORD hath made; we will rejoice and be glad in it.” (Psalm 118:24)', '“Trust in the LORD with all thine heart; and lean not unto thine own understanding.” (Proverbs 3:5)', '“Charity suffereth long, and is kind.” (1 Corinthians 13:4)'];
  const lost = W => W.p_start && !W.p_done;
  return [
    { id:'joseph', name:'Joseph', x:24, y:15, d:0, av:npcAv(b, { skin:'#5A3826', hair:'#171210', style:'buzz', shirt:'#2A3350', pants:'#5B6B82' }),
      lines: (me, W) => !W.p_start ? [`Hey ${me}! Beautiful Saturday, huh?`] : W.p_done ? ['We’ll get her back. The Rhead family never leaves anyone behind. 🫡'] : !W.p_joseph ? ['Dayla is GONE? Through a… portal?', 'Alright. Stay calm. In the Navy we called this a search and rescue.', 'Those gray cats in little helmets showed up around the neighbourhood this morning. They’re guarding something.', 'Take out three of them, then we move on that dog park. That’s an order! …Please.'] : cats(W) < 3 ? [`Hairballs still out there: ${3 - cats(W)}. Keep at it, sailor.`] : ['Outstanding work. Now get to that dog park and find out what those cats are hiding.'],
      end: W => W.p_start && !W.p_joseph ? { p_joseph: 1 } : null },
    { id:'ernesto', name:'Vecino Ernesto', x:13, y:8, d:0, av:npcAv(b, { skin:'#C98E68', hair:'#171210', style:'short', hat:'cap', accent:'#4F6B4F', shirt:'#6B7B4F', pants:'#7B4B2F', facial:'stubble', back:1, belly:1 }),
      lines: (me, W) => !W.p_start ? [L ? '¡Ey, vecina! (Hey, neighbour!)' : '¡Ey, vecino! (Hey, neighbour!)', 'If anything breaks at your house, you call me. Anytime.'] : !W.p_ernesto ? ['¡Vecino! What happened? Where’s Dayla?', '…A portal? Okay. I’ve tracked deer, I can track a perrita. (a little dog)', 'Her paw prints go straight to the middle of the dog park… and then they just STOP. Like she vanished into thin air.', 'And there are cat prints everywhere. Lots of them. Something is going on in that park.'] : ['Those cat prints are fresh. Be careful, vecino.'],
      end: W => W.p_start && !W.p_ernesto ? { p_ernesto: 1 } : null },
    { id:'joshua', name:'Joshua', x:14, y:11, d:0, wander:1, av:npcAv(b, { skin:'#B07A55', hair:'#171210', style:'curls', glasses:'square', shirt:'#4F8761', pants:'#3B4F6B' }),
      lines: (me, W) => !W.p_start ? ['Yo! Wanna play Minecraft later?', 'Also if you find a squishy shaped like a cat, it’s mine.'] : !W.p_joshua ? ['Wait, WHAT? Dayla went through a PORTAL?!', 'Hold on, let me check my VR headset… it’s picking up a weird signal!', 'It’s coming from the dog park. It’s like a door that’s closed… but not locked. Something there could open it again!', 'This is the coolest AND worst thing that has ever happened.'] : ['My headset is still beeping like crazy near the dog park. 📡'],
      end: W => W.p_start && !W.p_joshua ? { p_joshua: 1 } : null },
    { id:'angelica', name:'Angelica', x:20, y:8, d:0, av:npcAv(b, { skin:'#F1D3B8', hair:'#171210', style:'long', top:'dress', shirt:'#2A3350', bottom:'skirt', pants:'#2A3350', lashes:'natural' }),
      lines: (me, W) => lost(W) ? ['Dayla is missing? ¡Qué horror! (How awful!)', 'I’ll have everyone at Town Hall keep an eye out. Go, go!'] : ['¡Hola! Welcome to Town Hall. I keep this neighbourhood running.', L ? 'Laura, you work so hard. ¡Tómate el día! (Take the day off!) 😉' : 'Tell Laura she’s doing an amazing job. ¡Es la mejor! (She’s the best!)'] },
    { id:'olga', name:'Olga', x:9, y:21, d:0, wander:1, av:npcAv(b, { skin:'#FBE0CC', hair:'#171210', style:'long', shirt:'#6C5B9E', bottom:'skirt', pants:'#2A2F3A', lashes:'natural' }),
      lines: (me, W) => lost(W) ? [L ? 'Laurochka!' : 'Davidka!', 'Dayla is gone?! Bozhe moi! (My God!)', 'You go find her. But first: did you eat? You cannot rescue a dog on an empty stomach.'] : [L ? 'Laurochka! Privet! (Hi!)' : 'Davidka! Privet! (Hi!)', 'My shop opens soon. For family, special discount… maybe. 😏'] },
    { id:'elsa', name:'Mami Elsa', x:31, y:11, d:0, wander:1, av:npcAv(b, { skin:'#C98E68', hair:'#B4B0AC', style:'pony', shirt:'#E07A93', bottom:'skirt', pants:'#6C5B9E' }), gift:1,
      lines: (me, W, c) => lost(W) && !c.st.got_elsa ? ['¡Ay, Dios mío! ¿Y Dayla? (Oh my God! And Dayla?)', 'Voy a rezar por ella. (I’m going to pray for her.)', 'Tome, mi amor, unas arepas para el camino. (Here, my love, some arepas for the road.)', '(Got 3 Arepas! Eat them in battle to heal.)'] : ['¡Ay, mi amor! ¿Ya comió? (Oh, my love! Have you eaten?)', '¡Coma, coma! (Eat, eat!) 🫓'] },
    { id:'tintin', name:'Titin', x:35, y:16, d:0, av:npcAv(b, { skin:'#E3B08C', hair:'#3A281E', style:'short', glasses:'square', shirt:'#F2C14E', pants:'#2A2F3A' }), taxi:1,
      lines: () => [`¡Quiubo, ${son}! ¡Súbase al taxi! (What’s up! Hop in the taxi!)`, '¿Para dónde lo llevo? Para la familia es gratis. (Where to? It’s free for family.)'] },
    { id:'carolina', name:'Carolina', x:12, y:19, d:0, wander:1, av:npcAv(b, { skin:'#E3B08C', hair:'#3A281E', style:'long', shirt:'#F2C14E', pants:'#3B4F6B', lashes:'natural' }),
      lines: (me, W) => lost(W) ? ['¿Dayla se perdió? ¡No puede ser! (Dayla is lost? It can’t be!)', 'Cuando la encuentren, le compro un juguete nuevo. (When you find her, I’ll buy her a new toy.) 🛍️'] : ['¡Hola, mi amor! (Hi, my love!)', '¡Vamos de compras! Hay descuentos en todas las tiendas. (Let’s go shopping! There are sales at every store.) 🛍️'] },
    { id:'diana', name:'Diana', x:6, y:25, d:0, av:npcAv(b, { skin:'#D9A07A', hair:'#171210', style:'bob', shirt:'#7FB6D9', bottom:'longskirt', pants:'#F2E6D8', lashes:'natural' }),
      lines: (me, W) => ['¡Hola! Welcome to the little chapel. 🙏', lost(W) ? 'I’m praying for Dayla. Here is a verse for you today:' : 'Here is the verse for today:', VERSES[new Date().getDate() % VERSES.length], 'Dios te bendiga. (God bless you.)'] },
    { id:'juandi', name:'Juandi', x:25, y:29, d:0, wander:1, av:npcAv(b, { skin:'#D9A07A', hair:'#171210', style:'short', shirt:'#F2C14E', pants:'#3B4F6B', bottom:'shorts' }),
      lines: (me, W, c) => { const n = DIARY.filter(k => c.st.diary[k]).length; return lost(W) ? ['Bro, a portal?! That’s straight out of Pokémon. ⚽', `Dayla’s Diary has ${n} page${n === 1 ? '' : 's'} filled in. Keep filling it, she’ll want to read it when she’s back!`] : ['¡Hey! ⚽ I’m going pro after graduation. Then I’m buying a stadium. 😎']; } },
    { id:'jp', name:'Coach JP', x:31, y:23, d:3, av:npcAv(b, { skin:'#F6D5BC', hair:'#171210', style:'short', shirt:'#3E6E8E', pants:'#2A201C', hat:'cap', accent:'#C9473D' }),
      lines: me => [`What’s good, ${me}! ¿Qué más? (What’s up?)`, 'The court’s almost ready. New nets, new ball, new shot meter.', 'Come back soon and we’ll see if you can hit a green release. 🏀'] },
    { id:'ana', name:'Ana', x:29, y:24, d:3, wander:1, av:npcAv(b, { skin:'#EDC3A3', hair:'#D2692E', style:'long', shirt:'#F4A6B8', pants:'#3B4F6B', lashes:'natural' }),
      lines: () => ['¡Hola, hola! JP talks about basketball all day. ALL day. 😂', 'When the court opens, I’ll be the loudest one cheering. ¡Vamos! 🧡'] },
    { id:'diego', name:'Diego', x:29, y:20, d:0, wander:1, av:npcAv(b, { skin:'#D9A07A', hair:'#2A201C', style:'side', facial:'mustache', shirt:'#C9473D', pants:'#3B4F6B' }),
      lines: () => [`¡Hola, ${son}! I am Diego.`, 'Basketball, soccer, I play everything. Before, I worked at Costco. The free samples were the best part. 😄'] },
    { id:'tyler', name:'Tyler', x:33, y:20, d:0, wander:1, av:npcAv(b, { skin:'#FBE0CC', hair:'#8A5A36', style:'buzz', glasses:'square', shirt:'#7A5BC4', pants:'#2A201C' }),
      lines: () => [L ? 'Hey Laura! Tell David to hop on 2K tonight.' : 'Bro, you hopping on 2K tonight?', 'Also, when the court’s done, you’re getting cooked. Just saying. 🏀'] },
    { id:'steven', name:'Steven', x:28, y:3, d:0, av:npcAv(b, { skin:'#F6D5BC', hair:'#8A5A36', style:'buzz', facial:'fullbeard', shirt:'#4F8761', pants:'#C9B79C', shoes:'boots' }),
      lines: (me, W) => [L ? 'Hey Laura!' : 'Hey bud!', lost(W) ? 'Dayla went missing? I’m flying back to Surrey tonight, but call me if you need anything. Anything at all.' : 'Just finished a workout. Now I’m scouting a hiking trail through the woods up here.'] },
    { id:'baba', name:'Baba', x:31, y:34, d:0, av:npcAv(b, { skin:'#FBE0CC', hair:'#D6D0C8', style:'curly', shirt:'#B39CE0', bottom:'skirt', pants:'#6C5B9E' }),
      lines: (me, W) => [`Ah, ${me}! Come, come. Are you hungry? I make pirozhki.`, lost(W) ? 'Dayla will come back. Dogs always find the people who love them. ❤️' : 'Deda and I come to the pool every day. Fresh air, nice walk.'] },
    { id:'deda', name:'Deda', x:34, y:34, d:0, wheel:1, av:npcAv(b, { skin:'#FBE0CC', hair:'#9A9693', style:'buzz', shirt:'#3E6E8E', pants:'#2A2F3A' }),
      lines: (me, W) => lost(W) ? ['Privet. (Hi.) Dayla is gone? Hm.', 'Listen to Deda: when you fight, watch the timing. Tap A right when they hit you, and you take less damage.', 'And when you attack, tap when the marker is in the green. Simple.'] : ['Privet! (Hi!) Deda is relaxing by the pool.', 'I checked. No fish here. Very disappointing. 🎣'] },
    { id:'alejandro', name:'Alejandro', x:17, y:16, d:0, wander:2, dog:1,
      lines: (me, W) => W.p_start ? ['*yip yip!* 🐕', '(Alejandro sniffs the air… then whines. He knows Dayla is gone.)', '(Alejandro wants to help you find her! Alejandro joined your team!)'] : ['*yip yip!* 🐕', '(Alejandro and Dayla sniff each other. Best friends forever.)'],
      end: W => W.p_start ? { _join: 1 } : null }
  ];
}
const SIGNS = [
  { x:19, y:17, text:'🌴 Welcome to the neighbourhood! ↑ Town Hall · ← Rhead House · → Mami Elsa’s Kitchen · ↓ Dog Park and Pool' },
  { x:26, y:19, text:'🏀 Rhead Court. Tip-off coming soon!' },
  { x:15, y:25, text:'🐾 Rhead Dog Park. Off-leash fun! Please pick up after your dog.' },
  { x:27, y:28, text:'🏊 Community Pool. No running! (Joshua, this means you.)' }
];
const AREAS = [ [0, 0, MW, 26, 'The Neighbourhood'], [PARK.x, PARK.y, PARK.x + PARK.w, PARK.y + PARK.h, 'Dog Park'], [POOL.x, POOL.y, POOL.x + POOL.w, POOL.y + POOL.h, 'Pool'], [LOT.x, LOT.y, LOT.x + LOT.w, LOT.y + LOT.h, 'Parking Lot'], [COURT.x, COURT.y, COURT.x + COURT.w, COURT.y + COURT.h, 'Rhead Court'] ];
const GATE = { x: PARK.gx * T + 8, y: PARK.y * T + 8 };

/* =============== Chapter 1: Bogotá =============== */
const BOG = {
  houses: [
    { id:'cathedral', x:15, y:10, w:11, h:5, roof:'#8E7B6B', wall:'#F1E6D2', door:5, name:'The Cathedral', sign:'⛪ The Cathedral on the plaza. Diana says it’s her favourite place in the city.' },
    { id:'h1', x:3, y:3, w:5, h:3, roof:'#B5523B', wall:'#F2C14E', door:2, name:'Yellow house', sign:'🏠 A bright yellow house. Someone inside is listening to vallenato.' },
    { id:'h2', x:9, y:3, w:5, h:3, roof:'#B5523B', wall:'#58AEDD', door:2, name:'Blue house', sign:'🏠 A blue house with flower pots in every window.' },
    { id:'elsa', x:15, y:3, w:6, h:3, roof:'#B5523B', wall:'#E07A93', door:2, name:'Mami Elsa’s old house', sign:'🫓 Mami Elsa’s old house. It still smells like arepas.' },
    { id:'h4', x:22, y:3, w:4, h:3, roof:'#B5523B', wall:'#7FD07A', door:1, name:'Green house', sign:'🏠 A green house. A cat watches you from the window. Suspicious.' },
    { id:'h5', x:3, y:28, w:5, h:3, roof:'#B5523B', wall:'#F4A6B8', door:2, name:'Pink house', sign:'🏠 A pink house with a little bakery sign: “Pan de bono”.' },
    { id:'h6', x:28, y:27, w:5, h:3, roof:'#B5523B', wall:'#F2E6D8', door:2, name:'White house', sign:'🏠 A white house with a huge Colombia flag on the balcony.' },
    { id:'h7', x:35, y:27, w:5, h:3, roof:'#B5523B', wall:'#B39CE0', door:2, name:'Purple house', sign:'🏠 A purple house. Somebody is frying empanadas. You are now hungry.' },
    { id:'sanct', x:31, y:2, w:6, h:2, roof:'#C9473D', wall:'#FBF6EE', door:3, name:'The mountain chapel', sign:'⛪ The little white chapel at the top of Monserrate. The whole city is below you.' }
  ],
  signs: [
    { x:23, y:25, text:'↑ Plaza · ↗ Monserrate · ↙ Portal home' },
    { x:28, y:22, text:'⛰️ Monserrate. 3,152 m above the sea. Bring a jacket!' }
  ],
  areas: [ [0, 0, MW, MH, 'Bogotá'], [8, 16, 23, 26, 'The Plaza'], [26, 0, MW, 22, 'Monserrate'] ],
  portal: { x: 6 * 16 + 8, y: 35 * 16 + 8 },
  spawn: [6, 33]
};
function buildBogota(){
  const m = [], R = rng(57);
  for(let y = 0; y < MH; y++){ m.push([]); for(let x = 0; x < MW; x++) m[y].push('c'); }
  const set = (x, y, c) => { if(x >= 0 && y >= 0 && x < MW && y < MH) m[y][x] = c; };
  for(let y = 0; y < MH; y++) for(let x = 0; x < MW; x++) if(x < 2 || x >= MW - 2 || y >= MH - 2 || y < 1) set(x, y, 'T');
  // the mountain
  for(let y = 0; y < 22; y++) for(let x = 26; x < MW; x++) set(x, y, 'M');
  const S = (x0, y0, x1, y1) => { for(let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for(let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) set(x, y, 'S'); };
  S(30, 21, 30, 14); S(30, 14, 37, 14); S(37, 14, 37, 8); S(37, 8, 31, 8); S(31, 8, 31, 6); for(let y = 1; y < 7; y++) for(let x = 29; x < 40; x++) set(x, y, 'S');
  set(37, 11, 'X'); set(37, 10, 'X'); set(36, 11, 'M'); set(38, 11, 'M');
  set(30, 22, 'B'); for(let x = 27; x < 30; x++) set(x, 22, 'c');
  // the plaza
  for(let y = 16; y < 26; y++) for(let x = 8; x < 23; x++) set(x, y, 'q');
  for(let y = 20; y < 22; y++) for(let x = 15; x < 17; x++) set(x, y, 'h');
  // houses
  BOG.houses.forEach(h => { for(let y = h.y; y < h.y + h.h; y++) for(let x = h.x; x < h.x + h.w; x++) set(x, y, 'h'); if(h.id !== 'sanct') set(h.x + h.door, h.y + h.h, 'c'); });
  // little park around the portal
  for(let y = 33; y < 38; y++) for(let x = 3; x < 10; x++) set(x, y, '.');
  for(let i = 0; i < 26; i++){ const x = 2 + Math.floor(R() * 24), y = 7 + Math.floor(R() * 30); if(m[y][x] === 'c' && !(y >= 15 && y <= 26) && !(x >= 3 && x <= 10 && y >= 32)) set(x, y, R() < .7 ? 'T' : 'b'); }
  return m;
}
function bogTiles(x, tx, ty, ch, map){
  const px = tx * T, py = ty * T, h = hash(tx, ty), P = (dx, dy, w, hh, col) => { x.fillStyle = col; x.fillRect(px + dx, py + dy, w, hh); };
  if(ch === 'c' || ch === 'T' || ch === 'b' || ch === 'B'){ P(0, 0, T, T, '#C9BBA8'); for(let i = 0; i < 4; i++) P((i % 2) * 8 + (ty % 2) * 4, Math.floor(i / 2) * 8, 7, 7, h < .5 ? '#BFAF9A' : '#D3C6B4'); }
  if(ch === 'q'){ P(0, 0, T, T, '#E2D6C2'); P(0, 0, T, 1, '#CDBFA8'); P(0, 0, 1, T, '#CDBFA8'); if(h < .15) P(6, 6, 3, 3, '#D3C6B4'); }
  if(ch === 'M'){ P(0, 0, T, T, h < .5 ? '#4E8A55' : '#467F4D'); if(h < .3) P(3 + Math.floor(h * 20), 5, 5, 4, '#8E8A85'); if(h > .8) P(6, 2, 4, 6, '#2F6B3E'); }
  if(ch === 'S'){ P(0, 0, T, T, '#A9A49E'); P(0, 4, T, 1, '#8E8A85'); P(0, 9, T, 1, '#8E8A85'); P(0, 14, T, 1, '#8E8A85'); }
  if(ch === 'X'){ P(0, 0, T, T, '#2A3350'); P(0, 0, T, 2, '#4E8A55'); P(2, 7, 12, 2, 'rgba(255,255,255,.25)'); }

  if(ch === '.'){ P(0, 0, T, T, h < .5 ? '#74C062' : '#6DBB5A'); }
  if(ch === 'T') { P(6, 9, 4, 7, '#7B4B2F'); }
  if(ch === 'b'){ P(2, 5, 12, 10, '#3F8C4A'); P(4, 5, 4, 3, '#5DAF5F'); P(9, 9, 2, 2, '#F2C14E'); }
}
const condorPal = { name: 'Cóndorito', move: 'dive-bomb', emo: '🦅' };
function objectiveB(W){
  if(!W.b_ale || !W.b_sam) return 'Find Laura’s friends Alejandra and Samuel Clavijo on the plaza. They’re great at solving mysteries.';
  if(!W.b_dogs) return 'Ask the street dogs (Lunita, Papu and Moka) if they saw Dayla. They hang out near the south street.';
  if(!W.b_condor) return 'Climb Monserrate! The trail starts east of the plaza. Watch out for Hairballs on the stairs.';
  if(!W.b_gap) return 'There’s a gap in the trail. Stand by it and tap 🐾 so Cóndorito can fly you across.';
  if(!W.b_done) return 'Reach the top of Monserrate. Something big is waiting there.';
  return 'Chapter 1 complete! The portal points to New York. Chapter 2 is coming soon.';
}
function makeBogotaNPCs(api){
  const b = api.baseAv(), L = api.me === 'laura', son = L ? 'mija' : 'mijo';
  const done = W => W.b_done;
  return [
    { id:'alejandra', name:'Alejandra', x:18, y:19, d:0, av:npcAv(b, { skin:'#E3B08C', hair:'#5B3B27', style:'pony', glasses:'round', shirt:'#58AEDD', pants:'#3B4F6B', lashes:'natural' }),
      lines: (me, W) => W.b_ale ? ['The dogs around here see everything. Ask them!'] : [`¡${me}! ¿Qué haces en Bogotá? (What are you doing in Bogotá?)`, '…Dayla went through a PORTAL? Okay. Okay. Samuel, we have a case.', 'Somebody saw a little brown dog running across this plaza this morning, chasing a glowing duck.'], end: W => W.b_ale ? null : { b_ale: 1 } },
    { id:'samuel', name:'Samuel', x:20, y:19, d:0, av:npcAv(b, { skin:'#E3B08C', hair:'#3A281E', style:'curls', glasses:'round', shirt:'#4F8761', pants:'#2A2F3A' }),
      lines: (me, W) => W.b_sam ? ['Talk to the street dogs. Lunita is the fast one, she sees everything.'] : ['¡Quiubo! (Hey!) Alejandra told me everything.', 'I checked the map: cat footprints everywhere, all going east… toward Monserrate.', 'But we need to be sure. The street dogs down the south street will know.'], end: W => W.b_sam ? null : { b_sam: 1 } },
    { id:'lunita', name:'Lunita', x:12, y:30, d:0, wander:2, dogc:'lunita',
      lines: (me, W) => W.b_dogs ? ['*yip!* (Lunita points her nose at the mountain again.)'] : ['*YIP YIP YIP!* 🐕', '(Lunita runs in circles, then points her nose straight at the big mountain.)', '(She saw Dayla! Dayla ran up Monserrate, chasing a glowing duck!)'], end: W => W.b_dogs ? null : { b_dogs: 1 } },
    { id:'papu', name:'Papu', x:14, y:31, d:0, dogc:'papu', lines: () => ['*snort… snort* 🐶', '(Papu the French bulldog snorts very seriously. He is guarding the street.)'] },
    { id:'moka', name:'Moka', x:16, y:31, d:0, dogc:'moka', lines: () => ['*SNORT!* 🐶', '(Moka is chewing something. You decide not to ask what.)'] },
    { id:'diego', name:'Diego', x:13, y:24, d:0, wander:1, av:npcAv(b, { skin:'#D9A07A', hair:'#2A201C', style:'side', facial:'mustache', shirt:'#C9473D', pants:'#3B4F6B' }),
      lines: (me, W) => [`¡${son}! Welcome to Bogotá, my city.`, done(W) ? 'You saw Dayla? ¡Qué bueno! (Great!) She’s close, I know it.' : 'Monserrate is very high. Take it slow, the air is thin up there. 😮‍💨'] },
    { id:'carolina', name:'Carolina', x:20, y:24, d:0, wander:1, av:npcAv(b, { skin:'#E3B08C', hair:'#3A281E', style:'long', shirt:'#F2C14E', pants:'#3B4F6B', lashes:'natural' }),
      lines: () => ['¡Mi amor! ¡Por fin en Bogotá! (My love! Finally in Bogotá!)', 'Cuando encontremos a Dayla, nos vamos de compras al centro. (When we find Dayla, we’re going shopping downtown.) 🛍️'] },
    { id:'juandi', name:'Juandi', x:10, y:21, d:0, wander:1, av:npcAv(b, { skin:'#D9A07A', hair:'#171210', style:'short', shirt:'#F2C14E', pants:'#3B4F6B', bottom:'shorts' }),
      lines: () => ['Welcome to my city! ⚽', 'Fun fact: Bogotá is 2,600 meters up. That’s why I can run forever at sea level. 😎'] },
    { id:'elsa', name:'Mami Elsa', x:17, y:7, d:0, wander:1, av:npcAv(b, { skin:'#C98E68', hair:'#B4B0AC', style:'pony', shirt:'#E07A93', bottom:'skirt', pants:'#6C5B9E' }), gift:1,
      lines: (me, W, c) => c.st.got_elsa2 ? ['¡Coma, coma! (Eat, eat!) 🫓'] : ['¡Ay, mi amor! ¡Bienvenido a mi casa vieja! (Welcome to my old house!)', 'Para subir Monserrate necesita energía. (To climb Monserrate you need energy.)', '(Got 3 Arepas!)'] },
    { id:'diana', name:'Diana', x:21, y:15, d:0, av:npcAv(b, { skin:'#D9A07A', hair:'#171210', style:'bob', shirt:'#7FB6D9', bottom:'longskirt', pants:'#F2E6D8', lashes:'natural' }),
      lines: () => ['¡Hola! Isn’t the cathedral beautiful?', 'I’m praying you find Dayla soon. “The LORD is my shepherd; I shall not want.” (Psalm 23:1)'] },
    { id:'tintin', name:'Titin', x:24, y:28, d:0, av:npcAv(b, { skin:'#E3B08C', hair:'#3A281E', style:'short', glasses:'square', shirt:'#F2C14E', pants:'#2A2F3A' }), taxi:1,
      lines: () => [`¡Quiubo, ${son}! Aquí también tengo taxi. (I have a taxi here too.)`, '¿Para dónde? (Where to?)'] },
    { id:'condor', name:'Cóndorito', x:34, y:14, d:2, bird:1,
      lines: (me, W) => W.b_condor ? ['¡Vamos, parcero! (Let’s go, buddy!) 🦅'] : ['¡Alto ahí! (Stop right there!) Who goes up MY mountain?', '…A little brown dog? Sí, she ran right past me, chasing a glowing duck. Then the cats came.', 'Those cats ruffled my feathers. Nobody ruffles Cóndorito’s feathers!', 'I’ll fly you up the rest of the way, parcero. (buddy) Vamos!', '(Cóndorito joined your team! Tap 🐾 near gaps to fly across.)'],
      end: W => W.b_condor ? null : { b_condor: 1, _joinc: 1 } }
  ];
}

/* ---------- game ---------- */
function start(host, api){
  stop();
  SOUND_ON = () => api.soundOn();
  const LOC = (api.loadWorld() || {}).loc === 'bogota' ? 'bogota' : 'home', HOME = LOC === 'home';
  const HS = HOME ? HOUSES : BOG.houses, SG = HOME ? SIGNS : BOG.signs, AR = HOME ? AREAS : BOG.areas, PT = HOME ? PORTAL : BOG.portal;
  const map = HOME ? buildMap() : buildBogota();
  const bg = cnv(MW * T, MH * T), bx = bg.getContext('2d'), top = cnv(MW * T, MH * T), tx = top.getContext('2d');
  for(let y = 0; y < MH; y++) for(let x = 0; x < MW; x++){ if(HOME) drawTile(bx, null, x, y, map[y][x], map); else bogTiles(bx, x, y, map[y][x], map); }
  HS.forEach(h => { drawHouse(bx, h); drawRoof(tx, h); });
  if(HOME) drawHoops(bx);
  if(!HOME){ const px = 15 * T, py = 20 * T; bx.fillStyle = '#A9A49E'; bx.fillRect(px - 2, py + 6, 36, 26); bx.fillStyle = '#7B7F86'; bx.fillRect(px + 10, py - 14, 12, 26); bx.fillStyle = '#5B6B82'; bx.fillRect(px + 12, py - 22, 8, 10); bx.fillRect(px + 13, py - 26, 6, 5); }
  if(HOME) (() => { const px = 21 * T, py = 14 * T - 8; bx.fillStyle = '#A9A49E'; bx.fillRect(px - 6, py, 44, 26); bx.fillStyle = '#58AEDD'; bx.fillRect(px - 3, py + 3, 38, 20); bx.fillStyle = '#C4BFB8'; bx.fillRect(px + 12, py - 6, 8, 18); bx.fillStyle = '#BFE6F5'; bx.fillRect(px + 14, py - 10, 4, 6); })();
  for(let y = 0; y < MH; y++) for(let x = 0; x < MW; x++) if(map[y][x] === 'T') drawCanopy(tx, x, y);
  SG.forEach(s => { const px = s.x * T, py = s.y * T; bx.fillStyle = '#7B4B2F'; bx.fillRect(px + 7, py + 8, 2, 8); bx.fillStyle = '#C79A63'; bx.fillRect(px + 2, py + 2, 12, 8); bx.fillStyle = '#9A6440'; bx.fillRect(px + 2, py + 9, 12, 1); bx.fillRect(px + 4, py + 5, 8, 1); map[s.y][s.x] = 'r'; });
  if(HOME) for(let y = 13; y < 16; y++) for(let x = 21; x < 23; x++) map[y][x] = 'h';
  ((tx0, ty0) => { const px = tx0 * T + 2, py = ty0 * T + 2; bx.fillStyle = 'rgba(0,0,0,.18)'; bx.fillRect(px, py + 18, 30, 4); bx.fillStyle = '#F2C14E'; bx.fillRect(px, py + 6, 30, 13); bx.fillRect(px + 6, py, 18, 8); bx.fillStyle = '#BFE6F5'; bx.fillRect(px + 8, py + 2, 6, 5); bx.fillRect(px + 16, py + 2, 6, 5); bx.fillStyle = '#2A201C'; bx.fillRect(px + 4, py + 17, 6, 5); bx.fillRect(px + 20, py + 17, 6, 5); bx.fillRect(px + 11, py - 3, 8, 3); bx.fillStyle = '#FFFFFF'; bx.fillRect(px + 12, py - 2, 6, 1); bx.fillStyle = '#C9A24E'; for(let i = 0; i < 30; i += 4) bx.fillRect(px + i, py + 12, 2, 2); map[ty0][tx0] = map[ty0][tx0 + 1] = map[ty0 + 1][tx0] = map[ty0 + 1][tx0 + 1] = 'h'; })(HOME ? 36 : 25, HOME ? 15 : 29);
  // parked cars
  (HOME ? [[20, 32, '#C9473D'], [24, 32, '#3E6E8E'], [22, 35, '#E9E2D6']] : []).forEach(([cx0, cy0, col]) => { const px = cx0 * T + 1, py = cy0 * T; bx.fillStyle = 'rgba(0,0,0,.2)'; bx.fillRect(px + 1, py + 26, 14, 3); bx.fillStyle = col; bx.fillRect(px, py + 2, 14, 24); bx.fillStyle = '#BFE6F5'; bx.fillRect(px + 2, py + 5, 10, 5); bx.fillRect(px + 2, py + 18, 10, 4); bx.fillStyle = shade(col, -.25); bx.fillRect(px, py + 11, 14, 6); map[cy0][cx0] = map[cy0 + 1][cx0] = 'h'; });

  host.innerHTML = `<canvas class="rpg-cv"></canvas>
    <div class="rpg-top"><button class="rpg-x" aria-label="Leave the game">✕</button><div class="rpg-area"></div><div class="grow"></div><div class="rpg-hud"></div><button class="rpg-bagbtn rpg-mus" aria-label="Music on or off">🎵</button><button class="rpg-bagbtn rpg-bag" aria-label="Bag and journal">🎒</button></div>
    <div class="rpg-joy"><i></i></div><button class="rpg-a" aria-label="Talk or look">A</button><button class="rpg-b" aria-label="Partner action">🐾</button>
    <div class="rpg-talk" hidden><b></b><p></p><span>▼</span></div><div class="rpg-banner"></div>
    <div class="rpg-panel" hidden></div>
    <div class="rpg-bt" hidden><canvas class="rpg-btcv" width="200" height="120"></canvas><div class="rpg-bthp"></div><div class="rpg-btmsg"></div><div class="rpg-btbar" hidden><span class="z"></span><i></i></div><div class="rpg-btmenu"></div></div>`;
  const $ = s => host.querySelector(s);
  const cv = $('.rpg-cv'), cx = cv.getContext('2d');
  const me = api.me, other = me === 'david' ? 'laura' : 'david', ME = api.nameOf(me);
  const sheets = { [me]: heroSheet(api.avatar(me)), [other]: heroSheet(api.avatar(other)) };
  const SHEETS = { dayla: dogSheet(), alejandro: dogSheet({ B:'#2A201C', D:'#1A1414', Wt:'#F4F4F4', long:1 }), lunita: dogSheet({ B:'#7B4B2F', D:'#5A3520', Wt:'#C9A47A' }), papu: dogSheet({ B:'#8E8A93', D:'#6E6A72', Wt:'#C4C0C8' }), moka: dogSheet({ B:'#C98E5A', D:'#8A5A36', Wt:'#E9C49A' }) };
  let npcs = HOME ? makeNPCs(api) : makeBogotaNPCs(api);
  const saved = api.load() || {};
  const st = Object.assign({ hp:10, mhp:10, dhp:5, dmhp:5, lv:1, xp:0, coins:0, items:{ snack:1 }, diary:{}, partner:null }, saved);
  st.items = Object.assign({ snack:0 }, st.items); st.diary = st.diary || {}; st.partners = st.partners || (st.partner ? [st.partner] : []);
  let W = Object.assign({}, api.loadWorld() || {});
  G = { stop: () => {}, lightOn: false };
  const p = { x: saved.x || 8 * T + 8, y: saved.y || 11 * T + 4, d: saved.d || 0, f: 0, ft: 0, moving: false };
  const pup = { x: p.x - 14, y: p.y + 6, d: p.d, f: 0, ft: 0, trail: [], vis: true, who: 'dayla' };
  const duck = { x: 0, y: 0, vis: false, glow: 0, d: 0 };
  const portal = { r: 0, open: false };
  const holo = { vis: false, a: 0, tilt: 0 };
  const remote = { on: false, x: 0, y: 0, tx: 0, ty: 0, d: 0, moving: false, seen: 0 };
  const input = { x: 0, y: 0, keys: {} };
  const fx = [], tasks = [];
  let talk = null, lastSave = 0, lastSent = 0, raf = 0, prev = performance.now(), scale = 3, area = '', ch = null, safeT = 0, BT = null, dirty = false, scene = false, shake = 0;
  const daylaHome = () => !saved.intro;
  function partnerSet(){ if(HOME && daylaHome()){ pup.who = 'dayla'; pup.vis = true; } else if(st.partner){ pup.who = st.partner; pup.vis = true; npcs = npcs.filter(n => !st.partners.includes(n.id)); } else pup.vis = false; }

  function resize(){ const r = host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); scale = Math.max(2, Math.round(Math.min(r.width / (12 * T), r.height / (14 * T)) * dpr) / dpr); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; G.dpr = dpr; }
  resize(); window.addEventListener('resize', resize);

  const gateShut = () => W.p_locked && !W.p_gate;
  const solidAt = (px, py) => { const x = Math.floor(px / T), y = Math.floor(py / T); if(x < 0 || y < 0 || x >= MW || y >= MH) return true; const c = map[y][x]; if(c === 'g') return gateShut(); if(c === 'B') return !W.b_dogs; if(c === 'M' || c === 'X') return true; return !!SOLID[c]; };
  const walkable = (tx2, ty2) => (map[ty2] || [])[tx2] !== undefined && !SOLID[map[ty2][tx2]];
  const nearWalk = (tx2, ty2) => { for(let r = 0; r < 6; r++) for(let dy = -r; dy <= r; dy++) for(let dx = -r; dx <= r; dx++) if(walkable(tx2 + dx, ty2 + dy)) return [tx2 + dx, ty2 + dy]; return [tx2, ty2]; };
  const blocked = (x, y) => solidAt(x - 5, y - 3) || solidAt(x + 5, y - 3) || solidAt(x - 5, y + 1) || solidAt(x + 5, y + 1) || npcs.some(n => Math.abs(n.x - x) < 10 && Math.abs(n.y - y) < 7);
  { const tx0 = Math.floor(p.x / T), ty0 = Math.floor(p.y / T); if(!walkable(tx0, ty0)){ const [a, b2] = nearWalk(tx0, ty0); p.x = a * T + 8; p.y = b2 * T + 8; } }
  function placeNPCs(){ npcs.forEach(n => { if(n.placed) return; const [a, b2] = nearWalk(n.x, n.y); n.x = a * T + 8; n.y = b2 * T + 10; n.hx = n.x; n.hy = n.y; n.t = Math.random() * 2; n.f = 0; n.placed = 1;
    if(n.dogc){ n.dog = 1; n.sheet = SHEETS[n.dogc]; } else if(n.bird) n.sheet = null; else n.sheet = n.dog ? SHEETS.alejandro : n.wheel ? wheelSheet(n.av) : heroSheet(n.av); }); }
  placeNPCs(); partnerSet();
  function inPark(){ return p.x > PARK.x * T && p.x < (PARK.x + PARK.w) * T && p.y > PARK.y * T && p.y < (PARK.y + PARK.h) * T; }
  function unstick(){ if(HOME && gateShut() && inPark()){ p.x = GATE.x; p.y = (PARK.y - 2) * T + 8; pup.x = p.x - 12; pup.y = p.y; pup.trail = []; } }

  /* Hairballs roaming the neighbourhood, and the sergeant in the park */
  const mons = [];
  const addMon = (k, id, tx2, ty2) => { const [a, b2] = nearWalk(tx2, ty2); mons.push({ k, id, x: a * T + 8, y: b2 * T + 8, hx: a * T + 8, hy: b2 * T + 8, t: Math.random() * 3, mx: 0, my: 0 }); };
  if(HOME){ addMon('hairball', 'c1', 30, 25); addMon('hairball', 'c2', 16, 23); addMon('hairball', 'c3', 38, 10); addMon('sarge', 'sarge', 10, 31); }
  else { addMon('hairball', 'b1', 30, 18); addMon('hairball', 'b2', 33, 14); addMon('hairball', 'b3', 34, 8); addMon('capi', 'capi', 34, 4); }
  const monShown = m => m.gone ? false : m.k === 'sarge' ? (W.p_gate && !W.p_done) : m.k === 'capi' ? (W.b_gap && !W.b_done) : HOME ? (W.p_start && !W['p_' + m.id]) : !W['b_' + m.id];

  /* --- input --- */
  const joy = $('.rpg-joy'), knob = joy.querySelector('i'); let jid = null, jx = 0, jy = 0;
  const unlock = () => { audio(); MUS.resume(); };
  const joyMove = e => { const r = joy.getBoundingClientRect(); jx = r.left + r.width / 2; jy = r.top + r.height / 2; let dx = e.clientX - jx, dy = e.clientY - jy; const L = Math.hypot(dx, dy), M = 40; if(L > M){ dx *= M / L; dy *= M / L; } knob.style.transform = `translate(${dx}px,${dy}px)`; input.x = Math.abs(dx) > 6 ? dx / M : 0; input.y = Math.abs(dy) > 6 ? dy / M : 0; };
  host.addEventListener('pointerdown', e => { unlock(); if(BT){ BT.tap(); return; } if(e.target.closest('button') || e.target.closest('.rpg-panel') || talk) return; if(e.clientX > host.clientWidth * .55) return; jid = e.pointerId; joy.classList.add('on'); joyMove(e); try{ host.setPointerCapture(jid); }catch(er){} });
  host.addEventListener('pointermove', e => { if(e.pointerId !== jid) return; joyMove(e); });
  const jend = e => { if(e.pointerId !== jid) return; jid = null; input.x = input.y = 0; knob.style.transform = ''; joy.classList.remove('on'); };
  host.addEventListener('pointerup', jend); host.addEventListener('pointercancel', jend);
  const onKey = e => { const k = e.key.toLowerCase(); if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','e','enter','q'].includes(k)) e.preventDefault(); if(e.type === 'keydown') unlock(); if(e.type === 'keydown' && (k === ' ' || k === 'e' || k === 'enter')){ if(BT) BT.tap(); else act(); return; } if(e.type === 'keydown' && k === 'q'){ partnerAct(); return; } input.keys[k] = e.type === 'keydown'; };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
  $('.rpg-a').addEventListener('click', () => { if(!BT) act(); });
  $('.rpg-b').addEventListener('click', () => { if(!BT && !talk && !scene) partnerAct(); });
  $('.rpg-talk').addEventListener('click', act);
  $('.rpg-x').addEventListener('click', () => api.close());
  $('.rpg-bag').addEventListener('click', () => { const pn = $('.rpg-panel'); if(pn.hidden) openPanel(); else pn.hidden = true; });
  const musBtn = $('.rpg-mus'); const musLook = () => { musBtn.style.opacity = MUS.on ? 1 : .45; }; musLook();
  musBtn.addEventListener('click', () => { unlock(); MUS.toggle(); musLook(); banner(MUS.on ? '🎵 Music on' : '🔇 Music off'); });

  /* --- saving --- */
  const pack = () => ({ x: Math.round(p.x), y: Math.round(p.y), d: p.d, seen: 1, intro: saved.intro || 0, hp: st.hp, mhp: st.mhp, dhp: st.dhp, dmhp: st.dmhp, lv: st.lv, xp: st.xp, coins: st.coins, items: st.items, diary: st.diary, partner: st.partner || null, partners: st.partners, got_elsa: st.got_elsa || 0, got_elsa2: st.got_elsa2 || 0 });
  const saveNow = () => { lastSave = performance.now(); api.save(pack()); };
  function setWorld(patch){ if(!patch) return; W = Object.assign({}, W, patch); api.saveWorld(W); }
  function hud(){ $('.rpg-hud').innerHTML = `❤️ ${st.hp}/${st.mhp} · 🪙 ${st.coins}`; $('.rpg-b').style.opacity = pup.vis ? 1 : .45; }
  hud();

  /* --- talking --- */
  const box = $('.rpg-talk'), boxName = box.querySelector('b'), boxText = box.querySelector('p');
  function say(name, lines, onEnd, choices){ talk = { name, lines, i: 0, shown: 0, onEnd, choices }; box.querySelector('.rpg-ch') && box.querySelector('.rpg-ch').remove(); box.hidden = false; boxName.textContent = name; boxText.textContent = ''; api.sfx('open'); }
  const sayP = (name, lines) => new Promise(r => say(name, lines, r));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function showChoices(){
    if(!talk || !talk.choices || talk.i !== talk.lines.length - 1 || talk.shown < talk.lines[talk.i].length || box.querySelector('.rpg-ch')) return;
    const wrap = document.createElement('div'); wrap.className = 'rpg-ch';
    talk.choices.forEach(([label, fn]) => { const b2 = document.createElement('button'); b2.textContent = label; b2.onclick = e => { e.stopPropagation(); wrap.remove(); talk = null; box.hidden = true; fn && fn(); }; wrap.appendChild(b2); });
    box.appendChild(wrap);
  }
  function act(){
    if(talk){ const L = talk.lines[talk.i]; if(talk.shown < L.length){ talk.shown = L.length; boxText.textContent = L; showChoices(); return; } if(talk.choices && talk.i === talk.lines.length - 1) return; talk.i++; talk.shown = 0; if(talk.i >= talk.lines.length){ const fn = talk.onEnd; talk = null; box.hidden = true; if(fn) fn(); return; } api.sfx('tap'); return; }
    if(scene) return;
    if(!$('.rpg-panel').hidden){ $('.rpg-panel').hidden = true; return; }
    const fx2 = p.x + [0, -14, 14, 0][p.d], fy2 = p.y + [14, 0, 0, -14][p.d];
    const n = npcs.find(n => Math.hypot(n.x - fx2, n.y - fy2) < 16);
    if(n){ n.d = [3, 2, 1, 0][p.d]; n.t = 3;
      if(n.taxi){ say(n.name, n.lines(ME, W, { st }), null, (HOME ? TAXI : TAXI_B).map(([l, a, b2, nm]) => [l, () => taxiTo(a, b2, nm)]).concat([['✈️ Airport', () => say('Titin', ['¿El aeropuerto? ¡Todavía no! Pronto. (The airport? Not yet! Soon.) ✈️'])], ['No, gracias', null]])); return; }
      say(n.name, n.lines(ME, W, { st }), () => {
        if(n.gift && HOME && W.p_start && !W.p_done && !st.got_elsa){ st.got_elsa = 1; st.items.snack += 3; saveNow(); api.sfx('success'); }
        if(n.gift && !HOME && !st.got_elsa2){ st.got_elsa2 = 1; st.items.snack += 3; saveNow(); api.sfx('success'); }
        if(n.dogc){ st.diary[n.dogc] = 1; }
        const patch = n.end && n.end(W);
        if(patch && patch._joinc){ delete patch._joinc; setWorld(patch); st.partners = Array.from(new Set(st.partners.concat('condor'))); st.partner = 'condor'; st.diary.condor = 1; st.dhp = st.dmhp; pup.x = n.x; pup.y = n.y; pup.trail = []; partnerSet(); hud(); saveNow(); banner('🦅 Cóndorito joined your team!'); return; }
        if(patch && patch._join){ st.partners = Array.from(new Set(st.partners.concat('alejandro'))); st.partner = 'alejandro'; st.dhp = st.dmhp = 5; st.diary.alejandro = 1; pup.x = n.x; pup.y = n.y; pup.trail = []; partnerSet(); hud(); saveNow(); sfx('yap'); banner('🐕 Alejandro joined your team!'); return; }
        if(patch){ setWorld(patch); banner('📜 ' + (HOME ? objective(W, st) : objectiveB(W))); }
      }); return; }
    if(HOME && Math.hypot(GATE.x - fx2, GATE.y - fy2) < 20 && W.p_start){ gateTalk(); return; }
    if(!HOME && Math.hypot(PT.x - fx2, PT.y - fy2) < 26){ say('Portal', ['(The portal swirls. Through it you can see your neighbourhood back home.)'], null, [['🏠 Go home', () => travel('home')], ['Stay', null]]); return; }
    if(portal.open && Math.hypot(PT.x - fx2, PT.y - fy2) < 26 && W.p_done){ say('Portal', ['(The portal swirls with color. Through it you can see a city high up in green mountains… Bogotá!)'], null, [['🌀 Step through to Bogotá', () => travel('bogota')], ['Not yet', null]]); return; }
    if(portal.open && Math.hypot(PT.x - fx2, PT.y - fy2) < 26){ say('Portal', ['(The portal swirls with color. Through it you can see a city high up in green mountains… Bogotá!)', '(Chapter 1: Bogotá is coming in the next update. Hold on, Dayla!) 🐾']); return; }
    const s = SG.find(s => Math.hypot(s.x * T + 8 - fx2, s.y * T + 8 - fy2) < 16); if(s){ say('Sign', [s.text]); return; }
    const h = HS.find(h => Math.hypot((h.x + h.door) * T + 8 - fx2, (h.y + h.h) * T - fy2) < 16);
    if(h){ if(h.id === 'home') say('Rhead House', W.p_start && !W.p_done ? ['Home feels so quiet without Dayla…', 'You rest for a moment and catch your breath.', '(Hearts refilled! ❤️)'] : ['Home sweet home. 🏠', 'You rest for a bit.', '(Hearts refilled! ❤️)'], () => { st.hp = st.mhp; st.dhp = st.dmhp; hud(); saveNow(); }); else say(h.name, [h.sign]); return; }
    if(remote.on && Math.hypot(remote.x - fx2, remote.y - fy2) < 18){ say(api.nameOf(other), ['💕 *waves at you*']); return; }
    if(pup.vis && Math.hypot(pup.x - fx2, pup.y - fy2) < 18){ if(pup.who === 'dayla') say('Dayla', ['*happy wiggle* 🐾']); else { sfx('yap'); say('Alejandro', [['*yip!* (Alejandro is ready for action.)', '*sniff sniff* (He keeps looking toward the dog park.)', '*wags his whole long body*'][Math.floor(Math.random() * 3)]]); } }
  }
  function gateMissing(){ const m = []; if(!W.p_ernesto || !W.p_joshua || !W.p_joseph) m.push('get the family’s help'); if(cats(W) < 3) m.push(`defeat the Hairballs outside (${cats(W)}/3)`); return m; }
  function gateTalk(){
    if(!W.p_locked) return say('Dog Park Gate', ['The gate is open.']);
    if(W.p_gate) return say('Dog Park Gate', ['The gate is open. Good boy, Alejandro. 🐕']);
    say('Dog Park Gate', ['🔒 The Hairballs locked the gate from the inside!', 'The gap under the fence is way too small for you… but not for a little dog.', st.partner === 'alejandro' ? '(Tap 🐾 to send Alejandro under the fence!)' : '(Find a small friend who can squeeze under. Alejandro is usually near the plaza.)']);
  }
  function partnerAct(){
    if(!pup.vis){ banner('🐾 Dayla isn’t here…'); return; }
    if(pup.who === 'dayla'){ banner('🐾 *happy wiggle*'); return; }
    if(pup.who === 'condor'){
      const gy = 10 * T + 8, gx = 37 * T + 8;
      if(!HOME && Math.abs(p.x - gx) < 30 && (Math.abs(p.y - (12 * T + 8)) < 26 || Math.abs(p.y - (9 * T + 8)) < 26)){ const up = p.y > gy; scene = true; api.sfx('open'); banner('🦅 ¡Agárrese! (Hold on!)'); walkTo(p, [[gx, up ? 9 * T + 8 : 12 * T + 8]], 70).then(() => { scene = false; pup.x = p.x; pup.y = p.y; pup.trail = []; if(!W.b_gap){ setWorld({ b_gap: 1 }); MUS.play('boss'); banner('📜 Reach the top of Monserrate!'); } }); return; }
      banner('🦅 *flaps proudly*'); return; }
    sfx('yap');
    if(HOME && W.p_locked && !W.p_gate && Math.hypot(GATE.x - p.x, GATE.y - p.y) < 34){
      const miss = gateMissing();
      if(miss.length) return say('Alejandro', ['*sniff… whimper* 🐕', `(Alejandro peeks under the fence. There are a LOT of Hairballs in there. First ${miss.join(' and ')}.)`]);
      scene = true; tasks.push({ ent: pup, pts: [[GATE.x, GATE.y + 12], [GATE.x + 4, GATE.y - 14]], sp: 60, res: async () => { sfx('clang'); setWorld({ p_gate: 1 }); await sleep(300); tasks.push({ ent: pup, pts: [[GATE.x, GATE.y + 12]], sp: 60, res: () => {} }); scene = false; say('Alejandro', ['*wriggle wriggle… CLICK!* 🐕', '(Alejandro squeezed under the fence and pushed the latch open! What a good boy.)', '(Something big is waiting inside. Get ready…)']); MUS.play('boss'); } });
      return;
    }
    banner('🐕 *YAP YAP!*');
  }
  function taxiTo(tx2, ty2, name){ const [a, b2] = nearWalk(tx2, ty2); p.x = a * T + 8; p.y = b2 * T + 8; pup.x = p.x - 12; pup.y = p.y + 6; pup.trail = []; api.sfx('open'); banner('🚕 ' + name); saveNow(); }
  const TAXI_B = [['⛪ The plaza', 15, 24, 'The plaza'], ['⛰️ Foot of Monserrate', 28, 23, 'Monserrate'], ['🌀 The portal', 6, 33, 'The portal']];
  function travel(loc){ const sp = loc === 'bogota' ? BOG.spawn : [10, 30]; p.x = sp[0] * T + 8; p.y = sp[1] * T + 8; setWorld({ loc }); saveNow(); MUS.stop(); banner('🌀 Whoosh!'); setTimeout(() => start(host, api), 250); }
  const TAXI = [['🏠 Home', 8, 11, 'Rhead House'], ['🐾 Dog park', 13, 25, 'The dog park'], ['🏊 Pool', 27, 30, 'The pool'], ['🏀 The court', 31, 23, 'Rhead Court'], ['⛪ Chapel', 6, 25, 'The little chapel']];

  /* --- scripted scenes --- */
  const walkTo = (ent, pts, sp) => new Promise(r => tasks.push({ ent, pts: pts.slice(), sp, res: r }));
  async function introScene(){
    scene = true; MUS.play('home');
    p.x = 8 * T + 8; p.y = 11 * T + 6; p.d = 0; pup.x = p.x - 14; pup.y = p.y + 4; pup.d = 2; pup.trail = []; pup.who = 'dayla'; pup.vis = true;
    duck.x = pup.x - 10; duck.y = pup.y + 2; duck.vis = true; duck.glow = 0;
    await sleep(700);
    await sayP('Dayla', ['*squeak squeak squeak* 🦆', '(A normal Saturday morning. Dayla is chewing on her favourite toy: her big duck plushie.)']);
    for(let i = 0; i < 30; i++){ duck.glow = i / 30; await sleep(30); }
    sfx('quack'); await sayP('Big Duck', ['QUACK.']);
    await sayP(ME, ['…Did the duck just quack by itself?']);
    sfx('quack');
    const route = [[8 * T + 8, 13 * T + 8], [PARK.gx * T + 8, 13 * T + 8], [PARK.gx * T + 8, (PARK.y + 1) * T + 8], [PT.x, PT.y]];
    const dk = walkTo(duck, route, 84); await sleep(500);
    const dg = walkTo(pup, route.map(([a, b2]) => [a, b2]), 80); banner('🐾 Dayla! Come back!');
    const pl = walkTo(p, [[8 * T + 8, 13 * T + 8], [PARK.gx * T + 8, 13 * T + 8], [PARK.gx * T + 8, (PARK.y + 1) * T + 8], [11 * T + 8, 30 * T + 8]], 62);
    await dk; MUS.stop(); sfx('portal'); portal.open = true; for(let i = 0; i <= 20; i++){ portal.r = i * .8; await sleep(30); }
    duck.vis = false; sfx('quack'); await dg; await sleep(150); pup.vis = false; sfx('yap');
    await pl; p.d = 0; await sleep(300);
    for(let i = 20; i >= 0; i--){ portal.r = i * .8; await sleep(40); } portal.open = false; portal.r = 0;
    MUS.play('sad');
    await sayP(ME, ['DAYLA!!', '…', '(The glowing hole is gone. All that is left is a faint purple shimmer… and a few little paw prints.)']);
    sfx('hiss'); await sayP('???', ['…ssssss…', '(Something gray darts behind the bushes. A cat? Was it… wearing a tiny helmet?)']);
    await sayP(ME, ['I have to find her. The family will know what to do.', '(Ask Vecino Ernesto, Joshua and Joseph for help.)']);
    saved.intro = 1; st.diary.duck = 1; setWorld({ p_start: 1 }); unstick(); saveNow(); partnerSet(); hud(); scene = false; MUS.play('home');
  }
  async function bossEnd(){
    scene = true; MUS.stop(); holo.vis = true;
    for(let i = 0; i <= 20; i++){ holo.a = i / 20; await sleep(30); } shake = .6; sfx('crash'); MUS.play('boss');
    await sayP('Boss Whiskers', ['So. YOU are the humans who belong to the little brown dog.', 'I am BOSS WHISKERS. Ruler of the Hairballs. Future ruler of every planet that has ever been annoyed by BARKING.', 'Your precious Dayla is already far, far away. You will NEVER catch her. NEVER! MWAHAHAHA—']);
    for(let i = 0; i < 12; i++){ holo.tilt = i / 12 * .5; await sleep(25); } shake = .4; sfx('crash');
    await sayP('Boss Whiskers', ['*trips on his own cape* ACK!', '…', 'Nobody saw that.']);
    await sayP('Boss Whiskers', ['(As he flails around, his paw smacks a big red button on his remote.)', 'NO! NOT THAT BUTTON!']);
    MUS.stop(); sfx('portal'); portal.open = true; for(let i = 0; i <= 26; i++){ portal.r = i * .8; holo.a = 1 - i / 26; await sleep(35); } holo.vis = false; holo.tilt = 0;
    await sayP(ME, ['The portal is open! That’s our way through.', 'Hold on, Dayla. We’re coming! 🐾']);
    setWorld({ p_done: 1 }); saveNow(); scene = false; MUS.play('victory'); celebrate('📜 Prologue complete!');
    setTimeout(() => say('Portal', ['(Through the swirling portal you can see a city high up in green mountains… Bogotá!)', '(Chapter 1: Bogotá is coming in the next update. Your progress is saved.)']), 1800);
  }

  async function bogotaEnd(){
    scene = true; MUS.stop();
    const dy = { x: 36 * T + 8, y: 2 * T + 12 }; const show = { on: true }; bogDayla = dy;
    await sayP(ME, ['Wait… up there by the chapel!']);
    sfx('yap'); await sayP('Dayla', ['WOOF! WOOF! 🐾', '(It’s DAYLA! Her tail is going a hundred miles an hour.)']);
    await sayP(ME, ['DAYLA! It’s me! Come here, girl!']);
    sfx('portal'); portal2 = { x: dy.x + 14, y: dy.y, r: 0 }; for(let i = 0; i <= 16; i++){ portal2.r = i * .8; await sleep(30); }
    sfx('quack'); await sayP('Big Duck', ['QUACK!']);
    await sayP('Dayla', ['*whimper* (Dayla looks at you… then at the glowing duck. She HAS to follow it.)']);
    bogDayla = null; sfx('yap'); await sleep(400); for(let i = 16; i >= 0; i--){ portal2.r = i * .8; await sleep(35); } portal2 = null;
    await sayP(ME, ['NO! So close…']);
    MUS.play('bogota');
    await sayP('Cóndorito', ['¡Tranquilo, parcero! (Easy, buddy!) I have sharp eyes.', 'Through that portal I saw tall, tall buildings and yellow taxis. That was NEW YORK!', 'She’s getting closer every time. We’ll get her.']);
    setWorld({ b_done: 1 }); saveNow(); scene = false; MUS.play('victory'); celebrate('📜 Chapter 1 complete!');
    setTimeout(() => say('Where’s Dayla?', ['(Chapter 1: Bogotá complete! 🎉)', '(Chapter 2: New York is still being built. Your progress is saved. Come back soon!)']), 1800);
  }
  let bogDayla = null, portal2 = null;
  /* --- live play together --- */
  ch = api.channel && api.channel('rhead-rpg');
  if(ch){ ch.on('broadcast', { event: 'pos' }, ({ payload: q }) => { if(!q || q.who !== other) return; if(!remote.on){ remote.x = q.x; remote.y = q.y; banner(`${api.nameOf(other)} is here! 💕`); } remote.on = true; remote.tx = q.x; remote.ty = q.y; remote.d = q.d; remote.moving = q.m; remote.seen = performance.now(); })
    .on('broadcast', { event: 'bye' }, ({ payload: q }) => { if(q && q.who === other){ remote.on = false; banner(`${api.nameOf(other)} left the game`); } }).subscribe(); }
  const send = (ev, pl) => { try{ ch && ch.send({ type: 'broadcast', event: ev, payload: pl }); }catch(e){} };
  function banner(text){ const b = $('.rpg-banner'); b.textContent = text; b.style.animationDuration = Math.min(7, Math.max(2.6, text.length / 14)) + 's'; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
  function celebrate(text){ banner(text); api.sfx('success'); for(let i = 0; i < 40; i++) fx.push({ x: p.x, y: p.y - 10, vx: (Math.random() - .5) * 160, vy: -60 - Math.random() * 100, t: 1.4, c: ['#F2C14E','#E0566B','#58AEDD','#7FD07A','#FFFFFF'][i % 5] }); }
  if(W.p_done || !HOME){ portal.open = true; portal.r = 21; }

  /* --- bag: journal, items, Dayla's Diary --- */
  function openPanel(){
    const pn = $('.rpg-panel'), need = st.lv * 8, pn2 = st.partner === 'alejandro' ? 'Alejandro' : st.partner === 'condor' ? 'Cóndorito' : null;
    pn.innerHTML = `<div class="rpg-pn-h"><b>🎒 ${ME}’s bag</b><button data-x>✕</button></div>
      <div class="rpg-pn-s"><div class="eyebrow">What to do next</div><p>${(HOME ? objective(W, st) : objectiveB(W))}</p></div>
      <div class="rpg-pn-s"><div class="eyebrow">You</div><p>Level ${st.lv} · ⭐ ${st.xp}/${need} XP<br>❤️ ${st.hp}/${st.mhp}${pn2 ? ` · ${pn2} 🐾 ${st.dhp}/${st.dmhp}` : ''} · 🪙 ${st.coins}</p></div>
      ${st.partners.length > 1 ? `<div class="rpg-pn-s"><div class="eyebrow">Partner</div><div class="rpg-ch">${st.partners.map(k => `<button data-pt="${k}" style="${st.partner === k ? '' : 'background:#EFE7DC;box-shadow:0 3px 0 #CFC3B3'}">${k === 'condor' ? '🦅 Cóndorito' : '🐕 Alejandro'}</button>`).join('')}</div></div>` : ''}
      <div class="rpg-pn-s"><div class="eyebrow">Items</div><div class="rpg-item"><span>🫓 Arepa ×${st.items.snack}</span><button data-eat ${st.items.snack && st.hp < st.mhp ? '' : 'disabled'}>Eat (+5 ❤️)</button></div></div>
      <div class="rpg-pn-s"><div class="eyebrow">📔 Dayla’s Diary · ${DIARY.filter(k => st.diary[k]).length}/${DIARY.length} pages</div><p class="fine" style="margin:2px 0 6px">Everything Dayla thinks about everyone. She is very honest.</p><div class="rpg-dex">${DIARY.map(k => { const s = st.diary[k], m = MONS[k]; return `<div class="${s ? '' : 'unk'}"><canvas data-mon="${k}" width="28" height="28"></canvas><b>${s ? m.name : '???'}</b>${s ? `<small>“${m.diary}”</small>` : '<span>Not met yet</span>'}</div>`; }).join('')}</div></div>`;
    pn.hidden = false;
    pn.querySelectorAll('canvas[data-mon]').forEach(c => { const x = c.getContext('2d'), k = c.dataset.mon; x.imageSmoothingEnabled = false; if(!st.diary[k]){ x.fillStyle = '#C9BFB3'; x.fillRect(9, 8, 10, 12); return; } if(SHEETS[k]) x.drawImage(SHEETS[k], 0, 2 * 14, 16, 14, 6, 8, 16, 14); else if(k === 'sarge' || k === 'capi') drawMon(x, k, 4, 4, 0, 1); else drawMon(x, k, 6, 7, 0, 1); });
    pn.querySelector('[data-x]').onclick = () => { pn.hidden = true; };
    pn.querySelectorAll('[data-pt]').forEach(b2 => b2.onclick = () => { st.partner = b2.dataset.pt; pup.x = p.x - 12; pup.y = p.y + 4; pup.trail = []; partnerSet(); saveNow(); openPanel(); banner(st.partner === 'condor' ? '🦅 Cóndorito is with you' : '🐕 Alejandro is with you'); });
    const e = pn.querySelector('[data-eat]'); if(e) e.onclick = () => { if(!st.items.snack) return; st.items.snack--; st.hp = Math.min(st.mhp, st.hp + 5); st.dhp = Math.min(st.dmhp, st.dhp + 3); api.sfx('pop'); hud(); saveNow(); openPanel(); };
  }

  /* --- battles: turn-based with timing taps --- */
  function battle(mon){
    const def = MONS[mon.k], foes = [{ k: mon.k, hp: def.hp, mhp: def.hp, atk: def.atk, ox: 0, dead: 0, flash: 0 }];
    if(mon.k === 'sarge') foes.push({ k: 'hairball', hp: 3, mhp: 3, atk: 1, ox: 0, dead: 0, flash: 0 });
    foes.forEach(f => { st.diary[f.k] = 1; });
    const pal = st.partner === 'alejandro' ? { name: 'Alejandro', sheet: SHEETS.alejandro, move: 'yap-attack', emo: '🐕' } : st.partner === 'condor' ? { name: 'Cóndorito', bird: 1, move: 'dive-bomb', emo: '🦅' } : null;
    const el = $('.rpg-bt'), bc = el.querySelector('canvas'), bcx = bc.getContext('2d'), menu = el.querySelector('.rpg-btmenu'), msg = el.querySelector('.rpg-btmsg'), bar = el.querySelector('.rpg-btbar'), hpEl = el.querySelector('.rpg-bthp');
    const fxPos = (f, i) => f.k !== 'hairball' ? 104 : 124 + i * 34;
    const hero = { ox: 0, oy: 0, flash: 0 }, pupB = { ox: 0, oy: 0, flash: 0 }, pops = [];
    let tapAt = 0, waiting = null, ring = null, needle = null, over = false, sp = 1, cheer = 0, taps = 0, mash = null;
    const CROWD = ['#3E6E8E','#E07A93','#F2C14E','#4F8761','#7A5BC4','#C9473D','#58AEDD','#E2AE55','#6C5B9E','#D27A8B','#2A3350','#7FD07A'];
    const addSP = n => { sp = Math.min(5, sp + n); cheer = 1.2; if(n > 0) sfx('nice'); showHP(); };
    BT = { tap(){ tapAt = performance.now(); if(mash) taps++; if(waiting){ const w = waiting; waiting = null; w(tapAt); } }, draw };
    el.hidden = false; $('.rpg-panel').hidden = true; sfx('hiss'); MUS.play(def.boss ? 'boss' : 'battle');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const tween = (o, k, to, ms) => new Promise(r => { const from = o[k], s = performance.now(); const step = () => { const q = Math.min(1, (performance.now() - s) / ms); o[k] = from + (to - from) * (1 - Math.pow(1 - q, 3)); if(q < 1) requestAnimationFrame(step); else r(); }; step(); });
    const say2 = t => { msg.textContent = t; };
    const showHP = () => { hpEl.innerHTML = `<span>${ME} ❤️ ${st.hp}/${st.mhp}</span>${pal ? `<span>${pal.name} 🐾 ${st.dhp}/${st.dmhp}</span>` : ''}<span>${foes.filter(f => !f.dead).map(f => `${MONS[f.k].emo} ${f.hp}`).join(' · ')}</span><span>✨ ${'★'.repeat(sp)}${'☆'.repeat(5 - sp)}</span>`; };
    const pop = (x, y, t, c) => pops.push({ x, y, t, c: c || '#FFFFFF', life: 1 });
    function draw(now){
      const t = now / 1000; bcx.imageSmoothingEnabled = false;
      const g = bcx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#9CC9E8'); g.addColorStop(.5, '#D8EEF8'); g.addColorStop(.51, '#7FC46E'); g.addColorStop(1, '#5DAF5F');
      bcx.fillStyle = g; bcx.fillRect(0, 0, 200, 120);
      if(HOME){ bcx.fillStyle = '#C79A63'; for(let i = 0; i < 200; i += 12){ bcx.fillRect(i, 50, 3, 14); } bcx.fillRect(0, 54, 200, 2); bcx.fillRect(0, 60, 200, 2); } else { bcx.fillStyle = '#4E8A55'; bcx.beginPath(); bcx.moveTo(0, 62); bcx.lineTo(40, 22); bcx.lineTo(80, 50); bcx.lineTo(130, 12); bcx.lineTo(200, 58); bcx.lineTo(200, 62); bcx.fill(); bcx.fillStyle = '#FBF6EE'; bcx.fillRect(126, 10, 8, 5); bcx.fillStyle = '#A9A49E'; bcx.fillRect(0, 60, 200, 4); }
      bcx.fillStyle = 'rgba(255,255,255,.8)'; for(let i = 0; i < 3; i++){ const cxp = (i * 80 + t * 6) % 240 - 20; bcx.fillRect(cxp, 14 + i * 7, 22, 5); bcx.fillRect(cxp + 4, 11 + i * 7, 12, 4); }
      bcx.fillStyle = '#C9473D'; bcx.fillRect(0, 108, 200, 12); bcx.fillStyle = '#A93A4C'; for(let i = 0; i < 200; i += 10) bcx.fillRect(i, 108, 5, 12);
      cheer = Math.max(0, cheer - .016); for(let i = 0; i < 14; i++){ const jx = 4 + i * 14, jy = 112 - (cheer > 0 ? Math.abs(Math.sin(t * 14 + i)) * 4 : Math.abs(Math.sin(t * 2 + i)) * 1); bcx.fillStyle = CROWD[i % CROWD.length]; bcx.fillRect(jx, jy + 3, 9, 6); bcx.fillStyle = ['#F6D5BC','#C98E68','#7C4F34','#E3B08C'][i % 4]; bcx.fillRect(jx + 2, jy - 2, 5, 5); if(cheer > .3 && i % 3 === 0){ bcx.fillRect(jx - 1, jy - 4, 2, 3); bcx.fillRect(jx + 8, jy - 4, 2, 3); } }
      if(mash){ const q = Math.min(1, (now - mash.s) / mash.ms); bcx.fillStyle = 'rgba(0,0,0,.45)'; bcx.fillRect(40, 30, 120, 22); bcx.fillStyle = '#F2C14E'; bcx.fillRect(42, 44, 116 * Math.min(1, taps / 20), 6); bcx.fillStyle = '#fff'; bcx.font = 'bold 9px sans-serif'; bcx.textAlign = 'center'; bcx.fillText(`TAP TAP TAP! ${taps}`, 100, 41); if(q >= 1){ const r = mash.res; mash = null; r(taps); } }
      const hs = sheets[me]; bcx.globalAlpha = hero.flash > 0 && Math.floor(now / 60) % 2 ? .3 : 1; bcx.drawImage(hs, 0, 2 * 22, 16, 22, 44 + hero.ox, 64 + hero.oy, 32, 44); bcx.globalAlpha = 1;
      if(pal){ bcx.globalAlpha = st.dhp <= 0 ? .4 : pupB.flash > 0 && Math.floor(now / 60) % 2 ? .3 : 1; if(pal.bird) drawMon(bcx, 'condor', 14 + pupB.ox, 72 + pupB.oy + Math.sin(t * 5) * 2, t, 2); else bcx.drawImage(pal.sheet, (Math.floor(t * 4) % 2) * 16, 2 * 14, 16, 14, 16 + pupB.ox, 82 + pupB.oy, 32, 28); bcx.globalAlpha = 1; }
      foes.forEach((f, i) => { if(f.dead >= 1) return; bcx.globalAlpha = f.dead ? 1 - f.dead : f.flash > 0 && Math.floor(now / 60) % 2 ? .3 : 1; drawMon(bcx, f.k, fxPos(f, i) + f.ox, f.k !== 'hairball' ? 64 : 80 - (i % 2) * 6, t + i, 2); bcx.globalAlpha = 1; });
      hero.flash -= .016; pupB.flash -= .016; foes.forEach(f => f.flash -= .016);
      if(ring){ const q = Math.max(0, (ring.at - now) / ring.ms); bcx.strokeStyle = q < .25 ? '#7FD07A' : '#FFFFFF'; bcx.lineWidth = 2; bcx.beginPath(); bcx.arc(ring.x, ring.y, 6 + q * 26, 0, 7); bcx.stroke(); bcx.fillStyle = '#E0566B'; bcx.font = 'bold 12px sans-serif'; bcx.textAlign = 'center'; bcx.fillText('!', ring.x, ring.y + 4); }
      pops.forEach(o => { o.life -= .02; o.y -= .4; }); for(let i = pops.length - 1; i >= 0; i--) if(pops[i].life <= 0) pops.splice(i, 1);
      bcx.textAlign = 'center'; pops.forEach(o => { bcx.font = 'bold 11px sans-serif'; bcx.fillStyle = '#2A201C'; bcx.fillText(o.t, o.x + 1, o.y + 1); bcx.fillStyle = o.c; bcx.fillText(o.t, o.x, o.y); });
      if(needle){ const q = Math.min(1, (now - needle.s) / needle.ms); bar.querySelector('i').style.left = (q * 100) + '%'; if(q >= 1 && waiting){ const w = waiting; waiting = null; w(0); } }
    }
    async function aim(){ bar.hidden = false; needle = { s: performance.now(), ms: 1000 }; say2('Tap when the marker hits the green!'); const at = await new Promise(r => { waiting = r; }); const q = at ? (at - needle.s) / needle.ms : 1; needle = null; bar.hidden = true; return Math.abs(q - .78) < .1; }
    function menuOn(){ const alive = foes.filter(f => !f.dead); menu.innerHTML = `<button data-m="bonk">👊 Bonk</button>${pal ? `<button data-m="pounce" ${st.dhp > 0 ? '' : 'disabled'}>${pal.emo} ${pal.name} ${pal.move}</button>` : ''}<button data-m="snack" ${st.items.snack ? '' : 'disabled'}>🫓 Arepa ×${st.items.snack}</button><button data-m="special" ${sp >= 3 ? '' : 'disabled'} style="grid-column:1/-1">✨ ${specialName()} (3 ★)</button><button data-m="run" ${def.boss ? 'disabled' : ''}>🏃 Run</button>`; menu.hidden = false; say2(`What will you do? (${alive.length} left)`);
      menu.querySelectorAll('button').forEach(b => b.onclick = ev => { ev.stopPropagation(); menu.hidden = true; turn(b.dataset.m); }); }
    async function hitFoe(dmg, nice, who){ const f = foes.find(f => !f.dead); if(!f) return; const fxp = fxPos(f, foes.indexOf(f)) + (f.k !== 'hairball' ? 20 : 14);
      const actor = who === 'pup' ? pupB : hero; if(who === 'pup') sfx(pal && pal.bird ? 'portal' : 'yap'); await tween(actor, 'ox', who === 'pup' ? 90 : 70, 220); f.hp = Math.max(0, f.hp - dmg); f.flash = .4; sfx(nice ? 'nice' : 'hit'); pop(fxp, 64, nice ? `NICE! -${dmg}` : `-${dmg}`, nice ? '#F2C14E' : '#FFFFFF'); showHP(); await tween(actor, 'ox', 0, 260);
      if(f.hp <= 0){ sfx('hiss'); await tween(f, 'dead', 1, 400); } }
    function specialName(){ return pal && !pal.bird && st.dhp > 0 ? 'Zoomies (hits all)' : pal && pal.bird && st.dhp > 0 ? 'Sky Dive (one big hit)' : 'Arepa Rain (heal + hit all)'; }
    async function special(){
      sp -= 3; showHP(); say2('✨ SPECIAL! Tap as fast as you can!'); cheer = 2; sfx('portal');
      taps = 0; const n = await new Promise(r => { mash = { s: performance.now(), ms: 2200, res: r }; });
      const power = Math.min(4, 1 + Math.floor(n / 6)); addSP(0); cheer = 2;
      if(pal && pal.bird && st.dhp > 0){ await hitFoe(power + 1, true, 'pup'); }
      else if(pal && st.dhp > 0){ for(const f of foes.filter(f => !f.dead)){ const i = foes.indexOf(f); pupB.ox = 0; await tween(pupB, 'ox', fxPos(f, i) - 30, 160); f.hp = Math.max(0, f.hp - power); f.flash = .4; sfx('nice'); pop(fxPos(f, i) + 14, 64, `ZOOM! -${power}`, '#F2C14E'); showHP(); if(f.hp <= 0){ sfx('hiss'); tween(f, 'dead', 1, 400); } } await tween(pupB, 'ox', 0, 260); await wait(300); }
      else { st.hp = Math.min(st.mhp, st.hp + power + 2); pop(60, 56, `+${power + 2} ❤️`, '#7FD07A'); for(const f of foes.filter(f => !f.dead)){ const i = foes.indexOf(f); f.hp = Math.max(0, f.hp - 1); f.flash = .4; pop(fxPos(f, i) + 14, 64, '-1', '#fff'); if(f.hp <= 0){ tween(f, 'dead', 1, 400); } } sfx('nice'); showHP(); hud(); await wait(700); }
      say2(n >= 18 ? 'The crowd goes WILD! 🎉' : n >= 10 ? 'Great special!' : 'Nice try!');
      await wait(500);
    }
    async function turn(m){
      if(m === 'special'){ await special(); if(foes.every(f => f.dead || f.hp <= 0)){ foes.forEach(f => f.dead = 1); return finish('win'); } await wait(250); return foeTurn(); }
      if(m === 'run'){ if(Math.random() < .75){ say2('You got away safely!'); await wait(700); return finish('run'); } say2('Couldn’t get away!'); await wait(700); return foeTurn(); }
      if(m === 'snack'){ st.items.snack--; st.hp = Math.min(st.mhp, st.hp + 5); st.dhp = Math.min(st.dmhp, st.dhp + 3); pop(60, 60, '+5 ❤️', '#7FD07A'); showHP(); hud(); say2('Munch munch. Mami Elsa’s arepas hit different!'); api.sfx('pop'); await wait(900); return foeTurn(); }
      say2(m === 'bonk' ? `${ME} gets ready to bonk!` : pal && pal.bird ? 'Cóndorito circles high above…' : 'Alejandro crouches… wiggles…'); const nice = await aim();
      await hitFoe(nice ? 2 : 1, nice, m === 'pounce' ? 'pup' : 'hero'); if(nice) addSP(1);
      if(foes.every(f => f.dead)) return finish('win');
      await wait(250); foeTurn();
    }
    async function foeTurn(){
      for(const f of foes.filter(f => !f.dead)){
        const toPup = pal && st.dhp > 0 && Math.random() < .3, tgt = toPup ? pupB : hero, nm = MONS[f.k].name;
        say2(`${nm} ${f.k !== 'hairball' ? 'charges with a battle hiss at' : 'pounces at'} ${toPup ? pal.name : ME}! Tap as it hits to guard!`);
        await wait(500 + Math.random() * 500);
        const dur = 650 + Math.random() * 350, hitAt = performance.now() + dur; ring = { x: toPup ? 32 : 60, y: toPup ? 90 : 80, at: hitAt, ms: dur };
        tapAt = 0; await tween(f, 'ox', toPup ? -100 : -76, dur); ring = null;
        const perfect = tapAt && Math.abs(hitAt - tapAt) < 75, guard = perfect || (tapAt && hitAt - tapAt < 260 && hitAt - tapAt > -90);
        const dmg = perfect ? 0 : Math.max(0, f.atk - (guard ? 1 : 0));
        if(perfect){ f.hp = Math.max(0, f.hp - 1); f.flash = .4; pop(fxPos(f, foes.indexOf(f)) + 14, 60, 'COUNTER! -1', '#F2C14E'); addSP(2); } else if(guard) addSP(1);
        if(toPup) st.dhp = Math.max(0, st.dhp - dmg); else st.hp = Math.max(0, st.hp - dmg);
        tgt.flash = dmg ? .5 : 0; pop(toPup ? 32 : 60, toPup ? 76 : 60, perfect ? 'PERFECT!' : guard ? (dmg ? `GUARD! -${dmg}` : 'GUARD!') : `-${dmg}`, perfect ? '#F2C14E' : guard ? '#7FD07A' : '#E0566B'); sfx(guard ? 'guard' : 'hurt'); showHP(); hud();
        await tween(f, 'ox', 0, 300);
        if(f.hp <= 0 && !f.dead){ sfx('hiss'); await tween(f, 'dead', 1, 400); if(foes.every(x => x.dead)) return finish('win'); }
        if(toPup && st.dhp <= 0){ say2(`${pal.name} is all tuckered out! 💤`); await wait(800); }
        if(st.hp <= 0) return finish('lose');
        await wait(200);
      }
      menuOn();
    }
    async function finish(how){
      over = true; menu.hidden = true; needle = null; ring = null; bar.hidden = true;
      if(how === 'win'){ const c = foes.reduce((a, f) => a + (MONS[f.k].coins || 0), 0), xp = foes.reduce((a, f) => a + (MONS[f.k].xp || 0), 0);
        st.coins += c; st.xp += xp; MUS.play('victory'); sfx('win'); say2(`You won! +${c} 🪙 +${xp} ⭐`); await wait(1200);
        const need = st.lv * 8; if(st.xp >= need){ st.xp -= need; st.lv++; st.mhp += 2; st.dmhp += 1; st.hp = st.mhp; st.dhp = st.dmhp; say2(`LEVEL UP! You’re level ${st.lv}. ❤️ +2, hearts refilled!`); sfx('nice'); await wait(1500); }
        if(!HOME && mon.k === 'hairball'){ setWorld({ ['b_' + mon.id]: 1 }); }
        if(HOME && mon.k !== 'sarge'){ setWorld({ ['p_' + mon.id]: 1 }); const n = cats(W); say2(n >= 3 ? 'That was the last Hairball outside! Time to check the dog park.' : `Hairballs defeated: ${n}/3.`); await wait(1100); }
      } else if(how === 'lose'){ say2(HOME ? 'You fainted! You wake up at home… 💤' : 'You fainted! Mami Elsa nurses you back to health… 💤'); await wait(1600); st.hp = st.mhp; st.dhp = st.dmhp; p.x = (HOME ? 8 : 17) * T + 8; p.y = (HOME ? 11 : 7) * T + 6; pup.x = p.x - 12; pup.y = p.y + 6; pup.trail = []; }
      st.dhp = Math.max(st.dhp, 1); el.hidden = true; BT = null; safeT = 2; hud(); saveNow(); MUS.play(HOME ? 'home' : 'bogota');
      if(how === 'win' && mon.k !== 'hairball') mon.gone = 1;
      if(how === 'win' && mon.k === 'sarge') bossEnd();
      if(how === 'win' && mon.k === 'capi') bogotaEnd();
    }
    showHP(); say2(mon.k === 'capi' ? '🎖️ CAPTAIN HAIRBALL blocks the summit! “The little brown dog is OURS!”' : def.boss ? '🪖 SERGEANT HAIRBALL blocks the way! “Nobody gets near the portal! Boss’s orders!”' : 'A Hairball hisses at you! “Ssssstay away from the dog park!”'); menu.hidden = true;
    setTimeout(() => { if(!over) menuOn(); }, 1200);
  }

  /* --- loop --- */
  function update(dt, now){
    let ix = input.x, iy = input.y; const k = input.keys;
    if(k.arrowleft || k.a) ix = -1; if(k.arrowright || k.d) ix = 1; if(k.arrowup || k.w) iy = -1; if(k.arrowdown || k.s) iy = 1;
    if(talk){ ix = iy = 0; const L = talk.lines[talk.i]; if(talk.shown < L.length){ const before = Math.floor(talk.shown); talk.shown = Math.min(L.length, talk.shown + dt * 45); const nowN = Math.floor(talk.shown); boxText.textContent = L.slice(0, nowN); if(nowN >= L.length) showChoices(); if(!/^[(*…]/.test(L)){ for(let c = before; c < nowN; c++){ if(c % 3 === 0 && /[a-zA-Z0-9]/.test(L[c])){ blip(talk.name, L[c]); break; } } } } }
    if(!$('.rpg-panel').hidden || scene) ix = iy = 0;
    // scripted movement
    for(let i = tasks.length - 1; i >= 0; i--){ const tk = tasks[i], e = tk.ent, tg = tk.pts[0]; if(!tg){ tasks.splice(i, 1); tk.res && tk.res(); continue; }
      const dx = tg[0] - e.x, dy = tg[1] - e.y, l = Math.hypot(dx, dy), s = tk.sp * dt;
      if(l <= s){ e.x = tg[0]; e.y = tg[1]; tk.pts.shift(); } else { e.x += dx / l * s; e.y += dy / l * s; e.d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); e.ft = (e.ft || 0) + dt; if(e.ft > .13){ e.ft = 0; e.f = e.f === 1 ? 2 : 1; } e.scripted = 1; } }
    const L = Math.hypot(ix, iy); p.moving = L > .1;
    if(p.moving){ const sp = 78 * Math.min(1, L) * dt, vx = ix / Math.max(1, L) * sp, vy = iy / Math.max(1, L) * sp;
      if(!blocked(p.x + vx, p.y)) p.x += vx; if(!blocked(p.x, p.y + vy)) p.y += vy;
      p.d = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 1 : 2) : (iy < 0 ? 3 : 0);
      p.ft += dt; if(p.ft > .14){ p.ft = 0; p.f = p.f === 1 ? 2 : 1; } pup.trail.push([p.x, p.y, p.d]); if(pup.trail.length > 200) pup.trail.shift(); dirty = true; }
    else if(!tasks.some(t => t.ent === p)) p.f = 0;
    if(!tasks.some(t => t.ent === pup)){
      const tgt = pup.trail.length > 14 ? pup.trail[pup.trail.length - 14] : null;
      if(!scene && tgt && Math.hypot(tgt[0] - pup.x, tgt[1] - pup.y) > 2 && Math.hypot(p.x - pup.x, p.y - pup.y) > 16){ const dx = tgt[0] - pup.x, dy = tgt[1] - pup.y, l = Math.hypot(dx, dy), s = Math.min(l, 84 * dt); pup.x += dx / l * s; pup.y += dy / l * s; pup.d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); pup.ft += dt; if(pup.ft > .1){ pup.ft = 0; pup.f = pup.f === 1 ? 2 : 1; } } else pup.f = 0;
      if(!scene && Math.hypot(p.x - pup.x, p.y - pup.y) > 90){ pup.x = p.x - 10; pup.y = p.y + 4; } }
    // the gate slams shut once you leave the park after the portal closes
    if(HOME && W.p_start && !W.p_locked && !scene && p.y < PARK.y * T - 4){ setWorld({ p_locked: 1 }); sfx('clang'); banner('🔒 CLANG! A Hairball slammed the dog park gate shut behind you!'); }
    npcs.forEach(n => { n.t -= dt; if(n.t <= 0){ n.t = 2 + Math.random() * 3; if(n.wander && !talk){ n.mx = Math.random() < .5 ? 0 : (Math.random() - .5) * 2; n.my = Math.random() < .5 ? 0 : (Math.random() - .5) * 2; if(Math.abs(n.mx) > Math.abs(n.my) && n.mx) n.d = n.mx < 0 ? 1 : 2; else if(n.my) n.d = n.my < 0 ? 3 : 0; } else { n.mx = n.my = 0; } }
      if(n.mx || n.my){ const nx = n.x + n.mx * 22 * dt, ny = n.y + n.my * 22 * dt; if(Math.hypot(nx - n.hx, ny - n.hy) < (n.wander === 2 ? 70 : 28) && !solidAt(nx, ny) && Math.hypot(nx - p.x, ny - p.y) > 14){ n.x = nx; n.y = ny; n.ft = (n.ft || 0) + dt; if(n.ft > .2){ n.ft = 0; n.f = n.f === 1 ? 2 : 1; } } else { n.mx = n.my = 0; n.f = 0; } } else n.f = 0; });
    safeT -= dt;
    mons.forEach(m => { if(!monShown(m)) return;
      m.t -= dt; if(m.t <= 0){ m.t = 1 + Math.random() * 2; m.mx = (Math.random() - .5) * 2; m.my = (Math.random() - .5) * 2; if(Math.random() < .3) m.mx = m.my = 0; }
      if(m.k === 'hairball'){ const nx = m.x + m.mx * 30 * dt, ny = m.y + m.my * 30 * dt; if(Math.hypot(nx - m.hx, ny - m.hy) < 44 && !solidAt(nx, ny)){ m.x = nx; m.y = ny; } }
      if(!talk && !BT && !scene && safeT <= 0 && Math.hypot(m.x - p.x, m.y - p.y) < (m.k !== 'hairball' ? 20 : 12)){ input.x = input.y = 0; battle(m); } });
    for(let i = fx.length - 1; i >= 0; i--){ const f = fx[i]; f.t -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 160 * dt; if(f.t <= 0) fx.splice(i, 1); }
    if(remote.on){ remote.x += (remote.tx - remote.x) * Math.min(1, dt * 10); remote.y += (remote.ty - remote.y) * Math.min(1, dt * 10); remote.ft = (remote.ft || 0) + dt; if(remote.moving){ if(remote.ft > .14){ remote.ft = 0; remote.f = remote.f === 1 ? 2 : 1; } } else remote.f = 0; if(now - remote.seen > 6000) remote.on = false; }
    if(now - lastSent > (p.moving ? 90 : 1500)){ lastSent = now; send('pos', { who: me, x: Math.round(p.x), y: Math.round(p.y), d: p.d, m: p.moving }); }
    if(dirty && now - lastSave > 6000){ dirty = false; saveNow(); }
    const tx2 = p.x / T, ty2 = p.y / T, a = AR.slice().reverse().find(([x0, y0, x1, y1]) => tx2 >= x0 && tx2 < x1 && ty2 >= y0 && ty2 < y1);
    if(a && a[4] !== area){ area = a[4]; const el = $('.rpg-area'); el.textContent = area; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
    if(shake > 0) shake -= dt;
  }
  function spr(sheet, Wd, H, ent, sx, sy){ cx.drawImage(sheet, (ent.f || 0) * Wd, (ent.d || 0) * H, Wd, H, Math.round(sx), Math.round(sy), Wd, H); }
  function draw(now){
    const vw = cv.width / (scale * G.dpr), vh = cv.height / (scale * G.dpr);
    let camx = Math.round(Math.max(0, Math.min(MW * T - vw, p.x - vw / 2))), camy = Math.round(Math.max(0, Math.min(MH * T - vh, p.y - vh / 2)));
    if(shake > 0){ camx += Math.round((Math.random() - .5) * 6); camy += Math.round((Math.random() - .5) * 6); }
    cx.setTransform(scale * G.dpr, 0, 0, scale * G.dpr, 0, 0); cx.imageSmoothingEnabled = false;
    cx.fillStyle = '#2F7A3E'; cx.fillRect(0, 0, vw, vh);
    cx.drawImage(bg, -camx, -camy);
    const t = now / 1000;
    cx.fillStyle = 'rgba(255,255,255,.75)';
    for(let ty = Math.floor(camy / T); ty < Math.min(MH, (camy + vh) / T + 1); ty++) for(let tx = Math.floor(camx / T); tx < Math.min(MW, (camx + vw) / T + 1); tx++){ if(map[ty][tx] !== '~') continue; const h = hash(tx, ty); if(((t * .6 + h * 7) % 3) < 1.1) cx.fillRect(tx * T - camx + Math.floor(h * 10) + Math.floor((t * 3 + h * 5) % 3), ty * T - camy + Math.floor(hash(ty, tx) * 12), 3, 1); }
    cx.fillStyle = 'rgba(191,230,245,.9)'; const fy = 14 * T - 18 - Math.abs(Math.sin(t * 4)) * 3; cx.fillRect(21 * T + 14 - camx, fy - camy, 4, 4);
    if(HOME && gateShut()){ const gx = GATE.x - 8 - camx, gy = GATE.y - 8 - camy; cx.fillStyle = '#C79A63'; cx.fillRect(gx + 1, gy + 4, 14, 10); cx.fillStyle = '#9A6B3C'; cx.fillRect(gx + 7, gy + 4, 2, 10); cx.fillRect(gx + 2, gy + 8, 12, 1); cx.fillStyle = '#F2C14E'; cx.fillRect(gx + 10, gy + 7, 3, 3); }
    // the portal
    if(portal.r > 0){ const px = PT.x - camx, py = PT.y - camy; cx.save(); for(let i = 0; i < 4; i++){ cx.strokeStyle = ['#B39CE0','#7A5BC4','#E0A3F0','#FFFFFF'][i]; cx.globalAlpha = .85 - i * .15; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(px, py, Math.max(1, portal.r - i * 3 + Math.sin(t * 6 + i) * 1.2), Math.max(1, (portal.r - i * 3) * .55), 0, t * (i % 2 ? -2 : 2), t * (i % 2 ? -2 : 2) + 5.2); cx.stroke(); } cx.fillStyle = 'rgba(122,91,196,.45)'; cx.beginPath(); cx.ellipse(px, py, portal.r * .7, portal.r * .38, 0, 0, 7); cx.fill(); cx.restore(); }
    else if(HOME && W.p_start && !W.p_done){ cx.fillStyle = `rgba(179,156,224,${.25 + Math.sin(t * 3) * .15})`; cx.beginPath(); cx.ellipse(PT.x - camx, PT.y - camy, 7, 3, 0, 0, 7); cx.fill(); }
    const ents = [{ y: p.y, fn: () => spr(sheets[me], 16, 22, p, p.x - 8 - camx, p.y - 20 - camy) }];
    if(pup.vis) ents.push({ y: pup.y, fn: () => pup.who === 'condor' ? drawMon(cx, 'condor', pup.x - 8 - camx, pup.y - 16 - camy, t, 1) : spr(SHEETS[pup.who], 16, 14, pup, pup.x - 8 - camx, pup.y - 12 - camy) });
    if(duck.vis) ents.push({ y: duck.y, fn: () => { if(duck.glow > 0){ cx.fillStyle = `rgba(255,226,122,${duck.glow * (.35 + Math.sin(t * 8) * .15)})`; cx.beginPath(); cx.arc(duck.x - camx, duck.y - 6 - camy, 11, 0, 7); cx.fill(); } drawMon(cx, 'duck', duck.x - 7 - camx, duck.y - 12 - camy, t * (duck.scripted ? 2 : 0), 1); } });
    npcs.forEach(n => ents.push({ y: n.y, fn: () => n.bird ? drawMon(cx, 'condor', n.x - 8 - camx, n.y - 16 - camy, t, 1) : n.dog ? spr(n.sheet, 16, 14, n, n.x - 8 - camx, n.y - 12 - camy) : spr(n.sheet, 16, 22, n, n.x - 8 - camx, n.y - 20 - camy) }));
    if(remote.on) ents.push({ y: remote.y, fn: () => spr(sheets[other], 16, 22, remote, remote.x - 8 - camx, remote.y - 20 - camy) });
    mons.forEach(m => { if(!monShown(m)) return; ents.push({ y: m.y, fn: () => drawMon(cx, m.k, m.x - (m.k !== 'hairball' ? 10 : 9) - camx, m.y - (m.k !== 'hairball' ? 20 : 14) - camy, t + m.hx, 1) }); });
    if(bogDayla) ents.push({ y: bogDayla.y, fn: () => spr(SHEETS.dayla, 16, 14, { f: Math.floor(t * 6) % 2 ? 1 : 0, d: 0 }, bogDayla.x - 8 - camx, bogDayla.y - 12 - camy) });
    if(portal2 && portal2.r > 0){ const px = portal2.x - camx, py = portal2.y - camy; cx.save(); cx.strokeStyle = '#E0A3F0'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(px, py, portal2.r, portal2.r * .55, 0, 0, 7); cx.stroke(); cx.fillStyle = 'rgba(122,91,196,.5)'; cx.fill(); cx.restore(); }
    if(holo.vis) ents.push({ y: PT.y + 1, fn: () => { cx.save(); cx.globalAlpha = holo.a * (.7 + Math.sin(t * 20) * .1); cx.translate(PT.x - camx, PT.y - 14 - camy); cx.rotate(holo.tilt); drawMon(cx, 'whiskers', -14, -30, t, 1); cx.fillStyle = 'rgba(122,200,255,.25)'; for(let i = -30; i < 4; i += 3) cx.fillRect(-16, i, 32, 1); cx.restore(); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.fn());
    fx.forEach(f => { cx.fillStyle = f.c; cx.fillRect(Math.round(f.x - camx), Math.round(f.y - camy), 2, 2); });
    cx.drawImage(top, -camx, -camy);
    cx.font = '6px sans-serif'; cx.textAlign = 'center';
    const tag = (txt, x, y, col) => { const w = cx.measureText(txt).width + 6; cx.fillStyle = 'rgba(42,32,28,.75)'; cx.fillRect(Math.round(x - w / 2), Math.round(y - 7), Math.round(w), 8); cx.fillStyle = col || '#fff'; cx.fillText(txt, Math.round(x), Math.round(y - 1)); };
    if(remote.on) tag(api.nameOf(other), remote.x - camx, remote.y - 22 - camy, '#F4A6B8');
    if(!talk && !scene){ const fx2 = p.x + [0, -14, 14, 0][p.d], fy2 = p.y + [14, 0, 0, -14][p.d]; const n = npcs.find(n => Math.hypot(n.x - fx2, n.y - fy2) < 16); if(n) tag('💬 ' + n.name, n.x - camx, n.y - (n.dog ? 14 : 22) - camy); }
    const hr = new Date().getHours() + new Date().getMinutes() / 60; let a = 0, col = '20,30,80';
    if(hr >= 20 || hr < 5.5) a = .36; else if(hr >= 18.5){ a = (hr - 18.5) / 1.5 * .36; col = '60,30,90'; } else if(hr < 7){ a = (7 - hr) / 1.5 * .3; col = '90,50,80'; }
    if(a > 0){ cx.fillStyle = `rgba(${col},${a})`; cx.fillRect(0, 0, vw, vh); }
    if(!HOME && !W.b_dogs){ const bx0 = 30 * T - camx, by0 = 22 * T - camy; for(const ox of [1, 6, 11]){ cx.fillStyle = '#F28C38'; cx.fillRect(bx0 + ox, by0 + 6, 4, 8); cx.fillStyle = '#FFFFFF'; cx.fillRect(bx0 + ox, by0 + 9, 4, 2); cx.fillStyle = '#C96A20'; cx.fillRect(bx0 + ox - 1, by0 + 14, 6, 2); } }
    if(HOME && api.raining && api.raining()){ cx.fillStyle = 'rgba(200,220,255,.55)'; for(let i = 0; i < 70; i++){ const rx = (hash(i, 1) * vw + t * 40) % vw, ry = (hash(i, 2) * vh + t * 220 + i * 13) % vh; cx.fillRect(Math.round(rx), Math.round(ry), 1, 4); } }
  }
  function loop(now){ const dt = Math.min(.05, (now - prev) / 1000); prev = now; if(BT) BT.draw(now); else { update(dt, now); draw(now); } raf = requestAnimationFrame(loop); }
  raf = requestAnimationFrame(loop);
  if(saved.intro) unstick();
  if(!HOME) setTimeout(() => { MUS.play('bogota'); if(!W.b_in){ say('Bogotá', ['(Whoosh! You tumble out of the portal into a little park… in BOGOTÁ!)', '(Green mountains all around, colorful houses, and the smell of arepas.)', `${ME}: Dayla came through here. I can feel it.`, '(Laura’s friends Alejandra and Samuel are on the plaza. Maybe they can help!)'], () => { setWorld({ b_in: 1 }); }); } else if(!W.b_done) banner('📜 ' + objectiveB(W)); else say('Where’s Dayla?', ['(You finished Chapter 1! 🎉 Chapter 2: New York is still being built. Come back soon!)']); }, 400);
  else setTimeout(() => { if(!saved.intro) introScene(); else { MUS.play('home'); if(W.p_start && !W.p_done) banner('📜 ' + (HOME ? objective(W, st) : objectiveB(W))); else if(W.p_done) say('Where’s Dayla?', ['(You finished the Prologue! 🎉)', '(Chapter 1: Bogotá is still being built. Until then you can explore, talk to everyone and peek through the portal in the dog park.)', '(Come back soon. Dayla is waiting! 🐾)']); } }, 400);

  G.stop = () => { cancelAnimationFrame(raf); MUS.stop(); window.removeEventListener('resize', resize); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); send('bye', { who: me }); api.save(pack()); try{ ch && api.unchannel(ch); }catch(e){} };
}
function stop(){ if(G){ G.stop(); G = null; } }
window.RheadRPG = { start, stop };
})();
