import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Supabase SQL to run once:
// CREATE TABLE IF NOT EXISTS history_images (
//   id TEXT PRIMARY KEY,
//   year TEXT NOT NULL UNIQUE,
//   image_src TEXT NOT NULL,
//   created_at TIMESTAMP DEFAULT NOW()
// );

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";
const BUCKET = "insights";
const FOLDER = "history";

export async function GET() {
  try {
    const { data } = await supabase
      .from("history_images")
      .select("*")
      .order("year", { ascending: true });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
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

  const fileName = `${FOLDER}/${year}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);

  // Remove old file for this year if replacing
  const id = `history-${year}`;
  const { data: existing } = await supabaseAdmin
    .from("history_images")
    .select("image_src")
    .eq("id", id)
    .single();

  if (existing?.image_src) {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    const oldPath = existing.image_src.replace(prefix, "");
    if (oldPath !== fileName) {
      await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
    }
  }

  const { error: dbError } = await supabaseAdmin
    .from("history_images")
    .upsert({ id, year, image_src: urlData.publicUrl });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, image_src: urlData.publicUrl });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { year, password } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = `history-${year}`;
  const { data: item } = await supabaseAdmin
    .from("history_images")
    .select("image_src")
    .eq("id", id)
    .single();

  if (item?.image_src) {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    const filePath = item.image_src.replace(prefix, "");
    await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
  }

  await supabaseAdmin.from("history_images").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
