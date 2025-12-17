import React from 'react';


import { Heart, ThumbsDown, Eye, Info } from 'lucide-react';

export default function Card({ item, onClick, onAction, isWatched, isWishlisted, isDisliked }) {
    return (
        <div
            onClick={() => onClick(item)}
            className="group relative flex-shrink-0 w-[140px] md:w-[160px] aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-4xl mb-2">📚</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</span>
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold leading-tight mb-1 line-clamp-2 text-sm">{item.title}</h3>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-300 mb-2">
                    <span className="font-medium text-indigo-300">{item.genres?.[0]}</span>
                    {item.year > 0 && <span>• {item.year}</span>}
                    {item.average_rating > 0 && (
                        <span className="flex items-center gap-0.5 text-yellow-400">
                            ★ {item.average_rating.toFixed(1)}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction('WATCHED', item); }}
                        className={`flex-1 py-1.5 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center justify-center transition-colors ${isWatched
                            ? 'bg-green-600 shadow-inner'
                            : 'bg-white/20 hover:bg-green-500/80'
                            }`}
                        title="Mark as Watched"
                    >
                        <Eye size={14} className={isWatched ? 'fill-current' : ''} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction('WISHLIST', item); }}
                        className={`flex-1 py-1.5 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center justify-center transition-colors ${isWishlisted
                            ? 'bg-blue-600 shadow-inner'
                            : 'bg-white/20 hover:bg-blue-500/80'
                            }`}
                        title="Add to Wishlist"
                    >
                        <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction('DISLIKE', item); }}
                        className={`flex-1 py-1.5 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center justify-center transition-colors ${isDisliked
                            ? 'bg-red-600 shadow-inner'
                            : 'bg-white/20 hover:bg-red-500/80'
                            }`}
                        title="Dislike"
                    >
                        <ThumbsDown size={14} className={isDisliked ? 'fill-current' : ''} />
                    </button>
                </div>
            </div>

            {/* Quick Action (Info) Top Right */}
            <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-indigo-500 transition-all custom-quick-action"
                onClick={(e) => { e.stopPropagation(); onClick(item); }}
            >
                <Info size={16} />
            </button>
        </div>
    );
}
