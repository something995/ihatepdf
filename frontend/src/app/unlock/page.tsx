"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, Loader2, Download, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function UnlockPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
    const [downloadId, setDownloadId] = useState<string | null>(null);
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

    const handleUnlock = async () => {
        if (!file) {
            setError("Please select a valid PDF file.");
            return;
        }
        if (!password) {
            setError("Please provide the original password to unlock.");
            return;
        }

        setStatus('uploading');
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        try {
            const res = await axios.post(`${API_BASE}/unlock`, formData);
            const data = res.data;

            if (data.status === 'completed' && data.output_file) {
                setStatus('done');
                setDownloadId(data.output_file);
            } else if (data.status === 'error') {
                setError(data.message || "Incorrect password.");
                setStatus('idle');
            } else {
                throw new Error("Unexpected API response");
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || "Failed to unlock file. Ensure the password is correct.");
            setStatus('idle');
        }
    };

    const downloadUrl = downloadId ? `${API_BASE}/download/${downloadId}` : '#';

    return (
        <div className="flex flex-col items-center pt-8 w-full max-w-4xl mx-auto space-y-12 min-h-[60vh]">

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black">Unlock PDF</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Remove PDF password security, giving you atomic freedom to use your PDFs as you want.</p>
            </div>

            <AnimatePresence mode="wait">
                {status === 'done' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full glass rounded-3xl p-12 text-center space-y-6 bg-pink-500/10 border-pink-500/30"
                    >
                        <div className="mx-auto w-24 h-24 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-pink-500/40">
                            <Download size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-pink-600">PDF Unlocked!</h2>
                        <p className="text-slate-600">The security constraints have been permanently removed.</p>
                        <a href={downloadUrl} download className="inline-block px-10 py-5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                            Download Unlocked PDF
                        </a>
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setFile(null); setPassword(''); setStatus('idle'); setDownloadId(null);
                                }}
                                className="text-slate-500 hover:underline text-sm font-medium"
                            >
                                Unlock another file
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-8">
                        <div
                            className={`w-full h-80 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isDragOver ? 'border-pink-500 bg-pink-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                } ${file ? 'border-solid bg-slate-100 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            {!file ? (
                                <>
                                    <UploadCloud className={`w-20 h-20 mb-4 transition-colors ${isDragOver ? 'text-pink-500' : 'text-slate-400'}`} />
                                    <label className="px-8 py-4 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 transition cursor-pointer shadow-lg shadow-pink-500/30 text-lg">
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
                                        <FileIcon className="w-16 h-16 text-pink-500" />
                                        <h3 className="text-xl font-bold truncate max-w-xs">{file.name}</h3>
                                    </div>

                                    <div className="w-full relative">
                                        <Unlock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            placeholder="Enter the document's password..."
                                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-shadow"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    <button onClick={() => { setFile(null); setPassword('') }} className="text-red-500 font-bold hover:underline">Remove file</button>
                                </div>
                            )}
                        </div>

                        {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-600 font-medium border border-red-500/20">{error}</div>}

                        {file && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleUnlock}
                                    disabled={status !== 'idle' || !password}
                                    className="px-12 py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3"
                                >
                                    {status !== 'idle' && <Loader2 className="w-6 h-6 animate-spin" />}
                                    {status === 'idle' ? 'Remove Encryption' : 'Unlocking...'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
