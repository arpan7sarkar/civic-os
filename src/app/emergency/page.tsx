"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    LayoutDashboard, ClipboardList, Map as MapIcon, ShieldAlert,
    Menu, Bell, MapPin, Loader2, Sparkles, LogOut, Settings, Plus, ChevronDown, User,
    Search, Mic, Volume2, Headphones
} from "lucide-react";
import dynamic from "next/dynamic";
import { logoutAction } from "@/app/actions/auth";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import { reverseGeocodeAction } from "@/app/actions/geo";
import { fetchNearestServices, fetchRouteOSRM, generateDynamicIncidents } from "@/lib/emergencyUtils";

import EmergencyActions from "@/components/emergency/EmergencyActions";
import EmergencyActionHub from "@/components/emergency/EmergencyActionHub";

// Dynamic import for Map to avoid SSR issues
const EmergencyMap = dynamic(() => import("@/components/emergency/EmergencyMap"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl">
            <Loader2 className="w-8 h-8 text-[#0B6E6D] animate-spin mb-4" />
            <p className="text-slate-400 font-bold animate-pulse">Initializing Tactical Interface...</p>
        </div>
    )
});

const SidebarLink = ({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) => (
    <Link 
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
        {icon}
        <span className="text-sm font-bold">{label}</span>
    </Link>
);

export default function EmergencyPage() {
    const router = useRouter();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeZone, setActiveZone] = useState("All India");
    const [searchTerm, setSearchTerm] = useState("");
    const [showZoneMenu, setShowZoneMenu] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Emergency State
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locationName, setLocationName] = useState("Detecting location...");
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [eta, setEta] = useState<string | null>(null);
    const [distance, setDistance] = useState<string | null>(null);
    const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
    const [servicesData, setServicesData] = useState<any[] | null>(null);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [isRouting, setIsRouting] = useState(false);
    const [isLocating, setIsLocating] = useState(true);

    useEffect(() => {
        // Fetch Profile
        const fetchProfile = async () => {
            try {
                const res = await getServerProfileAction();
                if (res.success && res.profile) {
                    setUserProfile(res.profile);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };
        fetchProfile();

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation([latitude, longitude]);
                
                let currentLocName = "Unknown Location";
                try {
                    const res = await reverseGeocodeAction(latitude, longitude);
                    if (res.success && res.address) {
                        currentLocName = res.address.split(',')[0];
                        setLocationName(currentLocName);
                    }
                } catch (err) {
                    setLocationName(currentLocName);
                }

                // Fetch real data
                try {
                    const services = await fetchNearestServices(latitude, longitude);
                    setServicesData(services);
                    const incs = generateDynamicIncidents(latitude, longitude, currentLocName);
                    setIncidents(incs);
                    setIsLocating(false);
                } catch (e) {
                    setIsLocating(false);
                    console.error("Data fetch failed", e);
                }
            }, () => {
                setLocationName("Location Access Denied");
                setIsLocating(false);
            });
        } else {
            setLocationName("Location Not Supported");
            setIsLocating(false);
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logoutAction();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleServiceSelect = async (serviceName: string, coords: [number, number]) => {
        setIsRouting(true);
        const fullService = servicesData?.find(s => s.id === serviceName) || { id: serviceName, name: serviceName, coords: coords };
        setSelectedService(fullService);
        setDestination(coords);
        setEta("calculating...");
        setDistance("...");
        
        // Smooth scroll to map on mobile
        setTimeout(() => {
            const mapEl = document.getElementById("emergency-map-section");
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        if (userLocation) {
            const routeInfo = await fetchRouteOSRM(userLocation, coords);
            setRouteGeometry(routeInfo.geometry);
            setEta(routeInfo.duration + " mins");
            setDistance(routeInfo.distance + " km");
        }
        setIsRouting(false);
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-inter">
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden fade-in"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Sidebar matching dashboard */}
            <aside className={`w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 lg:translate-x-0 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} lg:z-20`}>
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image 
                                src="/logo1.png" 
                                alt="MCD Logo" 
                                fill
                                sizes="40px"
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 leading-none">Govt. of India</h1>
                            <p className="text-[10px] text-gov-blue font-black mt-1 uppercase tracking-widest">CivicOS National</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarLink icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" href="/dashboard" />
                    <SidebarLink icon={<ClipboardList className="w-4 h-4" />} label="My Reports" href="/dashboard/my-reports" />
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
                {/* Header Section synced with Dashboard */}
                <header className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8 bg-white/50 backdrop-blur-md p-2 md:p-4 rounded-2xl md:rounded-3xl border border-white/50 shadow-sm sticky top-0 md:top-4 z-30 transition-all">
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden flex-shrink-0"
                    >
                        <Menu className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        {/* Emergency Badge (Differentiator) */}
                        <div className="flex items-center gap-4 px-2 md:px-0">
                            <div>
                                <h2 className="text-lg md:text-xl font-black text-red-600 tracking-tight whitespace-nowrap leading-none">Emergency</h2>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Tactical Response
                                </p>
                            </div>
                        </div>

                        <div className="relative flex-1 hidden xl:block ml-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search emergency alerts..." 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative group ml-auto sm:ml-0">
                            <div 
                                onClick={() => setShowZoneMenu(!showZoneMenu)}
                                className="flex items-center gap-2 text-slate-500 hover:text-gov-blue cursor-pointer transition-colors px-3 py-2 rounded-xl border border-transparent hover:border-slate-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest whitespace-nowrap">{activeZone}</span>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showZoneMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 truncate max-w-[80px] sm:max-w-[100px]">{locationName}</span>
                                </div>
                            </div>
                            
                            {showZoneMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    {["All India", "North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"].map((zone) => (
                                        <button
                                            key={zone}
                                            onClick={() => {
                                                setActiveZone(zone);
                                                setShowZoneMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-gov-blue transition-colors"
                                        >
                                            {zone}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-2">
                        <button 
                            className={`flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl border transition-all ${isRecording || isSpeaking ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Voice Aid</span>
                        </button>

                        <div className="relative hidden sm:block">
                            <div 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors"
                            >
                                <Bell className="w-5 h-5 text-slate-500" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </div>

                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</p>
                                    </div>
                                    <div className="p-8 text-center bg-slate-50/20">
                                        <ShieldAlert className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-500">No immediate threats detected in your zone.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative border-l border-slate-100 pl-2 md:pl-4">
                            <div 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 md:gap-3 p-1 hover:bg-slate-100 rounded-2xl cursor-pointer transition-all border border-transparent"
                            >
                                <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden shadow-sm border-2 border-white">
                                    <Image src={userProfile?.profileImageUrl || "/logo1.png"} alt="Profile" fill sizes="40px" className="object-cover" />
                                </div>
                                <div className="hidden sm:flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black text-slate-800 tracking-tight">{userProfile?.name?.split(' ')[0] || "Citizen"}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{userProfile?.role || "Resident"}</span>
                                </div>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    <button
                                        onClick={() => {
                                            router.push('/dashboard');
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-gov-blue transition-colors flex items-center gap-2"
                                    >
                                        <User className="w-3.5 h-3.5" />
                                        My Dashboard
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-slate-50 mt-1 pt-2"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Logout Session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
                    
                    {/* 1. PRIMARY ACTIONS (Largest, top completely dominant) */}
                    <section>
                        <EmergencyActions 
                            action={handleServiceSelect} 
                            activeService={selectedService?.id} 
                            servicesData={servicesData} 
                            isRouting={isRouting}
                        />
                    </section>

                    {/* 2. REACTIVE AI ASSISTANT */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-300">
                        <div className={`p-3.5 rounded-2xl shrink-0 transition-colors duration-300 ${isRouting ? 'bg-orange-100 text-orange-500' : selectedService ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            {isRouting ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                             selectedService ? <MapPin className="w-6 h-6" /> : 
                             <Sparkles className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            {isRouting ? (
                                <p className="text-sm sm:text-base font-bold text-orange-600 animate-pulse">
                                    Finding nearest {selectedService?.id.toLowerCase() || 'facility'} and generating fastest route...
                                </p>
                            ) : selectedService ? (
                                <p className="text-sm sm:text-base font-bold text-green-700">
                                    Routing to {selectedService.name}. It is {distance} away.
                                </p>
                            ) : (
                                <p className="text-sm sm:text-base font-bold text-slate-600">
                                    {isLocating ? "Analyzing your location to find nearby emergency services..." : "Select an emergency service above to begin immediate routing."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. CENTER OF TRUTH MAP */}
                    <section id="emergency-map-section" className="relative w-full h-[450px] lg:h-[550px] rounded-3xl overflow-hidden shadow-md border-[4px] border-white bg-slate-50 transition-all duration-500">
                        {/* Interactive overlay on Map */}
                        {selectedService && (
                            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                                <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-slate-100 pointer-events-auto flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Routing to</p>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{selectedService.name}</p>
                                    </div>
                                </div>

                                <div className="bg-[#145369]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-[#145369] pointer-events-auto flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                     <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0B6E6D]">ETA</p>
                                        <p className="text-sm sm:text-base font-black text-white">{eta}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="h-[400px] lg:h-[500px]">
                            <EmergencyMap
                                userLocation={userLocation}
                                serviceLocation={selectedService?.coords}
                                route={routeGeometry}
                                distance={distance}
                                eta={eta}
                            />
                        </div>
                    </section>

                    {/* 4. EMERGENCY ACTION HUB & DESTINATION DETAILS */}
                    <section>
                        <EmergencyActionHub 
                            activeService={selectedService} 
                            locationName={locationName} 
                            incidents={incidents} 
                            distance={distance} 
                            eta={eta} 
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}
