// =============================================================
//  Rhead Home: bank sync with Plaid (Cloudflare Worker beside the app)
//  - POST /api/bank : the app asks it to connect, sync or remove a bank
//  - every 6 hours  : pulls new transactions + balances on its own
//  Bank access tokens live only in Supabase table "bank_links", which the
//  app itself can't read. The app only sees names, last 4 digits,
//  balances and transactions.
//
//  Needs (Cloudflare > rhead-home > Settings > Variables and Secrets):
//    PLAID_CLIENT_ID   from Plaid Dashboard > Developers > Keys
//    PLAID_SECRET      the Production secret from the same page
//    SUPABASE_SECRET   Supabase secret key (sb_secret_...)
//    PLAID_ENV         optional: "sandbox" for testing (default production)
// =============================================================

const SB_URL = 'https://rxtqhjukfwnrwvcdjivx.supabase.co';
const APP_URL = 'https://rhead-home.davidrhead03.workers.dev/';
const TZ = 'America/New_York';
const WHO = ['david', 'laura'];

const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const ymdNY = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA', { timeZone: TZ });
const round2 = n => Math.round(n * 100) / 100;

function missing(env) {
  return ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'SUPABASE_SECRET'].filter(k => !env[k]);
}

/* ---------- Supabase (service access) ---------- */
function sb(env) {
  const base = env.SB_URL || SB_URL, key = env.SUPABASE_SECRET, f = env.SB_FETCH || fetch;
  const req = async (path, init = {}) => {
    const r = await f(base + path, { ...init, headers: { apikey: key, 'Content-Type': 'application/json', ...(init.headers || {}) } });
    if (!r.ok) throw new Error(`database ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  };
  return {
    async user(token) {
      const r = await f(base + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
      return r.ok ? r.json() : null;
    },
    select: (table, q) => req(`/rest/v1/${table}?${q}`),
    insert: (table, rows, ignoreDup) => rows.length ? req(`/rest/v1/${table}${ignoreDup ? '?on_conflict=' + ignoreDup : ''}`, { method: 'POST', headers: { Prefer: (ignoreDup ? 'resolution=ignore-duplicates,' : '') + 'return=minimal' }, body: JSON.stringify(rows) }) : null,
    upsert: (table, rows, conflict) => req(`/rest/v1/${table}?on_conflict=${conflict}`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }),
    patch: (table, q, body) => req(`/rest/v1/${table}?${q}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(body) }),
    del: (table, q) => req(`/rest/v1/${table}?${q}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }),
  };
}
async function getMeta(db, id) {
  const r = await db.select('docs', `col=eq.meta&id=eq.${encodeURIComponent(id)}&select=data`);
  return (r && r[0] && r[0].data) || null;
}
const putMeta = (db, id, data) => db.upsert('docs', [{ col: 'meta', id, data }], 'col,id');
const eq = v => 'eq.' + encodeURIComponent(v);

/* ---------- web push: RFC 8291 encryption + RFC 8292 VAPID (WebCrypto only) ---------- (same code as supabase/functions/notify) */
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

/* ---------- money notifications (paycheck, bank needs you, bill paid) ---------- */
const NAME = { david: 'David', laura: 'Laura' };
const NOTE_DEF = { paycheck: true, bankfix: true, billpaid: true };
const moneyTxt = n => '$' + (Number(n) || 0).toFixed(2).replace(/\.00$/, '');
function nyHour(t = Date.now()) { return Number(new Date(t).toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' })) % 24; }
function quietNow(q, h) {
  if (!q || q.on === false) return false;
  const f = Number(q.from ?? 22), t = Number(q.to ?? 7);
  return f === t ? false : f < t ? h >= f && h < t : h >= f || h < t;
}
async function sendNotes(env, db, notes) {
  // notes: [{ to:['david','laura'], kind, note:{ title, body, url, tag } }]
  const queue = ((await getMeta(db, 'bank-noteq')) || {}).list || [];
  const all = queue.concat(notes);
  if (!all.length) return 0;
  const cfg = (await db.select('push_config', 'select=vapid_public,vapid_private&id=eq.1'))[0];
  if (!cfg || !cfg.vapid_public || !cfg.vapid_private) return 0;
  const vapid = { publicKey: cfg.vapid_public, privateJwk: cfg.vapid_private };
  const f = env.PUSH_FETCH || fetch, h = nyHour(), held = [];
  let sent = 0;
  for (const who of ['david', 'laura']) {
    const pm = (await getMeta(db, 'notify-' + who)) || {}, on = { ...NOTE_DEF, ...(pm.on || {}) };
    const mine = all.filter(n => n.to.includes(who) && on[n.kind] !== false);
    if (!mine.length) continue;
    const subs = await db.select('push_subs', 'select=endpoint,sub&who=eq.' + who);
    for (const n of mine) for (const s of subs || []) {
      try {
        const body = await encryptPayload(s.sub, JSON.stringify(n.note));
        const r = await f(s.endpoint, { method: 'POST', body, headers: { TTL: '86400', Urgency: 'normal', 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', Authorization: await vapidHeader(s.endpoint, vapid, 'https://rhead-home.pages.dev') } });
        if (r.status === 404 || r.status === 410) await db.del('push_subs', 'endpoint=' + eq(s.endpoint));
        else if (r.ok) sent++;
      } catch (e) { console.warn('push', String(e)); }
    }
  }
  await putMeta(db, 'bank-noteq', { list: held.slice(-30) });
  return sent;
}

/* ---------- Plaid ---------- */
class BankErr extends Error { constructor(msg, code) { super(msg); this.code = code || ''; } }
async function plaid(env, path, body) {
  const base = env.PLAID_ENV === 'sandbox' ? 'https://sandbox.plaid.com' : 'https://production.plaid.com';
  const f = env.PLAID_FETCH || fetch;
  const r = await f(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: env.PLAID_CLIENT_ID, secret: env.PLAID_SECRET, ...body }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error_code) throw new BankErr(d.display_message || d.error_message || `Plaid said ${r.status}`, d.error_code || '');
  return d;
}
const REPAIR = new Set(['ITEM_LOGIN_REQUIRED', 'PENDING_EXPIRATION', 'PENDING_DISCONNECT', 'ITEM_LOCKED', 'INVALID_CREDENTIALS', 'INVALID_MFA', 'USER_PERMISSION_REVOKED', 'ACCESS_NOT_GRANTED', 'NO_ACCOUNTS']);
const needsRepair = e => e instanceof BankErr && REPAIR.has(e.code);

/* ---------- turning bank lines into app entries ---------- */
// Plaid amounts: positive = money left the account, negative = money came in (all account types).
function catOf(t) {
  const d = (t.merchant_name || '') + ' ' + (t.name || '');
  const pc = t.personal_finance_category || {}, p = pc.primary || '', det = pc.detailed || '';
  if (/chewy|petco|petsmart|\bvet\b|veterinar|banfield|bark ?box|pet supplies/i.test(d) || /PET/.test(det)) return 'Dayla';
  if (/church|tithe|offering|pushpay|tithe\.ly/i.test(d) || det === 'GOVERNMENT_AND_NON_PROFIT_DONATIONS') return 'Giving';
  if (det === 'FOOD_AND_DRINK_GROCERIES') return 'Groceries';
  if (det === 'TRANSPORTATION_GAS') return 'Gas';
  if (p === 'FOOD_AND_DRINK') return 'Dining out';
  if (p === 'TRANSPORTATION') return 'Car';
  if (p === 'RENT_AND_UTILITIES' || p === 'LOAN_PAYMENTS' || p === 'BANK_FEES' || /INSURANCE/.test(det)) return 'Bills';
  if (p === 'HOME_IMPROVEMENT') return 'Home';
  if (p === 'ENTERTAINMENT' || p === 'TRAVEL') return 'Fun';
  return 'Other';
}
const catKey = s => String(s || '').toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').slice(0, 3).join(' ');
const P2P = /zelle|venmo|cash ?app|paypal/i;
const OWN = /transfer (to|from)|xfer|internal|vault|savings|round ?up/i;
function classify(t, acct) {
  const amt = Number(t.amount);
  if (!amt || t.pending) return null;
  const pc = t.personal_finance_category || {}, p = pc.primary || '', det = pc.detailed || '';
  const d = (t.merchant_name || '') + ' ' + (t.name || '');
  const label = (t.merchant_name || t.name || 'Bank purchase').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (amt > 0) { // money out
    if (det === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT') return null;            // paying off a card
    if (p === 'TRANSFER_OUT' && !(P2P.test(d) && !OWN.test(d))) return null; // moving your own money
    return { kind: 'spend', amt: round2(amt), cat: catOf(t), note: label };
  }
  if (acct.type !== 'depository') return null; // card refunds and payments
  if (p === 'INCOME') return { kind: 'income', amt: round2(-amt), source: label.replace(/\b(payroll|dir dep|direct dep(osit)?|ppd)\b/gi, '').trim() || 'Paycheck' };
  return null; // transfers in, refunds
}

/* ---------- bank payments check off bills ---------- */
const WORDS = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !['the', 'and', 'bill', 'payment', 'pay', 'monthly', 'llc', 'inc', 'com', 'online', 'card'].includes(w));
const nameHit = (bill, text) => { const t = ' ' + String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' '; return WORDS(bill.name).some(w => t.includes(' ' + w) || (w.length >= 5 && t.includes(w))); };
function dueGap(bill, date) {
  const [y, m, d] = date.split('-').map(Number), last = new Date(y, m, 0).getDate();
  const due = new Date(y, m - 1, Math.min(Number(bill.due) || 1, last));
  return Math.abs((new Date(y, m - 1, d) - due) / 864e5);
}
async function matchBills(db, fresh, cardPays, now, paidOut) {
  const cands = fresh.filter(d => d.col === 'spend').map(d => ({ doc: d, amt: d.data.amt, date: d.data.date, text: d.data.note + ' ' + (d.data.bank && d.data.bank.desc || '') }))
    .concat(cardPays.map(c => ({ doc: null, amt: c.amt, date: c.date, text: c.text })));
  if (!cands.length) return;
  const rows = await db.select('docs', 'col=eq.bills&select=id,data');
  const bills = (rows || []).map(r => ({ id: r.id, ...r.data }));
  const touched = new Map(), debtPays = [];
  for (const c of cands) {
    const mk = c.date.slice(0, 7);
    let best = null, bestScore = 0;
    for (const b of bills) {
      if (b.ends && mk > b.ends) continue;
      if ((b.paid || []).includes(mk)) continue;
      const amt = Number(b.amount) || 0, hit = nameHit(b, c.text), close = dueGap(b, c.date) <= 6;
      let score = 0;
      if (!b.variable && Math.abs(c.amt - amt) <= 1) score = hit ? 3 : close ? 2 : 0;   // same amount + (name or near due date)
      else if (b.variable && hit && (!amt || (c.amt >= amt * 0.4 && c.amt <= amt * 2.5))) score = 2; // power/water: name match, amount in a sane range
      else if (!c.doc && hit) score = 2;                                                   // card payoff: name match is enough
      if (score > bestScore) { best = b; bestScore = score; }
    }
    if (!best) continue;
    best.paid = (best.paid || []).filter(x => x !== mk).concat(mk).slice(-24);
    best.paidAt = { ...(best.paidAt || {}), [mk]: now };
    best.paidBy = { ...(best.paidBy || {}), [mk]: 'bank' };
    if (best.variable) best.amounts = { ...(best.amounts || {}), [mk]: c.amt };
    touched.set(best.id, best);
    if (paidOut) paidOut.push({ name: best.name, amt: c.amt });
    if (c.doc) c.doc.data.bill = best.id;
    if (best.debt) debtPays.push({ debt: best.debt, pay: { amt: c.amt, date: c.date, by: 'bank', bill: best.id, mk } });
  }
  for (const b of touched.values()) { const { id, ...data } = b; await db.upsert('docs', [{ col: 'bills', id, data }], 'col,id'); }
  for (const dp of debtPays) {
    const r = (await db.select('docs', 'col=eq.debts&id=' + eq(dp.debt) + '&select=data'))[0];
    if (!r) continue;
    const pays = (r.data.pays || []).filter(p => !(p.bill === dp.pay.bill && p.mk === dp.pay.mk)).concat(dp.pay);
    await db.upsert('docs', [{ col: 'debts', id: dp.debt, data: { ...r.data, pays } }], 'col,id');
  }
}

/* ---------- syncing ---------- */
async function syncLink(env, db, link, prefs, now, oldAccts) {
  const out = { added: 0, income: 0, accounts: [], billsPaid: [], paychecks: [] };
  // live balances straight from the bank; fall back to Plaid's saved copy if the bank is slow
  let ar;
  try { ar = await plaid(env, '/accounts/balance/get', { access_token: link.access_token }); }
  catch (e) { if (needsRepair(e)) throw e; ar = await plaid(env, '/accounts/get', { access_token: link.access_token }); }
  const byId = {};
  for (const a of ar.accounts || []) {
    const p = prefs[a.account_id] || {};
    const info = {
      id: a.account_id, enr: link.item_id, who: link.who, inst: link.institution || 'Bank',
      name: a.official_name || a.name || '', type: a.type, sub: a.subtype || '', last4: a.mask || '', mode: p.mode || 'home',
      // checking/savings: the "available" number your bank app shows; cards: what you owe
      posted: a.balances && a.balances.current != null ? Number(a.balances.current) : null,
      ledger: a.balances ? (a.type === 'depository' && a.balances.available != null ? Number(a.balances.available) : a.balances.current != null ? Number(a.balances.current) : null) : null,
      avail: a.balances && a.balances.available != null ? Number(a.balances.available) : null, upd: ymdNY(now),
    };
    byId[a.account_id] = info;
    if (a.type === 'depository' || a.type === 'credit' || a.type === 'loan') out.accounts.push(info);
  }
  // new transactions since last time (Plaid keeps our place with a cursor)
  // banks linked before pending tracking existed: start over once so today's pending purchases show
  // (already-imported lines are skipped by bank_seen, so nothing doubles)
  const hasPend = (oldAccts || []).some(a => a.enr === link.item_id && Array.isArray(a.pend));
  let cursor = (hasPend || !(oldAccts || []).some(a => a.enr === link.item_id)) ? (link.cursor || null) : null, more = true, added = [], modified = [], removedIds = [], guard = 0;
  while (more && guard++ < 20) {
    const r = await plaid(env, '/transactions/sync', { access_token: link.access_token, cursor: cursor || undefined, count: 500 });
    added = added.concat(r.added || []);
    modified = modified.concat(r.modified || []);
    removedIds = removedIds.concat((r.removed || []).map(x => x.transaction_id));
    cursor = r.next_cursor; more = r.has_more;
  }
  const since = link.since || ymdNY(now).slice(0, 8) + '01'; // never bring in anything older than the month you linked
  const docs = [], seen = [], cardPays = [];
  const rules = ((await getMeta(db, 'catrules')) || {}).map || {}; // categories you picked for a store before
  for (const t of added) {
    const a = byId[t.account_id];
    if (!a || t.date < since) continue;
    if (a.type === 'loan') { seen.push({ tx_id: t.transaction_id }); continue; } // loan lines (Affirm etc.) aren't spending
    if (a.mode !== 'home') { seen.push({ tx_id: t.transaction_id }); continue; }
    const c = classify(t, a);
    if (t.pending) continue; // it comes back as posted later with its own id
    seen.push({ tx_id: t.transaction_id });
    if (!c) {
      // paying off a card isn't spending, but it can still check off a "Discover" bill
      const det = (t.personal_finance_category || {}).detailed || '';
      if (a.type === 'depository' && Number(t.amount) > 0 && det === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT') cardPays.push({ tx: t.transaction_id, amt: round2(Number(t.amount)), date: t.date, text: (t.merchant_name || '') + ' ' + (t.name || '') });
      continue;
    }
    const base = { date: t.date, acct: 'bk_' + a.id, by: link.who, at: now, bank: { inst: a.inst, last4: a.last4, desc: String(t.name || '').slice(0, 120) } };
    if (c.kind === 'spend') docs.push({ col: 'spend', id: 'bk_' + t.transaction_id, data: { ...base, amt: c.amt, cat: rules[catKey(c.note)] || c.cat, note: c.note } });
    else docs.push({ col: 'income', id: 'bk_' + t.transaction_id, data: { ...base, who: link.who, amt: c.amt, source: c.source } });
  }
  // only add lines never seen before, so anything you delete in the app stays deleted
  if (seen.length) {
    const ids = [...new Set(seen.map(s => s.tx_id))], old = new Set();
    for (let i = 0; i < ids.length; i += 100) {
      const r = await db.select('bank_seen', 'select=tx_id&tx_id=in.(' + ids.slice(i, i + 100).map(x => '"' + x + '"').join(',') + ')');
      (r || []).forEach(x => old.add(x.tx_id));
    }
    const fresh = docs.filter(d => !old.has(d.id.slice(3)));
    await matchBills(db, fresh, cardPays.filter(c => !old.has(c.tx)), now, out.billsPaid);
    await db.insert('docs', fresh, 'col,id');
    await db.insert('bank_seen', ids.filter(x => !old.has(x)).map(tx_id => ({ tx_id })), 'tx_id');
    out.added = fresh.filter(d => d.col === 'spend').length;
    out.income = fresh.filter(d => d.col === 'income').length;
    out.paychecks = fresh.filter(d => d.col === 'income').map(d => d.data);
  }
  // pending purchases (not final yet), kept per account so the app can show them
  const gone = new Set(removedIds);
  added.concat(modified).forEach(t => { if (t.pending_transaction_id) gone.add(t.pending_transaction_id); if (!t.pending) gone.add(t.transaction_id); });
  for (const info of out.accounts) {
    const prev = ((oldAccts || []).find(a => a.id === info.id) || {}).pend || [];
    const map = new Map(prev.filter(x => !gone.has(x.id)).map(x => [x.id, x]));
    added.concat(modified).filter(t => t.pending && t.account_id === info.id).forEach(t => map.set(t.transaction_id, { id: t.transaction_id, name: (t.merchant_name || t.name || 'Pending').slice(0, 40), amt: round2(Number(t.amount)), date: t.date }));
    info.pend = [...map.values()].sort((x, y) => (y.date || '').localeCompare(x.date || '')).slice(0, 25);
  }
  out.cursor = cursor;
  return out;
}

// Linked checking/savings show up in the app's "Bank balances" card with the real balance.
async function updateBalances(db, accounts, now) {
  const meta = (await getMeta(db, 'accts')) || {};
  const list = (meta.list || []).slice(), d = ymdNY(now);
  const ours = new Set(accounts.map(a => 'bk_' + a.id));
  for (let i = list.length - 1; i >= 0; i--) if (list[i].linked && !ours.has(list[i].id)) list.splice(i, 1);
  for (const a of accounts) {
    const id = 'bk_' + a.id, i = list.findIndex(x => x.id === id);
    const show = a.type === 'depository' && a.mode === 'home' && a.ledger != null;
    if (!show) { if (i >= 0) list.splice(i, 1); continue; }
    const prev = i >= 0 ? list[i] : {}, bal = round2(a.ledger);
    const entry = {
      ...prev, id, linked: true, name: `${a.inst} ${a.name || a.sub}`.trim() + (a.last4 ? ` ••${a.last4}` : ''),
      kind: a.sub === 'savings' || /saving|vault/i.test(a.name) ? 'savings' : 'checking',
      bal, setAt: now + 1, upd: d, by: a.who,
      posted: a.posted != null ? round2(a.posted) : null, pend: (a.pend || []).slice(0, 10),
      hist: (prev.hist || []).filter(h => h.date !== d).concat({ bal, date: d }).slice(-60),
    };
    if (i >= 0) list[i] = entry; else list.push(entry);
  }
  await putMeta(db, 'accts', { ...meta, list });
}

async function syncAll(env, only) {
  const db = sb(env), now = Date.now();
  const all = await db.select('bank_links', 'select=*');
  const links = only ? all.filter(l => l.item_id === only) : all;
  const bank = (await getMeta(db, 'bank')) || {};
  const prefs = bank.prefs || {};
  const linkInfo = [], accounts = [], notes = [];
  let added = 0, income = 0;
  for (const l of links) {
    const old = (bank.links || []).find(x => x.enr === l.item_id) || {};
    const li = { enr: l.item_id, who: l.who, inst: l.institution, status: 'ok', synced: now, err: '' };
    try {
      const r = await syncLink(env, db, l, prefs, now, bank.accounts || []);
      added += r.added; income += r.income;
      for (const pc of r.paychecks) notes.push({ to: ['david', 'laura'], kind: 'paycheck', note: { title: `💵 ${NAME[pc.who] || 'A'}’s paycheck came in`, body: `${moneyTxt(pc.amt)}${pc.source ? ' from ' + pc.source : ''}`, url: '/#money', tag: 'pay-' + pc.date } });
      for (const bp of r.billsPaid) notes.push({ to: ['david', 'laura'], kind: 'billpaid', note: { title: `✓ ${bp.name} paid`, body: `${moneyTxt(bp.amt)} came out of the bank. It’s checked off in Bills.`, url: '/#money', tag: 'bill-' + bp.name } });
      accounts.push(...r.accounts);
      await db.patch('bank_links', 'item_id=' + eq(l.item_id), { synced_at: new Date(now).toISOString(), status: 'ok', cursor: r.cursor });
    } catch (e) {
      console.error('sync', l.institution, e.code, e.message);
      li.status = needsRepair(e) ? 'repair' : 'error';
      if (li.status === 'repair' && old.status !== 'repair') notes.push({ to: [l.who], kind: 'bankfix', note: { title: `🔗 ${l.institution || 'Your bank'} needs you`, body: 'Sign in again so purchases keep coming in. Finance → Accounts → Sign in again.', url: '/#money', tag: 'bankfix-' + l.item_id } });
      li.err = needsRepair(e) ? '' : String(e.message || e).slice(0, 160);
      li.synced = old.synced || 0;
      accounts.push(...(bank.accounts || []).filter(a => a.enr === l.item_id));
      await db.patch('bank_links', 'item_id=' + eq(l.item_id), { status: li.status }).catch(() => {});
    }
    linkInfo.push(li);
  }
  const keepIds = new Set(all.map(l => l.item_id));
  const allLinks = (only ? (bank.links || []).filter(x => x.enr !== only && keepIds.has(x.enr)) : []).concat(linkInfo);
  const allAccts = (only ? (bank.accounts || []).filter(a => a.enr !== only && keepIds.has(a.enr)) : []).concat(accounts);
  await putMeta(db, 'bank', { ...bank, links: allLinks, accounts: allAccts, last: now, lastAdded: added, lastIncome: income });
  await updateBalances(db, allAccts, now);
  try { await sendNotes(env, db, notes); } catch (e) { console.error('notes', e); }
  return { ok: true, added, income, links: allLinks.map(l => ({ inst: l.inst, status: l.status })) };
}

/* ---------- requests from the app ---------- */
async function handle(req, env) {
  if (req.method !== 'POST') return json({ error: 'use POST' }, 405);
  const body = await req.json().catch(() => ({}));
  const miss = missing(env);
  if (body.kind === 'config') return json({ ready: !miss.length, missing: miss });
  if (miss.length) return json({ error: 'Bank sync isn’t set up yet (missing ' + miss.join(', ') + ').' }, 503);
  const db = sb(env);
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const u = token && await db.user(token);
  if (!u || !u.id) return json({ error: 'Sign in first.' }, 401);
  const who = WHO.includes(body.who) ? body.who : 'david';

  if (body.kind === 'linktoken') {
    // a short-lived pass that opens Plaid's bank sign-in (for a new bank, or to repair one)
    const opts = { client_name: 'Rhead Home', language: 'en', country_codes: ['US'], user: { client_user_id: u.id }, redirect_uri: env.REDIRECT_URI || APP_URL };
    if (body.enr) {
      const l = (await db.select('bank_links', 'select=access_token&item_id=' + eq(body.enr)))[0];
      if (!l) return json({ error: 'That bank isn’t linked anymore.' }, 404);
      opts.access_token = l.access_token;
    } else {
      opts.products = ['transactions'];
      opts.transactions = { days_requested: 60 };
    }
    const r = await plaid(env, '/link/token/create', opts);
    await db.upsert('bank_pending', [{ user_id: u.id, link_token: r.link_token, item_id: body.enr || null, who, at: new Date().toISOString() }], 'user_id');
    return json({ link_token: r.link_token });
  }
  if (body.kind === 'pending') {
    // after a bank's own sign-in page sends you back to the app
    const p = (await db.select('bank_pending', 'select=*&user_id=' + eq(u.id)))[0];
    if (!p || Date.now() - Date.parse(p.at) > 3.5 * 3600e3) return json({ link_token: null });
    return json({ link_token: p.link_token, enr: p.item_id || '', who: p.who });
  }
  if (body.kind === 'save') {
    const pt = String(body.public_token || '');
    if (!/^public-/.test(pt)) return json({ error: 'That bank connection didn’t come through. Try again.' }, 400);
    const r = await plaid(env, '/item/public_token/exchange', { public_token: pt });
    await db.upsert('bank_links', [{ item_id: r.item_id, who, institution: String(body.institution || 'Bank').slice(0, 60), access_token: r.access_token, status: 'ok', user_id: u.id, since: ymdNY().slice(0, 8) + '01' }], 'item_id');
    await db.del('bank_pending', 'user_id=' + eq(u.id)).catch(() => {});
    return json({ ...(await syncAll(env, r.item_id)), fresh: true });
  }
  if (body.kind === 'sync') return json(await syncAll(env));
  if (body.kind === 'repaired') {
    await db.del('bank_pending', 'user_id=' + eq(u.id)).catch(() => {});
    return json(await syncAll(env, String(body.enr || '')));
  }
  if (body.kind === 'remove') {
    const enr = String(body.enr || '');
    const l = (await db.select('bank_links', 'select=*&item_id=' + eq(enr)))[0];
    if (l) {
      try { await plaid(env, '/item/remove', { access_token: l.access_token }); } catch (e) {} // tell Plaid to forget it too
      await db.del('bank_links', 'item_id=' + eq(enr));
    }
    const bank = (await getMeta(db, 'bank')) || {};
    const accounts = (bank.accounts || []).filter(a => a.enr !== enr);
    await putMeta(db, 'bank', { ...bank, links: (bank.links || []).filter(x => x.enr !== enr), accounts });
    await updateBalances(db, accounts, Date.now());
    return json({ ok: true });
  }
  return json({ error: 'unknown request' }, 400);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/bank') {
      try { return await handle(req, env); }
      catch (e) {
        console.error(e);
        if (e instanceof BankErr) return json({ error: needsRepair(e) ? 'The bank needs you to sign in again.' : e.message }, 502);
        return json({ error: String(e.message || e) }, 500);
      }
    }
    return env.ASSETS ? env.ASSETS.fetch(req) : new Response('Not found', { status: 404 });
  },
  async scheduled(event, env, ctx) {
    if (missing(env).length) return;
    ctx.waitUntil(syncAll(env).catch(e => console.error('bank sync', e)));
  },
};
export { classify, catOf, syncAll, handle, catKey };
