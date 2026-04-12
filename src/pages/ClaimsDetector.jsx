import { useState } from 'react';
import { Upload, ShieldCheck, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClaimsDetector() {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzing(true);
        setResult(null);

        // Simulate AI Analysis
        setTimeout(() => {
            setAnalyzing(false);
            setResult({
                status: 'verified', // or 'flagged'
                confidence: 98,
                details: [
                    { label: "Policy Coverage", status: "Match", text: "Procedure covered under Plan-A" },
                    { label: "Billing Codes", status: "Match", text: "ICD-10 codes match diagnosis" },
                    { label: "Hospital Network", status: "Verified", text: "Apollo Hospital (In-Network)" }
                ]
            });
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Claims Detector</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Upload medical bills to detect potential fraud and verify policy coverage instantly.
                </p>
            </div>

            <Card className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Medical Bill</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Drag and drop your hospital bill or insurance claim document (PDF, JPG, PNG)
                    </p>

                    <div className="relative inline-block">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
                            {analyzing ? 'Analyzing...' : 'Select Document'}
                        </Button>
                    </div>
                </div>
            </Card>

            <AnimatePresence>
                {analyzing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-600 dark:text-gray-300">Scanning document for anomalies...</span>
                        </div>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                            <div className="flex items-center gap-3">
                                {result.status === 'verified' ? (
                                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {result.status === 'verified' ? 'Claim Verified' : 'Anomalies Detected'}
                                    </h3>
                                    <p className="text-sm text-gray-500">AI Confidence: {result.confidence}%</p>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${result.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {result.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="p-6 grid gap-4">
                            {result.details.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                    <div className="flex items-center gap-3">
                                        {item.status === 'Match' || item.status === 'Verified' ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        )}
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
