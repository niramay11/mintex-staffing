'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import HandshakeImg from '../assets/neon-handshake.png';

const WhyMintex = () => {
    // Animation variants for the text blocks
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center relative overflow-hidden">

            {/* Animated Background Orbs for "Life" */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full -z-0"
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="z-10"
            >
                {/* Heading with Gradient Wipe */}
                <motion.h2
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-8 font-bebas tracking-tight"
                >
                    WHY MINTEX STAFFING?
                </motion.h2>

                <div className="space-y-6 text-gray-300 leading-relaxed text-base md:text-lg font-light">
                    <motion.p variants={itemVariants}>
                        Hiring Today Is Fast, Competitive, And Noisy. Great Talent Has Countless Options — And Getting Their Attention Takes More Than A Job Post.
                    </motion.p>

                    <motion.p variants={itemVariants}>
                        That's Why Mintex Goes Beyond Traditional Recruiting. We Actively Reach Out To Top Candidates, Tell Your Story With Clarity And Position Your Role As The Opportunity They Can't Ignore.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="p-4 border-l-2 border-cyan-500/30 bg-cyan-500/5 rounded-r-lg"
                    >
                        <p className="text-gray-200">
                            With 20+ Years Of Experience, A 200+ Recruiter Network, And A Fully Contingent Model, We Help You Hire Faster, Smarter, And With Zero Risk.
                        </p>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-white font-semibold text-xl"
                    >
                        Mintex Doesn't Just Find Candidates. <br />
                        <span className="text-cyan-400">We Connect You To The People Who Fuel Your Growth.</span>
                    </motion.p>
                </div>

                {/* Animated Interactive Button */}
                <div className="flex w-full justify-center md:justify-start mt-10">
                    <Link href="/clients/portal" className="cta-button py-2 px-6">
                        INITIATE HIRING MODE
                    </Link>
                </div>
            </motion.div>

            {/* Image Container - Static Image, but Animated Entrance */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "circOut" }}
                viewport={{ once: true }}
                className="relative w-full flex justify-center items-center"
            >
                {/* Enhanced outer glow that pulses behind the handshake */}
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"
                />

                <div className="relative w-full aspect-square max-w-[500px]">
                    {/* Glow effect wrapper around the image */}
                    <div className="absolute inset-0 bg-cyan-400/15 blur-[40px] rounded-full animate-pulse z-0"></div>
                    <div className="relative z-10 w-full h-full">
                        <Image
                            src={HandshakeImg}
                            alt="Neon Handshake"
                            fill
                            className="object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default WhyMintex;