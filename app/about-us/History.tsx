"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import AboutHistory from '../assets/about_history.png';
import Floats from '../components/Floats';
// You might want to import other images for different eras if available
// import Era2010 from '../assets/era_2010.png'; 
// etc.

const historyData = [
    {
        year: "2002",
        title: "WHEN WE STARTED",
        description: "At Mintex Staffing, we don’t just fill positions we connect ambition with opportunity. Born out of Mintex Tech, our journey began when candidates walked into our office looking for guidance. We helped them break through barriers and land roles.",
        image: AboutHistory, // Placeholder: use specific images if available
    },
    {
        year: "2010",
        title: "EXPANDING HORIZONS",
        description: "As the tech landscape evolved, so did we. We expanded our operations to cover a wider range of industries, incorporating AI-driven matching algorithms to ensure perfect cultural and technical fits for our clients.",
        image: AboutHistory,
    },
    {
        year: "2018",
        title: "GOING GLOBAL",
        description: "With a solid foundation in the US, Mintex Staffing opened offices in key global markets. Our 24/7 recruitment model allowed us to serve clients across time zones, accelerating hiring cycles significantly.",
        image: AboutHistory,
    },
    {
        year: "2024",
        title: "THE FUTURE IS NOW",
        description: "Today, we stand at the forefront of workforce innovation. Leveraging cutting-edge technology and human insight, we are building not just careers but the future of work itself for thousands of professionals.",
        image: AboutHistory,
    },
];

const History = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Track scroll progress within the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Update active index based on scroll progress
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Map 0-1 range to 0-3 index
            // 0 - 0.25 -> 0
            // 0.25 - 0.5 -> 1
            // 0.5 - 0.75 -> 2
            // 0.75 - 1.0 -> 3
            const newIndex = Math.min(
                Math.floor(latest * historyData.length),
                historyData.length - 1
            );
            setActiveIndex(newIndex);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <div ref={containerRef} className="relative w-full h-[500vh] bg-black">
            <Floats />

            <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl w-full h-full flex flex-col justify-center">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">

                        {/* Left Content */}
                        <div className="flex flex-col gap-4 md:gap-8 relative z-10 order-2 md:order-1 px-4 md:px-0">
                            {/* Animated Text Content */}
                            <div className="relative h-[280px] md:h-[300px]"> {/* Fixed height container to prevent layout shifts */}
                                {historyData.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="absolute top-0 left-0 w-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{
                                            opacity: activeIndex === index ? 1 : 0,
                                            y: activeIndex === index ? 0 : 20,
                                            pointerEvents: activeIndex === index ? "auto" : "none"
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h2 className="font-bebas text-4xl md:text-6xl tracking-wide mb-2 md:mb-4">
                                            <span className="text-[#FBBF24] ">{item.year} {item.title}</span>
                                        </h2>
                                        <p className="text-gray-300 font-gilroy text-sm md:text-lg leading-relaxed line-clamp-6 md:line-clamp-none">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>


                            {/* Improved Timeline Render */}
                            <div className="w-full relative h-4 mt-4 md:mt-8 flex items-center justify-between">
                                {/* Lines Background */}
                                <div className="absolute left-0 right-0 h-0.5 bg-gray-800 top-1/2 -translate-y-1/2"></div>
                                {/* Progress Line */}
                                <motion.div
                                    className="absolute left-0 w-full h-0.5 bg-[#FBBF24] top-1/2 -translate-y-1/2 origin-left"
                                    style={{ scaleX: smoothProgress }}
                                />

                                {/* Dots */}
                                {historyData.map((_, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative z-10 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-black" // border-black to separate from line
                                        style={{
                                            backgroundColor: activeIndex >= index ? '#FBBF24' : '#374151', // Yellow or Gray-700
                                        }}
                                        animate={{
                                            scale: activeIndex === index ? 1.5 : 1,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                    </motion.div>
                                ))}
                            </div>

                        </div>

                        {/* Right Image */}
                        <div className="relative h-[250px] md:h-[500px] w-full flex items-center justify-center order-1 md:order-2">
                            {historyData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="absolute inset-0 w-full h-full"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{
                                        opacity: activeIndex === index ? 1 : 0,
                                        scale: activeIndex === index ? 1 : 0.95
                                    }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="relative w-full h-full overflow-hidden rounded-xl"> {/* Added rounded corners for style */}
                                        <Image
                                            src={item.image}
                                            alt={`${item.year} - ${item.title}`}
                                            fill
                                            className="object-cover md:object-contain" // Cover on mobile to fill frame better
                                            priority={index === 0} // Load first image immediately
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;