import React from 'react';
import { X, Heart, Eye, Check, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetailModal({ isOpen, onClose, item, onAction, isWatched, isWishlisted }) {
    if (!isOpen || !item) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row pointer-events-auto min-h-[500px]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-gray-800 dark:text-white transition z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Image Side */}
                    <div className="w-full md:w-2/5 bg-gray-200 dark:bg-gray-700 min-h-[300px] md:min-h-full relative">
                        {item.image ? (
                            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <span className="text-sm">No Cover Image</span>
                            </div>
                        )}
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 p-8 flex flex-col">
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {item.genres?.map(g => (
                                    <span key={g} className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide">
                                        {g}
                                    </span>
                                ))}
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{item.title}</h2>
                            <div className="flex items-center gap-4 mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {item.year > 0 && <span>{item.year}</span>}
                                {item.average_rating > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-500">
                                        ★ {item.average_rating.toFixed(1)} Rating
                                    </span>
                                )}
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                    {item.description || item.synopsis || "No detailed description available."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => onAction('WISHLIST', item)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${isWishlisted
                                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                                <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                            </button>
                            <button
                                onClick={() => onAction('WATCHED', item)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition shadow-lg ${isWatched
                                    ? 'bg-green-600 text-white shadow-green-200 dark:shadow-green-900'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900'
                                    }`}
                            >
                                {item.type === 'movie' ? <Eye size={20} /> : <BookOpen size={20} />}
                                <span>{isWatched ? (item.type === 'movie' ? 'Watched' : 'Read') : (item.type === 'movie' ? 'Mark Watched' : 'Mark Read')}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
