"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SarvamAIClient } from "sarvamai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Server Action to analyze civic issues using Gemini
 */
export async function analyzeIssueAction(description: string) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
    
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const prompt = `
    Analyze the following civic issue reported by a citizen in Delhi:
    "${description}"
    
    Provide a JSON response with:
    - category: string (one of: Water Leakage, Garbage Collection, Street Light, Road Repair, Drainage, Other)
    - priority: string (one of: Critical, High, Medium, Low)
    - department: string (appropriate MCD department)
    - suggestedAction: string (short recommendation for back-office)
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Server Error:", error);
        return {
            category: "Other",
            priority: "Medium",
            department: "General Administration",
            suggestedAction: "Conduct manual inspection."
        };
    }
}

/**
 * Server Action for Sarvam Transcription
 */
export async function transcribeAudioAction(base64Audio: string) {
    if (!SARVAM_API_KEY) throw new Error("SARVAM_API_KEY is not configured");
    
    const sarvamClient = new SarvamAIClient({
        apiSubscriptionKey: SARVAM_API_KEY
    });

    try {
        // Convert base64 to buffer for the SDK
        const buffer = Buffer.from(base64Audio, 'base64');
        const response = await sarvamClient.speechToText.transcribe({
            file: buffer as any,
            model: "saaras:v3",
            mode: "transcribe"
        });
        return response;
    } catch (error) {
        console.error("Sarvam Server STT Error:", error);
        throw error;
    }
}

export async function textToSpeechAction(text: string, speaker: string = "shubh") {
    if (!SARVAM_API_KEY) throw new Error("SARVAM_API_KEY is not configured");
    
    const sarvamClient = new SarvamAIClient({
        apiSubscriptionKey: SARVAM_API_KEY
    });

    try {
        const response = await sarvamClient.textToSpeech.convert({
            text,
            model: "bulbul:v3",
            speaker: speaker as any,
            target_language_code: "en-IN"
        });
        return response.audios;
    } catch (error) {
        console.error("Sarvam Server TTS Error:", error);
        throw error;
    }
}
