import React, { useState, useEffect, useRef } from 'react';
import ApiSection from '../components/ApiSection';
import Sidebar from '../components/Sidebar';
import { API_DOCS } from '../data/api-docs';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Github, Menu, X, ArrowUpRight, Github as GithubIcon, Twitter, Globe } from 'lucide-react';

const DocumentationPage = () => {
    const [selectedEndpointPath, setSelectedEndpointPath] = useState(API_DOCS[0].endpoints[0].path);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const scrollContainerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        container: scrollContainerRef
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const scrollToEndpoint = (path) => {
        const element = document.getElementById(path);
        const container = scrollContainerRef.current;
        if (element && container) {
            const top = element.offsetTop - 40;
            container.scrollTo({
                top,
                behavior: 'smooth'
            });
            setSelectedEndpointPath(path);
        }
    };

    // Auto-update active sidebar item on scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            let currentPath = selectedEndpointPath;
            API_DOCS.forEach(cat => {
                cat.endpoints.forEach(ep => {
                    const el = document.getElementById(ep.path);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top <= 300 && rect.bottom >= 150) {
                            currentPath = ep.path;
                        }
                    }
                });
            });
            if (currentPath !== selectedEndpointPath) setSelectedEndpointPath(currentPath);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [selectedEndpointPath]);

    const activeEp = API_DOCS.flatMap(c => c.endpoints).find(e => e.path === selectedEndpointPath);

    return (
        <div className="flex h-screen bg-[#09090b] text-neutral-400 overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
            {/* Background Glow */}
            <div className="hero-glow" />

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[1px] bg-blue-500 origin-left z-[200]"
                style={{ scaleX }}
            />

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-8 right-8 z-[210] w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shadow-2xl text-neutral-200 hover:scale-110 active:scale-95 transition-all"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Logic */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth >= 1024) && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className={`fixed lg:relative z-[205] h-full shadow-2xl lg:shadow-none ${isSidebarOpen ? 'w-72 block' : 'hidden lg:block lg:w-72'}`}
                    >
                        <Sidebar
                            sections={API_DOCS}
                            activeEndpoint={activeEp}
                            onSelect={(ep) => {
                                scrollToEndpoint(ep.path);
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth h-full z-10 custom-scrollbar"
            >
                <main className="flex-1 py-12 px-6 sm:px-12 md:px-24 max-w-7xl mx-auto w-full">
                    {/* Header Branding for Mobile only */}
                    <div className="lg:hidden mb-12 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                <span className="text-xs font-bold text-neutral-200">S</span>
                            </div>
                            <h1 className="text-sm font-bold tracking-tighter text-neutral-100 uppercase italic">Saturn Docs</h1>
                        </div>
                        <a href="#" className="p-2 bg-neutral-900 rounded-lg border border-neutral-800 text-neutral-400">
                            <Github size={18} />
                        </a>
                    </div>

                    {API_DOCS.map((category) => (
                        <div key={category.domain} className="mb-40">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="mb-20 border-b border-neutral-900 pb-8 relative"
                            >
                                <span className="absolute -left-12 top-0 text-[8px] font-mono text-neutral-800 rotate-90 origin-left tracking-[1em] uppercase hidden xl:block">
                                    SECTION_{API_DOCS.indexOf(category) + 1}
                                </span>
                                <h3 className="text-[11px] font-bold text-neutral-600 uppercase tracking-[0.5em] mb-4">
                                    {category.domain}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-[1px] bg-blue-900/50" />
                                    <h4 className="text-xl sm:text-2xl text-neutral-300 font-light tracking-tight">Technical Reference</h4>
                                </div>
                            </motion.div>

                            {category.endpoints.map((endpoint) => (
                                <div key={endpoint.path} id={endpoint.path} className="pt-4">
                                    <ApiSection endpoint={endpoint} />
                                </div>
                            ))}
                        </div>
                    ))}

                    <footer className="mt-40 pt-20 pb-32 border-t border-neutral-900/50 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                    <span className="text-xs font-bold text-neutral-200 uppercase">S</span>
                                </div>
                                <h2 className="text-lg font-bold tracking-tighter text-neutral-200 uppercase italic">Saturn Docs</h2>
                            </div>
                            <p className="text-neutral-500 max-w-sm leading-relaxed text-xs sm:text-sm">
                                The official technical documentation for the Saturn Platform. Building the next generation of modular interface protocols.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="p-2 bg-neutral-900/50 rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-800/50">
                                    <GithubIcon size={16} />
                                </a>
                                <a href="#" className="p-2 bg-neutral-900/50 rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-800/50">
                                    <Twitter size={16} />
                                </a>
                                <a href="#" className="p-2 bg-neutral-900/50 rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-800/50">
                                    <Globe size={16} />
                                </a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-100">Resources</h3>
                            <ul className="space-y-4 text-neutral-500">
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">API Reference <ArrowUpRight size={12} /></a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">Developer SDK <ArrowUpRight size={12} /></a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">Platform Status <ArrowUpRight size={12} /></a></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-100">Contact</h3>
                            <ul className="space-y-4 text-neutral-500">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Discord Community</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Support Email</a></li>
                                <li className="pt-4">
                                    <div className="text-[10px] text-neutral-800 font-mono tracking-tighter uppercase whitespace-nowrap">
                                        © 2024 SATURN PLATFORM. DOCS_V1_STABLE_FINAL
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DocumentationPage;
