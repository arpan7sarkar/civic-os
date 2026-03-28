"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    LayoutDashboard,
    AlertCircle,
    CheckCircle2,
    Clock3,
    TrendingUp,
    TrendingDown,
    MapPin,
    ShieldCheck,
    ArrowRight,
    Camera,
    Filter,
    Search,
    RefreshCw,
    ExternalLink,
    ChevronDown,
    Building2,
    Users,
    User,
    Zap,
    X,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Eye,
    BarChart3,
    Activity,
    LogOut,
    Menu,
    Plus,
    Bell,
    Volume2,
    FileText,
    Sparkles
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import { getAllGrievancesAction, updateGrievanceStatusAction, uploadGrievanceImageAction } from "@/app/actions/grievance";
import { Complaint } from "@/lib/types";
import AdminSidebar from "@/components/AdminSidebar";

export default function AuthorityDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Modal States
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [resolutionNote, setResolutionNote] = useState("");
    const [showCircularModal, setShowCircularModal] = useState(false);
    const [currentRegion, setCurrentRegion] = useState("Delhi NCT Administrative Region");
    const [liveAddress, setLiveAddress] = useState("the reported area");

    // Notification State
    const [notifications, setNotifications] = useState([
        { id: 1, title: "New Critical Report", message: "Water leakage reported in Ward 12", time: "2m ago", read: false, type: "critical" },
        { id: 2, title: "SLA Warning", message: "Case #8821 close to deadline", time: "15m ago", read: false, type: "warning" },
        { id: 3, title: "System Update", message: "Phase 4 Governance Engine active", time: "1h ago", read: true, type: "info" },
    ]);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [showNotifications, setShowNotifications] = useState(false);
    const hasUnread = notifications.some(n => !n.read);


    // Stats
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        avgResolutionTime: "14.2h"
    });

    useEffect(() => {
        const checkAuth = async () => {
            const res = await getServerProfileAction();
            // Restrict to authority role
            if (!res.success || res.profile?.role !== 'authority') {
                router.push("/dashboard");
                return;
            }
            setProfile(res.profile);
            loadComplaints();
        };
        checkAuth();

        // Geolocation detection
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // In a real app, we'd reverse geocode here. 
                    // For demo, we'll simulate a more specific region if coordinates are found.
                    const city = "South Delhi"; // This could be dynamic from an API
                    setCurrentRegion(`${city} NCT Administrative Region`);
                },
                (error) => console.log("Location access denied, defaulting to Delhi NCT")
            );
        }
    }, [router]);

    const loadComplaints = async () => {
        setIsLoading(true);
        const res = await getAllGrievancesAction();
        if (res.success && res.grievances) {
            const docs = res.grievances as Complaint[];
            setComplaints(docs);
            setFilteredComplaints(docs);
            
            const resolved = docs.filter(c => c.status === 'Resolved').length;
            setStats({
                total: docs.length,
                resolved: resolved,
                pending: docs.length - resolved,
                avgResolutionTime: "14.2h"
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        let result = complaints;
        if (statusFilter !== "All") {
            result = result.filter(c => c.status === statusFilter);
        }
        if (searchTerm) {
            result = result.filter(c => 
                c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredComplaints(result);
    }, [searchTerm, statusFilter, complaints]);

    const handleUpdateStatus = async () => {
        if (!selectedComplaint || !newStatus) return;
        setIsActionLoading(true);

        try {
            let afterImageUrl = "";
            if (newStatus === 'Resolved' && afterImage) {
                const formData = new FormData();
                formData.append('image', afterImage);
                const uploadRes = await uploadGrievanceImageAction(formData);
                if (uploadRes.success) {
                    afterImageUrl = uploadRes.fileId!;
                } else {
                    alert("Image upload failed. Please try again.");
                    setIsActionLoading(false);
                    return;
                }
            }

            const res = await updateGrievanceStatusAction(selectedComplaint.id, newStatus, { 
                afterImageUrl,
                note: resolutionNote 
            });
            if (res.success) {
                setShowStatusModal(false);
                setAfterImage(null);
                setImagePreview(null);
                setResolutionNote("");
                loadComplaints();
            } else {

                alert("Failed to update status: " + res.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLogout = async () => {
        if (confirm("Are you sure you want to log out of the Authority Portal?")) {
            await logoutAction();
            router.push("/auth");
        }
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const decodeHTMLEntities = (text: string) => {
        if (!text) return "";
        return text
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
    };

    const getSLABadge = (complaint: Complaint) => {
        if (complaint.status === 'Resolved') return null;
        if (!complaint.slaDeadline) return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase ring-1 ring-slate-200">No SLA</span>;

        const deadline = new Date(complaint.slaDeadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));

        if (hoursLeft < 0) return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase ring-1 ring-red-100 animate-pulse"><AlertCircle size={10}/> Overdue</span>;
        if (hoursLeft < 12) return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase ring-1 ring-orange-100"><Zap size={10}/> Critical: {hoursLeft}h</span>;
        return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase ring-1 ring-emerald-100"><Clock3 size={10}/> {hoursLeft}h left</span>;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-gov-blue animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Official Session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            <AdminSidebar 
                userProfile={profile} 
                onLogoutAction={handleLogout} 
                isOpen={showMobileSidebar} 
                onClose={() => setShowMobileSidebar(false)} 
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-6 xl:p-8 pb-32 lg:pb-8 max-w-full overflow-x-hidden">
                {/* Header Section */}
                <header className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8 bg-white/70 backdrop-blur-xl p-2 md:p-3 rounded-2xl md:rounded-3xl border border-white shadow-sm sticky top-0 md:top-4 z-40 transition-all">
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden shrink-0 transition-colors"
                    >
                        <Menu className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-gov-blue transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search Case ID, Ward..." 
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-gov-blue/5 focus:bg-white focus:border-gov-blue/20 transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className="hidden sm:flex flex-col items-end px-4 border-l border-slate-100">
                            <span className="text-[9px] font-black text-gov-blue uppercase tracking-widest leading-none mb-1">System State</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Active</span>
                            </div>
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-gov-blue text-white shadow-lg shadow-gov-blue/20' : 'hover:bg-slate-50 text-slate-500'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {hasUnread && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="absolute right-0 mt-4 w-85 bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45 z-0" />
                                        <div className="relative z-10">
                                            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Intelligent Alerts</h4>
                                                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full leading-none">{notifications.filter(n => !n.read).length}</span>
                                                </div>
                                                <button 
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] font-black text-gov-blue uppercase hover:underline"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                                                {notifications.map((n) => (
                                                    <div 
                                                        key={n.id} 
                                                        className={`p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-all flex gap-4 cursor-pointer group/notify ${!n.read ? 'bg-blue-50/40' : ''}`}
                                                    >
                                                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm ${
                                                            n.type === 'critical' ? 'bg-red-500' : n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                                        }`} />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <p className="text-xs font-black text-slate-800 group-hover:text-gov-blue transition-colors">{n.title}</p>
                                                                <p className="text-[9px] text-slate-300 font-bold uppercase shrink-0">{n.time}</p>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors flex items-center gap-2 mx-auto">
                                                    View All Archive <ArrowRight size={10}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Backdrop for easy closing */}
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="space-y-6 md:space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                        <MISStatCard 
                            title="Total Grievances" 
                            value={stats.total} 
                            trend="+2.1%" 
                            trendUp={true} 
                            icon={<FileText className="text-gov-blue w-5 h-5" />} 
                            subtitle="National Registry"
                        />
                        <MISStatCard 
                            title="Pending Action" 
                            value={stats.pending} 
                            trend="-4%" 
                            trendUp={false} 
                            icon={<Clock3 className="text-orange-500 w-5 h-5" />} 
                            subtitle="Needs Review"
                        />
                        <MISStatCard 
                            title="Avg. Resolution" 
                            value={stats.avgResolutionTime} 
                            trend="Optimal" 
                            trendUp={true} 
                            icon={<Zap className="text-indigo-500 w-5 h-5" />} 
                            subtitle="System Speed"
                        />
                        <MISStatCard 
                            title="Success Rate" 
                            value={`${Math.round((stats.resolved / (stats.total || 1)) * 100)}%`} 
                            trend="Live" 
                            trendUp={true} 
                            icon={<CheckCircle className="text-emerald-500 w-5 h-5" />} 
                            subtitle="Resolution Factor"
                        />
                    </div>

                    {/* Government Circular / Alert Section */}
                    <div className="bg-linear-to-r from-slate-50 to-blue-50 border border-blue-100 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shrink-0 flex items-center justify-center text-gov-blue shadow-sm border border-blue-100">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-xs font-black text-gov-blue uppercase tracking-widest mb-1">
                                    Official Directive
                                </div>
                                <div className="text-sm text-slate-700 font-medium">
                                    Priority 1 cases in <span className="font-bold">Ward 42</span> require immediate departmental attention as per Circular #2026/04.
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowCircularModal(true)}
                            className="w-full md:w-auto px-6 py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue-dark shadow-lg shadow-gov-blue/20 transition-all active:scale-95"
                        >
                            View Circular
                        </button>
                    </div>

                    {/* Operation Control List */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-4 md:p-6 xl:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Operational Log</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{currentRegion}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                                    <button 
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border uppercase tracking-tighter ${
                                            statusFilter === status 
                                            ? 'bg-gov-blue text-white border-gov-blue shadow-md shadow-gov-blue/10' 
                                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredComplaints.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-bold">No grievances match current filters.</p>
                                </div>
                            ) : (
                                filteredComplaints.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="group bg-white border border-slate-100 rounded-2xl p-4 md:p-5 xl:p-6 hover:shadow-xl hover:border-gov-blue/20 transition-all duration-300 flex flex-col lg:flex-row gap-4 md:gap-6 relative"
                                    >
                                        {/* Digital Seal for Resolved Reports */}
                                        {item.status === 'Resolved' && (
                                            <div className="absolute top-4 right-4 z-20 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center -rotate-12">
                                                    <div className="text-[8px] font-black text-emerald-600 text-center leading-none uppercase tracking-tighter">
                                                        OFFICIAL<br/>SEAL<br/>VERIFIED
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                         <div className="w-full lg:w-48 shrink-0">
                                            <div className="relative h-32 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group/card">
                                                {!imageErrors[item.id] && item.citizenPhoto ? (
                                                    <Image 
                                                        src={`https://sgp.cloud.appwrite.io/v1/storage/buckets/69b563e9002ced5d5f63/files/${item.citizenPhoto}/view?project=69b02bf0001038d5437c`}
                                                        alt={item.category || "Complaint"}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                        sizes="(max-width: 768px) 100vw, 200px"
                                                        onError={() => setImageErrors(prev => ({...prev, [item.id]: true}))}
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex flex-col items-center justify-center p-4 transition-colors duration-500 ${
                                                        item.category.toLowerCase().includes('light') ? 'bg-amber-50 text-amber-500' :
                                                        item.category.toLowerCase().includes('garbage') ? 'bg-emerald-50 text-emerald-500' :
                                                        item.category.toLowerCase().includes('water') ? 'bg-blue-50 text-blue-500' :
                                                        'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        <div className="relative">
                                                            <div className="absolute -inset-2 bg-current opacity-10 rounded-full animate-pulse" />
                                                            {item.category.toLowerCase().includes('light') && <Zap size={28} className="relative z-10" />}
                                                            {item.category.toLowerCase().includes('garbage') && <FileText size={28} className="relative z-10" />}
                                                            {item.category.toLowerCase().includes('water') && <Activity size={28} className="relative z-10" />}
                                                            {(!item.category.toLowerCase().includes('light') && !item.category.toLowerCase().includes('garbage') && !item.category.toLowerCase().includes('water')) && <Building2 size={28} className="relative z-10" />}
                                                        </div>
                                                        <div className="mt-3 flex flex-col items-center">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Visual Evidence</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-tight leading-none mt-1">Digital Schema</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                                    item.priority === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {item.priority}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Case #{item.id.slice(-6).toUpperCase()}</span>
                                                {getSLABadge(item)}
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{decodeHTMLEntities(item.description)}</h3>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                                                <span className="flex items-center gap-1"><MapPin size={12}/> {item.ward || 'General'}</span>
                                                <span className="flex items-center gap-1"><Building2 size={12}/> {item.category}</span>
                                                <span className="flex items-center gap-1 text-gov-blue"><Activity size={12}/> Assigned: {item.assignedTo || 'Unassigned'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end gap-4 shrink-0">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 
                                                item.status === 'In Progress' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    setSelectedComplaint(item);
                                                    setNewStatus(item.status);
                                                    setShowStatusModal(true);
                                                    setLiveAddress("fetching location...");
                                                    import("@/app/actions/geo").then((geo) => {
                                                        geo.reverseGeocodeAction(item.lat, item.lng).then(res => {
                                                            if (res.success && res.address) {
                                                                const parts = res.address.split(',');
                                                                const shortAddress = parts.slice(0, 2).join(',').trim();
                                                                setLiveAddress(shortAddress || res.address);
                                                            } else {
                                                                setLiveAddress(`coordinates (${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})`);
                                                            }
                                                        });
                                                    });
                                                }}
                                                className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center text-gov-blue hover:bg-gov-blue hover:text-white hover:scale-110 transition-all shadow-sm group-hover:shadow-lg"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Status Update Modal */}
            {showStatusModal && selectedComplaint && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 sm:overflow-y-auto">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 border border-white overflow-hidden relative flex flex-col max-h-[90vh] sm:max-h-[85vh]">
                        {/* High-Fidelity Processing Overlay */}
                        {isActionLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[110] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-gov-blue/10 rounded-full" />
                                    <div className="absolute inset-x-0 inset-y-0 border-4 border-t-gov-blue rounded-full animate-spin" />
                                    <ShieldCheck className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-gov-blue" />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">Finalizing Resolution</h4>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Synchronizing with system...</p>
                                </div>
                            </div>
                        )}

                        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 leading-tight">Grievance Resolution</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">Portal Override</span>
                                        <p className="text-[11px] font-black text-gov-blue uppercase tracking-widest">Ticket #{selectedComplaint.id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => {setShowStatusModal(false); setAfterImage(null); setImagePreview(null);}} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors shrink-0">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">Operational Stage</label>
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    {[
                                        { s: 'Pending', i: <Clock3 size={18} className="sm:w-5 sm:h-5"/> },
                                        { s: 'In Progress', i: <Activity size={18} className="sm:w-5 sm:h-5"/> },
                                        { s: 'Resolved', i: <CheckCircle size={18} className="sm:w-5 sm:h-5"/> }
                                    ].map((stage) => (
                                        <button 
                                            key={stage.s}
                                            onClick={() => setNewStatus(stage.s)}
                                            className={`p-3 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                newStatus === stage.s 
                                                ? 'bg-gov-blue/5 border-gov-blue text-gov-blue shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]' 
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                            }`}
                                        >
                                            {stage.i}
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-center">{stage.s}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {newStatus === 'Resolved' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Resolution Proof</label>
                                            <span className="text-[9px] font-black text-red-500 uppercase">Mandatory</span>
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setAfterImage(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setImagePreview(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`h-32 sm:h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 sm:p-6 ${
                                                imagePreview ? 'border-emerald-600/30' : 'border-slate-100 group-hover:border-gov-blue/50'
                                            }`}>
                                                {imagePreview ? (
                                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-white">
                                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="400px" />
                                                        <div className="absolute inset-0 bg-emerald-500/10" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-300 mb-2 sm:mb-3 group-hover:bg-gov-blue group-hover:text-white transition-all shadow-inner">
                                                            <Camera size={20} className="sm:w-6 sm:h-6" />
                                                        </div>
                                                        <p className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-tight">Upload Evidence Photo</p>
                                                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1">PNG/JPG max 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">Official Closing Statement</label>
                                        <textarea 
                                            placeholder="Specify actions taken to resolve this grievance..."
                                            className="w-full h-20 sm:h-24 p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs sm:text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-blue/20 transition-all resize-none placeholder:text-slate-300"
                                            value={resolutionNote}
                                            onChange={(e) => setResolutionNote(e.target.value)}
                                        />
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex items-center gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                            <Bell size={16} className="animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] sm:text-[13px] font-black text-emerald-900 leading-tight mb-0.5">Automated Broadcast</p>
                                            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 leading-tight opacity-80">
                                                Closing this will notify all residents in <span className="font-black underline">{liveAddress}</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Action Button */}
                        <div className="px-6 py-4 sm:p-8 sm:pt-4 border-t border-slate-50 bg-white/90 backdrop-blur-md">
                            <button 
                                onClick={handleUpdateStatus}
                                disabled={isActionLoading || (newStatus === 'Resolved' && (!afterImage || !resolutionNote.trim()))}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] sm:text-[11px] shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 ${
                                    newStatus === 'Resolved' && (!afterImage || !resolutionNote.trim())
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-slate-900 text-white hover:bg-gov-blue hover:shadow-gov-blue/25 hover:-translate-y-0.5'
                                }`}
                            >
                                {isActionLoading ? 'Processing...' : (
                                    <>Submit Official Update <ArrowRight size={16}/></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Official Directive Modal (Circular) */}
            {showCircularModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 leading-tight">Official Directive</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">Directive #2026/04</span>
                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[9px] font-black uppercase tracking-widest animate-pulse">Priority 1</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowCircularModal(false)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 flex items-center justify-between">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Issued by: Div. Commissioner</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock3 size={16} className="text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">26 March 2026</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Urgent Intervention in Ward 42</h4>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 text-slate-600 font-medium leading-relaxed italic shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                    "Due to multiple reports of systemic infrastructure failure in Ward 42 during the current NCT modernization phase, all departmental heads are directed to prioritize grievances involving Power Grid instability and Water Main maintenance. Immediate verification of site proofs is mandatory before ticket closure."
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col justify-center">
                                    <div className="text-[10px] font-black text-orange-600 uppercase mb-1">Primary Ward Target</div>
                                    <div className="text-lg font-black text-orange-900">Ward 42 (Delhi NCT)</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col justify-center">
                                    <div className="text-[10px] font-black text-indigo-600 uppercase mb-1">Compliance SLA</div>
                                    <div className="text-lg font-black text-indigo-900">Within 24 Hours</div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowCircularModal(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gov-blue transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Acknowledge Directive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MISStatCard({ title, value, trend, trendUp, icon, subtitle }: any) {
    return (
        <div className="bg-white p-4 xl:p-6 rounded-[24px] xl:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[9px] md:text-[11px] font-black ${trendUp ? 'text-green-500' : 'text-orange-500'}`}>
                    {trendUp ? <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl md:text-3xl font-black text-slate-800 mb-1 md:mb-2">{value}</p>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}

