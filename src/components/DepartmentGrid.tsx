"use client";

import { HiOutlineTrash, HiOutlineLightningBolt, HiOutlineTruck, HiOutlineHeart, HiOutlineHome, HiOutlineGlobeAlt } from "react-icons/hi";
import { FiArrowRight, FiDroplet } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { getCurrentUserAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DepartmentGrid() {
    const [currentUserId, setCurrentUserId] = useState<string>('anonymous');
    const router = useRouter();

    const departments = useMemo(() => [
        { name: "Sanitation", icon: HiOutlineTrash, description: "Waste collection & cleaning" },
        { name: "Electrical", icon: HiOutlineLightningBolt, description: "Streetlights & power issues" },
        { name: "Roads", icon: HiOutlineTruck, description: "Potholes & maintenance" },
        { name: "Public Health", icon: HiOutlineHeart, description: "Clinics & vaccination" },
        { name: "Water", icon: FiDroplet, description: "Leakage & management" },
        { name: "Infrastructure", icon: HiOutlineHome, description: "Parks & greenery upkeep" },
    ], []);

    useEffect(() => {
        const checkUser = async () => {
            const { success, user } = await getCurrentUserAction();
            if (success && user) {
                setCurrentUserId(user.$id);
            }
        };
        checkUser();
    }, []);

    const handleReportRedirect = (dept: string) => {
        if (currentUserId === 'anonymous') {
            router.push('/auth');
        } else {
            router.push(`/dashboard?ref=${encodeURIComponent(dept)}`);
        }
    };

    return (
        <section id="services" className="py-24 bg-white transition-colors duration-500">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl px-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gov-blue/5 text-gov-blue text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full w-fit mb-4 border border-gov-blue/10">
                            <span className="w-1.5 h-1.5 bg-gov-blue rounded-full animate-pulse" />
                            Direct Citizen Hub
                        </div>
                        <h2 className="text-slate-900 text-2xl md:text-5xl font-black tracking-tight mb-3 md:mb-4 tracking-tighter">Unified Municipal Services</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">Access specialized departments directly.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {departments.map((service, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5, scale: 1.01 }}
                            className="group relative bg-white/70 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:border-gov-blue/20 hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.12)] transition-all flex flex-col h-full overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gov-blue/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-start justify-between mb-4 md:mb-8 relative z-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-[1.25rem] flex items-center justify-center text-gov-blue group-hover:!bg-gov-blue group-hover:!text-white transition-all duration-500 border-2 border-slate-200 group-hover:border-gov-blue/20 shadow-inner group-hover:shadow-gov-blue/30 group-hover:rotate-6">
                                    <service.icon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div className="hidden xs:block px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 shadow-sm">
                                    OFFICIAL
                                </div>
                            </div>

                            <div className="relative z-10 flex-grow">
                                <h3 className="text-slate-900 text-xl md:text-2xl font-black mb-1 md:mb-3 group-hover:text-gov-blue transition-colors">{service.name}</h3>
                                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-6 md:mb-8">
                                    {service.description}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 relative z-10">
                                <button
                                    onClick={() => handleReportRedirect(service.name)}
                                    aria-label={`Report an issue related to ${service.name}`}
                                    className="flex-1 py-3 md:py-4 bg-slate-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                                >
                                    Report
                                </button>
                                <button
                                    onClick={() => router.push('/map')}
                                    aria-label={`View existing issues for ${service.name}`}
                                    className="flex-1 py-3 md:py-4 bg-white border-2 border-slate-100 text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-gov-blue transition-all flex items-center justify-center gap-2"
                                >
                                    Issues
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
