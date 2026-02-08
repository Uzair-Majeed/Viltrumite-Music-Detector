import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AudioRecorder from '../components/AudioRecorder';
import ResultCard from '../components/ResultCard';
import LightRays from '../components/LightRays';

const Recognition = ({ user, onNotify }) => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [guestCount, setGuestCount] = useState(0);

    useEffect(() => {
        const count = parseInt(localStorage.getItem('viltrumite_guest_count') || '0');
        setGuestCount(count);
    }, []);

    const handleResult = (data) => {
        setResult(data);

        // Show toast if no match found or error occurred
        if (data) {
            if (!data.success) {
                onNotify({
                    type: 'error',
                    message: data.error || 'Recognition failed. Please try again.',
                    duration: 5000
                });
            } else if (!data.match_found) {
                onNotify({
                    type: 'error',
                    message: 'Nothing found. Try listening for longer periods to get better results!',
                    duration: 6000
                });
            }
        }

        // Handle guest limit
        if (!user && data) {
            const newCount = guestCount + 1;
            setGuestCount(newCount);
            localStorage.setItem('viltrumite_guest_count', newCount.toString());

            if (newCount >= 3) {
                onNotify({
                    type: 'error',
                    message: 'You have reached the 3-recognition limit for guests. Please sign up to continue!',
                    duration: 7000
                });
                navigate('/login');
            }
        }
    };

    const isLimitReached = !user && guestCount >= 3;

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
                    noiseAmount={0}
                    distortion={0}
                    className="custom-rays"
                    pulsating={false}
                    fadeDistance={1}
                    saturation={1}
                />
            </div>

            <div className="max-w-4xl mx-auto space-y-12 mb-16 relative z-10">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-5xl font-black text-white tracking-tighter">Audio Analysis</h1>
                    <p className="text-[#94a3b8] max-w-xl mx-auto">
                        Identify tracks using our audio fingerprinting recognition engine.
                        {!user && (
                            <span className="block mt-2 text-[#06b6d4] font-bold">
                                Guest uses: {guestCount}/3
                            </span>
                        )}
                    </p>
                </div>

                <div className={isLimitReached ? "opacity-50 pointer-events-none grayscale blur-sm" : ""}>
                    <AudioRecorder onResult={handleResult} />
                </div>

                {isLimitReached && (
                    <div className="p-8 rounded-[2.5rem] bg-[#ec4899]/10 border border-[#ec4899]/20 text-center relative z-20 -mt-20">
                        <h3 className="text-2xl font-bold text-white mb-2">Limit Reached</h3>
                        <p className="text-[#94a3b8] mb-6">You've performed 3 free recognitions today. Sign up for unlimited access!</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-10 py-4 rounded-2xl bg-[#ec4899] text-white font-bold hover:scale-105 transition-all shadow-xl shadow-pink-500/20"
                        >
                            Sign Up Now
                        </button>
                    </div>
                )}

                <ResultCard result={result} />

                {/* Contribution Section - Links to SubmissionPage */}
                <div className="pt-12 border-t border-white/5 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Can't find what you're looking for?</h3>
                    <p className="text-[#94a3b8] mb-6">Help us expand the library by adding the song manually.</p>

                    {user ? (
                        <button
                            onClick={() => navigate('/submit')}
                            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold inline-flex items-center gap-2"
                        >
                            Submit a Link <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold"
                        >
                            Login to Contribute
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recognition;
