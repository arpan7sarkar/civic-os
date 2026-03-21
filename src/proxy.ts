import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Custom Proxy.
 * DESIGN: Performs a multi-layered check to ensure session persistence on localhost.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Raw Cookie Header (The most reliable source on Localhost)
    const rawCookieHeader = request.headers.get('cookie') || '';
    
    // 2. Parsed Cookies
    const officialSession = request.cookies.getAll().find(c => c.name.startsWith('a_session_'));
    const bridgeSession = request.cookies.get('civic_auth_verified');
    const customSession = request.cookies.get('civic_session_secret');

    // Recovery Logic for Forwarding
    let recoveredSecret = officialSession?.value || customSession?.value;
    if (!recoveredSecret && rawCookieHeader.includes('a_session_')) {
        const match = rawCookieHeader.match(/a_session_[^=;]+=([^;]+)/);
        if (match) {
            recoveredSecret = match[1].trim();
            console.log(`[PROXY_STABILITY] Extracted secret from raw header: ${recoveredSecret.slice(0, 10)}...`);
        }
    }

    const hasSession = !!recoveredSecret || !!bridgeSession?.value || !!customSession?.value;

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth')) {
        console.log(`[PROXY_STABILITY] ${pathname} | HasSession: ${hasSession} | BridgeUID: ${bridgeSession?.value || 'NONE'}`);
    }

    // Protection Logic
    if (pathname.startsWith('/auth') && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/dashboard') && !hasSession) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 4. Forwarding (Crucial for Server Actions visibility on Localhost)
    const requestHeaders = new Headers(request.headers);
    if (recoveredSecret) {
        requestHeaders.set('x-civic-session', recoveredSecret);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*', '/auth']
};
