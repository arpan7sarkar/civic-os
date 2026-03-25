"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Map as MapIcon,
    BarChart3,
    CheckSquare,
    FileText,
    User,
    ShieldAlert
} from "lucide-react";

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Map', href: '/map', icon: MapIcon },
    { name: 'Ward Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Department Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Reports', href: '/dashboard/my-reports', icon: FileText },
    { name: 'Emergency', href: '/emergency', icon: ShieldAlert },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-100">
                <div className="relative w-10 h-10">
                    <Image 
                        src="/logo1.png" 
                        alt="CivicOS Logo" 
                        fill
                        className="object-contain" 
                        sizes="40px"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gov-blue leading-tight uppercase tracking-tight">Govt. of India</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CivicOS National</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-blue-50 text-mcd-navy"
                                    : "text-mcd-slate hover:bg-gray-50 hover:text-mcd-navy"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-mcd-navy" : "text-mcd-slate"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-mcd-navy/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-mcd-navy" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-mcd-navy">S. K. Verma</span>
                        <span className="text-[10px] text-mcd-slate">National Commissioner</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
