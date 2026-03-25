"use client";

import React from "react";
import { Phone, Navigation, Share2, MapPin, AlertCircle, Clock } from "lucide-react";

export default function EmergencyActionHub({ activeService }: { activeService: string | null }) {
    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Nearby Incidents Feed */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        Nearby Incidents
                    </h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                        <div className="p-2 bg-red-50 text-red-500 rounded-xl mt-0.5">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">Road Closure: 5th Ave</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">2 mins ago • 0.5km away</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-xl mt-0.5">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">Structure Fire Report</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">12 mins ago • 2.1km away</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Destination Details / Quick Contacts */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                     <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Navigation className="w-4 h-4 text-[#145369]" />
                        Destination Details
                    </h3>
                    {activeService ? (
                        <div className="space-y-4">
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Routing To</p>
                                <p className="text-sm font-black text-slate-800 mt-1 uppercase tracking-wider text-[#145369]">Nearest {activeService}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor / Room</p>
                                    <p className="text-xs font-bold text-slate-800 mt-1">ER - Trauma Bay 4</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="text-[10px] font-black tracking-widest uppercase text-[#0B6E6D] mt-1 flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-[#0B6E6D] rounded-full animate-pulse" />
                                        Staff Notified
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center py-8">
                            <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest">
                                Select an emergency service<br/>to begin priority routing
                            </p>
                        </div>
                    )}
                </div>

                {/* Always available SOS buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-50">
                     <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors font-black text-[10px] uppercase tracking-widest focus:ring-4 focus:ring-red-100 outline-none">
                        <Phone className="w-4 h-4" />
                        Call 112
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors font-black text-[10px] uppercase tracking-widest focus:ring-4 focus:ring-slate-100 outline-none">
                        <Share2 className="w-4 h-4" />
                        Share Location
                    </button>
                </div>
            </div>
        </div>
    );
}
