"use client";

import React, { useRef } from "react";
import { motion, useInView, HTMLMotionProps } from "framer-motion";

interface ScrollRevealProps<T extends React.ElementType> extends Omit<HTMLMotionProps<any>, "children"> {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    y?: number;
    threshold?: number;
    once?: boolean;
}

export default function ScrollReveal<T extends React.ElementType = "div">({
    children,
    className = "",
    delay = 0,
    duration = 0.5,
    y = 20,
    threshold = 0.1,
    once = true,
    as,
    ...props
}: ScrollRevealProps<T> & { as?: T }) {
    const Component = as ? motion(as as any) : motion.div;
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: threshold, once });

    return (
        <Component
            ref={ref}
            className={className}
            initial={{ opacity: 0, y }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
            transition={{ duration, delay, ease: "easeOut" }}
            {...props}
        >
            {children}
        </Component>
    );
}
