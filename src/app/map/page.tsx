"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
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
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { getComplaints } from "@/lib/store";
import { Complaint } from "@/lib/types";

// Dynamic import for Leaflet (client-side only)
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-mcd-navy" />
        </div>
    )
});

const urgencyLevels = [
    { id: "Critical", label: "Critical", color: "bg-red-500" },
    { id: "High", label: "High", color: "bg-orange-500" },
    { id: "Medium", label: "Medium", color: "bg-yellow-500" },
    { id: "Low", label: "Low", color: "bg-green-500" },
];

export default function MapView() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["Critical", "High", "Medium", "Low"]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setComplaints(getComplaints());
    }, []);

    const filteredComplaints = useMemo(() => {
        return complaints.filter(c =>
            selectedPriorities.includes(c.priority) &&
            (c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.ward.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [complaints, selectedPriorities, searchQuery]);

    const togglePriority = (priority: string) => {
        setSelectedPriorities(prev =>
            prev.includes(priority)
                ? prev.filter(p => p !== priority)
                : [...prev, priority]
        );
    };

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
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Range</p>
                        <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-mcd-slate">
                            Last 7 Days <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Urgency Level</p>
                        <div className="space-y-2">
                            {urgencyLevels.map((level) => (
                                <div
                                    key={level.id}
                                    onClick={() => togglePriority(level.id)}
                                    className={`flex items-center justify-between p-3 border rounded-lg group cursor-pointer transition-all ${selectedPriorities.includes(level.id)
                                            ? 'border-mcd-navy bg-blue-50/50'
                                            : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                                        <span className={`text-sm font-bold ${selectedPriorities.includes(level.id) ? 'text-mcd-navy' : 'text-mcd-slate'}`}>
                                            {level.label}
                                        </span>
                                    </div>
                                    <div className={`w-2 h-2 border-2 rounded-full transition-all ${selectedPriorities.includes(level.id) ? 'border-mcd-navy bg-mcd-navy' : 'border-gray-200'
                                        }`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-mcd-navy text-white font-bold py-4 rounded-xl shadow-lg shadow-mcd-navy/20 hover:bg-mcd-navy/90 transition-all flex items-center justify-center gap-2">
                        <Filter className="w-4 h-4" />
                        Reset Filters
                    </button>
                </aside>

                {/* Main Content: Map Area */}
                <main className="flex-1 relative bg-gray-100 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <MapComponent complaints={filteredComplaints} />
                    </div>

                    {/* Search Bar Overlay */}
                    <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                        <div className="w-full max-w-lg pointer-events-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex items-center pr-2">
                            <div className="pl-4 text-gray-400"><Search className="w-5 h-5" /></div>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-4 text-sm font-medium outline-none text-mcd-slate"
                                placeholder="Search locations, wards or grievance IDs..."
                            />
                        </div>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute bottom-6 left-6 z-[1000] w-64 bg-white/95 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-2xl pointer-events-auto">
                        <h3 className="text-[10px] font-black text-mcd-navy uppercase tracking-widest mb-4">Urgency Legend</h3>
                        <div className="space-y-3">
                            {urgencyLevels.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm border border-white`}></div>
                                    <span className="text-[11px] font-bold text-mcd-slate">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <footer className="bg-white border-t border-gray-200 px-8 py-3 flex justify-between items-center text-[10px] font-medium text-mcd-slate relative z-10">
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
