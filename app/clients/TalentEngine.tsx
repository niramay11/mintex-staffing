"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Search, UserCheck, Briefcase, Award } from "lucide-react";

const steps = [
    {
        id: 1,
        title: "Discover",
        icon: Handshake,
        desc: "We don't wait for candidates—we find them.",
        longDesc: "Our team taps into passive talent, industry networks, and real-time market intel to uncover top professionals before anyone else does.",
    },
    { id: 2, title: "Vetting", icon: Search, desc: "Rigorous screening process.", longDesc: "We ensure every candidate matches your technical requirements and company culture through deep-dive technical assessments." },
    { id: 3, title: "Submission", icon: UserCheck, desc: "The top 1% only.", longDesc: "You receive a curated shortlist of pre-vetted, high-impact professionals ready to interview." },
    { id: 4, title: "Interview", icon: Briefcase, desc: "Seamless coordination.", longDesc: "We manage logistics and preparation for productive hiring conversations, ensuring a premium candidate experience." },
    { id: 5, title: "Offer", icon: Award, desc: "Strategic mediation.", longDesc: "Closing the deal with confidence, handling negotiations, and ensuring a smooth transition for your new hire." }
];

export default function TalentEngine() {
    const [active, setActive] = useState(1);

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 py-20">
            {/* Heading added for context and lively entrance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mb-16 text-center md:text-left relative"
            >
                <h2 className="text-cyan-400 font-mono tracking-[0.3em] uppercase text-sm mb-2">Our Workflow</h2>
                <h3 className="text-white text-4xl md:text-5xl font-bold font-bebas tracking-wide">The Talent Engine</h3>
            </motion.div>

            <div className="flex flex-col md:flex-row items-stretch justify-center w-full min-h-[500px] gap-4 md:gap-0">
                {steps.map((step) => {
                    const isActive = active === step.id;
                    return (
                        <motion.div
                            key={step.id}
                            layout
                            onMouseEnter={() => setActive(step.id)}
                            className={`
                                relative rounded-3xl cursor-pointer 
                                transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                                backdrop-blur-xl border border-white/10
                                ${isActive
                                    ? "h-[500px] md:h-[550px] flex-4 bg-linear-to-br from-white/10 to-transparent border-cyan-400/40 shadow-[0_0_50px_rgba(34,211,238,0.1)] z-30"
                                    : "h-24 md:h-[550px] flex-1 bg-black/40 hover:bg-black/20 z-10 md:-ml-8"} 
                                overflow-hidden group
                            `}
                        >
                            {/* Animated Background Glow for Active Card */}
                            {isActive && (
                                <motion.div
                                    layoutId="glow"
                                    className="absolute inset-0 bg-cyan-400/5 pointer-events-none"
                                />
                            )}

                            <div className={`relative z-10 h-full flex transition-all duration-500 ${isActive ? "flex-col p-8 md:p-12" : "flex-row items-center p-4 md:flex-col md:p-12 md:items-start"}`}>
                                {/* Icon Shield with pulse effect */}
                                <motion.div
                                    layout
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center relative shrink-0 transition-all duration-500
                                        ${isActive ? "mb-10 bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "mb-0 mr-4 md:mb-10 md:mr-0 bg-white/5 text-gray-500 opacity-40 group-hover:opacity-100 transition-opacity"}`}
                                >
                                    <step.icon className="w-8 h-8 relative z-10" />
                                </motion.div>

                                <div className={`flex-1 flex flex-col ${!isActive && "justify-center md:justify-end"}`}>
                                    <motion.h3
                                        key={isActive ? "active" : "inactive"}
                                        initial={false}
                                        animate={{
                                            rotate: isActive ? 0 : -90,
                                            x: isActive ? 0 : 24,
                                            y: 0,
                                            opacity: 1,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                            ease: [0.23, 1, 0.32, 1],
                                        }}
                                        className={`
    text-2xl md:text-4xl font-bold tracking-tight uppercase whitespace-nowrap
    ${isActive ? "text-white mb-6" : "text-gray-600 md:origin-left md:mb-12"}
  `}
                                    >
                                        {step.title}
                                    </motion.h3>



                                    <AnimatePresence mode="wait">
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                                className="max-w-md"
                                            >
                                                <p className="text-cyan-400 text-sm font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <span className="w-8 h-[1px] bg-cyan-400/50"></span>
                                                    {step.desc}
                                                </p>
                                                <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light">
                                                    {step.longDesc}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Step Number Indicator */}
                                <div className={`font-mono ${isActive ? "mt-4 text-xs text-cyan-400/40" : "ml-auto md:ml-0 md:mt-4 text-xs text-gray-800"}`}>
                                    STEP _0{step.id}
                                </div>
                            </div>

                            {/* Glass reflection effect on hover for inactive cards */}
                            {!isActive && (
                                <motion.div
                                    className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}