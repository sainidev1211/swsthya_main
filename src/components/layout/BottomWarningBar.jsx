import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, User, Linkedin, Globe } from 'lucide-react';
import Button from '../ui/Button';

export default function BottomWarningBar() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center perspective-1000"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            initial={false}
            animate={{ height: isExpanded ? 'auto' : '48px' }}
        >
            <motion.div
                className={`
                    w-full md:max-w-3xl mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.1)] 
                    backdrop-blur-xl border-t border-x border-gray-200 dark:border-gray-700 
                    rounded-t-2xl overflow-hidden relative cursor-pointer
                    ${isExpanded ? 'bg-white dark:bg-gray-800' : 'bg-amber-500/90 dark:bg-amber-600/90'}
                `}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Default State: Warning Line */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-2 text-white font-medium text-sm px-4"
                    animate={{
                        opacity: isExpanded ? 0 : 1,
                        y: isExpanded ? 20 : 0
                    }}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>AI may make mistakes. Always consult doctors.</span>
                </motion.div>

                {/* Expanded State: Admin Credit */}
                <motion.div
                    className="p-6 flex flex-col items-center justify-center text-center gap-4"
                    animate={{
                        opacity: isExpanded ? 1 : 0,
                        y: isExpanded ? 0 : 20
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 dark:text-white">Dev Saini</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Full Stack Developer</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <a href="https://portfolio.devsaini.com" target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Portfolio
                            </Button>
                        </a>
                        <a href="https://linkedin.com/in/devsaini" target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-[#0077b5] hover:bg-[#006396] text-white border-transparent flex items-center gap-2">
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </Button>
                        </a>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">
                        Admin / Developer Access
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
