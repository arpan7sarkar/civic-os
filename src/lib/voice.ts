import { z } from 'zod';
import { ComplaintCategory, Priority } from './types';

/**
 * Intents recognized by the Voice Autopilot
 */
export const VoiceIntentSchema = z.enum([
    'provide_info',     // User is giving details about the issue or location
    'correct_info',     // User wants to change something already provided
    'request_gps',      // User wants to use their current GPS location
    'confirm_submit',   // User explicitly confirms they want to submit
    'cancel',           // User wants to stop the process
    'repeat',           // User wants the last prompt repeated
    'unknown'           // Ambiguous intent
]);

export type VoiceIntent = z.infer<typeof VoiceIntentSchema>;

/**
 * The structured data representing a draft report being built via voice
 */
export const VoiceDraftSchema = z.object({
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.string().optional(),
    department: z.string().optional(),
    locationText: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    ward: z.string().optional(),
    wantsGps: z.boolean().optional(),
    wantsSubmit: z.boolean().optional(),
    confirmationState: z.enum(['none', 'pending', 'confirmed']).optional().default('none'),
});

export type VoiceDraft = z.infer<typeof VoiceDraftSchema>;

/**
 * Input passed to the voice parser for each turn
 */
export const VoiceTurnInputSchema = z.object({
    transcript: z.string(),
    currentDraft: VoiceDraftSchema,
    languageHint: z.string().optional(),
    userContext: z.any().optional(),
});

export type VoiceTurnInput = z.infer<typeof VoiceTurnInputSchema>;

/**
 * Output returned by the voice parser after processing an utterance
 */
export const VoiceTurnOutputSchema = z.object({
    draftPatch: VoiceDraftSchema.partial(),
    missingFields: z.array(z.string()),
    nextPrompt: z.string(),
    intents: z.array(VoiceIntentSchema),
    confidence: z.number(),
});

export type VoiceTurnOutput = z.infer<typeof VoiceTurnOutputSchema>;

/**
 * Utility to identify missing required fields based on PRD Section 8.2
 */
export function getMissingRequiredFields(draft: VoiceDraft): string[] {
    const missing: string[] = [];

    if (!draft.description || draft.description.trim().length < 5) {
        missing.push('description');
    }
    if (!draft.category) {
        missing.push('category');
    }
    if (!draft.priority) {
        missing.push('priority');
    }
    if (!draft.department) {
        missing.push('department');
    }
    if (!draft.locationText && !draft.wantsGps) {
        missing.push('location');
    }
    
    // Coordinates and ward are required for final submission
    // but the autopilot might fill them automatically from locationText or GPS
    if (!draft.lat || !draft.lng) {
        // Only track as "missing" if we aren't already planning to use GPS
        if (!draft.wantsGps) {
            missing.push('coordinates');
        }
    }

    return missing;
}

/**
 * Evaluates if the draft is ready for confirmation/submission
 */
export function isDraftReadyForConfirmation(draft: VoiceDraft): boolean {
    const missing = getMissingRequiredFields(draft);
    // If only 'coordinates' is left and they want GPS, we can proceed to resolution state
    // But for the final 'awaiting-confirmation' state, everything must be there.
    return missing.length === 0;
}
