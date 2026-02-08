import { motion } from 'framer-motion';
import { ExternalLink, Music2 } from 'lucide-react';

const SongCard = ({ song, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-1 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-white/10 rounded-[21px]"
        >
            <div className="backdrop-blur-xl rounded-[20px] p-6 relative z-10">
                {/* Thumbnail */}
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-2xl flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden">
                    {song.thumbnail ? (
                        <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-full h-full object-cover rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <Music2 className="w-16 h-16 text-white/20" />
                        </>
                    )}
                </div>

                {/* Song Info */}
                <div className="space-y-3">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2 group-hover:text-[#ec4899] transition-colors">
                            {song.title}
                        </h3>
                        <p className="text-base text-[#94a3b8] font-medium mt-1 line-clamp-1">
                            {song.artist}
                        </p>
                    </div>

                    {/* Genre Badge */}
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-[#1e293b] border border-white/5 text-xs font-medium text-[#94a3b8]">
                            {song.genre || 'Unknown'}
                        </span>
                    </div>

                    {/* YouTube Link */}
                    <a
                        href={song.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-sm font-semibold transition-all ${song.url
                            ? 'text-[#ec4899] hover:text-[#d61f69] hover:gap-3'
                            : 'text-white/30 cursor-not-allowed'
                            }`}
                        onClick={(e) => !song.url && e.preventDefault()}
                    >
                        <ExternalLink className="w-4 h-4" />
                        {song.url ? "Listen on YouTube" : "No Link Available"}
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default SongCard;
