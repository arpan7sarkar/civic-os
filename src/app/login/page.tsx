"use client";

import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center">
            <main className="flex w-full min-h-screen">
                {/* Left Panel: Professional Graphic */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1e3b8a]">
                    <div
                        className="absolute inset-0 opacity-40 bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBoQj4Z-IWkOFFF22OtvNZCL-TVcWZ2TnapEwxcSiACoHaymGWLlSHR4Y12fAvgDYdLgQZfjM0BGCT_aS0juJLFw5Uvl_pM3jV_VbrvwLPHmMerOYSWpuY02kHGDt2_AIuqRuemOixCn5B31oxd7nC8X06cvF51SVxtefpaYOUZSxISj5UuS9Ponrp_ln9NimNzEvD8EheT_AASJpTX0FSn5HfAra7MW_atHxkjaRr9cet_h6vjSBHzYqH2-6gHz4Sjf9K0g5M7pQ')" }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e3b8a] via-[#1e3b8a]/40 to-transparent"></div>
                    <div className="relative z-10 flex flex-col justify-end p-16 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-4xl">account_balance</span>
                            <h1 className="text-3xl font-bold tracking-tight">MCD CivicOS</h1>
                        </div>
                        <h2 className="text-5xl font-black leading-tight mb-4">Empowering Citizens, <br />Building Tomorrow.</h2>
                        <p className="text-lg text-slate-200 max-w-md">Access your digital municipal services through India's most advanced civic governance platform.</p>
                        <div className="mt-12 flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold">25+</span>
                                <span className="text-sm text-slate-300">Civic Services</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold">100%</span>
                                <span className="text-sm text-slate-300">Digital Process</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white dark:bg-slate-950">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo Header */}
                        <div className="lg:hidden flex items-center gap-2 mb-8 text-[#1e3b8a]">
                            <span className="material-symbols-outlined text-3xl">account_balance</span>
                            <span className="text-xl font-bold">MCD CivicOS</span>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">CivicOS Login</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Access your civic dashboard securely. Welcome back.</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button className="border-b-2 border-[#1e3b8a] py-3 px-4 text-sm font-bold text-[#1e3b8a]">
                                Login via Mobile OTP
                            </button>
                            <button className="border-b-2 border-transparent py-3 px-4 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                Login with Aadhaar
                            </button>
                        </div>

                        {/* Form */}
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-slate-500 font-semibold border-r border-slate-200 dark:border-slate-700 pr-3">+91</span>
                                        <input
                                            className="w-full pl-16 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] transition-all outline-none"
                                            placeholder="Enter 10 digit number"
                                            type="tel"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Security Captcha</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center select-none p-3 border border-slate-200 dark:border-slate-700 italic font-mono text-xl tracking-widest text-slate-600 dark:text-slate-300 line-through decoration-[#1e3b8a]/30">
                                            X 7 G 2 K
                                        </div>
                                        <button className="p-3 text-[#1e3b8a] hover:bg-[#1e3b8a]/5 rounded-lg transition-colors" title="Refresh Captcha" type="button">
                                            <span className="material-symbols-outlined">refresh</span>
                                        </button>
                                        <input
                                            className="w-1/3 px-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] transition-all outline-none"
                                            placeholder="Enter code"
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full bg-[#1e3b8a] hover:bg-[#1e3b8a]/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-[#1e3b8a]/20 transition-all flex items-center justify-center gap-2"
                                type="submit"
                            >
                                <span>Generate OTP</span>
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </button>
                        </form>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-950 px-2 text-slate-400">Government Portal Access</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">badge</span>
                                Officer Login
                            </button>
                            <button className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                Dept. Portal
                            </button>
                        </div>

                        <footer className="pt-8 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                <Image
                                    alt="DigiLocker"
                                    width={20}
                                    height={20}
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuZRYBTRN142_EqDkHAa4TQGyzymJzTxjL6kyKgcIppMVd1ptAM2gZWOHp1lDMMygnVWEKY-GIb41J9TlJGm10JkjQ6Zh0OhLdww91kDkA4dRRxA122yjbk9D_VeOf5H14cIgE27PpQXPZkgarSh5My5ZsE42YQ_5Z-3U3UGBmJY6Xm7tyF0TprUHvXDz-KEJIoE79Py2o2IAbMw3vBwXzB1JljeclhfygvEgKDMU3srRwMT9VfDj_mc8D_Mm2EjYbUHSQOwqcZg"
                                    className="size-5"
                                />
                                <span>Secure Login via <strong>DigiLocker</strong> integrated</span>
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-slate-400">
                                <Link className="hover:text-[#1e3b8a] transition-colors" href="#">Privacy Policy</Link>
                                <span>•</span>
                                <Link className="hover:text-[#1e3b8a] transition-colors" href="#">Terms of Use</Link>
                                <span>•</span>
                                <Link className="hover:text-[#1e3b8a] transition-colors" href="#">Help Desk</Link>
                            </div>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
}
