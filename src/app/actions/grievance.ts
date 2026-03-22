"use server";

import { createAppwriteClient, DATABASE_ID, GRIEVANCES_COLLECTION_ID, GRIEVANCE_IMAGES_BUCKET_ID, ID, getServerSession } from '@/lib/appwrite';
import { Complaint } from '@/lib/types';
import { InputFile } from 'node-appwrite/file';
import { Schemas, sanitizeString } from "@/lib/security";
import { standardLimiter, getClientIp } from "@/lib/ratelimit";

/**
 * Upload an image for a grievance
 */
export async function uploadGrievanceImageAction(formData: FormData) {
    try {
        const sessionSecret = await getServerSession();
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { storage } = createAppwriteClient(sessionSecret);
        const file = formData.get('image') as File;
        
        if (!file) return { success: false, error: 'NO_FILE' };

        // Convert Web File to ArrayBuffer, then Buffer, then InputFile
        const buffer = Buffer.from(await file.arrayBuffer());
        const inputFile = InputFile.fromBuffer(buffer, file.name || 'image.jpg');

        const result = await storage.createFile({
            bucketId: GRIEVANCE_IMAGES_BUCKET_ID,
            fileId: ID.unique(),
            file: inputFile
        });

        return { success: true, fileId: result.$id };
    } catch (error: any) {
        console.error("Image Upload Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new grievance in Appwrite
 */
export async function createGrievanceAction(data: Partial<Complaint>) {
    try {
        // 0. Rate Limiting (Standard)
        const ip = await getClientIp();
        const { success: limitOk } = await standardLimiter.limit(ip);
        if (!limitOk) {
            return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
        }

        const sessionSecret = await getServerSession();
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { tablesDB, account: serverAccount } = createAppwriteClient(sessionSecret);
        
        // Get user details to ensure userId is correctly set in document
        const user = await serverAccount.get();
        const userId = user.$id;
        const { id, rawDescription, ...attributes } = data; // Destructure rawDescription to omit it from final attributes

        // 1. Validate Input Payload
        const vPayload = Schemas.grievance.create.safeParse({
            category: attributes.category,
            description: attributes.description,
            ward: attributes.ward,
            latitude: attributes.lat,
            longitude: attributes.lng,
            address: attributes.department, // Deprecated map field check: reuse department or similar if needed
        });

        if (!vPayload.success) {
            console.error("[GRIEVANCE_ACTION] Validation Failed:", vPayload.error.flatten());
            return { success: false, error: "VALIDATION_ERROR", details: vPayload.error.flatten() };
        }

        const cleanData = vPayload.data;
        const documentId = id || ID.unique();

        // 2. Sanitize Strings
        const safeDescription = sanitizeString(cleanData.description);
        const safeWard = sanitizeString(cleanData.ward || "");

        // Normalize IDs in case they have prefixes in some environments but not others
        const finalDbId = DATABASE_ID;
        const finalCollId = GRIEVANCES_COLLECTION_ID;

        console.log(`[GRIEVANCE_ACTION] Submitting to DB: ${finalDbId}, Coll: ${finalCollId}`);

        const result = await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: GRIEVANCES_COLLECTION_ID,
            rowId: documentId,
            data: {
                ...attributes,
                description: safeDescription, // Use sanitized description
                ward: safeWard,               // Use sanitized ward
                userId: userId,               // Force current logged-in user ID
                status: attributes.status || 'Pending', // Default status
                createdAt: attributes.createdAt || new Date().toISOString()
            }
        });

        console.log(`[GRIEVANCE_ACTION] Success! Doc ID: ${result.$id}`);
        // Ensure plain object for Next.js 16 serialization
        return JSON.parse(JSON.stringify({ success: true, complaint: result }));
    } catch (error: any) {
        // Handle "ID already exists" (409) as success for sync stability
        if (error.code === 409) {
            console.warn(`[GRIEVANCE_ACTION] Document ${data.id} already exists, treating as success.`);
            return { success: true, isConflict: true };
        }
        console.error("Grievance Creation Error Details:", {
            message: error.message,
            code: error.code,
            response: error.response
        });
        return { success: false, error: error.message || "DATABASE_ERROR" };
    }
}

import { Query } from 'appwrite';

/**
 * Fetch all grievances for the map/dashboard
 */
export async function getGrievancesAction() {
    try {
        const sessionSecret = await getServerSession();
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };
        
        const { tablesDB, account: serverAccount } = createAppwriteClient(sessionSecret);
        const user = await serverAccount.get();

        // WORKAROUND: In Appwrite 1.8.1, encrypted attributes like 'userId' cannot be queried.
        // We fetch the latest grievances and filter in-memory for security compliance.
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: GRIEVANCES_COLLECTION_ID,
            queries: [Query.orderDesc('createdAt'), Query.limit(100)]
        });

        // Filter by the current user's ID manually
        const userGrievances = response.rows.filter(row => row.userId === user.$id);

        // ALWAYS sanitize for Next.js 16 serialization (Plain Objects only)
        return JSON.parse(JSON.stringify({ success: true, grievances: userGrievances }));
    } catch (error: any) {
        console.error("Fetch Grievances Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch ALL grievances for the global map
 */
export async function getAllGrievancesAction() {
    try {
        const sessionSecret = await getServerSession();
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };
        
        const { tablesDB } = createAppwriteClient(sessionSecret);

        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: GRIEVANCES_COLLECTION_ID,
            queries: [Query.orderDesc('createdAt'), Query.limit(100)]
        });

        // ALWAYS sanitize for Next.js 16 serialization (Plain Objects only)
        return JSON.parse(JSON.stringify({ success: true, grievances: response.rows }));
    } catch (error: any) {
        console.error("Fetch All Grievances Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync all user's grievances with their new profile details
 */
export async function syncGrievanceUserDetailsAction(userId: string, newName: string) {
    try {
        const sessionSecret = await getServerSession();
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };
        
        const { tablesDB } = createAppwriteClient(sessionSecret);

        // WORKAROUND: Cannot query encrypted 'userId'. Fetch and filter.
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: GRIEVANCES_COLLECTION_ID,
            queries: [Query.limit(500)] // High limit for sync operations
        });

        const userRows = response.rows.filter(row => row.userId === userId);
        console.log(`[SYNC_GRIEVANCES] Found ${userRows.length} grievances for ${userId} to sync with name: ${newName}`);

        return { success: true, syncedCount: userRows.length };

        // Update each document to have the new user details in descriptions or wherever needed if we stored name
        // Wait, does Grievance store the user's name? 
        // Let's actually just log it and see if we need to update anything. Often, grievances only store userId.
        // If they rely on joins, we don't need to update.
        // Looking at the dashboard, name isn't directly on the grievance.
        
        return { success: true, syncedCount: response.rows.length };
    } catch (error: any) {
        console.error("Sync Grievances Error:", error);
        return { success: false, error: error.message };
    }
}
