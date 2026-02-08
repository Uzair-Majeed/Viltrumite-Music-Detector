import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Library as LibraryIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import MagicBento from '../components/MagicBento';
import Lightning from '../components/Lightning';

const MagicBentoSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-[54em] mx-auto p-3">
        {[...Array(14)].map((_, i) => (
            <div
                key={i}
                className={`aspect-[4/3] rounded-[20px] bg-white/5 border border-white/5 animate-pulse overflow-hidden relative
                    ${i === 2 ? 'col-span-1 lg:col-span-2 lg:row-span-2' : ''}
                    ${i === 3 ? 'col-span-1 lg:col-span-2 lg:row-span-2' : ''}
                    ${i === 5 ? 'col-span-1 lg:col-span-1 lg:grid-column-4 lg:grid-row-3' : ''}
                `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 space-y-2">
                    <div className="h-6 bg-white/10 rounded-md w-3/4" />
                    <div className="h-4 bg-white/5 rounded-md w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const Library = () => {
    const [searchParams] = useSearchParams();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [stats, setStats] = useState({ total: 0 });
    const [page, setPage] = useState(1);
    const limit = 14;

    // Initialize genre from URL
    useEffect(() => {
        const genreParam = searchParams.get('genre');
        if (genreParam) {
            setSelectedGenre(genreParam);
        }
    }, [searchParams]);

    // Reset page when genre changes
    useEffect(() => {
        setPage(1);
    }, [selectedGenre]);

    useEffect(() => {
        fetchSongs();
    }, [page, selectedGenre]);

    const fetchSongs = async () => {
        setLoading(true);
        const offset = (page - 1) * limit;
        try {
            const response = await fetch(`/api/songs?limit=${limit}&offset=${offset}&genre=${encodeURIComponent(selectedGenre)}&search=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data.songs) {
                setSongs(data.songs);
                setStats({ total: data.total });
            }
        } catch (error) {
            console.error('Failed to fetch songs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchSongs();
            } else {
                setPage(1); // This will trigger fetchSongs via the page effect
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const genres = ['All','Pop','Hip-Hop','Anime','Rap','Phonk','R&B','Jazz','Blues','Classical','Electronic','Dance','EDM','House','Techno','Trance','Dubstep','Drum & Bass','Reggae','Latin','K-Pop','Indie'];

    const totalPages = Math.ceil(stats.total / limit);

    return (
        <div className="pt-24 min-h-screen relative">
            <Lightning
                hue={200}
                xOffset={0}
                speed={0.4}
                intensity={1.0}
                size={0.9}
            />
            <div className="max-w-[1920px] mx-auto px-6 pb-24">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#06b6d4]">
                                <LibraryIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black tracking-widest text-[#06b6d4] uppercase">Discovery Vault</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Music Library</h1>
                        <p className="text-[#64748b] mt-2">Explore tracks fingerprinted by the Viltrumite.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#8b5cf6] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by title, artist or genre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-80 pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Genre Filter Bar */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {genres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedGenre === genre
                                ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                                : 'bg-white/5 border-white/10 text-[#94a3b8] hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Magic Bento Grid */}
                {loading ? (
                    <MagicBentoSkeleton />
                ) : (
                    <>
                        <div className="mb-12">
                            <MagicBento
                                items={songs}
                                textAutoHide={false}
                                enableStars={true}
                                enableSpotlight={true}
                                enableBorderGlow={true}
                                enableTilt={true}
                                enableMagnetism={true}
                                clickEffect={true}
                                spotlightRadius={300}
                                particleCount={12}
                                glowColor="132, 0, 255"
                                disableAnimations={false}
                            />
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-4 mt-16">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-bold text-[#94a3b8]">
                                Page {page} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}

                {!loading && songs.length === 0 && (
                    <div className="text-center py-32 space-y-6">
                        <div className="p-8 rounded-full bg-white/5 border border-white/5 inline-block">
                            <Search className="w-12 h-12 text-white/20" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
                            <p className="text-[#64748b]">We couldn't find any songs matching "{searchQuery}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Library;
