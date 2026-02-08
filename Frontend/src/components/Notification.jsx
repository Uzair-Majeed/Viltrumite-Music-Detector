import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose();
            }, notification.duration || 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] min-w-[320px]"
                >
                    <div className="p-1.5 rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 pr-12">
                        <div className={`p-3 rounded-xl ${notification.type === 'success' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            {notification.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-rose-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 px-2 leading-tight">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;
