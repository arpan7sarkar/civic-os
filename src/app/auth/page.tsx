"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { account } from '@/lib/appwrite';
import { createPhoneTokenAction, verifyOtpAction, checkRegistrationAction, getCurrentUserAction, officialLoginAction, syncSessionAction } from '@/app/actions/auth';
import { generateCaptcha, validateCaptcha } from '@/lib/captcha';
import {
    Shield,
    Lock,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Smartphone,
    Building2,
    Check
} from 'lucide-react';

export default function AuthGatewayPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'citizen' | 'official'>('citizen');
    const [mobile, setMobile] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState(''); // Initialize with empty string for hydration
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [maskedIndices, setMaskedIndices] = useState<number[]>([]);
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [officialEmail, setOfficialEmail] = useState('');
    const [officialPassword, setOfficialPassword] = useState('');

    useEffect(() => {
        // Generate initial captcha only on the client
        setCaptchaText(generateCaptcha(6));

        const checkSession = async () => {
            const { success } = await getCurrentUserAction();
            if (success) router.replace('/dashboard');
        };
        checkSession();
    }, [router]);

    const handleMaskDigit = (index: number) => {
        setTimeout(() => {
            setMaskedIndices(prev => !prev.includes(index) ? [...prev, index] : prev);
        }, 1000);
    };

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
                setMaskedIndices([]); // Reset masking
                setOtpArray(['', '', '', '', '', '']); // Clear pre-filled OTP
                setSuccess('OTP sent successfully to your mobile number');
            } else {
                setError(result.error || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('An unexpected service error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        const otpValue = otpArray.join('');
        if (otpValue.length < 6) {
            setError('Verification code must be 6 digits');
            return;
        }

        setIsLoading(true);
        try {
            // STEP 1: Verify OTP and Establish Session on API routes securely
            console.log("[AUTH_CLIENT] Verifying OTP and establishing session via Server Action...");
            const result = await verifyOtpAction(userId, otpValue);

            if (result.success) {
                setSuccess('Authentication successful');
                
                // Use the isNewUser flag directly from the server for redirection
                if (result.isNewUser) {
                    console.log("[AUTH_CLIENT] New user detected. Redirecting to registration...");
                    router.push('/auth/register');
                } else {
                    console.log("[AUTH_CLIENT] Existing user detected. Redirecting to dashboard...");
                    router.push('/dashboard');
                }
            } else {
                setError(result.error || 'Server sync failed. Please try again.');
            }
        } catch (err: any) {
            console.error("[AUTH_CLIENT] OTP Verification Error:", err);
            setError(err.message || 'Invalid verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOfficialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!officialEmail || !officialPassword) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            // STEP 1: Establish session strictly on the SERVER
            console.log("[AUTH_OFFICIAL] Authenticating via Server Action...");
            const result = await officialLoginAction(officialEmail, officialPassword);

            if (result.success) {
                setSuccess('Official Authentication successful');
                router.push('/dashboard');
            } else {
                setError(result.error || 'Server sync failed. Please try again.');
            }
        } catch (err: any) {
            console.error("[AUTH_OFFICIAL] Login Error:", err);
            setError(err.message || 'Invalid official credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Govt. of India" subtitle="CivicOS National">
            <div className="mb-8">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('citizen')}
                        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'citizen' ? 'border-gov-blue text-gov-blue' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`}
                    >
                        [ CITIZEN CLEARANCE ]
                    </button>
                    <button
                        onClick={() => setActiveTab('official')}
                        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'official' ? 'border-gov-blue text-gov-blue' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`}
                    >
                        [ DEPT. OFFICIAL ]
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    {success}
                </div>
            )}

            {activeTab === 'citizen' ? (
                step === 'input' ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Enter 10-digit Mobile Number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 font-bold">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full rounded-r-xl border border-slate-200 px-4 py-4 text-slate-900 text-lg font-bold placeholder:text-slate-300 focus:border-gov-blue focus:ring-1 focus:ring-gov-blue outline-none transition-all"
                                    placeholder="00000 00000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Security Verification</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    className="flex-1 min-w-0 px-3 py-3.5 border border-slate-200 rounded-xl text-base font-bold text-slate-800 placeholder:text-slate-300 focus:border-gov-blue outline-none transition-all uppercase"
                                    placeholder="Captcha"
                                />
                                <div className="flex items-center gap-1 shrink-0 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                                    <div className="h-11 w-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center select-none overflow-hidden relative shrink-0">
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
                                        <span className="text-lg font-black italic tracking-wider text-slate-400 line-through decoration-slate-300">{captchaText}</span>
                                    </div>
                                    <button
                                        onClick={() => setCaptchaText(generateCaptcha(6))}
                                        className="p-2.5 text-slate-400 hover:text-gov-blue transition-colors shrink-0"
                                        title="Refresh Captcha"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateOTP}
                            disabled={isLoading}
                            className="w-full bg-gov-blue hover:bg-gov-blue-dark text-white font-bold py-5 rounded-2xl shadow-xl shadow-gov-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Get OTP"}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-500 mb-6 px-10">Enter the 6-digit verification code sent to <span className="text-slate-900 font-bold">+91 {mobile}</span></p>
                            <div className="flex justify-center gap-2">
                                {otpArray.map((digit, index) => (
                                    <div key={index} className="relative">
                                        <input
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={maskedIndices.includes(index) && digit ? "●" : digit}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const newOtp = [...otpArray];
                                                newOtp[index] = val.slice(-1);
                                                setOtpArray(newOtp);

                                                // Peek-a-boo logic: remove from masked if changed, set timeout to mask
                                                setMaskedIndices(prev => prev.filter(i => i !== index));
                                                if (newOtp[index]) handleMaskDigit(index);

                                                if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
                                                    document.getElementById(`otp-${index - 1}`)?.focus();
                                                }
                                            }}
                                            autoComplete="one-time-code"
                                            className="w-10 sm:w-12 h-14 bg-white border-2 border-slate-200 rounded-xl text-xl font-bold text-center focus:border-gov-blue outline-none transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleVerifyOTP}
                            disabled={isLoading}
                            className="w-full bg-gov-blue hover:bg-gov-blue-dark text-white font-bold py-5 rounded-2xl shadow-xl shadow-gov-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                        </button>

                        <button
                            onClick={() => setStep('input')}
                            className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-gov-blue transition-colors"
                        >
                            Change Mobile Number
                        </button>
                    </div>
                )
            ) : (
                <form onSubmit={handleOfficialLogin} className="space-y-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gov-blue/5 rounded-2xl flex items-center justify-center mx-auto text-gov-blue mb-4">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Departmental Access</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1 px-8">Restricted to authorized Personnel and Officials</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official ID / Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={officialEmail}
                                    onChange={(e) => setOfficialEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-gov-blue transition-all outline-none"
                                    placeholder="official@mcd.gov.in"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security Credentials</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={officialPassword}
                                    onChange={(e) => setOfficialPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-gov-blue transition-all outline-none"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify Identity & Access"}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <p className="text-[10px] text-center text-slate-400 font-medium px-10 italic">
                        Access to this portal is logged. Unauthorized access attempts are monitored and reported.
                    </p>
                </form>
            )}

            <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold tracking-tight">
                        <Lock className="w-3 h-3 text-secondary" />
                        Secured via 256-bit SSL Encryption
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold tracking-tight">
                        <Check className="w-3 h-3 text-secondary" />
                        DPDP Compliant Data Gateway
                    </div>
                </div>

                <div className="flex flex-col items-center text-center px-4">
                    <div className="flex items-center gap-2 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                        <Shield className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span className="whitespace-nowrap">Appwrite Integrated Authentication</span>
                    </div>
                    <p className="text-[9px] text-slate-300 mt-2 font-medium max-w-[240px]">Digital identity verified via secure government gateways</p>
                </div>
            </div>
        </AuthLayout>
    );
}
