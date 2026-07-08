"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaExchangeAlt, FaBolt } from 'react-icons/fa';

const workTypes = [
    {
        id: 1,
        label: "DIRECT HIRE",
        // Increased opacity for a "more solid" look
        color: "rgba(0, 255, 255, 0.7)",
        text: "Found Your Forever Home. Full-Time Status, Direct Placement, Maximum Stability.",
        icon: FaHome,
        accent: "cyan",
    },
    {
        id: 2,
        label: "CONTRACT-TO-HIRE",
        color: "rgba(0, 255, 255, 0.7)",
        text: "Try Before You Buy. See If You Actually Like The Company Culture Before You Sign The Long-Term Lease.",
        icon: FaExchangeAlt,
        accent: "purple",
    },
    {
        id: 3,
        label: "CONTRACT",
        color: "rgba(0, 255, 255, 0.7)",
        text: "Get In, Get Paid, Get Out. High-Flexibility Roles For Talent That Loves A Fresh Challenge.",
        icon: FaBolt,
        accent: "blue",
    }
];

const ACCENTS: Record<string, { border: string; badgeBorder: string; badgeBg: string; badgeText: string; iconBg: string; iconBorder: string; iconText: string; glow: string }> = {
    cyan: {
        border: "border-cyan-500/20", badgeBorder: "border-cyan-400/40", badgeBg: "bg-cyan-500/10",
        badgeText: "text-cyan-200", iconBg: "bg-cyan-500/10", iconBorder: "border-cyan-400/30",
        iconText: "text-cyan-300", glow: "bg-cyan-400/10",
    },
    purple: {
        border: "border-purple-500/20", badgeBorder: "border-purple-400/40", badgeBg: "bg-purple-500/10",
        badgeText: "text-purple-200", iconBg: "bg-purple-500/10", iconBorder: "border-purple-400/30",
        iconText: "text-purple-300", glow: "bg-purple-400/10",
    },
    blue: {
        border: "border-blue-500/20", badgeBorder: "border-blue-400/40", badgeBg: "bg-blue-500/10",
        badgeText: "text-blue-200", iconBg: "bg-blue-500/10", iconBorder: "border-blue-400/30",
        iconText: "text-blue-300", glow: "bg-blue-400/10",
    },
};

const Support = () => {
    const [hoveredId, setHoveredId] = useState(null);
    // Hover doesn't exist on touch devices — desktop/laptop keep the spotlight
    // hover effect below; phones/tablets get a static, always-visible layout.
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(pointer: coarse)");
        const check = () => setIsTouch(mq.matches);
        check();
        mq.addEventListener("change", check);
        return () => mq.removeEventListener("change", check);
    }, []);

    if (isTouch) {
        return (
            <section className="py-20 max-w-6xl mx-auto px-6 text-center bg-black text-white relative overflow-hidden">
                {/* Ambient background glows for depth */}
                <div className="absolute top-10 left-[10%] w-56 h-56 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-[10%] w-56 h-56 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-3xl font-bold mb-3 font-bebas tracking-[0.2em] uppercase relative z-10"
                >
                    WORK WE SUPPORT
                </motion.h2>
                <p className="text-sm text-gray-400 mb-12 relative z-10">
                    Three ways to work with us — pick what fits your life right now.
                </p>

                <div className="flex flex-col gap-5 relative z-10">
                    {workTypes.map((type, index) => {
                        const Icon = type.icon;
                        const a = ACCENTS[type.accent];
                        return (
                            <motion.div
                                key={type.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.5, delay: index * 0.12 }}
                                className={`relative text-left rounded-2xl border ${a.border} bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-sm p-6 overflow-hidden`}
                            >
                                {/* Giant faded index number */}
                                <span className="absolute -top-3 -right-1 text-8xl font-black text-white/[0.04] select-none leading-none">
                                    0{index + 1}
                                </span>
                                <div className={`absolute -top-10 -right-10 w-32 h-32 ${a.glow} rounded-full blur-3xl pointer-events-none`} />

                                <div className="relative z-10 flex items-center gap-3 mb-4">
                                    <div className={`w-11 h-11 rounded-xl ${a.iconBg} border ${a.iconBorder} flex items-center justify-center ${a.iconText} text-lg shrink-0`}>
                                        <Icon />
                                    </div>
                                    <span className={`inline-block px-4 py-1.5 rounded-full border ${a.badgeBorder} ${a.badgeBg} text-xs font-bold tracking-widest uppercase ${a.badgeText}`}>
                                        {type.label}
                                    </span>
                                </div>
                                <p className="relative z-10 text-sm text-gray-300 font-light leading-relaxed max-w-[90%]">
                                    {type.text}
                                </p>

                                {/* Bottom accent line */}
                                <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${a.iconText}`} />
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 max-w-6xl mx-auto px-6 text-center bg-black text-white overflow-hidden">
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold mb-20 font-bebas tracking-[0.2em] uppercase"
            >
                WORK WE SUPPORT
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {workTypes.map((type: any, index: number) => (
                    <motion.div
                        key={type.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        className="flex flex-col items-center"
                        onMouseEnter={() => setHoveredId(type.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        {/* The Badge */}
                        <div className={`
                            relative px-12 py-5 rounded-full border transition-all duration-500 z-20 w-full max-w-[280px]
                            ${hoveredId === type.id ? 'border-white bg-gray-900 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'border-gray-800 bg-black'}
                        `}>
                            <span className="text-sm md:text-base font-bold tracking-widest uppercase">
                                {type.label}
                            </span>
                        </div>

                        {/* Spotlight Beam Container */}
                        <div className="relative w-full h-52 flex justify-center pointer-events-none -mt-2">
                            <AnimatePresence>
                                {hoveredId === type.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scaleY: 0 }}
                                        animate={{ opacity: 1, scaleY: 1.5 }} // Increased scaleY for more height
                                        exit={{ opacity: 0, scaleY: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="origin-top"
                                        style={{
                                            width: '220px',
                                            height: '180px',
                                            // Conic gradient adjusted for a wider, more solid base
                                            background: `conic-gradient(from 145deg at 50% 0%, ${type.color}  60deg, transparent 70deg)`,
                                            // Reduced blur from 35px to 20px to make it "more solid"
                                            filter: 'blur(20px)',
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Description Text */}
                        <motion.p
                            animate={{
                                opacity: hoveredId === type.id ? 1 : 0.2,
                                y: hoveredId === type.id ? -10 : 0, // Slight lift when illuminated
                                scale: hoveredId === type.id ? 1.05 : 1
                            }}
                            className="text-xs md:text-sm font-light leading-relaxed max-w-[220px] transition-all duration-500 relative z-30"
                        >
                            {type.text}
                        </motion.p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default Support;