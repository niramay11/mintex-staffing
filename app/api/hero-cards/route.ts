import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";
const BUCKET = "insights";
const FOLDER = "hero-profiles";

export type HeroStat = { id: string; value: string; label: string; icon_key: string };
export type HeroJob = { id: string; job_title: string; location: string; label: string };
export type HeroProfile = { id: string; name: string; role: string; sub: string; initial: string; image_url: string | null };

export type HeroCardsData = {
  stats: HeroStat[];
  jobs: HeroJob[];
  profiles: HeroProfile[];
};

async function fetchHeroCards(): Promise<HeroCardsData> {
  const [statsRes, jobsRes, profilesRes] = await Promise.all([
    supabase.from("hero_stats").select("*").order("sort_order"),
    supabase.from("hero_jobs").select("*").order("sort_order"),
    supabase.from("hero_profiles").select("*").order("sort_order"),
  ]);

  return {
    stats: statsRes.data ?? [],
    jobs: jobsRes.data ?? [],
    profiles: profilesRes.data ?? [],
  };
}

export async function GET() {
  try {
    const data = await fetchHeroCards();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch hero cards" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, stats, jobs, profiles } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (stats) {
      await supabaseAdmin.from("hero_stats").upsert(
        stats.map((s: HeroStat, i: number) => ({ ...s, sort_order: i }))
      );
    }

    if (jobs) {
      await supabaseAdmin.from("hero_jobs").upsert(
        jobs.map((j: HeroJob, i: number) => ({ ...j, sort_order: i }))
      );
    }

    if (profiles) {
      await supabaseAdmin.from("hero_profiles").upsert(
        profiles.map((p: HeroProfile, i: number) => ({ ...p, sort_order: i }))
      );
    }

    const updated = await fetchHeroCards();
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update hero cards" }, { status: 500 });
  }
}

// Upload a profile photo — multipart form: password, id, file
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get("password") as string;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = formData.get("file") as File | null;
    const id = formData.get("id") as string;

    if (!file || !id) {
      return NextResponse.json({ error: "File and id are required" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${FOLDER}/${id}-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, bytes, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const { data: existing } = await supabaseAdmin
      .from("hero_profiles")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();

    if (existing?.image_url) {
      const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
      const oldPath = existing.image_url.replace(prefix, "");
      if (oldPath !== fileName) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("hero_profiles")
      .update({ image_url: publicUrl })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, image_url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unexpected server error" }, { status: 500 });
  }
}
