
const { Client, Databases } = require('appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);

const databases = new Databases(client);

async function checkSchema() {
    try {
        console.log("Checking Database:", process.env.APPWRITE_DATABASE_ID);
        console.log("Checking Collection:", process.env.APPWRITE_GRIEVANCES_COLLECTION_ID);
        
        // Try to list documents (even if empty) to check connectivity
        const res = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_GRIEVANCES_COLLECTION_ID
        );
        console.log("Connection Success! Documents found:", res.total);
        
        // Try to get collection details (if we have permissions)
        try {
            const collection = await databases.getCollection(
                process.env.APPWRITE_DATABASE_ID,
                process.env.APPWRITE_GRIEVANCES_COLLECTION_ID
            );
            console.log("Collection Attributes:", collection.attributes.map(a => a.key).join(", "));
        } catch (e) {
            console.warn("Could not fetch collection attributes (likely permission):", e.message);
        }
    } catch (e) {
        console.error("Diagnostic Failed:", e.message);
    }
}

checkSchema();
