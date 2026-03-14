"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { analyzeIssueAction } from "@/app/actions/ai";
import { getCurrentUserAction } from "@/app/actions/auth";
import { saveComplaint } from "@/lib/store";
import { AnalysisResult, Complaint } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Hero() {
    const [description, setDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('anonymous');
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { success, user } = await getCurrentUserAction();
            if (success && user) {
                setCurrentUserId(user.$id);
            }
        };
        checkUser();
    }, []);

    const handleAnalyze = async () => {
        if (!description.trim()) return;

        // Session Protection for AI Feature
        if (currentUserId === 'anonymous') {
            console.warn("[HERO] Unauthorized AI access attempt. Redirecting to login.");
            router.push('/auth');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);
        setTicketId(null);

        try {
            const analysis = await analyzeIssueAction(description);
            setResult(analysis);

            const newTicketId = `CIV-${Math.floor(1000 + Math.random() * 9000)}`;
            setTicketId(newTicketId);

            const newComplaint: Complaint = {
                id: newTicketId,
                description,
                category: analysis.category,
                priority: analysis.priority,
                department: analysis.department,
                lat: 28.6139 + (Math.random() - 0.5) * 0.1, // Random Delhi coords
                lng: 77.2090 + (Math.random() - 0.5) * 0.1,
                status: 'Pending',
                assignedTo: 'Officer Unassigned',
                createdAt: new Date().toISOString(),
                ward: 'Ward 104 (Lajpat Nagar)',
                userId: currentUserId
            };

            saveComplaint(newComplaint);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-20 lg:py-32">
            {/* Soft Focus Infrastructure Background */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAd8OJNn3czIeTEWeXqfltC1a2ihcXeoFdbdPSN3vP1N7H9SYZUR8T9DQ4OXmcd3HPj3o8O_utVtE-DOBOJbrlzTn8GoskcKq52MbxW3vxE21lTx8TRX1O35hKl0bkrj1jZW9rFpGZtq4oLHcHqdA79KoYGyzq2Wz2rpdavBWtzub7j3pp0eJ6ePLENi41NAfq02zRcb_OEACiYhPQPrXMYcbHsDPDnW4xQNaRw3lO_vCJTbR6_LR11ZMBPpiQMggGRJv6rt_0b-w')" }}
            />
            
            <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h1 className="text-slate-900 text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                        A Smarter, Cleaner Delhi for Every Citizen
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
                        Report civic issues, track resolutions, and connect directly with MCD departments in real-time. Together, we build a better city.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => router.push(currentUserId === 'anonymous' ? '/auth' : '/dashboard')}
                            className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Report an Issue
                        </button>
                        <button 
                            onClick={() => router.push(currentUserId === 'anonymous' ? '/auth' : '/dashboard')}
                            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-slate-300 text-slate-700 text-lg font-bold rounded-lg hover:bg-white transition-all"
                        >
                            Track Complaint Status
                        </button>
                    </div>
                </div>

                {/* AI Quick-Report Component */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gov-blue to-primary opacity-50" />
                    
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img src="/logo1.png" alt="MCD Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-bold leading-none">AI Quick-Report</h3>
                                <p className="text-xs text-slate-500 mt-1">Resolution Optimized</p>
                            </div>
                        </div>

                        {!ticketId ? (
                            <>
                                <div className="relative mb-6">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell us what's wrong? e.g., 'Garbage pile at Lajpat Nagar Metro Station'"
                                        className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-slate-700"
                                    />
                                    <div className="absolute right-4 bottom-4 flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-gov-blue transition-colors">
                                            <Search className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">NLP Analysis</span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">Priority Engine</span>
                                    </div>
                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !description.trim()}
                                        className="flex items-center gap-2 px-6 py-3 bg-gov-blue text-white font-bold rounded-lg hover:brightness-110 shadow-md transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 fill-current" />
                                        )}
                                        {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-6 bg-green-50 border border-green-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Complaint Logged</span>
                                    </div>
                                    <span className="text-xs font-black text-green-800">{ticketId}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                        <p className="text-xs font-black text-gov-blue truncate">{result?.category}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                                        <p className="text-xs font-black text-gov-blue">{result?.priority}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dept</p>
                                        <p className="text-xs font-black text-gov-blue truncate">{result?.department}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setTicketId(null); setDescription(""); setResult(null); }}
                                    className="w-full py-2 text-xs font-bold text-green-700 uppercase tracking-widest hover:underline"
                                >
                                    Report Another Issue
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
