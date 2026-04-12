import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { User, Globe, Linkedin, Info, ShieldAlert, Sparkles } from 'lucide-react';

export default function RightPanel() {
    const location = useLocation();
    const [contextInfo, setContextInfo] = useState(null);

    // Dynamic Content based on generic route matching
    useEffect(() => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') {
            setContextInfo({
                title: "Dashboard Tips",
                icon: <Sparkles className="w-5 h-5 text-amber-500" />,
                content: "Access your quick actions here. Use the 'Medical Search' to find drug info instantly."
            });
        } else if (path.includes('scan') || path.includes('reports')) {
            setContextInfo({
                title: "Privacy Notice",
                icon: <ShieldAlert className="w-5 h-5 text-emerald-500" />,
                content: "Uploaded reports are processed locally in your browser for privacy. No data leaves your device."
            });
        } else if (path.includes('pharmacy')) {
            setContextInfo({
                title: "Delivery Info",
                icon: <Info className="w-5 h-5 text-blue-500" />,
                content: "We compare prices from Tata 1mg, Apollo, and Netmeds to get you the best deal."
            });
        } else if (path.includes('claims')) {
            setContextInfo({
                title: "Fraud Detection",
                icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
                content: "Our AI scans for billing anomalies and potential policy violations in real-time."
            });
        } else {
            setContextInfo({
                title: "Did you know?",
                icon: <Info className="w-5 h-5 text-indigo-500" />,
                content: "You can enable 'Emergency Mode' from the sidebar to quickly alert contacts."
            });
        }
    }, [location]);

    return (
        <div className="hidden lg:flex flex-col w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm overflow-y-auto">

            {/* Dynamic Context Card */}
            {contextInfo && (
                <div className="mb-8 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        {contextInfo.icon}
                        <h3 className="font-bold text-gray-900 dark:text-white">{contextInfo.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {contextInfo.content}
                    </p>
                </div>
            )}

            {/* Admin / Developer Credit Card - Expands on Hover */}
            <div className="mt-auto">
                <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                    initial={false}
                    whileHover={{ scale: 1.02 }}
                >
                    {/* Collapsed State (Default View) */}
                    <div className="p-4 flex items-center gap-3 border-b border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            DS
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Admin / Developer</p>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Dev Saini</h4>
                        </div>
                    </div>

                    {/* Expanded Details (Reveals on Hover) */}
                    <motion.div
                        className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 ease-in-out"
                    >
                        <div className="p-4 pt-0 space-y-3">
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
                                "Building accessible healthcare tech."
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="#"
                                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    <Globe className="w-3 h-3" /> Portfolio
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300 transition-colors"
                                >
                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
