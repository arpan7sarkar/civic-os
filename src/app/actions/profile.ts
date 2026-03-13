'use server';

import { DATABASE_ID, PROFILES_COLLECTION_ID, PROFILE_IMAGES_BUCKET_ID, createAppwriteClient } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { cookies, headers } from 'next/headers';

export interface UserProfile {
    userId: string;
    name: string;
    govIdType: string;
    govIdNumber: string;
    profileImageUrl?: string;
    email?: string;
    address?: string;
}

/**
 * Get the current user's profile from Appwrite Database
 */
export async function getServerProfileAction() {
    try {
        const cookieStore = await cookies();
        const headerStore = await headers();
        const rawCookies = headerStore.get('cookie') || '';
        
        // 1. Multi-Layer Session Recovery
        let sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        const bridgeUserId = cookieStore.get('civic_auth_verified')?.value;

        // Manual Fallback if cookies() fails
        if (!sessionSecret) {
            // Check x-civic-session header (from Proxy)
            sessionSecret = headerStore.get('x-civic-session') || undefined;
            
            // Check raw cookies as last resort
            if (!sessionSecret && rawCookies.includes('a_session_')) {
                const match = rawCookies.match(/a_session_[^=;]+=([^;]+)/);
                if (match) sessionSecret = match[1].trim();
            }
        }

        console.log(`[PROFILE_SERVER_V5] Session: ${!!sessionSecret}, Bridge: ${!!bridgeUserId}`);

        if (!sessionSecret) {
            if (bridgeUserId) {
                console.log(`[PROFILE_SERVER_V5] Falling back to Bridge UI for UID: ${bridgeUserId}`);
                return { 
                    success: true, 
                    profile: { 
                        userId: bridgeUserId, 
                        name: 'Citizen (Bridge Verified)', 
                        govIdType: 'Verified', 
                        govIdNumber: '****' 
                    } as UserProfile 
                };
            }
            return { success: false, error: 'NO_SESSION' };
        }

        // Real Session Fetch
        const { account, databases } = createAppwriteClient(sessionSecret);
        const user = await account.get();
        console.log(`[PROFILE_SERVER_V5] Authenticated User: ${user.name} (${user.$id})`);
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal('userId', user.$id)]
        );

        if (response.documents.length > 0) {
            const profile = JSON.parse(JSON.stringify(response.documents[0]));
            return { success: true, profile: profile as unknown as UserProfile };
        }

        // If no DB profile exists, fallback to account info
        return { 
            success: true, 
            profile: { 
                userId: user.$id, 
                name: user.name || 'Citizen', 
                govIdType: 'N/A', 
                govIdNumber: 'N/A' 
            } as UserProfile 
        };
    } catch (error: any) {
        console.error("[PROFILE_SERVER_V5] Error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(data: Partial<UserProfile>) {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;

        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases } = createAppwriteClient(sessionSecret);
        
        if (!data.userId) return { success: false, error: 'USER_ID_REQUIRED' };

        const response = await databases.listDocuments(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal('userId', data.userId as string)]
        );

        if (response.documents.length === 0) {
            return { success: false, error: 'PROFILE_NOT_FOUND' };
        }

        const docId = response.documents[0].$id;
        const result = await databases.updateDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            docId,
            data
        );

        return { success: true, profile: JSON.parse(JSON.stringify(result)) as UserProfile };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Create a new user profile with optional image
 */
export async function createProfileWithImageAction(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;

        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases, storage } = createAppwriteClient(sessionSecret);
        const userId = formData.get('userId') as string;
        const name = formData.get('name') as string;
        const govIdType = formData.get('govIdType') as string;
        const govIdNumber = formData.get('govIdNumber') as string;
        const imageFile = formData.get('image') as File | null;

        let profileImageUrl = '';
        if (imageFile && imageFile.size > 0) {
            const upload = await storage.createFile(
                PROFILE_IMAGES_BUCKET_ID,
                ID.unique(),
                imageFile
            );
            profileImageUrl = storage.getFileView(
                PROFILE_IMAGES_BUCKET_ID,
                upload.$id
            ).toString();
        }

        const profile: UserProfile = { userId, name, govIdType, govIdNumber, profileImageUrl };
        const result = await databases.createDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            ID.unique(),
            profile
        );

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
