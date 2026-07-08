'use client'

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ClientImg from '../assets/client1.png';
import Client2Img from '../assets/client2.png';
import Client3Img from '../assets/client3.png';
import Client4Img from '../assets/client4.png';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
    const containerRef = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const [visibleImageIndex, setVisibleImageIndex] = useState(0);
    const [isNavbarWhite, setIsNavbarWhite] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const imageRefs = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];

    // Use slideshow for anything < 1280px — desktop flex layout needs 1280px+ to fit all 4 images
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1280);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Navbar scroll colour
    useEffect(() => {
        const handleScroll = () => setIsNavbarWhite(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // GSAP scroll-pin: 1280px+ only — below that the slideshow handles it
    useEffect(() => {
        if (isMobile) return;
        if (!containerRef.current || !stickyRef.current) return;
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: '+=200%',
                pin: stickyRef.current,
                scrub: 1,
                onUpdate: (self) => {
                    const p = self.progress;
                    let idx = 0;
                    if (p >= 0.75) idx = 3;
                    else if (p >= 0.5) idx = 2;
                    else if (p >= 0.25) idx = 1;
                    setVisibleImageIndex(idx);
                },
            });
        }, containerRef);
        return () => ctx.revert();
    }, [isMobile]);

    // GSAP fade each image in/out
    useEffect(() => {
        imageRefs.forEach((ref, index) => {
            if (!ref.current) return;

            if (index === visibleImageIndex) {
                gsap.to(ref.current, { opacity: 1, scale: 1, duration: isMobile ? 0.25 : 0.6, ease: 'power2.out', overwrite: true });
            } else {
                if (isMobile) {
                    // Instantly hide on mobile — no crossfade overlap
                    gsap.set(ref.current, { opacity: 0, scale: 1 });
                } else {
                    gsap.to(ref.current, { opacity: 0, scale: 0.95, duration: 0.6, ease: 'power2.in', overwrite: true });
                }
            }
        });
    }, [visibleImageIndex, isMobile]);

    return (
        <section ref={containerRef} className="relative overflow-x-hidden bg-black">
            <div
                ref={stickyRef}
                className={`w-full flex flex-col items-center justify-center overflow-hidden ${isMobile ? 'py-16 px-4' : 'h-screen pt-20 md:pt-32'
                    }`}
            >
                {/* CLIENTS label */}
                <div
                    className={`flex items-center gap-4 mb-2 md:mb-3 border-b border-gray-600 py-4 md:py-8 w-[140px] md:w-[200px] max-w-md justify-center transition-all duration-300 ${isNavbarWhite ? '-mt-4 md:-mt-6' : ''}`}
                >
                    <span className="text-gray-300 text-base md:text-3xl font-light tracking-widest uppercase">
                        CLIENTS
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 md:mb-3 text-center max-w-5xl leading-tight text-white px-4">
                    THE RIGHT TALENT DESERVES THAT{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                        SEAT
                    </span>
                </h1>

                {/* ── MOBILE layout: single static image (sitting pose), no carousel/scroll ── */}
                {isMobile && (
                    <div
                        style={{
                            position: 'relative',
                            width: 'min(300px, 70vw)',
                            height: 'min(360px, 78vw)',
                            filter: 'drop-shadow(0 0 24px rgba(34,211,238,0.5))',
                        }}
                    >
                        <Image
                            src={Client4Img}
                            alt="Client"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                )}

                {/* ── DESKTOP layout: original flex row with negative-margin overlap ── */}
                {!isMobile && (
                    <div className="relative w-full h-80 md:h-96 flex items-center justify-center px-4 -mt-8 md:-mt-12">
                        {/* Image 1 */}
                        <div
                            ref={imageRefs[0]}
                            style={{ opacity: 1 }}
                            className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            <Image src={ClientImg} alt="Client 1" fill className="object-contain" priority />
                        </div>
                        {/* Image 2 */}
                        <div
                            ref={imageRefs[1]}
                            style={{ opacity: 0 }}
                            className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 -ml-4 md:-ml-6 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            <Image src={Client2Img} alt="Client 2" fill className="object-contain" />
                        </div>
                        {/* Image 3 */}
                        <div
                            ref={imageRefs[2]}
                            style={{ opacity: 0 }}
                            className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 -ml-4 md:-ml-6 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            <Image src={Client3Img} alt="Client 3" fill className="object-contain" />
                        </div>
                        {/* Image 4 */}
                        <div
                            ref={imageRefs[3]}
                            style={{ opacity: 0 }}
                            className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-96 z-20 shrink-0 -ml-4 md:-ml-6 -mt-8 md:-mt-12 pointer-events-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            <Image src={Client4Img} alt="Client 4" fill className="object-contain" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
