"use client";

import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { Mail, Phone, Building, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StyledMapBackground from "./StyledMapBackground";

const ContactClient = () => {
    const [showInfo,  setShowInfo]  = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [pinCoords, setPinCoords] = useState<{ x: number; y: number } | null>(null);
    const [scrollY,   setScrollY]   = useState(0);
    const [formData,  setFormData]  = useState({ name: "", email: "", message: "" });
    const [status,    setStatus]    = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                setStatus("error");
                setErrorMessage(data.error || "Something went wrong.");
            }
        } catch {
            setStatus("error");
            setErrorMessage("Failed to send message. Please try again.");
        }
    };

    /* ── Shared form JSX — plain variable, NOT a nested component, to avoid remount-on-render ── */
    const formBlock = (
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#051116]/80 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm relative">
            <div className="absolute inset-0 rounded-3xl shadow-[0_0_60px_-15px_rgba(8,145,178,0.5)] pointer-events-none z-[-1]" />
            <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2 ml-1 text-white/70 uppercase">Your Name</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} required
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-white/20"
                    placeholder="Enter your name" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 ml-1 text-white/70 uppercase">Your Email</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} required
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-white/20"
                    placeholder="Enter your email" />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2 ml-1 text-white/70 uppercase">Your Message</label>
                <textarea id="message" rows={5} value={formData.message} onChange={handleChange} required
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all resize-none shadow-inner placeholder-white/20"
                    placeholder="HOW CAN WE HELP?" />
            </div>
            <button type="submit" disabled={status === "loading" || status === "success"}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all cursor-pointer mt-4 uppercase tracking-widest ${status === "loading" ? "opacity-70 cursor-wait" : status === "success" ? "cursor-default" : "hover:scale-[1.01] active:scale-[0.98]"}`}
                style={status === "success" ? {
                    background: 'rgba(22,163,74,0.15)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(74,222,128,0.4)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1),0 0 20px rgba(74,222,128,0.25)'
                } : {
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.12),0 0 20px rgba(123,209,232,0.2)'
                }}>
                {status === "loading" ? "Sending..." : status === "success" ? "Message Sent!" : "Send Message"}
            </button>
            {status === "error"   && <p className="text-red-400 text-sm text-center mt-2">{errorMessage}</p>}
            {status === "success" && <p className="text-green-400 text-sm text-center mt-2">Thank you! We'll get back to you shortly.</p>}
        </form>
    );

    /* ── Location info card — plain function, not a nested component ── */
    const renderLocationCard = (onClose: () => void) => (
        <div style={{
            background: 'rgba(5,17,22,0.97)', backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(147,197,253,0.2)',
            borderRadius: '20px', padding: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7),0 0 80px rgba(59,130,246,0.1)',
        }}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white uppercase tracking-widest mb-5 pb-3 border-b border-white/10">Our Location</h2>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                        <Building className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Office Address</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">2163 Oak Tree Rd, Edison, NJ 08820</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                        <Phone className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Call Us</h3>
                        <p className="text-gray-300 text-sm">+1 (732) 983-5723</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                        <Mail className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Email</h3>
                        <p className="text-gray-300 text-sm">info@mintexstaffing.com</p>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ══════════════════════════════════════════════════════════════
       MOBILE LAYOUT  (< 1024px)
       Stack: Header text → Full map (pin clickable) → Contact form
    ══════════════════════════════════════════════════════════════ */
    if (!isDesktop) {
        return (
            <div className="bg-[#0e1626] min-h-screen font-sans text-white pt-24 pb-16">

                {/* 1. Header text card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mx-4 mb-6"
                    style={{
                        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(147,197,253,0.25)',
                        borderRadius: '16px', padding: '20px 24px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.6),0 0 60px rgba(59,130,246,0.15),inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                >
                    <h1 className="text-xl sm:text-2xl font-bold leading-tight uppercase tracking-tight"
                        style={{ textShadow: '0 0 20px rgba(147,197,253,0.5),0 2px 8px rgba(0,0,0,0.9)' }}>
                        Get In Touch With Us.
                        <br />
                        <span className="text-[#93C5FD]"
                            style={{ textShadow: '0 0 25px rgba(147,197,253,0.9),0 0 50px rgba(59,130,246,0.5),0 2px 8px rgba(0,0,0,0.9)' }}>
                            Send Us A Message.
                        </span>
                    </h1>
                </motion.div>

                {/* 2. Full-width map — pin clickable */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mx-4 mb-4"
                    style={{ position: 'relative', height: '380px', borderRadius: '20px', overflow: 'hidden' }}
                >
                    <StyledMapBackground
                        onPinReady={() => {}}
                        onPinClick={() => setShowInfo(v => !v)}
                        onLabelClick={() => setShowInfo(v => !v)}
                    />
                </motion.div>

                {/* Location info — appears BELOW the map, never covering it */}
                <AnimatePresence>
                    {showInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="mx-4 mb-6 relative"
                        >
                            {renderLocationCard(() => setShowInfo(false))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Contact form — scroll-revealed */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.7 }}
                    className="mx-4"
                >
                    <h2 className="text-lg font-semibold text-white/70 uppercase tracking-widest mb-4">Send A Message</h2>
                    {formBlock}
                </motion.div>
            </div>
        );
    }

    /* ══════════════════════════════════════════════════════════════
       DESKTOP LAYOUT  (>= 1024px) — original map-background design
    ══════════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white pt-28 md:pt-32 pb-12 px-4 md:px-8 lg:px-16 bg-[#0e1626]">

            {/* Map background */}
            <div className="absolute inset-0 z-0 lg:z-auto">
                <StyledMapBackground
                    onPinReady={(x, y) => setPinCoords({ x, y })}
                    onPinClick={() => setShowInfo(v => !v)}
                    onLabelClick={() => setShowInfo(v => !v)}
                />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to right, rgba(14,22,38,0.92) 0%, rgba(14,22,38,0.70) 40%, rgba(14,22,38,0.18) 70%, rgba(14,22,38,0.05) 100%)" }} />

            {/* Content */}
            <div className="max-w-7xl mx-auto relative z-20 w-full pointer-events-none">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-8 md:mb-10 inline-block pointer-events-auto"
                    style={{
                        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(147,197,253,0.25)',
                        borderRadius: '16px', padding: '16px 28px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.6),0 0 60px rgba(59,130,246,0.15),inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                >
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-tight"
                        style={{ textShadow: '0 0 20px rgba(147,197,253,0.5),0 2px 8px rgba(0,0,0,0.9)' }}>
                        Get In Touch With Us.
                        <br />
                        <span className="text-[#93C5FD]"
                            style={{ textShadow: '0 0 25px rgba(147,197,253,0.9),0 0 50px rgba(59,130,246,0.5),0 2px 8px rgba(0,0,0,0.9)' }}>
                            Send Us A Message.
                        </span>
                    </h1>
                </motion.div>

                {/* Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-lg pointer-events-auto"
                    >
                        {formBlock}
                    </motion.div>
                </div>
            </div>

            {/* Location popup — position:absolute inside the outer relative div,
                same coordinate space as the Leaflet map, so it scrolls with the page
                and stays locked to the pin regardless of scroll position. */}
            <AnimatePresence>
                {showInfo && pinCoords && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="pointer-events-auto"
                        style={{
                            position: 'fixed',
                            left: Math.min(pinCoords.x + 160, window.innerWidth - 320),
                            top: Math.max(90, pinCoords.y - scrollY - 120),
                            width: '300px',
                            zIndex: 50,
                        }}
                    >
                        {renderLocationCard(() => setShowInfo(false))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactClient;
