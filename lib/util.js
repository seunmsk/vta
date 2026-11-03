// Shared helpers for Pages Functions.
const enc = new TextEncoder();
const SESSION_DAYS = 14;

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });

export const noKV = () => json({ error: 'Storage is not connected. Add a KV binding named DATA in Cloudflare.' }, 503);

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function passwordOk(env, pw) {
  if (!env.ADMIN_PASSWORD || typeof pw !== 'string') return false;
  const [x, y] = await Promise.all([hmac('pw', String(env.ADMIN_PASSWORD).trim()), hmac('pw', pw.trim())]);
  return safeEqual(x, y);
}

export async function sessionCookies(env) {
  const exp = String(Date.now() + SESSION_DAYS * 864e5);
  const token = exp + '.' + (await hmac(env.ADMIN_PASSWORD + '|vta-session', exp));
  const age = SESSION_DAYS * 86400;
  return [
    `vta_session=${token}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Strict`,
    'vta_admin=; Path=/; Max-Age=0; Secure; SameSite=Strict'
  ];
}
export const clearCookies = () => [
  'vta_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict',
  'vta_admin=; Path=/; Max-Age=0; Secure; SameSite=Strict'
];

export async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)vta_session=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(await hmac(env.ADMIN_PASSWORD + '|vta-session', exp), sig);
}

// Keys sort newest first: inverted timestamp + random suffix.
export function newId(prefix) {
  const inv = String(9999999999999 - Date.now()).padStart(13, '0');
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}:${inv}:${rnd}`;
}

export async function listRecords(kv, prefix, limit = 300) {
  const out = [];
  let cursor;
  do {
    const page = await kv.list({ prefix, cursor, limit: Math.min(1000, limit - out.length) });
    const vals = await Promise.all(page.keys.map((k) => kv.get(k.name, 'json')));
    page.keys.forEach((k, i) => { if (vals[i]) out.push({ id: k.name, ...vals[i] }); });
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor && out.length < limit);
  return out;
}

export const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
export const sameOrigin = (request) => {
  const o = request.headers.get('Origin');
  return !o || o === new URL(request.url).origin;
};
