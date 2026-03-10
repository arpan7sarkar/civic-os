import { Complaint, ComplaintCategory, Priority } from "./types";

const STORAGE_KEY = 'civicos_complaints';

const DELHI_WARDS = [
    { name: 'Ward 12 (Model Town)', lat: 28.7033, lng: 77.1934 },
    { name: 'Ward 05 (Civil Lines)', lat: 28.6757, lng: 77.2245 },
    { name: 'Ward 21 (Anand Parbat)', lat: 28.6657, lng: 77.1745 },
    { name: 'Ward 18 (West Patel Nagar)', lat: 28.6557, lng: 77.1645 },
    { name: 'Ward 15 (Dev Nagar)', lat: 28.6557, lng: 77.1845 },
    { name: 'Ward 64 (Greater Kailash)', lat: 28.5482, lng: 77.2344 },
    { name: 'Ward 104 (Lajpat Nagar)', lat: 28.5677, lng: 77.2433 },
    { name: 'Ward 88 (Rohini)', lat: 28.7041, lng: 77.1025 },
    { name: 'Ward 120 (Dwarka)', lat: 28.5823, lng: 77.0500 },
    { name: 'Ward 42 (Karol Bagh)', lat: 28.6514, lng: 77.1907 },
];

// Define InfrastructureAlert type for the new function
interface InfrastructureAlert {
    id: string;
    ward: string;
    count: number;
    type: string;
    message: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export function getComplaints(): Complaint[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Helper for spatial distance check (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

export function saveComplaint(complaint: Complaint) {
    const complaints = getComplaints();
    complaints.unshift(complaint);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function updateComplaint(id: string, updates: Partial<Complaint>) {
    const complaints = getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
        complaints[index] = { ...complaints[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    }
}

// Infrastructure Alert Logic
export function checkInfrastructureAlerts() {
    const complaints = getComplaints();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recent = complaints.filter(c => new Date(c.createdAt) >= twoHoursAgo);

    for (let i = 0; i < recent.length; i++) {
        const c1 = recent[i];

        // Group by ward AND distance (500m radius)
        const nearby = recent.filter(c2 =>
            c2.ward === c1.ward || calculateDistance(c1.lat, c1.lng, c2.lat, c2.lng) <= 500
        );

        if (nearby.length >= 3) {
            return {
                active: true,
                message: `Anomalous cluster detected in ${c1.ward}`,
                ward: c1.ward,
                count: nearby.length
            };
        }
    }

    return { active: false };
}

export function generateDemoData(): Complaint[] {
    const wards = ["Karol Bagh", "Lajpat Nagar", "Rohini", "Dwarka", "Greater Kailash"];
    const coords: Record<string, [number, number]> = {
        "Karol Bagh": [28.6550, 77.1888],
        "Lajpat Nagar": [28.5677, 77.2433],
        "Rohini": [28.7041, 77.1025],
        "Dwarka": [28.5823, 77.0500],
        "Greater Kailash": [28.5482, 77.2347]
    };

    let demoComplaints: Complaint[] = [];
    if (typeof window !== 'undefined') {
        demoComplaints = Array.from({ length: 10 }).map((_, i) => {
            const ward = wards[Math.floor(Math.random() * wards.length)];
            const baseCoord = coords[ward];
            const lat = baseCoord[0] + (Math.random() - 0.5) * 0.01;
            const lng = baseCoord[1] + (Math.random() - 0.5) * 0.01;

            return {
                id: `GRV-${1000 + i}`,
                description: `Mock complaint for ${ward} regarding civic amenities.`,
                category: ["Streetlight", "Garbage", "Road Damage"][Math.floor(Math.random() * 3)] as ComplaintCategory,
                priority: ["High", "Medium", "Low", "Critical"][Math.floor(Math.random() * 4)] as Priority,
                department: "PWD",
                lat,
                lng,
                status: "Pending",
                assignedTo: "", // Provide missing required field
                createdAt: new Date().toISOString(),
                ward
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoComplaints));
    }
    return demoComplaints;
}

export function getStats() {
    const complaints = getComplaints();
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    return {
        pendingGrievances: pending,
        avgTurnaround: "4.2 hrs",
        citizenSatisfaction: resolved > 0 ? "88%" : "N/A"
    };
}
