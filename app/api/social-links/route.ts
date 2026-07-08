import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";
// Reuses the "insights" bucket that's already set up in this project (same
// bucket the Insights/Hero-profile uploads use) — no new table, no SQL,
// no manual setup step needed for this to work.
const BUCKET = "insights";
const FILE_PATH = "config/social-links.json";

export type SocialLink = { id: string; label: string; url: string };

const DEFAULT_LINKS: SocialLink[] = [
  { id: "instagram", label: "Instagram", url: "https://instagram.com" },
  { id: "facebook", label: "Facebook", url: "https://facebook.com" },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/mintex-staffing/posts/?feedView=all" },
  { id: "twitter", label: "Twitter / X", url: "https://twitter.com" },
];

async function fetchSocialLinks(): Promise<SocialLink[]> {
  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(FILE_PATH);
  try {
    const res = await fetch(urlData.publicUrl, { cache: "no-store" });
    if (!res.ok) return DEFAULT_LINKS;
    const json = await res.json();
    return Array.isArray(json) && json.length > 0 ? json : DEFAULT_LINKS;
  } catch {
    return DEFAULT_LINKS;
  }
}

export async function GET() {
  try {
    const data = await fetchSocialLinks();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch social links" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, links } = body as { password: string; links: SocialLink[] };

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.stringify(links ?? []);
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(FILE_PATH, payload, { contentType: "application/json", upsert: true });

    if (error) {
      return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: links ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to update social links" }, { status: 500 });
  }
}
