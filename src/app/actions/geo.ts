"use server";

import { env } from "@/lib/env";

export async function reverseGeocodeAction(lat: number, lon: number) {
    const apiKey = env.GEOAPIFY_API_KEY;
    if (!apiKey) {
        console.error("GEOAPIFY_API_KEY is not set");
        return { success: false, error: "API_KEY_MISSING" };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Geoapify error: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const address = data.features[0].properties.formatted;
            return JSON.parse(JSON.stringify({ success: true, address }));
        }

        return JSON.parse(JSON.stringify({ success: false, error: "NO_ADDRESS_FOUND" }));
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error("Geoapify Request Timed Out");
            return JSON.parse(JSON.stringify({ success: false, error: "TIMEOUT" }));
        }
        console.error("Reverse Geocoding Error:", error?.message || error);
        return JSON.parse(JSON.stringify({ success: false, error: "FETCH_FAILED" }));
    }
}

export async function getAutocompleteSuggestionsAction(text: string) {
    const apiKey = env.GEOAPIFY_API_KEY;
    if (!apiKey) {
        console.error("GEOAPIFY_API_KEY is not set");
        return { success: false, error: "API_KEY_MISSING" };
    }

    if (!text || text.length < 3) {
        return { success: true, suggestions: [] };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Limit to India (countrycode=in) and 5 results
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${apiKey}&filter=countrycode:in&limit=5`;
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Geoapify error: ${response.statusText}`);
        }

        const data = await response.json();
        const suggestions = (data.features || []).map((f: any) => ({
            formatted: f.properties.formatted,
            lat: f.properties.lat,
            lon: f.properties.lon,
            address: f.properties.address_line1,
            city: f.properties.city,
            state: f.properties.state,
            country: f.properties.country,
        }));

        return JSON.parse(JSON.stringify({ success: true, suggestions }));
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, error: "TIMEOUT" };
        }
        console.error("Autocomplete Error:", error?.message || error);
        return { success: false, error: "FETCH_FAILED" };
    }
}
