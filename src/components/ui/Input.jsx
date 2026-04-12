import { motion } from 'framer-motion';

export default function Input({
    label,
    id,
    type = 'text',
    className = '',
    icon,
    error,
    ...props
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    className={`
                        block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
                        text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                        transition-all duration-200 ease-in-out shadow-sm
                        ${icon ? 'pl-10' : 'pl-4'} p-3
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
