import React from 'react';
import { Mail, Linkedin, Github, Code, Brain, Database, Heart } from 'lucide-react';

const TEAM_MEMBERS = [
    {
        name: "QADIR BuX",
        email: "bcsf23m059@pucit.edu.pk",
        linkedin: "https://www.linkedin.com/in/qadirbux/",
        role: "Developer",
        id: "BCSF23M059",
        image: "/images/qadir.png"
    },
    {
        name: "MALAK SAIF UR REHMAN",
        email: "bcsf23m057@pucit.edu.pk",
        linkedin: "https://www.linkedin.com/in/qadirbux/",
        role: "Developer",
        id: "BCSF23M057",
        image: "/images/saif.jpg"
    },
    {
        name: "QAMAR ABBAS",
        email: "bcsf23m055@pucit.edu.pk",
        linkedin: "https://www.linkedin.com/in/qadirbux/",
        role: "Developer",
        id: "BCSF23M055",
        image: "/images/qamar.jpg"
    },
    {
        name: "MUSA GULFAM",
        email: "bcsf22m050@pucit.edu.pk",
        linkedin: "https://www.linkedin.com/in/qadirbux/",
        role: "Developer",
        id: "BCSF22M050",
        image: null
    }
];

export default function About() {
    return (
        <div className="max-w-6xl mx-auto space-y-16 animate-fade-in-up pb-20">
            {/* System Introduction */}
            <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    About <span className="text-indigo-600 dark:text-indigo-400">Our System</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Welcome to the <strong>Semantic Recommender System</strong>, an advanced AI-powered platform designed to discover
                    books and movies that match your mood and preferences perfectly.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                            <Brain size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">AI-Powered</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Uses advanced Large Language Models (LLMs) to understand the *meaning* and *semantics* behind your queries, not just keywords.
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                            <Heart size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Personalized</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Learns from your favorites, dislikes, and reading history to tailor recommendations specifically to your taste.
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Extensive Database</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Curated collections of top-rated books and movies, ensuring high-quality suggestions every time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Developer Team Section */}
            <div className="space-y-10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet the Developers</h2>
                    <p className="text-gray-500 dark:text-gray-400">The talented students behind this project from PUCIT.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TEAM_MEMBERS.map((member, idx) => (
                        <div key={idx} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                            {/* Profile Image Placeholder */}
                            <div className="w-24 h-24 mb-4 rounded-full overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-900/30 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-700 transition-all">
                                <img
                                    src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=6366f1&color=fff&size=128`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {member.name}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 text-gray-500 dark:text-gray-400 mb-3 block truncate max-w-full" title={member.email}>
                                {member.email}
                            </span>

                            <div className="flex gap-3 mt-auto">
                                <a
                                    href={`mailto:${member.email}`}
                                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    title="Email"
                                >
                                    <Mail size={18} />
                                </a>
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    title="LinkedIn"
                                >
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
