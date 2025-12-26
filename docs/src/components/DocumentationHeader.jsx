import React from 'react';
import { Zap, Github, Menu } from 'lucide-react';

const DocumentationHeader = ({ categories, activeCategory, onCategoryChange, onMenuClick }) => {
    return (
        <header className="h-20 px-6 sm:px-12 border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-[100]">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-2xl group-hover:border-neutral-700 transition-all">
                        <Zap className="text-neutral-500 group-hover:text-neutral-200 transition-colors" size={20} />
                    </div>
                    <div className="flex flex-col -gap-1">
                        <h1 className="text-sm font-bold tracking-tighter text-neutral-100 italic uppercase">Saturn Docs</h1>
                        <span className="text-[9px] text-neutral-600 font-mono tracking-widest uppercase">Official Documentation</span>
                    </div>
                </div>

                {/* Domain Tabs */}
                <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/50 p-1 rounded-lg border border-neutral-800/50">
                    {categories.map((cat) => (
                        <button
                            key={cat.domain}
                            onClick={() => onCategoryChange(cat.domain)}
                            className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat.domain
                                ? 'bg-neutral-800 text-neutral-100 shadow-lg'
                                : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            {cat.domain}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-neutral-500 font-mono">STATUS: <span className="text-emerald-500/80">ONLINE</span></span>
                    <span className="text-[8px] text-neutral-700 font-mono tracking-tighter">REFRESH_RATE: 0ms (STATIC)</span>
                </div>
                <button
                    className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg border border-transparent hover:border-neutral-700 transition-all"
                    onClick={onMenuClick}
                >
                    <Menu size={20} className="text-neutral-400" />
                </button>
                <a href="#" className="p-3 bg-neutral-900 rounded-xl hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 transition-all text-neutral-400 hover:text-neutral-100">
                    <Github size={20} />
                </a>
            </div>
        </header>
    );
};

export default DocumentationHeader;
