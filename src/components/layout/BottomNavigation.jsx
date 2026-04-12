import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ScanLine, ShieldAlert, MapPin, User, Calendar } from 'lucide-react';

export default function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/scan-medicine', icon: ScanLine, label: 'Scan' },
        { path: '/emergency', icon: ShieldAlert, label: 'Emergency', danger: true },
        { path: '/my-appointments', icon: Calendar, label: 'Queue' },
        { path: '/health-profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative
                            ${active
                                    ? (item.danger ? 'text-red-500' : 'text-medical-600 dark:text-medical-400')
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className={`p-1 rounded-full transition-all duration-300 ${active ? 'bg-medical-50 dark:bg-medical-900/20 transform -translate-y-1' : ''}`}>
                                <Icon className={`w-6 h-6 ${item.danger && active ? 'text-red-500' : ''}`} />
                            </div>
                            <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                            {active && (
                                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${item.danger ? 'bg-red-500' : 'bg-medical-500'}`}></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
