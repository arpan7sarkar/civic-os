"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import { getAllGrievancesAction } from "@/app/actions/grievance";
import { Complaint } from "@/lib/types";
import AdminSidebar from "@/components/AdminSidebar";
import dynamic from "next/dynamic";
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });
import { Menu, AlertTriangle, BarChart3, LocateFixed } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function WardAnalyticsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await getServerProfileAction();
            if (!res.success || res.profile?.role !== 'authority') {
                router.push("/dashboard");
                return;
            }
            setProfile(res.profile);
            
            const gRes = await getAllGrievancesAction();
            if (gRes.success && gRes.grievances) {
                setComplaints(gRes.grievances as Complaint[]);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/auth/login");
    };

    // Calculate SLA Compliance by Ward
    const wardStats = () => {
        const wardsMap: Record<string, { total: number; resolved: number; active: number }> = {};
        
        complaints.forEach(c => {
            const ward = c.ward || 'Unassigned';
            if (!wardsMap[ward]) {
                wardsMap[ward] = { total: 0, resolved: 0, active: 0 };
            }
            wardsMap[ward].total += 1;
            if (c.status === 'Resolved') {
                wardsMap[ward].resolved += 1;
            } else {
                wardsMap[ward].active += 1;
            }
        });

        // Convert to array and sort by active issues (descending)
        return Object.entries(wardsMap)
            .map(([name, data]) => {
                const compliance = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 100;
                return {
                    name,
                    active: data.active,
                    compliance,
                    alert: compliance <= 50 && data.total > 5
                };
            })
            .sort((a, b) => b.active - a.active)
            .slice(0, 5); // Show top 5 problematic wards
    };

    const topWards = wardStats();

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-gov-blue/20">
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 animate-in fade-in"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            <AdminSidebar 
                userProfile={profile} 
                onLogoutAction={handleLogout}
                isOpen={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gov-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                <div className="lg:hidden p-4 md:p-6 flex items-center justify-between border-b border-white backdrop-blur-xl bg-white/50 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gov-blue text-white flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Ward Analytics</h1>
                    </div>
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 p-4 md:p-8 xl:p-12 relative z-10 space-y-8 overflow-y-auto w-full">
                    <div className="hidden lg:flex justify-between items-end bg-white/40 p-6 rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5">
                                    <LocateFixed className="w-3 h-3" /> Spatial Intelligence
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-balance">
                                Ward Analytics
                            </h1>
                            <p className="text-sm font-bold text-slate-500">Regional infrastructure performance & issue concentration</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 h-full min-h-[500px] w-[95%] lg:w-full max-w-7xl mx-auto">
                        {/* Real Map Component showing complaints */}
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col min-h-[500px]">
                            <h3 className="text-lg font-black text-slate-800 mb-1">Incident Heatmap</h3>
                            <p className="text-xs font-bold text-slate-400 mb-6 w-full truncate">Real-time geographical concentration of civic grievances.</p>
                            
                            <div className="flex-1 rounded-2xl border-2 border-slate-100 shadow-inner overflow-hidden relative">
                                {isLoading ? (
                                    <div className="w-full h-full flex flex-col justify-center items-center text-slate-400 bg-slate-50">
                                        <div className="animate-pulse flex flex-col items-center">
                                            <LocateFixed size={32} className="mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Loading Analytics...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <MapComponent 
                                        grievances={complaints}
                                        userLocation={null}
                                        onTrackTicketAction={(g) => {}}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 flex flex-col">
                            {/* Performance By Ward */}
                            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 flex-1">
                                <h3 className="text-lg font-black text-slate-800 mb-1">SLA Compliance by Ward</h3>
                                <p className="text-xs font-bold text-slate-400 mb-6">Resolution times versus target metrics.</p>

                                <div className="space-y-5">
                                    {isLoading ? (
                                        <div className="py-12 animate-pulse flex justify-center">
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-gov-blue animate-spin" />
                                        </div>
                                    ) : topWards.length === 0 ? (
                                        <div className="py-12 text-center text-sm font-bold text-slate-400">
                                            No grievance data recorded yet.
                                        </div>
                                    ) : (
                                        topWards.map((ward) => (
                                            <div key={ward.name}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-700">{ward.name}</span>
                                                        {ward.alert && <AlertTriangle size={12} className="text-red-500" />}
                                                    </div>
                                                    <div className="flex gap-4 items-center">
                                                        <span className="text-[10px] font-black text-slate-400 w-16 text-right">{ward.active} Active</span>
                                                        <span className={`text-[11px] font-black ${ward.compliance < 80 ? 'text-red-500' : 'text-emerald-500'}`}>{ward.compliance}% SLA</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${ward.compliance < 50 ? 'bg-red-500' : ward.compliance < 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${ward.compliance}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
