// Public: serve an image uploaded through the dashboard.
export async function onRequestGet({ params, env }) {
  if (!env.DATA || !/^[a-z0-9]{6,40}$/.test(params.id)) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.DATA.getWithMetadata('img:' + params.id, 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, {
    headers: {
      'content-type': (metadata && metadata.type) || 'image/jpeg',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff'
    }
  });
}
