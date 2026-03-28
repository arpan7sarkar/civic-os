"use client";

import React from "react";
import { Phone, Navigation, Share2, MapPin, AlertCircle, TrendingUp, Zap } from "lucide-react";

export interface EmergencyActionHubProps {
    activeService: any | null;
    locationName: string;
    incidents?: any[];
    distance?: string | null;
    eta?: string | null;
}

export default function EmergencyActionHub({ activeService, locationName, incidents = [], distance, eta }: EmergencyActionHubProps) {
    // Filter incidents to those highly relevant (mock logic: just sort and slice 2)
    const severeIncidents = incidents.slice(0, 2);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Emergency Help Needed',
                    text: `I need emergency assistance. My approximate location is ${locationName}. I am trying to reach ${activeService?.name || 'help'}.`,
                });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            alert("Sharing not supported in this browser.");
        }
    };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* DESTINATION DETAILS & FAST ACTIONS */}
            <div className={`bg-white p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col justify-between w-full transition-all duration-300 ${activeService ? 'border-[#0B6E6D]/30 shadow-teal-500/10' : 'border-slate-100'}`}>
                <div>
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-6">
                        <Navigation className={`w-5 h-5 ${activeService ? 'text-[#0B6E6D]' : 'text-slate-400'}`} />
                        Destination Status
                    </h3>
                    
                    {activeService ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmed Target</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">{activeService.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Travel</p>
                                    <p className="text-sm font-black text-slate-800 mt-1">{distance} • {eta}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Status</p>
                                    <div className="text-[10px] font-black tracking-widest uppercase text-[#0B6E6D] mt-1 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#0B6E6D] rounded-full animate-pulse shadow-[0_0_8px_#0B6E6D]" />
                                        Corridor Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[120px] flex flex-col items-center justify-center opacity-50">
                            <Zap className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
                                Awaiting service selection<br/>to generate target profile
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* NEARBY INCIDENTS (Conditional Relevance) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm w-full h-[300px] sm:h-auto overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Area Hazards
                    </h3>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {severeIncidents.length > 0 ? (
                        severeIncidents.map((incident, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group">
                                <div className={`p-3 bg-${incident.color}-50 text-${incident.color}-500 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-800 leading-tight mb-1">{incident.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-${incident.color}-50 text-${incident.color}-600`}>
                                            May affect travel
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{incident.distance}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-xs font-bold text-green-600 text-center uppercase tracking-widest bg-green-50 p-4 rounded-2xl border border-green-100">
                                Route is clear.<br/>No major hazards reported.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* MOBILE FLOATING SOS BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 lg:hidden z-50 pb-safe">
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    <a href="tel:112" className="flex items-center justify-center gap-2 px-4 py-4 bg-red-600 text-white rounded-2xl active:scale-95 transition-transform font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30">
                        <Phone className="w-5 h-5" />
                        Call 112
                    </a>
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 px-4 py-4 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-800/30">
                        <Share2 className="w-5 h-5" />
                        Share Location
                    </button>
                </div>
            </div>
            
            {/* DESKTOP SOS BAR (Hidden on mobile) */}
            <div className="hidden lg:grid grid-cols-2 lg:col-span-2 gap-4 mt-2">
                <a href="tel:112" className="flex items-center justify-center gap-3 px-6 py-5 bg-red-600 text-white rounded-3xl hover:bg-red-700 hover:scale-[1.01] transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-red-600/20">
                    <Phone className="w-6 h-6" />
                    Call 112 for Immediate Support
                </a>
                <button onClick={handleShare} className="flex items-center justify-center gap-3 px-6 py-5 bg-slate-800 text-white rounded-3xl hover:bg-slate-900 hover:scale-[1.01] transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-800/20">
                    <Share2 className="w-6 h-6" />
                    Share Live Location & Status
                </button>
            </div>
        </div>
    );
}
