import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, PlusCircle, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/hospitals', icon: LayoutGrid, label: 'Services' },
        { path: '/emergency', icon: PlusCircle, label: 'SOS', isFab: true },
        { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-float border border-white/20 z-50 h-16 px-6 flex items-center justify-between">
            {navItems.map((item) => {
                const active = isActive(item.path);

                if (item.isFab) {
                    return (
                        <motion.button
                            key={item.path}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(item.path)}
                            className="relative -top-6 w-14 h-14 bg-red-500 rounded-full shadow-lg shadow-red-500/40 flex items-center justify-center text-white border-4 border-gray-50 dark:border-gray-900"
                        >
                            <item.icon className="w-6 h-6" />
                        </motion.button>
                    );
                }

                return (
                    <motion.button
                        key={item.path}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${active ? 'text-medical-600 dark:text-medical-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        <item.icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
                        {active && (
                            <motion.div
                                layoutId="bottom-nav-indicator"
                                className="w-1 h-1 bg-medical-600 rounded-full mt-1"
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
