export default function StatsRibbon() {
    const stats = [
        { label: "Complaints Received", value: "24,852", active: false, color: 'primary' },
        { label: "Resolved in 24h", value: "1,284", active: true, color: 'primary' },
        { label: "Active Wards", value: "250", active: false, color: 'primary' },
        { label: "Satisfaction Rate", value: "92%", active: false, color: 'primary' },
    ];

    return (
        <section className="bg-white border-y border-slate-100 shadow-sm py-8 font-roboto">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className={`flex flex-col items-center text-center ${index !== 0 ? 'border-l border-slate-100' : ''}`}>
                            <span className={`${stat.color === 'gov-blue' ? 'text-gov-blue' : 'text-primary'} text-3xl font-black mb-1`}>
                                {stat.value}
                            </span>
                            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
