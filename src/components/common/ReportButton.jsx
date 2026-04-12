import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/config';

export default function ReportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [issue, setIssue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!issue.trim()) {
            toast.error('Please describe the issue');
            return;
        }

        setIsSubmitting(true);
        try {
            // Submitting to the complaints endpoint
            const response = await fetch(`${API_BASE_URL}/admin/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: 'Web User', // In real app, get from AuthContext
                    subject: 'User Bug Report',
                    priority: 'High',
                    description: issue,
                    path: window.location.pathname
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Report API Error:", errorText);
                throw new Error(`Submission failed: ${response.status}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error("Report JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }

            if (!response.ok) throw new Error('Submission failed');

            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setIssue('');
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            toast.error('Could not send report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Very small, discreet floating button - hidden on mobile/tablet, visible on desktop */}
            <div className="hidden lg:block fixed bottom-4 right-4 z-[9999] opacity-50 hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm font-medium"
                >
                    <AlertCircle size={12} className="text-gray-400" />
                    <span>Report Issue</span>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                        >
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-rose-500" />
                                    Report a Problem
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {isSuccess ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={32} className="text-emerald-600" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Report Received</h4>
                                        <p className="text-sm text-gray-500 mt-1 italic">"Our team will investigate this immediately."</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <p className="text-xs text-gray-500">
                                            Found a glitch or something not working? Let us know the details below.
                                        </p>
                                        <textarea
                                            value={issue}
                                            onChange={(e) => setIssue(e.target.value)}
                                            placeholder="Example: The AI chat button disappeared after I logged in..."
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm min-h-[120px] resize-none"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSubmitting ? 'Sending...' : <><Send size={16} /> Submit Report</>}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
