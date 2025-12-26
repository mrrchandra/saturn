import React from 'react';
import { ChevronRight, Box } from 'lucide-react';

const Sidebar = ({ sections, activeEndpoint, onSelect, activeDomain }) => {
    return (
        <aside className="w-64 h-full border-r border-neutral-800 bg-[#0f0f0f] flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-sm bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <Box size={10} className="text-neutral-400" />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-100 tracking-widest uppercase">Saturn Docs</span>
                </div>
                <div className="text-[9px] text-neutral-700 font-mono tracking-tighter uppercase">Core Registry_V1</div>
            </div>

            <nav className="flex-1 p-4 space-y-6">
                {sections.map(section => (
                    <div key={section.domain}>
                        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-3 px-2">
                            {section.domain}
                        </h3>
                        <ul className="space-y-1">
                            {section.endpoints.map(endpoint => (
                                <li key={endpoint.path}>
                                    <button
                                        onClick={() => onSelect(endpoint)}
                                        className={`w-full text-left px-3 py-2 rounded-sm text-[11px] transition-all flex items-center justify-between group ${activeEndpoint?.path === endpoint.path
                                            ? 'bg-neutral-800/50 text-neutral-100 border border-neutral-700'
                                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
                                            }`}
                                    >
                                        <span>{endpoint.name}</span>
                                        <ChevronRight size={10} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeEndpoint?.path === endpoint.path ? 'opacity-100' : ''}`} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
