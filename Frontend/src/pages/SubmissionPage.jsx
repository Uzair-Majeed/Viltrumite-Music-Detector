import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Youtube, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import ManualIndexer from '../components/ManualIndexer';

const SubmissionPage = ({ user, onNotify }) => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-[#060010] text-white">
            {/* Left Side - Visual */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex w-1/2 relative overflow-hidden"
            >
                <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop"
                    alt="Music Studio"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-transparent bg-gradient-to-r from-[#060010]/20 to-[#060010]"></div>
                <div className="absolute inset-0 bg-[#8b5cf6]/30 mix-blend-overlay"></div>

                <div className="relative z-10 p-12 flex flex-col justify-end h-full">
                    <h2 className="text-5xl font-black mb-6 leading-tight">
                        Expand the<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">
                            Universe of Sound.
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-md">
                        Help us build the most comprehensive music database by adding missing tracks directly from YouTube.
                    </p>
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/recognize')}
                    className="absolute top-8 left-8 flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Recognition</span>
                </button>

                <div className="max-w-md w-full space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#ec4899]/10 flex items-center justify-center mx-auto mb-6">
                            <Youtube className="w-8 h-8 text-[#ec4899]" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Submit a Song</h1>
                        <p className="text-[#94a3b8]">
                            Paste a YouTube link to instantly index a new track.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <ManualIndexer
                            onNotify={onNotify}
                            onSuccess={() => navigate('/recognize')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionPage;
