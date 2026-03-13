'use server';

import { account, databases, storage, DATABASE_ID, PROFILES_COLLECTION_ID, PROFILE_IMAGES_BUCKET_ID, client } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { cookies } from 'next/headers';

export interface UserProfile {
    userId: string;
    name: string;
    govIdType: string;
    govIdNumber: string;
    profileImageUrl?: string;
}

/**
 * Get the current user's profile from Appwrite Database
 */
export async function getServerProfileAction() {
    try {
        const projectId = process.env.APPWRITE_PROJECT_ID;
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.get(`a_session_${projectId}`)?.value;

        if (sessionSecret) {
            client.setSession(sessionSecret);
        }

        const user = await account.get();
        console.log(`[PROFILE_ACTION] Found user: ${user.$id} (${user.name || 'No Name'})`);
        
        const response = await databases.listDocuments({
            databaseId: DATABASE_ID,
            collectionId: PROFILES_COLLECTION_ID,
            queries: [Query.equal('userId', user.$id)]
        });

        console.log(`[PROFILE_ACTION] Profile search for ${user.$id}: ${response.documents.length} docs found`);

        if (response.documents.length > 0) {
            const profile = JSON.parse(JSON.stringify(response.documents[0]));
            return { success: true, profile: profile as unknown as UserProfile };
        }
        return { success: true, profile: null };
    } catch (error: any) {
        if (error?.code === 401) {
            return { success: false, error: 'NO_SESSION' };
        }
        console.error("Profile Action - Get Profile Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new user profile with optional image
 */
export async function createProfileWithImageAction(formData: FormData) {
    try {
        const projectId = process.env.APPWRITE_PROJECT_ID;
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.get(`a_session_${projectId}`)?.value;

        if (sessionSecret) {
            client.setSession(sessionSecret);
        }

        const userId = formData.get('userId') as string;
        const name = formData.get('name') as string;
        const govIdType = formData.get('govIdType') as string;
        const govIdNumber = formData.get('govIdNumber') as string;
        const imageFile = formData.get('image') as File | null;

        let profileImageUrl = '';

        // 1. Upload Image if exists
        if (imageFile && imageFile.size > 0) {
            const upload = await storage.createFile({
                bucketId: PROFILE_IMAGES_BUCKET_ID,
                fileId: ID.unique(),
                file: imageFile
            });
            profileImageUrl = storage.getFileView({
                bucketId: PROFILE_IMAGES_BUCKET_ID,
                fileId: upload.$id
            });
        }

        // 2. Create Profile document
        const profile: UserProfile = {
            userId,
            name,
            govIdType,
            govIdNumber,
            profileImageUrl
        };

        const result = await databases.createDocument({
            databaseId: DATABASE_ID,
            collectionId: PROFILES_COLLECTION_ID,
            documentId: ID.unique(),
            data: profile
        });

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Profile Action - Create Profile Error:", error);
        return { success: false, error: error.message };
    }
}
