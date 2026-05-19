"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Seperator from "../assets/AboutSeperator.svg";
import Mintex from "../assets/mintex-m.svg";
import Group from "../assets/about-group.png";

const About = () => {
  // Animation variants for the text container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // Variants for individual text elements
  const textItemVariants: any = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Variants for the decorative background images
  const imageVariants: any = {
    hidden: { opacity: 0, scale: 0.9, y: -100 }, // Changed from x to y: -100 for top entry
    visible: (customDelay: any) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1.2,
        delay: customDelay,
        ease: "easeOut"
      },
    }),
  };

  return (
    <div className="about-bg min-h-max md:min-h-[700px] h-max md:h-screen relative overflow-hidden">
      {/* Central Text Content */}
      <motion.div
        className="flex flex-col justify-center items-center max-w-full px-6 md:max-w-[70%] gap-5 mx-auto py-14 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        <motion.h5
          variants={textItemVariants}
          className="font-semibold text-center text-white tracking-widest"
        >
          ABOUT US
        </motion.h5>

        <motion.h3
          variants={textItemVariants}
          className="text-5xl text-center text-[#57EEFF] font-bold"
        >
          Mintex Staffing
        </motion.h3>

        <motion.p
          variants={textItemVariants}
          className="text-white text-2xl text-center font-light leading-relaxed"
        >
          is a trusted staffing and recruitment agency with a physical presence
          in <span className="text-[#57EEFF] font-normal">Edison, New Jersey</span>,
          helping businesses nationwide find their ideal match. A wing of Mintex,
          we’ve been catering companies grow with the right talent since 2003 bringing
          over 20 years of experience to the world of hiring.
        </motion.p>

        <motion.div variants={textItemVariants}>
          <Image src={Seperator} alt="Seperator" width={225} height={75} />
        </motion.div>
      </motion.div>

      {/* Background Decorative Logo */}
      <motion.div
        custom={0.4}
        variants={imageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="absolute w-full h-full md:h-max md:w-[40%] left-0 bottom-0 opacity-45 md:opacity-100 md:translate-x-[75%]"
      >
        <Image
          src={Mintex}
          alt="Mintex Decorative Logo"
          width={800}
          height={400}
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Floating Group Image (Desktop Only) */}
      <motion.div
        custom={0.6}
        // variants={imageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        className="absolute hidden md:block w-[24%] left-0 bottom-0 translate-x-[155%]"
      >
        <Image
          src={Group}
          alt="Staffing Group"
          width={800}
          height={400}
          className="w-full h-auto"
        />
      </motion.div>
    </div>
  );
};

export default About;