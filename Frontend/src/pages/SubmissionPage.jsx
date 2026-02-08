import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Youtube, ArrowRight, Music } from 'lucide-react';
import ManualIndexer from '../components/ManualIndexer';
import LightRays from '../components/LightRays';

const SubmissionPage = ({ user, onNotify }) => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full bg-[#060010] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <LightRays
                    raysOrigin="top-left"
                    raysColor="#ffffff"
                    raysSpeed={1.2}
                    lightSpread={1.0}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.1}
                />
            </div>

            {/* LEFT SIDE: FORM (STRICT 50%) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-1/2 h-full flex flex-col justify-center px-12 md:px-20 lg:px-32 relative z-10"
            >
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <Link to="/recognize" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Back to Recognition</span>
                        </Link>

                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                            Submit Tracks.
                        </h1>
                        <p className="text-[#94a3b8] text-lg leading-relaxed">
                            Help us build the most comprehensive music database by adding missing tracks directly from YouTube.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <ManualIndexer
                            onNotify={onNotify}
                            onSuccess={() => navigate('/recognize')}
                        />
                    </div>
                </div>
            </motion.div>

            {/* RIGHT SIDE: IMAGE (STRICT 50%) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-1/2 h-full relative"
            >
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="/SideImages/Submit.jpg"
                        alt="Music Studio"
                        className="w-full h-full object-cover"
                    />
                    {/* High-fidelity overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060010] via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-[#060010]/20 mix-blend-multiply" />

                    <div className="absolute bottom-20 left-20 right-20 z-20">
                       
                        <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">
                            Expand the<br />Universe of Sound.
                        </h2>
                        <p className="text-white/60 font-bold text-xl tracking-tight max-w-md">
                            Paste a YouTube link to instantly index a new track and help Viltrumite grow.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubmissionPage;
