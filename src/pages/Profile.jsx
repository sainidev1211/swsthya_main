import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { fetchUserActivities, saveUserActivity } from '../api';
import { ShieldCheck, Mail, Phone, Calendar, Activity, User } from 'lucide-react';

export default function Profile() {
    const { user, updateUser, logout } = useAuth();
    const [formData, setFormData] = useState({
        emergencyContact: '',
        medicalHistory: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                const userId = user.id || user.uid || user.email;
                try {
                    const activities = await fetchUserActivities(userId, 'profile_update');
                    if (activities && activities.length > 0) {
                        const latest = activities[0].data;
                        setFormData({
                            emergencyContact: latest.emergencyContact || '',
                            medicalHistory: latest.medicalHistory || ''
                        });
                        return;
                    }
                } catch (e) {
                    console.error("Failed to load profile", e);
                }

                // Fallback to older AuthContext cached values
                setFormData({
                    emergencyContact: user.emergencyContact || '',
                    medicalHistory: user.medicalHistory || ''
                });
            }
        };
        loadProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) {
            toast.error("Please login or continue as guest to save profile.");
            return;
        }

        setIsSaving(true);
        try {
            const userId = user.id || user.uid || user.email;
            await saveUserActivity(userId, 'profile_update', formData);

            if (!user.isGuest) {
                await updateUser(formData);
            }
            toast.success("Profile securely updated in database!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile securely.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 md:p-6 space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-2">My Profile</h2>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 rounded-full flex items-center justify-center text-3xl text-emerald-700 dark:text-emerald-300 font-bold shadow-inner">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || user?.displayName || 'User'}`}
                            alt="avatar"
                            className="w-full h-full rounded-full"
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            {user?.fullName || user?.displayName || (user ? 'User' : 'Guest User')}
                        </h3>
                        
                        <div className="flex items-center gap-2 mt-3">
                            {user?.isGuest ? (
                                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">Guest Session</span>
                            ) : (
                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified Member
                                </span>
                            )}
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full inline-block">
                                Premium Plan Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Professional Data Grid for Signup Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email Address</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.email || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Mobile Number</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.mobile || 'Not provided'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Age</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.age ? `${user.age} Years` : 'Not provided'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">User ID</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{user?.id ? user.id.substring(0,8) + '...' : 'Not available'}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-6">
                    {/* Health Stats Section */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Health Stats</h4>
                        {user?.weight ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{user.weight} kg</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{user.height} cm</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">BMI</p>
                                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                        {user.height > 0 ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : '—'}
                                    </p>
                                </div>
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">BP</p>
                                    <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
                                        {user.systolic}/{user.diastolic}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No health data recorded yet.</p>
                                <a href="/wellness" className="text-emerald-600 font-bold text-sm hover:underline">
                                    Go to Wellness Hub to add data
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Medical History */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Medical History / Allergies</label>
                        <textarea
                            placeholder={user?.isGuest ? "Sign up to save your medical history securely." : "Enter known allergies, chronic conditions..."}
                            className="w-full p-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-32 text-sm transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                            id="profileMedicalHistory"
                            disabled={user?.isGuest}
                            value={formData.medicalHistory}
                            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                        ></textarea>
                        {user?.isGuest && (
                            <p className="text-xs text-amber-500 mt-2 font-medium">
                                * Guest users cannot save medical history.
                            </p>
                        )}
                        {!user?.isGuest && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Used for AI personalization (securely stored locally).
                            </p>
                        )}
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Emergency Contact</label>
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full p-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || (user?.isGuest && !user?.uid.startsWith('guest-'))} // Allow guests to save somewhat if needed, or strict blocked
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition-colors text-left">
                        Clear Local History
                    </button>

                    {user?.isGuest && (
                        <button
                            onClick={() => window.location.href = '/signup'}
                            className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 py-2 rounded-lg transition-colors text-left"
                        >
                            Sign Up / Log In
                        </button>
                    )}

                    <button
                        onClick={logout}
                        className="text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition-colors text-left"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
