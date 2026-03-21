"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Search, PlayCircle, LayoutGrid, LogOut, Menu, X } from "lucide-react";
import { generateDemoData } from "@/lib/store";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAuthPage = pathname?.startsWith('/auth');

    useEffect(() => {
        // Prevent scroll when mobile menu is open
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

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
        <>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Image 
                            alt="CivicOS Logo" 
                            className="h-10 md:h-12 w-auto" 
                            src="/logo1.png" 
                            width={48}
                            height={48}
                        />
                        <div className="hidden sm:block border-l border-slate-300 h-8 mx-2"></div>
                        <Link href="/" className="flex flex-col leading-none">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Govt. of India</span>
                            <span className="text-gov-blue text-sm md:text-xl font-extrabold tracking-tight">CivicOS National</span>
                        </Link>
                    </div>
                </div>

                {/* Navigation Links */}
                {!isAuthPage && (
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/dashboard" className="text-sm font-semibold text-gov-blue hover:text-primary transition-colors">Home</Link>
                        {isLoggedIn && (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
                                <Link href="/map" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Spatial Map</Link>
                            </>
                        )}
                        <a href="#services" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">Services</a>
                        <a href="#footer" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">Help</a>
                    </nav>
                )}

                {/* Auth Buttons */}
                <div className="flex items-center gap-4 md:gap-6 min-w-fit">
                    {isLoading ? (
                        <div className="w-16 md:w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
                    ) : isLoggedIn ? (
                        <>
                            {!isAuthPage && (
                                <Link href="/dashboard" className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gov-blue/5 text-gov-blue text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue/10 transition-[background-color,transform]">
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            )}
                            {!isAuthPage && (
                                <button 
                                    onClick={handleLogout}
                                    aria-label="Logout from your account"
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 border border-red-100 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-[background-color,transform]"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-6">
                            {!isAuthPage && (
                                <>
                                    <Link href="/auth" className="text-slate-600 font-bold hover:text-primary transition-colors">Login</Link>
                                    <Link href="/auth" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 shadow-md shadow-primary/20 transition-[filter,box-shadow,transform]">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Toggle - Hide on Auth page */}
                    {!isLoading && !isAuthPage && (
                        <button 
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    )}
                    
                    {isAuthPage && (
                        <Link href="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors flex items-center gap-1">
                            <X className="w-3 h-3" /> Back to Home
                        </Link>
                    )}
                </div>
            </div>
        </header>

        {/* Mobile Navigation Overlay - Relocated for clean layering and solid background */}
        <div 
            className={`fixed inset-0 z-[100] bg-white transition-all duration-500 ease-out lg:hidden ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}
        >
            <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <Image alt="MCD Logo" src="/logo1.png" width={36} height={36} className="object-contain" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Govt. of India</span>
                            <span className="text-gov-blue text-lg font-black tracking-tight">CivicOS National</span>
                        </div>
                    </div>
                    <button 
                        aria-label="Close navigation menu"
                        className="p-3 text-slate-400 hover:text-slate-900 border border-slate-100 rounded-2xl transition-all" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <nav className="flex flex-col items-center gap-10">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-gov-blue hover:scale-105 transition-transform">Home</Link>
                        {isLoggedIn && (
                            <>
                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:scale-105 transition-transform">Dashboard</Link>
                                <Link href="/map" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:scale-105 transition-transform">Spatial Map</Link>
                            </>
                        )}
                        <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:scale-105 transition-transform">Services</a>
                        <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:scale-105 transition-transform">Help</a>
                    </nav>
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/20">
                    {!isLoggedIn ? (
                        <div className="flex flex-col gap-4">
                            <Link 
                                href="/auth" 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="flex items-center justify-center py-5 text-lg font-black text-gov-blue border-2 border-gov-blue/20 bg-white rounded-3xl hover:bg-slate-50 transition-[background-color,transform]"
                            >
                                Sign In
                            </Link>
                            <Link 
                                href="/auth" 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="flex items-center justify-center py-5 text-lg font-black text-white bg-primary rounded-3xl shadow-xl shadow-primary/30 hover:brightness-110 transition-[filter,box-shadow,transform]"
                            >
                                Get Started
                            </Link>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                            className="w-full flex items-center justify-center gap-3 py-6 text-red-500 font-black uppercase tracking-[0.2em] text-xs border-2 border-red-50 bg-white rounded-3xl hover:bg-red-50 transition-[background-color,transform]"
                        >
                            <LogOut className="w-6 h-6" />
                            Logout CivicOS
                        </button>
                    )}
                    <p className="mt-8 text-center text-[10px] text-slate-300 font-black tracking-widest uppercase">
                        Ministry of Housing and Urban Affairs
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
