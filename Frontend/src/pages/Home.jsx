import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Zap, Database, Shield, ArrowRight, Play, Search, Library } from 'lucide-react';
import Lightning from '../components/Lightning';
import FlowingMenu from '../components/FlowingMenu';

const Home = () => {
    const genreItems = [
        { link: '/library?genre=Pop', text: 'Pop Hits', image: '/Genres/pop.webp' },
        { link: '/library?genre=Hip-Hop', text: 'Hip-Hop Beats', image: '/Genres/rap.jpg' },
        { link: '/library?genre=Phonk', text: 'Phonk Beats', image: '/Genres/phonk.jpg' },
        { link: '/library?genre=Anime', text: 'Anime Soundtracks', image: '/Genres/anime' },
        { link: '/library?genre=Classical', text: 'Classical', image: '/Genres/classical.webp' }
    ];

    return (
        <div className="pt-24 min-h-screen relative">
            <Lightning
                hue={260}
                xOffset={0}
                speed={0.5}
                intensity={1.2}
                size={0.8}
            />
            {/* Hero Section */}
            <section className="relative px-6 py-20 md:py-32 overflow-hidden min-h-[90vh] flex items-center">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10 w-full">
                    <div className="flex-1 text-center md:text-left space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#06b6d4]"></span>
                            </span>
                            <span className="text-xs font-bold tracking-widest text-[#06b6d4] uppercase">Next-Gen Audio Fingerprinting</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
                        >
                            <span className="text-white">Identify any</span><br />
                            <span className="bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">Soundtrack.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-[#94a3b8] max-w-xl mx-auto md:mx-0 leading-relaxed font-light"
                        >
                            The most advanced music recognition platform for high-fidelity discovery. Powered by AI and a specialized Pakistani music database.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
                        >
                            <Link
                                to="/recognize"
                                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(139,92,246,0.2)]"
                            >
                                Start Detecting <Zap className="w-5 h-5 fill-white" />
                            </Link>
                            <Link
                                to="/library"
                                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                            >
                                Explore Library <Library className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Hero Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex-1 relative"
                    >
                        <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-white/10 group">
                            <img
                                src="/SideImages/Home.jpeg"
                                alt="Music Tech"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
                            <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay"></div>
                        </div>

                        {/* Decorative blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#8b5cf6] opacity-20 blur-3xl rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ec4899] opacity-20 blur-3xl rounded-full"></div>
                    </motion.div>
                </div>
            </section>

            {/* Genre Menu Section */}
            <section className="py-24 w-full">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Explore Genres.</h2>
                        <p className="text-[#94a3b8]">Discover music across diverse categories tailored for you.</p>
                    </div>
                </div>

                <div className="w-full" style={{ height: '600px', position: 'relative' }}>
                    <FlowingMenu
                        items={genreItems}
                        speed={15}
                        textColor="#ffffff"
                        bgColor="transparent"
                        marqueeBgColor="#8b5cf6"
                        marqueeTextColor="#ffffff"
                        borderColor="#ffffff20"
                    />
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-6 py-20">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] p-1 shadow-2xl">
                    <div className="rounded-[2.9rem] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#0f172a]/80 backdrop-blur-xl">
                        {[
                            { val: "99.2%", label: "Accuracy Rate" },
                            { val: "10k+", label: "Songs Indexed" },
                            { val: "< 1.5s", label: "Match Speed" }
                        ].map((stat, i) => (
                            <div key={i} className="flex-1 p-12 text-center">
                                <div className="text-4xl font-black text-white mb-2">{stat.val}</div>
                                <div className="text-[#94a3b8] tracking-widest uppercase text-xs font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
