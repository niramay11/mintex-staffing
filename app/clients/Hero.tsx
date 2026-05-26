'use client'

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ClientImg from '../assets/client1.png';
import Client2Img from '../assets/client2.png';
import Client3Img from '../assets/client3.png';
import Client4Img from '../assets/client4.png';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
    const containerRef = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const [visibleImageIndex, setVisibleImageIndex] = useState(0); // 0, 1, 2, or 3
    const [isNavbarWhite, setIsNavbarWhite] = useState(false);
    const imageRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

    // Track when navbar turns white (scrolled > 50px)
    useEffect(() => {
        const handleScroll = () => {
            setIsNavbarWhite(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !stickyRef.current) return;

        const ctx = gsap.context(() => {
            // Create a ScrollTrigger that pins the section and controls progress
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: "+=200%", // 200vh scroll distance
                pin: stickyRef.current,
                scrub: 1, // Smooth scrubbing
                onUpdate: (self) => {
                    const progress = self.progress;
                    
                    // Determine which image should be visible based on progress
                    // Divide scroll into 4 equal segments (0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0)
                    let newIndex = 0;
                    if (progress >= 0.75) {
                        newIndex = 3; // Show image 4
                    } else if (progress >= 0.5) {
                        newIndex = 2; // Show image 3
                    } else if (progress >= 0.25) {
                        newIndex = 1; // Show image 2
                    } else {
                        newIndex = 0; // Show image 1
                    }
                    
                    // Update visible image index (this will trigger re-render and show/hide images)
                    setVisibleImageIndex(newIndex);
                }
            });
        }, containerRef);

        return () => {
            ctx.revert(); // Cleanup
        };
    }, []);

    // Animate image visibility with GSAP when visibleImageIndex changes
    useEffect(() => {
        imageRefs.forEach((ref, index) => {
            if (!ref.current) return;
            
            if (index === visibleImageIndex) {
                // Show current image - fade in and scale up
                gsap.to(ref.current, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    pointerEvents: "auto",
                });
            } else {
                // Hide other images - fade out and scale down slightly
                gsap.to(ref.current, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.6,
                    ease: "power2.in",
                    pointerEvents: "none",
                });
            }
        });
    }, [visibleImageIndex]);

    return (
        <section ref={containerRef} className="relative overflow-x-hidden bg-black">
            {/* Sticky container - will be pinned by GSAP */}
            <div ref={stickyRef} className="h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-24 md:pt-32">
                {/* About Us Separator - Moves up when navbar is white */}
                <div className={`flex items-center gap-4 mb-2 md:mb-3 border-b border-gray-600 py-4 md:py-8 w-[140px] md:w-[200px] max-w-md justify-center transition-all duration-300 ${isNavbarWhite ? '-mt-4 md:-mt-6' : ''}`}>
                    <span className="text-gray-300 text-base md:text-3xl font-light tracking-widest uppercase">CLIENTS</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 md:mb-3 text-center max-w-5xl leading-tight text-white px-4">
                    THE RIGHT TALENT DESERVES THAT{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                        SEAT
                    </span>
                </h1>

                {/* Client Images Container - Only one image visible at a time */}
                <div className="relative w-full h-80 md:h-96 flex items-center justify-center px-4 -mt-8 md:-mt-12">
                    {/* First Client Image */}
                    <div
                        ref={imageRefs[0]}
                        className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <Image
                            src={ClientImg}
                            alt="Client 1"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Second Client Image */}
                    <div
                        ref={imageRefs[1]}
                        className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 -ml-4 md:-ml-6 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <Image
                            src={Client2Img}
                            alt="Client 2"
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Third Client Image */}
                    <div
                        ref={imageRefs[2]}
                        className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 -ml-4 md:-ml-6 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <Image
                            src={Client3Img}
                            alt="Client 3"
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Fourth Client Image */}
                    <div
                        ref={imageRefs[3]}
                        className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 -ml-4 md:-ml-6 -mt-8 md:-mt-12 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <Image
                            src={Client4Img}
                            alt="Client 4"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
