
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;

  if (method === 'GET') {
    const results = await kv.get('quizmaster_results') || [];
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (method === 'POST') {
    const result = await req.json();
    const existing: any[] = await kv.get('quizmaster_results') || [];
    const updated = [result, ...existing];
    await kv.set('quizmaster_results', updated);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
