import { json, noKV, newId, clip, sameOrigin } from '../../lib/util.js';

// Public: save a form submission so it shows in the dashboard inbox.
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: 'Bad origin' }, 403);
  if (!env.DATA) return noKV();
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid body' }, 400); }
  if (body.website) return json({ ok: true }); // honeypot: bots fill hidden fields
  const fields = Array.isArray(body.fields) ? body.fields.slice(0, 30)
    .filter((f) => Array.isArray(f) && f.length === 2)
    .map(([k, v]) => [clip(k, 60), clip(v, 2000)]) : [];
  if (!fields.length) return json({ error: 'Empty' }, 400);

  // Light rate limit: 20 submissions per IP per hour.
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = 'rl:enq:' + ip;
  const n = Number((await env.DATA.get(rlKey)) || 0);
  if (n >= 20) return json({ error: 'Too many submissions, please try again later.' }, 429);
  await env.DATA.put(rlKey, String(n + 1), { expirationTtl: 3600 });

  const get = (name) => (fields.find(([k]) => k === name) || [])[1] || '';
  const rec = {
    type: clip(body.title || 'Website enquiry', 80),
    page: clip(body.page, 120),
    name: get('Name'),
    whatsapp: get('WhatsApp'),
    email: get('Email'),
    fields,
    status: 'new',
    note: '',
    created: new Date().toISOString(),
    country: request.cf && request.cf.country ? request.cf.country : ''
  };
  await env.DATA.put(newId('enq'), JSON.stringify(rec));
  return json({ ok: true });
}
