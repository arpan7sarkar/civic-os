"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    Sparkles, 
    MapPin, 
    Camera, 
    Upload, 
    CheckCircle2, 
    Loader2,
    ArrowRight,
    AlertCircle,
    FileText,
    Mic,
    Square,
    Navigation
} from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { analyzeIssueAction, transcribeAudioAction } from "@/app/actions/ai";
import { reverseGeocodeAction, getAutocompleteSuggestionsAction } from "@/app/actions/geo";
import { uploadGrievanceImageAction, createGrievanceAction } from "@/app/actions/grievance";
import { saveComplaint, getComplaints } from "@/lib/store";
import { getServerProfileAction } from "@/app/actions/profile";
import { ComplaintCategory, Priority } from "@/lib/types";
import { generateGrievancePDF } from "@/lib/pdf";
import BottomNav from "@/components/BottomNav";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Map Loading...</div>
});

export default function ReportPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<{
        category: ComplaintCategory;
        priority: Priority;
        department: string;
        suggestedAction: string;
        refinedDescription: string;
    } | null>(null);

    const [location, setLocation] = useState("");
    const [coords, setCoords] = useState({ lat: 0, lng: 0 });
    const [isDetecting, setIsDetecting] = useState(false);
    
    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [isLocationSelected, setIsLocationSelected] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [ticketId, setTicketId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Photo State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);

    useEffect(() => {
        getServerProfileAction().then(result => {
            if (result.success && result.profile) {
                setUserId(result.profile.userId);
            } else if (result.success && !result.profile) {
                // Authenticated but no profile - go to registration
                router.replace('/auth/register');
            } else {
                // No session - go to login
                router.replace('/auth');
            }
        });
    }, [router]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleAIAnalyze = async () => {
        if (!description.trim()) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeIssueAction(description);
            setAiResult(result);
            setStep(2);
        } catch (err) {
            console.error("AI Analysis failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    setIsTranscribing(true);
                    try {
                        const response = await transcribeAudioAction(base64Audio);
                        if (response && response.transcript) {
                            setDescription(response.transcript);
                            // Auto-analyze after transcription
                            const analysis = await analyzeIssueAction(response.transcript);
                            setAiResult(analysis);
                            setStep(2);
                        }
                    } catch (err) {
                        console.error("Transcription failed:", err);
                    } finally {
                        setIsTranscribing(false);
                    }
                };
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const detectLocation = () => {
        setIsDetecting(true);
        setIsLocationSelected(false);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ lat: latitude, lng: longitude });
                    
                    try {
                        const res = await reverseGeocodeAction(latitude, longitude);
                        if (res.success && res.address) {
                            setLocation(res.address);
                            setIsLocationSelected(true);
                        } else {
                            setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
                            setIsLocationSelected(true);
                        }
                    } catch (err) {
                        setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
                        setIsLocationSelected(true);
                    } finally {
                        setIsDetecting(false);
                    }
                },
                (error) => {
                    console.error("GPS Error:", error);
                    setLocation("");
                    setIsDetecting(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setLocation("Geolocation not supported");
            setIsDetecting(false);
        }
    };

    // Handle autocomplete fetching
    useEffect(() => {
        if (!location || location.length < 3 || isLocationSelected) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingSuggestions(true);
            try {
                const res = await getAutocompleteSuggestionsAction(location);
                if (res.success) {
                    setSuggestions(res.suggestions);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Autocomplete fetch failed:", err);
            } finally {
                setIsSearchingSuggestions(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [location, isLocationSelected]);

    const handleSelectSuggestion = (suggestion: any) => {
        setLocation(suggestion.formatted);
        setCoords({ lat: suggestion.lat, lng: suggestion.lon });
        setIsLocationSelected(true);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!userId || !aiResult) return;
        setIsSubmitting(true);
        
        let photoId = "";
        
        // 1. Upload Photo if selected
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            const uploadRes = await uploadGrievanceImageAction(formData);
            if (uploadRes.success && uploadRes.fileId) {
                photoId = uploadRes.fileId;
            }
        }

        const newTicketId = `CIV-${Math.floor(100000 + Math.random() * 900000)}`;
        
        try {
            // 2. Save to Appwrite
            const appwriteRes = await createGrievanceAction({
                id: newTicketId,
                description: aiResult.refinedDescription, // Use sanitized English version
                rawDescription: description, // Optionally store raw input for audit
                category: aiResult.category,
                priority: aiResult.priority,
                department: aiResult.department,
                lat: coords.lat || 28.7041,
                lng: coords.lng || 77.1025,
                status: 'Pending',
                assignedTo: 'Processing',
                ward: location.split(',')[0] || 'National Zone',
                userId,
                citizenPhoto: photoId
            });

            if (!appwriteRes.success) {
                console.error("Appwrite Submission Failed:", appwriteRes.error);
                setSubmitError(`Database Sync Failed: ${appwriteRes.error}. Please check your Appwrite collection attributes.`);
                setIsSubmitting(false);
                return;
            }

            // 3. Fallback/Sync to local storage for existing dashboard components
            await saveComplaint({
                id: newTicketId,
                description: aiResult.refinedDescription, // Use sanitized English version
                category: aiResult.category,
                priority: aiResult.priority,
                department: aiResult.department,
                lat: coords.lat || 28.7041,
                lng: coords.lng || 77.1025,
                status: 'Pending',
                assignedTo: 'Processing',
                createdAt: new Date().toISOString(),
                ward: location.split(',')[0] || 'National Zone',
                userId,
                citizenPhoto: photoId
            });

            setTicketId(newTicketId);
            setStep(3);
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadReceipt = async () => {
        if (!ticketId || !aiResult || !userId) return;
        
        await generateGrievancePDF({
            id: ticketId,
            description: aiResult.refinedDescription,
            category: aiResult.category,
            priority: aiResult.priority,
            department: aiResult.department,
            lat: 28.7041,
            lng: 77.1025,
            status: 'Pending',
            assignedTo: 'Processing',
            createdAt: new Date().toISOString(),
            ward: 'Ward 88 (Rohini)',
            userId
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 fixed top-0 w-full z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">Report a Grievance</h1>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider hidden xs:block">Digital Public Infrastructure for India</p>
                    </div>
                </div>
                <div className="relative w-8 h-8">
                    <Image 
                        src="/logo1.png" 
                        alt="MCD Logo" 
                        fill
                        className="object-contain" 
                        sizes="32px"
                    />
                </div>
            </header>

            <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-10">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-gov-blue' : 'bg-slate-200'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">1. The Issue Description</h2>
                            <p className="text-sm text-slate-500">Describe the issue in your own words. English or Hindi supported.</p>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 mb-6">
                            <textarea
                                value={description}
                                onChange={handleDescriptionChange}
                                placeholder="e.g., The streetlight near Lajpat Nagar Metro Gate 3 has been broken for a week..."
                                className="w-full h-48 p-4 bg-slate-50 border-none rounded-2xl resize-none text-slate-700 focus:ring-2 focus:ring-gov-blue/10 transition-all outline-none"
                            />
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Sparkles className="w-3 h-3 text-gov-blue" />
                                AI will automatically categorize and route your complaint
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAIAnalyze}
                                disabled={!description.trim() || isAnalyzing || isTranscribing}
                                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${description.trim() ? 'bg-gov-blue text-white shadow-gov-blue/20 hover:-translate-y-0.5 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />}
                                {isAnalyzing ? "AI Routing..." : "Continue with AI Analysis"}
                            </button>

                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isAnalyzing || isTranscribing}
                                className={`w-full sm:w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {isTranscribing ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : isRecording ? (
                                    <div className="flex items-center gap-2">
                                        <Square className="w-6 h-6 fill-current" />
                                        <span className="sm:hidden font-black text-xs uppercase">Stop Recording</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Mic className="w-6 h-6" />
                                        <span className="sm:hidden font-black text-xs uppercase">Voice Report</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && aiResult && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {submitError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold animate-in shake-1">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {submitError}
                            </div>
                        )}
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">2. Location & Evidence</h2>
                            <p className="text-sm text-slate-500">Help us locate the issue precisely for rapid resolution.</p>
                        </div>

                        {/* AI Detection Preview */}
                        <div className="bg-gov-blue/5 border border-gov-blue/10 rounded-3xl p-6 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gov-blue shadow-sm">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-1">AI Classification & Translation</div>
                                    <div className="text-sm font-bold text-slate-800">
                                        Categorized as <span className="text-gov-blue">{aiResult.category}</span> • Priority: <span className="text-red-500">{aiResult.priority}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-gov-blue/5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">English Refinement</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{aiResult.refinedDescription}"</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Location Details</label>
                                <div className="flex flex-col gap-3 relative">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => {
                                                    setLocation(e.target.value);
                                                    setIsLocationSelected(false);
                                                }}
                                                onFocus={() => location.length >= 3 && setShowSuggestions(true)}
                                                placeholder="Type address for suggestions..."
                                                className={`w-full px-5 py-4 bg-white border ${isLocationSelected ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-slate-100'} rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-gov-blue/20 transition-all outline-none`}
                                            />
                                            {isSearchingSuggestions && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="w-4 h-4 text-gov-blue animate-spin" />
                                                </div>
                                            )}
                                            {isLocationSelected && !isSearchingSuggestions && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={detectLocation}
                                            className="py-4 px-6 bg-slate-900 text-white rounded-2xl transition-all hover:bg-slate-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                            {isDetecting ? "Detecting..." : "GPS Detect"}
                                        </button>
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSelectSuggestion(s)}
                                                    className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-start gap-3 group"
                                                >
                                                    <MapPin className="w-4 h-4 text-slate-300 group-hover:text-gov-blue mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{s.address || s.formatted.split(',')[0]}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{s.formatted}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {(!isLocationSelected && location.length > 0 && !isSearchingSuggestions && suggestions.length === 0) && (
                                        <div className="mt-1 px-4 text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Please select a valid location from suggestions
                                        </div>
                                    )}

                                    {/* Map Preview */}
                                    {isLocationSelected && (
                                        <div className="mt-4 h-48 md:h-64 rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative animate-in fade-in zoom-in-95 duration-500">
                                            <MapComponent 
                                                grievances={[]} 
                                                userLocation={[coords.lat, coords.lng]} 
                                                onTrackTicketAction={() => {}} 
                                            />
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/50 shadow-sm z-10 text-[10px] font-black text-gov-blue uppercase tracking-widest flex items-center gap-1.5">
                                                <Navigation className="w-3 h-3" />
                                                Verified Position
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Photo Evidence (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    id="photo-upload"
                                />
                                <label 
                                    htmlFor="photo-upload"
                                    className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-white/50 hover:bg-white hover:border-gov-blue/30 transition-all cursor-pointer overflow-hidden group"
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100">
                                            <Image 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                fill
                                                className="object-cover" 
                                                sizes="(max-width: 672px) 100vw, 672px"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest z-10">
                                                Change Photo
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-gov-blue transition-colors">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-600">Upload Photo of the Issue</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">PNG, JPG up to 10MB</p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-8 py-4 bg-white border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Back
                            </button>
                             <button
                                onClick={handleSubmit}
                                disabled={!isLocationSelected || isSubmitting}
                                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isLocationSelected ? 'bg-[#0EA5E9] text-white shadow-blue-200 hover:-translate-y-0.5 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isSubmitting ? "Submitting..." : "Submit Grievance"}
                            </button>
                        </div>
                    </div>
                )}                {step === 3 && ticketId && (
                    <div className="animate-in zoom-in-95 fade-in duration-500">
                        <div className="bg-[#0EA5A4]/5 border border-[#0EA5A4]/10 rounded-[40px] p-10 text-center">
                            <div className="w-20 h-20 bg-[#0EA5A4] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#0EA5A4]/20">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-2">Ticket #{ticketId} Generated</h2>
                            <p className="text-sm text-slate-500 mb-10">Your grievance has been successfully submitted to the Municipal Corporation of Delhi.</p>

                            <div className="bg-white rounded-3xl p-6 text-left border border-slate-100 shadow-sm mb-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorized as</span>
                                        <span className="px-3 py-1 bg-gov-blue/10 text-gov-blue rounded-lg text-[10px] font-black uppercase tracking-widest">{aiResult?.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Routed to</span>
                                        <span className="text-sm font-bold text-slate-700">{aiResult?.department}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</span>
                                        <span className="text-sm font-black text-red-500 uppercase tracking-widest">{aiResult?.priority}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link 
                                    href="/dashboard"
                                    className="py-4 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#002244] transition-all shadow-lg flex items-center justify-center"
                                >
                                    Track Status
                                </Link>
                                <button
                                    onClick={downloadReceipt}
                                    className="py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Download PDF Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
