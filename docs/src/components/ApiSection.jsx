import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, Terminal, Lightbulb, Copy, Check } from 'lucide-react';

const ApiSection = ({ endpoint }) => {
    const [copied, setCopied] = React.useState(null);

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const reqBody = JSON.stringify(endpoint.requestBody, null, 2);
    const resSample = JSON.stringify(endpoint.response, null, 2);

    return (
        <motion.section
            id={endpoint.path}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-32 max-w-6xl mx-auto"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 item-start">
                {/* Text Content */}
                <div className="space-y-12">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase tracking-widest">
                                {endpoint.method}
                            </span>
                            <code className="text-xs text-neutral-600 font-mono tracking-tighter">{endpoint.path}</code>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold text-neutral-100 tracking-tighter mb-6">{endpoint.name}</h2>
                        <p className="text-neutral-400 text-base sm:text-lg leading-relaxed font-light">
                            {endpoint.description}
                        </p>
                    </div>

                    <div className="space-y-10 group">
                        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700/60 transition-colors">
                            <div className="flex items-center gap-3 mb-4 text-neutral-200">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                    <Terminal size={14} className="text-neutral-500" />
                                </div>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">Application Guide</h4>
                            </div>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {endpoint.usage}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700/60 transition-colors">
                            <div className="flex items-center gap-3 mb-4 text-neutral-200">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                    <Lightbulb size={14} className="text-neutral-500" />
                                </div>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">Platform Logic</h4>
                            </div>
                            <p className="text-neutral-500 text-sm leading-relaxed italic">
                                {endpoint.howItWorks}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Code Blocks */}
                <div className="space-y-6 lg:sticky lg:top-32 self-start">
                    {/* Request Body */}
                    <div className="rounded-2xl bg-[#090909] border border-blue-900/40 overflow-hidden shadow-[0_0_50px_-12px_rgba(30,58,138,0.25)]">
                        <div className="px-5 py-3 bg-blue-950/20 border-b border-blue-900/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code2 size={14} className="text-blue-500" />
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Payload_Request</span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(reqBody, 'req')}
                                className="p-1.5 hover:bg-blue-900/30 rounded-md transition-all text-blue-700 hover:text-blue-300"
                            >
                                {copied === 'req' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <div className="p-6 text-[13px] font-mono leading-relaxed text-blue-100/80">
                            <pre className="whitespace-pre-wrap">{reqBody || '// No payload required'}</pre>
                        </div>
                    </div>

                    {/* Response Body */}
                    <div className="rounded-2xl bg-[#080808] border border-emerald-900/40 overflow-hidden shadow-[0_0_50px_-12px_rgba(6,78,59,0.25)]">
                        <div className="px-5 py-3 bg-emerald-950/20 border-b border-emerald-900/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Platform_Response</span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(resSample, 'res')}
                                className="p-1.5 hover:bg-emerald-900/30 rounded-md transition-all text-emerald-700 hover:text-emerald-300"
                            >
                                {copied === 'res' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <div className="p-6 text-[13px] font-mono leading-relaxed text-emerald-100/80">
                            <pre className="whitespace-pre-wrap">{resSample}</pre>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-20 h-px bg-gradient-to-r from-transparent via-neutral-800/50 to-transparent" />
        </motion.section>
    );
};

export default ApiSection;
