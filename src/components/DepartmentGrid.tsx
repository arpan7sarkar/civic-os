"use client";

import Link from "next/link";
import { Trash2, Zap, Construction, HeartPulse, Droplets, Flower2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function DepartmentGrid() {
    const [currentUserId, setCurrentUserId] = useState<string>('anonymous');
    const router = useRouter();

    const departments = [
        { name: "Sanitation", icon: Trash2, description: "Waste collection & cleaning" },
        { name: "Electrical", icon: Zap, description: "Streetlights & power issues" },
        { name: "Roads", icon: Construction, description: "Potholes & road maintenance" },
        { name: "Public Health", icon: HeartPulse, description: "Clinics & vaccination centers" },
        { name: "Water", icon: Droplets, description: "Leakage & supply management" },
        { name: "Horticulture", icon: Flower2, description: "Parks & greenery upkeep" },
    ];

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
        <section id="services" className="py-20 bg-background-light">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-gov-blue text-3xl font-bold tracking-tight">Direct Citizen Services</h2>
                        <p className="text-slate-600 mt-2">Access specialized municipal services for your neighborhood</p>
                    </div>
                    <Link 
                        href="#" 
                        aria-label="View all municipal services"
                        className="text-primary font-bold flex items-center gap-2 hover:underline"
                    >
                        View All Services <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((service, index) => (
                        <div
                            key={index}
                            className="group bg-white p-8 rounded-lg border border-slate-200 hover:border-primary/50 hover:shadow-xl transition-all"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                                <service.icon className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-gov-blue text-xl font-bold mb-3">{service.name}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                {service.description}
                            </p>
                            <button
                                onClick={() => handleReportRedirect(service.name)}
                                aria-label={`Report a civic issue related to ${service.name}`}
                                className="text-primary font-bold inline-flex items-center gap-2 transition-colors group/btn"
                            >
                                Report Now <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
