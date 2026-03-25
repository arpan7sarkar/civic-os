"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, RefreshCw, Lock, ChevronLeft, Building2 } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const CAPABILITIES = [
    {
        title: "Secure AI Identity",
        desc: "India Stack integrated verification for total security and privacy.",
        icon: Shield,
        color: "from-emerald-400 to-teal-500"
    },
    {
        title: "Real-time Orchestration",
        desc: "Automated issue tracking and department routing with zero latency.",
        icon: RefreshCw,
        color: "from-blue-400 to-indigo-500"
    },
    {
        title: "DPDP Compliant",
        desc: "National data protection standards ensuring citizen privacy at every node.",
        icon: Lock,
        color: "from-amber-400 to-orange-500"
    }
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const [activeCapability, setActiveCapability] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCapability((prev) => (prev + 1) % CAPABILITIES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen lg:h-screen bg-white flex flex-col lg:overflow-hidden selection:bg-teal-100 selection:text-gov-blue">
            <header className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 shrink-0 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="relative group overflow-hidden rounded-xl">
                        <Image 
                            src="/logo1.png" 
                            alt="CivicOS Logo" 
                            width={40} 
                            height={40} 
                            priority
                            className="object-contain group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gov-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-none">CivicOS</span>
                        <span className="text-[10px] font-bold text-gov-blue uppercase tracking-widest mt-0.5">National Infrastructure</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="group relative py-2 px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Home</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gov-blue transition-all group-hover:w-full" />
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50/50">
                {/* Capabilities Side Panel (Desktop only) */}
                <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a] relative overflow-hidden items-center justify-center p-16">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
                    
                    <div className="relative z-10 w-full max-w-md">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 mb-16"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                                Official National Gateway
                            </div>
                            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">Empowering a Smarter, Faster Nation.</h2>
                        </motion.div>

                        <div className="relative h-[240px] perspective-1000">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCapability}
                                    initial={{ opacity: 0, x: 20, rotateY: 5 }}
                                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                    exit={{ opacity: 0, x: -20, rotateY: -5 }}
                                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className="absolute inset-0 p-8 glass-dark rounded-[2.5rem] border border-white/10 flex flex-col justify-between"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                        backdropFilter: 'blur(40px)',
                                    }}
                                >
                                    <div className={`w-16 h-16 bg-gradient-to-br ${CAPABILITIES[activeCapability].color} rounded-2xl flex items-center justify-center shadow-lg shadow-black/20`}>
                                        {(() => {
                                            const Icon = CAPABILITIES[activeCapability].icon;
                                            return <Icon className="w-8 h-8 text-white" />;
                                        })()}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{CAPABILITIES[activeCapability].title}</h4>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{CAPABILITIES[activeCapability].desc}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Indicators */}
                        <div className="flex gap-2 mt-8 px-2">
                            {CAPABILITIES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveCapability(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeCapability ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" 
                    />
                </div>

                {/* Login Form Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white lg:bg-transparent">
                    <div className="min-h-full flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16">
                        <div className="w-full max-w-[480px]">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative"
                            >
                                    <div className="p-8 md:p-12 relative z-10">
                                        <div className="text-center mb-10">
                                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter">{title}</h1>
                                            <p className="text-slate-500 text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] opacity-60 leading-relaxed">{subtitle}</p>
                                        </div>
                                        {children}
                                    </div>

                                    {/* Feature Highlights (Visual Balance) */}
                                    <div className="bg-slate-50/80 border-t border-slate-100 p-6 flex justify-center gap-6">
                                        {[
                                            { label: "Instant Access", icon: RefreshCw },
                                            { label: "No Passwords", icon: Lock },
                                            { label: "India Stack", icon: Shield }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                                                <item.icon className="w-3 h-3 group-hover:text-gov-blue" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                            </motion.div>
                            
                            <div className="mt-10 text-center space-y-2 group">
                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.25em] transition-colors group-hover:text-slate-400">
                                    National Data Gateway • Powered by India Stack
                                </p>
                                <div className="h-0.5 w-8 bg-slate-200 mx-auto transition-all group-hover:w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
