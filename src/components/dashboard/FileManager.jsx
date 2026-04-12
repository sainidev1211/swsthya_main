import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedical } from '../../contexts/MedicalContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Upload, FileText, X, Eye, Trash2, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react';

export default function FileManager({ records }) {
    const { addRecord, deleteRecord } = useMedical();
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            for (const file of files) {
                const result = await addRecord({
                    rawFile: file,
                    type: 'Report',
                    diagnosedAt: new Date().toISOString()
                });
                if (!result.success) throw new Error(result.error || `Failed to upload ${file.name}`);
            }
            setSuccess(`Successfully uploaded ${files.length} file(s)`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            setIsDragging(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        onUpload(files);
    }, []);

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        onUpload(files);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            const result = await deleteRecord(id);
            if (!result.success) alert(result.error);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
                <Upload className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Upload Medical Data</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Area */}
                <Card 
                    className={`lg:col-span-1 p-8 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center group relative
                        ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.02]' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        multiple 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleFileInput}
                        disabled={uploading}
                    />
                    
                    <div className={`p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500 ${uploading ? 'animate-bounce' : ''}`}>
                        {uploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {uploading ? 'Uploading Documents...' : 'Drop files here'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mb-6">
                        Support for PDF, JPG, PNG. Max 10MB per file.
                    </p>
                    
                    <Button 
                        variant="primary" 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl relative z-20 pointer-events-none"
                    >
                        Select Files
                    </Button>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={14} /> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* File List */}
                <Card className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-soft overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Records</h3>
                        <span className="text-xs font-medium text-gray-400">Manage your documents</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px] no-scrollbar">
                        {records.length > 0 ? (
                            records.map((file, idx) => (
                                <motion.div 
                                    key={file._id || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-white dark:hover:bg-gray-800 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl shadow-sm ${file.file_type?.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {file.file_type?.includes('pdf') ? <FileText size={20} /> : <FileCode size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{file.file_name}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{file.file_type?.split('/')[1] || 'FILE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {file.file_url && (
                                            <a 
                                                href={file.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(file._id)}
                                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No medical files uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </section>
    );
}
