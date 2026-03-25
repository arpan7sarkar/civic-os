import { z } from "zod";
import validator from "validator";

/**
 * Basic string sanitization to prevent XSS.
 * Escapes HTML characters.
 */
export function sanitizeString(str: string): string {
    if (!str) return "";
    // Trim and escape HTML to prevent XSS
    return validator.escape(str.trim());
}

/**
 * Zod schemas for structured data validation.
 */
export const Schemas = {
    // Authentication
    auth: {
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$|^[6-9]\d{9}$/, "Invalid phone number format"),
        otp: z.string().length(6, "OTP must be exactly 6 digits"),
        userId: z.string().min(1, "User ID is required"),
    },
    
    // Grievance / Report
    grievance: {
        create: z.object({
            category: z.string().min(2, "Category too short").max(50),
            description: z.string().min(10, "Description must be at least 10 characters").max(2000),
            ward: z.string().max(100).optional(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            address: z.string().max(500).optional(),
        }),
    },

    // User Profile
    profile: {
        update: z.object({
            name: z.string().min(2, "Name too short").max(100),
            email: z.string().email("Invalid email address").optional().or(z.literal("")),
            address: z.string().max(500).optional(),
            govIdNumber: z.string().regex(/^\d{12}$/, "ID Number must be exactly 12 digits"),
        }),
    }
};

/**
 * Wraps AI data in delimiters to prevent Prompt Injection.
 */
export function shieldPrompt(userInput: string): string {
    const cleanInput = sanitizeString(userInput);
    return `<START_USER_DATA>\n${cleanInput}\n<END_USER_DATA>`;
}
