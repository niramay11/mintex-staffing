export default function JobsLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #060f28 50%, #030e18 100%)' }}>
      {/* Skeleton nav bar */}
      <div className="h-[62px] border-b border-white/5 bg-black/40 backdrop-blur flex items-center px-6 gap-6">
        <div className="h-7 w-32 rounded bg-white/10 animate-pulse" />
        <div className="h-7 w-24 rounded bg-white/10 animate-pulse ml-auto" />
      </div>

      <div className="flex">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 p-5 gap-4 border-r border-white/5">
          <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
              {[1,2,3].map(j => (
                <div key={j} className="h-7 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ))}
        </aside>

        {/* Job cards skeleton */}
        <main className="flex-1 p-6 grid gap-4 content-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="h-5 w-40 rounded bg-white/10" />
                <div className="h-5 w-16 rounded-full bg-white/10" />
              </div>
              <div className="h-4 w-32 rounded bg-white/8" />
              <div className="h-4 w-48 rounded bg-white/8" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 rounded-full bg-white/6" />
                <div className="h-6 w-16 rounded-full bg-white/6" />
              </div>
              <div className="h-9 rounded-lg bg-white/8 mt-2" />
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
