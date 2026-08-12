const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function backendUrl(request, path) {
  const backendOrigin = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!backendOrigin) throw new Error('API_URL is not configured');
  const incoming = new URL(request.url);
  const target = new URL(`/api/${path.join('/')}`, backendOrigin);
  target.search = incoming.search;
  return target;
}

async function proxy(request, { params }) {
  try {
    const { path } = await params;
    const headers = new Headers(request.headers);
    HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
    headers.set('x-forwarded-host', new URL(request.url).host);
    headers.set('x-forwarded-proto', new URL(request.url).protocol.replace(':', ''));

    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const response = await fetch(backendUrl(request, path), {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      signal: request.signal,
    });
    const responseHeaders = new Headers(response.headers);
    HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[api-proxy]', error.message);
    return Response.json({ error: 'Backend service is unavailable' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
