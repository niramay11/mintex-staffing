"use client";

import React, { useRef } from "react";
import { FaCog, FaSearch, FaHandshake, FaRocket, FaHeadset } from "react-icons/fa";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";

// ---------------- SVG Glass Component ----------------

// Regular Octagon Path
const pathData = "M96 20 L204 20 L280 96 L280 204 L204 280 L96 280 L20 204 L20 96 Z";

const GlassOctagonSVG = ({ isCenter }: { isCenter?: boolean }) => (
  <svg
    viewBox="0 0 300 300"
    className="absolute inset-0 w-full h-full drop-shadow-2xl"
    style={{ overflow: "visible" }} // Allow glow/shadow to spill out
  >
    <defs>
      <linearGradient id={isCenter ? "centerGradient" : "glassGradient"} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isCenter ? "rgba(34, 211, 238, 0.25)" : "rgba(255, 255, 255, 0.2)"} />
        <stop offset="100%" stopColor={isCenter ? "rgba(34, 211, 238, 0.05)" : "rgba(255, 255, 255, 0.05)"} />
      </linearGradient>
      {/* Darker gradient for thickness/sides */}
      <linearGradient id="thicknessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
      </linearGradient>
    </defs>

    {/* EXTRUSION / THICKNESS LAYER (Simulated back face + sides)
        Offset by 8px to bottom-right to simulate depth */}
    <g transform="translate(8, 8)">
      <path
        d={pathData}
        fill="url(#thicknessGradient)"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1"
      />
    </g>

    {/* MAIN FRONT FACE */}
    <path
      d={pathData}
      fill={`url(#${isCenter ? "centerGradient" : "glassGradient"})`}
      stroke={isCenter ? "rgba(34, 211, 238, 0.6)" : "rgba(255, 255, 255, 0.4)"}
      strokeWidth="1.5"
      className="transition-all duration-500"
      style={{
        filter: isCenter
          ? "drop-shadow(0 0 15px rgba(34, 211, 238, 0.3))"
          : "drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
      }}
    />

    {/* Inner Bevel / Highlight for 3D realism */}
    <path
      d="M25 100 L100 25 L200 25 L275 100"
      fill="none"
      stroke="white"
      strokeOpacity="0.6"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ mixBlendMode: "overlay" }}
    />
  </svg>
);

// ---------------- 3D Tilt Card Wrapper ----------------

function TiltCard({ children, className, delay }: { children: React.ReactNode; className?: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the tilt
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  // Autonomous Idle Animation
  React.useEffect(() => {
    if (isHovered) return;

    let animationFrameId: number;
    const startTime = Date.now();
    // Random offset for each card so they don't move in perfect sync
    const timeOffset = Math.random() * 10000;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime + timeOffset) / 1000; // time in seconds

      // Gentle wobble pattern: Figure-8 or simple orbit
      // Rotate X varies with Sin, Rotate Y with Cos (circular/elliptical path)
      const idleX = Math.sin(elapsed * 0.5) * 8; // +/- 8 degrees
      const idleY = Math.cos(elapsed * 0.3) * 8; // +/- 8 degrees (different frequency)

      x.set(idleX);
      y.set(idleY);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, x, y]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dragX = e.clientX - rect.left;
    const dragY = e.clientY - rect.top;

    // Calculate rotation (-15 to 15 degrees)
    const rotateXPct = (dragY / height - 0.5) * 35; // Increased range for interaction
    const rotateYPct = (dragX / width - 0.5) * -35;

    x.set(rotateXPct);
    y.set(rotateYPct);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    // Spring will handle the smooth return to the idle animation loop
  }

  // Scroll Entrance Animation Variants
  const variants: any = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      rotate: 180, // Spin in
      rotateX: -45, // Tilted back
      z: -200,      // Far away
      y: 100
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      rotateX: 0,
      z: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260, // High snap
        damping: 20,    // Bouncy
        mass: 1,
        delay: delay
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: mouseX,
        rotateY: mouseY,
        transformStyle: "preserve-3d", // Critical for 3D effect
      }}
      className={` ${className} group`}
    >
      <div
        className="w-[300px] h-[300px] flex items-center justify-center relative transition-all duration-300 transform group-hover:scale-110"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ---------------- Main Component ----------------

export default function RefinedFiveCardDiamond() {
  const router = useRouter();

  const handleServiceClick = () => {
    router.push("/served-sectors");
  };

  const services = [
    {
      title: "Optimization",
      subtitle: "Strategic Growth",
      desc: "Enhancing workflows for maximum efficiency.",
      icon: <FaCog size={42} />,
      className: "relative md:absolute md:top-[40px] md:left-[20px] mb-8 md:mb-0",
    },
    {
      title: "Analytics",
      subtitle: "Data Driven",
      desc: "Insightful reporting to guide decisions.",
      icon: <FaSearch size={42} />,
      className: "relative md:absolute md:top-[40px] md:right-[20px] mb-8 md:mb-0",
    },
    {
      title: "Partnership",
      subtitle: "Secure & Trusted",
      desc: "Building lasting collaborative success.",
      icon: <FaHandshake size={52} />,
      className: "relative md:absolute md:top-[50%] md:left-[50%] md:-translate-x-1/2 md:-translate-y-1/2 z-20 mb-8 md:mb-0",
      center: true,
    },
    {
      title: "Scalability",
      subtitle: "Future Ready",
      desc: "Solutions that grow with your business.",
      icon: <FaRocket size={42} />,
      className: "relative md:absolute md:bottom-[40px] md:left-[20px] mb-8 md:mb-0",
    },
    {
      title: "Support",
      subtitle: "24/7 Access",
      desc: "Always available experts for you.",
      icon: <FaHeadset size={42} />,
      className: "relative md:absolute md:bottom-[40px] md:right-[20px] mb-8 md:mb-0",
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-black flex justify-center items-center overflow-auto md:overflow-hidden py-20" style={{ perspective: "1500px" }}>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

      {/* Background Ambient Glows - Blue theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative w-full md:w-[1000px] h-auto md:h-[900px] flex flex-col md:block items-center gap-6 md:gap-0 mt-10 md:mt-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {services.map((s, i) => (
          <TiltCard key={i} className={s.className} delay={i * 0.15}>
            <div onClick={handleServiceClick} className="cursor-pointer w-full h-full relative">
              {/* The SVG Glass Octagon */}
              <div className="absolute inset-0 translate-z-0">
                <GlassOctagonSVG isCenter={s.center} />
              </div>

              {/* Content Layer */}
              <div
                className="relative z-10 p-6 flex flex-col items-center justify-center h-full text-center max-w-[220px] mx-auto"
                style={{ transform: "translateZ(30px)" }}
              >
                <div
                  className={`mb-3 p-3 rounded-full ${s.center
                    ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    : "bg-white/5 text-white shadow-inner"
                    } backdrop-blur-md transition-colors duration-300`}
                >
                  {s.icon}
                </div>

                <h4 className={`font-bold text-xl leading-tight mb-1 ${s.center ? "text-cyan-100" : "text-white"}`}>
                  {s.title}
                </h4>
                <p className={`text-sm font-semibold mb-2 uppercase tracking-wider ${s.center ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-200"}`}>
                  {s.subtitle}
                </p>
                <p className="text-slate-300 text-xs font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          </TiltCard>
        ))}
      </motion.div>
    </div>
  );
}
