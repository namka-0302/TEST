
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const accounts = await kv.get('quizmaster_accounts') || [];
      return new Response(JSON.stringify(accounts), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
  }

  if (method === 'POST') {
    try {
      const { accounts } = await req.json();
      await kv.set('quizmaster_accounts', accounts);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to save' }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
