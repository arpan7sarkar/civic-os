"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth';
import { createProfileWithImageAction } from '@/app/actions/profile';
import { ShieldCheck, User, IdCard, Camera, ChevronRight, Loader2, AlertCircle, Plus } from 'lucide-react';

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
        const checkAuth = async () => {
            const { success, user } = await getCurrentUserAction();
            if (success && user) {
                setUserId(user.$id);
            } else {
                router.push('/auth');
            }
        };
        checkAuth();
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

            const result = await createProfileWithImageAction(formData);
            
            if (result.success) {
                router.replace('/dashboard');
            } else {
                setError(result.error || 'Failed to create profile.');
            }
        } catch (err: any) {
            setError('An unexpected error occurred during profile creation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Complete Your Profile</h1>
                    <p className="text-slate-500 text-sm font-medium mt-2">Secure digital identity established via OTP. Please provide required details.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-image')?.click()}>
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-slate-300 group-hover:text-primary" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                        <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Upload Profile Photo (Optional)</label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Full Name (As per Govt ID)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">ID Type</label>
                                <select 
                                    value={govIdType}
                                    onChange={(e) => setGovIdType(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary outline-none transition-all appearance-none"
                                >
                                    <option>Aadhaar</option>
                                    <option>PAN Card</option>
                                    <option>Voter ID</option>
                                    <option>Driving License</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">ID Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <IdCard className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={govIdNumber}
                                        onChange={(e) => setGovIdNumber(e.target.value)}
                                        placeholder="Enter ID number"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        By completing this profile, you consent to the processing of your data in accordance with the Digital Personal Data Protection (DPDP) Act, 2023.
                    </p>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Continue"}
                        {!isLoading && <ChevronRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}

