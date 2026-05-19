import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import { Inter, Bebas_Neue } from "next/font/google";
import Footer from "./components/Footer";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const gilroy = localFont({
  src: [
    {
      path: "../public/fonts/Gilroy-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Gilroy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Gilroy-HeavyItalic.woff2",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-gilroy",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Mintex Staffing",
  description: "Staffing and recruitment solutions for modern businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bebasNeue.variable} ${gilroy.variable} min-h-screen bg-slate-950 text-slate-50`}
      >
        <ScrollToTop />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
