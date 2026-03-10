"use client";

import Header from "@/components/Header";
import {
    Filter,
    MapPin,
    ChevronDown,
    Search,
    Plus,
    Minus,
    LocateFixed,
    Layers,
    ArrowUpRight
} from "lucide-react";

const issueTypes = [
    { id: "pothole", label: "Pothole", checked: true },
    { id: "streetlight", label: "Streetlight", checked: true },
    { id: "garbage", label: "Garbage Collection", checked: false },
    { id: "water", label: "Water Leakage", checked: false },
    { id: "encroachment", label: "Encroachment", checked: false },
];

const urgencyLevels = [
    { id: "critical", label: "Critical", color: "bg-red-500" },
    { id: "high", label: "High", color: "bg-orange-500" },
    { id: "medium", label: "Medium", color: "bg-yellow-500" },
    { id: "low", label: "Low", color: "bg-green-500" },
];

export default function MapView() {
    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Spatial Filters */}
                <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-8 flex flex-col">
                    <div className="flex items-center gap-2 text-mcd-navy mb-2">
                        <Filter className="w-5 h-5 text-mcd-navy" />
                        <h2 className="text-lg font-black tracking-tight uppercase">Spatial Filters</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Type</p>
                        <div className="space-y-3">
                            {issueTypes.map((type) => (
                                <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" defaultChecked={type.checked} className="w-4 h-4 rounded border-gray-300 text-mcd-navy focus:ring-mcd-navy" />
                                    <span className="text-sm font-bold text-mcd-slate group-hover:text-mcd-navy transition-colors">{type.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Range</p>
                        <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-mcd-slate">
                            Last 7 Days <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Urgency Level</p>
                        <div className="space-y-2">
                            {urgencyLevels.map((level) => (
                                <div key={level.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg group cursor-pointer hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                                        <span className="text-sm font-bold text-mcd-slate">{level.label}</span>
                                    </div>
                                    <div className="w-2 h-2 border-2 border-gray-200 rounded-full group-hover:border-mcd-navy transition-all"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-mcd-navy text-white font-bold py-4 rounded-xl shadow-lg shadow-mcd-navy/20 hover:bg-mcd-navy/90 transition-all flex items-center justify-center gap-2">
                        <Filter className="w-4 h-4" />
                        Apply Filters
                    </button>
                </aside>

                {/* Main Content: Map Area */}
                <main className="flex-1 relative bg-gray-100 overflow-hidden">
                    {/* Dummy Map Visual with Grid Pattern */}
                    <div className="absolute inset-0 z-0 bg-[#e2e8f0] opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                    {/* Map Interface Components */}
                    <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                        <div className="w-full max-w-lg pointer-events-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex items-center pr-2">
                            <div className="pl-4 text-gray-400"><Search className="w-5 h-5" /></div>
                            <input className="flex-1 px-4 py-4 text-sm font-medium outline-none text-mcd-slate" placeholder="Search locations, zones or grievance IDs..." />
                            <div className="flex items-center gap-2 pr-2">
                                <button className="p-2 text-mcd-slate hover:bg-gray-50 rounded-lg transition-all"><Filter className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="pointer-events-auto flex flex-col gap-2">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col">
                                <button className="p-2.5 text-mcd-slate hover:bg-gray-50 border-b border-gray-100"><Plus className="w-5 h-5" /></button>
                                <button className="p-2.5 text-mcd-slate hover:bg-gray-50"><Minus className="w-5 h-5" /></button>
                            </div>
                            <button className="bg-white p-2.5 rounded-lg shadow-xl border border-gray-200 text-mcd-slate hover:bg-gray-50 pointer-events-auto"><LocateFixed className="w-5 h-5" /></button>
                            <button className="bg-white p-2.5 rounded-lg shadow-xl border border-gray-200 text-mcd-slate hover:bg-gray-50 pointer-events-auto"><Layers className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Map Pins / Clusters */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Case Popup Pin */}
                        <div className="relative pointer-events-auto">
                            <div className="bg-mcd-navy text-white text-[11px] font-black w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center -translate-x-1/2 -translate-y-full mb-1">42</div>

                            {/* Information Card Card Overlay */}
                            <div className="absolute bottom-10 left-0 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="relative h-32 bg-gray-200">
                                    <div className="absolute top-3 left-3 bg-red-600 text-[10px] font-black text-white px-2 py-0.5 rounded tracking-widest uppercase">Pothole</div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <span className="text-white text-[10px] font-bold">Reported 2 hours ago</span>
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Case ID</p>
                                            <h4 className="text-lg font-black text-mcd-navy tracking-tight">#GRV-9821</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Status</p>
                                            <span className="text-[11px] font-black text-orange-600 uppercase">Pending</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Department</p>
                                        <p className="text-xs font-bold text-mcd-slate flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-red-500" /> PWD Road Crew - North
                                        </p>
                                    </div>
                                    <button className="w-full py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-black text-mcd-navy hover:bg-mcd-navy hover:text-white hover:border-mcd-navy transition-all flex items-center justify-center gap-2">
                                        View Full Case <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute bottom-6 left-6 z-10 w-64 bg-white/95 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-2xl">
                        <h3 className="text-[10px] font-black text-mcd-navy uppercase tracking-widest mb-4">Map Legend</h3>
                        <div className="space-y-3">
                            {[
                                { color: "bg-red-500", label: "Critical Potholes" },
                                { color: "bg-mcd-navy", label: "Issue Clusters" },
                                { color: "bg-amber-500", label: "Scheduled Repairs" },
                                { color: "bg-green-500", label: "Resolved Cases" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm border border-white`}></div>
                                    <span className="text-[11px] font-bold text-mcd-slate">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>

            <footer className="bg-white border-t border-gray-200 px-8 py-3 flex justify-between items-center text-[10px] font-medium text-mcd-slate">
                <span>Compliant with GIGW & WCAG 2.1 standards</span>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-mcd-navy transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-mcd-navy transition-colors">Terms of Use</a>
                    <a href="#" className="hover:text-mcd-navy transition-colors">Help Desk</a>
                </div>
            </footer>
        </div>
    );
}
