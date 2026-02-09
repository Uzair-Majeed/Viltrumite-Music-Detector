import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Library as LibraryIcon, ChevronLeft, ChevronRight, Youtube } from 'lucide-react';
import Lightning from '../components/Lightning';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';
import API_URL from '../config/api';

const ScrollStackSkeleton = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-20">
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className="w-full h-[28rem] rounded-[40px] bg-white/5 border border-white/10 animate-pulse relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 space-y-4">
                    <div className="h-4 bg-white/10 rounded-full w-24" />
                    <div className="h-10 bg-white/10 rounded-xl w-3/4" />
                    <div className="h-6 bg-white/5 rounded-lg w-1/2" />
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

    // Initialize genre from URL immediately to avoid double fetch
    const [selectedGenre, setSelectedGenre] = useState(() => {
        return searchParams.get('genre') || 'All';
    });

    const [stats, setStats] = useState({ total: 0 });
    const [page, setPage] = useState(1);
    const limit = 7;

    // Use a ref to track the latest fetch to avoid race conditions
    const fetchIdRef = useRef(0);

    // Sync genre from URL changes (if any)
    useEffect(() => {
        const genreParam = searchParams.get('genre');
        if (genreParam && genreParam !== selectedGenre) {
            setSelectedGenre(genreParam);
            setPage(1);
        }
    }, [searchParams]);

    // Reset page when genre changes
    useEffect(() => {
        setPage(1);
    }, [selectedGenre]);

    // Ensure scroll to top
    useEffect(() => {
        if (!loading && songs.length > 0) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [songs, loading]);

    const fetchSongs = async () => {
        const currentFetchId = ++fetchIdRef.current;
        setLoading(true);
        const offset = (page - 1) * limit;
        try {
            const response = await fetch(`${API_URL}/api/songs?limit=${limit}&offset=${offset}&genre=${encodeURIComponent(selectedGenre)}&search=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            // Only update state if this is still the latest fetch
            if (currentFetchId === fetchIdRef.current) {
                if (data.songs) {
                    setSongs(data.songs);
                    setStats({ total: data.total });
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            if (currentFetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchSongs();
    }, [page, selectedGenre]);

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

    const genres = ['All', 'Pop', 'Hip-Hop', 'Anime', 'Rap', 'Phonk', 'K-Pop', 'Classical', 'Jazz'];

    const totalPages = Math.ceil(stats.total / limit);

    return (
        <div className="pt-24 min-h-screen relative overflow-x-hidden">
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

                {/* ScrollStack / Magic Bento */}
                {loading ? (
                    <ScrollStackSkeleton />
                ) : (
                    <>
                        <div className="mb-12 min-h-[60vh]">

                            <ScrollStack
                                useWindowScroll={true}
                                stackPosition="10%"
                                itemStackDistance={20}
                            >
                                {songs.map((song, index) => (
                                    <ScrollStackItem key={song.id || index}>
                                        <div
                                            className="absolute inset-0 rounded-[40px] overflow-hidden bg-cover bg-center"
                                            style={{ backgroundImage: `url(${song.thumbnail || song.image})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                                            <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                                <div className="flex justify-between items-end gap-6">
                                                    <div className="flex-1">
                                                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-[#8b5cf6] border border-white/10 mb-4 uppercase tracking-wider">
                                                            {song.genre || 'Music'}
                                                        </span>
                                                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 line-clamp-1">
                                                            {song.title || song.name}
                                                        </h2>
                                                        <p className="text-xl text-white/70 font-medium">
                                                            {song.artist || 'Unknown Artist'}
                                                        </p>
                                                    </div>

                                                    <a
                                                        href={song.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95"
                                                    >
                                                        <Youtube className="w-6 h-6" />
                                                        Listen Now
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollStackItem>
                                ))}
                            </ScrollStack>


                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-4 mt-16 relative z-50">
                            <button
                                onClick={() => {
                                    setPage(p => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page === 1}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-bold text-[#94a3b8]">
                                Page {page} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => {
                                    setPage(p => Math.min(totalPages, p + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
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
