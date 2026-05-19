"use client";

import React from 'react';
import Eye from '../assets/support_eye.png'
import Star from '../assets/support_star.png'
import Think from '../assets/support_think.png'
import { motion } from 'framer-motion';
import Link from 'next/link';
import TalentEngine from './TalentEngine';
import HeroSection from './Hero';
import WhyMintex from './WhyMintex';
import ScrollReveal from '../components/ScrollReveal';
import Image from 'next/image';

const ClientsClient = () => {
    return (
        <div className="bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Hero Section */}
            <ScrollReveal>
                <HeroSection />
            </ScrollReveal>

            {/* Why Mintex Section */}
            <ScrollReveal>
                <WhyMintex />
            </ScrollReveal>

            {/* Talent Engine Section */}
            <section className="relative py-32 overflow-hidden">
                {/* Background Swirls - CSS or Image could be used here. Using CSS gradients for now */}
                <div className="absolute inset-0 client-bg"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <ScrollReveal>
                        <h2 className="text-3xl md:text-4xl font-bold text-purple-300 text-center mb-20 uppercase tracking-widest relative font-bebas">
                            Mintex 5-Step Talent Engine
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-purple-500/50 rounded-full"></span>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <TalentEngine />
                    </ScrollReveal>

                    <ScrollReveal delay={0.3} className="flex justify-center mt-0 md:mt-20">
                        <Link href="/clients/portal" className="cta-button py-2 px-6 mt-10">
                            INITIATE HIRING MODE
                        </Link>
                    </ScrollReveal>
                </div>
            </section>

            {/* Values Section */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-3 gap-8">
                    <ScrollReveal delay={0.1} className="h-full">
                        <ValueCard
                            icon={<Image src={Eye} alt="Eye" className="mix-blend-screen" width={60} height={60} />}
                            title="Integrity"
                            desc="We do what's right, even when no one's watching."
                            gradient="from-cyan-900/20 to-transparent"
                        />
                    </ScrollReveal>
                    <ScrollReveal delay={0.2} className="h-full">
                        <ValueCard
                            icon={<Image src={Star} alt="Eye" width={60} height={60} />}
                            title="Excellence"
                            desc="Every hire reflects our obsession with quality."
                            gradient="from-purple-900/20 to-transparent"
                        />
                    </ScrollReveal>
                    <ScrollReveal delay={0.3} className="h-full">
                        <ValueCard
                            icon={<Image src={Think} alt="Eye" width={60} height={60} />}
                            title="Innovation"
                            desc="Because yesterday's hiring won't solve tomorrow's challenges."
                            gradient="from-blue-900/20 to-transparent"
                        />
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const ValueCard = ({ icon, title, desc, gradient }: any) => {

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
            className="relative support_card p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-md transition-all duration-500 group overflow-hidden min-h-[340px] flex flex-col justify-center gap-8"
        >
            {/* Subtle background gradient glow */}
            <div className={`absolute inset-0 bg-linear-to-b ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>

            {/* Icon Container */}
            <motion.div variants={itemVariants} className="relative z-10 transform group-hover:scale-110 transition-transform duration-500 origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                {icon ? (
                    <div className="relative flex items-start justify-start">
                        {icon}
                    </div>
                ) : (
                    <div className="h-16 mb-6"></div>
                )}
            </motion.div>

            {/* Text Content */}
            <div className="relative z-10">
                <motion.h3 variants={itemVariants} className="text-4xl md:text-5xl font-medium mb-4 text-white tracking-tight group-hover:translate-x-1 transition-transform duration-300">{title}</motion.h3>
                <motion.p variants={itemVariants} className="text-gray-400 text-sm md:text-base leading-relaxed opacity-80 max-w-[90%] font-light">
                    {desc}
                </motion.p>
            </div>
        </motion.div>
    )
};

export default ClientsClient;
