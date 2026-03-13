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
        return { success: true, userId: token.userId };
    } catch (error: any) {
        console.error("Create Token Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Set persistent bridge cookie after client validation
 */
export async function setBridgeCookieAction(userId: string) {
    try {
        const cookieStore = await cookies();
        cookieStore.set('civic_auth_verified', userId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        return { success: true };
    } catch (error: any) {
        console.error("Set Bridge Cookie Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current user session
 */
export async function getCurrentUserAction() {
    try {
        const cookieStore = await cookies();
        const headerStore = await headers();
        const rawCookies = headerStore.get('cookie') || '';
        
        let sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        const bridgeUserId = cookieStore.get('civic_auth_verified')?.value;

        if (!sessionSecret) {
            sessionSecret = headerStore.get('x-civic-session') || undefined;
            if (!sessionSecret && rawCookies.includes('a_session_')) {
                const match = rawCookies.match(/a_session_[^=;]+=([^;]+)/);
                if (match) sessionSecret = match[1].trim();
            }
        }

        if (!sessionSecret && !bridgeUserId) return { success: false, error: 'NO_SESSION' };

        const { account: serverAccount } = createAppwriteClient(sessionSecret);
        const user = await serverAccount.get();
        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message };
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
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
