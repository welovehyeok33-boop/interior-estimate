import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/partner", "/login", "/signup", "/consult/step", "/estimate/detail/step"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
