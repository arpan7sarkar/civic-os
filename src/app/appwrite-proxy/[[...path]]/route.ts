import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * Robust Appwrite Proxy Route Handler (Catch-all)
 * Normalizes Set-Cookie path to '/' ensures first-party session persistence.
 */
export async function GET(request: NextRequest) {
    return proxyRequest(request);
}

export async function POST(request: NextRequest) {
    return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request);
}

async function proxyRequest(request: NextRequest) {
    const url = new URL(request.url);
    // Replace '/appwrite-proxy' with '/v1' for the target
    const targetPath = url.pathname.replace('/appwrite-proxy', '/v1');
    const search = url.search;
    
    // Construct the full target URL without duplicating /v1
    const endpoint = env.APPWRITE_ENDPOINT.replace(/\/v1$/, '');
    const targetUrl = `${endpoint}${targetPath}${search}`;
    
    // console.log(`[PROXY] ${request.method} -> ${targetUrl}`);

    const headers = new Headers(request.headers);
    const targetHost = new URL(env.APPWRITE_ENDPOINT).host;
    headers.set('host', targetHost);
    headers.delete('x-forwarded-for');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-proto');

    try {
        let body;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const contentType = request.headers.get('content-type');
            if (contentType?.includes('multipart/form-data')) {
                body = await request.formData();
            } else {
                body = await request.blob();
            }
        }

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorBody = await response.clone().text();
            console.error(`[PROXY_UPSTREAM_ERROR] ${response.status} ${response.statusText}: ${errorBody.slice(0, 100)}...`);
        }

        const responseHeaders = new Headers(response.headers);
        
        // Rewrite Set-Cookie Path from /v1 to /
        const setCookie = responseHeaders.get('set-cookie');
        if (setCookie) {
            const cookies = responseHeaders.getSetCookie();
            responseHeaders.delete('set-cookie');
            
            cookies.forEach(cookie => {
                // 1. Force Path to /
                let normalized = cookie.replace(/Path=[^;]+/, 'Path=/');
                if (!normalized.includes('Path=/')) normalized += '; Path=/';
                
                // 2. Remove Domain to ensure it stays on OUR domain (localhost or vercel)
                normalized = normalized.replace(/Domain=[^;]+;?/, '');
                
                // 3. Normalize SameSite and Secure for development
                // 3. Normalize SameSite and Secure for development vs production
                if (process.env.NODE_ENV === 'development') {
                    normalized = normalized.replace(/Secure;?/, '');
                    normalized = normalized.replace(/SameSite=None;?/, 'SameSite=Lax');
                } else {
                    // In Production (cloud), WE MUST BE SECURE on HTTPS
                    if (!normalized.includes('Secure')) normalized += '; Secure';
                    normalized = normalized.replace(/SameSite=None;?/, 'SameSite=Lax');
                }
                
                responseHeaders.append('set-cookie', normalized);

                // DEEP BRIDGE: If this is an Appwrite session cookie, duplicate it as our civic_session_secret
                if (normalized.includes('a_session_')) {
                    const secretMatch = normalized.match(/a_session_[^=;]+=([^;]+)/);
                    if (secretMatch) {
                        const secret = secretMatch[1];
                        let bridgeCookie = `civic_session_secret=${secret}; Path=/; HttpOnly; SameSite=Lax`;
                        if (process.env.NODE_ENV === 'production') bridgeCookie += '; Secure';
                        responseHeaders.append('set-cookie', bridgeCookie);
                        console.log(`[PROXY_BRIDGE] Replicated Appwrite session to civic_session_secret`);
                    }
                }
            });
        }

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error: any) {
        console.error('[PROXY_ERROR]', error);
        return NextResponse.json({ error: 'Proxy implementation failed', details: error.message }, { status: 500 });
    }
}
