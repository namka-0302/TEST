
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;

  if (method === 'GET') {
    const quizzes = await kv.get('quizmaster_quizzes') || [];
    return new Response(JSON.stringify(quizzes), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (method === 'POST') {
    const { quizzes } = await req.json();
    await kv.set('quizmaster_quizzes', quizzes);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
