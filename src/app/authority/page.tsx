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

            const res = await updateGrievanceStatusAction(selectedComplaint.id, newStatus, { afterImageUrl });
            if (res.success) {
                setShowStatusModal(false);
                setAfterImage(null);
                setImagePreview(null);
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

            <AdminSidebar userProfile={profile} onLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-32 lg:pb-8">
                {/* Header Section */}
                <header className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8 bg-white/50 backdrop-blur-md p-2 md:p-4 rounded-2xl md:rounded-3xl border border-white/50 shadow-sm sticky top-0 md:top-4 z-10 transition-all">
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden shrink-0"
                    >
                        <Menu className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="relative flex-1 hidden xl:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Case ID, Ward or Description..." 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-blue/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 shrink-0">
                    <div className="hidden sm:flex flex-col items-end px-4 border-l border-slate-200">
                            <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest leading-none mb-1">Status</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">Operational</span>
                        </div>
                        <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
                        <button className="w-full md:w-auto px-6 py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue-dark shadow-lg shadow-gov-blue/20 transition-all active:scale-95">
                            View Circular
                        </button>
                    </div>

                    {/* Operation Control List */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-4 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Operational Log</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Delhi NCT Administrative Region</p>
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
                                        className="group bg-white border border-slate-100 rounded-2xl p-4 md:p-6 hover:shadow-xl hover:border-gov-blue/20 transition-all duration-300 flex flex-col md:flex-row gap-6 relative"
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

                                        <div className="w-full md:w-48 shrink-0">
                                            <div className="relative h-32 rounded-xl overflow-hidden shadow-inner">
                                                <Image 
                                                    src={item.citizenPhoto ? `https://sgp.cloud.appwrite.io/v1/storage/buckets/grievance-images/files/${item.citizenPhoto}/view?project=civicos-app` : "/placeholder.jpg"}
                                                    alt={item.category}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">Resolution Update</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Case #{selectedComplaint.id.toUpperCase()}</p>
                                </div>
                                <button onClick={() => {setShowStatusModal(false); setAfterImage(null); setImagePreview(null);}} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">Select Process Stage</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Pending', 'In Progress', 'Resolved'].map((status) => (
                                        <button 
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                newStatus === status 
                                                ? 'bg-gov-blue/5 border-gov-blue text-gov-blue shadow-inner' 
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {status === 'Pending' && <Clock3 size={20} />}
                                            {status === 'In Progress' && <Activity size={20} />}
                                            {status === 'Resolved' && <CheckCircle size={20} />}
                                            <span className="text-[10px] font-black uppercase">{status}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {newStatus === 'Resolved' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500">
                                    <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 px-2">Completion Evidence (Required)</label>
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
                                        <div className={`h-40 rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center p-6 ${
                                            imagePreview ? 'border-emerald-600/30' : 'border-slate-100 group-hover:border-gov-blue/50'
                                        }`}>
                                            {imagePreview ? (
                                                <div className="relative w-full h-full rounded-lg overflow-hidden">
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera size={24} className="text-slate-300 mb-2" />
                                                    <p className="text-xs font-black text-slate-800">CLICK TO UPLOAD PROOF</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={handleUpdateStatus}
                                    disabled={isActionLoading || (newStatus === 'Resolved' && !afterImage)}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${
                                        newStatus === 'Resolved' && !afterImage 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-gov-blue text-white hover:scale-105 active:scale-95 shadow-gov-blue/20'
                                    }`}
                                >
                                    {isActionLoading ? (
                                        <Loader2 size={16} className="animate-spin" /> 
                                    ) : (
                                        <>Synchronize Status <ArrowRight size={16}/></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MISStatCard({ title, value, trend, trendUp, icon, subtitle }: any) {
    return (
        <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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

