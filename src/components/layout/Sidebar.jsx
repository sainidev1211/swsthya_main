import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfig } from '../../contexts/ConfigContext';
import {
    LayoutDashboard,
    ScanLine,
    FileText,
    Upload,
    Activity,
    Heart,
    Gamepad2,
    Settings,
    User,
    MessageSquare,
    MapPin,
    ShieldCheck,
    Pill,
    Sun,
    Moon,
    Calendar
} from 'lucide-react';
import logo from '../../assets/logo.jpg';

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isGuest } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { config, loadingConfig } = useConfig();

    const isActive = (path) => location.pathname === path;

    const handleNavigation = (path) => {
        navigate(path);

        // Reset scroll position
        const mainContent = document.getElementById('mainContentScroll');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }

        onClose();
    };

    const NavItem = ({ path, icon: Icon, label, color = 'text-gray-600 dark:text-gray-300' }) => {
        const active = isActive(path);
        return (
            <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(path)}
                className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group relative
                ${active
                        ? 'bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 font-bold shadow-soft'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                md:justify-center lg:justify-start
                `}
                title={label}
            >
                <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white dark:bg-gray-800 shadow-soft' : 'group-hover:bg-medical-50 dark:group-hover:bg-medical-900/20'} mr-3 md:mr-0 lg:mr-3`}>
                    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-medical-500' : color} group-hover:text-medical-500`} />
                </div>
                <span className="inline md:hidden lg:inline text-sm">{label}</span>
                {active && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-medical-500 block md:hidden lg:block shadow-glow"
                    ></motion.div>
                )}
            </motion.button>
        );
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar Container */}
            <div
                className={`fixed md:relative top-0 left-0 z-[70] md:z-auto 
                h-[100dvh] md:h-screen
                bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-100 dark:border-gray-800 
                transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] 
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                flex flex-col
                w-[280px] md:w-20 lg:w-72
                shadow-2xl md:shadow-none`}
            >
                {/* Header */}
                <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                        <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain rounded-lg drop-shadow-md" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent md:hidden lg:inline" style={{ backgroundImage: 'linear-gradient(to right, var(--dynamic-primary, #0d9488), var(--dynamic-secondary, #0f766e))' }}>
                        {loadingConfig ? '...' : (config?.websiteName || 'Swasthya')}
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Medical Ecosystem</p>
                </div>

                {/* Navigation */}
                <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto no-scrollbar scroll-smooth">
                    <NavItem path="/" icon={LayoutDashboard} label="Dashboard" />

                    <div className="pt-5 pb-2 px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block md:hidden lg:block">Services</div>
                    <div className="hidden md:block lg:hidden h-2"></div>

                    <NavItem path="/scan-medicine" icon={ScanLine} label="Scan Medicine" />
                    <NavItem path="/reports" icon={FileText} label="Scan Prescription" />
                    {config?.features?.deliveryServices !== false && (
                        <NavItem path="/pharmacy" icon={MapPin} label="Pharmacy Locator" />
                    )}
                    {config?.features?.emergencyMode !== false && (
                        <NavItem path="/claims" icon={ShieldCheck} label="Claims Detector" />
                    )}

                    <div className="pt-5 pb-2 px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block md:hidden lg:block">Health</div>
                    <div className="hidden md:block lg:hidden h-2"></div>

                    {config?.features?.aiAssistant !== false && (
                        <NavItem path="/symptoms" icon={Activity} label="Symptom Checker" />
                    )}
                    <NavItem path="/conditions" icon={Heart} label="Allergies & Pain" />
                    <NavItem path="/wellness" icon={Pill} label="Wellness Hub" />
                    {config?.features?.aiAssistant !== false && (
                        <NavItem path="/chat" icon={MessageSquare} label="AI Health Assistant" />
                    )}

                    <div className="pt-5 pb-2 px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block md:hidden lg:block">Personal</div>
                    <div className="hidden md:block lg:hidden h-2"></div>

                    <NavItem path="/my-appointments" icon={Calendar} label="Appointments" />
                    <NavItem path="/prescriptions" icon={Pill} label="Prescriptions" />
                    <NavItem
                        path="/health-profile"
                        icon={Heart}
                        label="Health Profile"
                        color={isGuest ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'}
                    />
                    <NavItem path="/settings" icon={Settings} label="Settings" />

                    {/* Mobile Only: Sign Up / Sign In */}
                    {(!user || user.isGuest) && (
                        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full flex items-center p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                <User className="w-5 h-5 mr-3" />
                                Sign Up / Log In
                            </button>
                        </div>
                    )}
                </nav>

                {/* Footer User Profile & Controls */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-black/20 shrink-0 pb-safe-offset">
                    <div className="flex flex-col gap-3">
                        {/* User Info Row Removed per user request */}

                        {/* Mobile Actions Row (Theme & Logout) */}
                        <div className="flex items-center gap-2 md:hidden">
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 flex items-center justify-between px-3 h-11">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme</span>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Theme"
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
