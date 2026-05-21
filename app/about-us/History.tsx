"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AboutHistory from '../assets/about_history.png';
import Floats from '../components/Floats';

const historyData = [
  {
    year: "2002",
    title: "WHEN WE STARTED",
    description: "At Mintex Staffing, we don't just fill positions we connect ambition with opportunity. Born out of Mintex Tech, our journey began when candidates walked into our office looking for guidance. We helped them break through barriers and land roles.",
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

const History = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  // Refs for stable event handlers — no stale closures
  const activeIndexRef = useRef(0);
  const inViewRef     = useRef(false);
  const lockRef       = useRef(false);
  const touchStartY   = useRef(0);

  // Sync state → ref
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  // Fetch custom images from admin
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

  // IntersectionObserver — uses ref so wheel handler always has current value
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Advance helper — returns true if the index changed
  const tryAdvance = (dir: 1 | -1): boolean => {
    if (lockRef.current) return false;
    const next = activeIndexRef.current + dir;
    if (next < 0 || next >= historyData.length) return false;
    lockRef.current = true;
    activeIndexRef.current = next;
    setActiveIndex(next);
    setTimeout(() => { lockRef.current = false; }, 700);
    return true;
  };

  // Wheel — registered once, reads from refs
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!inViewRef.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = activeIndexRef.current + dir;
      // Only capture scroll when there is a valid next item
      if (next >= 0 && next < historyData.length) {
        e.preventDefault();
        tryAdvance(dir);
      }
      // At boundaries, scroll passes through normally
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch swipe
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onEnd   = (e: TouchEvent) => {
      if (!inViewRef.current) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) return;
      tryAdvance(dy > 0 ? 1 : -1);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend',   onEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item     = historyData[activeIndex];
  const imageSrc = customImages[item.year] || AboutHistory;
  const progress = activeIndex / (historyData.length - 1); // 0 → 1

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      <Floats />

      <div className="w-full h-full flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-7xl w-full h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full">

            {/* ── Left: text + timeline ── */}
            <div className="flex flex-col gap-4 md:gap-8 relative z-10 order-2 md:order-1 px-4 md:px-0">
              <div className="relative h-[260px] md:h-[300px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    className="absolute top-0 left-0 w-full"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
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
              <div className="w-full relative h-5 mt-2 md:mt-6 flex items-center justify-between">
                {/* Track */}
                <div className="absolute left-0 right-0 h-0.5 bg-gray-800 top-1/2 -translate-y-1/2" />
                {/* Filled progress */}
                <motion.div
                  className="absolute left-0 h-0.5 bg-[#FBBF24] top-1/2 -translate-y-1/2 origin-left"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                {/* Dots */}
                {historyData.map((d, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      if (lockRef.current) return;
                      lockRef.current = true;
                      activeIndexRef.current = i;
                      setActiveIndex(i);
                      setTimeout(() => { lockRef.current = false; }, 700);
                    }}
                    title={d.year}
                    className="relative z-10 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-black cursor-pointer focus:outline-none"
                    style={{ backgroundColor: activeIndex >= i ? '#FBBF24' : '#374151' }}
                    animate={{ scale: activeIndex === i ? 1.5 : 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              {/* Scroll hint */}
              <p className="text-xs text-gray-600 mt-1 select-none">
                Scroll or swipe to navigate · {activeIndex + 1} / {historyData.length}
              </p>
            </div>

            {/* ── Right: image ── */}
            <div className="relative h-[220px] md:h-[500px] w-full flex items-center justify-center order-1 md:order-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
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
