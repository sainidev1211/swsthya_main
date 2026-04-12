import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import Button from '../ui/Button';

export default function ReportUploader({ onAnalyze }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (selectedFile) => {
        if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null); // No preview for PDF yet
            }
        } else {
            alert("Please upload an image or PDF report.");
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleChange}
                    />
                    <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center cursor-pointer">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Upload Report or Prescription</h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-xs">
                            Drag & drop or click to upload. Supported formats: JPG, PNG, PDF.
                        </p>
                    </label>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{file.name}</h4>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={clearFile} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {preview && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 max-h-48">
                            <img src={preview} alt="Report Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <Button onClick={() => onAnalyze(file)} className="w-full">
                        Analyze Report with AI
                    </Button>
                </div>
            )}
        </div>
    );
}
