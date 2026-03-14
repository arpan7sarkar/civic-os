"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Image from "next/image";
import {
    CheckCircle2,
    MapPin,
    Calendar,
    User,
    Clock,
    Star,
    RotateCcw,
    CheckCircle,
    CheckSquare,
    AlertCircle,
    Info,
    Loader2
} from "lucide-react";
import { getComplaints, updateComplaint } from "@/lib/store";
import { Complaint } from "@/lib/types";

function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const all = getComplaints();
            const found = all.find(c => c.id === id);
            setComplaint(found || null);
        }
        setLoading(false);
    }, [id]);

    const handleUpdateStatus = (status: 'Resolved' | 'In Progress') => {
        if (complaint) {
            updateComplaint(complaint.id, { status });
            setComplaint({ ...complaint, status });
            alert(`Case status updated to: ${status}`);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-mcd-navy" />
        </div>
    );

    if (!complaint) return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-black text-mcd-navy uppercase">Ticket Not Found</h2>
            <p className="text-mcd-slate">The grievance ID you provided does not exist in our systems.</p>
            <button
                onClick={() => router.push('/')}
                className="mt-4 px-6 py-3 bg-mcd-navy text-white font-bold rounded-xl"
            >
                Back to Home
            </button>
        </div>
    );

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
            {/* Page Title & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cases • Verification</p>
                    <h1 className="text-4xl font-black text-mcd-navy tracking-tight">National Resolution Verification</h1>
                    <div className="flex items-center gap-4 text-sm font-bold text-mcd-slate">
                        <span className="bg-gray-100 px-3 py-1 rounded">Case ID: <span className="text-mcd-navy">{complaint.id}</span></span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" /> {complaint.ward}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-6 py-2 rounded-full border ${complaint.status === 'Resolved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {complaint.status === 'Resolved' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span className="text-sm font-black uppercase tracking-wider">
                        {complaint.status === 'Resolved' ? 'Confirmed Resolution' : 'Resolution Pending'}
                    </span>
                </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-4 md:mt-12">
                {/* Citizen Report */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col">
                    <div className="p-8 pb-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-mcd-navy uppercase tracking-widest text-sm">Citizen Report</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 1: Submission</span>
                    </div>

                    <div className="px-8 flex-1 space-y-6">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent"></div>
                            {complaint.citizenPhoto ? (
                                <img src={complaint.citizenPhoto} alt="Report" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center px-4">AI ANALYZED PHOTO<br />(Visual Evidence)</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] font-bold flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> {complaint.createdAt}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
                            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <Clock className="w-3 h-3" /> Case Type
                                </div>
                                <p className="text-xs font-bold text-mcd-slate">{complaint.category}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <MapPin className="w-3 h-3" /> Priority
                                </div>
                                <p className={`text-xs font-bold ${complaint.priority === 'Critical' ? 'text-red-600' : 'text-mcd-slate'}`}>
                                    {complaint.priority}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <User className="w-3 h-3" /> Dept
                                </div>
                                <p className="text-xs font-bold text-mcd-slate">{complaint.department}</p>
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
                            {complaint.repairPhoto ? (
                                <img src={complaint.repairPhoto} alt="Repair" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center px-4">OFFICIAL REPAIR LOG<br />PHOTO RECORD</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 bg-green-600 px-3 py-1.5 rounded-lg text-white text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
                                <CheckCircle className="w-3 h-3" /> Verified Fix
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
                            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <Calendar className="w-3 h-3" /> Status
                                </div>
                                <p className="text-xs font-bold text-mcd-slate">{complaint.status}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <User className="w-3 h-3" /> Assigned To
                                </div>
                                <p className="text-xs font-bold text-mcd-slate">{complaint.assignedTo || "Triage Pending"}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <MapPin className="w-3 h-3" /> Ward
                                </div>
                                <p className="text-xs font-bold text-mcd-slate leading-tight">{complaint.ward}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 md:p-10 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-mcd-navy">Citizen Verification</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />)}
                            </div>
                            <span className="text-xl font-black text-mcd-navy">5.0 / 5.0 AI Confidence</span>
                        </div>
                        <p className="text-sm font-medium text-gray-400 italic font-display">
                            "AI analyzed post-repair evidence matches pre-repair complaint visual profile."
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => handleUpdateStatus('In Progress')}
                            disabled={complaint.status === 'In Progress'}
                            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-orange-500 rounded-2xl text-orange-600 font-black flex items-center justify-center gap-2 hover:bg-orange-50 transition-all uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-orange-500/10 disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" /> Re-open Case
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('Resolved')}
                            disabled={complaint.status === 'Resolved'}
                            className="w-full sm:w-auto px-10 py-4 bg-mcd-navy border-2 border-mcd-navy rounded-2xl text-white font-black flex items-center justify-center gap-2 hover:bg-mcd-navy/90 transition-all uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-mcd-navy/20 disabled:opacity-50"
                        >
                            <CheckCircle className="w-5 h-5" /> Confirm Resolution
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <Info className="w-5 h-5 text-mcd-navy" />
                    <p className="text-[11px] font-bold text-gray-500 leading-normal">
                        Note: Confirming the resolution will permanently close this case file in the MCD database. This action is recorded with your digital signature.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function VerificationPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-mcd-navy" />
                </div>
            }>
                <VerificationContent />
            </Suspense>

            <footer className="mt-12 bg-white border-t border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-500" /> Compliant with GIGW & WCAG 2.1 standards
                </div>
                <div>
                    © 2026 CIVICOS NATIONAL | GOVT. OF INDIA
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-mcd-navy transition-colors">Help Desk</a>
                    <a href="#" className="hover:text-mcd-navy transition-colors">Privacy Policy</a>
                </div>
            </footer>
        </div>
    );
}
