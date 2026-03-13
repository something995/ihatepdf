"use client";

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="container mx-auto px-6 py-4 flex flex-row items-center justify-between">
                <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
                    ihatepdf
                </Link>
                <div className="hidden md:flex gap-6 items-center flex-wrap font-semibold text-sm">
                    <Link href="/merge" className="hover:text-blue-600 transition-colors">Merge PDF</Link>
                    <Link href="/split" className="hover:text-blue-600 transition-colors">Split PDF</Link>
                    <Link href="/compress" className="hover:text-emerald-500 transition-colors">Compress</Link>
                    <Link href="/pdf-to-word" className="hover:text-amber-500 transition-colors">PDF to Word</Link>
                    <Link href="/pdf-to-jpg" className="hover:text-yellow-500 transition-colors">PDF to JPG</Link>
                </div>

                <div className="flex gap-4 items-center">
                    <span className="hidden sm:inline-block text-sm font-bold text-blue-600 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                        100% Free & Unlimited
                    </span>
                </div>
            </div>
        </nav>
    );
}
