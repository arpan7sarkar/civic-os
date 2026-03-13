"use client";

import { ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-8 py-6 flex justify-between items-center bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gov-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gov-blue/20">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tight">CivicOS</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h1 className="text-2xl font-black text-slate-900 mb-2">{title}</h1>
                                <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-10 flex flex-col items-center gap-6">
                <p className="text-[9px] text-slate-400 font-medium opacity-60">
                    © 2024 CivicOS - Municipal Corporation Digital Infrastructure. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
