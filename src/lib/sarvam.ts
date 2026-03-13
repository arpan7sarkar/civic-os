import { SarvamAIClient } from "sarvamai";

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "";

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
        const response = await sarvamClient.speechToText.transcribe({
            file: buffer as any,
            model: "saaras:v3",
            mode: "transcribe"
        });
        return response;
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
        const response = await sarvamClient.textToSpeech.convert({
            text,
            model: "bulbul:v3",
            speaker: speaker as any,
            target_language_code: languageCode as any
        });
        return response.audios;
    } catch (error) {
        console.error("Sarvam TTS Error:", error);
        throw error;
    }
}
