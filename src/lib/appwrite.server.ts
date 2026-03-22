import 'server-only';
import { Client, Account, Databases, Storage, ID } from 'node-appwrite';
import { env } from './env';
import { cookies } from 'next/headers';

// Constants
export const PROJECT_ID = env.APPWRITE_PROJECT_ID || '';
export const DATABASE_ID = env.DATABASE_ID;
export const PROFILES_COLLECTION_ID = env.PROFILES_COLLECTION_ID;
export const GRIEVANCES_COLLECTION_ID = env.GRIEVANCES_COLLECTION_ID;
export const PROFILE_IMAGES_BUCKET_ID = env.PROFILE_IMAGES_BUCKET_ID;
export const GRIEVANCE_IMAGES_BUCKET_ID = env.GRIEVANCE_IMAGES_BUCKET_ID;
export { ID };

/**
 * Retrieves the session secret securely from the server-side cookies.
 */
export async function getServerSession() {
    const cookieStore = await cookies();
    
    // 1. Check custom bridge cookie first
    let sessionSecret = cookieStore.get('civic_session_secret')?.value;

    // 2. Fallback to standard Appwrite cookie name 
    //    (Useful if migrating or if setting occurred before proxy removal)
    if (!sessionSecret) {
        sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
    }
    
    return sessionSecret;
}

/**
 * Creates an Appwrite Client strictly for Server Actions.
 * When sessionSecret is provided, it acts on behalf of that user.
 * Otherwise, it can be used for session generation (e.g. createSession)
 */
export function createAppwriteClient(sessionSecret?: string) {
    const client = new Client()
        .setEndpoint(env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID);

    if (sessionSecret) {
        client.setSession(sessionSecret);
    }

    const databases = new Databases(client);

    const tablesDB = {
        getRow: async (params: { databaseId: string, tableId: string, rowId: string }) => {
            return await databases.getDocument(params.databaseId, params.tableId, params.rowId);
        },
        createRow: async (params: { databaseId: string, tableId: string, rowId?: string, data: any }) => {
            return await databases.createDocument(params.databaseId, params.tableId, params.rowId || ID.unique(), params.data);
        },
        updateRow: async (params: { databaseId: string, tableId: string, rowId: string, data: any }) => {
            return await databases.updateDocument(params.databaseId, params.tableId, params.rowId, params.data);
        },
        deleteRow: async (params: { databaseId: string, tableId: string, rowId: string }) => {
            return await databases.deleteDocument(params.databaseId, params.tableId, params.rowId);
        },
        listRows: async (params: { databaseId: string, tableId: string, queries?: string[] }) => {
            return await databases.listDocuments(params.databaseId, params.tableId, params.queries);
        }
    };

    return {
        get account() { return new Account(client); },
        get databases() { return databases; },
        get storage() { return new Storage(client); },
        get tablesDB() { return tablesDB; }
    };
}
