// @ts-nocheck
// =============================================================
//  Rhead Home: notification sender (Supabase Edge Function "notify")
//  Sends chat / love note / list pings right away, and checks every
//  15 minutes for bills, plans, tasks, birthdays and trips.
// =============================================================
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const SB_URL = Deno.env.get('SUPABASE_URL');
const SECRET = (() => {
  try { const k = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); return k.default || Object.values(k)[0] || null; } catch (e) { return null; }
})() || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const db = createClient(SB_URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });

const SITE = 'https://rhead-home.pages.dev';
const TZ = 'America/New_York';
const NAME = { david: 'David', laura: 'Laura' };
const other = (w) => (w === 'david' ? 'laura' : 'david');
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

/* ---------- web push: RFC 8291 encryption + RFC 8292 VAPID (WebCrypto only) ---------- BEGIN-PUSH */
const te = new TextEncoder();
const b64u = (buf) => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const ub64 = (s) => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}
async function encryptPayload(sub, text, saltIn, asKeys) {
  const uaPub = ub64(sub.keys.p256dh), authSecret = ub64(sub.keys.auth);
  const as = asKeys || await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, cat(te.encode('WebPush: info\0'), uaPub, asPub), 32);
  const salt = saltIn || crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, cat(te.encode(text), new Uint8Array([2]))));
  return cat(salt, new Uint8Array([0, 0, 16, 0]), new Uint8Array([asPub.length]), asPub, ct);
}
async function vapidHeader(endpoint, vapid, subject) {
  const head = b64u(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = b64u(te.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const key = await crypto.subtle.importKey('jwk', vapid.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, te.encode(head + '.' + body));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${vapid.publicKey}`;
}
async function makeVapid() {
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  return { publicKey: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)), privateJwk: await crypto.subtle.exportKey('jwk', kp.privateKey) };
}
/* END-PUSH */

let VAPID = null;
async function getVapid() {
  if (VAPID) return VAPID;
  const { data } = await db.from('push_config').select('*').eq('id', 1).single();
  if (data && data.vapid_public && data.vapid_private) return (VAPID = { publicKey: data.vapid_public, privateJwk: data.vapid_private, cron: data.cron_secret });
  const v = await makeVapid();
  await db.from('push_config').update({ vapid_public: v.publicKey, vapid_private: v.privateJwk }).eq('id', 1);
  return (VAPID = { ...v, cron: data && data.cron_secret });
}

/* ---------- people's settings ---------- */
const DEF = { on: { chat: true, note: true, list: true, event: true, bill: true, task: true, occasion: true, trip: true, game: true, dayla: false }, quiet: { on: true, from: 22, to: 7, chatThrough: true } };
async function prefsOf(who) {
  const { data } = await db.from('docs').select('data').eq('col', 'meta').eq('id', 'notify-' + who).maybeSingle();
  const p = (data && data.data) || {};
  return { on: { ...DEF.on, ...(p.on || {}) }, quiet: { ...DEF.quiet, ...(p.quiet || {}) } };
}
function inQuiet(p, hour) {
  if (!p.quiet.on) return false;
  const f = Number(p.quiet.from), t = Number(p.quiet.to);
  return f === t ? false : f < t ? hour >= f && hour < t : hour >= f || hour < t;
}

/* ---------- sending ---------- */
async function sendTo(who, note) {
  const v = await getVapid();
  const { data: subs } = await db.from('push_subs').select('*').eq('who', who);
  let sent = 0;
  for (const s of subs || []) {
    try {
      const body = await encryptPayload(s.sub, JSON.stringify(note));
      const r = await fetch(s.endpoint, { method: 'POST', body, headers: {
        TTL: '86400', Urgency: 'high', 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream',
        Authorization: await vapidHeader(s.endpoint, v, SITE) } });
      if (r.status === 404 || r.status === 410) await db.from('push_subs').delete().eq('endpoint', s.endpoint);
      else if (r.ok) sent++;
      else console.warn('push failed', r.status, await r.text());
    } catch (e) { console.warn('push error', String(e)); }
  }
  return sent;
}
async function markOnce(key) {
  const { error } = await db.from('push_sent').insert({ key });
  return !error;
}

/* ---------- local time (wall clock in New York, as ms) ---------- */
function nowWall() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
}
const DAY = 864e5;
const ymdOf = (w) => new Date(w).toISOString().slice(0, 10);
const wall = (ymd, h, m) => { const [y, mo, d] = ymd.split('-').map(Number); return Date.UTC(y, mo - 1, d, h || 0, m || 0); };
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const dowOf = (ymd) => new Date(wall(ymd)).getUTCDay();
const money = (n) => '$' + (Number(n) || 0).toFixed(2).replace(/\.00$/, '');
const fmtTime = (t) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return ((h % 12) || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h >= 12 ? 'pm' : 'am'); };
function occurs(e, dk) {
  if (!e.date || dk < e.date) return false;
  const [sy, sm, sd] = e.date.split('-').map(Number), [y, m, d] = dk.split('-').map(Number);
  switch (e.repeat) {
    case 'yearly': return m === sm && d === Math.min(sd, daysIn(y, m));
    case 'monthly': return d === Math.min(sd, daysIn(y, m));
    case 'weekly': return dowOf(dk) === dowOf(e.date);
    default: return dk === e.date;
  }
}
const toList = (w) => (w === 'david' || w === 'laura' ? [w] : ['david', 'laura']);
async function col(name) {
  const out = []; let from = 0;
  for (;;) {
    const { data } = await db.from('docs').select('id,data').eq('col', name).range(from, from + 999);
    (data || []).forEach((r) => out.push({ id: r.id, ...r.data }));
    if (!data || data.length < 1000) break; from += 1000;
  }
  return out;
}

/* ---------- the 15-minute reminder check ---------- */
async function tick() {
  const now = nowWall(), today = ymdOf(now), hour = new Date(now).getUTCHours();
  const prefs = { david: await prefsOf('david'), laura: await prefsOf('laura') };
  const due = []; // { key, who, kind, note, start, end }
  const add = (key, who, kind, start, end, note) => { if (now >= start && now < end) due.push({ key, who, kind, note }); };

  // bills: 9am the day before
  for (const b of await col('bills')) {
    if (b.auto) continue;
    const d0 = new Date(now);
    for (const off of [0, 1]) {
      const y = d0.getUTCFullYear(), m = d0.getUTCMonth() + 1 + off, Y = m > 12 ? y + 1 : y, M = m > 12 ? m - 12 : m;
      const mk = `${Y}-${String(M).padStart(2, '0')}`;
      if (b.ends && mk > b.ends) continue;
      if ((b.paid || []).includes(mk)) continue;
      const dd = `${mk}-${String(Math.min(Math.max(1, Number(b.due) || 1), daysIn(Y, M))).padStart(2, '0')}`;
      const amt = b.amounts && b.amounts[mk] != null ? b.amounts[mk] : b.amount;
      const start = wall(dd, 9) - DAY;
      for (const w of ['david', 'laura']) add(`bill:${b.id}:${mk}:${w}`, w, 'bill', start, start + 9 * 3600e3,
        { title: `🧾 ${b.name} is due tomorrow`, body: `${amt ? money(amt) + ' · ' : ''}Tap to mark it paid.`, url: '/#money', tag: 'bill-' + b.id });
    }
  }
  // calendar plans: 1 hour before, or 8am for all-day
  const tomorrow = ymdOf(now + DAY);
  for (const e of await col('events')) {
    for (const dk of [today, tomorrow]) {
      if (!occurs(e, dk)) continue;
      const timed = /^\d\d:\d\d$/.test(e.time || '');
      const startAt = timed ? wall(dk, +e.time.slice(0, 2), +e.time.slice(3)) : wall(dk, 8);
      const from = timed ? startAt - 3600e3 : startAt, to = timed ? startAt : startAt + 6 * 3600e3;
      for (const w of toList(e.who)) add(`ev:${e.id}:${dk}:${w}`, w, 'event', from, to,
        { title: `📅 ${e.title}`, body: timed ? `Today at ${fmtTime(e.time)}${e.note ? ' · ' + e.note : ''}` : `Today${e.note ? ' · ' + e.note : ''}`, url: '/#cal', tag: 'ev-' + e.id });
    }
  }
  // tasks: 8am on the due day
  for (const t of await col('todos')) {
    if (t.done || !t.due) continue;
    for (const w of toList(t.who)) add(`todo:${t.id}:${t.due}:${w}`, w, 'task', wall(t.due, 8), wall(t.due, 20),
      { title: '✅ Due today', body: t.text, url: '/#tasks', tag: 'todo-' + t.id });
  }
  // birthdays and special days: 3 days before and the morning of
  const special = [
    { id: 'b-david', date: '2003-07-10', who: 'david', label: 'David’s birthday', bday: true },
    { id: 'b-laura', date: '2004-09-20', who: 'laura', label: 'Laura’s birthday', bday: true },
    { id: 'b-dayla', date: '2025-09-05', label: 'Dayla’s birthday 🐶', bday: true },
    { id: 'anniv', date: '2025-12-20', label: 'Your wedding anniversary 💍', ann: true },
    { id: 'gotcha', date: '2026-01-31', label: 'Dayla’s Gotcha Day 🐾' },
  ];
  for (const o of await col('occasions')) {
    if (!o.date) continue;
    const label = o.title || (o.kind === 'Birthday' ? `${o.person}’s birthday` : o.kind === 'Anniversary' ? `${o.person}’s anniversary` : o.kind === 'Other' ? (o.person || 'Special day') : `${o.person} · ${o.kind}`);
    special.push({ id: o.id, date: o.date, label, bday: o.kind === 'Birthday', noYear: o.noYear });
  }
  const y0 = new Date(now).getUTCFullYear();
  for (const s of special) {
    const [sy, sm, sd] = s.date.split('-').map(Number);
    for (const Y of [y0, y0 + 1]) {
      const dk = `${Y}-${String(sm).padStart(2, '0')}-${String(Math.min(sd, daysIn(Y, sm))).padStart(2, '0')}`;
      if (dk < s.date) continue;
      const n = Y - sy, ord = n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
      const extra = s.noYear || n <= 0 ? '' : s.bday ? ` · turns ${n}` : s.ann ? ` · ${ord}` : '';
      for (const w of ['david', 'laura']) {
        if (s.who !== w) add(`occ3:${s.id}:${dk}:${w}`, w, 'occasion', wall(dk, 9) - 3 * DAY, wall(dk, 21) - 3 * DAY,
          { title: `🎁 ${s.label} is in 3 days`, body: `${extra ? extra.slice(3) + '. ' : ''}Got a plan or a gift?`, url: '/#gifts', tag: 'occ-' + s.id });
        add(`occ0:${s.id}:${dk}:${w}`, w, 'occasion', wall(dk, 8), wall(dk, 20),
          { title: s.who === w ? `🎂 Happy birthday, ${NAME[w]}!` : `🎉 Today: ${s.label}`, body: s.who === w ? 'Hope your day is wonderful ♥' : `${extra ? extra.slice(3) + ' · ' : ''}Don’t forget to celebrate!`, url: '/#home', tag: 'occ-' + s.id });
      }
    }
  }
  // trips: the evening before
  for (const t of await col('trips')) {
    if (!t.start) continue;
    for (const w of ['david', 'laura']) add(`trip:${t.id}:${t.start}:${w}`, w, 'trip', wall(t.start, 19) - DAY, wall(t.start, 23) - DAY,
      { title: `${t.emoji || '🧳'} ${t.name || 'Your trip'} starts tomorrow!`, body: 'Time to pack. Check your packing list.', url: '/#trips', tag: 'trip-' + t.id });
  }
  // Dayla's message: 8am, only if turned on
  for (const w of ['david', 'laura']) add(`dayla:${today}:${w}`, w, 'dayla', wall(today, 8), wall(today, 12),
    { title: '🐾 Dayla left you a message', body: 'Tap to see what she has to say today.', url: '/#home', tag: 'dayla' });

  let sent = 0;
  for (const d of due) {
    const p = prefs[d.who];
    if (!p.on[d.kind]) continue;
    if (inQuiet(p, hour)) continue;          // tried again on the next check
    if (!(await markOnce(d.key))) continue;  // already sent
    sent += await sendTo(d.who, d.note);
  }
  return { checked: due.length, sent };
}

/* ---------- things that happen right away ---------- */
async function onEvent(colName, id) {
  const { data: row } = await db.from('docs').select('data').eq('col', colName).eq('id', id).maybeSingle();
  if (!row) return { sent: 0, why: 'not found' };
  const d = row.data || {}, from = d.by, hour = new Date(nowWall()).getUTCHours();
  let to, kind, note;
  if (colName === 'msgs') {
    to = other(from); kind = 'chat';
    const body = d.text ? String(d.text).slice(0, 180) : d.img ? '📷 Sent a photo' : d.sticker ? 'Sent a sticker' : 'New message';
    note = { title: `💬 ${NAME[from] || 'New message'}`, body, url: '/#chat', tag: 'chat' };
  } else if (colName === 'notes') {
    to = d.to || other(from); kind = 'note';
    note = { title: `💌 A love note from ${NAME[from] || 'your love'}`, body: String(d.text || '').slice(0, 180), url: '/#notes', tag: 'note' };
  } else if (colName === 'items') {
    to = other(from); kind = 'list';
    const { data: last } = await db.from('push_sent').select('at').eq('key', 'list:' + to).maybeSingle();
    if (last && Date.now() - new Date(last.at).getTime() < 30 * 60e3) return { sent: 0, why: 'recently sent' };
    await db.from('push_sent').upsert({ key: 'list:' + to, at: new Date().toISOString() });
    note = { title: `🛒 ${NAME[from] || 'Someone'} added to ${d.list || 'the list'}`, body: String(d.text || ''), url: '/#lists', tag: 'list' };
  } else return { sent: 0, why: 'not notified' };
  if (!NAME[to] || to === from) return { sent: 0 };
  const p = await prefsOf(to);
  if (!p.on[kind]) return { sent: 0, why: 'turned off' };
  if (inQuiet(p, hour) && !((kind === 'chat' || kind === 'note') && p.quiet.chatThrough)) return { sent: 0, why: 'quiet hours' };
  return { sent: await sendTo(to, note) };
}

/* ---------- game turns: calm, one per game, never stacked ---------- */
const GAME_NAMES = { gw: 'Guess Who', c4: 'Connect Four', pict: 'Draw & Guess', kq: 'How well do you know me?' };
async function onTurn(game, from, over) {
  if (!GAME_NAMES[game] || !NAME[from]) return { sent: 0, why: 'unknown game' };
  const to = other(from), key = 'turn:' + game + ':' + to;
  // they are in the app right now: they will see it, no buzz
  const { data: on } = await db.from('docs').select('data').eq('col', 'meta').eq('id', 'online_' + to).maybeSingle();
  if (on && on.data && Date.now() - Number(on.data.at || 0) < 150e3) return { sent: 0, why: 'they are in the app' };
  // only one buzz per game every 15 minutes (the notification itself gets replaced, not stacked)
  if (!over) {
    const { data: last } = await db.from('push_sent').select('at').eq('key', key).maybeSingle();
    if (last && Date.now() - new Date(last.at).getTime() < 15 * 60e3) return { sent: 0, why: 'recently sent' };
  }
  await db.from('push_sent').upsert({ key, at: new Date().toISOString() });
  const p = await prefsOf(to);
  if (!p.on.game) return { sent: 0, why: 'turned off' };
  if (inQuiet(p, new Date(nowWall()).getUTCHours())) return { sent: 0, why: 'quiet hours' };
  const n = NAME[from], g = GAME_NAMES[game];
  const body = over ? `${n} finished the game. Come see who won!`
    : game === 'pict' ? `${n} drew something. Can you guess it?`
    : game === 'kq' ? `${n} answered the questions. Your turn to guess!`
    : `${n} made a move. Your turn!`;
  return { sent: await sendTo(to, { title: `🎮 ${g}`, body, url: '/#games', tag: 'game-' + game }) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    if (body.kind === 'tick') {
      const v = await getVapid();
      if (!v.cron || req.headers.get('x-cron-secret') !== v.cron) return json({ error: 'not allowed' }, 401);
      return json(await tick());
    }
    // everything else must come from David or Laura, signed in
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u } = await db.auth.getUser(token);
    if (!u || !u.user) return json({ error: 'sign in first' }, 401);
    if (body.kind === 'key') return json({ publicKey: (await getVapid()).publicKey });
    if (body.kind === 'test') return json({ sent: await sendTo(body.me === 'laura' ? 'laura' : 'david', { title: '🎉 Notifications are on!', body: 'This is how Rhead Home will reach you.', url: '/#settings', tag: 'test' }) });
    if (body.kind === 'event') return json(await onEvent(String(body.col || ''), String(body.id || '')));
    if (body.kind === 'turn') return json(await onTurn(String(body.game || ''), String(body.me || ''), !!body.over));
    return json({ error: 'unknown request' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: String(e && e.message || e) }, 500);
  }
});
