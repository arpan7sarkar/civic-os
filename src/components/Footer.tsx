import Image from "next/image";
import Link from "next/link";
import { HiOutlinePhone, HiOutlineMail, HiOutlineGlobeAlt, HiOutlineShieldCheck } from "react-icons/hi";
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
    return (
        <footer id="footer" className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl shadow-white/5">
                                <Image 
                                    alt="CivicOS Logo" 
                                    src="/logo1.png" 
                                    width={40}
                                    height={40}
                                    className="object-contain" 
                                />
                            </div>
                            <div>
                                <span className="text-2xl font-black tracking-tighter block leading-none">CivicOS</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gov-blue">National infrastructure</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md mb-8">
                            Transforming the relationship between citizens and governance through transparent AI-driven resolution systems. 
                        </p>
                        <div className="flex items-center gap-6">
                            {[FaTwitter, FaFacebook, FaLinkedin, FaInstagram].map((Icon, i) => (
                                <Link key={i} href="#" className="text-slate-500 hover:text-white transition-colors">
                                    <Icon className="w-6 h-6" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white text-sm font-black uppercase tracking-widest mb-8">Public Services</h4>
                        <ul className="space-y-4">
                            {["Report an Issue", "Track Status", "Ward Statistics", "Department Directory", "Public Notices"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 font-medium hover:text-gov-blue transition-colors flex items-center gap-2 group">
                                        <div className="w-1 h-1 bg-slate-800 rounded-full group-hover:bg-gov-blue transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-sm font-black uppercase tracking-widest mb-8">Emergency Help</h4>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <span className="text-slate-500 text-[10px] font-black uppercase mb-1 block">Toll Free Helpline</span>
                                <div className="flex items-center gap-3">
                                    <HiOutlinePhone className="text-gov-blue w-5 h-5" />
                                    <span className="text-xl font-black">1800-CIVIC-SUPPORT</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-400 group cursor-pointer hover:text-white transition-colors">
                                    <HiOutlineMail className="w-5 h-5 group-hover:text-gov-blue" />
                                    <span className="text-sm font-medium">support@civicos.systems</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 group cursor-pointer hover:text-white transition-colors">
                                    <HiOutlineGlobeAlt className="w-5 h-5 group-hover:text-gov-blue" />
                                    <span className="text-sm font-medium">https://civicos.systems/</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4 py-2 px-6 bg-white/5 border border-white/10 rounded-full">
                        <div className="flex items-center gap-2">
                            <HiOutlineShieldCheck className="text-emerald-500 w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300">Built for Digital India</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <span className="text-[10px] font-medium text-slate-500 italic">An Initiative for Citizen Empowerment</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <Link href="#" className="hover:text-white">Privacy Law</Link>
                        <Link href="#" className="hover:text-white">Terms of Governance</Link>
                        <Link href="#" className="hover:text-white">Accessibility</Link>
                        <span className="text-slate-800">© 2026 MCD / CivicOS</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
