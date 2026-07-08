"use client";

import React, { useEffect, useState } from "react";
import Profile from "../assets/profile.jpg";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiMiniChartBarSquare, HiMiniUserGroup, HiMiniBuildingOffice2 } from "react-icons/hi2";
import { FiBriefcase, FiMapPin } from "react-icons/fi";

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

const ICONS: Record<string, React.ReactNode> = {
  chart: <HiMiniChartBarSquare className="text-yellow-300 text-3xl" />,
  users: <HiMiniUserGroup className="text-green-300 text-3xl" />,
  building: <HiMiniBuildingOffice2 className="text-blue-300 text-3xl" />,
};

const defaultHeroCardsData: RotatingCardConfig[] = [
  {
    type: 'stat',
    // Fixed 130px from top — always safely below the fixed navbar (~116px)
    desktopPosition: { top: "130px", right: "4%" },
    delay: 0.2,
    rotationInterval: 4000,
    content: [
      { value: "150+", label: "Recruiters", icon: ICONS.chart },
      { value: "10k+", label: "Placements", icon: ICONS.users },
      { value: "500+", label: "Companies", icon: ICONS.building },
    ] as StatData[]
  },
  {
    type: 'job',
    desktopPosition: { top: "40%", left: "4%" },
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
    desktopPosition: { bottom: "8%", right: "10%" },
    delay: 0.6,
    rotationInterval: 4500,
    content: [
      { name: "Rahul Verma", role: "Full-Stack Developer", sub: "MERN | AWS", initial: "R", image: Profile },
      { name: "Sarah Jenkins", role: "UI/UX Designer", sub: "Figma | Adobe", initial: "S", image: Profile },
      { name: "Mike Chen", role: "Backend Lead", sub: "Go | Kubernetes", initial: "M", image: Profile },
    ] as ProfileData[]
  }
];

type HeroApiStat = { id: string; value: string; label: string; icon_key: string };
type HeroApiJob = { id: string; job_title: string; location: string; label: string };
type HeroApiProfile = { id: string; name: string; role: string; sub: string; initial: string; image_url: string | null };

function buildHeroCardsData(api: { stats: HeroApiStat[]; jobs: HeroApiJob[]; profiles: HeroApiProfile[] }): RotatingCardConfig[] {
  return [
    {
      ...defaultHeroCardsData[0],
      content: api.stats.length
        ? api.stats.map(s => ({ value: s.value, label: s.label, icon: ICONS[s.icon_key] ?? ICONS.chart })) as StatData[]
        : defaultHeroCardsData[0].content,
    },
    {
      ...defaultHeroCardsData[1],
      content: api.jobs.length
        ? api.jobs.map(j => ({ jobTitle: j.job_title, location: j.location, label: j.label })) as JobData[]
        : defaultHeroCardsData[1].content,
    },
    {
      ...defaultHeroCardsData[2],
      content: api.profiles.length
        ? api.profiles.map(p => ({ name: p.name, role: p.role, sub: p.sub, initial: p.initial, image: p.image_url || Profile })) as ProfileData[]
        : defaultHeroCardsData[2].content,
    },
  ];
}

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

// Lightweight card background — no blur filters on animated containers
const CardBackground = () => (
  <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
    <div className="absolute inset-0 bg-linear-to-b from-slate-800/80 to-slate-900/90 mix-blend-multiply opacity-90" />
    <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 to-blue-600/10" />
    <div className="absolute inset-0 border border-slate-600/50 rounded-lg" />
    <div className="absolute inset-0 border border-white/10 rounded-lg mix-blend-overlay" />
  </div>
);

const FadingCard = ({ config, isDesktop, standalone = false }: { config: RotatingCardConfig; isDesktop: boolean; standalone?: boolean }) => {
  const isAbsolute = isDesktop && !standalone;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
      className={`w-[150px] h-[170px] sm:w-[180px] sm:h-[200px] ${isAbsolute ? "absolute" : "relative"}`}
      style={isAbsolute ? config.desktopPosition : {}}
      initial={{ opacity: 0, y: 80 }}
      animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* CSS float — cheaper than Framer Motion infinite JS animation */}
      <div
        className="w-full h-full relative"
        style={{
          animation: `floatY 6000ms ease-in-out infinite`,
          animationDelay: `${config.delay * 2}s`,
          willChange: "transform",
        }}
      >
        <div className="w-full h-full relative">
          <CardBackground />
          <div className="relative z-10 w-full h-full">
            <AnimatePresence>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                {renderContent(config.content[currentIndex])}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HeroCards: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [heroCardsData, setHeroCardsData] = useState<RotatingCardConfig[]>(defaultHeroCardsData);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("/api/hero-cards")
      .then(r => r.json())
      .then(data => {
        if (data?.stats || data?.jobs || data?.profiles) {
          setHeroCardsData(buildHeroCardsData(data));
        }
      })
      .catch(() => {});
  }, []);

  const [statCard, jobCard, profileCard] = heroCardsData;

  return (
    <div className={`w-full relative ${isDesktop ? "h-[600px]" : "h-auto py-8 sm:py-10 flex flex-row sm:flex-row flex-wrap gap-4 sm:gap-6 items-center justify-center"}`}>
      {isDesktop ? (
        <>
          {/* Job card — a bit lower and further right than center */}
          <div className="absolute left-[18%] top-[58%] -translate-y-1/2">
            <FadingCard config={jobCard} isDesktop={isDesktop} standalone />
          </div>

          {/* Stat + profile cards — fixed, consistent gap so spacing never depends on container height */}
          <div className="absolute top-[110px] right-[5%] flex flex-col gap-24 items-end">
            <FadingCard config={statCard} isDesktop={isDesktop} standalone />
            <div className="mr-14">
              <FadingCard config={profileCard} isDesktop={isDesktop} standalone />
            </div>
          </div>
        </>
      ) : (
        heroCardsData.map((card, i) => (
          <FadingCard key={i} config={card} isDesktop={isDesktop} />
        ))
      )}
    </div>
  );
};

export default HeroCards;
