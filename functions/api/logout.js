import { clearCookies } from '../../lib/util.js';

export async function onRequestPost() {
  const headers = new Headers({ 'content-type': 'application/json', 'cache-control': 'no-store' });
  clearCookies().forEach((c) => headers.append('Set-Cookie', c));
  return new Response('{"ok":true}', { headers });
}
