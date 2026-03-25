"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    LayoutDashboard, ClipboardList, Map as MapIcon, ShieldAlert,
    Settings, LogOut, Plus, X, Menu, Bell, AlertTriangle, Zap, MapPin
} from "lucide-react";
import dynamic from "next/dynamic";
import { logoutAction } from "@/app/actions/auth";
import { reverseGeocodeAction } from "@/app/actions/geo";

import EmergencyActions from "@/components/emergency/EmergencyActions";
import EmergencyActionHub from "@/components/emergency/EmergencyActionHub";

const EmergencyMap = dynamic(() => import("@/components/emergency/EmergencyMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl">
            <div className="w-8 h-8 border-4 border-[#0B6E6D] border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
});

const SidebarLink = ({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) => (
    <Link 
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-gov-blue text-white shadow-md shadow-gov-blue/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
        {icon}
        <span className="text-sm font-bold">{label}</span>
    </Link>
);

export default function EmergencyPage() {
    const router = useRouter();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Emergency State
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locationName, setLocationName] = useState("Detecting...");
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [eta, setEta] = useState<string | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation([latitude, longitude]);
                
                try {
                    const res = await reverseGeocodeAction(latitude, longitude);
                    if (res.success && res.address) {
                        setLocationName(res.address.split(',')[0]);
                    }
                } catch (err) {
                    setLocationName("Current Location");
                }
            });
        }
    }, []);

    const handleServiceSelect = (service: string, coords: [number, number]) => {
        setSelectedService(service);
        setDestination(coords);
        setEta("4 mins");
    };

    const handleLogout = async () => {
        try {
            await logoutAction();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-inter">
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Sidebar matching dashboard */}
            <aside className={`w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 lg:translate-x-0 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} lg:z-20`}>
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
                            <p className="text-[10px] text-gov-blue font-black mt-1 uppercase tracking-widest">CivicOS National</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowMobileSidebar(false)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarLink icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" href="/dashboard" />
                    <SidebarLink icon={<ClipboardList className="w-4 h-4" />} label="My Reports" href="/dashboard" />
                    <SidebarLink icon={<MapIcon className="w-4 h-4" />} label="Local Map" href="/map" />
                    <SidebarLink icon={<ShieldAlert className="w-4 h-4" />} label="Emergency" href="/emergency" active />
                    
                    <div className="pt-8 pb-2 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Support</div>
                    <SidebarLink icon={<Settings className="w-4 h-4" />} label="Preferences" href="/dashboard" />
                    
                    <div className="pt-4 mt-auto">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-4 h-4 text-red-400" />
                            <span>Logout Session</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-50">
                    <Link href="/report" className="w-full py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-gov-blue/10 flex items-center justify-center gap-2 group transition-all active:scale-95">
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>New Report</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-32 lg:pb-8">
                {/* Header Section */}
                <header className="flex items-center justify-between mb-6 md:mb-8 bg-white/50 backdrop-blur-md p-2 md:p-4 rounded-2xl md:rounded-3xl border border-white/50 shadow-sm sticky top-0 md:top-4 z-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowMobileSidebar(true)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden flex-shrink-0"
                        >
                            <Menu className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-[#145369] tracking-tight">CivicRoute</h2>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Emergency Navigation Unit</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Emergency Mode</span>
                        </div>
                        <div className="relative">
                            <div 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="cursor-pointer hover:bg-slate-100 p-2 sm:p-3 rounded-xl transition-colors bg-white border border-slate-100 shadow-sm"
                            >
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Primary Emergency Actions */}
                    <section>
                        <EmergencyActions action={handleServiceSelect} activeService={selectedService} />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map & AI Assist Column */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                             {/* AI Assist Feed / CivicRoute Assist */}
                             <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-[#0B6E6D] text-white rounded-2xl shadow-md shrink-0">
                                    <Zap className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Emergency AI Assist</p>
                                        {eta && <p className="text-xs font-black text-[#0B6E6D] uppercase">{eta}</p>}
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                        {selectedService ? 
                                            <>Nearest <span className="text-[#145369]">{selectedService}</span> is 1.8 km away. Fastest route selected via West Side Expressway. Traffic is minimal. Status: <span className="text-red-500">Critical priority signal engaged.</span></> : 
                                            "CivicRoute is ready. Please select an emergency service above for intelligent routing and priority signaling."
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            {/* Map Restyled */}
                            <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                                {/* Location Status HUD */}
                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 animate-in fade-in">
                                    <MapPin className="w-3.5 h-3.5 text-[#0B6E6D]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#145369] truncate max-w-[150px]">
                                        {locationName}
                                    </span>
                                </div>
                                
                                <EmergencyMap 
                                    userLocation={userLocation} 
                                    destination={destination}
                                    serviceType={selectedService}
                                />
                            </div>
                        </div>

                        {/* Action Hub Column */}
                        <div className="lg:col-span-1">
                            {/* Moved the EmergencyActionHub into a vertical layout for better use of space */}
                            <EmergencyActionHub activeService={selectedService} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
