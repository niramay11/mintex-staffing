"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import type { StatisticsData, StatItem, Industry, MarketPoint } from "../../api/statistics/route";

// ─── Insights types ───────────────────────────────────────────────────────────
type MediaItem = { id: string; src: string; alt: string; url: string };
type InsightsData = { images: MediaItem[]; reels: MediaItem[] };

const STORAGE_KEY = "mintex_admin_pw";

// ─── Admin panel ─────────────────────────────────────────────────────────────
export default function AdminInsightsPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"media" | "impact" | "history" | "messages">("media");
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount (browser only)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setSavedPassword(saved); setAuthenticated(true); }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/insights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "__verify__", password }),
    });
    if (res.status === 401) { setAuthError("Wrong password"); return; }
    setAuthError("");
    localStorage.setItem(STORAGE_KEY, password);
    setSavedPassword(password);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthenticated(false);
    setPassword("");
    setSavedPassword("");
  };

  const activePassword = password || savedPassword;

  if (loading) return <div className="min-h-screen bg-gray-950" />;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none mb-4"
          />
          {authError && <p className="text-red-400 text-sm mb-4">{authError}</p>}
          <button type="submit" className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Tab bar */}
      <div className="border-b border-gray-800 px-6 md:px-10 pt-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
              Logout
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["media", "impact", "history", "messages"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-gray-900 text-cyan-400 border border-b-0 border-gray-700"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "media" ? "Insights Media" : tab === "impact" ? "Our Impact Stats" : tab === "history" ? "History Images" : "Messages"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
        {activeTab === "media" && <MediaTab password={activePassword} />}
        {activeTab === "impact" && <ImpactTab password={activePassword} />}
        {activeTab === "history" && <HistoryImagesTab password={activePassword} />}
        {activeTab === "messages" && <MessagesTab password={activePassword} />}
      </div>
    </div>
  );
}

// ─── Media tab (original functionality) ──────────────────────────────────────
function MediaTab({ password }: { password: string }) {
  const [data, setData] = useState<InsightsData>({ images: [], reels: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "reel">("image");
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const res = await fetch("/api/insights");
    setData(await res.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", uploadType);
    formData.append("alt", alt);
    formData.append("url", url);
    formData.append("password", password);
    await fetch("/api/insights", { method: "POST", body: formData });
    setAlt(""); setUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await fetch("/api/insights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    fetchData();
  };

  return (
    <>
      <form onSubmit={handleUpload} className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-10">
        <h2 className="text-xl font-semibold mb-4">Upload New</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as "image" | "reel")}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none"
            >
              <option value="image">Image</option>
              <option value="reel">Reel (Video)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">File {uploadType === "image" ? "(jpg, png, webp)" : "(mp4)"}</label>
            <input
              ref={fileRef}
              type="file"
              accept={uploadType === "image" ? "image/*" : "video/mp4"}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Alt / Caption</label>
            <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Team meeting"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Redirect URL (Instagram / social link)</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://instagram.com/p/..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" disabled={uploading}
          className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Images ({data.images.length})</h2>
        {data.images.length === 0 ? <p className="text-gray-500">No images yet.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data.images.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                <div className="aspect-square relative">
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="200px" />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-300 truncate">{img.alt || "No caption"}</p>
                  {img.url && <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline truncate block">{img.url}</a>}
                </div>
                <button onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Reels ({data.reels.length})</h2>
        {data.reels.length === 0 ? <p className="text-gray-500">No reels yet.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data.reels.map((reel) => (
              <div key={reel.id} className="relative group rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                <div className="aspect-[9/16] relative bg-black">
                  <video src={reel.src} muted playsInline preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-300 truncate">{reel.alt || "No caption"}</p>
                  {reel.url && <a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline truncate block">{reel.url}</a>}
                </div>
                <button onClick={() => handleDelete(reel.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ─── Our Impact tab ───────────────────────────────────────────────────────────
function ImpactTab({ password }: { password: string }) {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/statistics").then((r) => r.json()).then(setData);
  }, []);

  const save = async (section: string, updates: Partial<StatisticsData>) => {
    setSaving(section);
    const res = await fetch("/api/statistics", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...updates }),
    });
    const json = await res.json();
    if (json.success) { setData(json.data); setSaved(section); setTimeout(() => setSaved(null), 2000); }
    setSaving(null);
  };

  if (!data) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="space-y-10">
      <StatCardsEditor data={data} saving={saving} saved={saved} onSave={save} />
      <KeyNumbersEditor data={data} saving={saving} saved={saved} onSave={save} />
      <IndustriesEditor data={data} saving={saving} saved={saved} onSave={save} />
      <MarketDataEditor data={data} saving={saving} saved={saved} onSave={save} />
      <RetentionEditor data={data} saving={saving} saved={saved} onSave={save} />
    </div>
  );
}

// ─── Shared save button ───────────────────────────────────────────────────────
function SaveBtn({ section, saving, saved }: { section: string; saving: string | null; saved: string | null }) {
  const isLoading = saving === section;
  const isDone = saved === section;
  return (
    <button type="submit" disabled={!!saving}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
        isDone ? "bg-green-600 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"
      }`}>
      {isLoading ? "Saving…" : isDone ? "Saved ✓" : "Save Changes"}
    </button>
  );
}

function sectionBox(title: string, children: React.ReactNode) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-lg font-semibold text-white mb-5">{title}</h2>
      {children}
    </div>
  );
}

// ─── Stat Cards editor ────────────────────────────────────────────────────────
function StatCardsEditor({ data, saving, saved, onSave }: {
  data: StatisticsData;
  saving: string | null;
  saved: string | null;
  onSave: (section: string, updates: Partial<StatisticsData>) => void;
}) {
  const [stats, setStats] = useState<StatItem[]>(data.stats);

  const update = (index: number, field: keyof StatItem, value: string | number) => {
    setStats((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave("stats", { stats });
  };

  return sectionBox("Key Stats Cards", (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3 mb-5">
        {stats.map((s, i) => (
          <div key={s.id} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-1 text-xs text-gray-500 text-center">#{i + 1}</span>
            <div className="col-span-5">
              <input value={s.label} onChange={(e) => update(i, "label", e.target.value)}
                placeholder="Label" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
            <div className="col-span-4">
              <input type="number" value={s.value} onChange={(e) => update(i, "value", Number(e.target.value))}
                placeholder="Value" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
            <div className="col-span-2">
              <input value={s.suffix} onChange={(e) => update(i, "suffix", e.target.value)}
                placeholder="Suffix" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-4">Suffix example: <code className="text-cyan-400">+</code> for "150+", leave blank for plain number</p>
      <SaveBtn section="stats" saving={saving} saved={saved} />
    </form>
  ));
}

// ─── Key numbers editor ───────────────────────────────────────────────────────
function KeyNumbersEditor({ data, saving, saved, onSave }: {
  data: StatisticsData;
  saving: string | null;
  saved: string | null;
  onSave: (section: string, updates: Partial<StatisticsData>) => void;
}) {
  const [years, setYears] = useState(data.yearsOfExperience);
  const [hours, setHours] = useState(data.turnaroundHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave("keynumbers", { yearsOfExperience: years, turnaroundHours: hours });
  };

  return sectionBox("Key Numbers", (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Years of Experience</label>
          <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Turnaround Time (Hours)</label>
          <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none" />
        </div>
      </div>
      <SaveBtn section="keynumbers" saving={saving} saved={saved} />
    </form>
  ));
}

// ─── Industries editor ────────────────────────────────────────────────────────
function IndustriesEditor({ data, saving, saved, onSave }: {
  data: StatisticsData;
  saving: string | null;
  saved: string | null;
  onSave: (section: string, updates: Partial<StatisticsData>) => void;
}) {
  const [industries, setIndustries] = useState<Industry[]>(data.industries);

  const update = (index: number, field: keyof Industry, value: string | number) => {
    setIndustries((prev) => prev.map((ind, i) => i === index ? { ...ind, [field]: value } : ind));
  };

  const addRow = () => {
    setIndustries((prev) => [...prev, { id: `i${Date.now()}`, name: "", percent: 0, color: "#22d3ee" }]);
  };

  const removeRow = (index: number) => {
    setIndustries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave("industries", { industries });
  };

  return sectionBox("Industry Focus", (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
          <span className="col-span-5">Industry Name</span>
          <span className="col-span-3">Percent (%)</span>
          <span className="col-span-3">Color</span>
          <span className="col-span-1" />
        </div>
        {industries.map((ind, i) => (
          <div key={ind.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <input value={ind.name} onChange={(e) => update(i, "name", e.target.value)}
                placeholder="e.g. Healthcare"
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
            <div className="col-span-3">
              <input type="number" min="0" max="100" value={ind.percent} onChange={(e) => update(i, "percent", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <input type="color" value={ind.color} onChange={(e) => update(i, "color", e.target.value)}
                className="w-10 h-9 rounded cursor-pointer bg-transparent border border-gray-700 shrink-0" />
              <input
                type="text"
                value={ind.color}
                onChange={(e) => {
                  const val = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) update(i, "color", val);
                }}
                maxLength={7}
                placeholder="#22d3ee"
                className="w-full px-2 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <button type="button" onClick={() => removeRow(i)}
                className="w-7 h-7 rounded-full bg-red-900/50 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center text-sm transition-colors">
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow}
        className="text-sm text-cyan-400 hover:text-cyan-300 mb-5 transition-colors">
        + Add Industry
      </button>
      <div className="mt-2">
        <SaveBtn section="industries" saving={saving} saved={saved} />
      </div>
    </form>
  ));
}

// ─── Market data editor ───────────────────────────────────────────────────────
function MarketDataEditor({ data, saving, saved, onSave }: {
  data: StatisticsData;
  saving: string | null;
  saved: string | null;
  onSave: (section: string, updates: Partial<StatisticsData>) => void;
}) {
  const [marketData, setMarketData] = useState<MarketPoint[]>(data.marketData);
  const [year, setYear] = useState<number>(data.marketDataYear ?? new Date().getFullYear());

  const update = (index: number, value: number) => {
    setMarketData((prev) => prev.map((pt, i) => i === index ? { ...pt, value } : pt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave("marketdata", { marketData, marketDataYear: year });
  };

  return sectionBox("Job Opening Trends (Chart Data)", (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <label className="block text-xs text-gray-400 mb-1">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-32 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
        {marketData.map((pt, i) => (
          <div key={pt.month}>
            <label className="block text-xs text-gray-400 mb-1">{pt.month}</label>
            <input type="number" value={pt.value} onChange={(e) => update(i, Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
        ))}
      </div>
      <SaveBtn section="marketdata" saving={saving} saved={saved} />
    </form>
  ));
}

// ─── History Images tab ───────────────────────────────────────────────────────
const HISTORY_YEARS = [
  { year: "2002", label: "When We Started" },
  { year: "2010", label: "Expanding Horizons" },
  { year: "2018", label: "Going Global" },
  { year: "2024", label: "The Future Is Now" },
];

type HistoryImageItem = { id: string; year: string; image_src: string };

function HistoryImagesTab({ password }: { password: string }) {
  const [items, setItems]         = useState<HistoryImageItem[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ year: string; ok: boolean; text: string } | null>(null);
  const [loadError, setLoadError] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showStatus = (year: string, ok: boolean, text: string) => {
    setStatusMsg({ year, ok, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/history-images");
      if (!res.ok) { setLoadError(`Failed to load (${res.status})`); return; }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setLoadError("");
    } catch (e) {
      setLoadError("Network error — could not load images.");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getImageForYear = (year: string) => items.find((i) => i.year === year);

  const handleUpload = async (year: string) => {
    const file = fileRefs.current[year]?.files?.[0];
    if (!file) { showStatus(year, false, "Please select a file first."); return; }

    setUploading(year);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("year", year);
      formData.append("password", password);

      const res = await fetch("/api/history-images", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        showStatus(year, false, json.error || `Upload failed (${res.status})`);
      } else {
        if (fileRefs.current[year]) fileRefs.current[year]!.value = "";
        showStatus(year, true, "Image uploaded successfully.");
        await fetchData();
      }
    } catch {
      showStatus(year, false, "Network error — upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (year: string) => {
    if (!confirm(`Remove the image for ${year}?`)) return;
    try {
      const res = await fetch("/api/history-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        showStatus(year, false, json.error || `Delete failed (${res.status})`);
      } else {
        showStatus(year, true, "Image removed.");
        await fetchData();
      }
    } catch {
      showStatus(year, false, "Network error — delete failed.");
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6">
        Upload or replace the image for each era shown in the About Us history section. If no image is uploaded, the default image is used.
      </p>

      {loadError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm">
          {loadError}
        </div>
      )}

      <div className="space-y-4">
        {HISTORY_YEARS.map(({ year, label }) => {
          const existing    = getImageForYear(year);
          const isUploading = uploading === year;
          const msg         = statusMsg?.year === year ? statusMsg : null;

          return (
            <div key={year} className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col gap-3">
              {/* Top row: year + preview + controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Year label */}
                <div className="w-24 shrink-0">
                  <p className="text-xl font-bold text-[#FBBF24]">{year}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>

                {/* Preview */}
                <div className="w-28 shrink-0 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center" style={{ height: 72 }}>
                  {existing ? (
                    <img src={existing.image_src} alt={year} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500 text-center px-2">Default</span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    ref={(el) => { fileRefs.current[year] = el; }}
                    type="file"
                    accept="image/*"
                    className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-cyan-700 file:text-white file:cursor-pointer file:text-sm"
                  />
                  <button
                    onClick={() => handleUpload(year)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isUploading ? "Uploading…" : existing ? "Replace" : "Upload"}
                  </button>
                  {existing && (
                    <button
                      onClick={() => handleDelete(year)}
                      className="px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white text-sm font-semibold transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Inline status message */}
              {msg && (
                <p className={`text-xs font-medium px-1 ${msg.ok ? "text-green-400" : "text-red-400"}`}>
                  {msg.ok ? "✓" : "✗"} {msg.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Messages tab ────────────────────────────────────────────────────────────
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

function MessagesTab({ password }: { password: string }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) { setError("Failed to load messages."); setLoading(false); return; }
      setMessages(await res.json());
      setError("");
    } catch {
      setError("Network error — could not load messages.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleRead = async (msg: ContactMessage) => {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, read: !msg.read, password }),
    });
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: !m.read } : m));
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) return <p className="text-gray-400">Loading messages...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Contact Messages</h2>
          <p className="text-sm text-gray-400 mt-1">
            {messages.length} total{unreadCount > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-600 text-white text-xs font-semibold">{unreadCount} unread</span>}
          </p>
        </div>
        <button onClick={fetchMessages} className="text-sm text-gray-400 hover:text-white transition-colors">
          Refresh
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 text-center text-gray-500">
          No messages yet. Messages submitted via the contact form will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-gray-900 rounded-xl border transition-colors ${
                msg.read ? "border-gray-800" : "border-cyan-800"
              }`}
            >
              {/* Header row */}
              <div className="flex items-start gap-4 p-5">
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {!msg.read && <span className="block w-2 h-2 rounded-full bg-cyan-400" />}
                  {msg.read && <span className="block w-2 h-2 rounded-full bg-gray-700" />}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-white">{msg.name}</span>
                    <a href={`mailto:${msg.email}`} className="text-cyan-400 text-sm hover:underline truncate">
                      {msg.email}
                    </a>
                    <span className="text-xs text-gray-500 ml-auto shrink-0">
                      {new Date(msg.created_at).toLocaleString("en-AU", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Message preview / expanded */}
                  <p
                    className={`mt-2 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed ${
                      expanded === msg.id ? "" : "line-clamp-2"
                    }`}
                  >
                    {msg.message}
                  </p>
                  {msg.message.length > 120 && (
                    <button
                      onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 transition-colors"
                    >
                      {expanded === msg.id ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleRead(msg)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-800 hover:bg-gray-700 text-gray-300"
                  >
                    {msg.read ? "Mark Unread" : "Mark Read"}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Retention editor ─────────────────────────────────────────────────────────
function RetentionEditor({ data, saving, saved, onSave }: {
  data: StatisticsData;
  saving: string | null;
  saved: string | null;
  onSave: (section: string, updates: Partial<StatisticsData>) => void;
}) {
  const [clientYears, setClientYears] = useState(data.retentionClientYears);
  const [candidateYears, setCandidateYears] = useState(data.retentionCandidateYears);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave("retention", { retentionClientYears: clientYears, retentionCandidateYears: candidateYears });
  };

  return sectionBox("Retention Ratio (Donut Chart)", (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Client Retention (Years)</label>
          <input type="number" step="0.1" value={clientYears} onChange={(e) => setClientYears(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Candidate Retention (Years)</label>
          <input type="number" step="0.1" value={candidateYears} onChange={(e) => setCandidateYears(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none" />
        </div>
      </div>
      <SaveBtn section="retention" saving={saving} saved={saved} />
    </form>
  ));
}
