
export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new Response(JSON.stringify({ status: 'ok', provider: 'Vercel' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
