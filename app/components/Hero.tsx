"use client";

import { motion } from "framer-motion";
import PeakButton from "../landing/PeakButton";
import HeroCards from "../landing/HeroCards";
import Link from "next/link";

// Container animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Word animation for heading
const headingContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants: any = {
  hidden: { y: 30, opacity: 0, filter: "blur(6px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Subtitle & button animation
const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Cards animation
const cardVariants: any = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      type: "spring",
      stiffness: 100,
      damping: 18,
    },
  },
};

const Hero = () => {
  return (
    <motion.div
      className=" min-h-screen bg-hero pt-18 lg:pt-12 flex flex-col lg:flex-row"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
    >
      {/* LEFT CONTENT */}
      <div className="w-full lg:w-2/3 flex flex-col items-start justify-start pt-8 md:pt-16 lg:pt-32 px-4 sm:px-6 md:px-8 lg:pl-22">

        {/* 🔥 Animated Heading */}
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-bold text-white text-left mb-4 md:mb-6 flex flex-wrap gap-x-2"
          variants={headingContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
        >
          {[
            "Built",
            "for",
            "Startups.",
            "Trusted",
            "by",
            "Enterprises.",
            "Driving",
            "Talent",
            "at",
            "Every",
            "Stage",
          ].map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className={
                ["Built", "Trusted", "Driving", "Talent"].includes(word)
                  ? "text-[#57EEFF]"
                  : ""
              }
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8"
          variants={itemVariants}
          transition={{ delay: 0.6 }}
        >
          From bold beginnings to global scale
          <br className="hidden sm:block" />
          we deliver talent solutions that grow with you
        </motion.p>

        {/* Button */}
        <motion.div
          className="w-full sm:w-auto mb-8 md:mb-12"
          variants={itemVariants}
          transition={{ delay: 0.8 }}
        >
          <PeakButton />
        </motion.div>

        {/* Cards */}
        <motion.div
          className="w-full flex flex-col sm:flex-row justify-start gap-5 md:gap-7 mt-10 md:mt-14 lg:mt-18 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          transition={{ staggerChildren: 0.15 }}
        >
          {/* Candidates */}
          <motion.div
            className="group relative w-full sm:w-[48%] lg:w-96 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-7 md:p-10 flex flex-col gap-5 shadow-[0_0_40px_-10px_rgba(87,238,255,0.1)] transition-all hover:border-[#57EEFF]/50 hover:shadow-[0_0_40px_-10px_rgba(87,238,255,0.3)]"
            variants={cardVariants}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5 h-full justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Candidates</h3>
                <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed">
                  Your next big role is waiting...
                </p>
              </div>

              <Link
                href="/candidates/jobs"
                className="w-full px-6 py-3.5 text-white text-sm md:text-base font-bold uppercase rounded-md text-center tracking-wider transition-all duration-200 active:translate-y-[2px] hover:scale-[1.02]"
                style={{
                  background: 'rgba(155, 81, 224, 0.18)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(155, 81, 224, 0.45)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(155,81,224,0.25)',
                }}
              >
                MAKE YOUR MOVE
              </Link>
            </div>
          </motion.div>

          {/* Clients */}
          <motion.div
            className="group relative w-full sm:w-[48%] lg:w-96 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-7 md:p-10 flex flex-col gap-5 shadow-[0_0_40px_-10px_rgba(87,238,255,0.1)] transition-all hover:border-[#57EEFF]/50 hover:shadow-[0_0_40px_-10px_rgba(87,238,255,0.3)]"
            variants={cardVariants}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5 h-full justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Clients</h3>
                <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed">
                  Let's shape your future team...
                </p>
              </div>

              <Link
                href="/clients/portal"
                className="w-full px-6 py-3.5 text-white text-sm md:text-base font-bold uppercase rounded-md text-center tracking-wider transition-all duration-200 active:translate-y-[2px] hover:scale-[1.02]"
                style={{
                  background: 'rgba(155, 81, 224, 0.18)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(155, 81, 224, 0.45)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(155,81,224,0.25)',
                }}
              >
                HUNT TALENT
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT HERO CARDS */}
      <motion.div
        className="w-full lg:w-1/3 xl:w-1/2 relative mt-8 lg:mt-0 px-4 sm:px-6 md:px-8 lg:px-0"
        initial={{ opacity: 0, x: 80, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: false }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
      >
        <HeroCards />
      </motion.div>
    </motion.div>
  );
};

export default Hero;
