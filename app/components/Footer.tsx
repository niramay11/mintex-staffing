"use client";

import { useEffect, useRef } from "react";
import { FaLinkedinIn, FaFacebookF, FaTwitter } from "react-icons/fa";
import Mintex from "../assets/logo_orange.svg";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:bg-[#9B5CF6] hover:border-[#9B5CF6] hover:text-white transition duration-300 transform hover:scale-110"
        >
            {icon}
        </Link>
    );
}

const MINTEX_LETTERS = ["M", "I", "N", "T", "E", "X"];

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const sectionRef = useRef<HTMLDivElement>(null);
    const mintexWrapRef = useRef<HTMLDivElement>(null);
    const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
    const footerContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !mintexWrapRef.current || !footerContentRef.current) return;

        const ctx = gsap.context(() => {
            gsap.set(lettersRef.current, { opacity: 0, y: 50 });
            gsap.set(footerContentRef.current, { opacity: 0 });

            // Time-based animation, triggered once when footer enters viewport
            const tl = gsap.timeline({
                paused: true,
            });

            // Phase 1: Letters appear one by one
            lettersRef.current.forEach((letter, i) => {
                tl.to(letter, {
                    opacity: 1,
                    y: 0,
                    duration: 0.15,
                    ease: "power2.out",
                }, i * 0.12);
            });

            // Phase 2: Hold
            tl.to({}, { duration: 0.6 });

            // Phase 3: MINTEX fades out
            tl.to(mintexWrapRef.current, {
                opacity: 0,
                scale: 0.9,
                duration: 0.4,
                ease: "power2.in",
            });

            // Phase 4: Footer content fades in
            tl.to(footerContentRef.current, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });

            // Trigger once on scroll into view
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top 85%",
                once: true,
                onEnter: () => tl.play(),
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer>
            <div ref={sectionRef} className="w-full relative bg-[#070E2A] overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#9B5CF6] shadow-xl shadow-[#9B5CF6]/50 z-20" />

                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                    style={{
                        backgroundImage:
                            "repeating-radial-gradient(circle at 100% 100%, #7ED6E6 0%, #070E2A 20%)",
                    }}
                />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 md:py-14">
                    {/* MINTEX centered letter-by-letter — shown first, then hidden */}
                    <div
                        ref={mintexWrapRef}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                    >
                        <h2 className="flex">
                            {MINTEX_LETTERS.map((letter, i) => (
                                <span
                                    key={i}
                                    ref={(el) => { lettersRef.current[i] = el; }}
                                    className="text-[60px] sm:text-[80px] md:text-[110px] lg:text-[140px] font-extrabold tracking-widest text-white drop-shadow-[0_0_30px_#7ED6E644] select-none"
                                    style={{ willChange: "transform, opacity" }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </h2>
                    </div>

                    {/* Footer content — appears after MINTEX hides */}
                    <div ref={footerContentRef} style={{ willChange: "opacity" }}>
                        {/* Big STAFFING + Logo + Links */}
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
                            {/* LEFT: Logo + STAFFING */}
                            <div className="flex items-center gap-4">
                                <div className="w-[80px] md:w-[110px] lg:w-[130px] shrink-0">
                                    <Image
                                        src={Mintex}
                                        alt="Mintex Logo"
                                        width={120}
                                        height={120}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                                <h2 className="text-[40px] sm:text-[50px] md:text-[70px] lg:text-[90px] font-extrabold text-white tracking-widest leading-none select-none">
                                    STAFFING
                                </h2>
                            </div>

                            {/* RIGHT: NAVIGATION LINKS */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-center lg:text-left text-sm md:text-base">
                                <div className="flex flex-col gap-2.5">
                                    <Link href="/about-us" className="text-gray-300 hover:text-white font-medium transition-colors">About US</Link>
                                    <Link href="/clients" className="text-gray-300 hover:text-white font-medium transition-colors">Clients</Link>
                                    <Link href="/candidates" className="text-gray-300 hover:text-white font-medium transition-colors">Candidates</Link>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <Link href="/served-sectors" className="text-gray-300 hover:text-white font-medium transition-colors">Served Sectors</Link>
                                    <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors">Solutions</Link>
                                    <Link href="/contact-us" className="text-gray-300 hover:text-white font-medium transition-colors">Contact us</Link>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM BAR */}
                        <div className="mt-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t border-white/10 text-white/50 text-sm gap-4">
                                <div className="flex gap-4 order-2 sm:order-1">
                                    <SocialIcon icon={<FaLinkedinIn />} href="https://linkedin.com" />
                                    <SocialIcon icon={<FaFacebookF />} href="https://facebook.com" />
                                    <SocialIcon icon={<FaTwitter />} href="https://twitter.com" />
                                </div>
                                <p className="order-1 sm:order-2">
                                    &copy; {currentYear} Mintex. All rights reserved
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
