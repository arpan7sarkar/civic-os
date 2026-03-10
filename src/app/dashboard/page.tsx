"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import {
    Bell,
    Settings,
    ChevronDown,
    AlertCircle,
    Clock,
    Smile,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    RefreshCw,
    ShieldAlert,
    Sparkles
} from "lucide-react";
import { getComplaints, getStats, checkInfrastructureAlerts, updateComplaint } from "@/lib/store";
import { Complaint } from "@/lib/types";

export default function Dashboard() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [alert, setAlert] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setIsRefreshing(true);
        const data = getComplaints();
        setComplaints(data);
        setStats(getStats());
        setAlert(checkInfrastructureAlerts());
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleAssign = (id: string) => {
        const unit = `Unit ${Math.floor(Math.random() * 10) + 1}`;
        updateComplaint(id, { assignedTo: unit, status: 'In Progress' });
        refreshData();
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-mcd-slate uppercase tracking-wider">Active Zone:</span>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-mcd-navy">
                            Karol Bagh <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-mcd-slate hover:text-mcd-navy transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-mcd-slate hover:bg-gray-50 transition-all">
                            <Settings className="w-4 h-4" />
                            System Admin
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-mcd-slate">Pending Grievances</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-mcd-navy">{stats?.pendingGrievances || 0}</span>
                                        <span className="text-xs font-bold text-red-600">+12% vs LW</span>
                                    </div>
                                </div>
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">HIGH PRIORITY TICKETS</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-mcd-slate">Avg Turnaround Time</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-mcd-navy">{stats?.avgTurnaround || "N/A"}</span>
                                        <span className="text-xs font-bold text-green-600">-0.5% vs LW</span>
                                    </div>
                                </div>
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">EFFICIENCY METRIC (TAT)</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-mcd-slate">Citizen Satisfaction</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-mcd-navy">{stats?.citizenSatisfaction || "85%"}</span>
                                        <span className="text-xs font-bold text-red-500">-2% vs LW</span>
                                    </div>
                                </div>
                                <Smile className="w-5 h-5 text-yellow-500" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">CSAT SCORE (LIVE FEEDBACK)</p>
                        </div>
                    </div>

                    {/* AI Alert Card */}
                    {alert?.active && (
                        <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm animate-in zoom-in-95 duration-300">
                            <div className="w-full md:w-64 h-48 md:h-auto relative bg-blue-100 flex items-center justify-center">
                                <ShieldAlert className="w-16 h-16 text-blue-300 opacity-50" />
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-blue-900/10"></div>
                            </div>
                            <div className="flex-1 p-8 space-y-4">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">AI Infrastructure Alert</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-mcd-navy leading-tight">{alert.message}</h3>
                                    <p className="text-sm text-mcd-slate max-w-2xl leading-relaxed">
                                        Our AI detected a high-density cluster of reports in this area within a short timeframe. This likely indicates shared infrastructure failure (e.g., water main burst or transformer issue).
                                    </p>
                                </div>
                                <button className="px-6 py-2.5 bg-mcd-navy text-white text-sm font-bold rounded-lg hover:bg-mcd-navy/90 transition-all flex items-center gap-2 shadow-lg shadow-mcd-navy/20">
                                    Dispatch Rapid Response Team
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Live Feed Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-mcd-navy">Live Grievance Feed</h2>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-mcd-slate rounded-lg hover:bg-gray-50 transition-all">Export CSV</button>
                                <button
                                    onClick={refreshData}
                                    className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-mcd-slate rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh Feed
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ward</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-mcd-slate italic">No complaints reported yet. Use Demo Mode to populate data.</td>
                                        </tr>
                                    ) : (
                                        complaints.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-mcd-slate">{row.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-mcd-navy">{row.category}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-mcd-slate">{row.ward}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                                        row.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                            row.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {row.status} ({row.priority})
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-mcd-slate">{row.assignedTo || "Unassigned"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {row.status === 'Pending' ? (
                                                        <button
                                                            onClick={() => handleAssign(row.id)}
                                                            className="text-[11px] font-black text-blue-600 uppercase hover:underline"
                                                        >
                                                            Dispatch Team
                                                        </button>
                                                    ) : (
                                                        <Link href="/verification" className="text-[11px] font-black text-mcd-navy uppercase hover:underline flex items-center justify-end gap-1">
                                                            View Case <ChevronRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <p className="text-xs font-medium text-mcd-slate">Showing {complaints.length} reports</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
