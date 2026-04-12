import { motion } from 'framer-motion';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    type = 'button'
}) {
    const variants = {
        primary: 'bg-gradient-to-r from-medical-500 to-medical-600 text-white shadow-lg shadow-medical-500/30 hover:shadow-medical-500/50',
        secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
        outline: 'border-2 border-medical-500 text-medical-600 hover:bg-medical-50 dark:hover:bg-gray-800',
        ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
                ${variants[variant]} 
                ${sizes[size]} 
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                ${className}
            `}
        >
            {children}
        </motion.button>
    );
}
