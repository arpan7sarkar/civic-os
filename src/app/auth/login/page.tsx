"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPhoneTokenAction, setBridgeCookieAction, getCurrentUserAction } from '@/app/actions/auth';
import { account } from '@/lib/appwrite'; // Client-side singleton
import AuthLayout from '@/components/auth/AuthLayout';
import { RefreshCw, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateCaptcha, validateCaptcha } from '@/lib/captcha';

export default function LoginPage() {
    const router = useRouter();
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
        setUserId(''); // Reset any stale ID
        const checkSession = async () => {
            const { success } = await getCurrentUserAction();
            if (success) router.replace('/dashboard');
        };
        checkSession();
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
            // 2. Verify OTP and Create Session ON CLIENT directly in Browser
            const session = await account.updatePhoneSession(userId, otpValue);
            
            // 3. Set fallback bridge cookie for layout
            const handoffResult = await setBridgeCookieAction(userId);
            
            if (session && handoffResult.success) {
                setSuccess('Authenticated successfully! Redirecting...');
                // Use window.location.href for full reload to ensure Proxy sees new cookie immediately
                window.location.href = '/dashboard';
            } else {
                setError(handoffResult.error || 'Session created but layout verification failed.');
            }
        } catch (err: any) {
            console.error('[LOGIN] OTP Verification Error:', err);
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="MCD CivicOS" subtitle="Citizen Login">
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
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Login via Mobile</label>
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
                                <span className="text-xl font-bold tracking-widest text-slate-400 select-none italic line-through decoration-slate-300">
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
                        className="w-full py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl shadow-gov-blue/20 hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify Mobile & Continue"}
                        {!isLoading && <ChevronRight className="w-5 h-5" />}
                    </button>
                    
                    <p className="text-center text-xs font-bold text-slate-400">
                        Don't have an account? <a href="/auth/signup" className="text-gov-blue hover:underline font-black">Register here</a>
                    </p>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 text-center">Enter Verification Code</label>
                        <div className="flex justify-center gap-3 mt-4">
                            {otpArray.map((digit, index) => (
                                <div key={index} className="relative">
                                    <input 
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (!val && digit === '') return;
                                            const newOtp = [...otpArray];
                                            newOtp[index] = val.slice(-1);
                                            setOtpArray(newOtp);
                                            if (val) {
                                                setPeekIndex(index);
                                                if (timer) clearTimeout(timer);
                                                const newTimer = setTimeout(() => setPeekIndex(null), 800);
                                                setTimer(newTimer);
                                                if (index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otpArray[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
                                        }}
                                        className={`w-11 h-14 md:h-16 md:w-14 bg-slate-50 border-2 rounded-xl text-2xl font-black text-center transition-all outline-none flex items-center justify-center
                                            ${peekIndex === index || !digit ? 'text-gov-blue' : 'text-transparent'}
                                            ${digit ? 'border-gov-blue/20 bg-white shadow-sm' : 'border-slate-100'}
                                            focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5`}
                                    />
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
                        className="w-full py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl shadow-gov-blue/20 hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Log In"}
                    </button>
                    
                    <button 
                        onClick={() => setStep('input')}
                        className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors"
                    >
                        Back to edit number
                    </button>
                </div>
            )}
        </AuthLayout>
    );
}
