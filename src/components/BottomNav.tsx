"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
    Home, 
    Map, 
    Plus, 
    LayoutDashboard, 
    User, 
    LogOut,
    Sparkles
} from "lucide-react";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { success } = await getCurrentUserAction();
            setIsLoggedIn(success);
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutAction();
            setIsLoggedIn(false);
            router.push("/");
            // No reload needed if using standard Next.js navigation, but safe for state reset
            setTimeout(() => window.location.reload(), 100);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = [
        { name: "Home", icon: Home, path: "/" },
        { name: "Map", icon: Map, path: "/map", protected: true },
        { name: "Report", icon: Plus, path: "/report", isAction: true },
        { name: "Dash", icon: LayoutDashboard, path: "/dashboard", protected: true },
        { 
            name: isLoggedIn ? "Logout" : "Profile", 
            icon: isLoggedIn ? LogOut : User, 
            path: isLoggedIn ? "/logout" : "/auth",
            protected: false 
        },
    ];

    if (isLoading) return null;

    return (
        <div className="lg:hidden fixed bottom-8 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none">
            <nav className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] rounded-[2.5rem] w-full max-w-[400px] h-20 px-4 md:px-8 flex items-center justify-between relative overflow-hidden">
                {/* Visual Glass Reflection Effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[2.5rem]" />
                
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    
                    if (item.isAction) {
                        return (
                            <Link 
                                key={item.name}
                                href={item.path}
                                className="relative flex flex-col items-center justify-center -mt-4 group no-underline"
                            >
                                <div className="w-14 h-14 bg-gov-blue rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(11,110,109,0.3)] border-2 border-white transition-all group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-95 ring-4 ring-gov-blue/5">
                                    <Icon className="w-7 h-7 text-white stroke-[3px] translate-y-1" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gov-blue mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Report Issue</span>
                            </Link>
                        );
                    }

                    if (item.name === "Logout") {
                        return (
                            <button 
                                key={item.name}
                                onClick={handleLogout}
                                className="flex flex-col items-center justify-center gap-1 transition-all duration-300 relative py-2 text-slate-400 hover:text-red-500 active:scale-90"
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-[0.12em] leading-none mt-1">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link 
                            key={item.name}
                            href={(item.protected && !isLoggedIn) ? "/auth" : item.path}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative py-2 ${isActive ? 'text-gov-blue scale-110' : 'text-slate-400 hover:text-slate-600 active:scale-90'}`}
                        >
                            {isActive && (
                                <div className="absolute -top-1.5 w-1.5 h-1.5 bg-gov-blue rounded-full shadow-[0_0_8px_rgba(11,110,109,0.5)]" />
                            )}
                            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.12em] leading-none mt-1">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
