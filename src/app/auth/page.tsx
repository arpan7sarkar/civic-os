"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { createPhoneTokenAction, verifyOtpAction, getCurrentUserAction, officialLoginAction } from '@/app/actions/auth';
import {
    Shield,
    Lock,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Building2,
    Check,
    Loader2,
    Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthGatewayPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'citizen' | 'official'>('citizen');
    const [mobile, setMobile] = useState('');
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [officialEmail, setOfficialEmail] = useState('');
    const [officialPassword, setOfficialPassword] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const checkSession = async () => {
            const res = await getCurrentUserAction();
            if (res.success) {
                if (res.user?.role === 'authority') {
                    router.replace('/authority');
                } else {
                    router.replace('/dashboard');
                }
            }
        };
        checkSession();
    }, [router]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleGenerateOTP = async () => {
        setError('');
        setSuccess('');
        setIsSuccess(false);
        if (!mobile || !mobile.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const result = await createPhoneTokenAction(mobile);
            if (result.success && result.userId) {
                setUserId(result.userId);
                setIsSuccess(true);
                setSuccess('OTP sent successfully');
                
                setTimeout(() => {
                    setStep('otp');
                    setOtpArray(['', '', '', '', '', '']);
                    setResendTimer(30);
                    setIsLoading(false);
                    setIsSuccess(false);
                }, 1200);
            } else {
                setError(result.error || 'Failed to send OTP. Please try again.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('An unexpected service error occurred.');
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        setSuccess('');
        setIsSuccess(false);
        const otpValue = otpArray.join('');
        if (otpValue.length < 6) {
            setError('Verification code must be 6 digits');
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyOtpAction(userId, otpValue);
            if (result.success) {
                setIsSuccess(true);
                setSuccess('Identity Verified');
                
                setTimeout(() => {
                    if (result.isNewUser) {
                        router.push('/auth/register');
                    } else {
                        router.push('/dashboard');
                    }
                }, 1000);
            } else {
                setError(result.error || 'Verification failed. Please try again.');
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Invalid verification code.');
            setIsLoading(false);
        }
    };

    const handleOfficialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSuccess(false);
        if (!officialEmail || !officialPassword) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', officialEmail);
            formData.append('password', officialPassword);
            const result = await officialLoginAction(formData);

            if (result.success) {
                setIsSuccess(true);
                setSuccess('Authenticated');
                setTimeout(() => {
                    router.push('/authority');
                }, 1000);
            } else {
                setError(result.error || 'Login failed. Please try again.');
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Invalid official credentials.');
            setIsLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <AuthLayout title="CivicOS National" subtitle="Unified Authentication Gateway">
            <div className="mb-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Continue as:</label>
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('citizen')}
                        aria-label="Continue as Citizen"
                        className={`flex-1 py-3.5 px-4 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 ${activeTab === 'citizen' ? 'bg-white text-primary shadow-lg shadow-slate-200 scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Citizen
                    </button>
                    <button
                        onClick={() => setActiveTab('official')}
                        aria-label="Continue as Government Official"
                        className={`flex-1 py-3.5 px-4 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 ${activeTab === 'official' ? 'bg-white text-primary shadow-lg shadow-slate-200 scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Official
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold ring-4 ring-red-500/5"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold ring-4 ring-emerald-500/5"
                    >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            {activeTab === 'citizen' ? (
                <div className="space-y-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 'input' ? (
                            <motion.div 
                                key="input-step"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-6"
                            >
                            <div className="space-y-2">
                                <label htmlFor="mobile" className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 opacity-60">Authentication via Email OTP is now active.</p>
                            </div>

                            <div className="flex items-center justify-center py-2">
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm"
                                >
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Verification Active</span>
                                </motion.div>
                            </div>

                            <div>
                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerateOTP}
                                    disabled={isLoading}
                                    style={{ backgroundColor: '#0B6E6D' }}
                                    className="w-full text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-xs uppercase tracking-[0.2em]">{isSuccess ? "OTP Sent ✓" : "Sending OTP..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs uppercase tracking-[0.2em]">Get OTP</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                                <div className="mt-6 flex items-center justify-center gap-4 text-slate-300">
                                    <div className="h-px flex-1 bg-slate-100" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap">Used only for secure authentication</p>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                            </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="otp-step"
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.6, type: "spring", damping: 20, stiffness: 100 }}
                                className="space-y-8"
                            >
                            <div className="text-center">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Enter Verification Code</h3>
                                <div className="flex justify-center gap-3">
                                    {otpArray.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const newOtp = [...otpArray];
                                                newOtp[index] = val.slice(-1);
                                                setOtpArray(newOtp);
                                                if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
                                                    document.getElementById(`otp-${index - 1}`)?.focus();
                                                }
                                            }}
                                            aria-label={`Digit ${index + 1}`}
                                            className="w-12 h-16 bg-white border-2 border-slate-100 rounded-2xl text-2xl font-black text-center text-primary focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all shadow-sm"
                                        />
                                    ))}
                                </div>
                                <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent to +91 {mobile}</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleVerifyOTP}
                                disabled={isLoading}
                                style={{ backgroundColor: '#0B6E6D' }}
                                className="w-full text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="text-xs uppercase tracking-[0.2em]">{isSuccess ? "Identity Verified ✓" : "Verifying..."}</span>
                                    </>
                                ) : (
                                    <span className="text-xs uppercase tracking-[0.2em]">Verify & Continue</span>
                                )}
                            </motion.button>

                            <div className="flex flex-col items-center gap-6">
                                {resendTimer > 0 ? (
                                    <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resend OTP available in {resendTimer}s</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleGenerateOTP}
                                        className="py-2 px-6 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-primary/10 transition-colors border border-primary/20"
                                    >
                                        Resend Code
                                    </button>
                                )}
                                <button
                                    onClick={() => setStep('input')}
                                    className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Change Mobile Number
                                </button>
                            </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.form 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleOfficialLogin} 
                    className="space-y-8"
                >
                    <div className="text-center mb-8">
                        <motion.div 
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 0 }}
                            className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary mb-6 border border-primary/10 shadow-lg shadow-primary/5"
                        >
                            <Building2 className="w-10 h-10" />
                        </motion.div>
                        <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter">Departmental Access</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 px-8 leading-relaxed opacity-60">Restricted to authorized Personnel and Officials</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official ID / Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={officialEmail}
                                    onChange={(e) => setOfficialEmail(e.target.value)}
                                    autoComplete="username"
                                    className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-bold text-slate-800 placeholder:text-slate-200 focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none shadow-sm"
                                    placeholder="official@gov.in"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security Credentials</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={officialPassword}
                                    onChange={(e) => setOfficialPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-bold text-slate-800 placeholder:text-slate-200 focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none shadow-sm"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-[#1e293b] text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-xs uppercase tracking-[0.2em]">{isSuccess ? "Identity Verified ✓" : "Verifying Identity..."}</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xs uppercase tracking-[0.2em]">Verify Identity & Access</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>

                    <div className="flex flex-col items-center gap-4 py-2">
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest px-12 italic opacity-40">
                            Unauthorized access attempts are monitored and reported.
                        </p>
                    </div>
                </motion.form>
            )}

            <div className="mt-16 pt-10 border-t border-slate-50 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                    <Shield className="w-6 h-6 text-slate-100" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-2 group hover:bg-white hover:border-primary/20 transition-all">
                        <Lock className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">SSL Encrypted</span>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-2 group hover:bg-white hover:border-primary/20 transition-all">
                        <Check className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">DPDP Compliant</span>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center opacity-30 group hover:opacity-100 transition-all cursor-default">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900 mb-1">Secure Digital Public Infrastructure</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">National Data Gateway • Powered by India Stack</p>
                </div>
            </div>
        </AuthLayout>
    );
}
