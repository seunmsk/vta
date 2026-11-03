import { json, noKV, isAdmin, newId, listRecords, clip, sameOrigin } from '../../../lib/util.js';

const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function onRequest({ request, env, params }) {
  if (!(await isAdmin(request, env))) return json({ error: 'Not signed in' }, 401);
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'Bad origin' }, 403);
  const [section, id] = params.path || [];
  const method = request.method;

  if (section === 'me' && method === 'GET') return json({ ok: true, storage: !!env.DATA });
  if (!env.DATA) return noKV();
  const kv = env.DATA;

  // ----- site content -----
  if (section === 'content') {
    if (method === 'GET') return json({ content: await kv.get('content', 'json'), savedAt: await kv.get('content:savedAt') });
    if (method === 'PUT') {
      const text = await request.text();
      if (text.length > 900000) return json({ error: 'Content too large' }, 413);
      let data;
      try { data = JSON.parse(text); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!data || !Array.isArray(data.passports) || !Array.isArray(data.properties) || !Array.isArray(data.faqs)) return json({ error: 'Missing sections' }, 400);
      const prev = await kv.get('content');
      if (prev) await kv.put('content:backup', prev); // one-step undo
      const now = new Date().toISOString();
      await kv.put('content', JSON.stringify(data));
      await kv.put('content:savedAt', now);
      return json({ ok: true, savedAt: now });
    }
    if (method === 'DELETE') { // restore the previous save
      const prev = await kv.get('content:backup');
      if (!prev) return json({ error: 'No earlier version' }, 404);
      await kv.put('content', prev);
      return json({ ok: true, content: JSON.parse(prev) });
    }
  }

  // ----- enquiries -----
  if (section === 'enquiries') {
    const prefix = 'enq:';
    if (method === 'GET' && !id) {
      return json({ rows: await listRecords(kv, prefix, 500) });
    }
    if (id && !id.startsWith(prefix)) return json({ error: 'Bad id' }, 400);
    if (method === 'PATCH' && id) {
      const rec = await kv.get(id, 'json');
      if (!rec) return json({ error: 'Not found' }, 404);
      const b = await request.json().catch(() => ({}));
      if (typeof b.status === 'string') rec.status = clip(b.status, 20);
      if (typeof b.note === 'string') rec.note = clip(b.note, 3000);
      rec.updated = new Date().toISOString();
      await kv.put(id, JSON.stringify(rec));
      return json({ ok: true, id, ...rec });
    }
    if (method === 'DELETE' && id) { await kv.delete(id); return json({ ok: true }); }
  }

  // ----- image upload -----
  if (section === 'upload' && method === 'POST') {
    const form = await request.formData().catch(() => null);
    const file = form && form.get('file');
    if (!file || typeof file === 'string') return json({ error: 'No file' }, 400);
    if (!IMG_TYPES.includes(file.type)) return json({ error: 'Use a JPG, PNG or WebP image' }, 415);
    if (file.size > 8 * 1024 * 1024) return json({ error: 'Image is over 8 MB' }, 413);
    const mid = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toLowerCase();
    await kv.put('img:' + mid, await file.arrayBuffer(), { metadata: { type: file.type, name: clip(file.name, 120) } });
    return json({ ok: true, url: '/media/' + mid });
  }

  return json({ error: 'Not found' }, 404);
}
