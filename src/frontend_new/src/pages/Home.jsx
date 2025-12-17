import React, { useState } from 'react';
import { Search, X, ChevronDown, Check, BookOpen } from 'lucide-react';
import HorizontalSection from '../components/HorizontalSection';
import DetailModal from '../components/DetailModal';

import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const EMOTIONS = [
    { label: 'All', emoji: ' ' },
    { label: 'Anger', emoji: '😠' },
    { label: 'Disgust', emoji: '🤢' },
    { label: 'Fear', emoji: '😱' },
    { label: 'Joy', emoji: '😂' },
    { label: 'Sadness', emoji: '😢' },
    { label: 'Surprise', emoji: '😲' },
    { label: 'Neutral', emoji: '😐' }
];

const TABS = [
    { id: 'top', label: 'Top Matches' },
    { id: 'popular', label: 'Popular' },
    { id: 'new', label: 'Newly Released' }
];

export default function Home() {
    const { user } = useAuth();
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mood, setMood] = useState('All');
    const [showMoodMenu, setShowMoodMenu] = useState(false);
    const [searchMode, setSearchMode] = useState('book'); // 'book' or 'movie'
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [agentMessage, setAgentMessage] = useState("");
    const [userProfile, setUserProfile] = useState({ wishlist: [], watched: [], dislikes: [], favorite_genres: [] });
    const [activeTab, setActiveTab] = useState('top');
    const [suggestedQueries, setSuggestedQueries] = useState([]);

    // Personalized Suggestions Logic
    React.useEffect(() => {
        import('../data/suggestions').then(module => {
            const all = module.SUGGESTED_QUERIES;
            let finalSuggestions = [];

            // 1. Try to find semantic matches for user's favorite genres
            if (userProfile.favorite_genres?.length > 0) {
                const genreMatches = all.filter(q => {
                    const qLower = q.toLowerCase();
                    return userProfile.favorite_genres.some(g => qLower.includes(g.toLowerCase()));
                });
                // Shuffle matches
                finalSuggestions = genreMatches.sort(() => 0.5 - Math.random());
            }

            // 2. Fill remainder with random suggestions to reach count (5-11, aim for 8)
            const count = Math.floor(Math.random() * 7) + 5; // 5 to 11
            const remaining = all.filter(q => !finalSuggestions.includes(q)).sort(() => 0.5 - Math.random());

            finalSuggestions = [...finalSuggestions, ...remaining].slice(0, count);
            setSuggestedQueries(finalSuggestions);
        });
    }, [userProfile.favorite_genres]); // Re-run when profile loads

    const [searchParams] = useSearchParams();
    const historyId = searchParams.get('id');

    // Restore history state if ID is present
    React.useEffect(() => {
        if (historyId) {
            setIsLoading(true);
            axios.get(`http://localhost:8000/history/details/${historyId}`)
                .then(res => {
                    const data = res.data;
                    setSearchQuery(data.query_text);
                    setSearchMode(data.media_type === 'movie' ? 'movie' : 'book'); // Mapping might need adjustment if DB stores 'MOVIE'
                    setSearchResults(data.recommendations || []);
                    setAgentMessage(data.agent_message);
                    setHasSearched(true);
                })
                .catch(err => {
                    console.error("Failed to restore history:", err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [historyId]);

    // Fetch user profile on mount or user change to know what's saved
    React.useEffect(() => {
        if (user?.id) {
            import('axios').then(axios => {
                axios.default.get(`http://localhost:8000/profile/${user.id}`)
                    .then(res => {
                        setUserProfile(prev => ({ ...prev, ...res.data }));
                    })
                    .catch(console.error);
            });
        }
    }, [user]);

    const isWishlisted = (title) => userProfile.wishlist?.includes(title);
    const isWatched = (title) => userProfile.watched?.includes(title);
    const isDisliked = (title) => userProfile.dislikes?.includes(title);

    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsLoading(true);
            setHasSearched(true);
            setActiveTab('top'); // Reset to first tab on new search

            try {
                const response = await axios.post('http://localhost:8000/chat', {
                    user_id: user?.id || null, // Optional for guests
                    query_text: searchQuery,
                    tone: mood,
                    media_type: searchMode,
                    model: 'gemini-2.5-flash'
                });

                setSearchResults(response.data.recommendations);
                setAgentMessage(response.data.agent_message);
            } catch (error) {
                console.error("Search failed:", error);
                setAgentMessage("Sorry, I encountered an error while searching.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAction = async (action, item) => {
        if (!user) {
            alert("Please login to save preferences!");
            return;
        }

        // Optimistically update local state
        setUserProfile(prev => {
            const listKey = action === 'WISHLIST' ? 'wishlist' :
                action === 'WATCHED' ? 'watched' : 'dislikes';
            const list = prev[listKey] || [];

            // Toggle logic: If already in list, remove it. Else, add it.
            if (list.includes(item.title)) {
                // Remove from backend
                axios.post('http://localhost:8000/profile/preference/remove', {
                    user_id: user.id,
                    preference_type: action,
                    item_value: item.title,
                    category: searchMode
                }).catch(err => console.error("Remove failed:", err));

                // Remove from local state
                return {
                    ...prev,
                    [listKey]: list.filter(t => t !== item.title)
                };
            }

            // Add to backend
            axios.post('http://localhost:8000/profile/preference', {
                user_id: user.id,
                preference_type: action,
                item_value: item.title,
                category: searchMode
            }).catch(err => console.error("Add failed:", err));

            // Add to local state
            return {
                ...prev,
                [listKey]: [...list, item.title]
            };
        });
    };

    // Helper to get items for current tab
    const getTabItems = () => {
        if (searchResults.length === 0) return [];
        let sorted = [...searchResults];

        switch (activeTab) {
            case 'popular':
                sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                return sorted.slice(0, 15);
            case 'new':
                sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
                return sorted.slice(0, 15);
            case 'top':
            default:
                return sorted.slice(0, 15);
        }
    };

    // Helper to get title for current tab
    const getTabTitle = () => {
        switch (activeTab) {
            case 'popular': return "Highly Rated & Popular";
            case 'new': return "Freshly Released";
            case 'top':
            default: return "Top Semantic Matches";
        }
    };


    return (
        <div className={`min-h-[80vh] flex flex-col ${!hasSearched ? 'justify-center' : 'justify-start space-y-8'} pb-10 transition-all duration-500`}>

            {/* Search Container */}
            <div className={`relative w-full max-w-2xl mx-auto transition-all duration-500 z-50 ${!hasSearched ? 'scale-100' : 'scale-90'}`}>

                {/* Hero Title (Moved from Sidebar) */}
                <div className="flex flex-col items-center mb-8 animate-fade-in-down">
                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
                        <BookOpen size={40} strokeWidth={2.5} />
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                            Recommender
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Discover your next favorite story</p>
                </div>

                {/* Search Mode Toggles (Centered above search bar) */}
                <div className="flex gap-4 mb-6 justify-center">
                    <button
                        onClick={() => setSearchMode('book')}
                        className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${searchMode === 'book'
                            ? 'bg-indigo-600 text-white shadow-xl scale-110'
                            : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        Books
                    </button>
                    <button
                        onClick={() => setSearchMode('movie')}
                        className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${searchMode === 'movie'
                            ? 'bg-indigo-600 text-white shadow-xl scale-110'
                            : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        Movies
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative group z-50">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
                        <Search size={24} className="group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={!hasSearched ? "Ask for a recommendation..." : `Search for ${searchMode}s...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full pl-16 pr-48 py-5 rounded-3xl bg-white dark:bg-gray-800 border-none shadow-2xl focus:ring-4 focus:ring-indigo-500/20 text-xl transition-all outline-none dark:text-white placeholder:text-gray-400"
                    />

                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-3">
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        )}

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        {/* Emotion Selector Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMoodMenu(!showMoodMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                <span>{EMOTIONS.find(e => e.label === mood)?.emoji}</span>
                                <span className="hidden sm:inline">{mood}</span>
                                <ChevronDown size={14} className={`transition-transform ${showMoodMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showMoodMenu && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-fade-in-up">
                                    {EMOTIONS.map((e) => (
                                        <button
                                            key={e.label}
                                            onClick={() => {
                                                setMood(e.label);
                                                setShowMoodMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{e.emoji}</span>
                                                <span className={mood === e.label ? 'text-indigo-600 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                    {e.label}
                                                </span>
                                            </div>
                                            {mood === e.label && <Check size={16} className="text-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Suggested Queries (Only when NO search has been performed) */}
                {!hasSearched && suggestedQueries.length > 0 && (
                    <div className="mt-12 animate-fade-in-up">
                        <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">Suggested Queries</p>
                        <div className="flex flex-wrap justify-center gap-3 px-4">
                            {suggestedQueries.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSearchQuery(q);
                                        setIsLoading(true);
                                        setHasSearched(true);
                                        setActiveTab('top');

                                        axios.post('http://localhost:8000/chat', {
                                            user_id: user?.id || null,
                                            query_text: q,
                                            tone: mood,
                                            media_type: searchMode,
                                            model: 'gemini-2.5-flash'
                                        }).then(res => {
                                            setSearchResults(res.data.recommendations);
                                            setAgentMessage(res.data.agent_message);
                                        })
                                            .catch(err => {
                                                console.error(err);
                                                setAgentMessage("Error fetching suggestions.");
                                            })
                                            .finally(() => setIsLoading(false));
                                    }}
                                    className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-sm text-gray-600 dark:text-gray-300"
                                >
                                    <span className="text-indigo-500 transition-transform group-hover:translate-x-1">→</span>
                                    <span>{q}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Sections (Only visible after search) */}
            {hasSearched && (
                <div className="space-y-8 animate-fade-in-up">
                    {/* Tabs */}
                    {!isLoading && searchResults.length > 0 && (
                        <div className="flex justify-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Thinking...</p>
                        </div>
                    ) : (
                        searchResults.length > 0 && (
                            <HorizontalSection
                                title={getTabTitle()}
                                items={getTabItems().map(i => ({ ...i, image: i.thumbnail_url }))}
                                onItemClick={setSelectedItem}
                                onAction={handleAction}
                                isWishlisted={isWishlisted}
                                isWatched={isWatched}
                                isDisliked={isDisliked}
                            />
                        )
                    )}
                </div>
            )}

            <DetailModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                onAction={handleAction}
                isWishlisted={selectedItem && isWishlisted(selectedItem.title)}
                isWatched={selectedItem && isWatched(selectedItem.title)}
            />
        </div>
    );
}
