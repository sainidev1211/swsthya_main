import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function LoadingScreen({ message = "Tuning into your health..." }) {
    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white dark:bg-gray-950 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: 1
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative"
            >
                {/* Glow behind the heart */}
                <div className="absolute inset-0 bg-medical-500/30 blur-3xl rounded-full scale-150 animate-pulse"></div>

                <div className="relative w-24 h-24 bg-white dark:bg-gray-900 rounded-[2rem] shadow-premium border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-medical-500 fill-medical-500" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
            >
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    Swasthya
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-1.5 h-1.5 rounded-full bg-medical-500"
                    />
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest leading-none">
                        {message}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
