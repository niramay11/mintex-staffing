"use client";

import Hero from './Hero';
import HowWeHelp from './HowWeHelp';
import Support from './Support';
import AboutSection from './about';

const CandidatesClient = () => {
    return (
        <div className="bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
            <Hero />
            {/* About Section */}
            <AboutSection />

            {/* How We Help Diagram Section */}
            <HowWeHelp />

            <Support />
        </div>
    )
}

export default CandidatesClient;
