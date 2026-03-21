import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Instagram, Twitter, Facebook, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer id="footer" className="bg-gov-blue text-white py-12">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                <div className="w-10 h-10 bg-white flex items-center justify-center relative">
                                    <Image 
                                        alt="CivicOS Logo" 
                                        src="/logo1.png" 
                                        width={32}
                                        height={32}
                                        className="object-contain" 
                                    />
                                </div>
                            <span className="text-xl font-extrabold tracking-tight">CivicOS National</span>
                        </div>
                        <p className="text-slate-200 max-w-sm mb-6 mx-auto md:mx-0">
                            The unified platform for National civic services. Committed to transparency, accountability, and citizen empowerment.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4">
                            <Link href="#" aria-label="Follow CivicOS on Twitter" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" aria-label="Follow CivicOS on Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                                <Facebook className="w-4 h-4" />
                            </Link>
                            <Link href="#" aria-label="Follow CivicOS on Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                                <Instagram className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="pt-10 md:pt-0">
                        <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-slate-200 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Active Complaints</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Public Notices</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Ward Information</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Town Planning</Link></li>
                        </ul>
                    </div>

                    <div className="pt-10 md:pt-0">
                        <h4 className="font-bold text-lg mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-200 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Help Desk</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">User Manual</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">Contact Us <Phone className="w-3 h-3" /></Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-300 text-[10px] md:text-sm">
                    <p>© 2026 CivicOS National Infrastructure. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white">Terms of Service</Link>
                        <Link href="#" className="hover:text-white">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
