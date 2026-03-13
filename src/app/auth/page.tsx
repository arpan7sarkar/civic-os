"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import { LogIn, UserPlus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AuthGatewayPage() {
    return (
        <AuthLayout title="MCD CivicOS" subtitle="Citizen Portal Gateway">
            <div className="space-y-4">
                <Link 
                    href="/auth/login"
                    className="w-full py-6 px-8 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100 hover:shadow-2xl hover:border-gov-blue hover:-translate-y-1 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gov-blue/10 rounded-xl flex items-center justify-center text-gov-blue">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-slate-800">Login</h3>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Already have a profile</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-gov-blue group-hover:translate-x-1 transition-all" />
                </Link>

                <Link 
                    href="/auth/signup"
                    className="w-full py-6 px-8 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100 hover:shadow-2xl hover:border-gov-blue hover:-translate-y-1 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-slate-800">New Registration</h3>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Create your civic profile</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Authorized Government Access Only
                </p>
            </div>
        </AuthLayout>
    );
}
