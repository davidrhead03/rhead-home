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

/* ---------- syncing ---------- */
async function syncLink(env, db, link, prefs, now) {
  const out = { added: 0, income: 0, accounts: [] };
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
      ledger: a.balances ? (a.type === 'depository' && a.balances.available != null ? Number(a.balances.available) : a.balances.current != null ? Number(a.balances.current) : null) : null,
      avail: a.balances && a.balances.available != null ? Number(a.balances.available) : null, upd: ymdNY(now),
    };
    byId[a.account_id] = info;
    if (a.type === 'depository' || a.type === 'credit') out.accounts.push(info);
  }
  // new transactions since last time (Plaid keeps our place with a cursor)
  let cursor = link.cursor || null, more = true, added = [], guard = 0;
  while (more && guard++ < 20) {
    const r = await plaid(env, '/transactions/sync', { access_token: link.access_token, cursor: cursor || undefined, count: 500 });
    added = added.concat(r.added || []);
    cursor = r.next_cursor; more = r.has_more;
  }
  const since = link.since || ymdNY(now).slice(0, 8) + '01'; // never bring in anything older than the month you linked
  const docs = [], seen = [];
  for (const t of added) {
    const a = byId[t.account_id];
    if (!a || t.date < since) continue;
    if (a.mode !== 'home') { seen.push({ tx_id: t.transaction_id }); continue; }
    const c = classify(t, a);
    if (t.pending) continue; // it comes back as posted later with its own id
    seen.push({ tx_id: t.transaction_id });
    if (!c) continue;
    const base = { date: t.date, acct: 'bk_' + a.id, by: link.who, at: now, bank: { inst: a.inst, last4: a.last4, desc: String(t.name || '').slice(0, 120) } };
    if (c.kind === 'spend') docs.push({ col: 'spend', id: 'bk_' + t.transaction_id, data: { ...base, amt: c.amt, cat: c.cat, note: c.note } });
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
    await db.insert('docs', fresh, 'col,id');
    await db.insert('bank_seen', ids.filter(x => !old.has(x)).map(tx_id => ({ tx_id })), 'tx_id');
    out.added = fresh.filter(d => d.col === 'spend').length;
    out.income = fresh.filter(d => d.col === 'income').length;
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
  const linkInfo = [], accounts = [];
  let added = 0, income = 0;
  for (const l of links) {
    const old = (bank.links || []).find(x => x.enr === l.item_id) || {};
    const li = { enr: l.item_id, who: l.who, inst: l.institution, status: 'ok', synced: now, err: '' };
    try {
      const r = await syncLink(env, db, l, prefs, now);
      added += r.added; income += r.income;
      accounts.push(...r.accounts);
      await db.patch('bank_links', 'item_id=' + eq(l.item_id), { synced_at: new Date(now).toISOString(), status: 'ok', cursor: r.cursor });
    } catch (e) {
      console.error('sync', l.institution, e.code, e.message);
      li.status = needsRepair(e) ? 'repair' : 'error';
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
export { classify, catOf, syncAll, handle };
