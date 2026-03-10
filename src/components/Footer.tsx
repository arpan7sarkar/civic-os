import Link from "next/link";
import { Phone, Mail, Instagram, Twitter, Facebook, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-[#1e293b] text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* About Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-mcd-navy font-bold text-lg">
                                MCD
                            </div>
                            <span className="text-xl font-bold tracking-tight">CivicOS</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Official platform of the Municipal Corporation of Delhi. Empowering citizens through transparent, AI-driven digital governance for a cleaner and smarter national capital.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-mcd-navy transition-colors">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-mcd-navy transition-colors">
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-mcd-navy transition-colors">
                                <Facebook className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">MCD Links</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">Property Tax <ExternalLink className="w-3 h-3" /></Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">Birth & Death Certificates <ExternalLink className="w-3 h-3" /></Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">Trade Licenses <ExternalLink className="w-3 h-3" /></Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">Tenders & Auctions <ExternalLink className="w-3 h-3" /></Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Career Opportunities</Link></li>
                        </ul>
                    </div>

                    {/* Citizen Corner */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Citizen Corner</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Public Health Facilities</Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Zonal Information</Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Grievance Redressal</Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Right to Information</Link></li>
                            <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Citizen Charter</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-lg font-bold mb-6">Contact Helpline</h4>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-mcd-navy rounded-lg">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Toll-Free Helpline</span>
                                    <span className="text-2xl font-bold">155305</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-700 rounded-lg">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Email Support</span>
                                    <span className="text-sm font-semibold">support.mcd@delhi.gov.in</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xs text-slate-500 font-medium">
                        Designed and Maintained for <span className="text-slate-300 font-bold">Municipal Corporation of Delhi</span>
                    </div>
                    <div className="flex gap-8 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <Link href="#" className="hover:text-white transition-colors uppercase">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors uppercase">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors uppercase">Accessibility Statement</Link>
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono">
                        V 1.0.4 | STITCH-MCD-PR-01
                    </div>
                </div>
            </div>
        </footer>
    );
}
