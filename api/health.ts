
export const config = {
  runtime: 'edge',
};

export default async function handler() {
  // Trả về provider là Vercel để Frontend biết là Cloud Sync đang hoạt động qua Upstash
  return new Response(JSON.stringify({ 
    status: 'ok', 
    provider: 'Vercel',
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
