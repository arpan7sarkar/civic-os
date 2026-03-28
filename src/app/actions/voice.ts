"use server";

import { getServerSession } from "@/lib/appwrite.server";
import { strictLimiter, getClientIp } from "@/lib/ratelimit";
import { VoiceTurnInput, VoiceTurnOutput, VoiceTurnInputSchema } from "@/lib/voice";

/**
 * Server Action to parse a single turn of a voice-assisted grievance report.
 * Implements session security and rate limiting.
 */
export async function parseVoiceReportTurnAction(input: VoiceTurnInput) {
    try {
        // 0. Rate Limiting (Strict)
        const ip = await getClientIp();
        const { success: limitOk } = await strictLimiter.limit(ip);
        if (!limitOk) {
            return JSON.parse(JSON.stringify({ 
                success: false, 
                error: "Too many voice turns. Please wait a moment." 
            }));
        }

        // 1. Session Security Check
        const sessionSecret = await getServerSession();
        if (!sessionSecret) {
            return JSON.parse(JSON.stringify({ 
                success: false, 
                error: "UNAUTHORIZED_SESSION" 
            }));
        }

        // 2. Input Validation
        const validated = VoiceTurnInputSchema.safeParse(input);
        if (!validated.success) {
            console.error("[VOICE_ACTION] Validation failed:", validated.error.format());
            return JSON.parse(JSON.stringify({ 
                success: false, 
                error: "Invalid voice data format." 
            }));
        }

        const data = validated.data;

        // 3. Call Parser
        const { parseVoiceTurn } = await import("@/lib/gemini");
        const result = await parseVoiceTurn(data);

        return JSON.parse(JSON.stringify({ 
            success: true, 
            data: result 
        }));

    } catch (error: any) {
        console.error("[VOICE_ACTION] Critical Error:", error);
        return JSON.parse(JSON.stringify({ 
            success: false, 
            error: error.message || "Internal server error during voice parsing." 
        }));
    }
}
