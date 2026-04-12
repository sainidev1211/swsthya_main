import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Calendar, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMedical } from '../../contexts/MedicalContext';
import { analyzeDoctorVisitNecessity } from '../../services/aiService';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function DoctorRecommendation() {
    const { records, loading: recordsLoading } = useMedical();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [evaluating, setEvaluating] = useState(false);

    useEffect(() => {
        if (!recordsLoading) {
            evaluateVisit();
        }
    }, [recordsLoading, records]);

    const evaluateVisit = async () => {
        // Run AI evaluation of current records
        setEvaluating(true);
        try {
            const result = await analyzeDoctorVisitNecessity(records);
            setRecommendation(result);
        } catch (error) {
            console.error('Failed to run doctor recommendation AI:', error);
            // Fallback gracefully
            setRecommendation({
                recommendation: "Routine Checkup",
                urgency: "low",
                reason: "Keep your profile updated to get personalized visit alerts.",
                specialist: "General Physician",
                timeframe: "Yearly"
            });
        } finally {
            setEvaluating(false);
        }
    };

    if (recordsLoading) {
        return (
            <Card className="p-6 border-indigo-100 bg-white dark:bg-gray-800 dark:border-gray-700 animate-pulse flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-500">Analyzing medical profile for doctor visit necessity...</p>
            </Card>
        );
    }

    if (!recommendation) return null;

    const styling = {
        high: 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border-rose-200 dark:border-rose-800',
        medium: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800',
        low: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800'
    };

    const iconColors = {
        high: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50',
        medium: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
        low: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50'
    };

    return (
        <Card className={`p-6 border-2 shadow-sm transition-all ${styling[recommendation.urgency]}`}>
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Stethoscope size={22} className="text-indigo-600 dark:text-indigo-400" />
                    Visit Dashboard
                </h3>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 ${iconColors[recommendation.urgency]}`}>
                    {recommendation.urgency === 'high' ? <AlertCircle size={14} /> : recommendation.urgency === 'medium' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    {recommendation.recommendation}
                </span>
            </div>

            <div className="space-y-5">
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl space-y-3 shadow-inner">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic border-l-2 border-indigo-300 dark:border-indigo-600 pl-3">
                        "{recommendation.reason}"
                    </p>
                    <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 uppercase flex items-center gap-1"><Calendar size={14} /> Timeframe:</span>
                        <span className="text-gray-900 dark:text-white">{recommendation.timeframe}</span>
                    </div>
                </div>

                <div className="flex gap-4 items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Recommended Specialist</p>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{recommendation.specialist}</p>
                    </div>
                    <Button
                        onClick={() => navigate('/doctors', { state: { specialist: recommendation.specialist } })}
                        className={`shadow-lg px-5 py-2 group ${recommendation.urgency === 'high' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 text-white' :
                            recommendation.urgency === 'medium' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30 text-white' :
                                'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 text-white'}`}
                    >
                        Book <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {evaluating && (
                    <div className="text-xs text-center font-bold text-gray-400 mt-2 flex items-center justify-center gap-1 opacity-50">
                        <Loader2 size={12} className="animate-spin" /> Recalculating via AI Engine...
                    </div>
                )}
            </div>
        </Card>
    );
}
