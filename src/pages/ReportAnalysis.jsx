import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, AlertTriangle, CheckCircle, Loader2, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUpload from '../components/ui/FileUpload';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { analyzeReportWithAI, extractTextFromImage, cleanMedicalText } from '../services/aiService';

import { useAuth } from '../contexts/AuthContext';
import { useMedical } from '../contexts/MedicalContext';

export default function ReportAnalysis() {
    const { user } = useAuth();
    const { addRecord } = useMedical();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('lab'); // 'lab' | 'prescription'
    const [error, setError] = useState(null);

    const handleUploadSuccess = async (response) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setStatus('Processing request...');

        const fileUrl = `http://localhost:5001${response.file.path}`;

        try {
            // Step 1: OCR
            setStatus('Extracting text from document (OCR)...');
            const rawText = await extractTextFromImage(fileUrl);
            const text = cleanMedicalText(rawText);
            console.log("OCR Extracted Text:", text);

            if (!text || text.length < 30) {
                throw new Error("INCOMPLETE_INFO: Could not extract enough readable text from the image. Please ensure the image is clear and contains medical details.");
            }

            // Step 2: AI Analysis
            setStatus('AI analyzing extracted medical data...');
            const aiData = await analyzeReportWithAI(text);
            // const aiData = {}; // Mock for now

            // Normalize data structure
            const normalizedData = {
                type: aiData.type || (activeTab === 'lab' ? 'Lab Report' : 'Prescription'),
                summary: aiData.summary || "No summary available.",
                patientInfo: aiData.patientInfo || { name: 'Not specified', age: 'Not specified' },
                vitals: aiData.vitals || { bp: 'Not specified', pulse: 'Not specified' },
                symptoms: aiData.symptoms || [],
                diagnosis: aiData.diagnosis || "Not specified",
                keyFindings: aiData.keyFindings || [],
                advice: aiData.advice || [],
                specialist: aiData.specialist || "General Physician",
                doctor: aiData.doctor || "Not specified",
                date: new Date().toLocaleDateString(),
                medicines: aiData.medicines || [],
                instructions: aiData.instructions || "Follow doctor's advice."
            };

            setResult(normalizedData);

            if (user && !user.isGuest) {
                setStatus('Saving to your health profile...');
                const dbRecord = {
                    type: normalizedData.type,
                    title: normalizedData.diagnosis && normalizedData.diagnosis !== 'Not specified' ? normalizedData.diagnosis : `${normalizedData.type} - ${new Date().toLocaleDateString()}`,
                    status: 'Active',
                    diagnosedAt: new Date().toISOString().split('T')[0],
                    disease: normalizedData.diagnosis !== 'Not specified' ? normalizedData.diagnosis : 'Unknown',
                    symptoms: Array.isArray(normalizedData.symptoms) ? normalizedData.symptoms : [],
                    medication: Array.isArray(normalizedData.medicines) ? normalizedData.medicines.map(m => `${m.name} ${m.dosage || ''} ${m.freq || ''}`.trim()).join(', ') : '',
                    doctorConsulted: normalizedData.doctor !== 'Not specified' ? normalizedData.doctor : '',
                    notes: normalizedData.summary,
                    source: 'Upload Analysis'
                };
                
                await addRecord(dbRecord);
                setStatus('Processed Data auto-saved to database.');
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes("INCOMPLETE_INFO")) {
                setError("Failed to extract information: The document text is unclear or too short. Please upload a clear photo of the full prescription.");
            } else {
                setError(err.message || "Failed to analyze report.");
            }
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Medical Report AI Summarizer</h1>
                <p className="text-gray-500 dark:text-gray-400">Upload your lab reports or prescriptions for instant AI-powered analysis.</p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex justify-center gap-4">
                <TabButton
                    active={activeTab === 'lab'}
                    onClick={() => { setActiveTab('lab'); setResult(null); }}
                    icon={<Activity className="w-4 h-4" />}
                    label="Lab Report"
                />
                <TabButton
                    active={activeTab === 'prescription'}
                    onClick={() => { setActiveTab('prescription'); setResult(null); }}
                    icon={<FileText className="w-4 h-4" />}
                    label="Prescription"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Upload Section */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                        Upload {activeTab === 'lab' ? 'Report' : 'Prescription'}
                    </h3>

                    <FileUpload
                        onUploadSuccess={handleUploadSuccess}
                        label={`Upload ${activeTab === 'lab' ? 'Lab Report' : 'Prescription'}`}
                        accept="image/*"
                    />

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                </Card>

                {/* Processing State */}
                {loading && (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Analyzing...</h3>
                        <p className="text-sm text-gray-500">{status}</p>
                    </div>
                )}

                {/* Results Section */}
                {result && !loading && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card className="p-6 border-teal-500 border-t-4">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded">AI Analysis</span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{result.type} Summary</h3>
                                </div>
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>

                            <div className="space-y-6">
                                {/* Summary */}
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">AI Medical Interpretation</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                        {result.summary}
                                    </p>
                                </div>

                                {/* Patient & Vitals Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Patient Info</h4>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Name: {result.patientInfo.name}</p>
                                        <p className="text-xs text-gray-500">Age: {result.patientInfo.age}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Vitals</h4>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">BP: {result.vitals.bp}</p>
                                        <p className="text-xs text-gray-500">Pulse: {result.vitals.pulse}</p>
                                    </div>
                                </div>

                                {/* Symptoms & Diagnosis */}
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">Diagnosis</h4>
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{result.diagnosis}</p>
                                    </div>

                                    {result.symptoms.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Reported Symptoms</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.symptoms.map((s, i) => (
                                                    <span key={i} className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Key Findings */}
                                {result.keyFindings.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Findings</h4>
                                        <div className="space-y-2">
                                            {result.keyFindings.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                                                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                                                        <StatusTag status={item.status} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Medicines */}
                                {result.medicines.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Extracted Medicines</h4>
                                        <div className="space-y-3">
                                            {result.medicines.map((med, i) => (
                                                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white mb-2">{med.name}</p>
                                                        {user && med.name && (
                                                            <div className="mb-2">
                                                                <PersonalSafetyBadge productName={med.name} type="medicine" />
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-500">{med.dosage}</p>
                                                    </div>
                                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                                        {med.freq}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Instructions */}
                                {result.instructions && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-sm flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4" /> Instructions
                                        </h4>
                                        <p className="text-sm text-yellow-900/80 dark:text-yellow-400/80">
                                            {result.instructions}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Consult Action */}
                            {result.specialist && (
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <Button
                                        className="w-full py-4 text-lg shadow-xl shadow-teal-500/20"
                                        onClick={() => navigate('/doctors', { state: { specialist: result.specialist } })}
                                    >
                                        <Stethoscope className="w-5 h-5 mr-2" />
                                        Consult a {result.specialist} Now
                                    </Button>
                                    <p className="text-center text-xs text-gray-400 mt-2">
                                        Based on your report analysis.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </div >
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${active
                ? 'bg-gray-900 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function StatusTag({ status }) {
    const styles = {
        high: 'bg-red-100 text-red-700',
        borderline: 'bg-yellow-100 text-yellow-700',
        normal: 'bg-green-100 text-green-700'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${styles[status]}`}>
            {status}
        </span>
    );
}
