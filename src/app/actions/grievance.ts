"use server";

import { cookies } from 'next/headers';
import { createAppwriteClient, DATABASE_ID, GRIEVANCES_COLLECTION_ID, GRIEVANCE_IMAGES_BUCKET_ID, ID } from '@/lib/appwrite';
import { Complaint } from '@/lib/types';

/**
 * Upload an image for a grievance
 */
export async function uploadGrievanceImageAction(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { storage } = createAppwriteClient(sessionSecret);
        const file = formData.get('image') as File;
        
        if (!file) return { success: false, error: 'NO_FILE' };

        const result = await storage.createFile(
            GRIEVANCE_IMAGES_BUCKET_ID,
            ID.unique(),
            file
        );

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
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases } = createAppwriteClient(sessionSecret);

        const result = await databases.createDocument(
            DATABASE_ID,
            GRIEVANCES_COLLECTION_ID,
            ID.unique(),
            {
                ...data,
                createdAt: new Date().toISOString()
            }
        );

        return { success: true, complaint: result };
    } catch (error: any) {
        console.error("Grievance Creation Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch all grievances for the map
 */
export async function getGrievancesAction() {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases } = createAppwriteClient(sessionSecret);

        const response = await databases.listDocuments(
            DATABASE_ID,
            GRIEVANCES_COLLECTION_ID
        );

        return { success: true, grievances: response.documents };
    } catch (error: any) {
        console.error("Fetch Grievances Error:", error);
        return { success: false, error: error.message };
    }
}
