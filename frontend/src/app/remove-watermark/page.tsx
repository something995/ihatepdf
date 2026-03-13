"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, Loader2, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RemoveWatermarkPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
    const [downloadId, setDownloadId] = useState<string | null>(null);
    const [detectedText, setDetectedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            }
        }
    }, []);

    const handleRemove = async () => {
        if (!file) {
            setError("Please select a valid PDF file.");
            return;
        }

        setStatus('uploading');
        setError(null);
        setDetectedText(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE}/remove-watermark`, formData);
            const data = res.data;

            if (data.status === 'completed' && data.output_file) {
                setStatus('done');
                setDownloadId(data.output_file);
                setDetectedText(data.detected);
            } else {
                throw new Error("Unexpected API response");
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || "Failed to intelligently scrub watermark.");
            setStatus('idle');
        }
    };

    const downloadUrl = downloadId ? `${API_BASE}/download/${downloadId}` : '#';

    return (
        <div className="flex flex-col items-center pt-8 w-full max-w-4xl mx-auto space-y-12 min-h-[60vh]">

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black">AI Watermark Remover</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Automatically detects and strips textual watermarks without mangling the actual document text.</p>
            </div>

            <AnimatePresence mode="wait">
                {status === 'done' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full glass rounded-3xl p-12 text-center space-y-6 bg-purple-500/10 border-purple-500/30"
                    >
                        <div className="mx-auto w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-500/40">
                            <Download size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-purple-600">Document Scrubbed Successfully!</h2>
                        {detectedText && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-purple-500/30 shadow-sm text-sm font-semibold text-purple-700 dark:text-purple-400">
                                <Sparkles size={16} />
                                Detected and erased: {"'"} {detectedText} {"'"}
                            </div>
                        )}
                        <p className="text-slate-600">Your layout, images, and text have all been preserved flawlessly.</p>
                        <a href={downloadUrl} download className="inline-block px-10 py-5 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 mt-4">
                            Download Clean PDF
                        </a>
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setFile(null); setStatus('idle'); setDownloadId(null); setDetectedText(null);
                                }}
                                className="text-slate-500 hover:underline text-sm font-medium"
                            >
                                Clean another file
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-8">
                        <div
                            className={`w-full h-80 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isDragOver ? 'border-purple-500 bg-purple-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                } ${file ? 'border-solid bg-slate-100 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            {!file ? (
                                <>
                                    <UploadCloud className={`w-20 h-20 mb-4 transition-colors ${isDragOver ? 'text-purple-500' : 'text-slate-400'}`} />
                                    <label className="px-8 py-4 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition cursor-pointer shadow-lg shadow-purple-500/30 text-lg">
                                        Select PDF file
                                        <input
                                            type="file" accept="application/pdf" className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
                                            }}
                                        />
                                    </label>
                                    <p className="mt-4 text-slate-500 font-medium">Or drop PDF here</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center w-full max-w-sm gap-6 p-4">
                                    <div className="flex items-center gap-4">
                                        <FileIcon className="w-16 h-16 text-purple-500" />
                                        <h3 className="text-xl font-bold truncate max-w-xs">{file.name}</h3>
                                    </div>

                                    <p className="text-center text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-4 py-3 rounded-xl border border-purple-500/20">
                                        Our algorithm will automatically detect the watermark span and strip it from the bytecode natively.
                                    </p>

                                    <button onClick={() => setFile(null)} className="text-red-500 font-bold hover:underline">Remove file</button>
                                </div>
                            )}
                        </div>

                        {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-600 font-medium border border-red-500/20">{error}</div>}

                        {file && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleRemove}
                                    disabled={status !== 'idle'}
                                    className="px-12 py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3"
                                >
                                    {status !== 'idle' && <Loader2 className="w-6 h-6 animate-spin" />}
                                    {status === 'idle' ? 'Remove Implicitly' : 'Analyzing & Scrubbing...'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
