import React from 'react';
import { motion } from 'framer-motion';
import { Music, Zap, Target, Cpu, Code2, Sparkles, Youtube } from 'lucide-react';
import LightRays from '../components/LightRays';

const About = () => {
    return (
        <div className="pt-24 min-h-screen relative overflow-hidden bg-[#060010]">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={1.0}
                    lightSpread={1.2}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.05}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 pb-20">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center py-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#8b5cf6] mb-8">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Vision Behind Viltrumite</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter mb-6 leading-none">
                        Driven by Curiosity.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">
                            Powered by Code.
                        </span>
                    </h1>
                    <p className="text-[#94a3b8] max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                        Meet the mind and the mission behind the ultimate high-fidelity music recognition engine.
                    </p>
                </motion.div>

                {/* Story Section - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter">I'm Uzair Majeed</h2>
                            <p className="text-xl text-[#8b5cf6] font-bold">BS Software Engineering Student & AI Enthusiast</p>
                        </div>

                        <p className="text-[#94a3b8] text-lg leading-relaxed">
                            It all started with a simple question: <span className="text-white font-medium">"How does Shazam actually work?"</span>
                            The logic behind detecting a song in a noisy room, translating waveforms into mathematical fingerprints, fascinated me. I didn't just want to use the technology—I wanted to build it from the ground up.
                        </p>

                        <p className="text-[#94a3b8] text-lg leading-relaxed">
                            Viltrumite is the result of that inspiration. It's a project born from local curiosity and global ambition, designed to bring high-fidelity music detection to everyone, with a specialized focus on regional and diverse musical landscapes.
                        </p>

                        <div className="flex gap-6 pt-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-white">2026</span>
                                <span className="text-xs text-[#64748b] uppercase font-bold tracking-widest mt-1">Project Launch</span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-white">100%</span>
                                <span className="text-xs text-[#64748b] uppercase font-bold tracking-widest mt-1">Independent Dev</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#8b5cf6]/30 to-[#ec4899]/30 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="rounded-[3rem] overflow-hidden border border-white/10 aspect-[4/5] relative">
                            <img
                                src="/SideImages/About.jpg"
                                alt="Uzair Majeed - Developer"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#060010] via-transparent to-transparent opacity-60" />
                        </div>
                    </motion.div>
                </div>

                {/* Goals & Tech Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            icon: Zap,
                            title: "The Inspiration",
                            desc: "Obsessed with acoustic fingerprinting logic. I took Shazam's core concept and optimized it for efficiency and local database speed."
                        },
                        {
                            icon: Target,
                            title: "The Goal",
                            desc: "Creating an engine that doesn't just recognize hits, but preserves regional classics that global platforms often miss."
                        },
                        {
                            icon: Cpu,
                            title: "The Tech",
                            desc: "Built with Node.js, Python AI modules, and advanced signal processing to ensure millisecond-accuracy in every search."
                        }
                    ].map((goal, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                <goal.icon className="w-7 h-7 text-[#8b5cf6]" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{goal.title}</h3>
                            <p className="text-[#94a3b8] leading-relaxed font-medium">
                                {goal.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
