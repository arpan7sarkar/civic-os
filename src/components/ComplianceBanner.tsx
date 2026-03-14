"use client";

import { useEffect, useState } from 'react';
import { getServerProfileAction } from '@/app/actions/profile';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ComplianceBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkCompliance = async () => {
            try {
                const { success, isFullProfile, profile } = await getServerProfileAction();
                
                if (success) {
                    // Check for "glitch" users: NO profile document or "Bridge" placeholder
                    const isGlitchUser = !isFullProfile || (profile?.name && profile.name.includes('Bridge'));
                    setIsVisible(!!isGlitchUser);
                }
            } catch (err) {
                console.error("[COMPLIANCE_BANNER] Check failed:", err);
            } finally {
                setIsLoading(false);
            }
        };

        checkCompliance();
    }, []);

    if (isLoading || !isVisible) return null;

    return (
        <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-[100] shadow-lg animate-in slide-in-from-top duration-500">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-100 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-wider">
                        Action Required: Mandatory Profile Update
                    </span>
                </div>
                <p className="text-xs sm:text-sm font-medium opacity-90">
                    Your account is missing required registration details (Name, ID Type). Complete now to avoid service interruption.
                </p>
                <Link 
                    href="/auth/register"
                    className="flex items-center gap-1 px-4 py-1.5 bg-white text-red-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all group shrink-0"
                >
                    Update Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
