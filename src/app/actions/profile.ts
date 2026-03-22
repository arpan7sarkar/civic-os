'use server';

import { DATABASE_ID, PROFILES_COLLECTION_ID, PROFILE_IMAGES_BUCKET_ID, createAppwriteClient, getServerSession } from '@/lib/appwrite.server';
import { Query, ID } from 'appwrite';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { InputFile } from 'node-appwrite/file';
import { Schemas, sanitizeString } from "@/lib/security";
import { standardLimiter, getClientIp } from "@/lib/ratelimit";

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
        const { account, tablesDB, databases } = createAppwriteClient(sessionSecret);
        const user = await account.get();
        console.log(`[PROFILE_SERVER_V5] Authenticated User: ${user.name} (${user.$id})`);
        
        try {
            // Because legacy rows may have arbitrary Document IDs, query strictly by `userId` column
            const profileList = await databases.listDocuments(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                [Query.equal('userId', user.$id), Query.limit(1)]
            );
            
            if (profileList.documents.length === 0) {
                console.log(`[PROFILE_SERVER_V7] No legacy or modern profile rows found for user ${user.$id}.`);
                return JSON.parse(JSON.stringify({ 
                    success: true, 
                    isFullProfile: false, 
                    userId: user.$id 
                }));
            }

            const doc = profileList.documents[0];
            
            const profile: UserProfile = {
                userId: doc.userId,
                name: doc.name || user.name,
                govIdType: doc.govIdType || 'Aadhaar',
                govIdNumber: doc.govIdNumber || '',
                profileImageUrl: doc.profileImageUrl || '',
                email: user.email,
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
        // 0. Rate Limiting (Standard)
        const ip = await getClientIp();
        const { success: limitOk } = await standardLimiter.limit(ip);
        if (!limitOk) {
            return JSON.parse(JSON.stringify({ success: false, error: 'RATE_LIMIT_EXCEEDED' }));
        }

        const sessionSecret = await getServerSession();

        if (!sessionSecret) return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));

        const { tablesDB } = createAppwriteClient(sessionSecret);
        
        if (!data.userId) return JSON.parse(JSON.stringify({ success: false, error: 'USER_ID_REQUIRED' }));

        // 1. Validate Input
        const vPayload = Schemas.profile.update.safeParse(data);
        if (!vPayload.success) {
            return JSON.parse(JSON.stringify({ success: false, error: "VALIDATION_ERROR", details: vPayload.error.flatten() }));
        }
        const cleanData = vPayload.data;

        // 2. Sanitize Strings
        const safeProfile = {
            ...cleanData,
            name: sanitizeString(cleanData.name),
            bio: sanitizeString(cleanData.bio || ""),
            address: sanitizeString(cleanData.address || ""),
        };

        const result = await tablesDB.updateRow({
            databaseId: DATABASE_ID,
            tableId: PROFILES_COLLECTION_ID,
            rowId: data.userId as string, // Directly use userId as rowId
            data: safeProfile
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
        // 0. Rate Limiting (Standard)
        const ip = await getClientIp();
        const { success: limitOk } = await standardLimiter.limit(ip);
        if (!limitOk) {
            return JSON.parse(JSON.stringify({ success: false, error: 'RATE_LIMIT_EXCEEDED' }));
        }

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
            // Convert Web File to ArrayBuffer, then Buffer, then InputFile
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const inputFile = InputFile.fromBuffer(buffer, imageFile.name || 'profile.jpg');

            const upload = await storage.createFile({
                bucketId: PROFILE_IMAGES_BUCKET_ID,
                fileId: ID.unique(),
                file: inputFile
            });
            const endpoint = env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
            const projectId = env.APPWRITE_PROJECT_ID || '';
            profileImageUrl = `${endpoint}/storage/buckets/${PROFILE_IMAGES_BUCKET_ID}/files/${upload.$id}/view?project=${projectId}`;
        }

        // 1. Sanitize Basic Inputs
        const safeName = sanitizeString(name);
        const safeGovIdNumber = sanitizeString(govIdNumber);

        const profile: UserProfile = { userId, name: safeName, govIdType, govIdNumber: safeGovIdNumber, profileImageUrl };
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
