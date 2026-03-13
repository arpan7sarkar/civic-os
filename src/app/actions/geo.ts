"use server";

export async function reverseGeocodeAction(lat: number, lon: number) {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
        console.error("GEOAPIFY_API_KEY is not set");
        return { success: false, error: "API_KEY_MISSING" };
    }

    try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Geoapify error: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const address = data.features[0].properties.formatted;
            return { success: true, address };
        }

        return { success: false, error: "NO_ADDRESS_FOUND" };
    } catch (error) {
        console.error("Reverse Geocoding Error:", error);
        return { success: false, error: "FETCH_FAILED" };
    }
}
