import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, AlertTriangle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useMedical } from '../../contexts/MedicalContext';
import { useAuth } from '../../contexts/AuthContext';
import { evaluateMedicalSafety } from '../../services/aiService';

export default function PersonalSafetyBadge({ productName, type = 'product', initialSafetyInfo = null }) {
    const { user } = useAuth();
    const { records, loading: recordsLoading } = useMedical();
    const [safetyInfo, setSafetyInfo] = useState(initialSafetyInfo);
    const [evaluating, setEvaluating] = useState(false);

    // Follow-up interaction state
    const [answer, setAnswer] = useState('');
    const [additionalAnswers, setAdditionalAnswers] = useState({});

    useEffect(() => {
        if (initialSafetyInfo) {
            setSafetyInfo(initialSafetyInfo);
        }
    }, [initialSafetyInfo]);

    useEffect(() => {
        if (initialSafetyInfo) return; // Skip if provided externally
        if (!recordsLoading && productName) {
            runEvaluation();
        }
    }, [productName, recordsLoading, records, initialSafetyInfo]);

    const runEvaluation = async (currentAnswers = {}) => {
        setEvaluating(true);
        try {
            const result = await evaluateMedicalSafety(productName, records, currentAnswers, user);
            setSafetyInfo(result);
        } catch (error) {
            console.error('Safety evaluation failed:', error);
            // Graceful fallback
            setSafetyInfo({ status: 'UNKNOWN', reason: 'Unable to verify safety right now.' });
        } finally {
            setEvaluating(false);
        }
    };

    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        const newAnswers = { ...additionalAnswers, [safetyInfo.followUpQuestion]: answer };
        setAdditionalAnswers(newAnswers);
        setAnswer('');
        runEvaluation(newAnswers);
    };

    if (recordsLoading) return null;

    if (evaluating) {
        return (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse w-full">
                <Loader2 className="w-5 h-5 text-medical-500 animate-spin" />
                <span className="text-sm font-medium text-gray-500">Evaluating safety for your profile...</span>
            </div>
        );
    }

    if (!safetyInfo) return null;

    const colors = {
        SAFE: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
        CAUTION: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
        DANGEROUS: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300',
        UNKNOWN: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
    };

    const icons = {
        SAFE: <CheckCircle className="w-6 h-6 text-emerald-500" />,
        CAUTION: <AlertTriangle className="w-6 h-6 text-amber-500" />,
        DANGEROUS: <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />,
        UNKNOWN: <Shield className="w-6 h-6 text-gray-400" />
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={safetyInfo.status + (safetyInfo.needsMoreInfo ? '-more' : '')}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`p-4 rounded-2xl border ${colors[safetyInfo.status] || colors.UNKNOWN} shadow-sm w-full transition-colors`}
            >
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-start gap-3 w-full">
                        <div className="mt-0.5 shrink-0">
                            {icons[safetyInfo.status] || icons.UNKNOWN}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-bold uppercase tracking-wider text-sm">
                                    {safetyInfo.status === 'SAFE' ? 'SAFE' : safetyInfo.status} FOR YOU
                                </span>
                                {safetyInfo.doctorAdvised && (
                                    <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                        DOCTOR CONSULT ADVISED
                                    </span>
                                )}
                            </div>

                            <p className="text-sm font-medium opacity-90 leading-relaxed mb-3">
                                {safetyInfo.status === 'SAFE' && !safetyInfo.reasoning ? "No conflicts were detected with your uploaded medical history." : null}
                                {safetyInfo.reasoning || safetyInfo.reason}
                            </p>

                            {/* Risk Sources */}
                            {safetyInfo.risk_source && safetyInfo.risk_source.length > 0 && safetyInfo.status !== 'SAFE' && (
                                <div className="mt-3 p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 opacity-80">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Evidence Source
                                    </h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 opacity-90">
                                        {safetyInfo.risk_source.map((source, idx) => (
                                            <li key={idx} className="font-medium">{source}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Future Risk Prediction */}
                            {safetyInfo.future_risk_prediction && safetyInfo.future_risk_prediction.insight && (
                                <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-indigo-900 dark:text-indigo-200">
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                                        <Shield className="w-3.5 h-3.5" /> Future Risk Insight
                                    </h4>
                                    <p className="text-sm font-medium leading-relaxed mb-1">{safetyInfo.future_risk_prediction.insight}</p>
                                    {safetyInfo.future_risk_prediction.suggested_action && (
                                        <p className="text-xs font-bold opacity-80 mt-1.5">Action: {safetyInfo.future_risk_prediction.suggested_action}</p>
                                    )}
                                </div>
                            )}

                            {safetyInfo.alternative && (
                                <div className="mt-3 text-xs font-bold pt-3 border-t border-black/10 dark:border-white/10">
                                    Safer Alternative: <span className="opacity-80 font-medium">{safetyInfo.alternative}</span>
                                </div>
                            )}

                            {safetyInfo.needsMoreInfo && safetyInfo.followUpQuestion && (
                                <form onSubmit={handleAnswerSubmit} className="mt-4 relative">
                                    <label className="block text-xs font-bold mb-1.5 opacity-80">
                                        AI Assist: {safetyInfo.followUpQuestion}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="Type your answer..."
                                            className="flex-1 bg-white/50 dark:bg-black/20 border-none rounded-xl text-sm px-4 py-2 placeholder-current/40 focus:ring-2 focus:ring-current/20 outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!answer.trim()}
                                            className="bg-current/10 hover:bg-current/20 p-2.5 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                    {/* Legal Disclaimer */}
                    <div className="text-[10px] sm:text-xs opacity-60 text-center font-medium mt-1 pt-3 border-t border-black/5 dark:border-white/5 mx-2">
                        This analysis is generated by AI using the medical records you uploaded. It should not replace professional medical advice.
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
