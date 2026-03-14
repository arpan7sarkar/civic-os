import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Available Gemini models as of March 2026.
 */
export const GEMINI_MODELS = {
    primary: "gemini-3.1-flash-lite-preview",
    secondary: "gemini-2.5-flash-lite",
    pro: "gemini-3.1-pro-preview",
    stable: "gemini-2.5-flash"
};

/**
 * Integrated Gemini AI client function for analyzing civic issues.
 * Implements model fallback for rate limit maintenance (March 2026 standards).
 */
export async function analyzeIssue(description: string) {
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing");
        return {
            category: "Other",
            priority: "Medium",
            department: "General Administration",
            suggestedAction: "Manual inspection required (API Key Missing)."
        };
    }

    const tryAnalyze = async (modelName: string) => {
        console.log(`[GEMINI] Attempting analysis with ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `
        Analyze the following civic issue reported by a citizen in India. 
        Note: The report may be in Hindi, Bengali, or other native languages.
        
        Issue: "${description}"
        
        Tasks:
        1. Translate the input to English if it is in another language.
        2. Clean and Refine the description: Remove conversational filler, garbage values, greetings, and irrelevant chatter. 
        3. Rewrite it into a professional, concise, and clear English sentence suitable for a formal civic report.

        Provide a JSON response with:
        - category: string (one of: Streetlight, Garbage, Water Leakage, Road Damage, Encroachment, Illegal Parking, Other)
        - priority: string (one of: Critical, High, Medium, Low)
        - department: string (appropriate MCD department)
        - suggestedAction: string (short recommendation for back-office)
        - refinedDescription: string (The English, cleaned, and professional version of the issue)
        `;

        const generateWithTimeout = async () => {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Gemini Request Timed Out")), 15000);
            });

            const contentPromise = model.generateContent(prompt);
            return Promise.race([contentPromise, timeoutPromise]) as Promise<any>;
        };

        const result = await generateWithTimeout();
        const response = result.response; 
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    };

    try {
        return await tryAnalyze(GEMINI_MODELS.primary);
    } catch (error: any) {
        // Fallback for Rate Limits (429)
        const isRateLimit = error.status === 429 || error.message?.includes('429');
        if (isRateLimit) {
            console.warn(`[GEMINI] Rate limited on ${GEMINI_MODELS.primary}. Falling back to ${GEMINI_MODELS.secondary}`);
            try {
                return await tryAnalyze(GEMINI_MODELS.secondary);
            } catch (fallbackError) {
                console.error("[GEMINI] Fallback Model Error:", fallbackError);
            }
        }
        
        console.error("[GEMINI] Primary Model Error:", error);
        return {
            category: "Other",
            priority: "Medium",
            department: "General Administration",
            suggestedAction: "Conduct manual inspection due to AI latency/error."
        };
    }
}
