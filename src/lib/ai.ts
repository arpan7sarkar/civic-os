import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ComplaintCategory, Priority } from "./types";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const DEPARTMENT_MAPPING: Record<ComplaintCategory, string> = {
    'Streetlight': 'Electrical',
    'Garbage': 'Sanitation',
    'Road Damage': 'PWD',
    'Water Leakage': 'Jal Board',
    'Encroachment': 'Enforcement',
    'Illegal Parking': 'Traffic Control'
};

const PRIORITY_RULES: Record<string, Priority> = {
    'water': 'Critical',
    'leakage': 'Critical',
    'flood': 'Critical',
    'street': 'High',
    'light': 'High',
    'dark': 'High',
    'garbage': 'Medium',
    'waste': 'Medium',
    'pothole': 'Medium',
    'road': 'Medium',
    'parking': 'Low'
};

const CATEGORY_KEYWORDS: Record<string, ComplaintCategory> = {
    'light': 'Streetlight',
    'bulb': 'Streetlight',
    'dark': 'Streetlight',
    'garbage': 'Garbage',
    'waste': 'Garbage',
    'trash': 'Garbage',
    'water': 'Water Leakage',
    'pipe': 'Water Leakage',
    'leak': 'Water Leakage',
    'pothole': 'Road Damage',
    'road': 'Road Damage',
    'tar': 'Road Damage',
    'encroach': 'Encroachment',
    'shop': 'Encroachment',
    'parking': 'Illegal Parking',
    'car': 'Illegal Parking'
};

export async function analyzeComplaint(description: string): Promise<AnalysisResult> {
    if (GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-lite" });

            const prompt = `
        Classify this civic complaint for a municipal system in Delhi, India. 
        Description: "${description}"
        
        Return ONLY a JSON object with this structure:
        {
          "category": "Streetlight" | "Garbage" | "Water Leakage" | "Road Damage" | "Encroachment" | "Illegal Parking",
          "priority": "Critical" | "High" | "Medium" | "Low"
        }

        Priority Rules:
        - Water leakage surge/broken main → Critical
        - Streetlight outage/Dark area → High
        - Garbage/Open waste → Medium
        - Potholes/Road issues → Medium
        - Small encroachments → Low
      `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanedText = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanedText);

            return {
                category: parsed.category,
                priority: parsed.priority,
                department: DEPARTMENT_MAPPING[parsed.category as ComplaintCategory] || 'General Administration'
            };
        } catch (error) {
            console.error("Gemini API error:", error);
            return fallbackClassifier(description);
        }
    }

    return fallbackClassifier(description);
}

function fallbackClassifier(text: string): AnalysisResult {
    const lowercaseText = text.toLowerCase();

    let category: ComplaintCategory = 'Garbage'; // Default
    for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
        if (lowercaseText.includes(kw)) {
            category = cat;
            break;
        }
    }

    let priority: Priority = 'Medium'; // Default
    for (const [kw, prio] of Object.entries(PRIORITY_RULES)) {
        if (lowercaseText.includes(kw)) {
            priority = prio;
            break;
        }
    }

    return {
        category,
        priority,
        department: DEPARTMENT_MAPPING[category]
    };
}
