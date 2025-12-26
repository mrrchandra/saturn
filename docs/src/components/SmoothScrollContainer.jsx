import React, { useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

const SmoothScrollContainer = ({ children }) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="bg-[#0a0a0a] min-h-screen selection:bg-neutral-800 selection:text-neutral-200">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-neutral-600 origin-left z-[101]"
                style={{ scaleX }}
            />

            {/* Scrollable Content */}
            <main className="relative z-10 py-12 px-6 sm:px-12 md:px-24">
                {children}
            </main>

            {/* Subtle Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-neutral-400 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-neutral-500 rounded-full blur-[150px]" />
            </div>
        </div>
    );
};

export default SmoothScrollContainer;
