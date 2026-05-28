"use client";

import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import Logo from "../../public/logo.svg";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/candidates/jobs" || pathname === "/clients/portal") {
    return null;
  }

  const NavLinks = [
    {
      label: "About Us",
      href: "/about-us"
    },
    {
      label: "Clients",
      href: "/clients"
    },
    {
      label: "Candidates",
      href: "/candidates"
    },
    {
      label: "Served Sectors",
      href: "/served-sectors"
    },
    {
      label: "Contact Us",
      href: "/contact-us"
    },
  ];

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Framer Motion Variants
  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const navItemVariants: any = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const mobileMenuVariants: any = {
    closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    opened: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.07, delayChildren: 0.2 } },
  };

  const mobileItemVariants = {
    closed: { x: 50, opacity: 0 },
    opened: { x: 0, opacity: 1 },
  };

  return (
    // 🛠️ Header is now 'fixed'. It transitions from 'absolute' feel to 'sticky' via scroll state.
    <header className={`fixed right-0 w-full top-0 z-40 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-transparent"}`}>

      {/* Top info bar - We hide this when scrolled for a cleaner sticky nav */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#0762AF] hidden lg:flex w-full justify-between items-center text-white overflow-hidden"
          >
            <Container className="flex justify-between items-center py-3">
              <p className="text-sm">Empowering hiring decisions one connection at a time.</p>
              <div className="flex justify-end gap-4 items-center">
                <p className="text-sm">+1 732-983-5723</p>
                <ul className="flex gap-2 ">
                  {[RiInstagramFill, FaFacebookF, FaLinkedinIn, FaTwitter].map((Icon, i) => (
                    <motion.li
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      key={i}
                      className="w-6 h-6 bg-white rounded-full flex justify-center items-center cursor-pointer shadow-sm"
                    >
                      <Icon className="text-[#0762AF] text-xs" />
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main nav row */}
      <Container className={`flex items-center transition-all duration-300 justify-between ${scrolled ? "py-4" : "py-6"}`}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6"
        >
          {/* 🛠️ Logo color swap based on scroll - Hide on jobs page */}
          <Link href="/">
              <Image
                src={Logo}
                alt="Mintex Staffing Logo"
                width={scrolled ? 200 : 240}
                height={30}
                priority
                className={`transition-all duration-300 ${scrolled ? "brightness-0" : ""}`}
              />
            </Link>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center">
          <motion.ul
            variants={navContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center"
          >
            {NavLinks.map((link) => (
              <Link href={link.href} key={link.label} scroll={false}>
                <motion.li
                  variants={navItemVariants}
                  key={link.label}
                  whileHover={{ scale: 1.05 }}
                  // 🛠️ Text color changes to dark when background becomes white
                  className={`inline-block ml-8 cursor-pointer text-sm font-medium transition-colors ${scrolled ? "text-gray-800 hover:text-[#0762AF]" : "text-white hover:text-[#57EEFF]"}`}
                >
                  {link.label}
                </motion.li>
              </Link>
            ))}
          </motion.ul>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen((s) => !s)}
            // 🛠️ Button background adjusts to contrast with scroll state
            className={`p-2 rounded-md transition-colors ${scrolled ? "bg-gray-100 text-gray-800" : "bg-white/10 text-white"} z-[60]`}
          >
            {open ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </motion.button>
        </div>
      </Container>

      {/* Mobile Drawer (Remains the same logic) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              variants={mobileMenuVariants}
              initial="closed"
              animate="opened"
              exit="closed"
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white text-black shadow-2xl z-50 lg:hidden flex flex-col"
            >
              {/* Drawer Content */}
              <div className="flex items-center justify-between p-4 border-b">
                <Image src={Logo} alt="Logo" width={160} height={24} className="brightness-0" />
                <button onClick={() => setOpen(false)} className="p-2 text-gray-700 ml-auto">
                  <HiOutlineX size={22} />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <ul className="flex flex-col gap-6">
                  {NavLinks.map((link) => (
                    <Link href={link.href} key={link.label} scroll={false}>
                      <motion.li variants={mobileItemVariants} key={link.label}>
                        <button
                          onClick={() => setOpen(false)}
                          className="w-full text-left text-xl font-bold py-2 hover:text-[#0762AF] transition-colors"
                        >
                          {link.label}
                        </button>
                      </motion.li>
                    </Link>
                  ))}
                </ul>
                {/* ... existing Contact Info inside drawer ... */}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}