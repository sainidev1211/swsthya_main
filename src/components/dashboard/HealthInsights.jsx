import React from 'react';
import Card from '../ui/Card';
import { Brain, TrendingUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function HealthInsights({ analysis }) {
    if (!analysis) return null;

    const { risks = [], summary, healthScore, healthStatus } = analysis;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
                <Brain className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Health Insights</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trends & Summary */}
                <Card className="lg:col-span-2 p-8 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-800 shadow-premium relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 rotate-12">
                        <TrendingUp size={200} className="text-purple-600" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Health Trends & AI Summary</h3>
                                <p className="text-sm text-gray-500 font-medium">Derived from your medical history</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-white/80 dark:bg-gray-900/50 rounded-2xl border border-purple-100 dark:border-gray-700 shadow-sm">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Health Score</p>
                                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{healthScore}%</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{healthStatus}</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 col-span-2 sm:col-span-1">
                                    <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">AI Reliability</p>
                                    <p className="text-2xl font-black text-purple-700 dark:text-purple-300">High</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Risk Alerts */}
                <Card className="p-6 bg-white dark:bg-gray-800 border-rose-100 dark:border-gray-700 shadow-soft">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" size={20} /> Priority Risk Alerts
                    </h3>
                    <div className="space-y-4">
                        {risks.length > 0 ? (
                            risks.map((risk, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{risk.condition}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full 
                                            ${risk.level === 'critical' ? 'bg-rose-100 text-rose-700' : 
                                              risk.level === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {risk.level}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{risk.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2" />
                                <p className="text-sm font-bold text-gray-400">No active risks</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </section>
    );
}
