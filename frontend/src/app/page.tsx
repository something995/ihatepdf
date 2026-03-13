import Link from 'next/link';
import { Merge, SplitSquareVertical, FileArchive, ArrowRight, FileText, Image as ImageIcon, Lock, Unlock, TextSelect, Eraser } from 'lucide-react';

const TOOLS = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into a single, unified document in seconds.',
    icon: <Merge className="w-8 h-8 text-blue-500" />,
    href: '/merge',
    color: 'from-blue-500/20 to-indigo-500/10'
  },
  {
    title: 'Split PDF',
    description: 'Extract pages or split a single PDF into multiple documents instantly.',
    icon: <SplitSquareVertical className="w-8 h-8 text-rose-500" />,
    href: '/split',
    color: 'from-rose-500/20 to-orange-500/10'
  },
  {
    title: 'Compress PDF',
    description: 'Reduce the file size of your PDF without losing visual quality.',
    icon: <FileArchive className="w-8 h-8 text-emerald-500" />,
    href: '/compress',
    color: 'from-emerald-500/20 to-teal-500/10'
  },
  {
    title: 'PDF to Word',
    description: 'Easily convert your PDF files into easy to edit DOCX documents.',
    icon: <FileText className="w-8 h-8 text-amber-500" />,
    href: '/pdf-to-word',
    color: 'from-amber-500/20 to-orange-500/10'
  },
  {
    title: 'PDF to JPG',
    description: 'Convert each page of your PDF into high-quality JPG images.',
    icon: <ImageIcon className="w-8 h-8 text-yellow-500" />,
    href: '/pdf-to-jpg',
    color: 'from-yellow-400/20 to-yellow-600/10'
  },
  {
    title: 'Protect PDF',
    description: 'Encrypt your PDF with a strong password to prevent unauthorized access.',
    icon: <Lock className="w-8 h-8 text-indigo-500" />,
    href: '/protect',
    color: 'from-indigo-400/20 to-indigo-600/10'
  },
  {
    title: 'Unlock PDF',
    description: 'Remove password security from PDFs, making them easy to use instantly.',
    icon: <Unlock className="w-8 h-8 text-pink-500" />,
    href: '/unlock',
    color: 'from-pink-400/20 to-pink-600/10'
  },
  {
    title: 'Add Watermark',
    description: 'Stamp an image or text over your PDF in seconds.',
    icon: <TextSelect className="w-8 h-8 text-cyan-500" />,
    href: '/watermark',
    color: 'from-cyan-400/20 to-cyan-600/10'
  },
  {
    title: 'Remove Watermark',
    description: 'Scrub known text watermarks magically from your PDF.',
    icon: <Eraser className="w-8 h-8 text-purple-500" />,
    href: '/remove-watermark',
    color: 'from-purple-400/20 to-purple-600/10'
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-20 w-full max-w-5xl mx-auto space-y-20">

      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
          Every tool you need to <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">work with PDFs.</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
          A completely free, robust, and secure platform to merge, split, compress, and edit PDF documents. No installation required.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/merge" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/50 flex items-center gap-2 text-lg">
            Start Merging <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#tools" className="px-8 py-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-lg">
            Explore Features
          </a>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
        {TOOLS.map((tool, idx) => (
          <Link key={idx} href={tool.href} className="group relative">
            <div className="h-full glass rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} rounded-bl-full blur-3xl opacity-50 transition-opacity group-hover:opacity-100`}></div>

              <div className="mb-6 p-4 bg-white/50 dark:bg-black/50 rounded-2xl w-max shadow-sm backdrop-blur-sm">
                {tool.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{tool.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Trust Section */}
      <section className="mt-20 glass rounded-3xl w-full p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10" />
        <h2 className="text-3xl font-bold mb-4 relative z-10">Fast, Secure, and Private.</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 relative z-10 max-w-3xl mx-auto">
          All processing is handled seamlessly on our high-performance cloud servers. Once processed, your files are completely deleted from our servers automatically to guarantee zero data retention.
        </p>
      </section>

    </div>
  );
}
