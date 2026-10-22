import { REPOSITORY_URL, SITE_HOME_URL, SITE_LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

export const SITE_AUTHOR = {
  name: "Alexander Tartmin",
  url: "https://www.linkedin.com/in/alexandertartmin",
} as const;

export const SITE_ENTITY_IDS = {
  organization: `${SITE_URL}/#organization`,
  author: `${SITE_URL}/#author`,
  website: `${SITE_URL}/#website`,
  webApplication: `${SITE_URL}/#web-application`,
} as const;

export const SITE_STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE_ENTITY_IDS.organization,
    name: SITE_NAME,
    url: SITE_HOME_URL,
    logo: SITE_LOGO_URL,
    sameAs: [REPOSITORY_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": SITE_ENTITY_IDS.author,
    name: SITE_AUTHOR.name,
    url: SITE_AUTHOR.url,
    sameAs: [SITE_AUTHOR.url],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ENTITY_IDS.website,
    name: SITE_NAME,
    url: SITE_HOME_URL,
    description: "UDID Tools helps you find your iPhone and iPad UDID online in Safari.",
    inLanguage: "en",
    publisher: { "@id": SITE_ENTITY_IDS.organization },
    mainEntity: { "@id": SITE_ENTITY_IDS.webApplication },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": SITE_ENTITY_IDS.webApplication,
    name: SITE_NAME,
    url: SITE_HOME_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "iOS, iPadOS",
    browserRequirements: "Safari on iOS or iPadOS",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@id": SITE_ENTITY_IDS.organization },
    mainEntityOfPage: { "@id": SITE_ENTITY_IDS.website },
    sameAs: [REPOSITORY_URL],
    creator: { "@id": SITE_ENTITY_IDS.author },
    description:
      "A free open-source utility for retrieving an iPhone or iPad UDID through Safari using an iOS configuration profile flow.",
    featureList: [
      "Retrieve an iPhone or iPad UDID in Safari",
      "No account, Apple ID, payment, desktop computer, or USB cable required",
      "Open-source, privacy-first configuration profile flow",
    ],
  },
] as const;
