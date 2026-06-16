import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the authenticated app out of search results.
      disallow: ["/admin", "/dashboard", "/api", "/welcome", "/reset-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
