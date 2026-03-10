export default function StatsRibbon() {
    const stats = [
        { label: "Complaints Received", value: "24,852", active: false },
        { label: "Resolved in 24h", value: "1,284", active: true },
        { label: "Active Wards", value: "250", active: false },
        { label: "Satisfaction Rate", value: "92%", active: false },
    ];

    return (
        <div className="w-full bg-mcd-navy py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <span className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {stat.value}
                            </span>
                            <span className={`text-xs md:text-sm font-medium uppercase tracking-widest ${stat.active ? 'text-green-400' : 'text-blue-200'}`}>
                                {stat.label}
                            </span>
                            {stat.active && (
                                <div className="mt-2 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Real-time Update</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
