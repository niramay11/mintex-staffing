"use client";

import React, { useState } from "react";
import { Mail, Phone, Building, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StyledMapBackground from "./StyledMapBackground";

const ContactClient = () => {
    const [showInfo, setShowInfo] = useState(false);
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
                setTimeout(() => setStatus("idle"), 5000); // Reset success message after 5s
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
        <div className="min-h-screen relative overflow-hidden font-sans text-white pt-48 pb-12 px-4 md:px-8 lg:px-16 bg-[#0e1626]">

            {/* --- BACKGROUND LAYER --- */}
            <div className="absolute inset-0 z-">
                <StyledMapBackground />
            </div>

            {/* Gradient Overlays for Depth and Readability - Reduced opacity for map visibility */}
            <div className="absolute inset-0 bg-linear-to-b 
  from-[#0e1626]/60 
  via-[#0e1626]/30 
  to-[#0e1626]/10 
  z-10 pointer-events-none">
            </div>

            {/* --- CONTENT LAYER --- */}
            <div className="max-w-7xl mx-auto relative z-10 w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 md:mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight uppercase tracking-tight">
                        Get In Touch With Us.
                        <br />
                        <span className="text-white/80">Send Us A Message.</span>
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left Column: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-lg"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6 bg-[#051116]/80 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xs relative">
                            {/* Inner Glow behind form */}
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
                                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all cursor-pointer border border-white/10 mt-4 uppercase tracking-widest ${status === "loading" ? "opacity-70 cursor-wait" :
                                    status === "success" ? "bg-green-600 border-green-500 cursor-default" :
                                        "hover:scale-[1.01] active:scale-[0.98]"
                                    }`}
                                style={status === "success" ? {} : {
                                    background: 'linear-gradient(180deg, #112229 0%, #000000 100%)',
                                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255,255,255,0.05)'
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
                    </motion.div>

                    {/* Right Column: Pin Visual & Info Card */}
                    <div className="relative h-full min-h-[500px] flex flex-col justify-around lg:pl-12">

                        {/* Pulsing Map Pin */}
                        <div
                            className="absolute top-10 left-1/2 transform -translate-x-1/2 lg:left-24 lg:translate-x-0 animate-[floatY_4s_ease-in-out_infinite] cursor-pointer group z-20"
                            onClick={() => setShowInfo(!showInfo)}
                        >
                            <div className="relative">
                                <div className="absolute -inset-6 bg-red-500/30 rounded-full blur-2xl animate-pulse group-hover:bg-red-500/50 transition-colors"></div>
                                <MapPin className="w-16 h-16 text-[#ff5a5a] fill-[#ff5a5a]/20 drop-shadow-[0_0_20px_rgba(255,90,90,0.9)] transition-transform group-hover:scale-110 duration-300" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Info Card Overlay */}
                        <AnimatePresence>
                            {showInfo && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative bg-[#051116]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl z-30 max-w-md ml-auto mr-auto lg:mr-0"
                                >
                                    <button
                                        onClick={() => setShowInfo(false)}
                                        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="space-y-8">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10">
                                                <Building className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Office Address</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed">
                                                   2163 Oak Tree Rd, Edison, NJ 08820
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10">
                                                <Phone className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Call Us</h3>
                                                <p className="text-gray-400 text-sm">
                                                    +1 (732) 983-5723
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10">
                                                <Mail className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Mail</h3>
                                                <p className="text-gray-400 text-sm">
                                                    info@mintexstaffing.com
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactClient;
