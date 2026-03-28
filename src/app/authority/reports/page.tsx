"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import { getAllGrievancesAction } from "@/app/actions/grievance";
import { Complaint } from "@/lib/types";
import AdminSidebar from "@/components/AdminSidebar";
import { Menu, Users, BarChart, Download, FileSpreadsheet, Building2, UserCircle2, Loader2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function ReportsPage() {
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

    const handleExport = () => {
        if (complaints.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        // Header
        csvContent += "ID,Category,Department,Ward,Status,Priority,CreatedAt\r\n";
        
        // Rows
        complaints.forEach((row) => {
            const rowStr = `"${row.id}","${row.category}","${row.department || 'General'}","${row.ward || 'N/A'}","${row.status}","${row.priority}","${row.createdAt}"`;
            csvContent += rowStr + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `civicos_reports_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getDepartmentStats = () => {
        const depsMap: Record<string, { total: number; resolved: number; active: number }> = {};
        
        complaints.forEach(c => {
            const dep = c.department || 'General Admin';
            if (!depsMap[dep]) {
                depsMap[dep] = { total: 0, resolved: 0, active: 0 };
            }
            depsMap[dep].total += 1;
            if (c.status === 'Resolved') {
                depsMap[dep].resolved += 1;
            } else {
                depsMap[dep].active += 1;
            }
        });

        const icons = [FileSpreadsheet, Building2, UserCircle2, Users];
        
        return Object.entries(depsMap)
            .map(([title, data], i) => {
                const score = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 100;
                return {
                    title,
                    score,
                    active: data.active,
                    icon: icons[i % icons.length]
                };
            })
            .sort((a, b) => b.active - a.active);
    };

    const deptStats = getDepartmentStats();

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-gov-blue/20">
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

                <div className="lg:hidden p-4 md:p-6 flex items-center justify-between border-b border-white backdrop-blur-xl bg-white/50 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gov-blue text-white flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Departmental Reports</h1>
                    </div>
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 p-4 md:p-8 xl:p-12 relative z-10 space-y-8 overflow-y-auto">
                    <div className="hidden lg:flex justify-between items-end bg-white/40 p-6 rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                                    <BarChart className="w-3 h-3" /> Staff Performance
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-balance">
                                Departmental Reports
                            </h1>
                            <p className="text-sm font-bold text-slate-500">Employee and departmental KPI tracking</p>
                        </div>

                        <button 
                            onClick={handleExport}
                            disabled={isLoading || complaints.length === 0}
                            className="h-12 px-6 bg-slate-900 hover:bg-gov-blue text-white transition-all rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:shadow-gov-blue/20 hover:-translate-y-0.5 active:scale-95 group border border-white/10 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
                            Export Data
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                                <Loader2 size={32} className="animate-spin mb-4 text-gov-blue" />
                                <span className="text-xs font-black uppercase tracking-widest">Crunching Numbers...</span>
                            </div>
                        ) : deptStats.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                                <FileSpreadsheet size={48} className="mb-4 opacity-20" />
                                <span className="text-sm font-black uppercase tracking-widest">No Department Data</span>
                            </div>
                        ) : (
                            deptStats.map((dept) => (
                                <div key={dept.title} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-gov-blue/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-gov-blue group-hover:text-white transition-all rounded-2xl flex items-center justify-center">
                                            <dept.icon className="w-6 h-6" />
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${dept.score > 80 ? 'bg-emerald-50 text-emerald-600' : dept.score > 50 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                            {dept.score}% score
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-1">{dept.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 mb-6">{dept.active} active personnel on ground</p>
                                    
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
                                        <div className={`h-full rounded-full ${dept.score > 80 ? 'bg-emerald-500' : dept.score > 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${dept.score}%` }} />
                                    </div>

                                    <button className="w-full py-3.5 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-gov-blue/5 group-hover:border-gov-blue/20 group-hover:text-gov-blue transition-all">
                                        Review KPIs
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
