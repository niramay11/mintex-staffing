"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false
});

// 12 services matching the served-sectors page exactly
const services = [
  { label: "Information Technology", lat: 47.6, lng: -122.3, city: "Seattle" },
  { label: "Healthcare", lat: 46.8, lng: -71.2, city: "Quebec" },
  { label: "Engineering", lat: 37.8, lng: -122.4, city: "San Francisco" },
  { label: "Finance & Accounting", lat: 38.9, lng: -77.0, city: "Washington DC" },
  { label: "Industrial & Manufacturing", lat: 33.7, lng: -84.4, city: "Atlanta" },
  { label: "Administrative & Clerical", lat: 39.7, lng: -105.0, city: "Denver" },
  { label: "Sales & Marketing", lat: 45.0, lng: -93.3, city: "Minneapolis" },
  { label: "Creative & Design", lat: 33.4, lng: -112.0, city: "Phoenix" },
  { label: "Transportation & Logistics", lat: 29.8, lng: -95.4, city: "Houston" },
  { label: "Education", lat: 48.5, lng: -100.5, city: "North Dakota" },
  { label: "Legal", lat: 41.9, lng: -87.6, city: "Chicago" },
  { label: "Hospitality", lat: 25.8, lng: -80.2, city: "Miami" },
];

// Central hub — Kansas City area (geographic center of USA)
const HUB = { lat: 39.0997, lng: -94.5786 };

// China center coordinates (Beijing)
const CHINA_CENTER = { lat: 39.9042, lng: 116.4074 };

// USA center coordinates
const USA_CENTER = { lat: 39.8283, lng: -98.5795 };

const MOBILE_BREAKPOINT = 768;

export default function NetworkSection() {
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Refresh ScrollTrigger on resize
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Initialize globe camera position and lock all user interaction
  useEffect(() => {
    if (!isClient || !globeRef.current) return;

    const globe = globeRef.current;

    const lockControls = () => {
      if (globe && globe.controls) {
        const controls = globe.controls();
        controls.autoRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = false;
        controls.enableDamping = false;
        controls.dampingFactor = 0;
        // Prevent scroll wheel from affecting the globe
        controls.mouseButtons = { LEFT: undefined, MIDDLE: undefined, RIGHT: undefined };
        controls.touches = { ONE: undefined, TWO: undefined };
      }
    };

    const setInitialView = () => {
      if (globe && globe.pointOfView) {
        globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
      }
      lockControls();
    };

    setInitialView();
    setTimeout(setInitialView, 100);
    setTimeout(setInitialView, 500);
    setTimeout(setInitialView, 1000);

    // Continuously enforce locked controls to prevent any external interference
    const interval = setInterval(lockControls, 500);
    return () => clearInterval(interval);
  }, [isClient]);

  // GSAP ScrollTrigger setup (reduced scroll distance)
  useEffect(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const scrollDistance = isMobile ? "+=100%" : "+=150%";

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: scrollDistance,
        pin: stickyRef.current,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        markers: false,
        onUpdate: (self) => {
          const progress = self.progress;

          const globe = globeRef.current;
          if (!globe || !globe.pointOfView) return;

          // Always lock controls to prevent user-triggered zoom
          if (globe.controls) {
            const controls = globe.controls();
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.enableRotate = false;
            controls.enableDamping = false;
            controls.minDistance = 0;
            controls.maxDistance = Infinity;
          }

          const clampedProgress = Math.max(0, Math.min(1, progress));

          const initialAltitude = 2.5;
          const finalAltitude = 0.45;

          if (clampedProgress === 0) {
            globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: initialAltitude }, 0);
            return;
          }

          // Phase 1 (0-0.4): rotate from China to USA
          // Phase 2 (0.4-1): zoom into USA
          const phase1Progress = Math.min(1, clampedProgress / 0.4);
          const phase2Progress = Math.max(0, (clampedProgress - 0.4) / 0.6);

          const lat = CHINA_CENTER.lat + (USA_CENTER.lat - CHINA_CENTER.lat) * phase1Progress;
          const lng = CHINA_CENTER.lng + (USA_CENTER.lng - CHINA_CENTER.lng) * phase1Progress;

          // Smooth eased zoom
          const easedZoom = phase2Progress * phase2Progress * (3 - 2 * phase2Progress); // smoothstep
          const altitude = initialAltitude - (initialAltitude - finalAltitude) * easedZoom;

          globe.pointOfView({ lat, lng, altitude: Math.max(finalAltitude, altitude) }, 0);
        },
        onEnter: () => {
          const globe = globeRef.current;
          if (globe && globe.pointOfView) {
            globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
          }
        },
        onEnterBack: () => {
          // When scrolling back into the section, reset to a safe state
          const globe = globeRef.current;
          if (globe && globe.pointOfView) {
            globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
          }
          if (globe && globe.controls) {
            const controls = globe.controls();
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.enableRotate = false;
          }
        },
        onLeave: () => {
          const globe = globeRef.current;
          if (globe && globe.pointOfView) {
            globe.pointOfView({ lat: USA_CENTER.lat, lng: USA_CENTER.lng, altitude: 0.45 }, 0);
          }
        }
      });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isMobile]);

  // ---------- Globe data layers ----------

  const pointSize = isMobile ? 0.15 : 0.2;
  const pointSizeHover = isMobile ? 0.28 : 0.35;
  const globePoints = services.map((s, i) => ({
    lat: s.lat,
    lng: s.lng,
    label: s.label,
    size: hover === i ? pointSizeHover : pointSize,
    color: hover === i ? "#ffffff" : "rgba(0,230,255,0.9)",
  }));

  const satelliteArcs = [
    ...services.map((s) => ({
      startLat: HUB.lat,
      startLng: HUB.lng,
      endLat: s.lat,
      endLng: s.lng,
      color: ["rgba(0,230,255,0.3)", "rgba(0,230,255,0.7)"],
    })),
    { startLat: services[0].lat, startLng: services[0].lng, endLat: services[1].lat, endLng: services[1].lng, color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[2].lat, startLng: services[2].lng, endLat: services[5].lat, endLng: services[5].lng, color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[6].lat, startLng: services[6].lng, endLat: services[4].lat, endLng: services[4].lng, color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[7].lat, startLng: services[7].lng, endLat: services[3].lat, endLng: services[3].lng, color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[8].lat, startLng: services[8].lng, endLat: services[10].lat, endLng: services[10].lng, color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
  ];

  const ringsData = services.map((s) => ({
    lat: s.lat,
    lng: s.lng,
  }));

  const labelsData = services.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    text: s.label,
    city: s.city,
  }));

  const handleGlobeClick = () => {
    router.push("/served-sectors");
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-black w-full min-w-0"
    >
      <div
        ref={stickyRef}
        className="h-screen min-h-[100dvh] w-full max-w-full overflow-hidden touch-none flex items-center justify-center"
      >
        {isClient && (
          <div className="absolute flex items-center justify-center w-full h-full md:inset-0">
            <div className="w-[88vw] h-[88vw] max-h-[75vh] md:w-full md:h-full md:max-h-none" onWheel={(e) => e.stopPropagation()}>
            <Globe
              ref={globeRef}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

              // --- Point markers ---
              pointsData={globePoints}
              pointLabel={(d: any) => `<div style="cursor:pointer;font-size:13px;padding:6px 10px;background:rgba(0,0,0,0.85);border:1px solid rgba(87,238,255,0.5);border-radius:6px;color:#57EEFF;font-weight:600;">${d.label}<br/><span style="font-size:10px;color:#fff;opacity:0.6;">Click to view sectors</span></div>`}
              pointColor="color"
              pointRadius="size"
              pointResolution={12}
              pointAltitude={0.01}
              onPointClick={handleGlobeClick}

              // --- Arcs ---
              arcsData={satelliteArcs}
              arcColor="color"
              arcStroke={null}
              arcAltitude={0.15}
              arcAltitudeAutoScale={0.3}
              arcDashLength={0.6}
              arcDashGap={0.3}
              arcDashAnimateTime={3000}
              arcCurveResolution={isMobile ? 64 : 128}

              // --- Pulsing rings ---
              ringsData={ringsData}
              ringColor={() => (t: number) => `rgba(0,230,255,${1 - t})`}
              ringMaxRadius={1.5}
              ringPropagationSpeed={1.5}
              ringRepeatPeriod={1400}

              // --- Labels ---
              labelsData={labelsData}
              labelText="text"
              labelSize={isMobile ? 0.85 : 1.2}
              labelColor={() => "#ffffff"}
              labelResolution={6}
              labelAltitude={0.018}
              labelIncludeDot={true}
              labelDotRadius={0.15}
              labelDotOrientation={() => "bottom"}
              labelsTransitionDuration={0}

              // --- Atmosphere ---
              showAtmosphere={true}
              atmosphereColor="#57EEFF"
              atmosphereAltitude={0.15}

              // --- Interaction — ENABLED for clicking ---
              enablePointerInteraction={true}
              onPointHover={(point: any) => {
                if (point) {
                  const index = services.findIndex(ind => ind.lat === point.lat && ind.lng === point.lng);
                  setHover(index);
                } else {
                  setHover(null);
                }
              }}
              onLabelClick={handleGlobeClick}
            />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
      </div>
    </section>
  );
}
