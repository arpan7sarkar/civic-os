/**
 * Environment variable validation and access utility.
 * Ensures required keys are present at runtime.
 */

const getEnv = (key: string, required = true): string => {
    const value = process.env[key];
    const isServer = typeof window === 'undefined';
    const isPublic = key.startsWith('NEXT_PUBLIC_');

    if (!value && required) {
        if (isServer) {
            // Strict enforcement on Server - this should stop the process
            throw new Error(`CRITICAL: Environment variable ${key} is missing. Please check your .env.local file.`);
        } else if (isPublic) {
            // On client, we log a warning instead of an error to prevent crashing during dev hmr/network issues
            console.warn(`[ENV] Public variable ${key} is missing in browser. Using fallback if available.`);
        }
    }
    return value || '';
};

export const env = {
    // AI Keys (Server Only)
    GEMINI_API_KEY: getEnv('GEMINI_API_KEY'),
    SARVAM_API_KEY: getEnv('SARVAM_API_KEY'),
    GEOAPIFY_API_KEY: getEnv('GEOAPIFY_API_KEY'),

    // Appwrite Config (Client & Server)
    // NOTE: Next.js requires static property access (process.env.NAME) for NEXT_PUBLIC_ vars on client
    APPWRITE_ENDPOINT: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT : (process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)) || 'https://sgp.cloud.appwrite.io/v1',
    APPWRITE_PROJECT_ID: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID : (process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)) || '69b02bf0001038d5437c',
    
    // IDs (Client Access via NEXT_PUBLIC_ fallbacks)
    DATABASE_ID: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID : (process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID)) || 'user_profiles',
    PROFILES_COLLECTION_ID: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID : (process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID || process.env.APPWRITE_PROFILES_COLLECTION_ID)) || 'user_profiles',
    GRIEVANCES_COLLECTION_ID: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_GRIEVANCES_COLLECTION_ID : (process.env.NEXT_PUBLIC_APPWRITE_GRIEVANCES_COLLECTION_ID || process.env.APPWRITE_GRIEVANCES_COLLECTION_ID)) || 'grievances',
    PROFILE_IMAGES_BUCKET_ID: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID : (process.env.NEXT_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || process.env.APPWRITE_PROFILE_IMAGES_BUCKET_ID)) || '',
    GRIEVANCE_IMAGES_BUCKET_ID: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APPWRITE_GRIEVANCE_IMAGES_BUCKET_ID : (process.env.NEXT_PUBLIC_APPWRITE_GRIEVANCE_IMAGES_BUCKET_ID || process.env.APPWRITE_GRIEVANCE_IMAGES_BUCKET_ID)) || '69b563e9002ced5d5f63',
    
    // Node Env
    IS_PROD: process.env.NODE_ENV === 'production',

    // Security (Server Only)
    // Used to bypass rate limits and CORS during development (Dev Key) 
    // or for full administrative access (API Key)
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || ''
};

if (typeof window === 'undefined') {
    console.log(`[ENV_INIT] Appwrite Endpoint: ${env.APPWRITE_ENDPOINT}`);
    console.log(`[ENV_INIT] Appwrite Project ID: ${env.APPWRITE_PROJECT_ID}`);
}
