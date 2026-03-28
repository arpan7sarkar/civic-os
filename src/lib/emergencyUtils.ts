// src/lib/emergencyUtils.ts

export interface Service {
    id: string;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    coords: [number, number];
    name: string;
}

// Fallback logic in case Overpass fails or is blocked by CORS
const generateMockServices = (lat: number, lng: number): Service[] => {
    // Generate realistic nearby coordinates (approx 1-3km away)
    const randomOffset = () => (Math.random() - 0.5) * 0.04; 
    
    return [
        {
            id: "Hospital",
            label: "Nearest Hospital",
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-100",
            coords: [lat + randomOffset(), lng + randomOffset()] as [number, number],
            name: "City General Hospital"
        },
        {
            id: "Police",
            label: "Police Station",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-100",
            coords: [lat + randomOffset(), lng + randomOffset()] as [number, number],
            name: "Central Police Precinct"
        },
        {
            id: "Fire",
            label: "Fire Station",
            color: "text-orange-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-100",
            coords: [lat + randomOffset(), lng + randomOffset()] as [number, number],
            name: "District Fire Station 4"
        }
    ];
};

export const fetchNearestServices = async (lat: number, lng: number): Promise<Service[]> => {
    // Overpass API removed as per user request.
    // Returning high-quality proximity-based mock data.
    return generateMockServices(lat, lng);
};

export const fetchRouteOSRM = async (start: [number, number], end: [number, number]) => {
    try {
        // OSRM expects: {longitude},{latitude}
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("OSRM routing failed");
        
        const data = await response.json();
        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
            throw new Error("No route found");
        }

        const route = data.routes[0];
        // Coordinates from GeoJSON are [lng, lat], Leaflet wants [lat, lng]
        const geometry = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        
        return {
            geometry,
            distance: (route.distance / 1000).toFixed(1), // in km
            duration: Math.ceil(route.duration / 60) // in minutes
        };

    } catch (error) {
        console.warn("OSRM routing failed, falling back to straight line.", error);
        return {
            geometry: [start, end] as [number, number][],
            distance: calculateDistance(start[0], start[1], end[0], end[1]).toFixed(1),
            duration: "N/A"
        };
    }
};

export const generateDynamicIncidents = (lat: number, lng: number, locationName: string) => {
    const regionPrefix = locationName && locationName !== "Detecting..." ? locationName.split(',')[0] : "Local";
    return [
        {
            type: "Road Closure",
            title: `Road Closure: ${regionPrefix} Transit Line`,
            distance: (Math.random() * 2 + 0.1).toFixed(1) + "km",
            time: Math.floor(Math.random() * 15 + 1) + " mins ago",
            icon: "map-pin",
            color: "red"
        },
        {
            type: "Fire Report",
            title: `${regionPrefix} Sector Alert: Fire Report`,
            distance: (Math.random() * 3 + 1).toFixed(1) + "km",
            time: Math.floor(Math.random() * 30 + 5) + " mins ago",
            icon: "alert",
            color: "orange"
        }
    ];
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
};
