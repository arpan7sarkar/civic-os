"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
    LayoutDashboard, 
    MapPin, 
    Filter, 
    Layers, 
    Download, 
    ChevronDown, 
    Info,
    ArrowLeft,
    Search,
    Bell,
    Plus,
    Minus,
    Navigation,
    User,
    XCircle,
    Settings,
    Loader2,
    Menu,
    X,
    Map as MapIcon,
    Sparkles,
    CheckCircle,
    Clock3,
    Target,
    LogOut as LogoutIcon
} from "lucide-react";
import Link from "next/link";
import { getAllGrievancesAction, createGrievanceAction } from "@/app/actions/grievance";
import { getServerProfileAction, updateUserProfileAction, UserProfile } from "@/app/actions/profile";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { syncGrievances, getComplaints, getStats, generateDemoData } from "@/lib/store";
import { reverseGeocodeAction } from "@/app/actions/geo";
import MapSidebar from "@/components/map/MapSidebar";
import MobileMapDrawer from "@/components/map/MobileMapDrawer";
import MapInfoCard from "@/components/map/MapInfoCard";
import { Complaint } from "@/lib/types";

// Dynamic import for Leaflet map to avoid SSR errors
const MapComponent = dynamic(() => import("@/components/MapComponent"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gov-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Initializing Spatial Map...</p>
            </div>
        </div>
    )
});

// Define a type for the raw document structure from Appwrite or similar backend
interface RawComplaintDoc {
    $id?: string;
    id?: string;
    userId: string;
    description: string;
    category: string;
    priority: string;
    department: string;
    ward: string;
    lat: number;
    lng: number;
    status?: string;
    assignedTo?: string;
    $createdAt?: string;
    createdAt?: string;
    citizenPhoto?: string;
    repairPhoto?: string;
}

export default function MapPage() {
    const router = useRouter();
    const [grievances, setGrievances] = useState<Complaint[]>([]);
    const [filteredGrievances, setFilteredGrievances] = useState<Complaint[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [activeZone, setActiveZone] = useState("All India");
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showZoneMenu, setShowZoneMenu] = useState(false);
    const [showMyProfileModal, setShowMyProfileModal] = useState(false);
    const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        email: "",
        address: ""
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    
    // Filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Streetlight', 'Garbage', 'Water Leakage', 'Road Damage', 'Encroachment', 'Other']);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Pending', 'In Progress', 'Resolved']);

    const categories = ['Streetlight', 'Garbage', 'Water Leakage', 'Road Damage', 'Encroachment', 'Other'];

    const handleLocationTrack = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation([latitude, longitude]);
                
                try {
                    const res = await reverseGeocodeAction(latitude, longitude);
                    if (res.success && res.address) {
                        setCurrentAddress(res.address);
                    }
                } catch (err) {
                    console.warn("Address lookup failed:", err);
                }
            }, (err) => console.warn("Location tracking failed:", err));
        }
    };

    useEffect(() => {
        handleLocationTrack();
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const profileRes = await getServerProfileAction();
                let finalProfile = profileRes.profile;

                if (profileRes.success && (!finalProfile || (finalProfile as any).name?.includes('Bridge'))) {
                    try {
                        const { account: browserAccount, tablesDB: browserTables, DATABASE_ID, PROFILES_COLLECTION_ID } = await import('@/lib/appwrite');
                        const { Query } = await import('appwrite');
                        const browserUser = await browserAccount.get();
                        const dbResult = await browserTables.listRows({
                            databaseId: DATABASE_ID,
                            tableId: PROFILES_COLLECTION_ID,
                            queries: [Query.equal('userId', browserUser.$id)]
                        });
                        if (dbResult.rows.length > 0) {
                            finalProfile = JSON.parse(JSON.stringify(dbResult.rows[0]));
                        }
                    } catch (e) { console.warn("Map Profile Recovery failed"); }
                }

                if (finalProfile) {
                    setUserProfile(finalProfile as UserProfile);
                    const cachedData = getComplaints();
                    const normalized = cachedData.map(g => {
                        let category = g.category;
                        if ((category as any) === 'Garbage Collection') category = 'Garbage' as any;
                        if ((category as any) === 'Street Light') category = 'Streetlight' as any;
                        if ((category as any) === 'Road Repair') category = 'Road Damage' as any;
                        return { ...g, category } as Complaint;
                    });
                    if (normalized.length > 0) {
                        setGrievances(normalized);
                        setFilteredGrievances(normalized);
                        setIsLoading(false);
                    }
                } else {
                    router.push('/auth');
                    return;
                }

                const fetchAndSync = async () => {
                    try {
                        const localComplaints = getComplaints((finalProfile as UserProfile).userId);
                        const rawData = localComplaints.map(g => {
                            let category = g.category;
                            if ((category as any) === 'Garbage Collection') category = 'Garbage' as any;
                            if ((category as any) === 'Street Light') category = 'Streetlight' as any;
                            if ((category as any) === 'Road Repair') category = 'Road Damage' as any;
                            return { ...g, category } as Complaint;
                        });
                        setGrievances(rawData);
                        setFilteredGrievances(rawData);
                        setIsLoading(false);

                        const grievancesRes = await getAllGrievancesAction();
                        let cloudGrievances: Complaint[] = [];
                        if (grievancesRes.success && grievancesRes.grievances) {
                            cloudGrievances = (grievancesRes.grievances as any[]).map((doc: any) => ({
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
                                repairPhoto: doc.repairPhoto
                            } as Complaint));
                            syncGrievances(cloudGrievances, (finalProfile as UserProfile).userId);
                        }

                        // SYNC: Push local-only grievances to cloud
                        const unsynced = localComplaints.filter(lc => 
                            lc.userId !== 'demo-user' && 
                            !cloudGrievances.find(cg => cg.id === lc.id)
                        );

                        if (unsynced.length > 0) {
                            console.log(`[MAP_SYNC] Found ${unsynced.length} unsynced. Pushing...`);
                            Promise.all(unsynced.map(async (g) => {
                                try {
                                    await createGrievanceAction(g);
                                } catch (err) { console.error("Sync failed for", g.id, err); }
                            })).then(async () => {
                                const refreshRes = await getAllGrievancesAction();
                                if (refreshRes.success && refreshRes.grievances) {
                                    syncGrievances(refreshRes.grievances, (finalProfile as UserProfile).userId);
                                    const rawData = getComplaints().map(g => {
                                        let category = g.category;
                                        if ((category as any) === 'Garbage Collection') category = 'Garbage' as any;
                                        if ((category as any) === 'Street Light') category = 'Streetlight' as any;
                                        if ((category as any) === 'Road Repair') category = 'Road Damage' as any;
                                        return { ...g, category } as Complaint;
                                    });
                                    setGrievances(rawData);
                                }
                            });
                        }

                        if (rawData.length === 0 && !grievancesRes.success) {
                            generateDemoData();
                            const demoData = getComplaints() as unknown as Complaint[];
                            setGrievances(demoData);
                        }
                    } catch (e) { console.warn("Global Background Sync failed:", e); }
                    finally { setIsLoading(false); }
                };
                
                fetchAndSync();
            } catch (err) {
                console.error("Map Init Error:", err);
                setIsLoading(false);
            }
        };
        init();
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) return;
        setIsUpdatingProfile(true);
        try {
            const res = await updateUserProfileAction({
                userId: userProfile.userId,
                email: profileFormData.email,
                address: profileFormData.address
            });
            if (res.success && res.profile) {
                setUserProfile(res.profile);
                setShowUpdateProfileModal(false);
            }
        } catch (err) { console.error(err); } finally { setIsUpdatingProfile(false); }
    };

    const handleLogout = async () => {
        try {
            await logoutAction();
            router.push('/');
        } catch (error) { console.error('Logout failed'); }
    };

    useEffect(() => {
        const filtered = grievances.filter(g => {
            const matchesSearch = g.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 g.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(g.category);
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(g.status);
            return matchesSearch && matchesCategory && matchesStatus;
        });
        setFilteredGrievances(filtered);
    }, [searchTerm, selectedCategories, selectedStatuses, grievances]);

    const handleMyLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    };

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const toggleStatus = (stat: string) => {
        setSelectedStatuses(prev => 
            prev.includes(stat) ? prev.filter(c => c !== stat) : [...prev, stat]
        );
    };

    const handleTrackTicket = (ticketId: string) => {
        router.push(`/dashboard?ticketId=${ticketId}`);
    };

    const handleExportData = () => {
        if (filteredGrievances.length === 0) return;
        const headers = ["Ticket ID", "Category", "Status", "Ward", "Description", "Latitude", "Longitude", "Created At"];
        const rows = filteredGrievances.map(g => [
            g.id,
            g.category,
            g.status,
            g.ward,
            `"${g.description.replace(/"/g, '""')}"`,
            g.lat,
            g.lng,
            g.createdAt
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `civicos_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading && !userProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-gov-blue animate-spin" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Spatial Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {/* Header - Premium Unified Design */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 md:px-6 py-3 z-30 sticky top-0">
                {/* Desktop Left / Mobile Menu */}
                <div className="flex items-center gap-4 md:gap-8 flex-1 lg:flex-initial">
                    <button 
                        onClick={() => setShowMobileFilters(true)}
                        className="p-2 hover:bg-slate-100 rounded-xl text-gov-blue lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <Link href="/dashboard" className="hidden lg:flex items-center gap-3 group">
                        <div className="bg-gov-blue p-1.5 rounded-lg text-white group-hover:bg-blue-800 transition-colors">
                            <MapIcon className="w-5 h-5 shadow-lg" />
                        </div>
                        <div>
                            <h1 className="text-gov-blue text-sm md:text-lg font-black leading-tight tracking-tight">CivicOS Map</h1>
                            <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">Spatial Intelligence Engine</p>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6 ml-4">
                        <Link href="/dashboard" className="text-slate-600 text-sm font-bold hover:text-gov-blue transition-all border-b-2 border-transparent hover:border-gov-blue/20 pb-0.5">Dashboard</Link>
                        <span className="text-gov-blue text-sm font-black border-b-2 border-gov-blue pb-0.5">Spatial Map</span>
                        <Link href="/report" className="text-slate-600 text-sm font-bold hover:text-gov-blue transition-all border-b-2 border-transparent hover:border-gov-blue/20 pb-0.5">File Report</Link>
                    </nav>
                </div>

                {/* Mobile Centered Title */}
                <div className="flex-1 flex flex-col items-center justify-center lg:hidden">
                    <span className="text-[9px] font-black text-gov-blue/40 uppercase tracking-[0.2em] mb-0.5">CivicOS Spatial</span>
                    <button className="flex items-center gap-1.5 group">
                        <span className="text-sm font-black text-slate-800 tracking-tight">NATIONAL VIEW</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gov-blue group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
                
                {/* Right Side Actions */}
                <div className="flex items-center gap-2 md:gap-4 flex-1 lg:flex-initial justify-end">
                    <div className="relative hidden lg:block group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-gov-blue transition-colors" />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-2 bg-slate-100/80 border border-slate-200/50 rounded-2xl text-sm w-64 focus:ring-4 focus:ring-gov-blue/5 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-400" 
                            placeholder="Find ward or issue..." 
                            type="text"
                        />
                    </div>
                    
                    <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 lg:hidden transition-colors">
                        <Search className="w-5 h-5" />
                    </button>

                    <div className="relative flex items-center gap-2 lg:pl-4 lg:border-l lg:border-slate-200">
                        <div className="text-right hidden sm:block mr-1">
                            <p className="text-[11px] font-black text-slate-800 leading-none">{userProfile?.name || "Citizen"}</p>
                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">Resident ID • Active</p>
                        </div>
                        <div 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-10 h-10 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white cursor-pointer hover:ring-gov-blue/40 transition-all active:scale-95 relative"
                        >
                            {userProfile?.profileImageUrl ? (
                                <Image 
                                    src={userProfile.profileImageUrl} 
                                    alt="User Avatar" 
                                    fill
                                    className="object-cover" 
                                    sizes="40px"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">{userProfile?.name?.charAt(0) || 'U'}</div>
                            )}
                        </div>
                        {showProfileMenu && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-[200] animate-in fade-in slide-in-from-top-2">
                                <button className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                    <User className="w-4 h-4 text-gov-blue" /> My Profile
                                </button>
                                <button className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                    <Bell className="w-4 h-4 text-gov-blue" /> Notifications
                                </button>
                                <div className="h-px bg-slate-50 my-2" />
                                <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3">
                                    <LogoutIcon className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                <MapSidebar 
                    categories={categories}
                    selectedCategories={selectedCategories}
                    toggleCategoryAction={toggleCategory}
                    selectedStatuses={selectedStatuses}
                    toggleStatusAction={toggleStatus}
                    onResetAction={() => { setSelectedCategories(categories); setSelectedStatuses(['Pending', 'In Progress', 'Resolved']); }}
                    onExportAction={handleExportData}
                    filteredCount={filteredGrievances.length}
                />

                {/* Mobile Drawer */}
                <MobileMapDrawer 
                    isOpen={showMobileFilters}
                    onCloseAction={() => setShowMobileFilters(false)}
                    categories={categories}
                    selectedCategories={selectedCategories}
                    toggleCategoryAction={toggleCategory}
                    selectedStatuses={selectedStatuses}
                    toggleStatusAction={toggleStatus}
                    onResetAction={() => { setSelectedCategories(categories); setSelectedStatuses(['Pending', 'In Progress', 'Resolved']); }}
                />

                {/* Map Area */}
                <main className="flex-1 relative bg-slate-50 overflow-hidden">
                    <MapComponent 
                        grievances={filteredGrievances} 
                        userLocation={userLocation} 
                        onTrackTicketAction={handleTrackTicket}
                        onSelectComplaint={(c) => setSelectedComplaint(c)}
                    />

                    {/* Detail Card Overlay */}
                    {selectedComplaint && (
                        <MapInfoCard 
                            complaint={selectedComplaint}
                            onCloseAction={() => setSelectedComplaint(null)}
                            onTrackAction={handleTrackTicket}
                        />
                    )}

                    {/* Floating Map Controls - Refined Placement */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                        <button 
                            onClick={handleMyLocation}
                            className="w-12 h-12 bg-gov-blue text-white rounded-2xl shadow-2xl shadow-blue-200 flex items-center justify-center hover:bg-blue-800 transition-all active:scale-95 group ring-4 ring-white"
                            title="My Location"
                        >
                            <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-1 flex flex-col items-center">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                            <div className="w-6 h-px bg-slate-100" />
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                                <Minus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            
            <style jsx global>{`
                .leaflet-container {
                    background: #f8fafc !important;
                }
                .premium-popup .leaflet-popup-content-wrapper {
                    border-radius: 28px !important;
                    padding: 0 !important;
                    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4) !important;
                    border: 1px solid rgba(255,255,255,0.6);
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                }
                .premium-popup .leaflet-popup-content {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .premium-popup .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow: none !important;
                    border: 1px solid rgba(255,255,255,0.6);
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

// Simple LogOut icon replacement since it was missing in original imports but I used it
function LogOut(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
