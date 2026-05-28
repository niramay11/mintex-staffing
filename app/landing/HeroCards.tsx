"use client";

import React, { useEffect, useState } from "react";
import Profile from "../assets/profile.jpg";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiMiniChartBarSquare, HiMiniUserGroup, HiMiniBuildingOffice2 } from "react-icons/hi2";
import { FiBriefcase, FiMapPin } from "react-icons/fi";

/**
 * HeroCards Component
 *
 * Displays mixed content cards (Stats, Jobs, Profiles) in a scattered layout.
 * Each card fades between content items without any flip/rotation effect.
 */

// --- Types ---

type CardType = 'stat' | 'job' | 'profile';

interface BaseCardData {
  type: CardType;
  desktopPosition: { top?: string; bottom?: string; left?: string; right?: string };
  delay: number;
  rotationInterval: number;
}

interface StatData {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface JobData {
  jobTitle: string;
  location: string;
  label: string;
}

interface ProfileData {
  name: string;
  role: string;
  sub: string;
  initial: string;
  image?: any;
}

type CardContentData = StatData | JobData | ProfileData;

interface RotatingCardConfig extends BaseCardData {
  content: CardContentData[];
}

// --- Data ---

const heroCardsData: RotatingCardConfig[] = [
  {
    type: 'stat',
    desktopPosition: { top: "15%", right: "5%" },
    delay: 0.2,
    rotationInterval: 4000,
    content: [
      { value: "150+", label: "Recruiters", icon: <HiMiniChartBarSquare className="text-yellow-300 text-3xl" /> },
      { value: "10k+", label: "Placements", icon: <HiMiniUserGroup className="text-green-300 text-3xl" /> },
      { value: "500+", label: "Companies", icon: <HiMiniBuildingOffice2 className="text-blue-300 text-3xl" /> },
    ] as StatData[]
  },
  {
    type: 'job',
    desktopPosition: { top: "35%", left: "5%" },
    delay: 0.4,
    rotationInterval: 5000,
    content: [
      { jobTitle: "Java Developer", location: "Remote / Hybrid", label: "We are Hiring" },
      { jobTitle: "React Native Dev", location: "Bengaluru, India", label: "Urgent Requirement" },
      { jobTitle: "DevOps Engineer", location: "Hyderabad, On-site", label: "Top Priority" },
    ] as JobData[]
  },
  {
    type: 'profile',
    desktopPosition: { bottom: "0%", right: "15%" },
    delay: 0.6,
    rotationInterval: 4500,
    content: [
      { name: "Rahul Verma", role: "Full-Stack Developer", sub: "MERN | AWS", initial: "R", image: Profile },
      { name: "Sarah Jenkins", role: "UI/UX Designer", sub: "Figma | Adobe", initial: "S", image: Profile },
      { name: "Mike Chen", role: "Backend Lead", sub: "Go | Kubernetes", initial: "M", image: Profile },
    ] as ProfileData[]
  }
];

// --- Sub-components (Content Renderers) ---

const StatContent = ({ data }: { data: StatData }) => (
  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
    <div className="mb-2 p-3 bg-white/5 rounded-full ring-1 ring-white/10 shadow-lg backdrop-blur-sm">
      {data.icon}
    </div>
    <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">{data.value}</h2>
    <p className="text-cyan-200 text-sm font-medium uppercase tracking-wider">{data.label}</p>
  </div>
);

const JobContent = ({ data }: { data: JobData }) => (
  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
    <div className="rounded-full bg-green-500/20 px-3 py-1 mb-3 border border-green-500/30 backdrop-blur-md animate-pulse">
      <h4 className="text-green-300 text-[10px] font-bold tracking-widest uppercase">{data.label}</h4>
    </div>
    <div className="mb-2">
      <FiBriefcase className="text-cyan-400 text-xl mx-auto mb-2" />
      <h3 className="text-white text-lg font-semibold leading-tight">{data.jobTitle}</h3>
    </div>
    <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs font-medium bg-slate-800/50 px-2 py-1 rounded-md">
      <FiMapPin className="text-xs" />
      {data.location}
    </div>
  </div>
);

const ProfileContent = ({ data }: { data: ProfileData }) => (
  <div className="flex flex-col items-center justify-center h-full p-4">
    <div className="relative mb-3">
      <div className="absolute -top-1 -right-4 w-8 h-8 rounded-full bg-[#5D4037] border-2 border-[#1E293B] flex items-center justify-center z-20 shadow-md">
        <span className="text-white text-xs font-bold">{data.initial}</span>
      </div>
      <div className="w-[60px] h-[60px] rounded-full overflow-hidden ring-2 ring-cyan-500/30 shadow-lg relative z-10">
        <Image src={data.image || Profile} alt={data.name} width={60} height={60} className="object-cover" />
      </div>
    </div>
    <div className="rounded-full bg-slate-700/50 px-3 py-1 mb-2 border border-slate-600/50 backdrop-blur-md">
      <h4 className="text-white text-xs font-semibold tracking-wide">{data.name}</h4>
    </div>
    <div className="text-center">
      <p className="text-[10px] text-cyan-200 font-medium uppercase tracking-wider mb-0.5 opacity-90">{data.role}</p>
      <p className="text-[9px] text-slate-400 font-medium">{data.sub}</p>
    </div>
  </div>
);

const CardBackground = () => (
  <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
    <div className="absolute inset-0 bg-linear-to-b from-slate-800/80 to-slate-900/90 mix-blend-multiply opacity-90" />
    <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 to-blue-600/10" />
    <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/20 blur-[30px] rounded-full" />
    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/20 blur-[30px] rounded-full" />
    <div className="absolute inset-0 border border-slate-600/50 rounded-lg" />
    <div className="absolute inset-0 border border-white/10 rounded-lg mix-blend-overlay" />
  </div>
);

// --- Fading Card Component (No Flip) ---

const FadingCard = ({ config, isDesktop }: { config: RotatingCardConfig; isDesktop: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait for page to fully paint, then stagger the rise by each card's delay
    const t = setTimeout(() => setMounted(true), 150 + config.delay * 200);
    return () => clearTimeout(t);
  }, [config.delay]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % config.content.length);
    }, config.rotationInterval);
    return () => clearInterval(interval);
  }, [config.rotationInterval, config.content.length]);

  const renderContent = (data: CardContentData) => {
    if (config.type === 'stat') return <StatContent data={data as StatData} />;
    if (config.type === 'job') return <JobContent data={data as JobData} />;
    if (config.type === 'profile') return <ProfileContent data={data as ProfileData} />;
    return null;
  };

  return (
    <motion.div
      className={`w-[180px] h-[200px] ${isDesktop ? "absolute" : "relative"}`}
      style={isDesktop ? config.desktopPosition : {}}
      initial={{ opacity: 0, y: 80 }}
      animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Floating Animation */}
      <motion.div
        className="w-full h-full relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: config.delay * 2 }}
      >
        <div className="w-full h-full relative">
          <CardBackground />
          <div className="relative z-10 w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full"
              >
                {renderContent(config.content[currentIndex])}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const HeroCards: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`w-full relative ${isDesktop ? "h-[600px]" : "h-auto py-10 flex flex-col gap-6 items-center"}`}>
      {heroCardsData.map((card, i) => (
        <FadingCard key={i} config={card} isDesktop={isDesktop} />
      ))}
    </div>
  );
};

export default HeroCards;
