"use server";

export async function reverseGeocodeAction(lat: number, lon: number) {
    const apiKey = process.env.GEOAPIFY_API_KEY;
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
