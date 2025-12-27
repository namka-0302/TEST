
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (method === 'GET') {
    if (!userId) return new Response('Missing userId', { status: 400 });
    const progress = await kv.get(`quizmaster_progress_${userId}`) || {};
    return new Response(JSON.stringify(progress), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (method === 'POST') {
    const { userId: bodyUserId, progress } = await req.json();
    if (!bodyUserId) return new Response('Missing userId', { status: 400 });
    await kv.set(`quizmaster_progress_${bodyUserId}`, progress);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
