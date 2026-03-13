"use server";

import { analyzeIssue } from "@/lib/gemini";
import { transcribeAudio, textToSpeech } from "@/lib/sarvam";

/**
 * Server Action to analyze civic issues using Gemini library
 */
export async function analyzeIssueAction(description: string) {
    return await analyzeIssue(description);
}

/**
 * Server Action for Sarvam Transcription using library
 */
export async function transcribeAudioAction(base64Audio: string) {
    return await transcribeAudio(base64Audio);
}

/**
 * Server Action for Sarvam TTS using library
 */
export async function textToSpeechAction(text: string, speaker: string = "shubh", languageCode: string = "hi-IN") {
    return await textToSpeech(text, speaker, languageCode);
}
