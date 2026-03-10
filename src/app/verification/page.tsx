"use client";

import Header from "@/components/Header";
import Image from "next/image";
import {
    CheckCircle2,
    MapPin,
    Calendar,
    User,
    Clock,
    Star,
    ChevronRight,
    RotateCcw,
    CheckCircle,
    ExternalLink,
    CheckSquare
} from "lucide-react";

export default function VerificationPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
                {/* Page Title & Status */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cases • Verification</p>
                        <h1 className="text-4xl font-black text-mcd-navy tracking-tight">Resolution Verification</h1>
                        <div className="flex items-center gap-4 text-sm font-bold text-mcd-slate">
                            <span className="bg-gray-100 px-3 py-1 rounded">Case ID: <span className="text-mcd-navy">MCD-7720-98E</span></span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" /> Sector 12, RK Puram</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-wider">Marked as Resolved</span>
                    </div>
                </div>

                {/* Comparison Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    {/* Citizen Report */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col">
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <AlertCircleIcon />
                                </div>
                                <h3 className="font-black text-mcd-navy uppercase tracking-widest text-sm">Citizen Report</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 1: Submission</span>
                        </div>

                        <div className="px-8 flex-1 space-y-6">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Report Photo</span>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] font-bold flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Oct 12, 2023
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
                                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <Clock className="w-3 h-3" /> Reported At
                                    </div>
                                    <p className="text-xs font-bold text-mcd-slate">2023-10-12 | 09:15 AM</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <MapPin className="w-3 h-3" /> Coordinates
                                    </div>
                                    <p className="text-xs font-bold text-mcd-slate">28.6139° N, 77.2090° E</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <User className="w-3 h-3" /> Citizen
                                    </div>
                                    <p className="text-xs font-bold text-mcd-slate">ID: CIT-882 (Verified)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Taken */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col">
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-mcd-navy uppercase tracking-widest text-sm">Action Taken</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 2: Resolution</span>
                        </div>

                        <div className="px-8 flex-1 space-y-6">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border-4 border-green-50">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Verification Photo</span>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-green-600 px-3 py-1.5 rounded-lg text-white text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
                                    <CheckCircle className="w-3 h-3" /> Verified Fixed
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
                                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <Calendar className="w-3 h-3" /> Completed At
                                    </div>
                                    <p className="text-xs font-bold text-mcd-slate">2023-10-14 | 02:30 PM</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <User className="w-3 h-3" /> Assigned Unit
                                    </div>
                                    <p className="text-xs font-bold text-mcd-slate">Worker: SW-441 | Unit: SZ-09</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <MapPin className="w-3 h-3" /> Department
                                    </div>
                                    <p className="text-xs font-bold text-mcd-slate leading-tight">Sanitation (MCD-South)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-10 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-mcd-navy">Citizen Feedback</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((i) => <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />)}
                                    <Star className="w-6 h-6 text-gray-300" />
                                </div>
                                <span className="text-xl font-black text-mcd-navy">4.0 / 5.0</span>
                            </div>
                            <p className="text-sm font-medium text-gray-400 italic font-display">"Based on citizen verification of the physical site"</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-white border-2 border-orange-500 rounded-2xl text-orange-600 font-black flex items-center gap-2 hover:bg-orange-50 transition-all uppercase tracking-widest text-sm shadow-lg shadow-orange-500/10">
                                <RotateCcw className="w-4 h-4" /> Re-open Case
                            </button>
                            <button className="px-10 py-4 bg-mcd-navy border-2 border-mcd-navy rounded-2xl text-white font-black flex items-center gap-2 hover:bg-mcd-navy/90 transition-all uppercase tracking-widest text-sm shadow-xl shadow-mcd-navy/20">
                                <CheckCircle className="w-5 h-5" /> Confirm Resolution
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                        <span className="text-gray-400">
                            <AlertInfoIcon />
                        </span>
                        <p className="text-[11px] font-bold text-gray-500 leading-normal">
                            Note: Confirming the resolution will permanently close this case file in the MCD database. This action is auditable.
                        </p>
                    </div>
                </div>

                {/* Map Area */}
                <div className="bg-gray-100 rounded-[2rem] h-64 overflow-hidden relative shadow-inner">
                    {/* Dummy Map Visual with Grid Pattern */}
                    <div className="absolute inset-0 z-0 bg-[#e2e8f0] opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative pointer-events-auto">
                            <div className="bg-mcd-navy text-white text-[11px] font-black w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center -translate-x-1/2 -translate-y-full mb-1">
                                <MapPin className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                        <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-full shadow-2xl flex items-center gap-2 text-xs font-black text-mcd-navy uppercase tracking-widest hover:bg-gray-50 transition-all">
                            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuZRYBTRN142_EqDkHAa4TQGyzymJzTxjL6kyKgcIppMVd1ptAM2gZWOHp1lDMMygnVWEKY-GIb41J9TlJGm10JkjQ6Zh0OhLdww91kDkA4dRRxA122yjbk9D_VeOf5H14cIgE27PpQXPZkgarSh5My5ZsE42YQ_5Z-3U3UGBmJY6Xm7tyF0TprUHvXDz-KEJIoE79Py2o2IAbMw3vBwXzB1JljeclhfygvEgKDMU3srRwMT9VfDj_mc8D_Mm2EjYbUHSQOwqcZg" width={16} height={16} alt="ArcGIS" />
                            View exact location on ArcGIS
                        </button>
                    </div>
                </div>
            </main>

            <footer className="mt-12 bg-white border-t border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                    <CheckSquare className="w-4 h-4 text-green-500" /> Compliant with GIGW & WCAG 2.1 standards
                </div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    © 2023 MUNICIPAL CORPORATION OF DELHI | CIVICOS V2.4.0
                </div>
                <div className="flex gap-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <a href="#" className="hover:text-mcd-navy transition-colors">Help Desk</a>
                    <a href="#" className="hover:text-mcd-navy transition-colors">Privacy Policy</a>
                </div>
            </footer>
        </div>
    );
}

function AlertCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    );
}

function AlertInfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    );
}
