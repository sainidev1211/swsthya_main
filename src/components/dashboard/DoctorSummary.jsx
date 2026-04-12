import React from 'react';
import Card from '../ui/Card';
import { User, Activity, AlertCircle, FileText, ClipboardList, ShieldAlert } from 'lucide-react';

export default function DoctorSummary({ analysis, user }) {
    if (!analysis) return null;

    const { risks = [], timeline = [], summary } = analysis;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Doctor-Friendly View</h2>
            </div>

            <Card className="p-0 border-indigo-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-premium overflow-hidden">
                <div className="bg-indigo-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl text-white">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">{user?.name || 'Patient Summary'}</h3>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Medical Record ID: #88219</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: History & Alerts */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mb-4 flex items-center gap-2">
                                <ShieldAlert size={14} /> Critical Alerts & Risks
                            </h4>
                            <div className="space-y-3">
                                {risks.map((risk, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                        <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-sm font-black text-rose-900 dark:text-rose-200">{risk.condition}</p>
                                            <p className="text-xs text-rose-700 dark:text-rose-400 font-medium leading-tight">{risk.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {risks.length === 0 && <p className="text-sm text-gray-500 italic">No priority alerts identified.</p>}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mb-4 flex items-center gap-2">
                                <Activity size={14} /> Active Conditions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {timeline.filter(e => e.status === 'Active').map((e, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-black text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                                        {e.disease}
                                    </span>
                                ))}
                                {timeline.filter(e => e.status === 'Active').length === 0 && <p className="text-sm text-gray-500 italic">No active conditions reported.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right: Executive Summary & Full Archive */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mb-4 flex items-center gap-2">
                                <FileText size={14} /> Clinical Executive Summary
                            </h4>
                            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    {summary}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl">
                                        <ClipboardList size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Full Medical Timeline</span>
                                </div>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{timeline.length} Entries</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Uploaded Reports Archive</span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Detailed PDF Access</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Swasthya Clinical Intelligence Engine - Confidential</p>
                </div>
            </Card>
        </section>
    );
}
