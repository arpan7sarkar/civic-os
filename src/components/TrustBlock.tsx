"use client";

import { HiShieldCheck, HiStatusOnline, HiClock, HiBadgeCheck } from "react-icons/hi";
import { motion } from "framer-motion";
import Image from "next/image";

export default function TrustBlock() {
    const pillars = [
        {
            icon: HiBadgeCheck,
            title: "AI-Powered Triage",
            desc: "Automated classification and priority assessment for rapid response.",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            icon: HiStatusOnline,
            title: "Direct Governance",
            desc: "Immediate routing into Local Municipal and Zonal Authority task queues.",
            color: "text-gov-blue",
            bg: "bg-blue-50"
        },
        {
            icon: HiShieldCheck,
            title: "Public Accountability",
            desc: "Transparent resolution lifecycle with immutable audit trails.",
            color: "text-primary",
            bg: "bg-primary/5"
        }
    ];

    return (
        <section className="pt-8 md:pt-12 pb-20 bg-slate-50/50">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-gov-blue text-xs font-black uppercase tracking-[0.3em]">Core Commitments</h2>
                    <p className="text-slate-900 text-3xl md:text-4xl font-[950] tracking-tight">Accountability & Fast Resolution</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pillars.map((pillar, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
                        >
                            <div className={`w-14 h-14 ${pillar.bg} ${pillar.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <pillar.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-slate-900 text-xl font-black mb-3">{pillar.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                {pillar.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 flex flex-col items-center">
                    <div className="px-6 py-3 bg-white border border-slate-200 rounded-full shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 overflow-hidden relative mr-3 shrink-0">
                            <div className="absolute inset-0 bg-gov-blue/5" />
                            <Image src={`/logo1.png`} alt="MCD Official" width={36} height={36} className="object-cover p-1.5" />
                        </div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest"> 
                            Official Digital Public Infrastructure 
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
