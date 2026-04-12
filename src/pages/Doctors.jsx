import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, ExternalLink, ShieldCheck, Stethoscope, AlertCircle, Sparkles, Calendar, Star, Award, X, User, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { API_BASE_URL } from '../api/config';
import toast from 'react-hot-toast';

const SYMPTOM_MAP = {
    'heart': 'Cardiologist',
    'chest': 'Cardiologist',
    'bp': 'Cardiologist',
    'blood pressure': 'Cardiologist',
    'skin': 'Dermatologist',
    'acne': 'Dermatologist',
    'rash': 'Dermatologist',
    'hair': 'Dermatologist',
    'pimple': 'Dermatologist',
    'tooth': 'Dentist',
    'teeth': 'Dentist',
    'dental': 'Dentist',
    'gum': 'Dentist',
    'cavity': 'Dentist',
    'fever': 'General Physician',
    'cold': 'General Physician',
    'flu': 'General Physician',
    'cough': 'General Physician',
    'headache': 'General Physician',
    'viral': 'General Physician',
    'bone': 'Orthopedist',
    'joint': 'Orthopedist',
    'knee': 'Orthopedist',
    'back pain': 'Orthopedist',
    'fracture': 'Orthopedist',
    'eye': 'Ophthalmologist',
    'vision': 'Ophthalmologist',
    'stress': 'Psychiatrist',
    'depression': 'Psychiatrist',
    'anxiety': 'Psychiatrist',
    'mental': 'Psychiatrist',
    'child': 'Pediatrician',
    'baby': 'Pediatrician',
    'kid': 'Pediatrician',
    'women': 'Gynecologist',
    'period': 'Gynecologist',
    'pregnancy': 'Gynecologist',
    'stomach': 'Gastroenterologist',
    'gas': 'Gastroenterologist',
    'liver': 'Gastroenterologist',
    'digest': 'Gastroenterologist',
    'sugar': 'Diabetologist',
    'diabetes': 'Diabetologist',
    'ear': 'ENT Specialist',
    'nose': 'ENT Specialist',
    'throat': 'ENT Specialist'
};

// Specialty color mapping
const SPEC_COLORS = {
    'Cardiologist': 'from-red-500 to-rose-600',
    'Dermatologist': 'from-pink-500 to-fuchsia-600',
    'General Physician': 'from-blue-500 to-indigo-600',
    'Orthopedist': 'from-orange-500 to-amber-600',
    'Gynecologist': 'from-purple-500 to-violet-600',
    'Psychiatrist': 'from-teal-500 to-cyan-600',
    'Pediatrician': 'from-green-500 to-emerald-600',
    'ENT Specialist': 'from-yellow-500 to-orange-500',
    'Ophthalmologist': 'from-sky-500 to-blue-600',
    'Gastroenterologist': 'from-lime-500 to-green-600',
    'Diabetologist': 'from-amber-500 to-yellow-600',
    'Dentist': 'from-slate-400 to-slate-600',
};

export default function Doctors() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [city, setCity] = useState('');
    const [detectedSpecialist, setDetectedSpecialist] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redirectState, setRedirectState] = useState({
        isOpen: false, provider: '', url: '', countdown: 3, finalQuery: ''
    });
    const [userConnections, setUserConnections] = useState([]);

    // Fetch doctors from backend
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/doctors`);
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    setDoctors(data.data);
                    setFilteredDoctors(data.data);
                } else {
                    setError('No doctors found in network');
                }
            } catch (err) {
                console.error("Failed to fetch doctors", err);
                setError('Could not connect to medical server');
            } finally {
                setLoading(false);
            }
        };
        const fetchUserConnections = async () => {
            if (!user?.token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/connections/my-connections`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (data.success) setUserConnections(data.data);
            } catch (err) {
                console.error("Failed to fetch user connections", err);
            }
        };

        fetchDoctors();
        fetchUserConnections();
    }, [user]);

    // Handle incoming state from Body Map / Symptoms page
    useEffect(() => {
        if (location.state?.specialist) {
            setQuery(location.state.specialist);
            setDetectedSpecialist(location.state.specialist);
        }
    }, [location.state]);

    // Smart Symptom Mapping & Filter Effect
    useEffect(() => {
        const lowerQuery = query.toLowerCase();
        let match = null;

        if (query) {
            for (const [key, specialist] of Object.entries(SYMPTOM_MAP)) {
                if (lowerQuery.includes(key)) {
                    match = specialist;
                    break;
                }
            }
        }

        if (!match && location.state?.specialist === query) match = query;
        setDetectedSpecialist(match);

        // Filter doctors by detected specialist or raw query + city
        const searchTarget = match || query;
        if (!searchTarget && !city) {
            setFilteredDoctors(doctors);
            return;
        }

        const filtered = doctors.filter(doc => {
            const matchesQuery = !searchTarget ||
                doc.fullName?.toLowerCase().includes(searchTarget.toLowerCase()) ||
                doc.specialization?.toLowerCase().includes(searchTarget.toLowerCase());

            const matchesCity = !city ||
                (doc.hospital || '').toLowerCase().includes(city.toLowerCase());

            return matchesQuery && matchesCity;
        });

        setFilteredDoctors(filtered);
    }, [query, city, doctors]);

    // Countdown redirect for external search
    useEffect(() => {
        let timer;
        if (redirectState.isOpen && redirectState.countdown > 0) {
            timer = setTimeout(() => {
                setRedirectState(prev => ({ ...prev, countdown: prev.countdown - 1 }));
            }, 1000);
        } else if (redirectState.isOpen && redirectState.countdown === 0) {
            window.open(redirectState.url, '_blank');
            setRedirectState(prev => ({ ...prev, isOpen: false }));
        }
        return () => clearTimeout(timer);
    }, [redirectState]);

    const handleBookAppointment = (doctor) => {
        navigate('/appointment', { state: { doctor } });
    };

    const handleConnect = async (docId) => {
        if (!user) {
            toast.error("Please login to connect with a doctor");
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/connections/request`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ doctorId: docId })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Connection request sent!");
                // Update local state to reflect the new request immediately
                setUserConnections(prev => [...prev, data.data]);
            } else {
                toast.error(data.message || "Request failed");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        }
    };

    const getConnectionStatus = (docId) => {
        const conn = userConnections.find(c => c.doctorId?._id === docId || c.doctorId === docId);
        return conn ? conn.status : null;
    };

    const setRedirectStateData = (provider) => {
        const searchQuery = detectedSpecialist || query || 'General Physician';
        const searchCity = city || 'India';
        let url = '', providerName = '';

        if (provider === 'practo') {
            url = `https://www.practo.com/search/doctors?results_type=doctor&q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(searchCity)}`;
            providerName = 'Practo';
        } else if (provider === 'apollo') {
            url = `https://www.apollo247.com/doctors/search?q=${encodeURIComponent(searchQuery)}`;
            providerName = 'Apollo 24/7';
        } else if (provider === '1mg') {
            url = `https://www.1mg.com/doctors/search?q=${encodeURIComponent(searchQuery)}`;
            providerName = 'Tata 1mg';
        }

        setRedirectState({ isOpen: true, provider: providerName, url, countdown: 3, finalQuery: searchQuery });
    };

    const getSpecColor = (spec) => SPEC_COLORS[spec] || 'from-blue-500 to-indigo-600';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20 md:pb-6 max-w-6xl mx-auto px-4"
        >
            {/* Header */}
            <div className="text-center mb-10 pt-6">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 uppercase tracking-tight">
                    Find Your Doctor
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                    Book with verified Swasthya doctors instantly, or search top platforms for more specialists.
                </p>
            </div>

            {/* Search Inputs */}
            <Card className="p-6 md:p-8 mb-10 bg-white dark:bg-gray-800 shadow-2xl border-blue-100 dark:border-blue-900/30 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input
                            label="Search Specialist, Symptom or Doctor Name"
                            placeholder="e.g. Cardiologist, Fever, Dr. Sharma..."
                            icon={<Stethoscope className="w-5 h-5" />}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {detectedSpecialist && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 w-max px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800"
                            >
                                <Sparkles className="w-4 h-4" />
                                Specialist Detected: <strong>{detectedSpecialist}</strong>
                            </motion.div>
                        )}
                    </div>
                    <Input
                        label="Hospital or City"
                        placeholder="e.g. Apollo, Bangalore..."
                        icon={<MapPin className="w-5 h-5" />}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
            </Card>

            {/* ============ INTERNAL DOCTORS ============ */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <ShieldCheck className="text-blue-600 w-7 h-7" />
                    Swasthya Verified Doctors
                    <span className="text-base font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100">
                        {filteredDoctors.length} online
                    </span>
                </h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-72 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : error || filteredDoctors.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 mb-16">
                    <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-500 mb-2">
                        {query ? `No doctors found matching "${query}"` : 'No verified doctors found'}
                    </p>
                    <p className="text-sm text-gray-400">Try searching on external platforms below</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {filteredDoctors.map((doc, i) => (
                        <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col group transition-all duration-300"
                        >
                            {/* Specialty color bar */}
                            <div className={`h-2 bg-gradient-to-r ${getSpecColor(doc.specialization)}`} />

                            <div className="p-7 flex-1">
                                <div className="flex items-start justify-between mb-5">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSpecColor(doc.specialization)} flex items-center justify-center text-white shadow-lg`}>
                                        {doc.profileImage
                                            ? <img src={doc.profileImage} alt={doc.fullName} className="w-full h-full object-cover rounded-2xl" />
                                            : <User className="w-8 h-8" />
                                        }
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1 rounded-full text-sm font-black border border-amber-100 dark:border-amber-800">
                                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                                        {(doc.rating || 4.5).toFixed(1)}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 leading-tight">
                                    Dr. {doc.fullName}
                                </h3>
                                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-4 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5" />
                                    {doc.specialization}
                                </p>

                                {doc.bio && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{doc.bio}</p>
                                )}

                                <div className="space-y-2">
                                    {doc.hospital && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            {doc.hospital}
                                        </div>
                                    )}
                                    {doc.experience && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            {doc.experience}+ Years Experience
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-7 pb-7 flex gap-3">
                                <button
                                    onClick={() => handleConnect(doc._id)}
                                    disabled={getConnectionStatus(doc._id)}
                                    className={`flex-1 py-3.5 rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-sm transition-all flex items-center justify-center gap-2 ${
                                        getConnectionStatus(doc._id) === 'Accepted'
                                            ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100'
                                            : getConnectionStatus(doc._id) === 'Pending'
                                            ? 'bg-amber-50 text-amber-600 border-2 border-amber-100'
                                            : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-primary/30'
                                    }`}
                                >
                                    {getConnectionStatus(doc._id) === 'Accepted' ? (
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                    ) : getConnectionStatus(doc._id) === 'Pending' ? (
                                        <Clock className="w-3.5 h-3.5" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                    )}
                                    {getConnectionStatus(doc._id) === 'Accepted' ? 'Connected' : getConnectionStatus(doc._id) === 'Pending' ? 'Requested' : 'Connect'}
                                </button>
                                <button
                                    onClick={() => handleBookAppointment(doc)}
                                    className={`flex-1 bg-gradient-to-r ${getSpecColor(doc.specialization)} text-white py-3.5 rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    Book
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ============ EXTERNAL SEARCH ============ */}
            <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-12 mb-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <Search className="text-gray-500 w-7 h-7" />
                    Search on Other Platforms
                </h2>
                <p className="text-gray-400 font-medium mb-8">
                    Find more specialists from India's top booking platforms – your search term will be pre-filled.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Practo */}
                    <Card className="flex flex-col justify-between hover:shadow-xl transition-all border-t-4 border-t-[#28328c] rounded-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="h-10 mb-3 flex items-center">
                                <span className="text-2xl font-black text-[#28328c]">Practo</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-5">Best for verified reviews & instant online/offline booking near you.</p>
                            <Button onClick={() => setRedirectStateData('practo')} className="w-full bg-[#28328c] hover:bg-[#1e266d] text-white rounded-xl">
                                Search on Practo <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>

                    {/* Apollo */}
                    <Card className="flex flex-col justify-between hover:shadow-xl transition-all border-t-4 border-t-[#fea302] rounded-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="h-10 mb-3 flex items-center">
                                <span className="text-2xl font-black text-[#fea302]">Apollo 24|7</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-5">Connect with Apollo specialists for online and in-clinic consultations.</p>
                            <Button onClick={() => setRedirectStateData('apollo')} className="w-full bg-[#fea302] hover:bg-[#e59202] text-white rounded-xl">
                                Search on Apollo <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>

                    {/* 1mg */}
                    <Card className="flex flex-col justify-between hover:shadow-xl transition-all border-t-4 border-t-[#ff6f61] rounded-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="h-10 mb-3 flex items-center">
                                <span className="text-2xl font-black text-[#ff6f61]">Tata 1mg</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-5">Wide doctor network with integrated medicine delivery on one platform.</p>
                            <Button onClick={() => setRedirectStateData('1mg')} className="w-full bg-[#ff6f61] hover:bg-[#e65b4e] text-white rounded-xl">
                                Search on 1mg <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-8 text-center text-sm text-gray-400 flex items-center justify-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>All Swasthya doctors are internally verified with valid medical credentials.</span>
            </div>

            {/* Redirect Modal */}
            <AnimatePresence>
                {redirectState.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative"
                        >
                            <button
                                onClick={() => setRedirectState(p => ({ ...p, isOpen: false }))}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                                <ExternalLink className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Leaving Swasthya</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                Searching for <strong>"{redirectState.finalQuery}"</strong> on <strong>{redirectState.provider}</strong>.
                            </p>
                            <div className="mb-6">
                                <div className="text-5xl font-black text-blue-600">{redirectState.countdown}</div>
                                <p className="text-xs text-gray-400 mt-1">seconds remaining</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setRedirectState(p => ({ ...p, isOpen: false }))}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
