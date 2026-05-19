import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mintex@admin";

export type StatItem = {
  id: string;
  value: number;
  label: string;
  suffix: string;
};

export type Industry = {
  id: string;
  name: string;
  percent: number;
  color: string;
};

export type MarketPoint = {
  month: string;
  value: number;
};

export type StatisticsData = {
  stats: StatItem[];
  yearsOfExperience: number;
  turnaroundHours: number;
  industries: Industry[];
  marketData: MarketPoint[];
  retentionClientYears: number;
  retentionCandidateYears: number;
};

async function fetchAllStats(): Promise<StatisticsData> {
  const [configRes, statsRes, industriesRes, marketRes] = await Promise.all([
    supabase.from("statistics_config").select("*").eq("id", 1).single(),
    supabase.from("statistics_stats").select("*").order("sort_order"),
    supabase.from("statistics_industries").select("*").order("sort_order"),
    supabase.from("statistics_market_data").select("*").order("sort_order"),
  ]);

  const config = configRes.data;

  return {
    stats: (statsRes.data ?? []).map((s) => ({
      id: s.id,
      value: s.value,
      label: s.label,
      suffix: s.suffix,
    })),
    yearsOfExperience: config?.years_of_experience ?? 25,
    turnaroundHours: config?.turnaround_hours ?? 48,
    industries: (industriesRes.data ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      percent: i.percent,
      color: i.color,
    })),
    marketData: (marketRes.data ?? []).map((m) => ({
      month: m.month,
      value: m.value,
    })),
    retentionClientYears: config?.retention_client_years ?? 2.5,
    retentionCandidateYears: config?.retention_candidate_years ?? 2,
  };
}

export async function GET() {
  try {
    const data = await fetchAllStats();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, stats, yearsOfExperience, turnaroundHours, industries, marketData, retentionClientYears, retentionCandidateYears } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update stat cards
    if (stats) {
      await supabaseAdmin.from("statistics_stats").upsert(
        stats.map((s: StatItem, i: number) => ({ ...s, sort_order: i }))
      );
    }

    // Update config (key numbers + retention)
    const configUpdates: Record<string, number> = {};
    if (yearsOfExperience !== undefined) configUpdates.years_of_experience = yearsOfExperience;
    if (turnaroundHours !== undefined) configUpdates.turnaround_hours = turnaroundHours;
    if (retentionClientYears !== undefined) configUpdates.retention_client_years = retentionClientYears;
    if (retentionCandidateYears !== undefined) configUpdates.retention_candidate_years = retentionCandidateYears;

    if (Object.keys(configUpdates).length > 0) {
      await supabaseAdmin.from("statistics_config").update(configUpdates).eq("id", 1);
    }

    // Update industries — delete all then re-insert to handle add/remove
    if (industries) {
      await supabaseAdmin.from("statistics_industries").delete().neq("id", "");
      if (industries.length > 0) {
        await supabaseAdmin.from("statistics_industries").insert(
          industries.map((ind: Industry, i: number) => ({ ...ind, sort_order: i }))
        );
      }
    }

    // Update market data values by month
    if (marketData) {
      await Promise.all(
        marketData.map((pt: MarketPoint) =>
          supabaseAdmin.from("statistics_market_data").update({ value: pt.value }).eq("month", pt.month)
        )
      );
    }

    const updated = await fetchAllStats();
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update statistics" }, { status: 500 });
  }
}
