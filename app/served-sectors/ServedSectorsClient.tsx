'use client';

import { useRef, useEffect } from 'react';
import { SECTORS } from '@/utils/Constan';

// How long to block new snaps after one fires.
// Must be long enough for the smooth-scroll to land on the target card.
const LOCK_MS = 700;

// Trackpad: how many accumulated pixels trigger one snap.
// Mouse wheels deliver large single events (≥ 40 px or deltaMode≥1) and snap
// immediately — this threshold only applies to small per-frame trackpad deltas.
const TRACKPAD_PX = 80;

const ServedSectorsClient = () => {
    const cardsRef      = useRef<HTMLDivElement>(null);
    const activeRef     = useRef(0);        // current card index (0-based)
    const lockRef       = useRef(false);    // true while snap animation is running
    const inSectionRef  = useRef(false);    // true while cards container owns the viewport
    const accumRef      = useRef(0);        // trackpad delta accumulator
    const lastDirRef    = useRef(0);        // last scroll direction (resets accum on flip)
    const touchYRef     = useRef(0);

    // ── Snap to a specific card index ────────────────────────────────────────
    const snapTo = (index: number) => {
        if (lockRef.current) return;
        const clamped = Math.max(0, Math.min(SECTORS.length - 1, index));
        lockRef.current = true;
        activeRef.current = clamped;
        accumRef.current = 0;

        const el = cardsRef.current;
        if (!el) { lockRef.current = false; return; }
        const sectionTop = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: sectionTop + clamped * window.innerHeight, behavior: 'smooth' });

        setTimeout(() => { lockRef.current = false; }, LOCK_MS);
    };

    // ── Track whether the section owns the viewport ───────────────────────────
    useEffect(() => {
        const onScroll = () => {
            const el = cardsRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            // "In section" = container top is at/above viewport top
            //                AND more than one screen of content remains below
            const nowIn = rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
            inSectionRef.current = nowIn;

            // Keep activeRef in sync so next snap goes to the right card
            if (nowIn && !lockRef.current) {
                const sectionTop = rect.top + window.scrollY;
                const raw = (window.scrollY - sectionTop) / window.innerHeight;
                activeRef.current = Math.max(0, Math.min(SECTORS.length - 1, Math.round(raw)));
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Wheel snap ────────────────────────────────────────────────────────────
    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (!inSectionRef.current) return;

            const dir  = e.deltaY > 0 ? 1 : -1;
            const next = activeRef.current + dir;

            // ── At a boundary: allow natural page scroll to exit the section ──
            if (next < 0 || next >= SECTORS.length) {
                // Only block scroll while a snap animation is in flight
                if (lockRef.current) e.preventDefault();
                accumRef.current = 0;
                lastDirRef.current = 0;
                return;
            }

            // ── Within bounds: own the event ──────────────────────────────────
            e.preventDefault();
            if (lockRef.current) return;

            // Reset accumulator when user reverses direction
            if (dir !== lastDirRef.current) {
                accumRef.current = 0;
                lastDirRef.current = dir;
            }

            // Mouse wheel (line/page mode) or single large event → snap at once.
            // Covers: traditional scroll wheels, Apple Magic Mouse single click,
            // any device that fires ≥ 30 px per event in pixel mode.
            const isSingleWheelClick =
                e.deltaMode === 1 ||          // line mode  (traditional mouse)
                e.deltaMode === 2 ||          // page mode
                Math.abs(e.deltaY) >= 30;     // large pixel event (mouse/Magic Mouse)

            if (isSingleWheelClick) {
                accumRef.current = 0;
                snapTo(next);
                return;
            }

            // Trackpad: small per-frame deltas — accumulate until threshold
            accumRef.current += Math.abs(e.deltaY);
            if (accumRef.current >= TRACKPAD_PX) {
                accumRef.current = 0;
                snapTo(next);
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Touch swipe snap ──────────────────────────────────────────────────────
    useEffect(() => {
        const onStart = (e: TouchEvent) => { touchYRef.current = e.touches[0].clientY; };
        const onEnd   = (e: TouchEvent) => {
            if (!inSectionRef.current) return;
            const dy   = touchYRef.current - e.changedTouches[0].clientY;
            if (Math.abs(dy) < 40) return;
            const dir  = dy > 0 ? 1 : -1;
            const next = activeRef.current + dir;
            if (next >= 0 && next < SECTORS.length) snapTo(next);
        };
        window.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchend',   onEnd,   { passive: true });
        return () => {
            window.removeEventListener('touchstart', onStart);
            window.removeEventListener('touchend',   onEnd);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="bg-black text-white">

            {/* ── Page header (static, scrolls away) ── */}
            <div className="text-center px-4 pt-32 pb-16 bg-black">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500 mb-4">
                    EXPERTISE ACROSS INDUSTRIES
                </h1>
                <p className="text-xl text-cyan-400 font-medium">
                    Smart Hiring. Real Impact. Every Industry.
                </p>
            </div>

            {/* ── Stacking cards container ── */}
            <div ref={cardsRef} style={{ height: `${SECTORS.length * 100}vh` }}>
                {SECTORS.map((sector, index) => (
                    <div
                        key={sector.id}
                        style={{
                            position:        'sticky',
                            top:             0,
                            height:          '100vh',
                            zIndex:          index + 1,
                            backgroundColor: `hsl(0,0%,${3 + index * 0.7}%)`,
                            overflow:        'hidden',
                        }}
                        className="w-full border-t border-white/10 flex items-center"
                    >
                        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-12 gap-6 md:gap-10 px-4 md:px-8 items-center h-full">

                            {/* ── Left sidebar ── */}
                            <aside className="hidden md:flex col-span-3 flex-col gap-6 font-gilroy self-center">
                                <h2 className="text-6xl md:text-8xl font-bold text-white/10 tracking-tighter leading-none select-none">
                                    {String(index + 1).padStart(2, '0')}
                                </h2>
                                <ul className="space-y-2">
                                    {SECTORS.map((s, i) => (
                                        <li
                                            key={s.id}
                                            className={`uppercase text-xs tracking-widest transition-all duration-300 ${
                                                i === index
                                                    ? 'text-cyan-400 font-semibold pl-3 border-l-2 border-cyan-400'
                                                    : 'text-gray-600 opacity-50'
                                            }`}
                                        >
                                            {s.listTitle || s.title}
                                        </li>
                                    ))}
                                </ul>
                            </aside>

                            {/* ── Main content ── */}
                            <div className="col-span-12 md:col-span-9 font-gilroy grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-center">

                                {/* Left: title + description */}
                                <div className="lg:col-span-3 space-y-4">
                                    <span className="md:hidden block text-5xl font-bold text-white/10 select-none">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-semibold text-white mb-2 leading-tight">
                                            {sector.title}
                                        </h1>
                                        <p className="text-cyan-400 uppercase tracking-wider mb-4 text-sm">
                                            {sector.subtitle}
                                        </p>
                                        <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg">
                                            {sector.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: roles + why choose */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <h3 className="text-xs font-semibold mb-3 text-white uppercase tracking-widest">
                                            Key Roles We Hire
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sector.roles.map((role: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-5">
                                        <h3 className="text-xs font-semibold mb-2 text-white uppercase tracking-widest">
                                            Why Mintex Staffing
                                        </h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {sector.whyChoose}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Card index indicator (bottom-right) */}
                        <div className="absolute bottom-6 right-6 text-xs text-white/20 font-mono select-none">
                            {String(index + 1).padStart(2, '0')} / {String(SECTORS.length).padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Spacer so the last card can un-stick */}
            <div style={{ height: '40vh', background: '#000' }} />
        </section>
    );
};

export default ServedSectorsClient;
