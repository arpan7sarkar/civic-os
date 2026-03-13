"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPhoneTokenAction, verifyOTPAction, getCurrentUserAction } from '@/app/actions/auth';
import { getServerProfileAction } from '@/app/actions/profile';
import { Sparkles, ShieldCheck, RefreshCw, ChevronRight, CheckCircle2, AlertCircle, Phone, Fingerprint, ChevronLeft } from 'lucide-react';
import { generateCaptcha, validateCaptcha } from '@/lib/captcha';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'otp' | 'aadhaar'>('otp');
    const [mobile, setMobile] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [peekIndex, setPeekIndex] = useState<number | null>(null);
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setCaptchaText(generateCaptcha(6));
        const checkSession = async () => {
            const { success } = await getCurrentUserAction();
            if (success) {
                router.replace('/dashboard');
            }
        };
        checkSession();
        router.refresh(); 
    }, [router]);

    const handleGenerateOTP = async () => {
        setError('');
        if (!mobile || !/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!validateCaptcha(captchaInput, captchaText)) {
            setError('Invalid Captcha. Please try again.');
            setCaptchaText(generateCaptcha(6));
            return;
        }

        setIsLoading(true);
        try {
            // Securely send OTP via Server Action
            const result = await createPhoneTokenAction(mobile);
            if (result.success && result.userId) {
                setUserId(result.userId);
                setStep('otp');
                setSuccess('OTP sent successfully');
            } else {
                setError(result.error || 'Failed to send OTP.');
            }
        } catch (err: any) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        const otpValue = otpArray.join('');
        if (otpValue.length < 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Verify OTP securely
            const result = await verifyOTPAction(userId, otpValue);
            
            if (result.success) {
                setSuccess('Authenticated successfully! Refreshing session...');
                router.refresh(); 
                
                // Wait for session to sync before checking profile
                setTimeout(async () => {
                    setSuccess('Checking profile status...');
                    const profileResult = await getServerProfileAction();
                    if (profileResult.success && profileResult.profile) {
                        router.replace('/dashboard');
                    } else {
                        router.replace('/auth/register');
                    }
                }, 800);
            } else {
                setError(result.error || 'Invalid OTP. Please try again.');
            }
        } catch (err: any) {
            setError('Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Simple Header */}
            <header className="px-8 py-6 flex justify-between items-center bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gov-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gov-blue/20">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tight">CivicOS</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2 text-slate-100 bg-slate-800/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-3.5 h-3.5 text-gov-blue" />
                        Secure Portal
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h1 className="text-2xl font-black text-slate-900 mb-2">MCD CivicOS</h1>
                                <p className="text-slate-500 text-sm font-medium">Citizen Authentication</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 mb-8">
                                <button 
                                    onClick={() => setActiveTab('otp')}
                                    className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'otp' ? 'text-gov-blue' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Login via Mobile OTP
                                    {activeTab === 'otp' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gov-blue" />}
                                </button>
                                <button 
                                    className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest transition-all relative opacity-50 cursor-not-allowed text-slate-400`}
                                >
                                    Login with Aadhaar
                                </button>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-in shake-1">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-in fade-in">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    {success}
                                </div>
                            )}

                            {step === 'input' ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Enter 10-digit Mobile Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                                <span className="text-sm font-bold">+91</span>
                                            </div>
                                            <input 
                                                type="tel"
                                                maxLength={10}
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                                                placeholder="00000 00000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Enter Captcha</label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text"
                                                maxLength={6}
                                                value={captchaInput}
                                                onChange={(e) => setCaptchaInput(e.target.value)}
                                                className="flex-1 px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                                                placeholder="Type characters"
                                            />
                                            <div className="w-32 bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                                <span className="text-xl font-bold tracking-widest text-slate-400 select-none italic line-through decoration-slate-300 italic">
                                                    {captchaText}
                                                </span>
                                                <button 
                                                    onClick={() => setCaptchaText(generateCaptcha(6))}
                                                    className="absolute inset-0 bg-gov-blue/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleGenerateOTP}
                                        disabled={isLoading}
                                        className="w-full py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl shadow-gov-blue/20 hover:shadow-2xl hover:shadow-gov-blue/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Generate OTP"}
                                        {!isLoading && <ChevronRight className="w-5 h-5" />}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                                        <p className="text-xs text-slate-500 font-medium">OTP sent to <span className="text-slate-900 font-bold">+91 {mobile}</span></p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 text-center">Enter Verification Code</label>
                                        <div className="flex justify-center gap-3 md:gap-4 mt-4">
                                            {otpArray.map((digit, index) => (
                                                <div key={index} className="relative">
                                                    <input 
                                                        id={`otp-${index}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="one-time-code"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            if (!val && digit === '') return;
                                                            
                                                            const newOtp = [...otpArray];
                                                            newOtp[index] = val.slice(-1);
                                                            setOtpArray(newOtp);

                                                            // Peek-a-boo logic
                                                            if (val) {
                                                                setPeekIndex(index);
                                                                if (timer) clearTimeout(timer);
                                                                const newTimer = setTimeout(() => setPeekIndex(null), 1000);
                                                                setTimer(newTimer);
                                                                
                                                                // Focus next box
                                                                if (index < 5) {
                                                                    const nextInput = document.getElementById(`otp-${index + 1}`);
                                                                    nextInput?.focus();
                                                                }
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
                                                                const prevInput = document.getElementById(`otp-${index - 1}`);
                                                                prevInput?.focus();
                                                            }
                                                        }}
                                                        className={`w-12 h-14 md:h-20 md:w-20 bg-slate-50 border-2 rounded-2xl text-3xl font-black text-center transition-all outline-none flex items-center justify-center
                                                            ${peekIndex === index || !digit ? 'text-gov-blue' : 'text-transparent'}
                                                            ${digit ? 'border-gov-blue/20 bg-white shadow-md' : 'border-slate-100'}
                                                            focus:border-gov-blue focus:ring-8 focus:ring-gov-blue/5`}
                                                        placeholder="•"
                                                    />
                                                    {/* Mask overlay for secret effect */}
                                                    {digit && peekIndex !== index && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-3 h-3 bg-gov-blue rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleVerifyOTP}
                                        disabled={isLoading}
                                        className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                                        {!isLoading && <ChevronRight className="w-5 h-5" />}
                                    </button>

                                    <button 
                                        onClick={() => setStep('input')}
                                        className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors"
                                    >
                                        Back to edit number
                                    </button>
                                </div>
                            )}

                            <div className="mt-10 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3 text-gov-blue" />
                                    Secure login via DigiLocker
                                </div>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    Integrated gateways powered by <span className="font-bold">India Stack</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-10 flex flex-col items-center gap-6">
                <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <button className="hover:text-gov-blue transition-colors">Privacy Policy</button>
                    <button className="hover:text-gov-blue transition-colors">Terms of Service</button>
                    <button className="hover:text-gov-blue transition-colors">Help Desk</button>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-gov-blue" />
                    256-bit SSL Encrypted
                </div>
                <p className="text-[9px] text-slate-400 font-medium opacity-60">
                    © 2024 CivicOS - Municipal Corporation Digital Infrastructure. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
