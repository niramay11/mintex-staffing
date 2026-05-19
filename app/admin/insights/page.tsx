"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

type MediaItem = {
  id: string;
  src: string;
  alt: string;
  url: string;
};

type InsightsData = {
  images: MediaItem[];
  reels: MediaItem[];
};

export default function AdminInsightsPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [data, setData] = useState<InsightsData>({ images: [], reels: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "reel">("image");
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const res = await fetch("/api/insights");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verify password by trying a dummy operation
    const res = await fetch("/api/insights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "__verify__", password }),
    });
    if (res.status === 401) {
      setAuthError("Wrong password");
      return;
    }
    setAuthError("");
    setAuthenticated(true);
  };

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

    setAlt("");
    setUrl("");
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

  // --- Login Screen ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none mb-4"
          />
          {authError && (
            <p className="text-red-400 text-sm mb-4">{authError}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // --- Admin Dashboard ---
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Manage Insights Media
        </h1>

        {/* Upload Form */}
        <form
          onSubmit={handleUpload}
          className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-10"
        >
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
              <label className="block text-sm text-gray-400 mb-1">
                File {uploadType === "image" ? "(jpg, png, webp)" : "(mp4)"}
              </label>
              <input
                ref={fileRef}
                type="file"
                accept={uploadType === "image" ? "image/*" : "video/mp4"}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Alt / Caption
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="e.g. Team meeting"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Redirect URL (Instagram / social link)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Images Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Images ({data.images.length})
          </h2>
          {data.images.length === 0 ? (
            <p className="text-gray-500">No images yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-800 bg-gray-900"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-300 truncate">{img.alt || "No caption"}</p>
                    {img.url && (
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline truncate block"
                      >
                        {img.url}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reels Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Reels ({data.reels.length})
          </h2>
          {data.reels.length === 0 ? (
            <p className="text-gray-500">No reels yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.reels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-800 bg-gray-900"
                >
                  <div className="aspect-[9/16] relative bg-black">
                    <video
                      src={reel.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.target as HTMLVideoElement;
                        v.pause();
                        v.currentTime = 0;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-300 truncate">{reel.alt || "No caption"}</p>
                    {reel.url && (
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline truncate block"
                      >
                        {reel.url}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(reel.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
