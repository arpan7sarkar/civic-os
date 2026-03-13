import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const allCookies = request.cookies.getAll();
    const sessionCookie = allCookies.find(c => c.name.startsWith('a_session_'));
    const hasSession = !!sessionCookie?.value;

    const { pathname } = request.nextUrl;

    // Redirection loop prevention: only redirect from /auth to /dashboard if logged in
    // Skip blocking /dashboard here because Appwrite cookies are unreliable in middleware on localhost
    if (pathname === '/auth' && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/verification/:path*', '/map/:path*', '/auth'],
};
