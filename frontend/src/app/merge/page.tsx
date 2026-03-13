"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MergePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
    const [downloadId, setDownloadId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    }, []);

    const handleMerge = async () => {
        if (files.length < 2) {
            setError("Please select at least 2 PDF files to merge.");
            return;
        }

        setStatus('uploading');
        setError(null);
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        try {
            const res = await axios.post(`${API_BASE}/merge`, formData);
            const data = res.data;

            if (data.status === 'completed' && data.output_file) {
                setStatus('done');
                setDownloadId(data.output_file);
            } else if (data.task_id) {
                setStatus('processing');
                pollStatus(data.task_id);
            } else {
                throw new Error("Unexpected API response");
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || "Failed to merge files.");
            setStatus('idle');
        }
    };

    const pollStatus = async (taskId: string) => {
        // Basic polling mechanism if Task was backgrounded
        // In our quick MVP, task always eager makes it return completed immediately
        setStatus('done');
    };

    const downloadUrl = downloadId ? `${API_BASE}/download/${downloadId}` : '#';

    return (
        <div className="flex flex-col items-center pt-8 w-full max-w-4xl mx-auto space-y-12 min-h-[60vh]">

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black">Merge PDF files</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Combine PDFs in the order you want with the easiest PDF merger available.</p>
            </div>

            <AnimatePresence mode="wait">
                {status === 'done' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full glass rounded-3xl p-12 text-center space-y-6 bg-emerald-500/10 border-emerald-500/30"
                    >
                        <div className="mx-auto w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/40">
                            <Download size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-emerald-600">PDFs have been merged!</h2>
                        <p className="text-slate-600">Your file is ready to be downloaded.</p>
                        <a href={downloadUrl} download className="inline-block px-10 py-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                            Download Merged PDF
                        </a>
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setFiles([]); setStatus('idle'); setDownloadId(null);
                                }}
                                className="text-slate-500 hover:underline text-sm font-medium"
                            >
                                Merge more files
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-8">
                        {/* Uploader */}
                        <div
                            className={`w-full h-80 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isDragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <UploadCloud className={`w-20 h-20 mb-4 transition-colors ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                            <label className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-500/30 text-lg">
                                Select PDF files
                                <input
                                    type="file" multiple accept="application/pdf" className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                    }}
                                />
                            </label>
                            <p className="mt-4 text-slate-500 font-medium">Or drop PDFs here</p>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="w-full glass rounded-3xl p-8 space-y-6">
                                <h3 className="text-xl font-bold">Selected Files ({files.length})</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-3 relative group">
                                            <button
                                                onClick={() => setFiles(f => f.filter((_, i) => i !== idx))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                                            >
                                                ×
                                            </button>
                                            <FileIcon className="w-10 h-10 text-red-500" />
                                            <span className="text-sm font-medium truncate w-full px-2" title={file.name}>{file.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-600 font-medium border border-red-500/20">{error}</div>}

                                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={handleMerge}
                                        disabled={status !== 'idle' || files.length < 2}
                                        className="px-10 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                                    >
                                        {status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {status === 'processing' && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {status === 'idle' ? 'Merge PDF' : 'Merging...'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
