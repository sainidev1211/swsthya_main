import { useState } from 'react';
import { Search, ChevronRight, Activity, Thermometer, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

const CONDITIONS = [
    { title: "Migraine", category: "Neurology", icon: Activity, desc: "Severe recurring headache, usually on one side." },
    { title: "Seasonal Allergy", category: "Immunology", icon: Wind, desc: "Immune response to pollen or mold." },
    { title: "Common Cold", category: "Viral", icon: Thermometer, desc: "Viral infection of nose and throat." },
    { title: "Arthritis", category: "Orthopedics", icon: Activity, desc: "Inflammation of one or more joints." },
];

export default function Conditions() {
    const [search, setSearch] = useState('');

    const filtered = CONDITIONS.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Conditions & Allergies</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Browse common medical conditions and understand their triggers.
                </p>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search connection (e.g. Migraine)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mb-2 block">{item.category}</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
