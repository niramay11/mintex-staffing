"use client";

import React, { useEffect, useRef } from "react";
import { BsPersonPlusFill } from "react-icons/bs";
import { HiMiniChartBarSquare } from "react-icons/hi2";
import { PiClipboardTextDuotone } from "react-icons/pi";
import { TbShoppingBagCheck } from "react-icons/tb";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const marketData = [
  { month: "Jan", value: 80 },
  { month: "Feb", value: 120 },
  { month: "Mar", value: 150 },
  { month: "Apr", value: 300 },
  { month: "May", value: 260 },
  { month: "Jun", value: 380 },
  { month: "Jul", value: 330 },
  { month: "Aug", value: 420 },
  { month: "Sep", value: 310 },
  { month: "Oct", value: 200 },
  { month: "Nov", value: 250 },
  { month: "Dec", value: 320 },
];

const donutData = [
  { name: "Client", value: 25 },
  { name: "Candidate", value: 20 },
];

const COLORS = ["#22d3ee", "#a78bfa"];

const industries = [
  { name: "Information Technologies", percent: 33, color: "#22d3ee" },
  { name: "Healthcare", percent: 25, color: "#38bdf8" },
  { name: "Hospitality & Finance", percent: 17, color: "#818cf8" },
  { name: "Engineering & Construction", percent: 14, color: "#a78bfa" },
  { name: "Other", percent: 11, color: "#6366f1" },
];

const stats = [
  {
    icon: <HiMiniChartBarSquare className="text-2xl text-cyan-400" />,
    value: 150,
    label: "Recruiters",
    suffix: "+",
  },
  {
    icon: <PiClipboardTextDuotone className="text-2xl text-cyan-400" />,
    value: 30,
    label: "Team Leads",
    suffix: "+",
  },
  {
    icon: <TbShoppingBagCheck className="text-2xl text-cyan-400" />,
    value: 10,
    label: "Account Managers",
    suffix: "",
  },
  {
    icon: <BsPersonPlusFill className="text-2xl text-cyan-400" />,
    value: 10,
    label: "Delivery Managers",
    suffix: "",
  },
];

export default function Statistics() {
  return (
    <div className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 xl:px-20 2xl:px-32 bg-black overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-cyan-400 text-sm font-semibold tracking-[0.2em] uppercase mb-3"
          >
            Our Impact
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            Numbers That Speak
          </motion.h2>
        </div>

        {/* ── ROW 1: Key stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-2 lg:grid-cols-4 border border-[#57EEFF]/50 rounded-2xl overflow-hidden mb-6 shadow-[0_0_20px_rgba(87,238,255,0.3)]"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className={`relative p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-400 hover:bg-cyan-500/[0.06] hover:scale-105 hover:shadow-[0_0_30px_rgba(87,238,255,0.15)] group cursor-default ${
                i < stats.length - 1 ? "border-r border-[#57EEFF]/30" : ""
              } ${i < 2 ? "border-b lg:border-b-0 border-[#57EEFF]/30" : ""}`}
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-cyan-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(87,238,255,0.3)]">
                {s.icon}
              </div>
              <AnimatedValue
                targetValue={s.value}
                className="text-3xl sm:text-4xl font-bold text-white mb-1 transition-transform duration-300 group-hover:scale-110"
                formatter={(v: number) => Math.round(v).toLocaleString() + s.suffix}
              />
              <p className="text-sm text-white/50 font-medium transition-colors duration-300 group-hover:text-cyan-300/70">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── ROW 2: Experience + Turnaround ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border border-[#57EEFF]/50 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center hover:bg-cyan-500/[0.04] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(87,238,255,0.2)] transition-all duration-400 shadow-[0_0_20px_rgba(87,238,255,0.3)] group cursor-default"
          >
            <p className="text-sm text-white/40 font-medium uppercase tracking-wider mb-4 group-hover:text-cyan-400/60 transition-colors duration-300">Years of Experience</p>
            <AnimatedValue
              targetValue={25}
              className="text-6xl sm:text-7xl font-bold text-white mb-2"
            />
            <p className="text-white/30 text-sm">Trusted staffing since 2001</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="border border-[#57EEFF]/50 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center hover:bg-cyan-500/[0.04] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(87,238,255,0.2)] transition-all duration-400 shadow-[0_0_20px_rgba(87,238,255,0.3)] group cursor-default"
          >
            <p className="text-sm text-white/40 font-medium uppercase tracking-wider mb-4 group-hover:text-cyan-400/60 transition-colors duration-300">Turnaround Time</p>
            <div className="flex items-baseline gap-2">
              <AnimatedValue
                targetValue={48}
                className="text-6xl sm:text-7xl font-bold text-white"
              />
              <span className="text-lg text-white/30 font-medium">Hrs</span>
            </div>
            <p className="text-white/30 text-sm mt-2">Average time to first shortlist</p>
          </motion.div>
        </div>

        {/* ── ROW 3: Industry + Retention + Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Industry breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1 border border-[#57EEFF]/50 rounded-2xl p-6 sm:p-8 hover:bg-cyan-500/[0.04] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(87,238,255,0.2)] transition-all duration-400 shadow-[0_0_20px_rgba(87,238,255,0.3)] cursor-default"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Industry Focus</h3>
            <div className="space-y-5">
              {industries.map((ind, i) => (
                <IndustryRow key={i} name={ind.name} percent={ind.percent} color={ind.color} />
              ))}
            </div>
          </motion.div>

          {/* Retention ratio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="border border-[#57EEFF]/50 rounded-2xl p-6 sm:p-8 flex flex-col hover:bg-cyan-500/[0.04] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(87,238,255,0.2)] transition-all duration-400 shadow-[0_0_20px_rgba(87,238,255,0.3)] cursor-default"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Retention Ratio</h3>
            <p className="text-sm text-white/30 mb-4">Average partnership duration</p>

            <div className="flex-1 flex items-center justify-center min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={4}
                    animationDuration={1500}
                    labelLine={false}
                    stroke="none"
                  >
                    {donutData.map((_entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    itemStyle={{ color: "#ffffff" }}
                    formatter={(value: number, name: string) => [`${value / 10} years`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 text-xs text-white/50 mt-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                2.5 Yrs · Client
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-violet-400 rounded-full" />
                2 Yrs · Candidate
              </span>
            </div>
          </motion.div>

          {/* Market chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border border-[#57EEFF]/50 rounded-2xl p-6 sm:p-8 flex flex-col hover:bg-cyan-500/[0.04] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(87,238,255,0.2)] transition-all duration-400 shadow-[0_0_20px_rgba(87,238,255,0.3)] cursor-default"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Job Opening Trends</h3>
                <p className="text-sm text-white/30">JOLTS data overview</p>
              </div>
              <span className="text-xs text-cyan-400/70 font-medium bg-cyan-500/5 px-2.5 py-1 rounded-md border border-cyan-500/10">
                2025–26
              </span>
            </div>

            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1500}
                  />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    itemStyle={{ color: "#22d3ee" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper: Animated counter ─── */
function AnimatedValue({
  targetValue,
  className,
  duration = 1.5,
  threshold = 0.5,
  formatter = (v: number) => Math.round(v).toLocaleString(),
}: {
  targetValue: number;
  className: string;
  duration?: number;
  threshold?: number;
  formatter?: (v: number) => string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => formatter(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, targetValue, { duration });
      return animation.stop;
    } else {
      count.set(0);
    }
  }, [count, targetValue, duration, isInView]);

  return (
    <motion.div ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
    </motion.div>
  );
}

/* ─── Helper: Industry progress bar ─── */
function IndustryRow({ name, percent, color }: { name: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="text-white/60 font-medium">{name}</span>
        <span className="text-white/40 font-semibold tabular-nums">{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
