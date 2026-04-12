import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Camera, ArrowRight, AlertTriangle, Pill, Stethoscope, ChevronDown, ChevronUp, Copy, Share2, Globe, Upload, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMedicineWithAI, analyzeMedicineImageWithAI } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { useMedical } from '../../contexts/MedicalContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import CameraCapture from './CameraCapture';
import PersonalSafetyBadge from './PersonalSafetyBadge';

export default function MedicalSearch() {
    const [query, setQuery] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('en'); // 'en' or 'hi'
    const [expandedSections, setExpandedSections] = useState({ what: true, why: false, how: false, alternatives: false });
    const { user } = useAuth();
    const { records } = useMedical();

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Effect to handle URL query params for auto-search
    useEffect(() => {
        const urlQuery = searchParams.get('q');
        if (urlQuery && urlQuery !== query) {
            setQuery(urlQuery);
            performSearch(urlQuery);
        }
        if (urlQuery && urlQuery !== query) {
            setQuery(urlQuery);
            performSearch(urlQuery);
        }
    }, [searchParams]);

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setExpandedSections({ what: true, why: false, how: false, alternatives: false });

        try {
            const data = await searchMedicineWithAI(searchQuery, records, user);
            setResult(data);
        } catch (err) {
            console.error("Search failed:", err);
            setError("AI service unavailable. Please try again.");
            setResult({ notFound: true });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => performSearch(query);

    const handleCameraCapture = async (imageUrl) => {
        setIsCameraOpen(false);
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysis = await analyzeMedicineImageWithAI(imageUrl, records, user);
            setResult(analysis);
            setQuery(analysis.en.title);
        } catch (err) {
            console.error(err);
            setError("Could not analyze image. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    // Helper to get current language content
    const content = result ? result[language] : null;

    return (
        <div className="w-full max-w-4xl mx-auto relative z-20 pb-20">
            {/* Search Bar */}
            <div className="relative mb-8">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                    className="relative flex items-center"
                >
                    <Search className="absolute left-4 w-5 h-5 text-gray-400 z-10" />
                    <Input
                        type="text"
                        placeholder="Search symptoms, medicines, or health conditions..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-12 pr-32 py-4 text-lg w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl shadow-emerald-500/5 focus:ring-2 focus:ring-emerald-500 rounded-2xl transition-all"
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                        {/* Mobile Camera/Upload Input */}
                        <label className="cursor-pointer p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all md:hidden">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setLoading(true);
                                        setError(null);
                                        const reader = new FileReader();
                                        reader.onloadend = async () => {
                                            handleCameraCapture(reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <Camera className="w-5 h-5" />
                        </label>

                        {/* Universal Upload Input */}
                        <label className="cursor-pointer p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Upload Image">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setLoading(true);
                                        setError(null);
                                        const reader = new FileReader();
                                        reader.onloadend = async () => {
                                            handleCameraCapture(reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <Upload className="w-5 h-5" />
                        </label>

                        {/* Desktop Camera Modal Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCameraOpen(true)}
                            className="hidden md:flex p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl"
                            title="Open Camera Scanner"
                        >
                            <Camera className="w-5 h-5" />
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
                        <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
                        {error}
                    </div>
                )}

                {/* Results Area */}
                <AnimatePresence>
                    {result && !result.notFound && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-6 space-y-6"
                        >
                            {/* Personal Safety Alert */}
                            {user && content?.title && (
                                <PersonalSafetyBadge productName={content.title} initialSafetyInfo={result.safety_status} />
                            )}

                            {/* Critical Alert */}
                            {result.critical_alert && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-4 animate-pulse">
                                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-red-800 dark:text-red-200">Medical Warning</h3>
                                        <p className="text-red-700 dark:text-red-300 text-sm">{result.critical_alert}</p>
                                    </div>
                                </div>
                            )}

                            {/* Main Result Header with Language Toggle */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-2 uppercase tracking-wider">
                                        {result.type}
                                    </span>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">{content?.title}</h2>
                                </div>

                                <button
                                    onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                >
                                    <Globe className="w-4 h-4" />
                                    {language === 'en' ? 'Read in Hindi' : 'Read in English'}
                                </button>
                            </div>

                            {/* Intelligent Explanation Cards */}
                            <div className="grid gap-4">
                                {/* Section 1: What is this? */}
                                <ExplanationCard
                                    title={content?.what.label}
                                    content={content?.what.content}
                                    isExpanded={expandedSections.what}
                                    onToggle={() => toggleSection('what')}
                                    icon={<Search className="w-5 h-5 text-blue-500" />}
                                    color="blue"
                                    onCopy={() => copyToClipboard(content?.what.content)}
                                />

                                {/* Section 2: Why does it happen? */}
                                <ExplanationCard
                                    title={content?.why.label}
                                    content={content?.why.content}
                                    isExpanded={expandedSections.why}
                                    onToggle={() => toggleSection('why')}
                                    icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                                    color="amber"
                                    onCopy={() => copyToClipboard(content?.why.content)}
                                />

                                {/* Section 3: How to resolve? */}
                                <ExplanationCard
                                    title={content?.how.label}
                                    content={content?.how.content}
                                    isExpanded={expandedSections.how}
                                    onToggle={() => toggleSection('how')}
                                    icon={<Stethoscope className="w-5 h-5 text-emerald-500" />}
                                    color="emerald"
                                    onCopy={() => copyToClipboard(content?.how.content)}
                                />

                                {/* Section 4: Medicine Alternatives (If applicable) */}
                                {content?.alternatives && content.alternatives.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                                        <button
                                            onClick={() => toggleSection('alternatives')}
                                            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600`}>
                                                    <Pill className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                    {language === 'en' ? 'Alternatives & Substitutes' : 'वैकल्पिक दवाएं (Alternatives)'}
                                                </h3>
                                            </div>
                                            {expandedSections.alternatives ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {expandedSections.alternatives && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                            {content.alternatives.map((alt, idx) => (
                                                                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{alt.name}</p>
                                                                        <p className="text-xs text-gray-500">{alt.type} • {alt.dosage}</p>
                                                                    </div>
                                                                    <a href={`https://www.1mg.com/search/all?name=${alt.name}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 font-medium hover:underline">
                                                                        Buy
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Warnings / Suggested Meds & Consult Doctor */}
                            {(result.critical_alert || content?.warnings?.length > 0 || result.meds?.length > 0) && (
                                <Card className="p-6 space-y-6">
                                    {/* Warnings / Meds Section */}
                                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-300 font-semibold">
                                            <AlertTriangle className="w-5 h-5" />
                                            {result.type === 'medicine' ? 'Safety Warnings' : 'Suggested Medicines'}
                                        </div>
                                        {result.type === 'medicine' ? (
                                            <ul className="space-y-2">
                                                {content?.warnings?.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="space-y-3">
                                                {((language === 'hi' && content?.meds) ? content.meds : result.meds)?.map((med, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-100 dark:border-amber-800 shadow-sm">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">{med.name}</p>
                                                            <p className="text-xs text-gray-500">{med.type} • {med.dosage}</p>
                                                        </div>
                                                        <a
                                                            href={`https://www.1mg.com/search/all?name=${med.name}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors"
                                                        >
                                                            Buy
                                                        </a>
                                                    </div>
                                                ))}
                                                {!result.meds?.length && <p className="text-sm text-gray-500 italic">No specific OTC medicines found. Consult a doctor.</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Comparison / Buy Now Section (For Medicines OR Conditions) */}
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                                            {result.type === 'medicine' ? 'Compare Prices & Buy' : 'Find Medicines Online'}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <a href={`https://www.1mg.com/search/all?name=${query}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600">Tata 1mg</span>
                                            </a>
                                            <a href={`https://pharmeasy.in/search/all?name=${query}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600">PharmEasy</span>
                                            </a>
                                            <a href={`https://www.netmeds.com/catalogsearch/result?q=${query}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600">Netmeds</span>
                                            </a>
                                            <a href={`https://www.apollopharmacy.in/search-medicines/${query}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600">Apollo</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                        <Button
                                            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 py-3 px-6 text-lg"
                                            onClick={() => navigate('/doctors', { state: { specialist: result.specialist || 'General Physician' } })}
                                        >
                                            Consult a {result.specialist || 'Doctor'} Now <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Critical Medical AI Guardrail */}
                            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mt-8 flex gap-3 text-left">
                                <Shield className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Safety Notice</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        This analysis is generated by AI using the medical records you uploaded. It should not replace professional medical advice. Consult a doctor before taking any medication.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Not Found State */}
                    {result && result.notFound && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6"
                        >
                            <Card className="p-6 text-center border-orange-100 bg-orange-50/50">
                                <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No verified information found</h3>
                                <p className="text-gray-500">We couldn't find verified medical data for "{query}".</p>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Camera Modal */}
                <AnimatePresence>
                    {isCameraOpen && (
                        <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Sub-component for Collapsible Cards
function ExplanationCard({ title, content, isExpanded, onToggle, icon, color, onCopy }) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
                </div>
                {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4 whitespace-pre-line">
                                {content}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    title="Copy text"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
