'use client';

import React, { useRef, useEffect } from 'react';
import { SECTORS } from '@/utils/Constan';

const ServedSectorsClient = () => {
    const cardsRef       = useRef<HTMLDivElement>(null);
    const activeCardRef  = useRef(0);
    const lockRef        = useRef(false);
    const inSectionRef   = useRef(false);
    const touchStartYRef = useRef(0);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const getCardScrollTop = (index: number): number => {
        const el = cardsRef.current;
        if (!el) return 0;
        const sectionTop = el.getBoundingClientRect().top + window.scrollY;
        return sectionTop + index * window.innerHeight;
    };

    const snapTo = (index: number) => {
        const clamped = Math.max(0, Math.min(SECTORS.length - 1, index));
        if (clamped === activeCardRef.current && lockRef.current) return;
        lockRef.current     = true;
        activeCardRef.current = clamped;
        window.scrollTo({ top: getCardScrollTop(clamped), behavior: 'smooth' });
        // Unlock after the smooth-scroll animation (~700 ms)
        setTimeout(() => { lockRef.current = false; }, 750);
    };

    // ── Track whether user is inside the cards section ─────────────────────────
    useEffect(() => {
        const onScroll = () => {
            const el = cardsRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            // "inside" = top of section ≤ viewport top AND bottom ≥ viewport bottom
            inSectionRef.current = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;

            // Keep activeCardRef in sync with actual scroll position so back-navigation works
            if (inSectionRef.current) {
                const scrolledIn = window.scrollY - (el.getBoundingClientRect().top + window.scrollY - window.scrollY);
                // simpler: derive from how far past the section top we are
                const sectionTop = el.getBoundingClientRect().top + window.scrollY;
                const rawIndex = Math.round((window.scrollY - sectionTop) / window.innerHeight);
                activeCardRef.current = Math.max(0, Math.min(SECTORS.length - 1, rawIndex));
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Wheel snap ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (!inSectionRef.current) return;

            const dir  = e.deltaY > 0 ? 1 : -1;
            const next = activeCardRef.current + dir;

            if (next < 0 || next >= SECTORS.length) {
                // At the boundary — let the scroll through naturally
                return;
            }

            // Inside bounds — capture and snap
            e.preventDefault();
            if (!lockRef.current) snapTo(next);
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Touch swipe snap ───────────────────────────────────────────────────────
    useEffect(() => {
        const onStart = (e: TouchEvent) => { touchStartYRef.current = e.touches[0].clientY; };
        const onEnd   = (e: TouchEvent) => {
            if (!inSectionRef.current) return;
            const dy = touchStartYRef.current - e.changedTouches[0].clientY;
            if (Math.abs(dy) < 40) return;
            const dir  = dy > 0 ? 1 : -1;
            const next = activeCardRef.current + dir;
            if (next >= 0 && next < SECTORS.length && !lockRef.current) snapTo(next);
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
            {/*
                Each card: sticky top-0, h-screen, increasing z-index.
                The container height = N × 100vh which is the scroll budget.
                JS above snaps the scroll to each card boundary.
            */}
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
