import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Search, ShieldCheck, ShieldAlert, Sparkles, Loader2, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../api/config';

export default function SmartSearch() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            // Context-Aware Logic: Analyzing input with user medical history
            const res = await fetch(`${API_BASE_URL}/ai/check-safety`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id || user?._id || user?.uuid,
                    medicine_name: query
                })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Safety Check API Error:", errorText);
                throw new Error(`Analysis failed: ${res.status}`);
            }

            let data;
            try {
                data = await res.json();
            } catch (err) {
                console.error("Safety Check JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }
            if (data.success) {
                setResult(data.data);
            }
        } catch (error) {
            console.error('Safety Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
                <Sparkles className="w-6 h-6 text-teal-500" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Smart Recommendation System</h2>
            </div>

            <Card className="p-8 border-teal-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-premium">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Context-Aware Medicine & Symptom Check</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Our AI analyzes your <span className="text-teal-600 font-bold">entire medical history</span> before giving any recommendation. 
                            Search a medicine or symptom to see if it's safe for you.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            {loading ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" /> : <Search className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />}
                        </div>
                        <input
                            type="text"
                            placeholder="Enter medicine name or symptom (e.g., Ibuprofen, Fever)"
                            className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-teal-500 rounded-2xl text-gray-900 dark:text-white font-medium shadow-sm transition-all text-sm md:text-base"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                        />
                        <div className="absolute right-2 inset-y-2">
                            <Button 
                                type="submit" 
                                disabled={loading || !query.trim()}
                                className="h-full bg-teal-500 hover:bg-teal-600 text-white font-black px-6 rounded-xl shadow-lg shadow-teal-500/20"
                            >
                                Analyze
                            </Button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-8 text-left"
                            >
                                <div className={`p-6 rounded-3xl border-2 flex flex-col md:flex-row gap-6 ${result.safe ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10' : 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10'}`}>
                                    <div className="flex-shrink-0 flex justify-center pt-1">
                                        {result.safe ? (
                                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                                                <ShieldCheck size={40} />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600">
                                                <ShieldAlert size={40} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                                                {result.safe ? 'SAFE TO USE' : 'UNSAFE / RISK DETECTED'}
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${result.risk_level === 'low' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {result.risk_level} Risk
                                                </span>
                                            </h4>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Reasoning & Context</p>
                                                <div className="space-y-2">
                                                    {result.reasons.map((reason, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${result.safe ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                                            {reason}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Suggestions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.recommendations.map((rec, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                            <Info size={12} className="text-teal-500" /> {rec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] text-center text-gray-400 font-medium px-8 italic">
                                    Disclaimer: This is an AI-generated analysis. Always verify with your doctor before taking any medication.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </section>
    );
}
