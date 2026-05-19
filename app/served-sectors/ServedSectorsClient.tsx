'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SECTORS } from '@/utils/Constan';

const ServedSectorsClient = () => {
    return (
        <section className="bg-black text-white relative">
            {/* ================= HEADER ================= */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center px-4 pt-32 pb-16 relative z-10 bg-black"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500 mb-4">
                    EXPERTISE ACROSS INDUSTRIES
                </h1>
                <p className="text-xl text-cyan-400 font-medium">
                    Smart Hiring. Real Impact. Every Industry.
                </p>
            </motion.div>

            {/* ================= SECTORS ================= */}
            <div className="flex flex-col w-full">
                {SECTORS.map((sector, index) => (
                    <div
                        key={sector.id}
                        className="relative sticky top-12 bg-black min-h-[92vh] border-t border-white/10 flex flex-col justify-start overflow-hidden"
                    >
                        <div className="relative z-10 max-w-[1400px] mx-auto w-full grid grid-cols-12 gap-10 px-4 md:px-8 pt-16 pb-12 h-full">

                            {/* ================= LEFT SIDEBAR ================= */}
                            <aside className="hidden md:flex col-span-4 font-gilroy lg:col-span-3 flex-col gap-8 h-fit sticky top-20">
                                <h2 className="text-5xl md:text-7xl font-bold text-white/30 tracking-tighter">
                                    {String(index + 1).padStart(2, '0')}
                                </h2>

                                <ul className="space-y-3">
                                    {SECTORS.map((s, i) => (
                                        <li
                                            key={s.id}
                                            className={`uppercase text-xs tracking-widest transition-all duration-300
                        ${i === index
                                                    ? 'text-cyan-400 font-semibold pl-4 border-l-2 border-cyan-400'
                                                    : 'text-gray-400 opacity-50'
                                                }`}
                                        >
                                            {s.listTitle || s.title}
                                        </li>
                                    ))}
                                </ul>
                            </aside>

                            {/* ================= MAIN CONTENT ================= */}
                            <div className="relative col-span-12 font-gilroy md:col-span-8 lg:col-span-9 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

                                {/* ===== LEFT CONTENT ===== */}
                                <div className="lg:col-span-3 space-y-6">
                                    <span className="md:hidden text-4xl font-bold text-white/20">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>

                                    <div>
                                        <h1 className="text-2xl md:text-6xl font-semibold text-white mb-2">
                                            {sector.title}
                                        </h1>

                                        <p className="text-cyan-400 uppercase tracking-wider mb-4">
                                            {sector.subtitle}
                                        </p>

                                        <p className="text-gray-300 text-2xl leading-relaxed max-w-xl">
                                            {sector.description}
                                        </p>
                                    </div>
                                </div>

                                {/* ===== RIGHT META ===== */}
                                <div className="lg:col-span-2 space-y-8">

                                    {/* Roles */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-xs font-semibold mb-4 text-white uppercase tracking-widest">
                                            Key Roles We Hire
                                        </h3>

                                        <div className="flex flex-wrap gap-2">
                                            {sector.roles.map((role, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Why Choose */}
                                    <div className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-6">
                                        <h3 className="text-xs font-semibold mb-3 text-white uppercase tracking-widest">
                                            Why Mintex Staffing
                                        </h3>

                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {sector.whyChoose}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= BOTTOM SPACER ================= */}
            <div className="h-[20vh] bg-black" />
        </section>
    );
};

export default ServedSectorsClient;
