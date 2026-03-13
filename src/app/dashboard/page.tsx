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
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
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
    const [activeZone, setActiveZone] = useState("South Delhi");
    const [aiInsight, setAiInsight] = useState<any>(null);
    
    // Voice Assist State
    const [isRecording, setIsRecording] = useState(false);
    const [voiceFeedback, setVoiceFeedback] = useState("");

    const handleVoiceAssist = async () => {
        if (!isRecording) {
            setIsRecording(true);
            setVoiceFeedback("Listening for instructions...");
            // In a real environment, we'd use MediaRecorder here.
            setTimeout(async () => {
                setIsRecording(false);
                setVoiceFeedback("Transcribing: 'Summarize pending water leakages'...");
                try {
                    await textToSpeechAction("Summarizing pending water leakage reports for South Delhi.");
                } catch (err) {
                    console.error("TTS Error:", err);
                }
            }, 3000);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

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

                    // Background enrichment
                    const currentComplaints = getComplaints(finalProfile.userId);
                    if (currentComplaints.length > 0) {
                        analyzeIssueAction(currentComplaints[0].description)
                            .then(insight => setAiInsight(insight))
                            .catch(aiErr => console.warn("AI Insight Background Error:", aiErr));
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
                    <SidebarLink icon={<LayoutGrid className="w-4 h-4" />} label="Overview" active />
                    <SidebarLink icon={<FileText className="w-4 h-4" />} label="My Reports" />
                    <SidebarLink icon={<MapIcon className="w-4 h-4" />} label="Local Map" />
                    <SidebarLink icon={<ShieldAlert className="w-4 h-4" />} label="Emergency" />
                    
                    <div className="pt-8 pb-2 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Support</div>
                    <SidebarLink icon={<Settings className="w-4 h-4" />} label="Preferences" />
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
                        <div className="h-6 w-px bg-slate-200 mx-2" />
                        <div className="flex items-center gap-2 text-slate-500 hover:text-gov-blue cursor-pointer transition-colors px-3 py-2 rounded-xl border border-transparent hover:border-slate-100">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-bold">Zone: {activeZone}</span>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={handleVoiceAssist}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isRecording ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-100 text-gov-blue hover:bg-slate-50'}`}
                        >
                            {isRecording ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            <span className="text-xs font-black uppercase tracking-widest">{isRecording ? "Listening..." : "Voice Assist"}</span>
                        </button>

                        <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800 leading-none">{userProfile?.name || "Citizen"}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Resident - {activeZone}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                                {userProfile?.profileImageUrl ? (
                                    <img src={userProfile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
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
                        <button className="px-6 py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue shadow-lg shadow-gov-blue/20 transition-all active:scale-95">
                            Contact Support
                        </button>
                    </div>

                    {/* Live Feed Table Section */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-slate-800">My Grievance History</h2>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                                    <LayoutGrid className="w-4 h-4" /> Filter
                                </button>
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
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                        <Volume2 className="w-4 h-4" />
                                                    </div>
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

function SidebarLink({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <Link href="#" className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-gov-blue/5 text-gov-blue shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
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
