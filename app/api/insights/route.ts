import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "insights.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "insights");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";

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

function readData(): InsightsData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeData(data: InsightsData) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET - fetch all media (public, no auth needed)
export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ images: [], reels: [] });
  }
}

// POST - upload new media (admin only)
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as "image" | "reel";
  const alt = (formData.get("alt") as string) || "";
  const url = (formData.get("url") as string) || "";

  if (!file || !type) {
    return NextResponse.json({ error: "File and type are required" }, { status: 400 });
  }

  // Save file to public/insights/
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);

  // Update JSON data
  const data = readData();
  const id = `${type === "image" ? "img" : "reel"}-${Date.now()}`;
  const newItem: MediaItem = {
    id,
    src: `/insights/${fileName}`,
    alt,
    url,
  };

  if (type === "image") {
    data.images.push(newItem);
  } else {
    data.reels.push(newItem);
  }

  writeData(data);

  return NextResponse.json({ success: true, item: newItem });
}

// DELETE - remove media (admin only)
export async function DELETE(req: NextRequest) {
  const { id, password } = await req.json();

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = readData();

  // Find and remove the item
  let removed: MediaItem | undefined;

  const imgIndex = data.images.findIndex((i) => i.id === id);
  if (imgIndex !== -1) {
    removed = data.images.splice(imgIndex, 1)[0];
  }

  const reelIndex = data.reels.findIndex((r) => r.id === id);
  if (reelIndex !== -1) {
    removed = data.reels.splice(reelIndex, 1)[0];
  }

  if (!removed) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Delete the actual file
  const filePath = path.join(process.cwd(), "public", removed.src);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  writeData(data);

  return NextResponse.json({ success: true });
}
