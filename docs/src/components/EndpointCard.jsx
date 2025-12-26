import React from 'react';
import { Activity, Shield, Zap, ChevronRight } from 'lucide-react';

const EndpointCard = ({ endpoint, onClick }) => {
    const getMethodColor = (method) => {
        switch (method.toUpperCase()) {
            case 'GET': return 'text-neutral-400 border-neutral-700 bg-neutral-800/20';
            case 'POST': return 'text-neutral-300 border-neutral-600 bg-neutral-700/30';
            default: return 'text-neutral-500 border-neutral-800 bg-neutral-900/40';
        }
    };

    return (
        <div
            onClick={() => onClick(endpoint)}
            className="group relative bg-[#171717] border border-neutral-700 rounded-sm p-5 sm:p-6 w-[280px] sm:w-[320px] cursor-pointer transition-all hover:border-neutral-500 hover:bg-[#1c1c1c] active:scale-[0.98]"
        >
            <div className="flex items-center justify-between mb-4">
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded border ${getMethodColor(endpoint.method)} uppercase tracking-[0.15em]`}>
                    {endpoint.method}
                </span>
                <div className="flex gap-2 text-neutral-600">
                    {endpoint.requiresAuth && <Shield size={12} className="text-neutral-400" />}
                    <Activity size={12} />
                </div>
            </div>

            <h3 className="text-sm font-semibold text-neutral-200 mb-2 group-hover:text-white transition-colors truncate">
                {endpoint.name}
            </h3>
            <p className="text-[11px] text-neutral-500 mb-6 line-clamp-2 leading-relaxed">
                {endpoint.description}
            </p>

            <div className="flex items-center justify-between text-[10px] text-neutral-600 font-mono">
                <code className="text-neutral-500 bg-neutral-900/50 px-1.5 py-0.5 rounded border border-neutral-800/50 truncate max-w-[180px]">
                    {endpoint.path}
                </code>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
        </div>
    );
};

export default EndpointCard;
