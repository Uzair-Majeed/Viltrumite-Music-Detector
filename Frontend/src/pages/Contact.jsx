import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, Music } from 'lucide-react';
import LightRays from '../components/LightRays';

const Contact = () => {
    return (
        <div className="pt-32 pb-24 px-6 min-h-screen relative overflow-hidden bg-[#060010]">
            {/* LightRays Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={1.2}
                    lightSpread={1.0}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.1}
                />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <div className="inline-flex p-3 rounded-2xl bg-[#ec4899]/10 text-[#ec4899]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter">Get in Touch</h1>
                            <p className="text-[#94a3b8] text-lg leading-relaxed">
                                Have a technical question or want to discuss a partnership? I am available 24/7 to ensure your Viltrumite experience is flawless.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: MessageSquare, label: "Live Chat", value: "Available in-app 24/7" },
                                { icon: Mail, label: "Email Support", value: "uzairmjd886@gmail.com" },
                                { icon: MapPin, label: "HQ Address", value: "Fast University Islamabad" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">{item.label}</h4>
                                        <p className="text-[#94a3b8]">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-10 rounded-[3rem] bg-white/5 border border-white/5 backdrop-blur-3xl shadow-2xl space-y-8"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl">
                                <img src="/Logos/Viltrumite_Logo2.png" alt="Logo" className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Send a Message</h3>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest ml-1">Message</label>
                                <textarea
                                    rows="4"
                                    placeholder="How can we help?"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all font-medium resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="button"
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                            >
                                Send Message <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
