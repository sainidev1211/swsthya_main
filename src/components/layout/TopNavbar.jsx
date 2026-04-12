import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, HeartPulse, Check, Clock, CheckCheck } from 'lucide-react';
import logo from '../../assets/logo.jpg';

function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
}

export default function TopNavbar() {
    const { user, logout, isGuest } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { config, loadingConfig } = useConfig();
    const { notifications, unreadCount, markDone, snooze, markAllRead } = useNotifications();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    const activeNotifications = notifications.filter(n => n.status !== 'done');

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 px-6 flex items-center justify-between">
            {/* Logo area - Hidden on mobile */}
            <div className="flex items-center gap-2 md:hidden">
                <img 
                    src={logo} 
                    alt="Platform Logo" 
                    className="w-10 h-10 object-contain rounded-lg" 
                />
                <span className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--dynamic-primary, #0d9488), var(--dynamic-secondary, #0f766e))' }}>
                    {loadingConfig ? '...' : (config?.websiteName || 'Swasthya')}
                </span>
            </div>

            {/* Global Alert Banner */}
            {config?.bannerText && (
                <div className="absolute top-16 left-0 w-full text-white text-xs font-medium py-1.5 px-4 text-center flex justify-center items-center gap-2 z-20 shadow hidden md:flex" style={{ backgroundColor: 'var(--dynamic-secondary, #0f766e)' }}>
                    {config.bannerText}
                </div>
            )}

            <div className="flex-1" />

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">

                {/* Guest Mode Sign In */}
                {(!user || user.isGuest) && (
                    <>
                        <Button size="sm" variant="warning" onClick={() => window.location.href = '/signup'} className="hidden sm:flex bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200 shadow-none text-xs">
                            Sign In / Sign Up
                        </Button>
                        <button onClick={() => window.location.href = '/signup'} className="p-2 rounded-full text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors sm:hidden" title="Sign In / Sign Up">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications && unreadCount > 0) markAllRead();
                            }}
                            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-gray-100 dark:bg-gray-800 text-teal-600' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                        >
                            <Bell className="w-6 h-6" />
                            <AnimatePresence>
                                {unreadCount > 0 && (
                                    <motion.span
                                        key="badge"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-900"
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                                >
                                    {/* Header */}
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                            {unreadCount > 0 ? `${unreadCount} New` : 'All caught up'}
                                        </span>
                                    </div>

                                    {/* Notification List */}
                                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                                        {activeNotifications.length === 0 ? (
                                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                                                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h4 className="text-gray-900 dark:text-white font-medium mb-1">No notifications</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
                                            </div>
                                        ) : (
                                            <AnimatePresence>
                                                {activeNotifications.map((notif) => (
                                                    <motion.div
                                                        key={notif._id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notif.isRead ? 'border-l-4 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${notif.type === 'medicine_reminder' ? 'bg-teal-500' : 'bg-blue-500'}`}>
                                                                {notif.type === 'medicine_reminder' ? '💊' : '📢'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{notif.title}</p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(notif.createdAt)}</p>
                                                                {/* Actions */}
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <button
                                                                        onClick={() => markDone(notif._id)}
                                                                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 transition-colors font-medium"
                                                                    >
                                                                        <Check size={11} /> Done
                                                                    </button>
                                                                    <button
                                                                        onClick={() => snooze(notif._id)}
                                                                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-colors font-medium"
                                                                    >
                                                                        <Clock size={11} /> Snooze 10m
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {activeNotifications.length > 0 && (
                                        <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                                            <button
                                                onClick={() => { notifications.forEach(n => !n.isRead && markDone(n._id)); }}
                                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                            >
                                                <CheckCheck size={14} /> Mark all as done
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                {/* Profile */}
                <div
                    className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer group"
                    onClick={() => navigate('/profile')}
                >
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none group-hover:text-medical-600 transition-colors">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Patient ID: #88219
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-medical-200 to-teal-200 p-0.5 cursor-pointer hover:ring-2 hover:ring-medical-500 transition-all">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`}
                            alt="Profile"
                            className="h-full w-full rounded-full bg-white dark:bg-gray-800"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

