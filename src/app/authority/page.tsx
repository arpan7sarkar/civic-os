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
    LogOut
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import { getAllGrievancesAction, updateGrievanceStatusAction, uploadGrievanceImageAction } from "@/app/actions/grievance";
import { Complaint } from "@/lib/types";

export default function AuthorityDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

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
        avgResolutionTime: "14.2h" // Simulated
    });

    useEffect(() => {
        const checkAuth = async () => {
            const res = await getServerProfileAction();
            if (!res.success || res.profile?.email !== 'bs922268@gmail.com') {
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
                c.ward?.toLowerCase().includes(searchTerm.toLowerCase())
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
        if (confirm("Are you sure you want to log out of the Control Center?")) {
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
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading Official Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Linker - For consistency */}
            <div className="hidden lg:flex flex-col w-64 bg-slate-900 text-white p-6 shadow-xl space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">CivicOS</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authority Portal</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <button className="flex items-center gap-3 w-full p-3 bg-white/10 rounded-lg text-white font-medium transition-all">
                        <LayoutDashboard size={20} className="text-indigo-400" /> Dashboard
                    </button>
                    <button className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => router.push("/dashboard")}>
                        <ArrowRight size={20} /> Citizen Mode
                    </button>
                </nav>

                <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <span className="text-xs font-bold text-indigo-400">BS</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate">Bishal Sarkar</p>
                            <p className="text-p[8px] text-slate-500 truncate">Commissioner</p>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-3/4"></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2 font-medium">Daily Resolution Target: 75%</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-lg transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <LogOut size={18} /> Terminator Session
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Operational Overview</h2>
                        <div className="h-5 w-[1px] bg-slate-200"></div>
                        <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <MapPin size={14}/> Delhi NCT Region
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by ID, Ward or Issue..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-80 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600">
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {/* Stats Grid */}
                    {/* Multi-Dimensional Operational Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="group relative bg-white/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_-16px_rgba(79,70,229,0.1)] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-100/50 transition-colors"></div>
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="p-4 bg-white shadow-sm ring-1 ring-slate-100 text-indigo-600 rounded-2xl"><BarChart3 size={24} className="group-hover:scale-110 transition-transform"/></div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest ring-1 ring-emerald-100">+12% vs LW</span>
                            </div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest opacity-70">Total Intelligence Output</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{stats.total} <span className="text-lg font-bold text-slate-300">ACTS</span></h3>
                        </div>

                        <div className="group relative bg-white/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_-16px_rgba(16,185,129,0.1)] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-100/50 transition-colors"></div>
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="p-4 bg-white shadow-sm ring-1 ring-slate-100 text-emerald-600 rounded-2xl"><CheckCircle2 size={24} className="group-hover:rotate-12 transition-transform"/></div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest ring-1 ring-emerald-100">TARGET MET</span>
                            </div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest opacity-70">Resolved Cases</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{stats.resolved} <span className="text-lg font-bold text-slate-300">SOLVED</span></h3>
                        </div>

                        <div className="group relative bg-white/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_-16px_rgba(245,158,11,0.1)] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-100/50 transition-colors"></div>
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="p-4 bg-white shadow-sm ring-1 ring-slate-100 text-amber-500 rounded-2xl"><Activity size={24} className="group-hover:animate-pulse"/></div>
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black tracking-widest ring-1 ring-rose-100">CRITICAL: 4</span>
                            </div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest opacity-70">SLA Response velocity</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">14.2<span className="text-lg font-bold text-slate-300">HRS</span></h3>
                        </div>

                        <div className="group relative bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(79,70,229,0.4)] text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl"><Zap size={24} className="fill-white"/></div>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-bold tracking-widest border border-white/10">ELITE PERFORMANCE</span>
                            </div>
                            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest opacity-80">Civic Efficiency Score</p>
                            <h3 className="text-5xl font-black mt-2 tracking-tighter">94.2 <span className="text-lg font-bold opacity-40">%</span></h3>
                            <div className="h-2 w-full bg-white/20 rounded-full mt-6 overflow-hidden">
                                <div className="h-full bg-white w-[94%] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-1000 delay-300"></div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & List Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                                 <button 
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-full text-sm font-extrabold transition-all border ${
                                        statusFilter === status 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                 >
                                     {status}
                                 </button>
                             ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                <Filter size={16}/> Filter Range
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all">
                                <TrendingUp size={16}/> Report Export
                            </button>
                        </div>
                    </div>

                    {/* Grievance Feed */}
                    <div className="space-y-4 pb-20">
                        {filteredComplaints.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                                <Building2 size={48} className="text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg font-bold">No grievances match the criteria</p>
                                <button className="mt-4 text-indigo-600 font-bold" onClick={() => {setStatusFilter('All'); setSearchTerm('')}}>Clear all filters</button>
                            </div>
                        ) : (
                            filteredComplaints.map((complaint) => (
                                <div key={complaint.id} className="group bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-300 flex flex-col md:flex-row gap-8">
                                    {/* Left: Image Comparison or Before Image */}
                                    <div className="w-full md:w-72 shrink-0">
                                        {complaint.status === 'Resolved' && complaint.afterImageUrl ? (
                                            <div className="relative grid grid-cols-2 gap-2 h-48 rounded-[2rem] overflow-hidden">
                                                <div className="relative group/img">
                                                    <Image 
                                                        src={complaint.citizenPhoto ? `https://sgp.cloud.appwrite.io/v1/storage/buckets/grievance-images/files/${complaint.citizenPhoto}/view?project=civicos-app` : "/placeholder.jpg"}
                                                        alt="Before"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-white font-black uppercase tracking-widest bg-red-600 px-2 py-1 rounded">Before</span>
                                                    </div>
                                                </div>
                                                <div className="relative group/img">
                                                    <Image 
                                                        src={`https://sgp.cloud.appwrite.io/v1/storage/buckets/grievance-images/files/${complaint.afterImageUrl}/view?project=civicos-app`}
                                                        alt="After"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-white font-black uppercase tracking-widest bg-emerald-600 px-2 py-1 rounded">After</span>
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[9px] font-black shadow-lg">COMPARISON ACTIVE</div>
                                            </div>
                                        ) : (
                                            <div className="relative h-48 rounded-[2rem] overflow-hidden group/img">
                                                <Image 
                                                    src={complaint.citizenPhoto ? `https://sgp.cloud.appwrite.io/v1/storage/buckets/grievance-images/files/${complaint.citizenPhoto}/view?project=civicos-app` : "/placeholder.jpg"}
                                                    alt={complaint.category}
                                                    fill
                                                    className="object-cover group-hover/img:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                                                     <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black shadow-xl">PHOTO EVIDENCE</span>
                                                     <div className="w-8 h-8 bg-black/20 backdrop-blur rounded-full flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-black/40 transition-colors">
                                                        <Eye size={14} className="text-white"/>
                                                     </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Middle: Content */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border ${
                                                    complaint.priority === 'Critical' ? 'bg-red-950 text-red-400 border-red-900/50' : 
                                                    complaint.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                    {complaint.priority} Priority
                                                </span>
                                                <span className="px-4 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-black uppercase tracking-tighter border border-slate-200">
                                                    {complaint.category}
                                                </span>
                                                {getSLABadge(complaint)}
                                                {complaint.assignedAuto && (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase ring-1 ring-indigo-100 group">
                                                        <Zap size={10} className="fill-indigo-600 group-hover:animate-pulse"/> AI Verified Ownership
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">#{complaint.id.slice(-6).toUpperCase()} — {decodeHTMLEntities(complaint.description).split('.')[0]}</h3>
                                            
                                            <div className="flex items-center gap-6 text-slate-500 font-medium text-sm mb-4">
                                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> Ward {complaint.ward || '12'}</span>
                                                <span className="flex items-center gap-1.5"><Building2 size={16} className="text-slate-400"/> {complaint.assignedDepartment || complaint.department}</span>
                                                <span className="flex items-center gap-1.5 text-indigo-600 font-black tracking-widest text-[10px]"><Users size={16}/> {complaint.affectedUsersCount || '0'} IMPACTED</span>
                                            </div>

                                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 italic pr-4">
                                                "{decodeHTMLEntities(complaint.description)}"
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reported on</span>
                                                    <span className="text-sm font-bold text-slate-700">{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                {complaint.status === 'Resolved' && (
                                                     <div className="flex flex-col">
                                                        <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10}/> Resolved by</span>
                                                        <span className="text-sm font-bold text-slate-700">{complaint.resolvedByName || 'Commissioner'}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-tight shadow-sm ring-1 ${
                                                    complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' :
                                                    complaint.status === 'In Progress' ? 'bg-amber-50 text-amber-600 ring-amber-100' :
                                                    'bg-slate-50 text-slate-400 ring-slate-100'
                                                }`}>
                                                    {complaint.status}
                                                </span>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedComplaint(complaint);
                                                        setNewStatus(complaint.status);
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-200"
                                                >
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && selectedComplaint && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-slate-900 p-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg"><RefreshCw size={24}/></div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Issue Resolution Portal</h3>
                                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Case ID: {selectedComplaint.id.toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => {setShowStatusModal(false); setAfterImage(null); setImagePreview(null);}} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Update Operating Status</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Pending', 'In Progress', 'Resolved'].map((status) => (
                                        <button 
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${
                                                newStatus === status 
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md ring-4 ring-indigo-50' 
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {status === 'Pending' && <Clock3 size={20} className={newStatus === status ? "text-indigo-600" : "text-slate-300"}/>}
                                            {status === 'In Progress' && <TrendingUp size={20} className={newStatus === status ? "text-amber-500" : "text-slate-300"}/>}
                                            {status === 'Resolved' && <CheckCircle size={20} className={newStatus === status ? "text-emerald-500" : "text-slate-300"}/>}
                                            <span className="text-xs font-black uppercase">{status}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {newStatus === 'Resolved' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500">
                                    <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Photographic Proof of Resolution</label>
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
                                        <div className={`h-48 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center p-6 ${
                                            imagePreview ? 'border-emerald-600/30' : 'border-slate-200 group-hover:border-indigo-400/50'
                                        }`}>
                                            {imagePreview ? (
                                                <div className="relative w-full h-full">
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-2xl" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-black uppercase tracking-widest bg-emerald-600 px-3 py-1.5 rounded-full shadow-lg">Change Resolution Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                        <Camera size={32} />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-800">CLICK TO UPLOAD PROOF</p>
                                                    <p className="text-xs text-slate-400 font-medium">JPEG, PNG or HEIC up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <AlertTriangle size={16} className="text-emerald-600 shrink-0 mt-0.5"/>
                                        <p className="text-[10px] text-emerald-700 font-bold italic leading-relaxed">
                                            IMPORTANT: Verification images are cross-referenced using AI Metadata. Ensure the resolution photo clearly shows the solved issue from a similar angle.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 shrink-0">
                                <button 
                                    onClick={() => {setShowStatusModal(false); setAfterImage(null); setImagePreview(null);}}
                                    className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-sm hover:text-slate-600 transition-colors"
                                    disabled={isActionLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateStatus}
                                    disabled={isActionLoading || (newStatus === 'Resolved' && !afterImage)}
                                    className={`flex-[2] py-4 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                                        newStatus === 'Resolved' && !afterImage 
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 text-white hover:scale-105 active:scale-95 shadow-indigo-200'
                                    }`}
                                >
                                    {isActionLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> 
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Confirm System Update <ArrowRight size={20}/>
                                        </>
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
