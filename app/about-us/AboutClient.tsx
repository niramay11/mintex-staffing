"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AboutGroup from '../assets/about-think.png';
import CoreValues from './CoreValues';
import ScrollReveal from '../components/ScrollReveal';
import History from './History';
import Feature from './Feature';

const AboutClient = () => {
    const itemVariants: any = {
        hidden: { x: -100, opacity: 0, filter: "blur(10px)" }, // Swoosh start (Left + Blur)
        visible: {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    return (
        <main className="min-h-screen pt-18 lg:pt-12 bg-black text-white relative font-sans">
            {/* Background with Gradient/Image if needed, simpler for now as per design */}

            <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center relative z-10">

                {/* Top Section: POWERING */}
                <div className="relative mb-8 w-full overflow-hidden">
                    <motion.div
                        className="flex w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "linear",
                            duration: 40, // slower = smoother
                        }}
                    >
                        {/* First copy */}
                        <div className="flex">
                            {[...Array(2)].map((_, i) => (
                                <h1
                                    key={`a-${i}`}
                                    className="text-[15vw] md:text-[14rem] lg:text-[18rem] 
                     leading-none tracking-wide font-bebas 
                     text-[#7DD3FC] px-[10vw] whitespace-nowrap"
                                >
                                    POWERING THE FUTURE
                                </h1>
                            ))}
                        </div>

                        {/* Second copy (IDENTICAL) */}
                        <div className="flex">
                            {[...Array(6)].map((_, i) => (
                                <h1
                                    key={`b-${i}`}
                                    className="text-[15vw] md:text-[14rem] lg:text-[18rem] 
                     leading-none tracking-wide font-bebas 
                     text-[#7DD3FC] px-[10vw] whitespace-nowrap"
                                >
                                    OF HIRING
                                </h1>
                            ))}
                        </div>
                    </motion.div>
                </div>


                {/* About Us Separator */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false }}
                    variants={itemVariants}
                    className="flex items-center gap-4 mb-12 md:mb-20 pb-3 w-full max-w-[150px] justify-center border-b-2 rounded-full border-gray-600"
                >
                    <span className="text-gray-300 text-sm md:text-xl font-light tracking-widest whitespace-nowrap">About Us</span>
                </motion.div>

                {/* Bottom Section: Content + Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full max-w-7xl">

                    {/* Left Content */}
                    <div className="flex flex-col gap-6 text-left relative order-2 md:order-1">
                        <motion.div
                            className="flex flex-col gap-4 md:gap-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } }
                            }}
                        >
                            <motion.p variants={itemVariants} className="text-lg md:text-2xl text-white font-gilroy font-medium">
                                It all started with one simple question:
                            </motion.p>

                            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-6xl font-black italic leading-tight tracking-tight font-gilroy">
                                WHAT IF <span className="text-[#A855F7]">STAFFING</span><br />
                                COULD MOVE<br />
                                AT THE SPEED<br />
                                OF <span className="text-[#A855F7]">INNOVATION</span>?
                            </motion.h2>
                        </motion.div>
                    </div>

                    {/* Right Image with Glow Effect */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative flex justify-center items-center order-1 md:order-2"
                    >
                        {/* Enhanced outer glow that pulses behind the image */}
                        <motion.div
                            animate={{ opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full"
                        />

                        <div className="relative w-full max-w-[300px] md:max-w-full aspect-square">
                            {/* Glow effect wrapper around the image */}
                            <div className="absolute inset-0 bg-cyan-400/8 blur-[30px] rounded-full animate-pulse z-0"></div>
                            <div className="relative z-10 w-full h-full">
                                <Image
                                    src={AboutGroup}
                                    alt="Innovation Runner"
                                    fill
                                    className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                                    priority
                                />
                            </div>
                        </div>
                    </motion.div>

                </div>

                <motion.p
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false }}
                    variants={itemVariants}
                    className="w-full text-gray-300 text-sm md:text-base leading-relaxed font-gilroy max-w-7xl mt-8 md:mt-0"
                >
                    At Mintex Staffing, we don’t just fill positions we connect ambition with opportunity. Born out of Mintex Tech, our journey began when candidates walked into our office looking for guidance. We helped them break through barriers, land roles, and soon realized we were building more than just careers we were building futures.
                </motion.p>

            </div>

            <History />

            <Feature />

            {/* Core Values Section */}
            <ScrollReveal>
                <CoreValues />
            </ScrollReveal>

            {/* Future Is Hiring CTA Section */}
            <div className="w-full bg-[#0F0A0A] py-20 md:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute bottom-0 w-full h-[300px] bg-red-900/10 blur-[100px]"></div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6"
                >
                    <motion.h2 variants={itemVariants} className="text-5xl md:text-8xl font-bebas text-white tracking-wide">
                        THE FUTURE IS HIRING
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-gray-400 font-gilroy text-sm md:text-base tracking-widest uppercase max-w-2xl px-4">
                        We're not just another staffing firm we're your growth partner, your talent engine, and your bridge to what's next.
                    </motion.p>
                    <ScrollReveal delay={0.3} className="flex justify-center mt-0 md:mt-20">
                        <button className="cta-button py-2 px-6 mt-10">
                            JOIN THE REVOLUTION
                        </button>
                    </ScrollReveal>

                </motion.div>
            </div>
        </main>
    );
}

export default AboutClient
