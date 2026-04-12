import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Calendar,
    FileText,
    Activity,
    AlertCircle,
    Clock,
    CheckCircle2,
    ChevronRight,
    Trash2,
    Upload,
    Heart,
    Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMedical } from '../contexts/MedicalContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DoctorRecommendation from '../components/features/DoctorRecommendation';
import { generateHealthSummary, extractDataFromPrescription, generateFollowUpQuestions } from '../services/aiService';
import { Brain, Sparkles, ShieldAlert, Pill as PillIcon, CheckCircle, Info, Loader2, MessageSquareText } from 'lucide-react';

export default function HealthProfile() {
    const { user, isGuest } = useAuth();
    const navigate = useNavigate();
    const { records, analysis, setAnalysis, loading, addRecord: globalAddRecord, deleteRecord: globalDeleteRecord } = useMedical();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [preview, setPreview] = useState(null);

    // AI Intake State
    const [followUpReq, setFollowUpReq] = useState(null);
    const [followUpAnswers, setFollowUpAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        type: 'Condition',
        title: '',
        status: 'Active',
        diagnosedAt: new Date().toISOString().split('T')[0],
        duration: '',
        notes: '',
        attachments: []
    });

    const isRestricted = isGuest || !user;

    const handleGenerateAIIntelligence = async () => {
        if (records.length === 0) {
            toast.error('Add medical records first to generate intelligence.');
            return;
        }

        setAnalyzing(true);
        const toastId = toast.loading('AI is analyzing your health profile...');

        try {
            const aiData = await generateHealthSummary(records, user);

            const success = setAnalysis(aiData);

            if (success) {
                toast.success('Health Intelligence updated!', { id: toastId });
            } else {
                toast.error('Failed to save analysis locally', { id: toastId });
            }
        } catch (error) {
            console.error('AI Analysis Error:', error);
            toast.error('AI service temporarily unavailable', { id: toastId });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddRecord = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);

        // Step 1: If we haven't checked for missing data yet, ask AI
        if (!followUpReq) {
            const toastId = toast.loading('AI is reviewing your entry...');
            try {
                const aiFollowUp = await generateFollowUpQuestions(formData);
                if (aiFollowUp && !aiFollowUp.isComplete && aiFollowUp.questions && aiFollowUp.questions.length > 0) {
                    toast.dismiss(toastId);
                    setFollowUpReq(aiFollowUp);
                    setSubmitting(false);
                    return; // Stop here and show the popup
                }
                toast.dismiss(toastId);
            } catch (error) {
                console.error("AI QA Error", error);
                toast.dismiss(toastId);
                // Proceed with normal submission if AI fails
            }
        }

        // Step 2: Merge answers and submit to backend
        const finalData = { ...formData };
        if (followUpReq && followUpAnswers) {
            // Very basic merge mapping for the generated questions
            followUpReq.questions.forEach((q, idx) => {
                const answer = followUpAnswers[idx];
                if (answer) {
                    if (q.field.includes('symptom')) finalData.symptoms = [...(finalData.symptoms || []), answer];
                    else if (q.field.includes('metric') && !finalData.duration) finalData.duration = answer;
                    else if (q.field.includes('duration') && !finalData.duration) finalData.duration = answer;
                    else finalData.notes = finalData.notes ? `${finalData.notes}\nAI Q&A: ${q.questionText} -> ${answer}` : `AI Q&A: ${q.questionText} -> ${answer}`;
                }
            });
        }

        const toastId = toast.loading('Saving to secure profile...');
        try {
            const result = await globalAddRecord(finalData);

            if (result.success) {
                toast.success('Medical record added!', { id: toastId });
                setIsFormOpen(false);
                setPreview(null);
                setFollowUpReq(null);
                setFollowUpAnswers({});
                setFormData({
                    type: 'Condition', title: '', status: 'Active',
                    diagnosedAt: new Date().toISOString().split('T')[0],
                    duration: '', notes: '', attachments: []
                });
            } else {
                toast.error(result.error || 'Failed to add record', { id: toastId });
            }
        } catch (error) {
            toast.error('Connection error', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRecord = async (id) => {
        const toastId = toast.loading('Removing record...');
        const result = await globalDeleteRecord(id);
        if (result.success) {
            toast.success('Record removed', { id: toastId });
        } else {
            toast.error(result.error || 'Failed to delete', { id: toastId });
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setPreview(base64);
                setFormData(prev => ({
                    ...prev,
                    attachments: [base64],
                    rawFile: file // Store actual file for MongoDB Storage
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAIScan = async () => {
        if (!preview) return;
        setIsScanning(true);
        console.log('Starting AI Scan with preview length:', preview.length);
        const toastId = toast.loading('AI is reading the prescription...');
        try {
            const result = await extractDataFromPrescription(preview);
            console.log('AI Extraction Result:', result);
            if (result) {
                setFormData(prev => ({
                    ...prev,
                    type: result.type || prev.type,
                    title: result.title || prev.title,
                    status: result.status || prev.status,
                    diagnosedAt: result.diagnosedAt || prev.diagnosedAt,
                    duration: result.duration || prev.duration,
                    notes: result.notes || prev.notes,
                    source: 'rx'
                }));
                toast.success('Data mapped! AI will review for missing gaps.', { id: toastId });
            }
        } catch (error) {
            console.error('AI Scan Error:', error);
            if (error.message.includes("INCOMPLETE_INFO")) {
                toast.error('Could not read prescription. Please upload a clearer photo.', { id: toastId });
            } else {
                toast.error('Failed to extract information. Please try again.', { id: toastId });
            }
        } finally {
            setIsScanning(false);
        }
    };

    if (isRestricted) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-medical-50 dark:bg-medical-900/20 rounded-full flex items-center justify-center mb-6 shadow-soft">
                    <Lock className="w-10 h-10 text-medical-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Registered Users Only</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                    Personal Health Intelligence requires a secure, registered account to store your sensitive medical data locally and in the cloud.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => navigate('/signup')} size="lg" className="px-8 bg-medical-500 hover:bg-medical-600 text-white font-bold">
                        Create Account
                    </Button>
                    <Button onClick={() => navigate('/login')} variant="outline" size="lg" className="px-8 font-bold">
                        Log In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Health Intelligence
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your clinical history & prescriptions</p>
                </div>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-medical-500 hover:bg-medical-600 text-white font-bold shadow-soft flex items-center gap-2 px-6"
                >
                    <Plus size={20} /> Add Record
                </Button>
            </div>

            {/* AI Intelligence Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                            <Brain size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">AI Health Intelligence</h2>
                    </div>
                    <Button
                        onClick={handleGenerateAIIntelligence}
                        disabled={analyzing || records.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-soft flex items-center gap-2 px-6 disabled:opacity-50"
                    >
                        {analyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} /> {analysis ? 'Refresh Insights' : 'Generate Insights'}
                            </>
                        )}
                    </Button>
                </div>

                {!analysis ? (
                    <Card className="p-8 text-center bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800">
                        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unlock Your Health Insights</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Our AI engine can analyze your medical history to provide risk summaries, preventive advice, and a personalized health routine.
                        </p>
                    </Card>
                ) : (
                    <>
                        {analysis.missingDataAlert && (
                            <Card className="p-4 mb-6 border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-3 text-rose-700">
                                    <AlertCircle size={24} className="shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-sm">Action Required: Incomplete Data</h3>
                                        <p className="text-xs font-medium">{analysis.missingDataAlert}</p>
                                    </div>
                                </div>
                                <Button onClick={() => setIsFormOpen(true)} className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 shadow-soft">
                                    Add Missing Details
                                </Button>
                            </Card>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Summary & Recommendations */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="p-6 border-indigo-100 bg-indigo-50/20 shadow-soft relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Brain size={120} />
                                    </div>
                                    <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                                        <FileText size={20} /> Executive Summary
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium relative z-10">
                                        {analysis.summary}
                                    </p>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Calendar size={20} className="text-medical-500" /> Health History Timeline (AI Derived)
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.timeline?.map((item, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{item.disease}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold">
                                                    <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === 'Active' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.status}</span>
                                                    <span className="text-gray-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">{item.dateAdded}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!analysis.timeline || analysis.timeline.length === 0) && (
                                            <p className="text-xs text-gray-400 italic text-center py-2">No timeline data available</p>
                                        )}
                                    </div>
                                </Card>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="p-6 border-emerald-100 bg-emerald-50/20">
                                        <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200 mb-4 flex items-center gap-2">
                                            <CheckCircle size={20} /> Preventive Advice
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.preventiveAdvice.map((advice, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                    {advice}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>

                                    <Card className="p-6 border-blue-100 bg-blue-50/20">
                                        <h3 className="text-lg font-black text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                                            <PillIcon size={20} /> Extracted Medications
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.extractedMedicines.map((med, i) => (
                                                <div key={i} className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-bold text-blue-700 flex flex-col">
                                                    <span>{med.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{med.purpose}</span>
                                                </div>
                                            ))}
                                            {analysis.extractedMedicines.length === 0 && (
                                                <p className="text-xs text-gray-400 italic">No specific meds identified</p>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Risk & Appointment Advisory */}
                            <div className="space-y-6">
                                <DoctorRecommendation />
                                <Card className="p-6">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Brain size={20} className="text-indigo-500" /> Treatment Guidance
                                    </h3>
                                    <div className="space-y-3 text-sm font-medium">
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 font-bold flex items-center gap-2"><PillIcon size={14} /> Medicine Action</span>
                                            <span className="text-gray-900 dark:text-white capitalize">{analysis.treatmentGuidance?.medicineActions || 'None'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={14} /> Consultation Needed</span>
                                            <span className="text-gray-900 dark:text-white">{analysis.treatmentGuidance?.consultationNeeded || 'No'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 font-bold flex items-center gap-2"><ShieldAlert size={14} /> Suggested Specialist</span>
                                            <span className="text-gray-900 dark:text-white">{analysis.treatmentGuidance?.suggestedSpecialist || 'None'}</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <ShieldAlert size={20} /> Key Observations
                                    </h3>
                                    <div className="space-y-4">
                                        {analysis.risks.map((risk, i) => (
                                            <div key={i} className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{risk.condition}</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${risk.level === 'critical' ? 'bg-rose-100 text-rose-700' :
                                                        risk.level === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            risk.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {risk.level}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-tight">
                                                    {risk.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

            {/* Timeline View Header */}
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Medical History Timeline</h2>
                <p className="text-gray-500 text-sm font-medium">A chronological view of your conditions and prescriptions</p>
            </div>
            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 text-center text-gray-400 font-medium italic">Scanning your history...</div>
                ) : records.length === 0 ? (
                    <Card className="p-12 text-center glass-card">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                            <Activity className="text-gray-300 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your timeline is empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                            Start building your digital health profile by adding conditions, allergies, or prescriptions.
                        </p>
                    </Card>
                ) : (
                    <div className="relative pl-8 md:pl-12 space-y-8">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-medical-500 via-gray-200 to-transparent"></div>

                        {records.map((record, index) => (
                            <motion.div
                                key={record._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {/* Timeline Dot */}
                                <div className={`absolute -left-8 md:-left-12 top-6 w-8 h-8 md:w-12 md:h-12 rounded-full border-4 border-white dark:border-gray-950 flex items-center justify-center shadow-soft z-10
                                    ${record.type === 'Condition' ? 'bg-medical-500' :
                                        record.type === 'Prescription' ? 'bg-blue-500' :
                                            record.type === 'Allergy' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                >
                                    {record.type === 'Condition' ? <Activity size={18} className="text-white" /> :
                                        record.type === 'Prescription' ? <FileText size={18} className="text-white" /> :
                                            record.type === 'Allergy' ? <AlertCircle size={18} className="text-white" /> : <Clock size={18} className="text-white" />}
                                </div>

                                <Card className="p-6 md:p-8 glass-card group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                    ${record.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {record.status}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(record.diagnosedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{record.title}</h3>
                                            {record.duration && (
                                                <p className="text-xs font-bold text-medical-600 mb-4 flex items-center gap-1">
                                                    <Clock size={12} /> Duration: {record.duration}
                                                </p>
                                            )}
                                            {record.notes && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl italic border border-gray-100 dark:border-gray-700">
                                                    "{record.notes}"
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteRecord(record._id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFormOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-premium overflow-hidden z-10 relative border border-white/20"
                        >
                            <form onSubmit={handleAddRecord} className="flex flex-col h-full max-h-[90vh]">
                                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-medical-50/30 dark:bg-medical-900/10">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Add Health Event</h2>
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <ChevronRight size={24} className="rotate-90" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto space-y-6 flex-1 no-scrollbar">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Event Type</label>
                                            <select
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-medical-500 font-bold"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option>Condition</option>
                                                <option>Prescription</option>
                                                <option>Allergy</option>
                                                <option>Symptom</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Title / Name</label>
                                            <input
                                                required
                                                placeholder="e.g., Hypertension"
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-medical-500 font-bold"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Diagnosis Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-medical-500 font-bold"
                                                value={formData.diagnosedAt}
                                                onChange={(e) => setFormData({ ...formData, diagnosedAt: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Current Status</label>
                                            <select
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-medical-500 font-bold"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option>Active</option>
                                                <option>Recovered</option>
                                                <option>Recurring</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Duration (Optional)</label>
                                        <input
                                            placeholder="e.g., 2 Weeks, 5 Years..."
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-medical-500 font-bold"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Observations / Notes</label>
                                        <textarea
                                            rows="3"
                                            placeholder="Add specific details, medications prescribed, or triggers..."
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-medical-500 font-bold resize-none shadow-inner"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>

                                    <div
                                        onClick={() => document.getElementById('medical-upload').click()}
                                        className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group relative overflow-hidden"
                                    >
                                        <input
                                            id="medical-upload"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        {preview ? (
                                            <div className="space-y-4">
                                                {preview.startsWith('data:image') ? (
                                                    <img src={preview} alt="Upload" className="h-32 mx-auto rounded-xl object-cover shadow-md" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FileText className="w-12 h-12 text-blue-500" />
                                                        <span className="text-xs font-bold text-gray-500">Document Selected</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-center gap-4">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAIScan();
                                                        }}
                                                        disabled={isScanning}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-indigo-500/20"
                                                    >
                                                        {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="mr-2" />}
                                                        Scan with AI
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto text-gray-400 group-hover:text-medical-500 transition-colors mb-2" size={32} />
                                                <p className="text-xs font-bold text-gray-500">Upload Prescription PDF or Image</p>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Medical Intelligence Engine will scan this</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 py-4 rounded-2xl font-bold"
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-4 rounded-2xl bg-medical-500 hover:bg-medical-600 text-white font-bold shadow-soft"
                                    >
                                        {submitting ? 'Scanning...' : 'Sync Profile'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>

                        {/* AI Follow-Up Popup Overlay */}
                        <AnimatePresence>
                            {followUpReq && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center p-4"
                                >
                                    <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm rounded-[2.5rem]" />
                                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-indigo-100 dark:border-indigo-900/50">
                                        <div className="bg-indigo-600 text-white p-6 flex flex-col items-center text-center">
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                                <Brain size={32} />
                                            </div>
                                            <h3 className="text-xl font-black">AI Profile Builder</h3>
                                            <p className="text-indigo-100 text-sm mt-1">We need a bit more detail to accurately analyze your health timeline.</p>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {followUpReq.questions?.map((q, idx) => (
                                                <div key={idx} className="space-y-3">
                                                    <label className="flex items-start gap-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        <MessageSquareText size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                                                        {q.questionText}
                                                    </label>
                                                    <input
                                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-400"
                                                        placeholder="Type your answer here..."
                                                        value={followUpAnswers[idx] || ''}
                                                        onChange={(e) => setFollowUpAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setFollowUpReq(null);
                                                    setFollowUpAnswers({});
                                                    // Immediately trigger a force-save ignoring AI completeness
                                                    handleAddRecord(null);
                                                }}
                                                className="flex-1 rounded-xl text-sm font-bold"
                                            >
                                                Skip
                                            </Button>
                                            <Button
                                                onClick={() => handleAddRecord(null)}
                                                disabled={submitting}
                                                className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                            >
                                                {submitting ? 'Saving...' : 'Finish & Save'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
