import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Download, Calendar, User, FileText, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Prescriptions() {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRx = async () => {
            try {
                const userId = user?._id || user?.id;
                const res = await fetch(`${API_BASE_URL}/prescriptions/patient/${userId}`);
                const data = await res.json();
                if (data.success) {
                    setPrescriptions(data.data);
                }
            } catch (err) {
                toast.error("Failed to load prescriptions");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchRx();
    }, [user]);

    const filtered = prescriptions.filter(rx => 
        rx.doctorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.medicines?.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up pb-20">
            <header>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">My Prescriptions</h1>
                <p className="text-gray-500 font-medium italic">Your certified clinical orders and digital Rx history.</p>
            </header>

            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search by doctor or medicine..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none shadow-soft transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Medical Vault...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((rx, idx) => (
                        <motion.div
                            key={rx._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-6 md:p-8 flex flex-col h-full hover:shadow-xl transition-all border-none shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Pill size={80} className="text-blue-600" />
                                </div>

                                <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Certified Rx</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(rx.date || rx.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Dr. {rx.doctorId?.fullName || 'Health Pro'}</h3>
                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">{rx.doctorId?.specialization || 'Clinical Specialist'}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-500">
                                        <FileText size={24} />
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        {rx.medicines.map((med, i) => (
                                            <div key={i} className="flex flex-col p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-black text-gray-900 dark:text-white">{med.name}</span>
                                                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{med.dosage}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">{med.duration} • {med.instructions || 'As directed by physician'}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {rx.notes && (
                                        <p className="text-xs text-gray-400 italic bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-50 dark:border-gray-800">
                                            Notes: {rx.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                                    {rx.fileUrl && (
                                        <Button 
                                            variant="primary" 
                                            className="flex-1 rounded-xl bg-blue-600 font-black text-xs uppercase tracking-widest"
                                            onClick={() => window.open(rx.fileUrl, '_blank')}
                                        >
                                            <Download size={14} className="mr-2" /> View/PDF
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest text-gray-400">
                                        Clinical Info
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="p-20 text-center glass-card border-dashed">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Pill size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">No Active Prescriptions</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto mt-3">Once a doctor issues a digital prescription, it will appear here for your reference.</p>
                </Card>
            )}
        </div>
    );
}
