import { json, passwordOk, sessionCookies, sameOrigin } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: 'Bad origin' }, 403);
  if (!env.ADMIN_PASSWORD) return json({ error: 'Admin password is not set. Add ADMIN_PASSWORD in Cloudflare.' }, 503);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = 'rl:login:' + ip;
  const tries = env.DATA ? Number((await env.DATA.get(rlKey)) || 0) : 0;
  if (tries >= 8) return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);

  let pw = '';
  try { pw = (await request.json()).password; } catch {}
  if (!(await passwordOk(env, pw))) {
    if (env.DATA) await env.DATA.put(rlKey, String(tries + 1), { expirationTtl: 900 });
    return json({ error: 'Wrong password' }, 401);
  }
  const headers = new Headers({ 'content-type': 'application/json', 'cache-control': 'no-store' });
  (await sessionCookies(env)).forEach((c) => headers.append('Set-Cookie', c));
  return new Response(JSON.stringify({ ok: true }), { headers });
}
