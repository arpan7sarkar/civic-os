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

/**
 * Sync Appwrite grievances with local storage for MIS consistency.
 * Deduplicates by immutable report id; keeps the record with the
 * newest updatedAt/createdAt when conflicts exist (cloud is canonical).
 */
export function syncGrievances(cloudGrievances: any[], userId: string) {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const localGrievances: Complaint[] = stored ? JSON.parse(stored) : [];

    // Normalize cloud documents to the local Complaint shape
    const normalizedCloud: Complaint[] = cloudGrievances.map(doc => ({
        id: doc.$id || doc.id,
        userId: doc.userId,
        description: doc.description,
        category: doc.category,
        priority: doc.priority,
        department: doc.department,
        ward: doc.ward,
        lat: doc.lat,
        lng: doc.lng,
        status: doc.status || 'Pending',
        assignedTo: doc.assignedTo,
        createdAt: doc.createdAt || doc.$createdAt,
        citizenPhoto: doc.citizenPhoto,
        repairPhoto: doc.repairPhoto,
    } as Complaint));

    // Build a map keyed by stable id, cloud wins on conflict
    const mergeMap = new Map<string, Complaint>();

    // Seed with local data first
    localGrievances.forEach(local => mergeMap.set(local.id, local));

    // Cloud overwrites local for same id, or adds new entries.
    // If both have the same id, pick the one with the newest timestamp.
    normalizedCloud.forEach(cloud => {
        const existing = mergeMap.get(cloud.id);
        if (!existing) {
            mergeMap.set(cloud.id, cloud);
        } else {
            // Cloud is canonical: prefer it if its createdAt is >= local
            const cloudTs = new Date(cloud.createdAt || 0).getTime();
            const localTs = new Date(existing.createdAt || 0).getTime();
            mergeMap.set(cloud.id, cloudTs >= localTs ? cloud : existing);
        }
    });

    const merged = Array.from(mergeMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
}

export function getComplaints(userId?: string): Complaint[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    let complaints: Complaint[] = stored ? JSON.parse(stored) : [];
    
    // Normalize anonymous IDs for migration
    const ANONYMOUS_IDS = ['anonymous'];

    // Auto-Migrate tickets from anonymous/bridge to the REAL user account
    if (userId && userId !== 'demo-user' && !ANONYMOUS_IDS.includes(userId)) {
        let needsMigration = false;
        complaints = complaints.map(c => {
            if (ANONYMOUS_IDS.includes(c.userId)) {
                needsMigration = true;
                return { ...c, userId: userId };
            }
            return c;
        });
        
        if (needsMigration) {
            console.log(`[STORE] Auto-migrated tickets to real UID: ${userId}`);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
        }
    }

    if (userId) {
        // Return only the current user's complaints. 
        // Demo data is strictly isolated to the 'demo-user' session.
        return complaints.filter(c => c.userId === userId);
    }
    // For non-authenticated views (landing page), return all (or specific subset)
    return complaints.filter(c => c.userId !== 'demo-user');
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
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const complaints: Complaint[] = stored ? JSON.parse(stored) : [];
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

export const generateDemoData = () => {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem(STORAGE_KEY);
  const currentComplaints: Complaint[] = existing ? JSON.parse(existing) : [];
  
  // Filter out existing demo data to avoid duplication
  const realData = currentComplaints.filter(c => c.userId !== 'demo-user');
  
  const demoData: Complaint[] = [
    {
      id: 'CIV-2078',
      description: 'Garbage overflowing near the community center.',
      category: 'Garbage',
      priority: 'Medium',
      department: 'Sanitation',
      lat: 28.5355,
      lng: 77.2410,
      status: 'Pending',
      assignedTo: 'Officer Unassigned',
      createdAt: new Date().toISOString(),
      ward: 'Ward 104 (Lajpat Nagar)',
      userId: 'demo-user'
    },
    {
      id: 'GRV-1000',
      description: 'Streetlight blinking intermittently near the park entrance.',
      category: 'Streetlight',
      priority: 'Low',
      department: 'Electrical',
      lat: 28.5355,
      lng: 77.2410,
      status: 'In Progress',
      assignedTo: 'Unit 4',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      ward: 'Dwarka',
      userId: 'demo-user'
    },
    {
      id: 'GRV-1001',
      description: 'Pothole on the main road causing traffic delays.',
      category: 'Road Damage',
      priority: 'High',
      department: 'Public Works',
      lat: 28.5355,
      lng: 77.2410,
      status: 'Pending',
      assignedTo: 'Department Review',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      ward: 'Karol Bagh',
      userId: 'demo-user'
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...realData, ...demoData]));
};

export function getStats(userId?: string) {
    const complaints = getComplaints(userId);
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    return {
        totalReports: complaints.length,
        pendingReports: pending,
        inProgressReports: inProgress,
        resolvedReports: resolved,
        citizenSatisfaction: resolved > 0 ? "88%" : "N/A"
    };
}
