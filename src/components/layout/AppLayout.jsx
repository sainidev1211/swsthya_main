import { useState } from 'react';
import { motion } from 'framer-motion';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import { Outlet } from 'react-router-dom';
import ReportButton from '../common/ReportButton';

export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 h-screen w-full flex justify-center overflow-hidden bg-cover bg-center">

            {/* Main Application Frame - Fixed at 1440px for consistency or Full Width on Mobile */}
            <div className="w-full lg:max-w-[1600px] h-full flex flex-col md:flex-row relative bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">

                {/* Mobile Header (Hidden on Desktop/Tablet) */}
                <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Sidebar (Hidden on Mobile unless toggled) */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <div className="flex flex-col flex-1 h-full overflow-hidden relative">
                    {/* Top Navbar (Hidden on Mobile) */}
                    <div className="hidden md:block">
                        <TopNavbar />
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth bg-gray-100/30 dark:bg-gray-900 pb-20 md:pb-6 relative" id="mainContentScroll">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Navigation (Hidden on Desktop/Tablet) */}
                <BottomNavigation />
                <ReportButton />
            </div>
        </div>
    );
}
