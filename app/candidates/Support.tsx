"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const workTypes = [
    {
        id: 1,
        label: "DIRECT HIRE",
        // Increased opacity for a "more solid" look
        color: "rgba(0, 255, 255, 0.7)",
        text: "We Can Connect Companies With Talent And Put Them Together For A Long Term Solution."
    },
    {
        id: 2,
        label: "CONTRACT-TO-HIRE",
        color: "rgba(0, 255, 255, 0.7)",
        text: "We Can Connect Companies With Talent And Put Them Together For A Long Term Solution."
    },
    {
        id: 3,
        label: "CONTRACT",
        color: "rgba(0, 255, 255, 0.7)",
        text: "We Can Connect Companies With Talent And Put Them Together For A Long Term Solution."
    }
];

const Support = () => {
    const [hoveredId, setHoveredId] = useState(null);

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