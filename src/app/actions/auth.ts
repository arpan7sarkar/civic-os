'use server';

import { account, createAppwriteClient, ID } from '@/lib/appwrite';
import { cookies, headers } from 'next/headers';

/**
 * Send OTP to mobile
 */
export async function createPhoneTokenAction(mobile: string) {
    try {
        const finalUserId = ID.unique();
        const token = await account.createPhoneToken({
            userId: finalUserId,
            phone: `+91${mobile}`
        });
        return JSON.parse(JSON.stringify({ success: true, userId: token.userId }));
    } catch (error: any) {
        console.error("Create Token Error:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Set persistent bridge cookie after client validation
 */
export async function setBridgeCookieAction(userId: string) {
    try {
        console.log(`[AUTH_ACTION] Setting bridge cookie for UID: ${userId}`);
        const cookieStore = await cookies();
        cookieStore.set('civic_auth_verified', userId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        return JSON.parse(JSON.stringify({ success: true }));
    } catch (error: any) {
        console.error("[AUTH_ACTION] Set Bridge Cookie Error:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Get current user session
 */
export async function getCurrentUserAction() {
    try {
        console.log(`[AUTH_ACTION] Fetching current user...`);
        const cookieStore = await cookies();
        const headerStore = await headers();
        const rawCookies = headerStore.get('cookie') || '';
        
        // Appwrite cookies check
        let sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        const bridgeUserId = cookieStore.get('civic_auth_verified')?.value;

        console.log(`[AUTH_ACTION] Session preset: ${!!sessionSecret}, Bridge: ${!!bridgeUserId}`);

        if (!sessionSecret) {
            sessionSecret = headerStore.get('x-civic-session') || undefined;
            if (!sessionSecret && rawCookies.includes('a_session_')) {
                const match = rawCookies.match(/a_session_[^=;]+=([^;]+)/);
                if (match) sessionSecret = match[1].trim();
            }
        }

        if (!sessionSecret && !bridgeUserId) {
            console.warn(`[AUTH_ACTION] No session found`);
            return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));
        }

        const { account: serverAccount } = createAppwriteClient(sessionSecret);
        const user = await serverAccount.get();
        
        console.log(`[AUTH_ACTION] User found: ${user.$id} (${user.name})`);

        // Strict serialization to avoid "unexpected response" (Next.js crash on complex objects)
        const sanitizedUser = {
            $id: user.$id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            registration: user.registration,
            status: user.status
        };

        return JSON.parse(JSON.stringify({ 
            success: true, 
            user: sanitizedUser 
        }));
    } catch (error: any) {
        console.error("[AUTH_ACTION] Get Current User Error:", error?.message || error);
        return JSON.parse(JSON.stringify({ 
            success: false, 
            error: error?.message || String(error) 
        }));
    }
}

/**
 * Logout
 */
export async function logoutAction() {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        
        if (sessionSecret) {
            const { account: serverAccount } = createAppwriteClient(sessionSecret);
            await serverAccount.deleteSession({
                sessionId: 'current'
            });
        }

        cookieStore.delete('civic_auth_verified');
        // Standard Appwrite cookies are usually deleted by setSession(null) or similar, 
        // but here we let them expire or manually clear if we knew the names.
        
        return JSON.parse(JSON.stringify({ success: true }));
    } catch (error: any) {
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}
