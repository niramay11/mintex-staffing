import React from 'react'
import ScrollReveal from '../components/ScrollReveal'
import { motion } from 'framer-motion'
import MetallicIcon from '../assets/felxi_hiring.png';
import Brain from '../assets/brain.png';
import Global from '../assets/global_reach.png';
import Pipe from '../assets/pipe.svg';
import Image from 'next/image'

const Feature = () => {
    return (
        <div className="w-full min-h-screen bg-black py-20 md:py-40 relative z-10 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Card 1 */}
                    <ScrollReveal delay={0.1} className="rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-6 relative group overflow-hidden border border-white/10"
                        style={{
                            background: 'linear-gradient(180deg, #2A2A2A 0%, #685a3e 100%)'
                        }}>
                        <div className="relative w-24 h-24 md:w-32 md:h-32 transform group-hover:scale-110 transition-transform duration-500">
                            <Image src={MetallicIcon} alt="Icon" fill className="object-contain" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <h3 className="text-xl md:text-2xl font-bold font-gilroy mb-3 text-white">Flexible Hiring Options</h3>
                            <p className="text-gray-200 font-gilroy text-sm leading-relaxed">
                                Contract | Temp-to-Perm | Direct Hire | Part-Time
                            </p>
                        </motion.div>
                    </ScrollReveal>

                    {/* Card 2 */}
                    <ScrollReveal delay={0.2} className="rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-6 relative group overflow-hidden border border-white/10"
                        style={{
                            background: 'linear-gradient(180deg, #2A2A2A 0%, #685a3e 100%)'
                        }}>
                        <div className="relative w-24 h-24 md:w-32 md:h-32 transform group-hover:scale-110 transition-transform duration-500">
                            <Image src={Brain} alt="Icon" fill className="object-contain" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <h3 className="text-xl md:text-2xl font-bold font-gilroy mb-3 text-white">Smart Staffing Tech</h3>
                            <p className="text-gray-200 font-gilroy text-sm leading-relaxed">
                                AI-driven sourcing, data-backed hiring decisions, and human insight
                            </p>
                        </motion.div>
                    </ScrollReveal>

                    {/* Card 3 */}
                    <ScrollReveal delay={0.3} className="rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-6 relative group overflow-hidden border border-white/10"
                        style={{
                            background: 'linear-gradient(180deg, #2A2A2A 0%, #685a3e 100%)'
                        }}>
                        <div className="relative w-24 h-24 md:w-32 md:h-32 transform group-hover:scale-110 transition-transform duration-500">
                            <Image src={Global} alt="Icon" fill className="object-contain" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <h3 className="text-xl md:text-2xl font-bold font-gilroy mb-3 text-white">Global Reach, Local Focus</h3>
                            <p className="text-gray-200 font-gilroy text-sm leading-relaxed">
                                200+ recruiters across time zones, working to fuel your growth 24/7.
                            </p>
                        </motion.div>
                    </ScrollReveal>

                </div>
            </div>
            <Image
                src={Pipe}
                alt="Icon"
                width={400}
                height={400}
                className="object-contain absolute -bottom-10 left-0 translate-x-1/4 w-40 h-40 md:w-72 md:h-72 lg:w-[400px] lg:h-[400px] md:translate-x-1/2 opacity-50 md:opacity-100"
            />
        </div>
    )
}

export default Feature