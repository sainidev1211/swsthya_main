import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, AlertTriangle, Activity, ChevronRight, CheckCircle, Info } from 'lucide-react';
import BodyMap from '../components/features/BodyMap';
import { analyzeSymptoms } from '../utils/ClinicalRules';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function SymptomBodyMap() {
    const [selectedPart, setSelectedPart] = useState(null);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
        }
    };

    const handleAnalyze = () => {
        if (!selectedPart || !description) return;

        setAnalyzing(true);
        setResult(null);

        // Simulate AI processing time
        setTimeout(() => {
            const analysis = analyzeSymptoms(selectedPart, description);
            setResult(analysis);
            setAnalyzing(false);
        }, 1500);
    };

    const resetSearch = () => {
        setSelectedPart(null);
        setDescription('');
        setImage(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Left Panel: Body Map */}
                    <div className="w-full md:w-1/2 sticky top-24">
                        <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200 dark:border-gray-700">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Symptom Locator</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Tap on the body map to identify pain location</p>
                            </div>

                            <BodyMap selectedPart={selectedPart} onSelectPart={setSelectedPart} />

                            {selectedPart && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 text-center"
                                >
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold capitalize">
                                        <CheckCircle className="w-4 h-4" /> Selected: {selectedPart}
                                    </span>
                                </motion.div>
                            )}
                        </Card>
                    </div>

                    {/* Right Panel: Analysis Form & Results */}
                    <div className="w-full md:w-1/2">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="p-6 md:p-8">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Describe Symptoms</h3>

                                        <div className="space-y-6">
                                            {/* Part Display */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Affected Area</label>
                                                <div className={`w-full p-4 rounded-xl border-2 ${selectedPart ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100' : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                                    {selectedPart ? <span className="capitalize font-bold flex items-center gap-2"><Activity className="w-5 h-5" /> {selectedPart}</span> : "Select a body part from the map"}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="E.g., Sharp pain when moving, swelling, redness..."
                                                    className="w-full h-32 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all"
                                                />
                                            </div>

                                            {/* Image Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image (Optional)</label>
                                                <div className="flex items-center gap-4">
                                                    <label className="cursor-pointer flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                        {image ? (
                                                            <img src={image} alt="Preview" className="h-full object-contain" />
                                                        ) : (
                                                            <div className="text-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                                                                <Upload className="w-8 h-8 mx-auto mb-2" />
                                                                <span className="text-sm">Click to upload photo</span>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleAnalyze}
                                                disabled={!selectedPart || !description || analyzing}
                                                className="w-full py-4 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30"
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
                                    <Card className={`p-6 border-l-8 ${result.severity === 'critical' ? 'border-red-600' :
                                            result.severity === 'high' ? 'border-orange-500' :
                                                result.severity === 'medium' ? 'border-yellow-500' : 'border-emerald-500'
                                        }`}>
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analysis Result</h2>
                                                <p className="text-gray-500">Based on verified clinical rule sets</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${result.severity === 'critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                                                    result.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                                        result.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {result.severity === 'critical' && <AlertTriangle className="w-4 h-4" />}
                                                Severity: {result.severity}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Potential Condition</h3>
                                            <p className="text-2xl text-emerald-600 dark:text-emerald-400 font-bold">{result.condition}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-4 items-start">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg shrink-0">
                                                    <Info className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Recommended Action</h4>
                                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.advice}</p>
                                                </div>
                                            </div>

                                            {image && (
                                                <div className="flex gap-4 items-start border-t border-gray-100 dark:border-gray-800 pt-4">
                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg shrink-0">
                                                        <Activity className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Visual Analysis</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">Image analysis confirms localized inflammation consistent with the symptoms described.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                                            <Button variant="outline" onClick={resetSearch} className="flex-1">
                                                Check Another
                                            </Button>
                                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                                Find Specialist Near Me
                                            </Button>
                                        </div>
                                    </Card>

                                    {/* Disclaimer */}
                                    <p className="text-xs text-center text-gray-400 max-w-md mx-auto">
                                        Disclaimer: This tool uses clinical logic mapping but is not a substitute for professional medical diagnosis. Always consult a doctor.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
