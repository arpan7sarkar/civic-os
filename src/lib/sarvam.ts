import 'server-only';
import { SarvamAIClient } from "sarvamai";

import { env } from "./env";
const SARVAM_API_KEY = env.SARVAM_API_KEY;

const sarvamClient = SARVAM_API_KEY ? new SarvamAIClient({
    apiSubscriptionKey: SARVAM_API_KEY
}) : null;

/**
 * Integrated Sarvam AI client function for transcription
 */
export async function transcribeAudio(base64Audio: string) {
    if (!sarvamClient) {
        throw new Error("SARVAM_API_KEY is not configured");
    }

    try {
        const buffer = Buffer.from(base64Audio, 'base64');
        // RETRY logic for stability
        let response;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Sarvam Transcription Timed Out")), 30000);
                });

                const callPromise = sarvamClient.speechToText.transcribe({
                    file: buffer as any,
                    model: "saaras:v1", // Explicitly use v1 which has the widest language auto-detect support
                    languageCode: "Unknown", // Supports all native languages detection
                    withDiacritics: true
                } as any);

                response = await Promise.race([callPromise, timeoutPromise]);
                break; // Success
            } catch (err: any) {
                if (attempt === 3) throw err;
                console.warn(`[SARVAM_STT] Attempt ${attempt} failed: ${err.message}. Retrying...`);
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
        
        console.log("[SARVAM_STT] Raw Response:", JSON.stringify(response).slice(0, 100) + '...');
        // Correctly extract the actual transcript from the Sarvam response
        const transcriptText = (response as any)?.transcript || (response as any)?.text || (response as any)?.data || String(response);
        return { transcript: transcriptText };
    } catch (error) {
        console.error("Sarvam STT Error:", error);
        throw error;
    }
}

/**
 * Integrated Sarvam AI client function for text-to-speech
 */
export async function textToSpeech(text: string, speaker: string = "shubh", languageCode: string = "hi-IN") {
    if (!sarvamClient) {
        throw new Error("SARVAM_API_KEY is not configured");
    }

    try {
        // RETRY logic for stability
        let response: any;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Sarvam TTS Timed Out")), 30000);
                });

                const callPromise = sarvamClient.textToSpeech.convert({
                    text,
                    model: "bulbul:v3",
                    speaker: speaker as any,
                    target_language_code: languageCode as any
                });

                response = await Promise.race([callPromise, timeoutPromise]);
                break; // Success
            } catch (err: any) {
                if (attempt === 3) throw err;
                console.warn(`[SARVAM_TTS] Attempt ${attempt} failed: ${err.message}. Retrying...`);
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
        return response.audios;
    } catch (error) {
        console.error("Sarvam TTS Error:", error);
        throw error;
    }
}
