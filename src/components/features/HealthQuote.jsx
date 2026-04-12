import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const FALLBACK_QUOTES = [
    { content: "Health is a state of body. Wellness is a state of being.", author: "J. Stanford" },
    { content: "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.", author: "Buddha" },
    { content: "The greatest wealth is health.", author: "Virgil" },
    { content: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { content: "A fit body, a calm mind, a house full of love. These things cannot be bought – they must be earned.", author: "Naval Ravikant" },
    { content: "Early to bed and early to rise makes a man healthy, wealthy and wise.", author: "Benjamin Franklin" },
    { content: "An apple a day keeps the doctor away.", author: "Proverb" }
];

export default function HealthQuote() {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchQuote = async () => {
        setLoading(true);
        try {
            // Attempt to fetch from API
            const response = await fetch('https://api.quotable.io/random?tags=health|wisdom');
            if (!response.ok) throw new Error("API Failed");
            const data = await response.json();
            setQuote({ content: data.content, author: data.author });
        } catch (error) {
            // Fallback to local list
            const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            setQuote(random);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuote();
    }, []);

    return (
        <AnimatePresence mode="wait">
            {!loading && quote && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-b border-teal-100 dark:border-gray-700 py-3 px-6 flex items-center justify-center gap-4 text-center relative overflow-hidden"
                >
                    <Quote className="w-4 h-4 text-teal-500 opacity-50 hidden md:block" />
                    <p className="text-sm md:text-base font-medium text-teal-800 dark:text-teal-200 italic max-w-3xl">
                        "{quote.content}"
                        <span className="text-xs text-gray-500 dark:text-gray-400 not-italic ml-2">— {quote.author}</span>
                    </p>
                    <button
                        onClick={fetchQuote}
                        className="p-1 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="New Quote"
                    >
                        <RefreshCw className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    </button>

                    {/* Decorative Glow */}
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-teal-200/20 blur-xl skew-x-12 pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
