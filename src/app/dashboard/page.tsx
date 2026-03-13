"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import {
    Bell,
    Search,
    ChevronDown,
    AlertCircle,
    Clock,
    Smile,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    LayoutGrid,
    FileText,
    Map as MapIcon,
    Settings,
    Clock3,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    MapPin,
    Mic,
    Volume2,
    User,
    FileDown
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getServerProfileAction, UserProfile, updateUserProfileAction } from "@/app/actions/profile";
import { reverseGeocodeAction } from "@/app/actions/geo";
import { getComplaints, updateComplaint, getStats } from "@/lib/store";
import { Complaint } from "@/lib/types";
import { analyzeIssueAction, transcribeAudioAction, textToSpeechAction } from "@/app/actions/ai";
import { generateGrievancePDF } from "@/lib/pdf";

export default function CitizenDashboard() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        citizenSatisfaction: "N/A"
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeZone, setActiveZone] = useState("South Delhi");
    const [aiInsight, setAiInsight] = useState<any>(null);

    // Menu States
    const [showZoneMenu, setShowZoneMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Profile Modal States
    const [showMyProfileModal, setShowMyProfileModal] = useState(false);
    const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        email: "",
        address: ""
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    
    // Voice Assist State
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const playAudio = (base64: string) => {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.play().catch(e => console.error("Audio Play Error:", e));
    };

    const handleVoiceAssist = async () => {
        if (isSpeaking) return;
        setIsRecording(true);
        // Correct interpolation for user profile name
        const summaryText = `नमस्ते ${userProfile?.name || 'citizen'}. आपके पास ${stats.pendingReports} लंबित शिकायतें हैं। आपकी कचरा संग्रहण की शिकायत पर कार्रवाई की जा रही है।`;
        
        try {
            const audios = await textToSpeechAction(summaryText, "shubh", "hi-IN");
            if (audios && audios.length > 0) {
                playAudio(audios[0]);
            }
        } catch (err) {
            console.error("Voice Assist Error:", err);
        } finally {
            setIsRecording(false);
        }
    };

    const handleGrievanceVoice = async (complaint: Complaint) => {
        if (isSpeaking) return;
        const statusText = `शिकायत संख्या ${complaint.id} की स्थिति ${complaint.status === 'Pending' ? 'लंबित' : complaint.status === 'In Progress' ? 'प्रगति पर' : 'पूर्ण'} है। इसे ${complaint.assignedTo || 'संबद्ध विभाग'} को सौंपा गया है।`;
        
        try {
            const audios = await textToSpeechAction(statusText, "shubh", "hi-IN");
            if (audios && audios.length > 0) {
                playAudio(audios[0]);
            }
        } catch (err) {
            console.error("Grievance Voice Error:", err);
        }
    };

    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);

    const handleLocationTrack = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                setLat(latitude);
                setLng(longitude);
                
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
        // Initial coordinate track
        handleLocationTrack();
    }, []);

    const loadData = async (uid: string) => {
        const allComplaints = getComplaints(uid);
        const filtered = allComplaints.filter(c => 
            c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setComplaints(filtered);
        setStats(getStats(uid));
    };

    useEffect(() => {
        let retries = 0;
        const maxRetries = 3;

        const initDashboard = async () => {
            console.log(`[DASHBOARD_CLIENT] Starting Init (Retry: ${retries})`);
            
            // Safety: Force stop loading after 10s
            const safetyTimeout = setTimeout(() => {
                if (isLoading) {
                    console.warn("[DASHBOARD_CLIENT] Safety Timeout reached. Forcing load.");
                    setIsLoading(false);
                }
            }, 10000);

            try {
                setIsLoading(true);
                console.log(`[DASHBOARD_CLIENT] Calling getServerProfileAction...`);
                const result = await getServerProfileAction();
                console.log(`[DASHBOARD_CLIENT] Result:`, result);
                
                let finalProfile = result.profile;

                // NEW: Client-Side Recovery Fallback (Perfect for Localhost)
                if (result.success && (!finalProfile || finalProfile.name.includes('Bridge'))) {
                    console.log("[DASHBOARD_CLIENT] Server missing deep session. Attempting Client-Side Recovery...");
                    try {
                        const { account: browserAccount, databases: browserDatabases, DATABASE_ID, PROFILES_COLLECTION_ID } = await import('@/lib/appwrite');
                        const { Query } = await import('appwrite');
                        
                        const browserUser = await browserAccount.get();
                        console.log("[DASHBOARD_CLIENT] Client-Side Account Found:", browserUser.name);
                        
                        // Try to get real profile doc from DB via client-side
                        const dbResult = await browserDatabases.listDocuments(
                            DATABASE_ID,
                            PROFILES_COLLECTION_ID,
                            [Query.equal('userId', browserUser.$id)]
                        );

                        if (dbResult.documents.length > 0) {
                            finalProfile = JSON.parse(JSON.stringify(dbResult.documents[0])) as UserProfile;
                        } else {
                            finalProfile = {
                                userId: browserUser.$id,
                                name: browserUser.name || 'Citizen',
                                govIdType: 'N/A',
                                govIdNumber: 'N/A'
                            };
                        }
                    } catch (e: any) {
                        console.warn("[DASHBOARD_CLIENT] Client-Side Recovery failed:", e.message);
                    }
                }

                if (finalProfile) {
                    console.log(`[DASHBOARD_CLIENT] Final Profile Resolved:`, finalProfile.userId);
                    setUserProfile(finalProfile);
                    
                    await loadData(finalProfile.userId);
                    setIsLoading(false);
                    clearTimeout(safetyTimeout);

                    // Background enrichment - Load insight from existing data to avoid redundant AI API calls
                    const currentComplaints = getComplaints(finalProfile.userId);
                    if (currentComplaints.length > 0) {
                        const latest = currentComplaints[0];
                        setAiInsight({
                            category: latest.category,
                            priority: latest.priority,
                            suggestedAction: `Assigned to ${latest.department} for rapid response.`
                        });
                    }
                } else if (!result.success && (result.error === 'NO_SESSION' || result.error?.includes('401'))) {
                    clearTimeout(safetyTimeout);
                    if (retries < maxRetries) {
                        retries++;
                        console.log(`[DASHBOARD_CLIENT] Session missing/401, retrying ${retries}/${maxRetries}...`);
                        setTimeout(initDashboard, 1000); // 1s wait between retries
                    } else {
                        console.log(`[DASHBOARD_CLIENT] Max retries reached. Redirecting to auth.`);
                        router.replace('/auth');
                    }
                } else if (result.success && !result.profile) {
                    console.log(`[DASHBOARD_CLIENT] No profile found. Redirecting to register.`);
                    clearTimeout(safetyTimeout);
                    router.replace('/auth/register');
                } else {
                    console.error("[DASHBOARD_CLIENT] Unexpected State:", result);
                    setIsLoading(false);
                    clearTimeout(safetyTimeout);
                }
            } catch (error: any) {
                console.error("[DASHBOARD_CLIENT] Fatal Error during init:", error);
                setIsLoading(false);
                clearTimeout(safetyTimeout);
            }
        };
        initDashboard();
    }, [router]);

    useEffect(() => {
        if (userProfile) {
            loadData(userProfile.userId);
        }
    }, [searchTerm, userProfile]);

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
            } else {
                alert("Failed to update profile: " + res.error);
            }
        } catch (err) {
            console.error("Update Profile Error:", err);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutAction();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const refreshFeed = async () => {
        setIsRefreshing(true);
        if (userProfile) {
            await loadData(userProfile.userId);
        }
        setTimeout(() => setIsRefreshing(false), 800);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Your Citizen Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar matches design */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-50">
                    <div className="w-8 h-8 bg-gov-blue rounded-lg flex items-center justify-center shadow-lg shadow-gov-blue/20">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">MCD CivicOS</h1>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Govt. of NCT Delhi</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarLink icon={<LayoutGrid className="w-4 h-4" />} label="Overview" href="/dashboard" active />
                    <SidebarLink icon={<FileText className="w-4 h-4" />} label="My Reports" href="/dashboard" />
                    <SidebarLink icon={<MapIcon className="w-4 h-4" />} label="Local Map" href="/map" />
                    <SidebarLink icon={<ShieldAlert className="w-4 h-4" />} label="Emergency" href="/dashboard" />
                    
                    <div className="pt-8 pb-2 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Support</div>
                    <SidebarLink icon={<Settings className="w-4 h-4" />} label="Preferences" href="/dashboard" />
                </nav>

                <div className="p-4 border-t border-slate-50">
                    <Link href="/report" className="w-full py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-gov-blue/10 flex items-center justify-center gap-2">
                        <span>+ New Report</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-8 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm sticky top-4 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Ticket ID or Ward..." 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-blue/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <div 
                                onClick={() => setShowZoneMenu(!showZoneMenu)}
                                className="flex items-center gap-2 text-slate-500 hover:text-gov-blue cursor-pointer transition-colors px-3 py-2 rounded-xl border border-transparent hover:border-slate-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{activeZone}</span>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showZoneMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                    {currentAddress && <span className="text-[8px] font-bold text-slate-400 truncate max-w-[100px]">{currentAddress}</span>}
                                </div>
                            </div>
                            
                            {showZoneMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    {["South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central Delhi"].map((zone) => (
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
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={handleVoiceAssist}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isRecording || isSpeaking ? 'bg-gov-blue/5 border-gov-blue/20 text-gov-blue animate-pulse' : 'bg-white border-slate-100 text-gov-blue hover:bg-slate-50'}`}
                        >
                            {isRecording || isSpeaking ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            <span className="text-xs font-black uppercase tracking-widest">{isRecording ? "Listening..." : isSpeaking ? "Speaking..." : "Voice Assist"}</span>
                        </button>

                        <div className="relative">
                            <div 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors"
                            >
                                <Bell className="w-5 h-5 text-slate-500" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </div>

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

                        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right">
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
                                            onClick={() => {
                                                setShowMyProfileModal(true);
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                        >
                                            <User className="w-3 h-3" /> My Profile
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setProfileFormData({
                                                    email: userProfile?.email || "",
                                                    address: userProfile?.address || ""
                                                });
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

                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MISStatCard 
                            title="My Active Reports" 
                            value={stats.pendingReports + stats.inProgressReports} 
                            trend="Real-time" 
                            trendUp={true} 
                            icon={<FileText className="text-gov-blue" />} 
                            subtitle="Currently Processing"
                        />
                        <MISStatCard 
                            title="Resolved Tickets" 
                            value={stats.resolvedReports} 
                            trend="Total" 
                            trendUp={true} 
                            icon={<CheckCircle className="text-green-500" />} 
                            subtitle="Successfully Closed"
                        />
                        <MISStatCard 
                            title="Community Health" 
                            value={stats.citizenSatisfaction} 
                            trend="Local" 
                            trendUp={true} 
                            icon={<Smile className="text-orange-500" />} 
                            subtitle="Based on Ward Data"
                        />
                        <MISStatCard 
                            title="Total Contributions" 
                            value={stats.totalReports} 
                            trend="Lifetime" 
                            trendUp={true} 
                            icon={<TrendingUp className="text-indigo-500" />} 
                            subtitle="Issues Reported"
                        />
                    </div>

                    {/* AI Alert Card matches design */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-gov-blue shadow-inner">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-xs font-black text-gov-blue uppercase tracking-widest mb-1">
                                    Citizen AI Assistant
                                </div>
                                <div className="text-sm text-slate-700 font-medium">
                                    {aiInsight ? (
                                        <>We noticed a trend in <span className="font-bold">{aiInsight.category}</span>. Your report has been prioritized as <span className="text-red-600 font-bold">{aiInsight.priority}</span>. {aiInsight.suggestedAction}</>
                                    ) : (
                                        <>Your personal AI is monitoring your reports for resolution progress.</>
                                    )}
                                </div>
                            </div>
                        </div>
                        <a 
                            href="tel:01122591171"
                            className="px-6 py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue shadow-lg shadow-gov-blue/20 transition-all active:scale-95 no-underline flex items-center justify-center"
                        >
                            Contact Support
                        </a>
                    </div>

                    {/* Live Feed Table Section */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-slate-800">My Grievance History</h2>
                            <div className="flex gap-3">
                                <Link href="/map" className="w-full">
                                    <button className="w-full py-2.5 bg-slate-50 text-gov-blue rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                        <MapPin className="w-4 h-4" />
                                        LOCAL MAP
                                    </button>
                                </Link>
                                <button 
                                    onClick={refreshFeed}
                                    className="px-4 py-2 bg-slate-50 text-gov-blue rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gov-blue/5 transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Dept.</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {complaints.length > 0 ? complaints.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-6 text-sm font-bold text-slate-500">#{item.id}</td>
                                            <td className="px-4 py-6">
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => handleGrievanceVoice(item)}
                                                        className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-bold text-slate-800">{item.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6">
                                                <p className="text-sm font-bold text-slate-800">{item.ward}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">South District</p>
                                            </td>
                                            <td className="px-4 py-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    item.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                                                    item.status === 'In Progress' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-6 text-sm font-medium text-slate-600">
                                                {item.assignedTo || "Department Review"}
                                            </td>
                                            <td className="px-4 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => generateGrievancePDF(item)}
                                                        className="p-2 hover:bg-gov-blue/5 rounded-lg text-slate-400 hover:text-gov-blue transition-colors group/btn"
                                                        title="Download PDF Receipt"
                                                    >
                                                        <FileDown className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-xs font-black text-gov-blue uppercase hover:underline">Track Status</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <FileText className="w-12 h-12" />
                                                    <p className="text-sm font-bold">No reports submitted yet. Your history will appear here.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* My Profile Modal */}
            {showMyProfileModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-gov-blue/10 rounded-2xl flex items-center justify-center text-gov-blue">
                                    <User className="w-8 h-8" />
                                </div>
                                <button 
                                    onClick={() => setShowMyProfileModal(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-800 mb-2">My Profile</h2>
                            <p className="text-sm font-medium text-slate-500 mb-8">Your registered citizen details</p>
                            
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                    <p className="text-sm font-bold text-slate-800">{userProfile?.name}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identification</p>
                                    <p className="text-sm font-bold text-slate-800">{userProfile?.govIdType} - {userProfile?.govIdNumber}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-sm font-bold text-slate-800">{userProfile?.email || "Not Provided"}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Residential Address</p>
                                    <p className="text-sm font-bold text-slate-800">{userProfile?.address || "Not Provided"}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setShowMyProfileModal(false);
                                    setProfileFormData({
                                        email: userProfile?.email || "",
                                        address: userProfile?.address || ""
                                    });
                                    setShowUpdateProfileModal(true);
                                }}
                                className="w-full mt-8 py-4 bg-gov-blue text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-gov-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Edit Optional Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Profile Modal */}
            {showUpdateProfileModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                        <form onSubmit={handleUpdateProfile} className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-gov-blue/10 rounded-2xl flex items-center justify-center text-gov-blue">
                                    <Settings className="w-8 h-8" />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowUpdateProfileModal(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Update Profile</h2>
                            <p className="text-sm font-medium text-slate-500 mb-8">Complete your profile for better updates</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="yourname@gmail.com"
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-gov-blue/20 transition-all shadow-inner"
                                        value={profileFormData.email}
                                        onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Residential Address</label>
                                    <textarea 
                                        placeholder="Full address here..."
                                        rows={3}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-gov-blue/20 transition-all shadow-inner resize-none"
                                        value={profileFormData.address}
                                        onChange={(e) => setProfileFormData({...profileFormData, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="w-full mt-8 py-4 bg-gov-blue text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-gov-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isUpdatingProfile ? "Saving Changes..." : "Save Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Loader2(props: any) {
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
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

function SidebarLink({ icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-gov-blue/5 text-gov-blue shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <span className={`${active ? 'text-gov-blue' : 'text-slate-400'}`}>
                {icon}
            </span>
            {label}
        </Link>
    )
}

function MISStatCard({ title, value, trend, trendUp, icon, subtitle }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black text-slate-800 mb-2">{value}</p>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <p className="text-[10px] text-slate-400 font-bold">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}
