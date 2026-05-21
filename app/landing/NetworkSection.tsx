"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRouter } from "next/navigation";

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

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

const HUB = { lat: 39.0997, lng: -94.5786 };
const CHINA_CENTER = { lat: 39.9042, lng: 116.4074 };
const USA_CENTER = { lat: 39.8283, lng: -98.5795 };
const MOBILE_BREAKPOINT = 768;

export default function NetworkSection() {
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const autoScrollingRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Star canvas animation
  useEffect(() => {
    const canvas = starCanvasRef.current;
    const container = stickyRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const STAR_COUNT   = 250;
    const STAR_MIN_R   = 0.6;
    const STAR_MAX_R   = 2.0;
    const CONNECT_DIST = 140;
    const MOUSE_DIST   = 190;
    const STAR_SPEED   = 0.5;
    const LINE_COLOR: [number, number, number] = [120, 190, 255];

    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width  = container.offsetWidth  || window.innerWidth;
      H = canvas.height = container.offsetHeight || window.innerHeight;
    };
    resize();

    let mouse = { x: -9999, y: -9999 };
    let animId: number;

    class Star {
      x = 0; y = 0; r = 0; vx = 0; vy = 0;
      twinkleSpeed = 0; twinklePhase = 0; baseAlpha = 0;
      constructor() { this.reset(true); }
      reset(randomY = false) {
        this.x  = Math.random() * W;
        this.y  = randomY ? Math.random() * H : -10;
        this.r  = STAR_MIN_R + Math.random() * (STAR_MAX_R - STAR_MIN_R);
        this.vx = (Math.random() - 0.5) * STAR_SPEED;
        this.vy = (Math.random() - 0.5) * STAR_SPEED;
        this.twinkleSpeed = 0.008 + Math.random() * 0.014;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.baseAlpha    = 0.65 + Math.random() * 0.35;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.twinklePhase += this.twinkleSpeed;
        if (this.x < -10) this.x = W + 10;
        if (this.x > W + 10) this.x = -10;
        if (this.y < -10) this.y = H + 10;
        if (this.y > H + 10) this.y = -10;
      }
      get alpha() { return this.baseAlpha * (0.75 + 0.25 * Math.sin(this.twinklePhase)); }
      draw() {
        const a = this.alpha; const r = this.r;
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 5);
        grd.addColorStop(0,   `rgba(180,220,255,${a * 0.9})`);
        grd.addColorStop(0.35,`rgba(130,190,255,${a * 0.35})`);
        grd.addColorStop(1,   `rgba(80,140,255,0)`);
        ctx.beginPath(); ctx.arc(this.x, this.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        const outer = r * 1.6; const inner = r * 0.38; const pts = 4;
        ctx.save(); ctx.translate(this.x, this.y); ctx.beginPath();
        for (let i = 0; i < pts * 2; i++) {
          const angle  = (i * Math.PI) / pts - Math.PI / 2;
          const radius = i % 2 === 0 ? outer : inner;
          i === 0
            ? ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
            : ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(220,242,255,${a})`;
        ctx.shadowBlur  = r * 8;
        ctx.shadowColor = `rgba(150,210,255,${a * 0.9})`;
        ctx.fill();
        ctx.restore();
      }
    }

    const drawLine = (x1: number, y1: number, x2: number, y2: number, dist: number, maxDist: number, bright = false) => {
      const t = 1 - dist / maxDist;
      const alpha = bright ? t * 0.85 : t * 0.45;
      const [r, g, b] = LINE_COLOR;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth   = bright ? t * 1.5 : t * 0.9;
      ctx.shadowBlur  = bright ? 6 : 0;
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    };

    const stars = Array.from({ length: STAR_COUNT }, () => new Star());

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => s.update());
      ctx.shadowBlur = 0;
      const near = stars.filter(s => {
        const dx = s.x - mouse.x; const dy = s.y - mouse.y;
        return Math.sqrt(dx * dx + dy * dy) < MOUSE_DIST;
      });
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const dx = near[i].x - near[j].x; const dy = near[i].y - near[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) drawLine(near[i].x, near[i].y, near[j].x, near[j].y, d, CONNECT_DIST);
        }
        const dx = near[i].x - mouse.x; const dy = near[i].y - mouse.y;
        drawLine(near[i].x, near[i].y, mouse.x, mouse.y, Math.sqrt(dx*dx+dy*dy), MOUSE_DIST, true);
      }
      stars.forEach(s => s.draw());
      animId = requestAnimationFrame(animate);
    };

    animate();

    const getRelPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const onMouseMove  = (e: MouseEvent) => { const p = getRelPos(e.clientX, e.clientY); mouse.x = p.x; mouse.y = p.y; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onTouchMove  = (e: TouchEvent) => { const p = getRelPos(e.touches[0].clientX, e.touches[0].clientY); mouse.x = p.x; mouse.y = p.y; };
    const onResize     = () => resize();

    container.addEventListener("mousemove",  onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("touchmove",  onTouchMove as EventListener, { passive: true });
    window.addEventListener("resize",        onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove",  onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("touchmove",  onTouchMove as EventListener);
      window.removeEventListener("resize",        onResize);
    };
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

  // Initialize globe camera and lock all user interaction
  useEffect(() => {
    if (!isClient || !globeRef.current) return;

    const globe = globeRef.current;

    const lockControls = () => {
      if (globe?.controls) {
        const controls = globe.controls();
        controls.autoRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = false;
        controls.enableDamping = false;
        controls.dampingFactor = 0;
        controls.mouseButtons = { LEFT: undefined, MIDDLE: undefined, RIGHT: undefined };
        controls.touches = { ONE: undefined, TWO: undefined };
      }
    };

    const setInitialView = () => {
      if (globe?.pointOfView) {
        globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
      }
      lockControls();
    };

    setInitialView();
    const t1 = setTimeout(setInitialView, 300);
    const t2 = setTimeout(setInitialView, 800);

    const interval = setInterval(lockControls, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [isClient]);

  // GSAP ScrollTrigger — auto-scrolls through the globe animation when section enters view
  useEffect(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const scrollDistance = isMobile ? "+=100%" : "+=150%";

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: "globe-section",
        trigger: containerRef.current,
        start: "top top",
        end: scrollDistance,
        pin: stickyRef.current,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        markers: false,

        onUpdate: (self) => {
          const globe = globeRef.current;
          if (!globe?.pointOfView) return;

          // Keep controls locked
          if (globe.controls) {
            const controls = globe.controls();
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.enableRotate = false;
            controls.enableDamping = false;
          }

          const progress = Math.max(0, Math.min(1, self.progress));

          const initialAltitude = 2.5;
          const finalAltitude   = 1.5; // zoomed-out enough so globe fits nicely on screen

          if (progress === 0) {
            globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: initialAltitude }, 0);
            return;
          }

          // Phase 1 (0–0.4): rotate from China → USA
          // Phase 2 (0.4–1): gentle zoom into USA
          const phase1 = Math.min(1, progress / 0.4);
          const phase2 = Math.max(0, (progress - 0.4) / 0.6);

          const lat = CHINA_CENTER.lat + (USA_CENTER.lat - CHINA_CENTER.lat) * phase1;
          const lng = CHINA_CENTER.lng + (USA_CENTER.lng - CHINA_CENTER.lng) * phase1;

          // smoothstep ease for zoom
          const easedZoom = phase2 * phase2 * (3 - 2 * phase2);
          const altitude  = initialAltitude - (initialAltitude - finalAltitude) * easedZoom;

          globe.pointOfView({ lat, lng, altitude: Math.max(finalAltitude, altitude) }, 0);
        },

        // When section enters viewport, auto-scroll through the full animation
        onEnter: (self) => {
          if (autoScrollingRef.current) return;
          autoScrollingRef.current = true;
          gsap.to(window, {
            scrollTo: { y: self.end, autoKill: true },
            duration: isMobile ? 2.5 : 3,
            ease: "power2.inOut",
            onComplete: () => { autoScrollingRef.current = false; },
            onInterrupt: () => { autoScrollingRef.current = false; },
          });
        },

        onEnterBack: () => {
          const globe = globeRef.current;
          if (globe?.pointOfView) {
            globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
          }
          if (globe?.controls) {
            const controls = globe.controls();
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.enableRotate = false;
          }
        },

        onLeave: () => {
          const globe = globeRef.current;
          if (globe?.pointOfView) {
            globe.pointOfView({ lat: USA_CENTER.lat, lng: USA_CENTER.lng, altitude: 1.5 }, 0);
          }
        },
      });

      setTimeout(() => ScrollTrigger.refresh(), 300);
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  // ---------- Globe data layers ----------

  const pointSize      = isMobile ? 0.15 : 0.2;
  const pointSizeHover = isMobile ? 0.28 : 0.35;

  const globePoints = services.map((s, i) => ({
    lat: s.lat,
    lng: s.lng,
    label: s.label,
    size:  hover === i ? pointSizeHover : pointSize,
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
    { startLat: services[0].lat, startLng: services[0].lng, endLat: services[1].lat,  endLng: services[1].lng,  color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[2].lat, startLng: services[2].lng, endLat: services[5].lat,  endLng: services[5].lng,  color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[6].lat, startLng: services[6].lng, endLat: services[4].lat,  endLng: services[4].lng,  color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[7].lat, startLng: services[7].lng, endLat: services[3].lat,  endLng: services[3].lng,  color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
    { startLat: services[8].lat, startLng: services[8].lng, endLat: services[10].lat, endLng: services[10].lng, color: ["rgba(0,200,255,0.15)", "rgba(0,200,255,0.4)"] },
  ];

  const ringsData  = services.map((s) => ({ lat: s.lat, lng: s.lng }));
  const labelsData = services.map((s) => ({ lat: s.lat, lng: s.lng, text: s.label, city: s.city }));

  const handleGlobeClick = () => router.push("/served-sectors");

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden w-full min-w-0"
      style={{ background: "#000000" }}
    >
      <div
        ref={stickyRef}
        className="h-screen min-h-[100dvh] w-full max-w-full overflow-hidden touch-none flex items-center justify-center relative"
        style={{ background: "#000000" }}
      >
        {/* Star particle background */}
        <canvas
          ref={starCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ display: "block", zIndex: 0 }}
        />

        {isClient && (
          <div
            className="absolute flex items-center justify-center w-full h-full md:inset-0"
            style={{ zIndex: 1 }}
          >
            {/* No onWheel stopPropagation — globe zoom is disabled via controls API */}
            <div className="w-[88vw] h-[88vw] max-h-[75vh] md:w-full md:h-full md:max-h-none">
              <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                backgroundImageUrl=""
                backgroundColor="rgba(0,0,0,0)"
                rendererConfig={{ alpha: true, antialias: true }}

                pointsData={globePoints}
                pointLabel={(d: any) => `<div style="cursor:pointer;font-size:13px;padding:6px 10px;background:rgba(0,0,0,0.85);border:1px solid rgba(87,238,255,0.5);border-radius:6px;color:#57EEFF;font-weight:600;">${d.label}<br/><span style="font-size:10px;color:#fff;opacity:0.6;">Click to view sectors</span></div>`}
                pointColor="color"
                pointRadius="size"
                pointResolution={12}
                pointAltitude={0.01}
                onPointClick={handleGlobeClick}

                arcsData={satelliteArcs}
                arcColor="color"
                arcStroke={null}
                arcAltitude={0.15}
                arcAltitudeAutoScale={0.3}
                arcDashLength={0.6}
                arcDashGap={0.3}
                arcDashAnimateTime={3000}
                arcCurveResolution={isMobile ? 64 : 128}

                ringsData={ringsData}
                ringColor={() => (t: number) => `rgba(0,230,255,${1 - t})`}
                ringMaxRadius={1.5}
                ringPropagationSpeed={1.5}
                ringRepeatPeriod={1400}

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

                showAtmosphere={true}
                atmosphereColor="#57EEFF"
                atmosphereAltitude={0.15}

                enablePointerInteraction={true}
                onPointHover={(point: any) => {
                  if (point) {
                    const index = services.findIndex(s => s.lat === point.lat && s.lng === point.lng);
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

        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
      </div>
    </section>
  );
}
