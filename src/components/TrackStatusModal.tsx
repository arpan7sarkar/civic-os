"use client";

import { useState } from "react";
import { HiOutlineSearch, HiX, HiOutlineInformationCircle } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface TrackStatusModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export default function TrackStatusModal({ isOpen, onCloseAction }: TrackStatusModalProps) {
    const [complaintId, setComplaintId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complaintId.trim()) return;

        setIsLoading(true);
        // Simulate a lookup or redirect to a public tracking page
        // For now, redirecting to dashboard with the ID as a param
        setTimeout(() => {
            setIsLoading(false);
            router.push(`/dashboard?track=${complaintId.trim()}`);
            onCloseAction();
        }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseAction}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] p-10 overflow-hidden"
                    >
                        {/* Abstract Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gov-blue/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-slate-900 text-2xl font-black tracking-tight mb-2">Track Your Request</h3>
                                <p className="text-slate-500 text-sm font-medium">Enter your unique 12-digit complaint ID</p>
                            </div>
                            <button 
                                onClick={onCloseAction}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <HiOutlineSearch className="w-6 h-6" />
                                </div>
                                <input 
                                    type="text"
                                    value={complaintId}
                                    onChange={(e) => setComplaintId(e.target.value)}
                                    placeholder="e.g. CIV-2024-890123"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-gov-blue/30 focus:bg-white transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <HiOutlineInformationCircle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-800 text-xs font-medium leading-relaxed">
                                    Public tracking doesn't require login. You'll see the current status, assigned officer, and estimated resolution time.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-slate-200 hover:bg-gov-blue transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying System...
                                    </>
                                ) : (
                                    "Check Status Now"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
