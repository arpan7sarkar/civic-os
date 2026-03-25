"use client";

import React from "react";
import { CopyPlus, ShieldAlert, Flame, Loader2 } from "lucide-react";

export interface EmergencyActionsProps {
    action: (service: string, coords: [number, number]) => void | Promise<void>;
    activeService: string | null;
    servicesData?: any[] | null;
    isRouting?: boolean;
}

const EMERGENCY_ICONS: Record<string, any> = {
    "Hospital": CopyPlus,
    "Police": ShieldAlert,
    "Fire": Flame
};

export default function EmergencyActions({ action, activeService, servicesData, isRouting }: EmergencyActionsProps) {
    if (!servicesData) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-full h-32 rounded-[2rem] bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm transition-all animate-pulse">
                        <div className="flex items-center gap-4 w-full px-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/60" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 bg-white/60 rounded w-3/4" />
                                <div className="h-4 bg-white/60 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {servicesData.map((service) => {
                const isActive = activeService === service.id;
                const Icon = EMERGENCY_ICONS[service.id] || ShieldAlert;
                const activeColor = service.color.split('-')[1]; // e.g., 'red', 'blue', 'orange'

                return (
                    <button
                        key={service.id}
                        onClick={() => action(service.id, service.coords)}
                        disabled={isRouting}
                        className={`group relative w-full h-32 rounded-[2rem] overflow-hidden transition-all duration-300 text-left active:scale-[0.98] outline-none
                            ${isActive 
                                ? `ring-4 ring-${activeColor}-500/30 bg-white shadow-xl shadow-${activeColor}-500/10 border border-${activeColor}-200` 
                                : `bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300`
                            }
                            ${isRouting && !isActive ? 'opacity-50 grayscale select-none' : ''}
                        `}
                    >
                        <div className="absolute inset-0 flex items-center p-5 gap-5">
                            {/* Icon Container */}
                            <div className={`p-4 rounded-2xl transition-transform duration-300 ${isActive ? `bg-${activeColor}-500 text-white shadow-lg shadow-${activeColor}-500/30 scale-110` : `${service.bgColor} ${service.color} group-hover:scale-105`}`}>
                                {isRouting && isActive ? (
                                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
                                ) : (
                                    <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                                )}
                            </div>
                            
                            {/* Text Container */}
                            <div className="flex flex-col flex-1">
                                <span className={`text-base sm:text-lg font-black uppercase tracking-widest ${isActive ? `text-${activeColor}-600` : 'text-slate-800'}`}>
                                    {service.label}
                                </span>
                                <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest mt-1 ${isActive ? `text-${activeColor}-500/80 animate-pulse` : 'text-slate-400'}`}>
                                    {isRouting && isActive ? `Finding nearest ${service.id}...` : 
                                     isActive ? "Route Established" : 
                                     "Tap to route"}
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
