// Public: the edited site content, or 204 when nothing has been saved yet (site uses its defaults).
export async function onRequestGet({ env }) {
  if (!env.DATA) return new Response(null, { status: 204 });
  const raw = await env.DATA.get('content');
  if (!raw) return new Response(null, { status: 204 });
  return new Response(raw, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=30' }
  });
}
