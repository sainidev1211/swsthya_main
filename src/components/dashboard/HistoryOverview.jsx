import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Calendar, Pill, Activity, FileText, ChevronRight } from 'lucide-react';

export default function HistoryOverview({ analysis, records }) {
    if (!analysis && (!records || records.length === 0)) return null;

    const timeline = analysis?.timeline || [];
    
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Medical History Overview</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline View */}
                <Card className="p-6 bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700 shadow-soft">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="text-indigo-500" size={20} /> Disease & Treatment Timeline
                    </h3>
                    
                    {timeline.length > 0 ? (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                            {timeline.map((event, idx) => (
                                <div key={idx} className="relative flex items-start gap-6 group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl border-4 border-white dark:border-gray-800 bg-indigo-500 text-white shadow-lg z-10 shrink-0 group-hover:scale-110 transition-transform">
                                        <Activity size={18} />
                                    </div>
                                    <div className="flex-1 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{event.dateAdded || 'Past Entry'}</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${event.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">{event.disease}</h4>
                                        {event.medicinesTaken && event.medicinesTaken !== 'None' && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-gray-800 w-fit">
                                                <Pill size={14} className="text-indigo-400" />
                                                {event.medicinesTaken}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No timeline events found.</p>
                        </div>
                    )}
                </Card>

                {/* Summary Cards */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border-indigo-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                            <Pill className="text-indigo-500" size={20} /> Medication Summary
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {timeline.filter(e => e.medicinesTaken && e.medicinesTaken !== 'None').map((event, idx) => (
                                <div key={idx} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 text-sm font-bold text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {event.medicinesTaken}
                                </div>
                            ))}
                            {timeline.filter(e => e.medicinesTaken && e.medicinesTaken !== 'None').length === 0 && (
                                <p className="text-sm text-gray-500 font-medium">No active medications identified.</p>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-gray-800 border-emerald-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="text-emerald-500" size={20} /> Reports Summary
                            </h3>
                            <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase">{records.length} Total</span>
                        </div>
                        <div className="space-y-3">
                            {records.slice(0, 4).map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <FileText size={14} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{record.file_name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{new Date(record.uploaded_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-400" />
                                </div>
                            ))}
                            {records.length === 0 && (
                                <p className="text-sm text-gray-500 font-medium text-center py-4">No reports uploaded yet.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
