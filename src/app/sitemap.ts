import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { SITE_HOME_URL, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/guides", "/privacy-policy", "/terms"];
  return [
    ...staticRoutes.map((path) => ({
      url: path ? `${SITE_URL}${path}` : SITE_HOME_URL,
      changeFrequency: "monthly" as const,
    })),
    ...guides.map((guide) => ({
      url: `${SITE_URL}/guides/${guide.slug}`,
      lastModified: guide.updatedAt ?? guide.publishedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
