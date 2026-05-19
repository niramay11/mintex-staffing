import About from "./landing/About";
import Hero from "./components/Hero";
import NetworkSection from "./landing/NetworkSection";
import StatisticsWrapper from "./landing/StatisticsWrapper";
import InsightsSection from "./landing/InsightsSection";
import ScrollReveal from "./components/ScrollReveal";
import IsometricServiceGrid from "./landing/ServicesGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mintex Staffing - Connecting Ambition with Opportunity",
  description: "Mintex Staffing connects top talent with industry-leading organizations. We build futures, not just careers.",
};

export default function Home() {
  return (
    <main className="max-w-screen overflow-clip">
      <Hero />
      
      <ScrollReveal>
        <About />
      </ScrollReveal>

      {/* NetworkSection handles its own animations internally */}
      <NetworkSection />

      <div className="bg-service">
        <ScrollReveal>
          <IsometricServiceGrid />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <StatisticsWrapper />
        </ScrollReveal>
      </div>
      <ScrollReveal>
        <InsightsSection />
      </ScrollReveal>
    </main>
  );
}
