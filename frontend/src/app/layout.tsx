import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ihatepdf | Free Online PDF Tools',
  description: 'Merge, split, compress, and edit your PDFs easily and entirely free.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative`}>
        {/* Abstract Background Blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow z-10 flex flex-col container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="z-10 py-10 border-t border-slate-200 dark:border-white/5 mt-auto">
          <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} ihatepdf. All rights reserved. Documents are auto-deleted.
          </div>
        </footer>
      </body>
    </html>
  );
}
