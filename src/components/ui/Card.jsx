import { motion } from 'framer-motion';

export default function Card({ children, className = '', hoverEffect = true, onClick }) {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" } : {}}
            transition={{ type: "spring", stiffness: 300 }}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}
