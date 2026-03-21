'use server';

import { createAppwriteClient, getServerSession, ID } from '@/lib/appwrite';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * Send OTP to mobile
 */
export async function createPhoneTokenAction(mobile: string) {
    try {
        console.log(`[AUTH_ACTION] Creating phone token for: ${mobile}`);
        // Use the singleton client for public actions like token creation
        const { account: serverAccount } = createAppwriteClient();
        
        // Appwrite v23 modern object-style parameter
        const token = await serverAccount.createPhoneToken({
            userId: ID.unique(),
            phone: '+91' + mobile
        });
        
        console.log(`[AUTH_ACTION] Token created for: ${mobile}, UserId: ${token.userId}`);
        return JSON.parse(JSON.stringify({ 
            success: true, 
            userId: token.userId 
        }));
    } catch (error: any) {
        console.error("Create Token Error:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Check if the currently logged in user needs registration
 * Call this AFTER client-side session is established via proxy
 */
export async function checkRegistrationAction() {
    try {
        console.log(`[AUTH_ACTION_DEBUG] Checking registration status...`);
        const sessionSecret = await getServerSession();
        
        if (!sessionSecret) {
            console.error(`[AUTH_ACTION_DEBUG] NO_SESSION_SECRET found in checkRegistrationAction.`);
            return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));
        }

        // Bridge the session for proxy stability if not already present
        const cookieStore = await cookies();
        if (!cookieStore.get('civic_session_secret')) {
            console.log(`[AUTH_ACTION_DEBUG] Bridging session for proxy...`);
            await syncSessionAction(sessionSecret);
        }

        const { account: serverAccount, tablesDB } = createAppwriteClient(sessionSecret);
        const user = await serverAccount.get();
        console.log(`[AUTH_ACTION_DEBUG] Logged in user: ${user.name} (${user.$id})`);
        
        // ULTIMATE CHECK: Does a profile document exist in the database?
        let isNewUser = true;
        try {
            const profile = await tablesDB.getRow({
                databaseId: env.DATABASE_ID,
                tableId: env.PROFILES_COLLECTION_ID,
                rowId: user.$id
            });
            if (profile) {
                console.log(`[AUTH_ACTION_DEBUG] Profile found for user ${user.$id}. Not a new user.`);
                isNewUser = false;
            }
        } catch (e) {
            console.log(`[AUTH_ACTION_DEBUG] No profile found for ${user.$id}. classifying as NEW USER.`);
            isNewUser = true;
        }

        return JSON.parse(JSON.stringify({ 
            success: true, 
            userId: user.$id, 
            isNewUser,
            name: user.name 
        }));
    } catch (error: any) {
        console.error("[AUTH_ACTION_DEBUG] Error checking registration:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Get current user session
 */
export async function getCurrentUserAction() {
    try {
        console.log(`[AUTH_ACTION] Fetching current user...`);
        const sessionSecret = await getServerSession();

        if (!sessionSecret) {
            console.warn(`[AUTH_ACTION] No session found`);
            return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));
        }

        // Auto-bridge session for persistence
        const cookieStore = await cookies();
        if (!cookieStore.get('civic_session_secret')) {
            console.log(`[AUTH_ACTION] Auto-bridging session...`);
            await syncSessionAction(sessionSecret);
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
        console.error(`[AUTH_ACTION] Get Current User Error [${error?.code || 'NO_CODE'}]:`, error?.message || error);
        return JSON.parse(JSON.stringify({ 
            success: false, 
            error: error?.message || String(error),
            code: error?.code
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

        // Clear proxy cookies
        cookieStore.delete('a_session_');
        cookieStore.delete('a_session_undefined');
        cookieStore.delete('civic_session_secret');
        
        return JSON.parse(JSON.stringify({ success: true }));
    } catch (error: any) {
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}
/**
 * Official Login (Email/Password)
 */
export async function officialLoginAction(email: string, password: string) {
    try {
        console.log(`[AUTH_OFFICIAL] Authenticating official: ${email}`);
        
        // This is for server-side verification only if needed, 
        // but typically the client should establish the session first for cookies.
        // However, we'll provide this for completeness or server-to-server auth.
        const { account: serverAccount } = createAppwriteClient();
        const session = await serverAccount.createEmailPasswordSession({
            email,
            password
        });
        
        return JSON.parse(JSON.stringify({ 
            success: true, 
            userId: session.userId 
        }));
    } catch (error: any) {
        console.error("[AUTH_OFFICIAL] Login Error:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Manually sync a client-side session to a server-side cookie (Bridge).
 * This ensures NO_SESSION errors are avoided even if proxy cookies take time to propagate.
 */
export async function syncSessionAction(secret: string) {
    try {
        const cookieStore = await cookies();
        cookieStore.set('civic_session_secret', secret, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365
        });
        return JSON.parse(JSON.stringify({ success: true }));
    } catch (e: any) {
        return JSON.parse(JSON.stringify({ success: false, error: e.message }));
    }
}
