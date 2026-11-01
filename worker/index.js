// =============================================================
//  Rhead Home: bank sync (Cloudflare Worker, runs beside the app)
//  - /api/bank  : the app asks it to connect, sync or remove a bank
//  - every 6 hrs: pulls new transactions + balances on its own
//  Bank access tokens live only in Supabase table "bank_links",
//  which the app itself can't read. The app only ever sees names,
//  last 4 digits, balances and transactions.
//
//  Needs (Cloudflare > rhead-home > Settings > Variables and Secrets):
//    TELLER_APP_ID   your Teller application id (app_...)
//    SUPABASE_SECRET your Supabase secret key (sb_secret_...)
//  and the Teller certificate uploaded as mTLS binding "TELLER_CERT".
// =============================================================

const SB_URL = 'https://rxtqhjukfwnrwvcdjivx.supabase.co';
const TELLER = 'https://api.teller.io';
const TZ = 'America/New_York';
const WHO = ['david', 'laura'];
const DAY = 864e5;

const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const ymdNY = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA', { timeZone: TZ });
const round2 = n => Math.round(n * 100) / 100;

function missing(env) {
  const m = [];
  if (!env.TELLER_APP_ID) m.push('TELLER_APP_ID');
  if (!env.SUPABASE_SECRET) m.push('SUPABASE_SECRET');
  if (!env.TELLER_CERT && !env.TELLER_FETCH) m.push('TELLER_CERT');
  return m;
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

/* ---------- Teller ---------- */
class BankErr extends Error { constructor(msg, status, code) { super(msg); this.status = status; this.code = code || ''; } }
async function teller(env, token, path) {
  const f = env.TELLER_FETCH || ((u, i) => env.TELLER_CERT.fetch(u, i));
  const r = await f(TELLER + path, { headers: { Authorization: 'Basic ' + btoa(token + ':') } });
  if (r.ok) return r.json();
  let code = '', msg = '';
  try { const e = (await r.json()).error || {}; code = e.code || ''; msg = e.message || ''; } catch (e) {}
  throw new BankErr(msg || `bank said ${r.status}`, r.status, code);
}
const needsRepair = e => e instanceof BankErr && (/disconnect|enrollment|mfa|credential|login/i.test(e.code + ' ' + e.message) || e.status === 401 || e.status === 403);

/* ---------- turning bank lines into app entries ---------- */
const CAT = {
  groceries: 'Groceries', dining: 'Dining out', bar: 'Dining out', fuel: 'Gas',
  transport: 'Car', transportation: 'Car', home: 'Home', utilities: 'Bills', phone: 'Bills', insurance: 'Bills',
  loan: 'Bills', tax: 'Bills', charity: 'Giving', entertainment: 'Fun', sport: 'Fun', accommodation: 'Fun',
};
const SPENDY = new Set(['groceries', 'dining', 'bar', 'fuel', 'shopping', 'clothing', 'entertainment', 'electronics', 'general', 'home', 'transportation', 'transport', 'health', 'sport', 'accommodation']);
function catOf(tx) {
  const d = (tx.description || '') + ' ' + ((tx.details && tx.details.counterparty && tx.details.counterparty.name) || '');
  if (/chewy|petco|petsmart|\bvet\b|veterinar|banfield|bark ?box|pet supplies/i.test(d)) return 'Dayla';
  if (/church|tithe|offering|pushpay|tithe\.ly/i.test(d)) return 'Giving';
  if (/shell|chevron|exxon|mobil|marathon|wawa|racetrac|speedway|sunoco|citgo|7-eleven/i.test(d) && !(tx.details && tx.details.category)) return 'Gas';
  return CAT[tx.details && tx.details.category] || 'Other';
}
const tidy = s => String(s || '').replace(/\s+/g, ' ').replace(/\b(pos|debit|purchase|card|recurring|ach|web|ppd|id:?)\b/gi, '').replace(/\s+\d{4,}.*$/, '').replace(/\s+/g, ' ').trim();
const nameOfTx = tx => ((tx.details && tx.details.counterparty && tx.details.counterparty.name) || tidy(tx.description) || 'Bank purchase').slice(0, 80);
// money moving between your own accounts or paying off a card: not spending, not income
const MOVE = /transfer (to|from)|xfer|internal transfer|vault|round ?up|savings|credit card|card payment|crd ?pmt|cardmember|autopay|epay|e-payment|online (payment|pmt)|payment (thank|received)|discover|bk of amer|bank of america|chase (card|credit)|sofi (credit|money)|capital one|amex|american express|citi card|venmo cashout|instant transfer/i;
const PAY = /payroll|direct ?dep|dir ?dep|salary|paycheck|pay ?roll|wages|adp|gusto|paychex|employer/i;
function classify(tx, acct, outSign) {
  const amt = Number(tx.amount);
  if (!amt || tx.status !== 'posted') return null;
  const d = tx.description + ' ' + ((tx.details && tx.details.counterparty && tx.details.counterparty.name) || '');
  const out = Math.sign(amt) === outSign;
  if (out) {
    if (MOVE.test(d)) return null;
    if (tx.type === 'transfer' && !(tx.details && tx.details.counterparty && tx.details.counterparty.type === 'person')) return null;
    return { kind: 'spend', amt: round2(Math.abs(amt)), cat: catOf(tx), note: nameOfTx(tx) };
  }
  if (acct.type !== 'depository') return null; // card refunds and card payments
  if ((tx.details && tx.details.category === 'income') || PAY.test(d)) return { kind: 'income', amt: round2(Math.abs(amt)), source: nameOfTx(tx).replace(/\b(payroll|dir dep|direct dep(osit)?)\b/gi, '').trim() || 'Paycheck' };
  return null;
}
// Depository: money out is negative. Cards differ by bank, so look at the shopping lines.
function outSignOf(acct, txs) {
  if (acct.type === 'depository') return -1;
  let pos = 0, neg = 0;
  for (const t of txs) { if (!SPENDY.has(t.details && t.details.category)) continue; Number(t.amount) > 0 ? pos++ : neg++; }
  return pos > neg ? 1 : -1;
}

/* ---------- syncing ---------- */
async function syncLink(env, db, link, prefs, now) {
  const out = { added: 0, income: 0, accounts: [] };
  const accounts = await teller(env, link.access_token, '/accounts');
  const since = link.synced_at ? ymdNY(Date.parse(link.synced_at) - 10 * DAY) : ymdNY(now).slice(0, 8) + '01'; // first time: this month only
  const docs = [], seen = [];
  for (const a of accounts) {
    if (a.status && a.status !== 'open') continue;
    const p = prefs[a.id] || {};
    const mode = p.mode || 'home';
    let bal = null;
    try { bal = await teller(env, link.access_token, `/accounts/${a.id}/balances`); } catch (e) { if (needsRepair(e)) throw e; }
    const info = {
      id: a.id, enr: link.enrollment_id, who: link.who, inst: (a.institution && a.institution.name) || link.institution || 'Bank',
      name: a.name || '', type: a.type, sub: a.subtype || '', last4: a.last_four || '', mode,
      ledger: bal && bal.ledger != null ? Number(bal.ledger) : null, avail: bal && bal.available != null ? Number(bal.available) : null, upd: ymdNY(now),
    };
    out.accounts.push(info);
    if (mode === 'off') continue;
    const txs = await teller(env, link.access_token, `/accounts/${a.id}/transactions?start_date=${since}&count=250`);
    if (mode === 'biz') { seen.push(...txs.filter(t => t.status === 'posted').map(t => ({ tx_id: t.id }))); continue; }
    const sign = outSignOf(a, txs);
    for (const t of txs) {
      if (t.status !== 'posted') continue;
      const c = classify(t, a, sign);
      seen.push({ tx_id: t.id, kind: c ? c.kind : 'skip' });
      if (!c) continue;
      const base = { date: t.date, acct: 'bk_' + a.id, by: link.who, at: now, bank: { inst: info.inst, last4: info.last4, desc: String(t.description || '').slice(0, 120) } };
      if (c.kind === 'spend') docs.push({ col: 'spend', id: 'bk_' + t.id, data: { ...base, amt: c.amt, cat: c.cat, note: c.note } });
      else docs.push({ col: 'income', id: 'bk_' + t.id, data: { ...base, who: link.who, amt: c.amt, source: c.source } });
    }
  }
  // only add lines we've never seen, so anything you delete in the app stays deleted
  if (seen.length) {
    const ids = [...new Set(seen.map(s => s.tx_id))];
    const old = new Set();
    for (let i = 0; i < ids.length; i += 100) {
      const r = await db.select('bank_seen', 'select=tx_id&tx_id=in.(' + ids.slice(i, i + 100).map(x => '"' + x + '"').join(',') + ')');
      (r || []).forEach(x => old.add(x.tx_id));
    }
    const fresh = docs.filter(d => !old.has(d.id.slice(3)));
    await db.insert('docs', fresh, 'col,id');
    await db.insert('bank_seen', seen.filter(s => !old.has(s.tx_id)).map(s => ({ tx_id: s.tx_id })), 'tx_id');
    out.added = fresh.filter(d => d.col === 'spend').length;
    out.income = fresh.filter(d => d.col === 'income').length;
  }
  return out;
}

// Linked checking/savings show up in the app's "Bank balances" card with the real balance.
async function updateBalances(db, accounts, now) {
  const meta = (await getMeta(db, 'accts')) || {};
  let list = (meta.list || []).slice();
  const d = ymdNY(now);
  for (const a of accounts) {
    const id = 'bk_' + a.id, i = list.findIndex(x => x.id === id);
    const show = a.type === 'depository' && a.mode === 'home' && a.ledger != null;
    if (!show) { if (i >= 0) list.splice(i, 1); continue; }
    const prev = i >= 0 ? list[i] : {};
    const bal = round2(a.ledger);
    const entry = {
      ...prev, id, linked: true, name: `${a.inst} ${a.name || a.sub}`.trim() + (a.last4 ? ` ••${a.last4}` : ''),
      kind: a.sub === 'savings' || /saving|vault/i.test(a.name) ? 'savings' : 'checking',
      bal, setAt: now + 1, upd: d, by: a.who,
      hist: (prev.hist || []).filter(h => h.date !== d).concat({ bal, date: d }).slice(-60),
    };
    if (i >= 0) list[i] = entry; else list.push(entry);
  }
  await putMeta(db, 'accts', { ...meta, list });
}

async function syncAll(env, only) {
  const db = sb(env), now = Date.now();
  let links = await db.select('bank_links', 'select=*');
  if (only) links = links.filter(l => l.enrollment_id === only);
  const bank = (await getMeta(db, 'bank')) || {};
  const prefs = bank.prefs || {};
  const accounts = [];
  const linkInfo = [];
  let added = 0, income = 0;
  for (const l of links) {
    const li = { enr: l.enrollment_id, who: l.who, inst: l.institution, status: 'ok', synced: now, err: '' };
    try {
      const r = await syncLink(env, db, l, prefs, now);
      added += r.added; income += r.income;
      accounts.push(...r.accounts);
      await db.patch('bank_links', 'enrollment_id=eq.' + encodeURIComponent(l.enrollment_id), { synced_at: new Date(now).toISOString(), status: 'ok' });
    } catch (e) {
      li.status = needsRepair(e) ? 'repair' : 'error';
      li.err = String(e.message || e).slice(0, 160);
      li.synced = (bank.links || []).find(x => x.enr === l.enrollment_id)?.synced || 0;
      accounts.push(...(bank.accounts || []).filter(a => a.enr === l.enrollment_id));
      await db.patch('bank_links', 'enrollment_id=eq.' + encodeURIComponent(l.enrollment_id), { status: li.status }).catch(() => {});
    }
    linkInfo.push(li);
  }
  const allLinks = only ? (bank.links || []).filter(x => x.enr !== only).concat(linkInfo) : linkInfo;
  const keepAccts = only ? (bank.accounts || []).filter(a => a.enr !== only).concat(accounts.filter(a => a.enr === only)) : accounts.filter(a => links.some(l => l.enrollment_id === a.enr));
  await putMeta(db, 'bank', { ...bank, links: allLinks, accounts: keepAccts, last: now, lastAdded: added, lastIncome: income });
  await updateBalances(db, keepAccts, now);
  return { ok: true, added, income, links: allLinks.map(l => ({ inst: l.inst, status: l.status })) };
}

/* ---------- requests from the app ---------- */
async function handle(req, env) {
  if (req.method !== 'POST') return json({ error: 'use POST' }, 405);
  const body = await req.json().catch(() => ({}));
  const miss = missing(env);
  if (body.kind === 'config') return json({ ready: !miss.length, missing: miss, appId: env.TELLER_APP_ID || '', env: env.TELLER_ENV || 'development' });
  if (miss.length) return json({ error: 'Bank sync isn’t set up yet (missing ' + miss.join(', ') + ').' }, 503);
  const db = sb(env);
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const u = token && await db.user(token);
  if (!u || !u.id) return json({ error: 'Sign in first.' }, 401);

  if (body.kind === 'save') {
    const e = body.enrollment || {};
    const access = String(e.accessToken || ''), enr = String((e.enrollment && e.enrollment.id) || '');
    if (!/^token_/.test(access) || !enr) return json({ error: 'That bank connection didn’t come through. Try again.' }, 400);
    const who = WHO.includes(body.who) ? body.who : 'david';
    // make sure the token really works before keeping it
    await teller(env, access, '/accounts');
    await db.upsert('bank_links', [{ enrollment_id: enr, who, institution: String((e.enrollment.institution && e.enrollment.institution.name) || 'Bank').slice(0, 60), access_token: access, status: 'ok', user_id: u.id }], 'enrollment_id');
    return json(await syncAll(env, enr));
  }
  if (body.kind === 'sync') return json(await syncAll(env));
  if (body.kind === 'repaired') return json(await syncAll(env, String(body.enr || '')));
  if (body.kind === 'remove') {
    const enr = String(body.enr || '');
    const rows = await db.select('bank_links', 'select=*&enrollment_id=eq.' + encodeURIComponent(enr));
    const l = rows && rows[0];
    if (l) {
      // tell Teller to forget it too (best effort)
      try {
        const accts = await teller(env, l.access_token, '/accounts');
        const f = env.TELLER_FETCH || ((u2, i) => env.TELLER_CERT.fetch(u2, i));
        for (const a of accts) await f(`${TELLER}/accounts/${a.id}`, { method: 'DELETE', headers: { Authorization: 'Basic ' + btoa(l.access_token + ':') } });
      } catch (e) {}
      await db.del('bank_links', 'enrollment_id=eq.' + encodeURIComponent(enr));
    }
    const bank = (await getMeta(db, 'bank')) || {};
    const accounts = (bank.accounts || []).filter(a => a.enr !== enr);
    await putMeta(db, 'bank', { ...bank, links: (bank.links || []).filter(x => x.enr !== enr), accounts });
    const meta = (await getMeta(db, 'accts')) || {};
    const gone = new Set((bank.accounts || []).filter(a => a.enr === enr).map(a => 'bk_' + a.id));
    await putMeta(db, 'accts', { ...meta, list: (meta.list || []).filter(x => !gone.has(x.id)) });
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
        if (e instanceof BankErr) return json({ error: needsRepair(e) ? 'The bank needs you to sign in again.' : 'The bank didn’t answer: ' + e.message }, 502);
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
export { classify, outSignOf, catOf, syncAll, handle };
