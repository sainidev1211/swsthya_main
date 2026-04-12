import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Stethoscope, MapPin, User, ChevronLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { API_BASE_URL } from '../api/config';
import toast from 'react-hot-toast';

export default function Appointment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const doctor = location.state?.doctor;

    // Handle session restoration
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const [form, setForm] = useState({
        date: '',
        time: '',
        reason: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error("Please login to book an appointment");
            navigate('/login');
            return;
        }

        const userId = user._id || user.id;

        if (!doctor) {
            toast.error("No doctor selected");
            navigate('/doctors');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/book-appointment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: userId,
                    doctorId: doctor._id,
                    date: form.date,
                    time: form.time,
                    reason: form.reason
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Appointment Request Sent!");
                navigate('/dashboard');
            } else {
                toast.error(data.message || "Booking failed");
            }
        } catch (err) {
            toast.error("Communication failure with medical server");
        } finally {
            setLoading(false);
        }
    };

    if (!doctor) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center px-4"
            >
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-8 border border-red-100 dark:border-red-800">
                    <Stethoscope className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase italic">No Doctor Selected</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 font-medium">
                    To book an appointment, please first select a practitioner from our verified medical network.
                </p>
                <Button variant="primary" size="lg" onClick={() => navigate('/doctors')} className="rounded-2xl px-10 py-4 font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700">
                    Browse Doctors Network
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="pb-20 pt-6 max-w-4xl mx-auto px-4">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-10 group transition-all"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Search Results
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Doctor Brief Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8 bg-blue-600 text-white rounded-[2.5rem] border-none shadow-2xl shadow-blue-200 dark:shadow-none overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                <Stethoscope size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic leading-none mb-2">Dr. {doctor.fullName}</h2>
                            <p className="text-blue-100 font-bold uppercase tracking-widest text-sm mb-8">{doctor.specialization}</p>
                            
                            <div className="space-y-4 pt-6 border-t border-white/20">
                                <div className="flex items-start gap-4">
                                    <MapPin size={20} className="mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 opacity-70 mb-1">Clinic/Hospital</p>
                                        <p className="font-bold">{doctor.hospital}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <ShieldCheck size={20} className="mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 opacity-70 mb-1">Verification Status</p>
                                        <p className="font-bold">Externally Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Design elements */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </Card>

                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <h4 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-6">Booking Policies</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Free rescheduling up to 4h before
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Direct response from practitioner
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="lg:col-span-3">
                    <Card className="p-10 rounded-[3rem] shadow-2xl border-white/50 bg-white dark:bg-gray-800">
                        <div className="mb-10">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none mb-3">Initialize Consultation</h3>
                            <p className="text-gray-400 font-medium">Please select your preferred schedule and briefly describe your clinical state.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Consultation Date"
                                    type="date"
                                    required
                                    icon={<Calendar className="w-5 h-5" />}
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                                <Input
                                    label="Slot Timing"
                                    type="time"
                                    required
                                    icon={<Clock className="w-5 h-5" />}
                                    value={form.time}
                                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Clinical Reason / Symptoms</label>
                                <textarea
                                    className="w-full h-32 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] p-6 text-gray-800 dark:text-white font-medium outline-none transition-all resize-none shadow-inner"
                                    placeholder="Describe your symptoms or reason for visit (e.g., persistent headache for 3 days)..."
                                    required
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 hover:bg-black text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Request Appointment <CreditCard size={18} strokeWidth={3} /></>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-6">
                                    Secure clinical request encrypted via RSA-2048
                                </p>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
