export type ComplaintCategory =
    | 'Streetlight'
    | 'Garbage'
    | 'Water Leakage'
    | 'Road Damage'
    | 'Encroachment'
    | 'Illegal Parking';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
    id: string;
    description: string;
    category: ComplaintCategory;
    priority: Priority;
    department: string;
    lat: number;
    lng: number;
    status: ComplaintStatus;
    assignedTo: string;
    createdAt: string;
    ward: string;
    citizenPhoto?: string;
    repairPhoto?: string;
}

export interface AnalysisResult {
    category: ComplaintCategory;
    priority: Priority;
    department: string;
}
