import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onToggleDrawer, onEmergency }) {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="text-center bg-emerald-600 text-white p-4 rounded-t-none sm:rounded-t-2xl relative flex-shrink-0">
            {/* Left Drawer Toggle */}
            <button
                onClick={onToggleDrawer}
                className="absolute top-3 left-3 p-2 rounded-full bg-emerald-700 hover:bg-emerald-800 transition"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-3 right-12 p-2 rounded-full bg-emerald-700 hover:bg-emerald-800 transition"
            >
                {isDarkMode ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                )}
            </button>

            {/* Emergency Button */}
            <button
                onClick={onEmergency}
                className="absolute top-3 right-3 p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </button>

            <div className="flex items-center justify-center space-x-3 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"></path>
                </svg>
                <h1 className="text-3xl font-extrabold tracking-tight">Swasthya</h1>
            </div>
            <p className="text-emerald-100 text-sm">Professional Health Information & Symptom Recommendations</p>
        </header>
    );
}
