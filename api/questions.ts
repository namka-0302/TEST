
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;

  if (method === 'GET') {
    const questions = await kv.get('quizmaster_questions') || [];
    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (method === 'POST') {
    const { questions } = await req.json();
    await kv.set('quizmaster_questions', questions);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
