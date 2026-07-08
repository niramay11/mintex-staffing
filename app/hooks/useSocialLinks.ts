"use client";

import { useEffect, useState } from "react";

export type SocialLink = { id: string; label: string; url: string };

// Matches the seed data in supabase/migrations/004_social_links.sql — shown
// until the /api/social-links fetch resolves (or if it ever comes back empty).
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { id: "instagram", label: "Instagram", url: "https://instagram.com" },
  { id: "facebook", label: "Facebook", url: "https://facebook.com" },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/mintex-staffing/posts/?feedView=all" },
  { id: "twitter", label: "Twitter / X", url: "https://twitter.com" },
];

export function useSocialLinks(): SocialLink[] {
  const [links, setLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((data: SocialLink[]) => {
        if (Array.isArray(data) && data.length > 0) setLinks(data);
      })
      .catch(() => {});
  }, []);

  return links;
}
