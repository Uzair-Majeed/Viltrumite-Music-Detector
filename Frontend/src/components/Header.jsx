import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, Menu, X, User, LogOut, ChevronDown, Library, Info, HelpCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Recognize', path: '/recognize', icon: Music },
        { name: 'Library', path: '/library', icon: Library },
        { name: 'About', path: '/about', icon: Info },
        { name: 'FAQ', path: '/faq', icon: HelpCircle },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="fixed top-0 left-0 w-full z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2.5 rounded-2xl group-hover:scale-110 transition-transform">
                        <img src="/Logos/Viltrumite_Logo.jpg" alt="Viltrumite Logo" style={{ width: '40px', height: '40px' }} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white">Viltrumite</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl backdrop-blur-3xl border border-white/10 shadow-xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive(link.path)
                                ? 'bg-white/10 text-white shadow-inner'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Auth / Profile */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{user.username}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-48 rounded-2xl bg-[#1e293b]/90 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden z-50 p-2"
                                    >
                                        <button
                                            onClick={() => {
                                                onLogout();
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-[#ec4899] hover:bg-white/5 rounded-xl transition-colors font-semibold"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-3 rounded-2xl text-white font-bold hover:bg-white/5 transition-all text-sm"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 text-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-white"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="fixed inset-0 top-[88px] bg-black/60 backdrop-blur-2xl z-40 md:hidden p-6"
                    >
                        <nav className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-5 rounded-3xl text-lg font-bold transition-all ${isActive(link.path)
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/40 border border-white/5'
                                        }`}
                                >
                                    <link.icon className="w-6 h-6" />
                                    {link.name}
                                </Link>
                            ))}
                            {!user && (
                                <div className="flex flex-col gap-3 mt-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold text-center text-lg"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full py-5 rounded-3xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-bold text-center text-lg shadow-xl"
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
