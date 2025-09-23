import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";


export function middleware(req: NextRequest) {
const { pathname } = req.nextUrl;
// Для демо отключаем проверку авторизации
// if (pathname.startsWith("/api/admin/")) {
// const auth = req.headers.get("authorization") || "";
// const m = auth.match(/^Bearer\s+(.+)$/i);
// const token = m?.[1];
// if (!token || !verifyToken(token)) {
// return NextResponse.json({ error: "unauthorized" }, { status: 401 });
// }
// }
return NextResponse.next();
}


export const config = {
matcher: ["/api/admin/:path*"],
};