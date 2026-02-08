import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle, Disc } from 'lucide-react';

const ResultCard = ({ result }) => {
    if (!result || !result.success) {
        if (result?.error) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl mx-auto p-6 glass-panel border-[#ec4899]/30 bg-[#ec4899]/5 text-center"
                >
                    <p className="text-[#ec4899] font-medium">{result.error}</p>
                </motion.div>
            );
        }
        return null;
    }

    if (!result.match_found) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto p-8 glass-panel text-center"
            >
                <p className="text-xl text-[#94a3b8]">No match found in database.</p>
                <p className="text-sm text-[#64748b] mt-2">Try adding more songs or checking your recording.</p>
            </motion.div>
        );
    }

    const bestMatch = result.matches[0];

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="glass-panel p-1 relative overflow-hidden"
            >
                {/* Glow effect */}
                <div className="absolute top-0 right-0 p-32 bg-[#8b5cf6] opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 p-32 bg-[#ec4899] opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"></div>

                <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left relative z-10">

                    {/* Album Art / Thumbnail */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-2xl flex items-center justify-center shrink-0 border border-white/5 relative group overflow-hidden">
                        {bestMatch.thumbnail ? (
                            <img
                                src={bestMatch.thumbnail}
                                alt={bestMatch.title}
                                className="w-full h-full object-cover rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <Disc className="w-16 h-16 text-white/20 animate-[spin_10s_linear_infinite]" />
                            </>
                        )}

                        {/* Confidence Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#1e293b] border border-white/10 px-3 py-1 rounded-tl-xl rounded-br-xl text-xs font-bold text-[#ec4899] shadow-lg z-20">
                            {bestMatch.confidence}% Match
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 pt-1">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                                    {bestMatch.title}
                                </h2>
                                {bestMatch.is_shazam_match ? (
                                    <span className="px-2 py-0.5 rounded-md bg-[#0088ff20] border border-[#0088ff40] text-[10px] font-bold text-[#0088ff] uppercase tracking-tighter">
                                        Global Discovery
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-[#22c55e20] border border-[#22c55e40] text-[10px] font-bold text-[#22c55e] uppercase tracking-tighter">
                                        Library Match
                                    </span>
                                )}
                            </div>
                            <p className="text-xl text-[#ec4899] font-medium mt-1">{bestMatch.artist}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 rounded-full bg-[#1e293b] border border-white/5 text-xs font-medium text-[#94a3b8]">
                                {bestMatch.genre || 'Unknown Genre'}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[#1e293b] border border-white/5 text-xs font-medium text-[#94a3b8]">
                                ID: {bestMatch.song_id || 'N/A'}
                            </span>
                        </div>

                        <div className="pt-2">
                            <a
                                href={bestMatch.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${bestMatch.url ? 'text-[#ec4899] hover:text-[#d61f69]' : 'text-white/50 hover:text-white'}`}
                                onClick={(e) => !bestMatch.url && e.preventDefault()}
                            >
                                <ExternalLink className="w-4 h-4" />
                                {bestMatch.url ? "Listen on YouTube" : "View Details"}
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Other Matches (if any) */}
            {result.matches.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6"
                >
                    <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Other Potential Matches</h3>
                    <div className="space-y-3">
                        {result.matches.slice(1).map((match, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-[#1e293b] flex items-center justify-center text-xs font-bold text-white/30">
                                        {i + 2}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white group-hover:text-[#ec4899] transition-colors">{match.title}</p>
                                            {match.is_shazam_match ? (
                                                <span className="px-1.5 py-0.25 rounded bg-[#0088ff10] border border-[#0088ff30] text-[8px] font-bold text-[#0088ff] uppercase">Global</span>
                                            ) : (
                                                <span className="px-1.5 py-0.25 rounded bg-[#22c55e10] border border-[#22c55e30] text-[8px] font-bold text-[#22c55e] uppercase">Library</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#94a3b8]">{match.artist}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-white/50">{match.confidence}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ResultCard;
