import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { GuidesSection } from "@/components/home/GuidesSection";
import { getGuide, guides } from "@/content/guides";
import { absoluteGuideUrl, buildGuideStructuredData } from "@/lib/guide-structured-data";
import { REPOSITORY_URL, SITE_HOME_URL, SITE_LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { SITE_AUTHOR, SITE_ENTITY_IDS, SITE_STRUCTURED_DATA } from "@/lib/site-structured-data";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("guide SEO content", () => {
  it("uses unique slugs, titles, metadata, and descriptions", () => {
    expectUnique(guides.map((guide) => guide.slug));
    expectUnique(guides.map((guide) => guide.title));
    expectUnique(guides.map((guide) => guide.metaTitle));
    expectUnique(guides.map((guide) => guide.description));

    for (const guide of guides) {
      expect(guide.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
      expect(guide.title.trim()).toBe(guide.title);
      expect(guide.metaTitle.trim()).toBe(guide.metaTitle);
      expect(guide.description.trim()).toBe(guide.description);
      expect(guide.intro.trim()).toBe(guide.intro);
    }
  });

  it("uses valid publication dates and non-regressing update dates", () => {
    for (const guide of guides) {
      expect(guide.publishedAt).toMatch(ISO_DATE);
      expect(Number.isNaN(Date.parse(`${guide.publishedAt}T00:00:00.000Z`))).toBe(false);

      if (guide.updatedAt) {
        expect(guide.updatedAt).toMatch(ISO_DATE);
        expect(Number.isNaN(Date.parse(`${guide.updatedAt}T00:00:00.000Z`))).toBe(false);
        expect(guide.updatedAt >= guide.publishedAt).toBe(true);
      }
    }
  });

  it("keeps related-guide links valid, intentional, and distinct", () => {
    const guidesBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

    for (const guide of guides) {
      expect(guide.relatedGuideSlugs?.length).toBeGreaterThanOrEqual(2);
      expect(guide.relatedGuideSlugs?.length).toBeLessThanOrEqual(3);
      expectUnique(guide.relatedGuideSlugs ?? []);

      for (const relatedSlug of guide.relatedGuideSlugs ?? []) {
        expect(relatedSlug).not.toBe(guide.slug);
        expect(guidesBySlug.has(relatedSlug)).toBe(true);
      }
    }

    const orphanedGuides = guides
      .filter(
        (guide) =>
          !guides.some((candidate) => candidate.relatedGuideSlugs?.includes(guide.slug) ?? false)
      )
      .map((guide) => guide.slug);

    expect(orphanedGuides).toEqual([]);
  });

  it("uses valid HTTPS source links without duplicates", () => {
    for (const guide of guides) {
      const sourceUrls = (guide.sources ?? []).map((source) => source.url);
      expectUnique(sourceUrls);
      expect(sourceUrls.length).toBeGreaterThanOrEqual(2);

      for (const source of guide.sources ?? []) {
        const url = new URL(source.url);
        expect(url.protocol).toBe("https:");
        expect(source.publisher.trim()).toBe(source.publisher);
        expect(source.title.trim()).toBe(source.title);
      }
    }
  });

  it("keeps guide visuals local, descriptive, and privacy-safe", () => {
    const visuals = guides.flatMap((guide) => (guide.visual ? [guide.visual] : []));

    expect(visuals.length).toBeGreaterThan(0);

    for (const visual of visuals) {
      expect(visual.src).toMatch(/^\/[a-z0-9][a-z0-9./-]*\.svg$/u);
      expect(visual.alt.trim()).toBe(visual.alt);
      expect(visual.alt.length).toBeGreaterThan(40);
      expect(visual.caption.trim()).toBe(visual.caption);
      expect(visual.width).toBeGreaterThan(0);
      expect(visual.height).toBeGreaterThan(0);

      const source = readFileSync(join(process.cwd(), "public", visual.src.slice(1)), "utf8");
      expect(source).toContain("<svg");
      expect(source).not.toMatch(/<(?:script|foreignObject)\b|(?:href|src)=["']https?:/iu);
    }
  });

  it("keeps the visible device-attribute disclosure aligned with the profile request", () => {
    const profileServiceSource = readFileSync(
      join(process.cwd(), "src", "lib", "profile-service.ts"),
      "utf8"
    );
    const attributeList = profileServiceSource.match(
      /const ATTRIBUTES = \[([\s\S]*?)\] as const;/u
    )?.[1];

    expect(attributeList).toBeDefined();
    const requestedAttributes = JSON.parse(`[${attributeList}]`) as string[];
    const disclosureGuide = getGuide("get-udid-without-itunes");
    const disclosureSection = disclosureGuide?.sections.find(
      (section) => section.title === "What the profile requests"
    );
    const guideDisclosure = disclosureSection?.body.join(" ").toLowerCase() ?? "";
    const privacyPolicy = readFileSync(
      join(process.cwd(), "src", "app", "privacy-policy", "page.tsx"),
      "utf8"
    ).toLowerCase();
    const visibleLabels: Record<string, { guide: string; privacy: string }> = {
      PRODUCT: { guide: "product identifier", privacy: "product identifier" },
      SERIAL: { guide: "serial number", privacy: "serial number" },
      VERSION: { guide: "os version", privacy: "ios or ipados version" },
      UDID: { guide: "udid", privacy: "udid" },
      IMEI: { guide: "imei", privacy: "imei" },
      MEID: { guide: "meid", privacy: "meid" },
    };

    expect([...requestedAttributes].sort()).toEqual(Object.keys(visibleLabels).sort());
    for (const attribute of requestedAttributes) {
      const labels = visibleLabels[attribute];
      expect(labels).toBeDefined();
      expect(guideDisclosure).toContain(labels?.guide);
      expect(privacyPolicy).toContain(labels?.privacy);
    }
  });
});

describe("sitemap", () => {
  it("contains every canonical public URL exactly once", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url.toString());
    const expectedUrls = [
      SITE_HOME_URL,
      `${SITE_URL}/guides`,
      `${SITE_URL}/privacy-policy`,
      `${SITE_URL}/terms`,
      ...guides.map((guide) => `${SITE_URL}/guides/${guide.slug}`),
    ];

    expect(urls).toEqual(expectedUrls);
    expectUnique(urls);

    for (const value of urls) {
      const url = new URL(value);
      expect(url.origin).toBe(SITE_URL);
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
    }
  });

  it("publishes guide modification dates from the content registry", () => {
    const entries = sitemap();
    const entriesByUrl = new Map(entries.map((entry) => [entry.url.toString(), entry]));

    for (const guide of guides) {
      const entry = entriesByUrl.get(`${SITE_URL}/guides/${guide.slug}`);
      expect(entry?.lastModified).toBe(guide.updatedAt ?? guide.publishedAt);
    }
  });
});

describe("crawler discovery", () => {
  it("keeps both no-impression priority guides linked from high-visibility pages", () => {
    const homeGuidesHtml = renderToStaticMarkup(createElement(GuidesSection));
    const whatIsUdid = getGuide("what-is-udid");

    expect(homeGuidesHtml).toContain('href="/guides/how-to-find-iphone-udid"');
    expect(whatIsUdid?.relatedGuideSlugs).toContain("udid-vs-serial-number-vs-imei");
  });
});

describe("site structured data", () => {
  it("links the author, organization, website, and free web application entities", () => {
    const entities = new Map(SITE_STRUCTURED_DATA.map((entry) => [entry["@type"], entry]));

    expect([...entities.keys()]).toEqual(["Organization", "Person", "WebSite", "WebApplication"]);
    expect(entities.get("Organization")).toMatchObject({
      "@context": "https://schema.org",
      "@id": SITE_ENTITY_IDS.organization,
      name: SITE_NAME,
      url: SITE_HOME_URL,
      logo: SITE_LOGO_URL,
      sameAs: [REPOSITORY_URL],
    });
    expect(entities.get("Person")).toMatchObject({
      "@id": SITE_ENTITY_IDS.author,
      name: SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
      sameAs: [SITE_AUTHOR.url],
    });
    expect(entities.get("WebSite")).toMatchObject({
      "@id": SITE_ENTITY_IDS.website,
      url: SITE_HOME_URL,
      publisher: { "@id": SITE_ENTITY_IDS.organization },
      mainEntity: { "@id": SITE_ENTITY_IDS.webApplication },
    });
    expect(entities.get("WebApplication")).toMatchObject({
      "@id": SITE_ENTITY_IDS.webApplication,
      url: SITE_HOME_URL,
      browserRequirements: "Safari on iOS or iPadOS",
      isAccessibleForFree: true,
      provider: { "@id": SITE_ENTITY_IDS.organization },
      mainEntityOfPage: { "@id": SITE_ENTITY_IDS.website },
      sameAs: [REPOSITORY_URL],
      creator: { "@id": SITE_ENTITY_IDS.author },
    });
  });
});

describe("guide structured data", () => {
  it("connects every article to the site entities and its visible sources", () => {
    for (const guide of guides) {
      const [article, breadcrumb] = buildGuideStructuredData(guide);
      const pageUrl = absoluteGuideUrl(guide.slug);

      expect(article).toMatchObject({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: guide.title,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        isPartOf: { "@id": SITE_ENTITY_IDS.website },
        inLanguage: "en",
        author: { "@id": SITE_ENTITY_IDS.author },
        publisher: { "@id": SITE_ENTITY_IDS.organization },
        citation: guide.sources?.map((source) => source.url),
      });
      expect(article.dateModified).toBe(guide.updatedAt ?? guide.publishedAt);
      expect(breadcrumb).toMatchObject({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
      });
      expect(breadcrumb.itemListElement.at(-1)).toMatchObject({
        position: 3,
        name: guide.title,
        item: pageUrl,
      });
    }
  });
});

describe("repository discovery", () => {
  it("links the canonical site, privacy policy, and every guide from the README", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");

    expect(readme).toContain(`(${SITE_HOME_URL})`);
    expect(readme).toContain(`(${SITE_URL}/privacy-policy)`);

    for (const guide of guides) {
      expect(readme).toContain(`(${SITE_URL}/guides/${guide.slug})`);
    }
  });
});
