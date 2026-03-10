"use client";

import { useState } from "react";
import { Search, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { analyzeComplaint } from "@/lib/ai";
import { saveComplaint } from "@/lib/store";
import { AnalysisResult, Complaint } from "@/lib/types";

export default function Hero() {
    const [description, setDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!description.trim()) return;

        setIsAnalyzing(true);
        setResult(null);
        setTicketId(null);

        try {
            const analysis = await analyzeComplaint(description);
            setResult(analysis);

            const newTicketId = `CIV-${Math.floor(1000 + Math.random() * 9000)}`;
            setTicketId(newTicketId);

            const newComplaint: Complaint = {
                id: newTicketId,
                description,
                category: analysis.category,
                priority: analysis.priority,
                department: analysis.department,
                lat: 28.6139 + (Math.random() - 0.5) * 0.1, // Random Delhi coords
                lng: 77.2090 + (Math.random() - 0.5) * 0.1,
                status: 'Pending',
                assignedTo: 'Officer Unassigned',
                createdAt: new Date().toISOString(),
                ward: 'Ward 104 (Lajpat Nagar)' // Default ward for demo
            };

            saveComplaint(newComplaint);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

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
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-mcd-navy transition-all resize-none text-gray-700"
                                    placeholder="Tell us what's wrong? e.g., 'Garbage pile at Lajpat Nagar Metro Station' or 'No functional streetlights in Block C, Rohini'"
                                ></textarea>
                            </div>

                            {!ticketId ? (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !description.trim()}
                                    className="w-full flex items-center justify-center gap-2 bg-mcd-navy/5 text-mcd-navy font-bold py-4 rounded-xl hover:bg-mcd-navy/10 transition-all border border-mcd-navy/20 disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-mcd-navy" />
                                    )}
                                    {isAnalyzing ? "Analyzing Complaint..." : "Analyze with AI"}
                                </button>
                            ) : (
                                <div className="p-4 bg-green-50 border border-green-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="text-sm font-bold uppercase tracking-wider">Ticket Generated</span>
                                        </div>
                                        <span className="text-xs font-black text-green-800">{ticketId}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white p-2 rounded-lg border border-green-100">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Category</p>
                                            <p className="text-[10px] font-black text-mcd-navy">{result?.category}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-green-100">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Priority</p>
                                            <p className="text-[10px] font-black text-mcd-navy">{result?.priority}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-green-100">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Dept</p>
                                            <p className="text-[10px] font-black text-mcd-navy">{result?.department}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setTicketId(null); setDescription(""); }}
                                        className="w-full mt-4 text-[10px] font-bold text-green-700 uppercase tracking-widest hover:underline"
                                    >
                                        Report another issue
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
