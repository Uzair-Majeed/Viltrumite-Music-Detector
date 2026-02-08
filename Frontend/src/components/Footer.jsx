import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Github, Mail, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-[#0f172a] border-t border-white/5 pt-20 pb-10 px-6 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <div className="space-y-6">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899]">
                            <Music className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white">Viltrumite</span>
                    </Link>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">
                        The ultimate high-fidelity music recognition engine. Identify, explore, and build your digital library with Viltrumite.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://github.com/Uzair-Majeed" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="mailto:uzairmjd886@gmail.com" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <Mail className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/in/uzair-majeed-605611319" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Explore</h4>
                    <ul className="space-y-4">
                        <li><Link to="/recognize" className="text-sm text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">Start Recognition</Link></li>
                        <li><Link to="/library" className="text-sm text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">Music Library</Link></li>
                        <li><Link to="/trending" className="text-sm text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">New Discoveries</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="text-white font-bold mb-6">System</h4>
                    <ul className="space-y-4">
                        <li><Link to="/about" className="text-sm text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">About AI</Link></li>
                        <li><Link to="/faq" className="text-sm text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">How it Works</Link></li>
                        <li><Link to="/contact" className="text-sm text-[#94a3b8] hover:text-[#8b5cf6] transition-colors">Support</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-white font-bold mb-6">Stay Tuned</h4>
                    <p className="text-sm text-[#94a3b8] mb-4">Get updates on new Pakistani tracks added to our DB.</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
                        />
                        <button className="p-2 rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors">
                            <Mail className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-[#64748b]">
                    © 2024 Viltrumite AI. All rights reserved. Built with precision and passion.
                </p>
                <div className="flex gap-8">
                    <a href="#" className="text-xs text-[#64748b] hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="text-xs text-[#64748b] hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
