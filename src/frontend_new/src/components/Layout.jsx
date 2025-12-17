import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Home, User, BookOpen, LogOut, Menu, X, SquarePen, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, Clock, Film, Book } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
    >
        <Icon size={20} className={`${active ? 'text-white' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
        <span className="font-medium">{label}</span>
    </Link>
);

export default function Layout({ isDarkMode, toggleTheme }) {
    const [history, setHistory] = useState([]);
    // Initialize based on screen width
    const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
    const location = useLocation();
    const { user, logout } = useAuth();

    // Handle resize events to auto-close/open sidebar
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch history
    React.useEffect(() => {
        if (user?.id) {
            axios.get(`http://localhost:8000/history/${user.id}`)
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setHistory(res.data);
                    } else {
                        console.error("History API returned non-array:", res.data);
                        setHistory([]);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch history:", err);
                    setHistory([]);
                });
        }
    }, [user, location]); // Re-fetch on nav changes (e.g. after search)

    const navItems = [
        { icon: SquarePen, label: 'New Chat', to: '/' },
        { icon: User, label: 'Profile', to: '/profile' },
        { icon: Info, label: 'About Us', to: '/about' },
    ];

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
            <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full min-h-screen flex transition-colors duration-300">

                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? '280px' : '0px', opacity: isSidebarOpen ? 1 : 0 }}
                    className="fixed md:relative z-[100] h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0"
                >
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-10 px-2 text-indigo-600 dark:text-indigo-400 opacity-0 pointer-events-none h-0 overflow-hidden">
                            {/* Hidden as moved to Home */}
                        </div>

                        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                            {/* Main Nav */}
                            {navItems.map((item) => (
                                <SidebarItem
                                    key={item.to}
                                    {...item}
                                    active={location.pathname === item.to}
                                />
                            ))}

                            {/* Chat History Section */}
                            {history.length > 0 && (
                                <div className="pt-6">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                                        Recent Chats
                                    </h3>
                                    <div className="space-y-1">
                                        {history.map((chat) => (
                                            <Link
                                                key={chat.id}
                                                to={`/?id=${chat.id}`}
                                                className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer truncate transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {chat.mode === 'movie' ? (
                                                        <Film size={14} className="flex-shrink-0 text-indigo-500" />
                                                    ) : chat.mode === 'book' ? (
                                                        <Book size={14} className="flex-shrink-0 text-emerald-500" />
                                                    ) : (
                                                        <MessageSquare size={14} className="flex-shrink-0" />
                                                    )}
                                                    <span className="truncate">{chat.query}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </nav>

                        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>

                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Mobile Header */}
                    <header className="md:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <BookOpen size={28} />
                            <span className="font-bold text-lg">Recommender</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-600 dark:text-gray-400"
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>

                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-[90]"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
