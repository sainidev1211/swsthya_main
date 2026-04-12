import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/config';

const FileUpload = ({ onUploadSuccess, label = "Upload File", accept = "image/*,application/pdf", maxSizeMB = 5 }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const selectedFile = e.dataTransfer.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        setError(null);
        if (!selectedFile) return;

        // Validation
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds ${maxSizeMB}MB limit.`);
            return;
        }

        // Preview
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE_URL}/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    onUploadSuccess(response);
                    setUploading(false);
                } else {
                    setError('Upload failed. Please try again.');
                    setUploading(false);
                }
            };

            xhr.onerror = () => {
                setError('Network error. Check connection.');
                setUploading(false);
            };

            xhr.send(formData);
        } catch (err) {
            setError('An error occurred during upload.');
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 text-sm"
                    >
                        <FiAlertCircle /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 rounded-xl p-8 cursor-pointer transition-all flex flex-col items-center justify-center text-center group bg-white"
                >
                    <div className="bg-teal-100 text-teal-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <FiUploadCloud size={24} />
                    </div>
                    <h3 className="text-slate-700 font-semibold mb-1">{label}</h3>
                    <p className="text-xs text-slate-400">
                        Drag & Drop or Click to Select <br />
                        (Max {maxSizeMB}MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 flex gap-4 items-center relative">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                        ) : (
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <FiFile size={24} />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            {uploading && (
                                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-teal-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {!uploading && (
                            <button
                                onClick={clearFile}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <FiX size={18} />
                            </button>
                        )}
                    </div>

                    {!uploading && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleUpload}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiUploadCloud /> Upload Now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
