'use client'

import React from 'react';

const CoreValues = () => {
    const values = [
        {
            title: "INTEGRITY",
            desc: "We Do What's Right,\nEven When No One's Watching.",
            color: "bg-[#22D3EE]", // Cyan
            // First bar: 50% width
            width: "w-[60%] md:w-[35%]",
            delay: "0ms"
        },
        {
            title: "EXCELLENCE",
            desc: "Every Hire Reflects\nOur Obsession With Quality.",
            color: "bg-[#84CC16]", // Green
            // Second bar: 75% width
            width: "w-[80%] md:w-[50%]",
            delay: "150ms"
        },
        {
            title: "INNOVATION",
            desc: "Because Yesterday's Hiring\nWon't Solve Tomorrow's Challenges.",
            color: "bg-[#F59E0B]", // Orange
            // Third bar: 100% width (using screen width logic)
            width: "w-[100%] md:w-[65%]",
            delay: "300ms"
        }
    ];

    return (
        <section className="w-full bg-black py-16 md:py-20 overflow-hidden font-sans relative">
            <h2 className="relative z-10 mb-12 md:mb-18 text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tighter text-left md:text-center italic px-4 md:ml-32 mt-8 md:mt-20">
                OUR CORE VALUES
            </h2>

            {/* Removed max-w-7xl here to allow 100% width bars to hit the edge */}
            <div className="w-full relative">
                <div className="flex flex-col gap-6 md:gap-12 py-10">
                    {values.map((item, index) => (
                        <div
                            key={index}
                            className="relative flex flex-col md:flex-row items-start md:items-center group py-2 md:py-0"
                            style={{
                                animation: `slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${item.delay}`,
                                opacity: 0,
                                transform: 'translateX(-50px)'
                            }}
                        >
                            {/* Colorful Bar: Adjusted left and skew for a more aggressive edge */}
                            <div
                                className={`absolute top-0 left-[-5%] md:left-[-10%] ${item.width} h-16 md:h-32 transform skew-x-[-15deg] md:skew-x-30 origin-left transition-all duration-500 group-hover:scale-x-[1.2] ${item.color}`}
                            ></div>

                            {/* Content Container */}
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center w-full px-6 md:px-20 h-full">

                                {/* Title Area - Sized to match the bar width logic */}
                                <div className={`${item.width} h-16 md:h-32 flex items-center`}>
                                    <h3 className="text-3xl sm:text-5xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-md overflow-hidden">
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                animation: `revealText 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${item.delay}`
                                            }}
                                        >
                                            {item.title}
                                        </span>
                                    </h3>
                                </div>

                                {/* Description */}
                                <div className="mt-4 md:mt-0 ml-0 md:ml-10 flex-1">
                                    <p className="text-white font-medium text-sm md:text-lg leading-tight whitespace-pre-line opacity-90 max-w-xs">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes revealText {
                     from {
                        opacity: 0;
                        transform: translateY(100%);
                     }
                     to {
                        opacity: 1;
                        transform: translateY(0);
                     }
                }
            `}</style>
        </section>
    );
};

export default CoreValues;