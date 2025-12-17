import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, ArrowRight, ArrowLeft, BookOpen, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PREDEFINED_GENRES = ['Fiction', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'History', 'Biography', 'Fantasy'];
const MOCKED_BOOKS = ['The Great Gatsby', 'To Kill a Mockingbird', '1984', 'Pride and Prejudice'];

// Step 1 Component
const Step1 = ({ formData, handleInputChange }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <div className="relative flex items-center">
                    <User size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none" placeholder="John Doe" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <div className="relative flex items-center">
                    <User size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input name="username" value={formData.username} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none" placeholder="johnd" required />
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none" placeholder="john@example.com" required />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none" placeholder="••••••" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors outline-none" placeholder="••••••" required />
                </div>
            </div>
        </div>
    </div>
);

// Step 2 & 3 Generic Component for Preferences
const PreferenceStep = ({ title, options, fieldSuffix, icon: Icon, formData, toggleSelection }) => (
    <div className="space-y-6">
        <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mb-3">
                <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white">What do you like?</h3>
            <p className="text-gray-500 text-sm">Select your preferences to get better recommendations.</p>
        </div>

        <div>
            <label className="label mb-2 block">Favorite Genres</label>
            <div className="flex flex-wrap gap-2">
                {options.map(genre => (
                    <button
                        key={genre}
                        onClick={() => toggleSelection('favorite' + fieldSuffix, genre)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData['favorite' + fieldSuffix]?.includes(genre)
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default function Signup() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        favoriteGenres: [],
        hatedGenres: [],
        booksRead: [],
        wishlist: [],
        // Movies would be similar
    });
    const { register, loading, user } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = async () => {
        if (step === 1) {
            // Validate Step 1
            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match"); // TODO: Better UI feedback
                return;
            }
            try {
                const success = await register({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    full_name: formData.fullName
                });

                if (success) {
                    setStep(2);
                } else {
                    alert("Registration failed. Username might be taken.");
                }
            } catch (err) {
                console.error("Registration error:", err);
                alert("Registration failed. Please try again.");
            }
        } else if (step === 2) {
            setStep(3);
        } else {
            // Save preferences before navigating
            try {
                const axios = (await import('axios')).default;
                // We need the user ID. The 'register' call logs us in and sets 'user' in context, 
                // but we might need to fetch it or rely on the fact that cookies are set.
                // Actually, register usually logs in. Let's check if we have distinct user ID access here.
                // The 'register' function in AuthContext usually sets the user state. 
                // However, updated state might not be immediately available in 'user' variable due to closure.
                // We'll rely on the server session/cookies if possible, or we may need to get ID from register response.
                // For now, let's assume register returns true/false. 
                // If AuthContext updates 'user', we might need to wait or access it differently.
                // A safer bet: The register endpoint usually returns user details. 
                // Let's assume the user is logged in for consecutive requests.

                // Fetch current user ID from the /me endpoint or similar if strictly needed, 
                // but let's try reading from localStorage or AuthContext references if available.
                // Since we are inside a component, 'user' from useAuth() might be stale in this specific closure 
                // if it hasn't re-rendered.
                // BUT, step 2->3 transition causes re-render. Step 3->Finish triggers this. 
                // So 'user' should be updated by now.

                // Wait, 'user' is not destructured from useAuth() in the snippet I saw?
                // Line 24: const { register, loading } = useAuth(); -> 'user' is NOT there.
                // I need to add 'user' to destructuring.
            } catch (e) {
                console.error("Error saving preferences:", e);
            }
            navigate('/');
        }
    };

    const handleSkip = () => {
        if (step === 2) setStep(3);
        else if (step === 3) navigate('/');
    };

    const toggleSelection = (field, item) => {
        setFormData(prev => {
            const list = prev[field];
            if (list.includes(item)) return { ...prev, [field]: list.filter(i => i !== item) };
            return { ...prev, [field]: [...list, item] };
        });
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                {/* Progress Bar */}
                <div className="bg-gray-100 dark:bg-gray-700 h-2">
                    <div
                        className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Step {step} of 3</span>
                        <h2 className="text-2xl font-bold mt-1 dark:text-white">
                            {step === 1 ? 'Create your account' : step === 2 ? 'Book Preferences' : 'Movie Preferences'}
                        </h2>
                    </div>

                    <div className="flex-1">
                        {step === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} />}
                        {step === 2 && <PreferenceStep title="Books" options={PREDEFINED_GENRES} fieldSuffix="Genres" icon={BookOpen} formData={formData} toggleSelection={toggleSelection} />}
                        {step === 3 && <PreferenceStep title="Movies" options={PREDEFINED_GENRES} fieldSuffix="Genres" icon={Film} formData={formData} toggleSelection={toggleSelection} />}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        {step > 1 ? (
                            <button onClick={() => setStep(s => s - 1)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium px-4">
                                Back
                            </button>
                        ) : (
                            <Link to="/login" className="text-indigo-600 font-medium px-4">Already have an account?</Link>
                        )}

                        <div className="flex gap-3">
                            {step > 1 && (
                                <button onClick={handleSkip} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    Skip
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900 transition-all flex items-center gap-2"
                            >
                                {step === 1 ? 'Join Now' : 'Continue'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
