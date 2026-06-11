import Image from "next/image";

export default function PortalDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header — identical to real header so there's no layout shift */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.svg" alt="Mintex Staffing" width={120} height={36} className="brightness-0 invert" />
            <span className="text-gray-700">|</span>
            <span className="text-sm text-gray-400">Client Portal</span>
          </div>
          <div className="h-8 w-24 rounded-lg bg-gray-800 animate-pulse" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <div className="h-8 w-16 rounded bg-gray-800 animate-pulse mb-2" />
              <div className="h-4 w-24 rounded bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tabs row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-28 rounded-lg bg-orange-600/40 animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-gray-800 animate-pulse" />
          <div className="h-10 w-28 rounded-lg bg-gray-800 animate-pulse ml-auto" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <div className="bg-gray-900 px-4 py-3 grid grid-cols-6 gap-4">
            {['Job Code','Title','Location','Type','Positions','Status'].map(h => (
              <div key={h} className="h-4 rounded bg-gray-700 animate-pulse" />
            ))}
          </div>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="px-4 py-4 grid grid-cols-6 gap-4 border-t border-gray-800">
              <div className="h-4 w-20 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 rounded bg-gray-800 animate-pulse col-span-2" />
              <div className="h-4 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-6 rounded bg-gray-800 animate-pulse mx-auto" />
              <div className="h-5 w-16 rounded-full bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
