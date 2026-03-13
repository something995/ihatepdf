"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PdfToJpgPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
    const [downloads, setDownloads] = useState<string[]>([]);
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

    const handleConvert = async () => {
        if (!file) {
            setError("Please select a valid PDF file.");
            return;
        }

        setStatus('uploading');
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE}/convert/pdf-to-jpg`, formData);
            const data = res.data;

            if (data.status === 'completed' && data.output_files) {
                setStatus('done');
                setDownloads(data.output_files);
            } else if (data.task_id) {
                setStatus('processing');
            } else {
                throw new Error("Unexpected API response");
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || "Failed to convert file.");
            setStatus('idle');
        }
    };

    return (
        <div className="flex flex-col items-center pt-8 w-full max-w-4xl mx-auto space-y-12 min-h-[60vh]">

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black">Convert PDF to JPG</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Extract all pages from a PDF to high-quality JPG image files instantly.</p>
            </div>

            <AnimatePresence mode="wait">
                {status === 'done' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full glass rounded-3xl p-12 text-center space-y-8 bg-yellow-500/5 border-yellow-500/20"
                    >
                        <div className="mx-auto w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-yellow-500/40">
                            <ImageIcon size={36} />
                        </div>
                        <h2 className="text-3xl font-bold text-yellow-600">Converted Successfully!</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                            {downloads.map((f, i) => (
                                <a key={i} href={`${API_BASE}/download/${f}`} download className="group relative glass p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition border border-transparent hover:border-yellow-200">
                                    <Download className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold text-sm">Page {i + 1} JPG</span>
                                </a>
                            ))}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    setFile(null); setStatus('idle'); setDownloads([]);
                                }}
                                className="px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 font-bold hover:bg-slate-300 transition"
                            >
                                Convert another file
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-8">
                        <div
                            className={`w-full h-80 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isDragOver ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                } ${file ? 'border-solid bg-slate-100 hover:bg-slate-100' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            {!file ? (
                                <>
                                    <UploadCloud className={`w-20 h-20 mb-4 transition-colors ${isDragOver ? 'text-yellow-500' : 'text-slate-400'}`} />
                                    <label className="px-8 py-4 rounded-full bg-yellow-500 text-white font-bold hover:bg-yellow-600 transition cursor-pointer shadow-lg shadow-yellow-500/30 text-lg">
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
                                <div className="flex flex-col items-center gap-6">
                                    <FileIcon className="w-24 h-24 text-yellow-500" />
                                    <h3 className="text-2xl font-bold truncate max-w-xs">{file.name}</h3>
                                    <button onClick={() => setFile(null)} className="text-red-500 font-bold hover:underline">Remove file</button>
                                </div>
                            )}
                        </div>

                        {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-600 font-medium border border-red-500/20">{error}</div>}

                        {file && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleConvert}
                                    disabled={status !== 'idle'}
                                    className="px-12 py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3"
                                >
                                    {status !== 'idle' && <Loader2 className="w-6 h-6 animate-spin" />}
                                    {status === 'idle' ? 'Convert to JPG' : 'Converting...'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
