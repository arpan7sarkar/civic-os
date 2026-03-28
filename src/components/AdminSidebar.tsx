"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    ClipboardList, 
    Map as MapIcon, 
    ShieldAlert, 
    Settings, 
    LogOut,
    ArrowLeft,
    FileText,
    Users,
    Zap,
    X
} from "lucide-react";

interface AdminSidebarProps {
    userProfile: {
        name: string;
        role: string;
        profileImageUrl?: string;
    } | null;
    onLogoutAction: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

const adminNavigation = [
    { name: 'Operational Control', href: '/authority', icon: LayoutDashboard },
    { name: 'Ward Analytics', href: '/authority/ward-analytics', icon: Zap },
    { name: 'Official Circulars', href: '/authority/circulars', icon: FileText },
    { name: 'Departmental Reports', href: '/authority/reports', icon: Users },
    { name: 'System Settings', href: '/authority/settings', icon: Settings },
];

export default function AdminSidebar({ userProfile, onLogoutAction, isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image 
                            src="/logo1.png" 
                            alt="MCD Logo" 
                            fill
                            className="object-contain" 
                            sizes="40px"
                        />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 leading-none">Govt. of India</h1>
                        <p className="text-[10px] text-gov-blue font-black mt-1 uppercase tracking-widest">Authority Portal</p>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="pb-2 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Control Center</div>
                {adminNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                isActive 
                                ? "bg-gov-blue/5 text-gov-blue shadow-inner" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? "text-gov-blue" : "text-slate-400"}`} />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="pt-4 mt-auto">
                    <button 
                        onClick={onLogoutAction}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </nav>

            {/* Profile Attribution Card */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-gov-blue/10 flex items-center justify-center text-gov-blue">
                        {userProfile?.profileImageUrl ? (
                            <Image 
                                src={userProfile.profileImageUrl} 
                                alt="Admin" 
                                fill 
                                className="object-cover rounded-xl"
                            />
                        ) : (
                            <Users size={20} />
                        )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-black text-slate-800 truncate">{userProfile?.name || "Official"}</span>
                        <span className="text-[10px] text-gov-blue font-black uppercase tracking-tight opacity-70">
                            {userProfile?.role === 'authority' ? 'Commissioner' : 'Officer'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
