import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";
const BUCKET = "insights";

export async function GET() {
  try {
    const { data } = await supabase
      .from("insights_media")
      .select("*")
      .order("created_at", { ascending: false });

    const images = (data ?? []).filter((item) => item.type === "image");
    const reels = (data ?? []).filter((item) => item.type === "reel");

    return NextResponse.json({ images, reels });
  } catch {
    return NextResponse.json({ images: [], reels: [] });
  }
}

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

  // Upload file to Supabase Storage
  const folder = type === "image" ? "images" : "reels";
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, bytes, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);

  // Save record to DB
  const id = `${type === "image" ? "img" : "reel"}-${Date.now()}`;
  const { data: item, error: dbError } = await supabaseAdmin
    .from("insights_media")
    .insert({ id, type, src: urlData.publicUrl, alt, url })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, item });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, password } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle login verification ping from admin panel
  if (id === "__verify__") {
    return NextResponse.json({ success: true });
  }

  // Find the record
  const { data: item, error: findError } = await supabaseAdmin
    .from("insights_media")
    .select("src")
    .eq("id", id)
    .single();

  if (findError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Extract storage path from the public URL
  const storagePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  const filePath = item.src.replace(storagePrefix, "");

  // Delete from storage
  await supabaseAdmin.storage.from(BUCKET).remove([filePath]);

  // Delete from DB
  await supabaseAdmin.from("insights_media").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
