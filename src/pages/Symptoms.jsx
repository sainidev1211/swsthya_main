import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, AlertTriangle, Activity, ChevronRight, CheckCircle, Info, FileText } from 'lucide-react';
import BodyMap from '../components/features/BodyMap';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PersonalSafetyBadge from '../components/features/PersonalSafetyBadge';

import { analyzeSymptomsWithAI } from '../services/aiService';
import { saveUploadRecord } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useMedical } from '../contexts/MedicalContext';

import { useNavigate } from 'react-router-dom';

export default function Symptoms() {
    const { user } = useAuth();
    const { records } = useMedical();
    const navigate = useNavigate();
    const [selectedParts, setSelectedParts] = useState([]);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile({
                    type: uploadedFile.type.startsWith('image/') ? 'image' : 'pdf',
                    url: URL.createObjectURL(uploadedFile),
                    name: uploadedFile.name,
                    base64: reader.result
                });
            };
            reader.readAsDataURL(uploadedFile);
        }
    };

    const handleAnalyze = async () => {
        if ((selectedParts.length === 0 && !description && !file)) return;

        setAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            let analysis;
            if (file && file.base64 && file.type === 'image') {
                // Pass empty array for records as the badge handles safety now
                analysis = await analyzeSymptomsWithAI(selectedParts, description, file.base64, records);
            } else {
                analysis = await analyzeSymptomsWithAI(selectedParts, description, null, records);
            }

            if (analysis) {
                setResult({
                    ...analysis,
                    messages: [] // Init chat
                });

                // Save to MongoDB if a file was uploaded
                if (file && user) {
                    try {
                        const userId = user.id || user.uid || user.email; // Use whatever uniquely identifies them
                        await saveUploadRecord({
                            fileName: file.name,
                            fileType: file.type,
                            fileUrl: file.base64 || 'local_file_url', // Consider using actual cloud storage in production
                            userId: userId,
                            metadata: { analysis_result: analysis.condition }
                        });
                    } catch (uploadObjErr) {
                        console.error('Failed to save upload record', uploadObjErr);
                    }
                }
            } else {
                throw new Error("Received empty response from AI services");
            }
        } catch (err) {
            console.error(err);
            setError("AI service temporarily unavailable. Please try again later.");
        } finally {
            setAnalyzing(false);
        }
    };

    const resetSearch = () => {
        setSelectedParts([]);
        setDescription('');
        setFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-24 md:pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Symptoms & Allergies Checker</h1>
                    <p className="text-gray-500 dark:text-gray-400">Identify pain points, skin rashes, or allergy symptoms using our interactive body map.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Left Panel: Body Map */}
                    <div className="w-full md:w-1/2 md:sticky md:top-24">
                        <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl shadow-emerald-900/5">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Body Map</h2>
                                    <p className="text-xs text-gray-500">Front/Back View • Select Area</p>
                                </div>
                                {selectedParts.length > 0 && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold capitalize animate-pulse">
                                        <CheckCircle className="w-3 h-3" /> {selectedParts.length} Selected
                                    </span>
                                )}
                            </div>

                            <BodyMap selectedParts={selectedParts} onSelectPart={setSelectedParts} />

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex gap-3">
                                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    <strong>Tip:</strong> For skin allergies or rashes, select the affected area or "Skin" if generalized. Uploading a clear photo helps the AI (Simulation) analyze better.
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Right Panel: Analysis Form & Results */}
                    <div className="w-full md:w-1/2">
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl shadow-lg"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        <h3 className="text-lg font-bold text-red-700 dark:text-red-300">Analysis Failed</h3>
                                    </div>
                                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                    <Button onClick={handleAnalyze} className="bg-red-600 hover:bg-red-700 text-white w-full">
                                        Retry Analysis
                                    </Button>
                                </motion.div>
                            ) : !result ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="p-6 md:p-8 border-t-8 border-t-emerald-500 shadow-2xl">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Activity className="w-6 h-6 text-emerald-500" />
                                            Describe Condition
                                        </h3>

                                        <div className="space-y-6">
                                            {/* Part Display */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">1. Affected Areas</label>
                                                <div
                                                    className={`w-full p-4 rounded-xl border-2 transition-all ${selectedParts.length > 0 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100' : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:border-emerald-300 cursor-pointer'}`}
                                                    onClick={() => selectedParts.length === 0 && document.querySelector('svg')?.scrollIntoView({ behavior: 'smooth' })}
                                                >
                                                    {selectedParts.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedParts.map(part => (
                                                                <span key={part} className="capitalize font-bold flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm text-sm">
                                                                    <CheckCircle className="w-3 h-3 text-emerald-500" /> {part}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="w-5 h-5" />
                                                            <span>Tap body parts on the map to select</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">2. Symptoms / Allergies</label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Describe the pain, itchiness, redness, triggers, etc..."
                                                    className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all font-medium text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            {/* File Upload */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">3. Upload Photo or Report (PDF)</label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                    Attach clear photos of skin issues (rashes, inflammation) or medical documents (lab reports, prescriptions) to help the AI analysis.
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <label className="cursor-pointer flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group overflow-hidden relative">
                                                        <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
                                                        {file ? (
                                                            file.type === 'image' ? (
                                                                <img src={file.url} alt="Preview" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="text-center text-emerald-600">
                                                                    <FileText className="w-10 h-10 mx-auto mb-2" />
                                                                    <span className="font-bold">{file.name}</span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="text-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                                                                <Upload className="w-8 h-8 mx-auto mb-2" />
                                                                <span className="text-sm font-medium">Click to upload Photo or PDF</span>
                                                            </div>
                                                        )}
                                                        {file && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-xs font-bold uppercase">Change File</span>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleAnalyze}
                                                disabled={(!selectedParts.length && !description && !file) || analyzing}
                                                className={`w-full py-4 text-lg font-bold shadow-xl transition-all ${(!selectedParts.length && !description && !file)
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-emerald-500/40 transform hover:-translate-y-1'
                                                    }`}
                                            >
                                                {analyzing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Analyzing Clinical Data...
                                                    </div>
                                                ) : (
                                                    <>Run Clinical Analysis <ChevronRight className="w-5 h-5" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <SearchResults result={result} resetSearch={resetSearch} user={user} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SearchResults({ result, resetSearch, user }) {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [asking, setAsking] = useState(false);

    const handleAsk = async () => {
        if (!question.trim()) return;

        const newHistory = [...chatHistory, { role: 'user', content: question }];
        setChatHistory(newHistory);
        setQuestion('');
        setAsking(true);

        try {
            // Use the simpler chat function for Q&A context
            const response = await analyzeSymptomsWithAI([], `Context: ${result.summary_en}. User Question: ${question}. Answer briefly.`);
            setChatHistory([...newHistory, { role: 'assistant', content: response.advice || response.condition }]); // Reuse advice field for chat response shim
        } catch (e) {
            setChatHistory([...newHistory, { role: 'assistant', content: "Sorry, I couldn't fetch an answer right now." }]);
        } finally {
            setAsking(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className={`p-6 border-l-8 ${result.severity === 'critical' ? 'border-red-600' :
                result.severity === 'high' ? 'border-orange-500' :
                    result.severity === 'medium' ? 'border-yellow-500' : 'border-emerald-500'
                } shadow-2xl`}>

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analysis Result</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setLang('en')} className={`text-xs px-2 py-1 rounded ${lang === 'en' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>English</button>
                            <button onClick={() => setLang('hi')} className={`text-xs px-2 py-1 rounded ${lang === 'hi' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>Hindi</button>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${result.severity === 'critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                        result.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            result.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        Severity: {result.severity}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Condition</h3>
                    <p className="text-3xl text-emerald-600 dark:text-emerald-400 font-bold mb-4">{result.condition}</p>
                    {user && result.condition && (
                        <div className="mb-4">
                            <PersonalSafetyBadge productName={result.condition} type="symptom" />
                        </div>
                    )}
                    <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                        {lang === 'en' ? result.summary_en : result.summary_hi}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Medicines */}
                    {result.medicines && result.medicines.length > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Recommended Medicines
                            </h4>
                            <ul className="space-y-2 mb-3">
                                {result.medicines.map((med, idx) => (
                                    <li key={idx} className="text-sm text-blue-700 dark:text-blue-200">• {med}</li>
                                ))}
                            </ul>
                            <a
                                href={`https://www.1mg.com/search/all?name=${result.medicines[0]}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold"
                            >
                                Buy Medicine Online
                            </a>
                        </div>
                    )}

                    {/* Specialist */}
                    <div className="flex gap-4 items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                        <div>
                            <h4 className="font-bold text-purple-900 dark:text-purple-100">Consult a Specialist</h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Recommended: {result.specialist}</p>
                        </div>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                            onClick={() => navigate('/doctors', { state: { specialist: result.specialist } })}
                        >
                            Book {result.specialist}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Q&A Chat */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ask about this report</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., Is this serious?"
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Button onClick={handleAsk} disabled={asking} className="bg-emerald-600 text-white px-4">
                        {asking ? '...' : 'Ask'}
                    </Button>
                </div>
            </Card>

            <Button variant="outline" onClick={resetSearch} className="w-full py-4 text-gray-500">
                Start New Analysis
            </Button>
        </div>
    );
}
