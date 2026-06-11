export async function register() {
  // Only run on the Node.js runtime (not edge), skip during next build analysis
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Pre-warm the CEIPAL data cache in the background so the first user
  // request hits the cache instead of waiting for the API.
  const { getAllJobs, getAllPlacements } = await import('@/lib/data-cache');
  Promise.all([getAllJobs(), getAllPlacements()]).catch(() => {
    // Non-fatal — cache will be populated on first real request instead
  });
}
