import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ProcessLayer1 from '../assets/process/part-1.png';
import ProcessLayer2 from '../assets/process/part-2.png';
import ProcessLayer3 from '../assets/process/part-3.png';
import ProcessLayer4 from '../assets/process/part-4.png';

const HowWeHelp = () => {
    return (
        <section className="relative py-24 flex flex-col items-center bg-black overflow-hidden">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold mb-20 text-center font-bebas tracking-wider uppercase text-white"
            >
                HOW WE <span className="text-green-400">HELP YOU</span>
            </motion.h2>

            <div className="relative w-full max-w-[1400px] md:h-[700px] flex flex-col md:block items-center justify-center px-2 md:px-4 gap-8">

                {/* Central Diagram Composite */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative md:absolute inset-0 flex items-center justify-center select-none scale-[0.45] sm:scale-75 md:scale-100 origin-center my-[-80px] md:my-0"
                    style={{ perspective: "1000px" }}
                >
                    <div className="relative w-[1000px] h-[500px] flex items-center justify-center">
                        {/* Layer 4: Loop (Background Track) */}
                        <motion.div
                            className="absolute inset-0 w-full h-full z-10"
                            animate={{ rotate: [0, 2, 0, -2, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                            <Image src={ProcessLayer4} alt="Process Loop" fill className="object-contain" />
                        </motion.div>

                        {/* Layer 1: Tube (Horizontal Axis) */}
                        <motion.div
                            className="absolute top-1/2 left-0 right-0 h-[80px] -translate-y-1/2 z-0"
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Image src={ProcessLayer1} alt="Process Tube" fill className="object-contain" />
                        </motion.div>

                        {/* Layer 2: Arrow (Bottom Input) */}
                        <motion.div
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80px] h-[80px] z-20"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Image src={ProcessLayer2} alt="Process Arrow" fill className="object-contain" />
                        </motion.div>

                        {/* Layer 3: Orb (Central Core) */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] z-30"
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Image
                                src={ProcessLayer3}
                                alt="Process Orb"
                                fill
                                className="object-contain drop-shadow-[0_0_50px_rgba(74,222,128,0.3)]"
                            />
                            {/* Core Pulse Effect */}
                            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Mobile Grid / Desktop Absolute Layout */}
                <div className="relative w-full grid grid-cols-2 gap-4 sm:gap-8 md:block md:h-full z-20">

    {/* Pair 1 */}
    <div className="md:absolute md:left-[2%] lg:left-[8%] md:top-[18%]">
        <div className="
            group
            rounded-[32px]
            overflow-hidden
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:scale-105
            hover:-translate-y-3
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)]
        ">
            <FeatureCard
                title="RESUME MAKEOVER"
                subtitle="TO STAND OUT"
                delay={0.2}
                direction={-20}
            />
        </div>
    </div>

    <div className="md:absolute md:right-[2%] lg:right-[8%] md:top-[18%] flex justify-end">
        <div className="
            group
            rounded-[32px]
            overflow-hidden
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:scale-105
            hover:-translate-y-3
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)]
        ">
            <FeatureCard
                title="SALARY NEGOTIATION"
                subtitle="GET YOUR WORTH"
                delay={0.3}
                direction={20}
                alignRight
            />
        </div>
    </div>

    {/* Pair 2 */}
    <div className="md:absolute md:left-[0%] lg:left-[2%] md:top-[50%] md:-translate-y-1/2">
        <div className="
            group
            rounded-[32px]
            overflow-hidden
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:scale-105
            hover:-translate-y-3
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)]
        ">
            <FeatureCard
                title="INTERVIEW PREP"
                subtitle="CONFIDENCE FIRST"
                delay={0.4}
                direction={-30}
            />
        </div>
    </div>

    <div className="md:absolute md:right-[0%] lg:right-[2%] md:top-[50%] md:-translate-y-1/2 flex justify-end">
        <div className="
            group
            rounded-[32px]
            overflow-hidden
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:scale-105
            hover:-translate-y-3
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)]
        ">
            <FeatureCard
                title="DIRECT PLACEMENT"
                subtitle="TOP TIER ROLES"
                delay={0.5}
                direction={30}
                alignRight
            />
        </div>
    </div>

    {/* Pair 3 */}
    <div className="md:absolute md:left-[2%] lg:left-[8%] md:bottom-[18%]">
        <div className="
            group
            rounded-[32px]
            overflow-hidden
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:scale-105
            hover:-translate-y-3
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)]
        ">
            <FeatureCard
                title="SKILL ALIGNMENT"
                subtitle="MATCHING AMBITION"
                delay={0.6}
                direction={-20}
            />
        </div>
    </div>

    <div className="md:absolute md:right-[2%] lg:right-[8%] md:bottom-[18%] flex justify-end">
        <div className="
            group
            rounded-[32px]
            overflow-hidden
            border border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:scale-105
            hover:-translate-y-3
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)]
        ">
            <FeatureCard
                title="CAREER COACHING"
                subtitle="LONG TERM GROWTH"
                delay={0.7}
                direction={20}
                alignRight
            />
        </div>
    </div>

</div>
                {/* Bottom CTA Section */}
                <div className=" flex flex-col items-center gap-2 z-20 mt-8 md:mt-0">
                    <motion.div
                        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-15 border-t-green-400 blur-[1px] mb-2 hidden md:block"
                    />

                    <Link href="/candidates/jobs">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(74,222,128,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-3 bg-black text-white font-bold border border-green-500/30 rounded-md shadow-[0_0_20px_rgba(74,222,128,0.1)] transition-all uppercase tracking-widest text-sm cta-button"
                        >
                            LET&apos;S GET STARTED
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ title, subtitle, delay, direction, alignRight = false }: { title: string, subtitle: string, delay: number, direction: number, alignRight?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, x: direction }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="relative group cursor-pointer"
    >
        {/* Dynamic Glow Effect */}
        <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />

        <div className={`relative p-2 md:p-4 bg-black/60 border border-white/10 group-hover:border-green-500/50 rounded-sm w-40 md:w-56 flex ${alignRight ? 'flex-row-reverse' : 'flex-row'} items-center gap-3 shadow-2xl backdrop-blur-md transition-colors duration-300`}>
            {/* The Green Square Icon box */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600/10 border border-green-500/20 group-hover:border-green-400 group-hover:bg-green-600/30 rounded-sm shrink-0 flex items-center justify-center transition-all duration-300">
                <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: delay }}
                    className="w-2 h-2 md:w-3 md:h-3 bg-green-400 blur-[1px] rounded-sm"
                />
            </div>

            <div className={`${alignRight ? 'text-right' : 'text-left'}`}>
                <h4 className="text-white font-bold text-[9px] md:text-[11px] leading-tight tracking-tight uppercase">
                    {title} <br />
                    <span className="text-gray-400 group-hover:text-green-200 transition-colors font-medium">{subtitle}</span>
                </h4>
            </div>
        </div>
    </motion.div>
);

export default HowWeHelp;
