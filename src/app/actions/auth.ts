'use server';

import { account, ID, client } from '@/lib/appwrite';
import { cookies } from 'next/headers';

/**
 * Send an OTP to a mobile number
 */
export async function createPhoneTokenAction(mobile: string) {
    try {
        // Use the mobile number as a deterministic userId to support both new and existing users
        const userId = mobile.replace(/\D/g, ''); 
        const sessionToken = await account.createPhoneToken({
            userId,
            phone: '+91' + mobile
        });
        return { success: true, userId: sessionToken.userId };
    } catch (error: any) {
        console.error("Auth Action - Send OTP Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify the OTP and create a session
 * NOTE: This is tricky on the server with the Web SDK. 
 * Usually, the session is created via the SDK which sets an HTTP-only cookie.
 */
export async function verifyOTPAction(userId: string, secret: string) {
    try {
        console.log(`[VERIFY_OTP] Attempting verification for userId: "${userId}" with secret: "${secret}"`);
        const session = await account.createSession({
            userId,
            secret
        });
        console.log(`[VERIFY_OTP] Session created successfully for userId: "${userId}"`);
        
        // 2. Manual session persistence for the server-side context
        // Next.js Server Actions don't automatically propagate cookies set by the Appwrite Web SDK
        const projectId = process.env.APPWRITE_PROJECT_ID;
        const cookieStore = await cookies();
        
        if (projectId && session.secret) {
            const cookieName = `a_session_${projectId}`;
            cookieStore.set(cookieName, session.secret, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(session.expire),
            });
            console.log(`[VERIFY_OTP] Session cookie set: ${cookieName}`);
        }

        // Explicitly serialize the session object to a plain object for Client Components
        const serializedSession = {
            $id: session.$id,
            $createdAt: session.$createdAt,
            $updatedAt: session.$updatedAt,
            userId: session.userId,
            expire: session.expire,
            provider: session.provider,
            providerUid: session.providerUid,
            providerAccessToken: session.providerAccessToken,
            providerAccessTokenExpiry: session.providerAccessTokenExpiry,
            providerRefreshToken: session.providerRefreshToken,
            ip: session.ip,
            osCode: session.osCode,
            osName: session.osName,
            osVersion: session.osVersion,
            clientType: session.clientType,
            clientCode: session.clientCode,
            clientName: session.clientName,
            clientVersion: session.clientVersion,
            clientEngine: session.clientEngine,
            clientEngineVersion: session.clientEngineVersion,
            deviceName: session.deviceName,
            deviceBrand: session.deviceBrand,
            deviceModel: session.deviceModel,
            countryCode: session.countryCode,
            countryName: session.countryName,
            current: session.current,
            factors: session.factors,
            secret: session.secret,
            mfaUpdatedAt: session.mfaUpdatedAt
        };

        return { success: true, session: serializedSession };
    } catch (error: any) {
        console.error("Auth Action - Verify OTP Error:", error);
        return { success: false, error: error.message || "Verification failed" };
    }
}

/**
 * Get the current user
 */
export async function getCurrentUserAction() {
    try {
        // Appwrite Node SDK needs the session secret if it was set in a cookie
        const projectId = process.env.APPWRITE_PROJECT_ID;
        const cookieName = `a_session_${projectId}`;
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.get(cookieName)?.value;

        if (sessionSecret) {
            client.setSession(sessionSecret);
        }

        const user = await account.get();
        // Serialize for Client Component safety
        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        console.log("[GET_USER] No active session found.");
        return { success: false, error: 'NO_SESSION' };
    }
}

/**
 * Logout
 */
export async function logoutAction() {
    try {
        const projectId = process.env.APPWRITE_PROJECT_ID;
        const cookieName = `a_session_${projectId}`;
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.get(cookieName)?.value;

        if (sessionSecret) {
            client.setSession(sessionSecret);
        }

        await account.deleteSession({ sessionId: 'current' });
        
        // Clear cookie
        if (projectId) {
            cookieStore.delete(cookieName);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Auth Action - Logout Error:", error);
        return { success: false, error: error.message };
    }
}
