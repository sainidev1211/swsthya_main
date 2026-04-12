import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import FlipCard from '../components/ui/FlipCard';
import Button from '../components/ui/Button';
import HealthQuote from '../components/features/HealthQuote';
import MedicalSearch from '../components/features/MedicalSearch';
import NearestHospitalCard from '../components/features/NearestHospitalCard';
import { Activity, Calendar, Pill, ShieldAlert, Smartphone, Brain, HeartPulse, AlertTriangle, ArrowRight, FileText, CheckCircle2, User, Mail, Sparkles, Upload, ClipboardList } from 'lucide-react';
import { useMedical } from '../contexts/MedicalContext';
import { useAuth } from '../contexts/AuthContext';

// Advanced Isolated Components
import HistoryOverview from '../components/dashboard/HistoryOverview';
import FileManager from '../components/dashboard/FileManager';
import HealthInsights from '../components/dashboard/HealthInsights';
import SmartSearch from '../components/dashboard/SmartSearch';
import DoctorSummary from '../components/dashboard/DoctorSummary';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, isGuest } = useAuth();
    const { records, analysis, loading } = useMedical();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-24 md:pb-20"
        >
            {/* Dynamic Health Quote */}
            <HealthQuote />

            {/* Hero Section: Welcome & Overview */}
            <div className="text-center space-y-4 md:space-y-6 pt-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        {user ? `Hello, ${user.name?.split(' ')[0] || 'User'}` : 'Health Command Center'}
                    </h1>
                    <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed font-medium">
                        Your personalized medical intelligence hub.
                        Search anything below, and we'll automatically cross-reference your history to highlight what's safe or risky for <span className="text-emerald-500 font-bold">you</span>.
                    </p>
                </motion.div>

                {/* Search Bar Container with Visual Highlight */}
                <div className="flex justify-center w-full px-2 md:px-4 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <MedicalSearch />
                </div>
            </div>


            {/* Personalized Health Intelligence Panel */}
            {(!isGuest && user) && (
                <div className="px-2 md:px-4">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Brain className="w-6 h-6 text-indigo-500" />
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Health Intelligence</h2>
                    </div>

                    {loading ? (
                        <Card className="p-8 text-center animate-pulse bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Syncing your secure medical profile...</p>
                        </Card>
                    ) : analysis ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Executive Summary & Health Score */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-3 mb-2">
                                <Card className="p-6 md:p-8 border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-teal-50/30 dark:from-emerald-900/20 dark:to-gray-900 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-inner border-[6px] border-emerald-400 dark:border-emerald-500">
                                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{analysis.healthScore || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                                                Status: <span className={analysis.healthStatus === 'Safe' ? 'text-emerald-500' : analysis.healthStatus === 'Risk' ? 'text-rose-500' : 'text-amber-500'}>{analysis.healthStatus || 'Pending'}</span>
                                            </h3>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-emerald-500" /> Based on your past health records
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-2">
                                <Card className="p-6 md:p-8 border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-900/20 dark:to-gray-900 shadow-premium h-full relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 rotate-12">
                                        <HeartPulse size={200} className="text-indigo-600" />
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30">
                                                    <FileText size={20} />
                                                </div>
                                                <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-100">Executive Summary</h3>
                                            </div>
                                            <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl" onClick={() => navigate('/health-profile')}>
                                                Full Profile <ArrowRight size={16} className="ml-1" />
                                            </Button>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed font-medium flex-1">
                                            {analysis.summary}
                                        </p>

                                        <div className="mt-6 pt-6 border-t border-indigo-100/50 dark:border-indigo-800/50 flex flex-wrap gap-3">
                                            {analysis.doctorRecommendation?.status && (
                                                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2
                                                    ${analysis.doctorRecommendation.urgency > 7 ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                                        analysis.doctorRecommendation.urgency > 3 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                            'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                                    <Activity size={14} /> {analysis.doctorRecommendation.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Key Risks & Conditions */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex flex-col gap-6">
                                <Card className="p-6 bg-white dark:bg-gray-800 border-rose-100 dark:border-gray-700 shadow-soft flex-1">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <ShieldAlert className="text-rose-500" size={20} /> Highlighted Risks
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.risks && analysis.risks.length > 0 ? (
                                            analysis.risks.slice(0, 3).map((risk, idx) => (
                                                <div key={idx} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{risk.condition}</span>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full 
                                                            ${risk.level === 'critical' ? 'bg-rose-100 text-rose-700' :
                                                                risk.level === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-amber-100 text-amber-700'}`}>
                                                            {risk.level}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{risk.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                                <CheckCircle2 size={24} />
                                                <span className="text-sm font-bold">No critical risks identified.</span>
                                            </div>
                                        )}
                                        {analysis.risks?.length > 3 && (
                                            <p className="text-xs text-center text-gray-400 font-medium pt-2">+{analysis.risks.length - 3} more risks in Profile</p>
                                        )}
                                    </div>
                                </Card>

                                {/* Health Timeline Engine */}
                                {analysis.timeline && analysis.timeline.length > 0 && (
                                    <Card className="p-6 bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700 shadow-soft flex-1">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar className="text-indigo-500" size={20} /> Health Timeline
                                        </h3>
                                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                                            {analysis.timeline.map((event, idx) => (
                                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    {/* Timeline Node */}
                                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-gray-900 bg-indigo-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />

                                                    {/* Timeline Content */}
                                                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <time className="text-xs font-bold text-indigo-500">{event.dateAdded || 'Unknown Date'}</time>
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${event.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {event.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{event.disease}</p>
                                                        {event.medicinesTaken && event.medicinesTaken !== 'None' && (
                                                            <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
                                                                <Pill size={12} className="text-indigo-400" /> {event.medicinesTaken}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        </div>
                    ) : records.length > 0 ? (
                        <Card className="p-8 text-center bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800">
                            <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyze Your Records</h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                                You have {records.length} medical records. Generate your AI health intelligence report to unlock personalized safety warnings and executive summaries.
                            </p>
                            <Button onClick={() => navigate('/health-profile')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl shadow-soft">
                                Generate Intelligence
                            </Button>
                        </Card>
                    ) : (
                        <Card className="p-8 text-center bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">No medical history found. Upload records to enable personalized analysis.</h3>
                            <Button onClick={() => navigate('/health-profile')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-2xl shadow-soft">
                                Upload Records
                            </Button>
                        </Card>
                    )}
                </div>
            )}

            {/* Quick Actions & Emergency */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-4 mt-8">

                {/* Emergency Card - Full width on mobile/tablet, 1 col on desktop */}
                <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                    <Card className="p-6 md:p-8 bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/50 flex flex-col items-center text-center hover:shadow-glow transition-all duration-300 col-span-1 rounded-[2.5rem] shadow-premium group h-full justify-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mb-6 animate-pulse group-hover:scale-110 transition-transform duration-500">
                            <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Emergency SOS</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[200px]">
                            Instant access to ambulance and emergency contacts.
                        </p>
                        <Button
                            variant="danger"
                            size="lg"
                            className="w-full py-4 rounded-2xl shadow-lg shadow-rose-500/30 font-bold"
                            onClick={() => navigate('/emergency')}
                        >
                            Get Help Now
                        </Button>
                    </Card>
                </motion.div>

                {/* Quick Links Grid - 2 cols on mobile/tablet/desktop */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
                    {/* 1. Book Doctor */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                        <Card
                            onClick={() => navigate('/doctors')}
                            className="glass-card p-6 md:p-8 cursor-pointer min-h-[160px] group flex flex-col justify-between h-full"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
                            </div>
                            <div className="mt-4">
                                <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Book Doctor</h3>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">Verified Specialists</p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* 2. Order Medicine */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                        <Card
                            onClick={() => navigate('/pharmacy')}
                            className="glass-card p-6 md:p-8 cursor-pointer min-h-[160px] group flex flex-col justify-between h-full"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
                                <Pill className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
                            </div>
                            <div className="mt-4">
                                <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Order Medicine</h3>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">Fast Delivery</p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* 3. Nearest Hospital (Dynamic) */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                        <NearestHospitalCard onClick={() => navigate('/hospitals')} className="glass-card h-full" />
                    </motion.div>

                    {/* 4. Health Tools */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                        <Card
                            onClick={() => navigate('/symptoms')}
                            className="glass-card p-6 md:p-8 cursor-pointer min-h-[160px] group flex flex-col justify-between h-full"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-300">
                                <Activity className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                            </div>
                            <div className="mt-4">
                                <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Health Tools</h3>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">Check Symptoms</p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Interactive Flip Cards: Connect Device & AI Warning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-2 md:px-4">
                {/* 1. Connect Device Card */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <FlipCard
                        className="h-44 md:h-52"
                        frontContent={
                            <div className="h-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 p-6 md:p-8 glass-card border-blue-100/50">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 dark:bg-blue-900/40 rounded-3xl flex items-center justify-center text-blue-500 shadow-soft group-hover:scale-110 transition-transform duration-500">
                                        <Smartphone className="w-7 h-7 md:w-8 md:h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Connect Device</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs md:text-sm font-medium">
                                            Sync stats from your smartwatch.
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="px-6 py-2.5 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">
                                    Connect
                                </Button>
                            </div>
                        }
                        backContent={
                            <div className="text-center p-6 h-full flex flex-col items-center justify-center bg-blue-600 rounded-[2.5rem]">
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Coming Soon</h3>
                                <p className="text-blue-100 text-xs md:text-sm font-medium opacity-80">Full ecosystem integration in progress.</p>
                            </div>
                        }
                    />
                </motion.div>

                {/* 2. AI Warning / Admin Card */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <FlipCard
                        className="h-44 md:h-52"
                        frontContent={
                            <div className="h-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 p-6 md:p-8 glass-card border-amber-100/50">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-50 dark:bg-amber-900/40 rounded-3xl flex items-center justify-center text-amber-600 shadow-soft animate-pulse">
                                        <AlertTriangle className="w-7 h-7 md:w-8 md:h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">AI Disclaimer</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs md:text-sm font-medium">
                                            Always consult a certified doctor.
                                        </p>
                                    </div>
                                </div>
                                <Button className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-transparent font-bold shadow-md shadow-amber-500/20">
                                    View Credits
                                </Button>
                            </div>
                        }
                        backContent={
                            <div className="flex flex-col items-center justify-center gap-4 p-6 h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem]">
                                <div className="text-center">
                                    <h3 className="font-black text-xl md:text-2xl text-white">Dev Saini</h3>
                                    <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest mt-1">Lead Developer</p>
                                </div>
                                <div className="flex gap-3">
                                    <a href="https://myportf-six.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold backdrop-blur-md transition-all text-white border border-white/20 shadow-lg">
                                        Portfolio
                                    </a>
                                    <a href="https://www.linkedin.com/in/dev-sainii/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold backdrop-blur-md transition-all text-white border border-white/20 shadow-lg">
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        }
                    />
                </motion.div>
            </div>

            {/* --- ADVANCED DATA-DRIVEN FEATURES (ISOLATED) --- */}
            <div className="pt-12 border-t border-gray-100 dark:border-gray-800 space-y-24">
                {/* 1. Medical History Overview */}
                <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
                    <HistoryOverview analysis={analysis} records={records} />
                </motion.div>

                {/* 3. AI Health Insights */}
                <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
                    <HealthInsights analysis={analysis} />
                </motion.div>

                {/* 4. Doctor-Friendly View */}
                <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
                    <DoctorSummary analysis={analysis} user={user} />
                </motion.div>
            </div>
        </motion.div>
    );
}
