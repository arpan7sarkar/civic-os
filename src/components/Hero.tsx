"use client";

import { useState, useEffect, useMemo } from "react";
import { HiSparkles, HiLightningBolt, HiBadgeCheck, HiShieldCheck, HiOutlineSearch, HiOutlineRefresh, HiCheckCircle, HiOutlineClock, HiOutlineOfficeBuilding, HiOutlineTag, HiOutlineExclamationCircle, HiOutlineTrash, HiOutlineLightBulb, HiOutlineShieldExclamation, HiOutlineStop } from "react-icons/hi";
import { FiTarget, FiArrowRight, FiDroplet, FiMapPin } from "react-icons/fi";
import { analyzeIssueAction } from "@/app/actions/ai";
import { getCurrentUserAction } from "@/app/actions/auth";
import { saveComplaint } from "@/lib/store";
import { AnalysisResult, Complaint } from "@/lib/types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import TrackStatusModal from "./TrackStatusModal";

export default function Hero() {
    const [description, setDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('anonymous');
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    // Typing Simulation States
    const placeholders = useMemo(() => [
        "Garbage overflow in Mumbai (Bandra). Categorizing: Sanitation. Priority: High. Assigned: BMC West.",
        "Pothole on Outer Ring Road (Bengaluru). Categorizing: PWD. Priority: Critical. Assigned: BBMP Division.",
        "Broken streetlight in Kolkata (Salt Lake). Categorizing: Electrical. Priority: Medium. Assigned: CESC/Local Body.",
        "Water supply leakage in Rohini. Categorizing: Jal Board. Priority: High. Assigned: Water Management."
    ], []);
    
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const checkUser = async () => {
            const { success, user } = await getCurrentUserAction();
            if (success && user) {
                setCurrentUserId(user.$id);
            }
        };
        checkUser();
    }, []);

    // Typewriter Effect
    useEffect(() => {
        if (description || isAnalyzing) return;

        const timeout = setTimeout(() => {
            const fullText = placeholders[placeholderIndex];
            
            if (!isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length + 1));
                if (currentText === fullText) {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                setCurrentText(fullText.substring(0, currentText.length - 1));
                if (currentText === "") {
                    setIsDeleting(false);
                    setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
                }
            }
        }, isDeleting ? 15 : 30);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, placeholderIndex, placeholders, description, isAnalyzing]);

    const handleAnalyze = async () => {
        if (!description.trim()) return;

        if (currentUserId === 'anonymous') {
            router.push('/auth');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);
        setTicketId(null);

        try {
            setAiFeedback("Analyzing patterns...");
            const analysis = await analyzeIssueAction(description);
            // Clean emojis from fields
            const cleanString = (s: string) => s.replace(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
            
            const cleanedResult: AnalysisResult = {
                ...analysis,
                category: cleanString(analysis.category),
                department: cleanString(analysis.department)
            };

            setResult(cleanedResult);
            setAiFeedback(`Detected: ${cleanedResult.category} | Priority: ${cleanedResult.priority}`);

            const newTicketId = `CIV-${Math.floor(1000 + Math.random() * 9000)}`;
            setTicketId(newTicketId);

            const newComplaint: Complaint = {
                id: newTicketId,
                description,
                category: cleanedResult.category,
                priority: cleanedResult.priority,
                department: cleanedResult.department,
                lat: 28.6139 + (Math.random() - 0.5) * 0.1, // Delhi centered random coords
                lng: 77.2090 + (Math.random() - 0.5) * 0.1,
                status: 'Pending',
                assignedTo: 'Officer Unassigned',
                createdAt: new Date().toISOString(),
                ward: 'Ward 104 (Local Municipal Zone)',
                userId: currentUserId
            };

            saveComplaint(newComplaint);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getCategoryIcon = (category: string | undefined) => {
        if (!category) return HiOutlineTag;
        const cat = category.toLowerCase();
        if (cat.includes('streetlight')) return HiOutlineLightBulb;
        if (cat.includes('garbage')) return HiOutlineTrash;
        if (cat.includes('water')) return FiDroplet;
        if (cat.includes('road')) return FiMapPin;
        if (cat.includes('encroachment')) return HiOutlineShieldExclamation;
        if (cat.includes('parking')) return HiOutlineStop;
        return HiOutlineTag;
    };

    return (
        <section className="relative overflow-hidden bg-white pt-12 md:pt-20 pb-0 transition-colors duration-500">
            <TrackStatusModal isOpen={isTrackModalOpen} onCloseAction={() => setIsTrackModalOpen(false)} />
            
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd8OJNn3czIeTEWeXqfltC1a2ihcXeoFdbdPSN3vP1N7H9SYZUR8T9DQ4OXmcd3HPj3o8O_utVtE-DOBOJbrlzTn8GoskcKq52MbxW3vxE21lTx8TRX1O35hKl0bkrj1jZW9rFpGZtq4oLHcHqdA79KoYGyzq2Wz2rpdavBWtzub7j3pp0eJ6ePLENi41NAfq02zRcb_OEACiYhPQPrXMYcbHsDPDnW4xQNaRw3lO_vCJTbR6_LR11ZMBPpiQMggGRJv6rt_0b-w"
                    alt="Govt Pattern"
                    className="object-cover object-center"
                    fill
                    priority
                />
            </div>
            
            <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
                <div className="text-center max-w-5xl mx-auto mb-8 md:mb-12">
                    <h1 className="text-slate-900 text-4xl sm:text-7xl md:text-8xl font-[950] leading-[0.95] tracking-tight mb-4 md:mb-8">
                        National Digital <span className="text-gov-blue">Civic Platform.</span>
                    </h1>
                    
                    <p className="text-slate-600 text-base md:text-2xl font-medium leading-relaxed mb-6 md:mb-8 max-w-3xl mx-auto">
                        Unified municipal reporting for the citizens of India. Driven by AI, resolved by Authority.
                    </p>
                </div>

                {/* AI Quick-Report Component - MOVED UP */}
                <motion.div 
                    id="report-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative mb-10"
                >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gov-blue via-primary to-gov-blue" />
                    
                    <div className="p-6 md:p-12">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/80 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-slate-200 shadow-sm shrink-0 transition-all hover:border-gov-blue/30 overflow-hidden relative group/logo">
                                    <div className="absolute inset-0 bg-gov-blue/5 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                    <Image src="/logo1.png" alt="MCD" width={32} height={32} className="object-contain relative z-10 p-1" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-slate-900 text-base md:text-lg font-black tracking-tight leading-none">AI Quick-Report</h2>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Resolution Engine</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gov-blue/5 rounded-xl border border-gov-blue/10">
                                <HiShieldCheck className="text-gov-blue w-4 h-4" />
                                <span className="text-[10px] font-black uppercase text-gov-blue">Govt Verified</span>
                            </div>
                        </div>

                        {!ticketId ? (
                            <div className="space-y-4 md:space-y-6">
                                <div className="relative group">
                                    <textarea
                                        value={description}
                                        onChange={(e) => {
                                            setDescription(e.target.value);
                                            if (e.target.value.length > 5 && !aiFeedback) {
                                                setAiFeedback("AI is thinking...");
                                            } else if (e.target.value.length <= 5) {
                                                setAiFeedback(null);
                                            }
                                        }}
                                        placeholder=""
                                        aria-label="Describe the civic issue you want to report"
                                        className="w-full min-h-[120px] md:min-h-[160px] p-5 md:p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue focus:bg-white transition-all resize-none text-slate-800 text-base md:text-lg font-medium"
                                    />
                                    
                                    <AnimatePresence>
                                        {!description && isMounted && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute left-6 top-6 right-6 pointer-events-none max-h-[140px] md:max-h-[180px] overflow-hidden"
                                            >
                                                <span className="text-slate-400 text-[15px] sm:text-base md:text-lg font-medium leading-relaxed break-words inline-block border-r-2 border-gov-blue/0 animate-cursor pr-1">{currentText}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* AI Real-time Feedback */}
                                    {aiFeedback && !isAnalyzing && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute left-4 md:left-6 bottom-4 md:bottom-6 flex items-center gap-2 max-w-[calc(100%-48px)]"
                                        >
                                            <div className="flex items-center gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-gov-blue/5 border border-gov-blue/20 rounded-lg backdrop-blur-sm">
                                                <div className="w-1.5 h-1.5 bg-gov-blue rounded-full animate-ping" />
                                                <span className="text-[7px] md:text-[9px] font-black uppercase text-gov-blue tracking-wider truncate">{aiFeedback}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="absolute right-6 bottom-6 flex items-center gap-3">
                                        <HiOutlineSearch className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                                    <div className="hidden md:flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                                                <HiLightningBolt className="text-orange-500 w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Speed</span>
                                                <span className="text-xs font-bold text-slate-700">Instant Routing</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-8 bg-slate-100 hidden sm:block" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                                <FiTarget className="text-blue-500 w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Precision</span>
                                                <span className="text-xs font-bold text-slate-700">AI Triage</span>
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !description.trim()}
                                        className="w-full md:w-auto h-14 md:h-16 flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-gov-blue shadow-lg transition-all disabled:opacity-30"
                                    >
                                        {isAnalyzing ? (
                                            <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <HiSparkles className="w-5 h-5 text-gov-blue" />
                                        )}
                                        {isAnalyzing ? "AI is Analyzing..." : "Analyze & Submit"}
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                             <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 md:p-8 bg-emerald-50 border-2 border-emerald-100 rounded-3xl"
                            >
                                <div className="flex items-center justify-between mb-6 md:mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                                            <HiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <span className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-0.5 md:mb-1">Authenticated Entry</span>
                                            <span className="text-base md:text-xl font-black text-slate-900">Issue Logged Successfully</span>
                                        </div>
                                    </div>
                                    <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-emerald-100 shadow-sm">
                                        <span className="text-sm md:text-lg font-mono font-black text-emerald-700">{ticketId}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                                    <div className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-2xl border border-emerald-100/50 flex flex-col items-center">
                                        <HiOutlineOfficeBuilding className="w-4 h-4 text-emerald-500 mb-1" />
                                        <p className="text-[8px] md:text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 text-center">Department</p>
                                        <p className="text-[10px] md:text-[11px] font-black text-slate-800 text-center line-clamp-2 w-full leading-tight">{result?.department}</p>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-2xl border border-emerald-100/50 flex flex-col items-center">
                                        <HiOutlineExclamationCircle className="w-4 h-4 text-emerald-500 mb-1" />
                                        <p className="text-[8px] md:text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 text-center">Priority</p>
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                result?.priority === 'High' ? 'bg-red-50 text-red-600' : 
                                                result?.priority === 'Critical' ? 'bg-rose-500 text-white' :
                                                'bg-gov-blue/5 text-gov-blue'
                                            }`}>
                                                {result?.priority}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-2xl border border-emerald-100/50 flex flex-col items-center">
                                        {(() => {
                                            const Icon = getCategoryIcon(result?.category);
                                            return <Icon className="w-4 h-4 text-emerald-500 mb-1" />;
                                        })()}
                                        <p className="text-[8px] md:text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 text-center">Category</p>
                                        <p className="text-[10px] md:text-[11px] font-black text-slate-800 text-center line-clamp-2 w-full leading-tight">{result?.category}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button 
                                        onClick={() => router.push('/dashboard')}
                                        className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                    >
                                        Track Progress
                                    </button>
                                    <button 
                                        onClick={() => { setTicketId(null); setDescription(""); setResult(null); setAiFeedback(null); }}
                                        className="flex-1 py-4 text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:bg-white/50 rounded-2xl transition-all"
                                    >
                                        New Report
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-12">
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(37, 99, 235, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(currentUserId === 'anonymous' ? '/auth' : '/dashboard')}
                        aria-label="Report a new civic issue and get it fixed"
                        className="group relative w-full md:w-auto px-12 h-14 md:h-20 bg-gov-blue text-white text-lg md:text-xl font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] flex items-center justify-center gap-3 transition-all min-w-[280px] focus-visible:ring-4 focus-visible:ring-gov-blue/50 outline-none"
                    >
                        <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        Report Issue
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                    </motion.button>
                    
                    <motion.button 
                        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                        onClick={() => setIsTrackModalOpen(true)}
                        aria-label="Track the status of your reported issues"
                        className="w-full md:w-auto px-12 h-14 md:h-20 bg-transparent border-2 border-slate-200 text-slate-700 text-lg md:text-xl font-black rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-outfit min-w-[240px] focus-visible:ring-4 focus-visible:ring-slate-200 outline-none"
                    >
                        Track Status
                    </motion.button>
                </div>
            </div>
        </section>
    );
}
