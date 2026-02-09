import React, { useState } from 'react';
import { Music, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import API_URL from '../config/api';

const ManualIndexer = ({ onNotify }) => {
    const [url, setUrl] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomGenre, setIsCustomGenre] = useState(false);

    const genres = ['All', 'Pop', 'Hip-Hop', 'Anime', 'Rap', 'Phonk', 'K-Pop', 'Classical', 'Jazz'];


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url || !selectedGenre) return;

        const token = localStorage.getItem('viltrumite_token');
        const genreToSend = selectedGenre || "User Contributed";

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/manual-index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url, genre: genreToSend })
            });
            const data = await response.json();

            if (data.success) {
                onNotify({
                    type: 'success',
                    message: data.message || 'Thank you for helping Viltrumite grow! 🚀',
                    duration: 5000
                });
                setUrl('');
                setSelectedGenre('');
                setIsCustomGenre(false);
            } else {
                onNotify({
                    type: 'error',
                    message: data.error || 'Failed to add song. Please try again.',
                    duration: 5000
                });
            }
        } catch (error) {
            onNotify({
                type: 'error',
                message: 'Network error. Could not connect to Viltrumite.',
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl shadow-lg">
                    <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Didn't find your match?</h3>
                    <p className="text-sm text-[#94a3b8]">Help Viltrumite grow by providing a YouTube link!</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube link here..."
                        className="w-full px-6 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all text-sm"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Genre Tags */}
                <div>
                    <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3 block">
                        Select Genre (Required)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {genres.map(g => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => {
                                    setSelectedGenre(g);
                                    setIsCustomGenre(false);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedGenre === g && !isCustomGenre
                                    ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-white/5 border-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedGenre('');
                                setIsCustomGenre(true);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isCustomGenre
                                ? 'bg-[#ec4899] border-[#ec4899] text-white shadow-lg shadow-pink-500/20'
                                : 'bg-white/5 border-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            Custom +
                        </button>
                    </div>

                    {isCustomGenre && (
                        <input
                            type="text"
                            placeholder="Enter custom genre..."
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="mt-3 w-full px-5 py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50"
                            autoFocus
                        />
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting || !url || !selectedGenre}
                        className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                        ) : (
                            <>Submit Contribution <Send className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </form>

            <p className="mt-6 text-[10px] text-[#94a3b8]/50 text-center uppercase tracking-widest">
                Links must be shorter than 10 minutes to be processed
            </p>
        </div>
    );
};

export default ManualIndexer;
