"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import * as THREE from "three";

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
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

const correctCameraUp = (globe: any, lat: number, lng: number) => {
  const camera = globe?.camera?.();
  if (!camera) return;
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);
  camera.up.set(
    -Math.sin(latRad) * Math.sin(lngRad),
     Math.cos(latRad),
    -Math.sin(latRad) * Math.cos(lngRad)
  );
  camera.lookAt(0, 0, 0);
};

type ComputedLabel = {
  index: number;
  dotX: number;
  dotY: number;
  anchorX: number;     // smoothed label center X
  anchorY: number;     // smoothed label center Y
  finalAnchorX: number; // target label center X (for line endpoint)
  finalAnchorY: number; // target label center Y (for line endpoint)
  showLine: boolean;
  opacity: number;
};

export default function NetworkSection() {
  const containerRef      = useRef<HTMLElement>(null);
  const stickyRef         = useRef<HTMLDivElement>(null);
  const globeRef          = useRef<any>(null);
  const starCanvasRef     = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef(0);
  // True while a GSAP step tween is running — tick loop skips label computation
  // so labels never appear while the camera is still moving (eliminates jitter).
  const globeAnimatingRef = useRef(false);

  const [isClient, setIsClient]       = useState(false);
  const [hover, setHover]             = useState<number | null>(null);
  const [isMobile, setIsMobile]       = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const labelsVisibleRef              = useRef(false);
  const [labelRenders, setLabelRenders]   = useState<ComputedLabel[]>([]);

  const router = useRouter();

  useEffect(() => { setIsClient(true); }, []);

  // ── Star canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = starCanvasRef.current;
    const container = stickyRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const isMobileDevice = window.innerWidth < MOBILE_BREAKPOINT;
    const STAR_COUNT   = isMobileDevice ? 100 : 200;
    const STAR_MIN_R   = 0.6;
    const STAR_MAX_R   = 2.0;
    const CONNECT_DIST = 140;
    const MOUSE_DIST   = 190;
    const STAR_SPEED   = 0.5;
    const LINE_COLOR: [number, number, number] = [120, 190, 255];
    let W = 0, H = 0;

    // Pre-render a star sprite once — eliminates createRadialGradient per star per frame
    const SPRITE_SIZES = 8; // one sprite per size bucket
    const sprites: HTMLCanvasElement[] = [];
    for (let si = 0; si < SPRITE_SIZES; si++) {
      const r = STAR_MIN_R + (si / (SPRITE_SIZES - 1)) * (STAR_MAX_R - STAR_MIN_R);
      const spriteSize = Math.ceil(r * 10 * 2) + 2;
      const sp = document.createElement("canvas");
      sp.width = spriteSize; sp.height = spriteSize;
      const sc = sp.getContext("2d")!;
      const cx = spriteSize / 2; const cy = spriteSize / 2;
      const grd = sc.createRadialGradient(cx, cy, 0, cx, cy, r * 5);
      grd.addColorStop(0, "rgba(180,220,255,0.9)");
      grd.addColorStop(0.35, "rgba(130,190,255,0.35)");
      grd.addColorStop(1, "rgba(80,140,255,0)");
      sc.beginPath(); sc.arc(cx, cy, r * 5, 0, Math.PI * 2);
      sc.fillStyle = grd; sc.fill();
      const outer = r * 1.6; const inner = r * 0.38; const pts = 4;
      sc.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const angle  = (i * Math.PI) / pts - Math.PI / 2;
        const radius = i % 2 === 0 ? outer : inner;
        i === 0
          ? sc.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
          : sc.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }
      sc.closePath();
      sc.fillStyle = "rgba(220,242,255,1)";
      sc.shadowBlur = r * 8; sc.shadowColor = "rgba(150,210,255,0.9)";
      sc.fill();
      sprites.push(sp);
    }

    const resize = () => {
      W = canvas.width  = container.offsetWidth  || window.innerWidth;
      H = canvas.height = container.offsetHeight || window.innerHeight;
    };
    resize();

    let mouse = { x: -9999, y: -9999 };
    let animId: number;

    class Star {
      x = 0; y = 0; r = 0; vx = 0; vy = 0;
      twinkleSpeed = 0; twinklePhase = 0; baseAlpha = 0; spriteIdx = 0;
      constructor() { this.reset(true); }
      reset(randomY = false) {
        this.x  = Math.random() * W;
        this.y  = randomY ? Math.random() * H : -10;
        this.r  = STAR_MIN_R + Math.random() * (STAR_MAX_R - STAR_MIN_R);
        this.spriteIdx = Math.round(((this.r - STAR_MIN_R) / (STAR_MAX_R - STAR_MIN_R)) * (SPRITE_SIZES - 1));
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
        const sp = sprites[this.spriteIdx];
        const half = sp.width / 2;
        ctx.globalAlpha = this.alpha;
        ctx.drawImage(sp, this.x - half, this.y - half);
        ctx.globalAlpha = 1;
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

    container.addEventListener("mousemove",  onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("touchmove",  onTouchMove as EventListener, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove",  onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("touchmove",  onTouchMove as EventListener);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Mobile breakpoint ────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── ScrollTrigger refresh ────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── RAF: radial labels hugging the globe surface, appear at scroll 80%+ ──
  // Each label is placed in the direction of its dot from the globe center,
  // at screenRadius + LABEL_OFFSET px from center. Lines are short and direct.
  const smoothedAnchors = useRef<{[idx: number]: {x: number; y: number}}>({});
  const lastRevealProgress = useRef(-1);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const scroll = scrollProgressRef.current;
      const revealProgress = Math.max(0, Math.min(1, (scroll - 0.75) / 0.25));

      if (revealProgress < 0.01) {
        if (lastRevealProgress.current !== 0) {
          lastRevealProgress.current = 0;
          setLabelRenders([]);
          smoothedAnchors.current = {};
        }
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Skip label computation while globe is animating — camera still moving,
      // so any positions computed now would jitter on the next frame.
      if (globeAnimatingRef.current) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const globe     = globeRef.current;
      const container = stickyRef.current;
      if (!globe?.camera || !globe?.renderer || !container) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const camera   = globe.camera();
      const renderer = globe.renderer();
      if (!camera || !renderer?.domElement) { rafId = requestAnimationFrame(tick); return; }

      const containerRect = container.getBoundingClientRect();
      const rendRect      = renderer.domElement.getBoundingClientRect();
      const offX = rendRect.left - containerRect.left;
      const offY = rendRect.top  - containerRect.top;
      const rW   = renderer.domElement.clientWidth;
      const rH   = renderer.domElement.clientHeight;

      // Globe centre on screen
      const cv = new THREE.Vector3(0, 0, 0).project(camera);
      const screenCX = (cv.x * 0.5 + 0.5) * rW + offX;
      const screenCY = (-cv.y * 0.5 + 0.5) * rH + offY;

      // Apparent globe radius from the live camera
      const camDist  = camera.position.length();
      const fovRad   = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
      const sinAngle = Math.min(1, 100 / camDist);
      const screenRadius = (rH / 2) / Math.tan(fovRad / 2) * sinAngle;

      const LABEL_OFFSET = isMobile ? 36 : 58; // px beyond globe edge
      const MIN_SEP      = isMobile ? 32 : 65; // min px between label centers
      const MAX_DEV      = isMobile ? 65 : 130; // max px a label can drift from its radial position
      const LERP         = 0.14;
      const STAGGER      = 0.055;

      // Safe screen bounds — account for half pill width so pills never bleed off-screen
      const PILL_HALF  = isMobile ? 72 : 108; // half of max pill width
      const topSafe    = 110;                  // well below navbar (pill center ≥ 110px from top)
      const bottomSafe = containerRect.height - 30;
      const leftSafe   = PILL_HALF;
      const rightSafe  = containerRect.width - PILL_HALF;

      // Project every service dot
      type RawDot = { index: number; dotX: number; dotY: number; visible: boolean };
      const rawDots: RawDot[] = [];

      services.forEach((s, i) => {
        const world = globe.getCoords?.(s.lat, s.lng, 0.015);
        if (!world) return;
        const v = new THREE.Vector3(world.x, world.y, world.z);
        v.project(camera);
        const dotX = (v.x * 0.5 + 0.5) * rW + offX;
        const dotY = (-v.y * 0.5 + 0.5) * rH + offY;
        rawDots.push({ index: i, dotX, dotY, visible: v.z <= 1.12 });
      });

      // Compute radial label positions: each label radiates from globe center
      // in the direction of its dot, placed just outside the globe edge
      type RadialEntry = RawDot & { angle: number; rawX: number; rawY: number };
      const entries: RadialEntry[] = rawDots.map(d => {
        const dx  = d.dotX - screenCX;
        const dy  = d.dotY - screenCY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx  = dx / len;
        const ny  = dy / len;
        return {
          ...d,
          angle: Math.atan2(dy, dx),
          rawX: screenCX + nx * (screenRadius + LABEL_OFFSET),
          rawY: screenCY + ny * (screenRadius + LABEL_OFFSET),
        };
      });

      // Sort by angle for a consistent push-apart order
      entries.sort((a, b) => a.angle - b.angle);

      // Push-apart: spread labels so no two are closer than MIN_SEP px
      const pos = entries.map(e => ({ x: e.rawX, y: e.rawY }));
      for (let pass = 0; pass < 6; pass++) {
        for (let i = 0; i < pos.length; i++) {
          for (let j = i + 1; j < pos.length; j++) {
            const dx   = pos[j].x - pos[i].x;
            const dy   = pos[j].y - pos[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (dist < MIN_SEP) {
              const push = (MIN_SEP - dist) / 2;
              const px = (dx / dist) * push;
              const py = (dy / dist) * push;
              pos[i].x -= px; pos[i].y -= py;
              pos[j].x += px; pos[j].y += py;
            }
          }
        }
        // Limit drift: each label stays within MAX_DEV px of its natural radial position
        for (let i = 0; i < pos.length; i++) {
          const ddx  = pos[i].x - entries[i].rawX;
          const ddy  = pos[i].y - entries[i].rawY;
          const dlen = Math.sqrt(ddx * ddx + ddy * ddy) || 0.001;
          if (dlen > MAX_DEV) {
            pos[i].x = entries[i].rawX + (ddx / dlen) * MAX_DEV;
            pos[i].y = entries[i].rawY + (ddy / dlen) * MAX_DEV;
          }
        }
        // Clamp inside safe bounds (pills fully visible)
        for (let i = 0; i < pos.length; i++) {
          pos[i].x = Math.max(leftSafe, Math.min(rightSafe, pos[i].x));
          pos[i].y = Math.max(topSafe,  Math.min(bottomSafe, pos[i].y));
        }
      }

      // Build renders with lerp smoothing and per-label stagger
      const newRenders: ComputedLabel[] = entries.map((e, idx) => {
        const targetX = pos[idx].x;
        const targetY = pos[idx].y;
        const prev    = smoothedAnchors.current[e.index] ?? { x: targetX, y: targetY };
        const smX = prev.x + (targetX - prev.x) * LERP;
        const smY = prev.y + (targetY - prev.y) * LERP;
        smoothedAnchors.current[e.index] = { x: smX, y: smY };

        const maxOff = (entries.length - 1) * STAGGER;
        const itemProgress = Math.max(0, Math.min(1,
          (revealProgress - idx * STAGGER) / Math.max(0.01, 1 - maxOff)
        ));

        return {
          index: e.index,
          dotX: e.dotX, dotY: e.dotY,
          anchorX: smX,  anchorY: smY,
          finalAnchorX: targetX, finalAnchorY: targetY,
          showLine: e.visible,
          opacity: itemProgress,
        };
      });

      setLabelRenders(newRenders);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isMobile]);

  // ── Globe controls ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isClient || !globeRef.current) return;
    const globe = globeRef.current;

    const lockControls = () => {
      if (globe?.controls) {
        const c = globe.controls();
        c.autoRotate = false;
        c.enableZoom = false;
        c.enablePan = false;
        c.enableRotate = false;
        c.enableDamping = false;
        c.dampingFactor = 0;
        c.mouseButtons = { LEFT: undefined, MIDDLE: undefined, RIGHT: undefined };
        c.touches = { ONE: undefined, TWO: undefined };
      }
    };

    const setInitialView = () => {
      if (globe?.pointOfView) {
        globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
        correctCameraUp(globe, CHINA_CENTER.lat, CHINA_CENTER.lng);
      }
      lockControls();
    };

    // Permanently block OrbitControls from receiving wheel events on its canvas.
    // This is a second layer of defense — the window capture handler also blocks,
    // but this ensures OrbitControls never zooms regardless of listener order.
    const attachCanvasBlocker = () => {
      const canvas = globe?.renderer?.()?.domElement;
      if (canvas && !(canvas as any).__wheelBlocked) {
        (canvas as any).__wheelBlocked = true;
        canvas.addEventListener("wheel", (e: Event) => {
          e.stopImmediatePropagation();
          e.preventDefault();
        }, { passive: false, capture: true });
      }
    };

    setInitialView();
    attachCanvasBlocker();
    const t1 = setTimeout(() => { setInitialView(); attachCanvasBlocker(); }, 300);
    const t2 = setTimeout(() => { setInitialView(); attachCanvasBlocker(); }, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isClient]);

  // ── GSAP ScrollTrigger (pin only) + wheel-step animation ───────────────
  //
  // • ScrollTrigger pins the section. Globe is animated by GSAP tween — no scrub.
  // • Every wheel event while active is preventDefault'd (no inertia leaks out).
  // • No "busy" flag — each scroll immediately starts a new tween (overwrite:true)
  //   from the current animated position, so there is zero blocking/lag.
  // • Exit uses st.start / st.end from the ScrollTrigger instance so it works
  //   correctly whether the user entered from above OR from below.
  useEffect(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const animProgress  = { value: 0 };
    let   currentStep   = 0;
    let   sectionActive = false;
    let   lastScrollMs  = 0;          // timestamp of last accepted scroll step
    let   st: ScrollTrigger | null = null;
    const TOTAL_STEPS   = 2;
    const STEP_COOLDOWN = 480;        // ms — prevents inertia from racing through steps

    const resetGlobe = () => {
      const globe = globeRef.current;
      if (!globe?.pointOfView) return;
      globe.pointOfView({ lat: CHINA_CENTER.lat, lng: CHINA_CENTER.lng, altitude: 2.5 }, 0);
      correctCameraUp(globe, CHINA_CENTER.lat, CHINA_CENTER.lng);
    };

    const lockGlobeControls = () => {
      const globe = globeRef.current;
      if (!globe?.controls) return;
      const c = globe.controls();
      c.enableZoom = false; c.enablePan = false;
      c.enableRotate = false; c.enableDamping = false;
      c.minDistance = 0; c.maxDistance = Infinity;
    };

    // Animate globe to a discrete step. overwrite:true means each new scroll
    // immediately replaces the running tween — no blocking, no queue needed.
    // ease:"power1.out" starts fast (no slow ramp-up) so movement is visible immediately.
    const animateToStep = (step: number) => {
      // Mark animating so the RAF tick skips label computation while camera moves.
      // Also clear any existing labels immediately so nothing is frozen mid-air.
      globeAnimatingRef.current = true;
      setLabelRenders([]);
      smoothedAnchors.current = {};

      gsap.to(animProgress, {
        value: step / TOTAL_STEPS,
        duration: 0.55,
        ease: "power1.out",
        overwrite: true,
        onUpdate: () => {
          const p = animProgress.value;
          scrollProgressRef.current = p;
          const newVisible = p > 0.525;
          if (newVisible !== labelsVisibleRef.current) {
            labelsVisibleRef.current = newVisible;
            setLabelsVisible(newVisible);
          }
          lockGlobeControls();

          const globe = globeRef.current;
          if (!globe?.pointOfView) return;
          if (p <= 0) { resetGlobe(); return; }

          // 0→50 %: rotate China→USA (step 1)   50→100 %: zoom in + labels (step 2)
          const ph1 = Math.min(1, p / 0.5);
          const ph2 = Math.max(0, (p - 0.5) / 0.5);
          const lat = CHINA_CENTER.lat + (USA_CENTER.lat - CHINA_CENTER.lat) * ph1;
          const lng = CHINA_CENTER.lng + (USA_CENTER.lng - CHINA_CENTER.lng) * ph1;
          const ez  = ph2 * ph2 * (3 - 2 * ph2);
          globe.pointOfView({ lat, lng, altitude: 2.5 - 0.5 * ez }, 0);
          correctCameraUp(globe, lat, lng);
        },
        onComplete: () => {
          // Camera has stopped — now it's safe to compute label positions.
          globeAnimatingRef.current = false;
        },
      });
    };

    const ctx = gsap.context(() => {
      st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%",
        pin: stickyRef.current,
        pinSpacing: true,
        markers: false,

        onEnter: () => {
          sectionActive = true; currentStep = 0;
          animProgress.value = 0;
          scrollProgressRef.current = 0;
          if (labelsVisibleRef.current) { labelsVisibleRef.current = false; setLabelsVisible(false); }
          gsap.killTweensOf(animProgress);
          resetGlobe(); lockGlobeControls();
        },
        onLeave:     () => { sectionActive = false; },
        onEnterBack: () => {
          sectionActive = true; currentStep = TOTAL_STEPS;
          animProgress.value = 1;
          scrollProgressRef.current = 1;
          if (!labelsVisibleRef.current) { labelsVisibleRef.current = true; setLabelsVisible(true); }
          gsap.killTweensOf(animProgress);
          lockGlobeControls();
        },
        onLeaveBack: () => {
          sectionActive = false; currentStep = 0;
          animProgress.value = 0;
          gsap.killTweensOf(animProgress);
        },
      });
      setTimeout(() => ScrollTrigger.refresh(), 200);
    }, containerRef);

    // ── Wheel handler ────────────────────────────────────────────────────
    // Attached to stickyRef in CAPTURE phase so it fires before the event
    // descends into the globe canvas. stopPropagation() in capture phase
    // stops the event from ever reaching OrbitControls → no unwanted zoom.
    const onWheel = (e: WheelEvent) => {
      if (!sectionActive) return;

      // Block the event from reaching globe canvas (OrbitControls zoom).
      e.stopPropagation();
      // Block native page scroll — exit is handled explicitly below.
      e.preventDefault();

      const now      = Date.now();
      const dir      = e.deltaY > 0 ? 1 : -1;
      const nextStep = currentStep + dir;

      if (nextStep > TOTAL_STEPS) {
        // Require cooldown before exiting — prevents inertia immediately
        // pushing past the last step before the user intends to leave.
        if (now - lastScrollMs < STEP_COOLDOWN) return;
        sectionActive = false;
        gsap.killTweensOf(animProgress);
        window.scrollTo(0, (st?.end ?? 0) + 50);
        return;
      }
      if (nextStep < 0) {
        if (now - lastScrollMs < STEP_COOLDOWN) return;
        sectionActive = false;
        gsap.killTweensOf(animProgress);
        window.scrollTo(0, Math.max(0, (st?.start ?? 0) - 100));
        return;
      }

      // Throttle step advances — blocks trackpad inertia from racing through steps.
      if (now - lastScrollMs < STEP_COOLDOWN) return;
      lastScrollMs = now;
      currentStep = nextStep;
      animateToStep(currentStep);
    };

    // window + capture fires before ANY element in the DOM (including globe canvas).
    // stopPropagation() when active prevents the event from ever reaching OrbitControls.
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });

    return () => {
      ctx.revert();
      gsap.killTweensOf(animProgress);
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // ── Globe data ───────────────────────────────────────────────────────────
  const pointSize      = isMobile ? 0.15 : 0.2;
  const pointSizeHover = isMobile ? 0.28 : 0.35;

  // Memoized so Globe never gets new prop references during animation re-renders,
  // preventing expensive Three.js re-processing at 60fps.
  const globePoints = useMemo(() => services.map((s, i) => ({
    lat: s.lat, lng: s.lng, label: s.label,
    size:  hover === i ? pointSizeHover : pointSize,
    color: hover === i ? "#ffffff" : "rgba(0,230,255,0.9)",
  })), [hover, pointSize, pointSizeHover]);

  const satelliteArcs = useMemo(() => [
    ...services.map((s) => ({
      startLat: HUB.lat, startLng: HUB.lng, endLat: s.lat, endLng: s.lng,
      color: ["rgba(0,230,255,0.2)", "rgba(0,230,255,0.75)"],
      dashLen: 1, dashGap: 0, dashAnimTime: 0,
    })),
    { startLat: services[0].lat, startLng: services[0].lng, endLat: services[1].lat,  endLng: services[1].lng,  color: ["rgba(0,200,255,0.08)", "rgba(0,200,255,0.28)"], dashLen: 1, dashGap: 0, dashAnimTime: 0 },
    { startLat: services[2].lat, startLng: services[2].lng, endLat: services[5].lat,  endLng: services[5].lng,  color: ["rgba(0,200,255,0.08)", "rgba(0,200,255,0.28)"], dashLen: 1, dashGap: 0, dashAnimTime: 0 },
    { startLat: services[6].lat, startLng: services[6].lng, endLat: services[4].lat,  endLng: services[4].lng,  color: ["rgba(0,200,255,0.08)", "rgba(0,200,255,0.28)"], dashLen: 1, dashGap: 0, dashAnimTime: 0 },
    { startLat: services[7].lat, startLng: services[7].lng, endLat: services[3].lat,  endLng: services[3].lng,  color: ["rgba(0,200,255,0.08)", "rgba(0,200,255,0.28)"], dashLen: 1, dashGap: 0, dashAnimTime: 0 },
    { startLat: services[8].lat, startLng: services[8].lng, endLat: services[10].lat, endLng: services[10].lng, color: ["rgba(0,200,255,0.08)", "rgba(0,200,255,0.28)"], dashLen: 1, dashGap: 0, dashAnimTime: 0 },
  ], []);

  const ringsData  = useMemo(() => services.map((s) => ({ lat: s.lat, lng: s.lng })), []);
  // Always empty — 3D labels are never shown; HTML glassmorphism badges handle display.
  // This removes the overlap glitch that happened when switching labelsData mid-transition.
  const labelsData = useMemo(() => [], []);

  const handleGlobeClick = () => router.push("/served-sectors");

  // ── Render ───────────────────────────────────────────────────────────────
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
        {/* Star canvas */}
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
            <div className="w-[88vw] h-[88vw] max-h-[75vh] md:w-full md:h-full md:max-h-none">
              <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                backgroundImageUrl=""
                backgroundColor="rgba(0,0,0,0)"
                rendererConfig={{ alpha: true, antialias: !isMobile }}

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
                arcAltitude={0.3}
                arcAltitudeAutoScale={0.4}
                arcDashLength={(d: any) => d.dashLen ?? 1}
                arcDashGap={(d: any) => d.dashGap ?? 0}
                arcDashAnimateTime={(d: any) => d.dashAnimTime ?? 0}
                arcCurveResolution={isMobile ? 48 : 96}

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

        {/* SVG: connector lines from globe dot → pill anchor */}
        <svg
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 22, overflow: "visible",
          }}
        >
          <defs>
            <filter id="label-line-glow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {labelRenders.map((lr) =>
            lr.showLine && lr.opacity > 0.05 ? (
              <line
                key={lr.index}
                x1={lr.dotX}           y1={lr.dotY}
                x2={lr.finalAnchorX}   y2={lr.finalAnchorY}
                stroke="rgba(0,230,255,0.6)"
                strokeWidth="1.2"
                strokeDasharray="6 4"
                opacity={lr.opacity * 0.9}
                filter="url(#label-line-glow)"
              />
            ) : null
          )}
        </svg>

        {/* Glassmorphism labels — radially placed around globe, fade+scale in */}
        {labelRenders.map((lr) => {
          const scale = 0.85 + 0.15 * lr.opacity;
          return (
            <div
              key={lr.index}
              onClick={handleGlobeClick}
              style={{
                position: "absolute",
                left: lr.anchorX,
                top:  lr.anchorY,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
                opacity: lr.opacity,
                zIndex: 25,
                pointerEvents: lr.opacity > 0.25 ? "auto" : "none",
                cursor: "pointer",
                maxWidth: isMobile ? "38vw" : "200px",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  background: "rgba(0, 12, 30, 0.75)",
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  border: "1px solid rgba(0, 230, 255, 0.40)",
                  borderRadius: "24px",
                  padding: isMobile ? "5px 10px" : "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 2px 16px rgba(0,230,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    width: "5px", height: "5px",
                    borderRadius: "50%",
                    background: "#00E6FF",
                    boxShadow: "0 0 6px rgba(0,230,255,1)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "#cdf3ff",
                    fontSize: isMobile ? "9px" : "11px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {services[lr.index].label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
