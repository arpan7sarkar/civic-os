"use client";

import React from "react";
import { CopyPlus, ShieldAlert, Flame } from "lucide-react";

interface EmergencyActionsProps {
    action: (service: string, coords: [number, number]) => void;
    activeService: string | null;
}

const EMERGENCY_SERVICES = [
    {
        id: "Hospital",
        icon: CopyPlus, 
        label: "Nearest Hospital",
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-100",
        coords: [28.7041, 77.1025] as [number, number]
    },
    {
        id: "Police",
        icon: ShieldAlert,
        label: "Police Station",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-100",
        coords: [28.6139, 77.2090] as [number, number]
    },
    {
        id: "Fire",
        icon: Flame,
        label: "Fire Station",
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-100",
        coords: [28.5355, 77.2410] as [number, number]
    }
];

export default function EmergencyActions({ action, activeService }: EmergencyActionsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {EMERGENCY_SERVICES.map((service) => {
                const isActive = activeService === service.id;
                const Icon = service.icon;

                return (
                    <button
                        key={service.id}
                        onClick={() => action(service.id, service.coords)}
                        className={`relative w-full h-24 sm:h-28 rounded-3xl overflow-hidden transition-all duration-300
                            ${isActive 
                                ? `ring-2 ring-offset-2 ring-${service.color.split('-')[1]}-500 shadow-lg scale-[1.02] bg-white` 
                                : `bg-white hover:bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md`
                            }
                        `}
                    >
                        <div className="absolute inset-0 flex items-center p-4 gap-4">
                            <div className={`p-4 rounded-2xl ${service.bgColor} ${service.borderColor} border`}>
                                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${service.color}`} />
                            </div>
                            <div className="flex flex-col items-start justify-center text-left">
                                <span className={`text-sm sm:text-base font-black uppercase tracking-widest ${isActive ? service.color : 'text-slate-800'}`}>
                                    {service.label}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Tap to Route
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
