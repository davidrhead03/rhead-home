/* =============================================================
   Where's Dayla? — Chapter 2: Abuela's Kitchen
   Bogotá, Colombia. Mami Elsa and Titin's house, the barrio,
   the plaza and the cathedral, Carolina's shopping-mall dungeon,
   Juandi's creature cards, cooking ajiaco, Titin's taxi race,
   and the climb up Monserrate to the Giant Andean Condor.
   Lunita joins (with Papu and Moka as assists).
   Then the second Dayla interlude: the airship's cargo hold.
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
/* the hero's own line. dav = David's line; lau = Laura's line (a string, or { t: English-with-Spanish text, es: full Spanish }) */
async function me(dav, lau, expr){
  const L = D() ? dav : lau;
  if(L && typeof L === 'object') return WD.say(WD.hero, L.t, { es: L.es, expr: expr || L.expr });
  return WD.say(WD.hero, L, { expr });
}
/* family lines: en = English (David's subtitle), es = the Spanish they actually say */
const fam = (who, en, es, expr, o) => say(who, en, Object.assign({ es, expr }, o || {}));
function learnWord(es, en){ if(!D()) return; const G = WD.G; if(G.words.some(w => w[0] === es)) return; G.words.push([es, en]); WD.toast(`New Spanish word: ${es} = ${en}`); WD.pingBag(); }
function clue(k){ const G = WD.G; if(!G.clues.includes(k)) G.clues.push(k); }
const NPC = {};
WD.ENGLISH_WITH_DAVID = (WD.ENGLISH_WITH_DAVID || []).filter(n => n !== 'Juandi').concat(['Juandi']);
const YEL = '#FCD116', BLU = '#003893', RED = '#CE1126', BRICK = '#B5653F', TERRA = '#B5532F', GOLD = '#E8B84A';
const LUNI = () => W.partner && WD.G.partner === 'lunita' ? W.partner : null;
const lunita = (text, expr) => say('Lunita', text, { expr });

/* ================= data ================= */
Object.assign(WD.NAMECOL, { 'Mami Elsa': '#C2557A', Titin: '#C9A21A', Carolina: '#2F8F8A', Diego: '#3E5E9E', Diana: '#6B4FA0', Juandi: '#003893', Lunita: '#C98A55', Papu: '#7C808A', Moka: '#8A5A36', 'Paloma Pickpocket': '#6E7480', 'Clearance Cat': '#C9803A', 'The Markdown Manager': '#B33F2A', 'Runaway Cart': '#7A8590', Zumbador: '#2F9A6A', 'Ruana Cat': '#7A4A2E', 'El Cóndor': '#1E1E26', 'Doña Gloria': '#B34A4A', 'Fruit Seller': '#4F8A3A', Barista: '#7A4A2E', 'Oblea Seller': '#C2453A', Shopkeeper: '#B9803A' });
Object.assign(WD.LOOKS, {
  'Mami Elsa': { skin: '#D9A882', hair: '#B9B4AE', hairStyle: 'pony', pony: '#B9B4AE', scrunchie: '#E86F79', top: '#F7E6EE', floral: ['#E8593C', '#E86F79', '#58AEDD', '#7CD86A'], pants: '#4A4A60', shoes: '#5A4C42', height: .84, eye: '#2A1A14', lashes: true, age: true },
  Titin: { skin: '#D3A27C', hair: '#D2CDC6', hairStyle: 'short', mustache: '#CFC9C1', glasses: true, top: '#F2EEE4', pants: '#3E4A6B', shoes: '#2B1D14', height: .98, eye: '#2A1A14', age: true, belly: 4 },
  Carolina: { skin: '#D9A27B', hair: '#5A3824', hairStyle: 'long', top: '#5BB5B0', scrubs: true, pants: '#5BB5B0', shoes: '#F4F4F2', height: .92, eye: '#2A1A14', lashes: true },
  Diego: { skin: '#D3A07A', hair: '#2B211C', hairStyle: 'combover', glasses: true, hat: '#3E4A6B', hatBand: '#C2453A', top: '#C2453A', pants: '#5A5F6E', shoes: '#F4F4F2', height: 1.0, eye: '#2A1A14', belly: 5 },
  Diana: { skin: '#D9A882', hair: '#141012', hairStyle: 'long', top: '#9AB6D8', skirt: '#3E4A6B', pants: '#D9A882', shoes: '#3A2A22', height: .93, eye: '#2A1A14', lashes: true, pearl: true },
  Juandi: { skin: '#D3A07A', hair: '#1D1416', hairStyle: 'spiky', top: YEL, jersey: { band: BLU, band2: RED, n: '10', num: BLU }, pants: BLU, shoes: '#F4F4F2', height: 1.05, eye: '#2A1A14' },
  'Doña Gloria': { skin: '#C99272', hair: '#3A2418', hairStyle: 'bun', top: '#E8593C', scarf: YEL, pants: '#3E4A6B', shoes: '#3A2A22', height: .9, eye: '#2A1A14', lashes: true, age: true },
  Barista: { skin: '#C99272', hair: '#2B211C', hairStyle: 'bun', top: '#FFFDF6', scarf: '#7A4A2E', pants: '#2B2B33', shoes: '#2B1D14', height: .94, eye: '#2A1A14', lashes: true },
  'Oblea Seller': { skin: '#B9845E', hair: '#3A2418', hairStyle: 'short', mustache: '#2B211C', top: '#FFFDF6', hat: '#F2EEE4', hatBand: RED, pants: '#3E4A6B', shoes: '#2B1D14', height: 1.0, eye: '#2A1A14', belly: 4 },
  Shopkeeper: { skin: '#D9A882', hair: '#5A3824', hairStyle: 'pony', top: '#7A4A2E', scarf: YEL, pants: '#3E4A6B', shoes: '#2B1D14', height: .92, eye: '#2A1A14', lashes: true, age: true },
  'Fruit Seller': { skin: '#B9845E', hair: '#2B211C', hairStyle: 'cap', cap: BLU, top: '#7CB86A', pants: '#5A4C42', shoes: '#3A2A22', height: 1.0, eye: '#2A1A14' }
});
Object.assign(WD.CATS, {
  sale: { fur: '#E0A85A', dark: '#B9803A', light: '#FBE3C0', eye: '#7FB548', stripes: '#B9803A', sash: '#E8593C', size: 1 },
  manager: { fur: '#5E5A66', dark: '#3E3A46', light: '#C9C4CF', eye: '#E8B84A', suit: '#B33F2A', tie: YEL, specs: true, size: 1.45, fluffy: true, brows: true },
  ruana: { fur: '#8E6B4E', dark: '#6B4E36', light: '#E6D2BC', eye: '#9ACD5A', gown: '#7A4A2E', trim: YEL, size: 1.05 }
});
WD.PARTNERS.lunita = { name: 'Lunita', kind: 'minpin', hp: 10, skill: { icon: '🌙', label: 'Squeeze' }, note: 'Laura’s mini pinscher from Bogotá. Tiny, fast and fearless. Fits through any gap.',
  moves: [['Pinscher Pounce', 'Tap A ×2 · reaches flyers'], ['Frenchie Charge', 'Hold A · 1 SP · Papu & Moka']], extra: [], field: ['🌙 Squeeze', 'slip through tiny gaps'], ko: 'Hid under the couch!' };
Object.assign(WD.ITEMS, {
  ajiaco: { name: 'Mami Elsa’s Ajiaco', icon: 'ajiaco', desc: 'Bogotá’s famous soup: three kinds of potato, chicken, corn and guascas, with cream, capers and avocado. Heals everyone fully and gives 3 SP.', hp: 99, php: 99, sp: 3 },
  empanada: { name: 'Empanada', icon: 'empanada', desc: 'Crispy, golden, with ají on the side. Heals 6 HP.', hp: 6 },
  tinto: { name: 'Tinto', icon: 'tinto', desc: 'A little cup of black Colombian coffee. Restores 3 SP.', sp: 3 },
  oblea: { name: 'Oblea', icon: 'oblea', desc: 'Two thin wafers with arequipe in the middle. Heals 4 HP for you and your partner.', hp: 4, php: 4 }
});
Object.assign(WD.KEYS, {
  bogtag: { name: 'The Soggy BOG Tag', icon: 'tag', desc: 'Dayla’s chewed luggage tag. Titin found it in the back seat of his taxi. She’s definitely in Bogotá.' },
  list: { name: 'Carolina’s Shopping List', icon: 'list', get desc(){ const n = ['buy_ruana', 'buy_mug', 'buy_sweater'].filter(F).length; return `Una ruana, una taza de café, un sueterito para Dayla. Found ${n}/3.`; } },
  ticket: { name: 'Cable Car Ticket', icon: 'ticket', desc: 'Dropped by the Markdown Manager. “MONSERRATE · last car tonight · 2 passengers + 1 crate.”' },
  card: { name: 'Juandi’s Cóndor Card', icon: 'ccard', desc: 'CÓNDOR DE LOS ANDES. Special rule: “Weak when grounded. A perfect pounce knocks it out of the sky.”' }
});
Object.assign(WD.CLUES, { taxi: 'A tall stranger in a long coat took Titin’s taxi from the airport with a crate that barked. He asked for the mall, then Monserrate.', mall: 'The Collector’s cats were at the mall’s pet store. They took Lunita too!', cablecar: 'The crate is going up Monserrate on tonight’s last cable car.', condor: 'Juandi’s card: a condor is weak when it’s knocked out of the sky.', ferry: 'Dayla had a ferry ticket to VICTORIA, B.C. Canada!' });
Object.assign(WD.CLUE_ICON, { taxi: ['taxi', 'Titin’s taxi'], mall: ['bag', 'The mall'], cablecar: ['ticket', 'Cable car'], condor: ['ccard', 'Cóndor card'], ferry: ['ferry', 'Ferry ticket'] });
WD.SIGHTINGS.market = { short: '#3 · Bogotá market', title: 'Sighting #3 · Plaza market, Bogotá', text: 'Dayla at a fruit stall in the plaza, munching a granadilla, with a ferry ticket to Victoria, B.C. tucked in her collar. Leads to Chapter 3.' };
Object.assign(WD.TOYS, {
  arepatoy: { name: 'Squeaky Arepa', ch: 2, where: 'Bogotá', desc: 'Under Mami Elsa’s couch. Lunita has been guarding it for months.' },
  futbol: { name: 'Mini Fútbol', ch: 2, where: 'Bogotá', desc: 'A tiny yellow soccer ball from the mall’s toy store ball pit.' },
  condorplush: { name: 'Plush Cóndor', ch: 2, where: 'Bogotá', desc: 'From the gift shop on top of Monserrate. Much friendlier than the real one.' }
});
Object.assign(WD.PINS, {
  tricolor: { name: 'Tricolor Pin', pp: 3, desc: 'Yellow, blue and red. Start every battle with 1 extra SP.' },
  ruana: { name: 'Ruana Pin', pp: 2, desc: 'Cozy. Your partner takes 1 less damage from every hit.' },
  oro: { name: 'Golden Frog Pin', pp: 3, desc: 'Like the treasures in the gold museum. Superguard counters hit 1 harder.' }
});
WD.VERSES.jos19 = { ref: 'Joshua 1:9', en: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', es: 'Mira que te mando que te esfuerces y seas valiente: no temas ni desmayes, porque Jehová tu Dios será contigo en donde quiera que fueres.' };

/* ================= enemies ================= */
Object.assign(WD.FOES, {
  paloma: { name: 'Paloma Pickpocket', kind: 'pigeon', hp: 11, atk: 2, xp: 15, smart: true,
    moves: [{ id: 'peck', name: 'Peck', type: 'melee', dmg: 2, w: 3, delay: [0, 520], feint: .25 }, { id: 'pinch', name: 'Pickpocket', type: 'melee', dmg: 1, w: 2, steal: true, speed: 380, delay: [0, 300] }, { id: 'crumbs', name: 'Crumb Toss', type: 'barrage', dmg: 2, n: 3, w: 2, proj: 'crumb', rhythm: [520, 280, 640] }],
    tattle: 'A Paloma Pickpocket. Plaza pigeon on the Collector’s payroll, in a tiny ruana. HP 11, Attack 2. If its Pickpocket lands, it steals an item from your bag. Beat it to get it back!' },
  salecat: { name: 'Clearance Cat', kind: 'cat', look: 'sale', hp: 13, atk: 3, xp: 16, smart: true, punish: 1, punishText: 'No refunds!',
    moves: [{ id: 'slash', name: 'Price Slash', type: 'melee', dmg: 3, w: 3, feint: .4, delay: [0, 450] }, { id: 'tags', name: 'Tag Storm', type: 'barrage', dmg: 2, n: 3, w: 2, proj: 'pricetag', rhythm: [480, 300, 700] }, { id: 'markup', name: 'Mark Up', type: 'buff', w: 1, say: 'The Clearance Cat marks up his next hit! It will be stronger.' }],
    tattle: 'A Clearance Cat. HP 13, Attack 3. His Price Slash loves a fake-out. Botch an attack and he hits back: no refunds. Thinks everything is on sale, including Dayla.' },
  cart: { name: 'Runaway Cart', kind: 'cart', hp: 12, atk: 3, def: 1, xp: 16,
    moves: [{ id: 'ram', name: 'Ram', type: 'melee', dmg: 3, w: 3, speed: 340, delay: [200, 900], big: true }, { id: 'squeak', name: 'Squeaky Wheel', type: 'brace', w: 1, say: 'The Runaway Cart locks its squeaky wheel. It takes 2 less damage until its next turn.' }],
    tattle: 'A Runaway Cart. HP 12, Armour 1. It sits there squeaking… then RAMS, fast, when you least expect it. Watch the wheels, not the clock.' },
  humm: { name: 'Zumbador', kind: 'humm', hp: 7, atk: 1, xp: 12, twice: true, air: true,
    moves: [{ id: 'zip', name: 'Zip', type: 'melee', dmg: 1, w: 3, delay: [0, 700], feint: .3, speed: 360 }, { id: 'nectar', name: 'Nectar Break', type: 'heal', amt: 3, w: 2, say: 'The Zumbador sips some nectar…' }],
    tattle: 'A Zumbador, a Colombian hummingbird. HP 7. It flies, so only jumps reach it, and it moves twice a turn. Colombia has more kinds of hummingbird than anywhere on Earth.' },
  ruanacat: { name: 'Ruana Cat', kind: 'cat', look: 'ruana', hp: 14, atk: 3, xp: 18, smart: true,
    moves: [{ id: 'bonk', name: 'Bonk', type: 'melee', dmg: 3, w: 3, delay: [100, 600] }, { id: 'hail', name: 'Granizo', type: 'barrage', dmg: 2, n: 3, w: 2, proj: 'hail', rhythm: [500, 260, 760] }, { id: 'wrap', name: 'Cozy Wrap', type: 'brace', w: 1, say: 'The Ruana Cat wraps up in its ruana. It takes 2 less damage until its next turn.' }],
    tattle: 'A Ruana Cat. Mountain guard. HP 14, Attack 3. Granizo is a Bogotá hailstorm: three hard hits in a lumpy rhythm. It wraps up in its ruana to block damage.' },
  manager: { name: 'The Markdown Manager', kind: 'cat', look: 'manager', hp: 46, atk: 3, xp: 80, boss: true, smart: true, learn: true,
    moves: [{ id: 'slash', name: 'Price Slash', type: 'melee', dmg: 3, w: 3, feint: .45, delay: [0, 500] }, { id: 'coupons', name: 'Coupon Storm', type: 'barrage', dmg: 2, n: 3, w: 2, proj: 'pricetag', rhythm: [500, 280, 700] }, { id: 'final', name: 'FINAL SALE', type: 'melee', dmg: 5, w: 1, windup: true, noSuper: true, big: true, speed: 520, charge: 'The Markdown Manager raises a giant FINAL SALE sign! It slams down next turn. Make him dizzy to stop it!' }],
    rage: [{ id: 'slash', name: 'Price Slash', type: 'melee', dmg: 3, w: 2, feint: .5, delay: [0, 600] }, { id: 'coupons', name: 'Coupon Storm', type: 'barrage', dmg: 1, n: 5, w: 2, proj: 'pricetag', rhythm: [480, 260, 260, 680, 300] }, { id: 'final', name: 'FINAL SALE', type: 'melee', dmg: 5, w: 2, windup: true, noSuper: true, big: true, speed: 520, charge: 'The Markdown Manager raises a giant FINAL SALE sign! It slams down next turn. Make him dizzy to stop it!' }, { id: 'clear', name: 'Cleanup on Aisle 2!', type: 'summon', summon: 'salecat', w: 3, say: '“CLEANUP ON AISLE TWO!” The Manager rings the store bell!', after: 'A Clearance Cat reports for duty!' }],
    tattle: 'The Markdown Manager. HP 46, Attack 3 to 5. Runs the pet store for the Collector. When he lifts the FINAL SALE sign, make him dizzy with a Perfect Crossover or Purse Swing, or Guard it (red: no Superguard). At half health he calls Clearance Cats.' },
  condor: { name: 'El Cóndor', kind: 'condor', hp: 90, atk: 4, xp: 160, boss: true, smart: true, learn: true, air: true, groundable: true, hover: 16,
    moves: [{ id: 'dive', name: 'Dive Bomb', type: 'melee', dmg: 3, w: 3, feint: .5, delay: [200, 700], speed: 420, big: true }, { id: 'feathers', name: 'Feather Storm', type: 'barrage', dmg: 2, n: 3, w: 2, proj: 'feather', rhythm: [480, 260, 640] }, { id: 'gust', name: 'Andean Gust', type: 'special', w: 2 }, { id: 'snatch', name: 'Snatch', type: 'special', w: 1 }],
    rage: [{ id: 'dive', name: 'Dive Bomb', type: 'melee', dmg: 4, w: 3, feint: .55, delay: [200, 800], speed: 400, big: true }, { id: 'feathers', name: 'Feather Storm', type: 'barrage', dmg: 2, n: 4, w: 2, proj: 'feather', rhythm: [460, 240, 620, 260] }, { id: 'gust', name: 'Andean Gust', type: 'special', w: 2 }, { id: 'snatch', name: 'Snatch', type: 'special', w: 1 }, { id: 'sky', name: 'Sky Dive', type: 'melee', dmg: 5, w: 2, windup: true, noSuper: true, big: true, speed: 500, charge: 'El Cóndor climbs high into the clouds… It will come straight down next turn! Ground it or get ready to Guard!' }],
    tattle: 'El Cóndor, a giant Andean condor hired as the Collector’s courier. HP 90, Attack 3 to 5. It flies: only jumps reach it, unless Lunita lands two Perfect pounces and knocks it to the ground. The Gust is red, so no Superguard. Snatch grabs your partner until you hit the condor hard. At half health it climbs for a Sky Dive.' }
});
/* the condor's two special moves (gust, snatch) */
const CONDOR_SPECIAL = {
  async gust(f, B, h){
    const e = f.e; e.glow = true;
    await h.bSay('El Cóndor: Andean Gust!', 1000);
    const c = h.armGuard(); e.armRaise = -1.4; WD.sfx('whoosh'); await WD.wait(200 + Math.random() * 500);
    h.strikeIn(c, 520); await WD.tween(520, u => { B.wind = u; }); B.wind = 0; e.armRaise = 0;
    let res = await h.closeGuard(c, B.p.x); if(res === 2){ res = 1; h.addText(B.p.x, -150, 'Too strong to Superguard!', '#E8593C'); }
    h.noteGuard(f, { id: 'gust' }, res); e.glow = false;
    await h.resolveHit(res, 'p', 2, f, { id: 'gust' });
    if(h.partnerUp() && !B.snatched){ if(res >= 1){ h.addText(B.a.x, -80, 'Held on!', '#58AEDD', true); } else { await h.hurtAlly('a', 1); B.detain.a = 1; h.addText(B.a.x, -100, 'Blown away!', '#B39CE0', true); } }
  },
  async snatch(f, B, h){
    if(!h.partnerUp() || B.snatched){ return CONDOR_SPECIAL.gust(f, B, h); }
    const e = f.e, a = B.a; await h.bSay(`El Cóndor swoops for ${WD.partnerDef().name}!`, 1100);
    const c = h.armGuard(); const x0 = e.x; await h.tw(e, { x: a.x + 70 }, 420); await WD.wait(150 + Math.random() * 500);
    h.strikeIn(c, 420); await h.tw(e, { x: a.x + 10 }, 420, 20); let res = await h.closeGuard(c, a.x);
    h.noteGuard(f, { id: 'snatch' }, res);
    if(res === 2){ h.addText(a.x, -110, 'SUPERGUARD! Wriggled free!', '#FFC94A', true); WD.sfx('perfect'); await h.hitFoe(f, 1, { noBuff: true, pierce: true }); await h.tw(e, { x: x0 }, 420); return; }
    WD.sfx('whoosh'); B.snatched = { hp: f.hp }; a.nervous = true; await h.hurtAlly('a', res === 1 ? 0 : 1);
    await h.tw(e, { x: x0 }, 500); h.addText(e.x, -150, `${WD.partnerDef().name} is caught!`, '#E8593C', true);
    if(!WD.flag('tip_snatch')){ WD.set('tip_snatch'); await h.bSay('Your partner is caught in its talons! Hit the condor for 6 damage to make it let go.', 2400); }
  }
};
WD.FOES.condor.moves.concat(WD.FOES.condor.rage).forEach(m => { if(m.type === 'special') m.run = (f, B, h) => CONDOR_SPECIAL[m.id](f, B, h); });

/* ================= drawing: Bogotá's animals ================= */
const MINPIN = { base: '#C98A55', dark: '#9A6236', light: '#E2AE7A', tan: '#F0CDA0', nose: '#2B1D14', eye: '#1D1412', pink: '#E9A3A0' };
function drawMinpin(c, st){
  const P = MINPIN, mv = st.move || 0, w = st.walk || 0, t = st.t || 0;
  const bob = -Math.abs(Math.sin(w)) * 1.8 * mv + Math.sin(t * 3.4) * .3 * (1 - mv);
  const s = Math.sin(w) * .75 * mv, sit = !!st.sit;
  const leg = (x, a, col, h) => { c.save(); c.translate(x, -12 + bob); c.rotate(a); c.fillStyle = col; rr(c, -1.3, 0, 2.6, h || 12, 1.3); c.fill(); c.fillStyle = P.tan; ell(c, .3, (h || 12) - .4, 1.9, 1.1); c.fill(); c.restore(); };
  leg(-9, sit ? -.9 : -s, P.dark, sit ? 8 : 12); leg(7, s, P.dark);
  c.save(); c.translate(-13, -19 + bob); c.rotate(-1.1 + Math.sin(t * (st.happy ? 18 : 6)) * (st.happy ? .45 : .12)); c.strokeStyle = P.base; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -7); c.stroke(); c.restore();
  c.save(); if(sit){ c.translate(-4, 2); c.rotate(-.35); }
  c.fillStyle = P.base; ell(c, -1, -18 + bob, 13.5, 6.4); c.fill();
  c.fillStyle = P.light; ell(c, -2, -21.5 + bob, 9, 2.4); c.fill();
  c.fillStyle = P.tan; ell(c, 8, -14 + bob, 4.4, 3.6); c.fill();
  c.restore();
  leg(-6, sit ? -1.1 : s, P.base, sit ? 8 : 12); leg(9, -s, P.base);
  const hx = 13, hy = -27 + bob + (st.sniff ? 7 + Math.sin(t * 30) : 0) - (sit ? 3 : 0);
  c.save(); c.translate(hx, hy); c.rotate((st.sniff ? .35 : 0) + (st.tilt || 0));
  const ew = Math.sin(t * 5) * .05 + (st.earsBack ? -.5 : 0);
  [[-3.5, -.15 + ew], [2.5, .2 - ew]].forEach(([x, a], i) => { c.save(); c.translate(x, -4); c.rotate(a); c.fillStyle = i ? P.base : P.dark; c.beginPath(); c.moveTo(-3.4, 1); c.lineTo(-1, -13); c.lineTo(3.4, 1); c.closePath(); c.fill(); c.fillStyle = P.pink; c.beginPath(); c.moveTo(-1.6, 0); c.lineTo(-.6, -8.5); c.lineTo(1.6, 0); c.closePath(); c.fill(); c.restore(); });
  c.fillStyle = P.base; ell(c, 0, 0, 6.6, 6); c.fill();
  c.fillStyle = P.base; c.beginPath(); c.moveTo(2, -3); c.quadraticCurveTo(12, -1.6, 12.4, 2.4); c.quadraticCurveTo(8, 5.6, 2, 4); c.closePath(); c.fill();
  c.fillStyle = P.tan; ell(c, 7, 3.4, 4.2, 2); c.fill(); ell(c, 2, -3.6, 1.2, .9); c.fill();
  c.fillStyle = P.nose; ell(c, 12.2, 1.4, 1.5, 1.2); c.fill();
  if(st.blink > 0 || st.expr === 'sleep' || st.zzz){ c.strokeStyle = P.eye; c.lineWidth = 1; c.beginPath(); c.moveTo(1, -1); c.lineTo(5, -1); c.stroke(); }
  else { c.fillStyle = P.eye; ell(c, 3, -1, 2, 2.2); c.fill(); c.fillStyle = '#fff'; ell(c, 3.7, -1.8, .7, .7); c.fill(); }
  if(st.expr === 'angry' || st.bark){ c.strokeStyle = P.eye; c.lineWidth = .9; c.beginPath(); c.moveTo(.5, -4.6); c.lineTo(5, -3.4); c.stroke(); }
  if((st.talk && Math.sin(t * 22) > -.2) || st.bark){ c.fillStyle = '#B0404A'; ell(c, 8.4, 4.4, 2.2, 1.4); c.fill(); }
  else if(st.happy){ c.fillStyle = '#E86F79'; ell(c, 8, 5, 1.3, 1.8); c.fill(); }
  c.restore();
  // a tiny pink collar with a moon tag
  c.fillStyle = '#E86F79'; rr(c, 8, -23 + bob, 3, 7, 1.4); c.fill(); c.fillStyle = '#FFE36A'; c.beginPath(); c.arc(10.5, -15 + bob, 1.6, .6, 5.4); c.fill();
}
const FRENCH = { grey: { base: '#8C8F98', dark: '#6E717A', light: '#B4B7BE', white: '#F3F1EC' }, brown: { base: '#8A5A36', dark: '#6A4228', light: '#B07A50', white: '#F3E6D6' } };
function drawFrenchie(c, st){
  const P = FRENCH[st.coat || 'grey'], mv = st.move || 0, w = st.walk || 0, t = st.t || 0;
  const bob = -Math.abs(Math.sin(w)) * 1.4 * mv + Math.sin(t * 1.8) * .4 * (1 - mv);
  const s = Math.sin(w) * .55 * mv;
  const leg = (x, a, col) => { c.save(); c.translate(x, -8 + bob); c.rotate(a); c.fillStyle = col; rr(c, -2.6, 0, 5.2, 8.6, 2.4); c.fill(); c.fillStyle = P.white; ell(c, .5, 8.4, 3, 1.5); c.fill(); c.restore(); };
  leg(-10, -s, P.dark); leg(8, s, P.dark);
  if(st.zzz){ c.fillStyle = P.base; ell(c, 0, -8, 18, 7); c.fill(); }
  c.fillStyle = P.base; ell(c, -1, -15 + bob, 15, 9); c.fill();
  c.fillStyle = P.white; ell(c, 7, -11 + bob, 6, 5); c.fill();
  leg(-7, s, P.base); leg(11, -s, P.base);
  const hx = 15, hy = -22 + bob + (st.zzz ? 10 : 0);
  c.save(); c.translate(hx, hy);
  [[-6, -.4], [5, .4]].forEach(([x, a], i) => { c.save(); c.translate(x, -7); c.rotate(a); c.fillStyle = i ? P.base : P.dark; ell(c, 0, -4, 4.4, 6.4); c.fill(); c.fillStyle = '#E9A3A0'; ell(c, 0, -3.6, 2.2, 4); c.fill(); c.restore(); });
  c.fillStyle = P.base; ell(c, 0, 0, 10.5, 9); c.fill();
  c.fillStyle = P.dark; ell(c, 6, 3, 5.6, 4.4); c.fill();
  c.fillStyle = '#2B1D14'; ell(c, 9.6, 1.6, 2.4, 1.6); c.fill();
  c.strokeStyle = P.dark; c.lineWidth = .7; c.beginPath(); c.moveTo(1, 3); c.quadraticCurveTo(4, 1, 7, 3.2); c.stroke();
  if(st.blink > 0 || st.zzz){ c.strokeStyle = '#1D1412'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -1.6); c.lineTo(-.6, -1.6); c.moveTo(3, -2); c.lineTo(6, -2); c.stroke(); }
  else { c.fillStyle = '#1D1412'; ell(c, -2.4, -1.6, 2.2, 2.4); c.fill(); ell(c, 4.6, -2, 2, 2.2); c.fill(); c.fillStyle = '#fff'; ell(c, -1.7, -2.4, .7, .7); c.fill(); ell(c, 5.2, -2.8, .6, .6); c.fill(); }
  if(st.happy || mv > .5){ c.fillStyle = '#E86F79'; ell(c, 6, 7, 1.6, 2.2); c.fill(); }
  c.restore();
  if(st.zzz){ c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '900 7px Grandstander, system-ui'; c.fillText('z', 26, -34 - (t * 6) % 8); }
}
function drawPigeon(c, st){
  const t = st.t || 0, mv = st.move || 0, w = st.walk || 0;
  const bob = Math.abs(Math.sin(w * 1.5)) * -1.4 * mv, peck = st.armRaise ? -.4 : Math.max(0, Math.sin(t * 2.2)) > .96 ? .5 : 0;
  c.strokeStyle = '#E8836A'; c.lineWidth = 1.4; c.lineCap = 'round';
  [-3, 3].forEach((x, i) => { const a = Math.sin(w + i * Math.PI) * .5 * mv; c.beginPath(); c.moveTo(x, -9); c.lineTo(x + Math.sin(a) * 4, 0); c.stroke(); });
  c.fillStyle = '#6E7480'; c.beginPath(); c.moveTo(-15, -14 + bob); c.lineTo(-22, -20 + bob); c.lineTo(-20, -11 + bob); c.closePath(); c.fill();
  c.fillStyle = '#9AA1AE'; ell(c, -2, -15 + bob, 13, 8.4); c.fill();
  c.fillStyle = '#7C8392'; ell(c, -5, -16 + bob, 8, 5, -.2); c.fill(); c.strokeStyle = '#5A606C'; c.lineWidth = .8; c.beginPath(); c.moveTo(-10, -14 + bob); c.lineTo(-2, -13 + bob); c.moveTo(-9, -12 + bob); c.lineTo(-3, -11 + bob); c.stroke();
  // a tiny ruana in Colombia's colours
  c.fillStyle = YEL; c.beginPath(); c.moveTo(-1, -22 + bob); c.lineTo(9, -22 + bob); c.lineTo(11, -11 + bob); c.lineTo(-3, -11 + bob); c.closePath(); c.fill(); c.fillStyle = BLU; c.fillRect(-2.4, -15 + bob, 13, 2); c.fillStyle = RED; c.fillRect(-2.6, -13 + bob, 13.4, 1.6);
  c.save(); c.translate(8, -24 + bob); c.rotate(peck);
  const g = c.createLinearGradient(-4, 0, 4, 6); g.addColorStop(0, '#5FA88A'); g.addColorStop(1, '#8A5AA8'); c.fillStyle = g; ell(c, 0, 3, 5, 4.4); c.fill();
  c.fillStyle = '#8A919E'; ell(c, 1, -2, 5.4, 5); c.fill();
  c.fillStyle = '#2B1D14'; c.beginPath(); c.moveTo(5, -2); c.lineTo(10, -.8); c.lineTo(5, .6); c.closePath(); c.fill(); c.fillStyle = '#F4F1EA'; ell(c, 5.2, -2.4, 1.2, .8); c.fill();
  if(st.hurt > 0 || st.expr === 'dizzy'){ c.strokeStyle = '#2B1D14'; c.lineWidth = .8; c.beginPath(); c.moveTo(1, -4); c.lineTo(3.4, -1.6); c.moveTo(3.4, -4); c.lineTo(1, -1.6); c.stroke(); }
  else { c.fillStyle = '#E8836A'; ell(c, 2.4, -2.8, 1.8, 1.8); c.fill(); c.fillStyle = '#1D1412'; ell(c, 2.6, -2.8, .9, .9); c.fill(); }
  c.restore();
}
function drawCart(c, st){
  const t = st.t || 0, mv = st.move || 0, jig = st.armRaise ? Math.sin(t * 40) * .8 : 0;
  c.save(); c.translate(jig, 0);
  c.fillStyle = '#3A3A40'; [-14, 14].forEach(x => { ell(c, x, -3, 3.6, 3.6); c.fill(); c.fillStyle = '#9AA0A6'; ell(c, x, -3, 1.4, 1.4); c.fill(); c.fillStyle = '#3A3A40'; });
  c.strokeStyle = '#9AA0A6'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-18, -8); c.lineTo(18, -8); c.moveTo(-14, -8); c.lineTo(-20, -36); c.moveTo(14, -8); c.lineTo(22, -36); c.stroke();
  c.fillStyle = 'rgba(200,210,220,.35)'; c.beginPath(); c.moveTo(-22, -36); c.lineTo(24, -36); c.lineTo(16, -12); c.lineTo(-16, -12); c.closePath(); c.fill();
  c.strokeStyle = '#C9CED4'; c.lineWidth = 1.1; c.stroke(); for(let x = -18; x < 22; x += 5){ c.beginPath(); c.moveTo(x, -36); c.lineTo(x * .8, -12); c.stroke(); } c.beginPath(); c.moveTo(-20, -28); c.lineTo(22, -28); c.moveTo(-18, -20); c.lineTo(19, -20); c.stroke();
  c.strokeStyle = '#E8593C'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-22, -36); c.lineTo(-30, -44); c.stroke();
  // googly eyes and a grin on the front
  [[10, -30], [18, -30]].forEach(([x, y]) => { c.fillStyle = '#FFFDF6'; ell(c, x, y, 3.4, 3.6); c.fill(); c.strokeStyle = '#2B1D14'; c.lineWidth = .6; c.stroke(); if(st.hurt > 0 || st.expr === 'dizzy'){ c.strokeStyle = '#2B1D14'; c.lineWidth = .9; c.beginPath(); c.moveTo(x - 1.6, y - 1.6); c.lineTo(x + 1.6, y + 1.6); c.moveTo(x + 1.6, y - 1.6); c.lineTo(x - 1.6, y + 1.6); c.stroke(); } else { c.fillStyle = '#1A1414'; ell(c, x + 1 + Math.sin(t * 2) * .6, y + .6, 1.5, 1.6); c.fill(); } });
  c.strokeStyle = '#2B1D14'; c.lineWidth = 1; c.beginPath(); c.moveTo(9, -23); c.quadraticCurveTo(14, -19, 20, -23); c.stroke();
  c.restore();
}
function drawHumm(c, st){
  const t = st.t || 0, y0 = -34 + Math.sin(t * 5) * 3, flap = Math.sin(t * 60);
  c.save(); c.translate(0, y0);
  c.fillStyle = 'rgba(200,240,230,.55)'; [-1, 1].forEach(sd => { c.save(); c.translate(-2, -3); c.rotate(sd * (.6 + flap * .5) - .3); ell(c, 0, -9, 4, 11); c.fill(); c.restore(); });
  c.fillStyle = '#2F9A6A'; ell(c, -2, 0, 8, 5, -.3); c.fill();
  c.fillStyle = '#1F7A50'; c.beginPath(); c.moveTo(-9, 2); c.lineTo(-17, 6); c.lineTo(-15, 1); c.closePath(); c.fill();
  c.fillStyle = '#E8593C'; ell(c, 3, 2, 3.4, 2.4); c.fill();
  c.fillStyle = '#2FAA7A'; ell(c, 5, -4, 4.6, 4.2); c.fill();
  c.strokeStyle = '#2B1D14'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(9, -4); c.lineTo(20, -2); c.stroke();
  if(st.hurt > 0 || st.expr === 'dizzy'){ c.strokeStyle = '#1A1414'; c.lineWidth = .8; c.beginPath(); c.moveTo(5, -6); c.lineTo(7.4, -3.6); c.moveTo(7.4, -6); c.lineTo(5, -3.6); c.stroke(); }
  else { c.fillStyle = '#1A1414'; ell(c, 6.6, -5, 1.2, 1.3); c.fill(); c.fillStyle = '#fff'; ell(c, 7, -5.4, .4, .4); c.fill(); }
  c.restore();
}
function drawCondor(c, st){
  const t = st.t || 0, air = (st.z || 0) > 8, flap = air ? Math.sin(t * 4) : Math.sin(t * 1.2) * .2;
  const wing = sd => { c.save(); c.translate(-6, -60); c.scale(sd, 1); c.rotate((air ? -.15 : .9) + flap * .45);
    c.fillStyle = '#1E1E26'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30, -26, 70, -14); c.lineTo(66, -6); c.lineTo(72, 0); c.lineTo(64, 4); c.lineTo(68, 10); c.lineTo(56, 10); c.quadraticCurveTo(26, 14, 0, 14); c.closePath(); c.fill();
    c.fillStyle = '#E6E3DA'; c.beginPath(); c.moveTo(14, 2); c.quadraticCurveTo(34, -4, 52, 0); c.lineTo(50, 6); c.quadraticCurveTo(30, 6, 14, 8); c.closePath(); c.fill();
    c.strokeStyle = '#3A3A44'; c.lineWidth = 1; for(let i = 0; i < 4; i++){ c.beginPath(); c.moveTo(54 + i * 3, 6 - i * 4); c.lineTo(64 + i * 2, 8 - i * 4); c.stroke(); } c.restore(); };
  wing(-1);
  c.fillStyle = '#7A6A5A'; [-8, 6].forEach(x => { c.fillRect(x, -24, 3, 22); c.fillRect(x - 3, -3, 9, 3); });
  c.fillStyle = '#26262E'; ell(c, -2, -48, 24, 26); c.fill();
  c.fillStyle = '#1E1E26'; c.beginPath(); c.moveTo(-24, -40); c.lineTo(-44, -30); c.lineTo(-22, -28); c.closePath(); c.fill();
  wing(1);
  // white ruff, bald head, hooked beak
  c.fillStyle = '#F4F1EA'; for(let i = 0; i < 9; i++){ const a = Math.PI * (1.05 + i * .11); ell(c, 10 + Math.cos(a) * 10, -70 + Math.sin(a) * 4, 4.6, 4); c.fill(); }
  ell(c, 10, -70, 12, 5); c.fill();
  c.fillStyle = '#B86A5A'; ell(c, 16, -84, 9, 9.6); c.fill(); c.fillStyle = '#8E4A3E'; ell(c, 12, -92, 5, 3); c.fill();
  c.fillStyle = '#E9D9B8'; c.beginPath(); c.moveTo(22, -88); c.quadraticCurveTo(34, -88, 33, -78); c.quadraticCurveTo(30, -80, 24, -78); c.closePath(); c.fill();
  if(st.hurt > 0 || st.expr === 'dizzy'){ c.strokeStyle = '#1A1414'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(15, -89); c.lineTo(20, -84); c.moveTo(20, -89); c.lineTo(15, -84); c.stroke(); }
  else { c.fillStyle = '#E8B84A'; ell(c, 18, -87, 2.8, 2.8); c.fill(); c.fillStyle = '#1A1414'; ell(c, 18.6, -87, 1.3, 1.6); c.fill(); c.strokeStyle = '#3A1E1A'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(13, -92); c.lineTo(22, -90 + (st.expr === 'angry' ? 2 : 0)); c.stroke(); }
}
Object.assign(WD.KINDS, {
  minpin: { draw: (c, e) => drawMinpin(c, e), box: [-28, -50, 60, 56], shadow: 14, portrait: [4.8, -54, 112] },
  frenchie: { draw: (c, e) => drawFrenchie(c, e), box: [-30, -46, 64, 52], shadow: 17, portrait: [4.4, -66, 92] },
  pigeon: { draw: (c, e) => drawPigeon(c, e), box: [-26, -36, 50, 40], shadow: 11, portrait: [5, -20, 92] },
  cart: { draw: (c, e) => drawCart(c, e), box: [-34, -50, 66, 56], shadow: 20, portrait: [3.8, -40, 110] },
  humm: { draw: (c, e) => drawHumm(c, e), box: [-22, -58, 46, 50], shadow: 8, portrait: [5, -20, 150] },
  condor: { draw: (c, e) => drawCondor(c, e), box: [-80, -112, 160, 116], shadow: 30, portrait: [2.6, -40, 210] }
});
Object.assign(WD.HEAD, { minpin: 48, frenchie: 44, pigeon: 34, cart: 48, humm: 52, condor: 100 });
WD.PROJ = Object.assign(WD.PROJ || {}, {
  crumb(c){ c.fillStyle = '#D9A946'; rr(c, -4, -3, 8, 6, 2); c.fill(); c.fillStyle = '#B9803A'; c.fillRect(-2, -1, 2, 1.4); },
  pricetag(c){ c.fillStyle = '#FFF8EC'; c.beginPath(); c.moveTo(-8, -5); c.lineTo(5, -5); c.lineTo(9, 0); c.lineTo(5, 5); c.lineTo(-8, 5); c.closePath(); c.fill(); c.fillStyle = '#E8593C'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('-50%', -1.5, .4); },
  feather(c){ c.fillStyle = '#1E1E26'; ell(c, 0, 0, 10, 3); c.fill(); c.strokeStyle = '#E6E3DA'; c.lineWidth = .8; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.stroke(); },
  hail(c){ c.fillStyle = '#EAF4FF'; ell(c, 0, 0, 5, 5); c.fill(); c.strokeStyle = '#9CC3EA'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#fff'; ell(c, -1.6, -1.6, 1.4, 1.4); c.fill(); }
});

/* ================= flags, bunting, icons ================= */
function drawFlag(c, x, y, w, t, o){
  o = o || {}; const h = w * .66, seg = 10, ph = o.ph || x * .01;
  if(o.pole !== false){ c.fillStyle = '#6E5A44'; c.fillRect(x - 1.4, y - 3, 2.8, o.poleH || h + 34); c.fillStyle = GOLD; ell(c, x, y - 4, 2.6, 2.6); c.fill(); }
  [[0, .5, YEL], [.5, .75, BLU], [.75, 1, RED]].forEach(([a, b, col]) => {
    c.fillStyle = col; c.beginPath();
    for(let i = 0; i <= seg; i++){ const u = i / seg, wv = Math.sin(t * 4 - u * 5 + ph) * u * w * .07; c.lineTo(x + u * w, y + a * h + wv); }
    for(let i = seg; i >= 0; i--){ const u = i / seg, wv = Math.sin(t * 4 - u * 5 + ph) * u * w * .07; c.lineTo(x + u * w, y + b * h + wv); }
    c.closePath(); c.fill();
  });
  c.fillStyle = 'rgba(0,0,0,.08)'; for(let i = 1; i < seg; i += 2){ const u = i / seg; c.fillRect(x + u * w, y + Math.sin(t * 4 - u * 5 + ph) * u * w * .07, w / seg, h); }
}
WD.drawColFlag = drawFlag;
function drawBunting(c, x0, x1, y, sag, t){
  c.strokeStyle = '#2B1D14'; c.lineWidth = .8; c.beginPath();
  for(let x = x0; x <= x1; x += 6){ const u = (x - x0) / (x1 - x0); x === x0 ? c.moveTo(x, y + Math.sin(u * Math.PI) * sag) : c.lineTo(x, y + Math.sin(u * Math.PI) * sag); } c.stroke();
  const cols = [YEL, BLU, RED];
  for(let x = x0 + 8, i = 0; x < x1 - 4; x += 14, i++){ const u = (x - x0) / (x1 - x0), yy = y + Math.sin(u * Math.PI) * sag; c.save(); c.translate(x, yy); c.rotate(Math.sin(t * 2 + i) * .08); c.fillStyle = cols[i % 3]; c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.lineTo(0, 9); c.closePath(); c.fill(); c.restore(); }
}
function drawPotato(c, x, y, col){ c.fillStyle = col; ell(c, x, y, 4.4, 3.4, .3); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, x - 1, y - .6, .6, .5); c.fill(); }
const ICON2 = {
  ajiaco(c){ c.fillStyle = '#C9673E'; c.beginPath(); c.moveTo(-14, -3); c.quadraticCurveTo(-13, 11, 0, 11); c.quadraticCurveTo(13, 11, 14, -3); c.closePath(); c.fill(); c.fillStyle = '#E9C66A'; ell(c, 0, -3, 14, 4); c.fill(); c.fillStyle = '#FFFDF6'; ell(c, -4, -4, 3.4, 1.6); c.fill(); c.fillStyle = '#6FA84A'; ell(c, 4, -4, 3, 1.6); c.fill(); c.fillStyle = '#4F7A2A'; [[-8, -3], [8, -2], [1, -2]].forEach(([a, b]) => { ell(c, a, b, 1, 1); c.fill(); }); c.fillStyle = '#F2D04A'; rr(c, 7, -10, 3, 8, 1.4); c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -9); c.quadraticCurveTo(-2, -12, -4, -15); c.moveTo(2, -9); c.quadraticCurveTo(4, -12, 2, -15); c.stroke(); },
  empanada(c){ c.fillStyle = '#E2A84A'; c.beginPath(); c.arc(0, 4, 12, Math.PI, 0); c.closePath(); c.fill(); c.strokeStyle = '#B9803A'; c.lineWidth = 1.2; for(let i = 0; i < 7; i++){ const a = Math.PI + i * Math.PI / 6.5; c.beginPath(); c.moveTo(Math.cos(a) * 9, 4 + Math.sin(a) * 9); c.lineTo(Math.cos(a) * 12, 4 + Math.sin(a) * 12); c.stroke(); } },
  tinto(c){ c.fillStyle = '#FFFDF6'; c.beginPath(); c.moveTo(-8, -6); c.lineTo(8, -6); c.lineTo(6, 8); c.lineTo(-6, 8); c.closePath(); c.fill(); c.fillStyle = '#3A1E12'; ell(c, 0, -6, 8, 2); c.fill(); c.fillStyle = YEL; c.fillRect(-7.4, -1, 14.6, 2); c.fillStyle = BLU; c.fillRect(-7, 1, 14, 1.4); c.fillStyle = RED; c.fillRect(-6.8, 2.4, 13.4, 1.4); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, -9); c.quadraticCurveTo(0, -13, -2, -16); c.stroke(); },
  oblea(c){ c.fillStyle = '#F4E6C2'; ell(c, 0, 0, 13, 13); c.fill(); c.strokeStyle = '#D9C49A'; c.lineWidth = .8; for(let i = -9; i <= 9; i += 4.5){ c.beginPath(); c.moveTo(i, -9); c.lineTo(i, 9); c.moveTo(-9, i); c.lineTo(9, i); c.stroke(); } c.fillStyle = '#B9803A'; c.beginPath(); c.arc(0, 0, 13, .1, Math.PI - .1); c.lineTo(-11, 2); c.fill(); },
  list(c){ c.fillStyle = '#FFFDF6'; c.save(); c.rotate(-.06); c.fillRect(-10, -14, 20, 28); c.restore(); c.fillStyle = '#5BB5B0'; c.fillRect(-10, -14, 20, 4); c.fillStyle = 'rgba(43,29,20,.55)'; for(let i = 0; i < 3; i++){ c.fillRect(-5, -6 + i * 6, 12, 1.4); c.strokeStyle = '#2B1D14'; c.lineWidth = .7; c.strokeRect(-8.4, -7 + i * 6, 2.4, 2.4); } },
  ticket(c){ c.fillStyle = '#E8593C'; rr(c, -14, -8, 28, 16, 2); c.fill(); c.fillStyle = '#FFF8EC'; c.fillRect(-11, -5, 16, 10); c.fillStyle = '#2B1D14'; c.font = '900 4px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('MONSERRATE', -3, 1); c.setLineDash([1.4, 1.4]); c.strokeStyle = '#FFF8EC'; c.beginPath(); c.moveTo(8, -8); c.lineTo(8, 8); c.stroke(); c.setLineDash([]); },
  ccard(c){ c.fillStyle = YEL; rr(c, -10, -14, 20, 28, 3); c.fill(); c.fillStyle = '#9CC3EA'; c.fillRect(-7, -11, 14, 12); c.fillStyle = '#1E1E26'; c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(0, -10, 6, -4); c.lineTo(0, -5); c.closePath(); c.fill(); c.fillStyle = '#2B1D14'; c.font = '900 3.6px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('CÓNDOR', 0, 6); c.fillStyle = RED; c.fillText('★★★', 0, 10.5); },
  ferry(c){ c.fillStyle = '#FFFDF6'; rr(c, -14, -8, 28, 16, 2); c.fill(); c.fillStyle = '#3E6FB5'; c.fillRect(-14, -8, 28, 4); c.fillStyle = '#3E6FB5'; c.beginPath(); c.moveTo(-9, 3); c.lineTo(7, 3); c.lineTo(5, 6); c.lineTo(-7, 6); c.closePath(); c.fill(); c.fillRect(-5, 0, 8, 3); c.fillStyle = '#2B1D14'; c.font = '900 3.4px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('VICTORIA B.C.', 0, -1.5); },
  arepatoy(c){ c.fillStyle = '#F4DA9C'; ell(c, 0, 0, 12, 7); c.fill(); c.fillStyle = '#C98E3E'; [[-5, -1], [3, 1], [6, -2]].forEach(([a, b]) => { ell(c, a, b, 1.8, 1); c.fill(); }); c.fillStyle = '#2B1D14'; ell(c, -3, -2, 1, 1.2); c.fill(); ell(c, 3, -2, 1, 1.2); c.fill(); c.strokeStyle = '#2B1D14'; c.lineWidth = .8; c.beginPath(); c.arc(0, 0, 2.4, .2, Math.PI - .2); c.stroke(); },
  futbol(c){ c.fillStyle = YEL; ell(c, 0, 0, 10, 10); c.fill(); c.fillStyle = BLU; for(let i = 0; i < 5; i++){ const a = i * 1.256 - 1.57; c.beginPath(); c.arc(Math.cos(a) * 6.4, Math.sin(a) * 6.4, 2, 0, 7); c.fill(); } c.fillStyle = RED; c.beginPath(); c.arc(0, 0, 2.6, 0, 7); c.fill(); },
  condorplush(c){ c.save(); c.scale(.26, .26); c.translate(0, 50); drawCondor(c, { t: 0 }); c.restore(); },
  photo3(c){ WD.drawPolaroid(c, 0, 2, 22, -.06, (c2, px, py, ps) => sightingMarket(c2, px, py, ps)); },
  flag(c, t){ drawFlag(c, -12, -8, 24, t || 0, { pole: false }); },
  frog(c){ drawFrog(c, 0, 0, 1); },
  sweater(c){ c.fillStyle = YEL; c.beginPath(); c.moveTo(-8, -9); c.lineTo(8, -9); c.lineTo(14, -3); c.lineTo(10, 1); c.lineTo(8, -2); c.lineTo(8, 10); c.lineTo(-8, 10); c.lineTo(-8, -2); c.lineTo(-10, 1); c.lineTo(-14, -3); c.closePath(); c.fill(); c.fillStyle = BLU; c.fillRect(-8, 1, 16, 2.6); c.fillStyle = RED; c.fillRect(-8, 4, 16, 2.6); c.fillStyle = '#E2B52A'; c.beginPath(); c.arc(0, -9, 4, 0, Math.PI); c.fill(); },
  mug(c){ c.fillStyle = '#FFFDF6'; rr(c, -8, -8, 14, 16, 2); c.fill(); c.strokeStyle = '#FFFDF6'; c.lineWidth = 2.4; c.beginPath(); c.arc(7, 0, 4, -1.2, 1.2); c.stroke(); c.fillStyle = '#5F8A72'; c.beginPath(); c.moveTo(-7, 4); c.lineTo(-3, -2); c.lineTo(0, 1); c.lineTo(3, -3); c.lineTo(5, 4); c.closePath(); c.fill(); c.fillStyle = '#7A4A2E'; c.font = '900 3.4px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('CAFÉ', -1, -3.5); },
  ruanaitem(c){ c.fillStyle = '#7A4A2E'; c.beginPath(); c.moveTo(-12, -6); c.lineTo(-3, -10); c.lineTo(3, -10); c.lineTo(12, -6); c.lineTo(10, 9); c.lineTo(-10, 9); c.closePath(); c.fill(); c.fillStyle = YEL; c.fillRect(-11, 0, 22, 2); c.fillStyle = RED; c.fillRect(-10.6, 3.4, 21.2, 2); c.fillStyle = '#F2E6CF'; c.beginPath(); c.arc(0, -9, 3, 0, 7); c.fill(); c.strokeStyle = '#5A341E'; c.lineWidth = .8; for(let x = -8; x <= 8; x += 2.6){ c.beginPath(); c.moveTo(x, 9); c.lineTo(x, 12); c.stroke(); } }
};
function drawFrog(c, x, y, s){ c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = GOLD; ell(c, 0, 2, 10, 7); c.fill(); [[-7, -4], [7, -4]].forEach(([a, b]) => { ell(c, a, b, 3.4, 3.4); c.fill(); }); c.fillStyle = '#B88A2A'; [[-9, 7], [9, 7], [-6, 9], [6, 9]].forEach(([a, b]) => { ell(c, a, b, 3, 1.6); c.fill(); }); c.fillStyle = '#2B1D14'; ell(c, -7, -4.4, 1.3, 1.3); c.fill(); ell(c, 7, -4.4, 1.3, 1.3); c.fill(); c.strokeStyle = '#B88A2A'; c.lineWidth = .8; c.beginPath(); c.arc(0, 2, 4, .3, Math.PI - .3); c.stroke(); c.restore(); }
const baseIcon2 = WD.drawIcon;
WD.drawIcon = function(c, kind, x, y, s, t){ const f = ICON2[kind]; if(!f) return baseIcon2(c, kind, x, y, s, t); c.save(); c.translate(x, y); c.scale(s, s); f(c, t || 0); c.restore(); };
function sightingMarket(c, x, y, s){
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  const g = c.createLinearGradient(0, -50, 0, 50); g.addColorStop(0, '#9CC3EA'); g.addColorStop(1, '#E8EEF0'); c.fillStyle = g; c.fillRect(-50, -50, 100, 100);
  c.fillStyle = '#7E9C9A'; c.beginPath(); c.moveTo(-50, 0); c.lineTo(-24, -30); c.lineTo(0, -12); c.lineTo(20, -36); c.lineTo(50, -6); c.lineTo(50, 0); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(17, -40, 6, 5);
  [[RED, -44], [YEL, -16], [BLU, 12]].forEach(([col, x0]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x0, -6); c.lineTo(x0 + 30, -6); c.lineTo(x0 + 26, 4); c.lineTo(x0 + 4, 4); c.closePath(); c.fill(); });
  c.fillStyle = '#A0703A'; c.fillRect(-46, 4, 92, 30);
  [['#F2B33D', -36], ['#E8593C', -26], ['#7CB86A', -14], ['#F2D04A', 2], ['#E8833A', 14], ['#9A4A8A', 30]].forEach(([col, xx]) => { for(let i = 0; i < 3; i++){ c.fillStyle = col; ell(c, xx + i * 3.4, 8 + (i % 2) * 2, 3.2, 3); c.fill(); } });
  const dog = WD.makeEnt({ kind: 'dog', eat: 1, happy: true }); dog.t = 1.2; c.save(); c.translate(-2, 6); c.scale(1.05, 1.05); WD.drawPuppet(c, dog); c.restore();
  c.save(); c.translate(-12, -4); c.rotate(-.3); c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, 14, 8); c.fillStyle = '#3E6FB5'; c.fillRect(0, 0, 14, 2.6); c.restore();
  c.fillStyle = '#E8B84A'; ell(c, 14, -2, 4, 4.4); c.fill();
  c.restore();
}
WD.PHOTOS.market = sightingMarket;

/* ================= drawing: Bogotá scenery ================= */
const R2 = rng(2026);
const BOG_CLOUDS = Array.from({ length: 7 }, (_, i) => ({ x: -500 + i * 260 + R2() * 120, y: -170 - R2() * 70, s: .5 + R2() * .5, v: 3 + R2() * 4 }));
const hilly = (x, seed, amp) => amp * (.62 + .22 * Math.sin(x * .009 + seed) + .12 * Math.sin(x * .023 + seed * 2.3) + .05 * Math.sin(x * .061 + seed));
function ridge(c, f, base, amp, col, seed){
  WD.setLayer(f); const L = WD.viewL, cx = WD.cam.x * f, x0 = cx - L - 60, x1 = cx + L + 60;
  c.fillStyle = col; c.beginPath(); c.moveTo(x0, base + 40);
  for(let x = x0; x <= x1 + 12; x += 12) c.lineTo(x, base - hilly(x, seed, amp));
  c.lineTo(x1 + 12, base + 40); c.closePath(); c.fill();
}
/* Monserrate: the green mountain over the city with its white sanctuary on top */
const MONS_X = 760;
function drawMonserrate(c, t, eve){
  WD.setLayer(.16);
  const x = MONS_X, base = -10;
  c.fillStyle = eve ? '#4E5E78' : '#5F8A72';
  c.beginPath(); c.moveTo(x - 260, base); c.quadraticCurveTo(x - 120, base - 120, x - 30, base - 236); c.lineTo(x + 30, base - 238); c.quadraticCurveTo(x + 120, base - 130, x + 260, base); c.closePath(); c.fill();
  c.fillStyle = eve ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(x - 30, base - 236); c.quadraticCurveTo(x - 60, base - 120, x - 150, base - 40); c.lineTo(x - 110, base - 40); c.quadraticCurveTo(x - 30, base - 140, x, base - 236); c.fill();
  // the sanctuary
  c.fillStyle = eve ? '#E8E0F0' : '#FFFDF6'; c.fillRect(x - 14, base - 252, 28, 16); c.fillRect(x - 4, base - 264, 8, 14); c.beginPath(); c.moveTo(x - 5, base - 264); c.lineTo(x, base - 271); c.lineTo(x + 5, base - 264); c.fill();
  c.fillStyle = TERRA; c.fillRect(x - 15, base - 254, 30, 3);
  if(eve){ c.fillStyle = 'rgba(255,230,150,.9)'; [[-8, -246], [0, -246], [8, -246]].forEach(([a, b]) => c.fillRect(x + a - 1, base + b, 2, 3)); }
  // the cable car line and a little red car going up
  c.strokeStyle = 'rgba(40,40,50,.55)'; c.lineWidth = .8; c.beginPath(); c.moveTo(x - 210, base - 10); c.lineTo(x - 18, base - 238); c.stroke();
  const u = (t * .03) % 1; c.fillStyle = '#C2453A'; rr(c, x - 210 + u * 192 - 4, base - 10 - u * 228, 8, 6, 1.5); c.fill();
}
function bogSky(t, dt, mode, high){
  const c = WD.ctx, v = WD.view; mode = mode || 'day';
  c.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  const hy = WD.horizonY(), g = c.createLinearGradient(0, 0, 0, Math.max(10, hy));
  if(mode === 'eve'){ g.addColorStop(0, '#2E2F66'); g.addColorStop(.55, '#B0607A'); g.addColorStop(1, '#F2A86A'); }
  else if(mode === 'storm'){ g.addColorStop(0, '#3E4A5E'); g.addColorStop(.6, '#7A8696'); g.addColorStop(1, '#C3CBD2'); }
  else { g.addColorStop(0, '#4A82CE'); g.addColorStop(.55, '#9CC3EA'); g.addColorStop(1, '#E6EFF2'); }
  c.fillStyle = g; c.fillRect(0, 0, v.w, Math.max(0, hy) + 4);
  if(mode === 'eve'){ c.fillStyle = 'rgba(255,240,200,.85)'; for(let i = 0; i < 18; i++){ const sx = (i * 97.3) % v.w, sy = (i * 41.7) % Math.max(20, hy * .45); c.globalAlpha = .4 + .4 * Math.sin(t * 2 + i); c.fillRect(sx, sy, 1.6, 1.6); } c.globalAlpha = 1; }
  WD.setLayer(.06); BOG_CLOUDS.forEach(cl => { cl.x += cl.v * dt; if(cl.x > WD.cam.x * .06 + WD.viewL + 150) cl.x -= WD.viewL * 2 + 400; c.globalAlpha = mode === 'eve' ? .45 : mode === 'storm' ? .9 : .85; WD.cloud(c, cl.x, cl.y, cl.s); c.globalAlpha = 1; });
  ridge(c, .1, -20, 170, mode === 'eve' ? '#5A5A86' : mode === 'storm' ? '#6C7686' : '#93AABF', 1.7);
  drawMonserrate(c, t, mode === 'eve');
  ridge(c, .24, 0, 70, mode === 'eve' ? '#4A4E70' : mode === 'storm' ? '#5E6878' : '#6F9478', 4.1);
  if(high) return;
  // the city: red-brick Bogotá
  WD.setLayer(.34); const L = WD.viewL, cx = WD.cam.x * .34;
  for(let x = Math.floor((cx - L - 80) / 34) * 34; x < cx + L + 80; x += 34){ const h = 26 + Math.abs(Math.sin(x * 12.9898) * 43758.5453 % 1) * 46, tall = Math.abs(Math.sin(x * 3.1)) > .93; const hh = tall ? h + 70 : h;
    c.fillStyle = mode === 'eve' ? shade(BRICK, -.45) : tall ? '#A9B4BE' : BRICK; c.fillRect(x, 4 - hh, 30, hh);
    c.fillStyle = mode === 'eve' ? 'rgba(255,220,140,.75)' : 'rgba(255,248,236,.45)'; for(let wy = 8; wy < hh - 6; wy += 9) for(let wx = 4; wx < 26; wx += 7) if((x + wy * 3 + wx) % 5 > 1) c.fillRect(x + wx, 4 - hh + wy, 3, 4); }
  c.fillStyle = mode === 'eve' ? 'rgba(80,70,120,.25)' : 'rgba(230,238,242,.35)'; c.fillRect(cx - L - 80, -60, L * 2 + 160, 64);
}
/* a two-storey colonial house: white walls, terracotta roof, wooden balcony, a flag */
function drawCasa(c, x, w, wall, t, o){
  o = o || {}; const base = 4, H = 112, trim = o.trim || '#2F5A3A';
  c.fillStyle = 'rgba(40,28,60,.18)'; c.fillRect(x - 4, base - 2, w + 8, 4);
  c.fillStyle = wall; c.fillRect(x, base - H, w, H);
  c.fillStyle = o.plinth || shade(wall, -.35); c.fillRect(x, base - 20, w, 20);
  c.fillStyle = TERRA; c.beginPath(); c.moveTo(x - 10, base - H); c.lineTo(x + w + 10, base - H); c.lineTo(x + w + 2, base - H - 16); c.lineTo(x - 2, base - H - 16); c.closePath(); c.fill();
  c.strokeStyle = shade(TERRA, -.25); c.lineWidth = 1; for(let tx = x - 6; tx < x + w + 8; tx += 6){ c.beginPath(); c.moveTo(tx, base - H); c.lineTo(tx + 1.5, base - H - 15); c.stroke(); }
  // balcony
  const by = base - 62;
  c.fillStyle = trim; c.fillRect(x + 8, by, w - 16, 4); c.fillRect(x + 8, by - 24, w - 16, 2.4);
  for(let bx = x + 10; bx < x + w - 8; bx += 6) c.fillRect(bx, by - 22, 1.6, 22);
  // windows behind the balcony + ground floor
  const nwin = Math.max(1, Math.round((w - 20) / 44));
  for(let i = 0; i < nwin; i++){ const wx = x + 14 + i * (w - 28) / nwin + ((w - 28) / nwin - 22) / 2;
    c.fillStyle = '#3A2E3A'; rr(c, wx, by - 40, 22, 30, [8, 8, 0, 0]); c.fill(); c.fillStyle = trim; c.fillRect(wx - 4, by - 42, 4, 32); c.fillRect(wx + 22, by - 42, 4, 32);
    if(o.lit){ c.fillStyle = 'rgba(255,214,140,.75)'; rr(c, wx + 2, by - 38, 18, 26, [7, 7, 0, 0]); c.fill(); } }
  // flower pots on the balcony
  for(let px = x + 16; px < x + w - 14; px += 22){ c.fillStyle = TERRA; c.fillRect(px, by - 6, 8, 6); c.fillStyle = '#3F8A4A'; ell(c, px + 4, by - 8, 6, 3.4); c.fill(); c.fillStyle = ['#E8593C', '#E86F79', YEL][(px / 22 | 0) % 3]; [[-3, -10], [1, -11], [5, -9]].forEach(([a, b]) => { ell(c, px + 4 + a, by + b, 1.6, 1.6); c.fill(); }); }
  // door
  if(o.door !== false){ const dx = x + (o.doorAt !== undefined ? o.doorAt : w / 2) - 15; c.fillStyle = shade(trim, -.1); rr(c, dx - 3, base - 52, 36, 52, [16, 16, 0, 0]); c.fill(); c.fillStyle = o.doorCol || '#7A4A2E'; rr(c, dx, base - 49, 30, 49, [14, 14, 0, 0]); c.fill(); c.strokeStyle = shade(o.doorCol || '#7A4A2E', -.3); c.lineWidth = 1; c.beginPath(); c.moveTo(dx + 15, base - 49); c.lineTo(dx + 15, base); c.stroke(); c.fillStyle = GOLD; ell(c, dx + 12, base - 22, 1.4, 1.4); c.fill(); ell(c, dx + 18, base - 22, 1.4, 1.4); c.fill();
    if(o.num){ c.fillStyle = '#FFFDF6'; rr(c, dx + 8, base - 62, 14, 8, 1.5); c.fill(); c.fillStyle = BLU; c.font = '900 5.5px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.num, dx + 15, base - 57.6); } }
  // barred window down below
  if(o.win !== false){ const wx = x + (o.doorAt !== undefined && o.doorAt < w / 2 ? w - 44 : 14); c.fillStyle = '#3A2E3A'; c.fillRect(wx, base - 46, 28, 22); c.strokeStyle = '#1E1A1E'; c.lineWidth = 1.2; for(let i = 1; i < 6; i++){ c.beginPath(); c.moveTo(wx + i * 4.7, base - 46); c.lineTo(wx + i * 4.7, base - 24); c.stroke(); } if(o.lit){ c.fillStyle = 'rgba(255,214,140,.45)'; c.fillRect(wx, base - 46, 28, 22); } }
  if(o.flag) drawFlag(c, x + w - 18, by - 52, 26, t, { poleH: 54, ph: x });
  if(o.sign){ c.fillStyle = o.signBg || '#FFFDF6'; rr(c, x + w / 2 - o.sign.length * 3.2 - 8, base - 88, o.sign.length * 6.4 + 16, 13, 3); c.fill(); c.fillStyle = o.signCol || RED; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.sign, x + w / 2, base - 81.4); }
}
/* cobblestone street (La Candelaria style) with a stone sidewalk */
function drawCobbles(c, o){
  o = o || {}; const cam = WD.cam, half = WD.view.w / (2 * WD.view.S * cam.z), x0 = cam.x - half - 40, x1 = cam.x + half + 40;
  c.fillStyle = o.walk || '#CFC6B6'; c.fillRect(x0, 0, x1 - x0, 34);
  c.strokeStyle = 'rgba(90,80,70,.25)'; c.lineWidth = .8; for(let x = Math.floor(x0 / 22) * 22; x < x1; x += 22){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 34); c.stroke(); } c.beginPath(); c.moveTo(x0, 17); c.lineTo(x1, 17); c.stroke();
  c.fillStyle = '#9A9086'; c.fillRect(x0, 34, x1 - x0, 4);
  c.fillStyle = o.road || '#8A8076'; c.fillRect(x0, 38, x1 - x0, 1600);
  const R0 = rng(5); c.fillStyle = 'rgba(255,255,255,.08)';
  for(let r = 0; r < 14; r++){ const y = 42 + r * 9; for(let x = Math.floor(x0 / 12) * 12 + (r % 2) * 6; x < x1; x += 12){ ell(c, x, y, 5.2, 3.6); c.fill(); } }
  c.fillStyle = 'rgba(60,50,40,.18)'; for(let r = 0; r < 14; r++){ const y = 45 + r * 9; for(let x = Math.floor(x0 / 12) * 12 + (r % 2) * 6; x < x1; x += 12){ c.fillRect(x - 5, y, 10, .8); } }
  if(o.gutter !== false){ c.fillStyle = 'rgba(60,70,80,.35)'; c.fillRect(x0, 104, x1 - x0, 5); }
}
function drawTaxi(c, x, y, t, s, honk){
  s = s || 1; c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,28,60,.22)'; ell(c, 0, 2, 46, 5); c.fill();
  c.fillStyle = '#F2C21A'; c.beginPath(); c.moveTo(-44, -6); c.lineTo(-40, -22); c.lineTo(-22, -24); c.lineTo(-12, -38); c.lineTo(18, -38); c.lineTo(30, -24); c.lineTo(44, -20); c.lineTo(46, -6); c.closePath(); c.fill();
  c.fillStyle = '#9CC3EA'; c.beginPath(); c.moveTo(-9, -35); c.lineTo(1, -35); c.lineTo(1, -25); c.lineTo(-17, -25); c.closePath(); c.fill(); c.beginPath(); c.moveTo(4, -35); c.lineTo(16, -35); c.lineTo(25, -25); c.lineTo(4, -25); c.closePath(); c.fill();
  c.fillStyle = '#2B1D14'; for(let i = 0; i < 9; i++) if(i % 2 === 0) c.fillRect(-40 + i * 9.4, -16, 9.4, 3);
  c.fillStyle = '#FFFDF6'; rr(c, -6, -44, 18, 6, 2); c.fill(); c.fillStyle = '#2B1D14'; c.font = '900 4.6px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TAXI', 3, -40.8);
  c.fillStyle = '#FFF8C0'; ell(c, 43, -14, 2.6, 2.2); c.fill(); c.fillStyle = '#E8593C'; c.fillRect(-45, -16, 3, 4);
  [-28, 28].forEach(wx => { c.fillStyle = '#26242A'; ell(c, wx, -5, 8, 8); c.fill(); c.fillStyle = '#B9BCC2'; ell(c, wx, -5, 3.4, 3.4); c.fill(); });
  // little flag on the antenna
  c.strokeStyle = '#2B1D14'; c.lineWidth = .8; c.beginPath(); c.moveTo(-30, -22); c.lineTo(-32, -52); c.stroke(); drawFlag(c, -32, -52, 12, t, { pole: false });
  if(honk){ c.strokeStyle = '#FFF8EC'; c.lineWidth = 1.4; [0, 1, 2].forEach(i => { c.beginPath(); c.arc(50, -14, 6 + i * 5, -.6, .6); c.stroke(); }); }
  c.restore();
}
function drawTienda(c, x, t){
  drawCasa(c, x, 150, '#F6E7C8', t, { trim: '#C2453A', doorAt: 40, doorCol: '#C2453A', sign: 'TIENDA DOÑA GLORIA', signCol: BLU, win: false });
  // the counter window with snacks
  c.fillStyle = '#3A2E3A'; c.fillRect(x + 70, -40, 64, 30); c.fillStyle = '#C2453A'; c.fillRect(x + 66, -44, 72, 5); for(let i = 0; i < 6; i++){ c.fillStyle = i % 2 ? '#FFFDF6' : '#C2453A'; c.beginPath(); c.moveTo(x + 66 + i * 12, -44); c.lineTo(x + 78 + i * 12, -44); c.lineTo(x + 72 + i * 12, -36); c.fill(); }
  [[78, '#E2A84A'], [92, '#E2A84A'], [106, '#F4DA9C'], [120, '#7A4A2E']].forEach(([dx, col]) => { c.fillStyle = col; ell(c, x + dx, -16, 5, 3); c.fill(); });
  c.fillStyle = '#FFFDF6'; c.fillRect(x + 72, -28, 10, 8); c.fillStyle = '#3A1E12'; c.fillRect(x + 73, -28, 8, 2);
  c.fillStyle = '#FFFDF6'; rr(c, x + 140, -30, 34, 30, 2); c.fill(); c.fillStyle = '#2B1D14'; c.font = '900 4.6px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('TINTO $1.000', x + 157, -22); c.fillText('EMPANADA', x + 157, -14); c.fillText('OBLEAS', x + 157, -7);
}
function drawCancha(c, x, t){
  c.fillStyle = '#3F8A4A'; c.fillRect(x, -6, 260, 10); c.fillStyle = '#5A9E58'; c.fillRect(x, -4, 260, 8);
  c.strokeStyle = '#E6EEF2'; c.lineWidth = 2; c.strokeRect(x + 30, -80, 70, 76); c.beginPath(); for(let i = 1; i < 7; i++){ c.moveTo(x + 30 + i * 10, -80); c.lineTo(x + 30 + i * 10, -4); } for(let j = 1; j < 7; j++){ c.moveTo(x + 30, -80 + j * 11); c.lineTo(x + 100, -80 + j * 11); } c.lineWidth = .5; c.stroke();
  c.strokeStyle = '#E6EEF2'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 30, -2); c.lineTo(x + 30, -80); c.lineTo(x + 100, -80); c.lineTo(x + 100, -2); c.stroke();
  c.fillStyle = '#C2453A'; c.fillRect(x + 196, -120, 4, 118); c.fillStyle = '#FFFDF6'; c.fillRect(x + 170, -128, 34, 22); c.strokeStyle = '#E8593C'; c.lineWidth = 1.4; c.strokeRect(x + 180, -122, 14, 10); c.strokeStyle = '#E8593C'; c.lineWidth = 1.6; ell(c, x + 172, -104, 8, 2.4); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = .6; for(let i = 0; i < 5; i++){ c.beginPath(); c.moveTo(x + 164 + i * 3, -103); c.lineTo(x + 166 + i * 2.4, -94); c.stroke(); }
  drawBunting(c, x + 20, x + 220, -110, 10, t);
}
/* a La Candelaria-style mural */
function drawMural(c, x, t){
  c.fillStyle = '#F2EADB'; c.fillRect(x, -112, 220, 116); c.fillStyle = TERRA; c.fillRect(x - 6, -120, 232, 8);
  const g = c.createLinearGradient(x, -100, x + 220, 0); g.addColorStop(0, '#3E8FC7'); g.addColorStop(.5, '#7A3E9A'); g.addColorStop(1, '#E8593C'); c.fillStyle = g; rr(c, x + 6, -104, 208, 100, 6); c.fill();
  c.fillStyle = YEL; c.beginPath(); c.arc(x + 170, -70, 22, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; for(let i = 0; i < 10; i++){ c.save(); c.translate(x + 170, -70); c.rotate(i * .63 + t * .1); c.fillRect(24, -1.5, 12, 3); c.restore(); }
  c.save(); c.translate(x + 80, -54); c.scale(.5, .5); drawCondor(c, { t: 1, z: 20 }); c.restore();
  c.fillStyle = '#7CD86A'; for(let i = 0; i < 8; i++){ ell(c, x + 16 + i * 26, -8, 16, 8); c.fill(); }
  c.fillStyle = '#FFFDF6'; c.font = '900 20px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#2B1D14'; c.strokeText('BOGOTÁ', x + 110, -88); c.fillText('BOGOTÁ', x + 110, -88);
  c.font = '900 7px Grandstander, system-ui'; c.fillStyle = YEL; c.fillText('2.600 metros más cerca de las estrellas', x + 110, -72);
}
/* Sunday ciclovía: bikes rolling by in the background */
const RIDERS = Array.from({ length: 4 }, (_, i) => ({ x: i * 520, v: 40 + i * 9, col: ['#E8593C', '#3E8FC7', '#7CB86A', '#E86F79'][i] }));
function drawRiders(c, dt, x0, x1){
  RIDERS.forEach((r, i) => { r.x += r.v * dt; if(r.x > x1) r.x = x0;
    const x = r.x, y = 26 - i % 2 * 4; c.strokeStyle = '#2B1D14'; c.lineWidth = 1.2; [-8, 8].forEach(dx => { c.beginPath(); c.arc(x + dx, y, 5, 0, 7); c.stroke(); });
    c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x, y - 6); c.lineTo(x + 8, y); c.moveTo(x, y - 6); c.lineTo(x - 2, y - 12); c.stroke();
    c.fillStyle = r.col; rr(c, x - 4, y - 24, 7, 12, 3); c.fill(); c.fillStyle = '#D3A07A'; ell(c, x, y - 28, 3.4, 3.6); c.fill(); c.fillStyle = r.col; c.beginPath(); c.arc(x, y - 29, 4, Math.PI, 0); c.fill(); });
}
function drawCathedral(c, x, t){
  const w = 380, base = 4, stone = '#D9CBB0', dark = '#B9A888';
  c.fillStyle = stone; c.fillRect(x, base - 170, w, 174);
  [[x - 20, 60], [x + w - 40, 60]].forEach(([tx, tw]) => { c.fillStyle = stone; c.fillRect(tx, base - 250, tw, 254); c.fillStyle = dark; c.fillRect(tx, base - 250, tw, 6); c.fillRect(tx, base - 180, tw, 4);
    c.fillStyle = '#3A3240'; rr(c, tx + 18, base - 236, 24, 40, [12, 12, 0, 0]); c.fill(); c.fillStyle = GOLD; ell(c, tx + 30, base - 206, 6, 7); c.fill();
    c.fillStyle = stone; c.beginPath(); c.moveTo(tx - 4, base - 250); c.lineTo(tx + tw / 2, base - 286); c.lineTo(tx + tw + 4, base - 250); c.closePath(); c.fill(); c.fillStyle = dark; c.fillRect(tx + tw / 2 - 1.2, base - 304, 2.4, 18); c.fillRect(tx + tw / 2 - 6, base - 298, 12, 2.4); });
  c.fillStyle = dark; c.beginPath(); c.moveTo(x + 40, base - 170); c.lineTo(x + w / 2, base - 214); c.lineTo(x + w - 40, base - 170); c.closePath(); c.fill();
  c.fillStyle = stone; c.beginPath(); c.moveTo(x + 52, base - 172); c.lineTo(x + w / 2, base - 206); c.lineTo(x + w - 52, base - 172); c.closePath(); c.fill();
  for(let i = 0; i < 6; i++){ const cx = x + 50 + i * 56; c.fillStyle = '#E9DDC4'; c.fillRect(cx, base - 160, 12, 160); c.fillStyle = dark; c.fillRect(cx - 3, base - 164, 18, 6); c.fillRect(cx - 3, base - 6, 18, 6); }
  c.fillStyle = '#5A3A24'; rr(c, x + w / 2 - 26, base - 92, 52, 92, [26, 26, 0, 0]); c.fill(); c.fillStyle = '#7A4A2E'; rr(c, x + w / 2 - 22, base - 88, 44, 88, [22, 22, 0, 0]); c.fill(); c.strokeStyle = '#4A2E1A'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, base - 88); c.lineTo(x + w / 2, base); c.stroke();
  c.fillStyle = '#C9B9E6'; c.beginPath(); c.arc(x + w / 2, base - 128, 16, 0, 7); c.fill(); c.strokeStyle = dark; c.lineWidth = 2; c.stroke(); c.beginPath(); for(let i = 0; i < 6; i++){ c.moveTo(x + w / 2, base - 128); c.lineTo(x + w / 2 + Math.cos(i * 1.05) * 16, base - 128 + Math.sin(i * 1.05) * 16); } c.lineWidth = 1; c.stroke();
  c.fillStyle = '#B9A888'; c.fillRect(x - 30, base - 6, w + 60, 10);
}
function drawStall(c, x, col, fruit, t){
  c.fillStyle = '#7A5234'; c.fillRect(x + 4, -60, 4, 64); c.fillRect(x + 92, -60, 4, 64);
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 6, -66); c.lineTo(x + 106, -66); c.lineTo(x + 100, -52); c.lineTo(x, -52); c.closePath(); c.fill();
  for(let i = 0; i < 8; i++){ c.fillStyle = i % 2 ? '#FFFDF6' : col; c.beginPath(); c.moveTo(x + i * 13, -52); c.lineTo(x + 13 + i * 13, -52); c.lineTo(x + 6.5 + i * 13, -45); c.fill(); }
  c.fillStyle = '#A0703A'; c.fillRect(x, -26, 100, 30); c.fillStyle = '#8A5A2E'; c.fillRect(x, -26, 100, 4);
  const R0 = rng(x | 0); fruit.forEach((f, i) => { for(let k = 0; k < 7; k++){ c.fillStyle = f; ell(c, x + 8 + i * 30 + R0() * 18, -28 - R0() * 6, 4, 3.6); c.fill(); } });
}
function drawStatue(c, x, t){
  c.fillStyle = '#B9A888'; c.fillRect(x - 30, -10, 60, 14); c.fillStyle = '#C9B99A'; c.fillRect(x - 20, -70, 40, 62); c.fillStyle = '#B9A888'; c.fillRect(x - 24, -74, 48, 6);
  c.fillStyle = '#4E6A5E'; c.beginPath(); c.moveTo(x - 10, -74); c.lineTo(x - 12, -120); c.quadraticCurveTo(x, -130, x + 12, -120); c.lineTo(x + 10, -74); c.closePath(); c.fill(); ell(c, x, -136, 9, 10); c.fill();
  c.strokeStyle = '#4E6A5E'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 8, -118); c.lineTo(x + 22, -140); c.stroke();
  [[-5, -147], [8, -150]].forEach(([a, b], i) => { const hop = Math.max(0, Math.sin(t * 2 + i * 3)) * 2; c.fillStyle = '#9AA1AE'; ell(c, x + a, b - hop, 4, 3); c.fill(); c.fillStyle = '#7C8392'; ell(c, x + a + 3, b - 3 - hop, 2.2, 2.2); c.fill(); });
}
function drawPigeonFlock(c, x0, n, t){ for(let i = 0; i < n; i++){ const x = x0 + (i * 37) % 200, y = 52 + (i * 23) % 40, pk = Math.sin(t * 3 + i) > .7 ? 2 : 0; c.fillStyle = '#9AA1AE'; ell(c, x, y - 4 + pk * .3, 5, 3.4); c.fill(); c.fillStyle = '#7C8392'; ell(c, x + 4, y - 7 + pk, 2.4, 2.2); c.fill(); c.fillStyle = '#E8836A'; c.fillRect(x - 1, y - 1, 1, 1.6); c.fillRect(x + 1, y - 1, 1, 1.6); } }
function drawObleaCart(c, x, t){
  c.fillStyle = '#FFFDF6'; rr(c, x - 30, -40, 60, 34, 3); c.fill(); c.fillStyle = RED; c.fillRect(x - 30, -40, 60, 6); c.fillStyle = BLU; c.fillRect(x - 30, -12, 60, 6);
  c.fillStyle = '#2B1D14'; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OBLEAS', x, -23);
  [[-20, 0], [20, 0]].forEach(([dx]) => { c.fillStyle = '#26242A'; ell(c, x + dx, -3, 6, 6); c.fill(); });
  c.fillStyle = YEL; c.beginPath(); c.moveTo(x - 34, -52); c.quadraticCurveTo(x, -76, x + 34, -52); c.closePath(); c.fill(); c.fillStyle = '#7A5234'; c.fillRect(x - 1, -54, 2, 14);
}
function drawGoldMuseumSign(c, x, t){
  c.fillStyle = '#2E2A26'; c.fillRect(x, -96, 150, 100); c.fillStyle = '#3E3832'; for(let i = 0; i < 6; i++) c.fillRect(x + 6 + i * 24, -90, 16, 86);
  c.fillStyle = GOLD; c.font = '900 9px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MUSEO DEL ORO', x + 75, -82);
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,214,120,${.2 + .1 * Math.sin(t * 2)})`; ell(c, x + 75, -44, 40, 30); c.fill(); c.restore();
  drawFrog(c, x + 75, -44, 1.6);
}
/* home sweet abuela's home */
function drawCasaElsa(c, t){
  c.fillStyle = '#F3D9B1'; c.fillRect(-90, -260, 1500, 282); c.fillStyle = '#E9C99A'; c.fillRect(-90, -60, 1500, 4);
  c.fillStyle = 'rgba(255,255,255,.12)'; for(let x = -90; x < 1410; x += 24) c.fillRect(x, -260, 10, 200);
  // floor
  const fg = c.createLinearGradient(0, 20, 0, 220); fg.addColorStop(0, '#C98A55'); fg.addColorStop(1, '#9A6236'); c.fillStyle = fg; c.fillRect(-90, 20, 1500, 420);
  c.strokeStyle = 'rgba(80,40,20,.25)'; c.lineWidth = 1; for(let y = 30; y < 200; y += 14){ c.beginPath(); c.moveTo(-90, y); c.lineTo(1410, y); c.stroke(); }
  c.fillStyle = '#FFF8EC'; c.fillRect(-90, 14, 1500, 7);
  // living room: sofa, family photos, flag, a cross
  c.fillStyle = '#7A3E52'; rr(c, 60, -46, 190, 50, 12); c.fill(); c.fillStyle = '#93506A'; rr(c, 70, -64, 170, 30, 10); c.fill(); rr(c, 52, -46, 22, 46, 8); c.fill(); rr(c, 236, -46, 22, 46, 8); c.fill();
  c.fillStyle = '#E9D9B8'; rr(c, 80, -36, 40, 14, 5); c.fill(); rr(c, 190, -36, 40, 14, 5); c.fill();
  [[90, -104, '#E8593C'], [150, -116, '#3E8FC7'], [210, -102, '#7CB86A']].forEach(([x, y, col]) => { c.fillStyle = '#7A5234'; c.fillRect(x - 20, y - 18, 40, 32); c.fillStyle = col; c.fillRect(x - 16, y - 14, 32, 24); c.fillStyle = '#FFF8EC'; ell(c, x - 4, y - 4, 4, 4); c.fill(); ell(c, x + 6, y - 2, 4, 4); c.fill(); });
  drawFlag(c, 540, -134, 50, t, { pole: false });
  c.fillStyle = '#7A5234'; c.fillRect(342, -150, 5, 28); c.fillRect(335, -142, 19, 5);
  c.save(); c.translate(0, 68);
  c.fillStyle = '#FFFDF6'; rr(c, 420, -200, 90, 46, 4); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(422, -198, 86, 42); c.fillStyle = '#5A3A24'; c.font = '800 6px Nunito, system-ui'; c.textAlign = 'center'; c.fillText('“Jehová es mi pastor;', 465, -182); c.fillText('nada me faltará.”', 465, -172); c.fillText('Salmo 23:1', 465, -162);
  c.restore();
  c.fillStyle = '#3A3A44'; rr(c, 300, -110, 90, 58, 4); c.fill(); c.fillStyle = '#5E8AC4'; c.fillRect(306, -104, 78, 46); c.fillStyle = YEL; ell(c, 345, -82, 9, 9); c.fill(); c.fillStyle = '#7A5234'; c.fillRect(296, -52, 98, 8);
  // the kitchen
  c.fillStyle = '#E9E2D2'; c.fillRect(640, -140, 700, 120); c.fillStyle = '#5BB5B0'; for(let x = 640; x < 1340; x += 16) for(let y = -140; y < -20; y += 16) if(((x + y) / 16) % 2 === 0) c.fillRect(x, y, 16, 16);
  c.fillStyle = '#FFFDF6'; c.fillRect(640, -56, 520, 60); c.fillStyle = '#C98A55'; c.fillRect(636, -60, 528, 6);
  // window with Monserrate
  c.save(); c.translate(0, 84);
  c.fillStyle = '#9CC3EA'; c.fillRect(760, -230, 140, 80); c.fillStyle = '#5F8A72'; c.beginPath(); c.moveTo(760, -150); c.quadraticCurveTo(810, -170, 830, -214); c.lineTo(840, -214); c.quadraticCurveTo(860, -170, 900, -150); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(830, -222, 10, 7); c.strokeStyle = '#7A5234'; c.lineWidth = 5; c.strokeRect(760, -230, 140, 80); c.lineWidth = 3; c.beginPath(); c.moveTo(830, -230); c.lineTo(830, -150); c.stroke();
  c.restore();
  // stove + the big pot
  c.fillStyle = '#C9CCCF'; c.fillRect(940, -60, 100, 64); c.fillStyle = '#2B2B33'; c.fillRect(944, -64, 92, 6);
  c.fillStyle = '#9AA0A6'; rr(c, 956, -96, 50, 34, 6); c.fill(); c.fillStyle = '#7A8590'; c.fillRect(950, -98, 62, 5);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for(let i = 0; i < 3; i++){ const u = (t * .5 + i * .33) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.moveTo(966 + i * 14, -100 - u * 30); c.quadraticCurveTo(972 + i * 14, -110 - u * 30, 966 + i * 14, -120 - u * 30); c.stroke(); } c.globalAlpha = 1;
  // arepa griddle
  c.fillStyle = '#2B2B33'; ell(c, 1080, -64, 30, 6); c.fill(); c.fillStyle = '#F4DA9C'; [1068, 1088].forEach(x => { ell(c, x, -67, 9, 3.4); c.fill(); });
  // fridge
  c.save(); c.translate(0, 4); c.scale(1, .8); c.translate(0, -4);
  c.fillStyle = '#F4F1EA'; rr(c, 1180, -170, 70, 174, 6); c.fill(); c.strokeStyle = '#C9CCCF'; c.lineWidth = 2; c.beginPath(); c.moveTo(1180, -100); c.lineTo(1250, -100); c.stroke(); c.fillStyle = '#9AA0A6'; c.fillRect(1240, -160, 3, 30); c.fillRect(1240, -90, 3, 40);
  [[1196, -150, '#E8593C'], [1214, -140, YEL], [1200, -120, '#3E8FC7']].forEach(([x, y, col]) => { c.fillStyle = col; rr(c, x, y, 10, 8, 2); c.fill(); });
  c.restore();
  // dining table
  c.fillStyle = '#7A5234'; c.fillRect(520, -22, 6, 26); c.fillRect(600, -22, 6, 26); c.fillStyle = '#FFFDF6'; rr(c, 500, -30, 126, 10, 3); c.fill(); c.fillStyle = '#E86F79'; for(let i = 0; i < 6; i++) c.fillRect(504 + i * 20, -24, 8, 4);
  c.fillStyle = '#C98A55'; ell(c, 562, -36, 16, 5); c.fill(); [['#F2B33D', 552], ['#E8833A', 562], ['#9A4A8A', 572]].forEach(([col, x]) => { c.fillStyle = col; ell(c, x, -40, 5, 4.4); c.fill(); });
}
/* the mall: a row of clear storefronts, pillars with planters, and real things on display */
const MALL1 = [
  { name: 'MODA', col: '#E86F79', x: 240, w: 270, kind: 'moda' },
  { name: 'ZAPATOS', col: '#3E8FC7', x: 570, w: 230, kind: 'zapatos' },
  { name: '¡GRAN BARATA!', col: RED, x: 980, w: 260, kind: 'barata' },
  { name: 'RECUERDOS', col: '#D99A1E', x: 1300, w: 230, kind: 'recuerdos' },
  { name: 'ARTESANÍAS', col: '#7A4A2E', x: 1590, w: 230, kind: 'artesanias' }
];
const MALL2 = [
  { name: 'JUGUETES', col: '#E8593C', x: 170, w: 250, kind: 'juguetes' },
  { name: 'CAFÉ DE LA ABUELA', col: '#7A4A2E', x: 480, w: 250, kind: 'cafe' },
  { name: 'ROPA', col: '#3E8FC7', x: 790, w: 220, kind: 'ropa' },
  { name: 'MASCOTAS FELICES', col: '#4F9A4A', x: 1070, w: 340, kind: 'mascotas' }
];
function drawStore(c, s, t){
  const { x, w, col, name, kind } = s, top = -132;
  // sign + awning
  c.fillStyle = '#2B1D14'; rr(c, x - 3, top - 3, w + 6, 26, 5); c.fill(); c.fillStyle = col; rr(c, x, top, w, 20, 4); c.fill();
  c.fillStyle = '#FFFDF6'; c.font = '900 12px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, x + w / 2, top + 10.5);
  const ay = top + 24; for(let i = 0; i < Math.ceil(w / 18); i++){ c.fillStyle = i % 2 ? '#FFFDF6' : shade(col, .15); c.beginPath(); c.moveTo(x + i * 18, ay); c.lineTo(x + i * 18 + 18, ay); c.lineTo(x + i * 18 + 18, ay + 8); c.arc(x + i * 18 + 9, ay + 8, 9, 0, Math.PI); c.closePath(); c.fill(); }
  // shop front: wall, display window, glass door
  const fy = ay + 16, fh = 4 - fy, dw = 40, dx = x + w - dw - 14;
  c.fillStyle = shade(col, .72); c.fillRect(x, fy, w, fh);
  c.fillStyle = '#DCEBF2'; c.fillRect(x + 10, fy + 6, dx - x - 20, fh - 22); c.strokeStyle = '#9AA0A6'; c.lineWidth = 2; c.strokeRect(x + 10, fy + 6, dx - x - 20, fh - 22);
  const wx = x + 10, ww = dx - x - 20, wy = fy + 6, wh = fh - 22;
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); drawWindow(c, kind, wx, wy, ww, wh, t); c.restore();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(wx + 8, wy); c.lineTo(wx + 26, wy); c.lineTo(wx + 6, wy + wh); c.lineTo(wx - 12, wy + wh); c.fill();
  c.fillStyle = '#B9BCC2'; c.fillRect(dx - 2, fy + 4, dw + 4, fh - 4); c.fillStyle = 'rgba(200,225,240,.85)'; c.fillRect(dx, fy + 6, dw, fh - 6); c.fillStyle = '#7A8590'; c.fillRect(dx + dw - 8, fy + 34, 3, 16);
  c.fillStyle = '#9A9086'; c.fillRect(x, -2, w, 6);
}
function drawWindow(c, kind, x, y, w, h, t){
  const base = y + h, mid = x + w / 2;
  if(kind === 'moda' || kind === 'ropa'){ const n = Math.max(2, Math.floor(w / 46)); for(let i = 0; i < n; i++){ const mx = x + 24 + i * (w - 40) / (n - 1); c.fillStyle = '#C9B9A4'; c.fillRect(mx - 1, base - 12, 2, 12); c.fillStyle = '#E9DCC4'; ell(c, mx, base - 64, 6, 7); c.fill(); c.fillStyle = [YEL, '#E86F79', '#7CB86A', '#3E8FC7', '#9A4A8A'][i % 5]; c.beginPath(); c.moveTo(mx - 8, base - 56); c.lineTo(mx + 8, base - 56); c.lineTo(mx + 13, base - 14); c.lineTo(mx - 13, base - 14); c.closePath(); c.fill(); } }
  if(kind === 'zapatos'){ for(let r = 0; r < 3; r++){ c.fillStyle = '#C9A877'; c.fillRect(x + 6, base - 18 - r * 26, w - 12, 3); for(let i = 0; i < Math.floor((w - 20) / 26); i++){ c.fillStyle = ['#E8593C', '#2B1D14', '#FFFDF6', '#3E8FC7', '#E86F79'][(i + r) % 5]; rr(c, x + 12 + i * 26, base - 26 - r * 26, 18, 8, [6, 6, 2, 2]); c.fill(); } } }
  if(kind === 'barata'){ c.fillStyle = '#9AA0A6'; c.fillRect(x + 10, base - 70, w - 20, 3); for(let i = 0; i < Math.floor((w - 24) / 12); i++){ c.fillStyle = ['#E86F79', YEL, '#7CB86A', '#58AEDD'][i % 4]; rr(c, x + 14 + i * 12, base - 67, 10, 40, 2); c.fill(); } c.save(); c.translate(mid, base - 18); c.rotate(-.12); c.fillStyle = YEL; rr(c, -40, -12, 80, 22, 4); c.fill(); c.fillStyle = RED; c.font = '900 13px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('-50%', 0, 0); c.restore(); }
  if(kind === 'recuerdos'){ c.fillStyle = '#C9A877'; c.fillRect(x + 6, base - 34, w - 12, 3); c.fillRect(x + 6, base - 70, w - 12, 3); [['flag', 30, 1], ['tinto', 72, 1], ['frog', 114, 1], ['futbol', 30, 0], ['empanada', 72, 0], ['ccard', 114, 0]].forEach(([k, dx, r]) => { if(x + dx > x + w - 10) return; c.save(); c.translate(x + dx, base - 46 - r * 36); c.scale(1.2, 1.2); (ICON2[k] || (() => {}))(c, t); c.restore(); }); }
  if(kind === 'artesanias'){ for(let i = 0; i < Math.floor((w - 20) / 34); i++){ const hx = x + 22 + i * 34; c.strokeStyle = '#7A5234'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, y); c.lineTo(hx, y + 14); c.stroke(); c.fillStyle = ['#7A4A2E', '#B33F2A', '#3E6FB5'][i % 3]; rr(c, hx - 12, y + 14, 24, 40, 3); c.fill(); c.fillStyle = YEL; c.fillRect(hx - 12, y + 30, 24, 3); c.fillStyle = RED; c.fillRect(hx - 12, y + 36, 24, 3); } for(let i = 0; i < 3; i++){ c.fillStyle = '#C9A15A'; ell(c, x + 30 + i * 40, base - 10, 14, 9); c.fill(); c.strokeStyle = '#8A6A3A'; c.beginPath(); for(let k = -10; k <= 10; k += 4){ c.moveTo(x + 30 + i * 40 + k, base - 18); c.lineTo(x + 30 + i * 40 + k, base - 2); } c.stroke(); } }
  if(kind === 'juguetes'){ c.fillStyle = '#58AEDD'; rr(c, x + 10, base - 40, w - 20, 40, 10); c.fill(); const R0 = rng(4); for(let i = 0; i < 46; i++){ c.fillStyle = [YEL, '#E8593C', '#7CD86A', '#E86F79', '#FFFDF6'][i % 5]; ell(c, x + 18 + R0() * (w - 36), base - 34 + R0() * 26, 5, 5); c.fill(); } c.fillStyle = '#E8593C'; rr(c, x + 20, y + 10, 30, 24, 3); c.fill(); c.fillStyle = YEL; ell(c, x + w - 40, y + 26, 12, 12); c.fill(); }
  if(kind === 'cafe'){ c.fillStyle = '#7A4A2E'; c.fillRect(x + 6, base - 34, w - 12, 34); c.fillStyle = '#C9CCCF'; rr(c, x + 20, base - 64, 40, 30, 4); c.fill(); c.fillStyle = '#2B2B33'; c.fillRect(x + 28, base - 56, 24, 10); c.fillStyle = '#2B1D14'; rr(c, x + 80, y + 8, 80, 40, 3); c.fill(); c.fillStyle = '#FFFDF6'; c.font = '800 6px Nunito, system-ui'; c.textAlign = 'left'; ['TINTO ......... 2.000', 'CAFÉ CON LECHE 4.000', 'BUÑUELO ....... 2.500', 'PANDEBONO ..... 2.500'].forEach((l, i) => c.fillText(l, x + 84, y + 16 + i * 8)); c.textAlign = 'center'; [100, 130].forEach(dx => { c.fillStyle = '#FFFDF6'; c.fillRect(x + dx, base - 44, 10, 10); }); }
  if(kind === 'mascotas'){ c.fillStyle = '#9CD3E8'; rr(c, x + 14, base - 56, 70, 46, 4); c.fill(); c.fillStyle = '#E8833A'; [[34, -34], [60, -40], [48, -24]].forEach(([dx, dy], i) => { const fx = x + dx + Math.sin(t * 1.4 + i) * 6; ell(c, fx, base + dy, 5, 3); c.fill(); c.beginPath(); c.moveTo(fx - 4, base + dy); c.lineTo(fx - 9, base + dy - 3); c.lineTo(fx - 9, base + dy + 3); c.fill(); });
    c.fillStyle = '#C9A15A'; rr(c, x + 100, base - 70, 100, 70, 4); c.fill(); c.fillStyle = 'rgba(40,30,20,.55)'; c.fillRect(x + 106, base - 64, 88, 58); c.strokeStyle = '#7A5234'; c.lineWidth = 1.4; for(let bx = x + 108; bx < x + 196; bx += 8){ c.beginPath(); c.moveTo(bx, base - 64); c.lineTo(bx, base - 6); c.stroke(); }
    c.fillStyle = '#4F9A4A'; c.font = '900 9px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('🐾 ADOPTA 🐾', x + 150, base - 76); }
}
function drawPillar(c, x, t){
  c.fillStyle = '#E9E2D4'; c.fillRect(x - 10, -170, 20, 174); c.fillStyle = '#D6CDBC'; c.fillRect(x - 10, -170, 4, 174);
  drawFlag(c, x + 10, -146, 30, t, { pole: false });
  c.fillStyle = '#B9803A'; rr(c, x - 18, -16, 36, 20, 4); c.fill(); c.fillStyle = '#3F8A4A'; [[-10, -22, 12], [6, -26, 13], [0, -34, 11]].forEach(([dx, dy, r]) => { ell(c, x + dx, dy, r, r * .8); c.fill(); });
}
/* a little display table with the thing you can pick up sitting on it */
function drawDisplay(c, x, kind, t, gone){
  c.fillStyle = 'rgba(40,28,60,.18)'; ell(c, x, 52, 24, 5); c.fill();
  c.fillStyle = '#7A5234'; c.fillRect(x - 2, 26, 4, 24); c.fillRect(x - 12, 48, 24, 3);
  c.fillStyle = '#FFFDF6'; ell(c, x, 26, 22, 6); c.fill(); c.fillStyle = YEL; c.fillRect(x - 22, 26, 44, 5); c.fillStyle = BLU; c.fillRect(x - 21, 31, 42, 3); c.fillStyle = RED; c.fillRect(x - 20, 34, 40, 3);
  if(gone){ c.fillStyle = '#2B1D14'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('AGOTADO', x, 22); return; }
  c.save(); c.translate(x, 12 + Math.sin(t * 2 + x) * 1.2); c.scale(1.15, 1.15); (ICON2[kind] || (() => {}))(c, t); c.restore();
}
function drawMall(c, t, floor){
  const L = WD.viewL, cx = WD.cam.x, x0 = cx - L - 80, x1 = cx + L + 80;
  // walls, skylight band, ceiling lights
  c.fillStyle = '#F2EEE6'; c.fillRect(x0, -320, x1 - x0, 324);
  c.fillStyle = '#E2DACA'; c.fillRect(x0, -176, x1 - x0, 6);
  c.fillStyle = 'rgba(255,248,220,.5)'; for(let x = Math.floor(x0 / 160) * 160; x < x1; x += 160){ ell(c, x, -184, 22, 4); c.fill(); }
  (floor === 2 ? MALL2 : MALL1).forEach(s => drawStore(c, s, t));
  const pillars = floor === 2 ? [140, 455, 760, 1040] : [210, 540, 830, 1270, 1560];
  pillars.forEach(x => drawPillar(c, x, t));
  if(floor === 1){
    // entrance doors from the plaza
    c.fillStyle = '#B9BCC2'; c.fillRect(30, -150, 160, 154); c.fillStyle = 'rgba(200,225,240,.85)'; c.fillRect(38, -120, 70, 120); c.fillRect(112, -120, 70, 120);
    c.fillStyle = '#3E6FB5'; rr(c, 38, -146, 144, 20, 4); c.fill(); c.fillStyle = '#FFFDF6'; c.font = '900 11px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ENTRADA · PLAZA', 110, -135.5);
    // central fountain
    c.fillStyle = '#C9C0B0'; ell(c, 900, 30, 60, 12); c.fill(); c.fillStyle = '#9CD3E8'; ell(c, 900, 28, 52, 9); c.fill(); c.fillStyle = '#C9C0B0'; c.fillRect(894, -12, 12, 40);
    c.strokeStyle = 'rgba(200,235,250,.9)'; c.lineWidth = 2; for(let i = 0; i < 5; i++){ const a = -1.2 + i * .6, u = (t * 1.2 + i * .2) % 1; c.beginPath(); c.moveTo(900, -14); c.quadraticCurveTo(900 + Math.sin(a) * 30, -40, 900 + Math.sin(a) * 50, 26); c.stroke(); }
    // benches
    [[720, 40], [1100, 40]].forEach(([bx, by]) => { c.fillStyle = '#7A5234'; c.fillRect(bx - 30, by - 14, 60, 6); c.fillRect(bx - 30, by - 24, 60, 4); c.fillStyle = '#3A3A44'; c.fillRect(bx - 26, by - 8, 4, 12); c.fillRect(bx + 22, by - 8, 4, 12); });
  } else {
    // the escalator arriving from below
    c.fillStyle = '#9AA0A6'; c.beginPath(); c.moveTo(20, 4); c.lineTo(90, 4); c.lineTo(110, -30); c.lineTo(40, -30); c.closePath(); c.fill(); c.strokeStyle = '#2B2B33'; c.lineWidth = 4; c.beginPath(); c.moveTo(16, -14); c.lineTo(40, -50); c.stroke();
    c.fillStyle = '#2B1D14'; rr(c, 40, -110, 70, 18, 4); c.fill(); c.fillStyle = '#FFFDF6'; c.font = '900 9px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('▼ PISO 1', 75, -101);
  }
  // floor
  const fg = c.createLinearGradient(0, 4, 0, 240); fg.addColorStop(0, '#EDE6D8'); fg.addColorStop(1, '#C9C0B0'); c.fillStyle = fg; c.fillRect(x0, 4, x1 - x0, 420);
  c.strokeStyle = 'rgba(120,110,100,.16)'; c.lineWidth = 1; for(let x = Math.floor(x0 / 40) * 40; x < x1; x += 40){ c.beginPath(); c.moveTo(x, 4); c.lineTo(x * 1.06 - 20, 220); c.stroke(); } for(let y = 20; y < 220; y += 22){ c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.22)'; for(let x = Math.floor(x0 / 240) * 240; x < x1; x += 240) c.fillRect(x + 30, 30, 120, 6);
}
function drawEscalator(c, x, on, t){
  c.fillStyle = '#9AA0A6'; c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 40, 4); c.lineTo(x + 170, -150); c.lineTo(x + 130, -150); c.closePath(); c.fill();
  c.strokeStyle = '#6E737C'; c.lineWidth = 1; for(let i = 0; i < 12; i++){ const u = ((i / 12) + (on ? t * .15 : 0)) % 1; c.beginPath(); c.moveTo(x + u * 130, 4 - u * 154); c.lineTo(x + 40 + u * 130, 4 - u * 154); c.stroke(); }
  c.strokeStyle = '#2B2B33'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 4, -18); c.lineTo(x + 128, -172); c.stroke();
  if(!on){ c.fillStyle = '#E8593C'; rr(c, x + 40, -60, 64, 18, 3); c.fill(); c.fillStyle = '#FFFDF6'; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FUERA DE SERVICIO', x + 72, -51); }
}
function drawTrail(c, t, mode){
  const L = WD.viewL, cx = WD.cam.x;
  // cloud forest: eucalyptus and frailejones
  for(let x = Math.floor((cx - L - 100) / 140) * 140; x < cx + L + 100; x += 140){ const h = 96 + (Math.abs(Math.sin(x)) * 40); c.strokeStyle = '#C9B8A0'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 6, 4 - h); c.stroke(); c.fillStyle = mode === 'eve' ? '#3E5A4E' : '#5E8A6E'; ell(c, x + 6, 4 - h, 40, 26); c.fill(); ell(c, x - 18, 14 - h, 26, 18); c.fill(); ell(c, x + 30, 18 - h, 26, 18); c.fill(); }
  for(let x = Math.floor((cx - L) / 90) * 90 + 40; x < cx + L; x += 90){ c.fillStyle = '#7A8A5A'; c.fillRect(x - 2, -30, 4, 34); c.fillStyle = '#A9B88A'; ell(c, x, -36, 12, 10); c.fill(); c.fillStyle = YEL; ell(c, x, -46, 3, 3); c.fill(); }
  // the stone steps of the pilgrim path
  const fg = c.createLinearGradient(0, 4, 0, 200); fg.addColorStop(0, '#9A9086'); fg.addColorStop(1, '#6E665E'); c.fillStyle = fg; c.fillRect(cx - L - 60, 4, L * 2 + 120, 420);
  c.strokeStyle = 'rgba(40,30,20,.3)'; c.lineWidth = 1.2; for(let x = Math.floor((cx - L - 60) / 30) * 30; x < cx + L + 60; x += 30){ c.beginPath(); c.moveTo(x, 4); c.lineTo(x - 20, 220); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.08)'; for(let x = Math.floor((cx - L - 60) / 30) * 30; x < cx + L + 60; x += 30) c.fillRect(x - 10, 30, 22, 3);
  c.fillStyle = '#4E6A4E'; c.fillRect(cx - L - 60, 0, L * 2 + 120, 6);
}
function drawFog(t, a){ const c = WD.ctx, v = WD.view; c.setTransform(v.dpr, 0, 0, v.dpr, 0, 0); for(let i = 0; i < 4; i++){ const x = ((t * (8 + i * 4) + i * 300) % (v.w + 400)) - 200; const g = c.createRadialGradient(x, v.h * (.4 + i * .1), 10, x, v.h * (.4 + i * .1), 220); g.addColorStop(0, `rgba(240,244,248,${a})`); g.addColorStop(1, 'rgba(240,244,248,0)'); c.fillStyle = g; c.fillRect(0, 0, v.w, v.h); } }
function drawSanctuary(c, x, t, eve){
  c.fillStyle = '#FFFDF6'; c.fillRect(x, -150, 260, 154); c.fillStyle = '#EDE6DA'; c.fillRect(x, -150, 260, 8);
  c.fillStyle = '#FFFDF6'; c.fillRect(x + 100, -230, 60, 84); c.beginPath(); c.moveTo(x + 96, -230); c.lineTo(x + 130, -262); c.lineTo(x + 164, -230); c.closePath(); c.fill();
  c.fillStyle = TERRA; c.fillRect(x - 6, -154, 272, 6); c.fillStyle = GOLD; c.fillRect(x + 128, -284, 4, 24); c.fillRect(x + 122, -278, 16, 4);
  c.fillStyle = '#5A3A24'; rr(c, x + 110, -64, 40, 68, [20, 20, 0, 0]); c.fill();
  [[30, -110], [70, -110], [190, -110], [230, -110]].forEach(([dx, dy]) => { c.fillStyle = eve ? 'rgba(255,220,140,.9)' : '#3A3240'; rr(c, x + dx - 8, dy, 16, 30, [8, 8, 0, 0]); c.fill(); });
  c.fillStyle = eve ? 'rgba(255,220,140,.9)' : '#3A3240'; c.beginPath(); c.arc(x + 130, -196, 10, 0, 7); c.fill();
}
function drawCityBelow(c, t, eve){
  const L = WD.viewL, cx = WD.cam.x * .3; WD.setLayer(.3);
  c.fillStyle = eve ? '#2A2850' : '#8FA6B8'; c.fillRect(cx - L - 60, -30, L * 2 + 120, 40);
  const R0 = rng(8); for(let x = Math.floor((cx - L - 60) / 8) * 8; x < cx + L + 60; x += 8){ const h = 4 + Math.abs(Math.sin(x * 7.1)) * 18; c.fillStyle = eve ? '#3A3866' : shade(BRICK, .1); c.fillRect(x, -30 + 20 - h, 7, h); if(eve && Math.sin(x * 3.7) > 0){ c.fillStyle = 'rgba(255,214,120,.9)'; c.fillRect(x + 2, -26 + 20 - h, 2, 2); } }
}
/* the Collector's airship cargo hold (interlude 2) */
function drawCargo(c, t){
  c.fillStyle = '#3A3440'; c.fillRect(-90, -260, 1200, 282);
  c.strokeStyle = '#2A2430'; c.lineWidth = 10; for(let x = -60; x < 1100; x += 120){ c.beginPath(); c.moveTo(x, 20); c.quadraticCurveTo(x + 10, -140, x + 60, -260); c.stroke(); }
  c.fillStyle = '#C9A15A'; c.fillRect(-90, -50, 1200, 4);
  // portholes: the Andes slipping by, then only clouds
  [[300, -170], [520, -170], [740, -170]].forEach(([x, y], i) => { c.save(); c.beginPath(); c.arc(x, y, 30, 0, 7); c.clip(); const g = c.createLinearGradient(0, y - 30, 0, y + 30); g.addColorStop(0, '#7EB0E8'); g.addColorStop(1, '#D9EAFB'); c.fillStyle = g; c.fillRect(x - 40, y - 40, 80, 80);
    if(i === 0){ c.fillStyle = '#7E9C9A'; c.beginPath(); c.moveTo(x - 40, y + 30); c.lineTo(x - 14, y); c.lineTo(x + 4, y + 14); c.lineTo(x + 26, y - 6); c.lineTo(x + 40, y + 30); c.fill(); c.fillStyle = '#FFFDF6'; c.beginPath(); c.moveTo(x + 20, y); c.lineTo(x + 26, y - 6); c.lineTo(x + 32, y + 2); c.fill(); }
    for(let k = 0; k < 2; k++){ const cx2 = x - 60 + ((t * 22 + k * 60 + i * 40) % 120); WD.cloud(c, cx2, y + 14 - k * 16, .3); } c.restore(); c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 30, 0, 7); c.stroke(); });
  const fg = c.createLinearGradient(0, 20, 0, 220); fg.addColorStop(0, '#6E665E'); fg.addColorStop(1, '#4A443E'); c.fillStyle = fg; c.fillRect(-90, 20, 1200, 420);
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1; for(let x = -90; x < 1110; x += 40){ c.beginPath(); c.moveTo(x, 20); c.lineTo(x * 1.06, 220); c.stroke(); }
  c.fillStyle = '#FFF8EC'; c.fillRect(-90, 14, 1200, 6);
}

/* battle stages for Bogotá */
Object.assign(WD.BATTLE_BACKS, {
  bogota: { ground: '#8A8076', stage: ['#A88A6A', '#6E543A'], draw(t){ const c = WD.ctx; c.save(); c.translate(0, -16); drawCasa(c, -330, 170, '#FFFDF6', t, { flag: true, num: '7-23' }); drawCasa(c, -150, 150, '#F2D7A0', t, { trim: '#7A3E52', door: false }); drawCasa(c, 10, 160, '#BFE0D6', t, { flag: true, trim: '#3E6FB5' }); drawCasa(c, 180, 170, '#F7C9B4', t, { trim: '#2F5A3A' }); c.restore(); } },
  plaza: { ground: '#B9AE9C', stage: ['#C9BBA4', '#8E806A'], draw(t){ const c = WD.ctx; c.save(); c.translate(0, -16); c.scale(.8, .8); drawCathedral(c, -190, t); c.restore(); [-260, 250].forEach(x => drawFlag(c, x, -150, 40, t, { poleH: 140 })); drawBunting(c, -320, 320, -170, 18, t); } },
  mall: { ground: '#D9D2C4', stage: ['#E2DACA', '#B9AE9C'], draw(t){ const c = WD.ctx; c.save(); c.translate(-600, -16); drawMall(c, t, 1); c.restore(); } },
  petstore: { ground: '#D9D2C4', stage: ['#E2DACA', '#B9AE9C'], draw(t){ const c = WD.ctx; c.save(); c.translate(-260, -16); drawMall(c, t, 2); c.restore(); } },
  trail: { ground: '#6E665E', stage: ['#9A9086', '#6E665E'], draw(t){ const c = WD.ctx; c.save(); c.translate(0, -16); c.fillStyle = '#7E9C9A'; c.beginPath(); c.moveTo(-400, 0); c.lineTo(-200, -160); c.lineTo(0, -60); c.lineTo(180, -200); c.lineTo(400, 0); c.fill(); for(let x = -300; x < 320; x += 120){ c.strokeStyle = '#C9B8A0'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 6, -170); c.stroke(); c.fillStyle = '#5E8A6E'; ell(c, x + 6, -170, 44, 28); c.fill(); } c.restore(); } },
  summit: { ground: '#B9AE9C', stage: ['#D9CBB0', '#9A8C74'], draw(t){ const c = WD.ctx; const g = c.createLinearGradient(0, -260, 0, 0); g.addColorStop(0, '#2E2F66'); g.addColorStop(.6, '#B0607A'); g.addColorStop(1, '#F2A86A'); c.fillStyle = g; c.fillRect(-500, -600, 1000, 590); c.save(); c.translate(-130, -16); drawSanctuary(c, 0, t, true); c.restore(); WD.cloud(c, -300, -120, .8); WD.cloud(c, 180, -90, .7); drawFlag(c, 200, -170, 46, t, { poleH: 160 }); } },
  cargo: { ground: '#4A443E', stage: ['#6E665E', '#4A443E'], draw(t){ const c = WD.ctx; c.save(); c.translate(-520, -16); drawCargo(c, t); c.restore(); } }
});

/* ================= helpers ================= */
async function toyGet(k){
  const G = WD.G; if(G.toys.includes(k)) return;
  G.toys.push(k); S('toy_' + k); WD.sfx('squeak');
  const T = WD.TOYS[k]; await WD.itemGet(k, T.name, `${T.desc} (Bogotá toys ${WD.toyCount(2)[0]}/3)`);
  if(WD.toyCount(2)[0] === 3){ WD.giveItem('empanada', 2); WD.giveItem('tinto', 1); await WD.itemGet('star', 'All 3 Bogotá toys found!', 'Dayla’s toy box is almost full again. Bonus: two empanadas and a tinto.'); }
  WD.pingBag(); WD.saveNow();
}
async function pinGet(id){ WD.givePin(id); const P = WD.PINS[id]; await WD.itemGet(WD.pinIcon(id), P.name, `${P.desc} Costs ${P.pp} PP to wear.`, 'Pin'); WD.pingBag(); WD.saveNow(); }
const mkp = (name, x, y, dir, talkTo, o) => Object.assign(WD.makeEnt({ kind: 'human', look: WD.LOOKS[name], name, x, y, dir: dir || -1, light: o && o.light || 'day', talkTo }), o || {});
const mkFoe = (id, type, x, y, patrol, party, light) => Object.assign(WD.makeEnt({ kind: WD.FOES[type].kind, look: WD.FOES[type].look ? WD.CATS[WD.FOES[type].look] : null, name: WD.FOES[type].name, x, y, dir: -1, light: light || 'day' }), { fid: id, party, patrol });
const mkDog = (name, kind, x, y, o) => Object.assign(WD.makeEnt({ kind, name, x, y, dir: 1, light: 'indoor' }), o || {});
function healAll(){ const G = WD.G; G.hp = G.mhp; G.sp = G.msp; Object.values(G.party).forEach(P => P.hp = P.mhp); WD.sfx('heal'); }
const fight = (party, back, extra) => WD.battle(Object.assign({ foes: party, back, crowdCap: YEL }, extra || {}));

/* ================= goal line ================= */
function goal2(){
  let g = '';
  if(!F('c2_lunch')) g = 'Go inside Mami Elsa’s house';
  else if(!F('c2_church')) g = 'Meet Diana at the cathedral (the plaza, east of the barrio)';
  else if(!F('c2_fruit')) g = 'Ask around the plaza market about Dayla';
  else if(!F('c2_mall_in')) g = 'Meet Carolina at the mall (east end of the plaza)';
  else if(!F('c2_power')) g = 'The escalator is off. Find a way to turn the power back on';
  else if(!F('c2_lunita')) g = 'Go up to the second floor. The pet store is at the far end';
  else if(!F('c2_ajiaco')) g = 'Bring Lunita home to Mami Elsa';
  else if(!F('c2_cards')) g = 'Juandi knows about condors. Beat him at Criaturas (he’s at home)';
  else if(!F('c2_race')) g = 'Find Titin at his taxi. Race to Monserrate before the last cable car!';
  else if(!F('c2_gate2')) g = 'Climb the pilgrim path. Lunita can squeeze through gates';
  else if(!F('c2_boss')) g = 'Reach the summit of Monserrate';
  else if(!F('c2_photo')) g = 'Check the condor’s nest';
  else g = 'Chapter 2 complete! Explore Bogotá, or take Titin’s taxi anywhere';
  WD.setGoal(g);
}
function goalI2(){
  let g = 'Look around the cargo hold';
  if(!F('j_kairos')) g = 'Someone is sitting on that crate…';
  else if(!F('j_love')) g = 'That guard is blocking the snacks. Love Attack (B)!';
  else if(!F('j_cookies')) g = 'Something smells sweet in that crate';
  else if(!F('j_paw')) g = 'Find something to mark with a pawprint';
  else if(!F('j_mail')) g = 'Mail it somewhere it will be found';
  WD.setGoal(g);
}
const prevGoal2 = WD.chapterGoal;
WD.chapterGoal = ch => ch === 2 ? goal2() : ch === 'i2' ? goalI2() : prevGoal2 ? prevGoal2(ch) : null;

/* ================= AREA: the barrio street ================= */
WD.defineArea('bog_street', {
  ch: 2, name: 'Barrio La Candelaria', sub: 'Bogotá, Colombia', music: 'bogota', minX: 80, maxX: 2240, battleBack: 'bogota', camZ: 1.05,
  sniffNothing: 'Alejandro sniffs… arepas, rain on stone, and a little bit of pigeon.',
  exits: { right: { to: 'bog_plaza', x: 110, when: () => F('c2_lunch'), blocked: () => WD.cut(async () => { await me('Mami Elsa’s house first. If I don’t say hi, I’m in trouble.', { t: 'Primero donde Mami Elsa. Si no saludo, me matan.', es: 'Primero donde Mami Elsa. Si no saludo, me matan.' }, 'smirk'); }) } },
  npcs(){
    const n = [];
    NPC.gloria = mkp('Doña Gloria', 628, 46, -1, talkGloria); n.push(NPC.gloria);
    if(F('c2_lunch') && !(F('c2_race') && !F('c2_boss'))){ NPC.titin = mkp('Titin', 1010, 56, -1, talkTitin); n.push(NPC.titin); }
    if(F('c2_lunch')){ NPC.diego = mkp('Diego', 1230, 52, 1, talkDiego); n.push(NPC.diego); }
    return n;
  },
  foes(){
    const f = []; if(!F('c2_lunch')) return f;
    f.push(mkFoe('c2_s1', 'paloma', 1560, 62, [1460, 1680], ['paloma']));
    if(F('c2_church')) f.push(mkFoe('c2_s2', 'paloma', 1900, 54, [1800, 2040], ['paloma', 'paloma']));
    return f.filter(x => !F('beat_' + x.fid));
  },
  drawBack(t, dt){
    const c = WD.ctx;
    bogSky(t, dt, F('c2_ajiaco') && !F('c2_boss') ? 'eve' : 'day');
    WD.setLayer(.6); c.save(); c.translate(0, -6); drawRiders(c, dt, -400, 2200); c.restore();
    WD.setLayer(1); drawCobbles(c);
    const eve = F('c2_ajiaco') && !F('c2_boss');
    drawCasa(c, 120, 200, '#FFFDF6', t, { flag: true, num: '7-23', doorAt: 100, lit: eve });
    drawCasa(c, 340, 160, '#F2D7A0', t, { trim: '#7A3E52', lit: eve });
    drawTienda(c, 520, t);
    drawCasa(c, 720, 180, '#BFE0D6', t, { trim: '#3E6FB5', flag: true, lit: eve });
    drawTaxi(c, 940, 44, t, 1);
    drawCancha(c, 1080, t);
    drawMural(c, 1400, t);
    drawCasa(c, 1680, 200, '#F7C9B4', t, { trim: '#2F5A3A', flag: true, lit: eve });
    drawCasa(c, 1900, 180, '#FFFDF6', t, { trim: '#7A4A2E', lit: eve });
    [480, 1050, 1640].forEach(x => WD.drawLamp(c, x, 30));
  },
  drawFront(t){ WD.drawFront(t, ST_FRONT); },
  things(){
    const L = [];
    L.push({ x: 220, y: 50, label: 'Go inside', h: 110, act: () => { WD.sfx('door'); WD.gotoArea('bog_home', 130, 66, { dir: 1, from: 'bog_street' }); } });
    L.push({ x: 1500, y: 48, label: 'Mural', h: 110, act: () => WD.cut(async () => { await me('A huge mural. A condor over the mountains, and the words “2,600 metres closer to the stars.”', { t: '“Dos mil seiscientos metros más cerca de las estrellas.” Lo más lindo de Bogotá.', es: '“Dos mil seiscientos metros más cerca de las estrellas.” Lo más lindo de Bogotá.' }, 'happy'); if(D()) learnWord('estrellas', 'stars'); WD.saveNow(); WD.sfx('get'); WD.toast('Game saved'); }) });
    L.push({ x: 1180, y: 48, label: 'Cancha', h: 60, show: () => !F('c2_lunch'), act: () => WD.cut(async () => { await me('A tiny soccer field and a hoop. Of course.', { t: 'La canchita. Aquí jugaba Juandi de chiquito.', es: 'La canchita. Aquí jugaba Juandi de chiquito.' }, 'happy'); }) });
    return L;
  },
  async enter(from){
    if(!F('c2_intro')){ await introArrival(); return; }
    if(F('c2_boss') && F('int2_done') && !F('c2_bye')) return;
  }
});
const ST_FRONT = Array.from({ length: 10 }, (_, i) => ({ x: -60 + i * 260 + (i * 97) % 80, k: i % 3 ? 'bush' : 'frond', s: .7 + (i % 4) * .12 }));

/* ================= AREA: Mami Elsa's house ================= */
WD.defineArea('bog_home', {
  ch: 2, name: 'Casa de Mami Elsa', sub: 'Bogotá', music: 'abuela', light: 'indoor', minX: 90, maxX: 1260, laneTop: 46, laneBot: 92, camMin: -60, camMax: 1360, camZ: .86, battleBack: 'bogota',
  sniffNothing: 'Alejandro sniffs… ajiaco. Definitely ajiaco. He drools a little.',
  npcs(){
    const n = [], G = WD.G;
    NPC.elsa = mkp('Mami Elsa', 990, 58, -1, talkElsa, { light: 'indoor' }); n.push(NPC.elsa);
    if(F('c2_lunch') && !F('c2_mall_in')){ NPC.carolina = mkp('Carolina', 560, 56, 1, talkCarolina, { light: 'indoor' }); n.push(NPC.carolina); }
    if(!F('c2_cards') || F('c2_boss')){ NPC.juandi = mkp('Juandi', 420, 64, 1, talkJuandi, { light: 'indoor' }); n.push(NPC.juandi); }
    if(F('c2_lunch') && !F('c2_boss')){ NPC.diana = mkp('Diana', 680, 52, -1, talkDiana, { light: 'indoor' }); if(F('c2_church')) n.push(NPC.diana); }
    NPC.papu = mkDog('Papu', 'frenchie', 120, 60, { coat: 'grey', zzz: !F('c2_lunita'), talkTo: () => WD.cut(async () => { await say('Papu', F('c2_lunita') ? '(Papu snorts happily. His sister is home.)' : '(Papu is asleep on the sofa. He is snoring like a tiny motorbike.)', { ent: NPC.papu }); }) });
    NPC.moka = mkDog('Moka', 'frenchie', 220, 62, { coat: 'brown', zzz: !F('c2_lunita'), talkTo: () => WD.cut(async () => { await say('Moka', F('c2_lunita') ? '(Moka does a happy little spin.)' : '(Moka opens one eye, sees no food, and closes it again.)', { ent: NPC.moka }); }) });
    NPC.papu.y = 32; NPC.papu.zSort = -40; NPC.moka.y = 34; NPC.moka.zSort = -40;
    n.push(NPC.papu, NPC.moka);
    if(F('c2_boss') && F('int2_done')){ NPC.spouse = WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.spouse], name: WD.spouse, x: 760, y: 66, dir: -1, light: 'indoor', talkTo: talkSpouseHome }); n.push(NPC.spouse); NPC.titin2 = mkp('Titin', 860, 70, -1, talkTitin, { light: 'indoor' }); n.push(NPC.titin2); }
    return n;
  },
  drawBack(t){ const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#E9C99A'; c.fillRect(0, 0, WD.cv.width, WD.cv.height); WD.setLayer(1); drawCasaElsa(c, t); if(!F('toy_arepatoy')){ c.save(); c.translate(150, 2); c.rotate(-.2); c.scale(.8, .8); ICON2.arepatoy(c, t); c.restore(); } },
  things(){
    const L = [];
    L.push({ x: 110, y: 66, label: 'Go out', h: 90, act: () => { WD.sfx('door'); WD.gotoArea('bog_street', 220, 64, { dir: 1, from: 'bog_home' }); } });
    L.push({ x: 980, y: 50, label: 'Pot', h: 100, show: () => F('c2_lunch'), act: () => WD.cut(async () => { if(!F('c2_lunita')){ await me('A pot of ajiaco, simmering. Mami Elsa says it’s “for later.” For when we find them.', { t: 'Ajiaco… Mami Elsa siempre cocina cuando está preocupada.', es: 'Ajiaco… Mami Elsa siempre cocina cuando está preocupada.' }, 'sad'); } else if(F('c2_ajiaco')){ healAll(); await me('One more bowl of ajiaco. Fully restored.', { t: 'Otro platico de ajiaco. ¡Como nueva!', es: 'Otro platico de ajiaco. ¡Como nueva!' }, 'joy'); WD.saveNow(); } }) });
    L.push({ x: 465, y: 46, label: 'Verse', h: 120, act: () => WD.cut(async () => { await WD.narrate(D() ? '(A framed verse over the sofa: “Jehová es mi pastor; nada me faltará.” Psalm 23:1, “The LORD is my shepherd; I shall not want.”)' : '(El versículo de siempre, encima del sofá: “Jehová es mi pastor; nada me faltará.” Salmo 23:1.)'); }) });
    L.push({ x: 290, y: 46, label: 'Flag', h: 120, act: () => WD.cut(async () => { await me('Yellow for gold, blue for the two oceans, red for the people who fought for it. Juandi told me. Twice.', { t: 'Amarillo, azul y rojo. Mi bandera.', es: 'Amarillo, azul y rojo. Mi bandera.' }, 'happy'); }) });
    if(F('c2_lunita') && !F('toy_arepatoy')) L.push({ x: 160, y: 56, skill: 'p', who: 'lunita', label: 'Squeeze', h: 40, act: () => WD.cut(async () => { const a = W.partner; await WD.walkTo(a, 150, 40, 90); a.vis = false; WD.sfx('yap'); await WD.wait(900); a.vis = true; WD.emote(a, '!'); await lunita('(Lunita wriggles out from under the couch with something squeaky.)', 'happy'); await toyGet('arepatoy'); WD.updateGoal(); }) });
    return L;
  },
  async enter(from){
    if(F('c2_intro') && !F('c2_lunch')) await lunchScene();
    else if(F('c2_lunita') && !F('c2_ajiaco')) await homecoming();
    else if(from !== 'cargo' && F('c2_boss') && F('int2_done') && !F('c2_bye')) await goodbyeScene();
  }
});

/* ================= AREA: the plaza ================= */
WD.defineArea('bog_plaza', {
  ch: 2, name: 'La Plaza', sub: 'Pigeons, the cathedral, the market', music: 'plaza', minX: 80, maxX: 2300, battleBack: 'plaza', camZ: 1.0,
  sniffNothing: 'Alejandro sniffs… corn for the pigeons, granadilla, and old stone.',
  exits: { left: { to: 'bog_street', x: 2200 } },
  npcs(){
    const n = [];
    if(!F('c2_church')){ NPC.diana = mkp('Diana', 520, 58, 1, talkDiana); n.push(NPC.diana); }
    NPC.fruit = mkp('Fruit Seller', 1420, 48, -1, talkFruit); n.push(NPC.fruit);
    NPC.oblea = mkp('Oblea Seller', 1160, 50, -1, () => WD.cut(async () => { if(!F('c2_oblea')){ S('c2_oblea'); WD.giveItem('oblea', 2); await say('Oblea Seller', D() ? '¡Obleas con arequipe! (Wafers with caramel!) For you, two. ¡Bienvenido!' : '¡Obleas con arequipe! Para ti, dos, mi reina.', { expr: 'joy' }); await WD.itemGet('oblea', 'Obleas ×2', WD.ITEMS.oblea.desc); } else await say('Oblea Seller', D() ? '¡Vuelva pronto! (Come back soon!)' : '¡Vuelva pronto, mi reina!', { expr: 'happy' }); })); n.push(NPC.oblea);
    if(F('c2_fruit') && !F('c2_mall_in')){ NPC.carolina = mkp('Carolina', 2060, 60, -1, talkCarolina); n.push(NPC.carolina); }
    return n;
  },
  foes(){
    const f = []; if(!F('c2_church')) return f;
    f.push(mkFoe('c2_p1', 'paloma', 860, 62, [780, 980], ['paloma']));
    f.push(mkFoe('c2_p2', 'paloma', 1720, 58, [1640, 1860], ['paloma', 'paloma']));
    return f.filter(x => !F('beat_' + x.fid));
  },
  drawBack(t, dt){
    const c = WD.ctx; bogSky(t, dt, 'day');
    WD.setLayer(1);
    const cam = WD.cam, half = WD.view.w / (2 * WD.view.S * cam.z), x0 = cam.x - half - 40, x1 = cam.x + half + 40;
    c.fillStyle = '#C9BBA4'; c.fillRect(x0, 0, x1 - x0, 1600); c.strokeStyle = 'rgba(120,100,80,.25)'; c.lineWidth = 1; for(let x = Math.floor(x0 / 40) * 40; x < x1; x += 40){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x * 1.05, 300); c.stroke(); } for(let y = 10; y < 300; y += 20){ c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    drawCathedral(c, 300, t);
    for(let x = 120; x < 2300; x += 300) drawFlag(c, x, -150, 30, t, { poleH: 154, ph: x * .02 });
    drawBunting(c, 1200, 1650, -96, 14, t);
    drawStatue(c, 900, t); drawPigeonFlock(c, 760, 14, t);
    drawObleaCart(c, 1120, t);
    drawStall(c, 1240, RED, ['#F2B33D', '#E8833A', '#7CB86A'], t); drawStall(c, 1360, YEL, ['#9A4A8A', '#F2D04A', '#E8593C'], t); drawStall(c, 1480, BLU, ['#7CB86A', '#F2B33D', '#E86F79'], t);
    drawGoldMuseumSign(c, 1660, t);
    drawCasa(c, 1880, 360, '#F2EADB', t, { trim: '#3E6FB5', doorAt: 180, doorCol: '#9CC3EA', sign: 'CENTRO COMERCIAL', signCol: '#3E6FB5', flag: true, win: false });
  },
  drawFront(t){ WD.drawFront(t, ST_FRONT); },
  things(){
    const L = [];
    L.push({ x: 490, y: 48, label: F('c2_church') ? 'Cathedral' : 'Cathedral', h: 120, act: () => WD.cut(async () => { if(!F('c2_church')) return churchScene(); await me('The cathedral. Quiet inside, even with the whole plaza buzzing outside.', { t: 'La catedral. Siempre en paz.', es: 'La catedral. Siempre en paz.' }, 'happy'); }) });
    L.push({ x: 900, y: 50, label: 'Statue', h: 130, act: () => WD.cut(async () => { await me('A general on a pedestal, covered in pigeons. The pigeons look like they’re in charge.', { t: 'El general y sus palomas. Las palomas mandan aquí.', es: 'El general y sus palomas. Las palomas mandan aquí.' }, 'smirk'); }) });
    L.push({ x: 1735, y: 48, label: 'Gold', h: 110, act: () => WD.cut(async () => { await me('The gold museum. Thousands of tiny gold pieces made long before Colombia was Colombia. Frogs, birds, little rafts… ', { t: 'El Museo del Oro. Ranitas, pajaritos, todo en oro. Lo más lindo.', es: 'El Museo del Oro. Ranitas, pajaritos, todo en oro. Lo más lindo.' }, 'surprised'); }) });
    L.push({ x: 2060, y: 50, label: 'Mall', h: 110, act: () => WD.cut(async () => { if(!F('c2_fruit')){ await me('The mall. Hmm. Let’s ask around the market first.', { t: 'El centro comercial. Primero preguntemos en el mercado.', es: 'El centro comercial. Primero preguntemos en el mercado.' }, 'think'); return; } if(!F('c2_mall_in')) return mallEntrance(); WD.sfx('door'); await WD.gotoArea('bog_mall1', 130, 66, { dir: 1, from: 'bog_plaza' }); }) });
    return L;
  },
  async enter(){ if(!F('c2_plaza_seen')){ S('c2_plaza_seen'); await WD.cut(async () => { WD.cam.lock = true; await WD.camTo(700, .95, 1600); await me('The plaza. Pigeons, the cathedral, Monserrate up on the mountain… and somebody selling obleas.', { t: 'La plaza. Las palomas, la catedral, Monserrate allá arriba… y obleas. Estoy en casa.', es: 'La plaza. Las palomas, la catedral, Monserrate allá arriba… y obleas. Estoy en casa.' }, 'happy'); WD.cam.lock = false; WD.updateGoal(); }); } }
});

/* ================= AREA: the mall, floor 1 ================= */
WD.defineArea('bog_mall1', {
  ch: 2, name: 'Centro Comercial · Piso 1', sub: 'Carolina’s favourite place on Earth', music: 'mall', light: 'indoor', minX: 90, maxX: 2080, laneTop: 46, laneBot: 92, camMin: -60, camMax: 2180, camZ: .86, battleBack: 'mall',
  sniffNothing: 'Alejandro sniffs… perfume samples, new shoes, and a LOT of cat.',
  exits: { left: { to: 'bog_plaza', x: 2060 } },
  npcs(){ const n = []; NPC.carolina = mkp('Carolina', 240, 58, 1, talkCarolina, { light: 'indoor' }); n.push(NPC.carolina); return n; },
  foes(){
    return [mkFoe('c2_m1', 'salecat', 660, 62, [580, 780], ['salecat'], 'indoor'), mkFoe('c2_m2', 'cart', 1130, 70, [1040, 1220], ['cart'], 'indoor'), mkFoe('c2_m3', 'salecat', 1500, 56, [1420, 1560], ['salecat', 'cart'], 'indoor')].filter(x => !F('beat_' + x.fid));
  },
  drawBack(t){ const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#F2EEE6'; c.fillRect(0, 0, WD.cv.width, WD.cv.height); WD.setLayer(1); drawMall(c, t, 1);
    drawDisplay(c, 375, 'sweater', t, F('buy_sweater')); drawDisplay(c, 1415, 'mug', t, F('buy_mug')); drawDisplay(c, 1705, 'ruanaitem', t, F('buy_ruana'));
    // the security shutter with the power box behind it, its floor plate, and the escalator up
    c.fillStyle = '#9AA0A6'; c.fillRect(1860, -150, 76, 154); c.fillStyle = '#2B1D14'; rr(c, 1862, -168, 72, 16, 3); c.fill(); c.fillStyle = YEL; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⚡ ENERGÍA', 1898, -160);
    if(!F('c2_shutter')){ c.fillStyle = '#7A8590'; for(let y = -146; y < 4; y += 8) c.fillRect(1862, y, 72, 5); } else { c.fillStyle = '#3A3A44'; c.fillRect(1864, -146, 68, 150); c.fillStyle = F('c2_power') ? '#7CD86A' : '#E8593C'; rr(c, 1884, -100, 28, 36, 3); c.fill(); c.fillStyle = '#2B2B33'; c.fillRect(1893, -92, 10, 20); }
    c.fillStyle = WD.flag('c2_plate') ? '#7CD86A' : '#C9A15A'; rr(c, 1806, 62, 50, 12, 3); c.fill(); c.strokeStyle = '#2B1D14'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#2B1D14'; c.font = '900 6px Grandstander, system-ui'; c.fillText('PESO', 1831, 68.5);
    drawEscalator(c, 1960, F('c2_power'), t);
  },
  things(){
    const L = [];
    if(F('list_get') && !F('buy_sweater')) L.push({ x: 375, y: 54, label: 'Sweater', h: 70, act: () => buy('buy_sweater', 'A little dog sweater', 'Yellow, with a tiny blue and red stripe. For when Dayla comes home.', 'sweater') });
    if(F('list_get') && !F('buy_mug')) L.push({ x: 1415, y: 54, label: 'Mug', h: 70, act: () => buy('buy_mug', 'A coffee mug', '“Café de Colombia,” with a little mountain on it.', 'mug') });
    if(F('list_get') && !F('buy_ruana')) L.push({ x: 1705, y: 54, label: 'Ruana', h: 70, act: () => buy('buy_ruana', 'A wool ruana', 'Warm, soft and striped. Perfect for a cold night on a mountain.', 'ruanaitem') });
    if(!F('c2_shutter')) L.push({ x: 1831, y: 68, skill: 'p', who: 'chunkers', label: 'Sit', h: 40, act: plateSit });
    if(F('c2_shutter') && !F('c2_power')) L.push({ x: 1898, y: 58, label: 'Power', h: 90, sparkle: true, act: powerOn });
    L.push({ x: 2010, y: 58, label: 'Escalator', h: 90, act: () => WD.cut(async () => { if(!F('c2_power')){ await me('“Fuera de servicio.” Out of order. Somebody cut the power on purpose.', { t: '“Fuera de servicio.” Alguien la apagó a propósito.', es: '“Fuera de servicio.” Alguien la apagó a propósito.' }, 'think'); if(!F('c2_shutter')) await me('The power box is behind that shutter, and there’s a heavy floor plate in front of it. Like the old gym…', { t: 'El tablero está detrás de esa reja. Y hay una placa en el piso…', es: 'El tablero está detrás de esa reja. Y hay una placa en el piso…' }, 'think'); return; } WD.sfx('step'); await WD.gotoArea('bog_mall2', 130, 66, { dir: 1, from: 'bog_mall1' }); }) });
    return L;
  },
  async enter(from){ if(!F('c2_mall_seen')){ S('c2_mall_seen'); await WD.cut(async () => { await fam('Carolina', 'My mall! Look, everything is on sale! …Focus. Dayla. Lunita. Then sales.', '¡Mi centro comercial! ¡Mira, todo en promoción! …Concéntrate. Dayla. Lunita. Después las ofertas.', 'joy'); await fam('Carolina', 'Those cats went upstairs. But the escalator is off. It’s at the far end, past the souvenir shops.', 'Esos gatos se fueron para arriba. Pero la escalera eléctrica está apagada. Queda al fondo, después de los recuerdos.', 'worried'); WD.updateGoal(); }); } }
});
async function buy(flag, name, desc, icon){
  await WD.cut(async () => { S(flag); WD.sfx('get'); await WD.itemGet(icon || 'bag', name, desc, 'Carolina’s list');
    const n = ['buy_ruana', 'buy_mug', 'buy_sweater'].filter(F).length; WD.toast(`Carolina’s list: ${n}/3`);
    if(n === 3) await me('That’s the whole list! Back to Carolina at the entrance.', { t: '¡La lista completa! Donde mi mamá.', es: '¡La lista completa! Donde mi mamá.' }, 'joy'); WD.updateGoal(); });
}
async function plateSit(){
  await WD.cut(async () => {
    const a = W.partner; await WD.walkTo(a, 1831, 68, 90); a.sit = true; a.pinned = true; WD.sfx('clang'); WD.shake(3); S('c2_plate');
    await WD.say('Chunkers', 'Chunkers sit. Chunkers good at sit.', { expr: 'happy' });
    WD.sfx('door'); S('c2_shutter'); await WD.wait(400);
    await me('The shutter’s up! The power box is right there.', { t: '¡Se abrió la reja!', es: '¡Se abrió la reja!' }, 'joy');
    a.sit = false; a.pinned = false; WD.updateGoal();
  });
}
async function powerOn(){
  await WD.cut(async () => {
    WD.sfx('clang'); S('c2_power'); WD.shake(4); await WD.wait(300); WD.sfx('heal');
    await me('Power’s back. The escalator is running!', { t: '¡Listo! La escalera ya funciona.', es: '¡Listo! La escalera ya funciona.' }, 'joy');
    WD.saveNow(); WD.updateGoal();
  });
}

/* ================= AREA: the mall, floor 2 ================= */
WD.defineArea('bog_mall2', {
  ch: 2, name: 'Centro Comercial · Piso 2', sub: 'Mascotas Felices, at the far end', music: 'mall', light: 'indoor', minX: 70, maxX: 1440, laneTop: 46, laneBot: 92, camMin: -60, camMax: 1500, camZ: .86, battleBack: 'petstore',
  sniffNothing: 'Alejandro sniffs… coffee, toys, and… a mini pinscher?!',
  npcs(){ const n = [];
    NPC.barista = mkp('Barista', 600, 50, 1, talkBarista, { light: 'indoor' }); n.push(NPC.barista);
    if(!F('c2_boss_m')){ NPC.manager = WD.makeEnt({ kind: 'cat', look: WD.CATS.manager, name: 'The Markdown Manager', x: 1330, y: 62, dir: -1, light: 'indoor' }); n.push(NPC.manager); }
    if(!F('c2_lunita')){ NPC.lunita = mkDog('Lunita', 'minpin', 1220, 46, { dir: 1, nervous: true }); n.push(NPC.lunita); }
    return n; },
  foes(){ return [mkFoe('c2_n1', 'cart', 520, 70, [440, 640], ['cart', 'cart'], 'indoor'), mkFoe('c2_n2', 'salecat', 900, 58, [820, 1000], ['salecat', 'salecat'], 'indoor')].filter(x => !F('beat_' + x.fid)); },
  drawBack(t){ const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#F2EEE6'; c.fillRect(0, 0, WD.cv.width, WD.cv.height); WD.setLayer(1); drawMall(c, t, 2); },
  things(){
    const L = [];
    L.push({ x: 80, y: 60, label: 'Down', h: 80, act: () => { WD.sfx('step'); WD.gotoArea('bog_mall1', 1980, 64, { dir: -1, from: 'bog_mall2' }); } });
    if(!F('toy_futbol')) L.push({ x: 300, y: 56, skill: 'p', who: 'alejandro', label: 'Sniff', h: 60, act: () => WD.cut(async () => { const a = W.partner; a.sniff = true; WD.sfx('sniff'); await WD.wait(800); a.sniff = false; WD.emote(a, '!'); await WD.say('Alejandro', 'In the ball pit! Something smells like Dayla! I’m going in. I may not come back. Tell my story.', { expr: 'happy' }); a.vis = false; WD.sfx('whoosh'); await WD.wait(900); a.vis = true; await toyGet('futbol'); }) });
    if(!F('c2_boss_m')) L.push({ x: 1150, y: 60, label: 'Pet store', h: 100, r: 90, act: managerFight });
    return L;
  },
  update(){ const p = W.player; if(!F('c2_boss_m') && WD.mode === 'explore' && p && p.x >= 1130) managerFight(); },
  limit(nx){ if(!F('c2_boss_m') && !WD.inCut()) return Math.min(nx, 1160); return nx; }
});
function talkBarista(){ WD.cut(async () => {
  if(!F('c2_cafegift')){ S('c2_cafegift'); WD.giveItem('tinto', 2); await fam('Barista', 'A little coffee? On the house. You look like you need it.', D() ? '¿Un tintico? Invita la casa. Se nota que lo necesita.' : '¿Un tintico, mi reina? Invita la casa. Se nota que lo necesita.', 'happy'); await WD.itemGet('tinto', 'Tinto ×2', WD.ITEMS.tinto.desc); return; }
  await fam('Barista', 'Those cats in suits ordered twelve milks and didn’t pay. They went into the pet store at the end.', 'Esos gatos de vestido pidieron doce leches y no pagaron. Se metieron a la tienda de mascotas del fondo.', 'angry');
}); }
async function managerFight(){
  await WD.cut(async () => {
    const p = W.player, m = NPC.manager, l = NPC.lunita; if(F('c2_boss_m')) return; WD.cam.lock = true; await WD.camTo(1250, 1.0, 700);
    await WD.walkTo(p, 1150, 66, 90); p.dir = 1;
    WD.emote(l, '!'); WD.sfx('yap');
    if(D()) await WD.say('Lunita', '(A tiny mini pinscher in a display kennel barks her head off. She has a pink collar with a moon on it.)', { ent: l, expr: 'angry' });
    else await me('', { t: '¡LUNITA! ¡Mi bebé! ¿Qué te hicieron?', es: '¡LUNITA! ¡Mi bebé! ¿Qué te hicieron?' }, 'surprised');
    if(D()) await me('Lunita! Laura’s dog! They took her too!', '', 'surprised');
    await say('The Markdown Manager', 'Welcome to Mascotas Felices! Today only: one barking mini pinscher, fifty percent off. Final sale. No returns.', { ent: m, expr: 'smirk' });
    await say('The Markdown Manager', 'The OTHER one, the brown-and-white one who ate my whole display of dog treats? Already shipped. Up the mountain. Tonight.', { ent: m, expr: 'angry' });
    await me('Then you’re going to tell me where. After I take Lunita home.', { t: 'Me va a decir dónde. Después de que me lleve a Lunita.', es: 'Me va a decir dónde. Después de que me lleve a Lunita.' }, 'determined');
    await say('The Markdown Manager', 'Ha! Everything must go, including YOU!', { ent: m, expr: 'angry' });
    WD.cam.lock = false;
    const res = await fight(['manager'], 'petstore', { music: 'boss', intro: async (B, h) => { await h.bSay('The Markdown Manager: “Attention shoppers! Cleanup on aisle YOU!”', 1700); } });
    if(res !== 'win'){ p.x = 1000; return; }
    WD.mode = 'cutscene'; WD.showControls(false); WD.letter = 1;
    S('c2_boss_m'); m.expr = 'dizzy'; m.rot = -.3;
    await say('The Markdown Manager', 'Ugh… I’m… I’m being… marked DOWN…', { ent: m, expr: 'sad' });
    await say('The Markdown Manager', 'Fine! The package went up Monserrate on the courier. The last cable car leaves tonight. You’ll never make it! Store’s closing! Bye!', { ent: m, expr: 'angry' });
    await WD.hop(m, 1500, 60, 40, 600); W.npcs = W.npcs.filter(e => e !== m); NPC.manager = null; WD.sfx('whoosh');
    WD.giveKey('ticket'); clue('cablecar'); await WD.itemGet('ticket', 'Cable Car Ticket', WD.KEYS.ticket.desc, 'Clue');
    // Lunita joins
    WD.sfx('clang'); l.nervous = false; l.happy = true; await WD.hop(l, 1185, 66, 30, 500); WD.emote(l, 'heart', 2);
    await lunita(D() ? '(Lunita sniffs your shoe. You smell like Laura. That settles it: you’re family. She licks your hand once, very officially.)' : '(Lunita jumps straight into your arms and licks your whole face.)', 'joy');
    await lunita('Arf! ARF! (Translation: “Those cats took the brown one with the duck smell! I chased them! Then they put ME in a box! RUDE!”)', 'angry');
    if(D()) await me('…I’m pretty sure I understood that. Okay, Lunita. You’re with us.', '', 'determined');
    else await me('', { t: 'Ya, ya, mi amor. Vienes con nosotros. Vamos a encontrar a Dayla.', es: 'Ya, ya, mi amor. Vienes con nosotros. Vamos a encontrar a Dayla.' }, 'determined');
    S('c2_lunita'); WD.addPartner('lunita');
    W.npcs = W.npcs.filter(e => e !== l); NPC.lunita = null;
    WD.swapPartner('lunita'); W.partner.x = l.x; W.partner.y = l.y;
    await WD.card(`<i class="k">New partner</i><h2>Lunita joins!</h2><p>Laura’s mini pinscher from Bogotá. Tiny, fast and fearless.</p><ul><li><b>Field skill · Squeeze</b> (🌙 button): slip through tiny gaps and gates.</li><li><b>Pinscher Pounce</b>: two quick rings. She can jump at <b>flying</b> enemies. Two Perfects knock a big flyer to the ground!</li><li><b>Frenchie Charge</b> (1 SP): her brothers Papu and Moka charge every enemy on the ground.</li><li>Switch partners any time in the bag’s Party tab, or mid-battle.</li></ul>`, [{ label: 'Let’s go!', alt: true }]);
    await phoneSpouse1();
    WD.letter = 0; WD.cam.lock = false; WD.saveNow(); WD.updateGoal();
  });
}
async function phoneSpouse1(){
  if(D()) await WD.phone('Laura', [
    { who: 'Laura', text: '¿Amor? My mom just texted me forty times. LUNITA?!', expr: 'surprised' },
    { who: 'David', text: 'Safe. She’s with me. She already bossed Chunkers around.', expr: 'smirk' },
    { who: 'Laura', text: 'Ay, gracias a Dios. Registration week ends tonight, I’m on the first flight. Don’t let Mami Elsa feed you to death.', expr: 'joy' },
    { who: 'David', text: 'No promises.', expr: 'happy' }
  ]);
  else await WD.phone('David', [
    { who: 'David', text: 'Customs update: they let the duck through. Not me. Not yet.', expr: 'think' },
    { who: 'Laura', text: '¿QUÉ? David, encontré a Lunita. The cats had her in a pet store.', expr: 'surprised' },
    { who: 'David', text: 'Of course they did. I’m out of here soon. Save me some ajiaco.', expr: 'smirk' },
    { who: 'Laura', text: 'Ni loco. Okay, sí. Un poquito.', expr: 'joy' }
  ]);
}

/* ================= AREA: Monserrate trail ================= */
/* an iron gate standing right across the pilgrim path (the walkway runs from y≈40 at the back to y≈100 at the front) */
function drawTrailGate(c, x, open, t, part, cutY){
  const yb = 38, yf = 102, H = 70, skew = .85;   // the gate leans a little with the path's depth
  const px = y => x + (y - yb) * skew;
  const post = y => { c.fillStyle = '#4A4A52'; rr(c, px(y) - 4, y - H - 8, 8, H + 10, 2); c.fill(); c.fillStyle = '#E8B84A'; ell(c, px(y), y - H - 10, 4.4, 4.4); c.fill(); c.fillStyle = 'rgba(40,28,60,.25)'; ell(c, px(y), y + 2, 9, 3); c.fill(); };
  // part 'back' = everything behind cutY (drawn before the characters), 'front' = in front of it (drawn after)
  const inPart = y => part === 'back' ? y <= cutY : y > cutY;
  if(inPart(yb)) post(yb);
  if(!open){
    c.strokeStyle = '#2E2E36'; c.lineWidth = 3; c.lineCap = 'round';
    for(let y = yb + 5; y < yf - 3; y += 5.5){ if(!inPart(y)) continue; c.beginPath(); c.moveTo(px(y), y); c.lineTo(px(y), y - H + 6); c.stroke(); }
    const ya = part === 'back' ? yb : Math.max(yb, cutY), yz = part === 'back' ? Math.min(yf, cutY) : yf;
    if(yz > ya){ c.lineWidth = 4; [8, H - 14, H - 2].forEach(h => { c.beginPath(); c.moveTo(px(ya), ya - h); c.lineTo(px(yz), yz - h); c.stroke(); }); }
    const my = (yb + yf) / 2; if(inPart(my)){ c.fillStyle = '#E8B84A'; rr(c, px(my) - 6, my - 44, 12, 14, 3); c.fill(); c.strokeStyle = '#E8B84A'; c.lineWidth = 2.4; c.beginPath(); c.arc(px(my), my - 44, 4.4, Math.PI, 0); c.stroke();
    c.fillStyle = '#FFFDF6'; rr(c, px(my) - 26, my - H - 2, 52, 13, 2); c.fill(); c.fillStyle = '#C2453A'; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CERRADO', px(my), my - H + 4.6); }
  } else if(part === 'back') {
    // swung open against the back post
    c.strokeStyle = '#2E2E36'; c.lineWidth = 3; c.lineCap = 'round';
    for(let i = 0; i < 10; i++){ const gx = px(yb) - 6 - i * 5.5; c.beginPath(); c.moveTo(gx, yb - 2); c.lineTo(gx, yb - H + 8); c.stroke(); }
    c.lineWidth = 4; [8, H - 14].forEach(h => { c.beginPath(); c.moveTo(px(yb), yb - h); c.lineTo(px(yb) - 58, yb - h); c.stroke(); });
  }
  if(inPart(yf)) post(yf);
}
WD.defineArea('bog_trail', {
  ch: 2, name: 'Monserrate · Pilgrim Path', sub: 'Up the mountain, at dusk', music: 'mountain', minX: 80, maxX: 2200, battleBack: 'trail', camZ: 1.0,
  sniffNothing: 'Alejandro sniffs… eucalyptus, cold air, and condor. A LOT of condor.',
  exits: { right: { to: 'bog_summit', x: 110, when: () => F('c2_gate2'), blocked: () => WD.cut(async () => { await me('Locked gate.', { t: 'Cerrado.', es: 'Cerrado.' }, 'think'); }) } },
  foes(){ return [mkFoe('c2_t1', 'ruanacat', 640, 60, [560, 760], ['ruanacat']), mkFoe('c2_t2', 'humm', 1250, 52, [1160, 1360], ['humm', 'humm']), mkFoe('c2_t3', 'ruanacat', 1850, 62, [1760, 1960], ['ruanacat', 'humm'])].filter(x => !F('beat_' + x.fid)); },
  drawBack(t, dt){
    const c = WD.ctx; bogSky(t, dt, 'eve', true); drawCityBelow(c, t, true); WD.setLayer(1); drawTrail(c, t, 'eve');
    // cable car station
    c.fillStyle = '#E9E2D2'; c.fillRect(120, -120, 260, 124); c.fillStyle = TERRA; c.fillRect(110, -128, 280, 10); c.fillStyle = '#3A3240'; c.fillRect(300, -100, 70, 80);
    c.fillStyle = '#C2453A'; rr(c, 310, -86, 48, 30, 4); c.fill(); c.fillStyle = '#9CC3EA'; c.fillRect(316, -80, 36, 12);
    c.fillStyle = '#FFFDF6'; rr(c, 140, -112, 140, 18, 3); c.fill(); c.fillStyle = BLU; c.font = '900 10px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TELEFÉRICO', 210, -103);
    if(!F('c2_trail_seen') || true){ c.fillStyle = '#E8593C'; rr(c, 160, -80, 100, 16, 3); c.fill(); c.fillStyle = '#FFFDF6'; c.font = '900 8px Grandstander, system-ui'; c.fillText('CERRADO', 210, -72); }
    c.strokeStyle = 'rgba(30,30,40,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(370, -100); c.lineTo(2400, -600); c.stroke();
    drawFlag(c, 420, -150, 36, t, { poleH: 154 });
    [520, 1100, 1500, 2000].forEach(x => WD.drawLamp(c, x, 30));
  },
  drawGround(t){ const c = WD.ctx, py = W.player ? W.player.y : 70; drawTrailGate(c, 900, F('c2_gate1'), t, 'back', py); drawTrailGate(c, 1600, F('c2_gate2'), t, 'back', py); },
  drawMid(t){ const c = WD.ctx, py = W.player ? W.player.y : 70; drawTrailGate(c, 900, F('c2_gate1'), t, 'front', py); drawTrailGate(c, 1600, F('c2_gate2'), t, 'front', py); },
  drawFront(t){ drawFog(t, .18); },
  things(){
    const L = [];
    L.push({ x: 200, y: 66, label: 'Taxi', h: 70, act: () => WD.cut(async () => { const i = await WD.choose(WD.hero, D() ? 'Ride back down to the barrio with Titin?' : '¿Bajamos al barrio con Titin?', ['Back to the barrio', 'Keep climbing']); if(i === 0) await WD.gotoArea('bog_street', 1000, 66, { dir: -1, from: 'bog_trail' }); }) });
    L.push({ x: 330, y: 56, label: 'Cable car', h: 100, act: () => WD.cut(async () => { await me('The last cable car already went up. With the crate on it. We’re walking.', { t: 'El último teleférico ya subió. Con la caja. Toca a pie.', es: 'El último teleférico ya subió. Con la caja. Toca a pie.' }, 'determined'); }) });
    if(!F('c2_gate1')) L.push({ x: 900, y: 64, r: 70, skill: 'p', who: 'lunita', label: 'Squeeze', h: 60, act: () => gateOpen('c2_gate1', 900) });
    if(!F('c2_gate2')) L.push({ x: 1600, y: 64, r: 70, skill: 'p', who: 'lunita', label: 'Squeeze', h: 60, act: () => gateOpen('c2_gate2', 1600) });
    [[900, 'c2_gate1'], [1600, 'c2_gate2']].forEach(([x, fl]) => { if(!F(fl)) L.push({ x: x - 10, y: 50, r: 70, label: 'Gate', h: 100, act: () => WD.cut(async () => { await me('Padlocked from the other side. The bars are too narrow for me… but not for somebody small.', { t: 'Con candado del otro lado. Por estos barrotes solo cabe alguien chiquitito…', es: 'Con candado del otro lado. Por estos barrotes solo cabe alguien chiquitito…' }, 'think'); if(WD.G.partner !== 'lunita') WD.toast('Switch to Lunita in the bag’s Party tab.'); }) }); });
    return L;
  },
  limit(nx, px, ny){ const g = (gx, y) => gx + ((y || 70) - 38) * .85 - 28; if(!F('c2_gate1') && nx > g(900, ny)) return Math.min(nx, Math.max(px, g(900, ny))); if(!F('c2_gate2') && nx > g(1600, ny)) return Math.min(nx, Math.max(px, g(1600, ny))); return nx; },
  async enter(from){ if(!F('c2_trail_seen')){ S('c2_trail_seen'); await WD.cut(async () => { WD.cam.lock = true; await WD.camTo(600, .9, 1500); await me('Monserrate. The city lights are coming on down there. The crate’s somewhere up there.', { t: 'Monserrate. Ya se prenden las luces de la ciudad. La caja está allá arriba.', es: 'Monserrate. Ya se prenden las luces de la ciudad. La caja está allá arriba.' }, 'determined'); if(LUNI()) await lunita('Arf! (She points her nose straight up the mountain and starts climbing.)', 'determined'); WD.cam.lock = false; WD.updateGoal(); }); } }
});
async function gateOpen(flag, x){
  await WD.cut(async () => {
    const a = W.partner; await WD.walkTo(a, x + 4, 66, 100); a.vis = false; WD.sfx('yap'); await WD.wait(600);
    a.x = x + 50; a.vis = true; WD.emote(a, '!'); await WD.wait(300); WD.sfx('clang'); S(flag); WD.shake(2);
    await lunita('(Lunita squeezes between the bars, jumps up and nudges the latch open with her nose.)', 'joy');
    await WD.walkTo(a, W.player.x - 30, W.player.y + 6, 120); WD.updateGoal(); WD.saveNow();
  });
}

/* ================= AREA: the summit ================= */
WD.defineArea('bog_summit', {
  ch: 2, name: 'Monserrate · Summit', sub: '3,152 metres above the sea', music: 'mountain', minX: 80, maxX: 1500, battleBack: 'summit', camZ: 1.0,
  sniffNothing: 'Alejandro sniffs… candles, cold stone, and feathers the size of a skateboard.',
  exits: { left: { to: 'bog_trail', x: 2150 } },
  npcs(){ const n = []; NPC.shop = mkp('Shopkeeper', 730, 50, -1, () => WD.cut(async () => { if(F('c2_boss') && !F('toy_condorplush')) return (() => WD.cut(async () => { await say('Shopkeeper', D() ? '¡Se lo regalo! (It’s a gift!) You scared off that awful bird.' : '¡Se lo regalo, mi reina! Usted espantó a ese pajarraco.', { expr: 'joy' }); await toyGet('condorplush'); }))(); await say('Shopkeeper', D() ? '¡Bienvenido a Monserrate! (Welcome!) Careful, a huge condor has been stealing my postcards.' : '¡Bienvenida a Monserrate, mi reina! Cuidado, un cóndor gigante me anda robando las postales.', { expr: F('c2_boss') ? 'joy' : 'worried' }); })); n.push(NPC.shop); if(!F('c2_boss')){ NPC.condor = WD.makeEnt({ kind: 'condor', name: 'El Cóndor', x: 1260, y: 40, dir: -1, zSort: -30 }); n.push(NPC.condor); } return n; },
  drawBack(t, dt){
    const c = WD.ctx; bogSky(t, dt, 'eve', true); drawCityBelow(c, t, true); WD.setLayer(1);
    const cam = WD.cam, half = WD.view.w / (2 * WD.view.S * cam.z), x0 = cam.x - half - 40, x1 = cam.x + half + 40;
    c.fillStyle = '#B9AE9C'; c.fillRect(x0, 0, x1 - x0, 1600); c.strokeStyle = 'rgba(80,70,60,.25)'; for(let x = Math.floor(x0 / 34) * 34; x < x1; x += 34){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x * 1.04, 300); c.stroke(); }
    drawSanctuary(c, 260, t, true);
    c.fillStyle = '#E9E2D2'; c.fillRect(640, -70, 120, 74); c.fillStyle = YEL; c.fillRect(634, -78, 132, 10); c.fillStyle = '#2B1D14'; c.font = '900 8px Grandstander, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RECUERDOS', 700, -72.6);
    c.fillStyle = '#3A3240'; c.fillRect(660, -54, 80, 40); if(!F('toy_condorplush')){ c.save(); c.translate(700, -26); c.scale(.18, .18); drawCondor(c, { t }); c.restore(); }
    // the condor's rock + nest
    c.fillStyle = '#6E665E'; c.beginPath(); c.moveTo(1150, 4); c.quadraticCurveTo(1170, -60, 1230, -70); c.quadraticCurveTo(1300, -66, 1340, 4); c.closePath(); c.fill();
    c.fillStyle = '#7A5A3A'; ell(c, 1250, -70, 40, 10); c.fill(); c.strokeStyle = '#5A3A24'; c.lineWidth = 1.4; for(let i = 0; i < 9; i++){ c.beginPath(); c.moveTo(1214 + i * 8, -74); c.lineTo(1222 + i * 8, -64); c.stroke(); }
    if(F('c2_boss') && !F('c2_photo')){ c.fillStyle = '#FFFDF6'; c.save(); c.translate(1250, -82); c.rotate(-.1); c.fillRect(-8, -8, 16, 14); c.restore(); }
    // the empty crate
    c.fillStyle = '#C9A15A'; rr(c, 960, -30, 70, 34, 3); c.fill(); c.strokeStyle = '#7A5234'; c.lineWidth = 1.2; for(let x = 972; x < 1030; x += 12){ c.beginPath(); c.moveTo(x, -26); c.lineTo(x, 2); c.stroke(); } if(F('c2_crate')){ c.fillStyle = '#3A2E22'; rr(c, 966, -26, 58, 26, 2); c.fill(); }
    drawFlag(c, 580, -170, 44, t, { poleH: 174 }); drawFlag(c, 880, -150, 36, t, { poleH: 154 });
    c.fillStyle = '#9A9086'; c.fillRect(x0, -6, x1 - x0, 6); for(let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) c.fillRect(x, -26, 5, 22); c.fillRect(x0, -28, x1 - x0, 4);
  },
  drawFront(t){ drawFog(t, .14); },
  things(){
    const L = [];
    L.push({ x: 390, y: 50, label: 'Sanctuary', h: 130, act: () => WD.cut(async () => { await me('The sanctuary on top of Monserrate. People walk all the way up here to pray. I get it now.', { t: 'El santuario. La gente sube hasta acá a pie para orar. Ahora entiendo por qué.', es: 'El santuario. La gente sube hasta acá a pie para orar. Ahora entiendo por qué.' }, 'happy'); healAll(); WD.toast('A quiet moment. HP, SP and partners restored.'); WD.saveNow(); }) });
    if(!F('c2_crate')) L.push({ x: 995, y: 56, label: 'Crate', h: 70, sparkle: true, act: condorScene });
    if(F('c2_boss') && !F('c2_photo')) L.push({ x: 1210, y: 58, label: 'Nest', h: 100, sparkle: true, act: nestScene });
    if(F('c2_boss')) L.push({ x: 120, y: 60, label: 'Cable car', h: 90, act: () => WD.cut(async () => { const i = await WD.choose(WD.hero, D() ? 'Take the cable car back down?' : '¿Bajamos en el teleférico?', ['Down to the barrio', 'Stay']); if(i === 0) await WD.gotoArea('bog_street', 1000, 66, { dir: -1, from: 'bog_summit' }); }) });
    return L;
  },
  limit(nx){ if(!F('c2_crate') && nx > 1080 && !WD.inCut()) return 1080; return nx; }
});

/* ================= people: what everyone says ================= */
function talkGloria(){ WD.cut(async () => {
  if(!F('c2_gloria')){ S('c2_gloria'); WD.giveItem('empanada', 2); WD.giveItem('tinto', 1);
    await fam('Doña Gloria', D() ? 'You’re Laura’s husband! The gringo! Take empanadas. And a tinto. You look tired, mijo.' : '¡Laurita! ¡Qué grande! Llévate unas empanadas y un tinto, mi amor.', D() ? '¡Usted es el esposo de Laura! ¡El gringo! Llévese unas empanadas. Y un tinto. Se ve cansado, mijo.' : '¡Laurita! ¡Qué grande! Llévate unas empanadas y un tinto, mi amor.', 'joy');
    if(D()) await me('I’m Canadian, but… thank you. Gracias.', '', 'smirk');
    await WD.itemGet('empanada', 'Empanadas ×2 and a Tinto', 'Doña Gloria’s famous empanadas, with ají on the side, and a little cup of black coffee.'); learnWord('mijo', 'my son (a sweet nickname)'); WD.saveNow(); return; }
  const lines = [
    ['Tinto is just black coffee. Little cup, big energy.', 'El tinto es café negro. Tacita chiquita, mucha energía.'],
    ['On Sundays they close the big streets for bikes. The ciclovía! Half of Bogotá is out pedaling.', 'Los domingos cierran las calles para las bicis. ¡La ciclovía! Medio Bogotá sale a pedalear.'],
    ['Up here it’s cold even in the sun. Always carry a ruana. Or a sweater. Or both.', 'Aquí hace frío hasta con sol. Siempre lleve ruana. O saco. O las dos.'],
    ['When it hails in Bogotá, the streets turn white like snow. Granizo! Then the sun comes back like nothing happened.', 'Cuando cae granizo, las calles quedan blancas como nieve. ¡Y luego sale el sol como si nada!']
  ];
  const L = lines[Math.floor(WD.time) % lines.length]; await fam('Doña Gloria', L[0], L[1], 'happy');
}); }
function talkTitin(){ WD.cut(async () => {
  if(F('c2_boss')){ return taxiMenu(); }
  if(F('c2_cards') && !F('c2_race')) return raceStart();
  if(F('c2_lunita')){ await fam('Titin', D() ? 'Hello, my friend! I am ready! When you are ready, we go. Fast fast. ¡Rapidito!' : 'Mija, cuando estés lista arrancamos. ¡Rapidito!', D() ? 'Hello, my friend! I am ready! ¡Cuando esté listo, arrancamos! ¡Rapidito!' : 'Mija, cuando estés lista arrancamos. ¡Rapidito!', 'joy'); if(!F('c2_cards')) await fam('Titin', 'But first, talk to Juandi. He knows everything about that mountain.', 'Pero primero hable con Juandi. Ese sabe todo de esa montaña.', 'think'); return; }
  await fam('Titin', D() ? 'My taxi! Very fast. Very yellow. The long-coat man sat right here. Rude man. No tip.' : 'Mi taxi. Rápido y amarillo. El señor del abrigo se sentó aquí. Grosero. Ni propina dejó.', D() ? '¡Mi taxi! Muy rápido. Muy amarillo. El señor del abrigo se sentó aquí. Grosero. Ni propina.' : 'Mi taxi. Rápido y amarillo. El señor del abrigo se sentó aquí. Grosero. Ni propina dejó.', 'angry');
  if(D()) await fam('Titin', 'I learn English on my phone app. Today’s word: “Hurry.” ¡Hurry, hurry!', 'Aprendo inglés en una aplicación. La palabra de hoy: “Hurry.” ¡Hurry, hurry!', 'joy');
}); }
function talkDiego(){ WD.cut(async () => {
  if(!F('c2_penalty')){
    await fam('Diego', D() ? 'David! You play basketball, yes? But soccer… is different. Five penalties. Score three on me and I give you something.' : '¡Mija! ¿Te acuerdas de los penaltis? Cinco tiros. Si me metes tres, te doy algo.', D() ? '¡David! Usted juega básquet, ¿no? Pero el fútbol… es otra cosa. Cinco penaltis. Si me mete tres, le doy algo.' : '¡Mija! ¿Te acuerdas de los penaltis? Cinco tiros. Si me metes tres, te doy algo.', 'smirk');
    const i = await WD.choose(WD.hero, D() ? 'Take five penalties against Diego?' : '¿Le pateo los cinco penaltis a mi papá?', ['Let’s play', 'Later']);
    if(i !== 0) return;
    const goals = await penaltyGame();
    if(goals >= 3){ S('c2_penalty'); await fam('Diego', D() ? `${goals} goals! Not bad, gringo. Okay, okay. Take this. For luck.` : `¡${goals} goles! Esa es mi hija. Toma, para la suerte.`, D() ? `¡${goals} goles! Nada mal, gringo. Bueno, bueno. Tome. Para la suerte.` : `¡${goals} goles! Esa es mi hija. Toma, para la suerte.`, 'joy'); await pinGet('tricolor'); }
    else await fam('Diego', D() ? `Only ${goals}. The hoop is easier, eh? Try again anytime.` : `Solo ${goals}. Te estás oxidando, mija. Cuando quieras otra vez.`, D() ? `Solo ${goals}. El aro es más fácil, ¿no? Cuando quiera otra vez.` : `Solo ${goals}. Te estás oxidando, mija. Cuando quieras otra vez.`, 'smirk');
    return;
  }
  await fam('Diego', D() ? 'Next time, basketball. You and me. One on one. I used to be very good. I was. Ask Diana.' : 'La próxima, básquet. Tú y yo. Yo era muy bueno. Pregúntale a Diana.', D() ? 'La próxima, básquet. Usted y yo. Uno contra uno. Yo era muy bueno. Pregúntele a Diana.' : 'La próxima, básquet. Tú y yo. Yo era muy bueno. Pregúntale a Diana.', 'happy');
}); }
function talkDiana(){ WD.cut(async () => {
  if(!F('c2_church')) return churchScene();
  await fam('Diana', 'Remember: be strong and of a good courage. Wherever you go, He goes with you.', 'Acuérdate: esfuérzate y sé valiente. Donde quiera que vayas, Él va contigo.', 'happy');
}); }
function talkCarolina(){ WD.cut(async () => {
  if(!F('c2_fruit')){ await fam('Carolina', D() ? 'Ay, David, my English… is very little. Diana is waiting at the cathedral. Go, go!' : 'Mija, Diana te espera en la catedral. ¡Ve, ve!', D() ? 'Ay, David, mi inglés… es muy poquito. Diana lo está esperando en la catedral. ¡Vaya, vaya!' : 'Mija, Diana te espera en la catedral. ¡Ve, ve!', 'worried'); return; }
  if(!F('c2_mall_in')) return mallEntrance();
  const n = ['buy_ruana', 'buy_mug', 'buy_sweater'].filter(F).length;
  if(n === 3 && !F('c2_listdone')){ S('c2_listdone');
    await fam('Carolina', 'The whole list! The ruana, the mug… and the little sweater. For when Dayla comes home.', '¡Toda la lista! La ruana, la taza… y el sueterito. Para cuando Dayla vuelva a la casa.', 'cry');
    await fam('Carolina', 'Take this. A shopping trip always ends with a gift.', 'Tome esto. Toda salida de compras termina con un regalo.', 'joy'); await pinGet('ruana'); return; }
  if(F('c2_listdone')){ await fam('Carolina', 'Go! Find her. I’ll be here. Looking at shoes. For the search.', '¡Vaya! Encuéntrela. Yo me quedo aquí. Mirando zapatos. Para la búsqueda.', 'smirk'); return; }
  await fam('Carolina', `My list: a ruana, a coffee mug and a little sweater for Dayla. You have ${n} of 3. Everything’s on sale!`, `Mi lista: una ruana, una taza de café y un sueterito para Dayla. Lleva ${n} de 3. ¡Todo está en promoción!`, 'happy');
}); }
function talkElsa(){ WD.cut(async () => {
  if(F('c2_boss')){ await fam('Mami Elsa', D() ? 'Eat, mijo. You climbed a mountain. You fought a condor. Eat.' : 'Coma, mija. Subió una montaña. Peleó con un cóndor. Coma.', 'Coma, mijo. Subió una montaña. Peleó con un cóndor. Coma.', 'joy'); healAll(); return; }
  if(F('c2_ajiaco')){ await fam('Mami Elsa', 'Wear a ruana up there. It gets cold on the mountain at night.', 'Lleve ruana allá arriba. En la montaña hace frío de noche.', 'worried'); healAll(); WD.toast('Mami Elsa fusses over you. Fully restored.'); return; }
  if(F('c2_lunch')){ await fam('Mami Elsa', 'Go with God, mijo. And come back hungry.', 'Vaya con Dios, mijo. Y vuelva con hambre.', 'worried'); healAll(); WD.toast('Mami Elsa makes you eat something. Fully restored.'); return; }
}); }
function talkJuandi(){ WD.cut(async () => {
  if(F('c2_boss')){ await say('Juandi', D() ? 'You beat a REAL condor? Bro. I’m making a card of you. Legendary rarity.' : '¿Le ganaste a un cóndor de verdad? Te voy a hacer una carta. Legendaria.', { es: D() ? null : '¿Le ganaste a un cóndor de verdad? Te voy a hacer una carta. Legendaria.', expr: 'joy' }); return; }
  if(!F('c2_ajiaco')){ await say('Juandi', D() ? 'Hey bro! My English is good, right? I want to play soccer in the USA. Florida, maybe. Then I live with you. Ha. Kidding. Unless…' : '¿Y Lunita? ¿Y Dayla? Ay no. Si necesitas algo, me dices.', { es: D() ? null : '¿Y Lunita? ¿Y Dayla? Ay no. Si necesitas algo, me dices.', expr: 'happy' }); return; }
  await cardsScene();
}); }
function talkFruit(){ WD.cut(async () => {
  if(!F('c2_church')){ await fam('Fruit Seller', 'Granadilla, lulo, mango! Fresh from the farm!', '¡Granadilla, lulo, mango! ¡Fresquitos de la finca!', 'happy'); return; }
  if(!F('c2_fruit')){
    S('c2_fruit');
    await fam('Fruit Seller', 'A brown-and-white dog? With a flat face and big ears? ¡Claro! Yesterday. She ate a whole granadilla right out of my hand.', '¿Una perrita café con blanco? ¿Carita chata, orejonas? ¡Claro! Ayer. Se comió una granadilla entera de mi mano.', 'surprised');
    await fam('Fruit Seller', 'Then some cats in suits put her back in a crate and went to the mall. Cats. In suits. In my plaza.', 'Después unos gatos de vestido la metieron en una caja y se fueron para el centro comercial. Gatos. De vestido. En mi plaza.', 'angry');
    await me('Dayla eating a granadilla. That’s her, all right.', { t: 'Dayla comiéndose una granadilla. Es ella, seguro.', es: 'Dayla comiéndose una granadilla. Es ella, seguro.' }, 'determined');
    clue('mall'); WD.giveItem('oblea', 1); WD.toast('The fruit seller slips you an oblea. “For the road.”');
    await me('Carolina’s waiting at the mall. Let’s go.', { t: 'Mi mamá está en el centro comercial. ¡Vamos!', es: 'Mi mamá está en el centro comercial. ¡Vamos!' }, 'determined');
    W.npcs.push(NPC.carolina = mkp('Carolina', 2060, 60, -1, talkCarolina)); WD.actors.Carolina = NPC.carolina;
    WD.updateGoal(); WD.saveNow(); return;
  }
  await fam('Fruit Seller', 'Find that dog! And when you do, bring her back for another granadilla. On the house.', '¡Encuentren a esa perrita! Y tráiganla por otra granadilla. Gratis.', 'joy');
}); }
function talkSpouseHome(){ WD.cut(async () => {
  if(D()) await say('Laura', 'Canada next, amor. Your dad is going to make so many jokes. Prepárate.', { expr: 'smirk' });
  else await say('David', 'Canada next. My dad already has jokes ready. Brace yourself.', { expr: 'smirk' });
}); }

/* ================= story beats ================= */
async function introArrival(){
  await WD.cut(async () => {
    S('c2_intro'); const p = W.player; p.vis = false; if(W.partner) W.partner.vis = false;
    WD.cam.lock = true; WD.cam.x = 420; WD.cam.z = 1.0;
    await WD.narrate(D() ? '(El Dorado Airport, Bogotá. 2,600 metres up. The air is thin, cool and smells like coffee.)' : '(Aeropuerto El Dorado. Bogotá. El aire frío, el olor a café… estoy en casa.)');
    // Titin's taxi rolls in
    const taxi = { x: -200 }; W.taxiX = taxi.x; const drawTx = W.area.drawMid; W.area.drawMid = t => { drawTx && drawTx(t); drawTaxi(WD.ctx, W.taxiX, 50, t, 1.1, W.honk); };
    WD.sfx('honk'); await WD.tween(1800, u => { W.taxiX = lerp(-300, 170, ease(u)); }); W.honk = true; WD.sfx('honk'); await WD.wait(400); W.honk = false;
    const ti = mkp('Titin', 360, 70, -1, null); W.npcs.push(ti); WD.actors.Titin = ti;
    p.x = 300; p.y = 72; p.dir = 1; p.vis = true; if(W.partner){ W.partner.vis = true; W.partner.x = 262; W.partner.y = 80; }
    if(D()){
      await say('Titin', 'Hello, my friend! Welcome to Bogotá! I am Titin! I drive the taxi! My English… is on my phone app. Day forty-two.', { expr: 'joy' });
      await me('Titin! Laura’s grandpa. She said you’d find me. She didn’t say you’d drive like that.', '', 'surprised');
      await say('Titin', '¡Rapidito! Is the Bogotá style. Come, come! Mami Elsa has lunch. And… a problem.', { es: '¡Rapidito! Así se maneja en Bogotá. ¡Venga, venga! Mami Elsa tiene almuerzo. Y… un problema.', expr: 'worried' });
    } else {
      await say('Titin', '¡Mija! ¡Mi niña linda! ¡Bienvenida a Bogotá!', { expr: 'joy' });
      await me('', { t: '¡TITIN! Te extrañé tanto. ¿Sigues manejando como loco?', es: '¡TITIN! Te extrañé tanto. ¿Sigues manejando como loco?' }, 'joy');
      await say('Titin', 'Rapidito, como siempre. Ven, Mami Elsa tiene almuerzo. Y… un problema.', { expr: 'worried' });
      await me('', { t: 'David se quedó en la aduana. Por el pato. Ya llega.', es: 'David se quedó en la aduana. Por el pato. Ya llega.' }, 'smirk');
    }
    W.area.drawMid = drawTx; W.taxiX = null;
    await WD.walkTo(ti, 230, 60, 90); W.npcs = W.npcs.filter(e => e !== ti);
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
  });
}
async function lunchScene(){
  await WD.cut(async () => {
    S('c2_lunch'); const p = W.player; WD.cam.lock = true; await WD.camTo(620, .95, 900);
    const ca = mkp('Carolina', 560, 56, 1, null, { light: 'indoor' }), di = mkp('Diego', 760, 70, -1, null, { light: 'indoor' }), dn = mkp('Diana', 690, 52, -1, null, { light: 'indoor' }), ti = mkp('Titin', 840, 60, -1, null, { light: 'indoor' });
    [ca, di, dn, ti].forEach(e => { W.npcs.push(e); WD.actors[e.name] = e; });
    const el = NPC.elsa; await WD.walkTo(el, 480, 62, 110); WD.emote(el, 'heart', 2);
    if(D()){
      await fam('Mami Elsa', 'Mijo! You’re so tall! Too skinny. Sit. Eat. Now.', '¡Mijo! ¡Qué alto! Muy flaquito. Siéntese. Coma. Ya.', 'joy');
      await me('Hola, Mami Elsa. Gracias. I… I’ve been practicing my Spanish.', '', 'happy');
      await fam('Mami Elsa', 'Ay, qué lindo. You still need to eat.', 'Ay, qué lindo. Igual tiene que comer.', 'joy'); learnWord('flaquito', 'skinny (said with love)');
    } else {
      await fam('Mami Elsa', '', '¡Mi niña! ¡Ay, mi niña! Déjame verte. Estás flaquita. Siéntate a comer.', 'cry');
      await me('', { t: 'Mami Elsa… te extrañé. Huele a ajiaco. Huele a casa.', es: 'Mami Elsa… te extrañé. Huele a ajiaco. Huele a casa.' }, 'cry');
    }
    await fam('Carolina', 'We have news. Bad news, and strange news.', 'Tenemos noticias. Una mala y una rara.', 'worried');
    await fam('Carolina', 'The bad news: Lunita ran out barking yesterday, chasing some cats in suits. She never came back.', 'La mala: Lunita salió ayer ladrando detrás de unos gatos de vestido. No ha vuelto.', 'sad');
    await fam('Mami Elsa', 'And the strange news: this came in the mail this morning. Soaked. With a little paw print on it.', 'Y la rara: esto llegó esta mañana por correo. Empapado. Con una patica marcada.', 'surprised');
    WD.giveKey('bogtag'); await WD.itemGet('tag', 'The Soggy BOG Tag', 'Dayla’s chewed luggage tag, the one she dropped through the OUTGOING slot. It made it all the way here.', 'Clue');
    await me('That’s Dayla’s bite. She MAILED it. She’s telling us where she is!', { t: '¡Esa es la mordida de Dayla! ¡Lo mandó por correo! ¡Nos está diciendo dónde está!', es: '¡Esa es la mordida de Dayla! ¡Lo mandó por correo! ¡Nos está diciendo dónde está!' }, 'surprised');
    await fam('Titin', D() ? 'And yesterday, at the airport, a man in a long coat took my taxi. Very tall. Very strange. His crate… barked.' : 'Y ayer, en el aeropuerto, un señor alto de abrigo largo cogió mi taxi. Muy raro. Su caja… ladraba.', 'Y ayer, en el aeropuerto, un señor alto de abrigo largo cogió mi taxi. Muy raro. Su caja… ladraba.', 'think');
    await fam('Titin', 'He asked for the plaza, then the mall. And he asked: “What time is the last cable car up Monserrate?”', 'Pidió la plaza, después el centro comercial. Y preguntó: “¿A qué hora sube el último teleférico a Monserrate?”', 'think'); clue('taxi');
    await fam('Diego', D() ? 'Then we split up. Like a team. Carolina to the mall, Diana to the plaza…' : 'Entonces nos repartimos. Como un equipo. Carolina al centro comercial, Diana a la plaza…', 'Entonces nos repartimos. Como un equipo. Carolina al centro comercial, Diana a la plaza…', 'determined');
    await fam('Diana', 'But first we pray. Come with me to the cathedral. Then we ask around the market.', 'Pero primero oramos. Ven conmigo a la catedral. Después preguntamos en el mercado.', 'happy');
    await me('Okay. Cathedral, market, mall. Let’s find them both: Dayla and Lunita.', { t: 'Bueno. Catedral, mercado, centro comercial. Vamos a encontrarlas a las dos.', es: 'Bueno. Catedral, mercado, centro comercial. Vamos a encontrarlas a las dos.' }, 'determined');
    WD.giveItem('ajiaco', 1); await WD.itemGet('ajiaco', 'Mami Elsa’s Ajiaco', 'For the road, in a little container. ' + WD.ITEMS.ajiaco.desc);
    W.npcs = W.npcs.filter(e => ![ca, di, dn, ti].includes(e)); W.npcs.push(NPC.carolina = mkp('Carolina', 560, 56, 1, talkCarolina, { light: 'indoor' }));
    await WD.walkTo(el, 990, 58, 110); el.dir = -1;
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
  });
}
async function churchScene(){
  await WD.cut(async () => {
    const p = W.player, d = NPC.diana; WD.cam.lock = true; await WD.camTo(500, 1.05, 900);
    await WD.walkTo(p, 440, 60, 90); p.dir = 1; d.dir = -1;
    await fam('Diana', 'This cathedral is older than all of us. People have prayed here for hundreds of years. For lost things. Lost people. Lost dogs, too.', 'Esta catedral es más vieja que todos nosotros. Aquí se ha orado por siglos. Por cosas perdidas. Gente perdida. Perritos perdidos también.', 'happy');
    await WD.fade(1, 500, '#140F22'); await WD.narrate(D() ? '(Inside it’s quiet and cool. Candles flicker. Diana prays in Spanish, slowly, so you can follow along.)' : '(Adentro todo es silencio. Las velas tiemblan. Diana ora despacito, y tú oras con ella.)'); await WD.fade(0, 500);
    await fam('Diana', 'I want to give you this verse. Keep it with you the whole trip.', 'Te quiero regalar este versículo. Llévalo todo el viaje.', 'happy');
    const V = WD.VERSES.jos19, G = WD.G; if(!G.verses.includes('jos19')) G.verses.push('jos19');
    await WD.itemGet('verse', 'Verse Stone · ' + V.ref, D() ? V.en : V.es, 'Verse');
    await me('“Whithersoever thou goest.” Bogotá. Canada. Wherever she is.', { t: '“En donde quiera que fueres.” Bogotá, o donde sea que esté ella.', es: '“En donde quiera que fueres.” Bogotá, o donde sea que esté ella.' }, 'determined');
    await fam('Diana', 'Now, the market. The fruit sellers see everything in this plaza.', 'Ahora el mercado. Las vendedoras de fruta ven todo en esta plaza.', 'determined');
    S('c2_church'); W.npcs = W.npcs.filter(e => e !== d);
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
    // the pigeons arrive
    W.foes = W.area.foes ? W.area.foes() : []; WD.toast('Uh oh. The pigeons in the plaza look… organized.');
  });
}
async function mallEntrance(){
  await WD.cut(async () => {
    const c = NPC.carolina; S('c2_mall_in'); S('list_get'); WD.giveKey('list');
    await fam('Carolina', D() ? 'David! The cats are in MY mall. Nobody steals dogs in my mall.' : '¡Mija! Los gatos están en MI centro comercial. En mi centro comercial nadie se roba perros.', D() ? '¡David! Los gatos están en MI centro comercial. En mi centro comercial nadie se roba perros.' : '¡Mija! Los gatos están en MI centro comercial. En mi centro comercial nadie se roba perros.', 'angry');
    await fam('Carolina', 'And since we’re here… a little list. If you see these on the way, grab them. Everything’s on sale.', 'Y ya que estamos… una listica. Si las ve por el camino, cójalas. Todo está en promoción.', 'smirk');
    await WD.itemGet('list', 'Carolina’s Shopping List', 'Una ruana, una taza de café, un sueterito para Dayla. (Optional, but Carolina will be very happy.)', 'Key item');
    if(D()) await me('A shopping list. In the middle of a rescue. Okay. Sure.', '', 'smirk'); else await me('', { t: 'Ay, mamá. Bueno, bueno.', es: 'Ay, mamá. Bueno, bueno.' }, 'smirk');
    WD.sfx('door'); await WD.gotoArea('bog_mall1', 130, 66, { dir: 1, from: 'bog_plaza', cut: true });
  });
}
async function homecoming(){
  await WD.cut(async () => {
    const el = NPC.elsa, pa = NPC.papu, mo = NPC.moka, lu = LUNI(); WD.cam.lock = true; await WD.camTo(400, .95, 700);
    pa.zzz = false; mo.zzz = false; pa.y = mo.y = 70; pa.zSort = mo.zSort = 0; WD.sfx('bark'); WD.emote(pa, '!'); WD.emote(mo, '!');
    if(lu){ await Promise.all([WD.hop(pa, lu.x + 26, 70, 20, 500), WD.hop(mo, lu.x + 50, 76, 20, 600)]); WD.emote(lu, 'heart', 2); }
    await WD.narrate(D() ? '(Papu and Moka wake up, see Lunita, and lose their minds. There is a lot of snorting.)' : '(Papu y Moka se despiertan, ven a Lunita, y enloquecen. Hay muchos ronquidos de felicidad.)');
    await WD.walkTo(el, 520, 62, 110);
    await fam('Mami Elsa', 'LUNITA! Mi niña chiquita! Gracias a Dios.', '¡LUNITA! ¡Mi niña chiquita! Gracias a Dios.', 'cry');
    await me('The cats said Dayla went up Monserrate. Tonight. On the last cable car.', { t: 'Los gatos dijeron que Dayla subió a Monserrate. Esta noche. En el último teleférico.', es: 'Los gatos dijeron que Dayla subió a Monserrate. Esta noche. En el último teleférico.' }, 'determined');
    await fam('Mami Elsa', 'Then you climb a mountain tonight. Nobody climbs Monserrate on an empty stomach. Come. We make ajiaco. Together.', 'Entonces esta noche sube una montaña. Nadie sube a Monserrate con el estómago vacío. Venga. Hacemos ajiaco. Juntos.', 'determined');
    if(D()) learnWord('juntos', 'together');
    WD.cam.lock = true; await WD.camTo(980, 1.05, 800);
    const stars = await cookGame();
    S('c2_ajiaco'); WD.giveItem('ajiaco', 1 + stars); healAll();
    await fam('Mami Elsa', stars >= 3 ? 'Perfect! This is ajiaco like mine. You are family now. Officially.' : stars === 2 ? 'Very good! A little more guascas next time, but very good.' : 'It’s… food! Ha! I’ll fix it a little. Don’t tell anybody.', stars >= 3 ? '¡Perfecto! Este ajiaco es como el mío. Ya es de la familia. Oficialmente.' : stars === 2 ? '¡Muy bien! Le falta un poquito de guascas, pero muy bien.' : 'Es… ¡comida! ¡Ja! Yo lo arreglo un poquito. No le diga a nadie.', 'joy');
    await WD.itemGet('ajiaco', `Ajiaco ×${1 + stars}`, WD.ITEMS.ajiaco.desc);
    await say('Lunita', 'Arf! (Papu and Moka stand next to Lunita. They look ready to charge at anything.)', { ent: lu || undefined, expr: 'determined' });
    await WD.narrate(D() ? '(Lunita’s Frenchie Charge: Papu and Moka now run in to help in battle!)' : '(¡Frenchie Charge! Papu y Moka ahora ayudan a Lunita en las batallas.)');
    await say('Juandi', D() ? 'Bro. Monserrate at night? There’s a condor up there. A HUGE one. Come here, I need to show you something.' : 'Oye, ¿Monserrate de noche? Allá arriba hay un cóndor. Gigante. Ven, te tengo que mostrar algo.', { es: D() ? null : 'Oye, ¿Monserrate de noche? Allá arriba hay un cóndor. Gigante. Ven, te tengo que mostrar algo.', ent: NPC.juandi, expr: 'surprised' });
    await WD.walkTo(el, 990, 58, 110); el.dir = -1;
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
  });
}
async function cardsScene(){
  const j = NPC.juandi;
  await say('Juandi', D() ? 'Bro, play me at “Criaturas de Colombia.” I invented it. Win three rounds before I do and you get my best card.' : 'Juguemos “Criaturas de Colombia.” Lo inventé yo. Si ganas tres rondas antes que yo, te doy mi mejor carta.', { es: D() ? null : 'Juguemos “Criaturas de Colombia.” Lo inventé yo. Si ganas tres rondas antes que yo, te doy mi mejor carta.', ent: j, expr: 'smirk' });
  const won = await cardGame();
  if(!won){ await say('Juandi', D() ? 'Ha! Undefeated! Again? Come on, again.' : '¡Ja! ¡Invicto! ¿Otra? Dale, otra.', { es: D() ? null : '¡Ja! ¡Invicto! ¿Otra? Dale, otra.', ent: j, expr: 'joy' }); return; }
  S('c2_cards'); WD.giveKey('card'); clue('condor');
  await say('Juandi', D() ? 'No way. Okay, okay, a deal is a deal. My Cóndor card. Read the special rule. It’s real, I swear. Condors are weak on the ground.' : 'No puede ser. Bueno, trato es trato. Mi carta del Cóndor. Lee la regla especial. Es de verdad: en el piso, los cóndores son débiles.', { es: D() ? null : 'No puede ser. Bueno, trato es trato. Mi carta del Cóndor. Lee la regla especial. Es de verdad: en el piso, los cóndores son débiles.', ent: j, expr: 'surprised' });
  await WD.itemGet('ccard', 'Juandi’s Cóndor Card', WD.KEYS.card.desc, 'Clue');
  await say('Juandi', D() ? 'And this. My lucky pin, from the gold museum. You need it more than me.' : 'Y esto. Mi pin de la suerte, del Museo del Oro. Lo necesitas más que yo.', { es: D() ? null : 'Y esto. Mi pin de la suerte, del Museo del Oro. Lo necesitas más que yo.', ent: j, expr: 'happy' });
  await pinGet('oro');
  await say('Juandi', D() ? 'Titin’s outside with the taxi. Go! The last cable car leaves soon!' : 'Titin está afuera con el taxi. ¡Vayan! ¡El último teleférico ya casi sale!', { es: D() ? null : 'Titin está afuera con el taxi. ¡Vayan! ¡El último teleférico ya casi sale!', ent: j, expr: 'determined' });
  W.npcs = W.npcs.filter(e => e !== j); WD.updateGoal(); WD.saveNow();
}
async function raceStart(){
  await fam('Titin', D() ? 'Monserrate! The last cable car! Hold on to something, my friend. ¡Rapidito!' : '¡A Monserrate! ¡El último teleférico! Agárrese, mija. ¡Rapidito!', D() ? '¡A Monserrate! ¡El último teleférico! ¡Agárrese, amigo! ¡Rapidito!' : '¡A Monserrate! ¡El último teleférico! Agárrese, mija. ¡Rapidito!', 'determined');
  await WD.card(`<i class="k">Titin’s taxi race</i><h2>¡Rapidito!</h2><p>Get to Monserrate before the timer runs out.</p><ul><li>Move <b>up and down</b> (stick or arrow keys) to switch lanes.</li><li>Dodge red buses, motorbikes and potholes. Every bump costs time.</li><li>Tap <b>A</b> to honk: pigeons scatter and you get a little boost.</li><li>Grab tinto cups for extra seconds.</li></ul>`, [{ label: 'Vámonos!', alt: true }]);
  while(true){
    const ok = await taxiRace();
    if(ok) break;
    const i = await WD.card(`<i class="k">Too slow!</i><h2>¡Otra vez!</h2><p>Titin: “${D() ? 'Again! I know a shortcut. Probably.' : '¡Otra vez! Me sé un atajo. Creo.'}”</p>`, [{ label: 'Try again', alt: true }, { label: 'Not now' }]);
    if(i !== 0) return;
  }
  S('c2_race'); WD.saveNow();
  await WD.gotoArea('bog_trail', 260, 66, { dir: 1, from: 'taxi', cut: true });
  await WD.cut(async () => {
    await fam('Titin', D() ? 'We made it! Four minutes early! I wait here. Go, go!' : '¡Llegamos! ¡Cuatro minutos antes! Yo espero aquí. ¡Vaya, vaya!', D() ? '¡Llegamos! ¡Cuatro minutos antes! Yo espero aquí. ¡Vaya, vaya!' : '¡Llegamos! ¡Cuatro minutos antes! Yo espero aquí. ¡Vaya, vaya!', 'joy');
    await me('The station’s closed. The cats took the last car up and shut it down behind them.', { t: 'Está cerrado. Los gatos subieron en el último y lo apagaron.', es: 'Está cerrado. Los gatos subieron en el último y lo apagaron.' }, 'angry');
    await me('Then we climb. All the way up.', { t: 'Entonces subimos a pie. Hasta arriba.', es: 'Entonces subimos a pie. Hasta arriba.' }, 'determined');
  });
}
async function taxiMenu(){
  const opts = ['The barrio', 'The plaza', 'The mall', 'Monserrate', 'El Dorado (fly home)', 'Stay'];
  const i = await WD.choose('Titin', D() ? 'Where to, my friend? Rapidito!' : '¿Para dónde, mija? ¡Rapidito!', opts);
  const go = [['bog_street', 980, 1], ['bog_plaza', 300, 1], ['bog_mall1', 160, 1], ['bog_summit', 200, 1], ['uic_front', 200, 1]][i];
  if(!go) return;
  if(i === 4){ const k = await WD.choose(WD.hero, D() ? 'Fly back to Florida for a while? (Titin will pick you up again any time.)' : '¿Volver a Florida un rato? (Titin te recoge cuando quieras.)', ['Fly home', 'Stay']); if(k !== 0) return; }
  WD.sfx('honk'); await WD.gotoArea(go[0], go[1], 66, { dir: go[2], from: 'taxi' });
}
async function condorScene(){
  await WD.cut(async () => {
    const p = W.player, co = NPC.condor; WD.cam.lock = true; await WD.camTo(1080, 1.05, 900);
    await WD.walkTo(p, 960, 62, 90); p.dir = 1;
    S('c2_crate');
    await me('The crate… it’s empty. There’s a card inside.', { t: 'La caja… está vacía. Hay una tarjeta.', es: 'La caja… está vacía. Hay una tarjeta.' }, 'surprised');
    await WD.narrate('(The card is gold-edged: “Thank you for the delivery. Dayla is safely aboard. — The Collector”)');
    await me('Aboard? Aboard WHAT?', { t: '¿A bordo? ¿A bordo de QUÉ?', es: '¿A bordo? ¿A bordo de QUÉ?' }, 'angry');
    WD.sfx('whoosh'); WD.shake(6); co.dir = -1; await WD.hop(co, 1160, 50, 60, 700); WD.sfx('hiss');
    await say('El Cóndor', 'SKRAAA. Special delivery: complete. The package was very heavy. She ate the bubble wrap.', { ent: co, expr: 'angry' });
    await say('El Cóndor', 'I am the Collector’s courier. Highest flyer in the Andes. And YOU are not on my delivery list.', { ent: co, expr: 'angry' });
    if(G2().key.includes('card')) await me('Juandi’s card: “Weak when grounded.” Lunita, get ready to jump.', { t: 'La carta de Juandi: “débil en el piso.” Lunita, prepárate para saltar.', es: 'La carta de Juandi: “débil en el piso.” Lunita, prepárate para saltar.' }, 'determined');
    WD.cam.lock = false;
    const res = await fight(['condor'], 'summit', { music: 'condor', intro: async (B, h) => { await h.bSay('El Cóndor spreads its wings. The fog swirls. The whole city is watching.', 1800); } });
    if(res !== 'win') return;
    WD.mode = 'cutscene'; WD.showControls(false); WD.letter = 1;
    S('c2_boss'); co.expr = 'dizzy'; co.rot = -.2;
    await say('El Cóndor', 'Skra… you hit like a… like a Bogotá hailstorm…', { ent: co, expr: 'sad' });
    await say('El Cóndor', 'Fine. FINE. I handed her to the airship at dawn, over the plaza market. The ship floats north. Very far north. Where the ferries go.', { ent: co, expr: 'sad' });
    await say('El Cóndor', 'I quit. The Collector doesn’t even pay in fish.', { ent: co, expr: 'angry' });
    WD.sfx('whoosh'); await WD.tween(900, u => { co.x = lerp(1160, 1700, u); co.z = u * 200; }); W.npcs = W.npcs.filter(e => e !== co); NPC.condor = null;
    await me('It left something in the nest.', { t: 'Dejó algo en el nido.', es: 'Dejó algo en el nido.' }, 'think');
    WD.letter = 0; WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
  });
}
const G2 = () => WD.G;
async function nestScene(){
  await WD.cut(async () => {
    const p = W.player, G = WD.G; await WD.walkTo(p, 1190, 62, 90); p.dir = 1;
    S('c2_photo'); clue('ferry'); if(!G.photos[2]) G.photos[2] = 'market';
    await WD.itemGet('photo3', 'Sighting #3', 'The condor’s “proof of delivery”: Dayla at the plaza market, munching a granadilla, with a ferry ticket to VICTORIA, B.C. tucked in her collar.', 'Missing Dog poster');
    if(D()) await me('Victoria… British Columbia. That’s CANADA. That’s near my dad’s place!', '', 'surprised');
    else await me('', { t: 'Victoria… ¿Canadá? ¡Allá vive el papá de David!', es: 'Victoria… ¿Canadá? ¡Allá vive el papá de David!' }, 'surprised');
    WD.pingBag();
    // the spouse arrives on the cable car
    WD.cam.lock = true; await WD.camTo(500, 1.0, 900);
    const sp = WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.spouse], name: WD.spouse, x: 100, y: 66, dir: 1 }); W.npcs.push(sp); WD.actors[WD.spouse] = sp;
    WD.sfx('ring'); await WD.walkTo(p, 520, 66, 140); await WD.walkTo(sp, 470, 66, 140); p.dir = -1; WD.emote(sp, 'heart', 2); WD.emote(p, 'heart', 2);
    if(D()){
      await say('Laura', '¡AMOR! The cable car guy turned it back on for me. I told him my husband was fighting a condor. He believed me.', { expr: 'joy' });
      await me('I did fight a condor.', '', 'smirk');
      await say('Laura', 'I know. Mi mamá already told everyone in Bogotá. Did we find her?', { expr: 'worried' });
      await me('Almost. She’s on an airship. Heading for Victoria. Canada.', '', 'determined');
      await say('Laura', 'Canada… Your dad. Ay, no. The jokes.', { expr: 'surprised' });
    } else {
      await say('David', 'Customs finally let me go. They said the duck was “very suspicious.” I said “yes, she is.”', { expr: 'smirk' });
      await me('', { t: '¡DAVID! Llegaste. Le gané a un cóndor. Bueno, Lunita y yo.', es: '¡DAVID! Llegaste. Le gané a un cóndor. Bueno, Lunita y yo.' }, 'joy');
      await say('David', 'Of course you did. So where is she?', { expr: 'happy' });
      await me('', { t: 'En un dirigible. Rumbo a Victoria. Canadá. Donde tu papá.', es: 'En un dirigible. Rumbo a Victoria. Canadá. Donde tu papá.' }, 'determined');
      await say('David', 'Canada. My dad is going to make SO many jokes.', { expr: 'surprised' });
    }
    W.npcs = W.npcs.filter(e => e !== sp);
    await chapterEnd2();
  });
}
async function chapterEnd2(){
  const G = WD.G;
  if(!G.learned.includes('Zoomies')) G.learned.push('Zoomies');
  S('c2_done'); G.chapter = Math.max(G.chapter, 3); WD.saveNow();
  await WD.chapterComplete({ num: 'Chapter 2', title: 'Abuela’s Kitchen', bunting: [YEL, BLU, RED], rewards: [
    { icon: 'star', label: 'Zoomies', sub: 'Special · 3 SP: mash A, hit every enemy on the ground' },
    { partner: 'lunita', label: 'Lunita', sub: 'Partner · squeeze & pounce (+ Papu & Moka)' },
    { icon: 'photo3', label: 'Sighting #3', sub: 'Dayla at the plaza market' },
    { icon: 'ajiaco', label: 'Ajiaco', sub: 'Mami Elsa’s recipe: full heal + 3 SP' },
    { icon: 'pin_tricolor', label: `Pins ${['tricolor', 'ruana', 'oro'].filter(k => (G.pins || []).includes(k)).length}/3`, sub: 'Tricolor, Ruana, Golden Frog' },
    { icon: 'arepatoy', label: `Toys ${WD.toyCount(2)[0]}/3`, sub: 'Dayla’s lost toys in Bogotá' }
  ] });
  await startInterlude2();
}

/* ================= minigames ================= */
function mgSheet(){ const card = WD.$('.wd-card'), sh = card.querySelector('.sheet'); card.hidden = false; WD.sfx('open'); return { card, sh, close(){ card.hidden = true; } }; }
const mgCSS = `.wd-mg{display:grid;gap:10px}.wd-mg .row{display:flex;gap:8px;flex-wrap:wrap}.wd-mg button.b{border:0;background:var(--paper-2);border-radius:14px;padding:8px 12px;font-family:var(--display);font-weight:900;font-size:15px;box-shadow:0 0 0 3px var(--ink),0 4px 0 var(--ink)}.wd-mg button.b:active{transform:translateY(2px)}.wd-mg button.b.go{background:var(--sun)}.wd-mg button.b.done{opacity:.4}
.wd-mg .bar{position:relative;height:22px;border-radius:11px;background:#E9DCC4;box-shadow:0 0 0 3px var(--ink);overflow:hidden}.wd-mg .bar i{position:absolute;top:0;bottom:0;background:#7CD86A}.wd-mg .bar b{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:var(--coral);border-radius:3px}
.wd-mg .goal{position:relative;height:110px;border-radius:12px;background:linear-gradient(#5A9E58,#3F8A4A);box-shadow:0 0 0 3px var(--ink);overflow:hidden}.wd-mg .net{position:absolute;left:8%;right:8%;top:10px;height:76px;border:4px solid #FFF;border-bottom:0;background-image:linear-gradient(rgba(255,255,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.35) 1px,transparent 1px);background-size:10px 10px}.wd-mg .keeper{position:absolute;top:30px;width:30px;height:52px;margin-left:-15px;border-radius:10px 10px 4px 4px;background:#C2453A;box-shadow:0 0 0 2px var(--ink)}.wd-mg .keeper::before{content:'';position:absolute;left:5px;top:-16px;width:20px;height:20px;border-radius:50%;background:#D3A07A;box-shadow:0 0 0 2px var(--ink)}.wd-mg .aim{position:absolute;top:44px;width:18px;height:18px;margin-left:-9px;border-radius:50%;border:3px solid #FFC94A;box-shadow:0 0 0 2px var(--ink)}
.wd-mg .cards{display:flex;gap:10px;justify-content:center}.wd-mg .cc{width:92px;border:0;border-radius:12px;padding:8px 4px;background:#FFF8EC;box-shadow:0 0 0 3px var(--ink),0 5px 0 var(--ink);font-family:var(--display);font-weight:900;font-size:13px;display:grid;gap:4px;justify-items:center}.wd-mg .cc i{font-style:normal;font-size:30px}.wd-mg .vs{display:flex;justify-content:space-around;align-items:center;font-family:var(--display);font-weight:900;font-size:18px;min-height:56px}.wd-mg .vs span{font-size:34px}.wd-mg .score{font-family:var(--display);font-weight:900;color:var(--coral)}`;
const mgCSS2 = `.wd-mg.cg{gap:8px}.wd-mg .sb{display:flex;justify-content:space-between;font-family:var(--display);font-weight:900;font-size:15px}.wd-mg .sb b{color:var(--coral);letter-spacing:2px;margin-left:4px}
.wd-mg .loop{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;font-family:var(--display);font-weight:900;font-size:15px}.wd-mg .loop span{background:var(--paper-2);border-radius:10px;padding:4px 8px;box-shadow:0 0 0 2px var(--ink)}.wd-mg .loop em{font-style:normal;font-size:12px;color:var(--coral)}
.wd-mg .brag{background:#EAF2FB;border-radius:12px;padding:6px 10px;box-shadow:0 0 0 2px var(--ink)}.wd-mg .pick{font-weight:900;margin-bottom:-2px}
.wd-mg .table{display:flex;justify-content:center;align-items:center;gap:14px}.wd-mg .side{display:grid;justify-items:center;gap:3px}.wd-mg .side>small{font-weight:900;font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.7}.wd-mg .vs2{font-family:var(--display);font-weight:900;font-size:20px;color:var(--coral)}
.wd-mg .cc small{font-family:var(--body);font-weight:800;font-size:10px;opacity:.7}.wd-mg .cc b{font-size:13px}.wd-mg .cc.back{background:#3E6FB5;color:#FFF8EC}.wd-mg .cc.won{box-shadow:0 0 0 3px var(--ink),0 0 0 7px #7CD86A}.wd-mg .cc.lost{opacity:.55}.wd-mg .cc:disabled{color:inherit}
.wd-mg h2.res{font-size:22px;margin:2px 0 0}.wd-mg h2.res.win{color:#2F8F3A}.wd-mg h2.res.lose{color:var(--coral)}`;
if(!document.getElementById('wd-css-mg3')){ const st3 = document.createElement('style'); st3.id = 'wd-css-mg3'; st3.textContent = mgCSS2; document.head.appendChild(st3); }
if(!document.getElementById('wd-css-mg2')){ const st = document.createElement('style'); st.id = 'wd-css-mg2'; st.textContent = mgCSS; document.head.appendChild(st); }
const MG_AUTO = () => !!WD.mgAuto;

/* cooking ajiaco with Mami Elsa: potatoes in order, guascas at the right moment, stir, then the toppings */
function cookGame(){
  if(MG_AUTO()) return Promise.resolve(3);
  return new Promise(res => {
    const m = mgSheet(); let stars = 0;
    const L = (en, es) => D() ? `${es} (${en})` : es;
    const step1 = () => {
      const order = ['Sabanera', 'Pastusa', 'Criolla']; let next = 0, oops = 0;
      const draw = msg => { m.sh.innerHTML = `<div class="wd-mg"><i class="k">Cooking with Mami Elsa · 1/4</i><h2>Las tres papas</h2><p>${esc(msg || L('Three potatoes. The hardest goes in first, the yellow criolla last. It melts and makes the soup thick.', 'Tres papas. La más dura primero, la criolla de última: se deshace y espesa la sopa.'))}</p><div class="row">${['Criolla', 'Sabanera', 'Pastusa'].map(n => `<button class="b ${order.indexOf(n) < next ? 'done' : ''}" data-n="${n}" ${order.indexOf(n) < next ? 'disabled' : ''}>🥔 Papa ${n}</button>`).join('')}</div><p class="score">${next}/3 in the pot</p></div>`;
        m.sh.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { if(b.dataset.n === order[next]){ next++; WD.sfx('tap'); if(next === 3){ WD.sfx('get'); if(!oops) stars++; return step2(); } draw(); } else { oops++; next = 0; WD.sfx('miss'); draw(L('Ay, no! That one cooks too fast. Out they come. Start with the hardest potato.', '¡Ay, no! Esa se cocina muy rápido. Las saco. Empiece por la más dura.')); } });
        const f = m.sh.querySelector('button:not([disabled])'); if(f) f.focus({ preventScroll: true }); };
      draw();
    };
    const step2 = () => {
      let u = 0, dir = 1, tries = 0, raf = 0, done = false;
      m.sh.innerHTML = `<div class="wd-mg"><i class="k">Cooking with Mami Elsa · 2/4</i><h2>Las guascas</h2><p>${esc(L('Guascas, the special herb. Add it when the pot is at its biggest bubble: tap in the green!', 'Las guascas. Échelas cuando la olla hierva más duro: ¡toque en lo verde!'))}</p><div class="bar"><i style="left:62%;width:16%"></i><b></b></div><div class="row"><button class="b go" data-g>🌿 Add guascas!</button></div><p class="score"></p></div>`;
      const bar = m.sh.querySelector('.bar b'), sc = m.sh.querySelector('.score');
      const loop = () => { if(done) return; u += dir * .012; if(u > 1){ u = 1; dir = -1; } if(u < 0){ u = 0; dir = 1; } bar.style.left = (u * 100) + '%'; raf = requestAnimationFrame(loop); }; loop();
      const btn = m.sh.querySelector('[data-g]'); btn.focus({ preventScroll: true });
      btn.onclick = () => { tries++; if(u >= .62 && u <= .78){ done = true; cancelAnimationFrame(raf); WD.sfx('perfect'); if(tries === 1) stars++; sc.textContent = L('¡Eso! Smells perfect.', '¡Eso! Huele perfecto.'); setTimeout(step3, 800); } else { WD.sfx('miss'); sc.textContent = tries >= 3 ? L('Close enough, mijo!', '¡Así está bien, mija!') : L('Not yet! Wait for the big bubble.', '¡Todavía no! Espere el hervor.'); if(tries >= 3){ done = true; cancelAnimationFrame(raf); setTimeout(step3, 900); } } };
    };
    const step3 = () => {
      let n = 0, left = 3, t0 = performance.now(), done = false;
      m.sh.innerHTML = `<div class="wd-mg"><i class="k">Cooking with Mami Elsa · 3/4</i><h2>¡A revolver!</h2><p>${esc(L('Stir! Tap as fast as you can so nothing sticks to the bottom.', '¡Revuelva! Toque rapidito para que no se pegue.'))}</p><div class="bar"><i style="left:0;width:0;background:#58AEDD"></i></div><div class="row"><button class="b go" data-s>🥄 Stir!</button></div><p class="score">3</p></div>`;
      const fill = m.sh.querySelector('.bar i'), sc = m.sh.querySelector('.score'), btn = m.sh.querySelector('[data-s]'); btn.focus({ preventScroll: true });
      btn.onclick = () => { if(done) return; n++; WD.sfx('yap'); fill.style.width = Math.min(100, n / 22 * 100) + '%'; };
      const tick = () => { if(done) return; left = 3 - (performance.now() - t0) / 1000; sc.textContent = Math.max(0, left).toFixed(1) + 's'; if(left <= 0){ done = true; if(n >= 22) stars++; WD.sfx(n >= 22 ? 'perfect' : 'nice'); return setTimeout(step4, 600); } requestAnimationFrame(tick); }; tick();
    };
    const step4 = () => {
      const want = ['Crema', 'Alcaparras', 'Aguacate'], got = new Set(); let ketchup = false;
      const draw = msg => { m.sh.innerHTML = `<div class="wd-mg"><i class="k">Cooking with Mami Elsa · 4/4</i><h2>Para servir</h2><p>${esc(msg || L('Serve it the Bogotá way. Pick the three toppings that go on top.', 'Sírvalo al estilo bogotano. Escoja los tres acompañantes.'))}</p><div class="row">${[['Crema', '🥛'], ['Ketchup', '🍅'], ['Alcaparras', '🫒'], ['Aguacate', '🥑']].map(([n, e]) => `<button class="b ${got.has(n) ? 'done' : ''}" data-t="${n}" ${got.has(n) ? 'disabled' : ''}>${e} ${n}</button>`).join('')}</div><p class="score">${got.size}/3</p></div>`;
        m.sh.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const n = b.dataset.t; if(n === 'Ketchup'){ ketchup = true; WD.sfx('miss'); return draw(L('KETCHUP?! In ajiaco?! …Mami Elsa needs to sit down for a second.', '¿¡SALSA DE TOMATE?! ¿¡En el ajiaco?! …Mami Elsa se tiene que sentar un momentico.')); } got.add(n); WD.sfx('tap'); if(got.size === 3){ if(!ketchup) stars = Math.min(3, stars + 0); WD.sfx('get'); m.close(); return res(Math.max(1, Math.min(3, stars + (ketchup ? -1 : 0)))); } draw(); });
        const f = m.sh.querySelector('button:not([disabled])'); if(f) f.focus({ preventScroll: true }); };
      draw();
    };
    step1();
  });
}
/* Juandi's creature cards: rock-paper-scissors with Colombian animals. First to 3. */
function cardGame(){
  if(MG_AUTO()) return Promise.resolve(true);
  return new Promise(res => {
    const m = mgSheet();
    const C = {
      jaguar: { e: '🐆', n: 'Jaguar', beats: 'rana', why: 'The Jaguar pounces on the Frog!' },
      rana: { e: '🐸', n: 'Golden Frog', beats: 'colibri', why: 'The Frog’s sticky tongue catches the Hummingbird!' },
      colibri: { e: '🐦', n: 'Hummingbird', beats: 'jaguar', why: 'The Hummingbird is too fast. The Jaguar gets dizzy chasing it!' }
    };
    const K = Object.keys(C);
    let me2 = 0, him = 0, last = null, plan = null, honest = true;
    const brag = { jaguar: D() ? '“I’m playing my JAGUAR next. Nothing beats it.”' : '“Ahora juego mi JAGUAR. Nada le gana.”', rana: D() ? '“My Golden Frog is coming. Ribbit.”' : '“Ahí viene mi Rana Dorada. Croac.”', colibri: D() ? '“Hummingbird time. Zoom zoom.”' : '“Le toca al Colibrí. Zum zum.”' };
    const pips = n => '●'.repeat(n) + '○'.repeat(3 - n);
    const card = (k, o) => `<button class="cc ${o && o.cls || ''}" ${o && o.btn ? `data-c="${k}"` : 'disabled'}><i>${C[k].e}</i><b>${C[k].n}</b><small>beats ${C[C[k].beats].e} ${C[C[k].beats].n}</small></button>`;
    const back = () => `<div class="cc back" aria-label="Juandi’s card, face down"><i>❓</i><b>Juandi</b><small>face down</small></div>`;
    const head = () => `<i class="k">Criaturas de Colombia · first to 3 wins</i><div class="sb"><span>You <b>${pips(me2)}</b></span><span>Juandi <b>${pips(him)}</b></span></div>`;
    const rules = () => {
      m.sh.innerHTML = `<div class="wd-mg cg">${head()}<h2>How to play</h2><p>You and Juandi each play one card at the same time. Each animal beats one other animal:</p>
        <div class="loop"><span>🐆 Jaguar</span><em>beats</em><span>🐸 Frog</span><em>beats</em><span>🐦 Hummingbird</span><em>beats</em><span>🐆 Jaguar</span></div>
        <p>Same card = tie. Juandi likes to brag about what he’ll play next. <b>He tells the truth most of the time…</b> but not always.</p><div class="row"><button class="b go" data-go>Let’s play!</button></div></div>`;
      const b = m.sh.querySelector('[data-go]'); b.focus({ preventScroll: true }); b.onclick = () => { WD.sfx('tap'); round(); };
    };
    const round = () => {
      plan = K[Math.floor(Math.random() * 3)]; if(last && Math.random() < .4) plan = Object.keys(C).find(k => C[k].beats === last);
      honest = Math.random() < .7; const said = honest ? plan : K.filter(k => k !== plan)[Math.floor(Math.random() * 2)];
      m.sh.innerHTML = `<div class="wd-mg cg">${head()}<p class="brag"><b>Juandi:</b> ${esc(brag[said])}</p><div class="table"><div class="side"><small>Juandi’s card</small>${back()}</div></div><p class="pick">Pick your card:</p><div class="cards">${K.map(k => card(k, { btn: true })).join('')}</div></div>`;
      m.sh.querySelectorAll('[data-c]').forEach(b => b.onclick = () => reveal(b.dataset.c, said));
      const f = m.sh.querySelector('[data-c]'); if(f) f.focus({ preventScroll: true });
    };
    const reveal = (k, said) => {
      last = k; const h = plan; let res, why;
      if(C[k].beats === h){ me2++; res = 'win'; why = C[k].why; WD.sfx('nice'); }
      else if(C[h].beats === k){ him++; res = 'lose'; why = C[h].why; WD.sfx('miss'); }
      else { res = 'tie'; why = 'Same animal. Nobody gets a point.'; WD.sfx('tap'); }
      const over = me2 >= 3 || him >= 3;
      const lie = said !== h ? `<p class="fine">(Juandi said ${C[said].e} but played ${C[h].e}. Sneaky!)</p>` : '';
      m.sh.innerHTML = `<div class="wd-mg cg">${head()}<div class="table"><div class="side"><small>You</small>${card(k, { cls: res === 'win' ? 'won' : res === 'lose' ? 'lost' : '' })}</div><div class="vs2">VS</div><div class="side"><small>Juandi</small>${card(h, { cls: res === 'lose' ? 'won' : res === 'win' ? 'lost' : '' })}</div></div>
        <h2 class="res ${res}">${res === 'win' ? 'You win this round!' : res === 'lose' ? 'Juandi wins this round' : 'Tie!'}</h2><p>${esc(why)}</p>${lie}
        <div class="row"><button class="b go" data-n>${over ? (me2 >= 3 ? 'You won the match!' : 'Juandi won the match') : 'Next round'}</button></div></div>`;
      const b = m.sh.querySelector('[data-n]'); b.focus({ preventScroll: true });
      b.onclick = () => { WD.sfx('tap'); if(!over) return round(); WD.sfx(me2 >= 3 ? 'win' : 'lose'); m.close(); res2(me2 >= 3); };
    };
    const res2 = res;
    rules();
  });
}
/* Diego's penalties: the aim swings, Diego dives. Shoot where he isn’t. */
function penaltyGame(){
  if(MG_AUTO()) return Promise.resolve(4);
  return new Promise(res => {
    const m = mgSheet(); let shot = 0, goals = 0, aim = .5, ad = 1, kp = .5, kd = 1, raf = 0, busy = false;
    m.sh.innerHTML = `<div class="wd-mg"><i class="k">Penaltis con Diego · 5 shots, score 3</i><h2>Goals: <span class="g">0</span> / <span class="s">0</span></h2><p>The yellow ring swings across the goal. Tap <b>Kick!</b> when it’s far from Diego.</p><div class="goal"><div class="net"></div><div class="keeper"></div><div class="aim"></div></div><div class="row"><button class="b go" data-k>⚽ Kick!</button></div><p class="score"></p></div>`;
    const K = m.sh.querySelector('.keeper'), A = m.sh.querySelector('.aim'), gS = m.sh.querySelector('.g'), sS = m.sh.querySelector('.s'), sc = m.sh.querySelector('.score'), btn = m.sh.querySelector('[data-k]');
    const loop = () => { if(!busy){ aim += ad * .016; if(aim > .9 || aim < .1) ad = -ad; kp += kd * (.006 + shot * .0015); if(kp > .82 || kp < .18) kd = -kd; if(Math.random() < .01) kd = -kd; } K.style.left = (kp * 100) + '%'; A.style.left = (aim * 100) + '%'; raf = requestAnimationFrame(loop); }; loop();
    btn.focus({ preventScroll: true });
    btn.onclick = () => { if(busy) return; busy = true; shot++; const dive = kp + (aim - kp) * .55; const save = Math.abs(dive - aim) < .13; K.style.left = (dive * 100) + '%';
      if(save){ WD.sfx('miss'); sc.textContent = D() ? '¡Atajada! Diego saves it.' : '¡Atajada! Mi papá la tapó.'; } else { goals++; WD.sfx('cheer'); sc.textContent = '¡GOOOOL!'; }
      gS.textContent = goals; sS.textContent = shot;
      setTimeout(() => { busy = false; if(shot >= 5 || goals >= 3 || shot - goals > 2){ cancelAnimationFrame(raf); m.close(); res(goals); } }, 900); };
  });
}
/* Titin's taxi race through Bogotá: three lanes, buses, motorbikes, potholes, pigeons */
const RACE = { mode: 'race' };
let RS = null;
function taxiRace(){
  if(MG_AUTO()) return Promise.resolve(true);
  return new Promise(res => {
    const prev = WD.scene, prevMode = WD.mode;
    WD.pageTurn(() => {
      RS = { t: 0, lane: 1, ly: 1, dist: 0, goal: 6500, time: 38, speed: 70, obs: [], cups: [], bump: 0, honk: 0, done: false, res, prev, prevMode, cool: 0, next: 120, msg: '', msgT: 0 };
      WD.setScene(RACE, 'race'); WD.MUS.play('race'); WD.showControls(true); WD.$('.wd-b').hidden = true; WD.$('.wd-p').hidden = true; WD.showGoal(false); WD.letter = 0;
    });
  });
}
const LANES = [42, 66, 90];
RACE.onA = function(){ if(!RS || RS.done) return; RS.honk = .5; WD.sfx('honk'); RS.obs.forEach(o => { if(o.kind === 'pigeons' && o.x - RS.dist < 260 && o.x - RS.dist > -20){ o.gone = true; } }); RS.speed = Math.min(190, RS.speed + 18); };
RACE.update = function(dt){
  const R = RS; if(!R || R.done) return;
  R.t += dt; R.time -= dt; R.cool -= dt; R.honk = Math.max(0, R.honk - dt); R.bump = Math.max(0, R.bump - dt); R.msgT -= dt;
  const st = WD.stick(); if(R.cool <= 0){ if(st.y < -.5 && R.lane > 0){ R.lane--; R.cool = .22; WD.sfx('whoosh'); } else if(st.y > .5 && R.lane < 2){ R.lane++; R.cool = .22; WD.sfx('whoosh'); } }
  R.ly = lerp(R.ly, R.lane, Math.min(1, dt * 12));
  R.speed = Math.min(R.bump > 0 ? 60 : 165, R.speed + dt * 40);
  R.dist += R.speed * dt * 1.6;
  while(R.next < R.dist + 700){ const kinds = ['bus', 'moto', 'hole', 'pigeons', 'moto', 'bus']; const k = kinds[Math.floor(Math.random() * kinds.length)]; const lane = Math.floor(Math.random() * 3); R.obs.push({ x: R.next + 400, lane, kind: k, len: k === 'bus' ? 120 : k === 'moto' ? 40 : 34 }); if(Math.random() < .35) R.cups.push({ x: R.next + 470, lane: (lane + 1 + Math.floor(Math.random() * 2)) % 3 }); R.next += 150 + Math.random() * 130; }
  const tx = R.dist + 60, tl = Math.round(R.ly);
  R.obs.forEach(o => { if(o.hit || o.gone) return; if(o.lane === tl && tx + 40 > o.x && tx - 40 < o.x + o.len){ o.hit = true; R.bump = .7; R.time -= 3; R.speed = 40; WD.sfx('hit'); WD.shake(6); R.msg = o.kind === 'pigeons' ? (D() ? 'Pigeons! Honk next time!' : '¡Las palomas! ¡Pite!') : o.kind === 'hole' ? (D() ? '¡Hueco! Pothole!' : '¡Un hueco!') : (D() ? '¡Cuidado! Careful!' : '¡Cuidado!'); R.msgT = 1.2; } });
  R.cups.forEach(cu => { if(!cu.got && cu.lane === tl && Math.abs(tx - cu.x) < 26){ cu.got = true; R.time += 2; WD.sfx('get'); R.msg = '+2s ☕'; R.msgT = .9; } });
  R.obs = R.obs.filter(o => o.x + o.len > R.dist - 200); R.cups = R.cups.filter(cu => cu.x > R.dist - 200);
  if(R.dist >= R.goal || R.time <= 0){ R.done = true; const win = R.dist >= R.goal; WD.sfx(win ? 'win' : 'lose'); setTimeout(() => { WD.pageTurn(() => { WD.setScene(R.prev, R.prevMode === 'race' ? 'cutscene' : R.prevMode); WD.showControls(false); RS = null; }).then(() => R.res(win)); }, 900); }
};
RACE.draw = function(t, dt){
  const R = RS; if(!R) return; const c = WD.ctx, v = WD.view;
  WD.cam.x = R.dist + 200; WD.cam.z = 1; WD.cam.y = 66;
  bogSky(t, dt, 'eve');
  WD.setLayer(.55); for(let x = Math.floor((WD.cam.x * .55 - 600) / 200) * 200; x < WD.cam.x * .55 + 700; x += 200){ drawCasa(c, x, 180, ['#FFFDF6', '#F2D7A0', '#BFE0D6', '#F7C9B4'][Math.abs(x / 200) % 4 | 0], t, { lit: true, flag: (x / 200) % 3 === 0, door: false }); }
  WD.setLayer(1);
  const x0 = WD.cam.x - WD.viewL - 40, x1 = WD.cam.x + WD.viewL + 40;
  c.fillStyle = '#4A4A52'; c.fillRect(x0, 26, x1 - x0, 90); c.fillStyle = '#CFC6B6'; c.fillRect(x0, 18, x1 - x0, 8); c.fillRect(x0, 116, x1 - x0, 400); c.fillStyle = '#9A9086'; c.fillRect(x0, 114, x1 - x0, 4); c.strokeStyle = 'rgba(90,80,70,.25)'; c.lineWidth = 1; for(let x = Math.floor(x0 / 30) * 30; x < x1; x += 30){ c.beginPath(); c.moveTo(x, 118); c.lineTo(x - 20, 300); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.7)'; [54, 78].forEach(y => { for(let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) c.fillRect(x, y, 22, 2); });
  R.cups.forEach(cu => { if(cu.got) return; c.save(); c.translate(cu.x, LANES[cu.lane] - 10); c.scale(.8, .8); ICON2.tinto(c, t); c.restore(); });
  R.obs.forEach(o => { const y = LANES[o.lane]; if(o.gone){ c.fillStyle = '#9AA1AE'; for(let i = 0; i < 4; i++){ ell(c, o.x + i * 8, y - 30 - (t * 80 % 40) - i * 6, 4, 2.4); c.fill(); } return; }
    if(o.kind === 'bus'){ c.fillStyle = '#C2302A'; rr(c, o.x, y - 40, o.len, 36, 6); c.fill(); c.fillStyle = '#9CC3EA'; for(let i = 0; i < 5; i++) c.fillRect(o.x + 8 + i * 22, y - 34, 16, 12); c.fillStyle = '#26242A'; [o.x + 20, o.x + o.len - 20].forEach(wx => { ell(c, wx, y - 3, 7, 7); c.fill(); }); c.fillStyle = '#FFFDF6'; c.font = '900 7px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('TRANSMI', o.x + o.len / 2, y - 14); }
    else if(o.kind === 'moto'){ c.fillStyle = '#26242A'; [o.x + 6, o.x + 32].forEach(wx => { ell(c, wx, y - 4, 6, 6); c.fill(); }); c.fillStyle = '#3E6FB5'; rr(c, o.x + 4, y - 16, 30, 8, 3); c.fill(); c.fillStyle = '#2B1D14'; rr(c, o.x + 14, y - 32, 10, 16, 4); c.fill(); c.fillStyle = YEL; ell(c, o.x + 19, y - 34, 6, 5); c.fill(); }
    else if(o.kind === 'hole'){ c.fillStyle = '#2E2E36'; ell(c, o.x + 17, y - 2, 18, 6); c.fill(); c.fillStyle = 'rgba(120,170,220,.5)'; ell(c, o.x + 17, y - 3, 12, 3.4); c.fill(); }
    else { for(let i = 0; i < 4; i++){ c.fillStyle = '#9AA1AE'; ell(c, o.x + i * 9, y - 5 - (i % 2) * 2, 4.6, 3.2); c.fill(); c.fillStyle = '#7C8392'; ell(c, o.x + 4 + i * 9, y - 8, 2.2, 2); c.fill(); } } });
  drawTaxi(c, R.dist + 60, LANES[0] + (LANES[2] - LANES[0]) * R.ly / 2, t, .8, R.honk > 0);
  // HUD
  c.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  const w = Math.min(360, v.w * .5), hx = (v.w - w) / 2, hy = 14;
  c.fillStyle = '#2B1D14'; rr(c, hx - 4, hy - 4, w + 8, 18, 9); c.fill(); c.fillStyle = '#FFF8EC'; rr(c, hx, hy, w, 10, 5); c.fill(); c.fillStyle = YEL; rr(c, hx, hy, w * Math.min(1, R.dist / R.goal), 10, 5); c.fill();
  c.fillStyle = '#FFF8EC'; c.font = '900 13px Grandstander, system-ui'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#2B1D14';
  const tt = `⏱ ${Math.max(0, R.time).toFixed(1)}s`; c.strokeText(tt, hx, hy + 30); c.fillText(tt, hx, hy + 30);
  c.textAlign = 'right'; c.strokeText('Monserrate ⛰', hx + w, hy + 30); c.fillText('Monserrate ⛰', hx + w, hy + 30);
  if(R.msgT > 0){ c.textAlign = 'center'; c.font = '900 18px Grandstander, system-ui'; c.strokeText(R.msg, v.w / 2, v.h * .3); c.fillStyle = YEL; c.fillText(R.msg, v.w / 2, v.h * .3); }
  if(R.t < 2.5){ c.textAlign = 'center'; c.font = '900 14px Grandstander, system-ui'; c.fillStyle = '#FFF8EC'; const s = 'Up/down to switch lanes · A to honk'; c.strokeText(s, v.w / 2, v.h * .2); c.fillText(s, v.w / 2, v.h * .2); }
  WD.drawVignette(false);
};

/* ================= INTERLUDE 2: the cargo hold ================= */
const HOLD2 = { hero: null, partner: null };
async function startInterlude2(){
  await WD.card(`<i class="k">Interlude</i><h2>Meanwhile, Dayla…</h2><p>High above the Andes, in the belly of a very fancy airship, a Boston terrier wakes up on a pile of coffee sacks.</p><p class="fine">You’re playing as Dayla. A to sniff and look, B to Love Attack.</p>`, [{ label: 'Play as Dayla', alt: true }]);
  HOLD2.hero = W.player; HOLD2.partner = W.partner;
  const d = WD.makeEnt({ kind: 'dog', name: 'Dayla', x: 150, y: 70, dir: 1 });
  W.player = d; W.partner = null; WD.asDayla = true;
  await WD.gotoArea('cargo', 150, 70, { dir: 1, from: 'ch2' });
}
async function endInterlude2(){
  WD.asDayla = false; S('int2_done');
  W.player = HOLD2.hero || WD.makeEnt({ kind: 'human', look: WD.LOOKS[WD.hero], name: WD.hero });
  W.partner = HOLD2.partner || (WD.G.partner ? WD.makePartner() : null); if(W.partner) W.partner.follow = true;
  HOLD2.hero = HOLD2.partner = null;
  await WD.gotoArea('bog_home', 600, 66, { dir: 1, from: 'cargo', cut: true });
  await WD.fade(0, 500);
  await goodbyeScene();
}
async function goodbyeScene(){
  await WD.cut(async () => {
    S('c2_bye'); WD.cam.lock = true; await WD.camTo(640, .95, 700);
    await WD.narrate(D() ? '(The next morning. Mami Elsa’s table. Arepas, hot chocolate with cheese, and the whole family talking at once.)' : '(A la mañana siguiente. Arepas, chocolate con queso, y toda la familia hablando al mismo tiempo.)');
    await fam('Mami Elsa', 'You go to Canada. You bring Dayla home. And then you bring her HERE, so I can feed her.', 'Se van para Canadá. Traen a Dayla a la casa. Y después me la traen AQUÍ, para darle de comer.', 'determined');
    await fam('Titin', D() ? 'I drive you to the airport! New English word today: “Goodbye.” I don’t like this word.' : 'Yo los llevo al aeropuerto. Palabra nueva en inglés: “Goodbye.” No me gusta esa palabra.', 'Yo los llevo al aeropuerto. Palabra nueva en inglés: “Goodbye.” No me gusta esa palabra.', 'sad');
    if(D()){ await say('Laura', 'Lunita, you want to come to Canada? …She’s already in the suitcase.', { expr: 'joy' }); await me('Then it’s settled. Next stop: Surrey, B.C. My dad’s house. Bring a jacket.', '', 'determined'); }
    else { await me('', { t: 'Lunita, ¿quieres venir a Canadá? …Ya se metió en la maleta.', es: 'Lunita, ¿quieres venir a Canadá? …Ya se metió en la maleta.' }, 'joy'); await say('David', 'Then it’s settled. Next stop: Surrey, B.C. My dad’s house. You’ll need a real coat.', { expr: 'determined' }); }
    WD.MUS.play('abuela');
    await WD.card(`<i class="k">Next</i><h2>Chapter 3: Eh, Where’s Dayla?</h2><p>Surrey, Vancouver, and a ferry to Victoria. Steven’s jokes, Roberta’s dance moves, and cat pirates on the water.</p><p>Chapter 3 arrives in the next update. Until then, Bogotá is yours: Titin’s taxi goes anywhere, and there may be toys and pins you missed.</p>`, [{ label: 'Keep exploring', alt: true }]);
    WD.cam.lock = false; WD.updateGoal(); WD.saveNow();
  });
}
WD.defineArea('cargo', {
  ch: 'i2', name: 'The Cargo Hold', sub: 'Somewhere over the Andes', music: 'cargo', light: 'indoor', noSave: true, minX: 90, maxX: 940, laneTop: 50, laneBot: 92, camMin: -70, camMax: 1040, camZ: 1.0, battleBack: 'cargo',
  npcs(){
    NPC.kairos = WD.makeEnt({ kind: 'cat', look: WD.CATS.kairos, name: 'Kairos', x: 470, y: 40, z: 34, dir: -1, light: 'indoor', noShadow: true, zSort: -20, talkTo: talkKairos });
    NPC.guard = WD.makeEnt({ kind: 'cat', look: WD.CATS.agent2, name: 'Cat Agent', x: 650, y: 64, dir: -1, light: 'indoor', talkTo: () => WD.cut(async () => { if(F('j_love')) await say('Cat Agent', 'So… many… licks. I need a minute. Maybe a nap.', { ent: NPC.guard, expr: 'joy' }); else await say('Cat Agent', 'Nope. Those are the Client’s maple cookies. From CANADA. Back to your coffee sacks, package.', { ent: NPC.guard, expr: 'smirk' }); }) });
    if(F('j_love')){ NPC.guard.rot = -1.4; NPC.guard.expr = 'joy'; NPC.guard.y = 78; }
    return [NPC.kairos, NPC.guard];
  },
  limit(nx, px){ if(!F('j_love') && px <= 620) return Math.min(nx, 606); return nx; },
  drawBack(t){ const c = WD.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2A2430'; c.fillRect(0, 0, WD.cv.width, WD.cv.height); WD.setLayer(1); drawCargo(c, t);
    // coffee sacks
    [[110, 40], [160, 46], [130, 30]].forEach(([x, y]) => { c.fillStyle = '#C9A877'; rr(c, x - 24, y - 20, 48, 26, 10); c.fill(); c.fillStyle = '#7A5234'; c.font = '900 6px Grandstander, system-ui'; c.textAlign = 'center'; c.fillText('CAFÉ', x, y - 6); });
    // crates bound for Canada
    [[470, '#C9A15A', 'YYJ'], [760, '#B98A4A', 'VICTORIA']].forEach(([x, col, tag]) => { c.fillStyle = col; rr(c, x - 44, -20, 88, 42, 3); c.fill(); c.strokeStyle = '#7A5234'; c.lineWidth = 1.2; for(let k = -36; k < 44; k += 12){ c.beginPath(); c.moveTo(x + k, -16); c.lineTo(x + k, 18); c.stroke(); } c.fillStyle = '#C2302A'; c.save(); c.translate(x - 22, 0); c.beginPath(); for(let i = 0; i < 11; i++){ const a = -Math.PI / 2 + i * Math.PI * 2 / 11, r = i % 2 ? 4 : 9; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.restore(); c.fillStyle = '#FFFDF6'; rr(c, x - 8, -6, 46, 12, 2); c.fill(); c.fillStyle = '#2B1D14'; c.font = '900 7px Grandstander, system-ui'; c.fillText(tag, x + 15, 2.4); });
    if(!F('j_cookies')){ c.fillStyle = '#C2302A'; rr(c, 700, 26, 30, 18, 3); c.fill(); c.fillStyle = '#E9C47A'; ell(c, 715, 26, 12, 4); c.fill(); }
    // the Collection's golden frog on a pedestal
    c.fillStyle = '#5A4A60'; c.fillRect(270, -50, 40, 60); drawFrog(c, 290, -62, 1.4); c.fillStyle = GOLD; c.font = '800 5px Nunito, system-ui'; c.fillText('THE COLLECTION', 290, 18);
    // ferry schedule on the wall + the mail chute
    c.fillStyle = '#FFFDF6'; c.fillRect(560, -150, 70, 50); c.fillStyle = '#3E6FB5'; c.fillRect(560, -150, 70, 10); c.fillStyle = '#2B1D14'; c.font = '900 6px Grandstander, system-ui'; c.fillText('FERRY · VICTORIA', 595, -136); for(let i = 0; i < 4; i++) c.fillRect(568, -126 + i * 7, 52, 1.6);
    if(F('j_paw')){ WD.drawPaw && WD.drawPaw(c, 610, -112, .8, '#5A3A24'); }
    c.fillStyle = GOLD; rr(c, 860, -70, 54, 24, 3); c.fill(); c.fillStyle = '#2B1D14'; c.fillRect(868, -62, 38, 4); c.font = '900 5px Grandstander, system-ui'; c.fillText('OUTGOING', 887, -51);
  },
  things(){
    const L = [], dsay = text => say('Dayla', text, { ent: W.player });
    L.push({ x: 140, y: 60, label: 'Sacks', h: 60, act: () => WD.cut(async () => { WD.sfx('sniff'); await WD.wait(600); WD.sfx('bark'); WD.shake(3); await dsay('(Sniff sniff… ACHOO! Colombian coffee. Dayla sneezes so hard she flips over. Ten out of ten.)'); S('j_sacks'); }) });
    L.push({ x: 290, y: 60, label: 'Frog', h: 90, act: () => WD.cut(async () => { await dsay('(A shiny golden frog on a pedestal. It does not smell like food. Dayla is not interested.)'); }) });
    if(!F('j_love')) L.push({ x: 650, y: 64, skill: 'b', label: 'Love Attack', h: 80, act: loveGuard2 });
    if(F('j_love') && !F('j_cookies')) L.push({ x: 715, y: 60, label: 'Cookies', h: 70, sparkle: true, act: () => WD.cut(async () => { const p = W.player; await WD.walkTo(p, 700, 64, 90); p.dir = 1; p.eat = 1; WD.sfx('munch'); await WD.wait(900); WD.sfx('munch'); await WD.wait(500); p.eat = 0; S('j_cookies'); await dsay('(Maple cookies, from Canada. Sweet and crunchy. Her paw is now sticky. Very sticky.)'); WD.updateGoal(); }) });
    if(F('j_cookies') && !F('j_paw')) L.push({ x: 595, y: 60, label: 'Schedule', h: 140, sparkle: true, act: () => WD.cut(async () => { const p = W.player; WD.sfx('jump'); await WD.hop(p, 600, 58, 46, 420); S('j_paw'); WD.sfx('get'); await dsay('(She stands on her back legs and slaps her sticky paw right on the ferry schedule. A perfect pawprint. Then she pulls it off the wall.)'); WD.updateGoal(); }) });
    if(F('j_paw') && !F('j_mail')) L.push({ x: 880, y: 60, label: 'Slot', h: 110, sparkle: true, act: mailSchedule });
    return L;
  },
  async enter(){ if(!F('j_start')){ S('j_start'); await WD.cut(async () => {
    const p = W.player; WD.cam.lock = true; WD.cam.x = 260; WD.cam.z = 1.1;
    await say('Dayla', '(Dayla wakes up on a pile of coffee sacks. The floor hums. Out the window: mountains, then clouds.)', { ent: p });
    await say('Dayla', '(She misses her duck. She misses her bowl. She misses the two people who say “good girl” the best.)', { ent: p });
    WD.cam.lock = false; WD.updateGoal();
  }); } }
});
function talkKairos(){ WD.cut(async () => {
  const k = NPC.kairos;
  if(!F('j_kairos')){ S('j_kairos');
    await say('Kairos', '…Don’t. Don’t do the love thing. I know that trick.', { ent: k, expr: 'angry' });
    await say('Dayla', '(Dayla wags her whole body. This cat smells… a tiny bit like home? Like an old blanket she’s never met.)', { ent: W.player });
    await say('Kairos', 'They taught you that, didn’t they. The tall one and the one with the ponytail. They teach everyone that. Then they give you away.', { ent: k, expr: 'sad' });
    await say('Kairos', '…Whatever. The Collector says you’re going to Canada. I’m not here to babysit. I’m here to make sure you don’t eat the cargo.', { ent: k, expr: 'angry' });
    await say('Dayla', '(Dayla has already decided they are best friends.)', { ent: W.player });
    WD.updateGoal(); return; }
  await say('Kairos', 'Stop looking at me like that. …And stay away from the cookies. Seriously.', { ent: k, expr: 'smirk' });
}); }
async function loveGuard2(){
  await WD.cut(async () => {
    const p = W.player, g = NPC.guard; p.happy = true; WD.sfx('bark');
    await WD.hop(p, g.x - 18, g.y, 26, 420); WD.sfx('big'); WD.shake(8); WD.emote(g, 'heart', 2);
    await WD.tween(400, u => { g.rot = -1.4 * u; g.y = lerp(64, 78, u); }); g.expr = 'joy';
    await say('Cat Agent', 'Not again! Not the licks! I have a family! …Okay, who’s a good girl. You. It’s always you.', { ent: g, expr: 'joy' });
    await say('Kairos', '…Pathetic.', { ent: NPC.kairos, expr: 'smirk' });
    p.happy = false; S('j_love'); WD.updateGoal();
  });
}
async function mailSchedule(){
  await WD.cut(async () => {
    const p = W.player; WD.sfx('jump'); await WD.hop(p, 876, 60, 30, 420); WD.sfx('door'); S('j_mail');
    await say('Dayla', '(Into the OUTGOING slot it goes. It worked last time. Somebody, somewhere, will see that pawprint.)', { ent: p });
    await say('Kairos', '…Huh. Clever dog.', { ent: NPC.kairos, expr: 'surprised' });
    WD.cam.lock = true; await WD.camTo(700, 1.1, 800); WD.sfx('ring'); await WD.wait(400);
    await say('???', '*crackle* Is the package comfortable?', { expr: 'happy' });
    await say('Cat Agent', 'Sir. She ate your maple cookies, sir. And she licked me. Again.', { ent: NPC.guard, expr: 'worried' });
    await say('???', 'Marvelous. Next stop: Canada. The ferry, then the island. Kairos, keep her happy. Happy dogs are worth more.', { expr: 'happy' });
    await say('Kairos', '…Yes, sir.', { ent: NPC.kairos, expr: 'sad' });
    p.eat = 1; WD.sfx('munch'); await say('Dayla', '(Munch. One last cookie crumb, stuck to her paw.)', { ent: p });
    await WD.fade(1, 600); await WD.wait(300); p.eat = 0;
    await endInterlude2();
  });
}

/* ================= music ================= */
Object.assign(WD.SONGS, {
  bogota: { bpm: 100, lead: 'pluck', groove: 'cumbia', chords: [[45, 57, 60, 64], [52, 56, 59, 64], [45, 57, 60, 64], [50, 53, 57, 62]],
    mel: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 72, 0, 74, 0, 0, 0, 76, 0, 0, 74, 72, 0, 71, 0, 68, 0, 69, 0, 71, 0, 0, 0, 69, 0, 72, 0, 76, 0, 79, 0, 77, 0, 76, 0, 74, 0, 72, 0, 74, 0, 72, 0, 71, 0, 68, 0, 69, 0, 0, 0, 0, 0, 0, 0] },
  abuela: { bpm: 84, lead: 'bell', groove: 'cozy', chords: [[48, 52, 55, 60], [41, 53, 57, 60], [43, 55, 59, 62], [48, 52, 55, 64]],
    mel: [72, 0, 0, 74, 76, 0, 79, 0, 77, 0, 76, 0, 74, 0, 0, 0, 72, 0, 0, 74, 76, 0, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 77, 79, 0, 81, 0, 79, 0, 77, 0, 76, 0, 0, 0, 74, 0, 76, 0, 74, 0, 71, 0, 72, 0, 0, 0, 0, 0, 0, 0] },
  plaza: { bpm: 112, lead: 'pan', groove: 'cumbia', chords: [[43, 55, 59, 62], [48, 52, 55, 60], [50, 54, 57, 62], [43, 55, 59, 62]],
    mel: [67, 0, 71, 0, 74, 0, 79, 0, 78, 0, 76, 0, 74, 0, 0, 0, 72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 0, 0, 0, 0, 0, 0, 74, 0, 78, 0, 81, 0, 78, 0, 79, 0, 76, 0, 74, 0, 72, 0, 71, 0, 74, 0, 72, 0, 69, 0, 67, 0, 0, 0, 0, 0, 0, 0] },
  mall: { bpm: 120, lead: 'pluck', groove: 'calypso', chords: [[48, 52, 55, 59], [45, 52, 55, 60], [41, 53, 57, 60], [43, 55, 59, 62]],
    mel: [76, 0, 79, 0, 83, 0, 79, 0, 81, 0, 0, 0, 79, 0, 0, 0, 76, 0, 77, 0, 79, 0, 77, 76, 74, 0, 0, 0, 0, 0, 0, 0, 72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 81, 0, 79, 0, 0, 0, 77, 0, 76, 0, 74, 0, 71, 0, 72, 0, 0, 0, 0, 0, 0, 0] },
  mountain: { bpm: 88, lead: 'pan', groove: 'sneak', chords: [[45, 57, 60, 64], [41, 53, 57, 60], [43, 55, 59, 62], [40, 52, 56, 59]],
    mel: [69, 0, 0, 72, 76, 0, 0, 0, 74, 0, 72, 0, 71, 0, 0, 0, 72, 0, 0, 69, 65, 0, 0, 0, 67, 0, 0, 0, 0, 0, 0, 0, 69, 0, 72, 0, 76, 0, 81, 0, 79, 0, 76, 0, 74, 0, 0, 0, 71, 0, 72, 0, 74, 0, 71, 0, 69, 0, 0, 0, 0, 0, 0, 0] },
  condor: { bpm: 138, lead: 'square', groove: 'march', chords: [[45, 57, 60, 64], [41, 53, 57, 60], [43, 55, 58, 62], [40, 52, 56, 59]],
    mel: [69, 0, 69, 72, 76, 0, 72, 0, 81, 0, 0, 0, 76, 0, 0, 0, 77, 0, 77, 76, 74, 0, 72, 0, 71, 0, 0, 0, 68, 0, 0, 0, 69, 0, 72, 0, 76, 0, 81, 0, 84, 0, 81, 0, 77, 0, 74, 0, 76, 0, 74, 0, 72, 0, 71, 0, 69, 0, 0, 0, 64, 0, 0, 0] },
  race: { bpm: 160, lead: 'square', groove: 'drive', chords: [[45, 57, 60, 64], [43, 55, 59, 62], [41, 53, 57, 60], [40, 52, 56, 59]],
    mel: [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 0, 67, 0, 0, 0, 72, 0, 0, 67, 0, 0, 64, 0, 0, 69, 0, 71, 0, 70, 69, 0, 67, 76, 79, 81, 0, 77, 79, 0, 76, 0, 72, 74, 71, 0, 0, 0, 72, 0, 0, 67, 0, 0, 64, 0, 69, 0, 71, 0, 69, 0, 68, 0] },
  cargo: { bpm: 86, lead: 'pluck', groove: 'sneak', chords: [[40, 52, 55, 59], [45, 52, 57, 60], [47, 51, 54, 59], [40, 52, 55, 59]],
    mel: [64, 0, 67, 0, 71, 0, 0, 70, 71, 0, 0, 0, 67, 0, 0, 0, 69, 0, 72, 0, 76, 0, 0, 75, 76, 0, 0, 0, 0, 0, 0, 0, 74, 0, 0, 72, 71, 0, 69, 0, 67, 0, 0, 66, 64, 0, 0, 0, 63, 0, 66, 0, 69, 0, 72, 0, 71, 0, 0, 0, 0, 0, 0, 0] }
});

/* ================= chapter start, saves ================= */
WD.chapterStart = WD.chapterStart || {};
WD.chapterStart[2] = async function(){
  const G = WD.G;
  if(!F('c2_arrived')){
    await WD.card(`<i class="k">Chapter 2</i><h2>Abuela’s Kitchen</h2><p>Bogotá, Colombia. 2,600 metres up in the Andes. Family, food, a mountain with a church on top… and a giant bird.</p>`, [{ label: 'Begin', alt: true }]);
    S('c2_arrived'); G.chapter = Math.max(G.chapter || 0, 2);
  }
  await WD.gotoArea('bog_street', 300, 70, { dir: 1, from: 'airport' });
};
const prevRepair2 = WD.repairSave;
WD.repairSave = function(G0){
  if(prevRepair2) prevRepair2(G0);
  const fl = G0.flags;
  if(fl.c2_lunita && !G0.party.lunita){ const keep = G0.partner; WD.G = WD.G || G0; G0.party.lunita = { hp: 10 + Math.max(0, G0.lv - 1) * 2, mhp: 10 + Math.max(0, G0.lv - 1) * 2 }; if(!keep) G0.partner = 'lunita'; }
  if(G0.area === 'cargo' || (fl.c2_photo && !fl.int2_done)){ G0.area = 'bog_summit'; G0.x = 1100; G0.y = 66; ['j_start', 'j_sacks', 'j_kairos', 'j_love', 'j_cookies', 'j_paw', 'j_mail'].forEach(k => { delete fl[k]; }); }
  if(G0.area === 'bog_trail' && !fl.c2_race) G0.area = 'bog_street';
  // scenes that were cut off by closing the app: finish what they hand out, or let them replay
  const key = k => { if(!G0.key.includes(k)) G0.key.push(k); }, clu = k => { if(!G0.clues.includes(k)) G0.clues.push(k); };
  if(fl.c2_lunch){ key('bogtag'); clu('taxi'); }
  if(fl.c2_mall_in){ fl.list_get = 1; key('list'); }
  if(fl.c2_boss_m && !fl.c2_lunita){ fl.c2_lunita = 1; key('ticket'); clu('cablecar'); if(!G0.party.lunita) G0.party.lunita = { hp: 10 + Math.max(0, G0.lv - 1) * 2, mhp: 10 + Math.max(0, G0.lv - 1) * 2 }; G0.partner = 'lunita'; }
  if(fl.c2_cards){ key('card'); clu('condor'); G0.pins = G0.pins || []; if(!G0.pins.includes('oro')) G0.pins.push('oro'); }
  if(fl.c2_crate && !fl.c2_boss) delete fl.c2_crate;
  if(fl.c2_race && !fl.c2_boss && G0.area === 'bog_street'){ G0.area = 'bog_trail'; G0.x = 260; G0.y = 66; }
};
const prevAfter2 = WD.afterResume;
WD.afterResume = function(){
  if(prevAfter2) prevAfter2();
  if(F('c2_photo') && !F('c2_done')) setTimeout(() => { WD.cut(async () => { await chapterEnd2(); }); }, 900);
  else if(F('c2_photo') && !F('int2_done')) setTimeout(() => { WD.cut(async () => { await startInterlude2(); }); }, 900);
  else if(F('int2_done') && !F('c2_bye') && WD.W.area && WD.W.area.id === 'bog_home') setTimeout(() => { goodbyeScene(); }, 900);
};
WD.debugCh2 = { introArrival, lunchScene, churchScene, homecoming, cardsScene, raceStart, condorScene, nestScene, chapterEnd2, startInterlude2, endInterlude2, goodbyeScene, cookGame, cardGame, penaltyGame, taxiRace, managerFight };
})();
