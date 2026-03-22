'use server';

import { DATABASE_ID, PROFILES_COLLECTION_ID, PROFILE_IMAGES_BUCKET_ID, createAppwriteClient, getServerSession } from '@/lib/appwrite.server';
import { Query, ID } from 'appwrite';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

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
        // Multi-Layer Session Recovery
        const sessionSecret = await getServerSession();

        console.log(`[PROFILE_SERVER_V7] Session exists: ${!!sessionSecret}`);

        if (!sessionSecret) {
            return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));
        }

        // Real Session Fetch
        const { account, tablesDB } = createAppwriteClient(sessionSecret);
        const user = await account.get();
        console.log(`[PROFILE_SERVER_V5] Authenticated User: ${user.name} (${user.$id})`);
        
        try {
            const doc = await tablesDB.getRow({
                databaseId: DATABASE_ID,
                tableId: PROFILES_COLLECTION_ID,
                rowId: user.$id
            });
            
            const profile: UserProfile = {
                userId: doc.userId,
                name: doc.name || '',
                govIdType: doc.govIdType || '',
                govIdNumber: doc.govIdNumber || '',
                profileImageUrl: doc.profileImageUrl || '',
                email: doc.email || '',
                address: doc.address || ''
            };
            return JSON.parse(JSON.stringify({ 
                success: true, 
                isFullProfile: true, 
                profile 
            }));
        } catch (e) {
            // Profile doc doesn't exist
            return JSON.parse(JSON.stringify({ 
                success: true, 
                isFullProfile: false, 
                profile: null 
            }));
        }
    } catch (error: any) {
        console.error("[PROFILE_SERVER_V5] Error:", error.message);
        return JSON.parse(JSON.stringify({ 
            success: false, 
            isFullProfile: false, 
            profile: null,
            error: error.message || 'UNKNOWN_ERROR'
        }));
    }
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(data: Partial<UserProfile>) {
    try {
        const sessionSecret = await getServerSession();

        if (!sessionSecret) return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));

        const { tablesDB } = createAppwriteClient(sessionSecret);
        
        if (!data.userId) return JSON.parse(JSON.stringify({ success: false, error: 'USER_ID_REQUIRED' }));

        const result = await tablesDB.updateRow({
            databaseId: DATABASE_ID,
            tableId: PROFILES_COLLECTION_ID,
            rowId: data.userId as string, // Directly use userId as rowId
            data: data
        });

        return JSON.parse(JSON.stringify({ success: true, profile: result }));
    } catch (error: any) {
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Create a new user profile with optional image
 */
export async function createProfileWithImageAction(formData: FormData) {
    try {
        const sessionSecret = await getServerSession();

        if (!sessionSecret) return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));

        const { tablesDB, storage } = createAppwriteClient(sessionSecret);
        const userId = formData.get('userId') as string;
        const name = formData.get('name') as string;
        const govIdType = formData.get('govIdType') as string;
        const govIdNumber = formData.get('govIdNumber') as string;
        const imageFile = formData.get('image') as File | null;

        let profileImageUrl = '';
        if (imageFile && imageFile.size > 0) {
            const upload = await storage.createFile({
                bucketId: PROFILE_IMAGES_BUCKET_ID,
                fileId: ID.unique(),
                file: imageFile
            });
            const endpoint = env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
            const projectId = env.APPWRITE_PROJECT_ID || '';
            profileImageUrl = `${endpoint}/storage/buckets/${PROFILE_IMAGES_BUCKET_ID}/files/${upload.$id}/view?project=${projectId}`;
        }

        const profile: UserProfile = { userId, name, govIdType, govIdNumber, profileImageUrl };
        const result = await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: PROFILES_COLLECTION_ID,
            rowId: userId, // Use userId as rowId for direct access in checkRegistrationAction
            data: profile
        });

        return JSON.parse(JSON.stringify({ success: true, data: result }));
    } catch (error: any) {
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}
