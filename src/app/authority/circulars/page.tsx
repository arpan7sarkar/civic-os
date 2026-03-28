"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import AdminSidebar from "@/components/AdminSidebar";
import { FileText, Menu, AlertTriangle, ShieldCheck, MailPlus, Search, CalendarDays, X, Send, Loader2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { createGrievanceAction, getAllGrievancesAction } from "@/app/actions/grievance";

type Circular = { id: string, title: string, issuer: string, priority: boolean, date: string, content?: string };

export default function CircularsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    
    const [search, setSearch] = useState("");
    const [circulars, setCirculars] = useState<Circular[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modal state
    const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
    const [isComposing, setIsComposing] = useState(false);
    
    // Compose Form
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newPriority, setNewPriority] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            const res = await getServerProfileAction();
            if (!res.success || res.profile?.role !== 'authority') {
                router.push("/dashboard");
                return;
            }
            setProfile(res.profile);

            // Fetch real circulars from Appwrite DB via the grievances proxy collection
            const gRes = await getAllGrievancesAction();
            if (gRes.success && gRes.grievances) {
                const fetchedCirculars = gRes.grievances
                    .filter((g: any) => g.department === 'SYSTEM_CIRCULAR')
                    .map((g: any) => ({
                        id: g.id || g.$id,
                        title: g.ward || 'Untitled Directive', // We used ward string for title
                        issuer: g.rawDescription || 'Div. Commissioner',
                        priority: g.priority === 'High' || g.priority === 'Critical',
                        date: new Date(g.$createdAt || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        content: g.description
                    }));
                setCirculars(fetchedCirculars);
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, [router]);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/auth/login");
    };

    const handleComposeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Save to real database using Appwrite backend
        // We overload fields to match Complaint schema while categorizing it as SYSTEM_CIRCULAR
        const res = await createGrievanceAction({
            userId: profile?.userId || 'SYS_AUTH',
            rawDescription: profile?.name || 'Authority',
            category: 'Other',
            department: 'SYSTEM_CIRCULAR',
            ward: newTitle,            // Overload ward string with the Title
            status: 'Pending',
            priority: newPriority ? 'High' : 'Low',
            description: newContent,
            lat: 0,
            lng: 0
        });

        if (res.success && res.id) {
            const newCirc: Circular = {
                id: res.id,
                title: newTitle,
                content: newContent,
                issuer: profile?.name || 'Authority',
                priority: newPriority,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            setCirculars([newCirc, ...circulars]);
            setIsComposing(false);
            setNewTitle("");
            setNewContent("");
            setNewPriority(false);
        } else {
            alert("Error saving circular to database.");
        }
        setIsSaving(false);
    };

    const filtered = circulars.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) || 
        c.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-gov-blue/20">
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 animate-in fade-in"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            <AdminSidebar 
                userProfile={profile} 
                onLogoutAction={handleLogout}
                isOpen={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gov-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="lg:hidden p-4 md:p-6 flex items-center justify-between border-b border-white backdrop-blur-xl bg-white/50 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gov-blue text-white flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Official Circulars</h1>
                    </div>
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 p-4 md:p-8 xl:p-12 relative z-10 space-y-8 overflow-y-auto">
                    <div className="hidden lg:flex justify-between items-end bg-white/40 p-6 rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1.5 animate-pulse">
                                    <AlertTriangle className="w-3 h-3" /> Priority Comms
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-balance">
                                Official Circulars
                            </h1>
                            <p className="text-sm font-bold text-slate-500">View directives and internal governance updates</p>
                        </div>

                        <button 
                            onClick={() => setIsComposing(true)}
                            className="h-12 px-6 bg-slate-900 hover:bg-gov-blue text-white transition-all rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:shadow-gov-blue/20 hover:-translate-y-0.5 active:scale-95 group border border-white/10"
                        >
                            <MailPlus size={16} className="group-hover:rotate-12 transition-transform" />
                            Compose New
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center gap-4">
                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input 
                                    type="text" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search directives by keyword or ID..."
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-gov-blue/5 focus:bg-white placeholder:text-slate-400 transition-all font-sans"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {isLoading ? (
                                <div className="p-12 flex flex-col items-center text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <span className="font-bold text-sm tracking-widest uppercase">Syncing Database...</span>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 font-bold">No circulars found.</div>
                            ) : filtered.map((circular) => (
                                <div 
                                    key={circular.id} 
                                    onClick={() => setSelectedCircular(circular)}
                                    className="p-6 md:p-8 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex gap-6 items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${circular.priority ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                                            {circular.priority ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                                                    #{circular.id}
                                                </span>
                                                {circular.priority && (
                                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 bg-red-100 rounded-md">Priority 1</span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-gov-blue transition-colors">
                                                {circular.title}
                                            </h3>
                                            <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                                                <span>{circular.issuer}</span>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    {circular.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="self-end md:self-center px-6 py-2.5 rounded-xl border-2 border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:border-gov-blue group-hover:text-gov-blue transition-all bg-white">
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Read Circular Modal */}
            {selectedCircular && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedCircular(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selectedCircular.priority ? 'bg-red-50 text-red-500' : 'bg-gov-blue/10 text-gov-blue'}`}>
                                    {selectedCircular.priority ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                            #{selectedCircular.id}
                                        </span>
                                        {selectedCircular.priority && (
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-0 bg-red-100 rounded-md">Priority</span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 leading-tight pr-8">{selectedCircular.title}</h2>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCircular(null)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto">
                            <div className="flex items-center gap-6 text-sm font-bold text-slate-500 mb-8 pb-6 border-b border-slate-100">
                                <div><span className="text-slate-400 block text-[10px] uppercase font-black tracking-widest">Issuer</span> {selectedCircular.issuer}</div>
                                <div><span className="text-slate-400 block text-[10px] uppercase font-black tracking-widest">Date</span> {selectedCircular.date}</div>
                            </div>
                            <div className="prose prose-slate max-w-none text-slate-700 font-medium whitespace-pre-wrap">
                                {selectedCircular.content || "No detailed content provided for this circular."}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedCircular(null)}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Close Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compose Circular Modal */}
            {isComposing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsComposing(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                    <MailPlus className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Compose Circular</h2>
                            </div>
                            <button 
                                onClick={() => setIsComposing(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleComposeSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Subject Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-gov-blue/10 focus:border-gov-blue outline-none transition-all"
                                        placeholder="Enter subject..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Message Body</label>
                                    <textarea 
                                        required
                                        rows={6}
                                        value={newContent}
                                        onChange={e => setNewContent(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 focus:ring-4 focus:ring-gov-blue/10 focus:border-gov-blue outline-none transition-all resize-none"
                                        placeholder="Type directive content here..."
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-12 h-6 rounded-full border-2 transition-all relative flex items-center ${newPriority ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
                                        <div className={`w-4 h-4 rounded-full transition-all absolute top-1/2 -translate-y-1/2 shadow-sm ${newPriority ? 'bg-red-500 right-1' : 'bg-slate-300 left-1'}`} />
                                    </div>
                                    <input 
                                        type="checkbox"
                                        className="hidden"
                                        checked={newPriority}
                                        onChange={e => setNewPriority(e.target.checked)}
                                    />
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                        Mark as Priority Communication
                                    </span>
                                </label>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsComposing(false)}
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gov-blue transition-colors flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Publish Circular
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
