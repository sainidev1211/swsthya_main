import { motion } from 'framer-motion';
import { useState } from 'react';

export default function FlipCard({ frontContent, backContent, className = "" }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className={`cursor-pointer group ${className}`}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            style={{ perspective: "1000px" }}
        >
            <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front Side */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {frontContent}
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-lg bg-gradient-to-br from-emerald-900 to-emerald-950 text-white flex items-center justify-center border border-emerald-800 overflow-hidden"
                    style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden"
                    }}
                >
                    {backContent}
                </div>
            </motion.div>
        </div>
    );
}
