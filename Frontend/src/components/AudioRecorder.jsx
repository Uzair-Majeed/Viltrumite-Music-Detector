import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import API_URL from '../config/api';

const LOADING_MESSAGES = [
    "Listening to the beat...",
    "Analyzing frequencies...",
    "Matching fingerprints...",
    "Consulting the archives...",
    "Almost there..."
];

const AudioRecorder = ({ onResult }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stream, setStream] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const msgTimerRef = useRef(null);

    // Cycle through loading messages
    useEffect(() => {
        if (isProcessing) {
            setLoadingMsgIndex(0);
            msgTimerRef.current = setInterval(() => {
                setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 1500);
        } else {
            if (msgTimerRef.current) clearInterval(msgTimerRef.current);
        }
        return () => {
            if (msgTimerRef.current) clearInterval(msgTimerRef.current);
        };
    }, [isProcessing]);

    const startRecording = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(audioStream);

            const mediaRecorder = new MediaRecorder(audioStream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);

                // Stop all tracks
                audioStream.getTracks().forEach(track => track.stop());
                setStream(null);
            };

            mediaRecorder.start();
            setIsRecording(true);
            onResult(null); // Clear previous result
            setTimeLeft(30);

            // Start 30s timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            onResult({ success: false, error: "Could not access microphone. Please check permissions." });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsProcessing(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const getFriendlyErrorMessage = (incomingError) => {
        const msg = incomingError?.toString().toLowerCase() || "";
        if (msg.includes('network') || msg.includes('fetch')) return "Connection lost. Please check your internet.";
        if (msg.includes('500') || msg.includes('internal')) return "Our audio engine is acting up. Please try again!";
        if (msg.includes('404')) return "Server endpoint not found.";
        return "We couldn't process that audio. Please try again.";
    };

    const processAudio = async (blob) => {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const response = await fetch(`${API_URL}/api/recognize`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            // Abstract backend errors if present
            if (!data.success && data.error) {
                // Keep specific "No match" messages if the backend sends them (usually it sends match_found: false)
                // But if it's a real error:
                data.error = getFriendlyErrorMessage(data.error);
            }

            onResult(data);
        } catch (error) {
            console.error("Recognition error:", error);
            onResult({ success: false, error: getFriendlyErrorMessage(error) });
        } finally {
            setIsProcessing(false);
        }
    };

    // Calculate progress for circle (30s max)
    const progress = ((30 - timeLeft) / 30) * 100;
    const circumference = 2 * Math.PI * 46; // Radius 46

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12">
            {/* Visualizer Area */}
            <div className="w-full relative h-48 md:h-64 bg-transparent flex items-center justify-center overflow-hidden rounded-3xl border-none shadow-none">
                {stream ? (
                    <AudioVisualizer isRecording={isRecording} stream={stream} />
                ) : (
                    <div className="text-center opacity-60 space-y-3">
                        <Music className="w-12 h-12 mx-auto text-white/50" />
                        <p className="text-sm font-medium tracking-widest uppercase text-white/70">Ready to Identify</p>
                    </div>
                )}

                {/* Processing Overlay */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 blur-xl bg-pink-500/30 rounded-full animate-pulse"></div>
                                <Loader2 className="w-16 h-16 text-[#ec4899] animate-spin relative z-10" />
                            </div>

                            {/* Dynamic Loading Message */}
                            <motion.p
                                key={loadingMsgIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-xl font-medium text-white mt-6 tracking-wide"
                            >
                                {LOADING_MESSAGES[loadingMsgIndex]}
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timer Overlay */}
                {isRecording && (
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs font-mono font-bold text-white/90">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                    </div>
                )}
            </div>

            {/* Main Controls - Circular Button */}
            <div className="flex justify-center -mt-6">
                <div className="relative">
                    {/* Ripple Effects when recording */}
                    {isRecording && (
                        <>
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse delay-75 transform scale-150"></div>
                        </>
                    )}

                    {/* Progress Ring SVG */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {isRecording && (
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="46"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="46"
                                    fill="none"
                                    stroke="#ec4899"
                                    strokeWidth="4"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (progress / 100) * circumference}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                        )}

                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                disabled={isProcessing}
                                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] p-[2px] shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.7)] transition-shadow duration-500"
                            >
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center group-hover:bg-[#1e293b] transition-colors relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="group relative w-24 h-24 rounded-full bg-red-500/20 p-[2px] shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]"
                            >
                                <div className="w-full h-full rounded-full bg-[#0f172a] border-2 border-red-500 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                                    <Square className="w-8 h-8 text-red-500 fill-current group-hover:scale-90 transition-transform" />
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm font-medium text-white/50 tracking-wider uppercase">
                            {isRecording ? "Tap to Stop" : "Tap to Identify"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioRecorder;
