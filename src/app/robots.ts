import type { MetadataRoute } from "next";
import { siteUrl } from '@/lib/siteMetadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Crawlers must be able to read page-level noindex. Authentication protects private data.
      disallow: '/api/',
    },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
