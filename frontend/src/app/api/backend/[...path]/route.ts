import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const backend = (process.env.API_INTERNAL_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
  const target = `${backend}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  const headers = new Headers();

  for (const name of ['accept', 'authorization', 'content-type']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  for (const name of ['content-type', 'content-disposition', 'location']) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
