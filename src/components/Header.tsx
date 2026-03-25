"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineUser, HiOutlineSearch, HiOutlineViewGrid, HiOutlineLogout, HiOutlineMenuAlt3, HiX, HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { generateDemoData } from "@/lib/store";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import TrackStatusModal from "./TrackStatusModal";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const isAuthPage = pathname?.startsWith('/auth');

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const checkSession = async () => {
            const { success } = await getCurrentUserAction();
            if (success) {
                setIsLoggedIn(true);
            } else {
                const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('a_session_'));
                setIsLoggedIn(hasCookie);
            }
            setIsLoading(false);
        };
        checkSession();

        // Initialize theme - Default to light
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

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

    return (
        <>
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Image 
                                alt="CivicOS Logo" 
                                className="h-10 w-auto group-hover:scale-110 transition-transform" 
                                src="/logo1.png" 
                                width={40}
                                height={40}
                            />
                            <div className="absolute -inset-2 bg-gov-blue/5 rounded-full scale-0 group-hover:scale-100 transition-transform -z-10" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">National Hub</span>
                            <span className="text-gov-blue text-xl font-black tracking-tighter leading-none">CivicOS</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                {!isAuthPage && (
                    <nav className="hidden lg:flex items-center gap-10">
                        <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-gov-blue pb-1">Home</Link>
                        <button 
                            onClick={() => setIsTrackModalOpen(true)}
                            aria-label="Track your issue status"
                            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors"
                        >
                            Track Status
                        </button>
                        <a href="#services" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors">Services</a>
                        <a href="#footer" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors">Emergency</a>
                    </nav>
                )}

                {/* Auth Buttons */}
                <div className="flex items-center gap-4 min-w-fit">
                    {isLoading ? (
                        <div className="w-32 h-10 bg-slate-50 animate-pulse rounded-xl" />
                    ) : isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-gov-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-gov-blue/20 transition-all">
                                <HiOutlineViewGrid className="w-4 h-4" />
                                Dash
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <HiOutlineLogout className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/auth" className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-gov-blue transition-colors">
                                Sign In
                            </Link>
                            <Link href="/auth" className="px-6 py-2.5 bg-slate-900 border border-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue hover:border-gov-blue transition-all shadow-lg shadow-slate-200">
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    {!isAuthPage && (
                        <button 
                            className="lg:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <HiX className="w-7 h-7" /> : <HiOutlineMenuAlt3 className="w-7 h-7" />}
                        </button>
                    )}
                </div>
            </div>
        </header>

        <TrackStatusModal isOpen={isTrackModalOpen} onCloseAction={() => setIsTrackModalOpen(false)} />

        {/* Mobile Navigation Overlay */}
        <div 
            className={`fixed inset-0 z-[100] bg-white transition-all duration-500 ease-out lg:hidden ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}
        >
            <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <Image alt="CivicOS Logo" src="/logo1.png" width={36} height={36} className="object-contain" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Govt. of India</span>
                            <span className="text-gov-blue text-lg font-black tracking-tight">CivicOS</span>
                        </div>
                    </div>
                    <button 
                        aria-label="Close navigation menu"
                        className="p-3 text-slate-400 hover:text-slate-900 border border-slate-100 rounded-2xl transition-all" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <HiX className="w-7 h-7" />
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <nav className="flex flex-col items-center gap-10">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-gov-blue">Home</Link>
                        {isLoggedIn && (
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-slate-900">Dashboard</Link>
                        )}
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); setIsTrackModalOpen(true); }}
                            className="text-3xl font-black text-slate-400"
                        >
                            Track Status
                        </button>
                        <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-slate-400">Services</a>
                    </nav>
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/20">
                    {!isLoggedIn ? (
                        <div className="flex flex-col gap-4">
                            <Link 
                                href="/auth" 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="flex items-center justify-center py-5 text-lg font-black text-gov-blue border-2 border-gov-blue/20 bg-white rounded-3xl"
                            >
                                Sign In
                            </Link>
                            <Link 
                                href="/auth" 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="flex items-center justify-center py-5 text-lg font-black text-white bg-slate-900 rounded-3xl shadow-xl shadow-slate-200"
                            >
                                Register
                            </Link>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                            className="w-full flex items-center justify-center gap-3 py-6 text-red-500 font-black uppercase tracking-[0.2em] text-xs border-2 border-red-50 bg-white rounded-3xl"
                        >
                            <HiOutlineLogout className="w-6 h-6" />
                            Logout System
                        </button>
                    )}
                    <p className="mt-8 text-center text-[10px] text-slate-300 font-black tracking-widest uppercase">
                        Unified National Digital Infrastructure
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
