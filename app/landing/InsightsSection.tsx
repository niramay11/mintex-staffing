"use client";

import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type MediaItem = {
  id: string;
  src: string;
  alt: string;
  url: string;
};

function ReelPlayer({ src, url }: { src: string; url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    return () => {
      video.pause();
    };
  }, [src]);

  const handleClick = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="group relative w-full h-full rounded-lg overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

      {/* Border glow on hover */}
      <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-[#57EEFF]/50 transition-all duration-300 z-10 pointer-events-none" />
    </div>
  );
}

export default function InsightsSection() {
  const [showReels, setShowReels] = useState(false);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [reels, setReels] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((data) => {
        setImages(data.images || []);
        setReels(data.reels || []);
      })
      .catch(() => {});
  }, []);


  return (
    <section className="w-full bg-black py-20 md:py-32 overflow-hidden relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* LEFT CONTENT */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                staggerChildren: 0.2,
                when: "beforeChildren",
              },
            },
          }}
          /* 
            FIX: Added `lg:self-start lg:pt-16` 
            This breaks the left column out of the parent's `items-center` logic, pinning it to 
            the top. The `lg:pt-16` keeps it looking perfectly centered vertically on large screens.
          */
          className="text-white max-w-md lg:self-start lg:pt-16"
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-4xl md:text-5xl font-bold leading-tight"
          >
            Insights That Inform.
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
              Stories That Inspire.
            </span>
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mt-6 text-base md:text-lg leading-relaxed text-gray-300"
          >
            Discover industry insights, hiring tips, and success stories
            straight from our social platforms. Follow us to stay ahead with
            trends that matter to your career and business.
          </motion.p>

          {/* Social Icons */}
          <motion.div className="flex gap-4 mt-10">
            <SocialIcon icon={<FaInstagram />} delay={0.1} />
            <SocialIcon icon={<FaFacebookF />} delay={0.2} />
            <SocialIcon icon={<FaLinkedinIn />} delay={0.3} />
          </motion.div>

          {/* Toggle button */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setShowReels(false)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${!showReels ? "bg-cyan-500 text-black" : "border border-white/20 text-white/60 hover:text-white"}`}
            >
              Posts
            </button>
            <button
              onClick={() => setShowReels(true)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${showReels ? "bg-cyan-500 text-black" : "border border-white/20 text-white/60 hover:text-white"}`}
            >
              Reels
            </button>
          </div>
        </motion.div>

        {/* RIGHT GRID - ORIGINAL CODE UNTOUCHED */}
        <div className="relative min-h-[340px] md:min-h-[420px]">
          <AnimatePresence mode="wait">
            {!showReels ? (
              <motion.div
                key="images"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 gap-4 md:gap-6"
              >
                {images.map((img, i) => (
                  <motion.a
                    key={i}
                    href={img.url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer block"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 33vw, 200px"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-[#57EEFF]/50 transition-all duration-300 z-10" />
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <div className="absolute inset-0 shadow-[0_0_20px_rgba(87,238,255,0.3)] rounded-lg" />
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="reels"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 gap-4 md:gap-6 h-full"
              >
                {reels.map((reel, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.15 }}
                    className="aspect-[9/16] max-h-[420px] rounded-lg overflow-hidden"
                  >
                    <ReelPlayer src={reel.src} url={reel.url} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- */
/* Helper Component */
/* ----------------------- */
function SocialIcon({ icon, delay = 0 }: { icon: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 + delay }}
      className="group relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#57EEFF] hover:text-[#57EEFF] transition-all duration-300 cursor-pointer backdrop-blur-sm bg-black/20 hover:bg-black/40 hover:shadow-[0_0_15px_rgba(87,238,255,0.3)]"
    >
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
      <div className="relative z-10">{icon}</div>
    </motion.div>
  );
}