import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/guides", "/privacy-policy", "/terms"];
  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "monthly" as const,
    })),
    ...guides.map((guide) => ({
      url: `${SITE_URL}/guides/${guide.slug}`,
      changeFrequency: "monthly" as const,
    })),
  ];
}
