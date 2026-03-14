"use client";

import { useEffect, useState } from "react";
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
    X
} from "lucide-react";
import Link from "next/link";
import { getAllGrievancesAction } from "@/app/actions/grievance";
import { getServerProfileAction, updateUserProfileAction, UserProfile } from "@/app/actions/profile";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { syncGrievances, getComplaints, getStats, generateDemoData } from "@/lib/store";
import { reverseGeocodeAction } from "@/app/actions/geo";

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

export default function MapPage() {
    const router = useRouter();
    const [grievances, setGrievances] = useState<any[]>([]);
    const [filteredGrievances, setFilteredGrievances] = useState<any[]>([]);
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
    
    // Filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Streetlight', 'Garbage', 'Water Leakage', 'Road Damage', 'Encroachment', 'Other']);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Pending', 'In Progress', 'Resolved']);

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

                // Client-side recovery fallback
                if (profileRes.success && (!finalProfile || finalProfile.name.includes('Bridge'))) {
                    try {
                        const { account: browserAccount, databases: browserDatabases, DATABASE_ID, PROFILES_COLLECTION_ID } = await import('@/lib/appwrite');
                        const { Query } = await import('appwrite');
                        const browserUser = await browserAccount.get();
                        const dbResult = await browserDatabases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('userId', browserUser.$id)]);
                        if (dbResult.documents.length > 0) {
                            finalProfile = JSON.parse(JSON.stringify(dbResult.documents[0]));
                        }
                    } catch (e) { console.warn("Map Profile Recovery failed"); }
                }

                if (finalProfile) {
                    setUserProfile(finalProfile as UserProfile);
                    // Tier 1: Load Global Local Data Instantly
                    const cachedData = getComplaints();
                    const normalized = cachedData.map(g => {
                        let category = g.category;
                        if ((category as any) === 'Garbage Collection') category = 'Garbage' as any;
                        if ((category as any) === 'Street Light') category = 'Streetlight' as any;
                        if ((category as any) === 'Road Repair') category = 'Road Damage' as any;
                        return { ...g, category };
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

                // Tier 2: Background Sync (Parallel)
                const fetchAndSync = async () => {
                    try {
                        const grievancesRes = await getAllGrievancesAction();
                        if (grievancesRes.success && grievancesRes.grievances) {
                            syncGrievances(grievancesRes.grievances, (finalProfile as UserProfile).userId);
                            
                            // Normalize data after sync to fix mismatches
                            const rawData = getComplaints();
                            const normalized = rawData.map(g => {
                                let category = g.category;
                                if ((category as any) === 'Garbage Collection') category = 'Garbage' as any;
                                if ((category as any) === 'Street Light') category = 'Streetlight' as any;
                                if ((category as any) === 'Road Repair') category = 'Road Damage' as any;
                                return { ...g, category };
                            });
                            setGrievances(normalized);
                        } else if (getComplaints().length === 0) {
                            generateDemoData();
                            setGrievances(getComplaints());
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
        // Logically redirect to dashboard with search context or deep link
        router.push(`/dashboard?ticketId=${ticketId}`);
    };

    const handleExportData = () => {
        if (filteredGrievances.length === 0) return;
        
        // Logical CSV export of current filtered view
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


    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {/* Header - Stitch Design */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 py-3 z-30">
                <div className="flex items-center gap-4 md:gap-8">
                    <button 
                        onClick={() => setShowMobileFilters(true)}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group">
                        <div className="bg-gov-blue p-1.5 rounded-lg text-white group-hover:bg-blue-800 transition-colors">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div className="hidden xs:block">
                            <h1 className="text-gov-blue text-sm md:text-lg font-bold leading-tight tracking-tight">CivicOS</h1>
                            <p className="text-[8px] md:text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Delhi Municipal Corporation</p>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link href="/dashboard" className="text-slate-600 text-sm font-bold hover:text-gov-blue transition-colors">Dashboard</Link>
                        <span className="text-gov-blue text-sm font-bold border-b-2 border-gov-blue pb-1">Spatial Map</span>
                        <Link href="/report" className="text-slate-600 text-sm font-bold hover:text-gov-blue transition-colors">File Report</Link>
                    </nav>
                </div>
                
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-gov-blue font-bold text-slate-600 placeholder:text-slate-400" 
                                placeholder="Find ward or issue..." 
                                type="text"
                            />
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                            </button>

                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Notifications</p>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <p className="text-xs font-bold text-slate-800">Garbage Collection Alert</p>
                                            <p className="text-[10px] text-slate-500 mt-1">Your area (Ward 88) has a scheduled cleanup at 10:00 AM tomorrow.</p>
                                        </div>
                                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <p className="text-xs font-bold text-slate-800">Status Update: #CIV-878564</p>
                                            <p className="text-[10px] text-slate-500 mt-1">Your complaint has been assigned to a Field Officer.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="relative group">
                            <div 
                                onClick={() => setShowZoneMenu(!showZoneMenu)}
                                className="flex items-center gap-2 text-slate-500 hover:text-gov-blue cursor-pointer transition-colors px-3 py-2 rounded-xl border border-transparent hover:border-slate-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest whitespace-nowrap">{activeZone}</span>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showZoneMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                    {currentAddress && <span className="text-[8px] font-bold text-slate-400 truncate max-w-[80px] sm:max-w-[100px]">{currentAddress}</span>}
                                </div>
                            </div>
                            
                            {showZoneMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    {["All India", "North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"].map((zone) => (
                                        <button
                                            key={zone}
                                            onClick={() => {
                                                setActiveZone(zone);
                                                setShowZoneMenu(false);
                                                handleLocationTrack();
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-gov-blue transition-colors"
                                        >
                                            {zone}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-800 leading-none">{userProfile?.name || "Citizen"}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">Resident • {activeZone}</p>
                            </div>
                            <div className="relative">
                                <div 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="w-10 h-10 rounded-xl overflow-hidden shadow-md cursor-pointer hover:ring-4 hover:ring-gov-blue/10 transition-all active:scale-95"
                                >
                                    {userProfile?.profileImageUrl ? (
                                        <img src={userProfile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                {showProfileMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <button 
                                            onClick={() => { setShowMyProfileModal(true); setShowProfileMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                        >
                                            <User className="w-3 h-3" /> My Profile
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setProfileFormData({ email: userProfile?.email || "", address: userProfile?.address || "" });
                                                setShowUpdateProfileModal(true);
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                        >
                                            <Settings className="w-3 h-3" /> Update Profile
                                        </button>
                                        <div className="h-px bg-slate-50 my-1" />
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <XCircle className="w-3 h-3" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Filter Overlay */}
                {showMobileFilters && (
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
                        onClick={() => setShowMobileFilters(false)}
                    />
                )}

                {/* Sidebar - Stitch Design */}
                <aside className={`w-80 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none overflow-y-auto`}>
                    <div className="p-6 flex items-center justify-between border-b border-slate-50 lg:hidden">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gov-blue" />
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">MAP FILTERS</h2>
                        </div>
                        <button 
                            onClick={() => setShowMobileFilters(false)}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black flex items-center gap-2 text-slate-800">
                                    <Filter className="w-5 h-5 text-gov-blue" />
                                    MAP FILTERS
                                </h2>
                                <button 
                                    onClick={() => { setSelectedCategories([]); setSelectedStatuses([]); }}
                                    className="text-[10px] text-gov-blue font-black uppercase tracking-widest hover:underline"
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Categories</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Streetlight', 'Garbage', 'Water Leakage', 'Road Damage', 'Encroachment', 'Other'].map(cat => (
                                            <label key={cat} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                    className="rounded-lg border-slate-300 text-gov-blue focus:ring-gov-blue h-5 w-5 transition-transform group-active:scale-90"
                                                />
                                                <span className="text-sm font-bold text-slate-600">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'Pending', color: 'bg-red-500' },
                                            { id: 'In Progress', color: 'bg-amber-500' },
                                            { id: 'Resolved', color: 'bg-emerald-500' }
                                        ].map(status => (
                                            <label key={status.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedStatuses.includes(status.id)}
                                                    onChange={() => toggleStatus(status.id)}
                                                    className="rounded-lg border-slate-300 text-gov-blue focus:ring-gov-blue h-5 w-5"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                                    <span className="text-sm font-bold text-slate-600">{status.id}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <Info className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                Showing {filteredGrievances.length} active civic reports.
                            </p>
                        </div>
                        <button 
                            onClick={handleExportData}
                            className="w-full py-3 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                </aside>

                {/* Map Area */}
                <main className="flex-1 relative bg-slate-100 overflow-hidden">
                    <MapComponent 
                        grievances={filteredGrievances} 
                        userLocation={userLocation} 
                        onTrackTicket={handleTrackTicket}
                    />

                    {/* Map Controls - Relocated to Bottom Right */}
                    <div className="absolute bottom-6 right-6 md:bottom-28 md:right-8 flex flex-col gap-3 z-[1000]">
                        <button 
                            onClick={handleMyLocation}
                            className="p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 hover:bg-slate-50 text-gov-blue transition-all active:scale-95 group flex items-center justify-center"
                        >
                            <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                        <div className="flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                            <button className="p-4 hover:bg-slate-50 border-b border-slate-100 text-slate-600 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                            <button className="p-4 hover:bg-slate-50 text-slate-600 transition-colors">
                                <Minus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Coordinates Indicator - Relocated for visual balance */}
                    <div className="absolute bottom-6 left-6 z-20">
                        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                             <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {userLocation ? `${userLocation[0].toFixed(3)}° N, ${userLocation[1].toFixed(3)}° E` : 'LOCATING...'}
                             </p>
                        </div>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute top-6 right-6 z-20 hidden lg:block">
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white w-52 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gov-blue"></div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Status Legend</h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'Pending', desc: 'Awaiting Action', color: 'text-red-500' },
                                    { label: 'In Progress', desc: 'Work Underway', color: 'text-amber-500' },
                                    { label: 'Resolved', desc: 'Issue Fixed', color: 'text-emerald-500' }
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <MapPin className={`w-5 h-5 ${item.color} fill-current`} />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700">{item.label}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Coordinates Overlay */}
                    <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20">
                        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-2xl border border-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">
                                {userLocation 
                                    ? `${userLocation[0].toFixed(3)}° N, ${userLocation[1].toFixed(3)}° E` 
                                    : 'Delhi Live'}
                            </span>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Modals */}
            {showMyProfileModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-gov-blue/10 rounded-2xl flex items-center justify-center text-gov-blue"><User className="w-8 h-8" /></div>
                            <button onClick={() => setShowMyProfileModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-8">My Profile</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Name</p><p className="text-sm font-bold">{userProfile?.name}</p></div>
                            <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Email</p><p className="text-sm font-bold">{userProfile?.email || "N/A"}</p></div>
                            <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Address</p><p className="text-sm font-bold">{userProfile?.address || "N/A"}</p></div>
                        </div>
                        <button onClick={() => { setShowMyProfileModal(false); setProfileFormData({email: userProfile?.email || "", address: userProfile?.address || ""}); setShowUpdateProfileModal(true); }} className="w-full mt-8 py-4 bg-gov-blue text-white rounded-2xl font-black uppercase text-xs">Edit Details</button>
                    </div>
                </div>
            )}

            {showUpdateProfileModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden p-8">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-gov-blue/10 rounded-2xl flex items-center justify-center text-gov-blue"><Settings className="w-8 h-8" /></div>
                                <button type="button" onClick={() => setShowUpdateProfileModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><XCircle className="w-6 h-6" /></button>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-8">Update Profile</h2>
                            <div className="space-y-4">
                                <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} />
                                <textarea placeholder="Address" rows={3} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={profileFormData.address} onChange={e => setProfileFormData({...profileFormData, address: e.target.value})} />
                            </div>
                            <button type="submit" disabled={isUpdatingProfile} className="w-full mt-8 py-4 bg-gov-blue text-white rounded-2xl font-black uppercase text-xs">{isUpdatingProfile ? "Saving..." : "Save Profile"}</button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .leaflet-container {
                    background: #f1f5f9 !important;
                }
                .premium-popup .leaflet-popup-content-wrapper {
                    border-radius: 20px !important;
                    padding: 0 !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                    border: 1px solid rgba(255,255,255,0.5);
                }
                .premium-popup .leaflet-popup-content {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .premium-popup .leaflet-popup-tip {
                    box-shadow: none !important;
                }
            `}</style>
        </div>
    );
}
