import { motion } from 'framer-motion'
import Image from 'next/image'
import ManOnChair from '../assets/man-on-chair.png';
import ChairImg from '../assets/chair.png';

const Hero = () => {
    return (
        <section className="relative pt-20 md:pt-32 pb-12 md:pb-20 flex flex-col items-center overflow-hidden">
            {/* Animated Heading Separator */}
            <motion.div
                initial={{ opacity: 0, x: -200 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="flex items-center gap-4 mb-8 md:mb-20 border-b border-gray-600 py-8 w-[200px] max-w-md justify-center"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-300 text-lg md:text-3xl font-light tracking-[0.3em] uppercase"
                >
                    CLIENTS
                </motion.span>
            </motion.div>

            {/* Main Title with Breathing Effect */}
            <motion.h1
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                    duration: 1,
                    ease: "easeOut",
                }}
                className="text-4xl md:text-7xl font-bold mb-8 text-center font-bebas tracking-wide leading-tight"
            >
                YOUR NEXT MOVE <br className="md:hidden" />

                <motion.span
                    animate={{
                        textShadow: [
                            "0 0 10px rgba(34,211,238,0.5)",
                            "0 0 25px rgba(34,211,238,0.8)",
                            "0 0 10px rgba(34,211,238,0.5)",
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-cyan-400 block md:inline"
                >
                    STARTS HERE
                </motion.span>
            </motion.h1>

            <div className="relative w-full max-w-6xl mx-auto h-[400px] md:h-[600px] flex items-end justify-center gap-8 md:gap-20">

                {/* Man on Chair - Drops from top then floats */}
                <motion.div
                    initial={{ y: -400, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                    className="relative w-64 h-80 md:w-[450px] md:h-[550px] z-20"
                >
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                        className="relative w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        <Image
                            src={ManOnChair}
                            alt="Candidate"
                            fill
                            priority
                            className="object-contain"
                        />
                    </motion.div>
                </motion.div>

                {/* Empty Chairs - Staggered Fade-in and Hover Effect */}
                <div className="hidden md:flex gap-4 md:gap-8 pb-10">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50, filter: 'grayscale(100%)' }}
                            animate={{ opacity: 0.4, y: 0 }}
                            whileHover={{
                                opacity: 0.8,
                                scale: 1.1,
                                filter: 'grayscale(0%)',
                                transition: { duration: 0.3 }
                            }}
                            transition={{
                                delay: 0.8 + (i * 0.2),
                                duration: 0.8,
                                ease: "easeOut"
                            }}
                            className="relative w-20 h-28 md:w-64 md:h-80 cursor-pointer"
                        >
                            <Image
                                src={ChairImg}
                                alt="Empty Chair"
                                fill
                                className="object-contain"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Decorative Element (Optional Lively Addition) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -z-10"
            />
        </section>
    )
}

export default Hero