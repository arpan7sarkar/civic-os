import { Client, Account, Databases, Storage, ID, TablesDB } from 'appwrite';
import { env } from './env';

/**
 * Appwrite configuration for both client and server use.
 * Server-side uses base variables, client-side uses NEXT_PUBLIC_ prefixed ones.
 */
const PROJECT_ID = env.APPWRITE_PROJECT_ID || '';

/**
 * Client-side Appwrite singleton.
 * Uses relative proxy to fix Incognito cookie issues.
 */
const createBrowserClient = () => {
    const c = new Client();
    // Ensure relative endpoints get the full origin for the Appwrite SDK
    const rawEndpoint = env.APPWRITE_ENDPOINT || '/appwrite-proxy';
    const endpoint = (typeof window !== 'undefined' && rawEndpoint.startsWith('/')) 
        ? `${window.location.origin}${rawEndpoint}` 
        : rawEndpoint;
    c.setEndpoint(endpoint).setProject(PROJECT_ID);
    return c;
};

// Singleton for browser use
export const client = typeof window !== 'undefined' ? createBrowserClient() : new Client().setEndpoint(env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1').setProject(PROJECT_ID);
export const account = new Account(client);
export const databases = new Databases(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

/**
 * Robustly retrieve session secret from Server Context
 */
export async function getServerSession() {
    if (typeof window !== 'undefined') return undefined;

    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    const headerStore = await headers();
    const rawCookies = headerStore.get('cookie') || '';
    
    // Debug logging for session troubleshooting
    const allCookies = cookieStore.getAll();
    console.log(`[SESSION_DEBUG] Total cookies: ${allCookies.length}, Raw cookie header content: ${!!rawCookies}`);
    if (allCookies.length > 0) {
        console.log(`[SESSION_DEBUG] Cookie names: ${allCookies.map(c => c.name).join(', ')}`);
    }

    // 1. Check custom bridge cookie first (Setting it ourselves on our domain is most reliable)
    let sessionSecret = cookieStore.get('civic_session_secret')?.value;

    // 2. Fallback to standard Appwrite cookie name
    if (!sessionSecret) {
        sessionSecret = allCookies.find(c => c.name.startsWith('a_session_'))?.value;
    }
    
    // 3. Custom header check (for mobile/native bridges)
    if (!sessionSecret) sessionSecret = headerStore.get('x-civic-session') || undefined;
    
    // 4. Raw header parsing fallback
    if (!sessionSecret && rawCookies.includes('a_session_')) {
        const match = rawCookies.match(/a_session_[^=;]+=([^;]+)/);
        if (match) sessionSecret = match[1].trim();
    }
    
    if (!sessionSecret) {
        console.warn(`[SESSION_DEBUG] NO_SESSION found in any source (checked civic_session_secret and a_session_).`);
    } else {
        console.log(`[SESSION_DEBUG] Session secret found! (length: ${sessionSecret.length}, source: ${cookieStore.get('civic_session_secret') ? 'custom' : 'standard'})`);
    }

    return sessionSecret;
}

/**
 * Server-side request-scoped client factory.
 * Use this in Server Actions to ensure thread-safety.
 */
export const createAppwriteClient = (session?: string) => {
    const scopedClient = new Client();
    scopedClient.setEndpoint(env.APPWRITE_ENDPOINT).setProject(PROJECT_ID);
    
    if (session) {
        scopedClient.setSession(session);
    }
    
    return {
        account: new Account(scopedClient),
        databases: new Databases(scopedClient),
        tablesDB: new TablesDB(scopedClient),
        storage: new Storage(scopedClient),
        client: scopedClient
    };
};

export const DATABASE_ID = env.DATABASE_ID;
export const PROFILES_COLLECTION_ID = env.PROFILES_COLLECTION_ID; 
export const GRIEVANCES_COLLECTION_ID = env.GRIEVANCES_COLLECTION_ID;
export const PROFILE_IMAGES_BUCKET_ID = env.PROFILE_IMAGES_BUCKET_ID;
export const GRIEVANCE_IMAGES_BUCKET_ID = env.GRIEVANCE_IMAGES_BUCKET_ID;

export const APPWRITE_PROJECT_ID = PROJECT_ID;
export { ID };
