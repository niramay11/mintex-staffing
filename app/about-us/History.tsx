"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AboutHistory from '../assets/about_history.png';
import Floats from '../components/Floats';

const historyData = [
  {
    year: "2002",
    title: "WHEN WE STARTED",
    description: "At Mintex Staffing, we don't just fill positions — we connect ambition with opportunity. Born out of Mintex Tech, our journey began when candidates walked into our office looking for guidance. We helped them break through barriers and land roles.",
  },
  {
    year: "2010",
    title: "EXPANDING HORIZONS",
    description: "As the tech landscape evolved, so did we. We expanded our operations to cover a wider range of industries, incorporating AI-driven matching algorithms to ensure perfect cultural and technical fits for our clients.",
  },
  {
    year: "2018",
    title: "GOING GLOBAL",
    description: "With a solid foundation in the US, Mintex Staffing opened offices in key global markets. Our 24/7 recruitment model allowed us to serve clients across time zones, accelerating hiring cycles significantly.",
  },
  {
    year: "2024",
    title: "THE FUTURE IS NOW",
    description: "Today, we stand at the forefront of workforce innovation. Leveraging cutting-edge technology and human insight, we are building not just careers but the future of work itself for thousands of professionals.",
  },
];

type HistoryImageItem = { year: string; image_src: string };

// Each item gets exactly 1 viewport-height of scroll range.
// Container = (N+1) × 100vh so the last item also has a full range.
const SECTION_HEIGHT = `${(historyData.length + 1) * 100}vh`;

const History = () => {
  const containerRef              = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  // Fetch admin-uploaded images
  useEffect(() => {
    fetch('/api/history-images')
      .then((r) => r.json())
      .then((data: HistoryImageItem[]) => {
        const map: Record<string, string> = {};
        data.forEach((item) => { map[item.year] = item.image_src; });
        setCustomImages(map);
      })
      .catch(() => {});
  }, []);

  // ─── Scroll-driven index — no wheel hijacking ────────────────────────────────
  // The outer div is SECTION_HEIGHT tall; the inner div is sticky top-0 h-screen.
  // We read scroll position every frame and derive which item to show.
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect              = el.getBoundingClientRect();
      const containerH        = el.offsetHeight;
      const viewportH         = window.innerHeight;
      const scrollableDistance = containerH - viewportH;   // total scroll within section
      const scrolledIn        = -rect.top;                 // px scrolled into the section

      if (scrolledIn <= 0) {
        setActiveIndex(0);
        return;
      }
      if (scrolledIn >= scrollableDistance) {
        setActiveIndex(historyData.length - 1);
        return;
      }

      // Each item occupies (1 / N) of the scrollable range
      const progress = scrolledIn / scrollableDistance;
      const index    = Math.min(
        Math.floor(progress * historyData.length),
        historyData.length - 1,
      );
      setActiveIndex(index);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // resolve initial state
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── Dot click → smooth-scroll to that item's position ──────────────────────
  const scrollToIndex = useCallback((i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const containerH         = el.offsetHeight;
    const viewportH          = window.innerHeight;
    const scrollableDistance = containerH - viewportH;
    const containerTop       = el.getBoundingClientRect().top + window.scrollY;
    // Place scroll so that `i` is at the start of its range, plus a small offset
    const targetScroll = containerTop + (scrollableDistance / historyData.length) * i + 4;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  const item     = historyData[activeIndex];
  const imageSrc = customImages[item.year] || AboutHistory;
  const progress = activeIndex / (historyData.length - 1); // 0 → 1 for the timeline bar

  return (
    // Outer: tall container that creates scroll space
    <div ref={containerRef} className="relative w-full" style={{ height: SECTION_HEIGHT }}>

      {/* Inner: sticks to the top while the outer scrolls past */}
      <div className="sticky top-0 h-screen w-full bg-black overflow-hidden flex items-center justify-center">
        <Floats />

        <div className="container mx-auto px-4 max-w-7xl w-full h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full">

            {/* ── Left: text + timeline ── */}
            <div className="flex flex-col gap-4 md:gap-8 relative z-10 order-2 md:order-1 px-4 md:px-0">

              {/* Fixed-height text area prevents layout shifts */}
              <div className="relative h-[260px] md:h-[300px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    className="absolute top-0 left-0 w-full"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.38, ease: "easeOut" }}
                  >
                    <h2 className="font-bebas text-4xl md:text-6xl tracking-wide mb-2 md:mb-4">
                      <span className="text-[#FBBF24]">{item.year} — {item.title}</span>
                    </h2>
                    <p className="text-gray-300 font-gilroy text-sm md:text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Timeline bar */}
              <div className="w-full relative h-5 flex items-center justify-between">
                {/* Track */}
                <div className="absolute left-0 right-0 h-0.5 bg-gray-800 top-1/2 -translate-y-1/2" />
                {/* Filled progress */}
                <motion.div
                  className="absolute left-0 h-0.5 bg-[#FBBF24] top-1/2 -translate-y-1/2 origin-left"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
                {/* Dots */}
                {historyData.map((d, i) => (
                  <motion.button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    title={d.year}
                    className="relative z-10 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-black cursor-pointer focus:outline-none"
                    style={{ backgroundColor: activeIndex >= i ? '#FBBF24' : '#374151' }}
                    animate={{ scale: activeIndex === i ? 1.5 : 1 }}
                    transition={{ duration: 0.25 }}
                  />
                ))}
              </div>

              {/* Counter */}
              <p className="text-xs text-gray-600 select-none">
                {activeIndex + 1} / {historyData.length}
              </p>
            </div>

            {/* ── Right: image ── */}
            <div className="relative h-[220px] md:h-[480px] w-full flex items-center justify-center order-1 md:order-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <Image
                      src={imageSrc}
                      alt={`${item.year} — ${item.title}`}
                      fill
                      className="object-cover md:object-contain"
                      priority={activeIndex === 0}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
