import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card';

export default function HorizontalSection({ title, items, onItemClick, onAction, ...props }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold dark:text-white">{title}</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-pl-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item, idx) => (
                    <div key={idx} className="snap-start"> {/* Removed w-64 to let Card width control spacing */}
                        <Card
                            item={item}
                            onClick={onItemClick}
                            onAction={onAction}
                            isWishlisted={props.isWishlisted(item.title)}
                            isWatched={props.isWatched(item.title)}
                            isDisliked={props.isDisliked(item.title)}
                        />
                    </div>
                ))}
                {/* Spacer for right padding */}
                <div className="w-1 flex-shrink-0" />
            </div>
        </div>
    );
}
