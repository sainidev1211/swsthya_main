import { useState } from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.jpg';

export default function MobileHeader({ onMenuClick }) {
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 px-4 flex items-center justify-between md:hidden">
            {/* Logo area with Menu Button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg shadow-lg" />
                <span className="text-lg font-bold bg-gradient-to-r from-medical-600 to-teal-500 bg-clip-text text-transparent">
                    Swasthya
                </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-gray-100 dark:bg-gray-800 text-medical-600' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                            >
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                                    <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">0 New</span>
                                </div>
                                <div className="p-6 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        No new notifications
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Icon */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-medical-200 to-teal-200 p-0.5">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`}
                        alt="Profile"
                        className="h-full w-full rounded-full bg-white dark:bg-gray-800"
                    />
                </div>
            </div>
        </header>
    );
}
