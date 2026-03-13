import { Client, Account, Databases, Storage, ID } from 'appwrite';

/**
 * Appwrite configuration for both client and server use.
 * Server-side uses base variables, client-side uses NEXT_PUBLIC_ prefixed ones.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || '';

/**
 * Client-side Appwrite singleton.
 * Uses native browser cookie handling.
 */
const createBrowserClient = () => {
    const c = new Client();
    c.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    return c;
};

// Singleton for browser use
export const client = typeof window !== 'undefined' ? createBrowserClient() : createBrowserClient(); // Fallback for node but browser primarily
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/**
 * Server-side request-scoped client factory.
 * Use this in Server Actions to ensure thread-safety.
 */
export const createAppwriteClient = (session?: string) => {
    const scopedClient = new Client();
    scopedClient.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    
    if (session) {
        scopedClient.setSession(session);
    }
    
    return {
        account: new Account(scopedClient),
        databases: new Databases(scopedClient),
        storage: new Storage(scopedClient),
        client: scopedClient
    };
};

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'user_profiles';
export const PROFILES_COLLECTION_ID = process.env.APPWRITE_PROFILES_COLLECTION_ID || 'user_profiles'; 
export const PROFILE_IMAGES_BUCKET_ID = process.env.APPWRITE_PROFILE_IMAGES_BUCKET_ID || '';

export { ID };
