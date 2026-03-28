"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import AdminSidebar from "@/components/AdminSidebar";
import { Settings, Menu, Shield, Save, BellRing, Database, Smartphone } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function SettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Default settings
    const [settings, setSettings] = useState({
        notifications: true,
        aiValidation: false,
        mobileSync: true
    });

    useEffect(() => {
        const checkAuth = async () => {
            const res = await getServerProfileAction();
            if (!res.success || res.profile?.role !== 'authority') {
                router.push("/dashboard");
                return;
            }
            setProfile(res.profile);
            
            // Load settings from localStorage if available
            const saved = localStorage.getItem('civicos_admin_settings');
            if (saved) {
                try {
                    setSettings(JSON.parse(saved));
                } catch (e) {
                    // Ignore parse errors
                }
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/auth/login");
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('civicos_admin_settings', JSON.stringify(settings));
            setIsSaving(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 800);
    };

    const settingsConfig = [
        { id: 'notifications', title: 'Notification Engine', desc: 'Configure SMS and push alerts routing', icon: BellRing },
        { id: 'aiValidation', title: 'AI Validation Rules', desc: 'Adjust Gemini Vision threshold constraints', icon: Database },
        { id: 'mobileSync', title: 'Mobile API Sync', desc: 'Field officer synchronization intervals', icon: Smartphone }
    ] as const;

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-gov-blue/20">
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 animate-in fade-in"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            <AdminSidebar 
                userProfile={profile} 
                onLogoutAction={handleLogout}
                isOpen={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gov-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="lg:hidden p-4 md:p-6 flex items-center justify-between border-b border-white backdrop-blur-xl bg-white/50 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gov-blue text-white flex items-center justify-center">
                            <Settings className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">System Settings</h1>
                    </div>
                    <button 
                        onClick={() => setShowMobileSidebar(true)}
                        className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 p-4 md:p-8 xl:p-12 relative z-10 space-y-8 overflow-y-auto w-full">
                    {/* Toast Notification */}
                    {showToast && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-black tracking-widest text-[11px] uppercase animate-in slide-in-from-top-4 z-50">
                            <Shield className="w-4 h-4" /> Config Saved Successfully
                        </div>
                    )}

                    <div className="hidden lg:flex justify-between items-end bg-white/40 p-6 rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" /> Core Configuration
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 text-balance">
                                System Settings
                            </h1>
                            <p className="text-sm font-bold text-slate-500">Manage portal preferences and routing algorithms</p>
                        </div>

                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-12 px-6 bg-slate-900 hover:bg-gov-blue text-white transition-all rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:shadow-gov-blue/20 hover:-translate-y-0.5 active:scale-95 group border border-white/10 disabled:opacity-70"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                            ) : (
                                <Save size={16} className="group-hover:scale-110 transition-transform" />
                            )}
                            Save Config
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto lg:mx-0 w-full">
                        {settingsConfig.map((setting) => {
                            const active = settings[setting.id];
                            return (
                                <div 
                                    key={setting.id} 
                                    onClick={() => toggleSetting(setting.id)}
                                    className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-gov-blue/20 transition-all flex justify-between items-center cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 ${active ? 'bg-gov-blue/10 text-gov-blue' : 'bg-slate-50 text-slate-300'}`}>
                                            <setting.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 leading-tight mb-1">{setting.title}</h3>
                                            <p className="text-[11px] font-bold text-slate-400">{setting.desc}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-12 h-6 rounded-full border-2 transition-all duration-300 relative flex items-center ${active ? 'bg-gov-blue/10 border-gov-blue/20' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`w-4 h-4 rounded-full transition-all duration-300 absolute top-1/2 -translate-y-1/2 shadow-sm ${active ? 'bg-gov-blue right-1' : 'bg-slate-300 left-1'}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="lg:hidden fixed bottom-6 inset-x-4">
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm shadow-xl active:scale-95"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    SAVE CONFIGURATION
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
