"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Search, PlayCircle, LayoutGrid, LogOut } from "lucide-react";
import { generateDemoData } from "@/lib/store";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            // Priority 1: Check server action (most reliable)
            const { success } = await getCurrentUserAction();
            if (success) {
                setIsLoggedIn(true);
            } else {
                // Priority 2: client-side cookie fallback (faster for hydration)
                const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('a_session_'));
                setIsLoggedIn(hasCookie);
            }
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutAction();
            setIsLoggedIn(false);
            router.push("/");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleDemoMode = () => {
        generateDemoData();
        alert("Demo data generated! Refreshing page...");
        window.location.reload();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img 
                            alt="MCD CivicOS Logo" 
                            className="h-12 w-auto" 
                            src="/logo1.png" 
                        />
                        <div className="hidden sm:block border-l border-slate-300 h-8 mx-2"></div>
                        <Link href="/" className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Govt. of NCT Delhi</span>
                            <h1 className="text-gov-blue text-xl font-extrabold tracking-tight">MCD CivicOS</h1>
                        </Link>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/" className="text-sm font-semibold text-gov-blue hover:text-primary transition-colors">Home</Link>
                    {isLoggedIn && (
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
                    )}
                    <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Services</Link>
                    <Link href="/map" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Spatial Map</Link>
                    <Link href="/help" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Help</Link>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-6">
                    {isLoading ? (
                        <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
                    ) : isLoggedIn ? (
                        <>
                            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-gov-blue/5 text-gov-blue text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue/10 transition-all">
                                <LayoutGrid className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="hidden md:flex gap-6">
                                <Link href="/auth" className="text-slate-600 font-bold hover:text-primary transition-colors">Login</Link>
                            </div>
                            <Link href="/auth" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 shadow-md shadow-primary/20 transition-all">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
