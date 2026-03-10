import { Search, Sparkles } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full overflow-hidden bg-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e3a8a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-mcd-navy text-xs font-bold mb-6 border border-blue-100 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-mcd-navy" />
                        AI-Powered Governance
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        A Smarter, Cleaner Delhi <br />
                        <span className="text-mcd-navy">for Every Citizen.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-mcd-slate max-w-2xl mx-auto leading-relaxed">
                        Report issues, track resolutions, and build a better ward using AI-driven governance. Direct connection between citizens and MCD officers.
                    </p>
                </div>

                {/* CTA Area */}
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 mb-16">
                    <button className="flex-1 bg-mcd-navy text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-blue-900 transition-all transform hover:-translate-y-1">
                        Report an Issue
                    </button>

                    <div className="flex-[1.5] relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-mcd-navy transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Track Status: Enter Complaint ID (e.g., MCD-2024-X8A)"
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-lg focus:border-mcd-navy outline-none transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                </div>

                {/* AI Quick-Report Card */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-mcd-navy px-6 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-white">
                                <Sparkles className="w-4 h-4 text-blue-200" />
                                <span className="text-sm font-bold uppercase tracking-wider">AI Quick-Report</span>
                            </div>
                            <span className="text-[10px] text-blue-200 font-medium">Report in 30 Seconds</span>
                        </div>
                        <div className="p-6">
                            <div className="relative mb-4">
                                <textarea
                                    rows={2}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-mcd-navy transition-all resize-none text-gray-700"
                                    placeholder="Tell us what's wrong? e.g., 'Garbage pile at Lajpat Nagar Metro Station' or 'No functional streetlights in Block C, Rohini'"
                                ></textarea>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 bg-mcd-navy/5 text-mcd-navy font-bold py-3 rounded-xl hover:bg-mcd-navy/10 transition-all border border-mcd-navy/20">
                                <Sparkles className="w-4 h-4 text-mcd-navy" />
                                Analyze with AI
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
