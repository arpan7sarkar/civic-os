import { Trash2, Zap, Construction, HeartPulse, Droplets, Flower2, ArrowRight } from "lucide-react";

export default function DepartmentGrid() {
    const departments = [
        { name: "Sanitation", icon: Trash2, description: "Waste collection & cleaning" },
        { name: "Electrical", icon: Zap, description: "Streetlights & power issues" },
        { name: "Roads", icon: Construction, description: "Potholes & road maintenance" },
        { name: "Public Health", icon: HeartPulse, description: "Clinics & vaccination centers" },
        { name: "Water", icon: Droplets, description: "Leakage & supply management" },
        { name: "Horticulture", icon: Flower2, description: "Parks & greenery upkeep" },
    ];

    return (
        <section className="w-full bg-mcd-bg py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Departments</h2>
                    <p className="text-mcd-slate">Quickly access services and report issues directly to the concerned department.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept, index) => (
                        <div
                            key={index}
                            className="group bg-white p-8 rounded-xl border border-gray-100 hover:border-mcd-navy transition-all duration-300 hover:shadow-xl cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    <dept.icon className="w-8 h-8 text-mcd-slate group-hover:text-mcd-navy transition-colors" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-mcd-navy group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.name}</h3>
                            <p className="text-sm text-mcd-slate leading-relaxed">
                                {dept.description}
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-mcd-navy uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Services
                                </span>
                                <span className="text-[10px] font-medium text-gray-400">
                                    98% SLA Compliance
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
