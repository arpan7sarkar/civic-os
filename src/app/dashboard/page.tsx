"use client";

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
    LayoutDashboard
} from "lucide-react";

const stats = [
    {
        label: "Pending Grievances",
        value: "142",
        change: "+12% vs LW",
        changeColor: "text-red-600",
        icon: AlertCircle,
        iconColor: "text-red-500",
        subtext: "HIGH PRIORITY TICKETS"
    },
    {
        label: "Avg Turnaround Time",
        value: "4.2 hrs",
        change: "-0.5% vs LW",
        changeColor: "text-green-600",
        icon: Clock,
        iconColor: "text-blue-500",
        subtext: "EFFICIENCY METRIC (TAT)"
    },
    {
        label: "Citizen Satisfaction",
        value: "88%",
        change: "-2% vs LW",
        changeColor: "text-red-500",
        icon: Smile,
        iconColor: "text-yellow-500",
        subtext: "CSAT SCORE (LIVE FEEDBACK)"
    },
];

const grievanceFeed = [
    { id: "#GRV-9821", category: "Street Light Repair", ward: "Ward 12 (Model Town)", status: "Critical", statusColor: "bg-red-100 text-red-700", assignedTo: "Er. Rajesh Kumar" },
    { id: "#GRV-9815", category: "Garbage Collection", ward: "Ward 05 (Civil Lines)", status: "In Progress", statusColor: "bg-amber-100 text-amber-700", assignedTo: "Sanitation Unit 4" },
    { id: "#GRV-9804", category: "Pothole Filling", ward: "Ward 21 (Anand Parbat)", status: "Resolved", statusColor: "bg-green-100 text-green-700", assignedTo: "PWD Road Crew B" },
    { id: "#GRV-9799", category: "Unauthorized Ad Hoarding", ward: "Ward 18 (West Patel Nagar)", status: "Pending", statusColor: "bg-blue-100 text-blue-700", assignedTo: "Enforcement Wing" },
    { id: "#GRV-9788", category: "Illegal Parking", ward: "Ward 15 (Dev Nagar)", status: "Critical", statusColor: "bg-red-100 text-red-700", assignedTo: "Traffic Control Unit" },
];

export default function Dashboard() {
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
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-mcd-slate">{stat.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-mcd-navy">{stat.value}</span>
                                            <span className={`text-xs font-bold ${stat.changeColor}`}>{stat.change}</span>
                                        </div>
                                    </div>
                                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{stat.subtext}</p>
                            </div>
                        ))}
                    </div>

                    {/* AI Alert Card */}
                    <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                        <div className="w-full md:w-64 h-48 md:h-auto relative bg-blue-200">
                            {/* Dummy Satellite view */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-blue-900/40"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-blue-900/40 font-bold uppercase tracking-widest text-xs">Satellite Feed</span>
                            </div>
                        </div>
                        <div className="flex-1 p-8 space-y-4">
                            <div className="flex items-center gap-2 text-mcd-navy">
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wider">AI Infrastructure Alert</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-mcd-navy leading-tight">Anomalous cluster detected in Ward 64 (Greater Kailash)</h3>
                                <p className="text-sm text-mcd-slate max-w-2xl leading-relaxed">
                                    Our AI detected an unusual 300% surge in water leakage reports within a 500m radius in the last 2 hours. This suggests a major pipeline rupture. Immediate inspection recommended.
                                </p>
                            </div>
                            <button className="px-6 py-2.5 bg-mcd-navy text-white text-sm font-bold rounded-lg hover:bg-mcd-navy/90 transition-all flex items-center gap-2 shadow-lg shadow-mcd-navy/20">
                                <LayoutDashboard className="w-4 h-4" />
                                Dispatch Team
                            </button>
                        </div>
                    </div>

                    {/* Live Feed Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-mcd-navy">Live Grievance Feed</h2>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-mcd-slate rounded-lg hover:bg-gray-50 transition-all">Export CSV</button>
                                <button className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-mcd-slate rounded-lg hover:bg-gray-50 transition-all">Refresh Feed</button>
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
                                    {grievanceFeed.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-mcd-slate">{row.id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-mcd-navy">{row.category}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-mcd-slate">{row.ward}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.statusColor}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-mcd-slate">{row.assignedTo}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href="/verification" className="text-[11px] font-black text-mcd-navy uppercase hover:underline flex items-center justify-end gap-1">
                                                    View Details <ChevronRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <p className="text-xs font-medium text-mcd-slate">Showing 1-5 of 1,244 total reports</p>
                            <div className="flex gap-2">
                                <button className="p-2 border border-gray-200 bg-white rounded-lg text-mcd-slate hover:bg-gray-50 transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button className="px-4 py-2 bg-mcd-navy text-white text-xs font-bold rounded-lg shadow-lg shadow-mcd-navy/20">1</button>
                                <button className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-mcd-slate rounded-lg hover:bg-gray-50 transition-all">2</button>
                                <button className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-mcd-slate rounded-lg hover:bg-gray-50 transition-all">3</button>
                                <button className="p-2 border border-gray-200 bg-white rounded-lg text-mcd-slate hover:bg-gray-50 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
