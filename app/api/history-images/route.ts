import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Reuses the existing `insights_media` table.
// History images are stored with type = "history-2002" | "history-2010" | "history-2018" | "history-2024"
// and id = "history-{year}" so there is at most one record per year.

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";
const BUCKET = "insights";
const FOLDER = "history";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("insights_media")
      .select("*")
      .like("id", "history-%")
      .order("alt", { ascending: true });

    if (error) {
      console.error("[history-images GET]", error.message);
      return NextResponse.json([]);
    }

    // Normalise to { year, image_src } shape that the frontend expects
    const items = (data ?? []).map((row: any) => ({
      id:        row.id,
      year:      row.alt,          // we store the year in the `alt` column
      image_src: row.src,
    }));

    return NextResponse.json(items);
  } catch (err) {
    console.error("[history-images GET] unexpected:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get("password") as string;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = formData.get("file") as File | null;
    const year = formData.get("year") as string;

    if (!file || !year) {
      return NextResponse.json({ error: "File and year are required" }, { status: 400 });
    }

    // ── 1. Upload file to Supabase Storage ──────────────────────────────────
    const ext      = file.name.split(".").pop() ?? "jpg";
    const fileName = `${FOLDER}/${year}-${Date.now()}.${ext}`;
    const bytes    = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, bytes, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[history-images POST] storage:", uploadError.message);
      return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // ── 2. Remove old storage file for this year if one exists ───────────────
    const id = `history-${year}`;
    const { data: existing } = await supabaseAdmin
      .from("insights_media")
      .select("src")
      .eq("id", id)
      .maybeSingle();

    if (existing?.src) {
      const prefix  = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
      const oldPath = existing.src.replace(prefix, "");
      if (oldPath !== fileName) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    // ── 3. Delete stale DB row then insert fresh one (safe upsert) ───────────
    await supabaseAdmin.from("insights_media").delete().eq("id", id);

    const { error: insertError } = await supabaseAdmin
      .from("insights_media")
      .insert({
        id,
        type: "image",   // must satisfy the check constraint
        src:  publicUrl,
        alt:  year,      // year stored here so GET can return it
        url:  "",
      });

    if (insertError) {
      console.error("[history-images POST] db insert:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, image_src: publicUrl });
  } catch (err: any) {
    console.error("[history-images POST] unexpected:", err);
    return NextResponse.json({ error: err?.message ?? "Unexpected server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = `history-${year}`;

    const { data: item } = await supabaseAdmin
      .from("insights_media")
      .select("src")
      .eq("id", id)
      .maybeSingle();

    if (item?.src) {
      const prefix   = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
      const filePath = item.src.replace(prefix, "");
      await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
    }

    const { error: dbError } = await supabaseAdmin
      .from("insights_media")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("[history-images DELETE] db:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[history-images DELETE] unexpected:", err);
    return NextResponse.json({ error: err?.message ?? "Unexpected server error" }, { status: 500 });
  }
}
