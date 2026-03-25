"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiInformationCircle, HiExclamationCircle } from "react-icons/hi";
import { getLiveActivityAction } from "@/app/actions/grievance";

export default function LiveActivityStrip() {
    const [activities, setActivities] = useState<{ text: string, type: 'fixed' | 'reported' | 'critical' }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchActivity = async () => {
            const res = await getLiveActivityAction();
            if (res.success && res.activity) {
                // Map real data to color-coded signals
                const mapped = res.activity.map((text: string) => {
                    if (text.toLowerCase().includes('fixed') || text.toLowerCase().includes('resolved')) {
                        return { text, type: 'fixed' as const };
                    }
                    if (text.toLowerCase().includes('critical') || text.toLowerCase().includes('alert')) {
                        return { text, type: 'critical' as const };
                    }
                    return { text, type: 'reported' as const };
                });
                setActivities(mapped);
            }
        };
        fetchActivity();
        const interval = setInterval(fetchActivity, 300000); // Poll every 5 minutes to protect backend limits
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activities.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 6000); 
        return () => clearInterval(timer);
    }, [activities]);

    if (activities.length === 0) return null;

    // Safety check: ensure index is always valid for the CURRENT activities array
    const safeIndex = currentIndex >= activities.length ? 0 : currentIndex;
    const current = activities[safeIndex];

    const getIcon = () => {
        if (!current) return <HiInformationCircle className="text-blue-500 w-4 h-4" />;
        switch (current.type) {
            case 'fixed': return <HiCheckCircle className="text-emerald-500 w-4 h-4" />;
            case 'critical': return <HiExclamationCircle className="text-rose-500 w-4 h-4" />;
            default: return <HiInformationCircle className="text-blue-500 w-4 h-4" />;
        }
    };

    const getStatusColor = () => {
        if (!current) return 'bg-blue-50 text-blue-700 border-blue-100';
        switch (current.type) {
            case 'fixed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'critical': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    return (
        <div className="w-full bg-white/60 backdrop-blur-xl border-y border-slate-100 py-3 overflow-hidden sticky top-[72px] z-40 shadow-sm">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="flex items-center gap-6 h-6">
                    <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shrink-0">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Live Pulse
                    </span>
                    
                    <div className="relative flex-1 h-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-3"
                            >
                                <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor()}`}>
                                    {getIcon()}
                                    {current?.type === 'fixed' ? 'Resolved' : current?.type === 'critical' ? 'Urgent' : 'Updates'}
                                </div>
                                <p className="text-sm font-bold text-slate-800 truncate">
                                    {current?.text}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
