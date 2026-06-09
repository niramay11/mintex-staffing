"use client";

import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { Mail, Phone, Building, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StyledMapBackground from "./StyledMapBackground";

const ContactClient = () => {
    const [showInfo,   setShowInfo]   = useState(false);
    const [pinPos,     setPinPos]     = useState<{ x: number; y: number } | null>(null);
    // true when viewport >= 1024px (lg) — desktop gets floating popup, mobile gets inline
    const [isDesktop,  setIsDesktop]  = useState(false);

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

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
        } catch (error) {
            setStatus("error");
            setErrorMessage("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white pt-28 md:pt-32 pb-12 px-4 md:px-8 lg:px-16 bg-[#0e1626]">

            {/* --- BACKGROUND LAYER ---
                Mobile: z-0 creates stacking context → pin stays below form
                Desktop (lg+): z-auto → pin can be clicked on the right half */}
            <div className="absolute inset-0 z-0 lg:z-auto">
                <StyledMapBackground
                    onPinReady={(x, y) => setPinPos({ x, y })}
                    onPinClick={() => { if (isDesktop) setShowInfo(v => !v); }}
                />
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to right, rgba(14,22,38,0.92) 0%, rgba(14,22,38,0.70) 40%, rgba(14,22,38,0.18) 70%, rgba(14,22,38,0.05) 100%)",
              }}
            />

            {/* --- CONTENT LAYER ---
                pointer-events-none on wrapper so the empty right half (pin area on desktop)
                doesn't block clicks. pointer-events-auto is re-enabled on children. */}
            <div className="max-w-7xl mx-auto relative z-20 w-full pointer-events-none">
                {/* Header — glass card */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-8 md:mb-10 inline-block pointer-events-auto"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(147,197,253,0.25)',
                        borderRadius: '16px',
                        padding: '16px 28px',
                        boxShadow: [
                            '0 8px 40px rgba(0,0,0,0.6)',
                            '0 0 60px rgba(59,130,246,0.15)',
                            'inset 0 1px 0 rgba(255,255,255,0.08)',
                        ].join(', '),
                    }}
                >
                    <h1
                        className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-tight"
                        style={{
                            textShadow: [
                                '0 0 20px rgba(147,197,253,0.5)',
                                '0 2px 8px rgba(0,0,0,0.9)',
                            ].join(', '),
                        }}
                    >
                        Get In Touch With Us.
                        <br />
                        <span
                            className="text-[#93C5FD]"
                            style={{
                                textShadow: [
                                    '0 0 25px rgba(147,197,253,0.9)',
                                    '0 0 50px rgba(59,130,246,0.5)',
                                    '0 2px 8px rgba(0,0,0,0.9)',
                                ].join(', '),
                            }}
                        >
                            Send Us A Message.
                        </span>
                    </h1>
                </motion.div>

                {/* Contact Form + Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-lg pointer-events-auto"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6 bg-[#051116]/80 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xs relative">
                            <div className="absolute inset-0 rounded-3xl shadow-[0_0_60px_-15px_rgba(8,145,178,0.5)] m-0 pointer-events-none z-[-1]"></div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold mb-2 ml-1 text-white/70 uppercase">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-white/20"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold mb-2 ml-1 text-white/70 uppercase">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-white/20"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold mb-2 ml-1 text-white/70 uppercase">
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all resize-none shadow-inner placeholder-white/20"
                                    placeholder="HOW CAN WE HELP?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all cursor-pointer mt-4 uppercase tracking-widest ${status === "loading" ? "opacity-70 cursor-wait" :
                                    status === "success" ? "cursor-default" :
                                        "hover:scale-[1.01] active:scale-[0.98]"
                                    }`}
                                style={status === "success" ? {
                                    background: 'rgba(22, 163, 74, 0.15)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(74, 222, 128, 0.4)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(74,222,128,0.25)'
                                } : {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(123,209,232,0.2)'
                                }}
                            >
                                {status === "loading" ? "Sending..." : status === "success" ? "Message Sent!" : "Send Message"}
                            </button>

                            {status === "error" && (
                                <p className="text-red-400 text-sm text-center mt-2">{errorMessage}</p>
                            )}
                            {status === "success" && (
                                <p className="text-green-400 text-sm text-center mt-2">Thank you! We'll get back to you shortly.</p>
                            )}
                        </form>
                        {/* Mobile-only: trigger button + animated address reveal below form
                            Hidden on desktop — desktop uses the floating popup via pin click */}
                        {!isDesktop && <div className="mt-6">
                            <button
                                onClick={() => setShowInfo(v => !v)}
                                className="w-full py-3 px-6 rounded-xl text-sm font-semibold uppercase tracking-widest text-cyan-300 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all"
                            >
                                {showInfo ? "Hide Location Info" : "View Our Location"}
                            </button>

                            <AnimatePresence>
                                {showInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 16 }}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                        className="mt-4"
                                        style={{
                                            background: 'rgba(5, 17, 22, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            WebkitBackdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(147,197,253,0.2)',
                                            borderRadius: '20px',
                                            padding: '24px',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                                        }}
                                    >
                                        <h2 className="text-base font-bold text-white uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
                                            Our Location
                                        </h2>
                                        <div className="space-y-5">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                                    <Building className="w-5 h-5 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Office Address</h3>
                                                    <p className="text-gray-300 text-sm leading-relaxed">2163 Oak Tree Rd, Edison, NJ 08820</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                                    <Phone className="w-5 h-5 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Call Us</h3>
                                                    <p className="text-gray-300 text-sm">+1 (732) 983-5723</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                                    <Mail className="w-5 h-5 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Email</h3>
                                                    <p className="text-gray-300 text-sm">info@mintexstaffing.com</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>}
                    </motion.div>
                </div>
            </div>

            {/* --- INFO CARD POPUP — desktop only, triggered by pin click --- */}
            <AnimatePresence>
                {isDesktop && showInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            left: pinPos ? Math.min(pinPos.x + 120, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 260) : '5%',
                            top: pinPos ? Math.max(pinPos.y - 60, 80) : '20%',
                            width: 'min(420px, 90vw)',
                            zIndex: 100,
                            background: 'rgba(5, 17, 22, 0.97)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(147,197,253,0.2)',
                            borderRadius: '24px',
                            padding: '32px',
                            boxShadow: [
                                '0 0 0 1px rgba(147,197,253,0.06)',
                                '0 20px 60px rgba(0,0,0,0.7)',
                                '0 0 80px rgba(59,130,246,0.1)',
                                'inset 0 1px 0 rgba(255,255,255,0.07)',
                            ].join(', '),
                        }}
                    >
                        <button
                            onClick={() => setShowInfo(false)}
                            className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6 pb-4 border-b border-white/10">
                            Our Location
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-5">
                                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                    <Building className="w-7 h-7 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">Office Address</h3>
                                    <p className="text-gray-300 text-base leading-relaxed break-words">
                                        2163 Oak Tree Rd, Edison, NJ 08820
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                    <Phone className="w-7 h-7 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">Call Us</h3>
                                    <p className="text-gray-300 text-base">
                                        +1 (732) 983-5723
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                    <Mail className="w-7 h-7 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">Email</h3>
                                    <p className="text-gray-300 text-base">
                                        info@mintexstaffing.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactClient;