"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth';
import Image from 'next/image';
import { createProfileWithImageAction, getServerProfileAction, updateUserProfileAction } from '@/app/actions/profile';
import { User, IdCard, Camera, ArrowRight, Loader2, AlertCircle, Plus } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

export default function RegisterProfilePage() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [govIdType, setGovIdType] = useState('Aadhaar');
    const [govIdNumber, setGovIdNumber] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        let retries = 0;
        const maxRetries = 3;

        const checkAuth = async () => {
            const { success, user } = await getCurrentUserAction();
            if (!mounted) return;

            if (success && user) {
                setUserId(user.$id);
                
                // If user already has a valid name/profile, they shouldn't be here
                const { isFullProfile } = await getServerProfileAction();
                if (!mounted) return;

                const isGlitchUser = !user.name || user.name.includes('Bridge');
                
                if (isFullProfile && !isGlitchUser) {
                    console.log("[REGISTER] Profile already complete in DB, redirecting to dashboard");
                    router.replace('/dashboard');
                }
            } else if (retries < maxRetries) {
                retries++;
                console.log(`[REGISTER] Session not found, retry ${retries}/${maxRetries}...`);
                setTimeout(() => {
                    if (mounted) checkAuth();
                }, 500); // Wait 500ms and try again
            } else {
                console.log("[REGISTER] Max retries reached, redirecting to /auth");
                router.replace('/auth');
            }
        };
        checkAuth();

        return () => {
            mounted = false;
        };
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !govIdNumber) {
            setError('Please fill in all required fields.');
            return;
        }

        // Basic validation for Aadhaar/ID number: 12 digits, integers only
        const isDigitsOnly = /^\d+$/.test(govIdNumber);
        if (!isDigitsOnly) {
            setError('ID Number must only contain digits.');
            return;
        }
        if (govIdNumber.length !== 12) {
            setError('ID Number must be exactly 12 digits.');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('name', name);
            formData.append('govIdType', govIdType);
            formData.append('govIdNumber', govIdNumber);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Check if we need to CREATE or UPDATE
            const { isFullProfile } = await getServerProfileAction();
            let result;
            
            if (isFullProfile) {
                console.log("[REGISTER] Updating existing profile...");
                result = await updateUserProfileAction({
                    userId,
                    name,
                    govIdType,
                    govIdNumber
                });
            } else {
                console.log("[REGISTER] Creating new profile...");
                result = await createProfileWithImageAction(formData);
            }
            
            if (result.success) {
                router.replace('/dashboard');
            } else {
                setError(result.error || 'Failed to save profile.');
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'An unexpected error occurred during profile processing.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Civic Identity Profile" subtitle="Professional Service CRM Gateway">
            <div className="space-y-8">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-image')?.click()}>
                            <div className="w-28 h-28 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-gov-blue relative">
                                {imagePreview ? (
                                    <Image 
                                        src={imagePreview} 
                                        alt="Profile Preview" 
                                        fill
                                        className="object-cover" 
                                        sizes="112px"
                                    />
                                ) : (
                                    <Camera className="w-10 h-10 text-slate-300 group-hover:text-gov-blue" />
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-gov-blue">
                                <Plus className="w-5 h-5" />
                            </div>
                        </div>
                        <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Profile Photo (Passport Style Recommended)</label>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name (As per Identity Document)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-gov-blue outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Credential Type</label>
                                <select 
                                    value={govIdType}
                                    onChange={(e) => setGovIdType(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-gov-blue outline-none transition-all appearance-none"
                                >
                                    <option>Aadhaar</option>
                                    <option>PAN Card</option>
                                    <option>Voter ID</option>
                                    <option>Driving License</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Document Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                        <IdCard className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={govIdNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // Digits only
                                            if (val.length <= 12) {
                                                setGovIdNumber(val);
                                            }
                                        }}
                                        autoComplete="off"
                                        maxLength={12}
                                        placeholder="12 Digit ID Number"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-gov-blue outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-gov-blue hover:bg-gov-blue-dark text-white font-black rounded-2xl shadow-xl shadow-gov-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Continue"}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed font-bold uppercase tracking-tight">
                        Secured Digital Identity Gateway — Digital Personal Data Protection (DPDP) Compliant
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
}

