import React from 'react';
import Image from 'next/image';
import NeonIcons from '../assets/job-search.png';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import Link from 'next/link';

// For the character animation effect
const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.008, // Subtle stagger for a "typing" feel
        },
    },
};

const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

const AboutSection = () => {
    return (
        <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center overflow-hidden">
            {/* Text Content */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sentenceVariants}
                className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-lg font-light"
            >
                <motion.p variants={letterVariants}>
                    Changing Your Job Shouldn't Feel Confusing Or Overwhelming. At Mintex, We Turn Your Job Search Into A Clear, Guided Journey From Polishing Your Resume To Preparing You For Interviews To Matching You With Roles That Fit Your Ambition, Not Just Your Experience.
                </motion.p>

                <motion.p
                    variants={letterVariants}
                    className="font-semibold text-white text-xl md:text-2xl tracking-tight"
                >
                    You're Not Just Another Applicant.
                </motion.p>

                <motion.p variants={letterVariants} className="text-cyan-400/80">
                    You're A Career In Motion And We're Here To Push You Forward.
                </motion.p>
                <ScrollReveal delay={0.3} className="flex justify-start">
                    <Link href="/candidates/jobs" className="cta-button py-2 px-6 mt-10 inline-block">
                        START MY JOB SEARCH
                    </Link>
                </ScrollReveal>
            </motion.div>

            {/* Right Side: Neon Icons with Floating Animation and Glow Effect */}
            <motion.div
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative h-[350px] md:h-[500px] w-full flex items-center justify-center"
            >
                {/* Enhanced outer glow that pulses behind the image */}
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full"
                />

                <motion.div
                    className="relative w-full h-full"
                >
                    {/* Glow effect wrapper around the image */}
                    <div className="absolute inset-0 bg-cyan-400/8 blur-[30px] rounded-full animate-pulse z-0"></div>
                    <div className="relative z-10 w-full h-full">
                        <Image
                            src={NeonIcons}
                            alt="Process Icons"
                            fill
                            className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default AboutSection;