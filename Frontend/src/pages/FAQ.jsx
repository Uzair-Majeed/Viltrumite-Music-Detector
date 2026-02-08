import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import LightRays from '../components/LightRays';
import InteractiveFlowingMenu from '../components/InteractiveFlowingMenu';

const FAQ = () => {
    const [selectedFAQ, setSelectedFAQ] = useState(null);

    const faqs = [
        {
            text: "How does Viltrumite identify music?",
            answer: "We use advanced acoustic fingerprinting technology. When you record audio, our system converts it into a spectrogram and extracts unique mathematical markers. This 'fingerprint' is then compared against our massive database of indexed tracks to find a precise match in seconds.",
            image: "/faq/tech.jpg",
            link: "#"
        },
        {
            text: "Why is there a usage limit?",
            answer: "To ensure the highest quality of service and prevent automated abuse, we limit guest usage to 3 recognitions. Creating a free account unlocks unlimited access, allowing you to build your personal discovery library and save your history.",
            image: "/faq/security.jpg",
            link: "#"
        },
        {
            text: "Can I contribute to the database?",
            answer: "Yes! Community contributions are vital. If our system fails to recognize a song, authenticated users can provide a YouTube link. Our backend will automatically analyze, fingerprint, and index that song so it becomes discoverable for everyone.",
            image: "/faq/music.jpg",
            link: "#"
        },
        {
            text: "What makes this different?",
            answer: "While we check global catalogs, Viltrumite maintains a specialized, high-fidelity database focused on Pakistani and regional music. We index indie tracks and local classics that are often missing from mainstream platforms.",
            image: "/faq/database.jpg",
            link: "#"
        },
        {
            text: "Is my data private?",
            answer: "Absolutely. We do not store your recorded audio samples. We only process the anonymous fingerprint data to perform the lookup, and then discard the sample immediately. Your listening history is private to you.",
            image: "/faq/privacy.jpg",
            link: "#"
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#060010]">
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

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-20">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Frequently Asked Questions</h1>
                </div>

                <div className="w-full h-[600px] relative">
                    <InteractiveFlowingMenu
                        items={faqs}
                        speed={12}
                        textColor="#ffffff"
                        bgColor="transparent"
                        marqueeBgColor="#8b5cf6"
                        marqueeTextColor="#ffffff"
                        borderColor="#ffffff20"
                        onItemClick={(item) => setSelectedFAQ(item)}
                    />
                </div>
            </div>

            {/* Answer Modal */}
            <AnimatePresence>
                {selectedFAQ && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFAQ(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#060010] border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute inset-0 rounded-[2rem] pointer-events-none border border-white/10" />
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#8b5cf6]" />

                            {/* Glow effect */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8b5cf6] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#ec4899] rounded-full blur-[100px] opacity-20 pointer-events-none" />

                            <button
                                onClick={() => setSelectedFAQ(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="relative z-10">
                                <h2 className="text-4xl font-black text-white mb-6 pr-8 tracking-tight">{selectedFAQ.text}</h2>
                                <p className="text-lg text-white/80 leading-relaxed font-medium">
                                    {selectedFAQ.answer}
                                </p>

                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                    <button
                                        onClick={() => setSelectedFAQ(null)}
                                        className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQ;
