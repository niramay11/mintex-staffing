import { createClient } from "@supabase/supabase-js";
import Statistics from "./Statistics";
import type { StatisticsData } from "../api/statistics/route";

async function fetchStats(): Promise<StatisticsData | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [configRes, statsRes, industriesRes, marketRes] = await Promise.all([
      supabase.from("statistics_config").select("*").eq("id", 1).single(),
      supabase.from("statistics_stats").select("*").order("sort_order"),
      supabase.from("statistics_industries").select("*").order("sort_order"),
      supabase.from("statistics_market_data").select("*").order("sort_order"),
    ]);

    if (!configRes.data) return null;

    return {
      stats: (statsRes.data ?? []).map((s) => ({
        id: s.id,
        value: s.value,
        label: s.label,
        suffix: s.suffix,
      })),
      yearsOfExperience: configRes.data.years_of_experience,
      turnaroundHours: configRes.data.turnaround_hours,
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
      marketDataYear: configRes.data.market_data_year ?? new Date().getFullYear(),
      retentionClientYears: configRes.data.retention_client_years,
      retentionCandidateYears: configRes.data.retention_candidate_years,
    };
  } catch {
    return null;
  }
}

export default async function StatisticsWrapper() {
  const data = await fetchStats();
  return <Statistics data={data} />;
}
