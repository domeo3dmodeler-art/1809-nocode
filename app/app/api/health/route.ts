export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return new Response(null, {
    status: 204,
    headers: { 'cache-control': 'no-store' },
  });
}
