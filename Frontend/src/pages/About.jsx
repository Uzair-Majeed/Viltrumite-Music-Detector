import React from 'react';
import { motion } from 'framer-motion';
import { Info, Zap, Shield, Database, Cpu } from 'lucide-react';
import LightRays from '../components/LightRays';

const About = () => {
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

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter">About Viltrumite</h1>
                        <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">
                            I am building the world's most accurate and comprehensive audio fingerprinting engine, specifically tailored for diverse musical landscapes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-tight">The Science of Sound</h2>
                            <p className="text-[#94a3b8] leading-relaxed">
                                Viltrumite uses advanced acoustic fingerprinting algorithms that translate audio waveforms into unique mathematical "fingerprints." Even if a recording is noisy or low-quality, our system can match it against millions of samples in sub-seconds.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { icon: Cpu, label: "AI-Powered Analysis" },
                                    { icon: Database, label: "Massive Local Index" },
                                    { icon: Zap, label: "Real-time Processing" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white font-medium">
                                        <div className="p-2 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6]">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[3rem] overflow-hidden border border-white/10 aspect-square">
                            <img
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                                alt="Technology"
                                className="w-full h-full object-cover grayscale"
                            />
                        </div>
                    </div>

                    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 space-y-6">
                        <h3 className="text-2xl font-bold text-white">Our Mission</h3>
                        <p className="text-[#94a3b8] leading-relaxed">
                            To preserve and catalog musical heritage. Viltrumite's specialized focus on Pakistani and regional music ensures that local artists and classics are just as discoverable as global hits. By allowing our community to contribute, we are building a living library of sound.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
