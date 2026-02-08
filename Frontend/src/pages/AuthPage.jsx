import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Music } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LightRays from '../components/LightRays';
import API_URL from '../config/api';

const AuthPage = ({ onAuthSuccess, onNotify }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/signup`;
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('viltrumite_token', data.token);
                localStorage.setItem('viltrumite_user', JSON.stringify(data.user));
                onAuthSuccess(data.user);
                navigate('/');
            } else {
                onNotify({
                    type: 'error',
                    message: data.error || 'Authentication failed'
                });
            }
        } catch (error) {
            console.error('Auth error:', error);
            onNotify({
                type: 'error',
                message: 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#060010] text-white relative overflow-hidden">
            {/* Background Effects - Forced to top-left */}
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

            {/* LEFT SIDE: AUTH FORM (STRICT 50%) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-1/2 h-full flex flex-col justify-center px-12 md:px-20 lg:px-32 relative z-10"
            >
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
                        </Link>

                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                            {isLogin ? 'Welcome Back.' : 'Get Started.'}
                        </h1>
                        <p className="text-[#94a3b8] text-lg leading-relaxed">
                            {isLogin
                                ? 'Sign in to access your personal music vault.'
                                : 'Join the community and start building your library.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569] group-focus-within:text-[#8b5cf6] transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569] group-focus-within:text-[#8b5cf6] transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569] group-focus-within:text-[#8b5cf6] transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-purple-500/20"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[#94a3b8] font-medium">
                            {isLogin ? "New to Viltrumite?" : "Already a member?"}{' '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white font-black hover:text-[#8b5cf6] transition-colors ml-2 underline decoration-2 underline-offset-4"
                            >
                                {isLogin ? 'Join now' : 'Log in here'}
                            </button>
                        </p>
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
                        src="/SideImages/Signin.jpg"
                        alt="Music Visualization"
                        className="w-full h-full object-cover"
                    />
                    {/* High-fidelity overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060010] via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-[#060010]/20 mix-blend-multiply" />

                    <div className="absolute bottom-20 left-20 right-20 z-20">
                        <div className="p-4 bg-white/5 backdrop-blur-2xl w-fit rounded-3xl border border-white/10 mb-8 shadow-2xl">
                            <Music className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                            The ultimate high-fidelity<br />music recognition engine.
                        </h2>
                        <p className="text-white/60 font-bold text-xl tracking-tight max-w-md">
                            Identify, explore, and build your digital library.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
