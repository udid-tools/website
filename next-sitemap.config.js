/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.udid.tools",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // не індексуємо success (із query теж)
  exclude: ["/success", "/success*"],
  additionalPaths: async (config) => {
    const paths = [
      "/",
      "/privacy-policy",
      "/terms",
      "/guides",
      "/guides/get-udid-without-itunes",
      "/guides/how-to-find-iphone-udid",
      "/guides/is-it-safe-to-share-udid",
      "/guides/udid-for-app-testing",
      "/guides/udid-vs-serial-number-vs-imei",
      "/guides/what-is-udid",
    ];

    return Promise.all(paths.map((path) => config.transform(config, path)));
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
    ],
    transformRobotsTxt: async (_config, robotsTxt) =>
      robotsTxt.replace(/\n# Host\nHost: https:\/\/www\.udid\.tools\n/g, "\n"),
    // sitemap автоматично додасться
  },
};
