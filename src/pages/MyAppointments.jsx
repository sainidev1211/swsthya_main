import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, Star, MessageSquare, ChevronRight, CheckCircle2, XCircle, MoreVertical, StarHalf, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function MyAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApt, setSelectedApt] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    const fetchAppointments = async () => {
        try {
            const userId = user?._id || user?.id;
            const res = await fetch(`${API_BASE_URL}/appointments/user/${userId}`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (err) {
            toast.error("Failed to load appointments history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAppointments();
    }, [user]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/reviews/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: user?._id || user?.id,
                    doctorId: selectedApt.doctorId._id,
                    appointmentId: selectedApt._id,
                    ...reviewForm
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Feedback submitted! Thank you.");
                setShowReviewModal(false);
                fetchAppointments();
            }
        } catch (err) {
            toast.error("Failed to submit review");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-slide-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-blue-500 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em]">Clinical Queue</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Sync Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic leading-none">Consultation History</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your clinical sessions and digital healthcare journey.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center shadow-soft">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                        <span className="text-xl font-black text-gray-900">{appointments.length}</span>
                    </div>
                    <div className="px-6 py-3 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex flex-col items-center shadow-soft">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ready</span>
                        <span className="text-xl font-black text-emerald-900">{appointments.filter(a => a.status === 'Accepted').length}</span>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="py-32 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Connecting to Clinical Registry...</p>
                </div>
            ) : appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map((apt, idx) => (
                        <motion.div
                            key={apt._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="p-8 group hover:shadow-2xl transition-all duration-500 border-none shadow-premium relative overflow-hidden">
                                {apt.status === 'Accepted' && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[4rem] group-hover:bg-emerald-500/10 transition-colors" />
                                )}
                                
                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                                    {/* Avatar & Info */}
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-black text-2xl text-blue-500 border-2 border-gray-100 dark:border-gray-700 shadow-soft group-hover:rotate-6 transition-all duration-700">
                                            {apt.doctorId?.fullName?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Dr. {apt.doctorId?.fullName || 'Clinical Practitioner'}</h3>
                                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 rounded-full ${getStatusStyle(apt.status)}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{apt.doctorId?.specialization || 'Clinical Specialist'}</p>
                                        </div>
                                    </div>

                                    {/* Schedule Info */}
                                    <div className="grid grid-cols-2 lg:flex gap-6 shrink-0 lg:border-x lg:border-gray-100 dark:lg:border-gray-800 lg:px-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                                            </div>
                                            <p className="font-black text-sm text-gray-700 dark:text-gray-300">{new Date(apt.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Slot</span>
                                            </div>
                                            <p className="font-black text-sm text-gray-700 dark:text-gray-300">{apt.time}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 w-full lg:w-auto">
                                        {apt.status === 'Accepted' && apt.meetingLink && (
                                            <a 
                                                href={apt.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:bg-black transition-all active:scale-95 group/btn"
                                            >
                                                <Video size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                Start Video Call
                                            </a>
                                        )}
                                        {apt.status === 'Completed' && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedApt(apt);
                                                    setShowReviewModal(true);
                                                }}
                                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
                                            >
                                                <Star size={16} />
                                                Leave Feedback
                                            </button>
                                        )}
                                        {apt.status === 'Pending' && (
                                            <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-dashed border-gray-200">
                                                Processing Request...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="p-24 text-center glass-card border-dashed">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-gray-300">
                        <Calendar size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-4">No Appointments Scheduled</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed italic">Your clinical journey begins here. Connect with a specialist to initialize your first session.</p>
                    <Button onClick={() => window.location.href='/doctors'} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2.5xl shadow-glow">
                        Browse Specialists
                    </Button>
                </Card>
            )}

            {/* Feedback Modal */}
            <AnimatePresence>
                {showReviewModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-[3.5rem] w-full max-w-xl shadow-premium overflow-hidden border-4 border-white"
                        >
                            <div className="p-10 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-50 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-soft">
                                    <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none mb-2">Clinical Experience Review</h2>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest italic">Dr. {selectedApt?.doctorId?.fullName}</p>
                            </div>

                            <form onSubmit={handleReviewSubmit} className="p-10 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 text-center block mb-2">Clinical Rating</label>
                                    <div className="flex justify-center gap-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button 
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className={`p-4 rounded-2xl transition-all ${reviewForm.rating >= star ? 'bg-amber-50 text-amber-500 shadow-soft scale-110' : 'bg-gray-50 text-gray-300'}`}
                                            >
                                                <Star className={reviewForm.rating >= star ? 'fill-amber-500' : ''} size={32} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 ml-2">Observations & Feedback</label>
                                    <textarea 
                                        required
                                        className="w-full h-40 p-6 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-[2rem] outline-none font-bold text-gray-800 dark:text-white transition-all resize-none shadow-inner"
                                        placeholder="Describe your consultation experience, the doctor's insight, and communication quality..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1 py-5 rounded-2.5xl font-black uppercase tracking-widest text-gray-400" onClick={() => setShowReviewModal(false)}>
                                        Discard
                                    </Button>
                                    <Button type="submit" className="flex-[2] py-5 rounded-2.5xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-shadow-glow">
                                        Certify Review
                                    </Button>
                                </div>
                                <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheck size={14} className="text-blue-500" /> Secure clinical feedback protocol active
                                </p>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
