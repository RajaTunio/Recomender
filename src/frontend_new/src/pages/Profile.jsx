import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, X, Camera, BookOpen, Film, ThumbsDown, Plus, Check } from 'lucide-react';
import axios from 'axios';

const COMMON_GENRES = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
    'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
    'Thriller', 'War', 'Western'
];

const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
            <Icon size={20} />
            <h3 className="font-bold text-lg">{title}</h3>
        </div>
        {children}
    </div>
);

export default function Profile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [addingGenre, setAddingGenre] = useState(null); // 'favorite' or 'dislike' or null
    const [genreInput, setGenreInput] = useState("");
    const [filteredGenres, setFilteredGenres] = useState([]);
    const [profileData, setProfileData] = useState({
        fullName: '',
        username: '',
        email: '',
        profile_image: null,
        favorite_genres: [],
        disliked_genres: [],
        disliked_items: [],
        wishlist: [],
        watched: []
    });

    React.useEffect(() => {
        if (user?.id) {
            // Fetch real profile data
            // 1. Get User Details
            setProfileData(prev => ({
                ...prev,
                fullName: user.full_name || user.name,
                username: user.username,
                email: user.email,
                profile_image: user.profile_image
            }));

            // 2. Get Preferences
            import('axios').then(axios => {
                axios.default.get(`http://localhost:8000/profile/${user.id}`)
                    .then(res => {
                        setProfileData(prev => ({ ...prev, ...res.data }));
                    })
                    .catch(console.error);
            });
        }
    }, [user]);

    const handleRemove = async (type, value) => {
        if (!user) return;
        try {
            const axios = (await import('axios')).default;
            await axios.post('http://localhost:8000/profile/preference/remove', {
                user_id: user.id,
                preference_type: type,
                item_value: value,
                category: 'unknown' // Backend only needs type/value for delete
            });

            // Update local state
            setProfileData(prev => {
                let stateKey = 'wishlist';
                if (type === 'WISHLIST') stateKey = 'wishlist';
                else if (type === 'WATCHED') stateKey = 'watched';
                else if (type === 'FAVORITE') stateKey = 'favorite_genres';
                else if (type === 'DISLIKE') {
                    // Check where it exists
                    if (prev.disliked_genres.includes(value)) stateKey = 'disliked_genres';
                    else stateKey = 'disliked_items';
                }

                return {
                    ...prev,
                    [stateKey]: prev[stateKey].filter(item => item !== value)
                };
            });
        } catch (err) {
            console.error("Failed to remove preference:", err);
        }
    };

    const handleAddGenre = async (type, genre) => {
        if (!user || !genre) return;

        // Prevent duplicates
        if (type === 'FAVORITE' && profileData.favorite_genres.includes(genre)) return;
        if (type === 'DISLIKE' && profileData.disliked_genres.includes(genre)) return;

        try {
            await axios.post('http://localhost:8000/profile/preference', {
                user_id: user.id,
                preference_type: type,
                item_value: genre,
                category: 'genre'
            });

            setProfileData(prev => ({
                ...prev,
                [type === 'FAVORITE' ? 'favorite_genres' : 'disliked_genres']: [
                    ...prev[type === 'FAVORITE' ? 'favorite_genres' : 'disliked_genres'],
                    genre
                ]
            }));

            setAddingGenre(null);
            setGenreInput("");
        } catch (err) {
            console.error("Failed to add genre:", err);
        }
    };

    const startAdding = (type) => {
        setAddingGenre(type);
        setGenreInput("");
        setFilteredGenres(COMMON_GENRES);
    };

    const handleGenreInputChange = (e) => {
        const val = e.target.value;
        setGenreInput(val);
        setFilteredGenres(COMMON_GENRES.filter(g => g.toLowerCase().includes(val.toLowerCase())));
    };



    const handleSave = async () => {
        if (!user) return;
        try {
            await axios.post('http://localhost:8000/update_profile', {
                user_id: user.id,
                full_name: profileData.fullName,
                email: profileData.email,
                profile_image: profileData.profile_image
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to save changes.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, profile_image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Header card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden">
                        {profileData.profile_image ? (
                            <img src={profileData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            profileData.fullName.charAt(0)
                        )}
                    </div>
                    {isEditing && (
                        <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition cursor-pointer">
                            <Camera size={18} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold dark:text-white">{profileData.fullName}</h2>
                    <p className="text-gray-500 dark:text-gray-400">@{profileData.username}</p>

                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Active Member</span>
                    </div>
                </div>

                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${isEditing
                        ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                >
                    {isEditing ? <><Save size={18} /> Save Changes</> : 'Edit Profile'}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Section title="Personal Information" icon={User}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                            <input
                                disabled={!isEditing}
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
                            <input
                                disabled={true}
                                value={profileData.username}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 dark:text-white opacity-60 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                            <input
                                disabled={!isEditing}
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70"
                            />
                        </div>
                    </div>
                </Section>

                <Section title="Preferences" icon={BookOpen}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Favorite Genres</label>
                            <div className="flex flex-wrap gap-2">
                                {profileData.favorite_genres.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                        {tag}
                                        {isEditing && <button onClick={() => handleRemove('FAVORITE', tag)} className="ml-2 hover:text-indigo-800">×</button>}
                                    </span>
                                ))}
                                {isEditing && !addingGenre && (
                                    <button
                                        onClick={() => startAdding('FAVORITE')}
                                        className="px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 text-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                                    >
                                        + Add
                                    </button>
                                )}
                                {addingGenre === 'FAVORITE' && (
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            value={genreInput}
                                            onChange={handleGenreInputChange}
                                            onBlur={() => setTimeout(() => setAddingGenre(null), 200)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddGenre('FAVORITE', genreInput);
                                                if (e.key === 'Escape') setAddingGenre(null);
                                            }}
                                            className="px-3 py-1 rounded-full border border-indigo-500 text-sm w-32 outline-none dark:bg-gray-800 dark:text-white"
                                            placeholder="Type genre..."
                                        />
                                        {genreInput && filteredGenres.length > 0 && (
                                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 max-h-48 overflow-y-auto">
                                                {filteredGenres.map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => handleAddGenre('FAVORITE', g)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Disliked Genres</label>
                            <div className="flex flex-wrap gap-2">
                                {profileData.disliked_genres.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                                        {tag}
                                        {isEditing && <button onClick={() => handleRemove('DISLIKE', tag)} className="ml-2 hover:text-red-800">×</button>}
                                    </span>
                                ))}
                                {isEditing && !addingGenre && (
                                    <button
                                        onClick={() => startAdding('DISLIKE')}
                                        className="mt-2 px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 text-sm hover:border-red-500 hover:text-red-500 transition-colors"
                                    >
                                        + Add
                                    </button>
                                )}
                                {addingGenre === 'DISLIKE' && (
                                    <div className="relative mt-2 inline-block">
                                        <input
                                            autoFocus
                                            value={genreInput}
                                            onChange={handleGenreInputChange}
                                            onBlur={() => setTimeout(() => setAddingGenre(null), 200)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddGenre('DISLIKE', genreInput);
                                                if (e.key === 'Escape') setAddingGenre(null);
                                            }}
                                            className="px-3 py-1 rounded-full border border-red-500 text-sm w-32 outline-none dark:bg-gray-800 dark:text-white"
                                            placeholder="Type genre..."
                                        />
                                        {genreInput && filteredGenres.length > 0 && (
                                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 max-h-48 overflow-y-auto">
                                                {filteredGenres.map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => handleAddGenre('DISLIKE', g)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="Wishlist" icon={Film}>
                    {profileData.wishlist.length > 0 ? (
                        <ul className="space-y-2">
                            {profileData.wishlist.map(item => (
                                <li key={item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg group">
                                    <span className="font-medium dark:text-gray-200">{item}</span>
                                    <button onClick={() => handleRemove('WISHLIST', item)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No items in wishlist yet.</p>
                    )}
                </Section>

                <Section title="Watched Library" icon={Film}>
                    {profileData.watched?.length > 0 ? (
                        <ul className="space-y-2">
                            {profileData.watched.map(item => (
                                <li key={item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg group">
                                    <span className="font-medium dark:text-gray-200">{item}</span>
                                    <button onClick={() => handleRemove('WATCHED', item)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No watched items yet.</p>
                    )}
                </Section>

                <Section title="Disliked Items" icon={ThumbsDown}>
                    {profileData.disliked_items.length > 0 ? (
                        <ul className="space-y-2">
                            {profileData.disliked_items.map(item => (
                                <li key={item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg group">
                                    <span className="font-medium dark:text-gray-200">{item}</span>
                                    <button onClick={() => handleRemove('DISLIKE', item)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No disliked items yet.</p>
                    )}
                </Section>
            </div>
        </div>
    );
}
