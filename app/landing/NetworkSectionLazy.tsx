"use client";

import dynamic from "next/dynamic";

const NetworkSection = dynamic(() => import("./NetworkSection"), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black" />,
});

export default function NetworkSectionLazy() {
  return <NetworkSection />;
}
