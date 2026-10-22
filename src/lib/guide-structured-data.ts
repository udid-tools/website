import type { Guide } from "@/content/guides";
import { SITE_HOME_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { SITE_AUTHOR, SITE_ENTITY_IDS } from "@/lib/site-structured-data";

export function absoluteGuideUrl(slug: string) {
  return `${SITE_URL}/guides/${slug}`;
}

export function buildGuideStructuredData(guide: Guide) {
  const pageUrl = absoluteGuideUrl(guide.slug);
  const modifiedAt = guide.updatedAt ?? guide.publishedAt;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: guide.title,
      description: guide.description,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      isPartOf: { "@id": SITE_ENTITY_IDS.website },
      inLanguage: "en",
      articleSection: guide.eyebrow,
      image: `${SITE_URL}/og-image.png`,
      datePublished: guide.publishedAt,
      dateModified: modifiedAt,
      author: {
        "@type": "Person",
        "@id": SITE_ENTITY_IDS.author,
        name: SITE_AUTHOR.name,
        url: SITE_AUTHOR.url,
      },
      publisher: {
        "@type": "Organization",
        "@id": SITE_ENTITY_IDS.organization,
        name: SITE_NAME,
        url: SITE_HOME_URL,
      },
      citation: (guide.sources ?? []).map((source) => source.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_HOME_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: `${SITE_URL}/guides`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.title,
          item: pageUrl,
        },
      ],
    },
  ] as const;
}
