import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../api/config';

export default function HealthIntelligenceWidget() {
    const { user, isGuest } = useAuth();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && !isGuest) {
            fetchLatestAnalysis();
        } else {
            setLoading(false);
        }
    }, [user, isGuest]);

    const fetchLatestAnalysis = async () => {
        try {
            const API_URL = API_BASE_URL;
            const response = await fetch(`${API_URL}/medical-records/analysis/latest?userId=${user.id || user._id}`, {
                headers: { 'x-user-id': user.id || user._id }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Health Intelligence API Error:", errorText);
                throw new Error(`Fetch failed: ${response.status}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error("Health Intelligence JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }
            if (response.ok && data) {
                setAnalysis(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isGuest || !user) return null;

    return (
        <Card className="p-6 md:p-8 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-gray-900 shadow-premium overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={120} className="text-indigo-500" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Health Intelligence</h3>
                    </div>

                    {!analysis ? (
                        <div className="space-y-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-md">
                                Your clinical history hasn't been analyzed yet. Unlock personalized insights and health risks.
                            </p>
                            <Button
                                onClick={() => navigate('/health-profile')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-soft"
                            >
                                Generate AI Report
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold line-clamp-2 leading-relaxed">
                                "{analysis.summary}"
                            </p>
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${analysis.doctorRecommendation.urgency > 7 ? 'bg-rose-100 text-rose-700' :
                                        analysis.doctorRecommendation.urgency > 3 ? 'bg-amber-100 text-amber-700' :
                                            'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    <Activity size={12} /> {analysis.doctorRecommendation.status}
                                </div>
                                <div className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                    <ShieldAlert size={12} /> {analysis.risks.length} Risks Identified
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {analysis && (
                    <Button
                        onClick={() => navigate('/health-profile')}
                        variant="ghost"
                        className="text-indigo-600 font-bold flex items-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-xl"
                    >
                        View Full Report <ChevronRight size={18} />
                    </Button>
                )}
            </div>
        </Card>
    );
}
