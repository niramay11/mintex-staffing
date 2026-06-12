"use client";

import { motion } from "framer-motion";
import PeakButton from "../landing/PeakButton";
import HeroCards from "../landing/HeroCards";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const headingContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const wordVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants: any = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.7, type: "spring", stiffness: 100, damping: 18 } },
};

const Hero = () => {
  return (
    <motion.div
      className="bg-hero flex flex-col lg:flex-row w-full overflow-hidden"
      style={{ minHeight: "100svh" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* LEFT CONTENT */}
      <div
        className="w-full lg:w-2/3 flex flex-col items-start justify-between px-4 sm:px-6 md:px-8 lg:pl-16 xl:pl-22"
        style={{
          paddingTop:    "clamp(130px, 15vh, 200px)",
          paddingBottom: "clamp(32px, 5vh, 72px)",
        }}
      >
        {/* Top group: Heading + Subtitle + Button */}
        <div className="flex flex-col items-start">
          {/* Heading */}
          <motion.h1
            className="font-bold text-white text-left flex flex-wrap gap-x-2 mb-3 md:mb-5"
            style={{ fontSize: "clamp(1.5rem, 3vw + 0.4rem, 2.6rem)", lineHeight: 1.2 }}
            variants={headingContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {["Built","for","Startups.","Trusted","by","Enterprises.","Driving","Talent","at","Every","Stage"].map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className={["Built","Trusted","Driving","Talent"].includes(word) ? "text-[#57EEFF]" : ""}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-white mb-4 md:mb-6"
            style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.15rem)" }}
            variants={itemVariants}
            transition={{ delay: 0.6 }}
          >
            From bold beginnings to global scale
            <br className="hidden sm:block" />
            we deliver talent solutions that grow with you
          </motion.p>

          {/* Button */}
          <motion.div
            className="w-full sm:w-auto"
            variants={itemVariants}
            transition={{ delay: 0.8 }}
          >
            <PeakButton />
          </motion.div>
        </div>

        {/* Bottom group: Candidates / Clients cards — anchored to bottom via justify-between */}
        <motion.div
          className="w-full flex flex-col sm:flex-row justify-start gap-4 md:gap-6 mt-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.15 }}
        >
          {/* Candidates */}
          <motion.div
            className="group relative w-full sm:w-[48%] lg:w-80 xl:w-96 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-4 shadow-[0_0_40px_-10px_rgba(87,238,255,0.1)] transition-all hover:border-[#57EEFF]/50 hover:shadow-[0_0_40px_-10px_rgba(87,238,255,0.3)]"
            style={{ padding: "clamp(18px, 2.5vh, 36px) clamp(18px, 2vw, 36px)" }}
            variants={cardVariants}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
              <div>
                <h3 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.2rem, 2vw, 1.75rem)" }}>Candidates</h3>
                <p className="text-gray-300 font-light leading-relaxed" style={{ fontSize: "clamp(0.8rem, 1.1vw, 1rem)" }}>
                  Your next big role is waiting...
                </p>
              </div>
              <Link
                href="/candidates/jobs"
                className="w-full text-white font-bold uppercase rounded-md text-center tracking-wider transition-all duration-200 active:translate-y-[2px] hover:scale-[1.02]"
                style={{
                  fontSize: "clamp(0.7rem, 1vw, 0.875rem)",
                  padding: "clamp(10px, 1.2vh, 14px) 16px",
                  background: "rgba(155,81,224,0.18)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(155,81,224,0.45)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(155,81,224,0.25)",
                }}
              >
                MAKE YOUR MOVE
              </Link>
            </div>
          </motion.div>

          {/* Clients */}
          <motion.div
            className="group relative w-full sm:w-[48%] lg:w-80 xl:w-96 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-4 shadow-[0_0_40px_-10px_rgba(87,238,255,0.1)] transition-all hover:border-[#57EEFF]/50 hover:shadow-[0_0_40px_-10px_rgba(87,238,255,0.3)]"
            style={{ padding: "clamp(18px, 2.5vh, 36px) clamp(18px, 2vw, 36px)" }}
            variants={cardVariants}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
              <div>
                <h3 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.2rem, 2vw, 1.75rem)" }}>Clients</h3>
                <p className="text-gray-300 font-light leading-relaxed" style={{ fontSize: "clamp(0.8rem, 1.1vw, 1rem)" }}>
                  Let&apos;s shape your future team...
                </p>
              </div>
              <Link
                href="/clients/portal"
                className="w-full text-white font-bold uppercase rounded-md text-center tracking-wider transition-all duration-200 active:translate-y-[2px] hover:scale-[1.02]"
                style={{
                  fontSize: "clamp(0.7rem, 1vw, 0.875rem)",
                  padding: "clamp(10px, 1.2vh, 14px) 16px",
                  background: "rgba(155,81,224,0.18)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(155,81,224,0.45)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(155,81,224,0.25)",
                }}
              >
                HUNT TALENT
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT — Floating hero cards */}
      <div className="w-full lg:w-1/3 xl:w-1/2 relative mt-8 lg:mt-0 px-4 sm:px-6 md:px-8 lg:px-0 overflow-hidden">
        <HeroCards />
      </div>
    </motion.div>
  );
};

export default Hero;
