"use client";

import Link from "next/link";
import { User, Search, PlayCircle } from "lucide-react";
import { generateDemoData } from "@/lib/store";

export default function Header() {
    const handleDemoMode = () => {
        generateDemoData();
        alert("Demo data generated! Refreshing page...");
        window.location.reload();
    };

    return (
        <header className="w-full flex flex-col">
            {/* Top Official Bar */}
            <div className="w-full bg-[#f1f5f9] py-1 border-b border-gray-200">
                <div className="container mx-auto px-4 flex justify-between items-center text-[10px] md:text-xs font-medium text-mcd-slate">
                    <span>GOVERNMENT OF NCT OF DELHI</span>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-mcd-navy transition-colors">Screen Reader Access</Link>
                        <Link href="#" className="hover:text-mcd-navy transition-colors">Hindi</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <nav className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Logo Placeholder */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-mcd-navy rounded flex items-center justify-center text-white font-bold text-xl">
                            MCD
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-mcd-navy leading-tight tracking-tight">CivicOS</span>
                            <span className="text-[10px] text-mcd-slate font-medium uppercase tracking-widest">Digital India | Smart City</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-semibold text-mcd-navy border-b-2 border-mcd-navy pb-1">Home</Link>
                        <Link href="/dashboard" className="text-sm font-medium text-mcd-slate hover:text-mcd-navy transition-colors">Dashboard</Link>
                        <Link href="/map" className="text-sm font-medium text-mcd-slate hover:text-mcd-navy transition-colors">Spatial Map</Link>
                        <Link href="/verification" className="text-sm font-medium text-mcd-slate hover:text-mcd-navy transition-colors">Verification</Link>
                        <Link href="#" className="text-sm font-medium text-mcd-slate hover:text-mcd-navy transition-colors">Help</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDemoMode}
                            className="hidden md:flex items-center gap-2 px-3 py-2 bg-mcd-navy/5 text-mcd-navy text-xs font-black rounded-lg hover:bg-mcd-navy/10 transition-all uppercase tracking-widest"
                        >
                            <PlayCircle className="w-4 h-4" />
                            Demo Mode
                        </button>

                        <button className="p-2 text-mcd-slate hover:text-mcd-navy transition-colors md:hidden">
                            <Search className="w-5 h-5" />
                        </button>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 border-2 border-mcd-navy text-mcd-navy text-sm font-bold rounded-md hover:bg-mcd-navy hover:text-white transition-all duration-200"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
