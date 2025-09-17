import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Сработает только на /api/admin/** (см. config ниже)
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  // при необходимости здесь можно добавить базовую валидацию структуры токена
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
