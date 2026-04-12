import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star, MessageSquare, Send, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api/config';

export default function Feedback() {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth(); // Assuming useAuth is available via context

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim() && rating === 0) {
            toast.error("Please provide a rating or feedback.");
            return;
        }

        setSubmitted(true); // Show loading/submitting state if needed, or success immediately as per UI design

        try {
            const payload = {
                userId: user?.id || 'u_web_user',
                userEmail: user?.email || 'user@example.com',
                rating: rating || 1, // Ensure at least 1 star if text is provided
                comment: feedback
            };

            console.log("[Feedback] Submitting:", payload);

            const response = await fetch(`${API_BASE_URL}/admin/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Feedback API Error Detail:", errorText);
                throw new Error(`Submission failed: ${response.status}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error("Feedback JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }

            toast.success("Thank you for your feedback!");

            setTimeout(() => {
                setFeedback('');
                setRating(0);
                setSubmitted(false);
            }, 3000);
        } catch (error) {
            setSubmitted(false);
            toast.error("Could not send feedback. Please try again.");
        }
    };



    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-8 pb-24">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings & Feedback</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your preferences and help us improve.</p>
            </div>

            {/* Preferences Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">App Preferences</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDark ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isDark ? <span className="text-lg">🌙</span> : <span className="text-lg">☀️</span>}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">App Theme</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isDark} onChange={toggleTheme} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                            <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                        <p className="text-gray-500 dark:text-gray-400">Your feedback has been received.</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="flex justify-center space-x-2 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-2 transition-all duration-200 transform hover:scale-110 focus:outline-none`}
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="relative mb-6">
                            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tell us what you like or what we can improve..."
                                className="w-full pl-12 p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[160px] resize-none transition-all"
                            ></textarea>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!rating && !feedback.trim()}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" /> Submit Feedback
                        </button>
                    </>
                )}
            </motion.div>

            {/* Logout Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-red-100 dark:border-red-900/30"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Actions</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your session</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Signup/Login for Guests */}
                        <button
                            onClick={() => window.location.href = '/signup'}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-bold shadow-lg shadow-emerald-500/20"
                        >
                            <LogOut className="w-5 h-5 rotate-180" /> Sign Up / Log In
                        </button>

                        <button
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors font-medium"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
