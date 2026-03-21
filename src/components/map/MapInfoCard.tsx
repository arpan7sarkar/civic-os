"use client";

import React from 'react';
import { X, Clock, MapPin, User, ArrowRight, ShieldAlert, CheckCircle, Timer, Sparkles } from 'lucide-react';
import { Complaint } from '@/lib/types';
import Image from 'next/image';
import { GRIEVANCE_IMAGES_BUCKET_ID, APPWRITE_PROJECT_ID } from '@/lib/appwrite';

interface MapInfoCardProps {
    complaint: Complaint | null;
    onCloseAction: () => void;
    onTrackAction: (id: string) => void;
}

export default function MapInfoCard({ complaint, onCloseAction, onTrackAction }: MapInfoCardProps) {
    // Note: Complaint is guaranteed non-null by parent conditional render
    if (!complaint) return null;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Resolved': return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', icon: CheckCircle };
            case 'In Progress': return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', icon: Timer };
            default: return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', icon: ShieldAlert };
        }
    };

    const statusStyles = getStatusStyles(complaint.status);
    const StatusIcon = statusStyles.icon;

    return (
        <div className="absolute bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-96 z-[1001] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/50 backdrop-blur-xl">
                {/* Image Section */}
                <div className="relative h-44 w-full bg-slate-100">
                    {complaint.citizenPhoto ? (
                        <Image 
                            src={`https://sgp.cloud.appwrite.io/v1/storage/buckets/${GRIEVANCE_IMAGES_BUCKET_ID}/files/${complaint.citizenPhoto}/preview?project=${APPWRITE_PROJECT_ID}`} 
                            alt="Issue" 
                            fill
                            className="object-cover" 
                            sizes="(max-width: 768px) 100vw, 384px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                            <MapPin className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    
                    <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-xl border border-white/20 ${statusStyles.bg} ${statusStyles.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{complaint.status}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onCloseAction}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-slate-600 shadow-lg transition-all active:scale-95"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-1">{complaint.category}</p>
                            <h3 className="text-lg font-black text-slate-800 leading-tight">#{complaint.id}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <p className="text-sm font-medium text-slate-600 mb-6 line-clamp-3 leading-relaxed italic">
                        "{complaint.description}"
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                                <span className="text-xs font-bold text-slate-800 truncate">{complaint.ward}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assignee</span>
                                <span className="text-xs font-bold text-slate-800 truncate">{complaint.assignedTo || "Review"}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => onTrackAction(complaint.id)}
                        className="w-full py-4 bg-gov-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group border-b-4 border-blue-900 active:border-b-0 active:translate-y-1"
                    >
                        Live Tracking 
                        <div className="flex items-center gap-1">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
